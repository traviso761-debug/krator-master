// ================================================================= ATMOS — fx: branched lightning and delayed thunder
// [G data] + [web] (WEATHER-RESEARCH.md item 8). 4-weather's storm strikes a single jagged ribbon; with this file listed, each
// strike is a BRANCHED bolt by seeded midpoint displacement (its own stream per strike: the same storm draws the same bolts
// in every engine), a flash of the cloud above it, and a THUNDER event delayed by the distance at the speed of sound.
//   ATMOS.boltPath(seed, from[x,y,z], to[x,y,z], o) -> [{a:[x,y,z], b:[x,y,z], w, level}]   [G data], pure: the segments, the main
//                       channel (level 0) subdivided o.depth times (default 6), offsets o.rough (default .2) of each segment's
//                       length, branches forking off with o.fork (default .32) a level, each thinner and shorter
//   ATMOS.thunderDelay(dist) -> seconds (dist / 343)
//   ATMOS.thunder       the pending events [{at (module clock s), dist, power}]; ATMOS.onThunder(fn(ev)): fn is called when
//                       one is due (the host plays its sound: power 1 near, falling with distance; a far one rumbles)
//   PRESETS.lightning   {depth, rough, fork, width (m at the base of the main channel), colour, ashColour, cloud}
// The bolt is drawn as camera-facing ribbons (one mesh, rebuilt at each strike: under 1k triangles), additive, at the
// weather's flash. Recorded as {type:'lightning'} for the export. Godot: an ImmediateMesh from the same segments and an
// OmniLight3D pulse at the cloud; the thunder an AudioStreamPlayer3D started at the event (GODOT.md, "Lightning").
(function(){const A=ATMOS;
 A.PRESETS.lightning=A.PRESETS.lightning||{depth:6,rough:.2,fork:.32,width:2.6,colour:0xe8ecff,ashColour:0xffc8a0,cloud:.9};
 A.thunderDelay=d=>d/343;
 // THE PATH: [G data], pure. A strike's own stream (mulberry32 on the seed): never the module's placement stream
 A.boltPath=(seed,from,to,o)=>{o=o||{};const P=A.PRESETS.lightning,depth=o.depth==null?P.depth:o.depth,rough=o.rough==null?P.rough:o.rough,fork=o.fork==null?P.fork:o.fork,rnd=A.stream(seed);
  const out=[];
  const chan=(a,b,w,level,dep)=>{let pts=[a,b];for(let d=0;d<dep;d++){const nx=[pts[0]];for(let i=0;i<pts.length-1;i++){const p=pts[i],q=pts[i+1],L=Math.hypot(q[0]-p[0],q[1]-p[1],q[2]-p[2]),s=L*rough;
     nx.push([(p[0]+q[0])/2+(rnd()-.5)*2*s,(p[1]+q[1])/2+(rnd()-.5)*s,(p[2]+q[2])/2+(rnd()-.5)*2*s],q);}pts=nx;}
   for(let i=0;i<pts.length-1;i++){const t=i/(pts.length-1);out.push({a:pts[i],b:pts[i+1],w:w*(1-.55*t),level});
    if(level<3&&i>0&&rnd()<fork*Math.pow(.6,level)*(pts.length>8?.35:1)){const p=pts[i],q=pts[i+1],dir=[q[0]-p[0],q[1]-p[1],q[2]-p[2]],len=Math.hypot(...dir)*(pts.length-1-i)*(.25+.35*rnd());
     const ang=(rnd()-.5)*2.2,c=Math.cos(ang),s=Math.sin(ang),dx=dir[0]*c-dir[2]*s,dz=dir[0]*s+dir[2]*c,dl=Math.hypot(dx,dir[1],dz)||1;
     chan(p,[p[0]+dx/dl*len,p[1]+dir[1]/dl*len*(.6+.4*rnd()),p[2]+dz/dl*len],w*.45,level+1,Math.max(2,dep-2));}}};
  chan(from,to,o.width==null?P.width:o.width,0,depth);return out;};
 A.thunder=[];const TL=[];A.onThunder=fn=>{TL.push(fn);return fn;};
 A.onInit.push(()=>{const T=A.T,P=A.PRESETS.lightning;let n=0;
  const geo=new T.BufferGeometry(),mat=new T.MeshBasicMaterial({color:P.colour,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false,side:T.DoubleSide});
  const mesh=new T.Mesh(geo,mat);mesh.frustumCulled=false;mesh.visible=false;mesh.name='atmos:lightning';A.add(mesh);A.noRay(mesh);
  // the cloud lit from inside: a soft additive glow over the strike
  const cm=new T.SpriteMaterial({color:P.colour,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,fog:false});const cloud=new T.Sprite(cm);cloud.visible=false;cloud.name='atmos:lightning-cloud';A.add(cloud);A.noRay(cloud);
  A.boltFx=s=>{n++;const cam=A.h.camera.position,segs=A.boltPath((A.h.seed||1)*7919+n*104729,[s.x,s.top,s.z],[s.x,s.base,s.z]);
   const pos=new Float32Array(segs.length*12),idx=[];segs.forEach((g,i)=>{const mx=(g.a[0]+g.b[0])/2-cam.x,mz=(g.a[2]+g.b[2])/2-cam.z,ml=Math.hypot(mx,mz)||1,sx=-mz/ml*g.w,sz=mx/ml*g.w;
    pos.set([g.a[0]-sx,g.a[1],g.a[2]-sz,g.a[0]+sx,g.a[1],g.a[2]+sz,g.b[0]-sx,g.b[1],g.b[2]-sz,g.b[0]+sx,g.b[1],g.b[2]+sz],i*12);const q=i*4;idx.push(q,q+1,q+2,q+1,q+3,q+2);});
   geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setIndex(idx);geo.computeBoundingSphere();
   mat.color.setHex(s.ash?P.ashColour:P.colour);cm.color.setHex(s.ash?P.ashColour:P.colour);cloud.position.set(s.x,s.top+20,s.z);cloud.scale.setScalar(s.dist*.5);
   A.thunder.push({at:s.t+A.thunderDelay(s.dist),dist:s.dist,power:Math.min(1,600/Math.max(1,s.dist))});A.stats.lightning=segs.length;};
  A.hook(t=>{const W=A.W,fl=W?W.flash||0:0;mesh.visible=fl>.01;mat.opacity=Math.min(1,fl*1.5);cloud.visible=fl>.01;cm.opacity=Math.min(1,fl*P.cloud);
   for(let i=A.thunder.length-1;i>=0;i--){const e=A.thunder[i];if(t>=e.at){A.thunder.splice(i,1);for(const fn of TL){try{fn(e);}catch(x){A.err('thunder: '+x.message);}}}}});
  A.rec('lightning',{preset:'lightning',note:'each strike: boltPath(seed, cloud, ground) segments (midpoint displacement with forks); thunder at strike + dist/343 s'});});
})();
