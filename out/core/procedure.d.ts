import type { Procedure, ProcedureIntent, ProcedureMiddleware, ProcedureResolver, Validator } from "./types";
export declare class ProcedureBuilder<TContext, TInput, TOutput, TIntent extends ProcedureIntent = "mutation"> {
    private readonly inputValidator?;
    private readonly outputValidator?;
    private readonly middlewares;
    private readonly currentIntent;
    constructor(options?: {
        inputValidator?: Validator<TInput>;
        outputValidator?: Validator<TOutput>;
        middlewares?: ReadonlyArray<ProcedureMiddleware<TContext, TInput, TOutput>>;
        intent?: TIntent;
    });
    input<TNextInput>(validator: Validator<TNextInput>): ProcedureBuilder<TContext, TNextInput, TOutput, TIntent>;
    output<TNextOutput>(validator: Validator<TNextOutput>): ProcedureBuilder<TContext, TInput, TNextOutput, TIntent>;
    use(middleware: ProcedureMiddleware<TContext, TInput, TOutput>): ProcedureBuilder<TContext, TInput, TOutput, TIntent>;
    intent<TNextIntent extends ProcedureIntent>(intent: TNextIntent): ProcedureBuilder<TContext, TInput, TOutput, TNextIntent>;
    resolve<TResolvedOutput extends TOutput>(resolve: ProcedureResolver<TContext, TInput, TResolvedOutput>): Procedure<TContext, TInput, TResolvedOutput, TIntent>;
}
