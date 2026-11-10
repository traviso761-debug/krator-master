// ================================================================= HOST — the meltwater brook on core/water
// The records are made in 47-host-land.js (WATER_RECS: the meltwater brook a flow line; the tarns' stills are stations 2-6); drawn here
// once core/atmos is bound: the brook as its ribbon (snowmelt, clear and cold over the gully's cobble), the sky in it (core/atmos's
// skylight, a capture of the shared sky at the hour). Forked from biomes/wouterwall's.
const WATER_DRAW=(function(){if(!WATER_RECS)return null;try{
 {const WENV={environment:null};
  ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.38,.34,.27])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 if(WATER_RECS.stream){out.stream=WATER.drawFlow(WATER_RECS.stream,{rapids:[.05,.14],shallow:lin(0x74828a),deep:lin(0x2a3a44),color:0xffffff,roughness:.2,metalness:.02,
  envMapIntensity:.25,step:8,across:4,margin:1,renderOrder:2});out.stream.mesh.userData.inspectLabel=WATER_RECS.stream.name;}
 if(WATER_RECS.lake){const S=WATER_RECS.lake,P=S.poly,n=P.length,pos=[];let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
  for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level,cz,b[0],S.level,b[1],a[0],S.level,a[1]);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.07,.10,.11),roughness:.05,metalness:.1,envMapIntensity:.6}));
  m.userData.probeSkip=true;m.userData.inspectLabel=S.name;m.renderOrder=1;m.name='water:still';scene.add(m);out.still=m;}
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
