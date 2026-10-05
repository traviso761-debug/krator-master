// ================================================================= VERGE — the preset views ([web])
// Every view is derived from the layout it shows (a view typed as numbers rots when the layout moves). Their camera
// spots are reserved before the biomes grow (88 pushes VIEW_CLEAR into OBSTACLES), so no tree stands in a lens.
const gh=(x,z,dy)=>terrainH(x,z)+(dy||0);
const look=(cx,cz,dyc,tx,tz,dyt)=>[cx,gh(cx,cz,dyc),cz,tx,gh(tx,tz,dyt),tz];
const VIEWS=(function(){
 const T=VG.TRAIL,U=VG.CITY.upper,L=VG.CITY.lower,F=VG.FALLS,P=VG.POOL,R=T.rest;
 const tAt=s=>VG.trailAt(s);const mid=tAt(T.len*.5),q1=tAt(T.len*.22),q3=tAt(T.len*.8);
 const V={
  'Upper Verge from the rim':look(U.head[0]-420,VG.canZ(U.head[0]-420)+VG.canHW(U.head[0]-420)+90,22,U.head[0]-320,VG.canZ(U.head[0]-300),0),
  'Upper Verge: the trailhead':look(U.head[0]-120,U.head[1]+70,26,U.head[0]+10,U.head[1]-10,2),
  'The canyon and the oasis':look(-3300,VG.rivUZ(-3300)+150,40,-2400,VG.rivUZ(-2400),0),
  'The cataracts from the lip':[F[0].x-6,F[0].top+18,VG.gorgeZ(F[0].x)+46,F[3].x,F[3].bot,VG.gorgeZ(F[3].x)],
  'The cataracts from below':[P.x+260,P.y+70,P.z-170,F[3].x,F[3].top-40,VG.gorgeZ(F[3].x)],
  'The plunge pool':[P.x+110,P.y+24,P.z+70,P.x-40,P.y+60,P.z],
  'The switchback from below':look(260,-30,60,-500,10,180),
  // on the trail: down the leg ahead, the legs below it and the abyss beyond
  // (in the middle of a leg near the 30% mark, looking along it to the next hairpin)
  'On the trail':(()=>{let s0=T.len*.27;for(let s=T.len*.27;s<T.len*.33;s+=2)if(Math.abs(tAt(s)[1]-20)<Math.abs(tAt(s0)[1]-20))s0=s;
   const c=tAt(s0),a=tAt(s0+90);return[c[0]-1,c[2]+2.0,c[1],a[0]+10,a[2]-6,a[1]];})(),
  // the first stop, on the north flank: seen from the trail below it, with the gorge and its falls behind
  'A rest stop over the falls':[R[0].x+40,R[0].y+8,R[0].z+45,R[0].x-10,R[0].y-4,R[0].z-40],
  'A rest stop cut in the rock':[R[1].x+30,R[1].y+10,R[1].z+20,R[1].x,R[1].y+2,R[1].z],
  // from out on the floor south-east of the spur's toe, up the whole incline to the rim
  'The funicular':[VG.FUNI.b[0]+240,250,VG.FUNI.z+360,(VG.FUNI.a[0]+VG.FUNI.b[0])/2+90,330,VG.FUNI.z-60],
  'Lower Verge: the trailhead':look(L.head[0]+140,L.head[1]+110,30,L.head[0],L.head[1],2),
  'Lower Verge from the river':look(700,-420,26,200,-60,4),
  'The escarpment from the abyss':look(2600,520,140,-900,-60,420),
  'From the lip east to the salt lakes':[U.head[0]+20,gh(U.head[0]+20,U.head[1]+40,30),U.head[1]+40,9000,-40,-400],
  'The whole descent':look(-600,1500,900,-700,-40,300),
  'Krator from the canyon':look(-2200,-150,6,-2200+Math.sin(66*Math.PI/180)*1000,-150-Math.cos(66*Math.PI/180)*1000,420),
 };
 return V;})();
// the reserved camera spots (88 pushes them into OBSTACLES before the biomes grow)
const VIEW_CLEAR=Object.keys(VIEWS).map(k=>({x:VIEWS[k][0],z:VIEWS[k][2],r:18,y0:-1e9,y1:1e9,view:k}));
const INITIAL_VIEW=QS.get('view')&&VIEWS[QS.get('view')]?QS.get('view'):'Upper Verge: the trailhead';
