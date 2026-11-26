// ---------- Galaxy class: the bridge's sound, the log read aloud, and a music bed ----------
// Original work. Every sound here is made by the page with Web Audio, as the events' are (events.js owns the context
// and the master gain, W.audio; this module only adds to it). Nothing plays until the captain has clicked or pressed
// something: a browser will not start sound before that, and a page that hums at a visitor unasked is rude.
//
//   Ambience  the warp core: a low throb that is there whenever the helm is taken, and rises in pitch and weight with
//             the warp factor; the consoles' chirps, now and then, and with every button pressed on the helm strip;
//             the hull creaking when the ship is turned hard on two axes at once.
//   The log   the Web Speech API reads each new entry of the captain's log as it is written (off unless asked for:
//             a Read aloud toggle in the log's own title bar).
//   Music     a quiet generated bed: slow chords and a sparse line over them, in a mode for what is going on:
//             Lydian for exploring, a low Phrygian pulse under red alert, whole tones while a first contact is on.
//
// M at the helm still mutes the lot (events.js), and now the choice is kept from one visit to the next; music,
// ambience and the voice each have a switch of their own in the help overlay (help.js), kept the same way.
const LS={get:(k,d)=>{try{const v=localStorage.getItem(k);return v==null?d:v==='1';}catch(e){return d;}},
  set:(k,v)=>{try{localStorage.setItem(k,v?'1':'0');}catch(e){}}};

export function audio(W){
  const S=W.flight,{animHooks}=W;
  // ---- off until a gesture ----
  // W.audio() makes the context: called before the visitor has done anything it would only make a suspended one and a
  // warning in the console, so nothing in this module touches it until a real (trusted) click, tap, key or pad press
  let gest=false;const go=e=>{if(e&&e.isTrusted===false)return;gest=true;};
  for(const t of ['pointerdown','keydown','touchstart'])addEventListener(t,go,{capture:true,passive:true});
  W.gestured=()=>gest;W.gesture=()=>{gest=true;};   // a gamepad press (pad.js) counts as one too
  // #gesture: as if the visitor had pressed something, so a test runs the sound's code (on a context a headless browser leaves suspended)
  const TEST=new URLSearchParams(location.hash.slice(1)).has('gesture');if(TEST)gest=true;
  const ctx=()=>{if(!gest)return null;const A=W.audio&&W.audio();return A&&(A.a.state==='running'||TEST)?A:null;};

  // ---- the mute, kept ----
  // events.js keeps the flag; pressing its toggle once at load, before anything has played, starts the page muted
  const mute0=W.mute;let muted=false;
  W.mute=()=>{mute0();muted=!muted;LS.set('ent-muted',muted);sync();if(muted&&window.speechSynthesis)try{speechSynthesis.cancel();}catch(e){}};
  W.muted=()=>muted;
  if(LS.get('ent-muted',false)){mute0();muted=true;}
  const opt={music:LS.get('ent-music',true),amb:LS.get('ent-amb',true),speak:LS.get('ent-speak',false)};
  W.sound={get:k=>k==='mute'?muted:opt[k],set(k,v){if(k==='mute'){if(!!v!==muted)W.mute();return;}opt[k]=!!v;LS.set('ent-'+k,opt[k]);sync();}};

  // ================= ambience =================
  let amb=null,bus=null;
  // a bus under the master for the ambience and the music, so their switches fade them rather than cut them
  function buses(A){if(bus)return bus;const a=A.a;bus={amb:a.createGain(),mus:a.createGain()};bus.amb.gain.value=0;bus.mus.gain.value=0;
    bus.amb.connect(A.master);bus.mus.connect(A.master);return bus;}
  function core(A){const a=A.a,B=buses(A);
    // two detuned saws a fifth apart through a low pass, beating slowly, with a throb in the gain: the warp core
    const o1=a.createOscillator(),o2=a.createOscillator(),o3=a.createOscillator(),f=a.createBiquadFilter(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();
    o1.type=o2.type='sawtooth';o3.type='sine';o1.frequency.value=41;o2.frequency.value=61.7;o3.frequency.value=82;
    f.type='lowpass';f.frequency.value=180;f.Q.value=6;g.gain.value=0;lfo.frequency.value=0.9;lg.gain.value=0;
    lfo.connect(lg);lg.connect(g.gain);for(const o of [o1,o2,o3])o.connect(f);f.connect(g);g.connect(B.amb);
    for(const o of [o1,o2,o3,lfo])o.start();
    return {a,o1,o2,o3,f,g,lfo,lg,creakT:-9,chirpT:a.currentTime+4,load:0};}
  // the consoles: two or three short sine blips, high and soft
  function chirp(A,soft){const a=A.a,B=buses(A),t=a.currentTime+0.01,n=2+(Math.random()*2|0);
    for(let i=0;i<n;i++){const o=a.createOscillator(),g=a.createGain(),t0=t+i*0.07;o.type='sine';o.frequency.value=[1318,1568,1760,2093,2349][Math.random()*5|0];
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(soft?0.05:0.09,t0+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.06);
      o.connect(g);g.connect(B.amb);o.start(t0);o.stop(t0+0.08);}}
  // the hull under a hard turn: low noise through a narrow band that slides down, a groan more than a crack
  function creak(A,k){const a=A.a,B=buses(A),t=a.currentTime,dur=1.2+k;
    const len=Math.ceil(a.sampleRate*dur),b=a.createBuffer(1,len,a.sampleRate),d=b.getChannelData(0);
    for(let i=0,l=0;i<len;i++){l=l*0.97+(Math.random()*2-1)*0.03;d[i]=l*8*(Math.random()<0.004?3:1);}
    const s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=b;f.type='bandpass';f.Q.value=18;
    f.frequency.setValueAtTime(260+Math.random()*120,t);f.frequency.exponentialRampToValueAtTime(110,t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.5*k,t+0.25);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(f);f.connect(g);g.connect(B.amb);s.start(t);}
  W.chirp=soft=>{const A=ctx();if(A&&opt.amb&&!muted)chirp(A,soft);};
  let last=0;
  animHooks.push(now=>{const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;
    if(!gest)return;const A=ctx();if(!A)return;if(!amb)amb=core(A);
    const t=A.a.currentTime,on=S.on&&opt.amb?1:0,w=S.warp||0;
    bus.amb.gain.setTargetAtTime(on*0.9,t,0.8);
    // the core: idling at impulse, and at warp up a fifth per few factors, louder and faster in its throb
    const up=1+w*0.09;amb.o1.frequency.setTargetAtTime(41*up,t,1.5);amb.o2.frequency.setTargetAtTime(61.7*up,t,1.5);amb.o3.frequency.setTargetAtTime(82*up,t,1.5);
    amb.f.frequency.setTargetAtTime(150+w*60,t,1);amb.g.gain.setTargetAtTime(0.10+w*0.035,t,1);
    amb.lfo.frequency.setTargetAtTime(0.9+w*0.35,t,1);amb.lg.gain.setTargetAtTime(0.04+w*0.012,t,1);
    if(!on)return;
    if(t>amb.chirpT){amb.chirpT=t+5+Math.random()*9;chirp(A,true);}
    // the load on the frame: turn rates as a share of their most, yaw and pitch together counting double
    const r=S.rate,ld=Math.abs(r.y)/0.12+Math.abs(r.z)/0.10+0.3*Math.abs(r.x)/0.38;
    amb.load+=(ld-amb.load)*Math.min(1,dt*3);
    if(!w&&amb.load>1.15&&t-amb.creakT>4){amb.creakT=t;creak(A,Math.min(1,amb.load-0.6));}});

  // ================= the log read aloud =================
  const SP=window.speechSynthesis||null;let voice=null,queued=0;
  const pickVoice=()=>{if(!SP)return;try{const vs=SP.getVoices();voice=vs.find(v=>/^en-GB/i.test(v.lang))||vs.find(v=>/^en/i.test(v.lang))||null;}catch(e){}};
  if(SP){pickVoice();try{SP.addEventListener('voiceschanged',pickVoice);}catch(e){}}
  function say(sd,t){if(!SP||!opt.speak||muted||!gest)return;
    // a battle can write five entries in a breath: the voice keeps up with the last three, not the whole backlog
    if(queued>=3)try{SP.cancel();queued=0;}catch(e){}
    try{const u=new SpeechSynthesisUtterance('Captain\'s log, stardate '+sd+'. '+String(t).replace(/^Ship's log: /,''));
      if(voice)u.voice=voice;u.rate=0.95;u.pitch=0.9;u.volume=0.9;queued++;u.onend=u.onerror=()=>{queued=Math.max(0,queued-1);};SP.speak(u);}catch(e){}}
  W.on('log',d=>say(d.sd,d.t));
  // the toggle sits in the log's title bar, beside its Close: the panel's body is rebuilt as the log grows, its head is not
  let rd=null;
  const head=document.querySelector('#ent-orders .hd');
  if(head){rd=document.createElement('button');rd.type='button';rd.textContent='Read aloud';rd.title=SP?'Read each new entry of the captain\'s log aloud':'This browser cannot speak';
    rd.onclick=()=>{W.sound.set('speak',!opt.speak);if(!opt.speak&&SP)try{SP.cancel();}catch(e){}};if(!SP)rd.disabled=true;head.insertBefore(rd,head.lastChild);}

  // ================= the music bed =================
  // Chords every eight seconds or so, a note of melody now and then over them, all from the mode of the moment, slow
  // in and slower out, under a low pass. The scheduler looks a second ahead on a timer (not the frame, which a
  // background tab starves), and a change of mode waits for the next chord.
  const MODES={
    explore:{root:146.83,steps:[0,2,4,6,7,9,11],chords:[[0,4,7,11],[2,6,9],[4,7,11,14],[0,6,9]],every:8,mel:0.55,wave:'triangle',cut:1100},
    alert:  {root:110,steps:[0,1,3,5,7,8,10],chords:[[0,7,12],[1,8,13],[0,3,7],[10,13,17]],every:4,mel:0.2,wave:'sawtooth',cut:520,pulse:true},
    contact:{root:164.81,steps:[0,2,4,6,8,10],chords:[[0,4,8],[2,6,10],[0,6,10],[4,8,12]],every:9,mel:0.75,wave:'sine',cut:2200}};
  const hz=(M,s)=>M.root*Math.pow(2,s/12);
  const deg=(M,i)=>{const n=M.steps.length,o=Math.floor(i/n);return M.steps[((i%n)+n)%n]+12*o;};
  let contactUntil=0,mode='explore',next=0,ci=0;
  W.on('ossari',()=>{contactUntil=performance.now()+120000;});
  const modeNow=()=>{const s=W.shieldsState&&W.shieldsState();if(s&&s.red)return 'alert';
    const o=W.orders&&W.orders.state&&W.orders.state();if(o&&o.active==='contact')return 'contact';
    return performance.now()<contactUntil?'contact':'explore';};
  function voice1(A,f,t0,att,hold,rel,peak,wave,cut){const a=A.a,o=a.createOscillator(),fl=a.createBiquadFilter(),g=a.createGain();
    o.type=wave;o.frequency.value=f;o.detune.value=(Math.random()-0.5)*8;fl.type='lowpass';fl.frequency.value=cut;
    g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(peak,t0+att);g.gain.setValueAtTime(peak,t0+att+hold);g.gain.exponentialRampToValueAtTime(0.0001,t0+att+hold+rel);
    o.connect(fl);fl.connect(g);g.connect(bus.mus);o.start(t0);o.stop(t0+att+hold+rel+0.05);}
  setInterval(()=>{if(!gest)return;const A=ctx();if(!A)return;buses(A);const t=A.a.currentTime;
    bus.mus.gain.setTargetAtTime(opt.music&&!muted?1:0,t,1.5);if(!opt.music)return;
    if(next<t)next=t+0.2;if(next>t+1)return;
    mode=modeNow();const M=MODES[mode],ch=M.chords[ci++%M.chords.length],len=M.every;
    // the chord, quietly, an octave down; under red alert a low pulse on the root instead of a long swell
    for(const s of ch)voice1(A,hz(M,s)/2,next,M.pulse?0.05:len*0.35,M.pulse?0.15:len*0.3,M.pulse?0.6:len*0.6,M.pulse?0.035:0.022,M.wave,M.cut);
    if(M.pulse)for(let k=1;k<len*2;k++)voice1(A,hz(M,ch[0])/4,next+k*0.5,0.02,0.08,0.3,k%2?0.02:0.035,'triangle',300);
    // a few notes of a line, stepping around the chord's root
    let d=M.steps.indexOf(ch[0]%12);if(d<0)d=0;d+=M.steps.length;
    for(let k=0;k<4;k++)if(Math.random()<M.mel){d+=[-2,-1,1,2][Math.random()*4|0];voice1(A,hz(M,deg(M,d)),next+k*len/4+Math.random()*0.4,0.08,len/8,len/4,0.018,'sine',3000);}
    next+=len;},300);

  // ---- what the switches show ----
  function sync(){if(rd){rd.setAttribute('aria-pressed',String(opt.speak));rd.textContent=opt.speak?'Reading aloud':'Read aloud';}
    if(W.onSoundChange)W.onSoundChange();}
  sync();
  return {state:()=>({gest,muted,...opt,mode:modeNow(),speech:!!SP,ctx:W.audio&&gest?(W.audio()||{a:{}}).a.state:null})};
}
