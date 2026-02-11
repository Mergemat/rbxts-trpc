import type { inferEventPayloads, inferRouterInputs, inferRouterOutputs } from "../index";
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
interface TestContext {
    requestId: string;
}
declare const testRouter: import("../index").Router<TestContext, {
    todos: import("../index").Router<TestContext, {
        list: import("../index").Procedure<TestContext, undefined, string[], "query">;
        add: import("../index").Procedure<TestContext, string, boolean, "mutation">;
        push: import("../index").ClientEvent<TestContext, string[]>;
        notify: import("../index").ServerEvent<TestContext, string>;
    }>;
}>;
type Inputs = inferRouterInputs<typeof testRouter>;
type Outputs = inferRouterOutputs<typeof testRouter>;
type EventPayloads = inferEventPayloads<typeof testRouter>;
type TestInputAdd = Expect<Equals<Inputs["todos"]["add"], string>>;
type TestOutputList = Expect<Equals<Outputs["todos"]["list"], string[]>>;
type TestClientEventDirection = Expect<Equals<EventPayloads["todos"]["push"]["direction"], "client">>;
type TestServerEventInput = Expect<Equals<EventPayloads["todos"]["notify"]["input"], string>>;
type AddIntent = typeof testRouter._def.shape.todos._def.shape.add._def.intent;
type ListIntent = typeof testRouter._def.shape.todos._def.shape.list._def.intent;
type TestDefaultIntentIsMutation = Expect<Equals<AddIntent, "mutation">>;
type TestQueryIntent = Expect<Equals<ListIntent, "query">>;
export declare const typeTestsCompile: [
    TestInputAdd,
    TestOutputList,
    TestClientEventDirection,
    TestServerEventInput,
    TestDefaultIntentIsMutation,
    TestQueryIntent
];
export {};
