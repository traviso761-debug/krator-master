// ================================================================= HOST — the land: the kit's layout, the height, the water, the fields, the meshes, the binding
// The kit lays out the rock (46: NECANYONS.lay) on the floor; the height is then the rock's top over a body and the floor
// elsewhere: the same KSTACKS functions the rock's mesh is made from, so a plant's foot is on the drawn rock.
// Another world reads this fragment in place (settlements/pinnacle-rock) and says what differs in a LAND object its host
// stage defines: {capY, spine (the LOD origins), tags, creek:false (no creek ribbon), clear:(x,z)=>0..1 (cleared ground:
// the hyperjungle thinned by it)}. Without one, this page's own values.
const LANDO=typeof LAND==='undefined'?{}:LAND;
NECANYONS.lay({bodies:ROCK,floor:floorH,R:TERR.R,capY:LANDO.capY==null?330:LANDO.capY,cell:5,seed:7});
_mark('layout');
const _tm={x:NaN,z:NaN,h:0};
// the TALUS: the floor rises against a wall's foot, the rock's fall and sand banked up (the wall goes down into it)
const talus=(x,z)=>{const fd=NECANYONS.footD(x,z);return fd<60?18*Math.pow(smooth(55,0,fd),1.6)*(.75+.5*fbm(x*.012,z*.012,44,2)):0;};
const groundH=(x,z)=>floorH(x,z)+talus(x,z);
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const t=NECANYONS.top(x,z),h=t>-1e8?t:groundH(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the water: the creek (its bed + depth) and the rain pools on the caps
const creekBed=z=>floorH(CREEK.x(z),z);
function waterH(x,z){if(creekD(x,z)<CREEK.w*1.3)return creekBed(z)+CREEK.depth;const p=NECANYONS.potholeAt(x,z);return p?p.y:-1e9;}

// ---------------------------------------------------------------- the fields (biomes/WORLD.md): wet, flow, rock, upland, slope
// read off the kit's zones (46); the kit reads its own zones directly (NECANYONS.at)
const WET={floor:1,foot:.92,wall:.9,ledge:.85,rim:.4,bench:.55,cap:.2,stack:.3};
const FIELD={
 wet:(x,z)=>{const Z=NECANYONS.at(x,z);return clamp(WET[Z.zone]+.3*Z.seep,0,1);},
 flow:(x,z)=>smooth(CREEK.w+26,CREEK.w+2,creekD(x,z)),
 rock:(x,z)=>{const Z=NECANYONS.at(x,z);return Z.rock?(Z.zone==='bench'?.55:.85):smooth(30,0,Z.footD)*.6;},
 upland:(x,z)=>clamp(terrainH(x,z)/450,0,1),
 slope:(x,z)=>0,cold:(x,z)=>0,mist:(x,z)=>0};

// ---------------------------------------------------------------- the host binding (before the meshes: their painters and records need it)
// THE MASK is swapped per kit by the build (88): this kit roots anywhere out of the water (its zones keep each plant to
// its place); the hyperjungle only on the floor, off the walls' feet and the creek, thinning northward toward Korona
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
const jungleMask=(x,z)=>{if(NECANYONS.rockAt(x,z))return 0;const fd=NECANYONS.footD(x,z);if(fd<28)return 0;
 return smooth(28,60,fd)*smooth(CREEK.w+10,CREEK.w+40,creekD(x,z))*(.55+.45*smooth(-1400,600,z))*waterMask(x,z)*(LANDO.clear?LANDO.clear(x,z):1);};
let MASK=waterMask;
// the LOD spine: the middle, the bodies, the creek
const SPINE=LANDO.spine||[[0,0],[300,0],[-60,560],[CREEK.x(400),400]];
BIO.init({tags:LANDO.tags||'necanyons',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:83,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:420,mid:950,far:2400,floor:[260,650]}});
BIO.setSun(SUN_POS);

// ---------------------------------------------------------------- the library layers (or procedural without the pack)
const LIB=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return {};const o={};
 ['ground.litter','ground.talus','ground.sand','rock.wall','rock.stack','rock.top'].forEach(k=>{const P=KMAT.packed('necanyons',k);
  if(P)o[k]=Object.assign({scale:P.scale[0]},KMAT.textures(P,{aniso:8}));});return o;})();
const greyTex=(fn,S)=>BIO.canvasTex(S||256,S||256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=clamp(fn(x,y,w,h),0,255);d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}g.putImageData(id,0,0);},true);
const PROC={
 'ground.litter':greyTex((x,y)=>150+50*(fbm(x/7,y/7,3,2)-.5)+30*(BIO.fn.h3(x,y,4)-.5)),
 'ground.talus':greyTex((x,y)=>165+40*(fbm(x/11,y/11,5,2)-.5)+40*(BIO.fn.h3(x,y,6)-.5)),
 'ground.sand':greyTex((x,y)=>185+20*(fbm(x/5,y/5,8,2)-.5)+30*(BIO.fn.h3(x,y,9)-.5)),
 'rock.wall':greyTex((x,y,w,h)=>175+28*(fbm(x/40,y/6,10,3)-.5)-40*Math.pow(fbm(x/14,y/90,11,2),3)+12*(BIO.fn.h3(x,y,12)-.5)),
 'rock.stack':greyTex((x,y,w,h)=>180+30*Math.sin(y/9+fbm(x/30,y/30,13,2)*5)+12*(BIO.fn.h3(x,y,14)-.5)),
 'rock.top':greyTex((x,y)=>185+26*(fbm(x/12,y/12,15,3)-.5)-60*smooth(.62,.7,fbm(x/24,y/24,16,2))+10*(BIO.fn.h3(x,y,17)-.5))};
// the scale (m per tile) and the map of a layer; a library map carries its own colour, a procedural one is grey and tinted
const layer=k=>LIB[k]?{map:LIB[k].map,normalMap:LIB[k].normalMap||null,roughnessMap:LIB[k].roughnessMap||null,s:LIB[k].scale,lib:true}:
 {map:PROC[k],normalMap:null,roughnessMap:null,s:{'ground.litter':3,'ground.talus':2.6,'ground.sand':2,'rock.wall':20,'rock.stack':12,'rock.top':4}[k],lib:false};
['ground.litter','ground.talus','ground.sand','rock.wall','rock.stack','rock.top'].forEach(k=>{const t=layer(k).map;if(t){t.wrapS=t.wrapT=THREE.RepeatWrapping;}});

// ---------------------------------------------------------------- the floor (one mesh: litter, talus at the walls' feet, sand by the creek)
const MAT_GROUND=new THREE.MeshLambertMaterial({color:0xffffff});
{const Lt=layer('ground.litter'),Lr=layer('ground.talus'),Ls=layer('ground.sand');
 MAT_GROUND.onBeforeCompile=sh=>{sh.uniforms.uL={value:Lt.map};sh.uniforms.uR={value:Lr.map};sh.uniforms.uS={value:Ls.map};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aW;varying vec3 vW;varying vec3 vGWP;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGWP=(modelMatrix*vec4(transformed,1.0)).xyz;vW=aW;');
  const col=(lib,hex)=>{if(lib)return'vec3(1.0)';const c=new THREE.Color(hex).convertSRGBToLinear();return'vec3('+[c.r,c.g,c.b].map(v=>(v*1.6).toFixed(4)).join(',')+')';};
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uL,uR,uS;varying vec3 vW;varying vec3 vGWP;')
   .replace('#include <map_fragment>',['{vec2 p=vGWP.xz;',
    'vec3 lt=pow(texture2D(uL,p/'+Lt.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Lt.lib,0x3a3020)+';',
    'vec3 rd=pow(texture2D(uR,p/'+Lr.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Lr.lib,0x8a5236)+';',
    'vec3 sd=pow(texture2D(uS,p/'+Ls.s.toFixed(2)+').rgb,vec3(2.2))*'+col(Ls.lib,0xa87a5a)+';',
    'vec3 c=mix(lt*0.42,rd*0.8,vW.x);c=mix(c,sd*0.75,vW.y);diffuseColor.rgb*=c*vW.z;}'].join('\n'));};
 MAT_GROUND.customProgramCacheKey=()=>'necanyons-ground';}
(function(){const N=220,S=TERR.R*2.2,g=new THREE.PlaneGeometry(S,S,N,N);g.rotateX(-Math.PI/2);
 const p=g.attributes.position,w=new Float32Array(p.count*3);
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,groundH(x,z));const fd=NECANYONS.footD(x,z),cd=creekD(x,z);
  w[3*i]=smooth(48,4,fd)*(.7+.3*fbm(x*.02,z*.02,41,2));w[3*i+1]=smooth(CREEK.w+16,CREEK.w+2,cd);w[3*i+2]=.85+.3*fbm(x*.006,z*.006,42,2);}
 g.setAttribute('aW',new THREE.BufferAttribute(w,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_GROUND);m.userData.probeSkip=true;m.userData.inspectLabel='The canyon floor';m.userData.host=true;scene.add(m);})();

// ---------------------------------------------------------------- the rock (KSTACKS meshes): three meshes, by material
// walls of the mesas, buttes and towers (desert varnish), walls of the stacks (cross-bedded), and every top (slickrock).
// Vertex colours: the beds' banding (brick, salmon, buff) and the notch's shade; a bench's top reddened by its soil.
const ROCK_GEOS=[];
(function(){const SMALL={spire:1,fin:1,balanced:1},Lw=layer('rock.wall'),Lk=layer('rock.stack'),Lt=layer('rock.top');
 const BAND=[0xa8503a,0xc98468,0xd9b091,0xb4603e].map(h=>new THREE.Color(h)),WHITE=new THREE.Color(0xffffff),TOPC=new THREE.Color(0xc9906e),SOIL=new THREE.Color(0x9c5a40),c=new THREE.Color();
 const acc={wall:{pos:[],uv:[],col:[],idx:[]},stack:{pos:[],uv:[],col:[],idx:[]},top:{pos:[],uv:[],col:[],idx:[]}};
 ROCK.forEach(B=>{const small=!!SMALL[B.kind],m=KSTACKS.mesh(B,{step:small?2.5:6}),nv=m.part.length;
  const remap={wall:new Int32Array(nv).fill(-1),stack:null,top:new Int32Array(nv).fill(-1)};
  const wk=small?'stack':'wall',Lw2=small?Lk:Lw;remap[wk]=remap.wall;
  for(let i=0;i<m.idx.length;i+=3){const a=m.idx[i],part=m.part[a],key=part===1?'top':wk,A=acc[key],R=remap[key==='top'?'top':wk];
   for(let k=0;k<3;k++){const v=m.idx[i+k];if(R[v]<0){R[v]=A.pos.length/3;const x=m.pos[3*v],y=m.pos[3*v+1],z=m.pos[3*v+2],b=B.beds[m.bed[v]];
     A.pos.push(x,y,z);
     if(key==='top'){A.uv.push(m.uv[2*v]/Lt.s,m.uv[2*v+1]/Lt.s);const bench=!small&&y<NECANYONS.capY();
      c.copy(Lt.lib?WHITE:TOPC).lerp(SOIL,bench?.35+.3*fbm(x*.01,z*.01,43,2):.05);}
     else{A.uv.push(m.uv[2*v]/Lw2.s,m.uv[2*v+1]/Lw2.s);const h=KRAND.hash(B.seed,b.k,77)%4;
      c.copy(Lw2.lib?WHITE:BAND[h]).lerp(BAND[h],Lw2.lib?(small?.05:.1):0).multiplyScalar(small?.82+.18*m.occ[v]:.62+.38*m.occ[v]);}
     A.col.push(c.r,c.g,c.b);}
    A.idx.push(R[v]);}}
  REGISTER({name:B.name||B.id,key:'rock.'+B.kind,x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,small?B.R:B.R*.8),h:B.top-B.y0});});
 const mk=(A,L,label)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(A.pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(A.uv,2));
  const cl=new THREE.Float32BufferAttribute(A.col,3);for(let i=0;i<cl.count;i++){c.setRGB(cl.getX(i),cl.getY(i),cl.getZ(i)).convertSRGBToLinear();cl.setXYZ(i,c.r,c.g,c.b);}
  g.setAttribute('color',cl);g.setIndex(A.idx);g.computeVertexNormals();
  const mat=new THREE.MeshStandardMaterial({map:L.map,normalMap:L.normalMap,roughnessMap:L.roughnessMap,roughness:1,metalness:0,vertexColors:true});
  const me=new THREE.Mesh(g,mat);me.userData.inspectLabel=label;me.userData.host=true;me.userData.rock=true;scene.add(me);ROCK_GEOS.push(g);return me;};
 // one anchor per body at its middle (an invisible instance): the rock is three merged meshes, so the probe's samples
 // (a mesh's box centre) would leave each body's registered volume to whatever grows on it
 {const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),ROCK.length),M4=new THREE.Matrix4();
  ROCK.forEach((B,i)=>{M4.makeTranslation(B.x,(B.y0+B.top)/2,B.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='rock anchors';A.frustumCulled=false;scene.add(A);}
 mk(acc.wall,Lw,'Red sandstone (a mesa\'s wall, streaked with desert varnish)');mk(acc.stack,Lk,'Red sandstone (a stack, cross-bedded)');mk(acc.top,Lt,'Slickrock (a top: bare sandstone, black crust, lichen)');})();

// ---------------------------------------------------------------- the water: the creek's ribbon and the rain pools
const MAT_WATER=new THREE.MeshStandardMaterial({color:0x2a3a34,roughness:.08,metalness:.3,transparent:true,opacity:.88});
(function(){const pos=[];if(LANDO.creek!==false)for(let z=-TERR.R*1.1;z<TERR.R*1.1;z+=20){const a=[CREEK.x(z),z],b=[CREEK.x(z+20),z+20],ya=creekBed(a[1])+CREEK.depth,yb=creekBed(b[1])+CREEK.depth,w=CREEK.w;
  pos.push(a[0]-w,ya,a[1],b[0]-w,yb,b[1],b[0]+w,yb,b[1],a[0]-w,ya,a[1],b[0]+w,yb,b[1],a[0]+w,ya,a[1]);}
 const P=NECANYONS.POTHOLES;P.forEach(p=>{const n=14;for(let k=0;k<n;k++){const a0=-k/n*TAU,a1=-(k+1)/n*TAU;pos.push(p.x,p.y,p.z,p.x+Math.cos(a0)*p.r,p.y,p.z+Math.sin(a0)*p.r,p.x+Math.cos(a1)*p.r,p.y,p.z+Math.sin(a1)*p.r);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
 const m=new THREE.Mesh(g,MAT_WATER);m.material.side=THREE.DoubleSide;m.userData.probeSkip=true;m.userData.inspectLabel='Water (the creek; a rain pool on the slickrock)';scene.add(m);})();
_mark('meshes');

