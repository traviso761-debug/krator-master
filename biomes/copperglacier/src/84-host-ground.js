// ================================================================= HOST — the ground (every station): the land and the ice as one mesh
// One ground mesh over the page's square, painted from the fields (45): grey gneiss and granite on the walls and the nunataks, buff gravel on the
// moraines and the outwash, the ice white to pale blue (bare ice blue-grey, the firn and the snow white), the dirty snout and margins brown-grey,
// the copper ground green and rust, the wet margin dark. On KGROUND (43-core-ground.js), each layer on its documented mask (the review's first line):
//   snow       ground.snow on aSnow (the snow field: the firn on the ice, the snow on the ground above the station's snow line, the lee)
//   algae      ground.algae on aAlgae (the summer firn's snow algae: the snow field x the station's algae share x noise, never on steep ground)
//   ice        ice.glacier on aIce x (1 - aSnow): the bare ice; on the copper ground ice.verdigris (ice.glacier.verdigris: the banded, copper-stained ice)
//   debris     ice.debris on aDebris (the snout's last few hundred metres, the margins)
//   gravel     ground.gravel on (1 - aRock) x (1 - aIce): the moraines and the outwash
//   walls      rock.granite or rock.gneiss on aRock, by the resource data's province at the site (WALL_ROCK)
//   malachite  rock.malachite on aCu (the copper field: the resource data's skarn and nodes)
//   POLYGONS   a `polygon` kind on aFlat (the frost's flats, where KFROST draws its sorted circles) (?polygon=0)
//   wet        aWet: the water's wet band from WATER.fieldAt's shore (89z)
// Eight library layers and one kind: the page keeps texture units for KHORIZON, the rain cover and the shadows (ebadlands' 16-unit lesson). ?kground=0
// the paint alone.
const TEX_GROUND=BIO.canvasTex(1536,1536,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;const S=TERR.R*2.2;
 const c=new THREE.Color(),t=new THREE.Color(),K=hx=>new THREE.Color(hx);
 const GRAV=K(0x8e887e),GRAV2=K(0x7e786e),ROCK=K(0x6e6a66),ROCK2=K(0x5a5754),ICE=K(0xb4c8d6),ICE2=K(0x9ab4c8),SNOW=K(0xeef2f6),DEB=K(0x6a6660),CU=K(0x3e7e5e),RUST=K(0x8a5230),DAMP=K(0x4e4a40);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;const wx=(x/w-.5)*S,wz=(y/h-.5)*S,A=n=>FC.at(FC.a[n],wx,wz);
  const n=fbm(x/24,y/24,3,2)-.5,pav=fbm(x/80+5,y/80-2,7,2),rock=A('rock'),ice=A('ice'),snow=A('snow'),deb=A('debris'),cu=A('copper'),wet=A('shore');
  c.copy(GRAV).lerp(GRAV2,smooth(.4,.65,pav)*.7);
  t.copy(ROCK).lerp(ROCK2,clamp(.4+n*1.6,0,1));c.lerp(t,smooth(.25,.6,rock));
  c.lerp(DAMP,smooth(.3,.8,wet)*.6);
  c.lerp(t.copy(CU).lerp(RUST,smooth(.45,.7,fbm(x/30,y/30,11,2))),smooth(.25,.7,cu)*.75);
  c.lerp(t.copy(ICE).lerp(ICE2,smooth(.4,.7,pav)),ice);c.lerp(DEB,deb*.75);
  c.lerp(SNOW,snow*(1-deb*.6));
  const k=1+n*.07;d[i]=clamp(c.r*255*k,0,255);d[i+1]=clamp(c.g*255*k,0,255);d[i+2]=clamp(c.b*255*k,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const TEX_DETAIL=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=244+(fbm(x/9,y/9,5,2)-.5)*22+(BIO.fn.h3(x,y,9)-.5)*14;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const GQ=new URLSearchParams(location.search),USE_KG=typeof KGROUND!=='undefined'&&GQ.get('kground')!=='0';
const MAT_GROUND=USE_KG?new THREE.MeshStandardMaterial({map:TEX_GROUND,color:0xd8d6d2,roughness:.95,metalness:0}):new THREE.MeshLambertMaterial({map:TEX_GROUND,color:0xd8d6d2});
const GA=['aRock','aIce','aSnow','aAlgae','aCu','aDebris','aFlat','aWet'],GV=GA.map(a=>'v'+a.slice(1));
MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uDetail={value:TEX_DETAIL};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vGWP;'+GA.map((a,i)=>'attribute float '+a+';varying float '+GV[i]+';').join(''))
  .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;'+GA.map((a,i)=>GV[i]+'='+a+';').join(''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+KCOLOR.GLSL+'\nuniform sampler2D uDetail;varying vec3 vGWP;'+GV.map(v=>'varying float '+v+';').join(''))
  .replace('#include <map_fragment>','#include <map_fragment>\n{vec3 dt=sampleSRGB(uDetail,vGWP.xz*0.165).rgb;vec3 dt2=sampleSRGB(uDetail,vGWP.xz*0.021+0.37).rgb;vec3 _gP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'')+
  'diffuseColor.rgb*=mix(dt*dt2*1.22,vec3(1.0),vIce*0.6);diffuseColor.rgb*=mix(vec3(1.0),vec3(0.62,0.6,0.56),vWet);}');};
const KG_POLY=GQ.get('polygon')!=='0';
/* the walls' rock by the resource data's province at the site: granite where the cell is granite (station 1), the banded gneiss elsewhere (crystalline, the rift's edge) */
const WALL_ROCK=CG_RES.province==='granite'?'rock.granite':'rock.gneiss';
/* THE RELIEF (2026-11-03, the ground workstream; core/README.md 'Adopting KGROUND's relief'): the derivative bump from the layers' blended height,
   the cavity occlusion and the mesh's own hollows (cavityMesh, after the mesh below), at no texture unit; the side planes (tri) only where a station's
   flanks are steep and near (the pass: SITE.tri). ?relief=0 / ?tri=0 for the before */
const KG_RELIEF=GQ.get('relief')!=='0',KG_TRI=!!SITE.tri&&GQ.get('tri')!=='0';
if(USE_KG)KGROUND.hook(MAT_GROUND,{key:'copperglacier-'+SITE.key+'-ground'+(KG_POLY?'g':'')+(KG_RELIEF?'r':'')+(KG_TRI?'t':''),at:'/*KGROUND*/',
 ...(KG_RELIEF?{relief:{bump:.075,cavity:.8,mesh:1}}:{}),...(KG_TRI?{tri:{from:.35,to:.7}}:{}),layers:[
 KGROUND.layer('copperglacier','ground.gravel',{w:'(1.0-vRock)*(1.0-vIce)*(1.0-vSnow)*(1.0-vCu)',amt:.75,gain:1.0,name:'gravel'}),
 KGROUND.layer('copperglacier',WALL_ROCK,{w:'vRock*(1.0-vIce)*(1.0-vSnow*0.8)',amt:.85,gain:1.0,tint:'_gP*1.5',name:WALL_ROCK==='rock.granite'?'granite':'banded gneiss'}),
 KGROUND.layer('copperglacier','rock.malachite',{w:'vCu*(1.0-vIce)*(1.0-vSnow)',amt:.8,gain:1.0,name:'malachite (the copper ground)'}),
 KGROUND.layer('copperglacier','ice.glacier',{w:'vIce*(1.0-vSnow)*(1.0-vDebris)*(1.0-clamp(vCu*2.5,0.0,1.0))',amt:.9,gain:1.0,name:'bare ice'}),
 KGROUND.layer('copperglacier','ice.verdigris',{w:'vIce*(1.0-vSnow)*(1.0-vDebris)*clamp(vCu*2.5,0.0,1.0)',amt:.9,gain:1.0,name:'verdigris ice (the copper ground)'}),
 KGROUND.layer('copperglacier','ice.debris',{w:'vDebris',amt:.85,gain:1.0,name:'dirty ice'}),
 KGROUND.layer('copperglacier','ground.snow',{w:'vSnow',amt:.9,gain:1.0,name:'snow and firn'}),
 KGROUND.layer('copperglacier','ground.algae',{w:'vAlgae',amt:.85,gain:1.0,name:'snow algae'}),
 KG_POLY?{kind:'polygon',w:'vFlat',amt:.7,size:3.2,width:.07,edgeTint:'vec3(0.42,0.4,0.36)',warp:.16,rim:.06,rimTint:'vec3(0.56,0.54,0.5)',seed:432,name:'sorted circles'}:null].filter(Boolean)});
const GROUND=(function(){const N=480,S=TERR.R*2.2,cs=S/N,nx=N+1;
 const pos=new Float32Array(nx*nx*3),uv=new Float32Array(nx*nx*2),A=GA.map(()=>new Float32Array(nx*nx));
 const src=[k=>smooth(.3,.65,FC.at(FC.a.rock,X,Z)),k=>FC.at(FC.a.ice,X,Z),k=>FC.at(FC.a.snow,X,Z),k=>FC.at(FC.a.algae,X,Z),k=>FC.at(FC.a.copper,X,Z),k=>FC.at(FC.a.debris,X,Z),k=>FC.at(FC.a.flat,X,Z),k=>0];
 let X=0,Z=0;
 for(let j=0;j<nx;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=-S/2+i*cs,z=-S/2+j*cs,y=terrainH(x,z);pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;uv[k*2]=x/S+.5;uv[k*2+1]=.5-z/S;
  X=x;Z=z;for(let a=0;a<GA.length;a++)A[a][k]=src[a](k);}
 const idx=new Uint32Array(N*N*6);let t=0;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*nx+i,b=a+nx,c=b+1,d=a+1;idx[t++]=a;idx[t++]=b;idx[t++]=d;idx[t++]=b;idx[t++]=c;idx[t++]=d;}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));
 GA.forEach((a,i)=>g.setAttribute(a,new THREE.BufferAttribute(A[i],1)));
 g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();const m=new THREE.Mesh(g,MAT_GROUND);m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel=SITE.region;scene.add(m);
 if(USE_KG&&KG_RELIEF&&KGROUND.cavityMesh)KGROUND.cavityMesh(m,{rings:[3,18],depth:[.5,4]});   /* aKGAO, the hollows relief.mesh reads */
 return m;})();
