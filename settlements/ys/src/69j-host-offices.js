// ================================================================= YS HOST TYPES: the original Ancients offices and apartments (Oct 5 2026, Travis)
// Data only, in the shape of 69i-host-ancients.js (69h-host-0-lib.js has the ray helpers): the kit's own office and
// apartment buildings for the land quarter, standing WHOLE among the Hykkousoi houses with pods from their first floor
// (the office terrace alternate stood too big beside them). Each is one building of a kit call that draws several side
// by side, so the vendored builders take a Ys branch (typeof-guarded, marked /* YS */; build.py: ADAPTED):
//  82-apartments  buildApartments  A, the terrace stack, alone: eight lobed trays on a stem, every tray standing (the kit
//                                  drops tray 6 in ruin), each tray's skin, lip and liner holed for the ways in (ysWallHole
//                                  asked at the bearing from the axis, since a tray is 5 m off it)
//  42-offices     buildOffices     B, the lobed tower, alone and on the origin: a 52 m fluted drum on a 12 m colonnade, cut
//                                  at 37 m in ruin (ysCutY may name another storey); slabs every 4 m (YS), the skin holed
//                                  (ysWallHole), its lobe bands cut round every pod (ysBandHole)
//  66-office-c    buildAltOfficeC  C, the Comb, stood free (the kit draws it inside buildOffices at (330,0)): a four-storey
//                                  brise-soleil bar 78 m long on an arc, 15 m deep; the brick back and the end walls holed
//                                  for the ways in (the hole is a disc about the way's own ray exit, read off YS_CUT.ways)
// The numbers are read off those builders; re-read them if the kit is re-vendored. `lo` is the lowest pod floor over the
// ground (the placer's land rule takes it): the first floor's height.

// the Apartments' trays: tray s (its floor slab at 6 + 5.4 s, top .175 up) is a six-lobed ring of radius 24 - 1.6 s about
// a centre (sin 1.3 s, cos .9 s) * 5 off the stem, so its plan from the axis is a polygon, cached per tray
const HSJ_APART_PLANS=[];
function hsjApartPlan(s){let P=HSJ_APART_PLANS[s];if(P)return P;P=[];const ox=Math.sin(s*1.3)*5,oz=Math.cos(s*.9)*5,R=24-s*1.6;
 for(let i=0;i<72;i++){const th=i/72*TAU,r=R*(1+.28*(.5+.5*Math.cos(6*th)));P.push([ox+r*Math.cos(th),oz+r*Math.sin(th)]);}HSJ_APART_PLANS[s]=P;return P;}
// the Comb's plan from its axis (the bar's middle, OC_YS_ZC = 18 in officeC's frame): the fin line R + 1.5 and the brick back
// R - 13, arcs of ±.7 about a centre 54 m behind the axis, joined by the end walls
const HSJ_COMB_PLAN=(()=>{const R=60,a0=-.7,a1=.7,oz=-R*.6-18,P=[];for(let i=0;i<=20;i++){const a=a0+(a1-a0)*i/20;P.push([Math.sin(a)*(R+1.5),Math.cos(a)*(R+1.5)+oz]);}
 for(let i=20;i>=0;i--){const a=a0+(a1-a0)*i/20;P.push([Math.sin(a)*(R-13),Math.cos(a)*(R-13)+oz]);}return P;})();

// ---------------------------------------------------------------- the specs
// the Apartments (82-apartments A): the stem (7 m at 20 m, 11 at the ground) carries eight trays 4.6 m tall, 5.4 apart, each a
// floor and a ceiling slab; a pod roots in a tray's wall (the hole runs through the tray above as well). 49 m to the top lip.
const HOSTSPEC_APART={name:'the Apartments',key:'altApart',builder:'buildApartments',H:49,Y0:6,podium:12,cap:36,shaped:true,square:false,whole:true,
 floors:{y0:6,pitch:5.4,top:.175,first:.175},k0:0,plate:k=>k<8?6+5.4*k+.175:1e9,
 rAt:(yl,th)=>{if(yl<6)return 7*Math.sqrt(1+1.5*Math.pow((Math.max(0,yl)-20)/20,2));return hsaRayOrMean(hsjApartPlan(clamp(Math.floor((yl-6)/5.4),0,7)),th);},
 cuts:{tall:[33,44],mid:[33,44],low:[33,44],land:[33,44]},crownY:49,sink:'seabed',minY:9,lo:6,
 bearings:(st,n)=>{const a0=st.range(0,TAU);return [...Array(n)].map((_,i)=>a0+i*TAU/n+st.range(-.12,.12));}};
// Office B (42-offices B): a drum of eight lobes (13 m to a valley, 17.2 to a crest) on sixteen columns 12 m tall, storeys
// every 4 m with a lobed band proud of the skin under each (cut round the pods), the ruin's ragged top at 37.4 m. Pods on
// the crests, three lobes apart.
const HOSTSPEC_OFFICEB={name:'the Office B',key:'altOffices',builder:'buildOffices',H:52,Y0:12,podium:14,cap:20,shaped:true,square:false,whole:true,
 floors:{y0:12,pitch:4,top:.25,first:.25},k0:0,plate:k=>k<7?12+4*k+.25:1e9,
 rAt:(yl,th)=>yl<12?13.5:13*(th==null?1.16:1+.32*(.5+.5*Math.cos(8*th))),
 cuts:{tall:[24,36],mid:[24,36],low:[24,36],land:[24,36]},crownY:37.4,sink:'seabed',minY:9,lo:12,
 bearings:(st,n)=>{const k0=st.int(0,7);return [...Array(n)].map((_,i)=>((k0+i*3)%8)/8*TAU+st.range(-.04,.04));}};
// Office C, the Comb (66-office-c): decks every 4.4 m (the roof deck under a pergola at 17.9), the brick back 7 m behind
// the axis at the middle, 18 at the ends; the ends 35 m out. Pods: the back's middle, both ends, then the back 17 m either
// way (a bearing 1.03 off straight back meets the brick there); a sixth or seventh repeats an end or a flank on the other
// plate. The bearings are fixed (jitter .015): a ray that skims a wall 7 m from the axis moves metres per degree.
const HOSTSPEC_OFFICEC={name:'the Office C',key:'altOfficeC',builder:'buildAltOfficeC',H:18.5,Y0:0,podium:40,cap:40,shaped:true,square:true,whole:true,
 floors:{y0:.3,pitch:4.4,top:0,first:0},k0:0,plate:k=>k<5?.3+4.4*k:1e9,
 rAt:(yl,th)=>hsaRayOrMean(HSJ_COMB_PLAN,th),
 cuts:{tall:[9,18],mid:[9,18],low:[9,18],land:[9,18]},crownY:21,sink:'seabed',minY:9,lo:4.4,
 bearings:(st,n)=>{const F=[3*Math.PI/2,-.35,Math.PI+.35,3*Math.PI/2-1.03,3*Math.PI/2+1.03];return [...Array(n)].map((_,i)=>F[i<5?i:(i%2?1:3)]+st.range(-.015,.015));}};

// the ones the city may place (88-city-place.js loads them like YS_HOST_ANCIENTS; a pool names the keys)
const YS_HOST_OFFICES=[HOSTSPEC_APART,HOSTSPEC_OFFICEB,HOSTSPEC_OFFICEC];
