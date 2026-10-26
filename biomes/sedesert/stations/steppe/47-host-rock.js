// ================================================================= HOST — the rock (the steppe): tors, the mesa, the hoodoos
// core/terrain's KSTACKS (37-core-stacks.js) grows the rock as records: on each kopje's crown a garden of TORS (granite weathers
// along its joints into piles of rounded blocks: KSTACKS's piles of plates, rounded and top-heavy, some balanced), and at the
// desert edge a MESA with its HOODOOS. KSTACKS.mesh draws them; the walls carry the granite and, where the weather has hollowed
// it, HONEYCOMB (tafoni: cells and lattices eaten into the faces), a vertex weight from the face's height and a noise; the tops the
// granite alone. Each body is registered and an obstacle; the plants keep off it.
const ROCK=(function(){const L=[];let n=0;
 const ground=(x,z)=>terrainH(x,z),clear=(x,z,r)=>!L.some(B=>Math.hypot(B.x-x,B.z-z)<B.R+r);
 KOPJES.forEach(K=>{KSTACKS.cluster({id:'tors'+K.i,seed:4601+K.i,c:[K.x,K.z],rad:K.r*.55,n:Math.round(K.r/14),H:[6,18],r:[3.5,8],gap:5,
  kinds:{balanced:.55,spire:.45},plates:[2.2,4.2],platesShare:.9,crown:[.85,1],taper:[.02,.18],lean:[0,.08],e:[1,1.5],
  ground:(x,z)=>ground(x,z)-.4,accept:(x,z,r)=>clear(x,z,r)&&domeAt(K,x,z)>K.h*.45}).forEach(B=>{B.name=B.kind==='balanced'?'A balanced tor (granite blocks weathered round along their joints)':'A tor (a pile of granite blocks)';L.push(B);});});
 const ey=ground(EDGE.x,EDGE.z);
 L.push(Object.assign(KSTACKS.make({id:'edge-mesa',kind:'mesa',x:EDGE.x,z:EDGE.z,y0:ey-3,seed:4611,tiers:[{h:46,r:230,e:1.35,ry:.5}],bed:[2,5],weather:.6}),{name:'A mesa at the desert\'s edge',desert:true}));
 KSTACKS.cluster({id:'hoodoos',seed:4612,c:[EDGE.x+380,EDGE.z+260],rad:300,n:9,H:[9,24],r:[2.5,6],gap:14,kinds:{spire:.7,balanced:.3},taper:[.3,.55],crown:[.5,.95],
  ground:(x,z)=>ground(x,z)-.4,accept:(x,z,r)=>clear(x,z,r)}).forEach(B=>{B.name='A hoodoo (the desert\'s edge)';B.desert=true;L.push(B);});
 return L;})();
(function(){const P=k=>typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('steppe',k):null,Lt=P('rock.tor'),Lh=P('rock.tafoni');
 const tex=L=>L?KMAT.textures(L,{aniso:8}).map:null,mTor=tex(Lt),mHon=tex(Lh),sT=Lt?Lt.scale[0]:3,sH=Lh?Lh.scale[0]:2.5;
 const GR=[new THREE.Color(0xe0d6cc),new THREE.Color(0xd4c8bc),new THREE.Color(0xeae0d4)],RED=[new THREE.Color(0xb4613f),new THREE.Color(0x9a4e34),new THREE.Color(0xc97a55)],c=new THREE.Color();
 const A={pos:[],uv:[],col:[],t:[],idx:[]};
 ROCK.forEach(B=>{const small=B.kind!=='mesa',m=KSTACKS.mesh(B,{step:small?1.6:6}),base=A.pos.length/3,nv=m.part.length;
  for(let v=0;v<nv;v++){const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2];A.pos.push(x,y,z);A.uv.push(m.uv[2*v],m.uv[2*v+1]);
   const k=KRAND.hash(B.seed,m.bed[v],7)%3;c.copy(B.desert?RED[k]:GR[k]).multiplyScalar(.72+.28*m.occ[v]);c.convertSRGBToLinear();A.col.push(c.r,c.g,c.b);
   /* the honeycomb: on the walls, low and in the shade of an overhang more than high, patchy by a noise */
   const wall=m.part[v]!==1?1:0,u=(y-B.y0)/Math.max(1,B.top-B.y0);A.t.push(B.desert?0:wall*smooth(.42,.62,fbm(x*.08,z*.08+y*.08,4621,2)+.25*(1-u)+.2*(1-m.occ[v])));}
  for(let i=0;i<m.idx.length;i++)A.idx.push(base+m.idx[i]);
  REGISTER({name:B.name,key:'rock.'+B.kind,x:B.x,z:B.z,y:B.y0,r:B.kind==='mesa'?B.R*.8:B.R,h:B.top-B.y0+1,rock:true});
  OBSTACLES.push({x:B.x,z:B.z,r:B.R+1});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(A.col,3));g.setAttribute('aT',new THREE.Float32BufferAttribute(A.t,1));g.setIndex(A.idx);g.computeVertexNormals();
 const mat=new THREE.MeshLambertMaterial({vertexColors:true,map:mTor});
 if(mTor){mat.onBeforeCompile=sh=>{sh.uniforms.uHon={value:mHon};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aT;varying float vT;varying vec2 vRU;').replace('#include <uv_vertex>','#include <uv_vertex>\nvT=aT;vRU=uv;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uHon;varying float vT;varying vec2 vRU;')
   .replace('#include <map_fragment>','{vec4 t=texture2D(map,vRU/'+sT.toFixed(2)+');t=mapTexelToLinear(t);'+(mHon?'vec3 h=pow(texture2D(uHon,vRU/'+sH.toFixed(2)+').rgb,vec3(2.2))/0.48;t.rgb=mix(t.rgb,t.rgb*h,vT);':'')+'diffuseColor*=t;}');};
  mat.customProgramCacheKey=()=>'steppe-rock';}
 const me=new THREE.Mesh(g,mat);me.userData.host=true;me.userData.inspectLabel='Granite (the kopjes\' tors: lichened, honeycombed where the weather hollowed it)';
 me.userData.probePoints=ROCK.map(B=>[B.x,B.y0+1,B.z]).flat();scene.add(me);})();
_mark('rock');
