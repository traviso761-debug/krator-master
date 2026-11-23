// prefix: fg
// ================================================================= THE FELLGANG SET: the shared vocabulary (PLAN.md sections 1.3, 2.1, 3.1, 3.3)
// Every Fellgang building is drystone of the rim's stone under turf on bell-fir poles, low and long, with salvage LASHED and
// SPIKED on (PLAN.md 2.1, "the rule of salvage": wired, pegged, its edges left raw, spikes added), and a slogan somewhere.
// THE FRAME (the riftrim stand-ins' contract, PLAN.md 3.3.1): origin at the footprint's centre, the door on +z toward the lane,
// the floor (y 0) at the footprint's highest corner, and a drystone plinth carried down to the lowest corner. place() passes
// the builder o.lo (the plinth's foot, local y: the stand-ins' R.lo, default -.5 on flat ground) and o.gl(x, z) (the ground's
// height under a local point, local y: default 0); 80-fg-host.js computes both from the ground a host passes.
//   fgCx(o)                      {lo, gl, worn, v, st}: the builder's context (st 'kept' | 'worn')
//   fgPlinth(x0,x1,z0,z1,C)      the stepped footing: cells of drystone, each down to its own lowest corner less .5 m
//   fgWalls(hw,hd,th,y1,C,gaps)  four drystone walls round the footprint, door gaps [x0, x1, top] in the front (+z) wall
//   fgRoof(hw,hd,wh,rid,C,o)     the gabled turf roof along x: two turf slabs, the ridge roll, bell-fir purlins and rafters
//                                 under it, the gables in stepped drystone courses; o.noGable a side to leave open
//   fgDoor(x,z,w,h,C,o)          an Ancient plate door on cable hinges in a bell-fir frame under a lintel (svLeaf: it opens, E)
//   fgPatch / fgSpike / fgLash   salvage lashed on: a plate over a wall, a spike, a cord
//   fgText(s,x,y,z,ry,ch,col)    a slogan in daubed block letters (geometry: the daub sheet is owed, KNOWN_ISSUES.md)
//   fgSign(s,x,y,z,ry,o)         a slogan on a lashed plate; fgMark(i,...) a family's mark (six signs, coloured by family)
//   fgHearth(x,z,C) / fgHood     a fire ring under a smoke hole; the hood of scrap over the hole on the ridge
//   fgFurn(key,x,y,z,ry,o)       a catalog piece (core/furnish through the engine's FURNISH), fgDim(key) its size
//   fgNote(k,n)                  a count on the record (rec.fg[k]): verify.py reads the rope wall's pegs, the tally's slats
/* the builder's context */
function fgCx(o){o=o||{};const wn=s=>s==='worn'||s==='abandoned',st=wn(o.state)||(o.state==null&&typeof FG_STATE!=='undefined'&&wn(FG_STATE))?'worn':'kept';   /* the Fellgangs draw the Glaziers' abandoned state as worn */
 return {lo:o.lo==null?-.5:o.lo,gl:typeof o.gl==='function'?o.gl:()=>0,worn:st==='worn',st,v:o.v|0,o};}
/* a count on the current record (verify.py: the meeting hall's variants, the ice house's blocks) */
function fgNote(k,n){if(!CURREC)return;const f=CURREC.fg||(CURREC.fg={});f[k]=(f[k]==null?0:f[k])+(n==null?1:n);}
function fgSet(k,v){if(!CURREC)return;(CURREC.fg||(CURREC.fg={}))[k]=v;}
/* a colour that weathers: the worn state darkens and greys it */
function fgCol(k,C){const c=P(k);if(C&&C.worn){const g=(c.r+c.g+c.b)/3;c.r=(c.r*.7+g*.3)*.82;c.g=(c.g*.7+g*.3)*.82;c.b=(c.b*.7+g*.3)*.8;}return c;}
/* ---------------------------------------------------------------- the footing */
/* drystone cells under the footprint, each from just over the floor down to its own lowest corner less .5 m: on a slope a
   stepped footing, on the flat one slab to -.5 (the stand-ins' lo). The cell with the footprint's lowest corner reaches C.lo. */
function fgPlinth(x0,x1,z0,z1,C,o){o=o||{};const nx=Math.max(1,Math.min(5,Math.round((x1-x0)/4))),nz=Math.max(1,Math.min(3,Math.round((z1-z0)/4))),top=o.top==null?.06:o.top;
 const col=fgCol('stone',C);let mn=1e9;
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const a0=x0+(x1-x0)*i/nx,a1=x0+(x1-x0)*(i+1)/nx,b0=z0+(z1-z0)*j/nz,b1=z0+(z1-z0)*(j+1)/nz;
  let g=Math.min(C.gl(a0,b0),C.gl(a1,b0),C.gl(a1,b1),C.gl(a0,b1),0)-.5;g=Math.max(g,C.lo);mn=Math.min(mn,g);
  box('stone',(a0+a1)/2,g,(b0+b1)/2,a1-a0+.02,top-g,b1-b0+.02,col);}
 /* the lowest cell reaches the stand-in's lo exactly (its corners and centre were what the host measured) */
 if(mn>C.lo+.001)box('stone',(x0+x1)/2,C.lo,(z0+z1)/2,Math.min(1.2,x1-x0),mn-C.lo+.02,Math.min(1.2,z1-z0),col);
 return mn;}
/* ---------------------------------------------------------------- drystone walls */
/* a wall from (x0,z0) to (x1,z1) of thickness th, from y0 to y1, with a through-band of darker stones every ~.9 m (the
   drystone's coursing, a stone proud of the face) */
function fgWall(x0,z0,x1,z1,th,y0,y1,C,col){const dx=x1-x0,dz=z1-z0,L=Math.hypot(dx,dz);if(L<.05||y1-y0<.02)return;const ry=Math.atan2(dx,dz)-PI/2,mx=(x0+x1)/2,mz=(z0+z1)/2;
 col=col||fgCol('stone',C);W(mx,0,mz,ry,()=>{box('stone',0,y0,0,L,y1-y0,th,col);
  const dk=col.clone().multiplyScalar(.82);for(let y=y0+.85;y<y1-.3;y+=.9)box('stone',0,y,0,L+.02,.1,th+.04,dk);});}
/* four walls round a w x d footprint (outer faces on +-hw, +-hd), the front's door gaps [x0, x1, top]: a lintel bridges each */
function fgWalls(hw,hd,th,y1,C,gaps,o){o=o||{};gaps=(gaps||[]).slice().sort((a,b)=>a[0]-b[0]);const col=fgCol('stone',C),zf=hd-th/2;
 fgWall(-hw,-hd+th/2,hw,-hd+th/2,th,0,y1,C,col);
 if(!o.openLeft)fgWall(-hw+th/2,-hd+th,-hw+th/2,hd-th,th,0,y1,C,col);
 if(!o.openRight)fgWall(hw-th/2,-hd+th,hw-th/2,hd-th,th,0,y1,C,col);
 if(o.openFront)return;let x=-hw;
 for(const g of gaps){fgWall(x,zf,g[0],zf,th,0,y1,C,col);box('stoneD',(g[0]+g[1])/2,g[2],zf,g[1]-g[0]+.6,.28,th+.04,fgCol('stoneD',C));
  fgWall(g[0],zf,g[1],zf,th,g[2]+.28,y1,C,col);x=g[1];}
 fgWall(x,zf,hw,zf,th,0,y1,C,col);}
/* ---------------------------------------------------------------- a slab between two edges */
/* p0->p1 one edge, p0->p2 the other, thickness th about the mid-plane; a proper rotation (the engine's plane4 builds its box
   with a negative depth scale, so its faces turn inside out: invisible on a single-sided key such as the turf) */
const fgVX=new THREE.Vector3(),fgVY=new THREE.Vector3(),fgVZ=new THREE.Vector3(),fgVM=new THREE.Matrix4(),fgVQ=new THREE.Quaternion();
function fgSlab(mk,p0,p1,p2,th,col){fgVX.set(p1[0]-p0[0],p1[1]-p0[1],p1[2]-p0[2]);const L1=fgVX.length();if(L1<1e-6)return;fgVX.multiplyScalar(1/L1);
 fgVZ.set(p2[0]-p0[0],p2[1]-p0[1],p2[2]-p0[2]);const e2=fgVZ.clone();fgVZ.addScaledVector(fgVX,-fgVZ.dot(fgVX));const L2=fgVZ.length();if(L2<1e-6)return;fgVZ.multiplyScalar(1/L2);
 fgVY.crossVectors(fgVZ,fgVX);fgVQ.setFromRotationMatrix(fgVM.makeBasis(fgVX,fgVY,fgVZ));
 const mid=new THREE.Vector3(p0[0],p0[1],p0[2]).addScaledVector(fgVX,L1/2).addScaledVector(e2,.5);
 emit(mk,gbox(),new THREE.Matrix4().compose(mid,fgVQ,new THREE.Vector3(L1,th,L2)),col);}
/* ---------------------------------------------------------------- the turf roof */
/* gabled along x: eaves at wh on +-hd (overhanging ovz, .08: the slab's thickness adds th * sin(pitch) beyond it; the gables ov, .2), the ridge at rid; turf slabs .32 thick on bell-fir purlins and rafters
   (seen from inside in the cut-away), the ridge roll on top (its crown at rid + .22: the def's h), the gables in stepped
   drystone courses between the walls' top and the ridge. C.worn: patches of dead turf, a slump in the ridge */
function fgRoof(hw,hd,wh,rid,C,o){o=o||{};const ov=o.ov==null?.2:o.ov,ovz=o.ovz==null?.08:o.ovz,th=.32,X0=-hw-ov,X1=hw+ov,tc=fgCol('turf',C),s=(rid-wh)/hd;
 const yE=wh-ovz*s;
 for(const sg of [1,-1]){const p0=[X0,yE,sg*(hd+ovz)],p1=[X1,yE,sg*(hd+ovz)],p2=[X0,rid,0];
  /* the slab's mid-plane sits th/2 under the eave-to-ridge line */
  const dn=th/2/Math.cos(Math.atan(s));fgSlab('turf',[p0[0],p0[1]-dn,p0[2]],[p1[0],p1[1]-dn,p1[2]],[p2[0],p2[1]-dn,p2[2]],th,tc);
  /* purlins: bell-fir poles along x under the slab */
  const pc=fgCol('pole',C);for(let t=.2;t<.95;t+=.27){const z=sg*hd*(1-t),y=wh+(rid-wh)*t-th-.06;pole('pole',[-hw+.05,y,z],[hw-.05,y,z],.07,pc,6);}
  if(C.worn){const n=2+(C.v%3);for(let k=0;k<n;k++){const u=rr(-.8,.8)*hw,t=rr(.2,.75),z=sg*hd*(1-t),y=wh+(rid-wh)*t+.01;
   W(u,y,z,0,()=>box('turf',0,0,0,rr(.8,1.6),.06,rr(.6,1.1),fgCol('turfB',C),0,-sg*Math.atan(s)));}}}
 /* the ridge pole and the ridge roll (turf rolled over the ridge) */
 const rc=fgCol('pole',C);pole('pole',[X0+.1,rid-th-.05,0],[X1-.1,rid-th-.05,0],.11,rc,8);
 const sag=C.worn?.18:0;if(sag){for(let k=0;k<4;k++){const a=X0+(X1-X0)*k/4,b=X0+(X1-X0)*(k+1)/4,ya=rid-sag*Math.sin(PI*k/4),yb=rid-sag*Math.sin(PI*(k+1)/4);beam('turf',[a,ya,0],[b,yb,0],.22,tc,true,8);}}
 else beam('turf',[X0,rid,0],[X1,rid,0],.22,tc,true,8);
 /* rafters at the gables and every ~2.5 m (inside: the cut-away shows them) */
 {const nr=Math.max(2,Math.round((2*hw-.8)/2.5));for(let i=0;i<=nr;i++){const x=-hw+.4+i*(2*hw-.8)/nr;for(const sg of [1,-1])pole('pole',[x,wh-.05,sg*(hd-.3)],[x,rid-th-.08,0],.06,rc,5);}}
 /* the gables: drystone courses stepping in to the ridge */
 if(!o.noGables){const col=fgCol('stone',C),gt=o.gableT==null?.6:o.gableT;for(const sx of [-1,1]){if(o.noGable===sx)continue;const n=Math.max(4,Math.round((rid-wh)/.22));
  for(let k=0;k<n;k++){const y0=wh+(rid-wh)*k/n,y1=wh+(rid-wh)*(k+1)/n,half=Math.max(.05,hd*(1-(k+1)/n)-.05);box('stone',sx*(hw-gt/2),y0,0,gt,y1-y0+.01,2*half,col);}}}}
/* ---------------------------------------------------------------- the plate door */
/* an Ancient plate door on cable hinges in a bell-fir frame: (x,z) the middle of the doorway's line, w x h. The leaf is a
   core/door record (svLeaf): it opens with E on the sheet, and draws shut into the buckets in a dry or host draw */
function fgDoor(x,z,w,h,C,o){o=o||{};const pc=fgCol('pole',C),th=o.th==null?.7:o.th;
 for(const s of [-1,1])pole('pole',[x+s*(w/2+.06),0,z+th/2-.08],[x+s*(w/2+.06),h+.12,z+th/2-.08],.08,pc,6);
 /* the leaf: white plate, or rusted on a poor door; a worn door stands ajar */
 svLeaf(x,0,z+th/2-.12,0,w,h,{mk:o.rust?'rust':'plate',col:o.rust?0xc8b8a8:(C.worn?0xb8b2a4:0xffffff),t:.05,ajar:C.worn&&!o.shut?.7:0,name:o.name||'a plate door'});
 /* the cable hinges: loops of Ancient cable round the post */
 const hx=x-w/2-.06;for(const y of [.35,h-.35,h*.5])ring('cable',hx,y,z+th/2-.08,.1,.022,P('cable'),0,0,0,10);
 door(x,0,z+th/2,0,w,h);}
/* ---------------------------------------------------------------- salvage lashed on */
/* a spike from a along dir (len): a tapered iron rod */
function fgSpike(a,dir,len,mk){const L0=Math.hypot(dir[0],dir[1],dir[2]),L=L0>0?L0:1;beam(mk||'iron',a,[a[0]+dir[0]/L*len,a[1]+dir[1]/L*len,a[2]+dir[2]/L*len],.035,P('iron'),true,5,.004);}
function fgLash(a,b){cord('cord',[a,b],.014,P('rope'));}
/* a plate patch over a face: centre (x,y,z), w x h, the face's yaw ry (+z out of it): lashed with two cords over its front and a
   spike at its top corners; kind 'plate' (Ancient white), 'rust', 'tin' (corrugated), 'scrap' */
function fgPatch(x,y,z,w,h,ry,C,kind){kind=kind||pick(['rust','rust','plate','tin','scrap']);W(x,y,z,ry,()=>{box(kind,0,-h/2,.03,w,h,.04,fgCol(kind==='plate'?'plate':kind==='tin'?'tin':kind==='scrap'?'scrap':'rust',C),0,rr(-.05,.05));
 for(const s of [-.3,.3])fgLash([w*s,h/2+.05,-.02],[w*s,-h/2-.05,.08]);if(!C.worn||rng()<.5)for(const s of [-1,1])fgSpike([s*w*.45,h*.45,.06],[s*.2,.3,1],.22);});}
/* ---------------------------------------------------------------- slogans and marks */
/* 3 x 5 block letters, daubed: each glyph five rows of three cells (1 = paint). The slogans' words are the kit's own (PLAN.md 7:
   the daub sheet will carry the marks, never the words) */
const FG_FONT={A:['010','101','111','101','101'],B:['110','101','110','101','110'],C:['011','100','100','100','011'],D:['110','101','101','101','110'],
 E:['111','100','110','100','111'],F:['111','100','110','100','100'],G:['011','100','101','101','011'],H:['101','101','111','101','101'],I:['111','010','010','010','111'],
 K:['101','101','110','101','101'],L:['100','100','100','100','111'],M:['101','111','101','101','101'],N:['101','111','111','111','101'],O:['010','101','101','101','010'],
 P:['110','101','110','100','100'],R:['110','101','110','101','101'],S:['011','100','010','001','110'],T:['111','010','010','010','010'],U:['101','101','101','101','111'],
 V:['101','101','101','101','010'],W:['101','101','101','111','101'],Y:['101','101','010','010','010'],"'":['010','010','000','000','000']};
/* the width of a slogan at cap height ch */
function fgTextW(s,ch){return (s.length*4-1)*ch/5;}
/* a slogan centred on (x,y) (y its baseline) on the face whose yaw is ry, letters ch tall, a hair proud of the face */
function fgText(s,x,y,z,ry,ch,col){const px=ch/5,w=fgTextW(s,ch);col=col||P('red');
 W(x,y,z,ry,()=>{let cx=-w/2;for(const c of s.toUpperCase()){const G=FG_FONT[c];if(G){for(let r=0;r<5;r++){const row=G[r];let k=0;
   while(k<3){if(row[k]!=='1'){k++;continue;}let e=k;while(e<3&&row[e]==='1')e++;quad('plain',cx+(k+e)/2*px,(4-r)*px+px*.48,.016,(e-k)*px*.96,px*.96,col);k=e;}}}
  cx+=4*px;}});}
/* a slogan on a lashed plate: the plate sized to the words, white or rust, the letters red or black */
function fgSign(s,x,y,z,ry,C,o){o=o||{};const ch=o.ch==null?.22:o.ch,w=fgTextW(s,ch)+ch*1.2,h=ch*1.9,kind=o.kind||'plate';
 W(x,y,z,ry,()=>{box(kind,0,0,0,w,h,.04,fgCol(kind,C));fgText(s,0,(h-ch)/2,.02,0,ch,C.worn?fgCol('rust',C):P(o.ink||(kind==='plate'?'red':'white')));
  for(const sx of [-1,1]){fgLash([sx*(w/2-.08),h+.05,-.03],[sx*(w/2-.08),-.05,.05]);fgSpike([sx*(w/2+.02),h*.5,.02],[sx,.2,.3],.18);}});}
/* the family marks (PLAN.md 3.3.1: "the family's mark painted at the foot and at each peg, so the rope reads as a claim"): six
   signs (the wheel, the cross, the chevron, the bars, the triangle, the ring and dot) in a family colour, i the family */
const FG_MARKCOL=[0xa8321e,0xc8902e,0xe8e2d4,0x2e5a8a,0x3a7a4a,0x1c1a18,0x8a3a7a];
function fgMarkCol(i){return FG_MARKCOL[((i|0)%FG_MARKCOL.length+FG_MARKCOL.length)%FG_MARKCOL.length];}
function fgMark(i,x,y,z,ry,s,col){i=i|0;col=col==null?fgMarkCol(Math.floor(i/6)+i):col;const k=((i%6)+6)%6,t=s*.16;
 W(x,y,z,ry,()=>{if(k===0){ring('plain',0,0,.01,s*.4,t*.35,col,0,PI/2,0,12);for(let a=0;a<4;a++)quad('plain',0,0,.014,t,s*.8,col,0,0,a*PI/4);}
  else if(k===1){for(const a of [PI/4,-PI/4])quad('plain',0,0,.014,t,s*.9,col,0,0,a);}
  else if(k===2){for(const a of [PI/5,-PI/5])quad('plain',a>0?-s*.17:s*.17,-s*.025,.014,t,s*.65,col,0,0,a);}
  else if(k===3){for(const dy of [-.22,.12])quad('plain',0,dy*s+t/2,.014,s*.8,t,col);}
  else if(k===4){for(let a=0;a<3;a++){const r=s*.38;const A=a*TAU/3+PI/2,B=(a+1)*TAU/3+PI/2;const ax=Math.cos(A)*r,ay=Math.sin(A)*r,bx=Math.cos(B)*r,by=Math.sin(B)*r;beam('plain',[ax,ay,.01],[bx,by,.01],t,col);}}
  else {ring('plain',0,0,.01,s*.38,t*.35,col,0,PI/2,0,12);quad('plain',0,0,.014,t*1.2,t*1.2,col);}});}
/* ---------------------------------------------------------------- fire and smoke */
/* a fire ring of stones on the floor, embers, the smoke (93-anim.js) and a lit point (91n-night.js) */
function fgHearth(x,z,C,o){o=o||{};const r=o.r==null?.55:o.r,n=7,col=fgCol('stoneD',C);for(let k=0;k<n;k++){const a=k*TAU/n+rr(-.1,.1);ellip('stone',x+Math.cos(a)*r,.08,z+Math.sin(a)*r,.18,.11,.15,col,a,5);}
 box('stoneD',x,0,z,r*1.5,.04,r*1.5,P('peat'));if(!C.worn||o.lit){for(let k=0;k<3;k++)ellip('glow',x+rr(-.2,.2),.08,z+rr(-.2,.2),.1,.05,.08,hc(0xff6a20),rr(0,PI),4);smokeAt(x,.4,z,{r:.3});haloAt(x,.45,z,0xff8a30,true);}}
/* the smoke hole's hood on the ridge: a fan blade of scrap on two poles over the hole, its top at y top */
function fgHood(x,rid,top,C){const pc=fgCol('pole',C);for(const s of [-1,1])pole('pole',[x+s*.35,rid-.1,0],[x+s*.35,top-.06,0],.04,pc,5);box('scrap',x,top-.06,0,1,.05,.8,fgCol('scrap',C),0,.08);smokeAt(x,top+.2,0,{r:.25});}
/* ---------------------------------------------------------------- furniture */
function fgDim(key){const A=typeof KratorFurniture!=='undefined'&&KratorFurniture.FURN_BY_KEY[key];return A?KratorFurniture.entryDims(A,0):{w:1,d:1,h:1};}
/* y null: on the floor (the plinth's top, .06) */
function fgFurn(key,x,y,z,ry,o){return FURNISH(key,x,y==null?.06:y,z,ry==null?0:ry,o);}
/* a piece against the back wall (its back to -z at zb), or the side walls (xs = -1 left, +1 right, its back to the wall at xw) */
function fgFurnBack(key,x,zb,o,y){const d=fgDim(key);return fgFurn(key,x,y,zb+d.d/2+.05,0,o);}
function fgFurnSide(key,xs,xw,z,o,y){const d=fgDim(key);return fgFurn(key,xw-xs*(d.d/2+.05),y,z,xs<0?PI/2:-PI/2,o);}
/* ---------------------------------------------------------------- the house shell (the stand-ins' `house` form) */
/* plinth, four walls, the turf roof, the plate doors: B the box ({w, d, h}), doors [[x, w, h], ...] in the front wall.
   The walls stand to h * .55 (the stand-ins' eave), the ridge roll's crown at h. Returns the frame the builder furnishes:
   {hw, hd, th, wh, rid, x0, x1, z0, z1 (the room's inner faces), zf (the front wall's middle)} */
function fgShell(B,C,o){o=o||{};const hw=B.w/2,hd=B.d/2,th=o.th==null?.7:o.th,wh=o.wh==null?B.h*.55:o.wh,rid=B.h-.22,zf=hd-th/2-(o.setback==null?0:o.setback);
 fgPlinth(-hw,hw,-hd,hd,C);
 const doors=o.doors||[[0,.95,1.8]],gaps=doors.map(d=>[d[0]-d[1]/2,d[0]+d[1]/2,d[2]]);
 if(o.setback){W(0,0,-o.setback/2,0,()=>fgWalls(hw,hd-o.setback/2,th,wh,C,gaps,{openLeft:true,openRight:true}));const col=fgCol('stone',C);
  for(const s of [-1,1])fgWall(s*(hw-th/2),-hd+th,s*(hw-th/2),hd,th,0,wh,C,col);}
 else fgWalls(hw,hd,th,wh,C,gaps);
 fgRoof(hw,hd,wh,rid,C,o.roof);
 doors.forEach((d,i)=>fgDoor(d[0],zf,d[1],d[2],C,{rust:o.rust,name:i?'a side door':'the house door'}));
 if(C.worn)fgRubble(rr(-hw*.6,hw*.6),hd+.02,4,C);
 return {hw,hd,th,wh,rid,zf,x0:-hw+th,x1:hw-th,z0:-hd+th,z1:hd-th-(o.setback==null?0:o.setback)};}
/* a family's slogan, by the house's seed (the union's words kept, PLAN.md 1.3) */
const FG_SLOGANS=['NO SKABS','ALL OUT','HOLD FAST','STAND','OWT FOR NOWT','ONE OUT ALL OUT','NO SKABS'];
function fgSlogan(){return pick(FG_SLOGANS);}
/* a few fallen stones at a wall's foot (the worn state) */
function fgRubble(x,z,n,C){const col=fgCol('stone',C);for(let k=0;k<n;k++)ellip('stone',x+rr(-1,1),.05,z+rr(-.08,.08),rr(.12,.2),rr(.08,.14),rr(.1,.16),col,rr(0,PI),6);}
