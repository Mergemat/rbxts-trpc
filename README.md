# @rbxts/trpc

Type-safe tRPC-style procedures and events for Roblox TS, built on top of `@rbxts/remo`.

## Docs

- Live docs: https://rbxts-trpc.vercel.app
- Source docs app: `docs/`

Everything else (guides, API reference, React usage, events/procedures, and LLM endpoints) lives in the docs site.

## Install

```sh
bun add @rbxts/trpc @rbxts/remo @rbxts/t
```

If you use React helpers, also install `@rbxts/react`.

## Quick Example

```ts
import { t as v } from "@rbxts/t";
import { createClient, createServer, initTRPC } from "@rbxts/trpc";

const trpc = initTRPC()
	.context<{ player?: Player }>()
	.create({
		createContext: ({ player }) => ({ player }),
	});

const appRouter = trpc.router({
	todos: trpc.router({
		list: trpc.procedure
			.intent("query")
			.output<string[]>(v.array(v.string))
			.resolve(() => ["Milk", "Eggs"]),
		add: trpc.procedure.input<string>(v.string).resolve(({ input }) => input.size() > 0),
		changed: trpc.event.client.input<string[]>(v.array(v.string)).create(),
	}),
});

const server = createServer({ t: trpc, router: appRouter });
server.events.todos.changed.emitAll(["Milk", "Eggs", "Bread"]);

const client = createClient({ t: trpc, router: appRouter });
client.todos.list.call(undefined).then((todos) => print(todos.size()));
```

## Develop

```sh
bun run build
bun run lint
bun run docs:dev
```
