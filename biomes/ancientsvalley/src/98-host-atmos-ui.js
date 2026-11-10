// ================================================================= HOST - the atmosphere panel: the air's effects at the owner's hand
// [web] The owner, 2026-11-10: "in the viewer for ancients' valley pages, add controls for the atmospheric effects". A foldable panel (core/host
// KHOST.panel, folded or open as the browser last left it) on every station's page, built on the first frame after the host's take (this
// fragment sorts before 99, whose tail closes the script). The weather mode stays the bar's own selector; here, each as a multiplier on what the
// page set (1 = as built):
//   haze        the page's fog density (the sky writes the hour's fog every frame; this scales it after, in the view phase, with the colour of the air)
//   smog: mist  the height fog's pooled mist (89v), smog: band  its broken cloud band at the towers' tops
//   cloud cover the sky's cloud deck (0 to 1, the page's .74 to start)
//   radiation   the glow over the scars (89wr: core/atmos's master strength R.k)
//   distortions the Bend, the lens and the time pocket (89y) on or off
// Each control reads its object when it exists on this page; a station without one shows no control for it. Nothing here is saved or exported:
// it is a viewer's control, not the page's record.
(function(){let built=false;const S={haze:1,mist:1,band:1};let base=null;
 const row=(P,label,min,max,step,val,fmt,on)=>{const d=document.createElement('div');d.style.cssText='display:flex;align-items:center;gap:6px;margin:3px 0';
  const l=document.createElement('span');l.textContent=label;l.style.cssText='flex:0 0 86px';const r=document.createElement('input');r.type='range';r.min=min;r.max=max;r.step=step;r.value=val;r.style.cssText='flex:1;min-width:60px';
  const v=document.createElement('span');v.style.cssText='flex:0 0 34px;text-align:right;font-variant-numeric:tabular-nums';const show=()=>{v.textContent=fmt(+r.value);};show();
  r.addEventListener('input',()=>{on(+r.value);show();});d.appendChild(l);d.appendChild(r);d.appendChild(v);P.appendChild(d);return r;};
 const x=n=>'×'+n.toFixed(2);
 const build=function(){if(built||typeof KHOST==='undefined'||!KHOST.panel)return;built=true;
  const P=KHOST.panel('atmosui','Atmosphere',null,'right:14px;bottom:14px;width:min(300px,calc(100vw - 28px))');
  const h=document.createElement('div');h.textContent='Atmosphere';h.style.cssText='color:#e0c98a;letter-spacing:.06em;text-transform:uppercase;font-size:11px;margin-bottom:4px';P.appendChild(h);
  if(scene.fog&&scene.fog.density!=null)row(P,'haze',0,3,.05,1,x,v=>{S.haze=v;});
  const F=ATMOS.fog;if(F&&F.o){const M=F.o.mist,B=F.o.band;base={mist:M?M.density:0,band:B?B.density:0};
   if(M)row(P,'smog: mist',0,3,.05,1,x,v=>{M.density=base.mist*v;});
   if(B)row(P,'smog: band',0,3,.05,1,x,v=>{B.density=base.band*v;});}
  if(typeof SKY!=='undefined'&&SKY.preset&&SKY.preset.clouds){const C=SKY.preset.clouds;row(P,'cloud cover',0,1,.01,C.cover==null?.5:C.cover,n=>n.toFixed(2),v=>{C.cover=v;});}
  if(typeof AV_RAD!=='undefined'&&AV_RAD&&AV_RAD.R)row(P,'radiation',0,3,.05,AV_RAD.R.k==null?1:AV_RAD.R.k,x,v=>{AV_RAD.R.k=v;AV_RAD.R.off=v<=0;AV_RAD.R.set();});
  if(typeof AV_ANOM!=='undefined'&&AV_ANOM){const d=document.createElement('label');d.style.cssText='display:flex;align-items:center;gap:6px;margin:5px 0 2px;cursor:pointer';
   const c=document.createElement('input');c.type='checkbox';c.checked=!AV_ANOM.off;c.addEventListener('change',()=>{AV_ANOM.off=!c.checked;});
   d.appendChild(c);d.appendChild(document.createTextNode('distortions of space and time'));P.appendChild(d);}
  /* the haze after the sky's update and the colour of the air (99 registers those first), so it scales the hour's fog, never compounds */
  if(KHOST.on)KHOST.on(function atmosUi(){if(scene.fog&&scene.fog.density!=null&&S.haze!==1)scene.fog.density*=S.haze;},'view');
  window.AV_ATMOS_UI={state:S,panel:P};};
 tick(build);})();
