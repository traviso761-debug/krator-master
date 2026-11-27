// ================================================================= HOST — THE BRAZIER's own structures and life (station 2)
// stationBuild() (88-host-build.js calls it before the kit's pass and the one bake):
//   THE SHRINE      the Shrine of the Split Horn (PLAN.md sections 3.2, 4.1): a basalt plinth and stele on the fissure's upper side, a great
//                   ibex horn on it split lengthwise, its halves leaning apart (the Brotherhood of the Two Horns), a bronze bowl for the
//                   second coin, the guides' tally cut in the stele; a core/tags record (culture xanadui) before it is drawn
//   THE POCKET-HEARTHS  the Hearths' own (biomes/hearths, read in place: station.json "kin"), HEARTH.layout on the oasis's KTHERM bake with the
//                   cold dress (stalks 1.2-3.2 m: PLAN.md section 5.1's dwarf form), on 25-60 C, none in a pool, on the sinter or by the shrine;
//                   their fans open flat at night (HEARTH.work on the host's sun, a tick), fold to silver spindles by day
//   THE CONES       the geysers' sinter cones (89c-host-oasis.js: oasisItems)
// STATION_TEMP: the oasis's air (PLAN.md section 6: +14 C in the oasis, -7 C on the col), within a dozen metres of the warm ground.
const STN_BUILT={};
function STATION_TEMP(x,y,z){return oasisTemp(x,y,z);}   /* 89c-host-oasis.js */
function stationBuild(){const t0=performance.now(),out={};
 // ---- the shrine: its record, then its mesh (one merged geometry by material: basalt, horn, bronze)
 const S=SHRINE,y=S.y,cs=Math.cos(S.face),sn=Math.sin(S.face);
 REGISTER({name:S.name,x:S.x,z:S.z,y:y-.3,r:4.2,h:6.5,kind:'structure',tags:{culture:'xanadui',route:'B',use:['shrine','toll (the guide\'s second coin)']}});
 {const parts={stone:[],horn:[],bronze:[]},put=(k,g,px,py,pz,ry)=>{g.rotateY(ry||0);g.translate(px,py,pz);parts[k].push(g.index?g.toNonIndexed():g);};
  put('stone',new THREE.BoxGeometry(5.2,.5,4.2),0,.25,0);put('stone',new THREE.BoxGeometry(4.2,.45,3.4),0,.72,0);
  put('stone',new THREE.BoxGeometry(1.1,2.8,.45),0,2.35,-1.2);   /* the stele: the tally's marks are its notches (below) */
  for(let k=0;k<9;k++)put('stone',new THREE.BoxGeometry(.06,.18,.06),-.36+k*.09,1.6+.22*(k%3),-.96);
  /* the split horn: an ibex's spiralled horn, cut lengthwise; each half a tube along a widening helix, leaning out from the middle */
  [-1,1].forEach(sd=>{const pts=[];for(let i=0;i<=20;i++){const t=i/20,a=t*Math.PI*1.25;pts.push(new THREE.Vector3(sd*(.15+.55*t+.18*Math.sin(a)),1.0+t*2.2,.25*Math.cos(a)-.2));}
   put('horn',new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),24,.16,7,false),0,0,0,0);});
  put('bronze',new THREE.CylinderGeometry(.42,.28,.22,12),0,1.06,.7);
  const mats={stone:new THREE.MeshStandardMaterial({color:0x2e2c2d,roughness:.85,metalness:.08}),horn:new THREE.MeshStandardMaterial({color:0xd9ccb0,roughness:.55}),
   bronze:new THREE.MeshStandardMaterial({color:0x8a5a2a,roughness:.4,metalness:.75})};
  for(const k in parts){const pos=[];parts[k].forEach(g=>pos.push(...g.attributes.position.array));const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
   const m=new THREE.Mesh(g,mats[k]);m.position.set(S.x,y-.05,S.z);m.rotation.y=-S.face+Math.PI/2;m.userData.host=true;m.userData.inspectLabel=S.name;scene.add(m);}
  out.shrine=true;}
 // ---- the geysers' cones
 out.cones=(oasisItems()||{}).cones||0;
 // ---- the pocket-hearths (the Hearths read in place)
 if(typeof HEARTH!=='undefined'&&HEARTH.layout){const q=+(new URLSearchParams(location.search).get('q')||1);
  const mask=(x,z)=>{if(OASIS.wet(x,z)||nearShrine(x,z)||MODEL.pathAt(x,z)>.2)return 0;const c=OASIS.classAt(x,z,{});if(c.sinter>.35||c.mud>.2||c.mat>.5)return 0;return BIO.mask(x,z);};
  HEARTH.parts('cold');BIO.cur='hearths/field';
  try{const F=HEARTH.layout({therm:OASIS.bakeTherm(),at:[0,30],R:470,dress:'cold',seed:KRAND.hash(WORLD,1016,1479),toward:{az:0,alt:45},ground:terrainH,mask,q:q*.3});   /* q .3: the dwarf hearths stand apart in the oasis's wind (and the fans' triangles stay in the budget) */
   STN_BUILT.hearths=F;out.hearths=F.counts;}catch(e){reportErr('hearths: '+e.stack);}
  BIO.cur=null;
  /* the engine: the fans open flat by night, fold by day (HEARTH.work on the host's sun) */
  tick(()=>{const d=new THREE.Vector3().subVectors(sun.position,sun.target.position).normalize(),alt=Math.asin(clamp(d.y,-1,1))*180/Math.PI,W=ATMOS.W||null;
   BIO.breathState('hearths').value=HEARTH.work(0,{sunAlt:sun.intensity<.02?-20:alt,W:W?{cloud:W.cloud==null?0:W.cloud}:null,atm:.89});});}
 REGISTER({name:'The Brazier, Al-Mijmarah (Oasis 3 of Route B: warm ground 800 x 500 m on the frozen col)',x:0,z:30,y:SITE_Y-8,r:480,h:24,kind:'feature',tags:{route:'B',oasis:3}});
 out.ms=Math.round(performance.now()-t0);window._station=out;return out;}
// THE FISSURE VENTS (PLAN.md section 3's map: NW (1007, 1472) and SE (1024, 1485), ~20 km either side): steaming on the far country, records
// first (far: the probe's occupancy skips them), their plumes in 89b's one smoke call with the oasis's steam
const FISSURE_VENTS=[[1007,1472,'Fissure Vent NW (a spatter cone on the inter-Twin fissure)'],[1024,1485,'Fissure Vent SE (on the inter-Twin fissure)']].map(v=>{const p=pxXZ(v[0],v[1]);
 const y=FAR.at(p[0],p[1]);const r={name:v[2],x:p[0],z:p[1],y:(y===y?y:SITE_Y)-300,r:2500,h:1500,kind:'feature',far:true,tags:{volcano:'fissure'}};REGISTER(r);return r;});
function STATION_SMOKE(){return oasisSmoke().concat(FISSURE_VENTS.map(v=>[v.x,v.y+330,v.z,'twinsteam']));}
