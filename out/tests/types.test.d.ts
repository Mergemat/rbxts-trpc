import type { inferEventPayloads, inferProcedureInput, inferProcedureOutput, inferRouterInputs, inferRouterOutputs, ProcedureCallProxy } from "../index";
type Equals<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;
interface TestContext {
    requestId: string;
}
declare const testRouter: import("../index").Router<TestContext, {
    todos: import("../index").Router<TestContext, {
        list: import("../index").Procedure<TestContext, undefined, string[], "query">;
        ping: import("../index").Procedure<TestContext, undefined, boolean, "mutation">;
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
type ListProcedure = typeof testRouter._def.shape.todos._def.shape.list;
type AddProcedure = typeof testRouter._def.shape.todos._def.shape.add;
type TestInferProcedureInputList = Expect<Equals<inferProcedureInput<ListProcedure>, undefined>>;
type TestInferProcedureOutputList = Expect<Equals<inferProcedureOutput<ListProcedure>, string[]>>;
type TestInferProcedureInputAdd = Expect<Equals<inferProcedureInput<AddProcedure>, string>>;
type TestInferProcedureOutputAdd = Expect<Equals<inferProcedureOutput<AddProcedure>, boolean>>;
type TestQueryNoInputArgs = Expect<Equals<Parameters<ProcedureCallProxy<undefined, string[], "query">["query"]>, [] | [undefined]>>;
type TestMutationNoInputArgs = Expect<Equals<Parameters<ProcedureCallProxy<undefined, boolean, "mutation">["mutate"]>, [] | [undefined]>>;
type TestMutationRequiredInputArgs = Expect<Equals<Parameters<ProcedureCallProxy<string, boolean, "mutation">["mutate"]>, [string]>>;
export declare const typeTestsCompile: [
    TestInputAdd,
    TestOutputList,
    TestClientEventDirection,
    TestServerEventInput,
    TestDefaultIntentIsMutation,
    TestQueryIntent,
    TestInferProcedureInputList,
    TestInferProcedureOutputList,
    TestInferProcedureInputAdd,
    TestInferProcedureOutputAdd,
    TestQueryNoInputArgs,
    TestMutationNoInputArgs,
    TestMutationRequiredInputArgs
];
export {};
