// ================================================================= HOST — a station's cavern drawn (core/terrain's KCAVERN; the Godthrone's and the Twins' tube stations)
// A tube station (4, the Hollow Way; 5, the cloud bench's roof bridges) plans its cavern as data in its land (stations/<name>/44w-host-land.js:
// STATION.CAVERN, a KCAVERN built on the ground KRELIEF.tubeRille cut, with a 'well' opening at each skylight and each portal); this fragment meshes
// it, chunk by chunk (C.meshAll), and hands nothing to the probe's ground. Pages without a cavern skip it (STATION.CAVERN is null).
//   THE ROCK     titanium basalt, near black, glazed where the lava drained (KCAVERN's lining weight), the breakdown's blocks a shade lighter
//   THE LIGHT    the sky's and the sun's, scaled by KCAVERN's openness (occ: 0 shut .. 1 open), so the tube darkens away from its mouths and
//                skylights (the Twins' pyroduct lights its own lamps; this tube has none: the forges are the settlement build's)
//   THE GROUND   inside an opening's rim the cavern meshes the ground itself (KCAVERN: the mouth cut in it). It draws that ground only in the
//                ground mesh's cells the station leaves out (STATION.hole: a portal's, a bridge's; the same cell test in the shader, so the two
//                surfaces never overlap), with the painted ground's map at the ground mesh's UVs; round a skylight the ground mesh itself is cut
//                (45: SKYHOLES) and the cavern draws none of the ground. Where that ground is steep (a bridge's end, a trench's wall) it takes
//                the rock's colour, not the paint's
// Each void a core/tags record (REGISTER) before it is drawn.
const CAVERN_DRAW=(function(){const C=typeof STATION!=='undefined'?STATION.CAVERN:null;if(!C)return null;
 const t0=performance.now(),S=TERR.R*2.2,meshes=[];
 const mat=new THREE.MeshLambertMaterial({map:TEX_GROUND,vertexColors:true,color:0xffffff});
 mat.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aCG;attribute float aOcc;varying float vCG;varying float vOcc;varying vec2 vCWP;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvCG=aCG*smoothstep(0.55,0.8,normalize(mat3(modelMatrix)*objectNormal).y);vOcc=aOcc;vCWP=(modelMatrix*vec4(transformed,1.0)).xz;');
  /* the ground the cavern meshes is drawn only in a cell the ground mesh left out: the cell's centre within a portal's reach (45's quad test) */
  const PO=(STATION.CAVERN_OPENINGS||[]).filter(o=>o.kind!=='sky'),GS=TERR.R*2.2,GC=GS/ST_GROUND_N();
  const cellTest=PO.length?'vec2 _gc=-'+(GS/2).toFixed(3)+'+(floor((vCWP+'+(GS/2).toFixed(3)+')/'+GC.toFixed(5)+')+0.5)*'+GC.toFixed(5)+';bool _in=false;'+
   PO.map(o=>'if(distance(_gc,vec2('+o.c[0].toFixed(2)+','+o.c[1].toFixed(2)+'))<'+(o.r+o.rim*.5).toFixed(2)+')_in=true;').join('')+'if(vCG>0.5&&!_in)discard;':'if(vCG>0.5)discard;';
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vCG;varying float vOcc;varying vec2 vCWP;')
   .replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n'+cellTest+'float _g=step(0.5,vCG);')   /* a hard switch, ground or rock: a blend between them drew pale fringes */
   /* the ground's paint where the cavern meshes the ground (aCG 1), the basalt's vertex colour elsewhere; the whole darkened by the openness */
   .replace('#include <map_fragment>','vec4 texelColor=mapTexelToLinear(texture2D(map,vUv));diffuseColor.rgb*=mix(vec3(1.0),texelColor.rgb*vec3(0.66,0.64,0.6),_g);')
   .replace('#include <color_fragment>','diffuseColor.rgb*=mix(vColor,vec3(1.0),_g);')
   .replace('#include <envmap_fragment>','outgoingLight*=mix(0.04+0.96*pow(clamp(vOcc,0.0,1.0),1.4),1.0,_g);\n#include <envmap_fragment>');};
 mat.customProgramCacheKey=()=>'gstep-cavern';mat.userData.cavern=true;
 const L=h=>new THREE.Color(h).convertSRGBToLinear(),base=L(0x3a3839),glaze=L(0x4a3a32),brk=L(0x55524e),c=new THREE.Color();   /* linear: the vertex colours are not decoded */
 let tris=0;const BIN=160,bins=new Map();
 /* the chunks merged by 160 m bins (one mesh each, culled as one): a chunk a mesh drew 774 calls on station 4 */
 C.meshAll().forEach(ch=>{if(!ch.idx.length)return;const o=ch.origin||[ch.pos[0],0,ch.pos[2]],k=Math.floor(o[0]/BIN)+','+Math.floor(o[2]/BIN);
  if(!bins.has(k))bins.set(k,[]);bins.get(k).push(ch);});
 bins.forEach(list=>{let nv=0,ni=0;list.forEach(ch=>{nv+=ch.pos.length/3;ni+=ch.idx.length;});
  const pos=new Float32Array(nv*3),nrm=new Float32Array(nv*3),col=new Float32Array(nv*3),uv=new Float32Array(nv*2),cg=new Float32Array(nv),oc=new Float32Array(nv),idx=new Uint32Array(ni);let v0=0,i0=0;
  list.forEach(ch=>{const n=ch.pos.length/3;pos.set(ch.pos,v0*3);nrm.set(ch.nrm,v0*3);for(let i=0;i<ch.idx.length;i++)idx[i0+i]=ch.idx[i]+v0;
   for(let v=0;v<n;v++){const q=v0+v,x=ch.pos[3*v],z=ch.pos[3*v+2],w0=ch.w?ch.w[4*v]:0,w1=ch.w?ch.w[4*v+1]:0;
    c.copy(base).lerp(glaze,clamp(w0,0,1)*.6).lerp(brk,clamp(w1,0,1)*.7);col[3*q]=c.r;col[3*q+1]=c.g;col[3*q+2]=c.b;
    uv[2*q]=x/S+.5;uv[2*q+1]=.5-z/S;cg[q]=ch.ground&&ch.ground[v]?1:0;oc[q]=ch.occ?ch.occ[v]:1;}
   v0+=n;i0+=ch.idx.length;});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nrm,3));
  g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setAttribute('aCG',new THREE.BufferAttribute(cg,1));g.setAttribute('aOcc',new THREE.BufferAttribute(oc,1));
  g.setIndex(new THREE.BufferAttribute(idx,1));g.computeBoundingSphere();
  const m=new THREE.Mesh(g,mat);m.userData.host=true;m.userData.cavern=true;m.userData.inspectLabel=STATION.CAVERN_LABEL||'The tube\'s rock: titanium basalt, glazed where the lava drained (KCAVERN)';
  scene.add(m);meshes.push(m);tris+=ni/3;});
 (STATION.CAVERN_VOIDS||[]).forEach(V=>REGISTER(Object.assign({kind:'cavern'},V)));
 window._cavern={tris,chunks:C.chunks.length,meshes:meshes.length,openings:(STATION.CAVERN_OPENINGS||[]).length,holes:window._groundHoles||0,ms:Math.round(performance.now()-t0)};
 return{meshes,mat};})();
