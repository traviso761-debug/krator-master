// TARGET: funicular — view presets, derived from the plan record (90-scene.js has run by now).
// The first entry is the opening shot. (BUDGET is 91-probe.js's: the track is a medium, the terrain a sky.)
BUDGET.type.fun='medium';BUDGET.type.funGround='sky';
// Track-local: s along the incline from the upper station (m, plan),
// l across it (+l is north here), y absolute.
const FUNV=(function(){const r=FUNT.rec||{a:[-200,224,0],u:[1,0],n:[0,-1],grade:-.5525,L:400,breaks:[[3,3]],step:30.77,car:null};
 const W=(s,l,y)=>[r.a[0]+r.u[0]*s+r.n[0]*l,y,r.a[2]+r.u[1]*s+r.n[1]*l];
 const D=s=>r.a[1]+r.grade*s;
 const br=r.breaks[0]||[3,3], bs=(br[0]+br[1]+1)/2*r.step;
 const c=r.car||{x:-155,y:200,z:-3};
 return{r,W,D,bs,c};})();
const VIEWS={
 'Overview':          FUNV.W(FUNV.r.L*.66,-330,215).concat(FUNV.W(FUNV.r.L*.42,0,100)),
 'A broken span':     FUNV.W(FUNV.bs+6,-105,FUNV.D(FUNV.bs)-6).concat(FUNV.W(FUNV.bs,0,FUNV.D(FUNV.bs)-16)),
 'The winding house': FUNV.W(22,-46,FUNV.r.a[1]+50).concat(FUNV.W(-21,0,FUNV.r.a[1]+5)),
 'The car':           [FUNV.c.x+16,FUNV.c.y+9,FUNV.c.z+26,FUNV.c.x,FUNV.c.y+3,FUNV.c.z],
 'Down the incline':  FUNV.W(3,-5.2,FUNV.D(3)+2.2).concat(FUNV.W(60,-1,FUNV.D(60)-1)),
 'From below':        FUNV.W(FUNV.r.L*.62,-70,FUNV.D(FUNV.r.L*.62)-40).concat(FUNV.W(FUNV.r.L*.42,0,FUNV.D(FUNV.r.L*.42))),
 'The platform hall': FUNV.W(FUNV.r.L+48,-36,FUNV.r.b[1]+16).concat(FUNV.W(FUNV.r.L-10,0,FUNV.r.b[1]+5)),
};
