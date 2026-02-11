import React from "@rbxts/react";
import { TRPCClientError } from "../core/errors";
import type { ClientEventProxy, ProcedureCallProxy } from "../core/types";

interface QueryOptions {
	enabled?: boolean;
}

interface MutationOptions<TOutput> {
	onSuccess?: (data: TOutput) => void;
	onError?: (clientError: TRPCClientError) => void;
}

interface QueryState<TOutput> {
	data?: TOutput;
	error?: TRPCClientError;
	isLoading: boolean;
}

interface MutationState<TOutput> {
	data?: TOutput;
	error?: TRPCClientError;
	isPending: boolean;
}

const queryCache = {} as Record<string, unknown>;

function createQueryKey(path: string, input: unknown): string {
	return `${path}:${tostring(input)}`;
}

export function useRPCQuery<TInput, TOutput>(
	procedure: ProcedureCallProxy<TInput, TOutput, "query">,
	input: TInput,
	options: QueryOptions = {},
) {
	if (procedure.__intent !== "query") {
		error(`useRPCQuery expected a query procedure at '${procedure.__path}'`);
	}

	const key = createQueryKey(procedure.__path, input);
	const initialData = queryCache[key] as TOutput | undefined;
	const [state, setState] = React.useState<QueryState<TOutput>>({
		data: initialData,
		error: undefined,
		isLoading: initialData === undefined,
	});

	const refetch = React.useCallback(() => {
		setState((current: QueryState<TOutput>) => ({ ...current, isLoading: true }));

		return procedure
			.call(input)
			.then((data) => {
				queryCache[key] = data;
				setState({ data, isLoading: false });
				return data;
			})
			.catch((err: unknown) => {
				const clientError = err as TRPCClientError;
				setState((current: QueryState<TOutput>) => ({ ...current, error: clientError, isLoading: false }));
				throw clientError;
			});
	}, [procedure, input, key]);

	React.useEffect(() => {
		if (options.enabled === false) {
			return;
		}

		let mounted = true;

		refetch().catch(() => {
			if (!mounted) {
				return;
			}
		});

		return () => {
			mounted = false;
		};
	}, [refetch, options.enabled]);

	return {
		...state,
		refetch,
	};
}

export function useRPCMutation<TInput, TOutput>(
	procedure: ProcedureCallProxy<TInput, TOutput, "mutation">,
	options: MutationOptions<TOutput> = {},
) {
	const [state, setState] = React.useState<MutationState<TOutput>>({
		isPending: false,
	});

	const mutateAsync = React.useCallback(
		(input: TInput) => {
			setState((current: MutationState<TOutput>) => ({ ...current, isPending: true, error: undefined }));

			return procedure
				.call(input)
				.then((data) => {
					setState({ isPending: false, data });
					options.onSuccess?.(data);
					return data;
				})
				.catch((err: unknown) => {
					const clientError = err as TRPCClientError;
					setState((current: MutationState<TOutput>) => ({
						...current,
						isPending: false,
						error: clientError,
					}));
					options.onError?.(clientError);
					throw clientError;
				});
		},
		[procedure, options.onError, options.onSuccess],
	);

	const mutate = React.useCallback(
		(input: TInput) => {
			mutateAsync(input).catch(() => undefined);
		},
		[mutateAsync],
	);

	return {
		...state,
		mutate,
		mutateAsync,
	};
}

export function useRPCEvent<TInput>(event: ClientEventProxy<TInput>, listener: (input: TInput) => void) {
	React.useEffect(() => event.on(listener), [event, listener]);
}

export function invalidateRPCQuery(path: string, input: unknown) {
	queryCache[createQueryKey(path, input)] = undefined;
}
