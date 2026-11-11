// ================================================================= HOST — the atmosphere: the gap's warm, humid air and ITS WIND (core/atmos)
// The weather is a warm humid valley's (it starts clear; the panel's Weather selector picks the rest); a height fog thick on the floor and
// thinning up the walls. THE GAP'S WIND (PLAN.md section 3; section 8, amendment 1: core/atmos's shared katabatic fx, ATMOS.katabatic): a
// trough this deep between airless walls channels the air. By night and in the small hours THE OUTLAND BORE drains the Outlands' plateau north
// down the gap (strong: the gorge is planed by it), dying by mid-morning; by day THE SILK-DRAUGHT, the up-valley breeze from Spider Lake,
// blows back up it (weaker); an overcast night barely drains. Its vector is ATMOS's wind base, so the foliage, the particle clouds and the
// gusts all follow it, on the page's own clock. BANNERS on the long wall's towers and the fort's keep stand downwind of their poles, turned
// each frame. ?hfog=0 no height fog, ?wind=0 the weather's own wind.
ATMOS.init({THREE,scene,camera,hour:()=>11,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>FC.at(FC.a.h,x,z),seed:6111,err:reportErr});
ATMOS.bindWeather({climate:{wet:true,cold:false},sun,hemi:HEMI,grounds:[MAT_GROUND]});
BIO.bindAtmosWind();
// the gap's axis down the river (north: the Bore's way; the Silk-Draught blows back up it from Spider Lake) and the wind on it
const GAP_DOWN=(function(){const dx=RIV_B[0]-RIV_A[0],dz=RIV_B[1]-RIV_A[1],l=Math.hypot(dx,dz);return[dx/l,dz/l];})();
const hourNow=()=>typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock?KHOST.host.clock.hour:ATMOS.SKY.viewHour;
const WIND_O={down:GAP_DOWN,speed:2.6,daySpeed:1.1,calm:[GAP_DOWN[0]*.2,GAP_DOWN[1]*.2]};
const WIND=new URLSearchParams(location.search).get('wind')!=='0'&&ATMOS.katabatic?ATMOS.katabatic(Object.assign({hour:hourNow},WIND_O)):null;
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/1400,sun:.3,sky:.35});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
// ---------------------------------------------------------------- the banners: a cloth on a pole at each tower's head and the keep's, downwind
const BANNERS=(function(){const out=[],cloth=new THREE.MeshLambertMaterial({color:0xa8301e,side:THREE.DoubleSide}),pole=new THREE.MeshLambertMaterial({color:0x4a3a2a});
 const g=new THREE.PlaneGeometry(4,2.2);g.translate(2,0,0);   /* the cloth hangs from its pole's head at x 0, out along +x */
 const at=[];for(let x=-3600;x<=3600;x+=400){if(Math.abs(x-roadX(ZW))<40||Math.abs(x-GATE.water.x)<GATE.water.hw+12)continue;at.push([x,ZW,Math.min(terrainH(x-5,ZW),terrainH(x+5,ZW),terrainH(x,ZW))-1.5+17.5]);}
 at.push([GATE.fort.x+GATE.fort.w/2*.3,GATE.fort.z+GATE.fort.d/2*.2,Math.min(terrainH(GATE.fort.x,GATE.fort.z),terrainH(GATE.fort.x+GATE.fort.w/2,GATE.fort.z))-1.5+31]);
 for(const p of at){const P=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,6,6),pole);P.position.set(p[0],p[2]+3,p[1]);scene.add(P);
  const B=new THREE.Mesh(g,cloth);B.position.set(p[0],p[2]+5,p[1]);B.userData.host=true;B.userData.inspectLabel='A banner of the Tierhounds (it streams downwind: the gap\'s wind)';scene.add(B);out.push(B);
  P.userData.host=true;P.userData.inspectLabel='A banner\'s pole';}
 const turn=()=>{const w=WIND?WIND.wind:[GAP_DOWN[0]*.2,GAP_DOWN[1]*.2],a=Math.atan2(-w[1],w[0]),s=Math.min(1,Math.hypot(w[0],w[1])/1.6);
  for(const B of out){B.rotation.set(0,a,0);B.scale.set(.55+.45*s,1,1);}window._wind={wind:[+w[0].toFixed(3),+w[1].toFixed(3)],night:WIND?+WIND.night.toFixed(2):0,day:WIND?+WIND.day.toFixed(2):0};};
 turn();tick(turn);return out;})();
