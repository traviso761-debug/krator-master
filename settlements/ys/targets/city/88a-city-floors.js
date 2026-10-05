// ================================================================= YS CITY — the hosts' inhabited floors, subdivided (rooms as data)
// Travis (Oct 5 2026): in a host with pods, the floors that carry pods, and at least two floors above the top one and two
// below the bottom one, are subdivided into living, work and shop space. For each such floor (never under the tide,
// never above the cut): a lift core at the axis, a corridor ring, and rings of rooms round it (a deep floor has two
// rings with the corridor between them; a shallow one, a mid-rise or a Stalks core, one ring outside the corridor). Every
// room is a ROOMS record (a sector polygon, world) with a door onto the corridor, and the spots its use needs (DESIGN §7):
// living: bed, food, store (middle and rich add a hearth and a table); work: two benches; shop: a counter and a store.
// A room behind a way-in pod's back door is a hall, its second door onto the pod. The partitions (radial walls and the
// corridor's two walls) are recorded as segments here and drawn by the draw pass as thin shell walls in the interior bucket.
// Data only: KRAND draws the uses, so the plan is the same in any engine.
const FLOORS={plans:[],rooms:0,spots:0};
(function floorPass(){
 const uses=(st,shopFloor)=>{const r=st.next();return r<(shopFloor?.28:.15)?'shop':r<(shopFloor?.5:.4)?'work':'living';};
 PLACE.hosts.forEach((h,hi)=>{if(!h.pods.length)return;const T=YS_HOST_TYPES[h.type];const st=KRAND.stream(KRAND.child(KRAND.child(PLACE.SEED,'floors'),hi));
  const cs=Math.cos(h.ry),sn=Math.sin(h.ry);const W=(lx,lz)=>[h.x+lx*cs+lz*sn,h.z-lx*sn+lz*cs];   // builder frame -> world
  // the floor table at this host: plate k at T.plate(k) builder y; the subdivided span is the pods' plates widened by two
  const plate=k=>T.plate(k)+h.sink;const kOf=y=>{let best=0,bd=1e9;for(let k=0;k<400;k++){const d=Math.abs(plate(k)-y);if(d<bd){bd=d;best=k;}if(plate(k)>y+50)break;}return best;};
  const podK=h.pods.map(p=>kOf(p.y));const k0=Math.min(...podK)-2,k1=Math.max(...podK)+2;const H=T.floors.pitch-.6;
  const shopKs=new Set(h.pods.filter(p=>/shop|tavern|market/.test(p.key)).map(p=>kOf(p.y)));
  const ways=h.pods.filter(p=>p.into).map(p=>({k:kOf(p.y),th:p.a+h.ry}));   // local bearing of each way-in pod's back door
  // the cores a floor is laid round: one at the axis, or the Stalks' three
  const cores=(T.key==='midStalks'&&typeof HST!=='undefined')?HST.CORES.map(C=>({x:C.x,z:C.z,top:C.top,rw:()=>C.r*.84})):[{x:0,z:0,top:1e9,rw:(yl,th)=>T.rAt(yl,th)*.86}];
  for(let k=Math.max(0,k0);k<=k1;k++){const y=plate(k),yl=y-h.sink;if(y<1.5||y+H>h.top-.5)continue;
   const plan={host:h.n,k,y,H,rooms:[],walls:[],hx:h.x,hz:h.z,ry:h.ry};let any=false;
   for(const C of cores){if(yl+H>C.top)continue;
    const NB=48,rw=[...Array(NB)].map((_,i)=>C.rw(yl,i/NB*TAU));const mean=rw.reduce((a,b)=>a+b,0)/NB;if(mean<5)continue;
    const minR=Math.min(...rw);const rc=mean<14?1.6:Math.max(2.5,mean*.26),deep=minR-rc>16;   /* a slim stair core in a small one; a flat-sided plan (the Sail) bounds the rings by its inscribed radius */const rm=Math.min(deep?(rc+mean)/2:rc+1.2,Math.max(rc+1.2,minR-2));   // the corridor's centre line
    const rings=deep?[[rc,rm-1.2],[rm+1.2,null]]:[[rm+1.2,null]];   // null: out to the wall
    const P=(r,th)=>W(C.x+r*Math.cos(th),C.z+r*Math.sin(th));const wallR=th=>{const f=((th/TAU)%1+1)%1*NB;const i=Math.floor(f)%NB,j=(i+1)%NB,t=f-Math.floor(f);return rw[i]*(1-t)+rw[j]*t;};
    // the corridor's walls
    for(const rr of [rm-1.2,rm+1.2])if(rr>rc+.5)plan.walls.push({arc:true,cx:C.x,cz:C.z,r:rr});
    for(const [r0,r1f] of rings){const rOut=r1f!=null?r1f:mean;const n=Math.max(4,Math.round(TAU*((r0+rOut)/2)/12));const a0=st.next()*TAU/n;
     for(let i=0;i<n;i++){const t0=a0+i/n*TAU,t1=a0+(i+1)/n*TAU;const S=6;const outer=[],inner=[];
      let r1=1e9;for(let s=0;s<=S;s++){const th=t0+(t1-t0)*s/S;const ro=r1f!=null?r1f:wallR(th)-.15;r1=Math.min(r1,ro);outer.push([th,ro]);inner.push([th,r0]);}
      if(r1-r0<4.5)continue;   /* deep enough that its far-wall spots clear the door swing (DESIGN §7: 3.2 m at least) */
      const poly=outer.map(([th,r])=>P(r,th)).concat(inner.reverse().map(([th,r])=>P(r,th)));
      const tm=(t0+t1)/2;const doorR=r1f!=null?r1:r0;   // the inner ring's door is on its outer side (the corridor)
      const doors=[{at:P(doorR+(r1f!=null?-.05:.05),tm),w:1.2,to:'corridor'}];
      const way=ways.find(w=>w.k===k&&r1f==null&&C.x===0&&C.z===0&&Math.abs(Math.atan2(Math.sin(w.th-tm),Math.cos(w.th-tm)))<(t1-t0)/2);
      if(way)doors.push({at:P(r1,way.th),w:2.4,to:'pod'});
      const use=way?'hall':uses(st,shopKs.has(k));const wealth=h.wealth==='rich'?.9:h.wealth==='middle'?.6:.3;
      const R=ysRoom({building:h.n,bld:null,key:h.type,kind:use==='living'?'bedroom':use,poly,y:y+.3,h:H,doors,windows:[],culture:'hykkousoi',wealth,residence:use==='living',host:h.n,floor:k});
      plan.rooms.push(R.id);any=true;
      // the spots, against the far wall from the door: positions by fractions of the sector, facing the room
      const far=r1f!=null?r0:r1,dir=r1f!=null?1:-1;   // dir: from the far wall into the room
      const spot=(kind,f,dr,w,d)=>{const th=t0+(t1-t0)*f,r=far+dir*dr;const p=P(r,th);const tw=th-h.ry;const ry=Math.atan2(-Math.cos(tw),-Math.sin(tw));
       ysSpot({room:R.id,kind,x:p[0],z:p[1],ry,w,d});FLOORS.spots++;};
      if(use==='living'){spot('bed',.3,1.1,2.1,1.0);spot('food',.62,.95,.8,.8);spot('store',.85,.9,1.2,.7);
       if(wealth>.5&&r1-r0>7){spot('hearth',.5,(r1-r0)/2,1.2,1.2);spot('table',.22,(r1-r0)/2,1.6,.9);}}
      else if(use==='work'){spot('work',.3,1.1,2.0,1.0);spot('work',.7,1.1,2.0,1.0);}
      else if(use==='shop'){spot('store',.5,.9,1.2,.7);if(r1-r0>6.2)spot('table',.5,(r1-r0)/2+.3,2.4,.8);}
      // the partition on this room's first side
      plan.walls.push({cx:C.x,cz:C.z,th:t0,r0,r1:r1f!=null?r1f:wallR(t0)-.15});}}}
   if(any){FLOORS.plans.push(plan);FLOORS.rooms+=plan.rooms.length;}}
  h.floorsLived=FLOORS.plans.filter(p=>p.host===h.n).map(p=>p.k);});
})();
