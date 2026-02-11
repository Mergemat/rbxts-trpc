-- Compiled with roblox-ts v3.0.0
local TS = _G[script]
local initTRPC = TS.import(script, script.Parent.Parent.Parent.Parent).initTRPC
local trpc = initTRPC():context():create({
	createContext = function(_param)
		local player = _param.player
		return {
			player = player,
		}
	end,
})
return {
	trpc = trpc,
}
