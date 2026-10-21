#!/usr/bin/env python3
"""Build every sniper asset.

    python3 roblox-snipers/tools/build.py

Writes (relative to roblox-snipers/):
    models/obj/<Name>.obj + .mtl   one object per part (Studio 3D Importer)
    models/glb/<Name>.glb          same parts as glTF nodes (Studio / Blender)
    templates/<Name>_uv.png        UV layout to paint a custom skin on
    textures/*.png                 pattern textures used by the camo skins
    previews/*.png                 renders of every rifle and every skin
    roblox/SniperData.lua          per-rifle factory colours, stats, attachments
    roblox/SkinCatalog.lua         every skin from skins.py

Needs Python 3 with numpy and Pillow.
"""

import json
import math
import os
import struct
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from lowpoly import SLOTS  # noqa: E402
from rifles import build_all  # noqa: E402
from skins import SKINS, TEXTURE_SLOTS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEX = 1024        # skin texture size the UV padding is tuned for
UV_PAD = 0.008    # ~8px gutter between UV islands at 1024


def out(*parts):
    path = os.path.join(ROOT, *parts)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    return path


def hex_rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def to_rbx(p):
    """Design (x, y, f) -> Roblox: turn 180 deg around Y so the muzzle faces -Z."""
    return np.array([-p[0], p[1], -p[2]])


# --------------------------------------------------------------------------
# meshes + UV atlas
# --------------------------------------------------------------------------

class PartMesh:
    def __init__(self, name, tris):
        self.name = name
        self.P = np.array([[to_rbx(p) for p in t] for t in tris])          # (N, 3, 3)
        n = np.cross(self.P[:, 1] - self.P[:, 0], self.P[:, 2] - self.P[:, 0])
        self.N = n / np.linalg.norm(n, axis=1, keepdims=True)
        self.lo = self.P.reshape(-1, 3).min(0)
        self.hi = self.P.reshape(-1, 3).max(0)
        self.center = (self.lo + self.hi) / 2
        self.zone = np.abs(self.N).argmax(1)   # 0: side (X), 1: top (Y), 2: front (Z)
        self.UV = np.zeros((len(self.P), 3, 2))

    def zone_coords(self, zone, pts):
        """Planar projection for a zone, in studs from the part's bbox corner."""
        X, Y, Z = pts[..., 0] - self.lo[0], pts[..., 1] - self.lo[1], self.hi[2] - pts[..., 2]
        if zone == 0:
            return np.stack([Z, Y], -1)
        if zone == 1:
            return np.stack([Z, X], -1)
        return np.stack([X, Y], -1)

    def zone_size(self, zone):
        L, H, W = self.hi[2] - self.lo[2], self.hi[1] - self.lo[1], self.hi[0] - self.lo[0]
        return [(L, H), (L, W), (W, H)][zone]


def shelf_pack(rects, s):
    order = sorted(range(len(rects)), key=lambda i: -rects[i][1])
    x = y = shelf = 0.0
    pos = {}
    for i in order:
        w, h = rects[i][0] * s + UV_PAD, rects[i][1] * s + UV_PAD
        if w > 1:
            return None
        if x + w > 1:
            x, y, shelf = 0.0, y + shelf, 0.0
        if y + h > 1:
            return None
        pos[i] = (x + UV_PAD / 2, y + UV_PAD / 2)
        x += w
        shelf = max(shelf, h)
    return pos


def build_atlas(meshes):
    """One shared UV atlas per rifle, so a skin is a single texture.

    Every face is projected flat (side / top / front) at the same studs-to-UV
    scale everywhere, which keeps pattern textures evenly sized across parts.
    """
    keys, rects = [], []
    for m in meshes:
        for z in sorted(set(m.zone.tolist())):
            keys.append((m, z))
            rects.append(m.zone_size(z))
    lo, hi = 0.0, 1.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if shelf_pack(rects, mid):
            lo = mid
        else:
            hi = mid
    pos = shelf_pack(rects, lo)
    for i, (m, z) in enumerate(keys):
        sel = m.zone == z
        m.UV[sel] = np.array(pos[i]) + m.zone_coords(z, m.P[sel]) * lo
    return lo, [(m.name, z, pos[i], rects[i]) for i, (m, z) in enumerate(keys)]


# --------------------------------------------------------------------------
# exporters
# --------------------------------------------------------------------------

def write_obj(rifle, meshes):
    name = rifle.key
    mtl = [f"# {name} materials (factory colours)"]
    lines = [f"# {name} - low-poly sniper for Roblox (cheapnerds roblox-snipers)",
             "# 1 unit = 1 stud, Y up, muzzle towards -Z. One object per skin slot.",
             f"mtllib {name}.mtl"]
    vi, ti, ni = {}, {}, {}
    body = []

    def idx(table, key, prefix):
        if key not in table:
            table[key] = len(table) + 1
            body.append(prefix + " " + " ".join(f"{c:.4f}" for c in key))
        return table[key]

    for m in meshes:
        hexc, mat = rifle.look_of(m.name)
        r, g, b = (c / 255 for c in hex_rgb(hexc))
        mtl += ["", f"newmtl {m.name}", f"Kd {r:.4f} {g:.4f} {b:.4f}", "Ka 0 0 0",
                f"Ks {0.4 if mat == 'Metal' else 0.05:.2f} {0.4 if mat == 'Metal' else 0.05:.2f} "
                f"{0.4 if mat == 'Metal' else 0.05:.2f}", "Ns 40", "d 1", "illum 2"]
        body += ["", f"o {m.name}", f"g {m.name}", f"usemtl {m.name}"]
        for t in range(len(m.P)):
            n = tuple(np.round(m.N[t], 4))
            k = idx(ni, n, "vn")
            face = []
            for c in range(3):
                v = idx(vi, tuple(np.round(m.P[t, c], 4)), "v")
                u = idx(ti, tuple(np.round(m.UV[t, c], 5)), "vt")
                face.append(f"{v}/{u}/{k}")
            body.append("f " + " ".join(face))
    with open(out("models", "obj", f"{name}.obj"), "w") as fh:
        fh.write("\n".join(lines + body) + "\n")
    with open(out("models", "obj", f"{name}.mtl"), "w") as fh:
        fh.write("\n".join(mtl) + "\n")


def srgb_to_linear(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def write_glb(rifle, meshes):
    blob = bytearray()
    views, accessors, gl_meshes, materials, nodes = [], [], [], [], []

    def view(data, target):
        while len(blob) % 4:
            blob.append(0)
        views.append({"buffer": 0, "byteOffset": len(blob), "byteLength": len(data), "target": target})
        blob.extend(data)
        return len(views) - 1

    def accessor(arr, ctype, kind, target, minmax=False):
        a = {"bufferView": view(arr.tobytes(), target), "componentType": ctype,
             "count": int(arr.shape[0]), "type": kind}
        if minmax:
            a["min"] = arr.min(0).tolist()
            a["max"] = arr.max(0).tolist()
        accessors.append(a)
        return len(accessors) - 1

    for m in meshes:
        pos = m.P.reshape(-1, 3).astype(np.float32)
        nrm = np.repeat(m.N, 3, axis=0).astype(np.float32)
        uv = m.UV.reshape(-1, 2).astype(np.float32).copy()
        uv[:, 1] = 1 - uv[:, 1]
        ind = np.arange(len(pos), dtype=np.uint32)
        hexc, mat = rifle.look_of(m.name)
        rgb = [srgb_to_linear(c) for c in hex_rgb(hexc)]
        material = {"name": m.name, "pbrMetallicRoughness": {
            "baseColorFactor": rgb + [1.0],
            "metallicFactor": 0.7 if mat in ("Metal", "Foil", "CorrodedMetal", "DiamondPlate") else 0.0,
            "roughnessFactor": 0.45 if mat in ("Metal", "Foil", "Glass") else 0.8}}
        if mat == "Neon":
            material["emissiveFactor"] = rgb
        materials.append(material)
        gl_meshes.append({"name": m.name, "primitives": [{
            "attributes": {"POSITION": accessor(pos, 5126, "VEC3", 34962, True),
                           "NORMAL": accessor(nrm, 5126, "VEC3", 34962),
                           "TEXCOORD_0": accessor(uv, 5126, "VEC2", 34962)},
            "indices": accessor(ind, 5125, "SCALAR", 34963),
            "material": len(materials) - 1}]})
        nodes.append({"name": m.name, "mesh": len(gl_meshes) - 1})
    nodes.append({"name": rifle.key, "children": list(range(len(meshes)))})
    gltf = {"asset": {"version": "2.0", "generator": "cheapnerds roblox-snipers"},
            "scene": 0, "scenes": [{"name": rifle.key, "nodes": [len(nodes) - 1]}],
            "nodes": nodes, "meshes": gl_meshes, "materials": materials,
            "accessors": accessors, "bufferViews": views, "buffers": [{"byteLength": 0}]}
    while len(blob) % 4:
        blob.append(0)
    gltf["buffers"][0]["byteLength"] = len(blob)
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    total = 12 + 8 + len(js) + 8 + len(blob)
    with open(out("models", "glb", f"{rifle.key}.glb"), "wb") as fh:
        fh.write(struct.pack("<4sII", b"glTF", 2, total))
        fh.write(struct.pack("<I4s", len(js), b"JSON") + js)
        fh.write(struct.pack("<I4s", len(blob), b"BIN\0") + bytes(blob))


# --------------------------------------------------------------------------
# Luau data
# --------------------------------------------------------------------------

def lua_str(s):
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def lua_color(hexc):
    r, g, b = hex_rgb(hexc)
    return f"Color3.fromRGB({r}, {g}, {b})"


def lua_vec(v):
    return "Vector3.new(" + ", ".join(f"{c + 0.0:.3f}".replace("-0.000", "0.000") for c in v) + ")"


def write_sniper_data(rifles, meshes_by_key, atlas_scale):
    L = ["-- GENERATED by roblox-snipers/tools/build.py. Edit rifles.py and rebuild, don't hand-edit.",
         "--",
         "-- Per-rifle data: factory look (the default skin), arena stats, and attachment",
         "-- points. Attachment offsets are relative to the named MeshPart's centre, in",
         "-- the rifle's own space (muzzle towards -Z, shooter's right towards +X).",
         "",
         "local SniperData = {}", "",
         "SniperData.Order = {" + ", ".join(lua_str(r.key) for r in rifles) + "}", ""]
    for r in rifles:
        meshes = {m.name: m for m in meshes_by_key[r.key]}
        L.append(f"SniperData[{lua_str(r.key)}] = {{")
        L.append(f"\tDisplayName = {lua_str(r.key)},")
        L.append(f"\tDescription = {lua_str(r.blurb)},")
        L.append("\tParts = {" + ", ".join(lua_str(n) for n in meshes) + "},")
        L.append(f"\tStudsPerUV = {1 / atlas_scale[r.key]:.3f}, -- skin texture covers this many studs")
        L.append("\tStats = {")
        for k, v in r.stats.items():
            L.append(f"\t\t{k} = {v},")
        L.append("\t},")
        L.append("\tFactory = {")
        for n in meshes:
            hexc, mat = r.look_of(n)
            L.append(f"\t\t{n} = {{ Color = {lua_color(hexc)}, Material = Enum.Material.{mat} }},")
        L.append("\t},")
        L.append("\tAttachments = {")
        for att in ("Muzzle", "Aim", "Grip"):
            part, p = r.att[att]
            off = to_rbx(p) - meshes[part].center
            L.append(f"\t\t{att} = {{ Part = {lua_str(part)}, Offset = {lua_vec(off)} }},")
        L.append("\t},")
        L.append("}")
        L.append("")
    L.append("return SniperData")
    with open(out("roblox", "SniperData.lua"), "w") as fh:
        fh.write("\n".join(L) + "\n")


def write_skin_catalog():
    L = ["-- GENERATED by roblox-snipers/tools/build.py from tools/skins.py.",
         "-- Add your own skins at runtime with SniperSkins.Register(name, definition)",
         "-- (same shape as below) instead of editing this file.",
         "--",
         "-- Default covers every part the skin doesn't list. Texture names point into",
         "-- TextureIds.lua; TextureSlots lists the parts that wear the texture.",
         "",
         "local SkinCatalog = {}", "",
         "SkinCatalog.TextureSlots = {" + ", ".join(lua_str(s) for s in TEXTURE_SLOTS) + "}", "",
         "SkinCatalog.Order = {" + ", ".join(lua_str(k) for k in ["Factory"] + list(SKINS)) + "}", "",
         "SkinCatalog.Skins = {"]
    for name, skin in SKINS.items():
        L.append(f"\t[{lua_str(name)}] = {{")
        for slot, look in skin.items():
            fields = [f"Color = {lua_color(look[0])}", f"Material = Enum.Material.{look[1]}"]
            if len(look) > 2:
                fields.append(f"Texture = {lua_str(look[2])}")
            L.append(f"\t\t{slot} = {{ {', '.join(fields)} }},")
        L.append("\t},")
    L.append("}")
    L.append("")
    L.append("return SkinCatalog")
    with open(out("roblox", "SkinCatalog.lua"), "w") as fh:
        fh.write("\n".join(L) + "\n")


# --------------------------------------------------------------------------
# pattern textures
# --------------------------------------------------------------------------

def noise(rng, size, cells):
    g = (rng.random((cells, cells)) * 255).astype(np.uint8)
    return np.asarray(Image.fromarray(g).resize((size, size), Image.BICUBIC), float) / 255


def fbm(rng, size, cells, octaves=3):
    total, amp, norm = 0, 1.0, 0
    for o in range(octaves):
        total = total + amp * noise(rng, size, cells * 2 ** o)
        norm += amp
        amp *= 0.5
    return total / norm


def layered_camo(rng, size, cells, colors, cover=(0.45, 0.4, 0.3)):
    img = np.zeros((size, size, 3))
    img[:] = hex_rgb(colors[0])
    for col, c in zip(colors[1:], cover):
        n = fbm(rng, size, cells)
        img[n > np.quantile(n, 1 - c)] = hex_rgb(col)
    return img


def make_textures():
    rng = np.random.default_rng(7)
    S = TEX
    tex = {}
    tex["camo_woodland"] = layered_camo(rng, S, 7, ["4b5320", "6b7a3a", "3b2f20", "171713"])
    tex["camo_desert"] = layered_camo(rng, S, 6, ["d8c39a", "c2a878", "a0825a", "7d6446"])
    tex["camo_arctic"] = layered_camo(rng, S, 7, ["e9eef2", "c5ced6", "8a96a3", "3f4852"], (0.4, 0.3, 0.15))
    small = layered_camo(rng, 64, 5, ["5b6168", "8a9097", "3a3f45", "c3c7cc"])
    tex["camo_digital"] = np.asarray(Image.fromarray(small.astype(np.uint8)).resize((S, S), Image.NEAREST), float)

    yy, xx = np.mgrid[0:S, 0:S] / S
    warp = fbm(rng, S, 5) * 2.2
    stripes = np.sin((xx * 9 + warp) * math.pi * 2) + (fbm(rng, S, 9) - 0.5) * 1.2
    base = np.stack([240 - yy * 30, 138 - yy * 30, 28 + yy * 0], -1)
    tex["tiger"] = np.where((stripes > 0.75)[..., None], np.array(hex_rgb("161210")), base)

    cell = 24
    ci, cj = (np.mgrid[0:S, 0:S] // cell)
    fi, fj = (np.mgrid[0:S, 0:S] % cell) / cell
    horizontal = ((ci + cj) % 2) == 0
    shade = np.where(horizontal, 0.55 + 0.45 * np.sin(fi * math.pi), 0.55 + 0.45 * np.sin(fj * math.pi))
    shade = shade * np.where(horizontal, 1.0, 0.8)
    tex["carbon"] = np.stack([22 + 40 * shade, 23 + 42 * shade, 26 + 46 * shade], -1)

    neb = fbm(rng, S, 4, 4)
    neb2 = fbm(rng, S, 6, 3)
    gal = np.stack([20 + 120 * neb ** 2.2 + 60 * neb2 ** 3, 10 + 30 * neb ** 2, 45 + 150 * neb ** 1.8], -1)
    stars = rng.random((S, S)) > 0.9985
    gal[stars] = 255
    tex["galaxy"] = np.clip(gal, 0, 255)

    n = fbm(rng, S, 6, 4)
    crack = np.clip(1 - np.abs(n - 0.5) / 0.035, 0, 1)
    glow = np.clip(1 - np.abs(n - 0.5) / 0.12, 0, 1) ** 2
    lava = np.stack([26 + 229 * np.maximum(crack, glow * 0.6), 13 + 160 * crack + 40 * glow, 8 + 30 * crack], -1)
    tex["lava"] = np.clip(lava, 0, 255)

    for name, arr in tex.items():
        img = Image.fromarray(arr.astype(np.uint8))
        if name.startswith("camo_"):
            img = img.quantize(colors=4, dither=Image.Dither.NONE)
        img.save(out("textures", f"{name}.png"), optimize=True)
    return {k: v.astype(np.uint8) for k, v in tex.items()}


# --------------------------------------------------------------------------
# preview renderer (orthographic, z-buffered, flat shaded)
# --------------------------------------------------------------------------

CAM = np.array([0.75, 0.42, -0.22])   # direction towards the camera, Roblox space
CAM /= np.linalg.norm(CAM)
LIGHT = np.array([0.45, 1.0, 0.35])
LIGHT /= np.linalg.norm(LIGHT)
_VIEW = -CAM
_RIGHT = np.cross(_VIEW, [0, 1, 0])
_RIGHT /= np.linalg.norm(_RIGHT)
_UP = np.cross(_RIGHT, _VIEW)


def project(P):
    return np.stack([P @ _RIGHT, P @ _UP, P @ _VIEW], -1)


def resolve_look(rifle, part, skin):
    """(rgb, material, texture name or None) for a part under a skin."""
    if skin is None:
        hexc, mat = rifle.look_of(part)
        return hex_rgb(hexc), mat, None
    look = skin.get(part) or skin["Default"]
    tex = look[2] if len(look) > 2 and (part in skin or part in TEXTURE_SLOTS) else None
    if part not in skin and part in ("Lens", "Accent"):
        hexc, mat = rifle.look_of(part)
        return hex_rgb(hexc), mat, None
    return hex_rgb(look[0]), look[1], tex


def render(rifle, meshes, W, H, scale=None, skin=None, textures=None, ss=2, bg=(233, 237, 242)):
    Ws, Hs = W * ss, H * ss
    allP = np.concatenate([m.P.reshape(-1, 3) for m in meshes])
    pr = project(allP)
    mn, mx = pr[:, :2].min(0), pr[:, :2].max(0)
    if scale is None:
        scale = min(W * 0.9 / (mx[0] - mn[0]), H * 0.82 / (mx[1] - mn[1]))
    scale *= ss
    mid = (mn + mx) / 2
    img = np.zeros((Hs, Ws, 3))
    img[:] = bg
    zb = np.full((Hs, Ws), np.inf)
    nb = np.zeros((Hs, Ws, 3))
    for m in meshes:
        rgb, mat, texname = resolve_look(rifle, m.name, skin)
        tex = textures.get(texname) if (textures is not None and texname) else None
        sp = project(m.P.reshape(-1, 3)).reshape(-1, 3, 3)
        sx = (sp[..., 0] - mid[0]) * scale + Ws / 2
        sy = Hs / 2 - (sp[..., 1] - mid[1]) * scale
        sz = sp[..., 2]
        facing = m.N @ CAM
        lam = np.maximum(0, m.N @ LIGHT)
        for t in np.nonzero(facing > 1e-4)[0]:
            if mat == "Neon":
                shade = 1.0
            else:
                shade = 0.32 + 0.55 * lam[t] + 0.18 * facing[t]
            ax, bx, cx = sx[t]
            ay, by, cy = sy[t]
            x0, x1 = max(int(min(ax, bx, cx)), 0), min(int(max(ax, bx, cx)) + 1, Ws - 1)
            y0, y1 = max(int(min(ay, by, cy)), 0), min(int(max(ay, by, cy)) + 1, Hs - 1)
            if x0 > x1 or y0 > y1:
                continue
            px, py = np.meshgrid(np.arange(x0, x1 + 1) + 0.5, np.arange(y0, y1 + 1) + 0.5)
            d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
            if abs(d) < 1e-9:
                continue
            w0 = ((by - cy) * (px - cx) + (cx - bx) * (py - cy)) / d
            w1 = ((cy - ay) * (px - cx) + (ax - cx) * (py - cy)) / d
            w2 = 1 - w0 - w1
            inside = (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6)
            z = w0 * sz[t, 0] + w1 * sz[t, 1] + w2 * sz[t, 2]
            sub = zb[y0:y1 + 1, x0:x1 + 1]
            hit = inside & (z < sub)
            if not hit.any():
                continue
            sub[hit] = z[hit]
            if tex is not None:
                uv = (w0[..., None] * m.UV[t, 0] + w1[..., None] * m.UV[t, 1] + w2[..., None] * m.UV[t, 2])
                tu = np.clip((uv[..., 0] * tex.shape[1]).astype(int), 0, tex.shape[1] - 1)
                tv = np.clip(((1 - uv[..., 1]) * tex.shape[0]).astype(int), 0, tex.shape[0] - 1)
                col = tex[tv, tu].astype(float) * shade
                img[y0:y1 + 1, x0:x1 + 1][hit] = col[hit]
            else:
                img[y0:y1 + 1, x0:x1 + 1][hit] = np.array(rgb, float) * shade
            nb[y0:y1 + 1, x0:x1 + 1][hit] = m.N[t]
    # outlines: silhouette / depth steps dark, creases subtle
    filled = np.isfinite(zb)
    zf = np.where(filled, zb, 1e9)
    edge = np.zeros((Hs, Ws), bool)
    crease = np.zeros((Hs, Ws), bool)
    for dy, dx in ((0, 1), (1, 0)):
        a = (slice(0, Hs - dy), slice(0, Ws - dx))
        b = (slice(dy, Hs), slice(dx, Ws))
        e = (filled[a] != filled[b]) | (np.abs(zf[a] - zf[b]) > 0.12)
        c = (filled[a] & filled[b]) & ((nb[a] * nb[b]).sum(-1) < 0.8)
        edge[a] |= e
        edge[b] |= e
        crease[a] |= c
    img[crease & ~edge] *= 0.78
    img[edge] = (28, 26, 34)
    out_img = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    return out_img.resize((W, H), Image.LANCZOS)


def font(size):
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


# --------------------------------------------------------------------------
# UV templates
# --------------------------------------------------------------------------

TEMPLATE_TINTS = {
    "Body": "f2c94c", "Stock": "f2994a", "Pad": "bb6bd9", "Grip": "eb5757", "Barrel": "56ccf2",
    "Handguard": "2f80ed", "Muzzle": "9b51e0", "Scope": "27ae60", "Lens": "a6f4ff", "Mount": "6fcf97",
    "Magazine": "f264b5", "Bolt": "bdbdbd", "Trigger": "828282", "Bipod": "c9a46a", "Accent": "ffe066",
}


def write_template(rifle, meshes, layout, scale):
    S = TEX
    img = Image.new("RGB", (S, S), (40, 42, 48))
    dr = ImageDraw.Draw(img)
    zone_names = ["side", "top", "front"]
    for m in meshes:
        tint = hex_rgb(TEMPLATE_TINTS[m.name])
        fill = tuple(int(c * 0.55 + 40 * 0.45) for c in tint)
        for t in range(len(m.UV)):
            pts = [(u * S, (1 - v) * S) for u, v in m.UV[t]]
            dr.polygon(pts, fill=fill)
        for t in range(len(m.UV)):
            pts = [(u * S, (1 - v) * S) for u, v in m.UV[t]]
            dr.polygon(pts, outline=tint)
    f = font(14)
    for part, zone, (u, v), (w, h) in layout:
        label = f"{part} {zone_names[zone]}"
        if dr.textlength(label, font=f) + 6 > w * scale * S:
            continue  # too small to label; the tint still says which part it is
        x, y = u * S + 3, (1 - v) * S - 18
        dr.text((x, y), label, fill=(255, 255, 255), font=f, stroke_width=2, stroke_fill=(20, 20, 24))
    img.save(out("templates", f"{rifle.key}_uv.png"), optimize=True)


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def main():
    rifles = build_all()
    meshes_by_key, atlas_scale = {}, {}
    print(f"{'rifle':10} {'parts':>5} {'tris':>6} {'length':>7}")
    for r in rifles:
        meshes = [PartMesh(n, r.parts[n]) for n in SLOTS if n in r.parts]
        scale, layout = build_atlas(meshes)
        meshes_by_key[r.key] = meshes
        atlas_scale[r.key] = scale
        write_obj(r, meshes)
        write_glb(r, meshes)
        write_template(r, meshes, layout, scale)
        lo = np.min([m.lo for m in meshes], 0)
        hi = np.max([m.hi for m in meshes], 0)
        print(f"{r.key:10} {len(meshes):5d} {sum(len(m.P) for m in meshes):6d} {hi[2] - lo[2]:6.2f}s")
    write_sniper_data(rifles, meshes_by_key, atlas_scale)
    write_skin_catalog()
    textures = make_textures()

    # contact sheet at one shared scale so sizes compare honestly
    cols, tw, th = 4, 620, 300
    longest = 0
    for r in rifles:
        pr = project(np.concatenate([m.P.reshape(-1, 3) for m in meshes_by_key[r.key]]))
        longest = max(longest, (pr[:, 0].max() - pr[:, 0].min()))
    shared = tw * 0.9 / longest
    rows = math.ceil(len(rifles) / cols)
    sheet = Image.new("RGB", (cols * tw, rows * th + 70), (233, 237, 242))
    dr = ImageDraw.Draw(sheet)
    dr.text((24, 18), "20 low-poly snipers  -  factory skins, shared scale", fill=(30, 30, 38), font=font(32))
    for i, r in enumerate(rifles):
        tile = render(r, meshes_by_key[r.key], tw, th, scale=shared)
        x, y = (i % cols) * tw, (i // cols) * th + 70
        sheet.paste(tile, (x, y))
        dr.text((x + 16, y + 10), f"{i + 1:02d}  {r.key}", fill=(30, 30, 38), font=font(26))
        s = r.stats
        dr.text((x + 16, y + th - 30), f"DMG {s['Damage']}  x{s['HeadshotMultiplier']} HS  MAG {s['MagSize']}  "
                f"{s['FireDelay']}s", fill=(80, 84, 96), font=font(17))
        render(r, meshes_by_key[r.key], 1200, 520).save(out("previews", f"{r.key}.png"), optimize=True)
    sheet.save(out("previews", "all_snipers.png"), optimize=True)

    # every skin on one rifle
    showcase = next(r for r in rifles if r.key == "Raptor")
    names = ["Factory"] + list(SKINS)
    cols, tw, th = 4, 520, 240
    rows = math.ceil(len(names) / cols)
    sheet = Image.new("RGB", (cols * tw, rows * th + 70), (233, 237, 242))
    dr = ImageDraw.Draw(sheet)
    dr.text((24, 18), f"Skins on the {showcase.key} - every skin fits every rifle", fill=(30, 30, 38),
            font=font(30))
    for i, name in enumerate(names):
        tile = render(showcase, meshes_by_key[showcase.key], tw, th,
                      skin=None if name == "Factory" else SKINS[name], textures=textures)
        x, y = (i % cols) * tw, (i // cols) * th + 70
        sheet.paste(tile, (x, y))
        dr.text((x + 14, y + 8), name, fill=(30, 30, 38), font=font(24))
    sheet.save(out("previews", "skins_showcase.png"), optimize=True)

    # a few rifles in a couple of pattern skins
    picks = ["Goliath", "Hawkeye", "Pulse", "Cobra", "Glacier", "Phantom"]
    skin_names = ["Woodland", "Tiger", "Galaxy"]
    tw, th = 520, 240
    sheet = Image.new("RGB", (len(skin_names) * tw, len(picks) * th + 70), (233, 237, 242))
    dr = ImageDraw.Draw(sheet)
    dr.text((24, 18), "Pattern skins use each rifle's UV atlas", fill=(30, 30, 38), font=font(30))
    for j, key in enumerate(picks):
        r = next(x for x in rifles if x.key == key)
        for i, name in enumerate(skin_names):
            tile = render(r, meshes_by_key[key], tw, th, skin=SKINS[name], textures=textures)
            sheet.paste(tile, (i * tw, j * th + 70))
            dr.text((i * tw + 14, j * th + 78), f"{key} / {name}", fill=(30, 30, 38), font=font(22))
    sheet.save(out("previews", "pattern_skins.png"), optimize=True)
    print("done ->", ROOT)


if __name__ == "__main__":
    main()
