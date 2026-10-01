// ---------- the passages nobody mapped ----------
// The shaft is not the only way through the organism. Passages open off its wall all the way down - some
// found by the 1970s surveys, some that opened on their own later - and the park never took the public into
// any of them. Each one is gated at the shaft wall with a bulkhead frame and a grille, padlocked, lettered
// PARK WORKS ONLY, with a red lamp and a ledge and a ladder for the crews; past the grille it wanders off
// into the animal and the lamps stop. A few were worked for a while - a survey line pinned to the floor, a
// rail and a cart, a crate of tools - and then left. None of them has been followed to its end.
//
// Built from ctx.pit (organism.js), so it runs after that; the list is "tunnels" in the pit block of
// data/cities/fleshpit.json. In the section view (section.js) each one is cut open like everything else.
import { mkRng } from '../core/rng.js';
import { signBoard, faceTowards } from './signs.js';

export function tunnels(api){
  const {ctx,animHooks,mergeParts,C}=api;
  const P=ctx.pit;if(!P)return;
  const {THREE,Y,wallAt,polar,card,AX,AZ}=P;
  const LIST=(C.pit&&C.pit.tunnels)||[];if(!LIST.length)return;
  const R=mkRng(1962);
  const UP=new THREE.Vector3(0,1,0);
  const box=(p,w,h,d,m,rot)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d).translate(0,h/2,0),m);b.position.copy(p);if(rot!==undefined)b.rotation.y=rot;return b;};
  const strut=(a,b,w,h,m)=>{const dir=new THREE.Vector3().subVectors(b,a),len=dir.length();
    const s=new THREE.Mesh(new THREE.BoxGeometry(w,len,h||w),m);s.position.copy(a).addScaledVector(dir,0.5);s.quaternion.setFromUnitVectors(UP,dir.normalize());return s;};

  const tubeM=new THREE.MeshPhongMaterial({color:0x7a3a44,side:THREE.BackSide,specular:0x3a1a20,shininess:14,emissive:0x140407});
  const holeM=new THREE.MeshBasicMaterial({color:0x0e0406});
  const frameM=new THREE.MeshLambertMaterial({color:0x4e5458});
  const barM=new THREE.MeshLambertMaterial({color:0x6a7074});
  const hazM=(()=>{const c=document.createElement('canvas');c.width=128;c.height=32;const g=c.getContext('2d');
    g.fillStyle='#e0a41c';g.fillRect(0,0,128,32);g.fillStyle='#1a1713';
    for(let x=-32;x<160;x+=32){g.beginPath();g.moveTo(x,32);g.lineTo(x+16,32);g.lineTo(x+32,0);g.lineTo(x+16,0);g.closePath();g.fill();}
    const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.repeat.set(3,1);return new THREE.MeshLambertMaterial({map:t});})();
  const redLampM=new THREE.MeshBasicMaterial({color:0xff2a1a});
  const workLampM=new THREE.MeshBasicMaterial({color:0xd4e2ff});
  const railM=new THREE.MeshLambertMaterial({color:0x5a4a40});
  const crateM=new THREE.MeshLambertMaterial({color:0x8a6a3a});
  const lineM=new THREE.MeshBasicMaterial({color:0xf0e030});
  const G=new THREE.Group(),reds=[];

  for(const T of LIST){
    const d0=T.d,a0=T.a,r=T.r||5,rw=wallAt(d0);
    // the course: out from the wall, wandering in plan and in depth, narrowing as it goes
    const pts=[],n=T.bends||7,len=T.len||320;
    let a=a0,d=d0;
    for(let k=0;k<=n;k++){
      const o=rw-2+len*k/n;
      if(k>0){a+=(R()-0.5)*(T.wander||0.25)*(120/o);d+=(T.drift||0)*len/n+(R()-0.5)*18;}
      const [x,z]=polar(a,o);pts.push(new THREE.Vector3(x,Y(d),z));
    }
    const curve=new THREE.CatmullRomCurve3(pts);
    const parts=[];
    parts.push(new THREE.Mesh(new THREE.TubeGeometry(curve,n*14,r,10,false),tubeM));
    // the dark at the far end: a cap that swallows the light, so it does not simply stop
    const end=new THREE.Mesh(new THREE.SphereGeometry(r*1.05,10,8),holeM);end.position.copy(pts[pts.length-1]);parts.push(end);
    // the mouth, at the shaft wall: the dark of the passage behind a bulkhead frame and a grille
    const [mx,mz]=polar(a0,rw*0.972),mouth=new THREE.Vector3(mx,Y(d0),mz),face=faceTowards(mx,mz,AX,AZ);
    const hole=new THREE.Mesh(new THREE.CircleGeometry(r*0.95,20),holeM);hole.position.copy(mouth);hole.rotation.y=face;parts.push(hole);
    const [fx,fz]=polar(a0,rw*0.962),fp=new THREE.Vector3(fx,Y(d0),fz);
    const fr=[];
    const side=new THREE.Vector3(Math.cos(face),0,-Math.sin(face));
    for(const sd of [-1,1])fr.push(box(fp.clone().addScaledVector(side,sd*r*1.05).setY(fp.y-r*1.05),0.9,r*2.1,0.9,frameM,face));
    fr.push(box(fp.clone().setY(fp.y+r*1.05-0.45),r*2.2,0.9,0.9,frameM,face),box(fp.clone().setY(fp.y-r*1.05),r*2.2,0.5,0.9,frameM,face));
    // the grille: bars, a cross rail, a padlock box - unless it is one of the sealed ones, which get a plate
    if(T.state==='sealed'){fr.push(box(fp.clone().setY(fp.y-r),r*2,r*2,0.4,frameM,face));
      const bolts=[];for(let k=0;k<10;k++){const t=k/10*Math.PI*2;bolts.push(box(fp.clone().addScaledVector(side,Math.cos(t)*r*0.8).setY(fp.y+Math.sin(t)*r*0.8),0.4,0.4,0.6,barM,face));}
      fr.push(...bolts);}
    else{for(let k=-4;k<=4;k++)fr.push(box(fp.clone().addScaledVector(side,k*r*0.22).setY(fp.y-r),0.15,r*2,0.15,barM,face));
      fr.push(box(fp.clone().setY(fp.y-0.2),r*2,0.2,0.2,barM,face));
      fr.push(box(fp.clone().addScaledVector(side,r*0.35).setY(fp.y-0.6),0.5,0.7,0.3,crateM,face));}
    parts.push(mergeParts(fr,frameM));
    const haz=new THREE.Mesh(new THREE.BoxGeometry(r*2.2,0.8,0.3),hazM);haz.position.copy(fp).setY(fp.y+r*1.05+0.4);haz.rotation.y=face;parts.push(haz);
    const sg=signBoard(THREE,['PARK WORKS ONLY',(T.name||'Unsurveyed passage')+' · Authorised personnel'],{w:Math.max(5,r*1.6),h:1.6,style:'company'});
    sg.position.copy(fp).setY(fp.y+r*1.05+2.2);sg.position.addScaledVector(new THREE.Vector3(Math.sin(face),0,Math.cos(face)),0.3);sg.rotation.y=face;parts.push(sg);
    const lamp=box(fp.clone().addScaledVector(side,r*1.25).setY(fp.y+r*0.6),0.7,0.7,0.7,redLampM,face);parts.push(lamp);reds.push({m:lamp,ph:R()*1600});
    // the crews' way to it: a ledge under the mouth and a ladder down the wall
    const [lx,lz]=polar(a0,rw*0.93);
    parts.push(box(new THREE.Vector3(lx,Y(d0)-r-0.3,lz),r*2.4,0.4,4,frameM,face),box(new THREE.Vector3(lx,Y(d0)-r-24,lz),0.5,24,0.5,barM,face));
    // the worked ones: a survey line on the floor, a rail and a cart, work lamps for the first stretch, a crate
    if(T.state==='worked'||T.state==='surveyed'){
      const segs=Math.round(curve.getLength()/8),line=[],rails=[],lamps=[];
      const reach=T.state==='worked'?(T.worked||0.3):0.15;
      for(let k=0;k<segs*reach;k++){
        const p0=curve.getPointAt(k/segs),p1=curve.getPointAt((k+1)/segs);p0.y-=r*0.85;p1.y-=r*0.85;
        line.push(strut(p0,p1,0.12,0.04,lineM));
        if(T.state==='worked'){const t=curve.getTangentAt(k/segs),sd=new THREE.Vector3(-t.z,0,t.x).normalize().multiplyScalar(0.6);
          rails.push(strut(p0.clone().add(sd),p1.clone().add(sd),0.12,0.12,railM),strut(p0.clone().sub(sd),p1.clone().sub(sd),0.12,0.12,railM));
          if(k%6===2){const q=curve.getPointAt(k/segs);q.y+=r*0.8;const l=box(q,0.8,0.3,0.4,workLampM);lamps.push(l);}}
      }
      if(line.length)parts.push(mergeParts(line,lineM));
      if(rails.length){parts.push(mergeParts(rails,railM),mergeParts(lamps,workLampM));
        const q=curve.getPointAt(Math.min(0.95,reach*0.9));q.y-=r*0.85;
        const cart=box(q,1.6,1.2,1.1,railM);cart.rotation.set(0.1,R()*3,0.08);parts.push(cart);}
      const q=curve.getPointAt(0.06);q.y-=r*0.85;parts.push(box(q.clone().add(new THREE.Vector3(1.2,0,0)),1.2,0.8,0.8,crateM));
    }
    const g=new THREE.Group();for(const p of parts)g.add(p);G.add(g);
    card({name:T.name||'Unsurveyed passage',info:(T.info||'')+' Park works only.'},[g]);
    for(let k=0;k+1<pts.length;k++)P.cavities.push({kind:'cap',a:pts[k].clone(),b:pts[k+1].clone(),r});
  }
  P.group.add(G);
  animHooks.push(now=>{for(const l of reds)l.m.visible=((now+l.ph)%1400)<700;});
  ctx.details=Object.assign(ctx.details||{},{tunnels:LIST.length});
}
