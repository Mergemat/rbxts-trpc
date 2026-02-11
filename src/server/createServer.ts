import { createRemotes } from "@rbxts/remo";
import type { TRPCFactory } from "../core/initTRPC";
import { formatError, runProcedure, runServerEvent } from "../runtime/execute";
import { buildRemoSchema, joinPath } from "../runtime/schema";
import type {
	ClientEvent,
	Procedure,
	Router,
	RouterShape,
	RpcFailure,
	RpcResult,
	RpcSuccess,
	ServerEvent,
	ServerEventTree,
} from "../core/types";

function makeSuccess<T>(data: T): RpcSuccess<T> {
	return { ok: true, data };
}

function makeFailure(shape: RpcFailure["error"]): RpcFailure {
	return { ok: false, error: shape };
}

function isRouter<TContext>(value: unknown): value is Router<TContext, RouterShape<TContext>> {
	return (
		typeIs(value, "table") &&
		typeIs((value as Router<TContext>)._def, "table") &&
		(value as Router<TContext>)._def.kind === "router"
	);
}

function isProcedure<TContext>(value: unknown): value is Procedure<TContext, unknown, unknown> {
	return (
		typeIs(value, "table") &&
		typeIs((value as Procedure<TContext, unknown, unknown>)._def, "table") &&
		(value as Procedure<TContext, unknown, unknown>)._def.kind === "procedure"
	);
}

function isServerEvent<TContext>(value: unknown): value is ServerEvent<TContext, unknown> {
	return (
		typeIs(value, "table") &&
		typeIs((value as ServerEvent<TContext, unknown>)._def, "table") &&
		(value as ServerEvent<TContext, unknown>)._def.kind === "event" &&
		(value as ServerEvent<TContext, unknown>)._def.direction === "server"
	);
}

function isClientEvent<TContext>(value: unknown): value is ClientEvent<TContext, unknown> {
	return (
		typeIs(value, "table") &&
		typeIs((value as ClientEvent<TContext, unknown>)._def, "table") &&
		(value as ClientEvent<TContext, unknown>)._def.kind === "event" &&
		(value as ClientEvent<TContext, unknown>)._def.direction === "client"
	);
}

export function createServer<TContext, TRouter extends Router<TContext, any>>(options: {
	t: TRPCFactory<TContext>;
	router: TRouter;
}) {
	const schema = buildRemoSchema(options.router);
	const remotes = createRemotes(schema as never);

	const eventEmitters = {} as ServerEventTree<TRouter>;

	const walk = (
		shape: RouterShape<TContext>,
		remoteShape: Record<string, unknown>,
		eventsTarget: Record<string, unknown>,
		parent?: string,
	) => {
		for (const [key, node] of pairs(shape)) {
			const keyName = key as string;
			const path = joinPath(parent, keyName);
			const remoteNode = remoteShape[keyName] as Record<string, unknown>;

			if (isRouter(node)) {
				const nestedTarget = {} as Record<string, unknown>;
				eventsTarget[keyName] = nestedTarget;
				walk(node._def.shape as RouterShape<TContext>, remoteNode, nestedTarget, path);
				continue;
			}

			if (isProcedure(node)) {
				(
					remoteNode as {
						onRequest: (handler: (player: Player, input: unknown) => Promise<RpcResult<unknown>>) => void;
					}
				).onRequest(async (player, input) => {
					try {
						const result = await runProcedure({
							config: options.t._config,
							path,
							intent: node._def.intent,
							input,
							player,
							inputValidator: node._def.inputValidator,
							outputValidator: node._def.outputValidator,
							middlewares: node._def.middlewares,
							resolve: node._def.resolve,
						});

						return makeSuccess(result);
					} catch (caught) {
						return makeFailure(formatError(options.t._config as never, caught));
					}
				});
				continue;
			}

			if (isServerEvent(node)) {
				(remoteNode as { connect: (listener: (player: Player, input: unknown) => void) => () => void }).connect(
					(player, input) => {
						task.spawn(async () => {
							try {
								await runServerEvent({
									config: options.t._config,
									path,
									input,
									player,
									inputValidator: node._def.inputValidator,
									middlewares: node._def.middlewares,
									handle: async ({ ctx, input: payload, path: eventPath, player: eventPlayer }) =>
										node._def.handle({
											ctx,
											input: payload,
											path: eventPath,
											player: eventPlayer,
											direction: "server",
										}),
								});
							} catch (caught) {
								warn(
									`[rbxts-trpc] server event error on '${path}':`,
									formatError(options.t._config as never, caught),
								);
							}
						});
					},
				);
				continue;
			}

			if (isClientEvent(node)) {
				eventsTarget[keyName] = {
					__kind: "clientEvent",
					__path: path,
					emit: (player: Player, input: unknown) =>
						(remoteNode as { fire: (player: Player, payload: unknown) => void }).fire(player, input),
					emitAll: (input: unknown) => (remoteNode as { fireAll: (payload: unknown) => void }).fireAll(input),
					emitAllExcept: (player: Player, input: unknown) =>
						(remoteNode as { fireAllExcept: (player: Player, payload: unknown) => void }).fireAllExcept(
							player,
							input,
						),
					emitPlayers: (players: readonly Player[], input: unknown) =>
						(
							remoteNode as { firePlayers: (players: readonly Player[], payload: unknown) => void }
						).firePlayers(players, input),
				};
			}
		}
	};

	walk(
		options.router._def.shape,
		remotes as Record<string, unknown>,
		eventEmitters as unknown as Record<string, unknown>,
	);

	return {
		remotes,
		events: eventEmitters,
		destroy() {
			(remotes as { destroy?: () => void }).destroy?.();
		},
	};
}
