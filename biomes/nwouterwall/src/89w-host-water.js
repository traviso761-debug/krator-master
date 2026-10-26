// ================================================================= HOST — the streams and the lakes on core/water
// The records are made in 47-host-land.js (WATER_RECS: the valley's stream a flow line, the alas lakes and the Yeti Valley's lake
// still water); drawn here once core/atmos is bound: the stream as its ribbon (cold, clear, glacial-green over the gravel), the still
// water as one mesh with one still material (the sky in it: core/atmos's skylight, a capture of the shared sky at the hour). A lake
// FROZEN in its season (the high lake: SITE.lakeIce by season) is drawn as ice on the same outline instead, and still is its record.
const WATER_DRAW=(function(){if(!WATER_RECS)return null;try{
 {const WENV={environment:null};
  ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.35,.32,.26])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 if(WATER_RECS.stream){out.stream=WATER.drawFlow(WATER_RECS.stream,{rapids:[.04,.12],shallow:lin(0x6a8a7e),deep:lin(0x2a4a46),color:0xffffff,roughness:.08,metalness:.05,
  envMapIntensity:.55,step:10,across:4,margin:1,renderOrder:2});out.stream.mesh.userData.inspectLabel=WATER_RECS.stream.name;}
 const still=(WATER_RECS.alases||[]).slice();
 const iced=WATER_RECS.lake&&SITE.lakeIce&&SITE.lakeIce[SEASON];
 if(WATER_RECS.lake&&!iced)still.push(WATER_RECS.lake);
 if(still.length){const pos=[];still.forEach(S=>{const P=S.poly,n=P.length;let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
   for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level,cz,b[0],S.level,b[1],a[0],S.level,a[1]);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.06,.10,.12),roughness:.05,metalness:.1,envMapIntensity:.6}));
  m.userData.probeSkip=true;m.userData.inspectLabel='Still water (an alas lake; the high lake)';m.renderOrder=1;m.name='water:still';scene.add(m);out.still=m;}
 if(iced){const S=WATER_RECS.lake,P=S.poly,pos=[];const n=P.length;let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
  for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level+.05,cz,b[0],S.level+.05,b[1],a[0],S.level+.05,a[1]);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const uv=[];for(let i=0;i<pos.length;i+=3)uv.push(pos[i]/40,pos[i+2]/40);
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.computeVertexNormals();
  const L=LIB['ice.lake'];const mat=new THREE.MeshStandardMaterial({color:0xe8f0f6,roughness:.18,metalness:0,map:L?L.map:null,normalMap:L?L.normalMap||null:null});
  [mat.map,mat.normalMap].forEach(t=>{if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;});
  const m=new THREE.Mesh(g,mat);m.userData.inspectLabel='The frozen lake (the ice quarry; frozen seven or eight months a year)';m.userData.host=true;m.name='ice:lake';m.renderOrder=1;scene.add(m);out.ice=m;}
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
