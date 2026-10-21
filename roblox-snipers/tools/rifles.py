"""The 20 sniper rifles. Each function builds one Rifle out of named parts.

Coordinates are studs in design space (see lowpoly.py): f forward, y up,
shooter's right is -x. Most rifles keep the bore at y = 0 and the trigger
around f = -0.3.
"""

from lowpoly import (V, Rifle, ball, beam, bipod, bolt, box, brake, crect, cyl, cylf, ext,
                     flash_hider, mag, pgrip, rail, rotate, scope, suppressor, trigger, wide_brake)


def stats(damage, headshot, fire_delay, mag_size, reload, zoom_fov, bullet_speed, walk_speed):
    return dict(Damage=damage, HeadshotMultiplier=headshot, FireDelay=fire_delay, MagSize=mag_size,
                ReloadTime=reload, ZoomFOV=zoom_fov, BulletSpeed=bullet_speed, WalkSpeed=walk_speed)


def hawkeye():
    r = Rifle("Hawkeye", "Classic walnut bolt-action hunting rifle. The all-rounder.",
              {"Stock": ("8b5a2b", "Wood"), "Pad": ("2a1a10", "Fabric")},
              stats(85, 2.0, 1.2, 5, 2.6, 25, 900, 16))
    r.add("Body", cylf(-0.7, 0.55, 0.085))
    r.add("Bolt", cylf(-0.86, -0.7, 0.06))
    r.add("Barrel", cylf(0.55, 3.2, 0.055, 0.042))
    r.add("Muzzle", cylf(3.2, 3.26, 0.047))
    r.att["Muzzle"] = ("Muzzle", V(3.26, 0))
    r.add("Stock", ext([(-2.35, -0.6), (-1.2, -0.36), (-0.75, -0.32), (-0.62, -0.44), (-0.47, -0.42),
                        (-0.38, -0.2), (0.4, -0.17), (1.6, -0.11), (2.0, -0.08), (2.03, -0.03),
                        (2.0, -0.01), (0.55, -0.01), (0.5, 0.0), (-0.7, 0.0), (-0.82, 0.02),
                        (-1.3, 0.12), (-2.0, 0.13), (-2.35, 0.14)], 0.17))
    r.add("Pad", box(-2.43, -2.35, -0.6, 0.14, 0.175))
    r.att["Grip"] = ("Stock", V(-0.62, -0.25))
    r.add("Magazine", box(-0.15, 0.35, -0.2, -0.165, 0.12))
    trigger(r, -0.25, -0.18)
    bolt(r, -0.45, 0.02, "ball", 0.2)
    scope(r, -0.75, 0.75, 0.26, 0.06, 0.1, 0.08, mount_y=0.06)
    return r


def goliath():
    y = 0.1
    r = Rifle("Goliath", ".50 anti-materiel monster. Huge brake, bipod, one-shot body hits.",
              {"Body": ("3d4033", "Metal"), "Stock": ("33352c", "Metal"), "Grip": ("222222", "SmoothPlastic")},
              stats(140, 1.6, 2.4, 10, 4.2, 18, 1200, 13))
    r.add("Body", ext(crect(-0.9, 1.3, 0.0, 0.23, (0, 0, 0.07, 0.02)), 0.26))
    r.add("Body", ext(crect(-1.0, 0.75, -0.22, 0.0, (0.05, 0.09, 0, 0)), 0.24))
    for f in (0.65, 0.85, 1.05):
        r.add("Accent", box(f, f + 0.12, 0.07, 0.15, 0.265))
    top = rail(r, -0.85, 1.2, 0.23)
    r.add("Barrel", cylf(1.3, 3.9, 0.075, 0.07, y=y))
    wide_brake(r, 3.9, y, 0.45, 0.09, 0.36)
    r.add("Stock", ext([(-1.0, -0.2), (-1.0, 0.22), (-1.2, 0.24), (-2.0, 0.24), (-2.05, 0.2),
                        (-2.05, -0.42), (-1.85, -0.42), (-1.4, -0.2)], 0.2))
    r.add("Pad", box(-2.15, -2.05, -0.44, 0.26, 0.22))
    r.add("Pad", ext(crect(-1.9, -1.25, 0.24, 0.31, (0, 0, 0.04, 0.03)), 0.16))
    r.add("Bipod", cyl(V(-1.7, -0.3), V(-1.72, -0.58), 0.03, n=6))
    r.add("Bipod", box(-1.8, -1.64, -0.62, -0.57, 0.12))
    pgrip(r, -0.55, -0.22, 0.38, 15, 0.13, 0.16)
    trigger(r, -0.3, -0.22)
    mag(r, 0.05, 0.42, -0.22, -0.62, 0.2, 0.03)
    r.add("Bolt", box(0.05, 0.2, 0.05, 0.13, 0.08, -0.16))
    bipod(r, 1.15, 0.0, 0.95, True, 0.28)
    scope(r, -0.95, 0.75, 0.47, 0.075, 0.13, 0.1, mount_y=top)
    return r


def frostbite():
    r = Rifle("Frostbite", "Arctic-warfare thumbhole bolt gun. Iconic green chassis.",
              {"Stock": ("4f6b3a", "SmoothPlastic")},
              stats(115, 1.8, 1.5, 10, 3.4, 20, 1000, 15))
    r.add("Body", ext(crect(-0.75, 0.6, -0.1, 0.11, 0.03), 0.18))
    r.add("Barrel", cylf(0.6, 3.3, 0.06, 0.055))
    r.add("Muzzle", cylf(3.3, 3.52, 0.068, n=6))
    r.add("Muzzle", cylf(3.36, 3.4, 0.075, n=6))
    r.att["Muzzle"] = ("Muzzle", V(3.52, 0))
    r.add("Stock", ext([(-0.62, -0.25), (0.6, -0.25), (1.6, -0.15), (1.78, -0.09), (1.78, -0.01),
                        (0.6, -0.01), (0.6, -0.08), (-0.62, -0.08)], 0.2))
    r.add("Stock", ext([(-0.62, -0.25), (-0.38, -0.25), (-0.5, -0.57), (-0.76, -0.57)], 0.16))
    r.add("Stock", ext([(-2.0, -0.66), (-0.6, -0.57), (-0.64, -0.48), (-2.0, -0.54)], 0.16))
    r.add("Stock", ext([(-2.0, -0.06), (-0.75, -0.06), (-0.75, 0.13), (-1.0, 0.17), (-2.0, 0.17)], 0.16))
    r.add("Stock", ext(crect(-2.4, -1.98, -0.68, 0.17, (0.05, 0, 0, 0.04)), 0.17))
    r.add("Pad", box(-2.47, -2.4, -0.66, 0.15, 0.18))
    r.att["Grip"] = ("Stock", V(-0.57, -0.4))
    mag(r, 0.0, 0.3, -0.2, -0.5, 0.13)
    trigger(r, -0.2, -0.25)
    bolt(r, -0.5, 0.03, "ball", 0.2)
    bipod(r, 1.45, -0.12, 0.8, False)
    scope(r, -0.85, 0.65, 0.3, 0.065, 0.12, 0.085, mount_y=0.1)
    return r


def viper():
    r = Rifle("Viper", "Compact bullpup. Long barrel in a short body, magazine behind the grip.",
              {"Body": ("1e1e22", "SmoothPlastic"), "Accent": ("c23b22", "SmoothPlastic")},
              stats(95, 2.0, 1.0, 5, 2.8, 22, 950, 17))
    r.add("Body", ext(crect(-1.7, 0.5, -0.18, 0.14, (0.04, 0.06, 0.04, 0.02)), 0.2))
    r.add("Accent", box(-1.6, 0.4, -0.07, -0.03, 0.205))
    r.add("Stock", ext(crect(-2.25, -1.7, -0.45, 0.14, (0.08, 0, 0, 0.03)), 0.18))
    r.add("Pad", box(-2.32, -2.25, -0.45, 0.14, 0.19))
    r.add("Pad", ext(crect(-2.1, -1.3, 0.14, 0.27, (0, 0, 0.06, 0.03)), 0.14))
    pgrip(r, -0.35, -0.18, 0.34, 12)
    trigger(r, -0.15, -0.18)
    mag(r, -1.15, -0.8, -0.18, -0.5, 0.14)
    r.add("Barrel", cylf(0.5, 3.0, 0.06, 0.055))
    r.add("Handguard", ext(crect(0.45, 1.6, -0.14, 0.1, (0.06, 0.08, 0.04, 0)), 0.18))
    top = rail(r, -1.6, 1.5, 0.14)
    brake(r, 3.0, 0.0, 0.28, 0.07, 0.14)
    bipod(r, 1.45, -0.1, 0.8, True)
    bolt(r, -1.3, 0.03, "tactical", 0.14)
    scope(r, -1.1, 0.4, 0.36, 0.065, 0.11, 0.085, mount_y=top)
    return r


def relic():
    r = Rifle("Relic", "Vintage long rifle with barrel bands and a tiny side-mounted scope.",
              {"Stock": ("6b3e1f", "Wood"), "Body": ("3a3a3d", "Metal"), "Bolt": ("8a8a90", "Metal"),
               "Accent": ("3a3a3d", "Metal")},
              stats(90, 2.2, 1.4, 5, 3.2, 35, 850, 16))
    r.add("Body", cylf(-0.6, 0.45, 0.075))
    r.add("Magazine", ext([(-0.2, -0.06), (0.35, -0.06), (0.3, -0.3), (-0.15, -0.3)], 0.12))
    r.add("Barrel", cylf(0.45, 4.1, 0.05, 0.04))
    r.add("Muzzle", cylf(4.04, 4.14, 0.048))
    r.add("Muzzle", box(4.05, 4.11, 0.03, 0.11, 0.03))
    r.att["Muzzle"] = ("Muzzle", V(4.14, 0))
    r.add("Stock", ext([(-2.2, -0.62), (-1.1, -0.36), (-0.55, -0.22), (0.4, -0.14), (3.6, -0.07),
                        (3.65, -0.02), (3.6, 0.02), (0.5, 0.02), (0.45, 0.0), (-0.6, 0.0),
                        (-0.75, -0.02), (-1.2, 0.04), (-2.2, 0.08)], 0.16))
    r.add("Stock", ext(crect(0.6, 1.45, 0.02, 0.075, (0, 0.03, 0.03, 0)), 0.1))
    r.add("Pad", box(-2.26, -2.2, -0.62, 0.08, 0.165))
    r.att["Grip"] = ("Stock", V(-0.7, -0.2))
    for f in (1.5, 3.4):
        r.add("Accent", ext(crect(f - 0.05, f + 0.05, -0.13, 0.07, 0.03), 0.17))
    bolt(r, -0.45, 0.02, "bent", 0.2)
    r.add("Bolt", cylf(-0.78, -0.6, 0.045))
    r.add("Bolt", ball(V(-0.8, 0.0), 0.05))
    trigger(r, -0.35, -0.2)
    r.add("Mount", box(-0.3, 0.1, -0.03, 0.17, 0.06, 0.1))
    scope(r, -0.55, 0.35, 0.19, 0.045, 0.055, 0.06, x=0.08, rings=(-0.25, 0.08), turrets=False)
    return r


def whisper():
    r = Rifle("Whisper", "Integrally suppressed stealth rifle with a skeleton stock.",
              {"Body": ("34363b", "Metal"), "Barrel": ("2a2c30", "Metal"), "Stock": ("3a3d42", "Metal"),
               "Accent": ("4a4e55", "Metal")},
              stats(80, 2.4, 1.1, 8, 2.8, 30, 750, 17))
    r.add("Body", ext(crect(-0.75, 0.4, -0.12, 0.12, 0.04), 0.19))
    r.add("Barrel", cylf(0.4, 2.9, 0.11))
    for f in (0.7, 1.3, 1.9, 2.5):
        r.add("Accent", cylf(f, f + 0.04, 0.12))
    r.add("Muzzle", cylf(2.9, 2.98, 0.105, 0.08))
    r.att["Muzzle"] = ("Muzzle", V(2.98, 0))
    r.add("Stock", beam(V(-0.75, 0.05), V(-2.1, 0.08), 0.06, 0.08))
    r.add("Stock", beam(V(-0.75, -0.25), V(-2.1, -0.42), 0.06, 0.07))
    r.add("Stock", ext(crect(-2.2, -2.05, -0.55, 0.15, 0.03), 0.16))
    r.add("Pad", box(-2.27, -2.2, -0.55, 0.15, 0.17))
    r.add("Pad", ext(crect(-1.8, -1.2, 0.12, 0.21, 0.03), 0.12))
    r.add("Stock", cyl(V(-1.5, 0.07), V(-1.5, 0.14), 0.02, n=6))
    pgrip(r, -0.5, -0.12, 0.36, 18)
    trigger(r, -0.27, -0.12)
    mag(r, -0.05, 0.25, -0.12, -0.45, 0.15, 0.05)
    top = rail(r, -0.7, 0.4, 0.12)
    bolt(r, -0.55, 0.04, "tactical", 0.14)
    scope(r, -0.7, 0.35, 0.28, 0.055, 0.08, 0.07, mount_y=top)
    return r


def pulse():
    r = Rifle("Pulse", "Sci-fi railgun. Twin rails, glowing coils, energy cell magazine.",
              {"Body": ("e8e8ee", "SmoothPlastic"), "Stock": ("e8e8ee", "SmoothPlastic"),
               "Accent": ("29e6ff", "Neon"), "Barrel": ("2b2e38", "Metal"), "Handguard": ("3a3f4f", "Metal"),
               "Pad": ("2b2e38", "SmoothPlastic"), "Magazine": ("2b2e38", "SmoothPlastic"),
               "Scope": ("2b2e38", "SmoothPlastic"), "Lens": ("29e6ff", "Glass")},
              stats(100, 2.0, 1.3, 6, 3.0, 20, 2000, 16))
    r.add("Body", ext([(-0.8, -0.15), (0.3, -0.15), (0.7, -0.05), (0.7, 0.08), (0.4, 0.16), (-0.6, 0.16),
                       (-0.8, 0.08)], 0.24))
    r.add("Barrel", ext([(0.6, 0.03), (3.0, 0.05), (3.1, 0.085), (3.0, 0.12), (0.6, 0.12)], 0.1))
    r.add("Barrel", ext([(0.6, -0.03), (0.6, -0.12), (3.0, -0.12), (3.1, -0.085), (3.0, -0.05)], 0.1))
    r.add("Accent", cylf(0.6, 2.9, 0.022, n=6))
    for f in (0.9, 1.35, 1.8, 2.25):
        r.add("Handguard", cylf(f, f + 0.12, 0.17))
        r.add("Accent", cylf(f + 0.04, f + 0.08, 0.18))
    r.add("Muzzle", cylf(2.95, 3.03, 0.06))
    r.att["Muzzle"] = ("Muzzle", V(3.1, 0))
    r.add("Stock", ext([(-0.8, 0.12), (-0.8, -0.1), (-1.3, -0.18), (-2.0, -0.48), (-2.15, -0.48),
                        (-2.15, 0.1), (-1.9, 0.18), (-1.0, 0.18)], 0.18))
    for s in (-1, 1):
        r.add("Accent", box(-1.9, -0.95, 0.03, 0.07, 0.01, s * 0.092))
    r.add("Pad", box(-2.22, -2.15, -0.48, 0.1, 0.19))
    pgrip(r, -0.5, -0.15, 0.36, 22)
    trigger(r, -0.27, -0.15)
    mag(r, -0.05, 0.25, -0.15, -0.42, 0.15)
    for s in (-1, 1):
        r.add("Accent", box(0.0, 0.2, -0.36, -0.2, 0.01, s * 0.078))
    r.add("Scope", ext(crect(-0.7, 0.5, 0.22, 0.38, 0.05), 0.14))
    r.add("Lens", box(0.5, 0.515, 0.25, 0.35, 0.1))
    r.add("Lens", box(-0.715, -0.7, 0.26, 0.34, 0.09))
    r.add("Mount", box(-0.3, 0.2, 0.15, 0.23, 0.08))
    r.att["Aim"] = ("Scope", V(-0.85, 0.3))
    return r


def marksman():
    r = Rifle("Marksman", "Semi-auto designated marksman rifle. Fast follow-up shots.",
              {"Body": ("b59a6d", "SmoothPlastic"), "Handguard": ("b59a6d", "SmoothPlastic"),
               "Stock": ("9c845c", "SmoothPlastic"), "Grip": ("9c845c", "SmoothPlastic"),
               "Pad": ("9c845c", "SmoothPlastic")},
              stats(55, 2.0, 0.35, 15, 2.4, 40, 850, 18))
    r.add("Body", ext(crect(-0.6, 0.5, 0.0, 0.14, (0, 0, 0.02, 0.02)), 0.16))
    r.add("Body", ext(crect(-0.55, 0.35, -0.16, 0.0, (0.03, 0.05, 0, 0)), 0.15))
    r.add("Handguard", cylf(0.5, 1.9, 0.1, y=0.04))
    for s in (-1, 1):
        r.add("Handguard", box(0.9, 1.5, 0.0, 0.07, 0.04, s * 0.095))
    top = rail(r, -0.6, 1.85, 0.14)
    r.add("Barrel", cylf(1.9, 3.2, 0.045))
    flash_hider(r, 3.2, 0.0, 0.22, 0.055)
    r.add("Body", cylf(-1.3, -0.6, 0.06, y=0.04))
    r.add("Stock", ext([(-2.05, -0.4), (-1.85, -0.4), (-1.3, -0.06), (-1.3, 0.13), (-2.05, 0.13)], 0.15))
    r.add("Pad", ext(crect(-1.95, -1.4, 0.13, 0.24, (0, 0, 0.04, 0.02)), 0.12))
    r.add("Pad", box(-2.12, -2.05, -0.4, 0.13, 0.16))
    pgrip(r, -0.4, -0.16, 0.34, 20)
    trigger(r, -0.18, -0.16)
    r.add("Magazine", ext([(0.0, -0.14), (0.27, -0.14), (0.31, -0.3), (0.38, -0.45), (0.12, -0.5),
                           (0.06, -0.33)], 0.13))
    r.add("Bolt", box(-0.68, -0.6, 0.08, 0.13, 0.2))
    r.add("Grip", cyl(V(1.4, -0.04), V(1.4, -0.34), 0.045))
    scope(r, -0.75, 0.6, 0.34, 0.06, 0.1, 0.08, mount_y=top)
    return r


def needle():
    r = Rifle("Needle", "Ultra-long featherweight barrel on a minimalist frame. Pure precision.",
              {"Body": ("c9ccd2", "Metal"), "Barrel": ("b0b4bb", "Metal"), "Stock": ("2b2b2b", "Metal"),
               "Scope": ("b0b4bb", "Metal"), "Accent": ("ff4466", "Neon")},
              stats(100, 2.6, 1.6, 4, 3.0, 12, 1400, 17))
    r.add("Body", cylf(-0.5, 0.3, 0.065, n=6))
    r.add("Barrel", cylf(0.3, 4.6, 0.035, 0.028, n=6))
    for f in (1.5, 2.5, 3.5):
        r.add("Accent", cylf(f, f + 0.025, 0.042, n=6))
    r.add("Muzzle", cylf(4.6, 4.7, 0.04, n=6))
    r.att["Muzzle"] = ("Muzzle", V(4.7, 0))
    r.add("Stock", beam(V(-0.5, 0.02), V(-2.0, 0.02), 0.04, 0.04))
    r.add("Stock", beam(V(-0.55, -0.25), V(-2.0, -0.4), 0.04, 0.04))
    r.add("Stock", beam(V(-2.0, 0.07), V(-2.0, -0.47), 0.14, 0.06))
    r.add("Pad", beam(V(-1.75, 0.04), V(-1.2, 0.04), 0.1, 0.07))
    pgrip(r, -0.4, -0.06, 0.32, 18, 0.1, 0.12)
    trigger(r, -0.2, -0.06)
    mag(r, -0.05, 0.15, -0.06, -0.25, 0.1)
    bolt(r, -0.3, 0.02, "ball", 0.18)
    scope(r, -0.6, 1.0, 0.2, 0.045, 0.07, 0.06, n=6, mount_y=0.05, rings=(-0.3, 0.6))
    return r


def raptor():
    r = Rifle("Raptor", "Modern tactical chassis with a folding skeleton stock and big glass.",
              {"Body": ("3b3f45", "Metal"), "Handguard": ("3b3f45", "Metal"), "Stock": ("2f3236", "Metal"),
               "Accent": ("d9a441", "Metal"), "Scope": ("2c2f33", "Metal"), "Bipod": ("2c2f33", "Metal")},
              stats(105, 2.0, 1.2, 7, 3.0, 18, 1050, 16))
    r.add("Body", ext(crect(-0.75, 0.55, -0.02, 0.15, 0.03), 0.18))
    r.add("Body", ext([(-0.7, -0.18), (0.45, -0.18), (0.55, -0.02), (-0.75, -0.02)], 0.17))
    r.add("Handguard", cylf(0.5, 2.0, 0.1, y=0.03))
    top = rail(r, -0.75, 0.5, 0.15)
    rail(r, 0.55, 1.95, 0.125)
    r.add("Barrel", cylf(2.0, 3.4, 0.055, 0.05))
    brake(r, 3.4, 0.0, 0.32, 0.065, 0.14)
    r.add("Stock", box(-0.88, -0.74, -0.08, 0.1, 0.16))
    r.add("Stock", ext(crect(-2.1, -0.85, -0.02, 0.08, 0.02), 0.12))
    r.add("Stock", beam(V(-0.9, -0.08), V(-2.0, -0.4), 0.1, 0.07))
    r.add("Stock", ext(crect(-2.2, -2.05, -0.55, 0.1, 0.03), 0.15))
    r.add("Pad", box(-2.27, -2.2, -0.55, 0.1, 0.16))
    r.add("Pad", ext(crect(-1.85, -1.2, 0.12, 0.21, 0.03), 0.12))
    for f in (-1.7, -1.35):
        r.add("Accent", cyl(V(f, 0.06), V(f, 0.14), 0.02))
    r.add("Bipod", cyl(V(-1.95, -0.42), V(-1.95, -0.6), 0.025, n=6))
    pgrip(r, -0.5, -0.18, 0.36, 18)
    trigger(r, -0.27, -0.18)
    mag(r, -0.05, 0.28, -0.18, -0.45, 0.15)
    bipod(r, 1.8, -0.07, 0.85, True)
    bolt(r, -0.55, 0.06, "tactical", 0.15)
    scope(r, -0.9, 0.6, 0.38, 0.07, 0.12, 0.09, mount_y=top)
    return r


def titan():
    r = Rifle("Titan", "Old-school anti-tank rifle. Top-fed magazine, offset scope, T-monopod.",
              {"Body": ("4a4f3a", "Metal"), "Barrel": ("3a3d33", "Metal"), "Muzzle": ("3a3d33", "Metal"),
               "Stock": ("4a4f3a", "Metal"), "Pad": ("6b4a2b", "Fabric"), "Magazine": ("4a4f3a", "Metal"),
               "Bipod": ("3a3d33", "Metal"), "Grip": ("5a3a22", "Wood"), "Mount": ("3a3d33", "Metal")},
              stats(150, 1.5, 2.8, 5, 4.6, 22, 1100, 12))
    r.add("Body", cylf(-0.9, 0.7, 0.1))
    r.add("Barrel", cylf(0.7, 4.6, 0.065, 0.06))
    r.add("Muzzle", ext(crect(4.6, 5.0, -0.11, 0.11, 0.03), 0.22))
    r.add("Muzzle", box(4.68, 4.92, -0.06, 0.06, 0.24))
    r.att["Muzzle"] = ("Muzzle", V(5.0, 0))
    r.add("Magazine", ext(crect(-0.35, 0.0, 0.06, 0.5, (0, 0, 0.03, 0.03)), 0.11))
    r.add("Stock", ext(crect(-2.35, -2.15, -0.5, 0.14, 0.03), 0.18))
    r.add("Stock", ext([(-2.15, -0.25), (-0.9, -0.08), (-0.9, 0.08), (-2.15, 0.1)], 0.14))
    r.add("Pad", ext(crect(-2.45, -2.35, -0.52, 0.16, 0.04), 0.19))
    r.add("Bipod", cyl(V(-1.9, -0.15), V(-1.9, -0.55), 0.03, n=6))
    r.add("Bipod", box(-1.98, -1.82, -0.6, -0.55, 0.12))
    pgrip(r, -0.7, -0.08, 0.38, 14, 0.13, 0.16)
    trigger(r, -0.45, -0.09)
    r.add("Bipod", cylf(0.95, 1.08, 0.09))
    r.add("Bipod", cyl(V(1.0, -0.06), V(1.05, -0.75), 0.035, n=6))
    r.add("Bipod", beam(V(1.05, -0.77, -0.2), V(1.05, -0.77, 0.2), 0.08, 0.05))
    bolt(r, -0.6, 0.03, "ball", 0.24)
    r.add("Mount", box(-0.85, -0.45, -0.02, 0.2, 0.12, 0.13))
    scope(r, -1.05, 0.0, 0.24, 0.055, 0.085, 0.075, x=0.2, rings=(-0.75, -0.5), turrets=False)
    return r


def kestrel():
    r = Rifle("Kestrel", "Short, light scout rifle with a forward long-eye-relief scope.",
              {"Stock": ("7a6a52", "SmoothPlastic"), "Pad": ("2a2a2a", "Fabric")},
              stats(75, 2.0, 0.9, 6, 2.2, 45, 800, 19))
    r.add("Body", cylf(-0.6, 0.4, 0.075))
    r.add("Barrel", cylf(0.4, 2.3, 0.055, 0.05))
    flash_hider(r, 2.3, 0.0, 0.15, 0.06)
    r.add("Muzzle", box(2.2, 2.28, 0.03, 0.12, 0.03))
    r.add("Stock", ext([(-2.0, -0.55), (-1.0, -0.33), (-0.7, -0.3), (-0.6, -0.42), (-0.45, -0.43),
                        (-0.35, -0.2), (0.4, -0.18), (1.4, -0.12), (1.55, -0.06), (1.5, 0.0),
                        (0.4, 0.0), (-0.6, 0.0), (-0.75, 0.0), (-1.1, 0.08), (-2.0, 0.1)], 0.17))
    r.add("Pad", box(-2.07, -2.0, -0.55, 0.1, 0.18))
    r.att["Grip"] = ("Stock", V(-0.55, -0.27))
    mag(r, 0.0, 0.25, -0.16, -0.38, 0.12)
    trigger(r, -0.22, -0.18)
    bolt(r, -0.35, 0.02, "ball", 0.18)
    r.add("Mount", box(-0.62, -0.5, 0.06, 0.14, 0.08))
    top = rail(r, 0.35, 1.1, 0.085, 0.09)
    scope(r, 0.2, 1.2, 0.21, 0.05, 0.065, 0.065, mount_y=top, rings=(0.45, 0.95), turrets=False)
    r.att["Aim"] = ("Scope", V(-0.45, 0.21))
    bipod(r, 1.3, -0.12, 0.7, False)
    return r


def cobra():
    r = Rifle("Cobra", "Semi-auto marksman with an open wooden stock and a side scope.",
              {"Stock": ("8a4b22", "Wood"), "Handguard": ("8a4b22", "Wood"), "Body": ("2f3033", "Metal"),
               "Barrel": ("2f3033", "Metal"), "Magazine": ("4a2e1f", "SmoothPlastic"),
               "Pad": ("222222", "Fabric"), "Muzzle": ("2f3033", "Metal")},
              stats(70, 2.0, 0.45, 10, 2.6, 30, 830, 17))
    r.add("Body", ext(crect(-0.65, 0.45, -0.12, 0.11, (0.03, 0.03, 0.04, 0.04)), 0.17))
    r.add("Body", ext(crect(-0.6, 0.3, 0.11, 0.15, (0, 0, 0.03, 0.03)), 0.13))
    r.add("Handguard", ext(crect(0.45, 1.5, -0.1, 0.1, (0.04, 0.06, 0.06, 0.04)), 0.16))
    for f in (0.7, 0.95, 1.2):
        for s in (-1, 1):
            r.add("Body", box(f, f + 0.12, -0.03, 0.05, 0.006, s * 0.081))
    r.add("Barrel", cylf(1.5, 3.6, 0.045))
    r.add("Body", cylf(1.5, 1.65, 0.065))
    flash_hider(r, 3.6, 0.0, 0.25, 0.058, n=8)
    r.add("Muzzle", box(3.7, 3.8, 0.04, 0.12, 0.06))
    r.add("Stock", ext([(-0.65, 0.08), (-0.65, -0.06), (-1.95, 0.0), (-1.95, 0.12)], 0.15))
    r.add("Pad", ext(crect(-1.7, -1.1, -0.03, 0.1, 0.03), 0.04, 0.085))
    r.add("Stock", ext([(-0.65, -0.12), (-0.45, -0.12), (-0.6, -0.45), (-0.8, -0.45)], 0.15))
    r.add("Stock", ext([(-1.95, -0.58), (-0.75, -0.47), (-0.77, -0.4), (-1.95, -0.47)], 0.15))
    r.add("Stock", ext(crect(-2.15, -1.92, -0.62, 0.13, (0.04, 0, 0, 0.03)), 0.16))
    r.add("Pad", box(-2.22, -2.15, -0.62, 0.13, 0.17))
    r.att["Grip"] = ("Stock", V(-0.63, -0.3))
    r.add("Magazine", ext([(-0.1, -0.1), (0.18, -0.1), (0.22, -0.25), (0.3, -0.42), (0.04, -0.47),
                           (-0.04, -0.3)], 0.12))
    trigger(r, -0.28, -0.12)
    r.add("Bolt", cyl(V(-0.25, 0.04, -0.08), V(-0.25, 0.04, -0.17), 0.02, n=6))
    r.add("Bolt", ball(V(-0.25, 0.04, -0.18), 0.035))
    r.add("Mount", box(-0.45, 0.1, 0.0, 0.2, 0.05, 0.11))
    scope(r, -0.65, 0.3, 0.24, 0.055, 0.07, 0.065, x=0.07, rings=(-0.35, 0.05), turrets=True)
    r.add("Pad", cylf(-0.85, -0.65, 0.072, 0.065, y=0.24, x=0.07))
    r.att["Aim"] = ("Scope", V(-0.95, 0.24, 0.07))
    return r


def phantom():
    r = Rifle("Phantom", "Faceted stealth rifle with a hex shroud and violet glow lines.",
              {"Body": ("15161a", "SmoothPlastic"), "Stock": ("15161a", "SmoothPlastic"),
               "Handguard": ("1f2026", "SmoothPlastic"), "Barrel": ("1f2026", "Metal"),
               "Accent": ("8a5cff", "Neon"), "Scope": ("15161a", "SmoothPlastic"), "Lens": ("8a5cff", "Glass"),
               "Pad": ("0c0c0e", "Fabric"), "Magazine": ("1f2026", "SmoothPlastic"), "Muzzle": ("1f2026", "Metal")},
              stats(95, 2.2, 1.2, 6, 2.8, 22, 1000, 17))
    r.add("Body", ext([(-0.9, -0.16), (0.2, -0.16), (0.6, -0.06), (0.6, 0.06), (0.3, 0.16), (-0.7, 0.16),
                       (-0.9, 0.06)], 0.2))
    r.add("Body", ext([(-0.6, 0.16), (0.2, 0.16), (0.05, 0.21), (-0.45, 0.21)], 0.12))
    r.add("Handguard", cylf(0.6, 3.1, 0.12, n=6, roll=0.0))
    for s in (-1, 1):
        r.add("Accent", box(0.8, 2.8, -0.012, 0.012, 0.006, s * 0.105))
    r.add("Barrel", cylf(0.55, 0.62, 0.06, n=6))
    r.add("Muzzle", cylf(3.1, 3.2, 0.12, 0.07, n=6, roll=0.0))
    r.att["Muzzle"] = ("Muzzle", V(3.2, 0))
    r.add("Stock", ext([(-0.9, 0.14), (-0.9, -0.12), (-1.4, -0.2), (-2.1, -0.5), (-2.25, -0.5),
                        (-2.25, 0.06), (-2.0, 0.16), (-1.2, 0.16)], 0.17))
    for s in (-1, 1):
        r.add("Accent", box(-2.0, -1.0, 0.08, 0.11, 0.006, s * 0.088))
    r.add("Pad", box(-2.32, -2.25, -0.5, 0.06, 0.18))
    pgrip(r, -0.55, -0.16, 0.36, 24, 0.12, 0.15)
    trigger(r, -0.3, -0.16)
    r.add("Magazine", ext([(-0.05, -0.14), (0.25, -0.14), (0.3, -0.42), (0.0, -0.44)], 0.14))
    r.add("Bolt", box(-0.6, -0.35, 0.02, 0.08, 0.04, -0.11))
    r.add("Scope", ext(crect(-0.75, 0.45, 0.24, 0.38, 0.04), 0.13))
    r.add("Scope", ext([(0.45, 0.23), (0.62, 0.21), (0.62, 0.41), (0.45, 0.39)], 0.15))
    r.add("Lens", box(0.62, 0.635, 0.23, 0.39, 0.12))
    r.add("Lens", box(-0.765, -0.75, 0.27, 0.35, 0.09))
    r.add("Mount", box(-0.3, 0.2, 0.2, 0.25, 0.08))
    r.att["Aim"] = ("Scope", V(-0.9, 0.31))
    return r


def longbow():
    r = Rifle("Longbow", "Extreme-range desert-tan rifle. Monopod, massive brake, huge scope.",
              {"Body": ("c2a878", "SmoothPlastic"), "Stock": ("c2a878", "SmoothPlastic"),
               "Handguard": ("c2a878", "SmoothPlastic"), "Barrel": ("3a3a3a", "Metal"),
               "Grip": ("a88f62", "SmoothPlastic"), "Pad": ("2a2a2a", "Fabric"), "Scope": ("c2a878", "Metal"),
               "Bipod": ("3a3a3a", "Metal"), "Magazine": ("3a3a3a", "Metal"), "Muzzle": ("3a3a3a", "Metal")},
              stats(125, 2.2, 1.9, 7, 3.8, 10, 1500, 14))
    r.add("Body", ext(crect(-0.85, 0.6, -0.12, 0.13, 0.03), 0.19))
    top = rail(r, -0.85, 0.6, 0.13)
    r.add("Handguard", ext(crect(0.6, 2.2, -0.1, 0.1, 0.05), 0.17))
    for f in (0.9, 1.25, 1.6, 1.95):
        for s in (-1, 1):
            r.add("Barrel", box(f, f + 0.18, -0.03, 0.03, 0.006, s * 0.086))
    r.add("Barrel", cylf(2.2, 4.5, 0.06, 0.052))
    brake(r, 4.5, 0.0, 0.4, 0.075, 0.17)
    r.add("Stock", cylf(-1.95, -0.85, 0.04, y=0.05))
    r.add("Stock", cylf(-1.95, -0.85, 0.04, y=-0.08))
    r.add("Stock", beam(V(-0.75, -0.3), V(-1.95, -0.4), 0.07, 0.07))
    r.add("Stock", ext(crect(-2.1, -1.95, -0.5, 0.12, 0.03), 0.15))
    r.add("Pad", box(-2.17, -2.1, -0.5, 0.12, 0.16))
    r.add("Pad", ext(crect(-1.9, -1.2, 0.12, 0.22, 0.04), 0.13))
    for f in (-1.75, -1.35):
        r.add("Stock", cyl(V(f, 0.04), V(f, 0.13), 0.02, n=6))
    r.add("Bipod", cyl(V(-1.8, -0.1), V(-1.8, -0.58), 0.03, n=6))
    r.add("Bipod", ball(V(-1.8, -0.6), 0.045))
    pgrip(r, -0.55, -0.12, 0.36, 18)
    trigger(r, -0.3, -0.12)
    mag(r, -0.05, 0.3, -0.12, -0.45, 0.15)
    bipod(r, 2.0, -0.1, 1.0, True, 0.26)
    bolt(r, -0.6, 0.04, "tactical", 0.15)
    scope(r, -1.0, 0.7, 0.38, 0.075, 0.135, 0.1, mount_y=top)
    r.add("Scope", cylf(0.7, 0.95, 0.135))
    return r


def scrapper():
    r = Rifle("Scrapper", "Junkyard build: pipe barrel, plank stock, can suppressor, taped scope.",
              {"Stock": ("8a6a45", "WoodPlanks"), "Barrel": ("7a4b2e", "CorrodedMetal"),
               "Body": ("5c5f62", "CorrodedMetal"), "Accent": ("c9b458", "Fabric"), "Scope": ("3d4a3a", "Metal"),
               "Lens": ("9fd8b5", "Glass"), "Bipod": ("6e4b33", "CorrodedMetal"), "Mount": ("c9b458", "Fabric"),
               "Grip": ("6b4f35", "Wood"), "Magazine": ("4f6a5a", "Metal"), "Muzzle": ("8c8f93", "DiamondPlate"),
               "Pad": ("3a3a3a", "Fabric"), "Bolt": ("8c8f93", "Metal")},
              stats(90, 1.8, 1.3, 4, 3.4, 30, 800, 16))
    r.add("Body", box(-0.7, 0.4, -0.12, 0.12, 0.2))
    for f in (-0.6, -0.1, 0.3):
        for s in (-1, 1):
            r.add("Bolt", box(f, f + 0.04, 0.06, 0.1, 0.006, s * 0.102))
    r.add("Body", cylf(0.3, 0.55, 0.09, n=6))
    r.add("Barrel", cylf(0.55, 3.1, 0.06, n=6))
    for f in (1.4, 2.4):
        r.add("Body", cylf(f, f + 0.12, 0.076, n=6))
    for f in (0.9, 2.0):
        r.add("Accent", cylf(f, f + 0.1, 0.066, n=6))
    r.add("Muzzle", cylf(3.0, 3.45, 0.11))
    r.add("Muzzle", cylf(3.45, 3.5, 0.08))
    r.att["Muzzle"] = ("Muzzle", V(3.5, 0))
    r.add("Stock", beam(V(-0.7, 0.05), V(-2.1, 0.0), 0.16, 0.12))
    r.add("Stock", beam(V(-0.7, -0.25), V(-2.05, -0.42), 0.15, 0.11))
    r.add("Stock", rotate(box(-2.2, -2.05, -0.55, 0.12, 0.18), "x", 4, V(-2.12, -0.2)))
    r.add("Stock", beam(V(-1.5, -0.02), V(-1.4, -0.33), 0.08, 0.06))
    for p in (V(-0.85, 0.04), V(-1.9, 0.01)):
        r.add("Accent", box(p[2] - 0.05, p[2] + 0.05, p[1] - 0.075, p[1] + 0.075, 0.18))
    pgrip(r, -0.45, -0.12, 0.34, 10, 0.13, 0.15)
    trigger(r, -0.22, -0.12)
    r.add("Magazine", cyl(V(0.12, -0.08), V(0.12, -0.45), 0.1))
    r.add("Bolt", beam(V(-0.4, 0.0, -0.1), V(-0.42, -0.08, -0.3), 0.05, 0.04))
    r.add("Bolt", box(-0.48, -0.36, -0.12, -0.06, 0.06, -0.31))
    scope(r, -0.7, 0.55, 0.3, 0.055, 0.09, 0.075, mount_y=0.11)
    bipod(r, 2.6, -0.02, 0.85, True, 0.3, n=4)
    return r


def royal():
    r = Rifle("Royal", "Ornate walnut-and-gold safari rifle with an octagonal barrel.",
              {"Stock": ("5b3418", "Wood"), "Body": ("d4af37", "Metal"), "Barrel": ("2a2a30", "Metal"),
               "Accent": ("d4af37", "Metal"), "Scope": ("2a2a30", "Metal"), "Mount": ("d4af37", "Metal"),
               "Bolt": ("d4af37", "Metal"), "Trigger": ("d4af37", "Metal"), "Pad": ("2a160b", "Fabric"),
               "Lens": ("9be7ff", "Glass"), "Muzzle": ("d4af37", "Metal"), "Magazine": ("d4af37", "Metal")},
              stats(95, 2.4, 1.4, 4, 2.8, 25, 900, 16))
    r.add("Body", cylf(-0.65, 0.45, 0.08))
    r.add("Barrel", cylf(0.45, 3.6, 0.068, 0.05))
    for f in (1.2, 2.4):
        r.add("Accent", cylf(f, f + 0.04, 0.072 - (f - 0.45) * 0.006))
    r.add("Muzzle", cylf(3.6, 3.68, 0.056))
    r.att["Muzzle"] = ("Muzzle", V(3.68, 0))
    r.add("Stock", ext([(-2.3, -0.6), (-1.2, -0.36), (-0.72, -0.32), (-0.62, -0.44), (-0.46, -0.42),
                        (-0.38, -0.2), (0.4, -0.17), (1.7, -0.11), (1.85, -0.13), (1.92, -0.06),
                        (1.85, -0.01), (0.5, -0.01), (0.45, 0.0), (-0.65, 0.0), (-0.8, 0.02),
                        (-1.2, 0.12), (-1.35, 0.16), (-2.0, 0.16), (-2.3, 0.12)], 0.17))
    r.add("Stock", ext(crect(-1.85, -1.25, -0.12, 0.1, 0.04), 0.03, 0.098))
    for s in (-1, 1):
        r.add("Accent", ext([(-1.75, -0.28), (-1.55, -0.2), (-1.35, -0.28), (-1.55, -0.36)], 0.006, s * 0.087))
    r.add("Pad", box(-2.38, -2.3, -0.6, 0.12, 0.175))
    r.att["Grip"] = ("Stock", V(-0.55, -0.25))
    r.add("Magazine", box(-0.15, 0.35, -0.2, -0.16, 0.12))
    trigger(r, -0.25, -0.18)
    bolt(r, -0.45, 0.02, "ball", 0.2)
    scope(r, -0.7, 0.7, 0.26, 0.058, 0.095, 0.078, mount_y=0.06)
    return r


def hornet():
    r = Rifle("Hornet", "Chunky yellow plasma sniper with a glowing core. Toy-like and loud.",
              {"Body": ("ffb000", "SmoothPlastic"), "Stock": ("ffb000", "SmoothPlastic"),
               "Handguard": ("2b2b33", "SmoothPlastic"), "Barrel": ("2b2b33", "SmoothPlastic"),
               "Accent": ("00ff9c", "Neon"), "Scope": ("2b2b33", "SmoothPlastic"), "Lens": ("00ff9c", "Glass"),
               "Pad": ("2b2b33", "SmoothPlastic"), "Grip": ("2b2b33", "SmoothPlastic"),
               "Magazine": ("2b2b33", "SmoothPlastic"), "Muzzle": ("2b2b33", "SmoothPlastic"),
               "Mount": ("2b2b33", "SmoothPlastic")},
              stats(90, 2.0, 1.0, 8, 2.6, 25, 1600, 18))
    r.add("Body", cylf(-0.8, 0.5, 0.15, 0.13))
    r.add("Body", ext([(-0.35, 0.12), (0.2, 0.12), (0.05, 0.3), (-0.2, 0.3)], 0.03))
    r.add("Barrel", cylf(0.5, 2.8, 0.07))
    r.add("Accent", cylf(0.6, 2.6, 0.03, y=0.09, n=6))
    for f in (0.8, 1.5, 2.2):
        r.add("Handguard", cylf(f, f + 0.08, 0.12))
    r.add("Muzzle", cylf(2.8, 3.05, 0.08, 0.13))
    r.add("Accent", cylf(3.05, 3.065, 0.1))
    r.att["Muzzle"] = ("Muzzle", V(3.07, 0))
    r.add("Stock", cyl(V(-0.8, 0.0), V(-2.0, -0.12), 0.1, 0.13))
    r.add("Pad", cyl(V(-2.0, -0.12), V(-2.1, -0.13), 0.2))
    pgrip(r, -0.5, -0.12, 0.34, 15, 0.14, 0.17)
    trigger(r, -0.25, -0.13)
    r.add("Magazine", cyl(V(0.15, -0.1), V(0.15, -0.42), 0.075, n=6))
    r.add("Accent", cyl(V(0.15, -0.26), V(0.15, -0.31), 0.082, n=6))
    r.add("Mount", box(-0.35, 0.05, 0.12, 0.26, 0.08))
    r.add("Scope", cylf(-0.6, 0.3, 0.06, y=0.31))
    r.add("Scope", cylf(-0.72, -0.6, 0.08, y=0.31))
    r.add("Scope", cylf(0.3, 0.5, 0.06, 0.13, y=0.31))
    r.add("Scope", cylf(0.5, 0.56, 0.13, y=0.31))
    r.add("Lens", cylf(0.55, 0.566, 0.1, y=0.31))
    r.add("Lens", cylf(-0.728, -0.71, 0.06, y=0.31))
    r.att["Aim"] = ("Scope", V(-0.85, 0.31))
    bolt(r, -0.45, 0.05, "tactical", 0.18)
    return r


def glacier():
    r = Rifle("Glacier", "Arctic-white anti-materiel bullpup with a carry handle and a giant brake.",
              {"Body": ("dfe7ee", "SmoothPlastic"), "Stock": ("dfe7ee", "SmoothPlastic"),
               "Handguard": ("c7d2db", "SmoothPlastic"), "Barrel": ("3a4048", "Metal"),
               "Muzzle": ("3a4048", "Metal"), "Magazine": ("3a4048", "Metal"), "Grip": ("3a4048", "SmoothPlastic"),
               "Pad": ("2a2f35", "Fabric"), "Scope": ("dfe7ee", "SmoothPlastic"), "Bipod": ("3a4048", "Metal"),
               "Accent": ("6ec6ff", "Neon"), "Mount": ("c7d2db", "SmoothPlastic")},
              stats(135, 1.7, 2.2, 5, 4.0, 18, 1250, 14))
    r.add("Body", ext(crect(-2.2, 0.7, -0.22, 0.2, (0.06, 0.1, 0.06, 0.04)), 0.26))
    r.add("Stock", ext(crect(-2.2, -1.5, -0.55, -0.2, (0.06, 0, 0, 0)), 0.24))
    r.add("Pad", box(-2.3, -2.2, -0.55, 0.2, 0.26))
    r.add("Pad", ext(crect(-2.15, -1.4, 0.2, 0.3, 0.04), 0.16))
    for s in (-1, 1):
        r.add("Accent", box(-2.0, 0.5, -0.06, -0.025, 0.006, s * 0.132))
    r.add("Mount", box(-1.0, -0.9, 0.2, 0.33, 0.06))
    r.add("Mount", box(0.3, 0.4, 0.2, 0.33, 0.06))
    top = rail(r, -1.0, 0.4, 0.38, 0.1)
    r.add("Barrel", cylf(0.7, 3.6, 0.08, 0.075))
    r.add("Handguard", cylf(0.6, 1.7, 0.13))
    wide_brake(r, 3.6, 0.0, 0.48, 0.1, 0.38)
    pgrip(r, -0.3, -0.22, 0.36, 15, 0.13, 0.16)
    trigger(r, -0.08, -0.22)
    mag(r, -1.25, -0.85, -0.22, -0.6, 0.2)
    bipod(r, 1.5, -0.1, 0.95, True, 0.28)
    bolt(r, -1.6, 0.05, "tactical", 0.16)
    scope(r, -1.4, 0.3, 0.57, 0.075, 0.13, 0.1, mount_y=top)
    return r


def nova():
    r = Rifle("Nova", "Laser rifle powered by an exposed crystal, with a ring focusing array.",
              {"Body": ("2a2340", "SmoothPlastic"), "Stock": ("2a2340", "SmoothPlastic"),
               "Handguard": ("3b3160", "SmoothPlastic"), "Barrel": ("c0c4d6", "Metal"),
               "Accent": ("ff4fd8", "Neon"), "Lens": ("ff4fd8", "Glass"), "Scope": ("2a2340", "SmoothPlastic"),
               "Muzzle": ("c0c4d6", "Metal"), "Magazine": ("7cf9ff", "Neon"), "Pad": ("17132a", "Fabric"),
               "Grip": ("17132a", "SmoothPlastic"), "Mount": ("3b3160", "SmoothPlastic")},
              stats(110, 2.0, 1.4, 5, 3.0, 20, 3000, 16))
    r.add("Body", ext([(-0.85, -0.14), (0.5, -0.14), (0.65, -0.04), (0.65, 0.06), (0.45, 0.15),
                       (-0.65, 0.15), (-0.85, 0.05)], 0.22))
    r.add("Magazine", ball(V(0.15, -0.33), 0.11, 1.6))
    for f in (0.0, 0.3):
        r.add("Body", beam(V(f, -0.12), V(f, -0.52), 0.04, 0.04))
    r.add("Body", box(-0.03, 0.33, -0.55, -0.5, 0.12))
    r.add("Barrel", cylf(0.6, 3.2, 0.035, n=6))
    r.add("Handguard", beam(V(0.6, -0.1), V(2.9, -0.1), 0.04, 0.05))
    for f in (1.0, 1.45, 1.9, 2.35, 2.8):
        r.add("Handguard", cylf(f, f + 0.05, 0.12))
        r.add("Accent", cylf(f + 0.015, f + 0.035, 0.13))
    r.add("Muzzle", cylf(3.2, 3.35, 0.04, 0.09, n=6))
    r.add("Accent", cylf(3.35, 3.36, 0.07, n=6))
    r.att["Muzzle"] = ("Muzzle", V(3.36, 0))
    r.add("Stock", ext([(-0.85, 0.15), (-0.85, 0.0), (-2.0, 0.02), (-2.0, 0.14)], 0.15))
    r.add("Stock", beam(V(-0.8, -0.12), V(-2.0, -0.42), 0.12, 0.07))
    r.add("Stock", ext(crect(-2.15, -1.98, -0.55, 0.15, (0.05, 0, 0, 0.03)), 0.16))
    r.add("Pad", box(-2.22, -2.15, -0.55, 0.15, 0.17))
    for s in (-1, 1):
        r.add("Accent", box(-1.9, -0.95, 0.06, 0.09, 0.006, s * 0.078))
    pgrip(r, -0.5, -0.14, 0.34, 20)
    trigger(r, -0.27, -0.14)
    r.add("Mount", box(-0.35, 0.15, 0.13, 0.22, 0.08))
    scope(r, -0.7, 0.45, 0.3, 0.06, 0.09, 0.075, n=6, turrets=False, rings=())
    r.add("Mount", box(-0.35, 0.15, 0.2, 0.25, 0.1))
    return r


ALL = [hawkeye, goliath, frostbite, viper, relic, whisper, pulse, marksman, needle, raptor,
       titan, kestrel, cobra, phantom, longbow, scrapper, royal, hornet, glacier, nova]


def build_all():
    rifles = [fn() for fn in ALL]
    for r in rifles:
        missing = {"Muzzle", "Aim", "Grip"} - set(r.att)
        assert not missing, (r.key, missing)
    return rifles
