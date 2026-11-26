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
import { mkRng, hash3 } from '../core/rng.js';

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
  // Built in the stadium's own frame (a group inside the landmark's: x along its long axis, the cauldron's tower at
  // +x) and thrown away after. The crowd is one instanced mesh, and its wave runs in the vertex shader; the performers,
  // the teams, their flags and placards are a few instanced meshes moved each frame; nothing else is drawn per person.
  const OLY_TEAMS=[   // the parade: Greece first, the hosts last; [name, coat, flag bands, how many walk]
    ['Greece',0x2a5aa8,[0x2a5aa8,0xf2f2f2,0x2a5aa8],4],['Andorra',0x2a3a8a,[0x2a3a8a,0xe8c838,0xc8302a],2],['Argentina',0x8ab8e0,[0x8ab8e0,0xf2f2f2,0x8ab8e0],3],
    ['Australia',0x2a7a3a,[0x1a2a6a,0xc8302a,0xf2f2f2],4],['Austria',0xc8302a,[0xc8302a,0xf2f2f2,0xc8302a],10],['Belgium',0x1a1a1a,[0x1a1a1a,0xe8c838,0xc8302a],3],
    ['Bolivia',0x2a7a3a,[0xc8302a,0xe8c838,0x2a7a3a],2],['Bulgaria',0x2a7a3a,[0xf2f2f2,0x2a7a3a,0xc8302a],5],['Canada',0xc8302a,[0xc8302a,0xf2f2f2,0xc8302a],9],
    ['Chile',0x1a2a6a,[0xf2f2f2,0xf2f2f2,0xc8302a],2],['China',0xc8302a,[0xc8302a,0xc8302a,0xe8c838],4],['Chinese Taipei',0x1a2a6a,[0x1a2a6a,0xc8302a,0xc8302a],3],
    ['Costa Rica',0x1a2a6a,[0x1a2a6a,0xc8302a,0x1a2a6a],2],['Cyprus',0xf2f2f2,[0xf2f2f2,0xd88a2a,0xf2f2f2],2],['Czechoslovakia',0x1a3a7a,[0xf2f2f2,0xc8302a,0x1a3a7a],8],
    ['Denmark',0xc8302a,[0xc8302a,0xf2f2f2,0xc8302a],3],['Egypt',0x1a1a1a,[0xc8302a,0xf2f2f2,0x1a1a1a],2],['Finland',0xf2f2f2,[0xf2f2f2,0x1a3a8a,0xf2f2f2],8],
    ['France',0x1a3a8a,[0x1a3a8a,0xf2f2f2,0xc8302a],8],['East Germany',0x2a3a6a,[0x1a1a1a,0xc8302a,0xe8c838],9],['West Germany',0xf2f2f2,[0x1a1a1a,0xc8302a,0xe8c838],9],
    ['Great Britain',0x1a2a6a,[0x1a2a6a,0xc8302a,0x1a2a6a],7],['Hungary',0x2a7a3a,[0xc8302a,0xf2f2f2,0x2a7a3a],4],['Iceland',0x1a3a8a,[0x1a3a8a,0xc8302a,0x1a3a8a],2],
    ['India',0xd88a2a,[0xd88a2a,0xf2f2f2,0x2a7a3a],2],['Italy',0x1a4aa8,[0x2a7a3a,0xf2f2f2,0xc8302a],9],['Japan',0xc8302a,[0xf2f2f2,0xc8302a,0xf2f2f2],7],
    ['South Korea',0xf2f2f2,[0xf2f2f2,0xc8302a,0xf2f2f2],3],['North Korea',0x1a3a8a,[0x1a3a8a,0xc8302a,0x1a3a8a],2],['Lebanon',0xc8302a,[0xc8302a,0x2a7a3a,0xc8302a],2],
    ['Liechtenstein',0x1a2a8a,[0x1a2a8a,0xc8302a,0xc8302a],3],['Luxembourg',0x4a9ad8,[0xc8302a,0xf2f2f2,0x4a9ad8],2],['Mexico',0x2a7a3a,[0x2a7a3a,0xf2f2f2,0xc8302a],2],
    ['Monaco',0xc8302a,[0xc8302a,0xf2f2f2,0xf2f2f2],2],['Mongolia',0xc8302a,[0xc8302a,0x1a3a8a,0xc8302a],2],['Netherlands',0xd8702a,[0xc8302a,0xf2f2f2,0x1a3a8a],4],
    ['New Zealand',0x1a1a1a,[0x1a2a6a,0x1a2a6a,0xc8302a],2],['Norway',0xc8302a,[0xc8302a,0x1a2a6a,0xc8302a],8],['Poland',0xc8302a,[0xf2f2f2,0xf2f2f2,0xc8302a],5],
    ['Puerto Rico',0x1a3a8a,[0xc8302a,0xf2f2f2,0x1a3a8a],2],['Romania',0x1a3a8a,[0x1a3a8a,0xe8c838,0xc8302a],4],['San Marino',0x8ab8e0,[0xf2f2f2,0xf2f2f2,0x8ab8e0],2],
    ['Senegal',0x2a7a3a,[0x2a7a3a,0xe8c838,0xc8302a],2],['Soviet Union',0xc8302a,[0xc8302a,0xc8302a,0xe8c838],11],['Spain',0xc8302a,[0xc8302a,0xe8c838,0xc8302a],4],
    ['Sweden',0x1a4a9a,[0x1a4a9a,0xe8c838,0x1a4a9a],8],['Switzerland',0xc8302a,[0xc8302a,0xf2f2f2,0xc8302a],9],['Turkey',0xc8302a,[0xc8302a,0xf2f2f2,0xc8302a],2],
    ['United States',0x1a2a6a,[0xc8302a,0xf2f2f2,0x1a2a6a],11],['Yugoslavia',0x1a3a8a,[0x1a3a8a,0xf2f2f2,0xc8302a],14]];
  function olympics(){const cd=api.ctx.cauldron;if(!cd)return;setH(14.6);
    const g=cd.g,A=cd.A||120,BB=cd.B||103,ROWS=cd.rows||14;g.updateMatrixWorld(true);
    const st=tag(new THREE.Group());st.name='ceremony';g.add(st);
    const W=(x,y,z)=>new THREE.Vector3(x,y,z).applyMatrix4(g.matrixWorld);
    const RX=A*0.62*1.065,RZ=BB*0.55*1.065,PER=Math.PI*(3*(RX+RZ)-Math.sqrt((3*RX+RZ)*(RX+3*RZ)));
    const trk=a=>[Math.cos(a)*RX,Math.sin(a)*RZ];
    const o=new THREE.Object3D(),cl=new THREE.Color();
    const merge=gs=>{const pos=[];for(const q of gs){const a=q.toNonIndexed().attributes.position.array;for(let i=0;i<a.length;i++)pos.push(a[i]);}
      const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));ge.computeVertexNormals();return ge;};
    const IM=(geo,n,col)=>{const m=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:col===undefined?0xffffff:col}),n);m.frustumCulled=false;m.userData.noFingerprint=true;st.add(m);return m;};
    // a standing figure, its feet at 0: a coat, a head, a hat
    const BODY=merge([new THREE.CylinderGeometry(0.2,0.28,1.35,6).translate(0,0.68,0),new THREE.CylinderGeometry(0.13,0.13,0.3,6).translate(0,1.5,0)]),HAT=new THREE.CylinderGeometry(0.15,0.15,0.12,6).translate(0,1.69,0);
    // ---- the crowd: fifty thousand in the stands, in winter coats; a wave goes round them now and then
    const seats=[];for(let r=0;r<ROWS;r++){const f=0.74+r*0.018+0.009,h=0.5+r*0.62,a=A*f,b=BB*f,per=Math.PI*(3*(a+b)-Math.sqrt((3*a+b)*(a+3*b))),n=Math.floor(per/0.62);
      for(let i=0;i<n;i++){const th=(i+(r%2)*0.5)/n*Math.PI*2;if(Math.abs(Math.atan2(Math.sin(th),Math.cos(th)))<0.1)continue;seats.push([Math.cos(th)*a,h,Math.sin(th)*b]);}}
    const fanGeo=merge([new THREE.BoxGeometry(0.46,0.62,0.36).translate(0,0.31,0),new THREE.BoxGeometry(0.22,0.24,0.22).translate(0,0.76,0)]);
    const U={uT:{value:0},uW:{value:0}},fanM=new THREE.MeshLambertMaterial({color:0xffffff});
    fanM.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);sh.vertexShader='uniform float uT;\nuniform float uW;\n'+sh.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n#ifdef USE_INSTANCING\n{float wa=atan(instanceMatrix[3][2],instanceMatrix[3][0]);transformed.y+=uW*0.55*pow(max(0.0,sin(wa-uT*1.4)),10.0)*step(0.3,transformed.y+0.31);}\n#endif');};
    const fans=new THREE.InstancedMesh(fanGeo,fanM,seats.length);fans.frustumCulled=false;fans.userData.noFingerprint=true;st.add(fans);
    const COATS=[0x2a2a30,0x3a3530,0x4a4038,0x24283a,0x5a2a24,0x6a6a6a,0x2a3a5a,0x4a3a2a,0x8a2a22,0x2a4a3a,0xd8d0c0,0xc83a2a,0x2a5aa8,0xe8c040];
    seats.forEach(([x,y,z],i)=>{o.position.set(x,y,z);o.rotation.set(0,Math.atan2(-x,-z),0);o.scale.setScalar(1);o.updateMatrix();fans.setMatrixAt(i,o.matrix);
      const k=hash3(x,z,7);fans.setColorAt(i,cl.setHex(COATS[Math.floor(k*(k<0.8?10:14))]));});
    fans.instanceColor.needsUpdate=true;
    // ---- the five rings, in performers on the field; they run off as the parade comes in
    const RC=[[0x1a6ac8,-21,-5],[0x1a1a1a,0,-5],[0xd8302a,21,-5],[0xe8b818,-10.5,5],[0x2a9a4a,10.5,5]],PER_RING=36,ring=IM(BODY,RC.length*PER_RING),ringP=[];
    RC.forEach(([c,cx,cz],k)=>{for(let i=0;i<PER_RING;i++){const a=i/PER_RING*Math.PI*2,x=cx+Math.cos(a)*9,z=cz+Math.sin(a)*9,id=k*PER_RING+i;ringP.push([x,z,(i/PER_RING-0.5)*RX*1.6,-RZ*0.98]);ring.setColorAt(id,cl.setHex(c));}});
    ring.instanceColor.needsUpdate=true;
    // ---- the teams: a placard, the flag, the athletes three abreast behind it
    const T0=10,SPD=11,GAP=7/SPD,STOP=PER*0.7,cols=7,people=[],flags=[],boards=[];
    OLY_TEAMS.forEach(([name,coat,flag,n],k)=>{const row=Math.floor(k/cols),col=k%cols,sx=-55+col*(95/(cols-1)),sz=-34+row*(68/(Math.ceil(OLY_TEAMS.length/cols)-1));
      people.push({k,slot:[sx,sz-2.2],off:0,lat:0,coat:0xf2f2f2,hat:0x2a2a2a,board:true});
      people.push({k,slot:[sx,sz-1],off:1.3,lat:0,coat,hat:coat,flag});
      for(let i=0;i<n;i++){const r=Math.floor(i/3),c=i%3-1;people.push({k,slot:[sx+c*1.1,sz+0.4+r*1.3],off:2.8+r*1.3,lat:c*1.1,coat:hash3(k,i,3)<0.7?coat:0xf2f2f2,hat:hash3(k,i,4)<0.5?coat:0xf2f2f2});}});
    const bodies=IM(BODY,people.length),hats=IM(HAT,people.length),poles=IM(new THREE.BoxGeometry(0.05,2.6,0.05).translate(0,1.3,0),people.length,0x8a8478),
      BAND=new THREE.PlaneGeometry(1.2,0.27),bands=IM(BAND,OLY_TEAMS.length*3),board=IM(new THREE.BoxGeometry(0.9,0.5,0.04),OLY_TEAMS.length,0xf2f2f2);
    bands.material.side=THREE.DoubleSide;
    people.forEach((p,i)=>{bodies.setColorAt(i,cl.setHex(p.coat));hats.setColorAt(i,cl.setHex(p.hat));});bodies.instanceColor.needsUpdate=hats.instanceColor.needsUpdate=true;
    OLY_TEAMS.forEach(([,,flag],k)=>{for(let b=0;b<3;b++)bands.setColorAt(k*3+b,cl.setHex(flag[b]));});bands.instanceColor.needsUpdate=true;
    // ---- the Olympic flag, on its mast at the west end
    const fc=document.createElement('canvas');fc.width=240;fc.height=160;{const c=fc.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,240,160);c.lineWidth=7;
      [['#1a6ac8',62,66],['#111',120,66],['#d8302a',178,66],['#e8b818',91,96],['#2a9a4a',149,96]].forEach(([s,x,y])=>{c.strokeStyle=s;c.beginPath();c.arc(x,y,26,0,Math.PI*2);c.stroke();});}
    const MX=-RX-5,MZ=-RZ*0.35,mast=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.16,20,8).translate(0,10,0),M(0xd8d8d8));mast.position.set(MX,0,MZ);st.add(mast);
    const oflag=new THREE.Mesh(new THREE.PlaneGeometry(4.5,3),new THREE.MeshLambertMaterial({map:new THREE.CanvasTexture(fc),side:THREE.DoubleSide}));oflag.position.set(MX,2,MZ+2.3);oflag.rotation.y=Math.PI/2;st.add(oflag);
    // ---- the staircase up to the cauldron, the torchbearers, the fire
    const CX=cd.x,TOP=cd.y-1.6,S0=RX+3,stair=new THREE.Group();st.add(stair);
    for(let i=0;i<26;i++){const f=i/25;stair.add(at(new THREE.Mesh(B(1.0,0.4,3.2),M(0xe8e4dc)),S0+(CX-1.6-S0)*f,f*TOP+0.2,0));}
    const runner=person(0xf2f2f2,null,null);runner.scale.setScalar(1.25);const torch=glow(0xffb040,2.6);torch.position.set(0.32,2.0,0);runner.add(torch);runner.visible=false;st.add(runner);
    const fire=new THREE.Group();for(let i=0;i<3;i++)fire.add(new THREE.Mesh(new THREE.ConeGeometry(1.6-i*0.4,4.5-i,10).translate(0,(4.5-i)/2,0),new THREE.MeshBasicMaterial({color:[0xff7a20,0xffb040,0xfff0a0][i],transparent:true,opacity:0.85,depthWrite:false})));
    fire.add(glow(0xffa040,22));fire.position.set(cd.x,cd.y,cd.z);fire.visible=false;st.add(fire);
    // ---- the doves and the fireworks, in the world's frame
    const grp=tag(new THREE.Group());scene.add(grp);const base=W(0,0,0),cw=W(cd.x,cd.y,cd.z);
    const ND=300,dp=new Float32Array(ND*3),dv=[];for(let i=0;i<ND;i++){dp.set([base.x,base.y-50,base.z],i*3);dv.push(new THREE.Vector3((R()-0.5)*8,4+R()*6,(R()-0.5)*8));}
    const dg=new THREE.BufferGeometry();dg.setAttribute('position',new THREE.BufferAttribute(dp,3));const doves=new THREE.Points(dg,new THREE.PointsMaterial({color:0xffffff,size:0.9}));doves.frustumCulled=false;doves.visible=false;grp.add(doves);
    const bursts=[];const fw=()=>{const n=140,pos=new Float32Array(n*3),vel=[];const c=new THREE.Color().setHSL(R(),0.8,0.6),oo=base.clone().add(new THREE.Vector3((R()-0.5)*160,90+R()*90,(R()-0.5)*160));
      for(let i=0;i<n;i++){vel.push(new THREE.Vector3(R()-0.5,R()-0.5,R()-0.5).normalize().multiplyScalar(18+R()*10));pos.set([oo.x,oo.y,oo.z],i*3);}
      const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(pos,3));const p=new THREE.Points(ge,new THREE.PointsMaterial({color:c,size:3,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));p.frustumCulled=false;grp.add(p);bursts.push({p,vel,o:oo,a:0});};
    // the timeline, in seconds of the scene
    const TF=78,TR=86,TS=110,TL=118;
    const CAP=captions([[0,10,'Koševo, Wednesday 8 February 1984, in the afternoon. The XIV Winter Olympic Games open: the first held in a socialist country. Fifty thousand in the stands; the performers make the rings on the field.'],
      [10,30,'The parade of nations: Greece first, as always. Forty-nine countries sent athletes, more than to any Winter Games before.'],
      [30,52,'Each team behind its name and its flag, round the track and onto the field. The United States and the Soviet Union, both Germanys, and teams of one or two from Senegal, Egypt and Monaco.'],
      [52,TF,'Last, the hosts: Yugoslavia. The crowd stands. President Mika Špiljak declares the Games open.'],
      [TF,TR,'The Olympic flag is raised, and the Olympic oath is taken by the skier Bojan Križaj.'],
      [TR,TS-6,'The torch has come from Olympia, carried through Yugoslavia. It comes into the stadium.'],
      [TS-6,TL,'The figure skater Sanda Dubravčić takes it up the long stairway to the cauldron, and lights it. The doves go up.'],
      [TL,TL+30,'Sarajevo\'s Games: Torvill and Dean\'s Bolero at Zetra, Jure Franko\'s silver on Bjelašnica, Vučko the wolf. Eight years later the stadium\'s training pitches were a cemetery.']]);
    notice('8 February 1984','the XIV Winter Olympics open at Koševo: the parade of nations, the torch up to the cauldron, the doves and the fireworks.',
      ()=>{const c=W(-A*0.84,32,BB*0.64),t=W(A*0.12,4,0);return [c.x,c.y,c.z,t.x,t.y,t.z];},null);
    let t=0,lit=false,next=0;
    run((now,dt)=>{t+=dt;CAP(t);U.uT.value=t;U.uW.value=(t>48&&t<76)||(t>TL&&t<TL+20)?1:0;
      // the rings, then off to the side
      const off=Math.max(0,Math.min(1,(t-7)/6));ringP.forEach(([x,z,ex,ez],i)=>{const ox=x+(ex-x)*off,oz=z+(ez-z)*off,gone=t>13.5;
        o.position.set(ox,gone?-50:0.1+(off>0&&off<1?Math.abs(Math.sin(t*12+i))*0.12:0),oz);o.rotation.set(0,off>0?Math.atan2(ex-x,ez-z):Math.atan2(-x,-z),0);o.scale.setScalar(1);o.updateMatrix();ring.setMatrixAt(i,o.matrix);});
      ring.instanceMatrix.needsUpdate=true;
      // the parade
      const sOf=k=>Math.max(-1,(t-T0-k*GAP)*SPD);
      let fi=0;people.forEach((p,i)=>{const s=sOf(p.k);let x,z,ry,y=0.05;
        if(s<0){y=-50;x=z=ry=0;}
        else{const sp=Math.min(STOP,s-p.off),a=Math.PI+Math.max(0,sp)/PER*Math.PI*2,[tx,tz]=trk(a),dx=-Math.sin(a)*RX,dz=Math.cos(a)*RZ,L=Math.hypot(dx,dz),nx=dz/L,nz=-dx/L;
          x=tx+nx*p.lat;z=tz+nz*p.lat;ry=Math.atan2(dx,dz);if(s-p.off<0)y=-50;
          const f=Math.max(0,Math.min(1,(s-STOP-p.off)/(SPD*4)));if(f>0){x+=(p.slot[0]-x)*f;z+=(p.slot[1]-z)*f;if(f>=1)ry=Math.PI/2;}
          if(f<1&&y>0)y+=Math.abs(Math.sin(t*9+i))*0.1;}
        o.position.set(x,y,z);o.rotation.set(0,ry,0);o.scale.setScalar(1);o.updateMatrix();bodies.setMatrixAt(i,o.matrix);hats.setMatrixAt(i,o.matrix);
        poles.setMatrixAt(i,(p.flag||p.board)&&y>-1?(o.position.y=y,o.updateMatrix(),o.matrix):(o.position.y=-50,o.updateMatrix(),o.matrix));
        if(p.board){o.position.set(x,y+2.6,z);o.updateMatrix();board.setMatrixAt(p.k,o.matrix);}
        if(p.flag){for(let b=0;b<3;b++){o.position.set(x+Math.sin(ry+Math.PI/2)*0.62,y+2.45-b*0.27+Math.sin(t*5+p.k+b)*0.02,z+Math.cos(ry+Math.PI/2)*0.62);o.rotation.set(0,ry+Math.PI/2+Math.sin(t*4+p.k)*0.15,0);o.updateMatrix();bands.setMatrixAt(p.k*3+b,o.matrix);}fi++;}});
      bodies.instanceMatrix.needsUpdate=hats.instanceMatrix.needsUpdate=poles.instanceMatrix.needsUpdate=bands.instanceMatrix.needsUpdate=board.instanceMatrix.needsUpdate=true;
      // the flag goes up
      oflag.position.y=2+Math.max(0,Math.min(1,(t-TF)/7))*15.5;oflag.rotation.z=Math.sin(t*3)*0.04;
      // the torch: in at the west end, half a lap, then up the stairs
      if(t>TR&&!lit){runner.visible=true;const a=t<TS-6?Math.PI-(t-TR)/(TS-6-TR)*Math.PI:0;
        if(t<TS-6){const [x,z]=trk(a);runner.position.set(x,0.05+Math.abs(Math.sin(t*14))*0.12,z);runner.rotation.y=Math.atan2(Math.sin(a)*RX,-Math.cos(a)*RZ);}
        else{const f=Math.min(1,(t-(TS-6))/(TL-(TS-6)));runner.position.set(S0+(CX-1.6-S0)*f,0.4+f*TOP+Math.abs(Math.sin(t*12))*0.1,0);runner.rotation.y=Math.PI/2;}}
      if(t>=TL&&!lit){lit=true;fire.visible=true;doves.visible=true;}
      if(lit){fire.children.forEach((f,i)=>{if(f.isMesh)f.scale.set(1+0.1*Math.sin(t*9+i),0.85+0.25*Math.abs(Math.sin(t*6.3+i*2)),1);});
        const p=dg.attributes.position,a=t-TL;for(let i=0;i<ND;i++){const v=dv[i];p.setXYZ(i,cw.x-6+v.x*a*1.4+Math.sin(a*3+i)*0.6,base.y+2+v.y*a,cw.z+v.z*a*1.4);}p.needsUpdate=true;if(a>16)doves.visible=false;
        if(t>next&&t<TL+26){next=t+0.45+R()*0.7;fw();}}
      for(let i=bursts.length-1;i>=0;i--){const b=bursts[i];b.a+=dt;const pos=b.p.geometry.attributes.position;for(let k=0;k<b.vel.length;k++){const v=b.vel[k];pos.setXYZ(k,b.o.x+v.x*b.a,b.o.y+v.y*b.a-4.9*b.a*b.a,b.o.z+v.z*b.a);}pos.needsUpdate=true;b.p.material.opacity=Math.max(0,1-b.a/2.4);
        if(b.a>2.4){grp.remove(b.p);bursts.splice(i,1);}}
      if(t>TL+32){g.remove(st);scene.remove(grp);hideCap();return false;}return true;});}

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
