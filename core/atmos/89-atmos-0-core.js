// ================================================================= ATMOS — core: the host binding, the clock, instanced sets, the glow registry
// ATMOS is the portable atmosphere and street-dressing module (core/atmos/README.md): evening lights, glow, particles,
// weather, ivy and window boxes, sewer grates, street lamps and fountains, culling. Every fragment is a closure that
// adds to the one global `ATMOS`; nothing else is declared at top level, so any build can include the files.
// A build binds it once:
//   ATMOS.init({THREE, scene, camera, hour:()=>0..24, onFrame:fn=>{}, ground:(x,z)=>y, seed, err:msg=>{}, ui:element})
// then places things with the module calls and ends with ATMOS.finish() (bakes the instanced sets, builds the glow).
// Its own PRNG (ATMOS.seed / rnd / rr / pick): it never touches the host's stream.
const ATMOS={};
(function(){const A=ATMOS;
 A.init=function(h){A.h=h;const T=A.T=h.THREE;A.root=new T.Group();A.root.name='atmos';h.scene.add(A.root);
  A.sets={};A.glow=[];A.hooks=[];A.stats={};A.seed(h.seed||1);
  A.U={hour:{value:0},night:{value:0},time:{value:0},rain:{value:0},fog:{value:0},flash:{value:0},wind:{value:new T.Vector2(.8,.35)},light:{value:1},px:{value:600}};
  h.onFrame(()=>{const t=performance.now()/1000,hr=h.hour();const U=A.U;U.hour.value=hr;U.night.value=A.night(hr);U.time.value=t;U.light.value=1-.82*U.night.value;
   U.px.value=innerHeight/(2*Math.tan(h.camera.fov*Math.PI/360));for(const f of A.hooks){try{f(t,hr);}catch(e){A.err('frame: '+e.message);}}});};
 A.err=m=>{if(A.h&&A.h.err)A.h.err('atmos: '+m);else console.warn('atmos: '+m);};
 A.hook=fn=>A.hooks.push(fn);
 A.ground=(x,z)=>A.h.ground?A.h.ground(x,z):0;
 // the clock: night factor, and a light's on/off window (on in the evening, off next morning; off may be past 24)
 A.ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
 A.night=h=>Math.min(1,Math.max(0,1-A.ss(5.5,7.2,h)+A.ss(17.2,18.8,h)));
 A.litAt=(h,on,off)=>{const hh=h<12?h+24:h;return A.ss(on,on+.3,hh)*(1-A.ss(off-.3,off,hh));};
 A.GLSL_LIT='float atmLit(float h,vec2 t){float hh=h<12.0?h+24.0:h;return smoothstep(t.x,t.x+0.3,hh)*(1.0-smoothstep(t.y-0.3,t.y,hh));}';
 // PRNG (mulberry32)
 let s=1;A.seed=n=>{s=(n>>>0)||1;};A.rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
 A.rr=(a,b)=>a+(b-a)*A.rnd();A.pick=a=>a[Math.floor(A.rnd()*a.length)];
 A.col=hex=>new A.T.Color(hex).convertSRGBToLinear();
 // shared geometry (unit sizes; posts and cones stand on y=0) and cached materials
 const G={};A.geo=k=>{if(G[k])return G[k];const T=A.T;
  G[k]=k==='box'?new T.BoxGeometry(1,1,1):k==='post'?new T.CylinderGeometry(1,1,1,8).translate(0,.5,0):k==='post16'?new T.CylinderGeometry(1,1,1,16).translate(0,.5,0):
   k==='ball'?new T.SphereGeometry(1,8,6):k==='cone'?new T.ConeGeometry(1,1,7).translate(0,.5,0):k==='plane'?new T.PlaneGeometry(1,1):null;return G[k];};
 const M={};A.mat=(k,make)=>M[k]||(M[k]=make());
 A.lam=(hex,rough)=>A.mat('std'+hex+'_'+(rough||.85),()=>new A.T.MeshStandardMaterial({color:hex,roughness:rough||.85,metalness:0}));
 // INSTANCED SETS: put() collects, finish() bakes one InstancedMesh per set. Item: [x,y,z, sx,sy,sz, ry|Quaternion, color]
 A.set=(name,geo,mat)=>A.sets[name]||(A.sets[name]={geo:typeof geo==='string'?A.geo(geo):geo,mat,items:[]});
 A.put=(name,item)=>{A.sets[name].items.push(item);};
 A.bakeSets=()=>{const T=A.T,m=new T.Matrix4(),p=new T.Vector3(),sc=new T.Vector3(),q0=new T.Quaternion(),qy=new T.Quaternion(),Y=new T.Vector3(0,1,0),W=new T.Color(1,1,1);
  for(const name in A.sets){const S=A.sets[name];if(!S.items.length||S.mesh)continue;const im=new T.InstancedMesh(S.geo,S.mat,S.items.length);let col=false;
   S.items.forEach((o,i)=>{p.set(o[0],o[1],o[2]);sc.set(o[3],o[4],o[5]);const q=o[6]==null?q0:(o[6].isQuaternion?o[6]:qy.setFromAxisAngle(Y,o[6]));m.compose(p,q,sc);im.setMatrixAt(i,m);if(o[7]!=null)col=true;});
   if(col)S.items.forEach((o,i)=>im.setColorAt(i,o[7]!=null?(o[7].isColor?o[7]:A.col(o[7])):W));
   im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;im.name='atmos:'+name;im.userData.atmos=name;A.root.add(im);S.mesh=im;A.stats[name]=S.items.length;}};
 // the GLOW registry: a soft additive sprite over every light. on/off are the light's hours (on<0: follows the night)
 A.glowAdd=(x,y,z,col,size,on,off)=>{A.glow.push([x,y,z,col[0],col[1],col[2],size||6,on==null?-1:on,off==null?30:off]);};
 A.noRay=o=>{o.raycast=()=>{};o.userData.probeSkip=true;return o;};
 A.add=o=>{A.root.add(o);return o;};
 A.finish=()=>{A.bakeSets();if(A.buildGlow)A.buildGlow();return A.stats;};
})();
