// ================================================================= YS CITY — the world: constants and the natural ground
// x east, z south, north is -z, y up, sea level y = 0. The map is CITY.WORLD square about the origin. The coast runs
// from the south-middle edge to the north-east corner as a concave bay (DESIGN §2): land to the north-west, the
// Ring Sea to the south-east. Phase 0 gives the bay its shape and a gentle hinterland; the karst, the river and its
// travertine terraces, the old city's sink and the far country (volcano SE, Inner Wall N/W) come with phase 3.
const CITY={WORLD:3200,HW:1600,SEA0:0,
 // the shoreline, traced from the south-middle edge to the NE corner; the city stands at the head of the bay
 SHORE:[[0,1600],[70,1180],[190,760],[330,330],[450,-100],[640,-520],[950,-900],[1290,-1250],[1600,-1600]],
 HEAD:[380,-60],     // the head of the bay: the main market stands near here
 // the karst stacks (Krabi): {x,z,r,h}; the first two carry the Citadel (E) and the Temple of the Winds (D)
 STACKS:[{x:842,z:652,r:95,h:62,n:'the Citadel stack',flat:true},{x:1204,z:-89,r:70,h:48,n:"the Winds' stack",flat:true},{x:1360,z:230,r:55,h:70,n:'the Needle'},
  {x:1120,z:720,r:48,h:58,n:'the Tooth'},{x:-60,z:1260,r:120,h:96,n:'the Headland stack'},
  {x:930,z:-820,r:72,h:74,n:'the Lantern'},{x:1270,z:-1150,r:80,h:88,n:'the Anvil'},{x:-420,z:-520,r:110,h:118,n:'the Inland stack'}],
 // the river: from the north-west down to the bay west of the civilian harbour, in travertine terraces (Semuc Champey)
 RIVER:{pts:[[260,790],[165,710],[-60,520],[-300,330],[-560,140],[-860,-80],[-1200,-300],[-1550,-520],[-1760,-680]],w0:34,w1:14,depth:6,rise:3.2,meander:22},   /* from past the map's edge to 100 m out in the bay (Travis: the whole map) */
};
// signed distance to the shore polyline: > 0 inland (north-west of the line), < 0 at sea. The polyline runs
// south to north-east, so the land is on its LEFT (cross product > 0 when x east, z south).
function ysShoreDist(x,z){let best=1e9,sign=1;const P=CITY.SHORE;
 for(let i=0;i<P.length-1;i++){const ax=P[i][0],az=P[i][1],bx=P[i+1][0],bz=P[i+1][1];const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1;
  const t=clamp(((x-ax)*dx+(z-az)*dz)/L2,0,1);const qx=ax+dx*t,qz=az+dz*t;const d=Math.hypot(x-qx,z-qz);
  if(d<best){best=d;sign=(dx*(z-az)-dz*(x-ax))>0?-1:1;}}
 return best*sign;}
// THE KARST (Krabi). A stack is {x,z,r,h,n} and may be a RIDGE: e (≥1) stretches it along the axis bearing a (radians, from
// +x toward +z), so it runs r·e along the axis and r across it. Its plan wanders ±20 % (fbm on the bearing), its walls are
// near-vertical over 8 m, and its top is a domed jungle crown (a ridge's crest rises and falls into several summits) unless
// `flat` (the Citadel's and the Winds' stacks carry buildings: the layout sizes those two to their landmark's footprint). Stacks are looked up through a 200 m bucket rebuilt when
// CITY.STACKS changes (ysStacksDirty()), so a field of sixty costs what nine did.
let YS_STK=null;function ysStacksDirty(){YS_STK=null;}
function ysStackReach(s){return s.r*(s.e||1)*1.3+14;}
function ysStacksNear(x,z){if(!YS_STK){YS_STK={n:CITY.STACKS.length,m:new Map()};for(const s of CITY.STACKS){const R=ysStackReach(s);
   for(let j=Math.floor((s.z-R)/200);j<=Math.floor((s.z+R)/200);j++)for(let i=Math.floor((s.x-R)/200);i<=Math.floor((s.x+R)/200);i++){const k=i+','+j;let L=YS_STK.m.get(k);if(!L)YS_STK.m.set(k,L=[]);L.push(s);}}}
 else if(YS_STK.n!==CITY.STACKS.length){YS_STK=null;return ysStacksNear(x,z);}
 return YS_STK.m.get(Math.floor(x/200)+','+Math.floor(z/200))||[];}
// the stack's local frame: u along the axis (shrunk by e), v across; d the scaled distance, th the bearing in that frame
function ysStackLocal(s,x,z){const dx=x-s.x,dz=z-s.z,a=s.a||0,c=Math.cos(a),sn=Math.sin(a);const u=(dx*c+dz*sn)/(s.e||1),v=-dx*sn+dz*c;return {d:Math.hypot(u,v),th:Math.atan2(v,u),u};}
function ysStackRR(s,th){return s.r*(1+(s.flat?.14:.4)*(fbm(Math.cos(th)*2.2+s.x*.013,Math.sin(th)*2.2+s.z*.013,3.1,2)-.5));}   // the plan wanders ±20 % (±7 % on a landmark's stack: its building must fit)
// the distance from a stack's centre to its wall along the world bearing phi (the plan is an ellipse that wanders)
function ysStackEdge(s,phi){const e=s.e||1,a=s.a||0;const L=ysStackLocal(s,s.x+Math.cos(phi)*s.r,s.z+Math.sin(phi)*s.r);const k=Math.sqrt(Math.cos(phi-a)*Math.cos(phi-a)/(e*e)+Math.sin(phi-a)*Math.sin(phi-a))||1;return ysStackRR(s,L.th)/k;}
// the karst field: 1 on a stack, falling to 0 over 20 m outside it (the biome masks its ground plants off the cliffs)
function ysKarst(x,z){let k=0;for(const s of ysStacksNear(x,z)){const L=ysStackLocal(s,x,z);const t=clamp((s.r+10-L.d)/20,0,1);k=Math.max(k,t*t*(3-2*t));}return k;}
// a stack's height above the ground it stands on: a near-vertical wall over 8 m, then the crown
function ysKarstH(x,z,g){let h=g;for(const s of ysStacksNear(x,z)){const L=ysStackLocal(s,x,z);if(L.d>s.r*1.25+12)continue;
  const rr=ysStackRR(s,L.th);const t=clamp((rr-L.d)/8,0,1);if(t<=0)continue;const w=t*t*(3-2*t);
  let top=Math.max(g,0)+s.h*(1+(s.flat?.03:.16)*(fbm(x/23+s.x,z/23,4.4,2)-.5));   /* a landmark's stack is near flat on top */
  if(!s.flat){const q=clamp(L.d/rr,0,1);top=Math.max(g,0)+(top-Math.max(g,0))*(1-.32*q*q);   // the domed crown
   if((s.e||1)>1.3)top=Math.max(g,0)+(top-Math.max(g,0))*(.72+.28*fbm(L.u/55+s.z*.01,s.x*.01,7.7,2));}   // a ridge's summits
  h=Math.max(h,g+(top-g)*w);}return h;}
// the karst's colours (Krabi), read by the terrain painter (71-port-terrain's Ys hook): a stack's crown and gentler
// shoulders are jungle in patches of darker and lighter green, its walls pale limestone with rust-tan and grey streaks
// where the water runs down; the feather outside the wall blends into the port's ground
// the bay's ground (phase 3, Oct 5 2026): the port painted red soil and dry grass; Ys's natural ground above the beach is the
// jungle floor, dark green with damp patches, leaf litter in the hollows, paler and drier on the upland toward the Inner
// Wall, bare rock where it is steep. A stamp's paint (the farms' soil, the paved precincts) is kept. Linear, like the port's.
function ysGroundLush(x,z,h,sl,c){const pt=typeof portPaint==='function'?portPaint(x,z):null;if(h<2.4||(pt&&pt!=='soil'))return c;const soil=pt==='soil';   /* the farms' soil paint is tilled ground in a green land: half-way to the floor */
 const n=fbm(x/160,z/160,2.7,3),n2=fbm(x/17,z/17,8.1,2),n3=fbm(x/55,z/55,5.3,2);const up=clamp((ysNatBase(x,z)-6)/50,0,1);
 const G=[.21,.29,.14],Dk=[.13,.20,.10],Lt=[.34,.37,.18],Li=[.31,.25,.15];
 const damp=clamp((n-.5)*3,0,1),lit=clamp((n3-.58)*4,0,1)*(1-damp);let m=[0,1,2].map(i=>(G[i]+(Dk[i]-G[i])*damp)*(1-up)+Lt[i]*up);
 m=m.map((v,i)=>(v+(Li[i]-v)*lit*.7)*(.9+(n2-.5)*.24));
 if(sl>.55){const t=clamp((sl-.55)*2.5,0,1);m=m.map((v,i)=>v+([.44,.40,.36][i]-v)*t);}
 const fade=clamp((h-2.4)/1.6,0,1)*(soil?.45:1);const lin=m.map(v=>Math.pow(clamp(v,0,1),1.9));return [0,1,2].map(i=>c[i]+(lin[i]-c[i])*fade);}
function ysGroundTint(x,z,h,sl,c){c=ysGroundLush(x,z,h,sl,c);const k=ysKarst(x,z);if(k<=0)return c;
 const n=fbm(x/38,z/38,6.1,3),jt=.8+.4*n;const J=[.15*jt,.29*jt,.11*jt];
 const st=fbm(x*.09+z*.05,h*.006,2.7,3),gr=fbm(x*.13-z*.07,h*.01,9.4,2);const L=[.66,.63,.57],O=[.68,.44,.26],D=[.36,.36,.34];
 const o=clamp((st-.45)*2.4,0,1)*.8,d=clamp((gr-.55)*2.5,0,1)*.6;const f=.82+.18*fbm(x/6,z/6,h/8,1);
 const R=[0,1,2].map(i=>(L[i]+(O[i]-L[i])*o+(D[i]-L[i])*d)*f);
 const steep=clamp((sl-.8)/1.1,0,1);const m=[0,1,2].map(i=>J[i]+(R[i]-J[i])*steep);
 return [0,1,2].map(i=>c[i]+(m[i]-c[i])*k);}
// the river valley: the ground within 2.6 widths of the river's centre line falls to the bed, which descends in terraces
// to the sea. The bed follows a profile sampled along the centre line every 10 m: the natural ground smoothed over
// ±100 m, then the running minimum from upstream (so the bed never falls going up the valley), `depth` m under it,
// quantised to `rise` m steps: a flat pool wherever the land climbs slowly, a stair of pools where it climbs fast, with a
// rimstone lip at the downstream edge of every pool. Returns the carved height.
function ysRiverProfile(){const R=CITY.RIVER;if(R.prof)return R.prof;const DS=10,P=R.pts,seg=[];let acc=0;
 // Travis (Oct 5 2026: the river looked unnatural): the centre line is a Catmull-Rom spline through the points with a
 // meander across it (two sines of the arc length, R.meander m, fading in over the first 300 m so the mouth stays put),
 // sampled every 20 m; every reader of the river (ysRiverDist, the placer, the water strip) walks `seg`
 const CR=(p0,p1,p2,p3,t)=>{const t2=t*t,t3=t2*t;const f=i=>.5*(2*p1[i]+(-p0[i]+p2[i])*t+(2*p0[i]-5*p1[i]+4*p2[i]-p3[i])*t2+(-p0[i]+3*p1[i]-3*p2[i]+p3[i])*t3);return [f(0),f(1)];};
 const fine=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];const L=Math.hypot(p2[0]-p1[0],p2[1]-p1[1]);const n=Math.max(2,Math.round(L/20));for(let j=0;j<n;j++)fine.push(CR(p0,p1,p2,p3,j/n));}fine.push(P[P.length-1]);
 const pts=[];let s=0;for(let i=0;i<fine.length;i++){if(i)s+=Math.hypot(fine[i][0]-fine[i-1][0],fine[i][1]-fine[i-1][1]);const a=fine[Math.max(0,i-1)],b=fine[Math.min(fine.length-1,i+1)];let tx=b[0]-a[0],tz=b[1]-a[1];const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;
  const m=(R.meander||0)*(Math.sin(s/260)+.4*Math.sin(s/95+1.7))*Math.min(1,s/300);pts.push([fine[i][0]-tz*m,fine[i][1]+tx*m]);}
 for(let i=0;i<pts.length-1;i++){const L=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);if(L<.01)continue;seg.push({a:pts[i],b:pts[i+1],L,s0:acc});acc+=L;}
 const n=Math.ceil(acc/DS)+1,raw=new Float64Array(n);
 for(let k=0;k<n;k++){const s=Math.min(k*DS,acc);let e=seg[seg.length-1];for(const q of seg)if(s<=q.s0+q.L){e=q;break;}const t=e.L?(s-e.s0)/e.L:0;raw[k]=ysNatBase(e.a[0]+(e.b[0]-e.a[0])*t,e.a[1]+(e.b[1]-e.a[1])*t);}
 const sm=new Float64Array(n),K=10;for(let k=0;k<n;k++){let a=0,c=0;for(let j=-K;j<=K;j++){const q=k+j;if(q<0||q>=n)continue;a+=raw[q];c++;}sm[k]=a/c;}
 const bed=new Float64Array(n),start=new Float64Array(n);let m=1e9;for(let k=n-1;k>=0;k--){m=Math.min(m,sm[k]-R.depth);bed[k]=R.rise*Math.floor(m/R.rise);}
 for(let k=0;k<n;k++)start[k]=k>0&&bed[k]===bed[k-1]?start[k-1]:k*DS;
 return R.prof={DS,len:acc,seg,bed,start,pools:new Set(Array.from(start)).size};}
// the nearest point of the river: d the distance from its centre line, s the distance up the river from the mouth,
// w the river's width there (the valley is 2.6 w wide). The placer and the painter keep off the valley with it.
function ysRiverDist(x,z){const R=CITY.RIVER,pr=ysRiverProfile();let best=null;
 for(const e of pr.seg){const dx=e.b[0]-e.a[0],dz=e.b[1]-e.a[1];const t=clamp(((x-e.a[0])*dx+(z-e.a[1])*dz)/(e.L*e.L||1),0,1);
  const d=Math.hypot(x-(e.a[0]+dx*t),z-(e.a[1]+dz*t));if(!best||d<best.d)best={d,s:e.s0+t*e.L};}
 best.w=R.w0+(R.w1-R.w0)*clamp(best.s/pr.len,0,1);return best;}
function ysRiverY(x,z,g){const R=CITY.RIVER,pr=ysRiverProfile();const best=ysRiverDist(x,z);const s=best.s,w=best.w;
 if(best.d>w*2.6)return g;   /* the valley 2.6 widths wide (Travis: it read as a ditch) */
 const k=Math.min(pr.bed.length-1,Math.round(s/pr.DS));const bed=pr.bed[k];const f=s-pr.start[k];
 const lip=f<8?R.rise*.55*(1-f/8):0;   // the rimstone lip at the downstream edge
 const bank=clamp((best.d-w*.5)/(w*2.1),0,1);const bk=bank*bank*(3-2*bank);
 const floor=bed+lip;const carved=floor+(g-floor)*bk;return Math.min(g,carved);}
// the natural ground before any stamp: a wandering shore, a beach, a hinterland rising gently toward the Inner Wall,
// a seabed falling to ~30 m in the bay; the stacks stand on it and the river is carved through it. Continuous everywhere.
function YS_NAT(x,z){let g=ysNatBase(x,z);
 // the sink: under the drowned grid the seabed is the old city plane (87-city-layout.js), blended in over the outer streets
 if(typeof ysSinkMix==='function'){const w=ysSinkMix(x,z);if(w>0)g=g*(1-w)+ysSinkY(x,z)*w;}
 return ysRiverY(x,z,ysKarstH(x,z,g));}   // the stacks stand up out of the sink too; the river is carved last
function ysNatBase(x,z){
 const wander=22*(fbm(x/900+1.3,z/900+4.1,2.3,3)-.5)+6*(fbm(x/120,z/120,5.7,2)-.5);
 const d=ysShoreDist(x,z)+wander;
 if(d<0){const s=-d;const q=Math.pow(s/420,1.4),f=1-Math.exp(-q);
  return .5-30.5*f+(fbm(x/150,z/150,3.3,2)-.5)*2.4*clamp(s/70,0,1);}
 if(d<60){const s=d/60;return .5+3.2*s*s*(3-2*s);}
 const u=d-60;
 return 3.7+u*.018+(fbm(x/520,z/520,1.7,3)-.5)*22*clamp(u/300,0,1)+(fbm(x/70,z/70,8.2,2)-.5)*1.4*clamp(u/40,0,1);}
