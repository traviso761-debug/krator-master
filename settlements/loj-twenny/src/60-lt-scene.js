// ================================================================= LOJ TWENNY: THE SCENE (the stage the station's drawing reads, the rock, the hold's ways)
// [web] The stage the Line's own drawing fragments read (biomes/line/stations/common/49-host-stage.js is the Line's page's; this page
// gives the same names: scene, camera, renderer, Q, tick, reportErr, SEC, CAVE_C), so station 3 is drawn by the Line's own code: its
// lining with the openings left (85), its way (86: the lamps, the grating, the crown fittings), its trains (87: the kept train at the
// island, the train running through on track 3), its works (88: the invert, the platforms, the footbridges and mezzanines, the doors,
// the branch's portal, the great shaft's cage, the name boards, the kept state's hut and crates). The doors the hold's streets leave
// by are marked open (`open`: 88 hangs no plate in them). The rock is the one cavern of 50-lt-cavern.js, drawn where it reaches out
// of the station's lining (the hold's rooms, the door rooms, the branch), with the rock cut (39h: H) and the fade's soft band. The
// hold's ways carry their paint bands (the districts: PLAN.md 5.4) and their lamps (records: red on the quiet deck, amber on the
// work deck, green on the Line deck); the defs' own lamps come from TG.tg.draw (64-lt-hold.js).
KTAGS.page=KTAGS.create({build:'loj-twenny'});
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';console.error(m);}
const Q=new URLSearchParams(location.search);
const LT_TICKS=[];
function tick(fn){LT_TICKS.push(fn);}
const SEC=LINE.SEC;
const scene=new THREE.Scene();scene.background=new THREE.Color(0x0e1010);scene.fog=new THREE.Fog(0x0e1010,80,320);
const camera=new THREE.PerspectiveCamera(58,innerWidth/innerHeight,.08,1800);scene.add(camera);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled=false;
const LT_HEMI=new THREE.HemisphereLight(0x7a766c,0x2a2824,.5);scene.add(LT_HEMI);
/* the doors the hold's streets leave the station by: open (88-host-station.js reads `open`) */
(function(){const H=LT.plan();for(const w of H.ways){if(w.kind!=='siding'&&w.kind!=='stair'&&w.kind!=='ramp')continue;const p=w.pts[0];
 for(const O of LINE.openings)if(O.kind==='door'&&p[2]>=O.z0-.3&&p[2]<=O.z1+.3&&Math.abs(p[1]-O.y0)<.3&&(O.wall==='e'?p[0]>0:p[0]<0))O.open=true;}})();
/* the walk: the Line's (the galleries, the platforms, the stairs, the bridges, the mezzanines, the door rooms, the branch), then the
   hold's rooms (50-lt-cavern.js writes them as it carves) */
LINE.walk(KWALK);
const CAVE_C=LTC.build(KWALK);
const LT_ROCK=new THREE.MeshStandardMaterial({color:0xb8ab98,vertexColors:true,roughness:.95,metalness:0});LT_ROCK.name='lt rock';
KFADE.add(LT_ROCK,{occluder:false});KCAVERN.cutLayer(LT_ROCK);
const LT_DRAW=(function(){const all=CAVE_C.chunks;CAVE_C.chunks=LTC.chunksOut(CAVE_C);
 try{return KCAVERN.drawRock(CAVE_C,{THREE,material:LT_ROCK,tile:48,ground:'drop',label:'The rift fill (station 3\'s rock and the hold\'s, carved from the Line\'s window and the plan)',attrs:['aKCut'],weight:KCAVERN.cutWeight(CAVE_C)});}
 finally{LTC.chunksAll=all.length;CAVE_C.chunks=all;}})();
LT_DRAW.group.children.forEach(m=>{m.userData.probeSkip=true;});
scene.add(LT_DRAW.group);
/* ---------------------------------------------------------------- the hold's ways: paint bands and lamps */
const LT_MATS={};
function ltMat(hex,o){const k=hex+(o?JSON.stringify(o):'');if(LT_MATS[k])return LT_MATS[k];const m=new THREE.MeshStandardMaterial(Object.assign({color:hex,roughness:.85,metalness:0},o||{}));KFADE.add(m);return LT_MATS[k]=m;}
const LT_WORKS=new THREE.Group();LT_WORKS.name='the hold\'s ways';scene.add(LT_WORKS);
/* each siding's paint band along both its walls at waist height (a district's colour: cream over red, cream over green, plain red) */
(function(){const H=LT.plan(),col={'cream-red':[0x8a3e2a,0xd8cfb0],'cream-green':[0x3f5a43,0xd8cfb0],red:[0x8a3e2a,null]};
 H.ways.filter(w=>w.band&&w.kind==='siding').forEach(w=>{const C=col[w.band];if(!C)return;const a=w.pts[0],b=w.pts[w.pts.length-1],L=Math.hypot(b[0]-a[0],b[2]-a[2]),ux=(b[0]-a[0])/L,uz=(b[2]-a[2])/L;
  for(const s of [-1,1]){const ox=-uz*s*(w.w/2-.03),oz=ux*s*(w.w/2-.03),cx=(a[0]+b[0])/2+ox,cz=(a[2]+b[2])/2+oz,ry=Math.atan2(ux,uz),dk=w.deck==null?0:w.deck;
   const m=new THREE.Mesh(new THREE.BoxGeometry(.02,.95,L-1),ltMat(C[0]));m.position.set(cx,a[1]+.5,cz);m.rotation.y=ry;m.name='the paint band of '+w.id;m.userData.deck=dk;LT_WORKS.add(m);
   if(C[1]){const t=new THREE.Mesh(new THREE.BoxGeometry(.021,.12,L-1),ltMat(C[1]));t.position.set(cx,a[1]+1.04,cz);t.rotation.y=ry;t.name='the cream line of '+w.id;t.userData.deck=dk;LT_WORKS.add(t);}}});})();
/* the lamps of the hold's ways (records, lit by KCAVELIGHT: 70-lt-light.js), drawn as small housings */
const LT_LAMPS=[];
(function(){const H=LT.plan(),kindOf=d=>d===1?'lamp-red':d===-1?'lamp-amber':'lamp-green';
 for(const w of H.ways){if(w.kind!=='siding'&&w.kind!=='ramp'&&w.kind!=='stair'||w.prim==='none')continue;const a=w.pts[0],b=w.pts[w.pts.length-1],L=Math.hypot(b[0]-a[0],b[2]-a[2]);
  if(L<4)continue;const n=Math.max(1,Math.floor(L/12)),dk=w.deck!=null?w.deck:(b[1]>a[1]+1?1:b[1]<a[1]-1?-1:0);
  for(let i=0;i<n;i++){const t=(i+.5)/n,y=a[1]+(b[1]-a[1])*t;LT_LAMPS.push({id:'lt.lamp.'+w.id+'.'+i,kind:kindOf(dk),x:a[0]+(b[0]-a[0])*t,y:y+Math.min(2.2,w.h-.35),z:a[2]+(b[2]-a[2])*t,owner:w.id,deck:dk});}}
 /* the loj's way (the branch) in the Line's green, every 12 m */
 const B=H.byId['lt.way'];for(let s=8;s<KCITY.cavern.wayLen(B)-4;s+=12){const P=KCITY.cavern.wayAt(B,s);LT_LAMPS.push({id:'lt.lamp.way.'+s,kind:'lamp-green',x:P.x+P.tz*3.2,y:P.y+3.6,z:P.z-P.tx*3.2,owner:'lt.way',deck:0});}
 const hm=ltMat(0x2a2826,{metalness:.5,roughness:.5}),g=new THREE.BoxGeometry(.22,.3,.22);
 LT_LAMPS.forEach(r=>{const m=new THREE.Mesh(g,hm);m.position.set(r.x,r.y+.2,r.z);m.userData.deck=r.deck;LT_WORKS.add(m);
  const bm=new THREE.MeshBasicMaterial({color:KCAVELIGHT.KINDS[r.kind].colour});bm.toneMapped=false;const s=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),bm);s.position.set(r.x,r.y,r.z);s.userData.deck=r.deck;LT_WORKS.add(s);});})();
