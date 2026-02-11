-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local t = TS.import(script, TS.getModule(script, "@rbxts", "t").lib.ts).t
local _state = TS.import(script, script.Parent, "state")
local addTodo = _state.addTodo
local getTodos = _state.getTodos
local removeTodo = _state.removeTodo
local trpc = TS.import(script, script.Parent, "trpc").trpc
local todoValidator = t.string
local todoListValidator = t.array(todoValidator)
local appRouter = trpc:router({
	todos = trpc:router({
		getAll = trpc.procedure:intent("query"):output(todoListValidator):resolve(function()
			return getTodos()
		end),
		add = trpc.procedure:input(todoValidator):output(todoListValidator):resolve(function(_param)
			local input = _param.input
			return addTodo(input)
		end),
		remove = trpc.procedure:input(todoValidator):output(todoListValidator):resolve(function(_param)
			local input = _param.input
			return removeTodo(input)
		end),
		addViaEvent = trpc.event.server:input(todoValidator):handle(function(_param)
			local input = _param.input
			addTodo(input)
		end),
		changed = trpc.event.client:input(todoListValidator):create(),
	}),
})
return {
	appRouter = appRouter,
}
