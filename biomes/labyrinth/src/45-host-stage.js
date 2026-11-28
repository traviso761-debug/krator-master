// ================================================================= HOST — stage (every station: the land from its SITE, 44z-host-site.js)
// The host for THE LABYRINTH: renderer, lights, haze, the land with terrainH() and waterH(), the fields the kits read, the tick list, the error
// panel. One stage for every station: a station's 44z gives its numbers and this fragment makes the land from them. The kits read none of it
// except through BIO.host. Started from biomes/copperglacier (its neighbour north: PLAN.md) and cut down to a floor country.
// THE LAND (x east, z south, y metres above the datum, as the scale model):
//   THE FLOOR   the site's floor, falling along its tilt (the river's way), levelled round the Hall (flatR), two scales of core/rand noise
//   THE MODEL   past the square the scale model's own heights (MODEL_H, 44m: 2 km cells cut by build.py) carry the land to the walls: the far
//               field (85) and the horizon read them; inside the square they fade out, the floor wins
//   THE POND    the Hall of Heroes' reflecting pond (GATEARC.plan().pond: an ellipse 900 x 650 m), its bed 4 m under the water
//   THE RIVER   the Gowd Warra in its channel, graded down the floor (it never climbs: the owner's rule), into the pond and out over the weir
// The rock (the Hall's five carved stacks and the chaos's wild knobs) is KSTACKS bodies drawn on the ground, not in it: the ground runs under them,
// and the root mask, the obstacles and the probe know their footprints.
// NAMES: TAU, clamp, lerp, fbm and the rest are the Ancients kit's (10-core.js, read in place for the Hall: the same definitions); core/rand's noise
// is kfbm here, so nothing is declared twice.
const {mix,smooth}=BIO.fn;
const kfbm=(x,z,seed,o)=>KRAND.fbm(x,.5,z,o==null?3:o,seed);   /* core/rand's noise ([0,1]) */
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}   // BIO.record: the volume as a core/tags record too (core/biome/20-core-kit.js)
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
{const q=new URLSearchParams(location.search);BIO.INDEX_ITEMS=q.get('index')!=='0';
 BIO.LOD.merge=q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&q.get('lodcull')!=='0';}
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;document.body.appendChild(renderer.domElement);
// THE LIGHT: a temperate valley floor under walls 5 km high; morning haze in the neck. The sky (89) drives these from its colour script
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8d0cc);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00006);   /* thin: the neck's walls stand 10-25 km off and must read (FogExp2 squares: 15 km keeps a third) */
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,30000);
scene.add(new THREE.HemisphereLight(0xc4d2dc,0x8a8a78,.82));
const SUN_POS=[-900,1000,600];
const sun=new THREE.DirectionalLight(0xfff2e0,1.25);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xc8d4e4,.2);fill.position.set(800,350,-900);scene.add(fill);

// ---------------------------------------------------------------- the land
const TERR={R:2600};
/* THE HALL (station 1 only: SITE.hall). Every other station has no Hall, no pond and no carved stacks; HALL stays null and the Hall's
   fragments (89g, the bridges' hazards in 89h) skip themselves */
const HALL=SITE.hall?GATEARC.plan():null,PONDD=HALL?HALL.pond:null,LEVEL=HALL?SITE.floor-SITE.pond.drop:(SITE.level==null?SITE.floor:SITE.level);   /* the pond's water: the Hall's frame y 0 */
// THE MODEL'S HEIGHTS (44m): bilinear on the 2 km cells, metres; past the cut the nearest edge
const modelH=(function(){const M=MODEL_H,n=M.n,c=M.cell;return(x,z)=>{const u=clamp((x-M.x0)/c,0,n-1.001),v=clamp((z-M.z0)/c,0,n-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*n+i;
 return M.h[k]*(1-fu)*(1-fv)+M.h[k+1]*fu*(1-fv)+M.h[k+n]*(1-fu)*fv+M.h[k+n+1]*fu*fv;};})();
const MODEL_AT0=modelH(0,0);
// THE FLOOR: the site's floor, falling along its tilt, levelled round the middle (flatR: the Hall's pond needs level banks)
const FLATR=SITE.flatR||[0,1];
function floorH(x,z){const r=Math.hypot(x,z),f=smooth(FLATR[0],FLATR[1],r),T=SITE.tilt||[0,0];return SITE.floor+f*(T[0]*x+T[1]*z);}
// THE LAKES: the Hall's pond (station 1), or SITE.lakes: rotated ellipses {name, cx, cz, a, b, ry, level, bed (m under the level), bank (m)}.
// Inside one the ground is its bed; across its bank it rises to the floor. e < 1 inside
const LAKES=HALL?[{name:'The reflecting pond (the Hall of Heroes)',cx:0,cz:0,a:PONDD.a,b:PONDD.b,ry:0,level:LEVEL,bed:-PONDD.bed,bank:10,pond:true}]:(SITE.lakes||[]);
const lakeE=(L,x,z)=>{const dx=x-L.cx,dz=z-L.cz,c=Math.cos(L.ry||0),s=Math.sin(L.ry||0),u=dx*c+dz*s,v=-dx*s+dz*c;return Math.sqrt(u*u/(L.a*L.a)+v*v/(L.b*L.b));};
const pondE=(x,z)=>{let e=1e9;for(const L of LAKES)e=Math.min(e,lakeE(L,x,z));return e;};
const lakeOf=(x,z)=>{for(const L of LAKES)if(lakeE(L,x,z)<1.05)return L;return null;};
// THE RIVER(S). Station 1: the Gowd Warra in two lines, into the pond at its level and out of it 2 m under the weir. Elsewhere SITE.rivers:
// [{name, hw, depth, pts, end (the level it reaches: a lake's)}], each graded down the floor (it never climbs: the owner's rule)
const RIVER=(function(){const dense=pts=>{const o=[];for(let i=0;i+1<pts.length;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/16));
  for(let k=0;k<n;k++){const t=k/n,w=6*Math.sin(t*Math.PI)*Math.sin(i*1.7+k*.21);o.push([a[0]+(b[0]-a[0])*t-(b[1]-a[1])/L*w,a[1]+(b[1]-a[1])*t+(b[0]-a[0])/L*w]);}}o.push(pts[pts.length-1]);return o;};
 const R=SITE.river;
 if(R&&R.in){const up=dense(R.in),dn=dense(R.out);
  let prev=1e9;const U=up.map(p=>{const y=Math.max(LEVEL,Math.min(floorH(p[0],p[1])-1.5,prev-.002*16));prev=y;return[p[0],p[1],y];});
  U[U.length-1][2]=LEVEL;
  prev=LEVEL-2;const D=dn.map(p=>{const y=Math.min(floorH(p[0],p[1])-3.5,prev-.003*16);prev=y;return[p[0],p[1],y];});
  return{name:R.name,hw:R.hw,depth:R.depth,lines:[U,D],names:[R.name+' (above the pond)',R.name+' (below the weir)']};}
 const L=(SITE.rivers||[]).map(r=>{const d=dense(r.pts);let prev=1e9;const P=d.map(p=>{const y=Math.max(r.end==null?-1e9:r.end,Math.min(floorH(p[0],p[1])-1.2,prev-.004*16));prev=y;return[p[0],p[1],y];});
  if(r.end!=null)P[P.length-1][2]=r.end;return P;});
 const R0=(SITE.rivers||[])[0]||{name:'',hw:4,depth:1};
 return{name:R0.name,hw:R0.hw,depth:R0.depth,lines:L,names:(SITE.rivers||[]).map(r=>r.name)};})();
// bucketed segments (64 m cells) so a lookup reads a handful (copperglacier's stream buckets)
const SBK=(function(){const B=new Map(),cs=64,k=(i,j)=>i*65536+j;RIVER.lines.forEach((P,si)=>{for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1];
 const i0=Math.floor((Math.min(a[0],b[0])-40)/cs),i1=Math.floor((Math.max(a[0],b[0])+40)/cs),j0=Math.floor((Math.min(a[1],b[1])-40)/cs),j1=Math.floor((Math.max(a[1],b[1])+40)/cs);
 for(let ii=i0;ii<=i1;ii++)for(let jj=j0;jj<=j1;jj++){const kk=k(ii,jj);if(!B.has(kk))B.set(kk,[]);B.get(kk).push([si,i]);}}});
 return{at(x,z){const L=B.get(k(Math.floor(x/cs),Math.floor(z/cs)));let best={d:1e9,y:0,si:-1};if(!L)return best;
  for(const [si,i] of L){const P=RIVER.lines[si],a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz||1,t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1),
   d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t)-RIVER.hw;if(d<best.d)best={d,y:mix(a[2],b[2],t),si};}return best;}};})();
// THE WALLS AND THE PITS (core/terrain KRELIEF): SITE.scarps, KRELIEF.scarp records (a graben's bastion, a mesa's face: SCARP.md, the rim line
// and the height step read off the scale model's cells), and SITE.pits, KRELIEF.stepcut records (the pit chain's beaded pits). Each is a
// record kept for the probe, the cover and the hazards (KRELIEF.at, scarpRock), never a second idea of where the wall is
const SCARPS=(SITE.scarps||[]).map((o,i)=>KRELIEF.scarp(Object.assign({seed:KRAND.child(7480+i,'labyrinth/scarp/'+SITE.key)},o)));
const PITS=(SITE.pits||[]).map((o,i)=>KRELIEF.stepcut(Object.assign({seed:KRAND.child(7490+i,'labyrinth/pit/'+SITE.key)},o)));
const RELIEF=SCARPS.concat(PITS);
// THE ROCK: the Hall's five stacks (GATESTACKS, the same records the Hall's builder draws) and the wild knobs (SITE.knobs), on the floor
const groundAt0=(x,z)=>{let g=floorH(x,z)+3*(kfbm(x*.0012,z*.0012,91,3)-.5);for(const W of RELIEF)g=KRELIEF.shape(W,x,z,g);return g;};
const STACKS=HALL?GATESTACKS.plan({hall:HALL,ground:(x,z)=>groundAt0(x,z)-LEVEL}).stacks:[];   /* the Hall's frame: y over LEVEL */
const KNOBS=(SITE.knobs||[]).map((k,i)=>{const S=KSTACKS.make(Object.assign({id:'gate.knob.'+i,y0:groundAt0(k.x,k.z)-4,bed:[10,22],weather:.85},k));
 /* k.flat: the top bed's roughness in metres (KSTACKS' rg, .7 by default): a knob a pueblo stands on (86p) has a flat top */
 if(k.flat!=null){const b=S.beds[S.beds.length-1];b.rg=k.flat;}return S;});
/* KEEP: footprints the flora and the overgrowth keep off (86p fills it: a pueblo's site box), {x, z, c, s (its yaw's cos, sin), hw, hd} */
const KEEP=[];
function keptOff(x,z,pad){pad=pad||0;for(const K of KEEP){const dx=x-K.x,dz=z-K.z,u=dx*K.c-dz*K.s,w=dx*K.s+dz*K.c;if(Math.abs(u)<K.hw+pad&&Math.abs(w)<K.hd+pad)return true;}return false;}
const ROCK=KNOBS;   /* the host draws the knobs (86); the Hall's builder draws its own five */
function rockFoot(x,z){let d=1e9;const f=KSTACKS.foot(ROCK,x,z);if(f)d=Math.min(d,f.d);
 for(const S of STACKS){const g=KSTACKS.foot([S],x,z);if(g)d=Math.min(d,g.d);}return d;}
function landH(x,z){const r=Math.max(Math.abs(x),Math.abs(z)),fm=smooth(TERR.R*.9,TERR.R*1.7,r);
 let h=groundAt0(x,z)+1.1*(kfbm(x*.009,z*.009,92,2)-.5);
 if(fm>0){const mh=modelH(x,z)-MODEL_AT0+SITE.floor,up=Math.max(0,mh-SITE.floor);   /* the model's 2 km cells are smooth: the walls get spurs and gullies in proportion to their rise */
  h=mix(h,mh+up*(.22*(kfbm(x*.00042,z*.00042,97,4)-.5)+.08*(kfbm(x*.0016,z*.0016,98,3)-.5)),fm);}
 // a lake: its bed under the water inside the ellipse, its bank rising to the floor
 for(const L of LAKES){const e=lakeE(L,x,z);if(e<1.12){const sR=Math.min(L.a,L.b),dOut=(e-1)*sR,bk=L.bank==null?10:L.bank;h=Math.min(h,mix(L.level-(L.bed==null?4:L.bed)*smooth(0,1,Math.min(1,-dOut/Math.max(40,sR*.15))),h,smooth(-6,bk,dOut)));}}
 return h;}
function terrainH1(x,z){return landH(x,z);}
function riverCut(x,z,h){if(!RIVER.lines.length)return h;const s=SBK.at(x,z);if(s.d>36)return h;
 const bed=s.d<0?s.y-.4-RIVER.depth*smooth(0,-.75*RIVER.hw,s.d):s.y-.4+.7*smooth(0,9,s.d)+.14*Math.max(0,s.d-9);return Math.min(h,bed);}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=riverCut(x,z,terrainH1(x,z));_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function waterH(x,z){
 const L=lakeOf(x,z);if(L&&terrainH(x,z)<L.level+.2)return L.level;
 if(RIVER.lines.length){const s=SBK.at(x,z);if(s.d<0)return s.y;}
 return -1e9;}

// ---------------------------------------------------------------- the fields (cached below)
// The world's (biomes/WORLD.md) and the kits': wet (the gallery woods by the water, the steppe dry), flow (the river), tropic (none: the
// nwlowlands' rainforest stays out), dry (the steppe's share), rock (the knobs' talus, the steep), shore (the wet margin), meadow (the open steppe)
function fieldsAt(x,z,h,slope){const w=waterH(x,z),under=w>-1e8&&h<w+.2?1:0,s=SBK.at(x,z),e=pondE(x,z);
 const n=kfbm(x*.004,z*.004,95,2),n2=kfbm(x*.02,z*.02,96,2),foot=rockFoot(x,z);
 let wall=0;for(const W of SCARPS)wall=Math.max(wall,KRELIEF.scarpRock(W,x,z));
 const steep=smooth(.55,.85,slope),rock=clamp(Math.max(steep,smooth(40,-2,foot)*.85,wall*.9),0,1);
 const shore=Math.max(smooth(60,2,s.d),smooth(1.25,1.0,e)*(1-under));
 const wet=clamp((SITE.wetBase==null?.42:SITE.wetBase)+.5*shore+.22*(n-.5)-.25*rock,0,1);   /* parkland: the nwlowlands' temperate stands where wet passes .45-.65 in patches, the gallery woods by the water */
 const dry=clamp((SITE.dryBase==null?.18:SITE.dryBase)-.15*shore+.16*(n2-.5),0,1);   /* the nwlowlands' 'med' zone (grass trees, banksias) stays under its threshold: the floor reads temperate */
 const meadow=(1-rock)*(1-under)*(1-shore*.7)*smooth(.25,.06,slope);
 return{wet,flow:smooth(14,-1,s.d),upland:clamp((h-SITE.floor)/900,0,1),canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:clamp((h-2500)/2000,0,1),geo:0,
  barren:under,fog:0,mist:smooth(1.4,1,e)*.5+smooth(50,0,s.d)*.4,tropic:0,dry,shore,meadow};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','tropic','dry','shore','meadow'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the host binding
// the Hall and its stacks as obstacles (the flora keeps off them): the Hall's columns and piers stand in the pond, so the pond covers them
const OBSTACLES=(HALL?[{x:0,z:0,r:230}]:[]).concat(STACKS.map(S=>({x:S.x,z:S.z,r:S.R*1.05})),KNOBS.map(S=>({x:S.x,z:S.z,r:S.R*1.05})));
const SPINE=[[0,0]];for(let z=-2000;z<=2000;z+=800)for(let x=-2000;x<=2000;x+=800)SPINE.push([x,z]);
RIVER.lines.forEach(P=>{for(let i=0;i<P.length;i+=30)SPINE.push([P[i][0],P[i][1]]);});
// the mask: nothing roots in the water, on the rock, under the Hall
function rootMask(x,z){if(pondE(x,z)<1.03)return 0;if(rockFoot(x,z)<3)return 0;if(KEEP.length&&keptOff(x,z))return 0;
 /* no trees or tufts on a cliff (the owner's rule): a wall's face, a knob's talus, any ground over 35 degrees; the drawn ground's 12 m cells
    also bridge a steep face, so a plant there would float */
 /* the rocky share thins the plants but never skips the water tests below (a steep beck bank let plants root under the water: 2026-11-12) */
 let k=1;{const rk=FIELD.rock(x,z),sl=FIELD.slope(x,z);if(rk>.6||sl>.7)return 0;if(rk>.35)k=(.6-rk)/.25;}
 if(SBK.at(x,z).d<2.8)return 0;
 if(window._waterShore){const s=window._waterShore(x,z);if(s===s&&s<1.2)return 0;}
 const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:k*(d-.15)/.55;}
 // the causeways and the banks' road ring: kept clear for the funeral road
 if(HALL)for(const c of HALL.causeways){const ux=Math.cos(c.a),uz=Math.sin(c.a),t=x*ux+z*uz,p=Math.abs(-x*uz+z*ux);if(t>c.r0&&t<c.r1+30&&p<c.w)return 0;}
 return k;}
BIO.init({tags:'labyrinth',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:rootMask,
 obstacles:OBSTACLES,ticks:tick,seed:29,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:560,far:2400,floor:[180,440]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
