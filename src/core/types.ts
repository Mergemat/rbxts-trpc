export type MaybePromise<T> = T | Promise<T>;

export type Validator<T> = (value: unknown) => value is T;

export type ProcedureIntent = "query" | "mutation";

export type TRPCErrorCode =
	| "BAD_REQUEST"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "NOT_FOUND"
	| "CONFLICT"
	| "INTERNAL_SERVER_ERROR";

export interface ErrorShape {
	code: TRPCErrorCode;
	message: string;
	data?: unknown;
}

export interface ContextFactoryOptions {
	side: "server" | "client";
	path: string;
	kind: "procedure" | "event";
	direction: "server" | "client";
	input: unknown;
	player?: Player;
}

export interface InitTRPCConfig<TContext> {
	createContext?: (options: ContextFactoryOptions) => MaybePromise<TContext>;
	errorFormatter?: (shape: ErrorShape) => ErrorShape;
}

export interface ProcedureResolverOptions<TContext, TInput> {
	ctx: TContext;
	input: TInput;
	path: string;
	player?: Player;
	intent: ProcedureIntent;
}

export type ProcedureResolver<TContext, TInput, TOutput> = (
	options: ProcedureResolverOptions<TContext, TInput>,
) => MaybePromise<TOutput>;

export interface ProcedureMiddlewareOptions<TContext, TInput, TOutput> {
	ctx: TContext;
	input: TInput;
	path: string;
	player?: Player;
	intent: ProcedureIntent;
	next: (next?: { ctx?: TContext; input?: TInput }) => Promise<TOutput>;
}

export type ProcedureMiddleware<TContext, TInput, TOutput> = (
	options: ProcedureMiddlewareOptions<TContext, TInput, TOutput>,
) => MaybePromise<TOutput>;

export interface EventHandlerOptions<TContext, TInput> {
	ctx: TContext;
	input: TInput;
	path: string;
	player?: Player;
	direction: "server" | "client";
}

export type EventHandler<TContext, TInput> = (options: EventHandlerOptions<TContext, TInput>) => MaybePromise<void>;

export interface EventMiddlewareOptions<TContext, TInput> {
	ctx: TContext;
	input: TInput;
	path: string;
	player?: Player;
	direction: "server" | "client";
	next: (next?: { ctx?: TContext; input?: TInput }) => Promise<void>;
}

export type EventMiddleware<TContext, TInput> = (
	options: EventMiddlewareOptions<TContext, TInput>,
) => MaybePromise<void>;

export interface ProcedureDef<TContext, TInput, TOutput, TIntent extends ProcedureIntent = ProcedureIntent> {
	kind: "procedure";
	intent: TIntent;
	inputValidator?: Validator<TInput>;
	outputValidator?: Validator<TOutput>;
	middlewares: ReadonlyArray<ProcedureMiddleware<TContext, TInput, TOutput>>;
	resolve: ProcedureResolver<TContext, TInput, TOutput>;
}

export interface ServerEventDef<TContext, TInput> {
	kind: "event";
	direction: "server";
	inputValidator?: Validator<TInput>;
	middlewares: ReadonlyArray<EventMiddleware<TContext, TInput>>;
	handle: EventHandler<TContext, TInput>;
}

export interface ClientEventDef<TContext, TInput> {
	kind: "event";
	direction: "client";
	inputValidator?: Validator<TInput>;
	middlewares: ReadonlyArray<EventMiddleware<TContext, TInput>>;
}

export type AnyEventDef<TContext> = ServerEventDef<TContext, any> | ClientEventDef<TContext, any>;

export type AnyProcedureDef<TContext> = ProcedureDef<TContext, any, any, ProcedureIntent>;

export type AnyNodeDef<TContext> = AnyProcedureDef<TContext> | AnyEventDef<TContext> | RouterDef<TContext>;

export interface RouterShape<TContext> {
	[key: string]: AnyNode<TContext>;
}

export interface RouterDef<TContext, TShape extends RouterShape<TContext> = RouterShape<TContext>> {
	kind: "router";
	shape: TShape;
}

export interface Procedure<TContext, TInput, TOutput, TIntent extends ProcedureIntent = ProcedureIntent> {
	readonly _def: ProcedureDef<TContext, TInput, TOutput, TIntent>;
}

export interface ServerEvent<TContext, TInput> {
	readonly _def: ServerEventDef<TContext, TInput>;
}

export interface ClientEvent<TContext, TInput> {
	readonly _def: ClientEventDef<TContext, TInput>;
}

export interface Router<TContext, TShape extends RouterShape<TContext> = RouterShape<TContext>> {
	readonly _def: RouterDef<TContext, TShape>;
}

export type AnyNode<TContext> =
	| Procedure<TContext, any, any, ProcedureIntent>
	| ServerEvent<TContext, any>
	| ClientEvent<TContext, any>
	| Router<TContext, RouterShape<TContext>>;

export interface RpcSuccess<TData> {
	ok: true;
	data: TData;
}

export interface RpcFailure {
	ok: false;
	error: ErrorShape;
}

export type RpcResult<TData> = RpcSuccess<TData> | RpcFailure;

interface ProcedureCallProxyBase<TIntent extends ProcedureIntent> {
	__kind: "procedure";
	__path: string;
	__intent: TIntent;
}

export type ProcedureCallProxy<TInput, TOutput, TIntent extends ProcedureIntent> = TIntent extends "query"
	? ProcedureCallProxyBase<TIntent> & {
			query: (input: TInput) => Promise<TOutput>;
		}
	: ProcedureCallProxyBase<TIntent> & {
			mutate: (input: TInput) => Promise<TOutput>;
		};

export interface ServerEventProxy<TInput> {
	__kind: "serverEvent";
	__path: string;
	emit: (input: TInput) => void;
}

export interface ClientEventProxy<TInput> {
	__kind: "clientEvent";
	__path: string;
	on: (listener: (input: TInput) => void) => () => void;
}

export interface ServerClientEventEmitter<TInput> {
	__kind: "clientEvent";
	__path: string;
	emit: (player: Player, input: TInput) => void;
	emitAll: (input: TInput) => void;
	emitAllExcept: (player: Player, input: TInput) => void;
	emitPlayers: (players: readonly Player[], input: TInput) => void;
}

export type ServerEventTree<TRouter extends Router<unknown>> = ServerEventTreeFromShape<TRouter["_def"]["shape"]>;

export type ServerEventTreeFromShape<TShape> = {
	[K in keyof TShape as TShape[K] extends ClientEvent<any, any> | Router<any, any>
		? K
		: never]: TShape[K] extends ClientEvent<any, infer TInput>
		? ServerClientEventEmitter<TInput>
		: TShape[K] extends Router<any, infer TNested>
			? ServerEventTreeFromShape<TNested>
			: never;
};
