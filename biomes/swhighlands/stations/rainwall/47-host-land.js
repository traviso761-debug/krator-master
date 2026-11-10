// ================================================================= HOST — the land: the beds and the fluted pinnacles (station 2, the rain wall)
// THE BEDS (core/terrain KSTRATA, the `ringfold` recipe as station 1's: hard sandstone and limestone, soft shales, opal-shell and
// deep-red beds) folded about axes along the crest; the ground's steep faces, the scar and the pinnacles draw one stack.
// THE FLUTED PINNACLES (refs/22: where the ridges' limestone meets 4 m of rain): a cluster of slim towers on the north wall over the
// avalanche's scar, each a KSTACKS 'pillar' laid on the beds (the strata hook), contoured to a spire (KSTACKS.contour, 37b) and worn
// (KSTACKS.weather: deep pits on a fine grain, the rain's flutes and solution pans). Host-only: no plant is placed here.
const STRATA=BIO.strata({recipe:'ringfold',seed:WORLD,range:[-400,1100],dip:[.3,.95,.004],warp:[7,2],
 fold:{dir:[0,1],wl:1600,amp:120,sharp:.7},dust:0x7e7460,res:.25,private:true});   /* the axes along the crest (north-south): the valley cuts across them */
function hostLib(n){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('swhighlands',n):null;if(!L)return null;
 const c=hostLib.c||(hostLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}));}
const ROCK_GRAIN=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=200+(KRAND.fbm(x/11,.3,y/11,3,71)-.5)*90+(KRAND.h3(x,y,1,72)-.5)*30;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const ROCK_LIB=hostLib('rockDetail');   /* materials.json: rock.limestone.karst */
const ROCK_MAT=(function(){const m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
 m.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uRG={value:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN};sh.uniforms.uRGs={value:ROCK_LIB?1/(ROCK_LIB.scale||[6,6])[0]:1/6};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aOcc;varying float vOcc;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOcc=aOcc;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRG;uniform float uRGs;varying float vOcc;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 n=abs(normalize(vSWN));n/=n.x+n.y+n.z;',
    ' vec3 t=texture2D(uRG,vSWP.zy*uRGs).rgb*n.x+texture2D(uRG,vSWP.xz*uRGs).rgb*n.y+texture2D(uRG,vSWP.xy*uRGs).rgb*n.z;',
    ' float wl=1.0-smoothstep(0.3,0.7,abs(normalize(vSWN).y));float fl=texture2D(uRG,vec2(dot(vSWP.xz,vec2(0.71,0.71))*0.05,vSWP.y*0.004)).r;t*=mix(1.0,0.62,smoothstep(0.45,0.7,fl)*wl);',   /* the rain's streaks down the walls */
    ' float l=dot(t,vec3(0.333));vec3 sc=strataColor(vSWP,vSWN);sc=mix(vec3(dot(sc,vec3(0.333))),sc,0.4)*1.3;diffuseColor.rgb*=sc*clamp(pow(l/0.47,1.4),0.35,1.8)*(0.45+0.55*vOcc);}'].join('\n'));};
 m.customProgramCacheKey=()=>'swhi-rain-rock';return m;})();
// ---------------------------------------------------------------- the pinnacles
const PINNACLES=[];
const PIN_IX=KSPACE.create({cell:40});
(function(){const gr=(x,z)=>terrainH(x,z),strata=(x,y,z)=>{const a=STRATA.at(x,y,z);if(!a)return null;let h=.25;while(h<30){const q=STRATA.at(x,y+h,z);if(!q||q.bed!==a.bed)break;h+=.25;}return{h,hard:a.hard};};
 // nine sites in a band along the north wall west of the scar's crown, each a KRAND draw by its slot (never by the draws before it)
 for(let i=0;i<9;i++){const u=k=>KRAND.unit(KRAND.hash(WORLD,i,k,0x91A)),x=-760+i*62+u(1)*30,z=-1180-u(2)*240,g=gr(x,z);
  if(scarK(x,z)>0||slopeAt(x,z)>1.4)continue;
  const H=24+u(3)*34,w=9+u(4)*7,l=w*(.7+.3*u(5));
  try{const B=KSTACKS.make({kind:'pillar',id:'pinnacle:'+i,x,z,w,l,ry:u(6)*Math.PI,H,sq:3,taper:.14+.08*u(7),lean:(u(8)-.5)*.08,ground:gr,seed:KRAND.hash(WORLD,i,0x91B),strata});
   B.name='A fluted limestone pinnacle';B.key='rock.pinnacle';PINNACLES.push(B);PIN_IX.insert(B,B.x,B.z,B.R);}catch(e){reportErr('pinnacle '+i+': '+e.message);}}
 const pos=[],idx=[],occ=[],col=[];let tris=0;
 PINNACLES.forEach(B=>{const m=KSTACKS.mesh(B,{step:2});if(KSTACKS.contour)KSTACKS.contour(B,m,{profile:.22,crown:.3});
  KSTACKS.weather(B,m,{ground:gr,amp:2.2,grain:.16,pit:1.5,pitGrain:1.1});const o=pos.length/3;
  for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);occ.push(.35+.65*m.occ[v]);col.push(1,1,1);}
  for(const i of m.idx)idx.push(o+i);tris+=m.idx.length/3;
  REGISTER({name:B.name,key:B.key,kind:'rock',x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,20),h:B.top-B.y0});
  OBSTACLES.push({x:B.x,z:B.z,r:B.R*.8});});
 window._pinnacleTris=tris;
 if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
  g.setAttribute('aOcc',new THREE.Float32BufferAttribute(occ,1));g.setIndex(new THREE.Uint32BufferAttribute(idx,1));g.computeVertexNormals();
  const me=new THREE.Mesh(g,ROCK_MAT);me.userData.host=true;me.userData.rock=true;me.userData.inspectLabel='Fluted pinnacles (the ringfold\'s limestone under the rain wall)';
  me.userData.probePoints=[].concat(...PINNACLES.map(B=>[B.x,(B.y0+B.top)/2,B.z]));scene.add(me);}})();
const _pq=[];
function nearPinnacle(x,z,m){PIN_IX.query(x,z,0,_pq);for(const B of _pq){if(Math.hypot(x-B.x,z-B.z)<B.R+m)return B;}return null;}
