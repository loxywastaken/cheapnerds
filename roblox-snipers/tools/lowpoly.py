"""Low-poly geometry kit used to build the sniper rifles.

Design space (what the rifle files use):
    f  = forward (towards the muzzle)
    y  = up (the bore line sits at y = 0 unless a rifle says otherwise)
    x  = sideways; the shooter's RIGHT side is -x, LEFT side is +x

Every helper returns a list of triangles (a, b, c) with outward winding.
Points are numpy arrays laid out as (x, y, f). On export the rifle is
turned 180 degrees around Y so the muzzle points down Roblox's -Z
(LookVector) and the shooter's right becomes Roblox +X.
"""

import math

import numpy as np

# One mesh part per slot. Part names ARE the skin slots: a skin recolours or
# retextures every part that shares a name, on every rifle.
SLOTS = [
    "Body", "Stock", "Pad", "Grip", "Barrel", "Handguard", "Muzzle", "Scope",
    "Lens", "Mount", "Magazine", "Bolt", "Trigger", "Bipod", "Accent",
]

# Fallback factory look per slot: (hex colour, Roblox Enum.Material name).
DEFAULT_LOOK = {
    "Body": ("2b2b2e", "Metal"),
    "Stock": ("3a3a3e", "SmoothPlastic"),
    "Pad": ("151515", "Fabric"),
    "Grip": ("1f1f22", "SmoothPlastic"),
    "Barrel": ("252528", "Metal"),
    "Handguard": ("2f2f33", "Metal"),
    "Muzzle": ("222225", "Metal"),
    "Scope": ("1d1d20", "Metal"),
    "Lens": ("6fd3ff", "Glass"),
    "Mount": ("333336", "Metal"),
    "Magazine": ("2a2a2d", "Metal"),
    "Bolt": ("b8bcc4", "Metal"),
    "Trigger": ("1c1c1f", "Metal"),
    "Bipod": ("303034", "Metal"),
    "Accent": ("ffcc33", "Neon"),
}


def V(f, y, x=0.0):
    return np.array([x, y, f], dtype=float)


# --------------------------------------------------------------------------
# triangle plumbing
# --------------------------------------------------------------------------

def _tri(a, b, c, out):
    n = np.cross(b - a, c - a)
    if np.linalg.norm(n) < 1e-9:
        return []
    if np.dot(n, out) < 0:
        return [(a, c, b)]
    return [(a, b, c)]


def _fan(pts, out):
    tris = []
    for i in range(1, len(pts) - 1):
        tris += _tri(pts[0], pts[i], pts[i + 1], out)
    return tris


def _convex(faces):
    """Faces of a convex solid; outward = away from the solid's centroid."""
    cen = np.mean([p for face in faces for p in face], axis=0)
    tris = []
    for face in faces:
        tris += _fan(face, np.mean(face, axis=0) - cen)
    return tris


def _area2(pts):
    n = len(pts)
    return sum(pts[i][0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * pts[i][1] for i in range(n))


def _in_tri(p, a, b, c):
    def s(p1, p2, p3):
        return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1])

    d1, d2, d3 = s(p, a, b), s(p, b, c), s(p, c, a)
    neg = d1 < -1e-12 or d2 < -1e-12 or d3 < -1e-12
    pos = d1 > 1e-12 or d2 > 1e-12 or d3 > 1e-12
    return not (neg and pos)


def earclip(pts):
    """Triangulate a simple (possibly concave) 2D polygon."""
    idx = list(range(len(pts)))
    if _area2(pts) < 0:
        idx.reverse()
    out = []
    while len(idx) > 3:
        m = len(idx)
        for k in range(m):
            i0, i1, i2 = idx[k - 1], idx[k], idx[(k + 1) % m]
            a, b, c = pts[i0], pts[i1], pts[i2]
            if (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) <= 1e-12:
                continue
            if any(_in_tri(pts[j], a, b, c) for j in idx if j not in (i0, i1, i2)):
                continue
            out.append((i0, i1, i2))
            idx.pop(k)
            break
        else:  # degenerate leftovers: clip anyway
            out.append((idx[-1], idx[0], idx[1]))
            idx.pop(0)
    out.append(tuple(idx))
    return out


# --------------------------------------------------------------------------
# primitives
# --------------------------------------------------------------------------

def extrude(profile, x0, x1):
    """Extrude a side-view polygon [(f, y), ...] across x0..x1 (may be concave)."""
    pts = [np.array(p, dtype=float) for p in profile]
    n = len(pts)
    ccw = _area2(pts) > 0
    tris = []
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        df, dy = b - a
        of, oy = (dy, -df) if ccw else (-dy, df)
        quad = [V(a[0], a[1], x0), V(b[0], b[1], x0), V(b[0], b[1], x1), V(a[0], a[1], x1)]
        tris += _fan(quad, np.array([0.0, oy, of]))
    for i, j, k in earclip(pts):
        tris += _tri(V(*pts[i], x0), V(*pts[j], x0), V(*pts[k], x0), np.array([-1.0, 0, 0]))
        tris += _tri(V(*pts[i], x1), V(*pts[j], x1), V(*pts[k], x1), np.array([1.0, 0, 0]))
    return tris


def ext(profile, w, xc=0.0):
    return extrude(profile, xc - w / 2, xc + w / 2)


def crect(f0, f1, y0, y1, c=0.0):
    """Side-view rectangle with chamfered corners. c = one value or (bl, br, tr, tl)."""
    bl, br, tr, tl = c if isinstance(c, (tuple, list)) else (c,) * 4
    pts = []
    pts += [(f0, y0 + bl), (f0 + bl, y0)] if bl else [(f0, y0)]
    pts += [(f1 - br, y0), (f1, y0 + br)] if br else [(f1, y0)]
    pts += [(f1, y1 - tr), (f1 - tr, y1)] if tr else [(f1, y1)]
    pts += [(f0 + tl, y1), (f0, y1 - tl)] if tl else [(f0, y1)]
    return pts


def box(f0, f1, y0, y1, w, xc=0.0):
    return ext([(f0, y0), (f1, y0), (f1, y1), (f0, y1)], w, xc)


def _basis(d):
    up = np.array([0.0, 1.0, 0.0]) if abs(d[1]) < 0.9 else np.array([0.0, 0.0, 1.0])
    u = np.cross(up, d)
    u /= np.linalg.norm(u)
    return u, np.cross(d, u)


def cyl(p0, p1, r0, r1=None, n=8, roll=0.0):
    """Low-poly (optionally tapered) cylinder between two points."""
    r1 = r0 if r1 is None else r1
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    d = p1 - p0
    d /= np.linalg.norm(d)
    u, v = _basis(d)
    angs = [roll + math.pi / n + 2 * math.pi * k / n for k in range(n)]
    ring0 = [p0 + r0 * (math.cos(a) * u + math.sin(a) * v) for a in angs]
    ring1 = [p1 + r1 * (math.cos(a) * u + math.sin(a) * v) for a in angs]
    faces = [[ring0[k], ring0[(k + 1) % n], ring1[(k + 1) % n], ring1[k]] for k in range(n)]
    if r0 > 0:
        faces.append(ring0)
    if r1 > 0:
        faces.append(ring1)
    return _convex(faces)


def cylf(f0, f1, r0, r1=None, y=0.0, x=0.0, n=8, roll=0.0):
    """Cylinder running along the barrel axis."""
    return cyl(V(f0, y, x), V(f1, y, x), r0, r1, n, roll)


def beam(p0, p1, w, h):
    """Rectangular bar from p0 to p1; w is its sideways (x-ish) thickness."""
    p0, p1 = np.asarray(p0, float), np.asarray(p1, float)
    d = p1 - p0
    d /= np.linalg.norm(d)
    u, v = _basis(d)
    hu, hv = u * w / 2, v * h / 2
    c0 = [p0 - hu - hv, p0 + hu - hv, p0 + hu + hv, p0 - hu + hv]
    c1 = [p + (p1 - p0) for p in c0]
    faces = [c0, c1] + [[c0[k], c0[(k + 1) % 4], c1[(k + 1) % 4], c1[k]] for k in range(4)]
    return _convex(faces)


_ICO = None


def ball(c, r, sy=1.0):
    """Icosahedron 'ball' (sy stretches it vertically, e.g. for crystals)."""
    global _ICO
    if _ICO is None:
        t = (1 + 5 ** 0.5) / 2
        vs = [(-1, t, 0), (1, t, 0), (-1, -t, 0), (1, -t, 0), (0, -1, t), (0, 1, t),
              (0, -1, -t), (0, 1, -t), (t, 0, -1), (t, 0, 1), (-t, 0, -1), (-t, 0, 1)]
        fs = [(0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11), (1, 5, 9), (5, 11, 4),
              (11, 10, 2), (10, 7, 6), (7, 1, 8), (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8),
              (3, 8, 9), (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1)]
        vs = [np.array(v, float) / np.linalg.norm(v) for v in vs]
        _ICO = (vs, fs)
    vs, fs = _ICO
    c = np.asarray(c, float)
    scale = np.array([r, r * sy, r])
    pts = [c + v * scale for v in vs]
    return _convex([[pts[i] for i in f] for f in fs])


def rotate(tris, axis, deg, pivot):
    """Rotate triangles around a design axis ('x', 'y' or 'f') through pivot."""
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    if axis == "x":
        m = np.array([[1, 0, 0], [0, c, -s], [0, s, c]])
    elif axis == "y":
        m = np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])
    else:
        m = np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]])
    pivot = np.asarray(pivot, float)
    return [tuple(m @ (p - pivot) + pivot for p in t) for t in tris]


# --------------------------------------------------------------------------
# rifle container
# --------------------------------------------------------------------------

class Rifle:
    def __init__(self, key, blurb, look=None, stats=None):
        self.key = key
        self.blurb = blurb
        self.look = dict(look or {})
        self.stats = dict(stats or {})
        self.parts = {}
        # name -> (part, point): Muzzle, Aim (scope eye point), Grip
        self.att = {}

    def add(self, part, tris):
        assert part in SLOTS, part
        self.parts.setdefault(part, []).extend(tris)

    def look_of(self, part):
        return self.look.get(part, DEFAULT_LOOK[part])


# --------------------------------------------------------------------------
# reusable gun bits
# --------------------------------------------------------------------------

def scope(r, f0, f1, y, rt=0.06, ro=0.1, re=0.08, n=8, x=0.0, mount_y=None, rings=None,
          turrets=True, part="Scope"):
    """Classic tube scope: eyepiece bell, tube, objective bell, lenses, turrets, rings."""
    L = f1 - f0
    e1 = f0 + min(0.22, L * 0.18)
    e2 = e1 + min(0.1, L * 0.08)
    o2 = f1 - min(0.22, L * 0.18)
    o1 = o2 - min(0.16, L * 0.12)
    r.add(part, cylf(f0, e1, re, y=y, x=x, n=n))
    r.add(part, cylf(e1, e2, re, rt, y=y, x=x, n=n))
    r.add(part, cylf(e2, o1, rt, y=y, x=x, n=n))
    r.add(part, cylf(o1, o2, rt, ro, y=y, x=x, n=n))
    r.add(part, cylf(o2, f1, ro, y=y, x=x, n=n))
    r.add("Lens", cylf(f1 - 0.01, f1 + 0.006, ro * 0.8, y=y, x=x, n=n))
    r.add("Lens", cylf(f0 - 0.006, f0 + 0.01, re * 0.72, y=y, x=x, n=n))
    if turrets:
        fm = (e2 + o1) / 2
        tr = max(0.035, rt * 0.65)
        r.add(part, cyl(V(fm, y, x), V(fm, y + rt + 0.07, x), tr, n=8))
        r.add(part, cyl(V(fm, y, x), V(fm, y, x - rt - 0.07), tr, n=8))
    if rings is None:
        rings = (e2 + 0.12, o1 - 0.1)
    for fr in rings:
        r.add("Mount", cylf(fr - 0.04, fr + 0.04, rt + 0.018, y=y, x=x, n=n))
        if mount_y is not None:
            r.add("Mount", box(fr - 0.05, fr + 0.05, mount_y, y - rt * 0.6, 0.09, x))
    r.att["Aim"] = (part, V(f0 - 0.12, y, x))


def rail(r, f0, f1, y, w=0.11, part="Mount"):
    """Picatinny rail whose base top sits at y. Returns the height of the teeth."""
    r.add(part, box(f0, f1, y - 0.035, y, w))
    f = f0 + 0.03
    while f + 0.04 <= f1 - 0.02:
        r.add(part, box(f, f + 0.04, y, y + 0.028, w * 1.12))
        f += 0.085
    return y + 0.028


def pgrip(r, f, ytop, L=0.36, ang=18, w=0.12, d=0.15, part="Grip"):
    """Pistol grip hanging below ytop, raked back by ang degrees."""
    k = math.tan(math.radians(ang)) * L
    prof = [(f + d / 2, ytop + 0.02), (f - d / 2, ytop + 0.02), (f - d / 2 - k - 0.02, ytop - L),
            (f + d / 2 - k, ytop - L)]
    r.add(part, ext(prof, w))
    r.att["Grip"] = (part, V(f - k / 2, ytop - L / 2))


def trigger(r, f, ybot, part="Trigger"):
    """Trigger blade + guard just below a receiver bottom at ybot."""
    r.add(part, box(f - 0.16, f + 0.13, ybot - 0.15, ybot - 0.125, 0.04))
    r.add(part, beam(V(f + 0.13, ybot + 0.01), V(f + 0.13, ybot - 0.15), 0.04, 0.025))
    r.add(part, beam(V(f - 0.16, ybot - 0.125), V(f - 0.2, ybot - 0.04), 0.04, 0.025))
    r.add(part, beam(V(f, ybot + 0.01), V(f - 0.03, ybot - 0.09), 0.025, 0.022))


def mag(r, f0, f1, ytop, ybot, w=0.14, rake=0.0, part="Magazine"):
    """Box magazine; rake shifts the bottom forward."""
    r.add(part, ext([(f0, ytop + 0.02), (f1, ytop + 0.02), (f1 + rake, ybot), (f0 + rake, ybot)], w))
    r.add(part, box(f0 + rake - 0.015, f1 + rake + 0.015, ybot - 0.03, ybot + 0.005, w + 0.02))


def bolt(r, f, y, style="ball", length=0.2, part="Bolt"):
    """Bolt handle sticking out of the shooter's right side (-x)."""
    root = V(f, y, -0.05)
    if style == "bent":
        end = V(f + 0.03, y - 0.15, -0.05 - length * 0.8)
    else:
        end = V(f - 0.04, y - 0.05, -0.05 - length)
    r.add(part, cyl(root, end, 0.02, n=6))
    if style == "tactical":
        r.add(part, cyl(end + V(0, 0, 0.01), end + V(0, 0, -0.08), 0.045, n=8))
    elif style == "lever":
        r.add(part, beam(end, end + V(0.0, -0.04, -0.05), 0.05, 0.035))
    else:
        r.add(part, ball(end, 0.042))


def bipod(r, f, y, length=0.85, deployed=True, spread=0.22, n=6):
    r.add("Bipod", box(f - 0.06, f + 0.06, y - 0.07, y + 0.02, 0.16))
    for s in (-1, 1):
        top = V(f, y - 0.05, s * 0.06)
        foot = V(f + 0.2, y - length, s * spread) if deployed else V(f + length, y - 0.09, s * 0.055)
        mid = top + 0.55 * (foot - top)
        r.add("Bipod", cyl(top, mid, 0.03, n=n))
        r.add("Bipod", cyl(mid, foot, 0.021, n=n))
        if deployed:
            r.add("Bipod", ball(foot, 0.04))


def brake(r, f, y, L=0.3, h=0.07, w=0.15, part="Muzzle"):
    """Three-plate muzzle brake."""
    r.add(part, cylf(f, f + L, h * 0.6, y=y))
    for a, b in ((0.0, 0.3), (0.42, 0.68), (0.8, 1.0)):
        r.add(part, ext(crect(f + a * L, f + b * L, y - h, y + h, h * 0.3), w))
    r.att["Muzzle"] = (part, V(f + L, y))


def wide_brake(r, f, y, L=0.45, h=0.09, w=0.36, part="Muzzle"):
    """Big anti-materiel 'arrowhead' brake."""
    r.add(part, ext(crect(f, f + L, y - h * 0.7, y + h * 0.7, (0, h * 0.4, h * 0.4, 0)), w * 0.45))
    r.add(part, ext(crect(f + 0.05 * L, f + 0.35 * L, y - h, y + h, h * 0.3), w))
    r.add(part, ext(crect(f + 0.55 * L, f + 0.88 * L, y - h, y + h, h * 0.3), w * 0.92))
    r.att["Muzzle"] = (part, V(f + L, y))


def suppressor(r, f, y, L=0.5, rad=0.08, n=8, part="Muzzle"):
    r.add(part, cylf(f, f + 0.06, rad * 0.75, rad, y=y, n=n))
    r.add(part, cylf(f + 0.06, f + L - 0.06, rad, y=y, n=n))
    r.add(part, cylf(f + L - 0.06, f + L, rad, rad * 0.75, y=y, n=n))
    r.att["Muzzle"] = (part, V(f + L, y))


def flash_hider(r, f, y, L=0.2, rad=0.055, n=6, part="Muzzle"):
    r.add(part, cylf(f, f + L, rad, rad * 1.12, y=y, n=n))
    r.att["Muzzle"] = (part, V(f + L, y))
