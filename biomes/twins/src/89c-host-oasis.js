// ================================================================= HOST — an oasis drawn (stations 2 and 6): core/water's springs and geysers, the steam, the hazards
// The drawing half of 45a7-host-oasis.js (OASIS_MODEL), for a station whose 45b made an OASIS. Station 1 has none: nothing here runs there.
//   oasisItems()   the items the oasis puts before the one bake (a station's stationBuild calls it): each geyser's sinter cone (the kit's
//                  'cone'), its records first (core/tags)
//   THE WATER      every hot pool a WATER.spring (core/water/geyser 52: a still surface banded by its heat and mineral, drawn by 52b), each mud
//                  pot the same with the kaolinite's grey-rose ramp and boiling (the plopping is the spring's bubble rings: core/water has no
//                  mud-pot kind yet; KNOWN_ISSUES.md), each geyser a WATER.geyser on the host clock
//   THE STEAM      oasisSmoke(): the pools', the geysers' and the pots' steam and the fumaroles' thicker plumes, for 89b's one smoke call
//   THE HAZARDS    registered before the water is drawn: each pool and pot scalds (heat), each geyser's column, the fumaroles' gas
//                  (KHAZ.GROUND.gasVent), the hot ground along the fissure (KHAZ.GROUND.hotGround), and the gas that POOLS AT NIGHT in the
//                  fissure's trough (shape.pool: core/hazard/21-core-hazard-flow.js; its night clock the kit's own state, 'TWINS.nightPool':
//                  the core version is owed, KNOWN_ISSUES.md)
// The thermal water's own state: window._water, through twinsWater(o) (the one place it is set: a station's other water merges into it).
// THE KIT'S STATE FOR A GAS THAT POOLS AT NIGHT (kit-side, owed to core/hazard): the cold air drains into the lows after dusk and the CO2 the
// fissure breathes no longer mixes away: off by day, rising from 19:00, full from 21:00 to 05:00, gone by 08:00 (the host clock's hour)
function twinsNightK(hr){return Math.max(smooth(19,21,hr),smooth(8,5,hr));}
if(typeof KHAZ!=='undefined'&&KHAZ.STATES&&!KHAZ.STATES['TWINS.nightPool'])KHAZ.STATES['TWINS.nightPool']=function(rec,h,t){
 const hr=typeof SKY!=='undefined'&&SKY.clock?SKY.clock.hour:12,k=twinsNightK(hr);return{state:k>.02?'on':'idle',k,on:k>.02};};
// THE OASIS'S AIR (a station's STATION_TEMP calls it): within a dozen metres of the warm ground the air is the oasis's own (spec.air: PLAN.md
// section 3.2's +10 to +20 C at 0-3 m), easing to the range's ambient (89a: tempMean and the day's swing) with height and as the ground cools
function oasisTemp(x,y,z){if(typeof OASIS==='undefined')return null;const g=terrainH(x,z),dy=y-g;if(dy>14||dy<-3)return null;const h=OASIS.heatAt(x,z);if(h<1.5)return null;
 const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0,amb=tempMean(y)+3.5*clamp(e*2.2,-1,1),w=smooth(1.5,22,h)*smooth(14,2,dy);return amb+(OASIS.spec.air-amb)*w;}
function twinsWater(o){window._water=Object.assign(window._water||{},o);return window._water;}
function oasisItems(){if(typeof OASIS==='undefined')return null;const O=OASIS,n={cones:0,needles:0},prev=BIO.kit('twins');   /* the kit's items: its registry (closed after 70) */
 try{O.geysers.forEach((G,i)=>{const y=terrainH(G.x,G.z),h=G.cone==null?2.2:G.cone,r=h*.9;
   BIO.range=900;BIO.put('cone',[G.x,y-.15,G.z],null,[r,h,r],TWINS.PAL.sinter[i%3]);n.cones++;});
  /* each fumarole's lip: three sprays of brimstone needles (the pass adds more where the sulphur is) */
  O.fumaroles.forEach((f,i)=>{for(let k=0;k<3;k++){const h=KRAND.hash(WORLD,i,k,0xF0A1),u=q=>KRAND.unit(KRAND.hash(h,q)),a=u(1)*TAU,r=.8+1.2*u(2),x=f.x+Math.cos(a)*r,z=f.z+Math.sin(a)*r,s=.15+.12*u(3);
   BIO.range=160;BIO.put('needles',[x,terrainH(x,z)-.01,z],BIO.fn.qEuler(0,u(4)*TAU,0),[s,s,s],TWINS.PAL.brim[k%3]);n.needles++;}});}
 finally{BIO.range=null;BIO.kit(prev);}return n;}
function oasisSmoke(){if(typeof OASIS==='undefined')return[];const O=OASIS,e=[];
 O.springs.forEach(s=>{if(s.T>45)e.push([s.x,(s.level==null?terrainH(s.x,s.z):s.level)+.3,s.z,'steam']);});
 O.geysers.forEach(G=>e.push([G.x,terrainH(G.x,G.z)+(G.cone==null?2.2:G.cone),G.z,'steam']));
 O.mudpots.forEach(m=>e.push([m.x,(m.level==null?terrainH(m.x,m.z):m.level)+.2,m.z,'steam']));
 O.fumaroles.forEach(f=>e.push([f.x,terrainH(f.x,f.z)+.5,f.z,'fumarole']));return e;}
const OASIS_DRAW=(typeof OASIS==='undefined'||typeof WATER==='undefined'||!WATER.spring)?null:(function(){const O=OASIS,S=O.spec,out={springs:0,mudpots:0,geysers:0,hazards:0};
 // ---- the hazards first (core/tags records), then the water
 const H=(name,x,z,y,r,h,hz)=>{REGISTER({name,x,z,y,r,h,kind:'hazard',tags:{hazard:hz}});out.hazards++;};
 O.springs.forEach(s=>H(s.name+' (scalding: '+s.T+' C)',s.x,s.z,s.bed-.5,s.r+.5,2.2,{kind:'heat',danger:s.T>70?.85:.5,falloff:'smooth',shape:{type:'cyl',r:s.r+.5,h:2}}));
 O.mudpots.forEach(m=>H('A mud pot (boiling kaolinite: '+(m.T==null?78:m.T)+' C)',m.x,m.z,m.bed-.5,m.r+.6,2,{kind:'heat',danger:.8,falloff:'smooth',shape:{type:'cyl',r:m.r+.6,h:1.6},nav:{travel:8,enter:20,avoid:true}}));
 O.geysers.forEach(G=>H(G.name+' (its column: boiling water)',G.x,G.z,G.y-1,6,G.H+4,{kind:'heat',danger:.8,shape:{type:'cyl',r:5,h:G.H+2}}));
 O.fumaroles.forEach((f,i)=>{const y=terrainH(f.x,f.z);REGISTER(Object.assign({name:f.name||'A fumarole (steam, H2S and SO2)',x:f.x,z:f.z,y:y-1,r:6,h:8,kind:'hazard'},
  {tags:{hazard:KHAZ.GROUND.gasVent(5,{danger:.6})}}));out.hazards++;});
 if(S.fault){const P=S.fault,m=P[Math.floor(P.length/2)],R=Math.max(...P.map(p=>Math.hypot(p[0]-m[0],p[1]-m[1])))+30;
  REGISTER({name:'The fissure\'s hot ground (the fault the springs rise along)',x:m[0],z:m[1],y:terrainH(m[0],m[1])-3,r:R,h:8,kind:'hazard',
   tags:{hazard:KHAZ.GROUND.hotGround(P.map(p=>[p[0]-m[0],p[1]-m[1]]),12)}});out.hazards++;
  /* the gas that pools at night in the fissure's trough: CO2 a metre and a half deep on the floor, nothing two metres up (shape.pool) */
  REGISTER({name:'CO2 pooling in the fissure\'s trough at night (it settles after dusk: lie down here and you do not wake)',x:m[0],z:m[1],y:terrainH(m[0],m[1])-1.5,r:R,h:4,kind:'hazard',
   tags:{hazard:{kind:'gas',effect:'suffocate',danger:.9,falloff:'smooth',shape:{type:'cyl',r:Math.min(R,140),h:3,y0:0,y1:3,pool:2},stateFn:'TWINS.nightPool',
    nav:{travel:2,enter:4,avoid:false},tell:{colour:'#9aa08a',sign:'dead insects and birds on the floor at dawn'}}}});out.hazards++;}
 // ---- the springs and the mud pots
 const MATS=new Map(),MUD={deep:[.3,.25,.24],blue:[.4,.34,.32],green:[.48,.41,.39],yel:[.54,.46,.43],ora:[.58,.5,.46],rust:[.5,.43,.39]};
 O.springs.forEach(s=>{const W=WATER.spring({key:s.key,name:s.name,x:s.x,z:s.z,r:s.r,level:s.level,temp:s.temp==null?.7:s.temp,mineral:s.mineral||'sinter',milky:s.milky||0,boil:s.boil||0,steam:0});
  const d=WATER.drawSpring(W,{THREE,scene,fog:scene.fog,mats:MATS,renderOrder:1});d.mesh.userData.inspectLabel=s.name;s.W=W;out.springs++;});   /* not probeSkip: the disc is what its scald record holds */
 O.mudpots.forEach(m=>{const W=WATER.spring({key:m.key,name:'A mud pot',x:m.x,z:m.z,r:m.r,level:m.level,temp:.95,mineral:MUD,milky:0,boil:1,steam:0});
  const d=WATER.drawSpring(W,{THREE,scene,fog:scene.fog,mats:MATS,renderOrder:1});d.mesh.userData.inspectLabel='A mud pot (grey-rose kaolinite, plopping at '+(m.T==null?78:m.T)+' C)';m.W=W;out.mudpots++;});
 // ---- the geysers: the cone's mouth their vent, the host clock theirs
 const GU={uScale:{value:900}},GM=new Map();tick(()=>{GU.uScale.value=innerHeight*renderer.getPixelRatio()/(2*Math.tan(camera.fov*Math.PI/360));});
 O.geysers.forEach(G=>{const top=G.y+(G.cone==null?2.2:G.cone)-.2,P=G.period||1200;
  const W=WATER.geyser({key:G.key,name:G.name,vents:[[G.x,G.z]],top,H:G.H,style:G.style||'cone',period:P,pre:P*.12,dur:Math.min(P*.15,90),steam:Math.min(P*.2,120),pool:1.2,world:WORLD});
  const D=WATER.drawGeyser(W,{THREE,scene,uniforms:GU,fog:scene.fog,wind:[.6,-.3],gravity:9.8,mats:GM});D.points.userData.inspectLabel=G.name;G.W=W;out.geysers++;});
 out.surfaces=WATER.surfaces.length;twinsWater(out);return out;})();
