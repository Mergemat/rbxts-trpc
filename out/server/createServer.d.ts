import type { TRPCFactory } from "../core/initTRPC";
import type { Router, RouterShape } from "../core/types";
export declare function createServer<TContext, TRouter extends Router<TContext, RouterShape<TContext>>>(options: {
    t: TRPCFactory<TContext>;
    router: TRouter;
}): {
    remotes: never;
    events: import("../core/types").ServerEventTreeFromShape<TRouter["_def"]["shape"]>;
    destroy(): void;
};
