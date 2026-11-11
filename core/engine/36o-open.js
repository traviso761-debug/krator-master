// ================================================================= OPENINGS: real doors and real glass on core/door (the owner, 2026-11-03)
// "Remove all dark voids and make all windows, doors and portals actual doors or windows that have transparency", doors that
// open and shut "with a keypress nearby or by an NPC", and "real glass". The records, rules and walk blocks are core/door's
// (KDOOR, 10-core-door.js; KGLASS, 20-core-glass.js; the leaf's pose KDOORHOST, 90-core-door-host.js): this is the engine's
// drawing of them, so every kit on the engine draws a doorway and a window the same way. A builder calls these in its local
// frame, as it calls door() and box() (+z out of the face, y the sill):
//   svLeaf(x,y,z,yaw,w,h,o)       a door leaf SHUT in the doorway, registered in KDOOR with a stable id (the def's key, how many
//                                 of that key were placed before it in this world, and the door's index in the def: the
//                                 Baelu's third cell door is 'baelu.0.d2'). (x,z) the middle of the doorway's line at the
//                                 sill y, yaw the way out (0 = +z), w x h the opening. o: {t (.06), col (an sRGB hex or a
//                                 linear THREE.Color, as box() takes it: the leaf's tint under the key's library map; none: the map's own), mk (the key whose map it wears: 'wood'), locked (a solid body:
//                                 nothing behind it, drawn shut and never opened), mirror (hinged on +x), split (two leaves,
//                                 meeting in the middle; default when w > 1.6), shape ('box', or 'tri': a triangle, its apex
//                                 over the middle: the Lizardmen's caste doors), pivot (turns about its own middle, not a jamb:
//                                 a triangle pivots so it never meets its slanted jambs), out (swings out of the face, not into
//                                 the room), style (core/door's leaf look, KDOORLEAF: 'plank', 'panel', 'glazed', 'half', 'glass',
//                                 'louvre', 'grille', 'slat'; the glazed ones' lights in the clear glass), and core/door's kind,
//                                 preset, pair, both, spring (a sliding, lifting, folding, saloon door: KDOOR.add), ajar (radians: drawn standing that far open, as the builder drew it; E shuts it), name}. It draws nothing into the buckets:
//                                 the leaves are one InstancedMesh per material key (two when the page has tents: a leaf in a
//                                 cut-away tent hides with the near half), posed by KDOORHOST as they swing. Returns the
//                                 record (a split door: the left leaf, the right one on .mate).
//   svDoorway(x,y,z,yaw,w,h,o)    the doorway a builder drew as a dark panel: o.hollow (a room behind it) an operable leaf, else
//                                 a locked one; o as svLeaf's, and o.open: a portal with nothing to shut (an arch, a gate
//                                 passage) is left a clear opening, the room card (svRoom) behind it when the body is solid
//   svPane(x,y,z,yaw,w,h,o)       a window pane, (x,z) the middle of its line, y its foot: o.kind 'clear' (default), 'lit' (a
//                                 night window you still see through), 'smoked', 'frosted', 'stained' (o.color); o.solid: the
//                                 body has no interior, so a room card stands o.depth (.06) behind the glass; o.t (.03)
//   svPanePoly(pts,o)             the same over a convex polygon in the face's plane (+z out of it): a slit, a lancet; o.glass
//                                 false: the card alone (an unglazed vent on a solid face)
//   svRoom(x,y,z,yaw,w,h)         the room card alone (an open portal on a solid body)
//   svGlass(kind, o)              the material key of a glass kind (o.color for 'stained'), counted as a pane, for a builder that
//                                 draws its own glass shape (an oculus, a lantern's panes): ellip(svGlass('clear'), ...)
//   SV_OPEN.stats()               {doors, locked, leaves, panes, cards} for the probe (verify.py --eval)
// buildWorld (90-scene.js) clears KDOOR first and calls svOpenFlush(WORLD) after the buckets: the leaves' meshes, and, where the
// page has core/walk, KDOOR.walk(KWALK) and the doorways cleared of the wall boxes the walk records read (svOpenWalk). The
// frame tick and the E key are 99-host-take.js's.
const SV_OPEN={leaves:[],meshes:[],cutMeshes:[],panes:0,cards:0,perKey:{},perDef:null,
 stats(){const L=KDOOR.list;return {doors:L.length,locked:L.filter(D=>D.locked).length,leaves:this.leaves.length,panes:this.panes,cards:this.cards};}};
/* the glass kinds as material keys (one shared material each). A bundle that carries the engine without core/door (a city page's
   ISK) gets the engine's lamp glass and a plain card instead, and draws its leaves shut into the buckets (svLeaf, PLACE_DRY) */
const SV_KGLASS=typeof KGLASS!=='undefined'?KGLASS:null;
for(const [k,kind] of [['paneClear','clear'],['paneLit','lit'],['paneSmoked','smoked'],['paneFrosted','frosted'],['room','room']]){
 MAT[k]=SV_KGLASS?SV_KGLASS.material(THREE,kind):kind==='room'?new THREE.MeshStandardMaterial({color:0x6e5a46,roughness:.94}):MAT.glass;TILE[k]=1;}
const SV_PANEKEY={clear:'paneClear',lit:'paneLit',smoked:'paneSmoked',frosted:'paneFrosted'};
function svPaneKey(o){const kind=o&&o.kind?o.kind:'clear';if(kind!=='stained')return SV_PANEKEY[kind]||'paneClear';
 if(!SV_KGLASS)return 'paneClear';const hex=o.color==null?SV_KGLASS.SPEC.stained.color:o.color,k='paneSt'+hex.toString(16);if(!MAT[k]){MAT[k]=SV_KGLASS.material(THREE,'stained',{color:hex});TILE[k]=1;}return k;}
const _svP=new THREE.Vector3(),_svQ=new THREE.Quaternion(),_svS=new THREE.Vector3(),_svM=new THREE.Matrix4();
/* the world point of a local one, and the world yaw of a local one (the current frame CM) */
function svW(x,y,z){const p=new THREE.Vector3(x,y,z).applyMatrix4(CM);return [p.x,p.y,p.z];}
function svYaw(yaw){const e=CM.elements;return Math.atan2(e[8],e[10])+(yaw||0);}
function svDefIndex(){if(!CURREC)return 'free';if(CURREC._doorN==null){const pk=SV_OPEN.perKey;CURREC._doorOrd=pk[CURREC.key]=(pk[CURREC.key]==null?0:pk[CURREC.key]+1);CURREC._doorN=0;}
 return CURREC.key+'.'+CURREC._doorOrd;}
function svLeaf(x,y,z,yaw,w,h,o){o=o||{};const split=o.split==null?w>1.6:!!o.split;
 /* a dry placement (a prototype a city page instances), or a draw into another target: the leaf shut, in the buckets, no record */
 if(PLACE_DRY||GTARGET!==GB||typeof KDOOR==='undefined'){const t=o.t==null?.06:o.t,c=o.col==null?0xffffff:o.col;
  W(x,y,z,yaw||0,()=>{if(o.shape==='tri'){_svM.compose(_svP.set(0,h/2,0),_svQ.identity(),_svS.set(w,h,t));emit(o.mk||'wood',svTriGeo(),_svM.clone(),c);}else box(o.mk||'wood',0,0,0,w,h,t,c);
   if(split)box('iron',0,0,0,.03,h,t+.01,0x2e2a26);});return null;}
 if(split){const ux=Math.cos(yaw||0),uz=-Math.sin(yaw||0),q=w/4;
  const L=svLeaf(x-ux*q,y,z-uz*q,yaw,w/2,h,Object.assign({},o,{split:false,mirror:false}));
  const R=svLeaf(x+ux*q,y,z+uz*q,yaw,w/2,h,Object.assign({},o,{split:false,mirror:true,id:o.id==null?null:o.id+'.r'}));if(L)L.mate=R;return L;}   /* .mate, not .pair: pair is core/door's two-leaves flag */
 const t=o.t==null?.06:o.t,ux=Math.cos(yaw||0),uz=-Math.sin(yaw||0),hs=o.mirror?1:-1;
 const hw=o.pivot?0:w/2,at=svW(x,y,z),hinge=svW(x+hs*ux*hw,y,z+hs*uz*hw),p0=svW(x,y+h/2,z),wy=svYaw(yaw);
 const e=CM.elements,sc=Math.hypot(e[0],e[1],e[2])||1;
 const base=svDefIndex(),i=CURREC?CURREC._doorN++:SV_OPEN.leaves.length;
 let open=0;if(o.ajar&&!o.locked){const v=Math.min(1,Math.abs(o.ajar)/KDOOR.SWING);let lo=0,hi=1;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(m*m*(3-2*m)<v)lo=m;else hi=m;}open=(lo+hi)/2;}   /* the smoothstep KDOOR.angle eases by, inverted */
 const st=o.style&&typeof KDOORLEAF!=='undefined'&&KDOORLEAF.STYLES.indexOf(o.style)>=0&&o.shape!=='tri'?o.style:null;
 const D=KDOOR.add({id:o.id==null?base+'.d'+i:o.id,at,hinge,p0,yaw:wy,sign:(o.mirror?-1:1)*(o.out?-1:1),w:w*sc,h:h*sc,t:t*sc,locked:!!o.locked,
  open,pivot:!!o.pivot,key:CURREC?CURREC.key:null,name:o.name||null,preset:o.preset,kind:o.kind,pair:o.pair,both:o.both,spring:o.spring,swing:o.swing,roll:o.roll,walk:o.walk,style:st});
 SV_OPEN.leaves.push({D,mk:o.mk||'wood',shape:o.shape==='tri'?'tri':'box',style:st,n:KDOOR.leafCount(D),col:o.col==null?0xffffff:(typeof o.col==='number'?o.col:o.col.clone()),cut:CUTC[3]>.5,q:new THREE.Quaternion().setFromAxisAngle(_up,wy),s:[w*sc,h*sc,t*sc]});
 return D;}
function svDoorway(x,y,z,yaw,w,h,o){o=o||{};
 if(o.open){if(!o.hollow)svRoom(x,y,z,yaw,w,h);return null;}
 return svLeaf(x,y,z,yaw,w,h,Object.assign({},o,{locked:o.locked==null?!o.hollow:o.locked}));}
function svGlass(kind,o){if(!PLACE_DRY)SV_OPEN.panes++;return svPaneKey(Object.assign({kind:kind||'clear'},o||{}));}
function svRoom(x,y,z,yaw,w,h){if(PLACE_DRY)return;W(x,y,z,yaw||0,()=>box('room',0,0,0,w,h,.02));SV_OPEN.cards++;}
function svPane(x,y,z,yaw,w,h,o){o=o||{};const t=o.t==null?.03:o.t,k=svPaneKey(o);
 W(x,y,z,yaw||0,()=>{if(o.solid){box('room',0,0,-(o.depth==null?.06:o.depth),w,h,.02);if(!PLACE_DRY)SV_OPEN.cards++;}box(k,0,0,0,w,h,t);});
 if(!PLACE_DRY)SV_OPEN.panes++;}
function svPanePoly(pts,o){o=o||{};const k=svPaneKey(o),d=o.depth==null?.04:o.depth;
 if(o.solid!==false){poly('room',pts.map(p=>[p[0],p[1],p[2]-d]),null);if(!PLACE_DRY)SV_OPEN.cards++;}
 if(o.glass===false)return;poly(k,pts,null,true);if(!PLACE_DRY)SV_OPEN.panes++;}
/* a triangle leaf: the unit prism, base [-.5,.5] at y -.5, apex (0,.5), z [-.5,.5] (cached) */
let SV_TRI=null;
function svTriGeo(){if(SV_TRI)return SV_TRI;const P=[[-.5,-.5],[.5,-.5],[0,.5]],pos=[],nor=[],uv=[],idx=[];
 const quad=(a,b,n)=>{const s=pos.length/3;for(const [p,zz] of [[a,-.5],[b,-.5],[b,.5],[a,.5]]){pos.push(p[0],p[1],zz);nor.push(n[0],n[1],0);}uv.push(0,0,1,0,1,1,0,1);idx.push(s,s+1,s+2,s,s+2,s+3);};
 for(const zz of [-.5,.5]){const s=pos.length/3;for(const p of P){pos.push(p[0],p[1],zz);nor.push(0,0,zz>0?1:-1);uv.push(p[0]+.5,p[1]+.5);}idx.push(s,s+1,s+2);}
 for(let i=0;i<3;i++){const a=P[i],b=P[(i+1)%3],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);quad(a,b,[dy/L,-dx/L]);}
 return SV_TRI=fixWind(mkGeo(pos,nor,uv,idx));}
/* the leaves' material: the key's library map (and its specular and break-up) under the leaf's own colour, no vertex colours */
const SV_LEAFMAT={};
function svLeafMat(mk){if(SV_LEAFMAT[mk])return SV_LEAFMAT[mk];const S=MAT[mk]||MAT.wood||null;
 const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:S&&S.roughness!=null?S.roughness:.8,metalness:S&&S.metalness||0});
 if(S&&S.map){m.map=S.map;m.normalMap=S.normalMap||null;m.roughnessMap=S.roughnessMap||null;if(S.normalMap)m.normalScale.copy(S.normalScale);
  const L=S.userData&&S.userData.lib;if(L)matHook(m,'lib'+KMAT.libKey(L),sh=>KMAT.libHooks(sh,L));}
 m.name='leaf:'+mk;return SV_LEAFMAT[mk]=m;}
function svOpenReset(){KDOOR.clear();SV_OPEN.leaves.length=0;SV_OPEN.meshes.length=0;SV_OPEN.cutMeshes.length=0;SV_OPEN.panes=0;SV_OPEN.cards=0;SV_OPEN.perKey={};}
function svOpenFlush(parent,o){
 const groups=new Map();for(const L of SV_OPEN.leaves){const k=L.mk+'|'+L.shape+(L.style?'|'+L.style:'')+(L.cut?'|cut':'');if(!groups.has(k))groups.set(k,[]);groups.get(k).push(L);}
 for(const [k,G] of groups){const N=G.reduce((a,L)=>a+L.n,0),LG=G[0].style?KDOORLEAF.geometry(THREE,G[0].style):null;
  const im=new THREE.InstancedMesh(G[0].shape==='tri'?svTriGeo():LG?LG.frame:gbox(),svLeafMat(G[0].mk),N);im.name='door leaves '+k;im.userData.doorLeaves=true;
  /* a styled leaf's lights: their own mesh in the clear glass, every instance set with its leaf's (KDOORHOST.instanced, both meshes) */
  const gim=LG&&LG.glass?new THREE.InstancedMesh(LG.glass,MAT.paneClear,N):null;if(gim){gim.name='door glass '+k;gim.userData.doorLeaves=true;gim.frustumCulled=false;gim.receiveShadow=true;}
  im.castShadow=true;im.receiveShadow=true;im.frustumCulled=false;   /* r128 culls an InstancedMesh by its geometry's sphere: the unit box at the origin */
  let n=0;G.forEach(L=>{const idx=[],shut=KDOOR.leaves(Object.assign({},L.D,{open:0}));
   for(let j=0;j<L.n;j++){const P=shut[j].p,S=L.n===1?L.s:shut[j].size;_svP.set(P[0],P[1],P[2]);_svS.set(S[0],S[1],S[2]);_svM.compose(_svP,L.q,_svS);
    im.setMatrixAt(n,_svM);if(gim)gim.setMatrixAt(n,_svM);im.setColorAt(n,typeof L.col==='number'?hc(L.col):L.col);idx.push(n++);}   /* a hex is sRGB (hc); a THREE.Color is already linear, as emit() takes it */
   KDOORHOST.instanced(L.D,gim?[im,gim]:im,L.n===1?idx[0]:idx,L.q,L.n===1?L.s:null);});
  for(const m of gim?[im,gim]:[im]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;m.computeBoundingSphere&&m.computeBoundingSphere();
   parent.add(m);SV_OPEN.meshes.push(m);if(G[0].cut)SV_OPEN.cutMeshes.push(m);}}
 for(const D of KDOOR.list)if(D.target>0||D.open>0)KDOORHOST.pose(D);
 if(typeof KWALK!=='undefined'&&!(o&&o.walk===false))svOpenWalk(KWALK);}   /* o.walk false: the page calls svOpenWalk itself, after its last walk records (Zeijani's interiors) */
/* the walk (core/walk): each door's blocks (a door drawn ajar, however far, starts clear), and every other
   block standing in an UNLOCKED doorway switched off (the wall boxes either side of a gap a little narrower than the door, a
   panel the old builder drew there); a locked door stands on a solid body's face, whose mass block KDOOR leaves alone */
function svOpenWalk(Wk){KDOOR.walk(Wk);const n=KDOOR.clearDoorways(Wk);SV_OPEN.cleared=n;return n;}
