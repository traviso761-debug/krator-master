// ---------- the people, and the Fourth ----------
// On 4 July 2007 the park was open to midnight with the fireworks rained off, so it was busy. This puts people
// where people could actually be - on the paths and decks, never on ground they could not stand on - and has
// them do what people in a park do:
//
//   walk        along a path: round the Rim Trail, back and forth on the footways and the overlook trails, down
//               the collar's switchback ramp, along the boardwalks in the lungs and the catwalks at the works,
//               and round the Lower Visitor Center's concourse in two lanes
//   stand       at an overlook rail or on a bench, facing the hole; in the pools; at the ferry terminal
//   queue       in the switchback lines at the headframes, shuffling forward a step at a time
//
// The paths come from promenade.js (ctx.parkWalks, parkLooks, parkQueues: the surface) and organism.js
// (ctx.pit.stands: below it). Figures are instanced - a body and a head, two draw calls for everybody - and the
// deck's people go in the deck's own group, so they list and fall with it. On the night (the bus's evac signal) the
// crowd on the surface backs away from the orifice, and the people below make for the stair towers and lifts.
import { mkRng } from '../core/rng.js';

export function visitors(api){
  const {ctx,animHooks,groundH}=api;
  const P=ctx.pit;
  const THREE=api.THREE;
  const R=mkRng(1776);
  const AX=P?P.AX:0,AZ=P?P.AZ:0;
  const polar=(a,r)=>[AX+Math.cos(a)*r,AZ+Math.sin(a)*r];

  const CLOTHES=[0xd8d4c8,0x2a4a7a,0xb83a32,0x3a6a4a,0xe0b040,0x6a4a8a,0x1a1a1e,0xe8e8f0,0x7aa0c8,0xc86a2a,0x8a8a8a,0xe07a9a,0x203c8a,0xc8202a];
  const SKIN=[0xe8c0a0,0xc89878,0x9a6a4a,0x6a4430,0xf0d0b8];
  const CREW=[0xf0a020,0xe8d020,0xf07020];
  const bodyG=new THREE.CylinderGeometry(0.3,0.25,1.3,6).translate(0,0.65,0);
  const headG=new THREE.SphereGeometry(0.17,6,5).translate(0,1.46,0);
  const bodyM=new THREE.MeshLambertMaterial({color:0xffffff}),headM=new THREE.MeshLambertMaterial({color:0xffffff});

  // ---- paths ----
  // A path is a polyline of [x, y, z]; a null y means "on the ground there". Walking is by distance along it.
  function path(pts,loop){
    const P3=pts.map(p=>p.slice()),cum=[0];
    for(let i=0;i+1<P3.length;i++)cum.push(cum[i]+Math.hypot(P3[i+1][0]-P3[i][0],P3[i+1][2]-P3[i][2]));
    return {pts:P3,cum,L:cum[cum.length-1]||1,loop:!!loop};
  }
  const tmp=[0,0,0,0];
  function at(p,s){                          // -> [x, y|null, z, heading]
    let i=0;const cum=p.cum;
    // (paths are short enough that a scan is cheaper than bookkeeping)
    while(i+2<cum.length&&cum[i+1]<s)i++;
    const a=p.pts[i],b=p.pts[i+1]||a,u=Math.max(0,Math.min(1,(s-cum[i])/Math.max(1e-6,cum[i+1]-cum[i])));
    tmp[0]=a[0]+(b[0]-a[0])*u;tmp[2]=a[2]+(b[2]-a[2])*u;
    tmp[1]=a[1]===null||b[1]===null?null:a[1]+(b[1]-a[1])*u;
    tmp[3]=Math.atan2(b[0]-a[0],b[2]-a[2]);
    return tmp;
  }
  const arc=(a0,a1,r,y,n)=>Array.from({length:n+1},(_,k)=>{const a=a0+(a1-a0)*k/n,[x,z]=polar(a,r);return [x,y,z];});
  const circle=(r,y)=>{const pts=arc(0,Math.PI*2,r,y,72);return pts;};

  // ---- people ----
  const people=[],deckPeople=[];
  function person(list,o,crew){
    list.push(Object.assign({ph:R()*6.28,delay:R()*0.35,
      body:crew?CREW[Math.floor(R()*CREW.length)]:CLOTHES[Math.floor(R()*CLOTHES.length)],
      head:crew?0xf4f4f0:SKIN[Math.floor(R()*SKIN.length)],sc:crew?1:0.86+R()*0.24},o));
  }
  function walkers(list,p,n,o){                 // n people along a path, both directions, spread across it
    for(let k=0;k<n;k++)person(list,Object.assign({mode:'walk',p,s:R()*p.L,v:(R()<0.5?-1:1)*(0.9+R()*0.6),lat:(R()-0.5)*(o&&o.w||2.4)},o),o&&o.crew);
  }

  // the surface
  for(const w of ctx.parkWalks||[])walkers(people,path(w.pts,w.loop),w.n,{w:(w.w||3)*0.7,surface:true});
  for(const l of ctx.parkLooks||[])for(let k=0;k<l.n;k++){
    let x=l.x,z=l.z;
    if(l.along){const u=R()*l.reach;x+=l.along[0]*u;z+=l.along[1]*u;}
    const a=R()*Math.PI*2,r=Math.sqrt(R())*l.spread;x+=Math.cos(a)*r;z+=Math.sin(a)*r;
    person(people,{mode:'stand',x,y:l.y,z,face:Math.atan2(l.face[0]-x,l.face[1]-z),sit:!!l.sit,surface:true});
  }
  for(const q of ctx.parkQueues||[]){const p=path(q.pts,false);
    for(let k=0;k<q.n;k++)person(people,{mode:'queue',p,slot:k,gap:p.L/q.n,surface:true});}

  // below the rim
  if(P&&P.stands)for(const s of P.stands){
    const list=s.lvc?deckPeople:people,crew=!!s.crew;
    const exit=s.exits||(s.x!==undefined?[[s.x,s.z]]:null);
    if(s.kind==='deck'){                        // the concourse: two lanes round, one each side of the shops
      const lanes=[path(circle((s.rIn+s.avoid[0])/2,s.y),true),path(circle((s.avoid[1]+s.rOut)/2,s.y),true)];
      for(let k=0;k<s.n;k++){const p=lanes[k%2];
        const o={mode:'walk',p,s:R()*p.L,v:(R()<0.5?-1:1)*(0.7+R()*0.6),lat:(R()-0.5)*5,exits:s.exits};
        if(R()<0.3){const [x,,z]=at(p,o.s);Object.assign(o,{mode:'stand',x:x+(R()-0.5)*4,y:s.y,z:z+(R()-0.5)*4,face:R()*6.28});}
        person(list,o,crew);}
    }else if(s.path){walkers(list,path(s.path,s.kind==='gallery'),s.n,{w:3,exits:exit,crew});}
    else if(s.d!==undefined){walkers(list,path(arc(s.a0,s.a1,s.r,P.Y(s.d)+0.1,24),false),s.n,{w:2.2,exits:[polar((s.a0+s.a1)/2,s.r)],crew});}
    else for(let k=0;k<s.n;k++){const a=R()*Math.PI*2,r=Math.sqrt(R())*s.spread;
      person(list,{mode:'stand',x:s.x+Math.cos(a)*r,y:s.y,z:s.z+Math.sin(a)*r,face:R()*6.28,exits:exit,mill:true},crew);}
  }

  function crowd(list,parent){
    if(!list.length||!parent)return null;
    const b=new THREE.InstancedMesh(bodyG,bodyM,list.length),h=new THREE.InstancedMesh(headG,headM,list.length);
    const c=new THREE.Color();
    list.forEach((p,i)=>{b.setColorAt(i,c.set(p.body));h.setColorAt(i,c.set(p.head));});
    b.frustumCulled=h.frustumCulled=false;b.userData.noWire=h.userData.noWire=true;
    parent.add(b,h);
    return {b,h,list};
  }
  const groups=[crowd(people,api.scene)];
  if(P&&P.lvc&&P.lvc.children[0])groups.push(crowd(deckPeople,P.lvc.children[0]));

  // ---- the bunting ----
  // Pennants on a sagging line, red, white and blue in turn, on the visitor center's rails and the collar lip.
  if(P){
    const flags=[];
    const bunting=(radius,y,spacing,sag,span)=>{const n=Math.floor(Math.PI*2*radius/spacing);
      for(let k=0;k<n;k++){const a=k/n*Math.PI*2,u=((k*spacing)%span)/span;flags.push({a,r:radius,y:y-sag*4*u*(1-u),c:k%3});}};
    const deckY=P.Y(P.deck),[DI,DO]=P.deckR;
    bunting(DO-0.6,deckY+2.6,1.4,1.1,14);bunting(DI+0.6,deckY+2.6,1.4,1.1,12);
    const nDeck=flags.length;
    const lipD=Math.max(P.D0,P.LAYERS[0].top)+2;
    bunting(P.wallAt(lipD)*0.975,P.Y(lipD)+2.4,1.5,1.4,16);
    const tri=new THREE.BufferGeometry();
    tri.setAttribute('position',new THREE.Float32BufferAttribute([-0.5,0,0,0.5,0,0,0,-1.1,0],3));tri.computeVertexNormals();
    const COL=[0xc8202a,0xf4f2ee,0x203c8a].map(x=>new THREE.Color(x));
    const fm=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});
    const mk=(from,to,parent)=>{if(to<=from||!parent)return;
      const im=new THREE.InstancedMesh(tri,fm,to-from),m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),one=new THREE.Vector3(1,1,1),v=new THREE.Vector3();
      for(let i=from;i<to;i++){const f=flags[i],[x,z]=polar(f.a,f.r);
        q.setFromEuler(e.set(0,Math.PI/2-f.a,0));m.compose(v.set(x,f.y,z),q,one);im.setMatrixAt(i-from,m);im.setColorAt(i-from,COL[f.c]);}
      im.frustumCulled=false;im.userData.noWire=true;parent.add(im);};
    mk(0,nDeck,P.lvc&&P.lvc.children[0]?P.lvc.children[0]:P.group);
    mk(nDeck,flags.length,P.group);
    ctx.details=Object.assign(ctx.details||{},{pitBunting:flags.length});
  }

  // ---- moving ----
  const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),v=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0);
  let last=performance.now(),frame=0;
  animHooks.push(now=>{
    const dt=Math.min(0.1,(now-last)/1000);last=now;
    if((frame++)&1)return;                          // every other frame is plenty for a crowd
    const t=now/1000,evac=ctx.pitBus.signal.evac,step=dt*2;
    for(const g of groups){if(!g)continue;
      g.list.forEach((p,i)=>{
        let x,y,z,face;
        const e=Math.max(0,Math.min(1,(evac-p.delay)/0.6));
        if(p.mode==='walk'){
          p.s+=p.v*step*(1+e*1.5);
          if(p.p.loop)p.s=((p.s%p.p.L)+p.p.L)%p.p.L;
          else if(p.s<0||p.s>p.p.L){p.v=-p.v;p.s=Math.max(0,Math.min(p.p.L,p.s));}
          const r=at(p.p,p.s);face=r[3]+(p.v<0?Math.PI:0);
          x=r[0]+Math.cos(face)*p.lat;z=r[2]-Math.sin(face)*p.lat;y=r[1];
        }else if(p.mode==='queue'){
          // the line moves up a place every five seconds; whoever reaches the front goes in, and a new arrival
          // joins at the back
          const ph=t/5,base=Math.floor(ph),u=Math.min(1,(ph-base)*3),N=Math.round(p.p.L/p.gap);
          const r=at(p.p,((p.slot+base+u)%N)*p.gap);
          x=r[0];z=r[2];y=r[1];face=r[3];
        }else{
          x=p.x;z=p.z;y=p.y;face=p.face;
          if(p.mill){x+=Math.cos(t*0.12+p.ph)*0.8;z+=Math.sin(t*0.1+p.ph)*0.8;}
        }
        if(e>0){
          if(p.exits&&p.exits.length){                // below: to the nearest stair tower, lift or way out
            let best=p.exits[0],bd=1e9;for(const ex of p.exits){const d=Math.hypot(ex[0]-x,ex[1]-z);if(d<bd){bd=d;best=ex;}}
            x+=(best[0]-x)*e*0.9;z+=(best[1]-z)*e*0.9;face=Math.atan2(best[0]-x,best[1]-z);
          }else if(p.surface){                         // up top: back from the hole
            const ra=Math.atan2(z-AZ,x-AX);x+=Math.cos(ra)*110*e;z+=Math.sin(ra)*110*e;face=Math.atan2(Math.cos(ra),Math.sin(ra));y=null;
          }
        }
        if(y===null||y===undefined)y=groundH(x,z)+0.12;
        const sit=p.sit&&e<0.1?0.62:1;
        q.setFromAxisAngle(UP,face);sc.set(p.sc,p.sc*sit,p.sc);m4.compose(v.set(x,y,z),q,sc);
        g.b.setMatrixAt(i,m4);g.h.setMatrixAt(i,m4);
      });
      g.b.instanceMatrix.needsUpdate=g.h.instanceMatrix.needsUpdate=true;
    }
  });

  ctx.details=Object.assign(ctx.details||{},{pitVisitors:people.length+deckPeople.length});
}
