"""Convert models/glb/*.glb into Roblox-ready FBX with Blender, then verify them.

Needs Blender's Python module (pip install bpy; it pins a Python version):

    python roblox-snipers/tools/export_fbx.py

Writes models/fbx/<Rifle>.fbx (one rifle, one MeshPart per skin slot) and
models/fbx/AllSnipers.fbx (all 20 in one file, each under a node named
after the rifle, laid out in a row).

Export settings follow Roblox's Blender guidance: scene unit scale 0.01 with
centimetre length so 1 Blender unit lands as 1 stud, -Z forward / Y up, and
transforms baked into the mesh data so no part arrives rotated.
"""

import glob
import os
import sys

import bpy

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GLB = os.path.join(ROOT, "models", "glb")
FBX = os.path.join(ROOT, "models", "fbx")
ROW_SPACING = 1.2  # studs between rifles in AllSnipers.fbx


def reset():
    # plain 1-unit scene: the glTF importer would otherwise rescale metres to
    # the scene unit and blow everything up 100x
    bpy.ops.wm.read_factory_settings(use_empty=True)


def roblox_units():
    """Roblox's Blender setup: 1 Blender unit = 1 stud, written as cm."""
    units = bpy.context.scene.unit_settings
    units.system = "METRIC"
    units.scale_length = 0.01
    units.length_unit = "CENTIMETERS"


def import_glb(path):
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    return [o for o in bpy.data.objects if o not in before]


def flatten(objects):
    """Unparent meshes (keeping their place) and drop the glTF root empty."""
    meshes = [o for o in objects if o.type == "MESH"]
    for o in meshes:
        world = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = world
    for o in objects:
        if o.type != "MESH":
            bpy.data.objects.remove(o, do_unlink=True)
    return meshes


def export(path, objects, with_empties=False):
    roblox_units()
    bpy.ops.object.select_all(action="DESELECT")
    for o in objects:
        o.select_set(True)
    bpy.ops.export_scene.fbx(
        filepath=path,
        use_selection=True,
        object_types={"MESH", "EMPTY"} if with_empties else {"MESH"},
        apply_unit_scale=True,
        apply_scale_options="FBX_SCALE_ALL",
        axis_forward="-Z",
        axis_up="Y",
        bake_space_transform=True,
        mesh_smooth_type="FACE",
        use_mesh_modifiers=True,
        add_leaf_bones=False,
        bake_anim=False,
        use_custom_props=False,
        path_mode="STRIP",
    )


def verify(path, expect):
    """Re-import an FBX and compare names and sizes with what was exported."""
    reset()
    roblox_units()
    bpy.ops.import_scene.fbx(filepath=path)
    got = {o.name: tuple(round(d, 3) for d in o.dimensions) for o in bpy.data.objects if o.type == "MESH"}
    problems = []
    if set(got) != set(expect):
        problems.append(f"parts differ: {sorted(set(got) ^ set(expect))}")
    for name, dims in expect.items():
        if name in got and max(abs(a - b) for a, b in zip(sorted(got[name]), sorted(dims))) > 0.01:
            problems.append(f"{name} size {got[name]} != {dims}")
    return problems


def main():
    os.makedirs(FBX, exist_ok=True)
    files = sorted(glob.glob(os.path.join(GLB, "*.glb")))
    failures = 0
    for path in files:
        key = os.path.splitext(os.path.basename(path))[0]
        reset()
        meshes = flatten(import_glb(path))
        expect = {o.name: tuple(round(d, 3) for d in o.dimensions) for o in meshes}
        out = os.path.join(FBX, f"{key}.fbx")
        export(out, meshes)
        problems = verify(out, expect)
        failures += bool(problems)
        print(f"{key:10} {len(meshes):3d} parts  {'OK' if not problems else problems}")

    # everything in one file: an empty per rifle, parts renamed <Rifle>_<Slot>
    reset()
    everything, expect = [], {}
    for i, path in enumerate(files):
        key = os.path.splitext(os.path.basename(path))[0]
        meshes = flatten(import_glb(path))
        holder = bpy.data.objects.new(key, None)
        bpy.context.scene.collection.objects.link(holder)
        holder.location = (i * ROW_SPACING, 0, 0)
        for o in meshes:
            o.name = f"{key}_{o.name.split('.')[0]}"
            o.data.name = o.name
            o.parent = holder
            expect[o.name] = tuple(round(d, 3) for d in o.dimensions)
        everything += [holder] + meshes
    out = os.path.join(FBX, "AllSnipers.fbx")
    export(out, everything, with_empties=True)
    problems = verify(out, expect)
    failures += bool(problems)
    print(f"{'AllSnipers':10} {len(expect):3d} parts  {'OK' if not problems else problems}")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
