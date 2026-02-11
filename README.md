# @rbxts/rbxts-trpc

Type-safe tRPC-style procedures and events for Roblox TS, built on top of `@rbxts/remo`.

## Features

- Typed router with nested procedures and events
- Runtime input/output validation via `@rbxts/t` (or any predicate validator)
- Procedure and event middleware pipelines
- Client-side typed proxies generated from the same router
- Server-side emitters for client events (`emit`, `emitAll`, `emitAllExcept`, `emitPlayers`)
- Optional React helpers for query/mutation/event workflows

## Install

```sh
bun add @rbxts/rbxts-trpc @rbxts/remo @rbxts/t
```

If you use the React helpers, also install `@rbxts/react`.

## Quick Start

```ts
import { t as v } from "@rbxts/t";
import { createClient, createServer, initTRPC } from "@rbxts/rbxts-trpc";

interface Ctx {
	player?: Player;
}

const trpc = initTRPC()
	.context<Ctx>()
	.create({
		createContext: ({ player }) => ({ player }),
	});

const appRouter = trpc.router({
	todos: trpc.router({
		list: trpc.procedure
			.intent("query")
			.output<string[]>(v.array(v.string))
			.resolve(() => ["Milk", "Eggs"]),

		add: trpc.procedure
			.input<string>(v.string)
			.output<boolean>(v.boolean)
			.resolve(({ input }) => input.size() > 0),

		addViaEvent: trpc.event.server.input<string>(v.string).handle(({ input }) => {
			print(`add via event: ${input}`);
		}),

		changed: trpc.event.client.input<string[]>(v.array(v.string)).create(),
	}),
});

// Server
const server = createServer({ t: trpc, router: appRouter });
server.events.todos.changed.emitAll(["Milk", "Eggs", "Bread"]);

// Client
const client = createClient({ t: trpc, router: appRouter });
client.todos.list.call(undefined).then((todos) => print(todos.size()));
client.todos.addViaEvent.emit("Butter");
client.todos.changed.on((todos) => print(`changed: ${todos.size()}`));
```

## API Overview

### `initTRPC`

Create a factory with optional runtime config:

- `createContext(options)` for per-call context
- `errorFormatter(shape)` for customizing returned error shapes

```ts
const trpc = initTRPC()
	.context<MyContext>()
	.create({
		createContext: ({ player, path, kind }) => ({ player, path, kind }),
	});
```

### Procedures

Use `trpc.procedure` to define RPC handlers:

- `.input<T>(validator)` validates inbound payloads
- `.output<T>(validator)` validates resolver output
- `.use(middleware)` composes middleware
- `.intent("query" | "mutation")` tags intent (default: `"mutation"`)
- `.resolve(({ ctx, input, player, path, intent }) => ...)` final resolver

### Events

Server-bound event (client emits -> server handles):

```ts
trpc.event.server.input<string>(v.string).handle(({ input, ctx, player }) => {
	// handle event on server
});
```

Client-bound event (server emits -> client listens):

```ts
trpc.event.client.input<string>(v.string).create();
```

From `createServer(...)`, client events are exposed under `server.events` and support:

- `emit(player, input)`
- `emitAll(input)`
- `emitAllExcept(player, input)`
- `emitPlayers(players, input)`

### Client Proxies

From `createClient({ t, router })`:

- Procedures expose `.call(input): Promise<output>`
- Server events expose `.emit(input): void`
- Client events expose `.on(listener): () => void`

## React Helpers

Import from `@rbxts/rbxts-trpc/react`:

- `useRPCQuery(procedure, input, options?)`
- `useRPCMutation(procedure, options?)`
- `useRPCEvent(event, listener)`
- `invalidateRPCQuery(path, input)`

Example:

```ts
import { invalidateRPCQuery, useRPCMutation, useRPCQuery } from "@rbxts/rbxts-trpc/react";

const todos = useRPCQuery(client.todos.list, undefined);
const addTodo = useRPCMutation(client.todos.add, {
	onSuccess: () => {
		invalidateRPCQuery(client.todos.list.__path, undefined);
		todos.refetch();
	},
});
```

## Type Utilities

Exported utility types:

- `inferRouterInputs<TRouter>`
- `inferRouterOutputs<TRouter>`
- `inferEventPayloads<TRouter>`
- `inferContext<TRouter>`

## Examples

See the todo example:

- `src/examples/todo/shared/router.ts`
- `src/examples/todo/server/todos.server.ts`
- `src/examples/todo/client/todos.client.ts`
- `src/examples/todo/client/todos.react.tsx`

## Development

```sh
bun run build
bun run lint
bun run docs:dev
```
