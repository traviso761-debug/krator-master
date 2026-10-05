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
  'On the trail':[q1[0]+3,q1[2]+1.8,q1[1]+2,q1[0]+90,q1[2]-30,q1[1]-40],
  'A rest stop over the falls':[R[0].x+28,R[0].y+12,R[0].z-28,R[0].x,R[0].y+2,R[0].z],
  'A rest stop cut in the rock':[R[1].x+30,R[1].y+10,R[1].z+20,R[1].x,R[1].y+2,R[1].z],
  'The funicular':look((VG.FUNI.a[0]+VG.FUNI.b[0])/2+140,VG.FUNI.z+260,120,(VG.FUNI.a[0]+VG.FUNI.b[0])/2,VG.FUNI.z,0),
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
