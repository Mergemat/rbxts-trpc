import { ClientEventBuilder, ServerEventBuilder } from "./event";
import { ProcedureBuilder } from "./procedure";
import { createRouter } from "./router";
import type { InitTRPCConfig, RouterShape } from "./types";
export interface TRPCFactory<TContext> {
    readonly _config: InitTRPCConfig<TContext>;
    readonly procedure: ProcedureBuilder<TContext, undefined, unknown, "mutation">;
    readonly event: {
        readonly server: ServerEventBuilder<TContext, undefined>;
        readonly client: ClientEventBuilder<TContext, undefined>;
    };
    router<TShape extends RouterShape<TContext>>(shape: TShape): ReturnType<typeof createRouter<TContext, TShape>>;
}
declare class FactoryImpl<TContext> implements TRPCFactory<TContext> {
    readonly _config: InitTRPCConfig<TContext>;
    readonly procedure: ProcedureBuilder<TContext, undefined, unknown, "mutation">;
    readonly event: {
        server: ServerEventBuilder<TContext, undefined>;
        client: ClientEventBuilder<TContext, undefined>;
    };
    constructor(config: InitTRPCConfig<TContext>);
    router<TShape extends RouterShape<TContext>>(shape: TShape): import("./types").Router<TContext, TShape>;
}
export declare function initTRPC(): {
    context<TContext>(): {
        create(config?: InitTRPCConfig<TContext>): FactoryImpl<TContext>;
    };
};
export {};
