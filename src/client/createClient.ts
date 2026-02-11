import { createRemotes } from "@rbxts/remo";
import type { TRPCFactory } from "../core/initTRPC";
import { TRPCClientError, toErrorShape } from "../core/errors";
import { formatError, runClientEvent } from "../runtime/execute";
import { buildRemoSchema, joinPath } from "../runtime/schema";
import type {
	ClientEvent,
	ClientEventProxy,
	Procedure,
	ProcedureCallProxy,
	ProcedureIntent,
	Router,
	RouterShape,
	RpcResult,
	ServerEvent,
	ServerEventProxy,
} from "../core/types";

type ClientNode<TContext> =
	| Procedure<TContext, unknown, unknown, ProcedureIntent>
	| ServerEvent<TContext, unknown>
	| ClientEvent<TContext, unknown>
	| Router<TContext, RouterShape<TContext>>;

type ClientShapeFromRouter<TRouter extends Router<any, any>> = ClientShapeFromNodes<TRouter["_def"]["shape"]>;

type ClientShapeFromNodes<TShape> = {
	[K in keyof TShape]: TShape[K] extends Router<any, any>
		? ClientShapeFromNodes<TShape[K]["_def"]["shape"]>
		: TShape[K] extends Procedure<any, infer TInput, infer TOutput, infer TIntent>
			? ProcedureCallProxy<TInput, TOutput, TIntent>
			: TShape[K] extends ServerEvent<any, infer TInput>
				? ServerEventProxy<TInput>
				: TShape[K] extends ClientEvent<any, infer TInput>
					? ClientEventProxy<TInput>
					: never;
};

function isRouterNode<TContext>(node: ClientNode<TContext>): node is Router<TContext, RouterShape<TContext>> {
	return node._def.kind === "router";
}

function isProcedureNode<TContext>(
	node: ClientNode<TContext>,
): node is Procedure<TContext, unknown, unknown, ProcedureIntent> {
	return node._def.kind === "procedure";
}

function isServerEventNode<TContext>(node: ClientNode<TContext>): node is ServerEvent<TContext, unknown> {
	return node._def.kind === "event" && node._def.direction === "server";
}

function isClientEventNode<TContext>(node: ClientNode<TContext>): node is ClientEvent<TContext, unknown> {
	return node._def.kind === "event" && node._def.direction === "client";
}

export function createClient<TContext, TRouter extends Router<TContext, any>>(options: {
	t: TRPCFactory<TContext>;
	router: TRouter;
}): ClientShapeFromRouter<TRouter> {
	const schema = buildRemoSchema(options.router);
	const remotes = createRemotes(schema as never);

	const listenersByPath = {} as Record<string, Array<(input: unknown) => void>>;

	const addListener = (path: string, listener: (input: unknown) => void) => {
		const listeners = listenersByPath[path] ?? [];
		listeners.push(listener);
		listenersByPath[path] = listeners;

		return () => {
			const current = listenersByPath[path];
			if (!current) {
				return;
			}

			const index = current.indexOf(listener);
			if (index >= 0) {
				current.remove(index);
			}
		};
	};

	const walk = (
		shape: RouterShape<TContext>,
		remoteShape: Record<string, unknown>,
		target: Record<string, unknown>,
		parent?: string,
	) => {
		for (const [key, rawNode] of pairs(shape)) {
			const keyName = key as string;
			const node = rawNode as ClientNode<TContext>;
			const path = joinPath(parent, keyName);
			const remoteNode = remoteShape[keyName] as Record<string, unknown>;

			if (isRouterNode(node)) {
				const nested = {} as Record<string, unknown>;
				target[keyName] = nested;
				walk(node._def.shape, remoteNode, nested, path);
				continue;
			}

			if (isProcedureNode(node)) {
				target[keyName] = {
					__kind: "procedure",
					__path: path,
					__intent: node._def.intent,
					call: async (input: unknown) => {
						const request = (remoteNode as { request: (payload: unknown) => Promise<RpcResult<unknown>> })
							.request;

						let result: RpcResult<unknown>;
						try {
							result = await request(input);
						} catch (caught) {
							const shape = formatError(options.t._config as never, caught);
							throw new TRPCClientError(shape);
						}

						if (!result.ok) {
							throw new TRPCClientError(result.error);
						}

						return result.data;
					},
				};
				continue;
			}

			if (isServerEventNode(node)) {
				target[keyName] = {
					__kind: "serverEvent",
					__path: path,
					emit: (input: unknown) => {
						(remoteNode as { fire: (payload: unknown) => void }).fire(input);
					},
				};
				continue;
			}

			if (isClientEventNode(node)) {
				(remoteNode as { connect: (callback: (payload: unknown) => void) => () => void }).connect((input) => {
					task.spawn(async () => {
						const listeners = listenersByPath[path] ?? [];
						try {
							await runClientEvent({
								config: options.t._config,
								path,
								input,
								inputValidator: node._def.inputValidator,
								middlewares: node._def.middlewares,
								listeners,
							});
						} catch (caught) {
							warn(`[rbxts-trpc] client event error on '${path}':`, toErrorShape(caught));
						}
					});
				});

				target[keyName] = {
					__kind: "clientEvent",
					__path: path,
					on: (listener: (input: unknown) => void) => addListener(path, listener),
				};
			}
		}
	};

	const client = {} as Record<string, unknown>;
	walk(options.router._def.shape, remotes as Record<string, unknown>, client);

	return client as ClientShapeFromRouter<TRouter>;
}
