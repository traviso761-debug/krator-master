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
          'always': [('eyebrows', 'eyebrow001'), ('eyelashes', 'eyelashes01'), ('eyes', 'low-poly')],
          'items': [('torso', 'Plain tee', 'elvs_crude_t-shirt_male'), ('torso', 'Polo', 'namuhekam_male_polo_shirt'),
                    ('torso', 'Fisherman sweater', 'toigo_fisherman_sweater'), ('torso', 'Kimono', 'mindfront_kimono'),
                    ('legs', 'Cargo trousers', 'cortu_cargo_pants'), ('legs', 'Harem trousers', 'toigo_harem_pants'),
                    ('legs', 'Denim shorts', 'cortu_jeans_shorts'),
                    ('feet', 'Hero boots', 'culturalibre_hero_boots_1'), ('feet', 'Tall boots', 'culturalibre_hero_boots_3'),
                    ('feet', 'Ankle boots', 'toigo_ankle_boots_male'), ('feet', 'Cloth shoes', 'toigo_mj_cloth_shoes'),
                    ('hair', 'Short', 'short02'), ('hair', 'Short messy', 'cortu_short_messy_hair'),
                    ('hair', 'Long', 'long01'), ('hair', 'Ponytail', 'ponytail01'), ('hair', 'Braid', 'braid01'),
                    ('hair', 'Afro', 'afro01'), ('hair', 'Jungle', 'sonntag78_junglebook_hair'),
                    ('hair', 'Cropped', 'short04'), ('hair', 'Side part', 'short01'), ('hair', 'Swept', 'elvs_keylth_hair'),
                    ('hair', 'Shoulder length', 'elvs_that_80s_babe_hair'), ('hair', 'Long loose', 'punkduck_alpha7_long'),
                    ('hair', 'Topknot', 'culturalibre_hair_02'),
                    ('beard', 'Scruffy', 'wdg_scruffy_beard'), ('beard', 'Stubble beard', 'elvs_scruffy_beard1'),
                    ('beard', 'Full beard', 'grinsegold_full_beard'), ('beard', 'Viking beard', 'rehmanpolanski_beard_viking'),
                    ('beard', 'Forked beard', 'grinsegold_beard_sigmund_wip'), ('beard', 'Goatee', 'culturalibre_faun_beard'),
                    ('beard', 'Viking moustache', 'rehmanpolanski_moustache_viking'), ('beard', 'Moustache', 'grinsegold_moustache'),
                    ('beard', 'Short beard', 'Beard_Short'), ('beard', 'Goatee', 'Goatee'), ('beard', 'Long goatee', 'Goatee_Long'),
                    ('beard', 'Light moustache', 'Moustace_Light'), ('beard', 'Thick moustache', 'Moustace_Thick'),
                    ('beard', 'Mutton chops', 'Mutton_Chops'),
                    ('hair', 'Low fade', 'Low_Fade'), ('hair', 'Dreads', 'Dreads_with_Fade'),
                    ('hair', 'Short textured', 'Short_Hair_B'), ('hair', 'Cornrows', 'Two_Braided_Cornrows_Male'),
                    ('hair', 'Viking undercut', 'scalpviking'), ('hair', 'Short neat', 'mhair02'), ('hair', 'Spiky', 'spiky'),
                    ('hair', 'Tousled', 'culturalibre_hair_05'), ('hair', 'Close crop', 'culturalibre_hair_14'),
                    ('hair', 'Comb-over', 'elvs_grump_hair'), ('hair', 'Swept back', 'elvs_maxwell_hair'),
                    ('hair', 'Four-strand braid', 'fourstrandbraid'), ('hair', 'Beaded braid', 'braided_curly_beads4'),
                    ('hair', 'Loose braid', 'elvs_unkempt_french_braid'),
                    # Voth (Chichani) clothing: tools/make_garments.py makes these into MPFB's user data
                    ('torso', 'Voth field cloak', 'voth_m_peasant_cloak'), ('legs', 'Voth loincloth', 'voth_m_peasant_maxtlatl'),
                    ('feet', 'Voth sandals', 'voth_m_sandals'),
                    ('torso', 'Voth artisan xicolli', 'voth_m_trade_xicolli'), ('legs', 'Voth wrap kilt', 'voth_m_trade_kilt'),
                    ('feet', 'Voth heeled sandals', 'voth_m_trade_sandals'),
                    ('torso', 'Voth court robe', 'voth_m_noble_robe'), ('legs', 'Voth court skirt', 'voth_m_noble_skirt'),
                    ('feet', 'Voth gilded sandals', 'voth_m_noble_sandals'),
                    ('head', 'Voth head wrap', 'voth_m_trade_wrap'), ('head', 'Voth quetzal headdress', 'voth_m_noble_headdress')]},
 'female': {'skin': 'young_caucasian_female/young_caucasian_female.mhmat',
          'macro': {'gender': 0.0, 'muscle': 0.55, 'height': 0.5},
          'always': [('eyebrows', 'eyebrow002'), ('eyelashes', 'eyelashes02'), ('eyes', 'low-poly')],
          'items': [('torso', 'Plain tee', 'joepal_crude_t-shirt_female'), ('torso', 'Tank top', 'toigo_keyhole_tank_top'),
                    ('torso', 'Fisherman sweater', 'toigo_fisherman_sweater'), ('torso', 'Kimono', 'mindfront_kimono'),
                    ('torso', 'Bodice', 'toigo_bodice-style_top'),
                    ('legs', 'Cargo trousers', 'cortu_cargo_pants'), ('legs', 'Harem trousers', 'toigo_harem_pants'),
                    ('legs', 'Long full skirt', 'toigo_long_full_skirt'), ('legs', 'Tiered skirt', 'toigo_tiered_mini_skirt'),
                    ('feet', 'Heroine boots', 'culturalibre_heroine_boots_1'), ('feet', 'Pirate boots', 'grinsegold_female_pirate_boots'),
                    ('feet', 'Ankle boots', 'toigo_ankle_boots_female'), ('feet', 'Flats', 'toigo_flats'),
                    ('hair', 'Bob', 'bob02'), ('hair', 'Long', 'long01'), ('hair', 'Ponytail', 'ponytail01'),
                    ('hair', 'Braid', 'braid01'), ('hair', 'French braid bun', 'elvs_reverse_french_braid_bun'),
                    ('hair', 'Afro', 'afro01'), ('hair', 'Bun', 'rehmanpolanski_hair_bun_brown'),
                    ('hair', 'Short', 'short03'), ('hair', 'Afro puffs', 'elvs_micky_afro'), ('hair', 'Long straight', 'o4saken_long01'),
                    ('hair', 'Twin braids', 'elvs_double_mh_braid'), ('hair', 'Bob with bangs', 'toigo_blunt_bob_with_bangs'),
                    ('hair', 'Curly', 'punkduck_alpha7_curly'), ('hair', 'Hippy', 'elvs_lady_hippy_hair'),
                    ('hair', 'Cornrows', 'Two_Braided_Cornrows_Female'), ('hair', 'Afro ponytail', 'AfroPonytail'),
                    ('hair', 'Slick ponytail', 'Afro_Ponytail_-_Slick_Down'), ('hair', 'Pigtails', 'chrissy_piggies_2025'),
                    ('hair', 'Long straight 2', 'fhair01'), ('hair', 'Ringlets', 'southernbelleringlets'),
                    ('hair', 'Brunhilde braid', 'brunhilde'), ('hair', 'Four-strand braid', 'fourstrandbraid'),
                    ('hair', 'Beaded braid', 'braided_curly_beads4'), ('hair', 'Messy bun', 'Messy_Bun'),
                    ('hair', 'Updo', 'elvs_50s_updo'), ('hair', 'Braided bun', 'elvs_braid_bun'),
                    ('hair', 'Long side part', 'elvs_island_princess_hair'),
                    ('hair', 'Loose braid', 'elvs_unkempt_french_braid'), ('hair', 'Curly long', 'punkduck_alpha7_curly2'),
                    ('hair', 'Long wavy', 'culturalibre_hair_17'), ('hair', 'Straight bob', 'o4saken_chinesebob01'),
                    ('hair', 'Short crop', 'culturalibre_hair_13'),
                    ('torso', 'Voth plain huipil', 'voth_f_peasant_huipil'), ('legs', 'Voth wrap skirt', 'voth_f_peasant_cueitl'),
                    ('feet', 'Voth sandals', 'voth_f_sandals'),
                    ('torso', 'Voth banded huipil', 'voth_f_trade_huipil'), ('legs', 'Voth ankle skirt', 'voth_f_trade_skirt'),
                    ('feet', 'Voth heeled sandals', 'voth_f_trade_sandals'),
                    ('torso', 'Voth court huipil', 'voth_f_noble_gown'), ('legs', 'Voth court skirt', 'voth_f_noble_skirt'),
                    ('feet', 'Voth gilded sandals', 'voth_f_noble_sandals'),
                    ('head', 'Voth head wrap', 'voth_f_trade_wrap'), ('head', 'Voth quetzal headdress', 'voth_f_noble_headdress')]},
}[body]
KIND = {'torso': 'clothes', 'legs': 'clothes', 'feet': 'clothes', 'head': 'clothes', 'beard': 'clothes', 'hair': 'hair', 'eyebrows': 'eyebrows',
        'eyelashes': 'eyelashes', 'eyes': 'eyes'}
ATYPE = {'clothes': 'Clothes', 'hair': 'Hair', 'eyebrows': 'Eyebrows', 'eyelashes': 'Eyelashes', 'eyes': 'Eyes'}
def find(kind, name):
    for f in AssetService.list_mhclo_assets(kind):
        if os.path.basename(os.path.dirname(f)) == name: return f
    return None
for o in list(bpy.data.objects): bpy.data.objects.remove(o)
macro = TargetService.get_default_macro_info_dict(); macro.update(ITEMS['macro'])
# detailed helpers: the rig places many joints from the helper 'joint cubes'; without them those fall back to fixed
# default positions and the skeleton comes out scrambled (a female head below her neck). They stay masked in the export
base = HumanService.create_human(mask_helpers=True, detailed_helpers=True, extra_vertex_groups=True, feet_on_ground=True, scale=0.1, macro_detail_dict=macro)
rig = HumanService.add_builtin_rig(base, 'mixamo')
try:
    HumanService.set_character_skin(AssetService.find_asset_absolute_path(ITEMS['skin'], 'skins'), base, skin_type='MAKESKIN')
except Exception as e: print('SKIN fail', e)
manifest = {'body': body, 'items': []}
def load(kind, name):
    f = find(kind, name)
    if not f: print('MISSING', name); return None
    try:
        return HumanService.add_mhclo_asset(f, base, asset_type=ATYPE[kind], subdiv_levels=0, material_type='MAKESKIN')
    except Exception as e:      # an asset made for another base mesh (its vertex references run past ours)
        print('FAILED', name, repr(e)[:160])
        for o in list(bpy.data.objects):
            if o.name.endswith('.' + name) or o.name == name:
                bpy.data.objects.remove(o)
        return None
always = [o for o in (load(k, n) for k, n in ITEMS['always']) if o]
loaded = []
for slot, label, name in ITEMS['items']:
    o = load(KIND[slot], name)
    if o: loaded.append((slot, label, name, o))
# materials: opaque, one-sided skin and cloth; hair and lashes cut out
for o in bpy.data.objects:
    if o.type != 'MESH': continue
    cut = o in always or any(o is x[3] for x in loaded if x[0] in ('hair', 'beard'))
    for ms in o.material_slots:
        if ms.material:
            ms.material.blend_method = 'CLIP' if cut else 'OPAQUE'
            # the Voth garments are single sheets (capes, flaps, skirts seen from inside): both faces drawn
            ms.material.use_backface_culling = not cut and not o.name.split('.')[-1].startswith('voth_')
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
# every mesh carries its Blender vertex index as a custom attribute (_VIDX: glTF keeps names starting '_'), so the
# morph deltas below, indexed by Blender vertex, can be matched to the exported (split, masked) vertices
for o in bpy.data.objects:
    if o.type == 'MESH':
        a = o.data.attributes.get('_VIDX') or o.data.attributes.new('_VIDX', 'FLOAT', 'POINT')
        a.data.foreach_set('value', [float(i) for i in range(len(o.data.vertices))])
def export(objs, fname):
    bpy.ops.object.select_all(action='DESELECT'); rig.select_set(True)
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = rig
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, fname + '.glb'), use_selection=True, export_apply=True,
                              export_skins=True, export_animations=False, export_morph=False, export_yup=True,
                              export_image_format='JPEG', export_jpeg_quality=85, export_attributes=True)
export([base] + always, 'base')
import shutil
for slot, label, name, o in loaded:
    export([o], name)
    manifest['items'].append({'slot': slot, 'name': label, 'id': name, 'glb': name + '.glb', 'hides': len(dg.get(name, []))})
    # a garment's cloth chains (make_garments.py), by its own vertex order, go along for make_mpfb.py
    side = os.path.join(os.path.dirname(find(KIND[slot], name)), name + '.cloth.json')
    if os.path.exists(side):
        shutil.copy(side, os.path.join(OUT, name + '.cloth.json'))
        manifest['items'][-1]['cloth'] = name + '.cloth.json'
        if len(o.data.vertices) != json.load(open(side))['verts']:
            print('CLOTH VERTEX COUNT MISMATCH', name, len(o.data.vertices))
manifest['always'] = [o.name for o in always]       # meshes inside base.glb besides the skin, in morphs.npz order
json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'), indent=1)
json.dump(dg, open(os.path.join(OUT, 'delete_groups.json'), 'w'))
print('DONE', body, len(manifest['items']), 'items')


# ---- morphs: every slider endpoint applied, everything refitted, and the change recorded ----
import numpy as np
from bl_ext.user_default.mpfb.entities.objectproperties import HumanObjectProperties
from bl_ext.user_default.mpfb.services.locationservice import LocationService
TD = LocationService.get_mpfb_data('targets')
MACRO = {'age': (0.375, 0.875), 'muscle': (0.0, 1.0), 'weight': (0.0, 1.0), 'height': (0.0, 1.0),
         'proportions': (0.0, 1.0)}
if body == 'female':
    MACRO.update({'cupsize': (0.0, 1.0), 'firmness': (0.0, 1.0)})
FACE = ['nose/nose-scale-horiz', 'nose/nose-scale-vert', 'nose/nose-scale-depth', 'nose/nose-hump', 'nose/nose-curve',
        'nose/nose-point-width', 'nose/nose-nostrils-width', 'nose/nose-trans-down-up',
        'mouth/mouth-scale-horiz', 'mouth/mouth-lowerlip-volume', 'mouth/mouth-upperlip-volume', 'mouth/mouth-angles-down-up',
        'eyes/eye-scale', 'eyes/eye-trans-in-out', 'eyes/eye-trans-down-up', 'eyes/eye-epicanthus-in-out',
        'eyes/eye-eyefold-angle-down-up', 'eyes/eye-bag',
        'eyebrows/eyebrows-trans-down-up', 'eyebrows/eyebrows-angle-down-up',
        'chin/chin-width', 'chin/chin-height', 'chin/chin-prominent', 'chin/chin-bones',
        'cheek/cheek-bones', 'cheek/cheek-volume', 'forehead/forehead-scale-vert', 'forehead/forehead-trans-backward-forward',
        'head/head-scale-horiz', 'head/head-scale-vert', 'head/head-fat', 'head/head-angle-in-out',
        'ears/ear-scale', 'ears/ear-lobe', 'ears/ear-shape-pointed-triangle', 'neck/measure-neck-circ']
ONE_SIDED = []
cat = json.load(open(os.path.join(TD, 'target.json')))

def endpoints(path):
    """[(label, [target files])] for the negative and positive ends of a MakeHuman category"""
    group, name = path.split('/')
    for c in cat[group]['categories']:
        if c['name'] == name:
            o = c['opposites']
            out = []
            for end in ('negative', 'positive'):
                files = [o[end + '-unsided']] if o[end + '-unsided'] else [o[end + '-left'], o[end + '-right']]
                files = [f for f in files if f]
                if files:
                    out.append((end, [os.path.join(TD, group, f + '.target.gz') for f in files]))
            return c['name'], out
    for c in cat[group]['categories']:          # else the one whose name is this plus its two ends
        if c['name'].startswith(name + '-') and c['name'].count('-') == name.count('-') + 2:
            return endpoints(group + '/' + c['name'])
    return None, []

items_objs = {name: o for slot, label, name, o in loaded}
bones = [b.name for b in rig.data.bones]

def to_gl(v):          # Blender world (Z up) -> glTF (Y up)
    return (v[0], v[2], -v[1])

def capture():
    for m in base.modifiers:
        if m.type == 'MASK': m.show_viewport = False
    dep = bpy.context.evaluated_depsgraph_get()
    out = {}
    ev = base.evaluated_get(dep).to_mesh()
    out['base'] = np.array([to_gl(base.matrix_world @ v.co) for v in ev.vertices], np.float32)
    base.evaluated_get(dep).to_mesh_clear()
    for name, o in list(items_objs.items()) + [('_always%d' % i, o) for i, o in enumerate(always)]:
        out[name] = np.array([to_gl(o.matrix_world @ v.co) for v in o.data.vertices], np.float32)
    out['joints'] = np.array([to_gl(rig.matrix_world @ rig.data.bones[b].head_local) for b in bones], np.float32)
    return out

def refit():
    HumanService.refit(base)
    bpy.context.view_layer.update()

refit()
ref = capture()
targets, deltas = [], {k: [] for k in ref}

def record(label):
    cur = capture()
    targets.append(label)
    for k in ref:
        deltas[k].append(cur[k] - ref[k])
    print('MORPH', label, 'max', float(np.abs(cur['base'] - ref['base']).max()))

for k, (lo, hi) in MACRO.items():
    v0 = HumanObjectProperties.get_value(k, entity_reference=base)
    for end, v in (('min', lo), ('max', hi)):
        HumanObjectProperties.set_value(k, v, entity_reference=base)
        TargetService.reapply_macro_details(base); refit(); record('macro:%s:%s' % (k, end))
    HumanObjectProperties.set_value(k, v0, entity_reference=base)
    TargetService.reapply_macro_details(base)
race0 = {r: HumanObjectProperties.get_value(r, entity_reference=base) for r in ('african', 'asian', 'caucasian')}
for r in ('african', 'asian', 'caucasian'):
    for q in race0:
        HumanObjectProperties.set_value(q, 1.0 if q == r else 0.0, entity_reference=base)
    TargetService.reapply_macro_details(base); refit(); record('race:' + r)
for q, v in race0.items():
    HumanObjectProperties.set_value(q, v, entity_reference=base)
TargetService.reapply_macro_details(base)
for path in FACE + ONE_SIDED:
    cname, ends = endpoints(path) if path not in ONE_SIDED else (path.split('/')[1], [('positive', [os.path.join(TD, path + '.target.gz')])])
    for end, files in ends:
        keys = [TargetService.load_target(base, f, weight=1.0) for f in files if os.path.exists(f)]
        if not keys:
            print('NOFILE', files); continue
        refit(); record('face:%s:%s' % (cname, end))
        for kb in keys: kb.value = 0.0
refit()
np.savez_compressed(os.path.join(OUT, 'morphs.npz'), targets=np.array(targets), bones=np.array(bones),
                    race0=np.array([race0['african'], race0['asian'], race0['caucasian']]),
                    **{'d_' + k: np.array(v, np.float32) for k, v in deltas.items()})
print('MORPHS', len(targets))
