--!strict
-- SniperSkins (ModuleScript inside the SniperSystem folder, next to
-- SniperData, SkinCatalog and TextureIds).
--
-- Every rifle is built from MeshParts named after the same 15 slots
-- (Body, Stock, Pad, Grip, Barrel, Handguard, Muzzle, Scope, Lens, Mount,
-- Magazine, Bolt, Trigger, Bipod, Accent). A skin is just a look per slot,
-- so every skin fits every rifle.
--
--   SniperSkins.Apply(model, "Gold Rush")       -- colour skin
--   SniperSkins.Apply(model, "Woodland")        -- pattern skin (needs TextureIds)
--   SniperSkins.Apply(model, "Factory")         -- back to the rifle's own colours
--
-- Your own skins:
--   SniperSkins.Register("Dragon", {
--       Default = { Color = Color3.fromRGB(30, 10, 10), Material = Enum.Material.SmoothPlastic },
--       Barrel  = { Color = Color3.fromRGB(255, 80, 0), Material = Enum.Material.Neon },
--       -- optional: a texture painted on templates/<Rifle>_uv.png, per rifle
--       Atlas   = { Raptor = "rbxassetid://123456" },
--   })

local root = script.Parent
local SniperData = require(root:WaitForChild("SniperData"))
local SkinCatalog = require(root:WaitForChild("SkinCatalog"))
local TextureIds = require(root:WaitForChild("TextureIds"))

export type Look = { Color: Color3, Material: Enum.Material, Texture: string? }

local SniperSkins = {}

SniperSkins.Slots = {
	"Body", "Stock", "Pad", "Grip", "Barrel", "Handguard", "Muzzle", "Scope",
	"Lens", "Mount", "Magazine", "Bolt", "Trigger", "Bipod", "Accent",
}

-- Lens and Accent keep the rifle's factory glow unless a skin sets them.
local KEEP_FACTORY = { Lens = true, Accent = true }

local skins: { [string]: any } = table.clone(SkinCatalog.Skins)
local order: { string } = table.clone(SkinCatalog.Order)
local warned: { [string]: boolean } = {}

function SniperSkins.Register(name: string, skin: { [string]: any })
	assert(skin.Default or skin.Atlas, "a skin needs a Default look or an Atlas")
	if not skins[name] then
		table.insert(order, name)
	end
	skins[name] = skin
end

function SniperSkins.Get(name: string)
	return skins[name]
end

-- Skin names in display order ("Factory" first).
function SniperSkins.List(): { string }
	return table.clone(order)
end

-- Which slot a part fills. Accepts "Body", and importer names like
-- "Hawkeye_Body" or "Body.001". A "Slot" attribute wins over the name.
function SniperSkins.SlotOf(part: Instance): string?
	local tagged = part:GetAttribute("Slot")
	if typeof(tagged) == "string" then
		return tagged
	end
	for word in part.Name:gmatch("%a+") do
		if table.find(SniperSkins.Slots, word) then
			return word
		end
	end
	return nil
end

local function textureId(name: string?): string?
	if not name then
		return nil
	end
	-- a texture is either a name from TextureIds or an asset id used directly
	local id = if name:find("://") then name else TextureIds[name]
	if id == nil or id == "" or id == "rbxassetid://0" then
		if not warned[name] then
			warned[name] = true
			warn(`[SniperSkins] no asset id for texture "{name}" yet; set it in TextureIds`)
		end
		return nil
	end
	return id
end

local function rifleNameOf(model: Instance): string
	local attr = model:GetAttribute("Sniper")
	return if typeof(attr) == "string" then attr else model.Name
end

-- Applies a skin to every slot part under `model` (a Model or a Tool).
function SniperSkins.Apply(model: Instance, skinName: string, rifleName: string?)
	local rifle = rifleName or rifleNameOf(model)
	local data = SniperData[rifle]
	local skin = if skinName == "Factory" then nil else skins[skinName]
	if skinName ~= "Factory" and not skin then
		warn(`[SniperSkins] unknown skin "{skinName}"`)
		return
	end
	local atlas = skin and skin.Atlas and textureId(skin.Atlas[rifle]) or nil

	for _, part in model:GetDescendants() do
		if not part:IsA("BasePart") then
			continue
		end
		local slot = SniperSkins.SlotOf(part)
		if not slot then
			continue
		end
		local factory: Look? = data and data.Factory[slot] or nil
		local look: Look? = factory
		local texture: string? = nil
		if skin then
			local own = skin[slot]
			if own then
				look = own
			elseif not (KEEP_FACTORY[slot] and factory) then
				look = skin.Default or factory
			end
			if atlas then
				texture = atlas
			elseif look and look.Texture and (own or table.find(SkinCatalog.TextureSlots, slot)) then
				texture = textureId(look.Texture)
			end
		end
		if look then
			part.Color = look.Color
			part.Material = look.Material
		end
		if part:IsA("MeshPart") then
			part.TextureID = texture or ""
		end
	end
	model:SetAttribute("Sniper", rifle)
	model:SetAttribute("Skin", skinName)
end

return SniperSkins
