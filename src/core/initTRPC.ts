import { ClientEventBuilder, ServerEventBuilder } from "./event";
import { ProcedureBuilder } from "./procedure";
import { createRouter } from "./router";
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

class FactoryImpl<TContext> implements TRPCFactory<TContext> {
	public readonly _config: InitTRPCConfig<TContext>;
	public readonly procedure = new ProcedureBuilder<TContext, undefined, unknown, "mutation">();
	public readonly event = {
		server: new ServerEventBuilder<TContext, undefined>(),
		client: new ClientEventBuilder<TContext, undefined>(),
	};

	public constructor(config: InitTRPCConfig<TContext>) {
		this._config = config;
	}

	public router<TShape extends RouterShape<TContext>>(shape: TShape) {
		return createRouter<TContext, TShape>(shape);
	}
}

export function initTRPC() {
	return {
		context<TContext>() {
			return {
				create(config: InitTRPCConfig<TContext> = {}) {
					return new FactoryImpl<TContext>(config);
				},
			};
		},
	};
}
