// ================================================================= HOST — the First Breath's views and checks (station 1)
// The views are found in the built scene (the skylight's rim, the tube's floor, a cairn, the coulee's front, the trench), never aimed at
// arithmetic alone. The checks (verify.py --assert) are pure functions of their inputs, each with a negative that must fail.
const sAt=(P,s,l)=>{const n=[-P.d[1],P.d[0]];return[P.x+P.d[0]*s+n[0]*(l||0),P.z+P.d[1]*s+n[1]*(l||0)];};
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode,o)=>{if(v&&v.every(isFinite))VIEWS[k]=Object.assign({v,mode:mode||'day'},o||{});};
 const NW=TWIN_CONES.cones[0];
 // the skylight from its south-west rim: down into the collapse, the breakdown ramp climbing out on the far side, the scree beyond
 {const c=sAt(SKYL,-SKYL.r-24,10),t=sAt(SKYL,3,0);add('The First Skylight Break',[c[0],G(c[0],c[1])+22,c[1],t[0],SKYL.floor+4,t[1]]);}
 // inside A1 120 m back: the arched tube, the curb-ledges, the daylight falling through the skylight ahead
 {const c=sAt(SKYL,-120,-2),t=sAt(SKYL,0,0);add('In the tube, toward the light',[c[0],floorA1(-120)+1.7,c[1],t[0],floorA1(0)+5,t[1]]);}
 // deep in A1 by the torches: the tube running on toward Xanadu
 {const c=sAt(SKYL,-430,2),t=sAt(SKYL,-560,-2);add('The Dark-Tube Road by torchlight',[c[0],floorA1(-430)+1.7,c[1],t[0],floorA1(-560)+4,t[1]]);}
 // up the breakdown ramp to the sky
 {const T=SKYL.tiers[1],c=sAt(SKYL,T.s0+2,1),t=sAt(SKYL,SKYL.r+6,0);add('Climbing out',[c[0],T.top+1.9,c[1],t[0],G(t[0],t[1])+3,t[1]]);}
 // the First Breath: from the ramp's top along the sprint, east-north-east, the NW Twin smoking off to the north
 {const p=ROUTE.pts[1],q=ROUTE.pts[9];add('The First Breath',[p[0],G(p[0],p[1])+1.7,p[1],q[0],G(q[0],q[1])+1.2,q[1]]);}
 // a cairn on the sprint, close (the nearest to the route's first third), its cap daubed with sulphur
 {const P=itemPositions('cairnstone',1);const m=ROUTE.pts[Math.floor(ROUTE.pts.length/3)];let best=null,bd=1e18;P.forEach(p=>{const d=Math.hypot(p[0]-m[0],p[2]-m[1]);if(d<bd){bd=d;best=p;}});
  if(best){const q=ROUTE.pts[Math.floor(ROUTE.pts.length/3)+3];const dx=q[0]-best[0],dz=q[1]-best[2],l=Math.hypot(dx,dz)||1;
   add('A guide\'s cairn',[best[0]-dx/l*5,G(best[0]-dx/l*5,best[2]-dz/l*5)+1.6,best[2]-dz/l*5,best[0],best[1]+.4,best[2]]);}}
 // the NW Twin, 24 km off, its plume leaning downwind. On map 5.1 the site lies in a hollow whose rim, 4-5 km out, stands as high in the
 // view as the cone: from the sprint itself the cone is hidden. The view stands at the nearest place to the sprint's middle (a 300 m
 // lattice over the square) from which the line to the cone's rim clears the ground (the map inside, the far country past it)
 {const m=ROUTE.pts[Math.floor(ROUTE.pts.length/2)],clear=(x,z)=>{const y0=G(x,z)+2,dx=NW.x-x,dz=NW.z-z,L=Math.hypot(dx,dz);
   for(let t=60;t<L-6000;t+=t<6000?60:250){const px=x+dx*t/L,pz=z+dz*t/L,gy=inMap(px,pz)?G(px,pz):FAR.at(px,pz);if(gy>y0+(NW.peak-y0)*t/L)return false;}return true;};
  let best=null,bd=1e18;for(let z=TERR.Z0+300;z<TERR.Z1-300;z+=300)for(let x=TERR.X0+300;x<TERR.X1-300;x+=300){const d=Math.hypot(x-m[0],z-m[1]);if(d<bd&&clear(x,z)){bd=d;best=[x,z];}}
  STN.twinView=best?{x:best[0],z:best[1],d:bd}:null;
  if(best)add('The NW Twin',[best[0],G(best[0],best[1])+2,best[1],NW.x,NW.peak,NW.z]);
  /* its plume stands 2.6 km over the crater: over the hollow's rim from the sprint itself, the cone under the rim */
  add('The NW Twin\'s plume from the sprint',[m[0],G(m[0],m[1])+1.7,m[1],NW.x,NW.floor+1400,NW.z]);}
 // the obsidian coulee's front from the route below it
 {const f=COUL.front,c=[f[0]-COUL.a[0]*-260,f[1]-COUL.a[1]*-260];add('The obsidian coulee',[c[0],G(c[0],c[1])+2,c[1],COUL.c[0],G(COUL.c[0],COUL.c[1])+5,COUL.c[1]]);}
 // the trench's ramp down to the Horn-Underpass's mouth
 {const c=sAt(PORT,-120,2),t=sAt(PORT,6,0);add('The dive-ramp',[c[0],G(c[0],c[1])+2,c[1],t[0],PORT.floor+5,t[1]]);}
 // the fumarole-ferns in the skylight's warm breath (the nearest fern to the rim's north side)
 {const P=itemPositions('fern',1);let best=null,bd=1e18;const r=sAt(SKYL,0,SKYL.r+6);P.forEach(p=>{const d=Math.hypot(p[0]-r[0],p[2]-r[1]);if(d<bd){bd=d;best=p;}});
  if(best){const dx=best[0]-SKYL.x,dz=best[2]-SKYL.z,l=Math.hypot(dx,dz)||1;add('Fumarole-ferns',[best[0]+dx/l*3,G(best[0]+dx/l*3,best[2]+dz/l*3)+1.3,best[2]+dz/l*3,best[0]-dx/l*2,best[1]+.2,best[2]-dz/l*2]);}}
 add('Night in the tube',(function(){const c=sAt(SKYL,-300,0),t=sAt(SKYL,-200,0);return[c[0],floorA1(-300)+1.7,c[1],t[0],floorA1(-200)+3,t[1]];})(),'night');
 add('Night, the NW Twin',(function(){const m=ROUTE.pts[Math.floor(ROUTE.pts.length/2)];return[m[0],G(m[0],m[1])+2,m[1],NW.x,NW.floor,NW.z];})(),'night');
 {const c=sAt(SKYL,-1400,-900);add('Overview',[c[0],G(c[0],c[1])+1300,c[1],(SKYL.x+PORT.x)/2,SITE_Y,(SKYL.z+PORT.z)/2]);}}
// THE COLD PROBE (the kit's check, 99-host-take.js): a point on the scree in the sprint's middle and one in tube A1 200 m in
STN.coldProbe=()=>{const m=ROUTE.pts[Math.floor(ROUTE.pts.length/2)],t=sAt(SKYL,-200,0);return{out:[m[0],terrainH(m[0],m[1])+1.6,m[1]],inn:[t[0],floorA1(-200)+1.6,t[1]]};};
STN.counts=B=>B.blocks>1500&&B.stones>2000&&B.obsidian>300&&B.cairns>=25&&B.ferns>40&&B.cushions>40&&B.field>10000&&B.blocks+B.stones+B.obsidian<320000;
const TCHK={
 // the tubes: open along their lines (a void 3 m over the floor every 10 m), under rock (but at the skylight), A1 18 m wide
 tubes(open,roofed,n){return{ok:open===n&&roofed>=n-6,detail:open+' of '+n+' points along A1 and A2 open 3 m over the floor; '+roofed+' under rock'};},
 // the skylight: open to the sky over the tube's floor; its breakdown ramp reaches up within 3 m of the scree on the far side
 skylight(sky,rampTop,rim){const ok=sky&&rim-rampTop<3.5;return{ok,detail:'the sky '+(sky?'seen':'NOT seen')+' from the floor under it; the ramp\'s top '+rampTop.toFixed(1)+' m, the far rim '+rim.toFixed(1)+' m'};},
 // the portal: the trench open to the sky, the mouth open, the tube roofed 60 m in
 portal(trenchSky,mouthOpen,inRoof){const ok=trenchSky&&mouthOpen&&inRoof;return{ok,detail:'the trench '+(trenchSky?'open':'roofed')+', the mouth '+(mouthOpen?'open':'shut')+', 60 m in '+(inRoof?'under rock':'OPEN TO THE SKY')};},
 // the sprint: 3.2-3.9 km between the skylight and the trench (PLAN.md section 3.1: ~3.5 km), its height 4,180-4,450 m (the plan: 4,180-4,290
 // at its ends; the map's slope rises between them), cairned every ~110 m
 sprint(len,lo,hi,cairns){const ok=len>3200&&len<3900&&lo>4100&&hi<4500&&cairns>=Math.floor(len/110)-4;return{ok,detail:(len/1000).toFixed(2)+' km, '+lo.toFixed(0)+'-'+hi.toFixed(0)+' m, '+cairns+' cairns'};},
 // the NW Twin: ~24 km north-north-east, its crater at 5,980 m (scale model 5.1, Option A)
 twin(d,brg,floor){const ok=d>21000&&d<27000&&brg>15&&brg<55&&Math.abs(floor-5980)<1;return{ok,detail:(d/1000).toFixed(1)+' km at '+brg.toFixed(0)+' deg, crater '+floor+' m'};},
 // the warm collar: ferns only in the warm breath, none in the snow
 collar(P,warm,snow){let cold=0,snowy=0;P.forEach(p=>{if(warm(p[0],p[2])<.3)cold++;if(snow(p[0],p[2])>.3)snowy++;});return{ok:P.length>20&&cold===0&&snowy===0,detail:P.length+' ferns: '+cold+' out of the warm breath, '+snowy+' in snow'};}};
function tubeSamples(){const C=CAVE.C;let open=0,roof=0,n=0;
 [[SKYL,A1.from+20,-SKYL.r-10,floorA1],[PORT,30,A2.to-20,floorA2]].forEach(T=>{for(let s=T[1];s<T[2];s+=10){const p=sAt(T[0],s,0),y=T[3](s)+3;n++;if(C.sdf(p[0],y,p[1])>0)open++;if(C.ceilingAt(p[0],p[1],y)!==null)roof++;}});return{open,roof,n};}
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),C=CAVE.C;if(!C){add('the cavern built',{ok:false,detail:'no cavern'});return R;}
 {const t=tubeSamples();add('the tubes: open, roofed',TCHK.tubes(t.open,t.roof,t.n));}
 {const r=sAt(SKYL,SKYL.r+2,0);add('the skylight: open, its ramp climbs out',TCHK.skylight(C.ceilingAt(SKYL.x,SKYL.z,STATION_FLOOR(SKYL.x,SKYL.z)+1.6)===null,SKYL.tiers[SKYL.tiers.length-1].top,terrainH(r[0],r[1])));}
 {const a=sAt(PORT,-30,0),b=sAt(PORT,4,0),c=sAt(PORT,60,0);add('the portal: the trench, the mouth, the tube',TCHK.portal(C.ceilingAt(a[0],a[1],terrainH(a[0],a[1])+1)===null,C.sdf(b[0],PORT.floor+3,b[1])>0,C.ceilingAt(c[0],c[1],floorA2(60)+3)!==null));}
 {const B=window._biome||{};add('the sprint: length, height, cairns',TCHK.sprint(ROUTE.len,ROUTE.bottom,ROUTE.top,B.cairns||0));}
 {const T=TWIN_CONES.cones[0];add('the NW Twin on the horizon',TCHK.twin(Math.hypot(T.x,T.z),(Math.atan2(T.x,-T.z)*180/Math.PI+360)%360,T.floor));}
 add('the fumarole-ferns in the warm breath only',TCHK.collar(itemPositions('fern',1),FIELD.warm,FIELD.snow));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});if(!CAVE.C)return R;const t=tubeSamples();
 add('a tube choked',TCHK.tubes(t.open-5,t.roof,t.n));
 add('the skylight roofed over',TCHK.skylight(false,SKYL.tiers[SKYL.tiers.length-1].top,SKYL.y));
 add('the ramp 8 m short',TCHK.skylight(true,SKYL.y-8,SKYL.y));
 add('the tube open to the sky 60 m in',TCHK.portal(true,true,false));
 add('a 9 km sprint',TCHK.sprint(9000,4200,4300,90));
 add('the NW Twin due west',TCHK.twin(24000,270,5980));
 add('ferns in the frost',TCHK.collar(itemPositions('fern',1).map(p=>[p[0]+400,p[1],p[2]+400,p[3]]),FIELD.warm,FIELD.snow));
 return R;}
