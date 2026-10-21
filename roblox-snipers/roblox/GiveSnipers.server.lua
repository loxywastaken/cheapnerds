-- Example Script (ServerScriptService). Gives every player a random rifle in a
-- random skin each time they spawn. Expects ReplicatedStorage.SniperSystem
-- with the imported rifle Models in its Models folder.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local system = ReplicatedStorage:WaitForChild("SniperSystem")
local SniperKit = require(system:WaitForChild("SniperKit"))
local SniperSkins = require(system:WaitForChild("SniperSkins"))

local function pick(list)
	return list[math.random(1, #list)]
end

Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function()
		local rifles = {}
		for _, model in system:WaitForChild("Models"):GetChildren() do
			if model:IsA("Model") then
				table.insert(rifles, model.Name)
			end
		end
		if #rifles == 0 then
			warn("SniperSystem.Models is empty - import the rifles and drop them in there")
			return
		end
		SniperKit.Give(player, pick(rifles), pick(SniperSkins.List()))
	end)
end)
