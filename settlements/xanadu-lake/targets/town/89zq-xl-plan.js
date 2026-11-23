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
XL.MARGIN=1.3;      /* a quarter takes blocks until their room holds its share x this */
XL.seed=key=>KRAND.child(XL.SEED,'xanadu-lake:'+key);
// the wealth of a quarter by its role (a harbour's and a farm's poorer, a market's richer); the residential quarters take
// what is left of the spec's shares, so the town's houses come out at the spec's [poor, mid, rich]
XL.TILT={harbour:[.75,.25,0],market:[.2,.5,.3],farm:[.8,.2,0]};
function xlWealth(S){const W=S.wealth,out={},rest=[W[0],W[1],W[2]];let rs=0;
 for(const q of S.quarters){const t=XL.TILT[q.role];if(t){out[q.id]=t;for(let i=0;i<3;i++)rest[i]-=t[i]*q.share;}else rs+=q.share;}
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

// ---------------------------------------------------------------- the civic pieces: [key, x, d (inland of the waterline) | 'water' | 'beach', ry, why, v]
// 'water': at the waterline, its deck 1.2 m over the lake (the quays, the sheds, the landing stair); every other piece on its
// ground by core/city's stance
function xlCivicSpec(key){const S=XL.SPECS[key],G=xlGeo(key),L=S.layout,out=[],R=L.road,mk=L.market;
 const n=k=>{const w=S.works.find(w=>w.key===k);return w?w.n:0;},has=k=>S.landmarks.some(l=>l.key===k);
 if(has('xa_ghat'))out.push(['xa_ghat',0,'ghat',0,'the landing stair: the broad steps into the lake where the dugouts are drawn up and the washing done',0]);
 if(has('xa_quay'))out.push(['xa_quay',-36,'water',0,'the quay: the launches\' and the market boat\'s landing',0]);
 // the beach: the fish racks either side of the landing, the boat sheds beyond them
 const racks=n('xa_fish_racks'),sheds=n('xa_boatshed');
 for(let i=0;i<racks;i++){const side=i%2?1:-1,k=Math.floor(i/2),x=side>0?32+k*19:-72-k*19;out.push(['xa_fish_racks',x,'beach',0,'the fish racks: the catch drying',i%3]);}
 const rk=Math.ceil(racks/2);
 for(let i=0;i<sheds;i++){const side=i%2?1:-1,k=Math.floor(i/2),x=side>0?32+rk*19+12+k*21:-72-rk*19-2-k*21;out.push(['xa_boatshed',x,'water',0,'a boat shed',0]);}
 // the temple and the governor's house by the landing, either side of the main stair; the market's hall at its head
 if(has('xa_temple'))out.push(['xa_temple',-56,R+21,0,'the temple of the Decree by the landing',0]);
 if(has('xa_governor'))out.push(['xa_governor',38,R+18,0,'the governor\'s house: the town\'s head, the Sultan\'s man',0]);
 if(has('xa_shops'))out.push(['xa_shops',mk.x,R+6+mk.d+12,0,'the market\'s hall at the head of the square',0]);
 // the bridge: the shore road over the stream
 if(has('xa_bridge'))out.push(['xa_bridge',xlStreamXd(G,R),R,Math.PI/2,'the footbridge: the shore road over the stream',0]);
 return out;}
// the works on the slope: each in a block of its own (it becomes the block's host); the wayside shrines at the main stair's
// head on each bench
function xlSlopeWorks(S){const out=[];for(const w of S.works)if(w.at==='slope')for(let i=0;i<w.n;i++)out.push(w.key);return out;}
function xlPlaceCivic(key,C,L,list){const K=KCITY.lib,SLx=K.SL,PLAN_=K.plan(),out=[];
 for(const [k,x,dd,ry,why,v0] of list){const v=v0|0,D=xlDims(k,v);if(!D){out.push({key:k,err:'no def'});continue;}
  const zs=xlShoreZ(key,x);let z;
  if(dd==='ghat')z=zs-1.7;                                     /* the ghat's waterline is 1.7 m in front of its middle */
  else if(dd==='water')z=zs-D.d/2+5;                            /* standing 5 m out into the lake */
  else if(dd==='beach')z=zs-D.d/2-3.5;                          /* on the beach above the water */
  else z=zs-dd;
  const q=L.P(x,z),u=[Math.cos(ry),-Math.sin(ry)],o=K.obb(q,u,D.w/2,D.d/2);
  const lot={id:PLAN_.lots.length,cls:'landmark',role:why,key:k,v,slot:0,wealth:1,x:q[0],z:q[1],y:0,ry,w:D.w,d:D.d,h:D.h,lot:o,bo:o,way:-1,side:0,s:0,born:1,died:null,civic:true,why};
  const st=KCITY.stance(o,(a,b)=>L.h(a,b),{maxDrop:12});lot.y=st?st.y:L.h(q[0],q[1]);if(st)lot.drop=st.drop;
  if(dd==='water'||dd==='ghat'){lot.y=1.2;delete lot.drop;lot.water=true;}   /* the deck at the strand's foot, 1.2 m over the lake */
  PLAN_.lots.push(lot);SLx.hashLot(lot);SLx.register(lot);SLx.R.stampPoly(K.obbCorners(K.obb(q,u,D.w/2+3,D.d/2+3)),K.OCC.HARD,lot.id);out.push(lot);}
 return out;}
// the stream's corridor kept open (green) up the slope, 16 m either side (but where the bridge stands)
function xlStreamClear(key,G,R,L,OCC){const s=xlStream(key).pts;let a=null;for(const p of s){const q=L.P(p[0],p[1]);if(a)R.eachNearSeg(a,q,16,k=>{if(R.occ[k]!==OCC.HARD)R.occ[k]=OCC.GREEN;});a=q;}}

// ---------------------------------------------------------------- the town's steps
function xlSteps(key,T){const S=XL.SPECS[key],G=xlGeo(key),Lay=S.layout,L=T.L,K=()=>KCITY.lib,R0=Lay.road,rows=Lay.rows,top=G.benches.length?G.benches[G.benches.length-1].d1:rows[rows.length-1];
 const west=-Lay.half,mk=Lay.market,mkP=[xlAt(key,mk.x-mk.w/2,R0+6),xlAt(key,mk.x+mk.w/2,R0+6),xlAt(key,mk.x+mk.w/2,R0+6+mk.d),xlAt(key,mk.x-mk.w/2,R0+6+mk.d)];
 return[
 {name:'the ground',run(C){const k=K(),R=k.SL.R=new k.Raster(C.tune.rasterHalf,C.tune.cell);R.occ.fill(k.OCC.OUT);
   const Z=[];for(let x=west-60;x<=G.stream.x+80;x+=30)Z.push(L.P(x,xlShoreZ(key,x)-4));for(let x=G.stream.x+80;x>=west-60;x-=30)Z.push(L.P(x,xlShoreZ(key,x)-top-12));
   k.SL.R.land=KCITY.site.zoneRaster(R,Z,{dry:1,h:L.h});k.SL.minSpacing=KCITY.site.minSpacing();k.plan().zone=Z;
   xlStreamClear(key,G,R,L,k.OCC);
   const mq=mkP.map(p=>L.P(p[0],p[1]));R.stampPoly(mq,k.OCC.GREEN,-1);k.plan().greens.push({id:0,kind:'plaza',poly:mq,district:'the market square',born:2});
   for(const F of T.fields)R.stampPoly(F.poly.map(p=>L.P(p[0],p[1])),k.OCC.GREEN,-1);}},
 {name:'the civic pieces',run(C){T.civic=xlPlaceCivic(key,C,L,xlCivicSpec(key));
   /* the wayside shrines at the main stair's head on each bench (beside the stair, uphill of the bench lane) */
   const sh=S.works.find(w=>w.key==='xa_wayside_shrine'),main=Lay.stairs.reduce((a,b)=>Math.abs(b)<Math.abs(a)?b:a,Lay.stairs[0]);
   if(sh)T.civic=T.civic.concat(xlPlaceCivic(key,C,L,G.benches.slice(0,sh.n).map(B=>['xa_wayside_shrine',main+9,B.d0+17,0,'the wayside shrine at the terrace stair\'s head on bench '+(B.i+1),B.i%3])));}},
 {name:'the streets',run(C){const S_=K().SL,line=(d,x0,x1,st)=>{const P=[];for(let x=x0;x<=x1+.1;x+=st)P.push(L.P(x,xlShoreZ(key,x)-d));return P;};
   S_.addWay('main',line(R0,west-40,G.stream.x+70,15),3,{tag:'the shore road'});
   for(let i=1;i<rows.length;i++){const d=rows[i];S_.addWay('side',line(d,west,Math.min(Lay.half,xlEast(G,d)-6),15),3,{tag:'row '+i});}
   for(const x of Lay.stairs){const P=[];for(let d=R0;d<=top+.1;d+=15)P.push(L.P(x,xlShoreZ(key,x)-d));S_.addWay('side',P,3,{tag:'the terrace stair x'+x});}
   for(const B of G.benches)S_.addWay('lane',line(B.d0+7,B.x0+6,B.x1-6,15),3,{tag:'the lane on bench '+(B.i+1)});}},
 {name:'frontage and courts',run(C){const blocks=[],k=K();
   /* the blocks between the rows, cut by the stairs, the last column up against the stream */
   for(let j=0;j<rows.length-1;j++){const dA=rows[j],dB=rows[j+1],east=Math.min(Lay.half,xlEast(G,(dA+dB)/2)),E=[west].concat(Lay.stairs.filter(x=>x>west+40&&x<east-40),[east]);
    for(let i=0;i<E.length-1;i++)blocks.push({id:'b-'+i+'-'+j,i,j,last:i===E.length-2,at:[(E[i]+E[i+1])/2,(dA+dB)/2],poly:xlBand(key,L,dA,dB,E[i],E[i+1],j===0?5:4.5),lanes:false});}
   /* the bench houses: a strip on each bench's lake side, behind its lane, cut at the stairs */
   G.benches.forEach(B=>{const E=[B.x0+8].concat(Lay.stairs.filter(x=>x>B.x0+40&&x<B.x1-40),[B.x1-8]);
    for(let i=0;i<E.length-1;i++)blocks.push({id:'bench-'+B.i+'-'+i,i:20+i,j:10+B.i,bench:true,at:[(E[i]+E[i+1])/2,B.d0+25],poly:xlBand(key,L,B.d0+7,B.d0+42,E[i],E[i+1],4),lanes:false});});
   /* the quarters (the spec's): each takes blocks until their room (the block's free raster, at XL.DENSITY houses a square
      metre) holds its share of the tune's households with a margin; the bench quarters the benches' strips, the stream's
      the column against the stream, the shore's the two lowest rows nearest their anchor (the market's square, else the
      landing), the slope's what is left */
   const target=XL.households(key),room=b=>{let n=0;k.SL.R.eachInPoly(b.poly,kk=>{if(k.SL.R.occ[kk]===k.OCC.FREE)n++;});return n*C.tune.cell*C.tune.cell*XL.DENSITY;};
   const free=blocks.slice(),take=(q,list)=>{let cap=0;const want=q.share*target*XL.MARGIN;for(const b of list){if(cap>=want)break;b.quarter=q.id;b.kind=q.id;cap+=room(b);free.splice(free.indexOf(b),1);}};
   const anchor=q=>q.role==='market'?[mk.x,R0+6+mk.d/2]:[0,R0];
   const order=S.quarters.slice().sort((a,b)=>({bench:0,stream:1,shore:2,slope:3}[a.at]-{bench:0,stream:1,shore:2,slope:3}[b.at])||(a.role==='market'?-1:b.role==='market'?1:0));
   for(const q of order){if(q.at==='slope')continue;
    const pool=free.filter(b=>q.at==='bench'?b.bench:q.at==='stream'?(b.last&&!b.bench&&b.j>=1):(!b.bench&&b.j<=1)),a=anchor(q);
    take(q,pool.sort((u,v)=>q.at==='stream'?u.j-v.j:(Math.hypot(u.at[0]-a[0],u.at[1]-a[1])-Math.hypot(v.at[0]-a[0],v.at[1]-a[1]))||u.i-v.i));}
   const slope=S.quarters.find(q=>q.at==='slope');
   for(const b of free.slice()){if(b.bench&&!slope)continue;b.quarter=slope?slope.id:S.quarters[0].id;b.kind=b.quarter;}
   for(let i=blocks.length-1;i>=0;i--)if(!blocks[i].quarter)blocks.splice(i,1);
   /* the works on the slope: a block each (the nearest the landing first), the work its host */
   const ws=xlSlopeWorks(S),far=b=>{const c=xlPolyC(b.poly);return Math.hypot(c[0]+L.o[0],c[1]+L.o[1]);},cand=blocks.filter(b=>slope&&b.quarter===slope.id).sort((a,b)=>far(a)-far(b)||a.i-b.i||a.j-b.j);
   ws.forEach((wk,n)=>{const b=cand[n*2+1]||cand[n];if(!b)return;const c=xlPolyC(b.poly),p=[c[0]+L.o[0],c[1]+L.o[1]];
    const lot=xlPlaceCivic(key,C,L,[[wk,p[0],xlShoreZ(key,p[0])-p[1],0,wk==='xa_granary'?'the town\'s granary (the terraces\' grain and the hub\'s)':wk==='xa_smithy'?'the smithy (the boats\' nails, the hoes)':'a work of the town\'s trade',0]])[0];
    if(lot&&lot.bo){b.host={c:lot.bo.c,u:lot.bo.u,hw:lot.bo.hw,hd:lot.bo.hd};T.civic.push(lot);}});
   T.blocks=blocks;
   const pools=xlPools(S),small={};for(const q in pools)small[q]=pools[q].filter(([k])=>{const D=xlDims(k,0);return D&&D.w<=20&&D.d<=20;});
   T.courts=KCITY.strategies['frontage-courts'].run(blocks,{step:6,seed:T.seed,focus:L.P(0,0),pools,small,sides:99,
    gaps:{landing:[2,5],market:[2,4],town:[3,7],bench:[4,9],stream:[4,9]},garden:{landing:.06,market:.04,town:.1,bench:.2,stream:.2},infill:{step:10,yard:.3}});
   /* the census: each quarter kept to its share of the tune's households, the farthest from the landing let go first */
   const byQ={},blockQ={};for(const b of blocks)blockQ[b.id]=b.quarter;
   for(const lot of k.plan().lots){if(lot.died!=null||lot.civic||!lot.court)continue;const q=blockQ[lot.court];(byQ[q]=byQ[q]||[]).push(lot);}
   T.quarterTarget={};let assigned=0;S.quarters.forEach((q,i)=>{const t=i===S.quarters.length-1?target-assigned:Math.round(q.share*target);assigned+=t;T.quarterTarget[q.id]=t;});
   for(const q in byQ){const list=byQ[q].map(l=>({l,d:Math.hypot(l.x+L.o[0],l.z+L.o[1])})).sort((a,b)=>a.d-b.d||a.l.id-b.l.id);
    list.slice(T.quarterTarget[q]==null?list.length:T.quarterTarget[q]).forEach(e=>{e.l.died=13;e.l.why='let go: the quarter is full (the tune\'s households)';});}}}];}
function xlPolyC(P){let sx=0,sz=0;for(const p of P){sx+=p[0];sz+=p[1];}return[sx/P.length,sz/P.length];}

// ---------------------------------------------------------------- the benches' fields (records): the bench behind its houses, cut at the stairs
function xlFields(key){const S=XL.SPECS[key],G=xlGeo(key),Lay=S.layout,out=[];
 for(const B of G.benches){const E=[B.x0+4].concat(Lay.stairs.filter(x=>x>B.x0+30&&x<B.x1-30),[B.x1-4]);
  for(let i=0;i<E.length-1;i++){const x0=E[i]+4,x1=E[i+1]-4,dA=B.d0+42,dB=B.d1-3;if(x1-x0<20||dB-dA<10)continue;const P=[];
   for(let x=x0;x<=x1+.1;x+=(x1-x0)/Math.max(2,Math.ceil((x1-x0)/30)))P.push(xlAt(key,x,dA));
   for(let x=x1;x>=x0-.1;x-=(x1-x0)/Math.max(2,Math.ceil((x1-x0)/30)))P.push(xlAt(key,x,dB));
   out.push({id:'field-'+B.i+'-'+i,bench:B.i,y:B.y,poly:P,crop:KRAND.hash(XL.seed(key),B.i,i)%3===0?'amaranth':'vale-rice'});}}
 return out;}

// ---------------------------------------------------------------- the boats: the dugouts drawn up and out fishing, the launches and the barge at the quay
function xlBoats(key,T){const S=XL.SPECS[key],c=S.craft,B={moored:[],out:[]},st=KRAND.stream(KRAND.child(T.seed,'boats')),zs=x=>xlShoreZ(key,x);
 const quay=T.civic.find(l=>l.key==='xa_quay'),ghat=T.civic.find(l=>l.key==='xa_ghat'),qx=quay?quay.x+T.L.o[0]:-36,gx=ghat?ghat.x+T.L.o[0]:0;
 // the launches and the barge moored off the quay's face
 for(let i=0;i<c.launches;i++){const x=qx-10+i*9;B.moored.push({id:'launch:'+i,key:'xa_launch',v:1,x,z:zs(x)+14,ry:Math.PI/2,beached:false});}
 for(let i=0;i<c.barges;i++){const x=qx+12+i*16;B.moored.push({id:'barge:'+i,key:'xa_lake_barge',v:1,x,z:zs(x)+16,ry:Math.PI/2,beached:false});}
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
 const T={key,seed:XL.seed(key),L,civic:[],blocks:[],fields:xlFields(key)};
 const C=KCITY.create({name:'xanadu-lake:'+key,tune:xlTune(Math.ceil(Math.max(Lay.half+260,G.stream.x+220,(Lay.rows[Lay.rows.length-1]+400)))/10*10),seed:T.seed,ground:{h:L.h},kit:{dims:xlDims},
  rand:'krand',index:{order:'insertion'},steps:xlSteps(key,T)});
 T.C=C;T.plan=C.run();
 const blockQ={};for(const b of T.blocks)blockQ[b.id]=b.quarter;
 const place=[];
 for(const l of T.plan.lots){if(l.died!=null||!l.bo)continue;const q=[l.x+L.o[0],l.z+L.o[1]];
  const kind=l.civic?(S.works.some(w=>w.key===l.key)?'work':'civic'):'house';
  place.push({id:key+':'+l.id,key:l.key,v:l.v|0,x:q[0],z:q[1],ry:l.ry,w:l.w,d:l.d,h:l.h,o:{v:l.v|0,y:l.y==null?xlH(key,q[0],q[1]):l.y},kind,
   quarter:l.court?blockQ[l.court]:null,wealth:kind==='house'?XL.CLASS[l.key]||'poor':null,why:l.why||l.role||null,water:!!l.water,
   bo:{c:q,u:l.bo.u,hw:l.bo.hw,hd:l.bo.hd},drop:l.drop||0});}
 // the market's stalls (opt-in extra/88e): rows across the square facing their aisle, the trade from each stall's own hash
 {const D=xlDims('xa_stall',0),mk=Lay.market;if(D&&S.stalls>0){const per=Math.ceil(S.stalls/2),dx=Math.min(9,(mk.w-16)/per);
  for(let r=0;r<2;r++)for(let i=0;i<per&&r*per+i<S.stalls;i++){const x=mk.x-(per-1)*dx/2+i*dx,d=Lay.road+6+mk.d/2+(r?-7:7),q=xlAt(key,x,d),ry=r?0:Math.PI,v=KRAND.hash(T.seed,r,i)%4;
   place.push({id:key+':stall:'+r+':'+i,key:'xa_stall',v,x:q[0],z:q[1],ry,w:D.w,d:D.d,h:D.h,o:{v,y:xlH(key,q[0],q[1])+.05},kind:'stall',quarter:'market',wealth:null,why:'a stall of the market square',water:false,
    bo:{c:q,u:[Math.cos(ry),-Math.sin(ry)],hw:D.w/2,hd:D.d/2},drop:0});}}}
 const ways=T.plan.ways.map(w=>({cls:w.cls,w:w.w,tag:w.tag,pts:w.pts.map(p=>[p[0]+L.o[0],p[1]+L.o[1]]),closed:w.closed}));
 const houses=place.filter(p=>p.kind==='house'),byQuarter={},wealth={poor:0,middle:0,rich:0};
 for(const q of S.quarters)byQuarter[q.id]=[0,T.quarterTarget?T.quarterTarget[q.id]:0];
 for(const h of houses){if(byQuarter[h.quarter])byQuarter[h.quarter][0]++;wealth[h.wealth]++;}
 const tune=XL.tune(key);
 XL_TOWN={key,name:tune?tune.name:key,spec:S,geo:G,L,place,ways,fields:T.fields,blocks:T.blocks.map(b=>({id:b.id,quarter:b.quarter,poly:b.poly.map(p=>[p[0]+L.o[0],p[1]+L.o[1]])})),
  greens:(T.plan.greens||[]).map(g=>({kind:g.kind,district:g.district,poly:g.poly.map(p=>[p[0]+L.o[0],p[1]+L.o[1]])})),
  census:{target:XL.households(key),people:tune?tune.people:null,houses:houses.length,byQuarter,wealth,andean:houses.filter(h=>/andean/.test(h.key)).length,hh:XL.HH,peopleHoused:+(houses.length*XL.HH).toFixed(1)}};
 XL_TOWN.boats=xlBoats(key,T);
 return XL_TOWN;}

// ---------------------------------------------------------------- the flora's mask (the Vale of Xanadu biome on Xanadu's page)
// From the plan's records, never from pixels: the stream's ravine wooded (1), the slope's grass between the houses (.4), the
// wall above the benches (.55), the beach bare (.04); a yard in a block (.05); never in the lake, on a way, on a field or in
// a building's footprint (core/space's indexes of the records)
function xlInPoly(p,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&(p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0]))c=!c;}return c;}
function xlBioMask(T){const S=KCITY.lib.KSPACE,B=S.create({cell:40}),W=S.create({cell:60}),K=S.create({cell:120}),key=T.key,G=T.geo;
 for(const p of T.place)B.insert(p,p.x,p.z,Math.hypot(p.bo.hw,p.bo.hd)+1.5);
 for(const w of T.ways)for(let i=1;i<w.pts.length;i++){const a=w.pts[i-1],b=w.pts[i];W.insert({a,b,r:w.w/2+1.5},(a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1])/2+w.w);}
 for(const P of T.blocks.map(b=>({P:b.poly,yard:true})).concat(T.fields.map(f=>({P:f.poly,field:true})))){const xs=P.P.map(q=>q[0]),zs=P.P.map(q=>q[1]);
  K.insert(P,(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2,Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...zs)-Math.min(...zs))/2);}
 return function(x,z){if(xlH(key,x,z)<.8)return 0;
  for(const q of W.query(x,z,1)){const dx=q.b[0]-q.a[0],dz=q.b[1]-q.a[1],L2=Math.max(1e-9,dx*dx+dz*dz);let t=((x-q.a[0])*dx+(z-q.a[1])*dz)/L2;t=t<0?0:t>1?1:t;if(Math.hypot(q.a[0]+dx*t-x,q.a[1]+dz*t-z)<q.r)return 0;}
  for(const p of B.query(x,z,1))if(Math.abs((x-p.x)*p.bo.u[0]+(z-p.z)*p.bo.u[1])<p.bo.hw+1.5&&Math.abs(-(x-p.x)*p.bo.u[1]+(z-p.z)*p.bo.u[0])<p.bo.hd+1.5)return 0;
  const d=xlShoreZ(key,x)-z,sd=Math.abs(x-xlStreamXd(G,d));if(sd<5&&d<G.stream.to)return 0;   /* the stream's own channel */
  for(const k of K.query(x,z,1))if(xlInPoly([x,z],k.P))return k.field?0:.05;
  if(sd<45&&d<G.stream.to+60)return 1;if(d<24)return .04;if(d<T.spec.layout.rows[T.spec.layout.rows.length-1]+20)return .4;return .55;};}

// on the page: the town its query names, the ground every builder and the camera read, the core/tags registry under its name
XL.KEY=XL.pick();
if(typeof VERN!=='undefined'){terrainH=(x,z)=>xlH(XL.KEY,x,z);if(typeof KTAGS!=='undefined')KTAGS.page=KTAGS.page||KTAGS.create({build:'xanadu-lake'});
 try{xlRun(XL.KEY);}catch(e){XL_ERR=String(e&&e.stack||e);if(typeof reportErr==='function')reportErr('lake town plan: '+XL_ERR);}
 if(typeof BIO!=='undefined'&&BIO.host&&XL_TOWN&&!XL_ERR){const T=XL_TOWN,G=T.geo;
  Object.assign(BIO.host,{mask:xlBioMask(T),origin:[[0,-100],[G.stream.x,-400],[0,-700]],center:[0,-400],
   fields:{wet:(x,z)=>Math.min(1,.6+Math.max(0,1-Math.abs(x-xlStreamXd(G,xlShoreZ(T.key,x)-z))/80)*.4),salt:()=>0,upland:()=>0,
    flow:(x,z)=>Math.max(0,1-Math.abs(x-xlStreamXd(G,xlShoreZ(T.key,x)-z))/16),mist:()=>0}});}
 if(typeof window!=='undefined'){const T=XL_TOWN||{};window._xl={key:XL.KEY,name:T.name,err:XL_ERR,placed:(T.place||[]).length,census:T.census,
  civic:(T.place||[]).filter(p=>p.kind==='civic').length,works:(T.place||[]).filter(p=>p.kind==='work').length,houses:(T.place||[]).filter(p=>p.kind==='house').length,
  stalls:(T.place||[]).filter(p=>p.kind==='stall').length,ways:(T.ways||[]).length,fields:(T.fields||[]).length,
  boats:T.boats?{moored:T.boats.moored.length,out:T.boats.out.length}:null};}}
