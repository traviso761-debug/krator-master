// ================================================================= HOST — the brook and the still water on core/water
// The records are made in 47-host-land.js (WATER_RECS: the spring brook a flow line; the model's water a still, station 2's sag ponds);
// drawn here once core/atmos is bound: the brook as its ribbon (spring water, clear over the gully's gravel and silt), the still water as
// one mesh with one still material (the sky in it: core/atmos's skylight, a capture of the shared sky at the hour). Forked from
// biomes/nwouterwall's (its alas lakes and its frozen lake left out).
const WATER_DRAW=(function(){if(!WATER_RECS)return null;try{
 {const WENV={environment:null};
  ATMOS.skylight({renderer,sky:SKY.scene,scene:WENV,ground:()=>new THREE.Color(...(SKY.look?SKY.look.hemiG:[.38,.34,.27])).convertSRGBToLinear(),
   key:()=>[SKY_CLOCK.day,Math.round(SKY_CLOCK.hour*4),SKY.look&&SKY.look.cover.toFixed(2)].join()});}
 const lin=h=>new THREE.Color(h).convertSRGBToLinear(),out={};
 if(WATER_RECS.stream){out.stream=WATER.drawFlow(WATER_RECS.stream,{rapids:[.04,.12],shallow:lin(0x6a7a68),deep:lin(0x2a3e38),color:0xffffff,roughness:.2,metalness:.02,
  envMapIntensity:.25,step:8,across:4,margin:1,renderOrder:2});out.stream.mesh.userData.inspectLabel=WATER_RECS.stream.name;}
 if(WATER_RECS.lake){const S=WATER_RECS.lake,P=S.poly,pos=[],st=SITE.lake.cell==null?100:SITE.lake.cell,L=MODEL_LAKE_AT;
  /* the model's water cells and their ring (45: MODEL_LAKE_AT), as quads of `st` m inside the record's box: the shore is where the fitted
     ground rises through the level; past the ring the ground is the model's again and may lie under the level, so nothing is drawn there */
  for(let z=P[0][1];z<P[2][1];z+=st)for(let x=P[0][0];x<P[1][0];x+=st){const x1=Math.min(x+st,P[1][0]),z1=Math.min(z+st,P[2][1]);
   if(L.dist((x+x1)/2,(z+z1)/2)>L.drawR+st*.71)continue;const y=S.level;pos.push(x,y,z,x,y,z1,x1,y,z,x1,y,z,x,y,z1,x1,y,z1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.07,.10,.11),roughness:.05,metalness:.1,envMapIntensity:.6}));
  m.userData.probeSkip=true;m.userData.inspectLabel=S.name;m.renderOrder=1;m.name='water:still';scene.add(m);out.still=m;}
 // the site's falls (47: siteFalls; station 4's spring-fed fall down the head wall): a thin white curtain on the face, its pool's churn
 if(WATER_RECS.falls&&WATER_RECS.falls.length){out.falls=WATER_RECS.falls.map(S=>{const D=WATER.drawFall(S,{color:lin(0xe8eeec),opacity:.9,rowStep:2,cols:8,spray:'drop',plungeR:7,footK:.8,
   envMapIntensity:.25,renderOrder:3});if(D&&D.mesh){D.mesh.userData.inspectLabel=S.name;D.mesh.name='water:fall';}return D;});}
 // the site's pools (47: POOLS; station 2's sag ponds): each its polygon fanned from its middle, one mesh, the still material
 if(WATER_RECS.pools&&WATER_RECS.pools.length){const pos=[];WATER_RECS.pools.forEach(S=>{const P=S.poly,n=P.length;let cx=0,cz=0;P.forEach(q=>{cx+=q[0];cz+=q[1];});cx/=n;cz/=n;
   for(let k=0;k<n;k++){const a=P[k],b=P[(k+1)%n];pos.push(cx,S.level,cz,b[0],S.level,b[1],a[0],S.level,a[1]);}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const m=new THREE.Mesh(g,WATER.stillMaterial({color:new THREE.Color(.08,.11,.12),roughness:.06,metalness:.1,envMapIntensity:.6}));
  m.userData.probeSkip=true;m.userData.inspectLabel='Sag ponds (water standing on the slumped blocks\' backs)';m.renderOrder=1;m.name='water:pools';scene.add(m);out.pools=m;}
 return out;}catch(e){reportErr('water: '+(e&&e.stack||e));return null;}})();
_mark('water');
