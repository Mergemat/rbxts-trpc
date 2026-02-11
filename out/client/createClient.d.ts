import type { TRPCFactory } from "../core/initTRPC";
import type { ClientEvent, ClientEventProxy, Procedure, ProcedureCallProxy, Router, ServerEvent, ServerEventProxy } from "../core/types";
type ClientShapeFromRouter<TRouter extends Router<any, any>> = ClientShapeFromNodes<TRouter["_def"]["shape"]>;
type ClientShapeFromNodes<TShape> = {
    [K in keyof TShape]: TShape[K] extends Router<any, any> ? ClientShapeFromNodes<TShape[K]["_def"]["shape"]> : TShape[K] extends Procedure<any, infer TInput, infer TOutput, infer TIntent> ? ProcedureCallProxy<TInput, TOutput, TIntent> : TShape[K] extends ServerEvent<any, infer TInput> ? ServerEventProxy<TInput> : TShape[K] extends ClientEvent<any, infer TInput> ? ClientEventProxy<TInput> : never;
};
export declare function createClient<TContext, TRouter extends Router<TContext, any>>(options: {
    t: TRPCFactory<TContext>;
    router: TRouter;
}): ClientShapeFromRouter<TRouter>;
export {};
