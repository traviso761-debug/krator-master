// ================================================================= HOST — the cliff sites, kept bare for the settlement plan (PLAN.md section 5a)
// The kit draws no building (the Painted Men's towns are a settlement plan's: the Highlands Tribal kit and the catalog's `painted` culture). It draws the
// landform and leaves it ready:
//   ALCOVES   (the cliff town's wall, station 4) KCARVE alcoves (core/terrain 36) in each danxia cliff at its sandstone-clay contact, the seep line:
//             Mesa Verde's geology, the water stopping on the clay and spalling the sandstone above it. A seep at each back wall (WATER.spring, 89w)
//   LEDGES    the benches on each sandstone's top, between the cliff's lip and the next clay slope (stations 3 and 4)
//   TALUS     the benches at a cliff's foot on the clay (station 4)
// Every site is a core/tags record (REGISTER: zone 'cliff-alcove' | 'cliff-ledge' | 'talus-bench', culture 'painted', its floor height, depth, width,
// aspect, the seep and a ladder line to the next tier's site) registered before anything is drawn, and painted into a core/mask raster (KMASK.canvas:
// hard-edged, the same bytes on every machine) that the placement reads as bare (KEEP_BARE: 45's rootMask). Nothing is placed in them.
// The plan proposed a `site` tag key; core/tags' vocabulary has `zone` (free) already, so the records use it (KNOWN_ISSUES.md).
const SITES_CLIFF=[],SEEPS=[];
const BARE_MASK=(function(){const N=1024,S=TERR.R*2.2,mv=KMASK.canvas(N,N),g=mv.getContext('2d'),px=v=>(v/S+.5)*N;g.fillStyle='#ffffff';
 return{N,S,mv,g,px,disc(x,z,r){g.beginPath();g.arc(px(x),px(z),Math.max(1,r/S*N),0,TAU);g.fill();},
  rect(x0,z0,x1,z1){g.fillRect(px(Math.min(x0,x1)),px(Math.min(z0,z1)),Math.max(1,Math.abs(x1-x0)/S*N),Math.max(1,Math.abs(z1-z0)/S*N));},
  at(x,z){const i=Math.floor(px(x)),j=Math.floor(px(z));if(i<0||j<0||i>=N||j>=N)return 0;return mv.data[(j*N+i)*4];}};})();
KEEP_BARE=(x,z)=>BARE_MASK.at(x,z)>0?0:1;
// the bloom flats: the pigment pit and the stone circles kept clear
if(SKEY==='bloom'){BARE_MASK.disc(SITE.pit.x,SITE.pit.z,SITE.pit.r+8);SITE.circles.forEach(c=>BARE_MASK.disc(c[0],c[1],c[2]+2.5));}
// THE CANYON'S LEDGES (station 3): the bench at the contact on both walls, as ledge records every ~300 m along the canyon
if(SKEY==='canyon'){const K=SITE.canyon;
 for(const side of [-1,1])for(let x=-2200,i=0;x<=2200;x+=320,i++){const c=L.cz(x),hw=K.floorW/2,C=contactAt(x,c),d0=(C-L.fl(x))/.84;const a=side*(hw+d0+K.benchW*.45),z=c+a,y=terrainH(x,z);
  if(Math.abs(y-C)>12)continue;const id='canyon-ledge-'+(side<0?'n':'s')+i;
  const rec={name:'A ledge on the canyon\'s '+(side<0?'north':'south')+' wall (the contact bench, kept for the ledge villages)',x,z,y:y-2,r:34,h:16,tags:{zone:'cliff-ledge',culture:'painted',landmark:true},
   site:{id,kind:'cliff-ledge',floorY:+y.toFixed(1),width:68,depth:+(K.benchW*.8).toFixed(0),aspect:side<0?'south':'north',seep:null,ladder:null}};
  SITES_CLIFF.push(rec);BARE_MASK.disc(x,z,30);}}
// THE CLIFF TOWN'S WALL (station 4): per tier, alcoves KRAND-spaced along x at the contact, a ledge on the tier's bench above, a talus bench below
if(SKEY==='cliff'){const T=SITE.tiers;
 for(let i=0;i<T.length;i++){const C=L.BOT[i],top=Math.min(T[i].top,L.TOP[i]),run=(top-C)/3.4;
  for(let k=0;k<4;k++){const h=KRAND.hash(6200+SITE.n,i,k),u=q=>KRAND.unit(KRAND.hash(h,q,0,62)),x=-1800+k*1200+(u(1)-.5)*500,z0=L.zw(x,i),zc=z0-run;
   const hw=Math.round(20+18*u(2)),depth=Math.round(14+10*u(3)),hh=Math.min(Math.round(11+9*u(4)),Math.round((top-C)*.6));
   const id='alcove-'+i+'-'+k,seep={x,y:C+.4,z:zc+depth*.85};
   const Q=KCARVE.add({id,kind:'alcove',c:[x,zc],n:[0,-1],hw,depth,h:hh,floorY:C,base:(px,pz)=>L.land(px,pz),margin:17,pad:12,cell:1.2,name:'An alcove at the seep line'});
   SITES_CLIFF.push({name:'An alcove at the seep line (tier '+(i+1)+', '+Math.round(C)+' m: sandstone over clay; empty, for the cliff town)',x,z:zc+depth*.4,y:C-1,r:hw,h:hh+3,
    tags:{zone:'cliff-alcove',culture:'painted',landmark:true},
    site:{id,kind:'cliff-alcove',floorY:C,width:hw*2,depth,h:hh,aspect:'north',seep:[+seep.x.toFixed(1),+seep.y.toFixed(1),+seep.z.toFixed(1)],ladder:null,patch:Q.id}});
   SEEPS.push({x:seep.x,y:seep.y,z:seep.z,nx:0,nz:-1,alcove:id});BARE_MASK.disc(x,zc,hw+6);
   // the talus bench below it, on the clay
   const tz=zc-36,ty=L.land(x,tz);SITES_CLIFF.push({name:'A talus bench under the alcove (tier '+(i+1)+')',x,z:tz,y:ty-3,r:hw*.8,h:12,tags:{zone:'talus-bench',culture:'painted',landmark:true},
    site:{id:'talus-'+i+'-'+k,kind:'talus-bench',floorY:+ty.toFixed(1),width:Math.round(hw*1.6),depth:24,aspect:'north',seep:null,ladder:null}});BARE_MASK.disc(x,tz,hw*.8);}
  // the ledge on the tier's bench, a strip along x behind the lip (the next tier's clay starts above it)
  if(i<T.length-1){const zl=L.zw(0,i)+35,yl=L.land(0,zl);SITES_CLIFF.push({name:'The ledge on tier '+(i+1)+' (the sandstone\'s top: gardens and the stair-walks)',x:0,z:zl,y:yl-3,r:60,h:14,
   tags:{zone:'cliff-ledge',culture:'painted',landmark:true},site:{id:'ledge-'+i,kind:'cliff-ledge',floorY:+yl.toFixed(1),width:2400,depth:40,aspect:'north',seep:null,ladder:null}});
   for(let x=-1800;x<=1800;x+=60)BARE_MASK.disc(x,L.zw(x,i)+30,14);}}
 // the ladder lines: each alcove to the alcove over it (the notched-log ladders and toeholds; PLAN.md section 5a, "How they climb")
 const AL=SITES_CLIFF.filter(r=>r.site.kind==='cliff-alcove');AL.forEach(r=>{const up=AL.filter(o=>o.site.floorY>r.site.floorY).sort((a,b)=>a.site.floorY-b.site.floorY||Math.abs(a.x-r.x)-Math.abs(b.x-r.x));
  if(up.length){const nx=up.filter(o=>o.site.floorY===up[0].site.floorY).sort((a,b)=>Math.abs(a.x-r.x)-Math.abs(b.x-r.x))[0];r.site.ladder={to:nx.site.id,from:[r.x,r.site.floorY,r.z],at:[nx.x,nx.site.floorY,nx.z]};}});
 /* the ground takes the recesses: the floor under each hood, rising steeply enough to fit inside its margin (KCARVE.minSteep) */
 let st=40;KCARVE.patches.forEach(Q=>{st=Math.max(st,KCARVE.minSteep(Q)*1.2);});const CST=st;
 CARVE_FOLD=(h,x,z)=>KCARVE.fold(h,x,z,{steep:CST});}
// THE PIGMENT WORKS (the bloom flats; PLAN.md section 5, "pigment pits and quarry benches cut into the bright beds (a KCAMP work camp)"): core/camp's
// work camp, its yard the pit, its stands the cells of a 300 m world grid within 2.4 km where the bright beds (the teal, the maroon, the pink and the
// gold clays, the danxia's red) lie bare at the surface; a stand's capacity the bright samples it holds. Data only: the camp's tents are the Painted
// Men's (a settlement plan's), so nothing is drawn; the stands and the camp's first pitch are exported with the sites (99: export sites)
const PIGMENT=(function(){if(SKEY!=='bloom'||typeof KCAMP==='undefined'||!KCAMP.workCamp)return null;
 const BRIGHT={teal:4,maroon:2,pink:1,gold:1,red:2},yard=[SITE.pit.x,SITE.pit.z];
 const capacity=(x,z,cell)=>{let n=0;for(let j=0;j<6;j++)for(let i=0;i<6;i++){const px=x-cell/2+(i+.5)*cell/6,pz=z-cell/2+(j+.5)*cell/6;
  if(FC.at(FC.a.bare,px,pz)<.5)continue;const k=STRATA_DATA.at(px,L.land(px,pz)-.3,pz).kind;n+=BRIGHT[k]||0;}return n;};
 const stands=KCAMP.stands({id:'painted-pigment',range:2400,yard,cell:300,minCap:2,capacity});
 const W=KCAMP.workCamp({id:'painted-pigment',world:4402,yard,stands,cfg:{regrowDays:3650,strikeAt:.3}});   /* a bed grows back only as the clay weathers: ten years */
 const first=stands.length&&KCAMP.workStart?KCAMP.workStart(W,0):null;
 return{W,stands,first,beds:Object.keys(BRIGHT)};})();
SITES_CLIFF.forEach(r=>REGISTER(r));
/* the sites' anchors (korona's rock anchors): one invisible instance at each site's floor, so the probe finds what the record names (an empty site is
   empty on purpose: the settlement plan fills it) */
if(SITES_CLIFF.length){const A=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({visible:false}),SITES_CLIFF.length),M4=new THREE.Matrix4();
 SITES_CLIFF.forEach((r,i)=>{M4.makeTranslation(r.x,r.y+3,r.z);A.setMatrixAt(i,M4);});A.userData.host=true;A.userData.inspectLabel='cliff site anchors';A.frustumCulled=false;scene.add(A);}
window._sites={pigmentStands:PIGMENT?PIGMENT.stands.length:0,alcoves:SITES_CLIFF.filter(r=>r.site.kind==='cliff-alcove').length,ledges:SITES_CLIFF.filter(r=>r.site.kind==='cliff-ledge').length,talus:SITES_CLIFF.filter(r=>r.site.kind==='talus-bench').length,seeps:SEEPS.length,mask:KMASK.hash(BARE_MASK.mv)};
