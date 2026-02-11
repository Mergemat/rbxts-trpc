-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local validator = TS.import(script, TS.getModule(script, "@rbxts", "t").lib.ts).t
local initTRPC = TS.import(script, script.Parent.Parent).initTRPC
local trpc = initTRPC():context():create()
local testRouter = trpc:router({
	todos = trpc:router({
		list = trpc.procedure:intent("query"):output(validator.array(validator.string)):resolve(function()
			return { "Milk" }
		end),
		add = trpc.procedure:input(validator.string):output(validator.boolean):resolve(function(_param)
			local input = _param.input
			return #input > 0
		end),
		push = trpc.event.client:input(validator.array(validator.string)):create(),
		notify = trpc.event.server:input(validator.string):handle(function()
			return nil
		end),
	}),
})
local typeTestsCompile = { true, true, true, true, true, true }
return {
	typeTestsCompile = typeTestsCompile,
}
