import { t } from "@rbxts/t";
import { addTodo, getTodos, removeTodo } from "./state";
import { trpc } from "./trpc";

const todoValidator = t.string;
const todoListValidator = t.array(todoValidator);

export const appRouter = trpc.router({
	todos: trpc.router({
		getAll: trpc.procedure
			.intent("query")
			.output<string[]>(todoListValidator)
			.resolve(() => getTodos()),
		add: trpc.procedure
			.input<string>(todoValidator)
			.output<string[]>(todoListValidator)
			.resolve(({ input }) => addTodo(input)),
		remove: trpc.procedure
			.input<string>(todoValidator)
			.output<string[]>(todoListValidator)
			.resolve(({ input }) => removeTodo(input)),
		addViaEvent: trpc.event.server.input<string>(todoValidator).handle(({ input }) => {
			addTodo(input);
		}),
		changed: trpc.event.client.input<string[]>(todoListValidator).create(),
	}),
});

export type AppRouter = typeof appRouter;
