// ---------------------------------------------------------------- furniture: PLACED from the catalog, not drawn
// Everything a Highlands builder puts in or around a building that is not the building itself (its main
// structure and outbuildings) is FURNITURE: a master-catalog piece (kits/catalog), placed as data and built by
// the catalog's own code through KratorFurniture (69d, generated: kits/catalog/furniture_bundle.py), merged
// into one mesh per render family for the whole page. A builder calls, in its own local frame:
//   FURNISH(key, lx, ly, lz, lry, {v, seed, setting})   -> the placement record (also on G.userData.furniture)
// Indoors, the rooms of every top-level building are the interiors kit's: its set (kits/interiors/sets/
// highlands.js) is planned and furnished through the same catalog (?interiors=1; off by default, as the roofs
// hide it and it adds millions of triangles). ?furniture=0 places nothing (the records are still kept).
KratorFurniture.setDetail(.5);   // settlement-scale: half the segments on round furniture parts
const HLF={on:!/[?&]furniture=0\b/.test(location.search),interiors:/[?&]interiors=1\b/.test(location.search),
 batch:KratorFurniture.batch(),placed:[],missing:{},buildings:[]};
HLF.adapter=KratorInteriors.runtimeAdapter(KratorFurniture,HLF.batch);
function FURNISH(key,lx,ly,lz,lry,o){const c=VERN.cur;if(!c){reportErr('FURNISH '+key+' outside a builder');return null;}o=o||{};
 if(!KratorFurniture.has(key)){HLF.missing[key]=(HLF.missing[key]||0)+1;return null;}
 const s=c.o.scale||1,p=loc(c.x,c.z,lx*s,lz*s,c.ry);
 const rec={key,variant:o.v|0,seed:o.seed||(HLF.placed.length+1),lx,ly,lz,lry:lry||0,x:p[0],y:(c.o.y||0)+ly*s,z:p[1],ry:c.ry+(lry||0),
  building:c.D.key,setting:o.setting||'outdoor'};
 (c.G.userData.furniture||(c.G.userData.furniture=[])).push(rec);HLF.placed.push(rec);
 const dm=KratorFurniture.entryDims(KratorFurniture.FURN_BY_KEY[key],rec.variant);   // murals fitted after the builder (hlFlush) keep clear of the piece
 if(!c.noRec)(c.inst||(c.inst=[])).push(['vWood',[lx,ly+dm.h/2,lz],qEuler(0,lry||0,0),[dm.w,dm.h,dm.d]]);
 // a builder's pieces stand outside, seen whole: full detail (at half, a disc drawn as a rod, a shield or a target face,
 // is a 4-sided diamond); the interiors' many pieces keep the half detail set above
 if(HLF.on){KratorFurniture.setDetail(1);HLF.batch.place(key,rec.x,rec.y,rec.z,rec.ry,{variant:rec.variant,seed:rec.seed,wealth:hlfWealth(c.D),building:c.D.key,setting:rec.setting});KratorFurniture.setDetail(.5);}
 return rec;}
function hlfWealth(D){const w=D.tags&&D.tags.wealth;return w==='poor'?.2:w==='rich'?.8:w==='civic'?.65:.5;}
// the interiors hook: a TOP-LEVEL placement (not a sub-building a compound places) with an interior set item
// gets its rooms planned and furnished at its placement; the plan is data on the group (userData.interior)
const hlfPlace=VERN.place;
VERN.place=function(sc,key,x,z,ry,o){const top=!VERN.cur;const G=hlfPlace.call(VERN,sc,key,x,z,ry,o);
 if(top&&G&&HLF.interiors){const it=KratorInteriors.sets.find(key);
  if(it&&!it.skip){const r=KratorInteriors.sets.furnish(it,x,z,ry||0,HLF.adapter,{baseY:(o&&o.y)||0,prefix:'hl.'+HLF.buildings.length+'.'});
   G.userData.interior={rooms:r.inst.rooms.length,pieces:Object.keys(r.plans).reduce((a,k)=>a+r.plans[k].placements.length,0),residence:r.residence};
   HLF.buildings.push({key,x,z,ry:ry||0,interior:G.userData.interior});}}
 return G;};
// the batch becomes meshes once, when the kit bakes its instances
const hlfBake=kbake;
// the catalog's colours are sRGB values taken as they are; this kit's materials are linear (hC converts every colour), so
// the furniture keeps its 8-bit vertex colours and linearises them in the vertex shader (as Girder and Locus do)
function hlfSRGB(sh){sh.vertexShader=sh.vertexShader.replace('#include <color_vertex>','#include <color_vertex>\n#ifdef USE_COLOR\n  vColor.rgb = pow(max(vColor.rgb, vec3(0.0)), vec3(2.2));\n#endif');}
kbake=function(sc){const g=HLF.batch.flush(sc);g.userData.probeSkip=false;HLF.group=g;g.children.forEach(m=>{m.material.onBeforeCompile=hlfSRGB;});return hlfBake(sc);};
