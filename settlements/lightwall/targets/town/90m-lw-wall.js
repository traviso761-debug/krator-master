// ================================================================= LĀIṬWĀL — the wall: the Glaziers' four bands, carved and drawn (PLAN.md 3, 8)
// Order: every Glazier site registered in core/tags (culture glazier) before it is drawn; the rock: each band's face a plain
// block of the scarp's rock between the carved sites, and the carved quarter's sites each in a block of rock carved from its
// void plan (KCAVERN: TG.gz.carve, the one source; its floors to core/walk); the rock cut so the cut-away opens every room
// over its own floor; then the fronts drawn through the Tungang kit's host API (TG.gz.draw: the carved quarter whole, the
// outer wall as fronts on whole rock, `facade`), band by band, each band its own group (frustum-culled). A facade house
// taller than its band gets a knob of rock behind its upper tiers. [web]: three.js.
reseed(LW.SEED+3);const LW_M0=performance.now();
// ---------------------------------------------------------------- core/tags: every site before it is drawn
for(const s of LW_WALL){const D=TG.DEFS[s.key],B=TG.gz.BOX[s.key];if(!D||!B)continue;
 KTAGS.page.add({'class':'building',kind:s.key,key:s.key,name:'Laitwal, the Glaziers\' wall: '+D.name,at:[s.x,s.y,s.z],ry:s.ry,size:[B.w,B.d,B.h],
  tags:Object.assign({},D.tags,{culture:'glazier'}),note:s.carve?'carved from its void plan':s.facade?'its front on whole rock':'on the shore',frag:'settlements/lightwall'});}
// ---------------------------------------------------------------- the rock's look: the scarp's basalt and rhyolite, the library's hewn set
const lwRockCol=0x6e625e;   /* the scarp's basalt with the rhyolite's rose (biomes/opalvalley: the basalt-rhyolite contact) */
const lwHewn=TG.MAT&&TG.MAT.hewn&&TG.MAT.hewn.map?TG.MAT.hewn.map:null;
const lwBandMat=lwRockLayer(new THREE.MeshStandardMaterial({vertexColors:true,color:0x9a928c,roughness:.95,metalness:0}));
/* a block of rock from x0 to x1, its face at z (+z out), back to z - depth, from y0 to y1, its UVs in world metres (2.2 m a tile) */
function lwRockBox(x0,x1,z,depth,y0,y1){const g=new THREE.BoxGeometry(x1-x0,y1-y0,depth),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,cx=(x0+x1)/2,cy=(y0+y1)/2,cz=z-depth/2;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,y=p.getY(i)+cy,zz=p.getZ(i)+cz,ny=Math.abs(n.getY(i)),nx=Math.abs(n.getX(i));uv.setXY(i,(nx>.5?zz:x)/2.2,(ny>.5?zz:y)/2.2);}
 g.translate(cx,cy,cz);return g;}
/* geometries merged into one (positions, normals, UVs, colours, an index); a part without colours is the rock's beds' tint */
function lwMerge(gs){let n=0,m=0;for(const g of gs){n+=g.attributes.position.count;m+=g.index.count;}const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),Cc=new Float32Array(n*3),I=new Uint32Array(m);let o=0,q=0;const cs=[0,0,0];
 for(const g of gs){const pa=g.attributes.position;P.set(pa.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);
  if(g.attributes.color)Cc.set(g.attributes.color.array,o*3);else for(let i=0;i<pa.count;i++){lwStrata(pa.getX(i),pa.getY(i),cs);Cc.set(cs,(o+i)*3);}
  const ix=g.index.array;for(let i=0;i<ix.length;i++)I[q+i]=ix[i]+o;o+=pa.count;q+=ix.length;}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));G.setAttribute('color',new THREE.BufferAttribute(Cc,3));G.setIndex(new THREE.BufferAttribute(I,1));G.computeBoundingSphere();return G;}
/* a band's face between x0 and x1 as rock, not a slab: a grid (1.5 m) displaced by core/rand's value noise, from 0.25 m out to
   0.85 m in, flat where a front stands against it (flat: [x0, x1] ranges, eased over 1.2 m) and at the run's ends, its top
   row drawn back to the ledge's edge (z - .9) as a worn lip; the beds' tint per vertex (lwStrata) */
function lwRockFace(x0,x1,z,y0,y1,flat,seed){const nx=Math.max(2,Math.ceil((x1-x0)/1.5)),ny=Math.max(2,Math.ceil((y1-y0)/1.5)),pos=[],nrm=[],uv=[],col=[],idx=[],cs=[0,0,0];
 const ease=x=>{let w=Math.min(1,(x-x0)/1.2,(x1-x)/1.2);for(const f of flat){const d=x<f[0]?f[0]-x:x>f[1]?x-f[1]:0;w=Math.min(w,d/1.2);}return Math.max(0,Math.min(1,w));};
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx,y=y0+(y1-y0)*j/ny,w=ease(x);
  let d=w*(-.3-.55*(KRAND.vnoise(x*.25,y*.25,0,seed)*2-1)+.25*(KRAND.vnoise(x*.9,y*.9,0,seed+1)*2-1));d=Math.max(-.85,Math.min(.25,d));if(j===ny)d=-.9;
  pos.push(x,y,z+d);nrm.push(0,0,1);uv.push(x/2.2,y/2.2);lwStrata(x,y,cs);col.push(cs[0],cs[1],cs[2]);}
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;idx.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nrm,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;}
/* a band's end as a buttress of rock sloping from the band's top down to its foot over L m (dir +1 east, -1 west): not a
   square-cut block. Its front a triangle on the face, its top a slope, its back hidden in the rock behind */
function lwRockWedge(x,dir,z,y0,y1,depth,L){const xe=x+dir*L,P=[[x,y0,z],[xe,y0,z],[x,y1,z-.9],[x,y0,z-depth],[xe,y0,z-depth],[x,y1,z-depth]];
 const T=dir>0?[[0,1,2],[2,1,4],[2,4,5],[3,5,4]]:[[0,2,1],[2,4,1],[2,5,4],[3,4,5]],pos=[],uv=[];
 for(const t of T)for(const i of t){pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][0]/2.2,P[i][1]/2.2);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex([...Array(pos.length/3).keys()]);g.computeVertexNormals();return g;}
// ---------------------------------------------------------------- the bands' plain rock: each face between the carved sites
const LW_ROCK={bands:0,cavern:null,tris:0};
{const geos=[];
 for(const B of LW_BANDS){const gaps=LW_WALL.filter(s=>s.band===B.k&&s.carve).map(s=>{const W=TG.gz.BOX[s.key].w/2+.6;return [s.x-W,s.x+W];}).sort((a,b)=>a[0]-b[0]);
  /* behind the run, a block whose top is the ledge; before it, the face as rock, flat behind every front that stands against it */
  const flat=LW_WALL.filter(s=>s.band===B.k&&!s.carve).map(s=>{const W=TG.gz.BOX[s.key].w/2+.3;return [s.x-W,s.x+W];});
  /* the top band's block runs 16.5 m back (the carved quarter's ground is held under its floor that far, 89zl terrainH), and a lid
     of rock behind its carved sites to the scarp, so the ground held down shows no trench above it */
  const top=B.k===LW.BANDS-1,dep=top?16.5:13.1;if(top)geos.push(lwRockBox(-(LW.CARVE+30),LW.CARVE+30,B.z-16.5,9,B.y-3,B.y+LW.BAND_H));
  let x=-B.half;const run=(a,b)=>{if(b-a>.2){geos.push(lwRockBox(a,b,B.z-.9,dep,B.y-3,B.y+LW.BAND_H));geos.push(lwRockFace(a,b,B.z,B.y-3,B.y+LW.BAND_H,flat,LW.SEED+40+B.k));}};
  for(const g of gaps){run(x,g[0]);x=Math.max(x,g[1]);}run(x,B.half);LW_ROCK.bands++;
  /* the band's two ends as buttresses sloping down to its foot, the length by the band's height and a hash of the end */
  for(const dir of [-1,1]){const L=LW.BAND_H*(1.4+.8*lwU(B.k,dir,51));geos.push(lwRockWedge(dir*B.half,dir,B.z,B.y-3,B.y+LW.BAND_H,13.1,L));}
  /* the ledge on this band's top: a floor from its lip back to the next band's face (L4: a walker goes along the wall) */
  if(typeof KWALK!=='undefined'){const zb=B.k+1<LW.BANDS?B.z-LW.BAND_SET:B.z-12,y=B.y+LW.BAND_H;
   KWALK.poly({pts:[[-B.half,zb,y],[B.half,zb,y],[B.half,B.z-.9,y],[-B.half,B.z-.9,y]],name:'ledge '+(B.k+1),tag:'lightwall:ledge'});}
  /* a facade house taller than its band: a knob of rock behind its upper tiers */
  for(const s of LW_WALL)if(s.band===B.k&&s.facade){const H=TG.gz.BOX[s.key].h;if(H>LW.BAND_H+1){const W=TG.gz.BOX[s.key].w/2-.4;geos.push(lwRockBox(s.x-W,s.x+W,s.z,7,B.y+LW.BAND_H-.2,B.y+H-1.2));}}}
 if(geos.length){const g=lwMerge(geos);
  const add=geo=>{const m=new THREE.Mesh(geo,lwBandMat);m.name='the wall: its bands of rock';m.castShadow=true;m.receiveShadow=true;m.userData.probeSkip=true;m.userData.inspectLabel='The Light Wall: the scarp\'s rock';scene.add(m);LW_ROCK.tris+=geo.index?geo.index.count/3:geo.attributes.position.count/3;};
  if(g)add(g);else geos.forEach(add);}}
// ---------------------------------------------------------------- the carved quarter: each site in its block of rock, carved from its plan
let LW_CARVED=[];
if(typeof KCAVERN!=='undefined'&&KCAVERN.drawRock){
 const C=KCAVERN.create({ground:()=>-200,cell:.5,chunk:16,seed:LW.SEED,walk:typeof KWALK!=='undefined'?KWALK:null,minRock:.6});
 LW_CARVED=LW_WALL.filter(s=>s.carve);
 for(const s of LW_CARVED){const B=TG.gz.BOX[s.key],PL=TG.gz.plan(s.key,{v:s.v}),top=Math.max(...PL.voids.map(V=>V.kind==='stair'?Math.max(V.a[1],V.b[1])+V.h:V.y+V.h+(V.rise||0))),W=B.w/2+.6;
  const dm=Math.max(B.d-B.out+1.5,s.band===LW.BANDS-1?16.5:0);
  C.mass({id:s.id+':rock',poly:[[s.x-W,s.z-dm],[s.x+W,s.z-dm],[s.x+W,s.z],[s.x-W,s.z]],y0:s.y-3,y1:s.y+Math.max(LW.BAND_H,top+1.2)});}
 const P=TG.gz.carve(C,LW_CARVED);const t0=performance.now();C.build();LW_ROCK.buildMs=Math.round(performance.now()-t0);LW_ROCK.prims=P.length;
 /* the carved rock's material: core/terrain's KCAVERN.rockMaterial (host/39i, lifted from this page's lwRockLayer) with Xanadu's
    library rock face at the tile lwRockLayer gives the bands */
 const xrL=KMAT.packed&&KMAT.packed('xanadu','xRock'),mat=KCAVERN.rockMaterial?KCAVERN.rockMaterial({THREE,map:MAT.xRock&&MAT.xRock.map,tile:xrL&&xrL.scale?xrL.scale[0]:4,
  color:typeof hc==='function'?hc(lwRockCol):lwRockCol,name:'the scarp: rock face',key:'lightwall-rock'})
  :lwRockLayer(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide,color:typeof hc==='function'?hc(lwRockCol):lwRockCol}));
 if(KCAVERN.cutLayer){KCAVERN.cutLayer(mat);KCAVERN.cut.above(2.2);KCAVERN.cut.boxes([{x:0,z:LW.WALL-20,hw:LW.CARVE+30,hd:40,ry:0,floor:LW.Y0}]);}
 /* meshed after the page is up (KNOWN_ISSUES.md: "the carved quarter costs about 8 s to mesh"): the chunks grouped by
    drawRock's own 64 m tiles, the tiles nearest the camera first, about 12 ms of them a frame; window._hostPending (core/host
    91) holds the page's ready for the verify harness until the last tile is drawn. Each tile is drawRock over that tile's
    chunks alone, so the meshes are the ones one call over every chunk made */
 const RO={THREE,material:mat,ground:'drop',attrs:KCAVERN.cutWeight?['aKCut']:[],weight:KCAVERN.cutWeight?KCAVERN.cutWeight(C):null,label:'The Light Wall: the carved quarter\'s rock (KCAVERN, from the Glaziers\' void plans)',name:'lightwall:rock'};
 const LW_RTILE=64,lwTiles=new Map();for(const k of C.chunks){const a=k.split(',').map(Number),tk=Math.floor(a[0]*C.chunk/LW_RTILE)+','+Math.floor(a[2]*C.chunk/LW_RTILE);if(!lwTiles.has(tk))lwTiles.set(tk,[]);lwTiles.get(tk).push(k);}
 const rockG=new THREE.Group();rockG.name='lightwall:rock';scene.add(rockG);LW_ROCK.C=C;LW_ROCK.cavern={tris:0,chunks:0,ms:0,tiles:lwTiles.size,frames:0,done:false};
 const lwRQ=[...lwTiles.entries()].map(([tk,keys])=>{const a=tk.split(',').map(Number);return {keys,x:(a[0]+.5)*LW_RTILE,z:(a[1]+.5)*LW_RTILE};});
 const lwRockTile=T=>{const R=KCAVERN.drawRock(Object.assign(Object.create(C),{chunks:T.keys}),RO);
  R.group.children.slice().forEach(m=>{m.receiveShadow=true;m.castShadow=true;m.userData.probeSkip=true;rockG.add(m);});
  LW_ROCK.cavern.tris+=R.tris;LW_ROCK.cavern.chunks+=R.chunks;LW_ROCK.cavern.ms+=R.ms;LW_ROCK.tris+=R.tris;};
 window._hostPending=(window._hostPending||0)+1;
 FRAME_HOOKS.push(()=>{if(LW_ROCK.cavern.done)return;const P=camera.position,t0=performance.now();LW_ROCK.cavern.frames++;
  lwRQ.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
  do{try{lwRockTile(lwRQ.shift());}catch(e){reportErr('lightwall rock tile: '+(e&&e.message||e));}}while(lwRQ.length&&performance.now()-t0<12);
  if(!lwRQ.length){LW_ROCK.cavern.done=true;window._hostPending--;}});}
else reportErr('lightwall: the wall needs core/terrain (KCAVERN) and its draw');
/* the cut-away opens the carved rock with the buildings */
if(typeof cutSet==='function'){const lwCut0=cutSet;cutSet=function(on){if(typeof KCAVERN!=='undefined'&&KCAVERN.cut)KCAVERN.cut.set(on);return lwCut0(on);};}
// ---------------------------------------------------------------- the fronts: band by band, through the host API
const LW_DRAW=[];
for(const k of [-1,0,1,2,3]){const sites=LW_WALL.filter(s=>s.band===k);if(!sites.length)continue;
 const D=TG.gz.draw(sites,{scene,walk:typeof KWALK!=='undefined',seed:LW.SEED+10+k,label:k<0?'Laitwal: the lotus ponds':'Laitwal: the Glaziers\' wall, band '+(k+1)});
 D.group.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});LW_DRAW.push(D);}
const LW_LIGHTS=[].concat(...LW_DRAW.map(D=>D.lights));
window._lightwallWall={sites:LW_WALL.length,carved:LW_CARVED.length,facade:LW_WALL.filter(s=>s.facade).length,drawn:LW_DRAW.reduce((a,D)=>a+D.recs.length,0),
 missing:Object.assign({},...LW_DRAW.map(D=>D.missing)),tris:LW_DRAW.reduce((a,D)=>a+D.tris,0),rock:LW_ROCK,lights:LW_LIGHTS.length,errors:(TG.errors||[]).slice(0,5),ms:Math.round(performance.now()-LW_M0)};
