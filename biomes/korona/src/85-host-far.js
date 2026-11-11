// ================================================================= HOST — the country past the map (2026-11-03, the final rebuild; oidong's lines)
// BACKPORT.md section 1's ground set: the floor's square ended at 3.5 km with the shared sky and fog past it. core/terrain's far field (KFAR) carries
// the station's own floor (STAGE.floor: the gorge floor, the basin's meadows, the trenches' salt flats, the hoar table's cloud floor far below) on to
// 9 km, sunk under the square so nothing fights the ground; a tepui past the map is not drawn (the tables are records the open world will place from
// the scale model's ring crests: KNOWN_ISSUES.md, "The tepui is one record"). KHORIZON is baked over the square with this lattice past it: the walls'
// shadow on the floor and, after the bake (89z), on what stands on it. Host-only. ?far=0 none of it, ?hz=0 no horizon.
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const S0=STAGE.R*1.1,ROUT=9000,SINK=14,CL=STAGE.climate||{};
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 /* the far colour by the climate: the rainforest's dark green (wet), the rain shadow's red soil and scrub (dry), the cloud sea's white (the hoar
    table's floor stands in cloud), each fading to the haze by the distance */
 const C=CL.frozen?{a:L([214,220,228]),b:L([196,204,214])}:CL.dry?{a:L([150,104,72]),b:L([118,110,72])}:{a:L([46,66,38]),b:L([70,88,46])},HZ=L([150,162,172]);
 const colr=(x,z,y,q)=>{const n=clamp(KRAND.fbm(x*.003,.5,z*.003,2,2417)*.8+KRAND.fbm(x*.013,.5,z*.013,2,2418)*.4-.1,0,1);
  return mixC(mixC(C.a,C.b,n),HZ,.55*smooth(3500,9000,q.r));};
 /* capped at the square's rim: a station's floor function was written for its square and climbs past it (station 1's rose over the view 'From afar'
    at 2.5 km); past the square the far floor stays under the highest ground on its edge */
 let RIM=-1e9;for(let k=0;k<256;k++){const t=k/256*4,u=(t%1)*2-1,e=S0*.98,x=t<1?u*e:t<2?e:t<3?-u*e:-e,z=t<1?-e:t<2?u*e:t<3?e:-u*e;RIM=Math.max(RIM,groundH(x,z));}
 const farH=(x,z)=>Math.min(STAGE.floor(x,z),RIM);
 const G=KFAR.grid({lines:KFAR.lines({cell:50,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the floor's square */
  color:colr});
 const geo=KFAR.geometry(G),mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'korona-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=STAGE.name+' (the country past the map)';scene.add(mesh);
 return{mesh,mat,G,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (45-core-horizon.js): eight directions over the floor's square (256 a side, ~14 m) and the far field past it, the tables'
// tops in it (terrainH reads them). The floor takes it here, the flora and the rock after the bake (89z).
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=STAGE.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-9000,-9000,9000,9000],n:160}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
