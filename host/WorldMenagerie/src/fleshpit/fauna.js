// ---------- what lives in the pit ----------
// The organism is not the only animal down here. It carries its own fauna - isolated for longer than there
// have been people, and not built to anyone's plan - and the park's field guides catalogued what the visitors
// were likely to see. Three of them are here, each clickable for its guide entry:
//
//   the aquifer leeches, two-metre tube mollusks in colonies on the ballast pods, their proboscises sweeping;
//   the abyssal copepods, twenty feet long, drifting on the gastric seas and climbing the shaft wall above
//   them, with hands that the guide describes as unusually human-shaped and this model does not improve on;
//   and the Amorphous Shame, sessile blobs of organ that were once something with legs, pulsing on the
//   bronchial trunks and the wall.
//
// Fan work. The creatures are Trevor Roberts's; these shapes are this project's own. Everything is built from
// the map organism.js leaves at ctx.pit, so this runs after it and does nothing if it is not there.
import { mkRng } from '../core/rng.js';

export function fauna(api){
  const {ctx,animHooks}=api;
  const P=ctx.pit;if(!P)return;
  const {THREE,Y,wallAt,polar,card}=P;
  const R=mkRng(1973);
  const all=[],movers=[];

  // ---- the aquifer leeches ----
  // A tube, a hood, and two proboscises that fork and fork again. They live in colonies on the pods and sweep
  // the proboscises through the fluid in slow circles.
  const leechInfo={name:'Aquifer leech',info:'Tube-shaped mollusks, like a clam without a shell, up to two metres long. Two retractable proboscises branch into thousands of fine tubes; the colonies on the ballast pods filter what the pods leak. Harmless unless you are in the pool with them, which the Park Service made sure you were not.'};
  const leechM=new THREE.MeshLambertMaterial({color:0xcaa28a,emissive:0x2a1208,flatShading:true});
  const probM=new THREE.MeshLambertMaterial({color:0xe8c4b0,emissive:0x301410});
  function leech(){
    const g=new THREE.Group(),L=2.2+R()*0.8;
    const body=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.4,L,7).translate(0,L/2,0),leechM);g.add(body);
    const hood=new THREE.Mesh(new THREE.SphereGeometry(0.42,7,5),leechM);hood.position.y=L;hood.scale.y=0.7;g.add(hood);
    const arms=[];
    for(const sd of [-1,1]){
      const arm=new THREE.Group();arm.position.set(sd*0.18,L+0.1,0);
      arm.add(new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.09,1.4,5).translate(0,0.7,0),probM));
      for(let k=0;k<3;k++){const f=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.04,0.7,4).translate(0,0.35,0),probM);
        f.position.y=1.3;f.rotation.set((k-1)*0.6,0,sd*0.4);arm.add(f);}
      arm.rotation.z=sd*0.5;g.add(arm);arms.push(arm);
    }
    return {g,arms,ph:R()*6.28};
  }
  for(const pod of P.pods.slice(0,10)){
    const n=8+Math.floor(R()*8);
    for(let k=0;k<n;k++){
      const l=leech();
      // on the side of the pod facing the shaft, pointing out of it
      const u=R()*Math.PI*2,v=(R()-0.5)*1.2,nx=-Math.cos(pod.a)+0.5*Math.cos(u),nz=-Math.sin(pod.a)+0.5*Math.sin(u),ny=v;
      const nl=Math.hypot(nx,ny,nz);const n3=new THREE.Vector3(nx/nl,ny/nl,nz/nl);
      l.g.position.set(pod.x+n3.x*pod.R*0.95,pod.y+n3.y*pod.R*0.8,pod.z+n3.z*pod.R*0.95);
      l.g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),n3);
      all.push(l.g);movers.push({kind:'leech',...l});
    }
  }
  card(leechInfo,all.slice());

  // ---- the abyssal copepods ----
  // Carapace in three plates, a forked tail, two long antennae - and, where a copepod has swimming legs, two
  // arms ending in hands. Five fingers, pale, the nails dark. Six metres from head to tail.
  const copInfo={name:'Abyssal copepod',info:'Twenty feet long, translucent at the edges, and common on both gastric seas, where they graze the foam. Their forelimbs end in hands - five-fingered, jointed, with nails - that the field guide calls "unusually human-shaped" and says nothing more about. They do not approach boats. They do watch them.'};
  const shellM=new THREE.MeshPhongMaterial({color:0xd6c4a8,specular:0xffffff,shininess:50,transparent:true,opacity:0.88,emissive:0x2a2018});
  const skinM=new THREE.MeshLambertMaterial({color:0xdcb49c});
  const nailM=new THREE.MeshLambertMaterial({color:0x5a3a34});
  function hand(sd){
    const h=new THREE.Group();
    const palm=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.16,0.6),skinM);h.add(palm);
    for(let k=0;k<5;k++){
      const thumb=k===4,len=thumb?0.35:0.42+0.06*(k===1||k===2?1:0);
      const f=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.06,len,5).rotateX(Math.PI/2).translate(0,0,len/2),skinM);
      if(thumb){f.position.set(sd*0.28,0,-0.05);f.rotation.y=sd*1.0;}
      else f.position.set(-0.18+k*0.12,0,0.3);
      const nl=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.02,0.07),nailM);nl.position.set(0,0.05,len-0.04);f.add(nl);
      h.add(f);
    }
    return h;
  }
  function copepod(){
    const g=new THREE.Group();
    for(let k=0;k<3;k++){const s=new THREE.Mesh(new THREE.SphereGeometry(1.3-k*0.3,10,7),shellM);
      s.position.z=-k*1.6;s.scale.set(1,0.62,1.3);g.add(s);}
    for(const sd of [-1,1]){
      const tail=new THREE.Mesh(new THREE.ConeGeometry(0.18,1.8,5).rotateX(-Math.PI/2),shellM);tail.position.set(sd*0.35,0,-5.1);tail.rotation.y=sd*0.3;g.add(tail);
      const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.03,0.07,5,4).rotateX(Math.PI/2).translate(0,0,2.5),shellM);
      ant.position.set(sd*0.5,0.3,1.2);ant.rotation.y=sd*0.9;ant.rotation.x=-0.2;g.add(ant);
      const eye=new THREE.Mesh(new THREE.SphereGeometry(0.16,6,5),nailM);eye.position.set(sd*0.35,0.55,1.35);g.add(eye);
      const arm=new THREE.Group();arm.position.set(sd*0.9,-0.35,0.6);
      arm.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,1.6,5).rotateX(Math.PI/2).translate(0,0,0.8),shellM));
      const h=hand(sd);h.position.z=1.75;arm.add(h);arm.rotation.y=sd*0.35;g.add(arm);
      g.userData['arm'+sd]=arm;
    }
    return g;
  }
  const copes=[];
  for(const s of P.seas){
    const n=s.big?9:6;
    for(let k=0;k<n;k++){
      const g=copepod(),a=R()*Math.PI*2,r=s.R*(0.15+R()*0.6);
      g.position.set(s.x+Math.cos(a)*r,s.y+0.3,s.z+Math.sin(a)*r);all.push(g);copes.push(g);
      movers.push({kind:'swim',g,cx:s.x,cz:s.z,r,a,sp:(0.004+R()*0.006)*(R()<0.5?-1:1),y:s.y+0.3,ph:R()*6.28});
    }
  }
  // and a few on the shaft wall above the seas, climbing, which is where anyone riding down would meet one
  const climbers=[];
  for(let k=0;k<5;k++){
    const d=1440+R()*460,a=R()*Math.PI*2,g=copepod();
    const rw=wallAt(d)-1.6,[x,z]=polar(a,rw);
    g.position.set(x,Y(d),z);
    // head up the wall, back to the shaft: a basis built from those two directions
    const up=new THREE.Vector3(0,1,0),back=new THREE.Vector3(-Math.cos(a),0,-Math.sin(a)),side=new THREE.Vector3().crossVectors(back,up);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(side,back,up));
    climbers.push(g);movers.push({kind:'climb',g,a,d,ph:R()*6.28});
  }
  card(copInfo,copes.concat(climbers));

  // ---- the Amorphous Shame ----
  // A heap of organ: lobes of liver colour, a pale sac, a few blue-grey coils, and somewhere in it a thing that
  // was a paw. Pulsing, on its own slow cycle, out of step with the wall it is stuck to.
  const shameInfo={name:'Amorphous Shame',info:'Sessile, parasitic, and descended - the surveys are sure of it - from something like a weasel, which had legs and a face before it had been in here long enough. What is left is a heap of organs that pulses and does not move. It feeds off the bronchial trunks. The boardwalk signs asked visitors not to name them.'};
  const organCols=[0x6b2a2e,0x8a3a40,0xc79a8a,0x6a3a5a,0x9aa0b4,0x7a4a3a];
  const shames=[];
  function shame(size){
    const g=new THREE.Group();
    for(let k=0;k<7+Math.floor(R()*5);k++){
      const m=new THREE.Mesh(new THREE.IcosahedronGeometry(size*(0.3+R()*0.35),1),
        new THREE.MeshLambertMaterial({color:organCols[Math.floor(R()*organCols.length)],flatShading:true,emissive:0x140606}));
      m.position.set((R()-0.5)*size,(R()-0.2)*size*0.6,(R()-0.5)*size);m.scale.set(1,0.6+R()*0.5,0.8+R()*0.5);g.add(m);
    }
    for(let k=0;k<2;k++){const c=new THREE.Mesh(new THREE.TorusGeometry(size*0.25,size*0.07,5,10,Math.PI*1.4),
      new THREE.MeshLambertMaterial({color:0x8a90a4,flatShading:true}));c.position.set((R()-0.5)*size*0.6,size*0.3,(R()-0.5)*size*0.6);c.rotation.set(R()*3,R()*3,0);g.add(c);}
    const paw=new THREE.Mesh(new THREE.ConeGeometry(size*0.08,size*0.4,5),new THREE.MeshLambertMaterial({color:0x5a4034}));
    paw.position.set(size*0.45,-size*0.1,0);paw.rotation.z=1.2;g.add(paw);
    return g;
  }
  // They grow on the airways, so each one is put on a branch of the lung's tree (lungs.js leaves the points).
  for(const ch of P.chambers.filter(c=>c.kind==='bronchial')){
    for(let k=0;k<14;k++){
      const s=shame(3+R()*5);
      if(ch.perches&&ch.perches.length)s.position.copy(ch.perches[Math.floor(R()*ch.perches.length)]);
      else{const a=ch.side+(R()-0.5)*1.4,rr=P.radiusAt(P.TOP-ch.y)+40+R()*140,[x,z]=polar(a,rr);
        s.position.set(x,ch.y+(R()-0.5)*ch.H*0.6,z);}
      s.rotation.y=R()*6;shames.push(s);
      movers.push({kind:'pulse',g:s,ph:R()*6.28,sp:0.5+R()*0.6});
    }
  }
  const wallShames=[];
  const BRON=P.LAYERS.find(L=>L.kind==='bronchial');
  if(BRON)for(let k=0;k<12;k++){
    const d=BRON.top+30+R()*(BRON.bottom-BRON.top-60),a=R()*Math.PI*2,s=shame(4+R()*4);
    const [x,z]=polar(a,wallAt(d)-3);s.position.set(x,Y(d),z);wallShames.push(s);
    movers.push({kind:'pulse',g:s,ph:R()*6.28,sp:0.5+R()*0.6});
  }
  card(shameInfo,shames.concat(wallShames));

  // ---- into the scene ----
  // The chamber animals go in the pit's own group; the wall animals go in its "fine" group with the rest of
  // what hangs off the wall, because in the section view the near wall has been cut away and they with it.
  for(const o of all.concat(shames))P.group.add(o);
  for(const o of climbers.concat(wallShames))P.fine.add(o);

  animHooks.push(now=>{
    const t=now/1000;
    for(const m of movers){
      if(m.kind==='leech'){for(let i=0;i<m.arms.length;i++){const s=i?1:-1;
        m.arms[i].rotation.z=s*(0.5+0.3*Math.sin(t*0.9+m.ph+i));m.arms[i].rotation.x=0.4*Math.sin(t*0.6+m.ph);}}
      else if(m.kind==='swim'){const a=m.a+t*m.sp;
        m.g.position.set(m.cx+Math.cos(a)*m.r,m.y+0.25*Math.sin(t*0.8+m.ph),m.cz+Math.sin(a)*m.r);
        m.g.rotation.y=-a+(m.sp>0?0:Math.PI);
        const sw=0.4*Math.sin(t*1.4+m.ph);m.g.userData['arm-1'].rotation.x=sw;m.g.userData['arm1'].rotation.x=-sw;}
      else if(m.kind==='climb'){const d=m.d+6*Math.sin(t*0.05+m.ph),[x,z]=polar(m.a,wallAt(d)-1.6);m.g.position.set(x,Y(d),z);
        const sw=0.5*Math.sin(t*0.9+m.ph);m.g.userData['arm-1'].rotation.x=sw;m.g.userData['arm1'].rotation.x=-sw;}
      else if(m.kind==='pulse'){const k=1+0.08*Math.sin(t*m.sp+m.ph)+0.03*Math.sin(t*m.sp*3.1);m.g.scale.set(k,1/k,k);}
    }
  });
  ctx.details=Object.assign(ctx.details||{},{fauna:(all.length+climbers.length+shames.length+wallShames.length)+' animals'});
}
