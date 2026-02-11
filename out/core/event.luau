-- Compiled with roblox-ts v3.0.0
local ServerEventImpl
do
	ServerEventImpl = setmetatable({}, {
		__tostring = function()
			return "ServerEventImpl"
		end,
	})
	ServerEventImpl.__index = ServerEventImpl
	function ServerEventImpl.new(...)
		local self = setmetatable({}, ServerEventImpl)
		return self:constructor(...) or self
	end
	function ServerEventImpl:constructor(def)
		self._def = def
	end
end
local ClientEventImpl
do
	ClientEventImpl = setmetatable({}, {
		__tostring = function()
			return "ClientEventImpl"
		end,
	})
	ClientEventImpl.__index = ClientEventImpl
	function ClientEventImpl.new(...)
		local self = setmetatable({}, ClientEventImpl)
		return self:constructor(...) or self
	end
	function ClientEventImpl:constructor(def)
		self._def = def
	end
end
local ServerEventBuilder
do
	ServerEventBuilder = setmetatable({}, {
		__tostring = function()
			return "ServerEventBuilder"
		end,
	})
	ServerEventBuilder.__index = ServerEventBuilder
	function ServerEventBuilder.new(...)
		local self = setmetatable({}, ServerEventBuilder)
		return self:constructor(...) or self
	end
	function ServerEventBuilder:constructor(options)
		local _result = options
		if _result ~= nil then
			_result = _result.inputValidator
		end
		self.currentInputValidator = _result
		local _result_1 = options
		if _result_1 ~= nil then
			_result_1 = _result_1.middlewares
		end
		local _condition = _result_1
		if _condition == nil then
			_condition = {}
		end
		self.currentMiddlewares = _condition
	end
	function ServerEventBuilder:input(validator)
		return ServerEventBuilder.new({
			inputValidator = validator,
			middlewares = self.currentMiddlewares,
		})
	end
	function ServerEventBuilder:use(middleware)
		local _object = {
			inputValidator = self.currentInputValidator,
		}
		local _left = "middlewares"
		local _array = {}
		local _length = #_array
		local _array_1 = self.currentMiddlewares
		local _Length = #_array_1
		table.move(_array_1, 1, _Length, _length + 1, _array)
		_length += _Length
		_array[_length + 1] = middleware
		_object[_left] = _array
		return ServerEventBuilder.new(_object)
	end
	function ServerEventBuilder:handle(handler)
		return ServerEventImpl.new({
			kind = "event",
			direction = "server",
			inputValidator = self.currentInputValidator,
			middlewares = self.currentMiddlewares,
			handle = handler,
		})
	end
end
local ClientEventBuilder
do
	ClientEventBuilder = setmetatable({}, {
		__tostring = function()
			return "ClientEventBuilder"
		end,
	})
	ClientEventBuilder.__index = ClientEventBuilder
	function ClientEventBuilder.new(...)
		local self = setmetatable({}, ClientEventBuilder)
		return self:constructor(...) or self
	end
	function ClientEventBuilder:constructor(options)
		local _result = options
		if _result ~= nil then
			_result = _result.inputValidator
		end
		self.currentInputValidator = _result
		local _result_1 = options
		if _result_1 ~= nil then
			_result_1 = _result_1.middlewares
		end
		local _condition = _result_1
		if _condition == nil then
			_condition = {}
		end
		self.currentMiddlewares = _condition
	end
	function ClientEventBuilder:input(validator)
		return ClientEventBuilder.new({
			inputValidator = validator,
			middlewares = self.currentMiddlewares,
		})
	end
	function ClientEventBuilder:use(middleware)
		local _object = {
			inputValidator = self.currentInputValidator,
		}
		local _left = "middlewares"
		local _array = {}
		local _length = #_array
		local _array_1 = self.currentMiddlewares
		local _Length = #_array_1
		table.move(_array_1, 1, _Length, _length + 1, _array)
		_length += _Length
		_array[_length + 1] = middleware
		_object[_left] = _array
		return ClientEventBuilder.new(_object)
	end
	function ClientEventBuilder:create()
		return ClientEventImpl.new({
			kind = "event",
			direction = "client",
			inputValidator = self.currentInputValidator,
			middlewares = self.currentMiddlewares,
		})
	end
end
return {
	ServerEventBuilder = ServerEventBuilder,
	ClientEventBuilder = ClientEventBuilder,
}
