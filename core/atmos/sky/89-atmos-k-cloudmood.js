// ================================================================= ATMOS — the clouds' mood: the shifting episodes, and the cloud layer's JS twin
// [G data] The Ancient's Valley's smog (the owner, 2026-11-08: "a frequent atmos effect of dark, unnaturally turbulent, coloured,
// or softly glowing cloudiness"; 2026-11-09: "shifting so the glow, turbulence, or colour could all be together or separate; and
// some variations for each"). The shader's four settings (sky/89-atmos-g-sky.js: dark, tint, turbulence, glow, the presets
// file has them) are one look; this file makes them MOVE: a sequence of EPISODES, each a few minutes long, drawn from a hash of
// (seed, episode), in which each of the three effects is on or off on its own (so together, or one alone, or a quiet spell),
// the tint picked from a palette (brown, dull red, sickly green, ash; or by AREA: o.tintAt(x, z) at the eye), the turbulence
// in one of four kinds (violent; ordered; glitched: two more sheets of cloud on their own winds; ripple: rings from an epicentre) and the
// glow in one of three (wandering orbs: two small lights under the cloud; an ethereal breathe over the whole sky, or
// frequent lightning under one patch at a time); the dark follows whenever anything is on. Neighbouring episodes blend over
// the last `blend` of the period. Pure: plain numbers from t (the module clock's seconds), the same on every engine.
//   ATMOS.moodAt(t, o) -> {dark, tint, tintK, turbulence, turbKind, turbOffset [dx, dz], sheetTint, glow, glowKind, glowColour, episode, blend}
//       turbOffset: where this episode's ripple epicentre lies from the eye (the host latches it when the episode changes)
//       o = {seed (1), period (s, 300), blend (0..1 of the period, .3), chance {tint .6, glow .5, turbulence .6}, dark [lo, hi]
//            ([.35, .9]), palette (ATMOS.MOOD_PALETTE), turbKinds, glowKinds, tintAt (x, z) -> [r,g,b] | null, eye [x, z],
//            glowColour (every kind) or glowColours {ethereal, lightning} (default ATMOS.MOOD_GLOW)}
//   ATMOS.moodGlow(t, kind, seed, eye) -> {k (the glow's factor now), locus [x, z, radius, spread], locus2 [x, z, radius, on]}: the
//       glow's motion by kind: 'ethereal' a slow breathe (18 s value noise, .55..1) lighting the whole sky; 'lightning' flashes
//       about every second or two (a 0.7 s slot fires with chance .45), each decaying over ~0.3 s under a patch 2-4.5 km across
//       within 6 km of the eye, a dim floor of .1 between them (flash {id, t0, x, z, e}: the strike the host draws a bolt
//       for, with fx/89-atmos-fx-lightning.js on the page); 'orbs' two small bright lights (300-600 m, k up to 2.4) wandering
//       on value-noise paths within 3 km of the eye (ball lightning, or something flying)
//   ATMOS.moodEvent(t, seed, o) -> null | {id, kind ('pillar' | 'ascent'), dx, dz (from the eye where it began), k (its brightness
//       now), h (the ascending light's height, m), top (m), width (m), t0, dur}: the SKY EVENTS (the owner, 2026-11-09: "a light
//       ascending to the heavens in the distance or a brief distant flashing pillar of light"), one chance in each 60 s slot
//       (o.chance .5), 3-8 km off at a hashed bearing: a pillar flickers out in about a second, an ascent climbs for 14 s
//   ATMOS.skyBeamAt(d, U) -> rgb   the event as the sky draws it (U.event = the record with x, z, ground; the twin of atmSkyBeam)
//   ATMOS.skyCloudAt(d, U) -> {rgb, a}   the JS twin of the chunk's atmSkyClouds (layer 7) with the mood, reading the same
//       noise volume (ATMOS.skyNoiseVolume) by the same trilinear read; U from ATMOS.skyCloudUniforms(preset, look, state, o)
//   ATMOS.skyCloudField(xz, oct, U), ATMOS.skyCloudCover(n, U), ATMOS.skyNoiseAt(p, s), ATMOS.skyFbmAt(p, oct, s)   the pieces
// The host side is ATMOS.cloudMood(S, o) (host/89-atmos-h-skyhost.js): it writes moodAt's values into the preset's clouds each
// frame, and the sky's update reads them as it reads any preset. test-sky.js holds each piece with a negative.
(function(){const A=ATMOS;
 const u32=(x,y,s)=>A.skyHash(x>>>0,y>>>0,s>>>0)/4294967296;
 const ss=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
 const mix=(a,b,t)=>a+(b-a)*t,mix3=(a,b,t)=>[mix(a[0],b[0],t),mix(a[1],b[1],t),mix(a[2],b[2],t)];
 A.MOOD_DEFAULTS={period:300,blend:.3,chance:{tint:.6,glow:.5,turbulence:.6},dark:[.35,.9],turbKinds:['violent','ordered','glitched','ripple'],glowKinds:['ethereal','lightning','orbs']};
 // one episode's draw: eight hashed numbers decide what is on and how much
 const episode=(k,o)=>{const D=A.MOOD_DEFAULTS,seed=(o.seed==null?1:o.seed)+1000,K=(k+(1<<20))>>>0,u=i=>u32(K,i,seed),ch=Object.assign({},D.chance,o.chance||{});
  const pal=o.palette||A.MOOD_PALETTE,tk=o.turbKinds||D.turbKinds,gk=o.glowKinds||D.glowKinds,dk=o.dark||D.dark;
  const tintOn=u(0)<ch.tint,glowOn=u(1)<ch.glow,turbOn=u(2)<ch.turbulence,any=tintOn||glowOn||turbOn;
  return{tint:pal[Math.min(pal.length-1,Math.floor(u(3)*pal.length))],tintK:tintOn?.55+.45*u(4):0,
   turbulence:turbOn?.35+.65*u(5):0,turbKind:tk[Math.min(tk.length-1,Math.floor(u(6)*tk.length))],
   glow:glowOn?.35+.65*u(7):0,glowKind:gk[Math.min(gk.length-1,Math.floor(u(8)*gk.length))],
   dark:any?dk[0]+(dk[1]-dk[0])*u(9):0,turbOffset:[(u(10)-.5)*5000,(u(11)-.5)*5000],sheetTint:u(12)<.5?1:0};};
 A.moodAt=function(t,o){o=o||{};const D=A.MOOD_DEFAULTS,per=o.period==null?D.period:o.period,bl=o.blend==null?D.blend:o.blend;
  const q=t/per,k=Math.floor(q),f=q-k,u=bl>0?ss(1-bl,1,f):0,a=episode(k,o),b=episode(k+1,o);
  // the area's tint, when the page gives one: the place decides the hue, the episode whether and how far
  const eye=o.eye||[0,0],area=o.tintAt?o.tintAt(eye[0],eye[1]):null;if(area){a.tint=area;b.tint=area;}
  const tintK=mix(a.tintK,b.tintK,u),wa=a.tintK*(1-u),wb=b.tintK*u,ws=wa+wb;
  const tint=ws>0?[0,1,2].map(i=>(a.tint[i]*wa+b.tint[i]*wb)/ws):a.tint.slice();
  const late=u>=.5,turbKind=late?b.turbKind:a.turbKind,glowKind=late?b.glowKind:a.glowKind,turbOffset=late?b.turbOffset:a.turbOffset,sheetTint=late?b.sheetTint:a.sheetTint;
  const gc=o.glowColour||(o.glowColours&&o.glowColours[glowKind])||A.MOOD_GLOW[glowKind]||A.MOOD_GLOW.ethereal;
  return{dark:mix(a.dark,b.dark,u),tint,tintK,turbulence:mix(a.turbulence,b.turbulence,u),turbKind,turbOffset,sheetTint,glow:mix(a.glow,b.glow,u),glowKind,glowColour:gc.slice(),episode:k,blend:u};};
 // 1D value noise in time on the hash (smooth, 0..1)
 const vn=(x,s)=>{const i=Math.floor(x),f=x-i,q=f*f*(3-2*f),K=(i+(1<<20))>>>0;return mix(u32(K,0,s),u32(K+1,0,s),q);};
 A.moodGlow=function(t,kind,seed,eye){seed=(seed==null?1:seed)+2000;eye=eye||[0,0];const off=[0,0,1,0];
  if(kind==='orbs'){const orb=s=>[eye[0]+(vn(t/9,s)*2-1)*3000,eye[1]+(vn(t/11,s+1)*2-1)*3000,300+300*vn(t/7,s+2)],a=orb(seed+10),b=orb(seed+20);
   return{k:1.6+.8*vn(t/3,seed+30),locus:[a[0],a[1],a[2],0],locus2:[b[0],b[1],b[2],1]};}
  if(kind!=='lightning')return{k:.55+.45*vn(t/18,seed),locus:[eye[0],eye[1],1,1],locus2:off};
  const slot=.7,j=Math.floor(t/slot);let k=.1,best=null;
  for(let d=0;d<2;d++){const jj=j-d,K=(jj+(1<<20))>>>0,u=i=>u32(K,i,seed);if(u(0)>=.45)continue;
   const t0=jj*slot+slot*.4*u(1),dt=t-t0;if(dt<0)continue;const e=Math.exp(-dt*7)*(.5+.5*u(2));
   if(!best||e>best.e)best={e,id:jj,t0,x:eye[0]+(u(3)-.5)*12000,z:eye[1]+(u(4)-.5)*12000,r:2000+2500*u(5)};k+=e;}
  return{k:Math.min(1,k),locus:best?[best.x,best.z,best.r,.12]:[eye[0],eye[1],1,1],locus2:off,flash:best?{id:best.id,t0:best.t0,x:best.x,z:best.z,e:best.e}:null};};

 A.MOOD_EVENTS={kinds:['pillar','ascent'],chance:.5,slot:60,range:[3000,8000],top:[3600,2600],width:[60,40]};
 A.moodEvent=function(t,seed,o){o=o||{};const E=A.MOOD_EVENTS,kinds=o.kinds||E.kinds,ch=o.chance==null?E.chance:o.chance,slot=E.slot,rg=o.range||E.range;seed=(seed==null?1:seed)+3000;
  for(let d=0;d<2;d++){const j=Math.floor(t/slot)-d,K=(j+(1<<20))>>>0,u=i=>u32(K,i,seed);if(u(0)>=ch)continue;
   const kind=kinds[Math.min(kinds.length-1,Math.floor(u(1)*kinds.length))],pillar=kind==='pillar',dur=pillar?1:14,t0=j*slot+u(2)*(slot-dur-1),dt=t-t0;if(dt<0||dt>dur)continue;
   const az=u(3)*TAU,dist=rg[0]+(rg[1]-rg[0])*u(4),top=E.top[pillar?0:1],width=E.width[pillar?0:1];
   const k=pillar?Math.max(0,Math.min(1,Math.exp(-dt*4)*(.6+.6*Math.cos(dt*31)))):Math.pow(Math.sin(Math.PI*dt/dur),.5),h=pillar?0:top*Math.pow(dt/dur,1.3);
   return{id:j,kind,dx:Math.cos(az)*dist,dz:Math.sin(az)*dist,k,h,top,width,t0,dur};}
  return null;};
 A.skyBeamAt=function(d,U){const ev=U.event;if(!ev||!(ev.k>0))return[0,0,0];const cam=U.cam,rx=ev.x-cam[0],rz=ev.z-cam[2],D=Math.max(Math.hypot(rx,rz),50),hl=Math.hypot(d[0],d[2]);if(hl<1e-4)return[0,0,0];
  const az=Math.acos(Math.max(-1,Math.min(1,(d[0]*rx+d[2]*rz)/(hl*D)))),aw=Math.max(ev.width/D,(U.pixAng==null?.001:U.pixAng)*1.5),g=Math.exp(-az*az/(aw*aw));if(g<1e-3)return[0,0,0];
  const el=Math.atan2(d[1],hl),gy=ev.ground==null?0:ev.ground,FE=Math.atan((gy-cam[1])/D),te=Math.atan((ev.top-cam[1])/D);let v;
  if(ev.kind==='pillar')v=ss(FE,FE+.004,el)*(1-ss(te-.5*(te-FE),te,el));
  else{const ea=Math.atan((ev.h-cam[1])/D),q=(el-ea)/(aw*2.5);v=3*Math.exp(-q*q)+.2*ss(FE,FE+.004,el)*(1-ss(ea-.03,ea,el));}
  const gc=U.glowColour||[1,.55,.2],k=ev.k*g*v*Math.exp(-D/25000);return gc.map(c=>c*k);};
 // ---- the twin of the cloud layer (layer 7) with the mood, on the noise volume the shader reads
 const im=Math.imul,H3=(x,y,z,s)=>{let h=(im(x,1597334677)^im(y,-482951495)^im(z,-2048144777)^im(s,-1640531527))>>>0;h=(h^(h>>>16))>>>0;h=im(h,2146121005)>>>0;h=(h^(h>>>15))>>>0;h=im(h,-2073254261)>>>0;return(h^(h>>>16))>>>0;};
 A.skyU3=(x,y,z,s)=>H3(x>>>0,y>>>0,z>>>0,s>>>0)/4294967296;   // atmSkyU(uvec3(x,y,z), s)
 let VOL=null;const N=64;
 const vol=()=>VOL||(VOL=A.skyNoiseVolume(N));
 // texture(uNoise, uvw): RepeatWrapping, LinearFilter, RGBA8 normalised: texel centres at (i + 0.5) / N
 const tex=(u,v,w,c)=>{const V=vol(),cx=u*N-.5,cy=v*N-.5,cz=w*N-.5,ix=Math.floor(cx),iy=Math.floor(cy),iz=Math.floor(cz),fx=cx-ix,fy=cy-iy,fz=cz-iz;
  const at=(x,y,z)=>V[4*((((x%N)+N)%N)+N*((((y%N)+N)%N)+N*(((z%N)+N)%N)))+c]/255;
  const l=(a,b,t)=>a+(b-a)*t;
  return l(l(l(at(ix,iy,iz),at(ix+1,iy,iz),fx),l(at(ix,iy+1,iz),at(ix+1,iy+1,iz),fx),fy),l(l(at(ix,iy,iz+1),at(ix+1,iy,iz+1),fx),l(at(ix,iy+1,iz+1),at(ix+1,iy+1,iz+1),fx),fy),fz);};
 A.skyNoiseAt=(p,s)=>{const o=[(s*7)%16,(s*11)%16,(s*13)%16].map(v=>v+.37*Math.floor(s/4));return tex((p[0]+o[0])/16,(p[1]+o[1])/16,(p[2]+o[2])/16,s%4)*2-1;};
 A.skyFbmAt=(p,oct,s)=>{let v=0,a=.5,n=0;p=p.slice();for(let i=0;i<6;i++){if(i>=oct)break;v+=a*A.skyNoiseAt(p,s+i);n+=a;p=[p[0]*2.03+1.7,p[1]*2.03+9.2,p[2]*2.03+3.1];a*=.5;}return v/n;};
 const TAU=6.2831853;
 // the glitched kind's extra sheets: [walk (its seed is the index + 1), speed x the wind's, scale x the field's, offset]
 A.MOOD_SHEETS=[[1,1.6,1.3,[7,3]],[2,.7,.8,[2,11]]];
 // the glitched sheets' random walk: six hashed headings, each held 30-90 s (real time: the owner, 2026-11-09), the cycle their
 // sum, the position continuous (the twin of atmMoodWalk); ATMOS.skyMoodWalkLegs(s) the six [heading, seconds]
 A.skyMoodWalkLegs=s=>[0,1,2,3,4,5].map(i=>[A.skyU3(i,s,3,150)*TAU,30+60*A.skyU3(i,s,4,151)]);
 A.skyMoodWalk=(t,s)=>{const legs=A.skyMoodWalkLegs(s),T=legs.reduce((a,l)=>a+l[1],0),c=Math.floor(t/T),tc=t-c*T;let ox=0,oz=0,Dx=0,Dz=0,st=0;
  for(const [h,L] of legs){const dx=Math.cos(h),dz=Math.sin(h);Dx+=dx*L;Dz+=dz*L;const a=Math.max(0,Math.min(L,tc-st));ox+=dx*a;oz+=dz*a;st+=L;}
  return[ox+Dx*c,oz+Dz*c];};
 A.skySheetW=[0,0];   /* after a glitched skyCloudField: how far each sheet shows through at that point (atmSheetW) */
 A.skyCloudField=function(xz,oct,U){let w=[U.wind[0]*U.time*U.drift,U.wind[1]*U.time*U.drift];const tb=U.turbulence||0,kd=A.MOOD_TURB[U.turbKind]||0,pc=U.pace==null?3:U.pace;let p=[xz[0]/U.scale,xz[1]/U.scale];A.skySheetW=[0,0];
  if(tb>0&&kd===0)w=[w[0]*(1+1.5*tb*pc),w[1]*(1+1.5*tb*pc)];p=[p[0]+w[0],p[1]+w[1]];
  let rp=0,ra=0;if(tb>0&&kd===3){const e=U.turbAt||U.cam.slice(0,3).filter((v,i)=>i!==1),dd=[xz[0]-e[0],xz[1]-e[1]],r=Math.hypot(dd[0],dd[1]);rp=(r-U.time*40*pc)*.005236;ra=tb*Math.exp(-r/8000);const m=Math.max(r,1);p=[p[0]+dd[0]/m*(.18*ra*Math.sin(rp)),p[1]+dd[1]/m*(.18*ra*Math.sin(rp))];}
  if(tb>0&&kd===0){const q=[p[0]*1.9+w[0]*1.6*pc,p[1]*1.9+w[1]*1.6*pc,5];p=[p[0]+tb*.35*A.skyNoiseAt(q,120),p[1]+tb*.35*A.skyNoiseAt([q[0]+31,q[1]+17,q[2]],121)];}
  let n=A.skyFbmAt([p[0],p[1],0],oct,100)*.5+.5;
  if(tb>0&&kd===0)n+=tb*.2*A.skyNoiseAt([p[0]*9+w[0]*2.5*pc,p[1]*9+w[1]*2.5*pc,9],122);
  if(ra>0)n+=.08*ra*Math.cos(rp);
  if(tb>0&&kd===1){const pl=[p[0]+w[0]*(pc-1),p[1]+w[1]*(pc-1)],r=.5+.5*Math.cos(pl[1]*TAU+.6*Math.sin(pl[0]*TAU));n=mix(n,.25+.75*r,tb*.85);}
  if(tb>0&&kd===2){const p0=[xz[0]/U.scale,xz[1]/U.scale],ws=Math.hypot(U.wind[0],U.wind[1])*U.drift*pc,sh=A.MOOD_SHEETS.map((S,i)=>{const wk=A.skyMoodWalk(U.time,i+1);
    return A.skyFbmAt([p0[0]*S[2]+wk[0]*ws*S[1]+S[3][0],p0[1]*S[2]+wk[1]*ws*S[1]+S[3][1],0],oct,100)*.5+.5;});
   A.skySheetW=[Math.max(0,Math.min(1,(sh[0]-.05-n)*10))*tb,Math.max(0,Math.min(1,(sh[1]-.05-Math.max(n,sh[0]-.05))*10))*tb];n=mix(n,Math.max(n,Math.max(sh[0],sh[1])-.05),tb);}
  return n;};
 A.skyCloudCover=(n,U)=>ss(1-U.cover,1-U.cover+.22,n);
 const LW=[.3,.55,.15],lum=c=>c[0]*LW[0]+c[1]*LW[1]+c[2]*LW[2];
 const mood=(c,sh,cov,xz,sw,U)=>{const dk=U.dark||0;if(dk>0){const l=lum(c),g=l*(.22+.40*sh);c=mix3(c,[g,g,g],dk);}
  const tk=U.tint?(U.tintK==null?1:U.tintK):0;if(tk>0){const l=lum(c),st=U.sheetTint||0;let T=U.tint;if(st>0){T=mix3(T,U.tint.map(v=>1-v),sw[0]*st);T=mix3(T,[U.tint[1],U.tint[2],U.tint[0]],sw[1]*st);}const lt=Math.max(lum(T),1e-3);c=mix3(c,T.map(v=>v*(l/lt)),tk);}
  if((U.glow||0)>0&&U.night>0){const G=U.glowLocus||[0,0,1,1],dx=xz[0]-G[0],dz=xz[1]-G[1],rr=Math.max(G[2],1),gc=U.glowColour||[1,.55,.2];let loc=mix(Math.exp(-(dx*dx+dz*dz)/(rr*rr)),1,G[3]);
   const Q=U.glowLocus2||[0,0,1,0],qx=xz[0]-Q[0],qz=xz[1]-Q[1],rq=Math.max(Q[2],1);loc+=Q[3]*Math.exp(-(qx*qx+qz*qz)/(rq*rq));
   c=c.map((v,i)=>v+gc[i]*(U.glow*U.night*loc*(.15+.35*cov)));}
  return c;};
 A.skyCloudAt=function(d,U){if(d[1]<.004||U.cover<=0)return{rgb:[0,0,0],a:0};
  const amb=mix3(U.zen,U.hor,.55),cs=Math.max(d[0]*U.sunDir[0]+d[1]*U.sunDir[1]+d[2]*U.sunDir[2],0),sl=U.sunI*(1-(U.eclipse||0)),sunL=U.sunC.map(v=>v*sl);
  const sx=U.sunDir[0]+1e-5,sz=U.sunDir[2]+1e-5,sn=Math.hypot(sx,sz),s2=[sx/sn,sz/sn],sh3=U.shineC.map(v=>v*U.shineI),cam=U.cam,w=[U.wind[0]*U.time*U.drift,U.wind[1]*U.time*U.drift];
  let o=[0,0,0],oa=0;
  if(U.cirrus>0&&(U.cirrusHeight-cam[1])/d[1]>0){const k=(U.cirrusHeight-cam[1])/d[1],p=[(cam[0]+d[0]*k)/U.scale,(cam[2]+d[2]*k)/U.scale],q=[p[0]*.35+w[0]*.5,p[1]*1.6+w[1]*.5,3];
   const n=A.skyFbmAt(q,4,90)*.5+.5,a=ss(.58,.86,n)*U.cirrus*.5*ss(.004,.08,d[1])*Math.exp(-U.cirrusHeight/Math.max(d[1],.004)/160000);
   let c=[0,1,2].map(i=>sunL[i]*.42*(.75+.5*Math.pow(cs,6))+amb[i]*.85+sh3[i]*.25);c=mood(c,1,0,[p[0]*U.scale,p[1]*U.scale],[0,0],U);o=c;oa=a;}
  const hc=U.height-cam[1];
  if(U.cumulus>0&&hc/d[1]>0){const k=hc/d[1],xz=[cam[0]+d[0]*k,cam[2]+d[2]*k],bank=U.bank*Math.exp(-d[1]*9),n=A.skyCloudField(xz,5,U)+bank*.35,sw=A.skySheetW.slice(),cov=A.skyCloudCover(n,U);
   const n2=A.skyCloudField([xz[0]+s2[0]*.18*U.scale,xz[1]+s2[1]*.18*U.scale],5,U)+bank*.35,sh=Math.max(0,Math.min(1,.62+(n-n2)*3.2));
   const dist=Math.abs(hc/Math.max(Math.abs(d[1]),.004)),a=cov*ss(.004,.05,d[1])*Math.exp(-dist/60000);
   let c=[0,1,2].map(i=>sunL[i]*.40*(.35+.65*sh)*(1+.6*Math.pow(cs,10)*(1-cov))+amb[i]*(.75-.25*cov)+sh3[i]*.35*sh);c=mood(c,sh,cov,xz,sw,U);
   const hz=1-Math.exp(-dist/45000);c=mix3(c,U.air,hz);o=mix3(o,c,a);oa=oa+a*(1-oa);}
  return{rgb:o,a:oa};};
 // the uniforms the host sets, from a preset, its look at a state and the page's camera, wind, clock and air colour (o)
 A.skyCloudUniforms=function(P,L,st,o){o=o||{};const C=P.clouds;
  return{cover:L.cover,cumulus:C.cumulus,cirrus:C.cirrus,bank:C.bank,height:C.height,cirrusHeight:C.cirrusHeight,scale:C.scale,drift:C.drift,
   cam:o.cam||[0,0,0],wind:o.wind||[1,.3],time:o.time==null?0:o.time,air:o.air||L.hor,zen:L.zen,hor:L.hor,sunDir:st.sunDir,sunC:L.sunC,sunI:L.sunI,eclipse:st.eclipse,shineC:L.shineC,shineI:L.shineI,night:L.night,
   dark:C.dark==null?0:C.dark,tint:C.tint||null,tintK:C.tint?(C.tintK==null?1:C.tintK):0,turbulence:C.turbulence==null?0:C.turbulence,turbKind:C.turbKind||'violent',turbAt:C.turbAt||null,pace:C.pace==null?3:C.pace,sheetTint:C.sheetTint==null?0:C.sheetTint,
   glow:C.glow==null?0:C.glow,glowColour:C.glowColour||[1,.55,.2],glowLocus:C.glowLocus||[0,0,1,1],glowLocus2:C.glowLocus2||[0,0,1,0]};};
})();
