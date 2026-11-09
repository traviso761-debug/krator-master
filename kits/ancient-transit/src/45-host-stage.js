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
/* THE ROAD NETWORK (the owner, 2026-11-09: junctions of 2, 3, 4 and 6 arms; smaller paved streets): the avenue and the two side streets (crosses), a
   street ending on the avenue (a T), two small streets meeting end to end (a corner), two diagonal streets through one point of the avenue (six
   arms). Each road a graded alignment (8%), cut into the knoll and filled over the dips, pinned to one level at each junction; the streets' pieces
   stand at the road's level. The second side street lies under drifts of sand along its south half */
const TR_DEFS=[{id:'avenue',pts:[[-1500,0],[1500,0]],kind:'avenue'},{id:'st1',pts:[[-300,-900],[-300,900]],kind:'road'},{id:'st2',pts:[[400,-900],[400,900]],kind:'road',drift:s=>s<900?0.7:0.15},
 {id:'tee',pts:[[-100,0],[-100,620]],kind:'street'},{id:'c1',pts:[[-700,180],[-700,560]],kind:'street'},{id:'c2',pts:[[-700,560],[-420,560]],kind:'lane'},
 {id:'d1',pts:[[600,-400],[1000,400]],kind:'street'},{id:'d2',pts:[[1000,-400],[600,400]],kind:'street'},{id:'rs',pts:[[-1020,-700],[-1020,-250]],kind:'street'}];
/* what the roads' surfaces dip into: the sinkholes and the craters (the war is built after the roads, on their surfaces, so it is read when called) */
let TR_WAR=[];const TR_CARVE=(x,z)=>{let h=KTRANSIT.sinkholeH(TR_SUBWAY,x,z);if(TR_WAR)for(let i=0;i<TR_WAR.length;i++)h+=Math.min(0,KTRANSIT.craterH(TR_WAR[i],x,z));return h;};
const TR_NET=KTRANSIT.network(TR_DEFS,{ground:TR_RELIEF,shift:TR_SHIFT,carve:TR_CARVE});
const TR_ROADS=TR_NET.roads;
const TR_STREETS=TR_DEFS.map((d,i)=>({id:d.id,pts:d.pts,width:TR_ROADS[i].width,pavement:TR_ROADS[i].pavement,shift:TR_SHIFT,ground:TR_ROADS[i].levelAt}));
/* THE WAR on each: the avenue from a riot to smithereens with a barricade of wrecks at its east; the first side street shelled, military, barricaded;
   the second a riot with a checkpoint (at the avenue's junction: just short of its cut); the small streets a riot, one of the diagonals with a position or two.
   Every war keeps its pieces off the junctions (network, road) */
const TR_WAR_O=[{damage:s=>0.1+0.9*s/3000,seed:901,blockades:[1560]},{damage:0.5,military:true,positions:[860],blockades:true,seed:902},{damage:0.18,military:0.5,positions:[860],seed:903},
 {damage:0.22,seed:904},{damage:0.15,seed:905},{damage:0.15,seed:906},{damage:0.3,military:0.5,seed:907},{damage:0.3,seed:908},{damage:0.2,seed:909}];
/* the cargo line too comes before the ground: its cutting through the knoll is carved */
const TR_CARGO=KTRANSIT.rail([[-1750,-150],[650,-150],[1750,-900]],{id:'cargo',ground:TR_RELIEF,streets:TR_STREETS.slice(1),catenary:true,shift:TR_SHIFT,quake:TR_QUAKE});
const terrainH=(x,z)=>{let h=TR_RELIEF(x,z)+KTRANSIT.sinkholeH(TR_SUBWAY,x,z);for(let i=0;i<TR_WAR.length;i++)h+=KTRANSIT.craterH(TR_WAR[i],x,z);for(let i=0;i<TR_ROADS.length;i++)h+=KTRANSIT.lineH(TR_ROADS[i],x,z);h+=KTRANSIT.lineH(TR_CARGO,x,z,{form:0.45});return h;},waterH=()=>-1e6;
/* THE HIGHWAY is built here, with the data, not on the stage: its ramps' landing roads JOIN the network (KTRANSIT.joinRamps: the off ramp's lands on
   the street rs, a T; the on ramp's ends beside st2 and is carried to it, a T), so those junctions exist before the wars and the dress. The wars
   come after it (a crater is carved only once the war exists; the deck clears the ground without them) */
const TR_H=KTRANSIT.highway([[-1750,-560],[-700,-560],[250,-360],[1750,-360]],{id:'h1',ground:terrainH,ramps:[{s:520,side:-1,dir:'off'},{s:2480,side:-1,dir:'on'}],shift:TR_SHIFT,quake:TR_QUAKE,blockades:[1700]});
const TR_RAMP_ROADS=KTRANSIT.joinRamps(TR_NET,TR_H);
TR_WAR=TR_STREETS.map((st,i)=>KTRANSIT.war(st,Object.assign({network:TR_NET,road:i},TR_WAR_O[i])));
/* everything carved: where the ground mesh refines itself (47): the subway's holes, the craters, the fault's line, the cuttings */
const TR_CARVED=[].concat(KTRANSIT.carved(TR_SUBWAY),...TR_WAR.map(W=>W.craters.map(c=>({x:c.x,z:c.z,r:c.r}))));
for(let s=0;s<TR_QUAKE.L;s+=18){const p=TR_QUAKE.path.at(s);TR_CARVED.push({x:p.x,z:p.z,r:12,k:8});}
/* the graded lines: refined where they CUT the ground (a cutting's edge and its slopes are finer than a coarse cell); a line at grade or on a fill
   changes no ground (the owner, 2026-11-09, triangles: refining every road's whole length cost 0.8 M) */
[].concat(TR_ROADS,[TR_CARGO]).forEach(L=>{const half=L.width/2+(L.pavement==null?0:L.pavement)+1,fo=L===TR_CARGO?{form:0.45}:undefined;for(let s=0;s<L.L;s+=16){const p=L.path.at(s),cx=Math.cos(p.yaw),sz=-Math.sin(p.yaw);let cut=0;[-half,0,half].forEach(o=>{cut=Math.min(cut,KTRANSIT.lineH(L,p.x+cx*o,p.z+sz*o,fo));});if(cut<-0.15)TR_CARVED.push({x:p.x,z:p.z,r:half+(-cut)*2+5});}});
