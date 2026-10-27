// ---------- Rama: what it sounds like ----------
// All synthesised, nothing recorded. Outside there is nothing to hear: Rama turns in vacuum. Inside, the air
// carries the wind (a breath when it is calm, a roar in the storm), a low hum while the suns are lit (this
// page's invention: the novel does not say the valleys hum), thunder when the horns discharge, and the long
// rumble of the Sea when Rama changes course. Off until the Sound button is pressed: a browser will not play
// sound a page starts on its own. #sound in the address turns it on, to start at the first click.
export function makeSound({LS,IN}){
  let ctx=null,on=false,wind,windF,hum,rumble,master,rumbleTarget=0,noise;
  const mkNoise=(secs,brown)=>{const n=ctx.sampleRate*secs,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);let last=0;
    for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){last=(last+0.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}return b;};
  const loop=(buf,...chain)=>{const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;let n=s;for(const c of chain){n.connect(c);n=c;}s.start();return n;};
  function init(){ctx=new (window.AudioContext||window.webkitAudioContext)();addEventListener('pointerdown',()=>{if(on)ctx.resume();},{once:true});master=ctx.createGain();master.gain.value=0.8;master.connect(ctx.destination);
    noise=mkNoise(4,false);const brown=mkNoise(6,true);
    windF=ctx.createBiquadFilter();windF.type='bandpass';windF.frequency.value=380;windF.Q.value=0.7;wind=ctx.createGain();wind.gain.value=0;loop(noise,windF,wind).connect(master);
    hum=ctx.createGain();hum.gain.value=0;const hf=ctx.createBiquadFilter();hf.type='lowpass';hf.frequency.value=160;hf.connect(hum);hum.connect(master);
    for(const [f,g] of [[48,0.5],[72.3,0.3],[96.1,0.12]]){const o=ctx.createOscillator();o.frequency.value=f;const gg=ctx.createGain();gg.gain.value=g;o.connect(gg);gg.connect(hf);o.start();}
    const rf=ctx.createBiquadFilter();rf.type='lowpass';rf.frequency.value=140;rumble=ctx.createGain();rumble.gain.value=0;loop(brown,rf,rumble).connect(master);}
  const ramp=(p,v,tc)=>p.setTargetAtTime(v,ctx.currentTime,tc||0.4);
  function update(now){if(!on||!ctx)return;const inside=IN.active(),t=now/1000;
    const gust=0.75+0.25*Math.sin(t*0.37)*Math.sin(t*0.11+1);
    ramp(wind.gain,inside?(0.025+0.32*LS.cloud+0.25*(LS.lightning||0))*gust:0,0.6);
    windF.frequency.setTargetAtTime(260+260*gust+300*LS.cloud,ctx.currentTime,0.8);
    ramp(hum.gain,inside?0.07*Math.min(1,LS.sun):0,0.3);
    ramp(rumble.gain,inside?rumbleTarget:0,0.5);}
  // thunder: a crack, then a long low roll
  function thunder(dist){if(!on||!ctx||!IN.active())return;const T=ctx.currentTime,d=dist===undefined?0.3:dist;
    const s=ctx.createBufferSource();s.buffer=noise;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(2400*(1-d)+300,T);f.frequency.exponentialRampToValueAtTime(90,T+3.5);
    const g=ctx.createGain();g.gain.setValueAtTime(0,T+d*1.2);g.gain.linearRampToValueAtTime(0.9,T+d*1.2+0.03);g.gain.exponentialRampToValueAtTime(0.25,T+d*1.2+0.8);g.gain.exponentialRampToValueAtTime(0.001,T+d*1.2+6);
    s.connect(f);f.connect(g);g.connect(master);s.start(T,Math.random()*2);s.stop(T+8);}
  return {toggle(){if(!ctx)init();on=!on;if(on)ctx.resume();else{ramp(wind.gain,0,0.1);ramp(hum.gain,0,0.1);ramp(rumble.gain,0,0.1);}return on;},
    update,thunder,rumble:v=>{rumbleTarget=Math.max(0,Math.min(0.9,v));},get on(){return on;}};
}
