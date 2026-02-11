import type { ClientEvent, Procedure, Router, RouterShape, ServerEvent } from "./core/types";

type InputsFromShape<TShape> = {
	[K in keyof TShape]: TShape[K] extends Router<any, infer TNested>
		? InputsFromShape<TNested>
		: TShape[K] extends Procedure<any, infer TInput, any, any>
			? TInput
			: TShape[K] extends ServerEvent<any, infer TEventInput>
				? TEventInput
				: TShape[K] extends ClientEvent<any, infer TClientEventInput>
					? TClientEventInput
					: never;
};

type OutputsFromShape<TShape> = {
	[K in keyof TShape]: TShape[K] extends Router<any, infer TNested>
		? OutputsFromShape<TNested>
		: TShape[K] extends Procedure<any, any, infer TOutput, any>
			? TOutput
			: never;
};

type EventPayloadsFromShape<TShape> = {
	[K in keyof TShape]: TShape[K] extends Router<any, infer TNested>
		? EventPayloadsFromShape<TNested>
		: TShape[K] extends ServerEvent<any, infer TServerInput>
			? { direction: "server"; input: TServerInput }
			: TShape[K] extends ClientEvent<any, infer TClientInput>
				? { direction: "client"; input: TClientInput }
				: never;
};

export type inferRouterInputs<TRouter extends Router<any, RouterShape<any>>> = InputsFromShape<
	TRouter["_def"]["shape"]
>;

export type inferRouterOutputs<TRouter extends Router<any, RouterShape<any>>> = OutputsFromShape<
	TRouter["_def"]["shape"]
>;

export type inferEventPayloads<TRouter extends Router<any, RouterShape<any>>> = EventPayloadsFromShape<
	TRouter["_def"]["shape"]
>;

export type inferContext<TRouter extends Router<any, RouterShape<any>>> =
	TRouter extends Router<infer TContext, RouterShape<any>> ? TContext : never;

export type inferProcedureInput<TProcedure extends Procedure<any, any, any, any>> =
	TProcedure extends Procedure<any, infer TInput, any, any> ? TInput : never;

export type inferProcedureOutput<TProcedure extends Procedure<any, any, any, any>> =
	TProcedure extends Procedure<any, any, infer TOutput, any> ? TOutput : never;
