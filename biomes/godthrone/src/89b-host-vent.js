// ================================================================= HOST — the summit vent: its lava, its fume, its fountain, its crack, its hazards
// PLAN.md section 4: "the summit vent: a fissure and spatter rampart that fountains now and then, fuming in between". The
// owner (2026-10-26): INTERMITTENTLY ACTIVE. Records first (core/tags, core/hazard), then drawn:
//   the fountain  every VENT_CYCLE.period seconds the vent fountains for VENT_CYCLE.on: lava flung 300-600 m up out of the
//                 throat in the thin air (a fifteenth of Earth's drag: the droplets fly far, PLAN.md section 2), hot yellow
//                 cooling to red as they fall; the throat's crust churns. ONE clock: the record's cycle (KHAZ, the
//                 lava kind) drives what is drawn, read with KTRAPS.cycle on the same segments as KHAZ's (core/biome 37)
//   the throat    lava standing in the shaft under the main cone's crater (core/atmos fx/lava; KHAZ.GROUND.lavaLake)
//   the fume      a column from the crater, fumaroles all along the fissure's crack (ATMOS.smoke, two kinds added to this
//                 page's preset: the air is a tenth of an atmosphere, so the column spreads wide and thins fast)
//   the crack     still hot: it glows along its length at night (ATMOS.glowAdd: the glow layer, on with the night)
//   the hazards   the fountain, the throat's lava, the gas at the crater and the fumaroles (gasVent), the hot ground of the
//                 spatter rampart (hotGround); the thin air and the cold everywhere (the ambient bridge)
// On the wall's station (STN.vent false) the vent is 23 km off: only its fume and its fountain are drawn there.
// THE CYCLE (seconds of ATMOS.clock): a warning (the fume thickens), the rise, the fountain, its fall, the spatter still
// raining (after), then quiet. The offset makes a page open quiet, the first fountain three minutes in
const VENT_CYCLE={period:600,warn:20,ramp:15,on:120,after:60,afterK:.2,offset:420};
const VENTS=(function(){const V=VENT,K=KRAND,u=(a,b)=>K.unit(K.hash(WORLD,a,b,0xF0E)),C=VENT_CYCLE;
 // ---- the records (the fountain's on every station: it is the world's; the rest where the vent is drawn)
 const fountain={name:'The summit vent\'s fountain (intermittent: lava flung hundreds of metres up)',x:V.x,z:V.z,y:V.lavaY-2,r:140,h:600,kind:'hazard',far:!STN.vent,   /* far: on the wall's page it stands 23 km off (the probe's occupancy skips it) */
  tags:{hazard:KHAZ.GROUND.lavaLake(140,{shape:{type:'cyl',r:140,h:600,y0:0},radiant:{reach:220,dose:6,danger:.8},cycle:Object.assign({},C)})}};
 REGISTER(fountain);
 let throat=null,crater=null,ramp=null,fum=[],lava=null,LAVA=null,glows=0;
 if(STN.vent){
  throat={name:'The summit vent\'s throat (lava stands in it)',x:V.x,z:V.z,y:V.lavaY-3,r:V.throat,h:10,kind:'hazard',tags:{hazard:KHAZ.GROUND.lavaLake(V.throat*.9)}};
  crater={name:'The summit vent\'s crater (its gases)',x:V.x,z:V.z,y:V.lavaY,r:V.r*V.crater,h:60,kind:'hazard',tags:{hazard:KHAZ.GROUND.gasVent(V.r*V.crater*.8)}};
  for(let k=0;k<6;k++){const uu=FISS.a+90+k*(FISS.b-FISS.a-180)/5,p=fissPt(uu);if(coneAt(p[0],p[1]).k>.3)continue;
   fum.push({name:'A fumarole on the fissure\'s crack',x:p[0],z:p[1],y:terrainH(p[0],p[1])-2,r:14,h:24,kind:'hazard',tags:{hazard:KHAZ.GROUND.gasVent(10)}});}
  const fa=fissPt(FISS.a),fbp=fissPt(FISS.b),dx=FISS.dir,ax=[(dx[0]+dx[1])*SQ,(dx[1]-dx[0])*SQ];   /* the fissure's axis in x,z (s,t -> x,z) */
  const nx=[-ax[1],ax[0]],hw=34,mid=[(fa[0]+fbp[0])/2,(fa[1]+fbp[1])/2],L=Math.hypot(fbp[0]-fa[0],fbp[1]-fa[1])/2;
  const pts=[[-L,-hw],[L,-hw],[L,hw],[-L,hw]].map(q=>[ax[0]*q[0]+nx[0]*q[1],ax[1]*q[0]+nx[1]*q[1]]);
  ramp={name:'The spatter rampart (the ground is still hot)',x:mid[0],z:mid[1],y:terrainH(mid[0],mid[1])-4,r:L+hw,h:30,kind:'hazard',tags:{hazard:KHAZ.GROUND.hotGround(pts,null)}};
  [throat,crater,ramp].concat(fum).forEach(r=>REGISTER(r));
  // ---- the throat's lava
  const sd=SKY.state&&SKY.state.sunDir?SKY.state.sunDir:[.4,.8,.3];
  LAVA=ATMOS.lavaMaterial({name:'The summit vent\'s throat',centre:[V.x,V.z],sun:[sd.x==null?sd[0]:sd.x,sd.y==null?sd[1]:sd.y,sd.z==null?sd[2]:sd.z],
   crust:hostGroundLib('lavaCrust',null),scale:.14,crack:1.3,heat:1.1,swell:false});
  const lg=new THREE.CircleGeometry(V.throat*1.05,48);lg.rotateX(-Math.PI/2);lg.translate(V.x,V.lavaY,V.z);
  lava=new THREE.Mesh(lg,LAVA);lava.userData.inspectLabel=throat.name;lava.renderOrder=1;scene.add(lava);}
 // ---- the fume and the fumaroles (two kinds on the page's smoke preset: core/atmos 0p, "change a value before placing")
 const SP=ATMOS.PRESETS.smoke;
 SP.fume={index:3,n:46,rate:.022,rise:560,drift:260,wobble:9,size:[16,120],alpha:.26,rainDamp:0,color:[.76,.74,.71]};
 SP.fumarole={index:4,n:14,rate:.07,rise:70,drift:30,wobble:2.5,size:[3,18],alpha:.22,rainDamp:0,color:[.86,.85,.82]};
 const em=[];
 for(let k=0;k<9;k++){const a=u(k,1)*TAU,r=V.r*V.crater*.55*Math.sqrt(u(k,2)),x=V.x+Math.cos(a)*r,z=V.z+Math.sin(a)*r;em.push([x,terrainH(x,z)+2,z,'fume']);}
 if(STN.vent)for(let uu=FISS.a+40;uu<FISS.b-40;uu+=55){const p=fissPt(uu);if(coneAt(p[0],p[1]).k>.4)continue;em.push([p[0],terrainH(p[0],p[1])+.5,p[1],'fumarole']);}
 const fume=ATMOS.smoke(em);
 // ---- the fountain: clots of lava on ballistic arcs from the throat (no drag to speak of), shown by the cycle's k
 const FU={uK:{value:0}};
 const fountain3=(function(){const n=2200,pos=new Float32Array(n*3),pp=new Float32Array(n*4);
  for(let i=0;i<n;i++){pos.set([V.x,V.lavaY+2,V.z],i*3);pp.set([u(i,11),u(i,12),u(i,13)*TAU,55+55*Math.pow(u(i,14),.7)],i*4);}   /* phase, the share of k it shows at, azimuth, launch speed m/s */
  const m=new THREE.ShaderMaterial({uniforms:{time:ATMOS.U.time,px:ATMOS.U.px,uK:FU.uK},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false,
   vertexShader:'uniform float time;uniform float uK;attribute vec4 pp;varying float vA;varying vec3 vC;\n'+ATMOS.GLSL_QUAD+'\nvoid main(){'+
    'float on=step(pp.y,uK);float el=1.22+0.32*fract(pp.x*13.7);float v=pp.w;float T=2.0*v*sin(el)/9.81;float a=fract(time/T+pp.x);float t1=a*T;'+
    'vec3 p=ipos+vec3(cos(pp.z)*cos(el)*v*t1,v*sin(el)*t1-4.905*t1*t1,sin(pp.z)*cos(el)*v*t1);'+
    'vec4 mv=modelViewMatrix*vec4(p,1.0);float ps=clamp((1.4+2.6*fract(pp.x*7.1))*px/max(-mv.z,1.0),1.0,48.0)*on;'+
    'vC=mix(mix(vec3(1.0,0.92,0.55),vec3(1.0,0.45,0.08),smoothstep(0.05,0.45,a)),vec3(0.35,0.05,0.02),smoothstep(0.45,0.95,a));'+
    'vA=on*(1.0-smoothstep(0.88,1.0,a))*(0.55+0.45*uK);gl_Position=atmQuad(mv,ps);}',
   fragmentShader:'varying float vA;varying vec3 vC;varying vec2 vUv;void main(){float d=length(vUv-0.5);float a=(1.0-smoothstep(0.12,0.5,d))*vA;if(a<0.004)discard;gl_FragColor=vec4(vC*a*1.6,a);}'});
  const o=ATMOS.sprites('fountain',{ipos:[3,pos],pp:[4,pp]},m,5);if(o){o.userData.probeSkip=true;o.userData.inspectLabel=fountain.name;}return o;})();
 // the cycle's segments, as KHAZ builds them (core/hazard 20, cycleState), so the page draws the state the hazard doses by
 const idle=C.period-C.warn-2*C.ramp-C.on-C.after,SEGS=[['warn',C.warn,0,0],['rising',C.ramp,0,1],['on',C.on,1,1],['falling',C.ramp,1,0],['after',C.after,C.afterK,C.afterK],['idle',idle,0,0]];
 const phase=t=>KTRAPS.cycle(SEGS,t,C.offset);
 tick(()=>{const q=phase(ATMOS.clock.t),k=q?q.k:0;const s=FU.uK.value+(k-FU.uK.value)*.08;FU.uK.value=s;   /* eased, so the column builds and dies */
  if(LAVA&&LAVA.uniforms.uErupt)LAVA.uniforms.uErupt.value=Math.max(s,q&&q.state==='warn'?.3:0);});
 // ---- the crack's glow at night, every 9 m along it (off where it runs into a cone: the cones climbed over it)
 if(STN.vent){for(let uu=FISS.a+30;uu<=FISS.b-30;uu+=9){const p=fissPt(uu),F=fissAt(p[0],p[1]);if(coneAt(p[0],p[1]).k>.2||F.crack<.5)continue;
   ATMOS.glowAdd(p[0],terrainH(p[0],p[1])+2.5,p[1],[1,.38,.1],11+4*u(Math.round(uu),3),-1,30);glows++;}
  ATMOS.glowAdd(V.x,V.lavaY+4,V.z,[1,.45,.12],46,0,30);}   /* the throat lights its crater's walls, day and night */
 ATMOS.finish();
 // ---- the air and the cold (core/hazard's ambient bridge): the sky's pressure by height; the temperature, the summit's held
 // mean (4.23: about -75 C above 17 km; the ground's is the sun's, not the air's: PLAN.md section 1) swinging with the sun
 if(ATMOS.provideAir)ATMOS.provideAir(SKY.preset||SKY.P||{air:{pressure:1.6,thin:{y0:0,scale:8000}}});
 else KHAZ.provide('pressure',(x,y,z)=>AIR.at(y));
 KHAZ.provide('temperature',(x,y,z)=>{const s=SKY.state&&SKY.state.sunDir,e=s?(s.y==null?s[1]:s.y):0;return -75+22*clamp(e*2.2,-1,1);});
 // jump the clock to the next fountain (the Fountain button and view): the module clock moves, so the hazard and the page agree
 const nextFountain=()=>{const t=ATMOS.clock.t,L=C.period,lead=C.warn+C.ramp+8,u0=t+C.offset,u1=Math.ceil((u0-lead)/L)*L+lead;ATMOS.clock.t=t+(u1-u0);};
 return{fountain,throat,crater,ramp,fum,lava,LAVA,fume,fountain3,FU,phase,nextFountain,glows,emitters:em.length};})();
