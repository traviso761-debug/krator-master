// ================================================================= HOST - the atmosphere panel: the air's effects at the owner's hand
// [web] The owner, 2026-11-10: "in the viewer for ancients' valley pages, add controls for the atmospheric effects", then "make the atmos controls let
// me select sky color, cloud pattern, trigger environmental effects, etc". A foldable panel (core/host KHOST.panel) on every station's page, built on
// the first frame after the host's take (this fragment sorts before 99, whose tail closes the script). A viewer's control: nothing saved or exported.
//   AIR      haze (the fog's density, scaled in the view phase after the sky writes the hour's fog), the smog's mist and band (89v's height fog),
//            cloud cover, radiation (89wr's master strength), the distortions (89y) on or off: each a multiplier on what the page set
//   WEATHER  every mode the page offers (core/atmos ATMOS.W.MODES: clear, rain, storm, fog, the oily rain ...), auto the page's own
//   SKY      the clouds' mood (core/atmos cloudMood) held by hand, each part on its own, 'auto' giving it back to the shifting episodes: the sky's
//            colour (the mood's palette, or any colour) and how far it tints, the darkness, the cloud pattern (violent, ordered, glitched, ripple)
//            and its strength, the glow (ethereal, lightning, orbs) and its strength. Written into the sky preset's clouds each frame AFTER the
//            mood's own step (an ATMOS hook added later runs later)
//   EFFECTS  a lightning strike (core/atmos fx/89-atmos-fx-lightning.js's bolt, 1.5 to 3 km ahead, with its flash under the cloud), a pillar of
//            light and a light ascending (the mood's sky events, 3 to 6 km ahead, drawn by the sky as its own are), and a reset of the sky
(function(){let built=false;const S={haze:1};let base=null;
 const PAL=[['brown',[.42,.33,.30]],['dull red',[.48,.26,.24]],['sickly green',[.42,.50,.30]],['ash',[.46,.45,.44]],['ghostly purple',[.52,.44,.66]],['jaundice',[.62,.56,.28]],['amber',[.70,.48,.22]],['bruise blue',[.30,.32,.48]]];
 const SK={tint:null,tintK:.8,dark:null,turbKind:null,turb:.7,glowKind:null,glow:.8,event:null,flash:null};
 const css=(e,c)=>{e.style.cssText=c;return e;};
 const head=(P,t)=>{const h=css(document.createElement('div'),'color:#e0c98a;letter-spacing:.06em;text-transform:uppercase;font-size:10.5px;margin:7px 0 2px');h.textContent=t;P.appendChild(h);};
 const line=P=>{const d=css(document.createElement('div'),'display:flex;align-items:center;gap:6px;margin:3px 0');P.appendChild(d);return d;};
 const lab=(d,t)=>{const l=css(document.createElement('span'),'flex:0 0 86px');l.textContent=t;d.appendChild(l);return l;};
 const row=(P,label,min,max,step,val,fmt,on)=>{const d=line(P);lab(d,label);const r=css(document.createElement('input'),'flex:1;min-width:60px');r.type='range';r.min=min;r.max=max;r.step=step;r.value=val;
  const v=css(document.createElement('span'),'flex:0 0 34px;text-align:right;font-variant-numeric:tabular-nums');const show=()=>{v.textContent=fmt(+r.value);};show();r.addEventListener('input',()=>{on(+r.value);show();});d.appendChild(r);d.appendChild(v);return r;};
 const sel=(P,label,opts,val,on)=>{const d=line(P);lab(d,label);const s=css(document.createElement('select'),'flex:1;background:#2a251c;color:#f3ecd8;border:1px solid #5a503c;border-radius:4px;font:inherit;font-size:11.5px');
  opts.forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;s.appendChild(o);});s.value=val;s.addEventListener('change',()=>on(s.value));d.appendChild(s);return s;};
 const btn=(d,t,on)=>{const b=document.createElement('button');b.textContent=t;b.addEventListener('click',on);d.appendChild(b);return b;};
 const x=n=>'×'+n.toFixed(2),f2=n=>n.toFixed(2);
 const lin=c=>{const C=new THREE.Color(c[0],c[1],c[2]);return[C.r,C.g,C.b];};
 const hex2=h=>{const n=parseInt(h.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
 /* where the eye looks, on the ground plan: the n-th effect asked for lands at a spot drawn from core/rand by n */
 let nAsk=0;const ahead=(d0,d1,spread)=>{nAsk++;const r=k=>KRAND.unit(KRAND.hash((STAGE.seed|0)+97,nAsk,k,0)),e=camera.position,dir=new THREE.Vector3();camera.getWorldDirection(dir);let a=Math.atan2(dir.z,dir.x)+(r(1)-.5)*spread,dist=d0+(d1-d0)*r(2);
  return[e.x+Math.cos(a)*dist,e.z+Math.sin(a)*dist,dist];};
 const ground=(x,z)=>ATMOS.ground?ATMOS.ground(x,z):(typeof terrainH==='function'?terrainH(x,z):0);
 /* the sky held by hand: after the mood's step, every frame */
 const skyStep=(t)=>{if(typeof SKY==='undefined'||!SKY.preset||!SKY.preset.clouds)return;const C=SKY.preset.clouds;
  if(SK.tint){C.tint=SK.tint;C.tintK=SK.tintK;}
  if(SK.dark!=null)C.dark=SK.dark;
  if(SK.turbKind){if(SK.turbKind==='none')C.turbulence=0;else{C.turbKind=SK.turbKind;C.turbulence=SK.turb;}}
  if(SK.glowKind){if(SK.glowKind==='none')C.glow=0;else if(ATMOS.moodGlow){const e=camera.position,g=ATMOS.moodGlow(t,SK.glowKind,(STAGE.seed|0)+7,[e.x,e.z]);C.glow=SK.glow*g.k;C.glowLocus=g.locus;C.glowLocus2=g.locus2;
   if(SK.glowKind==='lightning'&&ATMOS.moodBolt){const night=ATMOS.skyUniforms?ATMOS.skyUniforms.uNight.value:1;ATMOS.moodBolt(SKY,g,SK.glow*Math.max(.35,night),t);}}}
  /* a strike's flash under the cloud: a second, fading */
  if(SK.flash){const dt=t-SK.flash.t0;if(dt>1.2)SK.flash=null;else{C.glow=Math.max(C.glow||0,1.6*Math.exp(-dt*3.5));C.glowLocus=[SK.flash.x,SK.flash.z,2600,1];C.glowColour=[.85,.9,1];}}
  /* a sky event: its brightness and height by the mood's own law (ATMOS.moodEvent), drawn where it was asked */
  if(SK.event){const E=SK.event,dt=t-E.t0;if(dt<0||dt>E.dur)SK.event=null;else{const pil=E.kind==='pillar';E.k=pil?Math.max(0,Math.min(1,Math.exp(-dt*4)*(.6+.6*Math.cos(dt*31)))):Math.pow(Math.sin(Math.PI*dt/E.dur),.5);
   E.h=pil?0:E.top*Math.pow(dt/E.dur,1.3);C.event=Object.assign({},E,{top:E.top+E.ground,h:E.h+E.ground});}}};
 const event=kind=>{const M=ATMOS.MOOD_EVENTS||{top:[3600,2600],width:[60,40]},pil=kind==='pillar',p=ahead(3000,6000,.5),t=ATMOS.clock?ATMOS.clock.t:0;
  SK.event={id:'ui'+Math.round(t*1000),kind,x:p[0],z:p[1],ground:ground(p[0],p[1]),dx:0,dz:0,k:0,h:0,top:M.top[pil?0:1],width:M.width[pil?0:1],t0:t,dur:pil?1:14};};
 const strike=()=>{const p=ahead(1500,3000,.6),t=ATMOS.clock?ATMOS.clock.t:0,C=SKY&&SKY.preset&&SKY.preset.clouds,top=C&&C.height?C.height:900;
  if(ATMOS.boltFx)ATMOS.boltFx({x:p[0],z:p[1],top:top+ground(p[0],p[1]),base:ground(p[0],p[1]),dist:p[2],t});SK.flash={x:p[0],z:p[1],t0:t};};
 const build=function(){if(built||typeof KHOST==='undefined'||!KHOST.panel)return;built=true;
  const P=KHOST.panel('atmosui','Atmosphere',null,'right:14px;bottom:14px;width:min(320px,calc(100vw - 28px));max-height:calc(100vh - 220px);overflow:auto');
  head(P,'Air');
  if(scene.fog&&scene.fog.density!=null)row(P,'haze',0,3,.05,1,x,v=>{S.haze=v;});
  const F=ATMOS.fog;if(F&&F.o){const M=F.o.mist,B=F.o.band;base={mist:M?M.density:0,band:B?B.density:0};
   if(M)row(P,'smog: mist',0,3,.05,1,x,v=>{M.density=base.mist*v;});
   if(B)row(P,'smog: band',0,3,.05,1,x,v=>{B.density=base.band*v;});}
  if(typeof SKY!=='undefined'&&SKY.preset&&SKY.preset.clouds){const C=SKY.preset.clouds;row(P,'cloud cover',0,1,.01,C.cover==null?.5:C.cover,f2,v=>{C.cover=v;});}
  if(typeof AV_RAD!=='undefined'&&AV_RAD&&AV_RAD.R)row(P,'radiation',0,3,.05,AV_RAD.R.k==null?1:AV_RAD.R.k,x,v=>{AV_RAD.R.k=v;AV_RAD.R.off=v<=0;AV_RAD.R.set();});
  if(typeof AV_ANOM!=='undefined'&&AV_ANOM){const d=css(document.createElement('label'),'display:flex;align-items:center;gap:6px;margin:5px 0 2px;cursor:pointer');
   const c=document.createElement('input');c.type='checkbox';c.checked=!AV_ANOM.off;c.addEventListener('change',()=>{AV_ANOM.off=!c.checked;});d.appendChild(c);d.appendChild(document.createTextNode('distortions of space and time'));P.appendChild(d);}
  if(ATMOS.W&&ATMOS.W.MODES){head(P,'Weather');sel(P,'mode',ATMOS.W.MODES.map(m=>[m,m]),ATMOS.W.mode||'auto',v=>{ATMOS.W.mode=v;});}
  if(typeof SKY!=='undefined'&&SKY.preset&&SKY.preset.clouds){head(P,'Sky');
   const auto=[['auto','auto (the mood)']];
   const colIn=css(document.createElement('input'),'flex:0 0 34px;height:20px;padding:0;border:none;background:none');colIn.type='color';colIn.value='#b58a5a';
   const s1=sel(P,'colour',auto.concat(PAL.map((p,i)=>[''+i,p[0]]),[['pick','pick a colour']]),'auto',v=>{SK.tint=v==='auto'?null:v==='pick'?lin(hex2(colIn.value)):lin(PAL[+v][1]);});s1.parentNode.appendChild(colIn);
   colIn.addEventListener('input',()=>{s1.value='pick';SK.tint=lin(hex2(colIn.value));});
   row(P,'colour strength',0,1,.01,SK.tintK,f2,v=>{SK.tintK=v;});
   const dk=sel(P,'darkness',[['auto','auto (the mood)'],['set','set']],'auto',v=>{SK.dark=v==='auto'?null:+dr.value;});const dr=row(P,'dark',0,1,.01,.6,f2,v=>{if(dk.value==='set')SK.dark=v;});
   sel(P,'cloud pattern',auto.concat([['none','none: still'],['violent','violent'],['ordered','ordered: cloud streets'],['glitched','glitched sheets'],['ripple','ripple rings']]),'auto',v=>{SK.turbKind=v==='auto'?null:v;});
   row(P,'turbulence',0,1,.01,SK.turb,f2,v=>{SK.turb=v;});
   sel(P,'glow',auto.concat([['none','none'],['ethereal','ethereal: a breathing sky'],['lightning','lightning under the cloud'],['orbs','wandering orbs']]),'auto',v=>{SK.glowKind=v==='auto'?null:v;});
   row(P,'glow strength',0,2,.01,SK.glow,f2,v=>{SK.glow=v;});
   head(P,'Effects');const d=line(P);d.style.flexWrap='wrap';
   btn(d,'lightning strike',strike);btn(d,'pillar of light',()=>event('pillar'));btn(d,'light ascending',()=>event('ascent'));
   btn(d,'sky to auto',()=>{SK.tint=SK.dark=SK.turbKind=SK.glowKind=null;P.querySelectorAll('select').forEach(s=>{if(s.querySelector('option[value="auto"]')&&s!==P.querySelector('select'))s.value='auto';});});
   if(ATMOS.hook)ATMOS.hook(skyStep);}
  /* the haze after the sky's update and the colour of the air (99 registers those first), so it scales the hour's fog, never compounds */
  if(KHOST.on)KHOST.on(function atmosUi(){if(scene.fog&&scene.fog.density!=null&&S.haze!==1)scene.fog.density*=S.haze;},'view');
  window.AV_ATMOS_UI={state:S,sky:SK,panel:P,strike,event};};
 tick(build);})();
