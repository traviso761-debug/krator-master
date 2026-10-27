// ================================================================= HOST — the land: the folds' beds, the rock bodies, the cave
// THE BEDS (core/terrain KSTRATA, the `ringfold` recipe: hard sandstone and limestone ridges, soft shales, opal-shell limestone
// and deep-red beds; PLAN.md section 2) folded about axes along the crest (z), the chevron's crest (`at`, phase 0) on the river
// cave's mouth so the cliff over it shows the beds bent round it (refs/26). One stack: the ground's steep faces, the arch, the
// bridges and the cave's hood all draw it (strataColor), and S.surface names the bed under any point for the kit and Godot.
// THE BODIES (core/terrain KSTACKS): the arch in the arch ridge's wind gap, and a natural bridge over each of the gorge's falls,
// every foot set on the ground as drawn. THE CAVE (core/terrain KCARVE): the hood over the mouth, meshed back from its patch.
// Host-only: no plant is placed here; the bodies are obstacles and registered volumes.
const STRATA=BIO.strata({recipe:'ringfold',seed:WORLD,range:[-300,700],dip:[.3,.95,.004],warp:[7,2],
 fold:{dir:[0,1],wl:1700,amp:150,sharp:.85,at:[BITE.x+BITE.r,BITE.z],phase:0},dust:0x7e7460,res:.25,private:true});
// the library's rock grain (materials.json rockDetail: rock.limestone.karst), sampled on three planes and multiplied in as a grey
// detail about its own mean; without the pack a KRAND grain of the same mean
function hostLib(n){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('swhighlands',n):null;if(!L)return null;
 const c=hostLib.c||(hostLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}));}
const ROCK_GRAIN=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=200+(KRAND.fbm(x/11,.3,y/11,3,71)-.5)*90+(KRAND.h3(x,y,1,72)-.5)*30;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const ROCK_LIB=hostLib('rockDetail');
const ROCK_MAT=(function(){const m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
 m.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uRG={value:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN};sh.uniforms.uRGs={value:ROCK_LIB?1/(ROCK_LIB.scale||[4,4])[0]:1/6};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aOcc;attribute float aSun;varying float vOcc;varying float vSun;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvOcc=aOcc;vSun=aSun;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRG;uniform float uRGs;varying float vOcc;varying float vSun;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 n=abs(normalize(vSWN));n/=n.x+n.y+n.z;',
    ' vec3 t=texture2D(uRG,vSWP.zy*uRGs).rgb*n.x+texture2D(uRG,vSWP.xz*uRGs).rgb*n.y+texture2D(uRG,vSWP.xy*uRGs).rgb*n.z;',
    ' float l=dot(t,vec3(0.333));vec3 sc=strataColor(vSWP,vSWN);sc=mix(vec3(dot(sc,vec3(0.333))),sc,0.5)*1.3;diffuseColor.rgb*=sc*clamp(pow(l/0.47,1.4),0.35,1.8)*(0.45+0.55*vOcc);}'].join('\n'))
   .replace('#include <lights_lambert_vertex>','#include <lights_lambert_vertex>');};
 m.customProgramCacheKey=()=>'swhi-rock';return m;})();
// every rock body: KSTACKS records, one mesh for all (walls, tops and the lintels' soffits)
const BODIES=[];
(function(){const gr=(x,z)=>terrainH(x,z);
 const mk=(o,tries)=>{for(let k=0;k<(tries||1);k++){try{return KSTACKS.make(Object.assign({},o,{rise:o.rise+k*4,H:o.H+k*4}));}catch(e){if(k===(tries||1)-1)reportErr('rock '+o.id+': '+e.message);}}return null;};
 // the arch: a hard bed left standing across the wind gap's col, its legs along the crest, the opening looking east-west
 const A=mk({kind:'arch',id:'arch',x:ARCH_X,z:ARCH_Z,span:18,rise:15,H:26,ry:Math.PI/2,ground:gr,seed:KRAND.hash(WORLD,1,41)},3);
 if(A){A.name='The arch';A.key='rock.arch';BODIES.push(A);}
 // the natural bridges: one over each fall of the gorge, 5 m below its lip, the opening as tall as the fall and 7 m more, the
 // legs on the gorge's walls (85% of the half-width at the opening's top), the lintel 8 m thick at the rim
 GORGE.falls.forEach((F,i)=>{const L=Math.hypot(F.dir[0],F.dir[1]),ux=F.dir[0]/L,uz=F.dir[1]/L,x=F.x+ux*5,z=F.z+uz*5;
  const rise=Math.max(12,F.top-terrainH(x,z)+7),half=5+rise/Math.tan(52*Math.PI/180),span=1.13*half;
  const B=mk({kind:'arch',id:'bridge'+(i+1),x,z,span,rise,H:rise+8,leg:span*.5,t:14,inward:.1,ry:Math.atan2(ux,-uz),ground:gr,seed:KRAND.hash(WORLD,2,i)},4);
  if(B){B.name=['The upper bridge','The middle bridge','The lower bridge'][i]||('Natural bridge '+(i+1));B.key='rock.bridge';B.fall=F;BODIES.push(B);}});
 // WEATHERING (the owner, 2026-10-26: the arch read as man-made): on the drawn mesh only, the lintel's two upper outer corners
 // worn round (a radius of about the lintel's thickness, in the opening's own frame), then every vertex moved by a KRAND noise
 // of 1.2 m at a 5 m grain (none at the feet, which stay on the ground as drawn). The records (KSTACKS.at, the obstacles) keep
 // the unweathered body: they differ from the drawn rock by at most ~1.5 m (KNOWN_ISSUES.md)
 function weather(B,m){const o=B.opening,ux=Math.cos(o.ry),uz=Math.sin(o.ry),n=m.pos.length/3,sd=B.seed>>>0;let Lh=0;
  for(let v=0;v<n;v++){const a=Math.abs((m.pos[3*v]-B.x)*ux+(m.pos[3*v+2]-B.z)*uz);if(a>Lh)Lh=a;}
  const top=B.top,R=Math.min(Lh*.55,Math.max(6,(top-o.y1)*1.9)),cx=Lh-R,cy=top-R;
  for(let v=0;v<n;v++){let x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2];const dx=x-B.x,dz=z-B.z,a=dx*ux+dz*uz,c=-dx*uz+dz*ux,aa=Math.abs(a);
   if(aa>cx&&y>cy){const d=Math.hypot(aa-cx,y-cy);if(d>R){const k=R/d,na=cx+(aa-cx)*k;y=cy+(y-cy)*k;const a2=Math.sign(a)*na;x=B.x+a2*ux-c*uz;z=B.z+a2*uz+c*ux;}}
   /* two grains: a 8 m lumpiness of 2.2 m (a weathered mass) and a 2 m pitting of .6 m */
   const foot=smooth(.5,4,y-terrainH(x,z)),A=2.2*foot,a2=.6*foot,f=.12,f2=.5,nz=(k,u,v,w)=>(KRAND.fbm(u,v,w,3,sd+k)-.5)*2;
   const x0=x,y0=y,z0=z;x+=A*nz(0,x0*f,y0*f,z0*f)+a2*nz(3,x0*f2,y0*f2,z0*f2);y+=A*.7*nz(1,x0*f+7,y0*f,z0*f)+a2*nz(4,x0*f2+7,y0*f2,z0*f2);z+=A*nz(2,x0*f,y0*f+3,z0*f)+a2*nz(5,x0*f2,y0*f2+3,z0*f2);
   m.pos[3*v]=x;m.pos[3*v+1]=y;m.pos[3*v+2]=z;}}
 const pos=[],uv=[],idx=[],occ=[],col=[];
 BODIES.forEach(B=>{const m=KSTACKS.mesh(B,{step:2.5}),o=pos.length/3;weather(B,m);
  for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);uv.push(m.uv[2*v],m.uv[2*v+1]);occ.push(.35+.65*m.occ[v]);col.push(1,1,1);}
  for(const i of m.idx)idx.push(o+i);
  OBSTACLES.push({x:B.x,z:B.z,r:Math.min(B.R,30)+2});
  REGISTER({name:B.name,key:B.key,kind:'rock',x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,30),h:B.top-B.y0});});
 if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('aOcc',new THREE.Float32BufferAttribute(occ,1));g.setAttribute('aSun',new THREE.Float32BufferAttribute(occ.map(()=>1),1));
  g.setIndex(idx);g.computeVertexNormals();const me=new THREE.Mesh(g,ROCK_MAT);me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel='Folded sandstone and limestone (the ring folds\' beds)';
  me.userData.probePoints=[].concat(...BODIES.map(B=>[B.x,(B.y0+B.top)/2,B.z]));   /* one sample a body: the probe reads a merged mesh by its points (core/host 95) */
  scene.add(me);}})();
// the cave's hood: the carve patch meshed back over the mouth (surface nets), in the same rock and beds
const CAVE_MESHES=(function(){const sd=new THREE.Vector3(SUN_POS[0],SUN_POS[1],SUN_POS[2]).normalize();let out=[];
 try{out=KCARVE.mesh(ROCK_MAT,{sun:[sd.x,sd.y,sd.z],ao:true,cast:'hood',gridNormals:true});}catch(e){reportErr('cave: '+e.stack);}
 out.forEach(m=>{const g=m.geometry,n=g.attributes.position.count,c=new Float32Array(n*3).fill(1);g.setAttribute('color',new THREE.BufferAttribute(c,3));
  m.userData.host=true;m.userData.rock=true;m.userData.inspectLabel='The river cave (its mouth in the limestone ridge)';scene.add(m);});
 REGISTER({name:'The river cave',key:'rock.cave',kind:'rock',x:CAVE.c[0]+CAVE.depth*.4,z:CAVE.c[1],y:BITE.floor-1,r:CAVE.hw+6,h:CAVE.h+12});
 return out;})();
