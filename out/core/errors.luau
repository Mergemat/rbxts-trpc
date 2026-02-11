-- Compiled with roblox-ts v3.0.0
local TRPCError
do
	TRPCError = setmetatable({}, {
		__tostring = function()
			return "TRPCError"
		end,
	})
	TRPCError.__index = TRPCError
	function TRPCError.new(...)
		local self = setmetatable({}, TRPCError)
		return self:constructor(...) or self
	end
	function TRPCError:constructor(code, message, data)
		self.name = "TRPCError"
		self.code = code
		self.message = message
		self.data = data
	end
end
local TRPCClientError
do
	TRPCClientError = setmetatable({}, {
		__tostring = function()
			return "TRPCClientError"
		end,
	})
	TRPCClientError.__index = TRPCClientError
	function TRPCClientError.new(...)
		local self = setmetatable({}, TRPCClientError)
		return self:constructor(...) or self
	end
	function TRPCClientError:constructor(shape)
		self.name = "TRPCClientError"
		self.shape = shape
		self.message = shape.message
	end
end
local function toErrorShape(caught)
	local _caught = caught
	if type(_caught) == "table" then
		local maybeError = caught
		local _code = maybeError.code
		local _condition = type(_code) == "string"
		if _condition then
			local _message = maybeError.message
			_condition = type(_message) == "string"
		end
		if _condition then
			return {
				code = maybeError.code,
				message = maybeError.message,
				data = maybeError.data,
			}
		end
	end
	local _object = {
		code = "INTERNAL_SERVER_ERROR",
	}
	local _left = "message"
	local _caught_1 = caught
	_object[_left] = if type(_caught_1) == "string" then caught else "Internal server error"
	return _object
end
return {
	toErrorShape = toErrorShape,
	TRPCError = TRPCError,
	TRPCClientError = TRPCClientError,
}
