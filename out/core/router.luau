-- Compiled with roblox-ts v3.0.0
local RouterImpl
do
	RouterImpl = setmetatable({}, {
		__tostring = function()
			return "RouterImpl"
		end,
	})
	RouterImpl.__index = RouterImpl
	function RouterImpl.new(...)
		local self = setmetatable({}, RouterImpl)
		return self:constructor(...) or self
	end
	function RouterImpl:constructor(shape)
		self._def = {
			kind = "router",
			shape = shape,
		}
	end
end
local function createRouter(shape)
	return RouterImpl.new(shape)
end
return {
	createRouter = createRouter,
}
