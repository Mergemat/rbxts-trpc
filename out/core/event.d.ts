import type { ClientEvent, EventHandler, EventMiddleware, ServerEvent, Validator } from "./types";
export declare class ServerEventBuilder<TContext, TInput> {
    private readonly currentInputValidator?;
    private readonly currentMiddlewares;
    constructor(options?: {
        inputValidator?: Validator<TInput>;
        middlewares?: ReadonlyArray<EventMiddleware<TContext, TInput>>;
    });
    input<TNextInput>(validator: Validator<TNextInput>): ServerEventBuilder<TContext, TNextInput>;
    use(middleware: EventMiddleware<TContext, TInput>): ServerEventBuilder<TContext, TInput>;
    handle(handler: EventHandler<TContext, TInput>): ServerEvent<TContext, TInput>;
}
export declare class ClientEventBuilder<TContext, TInput> {
    private readonly currentInputValidator?;
    private readonly currentMiddlewares;
    constructor(options?: {
        inputValidator?: Validator<TInput>;
        middlewares?: ReadonlyArray<EventMiddleware<TContext, TInput>>;
    });
    input<TNextInput>(validator: Validator<TNextInput>): ClientEventBuilder<TContext, TNextInput>;
    use(middleware: EventMiddleware<TContext, TInput>): ClientEventBuilder<TContext, TInput>;
    create(): ClientEvent<TContext, TInput>;
}
