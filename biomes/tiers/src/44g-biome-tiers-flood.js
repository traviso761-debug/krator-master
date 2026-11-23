// ================================================================= THE TIERS — the gorge flood: a flash flood on a cycle, as hazard records  [G data]
// PLAN.md section 10, item 4 (the shared hazard amendment; the Outland Gate plan's amendment 2): kit work first, on what core/hazard already
// carries, so a core lift is a move, not a rewrite. A storm on the treads above drains into a canyon or a dry gorge as a wall of brown water that
// runs down it, holds for a couple of minutes and drains; between storms the floor is dry (or its stream as it was).
//   TIERS_FLOOD(o) -> {id, name, line, L, front, depth, records, at(s), k(rec, t)}: the channel cut into SEGMENTS (o.seg m each) along its line,
//     each a core/hazard record: kind 'drown', a poly over the channel's floor (its half-width w(s)), a band from the floor to depth + 1 m, a
//     CYCLE {period, warn, ramp, on, after} whose phase is AUTHORED (cycle.offset) so the front passes each segment s / front seconds after the
//     head's (a travelling wave, not segments flashing at random), and a MOVE (core/hazard 21: the current) that slows a walker and pulls
//     him downstream (pull m/s toward the segment's downstream end).
//   o: {id, name, line [[x, z]...] downstream, floor (x, z) -> y (the channel's bed), w (half-width: a number or (s) -> m), depth (m of water at
//      the crest), seg (60), front (m/s: 3), period (900), warn (40), ramp (25), on (110), after (80), pull (1.6 m/s), tell}
//   The page's clock compresses the idle part (KHAZ.speed); the real cadence is the storms' (weeks), the page's a few minutes.
// Plain data: no THREE, no DOM; the drawing is the host's (89f-host-flood.js).
var TIERS_FLOOD=function(o){
 if(!o||!o.line||o.line.length<2)throw new Error('TIERS_FLOOD: a line of 2 or more points');
 const P=o.line,seg=o.seg==null?60:o.seg,front=o.front==null?3:o.front,depth=o.depth==null?2.5:o.depth,pull=o.pull==null?1.6:o.pull;
 const wOf=typeof o.w==='function'?o.w:(()=>o.w==null?12:o.w);
 const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));const L=cum[cum.length-1];
 /* the line at s: the point and its unit direction */
 function at(s){s=Math.max(0,Math.min(L,s));let i=0;while(i<P.length-2&&cum[i+1]<s)i++;const l=cum[i+1]-cum[i]||1,u=(s-cum[i])/l,dx=(P[i+1][0]-P[i][0])/l,dz=(P[i+1][1]-P[i][1])/l;
  return{x:P[i][0]+(P[i+1][0]-P[i][0])*u,z:P[i][1]+(P[i+1][1]-P[i][1])*u,dx,dz};}
 const C={period:o.period==null?900:o.period,warn:o.warn==null?40:o.warn,ramp:o.ramp==null?25:o.ramp,on:o.on==null?110:o.on,after:o.after==null?80:o.after,afterK:.25};
 const n=Math.max(1,Math.round(L/seg)),records=[];
 for(let k=0;k<n;k++){const s0=L*k/n,s1=L*(k+1)/n,sm=(s0+s1)/2,c=at(sm),a=at(s0),b=at(s1),w0=wOf(s0),w1=wOf(s1);
  /* the segment's quad over the floor, relative to its middle (the record's footprint); its bed the lowest of its ends and middle */
  const pts=[[a.x-a.dz*w0,a.z+a.dx*w0],[b.x-b.dz*w1,b.z+b.dx*w1],[b.x+b.dz*w1,b.z-b.dx*w1],[a.x+a.dz*w0,a.z-a.dx*w0]].map(q=>[q[0]-c.x,q[1]-c.z]);
  const y=Math.min(o.floor(a.x,a.z),o.floor(c.x,c.z),o.floor(b.x,b.z))-.3;
  records.push({name:(o.name||'A flash flood')+' (segment '+(k+1)+' of '+n+')',kind:'drown',x:c.x,z:c.z,y,r:Math.max(...pts.map(q=>Math.hypot(q[0],q[1]))),h:depth+1,danger:.8,
   shape:{type:'poly',pts,y0:0,y1:depth+1},
   cycle:Object.assign({offset:-sm/front},C),
   move:{speed:.3,slip:.35,pull,to:[b.x-c.x,0,b.z-c.z]},
   tell:o.tell||{sign:'a roar up the gorge, the stream turning brown, wrack and drift lines high on the walls',colour:'#7a5a3a'},
   flood:{id:o.id,i:k,s0,s1,depth,bed:y+.3}});}
 /* the water's ribbons for the host to draw: per segment, pairs across the channel every ~8 m, both at the bed under the line's centre (the
    channel's lowest: a bank's height would lift the water up a wall where the channel narrows) */
 const ribbons=records.map(R=>{const F=R.flood,m=Math.max(1,Math.round((F.s1-F.s0)/8)),out=[];
  for(let j=0;j<=m;j++){const s=F.s0+(F.s1-F.s0)*j/m,p=at(s),w=wOf(s),yc=o.floor(p.x,p.z);for(const sd of [-1,1])out.push([p.x-p.dz*w*sd,p.z+p.dx*w*sd,yc]);}return out;});
 return{id:o.id,name:o.name,line:P,L,front,depth,records,ribbons,at,cycle:C,
  /* the time (s, in [0, the cycle's length)) a segment's warning starts: its offset's phase; the front's arrival downstream */
  startOf(k,speed){const c=C,L2=c.warn+2*c.ramp+c.on+c.after+(c.period-c.warn-2*c.ramp-c.on-c.after)/(speed>0?speed:1),off=this.records[k].cycle.offset;let u=-off%L2;if(u<0)u+=L2;return u;}};};
