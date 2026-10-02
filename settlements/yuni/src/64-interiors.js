/* ============================== 15d. INTERIORS ==============================
   PLANNER-OWNED. Rooms inside Yuni's buildings: modular, data first, built lazily.

   THREE LAYERS, each swappable without touching the others:

   1. MODULES (registries below — add or swap entries, nothing else changes)
        FINISH({ key, cultures, wealth, wall:{fam,cols}, floor:{fam,cols}, ceil:{fam,cols}, beams })
        PARTITION({ key, cultures, thick, fam, cols, door:{style,w,h} })   an interior wall + its door
        STAIR({ key, cultures, kind:'stair'|'ladder', w, build(G, s) })      how one level reaches the next
        LAYOUT({ key, room, cultures, wealth, items:[{ furn, at, opt, variant }] })
              a furniture list for one room kind; `at` is an ANCHOR, not a coordinate:
              back left right front centre corner grid run-back run-left run-right
        ROOM_PROGRAM(type, fn)  which room kinds a building of a given type is divided into

   2. THE PLAN (interiorPlan(bid) — pure data, cached, exported by KRATOR_EXPORT)
        No asset describes its own interior. buildAsset (53-assets.js) records every big solid
        volume an asset draws (its BODIES, in local coordinates); each exterior door is traced
        to the body behind it, and rooms are fitted INSIDE that body, inset from its faces:
          levels[] { k, y, H }                  (Mav's Refuge vocabulary: y = floor top, H = clear height)
          rooms[]  { id, lvl, kind, poly, y, h, finish, layout }
          walls[]  { id, kind:'shell'|'partition', module, a, b, lvl, y, h, thick, openings[] }
          doors[]  { id, kind:'exterior'|'interior', fixture, style, at, yaw, w, h, rooms }
          stairs[] { id, module, kind, lvl0, lvl1, foot, top, w }
          furniture[] { id, furn, variant, room, at, y, yaw }
          nav      { nodes[{id,x,y,z,lvl,tag,room?,door?}], edges[{a,b,kind}] }   tags as Mav's:
                   door doorway room stairfoot stairtop; edge kinds door room stair ladder
        All positions are BUILDING-LOCAL (origin at the footprint centre on the ground, +z the
        front), so an engine parents the interior under the building node and nothing moves.

   3. GEOMETRY (buildInteriorGeo(plan) — runtime, by 76-doors.js, only for buildings near you)
        Draws the plan into its own small kit buckets and emits a THREE.Group. Interiors are
        never part of the static city: they cost nothing until you walk up to a door.

   Overriding one building: INTERIOR_PLANS[assetKey] = function(plan, ctx){ ...edit plan... }
   runs after the automatic planner, so a hand-tuned interior is a few lines here, not a fork. */
reseed(640001);

var INTERIOR_SINK = null;            /* while non-null, lamps/windows/sites go to the interior being built */
var INTERIOR_SKIP = { civic_library:1, civic_school:1, trade_caravanserai:1, rich_emir_palace:1, civic_bell_tower:1 };
var INTERIOR_FAMS = { poor:1, mid:1, trade:1, rich:1, civic:1 };
var INTERIOR_PLANS = {};
var FINISHES = [], PARTITIONS = {}, STAIRS = {}, LAYOUTS = [], LAYOUT_BY_KEY = {}, ROOM_PROGRAMS = {};
function FINISH(o){ FINISHES.push(o); return o; }
function PARTITION(o){ PARTITIONS[o.key] = o; return o; }
function STAIR(o){ STAIRS[o.key] = o; return o; }
function LAYOUT(o){ if(LAYOUT_BY_KEY[o.key]) ERR('layout declared twice: '+o.key); LAYOUTS.push(o); LAYOUT_BY_KEY[o.key] = o; return o; }
function ROOM_PROGRAM(type, fn){ ROOM_PROGRAMS[type] = fn; }

(function(){
  /* ============================ FURNITURE TAGS ============================
     README rule: furniture is tagged by culture, TYPE and SETTING (indoor/outdoor/both).
     The pieces registered before this fragment get their type + setting here. */
  /* CONTAINERS are typed by what they hold, because the game reads them as loot and inventory:
       container-item  chests, presses, lockers, baskets, cell walls: tools, cloth, coin, belongings
       container-food  grain sacks, clay pots, water jars, grain bins: what a kitchen or store keeps
     `capacity` is a rough number of inventory slots, so an engine can size the inventory. */
  var T = { common_low_table:'table', common_floor_seating:'seating', common_storage_chest:'container-item', common_water_jars:'container-food',
    court_mosaic_divan:'seating', court_brass_brazier:'lighting', court_writing_desk:'table', sahelian_carved_stool:'seating',
    sahelian_loom:'tool', order_reading_desk:'table', order_shelf_run:'shelving', poor_reed_mat_bed:'bed', poor_hearth_stones:'hearth',
    salvage_panel_table:'table', ancient_moulded_bench:'seating', ancient_glass_console:'table', ancient_cell_wall:'container-item',
    ancient_berth:'bed', ancient_light_stem:'lighting', ancient_refectory_run:'table', ancient_socket_rack:'shelving',
    salvage_strut_bed:'bed', salvage_panel_screen:'screen', salvage_locker_press:'container-item', salvage_hearth_hood:'hearth',
    salvage_lamp_stand:'lighting', order_bookcase:'shelving', order_reading_table:'table', order_lectern:'table',
    order_library_ladder:'tool', order_globe_stand:'decoration', order_pupil_desk:'table', order_master_chair:'seating',
    order_writing_board:'decoration', order_mat_rack:'container-item' };
  var OUT = { court_mosaic_divan:'both', sahelian_carved_stool:'both', poor_hearth_stones:'both', court_brass_brazier:'both', sahelian_loom:'both' };
  FURNS.forEach(function(f){ if(!f.type) f.type = T[f.key] || 'decoration'; if(!f.setting) f.setting = OUT[f.key] || 'indoor'; });

  /* ============================ NEW PIECES ============================
     What a lived-in house needs and the seed set lacked: beds, a cooking hearth, shelving,
     a shop counter, tavern tables, a workbench, a carpet, sacks and pots. */
  function legs(F, w,d, h, r0, col){ [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){ F.cyl(s[0]*(w/2-r0*1.6), 0, s[1]*(d/2-r0*1.6), r0, h, 0, col, 'timber'); }); }
  FURN({ key:'common_rope_bed', name:'Rope-strung bed', culture:'yuni-common', room:'bedroom', type:'bed', setting:'indoor', w:1.1, d:2.0, h:0.62, variants:2, variantNames:['plain','with blanket'],
    build:function(F){ legs(F, 1.1,2.0, 0.40, 0.05, TIMBERC[0]); F.box(0,0.36,0, 1.06,0.08,1.96, 0, TIMBERC[1], 'timber');
      F.box(0,0.44,0, 0.98,0.10,1.88, 0, F.pick(CLOTHC), 'cloth'); F.box(0,0.44,-0.78, 0.70,0.16,0.30, 0, PAL.whitewash[0], 'cloth');
      if(F.variant===1) F.box(0,0.50,0.28, 1.02,0.05,1.2, 0, F.pick(CLOTHC), 'cloth'); } });
  FURN({ key:'court_canopy_bed', name:'Canopied bed', culture:'yuni-court', room:'bedroom', type:'bed', setting:'indoor', w:1.7, d:2.2, h:2.3, variants:1,
    build:function(F){ F.box(0,0,0, 1.66,0.42,2.16, 0, PLANKC[0], 'plank'); F.box(0,0.42,0, 1.56,0.16,2.06, 0, F.pick(CLOTHC), 'cloth');
      for(var k=0;k<3;k++) F.edome((k-1)*0.48, 0.58, -0.82, 0.24,0.12,0.18, 0, F.pick(CLOTHC), 'cloth');
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){ F.cyl(s[0]*0.78,0,s[1]*1.03, 0.045, 2.25, 0, BRASSC[1], 'metal'); });
      F.box(0,2.18,0, 1.66,0.10,2.16, 0, F.pick(CLOTHC), 'cloth'); F.box(0,1.15,-1.06, 1.6,1.05,0.04, 0, F.pick(CLOTHC), 'cloth'); } });
  FURN({ key:'common_cooking_hearth', name:'Raised cooking hearth', culture:'yuni-common', room:'kitchen', type:'hearth', setting:'indoor', w:1.6, d:0.9, h:1.9, variants:1,
    build:function(F){ F.box(0,0,0, 1.6,0.75,0.9, 0, ADOBEC[1], 'adobe'); F.box(-0.35,0.75,0.05, 0.5,0.1,0.5, 0, VOIDC[0], 'dark');
      F.ball(-0.35,0.86,0.05, 0.12, PAL.glowWarm[0], 'glowmat'); F.lathe('tile', -0.35,0.05, [[0.16,0.86],[0.24,0.98],[0.22,1.12],[0.15,1.18]], TILEC[1], {seg:9});
      F.fr5(0,0.75,-0.18, 1.2,1.15,0.5, 0, ADOBEC[2], 'adobe'); F.lamp(-0.35, 1.0, 0.1, 0.8, 6, 'hearth'); } });
  FURN({ key:'common_wall_shelves', name:'Plank wall shelves', culture:'yuni-common', room:'store', type:'shelving', setting:'indoor', w:1.8, d:0.4, h:1.9, variants:2, variantNames:['pots','bolts of cloth'],
    build:function(F){ for(var s=0;s<2;s++) F.box(s?0.86:-0.86,0,0, 0.06,1.9,0.38, 0, TIMBERC[2], 'timber');
      for(var k=0;k<4;k++){ var y=0.25+k*0.5; F.box(0,y,0, 1.8,0.04,0.38, 0, PLANKC[1], 'plank');
        for(var j=0;j<3;j++){ var x=-0.55+j*0.55+F.rr(-0.1,0.1);
          if(F.variant===0) F.lathe('tile', x,0, [[0.07,y+0.04],[0.13,y+0.16],[0.09,y+0.30],[0.06,y+0.34]], F.pick(TILEC), {seg:7});
          else F.cyl(x,y+0.04,0, 0.12,0.30, [Math.PI/2,0,0], F.pick(CLOTHC), 'cloth'); } } } });
  FURN({ key:'common_shop_counter', name:'Shop counter', culture:'yuni-common', room:'shop', type:'counter', setting:'both', w:2.4, d:0.8, h:1.05, variants:2, variantNames:['plain','tiled front'],
    build:function(F){ F.box(0,0,0, 2.4,0.95,0.7, 0, ADOBEC[0], 'adobe'); F.box(0,0.95,0, 2.5,0.08,0.8, 0, PLANKC[0], 'plank');
      if(F.variant===1) F.box(0,0.1,0.36, 2.2,0.7,0.02, 0, F.pick(MOSBLUEC), 'mosaic');
      for(var j=0;j<3;j++) F.lathe('tile', -0.8+j*0.8,0, [[0.08,1.03],[0.13,1.12],[0.09,1.24]], F.pick(TILEC), {seg:7}); } });
  FURN({ key:'common_tavern_table', name:'Tavern table and benches', culture:'yuni-common', room:'tavern', type:'table', setting:'both', w:1.8, d:1.9, h:0.8, variants:1,
    build:function(F){ F.box(0,0.72,0, 1.8,0.07,0.8, 0, PLANKC[2], 'plank'); legs(F, 1.6,0.6, 0.72, 0.05, TIMBERC[1]);
      [-1,1].forEach(function(s){ F.box(0,0.42,s*0.72, 1.7,0.06,0.3, 0, PLANKC[1], 'plank'); F.box(-0.7,0,s*0.72, 0.08,0.42,0.26, 0, TIMBERC[0], 'timber'); F.box(0.7,0,s*0.72, 0.08,0.42,0.26, 0, TIMBERC[0], 'timber'); });
      F.lathe('tile', 0.3,0.1, [[0.06,0.79],[0.10,0.86],[0.07,0.98]], TILEC[2], {seg:7}); } });
  FURN({ key:'common_workbench', name:'Workbench with tools', culture:'yuni-common', room:'workshop', type:'table', setting:'both', w:2.2, d:0.9, h:1.0, variants:1,
    build:function(F){ F.box(0,0.82,0, 2.2,0.12,0.85, 0, PLANKC[3], 'plank'); legs(F, 2.1,0.75, 0.82, 0.07, TIMBERC[2]);
      F.box(0,0.12,0, 1.9,0.05,0.6, 0, PLANKC[2], 'plank'); F.box(-0.6,0.94,0.1, 0.5,0.05,0.12, 0.3, METALC[2], 'metal'); F.box(0.4,0.94,-0.1, 0.06,0.05,0.4, 0, TIMBERC[0], 'timber'); } });
  FURN({ key:'common_grain_sacks', name:'Stacked grain sacks', culture:'yuni-common', room:'store', type:'container-food', setting:'both', w:1.4, d:0.9, h:0.9, variants:1,
    build:function(F){ for(var k=0;k<4;k++) F.edome(-0.38+(k%2)*0.76, (k>>1)*0.42, (k>>1)?0:0.1, 0.34,0.42,0.30, F.rr(-0.3,0.3), F.pick(PAL.thatch||THATCHC), 'cloth'); } });
  FURN({ key:'court_carpet', name:'Knotted carpet', culture:'yuni-court', room:'hall', type:'rug', setting:'indoor', w:2.8, d:2.0, h:0.03, variants:2,
    build:function(F){ F.box(0,0.005,0, 2.8,0.022,2.0, 0, F.pick(CLOTHC), 'cloth'); F.box(0,0.012,0, 2.3,0.022,1.5, 0, F.variant?MOSBLUEC[1]:PAL.paintRed[1], 'cloth'); } });
  FURN({ key:'poor_clay_pots', name:'Clay storage pots', culture:'yuni-poor', room:'store', type:'container-food', setting:'both', w:1.1, d:0.8, h:0.9, variants:1,
    build:function(F){ for(var k=0;k<3;k++){ var x=-0.32+k*0.32, s=F.rr(0.8,1.1);
      F.lathe('tile', x, F.rr(-0.12,0.12), [[0.08*s,0],[0.17*s,0.25*s],[0.16*s,0.55*s],[0.08*s,0.75*s],[0.10*s,0.82*s]], F.pick(ADOBEREDC), {seg:8}); } } });
  FURN({ key:'nomad_rug_pile', name:'Pile of rugs and saddle-bags', culture:'nomad', room:'hall', type:'seating', setting:'both', w:2.2, d:1.6, h:0.6, variants:1,
    build:function(F){ for(var k=0;k<3;k++) F.box(F.rr(-0.1,0.1), k*0.07, F.rr(-0.1,0.1), 2.1-k*0.2, 0.07, 1.5-k*0.15, F.rr(-0.1,0.1), F.pick(CLOTHC), 'cloth');
      F.edome(-0.6,0.21,-0.4, 0.35,0.3,0.25, 0, F.pick(CLOTHC), 'cloth'); F.edome(0.5,0.21,-0.45, 0.3,0.26,0.22, 0, F.pick(CLOTHC), 'cloth'); } });
  /* the minimum kit's small pieces: something a poor house keeps its things in, a big grain store for
     a compound, and the floor coverings every main room gets */
  FURN({ key:'poor_lidded_basket', name:'Lidded storage basket', culture:'yuni-poor', room:'hut', type:'container-item', setting:'indoor', w:0.55, d:0.55, h:0.74, variants:2, variantNames:['plain','bundle on the lid'],
    build:function(F){ var c=F.pick(THATCHC);
      F.lathe('thatch', 0,0, [[0.15,0],[0.24,0.08],[0.26,0.36],[0.23,0.48]], c, {seg:9});
      F.lathe('thatch', 0,0, [[0.25,0.47],[0.26,0.52],[0.15,0.58],[0.04,0.61]], shade(c,-0.12), {seg:9});
      F.box(0,0.24,0.25, 0.04,0.05,0.04, 0, TIMBERC[0], 'timber');
      if(F.variant===1) F.edome(0.02,0.58,0, 0.17,0.14,0.13, 0.3, F.pick(CLOTHC), 'cloth'); } });
  /* the smallest of each, for a hut too tight for the usual piece */
  FURN({ key:'poor_food_pot', name:'Covered food pot', culture:'yuni-poor', room:'hut', type:'container-food', setting:'both', w:0.55, d:0.55, h:0.78, variants:1,
    build:function(F){ var c=F.pick(ADOBEREDC);
      F.lathe('adobe', 0,0, [[0.12,0],[0.25,0.22],[0.24,0.5],[0.14,0.64],[0.17,0.7]], c, {seg:9});
      F.cyl(0,0.7,0, 0.19,0.05, 0, F.pick(THATCHC), 'thatch'); F.box(0,0,0, 0.5,0.04,0.5, 0, shade(c,-0.2), 'adobe'); } });
  FURN({ key:'poor_sleeping_mat', name:'Rolled-out sleeping mat', culture:'yuni-poor', room:'hut', type:'bed', setting:'indoor', w:1.85, d:0.8, h:0.12, variants:1,
    build:function(F){ var c=F.pick(THATCHC); F.box(0,0,0, 1.85,0.05,0.8, 0, shade(c,0.08), 'thatch');
      F.box(0,0.05,0.05, 1.7,0.04,0.66, 0, F.pick(CLOTHC), 'cloth'); F.cyl(-0.72,0.1,0, 0.08,0.6, [Math.PI/2,0,0], PAL.whitewash[1], 'cloth'); } });
  FURN({ key:'common_grain_bin', name:'Mud-brick grain bin', culture:'yuni-common', room:'store', type:'container-food', setting:'both', w:1.3, d:1.3, h:1.75, variants:1,
    build:function(F){ var c=F.pick(ADOBEC);
      F.lathe('adobe', 0,0, [[0.48,0],[0.62,0.25],[0.62,1.15],[0.46,1.45],[0.2,1.55]], c, {seg:10});
      F.cone(0,1.5,0, 0.42,0.28, 0, F.pick(THATCHC), 'thatch');
      F.box(0,0.85,0.55, 0.36,0.36,0.1, 0, PLANKC[1], 'plank'); F.box(0,0,0.0, 1.0,0.12,1.0, 0, shade(c,-0.15), 'adobe'); } });
  FURN({ key:'poor_reed_mat', name:'Woven reed floor mat', culture:'yuni-poor', room:'hut', type:'rug', setting:'indoor', w:2.2, d:1.5, h:0.03, variants:2,
    build:function(F){ var c=F.pick(THATCHC); F.box(0,0.005,0, 2.2,0.018,1.5, 0, shade(c,0.10), 'thatch');
      for(var k=0;k<5;k++) F.box(0,0.012,-0.6+k*0.3, 2.1,0.016,0.07, 0, shade(c,-0.18), 'thatch');
      if(F.variant===1) F.box(0,0.014,0, 0.5,0.016,1.4, 0, F.pick(PAL.paintRed), 'cloth'); } });
  FURN({ key:'common_kilim', name:'Flat-woven kilim', culture:'yuni-common', room:'hall', type:'rug', setting:'indoor', w:2.6, d:1.7, h:0.03, variants:2,
    build:function(F){ var c=F.pick(CLOTHC), r0=F.variant ? MOSBLUEC[3] : PAL.paintRed[0];
      F.box(0,0.005,0, 2.6,0.018,1.7, 0, PAL.whitewash[2], 'cloth'); F.box(0,0.011,0, 2.3,0.018,1.4, 0, c, 'cloth');
      F.box(0,0.017,0, 0.9,0.016,0.9, Math.PI/4, r0, 'cloth'); F.box(0,0.021,0, 0.42,0.016,0.42, Math.PI/4, PAL.whitewash[0], 'cloth');
      [-1,1].forEach(function(s){ F.box(s*0.85,0.017,0, 0.3,0.016,0.3, Math.PI/4, r0, 'cloth'); }); } });
  var CAP = { common_storage_chest:12, common_water_jars:3, common_grain_sacks:8, poor_clay_pots:6, ancient_cell_wall:24, salvage_locker_press:16,
              order_mat_rack:6, poor_lidded_basket:4, common_grain_bin:24, poor_food_pot:3 };
  FURNS.forEach(function(f){ if(f.type==='container-item' || f.type==='container-food') f.capacity = CAP[f.key] || 6; });

  /* ============================ FINISHES ============================ */
  /* FLOORS READ. A floor is a light base, a pattern drawn over it and a border band, by culture and
     class: beaten earth with swept patches (the poor, the Sahelian banco, the salvage lean-tos),
     planks (the plain common house), fired tile (the washed townhouse), a cream mosaic with a blue
     border and medallion (the court), flagstones (the Order, the Ancients). The base colours are
     the LIGHT end of each palette: an interior is lit at a quarter of the sun, and a mid-tone floor
     there reads as black. `pattern` is exported on each room as `floor`. */
  FINISH({ key:'mud_plain',     cultures:['yuni-poor'],               wealth:[0,1],    wall:{fam:'adobe',  cols:ADOBEC},  floor:{fam:'adobe', cols:PAL.paving, pattern:'earth'},   ceil:{fam:'thatch', cols:THATCHC}, beams:true });
  FINISH({ key:'mud_banco',     cultures:['sahelian','nomad'],        wealth:[0,1],    wall:{fam:'adobe',  cols:ADOBEREDC}, floor:{fam:'adobe', cols:[ADOBEC[2], ADOBEC[4]], pattern:'earth'},  ceil:{fam:'plank', cols:PLANKC},  beams:true });
  FINISH({ key:'lime_wash',     cultures:['yuni-common'],             wealth:[0,0.55], wall:{fam:'plaster',cols:WHITEC},  floor:{fam:'plank', cols:[PLANKC[0], PLANKC[2]], pattern:'plank'}, ceil:{fam:'plank', cols:PLANKC},  beams:true });
  FINISH({ key:'blue_wash',     cultures:['yuni-common'],             wealth:[0.4,1],  wall:{fam:'plaster',cols:BLUELC},  floor:{fam:'tile',  cols:[TILEC[0], TILEC[2]], pattern:'tile'},      ceil:{fam:'plank', cols:PLANKC},  beams:true });
  FINISH({ key:'court_mosaic',  cultures:['yuni-court'],              wealth:[0,1],    wall:{fam:'plaster',cols:WHITEC},  floor:{fam:'mosaic',cols:PAL.pavingRich, pattern:'mosaic', accent:MOSBLUEC},   ceil:{fam:'plaster',cols:BLUELC}, beams:false, dado:{fam:'mosaic', cols:MOSWARMC} });
  FINISH({ key:'order_stone',   cultures:['order'],                   wealth:[0,1],    wall:{fam:'plaster',cols:WHITEC},  floor:{fam:'rock',  cols:PAL.pavingRich, pattern:'flag'}, ceil:{fam:'plank', cols:PLANKC}, beams:true });
  FINISH({ key:'ancient_panel', cultures:['ancient'],                 wealth:[0,1],    wall:{fam:'metal',  cols:TARNC},   floor:{fam:'concrete',cols:[CONCRETEC[2], CONCRETEC[0]], pattern:'flag'}, ceil:{fam:'metal', cols:TARNC},  beams:false });
  /* the lean-tos against the Ancients' buildings: mud walls, swept earth, the tarnished panel they roofed it with */
  FINISH({ key:'salvage_mud',   cultures:['ancients-salvage'],        wealth:[0,1],    wall:{fam:'adobe',  cols:ADOBEC},  floor:{fam:'adobe', cols:PAL.paving, pattern:'earth'}, ceil:{fam:'metal', cols:TARNC}, beams:true });

  /* ============================ PARTITIONS ============================ */
  PARTITION({ key:'mud_partition',  cultures:['yuni-poor','sahelian'], thick:0.22, fam:'adobe',   door:{ style:'mat',    w:0.85, h:1.9 } });
  PARTITION({ key:'lime_partition', cultures:['yuni-common','order'],  thick:0.18, fam:'plaster', door:{ style:'plank',  w:0.9,  h:2.05 } });
  PARTITION({ key:'court_partition',cultures:['yuni-court'],           thick:0.20, fam:'plaster', door:{ style:'double', w:1.5,  h:2.4 } });
  PARTITION({ key:'cloth_screen',   cultures:['nomad'],                thick:0.06, fam:'cloth',   door:{ style:'open',   w:1.1,  h:2.0 } });
  PARTITION({ key:'panel_partition',cultures:['ancient','ancients-salvage'], thick:0.12, fam:'metal', door:{ style:'plank', w:1.0, h:2.1 } });

  /* ============================ STAIRS ============================
     s = { lvl0, lvl1, foot:[u,v], top:[u,v], w, rise, run, y0, y1 } in the ROOM FRAME; G draws. */
  STAIR({ key:'timber_stair', cultures:['yuni-common','yuni-court','order','ancients-salvage','ancient'], kind:'stair', w:0.95, tread:0.27,
    build:function(G, s){ var n=Math.max(6, Math.round(s.rise/0.19)), dv=s.run/n, dy=s.rise/n;
      for(var i=0;i<n;i++) G.box(s.u, s.y0+dy*(i+1)-0.05, s.v0+dv*(i+0.5), s.w, 0.05, dv+0.02, G.plankCol, 'plank');
      [-1,1].forEach(function(e){ G.beam(s.u+e*(s.w/2-0.04), s.y0, s.v0, s.u+e*(s.w/2-0.04), s.y1, s.v0+s.run, 0.07, 0.24, G.timberCol, 'timber'); }); } });
  STAIR({ key:'mud_stair', cultures:['sahelian','yuni-poor','nomad'], kind:'stair', w:0.9, tread:0.30,
    build:function(G, s){ var n=Math.max(6, Math.round(s.rise/0.2)), dv=s.run/n, dy=s.rise/n;
      for(var i=0;i<n;i++) G.box(s.u, s.y0, s.v0+dv*(i+0.5), s.w, dy*(i+1), dv+0.01, G.wallCol, 'adobe'); } });
  STAIR({ key:'ladder', cultures:['yuni-poor','yuni-common','sahelian','nomad'], kind:'ladder', w:0.6, tread:0,
    build:function(G, s){ [-1,1].forEach(function(e){ G.rod(s.u+e*0.24, s.y0, s.v0+0.15, s.u+e*0.24, s.y1+0.9, s.v0+s.run, 0.04, G.timberCol); });
      var n=Math.round((s.y1-s.y0)/0.32); for(var i=1;i<=n;i++){ var t=i/(n+1); G.rod(s.u-0.24, s.y0+(s.y1+0.9-s.y0)*t, s.v0+0.15+(s.run-0.15)*t, s.u+0.24, s.y0+(s.y1+0.9-s.y0)*t, s.v0+0.15+(s.run-0.15)*t, 0.025, G.timberCol); } } });

  /* ============================ ROOM PROGRAMS ============================
     fn(b, lvl, area) -> room kinds, the first is the one you enter. One per building TYPE
     (51-fixtures.js BUILDING_TAGS); the first type a building carries that has a program wins. */
  ROOM_PROGRAM('tavern',   function(b,l,a){ return l ? (a>=24?['bedroom','bedroom']:['bedroom']) : ['tavern','kitchen']; });
  ROOM_PROGRAM('shop',     function(b,l,a){ return l ? ['bedroom','store'] : ['shop','store']; });
  ROOM_PROGRAM('industry', function(b,l,a){ return l ? ['store'] : ['workshop','store']; });
  ROOM_PROGRAM('civic',    function(b,l,a){ return l ? ['study'] : (b.culture==='order' ? ['hall','study'] : ['hall']); });
  ROOM_PROGRAM('religious',function(b,l,a){ return ['hall']; });
  ROOM_PROGRAM('dwelling-single', function(b,l,a){ return l ? ['bedroom','store'] : (b.culture==='yuni-poor' ? (a<26?['hut']:['hut','store']) : ['hall','kitchen','bedroom']); });
  ROOM_PROGRAM('dwelling-multi',  function(b,l,a){ return l ? ['bedroom','bedroom'] : (b.culture==='yuni-poor' ? ['hut','store'] : ['hall','kitchen','bedroom']); });
  ROOM_PROGRAM('farm',     function(b,l,a){ return ['store']; });

  /* ============================ LAYOUTS ============================ */
  var C='yuni-common', P='yuni-poor', K='yuni-court', S='sahelian', O='order', N='nomad';
  LAYOUT({ key:'living_common', room:'living', cultures:[C,S], wealth:[0,1], items:[ {furn:'common_rope_bed',at:'back'}, {furn:'common_floor_seating',at:'left'}, {furn:'common_low_table',at:'centre',opt:1}, {furn:'common_water_jars',at:'corner'}, {furn:'common_storage_chest',at:'right',opt:1} ] });
  LAYOUT({ key:'hut_poor',      room:'hut',    cultures:[P], wealth:[0,1], items:[ {furn:'poor_reed_mat_bed',at:'back'}, {furn:'poor_hearth_stones',at:'centre'}, {furn:'poor_clay_pots',at:'corner'}, {furn:'poor_lidded_basket',at:'corner'}, {furn:'common_floor_seating',at:'left',opt:1,variant:0} ] });
  LAYOUT({ key:'living_poor',   room:'living', cultures:[P], wealth:[0,1], items:[ {furn:'poor_reed_mat_bed',at:'back'}, {furn:'poor_hearth_stones',at:'centre'}, {furn:'poor_clay_pots',at:'corner'}, {furn:'poor_lidded_basket',at:'corner'} ] });
  LAYOUT({ key:'hall_common',   room:'hall',   cultures:[C], wealth:[0,1], items:[ {furn:'common_floor_seating',at:'back',variant:1}, {furn:'common_low_table',at:'centre'}, {furn:'common_floor_seating',at:'left',opt:1}, {furn:'common_water_jars',at:'corner',opt:1} ] });
  LAYOUT({ key:'hall_sahelian', room:'hall',   cultures:[S,N], wealth:[0,1], items:[ {furn:'nomad_rug_pile',at:'back'}, {furn:'common_low_table',at:'centre'}, {furn:'sahelian_carved_stool',at:'centre',opt:1}, {furn:'sahelian_carved_stool',at:'centre',opt:1}, {furn:'sahelian_loom',at:'right',opt:1} ] });
  LAYOUT({ key:'hall_court',    room:'hall',   cultures:[K], wealth:[0,1], items:[ {furn:'court_carpet',at:'centre'}, {furn:'court_mosaic_divan',at:'back',variant:1}, {furn:'court_mosaic_divan',at:'left',opt:1}, {furn:'court_brass_brazier',at:'corner'}, {furn:'court_brass_brazier',at:'corner',opt:1}, {furn:'common_low_table',at:'centre',opt:1,variant:1} ] });
  LAYOUT({ key:'hall_order',    room:'hall',   cultures:[O], wealth:[0,1], items:[ {furn:'order_reading_table',at:'grid'}, {furn:'order_shelf_run',at:'run-back'}, {furn:'order_lectern',at:'front',opt:1} ] });
  LAYOUT({ key:'bed_common',    room:'bedroom',cultures:[C,S,N], wealth:[0,1], items:[ {furn:'common_rope_bed',at:'back',variant:1}, {furn:'common_storage_chest',at:'left'}, {furn:'common_floor_seating',at:'right',opt:1,variant:0} ] });
  LAYOUT({ key:'bed_court',     room:'bedroom',cultures:[K], wealth:[0,1], items:[ {furn:'court_canopy_bed',at:'back'}, {furn:'common_storage_chest',at:'left',variant:1}, {furn:'court_writing_desk',at:'right',opt:1}, {furn:'court_brass_brazier',at:'corner',opt:1} ] });
  LAYOUT({ key:'bed_poor',      room:'bedroom',cultures:[P], wealth:[0,1], items:[ {furn:'poor_reed_mat_bed',at:'back'}, {furn:'poor_clay_pots',at:'corner',opt:1} ] });
  LAYOUT({ key:'kitchen_common',room:'kitchen',cultures:[C,K,S,N], wealth:[0,1], items:[ {furn:'common_cooking_hearth',at:'back'}, {furn:'common_wall_shelves',at:'left'}, {furn:'common_water_jars',at:'corner'}, {furn:'common_grain_sacks',at:'corner',opt:1} ] });
  LAYOUT({ key:'kitchen_poor',  room:'kitchen',cultures:[P], wealth:[0,1], items:[ {furn:'poor_hearth_stones',at:'centre'}, {furn:'poor_clay_pots',at:'corner'} ] });
  LAYOUT({ key:'store_any',     room:'store',  cultures:[C,K,S,N,O], wealth:[0,1], items:[ {furn:'common_wall_shelves',at:'run-back'}, {furn:'common_grain_sacks',at:'corner'}, {furn:'common_storage_chest',at:'left',opt:1}, {furn:'common_water_jars',at:'corner',opt:1} ] });
  LAYOUT({ key:'store_poor',    room:'store',  cultures:[P], wealth:[0,1], items:[ {furn:'poor_clay_pots',at:'corner'}, {furn:'poor_clay_pots',at:'corner',opt:1}, {furn:'common_grain_sacks',at:'back',opt:1} ] });
  LAYOUT({ key:'shop_common',   room:'shop',   cultures:[C,K,S,N,P], wealth:[0,1], items:[ {furn:'common_shop_counter',at:'centre'}, {furn:'common_wall_shelves',at:'run-back'}, {furn:'common_grain_sacks',at:'corner',opt:1} ] });
  LAYOUT({ key:'tavern_common', room:'tavern', cultures:[C,K,S,N,P], wealth:[0,1], items:[ {furn:'common_shop_counter',at:'back',variant:1}, {furn:'common_tavern_table',at:'grid'}, {furn:'common_water_jars',at:'corner',opt:1} ] });
  LAYOUT({ key:'workshop_common',room:'workshop',cultures:[C,K,S,N,P], wealth:[0,1], items:[ {furn:'common_workbench',at:'back'}, {furn:'common_wall_shelves',at:'left',variant:0}, {furn:'sahelian_carved_stool',at:'centre',opt:1}, {furn:'common_grain_sacks',at:'corner',opt:1} ] });
  LAYOUT({ key:'study_order',   room:'study',  cultures:[O,K,C], wealth:[0,1], items:[ {furn:'order_reading_desk',at:'back'}, {furn:'order_shelf_run',at:'run-left'}, {furn:'order_master_chair',at:'centre',opt:1} ] });
  /* the salvage lean-tos against the Ancients: one room, furnished from what the building shed */
  var V='ancients-salvage';
  LAYOUT({ key:'living_salvage',room:'living', cultures:[V], wealth:[0,1], items:[ {furn:'salvage_strut_bed',at:'back'}, {furn:'salvage_locker_press',at:'left'}, {furn:'poor_clay_pots',at:'corner'}, {furn:'salvage_lamp_stand',at:'corner',opt:1}, {furn:'salvage_panel_table',at:'right',opt:1} ] });
  LAYOUT({ key:'hut_salvage',   room:'hut',    cultures:[V], wealth:[0,1], items:[ {furn:'salvage_strut_bed',at:'back'}, {furn:'poor_clay_pots',at:'corner'}, {furn:'poor_lidded_basket',at:'corner'}, {furn:'salvage_lamp_stand',at:'corner',opt:1} ] });
  /* the caravanserai's cells: a guest room is a bed and a chest, a storeroom is sacks and bales */
  LAYOUT({ key:'guest_nomad',   room:'bedroom',cultures:[N], wealth:[0,1], items:[ {furn:'common_rope_bed',at:'back',variant:1}, {furn:'common_storage_chest',at:'left'}, {furn:'nomad_rug_pile',at:'right',opt:1} ] });
  LAYOUT({ key:'store_caravan', room:'store',  cultures:[N], wealth:[0,1], items:[ {furn:'common_grain_sacks',at:'run-back'}, {furn:'common_water_jars',at:'corner'}, {furn:'common_storage_chest',at:'left'}, {furn:'poor_clay_pots',at:'corner',opt:1} ] });
})();

/* ============================ THE PLANNER ============================ */
var INTERIOR_CACHE = {};
function intRng(seed){ var st=(seed*2654435761+97)>>>0; return function(){ st=(Math.imul(st,1664525)+1013904223)>>>0; return st/4294967296; }; }
function intPick(rng, arr){ return arr[Math.floor(rng()*arr.length)%arr.length]; }
function intPickMod(rng, list, b){ /* prefer modules made by the building's culture, then yuni-common */
  var m = list.filter(function(o){ return o.cultures.indexOf(b.culture)>=0 && (!o.wealth || (b.wealth>=o.wealth[0] && b.wealth<=o.wealth[1])); });
  if(!m.length) m = list.filter(function(o){ return o.cultures.indexOf(b.culture)>=0; });
  if(!m.length) m = list.filter(function(o){ return o.cultures.indexOf('yuni-common')>=0; });
  return m.length ? intPick(rng, m) : list[0];
}
/* building-local <-> world, matching loc() in 10-core.js (a node with rotation.y = yaw) */
function intToLocal(b, x, z){ var dx=x-b.x, dz=z-b.z, c=Math.cos(b.yaw), s=Math.sin(b.yaw); return [dx*c-dz*s, dx*s+dz*c]; }
function intToWorld(b, lx, lz){ return loc(b.x, b.z, lx, lz, b.yaw); }

/* the solid that holds a point: returns { body, inside(p) } in the body's own terms */
function intBodyAt(b, lx, lz, ly){
  var best=null, ba=0;
  b.bodies.forEach(function(B){
    var top, base=B.y||0, area, ok=false;
    if(B.k==='lathe'){ base=B.prof[0][1]; top=B.prof[B.prof.length-1][1]; }
    else top=base+B.h;
    if(base > ly+0.45 || top < ly+(B.k==='box'?2.3:1.7)) return;
    if(B.k==='box'){ var c=Math.cos(B.r), s=Math.sin(B.r), dx=lx-B.x, dz=lz-B.z, qx=dx*c-dz*s, qz=dx*s+dz*c;
      ok = Math.abs(qx) < B.w/2 && Math.abs(qz) < B.d/2; area=B.w*B.d; }
    else { var r0 = B.k==='lathe' ? latheRmax(B.prof, 2.2) : B.r; ok = Math.hypot(lx-B.x, lz-B.z) < r0; area=Math.PI*r0*r0; }
    if(ok && area>ba){ ba=area; best=B; } });
  return best;
}
function latheRmax(prof, h){ var m=0, y0=prof[0][1]; for(var y=y0; y<=y0+h; y+=0.2) m=Math.max(m, latheR(prof, y)); return m; }
function latheR(prof, y){ for(var i=0;i<prof.length-1;i++){ var a=prof[i], c=prof[i+1]; if(y>=a[1] && y<=c[1]) return a[0]+(c[0]-a[0])*(y-a[1])/Math.max(1e-6,c[1]-a[1]); } return y<prof[0][1]?prof[0][0]:prof[prof.length-1][0]; }
/* half-width of a battered body at height y above its base */
function taperK(B, y){ return 1-(B.tk||0)*y/B.h; }

function interiorPlan(bid){
  if(bid in INTERIOR_CACHE) return INTERIOR_CACHE[bid];
  var b = FIX.byId[bid], P = null;
  try{ P = b ? planBuilding(b) : null; }catch(e){ ERR('interior '+bid+': '+(e&&e.stack||e)); P = null; }
  INTERIOR_CACHE[bid] = P; return P;
}

/* INTERIOR_CUSTOM[assetKey] = function(b, rng) -> plan | null: a hand-written planner for a building
   the automatic one cannot read (the caravanserai's rooms sit behind galleries, with no F.door) */
var INTERIOR_CUSTOM = {};
function planBuilding(b){
  var A = ASSET_BY_KEY[b.asset]; if(!A) return null;
  if(INTERIOR_CUSTOM[A.key]){ var rc = intRng(b.seed*7+b.variant*131+3), Pc = INTERIOR_CUSTOM[A.key](b, rc); if(Pc) ensureKit(Pc, b, rc); return Pc; }
  /* AN ANCIENT BUILDING is not fitted out, but the lean-tos its new owners built against it are:
     a door into a small captured body (61d-ancients-assets.js) is planned as a salvage dwelling */
  var lean = A.family==='ancient';
  if(INTERIOR_SKIP[A.key] || !(INTERIOR_FAMS[A.family] || lean) || !b.doors || !b.bodies.length) return null;
  var bp = lean ? planView(b, 'ancients-salvage', ['dwelling-single']) : b;
  var rng = intRng(b.seed*7+b.variant*131+3), plan = { bid:b.id, asset:b.asset, culture:bp.culture, types:bp.types,
    levels:[], rooms:[], walls:[], doors:[], stairs:[], furniture:[], groups:[], nav:{ nodes:[], edges:[] } };
  var finish = intPickMod(rng, FINISHES, bp), part = intPickMod(rng, PARTITIONS_LIST(), bp);
  plan.finish = finish.key; plan.partition = part.key; plan.floor = finish.floor.pattern || 'earth';
  var used = [];
  b.doors.forEach(function(did){
    var D = FIX.byId[did]; if(!D || D.to!=='interior') return;
    var p = intToLocal(b, D.x, D.z), ly = D.y - b.y, yawL = D.yaw - b.yaw, nx=Math.sin(yawL), nz=Math.cos(yawL);
    var B = intBodyAt(b, p[0]-nx*0.7, p[1]-nz*0.7, ly); if(!B) return;
    if(lean && !(B.k==='box' && B.w*B.d < 45)) return;
    var gi = used.indexOf(B);
    if(gi<0){ used.push(B); gi = plan.groups.length; plan.groups.push(planGroup(plan, bp, B, { p:p, nx:nx, nz:nz, ly:ly, D:D }, rng, finish, part)); }
    else plan.groups[gi].extraDoors.push({ p:p, nx:nx, nz:nz, ly:ly, D:D });
  });
  plan.groups = plan.groups.filter(function(g){ return g && g.ok; });
  if(!plan.groups.length) return null;
  plan.groups.forEach(function(g){ emitGroup(plan, bp, g, rng, part); });
  plan.levels = plan.groups[0].levels;
  if(INTERIOR_PLANS[b.asset]) INTERIOR_PLANS[b.asset](plan, { building:b, rng:rng });
  ensureKit(plan, b, rng);
  return plan;
}
/* the building as the planner should read it (a lean-to is a salvage dwelling, whatever its host is) */
function planView(b, culture, types){ var o = Object.create(b); o.culture = culture; o.types = types; return o; }

/* THE CARAVANSERAI (56-mid.js, 96 x 72): its rooms are the cells of the ranges round the court, each
   behind one of the dark doorways under the gallery. Those doorways are painted, not F.door, so the
   automatic planner sees nothing; this lays one room per doorway along the back range (stores, the
   kitchen, the common room, guest rooms) and the right-hand range (guest rooms and a store), on the
   court level. The left range is the stables. Rooms are data first, like every other plan: they
   draw in the cutaway, and their beds and containers export. */
INTERIOR_CUSTOM.trade_caravanserai = function(b, rng){
  var X=47, Z=35, RB=4.7, G=7.5, xi=X-G, zi=Z-G, LB=2*xi, LS=2*zi, y0=0.08, H=3.7, DEP=RB-0.6;
  var plan = { bid:b.id, asset:b.asset, culture:b.culture, types:b.types, levels:[], rooms:[], walls:[], doors:[], stairs:[], furniture:[], groups:[], nav:{ nodes:[], edges:[] } };
  var finish = intPickMod(rng, FINISHES, b), part = PARTITIONS.cloth_screen;
  plan.finish = finish.key; plan.partition = part.key; plan.floor = finish.floor.pattern || 'earth';
  var cells = [];
  var back = ['store','kitchen','store','tavern','bedroom','bedroom','bedroom','store'];
  for(var i=0;i<15;i+=2) cells.push({ c:[(i-7)*LB/15, -Z+RB+0.3], V:[0,-1], hw:LB/15-0.2, kind:back[i/2] });
  var right = ['bedroom','bedroom','store','bedroom','bedroom','bedroom'];
  for(i=0;i<11;i+=2) cells.push({ c:[X-RB-0.3, (i-5)*LS/11], V:[1,0], hw:LS/11-0.2, kind:right[i/2] });
  cells.forEach(function(C, n){
    var V=C.V, U=[-V[1], V[0]], O=C.c, gid=plan.groups.length;
    var g = { ok:true, body:null, door:null, extraDoors:[], levels:[], zones:[], round:false, hv0:DEP/2,
              frame:{ O:O, U:U, V:V, C:[O[0]+V[0]*DEP/2, O[1]+V[1]*DEP/2] } };
    g.RF = function(u,v){ return [O[0]+U[0]*u+V[0]*v, O[1]+U[1]*u+V[1]*v]; };
    var L = { k:0, y:y0, H:H, hu:C.hw, v0:0, v1:DEP }, z = { kind:C.kind, u0:-C.hw, u1:C.hw, v0:0, v1:DEP };
    L.zones=[z]; g.levels.push(L); plan.groups.push(g);
    var id = plan.bid+'.room.'+plan.rooms.length, poly=[g.RF(z.u0,z.v0), g.RF(z.u1,z.v0), g.RF(z.u1,z.v1), g.RF(z.u0,z.v1)];
    z.id=id; z.lvl=0; z.group=gid;
    plan.rooms.push({ id:id, lvl:0, kind:z.kind, group:gid, poly:poly.map(function(p){ return [+p[0].toFixed(3), +p[1].toFixed(3)]; }), y:y0, h:H, finish:plan.finish, floor:plan.floor, layout:null, _z:z });
    /* the doorway to the gallery, in the middle of the court face */
    var dp = g.RF(0, -0.15), did = plan.bid+'.cell.'+n+'.door';
    plan.doors.push({ id:did, kind:'interior', style:'open', at:[+dp[0].toFixed(3), +dp[1].toFixed(3)], y:y0, yaw:+Math.atan2(-V[0], -V[1]).toFixed(4),
      w:1.1, h:2.1, rooms:[id, 'court'], group:gid, wall:null, lvl:0 });
    var pd = { p:dp, nx:-V[0], nz:-V[1], ly:y0, D:{ id:did, w:1.1, h:2.1 } };
    var c4 = [[-L.hu,L.v0],[L.hu,L.v0],[L.hu,L.v1],[-L.hu,L.v1]];
    for(var j=0;j<4;j++) addShell(plan, b, g, L, g.RF(c4[j][0],c4[j][1]), g.RF(c4[(j+1)%4][0],c4[(j+1)%4][1]), [pd]);
    furnishGroup(plan, b, g, rng);
    navGroup(plan, b, g);
  });
  plan.levels = plan.groups[0].levels;
  return plan;
};
function PARTITIONS_LIST(){ var o=[]; for(var k in PARTITIONS) o.push(PARTITIONS[k]); return o; }

/* one body -> a group: frame, levels, zones */
function planGroup(plan, b, B, door, rng, finish, part){
  var g = { ok:false, body:B, door:door, extraDoors:[], levels:[], zones:[], round:false };
  var y0 = Math.max(door.ly, B.k==='lathe'?B.prof[0][1]:B.y||0) + 0.02, top = B.k==='lathe' ? B.prof[B.prof.length-1][1] : (B.y||0)+B.h;
  /* ON A SLOPE the ground under the uphill side stands above the building's origin: lift the ground
     floor clear of it (both the terrain field and the coarser rendered mesh), by at most 0.9 m */
  if(!SHEET){ var ext = B.k==='box' ? [B.w/2, B.d/2] : null, R0 = B.k==='lathe' ? B.prof[0][0] : B.r, gmax=-1e9;
    for(var gi=-1; gi<=1; gi++) for(var gj=-1; gj<=1; gj++){ var lx, lz;
      if(ext){ var c=Math.cos(B.r||0), s2=Math.sin(B.r||0), px=gi*ext[0]*0.85, pz=gj*ext[1]*0.85; lx=B.x+px*c+pz*s2; lz=B.z-px*s2+pz*c; }
      else { lx=B.x+gi*R0*0.7; lz=B.z+gj*R0*0.7; }
      var w=intToWorld(b, lx, lz), h=Math.max(terrainH(w[0],w[1]), typeof terrMeshH==='function'?terrMeshH(w[0],w[1]):-1e9); gmax=Math.max(gmax, h-b.y); }
    if(gmax+0.05 > y0) y0 = Math.min(gmax+0.05, y0+0.9); }
  if(B.k==='box'){
    /* room frame: V = the body axis most aligned with "inward from the door", U = right seen from outside */
    var ex=[Math.cos(B.r), -Math.sin(B.r)], ez=[Math.sin(B.r), Math.cos(B.r)], inw=[-door.nx,-door.nz], cand=[[ex,1,'x'],[[-ex[0],-ex[1]],1,'x'],[ez,1,'z'],[[-ez[0],-ez[1]],1,'z']], bestV=null, bd=-2;
    cand.forEach(function(c){ var d=c[0][0]*inw[0]+c[0][1]*inw[1]; if(d>bd){ bd=d; bestV=c; } });
    var V=bestV[0], U=[-V[1], V[0]], alongX = bestV[2]==='x';
    var wallT = 0.30, twoLv = (top - y0) >= 6.2 && B.w>=4.2 && B.d>=4.2;
    var H0 = twoLv ? 2.9 : Math.min(top - y0 - 0.35, 3.3);
    if(H0 < 2.2) return g;
    function half(yc){ var k=taperK(B, yc-(B.y||0)); var hx=B.w/2*k-wallT, hz=B.d/2*k-wallT; return alongX ? { hu:hz, hv:hx } : { hu:hx, hv:hz }; }
    var e0 = half(y0+H0); if(e0.hu<0.9 || e0.hv<0.9) return g;
    var O = [B.x - V[0]*e0.hv, B.z - V[1]*e0.hv];
    g.frame = { O:O, U:U, V:V, C:[B.x,B.z] }; g.hv0 = e0.hv;
    g.levels.push({ k:0, y:+y0.toFixed(3), H:+H0.toFixed(3), hu:e0.hu, v0:0, v1:2*e0.hv });
    if(twoLv){ var y1=y0+H0+0.3, H1=Math.min(top-y1-0.35, 3.0);
      if(H1 >= 2.2){ var e1=half(y1+H1); if(e1.hu>=0.9 && e1.hv>=0.9) g.levels.push({ k:1, y:+y1.toFixed(3), H:+H1.toFixed(3), hu:e1.hu, v0:e0.hv-e1.hv, v1:e0.hv+e1.hv }); } }
  } else {
    /* round body: an inscribed polygon, one level */
    var H = Math.min(top - y0 - 0.25, 3.2), R;
    if(B.k==='cyl'){ R = B.r - 0.30; H = Math.max(H, Math.min(2.1, top - y0 + 0.4)); }   /* a hut's thatch gives headroom over its low drum */
    else if(B.k==='dome'){ H = Math.min(B.h*0.62, 3.1); R = B.r*Math.sqrt(Math.max(0,1-Math.pow((H+(y0-(B.y||0)))/B.h,2))) - 0.25; }
    else { R = 1e9; for(var yy=y0; yy<=y0+H+0.01; yy+=0.25) R = Math.min(R, latheR(B.prof, yy)); R -= 0.28; }
    if(H < 1.8 || !(R >= 1.1)) return g;
    var Vr=[-door.nx,-door.nz], Ur=[-Vr[1], Vr[0]];
    g.round = true; g.R = R; g.frame = { O:[B.x - Vr[0]*R, B.z - Vr[1]*R], U:Ur, V:Vr, C:[B.x,B.z] }; g.hv0 = R;
    g.levels.push({ k:0, y:+y0.toFixed(3), H:+H.toFixed(3), hu:R, v0:0, v1:2*R });
  }
  g.ok = true; return g;
}

/* zones, walls, doors, stairs, furniture and nav for one group, appended to the plan */
function emitGroup(plan, b, g, rng, part){
  var f = g.frame, gid = plan.groups.indexOf(g), RF = function(u,v){ return [f.O[0]+f.U[0]*u+f.V[0]*v, f.O[1]+f.U[1]*u+f.V[1]*v]; };
  g.RF = RF;
  var area0 = (2*g.levels[0].hu)*(g.levels[0].v1-g.levels[0].v0);
  function program(lvl, area){
    for(var i=0;i<b.types.length;i++){ var fn=ROOM_PROGRAMS[b.types[i]]; if(fn) return fn(b, lvl, area); }
    return ['hall'];
  }
  var stair = null;
  /* the stair: along the left wall, rising from the front toward the back */
  if(g.levels.length > 1){
    var L0=g.levels[0], L1=g.levels[1], rise=L1.y-L0.y, mod=(b.culture==='yuni-poor') ? STAIRS.ladder : intPickMod(rng, stairList().filter(function(m){ return m.kind==='stair'; }), b);
    var uL = Math.max(-L0.hu, -L1.hu) + 0.05, run = rise/0.19*(mod.tread||0.27), vA = 1.3;
    if(mod.kind==='stair' && vA+run > Math.min(L0.v1, L1.v1)-0.3) mod = STAIRS.ladder;
    if(mod.kind==='ladder'){ run = 1.1; vA = Math.min(L0.v1, L1.v1) - 1.4; }
    var w = mod.w, u = uL + w/2;
    stair = { id:plan.bid+'.stair.'+plan.stairs.length, module:mod.key, kind:mod.kind, lvl0:0, lvl1:1, u:u, w:w, v0:vA, run:run, y0:L0.y, y1:L1.y, rise:rise, group:gid,
              u0:u-w/2, u1:u+w/2, va:vA, vb:vA+run };
    plan.stairs.push(stair); g.stair = stair;
  }
  g.levels.forEach(function(L){
    var W = 2*L.hu, D = L.v1-L.v0, prog = program(L.k, W*D), zones = [];
    var single = prog.length===1 || W*D < 30 || D < 5.0 || g.round;
    if(single){ var k1 = prog[0]; if(prog.length>1 && k1==='hall' && b.types.join().indexOf('dwelling')>=0) k1='living'; zones.push({ kind:k1, u0:-L.hu, u1:L.hu, v0:L.v0, v1:L.v1 }); }
    else {
      var vs = L.v0 + D*0.55;
      zones.push({ kind:prog[0], u0:-L.hu, u1:L.hu, v0:L.v0, v1:vs });
      if(prog.length>=3 && W>=7){ zones.push({ kind:prog[1], u0:-L.hu, u1:0, v0:vs, v1:L.v1 }); zones.push({ kind:prog[2], u0:0, u1:L.hu, v0:vs, v1:L.v1 }); }
      else zones.push({ kind:prog[1], u0:-L.hu, u1:L.hu, v0:vs, v1:L.v1 });
    }
    L.zones = zones;
    zones.forEach(function(z){
      var id = plan.bid+'.room.'+plan.rooms.length, poly;
      /* round: 10 sides, turned so the entrance falls in the middle of a side */
      if(g.round){ poly=[]; var ad=Math.atan2(-f.V[1], -f.V[0]); for(var i=0;i<10;i++){ var a=ad+(i-0.5)/10*TAU; poly.push([f.C[0]+Math.cos(a)*g.R, f.C[1]+Math.sin(a)*g.R]); } }
      else poly = [RF(z.u0,z.v0), RF(z.u1,z.v0), RF(z.u1,z.v1), RF(z.u0,z.v1)];
      z.id = id; z.lvl = L.k; z.group = gid;
      plan.rooms.push({ id:id, lvl:L.k, kind:z.kind, group:gid, poly:poly.map(function(p){ return [+p[0].toFixed(3), +p[1].toFixed(3)]; }), y:L.y, h:L.H, finish:plan.finish, floor:plan.floor, layout:null, _z:z });
    });
    /* partitions (internal splits). A wall the stair passes through stops short of it. */
    if(zones.length>1){
      var vs2 = zones[1].v0, pd = PARTITIONS[plan.partition].door, ops=[];
      var su = (stair && stair.va < vs2 && stair.vb > vs2) ? stair.u1+0.05 : -L.hu;
      zones.slice(1).forEach(function(z){ var uc = Math.min(Math.max((z.u0+z.u1)/2, su + pd.w/2 + 0.15), z.u1 - pd.w/2 - 0.1);
        if(uc - pd.w/2 > su + 0.05) ops.push({ u:uc, w:pd.w, room:z.id }); });
      addWall(plan, g, 'partition', L, [su, vs2], [L.hu, vs2], ops.map(function(o){ return { u:o.u-su, w:o.w, y0:0, y1:pd.h, door:true, room:o.room }; }), PARTITIONS[plan.partition].thick, pd, zones[0].id);
      if(zones.length===3) addWall(plan, g, 'partition', L, [0, vs2], [0, L.v1], [], PARTITIONS[plan.partition].thick, pd);
    }
    /* the shell: the four faces of the level (round bodies: the polygon) */
    var doorsHere = (L.k===0) ? [g.door].concat(g.extraDoors) : [];
    if(g.round){ var room0 = plan.rooms[plan.rooms.length-1];
      var poly2 = room0.poly; for(var i2=0;i2<poly2.length;i2++){ var A2=poly2[i2], B2=poly2[(i2+1)%poly2.length];
        addShell(plan, b, g, L, A2, B2, doorsHere); } }
    else { var c4 = [[-L.hu,L.v0],[L.hu,L.v0],[L.hu,L.v1],[-L.hu,L.v1]];
      for(var j=0;j<4;j++) addShell(plan, b, g, L, RF(c4[j][0],c4[j][1]), RF(c4[(j+1)%4][0],c4[(j+1)%4][1]), doorsHere); }
  });
  /* exterior door records */
  [g.door].concat(g.extraDoors).forEach(function(d){
    var z0 = zoneAt(g, 0, d.p[0]-d.nx*0.9, d.p[1]-d.nz*0.9);
    plan.doors.push({ id:d.D.id, kind:'exterior', fixture:d.D.id, style:d.D.style, at:[+d.p[0].toFixed(3), +d.p[1].toFixed(3)], y:+d.ly.toFixed(3), yaw:+Math.atan2(d.nx,d.nz).toFixed(4),
      w:d.D.w, h:d.D.h, rooms:[z0?z0.id:null, 'outside'], group:gid }); });
  furnishGroup(plan, b, g, rng);
  navGroup(plan, b, g);
}
function stairList(){ var o=[]; for(var k in STAIRS) o.push(STAIRS[k]); return o.filter(function(s){ return s.kind==='stair'; }).concat([STAIRS.ladder]); }
function zoneAt(g, lvl, lx, lz){
  var L=g.levels[lvl]; if(!L||!L.zones) return null; var f=g.frame, dx=lx-f.O[0], dz=lz-f.O[1], u=dx*f.U[0]+dz*f.U[1], v=dx*f.V[0]+dz*f.V[1];
  for(var i=0;i<L.zones.length;i++){ var z=L.zones[i]; if(u>=z.u0-0.3 && u<=z.u1+0.3 && v>=z.v0-0.6 && v<=z.v1+0.3) return z; }
  return L.zones[0];
}
/* a wall in room-frame coordinates (partitions) */
function addWall(plan, g, kind, L, a, b2, ops, thick, pd, roomA){
  var A=g.RF(a[0],a[1]), B=g.RF(b2[0],b2[1]), id=plan.bid+'.wall.'+plan.walls.length;
  var openings = ops.map(function(o, i){
    var dId = id+'.door.'+i, len=Math.hypot(B[0]-A[0],B[1]-A[1]), t=o.u/len, at=[A[0]+(B[0]-A[0])*t, A[1]+(B[1]-A[1])*t];
    if(o.door){ plan.doors.push({ id:dId, kind:'interior', style:pd.style, at:[+at[0].toFixed(3),+at[1].toFixed(3)], y:L.y, yaw:+Math.atan2(-(B[1]-A[1]), B[0]-A[0]).toFixed(4) /* not used: normal is the wall's */,
      w:o.w, h:pd.h, rooms:[roomA||null, o.room||null], group:plan.groups.indexOf(g), wall:id, lvl:L.k }); }
    return { u:+o.u.toFixed(3), w:o.w, y0:o.y0, y1:o.y1, door:o.door?dId:null }; });
  plan.walls.push({ id:id, kind:kind, module:plan.partition, a:[+A[0].toFixed(3),+A[1].toFixed(3)], b:[+B[0].toFixed(3),+B[1].toFixed(3)], lvl:L.k, y:L.y, h:L.H, thick:thick, openings:openings, group:plan.groups.indexOf(g) });
}
/* a shell face between two LOCAL points, with the exterior doors and windows that pierce it */
function addShell(plan, b, g, L, A, B, doors){
  var dx=B[0]-A[0], dz=B[1]-A[1], len=Math.hypot(dx,dz); if(len<0.3) return;
  var tx=dx/len, tz=dz/len, nx=tz, nz=-tx, mx=(A[0]+B[0])/2, mz=(A[1]+B[1])/2, C=g.frame.C;
  if((mx-C[0])*nx+(mz-C[1])*nz < 0){ nx=-nx; nz=-nz; }                       /* outward */
  var ops = [];
  function project(px, pz, qnx, qnz, w, y0, y1, ref){
    if(qnx*nx+qnz*nz < 0.82) return;
    var dist=(px-A[0])*nx+(pz-A[1])*nz, u=(px-A[0])*tx+(pz-A[1])*tz;
    if(dist < -0.2 || dist > 1.6 || u < w/2+0.02 || u > len-w/2-0.02) return;
    ops.push({ u:+u.toFixed(3), w:+w.toFixed(3), y0:+Math.max(0,y0).toFixed(3), y1:+Math.min(L.H-0.12, y1).toFixed(3), depth:+Math.max(0.05,dist).toFixed(3), door:ref.door||null, window:ref.window||null });
  }
  doors.forEach(function(d){ project(d.p[0], d.p[1], d.nx, d.nz, d.D.w+0.04, 0, d.D.h, { door:d.D.id }); });
  (b.windows||[]).forEach(function(wid){ var W=FIX.byId[wid]; if(!W) return; var p=intToLocal(b, W.x, W.z), yl=W.y-b.y-L.y, yawL=W.yaw-b.yaw;
    if(yl-W.h/2 < 0.2 || yl+W.h/2 > L.H-0.1) return;
    project(p[0], p[1], Math.sin(yawL), Math.cos(yawL), W.w, yl-W.h/2, yl+W.h/2, { window:wid }); });
  ops.sort(function(p,q){ return p.u-q.u; });
  for(var i=1;i<ops.length;i++) if(ops[i].u-ops[i].w/2 < ops[i-1].u+ops[i-1].w/2+0.12){ ops.splice(i,1); i--; }
  plan.walls.push({ id:plan.bid+'.wall.'+plan.walls.length, kind:'shell', module:plan.finish, a:[+A[0].toFixed(3),+A[1].toFixed(3)], b:[+B[0].toFixed(3),+B[1].toFixed(3)],
    out:[+nx.toFixed(4),+nz.toFixed(4)], lvl:L.k, y:L.y, h:L.H, thick:0.12, openings:ops, group:plan.groups.indexOf(g) });
}

/* ---- the furniture placer: anchors resolved in each zone's own (u,v) rectangle ---- */
function furnishGroup(plan, b, g, rng){
  var gid = plan.groups.indexOf(g);
  plan.rooms.forEach(function(R){
    if(R.group !== gid) return;
    var z = R._z, cand = LAYOUTS.filter(function(l){ return l.room===z.kind && l.cultures.indexOf(plan.culture)>=0 && b.wealth>=l.wealth[0] && b.wealth<=l.wealth[1]; });
    if(!cand.length) cand = LAYOUTS.filter(function(l){ return l.room===z.kind && l.cultures.indexOf('yuni-common')>=0; });
    if(!cand.length) cand = LAYOUTS.filter(function(l){ return l.room===z.kind; });
    var U0=z.u0+0.08, U1=z.u1-0.08, V0=z.v0+0.08, V1=z.v1-0.08, placed=[], keep=[];
    if(g.round){ var r2=g.R*0.70; U0=-r2; U1=r2; V0=g.R-r2; V1=g.R+r2; }
    /* keep-outs: every door's swing and approach, the stair and its landing */
    plan.doors.forEach(function(d){ if(d.group!==R.group) return; if(d.kind==='interior' && d.lvl!==R.lvl) return; if(d.kind==='exterior' && R.lvl!==0) return;
      var f=g.frame, dx=d.at[0]-f.O[0], dz=d.at[1]-f.O[1], u=dx*f.U[0]+dz*f.U[1], v=dx*f.V[0]+dz*f.V[1], hw=d.w/2+0.35;
      keep.push([u-hw, v-1.3, u+hw, v+1.3]); });
    if(g.stair){ var s=g.stair; keep.push([s.u0-0.1, s.va-1.0, s.u1+0.1, s.vb+1.0]); }
    function free(r){ if(r[0]<U0-1e-6||r[2]>U1+1e-6||r[1]<V0-1e-6||r[3]>V1+1e-6) return false;
      var all=placed.concat(keep); for(var i=0;i<all.length;i++){ var q=all[i]; if(r[0]<q[2]-0.02 && r[2]>q[0]+0.02 && r[1]<q[3]-0.02 && r[3]>q[1]+0.02) return false; } return true; }
    function record(it, Fd, u, v, face, extra){
      var fw = [g.frame.U[0]*face[0]+g.frame.V[0]*face[1], g.frame.U[1]*face[0]+g.frame.V[1]*face[1]], p=g.RF(u,v);
      var rec = { id:R.id+'.f'+plan.furniture.length, furn:Fd.key, variant:it.variant!=null?it.variant%Fd.variants:Math.floor(rng()*Fd.variants), room:R.id,
        at:[+p[0].toFixed(3), +p[1].toFixed(3)], y:R.y, yaw:+Math.atan2(fw[0], fw[1]).toFixed(4), seed:Math.floor(rng()*1e6) };
      if(extra) for(var k in extra) rec[k]=extra[k];
      plan.furniture.push(rec); return rec; }
    function tryAt(it, Fd, u, v, face){ /* face: unit (fu,fv) the piece's front looks along */
      var along = Math.abs(face[1])>0.5, ew = along?Fd.w:Fd.d, ed = along?Fd.d:Fd.w, r=[u-ew/2, v-ed/2, u+ew/2, v+ed/2];
      if(!free(r)) return false; placed.push(r); record(it, Fd, u, v, face); return true; }
    /* anywhere it fits: against each wall in turn, sliding along it, then out in the room */
    function fitAnywhere(Fd, it){
      var st=0.3, u, v;
      for(var k=0; k<=Math.ceil((U1-U0)/st); k++){ u=U0+Fd.w/2+k*st; if(u>U1-Fd.w/2+1e-6) break; if(tryAt(it,Fd, u, V1-Fd.d/2, [0,-1])) return true; }
      for(k=0; k<=Math.ceil((V1-V0)/st); k++){ v=V1-Fd.w/2-k*st; if(v<V0+Fd.w/2-1e-6) break; if(tryAt(it,Fd, U0+Fd.d/2, v, [1,0])) return true; if(tryAt(it,Fd, U1-Fd.d/2, v, [-1,0])) return true; }
      for(k=0; k<=Math.ceil((U1-U0)/st); k++){ u=U0+Fd.w/2+k*st; if(u>U1-Fd.w/2+1e-6) break; if(tryAt(it,Fd, u, V0+Fd.d/2, [0,1])) return true; }
      for(u=U0+Fd.w/2; u<=U1-Fd.w/2+1e-6; u+=st) for(v=V0+Fd.d/2; v<=V1-Fd.d/2+1e-6; v+=st) if(tryAt(it,Fd, u, v, [0,-1])) return true;
      return false; }
    R._fit = { fitAnywhere:fitAnywhere, record:record };
    /* THE FLOOR COVERING. The room you walk into gets a rug or a mat, laid first and outside
       the collision test (furniture stands on it). Culture picks it; size picks whether it fits. */
    var main = R.lvl===0 && plan.rooms.filter(function(q){ return q.group===gid && q.lvl===0; })[0]===R;
    if(main && !(cand.length===1 && cand[0].items.some(function(it){ var F0=FURN_BY_KEY[it.furn]; return F0 && F0.type==='rug'; }))){
      var rugs = RUG_BY_CULTURE[plan.culture] || RUG_BY_CULTURE['yuni-common'];
      for(var ri=0; ri<rugs.length; ri++){ var RF0=FURN_BY_KEY[rugs[ri]]; if(!RF0) continue;
        var spanU=U1-U0, spanV=V1-V0, rot = (spanU < RF0.w+0.3 && spanV >= RF0.w+0.3);
        var ew=rot?RF0.d:RF0.w, ed=rot?RF0.w:RF0.d;
        if(ew+0.3 <= spanU && ed+0.3 <= spanV){ record({}, RF0, (U0+U1)/2, (V0+V1)/2, rot?[1,0]:[0,-1], { cover:true }); break; } } }
    if(!cand.length) return;
    var lay = intPick(rng, cand); R.layout = lay.key;
    /* THE KIT IS NEVER DROPPED. Items go down in the layout's order (the room's main piece — the
       hearth, the counter — first); a required bed or container that misses its anchor goes
       wherever it fits, and ensureKit() tops up whatever is still missing after every room. */
    lay.items.forEach(function(it){
      var Fd = FURN_BY_KEY[it.furn]; if(!Fd) return;
      var W=U1-U0, um=(U0+U1)/2, vm=(V0+V1)/2, ok=false, at=it.at, i, list;
      if(at==='back'||at==='run-back'){ list=[0,-0.28,0.28,-0.42,0.42]; for(i=0;i<list.length && !ok;i++) ok=tryAt(it,Fd, um+list[i]*W, V1-Fd.d/2, [0,-1]);
        if(at==='run-back') for(i=0;i<8;i++) tryAt(it,Fd, U0+Fd.w/2+i*(Fd.w+0.3), V1-Fd.d/2, [0,-1]); }
      else if(at==='left'||at==='run-left'){ list=[0.5,0.7,0.3,0.85]; for(i=0;i<list.length && !ok;i++) ok=tryAt(it,Fd, U0+Fd.d/2, V0+(V1-V0)*list[i], [1,0]);
        if(at==='run-left') for(i=0;i<8;i++) tryAt(it,Fd, U0+Fd.d/2, V1-Fd.w/2-i*(Fd.w+0.3), [1,0]); }
      else if(at==='right'||at==='run-right'){ list=[0.5,0.7,0.3,0.85]; for(i=0;i<list.length && !ok;i++) ok=tryAt(it,Fd, U1-Fd.d/2, V0+(V1-V0)*list[i], [-1,0]); }
      else if(at==='front'){ list=[0.35,-0.35,0.2,-0.2]; for(i=0;i<list.length && !ok;i++) ok=tryAt(it,Fd, um+list[i]*W, V0+Fd.d/2, [0,1]); }
      else if(at==='corner'){ var cs=[[U0+Fd.w/2,V1-Fd.d/2,[0,-1]],[U1-Fd.w/2,V1-Fd.d/2,[0,-1]],[U0+Fd.w/2,V0+Fd.d/2,[0,1]],[U1-Fd.w/2,V0+Fd.d/2,[0,1]]];
        if(rng()<0.5) cs=[cs[1],cs[0],cs[3],cs[2]]; for(i=0;i<cs.length && !ok;i++) ok=tryAt(it,Fd, cs[i][0], cs[i][1], cs[i][2]); }
      else if(at==='grid'){ var sx=Fd.w+1.1, sz=Fd.d+1.1; for(var gu=U0+Fd.w/2+0.4; gu<=U1-Fd.w/2-0.4; gu+=sx) for(var gv=V0+Fd.d/2+0.9; gv<=V1-Fd.d/2-0.4; gv+=sz) tryAt(it,Fd, gu, gv, [0,-1]); }
      else { list=[[0,0],[0.18,0],[-0.18,0],[0,0.15],[0,-0.15],[0.22,0.2],[-0.22,0.2]]; for(i=0;i<list.length && !ok;i++) ok=tryAt(it,Fd, um+list[i][0]*W, vm+list[i][1]*(V1-V0), [0,-1]); }
      /* a required kit piece that missed its anchor goes wherever it fits */
      if(!ok && !it.opt && KIT_TYPES[Fd.type] && at!=='grid' && at.indexOf('run-')<0) fitAnywhere(Fd, it);
    });
  });
}

/* ============================ THE MINIMUM KIT ============================
   Every building has to hold things, and every home has to be slept in and eaten from, because
   the game reads these slots as beds, loot and inventory:
     dwelling (dwelling-single / dwelling-multi)  a bed per bedroom (and at least 1; 2 in a
        multi-family building), a food container (2 in a compound, a multi-family building or a
        wealthy house) and an item container (2 in a compound or multi-family building)
     every building  at least one item container
     food            a food container in every kitchen, store, shop and tavern room, and in every
                     building typed shop, tavern, inn or farm (granaries, farmsteads, the caravanserai)
   ensureKit() runs after a plan is furnished and places what the layouts did not, in the room
   that suits it, wherever it fits. A slot that fits nowhere is still recorded, `virtual:true`,
   with no geometry, so the game always has it. Buildings with no planned interior get a
   minimal data-only plan of virtual slots (buildingKit()). */
var KIT_TYPES = { 'bed':1, 'container-item':1, 'container-food':1 };
var KIT_PIECES = {
  'yuni-poor':        { bed:['poor_reed_mat_bed','poor_sleeping_mat'], food:['poor_clay_pots','common_water_jars','poor_food_pot'], item:['poor_lidded_basket','common_storage_chest'], store:['common_grain_bin','common_grain_sacks','poor_food_pot'] },
  'yuni-common':      { bed:['common_rope_bed','poor_reed_mat_bed','poor_sleeping_mat'], food:['common_grain_sacks','common_water_jars','poor_clay_pots','poor_food_pot'], item:['common_storage_chest','poor_lidded_basket'], store:['common_grain_bin','common_grain_sacks','poor_food_pot'] },
  'yuni-court':       { bed:['court_canopy_bed','common_rope_bed','poor_reed_mat_bed','poor_sleeping_mat'], food:['common_water_jars','common_grain_sacks','poor_clay_pots','poor_food_pot'], item:['common_storage_chest','poor_lidded_basket'], store:['common_grain_bin','common_grain_sacks','poor_food_pot'] },
  'sahelian':         { bed:['common_rope_bed','poor_reed_mat_bed','poor_sleeping_mat'], food:['poor_clay_pots','common_grain_sacks','common_water_jars','poor_food_pot'], item:['common_storage_chest','poor_lidded_basket'], store:['common_grain_bin','common_grain_sacks','poor_food_pot'] },
  'nomad':            { bed:['common_rope_bed','poor_reed_mat_bed','poor_sleeping_mat'], food:['common_grain_sacks','common_water_jars','poor_clay_pots','poor_food_pot'], item:['common_storage_chest','poor_lidded_basket'], store:['common_grain_sacks','common_grain_bin','poor_food_pot'] },
  'order':            { bed:['common_rope_bed','poor_reed_mat_bed','poor_sleeping_mat'], food:['common_water_jars','common_grain_sacks','poor_clay_pots','poor_food_pot'], item:['common_storage_chest','poor_lidded_basket'], store:['common_grain_sacks','common_grain_bin','poor_food_pot'] },
  'ancients-salvage': { bed:['salvage_strut_bed','poor_reed_mat_bed','poor_sleeping_mat'], food:['poor_clay_pots','common_water_jars','poor_food_pot'], item:['salvage_locker_press','poor_lidded_basket'], store:['common_grain_sacks','poor_clay_pots','poor_food_pot'] },
  'ancient':          { bed:['ancient_berth','salvage_strut_bed','poor_reed_mat_bed','poor_sleeping_mat'], food:['poor_clay_pots','common_water_jars','poor_food_pot'], item:['ancient_cell_wall','salvage_locker_press','poor_lidded_basket'], store:['common_grain_sacks','poor_clay_pots','poor_food_pot'] }
};
var RUG_BY_CULTURE = { 'yuni-poor':['poor_reed_mat'], 'ancients-salvage':['poor_reed_mat'], 'yuni-court':['court_carpet','common_kilim','poor_reed_mat'],
  'yuni-common':['common_kilim','poor_reed_mat'], 'sahelian':['common_kilim','poor_reed_mat'], 'nomad':['common_kilim','poor_reed_mat'], 'order':['poor_reed_mat'] };
var FOOD_ROOMS = { kitchen:1, store:1, shop:1, tavern:1 };
var FOOD_TYPES = { shop:1, tavern:1, inn:1, farm:1 };
function kitPieces(culture){ return KIT_PIECES[culture] || KIT_PIECES['yuni-common']; }
function isDwelling(b){ return b.types.some(function(t){ return t==='dwelling-single' || t==='dwelling-multi'; }); }
function kitNeeds(b, P){
  var dw = isDwelling(b), multi = b.types.indexOf('dwelling-multi')>=0, compound = multi || /compound|apartments/.test(b.asset);
  var bedrooms = P ? P.rooms.filter(function(r){ return r.kind==='bedroom'; }).length : 0;
  return { bed: dw ? Math.max(1, bedrooms, multi?2:1) : 0,
           food: dw ? ((compound || b.wealth>0.7) ? 2 : 1) : (b.types.some(function(t){ return FOOD_TYPES[t]; }) ? 1 : 0),
           item: compound ? 2 : 1, dwelling:dw, compound:compound };
}
function kitKind(type){ return type==='bed' ? 'bed' : type==='container-food' ? 'food' : type==='container-item' ? 'item' : null; }
function ensureKit(plan, b, rng){
  var need = kitNeeds(b, plan), K = kitPieces(plan.culture);
  function inRoom(kind, rid){ return plan.furniture.filter(function(f){ var F0=FURN_BY_KEY[f.furn]; return F0 && kitKind(F0.type)===kind && (!rid || f.room===rid); }).length; }
  function place(keys, R){ if(!R || !R._fit) return false;
    for(var i=0;i<keys.length;i++){ var Fd=FURN_BY_KEY[keys[i]]; if(Fd && R._fit.fitAnywhere(Fd, {})) return true; } return false; }
  function virtualSlot(keys, R){ var R0 = R || plan.rooms[0], c=[0,0]; R0.poly.forEach(function(p){ c[0]+=p[0]/R0.poly.length; c[1]+=p[1]/R0.poly.length; });
    plan.furniture.push({ id:R0.id+'.f'+plan.furniture.length, furn:keys[0], variant:0, room:R0.id, at:[+c[0].toFixed(3), +c[1].toFixed(3)], y:R0.y, yaw:0, seed:0, virtual:true }); }
  function rank(prefer){ return plan.rooms.slice().sort(function(p,q){ return (prefer.indexOf(p.kind)<0?9:prefer.indexOf(p.kind)) - (prefer.indexOf(q.kind)<0?9:prefer.indexOf(q.kind)); }); }
  /* per room: a bed in each bedroom, food where food is kept */
  plan.rooms.forEach(function(R){
    if(R.kind==='bedroom' && !inRoom('bed', R.id) && !place(K.bed, R)) virtualSlot(K.bed, R);
    if(FOOD_ROOMS[R.kind] && !inRoom('food', R.id) && !place(R.kind==='store' && need.compound ? K.store.concat(K.food) : K.food, R)) virtualSlot(K.food, R);
  });
  /* per building: the totals */
  [['bed', need.bed, K.bed, ['bedroom','hut','living','hall']],
   ['food', need.food, need.compound ? K.store.concat(K.food) : K.food, ['kitchen','store','hut','living','shop','tavern','hall']],
   ['item', need.item, K.item, ['bedroom','store','hut','living','hall','study','workshop','shop']]].forEach(function(n){
    var guard=0;
    while(inRoom(n[0]) < n[1] && guard++ < 6){
      var rooms = rank(n[3]), ok=false;
      for(var i=0;i<rooms.length && !ok;i++) ok = place(n[2], rooms[i]);
      if(!ok){ virtualSlot(n[2], rooms[0]); }
    } });
}
/* the kit of any building, planned or not: { bid, needs, slots[], minimal } — slots are the beds and
   containers by kind, with their furniture id when a planned room holds them */
var KIT_CACHE = {};
function buildingKit(bid){
  if(bid in KIT_CACHE) return KIT_CACHE[bid];
  var b = FIX.byId[bid]; if(!b) return null;
  var P = interiorPlan(bid), need = kitNeeds(b, P), out = { bid:bid, needs:{ bed:need.bed, food:need.food, item:need.item }, slots:[], minimal:!P };
  if(P){ P.furniture.forEach(function(f){ var F0=FURN_BY_KEY[f.furn], k=F0 && kitKind(F0.type); if(!k) return;
    out.slots.push({ id:f.id, kind:k, type:F0.type, furn:f.furn, capacity:F0.capacity||0, room:f.room, at:f.at, y:f.y, virtual:!!f.virtual }); }); }
  else {
    /* MINIMAL PLAN: no room could be fitted (an open shed, a megastructure, a hut whose mouth is not a
       door), so the slots stand at the footprint centre, data only, in the building's own frame */
    var K = kitPieces(b.culture === 'ancient' && need.dwelling ? 'ancients-salvage' : b.culture), n=0;
    function add(kind, keys, count){ for(var i=0;i<count;i++){ var F0=FURN_BY_KEY[keys[0]];
      out.slots.push({ id:bid+'.slot.'+(n++), kind:kind, type:F0.type, furn:F0.key, capacity:F0.capacity||0, room:null, at:[0,0], y:0, virtual:true }); } }
    add('bed', K.bed, need.bed); add('food', need.compound ? K.store : K.food, need.food); add('item', K.item, need.item);
  }
  KIT_CACHE[bid] = out; return out;
}
/* THE AUDIT. Counts what the rules above promise; every number but the totals should read 0. */
function kitAudit(){
  var r = { buildings:0, dwellings:0, planned:0, dwellingsMissingKit:0, buildingsMissingItem:0, foodPlacesMissingFood:0, bedroomsWithoutBed:0,
            slots:0, virtualSlots:0, minimalPlans:0, plannedDwellingsWithVirtualSlots:0 };
  FIX.buildings.forEach(function(b){
    var P = interiorPlan(b.id), K = buildingKit(b.id); if(!K) return; r.buildings++; if(P) r.planned++; else r.minimalPlans++;
    var c = { bed:0, food:0, item:0 }, virt=0; K.slots.forEach(function(s){ c[s.kind]++; r.slots++; if(s.virtual){ r.virtualSlots++; virt++; } });
    if(K.needs.bed){ r.dwellings++; if(c.bed < K.needs.bed || c.food < K.needs.food || c.item < K.needs.item) r.dwellingsMissingKit++; if(P && virt) r.plannedDwellingsWithVirtualSlots++; }
    if(c.item < 1) r.buildingsMissingItem++;
    if(c.food < K.needs.food) r.foodPlacesMissingFood++;
    if(P) P.rooms.forEach(function(R){
      var has = function(kind){ return K.slots.some(function(s){ return s.room===R.id && s.kind===kind; }); };
      if(R.kind==='bedroom' && !has('bed')) r.bedroomsWithoutBed++;
      if(FOOD_ROOMS[R.kind] && !has('food')) r.foodPlacesMissingFood++; });
  });
  return r;
}

/* ---- the interior walk graph, in Mav's Refuge's vocabulary ---- */
function navGroup(plan, b, g){
  var N = plan.nav, gid = plan.groups.indexOf(g);
  function node(x,y,z,lvl,tag,extra){ var n={ id:plan.bid+'.n'+N.nodes.length, x:+x.toFixed(3), y:+y.toFixed(3), z:+z.toFixed(3), lvl:lvl, tag:tag }; if(extra) for(var k in extra) n[k]=extra[k]; N.nodes.push(n); return n; }
  function edge(a,c,kind){ N.edges.push({ a:a.id, b:c.id, kind:kind, len:+Math.hypot(a.x-c.x,a.y-c.y,a.z-c.z).toFixed(3) }); }
  var roomNode = {};
  plan.rooms.forEach(function(R){ if(R.group!==gid) return; var z=R._z, c=g.round ? g.frame.C : g.RF((z.u0+z.u1)/2, (z.v0+z.v1)/2);
    roomNode[R.id] = node(c[0], R.y, c[1], R.lvl, 'room', { room:R.id }); });
  plan.doors.forEach(function(d){ if(d.group!==gid) return;
    if(d.kind==='exterior'){ var nx=Math.sin(d.yaw), nz=Math.cos(d.yaw);
      var o=node(d.at[0]+nx*0.9, d.y, d.at[1]+nz*0.9, 0, 'door', { door:d.id, links:'street' }), i=node(d.at[0]-nx*0.9, plan.levels.length?g.levels[0].y:d.y, d.at[1]-nz*0.9, 0, 'doorway', { door:d.id });
      edge(o, i, 'door'); if(d.rooms[0] && roomNode[d.rooms[0]]) edge(i, roomNode[d.rooms[0]], 'room'); }
    else { var dn=node(d.at[0], d.y, d.at[1], d.lvl, 'doorway', { door:d.id }); d.rooms.forEach(function(r){ if(r && roomNode[r]) edge(dn, roomNode[r], 'room'); }); } });
  if(g.stair){ var s=g.stair, fpt=g.RF(s.u, s.va-0.4), tpt=g.RF(s.u, s.vb+0.3);
    var fo=node(fpt[0], s.y0, fpt[1], 0, 'stairfoot'), to=node(tpt[0], s.y1, tpt[1], 1, 'stairtop'); edge(fo, to, s.kind);
    var z0=zoneAt(g,0,fpt[0],fpt[1]), z1=zoneAt(g,1,tpt[0],tpt[1]); if(z0&&roomNode[z0.id]) edge(fo, roomNode[z0.id], 'room'); if(z1&&roomNode[z1.id]) edge(to, roomNode[z1.id], 'room'); }
}

/* ---- export: the plan minus its private handles ---- */
function interiorExport(P){
  function clean(o){ var r={}; for(var k in o){ if(k.charAt(0)==='_') continue; r[k]=o[k]; } return r; }
  var lights = interiorLights(P);
  return { frame:'building-local (parent under the building node)', levels:P.levels.map(function(L){ return { k:L.k, y:L.y, H:L.H }; }),
    finish:P.finish, floor:P.floor||null, partition:P.partition,
    rooms:P.rooms.map(function(r){ var c=clean(r); c.node='Room.'+P.bid+'.'+r.id.split('.').pop(); return c; }),
    walls:P.walls.map(function(w){ var c=clean(w); c.node='Wall.'+P.bid+'.'+w.id.split('.').pop()+'-col'; return c; }),
    doors:P.doors.map(function(d){ var c=clean(d); c.node = d.kind==='exterior' ? fixNodeName('door', FIX.byId[d.fixture]) : 'InteriorDoor.'+P.bid+'.'+d.id.split('.').slice(-3).join('_'); return c; }),
    stairs:P.stairs.map(function(s){ return { id:s.id, module:s.module, kind:s.kind, lvl0:s.lvl0, lvl1:s.lvl1, w:s.w, rise:+s.rise.toFixed(3), run:+s.run.toFixed(3),
      foot:P.groups[s.group].RF(s.u, s.va).map(function(v){ return +v.toFixed(3); }), top:P.groups[s.group].RF(s.u, s.vb).map(function(v){ return +v.toFixed(3); }), node:'Stair.'+P.bid+'.'+s.id.split('.').pop()+'-col' }; }),
    furniture:P.furniture.map(function(f){ var F=FURN_BY_KEY[f.furn], c=clean(f); c.culture=F.culture; c.type=F.type; c.setting=F.setting; if(F.capacity) c.capacity=F.capacity; c.node='Furniture.'+P.bid+'.'+f.id.split('.').pop(); return c; }),
    lights:lights, nav:P.nav };
}
/* lights come from the furniture's own build (hearths, braziers): build it into a throwaway sink */
function interiorLights(P){
  var b = FIX.byId[P.bid], out=[];
  intWithSink(function(){ P.furniture.forEach(function(f){ if(f.virtual) return; var p=intToWorld(b, f.at[0], f.at[1]);
    buildFurn(f.furn, p[0], p[1], b.yaw+f.yaw, { variant:f.variant, seed:f.seed, y:b.y+f.y }); }); }, function(S){
    S.lights.forEach(function(L, i){ var q=intToLocal(b, L.x, L.z); out.push({ id:P.bid+'.light.'+i, kind:L.kind, at:[+q[0].toFixed(3), +q[1].toFixed(3)], y:+(L.y-b.y).toFixed(3), amp:L.amp, radius:L.radius, node:'Light.'+P.bid+'.interior.'+i }); }); });
  return out;
}
/* run fn with the kit redirected into private buckets; done(sink, buckets, merged) gets them */
function intWithSink(fn, done){
  var sB=BUCKET, sM=MBK, sE=KIT_EMITTED, sL=KIT_LATE, sink={ lights:[], sites:[] };
  BUCKET={}; MBK={}; KIT_EMITTED=false; INTERIOR_SINK=sink;
  var BK, MK;
  try{ fn(); } catch(e){ ERR('interior build: '+(e&&e.stack||e)); }
  finally{ BK=BUCKET; MK=MBK; BUCKET=sB; MBK=sM; KIT_EMITTED=sE; KIT_LATE=sL; INTERIOR_SINK=null; }
  return done(sink, BK, MK);
}

/* ============================ GEOMETRY ============================
   Draws a plan into private buckets. Returns { group, doors:[{rec, leaves}], lights, sites }.  */
function buildInteriorGeo(P, matFn){
  var b = FIX.byId[P.bid], rng = intRng(b.seed*13+5), fin = null;
  FINISHES.forEach(function(f){ if(f.key===P.finish) fin=f; });
  var wallCol = intPick(rng, fin.wall.cols), floorCol = intPick(rng, fin.floor.cols), ceilCol = intPick(rng, fin.ceil.cols);
  var part = PARTITIONS[P.partition], partCol = part.fam===fin.wall.fam ? wallCol : intPick(rng, part.fam==='adobe'?ADOBEC:part.fam==='cloth'?CLOTHC:part.fam==='metal'?TARNC:WHITEC);
  var leaves = [];
  return intWithSink(function(){
    var F = assetFrame(b.x, b.z, b.yaw, { y:b.y, seed:b.seed });
    function wallBox(ax,az, bx,bz, y, H, T, off, ops, col, fam){
      var dx=bx-ax, dz=bz-az, L=Math.hypot(dx,dz); if(L<0.05) return; var tx=dx/L, tz=dz/L, r=Math.atan2(-dz, dx), nx=tz, nz=-tx;
      if(off && off.n){ nx=off.n[0]; nz=off.n[1]; }
      var oc = off ? off.d : 0;
      function piece(u0,u1,y0,y1){ if(u1-u0<0.02 || y1-y0<0.02) return; var um=(u0+u1)/2;
        F.box(ax+tx*um+nx*oc, y+y0, az+tz*um+nz*oc, u1-u0, y1-y0, T, r, col, fam); }
      var cur=0; ops.forEach(function(o){ var u0=Math.max(cur,o.u-o.w/2), u1=Math.min(L,o.u+o.w/2);
        piece(cur, u0, 0, H); piece(u0, u1, 0, o.y0); piece(u0, u1, o.y1, H);
        if(o.depth){ /* reveals between the room and the outer face */
          var dd=o.depth+0.02, jc=dd/2;
          [u0-0.04, u1+0.04].forEach(function(uj){ F.box(ax+tx*uj+nx*jc, y+o.y0, az+tz*uj+nz*jc, 0.08, o.y1-o.y0, dd, r, col, fam); });
          F.box(ax+tx*(u0+u1)/2+nx*jc, y+o.y1, az+tz*(u0+u1)/2+nz*jc, u1-u0+0.16, 0.08, dd, r, col, fam);
          if(o.y0>0.05) F.box(ax+tx*(u0+u1)/2+nx*jc, y+o.y0-0.06, az+tz*(u0+u1)/2+nz*jc, u1-u0+0.16, 0.06, dd, r, shade(col,-0.06), fam);
          else F.box(ax+tx*(u0+u1)/2+nx*(jc+0.1), y-0.08, az+tz*(u0+u1)/2+nz*(jc+0.1), u1-u0+0.16, 0.08, dd+0.2, r, shade(floorCol,-0.12), 'fl-'+fin.floor.fam); }   /* the threshold */
        cur=u1; });
      piece(cur, L, 0, H);
      return { tx:tx, tz:tz, r:r, nx:nx, nz:nz };
    }
    /* floors and ceilings per room; slabs between levels with the stair cut out */
    /* FLOOR FINISHES (see FINISH): a light base under a pattern and a border band, drawn in the
       'fl-' families, which the interior shader lifts (76-doors.js) so a floor reads at a quarter
       of the sun and stays apart from a dark plinth. Pattern pieces stand 4-8 mm proud of the base. */
    var FP = fin.floor.pattern || 'earth', FL = 'fl-'+fin.floor.fam, prng = intRng(b.seed*29+11);
    var grout = shade(floorCol, FP==='plank' ? -0.32 : -0.24), band = fin.floor.accent ? intPick(prng, fin.floor.accent) : shade(floorCol, -0.16);
    function floorPattern(R, g, list, z, slab){
      var y = R.y;
      function ps(u0,v0,u1,v1, col, h, fam){ if(u1-u0<0.01 || v1-v0<0.01) return; slab([u0,v0,u1,v1], y-0.004, 0.004+(h||0.004), fam||FL, col); }
      list.forEach(function(r4){ var u0=r4[0], v0=r4[1], u1=r4[2], v1=r4[3], u, v, k;
        if(FP==='tile' || FP==='mosaic'){ var s = FP==='tile' ? 0.5 : 0.4, gw = 0.03;
          for(u=Math.ceil((u0-z.u0)/s)*s+z.u0; u<u1-0.05; u+=s) if(u>u0+0.05) ps(u-gw/2, v0, u+gw/2, v1, grout);
          for(v=Math.ceil((v0-z.v0)/s)*s+z.v0; v<v1-0.05; v+=s) if(v>v0+0.05) ps(u0, v-gw/2, u1, v+gw/2, grout); }
        else if(FP==='flag'){ var fs = 0.8, fg = 0.035;
          for(v=z.v0, k=0; v<v1; v+=fs, k++){ var va=Math.max(v,v0), vb=Math.min(v+fs,v1); if(vb<=va) continue;
            if(v>v0+0.05) ps(u0, v-fg/2, u1, v+fg/2, grout);
            for(u=z.u0+(k%2?fs/2:0)+fs; u<u1-0.05; u+=fs) if(u>u0+0.05) ps(u-fg/2, va, u+fg/2, vb, grout); } }
        else if(FP==='plank'){ var bw = 0.2; ps(u0, v0, u1, v1, grout, 0.001);                        /* the gaps */
          for(u=z.u0; u<u1; u+=bw){ var ua=Math.max(u+0.012,u0), ub=Math.min(u+bw-0.012,u1); if(ub-ua<0.03) continue;
            ps(ua, v0, ub, v1, shade(floorCol, 0.10+prng()*0.10-0.05), 0.005); } }
        else { /* beaten earth: swept patches, lighter and darker, never quite the same twice */
          var area=(u1-u0)*(v1-v0), np=Math.min(12, Math.max(3, Math.round(area/2.2)));
          for(k=0;k<np;k++){ var rr0=0.35+prng()*0.55, pu=u0+rr0+prng()*Math.max(0,(u1-u0)-2*rr0), pv=v0+rr0+prng()*Math.max(0,(v1-v0)-2*rr0);
            if(u1-u0 < 2*rr0 || v1-v0 < 2*rr0) continue; var pc=g.RF(pu,pv);
            F.cyl(pc[0], y-0.004, pc[1], rr0, 0.006+k*0.0004, 0, shade(floorCol, (k%2?0.07:-0.06)), FL); } }
      });
      /* the border band, along the room's own four edges */
      var bwid = FP==='mosaic' ? 0.32 : FP==='plank' ? 0 : 0.2;
      if(bwid){ ps(z.u0, z.v0, z.u1, z.v0+bwid, band, 0.007, FP==='mosaic'?'fl-mosaic':FL); ps(z.u0, z.v1-bwid, z.u1, z.v1, band, 0.007, FP==='mosaic'?'fl-mosaic':FL);
        ps(z.u0, z.v0+bwid, z.u0+bwid, z.v1-bwid, band, 0.007, FP==='mosaic'?'fl-mosaic':FL); ps(z.u1-bwid, z.v0+bwid, z.u1, z.v1-bwid, band, 0.007, FP==='mosaic'?'fl-mosaic':FL); }
      /* the court's medallion */
      if(FP==='mosaic'){ var mc=g.RF((z.u0+z.u1)/2,(z.v0+z.v1)/2), ms=Math.min(z.u1-z.u0, z.v1-z.v0)*0.42, ry=Math.atan2(-g.frame.V[1], g.frame.V[0]);
        if(ms>0.6){ F.box(mc[0], y-0.004, mc[1], ms, 0.013, ms, ry+Math.PI/4, band, 'fl-mosaic'); F.box(mc[0], y-0.004, mc[1], ms*0.55, 0.016, ms*0.55, ry+Math.PI/4, intPick(prng, MOSWARMC), 'fl-mosaic'); } }
    }
    P.rooms.forEach(function(R){ var g=P.groups[R.group], poly=R.poly, n=poly.length;
      if(g.round || n!==4){ var c=[0,0]; poly.forEach(function(p){ c[0]+=p[0]/n; c[1]+=p[1]/n; });
        for(var i=0;i<n;i++){ var a=poly[i], q=poly[(i+1)%n];
          F.tri(FL, [c[0],R.y,c[1]], [a[0],R.y,a[1]], [q[0],R.y,q[1]], floorCol, [0,1,0]);
          F.tri(fin.ceil.fam, [c[0],R.y+R.h,c[1]], [a[0],R.y+R.h,a[1]], [q[0],R.y+R.h,q[1]], ceilCol, [0,-1,0]); }
        /* a round floor: swept rings of earth (or of tile), darker toward the wall, the centre kept clean */
        var Rr = g.R || 1.5, rings = [[0.94, -0.14, 0.004], [0.72, 0.06, 0.008], [0.42, -0.05, 0.012], [0.2, 0.08, 0.016]];
        rings.forEach(function(rg){ F.cyl(c[0], R.y-0.004, c[1], Rr*rg[0], rg[2], 0, shade(floorCol, rg[1]), FL); });
        if(fin.beams) for(var k=0;k<6;k++){ var a2=k/6*Math.PI; F.beam(c[0]+Math.cos(a2)*g.R, R.y+R.h-0.12, c[1]+Math.sin(a2)*g.R, c[0]-Math.cos(a2)*g.R, R.y+R.h-0.12, c[1]-Math.sin(a2)*g.R, 0.14, 0.14, TORONC[0], 'timber'); }
        return; }
      var z=R._z, holes = (g.stair) ? [[g.stair.u0-0.05, g.stair.va, g.stair.u1+0.05, g.stair.vb+0.15]] : [];
      function rects(u0,v0,u1,v1, hole){ if(!hole || hole[2]<=u0 || hole[0]>=u1 || hole[3]<=v0 || hole[1]>=v1) return [[u0,v0,u1,v1]];
        var o=[]; var hu0=Math.max(u0,hole[0]), hu1=Math.min(u1,hole[2]), hv0=Math.max(v0,hole[1]), hv1=Math.min(v1,hole[3]);
        if(hv0>v0) o.push([u0,v0,u1,hv0]); if(hv1<v1) o.push([u0,hv1,u1,v1]); if(hu0>u0) o.push([u0,hv0,hu0,hv1]); if(hu1<u1) o.push([hu1,hv0,u1,hv1]); return o; }
      function slab(r4, y, t, fam, col){ var c=g.RF((r4[0]+r4[2])/2, (r4[1]+r4[3])/2), V=g.frame.V, ry=Math.atan2(-V[1], V[0]);
        /* box local x along V (depth), z along U */
        F.box(c[0], y, c[1], r4[3]-r4[1], t, r4[2]-r4[0], ry, col, fam); }
      var lvlUp = P.levels.length>1 && R.lvl===0, top = R.lvl===P.levels.length-1;
      var fl = rects(z.u0,z.v0,z.u1,z.v1, R.lvl===1?holes[0]:null);
      fl.forEach(function(r4){ slab(r4, R.y-0.06, 0.06, FL, floorCol); });
      floorPattern(R, g, fl, z, slab);
      rects(z.u0,z.v0,z.u1,z.v1, lvlUp?holes[0]:null).forEach(function(r4){ slab(r4, R.y+R.h, lvlUp?(P.levels[1].y-0.06-(R.y+R.h)):0.08, fin.ceil.fam, ceilCol); });
      if(fin.beams){ var nb=Math.floor((z.u1-z.u0)/0.95);
        for(var j=1;j<=nb;j++){ var u=z.u0+j*(z.u1-z.u0)/(nb+1); if(lvlUp && u>holes[0][0]-0.1 && u<holes[0][2]+0.1) continue;
          var a3=g.RF(u,z.v0), b3=g.RF(u,z.v1); F.beam(a3[0], R.y+R.h-0.09, a3[1], b3[0], R.y+R.h-0.09, b3[1], 0.13, 0.15, TORONC[j%2], 'timber'); } }
      if(fin.dado){ /* a tiled dado round the room's four faces */ }
    });
    /* walls */
    P.walls.forEach(function(W){
      if(W.kind==='shell'){
        wallBox(W.a[0],W.a[1], W.b[0],W.b[1], W.y, W.h, 0.12, { d:0.06, n:W.out }, W.openings, wallCol, fin.wall.fam);
        if(fin.dado){ var dc=intPick(rng, fin.dado.cols); wallBox(W.a[0]-W.out[0]*0.03,W.a[1]-W.out[1]*0.03, W.b[0]-W.out[0]*0.03,W.b[1]-W.out[1]*0.03, W.y, 0.9, 0.03, { d:-0.0, n:W.out },
          W.openings.map(function(o){ return { u:o.u, w:o.w, y0:o.y0, y1:Math.max(o.y0, 0.9+0.01) }; }), dc, fin.dado.fam); }
        /* skirting: a dark band at the foot, so the floor/wall join reads */
        wallBox(W.a[0]-W.out[0]*0.02,W.a[1]-W.out[1]*0.02, W.b[0]-W.out[0]*0.02,W.b[1]-W.out[1]*0.02, W.y, 0.14, 0.03, { d:0, n:W.out }, W.openings.filter(function(o){ return o.y0<0.1; }), shade(wallCol,-0.25), fin.wall.fam);
      } else {
        var info = wallBox(W.a[0],W.a[1], W.b[0],W.b[1], W.y, W.h, W.thick, null, W.openings, partCol, part.fam);
        W.openings.forEach(function(o){ if(!o.door) return; var D=null; P.doors.forEach(function(d){ if(d.id===o.door) D=d; }); if(!D || D.style==='open') return;
          /* interior leaves: hinged at the opening's start, swinging into the room the wall faces */
          var fam = D.style==='mat'?'cloth':'plank', hu=o.u-o.w/2, base=info.r, hl=[W.a[0]+info.tx*hu, W.a[1]+info.tz*hu], wp=F.p(hl[0],hl[1]);
          var nl = D.style==='double' ? 2 : 1, lw = o.w/nl - 0.02;
          for(var k=0;k<nl;k++){ var hp = k ? F.p(W.a[0]+info.tx*(o.u+o.w/2), W.a[1]+info.tz*(o.u+o.w/2)) : wp, by = F.ry + base + (k?Math.PI:0), ki=kitIndex('leaf',fam);
            push('leaf', fam, [hp[0], b.y+W.y, hp[1], lw, D.h-0.02, D.style==='mat'?0.04:0.07, by, D.style==='mat'?intPick(rng,CLOTHC):PLANKC[(k+2)%4]]);
            leaves.push({ door:D.id, key:'leaf|'+fam, i:ki.i, base:by, dir:k?-1:1, roll:D.style==='mat' }); } });
      }
    });
    /* stairs */
    P.stairs.forEach(function(s){ var g=P.groups[s.group], M=STAIRS[s.module];
      var G = { wallCol:wallCol, plankCol:PLANKC[1], timberCol:TIMBERC[1],
        box:function(u,y,v, w,h,d, col,fam){ var p=g.RF(u,v), V=g.frame.V; F.box(p[0], y, p[1], d, h, w, Math.atan2(-V[1],V[0]), col, fam); },
        beam:function(u0,y0,v0, u1,y1,v1, w,d, col,fam){ var a=g.RF(u0,v0), c=g.RF(u1,v1); F.beam(a[0],y0,a[1], c[0],y1,c[1], w,d, col,fam); },
        rod:function(u0,y0,v0, u1,y1,v1, r0, col){ var a=g.RF(u0,v0), c=g.RF(u1,v1); F.rod(a[0],y0,a[1], c[0],y1,c[1], r0, col, 'timber'); } };
      M.build(G, s);
      if(s.kind==='stair'){ /* a rail round the stairwell on the upper floor */ var L1=P.levels[1], hy=L1.y+0.95;
        G.beam(s.u1+0.05, hy, s.va, s.u1+0.05, hy, s.vb, 0.06, 0.06, TIMBERC[1], 'timber'); } });
    /* furniture */
    P.furniture.forEach(function(f){ if(f.virtual) return; var p=intToWorld(b, f.at[0], f.at[1]); buildFurn(f.furn, p[0], p[1], b.yaw+f.yaw, { variant:f.variant, seed:f.seed, y:b.y+f.y }); });
  }, function(sink, BK, MK){
    var group = new THREE.Group(); group.name = 'Interior.'+P.bid; group.userData.bid = P.bid;
    emitBuckets({ buckets:BK, target:group, mat:matFn }); emitMerged({ buckets:MK, target:group, mat:matFn });
    leaves.forEach(function(L){ L.bk = BK; });
    return { group:group, leaves:leaves, lights:sink.lights, sites:sink.sites, BK:BK };
  });
}
window._interiors = { plan:function(bid){ return interiorPlan(bid); }, kit:function(bid){ return buildingKit(bid); }, audit:function(){ return kitAudit(); } };
/* THE KIT AUDIT as a counter: verify.py prints every small window._* value, so the numbers land in its
   counters line without a new invariant. Planned on first read (about 2 s for the whole city), then cached. */
(function(){ var cache=null; try{ Object.defineProperty(window, '_kitAudit', { enumerable:true, configurable:true,
  get:function(){ if(!cache && typeof FIX!=='undefined' && FIX.buildings.length) cache = kitAudit(); return cache; } }); }catch(e){} })();
