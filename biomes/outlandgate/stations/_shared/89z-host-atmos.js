// ================================================================= HOST — the atmosphere of a later station and THE GAP'S WIND (core/atmos)
// The weather is the station's (STAGE.atmos: {climate}); a height fog thick low and thinning up the walls. THE GAP'S WIND (PLAN.md section 3;
// section 8, amendment 1: core/atmos's shared katabatic fx): by night THE OUTLAND BORE drains north down the gap, by day THE SILK-DRAUGHT
// blows back up it from Spider Lake; an overcast night barely drains. STAGE.down is the gap's axis here (down the river, toward Spider Lake),
// STAGE.wind {speed, daySpeed} its strength (the Narrows: 2.6 and 1.1; the gap's head and its mouth are wider: less). BANNERS (STAGE.banners:
// [[x, z, y]...], a pole's foot) stand downwind of their poles, turned each frame. ?hfog=0 no height fog, ?wind=0 the weather's own wind.
ATMOS.init({THREE,scene,camera,hour:()=>11,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>FC.at(FC.a.h,x,z),seed:6111+(STAGE.seed==null?0:STAGE.seed),err:reportErr});
ATMOS.bindWeather({climate:(STAGE.atmos&&STAGE.atmos.climate)||{wet:true,cold:false},sun,hemi:HEMI,grounds:[MAT_GROUND]});
BIO.bindAtmosWind();
const GAP_DOWN=(function(){const d=STAGE.down||[0,-1],l=Math.hypot(d[0],d[1])||1;return[d[0]/l,d[1]/l];})();
const hourNow=()=>typeof KHOST!=='undefined'&&KHOST.host&&KHOST.host.clock?KHOST.host.clock.hour:ATMOS.SKY.viewHour;
const WIND_O=Object.assign({down:GAP_DOWN,speed:2.2,daySpeed:1,calm:[GAP_DOWN[0]*.2,GAP_DOWN[1]*.2]},STAGE.wind||{});
const WIND=new URLSearchParams(location.search).get('wind')!=='0'&&ATMOS.katabatic?ATMOS.katabatic(Object.assign({hour:hourNow},WIND_O)):null;
const AIR=(function(){const Q=new URLSearchParams(location.search),out={hfog:false,raincover:false};
 if(Q.get('hfog')!=='0'&&ATMOS.heightFog){ATMOS.heightFog({falloff:1/1400,sun:.3,sky:.35});ATMOS.heightFogScene(scene);out.hfog=true;}
 if(ATMOS.rainCover){try{out.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}
 return out;})();
// ---------------------------------------------------------------- the banners: a cloth on a pole, downwind
const BANNERS=(function(){const out=[],cloth=new THREE.MeshLambertMaterial({color:STAGE.bannerCol==null?0xa8301e:STAGE.bannerCol,side:THREE.DoubleSide}),pole=new THREE.MeshLambertMaterial({color:0x4a3a2a});
 const g=new THREE.PlaneGeometry(3,1.6);g.translate(1.5,0,0);   /* the cloth hangs from its pole's head at x 0, out along +x */
 for(const p of (STAGE.banners||[])){const P=new THREE.Mesh(new THREE.CylinderGeometry(.1,.13,5,6),pole);P.position.set(p[0],p[2]+2.5,p[1]);P.userData.host=true;P.userData.inspectLabel='A banner\'s pole';scene.add(P);
  const B=new THREE.Mesh(g,cloth);B.position.set(p[0],p[2]+4.2,p[1]);B.userData.host=true;B.userData.inspectLabel=STAGE.bannerName||'A banner (it streams downwind: the gap\'s wind)';scene.add(B);out.push(B);}
 const turn=()=>{const w=WIND?WIND.wind:[GAP_DOWN[0]*.2,GAP_DOWN[1]*.2],a=Math.atan2(-w[1],w[0]),s=Math.min(1,Math.hypot(w[0],w[1])/1.6);
  for(const B of out){B.rotation.set(0,a,0);B.scale.set(.55+.45*s,1,1);}window._wind={wind:[+w[0].toFixed(3),+w[1].toFixed(3)],night:WIND?+WIND.night.toFixed(2):0,day:WIND?+WIND.day.toFixed(2):0};};
 turn();tick(turn);return out;})();
