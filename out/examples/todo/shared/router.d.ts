export declare const appRouter: import("../../..").Router<import("./trpc").TodoContext, {
    todos: import("../../..").Router<import("./trpc").TodoContext, {
        getAll: import("../../..").Procedure<import("./trpc").TodoContext, undefined, string[], "query">;
        add: import("../../..").Procedure<import("./trpc").TodoContext, string, string[], "mutation">;
        remove: import("../../..").Procedure<import("./trpc").TodoContext, string, string[], "mutation">;
        addViaEvent: import("../../..").ServerEvent<import("./trpc").TodoContext, string>;
        changed: import("../../..").ClientEvent<import("./trpc").TodoContext, string[]>;
    }>;
}>;
export type AppRouter = typeof appRouter;
