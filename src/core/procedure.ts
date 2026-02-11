import type {
	Procedure,
	ProcedureDef,
	ProcedureIntent,
	ProcedureMiddleware,
	ProcedureResolver,
	Validator,
} from "./types";

class ProcedureImpl<TContext, TInput, TOutput, TIntent extends ProcedureIntent> implements Procedure<
	TContext,
	TInput,
	TOutput,
	TIntent
> {
	public readonly _def: ProcedureDef<TContext, TInput, TOutput, TIntent>;

	public constructor(def: ProcedureDef<TContext, TInput, TOutput, TIntent>) {
		this._def = def;
	}
}

export class ProcedureBuilder<TContext, TInput, TOutput, TIntent extends ProcedureIntent = "mutation"> {
	private readonly inputValidator?: Validator<TInput>;
	private readonly outputValidator?: Validator<TOutput>;
	private readonly middlewares: ReadonlyArray<ProcedureMiddleware<TContext, TInput, TOutput>>;
	private readonly currentIntent: TIntent;

	public constructor(options?: {
		inputValidator?: Validator<TInput>;
		outputValidator?: Validator<TOutput>;
		middlewares?: ReadonlyArray<ProcedureMiddleware<TContext, TInput, TOutput>>;
		intent?: TIntent;
	}) {
		this.inputValidator = options?.inputValidator;
		this.outputValidator = options?.outputValidator;
		this.middlewares = options?.middlewares ?? [];
		this.currentIntent = options?.intent ?? ("mutation" as TIntent);
	}

	public input<TNextInput>(
		validator: Validator<TNextInput>,
	): ProcedureBuilder<TContext, TNextInput, TOutput, TIntent> {
		return new ProcedureBuilder<TContext, TNextInput, TOutput, TIntent>({
			inputValidator: validator,
			outputValidator: this.outputValidator as Validator<TOutput> | undefined,
			middlewares: this.middlewares as unknown as ReadonlyArray<
				ProcedureMiddleware<TContext, TNextInput, TOutput>
			>,
			intent: this.currentIntent,
		});
	}

	public output<TNextOutput>(
		validator: Validator<TNextOutput>,
	): ProcedureBuilder<TContext, TInput, TNextOutput, TIntent> {
		return new ProcedureBuilder<TContext, TInput, TNextOutput, TIntent>({
			inputValidator: this.inputValidator,
			outputValidator: validator,
			middlewares: this.middlewares as unknown as ReadonlyArray<
				ProcedureMiddleware<TContext, TInput, TNextOutput>
			>,
			intent: this.currentIntent,
		});
	}

	public use(
		middleware: ProcedureMiddleware<TContext, TInput, TOutput>,
	): ProcedureBuilder<TContext, TInput, TOutput, TIntent> {
		return new ProcedureBuilder({
			inputValidator: this.inputValidator,
			outputValidator: this.outputValidator,
			middlewares: [...this.middlewares, middleware],
			intent: this.currentIntent,
		});
	}

	public intent<TNextIntent extends ProcedureIntent>(
		intent: TNextIntent,
	): ProcedureBuilder<TContext, TInput, TOutput, TNextIntent> {
		return new ProcedureBuilder<TContext, TInput, TOutput, TNextIntent>({
			inputValidator: this.inputValidator,
			outputValidator: this.outputValidator,
			middlewares: this.middlewares,
			intent,
		});
	}

	public resolve<TResolvedOutput extends TOutput>(
		resolve: ProcedureResolver<TContext, TInput, TResolvedOutput>,
	): Procedure<TContext, TInput, TResolvedOutput, TIntent> {
		const def: ProcedureDef<TContext, TInput, TResolvedOutput, TIntent> = {
			kind: "procedure",
			intent: this.currentIntent,
			inputValidator: this.inputValidator,
			outputValidator: this.outputValidator as Validator<TResolvedOutput> | undefined,
			middlewares: this.middlewares as unknown as ReadonlyArray<
				ProcedureMiddleware<TContext, TInput, TResolvedOutput>
			>,
			resolve,
		};

		return new ProcedureImpl(def);
	}
}
