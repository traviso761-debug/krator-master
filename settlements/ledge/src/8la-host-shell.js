// ================================================================= HOST — the shell: every deck drawn from its record (PLAN.md 9.3, 9.8)
// [draw] Nothing here decides where a deck is or what state it is in: LEDGE.deckBox gives its place, the layout its state and
// holder. What varies inside a deck (its blocks' reach, which windows are dark, the vines, the rebar) is LEDGE.draw by the deck's
// id (core/rand), never a stream. The form is the Ancients' target's (kits/ancients/targets/ledge): a slab with its root in the
// rock, rooms set back from a gallery and a parapet, a plenum under the soffit of the layer above, ribs on the soffit's exposed
// strip, a mullioned window wall; Ledge's own decks draw it at Ledge's size.
//
// LB, the box batch: boxes go into one buffer per material key (one mesh each at the end); a box's six faces may skip or take
// another key (the soffit's underside). UVs are world metres / 6 on the face's plane. Each box is its own connected piece
// (core/ruins reads it so).
const LB=(function(){const B={},F=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],FN=['px','nx','py','ny','pz','nz'];
 const v=new THREE.Vector3();
 function buf(k){return B[k]||(B[k]={p:[],n:[],u:[],i:[]});}
 function box(key,cx,cy,cz,sx,sy,sz,o){o=o||{};const q=o.q||null;
  for(let f=0;f<6;f++){const fn=FN[f];if(o.skip&&o.skip.indexOf(fn)>=0)continue;const k=(o.fm&&o.fm[fn])||key,b=buf(k),n=F[f];
   const ax=f<2?[[0,0,1],[0,1,0]]:f<4?[[1,0,0],[0,0,1]]:[[1,0,0],[0,1,0]];
   const base=b.p.length/3,cs=[[-1,-1],[1,-1],[1,1],[-1,1]];
   const nw=new THREE.Vector3(n[0],n[1],n[2]);if(q)nw.applyQuaternion(q);
   const dom=Math.abs(nw.x)>Math.abs(nw.y)&&Math.abs(nw.x)>Math.abs(nw.z)?0:Math.abs(nw.y)>Math.abs(nw.z)?1:2;
   for(const c of cs){v.set(n[0]*sx/2+(ax[0][0]*c[0]*sx+ax[1][0]*c[1]*sx)/2,n[1]*sy/2+(ax[0][1]*c[0]*sy+ax[1][1]*c[1]*sy)/2,n[2]*sz/2+(ax[0][2]*c[0]*sz+ax[1][2]*c[1]*sz)/2);
    if(q)v.applyQuaternion(q);v.x+=cx;v.y+=cy;v.z+=cz;b.p.push(v.x,v.y,v.z);b.n.push(nw.x,nw.y,nw.z);
    b.u.push((dom===0?v.z:v.x)/6,(dom===1?v.z:v.y)/6);}
   /* winding: counter-clockwise seen from outside. The corners run (-1,-1) (1,-1) (1,1) (-1,1) on the face's two axes, whose cross
      product is -x, -x, -y, -y, +z, +z for the six faces: kept where that is the face's own normal (-x, -y, +z), reversed elsewhere */
   if(f===1||f===3||f===4)b.i.push(base,base+1,base+2,base,base+2,base+3);else b.i.push(base,base+2,base+1,base,base+3,base+2);}}
 function flush(parent,mats,label){const out=[];
  for(const k in B){const b=B[k];if(!b.i.length)continue;const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(b.u,2));g.setIndex(b.i);g.computeBoundingSphere();
   const m=new THREE.Mesh(g,mats[k]||MAT.white);m.name=label+': '+k;m.userData.inspectLabel=label;parent.add(m);out.push(m);delete B[k];}
  return out;}
 return {box,flush,tris:()=>Object.keys(B).reduce((a,k)=>a+B[k].i.length/3,0)};})();

// the shell's materials: the kit's (its library pack binds MAT.white to the Ancients' panel), and four of the shell's own
const LMAT=(function(){const soffit=MAT.white.clone();soffit.color=new THREE.Color(0xd2ccc2);soffit.emissive=new THREE.Color(0x2c2924);
 /* the soffit's painted bounce light (the target's fix: nothing casts a shadow here, and a downward face lit by the hemisphere's ground
    colour alone reads brown) */
 const walled=MAT.white.clone();walled.color=new THREE.Color(0xb8ae9e);
 const cloth=new THREE.MeshStandardMaterial({color:0x2f7f78,roughness:.95,side:THREE.DoubleSide});
 const ochre=new THREE.MeshStandardMaterial({color:0xa8743a,roughness:.95,side:THREE.DoubleSide});
 const lampG=new THREE.MeshBasicMaterial({color:0x7dff9a}),lampR=new THREE.MeshBasicMaterial({color:0xff5a3c});
 return {panel:MAT.white,soffit,walled,win:MAT.winIntact,dead:MAT.winDead,guts:MAT.guts,rust:MAT.rust,vine:MAT.vine,green:MAT.vine,cloth,ochre,lampG,lampR};})();

const LSHELL=(function(){const L=LEDGE_LAYOUT,S=L.stack,W=L.world,R=new THREE.Group();R.name='the shell';scene.add(R);
 const dr=(id,i,salt)=>LEDGE.draw(W,id,i,salt);
 const ST=S.storey*S.storeys,box=LB.box,stats={decks:0,blocks:0,stubs:0};
 const deckAt=(k,w)=>L.decks[k*S.wings.length+S.wings.map(x=>x.id).indexOf(w)];
 const CONCOURSE={'d.20.c':1,'d.20.e1':1};
 // a broken deck's stub: the slab torn at L metres out, its reinforcement out of the break, the torn rooms' guts on the stub
 function stub(d,b,Ls,rooms,noSlab){const cx=(b.x0+b.x1)/2,sx=b.x1-b.x0,y=b.floor;
  if(!noSlab)box('panel',cx,y-S.slab/2,(Ls-.5)/2,sx,S.slab,Ls+.5,{fm:{ny:'soffit'}});
  if(rooms)box('guts',cx,y+rooms/2,(Ls-1)/2+.3,sx-.6,rooms,Math.max(.5,Ls-1.3),{skip:'nz'});
  const nb=Math.floor(sx/2.5);for(let i=0;i<nb;i++){if(dr(d.id,i,31)<.45)continue;const len=1.5+3*dr(d.id,i,32),a=.15+.5*dr(d.id,i,33);
   const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),a);
   const off=new THREE.Vector3(0,0,len/2).applyQuaternion(q);
   box('rust',b.x0+1.2+i*2.5,y-1-3*dr(d.id,i,34)+off.y,Ls-.1+off.z,.14,.14,len,{q});}
  stats.stubs++;}
 for(const d of L.decks){const b=LEDGE.deckBox(L,d),st=d.state,y=b.floor,cx=(b.x0+b.x1)/2,sx=b.x1-b.x0;stats.decks++;
  // the root, in the rock: every deck keeps it, whatever fell from it
  box('panel',cx,y-S.slab/2-.02,-(S.root+.3)/2,sx-.04,S.slab-.04,S.root-.3,{skip:'nz'});   /* its own piece: no corner shared with the slab (core/ruins joins shared corners) */
  if(st==='gone'){stub(d,b,3+2*dr(d.id,0,1),0);continue;}
  if(st==='pancaked'){stub(d,b,4+2*dr(d.id,0,1),0);continue;}
  if(st==='sheared'){stub(d,b,9+6*dr(d.id,0,1),ST*.5);continue;}
  const below=d.k>0?LEDGE.reachOf(L,d.k-1,LEDGE.wing(L,d.wing)):0;
  const nb=Math.max(1,Math.round(sx/45)),bw=sx/nb,lived=LEDGE.LIVED.indexOf(st)>=0;
  for(let i=0;i<nb;i++){const x0=b.x0+i*bw,x1=x0+bw,bx=(x0+x1)/2;stats.blocks++;
   const r=b.reach*(st==='damaged'?.5+.3*dr(d.id,i,2):.9+.1*dr(d.id,i,1)),zf=Math.max(4,r-S.gallery);
   box('panel',bx,y-S.slab/2,(r-.5)/2,bw,S.slab,r+.5,{fm:{ny:'soffit'},skip:'nz'});
   box('panel',bx,y+.55,r-.2,bw,1.1,.4);                                            /* the parapet */
   if(CONCOURSE[d.id]){                                                              /* the station's concourse: open, columns */
    for(let c=x0+6;c<x1-3;c+=14)for(let zc=8;zc<zf;zc+=16)box('panel',c,y+ST/2,zc,1.6,ST,1.6);
    continue;}
   const rz=st==='damaged'?zf*(.55+.3*dr(d.id,i,3)):zf;
   box('panel',bx,y+ST/2,(rz+.3)/2,bw-.6,ST,rz-.3,{skip:'nz'});                   /* the rooms */
   box('guts',bx,y+ST+S.plenum/2,Math.max(1,rz-4)/2,bw-.8,S.plenum,Math.max(1,rz-4.6),{skip:'nz'});   /* the plenum */
   // the window wall: a strip a storey, in 12 m segments, each lit (an intact pane) or dark by the state and the deck's draw
   const lit=st==='reclaimed'?.82:st==='kept'?.18:st==='squatted'?.25:st==='damaged'?.05:.04;
   for(let s=0;s<S.storeys;s++){const ys=y+1.6+S.storey*s+.9;
    for(let c=x0+.5;c<x1-.5;c+=12){const w=Math.min(12,x1-.5-c),u=dr(d.id,i*40+s,Math.round(c));
     box(st==='sealed'?'walled':(u<lit?'win':'dead'),c+w/2,ys,rz+.15,w-.3,1.8,.3);}}
   for(let c=x0+3;c<x1-1;c+=6)box('panel',c,y+ST/2,rz+.4,.5,ST,.8);                /* mullions */
   // the soffit's ribs on the strip the layer below does not cover
   if(r>below+3)for(let c=x0+5;c<x1-2;c+=10)box('soffit',c,y-S.slab-.6,(below+r)/2,.8,1.2,r-below);
   // life and decay on the gallery
   if(lived&&d.by==='dalab')for(let c=x0+8;c<x1-6;c+=24){box('green',c,y+.6,r-1.4,3,1.2,1.2);box('cloth',c+8,y+3.4,rz+2.6,6,.15,5);}
   if(lived&&d.by==='fellgang')for(let c=x0+10;c<x1-6;c+=30)box('ochre',c,y+3.4,rz+2.6,5,.15,5);
   if(st==='kept')for(let c=x0+10;c<x1-6;c+=20)box(((c-x0)/20|0)%2?'lampR':'lampG',c,y+3,rz+.5,.6,.6,.3);
   if(!lived)for(let c=x0+4;c<x1-3;c+=7){const u=dr(d.id,i*90+Math.round(c),5);if(u<.22){const len=4+10*dr(d.id,Math.round(c),6);box('vine',c,y-S.slab-len/2+.2,r-.25,1.4,len,.3);}}
   if(st==='damaged')stub(d,{x0,x1,floor:y},r,0,true);
  }}
 // THE PANCAKED WING (E2, k 29-35 onto k 28): the seven slabs crushed onto the 28th's rooms, their outer ends draped over its gallery
 (function(){const ks=L.decks.filter(d=>d.state==='pancaked').map(d=>d.k).sort((a,b)=>a-b);if(!ks.length)return;
  const base=deckAt(ks[0]-1,'e2'),bb=LEDGE.deckBox(L,base),zf=bb.reach-S.gallery,cx=(bb.x0+bb.x1)/2,sx=bb.x1-bb.x0;
  let yb=bb.floor+ST;
  ks.forEach((k,i)=>{const d=deckAt(k,'e2'),db=LEDGE.deckBox(L,d),sh=dr(d.id,0,40)*2-1;
   box('guts',cx,yb+.6,zf/2+.3,sx-2,1.2,zf-.6);yb+=1.2;
   box('panel',cx+sh,yb+S.slab/2,zf/2+.3,sx-1,S.slab,zf-.6,{fm:{ny:'soffit'}});
   const Ld=db.reach-zf,a=.32+.06*i+.1*dr(d.id,0,41),q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),a);
   const off=new THREE.Vector3(0,0,Ld/2).applyQuaternion(q);
   box('panel',cx+sh,yb+S.slab/2+off.y,zf+off.z,sx-1,S.slab,Ld,{q,fm:{ny:'soffit'}});
   yb+=S.slab;});})();
 // THE FACE CORES: a 12 m tower a layer at a time, where the deck it passes through is not broken (damaged ones carry it)
 L.lifts.filter(lf=>lf.kind==='core').forEach(lf=>{for(let k=0;k<S.n;k++){
  const d=L.decks.find(q=>q.k===k&&(()=>{const b=LEDGE.deckBox(L,q);return lf.x>=b.x0&&lf.x<b.x1;})());if(!d||['sheared','pancaked','gone'].indexOf(d.state)>=0)continue;
  const y0=LEDGE.layerY(L,k)-S.slab,runs=lf.runs&&y0+S.pitch>lf.runs[0]&&y0<lf.runs[1];
  box('panel',lf.x,y0+S.pitch/2,lf.z,lf.w,S.pitch,lf.d);
  box(runs?'win':'dead',lf.x,y0+S.pitch/2,lf.z+lf.d/2+.15,2.4,S.pitch-2,.3);}});
 const meshes=LB.flush(R,LMAT,'the shell');
 return {root:R,meshes,stats,tris:meshes.reduce((a,m)=>a+m.geometry.index.count/3,0)};})();
