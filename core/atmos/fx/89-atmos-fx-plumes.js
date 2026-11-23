// ================================================================= ATMOS — fx: industrial plumes (a stack's soot, a cooling tower's cloud, a flare, a vent)
// [G data] (ATMOS.plumeRec, ATMOS.plumeAt, ATMOS.plumeOn: plain arithmetic) + [web] (ATMOS.plumes draws them).
// biomes/ancientsvalley/PLAN.md 15 (the owner, 2026-11-10: the Yards). The smoke of 3-particles is a chimney's: metres high and
// a hundred metres long. These are the works': a plume a kilometre long that is the landmark of the district. One sprite
// cloud a call, each particle's place a pure function of its seeds and the module clock (no per-frame CPU work):
//   stack    soot from a chimney's mouth: dark, thin, rising `rise` m and levelling, bent over downwind for a long trail
//   cooling  a cooling tower's cloud: white, fat and slow, billowing out of the throat, evaporating as it rises
//   flare    a burning pipe's flame at the mouth: flickering, bright, a little black smoke over it
//   vent     steam from a broken main: a short white jet that bends and thins
// A plume may run only part of the time (duty, on a period, its phase from its id): a particle shows only if it left the
// mouth while the plume ran, so a plume starts at the mouth and its last puff rides away when it stops.
//   ATMOS.plumeRec(o, i, seed) -> rec   o: {at: [x, y, z] the mouth, kind, r (the mouth's radius), rise, life (s), duty (0..1),
//                                       period (s), id}; filled from PRESETS.plumes[kind]; the phase from KRAND.hash(seed, i, salt)
//   ATMOS.plumeOn(rec, t) -> bool        is the plume running at module time t (the shader's test, for a page or a hazard)
//   ATMOS.plumeData(recs) -> D           the attribute arrays (pure)
//   ATMOS.plumeAt(D, i, t, wind) -> [x, y, z, a]   particle i at time t under wind [x, z] (m/s): the shader's twin (a: shown)
//   ATMOS.plumes(list, o) -> handle      draws them (o: seed, reach (m; hidden past it), fade (1/m)); handle {mesh, recs, dispose()}
// Recorded for ATMOS.export() as {type: 'plumes', recs}.
(function(){const A=ATMOS;
 A.PRESETS.plumes={salt:0x504c554d,fade:1/9000,
  stack:  {n:110,r:2,  rise:60, life:70, spread:.55,size:[4,40], drift:1.0,color:[.17,.16,.15],alpha:.55,duty:1,period:300},
  cooling:{n:150,r:30, rise:140,life:60, spread:.35,size:[28,90],drift:.55,color:[.93,.93,.92],alpha:.6, duty:1,period:600},
  flare:  {n:60, r:.8, rise:12, life:3,  spread:.4, size:[2,7],  drift:.4, color:[1,.58,.18], alpha:.9, duty:1,period:40},
  vent:   {n:60, r:.6, rise:18, life:8,  spread:.5, size:[1.5,10],drift:.8,color:[.88,.88,.88],alpha:.5, duty:1,period:120}};
 const KINDS=['stack','cooling','flare','vent'],num=(v,x)=>v==null?x:v,fr=x=>x-Math.floor(x);
 const kr=()=>{const K=typeof KRAND!=='undefined'?KRAND:(typeof globalThis!=='undefined'&&globalThis.KRAND);if(!K)throw new Error('atmos plumes: load core/rand (KRAND) first');return K;};
 A.plumeRec=(o,i,seed)=>{const k=KINDS.indexOf(o.kind);if(k<0)throw new Error('atmos plumes: unknown kind '+o.kind);if(!o.at||o.at.length<3)throw new Error('atmos plumes: at [x, y, z]');
  const P=A.PRESETS.plumes[o.kind],K=kr(),s=num(seed,1)>>>0,duty=num(o.duty,P.duty);if(!(duty>0&&duty<=1))throw new Error('atmos plumes: duty is in (0, 1]');
  return {id:o.id||'plume_'+i,kind:o.kind,k,at:o.at.slice(0,3),r:num(o.r,P.r),rise:num(o.rise,P.rise),life:num(o.life,P.life),duty,period:num(o.period,P.period),
   phase:o.phase==null?K.unit(K.hash(s,i,A.PRESETS.plumes.salt)):o.phase,seed:K.hash(s,i,A.PRESETS.plumes.salt+1)};};
 A.plumeOn=(R,t)=>R.duty>=1||fr(t/R.period+R.phase)<R.duty;
 A.plumeData=recs=>{const K=kr(),ipos=[],pp=[],pq=[],pr=[];
  recs.forEach(R=>{const P=A.PRESETS.plumes[R.kind],n=num(R.n,P.n);
   for(let i=0;i<n;i++){const u=j=>K.unit(K.hash(R.seed,i,j));ipos.push(R.at[0],R.at[1],R.at[2]);
    pp.push(u(1),u(2),R.k,R.duty);pq.push(1/R.life,R.rise,R.r,P.spread);pr.push(R.period,R.phase,P.drift,u(3));}});
  return {n:ipos.length/3,ipos,pp,pq,pr};};
 // the motion: age 0..1 since the particle left the mouth; it rises toward `rise` and levels (1 - e^-3age), spreads, drifts
 A.plumeAt=(D,i,t,w)=>{const x=D.ipos[3*i],y=D.ipos[3*i+1],z=D.ipos[3*i+2],a=D.pp[4*i],b=D.pp[4*i+1],k=D.pp[4*i+2],duty=D.pp[4*i+3],
   rate=D.pq[4*i],rise=D.pq[4*i+1],r=D.pq[4*i+2],sp=D.pq[4*i+3],per=D.pr[4*i],ph=D.pr[4*i+1],dr=D.pr[4*i+2],c=D.pr[4*i+3];
  const age=fr(t*rate+a),born=t-age/rate,on=duty>=1||fr(born/per+ph)<duty,life=1/rate,lv=1-Math.exp(-3*age);
  const spr=r+sp*rise*age,an=b*6.2832,rad=Math.sqrt(c)*spr;w=w||[0,0];
  return[x+Math.cos(an)*rad+w[0]*age*life*dr,y+rise*lv,z+Math.sin(an)*rad+w[1]*age*life*dr,on?1:0];};
 A.plumes=(list,o)=>{o=o||{};const T=A.T,PR=A.PRESETS.plumes;if(!T)A.err('plumes: call ATMOS.init first');
  const recs=list.map((p,i)=>A.plumeRec(p,i+1,o.seed)),D=A.plumeData(recs);if(!D.n)return null;const F=A.glf;
  const SZ=KINDS.map(k=>'vec2('+F(PR[k].size[0])+','+F(PR[k].size[1])+')'),CO=KINDS.map(k=>'vec4('+PR[k].color.map(F).join(',')+','+F(PR[k].alpha)+')');
  const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));g.setIndex([0,1,2,0,2,3]);
  for(const k of ['ipos','pp','pq','pr'])g.setAttribute(k,new T.InstancedBufferAttribute(new Float32Array(D[k]),k==='ipos'?3:4));g.instanceCount=D.n;
  const m=new T.ShaderMaterial({uniforms:{time:A.U.time,px:A.U.px,light:A.U.light,night:A.U.night,wind:A.U.wind,fadeK:{value:num(o.fade,PR.fade)}},
   vertexShader:['uniform float time;uniform float px;uniform float light;uniform float night;uniform vec2 wind;uniform float fadeK;',
    'attribute vec3 ipos;attribute vec4 pp;attribute vec4 pq;attribute vec4 pr;varying vec2 vUv;varying float vA;varying vec3 vC;varying float vK;varying float vS;',
    'void main(){int k=int(pp.z+0.5);vec2 sz='+SZ[0]+';vec4 co='+CO[0]+';',
    ' if(k==1){sz='+SZ[1]+';co='+CO[1]+';}else if(k==2){sz='+SZ[2]+';co='+CO[2]+';}else if(k==3){sz='+SZ[3]+';co='+CO[3]+';}',
    ' float rate=pq.x;float age=fract(time*rate+pp.x);float born=time-age/rate;float on=pp.w>=1.0?1.0:step(fract(born/pr.x+pr.y),pp.w);',
    ' float life=1.0/rate;float lv=1.0-exp(-3.0*age);float spr=pq.z+pq.w*pq.y*age;float an=pp.y*6.2832;float rad=sqrt(pr.w)*spr;',
    ' vec3 p=ipos+vec3(cos(an)*rad+wind.x*age*life*pr.z,pq.y*lv,sin(an)*rad+wind.y*age*life*pr.z);',
    ' float s=mix(sz.x,sz.y,sqrt(age));float a=co.w*smoothstep(0.0,0.06,age)*(1.0-age);vec3 c=co.rgb;',
    ' if(k==1){a*=1.0-smoothstep(0.35,1.0,age);c*=0.55+0.45*light;}',     /* the cooling cloud evaporates as it rises */
    ' else if(k==2){float fl=0.75+0.25*sin(time*23.0+pp.x*40.0);s*=fl;c=mix(c,vec3(0.12,0.1,0.09),smoothstep(0.3,0.6,age));vS=1.0-smoothstep(0.25,0.5,age);}',
    ' else c*=0.35+0.65*light;',
    ' if(k!=2)vS=0.0;vK=float(k);vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,0.5);float ps=clamp(s*px/dd,1.5,512.0);',
    ' vA=a*on*exp(-dd*fadeK);vC=c;vUv=position.xy+0.5;gl_Position=projectionMatrix*vec4(mv.xy+position.xy*ps*dd/px,mv.z,1.0);}'].join('\n'),
   fragmentShader:['varying vec2 vUv;varying float vA;varying vec3 vC;varying float vK;varying float vS;',
    'void main(){float d=length(vUv-0.5);float al=(1.0-smoothstep(0.08,0.5,d))*vA;vec3 c=vC;',
    ' if(vK>0.5&&vK<1.5)al*=0.75+0.25*smoothstep(0.5,0.2,d);',
    ' if(vS>0.0)c+=vec3(0.9,0.5,0.15)*vS*(1.0-smoothstep(0.0,0.35,d));',
    ' if(al<0.004)discard;gl_FragColor=vec4(c,al);}'].join('\n'),transparent:true,depthWrite:false,fog:false});
  const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=5;mesh.name='atmos:plumes';A.add(mesh);A.noRay(mesh);A.stats.plumes=(A.stats.plumes==null?0:A.stats.plumes)+D.n;
  const rec=A.rec('plumes',{recs:JSON.parse(JSON.stringify(recs)),n:D.n});const H={mesh,recs,data:D,rec,live:true};
  if(o.reach){const cam=A.h.camera,cx=recs.reduce((s,r)=>s+r.at[0],0)/recs.length,cz=recs.reduce((s,r)=>s+r.at[2],0)/recs.length;
   A.hook(()=>{if(H.live)mesh.visible=Math.hypot(cam.position.x-cx,cam.position.z-cz)<o.reach;});}
  /* a flare lights its surroundings: the glow registry's light, when the page has it (finish builds it) */
  recs.forEach(R=>{if(R.kind==='flare'&&A.glowAdd)A.glowAdd(R.at[0],R.at[1]+2,R.at[2],[1,.6,.25],R.r*14,-1,30);});
  H.dispose=()=>{if(!H.live)return;H.live=false;if(mesh.parent)mesh.parent.remove(mesh);g.dispose();m.dispose();A.stats.plumes-=D.n;};
  return H;};
})();
