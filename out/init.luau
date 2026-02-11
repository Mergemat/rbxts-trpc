-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local exports = {}
local _errors = TS.import(script, script, "core", "errors")
exports.TRPCClientError = _errors.TRPCClientError
exports.TRPCError = _errors.TRPCError
exports.initTRPC = TS.import(script, script, "core", "initTRPC").initTRPC
exports.createClient = TS.import(script, script, "client", "createClient").createClient
exports.createServer = TS.import(script, script, "server", "createServer").createServer
return exports
