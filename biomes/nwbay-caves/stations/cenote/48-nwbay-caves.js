// ================================================================= NWBAY CAVES — the drowned cave under the NE cenote: its records  [G data]
// PLAN.md section 2. Records on the core, no THREE and no DOM; the host fragments (84 on) draw them.
//   THE CAVE    site 1's bay KKARST.network over the box (SITE.net, world SITE.world), whole: drowned branchwork draining to a brackish spring at the
//               shore. The sink KKARST put under the cenote keeps its shaft, ended at the cenote's floor (no doline: the cenote is its head);
//               the other sinks' shafts are choked SITE.choke m under the ground (nwbay's surface has no hole there; kind 'choke', so KKARST.build
//               opens no well for them). KKARST.build carves it in one KCAVERN; the station adds the cenote: a belled hall (nwbay's radius,
//               elongation and bell, its floor at nwbay's -9) with a throat up to its rim on the ground, and the well where it meets the sky
//   THE DRESS   KSPELEO.LIMESTONE over the box from the passages' height and again under the cenote's bell: grown when the sea stood lower,
//               drowned now
//   THE WATER   the table at the sea (0): every void under it is water; the only air is the cenote's shaft
//   THE AIR     KKARST's hazards: drowning over every sump and flooded chamber, for air-breathers only (tags.breathers: the Hykkousoi breathe
//               water and the sumps are their roads: KARST-SITES site 1), the falls down the shafts; and the fall into the cenote from its rim
const CAVE=(function(S){
 const d=(v,x)=>v==null?x:v,CE=S.cenote;
 const N=KKARST.network(Object.assign({ground:S.ground,world:S.world},S.net));
 const M={};N.nodes.forEach(n=>{M[n.id]=n;});
 const sink=N.sinks.reduce((b,s)=>{const q=Math.hypot(s.x-CE.x,s.z-CE.z);return !b||q<b.d?{s,d:q}:b;},null);
 if(!sink||sink.d>30)throw new Error('CAVE: no sink under the cenote (world '+S.world+')');
 /* the shafts: the cenote's sink ended at its floor, the others choked under the ground; neither opens a well (kind 'choke') */
 const shafts=N.shafts.map(s=>{if(s.kind!=='sink')return s;const top=s.sink===sink.s.id?CE.floor+1:S.ground(s.c[0],s.c[1])-S.choke;
  return Object.assign({},s,{kind:'choke',y1:Math.max(s.y0+1,top),cenote:s.sink===sink.s.id});});
 const N2=Object.assign({},N,{shafts,dolines:[]});
 const C=KCAVERN.create({ground:S.ground,cell:S.cell,chunk:S.chunk,seed:S.world});
 KKARST.build(C,N2,{rock:'limestone'});
 /* the cenote: a bell from its floor (under the water) to a crown under the rim, and a throat from the crown up through the ground to its rim */
 const H=CE.rim-CE.floor,hall={id:'cenote',owner:'nwbay-caves',c:[CE.x,CE.floor,CE.z],rx:CE.r*CE.e*(1+CE.bell),rz:CE.r/CE.e*(1+CE.bell),h:H*.72,belly:.3,
  throat:{r0:CE.r*.82,r1:CE.r,top:CE.rim+3,blend:6},rock:'limestone'};
 C.hall(hall);C.opening({id:'cenote:well',c:[CE.x,CE.z],r:CE.r*CE.e,rim:3,kind:'well'});
 C.build();
 const level=S.water.level,box=S.net.box;
 // ---------------------------------------------------------------- the dress (KSPELEO.LIMESTONE, from the passages' height and under the bell)
 const tag=(L,pre)=>L.map(r=>Object.assign(r,{id:pre+':'+r.id}));
 const inCenote=(x,z,pad)=>Math.hypot((x-CE.x)/(hall.rx+pad),(z-CE.z)/(hall.rz+pad))<=1;
 const dress=tag(KSPELEO.place(C,{box,y:S.dress.y,cell:S.dress.cell,world:S.world,kinds:KSPELEO.LIMESTONE,accept:r=>!inCenote(r.x,r.z,2)}),'cave')
  .concat(tag(KSPELEO.place(C,{box:[CE.x-hall.rx,CE.z-hall.rz,CE.x+hall.rx,CE.z+hall.rz],y:S.dress.cenoteY,cell:S.dress.cell*.75,world:S.world+1,kinds:KSPELEO.LIMESTONE,
   accept:r=>inCenote(r.x,r.z,0)&&(r.kind==='stalagmite'||r.y<level-1)}),'cenote'));   /* under the bell: nothing grows over the water but a stalagmite's foot */
 // ---------------------------------------------------------------- the hazards
 const hazards=KKARST.hazards(N2).map(z=>Object.assign({name:z.tags.hazard.kind==='drown'?'Drowned passage (for air-breathers; the Hykkousoi\'s road)':'A choked shaft: a fall'},z,
  {tags:Object.assign({},z.tags,z.tags.hazard.kind==='drown'?{breathers:'air'}:{})}));
 hazards.push({id:'cenote:fall',name:'The cenote: a fall from the rim to the water ('+Math.round(CE.rim-level)+' m)',at:[CE.x,level,CE.z],r:CE.r*CE.e,h:CE.rim-level,
  tags:{hazard:{kind:'fall',shape:{type:'cyl',r:CE.r*CE.e,h:CE.rim-level}}}});
 const W=KKARST.water(N2);
 return {N,N2,M,C,box,centre:[CE.x,CE.z],cenote:Object.assign({},CE,{hall,sink:sink.s.id,sinkD:Math.round(sink.d)}),shafts,dress,hazards,
  water:{level,sumps:W.sumps.length,pools:W.pools.length,spring:N.spring},
  export:()=>({format:'krator-nwbay-cave',version:1,site:{frame:'nwbay',cenote:CE,ground:S.groundRaster},karst:N2,cavern:C.export(),speleo:KSPELEO.export(dress),
   hazards:hazards.map(z=>({id:z.id,at:z.at,tags:z.tags})),water:{level}})};
})(SITE);
