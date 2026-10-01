// ---------- the biwa: Nakime plays, and the castle moves ----------
// Fan work. In the story the castle is Nakime's Blood Demon Art, and when she strikes her biwa it moves: rooms
// slide past each other, turn over, drop away; she rams rooms out of the walls like pillars; a door opens under
// someone's feet onto a fall. So a strum here goes out from her through the whole castle, and everything it
// moves moves when the front gets to it:
//
//   the doors       a front goes out from her through every wall at 140 m/s, and behind it the bays are dealt
//                   again: lit shoji go dark, fusuma become open doors, doors close (mats.js, uEpoch)
//   the rooms       clusters (kit.js) near you and all over the castle: they slide, or shuffle through two or
//                   three slides one after another like a sliding puzzle, or turn over, or drop, or change places
//                   with a neighbour, the two of them swinging past each other
//   the doors       the rooms near you slide their doors open or shut, panel after panel, as the front reaches
//                   them; a great strum slams every one
//   the stairs      flights and tangles of stairs swing ninety degrees about one end, to meet somewhere new
//   the districts   every room within fifty metres of a point turns ninety degrees about it at once - the castle
//                   folding
//   the walls       blocks slide in and out; some are rammed forty to a hundred metres out into the hall, hold
//                   there, and more often than not are pulled back; columns of rooms drop from the ceiling
//   the sound       a strum across four strings with a buzzing bridge (the sawari, which is what makes a biwa
//                   sound like a biwa), the slap of the plectrum, and a hall's worth of echo; and a thud, and the
//                   camera shaking, when something big slams home near you
//
// Each strum echoes twice, smaller each time, and runs of wall blocks ram out one after another like a line of
// pillars, and the ceiling's columns drop in a cascade. Between strums, while she is playing, something near you
// shifts every second or two: the castle is never quite still. A strum has a strength. B is one; Shift+B is a great strum - three strikes, twice as much of everything, and a
// bigger fold - which she also plays herself every fourth time. Nothing moves out of the hall or into a place.
// None of it is layout: the fingerprint is taken before the first strum, and the castle is not the same after.
export function createBiwa({THREE,kit,shell,fm,hall,nakime,reserved=[]}){
  const V=THREE.Vector3,Q=THREE.Quaternion,M=THREE.Matrix4;
  const moves=[];let count=0;
  const R=Math.random,rr=(a,b)=>a+(b-a)*R(),pick=a=>a[Math.floor(R()*a.length)],sgn=()=>R()<0.5?-1:1;
  const eases={slam:u=>u>=1?1:1-Math.pow(1-u,4),smooth:u=>u*u*(3-2*u),ram:u=>u>=1?1:1-Math.pow(1-u,6)};
  const WAVE=fm.U.uWave.value;
  const clearOfPlaces=(p,r)=>reserved.every(t=>(p.x-t[0])**2+(p.y-t[1])**2+(p.z-t[2])**2>(r*0.7+t[3])**2);
  const okC=(p,r)=>hall.inside(p,r+8)&&clearOfPlaces(p,r)&&p.distanceTo(cam0)>r+10;
  const okB=(b,p)=>p.y-b.H/2>0&&p.y+b.H/2<hall.CEIL+2&&Math.max(Math.abs(p.x),Math.abs(p.z))<hall.HALF+80&&clearOfPlaces(p,Math.max(b.W,b.H,b.D)/2);
  // and nothing lands on you, or goes through you on the way: the camera, while a strum is being worked out
  let cam0=new V(1e9,1e9,1e9);
  const segGap=(a,b,p)=>{const ab=b.clone().sub(a),t=Math.max(0,Math.min(1,p.clone().sub(a).dot(ab)/Math.max(1e-6,ab.lengthSq())));return a.clone().addScaledVector(ab,t).distanceTo(p);};
  const cpos=c=>{const p=new V(),q=new Q(),s=new V();c.m.decompose(p,q,s);return [p,q];};
  // when the front from Nakime gets to a point, in ms from now
  const arrive=p=>p.distanceTo(nakime.pos)/WAVE*1000+rr(0,250);
  const AX=[new V(1,0,0),new V(0,1,0),new V(0,0,1)];

  // ---- the kinds of move ----
  // a house on the floor slides across the tatami, and stays on it
  const okF=(p,r)=>Math.max(Math.abs(p.x),Math.abs(p.z))<hall.HALF-r-10&&clearOfPlaces(p,r)&&p.distanceTo(cam0)>r+10;
  function slide(c,t0,steps){const [p0,q0]=cpos(c);let p=p0.clone(),t=t0;const seq=[];
    for(let i=0;i<steps;i++){const ax=c.floor?pick([AX[0],AX[2]]).clone():pick(AX).clone().applyQuaternion(q0),p1=p.clone().addScaledVector(ax,sgn()*rr(2,14)*1.82);
      if(!(c.floor?okF(p1,c.r):okC(p1,c.r)))break;seq.push([p.clone(),p1,t]);p=p1;t+=rr(450,700);}
    if(!seq.length)return false;
    c.moving=true;seq.forEach(([a,b,t],i)=>moves.push({c,p0:a,q0,p1:b,q1:q0,t0:t,T:rr(380,560),ease:'slam',last:i===seq.length-1}));return true;}
  function turn(c,t0){const [p0,q0]=cpos(c);const ax=c.floor||R()<0.55?AX[1]:pick([AX[0],AX[2]]);
    c.moving=true;moves.push({c,p0,q0,p1:p0,q1:new Q().setFromAxisAngle(ax,sgn()*Math.PI/2).multiply(q0),t0,T:rr(500,800),ease:'slam',last:true});return true;}
  function drop(c,t0){if(c.floor)return slide(c,t0,2);const [p0,q0]=cpos(c);const p1=p0.clone();p1.y+=c.bridge?sgn()*rr(4,24):(R()<0.6?-1:1)*rr(12,50);
    if(!c.bridge&&!okC(p1,c.r))return false;c.moving=true;moves.push({c,p0,q0,p1,q1:q0,t0,T:rr(450,800),ease:'slam',last:true});return true;}
  // two rooms change places, swinging past each other rather than through
  function swap(a,b,t0){const [pa,qa]=cpos(a),[pb,qb]=cpos(b);const arc=rr(8,20);
    a.moving=b.moving=true;const T=rr(900,1300);
    moves.push({c:a,p0:pa,q0:qa,p1:pb,q1:qa,t0,T,ease:'smooth',arc,last:true},{c:b,p0:pb,q0:qb,p1:pa,q1:qb,t0,T,ease:'smooth',arc:-arc,last:true});return true;}
  // a district folds: everything in reach of a point turns about it together
  function fold(ctr,reach,t0){
    const ax=R()<0.5?AX[1]:pick([AX[0],AX[2]]),ang=sgn()*Math.PI/2,rot=new Q().setFromAxisAngle(ax,ang);
    const members=kit.clusters.filter(c=>!c.fixed&&!c.moving&&!c.bridge&&!c.floor&&cpos(c)[0].distanceTo(ctr)<reach);
    if(members.length<3)return 0;
    for(const c of members){const [p]=cpos(c);if(!okC(p.clone().sub(ctr).applyQuaternion(rot).add(ctr),c.r))return 0;}
    const T=rr(1300,1800);
    for(const c of members){const [p0,q0]=cpos(c);c.moving=true;moves.push({c,p0,q0,t0,T,ease:'smooth',fold:{ctr:ctr.clone(),ax,ang},last:true});}
    return members.length;}
  // stairs swing: a flight or a tangle turns ninety degrees about one of its ends, to meet somewhere else
  function swing(c,t0){if(!c.pivots)return false;
    const piv=pick(c.pivots).clone().applyMatrix4(c.m),ax=R()<0.6?AX[1]:pick([AX[0],AX[2]]),ang=sgn()*Math.PI/2,rot=new Q().setFromAxisAngle(ax,ang);
    const [p0,q0]=cpos(c);if(!okC(p0.clone().sub(piv).applyQuaternion(rot).add(piv),c.r))return false;
    c.moving=true;moves.push({c,p0,q0,t0,T:rr(900,1300),ease:'smooth',fold:{ctr:piv,ax,ang},last:true});return true;}
  // the doors of a room: every panel along its front slides open or shut, one after another, fast
  function doors(c,t0,to){if(!c.doors||c.doorsMoving)return 0;
    const target=to===undefined?!c.doors[0].state:to;let k=0;c.doorsMoving=true;
    const list=target?c.doors:[...c.doors].reverse();
    list.forEach((d,j)=>{if(d.state===target)return;d.state=target;
      moves.push({door:d,c,m0:d.it.m.clone(),m1:(target?d.open:d.closed).clone(),t0:t0+j*55+rr(0,30),T:rr(180,260),ease:'slam',last:j===list.length-1});k++;});
    if(!k)c.doorsMoving=false;return k;}
  // the walls: in or out a little, or rammed a long way out and (usually) pulled back; the ceiling's columns drop
  // o.ram / o.drop force a ram or a drop of that length (the lines of pillars and the ceiling cascades)
  function block(b,t0,power,o={}){
    const dz=new V(0,0,1).applyQuaternion(b.quat);const k=R();
    let p1,hold=0,T=rr(380,700),ease='slam';
    if(o.ram){p1=b.pos.clone().addScaledVector(dz,o.ram);hold=o.hold;T=rr(600,900);ease='ram';}
    else if(o.drop){p1=b.pos.clone();p1.y-=o.drop;hold=o.hold;T=rr(600,900);}
    else if(b.style===1){p1=b.pos.clone();p1.y-=rr(15,60)*(power>1?1.4:1);hold=R()<0.5?rr(2500,6000):0;T=rr(700,1100);}
    else if(k<0.28*power){p1=b.pos.clone().addScaledVector(dz,rr(40,110));hold=R()<0.7?rr(2000,5000):0;T=rr(700,1100);ease='ram';}
    else{let d=sgn()*rr(6,28);p1=b.pos.clone().addScaledVector(dz,d);if(!okB(b,p1)){d=-d;p1=b.pos.clone().addScaledVector(dz,d);}}
    if(!okB(b,p1)||segGap(b.pos,p1,cam0)<Math.max(b.W,b.H,b.D)*0.75+12)return false;
    b.moving=true;const p0=b.pos.clone();
    moves.push({b,p0,p1,t0,T,ease,last:!hold,back:hold?{t0:t0+T+hold,T:rr(900,1500)}:null});return true;}

  // A pulse: one round of moves. The strum is the big one, with the doors and the sound; its echoes follow it;
  // and between strums, while she is playing, the castle is never quite still.
  function pulse(near,power,t0,{wave=true,folds=power*2,swaps=4*power,nearN=55*power,farN=90*power,nearB=70*power,farB=120*power,lines=power*2,cascades=power,doorN=40*power}={}){
    cam0.copy(near);
    const when=p=>t0+(wave?arrive(p):rr(0,900));
    let n=0,nb=0;
    const free=kit.clusters.filter(c=>!c.fixed&&!c.moving);
    const byNear=free.map(c=>({c,d:cpos(c)[0].distanceTo(near)})).sort((a,b)=>a.d-b.d);
    // near you: the districts fold first, so the rooms in them are not taken by anything else
    for(let f=0;f<folds;f++){const o=byNear[Math.floor(R()*Math.min(60,byNear.length))];if(!o||o.c.moving||o.c.floor)continue;
      const [ctr]=cpos(o.c);n+=fold(ctr,power>1&&f===0?85:rr(40,60),when(ctr));}
    const pool=byNear.filter(o=>!o.c.moving&&o.d<340).slice(0,Math.max(nearN*2,10));
    for(let i=0;i+1<pool.length&&i<swaps*2;i+=2){const a=pool[i].c,b=pool[i+1].c;
      if(!a.moving&&!b.moving&&!a.bridge&&!b.bridge&&!a.floor&&!b.floor&&cpos(a)[0].distanceTo(cpos(b)[0])<100){if(swap(a,b,when(cpos(a)[0])))n+=2;}}
    const act=c=>{if(c.moving)return false;const t=when(cpos(c)[0]),k=R();
      if(c.pivots&&k<0.5)return swing(c,t);
      return c.bridge?drop(c,t):k<0.25?slide(c,t,1):k<0.5?slide(c,t,2+Math.floor(R()*4)):k<0.8?turn(c,t):drop(c,t);};
    // the doors: of the rooms round you, as the front reaches each; a great strum slams every one
    let dn=0;for(const {c,d} of byNear){if(dn>=doorN||d>260)break;if(!c.doors)continue;if(power<2&&R()<0.4)continue;if(doors(c,when(cpos(c)[0])))dn++;}
    let m=0;for(const {c} of pool){if(m>=nearN)break;if(R()<0.3)continue;if(act(c)){m++;n++;}}
    for(let i=0;i<farN;i++){const c=pick(free);if(act(c))n++;}
    // the walls and the ceiling
    const bs=shell.boxes.filter(b=>!b.fixed&&!b.moving);
    const nearBs=bs.filter(b=>b.pos.distanceTo(near)<300);
    // lines of pillars: a run of neighbouring blocks in one wall, rammed out one after another
    for(let l=0;l<lines&&nearBs.length;l++){const b0=pick(nearBs);if(b0.style===1)continue;
      const dz=new V(0,0,1).applyQuaternion(b0.quat),tg=new V(dz.z,0,-dz.x),ram=rr(25,75),hold=R()<0.75?rr(3000,6000):0;
      const row=nearBs.filter(b=>!b.moving&&b.style!==1&&new V(0,0,1).applyQuaternion(b.quat).dot(dz)>0.95&&b.pos.distanceTo(b0.pos)<70)
        .sort((a,b)=>a.pos.clone().sub(b0.pos).dot(tg)-b.pos.clone().sub(b0.pos).dot(tg)).slice(0,14);
      const tl=when(b0.pos);row.forEach((b,i)=>{if(block(b,tl+i*110,power,{ram:ram*rr(0.85,1.15),hold}))nb++;});}
    // the ceiling: its columns drop one after another, outward from a point
    for(let k=0;k<cascades;k++){const ctr=near.clone();ctr.x+=rr(-120,120);ctr.z+=rr(-120,120);
      const col=bs.filter(b=>b.style===1&&!b.moving&&Math.hypot(b.pos.x-ctr.x,b.pos.z-ctr.z)<70).sort((a,b)=>Math.hypot(a.pos.x-ctr.x,a.pos.z-ctr.z)-Math.hypot(b.pos.x-ctr.x,b.pos.z-ctr.z)).slice(0,40);
      const tc=t0+(wave?arrive(new V(ctr.x,hall.CEIL,ctr.z)):0),dropL=rr(20,55),hold=R()<0.6?rr(3000,7000):0;
      col.forEach(b=>{if(block(b,tc+Math.hypot(b.pos.x-ctr.x,b.pos.z-ctr.z)*9,power,{drop:dropL*rr(0.7,1.3),hold}))nb++;});}
    for(let i=0;i<nearB&&nearBs.length;i++){const b=pick(nearBs);if(!b.moving&&block(b,when(b.pos),power))nb++;}
    for(let i=0;i<farB;i++){const b=pick(bs);if(!b.moving&&block(b,when(b.pos),power))nb++;}
    return {rooms:n,blocks:nb,doors:dn};
  }

  let echoes=[];
  function strum(near,power=1){
    count++;
    const t0=performance.now();
    fm.U.uEpoch.value+=1;fm.U.uWaveT.value=0;fm.U.uOrigin.value.copy(nakime.pos);
    armT=t0;sound.play();if(power>1){setTimeout(()=>{armT=performance.now();sound.play();},420);setTimeout(()=>{armT=performance.now();sound.play();},840);}
    const r=pulse(near,power,t0);
    // and it goes on after: two echoes, each smaller, following the front out
    for(const [dt,k] of [[2200,0.5],[4800,0.3]])echoes.push({at:t0+dt,power,k});
    return r;
  }
  // the castle on its own: every second or two, something near you shifts
  function restless(near){
    return pulse(near,1,performance.now(),{wave:false,folds:R()<0.15?1:0,swaps:R()<0.3?1:0,nearN:3,farN:6,nearB:5,farB:8,lines:R()<0.2?1:0,cascades:R()<0.12?1:0,doorN:2+Math.floor(R()*3)});
  }

  let armT=-1e9,shake=0,thudAt=0;
  const tp=new V(),tv=new V(),tq=new Q(),one=new V(1,1,1),tm=new M(),up=new V(0,1,0),rq=new Q();
  // something big has slammed home: shake the camera, and thud, by how near it is and how big
  function impact(p,size,cam){const d=p.distanceTo(cam),k=Math.max(0,1-d/(60+size*4))*Math.min(1,size/12);
    if(k<=0.02)return;shake=Math.max(shake,k);const now=performance.now();if(now-thudAt>90){thudAt=now;sound.thud(k);}}
  function update(now,dt,cam){
    fm.U.uWaveT.value+=dt;
    for(let i=echoes.length-1;i>=0;i--){const e=echoes[i];if(now<e.at)continue;echoes.splice(i,1);
      if(cam){const k=e.k,p=e.power;pulse(cam,p,now,{folds:Math.round(2*p*k),swaps:Math.round(4*p*k),nearN:Math.round(55*p*k),farN:Math.round(90*p*k),
        nearB:Math.round(70*p*k),farB:Math.round(120*p*k),lines:Math.round(2*p*k+0.4),cascades:Math.round(p*k+0.3),doorN:Math.round(20*p*k)});}}
    shake*=Math.exp(-dt*5);
    // her arm: down across the strings and back
    const a=(now-armT)/1000;nakime.arm.rotation.x=a<0.12?-0.25-a/0.12*0.8:a<0.6?-1.05+(a-0.12)/0.48*0.8:-0.25+0.03*Math.sin(now/900);
    for(let i=moves.length-1;i>=0;i--){const m=moves[i];if(now<m.t0)continue;const u=Math.min(1,(now-m.t0)/m.T),e=eases[m.ease](u);
      if(m.door){tp.setFromMatrixPosition(m.m0).lerp(tv.setFromMatrixPosition(m.m1),e);tm.copy(m.m1).setPosition(tp);kit.setLocal(m.door.it,tm);}
      else if(m.c){
        if(m.fold){rq.setFromAxisAngle(m.fold.ax,m.fold.ang*e);tp.copy(m.p0).sub(m.fold.ctr).applyQuaternion(rq).add(m.fold.ctr);tq.copy(rq).multiply(m.q0);}
        else{tp.copy(m.p0).lerp(m.p1,e);if(m.arc)tp.addScaledVector(up,Math.sin(Math.PI*e)*m.arc);tq.copy(m.q0).slerp(m.q1,e);}
        kit.move(m.c,tm.compose(tp,tq,one));}
      else{m.b.pos.copy(m.p0).lerp(m.p1,e);shell.place(m.b);}
      if(u>=1){
        if(m.door){if(m.last){m.c.doorsMoving=false;if(cam){const d=tv.setFromMatrixPosition(m.c.m).distanceTo(cam);if(d<70)sound.tak(1-d/70);}}moves.splice(i,1);continue;}
        if(cam)impact(m.c?tp:m.b.pos,m.c?m.c.r:Math.max(m.b.W,m.b.H),cam);
        if(m.back){moves.push({b:m.b,p0:m.p1.clone(),p1:m.p0.clone(),t0:m.back.t0,T:m.back.T,ease:'smooth',last:true});}
        else if(m.last){if(m.c)m.c.moving=false;if(m.b)m.b.moving=false;}
        moves.splice(i,1);}}
    kit.flush();
  }

  // ---- the sound ----
  const sound={on:true,ac:null,bufs:null,out:null,
    wake(){if(this.ac){if(this.ac.state==='suspended')this.ac.resume();return;}
      try{this.ac=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
      const ac=this.ac;this.out=ac.createGain();this.out.gain.value=0.55;
      // the hall: three seconds of noise dying away, as an impulse response
      const conv=ac.createConvolver(),n=Math.floor(ac.sampleRate*3.2),ir=ac.createBuffer(2,n,ac.sampleRate);
      for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3.2)*0.5;}
      conv.buffer=ir;const wet=ac.createGain();wet.gain.value=0.45;
      this.out.connect(ac.destination);this.out.connect(conv);conv.connect(wet);wet.connect(ac.destination);
      this.bufs=[0,1,2].map(()=>pluck(ac));this.thudBuf=thud(ac);},
    // a run of doors slid shut: the thud, high and short
    tak(k){if(!this.on||!this.ac||this.ac.state!=='running'||!this.thudBuf)return;const now=performance.now();if(now-(this.takAt||0)<120)return;this.takAt=now;
      const s=this.ac.createBufferSource(),g=this.ac.createGain();s.buffer=this.thudBuf;s.playbackRate.value=3.2+Math.random()*0.8;
      g.gain.value=0.15+0.4*k;s.connect(g);g.connect(this.out);s.start();},
    // a room slamming home: something heavy and wooden, a long way off or close
    thud(k){if(!this.on||!this.ac||this.ac.state!=='running'||!this.thudBuf)return;
      const s=this.ac.createBufferSource(),g=this.ac.createGain();s.buffer=this.thudBuf;s.playbackRate.value=0.8+Math.random()*0.4;
      g.gain.value=0.25+0.75*k;s.connect(g);g.connect(this.out);s.start();},
    play(){if(!this.on||!this.ac||this.ac.state!=='running')return;
      const s=this.ac.createBufferSource();s.buffer=this.bufs[Math.floor(Math.random()*this.bufs.length)];s.playbackRate.value=0.96+Math.random()*0.08;
      s.connect(this.out);s.start();}};
  return {strum,restless,update,sound,get count(){return count;},get busy(){return moves.length>0;},get shake(){return shake;}};
}

// The thud: a low tone falling in pitch and dying in half a second, under a burst of dark noise - a heavy door
// slid home, or a room arriving where it was going.
function thud(ac){
  const sr=ac.sampleRate,n=Math.floor(sr*0.7),out=new Float32Array(n);let ph=0,lp=0;
  for(let i=0;i<n;i++){const t=i/sr,f=70*Math.exp(-t*3)+38;ph+=2*Math.PI*f/sr;lp+=0.08*((Math.random()*2-1)-lp);
    out[i]=(Math.sin(ph)*0.9*Math.exp(-t*7)+lp*2.2*Math.exp(-t*18))*Math.min(1,i/(sr*0.003));}
  const b=ac.createBuffer(1,n,sr);b.getChannelData(0).set(out);return b;
}

// Karplus-Strong: a burst of noise going round a delay line one string long, averaged each time round so the
// top dies first. Four strings, struck a few milliseconds apart; the sawari is a bridge the string buzzes on,
// which here is a little of the string's own rectified signal fed back and a soft clip; then the plectrum.
function pluck(ac){
  const sr=ac.sampleRate,n=Math.floor(sr*3.4),out=new Float32Array(n);
  const strings=[[98,0.55],[146.8,0.9],[196,1],[293.7,0.75]];
  strings.forEach(([f,amp],k)=>{
    const N=Math.max(2,Math.round(sr/(f*(1+(Math.random()-0.5)*0.004)))),line=new Float32Array(N);
    for(let i=0;i<N;i++)line[i]=(Math.random()*2-1)*(i<N*0.35?1:0.4);
    const start=Math.round((0.004+k*0.018)*sr),decay=0.9972-k*0.0005;let idx=0;
    for(let i=start;i<n;i++){const a=line[idx],b=line[(idx+1)%N];let v=decay*0.5*(a+b);
      v+=0.018*Math.abs(v)-0.009*v*v*v;line[idx]=v;idx=(idx+1)%N;out[i]+=a*amp;}});
  // the bachi: a hard slap, a short burst of filtered noise at the front
  let lp=0;for(let i=0;i<sr*0.05;i++){lp+=0.35*((Math.random()*2-1)-lp);out[i]+=lp*Math.exp(-i/(sr*0.007))*1.4;}
  let peak=0;for(let i=0;i<n;i++){out[i]=Math.tanh(out[i]*1.6);peak=Math.max(peak,Math.abs(out[i]));}
  const fade=Math.floor(sr*0.3);for(let i=0;i<n;i++){out[i]*=0.9/(peak||1);if(i>n-fade)out[i]*=(n-i)/fade;}
  const b=ac.createBuffer(1,n,sr);b.getChannelData(0).set(out);return b;
}
