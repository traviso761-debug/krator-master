/* ======================================================================
   kits/beast-riders/towns/girder-ports.js: Girder's buildings the kit takes (the port table), SEALED INTO Girder's
   closure by towns.py after its layout (30-layout.js: SLOTS, HOUSES, STALLS, PLATS, HALL, GATES, PALISADE) and the
   hook (hook.js). Each variant names the marks it is drawn by (55-arch.js and 50-structure.js call PORT(kind, id, ...))
   and, where the mark's own frame is not the building's, a frame and a clip (the palisade rings the whole town).
   dims: the box each variant declares [w, d, h] in metres (verify.py checks the measured box against it, +1.6 m).
   ====================================================================== */
var BRT_DEFS = (function(){
  function firstSlot(kind, test){ for(var i=0;i<SLOTS.length;i++){ var S=SLOTS[i]; if(S.kind===kind && (!test || test(S))) return S; } return null; }
  function lively(S){ return S.tower.floors[S.k].use >= 0.7 && S.k < TOWER_N-1; }
  function openSky(S){ var T=S.tower, bi=Math.round((S.x-T.x)/16), bj=Math.round((S.z-T.z)/16);
    return S.k===TOWER_N-1 && T.floors[TOWER_N].missing.indexOf(bi+','+bj)>=0; }
  var KL = { home:'Home', store:'Storehouse', workshop:'Workshop', common:'Common room', shrine:'Shrine' };
  var dwell = ['home','store','workshop','common','shrine'].map(function(k){ var S = firstSlot(k, lively) || firstSlot(k);
    return S && { name: KL[k]+' (tower slot '+S.id+')', parts:[{ kind:'dwelling', id:S.id }] }; }).filter(Boolean);
  var sky = null; for(var i=0;i<SLOTS.length && !sky;i++) if(openSky(SLOTS[i]) && SLOTS[i].kind!=='shrine') sky = SLOTS[i];
  if(sky) dwell.push({ name: KL[sky.kind]+' under the open sky, roofed (slot '+sky.id+')', parts:[{ kind:'dwelling', id:sky.id }] });
  var HK = { roundhut:'Round-hut compound', joglo:'Joglo house', longhouse:'Stave longhouse' };
  var houses = ['roundhut','joglo','longhouse'].map(function(k){ var H = HOUSES.filter(function(h){ return h.kind===k; })[0];
    return H && { name: HK[k]+' (lot '+H.id+')', parts:[{ kind:'house', id:H.id }] }; }).filter(Boolean);
  var GOODS = ['Fruit-seller','Tack & harness','Potter','Weaver'];
  var stalls = [0,1,2,3].filter(function(i){ return i < STALLS.length; }).map(function(i){ return { name:'Market stall: '+GOODS[i], parts:[{ kind:'stall', id:i }] }; });
  function ringFrame(x, z, a){ return { x:x, y:SETTLE_Y, z:z, ry:Math.atan2(Math.cos(a), Math.sin(a)) }; }   /* front: out of the ring */
  return [
    { key:'br_port_girder_hall', name:"Girder's assembly hall", town:'girder', family:'civic', types:['civic','religious'],
      variants:[{ name:'The Assembly Hall', parts:[{ kind:'hall', id:0 }] }] },
    { key:'br_port_girder_dwelling', name:"Girder's tower dwellings (timber infill in the Ancients' floors)", town:'girder', family:'housing', types:['dwelling-single','shop','religious'],
      variants: dwell },
    { key:'br_port_girder_house', name:"Girder's ground houses", town:'girder', family:'housing', types:['dwelling-single'],
      variants: houses },
    { key:'br_port_girder_roost_deck', name:"Girder's roost deck (stalls, perches, the keeper's shelter)", town:'girder', family:'infrastructure', types:['infrastructure'],
      variants:[{ name: PLATS[0].name, parts:[{ kind:'roostdeck', id:PLATS[0].id }] }] },
    { key:'br_port_girder_palisade', name:"Girder's palisade", town:'girder', family:'defensive', types:['infrastructure'],
      variants:[
        { name:'A stretch with a watch post', parts:[{ kind:'palisade', id:0 }], clip:{ hx:13, hz:7 },
          frame:function(){ var p = PALISADE.posts[0]; return ringFrame(p.x, p.z, p.a); } },
        { name:'A gatehouse ('+GATES[0].name+')', parts:[{ kind:'palisade', id:0 }], clip:{ hx:16, hz:10 },
          frame:function(){ var g = GATES[0]; return ringFrame(g.x, g.z, g.a); } }] },
    { key:'br_port_girder_stall', name:"Girder's market stalls", town:'girder', family:'trade', types:['market'],
      variants: stalls }
  ];
})();
