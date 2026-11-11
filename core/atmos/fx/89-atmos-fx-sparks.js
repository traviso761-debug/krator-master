// ================================================================= ATMOS — fx: sparks from dead machines and arcs on broken lines
// [G data] (the records, ATMOS.sparkEpoch, ATMOS.arcPoint, ATMOS.arcHazard: plain arithmetic on core/rand's integer hash) +
// [web] (ATMOS.sparks and ATMOS.arcs draw them). biomes/ancientsvalley/PLAN.md 15 (the owner, 2026-11-10: the Yards' machines,
// the Terraces' pylon lines). Nothing here keeps state: a shower or a flash is a function of the clock and the record's seed.
//   SHOWER  {at: [x, y, z], dir: [x, y, z] (the way the sparks leave, default up), period (s between showers), burst (s a shower
//           lasts), n (sparks), speed (m/s), spread (0..1: the cone), id}: on its period (phased by its id) a burst of sparks
//           flies ballistically out of the point, white to orange, streaked along its flight, falling; a flash at the point
//   ARC     {a: [x, y, z], b: [x, y, z], period (s between flashes), on (s a flash lasts), jag (m), segs, width (m), id}: a jagged
//           bolt from a to b, re-drawn every flicker (1/30 s) from the hash of (seed, flash, flicker, segment), blue-white with a
//           glow; the strike point b throws a shower each flash
//   ATMOS.sparkRec(o, i, seed) / ATMOS.arcRec(o, i, seed)   filled records (the phase from KRAND.hash(seed, i, salt))
//   ATMOS.sparkEpoch(rec, t) -> {n, u, on}   which shower (or flash) is current at module time t, how far into it (s), and
//                                            whether it is live: the shader's test
//   ATMOS.arcPoint(rec, k, n, t) -> [x, y, z]   point k of the arc's n segments at time t (the shader's twin, integer hash)
//   ATMOS.arcHazard(rec) -> h                core/hazard's record for the arc (kind trap, effect shock, cycle on the arc's own
//                                            period and phase, at the strike point): register it with the arc
//   ATMOS.sparks(list, o) / ATMOS.arcs(list, o) -> handle {mesh, recs, dispose()}   (o: seed, reach, fade)
// Recorded for ATMOS.export() as {type: 'sparks' | 'arcs', recs}. The GLSL hash is lowbias32, the same bits as KRAND's use here
// (ATMOS.sparkHash): every engine draws the same bolt.
(function(){const A=ATMOS;
 A.PRESETS.sparks={salt:0x53504b53,period:6,burst:.9,n:60,speed:7,spread:.55,life:1.1,size:.07,flash:1.4,fade:1/2500,
  hot:[1,.95,.8],cool:[1,.45,.12],arc:{period:9,on:.5,jag:.9,segs:14,width:.12,glow:.9,color:[.75,.85,1],flicker:30}};
 const num=(v,x)=>v==null?x:v,fr=x=>x-Math.floor(x),F=v=>A.glf(v);
 const kr=()=>{const K=typeof KRAND!=='undefined'?KRAND:(typeof globalThis!=='undefined'&&globalThis.KRAND);if(!K)throw new Error('atmos sparks: load core/rand (KRAND) first');return K;};
 // lowbias32 (Wellons): the GLSL twin is atmSpH below; every input an unsigned 32-bit integer
 const h32=x=>{x=x>>>0;x^=x>>>16;x=Math.imul(x,0x7feb352d)>>>0;x^=x>>>15;x=Math.imul(x,0x846ca68b)>>>0;x^=x>>>16;return x>>>0;};
 A.sparkHash=(s,a,b,c)=>h32((s^h32((a>>>0)^h32((b>>>0)^h32(c>>>0))))>>>0);
 const unit=(s,a,b,c)=>A.sparkHash(s,a,b,c)/4294967296;
 const v3=(v,what)=>{if(!v||v.length<3||!v.every(Number.isFinite))throw new Error('atmos sparks: '+what+' must be [x, y, z]');return v.slice(0,3);};
 A.sparkRec=(o,i,seed)=>{const P=A.PRESETS.sparks,K=kr(),s=num(seed,1)>>>0,d=o.dir||[0,1,0],L0=Math.hypot(d[0],d[1],d[2]),L=L0>0?L0:1;
  const R={id:o.id||'spark_'+i,at:v3(o.at,'at'),dir:[d[0]/L,d[1]/L,d[2]/L],period:num(o.period,P.period),burst:num(o.burst,P.burst),n:num(o.n,P.n),speed:num(o.speed,P.speed),
   spread:num(o.spread,P.spread),phase:o.phase==null?K.unit(K.hash(s,i,P.salt)):o.phase,seed:K.hash(s,i,P.salt+1)};
  if(!(R.period>0)||!(R.burst>0)||R.burst>R.period)throw new Error('atmos sparks: burst must be above 0 and within the period');return R;};
 A.arcRec=(o,i,seed)=>{const P=A.PRESETS.sparks.arc,K=kr(),s=num(seed,1)>>>0;
  const R={id:o.id||'arc_'+i,a:v3(o.a,'a'),b:v3(o.b,'b'),period:num(o.period,P.period),on:num(o.on,P.on),jag:num(o.jag,P.jag),segs:num(o.segs,P.segs),width:num(o.width,P.width),
   phase:o.phase==null?K.unit(K.hash(s,i,A.PRESETS.sparks.salt+2)):o.phase,seed:K.hash(s,i,A.PRESETS.sparks.salt+3)};
  if(!(R.period>0)||!(R.on>0)||R.on>R.period)throw new Error('atmos sparks: an arc\'s on must be above 0 and within its period');if(R.segs<2)throw new Error('atmos sparks: segs >= 2');return R;};
 A.sparkEpoch=(R,t)=>{const x=t/R.period+R.phase,n=Math.floor(x),u=(x-n)*R.period;return {n,u,on:u<(R.burst!=null?R.burst:R.on)};};
 // the bolt: point k of n, fixed at the ends, jagged between by the hash of (seed, flash, flicker step, k) across the line
 A.arcPoint=(R,k,n,t)=>{const P=A.PRESETS.sparks.arc,e=A.sparkEpoch(R,t),f=Math.floor(e.u*P.flicker),s=k/n,a=R.a,b=R.b;
  const env=Math.sin(Math.PI*s),j=(c)=>(unit(R.seed,(e.n+1073741824)>>>0,(f*64+k)>>>0,c)-.5)*2*R.jag*env;   /* the shader's epoch: n + 2^30 */
  return[a[0]+(b[0]-a[0])*s+j(1),a[1]+(b[1]-a[1])*s+j(2),a[2]+(b[2]-a[2])*s+j(3)];};
 A.arcHazard=R=>({kind:'trap',effect:'shock',danger:.9,dose:5,trigger:null,falloff:'none',shape:{type:'cyl',r:3,y0:-1,y1:4},
  cycle:{period:R.period,warn:0,ramp:0,on:R.on,after:0,offset:R.phase*R.period},tell:{colour:'#9fc8ff',fx:'spark',sound:'crackle'},seed:R.seed});
 const GLSL_H=['uint atmSpH(uint x){x^=x>>16u;x*=0x7feb352du;x^=x>>15u;x*=0x846ca68bu;x^=x>>16u;return x;}',
  'float atmSpU(uint s,uint a,uint b,uint c){return float(atmSpH(s^atmSpH(a^atmSpH(b^atmSpH(c)))))/4294967296.0;}'].join('\n');
 A.sparkGLSL=()=>GLSL_H;
 const quad=T=>{const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.5,-.5,0,.5,-.5,0,.5,.5,0,-.5,.5,0],3));g.setIndex([0,1,2,0,2,3]);return g;};
 const handle=(name,mesh,g,m,recs,n,cx,cz,o)=>{A.add(mesh);A.noRay(mesh);A.stats[name]=(A.stats[name]==null?0:A.stats[name])+n;const H={mesh,recs,live:true,rec:A.rec(name,{recs:JSON.parse(JSON.stringify(recs)),n})};
  if(o.reach){const cam=A.h.camera;A.hook(()=>{if(H.live)mesh.visible=Math.hypot(cam.position.x-cx,cam.position.z-cz)<o.reach;});}
  H.dispose=()=>{if(!H.live)return;H.live=false;if(mesh.parent)mesh.parent.remove(mesh);g.dispose();m.dispose();A.stats[name]-=n;};return H;};
 // ---- SHOWERS: per spark ipos (the point), pa (dir xyz, seed as float bits are not portable: the spark index), pb (period, burst,
 // phase, speed), pc (spread, seed hi 16, seed lo 16, kind: 0 a spark, 1 the flash)
 A.sparks=(list,o)=>{o=o||{};const T=A.T,P=A.PRESETS.sparks;if(!T)A.err('sparks: call ATMOS.init first');
  const recs=list.map((s,i)=>A.sparkRec(s,i+1,o.seed));if(!recs.length)return null;const ip=[],pa=[],pb=[],pc=[];let cx=0,cz=0;
  recs.forEach(R=>{cx+=R.at[0]/recs.length;cz+=R.at[2]/recs.length;for(let i=0;i<=R.n;i++){ip.push(...R.at);pa.push(R.dir[0],R.dir[1],R.dir[2],i);pb.push(R.period,R.burst,R.phase,R.speed);pc.push(R.spread,R.seed>>>16,R.seed&65535,i===R.n?1:0);}});
  const g=quad(T);[['ipos',ip,3],['pa',pa,4],['pb',pb,4],['pc',pc,4]].forEach(([k,a,s])=>g.setAttribute(k,new T.InstancedBufferAttribute(new Float32Array(a),s)));g.instanceCount=ip.length/3;
  const m=new T.ShaderMaterial({uniforms:{time:A.U.time,px:A.U.px,fadeK:{value:num(o.fade,P.fade)}},transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending,
   vertexShader:['uniform float time;uniform float px;uniform float fadeK;attribute vec3 ipos;attribute vec4 pa;attribute vec4 pb;attribute vec4 pc;',
    'varying vec2 vUv;varying float vA;varying vec3 vC;',GLSL_H,
    'void main(){float x=time/pb.x+pb.z;float ep=floor(x);float u=(x-ep)*pb.x;uint s=uint(pc.y)*65536u+uint(pc.z);uint e=uint(int(ep)+1073741824);uint i=uint(pa.w);',
    ' vec3 p=ipos;float sz='+F(P.size)+';float a=0.0;vec3 c=vec3(0.0);float st=1.0;',
    ' if(pc.w>0.5){a=u<pb.y?(1.0-u/pb.y)*(0.6+0.4*atmSpU(s,e,uint(u*30.0),9u)):0.0;sz='+F(P.flash)+';c='+'vec3('+P.hot.map(F).join(',')+');}',
    ' else{float t0=atmSpU(s,e,i,1u)*pb.y;float tt=u-t0;float life='+F(P.life)+'*(0.5+0.5*atmSpU(s,e,i,2u));',
    '  if(tt>0.0&&tt<life){vec3 r=vec3(atmSpU(s,e,i,3u),atmSpU(s,e,i,4u),atmSpU(s,e,i,5u))*2.0-1.0;vec3 d=normalize(pa.xyz+r*pc.x);float v=pb.w*(0.4+0.8*atmSpU(s,e,i,6u));',
    '   vec3 vel=d*v;p+=vel*tt+vec3(0.0,-4.905*tt*tt,0.0);float k=tt/life;a=1.0-k;c=mix(vec3('+P.hot.map(F).join(',')+'),vec3('+P.cool.map(F).join(',')+'),k);st=1.0+length(vel+vec3(0.0,-9.81*tt,0.0))*0.6;}}',
    ' vec4 mv=modelViewMatrix*vec4(p,1.0);float dd=max(-mv.z,0.5);float ps=clamp(sz*px/dd,1.0,256.0);vA=a*exp(-dd*fadeK);vC=c;vUv=position.xy+0.5;',
    ' gl_Position=projectionMatrix*vec4(mv.xy+position.xy*vec2(ps,ps*min(st,10.0))*dd/px,mv.z,1.0);}'].join('\n'),
   fragmentShader:'varying vec2 vUv;varying float vA;varying vec3 vC;void main(){float d=length(vUv-0.5);float al=(1.0-smoothstep(0.05,0.5,d))*vA;if(al<0.004)discard;gl_FragColor=vec4(vC*al,al);}'});
  const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=6;mesh.name='atmos:sparks';return handle('sparks',mesh,g,m,recs,ip.length/3,cx,cz,o);};
 // ---- ARCS: one instance a segment: a (the arc's a), b, pa (seg k, segs, jag, width), pb (period, on, phase, 0), pc (seed hi, lo)
 A.arcs=(list,o)=>{o=o||{};const T=A.T,P=A.PRESETS.sparks.arc;if(!T)A.err('arcs: call ATMOS.init first');
  const recs=list.map((s,i)=>A.arcRec(s,i+1,o.seed));if(!recs.length)return null;const ia=[],ib=[],pa=[],pb=[],pc=[];let cx=0,cz=0;
  recs.forEach(R=>{cx+=(R.a[0]+R.b[0])/2/recs.length;cz+=(R.a[2]+R.b[2])/2/recs.length;for(let k=0;k<R.segs;k++){ia.push(...R.a);ib.push(...R.b);pa.push(k,R.segs,R.jag,R.width);pb.push(R.period,R.on,R.phase,0);pc.push(R.seed>>>16,R.seed&65535);}});
  const g=new T.InstancedBufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([0,-.5,0,1,-.5,0,1,.5,0,0,.5,0],3));g.setIndex([0,1,2,0,2,3]);
  [['ia',ia,3],['ib',ib,3],['pa',pa,4],['pb',pb,4],['pc',pc,2]].forEach(([k,a,s])=>g.setAttribute(k,new T.InstancedBufferAttribute(new Float32Array(a),s)));g.instanceCount=ia.length/3;
  const m=new T.ShaderMaterial({uniforms:{time:A.U.time,fadeK:{value:num(o.fade,A.PRESETS.sparks.fade)}},transparent:true,depthWrite:false,fog:false,blending:T.AdditiveBlending,side:T.DoubleSide,
   vertexShader:['uniform float time;uniform float fadeK;attribute vec3 ia;attribute vec3 ib;attribute vec4 pa;attribute vec4 pb;attribute vec2 pc;varying float vA;varying float vV;',GLSL_H,
    'vec3 pt(float k,float n,uint s,uint e,uint f){float t=k/n;float env=sin(3.14159265*t);uint kk=f*64u+uint(k);',
    ' return mix(ia,ib,t)+(vec3(atmSpU(s,e,kk,1u),atmSpU(s,e,kk,2u),atmSpU(s,e,kk,3u))-0.5)*2.0*pa.z*env;}',
    'void main(){float x=time/pb.x+pb.z;float ep=floor(x);float u=(x-ep)*pb.x;uint s=uint(pc.x)*65536u+uint(pc.y);uint e=uint(int(ep)+1073741824);uint f=uint(u*'+F(P.flicker)+');',
    ' float live=u<pb.y?1.0:0.0;vec3 p0=pt(pa.x,pa.y,s,e,f);vec3 p1=pt(pa.x+1.0,pa.y,s,e,f);vec3 p=mix(p0,p1,position.x);',
    ' vec4 m0=modelViewMatrix*vec4(p0,1.0);vec4 m1=modelViewMatrix*vec4(p1,1.0);vec2 dir=normalize(m1.xy-m0.xy+vec2(1e-5));vec2 nrm=vec2(-dir.y,dir.x);',
    ' vec4 mv=modelViewMatrix*vec4(p,1.0);float w=pa.w*(1.0+0.15*max(-mv.z,1.0)/30.0)*'+F(1+P.glow*4)+';mv.xy+=nrm*position.y*w;',
    ' vV=position.y*2.0;vA=live*(0.7+0.3*atmSpU(s,e,f,7u))*exp(-max(-mv.z,0.0)*fadeK);gl_Position=projectionMatrix*mv;}'].join('\n'),
   fragmentShader:['varying float vA;varying float vV;void main(){float c=abs(vV);float core=1.0-smoothstep(0.0,0.2,c);float glow=(1.0-c)*(1.0-c)*'+F(P.glow*.5)+';',
    ' float al=(core+glow)*vA;if(al<0.004)discard;gl_FragColor=vec4(mix(vec3('+P.color.map(F).join(',')+'),vec3(1.0),core)*al,al);}'].join('\n')});
  const mesh=new T.Mesh(g,m);mesh.frustumCulled=false;mesh.renderOrder=6;mesh.name='atmos:arcs';const H=handle('arcs',mesh,g,m,recs,ia.length/3,cx,cz,o);
  /* the strike point throws a shower on each flash: the arc's own period, burst and phase */
  H.sparks=A.sparks(recs.map(R=>({at:R.b,period:R.period,burst:R.on,phase:R.phase,n:40,speed:5,id:R.id+'.sparks'})),{seed:o.seed,reach:o.reach,fade:o.fade});
  const d0=H.dispose;H.dispose=()=>{d0();if(H.sparks)H.sparks.dispose();};return H;};
})();
