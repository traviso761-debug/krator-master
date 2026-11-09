// ================================================================= HOST — renderer, light, the ground's height, what a page needs before the ground  [web]
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=a.map(String).join(' ');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+((m.match(/ERROR:[^\n]*/g)||[m.slice(0,200)]).slice(0,4).join(' | ')));}catch(e){}_ce.apply(console,a);};}
const TICKS=[];function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xbcc6cc,.00012);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,14000);
const hemi=new THREE.HemisphereLight(0xc4d4e0,0x56524a,.7);scene.add(hemi);
const SUN_POS=[-900,1000,700];
const sun=new THREE.DirectionalLight(0xfff0d8,1.5);sun.position.set(...SUN_POS);scene.add(sun);
/* the ground: a plain with a gentle relief (KRAND's fbm, a few metres over a few hundred) and a dip under the highway's middle, so its piers
   stand tall there and its ramps have something to come down from; a test bed, not a place. The valley's ground comes with the valley */
const TR_SEED=4417;
/* THE EARTHQUAKE (the owner, 2026-11-08): a fault across the west of the page, its east side lifted 3 m and carried 5 m along it, the land twisted
   and buckled beside it; it crosses the avenue, the cargo line, the highway and the passenger line. THE KNOLL: a 10 m hill on the cargo line and the
   avenue's west, so a cutting and an embankment show (the owner: adapt to the slopes and heights) */
const TR_QUAKE=KTRANSIT.quake({id:'q1',pts:[[-900,-1750],[-500,0],[-650,1750]],throw:3,width:6,slip:5,twist:0.05,buckle:{amp:0.8,wavelength:32,reach:90,seed:7}});
const TR_SHIFT=(x,z)=>KTRANSIT.quakeShift(TR_QUAKE,x,z);
const TR_RELIEF0=(x,z)=>{const r=(KRAND.fbm(x/380+9,0,z/380+4,3,TR_SEED)-.5)*7,d=Math.hypot(x-300,z+470)/320,dip=d<1?-7*(1-d*d)*(1-d*d):0,k=Math.hypot(x+900,z+120)/240,knoll=k<1?10*(1-k*k)*(1-k*k):0;return r+dip+knoll;};
const TR_RELIEF=(x,z)=>TR_RELIEF0(x,z)+KTRANSIT.quakeH(TR_QUAKE,x,z);
/* THE SUBWAY (the owner, 2026-11-08): its records come before the ground, because where its roof fell in the ground is carved into a sinkhole
   that opens onto the tunnel (KTRANSIT.sinkholeH). A north-south line east of the side street st1, two stations, one of them fallen in */
const TR_SUBWAY=KTRANSIT.subway([[-120,-1750],[-120,-700],[-60,-250],[-60,1750]],{id:'sw',ground:TR_RELIEF,stations:[900,2500],stationStates:['ruined','collapsed'],seed:4471});
/* THE STREETS AND THEIR WAR (the owner, 2026-11-08: "various levels of cratering and strewn wreckage ... along the roads"): the avenue from a riot at
   its west end to bombed to smithereens at its east (damage 0.1 to 1 along it); the first side street shelled with military positions (a checkpoint
   at the avenue); the second a riot with a checkpoint. The craters carve the ground, so the records come before it */
const TR_STREETS=[{id:'avenue',pts:[[-1500,0],[1500,0]],width:26,shift:TR_SHIFT},{id:'st1',pts:[[-300,-900],[-300,900]],width:11,shift:TR_SHIFT},{id:'st2',pts:[[400,-900],[400,900]],width:11,shift:TR_SHIFT}];
/* the roads: graded alignments (8%), cut into the knoll and filled over the dips; the streets' pieces stand at the road's level */
const TR_ROADS=TR_STREETS.map((st,i)=>KTRANSIT.road(st.pts,{id:st.id,ground:TR_RELIEF,width:st.width,shift:TR_SHIFT,maxGrade:0.08,drift:i===2?(s=>s<900?0.7:0.15):0,pavement:3.5}));
TR_STREETS.forEach((st,i)=>{st.ground=TR_ROADS[i].levelAt;});
const TR_WAR=TR_STREETS.map((st,i)=>KTRANSIT.war(st,i===0?{damage:s=>0.1+0.9*s/3000,seed:901}:i===1?{damage:0.5,military:true,positions:[900],seed:902}:{damage:0.18,military:0.5,positions:[900],seed:903}));
/* the cargo line too comes before the ground: its cutting through the knoll is carved */
const TR_CARGO=KTRANSIT.rail([[-1750,-150],[650,-150],[1750,-900]],{id:'cargo',ground:TR_RELIEF,streets:TR_STREETS.slice(1),catenary:true,shift:TR_SHIFT,quake:TR_QUAKE});
const terrainH=(x,z)=>{let h=TR_RELIEF(x,z)+KTRANSIT.sinkholeH(TR_SUBWAY,x,z);for(let i=0;i<TR_WAR.length;i++)h+=KTRANSIT.craterH(TR_WAR[i],x,z);for(let i=0;i<TR_ROADS.length;i++)h+=KTRANSIT.lineH(TR_ROADS[i],x,z);h+=KTRANSIT.lineH(TR_CARGO,x,z,{form:0.45});return h;},waterH=()=>-1e6;
/* everything carved: where the ground mesh refines itself (47): the subway's holes, the craters, the fault's line, the cuttings */
const TR_CARVED=[].concat(KTRANSIT.carved(TR_SUBWAY),...TR_WAR.map(W=>W.craters.map(c=>({x:c.x,z:c.z,r:c.r}))));
for(let s=0;s<TR_QUAKE.L;s+=18){const p=TR_QUAKE.path.at(s);TR_CARVED.push({x:p.x,z:p.z,r:12,k:8});}
/* the graded lines: refined along their whole length (a cutting's edge, an embankment's foot and a drift are all finer than a coarse cell) */
[].concat(TR_ROADS,[TR_CARGO]).forEach(L=>{for(let s=0;s<L.L;s+=16){const p=L.path.at(s);TR_CARVED.push({x:p.x,z:p.z,r:L.width/2+(L.pavement==null?0:L.pavement)+10});}});
