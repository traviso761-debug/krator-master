// ================================================================= HOST — the ground (every station): the land as one mesh
// One ground mesh over the page's square, painted from the fields (45): the grazed steppe buff-green, the trodden banks and trails brown, the
// river's bars grey gravel, the knobs' talus grey rock, the wet margin dark. On KGROUND (43-core-ground.js), each layer on its documented mask:
//   steppe   ground.steppe on aMead (the open floor: no rock, no water, not steep)
//   mud      ground.mud on aShore x (1 - aFlow*0.6) (the banks the herds tread down to drink, the pond's margin)
//   gravel   ground.gravel on aFlow (the river's bed and bars)
//   rock     rock.dome on aRock (the knobs' talus and the steep)
//   wet      aWet: the water's wet band from WATER.fieldAt's shore (89z)
// Four library layers: the page keeps texture units for KHORIZON, the rain cover and the shadows (ebadlands' 16-unit lesson). ?kground=0 the paint alone.
// Started from biomes/copperglacier's ground (its mesh, the paint, the detail and the relief), its layers replaced.
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const GRASS=K(0x8a8a5a),GRASS2=K(0x9a9462),DRY=K(0xa89a70),ROCK=K(0x7a766e),ROCK2=K(0x66625c),MUD=K(0x6a5a44),GRAV=K(0x8a867c),DAMP=K(0x4e4a3a);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S,A=n=>FC.at(FC.a[n],wx,wz);
  const n=kfbm(x/24,y/24,3,2)-.5,pav=kfbm(x/80+5,y/80-2,7,2),rock=A('rock'),dry=A('dry'),shore=A('shore'),flow=A('flow');
  c.copy(GRASS).lerp(GRASS2,smooth(.4,.65,pav)*.7).lerp(DRY,smooth(.35,.6,dry)*.6);
  c.lerp(MUD,smooth(.3,.8,shore)*.55);c.lerp(GRAV,smooth(.2,.8,flow)*.8);
  t.copy(ROCK).lerp(ROCK2,clamp(.4+n*1.6,0,1));c.lerp(t,smooth(.25,.6,rock));
  c.lerp(DAMP,smooth(.5,.95,shore)*.35);
  const k=1+n*.07;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=244+(kfbm(x/9,y/9,5,2)-.5)*22+(BIO.fn.h3(x,y,9)-.5)*14;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d6d2,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d6d2});
const GA=['aRock','aMead','aShore','aFlow','aWet'],GV=GA.map(a=>'v'+a.slice(1));
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;'+GA.map((a,i)=>'attribute float '+a+';varying float '+GV[i]+';').join(''))
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;'+GA.map((a,i)=>GV[i]+'='+a+';').join(''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+KCOLOR.GLSL+'\nuniform sampler2D uDetail;varying vec3 vGWP;'+GV.map(v=>'varying float '+v+';').join(''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=sampleSRGB(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=sampleSRGB(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 _gP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=dt*dt2*1.22;diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
const KG_RELIEF=GQ.get('relief')!=='0';
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'labyrinth-'+SITE.key+'-ground'+(KG_RELIEF?'r':''),at:'/*KGROUND*/',
 ...(KG_RELIEF?{relief:{bump:.075,cavity:.8,mesh:1}}:{}),layers:[
 KGROUND.layer('labyrinth','ground.steppe',{w:'vMead*(1.0-vRock)',amt:.75,gain:1.0,tint:'_gP*1.35',name:'the grazed steppe'}),
 KGROUND.layer('labyrinth','ground.mud',{w:'vShore*(1.0-vFlow*0.6)*(1.0-vRock)',amt:.8,gain:1.0,name:'trodden banks'}),
 KGROUND.layer('labyrinth','ground.gravel',{w:'vFlow*(1.0-vRock)',amt:.8,gain:1.0,name:'river gravel'}),
 KGROUND.layer('labyrinth','rock.dome',{w:'vRock',amt:.85,gain:1.0,tint:'_gP*1.5',name:'the dome\'s banded gneiss'})]});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),A=GA.map(()=>new Float32Array(nx*nx));
 const src=[()=>smooth(.3,.65,FC.at(FC.a.rock,X,Z)),()=>FC.at(FC.a.meadow,X,Z),()=>FC.at(FC.a.shore,X,Z),()=>FC.at(FC.a.flow,X,Z),()=>0];
 let X=0,Z=0;
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  X=x;Z=z;for(let a=0;a<GA.length;a++)A[a][k]=src[a](k);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 GA.forEach((a,i)=>g.setAttribute(a,new THREE.BufferAttribute(A[i],1)));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.region;scene.add(m);
 if(USE_KG&&KG_RELIEF&&KGROUND.cavityMesh)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});
 return m;})();
