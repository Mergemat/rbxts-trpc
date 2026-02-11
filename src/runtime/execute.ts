import { TRPCError, toErrorShape } from "../core/errors";
import type {
	ContextFactoryOptions,
	ErrorShape,
	EventMiddleware,
	InitTRPCConfig,
	ProcedureMiddleware,
	ProcedureResolver,
	ProcedureIntent,
	Validator,
} from "../core/types";

function assertInput<T>(validator: Validator<T> | undefined, value: unknown, path: string) {
	if (validator && !validator(value)) {
		throw new TRPCError("BAD_REQUEST", `Invalid input for '${path}'`);
	}
}

function assertOutput<T>(validator: Validator<T> | undefined, value: unknown, path: string) {
	if (validator && !validator(value)) {
		throw new TRPCError("INTERNAL_SERVER_ERROR", `Invalid output for '${path}'`);
	}
}

export function formatError(config: InitTRPCConfig<unknown>, caught: unknown): ErrorShape {
	const shape = toErrorShape(caught);
	if (config.errorFormatter) {
		return config.errorFormatter(shape);
	}

	return shape;
}

export async function createContext<TContext>(
	config: InitTRPCConfig<TContext>,
	options: ContextFactoryOptions,
): Promise<TContext> {
	if (!config.createContext) {
		return {} as TContext;
	}

	return config.createContext(options);
}

export async function runProcedure<TContext, TInput, TOutput>(options: {
	config: InitTRPCConfig<TContext>;
	path: string;
	intent: ProcedureIntent;
	input: unknown;
	player?: Player;
	inputValidator?: Validator<TInput>;
	outputValidator?: Validator<TOutput>;
	middlewares: ReadonlyArray<ProcedureMiddleware<TContext, TInput, TOutput>>;
	resolve: ProcedureResolver<TContext, TInput, TOutput>;
}): Promise<TOutput> {
	assertInput(options.inputValidator, options.input, options.path);

	const input = options.input as TInput;
	const baseContext = await createContext(options.config, {
		side: "server",
		path: options.path,
		kind: "procedure",
		direction: "server",
		input,
		player: options.player,
	});

	const executeResolver = (ctx: TContext, inputValue: TInput) =>
		Promise.resolve(
			options.resolve({
				ctx,
				input: inputValue,
				path: options.path,
				player: options.player,
				intent: options.intent,
			}),
		) as unknown as Promise<TOutput>;

	const runMiddleware = (index: number, ctx: TContext, inputValue: TInput): Promise<TOutput> => {
		if (index >= options.middlewares.size()) {
			return executeResolver(ctx, inputValue);
		}

		const middleware = options.middlewares[index];
		return Promise.resolve(
			middleware({
				ctx,
				input: inputValue,
				path: options.path,
				player: options.player,
				intent: options.intent,
				next: (nextState) => runMiddleware(index + 1, nextState?.ctx ?? ctx, nextState?.input ?? inputValue),
			}),
		) as unknown as Promise<TOutput>;
	};

	const output = await runMiddleware(0, baseContext as TContext, input);
	assertOutput(options.outputValidator, output, options.path);

	return output as TOutput;
}

export async function runServerEvent<TContext, TInput>(options: {
	config: InitTRPCConfig<TContext>;
	path: string;
	input: unknown;
	player?: Player;
	inputValidator?: Validator<TInput>;
	middlewares: ReadonlyArray<EventMiddleware<TContext, TInput>>;
	handle: (opts: { ctx: TContext; input: TInput; path: string; player?: Player }) => Promise<void>;
}): Promise<void> {
	assertInput(options.inputValidator, options.input, options.path);
	const input = options.input as TInput;

	const baseContext = await createContext(options.config, {
		side: "server",
		path: options.path,
		kind: "event",
		direction: "server",
		input,
		player: options.player,
	});

	const executeHandler = (ctx: TContext, inputValue: TInput) =>
		options.handle({
			ctx,
			input: inputValue,
			path: options.path,
			player: options.player,
		});

	const runMiddleware = (index: number, ctx: TContext, inputValue: TInput): Promise<void> => {
		if (index >= options.middlewares.size()) {
			return executeHandler(ctx, inputValue);
		}

		const middleware = options.middlewares[index];
		return Promise.resolve(
			middleware({
				ctx,
				input: inputValue,
				path: options.path,
				player: options.player,
				direction: "server",
				next: (nextState) => runMiddleware(index + 1, nextState?.ctx ?? ctx, nextState?.input ?? inputValue),
			}),
		) as unknown as Promise<void>;
	};

	await runMiddleware(0, baseContext as TContext, input);
}

export async function runClientEvent<TContext, TInput>(options: {
	config: InitTRPCConfig<TContext>;
	path: string;
	input: unknown;
	inputValidator?: Validator<TInput>;
	middlewares: ReadonlyArray<EventMiddleware<TContext, TInput>>;
	listeners: ReadonlyArray<(input: TInput) => void>;
}): Promise<void> {
	assertInput(options.inputValidator, options.input, options.path);
	const input = options.input as TInput;

	const baseContext = await createContext(options.config, {
		side: "client",
		path: options.path,
		kind: "event",
		direction: "client",
		input,
	});

	const emit = (ctx: TContext, inputValue: TInput): Promise<void> => {
		for (const listener of options.listeners) {
			listener(inputValue);
		}

		return Promise.resolve();
	};

	const runMiddleware = (index: number, ctx: TContext, inputValue: TInput): Promise<void> => {
		if (index >= options.middlewares.size()) {
			return emit(ctx, inputValue);
		}

		const middleware = options.middlewares[index];
		return Promise.resolve(
			middleware({
				ctx,
				input: inputValue,
				path: options.path,
				direction: "client",
				next: (nextState) => runMiddleware(index + 1, nextState?.ctx ?? ctx, nextState?.input ?? inputValue),
			}),
		) as unknown as Promise<void>;
	};

	await runMiddleware(0, baseContext as TContext, input);
}
