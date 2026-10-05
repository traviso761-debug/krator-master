// ================================================================= YS HOST TYPES: the Ancients brought in as hosts (Oct 5 2026, Travis)
// Data only: one HOSTSPEC_* per vendored Ancient builder, in the shape of YS_HOST_TYPES.skyD/skyH (88-city-place.js)
// and of the five built-to-be-hosts (69h-host-*): what the placer needs to know about a builder before it runs. The
// numbers are read off the vendored builders (52-sky-abc B and C, 57-sky-e, 89m-sky-k, 8aj-alt-b/c, 8ak-alt-a,
// 8al-alt-01/06); re-read them if the kit is re-vendored. `YS_HOST_ANCIENTS` lists the ones the city places.
//  plate(k)   the top of plate k, builder y (the kit's slabs; a type without slabs gets them from its Ys hook)
//  rAt(yl,th) the face radius at builder y and local bearing (null: a mean); a non-round host casts a ray on its plan
//  cuts       the storey the stump is cut at, by block class (snapped to Y0 + n*pitch by the placer)
//  avoid      true where a pod of height h on plate yl would hit the host's own ledges (bands, balconies, battens)
//  bearings   local bearings for n pods (the faces a pod may root in; the breach, the porch, the legs are kept off)
//  lo         proposed: the lowest pod floor above a LAND host's ground (the placer's 18 m colonnade rule does not
//             fit a villa or a library; 88-city-place.js reads it once it takes `T.lo`)
// Hooks in every builder (typeof-guarded, marked /* YS */): ysCutY (the cut), ysPodiumR (the podium), ysWallHole
// (the way-in holes), YS_CUT.pods (the ledges a pod crosses, B's lobe bands).

// ---------------------------------------------------------------- numeric helpers (plans as [x,z] polygons, rays through anhRayR of 69h-host-0-lib)
function hsaRect(x0,x1,z0,z1){return [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];}
// a plan cached per half-metre of height, so a ray cast costs one polygon walk
function hsaPlanCache(fn){const M=new Map();return yl=>{const k=Math.round(yl*2);let P=M.get(k);if(!P){P=fn(k/2);M.set(k,P);}return P;};}
function hsaRayOrMean(P,th){return th==null?anhMeanR(P):anhRayR(P,th);}
// Sky E's lens at builder y: half-axes aF (long) and bF (deep), two parabolic arcs, turned rot(y) (57-sky-e.js)
const HSE={H:360,Y0:10,PR:44};
const hsaLensPlan=hsaPlanCache(yl=>{
 const t=clamp(yl/HSE.H,0,1),a=34*(1-.45*Math.pow(t,1.3)),b=13*(1-.3*t),r=.8*t,c=Math.cos(r),s=Math.sin(r),P=[];
 for(const sd of [1,-1])for(let i=0;i<=24;i++){const q=(sd>0?i:24-i)/24*2-1;const x=a*q,z=sd*b*(1-q*q);P.push([x*c-z*s,x*s+z*c]);}return P;});
// Sky K's sail at builder y: the luff xL, the leech xR, the flat back at ZB, the belly out to ZB + DZ*prof (89m-sky-k.js)
const HSK={H:405,PH:2.5,ZB:-14,TX:22,PR:112,E0:.1};
const hsaSailPlan=hsaPlanCache(yl=>{
 const t=clamp(yl/HSK.H,0,1),a=-80+(80+HSK.TX)*t,b=HSK.TX+36*(1-Math.pow(t,3.5))+10*Math.sin(Math.PI*t)*(1-t),D=3+41*Math.pow(1-t,.7);
 const prof=f=>HSK.E0+(1-HSK.E0)*Math.pow(Math.max(0,Math.sin(Math.PI*Math.pow(clamp(f,0,1),.8))),.6);const P=[];
 for(let i=0;i<=28;i++){const f=i/28;P.push([a+(b-a)*f,HSK.ZB+D*prof(f)]);}P.push([b,HSK.ZB],[a,HSK.ZB]);return P;});
// the office terrace's trays: half-width hw and front zf step back with the tray (8al-alt-01-office-terrace.js)
const HSO={PB:8,NT:18,TH:4.2,ZB:-22};
function hsaOfficePlan(yl){if(yl<HSO.PB)return hsaRect(-52,52,-32,52);const i=clamp(Math.floor((yl-HSO.PB)/HSO.TH),0,HSO.NT-1),w=lerp(40,21,i/(HSO.NT-1)),f=lerp(40,9,i/(HSO.NT-1));return hsaRect(-w,w,HSO.ZB-1,f);}

// ---------------------------------------------------------------- the specs
// B, the Scallop Stack: twelve Goldberg lobes widening upward on raked legs, plates every 5 m from 32 m up, a lobe
// band proud of the skin at every storey (cut away where a pod stands: YS_CUT.pods, 52-sky-abc ysBandHole)
const HOSTSPEC_SKYB={name:'the Scallop Stack',key:'skyB',builder:'buildSkyB',H:300,Y0:32,podium:54,cap:56,shaped:true,square:false,
 floors:{y0:37,pitch:5,top:.25,first:.25},k0:0,plate:k=>37+5*k+.25,
 rAt:(yl,th)=>{if(yl<32)return 16;const r=26+10*Math.pow(clamp(yl/300,0,1),1.4);return th==null?r*1.15:r*(1+.3*(.5+.5*Math.cos(12*th)));},
 cuts:{tall:[168,240],mid:[112,160],low:[62,98],land:[44,74]},crownY:332,sink:'seabed',minY:9,
 bearings:(st,n)=>{const k0=st.int(0,11);return [...Array(n)].map((_,i)=>((k0+i*5)%12)/12*TAU+st.range(-.05,.05));}};   // the lobe crests, five lobes apart
// C, the Tripod: three hyperboloid legs fusing into one fluted shaft 150 m up; the plates start with the body (156 m),
// so a C stump is cut high and its pods ride its first storeys. Below the body the face is the legs' outer reach.
const HOSTSPEC_SKYC={name:'the Tripod',key:'skyC',builder:'buildSkyC',H:380,Y0:156,podium:66,cap:68,shaped:false,square:false,
 floors:{y0:163,pitch:7,top:.25,first:.25},k0:0,plate:k=>163+7*k+.25,
 rAt:(yl)=>{if(yl<150){const y=Math.max(0,yl);return 38-18*y/150+15*Math.sqrt(1+1.2*Math.pow((y-75)/75,2));}if(yl<156)return 42;const t=clamp((yl-150)/230,0,1);return 34*(1-.35*t)*(1+.12*Math.sin(Math.PI*t));},
 cuts:{tall:[212,268],mid:[198,240],low:[198,226],land:[198,240]},crownY:374,sink:'seabed',minY:9,
 bearings:(st,n)=>{const a0=st.range(0,TAU);return [...Array(n)].map((_,i)=>a0+i*TAU/n+st.range(-.12,.12));}};
// E, the Lens: a twisting glass lens behind a diagrid, concrete edge fins, slabs every 4 m. Ruined, the lens is a dark
// lining 7 % inside the diagrid: the pods root in that (the hole goes through lining and diagrid alike).
const HOSTSPEC_SKYE={name:'the Lens',key:'skyE',builder:'buildSkyE',H:HSE.H,Y0:HSE.Y0,podium:HSE.PR,cap:HSE.PR+2,shaped:true,square:false,
 floors:{y0:14,pitch:4,top:.18,first:.18},k0:0,plate:k=>14+4*k+.18,
 rAt:(yl,th)=>yl<HSE.Y0?HSE.PR:hsaRayOrMean(hsaLensPlan(yl),th),
 cuts:{tall:[170,258],mid:[110,162],low:[62,98],land:[46,74]},crownY:350,sink:'seabed',minY:9,
 bearings:(st,n)=>anhFaces([Math.PI/2+.18,3*Math.PI/2+.18],st,n,.35,.05)};   // the broad faces, turned with the lens at the stump's height
// K, the Sail: a flat-backed, bellied sail 140 m long with a pointed-arch porch in its foot and plates every 4.5 m;
// the rose (250 m), the campanile and the hoop are above or outside a stump. Pods on the back and the belly, off the
// porch and the keel.
const HOSTSPEC_SKYK={name:'the Sail',key:'skyK',builder:'buildSkyK',H:HSK.H,Y0:HSK.PH,podium:86,cap:88,shaped:true,square:false,
 floors:{y0:7,pitch:4.5,top:0,first:0},k0:0,plate:k=>7+4.5*k,
 rAt:(yl,th)=>yl<HSK.PH?86:hsaRayOrMean(hsaSailPlan(yl),th),
 cuts:{tall:[124,196],mid:[106,160],low:[61,97],land:[47,74]},crownY:372,sink:'seabed',minY:9,
 avoid:(yl,h)=>[38.5,74.5,110.5,146.5,182.5].some(b=>yl-1<b+2.4&&yl+h+1>b-.6),   // the battens, raised seams across both faces
 bearings:(st,n)=>anhFaces([4.0,4.7,5.4,.75,2.7],st,n,.2,.05)};   // the back three, the belly either side of the porch
// the Attraction: thirteen fluted parabolic spires on an arcaded podium 14 m tall (the kit's 74 m podium shrunk to 54, its
// turrets riding in with it: a land block takes a cap of 68 at most); pods on the central spire between the four great
// spires (the diagonals), off its ring balconies every 18 m. The slabs are Ys's (8aj-alt-c-hotel hook).
const HOSTSPEC_ATTRACTION={name:'the Attraction',key:'altAttraction',builder:'buildAltHotel',H:220,Y0:14,podium:54,cap:68,shaped:true,square:false,
 floors:{y0:21.65,pitch:6,top:0,first:0},k0:0,plate:k=>21.65+6*k,
 rAt:(yl,th)=>{if(yl<14)return 54*(th==null?1.1:se(th,5));const t=clamp((yl-14)/206,0,1);return 27*Math.pow(1-t,.6)*(1+.06*Math.sin(Math.PI*t));},
 cuts:{tall:[110,164],mid:[110,164],low:[62,98],land:[44,74]},crownY:220,sink:'seabed',minY:9,
 avoid:(yl,h)=>[38,56,74,92,110,128,146,164].some(b=>yl-1<b+2.3&&yl+h+1.5>b-.4),
 bearings:(st,n)=>anhFaces([0,Math.PI/2,Math.PI,3*Math.PI/2],st,n,.3,.05)};
// the Pierced Stack: eight lobes in a waisted shaft on trumpet pilotis (34 m), plates every 4.2 m, a storey band every
// 50 m, the breach (ruined) on the south-east: pods keep off it and the bands.
const HOSTSPEC_STACK={name:'the Pierced Stack',key:'altStack',builder:'buildAltStack',H:342,Y0:34,podium:44,cap:48,shaped:true,square:false,
 floors:{y0:37.25,pitch:4.2,top:0,first:0},k0:0,plate:k=>37.25+4.2*k,
 rAt:(yl,th)=>{if(yl<34)return 15.5;const r=29*Math.sqrt(1+1.2*Math.pow((yl-205)/170,2));return r*(th==null?.93:.86+.14*Math.pow(Math.abs(Math.cos(4*th)),.5));},
 cuts:{tall:[170,246],mid:[110,164],low:[80,110],land:[62,98]},crownY:320,sink:'seabed',minY:9,
 avoid:(yl,h)=>[84,134.4,184.8,235.2].some(b=>yl-1.5<b+1.6&&yl+h+1.5>b-.3),
 bearings:(st,n)=>anhFaces([1.9,3.05,4.2,5.35],st,n,.35,.05)};
// the Undulant house: a three-storey villa 34 x 23 m whose stone skin rolls at every floor line; whole on land, two
// pods on the north face and the ends (the door arch is on the south). Its floors are under the placer's 18 m rule: `lo`.
const HOSTSPEC_UNDULANT={name:'the Undulant house',key:'altUndulant',builder:'buildAltWaveHouse',H:11.2,Y0:0,podium:20,cap:22,shaped:true,square:true,whole:true,
 floors:{y0:3.55,pitch:3.6,top:0,first:0},k0:0,plate:k=>k<3?3.55+3.6*k:1e9,
 rAt:(yl,th)=>{if(th==null)return 14.6;const s=se(th,2.6)*(1+.045*Math.cos(5*th+.6));return Math.hypot(17*s*Math.cos(th),11.5*s*Math.sin(th))+.4;},
 cuts:{tall:[7,11],mid:[7,11],low:[7,11],land:[7,11]},crownY:14.5,sink:'seabed',minY:1,lo:3,
 bearings:(st,n)=>anhFaces([3*Math.PI/2,0,Math.PI],st,n,.25,.05)};
// the office alternate 1, the Terrace Wedge: eighteen trays stepping back between two service slabs; the one wall a
// pod can root in is the sheer back (local -z, between the slabs), its trays' floors behind it.
const HOSTSPEC_OFFICE1={name:'the Terrace Wedge',key:'altOffice1',builder:'buildAltOfficeTerrace',H:124,Y0:HSO.PB,podium:60,cap:68,shaped:true,square:true,whole:true,
 floors:{y0:8.8,pitch:4.2,top:0,first:0},k0:0,plate:k=>k<HSO.NT?8.8+4.2*k:1e9,
 rAt:(yl,th)=>hsaRayOrMean(hsaOfficePlan(yl),th),
 cuts:{tall:[44,74],mid:[44,74],low:[44,74],land:[44,74]},crownY:83.6,sink:'seabed',minY:9,
 bearings:(st,n)=>anhFaces([4.2,4.71,5.22],st,n,.3,.04)};
// the Ancient Library: the Reading Star worn (whole, weathered: 8al-alt-06 buildYsLibraryWorn), an ovoid reading
// hall on a plinth with six barrel pods at 20 m; floors every 7 m inside, pods between the barrels and above them.
const HOSTSPEC_LIBRARY={name:'the Ancient Library',key:'altLibrary',builder:'buildYsLibraryWorn',H:49.2,Y0:4,podium:36,cap:50,shaped:true,square:false,whole:true,
 floors:{y0:10.225,pitch:7,top:0,first:0},k0:0,plate:k=>k<4?10.225+7*k:1e9,
 rAt:(yl,th)=>{if(yl<4)return 36;const c=clamp((yl-24)/25.2,-1,1),s=Math.sqrt(1-c*c);return 24*s*(th==null?1:1+.06*Math.cos(3*th)*s)+.2;},
 cuts:{tall:[24,38],mid:[24,38],low:[24,38],land:[24,38]},crownY:49,sink:'seabed',minY:9,lo:9,
 bearings:(st,n)=>anhFaces([0,1,2,3,4,5].map(k=>Math.PI/2+Math.PI/6+k*Math.PI/3),st,n,0,.03)};

// the ones the city places (the placer's pools name the keys; a key not here is skipped). The Undulant house waits
// on the placer's `lo` (its plates are under the 18 m colonnade rule); Sky J (the Whorl) is not vendored: see NOTES.md.
const YS_HOST_ANCIENTS=[HOSTSPEC_SKYB,HOSTSPEC_SKYC,HOSTSPEC_SKYE,HOSTSPEC_SKYK,HOSTSPEC_ATTRACTION,HOSTSPEC_STACK,HOSTSPEC_OFFICE1,HOSTSPEC_LIBRARY,HOSTSPEC_UNDULANT];
