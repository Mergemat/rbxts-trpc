import { createClient } from "../../../index";
import { appRouter } from "../shared/router";
import { trpc } from "../shared/trpc";

const client = createClient({
	t: trpc,
	router: appRouter,
});

let todos: string[] = [];

client.todos.changed.on((nextTodos) => {
	todos = nextTodos;
	print(`[rbxts-trpc example] event todos: ${todos.join(", ")}`);
});

client.todos.getAll
	.query(undefined)
	.then((initialTodos) => {
		todos = initialTodos;
		print(`[rbxts-trpc example] initial todos: ${todos.join(", ")}`);

		client.todos.add.mutate("Bread");
		client.todos.addViaEvent.emit("Butter");
	})
	.catch((clientError) => {
		warn("[rbxts-trpc example] failed to load todos:", clientError);
	});
