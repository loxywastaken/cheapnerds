"""Skin catalogue. Single source for roblox/SkinCatalog.lua and the preview renders.

A skin maps slot (part) names to (hex colour, Roblox material[, texture]).
"Default" covers every slot the skin doesn't list. A texture name refers to
a PNG in textures/; upload it to Roblox and paste its asset id into
roblox/TextureIds.lua. Lens and Accent keep their glow unless a skin
overrides them.
"""

# slots that take a skin's pattern texture when the skin has one
TEXTURE_SLOTS = ["Body", "Stock", "Handguard", "Grip", "Magazine", "Scope", "Pad"]

SKINS = {
    "Midnight": {
        "Default": ("17171d", "SmoothPlastic"),
        "Barrel": ("0e0e12", "Metal"), "Muzzle": ("0e0e12", "Metal"),
        "Lens": ("7a5cff", "Neon"), "Accent": ("7a5cff", "Neon"),
    },
    "Gold Rush": {
        "Default": ("d4af37", "Foil"),
        "Barrel": ("b8912a", "Metal"), "Pad": ("2b1d0e", "Fabric"), "Grip": ("2b1d0e", "SmoothPlastic"),
        "Lens": ("ffe9a8", "Glass"), "Accent": ("fff2c0", "Neon"),
    },
    "Chrome": {
        "Default": ("d9dde3", "Foil"),
        "Pad": ("2a2d33", "Fabric"), "Grip": ("2a2d33", "SmoothPlastic"),
        "Lens": ("8fe3ff", "Glass"), "Accent": ("8fe3ff", "Neon"),
    },
    "Ruby": {
        "Default": ("9b111e", "SmoothPlastic"),
        "Barrel": ("2a0a0e", "Metal"), "Muzzle": ("2a0a0e", "Metal"), "Bolt": ("e8e8e8", "Metal"),
        "Pad": ("1a0508", "Fabric"), "Lens": ("ff5a6e", "Glass"), "Accent": ("ff2a44", "Neon"),
    },
    "Toxic": {
        "Default": ("1c1f1a", "SmoothPlastic"),
        "Stock": ("7cff2a", "SmoothPlastic"), "Magazine": ("7cff2a", "SmoothPlastic"),
        "Lens": ("7cff2a", "Neon"), "Accent": ("7cff2a", "Neon"),
    },
    "Bubblegum": {
        "Default": ("ff8fc8", "SmoothPlastic"),
        "Barrel": ("8fd8ff", "SmoothPlastic"), "Muzzle": ("8fd8ff", "SmoothPlastic"),
        "Scope": ("fff1a8", "SmoothPlastic"), "Pad": ("ffffff", "SmoothPlastic"),
        "Lens": ("ffffff", "Glass"), "Accent": ("ffffff", "Neon"),
    },
    "Cyber": {
        "Default": ("101225", "SmoothPlastic"),
        "Barrel": ("00e5ff", "Neon"), "Bolt": ("ff2bd6", "Neon"), "Trigger": ("ff2bd6", "Neon"),
        "Lens": ("00e5ff", "Neon"), "Accent": ("ff2bd6", "Neon"), "Mount": ("00e5ff", "Neon"),
    },
    "Ice": {
        "Default": ("bfe9ff", "Ice"),
        "Barrel": ("e8f7ff", "Glass"), "Pad": ("6aa8c8", "Fabric"),
        "Lens": ("ffffff", "Neon"), "Accent": ("ffffff", "Neon"),
    },
    "Inferno": {
        "Default": ("2a0f08", "Slate"),
        "Stock": ("ff5a00", "SmoothPlastic"), "Barrel": ("ff8a00", "Neon"),
        "Lens": ("ffb000", "Neon"), "Accent": ("ff5a00", "Neon"),
    },
    "Royal Purple": {
        "Default": ("4b1f7a", "SmoothPlastic"),
        "Barrel": ("d4af37", "Metal"), "Muzzle": ("d4af37", "Metal"), "Bolt": ("d4af37", "Metal"),
        "Trigger": ("d4af37", "Metal"), "Mount": ("d4af37", "Metal"),
        "Lens": ("e6c3ff", "Glass"), "Accent": ("d4af37", "Neon"),
    },
    "Bone": {
        "Default": ("e8dfc8", "Marble"),
        "Barrel": ("3a3530", "Metal"), "Muzzle": ("3a3530", "Metal"), "Pad": ("3a3530", "Fabric"),
        "Lens": ("c8ffd8", "Glass"), "Accent": ("c8ffd8", "Neon"),
    },
    "Military": {
        "Default": ("4b5320", "SmoothPlastic"),
        "Barrel": ("2a2a26", "Metal"), "Muzzle": ("2a2a26", "Metal"), "Pad": ("2a2a26", "Fabric"),
        "Lens": ("9fd8ff", "Glass"), "Accent": ("c8b560", "SmoothPlastic"),
    },
    # pattern skins (texture tiles over the main body parts)
    "Woodland": {
        "Default": ("4b5320", "Fabric", "camo_woodland"),
        "Barrel": ("2a2a26", "Metal"), "Muzzle": ("2a2a26", "Metal"), "Bolt": ("3a3a36", "Metal"),
        "Lens": ("9fd8ff", "Glass"), "Accent": ("4b5320", "SmoothPlastic"),
    },
    "Desert": {
        "Default": ("c2a878", "Fabric", "camo_desert"),
        "Barrel": ("3a3530", "Metal"), "Muzzle": ("3a3530", "Metal"),
        "Lens": ("ffd59a", "Glass"), "Accent": ("a0825a", "SmoothPlastic"),
    },
    "Arctic": {
        "Default": ("e9eef2", "Fabric", "camo_arctic"),
        "Barrel": ("3f4852", "Metal"), "Muzzle": ("3f4852", "Metal"),
        "Lens": ("bfe9ff", "Glass"), "Accent": ("bfe9ff", "Neon"),
    },
    "Urban Digital": {
        "Default": ("5b6168", "SmoothPlastic", "camo_digital"),
        "Barrel": ("2a2d31", "Metal"), "Muzzle": ("2a2d31", "Metal"),
        "Lens": ("9fd8ff", "Glass"), "Accent": ("c3c7cc", "SmoothPlastic"),
    },
    "Tiger": {
        "Default": ("f08a1c", "SmoothPlastic", "tiger"),
        "Barrel": ("1a1a1a", "Metal"), "Muzzle": ("1a1a1a", "Metal"),
        "Lens": ("ffcf6e", "Glass"), "Accent": ("ffcf6e", "Neon"),
    },
    "Carbon": {
        "Default": ("26282c", "SmoothPlastic", "carbon"),
        "Barrel": ("1a1b1e", "Metal"), "Bolt": ("d9363e", "Metal"), "Trigger": ("d9363e", "Metal"),
        "Lens": ("ff6a6a", "Glass"), "Accent": ("d9363e", "Neon"),
    },
    "Galaxy": {
        "Default": ("1b1035", "SmoothPlastic", "galaxy"),
        "Barrel": ("c0c4d6", "Metal"), "Muzzle": ("c0c4d6", "Metal"),
        "Lens": ("ff7af0", "Neon"), "Accent": ("7af0ff", "Neon"),
    },
    "Lava": {
        "Default": ("1a0d08", "Basalt", "lava"),
        "Barrel": ("ff6a00", "Neon"), "Muzzle": ("2a1208", "Metal"),
        "Lens": ("ffb000", "Neon"), "Accent": ("ff6a00", "Neon"),
    },
}
