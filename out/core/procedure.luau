-- Compiled with roblox-ts v3.0.0
local ProcedureImpl
do
	ProcedureImpl = setmetatable({}, {
		__tostring = function()
			return "ProcedureImpl"
		end,
	})
	ProcedureImpl.__index = ProcedureImpl
	function ProcedureImpl.new(...)
		local self = setmetatable({}, ProcedureImpl)
		return self:constructor(...) or self
	end
	function ProcedureImpl:constructor(def)
		self._def = def
	end
end
local ProcedureBuilder
do
	ProcedureBuilder = setmetatable({}, {
		__tostring = function()
			return "ProcedureBuilder"
		end,
	})
	ProcedureBuilder.__index = ProcedureBuilder
	function ProcedureBuilder.new(...)
		local self = setmetatable({}, ProcedureBuilder)
		return self:constructor(...) or self
	end
	function ProcedureBuilder:constructor(options)
		local _result = options
		if _result ~= nil then
			_result = _result.inputValidator
		end
		self.inputValidator = _result
		local _result_1 = options
		if _result_1 ~= nil then
			_result_1 = _result_1.outputValidator
		end
		self.outputValidator = _result_1
		local _result_2 = options
		if _result_2 ~= nil then
			_result_2 = _result_2.middlewares
		end
		local _condition = _result_2
		if _condition == nil then
			_condition = {}
		end
		self.middlewares = _condition
		local _result_3 = options
		if _result_3 ~= nil then
			_result_3 = _result_3.intent
		end
		local _condition_1 = _result_3
		if _condition_1 == nil then
			_condition_1 = "mutation"
		end
		self.currentIntent = _condition_1
	end
	function ProcedureBuilder:input(validator)
		return ProcedureBuilder.new({
			inputValidator = validator,
			outputValidator = self.outputValidator,
			middlewares = self.middlewares,
			intent = self.currentIntent,
		})
	end
	function ProcedureBuilder:output(validator)
		return ProcedureBuilder.new({
			inputValidator = self.inputValidator,
			outputValidator = validator,
			middlewares = self.middlewares,
			intent = self.currentIntent,
		})
	end
	function ProcedureBuilder:use(middleware)
		local _object = {
			inputValidator = self.inputValidator,
			outputValidator = self.outputValidator,
		}
		local _left = "middlewares"
		local _array = {}
		local _length = #_array
		local _array_1 = self.middlewares
		local _Length = #_array_1
		table.move(_array_1, 1, _Length, _length + 1, _array)
		_length += _Length
		_array[_length + 1] = middleware
		_object[_left] = _array
		_object.intent = self.currentIntent
		return ProcedureBuilder.new(_object)
	end
	function ProcedureBuilder:intent(intent)
		return ProcedureBuilder.new({
			inputValidator = self.inputValidator,
			outputValidator = self.outputValidator,
			middlewares = self.middlewares,
			intent = intent,
		})
	end
	function ProcedureBuilder:resolve(resolve)
		local def = {
			kind = "procedure",
			intent = self.currentIntent,
			inputValidator = self.inputValidator,
			outputValidator = self.outputValidator,
			middlewares = self.middlewares,
			resolve = resolve,
		}
		return ProcedureImpl.new(def)
	end
end
return {
	ProcedureBuilder = ProcedureBuilder,
}
