// ================================================================= HOST — the land: the beds, the towers, the fields, the site (station 4)
// THE BEDS (core/terrain KSTRATA, the `pillar` recipe: iron-red and bleached white quartz sandstones in turn, thin soft partings,
// PLAN.md section 2) laid level: the cliff (the ground's steep faces, 84-host-ground.js) and the towers draw one column.
// THE TOWERS (core/terrain KSTACKS, from the plan in 45-host-stage.js: KSTACKS.pillars' rule on the same joints and zone, the
// towers narrowed to fins and spires), so they stand where the slots open; each drawn mesh contoured (KSTACKS.contour: the
// profile thinning in and out, joints, a split crown; core/terrain 37b) and worn (KSTACKS.weather). THE WATCH PILLAR: one tower
// made whole and broad, its top held flat for a settlement's post (the site below); this station draws nothing on it.
// The fields the kit reads (BIOME-API.md, station 4): top (a tower's top, and the table's), floor, block (by a tower's foot or the
// cliff's), wet, slope; BIO.init here, once the towers stand. Host-only: no plant is placed here.
// ---------------------------------------------------------------- the host binding
// bound before the towers stand (the textures below need the host); the fields and the spine are filled in once they do
const OBSTACLES=[],FIELD={},SPINE=[[-1200,rimZ(-1200)+200],[-400,rimZ(-400)+150],[900,rimZ(900)+250],[0,640],[-900,rimZ(-900)-300],[800,rimZ(800)-300]];let SITE_HOLD=null;
BIO.init({tags:'swhighlands-pillars',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,field:FIELD_BAKED,
 mask:(x,z)=>{if(x<TERR.X0+4||x>TERR.X1-4||z<TERR.Z0+4||z>TERR.Z1-4)return 0;if(SITE_HOLD&&Math.hypot(x-SITE_HOLD.x,z-SITE_HOLD.z)<SITE_HOLD.r)return 0;
  if(towerTop(x,z,3))return 1;if(nearTower(x,z,2))return 0;const r=streamNear(x,z);if(r&&r.dd<1)return 0;return smooth(1.2,.8,FC.at(FC.a.slope,x,z));},
 obstacles:OBSTACLES,ticks:tick,seed:WORLD,register:REGISTER,origin:SPINE,center:[0,0],fields:FIELD,err:reportErr});
{const Q=new URLSearchParams(location.search);
 BIO.INDEX_ITEMS=Q.get('index')!=='0';
 BIO.LOD.merge=Q.get('lodmerge')!=='0';BIO.LOD.minTris=1500;BIO.LOD.fade=BIO.LOD.merge&&Q.get('lodfade')!=='0'?.15:0;
 BIO.LOD.cull=BIO.LOD.fade>0&&Q.get('lodcull')!=='0';}
BIO.setSun(SUN_POS);
const STRATA=BIO.strata({recipe:'pillar',seed:WORLD,range:[-60,340],dip:[.6,.8,.002],warp:[2,.6],dust:0x9a7a64,res:.25,private:true});
function hostLib(n){const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('swhighlands',n):null;if(!L)return null;
 const c=hostLib.c||(hostLib.c={});return c[n]||(c[n]=KMAT.textures(L,{aniso:8}));}
const ROCK_GRAIN=BIO.canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,v=200+(KRAND.fbm(x/11,.3,y/11,3,71)-.5)*90+(KRAND.h3(x,y,1,72)-.5)*30;d[i]=d[i+1]=d[i+2]=clamp(v,0,255);d[i+3]=255;}
 g.putImageData(id,0,0);});
const ROCK_LIB=hostLib('pillarRock'),TOP_LIB=hostLib('pillarTop');   /* materials.json: rock.sandstone.liesegang (the faces), rock.sandstone_cracks (the tops) */
// the rock: the beds' colour (strataColor) times the library's grain, on three planes for the walls, from above on the tops (aPart 1)
const ROCK_MAT=(function(){const m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
 m.onBeforeCompile=sh=>{STRATA.inject(sh);sh.uniforms.uRG={value:ROCK_LIB?ROCK_LIB.map:ROCK_GRAIN};sh.uniforms.uRGs={value:ROCK_LIB?1/(ROCK_LIB.scale||[10,10])[0]:1/8};
  sh.uniforms.uTG={value:TOP_LIB?TOP_LIB.map:ROCK_GRAIN};sh.uniforms.uTGs={value:TOP_LIB?1/(TOP_LIB.scale||[6,6])[0]:1/6};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aOcc;attribute float aPart;varying float vOcc;varying float vPart;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\nvOcc=aOcc;vPart=aPart;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uRG;uniform float uRGs;uniform sampler2D uTG;uniform float uTGs;varying float vOcc;varying float vPart;')
   .replace('#include <map_fragment>',['#include <map_fragment>',
    '{vec3 n=abs(normalize(vSWN));n/=n.x+n.y+n.z;',
    ' vec3 t=texture2D(uRG,vSWP.zy*uRGs).rgb*n.x+texture2D(uRG,vSWP.xz*uRGs).rgb*n.y+texture2D(uRG,vSWP.xy*uRGs).rgb*n.z;',
    ' t=mix(t,texture2D(uTG,vSWP.xz*uTGs).rgb,step(0.5,vPart)*smoothstep(0.55,0.85,normalize(vSWN).y));',
    ' float wl=1.0-smoothstep(0.3,0.7,abs(normalize(vSWN).y));float vk=texture2D(uRG,vec2(dot(vSWP.xz,vec2(0.71,0.71))*0.03,vSWP.y*0.0025)).r;t*=mix(1.0,0.5,smoothstep(0.4,0.7,vk)*wl);',   /* desert varnish: dark streaks down the walls (Canyon de Chelly) */
    ' float l=dot(t,vec3(0.333));vec3 sc=strataColor(vSWP,vSWN);sc=mix(vec3(dot(sc,vec3(0.333))),sc,0.85)*1.6;sc=mix(sc,vec3(0.78,0.42,0.28)*1.15,0.5);diffuseColor.rgb*=sc*clamp(pow(l/0.47,1.3),0.4,1.7)*(0.5+0.5*vOcc);}'].join('\n'));};
 m.customProgramCacheKey=()=>'swhi-pillar-rock';return m;})();

// ---------------------------------------------------------------- the towers
const PILLARS=[],ARCHES=[];let WATCH=null;
const PILLAR_IX=KSPACE.create({cell:60});
(function(){const gr=(x,z)=>groundH(x,z);
 // a bed's thickness above y and its hardness (KSTACKS' strata hook): up the column until the bed changes
 const strata=(x,y,z)=>{const a=STRATA.at(x,y,z);if(!a)return null;let h=.25;while(h<40){const q=STRATA.at(x,y+h,z);if(!q||q.bed!==a.bed)break;h+=.25;}return{h,hard:a.hard};};
 // THE WATCH PILLAR: where the band is a third of the way out, nearest the map's middle: made whole (no break), 62 x 60 m,
 // its top at the table's; the band's own towers kept clear of it
 const wx=WATCH_AT.x,wz=WATCH_AT.z,wg=gr(wx,wz);
 try{WATCH=KSTACKS.make({kind:'pillar',id:'watch',x:wx,z:wz,w:WATCH_AT.w,l:WATCH_AT.l,ry:JOINTS.angle,H:tableTop(wx,wz)-wg,sq:6,taper:.012,lean:0,ground:gr,seed:KRAND.hash(WORLD,4,1),strata});
  WATCH.name='The watch pillar';WATCH.key='rock.pillar.watch';WATCH.keep=12;PILLARS.push(WATCH);}catch(e){reportErr('watch pillar: '+e.message);}
 // THE BAND'S TOWERS from the plan (45-host-stage.js): fins and spires, their height the table's less a broken one's loss; a spire
 // tapers more (Spider Rock); each made by KSTACKS.make with the strata hook, set on the ground as drawn
 // an ARCH (KSTACKS.make kind 'arch'): two legs and a lintel, the opening along ry; tried a little larger if the form refuses
 const arch=(o,quiet)=>{for(let k=0;k<4;k++){try{return KSTACKS.make(Object.assign({kind:'arch',ground:gr,inward:.12},o,{rise:o.rise+k*4,H:o.H+k*5}));}catch(e){if(k===3&&!quiet)reportErr(o.id+': '+e.message);}}return null;};   /* quiet: a fin the form refuses stays a fin */
 FREE_ARCHES.forEach((A,i)=>{const B=arch({id:A.id,x:A.x,z:A.z,span:A.span,rise:A.rise,H:A.H,t:A.t,leg:A.span*.42,ry:A.ry,seed:KRAND.hash(WORLD,5,i)});
  if(B){B.name=A.id==='arch:apron'?'A natural bridge on the apron':'A free-standing arch';B.key='rock.arch';B.isArch=true;ARCHES.push(B);PILLARS.push(B);}});
 TOWER_PLAN.forEach(P=>{const r=streamNear(P.x,P.z);if(r&&r.dd<20)return;const g=gr(P.x,P.z),T=tableTop(P.x,P.z),H=(T-g)*(1-P.brk);if(H<4)return;
  const s=KRAND.stream(P.seed);let B=null;
  // a pierced fin: the fin's long side the arch's span, its opening a third to a half of its height, the lintel to the table's top
  if(P.arch){const L=Math.max(P.w,P.l),Tt=Math.min(P.w,P.l),ry=P.w>P.l?P.ry:P.ry+Math.PI/2;
   B=arch({id:P.id,x:P.x,z:P.z,span:L*.55,rise:Math.min(H*.5,L*.9),H,t:Tt,leg:L*.24,ry,seed:P.seed},true);
   if(B){B.name='A pierced fin (an arch)';B.key='rock.arch';B.isArch=true;ARCHES.push(B);PILLARS.push(B);return;}}
  try{B=KSTACKS.make({kind:'pillar',id:P.id,x:P.x,z:P.z,w:P.w,l:P.l,ry:P.ry,H,sq:P.spire?3:5,taper:P.spire?s.range(.12,.2):s.range(.03,.08),lean:Math.atan(Math.min(P.w,P.l)*.05/H)*(s.next()-.5),ground:gr,seed:P.seed,strata});}catch(e){reportErr(P.id+': '+e.message);return;}
  B.spire=P.spire;B.name=P.spire?'A spire of the pillar rim':P.brk>0?'A broken tower of the pillar rim':'A fin of the pillar rim';B.key='rock.pillar';PILLARS.push(B);});
 PILLARS.forEach(B=>PILLAR_IX.insert(B,B.x,B.z,B.R));
 // THE DRAWN MESH: one for every tower; each contoured, then worn, its feet kept on the ground; the watch pillar's top kept whole
 const pos=[],uv=[],idx=[],occ=[],col=[],part=[];let tris=0;
 PILLARS.forEach(B=>{const m=KSTACKS.mesh(B,{step:3}),o=pos.length/3;
  if(B.isArch&&KSTACKS.archRound)KSTACKS.archRound(B,m);   /* the opening bent from its box to an ellipse (core/terrain 37b) */
  if(KSTACKS.contour&&!B.isArch)KSTACKS.contour(B,m,B===WATCH?{keep:B.keep}:B.spire?{profile:.2,crown:.35}:{});
  KSTACKS.weather(B,m,B.isArch?{ground:gr,amp:4,grain:.08,pit:1.4,pitGrain:.5,round:2.4}:{ground:gr,amp:3,grain:.09,pit:1.1,pitGrain:.6});
  for(let v=0;v<m.pos.length/3;v++){pos.push(m.pos[3*v],m.pos[3*v+1],m.pos[3*v+2]);uv.push(m.uv[2*v],m.uv[2*v+1]);occ.push(.35+.65*m.occ[v]);col.push(1,1,1);part.push(m.part[v]);}
  for(const i of m.idx)idx.push(o+i);tris+=m.idx.length/3;
  /* not an obstacle: a tower's top carries plants (the mask keeps them off its walls: nearTower) */
  REGISTER({name:B.name,key:B.key,kind:'rock',x:B.x,z:B.z,y:B.y0,r:Math.min(B.R,40),h:B.top-B.y0});});
 window._pillarTris=tris;
 if(pos.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('aOcc',new THREE.Float32BufferAttribute(occ,1));g.setAttribute('aPart',new THREE.Float32BufferAttribute(part,1));
  g.setIndex(new THREE.Uint32BufferAttribute(idx,1));g.computeVertexNormals();const me=new THREE.Mesh(g,ROCK_MAT);me.userData.host=true;me.userData.rock=true;
  me.userData.inspectLabel='Pillar sandstone (iron-red and bleached beds, Liesegang bands)';me.userData.probePoints=PILLARS.map(B=>[B.x,(B.y0+B.top)/2,B.z]);scene.add(me);}})();
// a tower's top under a point: {B, top} or null (the record's; the drawn mesh is contoured inside it, so the flora keeps a margin)
const _pq=[];
function towerTop(x,z,shrink){PILLAR_IX.query(x,z,0,_pq);if(!_pq.length)return null;const T=_pq.filter(B=>!B.isArch);if(!T.length)return null;const s=KSTACKS.at(T,x,z);if(!s||s.top<s.S.top-1.5)return null;
 if(shrink&&s.d>-shrink)return null;return{B:s.S,top:s.top};}
// near a tower's wall (inside its foot or within m of it, and not on its top): the floor's plants keep off
function nearTower(x,z,m){PILLAR_IX.query(x,z,0,_pq);for(const B of _pq){const r=Math.max(B.beds[0].rx,B.beds[0].rz)*1.05+m;if(Math.hypot(x-B.x,z-B.z)<r)return B;}return null;}
// THE SURFACE the kit stands its plants on: a tower's top where there is one, else the ground
function terrainH(x,z){const t=towerTop(x,z,0);return t?t.top:groundH(x,z);}
function slopeAt(x,z){const h=groundH(x,z),e=3;return Math.hypot(groundH(x+e,z)-h,groundH(x,z+e)-h)/e;}

// ---------------------------------------------------------------- the climate fields (10 m lattice)
const FC=(function(){const N=321,SX=TERR.X1-TERR.X0,SZ=TERR.Z1-TERR.Z0,K=['h','slope','top','floor','block','wet','mist','flow','north'],a={};
 K.forEach(k=>a[k]=new Float32Array(N*N));const st=SX/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++)a.h[j*N+i]=groundH(TERR.X0+i*st,TERR.Z0+j*st);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const k=j*N+i,x=TERR.X0+i*st,z=TERR.Z0+j*st,h=a.h[k];
  const hx=(a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)])/(2*st),hz=(a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i])/(2*st);
  const zz=zone(x,z),tt=towerTop(x,z,4),nt=nearTower(x,z,14),r=streamNear(x,z),n1=NZ(x,z,.003,86,2);
  a.slope[k]=tt?0:Math.hypot(hx,hz);a.north[k]=clamp(-hz/.3,-1,1);
  a.top[k]=tt?1:(zz<.29&&a.slope[k]<.5?.08:0);                       /* a tower's top; the table's own top hardly (station 3's ground) */
  a.floor[k]=tt?0:smooth(.31,.36,zz)*smooth(.7,.35,a.slope[k])*(1-smooth(.02,.15,apronAt(x,z)/(TOP-CAP)));   /* the badland apron is bare */
  {const d=z-rimZ(x);a.block[k]=tt?0:clamp(smooth(70,10,d)*smooth(-5,5,d)+(nt?.8:0),0,1);}   /* the cliff's foot and the towers' */
  a.flow[k]=r?smooth(60,4,r.dd):0;
  a.wet[k]=clamp(.4+.5*a.flow[k]+.15*smooth(30,0,z-rimZ(x))+.12*n1-(tt?.15:0),0,1);
  a.mist[k]=clamp(smooth(150,260,h+(tt?tt.top-h:0))*.5+.15*n1,0,1);}
 const at=(arr,x,z)=>{const u=clamp((x-TERR.X0)/SX*(N-1),0,N-1.001),v=clamp((z-TERR.Z0)/SZ*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
  return arr[j*N+i]*(1-fu)*(1-fv)+arr[j*N+i+1]*fu*(1-fv)+arr[(j+1)*N+i]*(1-fu)*fv+arr[(j+1)*N+i+1]*fu*fv;};
 return{N,a,at};})();
// on a tower's top the fields answer for the point itself (the lattice is coarser than a top's edge)
Object.assign(FIELD,{top:(x,z)=>towerTop(x,z,3)?1:FC.at(FC.a.top,x,z)*(nearTower(x,z,0)?0:1),floor:(x,z)=>towerTop(x,z,0)?0:FC.at(FC.a.floor,x,z),
 block:(x,z)=>towerTop(x,z,0)?0:FC.at(FC.a.block,x,z),wet:(x,z)=>FC.at(FC.a.wet,x,z),slope:(x,z)=>towerTop(x,z,0)?0:FC.at(FC.a.slope,x,z),
 mist:(x,z)=>FC.at(FC.a.mist,x,z),flow:(x,z)=>FC.at(FC.a.flow,x,z),north:(x,z)=>FC.at(FC.a.north,x,z),cold:()=>.2,rock:(x,z)=>smooth(.75,1.2,FC.at(FC.a.slope,x,z)),salt:()=>0});

// ---------------------------------------------------------------- the site (published for a settlement; BIOME-API.md, station 4)
// Plain data, nothing of any settlement's in it: the watch pillar (its top's height and the flat square held on it), every tower
// (its id, foot, top and size), the rim's line with the table's top and the floor under it, the map's frame. A settlement reads
// this (the page's `site` exporter, or SWHI_PILLARS_SITE on the page) and places itself; this station reserves the watch top and
// keeps its plants off it, and places nothing else for anyone
const SWHI_PILLARS_SITE=(function(){const W=WATCH,b0=W?W.beds[W.beds.length-1]:null;
 return{format:'swhighlands-pillars-site',version:1,frame:{x:'east',z:'south',y0:ALT0,box:[TERR.X0,TERR.Z0,TERR.X1,TERR.Z1]},
  watch:W?{id:W.id,x:W.x,z:W.z,foot:W.y0,top:W.top,w:62,l:60,ry:W.beds[0].ry,flat:Math.min(b0.rx,b0.rz)*2,keep:W.keep}:null,
  arches:ARCHES.map(B=>({id:B.id,x:+B.x.toFixed(2),z:+B.z.toFixed(2),foot:+B.y0.toFixed(2),top:+B.top.toFixed(2),R:+B.R.toFixed(2)})),
  towers:PILLARS.filter(B=>!B.isArch).map(B=>({id:B.id,x:+B.x.toFixed(2),z:+B.z.toFixed(2),foot:+B.y0.toFixed(2),top:+B.top.toFixed(2),R:+B.R.toFixed(2)})),
  rim:Array.from({length:65},(_,i)=>{const x=TERR.X0+i*(TERR.X1-TERR.X0)/64,z=rimZ(x);return{x,z,top:+tableTop(x,z-20).toFixed(2),floor:+groundH(x,z+30).toFixed(2)};}),
  river:{name:PAN.name,pts:PAN.pts.filter((p,i)=>i%4===0).map((p,i)=>[+p[0].toFixed(1),+p[1].toFixed(1)])}};})();
// the watch top is held for a settlement: no plant on it
SITE_HOLD=WATCH?{x:WATCH.x,z:WATCH.z,r:30}:null;if(WATCH)SPINE.push([WATCH.x,WATCH.z]);


