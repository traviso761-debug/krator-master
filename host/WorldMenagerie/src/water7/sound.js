// ---------- the sound of Water 7 ----------
// Made, not recorded: everything here is generated with WebAudio, so the page carries no sound files. Off until the
// Sound button is pressed (a browser will not play before a click), and each source's loudness goes with how near the
// camera is to it:
//   the surf      noise through a low filter, swelling and falling, loud by the sea wall and the shore
//   the fountain  noise through a high filter, a rush, near Up Town
//   the yards     hammer strokes, short knocks at their own uneven beat, near any of the docks
//   gulls         now and then a cry - a falling squeal, two or three of them - near the water
//   the whistle   the Puffing Tom's chord when it blows (api.SEATRAIN.whistle), by how near the engine is
//   the bells     the sea wall's warning bells, struck while they swing (api.BELLS, Aqua Laguna)
export function sound(api){
  const {THREE,scene,camera,animHooks,OSM,C}=api;const W7=OSM.water7;if(!W7)return;
  const DAM=W7.damR||1480,ISL=W7.tiers?W7.tiers[0][0]:1350,TOP=W7.tiers?W7.tiers[W7.tiers.length-1][1]:176;
  const ST=(C.landmarks||[]).find(l=>l.model==='station'),[stx,stz]=ST?api.P(ST.at):[1290,0];
  const docks=Object.values(api.DOCKSHIPS||{}).map(S=>new THREE.Vector3(S.kx,0,0).applyMatrix4(S.dock.matrixWorld));
  let A=null,on=false;const N={};
  function start(){A=new (window.AudioContext||window.webkitAudioContext)();const master=A.createGain();master.gain.value=0.7;master.connect(A.destination);N.master=master;
    const noise=(()=>{const b=A.createBuffer(1,A.sampleRate*3,A.sampleRate),d=b.getChannelData(0);let last=0;for(let i=0;i<d.length;i++){const w=Math.random()*2-1;last=(last+0.02*w)/1.02;d[i]=w*0.5+last*3;}return b;})();
    const loop=(type,f,q)=>{const s=A.createBufferSource();s.buffer=noise;s.loop=true;const fl=A.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q||0.7;const g=A.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(master);s.start();return g;};
    N.surf=loop('lowpass',480);N.fount=loop('highpass',900);N.noise=noise;}
  const hit=(f,dur,vol,type='bandpass',q=4)=>{const s=A.createBufferSource();s.buffer=N.noise;const fl=A.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=A.createGain();const t=A.currentTime;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(fl);fl.connect(g);g.connect(N.master);s.start(t,Math.random()*2,dur+0.05);};
  const tone=(freqs,dur,vol,type='triangle',glide=null)=>{const t=A.currentTime,g=A.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.05);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);g.connect(N.master);
    for(const f of freqs){const o=A.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(glide)o.frequency.exponentialRampToValueAtTime(f*glide,t+dur);o.connect(g);o.start(t);o.stop(t+dur+0.05);}};
  const gull=v=>{for(let k=0;k<2+Math.floor(Math.random()*2);k++)setTimeout(()=>{if(on)tone([1500+Math.random()*300],0.28,v,'sawtooth',0.6);},k*320);};
  const whistle=v=>tone([523,659,784],1.8,v,'triangle');
  const bell=v=>tone([440,1102,1652],2.2,v,'sine',0.995);
  // the button: in the interface's row
  api.onUI&&api.onUI(({ui,mkBtn})=>{const b=mkBtn('Sound: off',ui,()=>{if(!A)start();on=!on;if(on&&A.state==='suspended')A.resume();N.master.gain.value=on?0.7:0;b.textContent='Sound: '+(on?'on':'off');});});
  let nextHit=0,nextGull=0,nextBell=0,whistled=0;
  animHooks.push(now=>{if(!A||!on)return;const t=now/1000,c=camera.position,r=Math.hypot(c.x,c.z),h=Math.max(0,c.y);
    const near=(d,R)=>Math.max(0,1-d/R);
    // the surf: the nearer the wall's sea face or the shore, the louder; quieter from high up
    const dSea=Math.min(Math.abs(r-DAM-20),Math.abs(r-ISL));N.surf.gain.value=0.5*near(dSea,700)*near(h,600)*(0.65+0.35*Math.sin(t/4.3))+0.05;
    N.fount.gain.value=0.28*near(Math.hypot(r,(h-TOP-60)*0.8),700);
    // the yards: knocks when near a dock
    let dd=1e9;for(const p of docks)dd=Math.min(dd,Math.hypot(c.x-p.x,c.z-p.z));const yv=0.35*near(dd,650)*near(h,400);
    if(yv>0.01&&t>nextHit){nextHit=t+0.1+Math.random()*0.35;hit(1800+Math.random()*1600,0.05,yv);}
    if(t>nextGull){nextGull=t+3+Math.random()*7;const gv=0.12*near(Math.min(dSea,dd),900)*near(h,500);if(gv>0.01)gull(gv);}
    const T=api.SEATRAIN;if(T&&T.whistle>0&&t-whistled>3){whistled=t;const ex=stx+80+T.s;whistle(0.25*near(Math.hypot(c.x-ex,c.z-stz),1500)+0.02);}
    if((api.BELLS||[]).some(B=>B.swing>0.3)&&t>nextBell){nextBell=t+1.3;bell(0.18*near(Math.abs(r-DAM),1400)+0.03);}});
}
