-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local _errors = TS.import(script, script.Parent.Parent, "core", "errors")
local TRPCError = _errors.TRPCError
local toErrorShape = _errors.toErrorShape
local function assertInput(validator, value, path)
	if validator and not validator(value) then
		error(TRPCError.new("BAD_REQUEST", `Invalid input for '{path}'`))
	end
end
local function assertOutput(validator, value, path)
	if validator and not validator(value) then
		error(TRPCError.new("INTERNAL_SERVER_ERROR", `Invalid output for '{path}'`))
	end
end
local function formatError(config, caught)
	local shape = toErrorShape(caught)
	if config.errorFormatter then
		return config.errorFormatter(shape)
	end
	return shape
end
local createContext = TS.async(function(config, options)
	if not config.createContext then
		return {}
	end
	return config.createContext(options)
end)
local runProcedure = TS.async(function(options)
	assertInput(options.inputValidator, options.input, options.path)
	local input = options.input
	local baseContext = TS.await(createContext(options.config, {
		side = "server",
		path = options.path,
		kind = "procedure",
		direction = "server",
		input = input,
		player = options.player,
	}))
	local executeResolver = function(ctx, inputValue)
		return TS.Promise.resolve(options.resolve({
			ctx = ctx,
			input = inputValue,
			path = options.path,
			player = options.player,
			intent = options.intent,
		}))
	end
	local runMiddleware
	runMiddleware = function(index, ctx, inputValue)
		if index >= #options.middlewares then
			return executeResolver(ctx, inputValue)
		end
		local middleware = options.middlewares[index + 1]
		return TS.Promise.resolve(middleware({
			ctx = ctx,
			input = inputValue,
			path = options.path,
			player = options.player,
			intent = options.intent,
			next = function(nextState)
				local _exp = index + 1
				local _result = nextState
				if _result ~= nil then
					_result = _result.ctx
				end
				local _condition = _result
				if _condition == nil then
					_condition = ctx
				end
				local _result_1 = nextState
				if _result_1 ~= nil then
					_result_1 = _result_1.input
				end
				local _condition_1 = _result_1
				if _condition_1 == nil then
					_condition_1 = inputValue
				end
				return runMiddleware(_exp, _condition, _condition_1)
			end,
		}))
	end
	local output = TS.await(runMiddleware(0, baseContext, input))
	assertOutput(options.outputValidator, output, options.path)
	return output
end)
local runServerEvent = TS.async(function(options)
	assertInput(options.inputValidator, options.input, options.path)
	local input = options.input
	local baseContext = TS.await(createContext(options.config, {
		side = "server",
		path = options.path,
		kind = "event",
		direction = "server",
		input = input,
		player = options.player,
	}))
	local executeHandler = function(ctx, inputValue)
		return options.handle({
			ctx = ctx,
			input = inputValue,
			path = options.path,
			player = options.player,
		})
	end
	local runMiddleware
	runMiddleware = function(index, ctx, inputValue)
		if index >= #options.middlewares then
			return executeHandler(ctx, inputValue)
		end
		local middleware = options.middlewares[index + 1]
		return TS.Promise.resolve(middleware({
			ctx = ctx,
			input = inputValue,
			path = options.path,
			player = options.player,
			direction = "server",
			next = function(nextState)
				local _exp = index + 1
				local _result = nextState
				if _result ~= nil then
					_result = _result.ctx
				end
				local _condition = _result
				if _condition == nil then
					_condition = ctx
				end
				local _result_1 = nextState
				if _result_1 ~= nil then
					_result_1 = _result_1.input
				end
				local _condition_1 = _result_1
				if _condition_1 == nil then
					_condition_1 = inputValue
				end
				return runMiddleware(_exp, _condition, _condition_1)
			end,
		}))
	end
	TS.await(runMiddleware(0, baseContext, input))
end)
local runClientEvent = TS.async(function(options)
	assertInput(options.inputValidator, options.input, options.path)
	local input = options.input
	local baseContext = TS.await(createContext(options.config, {
		side = "client",
		path = options.path,
		kind = "event",
		direction = "client",
		input = input,
	}))
	local emit = function(ctx, inputValue)
		for _, listener in options.listeners do
			listener(inputValue)
		end
		return TS.Promise.resolve()
	end
	local runMiddleware
	runMiddleware = function(index, ctx, inputValue)
		if index >= #options.middlewares then
			return emit(ctx, inputValue)
		end
		local middleware = options.middlewares[index + 1]
		return TS.Promise.resolve(middleware({
			ctx = ctx,
			input = inputValue,
			path = options.path,
			direction = "client",
			next = function(nextState)
				local _exp = index + 1
				local _result = nextState
				if _result ~= nil then
					_result = _result.ctx
				end
				local _condition = _result
				if _condition == nil then
					_condition = ctx
				end
				local _result_1 = nextState
				if _result_1 ~= nil then
					_result_1 = _result_1.input
				end
				local _condition_1 = _result_1
				if _condition_1 == nil then
					_condition_1 = inputValue
				end
				return runMiddleware(_exp, _condition, _condition_1)
			end,
		}))
	end
	TS.await(runMiddleware(0, baseContext, input))
end)
return {
	formatError = formatError,
	createContext = createContext,
	runProcedure = runProcedure,
	runServerEvent = runServerEvent,
	runClientEvent = runClientEvent,
}
