// ================================================================= OPEN WORLD — bridges drawn: the plan's BRIDGE records
// [draw] Draws the plan's bridges (WORLD_DATA.sites.bridges: core/world/42b-world-bridges.js BRIDGES.plan, laid by KSITES
// for a region that asks, SITE_SPEC.bridges). It decides nothing: each BRIDGE says where its deck runs, how high, its kind
// and its piers. A bridge is drawn in stone, by its builders' culture: the deck (a slab along the road's points over the
// span, the carriageway's width and a shoulder each side) with its parapets; under it, by kind:
//   slab      the deck on its two abutments
//   arch      one arch, abutment to abutment, its ring of voussoirs rising to just under the deck
//   arches    a row of arches on piers (every pierEvery m)
//   viaduct   tall piers to the bed, round-arched between their heads
// Every bridge is registered in core/tags (an 'infrastructure' record of kind 'bridge'), and each is one group set at
// its first abutment (float precision far from the origin), its boxes instanced. Out to FAR it is drawn; beyond, hidden.
// window._bridges holds the records and the checks verify.py reads.
var BRIDGES_DRAW;LATE.push(()=>{BRIDGES_DRAW=(function(){'use strict';
const scene=HOST.scene,camera=HOST.camera,FAR=40000;
const PLAN=WORLD_DATA.sites||{},LIST=PLAN.bridges||[];
const S={bridges:LIST.length,boxes:0,piers:0,deckM:0,errors:[]};
const TAGS=KTAGS.create({build:(PLAN.region||'region')+':bridges'});
/* the stone by the builders: the Xanadu kit's whitewash over a grey footing, the Order's grey ashlar, else a field stone */
const STONE={xanadu:0xd9cfbd,order:0x9c9488,iziz:0xc8a074,default:0x8f8676},PARA={xanadu:0x7a3a2c,order:0x847b70,default:0x7d7466};
const mats={};const mat=(c,k)=>mats[k]||(mats[k]=new THREE.MeshLambertMaterial({color:c}));
const box=new THREE.BoxGeometry(1,1,1),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(0,0,0,'YXZ'),v=new THREE.Vector3(),sc=new THREE.Vector3();
const HB=(x,z)=>WORLD.Hbare?WORLD.Hbare(x,z):WORLD.H(x,z);
const DECK=1.2,SHOULDER=1.2,PARA_H=1.0,PARA_W=.5;
/* the boxes of one bridge, in its own frame (its first abutment the origin): [cx, cy, cz, yaw, pitch, sx, sy, sz, part] */
function boxes(B){const o=B.abutments[0],out=[],W=2*(B.hw+SHOULDER),D=B.deck;
 const put=(x,y,z,yaw,pitch,sx,sy,sz,part)=>out.push([x-o.x,y,z-o.z,yaw,pitch,sx,sy,sz,part]);
 /* the deck and its parapets, a box each step of the road's line */
 for(let i=1;i<D.length;i++){const a=D[i-1],b=D[i],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<.05)continue;
  const yaw=Math.atan2(dx,dz),pitch=-Math.atan2(b[2]-a[2],L),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2,my=(a[2]+b[2])/2,nx=dz/L,nz=-dx/L;
  put(mx,my-DECK/2,mz,yaw,pitch,W,DECK,L+.05,'deck');S.deckM+=L;
  for(const sd of [-1,1])put(mx+nx*sd*(W/2-PARA_W/2),my+PARA_H/2,mz+nz*sd*(W/2-PARA_W/2),yaw,pitch,PARA_W,PARA_H,L+.05,'para');}
 /* the supports along the deck: its two abutments and its piers, each with the deck's height over it and the ground */
 const along=p=>{let best=0,bd=1e18;for(let i=0;i<D.length;i++){const d=Math.hypot(D[i][0]-p.x,D[i][1]-p.z);if(d<bd){bd=d;best=i;}}return best;};
 const sup=[{x:B.abutments[0].x,z:B.abutments[0].z,top:B.abutments[0].y-DECK,base:HB(B.abutments[0].x,B.abutments[0].z),i:0,abut:true}]
  .concat(B.piers.map(p=>({x:p.x,z:p.z,top:p.yTop,base:p.yBase,i:along(p)})))
  .concat([{x:B.abutments[1].x,z:B.abutments[1].z,top:B.abutments[1].y-DECK,base:HB(B.abutments[1].x,B.abutments[1].z),i:D.length-1,abut:true}]);
 sup.sort((a,b)=>a.i-b.i);
 const dirAt=i=>{const a=D[Math.max(0,i-1)],b=D[Math.min(D.length-1,i+1)];return Math.atan2(b[0]-a[0],b[1]-a[1]);};
 for(const P of sup){const h=Math.max(.5,P.top-P.base+1.5),yaw=dirAt(P.i);   /* a pier (or an abutment's block), 1.5 m into the ground */
  put(P.x,P.base-1.5+h/2,P.z,yaw,0,W+.6,h,P.abut?4:3.2,'pier');if(!P.abut)S.piers++;}
 /* the arches between supports: a ring of voussoirs from one support's springing to the next's, its crown under the deck */
 if(B.kind!=='slab')for(let k=1;k<sup.length;k++){const A=sup[k-1],C=sup[k],span=Math.hypot(C.x-A.x,C.z-A.z);if(span<3)continue;
  const yaw=Math.atan2(C.x-A.x,C.z-A.z),under=Math.min(A.top,C.top),spring=Math.max(A.base,C.base)+.5,rise=Math.min(span/2,under-spring-.4);
  if(!(rise>.8))continue;const N=Math.max(6,Math.min(16,Math.round(span/2.5)));
  for(let j=0;j<N;j++){const t0=j/N,t1=(j+1)/N,f=t=>[A.x+(C.x-A.x)*t,A.z+(C.z-A.z)*t,spring+rise*Math.sin(Math.PI*t)];
   const p0=f(t0),p1=f(t1),L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]);
   put((p0[0]+p1[0])/2,(p0[2]+p1[2])/2,(p0[1]+p1[1])/2,yaw,-Math.atan2(p1[2]-p0[2],Math.hypot(p1[0]-p0[0],p1[1]-p0[1])),W,.9,L+.1,'arch');}}
 return out;}
const G=[];
for(const B of LIST){const a=B.abutments[0],mid=B.deck[Math.floor(B.deck.length/2)];
 const T=TAGS.add({class:'infrastructure',kind:'bridge',key:B.id,name:(B.kind==='slab'?'a slab bridge':B.kind==='arch'?'an arched bridge':B.kind==='viaduct'?'a viaduct':'a bridge of arches')+' ('+Math.round(B.len)+' m)',
  at:[mid[0],mid[2],mid[1]],r:B.len/2+10,h:Math.max(4,mid[2]-B.bed),tags:{culture:B.culture||'generic',types:['infrastructure'],role:'bridge'},
  note:'core/world 42b: '+B.kind+', '+Math.round(B.len)+' m, '+B.piers.length+' piers, '+B.clearance+' m over the water ('+B.road+')'});
 const bx=boxes(B),by={};bx.forEach(r=>(by[r[8]]||(by[r[8]]=[])).push(r));
 const grp=new THREE.Group();grp.position.set(a.x,0,a.z);grp.name='bridge '+B.id;grp.userData.inspectLabel=T.name;
 const cu=B.culture&&STONE[B.culture]?B.culture:'default';
 for(const part in by){const L=by[part],M=part==='para'?mat(PARA[cu]||PARA.default,'p'+cu):mat(STONE[cu],'s'+cu),im=new THREE.InstancedMesh(box,M,L.length);
  L.forEach((r,i)=>{e.set(r[4],r[3],0,'YXZ');q.setFromEuler(e);im.setMatrixAt(i,m4.compose(v.set(r[0],r[1],r[2]),q,sc.set(r[5],r[6],r[7])));});
  im.name='bridge '+part;im.userData.inspectLabel=T.name;grp.add(im);S.boxes+=L.length;}
 scene.add(grp);G.push({B,grp,x:mid[0],z:mid[1]});}
function update(){const P=camera.position;for(const g of G)g.grp.visible=Math.hypot(P.x-g.x,P.z-g.z)<FAR;}
HOST.TICKS.push(()=>update());
/* ---------------------------------------------------------------- the checks verify.py reads (each with its negative)
   plan: BRIDGES.check on the laid roads (every span a bridge, every deck over its water, the grade held, the piers on the
         ground); the negative lowers every deck to its water
   water: under every bridge, wherever the river runs, its water stands over the ground (the road's fill did not bury it);
          the negative reads the deck as the ground
   drawn: every bridge drawn and tagged */
function checks(neg){const R=[];
 {const roads=((WORLD_DATA.roads&&WORLD_DATA.roads.roads)||[]),L=neg==='plan'?LIST.map(B=>Object.assign({},B,{clearance:0})):LIST;
  const K=typeof BRIDGES!=='undefined'?BRIDGES.check(roads,L):{ok:false,problems:['core/world 42b not loaded'],counts:{}};
  R.push({name:'the bridges: every span a bridge, every deck clear of its water, the grade held, the piers on the ground',ok:K.ok&&LIST.length>0,
   detail:K.ok?JSON.stringify(K.counts):K.problems.slice(0,5).join('; ')});}
 {let n=0,dry=0,first=null;
  for(const B of LIST)for(const p of B.deck){const w=WORLD.riverWater?WORLD.riverWater(p[0],p[1]):-1e9;if(!(w>-1e8))continue;n++;
   const g=neg==='water'?p[2]:WORLD.H(p[0],p[1]);if(!(w>g+.2)){dry++;first=first||[Math.round(p[0]),Math.round(p[1])];}}
  R.push({name:'the rivers run on under the bridges (the road\'s fill buries none)',ok:n>0&&dry===0,detail:n+' stations over the water, '+dry+' buried'+(first?' (first at '+first+')':'')});}
 {const A=TAGS.audit(),bad=[];if(A.unknown)bad.push(A.unknown+' unknown tag values');if(G.some(g=>!g.grp.children.length))bad.push('a bridge drawn with nothing');
  R.push({name:'the bridges drawn and tagged',ok:!bad.length&&G.length===LIST.length&&LIST.length>0,detail:bad.length?bad.join('; '):G.length+' bridges, '+S.boxes+' stones, '+S.piers+' piers, '+Math.round(S.deckM)+' m of deck'});}
 return R;}
window._bridges={list:LIST,stats:S,checks,tags:()=>TAGS.audit()};
return{update,stats:S};})();});
