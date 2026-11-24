// ================================================================= THE FLASHING EYE — the vent, the plume, and the house's fires by night
// The owner, 2026-11-16: the cone gets a vent, and it flashes (Strombolian bursts, red at night). Not yet on the scale model (step
// F0): drawn here on the crater's floor of FLASHING_EYE.ground. Everything moves on FE_WATCH (src/40-fe-watch.js, on core/sched and
// core/rand), so the page, the sim and Godot see the same bursts at the same times. [web]: three.js.
//   the vent     a glowing throat (its light rises with each burst) and a red point light over it that lights the plume's foot
//                and the crater's walls; each burst throws bombs, each on its own ballistic arc (KRAND by the burst and the
//                bomb), back into the crater
//   the plume    core/atmos's smoke sprites (ATMOS.smoke) with a 'vent' kind of this page's own (a column rising ~700 m and
//                drifting downwind); ATMOS.ashPlume records the same plume for the fog, the ash fall, core/hazard and Godot
//   the hazards  core/hazard records (gas round the vent fuming between bursts by cycle.base, heat on the floor, lava in the
//                throat), as data for the sim and Godot: the page does not take the hazard host yet
//   the night    the Hall of the Ember's north window and the Eye Post's fire basket lit by the hour; the basket's shutter beats
//                the watch's slots (FE_WATCH.state)
reseed(34465);
const FE_VENT={x:FE_CR[0],z:FE_CR[1]};FE_VENT.y=terrainH(FE_VENT.x,FE_VENT.z);
/* the page's clock: day FE_SKY.day at FE_SKY.hour, running from the page's start; _api.setTime(t) sets it (a verify shot) */
const FE_CLOCK={t0:FE_SKY.day*86400+FE_SKY.hour*3600,start:performance.now(),set:null};
const feNow=()=>FE_CLOCK.set!=null?FE_CLOCK.set:FE_CLOCK.t0+(performance.now()-FE_CLOCK.start)/1000;
// ---------------------------------------------------------------- the throat and its light
const feThroat=new THREE.Mesh(new THREE.CircleGeometry(FE.L.crater.ventR,24),new THREE.MeshBasicMaterial({color:0xff5a18,transparent:true,opacity:.9,fog:false}));
feThroat.rotation.x=-Math.PI/2;feThroat.position.set(FE_VENT.x,FE_VENT.y+.6,FE_VENT.z);feThroat.name='the vent\'s throat';feThroat.userData.probeSkip=true;scene.add(feThroat);
const feVentLight=new THREE.PointLight(0xff4a1a,0,700,2);feVentLight.position.set(FE_VENT.x,FE_VENT.y+60,FE_VENT.z);scene.add(feVentLight);
// ---------------------------------------------------------------- the bombs: a burst's ballistic arcs
const FE_BOMBS=90,feBombG=new THREE.BufferGeometry(),feBombP=new Float32Array(FE_BOMBS*3);
feBombG.setAttribute('position',new THREE.BufferAttribute(feBombP,3));
/* a round glowing sprite for each bomb (a radial gradient on a small canvas: drawn, never read back) */
const feBombTex=(function(){const c=document.createElement('canvas');c.width=c.height=32;const g=c.getContext('2d'),r=g.createRadialGradient(16,16,0,16,16,16);r.addColorStop(0,'rgba(255,240,200,1)');r.addColorStop(.35,'rgba(255,140,50,.9)');r.addColorStop(1,'rgba(255,60,10,0)');g.fillStyle=r;g.fillRect(0,0,32,32);const t=new THREE.CanvasTexture(c);return t;})();
const feBombs=new THREE.Points(feBombG,new THREE.PointsMaterial({map:feBombTex,color:0xffffff,size:5,alphaTest:.01,sizeAttenuation:true,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));
feBombs.frustumCulled=false;feBombs.name='the vent\'s bombs';feBombs.userData.probeSkip=true;scene.add(feBombs);
function feBombsAt(v){const s=v.since,on=s<14;feBombs.visible=on;if(!on)return 0;let n=0;
 for(let i=0;i<FE_BOMBS;i++){const h=k=>KRAND.unit(KRAND.hash(34466,v.index,i,k)),a=h(1)*Math.PI*2,up=45+50*h(2),out=4+26*h(3),dt=Math.max(0,s-h(4)*1.2);
  const y=FE_VENT.y+2+up*dt-4.9*dt*dt;if(y<FE_VENT.y-2||dt<=0){feBombP[i*3+1]=-1e5;continue;}
  feBombP[i*3]=FE_VENT.x+Math.cos(a)*out*dt;feBombP[i*3+1]=y;feBombP[i*3+2]=FE_VENT.z+Math.sin(a)*out*dt;n++;}
 feBombG.attributes.position.needsUpdate=true;return n;}
// ---------------------------------------------------------------- the plume: core/atmos's smoke with a 'vent' kind of the page's own
{const S=ATMOS.PRESETS.smoke,next=Math.max(...Object.keys(S).filter(k=>S[k]&&S[k].index!=null).map(k=>S[k].index))+1;
 if(!S.vent)S.vent={index:next,n:56,rate:.011,rise:720,drift:260,wobble:30,size:[26,190],alpha:.4,rainDamp:0,color:[.42,.4,.38]};
 S.distFade=.00011;S.pxMax=1400;   /* this page's: the plume is read from the bench, 2 km off */
 window._fePlumeSprites=ATMOS.smoke([[FE_VENT.x,FE_VENT.y+8,FE_VENT.z,'vent']]);}
/* the house's own smoke: the kitchen's chimneys (its hearth lit from the Ember) and the bath's steam (90fg's FE_SMOKES) */
window._feHouseSmoke=FE_SMOKES.length?ATMOS.smoke(FE_SMOKES):null;
/* the same plume as a record (core/atmos fx/ashplume): drifting east-north-east on the Vale's west wind, ~800 m tall */
const FE_PLUME=ATMOS.ashPlume?ATMOS.ashPlume({vents:[{id:'eye.vent',x:FE_VENT.x,z:FE_VENT.z,y:FE_VENT.y,top:800,rate:1}],azimuth:1.2,speed:8,world:'flashing-eye'}):null;
/* its ash fall on the ground: under(x, z) at every vertex of the three near ground meshes, an attribute the ground's shader lays
   the ash set by (90fe: feAF, up to .85); the far ground keeps none (its cells are 400 m). The deposit peaks some 6 km downwind,
   past the near ground, so its edge over the cone is shown six times over (about half the ash set at its strongest there) */
const FE_ASHFALL=(function(){if(!FE_PLUME||!FE_PLUME.under)return null;let n=0,mx=0;const v=new THREE.Vector3();
 for(const m of[groundM,feCoarse,feFootG]){const g=m.geometry,p=g.attributes.position,a=new Float32Array(p.count);m.updateMatrixWorld(true);
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);const u=Math.min(.85,FE_PLUME.under(v.x,v.z)*6);a[i]=u;if(u>.05)n++;if(u>mx)mx=u;}
  g.setAttribute('feAF',new THREE.BufferAttribute(a,1));}
 return{vertices:n,peak:+mx.toFixed(2)};})();
// ---------------------------------------------------------------- the hazards, as records (core/hazard's kinds: gas, heat, lava; cycle.base)
const FE_HAZ=[
 {id:'eye.vent.lava',kind:'lava',shape:{type:'circle',x:FE_VENT.x,z:FE_VENT.z,r:FE.L.crater.ventR},cycle:{period:900,base:.7}},
 {id:'eye.vent.gas',kind:'gas',shape:{type:'circle',x:FE_VENT.x,z:FE_VENT.z,r:FE.L.crater.r*.6},cycle:{period:900,base:.3},note:'fumes between the bursts: the veil of dread is for this'},
 {id:'eye.floor.heat',kind:'heat',shape:{type:'circle',x:FE_VENT.x,z:FE_VENT.z,r:FE.L.crater.r*.45}},
 {id:'eye.rim.bombs',kind:'heat',shape:{type:'ring',x:FE_VENT.x,z:FE_VENT.z,r0:FE.L.crater.r-40,r1:FE.L.crater.r+20},danger:.3,note:'a bomb now and then reaches the rim: the professed only'}];
/* and on core/hazard (KHAZ, its clock KTRAPS: kit.json): each registered in core/tags (KTAGS.page) as a feature carrying
   tags.hazard, so KHAZ.at / KTAGS.hazardAt answer what hurts a walker here and now. The lava, the gas and the bombs run on the
   vent's own bursts (KHAZ.STATES['FE_WATCH.vent']: on while a burst throws, k its amplitude, never below the record's base); the
   crater floor's heat is steady. Shapes are cylinders from the vent's level (core/hazard has no ring: the bombs' reach is the
   whole crater out past the rim) */
const FE_HAZREC=(function(){if(typeof KHAZ==='undefined'||typeof KTAGS==='undefined')return null;
 KHAZ.STATES['FE_WATCH.vent']=(rec,h,t)=>{const v=FE_WATCH.vent(t),b=(h.cycle&&h.cycle.base)||0;return{state:v.on?'on':'idle',k:Math.max(b,v.on?v.amp:0),on:v.on};};
 const T=KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'})),out=[];
 for(const H of FE_HAZ){const S=H.shape,r=S.r!=null?S.r:S.r1,burst=H.kind!=='heat'||H.id==='eye.rim.bombs';
  const hz={kind:H.kind,shape:{type:'cyl',r,h:H.kind==='gas'?140:80,y0:-30},stateFn:burst?'FE_WATCH.vent':null,
   cycle:burst?{period:900,warn:0,ramp:2,on:30,after:0,afterK:.3,offset:0,base:H.cycle?H.cycle.base:0}:null};
  if(H.danger!=null)hz.danger=H.danger;KHAZ.make(hz);   /* checked now, not at a walker's first question */
  out.push(T.add({prefix:'hz','class':'feature',kind:'hazard',name:H.note||H.id,at:[S.x,FE_VENT.y,S.z],tags:{hazard:hz},frag:'90fh-vent.js'}));}
 return out;})();
/* the fog in the plume: the page's fog (90fe: FogExp2 .000035) thickened by the plume record's density where the camera stands
   (ATMOS.ashPlume's fog: 1 in a column's core, about 250 m of sight there) and greyed toward the ash; the frame hook sets it */
const FE_FOG0=.000035,FE_ASHC=new THREE.Color(0x8a8580);
const feFogAt=(x,y,z)=>{const d=FE_PLUME&&FE_PLUME.fog?Math.min(1.5,FE_PLUME.fog(x,y,z)):0;return{density:FE_FOG0+.004*d,grey:Math.min(.85,d)};};
// ---------------------------------------------------------------- the house's fires by night
const feEmberL=new THREE.PointLight(0xff7a30,0,40,2),feFireL=new THREE.PointLight(0xff8a3a,0,60,2);scene.add(feEmberL);scene.add(feFireL);
{const e=FE_LAMPS.find(l=>l[3]==='ember'),f=FE_LAMPS.find(l=>l[3]==='fire');if(e)feEmberL.position.set(e[0],e[1],e[2]);if(f)feFireL.position.set(f[0],f[1]+1,f[2]);}
const FE_ENV={day:t=>{const h=((t%86400)+86400)%86400/3600;return h>=6.2&&h<18.4;}};
// ---------------------------------------------------------------- the mirrors by day: a glint at each lantern while the day line's
// shutter is open (FE_WATCH.state: the Opening at sunrise, the station slots on the hour), the sun's colour, seen from kilometres
const feGlintTex=(function(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
 r.addColorStop(0,'rgba(255,255,245,1)');r.addColorStop(.18,'rgba(255,244,200,.9)');r.addColorStop(.5,'rgba(255,220,140,.25)');r.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=r;g.fillRect(0,0,64,64);
 g.fillStyle='rgba(255,250,230,.5)';g.fillRect(0,31,64,2);g.fillRect(31,0,2,64);return new THREE.CanvasTexture(c);})();
const FE_GLINTS=[['post',14.2,3.9],['tw.mirror',28.7,4.6]].map(([id,dy,dz])=>{const p=FE_PLACE.find(q=>q.id===id);if(!p)return null;
 const s=new THREE.Sprite(new THREE.SpriteMaterial({map:feGlintTex,color:0xfff4d0,blending:THREE.AdditiveBlending,transparent:true,depthWrite:false,fog:false}));
 s.position.set(p.x,p.o.y+dy,p.z+dz);   /* at the lantern's open front, where the mirrors stand */s.scale.set(7,7,1);s.visible=false;s.name='the mirror\'s glint ('+id+')';s.userData.probeSkip=true;scene.add(s);return s;}).filter(Boolean);
/* how much of a mirror's flash a viewer at (cx, cz) catches: the sun is thrown along the line to the station it sends to (its
   bearing, degrees: +x east, +z south), so the full flash only within a few degrees of that line (1 on it, a half at 5 degrees);
   anyone else sees only the mirror's face catching the light (the sprite's floor, 90fh's hook) */
const feBeam=(gx,gz,cx,cz,bearing)=>{const b=(bearing==null?245:bearing)*Math.PI/180,dx=cx-gx,dz=cz-gz,dl=Math.hypot(dx,dz)||1;
 const ang=Math.acos(Math.max(-1,Math.min(1,(dx*Math.sin(b)-dz*Math.cos(b))/dl)))*180/Math.PI;return Math.exp(-Math.pow(ang/6,2));};
let feLast=null;
FRAME_HOOKS.push(()=>{const t=feNow(),v=FE_WATCH.vent(t),night=1-(FE_SKY.dayF==null?1:FE_SKY.dayF),st=FE_WATCH.state(t,FE_ENV);
 const glow=.35+.65*v.amp;feThroat.material.color.setRGB(1,.25+.25*v.amp,.06).multiplyScalar(.6+.9*glow);
 feVentLight.intensity=(.1+.9*night)*(.25+1.6*v.amp);
 const nb=feBombsAt(v);
 MAT.feEmber.emissiveIntensity=.2+2.4*night;feEmberL.intensity=night*1.4;
 const open=st.mode==='basket'?(st.shutter?1:.08):st.mode==='watch'&&night>.5?.08:0;MAT.feFire.emissiveIntensity=.15+3*night*open;feFireL.intensity=night*2.2*open;
 /* the glint is the sun thrown along the line: a viewer in the beam toward the station the mirror sends to (st.bearing; +x east,
    +z south) sees the full flash, within a few degrees of it; anyone else only the mirror's face catching the light */
 {const F=feFogAt(camera.position.x,camera.position.y,camera.position.z);scene.fog.density=F.density;if(F.grey>.001)scene.fog.color.lerp(FE_ASHC,F.grey);}
 const glint=(st.mode==='mirror'||st.mode==='opening')&&st.shutter;
 for(const g of FE_GLINTS){g.visible=glint;if(!glint)continue;const beam=feBeam(g.position.x,g.position.z,camera.position.x,camera.position.z,st.bearing);
  g.material.opacity=(.14+.86*beam)*(.85+.15*Math.sin(t*9));const sc=2.2+6.8*beam;g.scale.set(sc,sc,1);g.userData.beam=+beam.toFixed(3);}
 feLast={t,vent:{amp:+v.amp.toFixed(3),on:v.on,index:v.index,next:+v.next.toFixed(1)},bombs:nb,mode:st.mode,station:st.station,shutter:st.shutter,watch:st.watch.watch,glint};});
/* the page's hooks (91z puts them on _api, which Xanadu's host makes after this fragment): set the clock, jump to a burst */
const FE_API={setTime:t=>{FE_CLOCK.set=t;},burst:(k,s)=>{const b=FE_WATCH.bursts(FE_CLOCK.t0,FE_CLOCK.t0+3*3600)[k==null?0:k];FE_CLOCK.set=b+(s==null?1.5:s);return b;},vent:()=>feLast,
 /* the clock 1.25 s into the k-th station's slot of the day line, at the next hour that is day (a flash of its call sign) */
 signal:k=>{let h=Math.floor(FE_CLOCK.t0/3600)+1;while(!FE_ENV.day(h*3600+60))h++;FE_CLOCK.set=h*3600+(k==null?0:k)*FE_WATCH.SLOT+1.25;return FE_CLOCK.set;}};
window._feVent={ashfall:FE_ASHFALL,x:+FE_VENT.x.toFixed(1),z:+FE_VENT.z.toFixed(1),y:+FE_VENT.y.toFixed(1),hazards:FE_HAZ.length,plume:!!FE_PLUME,sprites:!!window._fePlumeSprites,
 rim:+terrainH(FE_CR[0],FE_CR[1]+FE.L.crater.r).toFixed(1),bursts3h:FE_WATCH.bursts(FE_CLOCK.t0,FE_CLOCK.t0+3*3600).length};
