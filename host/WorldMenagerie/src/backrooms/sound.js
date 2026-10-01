// ---------- the hum ----------
// The sound of the place is the most remembered thing about it, and it is nothing: mains hum off a few
// hundred ballasts. Here it is a sawtooth at 120 Hz through a band-pass (the buzz), a 60 Hz square under it
// (the body), a thin whine up high and a little hiss, all breathing slowly so it is never quite steady. The
// Poolrooms trade the buzz for water slapping at tile; Level 1 is a lower drone and the air handling.
//
// Browsers do not let a page make a sound before it has been clicked or typed at, so nothing starts until the
// first time you touch the page, and the M key or the button mutes it.
export function createSound(){
  const O={on:true,started:false,onstart:null};
  let ac=null,master=null,parts=[],lvl=0;
  function noiseBuf(){const n=ac.sampleRate*2,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return b;}
  function osc(type,f,g,filt,ff,q){const o=ac.createOscillator();o.type=type;o.frequency.value=f;
    const gn=ac.createGain();gn.gain.value=g;let n=o;
    if(filt){const bq=ac.createBiquadFilter();bq.type=filt;bq.frequency.value=ff;bq.Q.value=q||0.7;o.connect(bq);n=bq;}
    n.connect(gn);gn.connect(master);o.start();parts.push(o);return gn;}
  function noise(g,filt,ff,q){const s=ac.createBufferSource();s.buffer=noiseBuf();s.loop=true;
    const bq=ac.createBiquadFilter();bq.type=filt;bq.frequency.value=ff;bq.Q.value=q||0.7;
    const gn=ac.createGain();gn.gain.value=g;s.connect(bq);bq.connect(gn);gn.connect(master);s.start();parts.push(s);return gn;}
  function lfo(target,rate,depth){const o=ac.createOscillator();o.frequency.value=rate;const g=ac.createGain();g.gain.value=depth;
    o.connect(g);g.connect(target);o.start();parts.push(o);}
  function voice(level){
    for(const p of parts){try{p.stop();}catch(_){}}parts=[];
    if(level===37){
      const w=noise(0.05,'lowpass',520,0.9);lfo(w.gain,0.23,0.035);
      const w2=noise(0.02,'bandpass',1400,2);lfo(w2.gain,0.41,0.015);
      osc('sine',55,0.012);
    }else if(level===1){
      osc('sawtooth',50,0.035,'lowpass',160);const d=osc('sine',100,0.018);lfo(d.gain,0.09,0.01);
      noise(0.018,'lowpass',300,0.7);
    }else{
      const buzz=osc('sawtooth',120,0.05,'bandpass',240,0.8);lfo(buzz.gain,0.13,0.015);
      osc('square',60,0.022,'lowpass',180);
      const wh=osc('sine',7860,0.0016);lfo(wh.gain,0.07,0.0012);
      noise(0.006,'highpass',3500,0.7);
    }
  }
  O.start=level=>{
    if(O.started)return;
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
    try{ac=new AC();master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
      voice(level);lvl=level;O.started=true;
      master.gain.setTargetAtTime(O.on?0.8:0,ac.currentTime,0.6);
      if(O.onstart)O.onstart();}catch(_){}
  };
  O.level=level=>{lvl=level;if(ac)voice(level);};
  O.toggle=()=>{O.on=!O.on;if(master)master.gain.setTargetAtTime(O.on?0.8:0,ac.currentTime,0.15);return O.on;};
  O.tick=()=>{};
  return O;
}
