// ---------- Galaxy class: hunting a cloaked ship ----------
// Original work. A Varr cruiser under its cloak shows on nothing: no contact, no marker, no lock. It prowls round the
// ship, three to nine kilometres off, from one point to the next, keeping pace with her.
//
// The way to find it is a tachyon net (Y, or the Tactical panel): each sweep lays a fan of seven tachyon beams across
// the ninety degrees ahead of the ship, fourteen kilometres long, that hang where they were laid for thirty seconds.
// Turn between sweeps and the fans make a net. A cloaked hull crossing a beam scatters it: a ripple, where it crossed,
// that shows for ten seconds. Fire there (phasers or a torpedo: the weapons take the ripple for a target when no
// hostile is in sight). A phaser beam within seven hundred metres of the ship, or a torpedo's blast within fifteen
// hundred, lights the cloak up and it comes out of it, shields down by half. Left alone for two and a half minutes it
// tires of hiding and decloaks to attack at full strength.
//
// W.cloak.spawn() puts one here (the orders' 'cloak' mission; #cloak for a test). W.emit('tachyon'), 'ripple',
// 'decloaked'.
export function cloak(W){
  const {THREE,ROOT,animHooks}=W,F=W.fx,S=W.flight,V=()=>new THREE.Vector3();
  const FX=W.FX,here=()=>W.herePlace().P.id;
  let hunter=null,ripple=null,lastSweep=-99,told=false,revealed=0;
  const nets=[];
  const note=m=>F.note(m);
  const wFX=p=>FX.localToWorld(p.clone());

  // ---- the prowler ----
  function spawn(o){o=o||{};const c=F.toFX(F.shipCentre()),a=Math.random()*6.283;revealed=0;
    hunter={p:c.clone().add(V().set(Math.cos(a)*7000,(Math.random()-0.5)*1200,Math.sin(a)*7000)),off:null,offT:0,pl:here(),age:0,patience:o.patience||150};
    if(o.say!==false)note('Sensors: a faint distortion, and then nothing. Something is here under a cloak. Y lays a tachyon net.');}
  function prowl(dt){const h=hunter,c=F.toFX(F.shipCentre());h.age+=dt;h.offT-=dt;
    if(!h.off||h.offT<=0||h.p.distanceTo(c.clone().add(h.off))<300){const a=Math.random()*6.283,r=3000+Math.random()*6000;h.off=V().set(Math.cos(a)*r,(Math.random()-0.5)*1600,Math.sin(a)*r);h.offT=18+Math.random()*14;}
    const want=c.clone().add(h.off).sub(h.p),L=want.length();if(L>220)want.setLength(220);
    // keeping pace with her
    want.add(F.dirFX(S.vel||V()));const old=h.p.clone();h.p.addScaledVector(want,dt);
    // has it crossed a beam of a net?
    for(const n of nets)for(let i=0;i<n.dirs.length;i++){const r=h.p.clone().sub(n.o),s=Math.sign(r.dot(n.nrm[i])),along=r.dot(n.dirs[i]),up=Math.abs(r.dot(n.up));
      if(n.side[i]!=null&&s!==n.side[i]&&along>0&&along<n.L&&up<2500)rip(h.p);n.side[i]=s;}
    if(h.age>h.patience)reveal(false);}

  // ---- the net ----
  const netMat=new THREE.LineBasicMaterial({color:0x8fe8ff,transparent:true,opacity:0.5,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  function sweep(){
    if(S.warp){note('Not at warp: the net would be left light-years behind.');return false;}
    if(W.sys&&W.sys.down('sensors'))return false;
    const t=F.T();if(t-lastSweep<3)return false;lastSweep=t;
    const q=ROOT.getWorldQuaternion(new THREE.Quaternion()).premultiply(FX.quaternion.clone().invert());
    const o=F.toFX(F.shipCentre()),fw=V().set(1,0,0).applyQuaternion(q),up=V().set(0,1,0).applyQuaternion(q),L=14000;
    const dirs=[],nrm=[],pos=[];
    for(let i=0;i<7;i++){const d=fw.clone().applyAxisAngle(up,(i-3)*Math.PI/24);dirs.push(d);nrm.push(d.clone().cross(up).normalize());
      const a=o.clone().addScaledVector(d,300),b=o.clone().addScaledVector(d,L);pos.push(a.x,a.y,a.z,b.x,b.y,b.z);}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    const line=new THREE.LineSegments(geo,netMat.clone());line.frustumCulled=false;line.userData.noWire=true;FX.add(line);
    const n={o,dirs,nrm,up,L,t0:t,line,side:dirs.map(()=>null)};
    if(hunter&&hunter.pl===here())for(let i=0;i<7;i++)n.side[i]=Math.sign(hunter.p.clone().sub(o).dot(nrm[i]));
    nets.push(n);if(nets.length>5)drop(nets[0]);
    chirp();W.emit&&W.emit('tachyon',{o:wFX(o),fw:dirs[3].clone().applyQuaternion(FX.quaternion),L});
    if(!told){told=true;note('A tachyon net is laid ahead of us. Turn and lay more: a cloaked hull crossing a beam will show as a ripple.');}
    return true;}
  function drop(n){const i=nets.indexOf(n);if(i>=0)nets.splice(i,1);FX.remove(n.line);n.line.geometry.dispose();n.line.material.dispose();}
  function chirp(){const A=W.audio&&W.audio();if(!A)return;const {a,master}=A,t=a.currentTime;const o=a.createOscillator(),g=a.createGain();o.type='sine';
    o.frequency.setValueAtTime(600,t);o.frequency.exponentialRampToValueAtTime(3400,t+0.5);o.connect(g);g.connect(master);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.1,t+0.05);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.7);o.start(t);o.stop(t+0.75);}

  // ---- the ripple ----
  function rip(p){const t=F.T();if(ripple&&t-ripple.t0<2)return;
    if(ripple)FX.remove(ripple.s);
    const at=p.clone().add(V().set((Math.random()-0.5)*300,(Math.random()-0.5)*150,(Math.random()-0.5)*300));
    const s=F.sprite(0xd8c8ff,500,0.9);s.position.copy(at);FX.add(s);ripple={p:at,t0:t,s};
    const d=wFX(at).distanceTo(F.shipCentre()),b=W.faceOf?W.faceOf(wFX(at)):'';
    F.sound('shield');note('Ripple on the net! '+(b?'Off the '+(b==='fore'?'bow':b==='aft'?'stern':b+' side')+', ':'')+(d/1000).toFixed(1)+' km. Fire there: Space, or T.');W.emit&&W.emit('ripple',{d});}
  W.targets&&W.targets.push(()=>{if(!ripple||!hunter||F.T()-ripple.t0>10)return null;
    return {p:wFX(ripple.p),fuse:250,r:16000,hit:(dmg,w,at)=>{if(!hunter)return;const d=wFX(hunter.p).distanceTo(at);if(d<(w==='tp'?1500:700))reveal(true);}};});

  // ---- out of the cloak ----
  function reveal(hit){if(!hunter)return;const at=wFX(hunter.p);hunter=null;revealed++;
    if(ripple){FX.remove(ripple.s);ripple=null;}
    W.HO.contact('varr',{at,sh:hit?0.5:1,note:hit?'A hit! Our fire has lit its cloak up: a Varr cruiser, decloaking, shields at half!':'The Varr cruiser has tired of hiding: it is decloaking to attack!'});
    W.emit&&W.emit('decloaked',{hit});}

  let last=null;
  animHooks.push(now=>{const dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;const t=F.T();
    for(const n of nets.slice()){const u=(t-n.t0)/30;if(u>=1||S.warp){drop(n);continue;}n.line.material.opacity=0.5*(1-u)*(0.75+0.25*Math.sin(t*9+n.t0));}
    if(ripple){const u=(t-ripple.t0)/10;if(u>=1){FX.remove(ripple.s);ripple=null;}else{ripple.s.material.opacity=(1-u)*(0.5+0.5*Math.abs(Math.sin(t*7)));ripple.s.scale.setScalar(400+300*Math.sin(t*3));}}
    // it waits for her at its place: elsewhere, and at warp, it does nothing
    if(hunter&&dt&&!S.warp&&!W.spooling&&hunter.pl===here())prowl(dt);});
  // gone from the place and come back: it is still there, somewhere near her
  W.arriveHooks.push(pl=>{if(hunter&&hunter.pl===pl.P.id){const c=F.toFX(F.shipCentre()),a=Math.random()*6.283;hunter.p=c.add(V().set(Math.cos(a)*7000,0,Math.sin(a)*7000));hunter.off=null;}});

  W.cloak={spawn,sweep,revealed:()=>revealed>0,hidden:()=>!!hunter,ripple:()=>!!ripple&&F.T()-ripple.t0<10,clear:()=>{hunter=null;revealed=0;}};
  W.tachyon=sweep;
  {const h=new URLSearchParams(location.hash.slice(1));if(h.has('cloak'))setTimeout(()=>spawn({patience:+h.get('cloak')||150}),+(h.get('evt')||1.5)*1000);}
  return {act:{tachyon:sweep,cloak:()=>spawn()},
    hud:()=>[nets.length?'tachyon net '+nets.length:'',ripple?'RIPPLE '+(wFX(ripple.p).distanceTo(F.shipCentre())/1000).toFixed(1)+' km':''].filter(Boolean).join(' · '),
    state:()=>({hidden:!!hunter,nets:nets.length,ripple:!!ripple,revealed,d:hunter?Math.round(wFX(hunter.p).distanceTo(F.shipCentre())):null})};
}
