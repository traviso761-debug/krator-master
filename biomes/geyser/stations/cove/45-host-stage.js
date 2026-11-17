// ================================================================= HOST — STATION 7, THE BOILING BAY (`--station cove`; PLAN-STATIONS.md, "Showcase Station #4")
// Gemini's showcase station #4 on scale model 5.1 (openworld/GEOLOGY-STATIONS-5.1.md, station 4): a crescent phreatic explosion cove on the Steampits'
// Ring Sea shore, seen from a skiff off its mouth. It replaces the showcase's stage (src/45: the basin, the Stair, the creek) with the cove's; every other
// fragment of src/ reads the same names (BASIN, STAIR, shoreZ, landH, CREEK, THERMAL...), so the kit's land (47), ground (84), far field (85), build (88)
// and water (89w-host-water) run unchanged on it.
//
// WHERE (scale model 5.1, 2 km a pixel; surveyed 2026-11-16 with tools/scale-model's smodel.page): px 884,716 (the 4.23 canvas 612,386), on the
// Steampits' Ring Sea shore 77 km west-south-west of Port Goto (918,698) and 38 km east of the settlement Boiling Bay (866,723): the ground -1,494 m, the Ring Sea
// at -1,500 m a cell to the south-east (888,720), XA (XV 24 km north), 1,600 mm, mean +33 degC (warmest month +37, coldest +29). The spec's 1.93 atm:
// water boils at ~119 degC; the cove's own water mixes at 65-106 degC. The model has no vent here and no cove (its 2 km cells cannot hold one): the
// station draws both, as an ideal type, on today's ground (the map change it wants is in KNOWN_ISSUES.md for the scale-model queue).
//
// THE MAP (x east, z south, y up from the Ring Sea's level, -1,500 m; R 1400):
//   THE COVE        a phreatic explosion crater ~720 m across (CC, RC), breached by the sea to the south-south-east (UO): a crescent of rim from the
//                   west horn round the north to the east horn, its bay -3 to -17 m deep and boiling where its vents are (87: the bay's boils)
//   THE APRON       the tide line round the bay (RS..RS+40, +1.6 to +4.8 m): opaline geyserite aprons, the littoral cone geysers, boiling springs
//                   whose run-off falls straight into the surf
//   THE BENCH       a raised wave-cut bench (+12.5 to +15 m: the spec's -1,486 m bench) over a 9 m bluff of carbonate-shelf limestone and marl
//                   (KSTRATA's carbonate-shelf: the wave-notched visors), the acid field's bleached marl on it east of the dike
//   THE RIM         the crater's inner wall up to its crest (~30 m), the scald line on its top: the kit's pandans and kanuka, dead snags where the
//                   heat spread; the hyperjungle on the plateau behind (34-55 m)
//   THE DIKE        a black tibasalt dike rib (KSTRATA's tibasalt) from the rim north-east down across the bench and apron into the bay (an awash
//                   reef), the fault trace the fluids rise along: native sulphur chimneys crust it (87), its fumaroles reek, the limestone either
//                   side bleached and veined
//   THE LIME STAIR  the cove's travertine flight (the kit's terraces on the showcase's Stair machinery: STAIR) through a notch in the north rim from the
//                   Lime Kettle (a carbonate spring) down into the surf, laid down in couplets (KSTRATA lamina, 84)
//   THE CREEK       a jungle stream to the outer coast west of the cove (its tea-brown plume in the sea)
const ERRS=document.getElementById('errs');
function reportErr(m){ERRS.style.display='block';ERRS.textContent+=m+'\n';}
window.onerror=(m,s,l,c,e)=>reportErr((e&&e.stack)||(m+' @'+l+':'+c));
window.addEventListener('unhandledrejection',e=>reportErr('promise: '+(e.reason&&e.reason.stack||e.reason)));
{const _ce=console.error;console.error=function(...a){try{const m=String(a[0]||'');if(/shader error|WebGLProgram/.test(m))reportErr('shader: '+(m.match(/ERROR:[^\n]*/)||[m.slice(0,200)])[0]);}catch(e){}return _ce.apply(console,a);};}
window._t={t0:performance.now()};const _mark=k=>{window._t[k]=Math.round(performance.now()-window._t.t0);};
const TICKS=[];
function tick(fn){TICKS.push(fn);}
const REG=[];function REGISTER(o){REG.push(o);BIO.record(o);}
function regHas(r,x,y,z){const dx=x-r.x,dz=z-r.z;return dx*dx+dz*dz<=r.r*r.r&&y>=(r.y||0)-2&&y<=(r.y||0)+r.h+5;}

const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
// THE LIGHT: the showcase's (the same coast 46 km east): sea level under ~1.93 atm, hot and wet, the haze thick and pale with the cove's steam
const scene=new THREE.Scene();const HAZE=new THREE.Color(0xc4ccc2);scene.fog=new THREE.FogExp2(HAZE.getHex(),.00036);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,14000);
const hemi=new THREE.HemisphereLight(0xc4d4cc,0x48463a,.7);scene.add(hemi);
const SUN_POS=[-900,820,700];
const sun=new THREE.DirectionalLight(0xfff0d0,1.4);sun.position.set(...SUN_POS);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb0ccc4,.3);fill.position.set(900,400,-900);scene.add(fill);
// the sea breeze from the south-south-west: the steam leans in over the cove toward the north-north-east
const WIND=[.42,-.58];

// ---------------------------------------------------------------- the land before the thermal ground
const TERR={R:1400};
const SEA=0;   // the Ring Sea (local): -1,500 m on the scale model
const COVE={x:0,z:-10,RS:250,RC:360,crest:30,name:'The boiling cove (a phreatic explosion crater breached by the sea)'};
const CC=[COVE.x,COVE.z],RS=COVE.RS,RC=COVE.RC;
const UO=(function(){const a=.38,b=.925,l=Math.hypot(a,b);return[a/l,b/l];})();   /* the breach: toward the sea, south-south-east (bearing ~158) */
// a point by its bearing from the cove's centre (degrees clockwise from north) and distance
const covePt=(b,d)=>{const r=b*Math.PI/180;return[CC[0]+Math.sin(r)*d,CC[1]-Math.cos(r)*d];};
// the outer coast: s, metres inland from the shore line across the breach (the coast trends west-south-west to east-north-east)
const coastQ=(x,z)=>(x-CC[0])*UO[0]+(z-CC[1])*UO[1];
const coastT=(x,z)=>(x-CC[0])*UO[1]-(z-CC[1])*UO[0];
const coastWig=t=>16*Math.sin(t*.0042+1.3)+9*Math.sin(t*.0113+.4);
const coastS=(x,z)=>190+coastWig(coastT(x,z))-coastQ(x,z);
// the plateau behind the coast: the hyperjungle's bluff top, rising inland to the north
function plateauH(x,z){return 34+22*smooth(-250,-1500,z)+8*(fbm(x*.0012+3,z*.0012-1,8817,3)-.5)+3*(fbm(x*.005-2,z*.005+5,8819,2)-.5);}
// the coast before the cove: the outer bluff (the carbonate shelf's cliff, ~0.6 of the plateau within 38 m of the water), the sea floor past it
function baseH(x,z){const s=coastS(x,z);if(s<=0)return Math.max(-26,-2+s*.07);const P=plateauH(x,z);return -2+(P+2)*(.62*smooth(0,38,s)+.38*smooth(30,300,s));}
// THE CRATER's section in the rim's sector (d from its centre): the bay, the step up to the apron, the apron, the bluff, the bench, the wall, the crest;
// k the rim's sector (1 round the north, 0 in the breach), n the cosine to the breach
function craterN(x,z){const dx=x-CC[0],dz=z-CC[1],d=Math.hypot(dx,dz);return{d,n:d>1e-6?(dx*UO[0]+dz*UO[1])/d:0};}
const rimK=n=>smooth(.62,.4,n);
const bayH=d=>d<RS?-3-14*Math.max(0,1-(d/RS)*(d/RS)):-3;
function crestAt(x,z,n,b){return Math.max(COVE.crest+5*(fbm(x*.006,z*.006,8821,2)-.5),b+3)*(.62+.38*smooth(.5,.05,n));}
function rimProf(x,z,d,n,b){const ap=1.6+3.2*smooth(RS,RS+40,d)+.4*(fbm(x*.05,z*.05,8823,2)-.5),bench=12.5+2.5*smooth(RS+50,RS+82,d),cr=crestAt(x,z,n,b);
 let h=bayH(d);h=mix(h,ap,smooth(RS-6,RS+3,d));h=mix(h,bench,smooth(RS+40,RS+50,d));h=mix(h,cr,Math.pow(smooth(RS+80,RC,d),.8));
 return d<RC?h:Math.max(b,cr-(d-RC)*.22);}
// THE DIKE: a tibasalt rib along the fault trace, bearing 50 from the rim (d 395) down across the bench and apron into the bay (d 225)
const DIKE=(function(){const a=covePt(50,395),b=covePt(50,225);return{a,b,w:5.5,h:3.6,name:'The black dike (a tibasalt rib along the fault trace)'};})();
function dikeAt(x,z){const a=DIKE.a,b=DIKE.b,vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;const tc=clamp(t,0,1);
 return{d:Math.hypot(x-a[0]-vx*tc,z-a[1]-vz*tc),t};}
// the strata (core/terrain 35, KSTRATA; STRATA-PLAN.md section 11): the carbonate shelf's beds over a tibasalt sill (the sea's floor), the dike its own
// tibasalt column. The bluffs, the wall and the outer cliff are eased toward their bed's benches (S.terrace: a monotone map of h, by each bed's hardness:
// the hard bioclastic and oolite stand, the marl and the visors ease back), the paint takes each bed's colour (84, STATION_GROUND.paint)
const STRATA=typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:KRAND.hash(884716,0x57A7),formations:[{recipe:'tibasalt',base:-160,top:-7},{recipe:'carbonate-shelf',base:-7,top:180}],
 range:[-160,180],dip:[.3,.95,.004],warp:[3,1]});
const DIKE_ROCK=typeof KSTRATA==='undefined'?null:KSTRATA.create({seed:KRAND.hash(884716,0xD1CE),recipe:'tibasalt',range:[-80,120],warp:[1.5,.6]});
// where the land is a cliff (0..1): the bluff over the apron, the crater's wall, the outer coast's cliff
function cliffK(x,z,d,n){const s=coastS(x,z);return Math.max(rimK(n)*Math.max(smooth(RS+36,RS+42,d)*smooth(RS+54,RS+48,d),smooth(RS+78,RS+88,d)*smooth(RC+6,RC-4,d)),smooth(-2,4,s)*smooth(46,30,s));}
function coveH(x,z){const b=baseH(x,z),{d,n}=craterN(x,z),k=rimK(n);
 const open=mix(b,Math.min(b,bayH(d)),smooth(RC+80,RC-20,d));
 let h=k>0?mix(open,rimProf(x,z,d,n,b),k):open;
 const q=dikeAt(x,z);if(q.d<DIKE.w*2&&q.t>-.02&&q.t<1.02)h+=DIKE.h*smooth(DIKE.w,DIKE.w*.3,q.d)*smooth(-.02,.04,q.t)*smooth(1.02,.95,q.t)*(.8+.4*fbm(x*.15,z*.15,8825,2));
 if(STRATA&&h>-1){const c=cliffK(x,z,d,n);if(c>0)h=mix(h,STRATA.terrace(x,z,h,.85),c);}
 return h;}
// the shore (84's beach paint, 47's sea, 85's far colour, the Stair's foot): the bay's north arc where the crater is, else the outer coast
const outerZ=x=>{let z=CC[1]+(190-(x-CC[0])*UO[0])/UO[1];for(let i=0;i<3;i++)z=CC[1]+(190+coastWig(coastT(x,z))-(x-CC[0])*UO[0])/UO[1];return z;};
const shoreZ=x=>{const dx=x-CC[0];return Math.abs(dx)<RS*.98?Math.min(outerZ(x),CC[1]-Math.sqrt(RS*RS-dx*dx)):outerZ(x);};
// THE FIELD (the kit's floor: its trees and floor where it is, the hyperjungle off it): the crater inside its rim and the scald line on the rim's top
const BASIN={x:CC[0],z:CC[1],rx:RC,rz:RC,name:COVE.name};
const basinE=(x,z)=>Math.hypot(x-CC[0],z-CC[1])/RC;
const floorH=(x,z)=>coveH(x,z);
// THE LIME STAIR's line: through the notch in the north rim, its axis and half-width by z (the showcase's machinery: 47's terraceMask, 46's flight)
const STAIR={x0:-95,z0:-560,w:70,name:'The Lime Stair (travertine terraces into the surf)'};
const stairX=z=>STAIR.x0+9*Math.sin((z-STAIR.z0)*.012);
const stairW=z=>STAIR.w+10*Math.sin(z*.017+1.1);
const STAIR_TOP=34;
function stairU(x,z){const sz=shoreZ(stairX(z));return clamp((z-STAIR.z0)/(sz-STAIR.z0),0,1);}
const stairH=(x,z)=>{const u=stairU(x,z);return STAIR_TOP*(1-(u-.08*Math.sin(u*TAU)));};
const stairK=(x,z)=>smooth(stairW(z)+80,stairW(z)-15,Math.abs(x-stairX(z)))*smooth(STAIR.z0-60,STAIR.z0+40,z)*smooth(shoreZ(stairX(z))+30,shoreZ(stairX(z))+5,z);
const basinK=(x,z)=>{const{d,n}=craterN(x,z);return smooth(RC+70,RC+15,d)*smooth(.75,.55,n);};
function landH(x,z){const h=coveH(x,z),sk=stairK(x,z);return sk>0?mix(h,stairH(x,z),sk):h;}

// THE CREEK: from the plateau north-west of the cove down its ravine to the outer coast (graded: it never climbs)
const CREEK=(function(){const C=[[-1180,-1120],[-1080,-930],[-985,-730],[-905,-520],[-845,-300],[-790,-80],[-745,130],[-705,300],[-680,420],[-662,520],[-650,620]];
 const P=[];for(let i=0;i<C.length-1;i++){const p0=C[Math.max(0,i-1)],p1=C[i],p2=C[i+1],p3=C[Math.min(C.length-1,i+2)],n=Math.ceil(Math.hypot(p2[0]-p1[0],p2[1]-p1[1])/4);
  for(let k=0;k<n;k++){const t=k/n,t2=t*t,t3=t2*t;P.push([.5*((2*p1[0])+(-p0[0]+p2[0])*t+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3),
   .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)]);}}
 P.push(C[C.length-1]);
 const n=P.length,bed=new Float32Array(n),w=new Float32Array(n),s=new Float32Array(n);let L=0;
 for(let i=0;i<n;i++){if(i)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);s[i]=L;
  const g=landH(P[i][0],P[i][1])-1.2;bed[i]=i?Math.min(bed[i-1]-.002*(s[i]-s[i-1]),g):g;w[i]=2.8+2.6*smooth(0,1800,L);}
 return{P,bed,w,s,len:L,depth:.7,name:'The creek (a jungle stream to the outer coast)'};})();
const CRH=(function(){const C=24,H=new Map(),P=CREEK.P;
 for(let i=0;i<P.length-1;i++){const pad=CREEK.w[i]+40,x0=Math.min(P[i][0],P[i+1][0])-pad,x1=Math.max(P[i][0],P[i+1][0])+pad,z0=Math.min(P[i][1],P[i+1][1])-pad,z1=Math.max(P[i][1],P[i+1][1])+pad;
  for(let gz=Math.floor(z0/C);gz<=Math.floor(z1/C);gz++)for(let gx=Math.floor(x0/C);gx<=Math.floor(x1/C);gx++){const k=gx*8192+gz;let L=H.get(k);if(!L)H.set(k,L=[]);L.push(i);}}
 return{C,H};})();
const _cq={d:1e9,i:0,t:0,bed:0,w:0};
function creekAt(x,z){const L=CRH.H.get(Math.floor(x/CRH.C)*8192+Math.floor(z/CRH.C));_cq.d=1e9;if(!L)return _cq;const P=CREEK.P;
 for(let k=0;k<L.length;k++){const i=L[k],a=P[i],b=P[i+1],vx=b[0]-a[0],vz=b[1]-a[1],l2=vx*vx+vz*vz||1;let t=((x-a[0])*vx+(z-a[1])*vz)/l2;t=t<0?0:t>1?1:t;
  const d=Math.hypot(x-a[0]-vx*t,z-a[1]-vz*t);if(d<_cq.d){_cq.d=d;_cq.i=i;_cq.t=t;}}
 const i=_cq.i,t=_cq.t;_cq.bed=CREEK.bed[i]*(1-t)+CREEK.bed[i+1]*t;_cq.w=CREEK.w[i]*(1-t)+CREEK.w[i+1]*t;return _cq;}

// ---------------------------------------------------------------- the thermal layout (the cove's; the kit's records, BIOME-API.md)
// Superheated at 1.93 atm (water boils at ~119 degC), the vents on the tide line: the springs' run-off falls straight into the surf (47's sink: the sea).
// The periods are real and each a Yellowstone littoral or lake-shore geyser's of its kind; demo the page's compressed times. Placed by bearing and
// distance from the cove's centre (covePt), on the apron (RS..RS+40), the bench (RS+50..RS+82) or the Stair's head.
const _g=(o,b,d)=>{const p=covePt(b,d);return Object.assign(o,{x:Math.round(p[0]),z:Math.round(p[1])});};
const THERMAL={seed:884,amb:33,ground:landH,sea:SEA,wind:WIND,
 geysers:[
  _g({key:'kettlehorn',name:'The Kettle Horn (a littoral cone geyser)',kind:'cone',H:24,period:3900,pre:60,dur:180,steam:300,off:620,demo:{period:120,pre:12,dur:22,steam:24,off:20},cone:{r:5,h:4.2},mound:{r:22,h:1.4}},-62,271),
  _g({key:'fountain',name:'The Bay Fountain (a fountain geyser at the tide line)',kind:'fountain',H:30,period:10800,pre:600,dur:900,steam:900,off:5400,demo:{period:200,pre:24,dur:36,steam:40,off:90},pool:7,mound:{r:26,h:1.2}},30,272),
  _g({key:'seahorn',name:'The Sea Horn (a cone geyser)',kind:'cone',H:16,period:2400,pre:45,dur:150,steam:180,off:1300,demo:{period:90,pre:10,dur:16,steam:16,off:50},cone:{r:3.6,h:3.2},mound:{r:15,h:.9}},80,270),
  _g({key:'benchcone',name:'The Bench Cone (a cone geyser on the raised bench)',kind:'cone',H:20,period:7200,pre:120,dur:240,steam:600,off:3900,demo:{period:160,pre:16,dur:24,steam:30,off:120},cone:{r:4.4,h:3.8},mound:{r:18,h:1.1}},-95,318),
  _g({key:'surf1',name:'A surf spouter',kind:'spouter',H:4,pool:2.4,mound:{r:10,h:.5}},-100,265),
  _g({key:'surf2',name:'The Chatterer of the tide line (a spouter)',kind:'spouter',H:5,pool:2.8,mound:{r:11,h:.6}},55,266),
  _g({key:'surf3',name:'A surf spouter',kind:'spouter',H:3.4,pool:2,mound:{r:9,h:.4}},14,268)],
 springs:[
  {key:'limekettle',name:'The Lime Kettle (a carbonate spring: it feeds the Lime Stair)',kind:'pool',x:-95,z:-486,r:10,temp:.85,out:3,outW:2.4,spread:1.0,milky:true,shield:1.2},
  _g({key:'opal',name:'The Opal Throat (a boiling funnel)',kind:'funnel',r:4.4,temp:1.0,out:1},-50,290),
  _g({key:'surfkettle',name:'The Surf Kettle (a boiling pool on the apron)',kind:'pool',r:4.6,temp:1.0,out:1},-80,282),
  _g({key:'blueeye',name:'The Blue Eye (a boiling funnel)',kind:'funnel',r:3.6,temp:1.0,out:1},44,283),
  _g({key:'benchprism',name:'The Bench Prism (a prismatic spring)',kind:'prismatic',r:13,temp:.92,out:2,shield:1.1},-122,316),
  _g({key:'ochre',name:'An ochre pool (cooler: the mats fill it)',kind:'pool',r:4.2,temp:.55,out:1},62,318),
  _g({key:'chalk',name:'The Chalk Pool (a milky carbonate spring)',kind:'pool',r:5,temp:.8,out:1,milky:true},92,300),
  _g({key:'teal',name:'A teal pool',kind:'pool',r:3.4,temp:.85,out:1},-135,286),
  _g({key:'pearl',name:'A boiling funnel',kind:'funnel',r:2.8,temp:1.0,out:1},70,285)],
 // the acid ground: the marl bleached to kaolinite on the bench beside the dike, mud pots and fumaroles in it
 acid:[_g({key:'acid',name:'The bleached bluff (kaolinite and sulphur mud pots)',r:40,mud:6,fumaroles:12},64,318)],
 // fumaroles: along the dike's rib (its sulphur chimneys are 87's), and on the apron and the bench
 fumaroles:[_g({r:10,n:4},50,350),_g({r:10,n:4},50,305),_g({r:9,n:3},50,268),_g({r:40,n:4},-30,330),_g({r:35,n:3},-135,300),_g({r:30,n:3},95,320)],
 // the opaline geyserite aprons along the tide line, and the bench's sinter (ellipses: a the long axis along the shore, the bearing in radians)
 flats:[_g({key:'westapron',name:'The west apron (opaline geyserite at the tide line)',rx:85,rz:26,a:-70*Math.PI/180},-70,276),
  _g({key:'northapron',name:'The north-east apron',rx:80,rz:24,a:30*Math.PI/180},30,274),
  _g({key:'eastapron',name:'The east apron',rx:55,rz:22,a:78*Math.PI/180},78,274),
  _g({key:'benchflat',name:'The bench\'s sinter',rx:70,rz:24,a:-110*Math.PI/180},-110,314)],
 // the scald line on the rim's top: where the heat spread into the jungle and killed it
 dead:[_g({key:'scaldwest',name:'The scald line on the west rim (dead snags in silica)',r:72},-75,392),_g({key:'scaldnorth',name:'The scald line on the north-east rim',r:78},28,395),
  _g({key:'scaldeast',name:'The scald line by the bleached bluff',r:60},72,390)],
 // THE LIME STAIR's flight (the showcase's terraces: 47 gives its mask and box): its tiers step down through the notch into the surf
 terraces:[{key:'stair',name:'The Lime Stair (travertine terraces)',S2:2.2,cu:24,cv:15,drop:.3,lip:.16,depth:.35,temp:[72,40]}],
 runLen:320};
// the bay's boils (87 draws them: spouting domes, the steam plumes over them): vents in the bay's floor, the water over them at the boil
const BAY_VENTS=[['eye','The Boiling Eye',-10,140,46],['throat','The Throat',32,185,40],['white','The White Boil',-55,195,34],['east','The east boil',72,175,30],['mouth','A boil in the mouth',150,120,22]]
 .map(v=>{const p=covePt(v[2],v[3]);return{key:v[0],name:v[1]+' (a vent in the bay: the sea boils over it)',x:Math.round(p[0]),z:Math.round(p[1]),H:v[4]};});

// ---------------------------------------------------------------- the station's ground (84 reads STATION_GROUND: its patches, paint and layers)
// The fine meshes: the cove's floor at 2 m in three pieces round the Lime Stair at 0.8 m (none overlap; the 5 m map has holes under them)
const STATION_GROUND={patches:[{name:'The cove (its apron, bench and wall)',x0:-460,z0:-280,x1:460,z1:300,cs:2,tol:.04,fine:true},
  {name:'The cove\'s west wall',x0:-460,z0:-560,x1:-200,z1:-280,cs:2,tol:.04,fine:true},{name:'The cove\'s north-east wall',x0:80,z0:-560,x1:460,z1:-280,cs:2,tol:.04,fine:true},
  {name:'The Lime Stair',x0:-200,z0:-560,x1:80,z1:-280,cs:.8,tol:.035}]};
