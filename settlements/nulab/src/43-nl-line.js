// ================================================================= NULAB — step N6: Station 5, the lake viaduct, the Chimes portal and Loj Faiv
// [G data] (PLAN.md sections 0 Q2, 3.2 quarter 9, 6 and 7; step N6). Plain deterministic records on KRAND and KTRANSIT: no
// three.js, no DOM. Built from NL_GROUND before terrainH is bound so NL_LINE.carveH shapes the 6 m Line-quarter ground mesh
// (Station 5's shore terrace, the 37 m approach cutting to the Nulab-Chimes portal, Loj Faiv's rock-wall benches, the cover
// ridge over the shallow bore, and the shaft collar). 90q-nl-line.js draws the viaducts, Station 5, the portal, the KCAVERN
// rock walls and Loj Faiv (TG.tg / TG.fg), and watches every ruined structure with KRUINS.watch.
var NL_LINE=(function(){
 const D=(x,d)=>x==null?d:x;
 const sm=(a,b,t)=>{const q=Math.max(0,Math.min(1,(t-a)/(b-a)));return q*q*(3-2*q);};
 /* exact 8-corner + barrier lowest-point seating (core/ruins README.md): given a collapsed deck span S with fall {x, z, yaw,
    pitch, roll}, sets F.y so its rotated soffit/barrier corners sit at gUnder - sink (0.18 m into the ground/lakebed) */
 function rotCorner(lx,ly,az,yaw,pitch,roll){
  const cr=Math.cos(roll),sr=Math.sin(roll),x1=lx*cr-ly*sr,y1=lx*sr+ly*cr;
  const cp=Math.cos(-pitch),sp=Math.sin(-pitch),y2=y1*cp-az*sp,z2=y1*sp+az*cp;
  const cy=Math.cos(yaw),sy=Math.sin(yaw);
  return [x1*cy+z2*sy,y2,-x1*sy+z2*cy];}
 function seatSpanFall(S,ground,deck,liftExpr,topBar,sink){
  const F=S.fall;if(!F)return;
  const sk=D(sink,.18),hw=S.width/2,l=-hw+(S.crack&&S.crack.side<0?S.crack.depth:0),r=hw-(S.crack&&S.crack.side>0?S.crack.depth:0);
  const bL=S.barriers&&S.barriers[0]?topBar:0,bR=S.barriers&&S.barriers[1]?topBar:0,hl=S.len/2;
  const pts=[[l,-.45],[l+1.1,-deck],[r-1.1,-deck],[r,-.45],[l,bL],[r,bR],[0,S.lanes>0?.9:.05]];
  let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,minY=1e9,maxY=-1e9;
  for(const az of [-hl,hl])for(const p of pts){
   const q=rotCorner(p[0],p[1],az,F.yaw,F.pitch,F.roll),wx=F.x+q[0],wz=F.z+q[2];
   if(wx<x0)x0=wx;if(wx>x1)x1=wx;if(wz<z0)z0=wz;if(wz>z1)z1=wz;if(q[1]<minY)minY=q[1];if(q[1]>maxY)maxY=q[1];}
  const gU=Math.min(ground((x0+x1)/2,(z0+z1)/2),ground(x0,z0),ground(x1,z1),ground(x0,z1),ground(x1,z0));
  F.y=gU-sk-liftExpr-minY;
  F.box=[x0,gU-sk,z0,x1,gU-sk+(maxY-minY),z1];F.gUnder=gU;}
 function seatBox(x,z,w,h,d,yaw,pitch,roll,ground,sink){
  const sk=D(sink,.16);let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,minY=1e9,maxY=-1e9;
  for(const lx of [-w/2,w/2])for(const ly of [0,h])for(const az of [-d/2,d/2]){
   const q=rotCorner(lx,ly,az,yaw,pitch,roll),wx=x+q[0],wz=z+q[2];
   if(wx<x0)x0=wx;if(wx>x1)x1=wx;if(wz<z0)z0=wz;if(wz>z1)z1=wz;if(q[1]<minY)minY=q[1];if(q[1]>maxY)maxY=q[1];}
  const gU=Math.min(ground((x0+x1)/2,(z0+z1)/2),ground(x0,z0),ground(x1,z1),ground(x0,z1),ground(x1,z0));
  const y=gU-sk-minY;return {x,y,z,w,h,d,yaw,pitch,roll,box:[x0,y+minY,z0,x1,y+maxY,z1],gUnder:gU};}

 function make(o){
  const G=o.ground,seed=D(o.seed,44325),u=(a,b,c)=>KRAND.unit(KRAND.hash(seed,a,b,c));
  /* bearing from Ledge's lifts (px 437,1331: [-12900, -54900]) across the lake to the main south shore: yaw 0.22 rad SSE */
  const YAW=.22,SX=Math.sin(YAW),CZ=Math.cos(YAW),O=[-1768,-5980],LEN=2260,PORTAL_S=1960;
  const atS=(s,lat)=>{const x=O[0]+s*SX,z=O[1]+s*CZ,off=D(lat,0);return [x+CZ*off,z-SX*off];};
  /* keep the entire cutting & gallery invert strictly above G.LAKE (297.4 m) so open lake water never enters the trench:
     306.8 m over the lake -> 301.8 m at Station 5 (s 1360..1520) -> 299.1 m at the portal (s 1960) -> 298.4 m in the bore */
  const KNOTS=[[0,306.8],[960,306.8],[1360,301.8],[1520,301.8],[PORTAL_S,299.1],[LEN,298.4]];
  const pts3=KNOTS.map(k=>{const p=atS(k[0],0);return [p[0],k[1],p[1]];});

  /* ---- 1. THE RIFT LINE RECORD (KTRANSIT.line): viaduct -> Station 5 -> approach cutting -> Nulab-Chimes gallery */
  const LN=KTRANSIT.line({
   id:'nl.line',seed,base:59000,pts:pts3,ground:(x,z)=>G.h(x,z),radius:0,state:'worn',
   forms:[{s0:0,s1:1360,kind:'elevated'},{s0:1360,s1:PORTAL_S,kind:'open'},{s0:PORTAL_S,s1:LEN,kind:'gallery'}],
   cond:[
    {s0:0,s1:1188,track:'*',state:'cut'},
    {s0:1188,s1:1360,track:'*',state:'worn'},
    {s0:1360,s1:1650,track:'t1',state:'worn'},{s0:1650,s1:2225,track:'t1',state:'blocked'},{s0:2225,s1:LEN,track:'t1',state:'cut'},
    {s0:1360,s1:2225,track:'t2',state:'kept'},{s0:2225,s1:LEN,track:'t2',state:'cut'},
    {s0:1360,s1:2225,track:'t3',state:'kept'},{s0:2225,s1:LEN,track:'t3',state:'cut'},
    {s0:1360,s1:1640,track:'t4',state:'worn'},{s0:1640,s1:2225,track:'t4',state:'blocked'},{s0:2225,s1:LEN,track:'t4',state:'cut'}],
   crossovers:[
    {id:'nl.x.cut',s:1580,a:'t2',b:'t3',len:44,dir:1,state:'kept'},
    {id:'nl.x.bore',s:2045,a:'t3',b:'t2',len:48,dir:-1,state:'kept'}],
   stations:[{id:'nl.st5',num:5,s:1440,len:144,kind:'surface',state:'kept',name:'Station 5 (Nulab lake station)'}],
   shafts:[{id:'nl.sh.chimes',s:2120,side:-1,off:-8,r:2.8,kind:'air',state:'open',hidden:false}],
   doors:[{id:'nl.d.gap1',s:2240,kind:'seal',state:'shut'}],
   nicheStep:50,nicheSide:1,furniture:true});

  /* ---- 2. CARVED GROUND DELTA (carveH) & PORTAL MOUTH HOLE (portalHole) */
  const SEC=LN.sec,LOJ_S0=1660,LOJ_S1=1956;
  function portalHole(x,z){
   if(!LN.path.near(x,z,40))return false;
   const pr=LN.path.project(x,z);
   return pr.s>=PORTAL_S-9&&pr.s<=PORTAL_S+28&&pr.off>=SEC.x0-6&&pr.off<=SEC.x1+6;}
  function carveH(x,z){
   if(!LN.path.near(x,z,95))return 0;
   const pr=LN.path.project(x,z),s=pr.s,off=pr.off;
   if(s<1315||s>LEN+40||pr.d>90)return 0;
   const g0=G.h(x,z);
   /* over the shallow Chimes bore (s >= PORTAL_S), raise a smooth rift-fill bluff so ground stands well above the 14 m vault,
      with the hoist shaft's collar pit cut at s = 2120 */
   if(s>PORTAL_S){
    const ridge=5.8*sm(PORTAL_S-18,PORTAL_S+28,s)*(1-sm(LEN-20,LEN+38,s))*(1-sm(28,84,Math.abs(off)));
    let pit=0;const sh=LN.shafts[0];
    if(sh){const d=Math.hypot(x-sh.x,z-sh.z);if(d<sh.r+1.2)pit=d<sh.r?-3.2:-3.2*(sh.r+1.2-d)/1.2;}
    return ridge+pit;}
   /* Station 5 terrace & lakeward embankment (s = 1315..1524) */
   if(s<=1524){
    const yT=LN.floorAt(Math.max(1360,Math.min(1520,s)))-.08;
    const ks=sm(1315,1356,s),latOut=off<-25?-25-off:off>58?off-58:0,kx=1-sm(0,16,latOut);
    return (yT-g0)*ks*kx;}
   /* Approach cutting (s = 1524..PORTAL_S): flat 37 m invert; widened under Loj Faiv's KCAVERN rock benches (s = 1660..1956)
      so no ground triangle slices through a carved room behind its front; outside the benches, rises into the portal bluff */
   const yF=LN.floorAt(s)-.14,inLoj=sm(LOJ_S0-14,LOJ_S0+4,s);
   const wLim=-21.4-18.0*inLoj,eLim=16.4+18.0*inLoj;
   const rimLift=5.8*sm(PORTAL_S-70,PORTAL_S,s);
   if(off>=wLim&&off<=eLim){
    const sub=(off<-21.0||off>16.0)?-.65*inLoj:0;
    return (yF+sub)-g0;}
   const out=off<wLim?wLim-off:off-eLim,slope=16-4*inLoj;
   if(out>=slope)return rimLift*(1-sm(28,84,Math.abs(off)));
   const t=sm(0,slope,out);
   return (yF-g0)*(1-t)+rimLift*(1-sm(28,84,Math.abs(off)))*t;}
  const terrainAt=(x,z)=>G.h(x,z)+carveH(x,z);

  /* ---- 3. THE LINE LAKE VIADUCT (s = 0..1360, 48 spans of 28.33 m): fallen in the deep middle, stubs in the shallows, last
     7 spans standing into Station 5; every collapsed span seated on its lowest corners */
  const V_N=48,V_S1=1360,V_SPAN=V_S1/V_N,V_W=35.6,V_DECK=1.6;
  const vSpans=[],vPiers=[];
  for(let i=0;i<V_N;i++){
   const s0=i*V_SPAN,s1=(i+1)*V_SPAN,smid=(s0+s1)/2,p0=atS(s0,0),p1=atS(s1,0),y0=LN.floorAt(s0),y1=LN.floorAt(s1);
   const pitch=Math.atan2(y1-y0,V_SPAN),r=u(i,11,1);
   let state='standing';
   if(smid<480)state=r<.14?'collapsed':'gone';
   else if(smid<940)state=r<.22?'standing':r<.42?'cracked':r<.76?'collapsed':'gone';
   else if(smid<1188)state=r<.45?'standing':r<.72?'cracked':'collapsed';
   else state=i===43?'cracked':'standing';
   const S={id:'nl.lv.s'+i,i,s0,s1,x0:p0[0],z0:p0[1],y0,x1:p1[0],z1:p1[1],y1,yaw:YAW,len:V_SPAN,pitch,width:V_W,lanes:0,
    state,barriers:[state!=='cracked'||u(i,11,2)<.5,state!=='cracked'||u(i,11,2)>=.5],
    crack:state==='cracked'?{side:u(i,11,2)<.5?-1:1,depth:3.2+2.4*u(i,11,3)}:null,fall:null};
   if(state==='collapsed'){
    const lat=(u(i,11,4)-.5)*5,fp=atS(smid,lat);
    S.fall={x:fp[0],z:fp[1],y:0,yaw:YAW+(u(i,11,5)-.5)*.32,pitch:(u(i,11,6)-.5)*.08,roll:(u(i,11,7)<.5?-1:1)*(.05+.09*u(i,11,8))};
    S.barriers=[u(i,11,9)<.4,u(i,11,10)<.4];
    seatSpanFall(S,terrainAt,V_DECK,0,.85,.18);}
   vSpans.push(S);}
  for(let j=0;j<=V_N;j++){
   const s=j*V_SPAN,p=atS(s,0),yTop=LN.floorAt(s)-V_DECK,yG=terrainAt(p[0],p[1]),h=yTop-yG;
   const L=j>0?vSpans[j-1].state:null,R=j<V_N?vSpans[j].state:null,down=st=>!st||st==='collapsed'||st==='gone';
   let state='standing';
   if(h<1.2)state='fill';
   else if(down(L)&&down(R))state=u(j,12,1)<.52?'bare':'stub';
   else if(down(L)||down(R))state='bare';
   const stubH=state==='stub'?Math.max(G.LAKE+2.6-yG,h*(.42+.36*u(j,12,2))):0;
   vPiers.push({id:'nl.lv.p'+j,i:j,s,x:p[0],z:p[1],yG,yTop,h:Math.max(0,h),state,cap:state!=='stub',stub:Math.min(h-.6,Math.max(1.8,stubH)),yaw:YAW});}

  /* ---- 4. THE PARALLEL ANCIENT HIGHWAY VIADUCT (44 m east of the Line: biomes/line PLAN.md 2.3) */
  const HW_OFF=44,HW_S1=1428,hwPts=[atS(40,HW_OFF),atS(960,HW_OFF),atS(HW_S1,HW_OFF)];
  const HW=KTRANSIT.highway(hwPts,{
   id:'nl.hw',seed:seed+31,ground:terrainAt,clearance:8.4,span:28,width:18,lanes:4,maxGrade:.03,radius:0,lampStep:56,
   ruin:s=>s<460?{intact:0,cracked:0,collapsed:.14,gone:.86}:s<940?{intact:.16,cracked:.24,collapsed:.34,gone:.26}:
    s<1180?{intact:.42,cracked:.30,collapsed:.28,gone:0}:{intact:.62,cracked:.38,collapsed:0,gone:0}});
  for(const S of HW.spans)if(S.state==='collapsed'&&S.fall){
   S.fall.pitch*=.24;S.fall.roll=(S.fall.roll<0?-1:1)*Math.min(.11,Math.abs(S.fall.roll));
   const liftExpr=.4+HW.deck*.5*Math.abs(Math.sin(S.fall.roll));
   seatSpanFall(S,terrainAt,HW.deck,liftExpr,.95,.18);}
  for(const p of HW.piers)if(p.state==='stub'){
   const minStub=Math.max(1.8,G.LAKE+2.2-p.yG);p.stub=Math.min(p.h-.6,Math.max(p.stub,minStub));}

  /* ---- 5. STATION 5 CONCOURSE & HEADHOUSE (s = 1368..1512, 6 bays of 24 m spanning the 37 m terrace) */
  const stMid=atS(1440,0),stY=LN.floorAt(1440);
  const stBays=[];
  for(let b=0;b<6;b++){
   const bs0=1368+b*24,bs1=bs0+24,bm=(bs0+bs1)/2,pm=atS(bm,0);
   const state=b===0?'ruined':b===1?'cracked':'kept';
   stBays.push({i:b,s0:bs0,s1:bs1,x:pm[0],z:pm[1],y:stY,yaw:YAW,state});}
  const stWrecks=[
   seatBox(atS(1378,-24.5)[0],atS(1378,-24.5)[1],5.6,.65,9.2,YAW+.18,.03,-.06,terrainAt,.16),
   seatBox(atS(1384,20.2)[0],atS(1384,20.2)[1],5.2,.65,8.4,YAW-.22,-.03,.05,terrainAt,.16)];
  const station5={id:'nl.line.station5',name:'Station 5 — Nulab lake station (the Ancients\' Rift line)',x:stMid[0],y:stY,z:stMid[1],
   yaw:YAW,w:44,d:148,h:13.5,s0:1368,s1:1512,bays:stBays,wrecks:stWrecks};

  /* ---- 6. THE NULAB-CHIMES PORTAL (s = 1960) & VENTILATION SHAFT HEAD (s = 2120) */
  const pPt=atS(PORTAL_S,0),pFloor=LN.floorAt(PORTAL_S),pGround=G.h(pPt[0],pPt[1])+5.8;
  const portal={id:'nl.line.portal',name:'The Nulab-Chimes tunnel portal (worked to the first gap)',s:PORTAL_S,
   x:pPt[0],y:pFloor,z:pPt[1],yaw:YAW,top:Math.max(pGround+1.2,pFloor+SEC.crown+2.2),w:64,h:Math.max(pGround+1.2,pFloor+SEC.crown+2.2)-pFloor};
  const sh0=LN.shafts[0],shaftHead={id:'nl.line.shaft',name:'Loj Faiv\'s hoist and air shaft on the Chimes bore',
   x:sh0.x,y:G.h(sh0.x,sh0.z)+5.8,z:sh0.z,r:sh0.r,foot:sh0.foot};

  /* ---- 7. LOJ FAIV (~152 Tungangs in the Union's count): carved directly into the bare rift-fill rock walls of the deep
     cutting (s = 1670..1946) right outside the Nulab-Chimes portal, plus three surface porter/salvage sheds on the east rim */
  const ryW=YAW+Math.PI/2,ryE=YAW-Math.PI/2,W_FACE=SEC.x0,E_FACE=SEC.x1;
  const lojSpec=[
   /* West rock wall (facing +east across the cutting): loj hall, signal box, carriage house on blocked t4, sets and cuts */
   {id:'lf.hall',key:'tg-loj-hall',s:1918,side:-1,loj:5,num:'L5',people:0,name:'Loj Faiv: the loj hall (count wall and Book)'},
   {id:'lf.sig',key:'tg-signal-box',s:1894,side:-1,num:'5S',people:0,name:'Loj Faiv: the signal box (the steward\'s office)'},
   {id:'lf.car',key:'tg-carriage-house',s:1858,side:-1,num:'501',people:12,name:'Loj Faiv: carriage house on the outer siding'},
   {id:'lf.set.w0',key:'tg-set',s:1824,side:-1,num:502,people:14},
   {id:'lf.set.w1',key:'tg-set',s:1808,side:-1,num:504,people:14},
   {id:'lf.bath',key:'tg-bath',s:1790,side:-1,people:0,name:'Loj Faiv: the warm bath'},
   {id:'lf.cistern',key:'tg-cistern',s:1772,side:-1,people:0,name:'Loj Faiv: the cistern'},
   {id:'lf.set.w2',key:'tg-set',s:1754,side:-1,num:506,people:14},
   {id:'lf.cut.w0',key:'tg-cut',s:1738,side:-1,num:511,people:6},
   {id:'lf.cut.w1',key:'tg-cut',s:1728,side:-1,num:512,people:6},
   {id:'lf.night',key:'tg-night-mouth',s:1714,side:-1,people:0,name:'Loj Faiv: the night mouth up to the shore plain'},
   /* East rock wall (facing -west across the cutting): dark beds, fan house, household sets and hewn cells */
   {id:'lf.beds',key:'tg-dark-beds',s:1932,side:1,people:0,name:'Loj Faiv: the dark beds (fungus terraces)'},
   {id:'lf.fan',key:'tg-fan-house',s:1910,side:1,people:0,name:'Loj Faiv: the fan house'},
   {id:'lf.set.e0',key:'tg-set',s:1892,side:1,num:520,people:14},
   {id:'lf.set.e1',key:'tg-set',s:1876,side:1,num:522,people:14},
   {id:'lf.set.e2',key:'tg-set',s:1860,side:1,num:524,people:14},
   {id:'lf.cut.e0',key:'tg-cut',s:1844,side:1,num:531,people:6},
   {id:'lf.cut.e1',key:'tg-cut',s:1834,side:1,num:532,people:6},
   {id:'lf.cut.e2',key:'tg-cut',s:1824,side:1,num:533,people:6},
   {id:'lf.set.e3',key:'tg-set',s:1808,side:1,num:526,people:14},
   {id:'lf.cut.e3',key:'tg-cut',s:1792,side:1,num:534,people:6},
   {id:'lf.cut.e4',key:'tg-cut',s:1782,side:1,num:535,people:6}];
  const lojSites=lojSpec.map(sp=>{
   const lat=sp.side<0?W_FACE:E_FACE,p=atS(sp.s,lat),y=LN.floorAt(sp.s)+.12;
   const rimH=G.h(p[0],p[1])+5.8*sm(PORTAL_S-70,PORTAL_S,sp.s);
   return {id:'nl.loj.'+sp.id,key:sp.key,s:sp.s,side:sp.side,lat,x:p[0],y,z:p[1],ry:sp.side<0?ryW:ryE,
    state:'kept',num:sp.num,loj:sp.loj,people:sp.people,name:sp.name||null,topG:rimH};});
  const rimSheds=[
   {id:'nl.loj.rim.store',key:'fg-store',s:1585,lat:34,ry:ryE,w:8,d:6,h:4.5,name:'Loj Faiv: the Union trade and rare-earth store'},
   {id:'nl.loj.rim.rope',key:'fg-ropehouse',s:1614,lat:36,ry:ryE,w:20,d:5,h:4,name:'The Travellers\' cable and porter shed'},
   {id:'nl.loj.rim.hut',key:'fg-hut',s:1562,lat:33,ry:ryE,w:6,d:5,h:4.2,name:'The night watchman\'s turf hut'}].map(r=>{
    const p=atS(r.s,r.lat);return Object.assign({},r,{x:p[0],z:p[1],y:terrainAt(p[0],p[1])});});
  const lojPeople=lojSites.reduce((a,s)=>a+s.people,0);

  return {seed,yaw:YAW,origin:O,len:LEN,atS,line:LN,shoreWindow:[1360,LEN],carveH,portalHole,terrainAt,
   viaduct:{spans:vSpans,piers:vPiers,width:V_W,deck:V_DECK,s0:0,s1:V_S1},
   highway:HW,station5,portal,shaftHead,
   loj:{name:'Loj Faiv',station:5,people:lojPeople,sites:lojSites,rimSheds,s0:LOJ_S0,s1:LOJ_S1,wFace:W_FACE,eFace:E_FACE}};}

 return {make,seatSpanFall,seatBox,rotCorner};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=NL_LINE;
