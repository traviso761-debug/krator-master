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
  const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.03,.08,.16),roughness:.05,metalness:.1,envMapIntensity:.6}));
  m.userData.probeSkip=true;m.userData.inspectLabel=S.name;m.renderOrder=1;m.name='water:still';scene.add(m);out.still=m;}
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
