// ================================================================= HOST — the brook, its falls and the tarn on core/water
// The records are made in 47-host-land.js (WATER_RECS: the brook a flow line; a station's tarn a still, the model's water); drawn here
// once core/atmos is bound: the brook as its ribbon (snowmelt, clear and cold over the cobble), its FALLS where its line drops faster
// than 0.5 (WATER.fallsOf: station 2's over the headwall), each a curtain arcing from the lip with its plunge and spray, the tarn as one
// still mesh (cobalt: the cirque's snowmelt over black basalt sand); the sky in them (core/atmos's skylight, a capture of the shared sky
// at the hour). Forked from biomes/wouterwall's, the falls as biomes/ehighlands draws them.
const WATER_DRAW=(function(){if(!WATER_RECS)return null;try{
 {const WENV={environment:null};
  ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.38,.34,.27])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 if(WATER_RECS.stream){out.stream=WATER.drawFlow(WATER_RECS.stream,{rapids:[.05,.14],shallow:lin(0x74828a),deep:lin(0x2a3a44),color:0xffffff,roughness:.2,metalness:.02,
  envMapIntensity:.25,step:8,across:4,margin:1,renderOrder:2});out.stream.mesh.userData.inspectLabel=WATER_RECS.stream.name;
  out.falls=WATER.fallsOf?WATER.fallsOf(WATER_RECS.stream,{steep:.5,minDrop:20,fit:true}).map(o=>WATER.fall(Object.assign(o,{name:SITE.fallName||'A fall',face:terrainH,faceLift:.6}))).map(F=>{
   const D=WATER.drawFall(F,{color:lin(0xd0dade),opacity:.9,rows:30,cols:6,margin:1.2,lipK:.85,spray:'drop',envMapIntensity:.25,renderOrder:3});
   if(D&&D.mesh){D.mesh.userData.inspectLabel=F.name+' ('+Math.round(F.drop)+' m)';
    /* the curtain arcs out past a small volume, so the probe's point is the lip's middle halfway down, on a marker of its own (core/water's meshes are probeSkip; ehighlands' finding) */
    const pm=new THREE.Object3D();pm.userData.probePoints=[(F.lip[0][0]+F.lip[1][0])/2,F.lip[0][2]-F.drop/2,(F.lip[0][1]+F.lip[1][1])/2];scene.add(pm);}
   REGISTER({name:F.name+' ('+Math.round(F.drop)+' m over the headwall)',key:'water.fall',x:(F.lip[0][0]+F.lip[1][0])/2,z:(F.lip[0][1]+F.lip[1][1])/2,y:F.lip[0][2]-F.drop-4,r:14,h:F.drop+8});
   return {F,D};}):[];}
 if(WATER_RECS.lake){const S=WATER_RECS.lake,P=S.poly,n=P.length,pos=[];let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
  for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level,cz,b[0],S.level,b[1],a[0],S.level,a[1]);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const tc=SITE.tarnColor||[.03,.08,.16],m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(tc[0],tc[1],tc[2]),roughness:.05,metalness:.1,envMapIntensity:.6}));
  m.userData.probeSkip=true;m.userData.inspectLabel=S.name;m.renderOrder=1;m.name='water:still';scene.add(m);out.still=m;}
 // THE HOT SPRINGS (station 3: core/water's spring kind, geyser/52): each a pool at its rim's level, banded from its vent out by its
 // temperature and its mineral (sinter: turquoise to amber mats; iron: rust), drawn as a disc on the dished ground (44s: siteSpring)
 if(SITE_RECS.springs&&WATER.spring){out.springs=SITE_RECS.springs.map(S=>{const R=WATER.spring({key:S.key,name:S.name,x:S.x,z:S.z,r:S.r,level:S.level,temp:S.temp,mineral:S.mineral,steam:true});
  const D=WATER.drawSpring(R,{THREE,scene});if(D&&D.mesh){D.mesh.userData.inspectLabel=S.name;D.mesh.name='water:spring-'+S.key;}
  REGISTER_LAND({name:S.name,key:'water.spring',x:S.x,z:S.z,y:S.level-S.depth-1,r:S.r,h:S.depth+3});return {R,D};});}
 // THE SINTER TERRACES (station 3: core/water's terraces, ext/53): the amber spring's overflow down its treads (44s: the plain treads, the
 // ground stepped under them), a still pool per tread and a fall per riser, the pools milky turquoise to cream at the rims
 if(SITE_RECS.terraces&&WATER.terraces){const Tq=SITE_RECS.terraces;
  const TR=WATER.terraces({name:Tq.name,line:Tq.line,treads:Tq.treads.map(t=>({s0:t.s0,s1:t.s1,y:t.y,w:Tq.width})),speed:1.2,spread:3});
  const TD=WATER.drawTerraces(TR,{pool:{color:0xffffff,roughness:.1,metalness:.05,envMapIntensity:.5,renderOrder:1,gradient:{centre:lin(0x5ab8b4).getHex(),rim:lin(0xe8e0c8).getHex(),power:1.2}},
   fall:{color:lin(0xe6eeec),opacity:.9,rowStep:2,cols:8,spray:'drop',plungeR:6,renderOrder:3}});
  if(TD.pools&&TD.pools.mesh)TD.pools.mesh.userData.inspectLabel=Tq.name;
  const mid=Tq.line[Math.floor(Tq.line.length/2)];REGISTER_LAND({name:Tq.name,key:'water.terraces',x:mid[0],z:mid[1],y:terrainH(mid[0],mid[1])-2,r:Tq.width,h:5});
  out.terraces={T:TR,D:TD};}
 // THE STEAM (core/atmos's particles): over each spring and along the fault, and a little over the tarn where the warm overflow meets it
 if(SITE.steam&&ATMOS.smoke){try{const L=SITE.steam.vents.map(p=>[p[0],terrainH(p[0],p[1])+.5,p[1],'steam']).concat((SITE.steam.lake||[]).map(p=>[p[0],(MODEL_LAKE?MODEL_LAKE.level:0)+.3,p[1],'steam']));
  out.steam=ATMOS.smoke(L,{n:18});}catch(e){reportErr('steam: '+e.stack);}}
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
