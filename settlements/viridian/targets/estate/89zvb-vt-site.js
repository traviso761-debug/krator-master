// ================================================================= VIRIDIAN — the estate's site: the bench, the works, the gardens
// settlements/viridian/PLAN.md section 6 (the layout) at 1:1, a first pass. Page metres from the house's court, x east (up the
// hollow; the plan's u), z south (the plan's -v). The ground is 89zva's. Where the owner's questions are open this takes the
// plan's recommendation, *proposed* (section 12b): the house at 962,1562 (Q1). The owner's answers (2026-11-16): white wash
// with the green above (Q6, VT_DRESS), the cloud hermitages (Q8). The dry garden's grange (6 km off) and the valley village
// (10 km down the valley) stand beyond this page (V7).
//   the bench    the head house on one level cut into the hollow's mouth: the great monastery (Qiblai's qb_monastery in the
//                green spoke's dress, its assembly hall at the back, the gate toward the valley), the two teaching colleges, the
//                Master's house, the refectory, the bath, the kora's chortens and wheel house
//   the court    the buyers' and pilgrims' court below it: the caravanserai, the tasting room, the hostel, the dispensary
//   the works    the tea works south of the way (the withering lofts on the windward edge, the rolling and firing hall, the
//                packing house, the stores), the herb houses north of it (the drying house, the curing house, a store)
//   above        the physic garden behind the bench, the camphor grove's shade house and log yard, the spring house, the
//                High Garden's pluckers' shelter, and on the scarp's face the three cloud hermitages
// Nothing here draws. [G data]: no THREE, no DOM.
reseed(34365);
const VT_WEST=-Math.PI/2;   /* a front turned west, down the hollow toward the valley and Qiblai */
// ---------------------------------------------------------------- the bench: the head house on one level
// the bench holds the monastery, the two colleges either side of it, the Master's house and the refectory behind, the bath on
// the axis, the kora's chortens at its corners; grass between them, the courts paved (VT_PAVED). The clergy's buildings wear
// the green spoke (o.sp 3: the Qiblai kit's qnRingC)
const VT_BENCH=vtPad('terrace:bench',-40,-108,168,108,null,8);
vtPut('qb_monastery',0,0,VT_WEST,{v:3,y:VT_BENCH.y},'sacred','great-monastery');
for(const s of[-1,1])vtPut('qb_college',8,s*76,VT_WEST,{v:s<0?0:1,sp:3,y:VT_BENCH.y},'sacred','college:'+(s<0?'north':'south'));
vtPut('qb_court_house',100,-62,VT_WEST,{v:1,sp:3,y:VT_BENCH.y},'sacred','master-house');
vtPut('qb_hostel',100,62,VT_WEST,{v:2,sp:3,y:VT_BENCH.y},'sacred','refectory');
vtPut('qb_bath',112,0,VT_WEST,{v:0,y:VT_BENCH.y},'sacred','bath');
vtPut('qb_wheel_house',150,-36,VT_WEST,{v:0,y:VT_BENCH.y},'sacred','wheel-house');
for(const [x,z,i] of[[-30,-100,0],[-30,100,1],[158,-98,2],[158,98,3]])vtPut('qb_chorten',x,z,VT_WEST,{v:i%3,y:VT_BENCH.y},'sacred','kora-chorten:'+i);
// the gate and its approach below the bench
vtPut('qb_gate_temple',-78,0,VT_WEST,{v:1},'way','green-gate');
for(const s of[-1,1])vtPut('qb_chorten',-112,s*26,VT_WEST,{v:2},'way','gate-chorten:'+s);
// ---------------------------------------------------------------- the buyers' and pilgrims' court
const VT_COURT=vtPad('terrace:court',-470,-80,-400,80,null,6);
vtPut('qb_caravanserai',-500,0,VT_WEST,{v:0},'court','caravanserai');
vtPut('qb_vt_tasting',-430,-45,VT_WEST,{y:VT_COURT.y},'court','tasting-room');
vtPut('qb_hostel',-430,55,VT_WEST,{v:0,y:VT_COURT.y},'court','pilgrims-hostel');
vtPut('qb_vt_still',-430,108,VT_WEST,{},'court','still-room');
// ---------------------------------------------------------------- the tea works (south of the way) and the herb houses (north)
vtPut('qb_vt_wither',-370,140,VT_WEST,{v:0},'works','wither:0');
vtPut('qb_vt_wither',-370,232,VT_WEST,{v:2},'works','wither:1');
vtPut('qb_vt_roll_fire',-280,150,VT_WEST,{},'works','roll-fire');
vtPut('qb_vt_pack',-280,242,VT_WEST,{},'works','pack');
for(const [z,i] of[[140,0],[178,1],[216,2]])vtPut('qb_granary',-212,z,VT_WEST,{v:i},'works','tea-store:'+i);
vtPut('qb_vt_drying',-300,-130,VT_WEST,{},'herbs','herb-drying');
vtPut('qb_vt_curing',-300,-195,VT_WEST,{},'herbs','curing');
vtPut('qb_granary',-222,-140,VT_WEST,{v:1},'herbs','herb-store');
// the lay families' lines, below the works and the herb houses: a row of eight on one pad each side
for(const [z,ry,s] of[[-285,0,'north'],[285,Math.PI,'south']]){const P=vtPad('terrace:lines-'+s,-628,z-8,-562,z+8,null,5);
 for(let i=0;i<8;i++)vtPut('qb_row_poor',-624.4+i*7.2+3.6,z,ry,{v:i%3,ends:i===0?'l':i===7?'r':'',y:P.y},'lay','lines:'+s+':'+i);}
// ---------------------------------------------------------------- above the bench: the physic garden, the grove, the spring
vtPut('qb_vt_physic',330,-10,VT_WEST,{},'herbs','physic-garden');
vtPut('qb_vt_shade',500,-70,VT_WEST,{},'herbs','shade-house');
vtPut('qb_vt_log_yard',500,60,VT_WEST,{},'herbs','log-yard');
vtPut('qb_vt_spring',900,0,VT_WEST,{},'estate','spring-house');
vtPut('qb_vt_shelter',1900,0,VT_WEST,{},'estate','pluckers-shelter');
// the cloud hermitages on the scarp's face, in the cloud bank at 1,450-1,530 m (the owner, 2026-11-16: question 8, "y"):
// three cells on their ledges, each a little apart, their doors west toward the valley
for(const [x,z,i] of[[3900,-300,0],[4060,10,1],[3960,300,2]])vtPut('qb_vt_hermitage',x,z,VT_WEST,{v:i},'estate','hermitage:'+i);
// ---------------------------------------------------------------- the ways and the paved courts
// [kind, width, points]: the road up from the valley's edge to the court, the way to the gate, the paths up to the physic
// garden, the grove, the spring and on up through the High Garden
const VT_WAYS=[['road',6,[[-1180,60],[-820,36],[-560,0]]],['way',5,[[-470,0],[-90,0]]],['path',3,[[180,0],[290,-10]]],
 ['path',3,[[370,-10],[620,0],[900,0],[1400,0],[1900,0]]],['path',2,[[1900,0],[2600,0],[3300,-80],[3700,-120],[3900,-300]]],
 ['path',2,[[3700,-120],[4060,10]]],['path',2,[[3700,-120],[3960,300]]]];
const VT_PAVED=[[-470,-75,-400,75],[-40,-34,170,34],[-100,-20,-46,20]];   /* the buyers court; the bench's axis court, through the monastery to the bath; the gate's forecourt */
// ---------------------------------------------------------------- the hedges, now every pad is cut; the flora's mask
const VT_HEDGES=(function(){const H=vtHedges(),clear=p=>!VT_WAYS.some(([k,w,P])=>P.some((a,i)=>i+1<P.length&&vtSegD(p.x,p.z,a,P[i+1])<w/2+1.2));
 return{paint:H.paint.map(L=>L.filter(clear)),fine:H.fine.map(L=>L.filter(clear))};})();
if(typeof BIO!=='undefined'&&BIO.host)BIO.host.mask=vtBioMask;
window._vtSite={pads:VT_PADS.length,places:VT_PLACE.length,bench:VT_BENCH.y,court:VT_COURT.y,bands:VT_BANDS,
 hedges:VT_HEDGES.paint.map(L=>L.length),hedgesFine:VT_HEDGES.fine.map(L=>L.length)};
