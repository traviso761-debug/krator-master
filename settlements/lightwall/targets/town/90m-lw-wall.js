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
const lwBandMat=new THREE.MeshStandardMaterial({color:typeof hc==='function'?hc(lwRockCol):lwRockCol,roughness:.95,metalness:0});
if(lwHewn){lwBandMat.map=lwHewn;lwHewn.wrapS=lwHewn.wrapT=THREE.RepeatWrapping;}
/* a block of rock from x0 to x1, its face at z (+z out), back to z - depth, from y0 to y1, its UVs in world metres (2.2 m a tile) */
function lwRockBox(x0,x1,z,depth,y0,y1){const g=new THREE.BoxGeometry(x1-x0,y1-y0,depth),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,cx=(x0+x1)/2,cy=(y0+y1)/2,cz=z-depth/2;
 for(let i=0;i<p.count;i++){const x=p.getX(i)+cx,y=p.getY(i)+cy,zz=p.getZ(i)+cz,ny=Math.abs(n.getY(i)),nx=Math.abs(n.getX(i));uv.setXY(i,(nx>.5?zz:x)/2.2,(ny>.5?zz:y)/2.2);}
 g.translate(cx,cy,cz);return g;}
/* boxes merged into one geometry (positions, normals, UVs, an index) */
function lwMerge(gs){let n=0,m=0;for(const g of gs){n+=g.attributes.position.count;m+=g.index.count;}const P=new Float32Array(n*3),N=new Float32Array(n*3),U=new Float32Array(n*2),I=new Uint32Array(m);let o=0,q=0;
 for(const g of gs){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);const ix=g.index.array;for(let i=0;i<ix.length;i++)I[q+i]=ix[i]+o;o+=g.attributes.position.count;q+=ix.length;}
 const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));G.setIndex(new THREE.BufferAttribute(I,1));G.computeBoundingSphere();return G;}
// ---------------------------------------------------------------- the bands' plain rock: each face between the carved sites
const LW_ROCK={bands:0,cavern:null,tris:0};
{const geos=[];
 for(const B of LW_BANDS){const gaps=LW_WALL.filter(s=>s.band===B.k&&s.carve).map(s=>{const W=TG.gz.BOX[s.key].w/2+.6;return [s.x-W,s.x+W];}).sort((a,b)=>a[0]-b[0]);
  let x=-B.half;const run=(a,b)=>{if(b-a>.2)geos.push(lwRockBox(a,b,B.z,14,B.y-3,B.y+LW.BAND_H));};
  for(const g of gaps){run(x,g[0]);x=Math.max(x,g[1]);}run(x,B.half);LW_ROCK.bands++;
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
  C.mass({id:s.id+':rock',poly:[[s.x-W,s.z-(B.d-B.out)-1.5],[s.x+W,s.z-(B.d-B.out)-1.5],[s.x+W,s.z],[s.x-W,s.z]],y0:s.y-3,y1:s.y+Math.max(LW.BAND_H,top+1.2)});}
 const P=TG.gz.carve(C,LW_CARVED);const t0=performance.now();C.build();LW_ROCK.buildMs=Math.round(performance.now()-t0);LW_ROCK.prims=P.length;
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95,side:THREE.DoubleSide,color:typeof hc==='function'?hc(lwRockCol):lwRockCol});
 if(KCAVERN.cutLayer){KCAVERN.cutLayer(mat);KCAVERN.cut.above(2.2);KCAVERN.cut.boxes([{x:0,z:LW.WALL-20,hw:LW.CARVE+30,hd:40,ry:0,floor:LW.Y0}]);}
 const R=KCAVERN.drawRock(C,{THREE,material:mat,ground:'drop',attrs:KCAVERN.cutWeight?['aKCut']:[],weight:KCAVERN.cutWeight?KCAVERN.cutWeight(C):null,label:'The Light Wall: the carved quarter\'s rock (KCAVERN, from the Glaziers\' void plans)',name:'lightwall:rock'});
 R.group.children.forEach(m=>{m.receiveShadow=true;m.castShadow=true;m.userData.probeSkip=true;});scene.add(R.group);LW_ROCK.cavern={tris:R.tris,chunks:R.chunks,ms:R.ms};LW_ROCK.tris+=R.tris;LW_ROCK.C=C;}
else reportErr('lightwall: the wall needs core/terrain (KCAVERN) and its draw');
/* the cut-away opens the carved rock with the buildings */
if(typeof cutSet==='function'){const lwCut0=cutSet;cutSet=function(on){if(typeof KCAVERN!=='undefined'&&KCAVERN.cut)KCAVERN.cut.set(on);return lwCut0(on);};}
// ---------------------------------------------------------------- the fronts: band by band, through the host API
const LW_DRAW=[];
for(const k of [-1,0,1,2,3]){const sites=LW_WALL.filter(s=>s.band===k);if(!sites.length)continue;
 const D=TG.gz.draw(sites,{scene,seed:LW.SEED+10+k,label:k<0?'Laitwal: the lotus ponds':'Laitwal: the Glaziers\' wall, band '+(k+1)});
 D.group.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});LW_DRAW.push(D);}
const LW_LIGHTS=[].concat(...LW_DRAW.map(D=>D.lights));
window._lightwallWall={sites:LW_WALL.length,carved:LW_CARVED.length,facade:LW_WALL.filter(s=>s.facade).length,drawn:LW_DRAW.reduce((a,D)=>a+D.recs.length,0),
 missing:Object.assign({},...LW_DRAW.map(D=>D.missing)),tris:LW_DRAW.reduce((a,D)=>a+D.tris,0),rock:LW_ROCK,lights:LW_LIGHTS.length,errors:(TG.errors||[]).slice(0,5),ms:Math.round(performance.now()-LW_M0)};
