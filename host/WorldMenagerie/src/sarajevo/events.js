// ---------- what happens in Sarajevo ----------
// Every minute or two something happens, and the Events button fires any of them now (src/core/happenings.js:
// the notice, the Go and look button, the Events panel; #event=<name> fires one on arrival). Three of them are
// the city's history, played in today's streets with captions; the rest are its days.
//
//   assassination  28 June 1914: the Archduke Franz Ferdinand's motorcade on the Appel Quay. Čabrinović's bomb at the
//              Ćumurija bridge, which bounces off the folded hood and goes off under the car behind; the reception
//              at the City Hall; the drive back, the wrong turn into Franz Joseph Street at the Latin Bridge, the
//              car stopping to reverse, and Gavrilo Princip, a step away outside Schiller's delicatessen
//   olympics   8 February 1984: the XIV Winter Games open at Koševo. The torch comes into the stadium and up to the
//              cauldron, Sanda Dubravčić lights it, and the fireworks go up over the valley
//   bobsleigh  a four-man bob down the 1984 track on Trebević, through the Omega and the Double S, as it ran then
//   siege      the night of 25 August 1992: incendiary shells on the National Library in the City Hall, the city
//              blacked out, the building burning through the night and its ash falling on the city. Told without
//              anyone shown hurt; the captions say what the siege was
//   iftar      a Ramadan sunset from the Yellow Bastion: the cannon fires to end the day's fast, and the minarets'
//              balconies light
//   pigeons    the pigeons of Baščaršija go up from round the Sebilj, circle, and come down again
//   cablecar   a ride up Trebević in a gondola, from Bistrik to Vidikovac
import { createHappenings } from '../core/happenings.js';
import { mkRng } from '../core/rng.js';

export function events(api){
  const {THREE,C,scene,camera,groundH,P,animHooks}=api;const K=C.sarajevoEvents||{};
  const R=Math.random;
  let H=null;const run=fn=>H.run(fn),notice=(...a)=>H.notice(...a);
  const setH=h=>{const f=api.setHour||window.setHour;if(f)f(h);};
  const tag=o=>{o.traverse(q=>{q.userData.noFingerprint=true;q.userData.noWire=true;});return o;};
  const M=c=>new THREE.MeshLambertMaterial({color:c}),B=(w,h,d)=>new THREE.BoxGeometry(w,h,d);
  const at=(m,x,y,z)=>{m.position.set(x,y,z);return m;};
  const soft=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.35,'rgba(255,255,255,0.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
  const glow=(col,s)=>{const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:soft,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sp.scale.setScalar(s);return sp;};

  // ---- captions: a line at the bottom, changing as a scene goes on ----
  const cap=document.createElement('div');
  cap.style.cssText='position:fixed;left:50%;bottom:70px;transform:translateX(-50%);max-width:min(660px,calc(100vw - 32px));padding:9px 14px;background:rgba(14,12,10,.8);color:#f2e8d4;font:14px/1.45 Georgia,serif;border-left:3px solid #c8a060;display:none;z-index:11;pointer-events:none';
  document.body.appendChild(cap);
  const captions=(list)=>{let shown='';return t=>{let c='';for(const [a,b,text] of list)if(t>=a&&t<b)c=text;if(c!==shown){shown=c;cap.textContent=c;cap.style.display=c?'block':'none';}};};
  const hideCap=()=>{cap.style.display='none';};

  // ---- a path through the streets: [x, z] points, sampled by distance ----
  function path(pts){const seg=[],len=[0];for(let i=0;i+1<pts.length;i++){const d=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);seg.push(d);len.push(len[i]+d);}
    const total=len[len.length-1];
    return {total,at(s){s=Math.max(0,Math.min(total,s));let i=0;while(i<seg.length-1&&len[i+1]<s)i++;const f=(s-len[i])/(seg[i]||1),[ax,az]=pts[i],[bx,bz]=pts[i+1];return [ax+(bx-ax)*f,az+(bz-az)*f,Math.atan2(bx-ax,bz-az)];}};}

  // ---- people: a body, a head, and what they wear; built once per look ----
  function person(coat,head,hat){const g=new THREE.Group();g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.27,1.35,7).translate(0,0.68,0),M(coat)),0,0,0));
    g.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.13,8,6),M(head||0xd8b090)),0,1.5,0));if(hat)g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.14,8),M(hat)),0,1.64,0));return g;}

  // ================================================================ 28 June 1914
  // The cars are open tourers of the time: a long bonnet, high sides, the hood folded down behind, spoked wheels.
  // The Archduke's, the Gräf & Stift, third in line: he in his blue tunic and the helmet with green plumes, Sophie
  // in white with a wide hat, Count Harrach on the running board.
  function tourer(body,archduke){const g=new THREE.Group(),bm=M(body),blk=M(0x18181a);
    g.add(at(new THREE.Mesh(B(1.7,0.75,4.6),bm),0,0.85,0));g.add(at(new THREE.Mesh(B(1.5,0.5,1.4),bm),0,1.35,1.4));          // the body, the bonnet
    g.add(at(new THREE.Mesh(B(1.6,0.1,0.1),M(0xb8a060)),0,1.55,0.7));g.add(at(new THREE.Mesh(B(1.4,0.5,0.05),M(0x9ab0c0)),0,1.85,0.62));   // the windscreen
    g.add(at(new THREE.Mesh(B(1.6,0.35,0.7),blk),0,1.35,-2.3));                                                          // the folded hood
    for(const [x,z] of [[0.85,1.6],[-0.85,1.6],[0.85,-1.5],[-0.85,-1.5]]){const w=new THREE.Mesh(new THREE.TorusGeometry(0.42,0.07,6,14),blk);w.rotation.y=Math.PI/2;w.position.set(x,0.45,z);g.add(w);
      const h=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,0.12,8).rotateZ(Math.PI/2),M(0xb8a060));h.position.set(x,0.45,z);g.add(h);}
    const drv=person(0x2a2a2e,null,0x2a2a2e);drv.scale.setScalar(0.62);drv.position.set(0.35,1.1,0.2);g.add(drv);
    if(archduke){const fd=person(0x2a4a8a,null,null);fd.scale.setScalar(0.66);fd.position.set(-0.35,1.15,-1.2);g.add(fd);
      fd.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.15,0.18,8),M(0x2a2a2e)),0,1.66,0));
      const pl=new THREE.Mesh(new THREE.SphereGeometry(0.2,8,6),M(0x3a9a4a));pl.scale.set(1,1.4,1);pl.position.set(0,1.92,0);fd.add(pl);   // the plumes
      const so=person(0xf2f0ea,null,0xf2f0ea);so.scale.setScalar(0.62);so.position.set(0.35,1.12,-1.2);g.add(so);
      so.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.34,0.34,0.05,12),M(0xf2f0ea)),0,1.62,0));
      const hr=person(0x6a7a6a,null,0x3a3a3a);hr.scale.setScalar(0.62);hr.position.set(-1.05,0.55,-0.4);g.add(hr);
      g.add(at(new THREE.Mesh(B(0.4,0.3,0.02),M(0xe8d8a0)),-0.6,1.7,2.2));}                                              // the pennant
    else{for(const x of [-0.35,0.35]){const p=person(0x3a3e48,null,x<0?0x2a2a2e:null);p.scale.setScalar(0.62);p.position.set(x,1.1,-1.2);g.add(p);}}
    return g;}
  function f1914(){const q=(K.quay||[]).map(p=>P(p)),turn=(K.turn||[]).map(p=>P(p));if(q.length<3||turn.length<2)return;
    setH(10.2);
    const out=path(q);
    // the way back: the quay from its east end to the corner, then the turn into Franz Joseph Street
    let ci=0,best=1e9;for(let i=0;i<q.length;i++){const d=Math.hypot(q[i][0]-turn[0][0],q[i][1]-turn[0][1]);if(d<best){best=d;ci=i;}}
    const back=path([...q.slice(ci).reverse(),...turn]);
    const [bx,bz]=P(K.bombAt||[43.856961,18.426751]);let sBomb=0,bb=1e9;for(let s=0;s<out.total;s+=2){const [x,z]=out.at(s),d=Math.hypot(x-bx,z-bz);if(d<bb){bb=d;sBomb=s;}}
    const grp=tag(new THREE.Group());scene.add(grp);
    const cars=[tourer(0x1e2a22),tourer(0x22222a),tourer(0x2a3a2a,true),tourer(0x22222a),tourer(0x1e2a22),tourer(0x2a2a2e)];cars.forEach(c=>{tag(c);grp.add(c);});const GAP=16,ARCH=2;
    // the crowd along the quay, on the river side and the houses' side, thinner where the bomb is to go
    const crowd=new THREE.Group();grp.add(crowd);const cr=mkRng(1914),COATS=[0x2a2a30,0x3a3530,0x4a4038,0xe8e4da,0x5a4a3a,0x24283a,0xd8d0c0];
    for(let s=sBomb-260;s<out.total-30;s+=2.2)for(const sd of [-1,1]){if(cr()<0.35)continue;const [x,z,ry]=out.at(s),nx=Math.cos(ry),nz=-Math.sin(ry),o=sd*(7+cr()*2.5);if(api.inWater&&api.inWater(x+nx*o,z+nz*o))continue;
      const p=person(COATS[Math.floor(cr()*COATS.length)],null,cr()<0.6?0x1a1a1a:null);p.position.set(x+nx*o,groundH(x+nx*o,z+nz*o),z+nz*o);p.rotation.y=ry+(sd>0?-Math.PI/2:Math.PI/2);crowd.add(p);}
    // Princip, at the corner
    const [px0,pz0]=P(K.princip||[43.85795,18.42897]);const pr=person(0x2a2a2a,null,0x1e1e1e);pr.position.set(px0,groundH(px0,pz0),pz0);grp.add(pr);
    const flash=glow(0xffe0a0,3);flash.visible=false;grp.add(flash);
    const smoke=[];const sm=new THREE.MeshLambertMaterial({color:0xd8d4cc,transparent:true,opacity:0.6,depthWrite:false});
    let t=0,phase=0,s0=sBomb-150,carPose=null,bang=0;
    const CAP=captions([[0,8,'Sarajevo, Sunday 28 June 1914, ten in the morning. The heir to the Austro-Hungarian throne, the Archduke Franz Ferdinand, and his wife Sophie drive along the Appel Quay to the City Hall. Six cars; theirs is the third, its hood folded down.'],
      [8,16,'Six young conspirators of Young Bosnia are waiting in the crowd along the river, armed from Serbia. Most of them lose their nerve as the cars pass.'],
      [16,26,'At the Ćumurija bridge Nedeljko Čabrinović throws a bomb. It bounces off the folded hood and goes off under the car behind, wounding the officers in it and people in the crowd.'],
      [26,34,'The motorcade drives on to the City Hall at speed. At the reception the Archduke is furious. Afterwards he decides to go to the hospital to see the wounded.'],
      [34,52,'Noon, nearly. The cars come back along the quay. Nobody has told the drivers the route has changed: at the Latin Bridge the first two turn right into Franz Joseph Street, as planned that morning.'],
      [52,60,'The Archduke\'s car follows them. General Potiorek shouts that it is the wrong way; the driver brakes, and the car stops to reverse - in front of Schiller\'s delicatessen.'],
      [60,70,'Gavrilo Princip, nineteen, is standing a step away. He fires twice.'],
      [70,84,'Sophie dies before they reach the Konak; Franz Ferdinand a few minutes after. A month later Austria-Hungary declares war on Serbia, and within a week most of Europe is at war.'],
      [84,96,'The corner is a museum now, and the bridge was called Princip\'s Bridge for most of the last century. It is the Latin Bridge again.']]);
    const pose=(c,x,z,ry)=>{c.position.set(x,groundH(x,z),z);c.rotation.y=ry;};
    notice('28 June 1914','the Archduke Franz Ferdinand\'s motorcade on the Appel Quay, and the corner by the Latin Bridge.',
      ()=>{if(carPose){const [x,y,z]=carPose;return [x-14,y+9,z+16,x,y,z];}const [x,z]=out.at(sBomb);return [x-30,groundH(x,z)+14,z+22,x,groundH(x,z)+2,z];},()=>carPose);
    run((now,dt)=>{t+=dt;CAP(t);
      if(phase===0){s0+=dt*9;for(let i=0;i<6;i++){const [x,z,ry]=out.at(s0-i*GAP);pose(cars[i],x,z,ry);}
        const [ax,az]=out.at(s0-ARCH*GAP);carPose=[ax,groundH(ax,az)+1.5,az];
        if(!bang&&s0-ARCH*GAP>=sBomb){bang=1;const [x,z]=out.at(sBomb-3*GAP+4);flash.position.set(x,groundH(x,z)+1.2,z);flash.scale.setScalar(14);flash.visible=true;
          for(let i=0;i<14;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),sm.clone());m.position.set(x+(R()-0.5)*3,groundH(x,z)+0.8+R()*2,z+(R()-0.5)*3);tag(m);grp.add(m);smoke.push({m,a:0});}}
        if(bang)flash.scale.multiplyScalar(0.9);if(t>=30){phase=1;flash.visible=false;}}
      if(phase===1){// the reception, then the way back: start the cars at the east end, heading west
        s0=0;phase=2;}
      if(phase===2){const lead=Math.min(back.total,s0),v=t<52?9:Math.max(0,9-(t-52)*3);s0+=dt*v;
        for(let i=0;i<6;i++){let si=s0-i*GAP;if(i>=ARCH&&t>=55)si=Math.min(si,back.total-6-(i-ARCH)*GAP);const [x,z,ry]=back.at(si);pose(cars[i],x,z,ry);}
        const c=cars[ARCH];carPose=[c.position.x,c.position.y+1.5,c.position.z];
        if(t>=60&&t<61.6){const b=(t-60)%0.8<0.12;flash.visible=b;flash.position.set(pr.position.x,pr.position.y+1.3,pr.position.z);flash.scale.setScalar(2.2);}else flash.visible=false;
        // Princip steps forward as the car stops
        if(t>56&&t<60){const c2=cars[ARCH].position;pr.position.lerp(new THREE.Vector3(c2.x,pr.position.y,c2.z),dt*0.25);}}
      for(let i=smoke.length-1;i>=0;i--){const s=smoke[i];s.a+=dt;s.m.scale.setScalar(1+s.a*1.4);s.m.position.y+=dt*0.8;s.m.material.opacity=0.6*Math.max(0,1-s.a/9);if(s.a>9){grp.remove(s.m);smoke.splice(i,1);}}
      if(t>96){scene.remove(grp);hideCap();carPose=null;return false;}return true;});}

  // ================================================================ 8 February 1984
  function olympics(){const cd=api.ctx.cauldron;if(!cd)return;setH(15.2);
    const g=cd.g,world=new THREE.Vector3(cd.x,cd.y,cd.z);g.updateMatrixWorld(true);g.localToWorld(world);const base=new THREE.Vector3(0,0,0);g.localToWorld(base);
    const grp=tag(new THREE.Group());scene.add(grp);
    // the torchbearer: from the far end of the field to the foot of the tower, then up its steps
    const runner=person(0xf2f2f2,null,null);runner.scale.setScalar(1.6);const torch=glow(0xffb040,3);torch.position.set(0.3,3.2,0);runner.add(torch);grp.add(runner);tag(runner);
    const fire=new THREE.Group();for(let i=0;i<3;i++){const f=new THREE.Mesh(new THREE.ConeGeometry(1.6-i*0.4,4.5-i,10).translate(0,(4.5-i)/2,0),new THREE.MeshBasicMaterial({color:[0xff7a20,0xffb040,0xfff0a0][i],transparent:true,opacity:0.85,depthWrite:false}));fire.add(f);}
    fire.add(glow(0xffa040,22));fire.position.copy(world);fire.visible=false;grp.add(fire);
    const start=base.clone().add(new THREE.Vector3().subVectors(base,world).setY(0).multiplyScalar(0.9));start.y=groundH(start.x,start.z)+0.2;
    const foot=world.clone();foot.y=groundH(foot.x,foot.z)+0.2;
    // fireworks: bursts of points over the stadium
    const bursts=[];const fw=()=>{const n=140,pos=new Float32Array(n*3),vel=[];const c=new THREE.Color().setHSL(R(),0.8,0.6),o=base.clone().add(new THREE.Vector3((R()-0.5)*160,90+R()*90,(R()-0.5)*160));
      for(let i=0;i<n;i++){const v=new THREE.Vector3(R()-0.5,R()-0.5,R()-0.5).normalize().multiplyScalar(18+R()*10);vel.push(v);pos.set([o.x,o.y,o.z],i*3);}
      const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));const m=new THREE.PointsMaterial({color:c,size:3,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
      const p=new THREE.Points(ge,m);p.frustumCulled=false;grp.add(p);bursts.push({p,vel,o,a:0});};
    let t=0,lit=false,next=0;
    const CAP=captions([[0,10,'Koševo, Wednesday 8 February 1984. The XIV Winter Olympic Games open: the first held in a socialist country, in a city most of the world had to find on a map.'],
      [10,22,'Fifty thousand in the stadium. The torch has come from Olympia, and through every republic of Yugoslavia.'],
      [22,32,'The figure skater Sanda Dubravčić carries it up the steps to the cauldron, and lights it.'],
      [32,48,'Sarajevo\'s Games: Torvill and Dean\'s Bolero at Zetra, Jure Franko\'s silver on Bjelašnica, the mascot Vučko the wolf. Eight years later the stadium\'s training pitches were a cemetery.']]);
    notice('8 February 1984','the XIV Winter Olympics open at Koševo: the torch comes in, the cauldron is lit, and the fireworks go up.',()=>[base.x+160,base.y+70,base.z+110,world.x,world.y-6,world.z],null);
    run((now,dt)=>{t+=dt;CAP(t);
      if(t<14){runner.position.lerpVectors(start,foot,t/14);runner.lookAt(foot.x,runner.position.y,foot.z);}
      else if(t<24){runner.position.lerpVectors(foot,world.clone().setY(world.y-1),(t-14)/10);}
      else if(!lit){lit=true;fire.visible=true;}
      if(lit){fire.children.forEach((f,i)=>{if(f.isMesh)f.scale.set(1+0.1*Math.sin(t*9+i),0.85+0.25*Math.abs(Math.sin(t*6.3+i*2)),1);});if(t>next&&t<46){next=t+0.5+R()*0.8;fw();}}
      for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.a+=dt;const pos=b.p.geometry.attributes.position;for(let k=0;k<b.vel.length;k++){const v=b.vel[k];pos.setXYZ(k,b.o.x+v.x*b.a,b.o.y+v.y*b.a-4.9*b.a*b.a,b.o.z+v.z*b.a);}pos.needsUpdate=true;b.p.material.opacity=Math.max(0,1-b.a/2.4);
        if(b.a>2.4){grp.remove(b.p);bursts.splice(i,1);}}
      if(t>60){scene.remove(grp);hideCap();return false;}return true;});}

  // ================================================================ the bobsleigh
  function bobsleigh(){const rows=api.ctx.bobLine;if(!rows||rows.length<10)return;setH(13);
    const bob=tag(new THREE.Group());const red=M(0xc83a2a);bob.add(at(new THREE.Mesh(B(0.75,0.55,3.4),red),0,0.45,0));bob.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.4,10,6).scale(1,0.7,1.4),red),0,0.5,1.7));
    for(let i=0;i<4;i++){const p=person(0x2a4a8a,0xe8e8e8,null);p.scale.setScalar(0.55);p.position.set(0,0.5,1.0-i*0.75);bob.add(p);}
    for(const x of [-0.32,0.32])bob.add(at(new THREE.Mesh(B(0.06,0.06,3.5),M(0x9aa0a6)),x,0.12,0));
    scene.add(bob);
    const pts=rows.map(r=>[r.x,r.z]);const pa=path(pts);let s=0,v=4,t=0;
    const CAP=captions([[0,8,'The 1984 bobsleigh and luge track on Trebević: 1,300 m of concrete down the mountain, built for the Games.'],[8,20,'Thirteen curves. A four-man bob reaches over 120 km/h through the lower ones.'],
      [20,40,'In the siege the track was a front line, its curves gun positions. It has not been used since; it is covered in graffiti, and the forest is growing into it.']]);
    let pos=null;
    notice('The bobsleigh','a four-man bob down the 1984 Olympic track on Trebević.',()=>{const a=rows[0],b=rows[Math.min(rows.length-1,5)],L=Math.hypot(b.x-a.x,b.z-a.z)||1;return [a.x-(b.x-a.x)/L*13,a.g+8,a.z-(b.z-a.z)/L*13,b.x,b.g,b.z];},()=>pos);
    run((now,dt)=>{t+=dt;CAP(t);v=Math.min(34,v+dt*2.2);s+=v*dt;const [x,z,ry]=pa.at(s);
      // the bank: ride up the outer wall in a curve
      const i=Math.min(rows.length-1,Math.floor(s/pa.total*(rows.length-1))),r=rows[i],bank=(r.hl-r.hr)/2.4;
      bob.position.set(x+r.nx*bank*0.9,r.g+0.05+Math.abs(bank)*0.9,z+r.nz*bank*0.9);bob.rotation.set(0,ry,0);bob.rotateZ(-bank*0.9);
      pos=[bob.position.x,bob.position.y+1,bob.position.z];
      if(s>=pa.total||t>70){scene.remove(bob);hideCap();pos=null;return false;}return true;});}

  // ================================================================ the night of 25 August 1992
  function siege(){setH(22.6);const vij=(C.landmarks||[]).find(l=>l.model==='vijecnica');if(!vij)return;const [vx,vz]=P(vij.at),vg=groundH(vx,vz),top=vg+(vij.height||20);
    const grp=tag(new THREE.Group());scene.add(grp);
    // the flames: in the windows and over the roof, flickering
    const fl=[];const ring=(vij.outline||[]).map(p=>P(p));
    for(let i=0;i<70;i++){const k=Math.floor(R()*ring.length),a=ring[k],b=ring[(k+1)%ring.length],f=R(),x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f,y=vg+3+R()*(top-vg);
      const s=glow(R()<0.5?0xff6a20:0xffa040,4+R()*5);s.position.set(x+(vx-x)*0.05,y,z+(vz-z)*0.05);grp.add(s);fl.push({s,ph:R()*10,b:s.scale.x});}
    for(let i=0;i<26;i++){const s=glow(0xff7a2a,10+R()*12);s.position.set(vx+(R()-0.5)*40,top+2+R()*12,vz+(R()-0.5)*40);grp.add(s);fl.push({s,ph:R()*10,b:s.scale.x});}
    const light=new THREE.PointLight(0xff8a3a,0,240,1.6);light.position.set(vx,top+10,vz);grp.add(light);
    // the smoke column, and the ash: grey flakes drifting down over the whole old town
    const smoke=[];const smm=new THREE.MeshLambertMaterial({color:0x3a3634,transparent:true,opacity:0.5,depthWrite:false});
    const N=1600,ap=new Float32Array(N*3);for(let i=0;i<N;i++)ap.set([vx+(R()-0.5)*900,vg+R()*260,vz+(R()-0.5)*900],i*3);
    const ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.BufferAttribute(ap,3));const ash=new THREE.Points(ag,new THREE.PointsMaterial({color:0xb8b2a8,size:1.2,transparent:true,opacity:0,depthWrite:false}));ash.frustumCulled=false;grp.add(ash);
    // flashes on the hills, far off: the guns
    const flashes=[];for(let i=0;i<5;i++){const s=glow(0xffd0a0,30);s.visible=false;grp.add(s);flashes.push(s);}
    // the blackout: the window lights out across the city for as long as it lasts
    // Every lit window, shopfront and lamp in the city: the engine sets their glow each frame from the hour, and this
    // hook runs after it, so it holds them dark. The glows (additive sprites and points: the street lamps, the
    // minarets' balconies) are hidden, and shown again when the night is over.
    const EM=new Set(),GL=[];scene.traverse(o=>{if(o===grp||o.parent===grp)return;const ms=Array.isArray(o.material)?o.material:o.material?[o.material]:[];
      for(const m of ms){if(m.emissive)EM.add(m);if(((o.isSprite||o.isPoints)&&m.blending===THREE.AdditiveBlending)||(o.isPoints&&m.transparent&&m.color&&m.color.r>0.9)){GL.push([o,o.visible]);break;}}});
    const dark=()=>{for(const m of EM)m.emissive.setRGB(0,0,0);for(const [o] of GL)o.visible=false;};
    const relight=()=>{for(const [o,v] of GL)o.visible=v;};
    let t=0,next=0;
    const CAP=captions([[0,10,'The siege of Sarajevo: from April 1992 to February 1996, 1,425 days, the longest siege of a capital city in modern war. The Bosnian Serb army held the hills all round the valley.'],
      [10,22,'There was no electricity, no gas and no running water for most of it. More than 11,000 people were killed in the city, 1,601 of them children.'],
      [22,34,'On the night of 25 August 1992 incendiary shells struck the City Hall, then the National and University Library. The fire burned through the night; firemen worked under fire, and people formed chains to carry books out of it.'],
      [34,46,'About two million books, manuscripts and documents burned. For days afterwards the ash fell on the city, and people found charred pages in the streets.'],
      [46,58,'The cellist Vedran Smailović played in the ruins. The shell scars filled with red resin round the city are called Sarajevo roses.'],
      [58,70,'The City Hall was rebuilt to Wittek\'s design and reopened in 2014. The plaque at its door ends: "Do not forget, remember and warn."']]);
    notice('25 August 1992','the night the National Library burned, in the siege of Sarajevo.',()=>[vx-160,vg+70,vz+60,vx,vg+14,vz],null);
    run((now,dt)=>{t+=dt;CAP(t);dark();const ramp=Math.min(1,t/6);
      for(const f of fl){f.s.material.opacity=ramp*(0.6+0.4*Math.sin(now*0.012+f.ph));f.s.scale.setScalar(f.b*(0.85+0.3*Math.abs(Math.sin(now*0.007+f.ph))));}
      light.intensity=ramp*(2+1*Math.sin(now*0.01));
      if(R()<dt*6){const m=new THREE.Mesh(new THREE.SphereGeometry(6,8,6),smm.clone());m.position.set(vx+(R()-0.5)*30,top,vz+(R()-0.5)*30);grp.add(m);smoke.push({m,a:0});}
      for(let i=smoke.length-1;i>=0;i--){const s=smoke[i];s.a+=dt;s.m.position.y+=dt*9;s.m.position.x+=dt*3;s.m.scale.setScalar(1+s.a*0.5);s.m.material.opacity=0.5*Math.max(0,1-s.a/22);if(s.a>22){grp.remove(s.m);smoke.splice(i,1);}}
      ash.material.opacity=Math.min(0.9,Math.max(0,(t-28)/10));if(t>28){const p=ag.attributes.position;for(let i=0;i<N;i++){let y=p.getY(i)-dt*(1.5+(i%7)*0.3);if(y<vg)y=vg+260;p.setY(i,y);p.setX(i,p.getX(i)+Math.sin(now*0.001+i)*dt*0.6);}p.needsUpdate=true;}
      if(t>next){next=t+2+R()*5;const s=flashes[Math.floor(R()*flashes.length)],a=R()*Math.PI*2,d=1800+R()*900;s.position.set(vx+Math.cos(a)*d,vg+300+R()*250,vz+Math.sin(a)*d);s.visible=true;s.userData.t=0.25;}
      for(const s of flashes)if(s.visible){s.userData.t-=dt;if(s.userData.t<0)s.visible=false;}
      if(t>72){scene.remove(grp);hideCap();relight();return false;}return true;});}

  // ================================================================ a Ramadan sunset
  function iftar(){const zt=(C.landmarks||[]).find(l=>l.model==='bastion');if(!zt||!zt.gun)return;setH(19.25);
    const [gx,gz]=P(zt.gun),gy=groundH(gx,gz)+4;const [vx,vz]=P(K.iftarView||[43.86185,18.4385]);
    const grp=tag(new THREE.Group());scene.add(grp);const flash=glow(0xffe0b0,1);flash.position.set(gx,gy,gz);flash.visible=false;grp.add(flash);
    const puffs=[];const pm=new THREE.MeshLambertMaterial({color:0xf2f0ea,transparent:true,opacity:0.8,depthWrite:false});let t=0,fired=false;
    const CAP=captions([[0,9,'Ramadan, at the Yellow Bastion. The city below waits for the sun to go down behind Igman.'],[9,18,'Top! The cannon fires: the fast is over for the day. The ezan begins from the minarets, one after another across the valley.'],
      [18,30,'In every house the iftar is on the table: dates, somun bread, begova čorba. The minarets\' balconies light as the dark comes up from the river.']]);
    notice('Iftar','a Ramadan sunset: the cannon on the Yellow Bastion fires to end the day\'s fast.',()=>[vx,groundH(vx,vz)+(K.iftarLift||24),vz,gx-200,gy-40,gz+120],null);
    run((now,dt)=>{t+=dt;CAP(t);
      if(t>9&&!fired){fired=true;flash.visible=true;flash.scale.setScalar(16);for(let i=0;i<12;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(1.2,8,6),pm.clone());m.position.set(gx+(R()-0.5)*2-2,gy+(R()-0.5)*1.5,gz+(R()-0.5)*2+2);grp.add(m);puffs.push({m,a:0});}}
      if(flash.visible){flash.scale.multiplyScalar(0.85);if(flash.scale.x<0.5)flash.visible=false;}
      for(const p of puffs){p.a+=dt;p.m.scale.setScalar(1+p.a*1.2);p.m.position.y+=dt*0.7;p.m.position.x-=dt*0.9;p.m.material.opacity=0.8*Math.max(0,1-p.a/10);}
      if(t>32){scene.remove(grp);hideCap();return false;}return true;});}

  // ================================================================ the pigeons
  function pigeons(){const s=(C.landmarks||[]).find(l=>l.model==='sebilj');if(!s)return;const [sx,sz]=P(s.at),sy=groundH(sx,sz);
    const N=160,geo=new THREE.ConeGeometry(0.12,0.38,4).rotateX(Math.PI/2),im=new THREE.InstancedMesh(geo,M(0x8a8c94),N);tag(im);im.frustumCulled=false;scene.add(im);
    const rng=mkRng(1891),B0=[];for(let i=0;i<N;i++){const a=rng()*Math.PI*2,r=3+rng()*16;B0.push({x:sx+Math.cos(a)*r,z:sz+Math.sin(a)*r,ph:rng()*6.28,r:10+rng()*22,h:6+rng()*14,w:0.5+rng()*0.4});}
    const o=new THREE.Object3D();let t=0;
    notice('The pigeons','the pigeons of Baščaršija go up from round the Sebilj all at once, circle the square, and come down again.',()=>{const v=(C.views||{})['The Sebilj and Pigeon Square'];if(v){const [cx,cz]=P(v[0]);return [cx,v[0][2]+3,cz,sx,sy+5,sz];}return [sx+22,sy+9,sz+18,sx,sy+6,sz];},null);
    run((now,dt)=>{t+=dt;const up=Math.min(1,t/2.5),down=Math.max(0,Math.min(1,(t-18)/5)),f=up*(1-down);
      for(let i=0;i<N;i++){const b=B0[i],a=b.ph+t*b.w,x=b.x+(sx+Math.cos(a)*b.r-b.x)*f,z=b.z+(sz+Math.sin(a)*b.r-b.z)*f,y=sy+0.15+(b.h+Math.sin(t*2+b.ph))*f;
        o.position.set(x,y,z);o.rotation.set(0,f>0.05?-a:b.ph,0);o.scale.set(1+f*1.4*Math.abs(Math.sin(t*14+i)),1,1);o.updateMatrix();im.setMatrixAt(i,o.matrix);}
      im.instanceMatrix.needsUpdate=true;if(t>25){scene.remove(im);return false;}return true;});}

  // ================================================================ up Trebević
  function cablecar(){const cc=api.ctx.cablecar;if(!cc)return;setH(17.4);
    // ride whichever cabin is about to leave Bistrik on the way up
    let best=0,bs=1e9;for(let i=0;i<cc.cabs.length;i++){const c=cc.cabs[i],[x0,z0]=cc.at(0),d=Math.hypot(c.position.x-x0,c.position.z-z0);if(d<bs){bs=d;best=i;}}
    const cab=cc.cabs[best];let t=0;
    const CAP=captions([[0,10,'The Trebević cable car, from Bistrik over the roofs of the old town and up the mountain: 2.1 km and seven minutes, to Vidikovac at 1,160 m.'],
      [10,24,'Built in 1959; for thirty years Sarajevans went up it to the mountain on Sundays. In 1992 the front line crossed it, and it stood broken through the war and after.'],
      [24,40,'It reopened in April 2018, with new gondolas. Behind you, the whole city in its valley.']]);
    notice('Up Trebević','a ride in a gondola of the cable car, from Bistrik up the mountain.',()=>{const p=cab.position;return [p.x-18,p.y+16,p.z+18,p.x,p.y-2,p.z];},()=>{const p=cab.position;return [p.x,p.y-4,p.z];});
    run((now,dt)=>{t+=dt;CAP(t);if(t>60){hideCap();return false;}return true;});}

  H=createHappenings(api,{events:{
      assassination:['28 June 1914',f1914],olympics:['The 1984 Olympics',olympics],bobsleigh:['The bobsleigh',bobsleigh],siege:['The siege, 1992',siege],
      iftar:['Iftar',iftar],pigeons:['The pigeons',pigeons],cablecar:['Up Trebević',cablecar]},
    order:['pigeons','cablecar','iftar','bobsleigh','pigeons','assassination','olympics'],first:K.first||40000,every:K.every||[70000,130000],
    colours:{bg:'rgba(20,16,12,.86)',fg:'#f0e6d2',edge:'#8a6a40',btn:'rgba(60,44,28,.9)',btnEdge:'#a8844e'}});
}
