-- Compiled with roblox-ts v3.0.0
local todos = { "Milk", "Eggs" }
local changed = false
local function getTodos()
	local _array = {}
	local _length = #_array
	table.move(todos, 1, #todos, _length + 1, _array)
	return _array
end
local function addTodo(name)
	local _name = name
	table.insert(todos, _name)
	changed = true
	return getTodos()
end
local function removeTodo(name)
	local _name = name
	local index = (table.find(todos, _name) or 0) - 1
	if index >= 0 then
		table.remove(todos, index + 1)
		changed = true
	end
	return getTodos()
end
local function consumeChanged()
	local wasChanged = changed
	changed = false
	return wasChanged
end
return {
	getTodos = getTodos,
	addTodo = addTodo,
	removeTodo = removeTodo,
	consumeChanged = consumeChanged,
}
