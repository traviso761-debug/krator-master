// ---------- Deep Sky: sound ----------
// Synthesised, nothing recorded, and only after a button press (a browser will not start sound a page asks for on
// its own). One context for the page; the objects ask for what they need:
//   click(T, gain, tone)      a few milliseconds of filtered noise at audio time T: a pulse, as a radio telescope's
//                             speaker plays a pulsar (the Crab, at 30 a second, is a buzz)
//   chirp(T, secs, f0, f1)    a rising whistle, its pitch going as (1 - t/secs)^(-3/8), as two neutron stars' last
//                             orbits do; the LIGO detectors' signal of GW170817 played as sound
//   boom(T, gain)             a low thud with a long tail
export function makeAudio(){
  let ctx=null,master=null,noise=null;
  function init(){if(ctx)return ctx;ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=0.7;master.connect(ctx.destination);
    const n=ctx.sampleRate*2;noise=ctx.createBuffer(1,n,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return ctx;}
  const A={
    get ctx(){return ctx;},
    start(){init();ctx.resume();return ctx;},
    now(){return ctx?ctx.currentTime:0;},
    click(T,gain=0.4,tone=1800){if(!ctx)return;const s=ctx.createBufferSource();s.buffer=noise;const f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=tone;f.Q.value=1.2;
      const g=ctx.createGain();g.gain.setValueAtTime(0.0001,T);g.gain.linearRampToValueAtTime(gain,T+0.002);g.gain.exponentialRampToValueAtTime(0.0001,T+0.03);
      s.connect(f);f.connect(g);g.connect(master);s.start(T,Math.random());s.stop(T+0.04);},
    chirp(T,secs,f0=35,f1=420){if(!ctx)return;const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';
      for(let i=0;i<=60;i++){const u=i/60,t=T+u*secs,k=Math.pow(Math.max(1e-3,1-u*0.995),-3/8),f=Math.min(f1,f0*k);o.frequency[i?'linearRampToValueAtTime':'setValueAtTime'](f,t);}
      g.gain.setValueAtTime(0.0001,T);g.gain.exponentialRampToValueAtTime(0.25,T+secs*0.9);g.gain.exponentialRampToValueAtTime(0.0001,T+secs+0.15);
      o.connect(g);g.connect(master);o.start(T);o.stop(T+secs+0.2);},
    boom(T,gain=0.6){if(!ctx)return;const s=ctx.createBufferSource();s.buffer=noise;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(900,T);f.frequency.exponentialRampToValueAtTime(50,T+3);
      const g=ctx.createGain();g.gain.setValueAtTime(0.0001,T);g.gain.linearRampToValueAtTime(gain,T+0.03);g.gain.exponentialRampToValueAtTime(0.0001,T+5);
      s.connect(f);f.connect(g);g.connect(master);s.start(T);s.stop(T+5.2);},
  };
  return A;
}
