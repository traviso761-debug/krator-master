// ---------- Chernobyl: what the Zone sounds like ----------
// All synthesised, nothing recorded, and off until the Sound button is pressed (a browser will not play sound a page
// starts on its own; #sound in the address turns it on at the first click). The wind through the empty blocks and
// the pines, louder higher up; a Geiger counter clicking at random, as a real one does, at a rate set by the dose at
// the middle of the screen (radiation.js: about one click every two seconds in clean ground, dozens a second in the
// Red Forest); and for the events api.ctx.sound: boom(power, x, z) (a blast, heard late by its distance at 340 m/s),
// rumble(k) (the ground before it), heli(k) (a Mi-8's rotor beat, k by how near).
export function sound(api){
  const {camera,animHooks}=api;
  let ctx=null,on=false,master,noise,wind,windF,rumble,heli,heliF,nextClick=0;
  const mkNoise=(secs,brown)=>{const n=ctx.sampleRate*secs,b=ctx.createBuffer(1,n,ctx.sampleRate),d=b.getChannelData(0);let last=0;
    for(let i=0;i<n;i++){const w=Math.random()*2-1;if(brown){last=(last+0.02*w)/1.02;d[i]=last*3.5;}else d[i]=w;}return b;};
  const loop=(buf,...chain)=>{const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;let n=s;for(const c of chain){n.connect(c);n=c;}s.start();return n;};
  function init(){ctx=new (window.AudioContext||window.webkitAudioContext)();master=ctx.createGain();master.gain.value=0.8;master.connect(ctx.destination);
    noise=mkNoise(4,false);const brown=mkNoise(6,true);
    windF=ctx.createBiquadFilter();windF.type='bandpass';windF.frequency.value=420;windF.Q.value=0.6;wind=ctx.createGain();wind.gain.value=0;loop(noise,windF,wind).connect(master);
    const rf=ctx.createBiquadFilter();rf.type='lowpass';rf.frequency.value=110;rumble=ctx.createGain();rumble.gain.value=0;loop(brown,rf,rumble).connect(master);
    // the rotor: low noise, its loudness beaten at about 4 a second (five blades at 192 rpm is 16, heard as their pairs)
    heliF=ctx.createBiquadFilter();heliF.type='lowpass';heliF.frequency.value=380;const beat=ctx.createGain();beat.gain.value=0.5;heli=ctx.createGain();heli.gain.value=0;
    loop(brown,heliF,beat).connect(heli);heli.connect(master);const lfo=ctx.createOscillator(),lg=ctx.createGain();lfo.frequency.value=4.3;lg.gain.value=0.5;lfo.connect(lg);lg.connect(beat.gain);lfo.start();}
  const ramp=(p,v,tc)=>p.setTargetAtTime(v,ctx.currentTime,tc||0.4);
  // one Geiger click: a few milliseconds of high noise
  function click(T){const s=ctx.createBufferSource();s.buffer=noise;const f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=2600;const g=ctx.createGain();
    g.gain.setValueAtTime(0.3,T);g.gain.exponentialRampToValueAtTime(0.001,T+0.004);s.connect(f);f.connect(g);g.connect(master);s.start(T,Math.random()*3);s.stop(T+0.01);}
  let doseNow=0.12,doseAt=0;
  animHooks.push(now=>{if(!on||!ctx)return;const T=ctx.currentTime,h=camera.position.y-api.groundH(camera.position.x,camera.position.z);
    ramp(wind.gain,0.05+Math.min(0.2,Math.max(0,h)/2500),1.2);windF.frequency.setTargetAtTime(330+160*Math.sin(now*0.00021)+Math.min(400,h/4),T,1.5);
    if(api.ctx.dose&&now>doseAt){doseAt=now+300;doseNow=api.ctx.dose.here();}
    const rate=Math.min(90,0.5+doseNow*3.2);if(nextClick<T)nextClick=T;
    while(nextClick<T+0.15){click(nextClick);nextClick+=-Math.log(1-Math.random())/rate;}});
  function boom(power=1,x,z){if(!on||!ctx)return;const d=x==null?300:Math.hypot(camera.position.x-x,camera.position.z-z),T=ctx.currentTime+Math.min(6,d/340),k=Math.min(1,600/Math.max(300,d));
    const s=ctx.createBufferSource();s.buffer=noise;const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(1800*k+200,T);f.frequency.exponentialRampToValueAtTime(60,T+4);
    const g=ctx.createGain();g.gain.setValueAtTime(0,T);g.gain.linearRampToValueAtTime(Math.min(1,0.9*power*k),T+0.02);g.gain.exponentialRampToValueAtTime(0.3*k,T+0.9);g.gain.exponentialRampToValueAtTime(0.001,T+7);
    s.connect(f);f.connect(g);g.connect(master);s.start(T,Math.random()*2);s.stop(T+8);
    const o=ctx.createOscillator(),og=ctx.createGain();o.frequency.setValueAtTime(55,T);o.frequency.exponentialRampToValueAtTime(28,T+2);og.gain.setValueAtTime(0.8*power*k,T);og.gain.exponentialRampToValueAtTime(0.001,T+2.5);
    o.connect(og);og.connect(master);o.start(T);o.stop(T+3);}
  let btn=null;
  function toggle(){if(!ctx)init();on=!on;if(on)ctx.resume();else{ramp(wind.gain,0,0.1);ramp(rumble.gain,0,0.1);ramp(heli.gain,0,0.1);}if(btn)btn.setAttribute('aria-pressed',String(on));return on;}
  api.ctx.sound={boom,rumble:k=>{if(on&&ctx)ramp(rumble.gain,Math.max(0,Math.min(0.9,k)),0.3);},heli:k=>{if(on&&ctx)ramp(heli.gain,Math.max(0,Math.min(0.7,k)),0.3);},get on(){return on;}};
  api.onUI&&api.onUI(({ui,mkBtn})=>{btn=mkBtn('Sound',ui,toggle);btn.title='The wind, a Geiger counter for the ground you are looking at, and the events’ sounds';btn.setAttribute('aria-pressed','false');
    if(/(^|[#&])sound(&|$)/.test(location.hash))addEventListener('pointerdown',()=>{if(!on)toggle();},{once:true});});
}
