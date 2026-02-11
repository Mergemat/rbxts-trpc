import { t as validator } from "@rbxts/t";
import { toErrorShape } from "../core/errors";
import type { InitTRPCConfig } from "../core/types";
import { runClientEvent, runProcedure, runServerEvent } from "../runtime/execute";

function expect(condition: boolean, message: string) {
	if (!condition) {
		error(`[runtime.test] ${message}`);
	}
}

export interface RuntimeTestResult {
	passed: boolean;
	checks: number;
}

export async function runRuntimeTests(): Promise<RuntimeTestResult> {
	let checks = 0;

	const config: InitTRPCConfig<{ stamp: string }> = {
		createContext: ({ path, kind }) => ({
			stamp: `${kind}:${path}`,
		}),
	};

	const middlewareCalls: string[] = [];

	const procedureOutput = await runProcedure({
		config,
		path: "todos.add",
		intent: "mutation",
		input: "Bread",
		inputValidator: validator.string,
		outputValidator: validator.number,
		middlewares: [
			({ path, next: callNext }) => {
				middlewareCalls.push(`mw1:${path}`);
				return callNext();
			},
			({ ctx, input, next: callNext }) => {
				middlewareCalls.push(`mw2:${ctx.stamp}:${input}`);
				return callNext();
			},
		],
		resolve: ({ input }) => input.size(),
	});

	expect(procedureOutput === 5, "procedure should return validated output");
	checks += 1;

	expect(
		middlewareCalls[0] === "mw1:todos.add" && middlewareCalls[1] === "mw2:procedure:todos.add:Bread",
		"procedure middlewares should execute in order with context",
	);
	checks += 1;

	let badInputCode = "";
	try {
		await runProcedure({
			config,
			path: "todos.remove",
			intent: "mutation",
			input: 123,
			inputValidator: validator.string,
			middlewares: [],
			resolve: ({ input }) => input,
		});
	} catch (caught) {
		badInputCode = toErrorShape(caught).code;
	}

	expect(badInputCode === "BAD_REQUEST", "invalid procedure input should produce BAD_REQUEST");
	checks += 1;

	let eventSeen = "";
	await runServerEvent({
		config,
		path: "todos.addViaEvent",
		input: "Apple",
		inputValidator: validator.string,
		middlewares: [
			({ ctx, input, next: callNext }) => {
				eventSeen = `${ctx.stamp}:${input}`;
				return callNext();
			},
		],
		handle: async ({ input }) => {
			eventSeen = `${eventSeen}->${input}`;
		},
	});

	expect(eventSeen === "event:todos.addViaEvent:Apple->Apple", "server event should run middleware and handler");
	checks += 1;

	const clientEvents: string[] = [];
	await runClientEvent({
		config,
		path: "todos.changed",
		input: ["Milk", "Eggs"],
		inputValidator: validator.array(validator.string),
		middlewares: [
			({ input, next: callNext }) => {
				const payload = input as string[];
				clientEvents.push(`mw:${payload.size()}`);
				return callNext();
			},
		],
		listeners: [(input) => clientEvents.push(`listener:${(input as string[]).join(",")}`)],
	});

	expect(
		clientEvents[0] === "mw:2" && clientEvents[1] === "listener:Milk,Eggs",
		"client event should pass through middleware then listener",
	);
	checks += 1;

	return {
		passed: true,
		checks,
	};
}
