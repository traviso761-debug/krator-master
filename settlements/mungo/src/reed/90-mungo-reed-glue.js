// ================================================================= MUNGO GLUE — runs INSIDE REEDKIT_MAKE(host)
// This file is appended by mungo/build.py after the Reed Lake kit's fragments, inside the one function that
// wraps them, so it sees the kit's own names (RL, VERN, hnSub, hnRL*, kbake, KIT, REG ...) and nothing of the
// Locus-lineage page around it but `host`. Its `return` is the API Mungo's 65r-reed-village.js calls.
//
// host = { onerror, reedY, camera, register(rec), lamp(x,y,z,amp,rad) }
//   reedY   the world height of the reed kit's y = 0 (an island's top); the kit's RL.WATER (-0.45) is the lake
//
// The village is ONE reed def, `mungo_reed_village`, drawn from Mungo's layout records (30-layout.js, REED):
// the recipe is the kit's own buildRLVillage (80-rl-islands.js): bridges first (they open gaps in the reed
// beds), then the islands, their reeds and anchors, then the buildings on their islands (pad:false), the
// open-water sites on pads of their own, boats in the channels, reed clumps between the islands.
window.onerror = host.onerror;            // the kit's 10-core replaced the page's handler: give it back
var scene = null, camera = host.camera;
hRLStyle.hanging = 'stripe';             // Mungo's reed village hangs the striped awayo; Reed Lake keeps the chakana weave   // names a few kit helpers fall back to; set before anything builds
function buildMungoReedVillage(G,o){reseed(25901);
 const L=o.layout,out=o.out;
 const I=L.islands.map(S=>({x:S.x,z:S.z,rf:hnRLOutline(S.rx,S.rz,S.seed*1.37,.08),gaps:[],seed:S.seed,S}));
 for(const p of L.bridges)hnRLBridgeBetween(I[p[0]],I[p[1]],1.8);
 // the pads' own pontoons to their islands (the layout put the ends on both outlines: P.bridge)
 for(const pb of (L.padBridges||[])){const P=L.pads[pb[0]],K=I.find(k=>k.S.id===pb[1]);if(!P.bridge||!K)continue;
  const a=Math.atan2(P.z-K.z,P.x-K.x);K.gaps.push([a-.2,a+.2]);hnRLPontoon(P.bridge[0],P.bridge[1],1.6);}
 // THE PONTOON to the land: from the tavern island's edge across the shallows to the landing; posts every 9 m
 const T=I[I.length-1],P=L.pontoon,aT=Math.atan2(P.a[1]-T.z,P.a[0]-T.x);T.gaps.push([aT-.18,aT+.18]);
 hnRLPontoon(P.a,P.b,P.w);
 {const Lp=Math.hypot(P.b[0]-P.a[0],P.b[1]-P.a[1]),nx=-(P.b[1]-P.a[1])/Lp,nz=(P.b[0]-P.a[0])/Lp,n=Math.floor(Lp/9);
  for(let k=1;k<n;k++){const t=k/n,x=P.a[0]+(P.b[0]-P.a[0])*t,z=P.a[1]+(P.b[1]-P.a[1])*t;for(const s of[-1,1])hnRLPost(x+nx*s*(P.w/2+.25),RL.WATER-.6,z+nz*s*(P.w/2+.25),.07,2.2,0,{});
   if(k%3===0)hnRLReedClump(x+nx*(P.w/2+3),z+nz*(P.w/2+3),5,1.4);if(k%3===1)hnRLReedClump(x-nx*(P.w/2+3),z-nz*(P.w/2+3),5,1.4);}
  for(const s of[-1,1])hnRLPost(P.a[0]+nx*s*(P.w/2+.3),0,P.a[1]+nz*s*(P.w/2+.3),.1,3.2,0,{disc:true,pennant:true});}
 for(const k of I){hnRLIsland(G,k.x,k.z,k.rf,{seed:k.seed});hnRLReeds(k.x,k.z,k.rf,{gaps:k.gaps,spread:2.6});for(let j=0;j<5;j++)hnRLAnchor(k.x,k.z,k.rf,(j+.5)/5*TAU+.7);}
 // the buildings on their islands (no pads of their own); a def the kit does not have yet falls back, and says so
 for(const k of I)for(const b of k.S.buildings){let key=b.key;if(!VERN.defs[key]){key=b.fallback||'rl_large_a';out.missing.push(b.key+' -> '+key);}
  const r0=REG.length;hnSub(key,b.x,0,b.z,b.ry,{pad:false,v:b.v||0});out.push({b,key,r0,r1:REG.length});}
 // on the open water, on pads of their own
 for(const p of L.pads){const r0=REG.length;hnSub(p.key,p.x,0,p.z,p.ry,{v:p.v||0});out.push({b:p,key:p.key,r0,r1:REG.length});}
 // boats tied up in the channels (the life layer's own fishing boats are separate, and move)
 for(const B of L.boats)hnRLBoat(G,B.x,B.z,B.ry,B.L,B.W,{heads:B.heads,folk:0,cabin:!!B.cabin});
 for(const c of L.clumps)hnRLReedClump(c[0],c[1],7,3);
 // THE MARSH AT THE MOUTH: the layout's reed beds ([x, y (world), z, stems, dry]), the kit's living reed; green in the
 // wet, a share of straw-dry stems on the higher ground. y is world height: the kit's y = 0 stands host.reedY above it.
 for(const r of (L.reedBeds||[])){const x=r[0],y=r[1]-host.reedY,z=r[2],n=r[3],dry=r[4];
  for(let k=0;k<n;k++){const s=rr(.8,1.35);kput('hRLReed',[x+rr(-1.5,1.5),y,z+rr(-1.5,1.5)],qEuler(0,rng()*TAU,0),[s*1.3,rr(1.9,3.4)*(dry?.85:1),s*1.3],
   hC(vPick(dry&&rng()<.55?RPAL.straw:RPAL.reedGreen)));}}
 for(let k=0;k<12;k++)hnRLBeast(rr(-330,-190),RL.WATER+.05,rr(-150,150),rr(0,6),'duck');}
RL.def({key:'mungo_reed_village',name:'The reed village of Mungo',family:'Floating village',tags:{type:['multi-family dwelling','civic','farm','tavern/inn'],wealth:'poor',lit:false,landmark:true},w:320,d:300,h:14,build:buildMungoReedVillage});

const REED_FIRE_ITEMS=['hRLFlame','ember','emberB','fireWin'];
return {
 // build the village at the world origin (the def's local frame IS Mungo's x,z); returns what was placed
 build(layout){const root=new THREE.Group();root.name='Reed village (Reed Lake kit)';root.position.y=host.reedY;scene=root;
  const out=[];out.missing=[];VERN.place(root,'mungo_reed_village',0,0,0,{layout,out});kbake(root);root.updateMatrixWorld(true);
  // the kit's registry -> the page's inspector, with the project's tags
  for(const r of REG){const t=r.tags||{};host.register({name:r.name,kind:'asset',x:r.x,y:host.reedY+(r.y||0),z:r.z,r:r.r,h:r.h,
   label:(r.cls==='furniture'?'furniture':'building')+' · culture: '+(t.culture||'reed-lake')+' · type: '+((t.type||[]).join(' + ')||'?')+(t.wealth?' · '+t.wealth:'')+' · kit: reedlake · key '+(r.key||'?')});}
  // every fire the kit drew lights the night: one lamp per cluster of flames (a 4 m grid)
  const seen={};let lamps=0;for(const nm of REED_FIRE_ITEMS){const it=KIT.items[nm]||[];for(const o of it){const k=Math.round(o.p[0]/4)+','+Math.round(o.p[2]/4);if(seen[k])continue;seen[k]=1;
   host.lamp(o.p[0],host.reedY+o.p[1],o.p[2],nm==='fireWin'?.8:1.0,nm==='hRLFlame'?9:12);lamps++;}}
  return {root,placed:out,missing:out.missing,reg:REG.length,instances:window._instances,lamps,meshes:Object.keys(KIT.meshes).length};},
 // night: the kit's firelight items show (its own setNight did the same in 92-camera.js)
 setNight(on){for(const nm of FIREKIT){const m=KIT.meshes[nm];if(m)m.visible=!!on;}},
 defs(){return Object.keys(VERN.defs);},
 has(key){return !!VERN.defs[key];},
 foot(key){const D=VERN.defs[key];return D?{w:D.w,d:D.d,h:D.h,name:D.name,tags:D.tags,landing:D.landing||0}:null;},
 REG, KIT, RL};
