import type { Router, RouterShape } from "../core/types";
export declare function joinPath(parent: string | undefined, key: string): string;
export declare function buildRemoSchema<TContext>(router: Router<TContext, RouterShape<TContext>>): unknown;
