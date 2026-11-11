// ================================================================= HOST — the station's hazards (core/hazard: records core/tags holds, KHAZ reads)
// What can hurt a walker at the Gate, as records registered before anything reads them (core/hazard/20-core-hazard.js; copperglacier's crevasses
// are the pattern). Each is BIO.record({..., tags:{hazard}}): the inspector's hazard layer, KHAZ.at and the Godot export read the same records.
//   FALL    every stack's and knob's top rim (its outline at the top, a 6 m band inside the edge: the shape's `edge`), the broken bridges' torn
//           ends, the Hall's fallen sector (the upper slab's open edge over face 2) and its sheared column's rim
//   SLIP    the Kimr's rope bridge (B6 in the ruin): it sways, it does not hold a misstep
//   DROWN   the reflecting pond (4 m deep) and the Gowd Warra's channel
// PLAN.md section 7, amendment 2 (a charge: a herd that runs, a Two-Snout's dropped rock) waits for kits/fauna's herds.
const HAZARDS=(function(){const out=[],add=o=>{BIO.record(o);out.push(o);return o;};
 /* a rim is a band, not the whole top (a walker may cross a mesa's middle): 12 boxes 6 m deep along the top outline's chords, each pulled
    3 m inside the edge, so KHAZ.at answers "fall" within 6 m of the drop and nothing in the middle */
 const rim=(S,y0,name,id)=>{const N=12,r=KSTACKS.ring(S,S.top-.5,N*4);if(!r)return;const cx=r.reduce((s,p)=>s+p[0],0)/r.length,cz=r.reduce((s,p)=>s+p[1],0)/r.length;
  for(let i=0;i<N;i++){const a=r[i*4],b=r[((i+1)*4)%r.length],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,L=Math.hypot(b[0]-a[0],b[1]-a[1]),ox=cx-mx,oz=cz-mz,ol=Math.hypot(ox,oz)||1;
   add({name:name+': the drop from its rim ('+Math.round(S.top-S.y0)+' m)',key:id+'.'+i,x:mx+ox/ol*3,z:mz+oz/ol*3,y:y0+S.top-3,r:L/2+3,h:6,ry:Math.atan2(b[0]-a[0],b[1]-a[1]),
    tags:{hazard:{kind:'fall',danger:.95,shape:{type:'box',w:6,d:L+1,y0:0,y1:6},falloff:'linear'}}});}};
 for(const S of STACKS)rim(S,LEVEL,S.name.replace(/^the /,'The '),'gate.hazard.rim.'+S.key);
 KNOBS.forEach((S,i)=>rim(S,0,'A knob of the chaos','gate.hazard.rim.knob.'+i));
 // the bridges: a torn end is a drop to the floor; the rope bridge a slip
 const RU=GATE.decay>0?GATESTACKS.ruin(GATE.plan):null;
 if(RU){for(const b of GATE.plan.bridges){const ax=b.a.x,az=b.a.z,dx=b.b.x-ax,dz=b.b.z-az,L=Math.hypot(dx,dz),ux=dx/L,uz=dz/L,ry=Math.atan2(ux,uz);
   const brk=RU.broken.find(r=>r.id===b.id),cut=RU.cut.find(r=>r.id===b.id),rope=RU.rope.find(r=>r.id===b.id);
   const ends=brk?[brk.gap[0],brk.gap[1]]:cut?[cut.from==='b'?1-cut.keep:cut.keep]:[];
   ends.forEach((t,i)=>add({name:'Bridge '+b.key+': its torn end ('+Math.round(b.y)+' m over the floor)',key:b.id+'.end.'+i,x:ax+ux*L*t,z:az+uz*L*t,y:LEVEL+b.y-2,r:b.w,h:6,
    tags:{hazard:{kind:'fall',danger:1,shape:{type:'box',w:b.w+2,d:10,y0:0,y1:6},falloff:'linear'}},ry:ry}));
   if(rope)add({name:'Bridge '+b.key+': the Kimr\'s rope bridge (it sways)',key:b.id+'.rope',x:ax+dx/2,z:az+dz/2,y:LEVEL+b.y-8,r:L/2,h:12,
    tags:{hazard:{kind:'slip',danger:.6,shape:{type:'box',w:4,d:L,y0:0,y1:12},falloff:'none',move:{slip:.4}}},ry:ry});}
  // the Hall's open edges: the fallen sector of the upper slab (face 2, its two broken radii) and the sheared column's rim
  const D=HALL.dim,hi=D.SLABS[1];for(const k of [2,3]){const a=k*Math.PI/3,rm=(D.WELL+hi.ro)/2;
   add({name:'The Hall of Heroes: the upper topography\'s broken edge',key:'gate.hazard.slab.'+k,x:Math.cos(a)*rm,z:Math.sin(a)*rm,y:LEVEL+hi.y1-2,r:(hi.ro-D.WELL)/2,h:6,
    tags:{hazard:{kind:'fall',danger:1,shape:{type:'box',w:6,d:hi.ro-D.WELL,y0:0,y1:6},falloff:'linear'}},ry:-a+Math.PI/2});}
  {const c=HALL.cols[3],y=GATEARC.ruin(HALL).sheared[0].y;add({name:'The Hall of Heroes: the sheared column\'s rim',key:'gate.hazard.col.3',x:c.x,z:c.z,y:LEVEL+y-2,r:c.r,h:6,
   tags:{hazard:{kind:'fall',danger:1,shape:{type:'cyl',r:c.r,y0:0,y1:6,edge:4},falloff:'smooth'}}});}}
 // the water
 {const pts=[];for(let k=0;k<32;k++){const a=k/32*TAU;pts.push([Math.cos(a)*PONDD.a,Math.sin(a)*PONDD.b]);}
  add({name:'The reflecting pond (4 m deep)',key:'gate.hazard.pond',x:0,z:0,y:LEVEL-4,r:PONDD.a,h:4.5,tags:{hazard:{kind:'drown',danger:.6,shape:{type:'poly',pts,y0:0,y1:4.5,edge:12},falloff:'smooth'}}});}
 RIVER.lines.forEach((P,i)=>{for(let j=0;j+8<P.length;j+=8){const a=P[j],b=P[j+8],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,L=Math.hypot(b[0]-a[0],b[1]-a[1]);
  add({name:RIVER.name+' (its channel)',key:'gate.hazard.river.'+i+'.'+j,x:mx,z:mz,y:Math.min(a[2],b[2])-RIVER.depth,r:L/2,h:RIVER.depth+.5,ry:Math.atan2(b[0]-a[0],b[1]-a[1]),
   tags:{hazard:{kind:'drown',danger:.45,shape:{type:'box',w:2*RIVER.hw,d:L+2,y0:0,y1:RIVER.depth+.5},falloff:'linear'}}});}});
 return out;})();
window._hazards={n:HAZARDS.length,kinds:HAZARDS.reduce((o,h)=>(o[h.tags.hazard.kind]=(o[h.tags.hazard.kind]||0)+1,o),{})};
