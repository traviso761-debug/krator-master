// ================================================================= ATMOS — fx: particles on a local clock and a local gravity
// [G data] (the records, ATMOS.localFxData and ATMOS.localFxAt: plain arithmetic) + [web] (ATMOS.localFx draws them).
// biomes/ancientsvalley/PLAN-ANOMALIES.md 5 and 14 (the owner, 2026-11-10): the Stilled Ground's frozen things and the Press's
// heavy ones. Every particle reads two numbers AT ITS HOME, once, when the set is built: the time field's RATE there (1 normal,
// 1e-4 stilled, 0 stopped) and the GRAVITY there (1 normal, 3 the Press). Its motion is a pure function of its seeds and
// time x rate, so a particle at the core hangs where it is, one at the rim moves slowly, and nothing shears: the rate of one
// particle never changes (PLAN-ANOMALIES 5, "Time": a phase, not a growing local time). No per-frame CPU work.
// Also the plain thing at rate 1: drips from a crack, a fall from an aqueduct's break (fx/89-atmos-fx-spill.js).
//
//   EMITTERS (records; at [x, y, z] world metres; n particles; every field but kind and at optional):
//     drops   {at, r, h}                rain in a cylinder r wide, falling h: beads hanging at the core, streaks outside
//     motes   {at, r, h}                dust drifting in a cylinder; under heavy gravity it lies flat (height / g^2)
//     steam   {at, rise, spread, life}  puffs rising from a vent; stopped, a frozen column
//     curtain {lip: [[x, z, y], [x, z, y]], dir: [dx, dz], speed, drop}   a falling sheet from a lip (WATER.fall's arc): stopped
//                                       in the air at the core; under 3 g faster, shorter in its run, hitting hard
//     burst   {at, r, period, phase}    a machine mid-explosion: fire to smoke flying out to r; held at `phase` (0..1) where
//                                       time stops, looping every `period` s where it runs
//     birds   {at, r, speed}            birds circling at `at` (r the circle): hanging mid-beat at the core
//     pall    {at, r, h}                the Press's dust that will not rise: wide flat sheets h / g above the ground
//     fume    {at, r, h, drift, life}   a toxic pool's low yellow-green haze, rising h and thinning (fx-sludge's pools)
//     chaff   {at, r, h, drift}         seed heads and chaff on a field, lifted h and carried drift m downwind as a gust front
//                                       passes (core/atmos's atmGust: the sway's and the sheen's own front, fx-gustsheen)
//   ATMOS.localFxData(emitters, o) -> D   the attribute arrays and the per-particle records (pure; o: {rate (x, y, z) ->
//                                       rate, g (x, y, z) -> gravity factor, seed}); deterministic on core/rand's KRAND.hash
//                                       (seed, emitter, particle, salt), never on draw order
//   ATMOS.localFxAt(D, i, t, wind) -> [x, y, z] particle i's position at module time t (the shader's twin: tests and verifies;
//                                       chaff reads wind [x, z], default the preset's base: the page's veers slowly from it)
//   ATMOS.localFx(emitters, o) -> handle  draws them in one call (o as above, plus reach: hidden past reach m from the camera,
//                                       fade: 1/m distance fade); handle {mesh, data, rec, dispose()} frees its geometry
// Recorded for ATMOS.export() as {type: 'localfx', emitters, n, rate: 'field' | 1, g: 'field' | 1}.
(function(){const A=ATMOS;
 A.PRESETS.localfx={salt:0x4c4f4354,fall:9,size:{drops:.05,motes:.06,steam:1.6,curtain:.12,burst:.9,birds:.7,pall:9,fume:6,chaff:.06},
  n:{drops:600,motes:300,steam:60,curtain:900,burst:160,birds:12,pall:40,fume:40,chaff:400},
  color:{drops:[.70,.76,.82],motes:[.66,.60,.50],steam:[.86,.87,.88],curtain:[.78,.84,.90],burst:[1,.62,.22],smoke:[.22,.20,.19],birds:[.07,.07,.08],pall:[.58,.52,.44],fume:[.62,.66,.32],chaff:[.82,.72,.42]},
  alpha:{drops:.55,motes:.5,steam:.32,curtain:.5,burst:.95,birds:1,pall:.22,fume:.2,chaff:.9},fade:1/1500,G:9.81};
 const KIND=['drops','motes','steam','curtain','burst','birds','pall','fume','chaff'];
 const kr=()=>{const K=typeof KRAND!=='undefined'?KRAND:(typeof globalThis!=='undefined'&&globalThis.KRAND);if(!K)throw new Error('atmos localFx: load core/rand (KRAND) first');return K;};
 const num=(v,x)=>v==null?x:v;
 // ---- the data: per particle ipos (home), pp (seed a, seed b, kind, rate), pv (four numbers the kind reads), pg (g, size, three more)
 A.localFxData=(list,o)=>{o=o||{};const P=A.PRESETS.localfx,K=kr(),seed=num(o.seed,1)>>>0,rateAt=o.rate||(()=>1),gAt=o.g||(()=>1);
  const ipos=[],pp=[],pv=[],pg=[];let e=0;
  const U=(ei,i,s)=>K.unit(K.hash(seed,ei,i,P.salt+s));
  for(const em of list){e++;const k=KIND.indexOf(em.kind);if(k<0)throw new Error('atmos localFx: unknown kind '+em.kind);
   const n=num(em.n,P.n[em.kind]),sz=num(em.size,P.size[em.kind]);
   for(let i=0;i<n;i++){const a=U(e,i,1),b=U(e,i,2),c=U(e,i,3),d=U(e,i,4);let x,y,z,v=[0,0,0,0],q=[0,0];
    if(em.kind==='curtain'){const L=em.lip,la=L[0],lb=L[L.length-1];x=la[0]+(lb[0]-la[0])*b;z=la[1]+(lb[1]-la[1])*b;y=la[2]+(lb[2]-la[2])*b;   /* across the lip by b; the phase is a */
     const sp=num(em.speed,1.5),dr=em.dir||[1,0];v=[dr[0]*sp*(.9+.2*c),0,dr[1]*sp*(.9+.2*c),Math.sqrt(2*num(em.drop,20)/P.G)];}
    else if(em.kind==='steam'||em.kind==='burst'){x=em.at[0];y=em.at[1];z=em.at[2];
     if(em.kind==='steam')v=[num(em.spread,4),num(em.rise,14)*(.8+.4*c),0,1/num(em.life,9)];
     else{const th=a*6.2832,ph=Math.acos(1-2*b*.85),R=num(em.r,12)*(.5+.5*c);v=[Math.sin(ph)*Math.cos(th)*R,Math.cos(ph)*R,Math.sin(ph)*Math.sin(th)*R,0];q=[num(em.period,6),num(em.phase,.3)];}}
    else{const r=num(em.r,em.kind==='birds'?40:20),an=a*6.2832,rr=em.kind==='birds'?0:Math.sqrt(b)*r;x=em.at[0]+Math.cos(an)*rr;z=em.at[2]+Math.sin(an)*rr;y=em.at[1];
     if(em.kind==='drops')v=[0,num(em.h,30),0,c];
     else if(em.kind==='motes')v=[2+3*c,num(em.h,6)*d,2+3*b,0];
     else if(em.kind==='birds')v=[r*(.85+.15*b),num(em.speed,9)/r*(c<.5?1:-1),7+3*d,y];
     else if(em.kind==='fume')v=[num(em.drift,3),num(em.h,2.5)*(.5+.5*d),0,1/num(em.life,20)];
     else if(em.kind==='chaff')v=[num(em.h,3)*(.5+.5*d),num(em.drift,7)*(.6+.4*c),0,0];
     else v=[6,num(em.h,1.2)*(.4+.6*d),6,0];}
    /* the field is read where the particle starts: a bird on its circle, not the circle's centre */
    const hx=em.kind==='birds'?x+Math.cos(a*6.2832)*v[0]:x,hz=em.kind==='birds'?z+Math.sin(a*6.2832)*v[0]:z;
    const ra=Math.max(0,+rateAt(hx,y,hz)),g=Math.max(.05,Math.abs(+gAt(hx,y,hz)));
    ipos.push(x,y,z);pp.push(a,b,k,ra);pv.push(v[0],v[1],v[2],v[3]);pg.push(g,sz*(.7+.6*d),q[0],q[1]);}}
  return {n:ipos.length/3,ipos,pp,pv,pg};};
 // ---- the motion (JS twin of the vertex shader below, kind by kind)
 const fr=x=>x-Math.floor(x);
 A.localFxAt=(D,i,t,w)=>{const P=A.PRESETS.localfx,x=D.ipos[3*i],y=D.ipos[3*i+1],z=D.ipos[3*i+2],a=D.pp[4*i],b=D.pp[4*i+1],k=D.pp[4*i+2],r=D.pp[4*i+3],
   v0=D.pv[4*i],v1=D.pv[4*i+1],v2=D.pv[4*i+2],v3=D.pv[4*i+3],g=D.pg[4*i],q0=D.pg[4*i+2],q1=D.pg[4*i+3],tl=t*r;
  if(k===0){const f=fr(v3+tl*P.fall*g/Math.max(v1,.1));return[x,y+v1*(1-f),z];}
  if(k===1)return[x+Math.sin(tl*.3+a*6.2832)*v0,y+v1*(.5+.5*Math.sin(tl*.4+a*9))/(g*g),z+Math.cos(tl*.27+b*6.2832)*v2];
  if(k===2){const ag=fr(a+tl*v3);return[x+(b-.5)*v0*ag,y+ag*v1,z+(fr(b*7.3)-.5)*v0*ag];}
  if(k===3){const tf=v3/Math.sqrt(g),s=fr(a+tl/tf)*tf;return[x+v0*s,y-.5*P.G*g*s*s,z+v2*s];}
  if(k===4){const ag=fr(q1+tl/q0),e=1-Math.pow(1-ag,3);return[x+v0*e,y+v1*e-.5*P.G*g*.04*ag*ag*q0*q0,z+v2*e];}
  if(k===5){const an=a*6.2832+tl*v1;return[x+Math.cos(an)*v0,v3+Math.sin(tl*.5+b*6)*2,z+Math.sin(an)*v0];}
  if(k===7){const ag=fr(a+tl*v3);return[x+Math.sin(tl*.05+a*6.2832)*v0,y+ag*v1,z+Math.cos(tl*.04+b*6.2832)*v0];}
  if(k===8){const W=w||A.PRESETS.wind.base,L0=Math.max(Math.hypot(W[0],W[1]),1e-3),PW=A.PRESETS.wind,s=tl-(x*W[0]+z*W[1])/L0/PW.frontSpeed,gu=PW.gust.reduce((q,g)=>q+g[0]*Math.sin(s*g[1]+g[2]),0),L=A.ss(.2,.9,PW.gustAmp*gu);
   return[x+W[0]/L0*L*v1,y+L*v0*(.6+.4*Math.sin(tl*3+a*20)),z+W[1]/L0*L*v1];}
  return[x+Math.sin(tl*.05+a*6.2832)*3,y+v1/g,z+Math.cos(tl*.04+b*6.2832)*3];};
 const F=v=>A.glf(v);
 A.localFxGLSL=()=>{const P=A.PRESETS.localfx,C=P.color,AL=P.alpha,c3=c=>'vec3('+c.map(F).join(',')+')';
  return {vs:['uniform float time;uniform float px;uniform float light;uniform float fadeK;uniform vec2 wind;uniform float gustAmp;',A.GLSL_WIND||'float atmGust(float t,vec2 xz,vec2 w){return 0.0;}',
   'attribute vec3 ipos;attribute vec4 pp;attribute vec4 pv;attribute vec4 pg;',
   'varying vec2 vUv;varying float vA;varying vec3 vC;varying float vK;varying float vF;',
   'void main(){int k=int(pp.z+0.5);float r=pp.w;float tl=time*r;float g=pg.x;float sz=pg.y;vec3 p=ipos;float st=1.0;float a=1.0;vec3 col=vec3(1.0);vF=0.0;',
   ' if(k==0){float f=fract(pv.w+tl*'+F(P.fall)+'*g/max(pv.y,0.1));p.y=ipos.y+pv.y*(1.0-f);st=1.0+'+F(P.fall)+'*g*r*0.9;col='+c3(C.drops)+';a='+F(AL.drops)+';}',
   ' else if(k==1){p+=vec3(sin(tl*0.3+pp.x*6.2832)*pv.x,0.0,cos(tl*0.27+pp.y*6.2832)*pv.z);p.y=ipos.y+pv.y*(0.5+0.5*sin(tl*0.4+pp.x*9.0))/(g*g);col='+c3(C.motes)+';a='+F(AL.motes)+';}',
   ' else if(k==2){float ag=fract(pp.x+tl*pv.w);p+=vec3((pp.y-0.5)*pv.x*ag,ag*pv.y,(fract(pp.y*7.3)-0.5)*pv.x*ag);sz*=mix(0.4,1.6,ag);col='+c3(C.steam)+';a='+F(AL.steam)+'*smoothstep(0.0,0.1,ag)*(1.0-ag);}',
   ' else if(k==3){float tf=pv.w/sqrt(g);float s=fract(pp.x+tl/tf)*tf;p+=pv.xyz*s+vec3(0.0,-0.5*'+F(P.G)+'*g*s*s,0.0);st=1.0+'+F(P.G)+'*g*s*r*0.35;col='+c3(C.curtain)+';a='+F(AL.curtain)+';}',
   ' else if(k==4){float ag=fract(pg.w+tl/pg.z);float e=1.0-pow(1.0-ag,3.0);p+=pv.xyz*e+vec3(0.0,-0.5*'+F(P.G)+'*g*0.04*ag*ag*pg.z*pg.z,0.0);sz*=mix(0.5,2.2,ag);',
   '  col=mix('+c3(C.burst)+','+c3(C.smoke)+',clamp(smoothstep(0.04,0.45,ag)+pp.y*0.25,0.0,1.0));a='+F(AL.burst)+'*(1.0-ag*ag);vF=1.0-smoothstep(0.04,0.3,ag);}',
   ' else if(k==5){float an=pp.x*6.2832+tl*pv.y;p=vec3(ipos.x+cos(an)*pv.x,pv.w+sin(tl*0.5+pp.y*6.0)*2.0,ipos.z+sin(an)*pv.x);vF=sin(tl*pv.z+pp.y*40.0);col='+c3(C.birds)+';a='+F(AL.birds)+';}',
   ' else if(k==6){p=vec3(ipos.x+sin(tl*0.05+pp.x*6.2832)*3.0,ipos.y+pv.y/g,ipos.z+cos(tl*0.04+pp.y*6.2832)*3.0);col='+c3(C.pall)+';a='+F(AL.pall)+';}',
   ' else if(k==7){float ag=fract(pp.x+tl*pv.w);p=vec3(ipos.x+sin(tl*0.05+pp.x*6.2832)*pv.x,ipos.y+ag*pv.y,ipos.z+cos(tl*0.04+pp.y*6.2832)*pv.x);sz*=mix(0.6,1.4,ag);col='+c3(C.fume)+';a='+F(AL.fume)+'*sin(3.14159*ag);}',
   ' else{float L=smoothstep(0.2,0.9,gustAmp*atmGust(tl,ipos.xz,wind));vec2 wd=wind/max(length(wind),0.001);p=ipos+vec3(wd.x*L*pv.y,L*pv.x*(0.6+0.4*sin(tl*3.0+pp.x*20.0)),wd.y*L*pv.y);col='+c3(C.chaff)+';a='+F(AL.chaff)+'*(0.15+0.85*L);}',
   ' vK=float(k);vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,0.5);float ps=clamp(sz*px/dd,1.0,256.0);',
   ' vA=a*exp(-dd*fadeK);vC=col*(k==4?1.0:0.3+0.7*light);vUv=position.xy+0.5;',
   ' gl_Position=projectionMatrix*vec4(mv.xy+position.xy*vec2(ps,ps*min(st,12.0))*dd/px,mv.z,1.0);}'].join('\n'),
  fs:['varying vec2 vUv;varying float vA;varying vec3 vC;varying float vK;varying float vF;',
   'float seg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h);}',
   'void main(){vec2 q=vUv-0.5;float d=length(q);float al;vec3 c=vC;',
   ' if(vK>4.5&&vK<5.5){vec2 w=vec2(0.42,0.12+vF*0.22);al=1.0-smoothstep(0.03,0.07,min(seg(q,vec2(0.0),w),seg(q,vec2(0.0),vec2(-w.x,w.y))));}',
   ' else if(vK<0.5||(vK>2.5&&vK<3.5)){al=1.0-smoothstep(0.18,0.5,d);c+=vec3(0.15)*(1.0-smoothstep(0.0,0.25,d));}',
   ' else{al=1.0-smoothstep(0.1,0.5,d);if(vK>3.5&&vK<4.5)c*=1.0+vF*2.5;}',
   ' al*=vA;if(al<0.004)discard;gl_FragColor=vec4(c,al);}'].join('\n')};};
 A.localFx=(list,o)=>{o=o||{};const T=A.T,P=A.PRESETS.localfx;if(!T)A.err('localFx: call ATMOS.init first');
  const D=A.localFxData(list,o);if(!D.n)return null;const G=A.localFxGLSL();
  const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));g.setIndex([0,1,2,0,2,3]);
  for(const k of ['ipos','pp','pv','pg'])g.setAttribute(k,new T.InstancedBufferAttribute(new Float32Array(D[k]),k==='ipos'?3:4));g.instanceCount=D.n;
  const m=new T.ShaderMaterial({uniforms:{time:A.U.time,px:A.U.px,light:A.U.light,wind:A.U.wind,gustAmp:A.U.gustAmp,fadeK:{value:num(o.fade,P.fade)}},vertexShader:G.vs,fragmentShader:G.fs,transparent:true,depthWrite:false,fog:false});
  const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=4;mesh.name='atmos:localfx';A.add(mesh);A.noRay(mesh);A.stats.localfx=(A.stats.localfx==null?0:A.stats.localfx)+D.n;
  let cx=0,cz=0;for(let i=0;i<D.n;i++){cx+=D.ipos[3*i];cz+=D.ipos[3*i+2];}cx/=D.n;cz/=D.n;
  const rec=A.rec('localfx',{emitters:JSON.parse(JSON.stringify(list)),n:D.n,rate:o.rate?'field':1,g:o.g?'field':1,centre:[cx,cz],reach:o.reach||null});
  const H={mesh,data:D,rec,live:true};
  if(o.reach){const cam=A.h.camera;A.hook(()=>{if(H.live)mesh.visible=Math.hypot(cam.position.x-cx,cam.position.z-cz)<o.reach;});}
  H.dispose=()=>{if(!H.live)return;H.live=false;if(mesh.parent)mesh.parent.remove(mesh);g.dispose();m.dispose();A.stats.localfx-=D.n;};
  return H;};
})();
