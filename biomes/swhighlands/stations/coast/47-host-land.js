// ================================================================= HOST — the land: the beds, the sea arches and stacks, the fields (station 5, the fan coast)
// THE BEDS (core/terrain KSTRATA, the `ringfold` recipe: the scarp's thin, steep beds), drawn on the ground's steep faces and the arches.
// THE SEA ARCHES (refs/31): two, on the beach's headlands between the fans, each a KSTACKS 'arch' standing in the surf, its opening
// along the shore (the waves broke through a fin of the scarp's rock), worn (KSTACKS.weather); and four sea stacks off them (KSTACKS
// 'pillar', the arches' broken kin). THE FIELDS the kit reads (59c): scarp, fan, wadi, shore, slope; BIO.init here, once the rocks stand.
// ---------------------------------------------------------------- the host binding (first: the textures and the beds below need the host;
// the fields are filled in once the rocks stand, the mask reads them at call time)
const OBSTACLES=[],FIELD={};
const SPINE=[[coastX(-820)-60,-820],[coastX(20)-200,20],[coastX(760)-60,760],[coastX(1400)-200,1400],[coastX(-1450)-200,-1450],[-400,-300],[-800,900]];
BIO.init({tags:'swhighlands-coast',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:FIELD_BAKED,
 mask:(x,z)=>{if(x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;if(groundH(x,z)<.5)return 0;if(nearRock(x,z,1.5))return 0;
  return smooth(1.3,.9,FC.at(FC.a.slope,x,z));},
 obstacles:OBSTACLES,ticks:tick,seed:WORLD,register:REGISTER,origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
const STRATA=BIO.strata({recipe:'ringfold',seed:WORLD,range:[-200,1900],dip:[.55,1.2,.004],warp:[5,1.5],
 fold:{dir:[0,1],wl:900,amp:80,sharp:.75},dust:0x9a8a70,res:.25,private:true});
function hostLib(n,key){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed(key||'swhighlands',n):null;if(!L)return null;
 const c=hostLib.c||(hostLib.c={}),ck=(key||'')+'/'+n;return c[ck]||(c[ck]=KMAT.textures(L,{aniso:8}));}
const ROCK_GRAIN=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=200+(KRAND.fbm(x/11,.3,y/11,3,71)-.5)*90+(KRAND.h3(x,y,1,72)-.5)*30;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const ROCK_LIB=hostLib('rockDetail');
const ROCK_MAT=(function(){const m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
 m.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uRG={value:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN};sh.uniforms.uRGs={value:ROCK_LIB?1/(ROCK_LIB.scale||[6,6])[0]:1/6};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aOcc;varying float vOcc;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOcc=aOcc;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRG;uniform float uRGs;varying float vOcc;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 n=abs(normalize(vSWN));n/=n.x+n.y+n.z;',
    ' vec3 t=texture2D(uRG,vSWP.zy*uRGs).rgb*n.x+texture2D(uRG,vSWP.xz*uRGs).rgb*n.y+texture2D(uRG,vSWP.xy*uRGs).rgb*n.z;',
    ' float l=dot(t,vec3(0.333));vec3 sc=strataColor(vSWP,vSWN);sc=mix(vec3(dot(sc,vec3(0.333))),sc,0.6)*1.3;',
    ' sc*=mix(vec3(0.62,0.66,0.6),vec3(1.0),smoothstep(0.4,3.0,vSWP.y));',   /* the wet, weeded band at the foot, under the tide */
    ' diffuseColor.rgb*=sc*clamp(pow(l/0.47,1.4),0.35,1.8)*(0.45+0.55*vOcc);}'].join('\n'));};
 m.customProgramCacheKey=()=>'swhi-coast-rock';return m;})();
// ---------------------------------------------------------------- the arches and the stacks
const ROCKS=[];
const ROCK_IX=KSPACE.create({cell:40});
(function(){const gr=(x,z)=>groundH(x,z),strata=(x,y,z)=>{const a=STRATA.at(x,y,z);if(!a)return null;let h=.25;while(h<20){const q=STRATA.at(x,y+h,z);if(!q||q.bed!==a.bed)break;h+=.25;}return{h,hard:a.hard};};
 const arch=(o)=>{for(let k=0;k<4;k++){try{return KSTACKS.make(Object.assign({kind:'arch',ground:gr,inward:.12},o,{rise:o.rise+k*3,H:o.H+k*4}));}catch(e){if(k===3)reportErr(o.id+': '+e.message);}}return null;};
 [{id:'arch:north',z:-820,span:30,rise:20,H:34,t:9},{id:'arch:south',z:760,span:24,rise:16,H:28,t:8}].forEach((A,i)=>{const x=coastX(A.z)+14;
  const B=arch({id:A.id,x,z:A.z,span:A.span,rise:A.rise,H:A.H,t:A.t,leg:A.span*.4,ry:Math.PI/2,seed:KRAND.hash(WORLD,5,i)});   /* the opening along the shore */
  if(B){B.name='A sea arch';B.key='rock.arch.sea';B.isArch=true;ROCKS.push(B);}});
 [[-760,48,16,26],[-905,70,11,18],[700,40,13,22],[860,64,9,15]].forEach((s,i)=>{const z=s[0],x=coastX(z)+s[1];
  try{const B=KSTACKS.make({kind:'pillar',id:'stack:'+i,x,z,w:s[2],l:s[2]*.8,ry:KRAND.unit(KRAND.hash(WORLD,6,i))*Math.PI,H:s[3]+3,sq:3,taper:.1,lean:0,ground:gr,seed:KRAND.hash(WORLD,6,i,1),strata});
   B.name='A sea stack';B.key='rock.stack.sea';ROCKS.push(B);}catch(e){reportErr('stack '+i+': '+e.message);}});
 ROCKS.forEach(B=>ROCK_IX.insert(B,B.x,B.z,B.R));
 const pos=[],idx=[],occ=[],col=[];let tris=0;
 ROCKS.forEach(B=>{const m=KSTACKS.mesh(B,{step:2});if(B.isArch&&KSTACKS.archRound)KSTACKS.archRound(B,m);else if(KSTACKS.contour)KSTACKS.contour(B,m,{profile:.15,crown:.4});
  KSTACKS.weather(B,m,B.isArch?{ground:gr,amp:2.5,grain:.1,pit:1.2,pitGrain:.6,round:2}:{ground:gr,amp:2,grain:.12,pit:1,pitGrain:.7});const o=pos.length/3;
  for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);occ.push(.35+.65*m.occ[v]);col.push(1,1,1);}
  for(const i of m.idx)idx.push(o+i);tris+=m.idx.length/3;
  REGISTER({name:B.name,key:B.key,kind:'rock',x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,25),h:B.top-B.y0});OBSTACLES.push({x:B.x,z:B.z,r:B.R*.8});});
 window._rockTris=tris;
 if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setAttribute('aOcc',new THREE.Float32BufferAttribute(occ,1));g.setIndex(new THREE.Uint32BufferAttribute(idx,1));g.computeVertexNormals();
  const me=new THREE.Mesh(g,ROCK_MAT);me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel='The scarp\'s thin-bedded rock (the ringfold\'s beds, worn by the sea)';
  me.userData.probePoints=[].concat(...ROCKS.map(B=>[B.x,(B.y0+B.top)/2,B.z]));scene.add(me);}})();
const _rq=[];
function nearRock(x,z,m){ROCK_IX.query(x,z,0,_rq);for(const B of _rq)if(Math.hypot(x-B.x,z-B.z)<B.R+m)return B;return null;}
// ---------------------------------------------------------------- the climate fields (15 m lattice)
// scarp: the dry scarp and its ledges (land off the wadis and the fans); fan: a fan delta's surface over the sea; wadi: a wadi's floor and
// banks; shore: the beach and the platforms (land within 3 m of the sea's level near it); slope; north (+1 a sunny slope); wet, mist
const FC=(function(){const N=321,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,K=['h','slope','north','scarp','fan','wadi','shore','wet','mist'],a={};
 K.forEach(k=>a[k]=new Float32Array(N*N));const st=SX/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=groundH(TERR.X0+i*st,TERR.Z0+j*st);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,h=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*st),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*st);
  a.slope[k]=Math.hypot(hx,hz);a.north[k]=clamp(-hz/.3,-1,1);if(h<=.3)continue;
  const p=wadiPart(x,z),fan=p&&p.part==='fan'?clamp(p.active==null?1:.4+.6*p.active,0,1):0,wd=p&&p.part!=='fan'?1:0,n1=NZ(x,z,.003,351,2);
  a.fan[k]=fan;a.wadi[k]=wd;a.shore[k]=smooth(3.5,1,h)*smooth(160,30,coastX(z)-x)*(1-fan*.6);
  a.scarp[k]=clamp((1-fan)*(1-wd)*(1-a.shore[k]),0,1);
  a.wet[k]=clamp(.18+.25*wd+.12*smooth(3,0,h)+.08*n1,0,1);a.mist[k]=clamp(smooth(30,0,h)*.3,0,1);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
Object.assign(FIELD,{scarp:(x,z)=>FC.at(FC.a.scarp,x,z),fan:(x,z)=>FC.at(FC.a.fan,x,z),wadi:(x,z)=>FC.at(FC.a.wadi,x,z),shore:(x,z)=>FC.at(FC.a.shore,x,z),
 slope:(x,z)=>FC.at(FC.a.slope,x,z),north:(x,z)=>FC.at(FC.a.north,x,z),wet:(x,z)=>FC.at(FC.a.wet,x,z),mist:(x,z)=>FC.at(FC.a.mist,x,z),
 cold:()=>0,upland:()=>0,flow:()=>0,rock:(x,z)=>smooth(.75,1.2,FC.at(FC.a.slope,x,z)),salt:(x,z)=>smooth(6,0,groundH(x,z))});
function terrainH(x,z){return groundH(x,z);}
