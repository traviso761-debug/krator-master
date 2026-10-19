// ================================================================= LONGSONG — the architecture kit (ARCH)
// [draw] The Order's monastery architecture: Tibetan massing (battered whitewashed walls on a dressed granite plinth,
// black trapezoid windows under corbelled lintels, the maroon twig band under the parapet, flat roofs, the red upper
// palace, gilded hip roofs with horns) in the chapterhouses' vocabulary (drum halls under blue tile cones with
// lanterns, round relief-ringed windows, curved arcaded galleries, the parabolic gate between pylons, the blue-and-white
// mosaic string course, the Order's spire and bell, electric lamps). STONE AND LIME ONLY (the owner, 2026-10-19): no
// banco, no rammed earth, no toron; where the chapterhouses are Sahelian earth, Longsong is granite and lime render.
//
// Everything is accumulated per material into a few merged meshes (one draw each), world-unit UVs on the library's
// maps (materials.json: wall, ashlar, slate, gilt, twig, wood, paving), vertex colours carrying the paint. A builder
// passes records in (64-ls-monastery.js); the kit decides nothing about where things go.
//   ARCH.box(k,x,y,z,w,h,d,o)        o: {col, ry, batter (m the walls lean in over h), top, bottom, sides}
//   ARCH.cyl(k,x,y,z,r0,r1,h,o)      a frustum (r1 0: a cone); o: {seg, col, top, bottom, a0, a1 (an arc)}
//   ARCH.ring(k,x,y,z,R,t,h,o)       a band standing t proud of a drum of radius R
//   ARCH.dome(k,x,y,z,r,o)           a hemisphere (o.k: a bulb's height factor)
//   ARCH.quad(k,a,b,c,d,col)         four corners (counter-clockwise seen from the front)
//   ARCH.wedge(k,x0,x1,z0,z1,ya0,ya1,yb) a ramp: the top from ya0 at x0 to ya1 at x1, down to yb
//   ARCH.finish()                    the meshes (userData.arch), once
//   ARCH.col(hex)                    a linear colour, cached
const ARCH=(function(){
 const SCALE={wall:3,ashlar:2,slate:1.6,gilt:1.2,twig:1,wood:1.5,paving:3,dark:2,cloth:1,glow:1,bronze:1.5};
 const A={};const acc=k=>A[k]||(A[k]={p:[],n:[],u:[],c:[]});
 const CC={};const col=h=>{if(typeof h!=='number')return h;return CC[h]||(CC[h]=new THREE.Color(h).convertSRGBToLinear());};
 const WHITE=col(0xf2efe6);
 // world-unit UVs: a horizontal face takes x,z; a vertical one runs along its own horizontal and y
 function tri(k,a,b,c,C,n){const S=acc(k),s=SCALE[k]||2;
  let nx,ny,nz;if(n){nx=n[0];ny=n[1];nz=n[2];}else{const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
   nx=uy*vz-uz*vy;ny=uz*vx-ux*vz;nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;}
  for(const p of [a,b,c]){S.p.push(p[0],p[1],p[2]);S.n.push(nx,ny,nz);
   if(Math.abs(ny)>.7)S.u.push(p[0]/s,p[2]/s);else S.u.push((p[0]*-nz+p[2]*nx)/s,p[1]/s);
   S.c.push(C.r,C.g,C.b);}}
 function quad(k,a,b,c,d,C){C=col(C==null?WHITE:C);tri(k,a,b,c,C);tri(k,a,c,d,C);}
 // a local frame: rotate (x,z) about (ox,oz) by ry (three's rotation.y: +x turns to -z... (cos, -sin))
 const rot=(ox,oz,ry)=>{const c=Math.cos(ry),s=Math.sin(ry);return (x,y,z)=>[ox+x*c+z*s,y,oz-x*s+z*c];};
 function box(k,x,y,z,w,h,d,o){o=o||{};const C=col(o.col==null?WHITE:o.col),bt=o.batter||0,R=rot(x,z,o.ry||0),hw=w/2,hd=d/2,tw=Math.max(.05,hw-bt),td=Math.max(.05,hd-bt);
  const b0=R(-hw,y,-hd),b1=R(hw,y,-hd),b2=R(hw,y,hd),b3=R(-hw,y,hd),t0=R(-tw,y+h,-td),t1=R(tw,y+h,-td),t2=R(tw,y+h,td),t3=R(-tw,y+h,td);
  const sides=o.sides||'nesw';
  if(sides.indexOf('n')>=0)quad(k,b1,b0,t0,t1,C);if(sides.indexOf('e')>=0)quad(k,b2,b1,t1,t2,C);
  if(sides.indexOf('s')>=0)quad(k,b3,b2,t2,t3,C);if(sides.indexOf('w')>=0)quad(k,b0,b3,t3,t0,C);
  if(o.top!==false)quad(k,t0,t3,t2,t1,o.topCol!=null?o.topCol:C);if(o.bottom)quad(k,b0,b1,b2,b3,C);}
 function cyl(k,x,y,z,r0,r1,h,o){o=o||{};const C=col(o.col==null?WHITE:o.col),n=o.seg||16,a0=o.a0||0,a1=o.a1==null?Math.PI*2:o.a1,full=o.a1==null;
  const P=(a,r,yy)=>[x+Math.cos(a)*r,yy,z+Math.sin(a)*r];
  for(let i=0;i<n;i++){const a=a0+(a1-a0)*i/n,b=a0+(a1-a0)*(i+1)/n;
   if(o.inside)quad(k,P(b,r0,y),P(a,r0,y),P(a,r1,y+h),P(b,r1,y+h),C);else quad(k,P(a,r0,y),P(b,r0,y),P(b,r1,y+h),P(a,r1,y+h),C);
   if(o.top!==false&&r1>0&&full)tri(k,[x,y+h,z],P(b,r1,y+h),P(a,r1,y+h),C);
   if(o.bottom&&full)tri(k,[x,y,z],P(a,r0,y),P(b,r0,y),C);}}
 function ring(k,x,y,z,R,t,h,o){o=o||{};cyl(k,x,y,z,R+t,R+t,h,Object.assign({top:false},o));
  cyl(k,x,y+h,z,R+t,R,0.001,Object.assign({top:false},o));cyl(k,x,y,z,R,R+t,0.001,Object.assign({top:false},o));}
 function dome(k,x,y,z,r,o){o=o||{};const C=col(o.col==null?WHITE:o.col),n=o.seg||18,m=o.rows||7,kh=o.k||1;
  for(let j=0;j<m;j++){const p0=j/m*Math.PI/2,p1=(j+1)/m*Math.PI/2;
   for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;const P=(aa,pp)=>[x+Math.cos(aa)*Math.cos(pp)*r,y+Math.sin(pp)*r*kh,z+Math.sin(aa)*Math.cos(pp)*r];
    quad(k,P(a,p0),P(b,p0),P(b,p1),P(a,p1),C);}}}
 function wedge(k,x0,x1,z0,z1,ya0,ya1,yb,C){C=col(C==null?WHITE:C);
  const a=[x0,ya0,z0],b=[x1,ya1,z0],c=[x1,ya1,z1],d=[x0,ya0,z1],a2=[x0,yb,z0],b2=[x1,yb,z0],c2=[x1,yb,z1],d2=[x0,yb,z1];
  const fl=x1<x0;   // keep the faces outward when the ramp runs west
  if(!fl){quad(k,a,d,c,b,C);quad(k,a2,b2,b,a,C);quad(k,c2,d2,d,c,C);quad(k,b2,c2,c,b,C);quad(k,d2,a2,a,d,C);}
  else{quad(k,a,b,c,d,C);quad(k,b2,a2,a,b,C);quad(k,d2,c2,c,d,C);quad(k,c2,b2,b,c,C);quad(k,a2,d2,d,a,C);}}
 // ---------------------------------------------------------------- the materials
 const pk=n=>(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('longsong',n):null;
 function stdMat(fam,o){o=o||{};const L=pk(fam),T=L?KMAT.textures(L,{aniso:8}):{};
  const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:o.rough==null?.92:o.rough,metalness:o.metal||0,map:T.map||null,normalMap:T.normalMap||null,roughnessMap:T.roughnessMap||null,side:o.side||THREE.FrontSide});
  if(T.normalMap)m.normalScale.set(o.ns||.8,o.ns||.8);
  if(L){m.onBeforeCompile=sh=>KMAT.libHooks(sh,L);m.customProgramCacheKey=()=>'ls-'+fam+KMAT.libKey(L);}
  return m;}
 const MATS={wall:()=>stdMat('wall'),ashlar:()=>stdMat('ashlar'),slate:()=>stdMat('slate',{rough:.55}),gilt:()=>stdMat('gilt',{rough:.32,metal:.55}),
  twig:()=>stdMat('twig'),wood:()=>stdMat('wood',{rough:.6}),paving:()=>stdMat('paving'),bronze:()=>new THREE.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:.6}),
  dark:()=>new THREE.MeshLambertMaterial({vertexColors:true}),cloth:()=>new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),
  glow:()=>new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false})};
 let done=null;
 function finish(){if(done)return done;done=[];
  for(const k in A){const S=A[k];if(!S.p.length)continue;const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute(S.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(S.n,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(S.u,2));g.setAttribute('color',new THREE.Float32BufferAttribute(S.c,3));
   const m=new THREE.Mesh(g,(MATS[k]||MATS.wall)());m.name='longsong:'+k;m.userData.host=true;m.userData.cls='building';
   if(k.slice(0,2)==='v-')m.userData.vault=true;else m.userData.arch=true;
   m.userData.inspectLabel='Longsong ('+({wall:'lime render over stone',ashlar:'dressed granite',slate:'glazed tile',gilt:'gilding',twig:'the twig band',wood:'lacquered timber',paving:'flagstones',dark:'paint',cloth:'cloth',glow:'lamplight',bronze:'bronze','v-stone':'the Vault\'s chiselled stone','v-bronze':'bronze','v-gilt':'gilding','v-wood':'lacquered timber','v-dark':'paint','v-cloth':'cloth','v-lead':'lead'}[k]||k)+')';
   scene.add(m);done.push(m);S.p=S.n=S.u=S.c=null;}
  return done;}
 return {box,cyl,ring,dome,quad,wedge,tri,finish,col,rot,A,MATS,stdMat};})();

// ---------------------------------------------------------------- the pieces (the vocabulary), in the kit's local terms
// THE PALETTE (sRGB): the White Palace's lime white, the Red Palace's ochre red, the twig band's maroon, the Order's blue
// (the only saturated colour the chapterhouses allow, with the Order's saffron in the cloth), the window's black.
const LSP={white:0xf2efe6,white2:0xe8e2d4,red:0x8e2f24,red2:0x7a271f,maroon:0x4a1c18,blue:0x2e5a9c,blue2:0x1f3f78,blueWhite:0xdfe6ef,
 black:0x161412,dark:0x24201c,saffron:0xe0a030,gold:0xd8b048,granite:0xb6b0a6,granite2:0x948e86,wood:0x7a2e1e,woodDark:0x3a1e14,roof:0x8a847a};
// a wall face's windows: along the edge (ax,az)->(bx,bz) whose outward normal is (nx,nz), storey by storey; Tibetan:
// a black trapezoid (wider at the sill) round a dark opening with a lacquered frame, a corbelled lintel over it and, on
// a rich house, a pleated valance; the Order's round relief-ringed windows on the archive's storeys (o.round)
function lsWindows(ax,az,bx,bz,nx,nz,y0,floors,storey,o){o=o||{};const L=Math.hypot(bx-ax,bz-az),tx=(bx-ax)/L,tz=(bz-az)/L,sp=o.spacing||4.2;
 const n=Math.max(1,Math.floor((L-2)/sp)),bt=o.batter||0,H=floors*storey;
 for(let f=(o.from||0);f<floors;f++){const yb=y0+f*storey+storey*.32,ww=(o.w||1.3)*(f===floors-1&&o.topWide?1.4:1),wh=storey*.42;
  for(let i=0;i<n;i++){const s=(i+.5)*L/n;if(o.skip&&o.skip(s,f))continue;
   const lean=bt*((yb+wh/2-y0)/H),off=.06-lean,cx=ax+tx*s+nx*off,cz=az+tz*s+nz*off;
   const P=(u,v,d)=>[cx+tx*u+nx*(d||0),v,cz+tz*u+nz*(d||0)];
   if(o.round&&f>=(o.roundFrom||0)){const r=wh*.55,yc=yb+wh*.5,N=14;
    for(let k=0;k<N;k++){const a=k/N*Math.PI*2,b=(k+1)/N*Math.PI*2;
     ARCH.quad('ashlar',P(Math.cos(a)*r*1.35,yc+Math.sin(a)*r*1.35,.04),P(Math.cos(a)*r,yc+Math.sin(a)*r,.12),P(Math.cos(b)*r,yc+Math.sin(b)*r,.12),P(Math.cos(b)*r*1.35,yc+Math.sin(b)*r*1.35,.04),LSP.granite);
     ARCH.tri('dark',P(0,yc,-.02),P(Math.cos(b)*r,yc+Math.sin(b)*r,.12),P(Math.cos(a)*r,yc+Math.sin(a)*r,.12),ARCH.col(LSP.black));}
    continue;}
   // the black trapezoid
   ARCH.quad('dark',P(-ww*.85,yb-.25,0),P(ww*.85,yb-.25,0),P(ww*.62,yb+wh+.3,0),P(-ww*.62,yb+wh+.3,0),LSP.black);
   // the opening and its frame
   ARCH.quad('dark',P(-ww*.42,yb,.02),P(ww*.42,yb,.02),P(ww*.42,yb+wh,.02),P(-ww*.42,yb+wh,.02),o.lit&&((i+f)%3===0)?0xd8a050:0x3a3028);
   ARCH.box('wood',cx+nx*.05,yb+wh*.5-.04,cz+nz*.05,.08,.08,.08,{});
   ARCH.quad('wood',P(-ww*.5,yb+wh,.03),P(ww*.5,yb+wh,.03),P(ww*.5,yb+wh+.12,.03),P(-ww*.5,yb+wh+.12,.03),LSP.wood);
   // the corbelled lintel: two courses of short joists, standing out
   for(let q=0;q<2;q++){const yy=yb+wh+.16+q*.16,ex=ww*(.62+q*.14),dd=.18+q*.14;
    ARCH.quad('wood',P(-ex,yy,dd),P(ex,yy,dd),P(ex,yy+.14,dd),P(-ex,yy+.14,dd),q?LSP.woodDark:LSP.wood);
    ARCH.quad('wood',P(-ex,yy+.14,0),P(ex,yy+.14,0),P(ex,yy+.14,dd),P(-ex,yy+.14,dd),LSP.wood);}
   // the valance (the Order's saffron over white)
   if(o.valance){ARCH.quad('cloth',P(-ww*.66,yb+wh+.12,.24),P(ww*.66,yb+wh+.12,.24),P(ww*.66,yb+wh-.24,.3),P(-ww*.66,yb+wh-.24,.3),(i+f)%2?LSP.saffron:0xf0ead8);}}}}
// a battered Tibetan block: the granite plinth from the ground up, the whitewashed (or red) body, the twig band under
// the parapet, the parapet and its coping, the flat roof, the windows on every face
function lsBlock(x,z,w,d,yG,y0,floors,storey,o){o=o||{};const H=floors*storey,bt=o.batter==null?H*.06:o.batter,body=o.col||LSP.white;
 const plinth=Math.max(.9,y0-yG+.9);
 ARCH.box('ashlar',x,yG-1,z,w+.6,plinth+1,d+.6,{col:LSP.granite,batter:.15,top:false});
 ARCH.box('wall',x,y0,z,w,H,d,{col:body,batter:bt,top:false});
 const tw=w-2*bt,td=d-2*bt,yT=y0+H;
 // the band: twig (maroon) on the sacred and the rich, a red-ochre stripe on the plain
 if(o.band!==false){const bh=o.bandH||(o.rich?1.4:.9),bc=o.rich?LSP.maroon:LSP.red2;
  ARCH.box(o.rich?'twig':'wall',x,yT,z,tw+.3,bh,td+.3,{col:bc,top:false});
  if(o.roundels){const n=Math.floor(tw/3.2);for(let i=0;i<n;i++){const u=-tw/2+(i+.5)*tw/n;
    for(const s of [-1,1]){ARCH.cyl('gilt',x+u,yT+bh*.5,z+s*(td/2+.2),.36,.36,.08,{seg:10,col:LSP.gold});}}
   const m=Math.floor(td/3.2);for(let i=0;i<m;i++){const u=-td/2+(i+.5)*td/m;for(const s of [-1,1])ARCH.cyl('gilt',x+s*(tw/2+.2),yT+bh*.5,z+u,.36,.36,.08,{seg:10,col:LSP.gold});}}
  if(o.blueCourse){ARCH.box('wall',x,yT-.5,z,tw+.36,.32,td+.36,{col:LSP.blue,top:false});ARCH.box('wall',x,yT-.18,z,tw+.36,.16,td+.36,{col:LSP.blueWhite,top:false});}
  ARCH.box('wall',x,yT+bh,z,tw+.4,.7,td+.4,{col:body,topCol:LSP.roof});
  ARCH.box('dark',x,yT+bh+.7,z,tw+.5,.14,td+.5,{col:LSP.dark,top:false});
  ARCH.box('paving',x,yT+.2,z,tw-.6,bh+.3,td-.6,{col:LSP.roof,sides:''});}
 else{ARCH.box('wall',x,yT,z,tw+.2,.8,td+.2,{col:body,topCol:LSP.roof});}
 if(o.windows!==false){const wo=Object.assign({batter:bt,valance:o.rich,lit:o.lit,round:o.round,roundFrom:o.roundFrom,from:o.winFrom||0},o.win||{}),hw=w/2,hd=d/2;
  const sides=o.winSides||'nesw';
  if(sides.indexOf('n')>=0)lsWindows(x+hw,z-hd,x-hw,z-hd,0,-1,y0,floors,storey,wo);
  if(sides.indexOf('s')>=0)lsWindows(x-hw,z+hd,x+hw,z+hd,0,1,y0,floors,storey,wo);
  if(sides.indexOf('e')>=0)lsWindows(x+hw,z+hd,x+hw,z-hd,1,0,y0,floors,storey,wo);
  if(sides.indexOf('w')>=0)lsWindows(x-hw,z-hd,x-hw,z+hd,-1,0,y0,floors,storey,wo);}
 return yT+(o.band===false?.8:(o.bandH||(o.rich?1.4:.9))+.84);}
// a door: lacquered leaves in a black frame under a little roof of corbels, on the face whose normal is (nx,nz)
function lsDoor(x,y,z,nx,nz,w,h,o){o=o||{};const tx=-nz,tz=nx,P=(u,v,d)=>[x+tx*u+nx*d,v,z+tz*u+nz*d];
 ARCH.quad('dark',P(-w*.75,y,.03),P(w*.75,y,.03),P(w*.6,y+h+.5,.03),P(-w*.6,y+h+.5,.03),LSP.black);
 ARCH.quad('wood',P(-w/2,y,.08),P(w/2,y,.08),P(w/2,y+h,.08),P(-w/2,y+h,.08),o.col||LSP.wood);
 for(let i=0;i<3;i++)ARCH.quad('gilt',P(-w/2,y+h*(.25+i*.25),.1),P(w/2,y+h*(.25+i*.25),.1),P(w/2,y+h*(.25+i*.25)+.1,.1),P(-w/2,y+h*(.25+i*.25)+.1,.1),LSP.gold);
 ARCH.box('wood',x+nx*.5,y+h+.55,z+nz*.5,Math.abs(tx)*w*1.5+Math.abs(nx)*1,.28,Math.abs(tz)*w*1.5+Math.abs(nz)*1,{col:LSP.woodDark});
 if(o.curtain)ARCH.quad('cloth',P(-w*.55,y+h+.4,.6),P(w*.55,y+h+.4,.6),P(w*.55,y+h*.55,.7),P(-w*.55,y+h*.55,.7),o.curtain);}
// a gilded hip roof (the gyaphib): lacquered posts and brackets on a red frieze, the gilt roof with turned-up corners,
// the ridge's finial and a dragon's horn at each corner
function lsGiltRoof(x,y,z,w,d,h){const C=ARCH.col(LSP.gold);
 ARCH.box('wall',x,y,z,w*.86,1.6,d*.86,{col:LSP.red,top:false});
 for(let i=0;i<8;i++){const u=-w*.43+i*w*.86/7;for(const s of [-1,1])ARCH.box('wood',x+u,y+1.6,z+s*d*.43,.4,.5,.6,{col:LSP.woodDark});}
 const e=1.2,y1=y+2.1,hw=w/2+e,hd=d/2+e,rw=Math.max(.5,w*.12),yR=y1+h;
 const c0=[x-hw,y1+.5,z-hd],c1=[x+hw,y1+.5,z-hd],c2=[x+hw,y1+.5,z+hd],c3=[x-hw,y1+.5,z+hd],m0=[x-hw*.92,y1,z-hd*.92],m1=[x+hw*.92,y1,z-hd*.92],m2=[x+hw*.92,y1,z+hd*.92],m3=[x-hw*.92,y1,z+hd*.92];
 const r0=[x-rw,yR,z],r1=[x+rw,yR,z];
 ARCH.quad('gilt',m1,m0,r0,r1,C);ARCH.quad('gilt',m3,m2,r1,r0,C);ARCH.tri('gilt',m0,m3,r0,C);ARCH.tri('gilt',m2,m1,r1,C);
 // the eaves' turned-up rim
 for(const [a,b,c,dd] of [[c0,c1,m1,m0],[c1,c2,m2,m1],[c2,c3,m3,m2],[c3,c0,m0,m3]])ARCH.quad('gilt',a,b,c,dd,C);
 for(const p of [c0,c1,c2,c3]){ARCH.cyl('gilt',p[0],p[1],p[2],.22,.05,1.3,{seg:6,col:LSP.gold});}
 // the finial (the ganjira) and its bell
 ARCH.cyl('gilt',x,yR,z,.8,.35,1.2,{seg:10,col:LSP.gold});ARCH.dome('gilt',x,yR+1.2,z,.55,{seg:10,rows:4,col:LSP.gold,k:1.6});ARCH.cyl('gilt',x,yR+2,z,.12,.02,1.4,{seg:6,col:LSP.gold});}
// a chorten: the stepped base, the dome, the harmika, thirteen rings, the parasol and the sun and moon
function lsChorten(x,y,z,s,o){o=o||{};let yy=y;
 for(let i=0;i<4;i++){const w=(7-i*1.1)*s;ARCH.box('wall',x,yy,z,w,.9*s,w,{col:LSP.white});yy+=.9*s;}
 ARCH.cyl('wall',x,yy,z,2.2*s,2.6*s,.6*s,{seg:18,col:LSP.white});yy+=.6*s;
 ARCH.dome('wall',x,yy,z,2.4*s,{seg:20,rows:6,col:LSP.white,k:1.05});yy+=2.4*s;
 ARCH.box('wall',x,yy,z,1.6*s,1*s,1.6*s,{col:LSP.white});ARCH.box('twig',x,yy+.15*s,z,1.7*s,.5*s,1.7*s,{col:LSP.maroon,top:false});yy+=1*s;
 ARCH.cyl('gilt',x,yy,z,.7*s,.3*s,3.4*s,{seg:12,col:LSP.gold});for(let i=0;i<13;i++)ARCH.ring('gilt',x,yy+i*.25*s,z,.7*s-i*.03*s,.08*s,.1*s,{seg:12,col:LSP.gold});yy+=3.4*s;
 ARCH.cyl('gilt',x,yy,z,.9*s,.2*s,.35*s,{seg:12,col:LSP.gold});ARCH.dome('gilt',x,yy+.4*s,z,.3*s,{seg:8,rows:3,col:LSP.gold});
 ARCH.cyl('gilt',x,yy+.7*s,z,.06*s,.02*s,.8*s,{seg:5,col:LSP.gold});}
// an electric lamp of the Order: a lacquered post, a blue-glazed shade, the bulb (lit)
function lsLamp(x,y,z){ARCH.cyl('wood',x,y,z,.12,.09,3.4,{seg:6,col:LSP.woodDark});ARCH.cyl('slate',x,y+3.4,z,.12,.5,.35,{seg:10,col:LSP.blue,bottom:true});
 ARCH.cyl('glow',x,y+3.05,z,.16,.16,.34,{seg:8,col:0xfff0c8});}
