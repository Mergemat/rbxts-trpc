import type { ErrorShape, TRPCErrorCode } from "./types";

export class TRPCError {
	public readonly name = "TRPCError";
	public readonly code: TRPCErrorCode;
	public readonly message: string;
	public readonly data?: unknown;

	public constructor(code: TRPCErrorCode, message: string, data?: unknown) {
		this.code = code;
		this.message = message;
		this.data = data;
	}
}

export class TRPCClientError {
	public readonly name = "TRPCClientError";
	public readonly message: string;
	public readonly shape: ErrorShape;

	public constructor(shape: ErrorShape) {
		this.shape = shape;
		this.message = shape.message;
	}
}

export function toErrorShape(caught: unknown): ErrorShape {
	if (typeIs(caught, "table")) {
		const maybeError = caught as { code?: unknown; message?: unknown; data?: unknown };
		if (typeIs(maybeError.code, "string") && typeIs(maybeError.message, "string")) {
			return {
				code: maybeError.code as TRPCErrorCode,
				message: maybeError.message,
				data: maybeError.data,
			};
		}
	}

	return {
		code: "INTERNAL_SERVER_ERROR",
		message: typeIs(caught, "string") ? caught : "Internal server error",
	};
}
