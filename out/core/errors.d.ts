import type { ErrorShape, TRPCErrorCode } from "./types";
export declare class TRPCError {
    readonly name = "TRPCError";
    readonly code: TRPCErrorCode;
    readonly message: string;
    readonly data?: unknown;
    constructor(code: TRPCErrorCode, message: string, data?: unknown);
}
export declare class TRPCClientError {
    readonly name = "TRPCClientError";
    readonly message: string;
    readonly shape: ErrorShape;
    constructor(shape: ErrorShape);
}
export declare function toErrorShape(caught: unknown): ErrorShape;
