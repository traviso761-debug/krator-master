// ================================================================= GRĒṬ-ĀIL — the night: the azure glass, the lamps' light
// PLAN.md section 5, "Light at night". By night the hall's azure glass glows (the Keepers' Walk's floor lamps under their blue
// glass, the clerestory's panes: the blue window Erehwon sees across the water), and the lamps nearest the eye light their
// surroundings: one pool of point lights, its count fixed so nothing recompiles at dusk (Qiblai's 90v is the model), chosen again
// twice a second: an azure lamp (blue, 7 m) or the Damsel's gold lamp (warm, 6 m) within 40 m, the wharf's oil lanterns
// (warm, 18 m) and the clerestory's panes (blue, 14 m) within 220 m, the summit's signal lamp (blue, 30 m) within 600 m. Every
// target's (the isle's and the summit's). Night is the sky's (99-start.js NIGHT). [web]: three.js.
reseed(34154);
const AD_NIGHT=(function(){const LIGHTS=8,pool=[],S={lit:0,glow:0},KIND={azure:{i:1.1,d:7,c:0x4a7ae8,near:40},gold:{i:1.0,d:6,c:0xffc870,near:40},
  oil:{i:1.6,d:18,c:0xffc890,near:220},pane:{i:.9,d:14,c:0x3a6ad8,near:220},signal:{i:2.4,d:30,c:0x6a9af8,near:600},
  censer:{i:.7,d:4,c:0xff9a50,near:40},keeper:{i:.9,d:6,c:0xffd8a0,near:60},station:{i:1.4,d:16,c:0xdfe8ff,near:120},bulb:{i:.6,d:6,c:0xffd090,near:40}};   /* signal: the Station Watch's and the relay's (89qc); censer, keeper, station: the Hall's night (targets/isle/90ah): embers, a keeper's hooded lamp, the Station's light through the opened shutters; bulb: a room's own light (targets/isle/90ai) */
 for(let i=0;i<LIGHTS;i++){const L=new THREE.PointLight(0x4a7ae8,0,10,2);L.castShadow=false;L.name='azure-dream light '+i;scene.add(L);pool.push(L);}
 let lt=0;FRAME_HOOKS.push(dt=>{const night=typeof NIGHT!=='undefined'&&NIGHT;
  /* which lamps burn: the Hall's night timetables where the page has them (AD_LAMPON, targets/isle/90ah), else the sky's night */
  const on=(k)=>typeof AD_LAMPON!=='undefined'?AD_LAMPON(k,night):(night||k==='gold');
  MAT.adAzure.emissiveIntensity=on('azure')?1.6:.08;S.glow=MAT.adAzure.emissiveIntensity;
  lt+=dt||.016;if(lt<.5)return;lt=0;const P=camera.position,cand=[];
  for(const l of AD_LAMPS){const K=KIND[l[3]]||KIND.oil;if(!on(l[3]))continue;const d=(l[0]-P.x)**2+(l[1]-P.y)**2+(l[2]-P.z)**2;if(d<K.near*K.near)cand.push([l,d*(l[3]==='pane'?4:1),K]);}
  cand.sort((a,b)=>a[1]-b[1]);
  pool.forEach((L,i)=>{const e=cand[i];if(e){L.position.set(e[0][0],e[0][1],e[0][2]);L.intensity=e[2].i;L.distance=e[2].d;L.color.setHex(e[2].c);}else L.intensity=0;});
  S.lit=Math.min(LIGHTS,cand.length);});
 return S;})();
window._adNight=AD_NIGHT;
