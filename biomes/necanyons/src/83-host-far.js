// ================================================================= HOST — the far canyon country (2026-10-27, the final rebuild)
// BACKPORT.md section 1's ground set: the floor's square ends at 1.76 km, and 'From afar', the towers and the High Cap's views
// looked out to an edge with nothing past it but fog. Here core/terrain's far field (KFAR) carries the land on to 14 km: the
// jungle's canopy roof over the canyon floors (rising over 900 m past the square, thinner and paler to the north toward Korona),
// and more of the same red sandstone standing out of it, mesas and buttes of 150-450 m with flat bare tops, drawn as lattice
// plateaus coloured as the near rock reads from afar (red walls, buff tops). The terrain's horizon (KHORIZON) is baked over the
// square, with this lattice past it, and shades the floor and the flora: the mesas' long shadows at a low sun. Host-only. ?far=0
// draws none of it, ?hz=0 no horizon; a station sets STATION_FAR before this loads ({canopy: false} for open country, {mesas: n}).
const FAR=(function(){
 if(new URLSearchParams(location.search).get('far')==='0'||typeof KFAR==='undefined')return null;
 const SF=typeof STATION_FAR!=='undefined'?STATION_FAR:{};
 const S0=TERR.R*1.1,ROUT=14000,SINK=20,SEED=8117;
 const nz=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
 // the far mesas: a ring of bodies from 2.4 to 11 km, each from KRAND.hash(SEED, i): no stream
 const NM=SF.mesas==null?34:SF.mesas,M=[];
 for(let i=0;i<NM;i++){const u=k=>KRAND.unit(KRAND.hash(SEED,i,k)),a=u(1)*TAU,d=2400+8600*Math.pow(u(2),.8);
  M.push({x:Math.cos(a)*d,z:Math.sin(a)*d,r:180+520*u(3),e:1+.8*u(4),ry:u(5)*TAU,h:(150+300*u(6))*(SF.mesaK==null?1:SF.mesaK)});}
 const mesaH=(x,z)=>{let h=0,top=0;for(const B of M){const dx=x-B.x,dz=z-B.z,c=Math.cos(B.ry),s=Math.sin(B.ry),u=(dx*c+dz*s)/B.e,v=-dx*s+dz*c;
   const q=Math.hypot(u,v)/B.r;if(q<1.25){const k=smooth(1.18,.92,q+.08*nz(x,z,.006,B.r|0,2));if(k*B.h>h){h=k*B.h;top=k;}}}return {h,top};};
 const north=z=>smooth(-1500,-9000,z);   /* toward Korona: the canopy lower and paler */
 const roof=(x,z)=>{if(SF.canopy===false)return 0;const d=Math.max(Math.abs(x),Math.abs(z))-S0;return smooth(0,900,d)*(46+12*nz(x,z,.0011,311,3)*2)*(1-.55*north(z));};
 const farH=SF.h||((x,z)=>{const m=mesaH(x,z),g=terrainH(Math.max(-S0,Math.min(S0,x)),Math.max(-S0,Math.min(S0,z)));return g+Math.max(roof(x,z),m.h);});
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 const C={floor:L([52,48,34]),dark:L([36,58,36]),mid:L([56,82,46]),dry:L([104,104,64]),wall:L([150,74,48]),top:L([176,132,98]),far:L([70,84,80])};
 const colr=SF.color||((x,z,y,q)=>{const r=smooth(0,900,Math.max(Math.abs(x),Math.abs(z))-S0),n1=nz(x,z,.0024,312,2)+.5;
  let c=mixC(C.dark,C.mid,n1);c=mixC(c,C.dry,north(z)*.7);c=mixC(C.floor,c,r);
  const m=mesaH(x,z);if(m.h>roof(x,z)+4)c=mixC(C.wall,C.top,smooth(.7,.98,m.top));
  return mixC(c,C.far,.45*smooth(4500,13000,q.r));});
 const G=KFAR.grid({lines:KFAR.lines({cell:60,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the floor's square */
  color:colr});
 const geo=KFAR.geometry(G);
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;mat.customProgramCacheKey=()=>'necanyons-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.userData.probeSkip=true;mesh.frustumCulled=false;
 mesh.userData.inspectLabel=SF.label||'The far canyon country (the jungle\'s roof and the mesas past the map)';scene.add(mesh);
 return{mesh,mat,G,H:farH,tris:G.count.tris,mesas:M};})();
// THE TERRAIN'S HORIZON (core/terrain/45-core-horizon.js, KHORIZON): eight directions over the floor's square (256 a side, ~14 m) and,
// past it, the far field. The floor takes it here; the flora and the rock after the bake (88-host-build.js), the far field does not.
// The mesas and towers throw their shadows across the canyon floor at a low sun. ?hz=0 to compare
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
