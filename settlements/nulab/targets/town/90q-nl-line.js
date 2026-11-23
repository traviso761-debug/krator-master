// ================================================================= NULAB — step N6: Station 5, the lake viaducts, the portal and Loj Faiv
// [web] Draws NL_LPLAN (targets/town/89zn-nl-site.js, from src/43-nl-line.js):
//   1. KTRANSIT.draw.line on the shore-to-bore window (Station 5 platforms & furniture, the 37 m approach cutting, the kept inner
//      guideways & crossovers, and 300 m of lined 4-track gallery toward Chimes with its shaft and gap bulkhead).
//   2. The 4-track Line lake viaduct (s 0..1360) and the parallel Ancient highway lake viaduct (KTRANSIT.draw.highway), with
//      standing spans near shore, fallen spans seated on their lowest corners, and pier stubs walking out into the great lake.
//   3. Station 5's monumental Ancient concourse & headhouse (kept southern bays, weathered/ruined lakeward bays, seated wrecks).
//   4. The Nulab-Chimes concrete tunnel portal headwall (arched gallery mouth, Tungang signal lamps) and the Chimes bore's hoist
//      shaft head on the rise above.
//   5. Loj Faiv (~152 Tungangs): KCAVERN rock benches flanking the deep cutting carved from TG.tg.carve (the void plans), the
//      carved fronts and furnished rooms drawn by TG.tg.draw, and three surface porter/salvage sheds drawn by TG.fg.draw.
//   6. Every ruined structure (both lake viaducts and Station 5's headhouse) watched with KRUINS.watch.
const NL_LINE_RUINS=[];
(function(){
 if(typeof NL_LPLAN==='undefined'||!NL_LPLAN||typeof KTRANSIT==='undefined')return;
 const t0=performance.now(),L=NL_LPLAN,LN=L.line,T=KTRANSIT,col=T.COL;
 const dk=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
 if(typeof KratorTransitFurniture!=='undefined')KratorTransitFurniture.dead=true;   /* a thousand years: no Ancient street lens glows */
 const furn=typeof KratorTransitFurniture!=='undefined'?KratorTransitFurniture:null;
 const root=new THREE.Group();root.name='nulab:line-quarter';scene.add(root);

 /* ---- 1. THE SHORE-TO-BORE WINDOW (Station 5 platforms, cutting, and Chimes tunnel gallery) */
 const W=T.lineWindow(LN,L.shoreWindow[0],L.shoreWindow[1]),lojLocalS0=L.loj.s0-L.shoreWindow[0]-6;
 const lineGrp=T.draw.line(W,{furn,lit:false,openWalls:s=>s<lojLocalS0});
 lineGrp.name='line:shore-and-bore';root.add(lineGrp);

 /* ---- 2. THE 4-TRACK LINE LAKE VIADUCT (s 0..1360): watched by KRUINS */
 const lvB=T.builder(),V=L.viaduct,G=LN.sec.guide;
 const vDeckProf=(w,deck,crack)=>{const l=-w/2+(crack&&crack.side<0?crack.depth:0),r=w/2-(crack&&crack.side>0?crack.depth:0);
  return [[l,0],[r,0],[r,-.45],[r-1.1,-deck],[l+1.1,-deck],[l,-.45]];};
 const vParapet=(x,h)=>[[x-.32,0],[x+.32,0],[x+.32,.22],[x+.14,h],[x-.14,h],[x-.32,.22]].reverse();
 const vGuide=off=>[[off-G.w/2,0],[off+G.w/2,0],[off+G.w/2,G.h],[off-G.w/2,G.h]].reverse();
 function drawViaductSpan(S,M,capL,capR){
  const f0=M,f1=M.clone().multiply(T.frame(0,0,S.len,0,0,0)),fr=[f0,f1],hw=S.width/2;
  const lLim=-hw+(S.crack&&S.crack.side<0?S.crack.depth:0),rLim=hw-(S.crack&&S.crack.side>0?S.crack.depth:0);
  lvB.sweep('concrete',vDeckProf(S.width,V.deck,S.crack),fr,dk(col.concrete,S.state==='cracked'?.84:.94),{u0:S.s0,caps:capL||capR});
  [[-1,0],[1,1]].forEach(e=>{if(!S.barriers[e[1]])return;const bx=e[0]*(hw-.34);if(bx<lLim+.3||bx>rLim-.3)return;
   lvB.sweep('concrete',vParapet(bx,.85),fr,col.concDark,{u0:S.s0,caps:true});});
  LN.tracks.forEach(tr=>{if(tr.off-G.w/2<lLim+.2||tr.off+G.w/2>rLim-.2)return;
   lvB.sweep('concrete',vGuide(tr.off),fr,dk(col.concrete,.88),{u0:S.s0,caps:capL||capR});});}
 const downS=S=>!S||S.state==='collapsed'||S.state==='gone';
 V.spans.forEach((S,i)=>{
  if(S.state==='gone')return;
  if(S.state==='collapsed'&&S.fall){const F=S.fall,m=T.frame(F.x,F.y,F.z,F.yaw,F.pitch,F.roll).multiply(T.frame(0,0,-S.len/2,0,0,0));
   drawViaductSpan(S,m,true,true);return;}
  const fr=T.frame(S.x0,S.y0,S.z0,S.yaw,S.pitch,0);
  drawViaductSpan(S,fr,downS(V.spans[i-1]),downS(V.spans[i+1]));});
 V.piers.forEach(p=>{
  if(p.state==='none')return;
  if(p.state==='fill'){const g0=terrainH(p.x,p.z),ah=Math.max(1.2,p.yTop+.2-(g0-.45));
   lvB.box('concrete',T.frame(p.x,g0-.45,p.z,p.yaw,0,0),V.width*.92,ah,3.6,col.concDark);return;}
  const capH=.95,cols=[-11.5,11.5];
  cols.forEach((lat,ci)=>{const q=L.atS(p.s,lat),gy=terrainH(q[0],q[1]),topY=p.state==='stub'?gy+p.stub:p.yTop-capH+.12;
   const ch=Math.max(1.2,topY-(gy-.48));
   lvB.box('concrete',T.frame(q[0],gy-.48,q[1],p.yaw,0,0),3.4,ch,2.8,col.concrete,{noBottom:true});
   if(p.state==='stub'){for(let k=0;k<4;k++){const dx=(k%2?.85:-.85),dz=(k<2?.65:-.65);
    const rx=q[0]+Math.cos(p.yaw)*dx+Math.sin(p.yaw)*dz,rz=q[1]-Math.sin(p.yaw)*dx+Math.cos(p.yaw)*dz;
    lvB.cyl('rust',[rx,topY-.28,rz],[rx+(ci?-.18:.22),topY+1.05+.3*(k%3),rz+(k<2?.18:-.2)],.03,col.rust,5);}}});
  if(p.state!=='stub'){lvB.box('concrete',T.frame(p.x,p.yTop-capH,p.z,p.yaw,0,0),V.width*.9,capH,3.2,col.concDark);}});
 const lvGrp=lvB.finish('line viaduct',{chunk:0});lvGrp.name='ruin:line-viaduct';root.add(lvGrp);

 /* ---- 3. THE PARALLEL ANCIENT HIGHWAY LAKE VIADUCT: KTRANSIT.draw.highway, watched by KRUINS */
 const hwGrp=T.draw.highway(L.highway,{furn});hwGrp.name='ruin:highway-viaduct';root.add(hwGrp);

 /* ---- 4. STATION 5 CONCOURSE & HEADHOUSE (s 1368..1512): watched by KRUINS */
 const stB=T.builder(),ST=L.station5,wCol=-20.2,eCol=15.8,spanW=eCol-wCol,midLat=(wCol+eCol)/2,colH=10.4;
 /* continuous colonnade plinths & cornice beams along the 6 bays so the standing frame is one connected structure */
 [-1,1].forEach(sd=>{const lat=sd<0?wCol:eCol,a=L.atS(ST.s0,lat),b=L.atS(ST.s1,lat),F=[T.frame(a[0],ST.y,a[1],ST.yaw,0,0),T.frame(b[0],ST.y,b[1],ST.yaw,0,0)];
  const gMin=Math.min(terrainH(a[0],a[1]),terrainH(b[0],b[1]),terrainH((a[0]+b[0])/2,(a[1]+b[1])/2)),drop=Math.max(.45,ST.y-gMin+.45);
  stB.sweep('concrete',[[-1.3,-drop],[1.3,-drop],[1.3,.35],[-1.3,.35]],F,col.concDark,{caps:true});
  const a2=L.atS(ST.s0+24,lat),F2=[T.frame(a2[0],ST.y,a2[1],ST.yaw,0,0),T.frame(b[0],ST.y,b[1],ST.yaw,0,0)];
  stB.sweep('concrete',[[-.75,colH-.65],[.75,colH-.65],[.75,colH+.25],[-.75,colH+.25]],F2,col.concrete,{caps:true});});
 for(let j=0;j<=ST.bays.length;j++){
  const s=ST.s0+j*24,ruinedEnd=j===0;
  [-1,1].forEach(sd=>{const lat=sd<0?wCol:eCol,q=L.atS(s,lat),gy=terrainH(q[0],q[1]),h=(ruinedEnd?(sd<0?6.8:8.1):colH)+(ST.y-gy)+.45;
   stB.box('concrete',T.frame(q[0],gy-.45,q[1],ST.yaw,0,0),1.9,h,1.9,col.concrete);
   if(ruinedEnd){for(let k=0;k<3;k++)stB.cyl('rust',[q[0]+(k-1)*.35,gy-.45+h-.25,q[1]],[q[0]+(k-1)*.42,gy-.45+h+.85,q[1]+.15],.028,col.rust,5);}});
  if(!ruinedEnd){const pm=L.atS(s,midLat);
   stB.box('concrete',T.frame(pm[0],ST.y+colH-.1,pm[1],ST.yaw,0,0),spanW+2.2,.95,1.5,col.concDark);
   stB.box('white',T.frame(pm[0],ST.y+colH+.8,pm[1],ST.yaw,0,0),spanW*.64,1.15,1.2,col.white);}}
 ST.bays.forEach(bay=>{
  if(bay.state==='ruined')return;
  const a=L.atS(bay.s0+.4,midLat),b=L.atS(bay.s1-.4,midLat),fr=[T.frame(a[0],ST.y,a[1],ST.yaw,0,0),T.frame(b[0],ST.y,b[1],ST.yaw,0,0)];
  const hw=spanW/2+1.2;
  if(bay.state==='kept'){
   stB.sweep('concrete',[[-hw,colH+.1],[-hw*.58,colH+1.85],[hw*.58,colH+1.85],[hw,colH+.1],[hw,colH-.35],[hw*.56,colH+1.3],[-hw*.56,colH+1.3],[-hw,colH-.35]],fr,col.white,{caps:true});
   stB.sweep('steel',[[-4.2,colH+1.8],[4.2,colH+1.8],[4.2,colH+2.45],[-4.2,colH+2.45]],fr,col.bronze,{caps:true});
   /* Loj Faiv's warm amber station lanterns hung under the kept concourse */
   [-4.5,4.5].forEach(lx=>{const lp=L.atS((bay.s0+bay.s1)/2,lx);
    stB.cyl('steel',[lp[0],ST.y+colH+1.25,lp[1]],[lp[0],ST.y+colH-.5,lp[1]],.04,col.steelDark,5);
    stB.box('glow',T.frame(lp[0],ST.y+colH-.78,lp[1],ST.yaw,0,0),.28,.32,.28,col.amber);});}
  else{
   /* cracked transitional bay: west awning slab still clings to the cornice; east side open to the sky */
   stB.sweep('concrete',[[-hw,colH+.1],[-hw*.32,colH+1.35],[-hw*.32,colH+.9],[-hw,colH-.35]],fr,dk(col.white,.88),{caps:true});}});
 /* South concourse portal arch & bronze Station 5 frieze */
 {const ps=L.atS(ST.s1,midLat);
  stB.box('steel',T.frame(ps[0],ST.y+colH+1.9,ps[1],ST.yaw,0,0),18,1.1,.45,col.bronze);
  for(let k=0;k<5;k++){const kp=L.atS(ST.s1+.26,midLat+(k-2)*1.6);stB.box('white',T.frame(kp[0],ST.y+colH+2.1,kp[1],ST.yaw,0,0),.32,.68,.12,col.white);}}
 /* Seated fallen canopy slabs at the lakeward ruined bay */
 ST.wrecks.forEach(w=>{stB.box('concrete',T.frame(w.x,w.y,w.z,w.yaw,w.pitch,w.roll),w.w,w.h,w.d,dk(col.white,.82));});
 const stGrp=stB.finish('station 5 headhouse',{chunk:0});stGrp.name='ruin:station-5';root.add(stGrp);

 /* ---- 5. THE NULAB-CHIMES TUNNEL PORTAL HEADWALL (s 1860) & VENTILATION SHAFT HEAD (s 2020) */
 const ptB=T.builder(),PT=L.portal,SEC=LN.sec,prof=T.lineProfile(SEC,24);
 {const f0=T.frame(PT.x,PT.y,PT.z,PT.yaw,0,0),f1=T.frame(PT.x,PT.y,PT.z,PT.yaw,0,0).multiply(T.frame(0,0,2.2,0,0,0));
  const hw=PT.w/2,topH=PT.h;
  /* triangulated concrete headwall face & 2.2 m collar round the gallery arch */
  const outer=[[-hw,-1.2],[hw,-1.2],[hw,topH],[-hw,topH]].map(p=>new THREE.Vector2(p[0],p[1]));
  const hole=prof.map(p=>new THREE.Vector2(p[0],p[1])).reverse(),all=outer.concat(hole);
  const P3=(m,lx,ly)=>{const v=new THREE.Vector3(lx,ly,0).applyMatrix4(m);return [v.x,v.y,v.z];};
  try{const tris=THREE.ShapeUtils.triangulateShape(outer,[hole]);
   tris.forEach(t=>{ptB.tri('concrete',P3(f0,all[t[0]].x,all[t[0]].y),P3(f0,all[t[2]].x,all[t[2]].y),P3(f0,all[t[1]].x,all[t[1]].y),col.concrete);
    ptB.tri('concrete',P3(f1,all[t[0]].x,all[t[0]].y),P3(f1,all[t[1]].x,all[t[1]].y),P3(f1,all[t[2]].x,all[t[2]].y),col.concDark);});}catch(e){reportErr('portal headwall: '+e.message);}
  T.draw.lining(ptB,prof.map(p=>[p[0],p[1]]),[f0,f1],col.concDark,{fam:'concrete'});
  /* parapet coping, battered wing walls, bronze portal lintel, and Tungang signal lamps (green on kept t2/t3, red on blocked t1/t4) */
  ptB.box('concrete',f0.clone().multiply(T.frame((SEC.x0+SEC.x1)/2,topH,1.1,0,0,0)),PT.w+1.6,1.15,2.8,col.concDark);
  [-1,1].forEach(sd=>{const wx=sd<0?SEC.x0-3.2:SEC.x1+3.2,wp=L.atS(PT.s-7,wx),wm=T.frame(wp[0],PT.y-1.2,wp[1],PT.yaw,0,0);
   ptB.box('concrete',wm,2.2,topH*.78,14,col.concDark);});
  ptB.box('steel',f0.clone().multiply(T.frame((SEC.x0+SEC.x1)/2,SEC.crown+.85,-.18,0,0,0)),12,.85,.4,col.bronze);
  LN.tracks.forEach(tr=>{const kept=tr.id==='t2'||tr.id==='t3',lm=f0.clone().multiply(T.frame(tr.off,5.4,-.28,0,0,0));
   ptB.box('steel',lm,.36,.44,.32,col.steelDark);
   ptB.box('glow',lm.clone().multiply(T.frame(0,0,-.12,0,0,0)),.22,.22,.12,kept?col.green:col.red);});}
 /* Ventilation & hoist shaft head on the rise above s = 2020 */
 {const sh=L.shaftHead,gy=sh.y;
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2,b=(k+1)/8*Math.PI*2,rm=sh.r+.45;
   const x0=sh.x+Math.cos(a)*rm,z0=sh.z+Math.sin(a)*rm,x1=sh.x+Math.cos(b)*rm,z1=sh.z+Math.sin(b)*rm;
   ptB.box('concrete',T.frame((x0+x1)/2,gy-3.2,(z0+z1)/2,Math.atan2(x1-x0,z1-z0),0,0),.75,4.1,Math.hypot(x1-x0,z1-z0)+.2,col.concDark);}
  [[-2.4,-2.2],[2.4,-2.2],[-2.4,2.2],[2.4,2.2]].forEach(d=>{
   ptB.cyl('steel',[sh.x+d[0],gy-.3,sh.z+d[1]],[sh.x+d[0]*.12,gy+5.2,sh.z+d[1]*.18],.14,col.rust,6);});
  ptB.box('steel',T.frame(sh.x,gy+5.0,sh.z,PT.yaw,0,0),1.3,.55,2.6,col.steelDark);
  ptB.cyl('steel',[sh.x,gy-2.8,sh.z],[sh.x,gy+5.0,sh.z],.035,col.cable,5);
  const hx=sh.x+7.5,hz=sh.z+1.5,hg=terrainH(hx,hz);
  ptB.box('rubble',T.frame(hx,hg-.4,hz,PT.yaw,0,0),5.2,2.8,6.2,col.rubble);
  ptB.box('corrugated',T.frame(hx,hg+2.4,hz,PT.yaw,0,.06),5.8,.28,6.8,col.rust);
  ptB.cyl('steel',[sh.x-3.8,terrainH(sh.x-3.8,sh.z-3.2)-.3,sh.z-3.2],[sh.x-3.8,gy+3.1,sh.z-3.2],.07,col.steelDark,5);
  ptB.box('paint',T.frame(sh.x-3.8,gy+3.05,sh.z-3.2,0,0,0),.58,.24,.58,col.paintDark);
  ptB.box('glow',T.frame(sh.x-3.8,gy+2.85,sh.z-3.2,0,0,0),.24,.22,.24,col.white);}
 const ptGrp=ptB.finish('portal and shaft',{chunk:0});ptGrp.name='line:portal-and-shaft';root.add(ptGrp);

 /* ---- 6. LOJ FAIV (~152 Tungangs): KCAVERN rock walls + TG.tg.draw carved rooms + TG.fg.draw rim sheds */
 const lojStats={sites:L.loj.sites.length,drawn:0,lights:0,rimDrawn:0,cavernTris:0,cavernMs:0};
 if(typeof TG!=='undefined'&&TG.tg&&typeof KCAVERN!=='undefined'&&KCAVERN.drawRock){
  const C=KCAVERN.create({ground:()=>-200,cell:.5,chunk:16,seed:L.seed+9,walk:null,minRock:.6});
  /* each carved site gets its own rock mass, and plain displaced rift-fill rock blocks bridge the wall between doorways */
  const wallB=T.builder(),rCol=T.rgb(0x82786c),cCol=T.rgb(0x6e6858);
  for(const s of L.loj.sites){
   const B=TG.tg.BOX[s.key];if(!B)continue;
   const hw=B.w/2+.7,dep=B.d+1.8,c=Math.cos(s.ry),sn=Math.sin(s.ry);
   const wp=(lx,lz)=>[+(s.x+lx*c+lz*sn).toFixed(3),+(s.z-lx*sn+lz*c).toFixed(3)];
   C.mass({id:s.id+':rock',poly:[wp(-hw,-dep),wp(hw,-dep),wp(hw,.05),wp(-hw,.05)],y0:s.y-2.4,y1:Math.max(s.topG+.7,s.y+B.h+1.6)});}
  TG.tg.carve(C,L.loj.sites);
  const ct0=performance.now();C.build();lojStats.cavernMs=Math.round(performance.now()-ct0);
  const rubM=T.mats().rubble;
  const rMat=new THREE.MeshStandardMaterial({vertexColors:true,map:rubM.map||null,normalMap:rubM.normalMap||null,roughnessMap:rubM.roughnessMap||null,roughness:.95,metalness:0,side:THREE.DoubleSide});
  if(KCAVERN.cutLayer){KCAVERN.cutLayer(rMat);KCAVERN.cut.above(2.2);
   const cm=L.atS((L.loj.s0+L.loj.s1)/2,0);KCAVERN.cut.boxes([{x:cm[0],z:cm[1],hw:65,hd:160,ry:L.yaw,floor:298}]);}
  const R=KCAVERN.drawRock(C,{THREE,material:rMat,ground:'drop',
   color:oc=>{const k=.38+.62*oc;return [rCol[0]*k,rCol[1]*k,rCol[2]*k];},
   attrs:KCAVERN.cutWeight?['aKCut']:[],weight:KCAVERN.cutWeight?KCAVERN.cutWeight(C):null,
   label:'Loj Faiv: the cutting\'s carved rift-fill rock (KCAVERN, from the Tungang void plans)',name:'nulab:loj-rock'});
  R.group.children.forEach(m=>{const gp=m.geometry.attributes.position,gn=m.geometry.attributes.normal,uv=new Float32Array(gp.count*2);
   for(let i=0;i<gp.count;i++){const x=gp.getX(i),y=gp.getY(i),z=gp.getZ(i),nx=Math.abs(gn.getX(i)),ny=Math.abs(gn.getY(i));
    uv[i*2]=nx>.5?z:x;uv[i*2+1]=ny>.5?z:y;}
   m.geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
   m.receiveShadow=true;m.castShadow=true;m.userData.probeSkip=true;});
  root.add(R.group);lojStats.cavernTris=R.tris;
  if(typeof cutSet==='function'){const nlCut0=cutSet;cutSet=function(on){if(typeof KCAVERN!=='undefined'&&KCAVERN.cut)KCAVERN.cut.set(on);return nlCut0(on);};}
  /* continuous rift-fill rock benches filling the intervals between carved sites along both walls of the cutting */
  [-1,1].forEach(sd=>{
   const faceLat=sd<0?L.loj.wFace-.15:L.loj.eFace+.15,backLat=sd<0?faceLat-17.5:faceLat+17.5;
   const spans=L.loj.sites.filter(s=>s.side===sd).map(s=>{const w=(TG.tg.BOX[s.key]||{w:4}).w/2+.65;return [s.s-w,s.s+w];}).sort((a,b)=>a[0]-b[0]);
   const addRun=(sa,sb)=>{if(sb-sa<.3)return;const n=Math.max(1,Math.ceil((sb-sa)/12));
    for(let k=0;k<n;k++){const u0=sa+(sb-sa)*k/n,u1=sa+(sb-sa)*(k+1)/n,um=(u0+u1)/2;
     const pm=L.atS(um,(faceLat+backLat)/2),rp=L.atS(um,sd<0?L.loj.wFace-24:L.loj.eFace+24),y0=LN.floorAt(um)-1.8,y1=L.terrainAt(rp[0],rp[1])+.55;
     wallB.box('rubble',T.frame(pm[0],y0,pm[1],L.yaw,0,0),Math.abs(backLat-faceLat),Math.max(4,y1-y0),u1-u0+.15,rCol);
     wallB.box('soil',T.frame(pm[0],y1-.25,pm[1],L.yaw,0,0),Math.abs(backLat-faceLat)+.4,.45,u1-u0+.2,cCol);}};
   let cur=L.loj.s0-4;for(const sp of spans){addRun(cur,sp[0]);cur=Math.max(cur,sp[1]);}addRun(cur,L.loj.s1+2);});
  const benchGrp=wallB.finish('loj rock benches',{chunk:0});
  benchGrp.traverse(m=>{if(m.isMesh){m.userData.probeSkip=true;m.userData.inspectLabel='The cutting\'s rift-fill rock bench';}});
  root.add(benchGrp);

  /* draw Loj Faiv's carved rooms & riveted plate fronts */
  const D=TG.tg.draw(L.loj.sites,{scene:root,seed:L.seed+19,state:'kept',label:'Loj Faiv (the 5th station\'s Tungang hold)'});
  D.group.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});
  lojStats.drawn=D.recs.length;lojStats.lights=(D.lights||[]).length;

  /* register each carved Loj Faiv room in KTAGS.page (as Lightwall registers its merged TG sites) + one REG volume for the hold */
  const KT=KTAGS.page||(KTAGS.page=KTAGS.create({build:'nulab'}));
  for(const s of L.loj.sites){
   const B=TG.tg.BOX[s.key],def=TG.DEFS&&TG.DEFS[s.key];if(!B)continue;
   KT.add({'class':'building',kind:s.key,key:s.key,name:s.name||('Loj Faiv: '+(def&&def.name||s.key)),at:[s.x,s.y,s.z],ry:s.ry,size:[B.w,B.d,B.h],
    tags:Object.assign({},def&&def.tags||{types:['dwelling-single'],wealth:'poor'},{culture:'tungang',quarter:'Loj Faiv'}),
    note:'carved from its Tungang void plan into the Chimes approach cutting',frag:'90q-nl-line.js'});}
  {const lc=L.atS((L.loj.s0+L.loj.s1)/2,0);
   REG.push({name:'Loj Faiv — the 5th station\'s Tungang hold (~150 Tungangs in the Chimes cutting)',key:'nl_loj_faiv',type:'nl_loj_faiv',
    cls:'building',x:lc[0],y:LN.floorAt((L.loj.s0+L.loj.s1)/2)-1,z:lc[1],r:175,h:18,
    tags:{culture:'tungang',types:['dwelling-multi','civic'],wealth:'middle',quarter:'Loj Faiv'}});}

  /* draw the three surface porter/salvage sheds on the east rim (TG.fg.draw) */
  if(TG.fg&&L.loj.rimSheds.length){
   const fgOut=TG.fg.draw({records:L.loj.rimSheds,id:'loj-faiv-rim',focus:'quarry',census:{pop:24}},
    {scene:root,ground:terrainH,seed:L.seed+41,state:'kept',label:'Loj Faiv: the rim salvage and porter sheds'});
   fgOut.group.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});
   lojStats.rimDrawn=fgOut.recs.length;
   for(const r of L.loj.rimSheds){const def=TG.DEFS&&TG.DEFS[r.key];
    KT.add({'class':'building',kind:r.key,key:r.key,name:r.name,at:[r.x,r.y,r.z],ry:r.ry,size:[r.w,r.d,r.h],
     tags:Object.assign({},def&&def.tags||{types:['industry'],wealth:'poor'},{culture:'fellgang',quarter:'Loj Faiv'}),
     frag:'90q-nl-line.js'});}
   {const rc=L.loj.rimSheds[0];
    REG.push({name:'Loj Faiv — rim salvage and Travellers\' porter sheds',key:'nl_loj_rim',type:'nl_loj_rim',
     cls:'building',x:rc.x,y:rc.y-1,z:rc.z,r:48,h:8,
     tags:{culture:'fellgang',types:['industry'],wealth:'poor',quarter:'Loj Faiv'}});}}}

 /* ---- 7. REGISTER STATION 5, VIADUCTS, PORTAL & SHAFT IN REG + WATCH RUINS WITH KRUINS */
 REG.push({name:ST.name,key:'nl_station_5',type:'nl_station_5',cls:'infrastructure',x:ST.x,y:ST.y-1,z:ST.z,r:78,h:ST.h+2,
  tags:{culture:'ancient',types:['infrastructure','civic'],state:'reclaimed',landmark:true}});
 REG.push({name:PT.name,key:'nl_chimes_portal',type:'nl_chimes_portal',cls:'infrastructure',x:PT.x,y:PT.y-1,z:PT.z,r:32,h:PT.h+2,
  tags:{culture:'ancient',types:['infrastructure'],state:'reclaimed',landmark:true}});
 REG.push({name:L.shaftHead.name,key:'nl_chimes_shaft',type:'nl_chimes_shaft',cls:'infrastructure',x:L.shaftHead.x,y:L.shaftHead.y-3.2,z:L.shaftHead.z,r:12,h:9,
  tags:{culture:'tungang',types:['infrastructure','industry']}});
 {const vm=L.atS(720,0);REG.push({name:'The lake viaduct to Ledge\'s lifts (fallen in the deep middle; pier stubs in the shallows)',
  key:'nl_lake_viaduct',type:'nl_lake_viaduct',cls:'infrastructure',x:vm[0],y:NL_GROUND.LAKE-10,z:vm[1],r:680,h:24,
  tags:{culture:'ancient',types:['infrastructure'],state:'ruined'}});}
 {const hm=L.atS(740,44);REG.push({name:'The Ancient lake highway viaduct (beside the Rift line)',
  key:'nl_lake_highway',type:'nl_lake_highway',cls:'infrastructure',x:hm[0],y:NL_GROUND.LAKE-10,z:hm[1],r:680,h:24,
  tags:{culture:'ancient',types:['infrastructure'],state:'ruined'}});}

 /* count triangles into TSTAT so verify.py's per-type budget sees the Line quarter */
 let lineTris=0;
 root.traverse(m=>{if(m.isMesh&&m.geometry){const g=m.geometry,n=(g.index?g.index.count:g.attributes.position.count)/3*(m.isInstancedMesh?m.count:1);lineTris+=n;}});
 TSTAT.cur='nl_line_quarter/0';{const tc=tcur();if(tc){tc.meshes+=1;tc.tris+=Math.round(lineTris);}}TSTAT.cur=null;

 /* KRUINS.watch on every ruined structure: both lake viaducts and Station 5's headhouse (skipping thin lane-paint decals & scattered rubble) */
 const skipRuin=m=>/\.rubble$|^rubble$|tr\.line$/.test((m.name||'')+' '+(m.material&&m.material.name||''));
 NL_LINE_RUINS.push(lvGrp,hwGrp,stGrp);
 if(typeof KRUINS!=='undefined'&&KRUINS.watch){
  KRUINS.watch(lvGrp,{name:'The Line lake viaduct (station 4 to 5)',ground:terrainH,skip:skipRuin});
  KRUINS.watch(hwGrp,{name:'The Ancient highway lake viaduct',ground:terrainH,skip:skipRuin});
  KRUINS.watch(stGrp,{name:'Station 5 headhouse and concourse',ground:terrainH,skip:skipRuin});}

 /* keep LOD_OPTIONS.skipUnder from merging/replacing KRUINS-watched meshes */
 if(typeof NL_LOD_SKIP!=='undefined')NL_LOD_SKIP.push(root);

 globalThis._registered=REG.length;
 window._nlLine={ok:true,ms:Math.round(performance.now()-t0),tris:Math.round(lineTris),
  viaductSpans:V.spans.length,viaductStubs:V.piers.filter(p=>p.state==='stub'||p.state==='bare').length,
  viaductFallen:V.spans.filter(s=>s.state==='collapsed').length,
  hwSpans:L.highway.spans.length,hwFallen:L.highway.spans.filter(s=>s.state==='collapsed').length,
  station5Bays:ST.bays.length,portalS:PT.s,lojPeople:L.loj.people,loj:lojStats,
  tgErrors:(typeof TG!=='undefined'&&TG.errors?TG.errors.slice(0,5):[])};
 if(window._nulab)window._nulab.line=window._nlLine;
})();
