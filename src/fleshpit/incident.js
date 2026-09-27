// ---------- the night of 4 July 2007 ----------
// A button, "4 July 2007", and #2007 in the address, play the incident through in about forty seconds and then
// leave the park as the night left it: the power cut to the emergency circuit, the wall convulsing and then
// quieting, the Lower Visitor Center tipped off its rams and fallen into the Nexial Cavity, the labiod
// junction open, and gastric fluid standing in columns over the orifice. Press it again and it is 2006.
//
// The sequence follows the park's published timeline in outline and in this project's own words; the pit's
// shapes are organism.js's, and this module only takes hold of what that one leaves at ctx.pit. Like
// dredd2012's war mode, it lives with its page: no other city has any of it.
export function incident(api){
  const {THREE,C,ctx,scene,animHooks,HASH0}=api;
  const P=ctx.pit,K=(C.pit||{}).incident;if(!P||!K)return;
  const SIG=ctx.pitBus.signal;          // what this module drives (src/fleshpit/bus.js)
  const {Y,AX,AZ,BR,lvc,lamps}=P;

  // ---- the columns over the orifice ----
  // Three of them, and a lower boil round the mouth: fluid the colour of bile, lit from below by the last lamps.
  const chymM=new THREE.MeshLambertMaterial({color:0xc9b25a,emissive:0x4a3a10,transparent:true,opacity:0.82});
  const foamM=new THREE.MeshLambertMaterial({color:0xe8dcae,emissive:0x3a3018,transparent:true,opacity:0.7,flatShading:true});
  const coreM=new THREE.MeshLambertMaterial({color:0x8a6a2a,emissive:0x2a1a06});
  const G=new THREE.Group();G.visible=false;scene.add(G);
  const cols=[];
  for(let k=0;k<3;k++){
    const a=k*2.1+0.4,r=k?38:0,x=AX+Math.cos(a)*r,z=AZ+Math.sin(a)*r;
    // a column that widens as it climbs, a core of darker fluid inside it, and foam breaking off the sides
    const c=new THREE.Mesh(new THREE.CylinderGeometry(26,14,1,16,1,true).translate(0,0.5,0),chymM);
    c.position.set(x,Y(P.D0),z);G.add(c);
    const core=new THREE.Mesh(new THREE.CylinderGeometry(12,8,1,10,1,true).translate(0,0.5,0),coreM);
    core.position.set(x,Y(P.D0),z);G.add(core);
    const head=new THREE.Mesh(new THREE.IcosahedronGeometry(34,1),foamM);head.position.set(x,Y(P.D0),z);G.add(head);
    const puffs=[];
    for(let q=0;q<7;q++){const p=new THREE.Mesh(new THREE.IcosahedronGeometry(10+q*2.5,1),foamM);G.add(p);
      puffs.push({m:p,u:q/7,a:q*2.4+k,off:18+q*3});}
    cols.push({c,core,head,puffs,x,z,ph:k*1.7,H:[420,300,260][k]});
  }
  const boil=new THREE.Mesh(new THREE.CylinderGeometry(120,80,1,32,1,true).translate(0,0.5,0),foamM);
  boil.position.set(AX,Y(P.D0),AZ);G.add(boil);

  // ---- what else the night brings, built once and hidden until it is needed ----
  const NG=new THREE.Group();NG.visible=false;P.group.add(NG);      // in the shaft
  const SG=new THREE.Group();SG.visible=false;scene.add(SG);        // on the surface
  const gH=(x,z)=>P.groundH?P.groundH(x,z):P.TOP;
  const MR=P.mouthR||160;
  const rnd=(()=>{let a=2007;return ()=>{a=(a*1103515245+12345)%2147483648;return a/2147483648;};})();

  // Red beacons down the shaft on the emergency circuit, each with a beam that goes round.
  const beacons=[];
  {const bm=new THREE.MeshBasicMaterial({color:0xff2014});
   const beamM=new THREE.MeshBasicMaterial({color:0xff2010,transparent:true,opacity:0.09,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
   const beamG=new THREE.ConeGeometry(4,46,10,1,true).translate(0,-23,0).rotateZ(Math.PI/2);
   for(let q=0;q<4;q++)for(let d=P.D0+40;d<P.DEEP-60;d+=130){
     const a=0.8+q*Math.PI/2+0.35*Math.sin(d*0.0012+q),rr=P.wallAt(d)*0.9,[x,z]=P.polar(a,rr);
     const g=new THREE.Group();g.position.set(x,Y(d)+3,z);
     g.add(new THREE.Mesh(new THREE.SphereGeometry(2,8,6),bm));
     const beam=new THREE.Mesh(beamG,beamM);g.add(beam);NG.add(g);beacons.push({g,beam,ph:rnd()*6.28});}}

  // The lungs: the flood level, and the lungs themselves heaving (organism.js reads signal.lungFit, src/fleshpit/bus.js).
  const lungs=(P.lungs||[]).map(l=>({l,base:l.base,apex:l.apex}));

  // Debris off the deck as it goes, and sparks off the rams.
  const debris=[];let debM=null;
  if(lvc){
    const n=90,geo=new THREE.BoxGeometry(1,1,1);
    debM=new THREE.InstancedMesh(geo,new THREE.MeshLambertMaterial({color:0xffffff}),n);debM.frustumCulled=false;
    const cols=[0xb8b2a4,0x5e6468,0x6a5040,0xd9a431,0x9a9384].map(x=>new THREE.Color(x));
    const [DI,DO]=P.deckR;
    for(let i=0;i<n;i++){const a=rnd()*Math.PI*2,r=DI+rnd()*(DO-DI),[x,z]=P.polar(a,r);
      debris.push({x0:x,z0:z,a,vx:Math.cos(a)*(4+rnd()*14),vz:Math.sin(a)*(4+rnd()*14),vy:rnd()*6,t0:20+rnd()*4,
        s:[1+rnd()*5,0.5+rnd()*2,1+rnd()*4],spin:new THREE.Vector3(rnd(),rnd(),rnd()).multiplyScalar(4)});
      debM.setColorAt(i,cols[i%cols.length]);}
    NG.add(debM);
  }
  const FLOOR=Y(P.cav?P.cav.at+P.cav.h*0.45:P.deck+90);
  const sparkN=260,sparkG=new THREE.BufferGeometry(),sparkP=new Float32Array(sparkN*3);
  sparkG.setAttribute('position',new THREE.BufferAttribute(sparkP,3));
  const sparks=new THREE.Points(sparkG,new THREE.PointsMaterial({color:0xffb040,size:2.2,transparent:true,opacity:0.95,blending:THREE.AdditiveBlending,depthWrite:false}));
  sparks.frustumCulled=false;NG.add(sparks);
  const sparkS=Array.from({length:sparkN},()=>{const a=rnd()*Math.PI*2;return {a,r:P.deckR[1]+rnd()*20,vy:4+rnd()*10,vr:3+rnd()*9,t0:19+rnd()*4.5};});

  // The failsafe: nozzles in the throat and the forests letting go a violet mist.
  const mistM=new THREE.MeshLambertMaterial({color:0x9a84bc,emissive:0x2a1a40,transparent:true,opacity:0.16,depthWrite:false});
  const mist=[];
  for(let k=0;k<16;k++){
    const d=260+rnd()*700,a=rnd()*Math.PI*2,[x,z]=P.polar(a,P.wallAt(d)*0.92);
    for(let q=0;q<3;q++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),mistM);m.visible=false;NG.add(m);
      mist.push({m,x,z,y:Y(d),a,t0:20+rnd()*3+q*1.6,life:9+rnd()*6,R:16+rnd()*24});}}

  // The lift cage that goes with the deck.
  const cage=P.cages&&P.cages[0];let cageY0=null;

  // Over the rim: helicopters with searchlights, and the emergency vehicles coming in.
  const helis=[];
  {const hullM=new THREE.MeshLambertMaterial({color:0x2a3038}),rotM=new THREE.MeshLambertMaterial({color:0x16181c});
   const coneM=new THREE.MeshBasicMaterial({color:0xfff4d8,transparent:true,opacity:0.1,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});
   const spotM=new THREE.MeshBasicMaterial({color:0xfff0c8,transparent:true,opacity:0.35,blending:THREE.AdditiveBlending,depthWrite:false});
   const navR=new THREE.MeshBasicMaterial({color:0xff2020}),navW=new THREE.MeshBasicMaterial({color:0xffffff});
   for(let k=0;k<3;k++){
     const g=new THREE.Group();
     g.add(new THREE.Mesh(new THREE.SphereGeometry(2.2,10,8).scale(1.6,1,1),hullM));
     g.add(new THREE.Mesh(new THREE.BoxGeometry(7,0.7,0.7).translate(-5.5,0.3,0),hullM));
     const rot=new THREE.Mesh(new THREE.BoxGeometry(14,0.12,0.6).translate(0,2.4,0),rotM);g.add(rot);
     const tail=new THREE.Mesh(new THREE.BoxGeometry(0.1,2.4,0.3).translate(-9,0.6,0.4),rotM);g.add(tail);
     const nr=new THREE.Mesh(new THREE.SphereGeometry(0.35,5,4),navR);nr.position.set(-9,1.2,0);g.add(nr);
     const nw=new THREE.Mesh(new THREE.SphereGeometry(0.35,5,4),navW);nw.position.set(0,-1.8,0);g.add(nw);
     const cone=new THREE.Mesh(new THREE.ConeGeometry(0.5,1,16,1,true).translate(0,-0.5,0),coneM);SG.add(cone);
     const spot=new THREE.Mesh(new THREE.CircleGeometry(1,24),spotM);spot.rotation.x=-Math.PI/2;SG.add(spot);
     SG.add(g);helis.push({g,rot,tail,nr,nw,cone,spot,R:230+k*80,h:190+k*45,w:(k%2?-1:1)*(0.09+k*0.02),ph:k*2.1,arrive:16+k*1.5});}}
  const trucks=[];
  {const bodyM=[new THREE.MeshLambertMaterial({color:0xe8e4dc}),new THREE.MeshLambertMaterial({color:0xb8201c}),new THREE.MeshLambertMaterial({color:0xe0c020})];
   const red=new THREE.MeshBasicMaterial({color:0xff1010}),blue=new THREE.MeshBasicMaterial({color:0x2040ff});
   for(let k=0;k<14;k++){
     const a=k/14*Math.PI*2+rnd()*0.2,g=new THREE.Group();
     g.add(new THREE.Mesh(new THREE.BoxGeometry(7,2.6,2.5).translate(0,1.8,0),bodyM[k%3]));
     g.add(new THREE.Mesh(new THREE.BoxGeometry(2.2,1.8,2.4).translate(3.6,1.4,0),bodyM[k%3]));
     const lr=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.35,0.9).translate(2,3.3,-0.5),red),lb=new THREE.Mesh(new THREE.BoxGeometry(0.5,0.35,0.9).translate(2,3.3,0.5),blue);
     g.add(lr,lb);SG.add(g);
     trucks.push({g,lr,lb,a,r0:MR+900+rnd()*300,r1:MR+70+rnd()*80,t0:12+rnd()*6,ph:rnd()*10});}}

  // What comes back down: drops off the column heads, and the splashes where they land.
  const rainN=900,rainG=new THREE.BufferGeometry(),rainP=new Float32Array(rainN*3);
  rainG.setAttribute('position',new THREE.BufferAttribute(rainP,3));
  const rain=new THREE.Points(rainG,new THREE.PointsMaterial({color:0xd8c878,size:3.2,transparent:true,opacity:0.85,depthWrite:false}));
  rain.frustumCulled=false;SG.add(rain);
  const rainS=Array.from({length:rainN},(_,i)=>({c:i%3,u:rnd(),a:rnd()*Math.PI*2,v:20+rnd()*55}));
  const splashM=new THREE.MeshBasicMaterial({color:0xe8d890,transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false});
  const splashes=[];
  for(let k=0;k<26;k++){const m=new THREE.Mesh(new THREE.RingGeometry(0.8,1,24),splashM.clone());m.rotation.x=-Math.PI/2;SG.add(m);
    splashes.push({m,a:rnd()*Math.PI*2,r:MR+10+rnd()*260,ph:rnd()});}

  // ---- the caption: where the night has got to ----
  // The times with a published event are the park's; the lines between them describe what this model shows
  // happening in the meantime, and say no more than the published outline does.
  const TL=[
    [0,'21:16','Record harvest load. A relay trips; the gullet pumps stop. The backup has seized.'],
    [5,'21:42','The gullet floods. Water runs into the lungs. The organism begins to choke.'],
    [7.5,'21:45','The lungs fill from the base up and heave against it. The heart races.'],
    [10,'21:48','Power reset: 45 seconds dark. The PA shuts down with it. The rams stop holding, and the lifts stop where they are.'],
    [12,'21:50','The emergency circuit comes on, red. Rangers turn the crowds towards the stair towers.'],
    [15,'22:03','The gantry base joint bends past its limit. The deck lists twenty degrees.'],
    [17.5,'22:08','Emergency vehicles and helicopters reach the rim.'],
    [20,'22:12','Aconitine failsafe: 20,000 litres. The convulsions get worse. The Lower Visitor Center tears loose.'],
    [22,'22:13','The deck goes down into the Nexial Cavity, and a lift cage with it. The failsafe hangs in the shaft like smoke.'],
    [25,'22:17','The labiod junction opens. Gastric fluid comes up the orifice in columns hundreds of metres high.'],
    [28,'22:24','Both seas heave. The gastric ferry goes over at its jetty. Fluid falls back across the rim.'],
    [30.5,'22:40','The heart loses its rhythm; the nerve cord fires all at once.'],
    [33,'23:13','The contingency measure. The motor activity subsides. More than 750 dead.'],
    [38,'23:30','The heart has stopped. The columns have gone down; the searchlights go on sweeping the orifice.'],
    [44,'23:45','It is over. The helicopters turn for Odessa. The park did not reopen.'],
  ];
  const cap=document.createElement('div');cap.id='incident';cap.setAttribute('role','status');cap.setAttribute('aria-live','polite');
  Object.assign(cap.style,{position:'fixed',left:'50%',bottom:'64px',transform:'translateX(-50%)',maxWidth:'min(640px,calc(100vw - 32px))',
    padding:'10px 14px',background:'rgba(40,6,6,0.86)',color:'#ffd8c8',font:'14px/1.4 system-ui,sans-serif',borderRadius:'6px',
    border:'1px solid #a8281f',display:'none',zIndex:20,pointerEvents:'none'});
  document.body.appendChild(cap);

  // ---- state ----
  const S={on:false,t0:0,shown:-1};
  // When the night is over the park settles, and then goes back to 2006 by itself behind a short fade, so the
  // page is never left sitting on the aftermath. END is when the fade starts; it takes FADE seconds each way.
  const END=50,FADE=1.6;
  const veil=document.createElement('div');
  Object.assign(veil.style,{position:'fixed',inset:'0',background:'#000',opacity:'0',pointerEvents:'none',
    transition:`opacity ${FADE}s ease`,zIndex:19});
  document.body.appendChild(veil);
  const base={amp:BR.amp,rate:BR.rate,glow:lamps.glow.color.clone()};
  const lips=ctx.pitBus.parts.labiod?ctx.pitBus.parts.labiod.lips.map(l=>({m:l,y:l.position.y})):[];
  const lipMid=lips.length?lips.reduce((s,q)=>s+q.y,0)/lips.length:0;
  const smooth=(a,b,x)=>{const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u);};
  let btn=null;
  function set(on){
    S.on=on;S.t0=performance.now();S.shown=-1;S.ending=false;veil.style.opacity='0';G.visible=on;cap.style.display=on?'block':'none';
    if(btn){btn.setAttribute('aria-pressed',String(on));btn.textContent=on?'Back to 2006':'4 July 2007';}
    NG.visible=SG.visible=on;
    if(!on){
      BR.amp=base.amp;BR.rate=base.rate;lamps.glow.color.copy(base.glow);ctx.pitBus.rest();
      for(const L of lungs){L.l.fluid.visible=false;}
      if(P.lungFluid)P.lungFluid.uLevel.value=-1e4;
      if(cage&&cageY0!==null){cage.g.rotation.set(0,-cage.a+Math.PI/2,0);cageY0=null;}
      cap.style.borderColor='#a8281f';
      if(lvc){lvc.rotation.set(0,0,0);lvc.position.y=Y(P.deck);}
      for(const l of lips)l.m.position.y=l.y;
    }else{
      lamps.glow.color.set(0xff3020);
      if(api.setHour)try{api.setHour(21.3);}catch(e){}
      if(api.showCard)api.showCard({name:K.title||'4 July 2007',info:K.info||''});
    }
  }
  animHooks.push(now=>{
    if(!S.on)return;
    const t=(now-S.t0)/1000;
    // the wall: the choke builds, peaks with the failsafe, and then the contingency measure brings it down
    const fit=smooth(3,12,t)*(1-0.7*smooth(30,40,t));
    BR.amp=base.amp+0.05*fit;BR.rate=1+5*fit;
    // the power: flickering, then out, then the emergency circuit
    SIG.power=t<10?(Math.sin(t*23)>-0.2?0.8:0.1):t<11?0.02:0.22;
    SIG.ramKick=0.02*smooth(8,14,t)*(1-smooth(20,21,t));
    // the deck: lists twenty degrees on the gantry, then goes
    if(lvc){
      const list=0.35*smooth(14,19,t)+0.3*smooth(20,26,t);
      lvc.rotation.set(0.12*smooth(15,24,t),0,list+0.03*Math.sin(t*4)*smooth(10,20,t)*(1-smooth(22,23,t)));
      const drop=smooth(20,26,t),bottom=P.cav?P.cav.at+P.cav.h*0.42:P.deck+80;
      lvc.position.y=Y(P.deck)-(bottom-P.deck)*drop*drop;
    }
    // the junction opens
    const open=smooth(24,28,t)*(1-smooth(34,44,t));      // the junction closes again as it quiets
    for(const l of lips)l.m.position.y=l.y+(l.y>lipMid?1:-1)*open*40;
    // the columns: up with the junction, then down to a boil
    const rise=smooth(25,29,t)*(1-smooth(33,41,t));      // the columns go all the way down
    for(const c of cols){
      const h=Math.max(1,(c.H+P.D0)*rise*(0.85+0.15*Math.sin(t*3+c.ph)));
      c.c.scale.set(1,h,1);c.core.scale.set(1,h*0.97,1);c.head.position.y=Y(P.D0)+h;c.head.scale.setScalar(0.4+0.8*rise);c.head.visible=rise>0.02;
      c.head.rotation.y=t*0.7+c.ph;
      for(const p of c.puffs){const u=(p.u+t*0.35)%1,a=p.a+t*0.5;   // foam climbing the column and falling away
        p.m.position.set(c.x+Math.cos(a)*p.off*(0.6+u),Y(P.D0)+h*u,c.z+Math.sin(a)*p.off*(0.6+u));
        p.m.visible=rise>0.05;p.m.scale.setScalar(0.5+u);}
    }
    const boiling=smooth(26,31,t)*(1-smooth(38,45,t));
    boil.scale.set(1,Math.max(1,P.D0*boiling*(0.9+0.1*Math.sin(t*2))),1);boil.visible=boiling>0.01;
    // the body: the heart races, loses its rhythm and stops; the nerve cord fires and goes dark; the lungs fill
    const quiet=smooth(33,39,t);
    SIG.heart={rate:(1+1.9*smooth(3,14,t))*(1-0.85*quiet),amp:1-quiet,fib:smooth(29,31,t)*(1-smooth(35,38,t))};
    SIG.nerve=(1+1.6*fit+1.2*smooth(29,31,t))*(1-quiet);
    SIG.lungFit=smooth(6,12,t)*(1-0.85*quiet);
    for(const L of lungs){L.l.fluid.visible=t>5;}
    if(P.lungFluid&&lungs.length)P.lungFluid.uLevel.value=lungs[0].base+(lungs[0].apex-lungs[0].base)*0.6*smooth(5,15,t);
    // the people: towards the stair towers once the emergency circuit is on
    SIG.evac=smooth(12,26,t);
    // the lifts: stopped where they were when the power went, and the one that went with the deck
    SIG.cageHalt=t>=10;
    if(cage){
      if(t>=20.6){if(cageY0===null)cageY0=cage.g.position.y;
        const ft=t-20.6,y=Math.max(FLOOR+4,cageY0-0.5*38*ft*ft);
        cage.g.position.y=y;cage.g.rotation.set(Math.min(1.2,ft*0.8),-cage.a+Math.PI/2+ft*0.6,Math.min(0.9,ft*0.5));}
    }
    // the emergency circuit: beacons turning down the shaft
    const em=t>=11?1:0;
    for(const b of beacons){b.g.visible=!!em;b.beam.rotation.y=now*0.004+b.ph;}
    // the deck coming apart: debris and sparks
    if(debM){const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),sc=new THREE.Vector3();
      const deckY=lvc?lvc.position.y:Y(P.deck);
      debris.forEach((d,i)=>{const ft=t-d.t0;
        if(ft<0){sc.set(0.0001,0.0001,0.0001);m.compose(v.set(d.x0,deckY,d.z0),q.identity(),sc);}
        else{const y=Math.max(FLOOR+d.s[1]/2,deckY-0.5*30*ft*ft+d.vy*ft);
          const land=y<=FLOOR+d.s[1]/2+0.01;
          v.set(d.x0+d.vx*Math.min(ft,land?2.4:ft),y,d.z0+d.vz*Math.min(ft,land?2.4:ft));
          q.setFromEuler(e.set(d.spin.x*Math.min(ft,2.4),d.spin.y*Math.min(ft,2.4),d.spin.z*Math.min(ft,2.4)));
          m.compose(v,q,sc.set(...d.s));}
        debM.setMatrixAt(i,m);});
      debM.instanceMatrix.needsUpdate=true;}
    sparkS.forEach((s,i)=>{const ft=t-s.t0,alive=ft>0&&ft<2.5;
      const r=s.r+s.vr*Math.max(0,ft),[x,z]=P.polar(s.a,r);
      sparkP[i*3]=alive?x:0;sparkP[i*3+1]=alive?Y(P.deck)+s.vy*ft-0.5*30*ft*ft:-1e5;sparkP[i*3+2]=alive?z:0;});
    sparkG.attributes.position.needsUpdate=true;
    // the failsafe mist
    for(const m of mist){const ft=t-m.t0,u=ft/m.life;
      m.m.visible=ft>0&&u<1.4;
      if(m.m.visible){const R=m.R*Math.min(1,0.2+u*1.2);m.m.scale.setScalar(R);
        m.m.position.set(m.x-Math.cos(m.a)*R*0.6,m.y-ft*3,m.z-Math.sin(m.a)*R*0.6);}}
    mistM.opacity=0.16*(1-smooth(30,40,t));
    // the seas and the ferry
    SIG.seaChurn=smooth(25,29,t)*(1-0.5*smooth(34,40,t));
    SIG.ferryWreck=smooth(27,31,t);
    // over the rim: helicopters in, circling, lights on the orifice; trucks along the roads in to the rim
    for(const h of helis){
      const leave=smooth(44+h.ph*0.4,49+h.ph*0.4,t);       // and away, once it is over
      const arr=smooth(h.arrive,h.arrive+4,t)*(1-leave),a=h.ph+t*h.w,R=h.R+(1-arr)*1600;
      const x=AX+Math.cos(a)*R,z=AZ+Math.sin(a)*R,y=P.TOP+h.h+(1-arr)*140+4*Math.sin(t*0.7+h.ph);
      h.g.position.set(x,y,z);h.g.rotation.set(0.05*Math.sin(t*0.5),-a-Math.sign(h.w)*Math.PI/2,0.1*Math.sign(h.w));
      h.rot.rotation.y=now*0.05;h.tail.rotation.x=now*0.08;
      h.nr.visible=(now%1200)<150;h.nw.visible=((now+600)%1200)<120;
      const tx=AX+Math.cos(t*0.21+h.ph)*MR*0.6,tz=AZ+Math.sin(t*0.17+h.ph*1.3)*MR*0.6,ty=gH(tx,tz)+1;
      const dir=new THREE.Vector3(tx-x,ty-y,tz-z),len=dir.length();
      h.cone.position.set(x,y-2,z);h.cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),dir.normalize());
      h.cone.scale.set(len*0.12,len,len*0.12);h.cone.visible=h.spot.visible=arr>0.9;
      h.spot.position.set(tx,ty,tz);h.spot.scale.setScalar(len*0.06);
      h.g.visible=t>h.arrive-1&&leave<0.98;h.cone.visible=h.spot.visible=h.cone.visible&&leave<0.2;}
    for(const k of trucks){
      const u=smooth(k.t0,k.t0+6,t),r=k.r0+(k.r1-k.r0)*u,x=AX+Math.cos(k.a)*r,z=AZ+Math.sin(k.a)*r;
      k.g.position.set(x,gH(x,z),z);k.g.rotation.y=-k.a+Math.PI;k.g.visible=t>k.t0-0.5;
      const f=((now+k.ph*100)%500)<250;k.lr.visible=f;k.lb.visible=!f;}
    // the fluid coming back down, and where it lands
    const fall=rise>0.1?1:0;
    rainS.forEach((d,i)=>{const c=cols[d.c];const u=(d.u+t*0.3)%1,h=(c.H+P.D0)*rise;
      const top=Y(P.D0)+h,rr=10+d.v*u*4,x=c.x+Math.cos(d.a)*rr,z=c.z+Math.sin(d.a)*rr;
      const y=top+30*u-0.5*420*u*u;
      rainP[i*3]=fall?x:0;rainP[i*3+1]=fall&&y>gH(x,z)?y:-1e5;rainP[i*3+2]=fall?z:0;});
    rainG.attributes.position.needsUpdate=true;
    for(const s of splashes){const u=(s.ph+t*0.8)%1,x=AX+Math.cos(s.a)*s.r,z=AZ+Math.sin(s.a)*s.r;
      s.m.visible=fall&&t>27;s.m.position.set(x,gH(x,z)+0.3,z);s.m.scale.setScalar(2+u*14);s.m.material.opacity=0.5*(1-u);}
    // the caption border flashes while the alarms are going
    cap.style.borderColor=t<33&&((now%1000)<500)?'#ff4030':'#a8281f';
    // the end: fade to black, put 2006 back behind it, and fade in again
    if(t>=END&&!S.ending){S.ending=true;veil.style.opacity='1';
      setTimeout(()=>{if(S.on&&S.ending)set(false);veil.style.opacity='0';},FADE*1000+150);}
    // the caption
    let i=-1;for(let k=0;k<TL.length;k++)if(t>=TL[k][0])i=k;
    if(i!==S.shown){S.shown=i;if(i>=0)cap.textContent=TL[i][1]+'  ·  '+TL[i][2];}
  });

  api.onUI(({ui,mkBtn})=>{
    btn=mkBtn('4 July 2007',ui,()=>set(!S.on));
    btn.setAttribute('aria-pressed','false');
    btn.title='Play the night of the incident, and leave the park as it left it';
    if(/(^|&)2007(&|$)/.test(HASH0||''))set(true);
  });
  ctx.incident=set;
}
