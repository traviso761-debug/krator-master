// ================================================================= HOST — the Red ladder's views and its own checks (station 8); the gills' checks are
// in 87-host-gills.js (read from the Red Gill's station), which calls SOUTH_CHECKS / SOUTH_NEGATIVES for these
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode,o)=>{if(v)VIEWS[k]=Object.assign({v,mode:mode||'day'},o||{});},PH=GILLS.peakHour(GDAY()),day={hour:PH};
 add('The Red ladder',[-600,G(-600,3800)+40,3800,200,G(200,-1500)+60,-1500],'day',day);
 {const P=(GILLS_DRAW.pipes||[]).filter(o=>o.p.ice&&o.p.state==='standing');if(P.length){const p=P[Math.floor(P.length/2)].p;add('The ice towers',[p.x+30,p.y0+8,p.z+24,p.x,p.y0+p.H*.5,p.z],'day',day);}}
 {const J=JETS[Math.floor(JETS.length/2)];if(J){add('A frost jet and its rime fan',[J.x-WIND[0]*40+20,G(J.x,J.z)+10,J.z-WIND[1]*40,J.x+WIND[0]*60,G(J.x,J.z),J.z+WIND[1]*60],'day',day);}}
 add('The dry-cold line',[0,G(0,-2200)+30,-2200,0,G(0,2500),2500]);
 add('Overview',[-3600,G(-3600,-3800)+1400,-3800,400,LD.y0-300,600]);
 add('Night, the ladder',[0,G(0,0)+30,0,0,G(0,2000),2000],'night');}
const LCHK={
 // the ladder's top rungs: every pipe on the page is iced (over 7 km: biomes/gills/PLAN.md section 5), none alive
 iced(R){const bad=R.filter(o=>!o.p.ice||o.p.live);return{ok:R.length>10&&!bad.length,detail:R.length+' pipes, '+bad.length+' not iced or alive'};},
 // the frost jets stand over the line only, each with a rime fan on its lee (ice downwind, none upwind)
 jets(J,ice){const low=J.filter(j=>terrainH(j.x,j.z)<LD.line),bad=J.filter(j=>!(ice(j.x+WIND[0]*j.fan*.5,j.z+WIND[1]*j.fan*.5)>.3&&ice(j.x-WIND[0]*j.fan*.5,j.z-WIND[1]*j.fan*.5)<.15));
  return{ok:J.length>8&&!low.length&&bad.length<=J.length*.1,detail:J.length+' jets, '+low.length+' under the line, '+bad.length+' without a fan on the lee'};}};
function SOUTH_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r));
 add('the ladder\'s pipes are iced (ice towers), none alive',LCHK.iced(GILLS_DRAW.pipes));
 add('frost jets over the line, rime fans on their lee',LCHK.jets(JETS,FIELD.ice));return R;}
function SOUTH_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail});
 add('a live pipe at 8.5 km',LCHK.iced(GILLS_DRAW.pipes.concat([{p:{ice:false,live:true}}])));
 add('rime all round the jets (no lee)',LCHK.jets(JETS,()=>1));return R;}
