// ================================================================= YS CITY — the painted ground: albedo, buildable mask, classes, the road list (PLAN.md P3 step 2; numbered 87a because it reads LAYOUT)
// Everything the layout decides about the GROUND is painted here before anything builds, and placement READS it
// (maskAt / klass / canBuild / isRoad, ROADS, PRECINCTS, nearestRoadPt): the one rule that prevents every overlap bug.
// Three canvases over the PAINT window (2048 px over 2400 m about the city core, 0.85 px/m):
//  ALBEDO  RGBA, transparent where the natural ground shows. The terrain WEARS it through a shader overlay on
//          MAT.pkGround (ysGroundHook): the port paints its ground per vertex, 10 m apart in the core, too coarse
//          for a 14 m street; the overlay is per pixel and ignores the mesh density. It mixes into diffuseColor
//          after the vertex colour, so the seabed's depth tint and the underwater fade still apply over it.
//  MASK    white = buildable; roads (a little wider than drawn), the river and its banks, reserved blocks, footprints.
//  CLASS   R = KL surface class. The zone is not painted: zoneAt reads the layout block.
// The lattice streets are the old grid's block edges: slabs on land and awash, boat lanes (KL.canal, no albedo)
// under water. The highways bend with the shore; the land streets bend a little with the Hykkousoi (a displacement
// FIELD of position, so two streets meeting at a corner agree on where the corner went).
reseed(31980);   // the city's paint; 31981-31989 are the placer's (88)
const PAINT={CS:2048,W:2400,cx:600,cz:100,tex:null,alb:null,mask:null,cls:null,ag:null,mg:null,kg:null,mData:null,kData:null,overlay:null};
PAINT.PXS=PAINT.CS/PAINT.W;
const pxX=v=>(v-PAINT.cx+PAINT.W/2)*PAINT.PXS,pxZ=v=>(v-PAINT.cz+PAINT.W/2)*PAINT.PXS;
{const mk=()=>{const c=document.createElement('canvas');c.width=c.height=PAINT.CS;return c;};
 PAINT.alb=mk();PAINT.mask=mk();PAINT.cls=mk();PAINT.ag=PAINT.alb.getContext('2d');PAINT.mg=PAINT.mask.getContext('2d');PAINT.kg=PAINT.cls.getContext('2d');
 PAINT.mg.fillStyle='#fff';PAINT.mg.fillRect(0,0,PAINT.CS,PAINT.CS);PAINT.kg.fillStyle='#000';PAINT.kg.fillRect(0,0,PAINT.CS,PAINT.CS);}
const KL={none:0,highway:1,street:2,lane:3,market:4,plaza:5,quay:6,river:7,field:8,precinct:9,building:10,canal:11};
const KLNAME=Object.keys(KL);
const KLCOL=k=>'rgb('+(k*20)+',0,0)';   // classes 20 apart on the canvas: a blended edge pixel is then recognisable (ysClassSnap)
const PAINT_COL={highway:'#6b6356',street:'#9c978b',awash:'#8a877d',lane:'#7d7466',market:'#b8ad96',plaza:'#b3a78f',river:'#5b6657',field:['#728a3a','#98944c','#5f7a33','#8a8c42']};
const YS_ST={w:14,hw:16,lane:8};   // street widths (DESIGN §2: 12-16 m)
const ROADS=[];       // {pts,w,cls,id,zone,len} in world metres: the frontage walker (88) walks these
const PRECINCTS=[];   // discs nothing else may build in: {x,z,r,name,use}
const RIVER={pts:[],w:[]};   // the river's course and its width at each point (84 carves the channel from this; 85 paints and reserves it)
function cstroke(ctx,pts,w,col){if(pts.length<2)return;ctx.lineWidth=Math.max(1,w*PAINT.PXS);ctx.strokeStyle=col;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(pxX(p[0]),pxZ(p[1])):ctx.moveTo(pxX(p[0]),pxZ(p[1])));ctx.stroke();}
function cdisc(ctx,x,z,r,col){ctx.beginPath();ctx.arc(pxX(x),pxZ(z),r*PAINT.PXS,0,7);ctx.fillStyle=col;ctx.fill();}
function cpoly(ctx,pts,col){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(pxX(p[0]),pxZ(p[1])):ctx.moveTo(pxX(p[0]),pxZ(p[1])));ctx.closePath();ctx.fillStyle=col;ctx.fill();}
function polyLen(P){let L=0;for(let i=1;i<P.length;i++)L+=Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]);return L;}
// a road: albedo (opt.col; null = none, a boat lane), blocked in the mask a little wider, classed, remembered
function road(pts,w,cls,opt){opt=opt||{};if(opt.col!==null)cstroke(PAINT.ag,pts,w,opt.col||PAINT_COL[KLNAME[cls]]||'#7d7466');
 cstroke(PAINT.mg,pts,w+3,'#000');cstroke(PAINT.kg,pts,w+1.5,KLCOL(cls));
 const r={pts,w,cls,id:ROADS.length,zone:opt.zone||null,len:polyLen(pts)};ROADS.push(r);return r;}
function disc(x,z,r,cls,col){if(col!==null)cdisc(PAINT.ag,x,z,r,col||PAINT_COL[KLNAME[cls]]||'#b3a78f');cdisc(PAINT.mg,x,z,r,'#000');cdisc(PAINT.kg,x,z,r,KLCOL(cls));}
function precinct(x,z,r,name,use){PRECINCTS.push({x,z,r,name,use});}
function inPrecinct(x,z,pad){for(const p of PRECINCTS)if(Math.hypot(x-p.x,z-p.z)<p.r+(pad||0))return p;return null;}
// a building footprint (world polygon): blocked in the mask, classed, a foundation shadow on the albedo. The placer
// calls this per building, then ysPaintBake() once; the terrain was built before, so the shadow shows only on the
// overlay texture (which updates), never on the vertex colours (which are fixed): exactly what we want.
function footprint(pts,col){cpoly(PAINT.ag,pts,col||'rgba(50,40,30,.5)');cpoly(PAINT.mg,pts,'#000');cpoly(PAINT.kg,pts,KLCOL(KL.building));}
// the square of a layout block, shrunk by `inset` m on each side, as a world polygon
function blockPoly(b,inset){const U=LAYOUT.U,V=LAYOUT.V,h=LAYOUT.P/2-(inset||0);return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([du,dv])=>[b.x+U[0]*du*h+V[0]*dv*h,b.z+U[1]*du*h+V[1]*dv*h]);}
// ---------------------------------------------------------------- the old lattice: every block edge is a street
// A street's kind is read at its midpoint from the sink: land and awash are paved (the awash slabs show through
// the sea); canal and open are boat lanes between the hosts, classed KL.canal so nothing builds across them.
function ysBend(x,z){const s=ysShoreDist(x,z);const k=clamp((s-90)/260,0,1)*16;if(k<=0)return [x,z];
 return [x+(fbm(x/310+7.1,z/310+2.3,4.4,2)-.5)*2*k,z+(fbm(x/310+1.9,z/310+8.8,6.6,2)-.5)*2*k];}
(function paintLattice(){const seen=new Set();
 const edge=(i0,j0,i1,j1)=>{const key=i0+','+j0+'>'+i1+','+j1;if(seen.has(key))return;seen.add(key);
  const a=ysBlockXZ(i0,j0),b=ysBlockXZ(i1,j1);const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;const kind=ysKindOf(ysPlaneY(ysShoreDist(mx,mz)));
  const pts=[];for(let k=0;k<=8;k++){const t=k/8;pts.push(ysBend(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t));}
  if(kind==='land')road(pts,YS_ST.w,KL.street,{zone:'lattice',col:PAINT_COL.street});
  else if(kind==='awash')road(pts,YS_ST.w,KL.street,{zone:'lattice:awash',col:PAINT_COL.awash});
  else road(pts,YS_ST.w,KL.canal,{zone:'lattice:'+kind,col:null});};
 for(const b of LAYOUT.blocks){const i=b.i,j=b.j;edge(i-.5,j-.5,i+.5,j-.5);edge(i-.5,j-.5,i-.5,j+.5);
  if(!ysBlock(i+1,j))edge(i+.5,j-.5,i+.5,j+.5);if(!ysBlock(i,j+1))edge(i-.5,j+.5,i+.5,j+.5);}
})();
// ---------------------------------------------------------------- the three highways through the main market (DESIGN §2)
// The shore polyline by arc length, with the inland normal; the coast roads keep ~120 m inland of it (behind the quays)
const YS_SHORE_ARC=(()=>{const P=CITY.SHORE,cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));return cum;})();
function ysShorePt(s){const P=CITY.SHORE,cum=YS_SHORE_ARC;s=clamp(s,0,cum[cum.length-1]);let i=1;while(i<cum.length-1&&cum[i]<s)i++;
 const a=P[i-1],b=P[i],L=cum[i]-cum[i-1]||1,t=(s-cum[i-1])/L;const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;
 return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,tx:dx,tz:dz,nx:dz,nz:-dx};}   // n points inland (the land is left of the line)
function ysShoreArcOf(x,z){let best=0,bd=1e9;const P=CITY.SHORE,cum=YS_SHORE_ARC;
 for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i];const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1);
  const d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d<bd){bd=d;best=cum[i-1]+t*Math.sqrt(L2);}}return best;}
(function paintHighways(){const M=LAYOUT.by['0,0'];const m0=[M.x,M.z];
 const sM=ysShoreArcOf(M.x,M.z),sEnd=YS_SHORE_ARC[YS_SHORE_ARC.length-1];
 const coast=(dir,name)=>{const pts=[m0];for(let s=sM+dir*60;s>0&&s<sEnd;s+=dir*40){const p=ysShorePt(s);const d=120+(fbm(s/700+(dir>0?3.3:8.8),.5,2.2,2)-.5)*50;
   const x=p.x+p.nx*d,z=p.z+p.nz*d;if(Math.abs(x)>1580||Math.abs(z)>1580)break;pts.push([x,z]);}
  road(pts,YS_ST.hw,KL.highway,{zone:'highway:'+name,col:PAINT_COL.highway});};
 coast(1,'NE');coast(-1,'S');
 // inland, toward the Inner Wall: straight out of the market against the head's seaward normal, wobbling as it goes
 const N=LAYOUT.N;const pts=[m0];for(let d=40;d<2600;d+=40){const w=clamp((d-150)/400,0,1)*45;const x=m0[0]-N[0]*d+(-N[1])*(fbm(d/620+1.7,.5,5.1,2)-.5)*2*w,z=m0[1]-N[1]*d+(N[0])*(fbm(d/620+1.7,.5,5.1,2)-.5)*2*w;
  if(Math.abs(x)>1580||Math.abs(z)>1580)break;pts.push([x,z]);}
 road(pts,YS_ST.hw,KL.highway,{zone:'highway:NW',col:PAINT_COL.highway});
 disc(M.x,M.z,78,KL.market,PAINT_COL.market);   // the main market: the city's hinge, an open ground where the three meet
})();
// ---------------------------------------------------------------- the river (DESIGN §2): from the north-west, down to the bay at the river-mouth block
(function paintRiver(){const R=LAYOUT.landmarks.river_mouth;if(!R)return;const m=[R.x,R.z];
 // a bezier from the west edge through the hinterland to the mouth, then straight on into the bay
 const C=[[-1580,-760],[-1050,-420],[-520,120],[-160,470],[m[0]-120,m[1]-90],m,[m[0]+70,m[1]+60]];
 const bez=(t)=>{const n=C.length-1;const i=Math.min(n-1,Math.floor(t*n)),u=t*n-i;const a=C[Math.max(0,i-1)],b=C[i],c=C[i+1],d=C[Math.min(n,i+2)];   // Catmull-Rom
  const f=(p0,p1,p2,p3)=>.5*((2*p1)+(-p0+p2)*u+(2*p0-5*p1+4*p2-p3)*u*u+(-p0+3*p1-3*p2+p3)*u*u*u);return [f(a[0],b[0],c[0],d[0]),f(a[1],b[1],c[1],d[1])];};
 for(let k=0;k<=160;k++){const t=k/160;const p=bez(t);const w=12+10*t*t;const wob=(fbm(t*9+2.2,.5,7.7,2)-.5)*18*(1-t);RIVER.pts.push([p[0]+wob,p[1]-wob]);RIVER.w.push(w);}
 for(let i=0;i<RIVER.pts.length-1;i++){const seg=[RIVER.pts[i],RIVER.pts[i+1]],w=(RIVER.w[i]+RIVER.w[i+1])/2;
  cstroke(PAINT.ag,seg,w,PAINT_COL.river);cstroke(PAINT.mg,seg,w+36,'#000');cstroke(PAINT.kg,seg,w+2,KLCOL(KL.river));}
 RIVER.len=polyLen(RIVER.pts);
})();
// ---------------------------------------------------------------- reservations: the landmarks' precincts, the harbours, the fields
(function paintBlocks(){
 for(const use in LAYOUT.landmarks){const b=LAYOUT.landmarks[use];precinct(b.x,b.z,92,LAYOUT_NAMES[use]||use,use);
  if(/harbour|docks|river_mouth/.test(use)){cpoly(PAINT.mg,blockPoly(b,8),'#000');cpoly(PAINT.kg,blockPoly(b,8),KLCOL(KL.quay));}
  else if(use!=='main_market'){cpoly(PAINT.mg,blockPoly(b,8),'#000');cpoly(PAINT.kg,blockPoly(b,8),KLCOL(KL.precinct));}}
 // fields: strips across every farm block, five to a block, the colours by the block's hash; still buildable (the farmhouse)
 for(const b of LAYOUT.blocks){if(b.use!=='farm')continue;const U=LAYOUT.U,V=LAYOUT.V,h=LAYOUT.P/2-12;const r=ysHash(b.i,b.j);const n=4+Math.floor(r*2);const sw=(2*h)/n;
  for(let k=0;k<n;k++){const u0=-h+k*sw+2.5,u1=-h+(k+1)*sw-2.5;const col=PAINT_COL.field[(Math.floor(r*97)+k)%PAINT_COL.field.length];
   const P=[[u0,-h],[u1,-h],[u1,h],[u0,h]].map(([du,dv])=>[b.x+U[0]*du+V[0]*dv,b.z+U[1]*du+V[1]*dv]);cpoly(PAINT.ag,P,col);cpoly(PAINT.kg,P,KLCOL(KL.field));}}
})();
// grain over everything painted so far (source-atop: only where the albedo has alpha), so the slabs and fields are not flat ink
(function grain(){const g=PAINT.ag;g.save();g.globalCompositeOperation='source-atop';
 for(let i=0;i<9000;i++){g.beginPath();g.arc(rng()*PAINT.CS,rng()*PAINT.CS,rr(.8,3.2),0,7);g.fillStyle=rng()<.5?'rgba(0,0,0,.16)':'rgba(255,255,255,.12)';g.fill();}g.restore();})();
// ---------------------------------------------------------------- samplers (ysPaintBake() after the last paint; the placer calls it again after its footprints)
function ysPaintBake(){PAINT.mData=PAINT.mg.getImageData(0,0,PAINT.CS,PAINT.CS).data;PAINT.kData=ysClassSnap(PAINT.kg.getImageData(0,0,PAINT.CS,PAINT.CS).data);if(PAINT.tex)PAINT.tex.needsUpdate=true;}
// The canvas anti-aliases every shape edge, and on the class canvas a blended edge pixel would be a THIRD class (a
// street over nothing reading as a highway). Classes are drawn 20 apart, so a blended pixel is any value that is not a
// multiple of 20: two passes give each one the nearest clean value among its eight neighbours (the nearest multiple of
// 20 if none), so the 1 px edge band belongs to one side or the other, never to a class nobody painted.
// Returns the DECODED class per pixel (CS*CS), which klass, the overlay and the census read.
function ysClassSnap(d){const CS=PAINT.CS;const k=new Uint8Array(CS*CS);for(let i=0;i<CS*CS;i++)k[i]=d[i*4];
 for(let pass=0;pass<2;pass++){const src=k.slice();
  for(let y=1;y<CS-1;y++)for(let x=1;x<CS-1;x++){const i=y*CS+x,v=src[i];if(v%20===0)continue;let best=-1;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const q=src[i+dy*CS+dx];if(q%20===0&&(best<0||Math.abs(q-v)<Math.abs(best-v)))best=q;}
   k[i]=best<0?Math.round(v/20)*20:best;}}
 for(let i=0;i<CS*CS;i++)k[i]=Math.round(k[i]/20);return k;}
function ysPx(x,z){const ix=Math.floor(pxX(x)),iz=Math.floor(pxZ(z));return (ix<0||iz<0||ix>=PAINT.CS||iz>=PAINT.CS)?-1:(iz*PAINT.CS+ix)*4;}
function maskAt(x,z){const i=ysPx(x,z);return i<0?255:PAINT.mData[i];}   // outside the window: buildable (the placer's ground tests decide)
function klass(x,z){const i=ysPx(x,z);return i<0?0:PAINT.kData[i/4];}
function zoneAt(x,z){const g=ysBlockIJ(x,z);const b=ysBlock(Math.round(g[0]),Math.round(g[1]));return b?b.use:null;}
function canBuild(x,z){return maskAt(x,z)>200;}
function isRoad(x,z){const k=klass(x,z);return k===KL.highway||k===KL.street||k===KL.lane;}
// the nearest point on any road (or on roads of one class): {x,z,d,t,road}
function nearestRoadPt(x,z,cls){let best=null;for(const r of ROADS){if(cls!==undefined&&r.cls!==cls)continue;const P=r.pts;
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz||1;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/L2,0,1);
  const qx=a[0]+dx*t,qz=a[1]+dz*t,d=Math.hypot(x-qx,z-qz);if(!best||d<best.d)best={x:qx,z:qz,d,t:(i+t)/(P.length-1),road:r,tx:dx/Math.sqrt(L2),tz:dz/Math.sqrt(L2)};}}
 return best;}
ysPaintBake();
// ---------------------------------------------------------------- the terrain wears the albedo: a shader overlay on the port's ground material
// Set here, before 90 runs portUnderwaterPatch(): the patch leaves a material whose hook has a body alone (it would
// otherwise replace it), so this hook calls portUWsh itself first, like hkNacreHook (KNOWN_ISSUES.md).
PAINT.tex=new THREE.CanvasTexture(PAINT.alb);PAINT.tex.flipY=false;PAINT.tex.anisotropy=4;PAINT.tex.wrapS=PAINT.tex.wrapT=THREE.ClampToEdgeWrapping;
const YS_PWIN={value:new THREE.Vector4(PAINT.cx,PAINT.cz,1/PAINT.W,1/PAINT.W)};
function ysGroundHook(sh){portUWsh(sh);sh.uniforms.u_paint={value:PAINT.tex};sh.uniforms.u_pwin=YS_PWIN;
 sh.vertexShader='varying vec2 vYsP;\n'+sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvYsP=(modelMatrix*vec4(transformed,1.0)).xz;');
 sh.fragmentShader='uniform sampler2D u_paint;\nuniform vec4 u_pwin;\nvarying vec2 vYsP;\n'+sh.fragmentShader.replace('#include <color_fragment>',
  ['#include <color_fragment>','vec2 _pu=(vYsP-u_pwin.xy)*u_pwin.zw+0.5;',
   'if(_pu.x>0.0&&_pu.x<1.0&&_pu.y>0.0&&_pu.y<1.0){vec4 _pc=texture2D(u_paint,_pu);_pc.rgb=pow(_pc.rgb,vec3(2.2));diffuseColor.rgb=mix(diffuseColor.rgb,_pc.rgb,_pc.a);}'].join('\n'));}
MAT.pkGround.onBeforeCompile=ysGroundHook;MAT.pkGround.needsUpdate=true;
// ---------------------------------------------------------------- the Paint overlay (dev tool): the class canvas as a sheet over the core
const PAINT_OVCOL={0:[0,0,0,0],1:[60,40,30,200],2:[200,200,190,200],3:[150,130,110,200],4:[255,120,80,200],5:[255,200,120,200],6:[120,140,200,200],7:[60,120,220,200],8:[120,200,80,170],9:[220,80,220,150],10:[40,40,40,220],11:[40,90,140,170]};
function ysPaintOverlay(on){on=!!on;
 if(on&&!PAINT.overlay){const c=document.createElement('canvas');c.width=c.height=PAINT.CS;const g=c.getContext('2d');const id=g.createImageData(PAINT.CS,PAINT.CS),d=id.data;
  for(let i=0;i<d.length;i+=4){const k=PAINT.kData[i/4];const col=PAINT_OVCOL[k]||[255,0,0,200];d[i]=col[0];d[i+1]=col[1];d[i+2]=col[2];d[i+3]=col[3];}
  g.putImageData(id,0,0);const t=new THREE.CanvasTexture(c);t.flipY=false;
  const geo=new THREE.PlaneGeometry(PAINT.W,PAINT.W,1,1);geo.rotateX(-Math.PI/2);   // local (x, -z) after the rotation: flip v so canvas rows run +z
  const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i));
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:t,transparent:true,depthTest:false,depthWrite:false,fog:false,side:THREE.DoubleSide}));
  m.position.set(PAINT.cx,2,PAINT.cz);m.renderOrder=900;m.userData.probeSkip=true;m.frustumCulled=false;scene.add(m);PAINT.overlay=m;}
 if(PAINT.overlay)PAINT.overlay.visible=on;return on;}
function ysPaintCensus(){const c={roads:ROADS.length,byClass:{},precincts:PRECINCTS.length,river:RIVER.pts.length?Math.round(RIVER.len):0,window:[PAINT.cx,PAINT.cz,PAINT.W]};
 for(const r of ROADS){const e=c.byClass[KLNAME[r.cls]]||(c.byClass[KLNAME[r.cls]]={n:0,len:0});e.n++;e.len+=r.len;}for(const k in c.byClass)c.byClass[k].len=Math.round(c.byClass[k].len);
 const cov={};let n=0;for(let iz=0;iz<PAINT.CS;iz+=4)for(let ix=0;ix<PAINT.CS;ix+=4){const k=KLNAME[PAINT.kData[iz*PAINT.CS+ix]]||'?';cov[k]=(cov[k]||0)+1;n++;}
 for(const k in cov)cov[k]=+(cov[k]/n*100).toFixed(2);c.coverPct=cov;
 // the three highways reach the main market and the map's edge
 const M=LAYOUT.by['0,0'];c.highways=ROADS.filter(r=>r.cls===KL.highway).map(r=>{const a=r.pts[0],b=r.pts[r.pts.length-1];return {zone:r.zone,atMarket:Math.hypot(a[0]-M.x,a[1]-M.z)<1,edge:Math.max(Math.abs(b[0]),Math.abs(b[1]))>1500,len:Math.round(r.len)};});
 return c;}
