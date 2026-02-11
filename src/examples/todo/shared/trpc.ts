import { initTRPC } from "../../../index";

export interface TodoContext {
	player?: Player;
}

export const trpc = initTRPC()
	.context<TodoContext>()
	.create({
		createContext: ({ player }) => ({
			player,
		}),
	});
