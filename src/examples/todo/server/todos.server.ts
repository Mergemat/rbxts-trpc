import { RunService } from "@rbxts/services";
import { createServer } from "../../../index";
import { appRouter } from "../shared/router";
import { consumeChanged, getTodos } from "../shared/state";
import { trpc } from "../shared/trpc";

const server = createServer({
	t: trpc,
	router: appRouter,
});

RunService.Heartbeat.Connect(() => {
	if (consumeChanged()) {
		const todos = getTodos();
		server.events.todos.changed.emitAll(todos);
		print(`[rbxts-trpc example] todos changed: ${todos.join(", ")}`);
	}
});
