import { ClientEventBuilder, ServerEventBuilder } from "./event";
import { ProcedureBuilder } from "./procedure";
import type { InitTRPCConfig, Router, RouterShape } from "./types";
export interface TRPCFactory<TContext> {
    readonly _config: InitTRPCConfig<TContext>;
    readonly procedure: ProcedureBuilder<TContext, undefined, unknown, "mutation">;
    readonly event: {
        readonly server: ServerEventBuilder<TContext, undefined>;
        readonly client: ClientEventBuilder<TContext, undefined>;
    };
    router<TShape extends RouterShape<TContext>>(shape: TShape): Router<TContext, TShape>;
}
declare class FactoryImpl<TContext> implements TRPCFactory<TContext> {
    readonly _config: InitTRPCConfig<TContext>;
    readonly procedure: ProcedureBuilder<TContext, undefined, unknown, "mutation">;
    readonly event: {
        server: ServerEventBuilder<TContext, undefined>;
        client: ClientEventBuilder<TContext, undefined>;
    };
    constructor(config: InitTRPCConfig<TContext>);
    router<TShape extends RouterShape<TContext>>(shape: TShape): Router<TContext, TShape>;
}
export declare function initTRPC(): {
    context<TContext>(): {
        create(config?: InitTRPCConfig<TContext>): FactoryImpl<TContext>;
    };
};
export {};
