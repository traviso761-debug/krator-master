// ================================================================= OPEN WORLD — caverns drawn: the tubes streamed under the ground  [web]
// The region's tubes (SITE_SPEC.tubes, planned by 42k-world-caverns.js: WTUBES) drawn with core/terrain's KCAVERN near the camera,
// square by square (128 m columns, each in its own frame), never the whole route at once; the same pattern as biomes/opalvalley's
// walk-in adit (85w), carried over the streamed ground:
// - THE GROUND OPENS only at the plan's openings: the terrain's finest chunks (2 m) drop their triangles wholly inside a hole as
//   they are built, and the cavern meshes the ground inside each hole's rim on the drawn ground's own triangles (WTUBES.drawnGround),
//   with the terrain's own material, its rim sunk a hand so the terrain's straddling triangles lie on top. Nowhere else.
// - THE ROCK: KCAVERN.drawRock's merged meshes, the Twins kit's titanium basalt (its rockFace map, triplanar on the square's own
//   frame, whose 128 m hold 16 of its 8 m repeats), the glazed lining low on the walls and the oxidised breakdown above
//   (KCAVERN's weights), white drip lines, the guides' gold lichen where daylight reaches (biomes/twins/PLAN.md 5.2); lit by the
//   sky only near an opening, and inside by the walker's lamp; deeper in, the haze turns to the tube's dark.
// - THE WALKER (core/world 90's G) keeps to the ground, goes down a portal's ramp onto the tube's floor, along it, and out at the
//   next opening; the tube's walls stop it. Flying, the camera stays in a tube it is in. The pick reaches the rock (the inspector
//   names the tube). All of it by wrapping 90's CAM.update and 81's TERRAIN.meshes, so neither file changes.
// ?tubes=0: none of it. window._tubes: the plan, its checks, the streaming's stats and the verify's hooks.
var TUBES_DRAW=null;LATE.push(()=>{TUBES_DRAW=(function(){'use strict';
if(typeof SITE_SPEC==='undefined'||!SITE_SPEC.tubes||!SITE_SPEC.tubes.length||typeof WTUBES==='undefined'||typeof KCAVERN==='undefined')return null;
if(new URLSearchParams(location.search).get('tubes')==='0')return null;
const scene=HOST.scene,camera=HOST.camera,THR=THREE,S0={squares:0,built:0,tris:0,ms:0,queue:0,cut:0,cutChunks:0,under:false,lastMs:0};
const LEAF=TERRAIN.ROOT/Math.pow(2,TERRAIN.MAXL),DS=LEAF/TERRAIN.NSEG;
const GD=WTUBES.drawnGround(WORLD.H,{ds:DS,minWave:DS*1.5});   /* the terrain's finest chunks as drawn (81: minWave 1.5 spacings) */
const t0=performance.now();
const P=WTUBES.plan(SITE_SPEC.tubes,{ground:GD,fromPx:WORLD.fromPx,seed:SITE_SPEC.world==null?1:SITE_SPEC.world,wet:WORLD.water});
S0.planMs=Math.round(performance.now()-t0);
const SQ=WTUBES.squares(P),SZ=P.square,HOLES=[];P.tubes.forEach(T=>T.open.forEach(O=>O.holes.forEach(H=>HOLES.push({x:H[0],z:H[1],r:H[2],R:H[2]+O.rim,O,T,g:GD(H[0],H[1])}))));
const clamp=(v,a,b)=>v<a?a:v>b?b:v,sstep=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
// ---------------------------------------------------------------- the rock's material
const PACK=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('twins','rockFace'):null;
const RTEX=PACK?KMAT.textures(PACK,{aniso:4}).map:null;
const LAMP={value:0},WHITE=new THR.DataTexture(new Uint8Array([255,255,255,255]),1,1,THR.RGBAFormat);WHITE.needsUpdate=true;
const ROCK=new THR.MeshStandardMaterial({vertexColors:true,roughness:.93,metalness:0});
ROCK.onBeforeCompile=sh=>{sh.uniforms.uLamp=LAMP;sh.uniforms.uRock={value:RTEX||WHITE};sh.uniforms.uRockK={value:RTEX?1.9:1};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aSky;attribute float aLin;attribute float aCr;attribute float aLich;varying float vSky;varying float vLin;varying float vCr;varying float vLich;varying vec3 vTP;varying vec3 vTN;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvSky=aSky;vLin=aLin;vCr=aCr;vLich=aLich;vTP=position;vTN=normal;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uLamp;uniform sampler2D uRock;uniform float uRockK;varying float vSky;varying float vLin;varying float vCr;varying float vLich;varying vec3 vTP;varying vec3 vTN;')
  .replace('#include <color_fragment>',['#include <color_fragment>',
   '{vec3 bw=pow(abs(normalize(vTN)),vec3(4.0));bw/=bw.x+bw.y+bw.z;',
   /* the map is sRGB, sampled raw from a uniform: decoded by pow( in the same line (8 m and 2 m, blended) */
   ' vec3 tx=pow((texture2D(uRock,vTP.zy/8.0).rgb*bw.x+texture2D(uRock,vTP.xz/8.0).rgb*bw.y+texture2D(uRock,vTP.xy/8.0).rgb*bw.z)*.65+(texture2D(uRock,vTP.zy/2.0+.37).rgb*bw.x+texture2D(uRock,vTP.xz/2.0+.37).rgb*bw.y+texture2D(uRock,vTP.xy/2.0+.37).rgb*bw.z)*.35,vec3(2.2))*uRockK;',
   ' vec3 brk=vec3(.34,.27,.22),lin=vec3(.10,.085,.075),cr=vec3(.58,.56,.52),li=vec3(.60,.50,.20);',
   ' vec3 c=mix(brk,lin,vLin)*tx;c=mix(c,cr*tx*1.6,vCr);c=mix(c,li*(.5+.5*tx.g),vLich*.7);',
   ' diffuseColor.rgb*=c*1.35;}'].join('\n'))
  .replace('#include <lights_fragment_end>',['#include <lights_fragment_end>',
   'reflectedLight.directDiffuse*=max(vSky,.03);reflectedLight.directSpecular*=vSky;reflectedLight.indirectDiffuse*=mix(.07,1.,vSky);reflectedLight.indirectSpecular*=vSky;',
   'if(uLamp>0.0){float ld=length(vViewPosition);totalEmissiveRadiance+=diffuseColor.rgb*vec3(1.0,.8,.58)*uLamp*max(dot(normal,vViewPosition/ld),0.0)/(1.0+ld*ld*.012);}'].join('\n'));};
ROCK.customProgramCacheKey=()=>'world-tube-rock';
// ---------------------------------------------------------------- one square: meshed a few chunks a frame, then drawn
const ST=new Map();let frame=0;
const seedDrip=KRAND.child(P.seed,'tubes/drip'),seedLich=KRAND.child(P.seed,'tubes/lichen');
function holesNear(x,z,r){return HOLES.filter(H=>Math.abs(H.x-x)<r&&Math.abs(H.z-z)<r);}
function skyAt(H,x,y,z){let s=0;for(const h of H){const d=Math.hypot(x-h.x,z-h.z,Math.max(0,h.g-y)*.8);s=Math.max(s,1-sstep(h.r*.5,h.r+75,d));}return s;}
function start(key){const C=WTUBES.cavern(P,key);if(!C)return null;
 const q={key,C,todo:C.own.slice(),meshed:new Map(),group:null,used:frame,tris:0,ms:0,H:holesNear(C.origin[0]+SZ/2,C.origin[2]+SZ/2,SZ/2+380)};ST.set(key,q);S0.squares=ST.size;return q;}
/* the lip: rock within a hand of the ground's surface (the top of a hole's wall, a mouth's floor) is drawn as the ground, the soil
   over the rock, so the hole's edge is one line and not the lattice's teeth */
function lip(q,ch){const ox=q.C.origin[0],oz=q.C.origin[2];for(let v=0;v<ch.prim.length;v++){if(ch.prim[v]===65535)continue;
 const y=ch.pos[v*3+1];if(GD(ch.pos[v*3]+ox,ch.pos[v*3+2]+oz)-y<.9)ch.prim[v]=65535;}return ch;}
function work(q,budget){const t=performance.now();while(q.todo.length&&performance.now()-t<budget){const k=q.todo.shift();q.meshed.set(k,lip(q,q.C.meshChunk(k)));}
 q.ms+=performance.now()-t;if(!q.todo.length&&!q.group)finish(q);}
const _P={},_F={},_C=[0,0,0,0],G=65535;
function finish(q){const t=performance.now(),C=q.C,ox=C.origin[0],oz=C.origin[2],H=q.H;
 const src={chunks:C.own,meshChunk:k=>q.meshed.get(k)};
 const tube=WTUBES.floorAt(P,ox+SZ/2,oz+SZ/2,true)||{T:P.tubes[(SQ.get(q.key).items[0]||{t:0}).t]};
 const R=KCAVERN.drawRock(src,{THREE:THR,material:ROCK,tile:64,ground:'drop',attrs:['aSky','aLin','aCr','aLich'],label:'Lava tube: '+tube.T.name+' (titanium basalt)',name:'tube '+q.key,
  color:oc=>{const v=.38+.62*oc;return [v,v*.98,v*.95];},
  weight:(x,y,z,nx,ny,nz,ch,i,out)=>{const X=x+ox,Z=z+oz,sky=skyAt(H,X,y,Z);out[0]=sky;out[1]=ch.w[i*4];
   const dl=Math.abs(KRAND.vnoise(X/1.3,y/40,Z/1.3,seedDrip)-.5);out[2]=(1-sstep(.01,.03,dl))*(1-sstep(.2,.6,ny))*.35;
   out[3]=sky>.08?sstep(.55,.75,KRAND.fbm(X/3,y/3,Z/3,2,seedLich))*sstep(.08,.35,sky)*(1-sstep(.4,.9,sky))*(1-Math.max(0,-ny)):0;}});
 // the ground inside the holes' rims, on the terrain's material and attributes (81's buildChunk, per vertex)
 const pos=[],nrm=[],col=[],rock=[],road=[],duv=[],ovk=[],ovb=[],idx=[],ox4=Math.floor(ox/4096)*4096,oz4=Math.floor(oz/4096)*4096;
 for(const k of C.own){const ch=q.meshed.get(k);if(!ch||!ch.idx.length)continue;const map=new Int32Array(ch.pos.length/3).fill(-1);
  for(let t2=0;t2<ch.idx.length;t2+=3){const a=ch.idx[t2],b=ch.idx[t2+1],c=ch.idx[t2+2];if(ch.prim[a]!==G&&ch.prim[b]!==G&&ch.prim[c]!==G)continue;
   for(const v of [a,b,c]){if(map[v]<0){map[v]=pos.length/3;const x=ch.pos[v*3],z=ch.pos[v*3+2],X=x+ox,Z=z+oz,ny=ch.nrm[v*3+1];
     let kk=1e9;for(const h of H)kk=Math.min(kk,Math.hypot(X-h.x,Z-h.z)-h.R);const y=ch.pos[v*3+1]-.3*sstep(-3,1,kk);
     pos.push(x,y,z);nrm.push(ch.nrm[v*3],ny,ch.nrm[v*3+2]);
     const h=WORLD.Hp(X,Z,DS*1.5,_P),tan=Math.sqrt(Math.max(0,1-ny*ny))/Math.max(.05,ny),F=WORLD.fieldsFrom(X,Z,h,tan,_P,_F);WORLD.ground(X,Z,F,_C);
     col.push(_C[0],_C[1],_C[2]);rock.push(_C[3]);road.push(WORLD.roadCover(X,Z,DS));duv.push(X-ox4,Z-oz4);
     const ck=WORLD.classColour(X,Z),cb=WORLD.biomeColour(X,Z);ovk.push(ck[0],ck[1],ck[2]);ovb.push(cb[0],cb[1],cb[2]);}
    idx.push(map[v]);}}}
 const grp=R.group;grp.position.set(ox,0,oz);grp.updateMatrixWorld(true);
 grp.children.forEach(m=>{m.userData.tube=tube.T.id;m.userData.probeSkip=true;m.matrixAutoUpdate=false;m.updateMatrix();});
 if(idx.length){const g=new THR.BufferGeometry(),f3=(a,n)=>new THR.Float32BufferAttribute(a,n);
  g.setAttribute('position',f3(pos,3));g.setAttribute('normal',f3(nrm,3));g.setAttribute('color',f3(col,3));g.setAttribute('aRock',f3(rock,1));g.setAttribute('aRoad',f3(road,1));
  g.setAttribute('aDUV',f3(duv,2));g.setAttribute('aOvK',f3(ovk,3));g.setAttribute('aOvB',f3(ovb,3));g.setIndex(idx);g.computeBoundingSphere();
  const m=new THR.Mesh(g,TERRAIN.MAT);m.name='tube ground '+q.key;m.userData.inspectLabel='ground';m.userData.tubeGround=true;m.userData.tube=tube.T.id;
  m.matrixAutoUpdate=false;m.updateMatrix();grp.add(m);}
 grp.updateMatrixWorld(true);scene.add(grp);q.group=grp;q.tris=R.tris+idx.length/3;q.meshed.clear();
 q.ms+=performance.now()-t;S0.built++;S0.tris+=q.tris;S0.ms+=q.ms;S0.lastMs=Math.round(q.ms);}
function drop(q){if(q.group){scene.remove(q.group);q.group.traverse(o=>{if(o.geometry)o.geometry.dispose();});S0.tris-=q.tris;}ST.delete(q.key);S0.squares=ST.size;}
// ---------------------------------------------------------------- the terrain opened: a finest chunk drops its triangles wholly inside a hole
function cut(m){const n=m.userData.terrain;m.userData.tubeCut=0;if(!n||n.l!==TERRAIN.MAXL)return;const c=n.chunk,x0=c.x0,z0=c.z0,s=n.s;
 const near=HOLES.filter(H=>H.x+H.R>x0&&H.x-H.R<x0+s&&H.z+H.R>z0&&H.z-H.R<z0+s);if(!near.length)return;
 const g=m.geometry,p=g.attributes.position,I=g.index.array,keep=[],inside=v=>{const x=p.getX(v)+x0,z=p.getZ(v)+z0;for(const H of near)if(Math.hypot(x-H.x,z-H.z)<H.R)return true;return false;};
 let k=0;for(let t=0;t<I.length;t+=3){if(inside(I[t])&&inside(I[t+1])&&inside(I[t+2])){k++;continue;}keep.push(I[t],I[t+1],I[t+2]);}
 if(k){g.setIndex(keep);m.userData.tubeCut=k;S0.cut+=k;S0.cutChunks++;}}
const tmeshes=TERRAIN.meshes;
function cutAll(){for(const m of tmeshes())if(m.userData.tubeCut===undefined)cut(m);}
// ---------------------------------------------------------------- what to stream: the squares round the camera when it is in a tube or
// near an opening, and the squares round every opening within sight
const R_NEAR=300,R_OPEN=700,R_FAR=1600,want=new Set();
function eyeInfo(){const p=camera.position,g=GD(p.x,p.z),v=p.y<g+.5?WTUBES.voidAt(P,p.x,p.y,p.z):1e9;let dOpen=1e9;
 for(const H of HOLES)dOpen=Math.min(dOpen,Math.hypot(p.x-H.x,p.z-H.z,Math.max(0,H.g-p.y)));return {p,g,under:v<.5&&p.y<g-.3,dOpen};}
function wanted(E){want.clear();const p=E.p,near=E.under||E.dOpen<R_OPEN;
 const add=(x,z,r)=>{for(let i=Math.floor((x-r)/SZ);i<=Math.floor((x+r)/SZ);i++)for(let k=Math.floor((z-r)/SZ);k<=Math.floor((z+r)/SZ);k++){const key=i+','+k;
  if(!SQ.has(key))continue;const dx=Math.max(0,i*SZ-x,x-(i+1)*SZ),dz=Math.max(0,k*SZ-z,z-(k+1)*SZ);if(Math.hypot(dx,dz)<=r)want.add(key);}};
 if(near)add(p.x,p.z,R_NEAR);for(const H of HOLES)if(Math.hypot(H.x-p.x,H.z-p.z)<R_FAR)add(H.x,H.z,H.R+40);return want;}
function update(budget){const t0=performance.now();try{step(budget);}finally{const d=performance.now()-t0;S0.tickMs=S0.tickMs==null?d:S0.tickMs*.95+d*.05;}}
function step(budget){frame++;const E=eyeInfo();wanted(E);S0.under=E.under;
 // the queue: the nearest wanted square first; a started square is finished before the next starts
 const p=E.p,dist=key=>{const q=SQ.get(key),cx=(q.i+.5)*SZ,cz=(q.k+.5)*SZ;return Math.hypot(cx-p.x,cz-p.z);};
 const todo=[...want].filter(k=>{const q=ST.get(k);if(q)q.used=frame;return !q||!q.group;}).sort((a,b)=>(ST.has(b)?1:0)-(ST.has(a)?1:0)||dist(a)-dist(b));S0.queue=todo.length;
 const t=performance.now();for(const k of todo){const left=budget-(performance.now()-t);if(left<=0)break;const q=ST.get(k)||start(k);if(q)work(q,left);}
 if(ST.size>48||frame%60===0)for(const q of [...ST.values()])if(frame-q.used>240)drop(q);
 cutAll();atmos(E);}
function settle(ms){const t=performance.now();ms=ms==null?60000:ms;let n=0;do{update(500);n++;}while(S0.queue>0&&performance.now()-t<ms);return {rounds:n,ms:Math.round(performance.now()-t),stats:stats()};}
// ---------------------------------------------------------------- inside: the lamp, the dark haze, no sky
const BLACK=new THR.Color(0x050403),HAZE=HOST.HAZE,fogC=new THR.Color();let skyHidden=false;
function atmos(E){const k=E.under?sstep(8,60,E.dOpen):0;LAMP.value=E.under?2.4:0;
 fogC.copy(HAZE).lerp(BLACK,k);scene.fog.color.copy(fogC);if(scene.background&&scene.background.isColor)scene.background.copy(fogC);
 if(k>0)scene.fog.density=scene.fog.density*(1-k)+k/55;
 const hide=k>.5;if(hide!==skyHidden&&typeof SKY!=='undefined'){skyHidden=hide;[SKY.sky,SKY.giant].forEach(o=>{if(o)o.visible=!hide;});}}
HOST.TICKS.push(()=>update(START.ready?5:40));
// ---------------------------------------------------------------- the pick reaches the rock; the flora keeps off the holes
TERRAIN.meshes=()=>{const a=tmeshes();for(const q of ST.values())if(q.group)for(const m of q.group.children)a.push(m);return a;};
const prevClear=WORLD.clearHook;WORLD.clearHook=(x,z)=>(prevClear&&prevClear(x,z))||!!WTUBES.holeAt(P,x,z);
// ---------------------------------------------------------------- the views: each portal from outside, a walk inside each tube
const views=[];P.tubes.forEach(T=>{const st=T.st,n=st.length;
 T.open.filter(O=>O.kind==='portal').forEach(O=>{const s=st[O.i],q=st[O.i===0?Math.min(n-1,30):Math.max(0,n-31)],dx=s[0]-q[0],dz=s[1]-q[1],l=Math.max(1e-9,Math.hypot(dx,dz));
  const x=s[0]+dx/l*45,z=s[1]+dz/l*45;views.push({label:'Tube '+T.id+': '+(O.name||'portal')+' (outside)',pos:[x,GD(x,z)+14,z],look:[s[0],s[2]+3,s[1]]});});
 const i=Math.floor(n*.37),s=st[i],q=st[Math.min(n-1,i+4)];views.push({label:'Tube '+T.id+': inside, '+(i*100/n).toFixed(0)+'% along',pos:[s[0],s[2]+1.7,s[1]],look:[q[0],q[2]+1.5,q[1]]});
 T.halls.forEach(H=>{const a=st[Math.max(0,H.i-1)],b=st[Math.min(n-1,H.i+1)],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.max(1e-9,Math.hypot(dx,dz)),e=Math.min(H.rx,H.rz)*.8;
  views.push({label:'Tube '+T.id+': '+(H.name||'the hall'),pos:[H.c[0]-dx/l*e,H.c[1]+2.2,H.c[2]-dz/l*e],look:[H.c[0],H.c[1]+H.h*.45,H.c[2]]});});});
if(typeof WORLD_CONFIG!=='undefined'&&WORLD_CONFIG.goViews)views.forEach(v=>WORLD_CONFIG.goViews.push(v));
// ---------------------------------------------------------------- the walker and the flying camera (90's CAM.update, wrapped once CAM is made)
const keys={};addEventListener('keydown',e=>{keys[e.code]=true;});addEventListener('keyup',e=>{keys[e.code]=false;});
const W={blocked:0,tube:0};
LATE.push(()=>{if(typeof CAM==='undefined'||!CAM)return;const orig=CAM.update;
 CAM.update=function(dt){const p=camera.position,x0=p.x,y0=p.y,z0=p.z,g0=Math.max(TERRAIN.heightDrawn(x0,z0),WORLD.water(x0,z0));orig(dt);
  if(CAM.st.walk){const gy=Math.max(TERRAIN.heightDrawn(p.x,p.z),WORLD.water(p.x,p.z)),w=WTUBES.walk(P,p.x,p.z,y0-1.7,gy,[x0,z0]);
   if(!w){p.set(x0,y0,z0);W.blocked++;W.last='wall';}else{p.y=w.y+1.7;W.last=w.kind;if(w.kind==='tube')W.tube++;}}
  else{const sh=keys.ShiftLeft||keys.ShiftRight,my=(keys.KeyE?1:0)-(keys.KeyQ?1:0),v=Math.min(60000,Math.max(12,Math.max(1,y0-g0)*.9))*(sh?5:1)*CAM.st.speedK;
   const yw=y0+my*v*dt,gN=GD(p.x,p.z),was=y0<GD(x0,z0)-.3&&WTUBES.voidAt(P,x0,y0,z0)<0;
   if(yw<gN&&WTUBES.voidAt(P,p.x,yw,p.z)<-.3){if(yw<p.y)p.y=yw;}   /* in a tube, or into one through an opening: no ground clamp */
   else if(was&&yw<gN)p.set(x0,y0,z0);}   /* the rock stops the flying camera */
  camera.updateMatrixWorld();};
 // the inspector over the rock: the tube, its section and its depth (after 90's own line)
 const el=document.getElementById('insp');
 addEventListener('mousemove',e=>{if(!CAM.st.insp||e.buttons)return;const h=CAM.pick(e);if(!h)return;const gy=GD(h.x,h.z);if(h.y>gy-.6&&!WTUBES.holeAt(P,h.x,h.z))return;
  const F=WTUBES.floorAt(P,h.x,h.z,true),O=WTUBES.holeAt(P,h.x,h.z),T=F?F.T:O?O.T:null;if(!T)return;
  el.textContent='cavern · '+T.name+'\n'+(F&&F.sec?(F.sec.kind==='choke'?'a choke ':'')+F.sec.w+' m wide, '+F.sec.h+' m floor to crown':F&&F.hall?'a hall':'an opening')+
   (O?' · at '+(O.open.name||O.open.kind):'')+'\nthe floor '+(F?Math.round(gy-F.y)+' m under the ground':'')+' · titanium basalt (the Twins kit\'s)\n'+
   'at x '+Math.round(h.x)+' y '+Math.round(h.y)+' z '+Math.round(h.z)+' · map px '+(Math.round(WORLD.px(h.x)*100)/100)+', '+(Math.round(WORLD.py(h.z)*100)/100);});});
function stats(){return Object.assign({},S0,{walk:Object.assign({},W),tubes:P.tubes.length,km:Math.round(P.tubes.reduce((a,T)=>a+T.len,0)/100)/10,openings:P.tubes.reduce((a,T)=>a+T.open.length,0),holes:HOLES.length,drawn:[...ST.values()].filter(q=>q.group).length});}
window._tubes={plan:P,ground:GD,stats,settle,update,views,clear:()=>{for(const q of [...ST.values()])drop(q);return ST.size;},
 checks:neg=>{let Q=P;if(neg){Q=WTUBES.bind(JSON.parse(JSON.stringify(P)),{ground:GD});const T=Q.tubes.find(t=>t.id===neg.tube)||Q.tubes[0];
   if(neg.kind==='no-opening')T.open=[];if(neg.kind==='raise'){const s=T.st[Math.floor(T.st.length/2)];s[2]=GD(s[0],s[1])+3;}}
  return WTUBES.check(Q,{ground:GD,fromPx:WORLD.fromPx});},
 holeAt:(x,z)=>{const h=WTUBES.holeAt(P,x,z);return h?{id:h.open.id,kind:h.open.kind,tube:h.T.id}:null;},
 floorAt:(x,z)=>{const f=WTUBES.floorAt(P,x,z);return f?{y:f.y,tube:f.T.id,kind:f.sec?f.sec.kind:'hall'}:null;},
 voidAt:(x,y,z)=>WTUBES.voidAt(P,x,y,z),squaresDrawn:()=>[...ST.values()].filter(q=>q.group).map(q=>q.key)};
return {P,GD,stats,settle,update,ROCK,LAMP};})();});
