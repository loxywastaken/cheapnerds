--!strict
-- SniperKit (ModuleScript inside the SniperSystem folder).
--
-- Turns an imported rifle Model into a ready-to-hold Tool:
--   * fixes the size if the importer scaled it (uses SniperData.Size)
--   * applies a skin
--   * adds an invisible Handle at the rifle's grip and welds every part to it
--   * adds "Muzzle", "Aim" and "Grip" Attachments for your shooting code
--   * copies the arena stats onto the Tool as attributes
--
-- Put the imported rifle Models in SniperSystem.Models, named Hawkeye, Goliath, ...
--
--   local tool = SniperKit.BuildTool("Raptor", "Galaxy")
--   tool.Parent = player.Backpack

local root = script.Parent
local SniperData = require(root:WaitForChild("SniperData"))
local SniperSkins = require(root:WaitForChild("SniperSkins"))

local SniperKit = {}

-- Nudge this if the rifle sits wrong in your character's hand. The Handle's
-- front (-Z) points down the barrel, which is how Roblox holds tools forward.
SniperKit.Grip = CFrame.new(0, 0, 0)

local function findPart(container: Instance, slot: string): BasePart?
	for _, d in container:GetDescendants() do
		if d:IsA("BasePart") and SniperSkins.SlotOf(d) == slot then
			return d
		end
	end
	return nil
end

local function modelsFolder(): Instance
	local folder = root:FindFirstChild("Models")
	assert(folder, "[SniperKit] put your imported rifles in a Folder named Models inside SniperSystem")
	return folder
end

-- Importers sometimes treat file units as metres; scale back to the real size.
local function fixScale(model: Model, want: Vector3)
	local have = model:GetExtentsSize()
	local longest = math.max(have.X, have.Y, have.Z)
	local target = math.max(want.X, want.Y, want.Z)
	if longest > 0 and math.abs(longest / target - 1) > 0.03 then
		model:ScaleTo(model:GetScale() * target / longest)
	end
end

function SniperKit.BuildTool(template: Model | string, skinName: string?): Tool
	local source: Model = if typeof(template) == "string"
		then modelsFolder():FindFirstChild(template) :: Model
		else template
	assert(source, `[SniperKit] no rifle model named "{tostring(template)}" in SniperSystem.Models`)
	local rifle = source:GetAttribute("Sniper") or source.Name
	local data = SniperData[rifle]
	assert(data, `[SniperKit] no SniperData for "{rifle}" (rename the model to the rifle's name)`)

	local model = source:Clone()
	fixScale(model, data.Size)
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
	-- keep the part's rotation so the Handle faces down the barrel even if
	-- the importer turned the whole model
	handle.CFrame = gripPart.CFrame * CFrame.new(gripInfo.Offset)
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

-- Builds a rifle and puts it in the player's Backpack.
function SniperKit.Give(player: Player, rifleName: string, skinName: string?): Tool
	local tool = SniperKit.BuildTool(rifleName, skinName)
	tool.Parent = player:WaitForChild("Backpack")
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
