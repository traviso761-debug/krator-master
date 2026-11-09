// ================================================================= HOST — the rock and the ground: the maze's chunks and the table over them
// THE ROCK: CAVE.C's chunks (KCAVERN surface nets, 1 m), drawn by core/terrain's KCAVERN.drawRock (one mesh per 64 m tile) with this page's
// weights. The rift fill here is gypsum (the maze's rock: massive, sugary, white to grey) with thin stromatolite limestone beds (the `rift`
// recipe's) and marl partings between them, clay and silt on the passages' floors (a relict maze's fill), and gypsum crust on the floors and
// the lower walls: KGROUND's layers (43-core-ground.js) on a weight per vertex (aLime, aCrust; aTop, the table's soil and moss, on the ground the
// cavern draws in a doline's or a mouth's lip), sampled from the side on the walls (tri); the clay, the marl, the Ancients' hewn cut and the
// loj's dry-stone walls as the vertex colour (over the chunk's occlusion). ?kground=0 for the paint alone. NO GYPSUM ROCK TEXTURE YET: the
// library has none for bedded gypsum, so the Hearths' pack stands in, read in place (crystal.selenite: stone.alabaster, massive gypsum;
// ground.gypsum: the crust; rock.limestone: the karst limestone; KNOWN_ISSUES.md, PROMPTS-NEEDED.md section 41).
// THE GROUND: the table, the scarp's face (in ledges, 44z) and the bench under it, three grids (a half metre over the face, 2 m over the
// table and the bench, coarse past the page), their quads left out where the cavern draws the ground itself (a doline's or a mouth's lip: KCAVERN's wells,
// 48) and where a void runs under the surface. The same material as the rock (one look, matched at the seams; the ground's copy pushed back
// a little, so the cavern's own ground wins where both draw). The table's forest is the plateau station's (stations/plateau): the floor alone.
// THE SKY'S SHARE (aSky, 0..1 a vertex): 1 in the open, falling off with the distance from the nearest mouth or doline; skyLight makes a
// material's sun and sky light (not the lamp) scale by it, so the maze is dark but at its openings. SKY_ALL lifts it for the plan view.
const USE_KG=typeof KGROUND!=='undefined'&&Q.get('kground')!=='0';
const OPENINGS=CAVE.mouths.map(m=>({k:'mouth',x:m.at[0]-m.dir[0]*.5,y:m.at[1]+m.h*.5,z:m.at[2]-m.dir[1]*.5,r:9})).concat(CAVE.dolines.map(D=>({k:'doline',x:D.x,z:D.z,r:D.r,fl:D.floor==null?-1e9:D.floor})));
function skyAt(x,y,z){if(y>CAVE.ground(x,z)-.3)return 1;let s=0;
 for(const O of OPENINGS){if(O.k==='mouth'){const d=Math.hypot(x-O.x,y-O.y,z-O.z);if(d<O.r){const t=1-d/O.r;s=Math.max(s,t*t);}}
  else{const d=Math.hypot(x-O.x,z-O.z)-O.r;if(y>O.fl-2&&d<8){const t=1-Math.max(0,d)/8;s=Math.max(s,t*t);}}}
 return s;}
/* the sun's and the sky's light scaled by vSky (the lamp and the fill, on the camera, are not): the directional loop of three r128's
   lights_fragment_begin, and the indirect light after it */
const SKY_ALL={value:0};
const DIR_LINE='getDirectionalDirectLightIrradiance( directionalLight, geometry, directLight );';
const LIGHTS_GATED=THREE.ShaderChunk.lights_fragment_begin.indexOf(DIR_LINE)>=0?THREE.ShaderChunk.lights_fragment_begin.replace(DIR_LINE,DIR_LINE+'\ndirectLight.color*=max(vSky,uSkyAll);'):null;
if(!LIGHTS_GATED)reportErr('maze: three\'s lights chunk has no '+DIR_LINE+' (the sun would light the maze through the rock)');
function skyLight(sh,extra){sh.uniforms.uSkyAll=SKY_ALL;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aSky;varying float vSky;'+(extra?extra.vd:''))
  .replace('#include <begin_vertex>','#include <begin_vertex>\nvSky=aSky;'+(extra?extra.vs:''));
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vSky;uniform float uSkyAll;'+(extra?extra.fd:''))
  .replace('#include <lights_fragment_begin>',LIGHTS_GATED||'#include <lights_fragment_begin>')
  .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n{float _s=max(vSky,uSkyAll);reflectedLight.indirectDiffuse*=mix(.07,1.,_s);reflectedLight.indirectSpecular*=_s;}');}
/* the beds: a stromatolite limestone bed between the storeys and two over the middle one (proud, grey), each wandering a little; marl
   partings (thin, grey-green) between the gypsum's beds every 2.1 m */
const BEDS=[[-27.4,1.6],[-13.4,.9],[-5.2,.6]];
const limeAt=(x,y,z)=>{let w=0;for(const b of BEDS){const yy=b[0]+.6*(KRAND.fbm(x*.02,b[0],z*.02,2,71)-.5);w=Math.max(w,smooth(b[1]*.5+.25,b[1]*.5,Math.abs(y-yy)));}return w;};
const marlAt=(x,y,z)=>{const t=(y+.35*(KRAND.fbm(x*.03,0,z*.03,2,73)-.5))/2.1,f=t-Math.floor(t);return smooth(.1,0,Math.abs(f-.5)-.4);};
/* the ground's look at a point (the grid's and the cavern's own ground alike): the table's soil and moss where it is high and flat, the bench's
   talus at the foot, the face between (its gypsum, the beds' grey-tan, the marl's grey-green, the wash's streaks down it: noise quick along the
   strike, slow in height). sl is the slope (rise over run) */
const SOIL=[.36,.29,.22],FACE=[.78,.75,.69],BENCH=[.7,.63,.54],LIME=[.72,.67,.58],STREAK=[.58,.54,.48],MARL=[.72,.76,.7];
function groundLook(x,y,z,sl,out){const top=smooth(-4,-1.5,y)*smooth(1.1,.5,sl),bench=smooth(-28,-33,y)*smooth(1.2,.6,sl),face=clamp(1-top-bench,0,1),lm=face*limeAt(x,y,z);
 const mr=face*marlAt(x,y,z)*.6,st=face*smooth(.45,.75,KRAND.fbm(z*.18,y*.025,x*.05,3,81)),v=.9+.2*KRAND.fbm(x*.04,0,z*.04,2,79);
 for(let c=0;c<3;c++)out.col[c]=(SOIL[c]*top+mix(mix(FACE[c],LIME[c],lm),STREAK[c],st*.8)*face+BENCH[c]*bench)*mix(1,MARL[c],mr)*v;
 out.top=top;out.lime=lm;out.crust=clamp(bench*.8+face*.25,0,1);return out;}
/* the one material, its weights in aTop, aLime, aCrust (and aSky); the ground's copy pushed back a little */
function rockMat(key,o){const m=new THREE.MeshStandardMaterial(Object.assign({color:0xffffff,roughness:.9,metalness:0,vertexColors:true},o||{}));
 m.onBeforeCompile=sh=>{skyLight(sh,{vd:'attribute float aTop;attribute float aLime;attribute float aCrust;varying float vTop;varying float vLime;varying float vCrust;',
   vs:'vTop=aTop;vLime=aLime;vCrust=aCrust;',fd:'varying float vTop;varying float vLime;varying float vCrust;'});
  sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{vec3 _rP=diffuseColor.rgb;'+(USE_KG?'\n/*KGROUND*/\n':'')+'}');};
 m.customProgramCacheKey=()=>key;
 if(USE_KG)KGROUND.hook(m,{key,at:'/*KGROUND*/',relief:{bump:.03,cavity:.45},tri:{from:.3,to:.65,far:200},layers:[
  KGROUND.layer('hearths','crystal.selenite',{w:'1.0-vTop*0.85',amt:.85,gain:1.0,name:'massive gypsum (stand-in: stone.alabaster)'}),
  KGROUND.layer('hearths','rock.limestone',{w:'vLime',amt:.7,gain:.9,name:'stromatolite limestone beds (stand-in: rock.limestone.karst)'}),
  KGROUND.layer('hearths','ground.gypsum',{w:'vCrust',amt:.85,gain:1.0,name:'gypsum crust and talus'}),
  KGROUND.layer('rift','ground.wash',{w:'vCrust*0.4+vTop*0.75',amt:.8,gain:.9,name:'soil and wash'}),
  KGROUND.layer('rift','ground.moss',{w:'vTop*0.45',amt:.6,gain:.75,name:'the table\'s moss and litter (its forest is the plateau station\'s)'})].filter(Boolean)});
 return m;}
const MAT_ROCK=rockMat('rift-maze-rock',{side:THREE.DoubleSide});
const MAT_GROUND=rockMat('rift-maze-ground',{polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:2});
/* a loj wall's vertices: on its slab (KCAVERN names the passage, not the monolith, as a vertex's primitive there), by the wall's record */
const WALLS=CAVE.loj?CAVE.loj.walls:[];
const onWall=(x,y,z)=>WALLS.some(W=>{const dx=x-W.at[0],dz=z-W.at[2],a=dx*W.dir[0]+dz*W.dir[1],s=-dx*W.dir[1]+dz*W.dir[0];return Math.abs(a)<SITE.loj.wall/2+.8&&Math.abs(s)<W.w/2+1.4&&y>W.at[1]-1&&y<W.at[1]+W.h+1.6;});
const ROCK=(function(){const G=65535,P=CAVE.C.prims,CLAY=[.66,.5,.38],WALL=[.36,.31,.26],L={col:[0,0,0]};
 const R=KCAVERN.drawRock(CAVE.C,{THREE,material:MAT_ROCK,tile:64,attrs:['aTop','aLime','aCrust','aSky','aMark'],label:'Gypsum of the rift fill (the maze\'s rock), with limestone beds and marl partings',name:'the maze\'s rock',
  weight:(x,y,z,nx,ny,nz,ch,i,w)=>{const pr=ch.prim[i];w[3]=skyAt(x,y,z);
   if(pr===G){groundLook(x,y,z,Math.sqrt(Math.max(0,1-ny*ny))/Math.max(.05,Math.abs(ny)),L);w[0]=L.top;w[1]=L.lime;w[2]=L.crust;w[4]=3;return;}   /* the cavern's own ground (a lip) */
   const hewn=ch.mat[i]===3,wall=onWall(x,y,z);
   w[1]=hewn||wall?0:limeAt(x,y,z)*(1-smooth(.5,.8,ny));
   w[2]=hewn||wall?0:clamp(smooth(.35,.8,ny)*(.45+.6*KRAND.fbm(x*.08,y*.1,z*.08,2,75))+smooth(-.2,-.75,ny)*.25,0,1);
   w[4]=hewn?1:wall?2:0;}});   /* aMark: the vertex's primitive, the Ancients' hewn cut (1), a loj wall (2), the ground (3) */
 /* the vertex colour: the chunk's occlusion (drawRock's), then the clay on the floors and the marl partings on the walls; the hewn cut paler,
    the dry-stone walls darker; the cavern's own ground the grid's colour */
 R.group.children.forEach(m=>{const g=m.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,mk=g.attributes.aMark;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ny=n.getY(i),k=mk.getX(i);let r=c.getX(i)*.86,gg=c.getY(i)*.84,b=c.getZ(i)*.8;
   if(k>2.5){groundLook(x,y,z,Math.sqrt(Math.max(0,1-ny*ny))/Math.max(.05,Math.abs(ny)),L);c.setXYZ(i,L.col[0],L.col[1],L.col[2]);continue;}
   if(k>1.5){c.setXYZ(i,r*WALL[0],gg*WALL[1],b*WALL[2]);continue;}if(k>.5){c.setXYZ(i,r*1.08,gg*1.07,b*1.06);continue;}
   const cl=smooth(.55,.9,ny)*smooth(.25,.75,KRAND.fbm(x*.05,y,z*.05,2,77))*(y<CAVE.ground(x,z)-1?1:0),mr=(1-Math.abs(ny))*marlAt(x,y,z)*.7;
   r*=mix(1,CLAY[0],cl)*mix(1,MARL[0],mr);gg*=mix(1,CLAY[1],cl)*mix(1,MARL[1],mr);b*=mix(1,CLAY[2],cl)*mix(1,MARL[2],mr);c.setXYZ(i,r,gg,b);}
  c.needsUpdate=true;g.deleteAttribute('aMark');
  /* the probe's samples of a merged mesh: every 24th vertex (core/host 95: userData.probePoints), so the registered chambers, mouths and walls
     count the rock that is drawn round them */
  const pp=[];for(let i=0;i<p.count;i+=24)pp.push(p.getX(i),p.getY(i),p.getZ(i));m.userData.probePoints=pp;});
 scene.add(R.group);return R;})();
// ---------------------------------------------------------------- the ground: the table, the face, the bench
const GROUND=(function(){const t0=performance.now(),run=(a,b,s,L)=>{for(let v=a;v<b-1e-6;v+=s)L.push(v);return L;},grp=new THREE.Group(),L={col:[0,0,0]};let tris=0,cut=0;
 grp.name='the ground';scene.add(grp);
 /* one grid: its vertices on CAVE.ground with the look, its quads kept unless the cavern draws the ground there (a doline's lip: holeAt) or a
    void runs under the surface (a mouth on the face) */
 function grid(xs,zs,name){const nx=xs.length,nz=zs.length,pos=new Float32Array(nx*nz*3),col=new Float32Array(nx*nz*3),aTop=new Float32Array(nx*nz),aLime=new Float32Array(nx*nz),aCrust=new Float32Array(nx*nz),aSky=new Float32Array(nx*nz).fill(1);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,x=xs[i],z=zs[j],y=CAVE.ground(x,z),e=.5,sl=Math.hypot(CAVE.ground(x+e,z)-y,CAVE.ground(x,z+e)-y)/e;
   pos[k*3]=x;pos[k*3+1]=y;pos[k*3+2]=z;groundLook(x,y,z,sl,L);aTop[k]=L.top;aLime[k]=L.lime;aCrust[k]=L.crust;col[k*3]=L.col[0];col[k*3+1]=L.col[1];col[k*3+2]=L.col[2];}
  const idx=[];
  for(let j=0;j+1<nz;j++)for(let i=0;i+1<nx;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1,cx=(xs[i]+xs[i+1])/2,cz=(zs[j]+zs[j+1])/2;
   if(CAVE.C.holeAt(cx,cz)){cut++;continue;}
   if(CAVE.inB(cx,cz,20)){const g=CAVE.ground(cx,cz);if(g<-2.5&&CAVE.fast.voidSD(cx,g-.3,cz)<0){cut++;continue;}}
   idx.push(a,c,b,b,c,d);}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));geo.setAttribute('color',new THREE.BufferAttribute(col,3));
  geo.setAttribute('aTop',new THREE.BufferAttribute(aTop,1));geo.setAttribute('aLime',new THREE.BufferAttribute(aLime,1));geo.setAttribute('aCrust',new THREE.BufferAttribute(aCrust,1));geo.setAttribute('aSky',new THREE.BufferAttribute(aSky,1));
  geo.setIndex(new THREE.BufferAttribute(new Uint32Array(idx),1));geo.computeVertexNormals();geo.computeBoundingSphere();
  const m=new THREE.Mesh(geo,MAT_GROUND),pp=[];for(let i=0;i<nx*nz;i+=40)pp.push(pos[i*3],pos[i*3+1],pos[i*3+2]);m.userData.probePoints=pp;
  m.name='the ground: '+name;m.userData.host=true;m.userData.ground=true;m.userData.inspectLabel='The table, the scarp\'s face and the bench (gypsum, limestone beds, marl; soil on the table)';grp.add(m);tris+=idx.length/3;}
 /* three grids meeting on flat ground: the bench west of the face (2 m), THE FACE (half a metre: a mouth's hole is cut to the half metre),
    the table east of it (2 m over the page, 8 m past it). Their seams lie on the bench (x -192) and on the table (x -132) */
 const FX=[-192,-132],zIn=run(-200,200.01,2,run(-560,-200,8,[])).concat(run(208,561,8,[])),zFace=run(-200,200.01,.5,run(-560,-200,4,[])).concat(run(204,561,4,[]));
 grid(run(-420,FX[0]+.01,2,[]),zIn,'the bench');
 grid(run(FX[0],FX[1]+.01,.5,[]),zFace,'the scarp\'s face');
 grid(run(FX[1],240,2,[]).concat(run(240,641,8,[])),zIn,'the table');
 return {mesh:grp,tris,cut,ms:Math.round(performance.now()-t0)};})();window._rock={meshes:ROCK.meshes,chunks:ROCK.chunks,tris:ROCK.tris,ms:ROCK.ms,kground:USE_KG,ground:{tris:GROUND.tris,cut:GROUND.cut,ms:GROUND.ms}};
