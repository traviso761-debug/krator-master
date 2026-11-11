// ================================================================= HOST — the geodes: in the flows' tops, on the talus, and a walk-in one (PLAN.md, "Geodes")
// The records are core/terrain's KGEODE (39f-core-geode.js) from this stage's rock: the BANDS are the top 30 per cent of each flow's cliff,
// under its bench (SC.strata.tops: a flood basalt's gas bubbles rise to its top), the GROUND is the drawn ground's own triangles (the mesh's
// 10 m cells smooth a cliff: a geode sits on what the eye sees, not on terrainH), the cells only where the coulee's walls and the falls' cliff
// stand (and their talus): `near`. THE WALK-IN GEODE is a fallen block of a flow top on the talus at the west wall's foot, downstream of the
// falls, its broken face to the coulee (KGEODE.block: a KCAVERN mass and its pocket; KGEODE.line: the amethyst lining), drawn on
// KCAVERN.drawRock in the flow top's vesicular basalt with the agate rind on the pocket's walls (KGROUND's layers); every geode on
// KGEODE.draw. The block is an obstacle for the kit's plants (OBSTACLES, read when the kit plants in 88) and registered.
const GEODES=(function(){const t0=performance.now(),T=SC.strata.tops,B0=SC.strata.opt.basaltBase;
 // ---- the drawn ground: its two triangles a cell (45c's GROUND), the height and the face's normal at (x, z)
 const GP=GROUND.geometry.attributes.position.array,GN=STAGE_GROUND.N,GX=GN+1,GS=TERR.R*2.2,GC=GS/GN;
 function drawn(x,z){const fu=clamp((x+GS/2)/GC,0,GN-1e-6),fv=clamp((z+GS/2)/GC,0,GN-1e-6),i=Math.floor(fu),j=Math.floor(fv),u=fu-i,v=fv-j,a=j*GX+i,b=a+GX,c=b+1,d=a+1;
  const P=k=>[GP[k*3],GP[k*3+1],GP[k*3+2]],tri=u+v<=1?[P(a),P(d),P(b)]:[P(c),P(b),P(d)];
  const e1=[tri[1][0]-tri[0][0],tri[1][1]-tri[0][1],tri[1][2]-tri[0][2]],e2=[tri[2][0]-tri[0][0],tri[2][1]-tri[0][1],tri[2][2]-tri[0][2]];
  let n=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];const l=Math.hypot(n[0],n[1],n[2])||1;n=n.map(q=>q/l);if(n[1]<0)n=n.map(q=>-q);
  const y=n[1]>1e-6?tri[0][1]-(n[0]*(x-tri[0][0])+n[2]*(z-tri[0][2]))/n[1]:tri[0][1];return {y,n};}
 // ---- the bands: the top 30 per cent of each flow's cliff, under its bench (less the interbed's last 0.4 m)
 const bands=T.map((top,k)=>{const bot=k?T[k-1]:B0;return {id:'flow '+(k+1),y0:top-(top-bot)*.3,y1:top-.4,top,bot};});
 // ---- where to look: the coulee's walls and the falls' cliff, within 2 km of the falls (the views' stretch), and their talus
 const near=(x,z)=>{const L=SC.locate(x,z,{});if(L.k<0)return false;if(Math.abs(L.s-FALL.s)>2000)return false;const ad=Math.abs(L.d),u=L.s-(FALL.s+lipAt(L.d));
  return (ad>FLOOR.half-90&&ad<FLOOR.half+330)||Math.abs(u)<130;};
 const box=(function(){let b=[1e9,1e9,-1e9,-1e9];for(let s=FALL.s-2000;s<=FALL.s+2000;s+=100)for(const d of[-FLOOR.half-340,FLOOR.half+340]){const p=courseAt(s,d);b=[Math.min(b[0],p[0]),Math.min(b[1],p[1]),Math.max(b[2],p[0]),Math.max(b[3],p[1])];}return b;})();
 /* MINERALS: the coulee's palette (PLAN.md, "Geodes"): mostly the flood basalts' amethyst, some quartz and blue chalcedony, a few celestine
    and watermelon-banded ones (aura and bismuth, which no basalt grows, moved on 2026-11-09: the Throne's vents, Godstep's plan) */
 const MINERALS={amethyst:.6,quartz:.12,chalcedony:.1,watermelon:.1,celestine:.08};
 const R=KGEODE.scatter({box,world:211,cell:4,bands,ground:(x,z)=>drawn(x,z).y,normal:(x,z)=>drawn(x,z).n,near,
  wall:{p:.06,steep:.45},loose:{p:.015,steep:.32,below:60},r:[.12,.42],split:.45,minerals:MINERALS,
  accept:r=>waterH(r.x,r.z)<-1e8&&!ERRATICS.some(e=>Math.hypot(r.x-e.x,r.z-e.z)<Math.max(e.sx,e.sz)*.7+r.r)});
 // ---- the walk-in geode: a fallen block on the talus at the west wall's foot, 700 m below the falls, its broken face to the coulee
 const site=(function(){const s=FALL.s+700;let pick=null;for(let d=-FLOOR.half+40;d>-FLOOR.half-200;d-=4){const p=courseAt(s,d),D=drawn(p[0],p[1]);if(waterH(p[0],p[1])>-1e8)continue;
   if(1-D.n[1]>.3)break;pick={x:p[0],z:p[1],d};}
  pick=pick||(()=>{const p=courseAt(s,-FLOOR.half);return {x:p[0],z:p[1],d:-FLOOR.half};})();
  const p0=courseAt(s,pick.d-8),p1=courseAt(s,pick.d+8);pick.face=Math.atan2(p1[1]-p0[1],p1[0]-p0[0]);   /* toward the coulee's middle (+d) */
  const back=courseAt(s,pick.d-7);pick.x=back[0];pick.z=back[1];return pick;})();
 const C=KCAVERN.create({ground:(x,z)=>drawn(x,z).y,cell:.25,chunk:16,seed:211});
 const BK=KGEODE.block(C,{id:'geode-block',x:site.x,z:site.z,ground:(x,z)=>drawn(x,z).y,face:site.face,world:211,name:'The walk-in geode: a fallen block of a flow top, split open along its geode'});
 C.build();
 const LINING=KGEODE.line(C,BK,{world:211,n:6000,len:[.12,.36]});   /* a crust of short points, densely set */
 OBSTACLES.push({x:BK.x,z:BK.z,r:6.5});
 // ---- the block drawn: the flow top's vesicular basalt, the agate rind on the pocket's walls (KGROUND's layers, triplanar)
 const USE_KGG=typeof KGROUND!=='undefined'&&new URLSearchParams(location.search).get('kground')!=='0';
 const lib=n=>{const L=typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('scablands',n):null;return L?KMAT.textures(L,{aniso:4}):null;};
 const MB=new THREE.MeshStandardMaterial({color:USE_KGG?0xa09890:0x4a4440,roughness:.95,metalness:0,vertexColors:true});
 MB.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aRind;varying float vRind;').replace('#include <begin_vertex>','#include <begin_vertex>\nvRind=aRind;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vRind;').replace('#include <map_fragment>','#include <map_fragment>\n'+(USE_KGG?'/*KGROUND*/':'diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.72,0.74,0.8),vRind);'));};
 if(USE_KGG)KGROUND.hook(MB,{key:'scablands-geode-block',at:'/*KGROUND*/',tri:{from:.2,to:.6,far:120},layers:[
  KGROUND.layer('scablands','basalt',{w:'1.0',amt:.9,gain:1.0,name:'vesicular basalt (the flow top)'}),
  KGROUND.layer('scablands','agate',{w:'vRind',amt:.95,gain:1.0,name:'the agate rind'})].filter(Boolean)});
 const P=BK.pocket,PI=C.prims.findIndex(q=>q.id===P.id);
 const RK=KCAVERN.drawRock(C,{THREE,material:MB,tile:64,attrs:['aRind'],ground:'drop',label:BK.name,name:'the geode block',
  weight:(x,y,z,nx,ny,nz,ch,i,w)=>{w[0]=ch.prim[i]===PI?1:0;}});   /* the rind: every vertex of the pocket's own walls (KCAVERN's primitive a vertex) */
 RK.group.children.forEach(m=>{m.userData.host=true;m.userData.geode=true;});scene.add(RK.group);
 // ---- every geode drawn (KGEODE.draw), the lining with them
 const LAMP={value:.5};
 const D=KGEODE.draw(R,{THREE,points:LINING,lamp:LAMP,tint:0x7240b8,maps:{skin:(lib('basalt')||{}).map||null,agate:(lib('agate')||{}).map||null,amethyst:(lib('amethyst')||{}).map||null}});
 const pp=[];R.forEach(r=>pp.push(r.x,r.y,r.z));LINING.forEach(q=>pp.push(q.x,q.y,q.z));D.group.userData.probePoints=pp;scene.add(D.group);tick(()=>D.update(camera.position));D.update(camera.position);
 // ---- the records registered: the block (the inspector's volume), the geodes as one record a band
 REGISTER({name:BK.name+' (a pocket '+(P.r*2).toFixed(1)+' m across, '+LINING.length+' amethyst points)',key:'geode.block',x:BK.x,z:BK.z,y:BK.y0,r:6,h:BK.y1-BK.y0+2,
  tags:{geode:{kind:'block',pocket:{c:P.c,r:P.r,h:P.h},face:BK.face}}});
 bands.forEach(b=>{const L=R.filter(r=>r.band===b.id);if(!L.length)return;const cx=L.reduce((a,r)=>a+r.x,0)/L.length,cz=L.reduce((a,r)=>a+r.z,0)/L.length;
  BIO.record({name:'Amethyst geodes of '+b.id+' (its top, '+b.y0.toFixed(0)+'-'+b.y1.toFixed(0)+' m): '+L.filter(r=>r.kind==='wall').length+' in the wall, '+L.filter(r=>r.kind==='loose').length+' on the talus',
   key:'geodes.'+b.id,x:cx,z:cz,y:b.bot-60,r:2500,h:b.top-b.bot+70,tags:{geode:{kind:'band',band:b.id,y0:b.y0,y1:b.y1,n:L.length}}});});
 window._geodes={wall:R.filter(r=>r.kind==='wall').length,loose:R.filter(r=>r.kind==='loose').length,lining:LINING.length,counts:D.counts,tris:D.tris+RK.tris,ms:Math.round(performance.now()-t0)};
 return {records:R,bands,block:BK,lining:LINING,cavern:C,drawn,draw:D,rock:RK};})();
