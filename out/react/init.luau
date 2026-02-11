-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local exports = {}
local _hooks = TS.import(script, script, "hooks")
exports.invalidateRPCQuery = _hooks.invalidateRPCQuery
exports.useRPCEvent = _hooks.useRPCEvent
exports.useRPCMutation = _hooks.useRPCMutation
exports.useRPCQuery = _hooks.useRPCQuery
return exports
