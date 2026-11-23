// ================================================================= THE BEACON - the grounds outside the walls (the build's step P2; sheet T0)
// The layout's outside parts (zone 'site') and its two ways, on the model's ground beyond the house's lot:
//   - the West, East and North Terraces tiled with the Xanadu kit's terraced fields (xa_farm), each tile on the high side of its
//     footprint with its footing down to the low side (XA.def's o.drop);
//   - the byres and dairy (the kit's xa_farmhouse and xa_dairy, a long byre shed), the hives, the tea garden's rows, the
//     threshing floor, the midden (a core/terrain KRUBBLE heap through 80g's xfHeap), the saddle tank, the carters' yard with its
//     low walls (90r's bc_wall) and its shed;
//   - the road from Erehwon and the fort road: ribbons laid on the ground.
// Every piece registers in core/tags as it draws; window._beaconGrounds records each piece's footprint, base and footing for the
// verify (grounds-on-the-ground). [web]: three.js.
const BC_OUT=new THREE.Group();BC_OUT.name='The Beacon - the grounds';scene.add(BC_OUT);
const BC_OUTREC=[];
/* the lowest and highest ground under a page box [x0, x1, z0, z1] */
function bcBoxGround(b){let lo=1e9,hi=-1e9;const sx=Math.max(1.5,(b[1]-b[0])/10),sz=Math.max(1.5,(b[3]-b[2])/10);
 for(let x=b[0];x<=b[1]+1e-6;x+=sx)for(let z=b[2];z<=b[3]+1e-6;z+=sz){const h=terrainH(x,z);lo=Math.min(lo,h);hi=Math.max(hi,h);}return[lo,hi];}
const bcPageBox=p=>[p.box[2],p.box[3],p.box[0],p.box[1]];
/* place a def; mode 'footed' (on the high side, a footing to the low) or 'draped' (at the low side, its pieces on the ground) */
function bcOut(key,id,b,mode,o){const[lo,hi]=bcBoxGround(b),x=(b[0]+b[1])/2,z=(b[2]+b[3])/2,y=mode==='footed'?hi+.05:lo,drop=mode==='footed'?hi-lo+.35:0;
 TSTAT.cur=key+'/0';const r0=REG.length,g=VERN.place(BC_OUT,key,x,z,0,Object.assign({},o||{},key.indexOf('xa_')===0?{y,drop}:{y,fdrop:drop}));for(let i=r0;i<REG.length;i++)REG[i].type=key;TSTAT.cur=null;
 BC_OUTREC.push({id,key,box:b.map(v=>Math.round(v*10)/10),mode,y:Math.round(y*100)/100,drop:Math.round(drop*100)/100});return g;}
const bcLoc=(x,z)=>{const c=VERN.cur;return[c.x+x,c.z+z];};   /* a local point's world x, z (the defs here are placed unturned) */
const bcLocH=(x,z)=>{const p=bcLoc(x,z);return terrainH(p[0],p[1])-(VERN.cur.o.y||0);};   /* the ground's height in the def's frame */
// ---------------------------------------------------------------- the defs
function bcShedBuild(G,o){reseed(34700+(o.n|0));const w=o.w,d=o.d,col=xC(xPick(XPAL.earth));vnReg(o.name,0,0,Math.max(w,d)/2,o.h+1.5,{part:'shed'});
 if(o.fdrop>0)xnFooting(0,0,w,d,0,o.fdrop,xC(xPick(XPAL.rubble)));
 const S=xnStack(0,0,0,w,d,0,[o.h],col,'earth');vnShedRoof(0,S.y,0,w+.4,d+.4,.5,0,'vThatchB',xC(xPick(VPAL.thatch)),.35);
 const n=Math.max(1,Math.round(w/7));for(let i=0;i<n;i++)xnDoorway(-w/2+w*(i+.5)/n,0,d/2+.02,0,1.8,2.4,{c:xC(XPAL.dark[0])});}
XA.def({key:'bc_shed',name:'The Beacon - a byre or shed',family:'The Beacon',tags:XTAG_BC('farm'),w:20,d:8,h:5,nv:1,build:bcShedBuild});
function bcHivesBuild(G,o){reseed(34710);const w=o.w,d=o.d,c=xC(0xc8a060),r=xC(xPick(XPAL.dark));vnReg('Hives',0,0,Math.max(w,d)/2,1.5,{part:'hives'});
 for(let i=0;i<5;i++)for(let j=0;j<4;j++){const x=-w/2+3+(w-6)*i/4,z=-d/2+3+(d-6)*j/3,y=bcLocH(x,z);vB('vWood',x,y,z,.9,.45,.9,0,r);kput('xDrumE',[x,y+.45,z],null,[.75,.7,.75],c);}}   /* straw skeps on their stands */
XA.def({key:'bc_hives',name:'The Beacon - the hives',family:'The Beacon',tags:XTAG_BC('farm'),w:30,d:30,h:2,nv:1,build:bcHivesBuild});
function bcTeaBuild(G,o){reseed(34720);const w=o.w,d=o.d,c=xC(0x3e5a2e);vnReg('Tea Garden',0,0,Math.max(w,d)/2,1.5,{part:'tea'});
 for(let row=0;row<Math.floor(d/2.4);row++){const z=-d/2+1.2+row*2.4;for(let x=-w/2+1;x<w/2-.5;x+=1.6){const y=bcLocH(x,z);kput('xLeaf',[x,y+.45,z],qEuler(0,rng()*TAU,0),[1.1,.9,1.1],c.clone().multiplyScalar(rr(.85,1.1)));}}}
XA.def({key:'bc_tea',name:'The Beacon - the tea garden',family:'The Beacon',tags:XTAG_BC('farm'),w:70,d:40,h:2,nv:1,build:bcTeaBuild});
function bcFloorBuild(G,o){reseed(34730);vnReg(o.name,0,0,o.r,1,{part:o.part});const st=xC(xPick(QSTONE));
 if(o.part==='threshing')kput('xDrumE',[0,-o.fdrop,0],null,[o.r*2,o.fdrop+.3,o.r*2],st);
 else if(o.part==='tank'){const w=o.w,d=o.d,h=o.fdrop+.9;for(const e of[[0,d/2,w,.8],[0,-d/2,w,.8],[w/2,0,.8,d],[-w/2,0,.8,d]])vB('vStone',e[0],-o.fdrop,e[1],e[2],h,e[3],0,st);
  vB('vStone',0,-o.fdrop,0,w-.8,.2,d-.8,0,xC(0x4a4238));vB('vStone',0,-o.fdrop+.2,0,w-.9,Math.max(.4,o.fdrop*.6),d-.9,0,xC(0x2e4c56));}   /* the tank: walls to the uphill side, its water at mid-depth */
 else if(o.part==='midden')xfHeap({id:'midden',x:0,z:0,rx:o.w*.42,rz:o.d*.4,ry:0,h:1.6,seed:KRAND.child(20261123,'midden')},xC(0x5a4a34));}
XA.def({key:'bc_floor',name:'The Beacon - a floor, tank or heap',family:'The Beacon',tags:XTAG_BC('farm'),w:20,d:20,h:2,nv:1,build:bcFloorBuild});
function bcWayBuild(G,o){reseed(34740);const P=o.pts,pos=[],idx=[],hw=o.w/2;let n=0;vnReg(o.name,o.mid[0],o.mid[1],o.r,o.h,{part:'road'});   /* the def stands at the road's lowest ground (o.y), its volume up to its highest */
 for(let i=0;i+1<P.length;i++){const a=P[i],b=P[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(L/3)),nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;
  for(let j=(i?1:0);j<=k;j++){const t=j/k,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
   for(const s of[-1,1]){const px=x+nx*hw*s,pz=z+nz*hw*s;pos.push(px,terrainH(px,pz)+.22,pz);}
   if(n){const q=2*n;idx.push(q-2,q-1,q,q-1,q+1,q);}n++;}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
 const M=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:o.col,roughness:1,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide}));
 M.name=o.name;M.userData.decor=true;M.userData.isWay=true;scene.add(M);BC_WAYS.push(M);}   /* in world coordinates; its volume (above) stands at the road's own height */   /* in the def's group (placed at the origin, unturned: its points are the world's) */
const BC_WAYS=[];
XA.def({key:'bc_way',name:'The Beacon - a road',family:'The Beacon',tags:XTAG_BC('infrastructure'),w:10,d:10,h:1,nv:1,build:bcWayBuild});
// ---------------------------------------------------------------- placing the grounds
{const S=BCL.parts.filter(p=>p.zone==='site');let n=0;
 for(const p of S){const b=bcPageBox(p),W=b[1]-b[0],D=b[3]-b[2];
  if(p.kind==='terrace'){const nx=Math.max(1,Math.floor(W/56)),nz=Math.max(1,Math.floor(D/44)),tw=W/nx,td=D/nz;
   for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const x0=b[0]+tw*i,z0=b[2]+td*j;bcOut('xa_farm',p.id,[x0+(tw-48)/2,x0+(tw+48)/2,z0+(td-40)/2,z0+(td+40)/2],'footed',{v:(i+j)%3});}}
  else if(p.kind==='byre'){bcOut('xa_farmhouse',p.id,[b[0]+2,b[0]+26,b[2]+2,b[2]+22],'footed',{v:0});bcOut('xa_dairy',p.id,[b[0]+30,b[0]+40,b[2]+6,b[2]+13],'footed',{v:0});
   bcOut('bc_shed',p.id,[b[0]+4,b[1]-4,b[3]-16,b[3]-6],'footed',{w:W-8,d:10,h:4.2,name:'Byres',n:n++});}
  else if(p.kind==='caravanserai'){const lo=bcBoxGround(b)[0];bcOut('bc_shed',p.id,[b[0]+3,b[1]-3,b[2]+3,b[2]+13],'footed',{w:W-6,d:10,h:4.6,name:'Carters\' sheds',n:n++});
   /* the yard's low walls (90r's bc_wall), its gate east toward the road */
   const ring=[[b[0],b[2]],[b[1],b[2]],[b[1],b[3]],[b[0],b[3]]];for(let k=0;k<4;k++){const a=ring[k],c=ring[(k+1)%4],mid=[(a[0]+c[0])/2,(a[1]+c[1])/2],ins=[(b[0]+b[1])/2-mid[0],(b[2]+b[3])/2-mid[1]],L=Math.hypot(ins[0],ins[1]),out=[-ins[0]/L,-ins[1]/L];
    const seg=(u0,u1)=>{const A=[a[0]+(c[0]-a[0])*u0,a[1]+(c[1]-a[1])*u0],B=[a[0]+(c[0]-a[0])*u1,a[1]+(c[1]-a[1])*u1],y=Math.min(terrainH(A[0],A[1]),terrainH(B[0],B[1]));
     TSTAT.cur='bc_wall/0';const r0=REG.length;VERN.place(BC_OUT,'bc_wall',0,0,0,{a:A,b:B,h:2.4+Math.abs(terrainH(A[0],A[1])-terrainH(B[0],B[1])),t:.9,out,merlons:false,name:'the carters\' yard wall',n:200+k,y});for(let i=r0;i<REG.length;i++)REG[i].type='bc_wall';TSTAT.cur=null;};
    if(k===1){seg(0,.42);seg(.58,1);}else{for(let s=0;s<4;s++)seg(s/4,(s+1)/4);}}
   BC_OUTREC.push({id:p.id,key:'bc_wall',box:b,mode:'walls',y:Math.round(lo*100)/100,drop:0});}
  else if(p.kind==='hives')bcOut('bc_hives',p.id,b,'draped',{w:W,d:D});
  else if(p.kind==='field')bcOut('bc_tea',p.id,b,'draped',{w:W,d:D});
  else if(p.kind==='threshing')bcOut('bc_floor',p.id,b,'footed',{part:'threshing',name:p.name,r:W/2});
  else if(p.kind==='tank')bcOut('bc_floor',p.id,b,'footed',{part:'tank',name:p.name,w:W,d:D,r:Math.max(W,D)/2});
  else if(p.kind==='midden')bcOut('bc_floor',p.id,b,'draped',{part:'midden',name:p.name,w:W,d:D,r:Math.max(W,D)/2});}
 /* the ways: the road from Erehwon and the fort road (the layout's u, v to the page's x, z) */
 for(const w of BCL.ways.filter(q=>q.id!=='kora.path')){const pts=w.pts.map(p=>[p[1],p[0]]),xs=pts.map(p=>p[0]),zs=pts.map(p=>p[1]),mid=[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...zs)+Math.max(...zs))/2];
  const hs=[];for(let i=0;i+1<pts.length;i++)for(let k=0;k<=20;k++){const t=k/20;hs.push(terrainH(pts[i][0]+(pts[i+1][0]-pts[i][0])*t,pts[i][1]+(pts[i+1][1]-pts[i][1])*t));}
  const y0=Math.min(...hs)-.5,h=Math.max(...hs)-y0+1.5;
  TSTAT.cur='bc_way/0';const r0=REG.length;VERN.place(BC_OUT,'bc_way',0,0,0,{y:y0,h,pts,w:w.id==='road'?5:3.6,col:w.id==='road'?0x8a7a5e:0x7c6e56,name:w.name.split(' (')[0],mid,r:Math.max(...pts.map(p=>Math.hypot(p[0]-mid[0],p[1]-mid[1])))});for(let i=r0;i<REG.length;i++)REG[i].type='bc_way';TSTAT.cur=null;}}
kbake(BC_OUT);
window._beaconGrounds={pieces:BC_OUTREC,parts:[...new Set(BC_OUTREC.map(r=>r.id))],ways:BC_WAYS.length};
