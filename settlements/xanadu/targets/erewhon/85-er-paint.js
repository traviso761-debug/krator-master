// ================================================================= EREWHON — the painted ground: albedo, buildable mask, street classes, the road list
// 2048 px over the map's long side (2320 m) ≈ .88 px/m. Everything the layout decides is painted here; placement
// reads the canvases (mask / klass) and the ROADS list; the terrain mesh wears the albedo.
const CS=2048,PXS=CS/ER.W,px=v=>(v+ER.W/2)*PXS,pz=v=>(v+ER.H/2)*PXS;
const gcv=document.createElement('canvas');gcv.width=gcv.height=CS;const cg=gcv.getContext('2d');
// the mask and the classes are core/mask grids (KMASK.canvas: the same calls, hard-edged, identical in every browser and
// in Godot; GODOT-PLAN.md Phase 2 item 5), so placement no longer depends on the canvas; only the albedo is one
const mv=KMASK.canvas(CS,CS);const mg=mv.getContext('2d');
const kv=KMASK.canvas(CS,CS);const kg=kv.getContext('2d');
const KL={none:0,plaza:1,park:2,boulevard:3,minor:4,stair:5,lane:6,farm:7,water:8,court:9,building:10,rock:11,field:12,garden:13};
const KLCOL=k=>'rgb('+k+','+k+','+k+')';
const ROADS=[];const PRECINCTS=[];
function cstroke(ctx,pts,w,col){if(pts.length<2)return;ctx.lineWidth=Math.max(1,w*PXS);ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),pz(p[1])):ctx.moveTo(px(p[0]),pz(p[1])));ctx.stroke();}
function cdisc(ctx,x,z,r,col){ctx.beginPath();ctx.arc(px(x),pz(z),r*PXS,0,7);ctx.fillStyle=col;ctx.fill();}
function cpoly(ctx,pts,col){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(px(p[0]),pz(p[1])):ctx.moveTo(px(p[0]),pz(p[1])));ctx.closePath();ctx.fillStyle=col;ctx.fill();}
const ROADCOL={3:'#8a7a62',4:'#9a8a70',5:'#a89880',6:'#8a8068'};
// a street: painted at once, or with opt.defer once the network is final (90b-er-build prunes and repairs the contour
// streets, links and stairs first, round 9c); r.bench is its terrace, dropped with it
function paintRoad(r){cstroke(cg,r.pts,r.w,r.col||ROADCOL[r.cls]||'#8a7a62');cstroke(mg,r.pts,r.w+.6,'#000');cstroke(kg,r.pts,r.w+1,KLCOL(r.cls));}
function road(pts,w,cls,opt){opt=opt||{};const r={pts,w,cls,id:ROADS.length,zone:opt.zone||null,lights:!!opt.lights,col:opt.col,deferred:!!opt.defer};ROADS.push(r);if(!r.deferred)paintRoad(r);if(opt.bench)r.bench=benchAdd(pts,opt.bench==='lot'?benchReach(w):BENCH_W);return r;}
function disc(x,z,r,type,col){cdisc(cg,x,z,r,col||(type==='park'?'#3a7a3c':type==='court'?'#a89a80':'#c9a56b'));cdisc(mg,x,z,r,type==='park'?'#00ff00':'#000');cdisc(kg,x,z,r,KLCOL(type==='park'?KL.park:type==='court'?KL.court:KL.plaza));}
function precinct(x,z,r,name){PRECINCTS.push({x,z,r,name});}
function footprint(pts,col){cpoly(cg,pts,col||'rgba(70,55,40,.5)');cpoly(mg,pts,'#000');cpoly(kg,pts,KLCOL(KL.building));}
function inPrecinct(x,z,pad){for(const p of PRECINCTS){if(p.rect){const R=p.rect;if(Math.abs(x-R.x)<R.w/2+(pad||0)+2&&Math.abs(z-R.z)<R.d/2+(pad||0)+2)return p;}else if(Math.hypot(x-p.x,z-p.z)<p.r+(pad||0))return p;}return null;}
// ---- base paint from the class field and the height: the lake bed, the flats (grass), the slopes (forest floor),
// the ridge (ochre grass and earth), the unbuildable (scree), the cliffs (pale rock); buildable = flat / steep / ridge
// the ground's base colour at a point (class, height, slope; no noise): the paint below, and the footings of the
// buildings (round 9c: Travis, a footing should match the ground it stands in)
const ER_GCOL=[[26,70,120],[150,168,86],[70,122,62],[160,122,84],[118,112,104],[176,172,164]];
// ---- THE GROUND IN THE VALE'S COLOURS (the owner, 2026-11-12: "redo the ground texture as xanadu biome ground rather
// than the colors that originally came from the png we used for planning"). biomes/xanadu's own ground (46-host-ground.js,
// TEX_GROUND) on this map's fields, the same ones the vendored biome zones itself from (86-bio-46-er-init.js erField):
//   wet    by class, low ground and the stream     up     the height over the lake / 520 m
//   flow   the stream's banks (40 m)                mist   the high slopes
//   sl     the slope                                 sd     metres from the shore (a chamfer off the water; < 0 under it)
// the vale's meadow (gold where dry, lush by the water, flower drifts in the glades), the forest's litter and moss, the
// uplands' terra rossa, limestone and olive scrub, the rock and scree of the cliffs (the map's cliff and unbuildable
// classes are rock whatever their slope), moss in the mist, the shore's sand and pebbles, the stream's gravel. Worked out
// once on a 4 m grid (ERG: the colour and the fields the ground shader's layers read, 90a) and sampled by the paint and
// the footings. ER_GCOL stays for the lake bed's blue
const ERG=(function(){const S=4,NX=Math.ceil(ER.W/S)+1,NZ=Math.ceil(ER.H/S)+1,X=i=>-ER.W/2+i*S,Z=j=>-ER.H/2+j*S,N=NX*NZ;
 const COL=new Float32Array(N*3),SD=new Float32Array(N),FL=new Float32Array(N),UP=new Float32Array(N),SL=new Float32Array(N);
 const sm=(a,b,v)=>smoothstep(a,b,v),hx=v=>[(v>>16&255)/255,(v>>8&255)/255,(v&255)/255];
 const MEAD=hx(0x6e8c3c),MEAD2=hx(0x86984a),GOLD=hx(0xb0a058),LUSH=hx(0x4e7a36),LIT=hx(0x4a3c28),LIT2=hx(0x6a4a2c),MOSS=hx(0x45662e),
  SAND=hx(0xc8bc98),PEB=hx(0xa8a494),ROSSA=hx(0x9a5a3a),ROSSA2=hx(0xb07048),LIME=hx(0xcfc4a6),SCRUB=hx(0x7a8050),
  ROCK=hx(0x8a8078),ROCK2=hx(0x6e6670),ROCK3=hx(0xa89880),SCREE=hx(0xb4aca0),GRAV=hx(0xbab2a2),SILT=hx(0x8a8a6a);
 const mix=(o,c,t)=>{o[0]+=(c[0]-o[0])*t;o[1]+=(c[1]-o[1])*t;o[2]+=(c[2]-o[2])*t;return o;},cp=(o,c)=>{o[0]=c[0];o[1]=c[1];o[2]=c[2];return o;};
 /* the shore distance: a two-pass chamfer from the water's edge, positive on land, negative under the lake */
 const W=new Uint8Array(N);for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i,x=X(i),z=Z(j);W[k]=(erClass(x,z)===0&&terrainBase(x,z)<ER.LAKE+.3)||terrainBase(x,z)<ER.LAKE?1:0;}
 const dist=inside=>{const D=new Float32Array(N);for(let k=0;k<N;k++)D[k]=inside(k)?1e9:0;const d1=S,d2=S*Math.SQRT2;
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i;if(!D[k])continue;let d=D[k];if(i>0)d=Math.min(d,D[k-1]+d1);if(j>0){d=Math.min(d,D[k-NX]+d1);if(i>0)d=Math.min(d,D[k-NX-1]+d2);if(i<NX-1)d=Math.min(d,D[k-NX+1]+d2);}D[k]=d;}
  for(let j=NZ-1;j>=0;j--)for(let i=NX-1;i>=0;i--){const k=j*NX+i;if(!D[k])continue;let d=D[k];if(i<NX-1)d=Math.min(d,D[k+1]+d1);if(j<NZ-1){d=Math.min(d,D[k+NX]+d1);if(i<NX-1)d=Math.min(d,D[k+NX+1]+d2);if(i>0)d=Math.min(d,D[k+NX-1]+d2);}D[k]=d;}return D;};
 const dLand=dist(k=>!W[k]),dWater=dist(k=>W[k]);
 const c=[0,0,0],t=[0,0,0];
 for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const k=j*NX+i,wx=X(i),wz=Z(j);
  const cl=erClass(wx,wz),h=terrainBase(wx,wz),sl=erSlope(wx,wz),sd=W[k]?-dWater[k]:dLand[k];
  const so=nearestOnLines(ER_LINES.stream,wx,wz),sdist=so?so.d:1e9;
  const wet=clamp((cl===1?.74:cl===2?.72:cl===3?.5:.3)+(h<12?.14:0)+(sdist<30?.2:0),0,1),up=clamp(h/520,0,1),flow=clamp(1-sdist/40,0,1),
   mist=clamp((h-260)/220,0,1)*(cl>=2?.8:.3),n3=fbm(wx*.004,wz*.004,4.1,2)-.5;
  SD[k]=sd;FL[k]=flow;UP[k]=up;SL[k]=sl;
  cp(c,MEAD);mix(c,MEAD2,clamp(.5+n3*2.2,0,1));mix(c,GOLD,sm(.62,.46,wet)*.75);mix(c,LUSH,sm(.72,.9,wet)*.6);
  {const fd=sm(.55,.7,fbm(wx*.011-5,wz*.011+2,3131,2))*sm(.2,.08,up)*sm(.8,.6,wet)*sm(20,80,sd);
   if(fd>0&&h3(i,j,11)<.35){const hh=h3(i>>2,j>>2,12),q=[0,0,0];{const r=.62,s=.75,p=r<.5?r*(1+s):r+s-r*s,o=2*r-p,f=x=>{x=(x%1+1)%1;return x<1/6?o+(p-o)*6*x:x<.5?p:x<2/3?o+(p-o)*(2/3-x)*6:o;};q[0]=f(hh+1/3);q[1]=f(hh);q[2]=f(hh-1/3);}mix(c,q,fd*.28);}}
  const fk=sm(.64,.78,wet)*sm(.3,.12,up)*sm(0,120,sd)*sm(.2,.55,fbm(wx*.0026+2,wz*.0026-5,93,2)+.2);
  cp(t,LIT);mix(t,LIT2,clamp(.5+n3*2,0,1));mix(t,MOSS,sm(.8,.95,wet)*.5);mix(c,t,fk*.8);
  const bk=sm(.18,.36,up)*sm(.8,.6,up);
  cp(t,ROSSA);mix(t,ROSSA2,clamp(.5+n3*2,0,1));mix(t,LIME,sm(.56,.7,fbm(wx*.009,wz*.009,7,2))*.8);mix(t,SCRUB,sm(.4,.65,fbm(wx*.006+3,wz*.006,8,2))*.45);mix(c,t,bk);
  const rk=Math.max(sm(.55,.8,up),sm(.7,1.2,sl)*sm(.1,.3,up),cl>=4?1:0);
  cp(t,ROCK);mix(t,ROCK2,clamp(.5+n3*2.4,0,1));mix(t,ROCK3,sm(.55,.7,fbm(wx*.011,wz*.004,9,2)));mix(t,SCREE,sm(.5,.3,sl)*sm(.8,1,up)*.5);mix(c,t,rk);
  mix(c,MOSS,mist*sm(.9,.5,sl)*.55);
  cp(t,SAND);mix(t,PEB,clamp(.5+n3*3,0,1));mix(c,t,sm(70,6,sd)*sm(-8,4,sd)*.85);
  mix(c,SILT,sm(0,-20,sd));mix(c,GRAV,sm(.55,.95,flow)*.75);
  COL[k*3]=c[0]*255;COL[k*3+1]=c[1]*255;COL[k*3+2]=c[2]*255;}
 const bil=(A,x,z,n,o)=>{const u=clamp((x+ER.W/2)/S,0,NX-1.001),v=clamp((z+ER.H/2)/S,0,NZ-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*NX+i;
  return (A[k*n+o]*(1-fu)+A[(k+1)*n+o]*fu)*(1-fv)+(A[(k+NX)*n+o]*(1-fu)+A[(k+NX+1)*n+o]*fu)*fv;};
 return{col:(x,z)=>[bil(COL,x,z,3,0),bil(COL,x,z,3,1),bil(COL,x,z,3,2)],sd:(x,z)=>bil(SD,x,z,1,0),flow:(x,z)=>bil(FL,x,z,1,0),up:(x,z)=>bil(UP,x,z,1,0),slope:(x,z)=>bil(SL,x,z,1,0)};})();
function erGroundCol(x,z,c,h,s){if(c==null){c=erClass(x,z);h=terrainBase(x,z);s=erSlope(x,z);}const COL=ER_GCOL;
  let col=ERG.col(x,z);
  // the lake bed by depth, not by class (round 9c): sand in the shallows deepening to blue, and water-class ground that
  // stands above the lake reads as shore; the class raster's steps had drawn a blocky deep-blue lagoon on the island
  if(c===0||h<ER.LAKE){const dep=ER.LAKE-h,k=smoothstep(0,7,dep);col=dep<=0?[184,168,128]:[184+(26-184)*k,168+(70-168)*k,128+(120-128)*k];}
  if(ISLAND&&h>ER.LAKE){const e=ISLAND.edge(x,z);if(e>0&&c===0&&e<=ISLAND_RAMP)col=[184,168,128];}   /* the filled island: the vale's ground, a sand shore */
  return col;}
(function paintBase(){reseed(SEED_ER+1);const img=cg.createImageData(CS,CS),d=img.data,mi=mg.createImageData(CS,CS),md=mi.data,ki=kg.createImageData(CS,CS),kd=ki.data;
 for(let j=0;j<CS;j++)for(let i=0;i<CS;i++){const x=i/PXS-ER.W/2,z=j/PXS-ER.H/2;const o=(j*CS+i)*4;
  if(!onMap(x,z)){d[o]=110;d[o+1]=106;d[o+2]=98;d[o+3]=255;md[o]=0;md[o+1]=0;md[o+2]=0;md[o+3]=255;kd[o]=KL.rock;kd[o+1]=kd[o+2]=KL.rock;kd[o+3]=255;continue;}
  const c=erClass(x,z),h=terrainBase(x,z),s=erSlope(x,z);const n=1+(h3(i,j,3)-.5)*.08;   /* the biome's grain */
  const col=erGroundCol(x,z,c,h,s);
  d[o]=clamp(col[0]*n,0,255);d[o+1]=clamp(col[1]*n,0,255);d[o+2]=clamp(col[2]*n,0,255);d[o+3]=255;
  const ok=(c===1||c===2||c===3)&&s<.95&&h>1.2;md[o]=ok?255:0;md[o+1]=0;md[o+2]=0;md[o+3]=255;
  const k=c===0?KL.water:(c>=4?KL.rock:0);kd[o]=kd[o+1]=kd[o+2]=k;kd[o+3]=255;}
 cg.putImageData(img,0,0);mg.putImageData(mi,0,0);kg.putImageData(ki,0,0);})();
// ---- samplers (call erBakeMasks() after the last paint) ----
let mData=null,kData=null;
function erBakeMasks(){mData=mg.getImageData(0,0,CS,CS).data;kData=kg.getImageData(0,0,CS,CS).data;}
function maskAt(x,z){const ix=Math.floor(px(x)),iz=Math.floor(pz(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return[0,0];const i=(iz*CS+ix)*4;return[mData[i],mData[i+1]];}
function klass(x,z){const ix=Math.floor(px(x)),iz=Math.floor(pz(z));if(ix<0||iz<0||ix>=CS||iz>=CS)return 0;return kData[(iz*CS+ix)*4];}
function canBuild(x,z){return maskAt(x,z)[0]>200;}
function isRoad(x,z){const k=klass(x,z);return k>=3&&k<=6;}
function walkable(x,z){const k=klass(x,z);return k===1||k===2||(k>=3&&k<=6)||k===9||k===13;}
