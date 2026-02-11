import type { TRPCFactory } from "../core/initTRPC";
import type { Router } from "../core/types";
export declare function createServer<TContext, TRouter extends Router<TContext, any>>(options: {
    t: TRPCFactory<TContext>;
    router: TRouter;
}): {
    remotes: never;
    events: import("../core/types").ServerEventTreeFromShape<TRouter["_def"]["shape"]>;
    destroy(): void;
};
