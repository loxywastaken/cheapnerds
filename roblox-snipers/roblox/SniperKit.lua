--!strict
-- SniperKit (ModuleScript in ReplicatedStorage).
--
-- Turns an imported rifle Model into a ready-to-hold Tool:
--   * applies a skin
--   * adds an invisible Handle at the rifle's grip and welds every part to it
--   * adds "Muzzle", "Aim" and "Grip" Attachments for your shooting code
--   * copies the arena stats onto the Tool as attributes
--
--   local tool = SniperKit.BuildTool(ReplicatedStorage.Snipers.Raptor, "Galaxy")
--   tool.Parent = player.Backpack

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local SniperData = require(ReplicatedStorage:WaitForChild("SniperData"))
local SniperSkins = require(ReplicatedStorage:WaitForChild("SniperSkins"))

local SniperKit = {}

-- Nudge this if the rifle sits wrong in your character's hand. The Handle's
-- front (-Z) points down the barrel, which is how Roblox holds tools forward.
SniperKit.Grip = CFrame.new(0, 0, 0)

local function findPart(root: Instance, slot: string): BasePart?
	for _, d in root:GetDescendants() do
		if d:IsA("BasePart") and (d.Name == slot or d:GetAttribute("Slot") == slot) then
			return d
		end
	end
	return nil
end

function SniperKit.BuildTool(template: Model, skinName: string?, rifleName: string?): Tool
	local rifle = rifleName or template.Name
	local data = SniperData[rifle]
	assert(data, `[SniperKit] no SniperData for "{rifle}"`)

	local model = template:Clone()
	SniperSkins.Apply(model, skinName or "Factory", rifle)

	local tool = Instance.new("Tool")
	tool.Name = data.DisplayName
	tool.CanBeDropped = false
	tool.RequiresHandle = true
	tool.Grip = SniperKit.Grip
	tool:SetAttribute("Sniper", rifle)
	tool:SetAttribute("Skin", skinName or "Factory")
	for stat, value in data.Stats do
		tool:SetAttribute(stat, value)
	end

	local gripInfo = data.Attachments.Grip
	local gripPart = findPart(model, gripInfo.Part)
	assert(gripPart, `[SniperKit] {rifle} has no {gripInfo.Part} part`)

	local handle = Instance.new("Part")
	handle.Name = "Handle"
	handle.Size = Vector3.new(0.2, 0.2, 0.2)
	handle.Transparency = 1
	handle.CanCollide = false
	handle.CanQuery = false
	handle.CanTouch = false
	handle.Massless = true
	-- grip parts sit unrotated in the imported model, so the rifle's axes carry over
	handle.CFrame = CFrame.new((gripPart.CFrame * CFrame.new(gripInfo.Offset)).Position)
	handle.Parent = tool

	for _, part in model:GetDescendants() do
		if part:IsA("BasePart") then
			part.Anchored = false
			part.CanCollide = false
			part.CanQuery = false
			part.CanTouch = false
			part.Massless = true
			local weld = Instance.new("WeldConstraint")
			weld.Part0 = handle
			weld.Part1 = part
			weld.Parent = handle
			part.Parent = tool
		end
	end
	model:Destroy()

	for name, info in data.Attachments do
		local part = findPart(tool, info.Part)
		if part then
			local att = Instance.new("Attachment")
			att.Name = name
			att.Position = info.Offset
			att.Parent = part
		end
	end
	return tool
end

-- World position + direction a shot should leave from.
function SniperKit.GetMuzzle(tool: Tool): (Vector3, Vector3)
	local handle = tool:FindFirstChild("Handle") :: BasePart
	-- the Muzzle MeshPart shares the name, so look for the Attachment by class
	for _, d in tool:GetDescendants() do
		if d:IsA("Attachment") and d.Name == "Muzzle" then
			return d.WorldPosition, handle.CFrame.LookVector
		end
	end
	return handle.Position, handle.CFrame.LookVector
end

-- Re-skin a tool a player already holds.
function SniperKit.SetSkin(tool: Tool, skinName: string)
	SniperSkins.Apply(tool, skinName)
	tool:SetAttribute("Skin", skinName)
end

return SniperKit
