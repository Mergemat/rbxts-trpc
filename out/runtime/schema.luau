-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local _remo = TS.import(script, TS.getModule(script, "@rbxts", "remo").src)
local namespace = _remo.namespace
local remote = _remo.remote
local function isRouterNode(node)
	return node._def.kind == "router"
end
local function joinPath(parent, key)
	return if parent ~= "" and parent then `{parent}.{key}` else key
end
local function buildRemoSchema(router)
	local buildShape
	buildShape = function(shape)
		local result = {}
		for key, node in pairs(shape) do
			if isRouterNode(node) then
				result[key] = namespace(buildShape(node._def.shape))
				continue
			end
			if node._def.kind == "procedure" then
				result[key] = remote().returns()
				continue
			end
			if node._def.direction == "server" then
				result[key] = remote()
			else
				result[key] = remote()
			end
		end
		return result
	end
	return buildShape(router._def.shape)
end
return {
	joinPath = joinPath,
	buildRemoSchema = buildRemoSchema,
}
