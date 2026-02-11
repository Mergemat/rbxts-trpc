-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local React = TS.import(script, TS.getModule(script, "@rbxts", "react"))
local queryCache = {}
local function createQueryKey(path, input)
	return `{path}:{tostring(input)}`
end
local function useRPCQuery(procedure, input, options)
	if options == nil then
		options = {}
	end
	if procedure.__intent ~= "query" then
		error(`useRPCQuery expected a query procedure at '{procedure.__path}'`)
	end
	local key = createQueryKey(procedure.__path, input)
	local initialData = queryCache[key]
	local state, setState = React.useState({
		data = initialData,
		error = nil,
		isLoading = initialData == nil,
	})
	local refetch = React.useCallback(function()
		setState(function(current)
			local _object = table.clone(current)
			setmetatable(_object, nil)
			_object.isLoading = true
			return _object
		end)
		return procedure.query(unpack(({ input }))):andThen(function(data)
			queryCache[key] = data
			setState({
				data = data,
				isLoading = false,
			})
			return data
		end):catch(function(err)
			local clientError = err
			setState(function(current)
				local _object = table.clone(current)
				setmetatable(_object, nil)
				_object.error = clientError
				_object.isLoading = false
				return _object
			end)
			error(clientError)
		end)
	end, { procedure, input, key })
	React.useEffect(function()
		if options.enabled == false then
			return nil
		end
		local mounted = true
		refetch():catch(function()
			if not mounted then
				return nil
			end
		end)
		return function()
			mounted = false
		end
	end, { refetch, options.enabled })
	local _object = table.clone(state)
	setmetatable(_object, nil)
	_object.refetch = refetch
	return _object
end
local function useRPCMutation(procedure, options)
	if options == nil then
		options = {}
	end
	local state, setState = React.useState({
		isPending = false,
	})
	local mutateAsync = React.useCallback(function(...)
		local args = { ... }
		setState(function(current)
			local _object = table.clone(current)
			setmetatable(_object, nil)
			_object.isPending = true
			_object.error = nil
			return _object
		end)
		return procedure.mutate(unpack(args)):andThen(function(data)
			setState({
				isPending = false,
				data = data,
			})
			local _result = options.onSuccess
			if _result ~= nil then
				_result(data)
			end
			return data
		end):catch(function(err)
			local clientError = err
			setState(function(current)
				local _object = table.clone(current)
				setmetatable(_object, nil)
				_object.isPending = false
				_object.error = clientError
				return _object
			end)
			local _result = options.onError
			if _result ~= nil then
				_result(clientError)
			end
			error(clientError)
		end)
	end, { procedure, options.onError, options.onSuccess })
	local mutate = React.useCallback(function(...)
		local args = { ... }
		mutateAsync(unpack(args)):catch(function()
			return nil
		end)
	end, { mutateAsync })
	local _object = table.clone(state)
	setmetatable(_object, nil)
	_object.mutate = mutate
	_object.mutateAsync = mutateAsync
	return _object
end
local function useRPCEvent(event, listener)
	React.useEffect(function()
		return event.on(listener)
	end, { event, listener })
end
local function invalidateRPCQuery(path, input)
	queryCache[createQueryKey(path, input)] = nil
end
return {
	useRPCQuery = useRPCQuery,
	useRPCMutation = useRPCMutation,
	useRPCEvent = useRPCEvent,
	invalidateRPCQuery = invalidateRPCQuery,
}
