export interface TodoContext {
    player?: Player;
}
export declare const trpc: {
    readonly _config: import("../../../index").InitTRPCConfig<TodoContext>;
    readonly procedure: import("../../../core/procedure").ProcedureBuilder<TodoContext, undefined, unknown, "mutation">;
    readonly event: {
        server: import("../../../core/event").ServerEventBuilder<TodoContext, undefined>;
        client: import("../../../core/event").ClientEventBuilder<TodoContext, undefined>;
    };
    router<TShape extends import("../../../core/types").RouterShape<TodoContext>>(shape: TShape): import("../../../index").Router<TodoContext, TShape>;
};
