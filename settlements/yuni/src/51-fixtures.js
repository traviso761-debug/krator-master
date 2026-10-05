/* ============================== 13a. FIXTURES: BUILDINGS, DOORS, WINDOWS, LIGHTS ==============================
   PLANNER-OWNED. The game-port layer. Everything a game engine has to KNOW about a building, as
   opposed to merely draw, is registered here as plain data with a stable id, so it can be exported
   to Blender or Godot without reading any geometry code:

     FIX.buildings[]  one per placed ASSET instance:  id 'bld_00042', asset key, culture, types[]
     FIX.doors[]      every door, gate and open doorway: hinge, swing, size, which room it opens to
     FIX.windows[]    every window pane (WINPANE), with its outward normal and size
     FIX.lights[]     every flame or electric fitting (nlLampAdd), with its kind

   Ids are assigned in build order, which is deterministic, so the same id names the same door on
   every load. Interiors (64-interiors.js) add rooms, walls, interior doors and furniture with ids
   in the same scheme; KRATOR_EXPORT (bottom) serialises any of it. The schema is documented in
   GAME_EXPORT.md beside this build.

   COORDINATES: metres, Y up, right-handed — exactly glTF's convention, so the numbers drop
   straight into a glTF node (Blender converts to Z-up on import; Godot is Y-up already).
   x east, z south. `yaw` is radians about +Y. Every fixture's LOCAL +Z is its outward normal
   (the street side of a door, the outside of a window): in Godot that is the node's basis.z.  */

var FIX_SCHEMA = 'krator.fixtures/1';
var FIX = { buildings:[], doors:[], windows:[], lights:[], byId:{} };
var FIX_CTX = null;               /* the building being built (set by buildAsset), or null for street fixtures */
/* core/tags (core/tags/README.md): every building, door, window and light is forwarded into the shared tag registry
   as it is registered here, before it is drawn (GODOT-PLAN.md rule 4). The ids pass through unchanged; the export
   is KRATOR_EXPORT.tags() (format 'krator-tags'). */
var FIX_TAGS = KTAGS.page = KTAGS.create({ build:'yuni' });   /* KTAGS.page: the page's registry, for the exporters */

/* the kinds a fixture may take — the vocabulary the export and the engines key on */
var DOOR_STYLES  = ['plank', 'double', 'carved', 'studded', 'mat', 'hatch', 'gate', 'open'];
var LIGHT_KINDS  = ['oil-lantern', 'electric-lantern', 'arc-standard', 'hearth', 'brazier', 'electric', 'flame'];

function fixPad(n){ return ('00000'+n).slice(-5); }
function fixReg(list, prefix, o){
  o.id = prefix + '_' + fixPad(list.length);
  o.building = FIX_CTX ? FIX_CTX.id : null;
  list.push(o); FIX.byId[o.id] = o;
  if(FIX_CTX) (FIX_CTX[prefix+'s'] || (FIX_CTX[prefix+'s']=[])).push(o.id);
  fixTag(prefix, o);
  return o;
}
/* a fixture into core/tags: class fixture, kind door | window | light. at is the base centre: a door's y is its
   sill already, a window's is the pane's centre. Doors and windows carry no depth; 0.2 and 0.1 m stand in. */
function fixTag(prefix, o){
  var r = { id:o.id, 'class':'fixture', kind:prefix, parent:o.building, ry:o.yaw || 0, frag:'51-fixtures' };
  if(prefix==='door'){ r.at = [o.x, o.y, o.z]; r.size = [o.w, 0.2, o.h]; r.tags = { door:o.style }; }
  else if(prefix==='window'){ r.at = [o.x, o.y - o.h/2, o.z]; r.size = [o.w, 0.1, o.h]; r.tags = {}; }
  else { r.at = [o.x, o.y, o.z]; r.tags = { light:o.kind, lit:true }; }
  FIX_TAGS.add(r);
}
/* Game-engine node name. CamelCase type, building, ordinal: 'Door.bld_00042.0'. Blender keeps
   the dots; Godot's glTF importer keeps them too. Collision hints use Godot's suffixes
   (-col, -colonly) and are added only to walls and floors, never to these. */
function fixNodeName(type, o){
  var host = o.building || 'street', n = 0;
  if(o.building && FIX.byId[o.building]){ var L = FIX.byId[o.building][type+'s'] || []; n = L.indexOf(o.id); if(n<0) n = L.length; }
  else n = parseInt(o.id.split('_')[1],10);
  return type.charAt(0).toUpperCase() + type.slice(1) + '.' + host + '.' + n;
}

/* ---- DOORS ----
   FIX_DOOR({ x,y,z, yaw, w,h, style, leaves, hinge, swing, to, ly })
     x,y,z   the centre of the threshold, on the outer face of the wall (y = sill)
     yaw     direction of the OUTWARD normal (atan2(nx,nz))
     style   one of DOOR_STYLES; 'open' has no leaf (an archway or gate gap)
     leaves  1 | 2 ; hinge 'left'|'right' seen from outside ; swing 'in'|'out'
     to      'interior' (a room of this building) | 'court' (its own yard) | 'street'
   The renderer's handles (leaf/reveal bucket indices) are attached by F.door, not exported. */
function FIX_DOOR(o){
  o.style = o.style || 'plank'; o.leaves = o.leaves || 1; o.hinge = o.hinge || 'left'; o.swing = o.swing || 'in';
  o.to = o.to || 'interior'; o.open = 0; o.want = 0;
  return fixReg(FIX.doors, 'door', o);
}
function FIX_WINDOW(o){ return fixReg(FIX.windows, 'window', o); }
function FIX_LIGHT(o){ o.kind = o.kind || 'flame'; return fixReg(FIX.lights, 'light', o); }

/* ---- BUILDING TAGS ----
   README rule: every building is tagged by CULTURE and TYPE. `culture` uses the furniture
   vocabulary (FURN_CULTURES), so an interior can furnish itself from the culture that built it.
   types: civic shop tavern inn industry farm dwelling-single dwelling-multi infrastructure
          religious funerary park (a building may carry several).                              */
var BUILDING_TAGS = {
  mid_washed_house:['yuni-common',['dwelling-single']], mid_bluewash_townhouse:['yuni-common',['dwelling-single']],
  mid_djenne_house:['sahelian',['dwelling-single']], mid_stacked_cubes:['yuni-common',['dwelling-multi']],
  mid_round_tower_house:['yuni-common',['dwelling-single']], mid_courtyard_house:['yuni-common',['dwelling-single']],
  trade_shop_house:['yuni-common',['shop','dwelling-single']], trade_tavern:['yuni-common',['tavern','inn']],
  trade_potter_yard:['yuni-common',['industry']], trade_smithy:['yuni-common',['industry']],
  trade_dyer_yard:['yuni-common',['industry']], trade_craft_shed:['yuni-common',['industry','shop']],
  trade_caravanserai:['nomad',['inn','shop','infrastructure']], trade_market_hall:['yuni-common',['shop']],
  prop_market_stall:['yuni-common',['shop']], prop_market_tent:['nomad',['shop']], prop_fountain_kiosk:['yuni-common',['infrastructure']],
  poor_musgum:['yuni-poor',['dwelling-single']], poor_egg_hut:['yuni-poor',['dwelling-single']], poor_cone_cluster:['yuni-poor',['dwelling-single']],
  poor_mud_house:['yuni-poor',['dwelling-single']], poor_compound:['yuni-poor',['dwelling-multi','farm']], poor_shack:['yuni-poor',['dwelling-single']],
  prop_granary:['yuni-poor',['farm']], prop_hangar:['yuni-poor',['farm']], prop_animal_pen:['yuni-poor',['farm']], prop_well:['yuni-poor',['infrastructure']],
  rich_family_compound:['yuni-court',['dwelling-multi']], rich_merchant_palace:['yuni-court',['dwelling-single','shop']],
  rich_terrace_apartments:['yuni-court',['dwelling-multi']], rich_emir_palace:['yuni-court',['civic','dwelling-single']], rich_tower_house:['yuni-court',['dwelling-single']],
  civic_archive:['order',['civic','religious']], civic_chapter_house:['order',['civic','religious']], civic_hall_records:['order',['civic']],
  civic_sankore_spire:['sahelian',['religious']], civic_bathhouse:['yuni-common',['civic']], civic_bell_tower:['yuni-common',['civic','infrastructure']],
  civic_library:['order',['civic']], civic_school:['order',['civic']]
};
function buildingTags(A){
  var t = BUILDING_TAGS[A.key];
  if(t) return { culture:t[0], types:t[1].slice() };
  if(A.family==='ancient') return { culture:'ancient', types:[/apart|comb|cob/.test(A.key)?'dwelling-multi':/fuel|dish|radar|silo/.test(A.key)?'infrastructure':'industry'] };
  if(A.family==='park') return { culture:'yuni-court', types:['park'] };
  return { culture:'yuni-common', types:[{ poor:'dwelling-single', mid:'dwelling-single', rich:'dwelling-single', trade:'shop', civic:'civic' }[A.family] || 'infrastructure'] };
}

/* a building's wealth tag: none for a building that is only civic, religious, infrastructure or a park (civic is a
   type, not a wealth), or an Ancients ruin; a yuni-* culture's tier otherwise (core/tags maps yuni-court to rich, yuni-common to middle,
   yuni-poor to poor); any other culture's from the placement's 0..1 */
function fixWealth(tg, F){
  var civic = tg.types.every(function(t){ return /^(civic|religious|infrastructure|funerary|park)$/.test(t); });
  if(civic || tg.culture==='ancient') return null;   /* Ancients ruins: no wealth (Travis, 2026-10-05) */
  if(/^yuni-/.test(tg.culture)) return undefined;
  return F.wealth;
}
/* open a building record; buildAsset closes it */
function FIX_BUILDING_BEGIN(A, F){
  var tg = buildingTags(A);
  var b = { id:'bld_'+fixPad(FIX.buildings.length), asset:A.key, name:A.name, family:A.family,
            culture:tg.culture, types:tg.types, variant:F.variant, seed:F.seed, wealth:+F.wealth.toFixed(3),
            x:F.x, y:F.y, z:F.z, yaw:F.ry, w:A.w, d:A.d, h:A.h||8, bodies:[] };
  FIX.buildings.push(b); FIX.byId[b.id] = b; FIX_CTX = b;
  FIX_TAGS.add({ id:b.id, 'class':'building', kind:A.key, key:A.key, name:A.name, at:[b.x, b.y, b.z], ry:b.yaw, size:[b.w, b.d, b.h],
    tags:{ culture:tg.culture, types:tg.types.slice(), family:A.family, wealth:fixWealth(tg, F) }, frag:'51-fixtures' });
  return b;
}
function FIX_BUILDING_END(){ FIX_CTX = null; }

/* ============================== EXPORT ==============================
   KRATOR_EXPORT.building(id)  one building: tags, transform, its doors/windows/lights, and its
                               interior (levels, rooms, walls, doors, stairs, furniture, nav) when
                               64-interiors.js can plan one
   KRATOR_EXPORT.fixtures()    every fixture in the world, flat
   KRATOR_EXPORT.download(obj, filename)                                                       */
function fixClean(o){
  var out = {}; for(var k in o){ if(k.charAt(0)==='_' || k==='open' || k==='want') continue; var v=o[k];
    out[k] = (typeof v==='number') ? +v.toFixed(4) : v; }
  return out;
}
function fixOut(type, o){ var c = fixClean(o); c.type = type; c.node = fixNodeName(type, o); return c; }
var KRATOR_EXPORT = {
  schema: FIX_SCHEMA,
  building: function(id){
    var b = FIX.byId[id]; if(!b) return null;
    var c = fixClean(b); delete c.bodies; delete c.doors; delete c.windows; delete c.lights;
    c.type = 'building'; c.node = 'Building.'+b.id;
    var out = { schema:FIX_SCHEMA, coords:'glTF: metres, +Y up, right-handed; x east, z south; yaw about +Y; local +Z = outward',
      building:c,
      doors:(b.doors||[]).map(function(i){ return fixOut('door', FIX.byId[i]); }),
      windows:(b.windows||[]).map(function(i){ return fixOut('window', FIX.byId[i]); }),
      lights:(b.lights||[]).map(function(i){ return fixOut('light', FIX.byId[i]); }) };
    if(typeof interiorPlan==='function'){ var P = interiorPlan(id); if(P) out.interior = interiorExport(P); }
    /* beds and containers (loot, inventory), planned or not: 64-interiors.js buildingKit() */
    if(typeof buildingKit==='function') out.kit = buildingKit(id);
    return out;
  },
  /* the core/tags registry (core/tags/README.md): every building and fixture, with its uid and normalised tags */
  tags: function(){ return FIX_TAGS.export(); },
  tagAudit: function(){ return FIX_TAGS.audit(); },
  fixtures: function(){
    return { schema:FIX_SCHEMA, coords:'glTF: metres, +Y up, right-handed; x east, z south; yaw about +Y; local +Z = outward',
      buildings:FIX.buildings.map(function(b){ return { id:b.id, asset:b.asset, name:b.name, culture:b.culture, types:b.types,
        x:+b.x.toFixed(3), y:+b.y.toFixed(3), z:+b.z.toFixed(3), yaw:+b.yaw.toFixed(4), w:b.w, d:b.d, h:b.h,
        doors:b.doors||[], windows:b.windows||[], lights:b.lights||[] }; }),
      doors:FIX.doors.map(function(o){ return fixOut('door', o); }),
      windows:FIX.windows.map(function(o){ return fixOut('window', o); }),
      lights:FIX.lights.map(function(o){ return fixOut('light', o); }) };
  },
  download: function(obj, filename){
    var text = JSON.stringify(obj, null, 1); filename = filename || 'krator-export.json';
    /* inside a claude.ai artifact the viewer grants saves through the downloads capability; a plain link does nothing there */
    if(window.claude && window.claude.use){
      window.claude.use('downloads').then(function(dl){ if(dl) return dl.save({ filename:filename, data:text }); fixSave(text, filename); })
        .catch(function(e){ if(e && e.code!=='declined') ERR('export: '+(e.message||e.code)); });
      return; }
    fixSave(text, filename);
  }
};
function fixSave(text, filename){
  {
    var blob = new Blob([text], { type:'application/json' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename || 'krator-export.json'; document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
}
window.KRATOR_EXPORT = KRATOR_EXPORT; window.FIX = FIX;
