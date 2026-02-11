-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local _event = TS.import(script, script.Parent, "event")
local ClientEventBuilder = _event.ClientEventBuilder
local ServerEventBuilder = _event.ServerEventBuilder
local ProcedureBuilder = TS.import(script, script.Parent, "procedure").ProcedureBuilder
local createRouter = TS.import(script, script.Parent, "router").createRouter
local FactoryImpl
do
	FactoryImpl = setmetatable({}, {
		__tostring = function()
			return "FactoryImpl"
		end,
	})
	FactoryImpl.__index = FactoryImpl
	function FactoryImpl.new(...)
		local self = setmetatable({}, FactoryImpl)
		return self:constructor(...) or self
	end
	function FactoryImpl:constructor(config)
		self.procedure = ProcedureBuilder.new()
		self.event = {
			server = ServerEventBuilder.new(),
			client = ClientEventBuilder.new(),
		}
		self._config = config
	end
	function FactoryImpl:router(shape)
		return createRouter(shape)
	end
end
local function initTRPC()
	return {
		context = function(self)
			return {
				create = function(self, config)
					if config == nil then
						config = {}
					end
					return FactoryImpl.new(config)
				end,
			}
		end,
	}
end
return {
	initTRPC = initTRPC,
}
