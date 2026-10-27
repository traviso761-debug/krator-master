// ================================================================= HOST — stage: station 4, the pillar rim (PLAN.md section 7)
// Span's tableland breaking down on its south-west edge (refs/01): the table's top (`pillar` sandstone, y ~270) in the north, its
// joints opening into slots toward the rim, a cliff, then free-standing towers 200-300 m tall in a band beyond it (KSTACKS.pillars
// in 47-host-land.js, from the same joints and zone), and the green floor (y ~0) with Pan Riba meandering across it.
// The map: x east, z SOUTH, 3.2 km square, y 0 at ALT0 m above the sea. Every noise is KRAND's, every form core/terrain's.
// THIS STATION IS THE BIOME ONLY (the owner, 2026-10-27): it reads nothing of settlements/span (the arcology, its frame, its
// records). What a settlement may build on is published by this station as plain data (SWHI_PILLARS_SITE, 47-host-land.js;
// BIOME-API.md "Station 4's site"); the station reserves the watch pillar's top for one and draws nothing of it.
const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.06;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xb8c8d0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,48000);
const hemi=new THREE.HemisphereLight(0xc8d8e4,0x4e4a3e,.66);scene.add(hemi);
const SUN_POS=[-700,1200,-900];
const sun=new THREE.DirectionalLight(0xfff0dc,1.45);sun.position.set(SUN_POS[0],SUN_POS[1],SUN_POS[2]);scene.add(sun);
const fill=new THREE.DirectionalLight(0xa8c4d0,.28);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the map
const ALT0=2340,WORLD=8821;
const TERR={R:1600,X0:-1600,X1:1600,Z0:-1600,Z1:1600};
const NZ=(x,z,f,seed,o)=>KRAND.fbm(x*f+.31,.57,z*f-.13,o||3,seed)-.5;
const TOP=270;   /* the table's top over the floor (m): the towers' height where they stand whole */
// THE RIM: the line where the table ends (zone .3), wandering east-west; the zone runs 0 (deep in the table) .. .3 (the rim)
// .. .9 (the last towers, BAND m beyond it) .. 1 (the open floor)
const BAND=430;
function rimZ(x){return -520+200*Math.sin(x*.0011+.3)+80*NZ(x,0,.0024,81,2);}
function zone(x,z){const d=z-rimZ(x);return d<0?clamp(.3+d/1800,0,.3):clamp(.3+.6*d/BAND,0,1);}
const JOINTS=KRELIEF.joints({world:WORLD,angle:.32,sp:[64,130]});
function tableTop(x,z){return TOP+8*NZ(x,z,.0016,82,2)+2*NZ(x,z,.02,83,2);}
// THE TOWERS' PLAN (the owner's references, 2026-10-27: Canyon de Chelly's Spider Rock and its fins): a tower in a block of the band
// by the block's own draw (two in five, fewer toward the band's end), narrowed across its long side to a fin or a spire, a third
// broken lower; laid out here, before the ground, so the ground can pile its talus round each foot (47-host-land.js makes the bodies
// with KSTACKS.make, the same rule as KSTACKS.pillars with the fin's narrowing added). WATCH_AT: the watch pillar's place, kept whole
const WATCH_AT={x:260,z:rimZ(260)+BAND*.42,w:62,l:60};
const TOWER_PLAN=JOINTS.blocks([TERR.X0+40,TERR.Z0+40,TERR.X1-40,TERR.Z1-40]).map(B=>{const zz=zone(B.cx,B.cz);if(zz<.3||zz>=.9)return null;
 const t=(zz-.3)/.6,s=KRAND.stream(KRAND.hash(WORLD,B.i,B.j,0x91)),stand=s.next()<(1-.75*Math.pow(t,1.5))*.42,gp=.15+.5*t,brk=s.next(),fin=s.range(.3,.62),spire=s.next()<.3;
 if(!stand||Math.hypot(B.cx-WATCH_AT.x,B.cz-WATCH_AT.z)<95)return null;
 const long=B.w>B.l,w=B.w*(1-gp)*(long?1:fin)*(spire?.7:1),l=B.l*(1-gp)*(long?fin:1)*(spire?.7:1);if(Math.min(w,l)<12)return null;
 return{id:'pillar:'+B.id,i:B.i,j:B.j,x:B.cx,z:B.cz,w,l,ry:B.ry,brk:brk<.35?brk/.35*.6*t:0,spire,seed:KRAND.hash(WORLD,B.i,B.j,0x92)};}).filter(Boolean);
// the talus round a tower's foot: a cone of fallen blocks and sand, highest at the wall (~16 m), out ~30 m
function talusAt(x,z){let h=0;for(const P of TOWER_PLAN.concat([WATCH_AT])){const dx=x-P.x,dz=z-P.z;if(Math.abs(dx)>110||Math.abs(dz)>110)continue;
 const r=Math.max(P.w,P.l)*.5,d=Math.hypot(dx,dz)-r*.75;h=Math.max(h,16*Math.exp(-Math.max(0,d)/24)*(1+.25*NZ(x,z,.04,87,2)));}return h;}
// the floor: low hummocks, a talus apron at the cliff's foot and round each tower, falling a little toward Pan Riba
function floor0(x,z){const d=z-rimZ(x);return 6*NZ(x,z,.0028,84,3)+1.5*NZ(x,z,.015,85,2)-.012*Math.max(0,d-200)+34*Math.exp(-Math.max(0,d)/38)*smooth(-10,0,d)+talusAt(x,z);}
const TABLE=KRELIEF.tableland({joints:JOINTS,zone,top:tableTop,floor:floor0,z0:.3,edge:.012,slot:{w:2.2,grow:3.4,depth:.45}});

// ---------------------------------------------------------------- Pan Riba (the river across the floor)
// From the map's west edge to its east, out on the floor beyond the towers, meandering (KRELIEF.meander); its level from
// KRELIEF.river on the floor (never climbing); the channel carved under it
const PAN=(function(){const pts=KRELIEF.meander([TERR.X0-80,560],[TERR.X1+80,720],{amp:140,wave:820,seed:WORLD+3}).map(p=>[p[0],p[1]]);
 const lv=KRELIEF.river(pts,(x,z)=>TABLE(x,z),{depth:1.2,sample:20}),C={key:'river',name:'Pan Riba',pts,y:lv.map(p=>p.y),slope:lv.map(p=>p.slope),w:[8,11],dep:1.2,speed:1.1};
 C.S=[0];for(let i=1;i<pts.length;i++)C.S.push(C.S[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));C.LEN=C.S[C.S.length-1];
 C.halfW=i=>mix(C.w[0],C.w[1],C.S[i]/C.LEN);return C;})();
const COURSES=[PAN];
const SEGIX=(function(){const S=KSPACE.create({cell:40});for(let i=0;i<PAN.pts.length-1;i++){const a=PAN.pts[i],b=PAN.pts[i+1];S.insert({i},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+PAN.w[1]+40);}return S;})();
const _sq=[];
function streamNear(x,z){SEGIX.query(x,z,0,_sq);let best=null;
 for(const q of _sq){const a=PAN.pts[q.i],b=PAN.pts[q.i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),px=a[0]+dx*t-x,pz=a[1]+dz*t-z,d=Math.hypot(px,pz);
  if(!best||d-PAN.halfW(q.i)<best.dd)best={C:PAN,i:q.i,f:t,d,dd:d-PAN.halfW(q.i),w:PAN.halfW(q.i),y:mix(PAN.y[q.i],PAN.y[q.i+1],t)};}
 return best;}
function groundH0(x,z){const g=TABLE(x,z),r=streamNear(x,z);if(!r)return g;const w=r.w,t=Math.max(0,r.d-w);let h=g;
 if(r.d<w)h=Math.min(h,r.y-r.C.dep*(1-.55*(r.d/w)*(r.d/w))-.15);else{const bank=r.y+.35+t*.22+Math.max(0,t-5)*.9;if(bank<h)h=bank;}
 if(r.d<w+2.5)h=Math.min(h,r.y-.45);return h;}
// THE FIELD (core/terrain KFIELD): the ground baked once (6 m); the towers are rock bodies over it (47-host-land.js), not ground
const FIELD_BAKED=(function(){const t0=performance.now();const F=KFIELD.bake(groundH0,[TERR.X0-60,TERR.Z0-60,TERR.X1+60,TERR.Z1+60],6,{name:'swhighlands-pillars'});window._fieldMs=Math.round(performance.now()-t0);return F;})();
const groundH=FIELD_BAKED.sampler();
function waterH(x,z){const r=streamNear(x,z);return r&&r.d<r.w+2.5?r.y:-1e9;}
const FLOWS=[WATER.flow({name:PAN.name,pts:PAN.pts.map((p,i)=>[p[0],p[1],PAN.y[i]]),width:PAN.pts.map((p,i)=>2*(PAN.halfW(i)+2.5)),speed:PAN.pts.map((p,i)=>PAN.speed+3*smooth(.05,.6,PAN.slope[i]))})];
