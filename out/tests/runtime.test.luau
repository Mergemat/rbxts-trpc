-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local validator = TS.import(script, TS.getModule(script, "@rbxts", "t").lib.ts).t
local toErrorShape = TS.import(script, script.Parent.Parent, "core", "errors").toErrorShape
local _execute = TS.import(script, script.Parent.Parent, "runtime", "execute")
local runClientEvent = _execute.runClientEvent
local runProcedure = _execute.runProcedure
local runServerEvent = _execute.runServerEvent
local function expect(condition, message)
	if not condition then
		error(`[runtime.test] {message}`)
	end
end
local runRuntimeTests = TS.async(function()
	local checks = 0
	local config = {
		createContext = function(_param)
			local path = _param.path
			local kind = _param.kind
			return {
				stamp = `{kind}:{path}`,
			}
		end,
	}
	local middlewareCalls = {}
	local procedureOutput = TS.await(runProcedure({
		config = config,
		path = "todos.add",
		intent = "mutation",
		input = "Bread",
		inputValidator = validator.string,
		outputValidator = validator.number,
		middlewares = { function(_param)
			local path = _param.path
			local callNext = _param.next
			local _arg0 = `mw1:{path}`
			table.insert(middlewareCalls, _arg0)
			return callNext()
		end, function(_param)
			local ctx = _param.ctx
			local input = _param.input
			local callNext = _param.next
			local _arg0 = `mw2:{ctx.stamp}:{input}`
			table.insert(middlewareCalls, _arg0)
			return callNext()
		end },
		resolve = function(_param)
			local input = _param.input
			return #input
		end,
	}))
	expect(procedureOutput == 5, "procedure should return validated output")
	checks += 1
	expect(middlewareCalls[1] == "mw1:todos.add" and middlewareCalls[2] == "mw2:procedure:todos.add:Bread", "procedure middlewares should execute in order with context")
	checks += 1
	local badInputCode = ""
	TS.try(function()
		TS.await(runProcedure({
			config = config,
			path = "todos.remove",
			intent = "mutation",
			input = 123,
			inputValidator = validator.string,
			middlewares = {},
			resolve = function(_param)
				local input = _param.input
				return input
			end,
		}))
	end, function(caught)
		badInputCode = toErrorShape(caught).code
	end)
	expect(badInputCode == "BAD_REQUEST", "invalid procedure input should produce BAD_REQUEST")
	checks += 1
	local eventSeen = ""
	TS.await(runServerEvent({
		config = config,
		path = "todos.addViaEvent",
		input = "Apple",
		inputValidator = validator.string,
		middlewares = { function(_param)
			local ctx = _param.ctx
			local input = _param.input
			local callNext = _param.next
			eventSeen = `{ctx.stamp}:{input}`
			return callNext()
		end },
		handle = TS.async(function(_param)
			local input = _param.input
			eventSeen = `{eventSeen}->{input}`
		end),
	}))
	expect(eventSeen == "event:todos.addViaEvent:Apple->Apple", "server event should run middleware and handler")
	checks += 1
	local clientEvents = {}
	TS.await(runClientEvent({
		config = config,
		path = "todos.changed",
		input = { "Milk", "Eggs" },
		inputValidator = validator.array(validator.string),
		middlewares = { function(_param)
			local input = _param.input
			local callNext = _param.next
			local payload = input
			local _arg0 = `mw:{#payload}`
			table.insert(clientEvents, _arg0)
			return callNext()
		end },
		listeners = { function(input)
			local _arg0 = `listener:{table.concat(input, ",")}`
			table.insert(clientEvents, _arg0)
			return #clientEvents
		end },
	}))
	expect(clientEvents[1] == "mw:2" and clientEvents[2] == "listener:Milk,Eggs", "client event should pass through middleware then listener")
	checks += 1
	return {
		passed = true,
		checks = checks,
	}
end)
return {
	runRuntimeTests = runRuntimeTests,
}
