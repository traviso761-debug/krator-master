// ================================================================= HOST — the Red Gill's views (station 7); its checks are in 87-host-gills.js
// biomes/gills/PLAN.md section 11, item 1: "the camera stands on the lip in blue pre-dawn with the giant huge in the north-east; as the sun rises
// the whole 1.6 km of the crack begins to steam at once". The day's views open at the out-breath's middle (the sky's viewHour); the in-breath
// views move the clock twelve hours on (the host's clock: #hour=). A view's `hour` is applied by the take's onView.
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode,o)=>{if(v)VIEWS[k]=Object.assign({v,mode:mode||'day'},o||{});};
 const g=SG.big,PH=GILLS.peakHour(GDAY()),day={hour:PH},suq={hour:(PH+12)%24};
 // on the lip at the out-breath: along the crack, the pipes in rows, the steam
 add('The Red Gill',[95,G(95,-760)+3,-760,-10,G(-10,300)+40,300],'day',day);
 add('Into the gill',[40,G(40,60)+2,60,-20,G(0,80)-160,120],'day',day);
 // the pipes close, on the east lip
 {const P=(GILLS_DRAW.pipes||[]).filter(o=>o.p.state==='standing'&&o.p.x>0&&Math.abs(o.p.z)<300);if(P.length){const p=P[0].p;add('The red pipes',[p.x+28,p.y0+6,p.z+22,p.x,p.y0+p.H*.6,p.z]);
  /* a rust collar close, a little under the lip (2026-11-15: the collars fitted to the Red pipe's lip, KSTACKS.ring) */
  const c=(GILLS_DRAW.life&&GILLS_DRAW.life.collars||[]).find(q=>P.some(o=>o.p.id===q.pipe));if(c)add('A rust collar',[c.x+c.r*2.6,c.y-c.r*.5,c.z+c.r*2.2,c.x,c.y+c.r*.1,c.z],'day',{hour:11});}}   /* at 11:00, lit from the side (the out-breath's dawn backlights it into a silhouette) */
 // downwind over the meadow (south-east): the stained ice, the steam tipping over it
 add('The breath meadow',[-200,G(-200,-400)+25,-400,1500,G(1500,1800),1800],'day',day);
 // the ice belt's cliff and the bloodfalls 11 km south-east, from the gill's south end
 add('The ice belt and the falls',[60,G(60,820)+30,820,SO.blood[0],G(SO.blood[0],SO.blood[1])+20,SO.blood[1]]);
 add('Overview',[-3600,G(-3600,-3800)+1500,-3800,500,SO.y0-300,800]);
 // the in-breath (Suq): six hours on, dry and silent, the throats drawing
 add('The in-breath',[95,G(95,-760)+3,-760,-10,G(-10,300)+40,300],'day',suq);
 add('Night, the gill',[120,G(120,-300)+20,-300,0,G(0,200),200],'night');}
