// ================================================================= BLAKHED — the build: the Fellgang town, the villages, the Golden Tears, the toll post
// Every record of the plan is drawn here, none placed (89zb made them):
//   the Fellgang buildings  through the Tungang kit's host API (TG.fg.draw: seated by the kit, floor at the highest corner, plinth to
//                           the lowest), the town in 300 m chunks and each village in one, each drawn while in view and in range; the
//                           two meeting halls each in a draw of their own (the Fowlers' rope wall, the Ice-cutters' tally board)
//   the road pieces         the Travellers' wagons and halts, the lantern posts, the ice tools (TG.fg.pieces)
//   the Golden Tears' compound and Dalab's toll post  the Xanadu kit's and the Dalab set's pieces (VERN.place, as Thalaba places the
//                           Dalab mission), baked by chunk as Xanadu's page does
//   page geometry           what the kit lacks, named in PLAN.md section 5: the Fair's ring rails, its booths and the judges' cairn, the
//                           Market's booths and its peace stone, the Winterings' fire ring, the Stairhead's gin wheels, the stair's
//                           steps and rails, the Golden Tears' compound wall
// [web]: three.js.
reseed(BK.SEED+2);const BK_B0=performance.now();
const BK_GROUPS=[];
const bkSphere=(list,pad)=>{let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,y0=1e9,y1=-1e9;for(const r of list){x0=Math.min(x0,r.x-pad);x1=Math.max(x1,r.x+pad);z0=Math.min(z0,r.z-pad);z1=Math.max(z1,r.z+pad);
  const y=terrainH(r.x,r.z);y0=Math.min(y0,y-10);y1=Math.max(y1,y+20);}
 return new THREE.Sphere(new THREE.Vector3((x0+x1)/2,(y0+y1)/2,(z0+z1)/2),Math.hypot(x1-x0,y1-y0,z1-z0)/2+10);};
const BK_DRAW={recs:0,tris:0,missing:{},lights:[],halls:[],draws:0,errors:[]};
function bkFg(list,o,range,name){if(!list.length)return null;
 try{const D=TG.fg.draw({records:list,id:o.id||name,focus:o.focus,census:o.census},Object.assign({scene,ground:terrainH,label:name},o));
  D.group.name='chunk:'+name;D.group.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;m.userData.fgChunk=true;}});
  BK_DRAW.recs+=D.recs.length;BK_DRAW.tris+=D.tris;BK_DRAW.draws++;Object.assign(BK_DRAW.missing,D.missing);BK_DRAW.lights.push(...(D.lights||[]));
  BK_GROUPS.push({G:D.group,sphere:bkSphere(list,30),range,name,n:list.length});return D;}
 catch(e){BK_DRAW.errors.push(name+': '+(e&&e.message||e));reportErr('blakhed: '+name+': '+(e&&e.stack||e));return null;}}
// ---------------------------------------------------------------- the town: the halls, then the rest in 300 m chunks
if(BK_PLAN){const fgRecs=BK_PLAN.records.filter(r=>r.set==='fg');
 for(const r of fgRecs.filter(r=>r.kind==='hall')){const D=bkFg([r],{seed:BK.SEED+3,variant:r.variant,pegs:r.variant==='fowlers'?72:undefined,id:'blakhed.'+r.variant},1e9,r.name);
  if(D)BK_DRAW.halls.push(Object.assign({variant:r.variant},D.recs[0]&&D.recs[0].fg||{}));}
 const CH={};for(const r of fgRecs){if(r.kind==='hall')continue;const k=Math.floor(r.x/300)+','+Math.floor(r.z/300);(CH[k]=CH[k]||[]).push(r);}
 for(const k of Object.keys(CH).sort())bkFg(CH[k],{seed:BK.SEED+10,id:'blakhed.town'},2600,'Blakhed: the town ('+k+')');
 try{const P=TG.fg.pieces(BK_PLAN.pieces,{scene,ground:terrainH,label:'Blakhed: the Travellers\' wagons and halts, the lantern posts, the ice tools'});
  P.group.name='chunk:pieces';P.group.traverse(m=>{if(m.isMesh)m.userData.fgChunk=true;});BK_DRAW.pieces=P.recs.length;BK_DRAW.lights.push(...(P.lights||[]));BK_GROUPS.push({G:P.group,sphere:bkSphere(BK_PLAN.pieces,10),range:1800,name:'pieces',n:P.recs.length});}
 catch(e){BK_DRAW.errors.push('pieces: '+e.message);reportErr('blakhed pieces: '+(e&&e.stack||e));}}
// ---------------------------------------------------------------- the villages (the steadings, the Stairhead, the hamlets in the country)
for(const V of BK_VILLAGES)if(V.drawn&&V.records&&V.records.length)
 bkFg(V.records.map(r=>Object.assign({},r)),{seed:BK.SEED+20+(bkHash(V.id)%97),id:V.id,focus:V.focus==='ice'?'ice':V.focus,census:V.census,character:V.focus==='ice'?'low':null},V.kind==='hamlet'?5000:3600,V.name);

// ---------------------------------------------------------------- the Xanadu kit's and the Dalab set's pieces (VERN.place), and the page geometry
const BK_VGROUPS=[];let BK_INST=0;
function bkBake(name,list,extra,range){const G=new THREE.Group();G.name='chunk:'+name;scene.add(G);
 for(const p of list){TSTAT.cur=p.key+'/0';const r0=REG.length;const o={v:0,y:bkFoot(p)};VERN.place(G,p.key,p.x,p.z,p.ry,o);
  for(let i=r0;i<REG.length;i++){REG[i].type=p.key;if(p.name&&i===r0)REG[i].name=p.name;}}
 if(extra)extra();TSTAT.cur=null;kbake(G);if(typeof xaDoorsBind==='function')xaDoorsBind();BK_INST+=bkD(window._instances,0);for(const n in KIT.items)KIT.items[n].length=0;
 const pts=list.length?list:[{x:extra&&extra.at?extra.at[0]:0,z:extra&&extra.at?extra.at[1]:0}];
 BK_GROUPS.push({G,sphere:bkSphere(pts,90),range:range||3000,name,n:list.length});BK_VGROUPS.push(G);return G;}
/* a Xanadu or Dalab piece's floor: the lowest ground under its footprint (core/city's foot), less a little, so no corner floats */
function bkFoot(p){const D=VERN.defs[p.key]||{w:10,d:10},w=D.fw||D.w,d=D.fd||D.d,c=Math.cos(p.ry||0),s=Math.sin(p.ry||0);let y=terrainH(p.x,p.z);
 for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1]]){const lx=a*w/2,lz=b*d/2;y=Math.min(y,terrainH(p.x+lx*c+lz*s,p.z-lx*s+lz*c));}return y-.15;}
const bkWood=xC(0x6a5a46),bkStone=xC(0x7a766c),bkHide=xC(0x9a8462),bkIron=xC(0x4a4644),bkRope=xC(0x8a7a5a);
/* a post-and-rail fence along a closed or open polyline, its posts every `step` m on the ground */
function bkRails(P,step,h,closed){const Q=closed?P.concat([P[0]]):P;for(let i=0;i+1<Q.length;i++){const a=Q[i],b=Q[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/step)),ry=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2;
  for(let k=0;k<n;k++){const t=(k+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,y=terrainH(x,z);vB('vWood',x,y-.3,z,.16,h+.3,.16,0,bkWood);
   for(const hh of[h*.45,h*.9])vB('vWood',x,y+hh,z,L/n+.1,.09,.07,ry,bkWood);}}}
/* a booth: four poles, a hide awning sloping to the back, a plank counter */
function bkBooth(x,z,ry){const c=Math.cos(ry),s=Math.sin(ry),y=terrainH(x,z),P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
 for(const[lx,lz,h]of[[-1.6,-1.2,2.2],[1.6,-1.2,2.2],[-1.6,1.2,2.6],[1.6,1.2,2.6]]){const p=P(lx,lz);vB('vWood',p[0],terrainH(p[0],p[1])-.3,p[1],.12,h+.3,.12,0,bkWood);}
 {const p=P(0,0);vBq('vWood',p[0],y+2.45,p[1],3.6,.06,2.9,qEuler(-.16,ry,0),bkHide);const q=P(0,1.15);vB('vWood',q[0],y,q[1],3.2,.95,.5,ry,bkWood);}}
/* a cairn: stones heaped in rings */
function bkCairn(x,z,r,h){const y=terrainH(x,z);for(let k=0;k<6;k++){const rr=r*(1-k/6),n=Math.max(1,Math.round(rr*5));for(let i=0;i<n;i++){const a=i/n*Math.PI*2+k;vB('vStone',x+Math.cos(a)*rr*.8,y-.1+k*h/6,z+Math.sin(a)*rr*.8,.6,h/6+.15,.5,a,bkStone);}}}
const BK_PAGE={booths:0,rails:0,cairns:0,hoists:0,steps:0,wall:0};
// the Golden Tears' compound: its pieces and its wall, a gate on the caravan road
if(BK_PLAN){const T=BK_TOWN.TEARS,tears=BK_PLAN.records.filter(r=>r.quarter==='tears');
 bkBake('the Golden Tears',tears,()=>{TSTAT.cur='bk_tears_wall/0';const cs=Math.cos(T.ry),sn=Math.sin(T.ry),at=(lx,lz)=>[T.c[0]+lx*cs+lz*sn,T.c[1]-lx*sn+lz*cs],hw=T.w/2-4,hd=T.d/2-4;
  const C=[at(-hw,-hd),at(hw,-hd),at(hw,hd),at(-hw,hd)];
  for(let i=0;i<4;i++){const a=C[i],b=C[(i+1)%4],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2,n=Math.ceil(L/8);
   for(let k=0;k<n;k++){const t=(k+.5)/n;if(i===1&&Math.abs(t-.5)<.06)continue;   /* the gate, east, on the caravan road */
    const x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;vB('xEarthB',x,terrainH(x,z)-.4,z,L/n+.05,3.6,.7,ry,xC(0xb8a27e));BK_PAGE.wall++;}}
  REG.push({name:'The Golden Tears\' compound wall (rammed earth: page geometry)',key:'bk_tears_wall',type:'bk_tears_wall',cls:'building',x:T.c[0],y:terrainH(T.c[0],T.c[1]),z:T.c[1],r:T.w/2,h:3.6});},3200);}
// Dalab's toll post at the Stairhead, the gin wheels, the stair's steps and rails
if(BK_RINGS){bkBake('Dalab\'s toll post and the stair',BK_TOLL,()=>{
  TSTAT.cur='bk_hoist/0';
  for(const H of BK_RINGS.hoists){const y=terrainH(H.x,H.z),c=Math.cos(H.ry),s=Math.sin(H.ry),P=(lx,lz)=>[H.x+lx*c+lz*s,H.z-lx*s+lz*c];
   /* the gin wheel: a capstan the beasts walk round, its drum and the lowering frame over the edge */
   vB('vWood',H.x,y,H.z,.5,2.8,.5,0,bkWood);for(let k=0;k<4;k++){const a=k*Math.PI/4;vB('vWood',H.x,y+2.2,H.z,7,.22,.22,a,bkWood);}
   vBall('vWood',H.x,y+1.2,H.z,.9,bkWood,.8);
   for(const lx of[-2.2,2.2]){const p=P(lx,6);vB('vWood',p[0],terrainH(p[0],p[1])-.4,p[1],.4,6.4,.4,H.ry,bkWood);}
   {const p=P(0,6);vB('vWood',p[0],terrainH(p[0],p[1])+5.8,p[1],4.8,.4,.4,H.ry,bkWood);vB('vWood',p[0],terrainH(p[0],p[1])+1,p[1],.06,4.8,.06,0,bkRope);}
   REG.push({name:H.name,key:'bk_hoist',type:'bk_hoist',cls:'building',x:H.x,y,z:H.z,r:8,h:6.4});BK_PAGE.hoists++;}
  TSTAT.cur='bk_stair/0';const S=BK_RINGS.stair.pts;
  for(let i=0;i+1<S.length;i++){const a=S[i],b=S[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ry=Math.atan2(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/1.4));
   for(let k=0;k<n;k++){const t=(k+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;vB('vStone',x,terrainH(x,z)-.35,z,BK_RINGS.stair.w,.5,1.2,ry,bkStone);BK_PAGE.steps++;}}
  bkRails(S.map(p=>[p[0]+1.6,p[1]]),4,1.1,false);
  REG.push({name:BK_RINGS.stair.name,key:'bk_stair',type:'bk_stair',cls:'infrastructure',x:S[0][0],y:S[0][2],z:S[0][1],r:30,h:2});},3600);}
// the Fair's ring, booths and cairn; the Market's booths and peace stone; the Winterings' fire ring
bkBake('the Fair and the Market',[],()=>{TSTAT.cur='bk_fair/0';const T=BK_TOWN,F=T.FAIR,Q=[];
 for(let k=0;k<40;k++){const a=k/40*Math.PI*2;Q.push([F.c[0]+Math.cos(a)*F.rx,F.c[1]+Math.sin(a)*F.rz]);}bkRails(Q,5,1.3,true);BK_PAGE.rails=Q.length;
 for(let k=0;k<16;k++){const x=F.c[0]-150+(k%8)*40,z=F.c[1]-F.rz-34-Math.floor(k/8)*14;bkBooth(x,z,0);BK_PAGE.booths++;}
 bkCairn(F.c[0]+F.rx+18,F.c[1],2.4,2.6);BK_PAGE.cairns++;
 REG.push({name:'The Fair\'s ring (its rails: page geometry, the kit lacks the Fair\'s pieces)',key:'bk_fair_ring',type:'bk_fair_ring',cls:'building',x:F.c[0],y:terrainH(F.c[0],F.c[1]),z:F.c[1],r:F.rx,h:1.3});
 REG.push({name:'The Fair judges\' cairn',key:'bk_cairn',type:'bk_cairn',cls:'landmark',x:F.c[0]+F.rx+18,y:terrainH(F.c[0]+F.rx+18,F.c[1]),z:F.c[1],r:3,h:2.6});
 /* the Market: two rows of booths across the square, the peace stone at its middle */
 const Wm=T.frame.W;TSTAT.cur='bk_market/0';
 for(let k=0;k<10;k++){const p=Wm(-46+(k%5)*23,(k<5?-22:22)),ry=Math.atan2(T.frame.N[0],T.frame.N[1])+(k<5?0:Math.PI);bkBooth(p[0],p[1],ry);BK_PAGE.booths++;}
 {const p=Wm(0,0),y=terrainH(p[0],p[1]);vB('vStone',p[0],y-.5,p[1],1.1,3.1,.7,.3,xC(0x5e5a54));
  REG.push({name:'The peace stone (where a quarrel is sworn off: the market peace)',key:'bk_peace_stone',type:'bk_peace_stone',cls:'landmark',x:p[0],y,z:p[1],r:1,h:2.6});}
 REG.push({name:'The Market\'s booths (page geometry: the kit has no market hall or booths yet)',key:'bk_booths',type:'bk_booths',cls:'building',x:Wm(0,0)[0],y:terrainH(Wm(0,0)[0],Wm(0,0)[1]),z:Wm(0,0)[1],r:50,h:2.6});
 /* the Winterings' fire ring */
 TSTAT.cur='bk_fire/0';{const c=T.WINTER.c;for(let k=0;k<14;k++){const a=k/14*Math.PI*2;vB('vStone',c[0]+Math.cos(a)*3,terrainH(c[0],c[1])-.1,c[1]+Math.sin(a)*3,.7,.45,.5,a,bkStone);}
  REG.push({name:'The Travellers\' fire ring in the Winterings',key:'bk_fire_ring',type:'bk_fire_ring',cls:'landmark',x:c[0],y:terrainH(c[0],c[1]),z:c[1],r:4,h:.5});}},2600);
window._instances=BK_INST;
// ---------------------------------------------------------------- the runtime LOD: a chunk is drawn while in view and in range
// core/lod clusters merged static meshes onto 4 m and 16 m grids by default, which collapses 6-8 m Fellgang huts merged by
// TG.fg.draw; keep FG chunks unsimplified (BK_GROUPS already culls them by frustum and range)
window.LOD_OPTIONS={classify:o=>o.userData&&o.userData.fgChunk?'fg':null,classes:{fg:{simplify:false,minPx:.8}}};
const bkFr=new THREE.Frustum(),bkPm=new THREE.Matrix4();
FRAME_HOOKS.push(()=>{camera.updateMatrixWorld();bkPm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);bkFr.setFromProjectionMatrix(bkPm);const P=camera.position;let shown=0;
 for(const e of BK_GROUPS){const d=P.distanceTo(e.sphere.center)-e.sphere.radius;const v=d<e.range&&bkFr.intersectsSphere(e.sphere);e.G.visible=v;if(v)shown++;}window._chunksShown=shown;});
LABELS=new THREE.Group();LABELS.userData.probeSkip=true;scene.add(LABELS);
window._registered=REG.length;window._chunks=BK_GROUPS.length;window._buildMs=Math.round(performance.now()-BK_B0);
window._blakhed=Object.assign(window._blakhedPlan||{},{drawn:BK_DRAW.recs,draws:BK_DRAW.draws,tris:BK_DRAW.tris,missing:BK_DRAW.missing,halls:BK_DRAW.halls,pieces:BK_DRAW.pieces||0,
 lights:BK_DRAW.lights.length,errors:BK_DRAW.errors.concat((TG.errors||[]).slice(0,5)),chunks:BK_GROUPS.length,page:BK_PAGE,
 tears:BK_PLAN?BK_PLAN.records.filter(r=>r.quarter==='tears').map(r=>r.key):[],toll:BK_TOLL.map(t=>t.key),
 xdims:BK_PLAN?Object.keys(BK_TOWN.XDIMS).map(k=>{const D=VERN.defs[k],X=BK_TOWN.XDIMS[k];return D?[k,Math.abs(D.w-X[0])<.01&&Math.abs(D.d-X[1])<.01]:[k,false];}):[]});
