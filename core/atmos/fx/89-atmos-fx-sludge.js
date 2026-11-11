// ================================================================= ATMOS — fx: toxic pools and spill ground
// [G data] (the records, ATMOS.spillAt, ATMOS.poolHazard: plain arithmetic) + [web] + [G shader] (the pool's material, the
// spill layer). biomes/ancientsvalley/PLAN.md 15 (the owner, 2026-11-10: the Yards' spill grounds and toxic pools, PLAN.md 4's
// dead ground). The noise is an integer hash (lowbias32, as fx-acid's and the cloud deck's), never sin.
//   A POOL  {at: [x, y, z] (y the surface), r, id, toxic (0..1, default 1)}: a sump of the works' leavings. Its surface
//           (ATMOS.sludgeMaterial on any flat mesh at y: a disc, the page's own outline): murky olive-brown, rafts of
//           yellow-green foam that drift and join and part, an oily sheen in thin-film bands, slow bubbles that swell and pop.
//           ATMOS.poolHazard(rec) -> core/hazard's record (kind acid, the pool's footprint): register it with the pool
//   A SPILL {at: [x, z], r, kind: 'oil' | 'wet', k (0..1, how fresh), id}: a stain on the ground. ATMOS.spillOn(material,
//           spills) adds them to a ground material as a KHOOK layer (at most PRESETS.sludge.max a material): an oil spill is
//           black and glossy with a crusted rim and a bleached fringe where nothing grows; a wet stain (an aqueduct's spill
//           ground) only darkens and shines. ATMOS.spillAt(spills, x, z) -> 0..1 how much of a stain is here (the CPU's
//           test: a page masks its flora with it, PLAN.md 4's `scar`)
//   ATMOS.sludgeRec(o, i, seed) / ATMOS.spillRec ... filled records; ATMOS.sludgeGLSL() the pool's chunk
// Recorded for ATMOS.export() as {type: 'sludge', pools} and {type: 'spills', spills}. Godot: the same chunks as .gdshaderinc.
(function(){const A=ATMOS;
 A.PRESETS.sludge={salt:0x534c5547,max:16,base:[.16,.17,.09],foam:[.62,.64,.40],deep:[.07,.08,.04],foamCell:2.6,foamDrift:.05,bubble:.6,
  oil:[.035,.033,.03],crust:[.78,.74,.56],fringe:.35,edge:.18};
 const num=(v,x)=>v==null?x:v,F=v=>A.glf(v),c3=c=>'vec3('+c.map(F).join(',')+')';
 const kr=()=>{const K=typeof KRAND!=='undefined'?KRAND:(typeof globalThis!=='undefined'&&globalThis.KRAND);if(!K)throw new Error('atmos sludge: load core/rand (KRAND) first');return K;};
 A.sludgeRec=(o,i,seed)=>{if(!o.at||o.at.length<3)throw new Error('atmos sludge: a pool needs at [x, y, z]');const r=num(o.r,8);if(!(r>0))throw new Error('atmos sludge: r must be above 0');
  const K=kr(),s=num(seed,1)>>>0;return {id:o.id||'pool_'+i,at:o.at.slice(0,3),r,toxic:num(o.toxic,1),seed:K.hash(s,i,A.PRESETS.sludge.salt)};};
 A.spillRec=(o,i,seed)=>{if(!o.at||o.at.length<2)throw new Error('atmos sludge: a spill needs at [x, z]');const r=num(o.r,10),kind=num(o.kind,'oil');
  if(!(r>0))throw new Error('atmos sludge: r must be above 0');if(kind!=='oil'&&kind!=='wet')throw new Error('atmos sludge: a spill is oil or wet');
  const K=kr(),s=num(seed,1)>>>0;return {id:o.id||'spill_'+i,at:[o.at[0],o.at[1]],r,kind,k:Math.min(1,Math.max(0,num(o.k,1))),seed:K.hash(s,i,A.PRESETS.sludge.salt+1)};};
 // the edge of a stain is broken by value noise on the integer hash (KRAND.h3 at 1/4 the radius): the CPU's twin of the shader's
 A.spillAt=(spills,x,z)=>{const K=kr();let m=0;for(const S of spills){const dx=x-S.at[0],dz=z-S.at[1],d=Math.hypot(dx,dz)/S.r;if(d>1.4)continue;
   const n=K.vnoise(dx/S.r*4,0,dz/S.r*4,S.seed&65535);const e=d+(n-.5)*.35;m=Math.max(m,(1-Math.min(1,Math.max(0,(e-.85)/.15)))*S.k);}return m;};
 // core/rand's KRAND.hash3 and KRAND.vnoise in GLSL, bit for bit (int32 lattice, the same mixing): the spill's broken edge is
 // the same on the GPU as ATMOS.spillAt says on the CPU (test-industry.js runs the chunk's integer steps, read from its text, against KRAND.h3)
 A.krandGLSL=()=>['#ifndef ATM_KRAND_CHUNK','#define ATM_KRAND_CHUNK',
  'uint atmKrS(uint h,int v){h=(h^uint(v))*0x9E3779B1u;return (h<<13u)|(h>>19u);}',
  'uint atmKrM(uint h){h^=h>>16u;h*=0x85ebca6bu;h^=h>>13u;h*=0xc2b2ae35u;h^=h>>16u;return h;}',
  'float atmKrH3(ivec3 c,uint s){return float(atmKrM(atmKrS(atmKrS(atmKrS(s^0x2545F491u,c.x),c.y),c.z)^3u))/4294967296.0;}',
  'float atmKrVN(vec3 p,uint s){ivec3 i=ivec3(floor(p));vec3 f=p-floor(p);vec3 u=f*f*(3.0-2.0*f);',
  ' float a=mix(atmKrH3(i,s),atmKrH3(i+ivec3(1,0,0),s),u.x),b=mix(atmKrH3(i+ivec3(0,1,0),s),atmKrH3(i+ivec3(1,1,0),s),u.x);',
  ' float c=mix(atmKrH3(i+ivec3(0,0,1),s),atmKrH3(i+ivec3(1,0,1),s),u.x),d=mix(atmKrH3(i+ivec3(0,1,1),s),atmKrH3(i+ivec3(1,1,1),s),u.x);',
  ' return mix(mix(a,b,u.y),mix(c,d,u.y),u.z);}','#endif'].join('\n');
 A.poolHazard=R=>({kind:'acid',shape:{type:'cyl',r:R.r,y0:-2,y1:.5},danger:Math.min(1,.4+.5*R.toxic),tell:{colour:'#b8c840',fx:'fume',sound:'bubble'},seed:R.seed});
 const HASH=['uint atmSlH(uvec3 c){uint h=(c.x*1597334677u)^(c.y*3812015801u)^(c.z*2246822519u);h^=h>>16u;h*=2146121005u;h^=h>>15u;h*=2221713035u;h^=h>>16u;return h;}',
  'float atmSlU(vec3 p){return float(atmSlH(uvec3(ivec3(floor(p))+ivec3(1<<20))))/4294967296.0;}',
  'float atmSlN(vec2 p,float s){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);float a=atmSlU(vec3(i,s)),b=atmSlU(vec3(i+vec2(1,0),s)),c=atmSlU(vec3(i+vec2(0,1),s)),d=atmSlU(vec3(i+vec2(1,1),s));return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}',
  /* Worley: the distance to the nearest drifting cell point, and to the second (the foam rafts are the cells' near parts) */
  'vec2 atmSlW(vec2 p,float t,float s){vec2 i=floor(p),f=fract(p);float d1=9.0,d2=9.0;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(x,y);',
  ' vec2 o=vec2(atmSlU(vec3(i+g,s)),atmSlU(vec3(i+g,s+7.0)));o=0.5+0.4*vec2(sin(t*0.21+6.2832*o.x),cos(t*0.17+6.2832*o.y));float d=length(g+o-f);',
  ' if(d<d1){d2=d1;d1=d;}else if(d<d2)d2=d;}return vec2(d1,d2);}'].join('\n');
 A.sludgeGLSL=()=>{const P=A.PRESETS.sludge;return ['#ifndef ATM_SLUDGE_CHUNK','#define ATM_SLUDGE_CHUNK',HASH,
  'vec4 atmSludge(vec3 wp,vec3 V,vec3 L,float t,float tox){vec2 p=wp.xz/'+F(P.foamCell)+'+vec2(t*'+F(P.foamDrift)+',t*'+F(P.foamDrift*.6)+');',
  ' vec2 w=atmSlW(p*2.0,t,3.0);float n=atmSlN(p*0.45,5.0)*0.6+atmSlN(p*1.3,6.0)*0.3+atmSlN(p*4.0,7.0)*0.1;',
  /* irregular rafts where the layered noise gathers them, lacy at the edge, holed where a drifting cell's point sits */
  ' float foam=smoothstep(0.56,0.66,n)*smoothstep(0.12,0.32,w.x)*tox;foam=max(foam,smoothstep(0.03,0.0,abs(n-0.56))*0.5*tox);',
 ' vec3 c=mix('+c3(P.deep)+','+c3(P.base)+',atmSlN(wp.xz*0.12,9.0));',
  /* the sheen: thin-film bands on a slow noise, seen at a glancing angle */
  ' float th=atmSlN(wp.xz*0.25+vec2(t*0.015,0.0),11.0)*6.0+atmSlN(wp.xz*1.3,12.0);vec3 film=0.5+0.5*cos(6.2832*(th+vec3(0.0,0.33,0.67)));',
  ' float fres=pow(1.0-max(V.y,0.0),3.0);c+=film*(0.05+0.25*fres)*(1.0-foam);',
  /* bubbles: a few a square metre, each swelling for its period and popping */
  ' vec2 q=wp.xz*'+F(P.bubble*2)+';vec2 bi=floor(q),bf=fract(q)-0.5;float bu=atmSlU(vec3(bi,21.0));float ph=fract(t*(0.15+0.25*bu)+bu*9.0);',
  ' float br=0.08+0.3*ph;float ring=smoothstep(0.05,0.0,abs(length(bf)-br))*step(0.7,bu)*(1.0-ph)*tox;',
  ' c=mix(c,'+c3(P.foam)+',foam);c+=vec3(0.25,0.27,0.15)*ring;',
  ' vec3 H=normalize(L+V);float spec=pow(max(dot(vec3(0.0,1.0,0.0),H),0.0),90.0)*(1.0-foam)*0.8;return vec4(c,spec);}','#endif'].join('\n');};
 // the pool's surface: a ShaderMaterial with three's fog, lit by a sun direction (o.sun [x, y, z], toward the sun)
 A.sludgeMaterial=o=>{o=o||{};const T=A.T,P=A.PRESETS.sludge,s=o.sun||[.4,.8,.3],L=Math.hypot(s[0],s[1],s[2]);
  const U=T.UniformsUtils.merge([T.UniformsLib.fog,{atmSlT:{value:0},atmSlSun:{value:new T.Vector3(s[0]/L,s[1]/L,s[2]/L)},atmSlTox:{value:num(o.toxic,1)},atmSlLight:{value:1}}]);
  U.atmSlT=A.U.time;U.atmSlLight=A.U.light;
  const m=new T.ShaderMaterial({uniforms:U,fog:true,transparent:false,
   vertexShader:['varying vec3 vSlP;','#include <fog_pars_vertex>','void main(){vec4 wp=modelMatrix*vec4(position,1.0);vSlP=wp.xyz;vec4 mvPosition=viewMatrix*wp;gl_Position=projectionMatrix*mvPosition;','#include <fog_vertex>','}'].join('\n'),
   fragmentShader:['uniform float atmSlT;uniform vec3 atmSlSun;uniform float atmSlTox;uniform float atmSlLight;varying vec3 vSlP;','#include <common>','#include <fog_pars_fragment>',A.sludgeGLSL(),
    'void main(){vec3 V=normalize(cameraPosition-vSlP);vec4 s=atmSludge(vSlP,V,atmSlSun,atmSlT,atmSlTox);float lit=0.35+0.65*max(atmSlSun.y,0.0);',
    ' gl_FragColor=vec4(s.rgb*lit*(0.3+0.7*atmSlLight)+vec3(s.a)*atmSlLight,1.0);','#include <fog_fragment>','}'].join('\n')});
  m.userData.sludge=true;return m;};
 A.sludgePools=(list,o)=>{o=o||{};const T=A.T,recs=list.map((p,i)=>A.sludgeRec(p,i+1,o.seed)),mat=A.sludgeMaterial(o),meshes=[];
  recs.forEach(R=>{const g=new T.CircleGeometry(R.r,48);g.rotateX(-Math.PI/2);const m=new T.Mesh(g,mat);m.position.set(R.at[0],R.at[1],R.at[2]);m.name='atmos:sludge:'+R.id;A.add(m);meshes.push(m);});
  A.rec('sludge',{pools:JSON.parse(JSON.stringify(recs))});
  return {recs,meshes,material:mat,dispose(){meshes.forEach(m=>{if(m.parent)m.parent.remove(m);m.geometry.dispose();});mat.dispose();}};};
 // ---- the spill layer on a ground material: up to PRESETS.sludge.max stains (x, z, r, signed k: + oil, - wet)
 A.spillOn=(mat,list,o)=>{o=o||{};const T=A.T,P=A.PRESETS.sludge,K=A.KH(),recs=list.map((s,i)=>A.spillRec(s,i+1,o.seed));
  if(recs.length>P.max)A.err('spillOn: '+recs.length+' spills, the layer takes '+P.max+' (the rest are dropped: split the ground)');
  const U={value:[]};for(let i=0;i<P.max;i++){const R=recs[i];U.value.push(R?new T.Vector4(R.at[0],R.at[1],R.r,(R.kind==='oil'?1:-1)*Math.max(.001,R.k)):new T.Vector4(0,0,0,0));}
  const S={value:[]};for(let i=0;i<P.max;i++)S.value.push(recs[i]?(recs[i].seed&65535):0);
  K.add(mat,'atm-spill',function(sh){sh.uniforms.atmSpill=U;sh.uniforms.atmSpillS=S;
   const V='varying vec3 vAtmSpP;',AV='vec4 atmSpW=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\natmSpW=instanceMatrix*atmSpW;\n#endif\nvAtmSpP=(modelMatrix*atmSpW).xyz;';
   sh.vertexShader=K.inject(K.rep(sh.vertexShader,'#include <common>','#include <common>\n'+V),{at:'project_vertex',after:AV,fallback:{at:'fog_vertex',before:AV}});
   const FS=['uniform vec4 atmSpill['+P.max+'];uniform float atmSpillS['+P.max+'];',HASH.replace(/atmSl/g,'atmSp'),A.krandGLSL(),
    'vec4 atmSpillAt(vec2 p){float oil=0.0,wet=0.0,rim=0.0,fr=0.0;for(int i=0;i<'+P.max+';i++){vec4 s=atmSpill[i];if(s.z<=0.0)continue;vec2 d=(p-s.xy)/s.z;float r=length(d);if(r>1.6)continue;',
    ' float e=r+(atmKrVN(vec3(d.x*4.0,0.0,d.y*4.0),uint(atmSpillS[i]))-0.5)*0.35;float k=abs(s.w);float in_=(1.0-smoothstep(0.85,1.0,e))*k;',
    ' if(s.w>0.0){oil=max(oil,in_);rim=max(rim,smoothstep(0.75,0.92,e)*(1.0-smoothstep(0.95,1.05,e))*k);fr=max(fr,smoothstep(1.4,1.0,e)*(1.0-in_)*k);}else wet=max(wet,in_);}',
    ' return vec4(oil,rim,fr,wet);}'].join('\n');
   sh.fragmentShader=A.repLit(this)(K.rep(sh.fragmentShader,'#include <common>','#include <common>\n'+V+'\n'+FS),'#include <emissivemap_fragment>',
    '{vec4 sp=atmSpillAt(vAtmSpP.xz);vec3 c=diffuseColor.rgb;float l=dot(c,vec3(0.3,0.55,0.15));c=mix(c,vec3(l*1.15+0.1),sp.z*'+F(P.fringe)+');'+
    'c=mix(c,'+c3(P.oil)+',sp.x);c=mix(c,'+c3(P.crust)+'*(0.7+0.4*atmSpN(vAtmSpP.xz*3.0,40.0)),sp.y*0.8);c*=1.0-0.45*sp.w;diffuseColor.rgb=c;'+
    '\n#if defined(STANDARD)\nroughnessFactor=mix(roughnessFactor,0.18,max(sp.x*(1.0-sp.y),sp.w*0.7));\n#endif\n}\n#include <emissivemap_fragment>');});
  A.rec('spills',{spills:JSON.parse(JSON.stringify(recs)),max:P.max});return {recs,uniform:U};};
})();
