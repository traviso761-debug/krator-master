// ================================================================= LINE — the portal's window: bore km 303.35-304.55, the shallow south and the portal  [G data]
// biomes/line/PLAN.md section 5, station 7: daylight to the dark. The gallery cut-and-cover under 38 m of fill (z < 262 and 338-562), its light wells
// (z 100, 180, 420, 500: a shaft from the crown to the ground, the ground holed over it); a stretch FALLEN IN (z 262-338) to an open cutting, the
// sky over the tracks, the lining gone and its rubble at the sides; the PORTAL FACE at z 562 under the escarpment and the approach cutting south of
// it, the land falling to the lower tableland, the guideway, walkway and road running on at grade toward Ledge. The land is LINE.groundAt (metres
// over the invert), baked through KFIELD for its mesh and the eye. The eye's exposure ramps over 300 m from each opening (LINE.exposureAt).
const LINE=(function(){
 const S0=SITE.s0,SEC=LK.SEC,WIN={z0:-150,z1:1050,walk0:0,walk1:1000},G=SEC.guide,L=SEC.lining,WY=SEC.walk.y,CX=(SEC.x0+SEC.x1)/2;
 const PROF=LK.profileOf(SEC,36);
 const trackX=(id,z)=>SEC.tracks.find(t=>t.id===id).x;
 const FALL=[262,338],PORTAL=562,ESC=[420,760],WELLS=[100,180,420,500].map(z=>({id:'line.well.'+Math.round(S0+z),z,x:CX,r:1.6}));
 const covered=z=>(z<FALL[0]||z>FALL[1])&&z<PORTAL;
 /* THE LAND over the invert: 38 m of fill, the escarpment falling to the lower tableland past the portal; the fallen stretch's cutting and the
    portal's approach cutting (1 : 1 sides, their floors at the line's level); core/rand's noise on the tableland */
 const base=(x,z)=>SITE.cover*(1-LK.sm((z-ESC[0])/(ESC[1]-ESC[0])))+.6+1.2*KRAND.fbm(x/90,0,z/90,3,SITE.world)-.6;
 function groundAt(x,z){let g=base(x,z);const dx=Math.abs(x-CX);
  if(z>=FALL[0]&&z<=FALL[1])g=Math.min(g,.3+Math.max(0,dx-22));   /* its ends are faces at the gallery's broken ends (the cover stands over the last ring) */
  if(z>=PORTAL-.5){g=Math.min(g,.3+Math.max(0,dx-24)*.9);}
  return g;}
 /* THE TRACKS: kept under cover, worn through the fallen stretch, kept on at grade */
 const cond={};SEC.tracks.forEach(t=>cond[t.id]=[{s0:S0+WIN.z0,s1:S0+FALL[0],state:'kept'},{s0:S0+FALL[0],s1:S0+FALL[1],state:'worn'},{s0:S0+FALL[1],s1:S0+WIN.z1,state:'kept'}]);
 const trackRuns=id=>cond[id].map(c=>[Math.max(WIN.z0,c.s0-S0),Math.min(WIN.z1,c.s1-S0),c.state]);
 const routes={};SEC.tracks.forEach(t=>routes[t.id]=LK.makeRoute(z=>trackX(t.id,z),WIN.z0,WIN.z1,4));
 /* THE OPENINGS: the niches under cover */
 const niches=[];for(let z=25;z<PORTAL-20;z+=50)if(covered(z)&&!(z>FALL[0]-15&&z<FALL[1]+15))niches.push({id:'line.niche.'+Math.round(S0+z),z,w:1.2,h:2.2,d:1.2,y:WY});
 const openings=niches.map(N=>({id:N.id,kind:'niche',wall:'e',z0:N.z-N.w/2,z1:N.z+N.w/2,y0:N.y,y1:N.y+N.h}));
 /* THE LAMPS: the code under cover; white hooded at the fallen stretch's edges and the portal; none in the day */
 const lamps=[];
 for(let z=0;z<PORTAL;z+=50){if(!covered(z)||!covered(z+12)||!covered(z-12))continue;lamps.push({id:'line.lamp.w'+Math.round(S0+z),kind:'green',x:15.2,y:WY+2.3,z,base:WY});
  lamps.push({id:'line.lamp.r'+Math.round(S0+z),kind:'green',x:-20.4,y:SEC.road.footY+2.3,z,base:SEC.road.footY});
  if(covered(z+25)&&z+25<PORTAL-10)lamps.push({id:'line.lamp.s'+Math.round(S0+z+25),kind:'green',x:0,y:SEC.strip.y+4,z:z+25,base:SEC.strip.y,mast:true});}
 for(const z of [FALL[0]-4,FALL[1]+4,PORTAL-4])lamps.push({id:'line.lamp.white.'+z,kind:'white',x:15.6,y:WY+2.8,z,base:WY});
 const crown=[];for(let z=WIN.z0+5;z<PORTAL;z+=10){if(!covered(z))continue;for(const x of [-15,-9,-3,3,9])if(!WELLS.some(w=>Math.abs(w.z-z)<3&&Math.abs(w.x-x)<3))crown.push({x,z,y:LK.ceilOf(SEC,x)-.45});}
 /* THE TRAINS: two kept trains, out to Ledge on T2 and in on T3 */
 const trains=[];
 for(const [id,tr,seed,phase,dir] of [['line.train.out','t2',201,0,1],['line.train.in','t3',211,120,-1]]){const cars=LK.consist(null,seed),len=LK.trainLen(cars),run=WIN.z1-WIN.z0+len+40,dur=run/LK.KEPT,a=dir>0?WIN.z0-20:WIN.z1+len+20;
  trains.push({id,track:tr,route:routes[tr],dir,cars,len,timeline:KSCHED.timeline({period:240,phase,segments:[{dur,from:a,to:a+dir*run,ease:'linear',name:'run'},{dur:240-dur,from:a+dir*run,name:'stop:off'}]})});}
 /* THE SHAFT HEAD on the tableland over the well at z 420: the Tungangs' winch, hut, ice store and hooded lamp (stand-ins for the kit's) */
 const head={id:'line.shafthead',name:'The shaft head on the tableland (the Tungangs\' winch house, ice store, hooded lamp: stand-ins)',well:WELLS[2]};
 /* THE VOID: the covered gallery's two pieces, each open at its ends (doors onto the cutting and the portal), the niches, the light wells */
 function cavern(){const C=KCAVERN.create({ground:groundAt,cell:1,chunk:16,seed:SITE.world,walk:null});
  const room=(id,z0,z1)=>C.room({id,owner:'line',poly:[[SEC.x0-L,z0],[SEC.x1+L,z0],[SEC.x1+L,z1],[SEC.x0-L,z1]],y:-L,h:SEC.spring+L,ceil:'vault',rise:SEC.crown-SEC.spring+L,rock:'tuff',finish:'raw'});
  room('line.gallery.N',WIN.z0,FALL[0]+1);room('line.gallery.S',FALL[1]-1,PORTAL+1);
  for(const z of [FALL[0],FALL[1],PORTAL])C.opening({id:'line.mouth.'+z,kind:'door',c:[CX,z],y:0,r:(SEC.x1-SEC.x0)/2+L+1,h:SEC.crown+1});
  C.opening({id:'line.mouth.N',kind:'door',c:[CX,WIN.z0],y:0,r:(SEC.x1-SEC.x0)/2+L+1,h:SEC.crown+1});
  niches.forEach(N=>C.room({id:N.id,owner:'line',poly:[[SEC.x1+L-.1,N.z-N.w/2],[SEC.x1+L+N.d,N.z-N.w/2],[SEC.x1+L+N.d,N.z+N.w/2],[SEC.x1+L-.1,N.z+N.w/2]],y:N.y,h:N.h,rock:'tuff',finish:'hewn'}));
  WELLS.forEach(w=>{C.shaft({id:w.id,owner:'line',c:[w.x,w.z],y0:SEC.crown-2,y1:groundAt(w.x,w.z)+1,r0:w.r});C.opening({id:w.id+'.top',kind:'well',c:[w.x,w.z],r:w.r,rim:1});});
  return C.build();}
 function walk(W){LW.gallery(W,SEC,WIN.z0,WIN.z1,trackX);
  niches.forEach(N=>W.floor({rect:[SEC.x1-.1,SEC.x1+L+N.d,N.z-N.w/2,N.z+N.w/2],y:N.y,name:'a refuge niche',tag:'line.niche'}));
  lamps.forEach(l=>W.block([l.x-.12,l.x+.12,l.z-.12,l.z+.12,l.base,l.y],'line.lamppost'));
  return W;}
 const inLine=x=>x>=SEC.x0&&x<=SEC.x1;
 function floorAt(x,z){return inLine(x)?LW.sectionFloor(SEC,x,trackX,z):groundAt(x,z);}
 /* THE EXPOSURE: dark-adapted under cover, the day's out of it, ramped over 300 m from each opening (the fallen stretch, the portal); a light
    well lifts it a little within 20 m */
 const DARK=1.35,DAY=.62,RAMP=300;
 function exposureAt(x,y,z,ramp){const R=ramp==null?RAMP:ramp;if(!inLine(x)||y>14.5||!covered(z))return DAY;
  const d=Math.min(Math.abs(z-FALL[0]),Math.abs(z-FALL[1]),Math.abs(z-PORTAL)),k=1-LK.sm(d/R),w=WELLS.reduce((m,W)=>Math.max(m,1-Math.min(1,Math.abs(W.z-z)/20)),0)*.12;
  return DARK+(DAY-DARK)*Math.min(1,k+w);}
 const CHK={
  ramp(R){const O=FALL[0],e0=exposureAt(0,2,O-.5,R),eMid=exposureAt(0,2,O-R/2,R),e300=exposureAt(0,2,O-300,R),e200=exposureAt(0,2,O-200,R);let mono=true,prev=-1;
   for(let z=O-.5;z>O-300;z-=5){if(WELLS.some(W=>Math.abs(W.z-z)<22))continue;const e=exposureAt(0,2,z,R);if(e<prev-1e-9)mono=false;prev=e;}
   return{ok:mono&&Math.abs(e0-DAY)<.05&&e300>DARK-.02&&e200<DARK-.05&&eMid>DAY+.1&&eMid<DARK-.1,detail:'exposure '+e0.toFixed(2)+' at the edge of the fallen stretch, '+eMid.toFixed(2)+' '+(R/2)+' m in, '+e300.toFixed(2)+' 300 m in'+(mono?'':' (not monotonic)')};},
  fallen(zc){const g=groundAt(CX,zc),run=SEC.tracks.every(t=>cond[t.id].some(c=>c.state!=='cut'&&c.s0<=S0+zc&&c.s1>S0+zc));return{ok:g<.6&&run,detail:'the land over the line at z '+zc+': '+g.toFixed(1)+' m (the sky '+(g<.6?'open':'closed')+'); the tracks '+(run?'run':'cut')};},
  wells(dx){const bad=WELLS.filter(w=>CAVE_C.sdf(w.x+dx,SEC.crown+8,w.z)<=0);return{ok:!bad.length,detail:bad.length?bad.length+' well(s) closed at '+dx+' m off':'every light well open from the crown to the ground ('+WELLS.length+')'};},
  grade(z){const g=groundAt(CX+30,z);return{ok:g<3,detail:'the land 30 m beside the line at z '+z+': '+g.toFixed(1)+' m over the invert'+(g<3?' (at grade: the tableland)':' (under cover)')};}};
 return {S0,SEC,WIN,trackX,trackRuns,cond,routes,openings,niches,crossovers:[],lamps,crown,trains,standingTrains:[],standing:[],FALL,PORTAL,WELLS,head,groundAt,exposureAt,covered,
  sectionAt:z=>covered(z)?SEC:null,profileAt:()=>PROF,gallerySpans:[[WIN.z0,WIN.z1]],cavern,walk,floorAt,
  rockShows:(x0,z0,cs,y0)=>(x0+cs>SEC.x1+L-2&&x0<SEC.x1+L+3&&z0<PORTAL)||WELLS.some(w=>Math.abs(x0+cs/2-w.x)<cs&&Math.abs(z0+cs/2-w.z)<cs&&y0+cs>SEC.crown-4),
  lights:[],ambient:{k:.42,fog:.0007,haze:0x9aa4ac},
  clearSpans:[[WIN.walk0,WIN.walk1]],lampSpans:[[WIN.walk0,FALL[0]-20],[FALL[1]+20,PORTAL-20]],
  works(){return LW.galleryWorks(SEC,WIN,lamps,crown);},
  walkWant:[[SEC.walk.x0+1,WY,120,'the walkway under cover'],[SEC.walk.x0+1,WY,300,'the walkway in the fallen stretch'],[SEC.walk.x0+1,WY,820,'the walkway at grade'],[(SEC.road.x0+SEC.road.x1)/2,SEC.road.y,700,'the road out of the portal']],
  reach:{start:[SEC.walk.x0+1,WY,120],box:[SEC.walk.x0-.5,SEC.x1+3,60,900],targets:[[SEC.walk.x0+1,WY,300],[SEC.walk.x0+1,WY,820]],note:'along the walkway from under cover, through the fallen stretch, out of the portal'},
  hazards(){return [{name:'The fallen stretch\'s edges: the fill over the cutting (loose)',key:'hazard.crush.fall',x:CX,z:(FALL[0]+FALL[1])/2,y:0,r:22,h:10,tags:{hazard:{kind:'crush',danger:.3,shape:{type:'box',w:44,h:10,d:FALL[1]-FALL[0]+10}}}},
   {name:'A light well: the shaft down to the gallery\'s crown',key:'hazard.fall.well',x:WELLS[2].x,z:WELLS[2].z,y:SEC.crown,r:WELLS[2].r+1,h:groundAt(WELLS[2].x,WELLS[2].z)-SEC.crown+1,tags:{hazard:{kind:'fall',shape:{type:'cyl',r:WELLS[2].r+1,h:groundAt(WELLS[2].x,WELLS[2].z)-SEC.crown+1}}}}];},
  records(){return [{name:'The fallen stretch: the gallery open to the sky',key:'line.fallen.S',x:CX,z:(FALL[0]+FALL[1])/2,y:0,r:30,h:12,tags:{line:{kind:'fallen',sky:true}}},
   {name:'The south portal (bore km '+((S0+PORTAL)/1000).toFixed(2)+')',key:'line.portal.S',x:CX,z:PORTAL,y:0,r:22,h:SEC.crown,tags:{line:{kind:'portal',to:'Ledge',km:42}}},
   {name:head.name,key:head.id,x:head.well.x+8,z:head.well.z,y:groundAt(head.well.x,head.well.z),r:9,h:6,tags:{line:{kind:'shafthead',by:'tungang',well:head.well.id}}}].concat(WELLS.map(w=>({name:'A light well',key:w.id,x:w.x,z:w.z,y:SEC.crown-2,r:w.r+.5,h:groundAt(w.x,w.z)-SEC.crown+3,tags:{line:{kind:'well'}}})));},
  checks(){return {checks:[Object.assign({name:'the eye\'s exposure ramps over 300 m between the day and the dark'},CHK.ramp(RAMP)),Object.assign({name:'the fallen stretch is open to the sky and its tracks run'},CHK.fallen(300)),
    Object.assign({name:'the light wells are open from the crown to the ground'},CHK.wells(0)),Object.assign({name:'the portal opens onto the tableland at grade'},CHK.grade(900))],
   negatives:[{name:'negative: a ramp of 40 m',failed:!CHK.ramp(40).ok,detail:CHK.ramp(40).detail},{name:'negative: the same test under cover',failed:!CHK.fallen(200).ok,detail:CHK.fallen(200).detail},
    {name:'negative: 5 m off the wells',failed:!CHK.wells(5).ok,detail:CHK.wells(5).detail},{name:'negative: the same test under the fill',failed:!CHK.grade(200).ok,detail:CHK.grade(200).detail}]};},
  exportProfile:['registry','hazards','terrain','stage','atmos'],exportBox:[-25,250,25,350],
  describe(p){return covered(p.z)&&inLine(p.x)&&p.y<14.5?'':'\nin the day'+(p.z>PORTAL?' (the tableland)':'');},
  export(){return {format:'krator-line-window',version:1,station:STATION.key,s0:S0,sec:SEC,win:WIN,cond,niches,lamps,fallen:FALL,portal:PORTAL,wells:WELLS,head,
   trains:trains.map(T=>({id:T.id,track:T.track,cars:T.cars,timeline:T.timeline.export()})),routes};}};
})();
