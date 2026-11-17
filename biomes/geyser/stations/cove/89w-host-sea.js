// ================================================================= HOST — the Ring Sea in the cove (core/water; station 7, the showcase's 89w-host-sea.js on the cove)
// The same open water (WATER.open: the Ring Sea kit's swell, half the shared wave field, the CDLOD mesh, the bed baked from terrainH so the shallows go
// teal over the apron's foot and the surf laps under 1.4 m), its bounds over the bay as well as the outer sea. THE PLUMES in it (core/water ext/61,
// tintFlow; the spec's "turquoise-white silica plumes billowing into the Ring Sea surf"): the bay's boiling vents (87) and every hot outflow that reaches
// the water (the run-off channels' feet, the Lime Stair's outfalls) carry the silica and carbonate they have not yet laid down into the bay, turquoise
// white, eddying and drawn out through the mouth on the ebb; the creek's tea-brown water off the outer coast. ?plume=0 for the clear sea.
// THE STEAM OFF THE WATER: the hot bay smokes (core/atmos particles, ATMOS.smoke's steam over the vents and the outflows' feet), under 87's plumes.
ATMOS.init({THREE,scene,camera,hour:()=>LIGHT_MODE==='night'?0:13,onFrame:fn=>TICKS.push(fn),ground:(x,z)=>terrainH(x,z),seed:5307,
 err:m=>console.warn(m),viewH:()=>innerHeight,pixelRatio:()=>renderer.getPixelRatio()});
const SKY_ENV=new THREE.Scene(),SEA_ENV={environment:null};
{SKY_ENV.add(new THREE.Mesh(sky.geometry,sky.material));for(const m of[giant,giantRing]){const c=m.clone();c.position.copy(giantDir).multiplyScalar(GIANT_DIST);SKY_ENV.add(c);}}
ATMOS.skylight({renderer,sky:SKY_ENV,scene:SEA_ENV,ground:()=>new THREE.Color(0x0d2c30),key:()=>LIGHT_MODE});
// the outflows' feet in the water: where each run-off channel and outfall ends at or under the sea's level
const COVE_FEET=(function(){const F=[];LAYOUT.runoff.forEach(ch=>{const p=ch.P[ch.P.length-1];if(landH(p[0],p[1])<.6)F.push({x:p[0],z:p[1],k:/-out$/.test(ch.src)?.45:.55,src:ch.src});});return F;})();
const SEA_PLUME=(function(){if(new URLSearchParams(location.search).get('plume')==='0'||!WATER.tintFlowAt)return null;
 const ce=CREEK.P[CREEK.P.length-1],SIL=[.34,.72,.7],LIME=[.62,.74,.68];
 const M=[{x:ce[0],z:outerZ(ce[0]),k:.8,c:[.32,.27,.18],R:300}]
  .concat(((window._cove&&window._cove.vents)||[]).map(v=>({x:v.x,z:v.z,k:.5,c:SIL,R:120})))
  .concat(COVE_FEET.map(f=>({x:f.x,z:f.z,k:f.k*.7,c:/stair|limekettle|chalk/.test(f.src)?LIME:SIL,R:70})));
 const hx=c=>(Math.round(c[0]*255)<<16)|(Math.round(c[1]*255)<<8)|Math.round(c[2]*255);
 // a source's share at a point: round it, drawn out seaward through the mouth (UO) by the ebb
 const share=(m,x,z)=>{const dx=x-m.x,dz=z-m.z,along=Math.max(0,dx*UO[0]+dz*UO[1]),ax=dx-UO[0]*along*.45,az=dz-UO[1]*along*.45;return m.k*smooth(m.R,12,Math.hypot(ax,az));};
 return{sources:M.length,tint:{box:[-1100,-300,700,900],cell:8,at:(x,z)=>{if(landH(x,z)>.2)return null;let a=0,c=[0,0,0],s=0;
   for(const m of M){const w=share(m,x,z);if(w<=0)continue;a=Math.max(a,w);s+=w;for(let i=0;i<3;i++)c[i]+=m.c[i]*w;}
   if(a<.004)return null;return{c:hx(c.map(v=>clamp(v/s,0,1))),a:Math.min(.48,a)};}},
  flow:{cell:16,period:60,swirl:.16,scale:90,evolve:.8,fil:.5,filScale:22,
   v:(x,z)=>{if(landH(x,z)>.5)return null;let vx=UO[0]*.04,vz=UO[1]*.04;for(const m of M){const dx=x-m.x,dz=z-m.z,d=Math.hypot(dx,dz)||1,k=.22*smooth(m.R*1.6,6,d);vx+=dx/d*k;vz+=dz/d*k;}return[vx,vz];}}};})();
const SEA_WATER=WATER.open(Object.assign({name:'The Ring Sea (the boiling cove and the coast)',level:SEA,swell:'ringsea',field:.5,bounds:[-9000,-320,9000,9000],bed:terrainH,bedBox:[-1700,-320,1700,1700],bedCell:5},
 SEA_PLUME?{tint:SEA_PLUME.tint,tintFlow:SEA_PLUME.flow}:{}));
const SEA_DRAW=WATER.draw(SEA_WATER,{transparent:true,renderOrder:1,roughness:.2,metalness:.1,envMapIntensity:.35,
 shallow:new THREE.Color(.14,.32,.3).convertSRGBToLinear(),deep:new THREE.Color(.05,.17,.19).convertSRGBToLinear()});
SEA_DRAW.mesh.userData.inspectLabel='The Ring Sea';
window._sea={plumes:SEA_PLUME?SEA_PLUME.sources:0,feet:COVE_FEET.length};
// THE PIRATES' CRAFT (45: COVE_SHIPS; kits/ringsea's vessels through the sealed bundle, 89v): each a registry record first (its culture and its trade
// tagged), then a clone of its kit build moored on the sea's level, the sails' flutter on the page's clock
const COVE_FLEET=(function(){const out=[];if(typeof RINGSEA==='undefined')return out;let t=0;
 COVE_SHIPS.forEach(s=>{const D=RINGSEA.dims[s.vessel];if(!D)return;
  REGISTER({name:s.name,vessel:s.vessel,ship:s.key,x:s.x,z:s.z,y:-4,r:D.L*.55,h:D.H+5,tags:{culture:s.culture,role:'pirate',trade:'sulphur'}});
  const r=RINGSEA.make(s.vessel);if(!r)return;r.group.position.set(s.x,SEA,s.z);r.group.rotation.y=s.yaw;r.group.name=s.key;
  r.group.traverse(o=>{if(o.isMesh)o.userData.inspectLabel=s.name;});scene.add(r.group);out.push({key:s.key,vessel:s.vessel,culture:s.culture,x:s.x,z:s.z,L:D.L,B:D.B});});
 if(out.length)TICKS.push(dt=>{t+=dt;RINGSEA.tick(t);});return out;})();
window._fleet=COVE_FLEET.map(s=>s.key+':'+s.vessel);
// the steam off the hot water: over each boil (a wide ring of emitters) and each outflow's foot
const BAY_STEAM=(function(){if(!ATMOS.smoke)return null;const E=[],U=(i,s)=>KRAND.unit(KRAND.hash(5307,i,s));
 ((window._cove&&window._cove.vents)||[]).forEach((v,i)=>{for(let k=0;k<9;k++){const a=U(i*16+k,1)*TAU,d=4+22*Math.sqrt(U(i*16+k,2));E.push([v.x+Math.cos(a)*d,SEA+.2,v.z+Math.sin(a)*d,'steam']);}});
 COVE_FEET.forEach(f=>E.push([f.x,SEA+.2,f.z,'steam']));
 return E.length?ATMOS.smoke(E,{n:12}):null;})();
_mark('sea');
// THE WEATHER (core/atmos bindWeather; the showcase's): wet, the coast's rain, storms and sea fog, starting clear
ATMOS.bindWeather({climate:{wet:true},sun,hemi,grounds:[MAT_GROUND]});
