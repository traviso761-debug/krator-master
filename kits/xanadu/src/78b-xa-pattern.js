// ================================================================= XANADU — the black-and-white pattern system: materials, kit items, helpers
// [web] three.js materials and geometry for 78a's data (XPAT). The patterns are WORLD-ALIGNED: a fragment's stone is picked
// from where it is in the world, so a course runs unbroken round a wall, its piers, a drum and a column, and nothing slides
// when a box is resized (STYLE.md rule 2). The arches, voussoirs, orders, gores, rings and treads are real geometry: one kit
// item each, the stone (white, black, gold) an instance's colour, so every repeat is an instance of one draw call.
// Veining: one library marble (materials.json family xMarble: rock.marble012) read through the same world frame; the white
// stone is it lifted, the black stone it inverted (pale veins on near-black). ?mat=proc: no veins. A polished nero and a
// statuario are owed (core/materials/PROMPTS-NEEDED.md).
//   xpBalance(b)                                   the share of black from here on (XPAT.balance): the citadel's Dome .667, the Bay's .34
//   xpBox(pat,x,y,z,w,h,d,ry)                      a block in a pattern (XPAT.pat's name, or 'wash': the kit's whitewash)
//   xpCol(pat,x,y,z,r,h)                           a round column (banded by the wall's own courses)
//   xpStone(k,x,y,z,w,h,d,ry) / xpInk(k)           a block of one stone: 'W', 'B', 'G' (gold)
//   xpVoussoirs(x,y,z,ry,span,kind,dep,o)          a ring of alternating voussoirs round an arch springing at y (o: vd the
//                                                  ring's depth, len a voussoir's length, phase, inks, jamb: blocks down to o.floor)
//   xpSpandrel(pat,x,y,z,ry,span,kind,dep,ytop)    the wall over an arch: from the springing to ytop, the arch cut in it
//   xpOrders(x,y,z,ry,span,spring,n,step,odep,o)   receding checkered orders (ref 01): n rings stepping in by `step` and back by
//                                                  `odep`, the checks carried down the jambs; returns the innermost span
//   xpTunnel(x,y,z,ry,span,spring,len,cell)        a checkered barrel: rings `cell` deep, each a half check on from the last
//   xpGoreDome(x,y,z,r,o)                          the inside of a dome: gores alternating to the oculus, gold ribs, the glass
//   xpRings(x,y,z,r,n,dy)                          a floor of concentric rings (each a hair above the last: a low dais)
//   xpRunner(x,y,z,w,len,ry)                       a Greek-key runner
//   xpSqHole(pat,x,y,z,w,h,d)                      a slab with a round hole (a ceiling under a dome, the square under a drum)
//   xpBalustrade(a,b,ya,yb,o)                      white balusters under a gold rail from a to b (local [x,z]); rises with ya, yb
//   xpChandelier(x,y,z,r,drop)                     a crystal chandelier hung from y
//   xpShellDome(x,y,z,r,hk,kind,c,fin)             the outside of a dome over a gored one (the kit's dome, open underneath)
//   xpOrb(x,y,z,r,h)                               a black sphere on a white fluted pedestal (ref 08)
//   xpBlackCol(x,y,z,r,h)                          a black marble column under a gold capital, on a gold base (ref 12)
//   xpPlanter(x,y,z,r,h,tree)                      a black planter, a tree in it (the Vale's whorl olive through xaPlant)
//   xpTable(x,y,z,w,d,h)                           a white marble table on a black block
const XP_T={};   // the vein map, bound to the library set at the first helper call (xpLib)
XP_T.vein=(function(){const d=new Uint8Array([150,150,150,255]);const t=new THREE.DataTexture(d,1,1,THREE.RGBAFormat);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true;return t;})();
const XP_MATS={};
function xpLin(hex){const c=new THREE.Color(hex).convertSRGBToLinear();return'vec3('+c.r.toFixed(4)+','+c.g.toFixed(4)+','+c.b.toFixed(4)+')';}
// ---------------------------------------------------------------- the shader: one hook, the pattern's name and numbers in its source
const XP_GLSL={
 vpars:'varying vec3 vXpW;varying vec3 vXpN;varying vec4 vXpR;\n',
 vmain:'vec4 xpw=vec4(transformed,1.0);vec3 xpn=objectNormal;\n#ifdef USE_INSTANCING\nxpw=instanceMatrix*xpw;xpn=mat3(instanceMatrix)*xpn;\nvXpR=vec4(uv.x*length(instanceMatrix[0].xyz),uv.y*length(instanceMatrix[2].xyz),length(instanceMatrix[0].xyz),length(instanceMatrix[2].xyz));\n#else\nvXpR=vec4(uv,1.0,1.0);\n#endif\nvXpW=(modelMatrix*xpw).xyz;vXpN=normalize(mat3(modelMatrix)*xpn);\n',
 fpars:'varying vec3 vXpW;varying vec3 vXpN;varying vec4 vXpR;\n'+
  'vec2 xpH(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}\n'+
  'float xpBit(float v,float c){return mod(floor(v/pow(2.0,c)+.001),2.0);}\n',
 // q: the face's own two axes in metres (x along it, y up it; a level face: world x, z). Sets w (1 white, 0 black) and g (gold)
 kind:{
  band:P=>'float s=(an.y>.5)?q.x:q.y;w=step(bal*2.0,mod(s/'+P.course.toFixed(3)+',2.0));\n'+
   'if(an.y<=.5){float row=floor(q.y/'+P.course.toFixed(3)+');float jx=fract(q.x/'+P.block.toFixed(3)+'+row*.37);sh=1.0-.10*step(jx,.012);}\n',
  checker:P=>'w=mod(floor(q.x/'+P.cell.toFixed(3)+')+floor(q.y/'+P.cell.toFixed(3)+'),2.0);\n',
  chevron:P=>'float zg=abs(fract(q.x/'+P.pitch.toFixed(3)+')-.5)*2.0;w=step(bal*2.0,mod((q.y+zg*'+P.rise.toFixed(3)+')/'+P.course.toFixed(3)+',2.0));\n',
  pave:P=>'vec2 px=q/'+P.cell.toFixed(3)+';vec2 n=floor(px),f=fract(px);vec2 mg=vec2(0.),mr=vec2(0.);float md=8.0;\n'+
   'for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 gg=vec2(float(i),float(j));vec2 r=gg+xpH(n+gg)-f;float d=dot(r,r);if(d<md){md=d;mr=r;mg=gg;}}\n'+
   'md=8.0;for(int j=-2;j<=2;j++)for(int i=-2;i<=2;i++){vec2 gg=mg+vec2(float(i),float(j));vec2 r=gg+xpH(n+gg)-f;if(dot(mr-r,mr-r)>.00001)md=min(md,dot(.5*(mr+r),normalize(r-mr)));}\n'+
   'w=step('+P.black.toFixed(3)+'+(bal-.5)*.6,xpH(n+mg+7.3).x);g=1.0-smoothstep('+(P.joint*.5/P.cell).toFixed(4)+','+(P.joint*.5/P.cell+.006).toFixed(4)+',md);vo=xpH(n+mg)*9.0;\n',
  op:P=>'vec2 cu=q/'+P.cell.toFixed(3)+';vec2 id=floor(cu),u=fract(cu);float m=floor(xpH(id).x*6.0);float v;\n'+
   'if(m<1.0)v=u.x;else if(m<2.0)v=u.y;else{vec2 c=(m<3.0)?vec2(.5,0.):(m<4.0)?vec2(.5,1.):(m<5.0)?vec2(0.,.5):vec2(1.,.5);float d=length(u-c);\n'+
   ' float e=(m<3.0)?u.y:(m<4.0)?1.0-u.y:(m<5.0)?u.x:1.0-u.x;v=(d<.5)?d:e;}\n'+
   'w=step(fract(v*'+P.lines.toFixed(1)+'+.25),'+P.ink.toFixed(3)+');if(bal<.45)w=1.0-w;\n',
  key:P=>{const B=XPAT.fret.map(r=>{let v=0;for(let i=0;i<r.length;i++)if(r[i]==='1')v+=Math.pow(2,i);return v.toFixed(1);}),c=(P.fret/XPAT.fret.length).toFixed(4),e0=P.edge,e1=e0+P.line,e2=e1+P.fret,e3=e2+P.line;
   return'vec2 rp=vXpR.xy,rs=vXpR.zw;float dx=min(rp.x,rs.x-rp.x),dz=min(rp.y,rs.y-rp.y);float d=min(dx,dz);float al=(dx<dz)?rp.y:rp.x;w=0.0;\n'+
   'if(d<'+e0.toFixed(3)+'){}else if(d<'+e1.toFixed(3)+')g=1.0;else if(d<'+e2.toFixed(3)+'){float row=floor((d-'+e1.toFixed(3)+')/'+c+');float col=mod(floor(al/'+c+'),'+XPAT.fret[0].length.toFixed(1)+');\n'+
   ' float bits=(row<1.0)?'+B[0]+':(row<2.0)?'+B[1]+':(row<3.0)?'+B[2]+':(row<4.0)?'+B[3]+':'+B[4]+';g=xpBit(bits,col);}\n'+
   'else if(d<'+e3.toFixed(3)+')g=1.0;else{float L=rs.y-2.0*'+e3.toFixed(3)+';float np=max(1.0,floor(L/'+(P.panel+P.bar).toFixed(3)+'+.5));float per=L/np;float t=mod(rp.y-'+e3.toFixed(3)+',per);float bar='+P.bar.toFixed(3)+'*.5;\n'+
   ' float tb=min(t,per-t);if(tb<bar){w=1.0;g=step(bar-'+P.line.toFixed(3)+',tb);}else{float fx=dx-'+e3.toFixed(3)+'-.16,fz=tb-bar-.16;float fr=min(fx,fz);g=step(0.0,fr)*step(fr,'+P.line.toFixed(3)+');}}\n';},
  diamond:P=>'vec2 dc=abs(fract(q/'+P.cell.toFixed(3)+')-.5)*'+P.cell.toFixed(3)+';w=step('+P.d.toFixed(3)+',dc.x+dc.y);if(bal>.55)w=1.0-w;\n',
  solid:P=>'#ifdef USE_COLOR\nw=step(.5,vColor.r);g=1.0-step(.5,vColor.b);\n#endif\n',
 },
};
function xpHook(sh,name){const P=XPAT.pat[name],S=XPAT.stone;
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+XP_GLSL.vpars).replace('#include <begin_vertex>','#include <begin_vertex>\n'+XP_GLSL.vmain);
 const body='{vec3 an=abs(normalize(vXpN));vec2 q=(an.y>.5)?vXpW.xz:((an.x>an.z)?vec2(vXpW.z,vXpW.y):vec2(vXpW.x,vXpW.y));float w=1.0,g=0.0,sh=1.0;vec2 vo=vec2(0.);float bal=.5;\n#ifdef USE_COLOR\nbal=vColor.g;\n#endif\n'+
  XP_GLSL.kind[P.kind](P)+
  (XP_T.black?'vec3 tb=mapTexelToLinear(texture2D(xpMapB,(q+vo)*.31)).rgb;vec3 tw=mapTexelToLinear(texture2D(map,(q+vo)*.31)).rgb;diffuseColor.rgb*=mix(mix(tb,tw,w),'+xpLin(S.gold)+',g)*sh;}\n':
  'float vl=dot(mapTexelToLinear(texture2D(map,(q+vo)*.31+vec2(w*.37,g*.11))).rgb,vec3(.3333));float vn=smoothstep(.05,.17,.27-vl)*'+S.vein.toFixed(2)+';\n'+
  'vec3 cw='+xpLin(S.white)+'*(1.0-.24*vn);vec3 cb=mix('+xpLin(S.black)+',vec3(.34),vn*.3);vec3 cg='+xpLin(S.gold)+';\n'+
  'diffuseColor.rgb*=mix(mix(cb,cw,w),cg,g)*sh;}\n');
 if(XP_T.black)sh.uniforms.xpMapB={value:XP_T.black};
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+XP_GLSL.fpars+(XP_T.black?'uniform sampler2D xpMapB;\n':'')).replace('#include <map_fragment>',body).replace('#include <color_fragment>','')
  .replace('#include <roughnessmap_fragment>','float roughnessFactor=roughness;').replace('#include <metalnessmap_fragment>','float metalnessFactor=metalness;');}
function xpMat(name){if(XP_MATS[name])return XP_MATS[name];
 const m=new THREE.MeshStandardMaterial({color:0xffffff,roughness:name==='solid'?.34:.46,metalness:0,side:DS,map:XP_T.vein});
 m.onBeforeCompile=new Function('sh','xpHook(sh,'+JSON.stringify(name)+');/* '+JSON.stringify(XPAT.pat[name])+' */');
 const key='xpat|'+name+'|'+JSON.stringify(XPAT.pat[name]);m.customProgramCacheKey=()=>key;m.userData.xpat=name;return XP_MATS[name]=m;}
// the library's marble, once (KMAT's pack, when the page has one and ?mat is not proc): every pattern reads the one map
function xpLib(){if(XP_T.bound!==undefined)return;XP_T.bound=null;
 try{if(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed){const L=KMAT.packed('xanadu','xMarbleW')||KMAT.packed('xanadu','xMarble'),LB=KMAT.packed('xanadu','xMarbleB');
  if(L&&LB&&KMAT.packed('xanadu','xMarbleW')){const TB=KMAT.textures(LB,{aniso:8});if(TB.map){TB.map.wrapS=TB.map.wrapT=THREE.RepeatWrapping;XP_T.black=TB.map;}}   // the two marbles of PROMPTS-NEEDED section 41, once delivered
  if(L){const T=KMAT.textures(L,{aniso:8});
   if(T.map){T.map.wrapS=T.map.wrapT=THREE.RepeatWrapping;XP_T.bound=L.lib;for(const k in XP_MATS){XP_MATS[k].map=T.map;XP_MATS[k].needsUpdate=true;}XP_T.vein=T.map;}}}}catch(e){reportErr('xpLib: '+((e&&e.message)||e));}}
// ---------------------------------------------------------------- geometry
// the wall over an arch: x -.5...5, y 0..hs (the springing to a little over the crown), z -.5...5; the arch cut out of its foot
function xpSpanGeo(kind){const P=xpArchCurve(kind,12),hs=xpArchRise(kind)+.06,S=new THREE.Shape();
 S.moveTo(-.5,0);S.lineTo(-.5,hs);S.lineTo(.5,hs);S.lineTo(.5,0);for(let i=P.length-1;i>=0;i--)S.lineTo(P[i][0],P[i][1]);S.lineTo(-.5,0);
 const g=new THREE.ExtrudeGeometry(S,{depth:1,bevelEnabled:false,curveSegments:1});g.translate(0,0,-.5);g.userData={hs};return g;}
const XP_SPAN={round:xpSpanGeo('round'),pointed:xpSpanGeo('pointed'),horseshoe:xpSpanGeo('horseshoe')};
// a slab 1 x 1 x 1 (centred in x and z, y 0..1) with a round hole of radius .5 less a hair
const XP_SQHOLE=(function(){const S=new THREE.Shape();S.moveTo(-.5,-.5);S.lineTo(.5,-.5);S.lineTo(.5,.5);S.lineTo(-.5,.5);S.lineTo(-.5,-.5);
 const H=new THREE.Path();H.absarc(0,0,.49,0,Math.PI*2,true);S.holes.push(H);const g=new THREE.ExtrudeGeometry(S,{depth:1,bevelEnabled:false,curveSegments:24});g.rotateX(-Math.PI/2);return g;})();
const XP_NGORE=32;
const XP_GORE=new THREE.SphereGeometry(1,1,8,0,Math.PI*2/XP_NGORE,.13,Math.PI/2-.13);
const XP_RIBO=new THREE.SphereGeometry(1.008,1,8,-.016,.032,.13,Math.PI/2-.13);   // a rib on the outside of a gored dome
const XP_RIB=new THREE.SphereGeometry(.992,1,8,-.012,.024,.13,Math.PI/2-.13);
// a dome's shell: the kit's Persian dome (71: XDOME) without its floor, so the gores inside it are seen from below
const XP_SHELL=new THREE.LatheGeometry([[1,0],[1.06,.1],[1.12,.26],[1.08,.44],[.92,.62],[.66,.78],[.38,.9],[.14,.97],[.04,1],[0,1]].map(p=>new THREE.Vector2(p[0],p[1])),24);
const XP_DISC=new THREE.CylinderGeometry(1,1,1,48);
const XP_RUN=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
// ---------------------------------------------------------------- kit items
for(const n of['band','bandFine','checker','pave','op','chevron','diamond']){kdef('xp_'+n,VBOX,xpMat(n));for(const k in XP_SPAN)kdef('xpS_'+k+'_'+n,XP_SPAN[k],xpMat(n));}
for(const k in XP_SPAN)kdef('xpS_'+k+'_wash',XP_SPAN[k],MAT.xWash);
kdef('xp_solid',VBOX,xpMat('solid'));kdef('xpCol_solid',XCOL,xpMat('solid'));kdef('xpCol_band',XCOL,xpMat('band'));kdef('xpCol_bandFine',XCOL,xpMat('bandFine'));
kdef('xpOct_solid',XOCT,xpMat('solid'));kdef('xpDisc',XP_DISC,xpMat('solid'));kdef('xpGore',XP_GORE,xpMat('solid'));kdef('xpAnnG',new THREE.RingGeometry(.57,1,48).rotateX(-Math.PI/2),MAT.xGoldDS);   // a flat gilt ring (the Bay pavilion's architrave, open over its rotunda)
kdef('xpGoreT',XP_GORE,MAT.xTiles);kdef('xpGoreGlass',XP_GORE,KGLASS.material(THREE,'clear'));kdef('xpRib',XP_RIB,MAT.xGoldDS);kdef('xpRibO',XP_RIBO,MAT.xGoldDS);kdef('xpBall',VBALL,xpMat('solid'));
kdef('xpHole_chevron',XP_SQHOLE,xpMat('chevron'));kdef('xpHole_band',XP_SQHOLE,xpMat('band'));kdef('xpHole_wash',XP_SQHOLE,MAT.xWash);
kdef('xpKey',XP_RUN,xpMat('key'));
kdef('xpBal',new THREE.CylinderGeometry(1,1,1,6).translate(0,.5,0),xpMat('solid'));   // a baluster: six sides are enough at 11 cm
kdef('xpShellT',XP_SHELL,MAT.xTiles);kdef('xpShellG',XP_SHELL,MAT.xGold);kdef('xpShellM',XP_SHELL,MAT.xMosB);kdef('xpShellW',XP_SHELL,MAT.xWash);
kdef('xpGlassDisc',XDISC,KGLASS.material(THREE,'clear'));kdef('xpCrystal',new THREE.OctahedronGeometry(1,0),KGLASS.material(THREE,'lit'));
// ---------------------------------------------------------------- helpers (local frame; y = the BASE of a piece, as the kit's)
const XP_INK={};let XP_BAL=.5;const XP_BALC={};
// the balance every block drawn from here carries (XPAT.balance): the share of black
function xpBalance(b){XP_BAL=b==null?.5:b;}
function xpBalC(){const k=XP_BAL.toFixed(3);return XP_BALC[k]||(XP_BALC[k]=new THREE.Color(1,XP_BAL,1));}
// the stones an alternating run takes, by the balance: two black to one white, even, or two white to one black
function xpSeq(){return XP_BAL>.6?['B','B','W']:XP_BAL<.4?['W','W','B']:['W','B'];}
function xpInk(k){return XP_INK[k]||(XP_INK[k]=new THREE.Color(XPAT.ink[k][0],XPAT.ink[k][1],XPAT.ink[k][2]));}
function xpGold(){return XP_INK.gold||(XP_INK.gold=xC(XPAT.stone.gold));}
function xpBox(pat,x,y,z,w,h,d,ry){xpLib();if(w<=0||h<=0||d<=0)return;vB(pat==='wash'?'xWashB':'xp_'+pat,x,y,z,w,h,d,ry||0,pat==='wash'?XP_INK.wash||(XP_INK.wash=xC(XPAL.wash[2])):xpBalC());}
function xpStone(k,x,y,z,w,h,d,ry){xpLib();vB('xp_solid',x,y,z,w,h,d,ry||0,xpInk(k));}
function xpCol(pat,x,y,z,r,h){xpLib();kput('xpCol_'+pat,[x,y,z],null,[r,h,r],pat==='solid'?xpInk('W'):xpBalC());}
// points along an arch of this span, n pieces of equal length: [[x,y],...] n+1 of them
function xpArchPts(kind,span,n){const D=xpArchCurve(kind,64).map(p=>[p[0]*span,p[1]*span]),L=[0];for(let i=1;i<D.length;i++)L.push(L[i-1]+Math.hypot(D[i][0]-D[i-1][0],D[i][1]-D[i-1][1]));
 const T=L[L.length-1],P=[];let j=0;for(let i=0;i<=n;i++){const s=T*i/n;while(j<D.length-2&&L[j+1]<s)j++;const t=(s-L[j])/((L[j+1]-L[j])||1);P.push([D[j][0]+(D[j+1][0]-D[j][0])*t,D[j][1]+(D[j+1][1]-D[j][1])*t]);}
 P.len=T;return P;}
function xpVoussoirs(x,y,z,ry,span,kind,dep,o){xpLib();o=o||{};const vd=o.vd==null?.42:o.vd,want=o.len==null?.5:o.len,rise=xpArchRise(kind)*span;
 let n=o.n||Math.max(5,Math.round(xpArchPts(kind,span+vd,8).len/want));if(!o.n&&o.odd!==false&&n%2===0)n++;
 const P=xpArchPts(kind,span,n),inks=o.inks||xpSeq(),ph=o.phase||0,qy=qEuler(0,ry||0,0);
 for(let i=0;i<n;i++){const a=P[i],b=P[i+1],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,tx=b[0]-a[0],ty=b[1]-a[1],l=Math.hypot(tx,ty)||1;let nx=-ty/l,ny=tx/l;
  if(nx*mx+ny*(my-rise*.35)<0){nx=-nx;ny=-ny;}
  const cx=mx+nx*vd/2,cy=my+ny*vd/2,p=loc(x,z,cx,0,ry||0),ang=Math.atan2(ty,tx);
  kput('xp_solid',[p[0],y+cy,p[1]],qy.clone().multiply(qAxis(0,0,1,ang)),[l*(1+vd/Math.max(.6,span))+.03,vd,dep],xpInk(inks[(i+ph)%inks.length]));}
 // the jambs: the same checks carried down to the floor
 if(o.jamb){const h=y-o.floor,m=Math.max(1,Math.round(h/(o.len||vd))),bh=h/m,hx=Math.abs(P[0][0])+vd/2;
  for(const s of[-1,1])for(let j=0;j<m;j++){const p=loc(x,z,s*hx,0,ry||0);vB('xp_solid',p[0],o.floor+j*bh,p[1],vd,bh+.002,dep,ry||0,xpInk(inks[(j+ph+1+(s>0?n-1:0))%inks.length]));}}
 return n;}
function xpSpandrel(pat,x,y,z,ry,span,kind,dep,ytop){xpLib();const hs=XP_SPAN[kind].userData.hs*span,h=Math.min(hs,ytop-y);if(h<=.02)return;
 kput('xpS_'+kind+'_'+pat,[x,y,z],qEuler(0,ry||0,0),[span,span*(h/hs),dep],pat==='wash'?(XP_INK.wash||(XP_INK.wash=xC(XPAL.wash[2]))):xpBalC());
 if(ytop-y-h>.01)xpBox(pat,x,y+h,z,span,ytop-y-h,dep,ry);}
function xpOrders(x,y,z,ry,span,spring,n,step,odep,o){o=o||{};let sp=span;
 for(let k=0;k<n;k++){const p=loc(x,z,0,-(k+.5)*odep,ry||0);
  xpVoussoirs(p[0],y+spring,p[1],ry,sp,'round',odep+.004,{vd:step,len:step,phase:k,odd:false,jamb:true,floor:y,n:o.n&&o.n[k],inks:['W','B']});sp-=2*step;}
 return sp+2*step;}
function xpTunnel(x,y,z,ry,span,spring,len,cell){const m=Math.max(1,Math.round(len/cell)),c=len/m;
 for(let k=0;k<m;k++){const p=loc(x,z,0,-(k+.5)*c,ry||0);xpVoussoirs(p[0],y+spring,p[1],ry,span,'round',c+.004,{vd:.4,len:c,phase:k,odd:false,jamb:true,floor:y,inks:['W','B']});}}
function xpGoreDome(x,y,z,r,o){xpLib();o=o||{};const hk=o.hk==null?1:o.hk;
 for(let k=0;k<XP_NGORE;k++){const q=qEuler(0,k/XP_NGORE*TAU,0);kput('xpGore',[x,y,z],q,[r,r*hk,r],xpInk(o.inks?o.inks[k%o.inks.length]:k%2?'B':'W'));if(o.ribs!==false&&k%2===0)kput('xpRib',[x,y,z],q,[r,r*hk,r],xpGold());}
 const ro=r*Math.sin(.13),yo=y+r*hk*Math.cos(.13);kput('xpGlassDisc',[x,yo,z],null,[ro,.04,ro]);
 for(let k=0;k<12;k++){const a=k/12*TAU;vB('xGoldB',x+Math.sin(a)*ro,yo-.09,z+Math.cos(a)*ro,ro*.56,.16,.1,a,xpGold());}}
// the outside of a dome over a gored one: the kit's dome kinds (T tile, G gilt, M mosaic, W whitewash), open underneath; a gilt finial
function xpShellDome(x,y,z,r,hk,kind,c,fin){
 if(kind==='B'){xpLib();for(let k=0;k<XP_NGORE;k++){const q=qEuler(0,k/XP_NGORE*TAU,0);kput('xpGore',[x,y,z],q,[r,r*hk,r],xpInk('B'));if(k%2===0)kput('xpRibO',[x,y,z],q,[r,r*hk,r],xpGold());}
  kput('xpBall',[x,y+r*hk*.985,z],null,[r*.15,r*.05,r*.15],xpInk('G'));}
 else kput('xpShell'+kind,[x,y,z],null,[r,r*hk,r],c||(kind==='T'?xC(XPAL.turquoise):kind==='G'?xC(XPAL.gold[0]):kind==='W'?xC(XPAL.wash[2]):null));
 if(fin){const yy=y+r*hk;vPst('xColG',x,yy-.1,z,.06,fin*.6,xC(XPAL.gold[0]));vBall('xGold',x,yy+fin*.5,z,Math.max(.12,r*.09),xC(XPAL.gold[0]));kput('xConeG',[x,yy+fin*.55,z],null,[.08,fin*.5,.08],xC(XPAL.gold[0]));}}
function xpRings(x,y,z,r,n,dy){xpLib();dy=dy==null?.012:dy;for(let k=0;k<n;k++){const rk=r*(1-k/n);const S=xpSeq();kput('xpDisc',[x,y+k*dy-.04,z],null,[rk,.08,rk],xpInk(S[k%S.length]));}
 kput('xpDisc',[x,y+n*dy-.04,z],null,[r/n*.45,.08,r/n*.45],xpInk('G'));}
function xpRunner(x,y,z,w,len,ry){xpLib();kput('xpKey',[x,y,z],qEuler(0,ry||0,0),[w,1,len]);}
function xpSqHole(pat,x,y,z,w,h,d){xpLib();kput('xpHole_'+pat,[x,y,z],null,[w,h,d],pat==='wash'?(XP_INK.wash||(XP_INK.wash=xC(XPAL.wash[2]))):xpBalC());}
function xpBalustrade(a,b,ya,yb,o){xpLib();o=o||{};const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),n=Math.max(1,Math.round(L/(o.pitch==null?.45:o.pitch))),h=o.h==null?.95:o.h,ry=Math.atan2(dx,dz);
 for(let i=0;i<=n;i++){const t=i/n;kput('xpBal',[a[0]+dx*t,ya+(yb-ya)*t,a[1]+dz*t],null,[.055,h,.055],xpInk('W'));}
 const pit=Math.atan2(yb-ya,L);kput('xGoldB',[(a[0]+b[0])/2,(ya+yb)/2+h+.04,(a[1]+b[1])/2],qEuler(0,ry,0).multiply(qEuler(-pit,0,0)),[.12,.08,Math.hypot(L,yb-ya)+.1],xpGold());}
function xpChandelier(x,y,z,r,drop){xpLib();const g=xpGold();vB('xGoldB',x,y-drop,z,.05,drop,.05,0,g);
 for(let t=0;t<3;t++){const rr2=r*(1-t*.3),yy=y-drop-.25-t*.5,n=Math.round(22-t*6);kput('xDiscG',[x,yy+.34,z],null,[rr2*.3,.03,rr2*.3],g);for(let k=0;k<n;k+=2){const a=k/n*TAU;vB('xGoldB',x+Math.sin(a)*rr2*.65,yy+.3,z+Math.cos(a)*rr2*.65,.03,.03,rr2*.7,a,g);}
  for(let k=0;k<n;k++){const a=k/n*TAU;kput('xpCrystal',[x+Math.sin(a)*rr2,yy,z+Math.cos(a)*rr2],null,[.07,.2,.07]);}}
 kput('xpCrystal',[x,y-drop-1.9,z],null,[.16,.34,.16]);}
function xpPlanter(x,y,z,r,h,tree,ink){xpLib();ink=ink||'B';kput('xpCol_solid',[x,y,z],null,[r,h,r],xpInk(ink));kput('xpCol_solid',[x,y+h,z],null,[r*1.08,.08,r*1.08],xpInk(ink));kput('xDiscG',[x,y+h+.09,z],null,[r*1.09,.02,r*1.09],xpGold());
 if(tree&&!(typeof xaPlant==='function'&&xaPlant('olive',x,y+h,z,tree)))xnTree(x,z,tree,null,y+h);}
function xpOrb(x,y,z,r,h){xpLib();kput('xpCol_solid',[x,y,z],null,[r*.8,h,r*.8],xpInk('W'));for(let k=0;k<8;k++){const a=k/8*TAU;vB('xp_solid',x+Math.sin(a)*r*.8,y+.06,z+Math.cos(a)*r*.8,r*.2,h-.12,r*.1,a,xpInk('W'));}
 kput('xpCol_solid',[x,y+h,z],null,[r*.95,.06,r*.95],xpInk('B'));kput('xpBall',[x,y+h+.06+r*.9,z],null,[r,r,r],xpInk('B'));}
function xpBlackCol(x,y,z,r,h){xpLib();kput('xDiscG',[x,y+.12,z],null,[r*1.35,.24,r*1.35],xpGold());kput('xpCol_solid',[x,y+.24,z],null,[r,h-.74,r],xpInk('B'));
 kput('xDiscG',[x,y+h-.42,z],null,[r*1.12,.16,r*1.12],xpGold());kput('xOctS',[x,y+h-.34,z],null,[r*1.5,.34,r*1.5],xpGold());}
function xpTable(x,y,z,w,d,h,ry){xpStone('B',x,y,z,w*.5,h-.14,d*.5,ry);xpStone('W',x,y+h-.14,z,w,.14,d,ry);}
