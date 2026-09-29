// ================================================================ PORT CORE
// The Krator Ancient Port: constants, the segment/vessel registry, the layout
// builders the targets use, and the small shared utilities (geometry batching,
// world-UV boxes, local ground height). See API.md; CONTRACT.md is the law.
//
// AXES. x runs ALONG the coast (segments tile side by side along x). z is the
// land/sea axis: -z is LAND, +z is SEA. y is up and SEA LEVEL IS y=0. Every
// segment's deck is at y = PORT.DECK.
const PORT={
 DECK:6,          // quay top, m above sea level: every deck in the port is here
 W:220,           // every segment's footprint width along x
 SEA0:0,          // sea level
 SEABED:-30,      // the natural seabed far offshore
 CLEAR:8,         // buildings/props stay this far inside the footprint edges
 LAND_MAX:120, SEA_MAX:420,
 BERTH:-16,       // a working berth's dredged depth
};
// Budget classes a registration may name (read by 91-probe.js).
const PORT_CLS={seg:200000,vessel:250000,small:60000};

// ---------------------------------------------------------------- registry
// PORT_REG.seg[key] / PORT_REG.vessel[key] = the registration object as given,
// plus `kind`. Fragments call PORT_SEG({...}) / PORT_VESSEL({...}) at top
// level; the targets lay out whatever is registered, sorted by key.
const PORT_REG={seg:{},vessel:{}};
function portRegister(kind,o){
 const need=['key','name','cls','W','LAND','SEA','decays','stamps','build'];
 if(kind==='vessel')need.push('length','beam','draft');
 const miss=need.filter(k=>o[k]===undefined);
 const tag=(o&&o.key)||'(no key)';
 if(miss.length){reportErr('PORT_'+kind.toUpperCase()+' '+tag+': missing '+miss.join(', '));return;}
 if(PORT_REG.seg[o.key]||PORT_REG.vessel[o.key]){reportErr('PORT registration: duplicate key '+o.key);return;}
 if(!PORT_CLS[o.cls])reportErr('PORT '+tag+': cls must be one of '+Object.keys(PORT_CLS).join('/'));
 if(o.W!==PORT.W)reportErr('PORT '+tag+': W must be '+PORT.W+' (got '+o.W+')');
 if(o.LAND>PORT.LAND_MAX||o.SEA>PORT.SEA_MAX||o.LAND<0||o.SEA<0)reportErr('PORT '+tag+': LAND<=120, SEA<=420');
 if(typeof o.build!=='function'||typeof o.stamps!=='function')reportErr('PORT '+tag+': build and stamps must be functions');
 o.kind=kind;
 if(kind==='vessel'&&o.norepair===undefined)o.norepair=true;   // vessels dress their own d=3
 PORT_REG[kind][o.key]=o;}
function PORT_SEG(o){portRegister('seg',o);}
function PORT_VESSEL(o){portRegister('vessel',o);}
const portSegKeys=()=>Object.keys(PORT_REG.seg).sort();
const portVesselKeys=()=>Object.keys(PORT_REG.vessel).sort();
function portRegOf(key){return PORT_REG.seg[key]||PORT_REG.vessel[key]||null;}

// ---------------------------------------------------------------- layout
// A LAYOUT is what a target hands the scene: PORT_LAYOUT = {items:[...],
// stamps:[...world stamps...], runs:[...]}. An item is one placed segment:
//   {key, d, gx, gz, nb:{W:{kind,dz,key},E:{...}}, slot, run, ctx}
// or one free-standing vessel:
//   {vessel:true, key, d, gx, gz, heading}
// nb.kind is 'seg' (another segment), 'land' (natural coast) or 'sea' (open
// water); dz = the neighbour's z offset minus this one's (negative = the
// neighbour is set back toward the land).
//
// The z offsets the showcase cycles through. Indexed (slot*2 + run*3) % 7 so a
// run of only two segments still shows a flush joint, a 20 m and a 40 m step.
const PORT_DZSEQ=[0,20,-40,0,40,-20,20];
// Lay `keys` side by side from x0 (the west edge of the first footprint), each
// at its own gz; returns the items with nb filled. Run ends see `endW`/`endE`.
function portRun(keys,d,x0,dzs,o){o=o||{};const out=[];let x=x0;
 keys.forEach((k,i)=>{const R=portRegOf(k);const w=R?R.W:PORT.W;
  out.push({key:k,d,gx:x+w/2,gz:dzs[i]||0,slot:i,run:o.run||0,ctx:!!(o.ctx&&o.ctx[i])});x+=w;});
 out.forEach((it,i)=>{
  const P=out[i-1],N=out[i+1];
  it.nb={W:P?{kind:'seg',dz:P.gz-it.gz,key:P.key}:Object.assign({kind:'land',dz:0},o.endW||{}),
         E:N?{kind:'seg',dz:N.gz-it.gz,key:N.key}:Object.assign({kind:'land',dz:0},o.endE||{})};});
 return {items:out,x0,x1:x};}
// The showcase: one continuous run per decay (intact, ruined, reclaimed), each
// holding every registered segment that supports that decay, sorted by key,
// separated by `gap` metres of untouched natural coast.
function portLayoutShowcase(o){o=Object.assign({decays:[0,1,3],gap:440},o||{});
 const keys=portSegKeys(),runs=[];let x=0;
 o.decays.forEach((d,r)=>{const ks=keys.filter(k=>PORT_REG.seg[k].decays.indexOf(d)>=0);
  if(!ks.length)return;
  const dzs=ks.map((k,i)=>PORT_DZSEQ[(i*2+r*3)%PORT_DZSEQ.length]);
  const R=portRun(ks,d,x,dzs,{run:r});runs.push(Object.assign({d},R));x=R.x1+o.gap;});
 const mid=runs.length?(runs[0].x0+runs[runs.length-1].x1)/2:0;
 for(const R of runs){R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;}
 const items=[].concat(...runs.map(R=>R.items));
 return {items,runs,stamps:[],vessels:portVesselKeys()};}
// The single-segment dev layout: the named key in each of its decays, flanked
// by plain `quay` segments (offset by nbdz[0] / nbdz[1]), natural coast
// beyond, one decay per run. If `key` is a VESSEL, the run is three quays and
// the vessel is moored off the middle one in a dredged pocket.
function portLayoutSegment(key,o){o=Object.assign({gap:440,nbdz:[0,-20],nbKey:'quay'},o||{});
 const V=PORT_REG.vessel[key],S=PORT_REG.seg[key],R0=V||S;
 if(!R0){reportErr('PORT_ONLY: no segment or vessel registered as "'+key+'"');return {items:[],runs:[],stamps:[],vessels:[]};}
 const nbk=PORT_REG.seg[o.nbKey]?o.nbKey:key;
 const runs=[],stamps=[],extra=[];let x=0;
 R0.decays.forEach((d,r)=>{
  const ks=V?[nbk,nbk,nbk]:[nbk,key,nbk];
  const R=portRun(ks,d,x,[o.nbdz[0],0,o.nbdz[1]],{run:r,ctx:V?[1,1,1]:[1,0,1]});
  runs.push(Object.assign({d},R));x=R.x1+o.gap;});
 const mid=runs.length?(runs[0].x0+runs[runs.length-1].x1)/2:0;
 for(const R of runs){R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;
  if(V){const M=R.items[1],Rq=portRegOf(M.key);
   const vz=M.gz+Rq.SEA+V.beam/2+14,vx=M.gx;
   extra.push({vessel:true,key,d:R.d,gx:vx,gz:vz,heading:Math.PI/2,run:runs.indexOf(R)});
   R.vessel={x:vx,z:vz};
   stamps.push({kind:'dig',x0:vx-V.length/2-30,x1:vx+V.length/2+30,z0:vz-V.beam/2-20,z1:vz+V.beam/2+24,
                y:-Math.max(V.draft+5,10),soft:40});}}
 const items=[].concat(...runs.map(R=>R.items),extra);
 return {items,runs,stamps,vessels:V?[]:portVesselKeys(),focus:key};}

// The edge-case layout: the named segment at decay d against every kind of
// side it can meet, one run per case, separated by natural coast:
//   run 0  west neighbour set back 40, east neighbour stands out 40
//   run 1  west neighbour stands out 20, east neighbour set back 20
//   run 2  open SEA on both sides (no neighbours at all)
//   run 3  natural LAND coast on both sides
function portLayoutEdges(key,o){o=Object.assign({gap:440,d:0,nbKey:'quay'},o||{});
 if(!PORT_REG.seg[key]){reportErr('PORT_ONLY: no segment registered as "'+key+'"');return {items:[],runs:[],stamps:[],vessels:[]};}
 const nbk=PORT_REG.seg[o.nbKey]?o.nbKey:key,d=o.d,runs=[];let x=0;
 const cases=[{ks:[nbk,key,nbk],dz:[-40,0,40],ctx:[1,0,1]},{ks:[nbk,key,nbk],dz:[20,0,-20],ctx:[1,0,1]},
  {ks:[key],dz:[0],ctx:[0],endW:{kind:'sea'},endE:{kind:'sea'}},{ks:[key],dz:[0],ctx:[0]}];
 cases.forEach((c,r)=>{const R=portRun(c.ks,d,x,c.dz,{run:r,ctx:c.ctx,endW:c.endW,endE:c.endE});R.focus=R.items[c.ks.length>1?1:0];
  runs.push(Object.assign({d,case:['steps 40','steps 20','sea sides','land sides'][r]},R));x=R.x1+o.gap;});
 const mid=(runs[0].x0+runs[runs.length-1].x1)/2;
 for(const R of runs){R.x0-=mid;R.x1-=mid;for(const it of R.items)it.gx-=mid;}
 return {items:[].concat(...runs.map(R=>R.items)),runs,stamps:[],vessels:portVesselKeys(),focus:key};}
function portViewsEdges(){const V={},D=PORT.DECK,runs=PORT_LAYOUT.runs||[];if(!runs.length)return {Empty:[0,300,600,0,0,0]};
 V['Overview']=portCam(0,0,100,.15,.45,(runs[runs.length-1].x1-runs[0].x0)*.6+300);
 for(const R of runs){const F=R.focus,G=portRegOf(F.key);
  V[R.case]=portCam(F.gx,D,F.gz+(G.SEA-G.LAND)/2,.35,.5,Math.max(300,(G.SEA+G.LAND)*1.2));
  V[R.case+' W']=portCam(F.gx-G.W/2,D,F.gz+4,-.8,.3,160);V[R.case+' E']=portCam(F.gx+G.W/2,D,F.gz+4,.8,.3,160);}
 return V;}

// ---------------------------------------------------------------- vessels
// The hook a slip or berth segment uses to show a vessel. `opt.vessels` is the
// sorted list of registered vessel keys the layout offers (empty until a
// vessel fragment exists); a segment picks one with portVesselFor(opt, i) and
// builds it with portPlaceVessel. Vessel frame: origin at MIDSHIP ON THE
// WATERLINE (y=0 is sea level), bow toward +z at heading 0, hull down to
// -draft. The vessel is charged to its own budget ('key/d'), not the segment's,
// and the PRNG is saved and restored round it, so the segment's own stream
// does not move when a vessel is edited.
function portVesselFor(opt,i){const v=opt&&opt.vessels;if(!v||!v.length)return null;
 return v[((opt.slot||0)+(opt.run||0)+(i||0))%v.length];}
function portPlaceVessel(G,key,x,z,heading,d,o){const V=PORT_REG.vessel[key];if(!V)return null;
 const ds=V.decays.indexOf(d)>=0?d:V.decays[0];
 pbFlush();                      // the host's batch so far is charged to the host, not the vessel
 const s0=_seed,k0=KOFF,t0=TSTAT.cur,h0=HOLES;
 const wx=KOFF[0]+x,wz=KOFF[2]+z;
 TSTAT.cur=portStatKey(key,ds);HOLES=ds>=3?.55:1;KOFF=[0,0,0];let VG=null;const r0=REG.length;
 try{VG=V.build(scene,wx,wz,ds,Object.assign({heading:heading||0,d:ds,key,host:TSTAT.cur},o||{}));}
 catch(e){reportErr('vessel '+key+' d='+ds+' '+e.stack);}
 try{pbFlush();}catch(e){reportErr('vessel flush '+e.stack);}
 if(ds>=3&&VG&&!V.norepair){KOFF=[wx,0,wz];try{portRepair(VG,ds);}catch(e){reportErr(key+' repair '+e.stack);}}
 for(let i=r0;i<REG.length;i++)REG[i].type=key;
 KOFF=k0;TSTAT.cur=t0;HOLES=h0;_seed=s0;
 return VG;}

// ---------------------------------------------------------------- stats keys
// One TSTAT key per PLACED INSTANCE: 'quay/0', and 'quay/0#2' for a second
// quay at the same decay (the segment target flanks with quays). The probe
// reads the class from the part before '/'.
const PORT_STATN={};
function portStatKey(key,d){const k=key+'/'+d;PORT_STATN[k]=(PORT_STATN[k]||0)+1;
 return PORT_STATN[k]>1?k+'#'+PORT_STATN[k]:k;}

// ---------------------------------------------------------------- geometry batching
// Draw calls are per mesh. The port helpers therefore do not call mesh() for
// every wall and slab: they hand geometry to pbAdd(), and the scene merges the
// batch into ONE mesh per (parent, material) right after each builder returns
// (pbFlush). Builders may use it too. Geometry must already be in the
// parent's local frame (bake offsets with .translate / .rotateY). Opaque
// materials only - transparent ones are depth-sorted per mesh.
// `noRepair` keeps the result out of the d=3 salvage pass (walls below water).
const PB=new Map();
function pbAdd(geo,mat,parent,noRepair){if(!geo||!parent)return;
 const k=parent.uuid+'|'+mat.uuid+'|'+(noRepair?1:0);let b=PB.get(k);
 if(!b){b={parent,mat,noRepair:!!noRepair,geos:[]};PB.set(k,b);}b.geos.push(geo);}
function pbFlush(){for(const b of PB.values()){const m=meshMerged(b.geos,b.mat,b.parent);if(m&&b.noRepair)m.userData.noRepair=true;}PB.clear();}

// A BoxGeometry whose UVs are in world units / `tile` metres per texture
// repeat, so the kit's 8 m textures keep their scale on a 220 m wall instead
// of stretching one tile over it.
function boxUV(w,h,dp,tile){tile=tile||8;const g=new THREE.BoxGeometry(w,h,dp);const uv=g.attributes.uv;
 // face order in r128: +x, -x, +y, -y, +z, -z; 4 vertices each
 const S=[[dp,h],[dp,h],[w,dp],[w,dp],[w,h],[w,h]];
 for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;uv.setXY(i,uv.getX(i)*S[f][0]/tile,uv.getY(i)*S[f][1]/tile);}
 return g;}
// Rotate about y by `yaw`, then translate. In place; returns the geometry.
function pgeo(g,x,y,z,yaw){if(yaw)g.rotateY(yaw);g.translate(x||0,y||0,z||0);return g;}
// A world-UV box from its centre, sizes and yaw, straight into the batch.
function pbBox(parent,mat,x,y,z,w,h,dp,yaw,tile,noRepair){pbAdd(pgeo(boxUV(w,h,dp,tile),x,y,z,yaw),mat,parent,noRepair);}
// Yaw that turns local +x onto the direction (tx,tz).
const portYaw=(tx,tz)=>Math.atan2(-tz,tx);
// Merge geometries into one BufferGeometry (for compound kit items).
function pkMergeGeo(geos){let nv=0,ni=0;
 for(const g of geos){nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;}
 const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2),I=new Uint32Array(ni);let vo=0,io=0;
 for(const g of geos){const A=g.attributes,c=A.position.count;P.set(A.position.array,vo*3);
  if(A.normal)N.set(A.normal.array,vo*3);if(A.uv)U.set(A.uv.array,vo*2);
  if(g.index){const ix=g.index.array;for(let i=0;i<ix.length;i++)I[io+i]=ix[i]+vo;io+=ix.length;}
  else{for(let i=0;i<c;i++)I[io+i]=vo+i;io+=c;}vo+=c;}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));
 G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));
 G.setIndex(new THREE.BufferAttribute(I,1));return G;}

// Ground height at a point given in the CURRENT BUILDER'S LOCAL frame (KOFF is
// added for you). terrainH itself takes world coordinates.
function portH(lx,lz){return terrainH(lx+KOFF[0],lz+KOFF[2]);}
// A deterministic hash in [0,1) for stamps(), which must NOT call rng():
// stamps run before any builder reseeds.
const portHash=(a,b,c)=>h3(a*.137+11.3,b*.071+2.9,(c||0)*.193+5.1);

// Scene-state hooks: setNight() in 92-camera.js calls every function here
// with (on). The water registers one; a segment may register its own.
const PORT_NIGHT=[];

// The d=3 salvage pass, port edition: repairPass() on the group, with every
// child marked userData.noRepair taken out first (quay walls down to the
// seabed, pier columns, anything under water) so patches and shanties are
// not stuck to them. The scene calls this; builders need not.
function portRepair(G,d){const off=[];
 G.traverse(o=>{if(o!==G&&o.userData&&o.userData.noRepair)off.push(o);});
 const par=off.map(o=>o.parent);off.forEach(o=>o.parent.remove(o));
 try{repairPass(G,d);}finally{off.forEach((o,i)=>par[i].add(o));}}

// View helper for the targets' VIEWS tables: look at (tx,ty,tz) from bearing
// `az` (radians; 0 = from the sea, +z; PI/2 = from the east, +x), elevation
// `el` (radians) at distance `r`. Returns [cx,cy,cz,tx,ty,tz].
function portCam(tx,ty,tz,az,el,r,night){const c=Math.cos(el);
 const v=[tx+r*c*Math.sin(az),ty+r*Math.sin(el),tz+r*c*Math.cos(az),tx,ty,tz];if(night)v.push(1);return v;}
const PORT_DNAME={0:'Intact',1:'Ruined',3:'Reclaimed'};
const portDName=d=>PORT_DNAME[d]||('Decay '+d);
// The generic preset tables. Called from a target's 91z-views.js, after the
// scene has run, so they read the layout that was actually built.
function portViewsShowcase(){const V={},L=PORT_LAYOUT,D=PORT.DECK,runs=L.runs||[];if(!runs.length)return {Empty:[0,300,600,0,0,0]};
 const X0=runs[0].x0,X1=runs[runs.length-1].x1,span=X1-X0;
 V['Overview']=portCam((X0+X1)/2,0,90,.18,.42,span*.62+300);
 for(const R of runs){const nm=portDName(R.d),mid=(R.x0+R.x1)/2,w=R.x1-R.x0;
  let z0=1e9,z1=-1e9;for(const it of R.items){const G=portRegOf(it.key);z0=Math.min(z0,it.gz-G.LAND);z1=Math.max(z1,it.gz+G.SEA);}
  V[nm+' run']=portCam(mid,D,(z0+z1)/2,.3,.5,Math.max(w,(z1-z0)*1.5)*.78+180);}
 for(const R of runs){const nm=portDName(R.d);
  for(let j=1;j<R.items.length;j++){const A=R.items[j-1],B=R.items[j],x=(A.gx+B.gx)/2;
   V[nm+' junction '+j]=portCam(x,D,Math.max(A.gz,B.gz)+6,.55,.32,150);}
  const a=R.items[0],b=R.items[R.items.length-1],ra=portRegOf(a.key),rb=portRegOf(b.key);
  V[nm+' west end']=portCam(a.gx-ra.W/2,D,a.gz+8,-.75,.3,190);
  V[nm+' east end']=portCam(b.gx+rb.W/2,D,b.gz+8,.75,.3,190);}
 const q=L.items.find(it=>it.key==='quay'&&it.d===0)||L.items[0];
 V['Eye level on the quay']=[q.gx-70,D+1.7,q.gz-9,q.gx+40,D+2.2,q.gz-3];
 V['From the sea']=[(X0+X1)/2,16,760,(X0+X1)/2,6,0];
 V['From above']=[(X0+X1)/2,span*.75+400,150,(X0+X1)/2,0,149];
 const rl=runs[runs.length-1];V['Night over the '+portDName(rl.d).toLowerCase()+' run']=portCam((rl.x0+rl.x1)/2,D,60,.3,.3,(rl.x1-rl.x0)*.6+200,1);
 return V;}
// Segment target: each decay of the focus key; its sides; from the sea,
// above, at eye level, at night. Works for a vessel focus too.
function portViewsSegment(){const V={},L=PORT_LAYOUT,D=PORT.DECK,runs=L.runs||[];if(!runs.length)return {Empty:[0,300,600,0,0,0]};
 const X0=runs[0].x0,X1=runs[runs.length-1].x1;
 const fo=R=>{if(R.vessel){const Vr=PORT_REG.vessel[L.focus];return {x:R.vessel.x,z:R.vessel.z,y:4,w:Vr.length+60,dp:Vr.beam+60,gz:R.vessel.z,land:0,sea:0};}
  const it=R.items[1],G=portRegOf(it.key);return {x:it.gx,z:it.gz+(G.SEA-G.LAND)/2,y:D,w:G.W,dp:G.LAND+G.SEA,gz:it.gz,land:G.LAND,sea:G.SEA};};
 V['Overview']=portCam((X0+X1)/2,0,120,.2,.45,(X1-X0)*.6+300);
 for(const R of runs){const F=fo(R);V[portDName(R.d)]=portCam(F.x,F.y,F.z,.45,.42,Math.max(260,F.dp*.95+F.w*.35+80));}
 const R0=runs[0],F0=fo(R0),it0=R0.items[1];
 if(!R0.vessel){V['West side']=portCam(it0.gx-PORT.W/2,D,it0.gz+6,-.7,.34,170);
  V['East side']=portCam(it0.gx+PORT.W/2,D,it0.gz+6,.7,.34,170);
  const Rr=runs.find(r=>r.d===1);if(Rr){const it=Rr.items[1];V['Ruined sides']=portCam(it.gx,D,it.gz+20,.05,.5,300);}}
 V['From the sea']=[F0.x,14,F0.gz+F0.sea+280,F0.x,8,F0.gz];
 V['Above']=[F0.x,Math.max(500,F0.dp*1.25+200),F0.z+1,F0.x,0,F0.z];
 V['Eye level']=R0.vessel?[F0.x-40,D+1.7,F0.gz-F0.dp/2-20,F0.x,8,F0.gz]:[it0.gx-70,D+1.7,it0.gz-10,it0.gx+30,D+2.2,it0.gz-4];
 const Rn=runs[runs.length-1],Fn=fo(Rn);V['Night']=portCam(Fn.x,Fn.y,Fn.z,.4,.35,Math.max(240,Fn.dp*.8+120),1);
 return V;}
