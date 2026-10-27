// ================================================================= HOST — the far country and the abyss wall (2026-10-27, the final rebuild)
// BACKPORT.md's row for this kit: STRATA ON THE ABYSS WALLS. Until now the abyssal shelf in the east was painted on the sky (a
// ridge of the shared sky, 15 degrees high); here it is ground: core/terrain's far field (KFAR) carries the basin floor on past the
// painted square to the camera's far plane, and 5.6 km east of the lake the floor meets the wall: a talus apron, then the cliff
// up to the shelf, ~1.9 km over the basin (the eastern high desert's rim: WORLD.md, sedesert across the same cliff). The wall's
// faces show the rock's beds (core/terrain KSTRATA, the `canyon` recipe: the one sedesert's side of the cliff draws), the flats
// and the steppe run on west, north and south in the painted ground's colours, and the jungle strip and the savannah on along the
// shelf foot. The terrain's horizon (KHORIZON) is baked over the square with this lattice past it, so the wall shades the basin
// when the sun is low in the east. Host-only. ?wall=0 draws none of it (the sky's painted shelf comes back, 89-host-sky.js).
const FAR=(function(){
 if(new URLSearchParams(location.search).get('wall')==='0'||typeof KFAR==='undefined'||typeof KSTRATA==='undefined')return null;
 const S0=TERR.R*1.1,ROUT=14500,SINK=20,WALLH=1900,SEED=8109;
 const nz=(x,z,f,s,o)=>KRAND.fbm(x*f,.5,z*f,o||3,s)-.5;
 // the wall's toe wanders north-south; the apron climbs a fifth of the height over 520 m, the cliff the rest over the next 640
 const toe=z=>5600+300*nz(0,z,.00035,201,3)*2+90*Math.sin(z*.0013+2.1);
 const SF=typeof STATION_FAR!=='undefined'?STATION_FAR:{},WALL=SF.wall!==false;   /* a station's own far field (stations/<name>/45: STATION_FAR) */
 function wallH(x,z){const t=x-toe(z);if(!WALL||t<=0)return 0;
  const ap=.2*smooth(0,520,t),cl=.8*smooth(430,1070,t+120*nz(x,z,.004,202,2)),top=WALLH*(1+.06*nz(x,z,.0007,203,3)*2);
  return top*(ap+cl)+(t>1070?40*nz(x,z,.002,204,3):0);}
 // the basin floor past the square: the page's own ground near the edge, eased over 600 m into a floor without its channels
 function basin(x,z){return 1.4+3*nz(x,z,.0008,205,3)+riseAt(x,z);}
 function farH(x,z){if(SF.lake)return Math.max(terrainH(x,z),lakeIn(x,z)<0?-.3:-1e9);   /* the station's lake and shores run on as its map has them; the lake a flat surface */
  const d=Math.max(Math.abs(x),Math.abs(z))-S0,k=smooth(0,600,d);return (k<1?mix(terrainH(x,z),basin(x,z),k):basin(x,z))+wallH(x,z);}
 const L=a=>a.map(v=>Math.pow(v/255,2.2)),mixC=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
 // the painted ground's palette, read from afar: the crust, the marsh's olive, the jungle's canopy (its trees end at the square),
 // the savannah's straw, the talus and the shelf's high desert; bluer and paler with distance
 const C={lake:[WATER_DEEP.r,WATER_DEEP.g,WATER_DEEP.b].map(v=>Math.pow(v,2.2)*1.6),flat:L([214,208,194]),marsh:L([70,84,52]),jung:L([52,68,40]),sav:L([138,122,76]),talus:L([150,132,108]),shelf:L([176,152,116]),far:L([150,160,160])};
 const G=KFAR.grid({lines:KFAR.lines({cell:80,inner:S0+20,out:ROUT,grow:1.03}),dense:true,
  h:(x,z)=>{if(Math.abs(x)<S0&&Math.abs(z)<S0)return terrainH(x,z)-SINK;return farH(x,z);},
  skip:(x0,z0,x1,z1)=>x0>-S0+100&&x1<S0-100&&z0>-S0+100&&z1<S0-100,   /* none under the painted ground */
  color:(x,z,y,q)=>{const W=zoneW(x,z),n1=nz(x,z,.0031,206,2);
   let c=mixC(C.marsh,C.flat,W.flat);c=mixC(c,C.jung,W.jung);c=mixC(c,C.sav,W.sav*(1-.25*(n1+.5)));
   c=mixC(c,C.lake,W.lake);const t=WALL?x-toe(z):-1e9;c=mixC(c,C.talus,smooth(80,500,t));c=mixC(c,C.shelf,smooth(900,1200,t));
   return mixC(c,C.far,.25*smooth(5000,13000,q.r));}});
 const geo=KFAR.geometry(G);
 // THE BEDS: KSTRATA's canyon column over the wall's 2.1 km, gently dipping east, warped; strataColor on the steep faces only
 const STRATA=BIO.strata({recipe:'canyon',seed:SEED,range:[-100,2200],dip:[.4,.9,.006],warp:[9,2.2],dust:0xb89c78,res:.5,private:true});
 const mat=new THREE.MeshLambertMaterial({vertexColors:true});mat.userData.farField=true;
 mat.onBeforeCompile=sh=>{STRATA.inject(sh);
  sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',
   '{float steep=1.0-clamp(normalize(vSWN).y,0.0,1.0);vec3 sc=strataColor(vSWP,vSWN);',
   ' diffuseColor.rgb=mix(diffuseColor.rgb,sc,smoothstep(0.30,0.55,steep)*0.95);}'].join('\n'));};
 mat.customProgramCacheKey=()=>'eastabyss-far';
 const mesh=new THREE.Mesh(geo,mat);mesh.userData.host=true;mesh.userData.farField=true;mesh.frustumCulled=false;
 /* the probe's points on the wall (its registered volume reads them; a flat x,y,z list): the face's middle, every 400 m along z */
 if(WALL){const pp=[];for(let z=-800;z<=800;z+=400){const x=toe(z)+600;pp.push(x,farH(x,z),z);}mesh.userData.probePoints=pp;}
 mesh.userData.inspectLabel='The abyss wall (the shelf, ~1.9 km over the basin) and the basin floor beyond the map';scene.add(mesh);
 if(WALL)REGISTER({name:'The abyss wall',key:'landform.abysswall',kind:'landform',x:toe(0)+600,z:0,y:0,r:1000,h:WALLH+80});
 return{mesh,mat,G,H:farH,toe,STRATA,tris:G.count.tris};})();
// THE TERRAIN'S HORIZON (core/terrain/45-core-horizon.js, KHORIZON): eight directions over the painted square (256 a side, ~29 m)
// and, past it, the far field, so the wall's shadow reaches across the shelf foot and the jungle strip when the sun is low in the
// east. The basin floor takes it; the flora takes it after the bake (88-host-build.js), the far field does not.
const GROUND_HZ=(function(){if(typeof KHORIZON==='undefined'||new URLSearchParams(location.search).get('hz')==='0')return null;
 const t0=performance.now(),S=TERR.R*1.1,H=KHORIZON.bake({box:[-S,-S,S,S],n:256,h:terrainH,
  far:FAR?{h:(x,z)=>{const v=FAR.G.at(x,z);return v===v?v:0;},box:[-14000,-14000,14000,14000],n:200}:undefined});
 window._horizon={ms:Math.round(performance.now()-t0),n:H.n};KHORIZON.shade(MAT_GROUND,H);return H;})();
