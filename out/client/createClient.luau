-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local createRemotes = TS.import(script, TS.getModule(script, "@rbxts", "remo").src).createRemotes
local _errors = TS.import(script, script.Parent.Parent, "core", "errors")
local TRPCClientError = _errors.TRPCClientError
local toErrorShape = _errors.toErrorShape
local _execute = TS.import(script, script.Parent.Parent, "runtime", "execute")
local formatError = _execute.formatError
local runClientEvent = _execute.runClientEvent
local _schema = TS.import(script, script.Parent.Parent, "runtime", "schema")
local buildRemoSchema = _schema.buildRemoSchema
local joinPath = _schema.joinPath
local function isRouterNode(node)
	return node._def.kind == "router"
end
local function isProcedureNode(node)
	return node._def.kind == "procedure"
end
local function isServerEventNode(node)
	return node._def.kind == "event" and node._def.direction == "server"
end
local function isClientEventNode(node)
	return node._def.kind == "event" and node._def.direction == "client"
end
local function createClient(options)
	local schema = buildRemoSchema(options.router)
	local remotes = createRemotes(schema)
	local listenersByPath = {}
	local addListener = function(path, listener)
		local listeners = listenersByPath[path] or {}
		local _listener = listener
		table.insert(listeners, _listener)
		listenersByPath[path] = listeners
		return function()
			local current = listenersByPath[path]
			if not current then
				return nil
			end
			local _listener_1 = listener
			local index = (table.find(current, _listener_1) or 0) - 1
			if index >= 0 then
				table.remove(current, index + 1)
			end
		end
	end
	local walk
	walk = function(shape, remoteShape, target, parent)
		for key, rawNode in pairs(shape) do
			local keyName = key
			local node = rawNode
			local path = joinPath(parent, keyName)
			local remoteNode = remoteShape[keyName]
			if isRouterNode(node) then
				local nested = {}
				target[keyName] = nested
				walk(node._def.shape, remoteNode, nested, path)
				continue
			end
			if isProcedureNode(node) then
				local execute = TS.async(function(input)
					local request = remoteNode.request
					local result
					TS.try(function()
						result = TS.await(request(input))
					end, function(caught)
						local shape = formatError(options.t._config, caught)
						error(TRPCClientError.new(shape))
					end)
					if not result.ok then
						error(TRPCClientError.new(result.error))
					end
					return result.data
				end)
				local _object = {
					__kind = "procedure",
					__path = path,
					__intent = node._def.intent,
				}
				for _k, _v in (if node._def.intent == "query" then {
					query = execute,
				} else {
					mutate = execute,
				}) do
					_object[_k] = _v
				end
				target[keyName] = _object
				continue
			end
			if isServerEventNode(node) then
				target[keyName] = {
					__kind = "serverEvent",
					__path = path,
					emit = function(input)
						remoteNode.fire(input)
					end,
				}
				continue
			end
			if isClientEventNode(node) then
				remoteNode.connect(function(input)
					task.spawn(TS.async(function()
						local listeners = listenersByPath[path] or {}
						TS.try(function()
							TS.await(runClientEvent({
								config = options.t._config,
								path = path,
								input = input,
								inputValidator = node._def.inputValidator,
								middlewares = node._def.middlewares,
								listeners = listeners,
							}))
						end, function(caught)
							warn(`[rbxts-trpc] client event error on '{path}':`, toErrorShape(caught))
						end)
					end))
				end)
				target[keyName] = {
					__kind = "clientEvent",
					__path = path,
					on = function(listener)
						return addListener(path, listener)
					end,
				}
			end
		end
	end
	local client = {}
	walk(options.router._def.shape, remotes, client)
	return client
end
return {
	createClient = createClient,
}
