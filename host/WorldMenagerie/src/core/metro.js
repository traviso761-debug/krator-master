// ---------- a streamed metropolis round a detailed core ----------
// A city too big to load at once (Greater Tokyo: millions of buildings) is cut offline into 1 km tiles
// (tools/metro-tiler.py -> data/metro/<city>/). This loads them as the camera goes: every tile within C.metro.near of
// it is fetched and built in a Web Worker (src/core/metroworker.js) and wrapped here in meshes - the ground, the land
// cover, roads and rail and their decks, the buildings in the engine's facade styles, which light their windows at
// night with the core's - and a tile left far enough behind is thrown away. Beyond the near tiles, the tall buildings
// of every block out to C.metro.far stand as a skyline. The detailed core (the engine's own city) is left alone.
// Map data (c) OpenStreetMap contributors, ODbL.
export function metro(api){
  const {THREE,C,scene,animHooks,camera}=api;const K=C.metro;if(!K)return;
  const base=K.url||('data/metro/'+(C.city||api.ctx.defaultCity||'tokyo')+'/');
  const NEAR=K.near||2200,DROP=NEAR+900,FAR=K.far||26000,JOBS=K.jobs||2;
  const pal=C.palette||{},state={tiles:new Map(),sky:new Map(),busy:0,queue:[],man:null,loaded:0,built:0,errors:0};
  const worker=new Worker(new URL('./metroworker.js',import.meta.url));
  const mats={ground:new THREE.MeshLambertMaterial({vertexColors:true}),area:new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}),
    road:new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4,side:THREE.DoubleSide}),deck:new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),
    roof:new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),furn:new THREE.MeshLambertMaterial({vertexColors:true}),sign:new THREE.MeshLambertMaterial({vertexColors:true})};
  // the shop windows, the signs and the vending machines glow after dark
  {const glow={value:0.15};mats.sign.onBeforeCompile=sh=>{sh.uniforms.uGlow=glow;sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uGlow;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vColor.rgb*uGlow;');};
    mats.sign.customProgramCacheKey=()=>'metroSign';animHooks.push(()=>{if(api.nightF&&api.hour)glow.value=0.15+api.nightF(api.hour())*0.95;});}
  const matOf=k=>k.startsWith('w:')?(api.BLD_MATS&&api.BLD_MATS[k.slice(2)])||(api.BLD_MATS&&api.BLD_MATS.low):mats[k];
  let nextId=1;const pending=new Map();
  // the landmarks outside the core were stood on the core's ground (clamped at its edge); when the tile under one
  // arrives, the model goes down (or up) onto the tile's own ground, once
  const seated=new Set();
  // the ground anywhere: a tile's own where it is in hand, else the coarse one
  state.grounds=new Map();
  api.METRO_GH=(x,z)=>{const man=state.man;if(man){const S=man.tile,tx=Math.floor(x/S),tz=Math.floor(z/S),g=state.grounds.get(tx+','+tz);
      if(g){const G=man.grid,step=S/(G-1),fx=Math.min(G-1.001,(x-tx*S)/step),fz=Math.min(G-1.001,(z-tz*S)/step),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j;
        return ((g[j*G+i]*(1-u)+g[j*G+i+1]*u)*(1-v)+(g[(j+1)*G+i]*(1-u)+g[(j+1)*G+i+1]*u)*v)/10;}}
    return api.METRO_GROUND?api.METRO_GROUND(x,z):0;};
  function seat([tx,tz],g){const man=state.man;if(!man)return;const S=man.tile,G=man.grid,step=S/(G-1);
    for(const L of api.LANDMARKS||[]){if(seated.has(L)||!L.userData.info||!L.userData.info.at)continue;const x=L.position.x,z=L.position.z;if(Math.floor(x/S)!==tx||Math.floor(z/S)!==tz)continue;
      const fx=Math.min(G-1.001,(x-tx*S)/step),fz=Math.min(G-1.001,(z-tz*S)/step),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j;
      const h=((g[j*G+i]*(1-u)+g[j*G+i+1]*u)*(1-v)+(g[(j+1)*G+i]*(1-u)+g[(j+1)*G+i+1]*u)*v)/10;
      const [cs,cw,cn,ce]=man.core[0]||[0,0,0,0],la=man.origin[0]+(-z)/111132,lo=man.origin[1]+x/(111320*Math.cos(man.origin[0]*Math.PI/180));if(la>cs&&la<cn&&lo>cw&&lo<ce)continue;
      L.position.y=h;seated.add(L);}}
  worker.onmessage=e=>{const m=e.data,job=pending.get(m.id);pending.delete(m.id);state.busy--;if(m.error){state.errors++;if(job)job.fail&&job.fail();return;}if(m.ground&&m.tile){seat(m.tile,m.ground);state.grounds.set(m.tile[0]+','+m.tile[1],m.ground);}if(job)job.done(m.geo);};
  function post(msg,done,fail){const id=nextId++;pending.set(id,{done,fail});state.busy++;worker.postMessage(Object.assign({id},msg));}
  // meshes from what the worker sent: one a material a tile
  function meshes(geo,far){const out=[];if(geo._stats){const d=api.ctx.details.metroFronts=api.ctx.details.metroFronts||{};for(const k in geo._stats)if(k==='at'){if(!d.at)d.at=geo._stats.at;}else d[k]=(d[k]||0)+geo._stats[k];}for(const k in geo){if(k==='_lines'||k==='_stats')continue;const g=new THREE.BufferGeometry(),d=geo[k];g.setAttribute('position',new THREE.BufferAttribute(d.p,3));g.setAttribute('normal',new THREE.BufferAttribute(d.n,3));
      g.setAttribute('color',new THREE.BufferAttribute(d.c,3));if(d.u)g.setAttribute('uv',new THREE.BufferAttribute(d.u,2));g.computeBoundingSphere();
      const m=new THREE.Mesh(g,matOf(k));m.receiveShadow=true;m.castShadow=!far&&k.startsWith('w:');m.userData.metro=true;scene.add(m);out.push(m);}return out;}
  const drop=list=>{for(const m of list){scene.remove(m);m.geometry.dispose();}};

  fetch(base+'index.json').then(r=>r.json()).then(man=>{state.man=man;
    const styles=(api.FACADE_STYLES||[]).map(s=>({key:s.key,types:s.types?[...s.types]:null,minH:s.minH,maxH:s.maxH,share:s.share,salt:s.salt,bay:s.bay,floor:s.floor,colours:s.cols.map(c=>'#'+c.getHexString())}));
    worker.postMessage({cfg:{tile:man.tile,datum:man.datum,skylineBlock:man.skylineBlock,styles,brick:pal.brick||['#c8c0b4'],stone:pal.stone||['#e8e6e0'],
      // a landmark clears the streamed buildings round it (clear: [radius]) or along a path (clearPath: {line, radius})
      clears:[...(C.landmarks||[]).filter(l=>Array.isArray(l.clear)&&l.at).map(l=>[...api.P(l.at),l.clear[0]]),
        ...(C.landmarks||[]).filter(l=>l.clearPath).flatMap(l=>{const out=[],pts=l.clearPath.line.map(p=>api.P(p)),r=l.clearPath.radius||8;
          for(let i=0;i+1<pts.length;i++){const [ax,az]=pts[i],[bx,bz]=pts[i+1],n=Math.max(1,Math.ceil(Math.hypot(bx-ax,bz-az)/(r*0.8)));for(let k=0;k<=n;k++)out.push([ax+(bx-ax)*k/n,az+(bz-az)*k/n,r]);}return out;})],
      deckClears:(C.landmarks||[]).filter(l=>l.clearDecks&&l.at).map(l=>[...api.P(l.at),l.clearDecks]),bay:C.facade&&C.facade.bay?C.facade.bay*4:3.5,floor:C.facade&&C.facade.floor?C.facade.floor*4:3.6,ground:(C.terrainColours||{}).low}});
    // which tiles are in hand, one texel a tile: the far ground is cut away under them (its 250 m heights would show
    // through a tile's own ground on a slope)
    {let a=1e9,b=1e9,c=-1e9,d=-1e9;for(const [tx,tz] of man.tiles){a=Math.min(a,tx);b=Math.min(b,tz);c=Math.max(c,tx);d=Math.max(d,tz);}
      const w=c-a+1,h=d-b+1,tex=new THREE.DataTexture(new Uint8Array(w*h*4),w,h);tex.magFilter=tex.minFilter=THREE.NearestFilter;tex.needsUpdate=true;
      state.mask={x0:a,z0:b,w,h,tex,set(tx,tz,on){const i=((tz-b)*w+(tx-a))*4;tex.image.data[i]=on?255:0;tex.needsUpdate=true;}};}
    for(const [tx,tz,nb,tallest,core] of man.tiles)if(!core)state.tiles.set(tx+','+tz,{tx,tz,nb,cx:(tx+0.5)*man.tile,cz:(tz+0.5)*man.tile,meshes:null,loading:false});
    for(const [bx,bz] of man.skyline)state.sky.set(bx+','+bz,{bx,bz,cx:(bx+0.5)*man.skylineBlock,cz:(bz+0.5)*man.skylineBlock,meshes:null,loading:false});
    api.ctx.details=Object.assign(api.ctx.details||{},{metroTiles:state.tiles.size,metroSkylineBlocks:state.sky.size});
    return fetch(base+'ground.json.gz').then(r=>r.arrayBuffer()).then(b=>{const u=new Uint8Array(b);   // unzipped by the browser already, or not
      return u[0]===0x1f&&u[1]===0x8b?new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).json():JSON.parse(new TextDecoder().decode(u));}).then(farGround);})
    .catch(e=>{api.ctx.details=Object.assign(api.ctx.details||{},{metroError:String(e)});});

  // the far ground: one mesh for the whole region, every 250 m, city-grey where it is built up and greener where it is
  // not, the sea left open, the core left to the engine, a little low so the near tiles' own ground lies over it
  // the city carpet: from far off, a built-up place is an unbroken grain of small roofs and the streets between them;
  // a texture of it, laid over the far ground by world position and blended in as far as the place is built up
  function carpetTex(){const N=512,cv=document.createElement('canvas');cv.width=cv.height=N;const g=cv.getContext('2d');g.fillStyle='#8a8884';g.fillRect(0,0,N,N);
    let sd=7;const R=()=>{sd=(sd*16807)%2147483647;return sd/2147483647;};
    for(let by=0;by<N;by+=64)for(let bx=0;bx<N;bx+=64){const w=58-R()*8,h=58-R()*8;   // a block, its buildings packed in
      for(let k=0;k<26;k++){const x=bx+3+R()*(w-10),y=by+3+R()*(h-10),a=4+R()*12,b=4+R()*12,v=165+R()*70;g.fillStyle=`rgb(${v},${v-4-R()*8},${v-10-R()*12})`;g.fillRect(x,y,a,b);}}
    const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;}
  // the sea: one sheet at sea level over the whole region; the ground stands out of it
  function sea(man){const [s2,w2,n2,e2]=man.box,la0=man.origin[0],lo0=man.origin[1],ML=111132,MO=111320*Math.cos(la0*Math.PI/180),x0=(w2-lo0)*MO,x1=(e2-lo0)*MO,z0=-(n2-la0)*ML,z1=-(s2-la0)*ML;
    const g=new THREE.PlaneGeometry(x1-x0+20000,z1-z0+20000).rotateX(-Math.PI/2);const m=new THREE.Mesh(g,new THREE.MeshPhongMaterial({color:new THREE.Color(C.lakeColour||'#3c5a5c'),specular:0x2a3a3a,shininess:12}));
    m.position.set((x0+x1)/2,-man.datum-0.4,(z0+z1)/2);m.receiveShadow=false;m.userData.metro=true;scene.add(m);}
  // #nosea, #nofar in the address: for looking at what is under them
  function farGround(G){api.METRO_GROUND=(x,z)=>{const fx=Math.max(0,Math.min(G.nx-1.001,(x-G.x0)/G.step)),fz=Math.max(0,Math.min(G.nz-1.001,(z-G.z0)/G.step)),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,h=G.h,n=G.nx;
      return ((h[j*n+i]*(1-u)+h[j*n+i+1]*u)*(1-v)+(h[(j+1)*n+i]*(1-u)+h[(j+1)*n+i+1]*u)*v)/10;};
if(!/nosea/.test(api.HASH0||''))sea(state.man);if(/nofar/.test(api.HASH0||''))return;
    const pos=[],col=[],idx=[],dn=[],SEA=-state.man.datum+0.3,city=new THREE.Color('#8c8a84'),green=new THREE.Color('#6a7a52'),c=new THREE.Color();
    const [cs,cw,cn,ce]=(state.man.core[0]||[0,0,0,0]),la0=state.man.origin[0],lo0=state.man.origin[1],ML=111132,MO=111320*Math.cos(la0*Math.PI/180);
    const inCore=(x,z)=>{const la=la0-z/ML,lo=lo0+x/MO;return la>cs&&la<cn&&lo>cw&&lo<ce;};
    // the density comes a tile (1 km) at a time: blurred over ~1 km either way, the city fades into the fields instead of stepping
    const BD=new Float32Array(G.d.length),R2=4;{const tmp=new Float32Array(G.d.length);for(let j=0;j<G.nz;j++){let acc=0,n=0;for(let i=-R2;i<G.nx+R2;i++){if(i+R2<G.nx){acc+=G.d[j*G.nx+i+R2];n++;}if(i-R2-1>=0){acc-=G.d[j*G.nx+i-R2-1];n--;}if(i>=0&&i<G.nx)tmp[j*G.nx+i]=acc/n;}}
      for(let i=0;i<G.nx;i++){let acc=0,n=0;for(let j=-R2;j<G.nz+R2;j++){if(j+R2<G.nz){acc+=tmp[(j+R2)*G.nx+i];n++;}if(j-R2-1>=0){acc-=tmp[(j-R2-1)*G.nx+i];n--;}if(j>=0&&j<G.nz)BD[j*G.nx+i]=acc/n;}}}
    for(let j=0;j<G.nz;j++)for(let i=0;i<G.nx;i++){const k=j*G.nx+i,x=G.x0+i*G.step,z=G.z0+j*G.step,dd=Math.min(1,BD[k]/60);pos.push(x,G.h[k]/10-0.6,z);c.copy(green).lerp(city,dd);col.push(c.r,c.g,c.b);dn.push(dd);}
    for(let j=0;j+1<G.nz;j++)for(let i=0;i+1<G.nx;i++){const a=j*G.nx+i,b=a+1,d=a+G.nx,e=d+1;if(G.h[a]/10<SEA&&G.h[b]/10<SEA&&G.h[d]/10<SEA&&G.h[e]/10<SEA)continue;
      if(inCore(G.x0+(i+0.5)*G.step,G.z0+(j+0.5)*G.step))continue;idx.push(a,d,b,b,d,e);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
    g.setAttribute('dens',new THREE.Float32BufferAttribute(dn,1));
    const fm=new THREE.MeshLambertMaterial({vertexColors:true,map:carpetTex()});
    const MK=state.mask;fm.onBeforeCompile=sh=>{sh.uniforms.uMask={value:MK.tex};sh.uniforms.uMaskBox={value:new THREE.Vector4(MK.x0,MK.z0,MK.w,MK.h)};sh.uniforms.uTile={value:state.man.tile};sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float dens;varying float vDens;varying vec2 vCw;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvDens=dens;vCw=(modelMatrix*vec4(transformed,1.0)).xz/420.0;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vDens;varying vec2 vCw;uniform sampler2D uMask;uniform vec4 uMaskBox;uniform float uTile;').replace('void main() {','void main() {\n{vec2 tc=(floor(vCw*420.0/uTile)-uMaskBox.xy+0.5)/uMaskBox.zw;if(tc.x>0.0&&tc.y>0.0&&tc.x<1.0&&tc.y<1.0&&texture2D(uMask,tc).r>0.5)discard;}').replace('#include <map_fragment>','{vec2 q=vec2(vCw.x*0.8-vCw.y*0.6,vCw.x*0.6+vCw.y*0.8)*0.37;vec4 cp=mix(texture2D(map,vCw),texture2D(map,q+0.31),0.45);float nz=0.82+0.3*fract(sin(dot(floor(vCw*1.7),vec2(12.9898,78.233)))*43758.5453);cp.rgb*=nz;diffuseColor.rgb=mix(diffuseColor.rgb,cp.rgb,smoothstep(0.15,0.7,vDens));}');};
    fm.customProgramCacheKey=()=>'metroCarpet';
    const m=new THREE.Mesh(g,fm);m.receiveShadow=false;m.userData.metro=true;scene.add(m);api.ctx.details.metroFarGround=G.nx+'x'+G.nz;}
  // every so often: what the camera wants, nearest first; what it has left far behind, thrown away
  // the sky goes with the camera: across a region this size its far side would otherwise fall past the far plane
  animHooks.push(()=>{if(api.sky)api.sky.position.set(camera.position.x,0,camera.position.z);});
  let last=0;animHooks.push(now=>{if(!state.man||now-last<250)return;last=now;const cx=camera.position.x,cz=camera.position.z,man=state.man;
    const want=[];
    for(const t of state.tiles.values()){const d=Math.hypot(t.cx-cx,t.cz-cz);if(t.meshes&&d>DROP){drop(t.meshes);t.meshes=null;state.loaded--;state.mask.set(t.tx,t.tz,false);state.grounds.delete(t.tx+','+t.tz);if(api.METRO_LIFE)api.METRO_LIFE.drop(t.tx+','+t.tz);}else if(!t.meshes&&!t.loading&&d<NEAR)want.push([d,'t',t]);}
    for(const s of state.sky.values()){const d=Math.hypot(s.cx-cx,s.cz-cz);if(s.meshes){const v=d<FAR;for(const m of s.meshes)m.visible=v;}else if(!s.loading&&d<FAR)want.push([d+3000,'s',s]);}
    want.sort((a,b)=>a[0]-b[0]);
    for(const [,kind,o] of want){if(state.busy>=JOBS)break;o.loading=true;
      if(kind==='t')post({tile:[o.tx,o.tz],url:new URL(base+'t/'+o.tx+'_'+o.tz+'.json.gz',location.href).href},geo=>{o.loading=false;if(Math.hypot(o.cx-camera.position.x,o.cz-camera.position.z)>DROP)return;o.meshes=meshes(geo,false);state.mask.set(o.tx,o.tz,true);state.loaded++;state.built++;if(api.METRO_LIFE)api.METRO_LIFE.add(o.tx+','+o.tz,geo._lines||[]);},()=>{o.loading=false;o.failed=(o.failed||0)+1;});
      else post({sky:[o.bx,o.bz],url:new URL(base+'s/'+o.bx+'_'+o.bz+'.json.gz',location.href).href},geo=>{o.loading=false;o.meshes=meshes(geo,true);},()=>{o.loading=false;});}
    api.ctx.details.metroLoaded=state.loaded;api.ctx.details.metroBuilt=state.built;api.ctx.details.metroErrors=state.errors;});

  // the map: the tiles in hand, outlined
  (api.MAP_LAYERS||[]).push({draw(g,X,Z){if(!state.man)return;g.strokeStyle='rgba(216,64,46,.55)';g.lineWidth=1;const S=state.man.tile;for(const t of state.tiles.values())if(t.meshes)g.strokeRect(X(t.tx*S),Z(t.tz*S),X((t.tx+1)*S)-X(t.tx*S),Z((t.tz+1)*S)-Z(t.tz*S));}});
}
