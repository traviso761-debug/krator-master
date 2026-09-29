// ---------- the castle: the hall, its walls, its ceiling, and what hangs in it ----------
// Fan work. The Infinity Castle is a space Nakime's Blood Demon Art makes, somewhere under a city. Seen from
// outside, as the film's end credits show it, it is one great block; inside it is a hall so big the far side is
// lost in haze - a floor of tatami running to the horizon, a ceiling that rooms hang down from like
// stalactites, and walls of buildings stacked from one to the other, like a city rather than a castle. In
// between, in the air, rooms and stairs and bridges every way up. So:
//
//   the walls     facade boxes (see mats.js for how they are drawn), two rows deep round all four sides, from the
//                 floor to the ceiling: each a stack of room-fronts with a tiled eave round its top and often one
//                 round a middle tier. Most stand upright and face the hall; a few are upside down or on their sides
//   the ceiling   boards, and columns of one to four rooms hung under them upside down, each a little lower than
//                 the last, with a clearing over the middle where Muzan works
//   the floor     tatami (main.js lays it), with houses and galleries standing on it
//   the air       clusters of the kit (kit.js) - houses, galleries, stacks of rooms, stairs to nowhere - each with
//                 its own up; switchback towers of wide stairs, and tangles of stairs off a platform every way
//                 up; blocks of the walls hung free; bridges right across from wall to wall, bridges that
//                 stop and turn into stairs, and long straight stairways up the faces of the walls
//
// Every draw here is from the layout stream and happens in the same order every time, so a seed is a castle.
import {KEN,STAIR} from './kit.js';

const TIER=3.6;

// ---- the walls: facade boxes and their eaves, instanced ----
export function createShell(THREE,fm){
  const boxes=[],eaves=[];
  const M=THREE.Matrix4,Q=THREE.Quaternion,V=THREE.Vector3;
  const Ry=a=>new M().makeRotationY(a);
  // a box W wide (x), H tall (y), D deep (z); its +z face is its front
  // lit: the share of its bays that are lit (null: the shader works it out from the seed); style 1: small slatted
  // windows, one to a bay, as the rooms hung from the ceiling have
  function box(pos,quat,W,H,D,{seed=0.5,eaves:eo=true,mid=false,fixed=false,tag=null,lit=null,style=0}={}){
    const b={pos:pos.clone(),quat:quat.clone(),W,H,D,seed,lit,style,eaves:[],fixed,tag,i:boxes.length};boxes.push(b);
    if(eo){
      const ov=3;
      const add=(y,sides)=>{for(const [k,a] of sides){const len=(k%2?D:W)+ov;const off=k===0?new V(0,y,D/2):k===1?new V(W/2,y,0):k===2?new V(0,y,-D/2):new V(-W/2,y,0);
        const loc=new M().makeTranslation(off.x,off.y,off.z).multiply(Ry(a)).multiply(new M().makeScale(len,1,1));
        const e={b,loc,i:eaves.length};eaves.push(e);b.eaves.push(e);}};
      const all=[[0,0],[1,Math.PI/2],[2,Math.PI],[3,-Math.PI/2]];
      add(H/2,all);
      if(mid&&H>=4*TIER){const k=1+Math.floor(seed*997%(H/TIER-2));add(-H/2+k*TIER+2.76,all);}
    }
    return b;
  }
  let boxIM=null,eaveIM=null;
  const tmp=new M(),col=new THREE.Color(),S=new V(1,1,1);
  const boxMatrix=b=>tmp.compose(b.pos,b.quat,S.set(b.W,b.H,b.D));
  const eaveMatrix=e=>tmp.compose(e.b.pos,e.b.quat,S.set(1,1,1)).multiply(e.loc);
  function build(parent){
    const bg=new THREE.BoxGeometry(1,1,1);
    boxIM=new THREE.InstancedMesh(bg,fm.facade,boxes.length);boxIM.userData.kind='facade';
    boxes.forEach(b=>{boxIM.setMatrixAt(b.i,boxMatrix(b));boxIM.setColorAt(b.i,col.setRGB(b.seed,b.lit===null?-1:b.lit,b.style));});
    // the eave: a tiled slope out and down from the top edge, a fascia, and a soffit back under it
    const eg=new THREE.BufferGeometry();
    const P=[],N=[];const q=(a,b,c,d)=>{const u=new V().subVectors(b,a),v=new V().subVectors(d,a),n=new V().crossVectors(u,v).normalize();
      for(const p of [a,b,c,a,c,d]){P.push(p.x,p.y,p.z);N.push(n.x,n.y,n.z);}};
    const A=(x,y,z)=>new V(x,y,z);
    q(A(-0.5,0.3,-0.5),A(-0.5,-0.45,1.5),A(0.5,-0.45,1.5),A(0.5,0.3,-0.5));      // tiles, facing up and out
    q(A(-0.5,-0.45,1.5),A(-0.5,-0.7,1.5),A(0.5,-0.7,1.5),A(0.5,-0.45,1.5));      // fascia, facing out
    q(A(-0.5,-0.7,1.5),A(-0.5,-0.05,-0.5),A(0.5,-0.05,-0.5),A(0.5,-0.7,1.5));    // soffit, facing down
    eg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));eg.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
    eaveIM=new THREE.InstancedMesh(eg,fm.eave,eaves.length);eaveIM.userData.kind='eave';
    eaves.forEach(e=>{eaveIM.setMatrixAt(e.i,eaveMatrix(e));eaveIM.setColorAt(e.i,col.setScalar(e.b.seed));});
    for(const im of [boxIM,eaveIM]){im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);im.frustumCulled=false;parent.add(im);}
    return {boxIM,eaveIM};
  }
  function place(b){boxIM.setMatrixAt(b.i,boxMatrix(b));for(const e of b.eaves)eaveIM.setMatrixAt(e.i,eaveMatrix(e));
    boxIM.instanceMatrix.needsUpdate=true;if(b.eaves.length)eaveIM.instanceMatrix.needsUpdate=true;}
  return {boxes,box,build,place};
}

// ---- the hall: how big the castle is, and what is inside it ----
// A box: a floor at y=0, a ceiling at CEIL, and walls HALF each way from the middle. Everything else is in it.
export function makeHall(C){
  const HALF=C.hall.half,CEIL=C.hall.ceil;
  const inside=(p,m=0)=>Math.abs(p.x)<HALF-m&&Math.abs(p.z)<HALF-m&&p.y>m&&p.y<CEIL-m;
  // how far a point is from the nearest wall
  const wallGap=p=>HALF-Math.max(Math.abs(p.x),Math.abs(p.z));
  return {HALF,CEIL,inside,wallGap};
}

// ---- building it ----
export function buildCastle({THREE,C,kit,shell,rnd,hall,reserved}){
  const V=THREE.Vector3,M=THREE.Matrix4,Q=THREE.Quaternion;
  const {HALF,CEIL}=hall;
  const rr=(a,b)=>a+(b-a)*rnd(),pick=a=>a[Math.floor(rnd()*a.length)];
  const count={walls:0,ceiling:0,blocks:0,clusters:0,floor:0,bridges:0,stairways:0,flights:0,rooms:0,doors:0};
  const qY=a=>new Q().setFromAxisAngle(new V(0,1,0),a);
  const qZ=a=>new Q().setFromAxisAngle(new V(0,0,1),a);
  const qX=a=>new Q().setFromAxisAngle(new V(1,0,0),a);
  // what is already there: the places, and every cluster so far (x, y, z, r)
  const taken=reserved.slice();
  const clear=(p,r)=>{for(const t of taken)if((p.x-t[0])**2+(p.y-t[1])**2+(p.z-t[2])**2<(r+t[3])**2)return false;return true;};
  const SIDES=[[0,1],[0,-1],[1,0],[-1,0]];   // the inward normal of each wall: north, south, west, east

  // ---- the walls ----
  // Each wall is buildings stacked from the floor to the ceiling, their fronts to the hall: a first row whose
  // faces stand in and out of the wall by up to a dozen metres (and now and then one juts well out), and a row of
  // bigger ones behind so there is never a gap through to nothing.
  for(const [nx,nz] of SIDES){
    const n=new V(nx,0,nz),t=new V(nz,0,-nx),yaw=Math.atan2(nx,nz),base=n.clone().multiplyScalar(-HALF);
    for(let y=0;y<CEIL;y+=rr(6,18)){
      for(let u=-HALF-30+rr(0,20);u<HALF+30;){
        let tiers=pick([2,2,3,3,4,5,6,8,10,14]);const W=rr(14,44),D=rr(10,26);
        tiers=Math.max(1,Math.min(tiers,Math.floor((CEIL+8-y)/TIER)));const H=tiers*TIER;
        let inset=rr(0,12);
        if(rnd()<0.06){const j=rr(28,90);const pj=base.clone().addScaledVector(n,j-D/2).addScaledVector(t,u+W/2);pj.y=y+H/2;
          if(clear(pj,Math.hypot(W,H,D)/2))inset=j;}
        const pos=base.clone().addScaledVector(n,inset-D/2).addScaledVector(t,u+W/2);pos.y=y+H/2;
        let q=qY(yaw+rr(-0.05,0.05));const o=rnd();
        if(o<0.05)q.multiply(qZ(Math.PI));else if(o<0.1)q.multiply(qZ(rnd()<0.5?Math.PI/2:-Math.PI/2));
        shell.box(pos,q,W,H,D,{seed:rnd(),mid:rnd()<0.4});count.walls++;
        if(rnd()<0.5){const W2=rr(24,60),t2=Math.max(2,Math.min(pick([4,6,8,12,16]),Math.floor((CEIL+8-y)/TIER))),H2=t2*TIER,D2=rr(18,40);
          const p2=base.clone().addScaledVector(n,inset-D-D2/2-rr(0,6)).addScaledVector(t,u+W/2);p2.y=y+H2/2;
          shell.box(p2,qY(yaw),W2,H2,D2,{seed:rnd(),eaves:false});count.walls++;}
        u+=W*0.85;
      }
    }
  }

  // ---- the ceiling ----
  // Boards overhead, and hung from them, like stalactites, rooms: one to four boxes in a column, each a little
  // under the last, the wrong way up, lit through small slatted windows. Over the middle there is a clearing,
  // where Muzan works (places.js).
  shell.box(new V(0,CEIL+8,0),qY(0),2*HALF+160,16,2*HALF+160,{seed:0.37,eaves:false,fixed:true,tag:'ceiling'});
  const cell=C.ceiling.cell,lab=C.places.lab;
  for(let x=-HALF+cell/2;x<HALF;x+=cell)for(let z=-HALF+cell/2;z<HALF;z+=cell){
    if(rnd()>C.ceiling.fill)continue;
    const cx=x+rr(-cell*0.3,cell*0.3),cz=z+rr(-cell*0.3,cell*0.3);
    if(Math.hypot(cx-lab.x,cz-lab.z)<C.ceiling.clearing)continue;
    const nC=1+Math.floor(Math.pow(rnd(),1.7)*5);let top=CEIL;const yaw=Math.floor(rnd()*4)*Math.PI/2+rr(-0.08,0.08);
    for(let k=0;k<nC;k++){
      const s=rr(7,cell*0.8),tiers=Math.max(2,Math.round(s*rr(0.7,1.5)/TIER)),H=tiers*TIER;
      const pos=new V(cx+rr(-2,2),top-H/2,cz+rr(-2,2));
      if(!clear(pos,Math.hypot(s,H)/2))break;
      shell.box(pos,qY(yaw+rr(-0.1,0.1)).multiply(qZ(Math.PI)),s,H,s*rr(0.8,1.25),{seed:rnd(),eaves:false,lit:rr(0.3,0.75),style:1});count.ceiling++;
      top-=H+rr(0,6);
    }
  }

  // ---- the hall ----
  // Where a cluster may go: anywhere in the air between the floor and the rooms hung from the ceiling, clear of
  // the places and of each other.
  const where=(r0,y0=40,y1=CEIL-150)=>{
    for(let k=0;k<40;k++){
      const m=HALF-r0-30,p=new V(rr(-m,m),rr(y0,y1),rr(-m,m));
      if(clear(p,r0))return p;}
    return null;};
  // which way is up for it: most stand up, some hang, some are on their sides
  const orient=()=>{const o=rnd();let q=qY(rnd()*Math.PI*2);
    if(o<0.14)q=q.multiply(qX(Math.PI));else if(o<0.36)q=q.multiply(rnd()<0.5?qX(rnd()<0.5?Math.PI/2:-Math.PI/2):qZ(rnd()<0.5?Math.PI/2:-Math.PI/2));
    return q;};
  const L=(x,y,z,a=0)=>new M().makeRotationY(a).setPosition(x,y,z);
  const ROOMS={room3:[3,2],room3d:[3,2],room4:[4,3],room4d:[4,3],room6:[6,4],room6f:[6,4]};
  const ROOF=new Set(['room3','room4','room4d','room6']);

  // a room, and the sliding doors along its front: a panel half a ken wide on a track of its own, closed edge to
  // edge or slid back to both ends; which, the biwa changes (biwa.js). Lit rooms have shoji or fusuma, dark ones
  // dark shoji.
  const DIM=new Set(['room3d','room4d']);
  function addRoom(c,piece,local){
    kit.add(c,piece,local);count.rooms++;
    const [a,b]=ROOMS[piece],w=a*KEN,hd=b*KEN/2,n=Math.round(w/0.91),mat=DIM.has(piece)?'doorD':rnd()<0.3?'doorF':'door';
    const open=rnd()<0.6;c.doors=c.doors||[];
    for(let i=0;i<n;i++){const z=hd-0.04-0.03*i,xc=-w/2+0.455+i*0.91,xo=i<n/2?-w/2+0.455+i*0.12:w/2-0.455-(n-1-i)*0.12;
      const mc=local.clone().multiply(new M().makeTranslation(xc,0,z)),mo=local.clone().multiply(new M().makeTranslation(xo,0,z));
      const it=kit.add(c,mat,open?mo:mc);c.doors.push({it,closed:mc,open:mo,state:open,i});count.doors++;}
  }
  function house(c,grounded){
    const a=pick(Object.keys(ROOMS)),[wa,da]=ROOMS[a];addRoom(c,a,L(0,0,0));
    const hw=wa*KEN/2,hd=da*KEN/2;
    const n=rnd();
    if(n<0.3){const b=pick(Object.keys(ROOMS)),[wb]=ROOMS[b];addRoom(c,b,L(hw+wb*KEN/2+0.3,grounded||rnd()<0.5?0:3.6,0));}
    else if(n<0.5&&!ROOF.has(a)){const b=pick(Object.keys(ROOMS));addRoom(c,b,L(0,3.5,0,pick([0,Math.PI])));}
    if(grounded)return;
    if(rnd()<0.55){const x=rr(-hw+0.8,hw-0.8);kit.add(c,'stair',L(x,-0.14-STAIR.rise,hd+0.91+STAIR.run,Math.PI));count.flights++;
      if(rnd()<0.5){kit.add(c,'landing',L(x,-0.14-STAIR.rise,hd+0.91+STAIR.run,0));kit.add(c,'stair',L(x,-0.14-2*STAIR.rise,hd+0.91+STAIR.run+1.3+STAIR.run,Math.PI));count.flights++;}}
    if(rnd()<0.4)for(const [x,z] of [[-hw,-hd],[hw,-hd],[-hw,hd],[hw,hd]])kit.add(c,'post',L(x,-0.45,z));
  }
  // one to three galleries end to end, and sometimes one more turning off the end of them
  function galleries(c,grounded){
    const n=1+Math.floor(rnd()*3),Lg=8*KEN;
    for(let i=0;i<n;i++){kit.add(c,'gallery',L(i*Lg,0,0));count.rooms++;}
    if(rnd()<0.4){kit.add(c,'gallery',L((n-1)*Lg+Lg/2+KEN/2,0,-Lg/2+KEN/2,Math.PI/2));count.rooms++;}
    if(!grounded&&rnd()<0.6){kit.add(c,'stair',L(-Lg/2-STAIR.run,-STAIR.rise,0,Math.PI/2));count.flights++;}
  }
  function stack(c,grounded){
    const n=3+Math.floor(rnd()*4);let y=0;
    for(let i=0;i<n;i++){const top=i===n-1;const p=top?pick(['room3','room4','room6','room4d']):pick(['room3d','room6f']);
      addRoom(c,p,L(0,y,0,pick([0,Math.PI])));y+=3.5;}
    if(!grounded){kit.add(c,'post',L(-2.7,-0.45,-1.8));kit.add(c,'post',L(2.7,-0.45,1.8));}
  }
  // stairs that go nowhere: flights and landings, turning as they please; narrow, or the castle's wide ones
  function stairs(c){
    const wide=rnd()<0.5,S=wide?'stairW':'stair',LD=wide?'landingW':'landing',LS=wide?2.6:1.3;
    const n=3+Math.floor(rnd()*7);const p=new V(0,-n*STAIR.rise/2,0);let h=0;
    const dir=a=>new V(Math.sin(a),0,Math.cos(a));c.pivots=[p.clone()];
    for(let i=0;i<n;i++){
      kit.add(c,S,L(p.x,p.y,p.z,h));count.flights++;
      p.addScaledVector(dir(h),STAIR.run);p.y+=STAIR.rise;
      kit.add(c,LD,L(p.x,p.y,p.z,h));
      const t=rnd();
      if(t<0.5){const ctr=p.clone().addScaledVector(dir(h),LS/2);h+=t<0.25?Math.PI/2:-Math.PI/2;p.copy(ctr).addScaledVector(dir(h),LS/2);}
      else p.addScaledVector(dir(h),LS);
    }
    c.pivots.push(p.clone());
  }
  // a switchback tower: wide flights zigzagging up, two lanes, a landing the width of both at every turn
  function switchback(c){
    const n=6+Math.floor(rnd()*9);let y=-n*STAIR.rise/2;const y0=y;
    for(let k=0;k<n;k++){const up=k%2===0,x=up?-1.35:1.35;
      kit.add(c,'stairW',up?L(x,y,0,0):L(x,y,STAIR.run,Math.PI));count.flights++;y+=STAIR.rise;
      const z=up?STAIR.run:-2.6;for(const lx of [-1.3,1.3])kit.add(c,'landingW',L(lx,y,z,0));
      if(k>0)for(const lx of [-2.5,2.5])for(const lz of [z+0.2,z+2.4])kit.add(c,'post3',L(lx,y-0.45,lz));}
    c.pivots=[new V(0,y0,0),new V(0,y,0)];
  }
  // a tangle, after the manga's Escher pages: a platform with stairs going off three or four of its sides - up,
  // or hung upside down under it, or on their sides
  function tangle(c){
    kit.add(c,'platform',L(0,0,0));const h=2*KEN;const sides=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(rnd()*(i+1));[sides[i],sides[j]]=[sides[j],sides[i]];}sides.length=3+Math.floor(rnd()*2);
    for(const sd of sides){const a=sd*Math.PI/2,wide=rnd()<0.6,S=wide?'stairW':'stair',LD=wide?'landingW':'landing',LS=wide?2.6:1.3;
      const r=rnd(),roll=r<0.3?Math.PI:r<0.5?(rnd()<0.5?1:-1)*Math.PI/2:0;
      const A=new M().makeRotationY(a).setPosition(Math.sin(a)*h,0,Math.cos(a)*h).multiply(new M().makeRotationZ(roll));
      const f=2+Math.floor(rnd()*5);const p=new V(0,0,0);
      for(let k=0;k<f;k++){kit.add(c,S,A.clone().multiply(L(p.x,p.y,p.z)));count.flights++;p.y+=STAIR.rise;p.z+=STAIR.run;
        if(k<f-1){kit.add(c,LD,A.clone().multiply(L(p.x,p.y,p.z)));p.z+=LS;}}}
    c.pivots=[new V(0,0,0)];
  }
  // The spans go in first - bridges, spurs, the long stairways - and keep their line clear, so that the
  // clusters that come after keep off them.
  const keep=(a,b)=>{const L=a.distanceTo(b),n=Math.ceil(L/14);for(let k=0;k<=n;k++){const p=a.clone().lerp(b,k/n);taken.push([p.x,p.y,p.z,7]);}};
  const along=(a,b,r)=>{for(let k=1;k<12;k++)if(!clear(a.clone().lerp(b,k/12),r))return false;return true;};
  const bridgeFrom=(a,b,o)=>{const d=b.clone().sub(a),len=d.length(),n=Math.floor(len/(2*KEN));
    const c=kit.cluster(new M().makeRotationY(Math.atan2(-d.z,d.x)).setPosition(a.x,a.y,a.z),Object.assign({tint:rr(0.75,1.05),r:len/2},o||{}));
    for(let k=0;k<n;k++)kit.add(c,'bridge',new M().makeTranslation(k*2*KEN,0,0));c.bridge=true;return {c,n,len};};
  // long straight stairways up the faces of the walls, flight after flight with no landing
  for(let i=0;i<C.hall.stairways;i++){
    const [nx,nz]=pick(SIDES),n=new V(nx,0,nz),t=new V(nz,0,-nx),y=rr(0,CEIL*0.5),u=rr(-HALF+80,HALF-80),fl=20+Math.floor(rnd()*40);
    const s=rnd()<0.5?1:-1,dir=t.clone().multiplyScalar(s);
    const a=n.clone().multiplyScalar(-HALF+rr(14,30)).addScaledVector(t,u);a.y=y;
    const b=a.clone().addScaledVector(dir,fl*STAIR.run);b.y=y+fl*STAIR.rise;if(b.y>CEIL-40||Math.abs(b.x)>HALF||Math.abs(b.z)>HALF)continue;
    if(!along(a,b,5))continue;
    const c=kit.cluster(new M().makeRotationY(Math.atan2(dir.x,dir.z)).setPosition(a.x,a.y,a.z),{fixed:true,r:fl*2.6});
    for(let k=0;k<fl;k++){kit.add(c,'stairW',L(0,k*STAIR.rise,k*STAIR.run));count.flights++;}
    keep(a,b);count.stairways++;
  }
  // bridges right across the hall, wall to wall
  for(let i=0;i<C.hall.bridges;i++){
    const y=rr(50,CEIL-170),w=rr(-HALF+60,HALF-60),ax=rnd()<0.5;
    const a=ax?new V(-HALF+4,y,w):new V(w,y,-HALF+4),b=ax?new V(HALF-4,y,w):new V(w,y,HALF-4);
    if(!along(a,b,5))continue;bridgeFrom(a,b);keep(a,b);count.bridges++;
  }
  // and bridges out from a wall that stop, and turn into stairs up into nothing
  for(let i=0;i<C.hall.spurs;i++){
    const [nx,nz]=pick(SIDES),n=new V(nx,0,nz),t=new V(nz,0,-nx),y=rr(40,CEIL-170),u=rr(-HALF+60,HALF-60),Ls=rr(40,220);
    const a=n.clone().multiplyScalar(-HALF+4).addScaledVector(t,u);a.y=y;const b=a.clone().addScaledVector(n,Ls);
    if(!along(a,b.clone().addScaledVector(n,12),6))continue;
    const {c,n:ns}=bridgeFrom(a,b);keep(a,b.clone().addScaledVector(n,12).setY(y+10));const end=ns*2*KEN,fl=2+Math.floor(rnd()*5);
    for(let k=0;k<fl;k++){kit.add(c,'stair',new M().makeRotationY(Math.PI/2).setPosition(end+k*STAIR.run,k*STAIR.rise,0));count.flights++;}
    count.bridges++;
  }
  const KINDS=[[house,0.4,11],[galleries,0.18,14],[stack,0.12,9],[stairs,0.16,12],[switchback,0.08,26],[tangle,0.06,24]];
  const kindOf=()=>{let t=rnd();for(const K of KINDS){if(t<K[1])return K;t-=K[1];}return KINDS[0];};
  for(let i=0;i<C.hall.clusters;i++){
    const k=kindOf();const p=where(k[2]);if(!p)continue;
    const c=kit.cluster(new M().compose(p,orient(),new V(1,1,1)),{tint:rr(0.72,1.15),r:k[2]});
    k[0](c,false);taken.push([p.x,p.y,p.z,k[2]]);count.clusters++;
    // where the first of each kind is, for anyone looking for one (the page's details)
    if(!count.at)count.at={};const nm=k[0].name;if(!count.at[nm])count.at[nm]=[Math.round(p.x),Math.round(p.y),Math.round(p.z)];
  }
  // on the floor: houses, galleries and stacks standing on the tatami, the right way up
  for(let i=0;i<C.hall.floorHouses;i++){
    let k=kindOf();if(k[0]===stairs||k[0]===switchback||k[0]===tangle)k=KINDS[0];
    const m=HALF-40,p=new V(rr(-m,m),0.45,rr(-m,m));if(!clear(p,k[2]))continue;
    const c=kit.cluster(new M().compose(p,qY(Math.floor(rnd()*4)*Math.PI/2),new V(1,1,1)),{tint:rr(0.8,1.1),r:k[2]});
    c.floor=true;k[0](c,true);taken.push([p.x,p.y,p.z,k[2]]);count.floor++;
    if(!count.at)count.at={};if(!count.at.floor&&k[0]===house)count.at.floor=[Math.round(p.x),0,Math.round(p.z),Math.round(Math.atan2(c.m.elements[8],c.m.elements[10])*100)/100];
  }
  // blocks of the walls, hung free in the air
  for(let i=0;i<C.hall.blocks;i++){
    const W=rr(10,36),H=pick([3,4,6,8,12,16,20])*TIER,D=rr(10,30),r0=Math.hypot(W,H,D)/2;
    const p=where(r0);if(!p)continue;
    let q=qY(rnd()*Math.PI*2);const o=rnd();if(o<0.2)q.multiply(qZ(Math.PI));else if(o<0.45)q.multiply(qX(Math.PI/2));
    shell.box(p,q,W,H,D,{seed:rnd(),mid:rnd()<0.5,tag:'free'});taken.push([p.x,p.y,p.z,r0]);count.blocks++;
  }
  return {count,taken};
}
