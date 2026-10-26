// ================================================================= WATER - data: hot springs and geysers
// [G data]. Needs 20-core-water.js (WATER) and, for a geyser's particles and its phase jitter, core/rand (KRAND). No THREE, no
// DOM. A build that does not list this file is untouched. Nothing runs at load time but one wrap of WATER.export.
//
//   WATER.spring({key, name, x, z, r, level, temp, mineral, milky, boil, kind, steam, tint})
//        a hot pool: a STILL surface (poly = the disc's rim, so the queries, WATER.at / heightAt and core/export's extent and
//        mesh read it as any pool) that carries S.thermal: temp 0..1 (1 boils), the mineral ramp, milky, boil, steam. The
//        colour runs from the middle out: the deep blue of a boiling vent, turquoise, then, as the pool cools, the mats reach in
//        (green, yellow, orange, rust; as Grand Prismatic). temp sets where the blue ends (m0 = clamp(temp * .78, .08, .86)).
//        mineral picks the ramp ('sinter' silica, 'sulfur', 'iron', 'copper'; WATER.THERMAL.ramps; or a ramp object
//        {deep, blue, green, yel, ora, rust}); tint [r, g, b] multiplies it. S.colourAt(t01) is the twin of the shader's colour
//        (t01 the distance from the middle over the rim, 0..1; without the boil's bubbles, which are the shader's alone).
//        S.thermal.steam is a plan: the puffs a drawing may raise, [{group, x, z, y, n, size, rise, rate, spread, tint}].
//   WATER.geyser({key, name, vents [[x,z],...], top, top2, H, style, period, pre, dur, steam, off, wob, pool, cone, mound,
//        world, drop, ventR})
//        a column. style 'cone' (a narrow jet), 'fountain' (bursts wide) or 'spouter' (never stops). The cycle is the kit's,
//        a pure function of the clock: rest, the PRE (surges a few metres high, closer together toward the column), the
//        COLUMN (up in 2.5 s, falling off over its second half, ending in 3 s), the STEAM (the roaring steam after).
//        S.state(t[, out]) -> {phase, water (0..1 of the column), steam, next (s to the next column), u (the clock within
//        the period)}; S.columnTop(t) the top of the highest drop (top + H * water); S.sprayRadius(t) where its water falls;
//        S.offAt() the clock's offset (a number or a function: a kit moves it to set a geyser off now). off omitted: a hash
//        of (world, key) times the period (never Math.random). The drawing's particles are data too: WATER.geyserParticles(S),
//        each drop's randoms a hash of (world, key, class, vent, index, k): a tile built alone draws what a full build draws.
//   WATER.rampOf, WATER.springColour(S or {temp, milky, mineral, tint}, t01), WATER.springGLSL(ramp), WATER.geyserGLSL()
//        the colour and the cycle as the GLSL chunks the drawing (52b) compiles; the test runs those texts against the twins.
//   WATER.geyserRecords(), WATER.geyserGolden(times)   the plain records (and sampled states) a port replays: GEYSER_STATE.
//
// Both kinds go into WATER.surfaces (a spring as kind 'still' with .thermal; a geyser as kind 'geyser': contains() is false
// and heightAt() null, it wets nothing) and WATER.export() lists them (a `thermal` record; a geyser's whole record).
(function(){const W=WATER,TAU=Math.PI*2;
 const cl=(x,a,b)=>x<a?a:x>b?b:x;
 const ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};   /* edges may run backwards, as the shader's sm() */
 const num=(v,d)=>v==null?d:v;
 const rd=v=>Math.round(v*100)/100;
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';};
 const lerp3=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];

 // ---- the ramp: stops from the boiling middle out, and where each band sits along the cooling run
 const T=W.THERMAL={
  ramps:{
   sinter:{deep:[.02,.14,.4],blue:[.08,.5,.72],green:[.36,.62,.28],yel:[.86,.72,.2],ora:[.82,.4,.1],rust:[.52,.22,.08]},
   sulfur:{deep:[.16,.2,.06],blue:[.5,.55,.12],green:[.7,.7,.16],yel:[.9,.82,.2],ora:[.78,.5,.1],rust:[.45,.3,.08]},
   iron:{deep:[.1,.07,.06],blue:[.5,.2,.1],green:[.62,.3,.12],yel:[.78,.46,.14],ora:[.7,.3,.08],rust:[.42,.16,.06]},
   copper:{deep:[.02,.18,.24],blue:[.06,.58,.56],green:[.2,.7,.42],yel:[.62,.76,.3],ora:[.7,.5,.2],rust:[.4,.26,.12]}},
  bands:{m0:[.78,.08,.86],minU:.05,green:[0,.12],yel:[.18,.38],ora:[.42,.66],rust:[.75,1]},
  milk:{lo:[.16,.55,.66],hi:[.42,.78,.82]},
  foam:[.75,.88,.9]};
 const STOPS=['deep','blue','green','yel','ora','rust'];
 W.rampOf=m=>{if(m==null)return T.ramps.sinter;if(typeof m==='string'){const r=T.ramps[m];if(!r)throw new Error('WATER.rampOf: no mineral ramp "'+m+'"');return r;}
  const r={};for(const k of STOPS){if(!m[k])throw new Error('WATER.rampOf: a ramp needs '+STOPS.join(', '));r[k]=m[k];}return r;};
 // the colour at t01 (0 the middle, 1 the rim) of a pool of temperature temp: the shader's thmColour, in doubles
 W.springColour=(P,t)=>{const th=P.thermal||P,B=T.bands,temp=num(th.temp,.8);let R=W.rampOf(th.ramp||th.mineral);const k=th.tint;
  if(k){const R2={};for(const n of STOPS)R2[n]=[R[n][0]*k[0],R[n][1]*k[1],R[n][2]*k[2]];R=R2;}   /* the tint multiplies every stop (not the milk) */
  const m0=cl(temp*B.m0[0],B.m0[1],B.m0[2]),u=(t-m0)/Math.max(B.minU,1-m0);
  let c=lerp3(R.deep,R.blue,ss(0,m0,t));
  c=lerp3(c,R.green,ss(B.green[0],B.green[1],u));c=lerp3(c,R.yel,ss(B.yel[0],B.yel[1],u));c=lerp3(c,R.ora,ss(B.ora[0],B.ora[1],u));c=lerp3(c,R.rust,ss(B.rust[0],B.rust[1],u));
  if(th.milky)c=lerp3(c,lerp3(T.milk.lo,T.milk.hi,ss(0,1,t)),1);
  return c;};
 // the GLSL chunk: vec3 thmColour(float t, float temp, float milky); needs a float sm(a, b, x) before it (the drawing's)
 W.springGLSL=m=>{const R=W.rampOf(m),B=T.bands,v=c=>'vec3('+c.map(glf).join(',')+')',e=a=>glf(a[0])+','+glf(a[1]);
  return['vec3 thmColour(float t,float temp,float milky){float m0=clamp(temp*'+glf(B.m0[0])+','+glf(B.m0[1])+','+glf(B.m0[2])+');',
   ' vec3 deep='+v(R.deep)+',blue='+v(R.blue)+',green='+v(R.green)+',yel='+v(R.yel)+',ora='+v(R.ora)+',rust='+v(R.rust)+';',
   ' vec3 c=mix(deep,blue,sm(0.0,m0,t));float u=(t-m0)/max('+glf(B.minU)+',1.0-m0);',
   ' c=mix(c,green,sm('+e(B.green)+',u));c=mix(c,yel,sm('+e(B.yel)+',u));c=mix(c,ora,sm('+e(B.ora)+',u));c=mix(c,rust,sm('+e(B.rust)+',u));',
   ' c=mix(c,mix('+v(T.milk.lo)+','+v(T.milk.hi)+',sm(0.0,1.0,t)),milky);return c;}'].join('\n');};

 const reg=S=>{S.id=W.surfaces.length;S.name=S.name||S.kind+' '+S.id;W.surfaces.push(S);return S;};

 // ---- the spring
 W.spring=o=>{const x=o.x,z=o.z,r=o.r,temp=num(o.temp,.8),A=24,Rr=r*1.02,poly=[];
  if(!(r>0))throw new Error('WATER.spring: r > 0');
  for(let a=0;a<A;a++){const an=a/A*TAU,wob=1+.04*Math.sin(an*5+x);poly.push([x+Math.cos(an)*Rr*wob,z+Math.sin(an)*Rr*wob]);}   /* the drawn disc's rim */
  const S=W.still({name:o.name,level:o.level,poly});
  const kind=o.kind||'pool',k=num(o.steam,1),tint=kind==='prismatic'?[.82,.9,.94]:null,plan=[];
  if(k>0){const n=Math.round((4+r*.9)*temp*k);
   if(n>0)plan.push({group:'main',x,z,y:o.level,n,size:2+r*.1,rise:8+r*.35,rate:.07,spread:r*.7,tint});
   if(kind==='prismatic')plan.push({group:'prism',x,z,y:o.level,n:Math.round(r*.6*k),size:2.5+r*.08,rise:6+r*.2,rate:.06,spread:r*1.1,tint:[.95,.82,.62]});
   if(o.milky)plan.push({group:'milky',x,z:z+r*1.6,y:o.level-1,n:Math.round(24*k),size:3.5,rise:9,rate:.05,spread:r*1.4,tint:[.95,.97,.97]});}
  S.key=o.key==null?S.name:o.key;
  S.thermal={x,z,r,level:o.level,temp,kind,mineral:typeof o.mineral==='string'?o.mineral:o.mineral?'custom':'sinter',ramp:o.mineral&&typeof o.mineral!=='string'?W.rampOf(o.mineral):null,
   milky:o.milky?1:0,boil:o.boil==null?(temp>.9?1:0):o.boil,tint:o.tint||null,steam:plan};
  if(!S.thermal.ramp)delete S.thermal.ramp;
  W.rampOf(S.thermal.ramp||S.thermal.mineral);
  S.colourAt=t=>W.springColour(S.thermal,t);
  return S;};
 const thermalRecord=S=>{const q=S.thermal,o={x:rd(q.x),z:rd(q.z),r:q.r,level:rd(q.level),temp:q.temp,kind:q.kind,mineral:q.mineral,milky:q.milky,boil:q.boil,tint:q.tint};
  if(q.ramp)o.ramp=q.ramp;o.key=S.key;o.steam=q.steam.map(p=>({group:p.group,n:p.n,size:rd(p.size),rise:rd(p.rise),rate:p.rate,spread:rd(p.spread)}));return o;};

 // ---- the geyser
 const STYLES={cone:{kind:0,spread:.05},fountain:{kind:1,spread:.42},spouter:{kind:2,spread:.3}};
 W.geyser=o=>{const style=o.style||'cone',st=STYLES[style];if(!st)throw new Error('WATER.geyser: style cone, fountain or spouter');
  const vents=(o.vents||[[o.x,o.z]]).map(v=>[v[0],v[1]]);if(!vents.length||vents.some(v=>!isFinite(v[0])||!isFinite(v[1])))throw new Error('WATER.geyser: vents');
  const key=o.key==null?o.name:o.key,world=num(o.world,0)>>>0;
  const S={kind:'geyser',name:o.name,key,style,styleKind:st.kind,vents,top:num(o.top,0),top2:o.top2==null?null:o.top2,H:o.H,
   period:num(o.period,0),pre:num(o.pre,0),dur:num(o.dur,0),steam:num(o.steam,0),pool:o.pool==null?null:o.pool,cone:o.cone||null,mound:o.mound||null,
   spread:num(o.spread,st.spread),wob:num(o.wob,0),world,seed:0};
  if(!(S.H>0))throw new Error('WATER.geyser: H > 0');
  if(style!=='spouter'&&!(S.period>0))throw new Error('WATER.geyser: a cone or fountain needs a period');
  S.drop=o.drop==null?(style==='cone'?num(S.cone&&S.cone.h,1)+num(S.mound&&S.mound.h,0)*.5:.6):o.drop;   /* the drop's height under the vent's top: it hides in the cone */
  S.ventR=o.ventR==null?(style==='cone'?num(S.cone&&S.cone.r,3)*.3:num(S.pool,2)*.5):o.ventR;
  if(typeof KRAND!=='undefined')S.seed=KRAND.child(world,String(key));
  const offFn=typeof o.off==='function'?o.off:null;
  let off0=o.off;
  if(!offFn&&off0==null){if(typeof KRAND==='undefined')off0=0;else off0=style==='spouter'?0:KRAND.unit(KRAND.hash(S.seed,1))*S.period;}
  S.offAt=offFn||(()=>off0);
  S.contains=()=>false;S.heightAt=()=>null;
  S.state=(t,out)=>{const c=out||{};
   if(style==='spouter'){const w=S.wob;c.phase='spout';c.water=.72+.28*Math.sin(t*3.1+w)*Math.sin(t*1.7+w*2);c.steam=.35;c.next=0;c.u=0;return c;}
   const P=S.period,a=S.pre,b=a+S.dur,e=b+S.steam,u=(((t-S.offAt())%P)+P)%P;c.u=u;
   if(u<a){c.phase='pre';c.water=.16*Math.pow(Math.max(0,Math.sin(u*1.9+Math.sin(u*.7)*2)),6)*ss(0,a*.4,u)*(.5+.5*u/a);c.steam=.15+.2*u/a;}
   else if(u<b){const v=u-a;c.phase='column';c.water=ss(0,2.5,v)*(1-.3*ss(S.dur*.5,S.dur,v))*ss(S.dur,S.dur-3,v);c.steam=1;}
   else if(u<e){c.phase='steam';c.water=0;c.steam=.1+.9*ss(e,b+2,u);}
   else{c.phase='rest';c.water=0;c.steam=.1;}
   c.next=u<a?a-u:P-u+a;return c;};
  S.columnTop=t=>S.top+S.H*S.state(t).water;
  // where the water comes down: a drop leaves at up to 1.45 x the style's spread, a flight of 2 v0 / g: range ~ 4 H w spread
  S.sprayRadius=t=>S.ventR+4*S.H*S.state(t).water*S.spread*1.45;
  S.budget=()=>{const big=cl(S.H/60,.15,1),k=st.kind;return{big,drops:Math.round(k===2?300:k===1?1200+5200*big:600+3200*big),steam:Math.round(k===2?70:180+800*big),mist:k===2?0:Math.round(60+260*big)};};
  return reg(S);};

 // ---- the particles (the drawing's attributes, as plain arrays): position (x, top, z), aS (four randoms and sizes) and aK
 // (0 a drop, 1 a steam puff, 2 a mist)
 W.geyserParticles=S=>{if(typeof KRAND==='undefined')throw new Error('WATER.geyserParticles needs core/rand (KRAND)');
  const B=S.budget(),big=B.big,k=S.styleKind,k2=S.vents.length,sc=S.ventR,P=[],AS=[],AK=[];
  const R=(cls,vi,i,j)=>KRAND.unit(KRAND.hash(S.seed,cls+1,vi,i,j)),rr=(a,b,v)=>a+(b-a)*v;
  S.vents.forEach((v,vi)=>{const top=vi&&S.top2!=null?S.top2:S.top;
   const nW=B.drops/k2,nS=B.steam/k2,nM=B.mist/k2,sz=(k===2?.6:k===1?.6:1)*(.8+.6*big);
   for(let i=0;i<nW;i++){P.push(v[0]+rr(-1,1,R(0,vi,i,4))*sc*.4,top,v[1]+rr(-1,1,R(0,vi,i,5))*sc*.4);AS.push(R(0,vi,i,0),R(0,vi,i,1),R(0,vi,i,2),rr(.8,2,R(0,vi,i,3))*sz);AK.push(0);}
   for(let i=0;i<nS;i++){P.push(v[0]+rr(-1,1,R(1,vi,i,4))*sc,top,v[1]+rr(-1,1,R(1,vi,i,5))*sc);AS.push(R(1,vi,i,0),R(1,vi,i,1),R(1,vi,i,2),rr(3,7,R(1,vi,i,3))*(.6+.8*big));AK.push(1);}
   for(let i=0;i<nM;i++){P.push(v[0],top,v[1]);AS.push(R(2,vi,i,0),R(2,vi,i,1),R(2,vi,i,2),rr(2.5,5,R(2,vi,i,3))*(.6+.6*big));AK.push(2);}});
  return{pos:new Float32Array(P),aS:new Float32Array(AS),aK:new Float32Array(AK),count:AK.length};};

 // ---- the cycle as GLSL (the eruption shader's chunk; the test runs this text against S.state)
 W.geyserGLSL=()=>['uniform vec4 uCyc;uniform float uOff,uKind,uSeed;',
  'float sm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',
  'float wat(float t){if(uKind>1.5)return 0.72+0.28*sin(t*3.1+uSeed)*sin(t*1.7+uSeed*2.0);float P=uCyc.x,a=uCyc.y,b=a+uCyc.z,u=mod(t-uOff,P);',
  ' if(u<a)return 0.16*pow(max(0.0,sin(u*1.9+sin(u*0.7)*2.0)),6.0)*sm(0.0,a*0.4,u)*(0.5+0.5*u/a);',
  ' if(u<b){float v=u-a;return sm(0.0,2.5,v)*(1.0-0.3*sm(uCyc.z*0.5,uCyc.z,v))*sm(uCyc.z,uCyc.z-3.0,v);}return 0.0;}',
  'float stm(float t){if(uKind>1.5)return 0.35;float P=uCyc.x,a=uCyc.y,b=a+uCyc.z,c=b+uCyc.w,u=mod(t-uOff,P);',
  ' if(u<a)return 0.15+0.2*u/a;if(u<b)return 1.0;if(u<c)return 0.1+0.9*sm(c,b+2.0,u);return 0.1;}'].join('\n');

 // ---- plain records, for export and a port
 const geyserRecord=S=>{const o={key:S.key,style:S.style,vents:S.vents.map(v=>v.map(rd)),top:rd(S.top),H:S.H,period:S.period,pre:S.pre,dur:S.dur,steam:S.steam,
   off:rd(S.offAt()),wob:S.wob,spread:S.spread,drop:rd(S.drop),ventR:rd(S.ventR),world:S.world,seed:S.seed,
   cycle:'rest, pre, column, steam on u = (t - off) mod period: GEYSER_STATE in core/water/README.md (twin: S.state)'};
  if(S.top2!=null)o.top2=rd(S.top2);if(S.pool!=null)o.pool=S.pool;if(S.cone)o.cone=S.cone;if(S.mound)o.mound=S.mound;return o;};
 W.geyserRecords=()=>W.surfaces.filter(S=>S.kind==='geyser').map(S=>Object.assign({name:S.name},geyserRecord(S)));
 // sampled states at times (default a spread through each period): the vectors a port tests its replay against
 W.geyserGolden=ts=>W.surfaces.filter(S=>S.kind==='geyser').map(S=>{const T0=ts||(S.period?[0,.13,.31,.5,.77,.97].map(f=>f*S.period).concat([S.period*3.37]):[0,3.7,41.9]),c={};
  return{key:S.key,samples:T0.map(t=>{S.state(t,c);return[t,c.phase,c.water,c.steam,c.next,S.columnTop(t)];})};});

 // ---- core/export's water section lists both (the adapter takes unknown kinds as they are; a spring has its still extent)
 const ex0=W.export;
 W.export=()=>{const X=ex0();X.surfaces.forEach((o,i)=>{const S=W.surfaces[i];if(S.thermal)o.thermal=thermalRecord(S);if(S.kind==='geyser')Object.assign(o,geyserRecord(S));});return X;};
})();
