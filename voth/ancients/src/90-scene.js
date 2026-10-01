// ---------------------------------------------------------------- scene
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xd8a070);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00022);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,12000);
// The three lights and the sky are held in named consts because setNight()
// in 92-camera.js swings all four between day and night. The sky's `u_n`
// uniform is the only shader change: 0 is the dust-and-haze day this kit has
// always had, 1 is the night it needs for firelight to mean anything.
const hemi=new THREE.HemisphereLight(0xffe2c4,0x6a3a2a,.75);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0dc,1.7);sun.position.set(-1200,900,600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc0d0ff,.35);fill.position.set(800,400,-900);scene.add(fill);
// sky dome
const skyMat=new THREE.ShaderMaterial({side:THREE.BackSide,fog:false,depthWrite:false,uniforms:{u_n:{value:0}},
 vertexShader:'varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform float u_n;varying vec3 vP;void main(){float h=clamp(normalize(vP).y,-.05,1.);vec3 hz=mix(vec3(.86,.62,.42),vec3(.085,.075,.105),u_n);vec3 zen=mix(vec3(.36,.46,.66),vec3(.014,.018,.040),u_n);vec3 c=mix(hz,zen,pow(h,.55));gl_FragColor=vec4(c,1.);}'});
const sky=new THREE.Mesh(new THREE.SphereGeometry(9000,32,16),skyMat);sky.userData.probeSkip=true;scene.add(sky);
// the gas giant, low in the north-east (Krator canon: altitude 25°, azimuth 66°)
const giantTex=canvasTex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const grd=g.createRadialGradient(256,256,0,256,256,256);
 for(let i=0;i<=20;i++){const t=i/20;const b=.8+.2*Math.sin(i*2.1);grd.addColorStop(t*.96,`rgba(${220*b|0},${180*b|0},${150*b|0},${.85*(1-Math.pow(t,6))})`);}
 grd.addColorStop(1,'rgba(220,180,150,0)');g.fillStyle=grd;g.beginPath();g.arc(256,256,250,0,TAU);g.fill();
 g.globalCompositeOperation='source-atop';for(let y=0;y<h;y+=9){g.fillStyle=`rgba(${120+(y*7)%80},${90+(y*3)%50},${70},${.10+.10*Math.sin(y*.3)})`;g.fillRect(0,y,w,5);}});
giantTex.wrapS=giantTex.wrapT=THREE.ClampToEdgeWrapping;
const giant=new THREE.Sprite(new THREE.SpriteMaterial({map:giantTex,fog:false,transparent:true,depthWrite:false}));giant.scale.set(2400,2400,1);giant.userData.probeSkip=true;scene.add(giant);
const giantDir=new THREE.Vector3(Math.sin(66*Math.PI/180)*Math.cos(25*Math.PI/180),Math.sin(25*Math.PI/180),-Math.cos(66*Math.PI/180)*Math.cos(25*Math.PI/180));

// ground: red Tharnish soil, greener where the ruins stand
(function paintGround(){const c=TEX.ground.image,g=c.getContext('2d'),w=c.width,h=c.height;const id=g.getImageData(0,0,w,h),d=id.data;const S=40000;
 const ruins=RUINS.map(s=>[(s[0]/S+.5)*w,((s[1]-GROUND_C)/S+.5)*h,s[2]*w/S]);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const n=fbm(x/30,y/30,.3,2),n2=fbm(x/5,y/5,7,1),n3=fbm(x/12,y/12,3,1);
  let r=150+(n-.5)*70+(n2-.5)*20,gg=82+(n-.5)*40+(n2-.5)*12,b=58+(n-.5)*30;
  let gr=0;for(const R of ruins){const dx=x-R[0],dy=y-R[1];const dd=Math.sqrt(dx*dx+dy*dy)/R[2];gr=Math.max(gr,clamp(1.1-dd,0,1)*clamp((n3-.35)*2.5,0,1));}
  r=lerp(r,70+n2*30,gr);gg=lerp(gg,110+n2*40,gr);b=lerp(b,45,gr);d[i]=r;d[i+1]=gg;d[i+2]=b;d[i+3]=255;}
 g.putImageData(id,0,0);TEX.ground.needsUpdate=true;})();
const groundM=new THREE.Mesh(new THREE.PlaneGeometry(40000,40000),MAT.ground);groundM.rotation.x=-Math.PI/2;groundM.position.set(0,-.05,GROUND_C);groundM.userData.probeSkip=true;scene.add(groundM);

// A target may add builders of its own by declaring EXTRA_BUILDERS in its
// 89z-rows.js fragment, so new work can live entirely in its own target and
// its own new src/ fragment without editing this file.
const BUILDERS=Object.assign({},typeof EXTRA_BUILDERS!=='undefined'?EXTRA_BUILDERS:{},{skyA:buildSkyA,skyB:buildSkyB,skyC:buildSkyC,mega:buildMega,fac:buildFactory,port:buildStarport,gov:buildGovernment,lib:buildLibrary,bunk:buildBunker,off:buildOffices,apt:buildApartments,amph:buildAmphitheater,fuel:buildFuelStation,radar:buildRadarTower,dish:buildDish,house:buildHouses,lab:buildLab,house2:buildHouses2,skyD:buildSkyD,skyE:buildSkyE,skyF:buildSkyF,arc:buildArc,robo:buildRobotics,campus:buildCampus,skyG:buildSkyG,skyH:buildSkyH,dc:buildDataCenter,police:buildPolice,hosp:buildHospital,hotel:buildHotel,dam:buildDam});
// A target may choose which decay levels it shows by declaring DECAYS in its
// 89z-rows.js. 0 intact, 1 ruined, 2 toppled, 3 repaired, 4 rehabilitated and
// STILL STANDING ("The Project"). Level 3 is a whole showcase of its own, so it
// gets its own target rather than a third variant crowding the row — see the
// measured numbers at the head of targets/kit/89z-rows.js.
//
// A single ROW may override the target's decay list with `ds`, and that is how
// one type gets a variant nobody else has: The Project is skyA `ds:[0,1,2,4]`,
// so no other builder is ever called with 4. `j` is its x, the way `t` is the
// toppled x.
const SITEX=(R,d)=>d===0?-R.s:d===1?R.s:d===2?R.t:d===4?R.j:0;
for(const k in ROWS){const R=ROWS[k];
 for(const d of (R.ds||(typeof DECAYS!=='undefined'?DECAYS:[0,1,2]))){if(d===2&&!R.t)continue;if(d===4&&R.j==null)continue;
 TSTAT.cur=k+'/'+d;const _r0=REG.length,_x=SITEX(R,d);
 HOLES=(d>=3)?.55:1;             // rehabilitated: the fabric is only part-eaten
 let _G=null;
 try{_G=BUILDERS[k](scene,_x,R.z,d);}catch(e){reportErr(k+' d='+d+' '+e.stack);}
 HOLES=1;
 // The repaired dressing runs on the group the builder returned, so it reaches
 // every type without a builder knowing level 3 exists.
 if(d>=3&&_G){KOFF=[_x,0,R.z];try{repairPass(_G,d);}catch(e){reportErr(k+' repair '+e.stack);}KOFF=[0,0,0];}
 for(let i=_r0;i<REG.length;i++)REG[i].type=k;           // so --assert can name the owner of an empty volume
 TSTAT.cur=null;}}
window._registered=REG.length;
kbake(scene);

