// ---------------------------------------------------------------- OPENINGS: real doors and real glass on core/door (the owner, 2026-11-03)
// "Remove all dark voids and make all windows, doors and portals actual doors or windows that have transparency", doors that open
// and shut "with a keypress nearby or by an NPC", and "real glass". The records, rules and walk blocks are core/door's (KDOOR,
// KGLASS, KDOORHOST); this is the Post-Apoc engine's drawing of them, after core/engine/36o-open.js. Nothing here draws a random
// number, so every builder reads the stream it read before.
//   poOpening(x0,x1,y0,y1,th)   wallOpen (32-cores.js) records each opening it leaves, in the current frame: a door() drawn in one
//                               opens onto what is behind it (a hollow body) and is an operable door; one on a solid face is LOCKED
//                               (nothing behind it) and keeps the leaf the builder drew. A window in one is real glass; one on a
//                               solid face gets the room card behind its glass (poCard)
//   poLeaf(x,y,z,w,h,o)         an operable leaf in the current frame (+z out of the face, y the sill, (x,z) the middle of the doorway's
//                               line): a KDOOR record with a stable id ('<def key>.<placement>.d<n>': the dock's second door in the
//                               first dock placed is 'dock.0.d1'), drawn as one instance of the leaves' InstancedMesh, posed by
//                               KDOORHOST as it swings. o: {col, t (.06), hinge -1|1 (the jamb: -x default), ajar (radians, drawn standing
//                               that far open), out, locked, record (true: a record only, the builder's leaf stays drawn: a locked door)}
//   poCard(x,y,z,w,h)           the room card (KGLASS 'room') a pane on a solid body stands in front of
//   PO.stats()                  {doors, locked, leaves, panes, cut, cards} for the probe (_api.openings())
// The leaves become their mesh once per buildWorld (poFlush), the doors' walk blocks go into core/walk where it has floors (the
// interiors, ?interiors=1), and E opens the door within reach (92-camera.js's walker or the orbit camera).
/* a guest in another page (apoc_bundle.py: KPA_HOST is the bundle's): the doors join the HOST's registry (their ids prefixed 'apoc:',
   only this kit's own records dropped on a rebuild), and the frame tick, E, the tip and the walk blocks are the host's (Screamers'
   8zo-anc-open.js). Without core/door in the page (PO_CAN false) nothing is recorded: each door is drawn shut as the builder drew it */
const PO_GUEST=typeof KPA_HOST!=='undefined',PO_CAN=typeof KDOOR!=='undefined'&&typeof KGLASS!=='undefined';   /* KDOORHOST (90-core-door-host.js) sorts after this fragment: it is there by the first build */
const PO={opens:[],leaves:[],mesh:null,per:{},stack:[],cur:null,panes:0,cut:0,cards:0,cleared:0,
 stats(){const L=KDOOR.list;return {doors:L.length,locked:L.filter(D=>D.locked).length,leaves:this.leaves.length,panes:this.panes,cut:this.cut,cards:this.cards,cleared:this.cleared};}};
if(PO_CAN){MAT.room=KGLASS.material(THREE,'room');TILE.room=1;
/* the glass: KGLASS's 'frosted' kind (scrap glazing is salvaged, scratched and grimy: light through, little view), tinted per pane by the
   builder's vertex colour (PAL.glass, the bottle greens); the lit-window schedule (22-mat.js animPatch 'glass') patches it as before. The panes
   emit() moves to 'winlit' (about half: the evening schedule's lit windows) are glass by day too: see through, opaque only when lit (91n-night.js) */
{const g=KGLASS.material(THREE,'frosted').clone();g.vertexColors=true;g.color.set(0xffffff);g.emissive.set(0x061012);g.emissiveIntensity=.5;g.name='kglass:frosted:post-apoc';MAT.glass=g;}
MAT.winlit.transparent=true;MAT.winlit.depthWrite=false;MAT.winlit.opacity=KGLASS.SPEC.frosted.opacity;}
else{MAT.room=new THREE.MeshStandardMaterial({color:0x6e5a46,roughness:.94});TILE.room=1;}
const PO_LITGLASS=SRGB2LIN(new THREE.Color(0x7aa8a0));   /* the glass over a lit room (34-adds.js win o.lit) */
function poLive(){return PO_CAN&&GTARGET===GB;}   /* a throwaway build (frontOf) or a spinner records nothing */
function poOpening(x0,x1,y0,y1,th){if(!poLive())return;
 const c=new THREE.Vector3((x0+x1)/2,(y0+y1)/2,0).applyMatrix4(CM),u=new THREE.Vector3(1,0,0).transformDirection(CM),n=new THREE.Vector3(0,0,1).transformDirection(CM);
 PO.opens.push({c,u,n,hw:(x1-x0)/2,hh:(y1-y0)/2,th:th==null?.15:th});}
/* the opening a point of the current frame stands in (a doorway's middle, a pane's centre), or null */
function poInOpening(x,y,z){const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);
 for(const O of PO.opens){const d=p.clone().sub(O.c);if(Math.abs(d.dot(O.n))<O.th/2+.3&&Math.abs(d.dot(O.u))<O.hw+.05&&Math.abs(d.y)<O.hh+.05)return O;}return null;}
function poW(x,y,z){const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);return [p.x,p.y,p.z];}
function poYaw(){const e=CM.elements;return Math.atan2(e[8],e[10]);}
function poLeaf(x,y,z,w,h,o){o=o||{};if(!poLive()||!PO.cur)return null;
 const t=o.t==null?.06:o.t,hs=o.hinge==null?-1:(o.hinge>0?1:-1),wy=poYaw(),e=CM.elements,sc=Math.hypot(e[0],e[1],e[2])||1;
 const at=poW(x,y,z),hinge=poW(x+hs*w/2,y,z),p0=poW(x,y,z);
 let open=0;if(o.ajar&&!o.locked){const v=Math.min(1,Math.abs(o.ajar)/KDOOR.SWING);let lo=0,hi=1;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(m*m*(3-2*m)<v)lo=m;else hi=m;}open=(lo+hi)/2;}   /* the smoothstep KDOOR.angle eases by, inverted */
 const base=PO.cur.key+'.'+PO.cur.ord,i=PO.cur.n++;
 const D=KDOOR.add({id:(PO_GUEST?'apoc:':'')+base+'.d'+i,po:true,at,hinge,p0,yaw:wy,sign:(hs>0?-1:1)*(o.out?-1:1),w:w*sc,h:h*sc,t:t*sc,locked:!!o.locked,open,key:PO.cur.key,drawn:!!o.record});
 if(o.record)return D;   /* a locked door on a solid face: the builder's leaf stays as drawn, the record is the door */
 const c=o.col==null?jc(0x7a2e28,.05):(typeof o.col==='number'?hc(o.col):o.col);
 PO.leaves.push({D,col:c.clone?c.clone():c,q:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),wy),s:[(w-.04)*sc,(h-.02)*sc,t*sc]});
 return D;}
function poCard(x,y,z,w,h){if(!poLive())return;box('room',x,y,z,w,h,.02);PO.cards++;}
/* every placement counts its doors from 0 under its def's key and its place among that key's placements in this world */
const poPlace0=place;
place=function(key,x,z,ry,o){if(!poLive()||!DEFS[key])return poPlace0.apply(this,arguments);
 const ord=PO.per[key]=PO.per[key]==null?0:PO.per[key]+1;PO.stack.push(PO.cur);PO.cur={key,ord,n:0};
 try{return poPlace0.apply(this,arguments);}finally{PO.cur=PO.stack.pop();}};
/* once per world: the leaves as one InstancedMesh (base-origin box, a colour each), handed to the host; the walk blocks */
let poGeo=null;
let poHooked=false;
function poFlush(parent){
 if(!poHooked&&!PO_GUEST){poHooked=true;FRAME_HOOKS.push(dt=>{KDOORHOST.tick(Math.min(dt,.06));});   /* the leaves ease on the frame (90-scene.js's hooks exist by the first build) */
  FRAME_HOOKS.push(KDOORHOST.tip(()=>camera.position,()=>WALK.on));   /* "E: open the door" at the foot of the page */
  addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='TEXTAREA')return;if(e.key==='e'||e.key==='E')KDOORHOST.toggleNear(camera.position,WALK.on);});}
 if(PO.mesh){PO.mesh.parent&&PO.mesh.parent.remove(PO.mesh);PO.mesh=null;}
 const L=PO.leaves;if(L.length){poGeo=poGeo||new THREE.BoxGeometry(1,1,1).translate(0,.5,0);
  const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85});const im=new THREE.InstancedMesh(poGeo,m,L.length);im.name='door leaves';
  const P=new THREE.Vector3(),S=new THREE.Vector3(),M=new THREE.Matrix4();
  L.forEach((Lf,i)=>{const p=Lf.D.p0;im.setMatrixAt(i,M.compose(P.set(p[0],p[1],p[2]),Lf.q,S.set(Lf.s[0],Lf.s[1],Lf.s[2])));im.setColorAt(i,Lf.col);KDOORHOST.instanced(Lf.D,im,i,Lf.q,Lf.s);});
  im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;im.userData.doorLeaves=true;im.userData.probeSkip=true;
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;parent.add(im);PO.mesh=im;
  for(const D of KDOOR.list)if(D.open>0)KDOORHOST.pose(D);}
 if(PO_GUEST||typeof KWALK==='undefined')return;   /* a guest's walk blocks are the host's (its KDOOR.walk) */
 KDOOR.walk(KWALK);PO.cleared=KDOOR.clearDoorways(KWALK);
 /* a locked door on a solid face stands in a shell core/walk does not hold (only the interiors' rooms are in it, ?interiors=1): its block
    would be the only wall there, so it is switched off and the walker keeps the way in it had */
 for(const D of KDOOR.list)if(D.locked&&D.drawn)KWALK.setBlock(D.blocks,false);}
const poBuildWorld0=buildWorld;
buildWorld=function(k){if(PO_CAN){if(PO_GUEST)KDOOR.prune(D=>!D.po);else KDOOR.clear();}PO.opens.length=0;PO.leaves.length=0;PO.per={};PO.panes=0;PO.cut=0;PO.cards=0;
 const W0=poBuildWorld0.apply(this,arguments);if(PO_CAN)poFlush(W0);return W0;};
