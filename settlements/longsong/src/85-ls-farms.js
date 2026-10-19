// ================================================================= HOST — the farms and the gardens, drawn from the plan
// [draw] ROOMS.md section 5; the records are 40b-ls-farms.js (LS.FARMS), the crops the Crops kit's (kits/crops). Every
// group is a core/tags record (class feature, types farm) before it is drawn; nothing here decides where a thing goes.
//   the fields' ground   one merged mesh: each strip, terrace, pool and bed draped over the land, coloured by its crop
//                        (the library's tilled soil under it), furrows across its rows
//   the crops            the library's crop and orchard cards (materials.json c_*) in one atlas, crossed cards, one draw;
//                        a crop's card is the Crops kit's own (CROPS.BY_ID[id].card) where the atlas has it
//   the walls            dry stone round the groups and between their strips, the terraces' risers (ARCH drystone)
//   the works            the leat and the tail race, the tsampa mill's wheel and the paper mill's, the threshing floors,
//                        the field shrines, the bee wall, the dye house's drying poles, the herders' tents and pens
//   the herds            yak and dzo as placeholder figures (instanced) until the fauna kit has a yak
// Its own seeds through core/rand (KRAND.hash of the group, the cell and the index), never a running stream.
const FARMDRAW=(function(){const F=LS.FARMS,SEED=KRAND.child(5150,'longsong-farms');
 const u=(...a)=>KRAND.unit(KRAND.hash(SEED,...a));
 const C=h=>new THREE.Color(h).convertSRGBToLinear();
 // ---------------------------------------------------------------- what a crop looks like: its ground's colour, its card, its height, its spacing
 const TONE={frostoat:0xb4ae64,emmer:0xc4a85a,'basin-amaranth':0x9a4a44,'wild-rice':0x5e8a5a,'helix-bean':0x5a7438,frostroot:0x6a8444,flax:0x7088b0,
  fallow:0x8a7c5c,saffron:0x7a62a0,tea:0x3a5630,greens:0x587e38,murnong:0x6e8e44,'umbel-seed':0xa8a868,fiddlehead:0x46723a,'monks-sage':0x84947a,
  woad:0xb8b444,broom:0xc8b444,'snow-lotus':0xc8ccc0,'valley-ginseng':0x46663a,'sky-poppy':0x6688bc,camphor:0x46663a,'chalice-grass':0x94aa9c};
 // the atlas: one cell per card family (materials.json); a crop takes the Crops kit's card when the atlas has it
 const CELLS=['c_grain','c_bean','c_clover','c_flax','c_plume','c_saffron','c_woad','c_tea','c_greens','c_rosette','c_orchard','c_blossom','c_weeper','c_juniper','c_sage','c_broom'];
 const LIBS={};CELLS.forEach((f,i)=>{const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong',f):null;if(L)LIBS[L.lib]=i;});
 const FALL={'umbel-seed':'c_sage','snow-lotus':'c_rosette','valley-ginseng':'c_greens','sky-poppy':'c_flax',camphor:'c_orchard','chalice-grass':'c_grain',
  fiddlehead:'c_greens',greens:'c_greens',apricot:'c_orchard',crabapple:'c_orchard',persimmon:'c_orchard',mulberry:'c_orchard',cherry:'c_blossom',willow:'c_weeper',juniper:'c_juniper','monks-sage':'c_sage'};
 const cellOf=id=>{const R=typeof CROPS!=='undefined'&&CROPS.BY_ID[id];if(R&&R.card&&LIBS[R.card]!=null)return LIBS[R.card];const f=FALL[id];const i=f?CELLS.indexOf(f):-1;
  return i>=0&&(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed('longsong',f))?i:-1;};
 const HT={frostoat:1,emmer:1.1,'basin-amaranth':1.5,'wild-rice':1.1,'helix-bean':.8,frostroot:.5,flax:.8,saffron:.35,tea:1.1,greens:.5,murnong:.4,'umbel-seed':.9,
  fiddlehead:.6,'monks-sage':.6,woad:.8,broom:1.2,'snow-lotus':.4,'valley-ginseng':.5,'sky-poppy':.7,camphor:2.4,'chalice-grass':1.3};
 const STEP=o=>o.kind==='beds'?1.1:o.kind==='pools'?1.6:o.id==='tea-garden'?1.5:2.3;
 // ---------------------------------------------------------------- the records
 const FREC={};
 F.GROUPS.forEach(o=>{const cx=(o.x0+o.x1)/2,cz=(o.z0+o.z1)/2;let lo=1e9;for(const a of [0,.5,1])for(const b of [0,.5,1])lo=Math.min(lo,terrainH(lerp(o.x0,o.x1,a),lerp(o.z0,o.z1,b)));
  const kind=o.kind==='orchard'?'orchard':o.kind==='grove'?'grove':o.kind==='pasture'?'pasture':o.kind==='beds'?'garden':'field';
  const rec={name:o.name,cls:'feature',kind,key:'longsong_farm_'+o.id,x:cx,z:cz,y:lo-1.5,r:Math.hypot(o.x1-o.x0,o.z1-o.z0)/2,h:kind==='pasture'?260:o.kind==='grove'?18:o.kind==='orchard'?10:o.id==='terraces-south'||o.id==='tea-garden'?40:8,
   tags:{culture:'order',types:kind==='garden'||kind==='orchard'?['farm','park']:['farm']},note:o.who?'worked by '+o.who:null};
  REGISTER(rec);FREC[o.id]=rec;});
 // ---------------------------------------------------------------- the fields' ground: one mesh
 const pos=[],col=[],uv=[],row=[],idx=[];const tc=new THREE.Color();
 const sheet=(x0,x1,z0,z1,step,hAt,tone,rowOf,wet)=>{const nx=Math.max(1,Math.ceil((x1-x0)/step)),nz=Math.max(1,Math.ceil((z1-z0)/step)),o=pos.length/3;
  for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const x=lerp(x0,x1,i/nx),z=lerp(z0,z1,j/nz),n=fbm(x*.05,z*.05,77,2)-.5;
   pos.push(x,hAt(x,z),z);tc.set(tone).convertSRGBToLinear().multiplyScalar(.9+n*.5);col.push(tc.r,tc.g,tc.b);uv.push(x/4,z/4);row.push(wet?-1:rowOf(x,z));}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=o+j*(nx+1)+i,b=a+nx+1;idx.push(a,b,a+1,b,b+1,a+1);}};
 const lift=.14;
 F.GROUPS.forEach(o=>{if(!(o.kind==='strips'||o.kind==='terraces'||o.kind==='pools'||o.kind==='beds'))return;
  F.strips(o).forEach(s=>{const tone=TONE[s.crop]==null?0x7a6a4a:TONE[s.crop],st=Math.min(3,(s.x1-s.x0)/2,(s.z1-s.z0)/2);
   if(o.kind==='pools'){const w=Math.min(terrainH(s.x0,s.z0),terrainH(s.x1,s.z0),terrainH(s.x0,s.z1),terrainH(s.x1,s.z1))+.12;
    sheet(s.x0,s.x1,s.z0,s.z1,st,()=>w,0x4a6a62,()=>0,true);return;}
   const raise=o.kind==='beds'?.3:lift,ns=o.run!=='ew'&&o.kind!=='terraces';
   sheet(s.x0,s.x1,s.z0,s.z1,st,(x,z)=>terrainH(x,z)+raise,tone,ns?(x=>x):((x,z)=>z),false);});});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('aRow',new THREE.Float32BufferAttribute(row,1));g.setIndex(idx);g.computeVertexNormals();
 const TL=(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong','tilled'):null,TT=TL?KMAT.textures(TL,{aniso:8}):null;
 const gm=new THREE.MeshLambertMaterial({vertexColors:true,map:TT?TT.map:null,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 // the furrows: across the rows (aRow is the coordinate across them), every 0.8 m; a pool's water (aRow -1) is left smooth
 gm.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aRow;varying float vRow;varying float vDist;').replace('#include <begin_vertex>','#include <begin_vertex>\nvRow=aRow;')
   .replace('#include <project_vertex>','#include <project_vertex>\nvDist=-mvPosition.z;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vRow;varying float vDist;')
   .replace('#include <map_fragment>',TT?'#include <map_fragment>\ndiffuseColor.rgb*=1.9;':'#include <map_fragment>')
   .replace('#include <color_fragment>','#include <color_fragment>\nif(vRow>-.5){float f=abs(fract(vRow/0.8)-.5)*2.;float k=1.-smoothstep(40.,160.,vDist);diffuseColor.rgb*=mix(1.,mix(.72,1.06,smoothstep(.15,.6,f)),k);}');};
 gm.customProgramCacheKey=()=>'ls-fields'+(TT?'t':'');
 const ground=new THREE.Mesh(g,gm);ground.userData.host=true;ground.userData.arch=true;ground.userData.cls='feature';ground.userData.inspectLabel='The fields (the Order\'s and its tenants\')';scene.add(ground);

 // ---------------------------------------------------------------- the crops and the trees: the cards
 const cards={pos:[],nor:[],uv:[],col:[]};let nCards=0;
 const CW=512,cv=document.createElement('canvas');cv.width=CW*4;cv.height=CW*4;const g2=cv.getContext('2d');
 const atlas=new THREE.CanvasTexture(cv);atlas.encoding=THREE.sRGBEncoding;atlas.anisotropy=4;
 CELLS.forEach((f,i)=>{const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong',f):null;if(!L)return;
  KMAT.image(L,img=>{g2.drawImage(img,(i%4)*CW,Math.floor(i/4)*CW,CW,CW);atlas.needsUpdate=true;});});
 const cellUV=i=>{const cx=i%4,cy=Math.floor(i/4),e=3/(CW*4);return [cx/4+e,1-(cy+1)/4+e,(cx+1)/4-e,1-cy/4-e];};
 const quadC=(P,n,cell,k)=>{const U=cellUV(cell),T=[[U[0],U[1]],[U[2],U[1]],[U[2],U[3]],[U[0],U[3]]];
  for(const j of [0,1,2,0,2,3]){cards.pos.push(P[j][0],P[j][1],P[j][2]);cards.nor.push(n[0],n[1],n[2]);cards.uv.push(T[j][0],T[j][1]);cards.col.push(k,k,k);}};
 // a plant as crossed upright cards (n of them), base x,y,z, width w, height h, yaw a
 const cross=(x,y,z,w,h,a,cell,k,n)=>{n=n==null?2:n;nCards++;for(let q=0;q<n;q++){const b=a+q*Math.PI/n,ux=Math.cos(b)*w/2,uz=Math.sin(b)*w/2;
  quadC([[x-ux,y,z-uz],[x+ux,y,z+uz],[x+ux,y+h,z+uz],[x-ux,y+h,z-uz]],[-Math.sin(b),0,Math.cos(b)],cell,k);}};
 F.GROUPS.forEach((o,gi)=>{if(!(o.kind==='strips'||o.kind==='terraces'||o.kind==='pools'||o.kind==='beds'))return;const step=STEP(o);
  F.strips(o).forEach(s=>{if(s.crop==='fallow')return;const cell=cellOf(s.crop);if(cell<0)return;const h=HT[s.crop]==null?.8:HT[s.crop],base=o.kind==='beds'?.3:o.kind==='pools'?.12:lift;
   const nx=Math.max(1,Math.floor((s.x1-s.x0)/step)),nz=Math.max(1,Math.floor((s.z1-s.z0)/(o.id==='tea-garden'?o.rows:step)));
   for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=s.x0+(i+.5+(u(gi,s.i,k,1)-.5)*.6)*(s.x1-s.x0)/nx,z=s.z0+(j+.5+(u(gi,s.i,k,2)-.5)*.6)*(s.z1-s.z0)/nz;
    const y=o.kind==='pools'?Math.min(terrainH(s.x0,s.z0),terrainH(s.x1,s.z1))+base:terrainH(x,z)+base;
    cross(x,y-.05,z,h*1.2*(.85+.3*u(gi,s.i,k,3)),h*(.85+.3*u(gi,s.i,k,4)),u(gi,s.i,k,5)*Math.PI,cell,.82+.18*u(gi,s.i,k,6));}});});
 // the trees: orchards and groves (bamboo is drawn as canes below)
 const TREES=[];
 F.GROUPS.forEach(o=>{if(o.kind!=='orchard'&&o.kind!=='grove')return;F.trees(o).forEach((t,k)=>{if(t.crop==='bamboo'){TREES.push(t);return;}const cell=cellOf(t.crop);if(cell<0)return;
  const y=terrainH(t.x,t.z),big=t.crop==='willow'?1.2:1,H=4.6*t.s*big,W=4.4*t.s*big;
  ARCH.cyl('wood',t.x,y-.2,t.z,.16*t.s,.1*t.s,H*.45,{seg:5,col:0x4e3a2c});
  cross(t.x,y+H*.18,t.z,W,H*.82,u(9,t.x|0,t.z|0)*Math.PI,cell,.85+.15*u(10,t.x|0,t.z|0),3);});});
 // the chorten garden's junipers and incense cedars, between the rows of chortens
 {const G=LS.CHORTEN_GARDEN,cell=cellOf('juniper');if(cell>=0)for(let k=0;k<26;k++){const x=lerp(G.x0+4,G.x1-4,u(31,k,1)),z=lerp(G.z0+4,G.z1-4,u(31,k,2));
   const rowZ=r=>G.z0+10+r*(G.z1-G.z0-20)/(G.rows-1);let near=false;for(let r=0;r<G.rows;r++)if(Math.abs(z-rowZ(r))<3.2)near=true;if(near)continue;
   const y=terrainH(x,z),s=.8+.6*u(31,k,3);cross(x,y-.1,z,2.6*s,4.2*s,u(31,k,4)*Math.PI,cell,1.5,3);}}
 // the held cherry's crown (64's Garden of Held Water)
 {const Hc=LS.HELD.cherry,cell=cellOf('cherry');if(cell>=0)cross(Hc.x,LS.ROCK.top+1.6,Hc.z,6,5,.3,cell,1,3);}
 // the field shrines' juniper sprigs
 F.SHRINES.forEach((S,k)=>{const cell=cellOf('juniper');if(cell>=0)cross(S.x,terrainH(S.x,S.z)+2.3,S.z,1.4,1.6,k,cell,1.5,2);});
 // the bamboo: canes in clumps (instanced), their leaves on the willow card
 let canes=null;
 if(TREES.length){const P=[];TREES.forEach((t,k)=>{const y=terrainH(t.x,t.z);for(let q=0;q<6;q++){const a=u(41,k,q,1)*6.28,r=u(41,k,q,2)*.9,H=(8+5*u(41,k,q,3))*t.s;
   P.push([t.x+Math.cos(a)*r,y-.2,t.z+Math.sin(a)*r,H,(u(41,k,q,4)-.5)*.12]);}
  const cell=cellOf('willow');if(cell>=0)cross(t.x,y+5*t.s,t.z,3.4*t.s,6*t.s,u(41,k,9)*Math.PI,cell,.75,3);});
  const cg=new THREE.CylinderGeometry(.035,.05,1,5,1);cg.translate(0,.5,0);const cm=new THREE.MeshLambertMaterial({color:0x8ab07a});
  canes=new THREE.InstancedMesh(cg,cm,P.length);const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),S=new THREE.Vector3(),V=new THREE.Vector3();
  P.forEach((p,i)=>{E.set(p[4],0,p[4]*.7);Q.setFromEuler(E);S.set(1,p[3],1);V.set(p[0],p[1],p[2]);M.compose(V,Q,S);canes.setMatrixAt(i,M);});
  canes.userData.host=true;canes.userData.arch=true;canes.userData.cls='flora';canes.userData.inspectLabel='The bamboo grove (the paper mill\'s canes)';scene.add(canes);}
 let cardMesh=null;
 if(cards.pos.length){const cg=new THREE.BufferGeometry();cg.setAttribute('position',new THREE.Float32BufferAttribute(cards.pos,3));cg.setAttribute('normal',new THREE.Float32BufferAttribute(cards.nor,3));
  cg.setAttribute('uv',new THREE.Float32BufferAttribute(cards.uv,2));cg.setAttribute('color',new THREE.Float32BufferAttribute(cards.col,3));
  const cm=new THREE.MeshLambertMaterial({map:atlas,vertexColors:true,alphaTest:.42,side:THREE.DoubleSide});
  cardMesh=new THREE.Mesh(cg,cm);cardMesh.userData.host=true;cardMesh.userData.arch=true;cardMesh.userData.cls='flora';cardMesh.userData.inspectLabel='The crops and the orchards (the library\'s cards)';scene.add(cardMesh);}

 // ---------------------------------------------------------------- the walls: dry stone round the groups, between the strips, the terraces' risers
 const dry=(x0,z0,x1,z1,h,w)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/5)),ry=Math.atan2(-(z1-z0),x1-x0);
  for(let i=0;i<n;i++){const t=(i+.5)/n,x=lerp(x0,x1,t),z=lerp(z0,z1,t),g0=Math.min(terrainH(lerp(x0,x1,i/n),lerp(z0,z1,i/n)),terrainH(lerp(x0,x1,(i+1)/n),lerp(z0,z1,(i+1)/n)));
   ARCH.box('drystone',x,g0-.3,z,L/n+.08,h+.3+(terrainH(x,z)-g0),w,{ry,col:0xffffff,batter:.12,topCol:0xb8b4a8});}};
 F.GROUPS.forEach(o=>F.walls(o).forEach(sg=>dry(sg[0],sg[1],sg[2],sg[3],o.kind==='terraces'?1.1:o.kind==='pools'?.45:.95,o.kind==='terraces'?.9:.7)));
 // the kitchen gardens', the dye garden's and the physic terraces' beds: stone kerbs
 F.GROUPS.filter(o=>o.kind==='beds'&&o.inside).forEach(o=>F.strips(o).forEach(s=>{const cx=(s.x0+s.x1)/2,cz=(s.z0+s.z1)/2,y=terrainH(cx,cz);
  ARCH.box('drystone',cx,y-.15,cz,s.x1-s.x0+.2,.48,s.z1-s.z0+.2,{col:0xd0ccc0,top:false});}));

 // ---------------------------------------------------------------- the water: the leat and the tail race; the mills' wheels
 const channel=(L,w)=>{for(let i=1;i<L.length;i++){const a=L[i-1],b=L[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(len/4),ry=Math.atan2(-(b[1]-a[1]),b[0]-a[0]),nx=-(b[1]-a[1])/len,nz=(b[0]-a[0])/len;
  for(let k=0;k<n;k++){const t=(k+.5)/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t),y=terrainH(x,z);
   ARCH.box('slate',x,y-.3,z,len/n+.06,.32,w,{ry,col:0x3a5a66,sides:''});
   for(const s of [-1,1])ARCH.box('drystone',x+nx*s*(w/2+.25),y-.4,z+nz*s*(w/2+.25),len/n+.06,.75,.5,{ry,col:0xd8d4c8});}}};
 channel(F.LEAT.pts,F.LEAT.w);channel(F.TAIL.pts,F.TAIL.w);
 // a water wheel: rim, spokes and paddles in the plane through (x,y,z) along (ax,az) (the flow), axle across it
 const wheel=(x,y,z,r,ax,az)=>{const N=12,nx=-az,nz=ax,P=(a,rr,o)=>[x+ax*Math.cos(a)*rr+nx*o,y+Math.sin(a)*rr,z+az*Math.cos(a)*rr+nz*o];
  for(let i=0;i<N;i++){const a=i/N*Math.PI*2,b=(i+1)/N*Math.PI*2;
   for(const o of [-.35,.35]){ARCH.quad('wood',P(a,r,o),P(b,r,o),P(b,r-.2,o),P(a,r-.2,o),LSP.woodDark);ARCH.quad('wood',P(b,r,o),P(a,r,o),P(a,r-.2,o),P(b,r-.2,o),LSP.woodDark);}
   ARCH.quad('wood',P(a,r+.25,-.4),P(a,r+.25,.4),P(a,r-.4,.4),P(a,r-.4,-.4),LSP.wood);ARCH.quad('wood',P(a,r+.25,.4),P(a,r+.25,-.4),P(a,r-.4,-.4),P(a,r-.4,.4),LSP.wood);
   ARCH.quad('wood',P(a,.1,.05),P(a,r-.2,.05),P(a,r-.2,-.05),P(a,.1,-.05),LSP.woodDark);ARCH.quad('wood',P(a,r-.2,.05),P(a,.1,.05),P(a,.1,-.05),P(a,r-.2,-.05),LSP.woodDark);}
  ARCH.box('wood',x,y-.2,z,Math.abs(nx)*1.4+.4,.4,Math.abs(nz)*1.4+.4,{col:LSP.woodDark});};
 {const M=F.MILL,g0=terrainH(M.x,M.z);lsBlock(M.x,M.z,M.w,M.d,g0-.5,g0,1,3.8,{batter:.25,win:{spacing:3}});
  const W=M.wheel;wheel(W.x,terrainH(W.x,W.z)+.4,W.z,W.r,1,0);
  REGISTER({name:M.name,cls:'building',kind:'mill',key:'longsong_'+M.id,x:M.x,z:(M.z+W.z)/2,y:g0-1.5,r:7,h:8,tags:{culture:'order',types:['industry','farm']}});}
 {const B=LS.building('paper-mill'),y=LS.baseY(B),wx=B.x+B.w/2+2.2,wz=B.z-4;channel([[F.LEAT.pts[F.LEAT.pts.length-1][0],LS.GROUNDS.z0+2],[wx,wz-3]],1.6);wheel(wx,y+.8,wz,2.8,0,1);}

 // ---------------------------------------------------------------- the works: threshing floors, field shrines, the bee wall, the dye house's poles
 F.THRESH.forEach(T=>{const y=terrainH(T.x,T.z);ARCH.cyl('paving',T.x,y-.3,T.z,T.r,T.r,.45,{seg:28,col:0xc4bcaa});
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2,b=(i+1)/22*Math.PI*2;ARCH.box('drystone',T.x+Math.cos((a+b)/2)*(T.r+.3),y-.2,T.z+Math.sin((a+b)/2)*(T.r+.3),T.r*.3,.6,.5,{ry:-(a+b)/2+Math.PI/2,col:0xd8d4c8});}
  ARCH.dome('cloth',T.x+T.r*.4,y+.15,T.z-T.r*.3,1.6,{seg:10,rows:4,col:0xd8c488,k:.7});   // a heap of sheaves
  REGISTER({name:T.name,cls:'feature',kind:'threshing-floor',key:'longsong_'+T.id,x:T.x,z:T.z,y:y-1,r:T.r+1,h:4,tags:{culture:'order',types:['farm']}});});
 F.SHRINES.forEach(S=>{const y=terrainH(S.x,S.z);ARCH.box('wall',S.x,y-.3,S.z,2,1.6,2,{col:LSP.white,batter:.25});ARCH.box('wall',S.x,y+1.3,S.z,1.1,.9,1.1,{col:LSP.white,batter:.15});
  ARCH.box('twig',S.x,y+1.05,S.z,1.55,.25,1.55,{col:LSP.maroon,top:false});ARCH.cyl('wood',S.x+1.4,y,S.z,.06,.04,5,{seg:5,col:LSP.woodDark});
  ARCH.quad('cloth',[S.x+1.4,y+4.9,S.z],[S.x+3.2,y+4.7,S.z],[S.x+3.2,y+3.9,S.z],[S.x+1.4,y+4.1,S.z],LSP.saffron);
  REGISTER({name:S.name,cls:'landmark',kind:'lhatho',key:'longsong_'+S.id,x:S.x,z:S.z,y:y-1,r:3.5,h:7,tags:{culture:'order',types:['religious','farm']}});});
 {const B=F.BEEWALL,L=B.x1-B.x0,cz=B.z,cx=(B.x0+B.x1)/2,y=terrainH(cx,cz);ARCH.box('drystone',cx,y-.3,cz,L,B.h+.3,1.2,{col:0xd8d4c8,topCol:0xb8b4a8});
  for(let i=0;i<B.niches;i++){const x=B.x0+(i+.5)*L/B.niches;ARCH.box('dark',x,y+.9,cz-.62,1.1,.9,.04,{col:LSP.black});
   ARCH.cyl('slat',x,y+.9,cz-.8,.38,.12,.75,{seg:8,col:0xd8c088,bottom:true});}
  REGISTER({name:B.name,cls:'fixture',kind:'beehives',key:'longsong_beewall',x:cx,z:cz,y:y-1,r:L/2+1,h:4,tags:{culture:'order',types:['farm']}});}
 {const D=F.DYEHOUSE,y=LS.wardY(D.z),x0=D.x-D.w/2-8;for(let k=0;k<3;k++)ARCH.cyl('wood',x0,y,D.z-4+k*4,.08,.06,3.2,{seg:5,col:LSP.woodDark});
  ARCH.box('wood',x0,y+3.1,D.z,.1,.1,8.2,{col:LSP.woodDark});
  [LSP.saffron,LSP.blue,0x6a2018,LSP.saffron].forEach((c,k)=>{const zz=D.z-3.4+k*2.2;ARCH.quad('cloth',[x0,y+3.05,zz-.9],[x0,y+3.05,zz+.9],[x0,y+.9,zz+.9],[x0,y+.9,zz-.9],c);});}

 // ---------------------------------------------------------------- the pastures: the herders' tents and pens; the herds
 F.TENTS.forEach(T=>{const y=terrainH(T.x,T.z),w=7,d=5,h=2.6,K=0x2a2622;
  const a=[T.x-w/2,y,T.z-d/2],b=[T.x+w/2,y,T.z-d/2],c=[T.x+w/2,y,T.z+d/2],e=[T.x-w/2,y,T.z+d/2],r0=[T.x-w/2+1,y+h,T.z],r1=[T.x+w/2-1,y+h,T.z];
  ARCH.quad('cloth',b,a,r0,r1,K);ARCH.quad('cloth',e,c,r1,r0,K);ARCH.tri('cloth',a,e,r0,ARCH.col(K));ARCH.tri('cloth',c,b,r1,ARCH.col(K));
  ARCH.box('wood',T.x,y+h,T.z,w-1.6,.1,.1,{col:LSP.woodDark});
  REGISTER({name:'A herder\'s black tent (yak hair)',cls:'building',kind:'tent',key:'longsong_'+T.id,x:T.x,z:T.z,y:y-1,r:4.5,h:5,tags:{culture:'order',types:['dwelling-single','farm']}});});
 F.PENS.forEach(Pn=>{const N=Math.ceil(Pn.r*2*Math.PI/3);for(let i=0;i<N;i++){if(i===0)continue;const a=(i+.5)/N*Math.PI*2,x=Pn.x+Math.cos(a)*Pn.r,z=Pn.z+Math.sin(a)*Pn.r,y=terrainH(x,z);
   ARCH.box('drystone',x,y-.3,z,Pn.r*2*Math.PI/N+.1,1.5,.8,{ry:-a+Math.PI/2,col:0xd8d4c8,topCol:0x5a4a3a});}   // dung cakes drying on the top
  REGISTER({name:'A stone pen (the herd\'s night fold; dung drying on its wall)',cls:'infrastructure',kind:'pen',key:'longsong_'+Pn.id,x:Pn.x,z:Pn.z,y:terrainH(Pn.x,Pn.z)-1,r:Pn.r+1,h:3,tags:{culture:'order',types:['farm']}});});
 // the herds: a placeholder yak (body, hump, skirt, head, horns), instanced, black, brown and white-faced
 const yak=(function(){const parts=[];const box=(w,h,d,x,y,z)=>{const b=new THREE.BoxGeometry(w,h,d);b.translate(x,y,z);parts.push(b.toNonIndexed());};
  box(1.7,.8,.85,0,.95,0);box(.7,.35,.7,-.35,1.45,0);box(1.6,.35,.95,0,.55,0);box(.45,.45,.4,1.05,1.05,0);
  for(const s of [-1,1]){box(.08,.32,.08,1.05,1.38,s*.22);for(const fx of [-.6,.6])box(.2,.6,.2,fx,.3,s*.28);}
  const P=[],N=[];parts.forEach(b=>{P.push(...b.attributes.position.array);N.push(...b.attributes.normal.array);});
  const gy=new THREE.BufferGeometry();gy.setAttribute('position',new THREE.Float32BufferAttribute(P,3));gy.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));return gy;})();
 const HP=[];F.HERDS.forEach((Hd,hi)=>{for(let k=0;k<Hd.n;k++){const a=u(61,hi,k,1)*6.28,r=Math.sqrt(u(61,hi,k,2))*Hd.r,x=Hd.x+Math.cos(a)*r,z=Hd.z+Math.sin(a)*r;
  HP.push([x,terrainH(x,z),z,u(61,hi,k,3)*6.28,u(61,hi,k,4)]);}});
 const ym=new THREE.MeshLambertMaterial({color:0xffffff}),herd=new THREE.InstancedMesh(yak,ym,HP.length),M=new THREE.Matrix4(),Q=new THREE.Quaternion(),E=new THREE.Euler(),S=new THREE.Vector3(1,1,1),V=new THREE.Vector3();
 const YC=[0x2a2420,0x3a2c22,0x4a3a2e,0x1e1a18].map(h=>new THREE.Color(h));
 HP.forEach((p,i)=>{E.set(0,p[3],0);Q.setFromEuler(E);V.set(p[0],p[1],p[2]);M.compose(V,Q,S);herd.setMatrixAt(i,M);herd.setColorAt(i,YC[Math.floor(p[4]*YC.length)]);});
 herd.userData.host=true;herd.userData.cls='life';herd.userData.inspectLabel='Yak and dzo of the Order\'s herds (placeholder figures)';scene.add(herd);
 F.HERDS.forEach(Hd=>REGISTER({name:'A herd of yak and dzo ('+Hd.n+')',cls:'life',kind:'herd',key:'longsong_'+Hd.id,x:Hd.x,z:Hd.z,y:terrainH(Hd.x,Hd.z)-3,r:Hd.r+3,h:12,tags:{culture:'order'}}));
 return {ground,cards:nCards,cardMesh,canes,herd,records:FREC,yaks:HP.length};})();
_mark('farms');

// ---------------------------------------------------------------- the farms' checks (verify.py --assert; 64's monasteryChecks calls them)
const FCHK={
 // every crop the plan sows is one the Crops kit says the Oidong Valley can grow (rain-fed, wild, irrigated, or in the dark beds)
 crops(S){const ok=CROPS.forBiome('oidong',{works:['dark-beds']}).filter(r=>r.how!=='trade').map(r=>r.crop.id),bad=Object.keys(S).filter(c=>ok.indexOf(c)<0);
  return{ok:Object.keys(S).length>15&&!bad.length,detail:Object.keys(S).length+' crops sown'+(bad.length?'; not the Oidong Valley\'s: '+bad.join(', '):', every one the Crops kit\'s for the Oidong Valley')};},
 // the fields lie on dry land outside the wall, off the track, the kora and the pond; the gardens inside it
 clear(G){const bad=[];G.forEach(o=>{const S=LS.FARMS.strips(o),T=LS.FARMS.trees(o);
   const cells=S.length?S:T.length?T.map(t=>({x0:t.x,x1:t.x,z0:t.z,z1:t.z})):[{x0:o.x0,x1:o.x1,z0:o.z0,z1:o.z1}];
   cells.forEach(s=>{const x=(s.x0+s.x1)/2,z=(s.z0+s.z1)/2;
    if(waterH(x,z)>terrainH(x,z)-.2)bad.push(o.id+' (in the water)');
    if(!o.inside&&LS.inGrounds(x,z,2))bad.push(o.id+' (inside the wall)');if(o.inside&&!LS.inGrounds(x,z))bad.push(o.id+' (outside the wall)');
    if(!o.inside&&LS.trackD(x,z)<6)bad.push(o.id+' (on the track)');});});
  const u=[...new Set(bad)];return{ok:!u.length,detail:u.length?u.slice(0,4).join(', '):G.length+' groups: the fields dry and clear of the wall, the track and the pond; the gardens inside'};},
 // the house's own grain is a real share of its need, and the rest is said to come from somewhere (the estate's tithe)
 provision(P){return{ok:P.share>.1&&P.share<.8&&!!P.tithe,detail:'own grain '+P.ownT.toFixed(1)+' t of '+P.needT.toFixed(0)+' t needed ('+(P.share*100).toFixed(0)+' %); the rest: '+P.tithe};}};
function farmChecks(add){const F=LS.FARMS;add('the farms sow only what the Oidong Valley can grow (the Crops kit)',FCHK.crops(F.sown()));
 add('the fields dry, outside the wall, off the track; the gardens inside',FCHK.clear(F.GROUPS));
 add('the house\'s own fields feed a share of it; the estate the rest',FCHK.provision(F.provision()));}
function farmNegatives(add){add('a field of cotton (not the valley\'s)',FCHK.crops(Object.assign({cotton:['x']},LS.FARMS.sown())));
 add('a field laid across the stream',FCHK.clear([{id:'wet',kind:'strips',x0:-40,x1:40,z0:-300,z1:-280,run:'ns',w:14,off:0,rot:['frostoat'],wallEvery:4}]));
 add('a house that grows all its grain and names no other source',FCHK.provision({share:1,ownT:100,needT:100,tithe:''}));}
