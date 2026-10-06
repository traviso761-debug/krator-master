// ================================================================= HOST — stage
// The ideal-type host for the NORTH-WEST BAY (the biome of Ys): everything a
// world provides that a biome does not. Renderer, lights, fog, the bay-and-
// slope terrain with terrainH(), the KARST STACKS (their own meshes), the
// climate fields the biome asks for (wet / salt / upland / flow / karst), the
// water (one plane at y=0 for the bay, the lagoons and the river's lowland
// reach; terraced pools where the river comes down the slope), the painted
// ground, the igneous shore, the tick list, the error panel. A real world
// (settlements/ys) replaces this whole section with its own; the biome
// fragments never read anything from it except through BIO.host.
//
// THE MAP (x east, z south, north is -z; the map's centre at CENTER, R 2500):
//   the BAY          a concave inlet in the SE (Krabi, Railay), open toward the
//                    SE edge, centred on BAY.c; the ground round it a metre or
//                    two above the water plane at y=0, the bed dipping under it
//   the STACKS       limestone towers 40-130 m standing in the bay and on its
//                    shore: vertical faces notched at the waterline, a domed
//                    forest top. terrainH() returns the top inside a footprint
//                    (so the biome roots a forest up there) and karst(x,z) tells
//                    it where the rock is; the faces are their own meshes
//   0 .. ~600 m      from the shore: the BAY JUNGLE ring (prism gums to the
//                    ceiling, ironbarks, fan-crowns, cliff figs on the karst)
//   ~500 .. 1300 m   the ground rises: RAINFOREST, flame-crowns on the terraces
//   1200 m +         the dry upper slopes toward the INNER WALL, the high ridge
//                    on the N and W horizon (the far country)
//   the VOLCANO      ~8 km SE of the bay across the water, on the FAR COUNTRY
//   the RIVER        comes down from the NW in TRAVERTINE TERRACES (Semuc
//                    Champey: stepped pools with rimstone lips, cascades on the
//                    risers) into the bay's NW shore through a small delta
//   the LAVA         two black lava tongues reach the shore (black-sand coves);
//                    one headland is COLUMNAR BASALT; rimstone SHELF POOLS on
//                    the shore as well
const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE BAY COLOUR. One hue (0 red .. .33 green .. .5 cyan .. .66 blue), set by
// the host before the biome loads: the water, the shore accents and the moss
// tinge derive from it. Turquoise over limestone here.
var NWBAY_BAY={hue:0.47};
// THE CANOPY CEILING: the eastern-abyss scale, nothing Girder-sized. The
// swbay fork's 110 m stands (DESIGN.md s8). Set it before fragment 50 loads.
var NWBAY_TEMPLE_H=110;
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc8d0c4);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00016);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,14000);
scene.add(new THREE.HemisphereLight(0xc8d4cc,0x4a4630,.62));
const sun=new THREE.DirectionalLight(0xfff2d4,1.45);sun.position.set(-1200,900,-600);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0cfc8,.30);fill.position.set(800,400,900);scene.add(fill);

// ---------------------------------------------------------------- the bay, the river, the rise
const CENTER=[400,-400];
const TERR={R:2500};
// the bay: an ellipse in coordinates rotated 45 degrees, u along the NW
// diagonal (inland, toward the Inner Wall), v across it (along the coast,
// toward the NE); open (wider) toward the SE
const BAY={c:[1500,1500],a:950,b:640,scale:700};
const SQ=Math.SQRT1_2;
function uvOf(x,z){const dx=x-BAY.c[0],dz=z-BAY.c[1];return[(-dx-dz)*SQ,(dx-dz)*SQ];}
function XZ(u,v){return[BAY.c[0]+(v-u)*SQ,BAY.c[1]-(u+v)*SQ];}
// signed distance-ish to the shore in metres: negative inside the water
function bayIn(x,z){const P=uvOf(x,z),u=P[0],v=P[1];
 const bw=BAY.b*(1+.55*smooth(0,-900,u)),ux=u/BAY.a,vx=v/bw,r=Math.hypot(ux,vx),ang=Math.atan2(vx,ux);
 const edge=1+.14*(fbm(Math.cos(ang)*2.6+3,Math.sin(ang)*2.6+8,51,2)-.5)*2;return(r-edge)*BAY.scale;}
// the river: from the NW highlands down the diagonal into the bay's NW shore
function vR(u){return 220*Math.sin(u*.0019+.6)+80*Math.sin(u*.0063+2)+30*Math.sin(u*.017);}
const MOUTH_U=760;
function riverD(x,z){const P=uvOf(x,z),u=P[0],v=P[1];if(u<MOUTH_U-140)return 1e9;
 let d=Math.abs(v-vR(u));
 if(u<MOUTH_U+420){const f=(MOUTH_U+420-u)/560;d=Math.min(d,Math.abs(v-(vR(u)+f*160)),Math.abs(v-(vR(u)-f*140)));}   // delta channels fan toward the mouth
 return d;}
const MOUTH_XZ=XZ(MOUTH_U+120,vR(MOUTH_U+120));
function deltaK(x,z){return smooth(480,60,Math.hypot(x-MOUTH_XZ[0],z-MOUTH_XZ[1]));}
// the rise: concentric round the bay (the ring of jungle, then the rainforest
// slope, then the dry upper slopes), tilted up toward the NW (the Inner Wall)
function riseAt(x,z){const d=bayIn(x,z),u=uvOf(x,z)[0];
 const dd=d+90*(fbm(x*.0012+4,z*.0012-2,43,2)-.5);
 return 24*smooth(140,700,dd)+96*smooth(620,1400,dd)+130*smooth(1250,2500,dd)+70*smooth(1400,4200,u)
  +(60*(fbm(x*.0021,z*.0021,44,3)-.5)+14*(fbm(x*.0068,z*.0068,45,2)-.5))*smooth(350,900,dd);}

// ---------------------------------------------------------------- the igneous shore
// Two lava tongues (ellipses in bay coordinates with ragged edges) reach the
// water on the SW and NE shores, and one headland is columnar basalt. The
// ground is raised a little on the lava (a crusted apron) and on the basalt
// (a plinth the columns stand on); the beach band below a tongue is black sand.
const LAVA=[{u:380,v:-700,ru:270,rv:170,ra:.25,sd:1},{u:420,v:720,ru:230,rv:150,ra:-.26,sd:2}];
const BASALT={u:150,v:-660,ru:92,rv:56,ra:.10};
function ellK(P,x,z){const uv=uvOf(x,z),du=uv[0]-P.u,dv=uv[1]-P.v,c=Math.cos(P.ra),s=Math.sin(P.ra);return Math.hypot((du*c+dv*s)/P.ru,(-du*s+dv*c)/P.rv);}
function lavaK(x,z){let k=0;for(let i=0;i<LAVA.length;i++){const L=LAVA[i],r=ellK(L,x,z);if(r>1.5)continue;
 k=Math.max(k,smooth(1.12,.8,r*(1+.28*(fbm(x*.004+L.sd*7,z*.004-L.sd*3,72,2)-.5)*2)));}return k;}
function basaltK(x,z){const r=ellK(BASALT,x,z);return r>1.3?0:smooth(1.04,.86,r*(1+.14*(fbm(x*.01,z*.01,73,2)-.5)*2));}
// the travertine SHELF POOLS on the shore: three crust mounds, each a stair of rimstone pools
const SHELVES=[{u:700,v:-560,n:4},{u:1000,v:-80,n:5},{u:520,v:640,n:3}].map(S=>{S.xz=XZ(S.u,S.v);return S;});
function shelfK(x,z){let k=0;for(let i=0;i<SHELVES.length;i++){const S=SHELVES[i],d=Math.hypot(x-S.xz[0],z-S.xz[1]);if(d<42)k=Math.max(k,smooth(40,14,d));}return k;}

// ---------------------------------------------------------------- the karst
// Limestone stacks (Krabi): a footprint is an ellipse with a noisy edge; the
// face is vertical, undercut at the waterline, rounding into a domed top
// that terrainH() returns inside the footprint. u,v are bay coordinates.
const STACKS=[
 {u:420,v:-470,r:70,h:108,e:1.4,ra:.7,sd:1},    // the big sea stack SW of the mouth
 {u:470,v:-300,r:34,h:60,e:1.15,ra:2.0,sd:2},   // its small companion
 {u:640,v:-120,r:52,h:86,e:1.25,ra:-.5,sd:3},   // off the NW shore, by the jetty
 {u:300,v:60,r:46,h:72,e:1.5,ra:1.1,sd:4},      // a lone tower far out
 {u:760,v:560,r:95,h:132,e:1.6,ra:-.9,sd:5},    // the headland stack NE of the mouth (the tallest)
 {u:900,v:-480,r:80,h:118,e:1.3,ra:.3,sd:6},    // the shore tower SW of the mouth
 {u:1120,v:-150,r:58,h:76,e:1.2,ra:1.6,sd:7},   // in the jungle ring, inland
 {u:1050,v:820,r:66,h:92,e:1.4,ra:-.2,sd:8},    // inland, NE
 {u:200,v:-560,r:28,h:42,e:1.0,ra:0,sd:9},      // a needle off the lava cove
 {u:120,v:-420,r:40,h:66,e:1.2,ra:2.4,sd:10},   // a sea stack SW
 {u:1300,v:300,r:48,h:64,e:1.3,ra:.9,sd:11},    // up the valley
 {u:560,v:300,r:30,h:50,e:1.1,ra:.4,sd:12},     // a small one off the delta
].map(S=>{const p=XZ(S.u,S.v);S.x=p[0];S.z=p[1];S.R=S.r*S.e*1.3+8;return S;});
function stackRad(S,ang){const a=ang-S.ra,c=Math.cos(a)/S.e,s=Math.sin(a)*S.e;
 return S.r/Math.sqrt(c*c+s*s)*(1+.26*(fbm(Math.cos(ang)*1.7+S.sd*3.1,Math.sin(ang)*1.7+S.sd*5.3,61,2)-.5)*2);}
// the nearest stack: {S, d (signed distance to its footprint edge, m; negative inside), dist, R, ang}
function stackAt(x,z){let best=null;
 for(let i=0;i<STACKS.length;i++){const S=STACKS[i],dx=x-S.x,dz=z-S.z;if(Math.abs(dx)>S.R||Math.abs(dz)>S.R)continue;
  const dist=Math.hypot(dx,dz),ang=Math.atan2(dz,dx),R=stackRad(S,ang),d=dist-R;if(!best||d<best.d)best={S:S,d:d,dist:dist,R:R,ang:ang};}
 return best;}
// the domed top: rho 0 at the centre, 1 at the footprint edge; the rim ring of the face sits at rho .82
function domeH(S,rho,x,z){return S.h*(1-.33*rho*rho)+2.5*(fbm(x*.03+S.sd,z*.03,62,2)-.5);}
function stackTop(K,x,z){return domeH(K.S,K.dist/K.R,x,z);}
function karstAt(x,z){const K=stackAt(x,z);return K?smooth(6,-5,K.d):0;}

// ---------------------------------------------------------------- the sinkholes
// Collapse dolines in the limestone under the slope: a TIANKENG (Xiaozhai) at
// the tsingy's NE edge, ~84 m sheer with a rainforest on its floor, and two
// CENOTES in the bay jungle, bell-shaped shafts down to the water table (the
// water plane at y=0 shows in them). Like a stack, each is a field (`hollow`,
// 1 on a floor), a height (groundH returns the floor inside the rim) and a
// mesh (the wall from the rim down, facing in; the floor; a lip of ground over
// the coarse ground mesh's cut edge). The mask is zero on the wall band.
const SINKS=[
 {u:2760,v:-560,r:82,e:1.2,ra:.5,depth:84,bell:.10,talus:16,sd:31,kind:'tiankeng',name:'The tiankeng'},
 {u:1650,v:600,r:24,e:1.1,ra:1.2,floor:-9,bell:.32,talus:0,sd:32,kind:'cenote',name:'The cenote (NE)'},
 {u:1500,v:-420,r:19,e:1.15,ra:-.4,floor:-7,bell:.26,talus:0,sd:33,kind:'cenote',name:'The cenote (SW)'},
].map(S=>{const p=XZ(S.u,S.v);S.x=p[0];S.z=p[1];S.R=S.r*S.e*1.3+30;return S;});
function sinkRad(S,ang){const a=ang-S.ra,c=Math.cos(a)/S.e,s=Math.sin(a)*S.e;
 return S.r/Math.sqrt(c*c+s*s)*(1+.12*(fbm(Math.cos(ang)*1.9+S.sd*3.1,Math.sin(ang)*1.9+S.sd*5.3,91,2)-.5)*2);}
// the nearest sinkhole: {S, d (signed distance to its rim, m; negative inside), dist, R, ang}
function sinkAt(x,z){let best=null;
 for(let i=0;i<SINKS.length;i++){const S=SINKS[i],dx=x-S.x,dz=z-S.z;if(Math.abs(dx)>S.R||Math.abs(dz)>S.R)continue;
  const dist=Math.hypot(dx,dz),ang=Math.atan2(dz,dx),R=sinkRad(S,ang),d=dist-R;if(!best||d<best.d)best={S:S,d:d,dist:dist,R:R,ang:ang};}
 return best;}
// the floor: flat, with a talus cone of fallen blocks against the wall (d is clamped to the rim:
// under a bell's overhang the floor runs on at the talus' foot height)
function sinkFloorH(S,x,z,d){return S.floorY+S.talus*Math.pow(smooth(-S.r*.5,0,Math.min(d,0)),1.6)+1.4*(fbm(x*.05+S.sd,z*.05,92,2)-.5)*(S.kind==='tiankeng'?1:.3);}
function hollowAt(x,z){const Q=sinkAt(x,z);return Q&&Q.d<0?smooth(-2,-14,Q.d):0;}

// ---------------------------------------------------------------- the tsingy
// A TSINGY massif (Bemaraha): a limestone plateau weathered into a forest of
// knife-edged grey blades, 5-30 m, cut by joint-controlled canyons in two
// sets. It stands on the dry upper slope SW of the river. tsingyK(x,z) is the
// massif (0 off it, 1 in its heart); the blades stand on an 8 m jittered grid,
// none in a canyon; pinAt(x,z) is the signed distance to the nearest blade's
// footprint (the mask is zero in a blade, so the biome plants only in the
// fissures and the canyons; the field `tsingy` tells it where it is).
const TSINGY={u:2560,v:-830,ru:440,rv:300,ra:.35,sd:5,cell:8,joints:[.5,1.68]};
{const p=XZ(TSINGY.u,TSINGY.v);TSINGY.x=p[0];TSINGY.z=p[1];}
function tsingyK(x,z){const r=ellK(TSINGY,x,z);if(r>1.5)return 0;return smooth(1.08,.72,r*(1+.22*(fbm(x*.006+11,z*.006-7,81,2)-.5)*2));}
// the canyons: two sets of parallel joints (52 and 64 m apart), each line
// warped and broken by noise, 2-7 m wide; 1 in a canyon, 0 between them
function canyonK(x,z){let k=0;
 for(let s=0;s<2;s++){const j=TSINGY.joints[s],P=s?64:52,c=Math.cos(j),sn=Math.sin(j);
  const a=x*c+z*sn+16*(fbm(x*.011+s*7,z*.011-s*3,82+s,2)-.5)*2,q=a/P,dist=Math.abs(q-Math.round(q))*P;
  const lineId=Math.round(q),along=-x*sn+z*c,open=smooth(.34,.5,fbm(along*.008+lineId*3.7,lineId*1.3+s*9,84,2));
  const w=(s?2.2:3.2)+(s?2.6:3.8)*fbm(along*.02+lineId,s*5+lineId*.7,85,2);
  k=Math.max(k,open*smooth(w+1.6,w-.6,dist));}
 return k;}
// THE BLADES are FINS in rows along the first joint set (Bemaraha's grain):
// each a serrated knife-edged ridge 7-16 m long, 2.4-4.6 m thick at the foot,
// 5-30 m tall, in rows 6.4 m apart with 1-3 m fissures between them, the
// odd fin missing (a hole in the forest of blades), none in a canyon or a
// sinkhole. PGRID holds each fin in every 8 m cell its footprint reaches.
const PINS=[],PGRID=new Map();
(function(){reseed(8101);const j=TSINGY.joints[0],ax=Math.cos(j),az=Math.sin(j),bx=-az,bz=ax,ROW=6.4,R=Math.max(TSINGY.ru,TSINGY.rv)*1.55,c=TSINGY.cell;
 for(let k=Math.floor(-R/ROW);k<=Math.ceil(R/ROW);k++){let s=-R+rng()*6;
  while(s<R){const Lf=rr(7,16),gap=rng()<.12?rr(4,10):rr(.6,2.6),off=k*ROW+rr(-.7,.7),hs=rng(),w1=rng(),pk=rng(),tint=rng(),da=rr(-.12,.12),pr=rng();
   const m=s+Lf/2,x=TSINGY.x+ax*m+bx*off,z=TSINGY.z+az*m+bz*off;s+=Lf+gap;
   const tk=tsingyK(x,z);if(tk<.1||pr>.35+.7*tk)continue;
   const e0=[x-ax*Lf*.45,z-az*Lf*.45],e1=[x+ax*Lf*.45,z+az*Lf*.45];
   if(canyonK(x,z)>.3||canyonK(e0[0],e0[1])>.3||canyonK(e1[0],e1[1])>.3)continue;
   const Q=sinkAt(x,z);if(Q&&Q.d<Lf*.5+6)continue;
   const H=(5+25*Math.pow(tk,1.3))*(.55+.6*hs),w=clamp(2+H*.085,2.4,4.6)*(.85+.3*w1);
   const P={x:x,z:z,H:H,rb:Lf/2,rz:w/2,ang:j+da,proto:Math.floor(pk*8),tint:tint};PINS.push(P);
   const rr2=P.rb+.5;for(let gz=Math.floor((z-rr2)/c);gz<=Math.floor((z+rr2)/c);gz++)for(let gx=Math.floor((x-rr2)/c);gx<=Math.floor((x+rr2)/c);gx++){const key=gx+','+gz;let A=PGRID.get(key);if(!A){A=[];PGRID.set(key,A);}A.push(PINS.length-1);}}}})();
// signed distance (m, roughly) to the nearest fin's footprint (an ellipse rb x rz along its joint)
function pinAt(x,z){const c=TSINGY.cell,A=PGRID.get(Math.floor(x/c)+','+Math.floor(z/c));if(!A)return 1e9;let best=1e9;
 for(let i=0;i<A.length;i++){const P=PINS[A[i]],dx=x-P.x,dz=z-P.z,ca=Math.cos(P.ang),sa=Math.sin(P.ang),lx=dx*ca+dz*sa,lz=-dx*sa+dz*ca,d=(Math.hypot(lx/P.rb,lz/P.rz)-1)*P.rz;if(d<best)best=d;}
 return best;}

// ---------------------------------------------------------------- terrain
// groundBase is the open ground; groundH is that with the sinkholes' floors
// inside their rims (the ground mesh draws groundBase and is cut round each
// rim); terrainH is what the biome sees: groundH, with a stack's domed top
// inside its footprint.
function groundBase(x,z){
 const lk=bayIn(x,z),rd=riverD(x,z),rise=riseAt(x,z);
 const sw=fbm(x*.0008+3,z*.0008-1,17,3)-.5,ro=fbm(x*.0045-2,z*.0045+5,29,2)-.5;
 let h=1.9+sw*2.4+ro*1.1;
 h+=lavaK(x,z)*(3.2+2.2*(fbm(x*.01,z*.01,71,2)-.5)*2);                                  // the lava apron, a few metres proud of the beach
 h+=2.6*shelfK(x,z);                                                                    // the shelf-pool mounds
 h+=7*tsingyK(x,z);                                                                     // the tsingy's plateau (its canyons are the gaps between the fins: the 11 m ground mesh cannot draw a 3-7 m cut)
 const chanW=1-.45*smooth(400,1400,lk),cw=smooth(34*chanW,13*chanW,rd);
 // the channel bed climbs in STEPS of five metres once it is on the slope (the
 // travertine terraces: each tread a pool, each riser a cascade); the banks stay smooth
 const sf=rise/5,si=Math.floor(sf),stepped=mix(rise,(si+smooth(.8,1,sf-si))*5,smooth(8,20,rise));
 h=mix(h+rise,-1.9+ro*.4+stepped,cw);
 const bk=basaltK(x,z);h=mix(h,Math.max(h,4.2+bk*2.4),bk);                                // the basalt plinth
 const inL=smooth(25,-15,lk),bed=-.6-2.0*smooth(0,-220,lk)-11*smooth(-220,-900,lk)+1.6*(fbm(x*.0018+5,z*.0018+9,77,2)-.5)*smooth(-40,-220,lk);
 return mix(h,Math.min(bed,-.35),inL);}
SINKS.forEach(S=>{S.top=groundBase(S.x,S.z);S.floorY=S.floor!=null?S.floor:S.top-S.depth;});
function groundH(x,z){const Q=sinkAt(x,z);if(Q&&Q.d<0)return sinkFloorH(Q.S,x,z,Q.d);return groundBase(x,z);}
function terrainH(x,z){const K=stackAt(x,z);if(K&&K.d<0)return stackTop(K,x,z);return groundH(x,z);}
// the climate fields the biome asks for (BIOME-API.md): wet / salt / upland / flow / karst, and
// tsingy / hollow for the tsingy massif and the sinkholes' floors
const FIELD={
 upland:(x,z)=>clamp(riseAt(x,z)/240,0,1),
 wet:(x,z)=>{const up=FIELD.upland(x,z),rd=riverD(x,z),lk=bayIn(x,z);
  let w=clamp(1-.86*smooth(.18,.58,up),.14,1);
  w=Math.max(w,.95*smooth(95,22,rd)*(1-.45*smooth(.5,.8,up)),deltaK(x,z),.5*smooth(140,10,lk));
  w*=1-.82*lavaK(x,z)-.6*basaltK(x,z);                                                   // the igneous ground is dry
  const K=stackAt(x,z);if(K&&K.d<0)w=Math.max(.55,w*.85);                                // the stack tops: damp, not saturated
  w=Math.max(w,.88*hollowAt(x,z));                                                         // a sinkhole's floor: shaded, humid, its own rainforest
  w=Math.min(1,w+.12*tsingyK(x,z));                                                        // the tsingy's fissures hold the damp a little
  return clamp(w,0,1);},
 salt:(x,z)=>{const lk=bayIn(x,z),up=FIELD.upland(x,z);
  const rim=smooth(260,8,lk)*smooth(-110,-20,lk),spray=.4*smooth(.06,.3,up)*smooth(520,160,lk);   // the tidal rim, and spray on the headlands
  return clamp(Math.max(rim,spray),0,1);},
 flow:(x,z)=>clamp(smooth(150,28,riverD(x,z)),0,1),
 karst:karstAt,
 tsingy:tsingyK,                                                                            // the tsingy massif (the blades are the mask's business)
 hollow:hollowAt};                                                                          // 1 on a sinkhole's floor
// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: along the diagonal from the bay's mouth to the NW highlands,
// with points out along the shore and at the sea stacks so the ring and the
// karst keep their detail
const spine=[[650,0],[1200,0],[1750,0],[2350,0],[3000,0],[3700,0],[1150,-620],[1000,700],[420,-470],[760,560],[640,-120],[300,60],[2560,-830],[2760,-560]].map(P=>XZ(P[0],P[1]));   // ...and the tsingy and the tiankeng (the cenotes are near enough already)
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,
 // nothing rooted under water, nor in the river's channel up the slope, nor
 // on a stack's rim and face, nor on the basalt columns
 mask:(x,z)=>{const h=terrainH(x,z),m=h<.12?0:h<.6?(h-.12)/.48:1;const K=stackAt(x,z),kr=(K&&K.d>-4&&K.d<12)?0:1;
  const lk=bayIn(x,z),chanW=1-.45*smooth(400,1400,lk),rd=riverD(x,z),cm=smooth(22*chanW,36*chanW,rd);
  const Q=sinkAt(x,z),sk=(Q&&Q.d>(Q.S.kind==='tiankeng'?-12:-6)&&Q.d<6)?0:1;              // not on a sinkhole's wall band
  const pk=tsingyK(x,z)>0&&pinAt(x,z)<.8?0:1;                                              // not in a tsingy blade
  return m*cm*kr*sk*pk*(1-basaltK(x,z));},
 obstacles:OBSTACLES,ticks:tick,seed:11,
 origin:spine,center:CENTER,
 fields:FIELD,eye:()=>[camera.position.x,camera.position.y,camera.position.z],err:reportErr});
BIO.setSun([-1200,900,-600]);
// ---------------------------------------------------------------- the ground
// One mesh (plus a finer strip along the terrace reach of the river). Painted
// by zone from a coarse cache of the fields (the fields cost fbm calls; the
// 1536 canvas would otherwise take seconds), with a tiled detail texture
// multiplied in for the grain up close.
const BAYCOL=new THREE.Color().setHSL(NWBAY_BAY.hue,.75,.45);
const FC=(function(){const N=384,S=TERR.R*2.2,a={wet:new Float32Array(N*N),up:new Float32Array(N*N),rd:new Float32Array(N*N),lk:new Float32Array(N*N),u:new Float32Array(N*N),rise:new Float32Array(N*N),lv:new Float32Array(N*N),bk:new Float32Array(N*N),kd:new Float32Array(N*N),sh:new Float32Array(N*N),ts:new Float32Array(N*N),cy:new Float32Array(N*N),sd:new Float32Array(N*N)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=CENTER[0]+(i/(N-1)-.5)*S,z=CENTER[1]+(j/(N-1)-.5)*S,k=j*N+i;
  a.wet[k]=FIELD.wet(x,z);a.up[k]=FIELD.upland(x,z);a.rd[k]=riverD(x,z);a.lk[k]=bayIn(x,z);a.u[k]=uvOf(x,z)[0];a.rise[k]=riseAt(x,z);a.lv[k]=lavaK(x,z);a.bk[k]=basaltK(x,z);
  const K=stackAt(x,z);a.kd[k]=K?clamp(K.d,-30,60):60;a.sh[k]=shelfK(x,z);
  a.ts[k]=tsingyK(x,z);a.cy[k]=a.ts[k]>0?canyonK(x,z):0;const Q=sinkAt(x,z);a.sd[k]=Q?clamp(Q.d,-30,60):60;}
 const at=(arr,x,z)=>{const u=clamp(((x-CENTER[0])/S+.5)*(N-1),0,N-1.001),v=clamp(((z-CENTER[1])/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,S,a,at};})();
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color();
 const SAND=new THREE.Color(0xe4dcc4),LIT=new THREE.Color(0x3a2a20),LITR=new THREE.Color(0x4e3226),RAIN=new THREE.Color(0x4a3a26),RAIN2=new THREE.Color(0x5a4a30),
  SAV=new THREE.Color(0x9a8450),SAV2=new THREE.Color(0x7a7048),SAVG=new THREE.Color(0x5e6e3a),SILT=new THREE.Color(0x9a8c74),DELTA=new THREE.Color(0x574836),BED=new THREE.Color(0x8a7a66),
  LAVAC=new THREE.Color(0x2a2624),RUST=new THREE.Color(0x5a3a2a),BLACK=new THREE.Color(0x1c1a18),BAS=new THREE.Color(0x30303a),CRUST=new THREE.Color(0xe6dcc4),POOL=new THREE.Color(0xd4e6dc),RISER=new THREE.Color(0xf2ead8),SCREE=new THREE.Color(0xa8a090),LAG=new THREE.Color(0xd8d4c0),TSG=new THREE.Color(0x8e8a80),TSG2=new THREE.Color(0x6e6a62),RIMS=new THREE.Color(0x5a5448);
 const sandT=SAND.clone().lerp(BAYCOL,.05);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=CENTER[0]+(x/w-.5)*S,wz=CENTER[1]+(y/h-.5)*S;
  const n=fbm(x/26,y/26,.3,2)-.5,n2=(BIO.fn.h3(x,y,3)-.5);
  const up=FC.at(FC.a.up,wx,wz),wet=FC.at(FC.a.wet,wx,wz),rd=FC.at(FC.a.rd,wx,wz),lk=FC.at(FC.a.lk,wx,wz),uu=FC.at(FC.a.u,wx,wz),rise=FC.at(FC.a.rise,wx,wz),lv=FC.at(FC.a.lv,wx,wz),bk=FC.at(FC.a.bk,wx,wz),kd=FC.at(FC.a.kd,wx,wz),sh=FC.at(FC.a.sh,wx,wz),ts=FC.at(FC.a.ts,wx,wz),cy=FC.at(FC.a.cy,wx,wz),sd=FC.at(FC.a.sd,wx,wz);
  // the ground colour by zone: jungle litter round the bay, rainforest litter
  // up the slope, the dry upper slopes tawny with green where the forest lets go
  c.copy(LIT).lerp(LITR,clamp(.5+n*1.8,0,1));
  t.copy(RAIN).lerp(RAIN2,clamp(.5+n*1.6,0,1));c.lerp(t,smooth(.08,.26,up));
  t.copy(SAV).lerp(SAV2,clamp(.5+n*1.7,0,1)).lerp(SAVG,smooth(.62,.42,up)*.6);c.lerp(t,smooth(.40,.62,up));
  c.lerp(sandT,smooth(90,6,lk)*.9);                                            // the beach
  c.lerp(LAG,smooth(0,-25,lk)*smooth(-120,-40,lk)*.5);                        // pale lagoon sand under the shallows
  c.lerp(SILT,smooth(60,14,rd)*(1-wet*.5));c.lerp(DELTA,smooth(60,14,rd)*wet*.8);   // river banks
  // the travertine reach: crust on the banks, pale pool beds, cream risers
  {const chanW=1-.45*smooth(400,1400,lk),sf=rise/5,f=sf-Math.floor(sf),onSlope=smooth(8,20,rise);
   c.lerp(CRUST,smooth(44*chanW,18*chanW,rd)*onSlope*.85);
   c.lerp(POOL,smooth(16*chanW,10*chanW,rd)*onSlope);
   c.lerp(RISER,smooth(20*chanW,12*chanW,rd)*onSlope*smooth(.78,.86,f));}
  c.lerp(CRUST,sh*.9);                                                          // the shelf-pool mounds
  c.lerp(BED,smooth(0,-30,lk));
  // the igneous shore: black lava with rust mottling, black sand on the beach under it, basalt
  c.lerp(LAVAC,lv*.92);c.lerp(RUST,lv*smooth(.52,.66,fbm(x/14,y/14,8,2))*.55);
  c.lerp(BLACK,smooth(90,24,lk)*smooth(-20,10,lk)*smooth(.08,.35,lv));
  c.lerp(BAS,bk);
  c.lerp(SCREE,smooth(14,1,kd)*smooth(-6,-1,kd)*.8);                            // scree at a stack's foot
  // the tsingy: grey rubble and bare rock between the blades, the canyons' floors dark with litter
  t.copy(TSG).lerp(TSG2,clamp(.5+n*2.2,0,1));c.lerp(t,smooth(.05,.4,ts)*.85);c.lerp(LIT,ts*cy*.7);
  c.lerp(RIMS,smooth(16,0,sd)*smooth(-2,0,sd)*.55);                            // a sinkhole's broken rim
  const k=1+n*.10+n2*.05;
  d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
// detail: fine grain everywhere, tiled every ~6 m
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=232+(fbm(x/9,y/9,5,2)-.5)*36+(BIO.fn.h3(x,y,9)-.5)*20;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const MAT_GROUND=new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0x9a9890});
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;')
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.021+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.85);}');};
// the terrace reach of the river gets a finer strip (3 x 4 m cells); the coarse
// mesh is pushed a metre down under it, feathered to meet it at the strip's edge
const STRIP={u0:1040,u1:3420,hw:72};
function stripK(u,v){return smooth(STRIP.hw,STRIP.hw*.5,Math.abs(v-vR(u)))*smooth(STRIP.u0,STRIP.u0+40,u)*smooth(STRIP.u1,STRIP.u1-40,u);}
(function(){const N=480,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);g.translate(CENTER[0],0,CENTER[1]);
 const p=g.attributes.position,inS=new Uint8Array(p.count);for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),uv=uvOf(x,z);p.setY(i,groundBase(x,z)-1.2*stripK(uv[0],uv[1]));const Q=sinkAt(x,z);inS[i]=Q&&Q.d<0?1:0;}
 // cut round each sinkhole: drop every triangle with a corner inside a rim (the lip hides the jagged edge)
 {const I=g.index.array,keep=[];for(let t=0;t<I.length;t+=3){if(inS[I[t]]||inS[I[t+1]]||inS[I[t+2]])continue;keep.push(I[t],I[t+1],I[t+2]);}g.setIndex(keep);}
 g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The bay floor';scene.add(m);
 // the strip: along u, across v, uv matched to the big texture by world position
 const NU=Math.round((STRIP.u1-STRIP.u0)/3),NV=Math.round(STRIP.hw*2/4),pos=[],uvs=[],idx=[];
 for(let i=0;i<=NU;i++){const u=STRIP.u0+(STRIP.u1-STRIP.u0)*i/NU,vc=vR(u);for(let j=0;j<=NV;j++){const v=vc-STRIP.hw+2*STRIP.hw*j/NV,P=XZ(u,v);
  pos.push(P[0],groundH(P[0],P[1]),P[1]);uvs.push((P[0]-(CENTER[0]-S/2))/S,1-(P[1]-(CENTER[1]-S/2))/S);}}
 for(let i=0;i<NU;i++)for(let j=0;j<NV;j++){const a=i*(NV+1)+j,b=a+NV+1;idx.push(a,a+1,b,a+1,b+1,b);}   // CCW seen from above
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));sg.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));sg.setIndex(idx);sg.computeVertexNormals();
 const sm=new THREE.Mesh(sg,MAT_GROUND);sm.userData.probeSkip=true;sm.userData.inspectLabel='The travertine terraces';scene.add(sm);})();

// ---------------------------------------------------------------- the karst stacks (meshes)
// One mesh per stack: rings up the face (dense at the waterline notch and at
// the rim), then the dome rings in to the centre. Vertex-coloured limestone
// with dark runnels, a wet black band at the notch, moss toward the rim, a
// forest-floor cap. The host hands these geometries to NWBAY.dress() so the
// biome hangs its curtain figs and gardens off the faces (88-host-build).
const TEX_LIME=BIO.canvasTex(256,512,(g,w,h)=>{g.fillStyle='#cfc8bc';g.fillRect(0,0,w,h);
 for(let i=0;i<70;i++){const x=rng()*w,y0=rng()*h*.6-40,ww=rr(2,9);g.fillStyle='rgba(70,62,52,'+(.08+rng()*.22).toFixed(2)+')';g.beginPath();g.moveTo(x,y0);g.lineTo(x+ww,y0+rr(-3,3));g.lineTo(x+ww+rr(-4,4),h+10);g.lineTo(x+rr(-4,4),h+10);g.closePath();g.fill();}   // runnels
 for(let i=0;i<34;i++){const y=rng()*h;g.strokeStyle='rgba(90,84,74,'+(.1+rng()*.2).toFixed(2)+')';g.lineWidth=rr(1,2.5);g.beginPath();g.moveTo(-4,y);g.bezierCurveTo(w*.3,y+rr(-6,6),w*.7,y+rr(-6,6),w+4,y+rr(-4,4));g.stroke();}   // bedding
 for(let i=0;i<160;i++){const x=rng()*w,y=rng()*h,r=rr(2,7);g.fillStyle='rgba('+(rng()<.5?'60,56,50':'236,232,222')+','+(.2+rng()*.3).toFixed(2)+')';g.beginPath();g.ellipse(x,y,r,r*.6,rr(0,TAU),0,TAU);g.fill();}});   // pits and pale flakes
const MAT_LIME=new THREE.MeshLambertMaterial({map:TEX_LIME,vertexColors:true,color:0xffffff});
const STACK_GEOS=[];
(function(){const LIME=new THREE.Color(0xb4ac9c),LIME2=new THREE.Color(0xd4ccbc),DARK=new THREE.Color(0x4a4238),NOTCH=new THREE.Color(0x2e2a26),WET=new THREE.Color(0x5a5a52),MOSS=new THREE.Color(0x5a6a3c),RUST=new THREE.Color(0x9a6a40),CAP=new THREE.Color(0x4e4a32),CAP2=new THREE.Color(0x6a6a44);
 const c=new THREE.Color();
 // the rim ring of the face sits at rho .92 (the figs root inside it, at d < -4 m), the dome runs in from there
 STACKS.forEach((S,si)=>{const seg=S.r>60?64:S.r>40?48:32,rimRho=.92,faceTop=S.h*(1-.33*rimRho*rimRho);
  const pos=[],col=[],uv=[],idx=[];let rows=0;
  const addRow=(fn)=>{for(let s=0;s<=seg;s++){const ang=s/seg*TAU,q=fn(ang,s);pos.push(q[0],q[1],q[2]);uv.push(q[3],q[4]);col.push(q[5].r,q[5].g,q[5].b);}rows++;};
  // the face rings: from under the bed to the rim
  const ys=[];for(let y=-16;y<faceTop;y+=(y<-3?4:y<5?1.1:y<faceTop-14?5.5:2.2))ys.push(y);
  ys.forEach(y=>addRow((ang,s)=>{const R0=stackRad(S,ang),t=y/faceTop;
   const notch=1-.13*smooth(-2.6,-.6,y)*smooth(3.9,1.8,y);                                   // the undercut at the waterline
   const belly=1+.05*Math.sin(y*.09+S.sd)+.04*(fbm(ang*2.1+S.sd,y*.02,63,2)-.5)*2;
   const ledge=1+.05*(smooth(.08,0,Math.abs(t-.42))+smooth(.06,0,Math.abs(t-.71)));            // two ledges
   const rim=1-.08*smooth(faceTop-16,faceTop,y);                                             // rounding into the top (to rho .92)
   const r=R0*notch*belly*ledge*rim;
   const streak=fbm(ang*7+S.sd*2,y*.012,64,3),bed=fbm(ang*3+S.sd,y*.03,66,2),rust=fbm(ang*4+S.sd*9,y*.02,67,2);
   c.copy(LIME).lerp(LIME2,clamp(.5+(bed-.5)*2.2,0,1)).lerp(DARK,smooth(.52,.7,streak)*.8);
   c.lerp(RUST,smooth(.6,.72,rust)*.5);
   c.lerp(NOTCH,smooth(4.2,1.5,y)*smooth(-3.5,-1.2,y));c.lerp(WET,smooth(-1,-6,y)*.8);
   c.lerp(MOSS,smooth(faceTop-30,faceTop-2,y)*smooth(.42,.62,fbm(ang*5,y*.05,68,2))*.85);
   return[S.x+Math.cos(ang)*r,y,S.z+Math.sin(ang)*r,ang*R0/14,y/22,c];}));
  // the dome: rings in from the rim to the centre, following domeH exactly (terrainH is the same function)
  [rimRho,.84,.74,.62,.5,.38,.26,.14,.001].forEach((rho,k)=>addRow((ang,s)=>{const R0=stackRad(S,ang),r=R0*rho,x=S.x+Math.cos(ang)*r,z=S.z+Math.sin(ang)*r,y=k===0?faceTop:domeH(S,rho,x,z);
   const n=fbm(x*.05,z*.05,69,2);c.copy(CAP).lerp(CAP2,clamp(.5+(n-.5)*2,0,1)).lerp(LIME,smooth(.6,rimRho,rho)*.7*smooth(.4,.6,n));
   return[x,y,z,x/8,z/8,c];}));
  for(let r2=0;r2<rows-1;r2++)for(let s=0;s<seg;s++){const a=r2*(seg+1)+s,b=a+seg+1;idx.push(a,b,a+1,a+1,b,b+1);}   // CCW from outside: the angle runs clockwise seen from above
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  geo.setIndex(idx);geo.computeVertexNormals();
  const m=new THREE.Mesh(geo,MAT_LIME);m.userData.inspectLabel='Karst stack';m.userData.host=true;scene.add(m);STACK_GEOS.push(geo);
  REGISTER({name:'Karst stack '+(si+1)+(S.u<950&&bayIn(S.x,S.z)<0?' (sea stack)':' (shore)'),x:S.x,z:S.z,y:-2,r:S.r*S.e*1.3,h:S.h+8});});})();

// ---------------------------------------------------------------- the tsingy (meshes)
// Eight fin prototypes (a serrated knife-edged ridge; the rillenkarren flutes
// are the limestone texture's runnels), unit-sized, vertex-coloured (dark at
// the foot, black streaks, pale teeth, the odd orange lichen), one
// InstancedMesh each. Every fin in PINS is an instance sunk 2 m into the ground.
const MAT_TSINGY=new THREE.MeshLambertMaterial({map:TEX_LIME,vertexColors:true,color:0xffffff});
(function(){const DK=new THREE.Color(0x4e4a44),GR=new THREE.Color(0x9a968c),PALE=new THREE.Color(0xc6c2b6),BLK=new THREE.Color(0x2a2824),LICH=new THREE.Color(0xb0783a),c=new THREE.Color();
 // a FIN: x along its length (-1..1), z across (-1..1), y up (0..1). A ring round a rounded-oblong foot,
 // rows up the faces narrowing to the knife edge, whose height along x is a saw of 3-5 teeth
 function proto(sd){reseed(8200+sd);const pos=[],col=[],uv=[],idx=[],NU=28,NV=5;
  const nT=ri(3,5),teeth=[];for(let i=0;i<nT;i++)teeth.push({x:-1+(2*i+1)/nT+rr(-.12,.12),h:rr(.62,1),w:(2/nT)*rr(.75,1.15)});teeth[ri(0,nT-1)].h=1;
  const top=x=>{let h=.1;for(const t of teeth)h=Math.max(h,t.h*(1-Math.abs(x-t.x)/t.w));return h*smooth(1.02,.75,Math.abs(x));};
  const ring=[];for(let k=0;k<=NU;k++){const a=k/NU*TAU,ca=Math.cos(a),sa=Math.sin(a);ring.push([Math.sign(ca)*Math.pow(Math.abs(ca),.45),Math.sign(sa)*Math.pow(Math.abs(sa),.8)]);}
  for(let r=0;r<=NV;r++){const t=r/NV;
   for(let k=0;k<=NU;k++){const x0=ring[k][0],z0=ring[k][1],x=x0*(1-.06*t),ht=top(x),y=-.05+t*(ht+.05),z=z0*Math.pow(1-t,.85)*(1+.05*Math.sin(x*11+sd));
    pos.push(x,y,z);uv.push((x0+1)*2.2,y*3.2);
    const st=fbm(x*3.1+sd*3,y*2.6,86,2),li=fbm(x*2.3+sd,y*3.3+5,87,2);
    c.copy(DK).lerp(GR,smooth(0,.3,y)).lerp(PALE,smooth(.6,1,t)*.75).lerp(BLK,smooth(.55,.72,st)*.75*(1-.5*t)).lerp(LICH,smooth(.68,.76,li)*.4);
    col.push(c.r,c.g,c.b);}}
  for(let r=0;r<NV;r++)for(let k=0;k<NU;k++){const a=r*(NU+1)+k,b=a+NU+1;idx.push(a,b,a+1,a+1,b,b+1);}   // CCW from outside
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;}
 const groups=[[],[],[],[],[],[],[],[]];PINS.forEach((P,i)=>groups[P.proto].push(i));
 const M4=new THREE.Matrix4(),Q=new THREE.Quaternion(),UP=new THREE.Vector3(0,1,0),Pv=new THREE.Vector3(),Sv=new THREE.Vector3(),cc=new THREE.Color();
 let tris=0;
 groups.forEach((L,k)=>{if(!L.length)return;const g=proto(k),im=new THREE.InstancedMesh(g,MAT_TSINGY,L.length);
  L.forEach((pi,j)=>{const P=PINS[pi];Q.setFromAxisAngle(UP,-P.ang);Pv.set(P.x,groundBase(P.x,P.z)-2,P.z);Sv.set(P.rb,P.H+2,P.rz);
   M4.compose(Pv,Q,Sv);im.setMatrixAt(j,M4);cc.setHSL(.09,.06,.74+.2*P.tint);im.setColorAt(j,cc);});
  im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
  im.userData.inspectLabel='Tsingy blades';im.userData.host=true;im.userData.probeSkip=true;scene.add(im);tris+=L.length*g.index.count/3;});
 window._tsingy={blades:PINS.length,tris:tris};
 REGISTER({name:'The tsingy (knife-edged limestone)',x:TSINGY.x,z:TSINGY.z,y:groundBase(TSINGY.x,TSINGY.z),r:TSINGY.ru,h:40});})();

// ---------------------------------------------------------------- the sinkholes (meshes)
// Per sinkhole: the WALL (rings from the rim down to the floor, facing in,
// belling out under the rim; limestone with dark runnels, moss toward the
// top, a green slime band at a cenote's water line), the FLOOR (litter over
// the talus; pale rock under a cenote's water), and the LIP (ground-textured,
// drawn over the ground mesh's cut edge). The walls above the water go to
// NWBAY.dress() as faces (88-host-build): the root curtains, ferns and
// hanging gardens of a doline.
const SINK_GEOS=[];
(function(){const LIME=new THREE.Color(0xb0a898),LIME2=new THREE.Color(0xccc4b4),DARK=new THREE.Color(0x46403a),MOSS=new THREE.Color(0x4e6a34),SLIME=new THREE.Color(0x3e5a46),WETC=new THREE.Color(0x52524a),
  LITTER=new THREE.Color(0x3e3020),LITTER2=new THREE.Color(0x56462c),BED=new THREE.Color(0xb8b4a0),c=new THREE.Color();
 const S0=TERR.R*2.2,gUV=(x,z)=>[(x-(CENTER[0]-S0/2))/S0,1-(z-(CENTER[1]-S0/2))/S0];
 const MAT_FLOOR=new THREE.MeshLambertMaterial({map:TEX_DETAIL,vertexColors:true,color:0xffffff});
 const MAT_LIP=MAT_GROUND.clone();MAT_LIP.onBeforeCompile=MAT_GROUND.onBeforeCompile;MAT_LIP.polygonOffset=true;MAT_LIP.polygonOffsetFactor=-2;MAT_LIP.polygonOffsetUnits=-4;
 function mesh(pos,col,uv,idx,mat,label){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  if(col)g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.userData.inspectLabel=label;m.userData.host=true;scene.add(m);return g;}
 SINKS.forEach((S,si)=>{const seg=S.r>50?72:40,cen=S.kind==='cenote';
  const rim=[];for(let s=0;s<=seg;s++){const ang=s/seg*TAU,R0=sinkRad(S,ang),x=S.x+Math.cos(ang)*R0,z=S.z+Math.sin(ang)*R0;rim.push({ang:ang,R0:R0,y:groundBase(x,z)});}
  const footY=S.floorY+S.talus;
  // the wall: t 0 at the rim .. 1 at the floor; a cenote's in two pieces, above and below the water
  function wall(t0,t1,nRow){const pos=[],col=[],uv=[],idx=[];
   for(let r=0;r<=nRow;r++){const tt=mix(t0,t1,Math.pow(r/nRow,1.15));
    for(let s=0;s<=seg;s++){const q=rim[s],y=mix(q.y,footY,tt),bell=1+S.bell*smooth(.04,.55,tt),
      rough=1+.035*(fbm(q.ang*6+S.sd,y*.08,93,2)-.5)*2+.025*Math.sin(y*.21+q.ang*3+S.sd),ledge=1-.03*smooth(.05,0,Math.abs(tt-.38)),r=q.R0*bell*rough*ledge;
     pos.push(S.x+Math.cos(q.ang)*r,y,S.z+Math.sin(q.ang)*r);uv.push(q.ang*q.R0/14,y/22);
     const streak=fbm(q.ang*7+S.sd*2,y*.012,94,3),bed=fbm(q.ang*3+S.sd,y*.03,95,2);
     c.copy(LIME).lerp(LIME2,clamp(.5+(bed-.5)*2.2,0,1)).lerp(DARK,smooth(.5,.68,streak)*.8);
     c.lerp(MOSS,smooth(.3,0,tt)*smooth(.4,.6,fbm(q.ang*5,y*.05,96,2))*.8);
     if(cen){c.lerp(SLIME,smooth(3,.5,y)*smooth(-2,.2,y)*.85);c.lerp(WETC,smooth(.5,-3,y)*.7);}else c.lerp(MOSS,smooth(.75,1,tt)*.5);   // the damp foot of a tiankeng's wall
     col.push(c.r,c.g,c.b);}}
   for(let r=0;r<nRow;r++)for(let s=0;s<seg;s++){const a=r*(seg+1)+s,b=a+seg+1;idx.push(a,b,a+1,a+1,b,b+1);}   // rows run down: this winding faces the axis
   return{pos,col,uv,idx};}
  const tw=cen?clamp(rim[0].y/(rim[0].y-footY),.1,.95):1,parts=cen?[[0,tw,10],[tw,1,4]]:[[0,1,22]];
  parts.forEach((pp,k)=>{const W=wall(pp[0],pp[1],pp[2]),g=mesh(W.pos,W.col,W.uv,W.idx,MAT_LIME,'Sinkhole wall');if(k===0)SINK_GEOS.push(g);});
  // the floor: rings in from the wall's foot to the centre
  {const pos=[],col=[],uv=[],idx=[],rhos=[1+S.bell,1.0,.86,.7,.52,.34,.16,.001];
   rhos.forEach(rho=>{for(let s=0;s<=seg;s++){const q=rim[s],r=q.R0*rho,x=S.x+Math.cos(q.ang)*r,z=S.z+Math.sin(q.ang)*r,y=sinkFloorH(S,x,z,(rho-1)*q.R0);
    pos.push(x,y,z);uv.push(x/6,z/6);const n=fbm(x*.05,z*.05,97,2);c.copy(LITTER).lerp(LITTER2,clamp(.5+(n-.5)*2,0,1));if(cen)c.copy(BED).lerp(DARK,n*.4);c.convertSRGBToLinear();col.push(c.r,c.g,c.b);}});
   for(let r=0;r<rhos.length-1;r++)for(let s=0;s<seg;s++){const a=r*(seg+1)+s,b=a+seg+1;idx.push(a,b,a+1,a+1,b,b+1);}   // rows run in: this winding faces up
   mesh(pos,col,uv,idx,MAT_FLOOR,cen?'Cenote bed':'Tiankeng floor');}
  // the lip: ground from the rim out past the ground mesh's cut edge
  {const pos=[],uv=[],idx=[],offs=[0,2.5,6,11,17,24];
   offs.forEach(o=>{for(let s=0;s<=seg;s++){const q=rim[s],x=S.x+Math.cos(q.ang)*(q.R0+o),z=S.z+Math.sin(q.ang)*(q.R0+o);pos.push(x,o===0?q.y:groundBase(x,z),z);const t=gUV(x,z);uv.push(t[0],t[1]);}});
   for(let r=0;r<offs.length-1;r++)for(let s=0;s<seg;s++){const a=r*(seg+1)+s,b=a+seg+1;idx.push(a,a+1,b,a+1,b+1,b);}   // rows run out: this winding faces up
   mesh(pos,null,uv,idx,MAT_LIP,'The ground');}
  REGISTER({name:S.name+(cen?' (to the water table)':' (a collapse doline)'),x:S.x,z:S.z,y:S.floorY,r:S.r*S.e,h:S.top-S.floorY});});})();

// ---------------------------------------------------------------- the water
// One plane at y=0 carries the bay, the lagoons and the lowland reach of the
// river; its vertex colour is the water's own colour by depth (bay colour in
// the salt, river colour in the fresh). The river's descent is TERRACED: a
// ribbon in the same material whose height is snapped to each tread's pool
// level, so it reads as a staircase of flat turquoise pools with a sheet of
// water on every riser, and foam cards on those. Rimstone lips (host crust
// geometry) hold every pool.
const WATER_SHALLOW=new THREE.Color().setHSL(NWBAY_BAY.hue,.70,.52),WATER_MID=new THREE.Color().setHSL(NWBAY_BAY.hue,.74,.34),WATER_DEEP=new THREE.Color().setHSL(NWBAY_BAY.hue+.03,.70,.14),WATER_PALE=new THREE.Color().setHSL(NWBAY_BAY.hue-.03,.6,.72);
const RIVER_COL=new THREE.Color().setHSL((NWBAY_BAY.hue+.02)%1,.55,.46),POOL_COL=new THREE.Color().setHSL(NWBAY_BAY.hue+.01,.72,.5),POOL_PALE=new THREE.Color().setHSL(NWBAY_BAY.hue-.02,.62,.7),POOL_DEEP=new THREE.Color().setHSL(NWBAY_BAY.hue+.04,.7,.3);
const MAT_WATER=new THREE.ShaderMaterial({fog:true,vertexColors:true,side:THREE.DoubleSide,
 uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uT:{value:0},uSun:{value:new THREE.Vector3(-1200,900,-600).normalize()},uSky:{value:new THREE.Color(0xd8e4e0)}}]),
 vertexShader:['#include <fog_pars_vertex>','varying vec3 vWP;varying vec3 vCol;',
  'void main(){vCol=color;vec4 wp=modelMatrix*vec4(position,1.0);vWP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
 fragmentShader:['#include <fog_pars_fragment>','uniform float uT;uniform vec3 uSun,uSky;varying vec3 vWP;varying vec3 vCol;',
  'void main(){',
  ' float dcam=length(cameraPosition-vWP);float rk=1.0-smoothstep(120.0,420.0,dcam);',   // ripples fade with range or they alias into a moire
  ' vec3 n=normalize(vec3(rk*(0.035*sin(vWP.x*0.31+uT*1.1)+0.02*sin(vWP.z*0.53-uT*0.7+vWP.x*0.11)),1.0,rk*(0.035*cos(vWP.z*0.27+uT*0.9)+0.02*sin(vWP.x*0.47+uT*1.3))));',
  ' vec3 V=normalize(cameraPosition-vWP);float fr=pow(1.0-max(dot(n,V),0.0),3.0);',
  ' vec3 col=mix(vCol,uSky,0.08+fr*0.62);',
  ' vec3 H=normalize(uSun+V);col+=pow(max(dot(n,H),0.0),140.0)*0.75*vec3(1.0,0.96,0.86);',
  ' gl_FragColor=vec4(col,1.0);','#include <fog_fragment>','}'].join('\n')});
MAT_WATER.uniforms.fogColor.value=scene.fog.color;MAT_WATER.uniforms.fogDensity.value=scene.fog.density;
TICKS.push(dt=>{MAT_WATER.uniforms.uT.value+=dt;});
function waterColorAt(x,z,out){const h=groundH(x,z),d=Math.max(0,-h),lk=bayIn(x,z),fresh=smooth(160,40,riverD(x,z))*(1-smooth(-60,-300,lk));
 const shoal=fbm(x*.0031+2,z*.0031-4,505,2),K=stackAt(x,z),near=K?smooth(90,10,K.d):0;
 out.copy(WATER_SHALLOW).lerp(WATER_PALE,Math.max(smooth(.47,.66,shoal)*smooth(2.2,.3,d),smooth(.5,.08,d)*.7,near*.45*smooth(3,.5,d))).lerp(WATER_MID,smooth(1.2,3.6,d)).lerp(WATER_DEEP,smooth(4,9,d));   // pale sand shoals, a pale rim at the beach, a pale lagoon round every stack
 out.lerp(RIVER_COL,fresh);return out;}
// host crust geometry (the rimstone lips, the shelf pools): a small merged mesh of its own
const HG={pos:[],nor:[],col:[],uv:[]};
function hgTri(a,b,c2,col){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c2[0]-a[0],vy=c2[1]-a[1],vz=c2[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;
 [a,b,c2].forEach(p=>{HG.pos.push(p[0],p[1],p[2]);HG.nor.push(nx/l,ny/l,nz/l);HG.col.push(col.r,col.g,col.b);HG.uv.push(p[0]/3,p[2]/3);});}
// a tube along pts [[x,y,z,r],...], a closed loop if `loop`
function hgTube(pts,col,seg,loop){seg=seg||6;const n=pts.length,rings=[];
 for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1],tz=b[2]-a[2];const l=Math.hypot(tx,ty,tz)||1;tx/=l;ty/=l;tz/=l;
  let nx=-tz,ny=0,nz=tx;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;nz/=nl;const bx=ty*nz-tz*ny,by=tz*nx-tx*nz,bz=tx*ny-ty*nx;const ring=[];
  for(let s=0;s<seg;s++){const an=s/seg*TAU,cx=Math.cos(an),sx=Math.sin(an);ring.push([pts[i][0]+(nx*cx+bx*sx)*pts[i][3],pts[i][1]+(ny*cx+by*sx)*pts[i][3],pts[i][2]+(nz*cx+bz*sx)*pts[i][3]]);}rings.push(ring);}
 for(let i=0;i<(loop?n:n-1);i++){const A=rings[i],B=rings[(i+1)%n];for(let s=0;s<seg;s++){const s1=(s+1)%seg;hgTri(A[s],B[s1],B[s],col);hgTri(A[s],A[s1],B[s1],col);}}}
const CRUST=new THREE.Color(0xe8dec6).convertSRGBToLinear(),CRUST2=new THREE.Color(0xd2c6ac).convertSRGBToLinear();
const WATER_GEO={pos:[],col:[]};
function wgTri(a,b,c2,col){[a,b,c2].forEach(p=>{WATER_GEO.pos.push(p[0],p[1],p[2]);WATER_GEO.col.push(col.r,col.g,col.b);});}
(function(){const N=300,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);g.translate(CENTER[0],0,CENTER[1]);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color();
 for(let i=0;i<p.count;i++){waterColorAt(p.getX(i),p.getZ(i),c);c.convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const m=new THREE.Mesh(g,MAT_WATER);m.userData.probeSkip=true;m.userData.inspectLabel='The bay';m.renderOrder=1;scene.add(m);
 // a cenote's pool: its own disc a hair over the plane (the plane's 18 m colour grid is a blocky square in a 20 m shaft),
 // pale turquoise under the walls' overhang, deep at the centre
 SINKS.forEach(S=>{if(S.kind!=='cenote')return;const seg=40,pos=[],col=[],idx=[],c=new THREE.Color(),R=[1+S.bell+.05,.9,.65,.4,.001];
  R.forEach(rho=>{for(let s=0;s<=seg;s++){const ang=s/seg*TAU,r=sinkRad(S,ang)*rho;pos.push(S.x+Math.cos(ang)*r,.04,S.z+Math.sin(ang)*r);
   c.copy(WATER_PALE).lerp(WATER_SHALLOW,smooth(1.2,.85,rho)).lerp(WATER_MID,smooth(.85,.4,rho)).lerp(WATER_DEEP,smooth(.45,0,rho)*.8).convertSRGBToLinear();col.push(c.r,c.g,c.b);}});
  for(let r=0;r<R.length-1;r++)for(let s=0;s<seg;s++){const a=r*(seg+1)+s,b=a+seg+1;idx.push(a,b,a+1,a+1,b,b+1);}
  const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));cg.setAttribute('color',new THREE.Float32BufferAttribute(col,3));cg.setIndex(idx);
  const cm=new THREE.Mesh(cg,MAT_WATER);cm.userData.probeSkip=true;cm.userData.inspectLabel='A cenote pool';cm.renderOrder=1;scene.add(cm);});
 // the terraced river: samples every 5 m along u from just above the delta to
 // the NW edge; each sample carries its pool level and the pool's colour
 const SM=[];
 for(let u=MOUTH_U+380;u<4300;u+=5){const vc=vR(u),P=XZ(u,vc),rise=riseAt(P[0],P[1]),bed=groundH(P[0],P[1]),lk=bayIn(P[0],P[1]);
  const sf=rise/5,si=Math.floor(sf),f=sf-si,k=smooth(8,20,rise),chanW=1-.45*smooth(400,1400,lk);
  const tread=-1.9+si*5+1.5,lvl=mix(bed+1.1,f>.8?Math.max(bed+.35,tread):tread,k);
  const pc=fbm(si*.37+1,3,606,1);const c2=POOL_COL.clone().lerp(POOL_PALE,smooth(.3,.6,pc)*.7).lerp(POOL_DEEP,smooth(.6,.35,pc)*.6).lerp(RIVER_COL,1-k);
  SM.push({u:u,v:vc,x:P[0],z:P[1],y:lvl,w:13*chanW+3,ramp:f>.8&&k>.5,si:si,k:k,col:c2.convertSRGBToLinear()});}
 const pos=[],cc=[];
 for(let i=0;i<SM.length-1;i++){const A=SM[i],B=SM[i+1];
  pos.push(A.x-A.w*SQ,A.y,A.z-A.w*SQ, B.x-B.w*SQ,B.y,B.z-B.w*SQ, B.x+B.w*SQ,B.y,B.z+B.w*SQ,  A.x-A.w*SQ,A.y,A.z-A.w*SQ, B.x+B.w*SQ,B.y,B.z+B.w*SQ, A.x+A.w*SQ,A.y,A.z+A.w*SQ);   // across the channel: the v direction is (1,1)/sqrt2 in xz
  [A,B,B,A,B,A].forEach(q=>cc.push(q.col.r,q.col.g,q.col.b));}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));geo.computeVertexNormals();
 const rm=new THREE.Mesh(geo,MAT_WATER);rm.userData.probeSkip=true;rm.userData.inspectLabel='The river (terraced pools)';scene.add(rm);
 // the CASCADES: where the water goes down a riser it goes white -- foam cards
 // laid on the ribbon, a streaky alpha canvas scrolling downstream
 const TEX_FOAM=BIO.canvasTex(128,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.lineCap='round';
  for(let i=0;i<180;i++){const x=rng()*w,y=rng()*h,L=rr(10,40);g.strokeStyle='rgba(255,255,255,'+(.25+rng()*.6).toFixed(2)+')';g.lineWidth=rr(1.5,4);
   g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-3,3),y+L);g.stroke();}
  for(let i=0;i<120;i++){g.fillStyle='rgba(255,255,255,'+(.3+rng()*.5).toFixed(2)+')';g.beginPath();g.arc(rng()*w,rng()*h,rr(1.5,4),0,TAU);g.fill();}});
 TEX_FOAM.wrapS=TEX_FOAM.wrapT=THREE.RepeatWrapping;
 const MAT_FOAM=new THREE.MeshBasicMaterial({map:TEX_FOAM,transparent:true,opacity:.85,depthWrite:false,side:THREE.DoubleSide,fog:true});
 TICKS.push(dt=>{TEX_FOAM.offset.y-=dt*.55;});
 const fp=[],fu=[];let vAcc=0,lips=0;
 for(let i=0;i<SM.length-1;i++){const A=SM[i],B=SM[i+1],slope=(B.y-A.y)/5,k=smooth(.1,.3,slope);/* the river comes DOWN toward the bay: upstream is the larger u */
  if(k>0){const ww=Math.min(A.w,B.w)*.85*k,ya=A.y+.22,yb=B.y+.22;
   fp.push(A.x-ww*SQ,ya,A.z-ww*SQ, B.x-ww*SQ,yb,B.z-ww*SQ, B.x+ww*SQ,yb,B.z+ww*SQ,  A.x-ww*SQ,ya,A.z-ww*SQ, B.x+ww*SQ,yb,B.z+ww*SQ, A.x+ww*SQ,ya,A.z+ww*SQ);
   fu.push(0,vAcc, 0,vAcc+.17, 1,vAcc+.17, 0,vAcc, 1,vAcc+.17, 1,vAcc);}
  vAcc+=.17;
  // a RIMSTONE LIP where a tread's pool spills onto the riser below it: a cream
  // crescent across the channel, bowed downstream, standing just above the pool
  if(B.k>.5&&!B.ramp&&A.ramp&&B.y>A.y+1.2){const pts=[],w=B.w*1.05,n=11;
   for(let j=0;j<=n;j++){const t=j/n-.5,v=B.v+t*2*w,bow=5.5*(1-4*t*t),P=XZ(B.u-2.2-bow,v);const yy=B.y+.28-Math.abs(t)*.3;pts.push([P[0],yy,P[1],.55+.5*(1-Math.abs(t)*1.6)]);}
   hgTube(pts,CRUST,6);lips++;
   // the crust apron under the lip, draped down the riser: a second, lower, wider lip
   const pts2=[];for(let j=0;j<=n;j++){const t=j/n-.5,v=B.v+t*2*w*1.08,bow=9*(1-4*t*t),P=XZ(B.u-5-bow,v);pts2.push([P[0],B.y-1.3-Math.abs(t)*.4,P[1],.7]);}
   hgTube(pts2,CRUST2,5);}}
 if(fp.length){const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(fp,3));fg.setAttribute('uv',new THREE.Float32BufferAttribute(fu,2));
  const fm=new THREE.Mesh(fg,MAT_FOAM);fm.userData.probeSkip=true;fm.userData.inspectLabel='The cascades';fm.renderOrder=2;scene.add(fm);}
 window._lips=lips;
 // the SHELF POOLS on the shore: each mound carries a stair of rimstone pools
 // stepping down toward the sea -- a lip ring, a crust skirt and a water disc apiece
 SHELVES.forEach((S,si)=>{const c=S.xz,top=groundH(c[0],c[1]);
  const gx=bayIn(c[0]+6,c[1])-bayIn(c[0]-6,c[1]),gz=bayIn(c[0],c[1]+6)-bayIn(c[0],c[1]-6),gl=Math.hypot(gx,gz)||1,dir=[-gx/gl,-gz/gl];   // downhill: toward the water
  for(let k=0;k<S.n;k++){const cx=c[0]+dir[0]*k*8.5+rr(-2,2),cz=c[1]+dir[1]*k*8.5+rr(-2,2),y=top+1.3-k*.62,rx=rr(5.5,8.5)*(1-k*.06),rz=rx*rr(.65,.85),ra=Math.atan2(dir[1],dir[0])+rr(-.3,.3),n=22,ring=[],skirt=[];
   for(let j=0;j<n;j++){const a=j/n*TAU,e=1+.1*(fbm(Math.cos(a)*2+si*3+k,Math.sin(a)*2,707,2)-.5)*2,px=Math.cos(a)*rx*e,pz=Math.sin(a)*rz*e;
    const wx=cx+px*Math.cos(ra)-pz*Math.sin(ra),wz=cz+px*Math.sin(ra)+pz*Math.cos(ra);ring.push([wx,y+.22,wz,.42]);skirt.push([wx,wz]);}
   hgTube(ring,CRUST,5,true);
   for(let j=0;j<n;j++){const a=skirt[j],b=skirt[(j+1)%n],o=1.9,ya=y+.1,yb=y-1.7;
    const ax=a[0]+(a[0]-cx)/rx*o,az=a[1]+(a[1]-cz)/rx*o,bx=b[0]+(b[0]-cx)/rx*o,bz=b[1]+(b[1]-cz)/rx*o;
    hgTri([a[0],ya,a[1]],[bx,yb,bz],[b[0],ya,b[1]],CRUST2);hgTri([a[0],ya,a[1]],[ax,yb,az],[bx,yb,bz],CRUST2);}
   const wc=POOL_COL.clone().lerp(POOL_PALE,rr(.3,.7)).convertSRGBToLinear();
   for(let j=0;j<n;j++){const a=skirt[j],b=skirt[(j+1)%n];wgTri([cx,y,cz],[b[0],y,b[1]],[a[0],y,a[1]],wc);}}
  REGISTER({name:'Shelf pools (rimstone terraces)',x:c[0],z:c[1],y:top-2,r:44,h:8});});
 // bake the crust and the shelf water
 const TEX_CRUST=BIO.canvasTex(256,256,(g,w,h)=>{g.fillStyle='#e6e0d2';g.fillRect(0,0,w,h);
  for(let i=0;i<120;i++){const x=rng()*w,y=rng()*h;g.strokeStyle='rgba('+(rng()<.5?'150,140,120':'250,248,240')+','+(.2+rng()*.35).toFixed(2)+')';g.lineWidth=rr(1,3);g.beginPath();g.moveTo(x,y);g.lineTo(x+rr(-3,3),y+rr(10,40));g.stroke();}
  for(let i=0;i<60;i++){g.fillStyle='rgba(170,160,140,.25)';g.beginPath();g.ellipse(rng()*w,rng()*h,rr(4,14),rr(2,5),0,0,TAU);g.fill();}});
 const hgeo=new THREE.BufferGeometry();hgeo.setAttribute('position',new THREE.Float32BufferAttribute(HG.pos,3));hgeo.setAttribute('normal',new THREE.Float32BufferAttribute(HG.nor,3));hgeo.setAttribute('color',new THREE.Float32BufferAttribute(HG.col,3));hgeo.setAttribute('uv',new THREE.Float32BufferAttribute(HG.uv,2));
 const hm=new THREE.Mesh(hgeo,new THREE.MeshLambertMaterial({map:TEX_CRUST,vertexColors:true,side:THREE.DoubleSide}));hm.userData.probeSkip=true;hm.userData.inspectLabel='Travertine crust (rimstone)';scene.add(hm);window._crustTris=HG.pos.length/9;
 const wgeo=new THREE.BufferGeometry();wgeo.setAttribute('position',new THREE.Float32BufferAttribute(WATER_GEO.pos,3));wgeo.setAttribute('color',new THREE.Float32BufferAttribute(WATER_GEO.col,3));
 const wm=new THREE.Mesh(wgeo,MAT_WATER);wm.userData.probeSkip=true;wm.userData.inspectLabel='Shelf pools';wm.renderOrder=1;scene.add(wm);})();

// ---------------------------------------------------------------- the columnar basalt
// A headland of hexagonal columns on a hex grid, their tops stepping with a
// noise field (the Causeway): one InstancedMesh, dark grey, charged to the host.
(function(){const B=BASALT,c=XZ(B.u,B.v),pitch=2.3,R=Math.max(B.ru,B.rv)*1.2,list=[];
 const nI=Math.ceil(R/pitch),nJ=Math.ceil(R/(pitch*.866));
 for(let j=-nJ;j<=nJ;j++)for(let i=-nI;i<=nI;i++){const x=c[0]+(i+(j&1?.5:0))*pitch,z=c[1]+j*pitch*.866,k=basaltK(x,z);if(k<.45)continue;
  const g=groundH(x,z);if(g<-1.5)continue;const h=1.0+6.5*smooth(.3,.72,fbm(x*.022,z*.022,74,2))*k+rr(-.25,.25)+smooth(-1,1,g)*0;list.push([x,g-1.5,z,h+1.5]);}
 if(!list.length)return;
 const geo=new THREE.CylinderGeometry(1.22,1.22,1,6,1,false).translate(0,.5,0);
 const mat=new THREE.MeshLambertMaterial({color:0xffffff});
 const im=new THREE.InstancedMesh(geo,mat,list.length),M=new THREE.Matrix4(),P=new THREE.Vector3(),Q=new THREE.Quaternion(),Sc=new THREE.Vector3(),col=new Float32Array(list.length*3),cc=new THREE.Color();
 list.forEach((L,i)=>{P.set(L[0],L[1],L[2]);Q.setFromAxisAngle(new THREE.Vector3(0,1,0),rr(-.06,.06));Sc.set(1,L[3],1);M.compose(P,Q,Sc);im.setMatrixAt(i,M);
  cc.set(0x3a3a40).offsetHSL(rr(-.02,.02),0,rr(-.05,.06)).convertSRGBToLinear();col[i*3]=cc.r;col[i*3+1]=cc.g;col[i*3+2]=cc.b;});
 im.instanceColor=new THREE.InstancedBufferAttribute(col,3);im.userData.inspectLabel='Columnar basalt';im.userData.host=true;scene.add(im);   // not probeSkip: the columns are what fills the headland's registered volume
 window._basaltColumns=list.length;
 REGISTER({name:'The basalt headland (columnar)',x:c[0],z:c[1],y:0,r:R,h:16});})();

// ---------------------------------------------------------------- the far country
// A coarse second terrain, 18 km across (70 m cells), carrying what the map's
// edge would otherwise cut off: the VOLCANO in the south-east across the
// water (a concave-flanked cone with a notched summit, a parasitic cone, ash
// gullies, a plume leaning east), the INNER WALL -- a high ridge on the N and
// W horizon, low toward the sea -- and the water the bay opens into in the
// SE. Inside the map it duplicates groundH two metres down so the fine mesh
// always wins. Host-only; the biome never sees it.
const VOLC={c:[5600,5600],R:3400,H:1900};
function farH(x,z){
 const d=Math.hypot(x-VOLC.c[0],z-VOLC.c[1]),ang=Math.atan2(z-VOLC.c[1],x-VOLC.c[0]);
 let h=8+70*(fbm(x*.00045,z*.00045,301,3)-.5)+14*(fbm(x*.0021,z*.0021,304,2)-.5);
 const t=clamp(1-d/VOLC.R,0,1);
 const ridges=1+.10*(fbm(ang*2.2+9,d*.0011,302,3)-.5)*2*smooth(.05,.5,t);            // ridges and gullies down the flanks
 h+=VOLC.H*Math.pow(t,1.75)*ridges-300*smooth(560,180,d);                              // the cone, the summit notch
 const d2=Math.hypot(x-(VOLC.c[0]-1500),z-(VOLC.c[1]-1350));h+=420*Math.pow(clamp(1-d2/950,0,1),1.5);   // the parasitic cone
 const rd=Math.hypot(x-CENTER[0],z-CENTER[1]),ra=Math.atan2(z-CENTER[1],x-CENTER[0]);
 const nw=(-(x-CENTER[0])-(z-CENTER[1]))/Math.max(1,rd),wallK=smooth(-.2,.6,nw);           // which way the Inner Wall is: NW
 h+=(220+1500*wallK)*smooth(5800,8000,rd)*(.55+.45*fbm(ra*4+3,rd*.0007,303,3));        // the Inner Wall ridge, ringing the N and W
 const u=uvOf(x,z)[0],v=uvOf(x,z)[1];h-=34*smooth(-1300,-2500,u)*smooth(2600,1100,Math.abs(v));   // the water the bay opens into
 return h;}
(function(){const S=18000,N=260,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);g.translate(CENTER[0],0,CENTER[1]);
 const p=g.attributes.position,col=new Float32Array(p.count*3),c=new THREE.Color(),t=new THREE.Color();
 const NEAR=TERR.R*1.1,SAV=new THREE.Color(0x8e7a4c),ASH=new THREE.Color(0x5a5452),LAVA2=new THREE.Color(0x36302e),CAP=new THREE.Color(0xc8c0b4),RIM=new THREE.Color(0x6e7878),RIM2=new THREE.Color(0x8a8e86),BED=new THREE.Color(0x6a7a70),FOR=new THREE.Color(0x4e6a3e);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),dx=Math.abs(x-CENTER[0]),dz=Math.abs(z-CENTER[1]),inside=Math.max(dx,dz)<NEAR;
  let y;if(inside){const e=smooth(NEAR,NEAR-220,Math.max(dx,dz));y=groundH(x,z)-2*e;
   for(const S of SINKS)if(Math.hypot(x-S.x,z-S.z)<S.r*S.e*1.4+100)y=Math.min(y,S.floorY-6);
   y-=6*tsingyK(x,z);}                                                                   // and further down under the tsingy, whose fins and floor its cells cannot follow   // well under a sinkhole (its 70 m cells would bridge the hole)
  else y=farH(x,z);p.setY(i,y);
  const d=Math.hypot(x-VOLC.c[0],z-VOLC.c[1]),up=clamp(y/VOLC.H,0,1),n=fbm(x*.0012,z*.0012,305,2)-.5;
  const ang=Math.atan2(z-VOLC.c[1],x-VOLC.c[0]),flow=smooth(.56,.7,fbm(ang*5+2,d*.0016,306,2))*smooth(.1,.3,up)*smooth(.9,.6,up);   // lava flows: dark tongues down from the notch
  const rd=Math.hypot(x-CENTER[0],z-CENTER[1]),volcK=smooth(3600,2600,d);
  c.copy(FOR).lerp(SAV,smooth(.0,.12,up)*.6).lerp(ASH,(smooth(.03,.25,up)+smooth(2400,1400,d)*.5)*volcK).lerp(LAVA2,clamp(.35+n*1.4,0,1)*smooth(.2,.6,up)*volcK).lerp(CAP,smooth(.72,.9,up)*.85).lerp(new THREE.Color(0x241c1a),flow*.9*volcK);
  c.lerp(RIM,smooth(5900,7400,rd)*.9).lerp(RIM2,smooth(800,1500,y)*.6).lerp(BED,smooth(2,-12,y));
  c.multiplyScalar(1+n*.12).convertSRGBToLinear();col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));g.computeVertexNormals();
 const fm=new THREE.MeshLambertMaterial({vertexColors:true,color:0xa8a49c});
 fm.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uDetail;varying vec3 vGWP;')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 dt=texture2D(uDetail,vGWP.xz*0.012).rgb;vec3 dt2=texture2D(uDetail,vGWP.xz*0.0017+0.37).rgb;diffuseColor.rgb*=mix(vec3(1.0),dt*dt2*1.12,0.8);}');};
 const m=new THREE.Mesh(g,fm);m.userData.probeSkip=true;m.userData.inspectLabel='The far country (the volcano, the Inner Wall)';m.renderOrder=0;scene.add(m);
 // the far water: one flat plane under it all, the bay's deep colour
 const wg=new THREE.PlaneGeometry(S,S,1,1);wg.rotateX(-Math.PI/2);wg.translate(CENTER[0],-.15,CENTER[1]);
 const wc=WATER_DEEP.clone().convertSRGBToLinear(),wcol=new Float32Array(4*3);for(let i=0;i<4;i++){wcol[i*3]=wc.r;wcol[i*3+1]=wc.g;wcol[i*3+2]=wc.b;}
 wg.setAttribute('color',new THREE.BufferAttribute(wcol,3));const wm=new THREE.Mesh(wg,MAT_WATER);wm.userData.probeSkip=true;wm.userData.inspectLabel='The outer water';wm.renderOrder=0;scene.add(wm);
 // the plume: a chain of soft grey globes off the summit, rising and leaning east, fading as it goes
 const smoke=new THREE.MeshBasicMaterial({color:0xb4b0ac,transparent:true,opacity:.30,depthWrite:false,fog:true});
 const sx=VOLC.c[0],sz=VOLC.c[1],sy=farH(sx,sz)+80;
 for(let i=0;i<16;i++){const tt=i/15,r=170+tt*980,mesh=new THREE.Mesh(new THREE.SphereGeometry(r,14,10),smoke.clone());
  mesh.material.opacity=.32*(1-tt*.8);mesh.position.set(sx+tt*tt*2600+Math.sin(i*2.1)*90,sy+250+tt*2300+Math.cos(i*1.7)*60,sz+Math.sin(i*1.3)*120);
  mesh.userData.probeSkip=true;mesh.userData.inspectLabel='The plume';mesh.renderOrder=2;scene.add(mesh);}
 // fumaroles: three thin plumes off the flanks, leaning the same way
 [[1100,.9],[1500,2.4],[900,4.1]].forEach(F=>{const fx=VOLC.c[0]+Math.cos(F[1])*F[0],fz=VOLC.c[1]+Math.sin(F[1])*F[0],fy=farH(fx,fz)+20;
  for(let i=0;i<7;i++){const tt=i/6,r=40+tt*150,mesh=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),smoke.clone());mesh.material.opacity=.26*(1-tt*.8);
   mesh.position.set(fx+tt*tt*420,fy+80+tt*520,fz+Math.sin(i*1.9)*30);mesh.userData.probeSkip=true;mesh.userData.inspectLabel='A fumarole';mesh.renderOrder=2;scene.add(mesh);}});
})();
