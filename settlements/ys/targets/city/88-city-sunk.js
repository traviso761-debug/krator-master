// ================================================================= YS CITY — the sunk ruins of the drowned grid (Travis, Oct 5 2026), as records
// "Beyond the three civic ruins in the east polygon, the drowned grid between the stumps wants more fully-ruined, un-podded
// Ancient kit buildings (the hospital, the hotel, the bunker, the smaller civic pieces) standing on the bed with their
// lower floors under water." Runs after the bridge graph (88-city-spans), so a ruin keeps out of every span's way rather
// than the spans routing round it, and appends to PLACE.ruins, which the draw pass (88b) builds through ysPlaceRuin.
// THE TEST, per type and candidate: the type's standing mass (YS_RUIN_TYPES[].core, 64b) grown 6 m clear of everything
// built but the drowned grid's water lines, of every span's corridor and of the stacks; its whole footprint (the kit's
// aprons, berms and forecourts, lying on the bed) clear of the other ruins and of the hosts' bodies (their caps at 80 %:
// a cap still measures the old podium), none of it where ships work (a harbour's basin, the aquaculture pens, the river
// mouth, the headland's batteries, the harbour approach) nor in the Amphitriton's block, every corner in the water and
// the middle 6 m deep or more; the bed is the lowest point under it, so nothing floats.
// Candidates: a 16 m lattice of the city grid over the other drowned blocks (not the east shallows' polygon, which has
// its own pass), in the stream's order; each type tries every candidate at a grid bearing, then turned a
// quarter. The list is Travis's three first (the Cloister, the Terraces, the Redoubt, whole where a gap takes them), then
// the kit's smaller civic alternates (the Linked Blocks, the Bastion Drum, the Watch Cup), more than once.
(function sunkPass(){if(typeof YS_RUIN_TYPES==='undefined'||!PLACE.ruins)return;const st=ysPlStream('sunk ruins',{i:83,j:0});
 const TY=k=>YS_RUIN_TYPES.find(T=>T.key===k&&T.core);
 const want=['ruinBunker','ruinHotel','ruinHospital','ruinLinked','ruinDrum','ruinCup','ruinGovernment','ruinDrum','ruinCup','ruinLinked','ruinCup','ruinCup','ruinCup'];
 // the span corridors: each bridge, walkway, pontoon and the drawbridge as a strip 20 m wide between its ends' nodes
 const hostAt=n=>PLACE.hosts.find(h=>h.n===n);const endXZ=e=>e.host?hostAt(e.host):e;const corr=[];
 for(const s of SPANS.list){const A=s.kind==='bridge'?endXZ(s.a):s.A,B=s.kind==='bridge'?endXZ(s.b):s.B;if(!A||!B||A.x==null||B.x==null)continue;corr.push(ysPlStrip([A.x,A.z],[B.x,B.z],20,'span'));}
 const bodies=PLACE.hosts.filter(h=>!h.land).map(h=>ysPlBox(h.x,h.z,h.cap.hw*.8,h.cap.hw*.8,PL_RY,'host body'));
 const inEast=(x,z)=>ysPlInPoly(YS_RUINS_POLY,x,z);
 const nine=B=>{const S=[];for(const a of [-1,0,1])for(const c of [-1,0,1])S.push([B.cx+B.ux[0]*a*B.hw+B.uz[0]*c*B.hd,B.cz+B.ux[1]*a*B.hw+B.uz[1]*c*B.hd]);return S;};
 const grid=u=>!/^(water|military_harbour|civilian_harbour|fishing_docks|aquaculture|river_mouth|headland_military|amphitriton)$/.test(u||'');   /* where ships work, and the Amphitriton's own water */
 const wet=LAYOUT.blocks.filter(b=>(b.kind==='canal'||b.kind==='open')&&grid(b.use)),cands=[];
 for(const b of wet)for(let u=-96;u<=96;u+=16)for(let v=-96;v<=96;v+=16){const x=b.x+PL_U[0]*u+PL_V[0]*v,z=b.z+PL_U[1]*u+PL_V[1]*v;if(inEast(x,z)||terrainH(x,z)>-6)continue;cands.push([x,z,st.next()]);}
 cands.sort((p,q)=>p[2]-q[2]);
 const full=PLACE.ruins.map(r=>r.box);const at=(x,z,ry,cx,cz)=>[x+cx*Math.cos(ry)+cz*Math.sin(ry),z-cx*Math.sin(ry)+cz*Math.cos(ry)];   /* the builder's frame turned ry */
 let n=0;
 for(const key of want){const T=TY(key);if(!T){ysPlRefuse('sunk ruin: no type '+key);continue;}const C=T.core;const r0=st.int(0,3)*Math.PI/2;let got=null;
  for(const [x,z] of cands){for(const ry of [PL_RY+r0,PL_RY+r0+Math.PI/2]){
    const cm=at(x,z,ry,C.cx||0,C.cz||0),Bc=ysPlBox(cm[0],cm[1],C.w/2+6,C.d/2+6,ry,'ruin '+key);if(ysPlClash(Bc,/^street/)||corr.some(S=>ysPlHit(Bc,S)))continue;
    const fm=at(x,z,ry,T.cx||0,T.cz||0),Bf=ysPlBox(fm[0],fm[1],T.w/2,T.d/2,ry,'ruin '+key+' site');if(full.some(F=>ysPlHit(Bf,F))||bodies.some(F=>ysPlHit(Bf,F)))continue;
    if(CITY.STACKS.some(s=>ysStackLocal(s,cm[0],cm[1]).d<s.r*1.25+Math.max(C.w,C.d)/2+10))continue;
    if(nine(Bf).some(p=>{const g=ysBlockIJ(p[0],p[1]),b=ysBlock(Math.round(g[0]),Math.round(g[1]));return b&&!grid(b.use);}))continue;   /* keep out of the harbours' water */
    const poly=ysPlBoxPoly(Bf),S=poly.concat([fm,[(poly[0][0]+fm[0])/2,(poly[0][1]+fm[1])/2],[(poly[2][0]+fm[0])/2,(poly[2][1]+fm[1])/2]]).map(p=>terrainH(p[0],p[1]));
    if(terrainH(fm[0],fm[1])>-6||S.some(h=>h>-2))continue;
    ysPlTake(Bc);full.push(Bf);const same=PLACE.ruins.filter(r=>r.key===key).length;
    got={key,builder:T.builder,name:T.name.replace(/^the /,'The ')+(same?' ('+(same+1)+')':'')+' in the drowned grid',x,z,ry:+ry.toFixed(3),d:4,sink:+(Math.min(...S)-.5).toFixed(2),box:Bc,site:Bf,w:T.w,dd:T.d,h:T.h,grid:true};break;}
   if(got)break;}
  if(got){PLACE.ruins.push(got);n++;}else ysPlRefuse('sunk ruin: '+key);}
 PLACE.sunk=n;})();
