import type { Router, RouterDef, RouterShape } from "./types";

class RouterImpl<TContext, TShape extends RouterShape<TContext>> implements Router<TContext, TShape> {
	public readonly _def: RouterDef<TContext, TShape>;

	public constructor(shape: TShape) {
		this._def = {
			kind: "router",
			shape,
		};
	}
}

export function createRouter<TContext, TShape extends RouterShape<TContext>>(shape: TShape): Router<TContext, TShape> {
	return new RouterImpl(shape);
}
