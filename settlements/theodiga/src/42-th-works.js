/* ================================================================= THEODIGA TODAY: the works below the rim (records; draws nothing)
   [G data] T-town-4 (PLAN.md): where the two roads down the east wall lead, in the dam's frame.
     THE SALVAGE YARDS  on the canyon floor at the Salvage Road's foot: a yard track west from the foot, the scrap set's stores,
                        sheds and hull huts along both sides of it (their fronts on the track), and the salvage itself between
                        and behind them, heaps of the Dome's fallen white panels (core/terrain KRUBBLE, when it is on the page)
     THE SILT FIELDS    on the silt the drawn-down lake left above its water, upstream of the dam's east half: strips of grain,
                        pulse and a root crop (kits/crops, as the town's farms), field huts at the Silt Road's foot
   Every draw is KRAND-hashed by the works' seed and the slot's index (never by how many draws came before it). Workplaces: their
   people live in the town above (src/40-th-town.js counts them).

   TH_WORKS.make(o) -> {track, lots, heaps, fields, huts, bore}
     o.bore           {x, z, back}: the bore to Stair's headwall front, axis and back (optional; bore is null without it)
     o.floor(x, z)    the canyon floor's height; o.floorZone {x1, z0, z1}: where the floor is drawn (|x| < x1, z0..z1)
     o.river          {x(z), w(z)}: the river's line and half-width on the floor
     o.bed(x, z)      the silt's height upstream; o.WL the lake's level; o.face(x) the dam's upstream face (z) at x
     o.dome           {x, z, r}: the Dome's piers' circle, kept clear
     o.salvageFoot, o.siltFoot   {x, z}: where each road reaches the bottom (TH_DESCENT)
     o.dims(key)      the kit's boxes {w, d}; o.seed (2207)
   A lot is {id, key, v, x, z, ry, w, d, ground:'floor'|'bed', work}; a heap is a KRUBBLE heap record (or its parameters, without
   KRUBBLE); a field is {id, corners:[[x, z] x 4], crop, bucket, cropName}. */
var TH_WORKS=(function(){
 /* what a strip grows (o.crops: kits/crops' CROPS, which the page keeps sealed in THCITY; the global CROPS in node) */
 const ROT=['grain','pulse','tuber'];
 const crop=(CR,VALE,i,seed)=>{const b=ROT[i%3];if(!CR)return {crop:b,bucket:b};
  const r=CR.pick(VALE,b,{seed:seed,salt:i});return r?{crop:r.crop.id,bucket:b,cropName:r.crop.name}:{crop:b,bucket:b};};
 const U=(seed,i,salt)=>KRAND.unit(KRAND.hash(seed,i,salt));
 /* a box's corners (x, z) at its pose, grown by m */
 const corners=(x,z,w,d,ry,m)=>{const c=Math.cos(ry),s=Math.sin(ry),hw=w/2+(m||0),hd=d/2+(m||0);
  return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[x+a*hw*c+b*hd*s,z-a*hw*s+b*hd*c]);};
 const YARD=['xa_scrap_store','xa_scrap_shacks','xa_scrap_hull','xa_scrap_store','xa_scrap_tank_house','xa_scrap_shacks','xa_scrap_hull'];
 function make(o){
  const seed=o.seed==null?2207:o.seed,FZ=o.floorZone,R=o.river,lots=[],heaps=[],fields=[],huts=[];
  const CR=o.crops||(typeof CROPS!=='undefined'?CROPS:null),VALE=CR?CR.forBiome('xanadu').filter(r=>r.zone==='vale'&&(r.how==='rain'||r.how==='irrigated')):null;
  const onFloor=(p,m)=>Math.abs(p[0])<FZ.x1-(m||0)&&p[1]>FZ.z0+(m||0)&&p[1]<FZ.z1-(m||0);
  const offRiver=(p,m)=>Math.abs(p[0]-R.x(p[1]))>R.w(p[1])+(m||0);
  const flat=(pts,f,lim)=>{const h=pts.map(p=>f(p[0],p[1]));return Math.max(...h)-Math.min(...h)<=lim;};
  const clash=(x,z,r)=>lots.some(L=>Math.hypot(L.x-x,L.z-z)<r+Math.hypot(L.w,L.d)/2+3)||heaps.some(H=>Math.hypot(H.x-x,H.z-z)<r+Math.max(H.rx,H.rz)+3);
  /* THE YARDS: the track from the road's foot west, 6 m wide, as far as the floor and the river allow */
  const F=o.salvageFoot,tz=F.z;let tx1=F.x-6;
  while(tx1>-FZ.x1+20&&offRiver([tx1-10,tz],14))tx1-=10;
  const track={a:[F.x,tz],b:[tx1,tz],w:6};
  let n=0;
  for(const side of [-1,1]){let x=F.x-18;
   for(let k=0;k<12&&x>tx1+8;k++){const key=YARD[Math.floor(U(seed,k,side>0?11:12)*YARD.length)],D=o.dims(key);if(!D){x-=12;continue;}
    const ry=side<0?0:Math.PI,z=tz+side*(3+2+D.d/2),cx=x-D.w/2,C=corners(cx,z,D.w,D.d,ry,1);
    if(C.every(p=>onFloor(p,2)&&offRiver(p,6))&&flat(C,o.floor,2.5)&&!clash(cx,z,Math.hypot(D.w,D.d)/2)){
     lots.push({id:'th.works.yard.'+(n++),key,v:Math.floor(U(seed,k,side>0?13:14)*3),x:cx,z,ry,w:D.w,d:D.d,ground:'floor',work:'salvage'});}
    x-=D.w+6+Math.floor(U(seed,k,side>0?15:16)*8);}}
  /* the salvage: heaps behind the rows on both sides, every 26 m along the track */
  let h=0;
  for(const side of [-1,1])for(let k=0;k<10;k++){const x=F.x-24-k*26,z=tz+side*(30+U(seed,k,side>0?21:22)*10),rx=7+U(seed,k,23+side)*5,rz=5+U(seed,k,25+side)*3;
   const C=corners(x,z,2*rx,2*rz,0,1);if(x<tx1||!C.every(p=>onFloor(p,2)&&offRiver(p,8))||clash(x,z,Math.max(rx,rz)))continue;
   const y0=Math.min(...C.map(p=>o.floor(p[0],p[1])),o.floor(x,z))-.2;
   const P={id:'th.works.salvage.'+(h++),x,z,y0,rx,rz,ry:(U(seed,k,27+side)-.5)*.8,h:2.5+U(seed,k,29+side)*2.5,seed:seed*7+k*2+(side>0?1:0),rough:.25,lumps:4,blocks:10,size:[1.2,3.5],cover:1.6};
   heaps.push(typeof KRUBBLE!=='undefined'?KRUBBLE.heap(P):P);}
  /* THE BORE TO STAIR (T-town-6; the owner settled it 2026-11-16, PLAN.md "The bore to Stair"): the Ancients' dead bore opens in
     the east wall at the canyon floor, below the Salvage Road's lowest legs (o.bore {x, z, back}: the headwall's front, the bore's
     axis and the headwall's back, from the drawn wall). The yard track runs on from the road's foot along the wall's foot and into
     it. The Rare Devisers hold it under the royal licence: lamps down the first stretch, their licence gate across the bore past
     them, their lodge, its stores and the haulers' row on the floor beside the mouth, fronts on the spur (east) */
  let bore=null;
  if(o.bore){const B=o.bore,R0=6.5,depth=90,gate=72,sw=5;
   const spur={pts:[[F.x,tz],[B.x-16,B.z],[B.x+gate-2,B.z]],w:sw};
   const segD=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/l));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);};
   const offSpur=(C,m)=>C.every(p=>segD(p,spur.pts[0],spur.pts[1])>sw/2+m&&segD(p,spur.pts[1],spur.pts[2])>sw/2+m);
   const lamps=[];for(let x=6,k=0;x<gate-4;x+=7,k++)lamps.push({at:x,side:k%2?1:-1});
   bore={id:'th.works.bore',name:'the bore to Stair',x:B.x,back:B.back,z:B.z,r:R0,c:R0-1.5,depth,gate:{at:gate,id:'th.works.bore.gate',name:'the Devisers\' licence gate'},lamps,spur,holder:'the Rare Devisers',lots:[]};
   const WANT=[['xa_scrap_court','the Rare Devisers\' lodge'],['xa_scrap_store','the Devisers\' stores and assay hall'],['xa_scrap_shacks','the haulers\' row']];
   let b=0;
   for(const [key,name] of WANT){const D=o.dims(key);if(!D)continue;let done=false;
    /* from the mouth outward: the nearest place by the spur where the building stands on the floor, flat, off the river, clear of
       the yards, the heaps and the spur, front east (ry pi/2: its width along z) */
    for(let k=0;k<40&&!done;k++)for(let m=0;m<8&&!done;m++){const z=B.z+[0,-16,16,-32,32,-48,48,64][m],cx=Math.min(B.x-16,FZ.x1)-sw/2-4-D.d/2-k*6,ry=Math.PI/2,C=corners(cx,z,D.w,D.d,ry,1);
     if(C.every(p=>onFloor(p,2)&&offRiver(p,6))&&flat(C,o.floor,2.5)&&offSpur(C,2)&&!clash(cx,z,Math.hypot(D.w,D.d)/2)){
      const L={id:'th.works.bore.'+(b++),key,v:b%3,x:cx,z,ry,w:D.w,d:D.d,ground:'floor',work:'the bore',name};lots.push(L);bore.lots.push(L.id);done=true;}}}}
  /* THE SILT FIELDS: 22 x 12 m strips on a grid upstream of the dam's east half, where the whole strip stands on dry silt */
  const dry=p=>o.bed(p[0],p[1])>=o.WL+.6,upstream=p=>p[1]<=o.face(p[0])-12,clearDome=p=>Math.hypot(p[0]-o.dome.x,p[1]-o.dome.z)>=o.dome.r;
  let f=0;
  for(let x=140;x<=318;x+=24)for(let z=-180;z<=-14;z+=14){const C=[[x-11,z-6],[x+11,z-6],[x+11,z+6],[x-11,z+6]];
   if(C.concat([[x,z]]).every(p=>dry(p)&&upstream(p)&&clearDome(p))&&flat(C,o.bed,2)){fields.push({id:'th.works.field.'+f,corners:C,...crop(CR,VALE,f,seed+31)});f++;}}
  /* the field huts at the Silt Road's foot: west of it along the shore, on dry silt, off the fields */
  const S=o.siltFoot;let u=0;
  /* along the shore west of the foot, and up and down it, until three stand */
  for(let k=0;k<32&&u<3;k++){const key=k%2?'xa_scrap_hull':'xa_scrap_shacks',D=o.dims(key);if(!D)continue;const x=S.x-10-D.w/2-(k>>2)*16,z=S.z+[0,-18,18,-36][k&3],C=corners(x,z,D.w,D.d,0,1);
   if(huts.some(H2=>Math.abs(H2.x-x)<(H2.w+D.w)/2+3&&Math.abs(H2.z-z)<(H2.d+D.d)/2+3))continue;
   if(C.every(p=>dry(p)&&upstream(p)&&clearDome(p))&&flat(C,o.bed,2)&&!fields.some(F2=>Math.abs(F2.corners[0][0]+11-x)<11+D.w/2+2&&Math.abs(F2.corners[0][1]+6-z)<6+D.d/2+2)){
    huts.push({id:'th.works.hut.'+(u++),key,v:k%3,x,z,ry:0,w:D.w,d:D.d,ground:'bed',work:'silt fields'});}}
  /* the fields' strips, the huts and the dam's face kept apart (a hut is never on a strip: the check above, by the strip's box) */
  return {track,lots,heaps,fields,huts,bore};}
 return {make,YARD};
})();
