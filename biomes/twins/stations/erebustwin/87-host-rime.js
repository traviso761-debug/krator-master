// ================================================================= HOST — THE RIME TWIN's own (station 5): core/terrain KGLACIER's drawer
// stationBuild() (88-host-build.js calls it before the kit's pass and the one bake):
//   THE ICE TOWERS  Mount Erebus's fumarolic ice towers (PLAN.md section 6): each fumarole's steam frozen round it into a hollow chimney
//                   6-12 m (the drawer's 'icetower'), a record with its gas hazard first (89c-host-oasis.js registers each fumarole's gas;
//                   the tower is the structure round it); their steam is 89b's (STATION_SMOKE: the fumaroles rise through the towers' tops)
//   THE STEAM CAVES four melted into the ice's margin by the vent's breath, their mouths toward it, lit blue through the ice from within
//                   (the drawer's cave: an outer shell and an inner face whose blue deepens away from the mouth); the thin ice over each
//                   gives way under a laden beast (a 'fall' hazard with a weight trigger, kit-side)
//   TUBE 10         its upper mouth under the south-east wall, the same drawer's cave, larger and deeper
//   THE MARGIN      seracs spalled off the ice's front (the drawer's 'serac'), crevasses opened along it (each a 'fall' hazard)
//   THE PLUME       the vent's steam column over the summit (a smoke kind of the station's own, 'pitsteam', added to core/atmos's smoke
//                   preset when 89b asks STATION_SMOKE: one smoke call a page)
// STATION_TEMP: +14 C inside a steam cave and tube 10's mouth, +10 C in a tower's breath, the warm ground's air by its heat; else the ice's.
const RIME_PROBE=[];   // probe points (KHOST: userData.probePoints) for the records whose drawing the probe skips (the cauldrons' water) or that hold no item
function STATION_TEMP(x,y,z){if(typeof RIME==='undefined')return null;
 for(const C of RIME.caves.concat([RIME.tube]))if(C.floor!=null&&Math.hypot(x-C.x,z-C.z)<C.R*.92&&y>C.floor-1&&y<C.floor+C.H*.92)return 14;
 const g=terrainH(x,z),dy=y-g;if(dy<-3||dy>14)return null;
 for(const t of RIME.towers)if(Math.hypot(x-t.x,z-t.z)<t.r+1.5&&dy<t.h)return 10;
 const h=OASIS.heatAt(x,z);if(h<0)return null;
 const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0,amb=tempMean(y)+3.5*clamp(e*2.2,-1,1),w=smooth(0,40,h)*smooth(12,2,dy);return amb+(OASIS.spec.air-amb)*w;}
function stationBuild(){const t0=performance.now(),out={towers:0,caves:0,seracs:0,crevasses:0};
 const ICEMAP=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib'||!KMAT.packed)return null;const P=KMAT.packed('twins','ice');if(!P)return null;const t=KMAT.textures(P,{aniso:4}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
 const MAT=BIO.solidMat(ICEMAP),GD=KGLACIER.drawer({scene,register:REGISTER,ground:terrainH,ticks:TICKS,onLight:LIGHT_HOOKS,camera,renderer,map:ICEMAP,across:[1,0],up:[0,1]});
 RIME.GD=GD;BIO.cur='twins/rime';
 GD.defTower(MAT,'Ice towers (Erebus fumaroles: the steam frozen round its vent into a hollow chimney)');GD.defSerac(MAT,'Seracs (spalled off the ice cap\'s melting front)');
 const ICEC=[0xd8e8f4,0xc4dcee,0xb0d0ea,0xe4eef6],C3=h=>new THREE.Color(h),U=(i,s)=>KRAND.unit(KRAND.hash(WORLD,55,i,s));
 // ---- the towers
 RIME.towers.forEach((t,k)=>{REGISTER({name:'An ice tower ('+t.h.toFixed(1)+' m: a fumarole\'s steam frozen into a hollow chimney)',x:t.x,z:t.z,y:t.y-1,r:t.r+1,h:t.h+2,kind:'structure',tags:{feature:'ice tower'}});
  BIO.range=2400;BIO.put('icetower',[t.x,t.y-.4,t.z],BIO.fn.qEuler((U(k,1)-.5)*.1,U(k,2)*TAU,(U(k,3)-.5)*.1),[t.r,t.h+.4,t.r],C3(ICEC[k%ICEC.length]).multiplyScalar(.95+.1*U(k,4)));out.towers++;});
 // ---- the margin: seracs and crevasses (each crevasse a fall: the snow bridges over them)
 RIME.seracs.forEach((r,k)=>{r.y=terrainH(r.x,r.z)-r.s*.35;BIO.range=900;GD.putSerac(r,C3(ICEC[(k+1)%ICEC.length]),r.y);out.seracs++;});
 RIME.crevs.forEach(c=>{const y=terrainH(c.x,c.z);REGISTER({name:'A crevasse (snow-bridged: it opens under a laden beast)',x:c.x,z:c.z,y:y-6,r:c.len/2,h:7,kind:'hazard',
  tags:{hazard:{kind:'fall',danger:.8,falloff:'none',shape:{type:'cyl',r:Math.max(1,c.w),h:7},trigger:{by:'weight',mass:200,reset:0}}}});RIME_PROBE.push(c.x,y-1,c.z);});
 if(RIME.crevs.length){GD.crevasses(RIME.crevs,terrainH);out.crevasses=RIME.crevs.length;}
 // ---- the steam caves and tube 10's mouth (their records are the drawer's), the thin ice over each a fall
 RIME.caves.forEach(C=>{REGISTER({name:'Thin ice over a steam cave (it breaks under a laden beast)',x:C.x,z:C.z,y:C.floor+C.H-3,r:C.R*.8,h:6,kind:'hazard',
   tags:{hazard:{kind:'fall',danger:.9,falloff:'none',shape:{type:'cyl',r:C.R*.8,h:5},trigger:{by:'weight',mass:250,reset:0}}}});RIME_PROBE.push(C.x,C.floor+C.H,C.z);
  GD.cave(C);out.caves++;});
 GD.cave(RIME.tube);
 BIO.cur=null;BIO.range=null;
 // ---- the caves' breath: steam at each mouth (the drawer's own points, on its clock)
 GD.steam(RIME.caves.concat([RIME.tube]).map(c=>({x:c.x+Math.cos(c.face)*c.R*.9,z:c.z+Math.sin(c.face)*c.R*.9,y:c.floor+c.H*.6,n:8,size:4,rise:14,rate:.05})));GD.bindClock();
 // ---- the cauldrons' and the pit's records hold no item: probe points (89c draws the water with probeSkip)
 RIME.cauldrons.forEach(s=>RIME_PROBE.push(s.x,(s.level==null?terrainH(s.x,s.z):s.level),s.z));
 RIME.pitVents.concat([{x:RIME.V[0],z:RIME.V[1]}]).forEach(f=>RIME_PROBE.push(f.x,terrainH(f.x,f.z)+1,f.z));
 {const o=new THREE.Object3D();o.userData.probePoints=RIME_PROBE;scene.add(o);}
 REGISTER({name:'The Rime Twin\'s summit caldera (Al-Qaran al-Saghir: an ice cap under the basalt rim)',x:0,z:0,y:RIME.floorY-10,r:2100,h:120,kind:'feature',tags:{volcano:'active',twin:'SE'}});
 REGISTER({name:'The inner vent (an active pit steaming through the ice)',x:RIME.V[0],z:RIME.V[1],y:RIME.V.y-5,r:RIME.pit.r+10,h:70,kind:'feature',tags:{volcano:'vent'}});
 out.ms=Math.round(performance.now()-t0);window._station=out;return out;}
// THE PLUME: the vent's column, a smoke kind of the station's own, added to core/atmos's smoke preset when 89b asks (its one smoke call)
function STATION_SMOKE(){const SP=ATMOS.PRESETS.smoke;
 SP.pitsteam={index:6,n:40,rate:.12,rise:340,drift:160,wobble:10,size:[18,80],alpha:.28,rainDamp:0,color:[.93,.94,.96]};
 const V=RIME.V,top=terrainH(V[0]+RIME.pit.r+20,V[1]),e=oasisSmoke();
 for(let k=0;k<3;k++)e.push([V[0]+(k-1)*14,top-20+k*6,V[1]+(k%2)*10,'pitsteam']);return e;}
