# Headless: blender -b --python build_kit.py -- <body> <out dir>
# Builds an MPFB human with the Mixamo rig, loads a curated set of library items, exports the base and every item as
# its own GLB on the same rig, and writes each item's delete group (the base vertices it hides) as positions.
import bpy, addon_utils, os, sys, json
addon_utils.enable('bl_ext.user_default.mpfb', default_set=True)
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.targetservice import TargetService
from bl_ext.user_default.mpfb.services.assetservice import AssetService
body, OUT = sys.argv[sys.argv.index('--') + 1:][:2]
os.makedirs(OUT, exist_ok=True)
ITEMS = {
 'male': {'skin': 'young_caucasian_male/young_caucasian_male.mhmat',
          'macro': {'gender': 1.0, 'muscle': 0.6, 'height': 0.55},
          'always': [('eyebrows', 'eyebrow001'), ('eyelashes', 'eyelashes01')],
          'items': [('torso', 'Plain tee', 'elvs_crude_t-shirt_male'), ('torso', 'Polo', 'namuhekam_male_polo_shirt'),
                    ('torso', 'Fisherman sweater', 'toigo_fisherman_sweater'), ('torso', 'Kimono', 'mindfront_kimono'),
                    ('legs', 'Cargo trousers', 'cortu_cargo_pants'), ('legs', 'Harem trousers', 'toigo_harem_pants'),
                    ('legs', 'Denim shorts', 'cortu_jeans_shorts'),
                    ('feet', 'Hero boots', 'culturalibre_hero_boots_1'), ('feet', 'Tall boots', 'culturalibre_hero_boots_3'),
                    ('feet', 'Ankle boots', 'toigo_ankle_boots_male'), ('feet', 'Cloth shoes', 'toigo_mj_cloth_shoes'),
                    ('hair', 'Short', 'short02'), ('hair', 'Short messy', 'cortu_short_messy_hair'),
                    ('hair', 'Long', 'long01'), ('hair', 'Ponytail', 'ponytail01'), ('hair', 'Braid', 'braid01'),
                    ('hair', 'Afro', 'afro01'), ('hair', 'Jungle', 'sonntag78_junglebook_hair')]},
 'female': {'skin': 'young_caucasian_female/young_caucasian_female.mhmat',
          'macro': {'gender': 0.0, 'muscle': 0.55, 'height': 0.5},
          'always': [('eyebrows', 'eyebrow002'), ('eyelashes', 'eyelashes02')],
          'items': [('torso', 'Plain tee', 'joepal_crude_t-shirt_female'), ('torso', 'Tank top', 'toigo_keyhole_tank_top'),
                    ('torso', 'Fisherman sweater', 'toigo_fisherman_sweater'), ('torso', 'Kimono', 'mindfront_kimono'),
                    ('torso', 'Bodice', 'toigo_bodice-style_top'),
                    ('legs', 'Cargo trousers', 'cortu_cargo_pants'), ('legs', 'Harem trousers', 'toigo_harem_pants'),
                    ('legs', 'Long full skirt', 'toigo_long_full_skirt'), ('legs', 'Tiered skirt', 'toigo_tiered_mini_skirt'),
                    ('feet', 'Heroine boots', 'culturalibre_heroine_boots_1'), ('feet', 'Pirate boots', 'grinsegold_female_pirate_boots'),
                    ('feet', 'Ankle boots', 'toigo_ankle_boots_female'), ('feet', 'Flats', 'toigo_flats'),
                    ('hair', 'Bob', 'bob02'), ('hair', 'Long', 'long01'), ('hair', 'Ponytail', 'ponytail01'),
                    ('hair', 'Braid', 'braid01'), ('hair', 'French braid bun', 'elvs_reverse_french_braid_bun'),
                    ('hair', 'Afro', 'afro01'), ('hair', 'Bun', 'rehmanpolanski_hair_bun_brown')]},
}[body]
KIND = {'torso': 'clothes', 'legs': 'clothes', 'feet': 'clothes', 'hair': 'hair', 'eyebrows': 'eyebrows', 'eyelashes': 'eyelashes'}
ATYPE = {'clothes': 'Clothes', 'hair': 'Hair', 'eyebrows': 'Eyebrows', 'eyelashes': 'Eyelashes'}
def find(kind, name):
    for f in AssetService.list_mhclo_assets(kind):
        if os.path.basename(os.path.dirname(f)) == name: return f
    return None
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
macro = TargetService.get_default_macro_info_dict(); macro.update(ITEMS['macro'])
base = HumanService.create_human(mask_helpers=True, detailed_helpers=False, extra_vertex_groups=True, feet_on_ground=True, scale=0.1, macro_detail_dict=macro)
rig = HumanService.add_builtin_rig(base, 'mixamo')
try:
    HumanService.set_character_skin(AssetService.find_asset_absolute_path(ITEMS['skin'], 'skins'), base, skin_type='MAKESKIN')
except Exception as e: print('SKIN fail', e)
manifest = {'body': body, 'items': []}
def load(kind, name):
    f = find(kind, name)
    if not f: print('MISSING', name); return None
    return HumanService.add_mhclo_asset(f, base, asset_type=ATYPE[kind], subdiv_levels=0, material_type='MAKESKIN')
always = [o for o in (load(k, n) for k, n in ITEMS['always']) if o]
loaded = []
for slot, label, name in ITEMS['items']:
    o = load(KIND[slot], name)
    if o: loaded.append((slot, label, name, o))
# materials: opaque, one-sided skin and cloth; hair and lashes cut out
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    cut = o in always or any(o is x[3] for x in loaded if x[0] == 'hair')
    for ms in o.material_slots:
        if ms.material:
            ms.material.blend_method = 'CLIP' if cut else 'OPAQUE'
            ms.material.use_backface_culling = not cut
# each item's delete group: the base vertices (helpers excluded) it hides, by position
# positions from the evaluated mesh (the body-shape targets are shape keys: the stored coordinates are the unmorphed
# basemesh), with every mask off so the vertex order is the mesh's own
for m in base.modifiers:
    if m.type == 'MASK': m.show_viewport = m.show_render = False
dep = bpy.context.evaluated_depsgraph_get()
ev = base.evaluated_get(dep).to_mesh()
co = [base.matrix_world @ v.co for v in ev.vertices]
dg = {}
for slot, label, name, o in loaded:
    gname = 'Delete.' + name
    if gname in base.vertex_groups:
        gi = base.vertex_groups[gname].index
        dg[name] = [list(co[v.index]) for v in base.data.vertices if any(g.group == gi and g.weight > 0.5 for g in v.groups)]
base.evaluated_get(dep).to_mesh_clear()
for m in base.modifiers:
    if m.type == 'MASK' and m.name == 'Hide helpers': m.show_viewport = m.show_render = True
def export(objs, fname):
    bpy.ops.object.select_all(action='DESELECT'); rig.select_set(True)
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, fname + '.glb'), use_selection=True, export_apply=True,
                              export_skins=True, export_animations=False, export_morph=False, export_yup=True,
                              export_image_format='JPEG', export_jpeg_quality=85)
export([base] + always, 'base')
for slot, label, name, o in loaded:
    export([o], name)
    manifest['items'].append({'slot': slot, 'name': label, 'id': name, 'glb': name + '.glb', 'hides': len(dg.get(name, []))})
json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
json.dump(dg, open(os.path.join(OUT, 'delete_groups.json'), 'w'))
print('DONE', body, len(manifest['items']), 'items')
