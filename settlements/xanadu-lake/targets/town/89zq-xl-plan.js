// ================================================================= THE LAKE TOWNS — the plan on core/city (settlements/xanadu-lake/PLAN.md section 3)
// [G data] records, no drawing. One KCITY.create instance a town (rand 'krand', index in insertion order), its steps from
// the spec (89zl XL.SPECS[key]) on the ground of 89zp, every number of the layout the spec's, every count the tune's or the
// spec's; 90q draws the ground and the water, 90r the records, 90s the boats. A town's records (XL_TOWN):
//   place     every standing building in page metres: {id, key, v, x, z, ry, w, d, h, o: {v, y}, kind: 'civic' | 'work' |
//             'house' | 'stall', quarter, wealth, why, bo: {c, u, hw, hd}, drop}
//   ways      every way in page metres: {cls, w, tag, pts, closed}
//   fields    the benches' fields: {bench, poly, rows (the furrows' direction), crop}
//   blocks    the blocks the houses fill: {id, quarter, poly}
//   boats     {moored: [{id, key, v, x, z, ry, beached}], out: [{id, key, v, x, z, ry, r, w}]}
//   census    {target (the tune's people / XL.HH), houses, byQuarter: {id: [houses, target]}, wealth: {poor, middle, rich},
//             andean, people (houses x XL.HH)}
// THE STEPS (a town's own frame: its origin `o` the page point at the town's middle, so the raster covers it):
//   the ground       the zone from the waterline to the top bench, the stream's corridor kept open (green) but at the bridge,
//                    the market square (green), the benches' fields (green)
//   the civic pieces the landing stair (xa_ghat), the quay, the fish racks and boat sheds on the beach, the temple and the
//                    governor's house by the landing, the bridge, the trade's works on the slope (each the host of its block),
//                    a wayside shrine at the main stair's head on each bench; each stamped HARD before the streets
//   the streets      the shore road (main), the contour rows (side) up to the town's top, the terrace stairs (side) from the
//                    shore road up to the top bench, a lane along each bench
//   frontage, courts the blocks between the rows and the stairs, each in its quarter (the spec's), filled by core/city's
//                    frontage-courts from the quarter's pools; then each quarter kept to its share of the tune's households,
//                    the farthest from the landing let go first
const xlDims=(key,v)=>{const D=(typeof VERN!=='undefined'&&VERN.defs&&VERN.defs[key])||(typeof XL_KIT_DIMS!=='undefined'&&XL_KIT_DIMS[key]);
 return D?{key,v:v==null?0:v,w:D.w,d:D.d,h:D.h==null?8:D.h}:null;};
XL.SEED=20261122;
XL.DENSITY=1/1100;   /* houses a square metre of a block's free ground (Māuṭh's blocks hold about one a 900-1,000 m2) */
XL.MARGIN=1.4;      /* a quarter takes blocks until their room holds its share x this */
XL.seed=key=>KRAND.child(XL.SEED,'xanadu-lake:'+key);
// the wealth of a quarter by its role (a harbour's and a farm's poorer, a market's richer); the residential quarters take
// what is left of the spec's shares, so the town's houses come out at the spec's [poor, mid, rich]
XL.TILT={harbour:[.75,.25,0],market:[.2,.5,.3],farm:[.8,.2,0],industry:[.7,.3,0]};
function xlWealth(S){const W=S.wealth,out={},rest=[W[0],W[1],W[2]];let rs=0;
 for(const q of S.quarters){if(q.role==='ruin'){out[q.id]=[1,0,0];continue;}const t=XL.TILT[q.role];if(t){out[q.id]=t;for(let i=0;i<3;i++)rest[i]-=t[i]*q.share;}else rs+=q.share;}
 const r=rest.map(v=>Math.max(0,rs>0?v/rs:0)),sum=r[0]+r[1]+r[2],n=sum>0?sum:1;for(const q of S.quarters)if(!out[q.id])out[q.id]=r.map(v=>v/n);return out;}
// the pools: a quarter's wealth split between the kit's houses and the Andean set (the spec's andean share); the market's
// middling are the shop-houses (the Turkish shops, the Palopó shop-house: a household over each)
XL.HOUSES={poor:['xa_poor_a','xa_poor_b','xa_poor_c'],middle:['xa_mid_a','xa_mid_b','xa_mid_c','xa_house_turk_a'],rich:['xa_rich_a','xa_rich_b','xa_rich_c','xa_house_turk_b'],
 andean:{poor:'xa_andean_poor',middle:'xa_andean_mid',rich:'xa_andean_rich'},shops:['xa_shops','xa_shop_turk_a','xa_shop_turk_b']};
XL.CLASS=(()=>{const C={};for(const w of['poor','middle','rich']){for(const k of XL.HOUSES[w])C[k]=w;C[XL.HOUSES.andean[w]]=w;}for(const k of XL.HOUSES.shops)C[k]='middle';return C;})();
function xlPools(S){const W=xlWealth(S),a=S.andean,P={};
 for(const q of S.quarters){const w=W[q.id],pool=[];['poor','middle','rich'].forEach((c,i)=>{const share=w[i];if(!(share>0))return;const K=XL.HOUSES[c];
   K.forEach(k=>pool.push([k,share*(1-a)/K.length]));pool.push([XL.HOUSES.andean[c],share*a]);});
  if(q.role==='market')XL.HOUSES.shops.forEach(k=>pool.push([k,.12]));
  P[q.id]=pool.map(([k,v])=>[k,+v.toFixed(4)]);}
 return P;}
const xlTune=half=>({cell:2.5,rasterHalf:half,maxSlope:.3,exact:true,
 width:{avenue:10,main:8,side:5.5,alley:3,highway:10,lane:4.5},lot:{side:1.6,setback:1.4,rear:3,inset:1,step:3},
 classes:{rich:[['xa_rich_a',0]],middle:[['xa_mid_a',0],['xa_mid_c',0]],poor:[['xa_poor_c',0]]},fallback:{rich:'middle',middle:'poor',poor:null},
 civic:[],civicSpacing:120,voidMax:40,voidIters:0,voidBatch:0,sideSpacing:48,sideMax:200,alleyFrac:.25,blindMax:90,interiorDepth:9,interiorRounds:0,
 avenueSnap:60,ringGap:8,verge:7,wall:{},plazaArt:{},mapHalf:half,stance:'high',stanceOpt:{maxDrop:9}});
// a page point at (x, d): d metres inland of the waterline at x
const xlAt=(key,x,d)=>[x,xlShoreZ(key,x)-d];
// a block between two contours (dA < dB inland) from x0 to x1, inset from its streets, in the level's frame
function xlBand(key,L,dA,dB,x0,x1,inset){const P=[],n=Math.max(1,Math.ceil((x1-x0)/90));
 for(let i=0;i<=n;i++){const x=x0+inset+(x1-x0-2*inset)*i/n;P.push(L.P(x,xlShoreZ(key,x)-dA-inset));}
 for(let i=n;i>=0;i--){const x=x0+inset+(x1-x0-2*inset)*i/n;P.push(L.P(x,xlShoreZ(key,x)-dB+inset));}
 return P;}
// the stream's east edge of the town at d: its line less the corridor
const xlEast=(G,d)=>xlStreamXd(G,d)-24;

// ---------------------------------------------------------------- the civic pieces: [key, x, d (inland of the waterline) | 'water' | 'beach' | 'ghat', ry, why, v]
// 'water': at the waterline, its deck 1.2 m over the lake (the quays, the sheds, the landing stair); 'beach': on the beach
// below the shore road; every other piece on its ground by core/city's stance
XL.WHY={xa_net_loft:'a net loft: the nets laid up and hung to dry on their frames',xa_fermentary:'a fermentary: the cacao sweating in its boxes',
 xa_apiary:'an apiary: the hive walls',xa_reeling_house:'a reeling house: the silk wound off the cocoons',xa_watermill:'a watermill',xa_workshop:'a workshop',
 xa_farm:'a drying floor (the beans spread in the sun)',xa_caravanserai:'the han at the road\'s start',xa_orchard_plot:'an orchard plot',
 xa_ghat:'the landing stair: the broad steps into the lake where the dugouts are drawn up and the washing done',
 xa_quay:'the quay: the launches\' and the market boat\'s landing',xa_temple:'the temple of the Decree',xa_governor:'the governor\'s house: the town\'s head, the Sultan\'s man',
 xa_shops:'the market\'s hall at the head of the square',xa_bridge:'the footbridge: the shore road over the stream',xa_fish_racks:'the fish racks: the catch drying',
 xa_boatshed:'a boat shed',xa_dye_works:'a dye works: the vats, the coppers, the cloth drying down to the beach',xa_granary:'the town\'s granary (the terraces\' grain and the hub\'s)',
 xa_smithy:'the smithy (the boats\' nails, the hoes)',xa_wayside_shrine:'a wayside shrine at a terrace stair\'s head',xa_serai_ruin:'the old caravan market, left empty when Thalaba moved up'};
XL.WATER_KEYS={xa_boatshed:1};   /* the beach's pieces that stand out into the lake (the rest stand on the beach) */
// the main stair: the terrace stair nearest the landing
const xlMain=Lay=>Lay.stairs.reduce((a,b)=>Math.abs(b)<Math.abs(a)?b:a,Lay.stairs[0]);
// a beach piece fitted between the water and the shore road: the shore's turn across it, half that, then square-on, each set so
// its lowest front corner stands 4 m up the beach; the first whose back corners stay 5 m clear of the road; else 6 m further
// along (dir), at most six tries. {x, z, ry} or null
function xlBeachFit(key,D,x,dir){const R0=XL.SPECS[key].layout.road;
 for(let t=0;t<6;t++,x+=6*dir){const hw=D.w/2+10,sl=(xlShoreZ(key,x+hw)-xlShoreZ(key,x-hw))/(2*hw),rt=Math.max(-.35,Math.min(.35,Math.atan2(-sl,1)));
  for(const ry of[rt,rt/2,0]){const c=Math.cos(ry),s=Math.sin(ry),pt=(lx,lz)=>[x+lx*c+lz*s,-lx*s+lz*c];
   const fr=[pt(-D.w/2,D.d/2),pt(D.w/2,D.d/2),pt(0,D.d/2)],bk=[pt(-D.w/2,-D.d/2),pt(D.w/2,-D.d/2),pt(0,-D.d/2)];
   const z=Math.min(...fr.map(q=>xlShoreZ(key,q[0])-4-q[1]));   /* every front corner 4 m or more up the beach */
   if(Math.max(...bk.map(q=>xlShoreZ(key,q[0])-(q[1]+z)))<=R0-5)return{x,z,ry};}}
 return null;}
function xlCivicSpec(key){const S=XL.SPECS[key],G=xlGeo(key),L=S.layout,out=[],R=L.road,mk=L.market,main=xlMain(L);
 const lm=S.landmarks.filter(l=>l.at!=='slope'||l.key==='xa_shops'),has=k=>lm.some(l=>l.key===k);
 if(has('xa_ghat'))out.push(['xa_ghat',main,'ghat',0,XL.WHY.xa_ghat,0]);
 if(has('xa_quay'))out.push(['xa_quay',main-36,'water',0,XL.WHY.xa_quay,0]);
 // the beach: the shore's works in the spec's order, each side of the landing in turn, from the landing outward (the
 // sheds standing out into the lake); a side that is full passes its piece to the other
 const east=G.stream?G.stream.x-40:L.half+40,west=-L.half-40,cur=[main+(has('xa_ghat')?20:8),main-(has('xa_quay')?61:8)];let side=0;
 for(const w of S.works){if(w.at!=='shore')continue;for(let i=0;i<w.n;i++){const D=xlDims(w.key,0);if(!D)continue;let placed=false;
  for(let t=0;t<2&&!placed;t++){const sd=(side+t)%2;
   const dir=sd===0?1:-1,x0=sd===0?cur[0]+D.w/2:cur[1]-D.w/2,ok=sd===0?cur[0]+D.w<=east:cur[1]-D.w>=west;if(!ok)continue;
   const why=XL.WHY[w.key]||'a work of the town\'s trade';
   if(XL.WATER_KEYS[w.key]){out.push([w.key,x0,'water',0,why,i%3]);placed=true;}
   else{const f=xlBeachFit(key,D,x0,dir);if(f){out.push([w.key,f.x,{z:f.z,ry:f.ry},0,why,i%3]);placed=true;}}
   if(placed){const xe=out[out.length-1][1];if(sd===0)cur[0]=xe+D.w/2+8;else cur[1]=xe-D.w/2-8;}}
  side=1-side;}}
 // the landmarks by the landing: either side of the main stair above the shore road, west first; the market's hall at the
 // head of the square; the bridge on the shore road over the stream
 const lc=[main-20,main+20];let ls=0;
 for(const l of lm){if(l.key==='xa_ghat'||l.key==='xa_quay'||l.key==='xa_bridge')continue;const D=xlDims(l.key,0);if(!D)continue;
  if(l.key==='xa_shops'){if(mk){const D=xlDims('xa_shops',0);out.push(['xa_shops',mk.x,(mk.d0==null?R+6:mk.d0)+mk.d-D.d/2,0,XL.WHY.xa_shops,0]);}continue;}   /* inside the square's head */
  const x=ls===0?lc[0]-D.w/2:lc[1]+D.w/2;if(ls===0)lc[0]-=D.w+6;else lc[1]+=D.w+6;ls=1-ls;
  out.push([l.key,x,R+D.d/2+8,0,XL.WHY[l.key]||'a landmark',0,true]);}
 if(has('xa_bridge')&&G.stream)out.push(['xa_bridge',xlStreamXd(G,R),R,Math.PI/2,XL.WHY.xa_bridge,0]);
 return out;}
function xlPlaceCivic(key,C,L,list){const K=KCITY.lib,SLx=K.SL,PLAN_=K.plan(),out=[];
 for(let [k,x,dd,ry,why,v0,swing] of list){const v=v0|0,D=xlDims(k,v);if(!D){out.push({key:k,err:'no def'});continue;}
  /* every piece turned to the shore's line across its own width and 10 m either side (at most 20 degrees; its front to the
     lake), so on a curving or jagged shore no corner reaches across the shore road or a contour row; its x kept */
  if(dd&&typeof dd==='object'){const q=L.P(x,dd.z),r=dd.ry+ry,u=[Math.cos(r),-Math.sin(r)],o=K.obb(q,u,D.w/2,D.d/2);   /* a fitted beach piece (xlBeachFit) */
   const lot={id:PLAN_.lots.length,cls:'landmark',role:why,key:k,v,slot:0,wealth:1,x:q[0],z:q[1],y:0,ry:r,w:D.w,d:D.d,h:D.h,lot:o,bo:o,way:-1,side:0,s:0,born:1,died:null,civic:true,why};
   const st=KCITY.stance(o,(a,b)=>L.h(a,b),{maxDrop:12});lot.y=st?st.y:L.h(q[0],q[1]);if(st)lot.drop=st.drop;
   PLAN_.lots.push(lot);SLx.hashLot(lot);SLx.register(lot);SLx.R.stampPoly(K.obbCorners(K.obb(q,u,D.w/2+3,D.d/2+3)),K.OCC.HARD,lot.id);out.push(lot);continue;}
  const zs=xlShoreZ(key,x),hw=D.w/2+10,sl=(xlShoreZ(key,x+hw)-xlShoreZ(key,x-hw))/(2*hw),R0=XL.SPECS[key].layout.road;
  /* a beach piece turns no further than its swing leaves it clear of the water and of the shore road (its depth plus 5 m in
     front and 5 m behind) */
  const cap=dd==='beach'?Math.asin(Math.max(0,Math.min(.34,(R0-10-D.d)/D.w))):.35,rt=Math.max(-cap,Math.min(cap,Math.atan2(-sl,1)));
  const off=dd==='ghat'?-1.7:dd==='water'?-D.d/2+5:dd==='beach'?-D.d/2-5-Math.abs(Math.sin(rt))*D.w/2:-dd-(swing?Math.abs(Math.sin(rt))*D.w/2:0);   /* + toward the lake; a turned landmark above the road set back by its swing */
  const x1=x,z=zs+off;ry=ry+rt;
  const q=L.P(x1,z),u=[Math.cos(ry),-Math.sin(ry)],o=K.obb(q,u,D.w/2,D.d/2);
  const lot={id:PLAN_.lots.length,cls:'landmark',role:why,key:k,v,slot:0,wealth:1,x:q[0],z:q[1],y:0,ry,w:D.w,d:D.d,h:D.h,lot:o,bo:o,way:-1,side:0,s:0,born:1,died:null,civic:true,why};
  const st=KCITY.stance(o,(a,b)=>L.h(a,b),{maxDrop:12});lot.y=st?st.y:L.h(q[0],q[1]);if(st)lot.drop=st.drop;
  if(dd==='water'||dd==='ghat'){lot.y=1.2;delete lot.drop;lot.water=true;}   /* the deck at the strand's foot, 1.2 m over the lake */
  if(/_ruin$|^xa_ruin_/.test(k)){lot.y=L.h(q[0],q[1]);delete lot.drop;lot.ruin=true;}   /* a ruin follows the ground itself (88h) */
  PLAN_.lots.push(lot);SLx.hashLot(lot);SLx.register(lot);SLx.R.stampPoly(K.obbCorners(K.obb(q,u,D.w/2+3,D.d/2+3)),K.OCC.HARD,lot.id);out.push(lot);}
 return out;}
// the stream's corridor kept open (green) up the slope, 16 m either side (but where the bridge stands)
function xlStreamClear(key,G,R,L,OCC){const S=xlStream(key);if(!S)return;let a=null;for(const p of S.pts){const q=L.P(p[0],p[1]);if(a)R.eachNearSeg(a,q,16,k=>{if(R.occ[k]!==OCC.HARD)R.occ[k]=OCC.GREEN;});a=q;}}
// a quarter's gaps between houses and its gardens, by its role
XL.GAPS={harbour:[2,5],market:[2,4],residential:[3,7],farm:[4,9],industry:[3,6],civic:[3,6],ruin:[3,8]};
XL.GARDEN={harbour:.06,market:.04,residential:.1,farm:.2,industry:.06,civic:.1,ruin:.12};
// the ruined quarter's pool: the ruins the size of the kit's small, middling and large houses (88h)
XL.RUIN_POOL=[['xa_ruin_s',4],['xa_ruin_m',4],['xa_ruin_l',1]];
// the quarter that takes the slope's leftover blocks: the one the spec marks `rest`, else its largest slope quarter
const xlRest=S=>S.quarters.find(q=>q.rest)||S.quarters.filter(q=>q.at==='slope').sort((a,b)=>b.share-a.share)[0]||null;
// the households a quarter holds: its share of the tune's (the ruined quarter: the spec's count of ruins)
function xlQuarterTargets(key){const S=XL.SPECS[key],target=XL.households(key),out={};let assigned=0;const live=S.quarters.filter(q=>q.role!=='ruin');
 live.forEach((q,i)=>{const t=i===live.length-1?target-assigned:Math.round(q.share*target);assigned+=t;out[q.id]=t;});
 for(const q of S.quarters)if(q.role==='ruin')out[q.id]=S.ruins?S.ruins.houses:0;
 return out;}

// ---------------------------------------------------------------- the town's steps
function xlSteps(key,T){const S=XL.SPECS[key],G=xlGeo(key),Lay=S.layout,L=T.L,K=()=>KCITY.lib,R0=Lay.road,rows=Lay.rows,top=G.benches.length?G.benches[G.benches.length-1].d1:rows[rows.length-1];
 const west=-Lay.half,eastAll=G.stream?G.stream.x+80:Lay.half+60,mk=Lay.market||null,md0=mk?(mk.d0==null?R0+6:mk.d0):0,mkP=mk?[xlAt(key,mk.x-mk.w/2,md0),xlAt(key,mk.x+mk.w/2,md0),xlAt(key,mk.x+mk.w/2,md0+mk.d),xlAt(key,mk.x-mk.w/2,md0+mk.d)]:null;
 const eastAt=d=>G.stream?Math.min(Lay.half,xlEast(G,d)):Lay.half;
 return[
 {name:'the ground',run(C){const k=K(),R=k.SL.R=new k.Raster(C.tune.rasterHalf,C.tune.cell);R.occ.fill(k.OCC.OUT);
   const Z=[];for(let x=west-60;x<=eastAll;x+=30)Z.push(L.P(x,xlShoreZ(key,x)-4));for(let x=eastAll;x>=west-60;x-=30)Z.push(L.P(x,xlShoreZ(key,x)-top-12));
   k.SL.R.land=KCITY.site.zoneRaster(R,Z,{dry:1,h:L.h});k.SL.minSpacing=KCITY.site.minSpacing();k.plan().zone=Z;
   xlStreamClear(key,G,R,L,k.OCC);
   if(mkP){const mq=mkP.map(p=>L.P(p[0],p[1]));R.stampPoly(mq,k.OCC.GREEN,-1);k.plan().greens.push({id:0,kind:'plaza',poly:mq,district:'the market square',born:2});}
   for(const F of T.fields)R.stampPoly(F.poly.map(p=>L.P(p[0],p[1])),k.OCC.GREEN,-1);}},
 {name:'the civic pieces',run(C){T.civic=xlPlaceCivic(key,C,L,xlCivicSpec(key));
   /* the wayside shrines at the main stair's head on each bench (beside the stair, uphill of the bench lane) */
   const sh=S.works.find(w=>w.key==='xa_wayside_shrine'),main=xlMain(Lay);
   if(sh)T.civic=T.civic.concat(xlPlaceCivic(key,C,L,G.benches.slice(0,Math.min(sh.n,G.benches.length)).map(B=>['xa_wayside_shrine',main+9,B.d0+17,0,'the wayside shrine at the terrace stair\'s head on bench '+(B.i+1),B.i%3])));
   /* a third shrine and more: at the other stairs' heads on the lowest bench */
   if(sh&&sh.n>G.benches.length&&G.benches.length){const others=Lay.stairs.filter(x=>x!==main).slice(0,sh.n-G.benches.length);
    T.civic=T.civic.concat(xlPlaceCivic(key,C,L,others.map((x,k)=>['xa_wayside_shrine',x+9,G.benches[0].d0+17,0,'the wayside shrine at a terrace stair\'s head',(k+1)%3])));}
   /* the bench's works behind the bench houses, and the orchards' plots over their fields */
   T.civic=T.civic.concat(xlPlaceCivic(key,C,L,xlBenchWorks(key).map(([k,x,d])=>[k,x,d,0,XL.WHY[k]||'a work of the town\'s trade',0])));
   const FS=Lay.fields||{};if(FS.orchard)for(const F of T.fields)T.civic=T.civic.concat(xlPlaceCivic(key,C,L,(F.plots||[]).map(([x,d])=>['xa_orchard_plot',x,d,0,'the '+(F.crop||'orchard')+' plot on bench '+(F.bench+1),FS.plot|0])));}},
 {name:'the streets',run(C){const S_=K().SL,line=(d,x0,x1,st)=>{const P=[];for(let x=x0;x<=x1+.1;x+=st)P.push(L.P(x,xlShoreZ(key,x)-d));return P;};
   S_.addWay('main',line(R0,west-40,G.stream?G.stream.x+70:Lay.half+40,15),3,{tag:'the shore road'});
   for(let i=1;i<rows.length;i++){const d=rows[i];S_.addWay('side',line(d,west,eastAt(d)-(G.stream?6:0),15),3,{tag:'row '+i});}
   for(const x of Lay.stairs){const P=[];for(let d=R0;d<=top+.1;d+=15)P.push(L.P(x,xlShoreZ(key,x)-d));S_.addWay('side',P,3,{tag:'the terrace stair x'+x});}
   for(const B of G.benches)S_.addWay('lane',line(B.d0+7,B.x0+6,B.x1-6,15),3,{tag:'the lane on bench '+(B.i+1)});}},
 {name:'frontage and courts',run(C){const blocks=[],k=K();
   /* the blocks between the rows, cut by the stairs, the last column up against the stream (or the town's east edge) */
   for(let j=0;j<rows.length-1;j++){const dA=rows[j],dB=rows[j+1],east=eastAt((dA+dB)/2),E=[west].concat(Lay.stairs.filter(x=>x>west+40&&x<east-40),[east]);
    for(let i=0;i<E.length-1;i++)blocks.push({id:'b-'+i+'-'+j,i,j,last:G.stream?i===E.length-2:(Lay.side==='west'?i===0:i===E.length-2),at:[(E[i]+E[i+1])/2,(dA+dB)/2],poly:xlBand(key,L,dA,dB,E[i],E[i+1],j===0?5:4.5),lanes:false});}
   /* the bench houses: a strip on each bench's lake side, behind its lane, cut at the stairs */
   G.benches.forEach(B=>{const E=[B.x0+8].concat(Lay.stairs.filter(x=>x>B.x0+40&&x<B.x1-40),[B.x1-8]);
    for(let i=0;i<E.length-1;i++)blocks.push({id:'bench-'+B.i+'-'+i,i:20+i,j:10+B.i,bench:true,at:[(E[i]+E[i+1])/2,B.d0+25],poly:xlBand(key,L,B.d0+7,B.d0+42,E[i],E[i+1],4),lanes:false});});
   /* the quarters (the spec's): each takes blocks until their room (the block's free raster, at XL.DENSITY houses a square
      metre) holds its households with a margin: the bench quarters the benches' strips, the stream's the column against the
      stream, the shore's the two lowest rows and the slope's the rows above, each nearest its anchor (the market's square,
      the temple, else the landing); the rest quarter (xlRest) what is left */
   const tq=xlQuarterTargets(key),room=b=>{let n=0;k.SL.R.eachInPoly(b.poly,kk=>{if(k.SL.R.occ[kk]===k.OCC.FREE)n++;});return n*C.tune.cell*C.tune.cell*XL.DENSITY;};
   const free=blocks.slice(),capQ={},take=(q,list)=>{let cap=capQ[q.id]||0;const want=tq[q.id]*XL.MARGIN*((T.marginQ||{})[q.id]||1);for(const b of list){if(cap>=want)break;b.quarter=q.id;b.kind=q.id;cap+=room(b);free.splice(free.indexOf(b),1);}capQ[q.id]=cap;return cap>=want;};
   const temple=T.civic.find(l=>l.key==='xa_temple'),main=xlMain(Lay);
   const anchor=q=>q.role==='market'&&mk?[mk.x,md0+mk.d/2]:q.role==='civic'&&temple?[temple.x+L.o[0],xlShoreZ(key,temple.x+L.o[0])-(temple.z+L.o[1])]:[main,R0];
   const rest=xlRest(S),rank={bench:0,stream:1,shore:2,slope:3};
   const order=S.quarters.filter(q=>q!==rest).sort((a,b)=>(rank[a.at]-rank[b.at])||(a.role==='market'?-1:b.role==='market'?1:0));
   const near=(a)=>(u,v)=>(Math.hypot(u.at[0]-a[0],u.at[1]-a[1])-Math.hypot(v.at[0]-a[0],v.at[1]-a[1]))||u.i-v.i;
   for(const q of order){
    const pool=free.filter(b=>q.at==='bench'?b.bench:q.at==='stream'?(b.last&&!b.bench&&(b.j>=1||!G.stream)):q.at==='shore'?(!b.bench&&b.j<=1):(!b.bench&&b.j>=1)),a=anchor(q);
    const full=take(q,pool.sort(q.at==='stream'?(u,v)=>u.j-v.j:near(a)));
    /* a quarter its own rows could not hold reaches further: the free blocks nearest its anchor (a stream quarter's: its column's) */
    if(!full&&q.at!=='bench'){const a2=q.at==='stream'?(blocks.filter(b=>b.quarter===q.id)[0]||{at:a}).at:a;take(q,free.filter(b=>!b.bench).sort(near(a2)));}}
   for(const b of free.slice()){if(b.bench&&(!rest||rest.at!=='bench'))continue;if(!rest)continue;b.quarter=rest.id;b.kind=rest.id;}
   for(let i=blocks.length-1;i>=0;i--)if(!blocks[i].quarter)blocks.splice(i,1);
   /* the hosts: the landmarks on the slope (in their quarter's block nearest its anchor) and the slope's works (in the rest
      quarter's blocks nearest the landing), a block each; the piece placed at the block's middle, the houses ring it */
   const far=(b,a)=>{const c=xlPolyC(b.poly),x=c[0]+L.o[0],z=c[1]+L.o[1];return Math.hypot(x-a[0],(xlShoreZ(key,x)-z)-a[1]);};
   /* a host stands in a block of its quarter (else of the rest quarter) with no host yet, clear of the market square and of every
      civic piece already placed (core/city's exact overlap, SL.pen, with 3 m between) */
   const mkC=mkP?xlPolyC(mkP):null,clash=(c,D)=>{const SLx=k.SL,o={c,u:[1,0],v:[0,1],hw:D.w/2+3,hd:D.d/2+3};
     if(mkC&&Math.abs(c[0]+L.o[0]-mkC[0])<mk.w/2+D.w/2+3&&Math.abs(c[1]+L.o[1]-mkC[1])<mk.d/2+D.d/2+3)return true;
     return T.civic.some(l=>l.bo&&SLx.pen(o,{c:l.bo.c,u:l.bo.u,v:[-l.bo.u[1],l.bo.u[0]],hw:l.bo.hw,hd:l.bo.hd})>0);};
   const host=(wk,qid,a,why,v)=>{const D=xlDims(wk,v|0);if(!D)return false;
    for(const q2 of [qid,rest&&rest.id]){if(!q2)continue;const cand=blocks.filter(b=>b.quarter===q2&&!b.host&&!b.bench).sort((u,w)=>far(u,a)-far(w,a)||u.i-w.i||u.j-w.j);
     for(const b of cand){const c=L.P(b.at[0],xlShoreZ(key,b.at[0])-b.at[1]);if(clash(c,D))continue;   /* at the block's own middle: its x, its mid-depth */
      const lot=xlPlaceCivic(key,C,L,[[wk,b.at[0],b.at[1],0,why,v|0]])[0];if(lot&&lot.bo){b.host={c:lot.bo.c,u:lot.bo.u,hw:lot.bo.hw,hd:lot.bo.hd};T.civic.push(lot);return true;}}}
    return false;};
   const streamQ=S.quarters.find(q=>q.at==='stream'&&q.role==='industry')||S.quarters.find(q=>q.at==='stream');
   for(const l of S.landmarks)if((l.at==='slope'||l.at==='stream')&&l.key!=='xa_shops'){if(l.key==='xa_river_span'&&!G.stream)continue;   /* a bridge wants the town's stream */
    const q=S.quarters.find(q=>q.id===l.q)||(l.at==='stream'?streamQ:null)||rest;if(q)host(l.key,q.id,anchor(q),XL.WHY[l.key]||'a landmark',0);}
   S.works.filter(w=>w.at==='slope'||w.at==='stream').forEach(w=>{const q=w.at==='stream'&&streamQ?streamQ:rest;for(let i=0;i<w.n;i++)if(q)host(w.key,q.id,[main,R0+80],XL.WHY[w.key]||'a work of the town\'s trade',0);});
   T.blocks=blocks;
   const pools=xlPools(S),small={},gaps={},garden={};
   for(const q of S.quarters){if(q.role==='ruin')pools[q.id]=XL.RUIN_POOL;gaps[q.id]=XL.GAPS[q.role]||[3,7];garden[q.id]=XL.GARDEN[q.role]==null?.1:XL.GARDEN[q.role];}
   for(const q in pools)small[q]=pools[q].filter(([kk])=>{const D=xlDims(kk,0);return D&&D.w<=20&&D.d<=20;});
   T.courts=KCITY.strategies['frontage-courts'].run(blocks,{step:6,seed:T.seed,focus:L.P(main,xlShoreZ(key,main)),pools,small,sides:99,gaps,garden,infill:{step:10,yard:.3}});
   /* the census: each quarter kept to its households, the farthest from the landing let go first */
   const byQ={},blockQ={};for(const b of blocks)blockQ[b.id]=b.quarter;
   for(const lot of k.plan().lots){if(lot.died!=null||lot.civic||!lot.court)continue;const q=blockQ[lot.court];(byQ[q]=byQ[q]||[]).push(lot);}
   T.quarterTarget=tq;
   for(const q in byQ){const list=byQ[q].map(l=>({l,d:Math.hypot(l.x+L.o[0]-main,l.z+L.o[1])})).sort((a,b)=>a.d-b.d||a.l.id-b.l.id);
    list.slice(tq[q]==null?list.length:tq[q]).forEach(e=>{e.l.died=13;e.l.why='let go: the quarter is full (the tune\'s households)';});}}}];}
function xlPolyC(P){let sx=0,sz=0;for(const p of P){sx+=p[0];sz+=p[1];}return[sx/P.length,sz/P.length];}

// ---------------------------------------------------------------- the benches' fields (records): the bench behind its houses, cut at the stairs
// a field's crop: from kits/crops (CROPS, sealed in gen/89zc-crops-bundle.js) when the spec names a bucket (Ḍāiyar's dye
// plants: layout.fields.bucket 'dye'): a seeded pick among the bucket's field plants the Vale grows by rain, its colour the crop's; else
// the terraces' grain (vale rice, a third amaranth). {crop, colour, bucket}
XL.GRAIN_COLOUR={'vale-rice':'green','amaranth':'red'};
function xlCrop(key,bench,i){const F=XL.SPECS[key].layout.fields||{};
 if(F.crop)return{crop:F.crop,colour:F.colour||'green',bucket:typeof CROPS!=='undefined'&&CROPS.BY_ID[F.crop]?CROPS.BY_ID[F.crop].bucket:null};   /* a named crop: the orchards' */
 if(F.bucket&&typeof CROPS!=='undefined'){   /* the bucket's own plants grown by rain in fields (no tree or lichen, nothing whose first use is another bucket's) */
  const Q=CROPS.forBiome(F.biome||'xanadu').filter(r=>r.crop.bucket===F.bucket&&r.how==='rain'&&r.crop.form!=='tree'&&!/lichen/.test(r.crop.id))   /* a lichen is gathered off rock, not sown */.sort((a,b)=>a.crop.id<b.crop.id?-1:1);
  if(Q.length){const r=Q[KRAND.hash(XL.seed(key),bench,i)%Q.length];return{crop:r.crop.id,colour:r.crop.colour||'green',bucket:F.bucket};}}
 const c=KRAND.hash(XL.seed(key),bench,i)%3===0?'amaranth':'vale-rice';return{crop:c,colour:XL.GRAIN_COLOUR[c],bucket:'grain'};}
// the bench's works (the spec's works at 'bench' but the wayside shrines: Hāibh's apiaries, Malbari's rearing houses): a row on
// each bench behind its houses, spread over the benches in turn, clear of the stairs; [key, x, d, bench]
function xlBenchWorks(key){const S=XL.SPECS[key],G=xlGeo(key),Lay=S.layout,out=[],cur=G.benches.map(B=>B.x0+16);let bi=0;
 for(const w of S.works){if(w.at!=='bench'||w.key==='xa_wayside_shrine')continue;const D=xlDims(w.key,0);if(!D)continue;
  for(let i=0;i<w.n;i++){for(let t=0;t<G.benches.length;t++){const B=G.benches[(bi+t)%G.benches.length];let x=cur[B.i];
    while(Lay.stairs.some(sx=>Math.abs(x+D.w/2-sx)<D.w/2+8))x+=6;
    if(x+D.w>B.x1-10)continue;out.push([w.key,x+D.w/2,B.d0+46+D.d/2,B.i]);cur[B.i]=x+D.w+6;bi=(B.i+1)%G.benches.length;break;}}}
 return out;}
// the depth behind a bench's houses its works take (the fields start behind them)
function xlBenchBack(key,B){let m=0;for(const w of xlBenchWorks(key))if(w[3]===B.i){const D=xlDims(w[0],0);m=Math.max(m,D?D.d:0);}return m?m+12:0;}
function xlFields(key){const S=XL.SPECS[key],G=xlGeo(key),Lay=S.layout,FS=Lay.fields||{},out=[];
 for(const B of G.benches){const E=[B.x0+4].concat(Lay.stairs.filter(x=>x>B.x0+30&&x<B.x1-30),[B.x1-4]);
  for(let i=0;i<E.length-1;i++){const x0=E[i]+8,x1=E[i+1]-8,dA=B.d0+42+xlBenchBack(key,B),dB=B.d1-3;   /* 8 m clear of a stair's middle */if(x1-x0<20||dB-dA<10)continue;const P=[];
   for(let x=x0;x<=x1+.1;x+=(x1-x0)/Math.max(2,Math.ceil((x1-x0)/30)))P.push(xlAt(key,x,dA));
   for(let x=x1;x>=x0-.1;x-=(x1-x0)/Math.max(2,Math.ceil((x1-x0)/30)))P.push(xlAt(key,x,dB));
   const F=Object.assign({id:'field-'+B.i+'-'+i,bench:B.i,y:B.y,poly:P,x0,x1,dA,dB},xlCrop(key,B.i,i));
   /* an orchard (layout.fields.orchard: the cacao groves, the mulberry plots): the field tiled with the kit's orchard plots */
   if(FS.orchard){F.plots=[];for(let x=x0+17;x+16<=x1;x+=35)for(let d=dA+14;d+13<=dB;d+=28)F.plots.push([x,d]);}
   out.push(F);}}
 return out;}

// ---------------------------------------------------------------- the boats: the dugouts drawn up and out fishing, the launches and the barge at the quay
function xlBoats(key,T){const S=XL.SPECS[key],c=S.craft,B={moored:[],out:[]},st=KRAND.stream(KRAND.child(T.seed,'boats')),zs=x=>xlShoreZ(key,x);
 const quay=T.civic.find(l=>l.key==='xa_quay'),ghat=T.civic.find(l=>l.key==='xa_ghat'),qx=quay?quay.x+T.L.o[0]:-36,gx=ghat?ghat.x+T.L.o[0]:0;
 // the launches and the barge moored off the quay's face
 const deep=(x,z0)=>{let z=z0;while(xlH(key,x,z)>-.9&&z<z0+200)z+=2;return z;};   /* out from the quay's face to 0.9 m of water */
 for(let i=0;i<c.launches;i++){const x=qx-10+i*9;B.moored.push({id:'launch:'+i,key:'xa_launch',v:1,x,z:deep(x,zs(x)+12),ry:Math.PI/2,beached:false});}
 for(let i=0;i<c.barges;i++){const x=qx+12+i*16;B.moored.push({id:'barge:'+i,key:'xa_lake_barge',v:1,x,z:deep(x,zs(x)+14)+4,ry:Math.PI/2,beached:false});}
 // half the dugouts drawn up: on the ghat's lower steps and along the beach east of the racks, bows to the lake
 const ashore=Math.floor(c.dugouts/2),onGhat=Math.min(6,ashore);
 for(let i=0;i<onGhat;i++){const x=gx-8.5+i*3.4;B.moored.push({id:'dugout:ghat:'+i,key:'xa_dugout',v:2,x,z:zs(x)-.6+(i%2)*.8,ry:(st.next()-.5)*.2,beached:true,ghat:true});}
 const racksE=T.civic.filter(l=>l.key==='xa_boatshed'||l.key==='xa_fish_racks').reduce((m,l)=>Math.max(m,l.x+T.L.o[0]+l.w/2),40)+8;
 for(let i=0;i<ashore-onGhat;i++){const x=racksE+i*3.6;B.moored.push({id:'dugout:beach:'+i,key:'xa_dugout',v:2,x,z:zs(x)+.4,ry:(st.next()-.5)*.25,beached:true});}
 // the rest out on the near grounds: 150 m to 1.6 km out, each drifting on a small circle, none within 50 m of another
 let n=0,tries=0;const want=c.dugouts-ashore;while(n<want&&tries<6000){tries++;const x=-1600+st.next()*3200,z=zs(x)+150+st.next()*1450,h=xlH(key,x,z);
  if(h>-4)continue;if(B.out.some(o=>Math.hypot(o.x-x,o.z-z)<50))continue;
  B.out.push({id:'dugout:out:'+n,key:'xa_dugout',v:1,x,z,ry:st.next()*Math.PI*2,r:4+st.next()*12,w:(st.next()<.5?-1:1)*(.004+st.next()*.01)});n++;}
 return B;}

// ---------------------------------------------------------------- run a town
var XL_TOWN=null,XL_ERR=null;
function xlRun(key){const S=XL.SPECS[key];if(!S)throw new Error('xanadu-lake: no spec '+key);const G=xlGeo(key),Lay=S.layout;
 const mid=[0,xlShoreZ(key,0)-(G.benches.length?G.benches[G.benches.length-1].d1:Lay.rows[Lay.rows.length-1])/2];
 const L={o:mid,h:(x,z)=>xlH(key,x+mid[0],z+mid[1]),P:(x,z)=>[x-mid[0],z-mid[1]]};
 /* the plan, run again (at most four times) with a larger share of blocks for any quarter that came out short of its
    households, the run with the least shortfall kept: deterministic, each run from the town's own seed */
 let T=null,best=null,marginQ={};
 for(let attempt=0;attempt<4;attempt++){
 T={key,seed:XL.seed(key),L,civic:[],blocks:[],fields:xlFields(key),marginQ:Object.assign({},marginQ)};
 const C=KCITY.create({name:'xanadu-lake:'+key,tune:xlTune(Math.ceil(Math.max(Lay.half+260,G.stream?G.stream.x+220:0,(Lay.rows[Lay.rows.length-1]+400)))/10*10),seed:T.seed,ground:{h:L.h},kit:{dims:xlDims},
  rand:'krand',index:{order:'insertion'},steps:xlSteps(key,T)});
 T.C=C;T.plan=C.run();
 const got={};for(const l of T.plan.lots){if(l.died!=null||l.civic||!l.court)continue;const b=T.blocks.find(b=>b.id===l.court);if(b)got[b.quarter]=(got[b.quarter]||0)+1;}
 let short=0;const bump=[];for(const q in T.quarterTarget){const s=T.quarterTarget[q]-(got[q]||0);if(s>0){short+=s;if(s>T.quarterTarget[q]*.05)bump.push(q);}}
 if(!best||short<best.short)best={T,short};if(!bump.length)break;
 const restQ=xlRest(S);for(const q of bump){if(restQ&&q===restQ.id){for(const q2 in T.quarterTarget)if(q2!==q&&(got[q2]||0)>=T.quarterTarget[q2])marginQ[q2]=Math.max(.7,(marginQ[q2]||1)-.2);}
  else marginQ[q]=(marginQ[q]||1)+.5;}}   /* the rest quarter short: the others take less; any other: it takes more */
 T=best.T;
 const blockQ={};for(const b of T.blocks)blockQ[b.id]=b.quarter;
 const place=[];
 for(const l of T.plan.lots){if(l.died!=null||!l.bo)continue;const q=[l.x+L.o[0],l.z+L.o[1]];
  const ruinQ=l.court&&S.quarters.some(q=>q.id===blockQ[l.court]&&q.role==='ruin'),kind=l.ruin?'ruin-civic':l.key==='xa_orchard_plot'?'orchard':l.civic?(S.works.some(w=>w.key===l.key)?'work':'civic'):ruinQ?'ruin':'house';
  place.push({id:key+':'+l.id,key:l.key,v:l.v|0,x:q[0],z:q[1],ry:l.ry,w:l.w,d:l.d,h:l.h,o:{v:l.v|0,y:l.y==null?xlH(key,q[0],q[1]):l.y},kind,
   quarter:l.court?blockQ[l.court]:null,wealth:kind==='house'?XL.CLASS[l.key]||'poor':null,why:l.why||l.role||null,water:!!l.water,ruin:kind==='ruin'||kind==='ruin-civic',
   bo:{c:q,u:l.bo.u,hw:l.bo.hw,hd:l.bo.hd},drop:l.drop||0});}
 // the market's stalls (opt-in extra/88e): two rows in the square's lower half facing their aisle (the hall at its head), the
 // trade from each stall's own hash
 {const D=xlDims('xa_stall',0),mk=Lay.market;if(D&&mk&&S.stalls>0){const per=Math.ceil(S.stalls/2),dx=Math.min(9,(mk.w-16)/per);
  for(let r=0;r<2;r++)for(let i=0;i<per&&r*per+i<S.stalls;i++){const x=mk.x-(per-1)*dx/2+i*dx,d=(mk.d0==null?Lay.road+6:mk.d0)+(r?19:9),q=xlAt(key,x,d),ry=r?0:Math.PI,v=KRAND.hash(T.seed,r,i)%4;
   place.push({id:key+':stall:'+r+':'+i,key:'xa_stall',v,x:q[0],z:q[1],ry,w:D.w,d:D.d,h:D.h,o:{v,y:xlH(key,q[0],q[1])+.05},kind:'stall',quarter:'market',wealth:null,why:'a stall of the market square',water:false,
    bo:{c:q,u:[Math.cos(ry),-Math.sin(ry)],hw:D.w/2,hd:D.d/2},drop:0});}}}
 const ways=T.plan.ways.map(w=>({cls:w.cls,w:w.w,tag:w.tag,pts:w.pts.map(p=>[p[0]+L.o[0],p[1]+L.o[1]]),closed:w.closed}));
 const houses=place.filter(p=>p.kind==='house'),byQuarter={},wealth={poor:0,middle:0,rich:0};
 for(const q of S.quarters)byQuarter[q.id]=[0,T.quarterTarget?T.quarterTarget[q.id]:0];
 for(const h of houses){if(byQuarter[h.quarter])byQuarter[h.quarter][0]++;wealth[h.wealth]++;}
 for(const h of place)if(h.kind==='ruin'&&byQuarter[h.quarter])byQuarter[h.quarter][0]++;
 const tune=XL.tune(key);
 XL_TOWN={key,name:tune?tune.name:key,spec:S,geo:G,L,place,ways,fields:T.fields,blocks:T.blocks.map(b=>({id:b.id,quarter:b.quarter,poly:b.poly.map(p=>[p[0]+L.o[0],p[1]+L.o[1]])})),
  greens:(T.plan.greens||[]).map(g=>({kind:g.kind,district:g.district,poly:g.poly.map(p=>[p[0]+L.o[0],p[1]+L.o[1]])})),
  census:{target:XL.households(key),people:tune?tune.people:null,houses:houses.length,byQuarter,wealth,andean:houses.filter(h=>/andean/.test(h.key)).length,hh:XL.HH,peopleHoused:+(houses.length*XL.HH).toFixed(1),
   ruins:place.filter(p=>p.kind==='ruin').length}};
 XL_TOWN.boats=xlBoats(key,T);
 return XL_TOWN;}

// ---------------------------------------------------------------- the flora's mask (the Vale of Xanadu biome on Xanadu's page)
// From the plan's records, never from pixels: the stream's ravine wooded (1), the slope's grass between the houses (.4), the
// wall above the benches (.55), the beach bare (.04); a yard in a block (.05); never in the lake, on a way, on a field or in
// a building's footprint (core/space's indexes of the records)
// the distance across from the stream's line at (x, z) (1e9 for a town with no stream)
const xlStreamD=(key,G,x,z)=>G.stream?Math.abs(x-xlStreamXd(G,xlShoreZ(key,x)-z)):1e9;
function xlInPoly(p,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
function xlBioMask(T){const S=KCITY.lib.KSPACE,B=S.create({cell:40}),W=S.create({cell:60}),K=S.create({cell:120}),key=T.key,G=T.geo;
 for(const p of T.place)B.insert(p,p.x,p.z,Math.hypot(p.bo.hw,p.bo.hd)+1.5);
 for(const w of T.ways)for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];W.insert({a,b,r:w.w/2+1.5},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
 for(const P of T.blocks.map(b=>({P:b.poly,yard:true})).concat(T.fields.map(f=>({P:f.poly,field:true})))){const xs=P.P.map(q=>q[0]),zs=P.P.map(q=>q[1]);
  K.insert(P,(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2,Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs))/2);}
 return function(x,z){if(xlH(key,x,z)<.8)return 0;
  for(const q of W.query(x,z,1)){const dx=q.b[0]-q.a[0],dz=q.b[1]-q.a[1],L2=Math.max(1e-9,dx*dx+dz*dz);let t=((x-q.a[0])*dx+(z-q.a[1])*dz)/L2;t=t<0?0:t>1?1:t;if(Math.hypot(q.a[0]+dx*t-x,q.a[1]+dz*t-z)<q.r)return 0;}
  for(const p of B.query(x,z,1))if(Math.abs((x-p.x)*p.bo.u[0]+(z-p.z)*p.bo.u[1])<p.bo.hw+1.5&&Math.abs(-(x-p.x)*p.bo.u[1]+(z-p.z)*p.bo.u[0])<p.bo.hd+1.5)return 0;
  const d=xlShoreZ(key,x)-z,sd=G.stream?Math.abs(x-xlStreamXd(G,d)):1e9;if(sd<5&&d<G.stream.to)return 0;   /* the stream's own channel */
  for(const k of K.query(x,z,1))if(xlInPoly([x,z],k.P))return k.field?0:.05;
  if(G.stream&&sd<45&&d<G.stream.to+60)return 1;if(d<24)return .04;if(d<T.spec.layout.rows[T.spec.layout.rows.length-1]+20)return .4;return .55;};}

// on the page: the town its query names, the ground every builder and the camera read, the core/tags registry under its name
XL.KEY=XL.pick();
if(typeof VERN!=='undefined'){terrainH=(x,z)=>xlH(XL.KEY,x,z);if(typeof KTAGS!=='undefined')KTAGS.page=KTAGS.page||KTAGS.create({build:'xanadu-lake'});
 try{xlRun(XL.KEY);}catch(e){XL_ERR=String(e&&e.stack||e);if(typeof reportErr==='function')reportErr('lake town plan: '+XL_ERR);}
 if(typeof BIO!=='undefined'&&BIO.host&&XL_TOWN&&!XL_ERR){const T=XL_TOWN,G=T.geo;
  Object.assign(BIO.host,{mask:xlBioMask(T),origin:[[0,-100],[G.stream?G.stream.x:300,-400],[0,-700]],center:[0,-400],
   fields:{wet:(x,z)=>Math.min(1,.6+Math.max(0,1-xlStreamD(T.key,G,x,z)/80)*.4),salt:()=>0,upland:()=>0,
    flow:(x,z)=>Math.max(0,1-xlStreamD(T.key,G,x,z)/16),mist:()=>0}});}
 if(typeof window!=='undefined'){const T=XL_TOWN||{};window._xl={key:XL.KEY,name:T.name,err:XL_ERR,placed:(T.place||[]).length,census:T.census,
  civic:(T.place||[]).filter(p=>p.kind==='civic').length,works:(T.place||[]).filter(p=>p.kind==='work').length,houses:(T.place||[]).filter(p=>p.kind==='house').length,
  stalls:(T.place||[]).filter(p=>p.kind==='stall').length,ways:(T.ways||[]).length,fields:(T.fields||[]).length,
  boats:T.boats?{moored:T.boats.moored.length,out:T.boats.out.length}:null};}}
