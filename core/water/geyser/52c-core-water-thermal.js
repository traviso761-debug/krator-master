// ================================================================= CORE — water: geothermal surfaces (mud pots, fumaroles, their aprons)  [G data]
// core/water/README.md, "Geothermal surfaces" (2026-11-09): what "Hot springs and geysers" left owed. Mud pots (a grey swelling mud, not
// water), the steam and the run-off of fumaroles, and the sinter, travertine, sulfur, clay and microbial-mat aprons round every vent, for
// godshearth, twins, greatchasm, seouterwall, firebliss, midbasin and neouterwall. Lifted from the Throne's stations (isle
// 85-host-springs.js: the mud pots' bubbles and the steam; vents 86-host-vents.js) onto core/water's pattern (52-core-water-geyser.js): state a
// pure function of the clock, its GLSL written from the same constants and run as text against the twin, every random a KRAND.hash of
// (world, key, class, slot, index), never Math.random and never a draw count, so a tile built alone shows what the full build shows.
// Needs 20-core-water.js (WATER) and core/rand (KRAND); 52-core-water-geyser.js before it for the aprons' ramps (WATER.rampOf). No THREE, no
// DOM. Nothing runs at load time but two wraps (WATER.at, WATER.export); a page that makes none of these is unchanged.
//
//   WATER.mudpot({key, name, x, z, r, level, temp (.8), thick (.5), kind ('pot' | 'cone' | 'field'), slots, swell, cone {r, h}, colour, tint, world})
//        a surface of kind 'mud' (contains: within r of (x, z); WATER.at answers it after a still pool and before a flow, WATER.heightAt its
//        swelling surface; the export lists its whole record). A pot: 3 bubble slots within .62 r; a cone (a mud volcano): 2 slots in the
//        crater within .3 r, the cone {r (2.6 r), h (.9 r)} under it, its foot at level - h; a field: a wide flat, clamp(r^2 / 12, 4, 8) slots
//        over .8 r, smaller bubbles. thick 0..1 slows the bubbles and makes them taller; temp 0..1 quickens them. colour 'grey' | 'ochre' |
//        'white' (WATER.MUD.colours) or {wet, dry}; tint [r, g, b] multiplies it.
//        MUD_STATE (what the shader and a port replay): slot k has a period per_k = (1.4 + 1.2 h) (.6 + .8 thick) / (.55 + .45 temp) and a phase
//        ph_k (h, ph: KRAND of (world, key, class, k)); T = t / per_k + ph_k, cycle c = floor(T), f = T - c. The bubble of cycle c is the
//        entry (c mod NC) of the slot's table (NC = 8 places, each {dx, dz, size, amp} hashed by (world, key, slot, c mod NC)): it swells while
//        f < pop (.86): grow = sm(0, .82, f), radius size (.35 + .65 grow), height amp grow exp(-d^2 / rb^2); it pops at f = pop and a ring runs
//        out over the rest of the cycle: g = (f - pop) / (1 - pop), amp .18 (1 - g) sin((d - 3 size g) TAU / (.7 size)) exp(-d / (2.5 size)).
//        The sum is faded to the rim (sm(1, .75, R / r)) and the whole pot heaves: swell (.5 + .5 sin(TAU t / swellPer + swellPh)) (1 - (R / r)^2).
//        S.surfaceAt(x, z, t) that height over the level; S.heightAt(x, z, t) = level + it; S.state(t) -> {swell, bursts}; S.bursts(t) -> per
//        slot {slot, cycle, x, z, size, amp, f, grow, popped, popAt (this cycle's pop, s), next (s to the next pop)}; S.burstEvents(t0, t1) ->
//        the pops in [t0, t1) as [{t, slot, cycle, x, z, size, amp}] (a page's splat or sound); WATER.mudGLSL() the shader's chunk (mudH(p, t),
//        p metres from the middle); WATER.mudUniforms(S) its uniform values (uMB, uMS, uMW) as plain arrays.
//   WATER.fumarole({key, name, x, z, y, r (1.5), rate (1), period (9 s; 0 steady), base (.35), off, T (95 C), mineral ('sulfur'), ground,
//        runoff (true), runoffLen (60), runoffW (.8), world})
//        a vent of kind 'fumarole' (it wets nothing: contains false, heightAt null). S.state(t) -> {u, puff, steam}: u = ((t - off) mod
//        period) / period, puff = sm(0, .12, u) (1 - sm(.12, .7, u)), steam = rate (base + (1 - base) puff): the steam's puffing (WATER.fumGLSL,
//        fumSteam(t), the same text). off omitted: a hash of (world, key) times the period. y omitted: ground(x, z), else 0.
//        S.runoff (with ground): the condensate's run-off traced downhill from the vent (WATER.downhill: stops in a basin or after runoffLen m):
//        {flow: {name, pts [[x, z, y], ...], width, speed} (arguments ready for WATER.flow), stain: {kind: 'stain', mineral, pts, width, fade},
//        why ('basin' | 'length' | 'stop'), length}; null without ground or with runoff false. WATER.fumaroleParticles(S) -> {pos, aS, count}:
//        the steam as data (aS = phase, rate, size, rise), each random a hash of (world, key, class, index, k).
//   WATER.downhill(ground, x, z, {step (2), len (120), eps (.001), stop (x, z, y) => bool}) -> {pts [[x, z, y], ...], length, why}: the steepest
//        way down among 16 headings (never turning back more than ~100 degrees), what every run-off here follows.
//   WATER.thermalAprons({springs, geysers, fumaroles, mudpots, runoffs, ground, therm, soil (12 C), decay (2), world, name})
//        -> A, a group (in WATER.groups, so the export lists it) of apron records round each source. A source is its surface record or
//        {S, apron, reach, T, step, riser, width} to override; runoffs are extra wet lines [{pts [[x, z(, y)], ...], T (60), width (1.5),
//        mineral}]. The kinds: SINTER (silica: round geysers and springs that boil or run over .85 temp), TRAVERTINE (carbonate: only when a
//        source asks, {S, apron: 'travertine'}), MAT (a spring under .85 that does not boil: its run-off apron is mats), SULFUR (a fumarole's
//        crust, and the stain along its run-off), CLAY (the bleached, acid-altered ground round a mud pot). Each record {id, key, kind, source
//        {kind, key, id}, x, z, r0 (the pool's rim, m), r1 (the apron's reach), T0 (C at the source), down [dx, dz] (with ground: the way down),
//        stretch, ring [[x, z], ...] (32 points: the apron's outline, wobbled by a hash and drawn out downhill), radii, terraces}.
//        A travertine record with ground carries terraces: {name, line, levels, weights, width, riser}, the arguments WATER.terraces (ext/53)
//        takes as they are (a still pool per tread, its levels stepping `step` m (.35) down the ground from the source's rim along the way down,
//        each tread as long as the ground stays above the next step): the page calls WATER.terraces(rec.terraces) itself.
//        The temperature: with therm (a KTHERM field: anything with heatAt(x, z), or a baked raster {x0, z0, cell, nx, nz, T}) the ground's own;
//        without, the hottest source's T0 falling to the soil across its apron (q = 0 at the pool's rim, 1 at the ring: soil + (T0 - soil)
//        share(q), share = (exp(-decay q) - exp(-decay)) / (1 - exp(-decay)): KTHERM's own falloff). T0: a spring 30 + 63 temp (93 C boils, as
//        at Yellowstone's height), a geyser 93, a fumarole its T, a mud pot 30 + 60 temp.
//        A.apronAt(x, z) -> {sinter, travertine, mat, matT, sulfur, clay, wet, T} weights 0..1: each deposit 1 inside its ring fading out from
//        .72 of it; mats grow only where water runs (wet: the springs' and geysers' aprons and every run-off line) and only in their band:
//        mat = wet sm(soil + 6, soil + 14, T) (1 - sm(73, 80, T)); over ~75 C the wet ground is bare white sinter (sinter = max(sinter,
//        wet sm(73, 80, T))). matT = T / 100 (clamped 0..1), the mat's colour key: WATER.matColour(T, mineral) and its GLSL WATER.matGLSL()
//        (vec3 thmMat(float T)) band it as Yellowstone's outflows do, on the geyser ramp's stops (WATER.THERMAL.ramps): bare white over ~75 C,
//        the ramp's yellow at 72 and orange at 60 (the 50 to 70 C cyanobacteria), its green at 48 (under ~50), then brown (the ramp's rust
//        darkened) at 36 and near black at 26 on the cool rim. A page hands KGROUND a layer per weight (A.bake: the weights on nodes as RGBA
//        bytes, a DataTexture its ground shader samples; or per vertex from apronAt). A.bake({box, cell (4), channels (['sinter', 'travertine',
//        'mat', 'matT'])}) -> {x0, z0, cell, nx, nz, channels, data}; WATER.apronFieldAt(F, channel, x, z) reads one back (bilinear).
//        A.thermVents() -> KTHERM vents [{id, kind: 'point', x, z, T, reach}] for KTHERM.create, so the ground's field and the aprons agree.
//        A.export() the plain records.
(function(){
 if(typeof WATER==='undefined'||!WATER.surfaces)throw new Error('52c-core-water-thermal: load core/water/20-core-water.js first');
 const W=WATER;if(W.mudpot)return;   /* loaded twice: a no-op */
 if(typeof KRAND==='undefined')throw new Error('52c-core-water-thermal: load core/rand/08-core-rand.js first (every bubble, puff and apron is a KRAND hash)');
 const KR=KRAND,TAU=Math.PI*2;
 const cl=(x,a,b)=>x<a?a:x>b?b:x,num=(v,d)=>v==null?d:v,rd=v=>Math.round(v*100)/100;
 const ss=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};   /* edges may run backwards, as the shader's thmSm() */
 const glf=v=>{const q=String(+v);return/[.e]/.test(q)?q:q+'.0';},gf=v=>v<0?'('+glf(v)+')':glf(v);
 const fmod=(x,p)=>x-p*Math.floor(x/p);
 const U=(seed,...a)=>KR.unit(KR.hash(seed,...a));
 const lerp3=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
 const reg=S=>{S.id=W.surfaces.length;S.name=S.name||S.kind+' '+S.id;W.surfaces.push(S);return S;};
 const keyOf=(o,kind)=>o.key!=null?o.key:o.name!=null?o.name:kind+' '+W.surfaces.length;

 // ---- MUD POTS
 const MUD=W.MUD={NC:8,MAXS:8,pop:.86,grow:.82,ring:{amp:.18,reach:3,wave:.7,fade:2.5},
  kinds:{pot:{slots:3,spread:.62,size:1},cone:{slots:2,spread:.3,size:1},field:{slots:null,spread:.8,size:.6}},
  colours:{grey:{wet:[.3,.28,.25],dry:[.66,.64,.6]},ochre:{wet:[.36,.27,.17],dry:[.72,.6,.42]},white:{wet:[.52,.5,.47],dry:[.84,.83,.8]}}};
 const colourOf=(c,tint)=>{let C=c==null?MUD.colours.grey:typeof c==='string'?MUD.colours[c]:c;
  if(!C||!C.wet||!C.dry)throw new Error('WATER.mudpot: colour '+Object.keys(MUD.colours).join(', ')+' or {wet, dry}');
  C={wet:C.wet.slice(),dry:C.dry.slice()};if(tint)for(const k of['wet','dry'])C[k]=C[k].map((v,i)=>v*tint[i]);return C;};
 // the height over the level at (px, pz) metres from the middle, time t: the shader's mudH, in doubles (MUD_STATE in the header)
 const mudH=(S,px,pz,t)=>{const R=Math.hypot(px,pz)/S.r;if(R>1)return 0;const P=MUD.pop,G=MUD.grow,Q=MUD.ring;let h=0;
  for(let k=0;k<S.slots.length;k++){const L=S.slots[k],T=t/L.per+L.ph,cyc=Math.floor(T),f=T-cyc,e=L.table[fmod(cyc,MUD.NC)];
   const d=Math.hypot(px-e[0],pz-e[1]),grow=f<P?ss(0,G,f):0,rb=e[2]*(.35+.65*grow);h+=e[3]*grow*Math.exp(-d*d/(rb*rb));
   if(f>=P){const g=(f-P)/(1-P);h+=e[3]*Q.amp*(1-g)*Math.sin((d-g*e[2]*Q.reach)*TAU/(e[2]*Q.wave))*Math.exp(-d/(e[2]*Q.fade));}}
  h*=ss(1,.75,R);h+=S.swell*(.5+.5*Math.sin(t*TAU/S.swellPer+S.swellPh))*(1-R*R);return h;};
 W.mudpot=o=>{const kind=o.kind||'pot',K=MUD.kinds[kind];if(!K)throw new Error('WATER.mudpot: kind pot, cone or field');
  const x=o.x,z=o.z,r=o.r;if(!isFinite(x)||!isFinite(z))throw new Error('WATER.mudpot: x and z');if(!(r>0))throw new Error('WATER.mudpot: r > 0');
  if(o.level==null)throw new Error('WATER.mudpot: level (the mud\'s rest height)');
  const temp=cl(num(o.temp,.8),0,1),thick=cl(num(o.thick,.5),0,1),world=num(o.world,0)>>>0,key=keyOf(o,'mud'),seed=KR.child(world,String(key));
  const n=Math.min(MUD.MAXS,Math.max(1,Math.round(o.slots!=null?o.slots:K.slots!=null?K.slots:cl(Math.round(r*r/12),4,8))));
  const slots=[];for(let k=0;k<n;k++){const per=(1.4+1.2*U(seed,1,k))*(.6+.8*thick)/(.55+.45*temp),ph=U(seed,2,k),table=[];
   for(let c=0;c<MUD.NC;c++){const rad=K.spread*r*Math.sqrt(U(seed,3,k,c)),an=TAU*U(seed,4,k,c),size=Math.min(.45*r,r*(.16+.12*U(seed,5,k,c))*(.7+.6*thick)*K.size);
    table.push([Math.cos(an)*rad,Math.sin(an)*rad,size,size*(.45+.5*thick)*(.75+.5*U(seed,6,k,c))]);}
   slots.push({per,ph,table});}
  const cone=kind==='cone'?{r:o.cone&&o.cone.r!=null?o.cone.r:r*2.6,h:o.cone&&o.cone.h!=null?o.cone.h:r*.9}:null;
  const poly=[];for(let a=0;a<24;a++){const an=a/24*TAU;poly.push([x+Math.cos(an)*r,z+Math.sin(an)*r]);}
  const S={kind:'mud',name:o.name,key,mudKind:kind,x,z,r,level:o.level,temp,thick,world,seed,slots,poly,cone,
   swell:num(o.swell,.04+.03*thick),swellPer:5+6*U(seed,7),swellPh:TAU*U(seed,8),colour:colourOf(o.colour,o.tint)};
  S.contains=(px,pz)=>Math.hypot(px-x,pz-z)<=r;
  S.surfaceAt=(px,pz,t)=>mudH(S,px-x,pz-z,t==null?0:t);
  S.heightAt=(px,pz,t)=>S.level+S.surfaceAt(px,pz,t);
  S.bursts=t=>S.slots.map((L,k)=>{const T=t/L.per+L.ph,cyc=Math.floor(T),f=T-cyc,e=L.table[fmod(cyc,MUD.NC)],pop=f>=MUD.pop,popAt=(cyc+MUD.pop-L.ph)*L.per;
   return{slot:k,cycle:cyc,x:x+e[0],z:z+e[1],size:e[2],amp:e[3],f,grow:pop?0:ss(0,MUD.grow,f),popped:pop,popAt,next:pop?popAt+L.per-t:popAt-t};});
  S.burstEvents=(t0,t1)=>{const out=[];S.slots.forEach((L,k)=>{for(let c=Math.floor(t0/L.per+L.ph-MUD.pop);;c++){const tp=(c+MUD.pop-L.ph)*L.per;if(tp>=t1)break;
    if(tp>=t0){const e=L.table[fmod(c,MUD.NC)];out.push({t:tp,slot:k,cycle:c,x:x+e[0],z:z+e[1],size:e[2],amp:e[3]});}}});
   return out.sort((a,b)=>a.t-b.t||a.slot-b.slot);};
  S.state=t=>({swell:S.swell*(.5+.5*Math.sin(t*TAU/S.swellPer+S.swellPh)),bursts:S.bursts(t)});
  return reg(S);};
 // the uniform values of one pot (the drawing's, and the test's): uMB[slot * NC + c] = (dx, dz, size, amp), uMS[slot] = (per, ph, on, 0),
 // uMW = (swell, swellPer, swellPh, r)
 W.mudUniforms=S=>{const B=[],M=[];for(let k=0;k<MUD.MAXS;k++){const L=S.slots[k];M.push(L?[L.per,L.ph,1,0]:[1,0,0,0]);for(let c=0;c<MUD.NC;c++)B.push(L?L.table[c].slice():[0,0,1,0]);}
  return{uMB:B,uMS:M,uMW:[S.swell,S.swellPer,S.swellPh,S.r]};};
 W.mudGLSL=()=>{const P=MUD.pop,Q=MUD.ring,N=MUD.NC,f=glf;
  return['uniform vec4 uMB['+(MUD.MAXS*N)+'];uniform vec4 uMS['+MUD.MAXS+'];uniform vec4 uMW;',
   'float thmSm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',
   'float mudH(vec2 p,float t){float R=length(p)/uMW.w;if(R>1.0)return 0.0;float h=0.0;',
   ' for(int k=0;k<'+MUD.MAXS+';k++){vec4 L=uMS[k];if(L.z>0.5){float T=t/L.x+L.y;float cyc=floor(T);float f=T-cyc;vec4 e=uMB[k*'+N+'+int(mod(cyc,'+f(N)+'))];',
   '  float d=length(p-e.xy);float grow=f<'+f(P)+'?thmSm(0.0,'+f(MUD.grow)+',f):0.0;float rb=e.z*(0.35+0.65*grow);h+=e.w*grow*exp(-d*d/(rb*rb));',
   '  if(f>='+f(P)+'){float g=(f-'+f(P)+')/'+f(1-P)+';h+=e.w*'+f(Q.amp)+'*(1.0-g)*sin((d-g*e.z*'+f(Q.reach)+')*'+f(TAU)+'/(e.z*'+f(Q.wave)+'))*exp(-d/(e.z*'+f(Q.fade)+'));}}}',
   ' h*=thmSm(1.0,0.75,R);h+=uMW.x*(0.5+0.5*sin(t*'+f(TAU)+'/uMW.y+uMW.z))*(1.0-R*R);return h;}'].join('\n');};
 const mudRecord=S=>({key:S.key,mudKind:S.mudKind,x:S.x,z:S.z,r:S.r,level:S.level,temp:S.temp,thick:S.thick,world:S.world,seed:S.seed,
  slots:S.slots.map(L=>({per:L.per,ph:L.ph,table:L.table.map(e=>e.slice())})),swell:S.swell,swellPer:S.swellPer,swellPh:S.swellPh,cone:S.cone,colour:S.colour,poly:S.poly.map(p=>p.map(rd)),
  law:'MUD_STATE in core/water/geyser/52c-core-water-thermal.js (twin: S.surfaceAt): NC '+MUD.NC+', pop '+MUD.pop+', grow '+MUD.grow+', ring '+JSON.stringify(MUD.ring)});

 // ---- DOWNHILL: the steepest way down, step by step (16 headings; never turning back past ~100 degrees)
 const HEAD=[];for(let k=0;k<16;k++)HEAD.push([Math.cos(k/16*TAU),Math.sin(k/16*TAU)]);
 W.downhill=(ground,x,z,o)=>{o=o||{};if(typeof ground!=='function')throw new Error('WATER.downhill: ground(x, z)');
  const step=num(o.step,2),len=num(o.len,120),eps=num(o.eps,1e-3);let px=x,pz=z,py=ground(x,z),dx0=0,dz0=0,L=0,why='length';const pts=[[px,pz,py]];
  while(L+step<=len+1e-9){let best=null;
   for(const h of HEAD){if((dx0||dz0)&&h[0]*dx0+h[1]*dz0<-.17)continue;const qx=px+h[0]*step,qz=pz+h[1]*step,qy=ground(qx,qz),drop=py-qy;
    if(drop>eps){const sc=drop+.02*step*(h[0]*dx0+h[1]*dz0);if(!best||sc>best.sc)best={sc,qx,qz,qy,h};}}
   if(!best){why='basin';break;}
   px=best.qx;pz=best.qz;py=best.qy;dx0=best.h[0];dz0=best.h[1];L+=step;pts.push([px,pz,py]);
   if(o.stop&&o.stop(px,pz,py)){why='stop';break;}}
  return{pts,length:L,why};};

 // ---- FUMAROLES
 const FUM=W.FUM={puff:[.12,.7]};
 W.fumarole=o=>{const x=o.x,z=o.z;if(!isFinite(x)||!isFinite(z))throw new Error('WATER.fumarole: x and z');
  const key=keyOf(o,'fumarole'),world=num(o.world,0)>>>0,seed=KR.child(world,String(key)),period=num(o.period,9);
  if(!(period>=0))throw new Error('WATER.fumarole: period >= 0 (0 is steady)');
  const ground=typeof o.ground==='function'?o.ground:null;
  const S={kind:'fumarole',name:o.name,key,x,z,y:o.y!=null?o.y:ground?ground(x,z):0,r:num(o.r,1.5),rate:num(o.rate,1),period,base:cl(num(o.base,.35),0,1),
   off:o.off!=null?o.off:period>0?U(seed,1)*period:0,T:num(o.T,95),mineral:o.mineral||'sulfur',world,seed};
  S.contains=()=>false;S.heightAt=()=>null;
  S.state=(t,out)=>{const c=out||{};if(!(S.period>0)){c.u=0;c.puff=1;c.steam=S.rate;return c;}
   const u=fmod(t-S.off,S.period)/S.period,p=ss(0,FUM.puff[0],u)*(1-ss(FUM.puff[0],FUM.puff[1],u));c.u=u;c.puff=p;c.steam=S.rate*(S.base+(1-S.base)*p);return c;};
  S.budget=()=>Math.round(cl(10+18*S.rate*S.r/1.5,6,160));
  S.runoff=null;
  if(ground&&o.runoff!==false){const tr=W.downhill(ground,x,z,{step:num(o.runoffStep,1.5),len:num(o.runoffLen,60)});
   if(tr.pts.length>2){const w=num(o.runoffW,.8),pts=tr.pts.map(p=>[p[0],p[1],p[2]+.03]);
    S.runoff={flow:{name:(o.name||key)+' run-off',pts,width:w,speed:num(o.runoffSpeed,.6)},stain:{kind:'stain',mineral:S.mineral,pts:tr.pts.map(p=>[p[0],p[1]]),width:w*2.2,fade:.6},why:tr.why,length:tr.length};}}
  return reg(S);};
 W.fumGLSL=()=>['uniform vec4 uFum;',
  'float fumSm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',
  'float fumSteam(float t){if(uFum.x<=0.0)return uFum.z;float u=mod(t-uFum.y,uFum.x)/uFum.x;float p=fumSm(0.0,'+glf(FUM.puff[0])+',u)*(1.0-fumSm('+glf(FUM.puff[0])+','+glf(FUM.puff[1])+',u));',
  ' return uFum.z*(uFum.w+(1.0-uFum.w)*p);}'].join('\n');
 W.fumUniform=S=>[S.period,S.off,S.rate,S.base];
 W.fumaroleParticles=S=>{const n=S.budget(),P=[],A=[],R=(i,k)=>U(S.seed,20,i,k);
  for(let i=0;i<n;i++){P.push(S.x+(R(i,0)*2-1)*S.r*.5,S.y,S.z+(R(i,1)*2-1)*S.r*.5);
   A.push(R(i,2),.07*(.8+.4*R(i,3)),(2.4+1.6*S.rate)*(.7+.6*R(i,4)),(14+10*S.rate)*(.7+.6*R(i,5)));}
  return{pos:new Float32Array(P),aS:new Float32Array(A),count:n};};
 const fumRecord=S=>{const o={key:S.key,x:S.x,z:S.z,y:S.y,r:S.r,rate:S.rate,period:S.period,base:S.base,off:S.off,T:S.T,mineral:S.mineral,world:S.world,seed:S.seed,
   law:'u = ((t - off) mod period) / period; puff = sm(0, .12, u) (1 - sm(.12, .7, u)); steam = rate (base + (1 - base) puff); period 0: steam = rate (twin: S.state)'};
  if(S.runoff)o.runoff={flow:S.runoff.flow,stain:S.runoff.stain,why:S.runoff.why,length:S.runoff.length};return o;};

 // ---- the mats' colour by temperature (C): the geyser ramp's stops (52's WATER.THERMAL.ramps), banded as an outflow channel's
 const MATS=W.MATS={bare:[.86,.85,.8],black:[.1,.09,.07],brownK:.55,stops:{bare:80,yel:72,ora:60,green:48,brown:36,black:26},band:[6,14],hot:[73,80]};
 const rampFor=m=>W.rampOf?W.rampOf(m==null?'sinter':m):(()=>{throw new Error('WATER.matColour: load 52-core-water-geyser.js first (the ramps)');})();
 W.matStops=m=>{const R=rampFor(m);return{bare:MATS.bare,yel:R.yel,ora:R.ora,green:R.green,brown:R.rust.map(v=>v*MATS.brownK),black:MATS.black};};
 W.matColour=(T,m)=>{const C=W.matStops(m),B=MATS.stops;let c=C.bare;
  c=lerp3(c,C.yel,ss(B.bare,B.yel,T));c=lerp3(c,C.ora,ss(B.yel,B.ora,T));c=lerp3(c,C.green,ss(B.ora,B.green,T));c=lerp3(c,C.brown,ss(B.green,B.brown,T));c=lerp3(c,C.black,ss(B.brown,B.black,T));return c;};
 W.matGLSL=m=>{const C=W.matStops(m),B=MATS.stops,v=c=>'vec3('+c.map(glf).join(',')+')',f=glf;
  return['float thmMatSm(float a,float b,float x){float t=clamp((x-a)/(b-a),0.0,1.0);return t*t*(3.0-2.0*t);}',
   'vec3 thmMat(float T){vec3 c='+v(C.bare)+';c=mix(c,'+v(C.yel)+',thmMatSm('+f(B.bare)+','+f(B.yel)+',T));c=mix(c,'+v(C.ora)+',thmMatSm('+f(B.yel)+','+f(B.ora)+',T));',
   ' c=mix(c,'+v(C.green)+',thmMatSm('+f(B.ora)+','+f(B.green)+',T));c=mix(c,'+v(C.brown)+',thmMatSm('+f(B.green)+','+f(B.brown)+',T));c=mix(c,'+v(C.black)+',thmMatSm('+f(B.brown)+','+f(B.black)+',T));return c;}'].join('\n');};

 // ---- APRONS
 const share=(q,k)=>{if(q>=1)return 0;if(q<=0)return 1;if(!(k>0))return 1-q;const e=Math.exp(-k);return(Math.exp(-k*q)-e)/(1-e);};
 const bil=(F,A,x,z)=>{const u=cl((x-F.x0)/F.cell,0,F.nx-1),v=cl((z-F.z0)/F.cell,0,F.nz-1),i=Math.min(F.nx-2,Math.floor(u)),j=Math.min(F.nz-2,Math.floor(v)),fu=u-i,fv=v-j,k=j*F.nx+i;
  return(A[k]*(1-fu)+A[k+1]*fu)*(1-fv)+(A[k+F.nx]*(1-fu)+A[k+F.nx+1]*fu)*fv;};
 const segD=(P,x,z)=>{let best=Infinity,s=0,at=0;for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,l=Math.sqrt(l2),u=l2>0?cl(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1):0,
   d=Math.hypot(x-a[0]-dx*u,z-a[1]-dz*u);if(d<best){best=d;at=s+u*l;}s+=l;}return{d:best,s:at,L:s};};
 const NR=32;
 W.thermalAprons=o=>{o=o||{};const soil=num(o.soil,12),decay=num(o.decay,2),world=num(o.world,0)>>>0,ground=typeof o.ground==='function'?o.ground:null,therm=o.therm||null;
  const thermAt=therm?typeof therm.heatAt==='function'?(x,z)=>therm.heatAt(x,z):therm.T&&therm.nx?(x,z)=>bil(therm,therm.T,x,z):null:null;
  if(therm&&!thermAt)throw new Error('WATER.thermalAprons: therm is a KTHERM field (heatAt) or a baked raster {x0, z0, cell, nx, nz, T}');
  const src=[],list=(a,kind)=>(a||[]).forEach(e=>{const S=e&&e.S?e.S:e,opt=e&&e.S?e:{};if(!S)throw new Error('WATER.thermalAprons: an empty '+kind+' entry');src.push({S,opt,kind});});
  list(o.springs,'spring');list(o.geysers,'geyser');list(o.fumaroles,'fumarole');list(o.mudpots,'mudpot');
  const A={kind:'aprons',name:o.name||'thermal aprons',soil,decay,world,aprons:[],runoffs:[],therm:therm?(therm.heatAt?'KTHERM':'raster'):null};
  src.forEach((e,i)=>{const S=e.S,q=e.opt;let x,z,r0,r1,T0,kind,water;
   if(e.kind==='spring'){const th=S.thermal;if(!th)throw new Error('WATER.thermalAprons: a spring needs WATER.spring\'s thermal record');
    x=th.x;z=th.z;r0=th.r;r1=num(q.reach,th.r*(1.6+1.2*th.temp));T0=num(q.T,30+63*th.temp);kind=q.apron||(th.boil||th.temp>=.85?'sinter':'mat');water=true;}
   else if(e.kind==='geyser'){x=S.vents.reduce((a,v)=>a+v[0],0)/S.vents.length;z=S.vents.reduce((a,v)=>a+v[1],0)/S.vents.length;
    r0=S.cone?S.cone.r:num(S.pool,S.ventR*2);r1=num(q.reach,S.mound?S.mound.r*1.25:Math.max(10,S.H*.6));T0=num(q.T,93);kind=q.apron||'sinter';water=true;}
   else if(e.kind==='fumarole'){x=S.x;z=S.z;r0=S.r*.5;r1=num(q.reach,S.r*3.5);T0=num(q.T,S.T);kind=q.apron||'sulfur';water=false;
    if(S.runoff)A.runoffs.push({key:S.key+':runoff',pts:S.runoff.stain.pts,T:num(q.runoffT,60),width:S.runoff.stain.width,mineral:S.mineral});}
   else{x=S.x;z=S.z;r0=S.r;r1=num(q.reach,S.cone?S.cone.r*1.3:S.r*1.9);T0=num(q.T,30+60*S.temp);kind=q.apron||'clay';water=false;}
   if(['sinter','travertine','mat','sulfur','clay'].indexOf(kind)<0)throw new Error('WATER.thermalAprons: apron sinter, travertine, mat, sulfur or clay, not '+kind);
   r1=Math.max(r1,r0*1.05);
   const key=String(S.key==null?S.name:S.key),seed=KR.child(world,key+':'+kind);let down=null,stretch=1,slope=0;
   if(ground){const g0=ground(x,z),e2=Math.max(1,r1*.5),gx=(ground(x+e2,z)-ground(x-e2,z))/(2*e2),gz=(ground(x,z+e2)-ground(x,z-e2))/(2*e2);slope=Math.hypot(gx,gz);void g0;
    if(slope>1e-6){down=[-gx/slope,-gz/slope];stretch=1+cl(slope*4,0,1.2);}}
   let raw=[];for(let k=0;k<NR;k++)raw.push(1+.18*(2*U(seed,k)-1));
   raw=raw.map((v,k)=>(raw[(k+NR-1)%NR]+2*v+raw[(k+1)%NR])/4);
   const radii=raw.map((v,k)=>{const a=k/NR*TAU,c=down?Math.max(0,Math.cos(a)*down[0]+Math.sin(a)*down[1]):0;return r0+(r1-r0)*v*(1+(stretch-1)*c*c);});
   const ring=radii.map((R,k)=>[x+Math.cos(k/NR*TAU)*R,z+Math.sin(k/NR*TAU)*R]);
   const rec={id:'apron:'+i,key:key+':'+kind,kind,source:{kind:e.kind,key,id:S.id},x,z,r0,r1,T0,water,down,slope,stretch,ring,radii,terraces:null};
   if(kind==='travertine'&&ground){const dd=down||[1,0],sx=x+dd[0]*r0,sz=z+dd[1]*r0,tr=W.downhill(ground,sx,sz,{step:1,len:num(q.terraceLen,r1*1.5)});
    if(tr.pts.length>2){const P=tr.pts,y0=P[0][2],stepH=num(q.step,.35),drop=y0-P[P.length-1][2],n=Math.max(2,Math.floor(drop/stepH)+1),arc=[0];
     for(let k=1;k<P.length;k++)arc.push(arc[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));
     const at=[0];for(let k=1;k<n;k++){const lv=y0-k*stepH;let s=arc[arc.length-1];for(let j=0;j<P.length;j++)if(P[j][2]<=lv){s=arc[j];break;}at.push(Math.max(s,at[k-1]+.5));}
     const Lt=arc[arc.length-1],weights=at.map((s,k)=>Math.max(.5,(k+1<n?at[k+1]:Lt)-s));
     rec.terraces={name:key+' travertine terraces',line:P.map(p=>[p[0],p[1]]),levels:at.map((s,k)=>y0-k*stepH),weights,width:num(q.width,Math.max(2,r0)),riser:num(q.riser,.6)};}}
   A.aprons.push(rec);});
  (o.runoffs||[]).forEach((R,i)=>{if(!R.pts||R.pts.length<2)throw new Error('WATER.thermalAprons: a run-off needs two points or more');
   A.runoffs.push({key:R.key==null?'runoff:'+i:R.key,pts:R.pts.map(p=>[p[0],p[1]]),T:num(R.T,60),width:num(R.width,1.5),mineral:R.mineral||null});});
  // the ring's radius at angle a (linear between its 32 points) and q, the point's place across an apron (0 the pool's rim, 1 the ring)
  const ringR=(rec,a)=>{const u=fmod(a,TAU)/TAU*NR,k=Math.floor(u)%NR,f=u-Math.floor(u);return rec.radii[k]+(rec.radii[(k+1)%NR]-rec.radii[k])*f;};
  A.qAt=(rec,x,z)=>{const d=Math.hypot(x-rec.x,z-rec.z);if(d<=rec.r0)return{d,q:0,t:d/ringR(rec,Math.atan2(z-rec.z,x-rec.x))};const R=ringR(rec,Math.atan2(z-rec.z,x-rec.x));return{d,q:(d-rec.r0)/Math.max(1e-6,R-rec.r0),t:d/R};};
  A.tempAt=(x,z)=>{if(thermAt)return thermAt(x,z);let T=soil;
   for(const rec of A.aprons){const Q=A.qAt(rec,x,z);if(Q.q<1)T=Math.max(T,soil+(rec.T0-soil)*share(Q.q,decay));}
   for(const R of A.runoffs){const g=segD(R.pts,x,z);if(g.d<=R.width)T=Math.max(T,soil+(R.T-soil)*share(g.s/Math.max(1e-6,g.L),decay));}
   return T;};
  const edge=t=>1-ss(.72,1,t);
  A.apronAt=(x,z)=>{const o2={sinter:0,travertine:0,mat:0,matT:0,sulfur:0,clay:0,wet:0,T:0};
   for(const rec of A.aprons){const Q=A.qAt(rec,x,z),w=Q.t<1?edge(Q.t):0;if(w>o2[rec.kind]&&rec.kind!=='mat')o2[rec.kind]=w;if(rec.water&&w>o2.wet)o2.wet=w;}
   for(const R of A.runoffs){const g=segD(R.pts,x,z),w=1-ss(R.width*.5,R.width,g.d);if(w>o2.wet)o2.wet=w;if(R.mineral){const k=R.mineral==='iron'?'clay':'sulfur',v=w*(1-.6*g.s/Math.max(1e-6,g.L));if(v>o2[k])o2[k]=v;}}
   const T=A.tempAt(x,z);o2.T=T;
   o2.mat=o2.wet*ss(soil+MATS.band[0],soil+MATS.band[1],T)*(1-ss(MATS.hot[0],MATS.hot[1],T));
   o2.sinter=Math.max(o2.sinter,o2.wet*ss(MATS.hot[0],MATS.hot[1],T));o2.matT=cl(T/100,0,1);return o2;};
  A.bake=b=>{b=b||{};const B=b.box;if(!B)throw new Error('A.bake: box [x0, z0, x1, z1]');const cell=num(b.cell,4),ch=b.channels||['sinter','travertine','mat','matT'];
   if(ch.length>4)throw new Error('A.bake: at most four channels (RGBA)');
   const nx=Math.floor((B[2]-B[0])/cell)+1,nz=Math.floor((B[3]-B[1])/cell)+1,data=new Uint8Array(nx*nz*4);
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const w=A.apronAt(B[0]+i*cell,B[1]+j*cell),k=(j*nx+i)*4;for(let c=0;c<4;c++)data[k+c]=c<ch.length?Math.round(cl(w[ch[c]],0,1)*255):c===3?255:0;}
   return{x0:B[0],z0:B[1],cell,nx,nz,channels:ch.slice(),data};};
  A.thermVents=()=>A.aprons.map(r=>({id:r.key,kind:'point',x:r.x,z:r.z,T:r.T0,reach:r.r1})).concat(A.runoffs.map(R=>({id:R.key,kind:'line',pts:R.pts,T:R.T,reach:R.width*2})));
  A.export=()=>({kind:'aprons',name:A.name,soil,decay,world,therm:A.therm,mats:{stops:MATS.stops,band:MATS.band,hot:MATS.hot},
   aprons:A.aprons.map(r=>Object.assign({},r,{ring:r.ring.map(p=>p.map(rd)),radii:r.radii.map(rd)})),runoffs:A.runoffs.map(R=>Object.assign({},R,{pts:R.pts.map(p=>p.map(rd))}))});
  W.groups.push(A);return A;};
 W.apronFieldAt=(F,ch,x,z)=>{const c=F.channels.indexOf(ch);if(c<0)return 0;const u=cl((x-F.x0)/F.cell,0,F.nx-1),v=cl((z-F.z0)/F.cell,0,F.nz-1),i=Math.min(F.nx-2,Math.floor(u)),j=Math.min(F.nz-2,Math.floor(v)),fu=u-i,fv=v-j,
   g=(a,b)=>F.data[((j+b)*F.nx+i+a)*4+c]/255;return(g(0,0)*(1-fu)+g(1,0)*fu)*(1-fv)+(g(0,1)*(1-fu)+g(1,1)*fu)*fv;};

 // ---- the queries and the export: opt-in wraps (nothing changes without a mud pot or a fumarole)
 const at0=W.at;
 W.at=(x,z,t)=>{const b=at0(x,z,t);if(b&&b.kind!=='flow'&&b.kind!=='open'&&b.kind!=='shore')return b;for(const S of W.surfaces)if(S.kind==='mud'&&S.contains(x,z))return S;return b;};
 const ex0=W.export;
 W.export=()=>{const X=ex0();X.surfaces.forEach((o,i)=>{const S=W.surfaces[i];if(S.kind==='mud')Object.assign(o,mudRecord(S));else if(S.kind==='fumarole')Object.assign(o,fumRecord(S));});return X;};
})();
