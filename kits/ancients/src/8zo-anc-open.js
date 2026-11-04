// ================================================================= OPENINGS: real doors and real glass on core/door (the owner, 2026-11-03)
// "Remove all dark voids and make all windows, doors and portals actual doors or windows that have transparency", doors that
// open and shut "with a keypress nearby or by an NPC", and "real glass". The records, rules and walk blocks are core/door's
// (KDOOR 10-core-door.js, KGLASS 20-core-glass.js, KDOORHOST 90-core-door-host.js, read in place by build.py: DOOR_FILES);
// this is the kit's drawing of them, so every builder's window and door goes the same way without a builder knowing:
//
//  * WINDOWS. The kit's window items (winI/winD, winBigI/D, ovalI/D, winSmI/D, cellD, paneD: 34-kitdefs.js, 38-helpers2.js,
//    54-mat-concrete.js) were
//    solid extrusions in a see-through material: four layers of glass over the shell, which read as an opaque blue plate.
//    Each is now ONE pane on the window's front face (KGLASS 'smoked' in the Ancients' blue: their tinted curtain glass)
//    and a ROOM CARD set back behind it (KGLASS 'room', darkened: the room you would see; a tower has no rooms yet). Two
//    intact windows in five have a card that is lit at night (chosen by a hash of where it stands: no rng() draw, so no
//    other structure moves). A dead window (a ruin's) has its glass in two cases in five and is an empty hole onto the
//    room in the rest.
//  * DOORS. The kit's arched door (archOpen, the Ancients' grey alloy since the 2026-10-19 round) and the arcologies' own
//    arches (dkArch, plyArch, acArch, tgArch, aiPortal: black in their fragments) are each a LOCKED KDOOR record with a
//    stable id ('<type>/<decay>.<item>.<n>': Skyscraper A's third archOpen intact is 'skyA/0.archOpen.2'): a solid body's
//    door, drawn shut in the alloy and never opened. A door on a body that fell (a toppled upper, its up axis off the
//    vertical) is no door any more and is not recorded (ANC_OPEN.fallen counts them).
//  * VOIDS. The arcologies' near-black void materials (MAT.*Void: the recess backs, the dark inside a break, the dim boxes
//    in a cut) are the room's deep shade (ANC_DEEP), a dim warm interior, not black. MAT.dark is the warm plaster room
//    since the 2026-10-19 round. The monolith's arch windows and oculi (mnArchW, mnHole) are cards with a pane before them.
//    The real voids that stay dark are listed in KNOWN_ISSUES.md ("Real doors and real glass", 2026-11-03).
// The frame tick, the E key (when no door is within reach E still lifts the camera, as before) and its tip are at the
// foot of this fragment; window._openings and window._api.openings give the counts for verify.py.
// Interiors (8zz-interiors.js, the interiors target): each partition doorway gets an operable leaf (anLeaf below).
/* a guest in a page that hosts its own doors (window.ANC_OPEN_GUEST, set by a fragment ahead of this one: Highlands' Roketstad,
   whose 95-hl-doors.js ticks KDOORHOST and whose 99-start.js takes E): the records, panes and cards as here, the tick, E and the
   tip the host's (two ticks would swing a door twice as fast, two E handlers toggle it back) */
const ANC_GUEST=typeof window!=='undefined'&&!!window.ANC_OPEN_GUEST;
const ANC_OPEN={doors:0,locked:0,leaves:0,panes:0,cards:0,lit:0,holes:0,fallen:0,n:{},
 stats(){const L=typeof KDOOR!=='undefined'?KDOOR.list:[];
  return {doors:L.length,locked:L.filter(D=>D.locked).length,leaves:this.leaves,panes:this.panes,cards:this.cards,lit:this.lit,holes:this.holes,fallen:this.fallen};}};
const ANC_KG=typeof KGLASS!=='undefined'?KGLASS:null;
/* the room behind the glass: KGLASS's room card (its colour is sRGB, converted by KGLASS: not again here); the voids take its
   colour at two thirds, the deep shade of a room further in */
MAT.ancRoom=ANC_KG?ANC_KG.material(THREE,'room'):new THREE.MeshStandardMaterial({color:0x6e5a46,roughness:.94});
const ANC_DEEP=MAT.ancRoom.color.clone().multiplyScalar(.66);
/* MAT.dark (an opening's inside: the core behind a glass band, a ruin's insides) was a light plaster since 2026-10-19: the card.
   Only where the kit's split moved the true dark SURFACES to MAT.darkSurf (34-kitdefs.js); a fork without it keeps its MAT.dark */
if(MAT.darkSurf)MAT.dark.color.copy(MAT.ancRoom.color);
/* the Ancients' grey alloy door (34-kitdefs.js); a fork of the kit that has none gets it here */
if(!MAT.ancDoor)MAT.ancDoor=new THREE.MeshStandardMaterial({color:0x6a665e,metalness:.55,roughness:.42,side:THREE.DoubleSide});
MAT.ancRoomLit=MAT.ancRoom.clone();MAT.ancRoomLit.userData=Object.assign({},MAT.ancRoom.userData);MAT.ancRoomLit.emissive=new THREE.Color(0xffc27a);MAT.ancRoomLit.emissiveIntensity=0;MAT.ancRoomLit.name='kglass:room-lit';
MAT.ancPane=ANC_KG?ANC_KG.material(THREE,'smoked',{color:0x3a6f9c}):MAT.winIntact;
MAT.ancPaneD=ANC_KG?ANC_KG.material(THREE,'smoked',{color:0x4a5054}):MAT.winDead;
/* a darker alloy for a door on a near-black skin (Darco): the grey one read there as a row of pale headstones */
MAT.ancDoorDk=MAT.ancDoor.clone();MAT.ancDoorDk.color.setHex(0x2c2a27);
/* the outlines: the arch of arcWindowGeo (32-surfaces.js), the oval, the cell */
function ancArchShape(w,h){const s=new THREE.Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2-w/2);s.absarc(0,h/2-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,-h/2);return s;}
function ancFlat(kind,a,b,z){const g=kind==='oval'?new THREE.CircleGeometry(a,14):kind==='box'?new THREE.PlaneGeometry(a,b):new THREE.ShapeGeometry(ancArchShape(a,b),6);g.translate(0,0,z);return g;}
/* name -> [outline, w, h, front face z]: the pane sits just inside the old front face, the card 0.85 of the way back to the
   shell line (the old extrusion's middle, where the builders set it on the wall) */
const ANC_WIN={winI:['arch',2.2,4.2,.35],winD:['arch',2.2,4.2,.35],winBigI:['arch',3,3.6,.35],winBigD:['arch',3,3.6,.35],
 ovalI:['oval',1,1,.3],ovalD:['oval',1,1,.3],winSmI:['arch',1.1,2,.2],winSmD:['arch',1.1,2,.2],cellD:['box',1,1,.25],paneD:['box',1,1,.06]};
const ANC_CARD={};   /* window item -> {c: card item, l: lit card item | null, dead} */
for(const nm in ANC_WIN){const [k,a,b,f]=ANC_WIN[nm],dead=/D$/.test(nm);if(!KIT.defs[nm])continue;
 KIT.defs[nm].geo=ancFlat(k,a,b,f-.02);KIT.defs[nm].mat=dead?MAT.ancPaneD:MAT.ancPane;
 kdef(nm+'~c',ancFlat(k,a,b,f*.15),MAT.ancRoom);
 if(!dead)kdef(nm+'~l',ancFlat(k,a,b,f*.15),MAT.ancRoomLit);
 ANC_CARD[nm]={c:nm+'~c',l:dead?null:nm+'~l',dead,f};}
/* the doors: item -> [w, h] of the unit arch (arcWindowGeo's, centred) and the leaf's material */
const ANC_DOOR={archOpen:[6,9,MAT.ancDoor],dkArch:[6,9,MAT.ancDoorDk],plyArch:[6,9,MAT.ancDoor],acArch:[6,9,MAT.ancDoor],
 tgArch:[6,9,MAT.ancDoor],aiPortal:[8,12,MAT.ancDoor]};
for(const nm in ANC_DOOR)if(KIT.defs[nm])KIT.defs[nm].mat=ANC_DOOR[nm][2];
/* the monolith's arch windows and oculi: the card where the void was, a pane before it */
const ANC_PANE={mnArchW:.06,mnHole:.06};
for(const nm in ANC_PANE)if(KIT.defs[nm]){KIT.defs[nm].mat=MAT.ancRoom;kdef(nm+'~p',KIT.defs[nm].geo.clone().translate(0,0,ANC_PANE[nm]),MAT.ancPane);}
/* the voids: the room's deep shade */
for(const nm of ['darcoVoid','plyVoid','aiVoid','acVoid','hillVoid','tgVoid','mnVoid','crVoid','ldVoid','whVoid','siVoid','wgVoid','wgDimK','drVoid','blVoid'])
 if(MAT[nm]&&MAT[nm].color)MAT[nm].color.copy(ANC_DEEP);
/* a hash of a world point, 0..1 (no rng(): the builders' streams are untouched) */
function ancH(x,y,z,s){let h=(Math.round(x*4)*73856093)^(Math.round(y*4)*19349663)^(Math.round(z*4)*83492791)^(s|0);h=Math.imul(h^(h>>>15),2246822519);h^=h>>>13;return (h>>>0)/4294967296;}
const _anV=new THREE.Vector3(),_anQ=new THREE.Quaternion(),_anU=new THREE.Vector3(),_anZ=new THREE.Vector3();
/* the world point and turn kput will give a local one (KXF, KOFF) */
function ancWorld(p,q){let P=p,Q=q||null;if(KXF){_anV.set(p[0],p[1],p[2]).applyMatrix4(KXF.m);P=[_anV.x,_anV.y,_anV.z];Q=(q?q.clone():new THREE.Quaternion()).premultiply(KXF.q);}
 return {p:[P[0]+KOFF[0],P[1]+KOFF[1],P[2]+KOFF[2]],q:Q||new THREE.Quaternion()};}
function ancS(s){return typeof s==='number'?[s,s,s]:s||[1,1,1];}
/* a locked door record for an arch the builder put (centre p, turn q, scale s) */
function ancDoorRec(nm,p,q,s){const [w0,h0]=ANC_DOOR[nm],S=ancS(s),Wd=ancWorld(p,q);
 _anU.set(0,1,0).applyQuaternion(Wd.q);if(_anU.y<.95){ANC_OPEN.fallen++;return null;}
 _anZ.set(0,0,1).applyQuaternion(Wd.q);const yaw=Math.atan2(_anZ.x,_anZ.z),ux=Math.cos(yaw),uz=-Math.sin(yaw);
 const w=w0*Math.abs(S[0]),h=h0*Math.abs(S[1]),P=Wd.p,at=[P[0],P[1]-h/2,P[2]];
 const base=(TSTAT.cur||'free')+'.'+nm,n=ANC_OPEN.n[base]=(ANC_OPEN.n[base]==null?0:ANC_OPEN.n[base]+1);
 if(typeof KDOOR==='undefined')return null;
 const D=KDOOR.add({id:base+'.'+n,at,hinge:[at[0]-ux*w/2,at[1],at[2]-uz*w/2],p0:[P[0],P[1],P[2]],yaw,w,h,t:.6*Math.abs(S[2]||1),
  locked:true,key:TSTAT.cur?TSTAT.cur.split('/')[0]:null,item:nm,preset:'blastside'});   /* the Ancients' heavy bi-parting plate door (core/door's kinds), locked: drawn shut as the arch the builder put */
 ANC_OPEN.doors++;ANC_OPEN.locked++;return D;}
/* kput, with the openings: a window's pane takes its card (and loses its glass in a ruin's empty holes), a door its record */
const ancKput0=kput;
kput=function(name,p,q,s,c){
 const W=ANC_CARD[name];
 if(W){const P=ancWorld(p,q).p;
  const h=ancH(P[0],P[1],P[2],7),lit=!W.dead&&h<.4;
  ancKput0(lit?W.l:W.c,p,q,s,null);ANC_OPEN.cards++;if(lit)ANC_OPEN.lit++;
  if(W.dead&&ancH(P[0],P[1],P[2],11)>=.4){ANC_OPEN.holes++;return;}    /* the glass is gone: the room behind an empty hole */
  ANC_OPEN.panes++;return ancKput0(name,p,q,s,c);}
 if(ANC_DOOR[name])ancDoorRec(name,p,q,s);
 else if(ANC_PANE[name]){ancKput0(name+'~p',p,q,s,null);ANC_OPEN.panes++;ANC_OPEN.cards++;}
 return ancKput0(name,p,q,s,c);};
/* -------------------------------------------------------------- operable leaves (the interiors target's partition doors)
   anLeaf(gx,gy,gz,yaw,w,h,o): a leaf SHUT in a doorway whose sill middle is the world point (gx,gy,gz), yaw the face's
   outward yaw (KDOOR's), w x h the opening; o {id, t (.05), key, locked, mirror, name, preset ('slide'), style ('glass')}.
   Registered in KDOOR: the Ancients' sliding glass panel (core/door's preset 'slide', KDOORLEAF's 'glass': a thin white
   frame round one light), drawn as one instance of each of the items 'anLeaf' (the frame) and 'anLeafG' (its light, the
   Ancients' blue pane), posed by KDOORHOST as it slides. Without KDOORLEAF, one white panel. Returns the record. */
const ANC_LG=typeof KDOORLEAF!=='undefined'?KDOORLEAF.geometry(THREE,'glass'):null;
kdef('anLeaf',ANC_LG?ANC_LG.frame:new THREE.BoxGeometry(1,1,1),MAT.white);
if(ANC_LG&&ANC_LG.glass)kdef('anLeafG',ANC_LG.glass,MAT.ancPane);
const ANC_LEAVES=[];
function anLeaf(gx,gy,gz,yaw,w,h,o){o=o||{};if(typeof KDOOR==='undefined')return null;if(o.id!=null&&KDOOR.get(o.id)){let k=1;while(KDOOR.get(o.id+'~'+k))k++;o=Object.assign({},o,{id:o.id+'~'+k});}const t=o.t==null?.05:o.t,ux=Math.cos(yaw),uz=-Math.sin(yaw),hs=o.mirror?1:-1;
 const D=KDOOR.add({id:o.id,at:[gx,gy,gz],hinge:[gx+hs*ux*w/2,gy,gz+hs*uz*w/2],p0:[gx,gy+h/2,gz],yaw,sign:o.mirror?-1:1,w,h,t,
  locked:!!o.locked,key:o.key==null?null:o.key,name:o.name||null,preset:o.preset==null?'slide':o.preset,style:o.style==null?(ANC_LG?'glass':'flat'):o.style});
 const q=new THREE.Quaternion().setFromAxisAngle(_UP,yaw),idx=KIT.items.anLeaf.length;
 /* straight into the item list: the point is already a world one (no KOFF, no KXF) */
 KIT.items.anLeaf.push({p:[gx,gy+h/2,gz],q,s:[w,h,t],c:null});if(KIT.items.anLeafG)KIT.items.anLeafG.push({p:[gx,gy+h/2,gz],q,s:[w,h,t],c:null});
 const T=tcur();if(T){T.inst++;T.tris+=ktri('anLeaf');}
 ANC_LEAVES.push({D,idx,q,s:[w,h,t]});ANC_OPEN.leaves++;ANC_OPEN.doors++;if(D.locked)ANC_OPEN.locked++;return D;}
/* -------------------------------------------------------------- the host: the tick, the E key, the tip, the night cards */
let ANC_HOSTED=false;
function ancHost(){if(ANC_HOSTED||typeof KDOOR==='undefined')return;ANC_HOSTED=true;
 const KM=KIT.meshes||{},ims=[KM.anLeaf,KM.anLeafG].filter(Boolean);   /* KIT.meshes: kbake's record (a fork's older kit may not keep one) */
 for(const im of ims){im.userData.lodSkip=true;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.castShadow=im.receiveShadow=true;}   /* core/lod leaves a moving set alone */
 for(const L of ANC_LEAVES)KDOORHOST.instanced(L.D,ims,L.idx,L.q,L.s);
 window._openings=ANC_OPEN.stats();if(window._api)Object.defineProperty(window._api,'openings',{get:()=>ANC_OPEN.stats(),configurable:true});}
/* the reach: the orbit's target (where the camera looks) or the eye, whichever is nearer a door */
/* the page's orbit: the kit's own ctl (92-camera.js), or core/host's (a fork on KHOST: Screamers) */
function ancCtl(){return typeof ctl!=='undefined'?ctl:typeof KHOST!=='undefined'&&KHOST.cam?KHOST.cam.ctl:null;}
function ancNight(){return typeof NIGHT!=='undefined'&&!!(NIGHT&&typeof NIGHT==='object'?NIGHT.on:NIGHT);}
function ancNear(){if(typeof KDOOR==='undefined'||!KDOOR.list.length)return null;const C=ancCtl(),c=camera.position,t=C?C.target:c;
 return KDOOR.nearest(t.x,t.y-1.2,t.z,3)||KDOORHOST.near(c,false);}
let ancNightWas=null;
/* the host also takes the page on its first animation frame, should the page's frame hook not run (a fork on core/host whose clock is paused) */
if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>{try{ancHost();}catch(e){if(typeof reportErr==='function')reportErr('openings: '+(e.stack||e));}});
/* the frame hook: the kit's tick (10-core.js); a fork of the kit without one (the Ancient Port) gets its own frame */
const ancOnFrame=typeof tick==='function'?tick:fn=>{let last=performance.now();const loop=now=>{const dt=Math.min(.1,(now-last)/1000);last=now;
 try{fn(dt);}catch(e){if(typeof reportErr==='function')reportErr('openings: '+(e.stack||e));return;}requestAnimationFrame(loop);};requestAnimationFrame(loop);};
ancOnFrame(dt=>{ancHost();if(!ANC_GUEST)KDOORHOST.tick(dt);
 const nt=ancNight();if(nt!==ancNightWas){ancNightWas=nt;for(const nm in ANC_CARD){const L=ANC_CARD[nm].l,m=L&&KIT.meshes&&KIT.meshes[L];if(m)m.material.emissiveIntensity=nt?1.1:0;}}});
if(!ANC_GUEST)addEventListener('keydown',e=>{if(e.key.toLowerCase()!=='e'||e.repeat)return;const D=ancNear();if(!D)return;
 KDOOR.toggle(D,{by:'player'});e.stopImmediatePropagation();},true);   /* capture: before 92-camera's E (lift) sees it */
/* the tip: made on the first frame (core/door's host, 90-core-door-host.js, sorts after this fragment) */
let ancTip=null;
if(!ANC_GUEST)ancOnFrame(()=>{if(!ancTip)ancTip=KDOORHOST.tip(()=>{const D=ancNear();return D?{x:D.at[0],y:D.at[1]+1.2,z:D.at[2]}:camera.position;},()=>false);ancTip();});
