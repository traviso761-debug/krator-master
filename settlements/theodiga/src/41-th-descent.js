/* ================================================================= THEODIGA TODAY: the ways down from the rim (records; draws nothing)
   [G data] T-town-3 (PLAN.md): the three ways from the town on the east rim down into the canyon, in the dam's frame:
     THE STAIR OF DESCENT  the pilgrims' stair from Gate Square (440 m) to the dam's crest (400 m): flights on the west face
                           of a masonry stair-block built on the crest's east end against the cliff;
     THE SALVAGE ROAD      from its head on the plateau (downstream, +z) down the east canyon wall to the canyon floor, where
                           the salvagers' yards take what the Dome let fall;
     THE SILT ROAD         from its head (upstream, -z) down the east wall to the silt flats the drawn-down lake left, or to a
                           landing at the water where the silt is under it.
   All three are one thing: a CLIFF PATH of switchback legs on a wall, in two lanes so that two legs never lie on top of each
   other (the inner lane against the wall, the outer one beside it), with a landing across both lanes at each turn. A leg's
   lane hugs the wall where it is drawn: o.face(z, y) gives the wall's x at (z, y) (the rock is at larger x: the east wall).
   The road is cut 1 m into the rock and carried on a body of masonry 3 m deep (the inner lane's tied into the rock; the outer
   lane's on corbels to the inner lane's wall, none within 16 m of a landing, where the leg below passes under).

   TH_DESCENT.path(o) -> {legs, segs, landings, grade, length, drop, name}
     o.face(z, y)      the wall's x (drawn surface)
     o.start           {z, y}: where the path leaves the rim (or the top landing)
     o.turns           [zFirst, zOther]: the two turning places; the first leg runs from start.z to zFirst
     o.end             {z, y(z)}: the last leg ends at z, at the height y(z) gives (the floor, the bed, the crest)
     o.gMax            the steepest grade (rise over run); the fewest legs that keep to it are taken
     o.w, o.gap        a lane's width and the gap between the lanes; o.cut how far the inner lane is cut into the wall
     o.step            the segment length along a leg (m)
   A seg is {leg, lane, a:[x,y,z], b:[x,y,z], w, inX}: a run of road from a to b (its centre line), inX the wall's x behind it.
   A landing is {z, y, x0, x1, z0, z1}: the turn's platform across both lanes.

   TH_DESCENT.make(o) -> {stair, salvage, silt}: the three for Theodiga, from the page's wall and grounds:
     o.face(z, y), o.rim (the plateau's height, x, z), o.floor(x, z) (the canyon floor downstream), o.bed(x, z) (the silt), o.WL
     (the lake), o.crest {x, z0, z1, y}: the crest's east end. */
var TH_DESCENT=(function(){
 const clamp=(v,a,b)=>v<a?a:v>b?b:v;
 function path(o){
  const w=o.w==null?4:o.w,gap=o.gap==null?.6:o.gap,cut=o.cut==null?1:o.cut,step=o.step==null?6:o.step,gMax=o.gMax==null?.15:o.gMax;
  const T=o.turns,z0=o.start.z,y0=o.start.y,zE=o.end.z;
  /* the legs for n turns: start -> T[0] -> T[1] -> T[0] ... -> the last turn -> zE; the last leg must run toward zE */
  const plan=n=>{const zs=[z0];for(let i=0;i<n;i++)zs.push(T[i%2]);zs.push(zE);let L=0;for(let i=1;i<zs.length;i++)L+=Math.abs(zs[i]-zs[i-1]);return {zs,L};};
  let P=null;
  /* with turns, the end must lie between the two turning places (so the last leg runs back from its turn and stops short
     of the other, as every leg before it) */
  const between=zE>=Math.min(T[0],T[1])&&zE<=Math.max(T[0],T[1]);
  for(let n=0;n<40;n++){if(n>0&&!between)break;const p=plan(n);
   const yE=o.end.y(zE),g=(y0-yE)/p.L;if(g<=gMax){P=Object.assign(p,{g,yE});break;}}
  if(!P)throw new Error('TH_DESCENT: no path for '+(o.name||'?')+' under grade '+gMax);
  /* the wall a lane is set from: the wall where it is, but within BLEND m of a turn the turn's own wall (the nearest the rock
     comes at the landing), blended in, so the two lanes meeting at a landing stand w + gap apart however the wall wanders with
     height (they are at different heights there) */
  /* HOLD: the turn's wall is kept while the two legs meeting there are nearer than o.clear (road and body) in height, that is
     within (clear + 1) / (2 grade) of the turn; then it blends to the run's own wall over BLEND m */
  const clear=o.clear==null?3.5:o.clear,HOLD=(clear+1)/(2*Math.max(P.g,1e-3)),BLEND=10,turnRef=[];
  /* a turn's wall: the nearest the rock comes over the held stretch, at both legs' heights there and their bodies' feet, so a
     held lane is never deeper in the rock than its cut (where the rock falls back, the body fills to it) */
  {let yy=y0;for(let i=1;i<P.zs.length;i++){yy-=P.g*Math.abs(P.zs[i]-P.zs[i-1]);if(i>=P.zs.length-1){turnRef.push(null);continue;}
   const zt=P.zs[i],back=Math.sign(P.zs[i-1]-zt)||1;let m=1e9;
   for(let d=0;d<=HOLD+BLEND;d+=2)for(const dy of [P.g*d,-P.g*d])for(const h of [0,-3])m=Math.min(m,o.face(zt+back*d,yy+dy+h));
   turnRef.push(m);}}
  const wallX=(i,z,y)=>{const f=o.face(z,y);let best=null,bd=1e9;
   for(const j of [i-2,i-1]){if(j<0||turnRef[j]==null)continue;const d=Math.abs(z-P.zs[j+1]);if(d<bd){bd=d;best=turnRef[j];}}
   if(best==null||bd>=HOLD+BLEND)return f;if(bd<=HOLD)return best;const t=(bd-HOLD)/BLEND;return best+(f-best)*t*t*(3-2*t);};
  const xOf=(lane,f)=>lane===0?f+cut-w/2:f+cut-w-gap-w/2;
  const legs=[],segs=[],landings=[];let y=y0;
  for(let i=1;i<P.zs.length;i++){const za=P.zs[i-1],zb=P.zs[i],len=Math.abs(zb-za),n=Math.max(1,Math.ceil(len/step)),lane=(i-1)%2,dir=Math.sign(zb-za)||1,ya=y,yb=y-P.g*len;
   legs.push({i:i-1,lane,z0:za,z1:zb,y0:ya,y1:yb});
   for(let k=0;k<n;k++){const t0=k/n,t1=(k+1)/n,za_=za+(zb-za)*t0,zb_=za+(zb-za)*t1,ya_=ya+(yb-ya)*t0,yb_=ya+(yb-ya)*t1;
    /* the wall behind the run: the nearest the rock comes at either end, at the road and at its body's foot */
    const inX=Math.min(o.face(za_,ya_),o.face(zb_,yb_),o.face(za_,ya_-3),o.face(zb_,yb_-3));
    const near=Math.min(Math.abs(za_-za),Math.abs(zb_-za),Math.abs(za_-zb),Math.abs(zb_-zb));
    const fa=wallX(i,za_,ya_),fb=wallX(i,zb_,yb_);
    segs.push({leg:i-1,lane,a:[xOf(lane,fa),ya_,za_],b:[xOf(lane,fb),yb_,zb_],w,inX,wall:[fa,fb],dir,corbel:lane===1&&near>16});}
   if(i<P.zs.length-1){const xi=o.face(zb,yb),pad=w+1;
    landings.push({z:zb,y:yb,x0:xi+cut-2*w-gap,x1:Math.min(xi,o.face(zb,yb-3))+cut,z0:zb-(dir>0?pad:-1),z1:zb+(dir>0?1:pad),w:2*w+gap});
    const L=landings[landings.length-1];if(L.z0>L.z1){const t=L.z0;L.z0=L.z1;L.z1=t;}}
   y=yb;}
  return {name:o.name,legs,segs,landings,grade:P.g,length:P.L,drop:y0-P.yE,yEnd:P.yE,held:HOLD+BLEND};}
 /* the three for Theodiga (PLAN.md section T-town-3); every number in the dam's frame */
 function make(o){
  const C=o.crest,F=o.face;
  /* THE STAIR OF DESCENT: the stair-block's west face is a plane at C.x (the crest's east end), from C.z0 to C.z1; its
     flights at the grade of a stair (a 0.2 m riser on a 0.4 m tread), from the block's top (the rim's height) to the crest */
  const blockFace=(z,y)=>C.x;
  const stair=path({name:'the Stair of Descent',face:blockFace,start:{z:C.z0+2,y:o.rimY},turns:[C.z1-2,C.z0+2],end:{z:C.z0+6,y:()=>C.y},
   gMax:.5,w:2.6,gap:.4,cut:0,step:.4});
  /* the block: from the crest's end east into the cliff (3 m past the farthest the drawn wall falls back over its height),
     its top the rim's height, its foot 40 m down the abutment (inside the dam where the dam is) */
  let back=C.x+20;for(let z=C.z0-1;z<=C.z1+1;z+=2)for(let y=C.y-40;y<=o.rimY;y+=4)back=Math.max(back,F(z,y)+3);
  stair.block={x0:C.x,x1:back,z0:C.z0-1,z1:C.z1+1,y0:C.y-40,y1:o.rimY};
  /* THE SALVAGE ROAD: downstream, between the dam's toe (z 210) and the page's end of the canyon (z 570), to the floor */
  const H=o.heads;
  const salvage=path({name:'the Salvage Road',face:F,start:{z:H.salvage.z,y:o.rim(H.salvage.z)},turns:[570,210],
   end:{z:390,y:z=>o.floor(F(z,2)-3,z)+.4},gMax:.15,w:4,gap:.6,cut:1,step:6});
  /* THE SILT ROAD: upstream, between the stair-block's lee (z -130) and z -580, to the silt or to the water */
  const silt=path({name:'the Silt Road',face:F,start:{z:H.silt.z,y:o.rim(H.silt.z)},turns:[-580,-130],
   end:{z:-160,y:z=>Math.max(o.bed(F(z,o.WL+2)-4,z)+.4,o.WL+1.2)},gMax:.15,w:4,gap:.6,cut:1,step:6});
  silt.landingAtWater=silt.yEnd<=o.WL+1.21;
  /* the way from each head on the plateau to the top of its road, along the ground */
  for(const [P,h] of [[salvage,H.salvage],[silt,H.silt]])P.lead={a:[h.x,h.z],b:[F(h.z,o.rim(h.z))+1-2,h.z]};
  return {stair,salvage,silt};}
 return {path,make};
})();
