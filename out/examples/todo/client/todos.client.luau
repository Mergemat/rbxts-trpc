-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local createClient = TS.import(script, script.Parent.Parent.Parent.Parent).createClient
local appRouter = TS.import(script, script.Parent.Parent, "shared", "router").appRouter
local trpc = TS.import(script, script.Parent.Parent, "shared", "trpc").trpc
local client = createClient({
	t = trpc,
	router = appRouter,
})
local todos = {}
client.todos.changed.on(function(nextTodos)
	todos = nextTodos
	print(`[rbxts-trpc example] event todos: {table.concat(todos, ", ")}`)
end)
client.todos.getAll.query(nil):andThen(function(initialTodos)
	todos = initialTodos
	print(`[rbxts-trpc example] initial todos: {table.concat(todos, ", ")}`)
	client.todos.add.mutate("Bread")
	client.todos.addViaEvent.emit("Butter")
end):catch(function(clientError)
	warn("[rbxts-trpc example] failed to load todos:", clientError)
end)
