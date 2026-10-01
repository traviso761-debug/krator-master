// ---------- how people get round the park up top ----------
// The map gives the paths: the Rim Trail round the apron, the three overlook trails in from the plain, the
// footways from the parking, the visitor center, the monorail terminal, the works platform, the amphitheatre
// and each headframe (tools/make-fleshpit.py). This builds what stands on them and what runs along them:
//
//   the overlook decks    where each overlook trail meets the rim, a deck ramps up over the collar and out
//                         past the lip, railed, with benches and coin viewers at the end - the one place you
//                         could look straight down the throat
//   the lift entrances    at each headframe, a canopy over the entrance walk, a ticket booth, and switchback
//                         queue rails, because the lifts were the only way down and there was always a line
//   the trail furniture   lamp posts, benches facing the hole, and bins, the whole way round the Rim Trail
//   the trams             two park trams, a tractor and two open cars each, running round the Rim Loop Road
//                         and stopping at the shelters where the footways meet it
//
// and it hands visitors.js the walks: every path as a polyline, and where people stand, look and queue.
// Everything sits on the ground as it is after the building pads were graded (see make-fleshpit.py).
export function promenade(api){
  const {THREE,C,ctx,scene,animHooks,groundH,mergeParts,ROADS,nightF,hour}=api;
  const gh=groundH;
  const orif=(C.landmarks||[]).find(l=>l.model==='orifice');
  const RR=(orif&&orif.rim)||266;                            // the rail round the lip
  const RIM=RR-6,TRAIL_R=RIM+62;
  const roads=ROADS||[];
  const byName=n=>roads.find(r=>r.name===n);
  const G=new THREE.Group();scene.add(G);
  const box=(x,y,z,w,h,d,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),m);b.position.set(x,y,z);return b;};
  const polar=(a,r)=>[Math.cos(a)*r,Math.sin(a)*r];
  const UP=new THREE.Vector3(0,1,0);
  function bar(a,b,w,m){const d=new THREE.Vector3().subVectors(b,a),len=d.length();
    const s=new THREE.Mesh(new THREE.BoxGeometry(w,len,w),m);s.position.copy(a).addScaledVector(d,0.5);
    s.quaternion.setFromUnitVectors(UP,d.normalize());return s;}

  const deckM=new THREE.MeshLambertMaterial({color:0xa89c88});
  const steelM=new THREE.MeshLambertMaterial({color:0x8a9096});
  const brownM=new THREE.MeshLambertMaterial({color:0x6a5040});
  const canvasM=new THREE.MeshLambertMaterial({color:0xc8a868,side:THREE.DoubleSide});
  const benchM=new THREE.MeshLambertMaterial({color:0x7a5c3e});
  const binM=new THREE.MeshLambertMaterial({color:0x3e4a3a});
  const lampM=new THREE.MeshBasicMaterial({color:0xffd9a0});
  const glassM=new THREE.MeshLambertMaterial({color:0x9ab0b8,transparent:true,opacity:0.45});
  const parts={deck:[],steel:[],brown:[],canvas:[],bench:[],bin:[],lamp:[],glass:[]};
  const walks=[],looks=[],queues=[];

  // ---- the overlook decks ----
  // Level with the top of the collar, reached by a ramp off the trail, out to a few metres past the lip.
  const collarTop=a=>{const [x,z]=polar(a,RIM+6);return gh(x,z)+4.2;};
  for(const [a,name] of [[0.35,'North Overlook'],[2.5,'West Overlook'],[4.4,'South Overlook']]){
    const y=collarTop(a)+0.5,rOut=TRAIL_R-4,rRamp=RIM+34,rEnd=RIM-14,W=14;
    const ux=Math.cos(a),uz=Math.sin(a),tx=-uz,tz=ux;
    const at=(r,s,h)=>new THREE.Vector3(ux*r+tx*s,h,uz*r+tz*s);
    // the ramp, from the trail up to the deck
    const g0=gh(ux*rOut,uz*rOut);
    for(let r=rOut;r>rRamp;r-=3){const u=(rOut-r)/(rOut-rRamp),h=g0+0.2+(y-g0-0.2)*u;
      const s=box(ux*(r-1.5),h-0.5,uz*(r-1.5),3.2,0.5,W*0.55,deckM);s.rotation.y=-a;parts.deck.push(s);}
    // the deck: slabs from the top of the ramp out over the lip
    for(let r=rRamp;r>rEnd;r-=4){const s=box(ux*(r-2),y-0.5,uz*(r-2),4,0.5,W,deckM);s.rotation.y=-a;parts.deck.push(s);}
    // posts down to the ground (or down the funnel, past the lip)
    for(let r=rRamp;r>rEnd;r-=8)for(const sd of [-1,1]){const p=at(r,sd*(W/2-0.6),0),gy=gh(p.x,p.z);
      if(y-gy>0.8)parts.steel.push(box(p.x,gy,p.z,0.5,y-gy-0.5,0.5,steelM));}
    // the rails, both sides and across the end
    for(const sd of [-1,1]){const a0=at(rRamp,sd*W/2,y+1.1),a1=at(rEnd,sd*W/2,y+1.1);parts.steel.push(bar(a0,a1,0.12,steelM));
      for(let r=rRamp;r>=rEnd;r-=3){const p=at(r,sd*W/2,y);parts.steel.push(box(p.x,p.y,p.z,0.14,1.1,0.14,steelM));}}
    parts.steel.push(bar(at(rEnd,-W/2,y+1.1),at(rEnd,W/2,y+1.1),0.12,steelM));
    for(let s=-W/2;s<=W/2;s+=2){const p=at(rEnd,s,y);parts.steel.push(box(p.x,p.y,p.z,0.14,1.1,0.14,steelM));}
    // benches, and two coin viewers at the end looking down
    for(const sd of [-1,1]){const p=at(rRamp-10,sd*(W/2-1.4),y);const b=box(p.x,p.y,p.z,3,0.45,0.6,benchM);b.rotation.y=-a;parts.bench.push(b);}
    for(const sd of [-0.35,0.35]){const p=at(rEnd+1.2,sd*W,y);
      parts.steel.push(box(p.x,p.y,p.z,0.2,1.2,0.2,steelM));
      const h=box(p.x,p.y+1.2,p.z,0.5,0.4,0.9,brownM);h.rotation.y=-a;parts.brown.push(h);}
    // who stands out there, facing the hole
    looks.push({name,x:ux*(rEnd+6),y,z:uz*(rEnd+6),spread:W*0.35,along:[ux,uz],reach:(rRamp-rEnd)*0.8,n:34,face:[0,0]});
    walks.push({pts:[[ux*rOut,g0+0.3,uz*rOut],[ux*rRamp,y,uz*rRamp],[ux*(rEnd+3),y,uz*(rEnd+3)]],n:10,fixed:true});
  }

  // ---- the lift entrances at the headframes ----
  for(let k=0;k<4;k++){
    const a=0.5+k*Math.PI/2,r0=RIM+47,ux=Math.cos(a),uz=Math.sin(a),tx=-uz,tz=ux;
    const at=(r,s)=>{const x=ux*r+tx*s,z=uz*r+tz*s;return new THREE.Vector3(x,gh(x,z),z);};
    // the canopy: a roof on six posts over the end of the entrance walk
    const c=at(r0+7,0);
    const roof=box(c.x,c.y+3.6,c.z,16,0.3,12,canvasM);roof.rotation.y=-a;parts.canvas.push(roof);
    for(const [dr,ds] of [[-6,-7],[-6,0],[-6,7],[6,-7],[6,0],[6,7]]){const p=at(r0+7+dr*0.8,ds*0.9);parts.brown.push(box(p.x,p.y,p.z,0.3,3.6,0.3,brownM));}
    // the ticket booth
    const bo=at(r0+2,-9);const booth=box(bo.x,bo.y,bo.z,3,2.8,2.4,brownM);booth.rotation.y=-a;parts.brown.push(booth);
    const win=box(bo.x-ux*1.25,bo.y+1.2,bo.z-uz*1.25,0.1,1,1.8,glassM);win.rotation.y=-a;parts.glass.push(win);
    // the queue: three lanes of rail, switching back
    const lanes=[];
    for(let q=0;q<4;q++){const s=-4.5+q*3;const p0=at(r0+2,s),p1=at(r0+13,s);
      parts.steel.push(bar(p0.clone().setY(p0.y+1),p1.clone().setY(p1.y+1),0.08,steelM));
      for(let r=r0+2;r<=r0+13;r+=2.75){const p=at(r,s);parts.steel.push(box(p.x,p.y,p.z,0.1,1,0.1,steelM));}}
    for(let q=0;q<3;q++){const s=-3+q*3,dir=q%2?-1:1;
      for(let u=0;u<=10;u++){const rr=dir>0?r0+2.5+u:r0+12.5-u;lanes.push([ux*rr+tx*s,uz*rr+tz*s]);}}
    queues.push({pts:lanes.map(([x,z])=>[x,gh(x,z),z]),n:26,face:[ux*RIM,uz*RIM],exit:[ux*(RIM+30),uz*(RIM+30)]});
  }

  // ---- the trail furniture ----
  const trail=byName('Rim Trail');
  if(trail){
    let acc=0,next=0,k=0;const pts=trail.pts;
    for(let i=0;i+1<pts.length;i++){
      const [ax,az]=pts[i],[bx,bz]=pts[i+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len;
      while(acc+len>=next){
        const s=next-acc,x=ax+ux*s,z=az+uz*s,a=Math.atan2(z,x),nx=Math.cos(a),nz=Math.sin(a);
        // lamps on the outside of the trail, benches on the inside looking at the hole, a bin every other bench
        const lx=x+nx*3,lz=z+nz*3,ly=gh(lx,lz);
        parts.steel.push(box(lx,ly,lz,0.2,4.2,0.2,steelM));parts.lamp.push(box(lx-nx*0.4,ly+4.1,lz-nz*0.4,0.9,0.25,0.5,lampM));
        if(k%2===0){const bx2=x-nx*3,bz2=z-nz*3,by=gh(bx2,bz2);const b=box(bx2,by,bz2,2.6,0.45,0.6,benchM);b.rotation.y=-a+Math.PI/2;parts.bench.push(b);
          const back=box(bx2+nx*0.3,by+0.45,bz2+nz*0.3,2.6,0.5,0.1,benchM);back.rotation.copy(b.rotation);parts.bench.push(back);
          if(k%4===0)parts.bin.push(box(bx2+Math.cos(a+1.57)*2.2,by,bz2+Math.sin(a+1.57)*2.2,0.6,0.9,0.6,binM));
          looks.push({x:bx2,y:by,z:bz2,spread:1.2,n:R3(k),face:[0,0],sit:true});}
        next+=26;k++;
      }
      acc+=len;
    }
  }
  function R3(k){return (k*7)%5<2?2:1;}

  // ---- the trams, and the shelters they stop at ----
  const loop=byName('Rim Loop Road');
  const trams=[];
  if(loop){
    const pts=loop.pts,cum=[0];for(let i=0;i+1<pts.length;i++)cum.push(cum[i]+Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]));
    const L=cum[cum.length-1];
    const posAt=s=>{s=((s%L)+L)%L;let i=0;while(i+1<cum.length-1&&cum[i+1]<s)i++;
      const u=(s-cum[i])/Math.max(1e-6,cum[i+1]-cum[i]),[ax,az]=pts[i],[bx,bz]=pts[i+1];
      const x=ax+(bx-ax)*u,z=az+(bz-az)*u,h=Math.atan2(bz-az,bx-ax);
      // keep to the outer lane
      const ox=Math.sin(h)*2.2,oz=-Math.cos(h)*2.2;return [x+ox,z+oz,h];};
    const bodyM=new THREE.MeshLambertMaterial({color:0x2e5a3a}),trimM=new THREE.MeshLambertMaterial({color:0xe8d8a8});
    for(let t=0;t<2;t++){
      const cars=[];
      for(let c=0;c<3;c++){
        const g=new THREE.Group();
        if(c===0){g.add(box(0,0.5,0,4.4,1.6,2.3,bodyM),box(-0.6,2.1,0,2.6,1.4,2.2,trimM),box(1.9,1.2,0,0.6,0.6,1.8,glassM));}
        else{g.add(box(0,0.5,0,6.4,0.9,2.4,bodyM));
          for(let r=0;r<4;r++)g.add(box(-2.4+r*1.6,1.4,0,0.5,0.5,2.2,benchM));
          g.add(box(0,3.1,0,6.6,0.15,2.6,trimM));for(const [dx,dz] of [[-3,-1.1],[3,-1.1],[-3,1.1],[3,1.1]])g.add(box(dx,1.4,dz,0.12,1.7,0.12,steelM));}
        G.add(g);cars.push(g);
      }
      trams.push({cars,s:t*L/2,v:5.5,dwell:0});
    }
    // shelters where the footways reach the loop road
    for(const a of [0.35,2.5,4.4,-0.72]){
      let best=0,bd=1e9;for(let i=0;i<pts.length;i++){const d=Math.abs(Math.atan2(pts[i][1],pts[i][0])-a);if(d<bd){bd=d;best=i;}}
      const [x,z]=pts[best],o=Math.hypot(x,z),sx=x/o*(o+7),sz=z/o*(o+7),sy=gh(sx,sz);
      const roof=box(sx,sy+2.8,sz,6,0.2,2.6,canvasM);roof.rotation.y=-Math.atan2(z,x)+Math.PI/2;parts.canvas.push(roof);
      const back=box(sx+x/o*1.2,sy,sz+z/o*1.2,6,2.8,0.12,glassM);back.rotation.y=-Math.atan2(z,x)+Math.PI/2;parts.glass.push(back);
      const b=box(sx+x/o*0.6,sy,sz+z/o*0.6,5,0.45,0.5,benchM);b.rotation.y=back.rotation.y;parts.bench.push(b);
      looks.push({x:sx,y:sy,z:sz,spread:2.5,n:5,face:[x,z],stop:true});
    }
    ctx.parkTrams=trams;
    animHooks.push(((last)=>now=>{
      const dt=Math.min(0.1,(now-last)/1000);last=now;
      const halt=ctx.pitBus.signal.evac>0.05;          // on the night the trams stop and wait
      for(const tr of trams){
        if(!halt)tr.s+=tr.v*dt;
        tr.cars.forEach((c,i)=>{const [x,z,h]=posAt(tr.s-i*(i?7:5.8));c.position.set(x,gh(x,z)+0.1,z);c.rotation.y=-h;});
      }})(performance.now()));
  }

  // ---- merge, and light the lamps at night ----
  for(const [k,m] of [['deck',deckM],['steel',steelM],['brown',brownM],['canvas',canvasM],['bench',benchM],['bin',binM],['lamp',lampM],['glass',glassM]])
    if(parts[k].length)G.add(mergeParts(parts[k],m));
  if(nightF&&hour)animHooks.push(()=>{const n=nightF(hour());lampM.color.setRGB(0.35+0.65*n,0.33+0.52*n,0.3+0.33*n);});

  // ---- the walks, for visitors.js ----
  for(const r of roads){
    if(r.c!=='trail'&&r.c!=='footway')continue;
    const pts=r.pts.map(([x,z])=>[x,null,z]);
    let len=0;for(let i=0;i+1<r.pts.length;i++)len+=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1]);
    const loopy=r.name==='Rim Trail';
    walks.push({pts,n:Math.round(len/(loopy?5.5:9)),loop:loopy,w:r.w||3});
  }
  ctx.parkWalks=walks;ctx.parkLooks=looks;ctx.parkQueues=queues;
  ctx.details=Object.assign(ctx.details||{},{parkWalks:walks.length,parkQueues:queues.length,parkTrams:trams.length});
}
