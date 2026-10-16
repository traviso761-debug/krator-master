// prefix: dk
// ================================================================= DESERT TENT SHAPES: what the desert nomads add to the tent kit (40-tk-tentkit.js)
// The look outside (the owner's brief): austere, brown or white, with SIMPLE patterns in one contrasting colour: white
// appliqué on the brown hair cloth, dark brown on the white canvas, in bands like the Yemeni tower houses' (rows of
// triangles, lozenges, small pointed arches, chevrons). The bands are drawn as geometry (thin sewn-on strips), so they stay
// crisp at any distance and need no texture. Inside, the muted Moroccan lining (patLining) and the sadu weave (patSadu).
//   dkBand(L, y, h, motif, col, o)   an appliqué band on a wall lying in the local x-y plane, facing +z
//   dkWall(a, b, fn)                 run fn in the frame of the wall from a=[x,z] to b=[x,z] (its face turned outward, +z)
//   dkCaidal(o)                      the Moroccan caidal tent: a square pavilion, a domed roof to a horned finial
//   dkSquare(o)                      the square tent of brown hair cloth: a hipped roof on one or two masts, white bands
//   dkBayt(o)                        the black goat-hair tent (tkBlack) with a sadu valance and the qata, its woven divider (o.sadu: the sheet)
//   dkTuareg(o)                      the Tuareg leather tent (ehan): ochre hides over carved arches, mat walls
//   dkFinial(y, col)                 the brass horns on a mast (the Eastern Nomads' sign: horns)
const DK_MOTIFS=['tri','lozenge','arch','chevron','step'];
/* an appliqué band on a wall in the local x-y plane (outer face +z), from x=-L/2 to L/2, between y and y+h: two edge
   strips and a row of motifs between them. o: {bg (a backing strip colour), z (offset off the cloth), skip(x): leave a gap} */
function dkBand(L,y,h,motif,col,o){o=o||{};const z=o.z===undefined?.012:o.z,e=Math.max(.025,h*.12),pitch=Math.max(.18,h*1.05);
 const strip=(x0,x1,y0,y1,c,dz)=>poly('plain',[[x0,y0,z+(dz||0)],[x1,y0,z+(dz||0)],[x1,y1,z+(dz||0)],[x0,y1,z+(dz||0)]],c,true);
 const runs=[];let x=-L/2;const step=.05;let cur=null;for(;x<=L/2+1e-6;x+=step){const gap=o.skip&&o.skip(x);if(!gap&&cur===null)cur=x;if((gap||x+step>L/2+1e-6)&&cur!==null){runs.push([cur,gap?x-step:L/2]);cur=null;}}
 for(const [x0,x1] of runs){if(x1-x0<.05)continue;
  if(o.bg)strip(x0,x1,y,y+h,o.bg,-.004);
  strip(x0,x1,y,y+e,col);strip(x0,x1,y+h-e,y+h,col);
  const n=Math.max(1,Math.floor((x1-x0)/pitch)),p=(x1-x0)/n,y0=y+e*1.6,y1=y+h-e*1.6,ym=(y0+y1)/2,hh=(y1-y0);
  for(let i=0;i<n;i++){const cx=x0+(i+.5)*p,hw=p*.38;
   if(motif==='tri')poly('plain',[[cx-hw,y0,z],[cx+hw,y0,z],[cx,y1,z]],col,true);
   else if(motif==='lozenge')poly('plain',[[cx,y0,z],[cx+hw,ym,z],[cx,y1,z],[cx-hw,ym,z]],col,true);
   else if(motif==='arch'){const w=hw*.7;for(const s of [-1,1])poly('plain',[[cx+s*w,y0,z],[cx+s*(w-.022),y0,z],[cx+s*(w-.022),y0+hh*.55,z],[cx+s*w,y0+hh*.55,z]],col,true);
    const A=[];for(let k=0;k<=8;k++){const t=k/8,ang=PI*t;A.push([cx-Math.cos(ang)*w,y0+hh*.55+Math.sin(ang)*hh*.45*(1-Math.abs(.5-t)*.4)]);}
    for(let k=0;k<8;k++){const a=A[k],b=A[k+1];poly('plain',[[a[0],a[1],z],[b[0],b[1],z],[b[0],b[1]-.022,z],[a[0],a[1]-.022,z]],col,true);}}
   else if(motif==='chevron'){const t=.03;poly('plain',[[cx-hw,y0,z],[cx-hw+t*1.4,y0,z],[cx,y1-t*1.6,z],[cx,y1,z]],col,true);poly('plain',[[cx,y1,z],[cx,y1-t*1.6,z],[cx+hw-t*1.4,y0,z],[cx+hw,y0,z]],col,true);}
   else if(motif==='step'){const s=hh/3;for(let k=0;k<3;k++)poly('plain',[[cx-hw+k*hw/3,y0+k*s,z],[cx+hw-k*hw/3,y0+k*s,z],[cx+hw-k*hw/3,y0+(k+1)*s,z],[cx-hw+k*hw/3,y0+(k+1)*s,z]],col,true);}}}}
/* the frame of a straight wall from a=[x,z] to b=[x,z], its outer face toward +z of the frame: fn(L) draws with x along the wall */
function dkWall(a,b,fn,out){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;let ry=Math.atan2(b[0]-a[0],b[1]-a[1])-PI/2;
 const nx=Math.sin(ry),nz=Math.cos(ry);if(nx*mx+nz*mz<0)ry+=PI;   // the face turned away from the centre
 W(mx+Math.sin(ry)*(out||0),0,mz+Math.cos(ry)*(out||0),ry,()=>fn(L));}
/* the brass horns on a mast top (the Eastern Nomads' sign) */
function dkFinial(y,col){const c=col||0xb8924a;sph('brass',0,y,0,.1,c);cone('brass',0,y+.08,0,.045,.22,c,8);
 for(const s of [-1,1]){const P0=[0,y+.12,0],pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push([s*(.06+t*.26),y+.14+Math.sin(t*PI*.85)*.3,-t*.04]);}cord('brass',[P0].concat(pts),.022,c);}}
/* ---------------------------------------------------------------- the caidal tent (Moroccan): a white square pavilion
   o: s, wallH, peakH, motif, trim (the band colour), lining, floor, val (valance colour), doorW. Returns H(x,z). */
function dkCaidal(o){const s=o.s,s2=s/2,trim=o.trim||P('trim');
 const H=tkPavilion({s,wallH:o.wallH,peakH:o.peakH,roofCol:o.roofCol||P('canvas'),wallKey:'canvas',lining:o.lining||'patLining',val:o.val||P('trim'),tassels:o.tassels||0xe8dcc4,
  floor:o.floor||'rug',floorCol:o.floorCol||P('rust'),doorW:o.doorW||2.2,poleKey:'wood'});
 // tkPavilion's walls take wallKey with a null colour: the canvas draws white; the bands go on the outside of each wall
 const corners=[[-s2,s2],[s2,s2],[s2,-s2],[-s2,-s2]],dW=o.doorW||2.2;
 for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];dkWall(a,b,L=>{dkBand(L,.22,.34,'step',trim,{z:.02,skip:i===0?(x=>Math.abs(x)<dW/2+.05):null});
  dkBand(L,o.wallH-.62,.42,o.motif||'arch',trim,{z:.02,skip:i===0?(x=>Math.abs(x)<dW/2+.05):null});},.0);}
 // the roof: a band round the eave and lines up the hips (dark on white), the finial
 for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4];const pts=[];for(let k=0;k<=12;k++){const t=k/12,x=lerp(a[0],b[0],t)*.93,z=lerp(a[1],b[1],t)*.93;pts.push([x,H(x,z)+.03,z]);}cord('plain',pts,.05,trim);
  const hip=[];for(let k=0;k<=10;k++){const t=k/10,x=a[0]*(1.05-t),z=a[1]*(1.05-t);hip.push([x,H(x,z)+.03,z]);}cord('plain',hip,.04,trim);}
 dkFinial(o.peakH+.62);
 return H;}
/* ---------------------------------------------------------------- the square tent of brown hair cloth, white bands
   o: w, d, eaveH, peaks [[x,z,h]], open {x0,x1,h}, motif, floor, lining. Returns H(x,z). */
function dkSquare(o){const H=tkPeaked(Object.assign({cover:'hair',col:P('hair'),seam:.7,wallKey:'hair',wallCol:P('hair')},o));const w2=o.w/2,d2=o.d/2,band=P('trimW');
 // white bands round the roof a little above the eave, and down the side and back walls
 const ring=[[-w2,-d2],[w2,-d2],[w2,d2],[-w2,d2],[-w2,-d2]];
 for(const f of [.92,.62]){const pts=[];for(let i=0;i<4;i++)for(let k=0;k<=8;k++){const t=k/8,x=lerp(ring[i][0],ring[i+1][0],t)*f,z=lerp(ring[i][1],ring[i+1][1],t)*f;pts.push([x,H(x,z)+.035,z]);}cord('plain',pts,f>.8?.06:.04,band);}
 for(const [a,b,i] of [[[-w2,-d2],[w2,-d2],0],[[w2,-d2],[w2,d2],1],[[-w2,d2],[-w2,-d2],3]]){const y=Math.min(H(a[0],a[1]),H(b[0],b[1]));dkWall(a,b,L=>dkBand(L,y*.38,Math.min(.4,y*.3),o.motif||'tri',band,{z:.14}));}
 for(const pk of o.peaks)dkFinial(pk[2]+.3);
 return H;}
/* ---------------------------------------------------------------- the black goat-hair tent with a sadu valance and the qata
   o: tkBlack's options, plus qata: x of the woven divider (null: none), qataD (how deep it reaches, a share of d) */
function dkBayt(o){const H=tkBlack(Object.assign({valance:null},o));const w2=o.w/2,d2=o.d/2;
 // the sadu valance: a woven band along the raised front edge (patSadu), its tassels
 psurf(o.sadu||'patSadu',(u,v)=>{const x=-w2+u*o.w;return [x,H(x,d2)+.01-v*.32,d2+.03];},Math.round(o.w*2),1,null);
 tkTassels(Array.from({length:Math.round(o.w/.6)+1},(_,i)=>{const x=-w2+i*.6;return [x,H(x,d2)-.31,d2+.03];}),.6,0xe8dcc4,.14);
 if(o.qata!==undefined&&o.qata!==null){const qx=o.qata,qd=o.qataD||.9;psurf(o.sadu||'patSadu',(u,v)=>{const z=-d2+u*o.d*qd;return [qx,.05+v*(H(qx,z)-.15),z];},Math.max(4,Math.round(o.d*2)),3,null);}
 return H;}
/* ---------------------------------------------------------------- the Tuareg leather tent (ehan)
   o: w, d, h (the ridge), col (the dyed leather), mats (true: woven mat walls on three sides). Returns H(x,z). */
function dkTuareg(o){const w2=o.w/2,d2=o.d/2,h=o.h,eave=o.eave||1.15,sc=new THREE.Color();
 const H=(x,z)=>{const ex=clamp(Math.abs(x)/w2,0,1),ez=clamp(Math.abs(z)/d2,0,1);return eave+(h-eave)*Math.cos(ex*PI/2)*(1-.35*ez*ez);};
 const lc=o.col||P('hide');
 // the roof: forty-odd tanned goatskins sewn edge to edge (a patchwork in vertex colour), the edges hanging free
 psurf('hide',(u,v)=>{const x=-w2-.2+u*(o.w+.4),z=-d2-.15+v*(o.d+.3);return [x,H(clamp(x,-w2,w2),clamp(z,-d2,d2))-(Math.abs(x)>w2?(Math.abs(x)-w2)*1.4:0),z];},Math.round(o.w*3),Math.round(o.d*3),lc,
  {colf:(u,v)=>{const i=Math.floor(u*o.w/.62),j=Math.floor(v*o.d/.5),f=(u*o.w/.62)%1,g=(v*o.d/.5)%1,k=(f<.05||g<.06)?.7:.9+.2*h3(i,j,11);return sc.setRGB(k,k*.97,k*.94);}});
 // the carved arches: a row of forked posts under the ridge, two bent poles across, the side posts
 for(const x of [-w2*.55,0,w2*.55])for(const z of [-d2*.45,d2*.45]){pole('wood',[x,0,z],[x,H(x,z)-.05,z],.06,P('woodD'),7);
  for(const s of [-1,1])pole('carved',[x,H(x,z)-.18,z],[x+s*.12,H(x,z)+.02,z],.03,P('wood'),5);}
 for(const z of [-d2*.45,d2*.45]){const pts=[];for(let i=0;i<=12;i++){const x=-w2+i*o.w/12;pts.push([x,H(x,z)-.04,z]);}cord('wood',pts,.045,P('woodD'));}
 for(const [x,z] of [[-w2,-d2],[w2,-d2],[-w2,d2],[w2,d2],[-w2,0],[w2,0]]){pole('wood',[x,0,z],[x,H(x,z)-.02,z],.045,P('woodD'),6);tkGuy([x,H(x,z),z],x*1.35,z*1.35);}
 // the mat walls: woven reed screens with leather bands in dark geometric rows, tied to the posts (front open)
 if(o.mats!==false){const mat=(u,v)=>{const b=Math.floor(v*7);const k=b===2||b===4?(Math.floor(u*24)%2?.35:.55):.95+.08*h3(Math.floor(u*60),b,3);return sc.setRGB(k,k*.92,k*.78);};
  for(const [a,b] of [[[-w2,-d2],[w2,-d2]],[[w2,-d2],[w2,d2]],[[-w2,d2],[-w2,-d2]]])psurf('rug',(u,v)=>{const x=lerp(a[0],b[0],u),z=lerp(a[1],b[1],u);return [x*1.02,.02+v*Math.min(1.25,H(x,z)-.12),z*1.02];},Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])*2),3,P('palm'),{colf:mat});}
 tkFloor('rug',P('rust'),0,o.w-.2,o.d-.2);
 door(0,0,d2,0,o.w*.6);
 return H;}
