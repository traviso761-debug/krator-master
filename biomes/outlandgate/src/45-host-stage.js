// ================================================================= HOST — stage: STATION 1, THE NARROWS AND THE GATE (PLAN.md section 7)
// The ideal-type host for the Outland Gate's first station: renderer, lights, the land with terrainH(), the river's waterH(), the fields the
// kit reads, the tick list, the registry, the error panel. A real world replaces this whole section with its own.
//
// THE SITE: the gap's Narrows on map 5.1, px 1438,326: the floor at 1,423 m, 1.34 atm, Cfa, 988 mm, 19 °C (29 / 8; 37 / 0). The floor within
// 300 m of the river is ~30 km wide here (PLAN.md section 5), so the whole page is FLOOR: it rises ~45 m in the 4 km either side of the
// river (the model's row 326: 1,467 m 4 km west, 1,446 m 4 km east); the walls climb to 4-5 km 48-54 km out and to 10-14 km beyond. Those are
// the far field, on THE MODEL'S OWN HEIGHTS (44f-og-far-data.js, tools/far_grid.py). The page keeps the true heights; nothing is compressed.
// THE RIVER: Hau-Gel (`id 9106`), ~470 m3/s here, on the model's own line through the Narrows (px 1438.6,327 to 1437.8,324: north-north-west,
// down to Spider Lake). The model's floor is flat for 150 km, so the page GRADES its bed (PLAN.md section 1): 1,424.0 m at the south edge to
// 1,422.8 m at the north. A braided river: the main channel and two braids that leave it and rejoin it round gravel bars.
// THE GATE (the owner, 2026-11-09): the Tierhounds' LONG WALL across the floor (Derbent's pattern, PLAN.md section 5, proposed), the TOLL
// FORT on the east bank at the wall's middle with its gate, the WATER GATE where the wall crosses the river on arches, the trickster's SHRINE
// by the god's road south of the gate, and a CARAVAN CAMP outside the wall (north: the caravans come up the gap from the crater) where
// they wait for the toll. Plain records and plain meshes (86-host-gate.js) until the culture kit (kits/coyote).
// THE MAP (x east, z south; north is -z; the origin the 5.1 pixel, R 3400).
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y==null?0:r.y)-2&&y<=(r.y==null?0:r.y)+r.h+5;}
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;document.body.appendChild(renderer.domElement);
// THE LIGHT: dense warm air (1.34 atm) in a trough between airless walls; a humid haze up the gap
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4ccd0);scene.fog=new THREE.FogExp2(HAZE.getHex(),.000045);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,90000);
const HEMI=new THREE.HemisphereLight(0xbccbe0,0x7a705a,.86);scene.add(HEMI);
const SUN_POS=[900,1300,600];   /* the sun from the south-east, over the east wall */
const sun=new THREE.DirectionalLight(0xfff0dc,1.35);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xdcd8cc,.2);fill.position.set(-300,-100,-1000);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:3400};
// the model's grid past the map (OG_FAR, 2 km cells, bilinear): the floor's rise and the walls
const farModel=(x,z)=>{const G=OG_FAR,n=G.h.length,u=clamp(x/G.cell+G.r,0,n-1.001),v=clamp(z/G.cell+G.r,0,n-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,H=G.h;
 return H[j][i]*(1-fu)*(1-fv)+H[j][i+1]*fu*(1-fv)+H[j+1][i]*(1-fu)*fv+H[j+1][i+1]*fu*fv;};
// THE RIVER'S LINE: the model's (x = 1200 + .267 (z - 2000) through the page), with its own bends (KRELIEF.meander's, by hash)
const RIV_A=[1200+.267*(3900-2000),3900],RIV_B=[1200+.267*(-3900-2000),-3900];
const RIV=KRELIEF.meander(RIV_A,RIV_B,{amp:230,wave:2600,step:20,seed:6101});   /* [[x,z]...] from the south edge north */
const rivIdx=KSPACE.create({cell:60});RIV.forEach((p,k)=>rivIdx.insert({k},p[0],p[1],0));
// the line's x at z (it runs one way in z through the page): a 10 m table, for the floor's distances (the channels use the exact distance)
const RXT=(function(){const T=new Float32Array(801);let k=0;for(let i=0;i<=800;i++){const z=3900-i*10;while(k<RIV.length-2&&RIV[k+1][1]>z)k++;const a=RIV[k],b=RIV[k+1],t=clamp((a[1]-z)/((a[1]-b[1])||1),0,1);T[i]=a[0]+(b[0]-a[0])*t;}return T;})();
const rivX=z=>{const u=clamp((3900-z)/10,0,799.999),i=Math.floor(u);return RXT[i]+(RXT[i+1]-RXT[i])*(u-i);};
const COSR=Math.cos(Math.atan(.267));   /* the line's lean: a distance across it is |x - rivX(z)| cos */
// the water level: graded north (Spider Lake's way), 1,424.0 m at the south edge to 1,422.8 m at the north
const LVL=z=>1423.4+.6*clamp(z/3900,-1,1);
// THE BRAIDS: two channels that leave the main one and rejoin it, each on the main line's offset by a bell of its own
const BRAID=[{z0:2600,z1:300,off:-260,w:46,seed:6103},{z0:-900,z1:-3200,off:230,w:52,seed:6105}];
const braidLine=B=>{const P=[];for(const p of RIV){if(p[1]>B.z0||p[1]<B.z1)continue;const t=(B.z0-p[1])/(B.z0-B.z1),s=Math.sin(t*Math.PI);P.push([p[0]+B.off*s+40*s*(fbm(p[1]*.002,0,B.seed,2)-.5),p[1]]);}return P;};
const BRAIDS=BRAID.map(B=>Object.assign({pts:braidLine(B)},B));
const _q=[];
function nearLine(P,idx,x,z,r){idx.query(x,z,r,_q);let b=1e18,k=-1;for(const o of _q){const p=P[o.k],d=(p[0]-x)*(p[0]-x)+(p[1]-z)*(p[1]-z);if(d<b){b=d;k=o.k;}}return{k,d:k<0?1e9:Math.sqrt(b)};}
const braidIdx=BRAIDS.map(B=>{const S=KSPACE.create({cell:60});B.pts.forEach((p,k)=>S.insert({k},p[0],p[1],0));return S;});
const MAIN_W=120;   /* the main channel's width (m): three of the ground's 15.6 m cells and more, so the ribbon never bridges it */
// the channels at a point: the nearest channel's distance from its centre, its half-width, its depth
function chanAt(x,z){let best={d:1e9,hw:MAIN_W/2,dep:3.4,kind:'main'};const m=nearLine(RIV,rivIdx,x,z,400);if(m.d<best.d)best={d:m.d,hw:MAIN_W/2,dep:3.4,kind:'main'};
 BRAIDS.forEach((B,i)=>{const q=nearLine(B.pts,braidIdx[i],x,z,300);if(q.d-B.w/2<best.d-best.hw)best={d:q.d,hw:B.w/2,dep:2.2,kind:'braid'};});return best;}
// the floor: the level plus a metre and a half of bank, rising ~45 m in the 4 km either side (the model's row), swales and old bars
function floorH(x,z){const d=Math.abs(x-rivX(z))*COSR;
 return LVL(z)+1.5+42*Math.pow(smooth(250,4200,d),1.25)+2.2*(fbm(x*.0035+5,z*.0035+1,6107,3)-.5)+.8*(fbm(x*.012,z*.012,6109,2)-.5);}
function land0(x,z){const h=floorH(x,z),C=chanAt(x,z);if(C.d>C.hw+40)return h;
 const lv=LVL(z),bed=lv-C.dep*(1-Math.pow(clamp(C.d/C.hw,0,1),2)),bank=smooth(C.hw+40,C.hw+4,C.d);
 return C.d<C.hw?Math.min(h,bed):mix(h,Math.min(h,lv+.55),bank);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=land0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){const C=chanAt(x,z);return C.d<C.hw+3?LVL(z):-1e9;}
const POOLS=[];
// ---------------------------------------------------------------- the Gate's footprints (drawn in 86): the flora keeps out of them
const ZW=-320;                                       /* the long wall's line across the floor */
const rivXAt=rivX;
const GATE={wallZ:ZW,fort:{x:rivXAt(ZW)+330,z:ZW+70,w:96,d:96},water:{x:rivXAt(ZW),hw:MAIN_W/2+70}};
const roadX=z=>GATE.fort.x+18*Math.sin(z*.0011+.4)+(z<ZW?-30*smooth(ZW,ZW-900,z):0);   /* the god's road: the east bank, through the fort's gate */
const SHRINE={x:roadX(ZW+620)+26,z:ZW+620};
const CAMP={x:roadX(ZW-700)-90,z:ZW-700,r:70};
const inWorks=(x,z,pad)=>{pad=pad==null?0:pad;const F=GATE.fort;
 if(Math.abs(z-ZW)<6+pad)return true;
 if(Math.abs(x-F.x)<F.w/2+12+pad&&Math.abs(z-F.z)<F.d/2+12+pad)return true;
 if(Math.abs(x-roadX(z))<6+pad)return true;
 if(Math.hypot(x-SHRINE.x,z-SHRINE.z)<10+pad||Math.hypot(x-CAMP.x,z-CAMP.z)<CAMP.r+pad)return true;return false;};

// ---------------------------------------------------------------- the fields (cached on an 18 m lattice)
//   bank     a channel's bank (1 on its lip, 0 60 m out); bar  the gravel bars between the braids and the main channel's inner bends
//   floor    the flat floor (1) to its rising edge (0 by 3 km out); swale  the old flood channels' damp hollows
const ROADX=roadX;
function fieldsAt(x,z,h,slope){const C=chanAt(x,z),lv=LVL(z),inCh=C.d<C.hw?1:0,bank=C.d>=C.hw-2?smooth(C.hw+70,C.hw,C.d):0;
 const bar=(h-lv<1.4&&!inCh&&C.d<C.hw+160)?smooth(1.4,.6,h-lv):0,dR=Math.abs(x-rivX(z))*COSR;
 const floor=smooth(3200,1200,dR),swale=clamp((fbm(x*.0018,z*.0018,6111,2)-.55)*4,0,1)*floor*(1-bank);
 return{wet:clamp(.45+.4*bank+.3*swale,0,1),flow:Math.max(inCh,bank*.7),upland:clamp((h-1420)/80,0,1),rock:0,slope,dry:clamp(.3*(1-floor),0,1),
  bank,bar,floor,swale,road:smooth(14,4,Math.abs(x-ROADX(z))),works:inWorks(x,z,4)?1:0};}
const FNAMES=['wet','flow','upland','rock','slope','dry','bank','bar','floor','swale','road','works'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs),0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
// the exact ones near the eye: a channel's bank is narrower than the cache's 18 m cell
FIELD.bankX=(x,z)=>{const C=chanAt(x,z);return C.d>=C.hw-2?smooth(C.hw+70,C.hw,C.d):0;};
// the names the biome core's scatter and the kin's builders may read: 0 where the station has none
['canyon','rim','dune','oasis','abyss','salt','cold','geo','barren'].forEach(n=>{if(!FIELD[n])FIELD[n]=()=>0;});

// ---------------------------------------------------------------- the host binding
// the LOD spine: along the river and the road, round the Gate's works
const SPINE=[];for(let z=-3200;z<=3200;z+=500)SPINE.push([rivXAt(z),z],[roadX(z),z]);for(let x=-2800;x<=2800;x+=1400)for(const z of[-2400,0,2400])SPINE.push([x,z]);
SPINE.push([GATE.fort.x,GATE.fort.z],[SHRINE.x,SHRINE.z],[CAMP.x,CAMP.z]);
function rootMask(x,z){if(inWorks(x,z,3))return 0;const h=terrainH(x,z),d=h-waterH(x,z);return d<.15?0:d<.7?(d-.15)/.55:1;}
BIO.init({tags:'outlandgate',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:[],ticks:tick,seed:6100,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,capThrow:false,
 lod:{hero:240,mid:600,far:2600,floor:[180,460]},windows:{}});
{const Q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
