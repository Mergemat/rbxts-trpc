# Todo Example Structure

This example targets `roblox-ts` projects that use `client/`, `server/`, and `shared/`.

## Current files

- `shared/trpc.ts`: shared TRPC factory and context type
- `shared/router.ts`: shared router contract
- `server/todos.server.ts`: server bootstrap + event emits
- `client/todos.client.ts`: client runtime usage
- `client/todos.react.tsx`: client React hooks usage

## Where to put code in real projects

- `shared/*`: router shape, validators, API types
- `server/*`: authoritative data logic, persistence, emits
- `client/*`: UI and user interaction code

For simplicity, this example keeps in-memory todo state in `shared/state.ts`.
In production, move state/services to `server/services/*`.
