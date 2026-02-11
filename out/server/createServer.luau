-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local createRemotes = TS.import(script, TS.getModule(script, "@rbxts", "remo").src).createRemotes
local _execute = TS.import(script, script.Parent.Parent, "runtime", "execute")
local formatError = _execute.formatError
local runProcedure = _execute.runProcedure
local runServerEvent = _execute.runServerEvent
local _schema = TS.import(script, script.Parent.Parent, "runtime", "schema")
local buildRemoSchema = _schema.buildRemoSchema
local joinPath = _schema.joinPath
local function makeSuccess(data)
	return {
		ok = true,
		data = data,
	}
end
local function makeFailure(shape)
	return {
		ok = false,
		error = shape,
	}
end
local function isRouter(value)
	local _value = value
	local _condition = type(_value) == "table"
	if _condition then
		local __def = value._def
		_condition = type(__def) == "table"
		if _condition then
			_condition = value._def.kind == "router"
		end
	end
	return _condition
end
local function isProcedure(value)
	local _value = value
	local _condition = type(_value) == "table"
	if _condition then
		local __def = value._def
		_condition = type(__def) == "table"
		if _condition then
			_condition = value._def.kind == "procedure"
		end
	end
	return _condition
end
local function isServerEvent(value)
	local _value = value
	local _condition = type(_value) == "table"
	if _condition then
		local __def = value._def
		_condition = type(__def) == "table"
		if _condition then
			_condition = value._def.kind == "event" and value._def.direction == "server"
		end
	end
	return _condition
end
local function isClientEvent(value)
	local _value = value
	local _condition = type(_value) == "table"
	if _condition then
		local __def = value._def
		_condition = type(__def) == "table"
		if _condition then
			_condition = value._def.kind == "event" and value._def.direction == "client"
		end
	end
	return _condition
end
local function createServer(options)
	local schema = buildRemoSchema(options.router)
	local remotes = createRemotes(schema)
	local eventEmitters = {}
	local walk
	walk = function(shape, remoteShape, eventsTarget, parent)
		for key, node in pairs(shape) do
			local keyName = key
			local path = joinPath(parent, keyName)
			local remoteNode = remoteShape[keyName]
			if isRouter(node) then
				local nestedTarget = {}
				eventsTarget[keyName] = nestedTarget
				walk(node._def.shape, remoteNode, nestedTarget, path)
				continue
			end
			if isProcedure(node) then
				local requestRemote = remoteNode
				requestRemote.onRequest(requestRemote, TS.async(function(player, input)
					local _exitType, _returns = TS.try(function()
						local result = TS.await(runProcedure({
							config = options.t._config,
							path = path,
							intent = node._def.intent,
							input = input,
							player = player,
							inputValidator = node._def.inputValidator,
							outputValidator = node._def.outputValidator,
							middlewares = node._def.middlewares,
							resolve = node._def.resolve,
						}))
						return TS.TRY_RETURN, { makeSuccess(result) }
					end, function(caught)
						return TS.TRY_RETURN, { makeFailure(formatError(options.t._config, caught)) }
					end)
					if _exitType then
						return unpack(_returns)
					end
				end))
				continue
			end
			if isServerEvent(node) then
				local connectRemote = remoteNode
				connectRemote.connect(connectRemote, function(player, input)
					task.spawn(TS.async(function()
						TS.try(function()
							TS.await(runServerEvent({
								config = options.t._config,
								path = path,
								input = input,
								player = player,
								inputValidator = node._def.inputValidator,
								middlewares = node._def.middlewares,
								handle = TS.async(function(_param)
									local ctx = _param.ctx
									local payload = _param.input
									local eventPath = _param.path
									local eventPlayer = _param.player
									return node._def.handle({
										ctx = ctx,
										input = payload,
										path = eventPath,
										player = eventPlayer,
										direction = "server",
									})
								end),
							}))
						end, function(caught)
							warn(`[rbxts-trpc] server event error on '{path}':`, formatError(options.t._config, caught))
						end)
					end))
				end)
				continue
			end
			if isClientEvent(node) then
				local eventRemote = remoteNode
				eventsTarget[keyName] = {
					__kind = "clientEvent",
					__path = path,
					emit = function(player, input)
						return eventRemote.fire(eventRemote, player, input)
					end,
					emitAll = function(input)
						return eventRemote.fireAll(eventRemote, input)
					end,
					emitAllExcept = function(player, input)
						return eventRemote.fireAllExcept(eventRemote, player, input)
					end,
					emitPlayers = function(players, input)
						return eventRemote.firePlayers(eventRemote, players, input)
					end,
				}
			end
		end
	end
	walk(options.router._def.shape, remotes, eventEmitters)
	return {
		remotes = remotes,
		events = eventEmitters,
		destroy = function(self)
			local destroyRemote = remotes
			local _result = destroyRemote.destroy
			if _result ~= nil then
				_result(destroyRemote)
			end
		end,
	}
end
return {
	createServer = createServer,
}
