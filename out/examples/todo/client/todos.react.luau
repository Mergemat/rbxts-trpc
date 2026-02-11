-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))
local createClient = TS.import(script, script.Parent.Parent.Parent.Parent).createClient
local _react = TS.import(script, script.Parent.Parent.Parent.Parent, "react")
local invalidateRPCQuery = _react.invalidateRPCQuery
local useRPCEvent = _react.useRPCEvent
local useRPCMutation = _react.useRPCMutation
local useRPCQuery = _react.useRPCQuery
local appRouter = TS.import(script, script.Parent.Parent, "shared", "router").appRouter
local trpc = TS.import(script, script.Parent.Parent, "shared", "trpc").trpc
local client = createClient({
	t = trpc,
	router = appRouter,
})
local function TodoWidget()
	local nextTodo, setNextTodo = React.useState("Apple")
	local todosQuery = useRPCQuery(client.todos.getAll, nil)
	local addTodo = useRPCMutation(client.todos.add, {
		onSuccess = function()
			invalidateRPCQuery(client.todos.getAll.__path, nil)
			todosQuery.refetch()
		end,
	})
	useRPCEvent(client.todos.changed, function()
		todosQuery.refetch()
	end)
	return React.createElement("frame", {
		key = "TodoWidget",
		Size = UDim2.new(0, 300, 0, 220),
		BackgroundColor3 = Color3.fromRGB(36, 36, 44),
	}, React.createElement("uipadding", {
		PaddingTop = UDim.new(0, 12),
		PaddingLeft = UDim.new(0, 12),
		PaddingRight = UDim.new(0, 12),
	}), React.createElement("textlabel", {
		key = "Title",
		BackgroundTransparency = 1,
		Text = "Todos",
		TextSize = 24,
		Font = Enum.Font.GothamBold,
		TextColor3 = Color3.fromRGB(255, 255, 255),
		Size = UDim2.new(1, 0, 0, 32),
	}), React.createElement("textlabel", {
		key = "Items",
		BackgroundTransparency = 1,
		Text = if todosQuery.isLoading then "Loading..." else table.concat((todosQuery.data or {}), ", "),
		TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left,
		TextYAlignment = Enum.TextYAlignment.Top,
		TextSize = 16,
		Font = Enum.Font.Gotham,
		TextColor3 = Color3.fromRGB(220, 220, 220),
		Position = UDim2.new(0, 0, 0, 36),
		Size = UDim2.new(1, 0, 0, 110),
	}), React.createElement("textbutton", {
		key = "AddButton",
		Text = if addTodo.isPending then "Adding..." else "Add Todo",
		TextSize = 16,
		Font = Enum.Font.GothamMedium,
		TextColor3 = Color3.fromRGB(255, 255, 255),
		BackgroundColor3 = Color3.fromRGB(61, 133, 198),
		Position = UDim2.new(0, 0, 0, 156),
		Size = UDim2.new(0, 130, 0, 36),
		Event = {
			MouseButton1Click = function()
				addTodo.mutate(nextTodo)
				setNextTodo(if nextTodo == "Apple" then "Orange" else "Apple")
			end,
		},
	}))
end
return {
	TodoWidget = TodoWidget,
}
