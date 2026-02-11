import { TRPCClientError } from "../core/errors";
import type { ClientEventProxy, ProcedureCallProxy } from "../core/types";
interface QueryOptions {
    enabled?: boolean;
}
interface MutationOptions<TOutput> {
    onSuccess?: (data: TOutput) => void;
    onError?: (clientError: TRPCClientError) => void;
}
export declare function useRPCQuery<TInput, TOutput>(procedure: ProcedureCallProxy<TInput, TOutput, "query">, input: TInput, options?: QueryOptions): {
    refetch: () => Promise<TOutput>;
    data?: TOutput | undefined;
    error?: TRPCClientError;
    isLoading: boolean;
};
export declare function useRPCMutation<TInput, TOutput>(procedure: ProcedureCallProxy<TInput, TOutput, "mutation">, options?: MutationOptions<TOutput>): {
    mutate: (...args: import("../core/types").ProcedureArgs<TInput>) => void;
    mutateAsync: (...args: import("../core/types").ProcedureArgs<TInput>) => Promise<TOutput>;
    data?: TOutput | undefined;
    error?: TRPCClientError;
    isPending: boolean;
};
export declare function useRPCEvent<TInput>(event: ClientEventProxy<TInput>, listener: (input: TInput) => void): void;
export declare function invalidateRPCQuery(path: string, input?: unknown): void;
export {};
