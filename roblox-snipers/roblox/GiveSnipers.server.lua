-- Example Script (ServerScriptService). Gives every player a random rifle in a
-- random skin when they spawn. Expects the imported rifle Models in a Folder
-- at ReplicatedStorage.Snipers, each named exactly like in SniperData.Order.

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local SniperData = require(ReplicatedStorage:WaitForChild("SniperData"))
local SniperKit = require(ReplicatedStorage:WaitForChild("SniperKit"))
local SniperSkins = require(ReplicatedStorage:WaitForChild("SniperSkins"))

local folder = ReplicatedStorage:WaitForChild("Snipers")

local function pick(list)
	return list[math.random(1, #list)]
end

Players.PlayerAdded:Connect(function(player)
	player.CharacterAdded:Connect(function()
		local rifle = pick(SniperData.Order)
		local template = folder:FindFirstChild(rifle)
		if not template then
			warn(`missing model ReplicatedStorage.Snipers.{rifle}`)
			return
		end
		local tool = SniperKit.BuildTool(template, pick(SniperSkins.List()))
		tool.Parent = player:WaitForChild("Backpack")
	end)
end)
