// ================================================================= HOST — the Wall past the map, the far lungs, the terrain's horizon
// core/terrain's far field (KFAR) carries the stage's own land past the ground's square to 9 km: the plateau rolling south and the Wall running on
// east and west (the scarp's rim line is 19 km long), its face falling into the cloud sea. On it the far lungs are KFAR.streaks (44b, PLAN.md
// section 14 item 7): dark lines down the face, placed by KRAND along the rim, their width and darkness on one value the breath sets (89zy:
// wet and dark at the breath, paler when it is slack). KHORIZON is baked over the square and the far lattice: the scarp's shadow on the ground.
// Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const ROUT=9000,SINK=14;
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const MOSS=L([98,124,52]),GOLD=L([176,152,92]),OLIVE=L([128,128,74]),ROCK=L([132,120,108]),HZ=L([200,210,214]);
 const colr=(x,z,y,q)=>{const n=clamp(KRAND.fbm(x*.003,.5,z*.003,2,4717)*.8+KRAND.fbm(x*.013,.5,z*.013,2,4718)*.4-.1,0,1);
  const fog=smooth(FOG_BAND[0],FOG_BAND[1],q.h-CLOUD_Y),at=KRELIEF.at(SCARP,x,z),rock=at&&(at.part==='face'||at.part==='ravine'||at.part==='buttress')?.55:0;
  let c=mixC(GOLD,OLIVE,n);c=mixC(c,MOSS,fog);c=mixC(c,ROCK,rock*(1-fog*.6));
  return mixC(c,HZ,.55*smooth(3500,9000,q.r));};
 const G=KFAR.grid({lines:KFAR.lines({cell:50,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>Math.abs(x)<S0&&Math.abs(z)<S0?terrainH(x,z)-SINK:landH(x,z),
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'clifflung-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel='The southern Inner Wall (past the map)';scene.add(mesh);
 /* THE FAR LUNGS: one in about 700 m of rim past the square, from the lip down two thirds of the face */
 let lines=null;
 if(KFAR.streaks&&KFAR.streakMesh){const Ls=[];for(let k=0;k<26;k++){const u=c=>KRAND.unit(KRAND.hash(0x1A6,k,c,0xFA1)),side=k%2?1:-1,x=side*(S0+300+u(1)*5600),z=rimZ(x);
   const d=SCARP.run*(.55+.3*u(2)),xb=x+(u(3)-.5)*120,zb=z-d;Ls.push({a:[x,landH(x,z+8)+4,z+8],b:[xb,landH(xb,zb)+4,zb],w:16+18*u(4),alpha:.55+.25*u(5),lag:.1*u(6),tint:[.1,.09,.085],wobble:4});}
  const Sx=KFAR.streaks({world:0x1A6,lines:Ls,range:[2400,16000]});lines={set:Sx,k:{value:.5}};
  const LM=KFAR.streakMesh(Sx,{k:lines.k,name:'far lungs',label:'Cliff lungs on the far Wall (KFAR.streaks)'});LM.userData.probeSkip=true;scene.add(LM);lines.mesh=LM;}
 return{mesh,mat,G,tris:G.count.tris,lines};})();
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-9000,-9000,9000,9000],n:160}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
