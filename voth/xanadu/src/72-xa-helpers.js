// ================================================================= XANADU — registry + structural helpers (prefix xn)
// The Xanadu kit reuses the Iziz Vernacular registry (VERN, 69c) so that one placer (VERN.place), one inspector and
// one set of building blocks (vB vPst vnWin vnDoor vnGableRoof …) serve every kit. XA.def adds the kit's own
// fields: FAMILY (the showcase row) and the tags culture:'xanadu', kit:'xanadu'.
//
// Local frame as in the vernacular set: origin at the plot centre on the ground, +z is the FRONT (the door side),
// y up, metres; a builder never touches world coordinates.
//
// SITING ON A SLOPE (project brief: "the terrain is hilly, buildings should still read well on an incline"). Every
// def placed with o.drop = D metres gets a battered rubble FOOTING from y = -D up to y = 0 under its plot before the
// builder runs (xnFooting), so a building set on a hillside with its base at the uphill grade shows a closed,
// leaning stone base on the downhill side instead of a floating slab. A def may give its own footing footprint as
// fw/fd (default 92% of w/d). The hillside row in the showcase (82-xa-hill.js) uses this on every house.
const XA={
 def(D){D.tags=Object.assign({culture:'xanadu',kit:'xanadu'},D.tags||{});D.family=D.family||'misc';D.kit='xanadu';D.nv=D.nv||(D.tags.wealth==='civic'?3:5);   // variants a def offers (o.v)
  const inner=D.build;D.build=function(G,o){if(o&&o.drop>0){xnFooting(0,0,D.fw||D.w*.92,D.fd||D.d*.92,0,o.drop);}inner(G,o);};return VERN.def(D);},
 keys(){return VERN.order.filter(k=>VERN.defs[k].kit==='xanadu');},
 // families in definition order: [{family, keys:[…]}]
 families(){const out=[],idx={};for(const k of XA.keys()){const f=VERN.defs[k].family;if(idx[f]===undefined){idx[f]=out.length;out.push({family:f,keys:[]});}out[idx[f]].keys.push(k);}return out;},
};
// Place a whole sub-building (another def) inside the builder that is running — a compound, the hillside, a farm
// with its farmhouse. (lx,ly,lz,lry) are in the CURRENT builder's local frame.
function xnSub(key,lx,ly,lz,lry,o){const P=VERN.cur;const s=P.o.scale||1;const p=loc(P.x,P.z,lx*s,lz*s,P.ry);
 const saveK=KXF,saveO=KOFF.slice();KXF=null;
 const G=VERN.place(P.G.parent||scene,key,p[0],p[1],P.ry+(lry||0),Object.assign({},o||{},{y:(P.o.y||0)+ly*s,scale:s*((o&&o.scale)||1)}));
 KXF=saveK;KOFF=saveO;VERN.cur=P;return G;}
const xLit=()=>vLit();
const xPick=vPick;
// the variant index of the running build (0, 1, 2): reseed(N+v) changes every pick; builders also switch structure on it
const xV=o=>(o&&o.v)|0;

// ---------------------------------------------------------------- vectors in the local frame
const xRot=(ry,v)=>[v[0]*Math.cos(ry)+v[2]*Math.sin(ry),v[1],-v[0]*Math.sin(ry)+v[2]*Math.cos(ry)];
const xAdd=(a,b,k)=>[a[0]+b[0]*(k===undefined?1:k),a[1]+b[1]*(k===undefined?1:k),a[2]+b[2]*(k===undefined?1:k)];
const xNorm=v=>{const L=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/L,v[1]/L,v[2]/L];};
const xCross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
// An item placed with a full basis: its local x along X, its local z (a plane's face) toward Z.
function xnOri(item,P,X,Z,s,c){const x=xNorm(X);let y=xNorm(xCross(Z,x));const z=xCross(x,y);
 const m=new THREE.Matrix4().makeBasis(new THREE.Vector3(...x),new THREE.Vector3(...y),new THREE.Vector3(...z));
 kput(item,P,new THREE.Quaternion().setFromRotationMatrix(m),s,c||null);}
// a member from a to b (local points), section w x t, lying flat against a surface whose normal is N
function xnMember(item,a,b,w,t,N,c){const X=[b[0]-a[0],b[1]-a[1],b[2]-a[2]];const L=Math.hypot(...X);xnOri(item,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],X,N,[L,w,t],c);}
// local point on a face: (x,z,ry) is the face frame (ry = outward direction), u along the face, y up, o out
const xnOn=(x,y,z,ry,u,o)=>{const p=loc(x,z,u,o||0,ry);return[p[0],y,p[1]];};
// A bracket arm (xArm: a block with one rounded edge) out of a face at (x,z), ry outward. y is the underside of what
// it carries; it projects `proj`, is `h` deep and `thick` wide; the rounded edge is at the outer-bottom corner (a
// console). up=true turns it into an upturned horn (rounded edge outer-top, y = its base).
function xnBracket(x,y,z,ry,proj,h,thick,c,item,up){const p=loc(x,z,0,proj/2,ry);const q=qEuler(0,ry-Math.PI/2,0);
 if(up){kput(item||'xArm',[p[0],y+h/2,p[1]],q,[proj,h,thick],c||null);}else{q.multiply(qEuler(0,0,-Math.PI/2));kput(item||'xArm',[p[0],y-h/2,p[1]],q,[h,proj,thick],c||null);}}
// the yaw that points an item's local +x at a plot corner (sx,sz) of a frame ry (for eave horns)
const xnCornerYaw=(ry,sx,sz)=>ry+Math.atan2(sx,sz)-Math.PI/2;

// ---------------------------------------------------------------- walls: the battered mass
// A wall block that leans in (the Tibetan batter, ~5°). kind: 'wash' | 'earth' | 'stone' (rubble) | 'dressed'.
// Picks the nearest of four batters from the block's proportions. Returns the top inset fraction k (top = w*k),
// so a storey stacked on top can be started at w*k (xnStack does this).
function xnBatterK(w,h,d){const want=1-2*h*.088/Math.min(w,d);return want>.94?.96:want>.89?.92:want>.83?.86:.8;}
function xnWall(x,y,z,w,h,d,ry,c,kind){const k=xnBatterK(w,h,d);const pre={wash:'xBatW',earth:'xBatE',stone:'xBatS',dressed:'xBatD'}[kind||'wash'];
 kput(pre+Math.round(k*100),[x,y,z],ry?qEuler(0,ry,0):null,[w,h,d],c||null);return k;}
// Storeys stacked with the batter carried through: hs = [h1,h2,…]; each storey starts where the last one's top ended.
// A thin dark reveal line marks each floor. Returns {y: top, w, d: the top's plan}.
function xnStack(x,y,z,w,d,ry,hs,c,kind,lineC){let yy=y,ww=w,dd=d;
 for(let i=0;i<hs.length;i++){const k=xnWall(x,yy,z,ww,hs[i],dd,ry,c,kind);yy+=hs[i];if(i<hs.length-1&&lineC!==false)vB('xPaint',x,yy-.08,z,ww*k+.06,.1,dd*k+.06,ry,lineC||xC(XPAL.black));ww*=k;dd*=k;}
 return{y:yy,w:ww,d:dd};}
// the twig band (penbey): a maroon box a little proud of the wall top, white lines above and below, gold roundels
// along the front if o.gold
function xnBand(x,y,z,w,d,ry,h,c,o){o=o||{};h=h||.7;vB('xBandB',x,y,z,w+.18,h,d+.18,ry,c||xC(xPick(XPAL.maroon)));
 vB('xPaint',x,y-.06,z,w+.3,.08,d+.3,ry,xC(XPAL.white));vB('xPaint',x,y+h-.02,z,w+.3,.08,d+.3,ry,xC(XPAL.white));
 if(o.gold){const n=Math.max(1,Math.round(w/2.6));for(let i=0;i<n;i++){const p=loc(x,z,-w/2+w*(i+.5)/n,d/2+.12,ry);kput('xDiscG',[p[0],y+h/2,p[1]],qEuler(0,ry,0).multiply(qEuler(Math.PI/2,0,0)),[h*.32,.06,h*.32],xC(xPick(XPAL.gold)));}}}
// parapet round a roof edge: four low walls with a darker coping
function xnParapet(x,y,z,w,d,ry,h,c,capC){h=h||.6;const t=.3;
 for(const s of[-1,1]){let p=loc(x,z,0,s*(d/2-t/2),ry);vB('xWashB',p[0],y,p[1],w,h,t,ry,c);p=loc(x,z,s*(w/2-t/2),0,ry);vB('xWashB',p[0],y,p[1],t,h,d,ry,c);}
 vB('xPaint',x,y+h,z,w+.04,.08,d+.04,ry,capC||(c?c.clone().multiplyScalar(.7):xC(0x8a7a6a)));}
// a flat roof: the slab with its mud top, the twig band under it (o.band = colour or true), timber corbel eave
// (o.eave), parapet (o.parapet height, false for none), a finial at each corner (o.corner: 'gold' | 'flag' |
// 'pinnacle'). Returns the parapet top.
function xnFlatRoof(x,y,z,w,d,ry,c,o){o=o||{};let yy=y;
 if(o.eave)xnEave(x,yy-.55,z,w,d,ry,o.eaveC||xC(xPick(XPAL.timber)),.5);
 if(o.band){xnBand(x,yy-.75,z,w,d,ry,.75,o.band===true?null:o.band,{gold:o.gold});}
 vB('xWashB',x,yy,z,w+.24,.3,d+.24,ry,c);yy+=.3;vB('xEarthB',x,yy,z,w-.5,.05,d-.5,ry,xC(0x9a8462));
 const ph=o.parapet===false?0:(o.parapet||.6);if(ph)xnParapet(x,yy,z,w+.24,d+.24,ry,ph,c);
 if(o.corner){for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2-.1),sz*(d/2-.1),ry);
  if(o.corner==='gold'){vB('xPaint',p[0],yy+ph,p[1],.5,.3,.5,ry,xC(XPAL.white));vBall('xGold',p[0],yy+ph+.55,p[1],.26,xC(xPick(XPAL.gold)));}
  else if(o.corner==='flag'){xnFlagpole(p[0],yy+ph-.1,p[1],2.6+rng(),xC(xPick(XPAL.cloth)));}
  else{vB('xWashB',p[0],yy+ph,p[1],.5,.6,.5,ry,c);kput('xConeP',[p[0],yy+ph+.6,p[1]],null,[.28,.5,.28],xC(XPAL.red));}}}
 return yy+ph;}
// stepped timber corbels under a lintel or an eave along ONE face: (x,z,ry) the face centre, y the underside of what
// they carry, w the run, n the count. Each corbel steps out in two painted blocks with a curved arm on the lower one.
function xnCorbels(x,y,z,ry,w,n,c,s){s=s||1;c=c||xC(xPick(XPAL.timber));const acc=xC(xPick([XPAL.red,XPAL.blue,XPAL.turquoise]));
 for(let i=0;i<n;i++){const u=-w/2+w*(i+.5)/n;const p=loc(x,z,u,.2*s,ry);vB('xPaint',p[0],y-.22*s,p[1],.32*s,.22*s,.4*s,ry,c);
  const q=loc(x,z,u,.12*s,ry);vB('xPaint',q[0],y-.42*s,q[1],.26*s,.2*s,.24*s,ry,acc);
  const r=loc(x,z,u,0,ry);xnBracket(r[0],y-.42*s,r[1],ry,.4*s,.26*s,.22*s,c,'xArm',true);}}
// timber eave all round a mass: corbels on all four faces under a projecting plank cornice (the rich / sacred eave)
function xnEave(x,y,z,w,d,ry,c,out){out=out||.5;c=c||xC(xPick(XPAL.timber));
 for(const s of[1,-1]){let p=loc(x,z,0,s*d/2,ry);xnCorbels(p[0],y+.45,p[1],ry+(s>0?0:Math.PI),w-.6,Math.max(2,Math.round(w/1.1)),c);
  p=loc(x,z,s*w/2,0,ry);xnCorbels(p[0],y+.45,p[1],ry+s*Math.PI/2,d-.6,Math.max(2,Math.round(d/1.1)),c);}
 vB('vWood',x,y+.45,z,w+2*out,.14,d+2*out,ry,c);vB('xPaint',x,y+.59,z,w+2*out-.1,.1,d+2*out-.1,ry,xC(XPAL.red));}
// the trapezoid window: black surround wider at the sill, a painted frame, a timber lintel on little corbels, a
// pleated valance hung from it. (x,z) ON the face, ry outward. kind as vnWin. o: {valC, shutters, noVal}
function xnTibWin(x,y,z,ry,w,h,kind,frameC,o){o=o||{};frameC=frameC||xC(xPick(XPAL.trim));const N=xRot(ry,[0,0,1]),blk=xC(XPAL.black);
 vnWin(x,y,z,ry,w,h,kind||'glass','xPaint',frameC,!!o.shutters);
 for(const s of[-1,1]){const a=xnOn(x,y-.25,z,ry,s*(w/2+.42),.05),b=xnOn(x,y+h+.15,z,ry,s*(w/2+.22),.05);xnMember('xPaint',a,b,.3,.06,N,blk);}
 const hp=loc(x,z,0,.06,ry);vB('xPaint',hp[0],y+h+.15,hp[1],w+.9,.26,.06,ry,blk);vB('xPaint',hp[0],y-.32,hp[1],w+1.0,.12,.1,ry,blk);
 const lp=loc(x,z,0,.16,ry);vB('vWood',lp[0],y+h+.41,lp[1],w+1.1,.16,.3,ry,xC(xPick(XPAL.timber)));xnCorbels(x,y+h+.41,z,ry,w+.5,Math.max(2,Math.round((w+.5)/.45)),xC(xPick(XPAL.timber)),.5);
 if(!o.noVal){const v=loc(x,z,0,.3,ry);kput('xValance',[v[0],y+h+.16,v[1]],qEuler(0,ry,0),[w+1.0,.5,1],o.valC||xC(xPick([XPAL.white,XPAL.white,XPAL.saffron,XPAL.red,XPAL.blue])));}}
// a painted timber column with the Tibetan bow-shaped bracket capital. r = half-width.
function xnCol(x,y,z,h,r,ry,c,capC){c=c||xC(xPick(XPAL.red));capC=capC||xC(xPick([XPAL.blue,XPAL.turquoise,XPAL.saffron]));r=r||.18;ry=ry||0;
 vB('vStone',x,y-.05,z,r*3,.16,r*3,ry,xC(xPick(XPAL.stone)));vB('xPaint',x,y+.1,z,r*2,h-.72,r*2,ry,c);
 vB('xPaint',x,y+h-.62,z,r*3.2,.2,r*2.2,ry,capC);vB('xPaint',x,y+h-.42,z,r*5.2,.24,r*2.4,ry,c);vB('xPaint',x,y+h-.18,z,r*7.2,.18,r*2.6,ry,capC);
 for(const s of[-1,1]){const p=loc(x,z,s*r*2.6,0,ry);xnBracket(p[0],y+h-.42,p[1],ry+s*Math.PI/2,r*1.6,.24,r*2.2,capC,'xArm',true);}}
// an entrance portico: columns carrying a corbelled flat roof with a parapet, a valance across the front
function xnPortico(x,y,z,ry,w,d,h,c,o){o=o||{};const P=(u,v)=>loc(x,z,u,v,ry);const cols=Math.max(2,Math.round(w/2.6));
 for(let i=0;i<=cols;i++){const p=P(-w/2+w*i/cols,d-.3);xnCol(p[0],y,p[1],h-.6,.18,ry,o.colC,o.capC);}
 const rc=P(0,d/2);vB('vWood',rc[0],y+h-.6,rc[1],w+.4,.2,d+.2,ry,xC(xPick(XPAL.timber)));
 const fc=P(0,d);xnCorbels(fc[0],y+h-.42,fc[1],ry,w,Math.max(3,Math.round(w/.7)),xC(xPick(XPAL.timber)),.7);
 vB('xWashB',rc[0],y+h-.4,rc[1],w+.7,.4,d+.5,ry,c);xnParapet(rc[0],y+h,rc[1],w+.7,d+.5,ry,.45,c);
 const v=P(0,d+.36);kput('xValance',[v[0],y+h-.75,v[1]],qEuler(0,ry,0),[w+.4,.55,1],o.valC||xC(xPick(XPAL.cloth)));
 if(o.band){const b=P(0,d+.28);vB('xBandB',b[0],y+h-1.15,b[1],w+.5,.5,.1,ry,xC(xPick(XPAL.maroon)));}}

// ---------------------------------------------------------------- the Turkish overhang (cumba) and the Indian bay (jharokha)
// Cumba: an upper storey oversailing the street on raked timber struts, a close row of windows along its front and
// one on each return. (x,z) the point on the wall face at the storey BASE y, ry outward; w along the face, h the
// storey, d the projection. o: {item (wall box, default vPlaster), c, beamC, winC, kind, n (windows), valC}
function xnCumba(x,y,z,ry,w,h,d,o){o=o||{};const wallC=o.c||xC(xPick(XPAL.wash)),beamC=o.beamC||xC(xPick(XPAL.timber)),winC=o.winC||xC(xPick(XPAL.trim)),T=xRot(ry,[1,0,0]);
 const bc=loc(x,z,0,d/2-.04,ry);vB('vWood',bc[0],y-.24,bc[1],w+.3,.24,d+.1,ry,beamC);vB(o.item||'vPlaster',bc[0],y,bc[1],w,h-.1,d,ry,wallC);
 const n=Math.max(2,Math.round(w/1.5));for(let i=0;i<=n;i++){const u=-w/2+w*i/n;xnMember('vWood',xnOn(x,y-1.5,z,ry,u,.02),xnOn(x,y-.3,z,ry,u,d-.2),.16,.14,T,beamC);}   // the struts
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2),d/2-.04,ry);vB('vWood',p[0],y,p[1],.16,h-.1,d+.02,ry,beamC);}
 vB('vWood',bc[0],y+h-.28,bc[1],w+.3,.18,d+.2,ry,beamC);                                                                                       // head beam
 const wn=o.n||Math.max(2,Math.round(w/1.25)),ww=Math.min(1.0,w/wn-.36),wy=y+h*.32,wh=h*.46;
 for(let i=0;i<wn;i++){const f=loc(x,z,-w/2+w*(i+.5)/wn,d-.04,ry);vnWin(f[0],wy,f[1],ry,ww,wh,o.kind||'glass','xPaint',winC,false);}
 for(const s of[-1,1]){const f=loc(x,z,s*w/2,d/2-.04,ry);vnWin(f[0],wy,f[1],ry+s*Math.PI/2,Math.min(.9,d*.55),wh,o.kind||'glass','xPaint',winC,false);}
 if(o.valC!==false){const v=loc(x,z,0,d+.06,ry);kput('xValance',[v[0],y+h-.42,v[1]],qEuler(0,ry,0),[w-.2,.4,1],o.valC||xC(xPick(XPAL.cloth)));}}
// Jharokha: a small stone oriel on curved brackets with jali screens on its three faces, a sloping chhajja eave and
// a bulb dome (o.dome: 'T' tiles | 'G' gold | 'W' white | false). (x,z) ON the face at the oriel's floor y.
function xnJharokha(x,y,z,ry,w,h,c,o){o=o||{};c=c||xC(xPick(XPAL.stone));const d=o.d||.9,jc=o.jaliC||xC(XPAL.white);
 const bc=loc(x,z,0,d/2,ry);vB('vStone',bc[0],y-.16,bc[1],w+.2,.16,d+.1,ry,c);
 const nb=Math.max(2,Math.round(w/.8));for(let i=0;i<nb;i++){const u=-w/2+.2+(w-.4)*i/(nb-1);const p=loc(x,z,u,0,ry);xnBracket(p[0],y-.16,p[1],ry,d*.9,.8,.2,c,'xArmS');}
 vB('vDarkB',bc[0],y,bc[1],w-.1,h,d-.1,ry);
 for(const f of[[0,d,0,w],[-w/2,d/2,-Math.PI/2,d],[w/2,d/2,Math.PI/2,d]]){const p=loc(x,z,f[0],f[1],ry);kput('xJali',[p[0],y+h/2,p[1]],qEuler(0,ry+f[2],0),[f[3],h,1],jc);}
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2),d,ry);vB('vStone',p[0],y,p[1],.14,h,.14,ry,c);const q=loc(x,z,s*w/2,0,ry);vB('vStone',q[0],y,q[1],.14,h,.14,ry,c);}
 vB('vStone',bc[0],y+h,bc[1],w+.2,.14,d+.1,ry,c);
 // chhajja: a thin sloping slab out from the head on all three faces
 const ch=xnOn(x,y+h+.14,z,ry,0,d+.35);kput('vStone',ch,qEuler(0,ry,0).multiply(qEuler(.35,0,0)),[w+.9,.08,.8],c);
 for(const s of[-1,1]){const e=xnOn(x,y+h+.14,z,ry,s*(w/2+.3),d/2);kput('vStone',e,qEuler(0,ry+s*Math.PI/2,0).multiply(qEuler(.35,0,0)),[d+.4,.08,.7],c);}
 if(o.dome!==false){const k=o.dome||'T';const dc=loc(x,z,0,d/2,ry);const R=Math.min(w,d+.4);vB('vStone',dc[0],y+h+.14,dc[1],w*.7,.3,d*.7,ry,c);
  kput('xBulb'+k,[dc[0],y+h+.44,dc[1]],null,[R*.45,R*.55,R*.45],k==='T'?xC(xPick(XPAL.tile)):k==='G'?xC(xPick(XPAL.gold)):xC(XPAL.white));
  vBall('xGold',dc[0],y+h+.44+R*.55+.08,dc[1],.1,xC(xPick(XPAL.gold)));}}

// ---------------------------------------------------------------- the Persian note: arches, iwans, arcades, domes
// an arch slab on a face: (x,z) ON the face, ry outward; w x h x dep; a dark plane inside the opening unless o.open
function xnArch(item,x,y,z,ry,w,h,dep,c,o){o=o||{};const p=loc(x,z,0,dep/2-.02,ry);kput(item||'xArchW',[p[0],y,p[1]],qEuler(0,ry,0),[w,h,dep],c||null);
 if(!o.open){const q=loc(x,z,0,.06,ry);vB('vDarkB',q[0],y,q[1],w*.72,h*.88,.05,ry);}}
// Iwan: a tall arched portal in a rectangular frame (pishtaq) proud of the wall, a mosaic band over the arch, a door
// in the dark of the vault, corner turrets (guldasta) if o.guldasta. (x,z) ON the wall face, ry outward.
function xnIwan(x,y,z,ry,w,h,d,c,o){o=o||{};c=c||xC(xPick(XPAL.wash));const P=(u,v)=>loc(x,z,u,v,ry);const fr=P(0,d/2);
 vB('xWashB',fr[0],y,fr[1],w,h,d,ry,c);
 const aw=w*.78,ah=h*.86;const a=P(0,d+.02);vB('vDarkB',a[0],y,a[1],aw*.72,ah*.9,.04,ry);
 kput(o.mosaic===false?'xArchW':'xArchM',[a[0],y,a[1]],qEuler(0,ry,0),[aw,ah,.14],o.mosaic===false?c:null);
 const b=P(0,d+.05);vB('xFriezeB',b[0],y+ah+.05,b[1],w-.4,Math.max(.5,(h-ah)*.55),.12,ry);
 for(const s of[-1,1]){const q=P(s*(w/2-.3),d+.05);vB('xFriezeB',q[0],y+.3,q[1],.5,ah-.3,.1,ry);}
 const dz=P(0,d+.06);vnDoor(dz[0],y,dz[1],ry,Math.min(2.2,aw*.4),Math.min(3.2,ah*.5),'vStone',xC(xPick(XPAL.stone)),xC(xPick(XPAL.dark)),false);
 vB('xPaint',fr[0],y+h,fr[1],w+.2,.14,d+.2,ry,xC(XPAL.white));
 if(o.guldasta){for(const s of[-1,1]){const t=P(s*(w/2-.4),d/2);vPst('xColS',t[0],y+h,t[1],.32,1.6,xC(xPick(XPAL.stone)));kput('xBulbT',[t[0],y+h+1.6,t[1]],null,[.5,.7,.5],xC(xPick(XPAL.tile)));vBall('xGold',t[0],y+h+2.4,t[1],.1,xC(XPAL.gold[0]));}}}
// Open iwan: a real vaulted portal, not a blind one — the pointed-arch frame geometry extruded to the full depth
// makes the tunnel (its vault and cheeks clad in mosaic), a wash pishtaq wraps it (pilasters, a lintel block, a
// frieze), a tiled floor runs through, mosaic niches sit in the cheeks. o.through leaves the back open (a portal
// into a court); else a back wall with a door closes it. (x,z) is the front face centre, ry outward, d the depth.
function xnIwanOpen(x,y,z,ry,w,h,d,c,o){o=o||{};c=c||xC(xPick(XPAL.wash));const P=(u,v)=>loc(x,z,u,v,ry);const ow=w*.72,oh=h*.8;   // the opening
 const FW=ow/.7,FH=oh/.84;const m=P(0,-d/2);kput('xArchW',[m[0],y,m[1]],qEuler(0,ry,0),[FW,FH,d],c);            // the tunnel: the arch frame extruded to the depth
 const fc=P(0,.02);kput(o.item||'xArchM',[fc[0],y,fc[1]],qEuler(0,ry,0),[FW,FH,.16],null);                          // its mosaic face
 // the vault and cheeks clad in mosaic: two planes on the cheeks, a fan of panels following the arch's curve
 const spring=.7/1.35*FH,ax=[Math.sin(ry),0,Math.cos(ry)];for(const s of[-1,1]){const q=P(s*(ow/2-.04),-d/2);vB('xMosAB',q[0],y,q[1],.06,spring,d-.1,ry,null);}
 const bz=t=>{const u=1-t;return [u*u*(-.35)+2*u*t*(-.35)+0,u*u*.7+2*u*t*(.7+.7*.44)+t*t*(.7+.7*.62)];};   // the arch curve in shape space (left half)
 const N=6;for(const s of[-1,1])for(let k=0;k<N;k++){const a=bz(k/N),b=bz((k+1)/N);const A=P(s*a[0]*FW,-d/2),B=P(s*b[0]*FW,-d/2);
  xnMember('xMosBB',[A[0],y+a[1]/1.35*FH-.03,A[1]],[B[0],y+b[1]/1.35*FH-.03,B[1]],.08,d-.1,ax,null);}
 for(const s of[-1,1]){const q=P(s*(w/2-(w-FW)/4),-d/2);vB('xWashB',q[0],y,q[1],(w-FW)/2+.02,h,d,ry,c);}       // the pilasters
 const t=P(0,-d/2);vB('xWashB',t[0],y+FH-.02,t[1],FW+.04,h-FH+.02,d,ry,c);vB('xPaint',t[0],y+h,t[1],w+.2,.14,d+.2,ry,xC(XPAL.white));
 const f=P(0,.05);vB('xFriezeB',f[0],y+FH+.2,f[1],w-.6,Math.max(.5,(h-FH)*.55),.12,ry);for(const s of[-1,1]){const q=P(s*(w/2-.3),.05);vB('xFriezeB',q[0],y+.3,q[1],.5,FH-.3,.1,ry);}
 vB('xTilesB',m[0],y-.04,m[1],ow-.1,.1,d-.1,ry,xC(xPick(XPAL.turquoise)));                                          // the floor through the vault
 for(const s of[-1,1])for(const v of[-d*.3,d*.3]){const q=P(s*(ow/2-.06),-d/2+v);kput('xArcDark',[q[0],y+.8,q[1]],qEuler(0,ry+s*Math.PI/2,0),[1.4,2.6,.12]);kput('xArcM',[P(s*(ow/2-.1),-d/2+v)[0],y+.8,P(s*(ow/2-.1),-d/2+v)[1]],qEuler(0,ry+s*Math.PI/2,0),[1.8,3.0,.06],null);kput('xArcDark',[P(s*(ow/2-.12),-d/2+v)[0],y+.8,P(s*(ow/2-.12),-d/2+v)[1]],qEuler(0,ry+s*Math.PI/2,0),[1.4,2.6,.1]);}   // the niches
 if(!o.through){const b=P(0,-d+.2);vB('xWashB',b[0],y,b[1],ow,oh,.4,ry,c);vnDoor(P(0,-d+.4)[0],y,P(0,-d+.4)[1],ry,Math.min(2.2,ow*.4),Math.min(3.2,oh*.5),'vStone',xC(xPick(XPAL.stone)),xC(xPick(XPAL.dark)),false);}
 if(o.lamps)for(const s of[-1,1]){const q=P(s*(ow/2-.5),-d/2);vBall('vBulb',q[0],y+oh*.6,q[1],.1);}
 if(o.guldasta){for(const s of[-1,1]){const t=P(s*(w/2-.4),-d/2);vPst('xColS',t[0],y+h,t[1],.32,1.6,xC(xPick(XPAL.stone)));kput('xBulbT',[t[0],y+h+1.6,t[1]],null,[.5,.7,.5],xC(xPick(XPAL.tile)));vBall('xGold',t[0],y+h+2.4,t[1],.1,xC(XPAL.gold[0]));}}}
// arcade: n pointed arches along a face, a dark bay behind each (or open if o.open), a thin cornice on top
function xnArcade(x,y,z,ry,w,h,n,item,c,dep,o){o=o||{};dep=dep||.5;const bw=w/n;
 for(let i=0;i<n;i++){const u=-w/2+bw*(i+.5);const p=loc(x,z,u,0,ry);xnArch(item||'xArchS',p[0],y,p[1],ry,bw,h,dep,c,{open:o.open});}
 const t=loc(x,z,0,dep/2,ry);vB('vStone',t[0],y+h,t[1],w+.2,.16,dep+.2,ry,c||xC(xPick(XPAL.stone)));}
// a dome on a drum: drum windows, the dome (kind 'T' tiles | 'G' gold | 'W' white | 'M' mosaic | 'S' stone), gold finial.
// Returns the tip y. o: {drum (height), drumItem, drumC, c (dome tint), win (drum windows), fin (finial height)}
function xnDome(x,y,z,r,kind,o){o=o||{};let yy=y;kind=kind||'T';const dc=o.c||(kind==='T'?xC(xPick(XPAL.tile)):kind==='G'?xC(xPick(XPAL.gold)):kind==='W'?xC(xPick(XPAL.wash)):null);
 if(o.drum){kput(o.drumItem||'xDrumW',[x,yy,z],null,[r*.92,o.drum,r*.92],o.drumC||xC(xPick(XPAL.wash)));
  if(o.win!==false)for(let k=0;k<8;k++){const a=k/8*TAU+Math.PI/8;const p=loc(x,z,0,r*.92,a);xnArch('xArchS',p[0],yy+o.drum*.2,p[1],a,r*.4,o.drum*.62,.16,xC(xPick(XPAL.stone)));}
  vB('xFriezeB',x,yy+o.drum-.5,z,r*1.9,.5,r*1.9,0);yy+=o.drum;}
 kput('xDome'+kind,[x,yy,z],null,[r,r*1.25,r],dc);yy+=r*1.25;
 const fh=o.fin===undefined?r*.6:o.fin;if(fh){vPst('xColG',x,yy-.1,z,.06,fh*.6,xC(XPAL.gold[0]));vBall('xGold',x,yy+fh*.5,z,Math.max(.12,r*.09),xC(xPick(XPAL.gold)));kput('xConeG',[x,yy+fh*.55,z],null,[.08,fh*.5,.08],xC(XPAL.gold[0]));}
 return yy+fh;}
// chhatri / garden kiosk: columns on a plinth under a bulb dome; r = column-circle radius
function xnChhatri(x,y,z,r,h,c,domeC,n){n=n||6;c=c||xC(xPick(XPAL.stone));vB('vStone',x,y,z,r*2.4,.3,r*2.4,0,c);
 for(let k=0;k<n;k++){const a=k/n*TAU;vPst('xColS',x+Math.sin(a)*r,y+.3,z+Math.cos(a)*r,.11,h-.3,c);}
 vB('vStone',x,y+h-.1,z,r*2.5,.2,r*2.5,0,c);kput('xBulb'+(domeC?'T':'W'),[x,y+h+.1,z],null,[r*1.05,r*1.2,r*1.05],domeC||xC(XPAL.white));vBall('xGold',x,y+h+.1+r*1.2+.1,z,.1,xC(XPAL.gold[0]));}

// ---------------------------------------------------------------- the gilded roof (the Tibetan "gyaphib") and pavilions
// a gilt hip roof with flared corners on a painted timber frame with corbels, a row of gold bells along the ridge;
// on a rooftop or over a shrine. (x,y,z) the base of the frame (o.frame = its height, 0 for none); returns the ridge y.
function xnGiltRoof(x,y,z,w,d,ry,o){o=o||{};const g=xC(xPick(XPAL.gold)),tim=xC(xPick(XPAL.red)),fh=o.frame===undefined?1.2:o.frame,rise=o.rise||Math.min(w,d)*.36,over=o.over||1.0;
 if(fh){for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2-.2),sz*(d/2-.2),ry);xnCol(p[0],y,p[1],fh,.16,ry,tim);}
  const nx=Math.round(w/1.6);for(let i=1;i<nx;i++)for(const s of[-1,1]){const p=loc(x,z,-w/2+w*i/nx,s*(d/2-.2),ry);xnCol(p[0],y,p[1],fh,.14,ry,tim);}
  vB('vWood',x,y+fh-.2,z,w+.4,.2,d+.4,ry,tim);xnEave(x,y+fh-.65,z,w,d,ry,tim,over-.3);}
 const ry0=y+fh;vnHipRoof('xHipG',x,ry0+.35,z,w,d,rise,ry,g,over);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2+over-.4),sz*(d/2+over-.4),ry);kput('xArmG',[p[0],ry0+.3,p[1]],qEuler(0,xnCornerYaw(ry,sx,sz),0),[1.2,.8,.34],g);}
 const top=ry0+.35+rise,L=Math.max(w,d)-Math.min(w,d);const n=Math.max(1,Math.round(L/1.8)+1);
 for(let i=0;i<=n;i++){const t=(i/n-.5)*L*.9;const p=w>=d?loc(x,z,t,0,ry):loc(x,z,0,t,ry);kput('xBulbG',[p[0],top-.05,p[1]],null,[.28,.42,.28],g);}
 vB('xGoldB',x,top-.12,z,w>=d?L+.8:.34,.18,w>=d?.34:L+.8,ry,g);
 return top;}
// an open pavilion on painted columns under a tiled hip roof (gardens, rooftops); o.gilt = a gilt roof instead
function xnPavilion(x,y,z,w,d,h,ry,o){o=o||{};const c=o.c||xC(xPick(XPAL.red)),tile=o.tileC||xC(xPick(XPAL.tile)),over=o.over||.9;
 vB('vStone',x,y,z,w+1,.3,d+1,ry,xC(xPick(XPAL.stone)));y+=.3;
 if(o.gilt)return xnGiltRoof(x,y,z,w,d,ry,{frame:h,rise:o.rise,over});
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2-.2),sz*(d/2-.2),ry);xnCol(p[0],y,p[1],h,.15,ry,c);}
 vB('vWood',x,y+h-.2,z,w+.3,.2,d+.3,ry,c);vnHipRoof('xHipT',x,y+h+.3,z,w,d,Math.min(w,d)*.32,ry,tile,over);
 for(const sx of[-1,1])for(const sz of[-1,1]){const p=loc(x,z,sx*(w/2+over-.35),sz*(d/2+over-.35),ry);kput('xArm',[p[0],y+h+.15,p[1]],qEuler(0,xnCornerYaw(ry,sx,sz),0),[.9,.6,.3],xC(XPAL.saffron));}
 vBall('xGold',x,y+h+.3+Math.min(w,d)*.32+.1,z,.2,xC(xPick(XPAL.gold)));return y+h+.3+Math.min(w,d)*.32;}

// ---------------------------------------------------------------- pennants, poles, shrines, roundels
// a line of small pennants from a to b (local points), n of them, alternating XPAL.cloth
function xnPennants(a,b,n,cols){cols=cols||XPAL.cloth;vBeam(a,b,.03,xC(0x6a5a48),'vRope');
 for(let k=0;k<n;k++){const t=(k+.5)/n;const p=[lerp(a[0],b[0],t),lerp(a[1],b[1],t)-.22,lerp(a[2],b[2],t)];const yaw=Math.atan2(b[0]-a[0],b[2]-a[2])+Math.PI/2;
  kput('xPaintPl',p,qEuler(0,yaw,0),[.34,.42,1],xC(cols[k%cols.length]));}}
// a flagpole with a long banner
function xnFlagpole(x,y,z,h,c){vPst('vPost',x,y,z,.07,h,xC(0x5a4632));vBall('xGold',x,y+h+.1,z,.1,xC(XPAL.gold[0]));
 kput('xPaintPl',[x+.02,y+h-1.1,z+.3],qEuler(0,Math.PI/2,0),[.55,2.0,1],c||xC(xPick(XPAL.cloth)));}
// a gold roundel (the sun-and-moon) on a face
function xnRoundel(x,y,z,ry,dia){const p=loc(x,z,0,.08,ry);kput('xSun',[p[0],y,p[1]],qEuler(0,ry,0),[dia,dia,1],null);}
// a wayside shrine (stepped base, a white dome, a square harmika, a gold spire of rings, a sun-and-moon)
function xnShrine(x,y,z,s,c){s=s||1;c=c||xC(XPAL.white);const st=xC(xPick(XPAL.stone));
 for(let k=0;k<3;k++)vB('vStone',x,y+k*.32*s,z,(2.6-k*.4)*s,.32*s,(2.6-k*.4)*s,0,st);const b=y+.96*s;
 vB('xWashB',x,b,z,1.7*s,.5*s,1.7*s,0,c);kput('xDomeW',[x,b+.5*s,z],null,[.95*s,1.0*s,.95*s],c);
 vB('xPaint',x,b+1.45*s,z,.6*s,.45*s,.6*s,0,xC(XPAL.red));vB('xPaint',x,b+1.9*s,z,.72*s,.1*s,.72*s,0,xC(XPAL.saffron));
 for(let k=0;k<7;k++)vB('xGoldB',x,b+2.0*s+k*.17*s,z,(.62-k*.07)*s,.12*s,(.62-k*.07)*s,0,xC(xPick(XPAL.gold)));
 vBall('xGold',x,b+3.3*s,z,.14*s,xC(XPAL.gold[0]));xnRoundel(x,b+3.62*s,z+.3*s,0,.4*s);}
// a stair of solid stone steps rising toward -z of ry from (x,z) (the foot of the flight); returns the run
function xnFlight(x,y,z,ry,w,rise,item,c){const n=Math.max(2,Math.round(rise/.17)),tr=.34;for(let k=0;k<n;k++){const p=loc(x,z,0,-(k+.5)*tr,ry);vB(item||'vStone',p[0],y,p[1],w,rise*(k+1)/n,tr+.01,ry,c);}return n*tr;}
// crenellated parapet round a roof or a wall top: a low wall with merlons every ~1.3 m (o.pointed: arched caps)
function xnCrenel(x,y,z,w,d,ry,h,c,o){o=o||{};h=h||1.2;const t=.5,item=o.item||'xWashB';
 for(const s of[-1,1]){let m=loc(x,z,0,s*(d/2-t/2),ry);vB(item,m[0],y,m[1],w,h*.45,t,ry,c);m=loc(x,z,s*(w/2-t/2),0,ry);vB(item,m[0],y,m[1],t,h*.45,d,ry,c);}
 const put=(lx,lz)=>{const p=loc(x,z,lx,lz,ry);vB(item,p[0],y,p[1],.6,h,.6,ry,c);if(o.pointed)kput('xArcW',[p[0],y+h,p[1]],qEuler(0,ry,0),[.6,.4,.6],c);};
 const nx=Math.max(1,Math.round(w/1.3)),nz=Math.max(1,Math.round(d/1.3));
 for(let i=0;i<=nx;i++)for(const s of[-1,1])put(-w/2+t/2+(w-t)*i/nx,s*(d/2-t/2));
 for(let j=1;j<nz;j++)for(const s of[-1,1])put(s*(w/2-t/2),-d/2+t/2+(d-t)*j/nz);}

// ---------------------------------------------------------------- footings, terraces, gardens, water
// battered rubble footing under a plot, from y=-drop up to y=0 (the slope siting rule, see XA.def)
function xnFooting(x,z,w,d,ry,drop,c){c=c||xC(xPick(XPAL.rubble));kput('xBatS92',[x,-drop,z],ry?qEuler(0,ry,0):null,[w+drop*.3,drop,d+drop*.3],c);
 vB('vStone',x,-.16,z,w*.92+drop*.14+.2,.16,d*.92+drop*.14+.2,ry,xC(xPick(XPAL.stone)));}
// a terrace: a retaining wall of rubble with an earth top; (x,z) the centre, w x d, h high
function xnTerrace(x,y,z,w,d,ry,h,c,topC){kput('xBatS92',[x,y,z],ry?qEuler(0,ry,0):null,[w,h,d],c||xC(xPick(XPAL.rubble)));vB('xEarthB',x,y+h-.06,z,w*.94,.1,d*.94,ry,topC||xC(0x8a7a56));
 vB('vStone',x,y+h-.14,z,w*.96+.1,.14,d*.96+.1,ry,xC(xPick(XPAL.stone)));}
// trees and cypresses stand on the ground unless a y is given (terraces, roof gardens)
function xnTree(x,z,h,c,y){y=y||0;vPst('vPostB',x,y,z,.14,h*.5,xC(0x5a4632));c=c||xC(xPick(XPAL.leaf));for(let k=0;k<5;k++)kput('xLeaf',[x+rr(-.7,.7),y+h*.62+rr(-.3,.5),z+rr(-.7,.7)],qEuler(rng(),rng(),0),[rr(.9,1.4),rr(.8,1.1),rr(.9,1.4)],c.clone().multiplyScalar(rr(.85,1.1)));}
function xnCypress(x,z,h,y){y=y||0;const c=xC(xPick(XPAL.cypress));vPst('vPostB',x,y,z,.08,.6,xC(0x3a2a20));kput('xConeL',[x,y+.4,z],null,[h*.16,h,h*.16],c);kput('xConeL',[x,y+.3,z],null,[h*.2,h*.5,h*.2],c.clone().multiplyScalar(.9));}
// townsfolk at a given height (vnFolk stands them on y=0)
function xnFolk(x,y,z,n,spread){for(let i=0;i<n;i++){const px=x+rr(-spread,spread),pz=z+rr(-spread,spread);kput('figB',[px,y,pz],qEuler(0,rng()*TAU,0),1,xC(xPick([0xe8d9b8,0xa8382a,0x2aa5a0,0x6e2a2a,0xe8a030,0x1e3f8a,0xf4efe4])));kput('figH',[px,y,pz],null,1,xC(0xc9a17e));}}
// a stone-edged pool of water (y = ground); the rim sits proud, the water a little below the rim
function xnPool(x,y,z,w,d,ry,c){c=c||xC(xPick(XPAL.stone));vB('vStone',x,y,z,w+.6,.35,d+.6,ry,c);vB('xWaterB',x,y+.08,z,w,.2,d,ry,xC(XPAL.water));}
// a water channel from a to b (local [x,z]), w wide, stone edges (the chahar bagh rill)
function xnChannel(a,b,w,c,y){y=y||0;c=c||xC(xPick(XPAL.stone));const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),ry=Math.atan2(dx,dz),m=[(a[0]+b[0])/2,(a[1]+b[1])/2];
 vB('xWaterB',m[0],y,m[1],w,.12,L,ry,xC(XPAL.water));for(const s of[-1,1]){const p=loc(m[0],m[1],s*(w/2+.12),0,ry);vB('vStone',p[0],y,p[1],.24,.25,L,ry,c);}}
// a fountain: an octagonal basin, a stem, a jet and its splash
function xnFountain(x,y,z,r,c){c=c||xC(xPick(XPAL.stone));kput('xOctS',[x,y,z],null,[r,.5,r],c);kput('xOctW',[x,y+.15,z],null,[r*.9,.4,r*.9],xC(XPAL.water));
 vPst('xColS',x,y+.4,z,r*.12,.9,c);kput('xOctS',[x,y+1.3,z],null,[r*.42,.18,r*.42],c);kput('xOctW',[x,y+1.38,z],null,[r*.38,.14,r*.38],xC(XPAL.water));
 vPst('vTankW',x,y+1.5,z,.05,1.3,xC(0xd8eef4));for(let k=0;k<10;k++){const a=k/10*TAU;vBall('vBallW',x+Math.cos(a)*r*rr(.2,.5),y+.5+rr(.1,.6),z+Math.sin(a)*r*rr(.2,.5),rr(.05,.1),xC(0xe8f4f8));}}
// a rill-and-parterre garden: four beds round a central fountain with channels, cypresses and fruit trees, low hedges
function xnCharBagh(x,y,z,w,d,ry,o){o=o||{};const P=(u,v)=>loc(x,z,u,v,ry);const hedge=xC(xPick(XPAL.leaf)).multiplyScalar(.8);
 const cw=o.channel||1.2;xnChannel(P(-w/2,0),P(w/2,0),cw);xnChannel(P(0,-d/2),P(0,d/2),cw);
 const pc=P(0,0);if(o.fountain!==false)xnFountain(pc[0],y,pc[1],o.r||2.2);
 for(const sx of[-1,1])for(const sz of[-1,1]){const bw=w/2-cw/2-1,bd=d/2-cw/2-1;const c=P(sx*(cw/2+.5+bw/2),sz*(cw/2+.5+bd/2));
  vB('xEarthB',c[0],y,c[1],bw,.12,bd,ry,xC(0x6a5a3a));vB('xPaint',c[0],y,c[1],bw,.45,.3,ry,hedge);vB('xPaint',c[0],y,c[1],.3,.45,bd,ry,hedge);   // beds with a low cross hedge
  for(let k=0;k<Math.max(2,Math.round(bw*bd/22));k++){const q=P(sx*(cw/2+.5+rr(.8,bw-.8)),sz*(cw/2+.5+rr(.8,bd-.8)));if(rng()<.35)xnCypress(q[0],q[1],rr(4,7));else xnTree(q[0],q[1],rr(3,4.5));}
  kput('xLeaf',[c[0],y+.4,c[1]],null,[.6,.5,.6],xC(xPick([0xd04a4a,0xe8a0c0,0xf0e060,0xe86030])));}}
// paving: a bed with flags on a grid (no overlaps)
function xnPave(x,z,w,d,ry,c,cell){cell=cell||2.2;c=c||xC(xPick(XPAL.stone));const nx=Math.max(1,Math.round(w/cell)),nz=Math.max(1,Math.round(d/cell));vB('vStone',x,0,z,w,.03,d,ry,c.clone().multiplyScalar(.6));
 for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const p=loc(x,z,-w/2+(i+.5)*w/nx,-d/2+(j+.5)*d/nz,ry);vB('vFlag',p[0],.03,p[1],w/nx-.08,.04+rng()*.012,d/nz-.08,ry,c.clone().multiplyScalar(rr(.9,1.06)));}}
// a yak (the valley's beast): a shaggy box, a low head with wide horns
function xnYak(x,z,ry,y){y=y||0;const c=xC(xPick([0x2a221c,0x3a2c22,0x4a3a2c,0x6a5040]));const P=(u,v)=>loc(x,z,u,v,ry);
 vB('xPaint',x,y+.55,z,.9,.9,1.9,ry,c);let p=P(0,1.15);vB('xPaint',p[0],y+.6,p[1],.5,.5,.6,ry,c);p=P(0,1.5);vB('xPaint',p[0],y+.55,p[1],.34,.3,.2,ry,c.clone().multiplyScalar(.8));
 for(const s of[-1,1]){const h=P(s*.3,1.05);kput('vConeI',[h[0],y+1.15,h[1]],vQ(ry,0,-s*1.3),[.05,.5,.05],xC(0xd8d0c0));}
 for(const sx of[-1,1])for(const sz of[-1,1]){const l=P(sx*.3,sz*.7);vPst('vPost',l[0],y,l[1],.08,.6,c);}}
// a stack of firewood / fodder on a parapet or a roof edge (the Tibetan roofline)
function xnFodder(x,y,z,w,ry,c){const q=ry?qEuler(0,ry,0):null;kput('vThatchB',[x,y+.35,z],q,[w,.7,.6],c||xC(xPick(VPAL.thatch)));}
// a wall-hung mosaic panel (item xMosA | xMosB) on a face, a thin painted frame round it
function xnMural(item,x,y,z,ry,w,h){const f=loc(x,z,0,.04,ry);vB('xPaint',f[0],y-.08,f[1],w+.16,h+.16,.06,ry,xC(XPAL.white));const p=loc(x,z,0,.08,ry);kput(item||'xMosA',[p[0],y+h/2,p[1]],qEuler(0,ry,0),[w,h,1],null);}
