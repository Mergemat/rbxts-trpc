import type { Router, RouterShape } from "./types";
export declare function createRouter<TContext, TShape extends RouterShape<TContext>>(shape: TShape): Router<TContext, TShape>;
