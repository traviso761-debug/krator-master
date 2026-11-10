// ================================================================= CORE — audio: the sky's light effects heard (KSKYSOUND)
// [web] (the owner, 2026-11-09: "plug functionality to core/audio to tie it to some of these light effects"). core/atmos's clouds'
// mood (sky/89-atmos-k-cloudmood.js, host/89-atmos-h-skyhost.js) tells what the sky did through ATMOS.onSky (a flash of its lightning,
// a sky event beginning: a pillar of light or a light ascending, an episode changing) and ATMOS.onThunder (the lightning fx's thunder,
// already delayed by the distance), and keeps ATMOS.skyLevel (the orbs' and the ethereal breathe's strength now). This file is what
// a page binds to hear them:
//   KSKYSOUND.CUES              the cue records in KCUE's shape (core/audio/22-core-audio-cues.js: id, bus, variants, pitch, gainDb,
//                               cooldown, maxVoices), one a light effect. Their variants are EMPTY until the clips are chosen from the
//                               catalogue (core/audio/PLAN.md 4.1: through intake, never by hand); the Audio Lab's Cues tab fills them
//   KSKYSOUND.cueFor(ev)        the cue id for an event record: thunder, flash, pillar, ascent; and the two levels, orbs and breathe
//   KSKYSOUND.gainAt(dist)      the sky's own distance law (1 / (1 + dist / 2500 m)): these sounds come from kilometres away, past
//                               KCUE.falloff's 500 m
//   KSKYSOUND.delayAt(dist)     seconds of sound's travel (dist / 343), for an event that is seen before it is heard
//   KSKYSOUND.bind(o) -> B      the host side: o = {play (fire, ev, cue): the page's clip player when its cues have variants and KCUE is on
//                               the page; master (0..1, .6); synth (true: the built-in stand-in below plays whatever has no clips)}.
//                               B.enabled (false until the page says so: the browser needs a gesture), B.mute(bool), B.level
// THE STAND-IN SYNTH: until the clips are wired, Web Audio makes each sound from oscillators and a noise buffer: thunder a lowpassed
// noise roll with a 45 Hz sub, the flash a crack when it is near, the pillar a boom with a rising sweep, the ascent a tone gliding
// up for the event's length, the orbs a detuned hum, the breathe a bandpassed drone; each delayed by its distance and scaled by
// gainAt. It is a placeholder for the owner to judge timing and feel against the lights, not the game's sound: the catalogue's
// clips replace it cue by cue as their variants are filled. No file is read; nothing here goes to the catalogue or the credits.
// Godot: the same cues on AudioStreamPlayer3Ds at the event's place (GODOT.md "Lightning"); the levels on two looping players.
(function(root){
 var K=root.KSKYSOUND={};
 K.CUES=[
  {id:'sfx.sky.thunder',name:'Thunder after the clouds\' lightning',bus:'sfx',category:'sfx.weather',variants:[],pitch:[-2,2],gainDb:[-4,0],noRepeat:2,cooldown:.3,maxVoices:4,
   notes:'played at ATMOS.onThunder (already delayed by the distance); distant rolls, near cracks: pick variants by the event\'s power'},
  {id:'sfx.sky.flash',name:'The flash itself, near',bus:'sfx',category:'sfx.weather',variants:[],pitch:[-1,1],gainDb:[-8,-2],noRepeat:1,cooldown:.2,maxVoices:2,
   notes:'a short crack at the flash when it is within 2.5 km; thunder follows'},
  {id:'sfx.sky.pillar',name:'A pillar of light, far off',bus:'sfx',category:'sfx.anomaly',variants:[],pitch:[-3,3],gainDb:[-6,0],noRepeat:2,cooldown:1,maxVoices:2,
   notes:'a boom heard dist/343 s after the pillar is seen'},
  {id:'sfx.sky.ascent',name:'A light ascending to the heavens',bus:'sfx',category:'sfx.anomaly',variants:[],pitch:[-2,2],gainDb:[-8,-2],noRepeat:1,cooldown:2,maxVoices:1,
   notes:'a rising tone the length of the ascent (14 s), delayed by the distance'},
  {id:'amb.sky.orbs',name:'The orbs\' hum',bus:'amb',category:'amb.element',variants:[],pitch:[0,0],gainDb:[-12,-12],noRepeat:0,cooldown:0,maxVoices:1,
   notes:'a loop whose gain follows ATMOS.skyLevel.orbs'},
  {id:'amb.sky.breathe',name:'The ethereal glow\'s drone',bus:'amb',category:'amb.element',variants:[],pitch:[0,0],gainDb:[-14,-14],noRepeat:0,cooldown:0,maxVoices:1,
   notes:'a loop whose gain follows ATMOS.skyLevel.breathe'}];
 var BY={};K.CUES.forEach(function(c){BY[c.id]=c;});
 K.cue=function(id){return BY[id]||null;};
 K.cueFor=function(ev){if(!ev)return null;if(ev.kind==='thunder')return'sfx.sky.thunder';if(ev.kind==='flash')return'sfx.sky.flash';
  if(ev.kind==='event')return ev.event==='pillar'?'sfx.sky.pillar':ev.event==='ascent'?'sfx.sky.ascent':null;if(ev.kind==='orbs')return'amb.sky.orbs';if(ev.kind==='breathe')return'amb.sky.breathe';return null;};
 K.gainAt=function(dist){return 1/(1+Math.max(0,dist==null?0:dist)/2500);};
 K.delayAt=function(dist){return Math.max(0,dist==null?0:dist)/343;};
 // ---- the host side
 K.bind=function(o){o=o||{};var A=root.ATMOS||(typeof ATMOS!=='undefined'?ATMOS:null);if(!A||!A.onSky)return false;   /* ATMOS is a page-level const on a built page, not on window */
  var B={enabled:false,master:o.master==null?.6:o.master,level:{orbs:0,breathe:0},ctx:null,synth:o.synth!==false,states:{},fires:0,played:[]};
  var AC=root.AudioContext||root.webkitAudioContext;
  var noise=null,out=null,hum=null,drone=null;
  var lcg=function(s){return function(){s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};};
  var ctx=function(){if(B.ctx||!AC)return B.ctx;var c=new AC();B.ctx=c;out=c.createGain();out.gain.value=B.master;out.connect(c.destination);
   var n=c.sampleRate*2,buf=c.createBuffer(1,n,c.sampleRate),d=buf.getChannelData(0),r=lcg(0x5eed);for(var i=0;i<n;i++)d[i]=r()*2-1;noise=buf;return c;};
  // a page says when (its sound switch is the browser's gesture): B.enabled = true makes the context on that click
  var gesture=function(){if(B.enabled)ctx();};
  if(root.addEventListener){root.addEventListener('pointerdown',gesture,{passive:true});root.addEventListener('keydown',gesture);}
  B.mute=function(m){B.enabled=!m;if(m&&B.ctx)out.gain.setTargetAtTime(0,B.ctx.currentTime,.05);else if(B.ctx)out.gain.setTargetAtTime(B.master,B.ctx.currentTime,.05);return B;};
  // the synth voices (the stand-in). at: seconds from now; g: linear gain
  var env=function(c,node,at,a,peak,dec){var t=c.currentTime+at;node.gain.setValueAtTime(0,t);node.gain.linearRampToValueAtTime(peak,t+a);node.gain.setTargetAtTime(0,t+a,dec/4);return t;};
  var S={
   thunder:function(c,at,g,power){var src=c.createBufferSource();src.buffer=noise;src.loop=true;var lp=c.createBiquadFilter();lp.type='lowpass';var gn=c.createGain();src.connect(lp);lp.connect(gn);gn.connect(out);
    var dec=2.2+2.5*(1-power),t=env(c,gn,at,.04+.2*(1-power),g*(.5+.5*power),dec);lp.frequency.setValueAtTime(300+500*power,t);lp.frequency.exponentialRampToValueAtTime(60,t+dec);src.start(t);src.stop(t+dec+2);
    var o=c.createOscillator(),og=c.createGain();o.type='sine';o.frequency.value=45;o.connect(og);og.connect(out);env(c,og,at,.05,g*.35*power,1.2);o.start(t);o.stop(t+2.5);},
   flash:function(c,at,g){var src=c.createBufferSource();src.buffer=noise;var hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=1200;var gn=c.createGain();src.connect(hp);hp.connect(gn);gn.connect(out);
    var t=env(c,gn,at,.004,g*.3,.08);src.start(t);src.stop(t+.3);},
   pillar:function(c,at,g){var o=c.createOscillator(),og=c.createGain();o.type='sine';o.frequency.value=48;o.connect(og);og.connect(out);var t=env(c,og,at,.03,g*.7,.9);o.start(t);o.stop(t+2);
    var s=c.createOscillator(),sg=c.createGain();s.type='triangle';s.connect(sg);sg.connect(out);env(c,sg,at,.05,g*.12,.6);s.frequency.setValueAtTime(300,t);s.frequency.exponentialRampToValueAtTime(2400,t+.6);s.start(t);s.stop(t+1.5);},
   ascent:function(c,at,g,dur){var o=c.createOscillator(),og=c.createGain(),tr=c.createOscillator(),tg=c.createGain();o.type='sine';o.connect(og);og.connect(out);tr.type='sine';tr.frequency.value=6;tg.gain.value=.3;tr.connect(tg);tg.connect(og.gain);
    var t=c.currentTime+at;og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(g*.12,t+dur*.25);og.gain.setValueAtTime(g*.12,t+dur*.7);og.gain.linearRampToValueAtTime(0,t+dur);
    o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(1500,t+dur);o.start(t);o.stop(t+dur+.1);tr.start(t);tr.stop(t+dur+.1);}};
  var loops=function(c){if(hum)return;hum=c.createGain();hum.gain.value=0;hum.connect(out);[110,113.5].forEach(function(f){var o=c.createOscillator();o.type='sine';o.frequency.value=f;o.connect(hum);o.start();});
   var lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=5;lg.gain.value=.5;lfo.connect(lg);lg.connect(hum.gain);lfo.start();
   drone=c.createGain();drone.gain.value=0;drone.connect(out);var src=c.createBufferSource();src.buffer=noise;src.loop=true;var bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=180;bp.Q.value=4;src.connect(bp);bp.connect(drone);src.start();};
  // a cue fires: KCUE picks the variant when the page has clips for it, else the stand-in plays
  var fire=function(id,ev,dist,power,dur){var cue=BY[id];if(!cue)return;B.fires++;
   var KC=root.KCUE||(typeof KCUE!=='undefined'?KCUE:null),t=A.clock?A.clock.t:0;
   if(KC&&o.play&&cue.variants.length){var cl=B.states[id]||(B.states[id]={cue:KC.clean(cue),st:KC.state()}),f=KC.fire(cl.cue,cl.st,t,(A.h&&A.h.seed)||1);if(f){o.play(f,ev,cl.cue);B.played.push(id);return;}}
   if(!B.synth||!B.enabled)return;var c=ctx();if(!c)return;var g=K.gainAt(dist)*(power==null?1:power),at=ev.kind==='thunder'?0:K.delayAt(dist);
   if(id==='sfx.sky.thunder')S.thunder(c,at,g,power==null?.5:power);else if(id==='sfx.sky.flash'){if(dist<2500)S.flash(c,0,g);}else if(id==='sfx.sky.pillar')S.pillar(c,at,g);else if(id==='sfx.sky.ascent')S.ascent(c,at,g,dur||14);
   B.played.push(id);};
  B.fire=fire;
  var cam=function(){return A.h&&A.h.camera?A.h.camera.position:null;},distTo=function(ev){var p=cam();return p&&ev.x!=null?Math.hypot(ev.x-p.x,ev.z-p.z):(ev.dist==null?3000:ev.dist);};
  A.onSky(function(ev){var id=K.cueFor(ev);if(!id)return;fire(id,ev,distTo(ev),ev.kind==='flash'?(ev.e==null?1:ev.e):1,ev.dur);});
  if(A.onThunder)A.onThunder(function(ev){fire('sfx.sky.thunder',{kind:'thunder',dist:ev.dist},ev.dist,ev.power);});
  // the levels: the hum and the drone follow the sky each frame
  if(A.hook)A.hook(function(){var L=A.skyLevel||{orbs:0,breathe:0};B.level=L;if(!B.enabled||!B.synth||!B.ctx)return;loops(B.ctx);var now=B.ctx.currentTime;
   hum.gain.setTargetAtTime(Math.min(1,L.orbs)*.08,now,.3);drone.gain.setTargetAtTime(Math.min(1,L.breathe)*.1,now,.6);});
  if(A.rec)A.rec('skysound',{cues:K.CUES.map(function(c){return c.id;}),master:B.master,synth:B.synth,note:'the sky\'s light effects heard: cues in KCUE\'s shape at ATMOS.onSky / onThunder, levels from ATMOS.skyLevel; the synth is a stand-in until the clips are chosen'});
  return B;};
})(typeof window!=='undefined'?window:globalThis);
