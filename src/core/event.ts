import type {
	ClientEvent,
	ClientEventDef,
	EventHandler,
	EventMiddleware,
	ServerEvent,
	ServerEventDef,
	Validator,
} from "./types";

class ServerEventImpl<TContext, TInput> implements ServerEvent<TContext, TInput> {
	public readonly _def: ServerEventDef<TContext, TInput>;

	public constructor(def: ServerEventDef<TContext, TInput>) {
		this._def = def;
	}
}

class ClientEventImpl<TContext, TInput> implements ClientEvent<TContext, TInput> {
	public readonly _def: ClientEventDef<TContext, TInput>;

	public constructor(def: ClientEventDef<TContext, TInput>) {
		this._def = def;
	}
}

export class ServerEventBuilder<TContext, TInput> {
	private readonly currentInputValidator?: Validator<TInput>;
	private readonly currentMiddlewares: ReadonlyArray<EventMiddleware<TContext, TInput>>;

	public constructor(options?: {
		inputValidator?: Validator<TInput>;
		middlewares?: ReadonlyArray<EventMiddleware<TContext, TInput>>;
	}) {
		this.currentInputValidator = options?.inputValidator;
		this.currentMiddlewares = options?.middlewares ?? [];
	}

	public input<TNextInput>(validator: Validator<TNextInput>): ServerEventBuilder<TContext, TNextInput> {
		return new ServerEventBuilder<TContext, TNextInput>({
			inputValidator: validator,
			middlewares: this.currentMiddlewares as unknown as ReadonlyArray<EventMiddleware<TContext, TNextInput>>,
		});
	}

	public use(middleware: EventMiddleware<TContext, TInput>): ServerEventBuilder<TContext, TInput> {
		return new ServerEventBuilder({
			inputValidator: this.currentInputValidator,
			middlewares: [...this.currentMiddlewares, middleware],
		});
	}

	public handle(handler: EventHandler<TContext, TInput>): ServerEvent<TContext, TInput> {
		return new ServerEventImpl({
			kind: "event",
			direction: "server",
			inputValidator: this.currentInputValidator,
			middlewares: this.currentMiddlewares,
			handle: handler,
		});
	}
}

export class ClientEventBuilder<TContext, TInput> {
	private readonly currentInputValidator?: Validator<TInput>;
	private readonly currentMiddlewares: ReadonlyArray<EventMiddleware<TContext, TInput>>;

	public constructor(options?: {
		inputValidator?: Validator<TInput>;
		middlewares?: ReadonlyArray<EventMiddleware<TContext, TInput>>;
	}) {
		this.currentInputValidator = options?.inputValidator;
		this.currentMiddlewares = options?.middlewares ?? [];
	}

	public input<TNextInput>(validator: Validator<TNextInput>): ClientEventBuilder<TContext, TNextInput> {
		return new ClientEventBuilder<TContext, TNextInput>({
			inputValidator: validator,
			middlewares: this.currentMiddlewares as unknown as ReadonlyArray<EventMiddleware<TContext, TNextInput>>,
		});
	}

	public use(middleware: EventMiddleware<TContext, TInput>): ClientEventBuilder<TContext, TInput> {
		return new ClientEventBuilder({
			inputValidator: this.currentInputValidator,
			middlewares: [...this.currentMiddlewares, middleware],
		});
	}

	public create(): ClientEvent<TContext, TInput> {
		return new ClientEventImpl({
			kind: "event",
			direction: "client",
			inputValidator: this.currentInputValidator,
			middlewares: this.currentMiddlewares,
		});
	}
}
