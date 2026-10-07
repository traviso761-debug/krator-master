// prefix: tk
// ================================================================= TENT KIT: the shapes every Scyvoi tent is made of
// Each function draws in the CURRENT frame (a def's local frame or a W() sub-frame): origin on the ground at the tent's
// centre, +z its front (the door). They draw structure only (covers, poles, lattice, ropes, the floor felt); everything
// loose inside is catalog furniture placed by the tent's own builder through FURNISH (91f-furnish.js).
//   tkYurt(o)      the ger: lattice wall, red roof poles, crown, felt cover with an appliqué band and rope bands, a door
//   tkBell(o)      a round bell tent: short wall, one centre pole, a cone roof, scalloped valance, guy ropes
//   tkPeaked(o)    a khaima: one or more peaks over a rectangle, sewn bands, side walls, a front raised on two poles
//   tkBlack(o)     the black goat-hair tent: a low ridged roof on rows of poles, back and side walls, an open front
//   tkPavilion(o)  a square marquee: walls, a pyramid roof on a centre pole, valance and tassels, a lined interior
//   tkPolygon(o)   the appliqué tent: n panel walls, a pyramid roof with edging bands, a fringe
//   tkGuy, tkStake, tkValance, tkTassels, tkFloor: the parts
// Material keys (27-mat.js): felt canvas goat hide (covers), patFelt patArch patBlue patBlack patRose patPoly (pattern
// sheets), wood lacq carved (timber; lacq keeps its own red), rope plain brass flag (small things).
const TK_ROPE=0xb8a07a;
/* a stake at (x,z) in the current frame, and a guy rope from a point on the tent to it (a slight sag) */
function tkStake(x,z,col){beam('wood',[x,-.05,z],[x+.05,.32,z+.02],.05,col||0x8a6a44,false);}
function tkGuy(a,gx,gz,col){tkStake(gx,gz);sagRope('rope',a,[gx+.03,.28,gz+.01],Math.hypot(a[0]-gx,a[2]-gz)*.012,.012,col||TK_ROPE,6);}
/* tassels hanging along a polyline (points [x,y,z]), every `step` metres: a cord and a cone */
function tkTassels(pts,step,col,len){len=len||.16;let acc=0;for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);
 for(let s=(step-acc%step)%step;s<L;s+=step){const t=s/L,p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];beam('plain',p,[p[0],p[1]-len*.45,p[2]],.008,col,true,4);cone('plain',p[0],p[1]-len,p[2],.03,len*.55,col,6);}acc+=L;}}
/* a scalloped valance hanging from a closed or open polyline at its top edge (points [x,y,z]); it flutters at the hem.
   drop: depth at a scallop's deepest; n scallops per metre; mk/col its cloth; it hangs `out` metres off the line along o.nrm(p) */
function tkValance(pts,drop,mk,col,o){o=o||{};const per=o.per||1.3;let L=0;const seg=[];for(let i=0;i<pts.length-1;i++){const l=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][2]-pts[i][2]);seg.push(l);L+=l;}
 const at=s=>{let acc=0;for(let i=0;i<seg.length;i++){if(s<=acc+seg[i]||i===seg.length-1){const t=seg[i]?(s-acc)/seg[i]:0,a=pts[i],b=pts[i+1];return [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];}acc+=seg[i];}return pts[0];};
 const n=Math.max(2,Math.round(L*per*4));
 withCloth(clothHang(drop,.05),()=>psurf(mk,(u,v)=>{const p=at(u*L);const sc=.55+.45*Math.abs(Math.sin(u*L*per*PI));return [p[0],p[1]-v*drop*sc,p[2]];},n,2,col));
 if(o.tassels)tkTassels(Array.from({length:Math.round(L*per)+1},(_,i)=>{const p=at(Math.min(L,(i+.5)/per));return [p[0],p[1]-drop,p[2]];}),1/per,o.tassels,.18);}
/* the floor: a disc (r) or a rectangle (w x d) of cloth just above the ground; mk a pattern sheet or felt */
function tkFloor(mk,col,r,w,d){if(r)cyl(mk,0,.005,0,r,.025,col,Math.max(20,Math.round(r*8)));else box(mk,0,.005,0,w,.025,d,col);}
/* ---------------------------------------------------------------- the ger (yurt)
   o: r (lattice radius), wallH, crownH, crownR, doorW, doorH, felt (cover colour), band (pattern key or null), skirt (colour),
   ropes, posts (centre posts for a big ger), floor (key), floorCol, lining (pattern key over the lattice inside, or null) */
function tkYurt(o){const r=o.r,wH=o.wallH,cH=o.crownH,cR=o.crownR||Math.max(.5,r*.17),dW=o.doorW||.9,dH=o.doorH||Math.min(1.6,wH-.12);
 const g=(dW/2+.1)/r,A0=PI/2+g,A1=PI/2+TAU-g,seg=Math.max(28,Math.round(r*11));const fc=o.felt||P('feltW');
 // the cover: wall felt (a door gap at +z), a darker skirt, the appliqué band, the roof
 lathe('felt',0,0,[[r+.07,0],[r+.07,wH]],seg,fc,{a0:A0,a1:A1});
 lathe('felt',0,0,[[r+.085,0],[r+.085,.28]],seg,o.skirt||P('feltB'),{a0:A0,a1:A1});
 if(o.band)lathe(o.band,0,0,[[r+.095,wH-(o.bandH||.5)],[r+.095,wH-.04]],seg,null,{a0:A0,a1:A1});
 const prof=[];for(let i=0;i<=6;i++){const t=i/6;prof.push([lerp(r+.16,cR+.09,t),lerp(wH-.02,cH+.04,t)+Math.sin(PI*t)*.08*r/4]);}
 lathe('felt',0,0,prof,seg,fc);
 lathe('felt',0,0,[[r+.2,wH-.08],[r+.16,wH-.02]],seg,o.skirt||P('feltB'));   // the roof felt's turned-down edge
 // the rope bands round the wall, broken at the door
 const rc=o.ropes||0x2a2420;for(const y of [.42,wH*.58,wH-.12]){const pts=[];for(let i=0;i<=40;i++){const a=A0+(A1-A0)*i/40;pts.push([Math.cos(a)*(r+.12),y,Math.sin(a)*(r+.12)]);}cord('plain',pts,.025,rc);}
 // the roof ropes: from the crown down the roof to the wall top
 for(let i=0;i<8;i++){const a=PI/2+PI/8+i*TAU/8;const pts=[];for(let k=0;k<=6;k++){const p=prof[k];pts.push([Math.cos(a)*(p[0]+.03),p[1]+.03,Math.sin(a)*(p[0]+.03)]);}cord('plain',pts,.02,rc);}
 // inside: the lattice wall (khana) - two diagonal sets of laths on the cylinder, kept out of the door
 const N=Math.round(TAU*r/.3),D=wH/r*.92,lr=r-.02;const inDoor=a=>{let d=((a-PI/2)%TAU+TAU)%TAU;if(d>PI)d-=TAU;return Math.abs(d)<g+.02;};
 for(let i=0;i<N;i++){const a=i/N*TAU;for(const s of [1,-1]){const b=a+s*D,m=(a+b)/2;if(inDoor(a)||inDoor(b)||inDoor(m))continue;
  const p0=[Math.cos(a)*lr,.04,Math.sin(a)*lr],p1=[Math.cos(m)*lr,wH/2,Math.sin(m)*lr],p2=[Math.cos(b)*lr,wH-.04,Math.sin(b)*lr];beam('wood',p0,p1,.03,o.lattice||0xc8a070,false);beam('wood',p1,p2,.03,o.lattice||0xc8a070,false);}}
 if(o.lining)lathe(o.lining,0,0,[[r-.06,.05],[r-.06,Math.min(1.1,wH*.55)]],seg,null,{a0:A0,a1:A1,inward:true});   // a felt dado hung inside the lattice
 lathe('wood',0,0,[[r-.03,wH-.06],[r-.03,wH]],seg,o.lattice||0xc8a070,{a0:A0,a1:A1});   // the wall-top band
 // the roof poles (uni), red, from the wall top to the crown
 const M=Math.round(TAU*r/.42);for(let i=0;i<M;i++){const a=(i+.5)/M*TAU;pole('lacq',[Math.cos(a)*(r-.06),wH-.03,Math.sin(a)*(r-.06)],[Math.cos(a)*(cR-.02),cH-.1,Math.sin(a)*(cR-.02)],.028,null,5);}
 // the crown (toono): a ring, its bent spokes, the top flap
 ring('lacq',0,cH-.08,0,cR,.07,null,0,0,0,24);ring('lacq',0,cH-.02,0,cR*.62,.04,null,0,0,0,18);
 for(let i=0;i<4;i++){const a=i*PI/4;const p=[Math.cos(a)*cR,cH-.06,Math.sin(a)*cR],q=[-p[0],cH-.06,-p[2]];sagRope('lacq',p,q,-.22,.03,null,6);}
 if(o.posts){for(const s of [-1,1])pole('lacq',[s*cR*.5,0,0],[s*cR*.5,cH-.12,0],.07,null,8);}
 // the door: frame, carved double leaves opened inward, the rolled felt curtain over it
 W(0,0,r,0,()=>{const fr=o.doorCol||null;box('lacq',-dW/2-.07,0,0,.14,dH+.1,.16,fr);box('lacq',dW/2+.07,0,0,.14,dH+.1,.16,fr);box('lacq',0,dH,0,dW+.28,.16,.18,fr);box('carved',0,0,0,dW+.28,.08,.2,0x9a6a3a);
  for(const s of [-1,1])W(s*dW/2,0,-.04,s*1.25,()=>{box('lacq',-s*dW/4,.06,0,dW/2-.02,dH-.08,.05,fr);box('brass',-s*dW/4,dH*.35,.03,dW/2-.16,.05,.02,0xc8963a);box('brass',-s*dW/4,dH*.7,.03,dW/2-.16,.05,.02,0xc8963a);});
  beam(o.band||'felt',[-dW/2-.16,dH+.25,.2],[dW/2+.16,dH+.25,.2],.13,o.band?null:fc,true,10);});   // the door felt, rolled up over the lintel
 tkFloor(o.floor||'felt',o.floorCol||(o.floor?null:P('feltG')),r-.03);
 door(0,0,r+.1,0,dW);
 return {doorH:dH,wallH:wH};}
/* ---------------------------------------------------------------- the bell tent
   o: r, wallH, peakH, cover (key), col, col2 (alternate panels), val (valance key/col), poleCol, guys, doorW */
function tkBell(o){const r=o.r,wH=o.wallH,pH=o.peakH,dW=o.doorW||1.1,g=dW/2/r,seg=Math.max(28,Math.round(r*10));
 const pc=(u,a)=>{const k=Math.floor(((a/TAU)%1+1)%1*12);return k%2?(o.col2||o.col):o.col;};
 const colf=o.col2?((u,v)=>WHITE):null;
 // panels alternate colour: draw the wall and roof as 12 gores
 for(let k=0;k<12;k++){const a0=k/12*TAU,a1=(k+1)/12*TAU;const c=k%2&&o.col2?o.col2:o.col;
  const w0=Math.max(a0,0),w1=a1;const skip=(a,b)=>!(b<=PI/2-g||a>=PI/2+g);
  if(!skip(a0,a1))lathe(o.cover,0,0,[[r,0],[r,wH]],4,c,{a0:w0,a1:w1});
  else{if(a0<PI/2-g)lathe(o.cover,0,0,[[r,0],[r,wH]],3,c,{a0:a0,a1:PI/2-g});if(a1>PI/2+g)lathe(o.cover,0,0,[[r,0],[r,wH]],3,c,{a0:PI/2+g,a1:a1});}
  const prof=[];for(let i=0;i<=5;i++){const t=i/5;prof.push([lerp(r+.25,.08,t),lerp(wH+.05,pH-.05,t)-Math.sin(PI*t)*.12*r/3]);}
  lathe(o.cover,0,0,prof,5,c,{a0:a0,a1:a1});}
 // the door flaps tied back, the valance under the eave, the pole and its finial
 for(const s of [-1,1])poly(o.cover,[[s*dW/2,0,r],[s*(dW/2+.32),0,r+.05],[s*dW/2,wH,r]],o.col,true);
 const vp=[];for(let i=0;i<=48;i++){const a=i/48*TAU;vp.push([Math.cos(a)*(r+.27),wH+.04,Math.sin(a)*(r+.27)]);}
 tkValance(vp,.32,o.valKey||'flag',o.val||P('madder'),{per:1.6,tassels:o.tassels||0xd8b060});
 pole('lacq',[0,0,0],[0,pH+.25,0],.07,o.poleCol||null,8);sph('brass',0,pH+.32,0,.1,0xc8963a);
 if(o.pennant)withCloth(clothFlag(.9),()=>W(0,pH+.15,0,0,()=>psurf('flag',(u,v)=>[u*.9,-v*(.3-u*.25),0],5,2,o.pennant)));
 const ng=o.guys||10;for(let i=0;i<ng;i++){const a=(i+.5)/ng*TAU;if(Math.abs(((a-PI/2+PI)%TAU+TAU)%TAU-PI)<g+.15)continue;const p=[Math.cos(a)*(r+.25),wH+.05,Math.sin(a)*(r+.25)];tkGuy(p,Math.cos(a)*(r+1.5),Math.sin(a)*(r+1.5));}
 tkFloor(o.floor||'rug',o.floorCol||(o.floor&&o.floor.startsWith('pat')?null:P('madder')),r-.02);
 door(0,0,r,0,dW);}
/* ---------------------------------------------------------------- the khaima: peaks over a rectangle
   o: w, d, eaveH, peaks [[x,z,h],...], cover key, col, seam (darker sewn bands), open {x0,x1,h} (the front raised on two
   poles), walls (true: side and back walls down to the ground), poles key, guys, floor key/col, lining key
   Returns the height function H(x,z) so a builder can hang things from the roof. */
function tkPeakH(o){const w2=o.w/2,d2=o.d/2;return (x,z)=>{let y=o.eaveH;
 for(const pk of o.peaks){const mx=x>=pk[0]?(x-pk[0])/Math.max(.01,w2-pk[0]):(pk[0]-x)/Math.max(.01,pk[0]+w2),mz=z>=pk[1]?(z-pk[1])/Math.max(.01,d2-pk[1]):(pk[1]-z)/Math.max(.01,pk[1]+d2);
  const m=clamp(Math.max(mx,mz),0,1);y=Math.max(y,o.eaveH+(pk[2]-o.eaveH)*Math.pow(1-m,1.18));}
 if(o.open){const b=smooth(o.open.x0-.6,o.open.x0+.2,x)*(1-smooth(o.open.x1-.2,o.open.x1+.6,x)),f=smooth(d2*.35,d2,z);y=Math.max(y,lerp(y,o.open.h,b*f));}
 return y;};}
function tkPeaked(o){const w2=o.w/2,d2=o.d/2,H=tkPeakH(o),nx=Math.max(8,Math.round(o.w*2.2)),nz=Math.max(8,Math.round(o.d*2.2));
 const base=o.col,seam=o.seam||.82,sc=new THREE.Color();
 const colf=(u,v)=>{const x=-w2+u*o.w,z=-d2+v*o.d,y=H(x,z),f=((y/.55)%1+1)%1;const k=f<.06?seam:1;return sc.setRGB(k,k,k);};
 psurf(o.cover,(u,v)=>{const x=-w2+u*o.w,z=-d2+v*o.d;return [x,H(x,z),z];},nx,nz,base,{colf});
 if(o.lining)psurf(o.lining,(u,v)=>{const x=(-w2+u*o.w)*.97,z=(-d2+v*o.d)*.97;return [x,H(x,z)-.06,z];},nx,nz,null);
 // the walls: hung from the roof edge to the ground; the raised front stays open
 if(o.walls!==false){const edge=(t,side)=>side===0?[-w2+t*o.w,-d2]:side===1?[w2,-d2+t*o.d]:side===2?[w2-t*o.w,d2]:[-w2,d2-t*o.d];
  for(let side=0;side<4;side++){if(side===2&&o.open&&!o.closedFront){const L=[[w2,o.open.x1+.35],[o.open.x0-.35,-w2]];
    for(const [xa,xb] of L){if(xa-xb<.2)continue;psurf(o.cover,(u,v)=>{const x=lerp(xa,xb,u),y0=H(x,d2);return [x,y0*(1-v)+.04*v,d2+.08*v];},Math.max(2,Math.round((xa-xb)*2)),2,base,{colf:(u,v)=>sc.setRGB(.9,.9,.9)});}continue;}
   psurf(o.wallKey||o.cover,(u,v)=>{const e=edge(u,side),y0=H(e[0],e[1]);const out=.12*v;const nx2=side===1?out:side===3?-out:0,nz2=side===0?-out:side===2?out:0;return [e[0]+nx2,y0*(1-v)+.04*v,e[1]+nz2];},Math.max(3,Math.round((side%2?o.d:o.w)*1.5)),2,o.wallCol||base,{colf:(u,v)=>sc.setRGB(.88,.88,.88)});}}
 // poles: one under each peak, two at the raised front
 for(const pk of o.peaks)pole(o.poles||'wood',[pk[0],0,pk[1]],[pk[0],pk[2]-.04,pk[1]],.075,o.poleCol||P('woodD'),8);
 if(o.open)for(const x of [o.open.x0,o.open.x1]){pole(o.poles||'wood',[x,0,d2+.02],[x,o.open.h+.12,d2+.02],.055,o.poleCol||P('woodD'),8);tkGuy([x,o.open.h+.1,d2+.02],x*1.15,d2+2.2);}
 // guy ropes off the eaves
 const ng=o.guys===undefined?Math.round((o.w+o.d)/2.2):o.guys;for(let i=0;i<ng;i++){const t=(i+.5)/ng;
  for(const [x,z,gx,gz] of [[-w2+t*o.w,-d2,-w2+t*o.w,-d2-1.6],[-w2,-d2+t*o.d,-w2-1.6,-d2+t*o.d],[w2,-d2+t*o.d,w2+1.6,-d2+t*o.d]]){tkGuy([x,H(x,z)+.02,z],gx,gz);}}
 if(o.floor)tkFloor(o.floor,o.floorCol||null,0,o.w-.15,o.d-.15);
 door(o.open?(o.open.x0+o.open.x1)/2:0,0,d2,0,o.open?o.open.x1-o.open.x0:1);
 return H;}
/* ---------------------------------------------------------------- the black goat-hair tent (beit sha'ar)
   o: w (along x), d, rows of poles (z positions) and their heights, frontH (the raised front edge), backH, nPoles per row,
   stripes (pale bands across the roof), walls, guys. Returns H(x,z). */
function tkBlackH(o){const w2=o.w/2,d2=o.d/2;const rows=o.rows.slice().sort((a,b)=>a.z-b.z);
 // the base: a broad roof through the back edge, each pole row (a little under its poles) and the raised front, eased between
 const K=[[-d2,o.backH]].concat(rows.map(r=>[r.z,r.h-.28]),[[d2,o.frontH]]);
 return (x,z)=>{let i=0;while(i<K.length-2&&z>K[i+1][0])i++;const a=K[i],b=K[i+1],t=clamp((z-a[0])/(b[0]-a[0]),0,1),e=(1-Math.cos(PI*t))/2;
  let y=lerp(a[1],b[1],e)-.12*(1-Math.pow(Math.abs(x)/w2,2))*Math.sin(PI*clamp((z+d2)/o.d,0,1));
  // a gentle tent of cloth over each pole top
  for(const row of rows){const n=row.n;for(let k=0;k<n;k++){const px=n===1?0:-w2+o.w*(k+.5)/n,dx=(x-px)/1.5,dz=(z-row.z)/1.25;y+=.3*Math.exp(-(dx*dx+dz*dz));}}
  return y;};}
function tkBlack(o){const w2=o.w/2,d2=o.d/2,H=tkBlackH(o),sc=new THREE.Color();const goat=o.col||P('goat'),pale=o.pale||hc(pick(SVPAL.goatS));
 // the roof strips run the tent's length; a pale strip every few, darker seams between
 const colf=(u,v)=>{const s=Math.floor(v*o.d/.62),f=(v*o.d/.62)%1;if(o.stripes&&o.stripes.indexOf(s)>=0)return sc.setRGB(2.9,2.6,2.2);/* a pale woven strip: the dark map lifted to a sandy brown */const k=f<.05?.7:1+(s%2)*.08;return sc.setRGB(k,k,k);};
 psurf('goat',(u,v)=>{const x=-w2+u*o.w,z=-d2+v*o.d;return [x,H(x,z),z];},Math.round(o.w*2.5),Math.round(o.d*3),goat,{colf});
 // the back wall (rwaq) and the side walls, pegged to the ground; the front is open
 psurf('goat',(u,v)=>{const x=-w2+u*o.w,y0=H(x,-d2);return [x,y0*(1-v)+.02*v,-d2-.25*v];},Math.round(o.w*1.5),2,goat,{colf:(u,v)=>sc.setRGB(.92,.92,.92)});
 for(const s of [-1,1])psurf('goat',(u,v)=>{const z=-d2+u*o.d*(o.sideOpen||1),y0=H(s*w2,z);return [s*(w2+.25*v),y0*(1-v)+.02*v,z];},Math.round(o.d*1.5),2,goat,{colf:(u,v)=>sc.setRGB(.92,.92,.92)});
 // poles under every peak, the front edge's poles, guys front and back
 for(const row of o.rows)for(let i=0;i<row.n;i++){const px=row.n===1?0:-w2+o.w*(i+.5)/row.n;pole('wood',[px,0,row.z],[px,H(px,row.z)-.05,row.z],.06,P('woodD'),7);}
 const nf=o.frontPoles||Math.max(2,Math.round(o.w/2.6));for(let i=0;i<nf;i++){const x=-w2+.3+(o.w-.6)*i/(nf-1);pole('wood',[x,0,d2],[x,H(x,d2),d2],.045,P('woodD'),6);tkGuy([x,H(x,d2),d2],x*1.08,d2+2.4);}
 for(let i=0;i<nf;i++){const x=-w2+.3+(o.w-.6)*i/(nf-1);tkGuy([x,H(x,-d2)+.02,-d2],x*1.08,-d2-2.2);}
 if(o.valance){const vp=[];for(let i=0;i<=24;i++){const x=-w2+o.w*i/24;vp.push([x,H(x,d2)+.01,d2+.01]);}tkValance(vp,.28,'flag',o.valance,{per:2.2,tassels:0xe8dcc0});}
 door(0,0,d2,0,o.w*.6);
 return H;}
/* ---------------------------------------------------------------- the pavilion (a square marquee)
   o: s (side), wallH, peakH, roofCol, wallKey (outside), lining (inside key), val (valance colour), tassels, doorW, poleKey */
function tkPavilion(o){const s2=o.s/2,wH=o.wallH,pH=o.peakH,dW=o.doorW||2.2;const sc=new THREE.Color();
 const H=(x,z)=>{const m=Math.max(Math.abs(x),Math.abs(z))/(s2+.35);return wH+.05+(pH-wH)*Math.pow(1-clamp(m,0,1),1.12);};
 const rc=o.roofCol||P('canvasO');
 psurf('canvas',(u,v)=>{const x=-(s2+.35)+u*(o.s+.7),z=-(s2+.35)+v*(o.s+.7);return [x,H(x,z),z];},Math.round(o.s*2.4),Math.round(o.s*2.4),rc,
  {colf:(u,v)=>{const x=(u-.5),z=(v-.5);const diag=Math.min(Math.abs(Math.abs(x)-Math.abs(z)),1);const k=diag<.012?.75:1;return sc.setRGB(k,k,k);}});
 if(o.lining)psurf(o.lining,(u,v)=>{const x=-(s2-.05)+u*(o.s-.1),z=-(s2-.05)+v*(o.s-.1);return [x,H(x,z)-.07,z];},Math.round(o.s*2),Math.round(o.s*2),null);
 // walls: outside and lining (n points inward: the wall sits a hair outside the line, the lining 6 cm in; fixed 2026-10-07,
 // the lining had been drawn outside); the front has a door gap with tied-back curtains
 const sides=[[[-s2,s2],[s2,s2]],[[s2,s2],[s2,-s2]],[[s2,-s2],[-s2,-s2]],[[-s2,-s2],[-s2,s2]]];
 sides.forEach((sd,i)=>{const a=sd[0],b=sd[1];const segs=i===0?[[0,.5-dW/2/o.s],[.5+dW/2/o.s,1]]:[[0,1]];
  for(const [t0,t1] of segs){const p=t=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t)];const n=[(b[1]-a[1])/o.s,-(b[0]-a[0])/o.s];
   psurf(o.wallKey||'patFelt',(u,v)=>{const q=p(lerp(t0,t1,u));return [q[0]-n[0]*.01,v*wH,q[1]-n[1]*.01];},Math.max(2,Math.round((t1-t0)*o.s*1.5)),2,o.wallKey?null:o.wallCol||null);
   if(o.lining)psurf(o.lining,(u,v)=>{const q=p(lerp(t0,t1,u));return [q[0]+n[0]*.06,.02+v*(wH-.05),q[1]+n[1]*.06];},Math.max(2,Math.round((t1-t0)*o.s*1.5)),2,null);}});
 for(const sg of [-1,1]){poly('canvas',[[sg*dW/2,0,s2+.02],[sg*(dW/2+.55),0,s2+.12],[sg*dW/2,wH,s2+.02]],rc,true);}
 // the eave valance with tassels, corner and door poles, the centre pole, guys
 const vp=[[-s2-.36,0,s2+.36],[s2+.36,0,s2+.36],[s2+.36,0,-s2-.36],[-s2-.36,0,-s2-.36],[-s2-.36,0,s2+.36]].map(q=>[q[0],wH+.04,q[2]]);
 tkValance(vp,.42,'flag',o.val||P('madder'),{per:1.4,tassels:o.tassels||0xd8b060});
 const pk=o.poleKey||'lacq';for(const [x,z] of [[-s2,s2],[s2,s2],[s2,-s2],[-s2,-s2],[-dW/2,s2],[dW/2,s2]])pole(pk,[x,0,z],[x,wH+.06,z],.06,null,8);
 pole(pk,[0,0,0],[0,pH+.3,0],.1,null,10);sph('brass',0,pH+.42,0,.14,0xc8963a);cone('brass',0,pH+.52,0,.06,.3,0xc8963a,8);
 for(const [x,z] of [[-s2,s2],[s2,s2],[s2,-s2],[-s2,-s2]])tkGuy([x*1.08,wH+.06,z*1.08],x*1.5,z*1.5);
 for(const [x,z] of [[0,-s2],[-s2,0],[s2,0]])tkGuy([x*1.08,wH+.06,z*1.08],x*1.5,z*1.5);
 tkFloor(o.floor||'rug',o.floorCol||(o.floor&&o.floor.startsWith('pat')?null:P('crimson')),0,o.s-.1,o.s-.1);
 door(0,0,s2,0,dW);
 return H;}
/* ---------------------------------------------------------------- the appliqué tent: n panel walls, a pyramid roof
   o: n, R (corner radius), wallH, peakH, wallKey (panels), frame (white felt borders), roof (felt colour), trim (edge bands),
   fringe (valance colour), doorW */
function tkPolygon(o){const n=o.n,R=o.R,wH=o.wallH,pH=o.peakH,dW=o.doorW||1.4;const ap=k=>PI/2+PI/n+k*TAU/n;   // a door panel centred on +z
 const C=k=>[Math.cos(ap(k))*R,Math.sin(ap(k))*R];
 for(let k=0;k<n;k++){const a=C(k),b=C(k+1),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2],isDoor=mid[1]>R*.8&&Math.abs(mid[0])<.1;
  const L=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/L,nz=-(b[0]-a[0])/L,out=nx*mid[0]+nz*mid[1]>0?1:-1;
  const wk=Array.isArray(o.wallKey)?o.wallKey[k%o.wallKey.length]:(o.wallKey||'patBlue');const panel=(t0,t1)=>psurf(wk,(u,v)=>{const t=lerp(t0,t1,u);return [lerp(a[0],b[0],t)+nx*out*.01,.25+v*(wH-.55),lerp(a[1],b[1],t)+nz*out*.01];},3,2,null);
  if(isDoor){const g=dW/2/L;panel(0,.5-g);panel(.5+g,1);}else panel(0,1);
  // the white felt frame round each panel, and the lower skirt
  const fc=o.frame||0xf2ece0;const ang=Math.atan2(b[0]-a[0],b[1]-a[1])-PI/2;
  W(mid[0]+nx*out*.04,0,mid[1]+nz*out*.04,ang,()=>{box('felt',0,0,0,L,.25,.06,o.skirt||0x23345a);box('felt',0,wH-.32,0,L,.1,.06,fc);if(!isDoor){box('felt',-L/2+.05,.25,0,.1,wH-.55,.06,fc);}});}
 // roof facets with edge bands and a ring of the pattern near the eave
 const rc=o.roof||0xf4efe6,sc=new THREE.Color();
 for(let k=0;k<n;k++){const a=C(k),b=C(k+1),ov=1.12;
  const RF=(u,v)=>{const p=[lerp(a[0],b[0],u)*ov,lerp(a[1],b[1],u)*ov];return [p[0]*(1-v),lerp(wH-.12,pH,v)+Math.sin(PI*v)*.12,p[1]*(1-v)];};
  psurf('felt',RF,6,8,rc);
  // the edging: an indigo band down each hip and a teal band round the eave, sewn on (drawn as flat cords just proud of the felt)
  cord('felt',Array.from({length:9},(_,i)=>{const q=RF(0,i/8);return [q[0],q[1]+.03,q[2]];}),.07,o.trim||0x23345a);
  cord('felt',Array.from({length:7},(_,i)=>{const q=RF(i/6,.1);return [q[0],q[1]+.035,q[2]];}),.08,o.trim2||0x1f5a5e);}
 const vp=[];for(let k=0;k<=n;k++){const a=C(k%n);vp.push([a[0]*1.12,wH-.13,a[1]*1.12]);}
 tkValance(vp,.3,'flag',o.fringe||0x2a9a5a,{per:2.6});
 pole('lacq',[0,0,0],[0,pH+.4,0],.09,null,8);sph('brass',0,pH+.5,0,.12,0xc8963a);
 for(let k=0;k<n;k++){const a=C(k);pole('wood',[a[0],0,a[1]],[a[0]*1.02,wH-.1,a[1]*1.02],.05,P('woodD'),6);tkGuy([a[0]*1.12,wH-.1,a[1]*1.12],a[0]*1.6,a[1]*1.6);}
 tkFloor(o.floor||'rug',o.floorCol||null,R*.96);
 door(0,0,R*Math.cos(PI/n),0,dW);}
