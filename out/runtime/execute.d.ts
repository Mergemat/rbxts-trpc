import type { ContextFactoryOptions, ErrorShape, EventMiddleware, InitTRPCConfig, ProcedureMiddleware, ProcedureResolver, ProcedureIntent, Validator } from "../core/types";
export declare function formatError(config: InitTRPCConfig<unknown>, caught: unknown): ErrorShape;
export declare function createContext<TContext>(config: InitTRPCConfig<TContext>, options: ContextFactoryOptions): Promise<TContext>;
export declare function runProcedure<TContext, TInput, TOutput>(options: {
    config: InitTRPCConfig<TContext>;
    path: string;
    intent: ProcedureIntent;
    input: unknown;
    player?: Player;
    inputValidator?: Validator<TInput>;
    outputValidator?: Validator<TOutput>;
    middlewares: ReadonlyArray<ProcedureMiddleware<TContext, TInput, TOutput>>;
    resolve: ProcedureResolver<TContext, TInput, TOutput>;
}): Promise<TOutput>;
export declare function runServerEvent<TContext, TInput>(options: {
    config: InitTRPCConfig<TContext>;
    path: string;
    input: unknown;
    player?: Player;
    inputValidator?: Validator<TInput>;
    middlewares: ReadonlyArray<EventMiddleware<TContext, TInput>>;
    handle: (opts: {
        ctx: TContext;
        input: TInput;
        path: string;
        player?: Player;
    }) => Promise<void>;
}): Promise<void>;
export declare function runClientEvent<TContext, TInput>(options: {
    config: InitTRPCConfig<TContext>;
    path: string;
    input: unknown;
    inputValidator?: Validator<TInput>;
    middlewares: ReadonlyArray<EventMiddleware<TContext, TInput>>;
    listeners: ReadonlyArray<(input: TInput) => void>;
}): Promise<void>;
