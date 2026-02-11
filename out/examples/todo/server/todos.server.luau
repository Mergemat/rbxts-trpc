-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local RunService = TS.import(script, TS.getModule(script, "@rbxts", "services")).RunService
local createServer = TS.import(script, script.Parent.Parent.Parent.Parent).createServer
local appRouter = TS.import(script, script.Parent.Parent, "shared", "router").appRouter
local _state = TS.import(script, script.Parent.Parent, "shared", "state")
local consumeChanged = _state.consumeChanged
local getTodos = _state.getTodos
local trpc = TS.import(script, script.Parent.Parent, "shared", "trpc").trpc
local server = createServer({
	t = trpc,
	router = appRouter,
})
RunService.Heartbeat:Connect(function()
	if consumeChanged() then
		local todos = getTodos()
		server.events.todos.changed.emitAll(todos)
		print(`[rbxts-trpc example] todos changed: {table.concat(todos, ", ")}`)
	end
end)
