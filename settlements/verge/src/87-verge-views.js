// ================================================================= VERGE — the preset views ([web])
// Every view is derived from the layout it shows (a view typed as numbers rots when the layout moves). Their camera
// spots are reserved before the biomes grow (88 pushes VIEW_CLEAR into OBSTACLES), so no tree stands in a lens.
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){
 const T=VG.TRAIL,U=VG.CITY.upper,L=VG.CITY.lower,F=VG.FALLS,P=VG.POOL,R=T.rest;
 const tAt=s=>VG.trailAt(s);
 const restView=r=>{const nx=Math.sin(r.yaw),nz=Math.cos(r.yaw),c=[r.x+nx*(r.variant?34:46)+nz*18,r.z+nz*(r.variant?34:46)-nx*18];return[c[0],r.y+(r.variant?6:14),c[1],r.x,r.y+2,r.z];};const mid=tAt(T.len*.5),q1=tAt(T.len*.22),q3=tAt(T.len*.8);
 const V={
  'Upper Verge from the rim':look(U.head[0]-420,VG.canZ(U.head[0]-420)+VG.canHW(U.head[0]-420)+90,22,U.head[0]-320,VG.canZ(U.head[0]-300),0),
  'Upper Verge: the trailhead':look(U.head[0]-120,U.head[1]+70,26,U.head[0]+10,U.head[1]-10,2),
  'The canyon and the oasis':look(-3300,VG.rivUZ(-3300)+150,40,-2400,VG.rivUZ(-2400),0),
  'The cataracts from the lip':[F[0].x-6,F[0].top+18,VG.gorgeZ(F[0].x)+46,F[3].x,F[3].bot,VG.gorgeZ(F[3].x)],
  'The cataracts from below':[P.x+260,P.y+70,P.z-170,F[3].x,F[3].top-40,VG.gorgeZ(F[3].x)],
  // from the floor north-east of the pool (the spur's flank stands south of it), up into the last falls
  'The plunge pool':[P.x+150,gh(P.x+150,P.z-70,22),P.z-70,P.x-40,P.y+60,P.z],
  // from the floor east of the toe, up the whole face of the spur and its wandering legs
  'The switchback from below':look(T.bot[0]+900,190,70,T.bot[0]-420,190,330),
  // on the trail: down the leg ahead, the legs below it and the abyss beyond
  // (in the middle of a leg near the 30% mark, looking along it to the next hairpin)
  'On the trail':(()=>{let s0=T.len*.27;for(let s=T.len*.27;s<T.len*.33;s+=2)if(Math.abs(tAt(s)[1]-20)<Math.abs(tAt(s0)[1]-20))s0=s;
   const c=tAt(s0),a=tAt(s0+90);return[c[0]-1,c[2]+2.0,c[1],a[0]+10,a[2]-6,a[1]];})(),
  // the stops: each seen from out over the drop (its +z), a little along the trail
  'A rest stop built out on the cliff':restView(R[0]),
  'A rest stop cut in the rock':restView(R[1]),
  // from out on the floor south-east of the spur's toe, up the whole incline to the rim
  'The funicular':[VG.FUNI.b[0]+240,250,VG.FUNI.z+360,(VG.FUNI.a[0]+VG.FUNI.b[0])/2+90,330,VG.FUNI.z-60],
  'Lower Verge: the trailhead':look(L.head[0]+140,L.head[1]+110,30,L.head[0],L.head[1],2),
  'Lower Verge from the river':look(L.head[0]+660,-430,26,L.head[0]+160,-60,4),
  'The escarpment from the abyss':look(2600,520,140,-900,-60,420),
  'From the lip east to the salt lakes':[U.head[0]+20,gh(U.head[0]+20,U.head[1]+40,30),U.head[1]+40,9000,-40,-400],
  'The whole descent':look(-600,1500,900,-700,-40,300),
  'Krator from the canyon':look(-2200,-150,6,-2200+Math.sin(66*Math.PI/180)*1000,-150-Math.cos(66*Math.PI/180)*1000,420),
 };
 // two live views: each looks for its subject when it is picked (the life layer moves; a fixed camera would miss it)
 const o={},find=pred=>{for(const G of SIM.GROUPS){const base=((CLOCK.t-G.phase)%SIM.T+SIM.T)%SIM.T;
   for(let c=0;c<G.copies;c++)for(const M of G.members){if(M.kind==='person')continue;SIM.memberPose(G,M,base+c*SIM.T,o);if(o.vis&&pred(G,o))return[o.x,o.y,o.z];}}return null;};
 Object.defineProperty(V,'A caravan on the trail',{enumerable:true,get(){
  const p=find((G,o)=>G.kind==='caravan'&&!o.dispersed&&o.y>60&&o.y<800&&VG.trailNear(o.x,o.z)&&VG.trailNear(o.x,o.z).d<4);
  return p?[p[0]+22,p[1]+9,p[2]+14,p[0],p[1]+1,p[2]]:V['The switchback from below'];}});
 Object.defineProperty(V,'A caravanserai yard',{enumerable:true,get(){
  const p=find((G,o)=>o.dispersed&&o.pose!=='walk');
  return p?[p[0]+26,p[1]+16,p[2]+26,p[0],p[1],p[2]]:V['Upper Verge: the trailhead'];}});
 return V;})();
// the reserved camera spots (88 pushes them into OBSTACLES before the biomes grow)
const VIEW_CLEAR=Object.keys(VIEWS).map(k=>({x:VIEWS[k][0],z:VIEWS[k][2],r:18,y0:-1e9,y1:1e9,view:k}));
const INITIAL_VIEW=QS.get('view')&&VIEWS[QS.get('view')]?QS.get('view'):'Upper Verge: the trailhead';
