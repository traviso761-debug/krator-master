// ================================================================= HYPERJUNGLE — floor
// Girder's 62-jungle.js understorey, ported onto the biome core: the dark
// floor under the hypertrees. Ferns, broad-leaf shrubs, aroids, palms and
// cycads, sub-canopy trees in the gaps, mossy boulders, mushrooms in the damp
// patches, fallen hypertree logs with their root plates and everything that
// grows on a log, lianas and moss beards on the hero boles, bracket fungi on
// their lower twenty metres; and the belt's own additions: giant tree ferns,
// stilt-rooted screwpines in the damp, heliconia / ginger clumps with their
// hanging bracts in the openings, and EPIPHYTE GARDENS (bromeliad rosettes,
// moss, hanging strands) on the hero boughs and up the boles, off the perch
// points the tree pass exports. The brook, cascade, footbridge and gates of the
// source are the host's business (its mask keeps the bed clear) and are not
// here. The floor is PLACEMENT: jittered grids with an fbm patch mask and an
// "openings" field, so it is dense thickets and stretches of open litter, not
// a sprinkle. Two LOD rings: the full mix out to ~1500 m from the origin, then
// a cheap mix of squashed cards, small ferns and card shrubs out to R, so the
// far floor is never bare. Every count scales with q; the core charges BIO.cur.
(function(){
const SP=HYPERJUNGLE.SPECIES,PAL=HYPERJUNGLE.PAL,trunkR=HYPERJUNGLE.trunkR;
const C=h=>new BIO.host.THREE.Color(h);

// ---------------------------------------------------------------- colour
// Everything handed to the core is sRGB. vary() jitters a palette entry in
// HSL -- hue by up to ±dh -- because undergrowth mixed within a tenth of a
// hue reads as one plant repeated; bright() scales the LINEAR value (a card
// texture's greys average ~0.6, so a card colour goes in 1.3-1.7x). Solids
// (rods, lobes, brackets) are untextured and lit by a sun+hemisphere of ~2:
// they take the designer's colour a shade DOWN, never a texture tint.
const _hsl={h:0,s:0,l:0};
function vary(hex,dh,ds,dl){const c=hex.isColor?hex.clone():C(hex);c.getHSL(_hsl);
 c.setHSL(((_hsl.h+rr(-dh,dh))%1+1)%1,clamp(_hsl.s+rr(-ds,ds),0,1),clamp(_hsl.l+rr(-dl,dl),.03,.97));return c;}
function bright(col,k){const c=col.isColor?col.clone():C(col);c.convertSRGBToLinear();c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return c.convertLinearToSRGB();}
function shade(hex,f){const c=hex.isColor?hex.clone():C(hex);if(f>=0)c.lerp(C(0xffffff),f);else c.lerp(C(0x120f0a),-f);return c;}
// a leaf colour from a palette set: wide hue jitter, then brightened for a card
function leafCol(set,k,dh){return bright(vary(pick(set),dh==null?.05:dh,.14,.07),k==null?1.3:k);}
// mean LINEAR colour of a canvas texture (fallback for a texture without a canvas)
function texMean(tex,fb){const im=tex&&tex.image;if(!im||!im.getContext)return fb;
 const d=im.getContext('2d').getImageData(0,0,im.width,im.height).data;let r=0,g=0,b=0,n=0;
 for(let i=0;i<d.length;i+=4*13){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
 if(!n)return fb;const c=C(0).setRGB(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();return[c.r,c.g,c.b];}
let MEAN=null;
function means(){if(MEAN)return MEAN;MEAN={trunk:texMean(HYPERJUNGLE.LIMBTEX,[.30,.21,.14]),rock:texMean(HYPERJUNGLE.ROCKTEX,[.156,.147,.127]),wood:texMean(HYPERJUNGLE.WOODTEX,[.09,.06,.035])};return MEAN;}
// the sRGB tint that renders `hex` (scaled by k) on a texture of linear mean m
function tint(hex,m,k){const c=hex.isColor?hex.clone():C(hex);c.convertSRGBToLinear();k=k==null?1:k;
 c.setRGB(Math.min(1,c.r*k/Math.max(.02,m[0])),Math.min(1,c.g*k/Math.max(.02,m[1])),Math.min(1,c.b*k/Math.max(.02,m[2])));return c.convertLinearToSRGB();}
const DEADWOOD=[0x5a4a3a,0x4a3c30,0x6a5846,0x5e4638];
const SHRUB=[0x1e3a20,0x27482a,0x305a30,0x224426,0x3a5a2c,0x2c4a3a,0x4a6a2e,0x3d5a2a];     // dark broad-leaf understorey
const PALM=[0x3a6a2e,0x467a36,0x2e5a28,0x4a7a3a,0x3f6a44,0x5a8a3a];
const AROID=[0x27482a,0x305a30,0x1e3a20,0x3a5a2c,0x4a3a4a,0x5a3a3e,0x2c5a44,0x3a6a3a];      // some burgundy undersides
const BRACKET=[0xa08464,0x8d6a5e,0xb89a70,0xd8b878,0x8a5a44,0xc89a60,0x9a7060];
const stalkTint=()=>tint(pick([0xc8b090,0xb8a080,0xd8c8a8]),means().wood,1);
const woodTint=k=>tint(pick(DEADWOOD),means().wood,k==null?1:k);
const trunkTint=(hex,k)=>tint(hex,means().trunk,k==null?1:k);
const rockTint=k=>tint(vary(pick(PAL.rock),.02,.06,.06),means().rock,k==null?rr(.32,.6):k);
const rodCol=()=>shade(vary(pick(DEADWOOD),.02,.08,.06),rr(-.45,-.2));                      // untextured: a shade down
const fungusCol=()=>shade(vary(pick(BRACKET),.03,.12,.08),rr(-.35,-.1));

// ---------------------------------------------------------------- keep-clear
// Boles (hero and impostor), saplings and logs all keep the floor off them.
// A hash of horizontal discs; a query tests only its own cell, so every disc
// is entered into every cell it (plus the largest pad) touches.
const HC=140,HASH={},PADMAX=18;
function hkey(x,z){return Math.floor(x/HC)+','+Math.floor(z/HC);}
function hadd(o){const R=o.r+PADMAX;for(let z=Math.floor((o.z-R)/HC);z<=Math.floor((o.z+R)/HC);z++)for(let x=Math.floor((o.x-R)/HC);x<=Math.floor((o.x+R)/HC);x++){const k=x+','+z;(HASH[k]||(HASH[k]=[])).push(o);}}
function blockedAt(x,z,pad){const L=HASH[hkey(x,z)];if(!L)return false;for(let i=0;i<L.length;i++){const o=L[i];if(Math.hypot(x-o.x,z-o.z)<o.r+pad)return true;}return false;}
const LOGS=[];
function logNear(x,z,pad){for(let i=0;i<LOGS.length;i++){const G=LOGS[i];if(Math.hypot(x-G.cx,z-G.cz)>G.cr+pad+20)continue;
 for(let j=0;j<G.pts.length-1;j++){const a=G.pts[j],b=G.pts[j+1];if(segDist(x,z,a.x,a.z,b.x,b.z)<Math.max(a.r,b.r)+pad)return true;}}return false;}
function segDist(px,pz,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,l2=dx*dx+dz*dz||1;const t=clamp(((px-ax)*dx+(pz-az)*dz)/l2,0,1);return Math.hypot(px-(ax+dx*t),pz-(az+dz*t));}
function okGround(x,z,pad){return !blockedAt(x,z,pad)&&!logNear(x,z,pad+.4);}

// ---------------------------------------------------------------- bole profiles
// The tree pass wrote each hero's fluted, buttressed bole into its bark bucket;
// brackets, moss and liana feet sit on THAT surface, not on the analytic
// trunkR (a buttress lobe exceeds it by half again). The bucket's vertices in
// the lower 34 m are binned by ring height and 24 angular bins. `ground` is
// the bole's footprint radius at ground level over all angles (the fins).
function boleProfile(T){const K=BIO.buckets['bark'+T.sp],P=K?K.pos:[],NB=24,rows={},rmax=trunkR(T,T.y0+3)*3;
 for(let i=0;i<P.length;i+=3){const yy=P[i+1]-T.y0;if(yy<-1||yy>34)continue;const dx=P[i]-T.x,dz=P[i+2]-T.z,d=Math.hypot(dx,dz);if(d>rmax)continue;
  const key=Math.round(yy*4);let row=rows[key];if(!row)row=rows[key]={yy:yy,r:new Float32Array(NB)};
  const b=Math.floor((((Math.atan2(dz,dx)%TAU)+TAU)%TAU)/TAU*NB)%NB;if(d>row.r[b])row.r[b]=d;}
 const rings=Object.keys(rows).map(k=>rows[k]).sort((a,b)=>a.yy-b.yy);
 rings.forEach(rw=>{for(let k=0;k<NB;k++)if(!rw.r[k]){for(let s=1;s<NB;s++){if(rw.r[(k+s)%NB]){rw.r[k]=rw.r[(k+s)%NB];break;}if(rw.r[(k-s+NB)%NB]){rw.r[k]=rw.r[(k-s+NB)%NB];break;}}if(!rw.r[k])rw.r[k]=trunkR(T,T.y0+rw.yy);}});
 let ground=0;rings.forEach(rw=>{if(rw.yy<5)for(let k=0;k<NB;k++)ground=Math.max(ground,rw.r[k]);});
 if(!rings.length)ground=trunkR(T,T.y0+2)*1.7;
 const at=function(a,yy){if(!rings.length)return trunkR(T,T.y0+yy);const ang=((a%TAU)+TAU)%TAU,fb=ang/TAU*NB,b0=Math.floor(fb)%NB,b1=(b0+1)%NB,f=fb-Math.floor(fb);
  let i=0;while(i<rings.length-2&&rings[i+1].yy<yy)i++;const A=rings[i],B=rings[Math.min(rings.length-1,i+1)];
  const t=B.yy>A.yy?clamp((yy-A.yy)/(B.yy-A.yy),0,1):0;return mix(mix(A.r[b0],A.r[b1],f),mix(B.r[b0],B.r[b1],f),t);};
 return{ground:ground,at:at,foot:function(a){return at(a,1.5);}};}

// ---------------------------------------------------------------- fields
// openings: a slow field that leaves stretches of thinner litter between the
// thickets (never bare); damp: where the mushrooms and ground moss are
function openK(x,z){return .38+.62*smooth(.32,.62,fbm(x*.0105+5,z*.0105-9,4242,2));}
function dampK(x,z){return fbm(x*.0052+21,z*.0052+13,777,2);}

// ---------------------------------------------------------------- the plants
// lv: 2 = near (full detail), 1 = mid (fewer parts), 0 = far (one or two cards)
const Y=(x,z)=>BIO.terrainH(x,z);
function frondAt(x,y,z,a,L,pitch,col){BIO.put('frond',[x,y,z],qEuler(rr(-.18,.18),-a,pitch),[L,L*rr(.85,1.05),L*rr(1.1,1.5)],col);}
function frondCrown(x,y,z,Rf,n,pitch0,pitch1,col){const a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.25,.25);frondAt(x,y,z,a,Rf*rr(.8,1.1),rr(pitch0,pitch1),bright(col,rr(.86,1.1)));}}
function card(x,y,z,s,sy,col,tilt){BIO.put('ucard',[x,y,z],qEuler(rr(-(tilt||.2),tilt||.2),rr(0,TAU),rr(-(tilt||.2),tilt||.2)),[s,sy==null?s:sy,s],col);}
function tuft(x,y,z,s,col){card(x,y+s*.3,z,s,s*.75,col||leafCol(rng()<.5?PAL.fern:SHRUB,1.4,.06),.2);}
function groundMoss(x,y,z,r){BIO.put('mossmat',[x,y+.06,z],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),r,leafCol(PAL.moss,.95,.04));}
function blooms(x,y,z,r,n,set){const c=bright(vary(pick(set||PAL.bloom),.03,.1,.08),1.15);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=r*Math.sqrt(rng()),s=rr(.14,.32);BIO.put('bloom',[x+Math.cos(a)*d,y+rr(0,.4),z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),s,c);}}

function fern(x,y,z,lv){const hc=vary(pick(PAL.fern),.06,.14,.07);
 if(lv>=1){let ty=y-.1,Rf=rr(2.2,4.8);
  const tree=lv===2&&rng()<.16;
  if(tree){const H=rr(1.5,4),r=rr(.16,.3);BIO.put('trunk',[x,y-.3,z],qUp([rr(-.08,.08),1,rr(-.08,.08)]),[r/.4,H+.3,r/.4],trunkTint(pick(DEADWOOD),.8));ty=y+H;Rf*=1.15;}
  frondCrown(x,ty,z,Rf,lv===2?ri(5,7):ri(4,5),tree?-.05:.08,tree?.35:.45,bright(hc,1.7));}
 else{frondCrown(x,y-.1,z,rr(2.5,4.5),3,.1,.4,bright(hc,1.6));}}
function shrub(x,y,z,lv,big){const hc=vary(pick(SHRUB),.07,.14,.07);
 if(lv===2||(big&&lv===1)){const Rs=rr(1.8,4)*(big?1.3:1);
  if(rng()<.4)BIO.put('lobe',[x,y-.3,z],qEuler(0,rr(0,TAU),0),[Rs,Rs*rr(.7,1.05),Rs],shade(vary(hc,.03,.1,.05),-.15));
  const n=big?3:2;for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rs*rr(.3,.7):0;card(x+Math.cos(a)*d,y+Rs*rr(.45,.7),z+Math.sin(a)*d,Rs*rr(1.5,1.9),Rs*rr(1.1,1.5),bright(vary(hc,.04,.1,.06),1.45),.25);}
  if(rng()<.3)blooms(x,y+Rs*.85,z,Rs*.7,ri(2,5));}
 else if(lv===1){const s=rr(3.5,6.5);card(x,y+s*.35,z,s,s*.75,bright(hc,1.4));if(rng()<.5)card(x+rr(-1,1),y+s*.25,z+rr(-1,1),s*.8,s*.6,bright(vary(hc,.05,.1,.06),1.4));}
 else{const s=rr(4,7);card(x,y+s*.3,z,s,s*.65,bright(hc,1.4));}}
function aroid(x,y,z,lv){const up=rng()<.45,hc=vary(pick(up?PALM:AROID),.06,.14,.07);
 if(lv>=1){const S=up?rr(4,7.5):rr(2.8,5.2),n=lv===2?ri(3,4):2,a0=rr(0,TAU);
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.4,.4),s=S*rr(.75,1.15),c=bright(vary(hc,.03,.08,.06),up?1.35:1.5);
   if(up)BIO.put('ucard',[x+Math.cos(a)*s*.22,y+s*.5,z+Math.sin(a)*s*.22],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[s*.55,s*1.05,s*.55],c);
   else BIO.put('ucard',[x+Math.cos(a)*s*.35,y+s*.3,z+Math.sin(a)*s*.35],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[s,s*.55,s],c);}
  if(up&&lv===2&&rng()<.35)blooms(x,y+S*.75,z,S*.3,ri(1,3),[0xbe4632,0xc98d2e,0xd0a848]);}
 else{const s=rr(3.5,6);card(x,y+s*.3,z,s,s*.7,bright(hc,1.4));}}
function palm(x,y,z,lv){const cyc=rng()<.3,H=cyc?rr(1.2,3):rr(5,14),r=cyc?rr(.4,.7):.18+H*.016,la=rr(0,TAU),lk=cyc?0:rr(.05,.22);
 const tx=x+Math.cos(la)*lk*H,tz=z+Math.sin(la)*lk*H,ty=y+H*(1-lk*lk*.5);
 BIO.put('trunk',[x,y-.6,z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[r/.4*1.15,H+.6,r/.4*1.15],trunkTint(pick(DEADWOOD),.9));
 const hc=vary(pick(PALM),.05,.12,.06);
 frondCrown(tx,ty,tz,cyc?rr(2.6,4.4):rr(4,7),lv===2?ri(7,8):5,cyc?.1:-.2,cyc?.45:.3,bright(hc,1.5));
 if(lv===2&&rng()<.6)frondCrown(tx,ty+.3,tz,cyc?2:3,4,.55,1.0,bright(shade(hc,.08),1.5));}
function subTree(x,y,z,lv){const H=rr(15,40),r=.3+H*.03,la=rr(0,TAU),lk=rr(0,.07),near=lv===2,vnear=near&&BIO.lodD(x,z)<300;
 const col=rng()<.5?pick(DEADWOOD):pick([0x8a7a66,0x7a6c5a,0x6a5a4a]);
 BIO.put('trunk',[x,y-1,z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[r/.4,H*.86+1,r/.4],trunkTint(col,rr(.55,.9)));
 const cx=x+Math.cos(la)*lk*H*.86,cz=z+Math.sin(la)*lk*H*.86,cy=y+H*.78,cr=H*rr(.22,.32);
 const set=pick([PAL.fern,SHRUB,PALM,PAL.vine]),hc=vary(pick(set),.06,.12,.06);
 const n=near?ri(5,7):4;
 for(let k=0;k<n;k++){const a=rr(0,TAU),d=k?cr*rr(.3,.75):0,s=cr*rr(.8,1.25);
  BIO.put('ucard',[cx+Math.cos(a)*d,cy+rr(-.35,.3)*cr,cz+Math.sin(a)*d],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s,s*.75,s],bright(vary(hc,.04,.1,.07),1.35*rr(.85,1.1)));}
 if(near){const rc=rodCol();
  if(vnear){const nb=ri(1,2);for(let b=0;b<nb;b++){const a=rr(0,TAU),d=cr*rr(.5,.9);BIO.beam('rod',[cx,cy-cr*.6,cz],[cx+Math.cos(a)*d,cy+rr(-.3,.3)*cr,cz+Math.sin(a)*d],r*.35,r*.15,rc);}}
  const nm=ri(1,2);for(let m=0;m<nm;m++){const a=rr(0,TAU),d=cr*rr(.3,.8);BIO.put('ribbon',[cx+Math.cos(a)*d,cy-cr*.2,cz+Math.sin(a)*d],qEuler(0,rr(0,TAU),0),[rr(2.5,5),rr(4,9),1.5],leafCol(PAL.moss,1.5));}
  if(rng()<.35){const a=rr(0,TAU),d=cr*rr(.4,.8),lx=cx+Math.cos(a)*d,lz=cz+Math.sin(a)*d,gx=lx+rr(-2,2),gz=lz+rr(-2,2);
   BIO.beam('rod',[lx,cy-cr*.3,lz],[gx,Y(gx,gz)-.3,gz],rr(.05,.11),rr(.05,.11),rc);}}}
function fungi(x,y,z,lv,st){const n=lv===2?ri(2,4):2,giant=rng()<.3;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.5,2.2):0,fx=x+Math.cos(a)*d,fz=z+Math.sin(a)*d,fy=Y(fx,fz);
  const cr=(giant&&i===0)?rr(1,1.9):rr(.3,.85),stk=cr*rr(.9,1.9),hc=fungusCol();
  const top=stk>.5?fy+stk:fy+.05;
  if(stk>.5)BIO.tube('wood',[{x:fx,y:fy-.25,z:fz,r:cr*.2},{x:fx+rr(-.1,.1),y:top,z:fz+rr(-.1,.1),r:cr*.16}],stalkTint(),{seg:4});
  if(giant&&i===0)BIO.put('fungus',[fx,top-.08,fz],qEuler(0,rr(0,TAU),0),[cr,cr*rr(.4,.7),cr],hc);
  else{const h=cr*rr(.45,.8),t=tint(shade(hc,.3),means().wood,1.25),ph=rr(0,TAU);
   BIO.lathe('wood',[{x:fx,y:top-.05,z:fz,yy:0,col:shade(t,-.25)},{x:fx,y:top+h*.45,z:fz,yy:.5,col:t},{x:fx,y:top+h,z:fz,yy:1,col:shade(t,.1)}],6,1,1,(R,ang)=>cr*(R.yy===0?1:R.yy<.6?.85:.12)*(1+.06*Math.sin(5*ang+ph)));}
  st.fungi++;}
 if(lv===2&&rng()<.5)groundMoss(x+rr(-1,1),y,z+rr(-1,1),rr(1.5,3));}
function boulder(x,y,z,lv,st){const n=lv===2?ri(1,2):1,Rb=rr(1.2,3.4);
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Rb*rr(.7,1.2):0,r=Rb*(i?rr(.35,.7):1),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d,by=Y(bx,bz),h=r*rr(.55,.95);
  BIO.put('boulder',[bx,by+h*.35,bz],qEuler(rr(-.25,.25),rr(0,TAU),rr(-.25,.25)),[r*rr(.9,1.3),h*.8,r*rr(.9,1.3)],rockTint());st.boulders++;
  if(lv>=1){BIO.put('mossmat',[bx+rr(-.15,.15)*r,by+h*1.08,bz+rr(-.15,.15)*r],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),r*rr(.6,.9),leafCol(PAL.moss,.95));st.moss++;}
  if(lv===2&&i===0&&rng()<.6){frondCrown(bx+r*.5,by+h*.5,bz+r*.3,rr(1.2,2.2),5,.1,.45,leafCol(PAL.fern,1.7));st.ferns++;}}}

// ---------------------------------------------------------------- the belt's own understorey
// a GIANT TREE FERN: a fibrous trunk 4-11 m, old fronds arching down, a ring
// of young ones rising, a crozier tuft, dead fronds skirting the crown
function treeFern(x,y,z,lv){const H=lv===2?rr(4,11):rr(4,8),r=.28+H*.04,la=rr(0,TAU),lk=rr(0,.05),hc=vary(pick(PAL.treefern),.05,.12,.06);
 BIO.put('trunk',[x,y-.6,z],qUp([Math.cos(la)*lk,1,Math.sin(la)*lk]),[r/.4*1.3,H+.6,r/.4*1.3],trunkTint(0x4a3a2c,.7));
 const tx=x+Math.cos(la)*lk*H,tz=z+Math.sin(la)*lk*H,ty=y+H;
 frondCrown(tx,ty-.2,tz,rr(4.5,7.5),lv===2?ri(8,11):6,-.05,.35,bright(hc,1.55));
 frondCrown(tx,ty+.3,tz,rr(3,4.5),lv===2?ri(5,7):4,.5,.95,bright(shade(hc,.1),1.6));
 if(lv===2){card(tx,ty+1.2,tz,2.2,1.8,bright(shade(hc,.25),1.5),.2);
  for(let k=0,n=ri(2,4);k<n;k++){const a=rr(0,TAU);BIO.put('ribbon',[tx+Math.cos(a)*r*1.2,ty-.6,tz+Math.sin(a)*r*1.2],qEuler(0,rr(0,TAU),0),[rr(.8,1.4),rr(2,4),1],shade(vary(0x8a7a4a,.03,.1,.06),-.2));}}}
// a SCREWPINE: a short trunk on a cone of stilt roots, heads of stiff strap
// leaves (old ones out and drooping, young ones upright), a hanging fruit head
function screwpine(x,y,z,lv){const H=rr(3,8),r=.22+H*.05,hc=vary(pick(PAL.screwpine),.04,.12,.06),tt=trunkTint(0x6a5a44,.8);
 BIO.put('trunk',[x,y+H*.3-.2,z],qUp([0,1,0]),[r/.4,H*.7+.2,r/.4],tt);
 const tc=rodCol();for(let k=0,n=lv===2?ri(5,8):4;k<n;k++){const a=k/n*TAU+rr(-.3,.3),d=H*rr(.35,.6),gx=x+Math.cos(a)*d,gz=z+Math.sin(a)*d;
  BIO.beam('rod',[x+Math.cos(a)*r*.6,y+H*rr(.28,.42),z+Math.sin(a)*r*.6],[gx,Y(gx,gz)-.4,gz],r*.32,r*.22,tc);}
 const heads=[[x,y+H,z]];
 if(H>5.5&&lv===2){const a=rr(0,TAU),fk=H*.55;heads.push([x+Math.cos(a)*H*.3,y+fk+H*.35,z+Math.sin(a)*H*.3]);BIO.beam('rod',[x,y+fk,z],heads[1],r*.7,r*.5,tt);}
 heads.forEach(h=>{const L=rr(3,5.5);frondCrown(h[0],h[1],h[2],L,lv===2?ri(9,12):6,-.35,.05,bright(hc,1.5));
  frondCrown(h[0],h[1]+.4,h[2],L*.7,lv===2?6:4,.55,1.05,bright(shade(hc,.08),1.55));
  if(lv===2&&rng()<.4)BIO.put('fungus',[h[0]+rr(-.5,.5),h[1]-.6,h[2]+rr(-.5,.5)],qEuler(Math.PI,rr(0,TAU),0),[.9,1.3,.9],shade(0xd08a3a,-.15));});}
// a HELICONIA / GINGER clump: tall paddle leaves in a loose fan, the
// inflorescences (zigzag bracts, 'bract' item) hanging off short stems
function ginger(x,y,z,lv){const hc=vary(pick(PAL.ginger),.04,.12,.06),S=rr(4,8),n=lv===2?ri(4,6):3,a0=rr(0,TAU);
 for(let k=0;k<n;k++){const a=a0+k/n*TAU+rr(-.4,.4),s=S*rr(.8,1.15);
  BIO.put('ucard',[x+Math.cos(a)*s*.22,y+s*.55,z+Math.sin(a)*s*.22],qEuler(rr(-.12,.12),a+rr(-.3,.3),rr(.1,.35)),[s*.5,s*1.1,s*.5],bright(vary(hc,.03,.08,.06),1.4));}
 if(lv===2){for(let k=0,nb=ri(1,3);k<nb;k++){const a=rr(0,TAU),d=S*rr(.1,.3),L=rr(1.6,3.2),hy=y+S*rr(.55,.85),bx=x+Math.cos(a)*d,bz=z+Math.sin(a)*d;
   BIO.beam('rod',[x,y+S*.2,z],[bx,hy,bz],.07,.05,shade(hc,-.3));
   BIO.put('bract',[bx,hy,bz],qEuler(0,rr(0,TAU),0),[L*.42,L,L*.42],bright(pick(PAL.bract),rr(.9,1.15)));}}
 else if(rng()<.5)BIO.put('bract',[x,y+S*.65,z],qEuler(0,rr(0,TAU),0),[1.1,2.4,1.1],bright(pick(PAL.bract),1));}
// a BROMELIAD: a rosette of stiff strap leaves round a coloured heart, sitting
// on a surface with unit normal n (a bough top, a bole flank)
function bromeliad(x,y,z,n,s){const hc=vary(pick(PAL.bromeliad),.04,.12,.06),q=qUp(n);
 for(let k=0,m=ri(5,8);k<m;k++){const a=k/m*TAU+rr(-.3,.3),L=s*rr(.8,1.2);
  BIO.put('frond',[x,y,z],q.clone().multiply(qEuler(0,-a,rr(.4,.85))),[L,L*.9,L*rr(1.1,1.5)],bright(vary(hc,.02,.06,.05),1.5));}
 if(rng()<.7)BIO.put('bloom',[x+n[0]*s*.25,y+n[1]*s*.25,z+n[2]*s*.25],q.clone().multiply(qEuler(0,rr(0,TAU),0)),s*.45,bright(pick(PAL.bromCentre),1.1));}
// an EPIPHYTE GARDEN on a bough perch: bromeliads and moss along the top,
// strands and moss beards hanging under it
function garden(P,near,st){const s=clamp(P.r*.9,.8,2.6),nB=near?ri(1,3):1,a0=rr(0,TAU);
 for(let k=0;k<nB;k++){const a=a0+rr(-.6,.6),ox=Math.cos(a)*P.r*.5,oz=Math.sin(a)*P.r*.5;
  bromeliad(P.x+ox,P.y+P.r*.92,P.z+oz,[ox/P.r*.4,1,oz/P.r*.4],s*rr(.8,1.2));st.epiphytes++;}
 if(rng()<.8){BIO.put('mossmat',[P.x+rr(-.3,.3)*P.r,P.y+P.r*.95,P.z+rr(-.3,.3)*P.r],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),P.r*rr(.7,1.1),leafCol(PAL.moss,.95));st.moss++;}
 if(near)for(let k=0,n=ri(1,3);k<n;k++){const a=rr(0,TAU),L=rr(3,9);
  BIO.put(rng()<.5?'strand':'ribbon',[P.x+Math.cos(a)*P.r*.9,P.y-P.r*.2,P.z+Math.sin(a)*P.r*.9],qUp([rr(-.1,.1),1,rr(-.1,.1)]).multiply(qEuler(0,rr(0,TAU),0)),[rr(.5,1.4),L,L*.12],leafCol(PAL.vine,1.4,.06));}}

// ---------------------------------------------------------------- fallen hypertrees
function facingTri(a,b,c,dir,col){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
 const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(nx*dir[0]+ny*dir[1]+nz*dir[2]>=0)BIO.tri('wood',a,b,c,col);else BIO.tri('wood',a,c,b,col);}
function buildLog(o,st,q){const n=Math.ceil(o.L/7)+1,pts=[],px=-o.hz,pz=o.hx;
 for(let i=0;i<n;i++){const t=i/(n-1),s=t*o.L,off=o.bow*Math.sin(Math.PI*t),x=o.bx+o.hx*s+px*off,z=o.bz+o.hz*s+pz*off,r=mix(o.r0,o.r1,Math.pow(t,.9));
  const g0=Y(x,z),g1=Y(x-o.hx*12,z-o.hz*12),g2=Y(x+o.hx*12,z+o.hz*12);
  pts.push({x:x,y:(g0*2+g1+g2)/4+r*.30,z:z,r:r,s:s});}
 const wm=means().wood,base=rr(.75,1.05);
 pts.forEach((p,k)=>{const m=fbm(p.x*.05+3,p.z*.05-2,55,2);
  p.col=m>.55?C(0).setRGB(base*.7,base*1.05,base*.55).convertLinearToSRGB():C(0).setRGB(base*(1-.25*m),base*(.95-.25*m),base*(.85-.2*m)).convertLinearToSRGB();});
 const seed0=rr(0,10);
 BIO.tube('wood',pts,pts[0].col,{seg:11,cap:true,capCol:shade(woodTint(1.3),-.1),rfn:(qq,ang)=>1+.05*Math.sin(3*ang+qq*.7+seed0)+.035*Math.sin(7*ang+qq*1.3)});
 // the root plate at the butt: a ragged disc of splayed dead wood, then short root tubes
 const P0=pts[0],tdir=[-o.hx,0,-o.hz],n1=[px,0,pz],rim=[],ring=[],nr=14;
 for(let i=0;i<nr;i++){const a=i/nr*TAU,rrim=o.r0*(1.15+.6*rng()),ca=Math.cos(a),sa=Math.sin(a),back=rr(.6,2.4);
  rim.push([P0.x+n1[0]*ca*rrim+tdir[0]*back,P0.y+sa*rrim,P0.z+n1[2]*ca*rrim+tdir[2]*back,i/nr*4,1]);
  ring.push([P0.x+n1[0]*ca*o.r0*.98-tdir[0]*.8,P0.y+sa*o.r0*.98,P0.z+n1[2]*ca*o.r0*.98-tdir[2]*.8,i/nr*4,0]);}
 const ctr=[P0.x+tdir[0]*2,P0.y,P0.z+tdir[2]*2,.5,.5];
 for(let i=0;i<nr;i++){const j=(i+1)%nr,a2=(i+.5)/nr*TAU,rad=[n1[0]*Math.cos(a2),Math.sin(a2),n1[2]*Math.cos(a2)];
  const dc=woodTint(rr(.55,.9)),sc=tint(pick(PAL.litter),wm,1.2);
  facingTri(ctr,rim[i],rim[j],tdir,rng()<.4?sc:dc);facingTri(ring[i],rim[i],rim[j],rad,dc);facingTri(ring[i],rim[j],ring[j],rad,dc);}
 const nroot=ri(5,7);
 for(let i=0;i<nroot;i++){const ra=i/nroot*TAU+rr(-.3,.3),cr=Math.cos(ra),sr=Math.sin(ra),RL=o.r0*rr(1,1.9),rp=[];
  for(let k=0;k<4;k++){const f=k/3,out=o.r0*.55+RL*f,bk=1.2+RL*.5*f*f;
   rp.push({x:P0.x+n1[0]*cr*out+tdir[0]*bk,y:P0.y+sr*out-RL*.25*f*f,z:P0.z+n1[2]*cr*out+tdir[2]*bk,r:o.r0*mix(.22,.04,f)});}
  BIO.tube('wood',rp,woodTint(rr(.6,.9)),{seg:5,cap:true});}
 // the splintered far end
 const Pn=pts[n-1];
 for(let i=0;i<5;i++){const sa2=rr(0,TAU),sr2=Pn.r*rr(.15,.8),bx2=Pn.x+px*Math.cos(sa2)*sr2-o.hx*1.2,by2=Pn.y+Math.sin(sa2)*sr2,bz2=Pn.z+pz*Math.cos(sa2)*sr2-o.hz*1.2,SL=rr(3,8);
  BIO.tube('wood',[{x:bx2,y:by2,z:bz2,r:Pn.r*rr(.12,.26)},{x:bx2+o.hx*SL+rr(-1.2,1.2),y:by2+rr(-.6,1.4),z:bz2+o.hz*SL+rr(-1.2,1.2),r:.05}],woodTint(rr(.7,1)),{seg:4});}
 const G={pts:pts,cx:(pts[0].x+Pn.x)/2,cz:(pts[0].z+Pn.z)/2,cr:o.L/2+o.r0,hx:o.hx,hz:o.hz,L:o.L,px:px,pz:pz};
 LOGS.push(G);st.logs++;
 const mid=pts[n>>1];
 if(typeof REGISTER==='function')REGISTER({name:'Fallen hypertree',kind:'log',label:'Fallen trunk',x:mid.x,y:mid.y-mid.r-1,z:mid.z,r:Math.min(o.L*.45,18),h:mid.r*2.2+5});
 return G;}
function logAt(G,s){const P=G.pts,f=clamp(s/G.L,0,1)*(P.length-1),i=Math.min(P.length-2,Math.floor(f)),u=f-i;
 return{x:mix(P[i].x,P[i+1].x,u),y:mix(P[i].y,P[i+1].y,u),z:mix(P[i].z,P[i+1].z,u),r:mix(P[i].r,P[i+1].r,u)};}
// what grows on a log: moss cushions and ferns along the top, brackets and moss curtains on the flanks
function dressLog(G,st,q){const near=BIO.lodD(G.cx,G.cz)<900;
 for(let s=4;s<G.L-2;s+=rr(3.5,6.5)/Math.max(.3,q)){const A=logAt(G,s);if(A.r<1)continue;
  if(rng()<.8){const lat=rr(-.4,.4)*A.r,up=Math.sqrt(Math.max(.01,A.r*A.r-lat*lat)),mr=rr(.5,.85)*A.r;
   BIO.put('mossmat',[A.x+G.px*lat,A.y+up*.97,A.z+G.pz*lat],qUp([G.px*lat/A.r,up/A.r,G.pz*lat/A.r]),mr,leafCol(PAL.moss,.95));st.moss++;}
  if(rng()<.55){const l2=rr(-.5,.5)*A.r,u2=Math.sqrt(Math.max(.01,A.r*A.r-l2*l2)),x=A.x+G.px*l2,z=A.z+G.pz*l2,y=A.y+u2-.25;
   if(rng()<.55){frondCrown(x,y,z,rr(1.4,3),near?6:4,.05,.4,leafCol(PAL.fern,1.7));st.ferns++;}
   else{const s2=rr(2,3.6);card(x,y+s2*.4,z,s2,s2*.8,leafCol(SHRUB,1.45),.3);st.shrubs++;}}
  if(rng()<.5){const sd=rng()<.5?1:-1,el=rr(.05,.7),fr=rr(.5,1.5);
   const fx=A.x+G.px*sd*A.r*Math.cos(el)*.96,fy=A.y+A.r*Math.sin(el)*.96,fz=A.z+G.pz*sd*A.r*Math.cos(el)*.96;
   if(fy>Y(fx,fz)+.4){BIO.put('fungus',[fx,fy,fz],qEuler(0,rr(0,TAU),0),[fr,fr*rr(.22,.4),fr],fungusCol());st.brackets++;}}
  if(A.r>1.8&&rng()<.4){const sd3=rng()<.5?1:-1,mx2=A.x+G.px*sd3*A.r*.98,mz2=A.z+G.pz*sd3*A.r*.98;
   BIO.put('ribbon',[mx2,A.y+A.r*.25,mz2],qFacing([G.px*sd3,0,G.pz*sd3]),[rr(2,4.5),Math.min(A.r*1.1,rr(2,5)),1],leafCol(PAL.moss,1.6));st.moss++;}}}

// ---------------------------------------------------------------- lianas
// a woody rod from a to b, and (near) a chain of short leafy strand pieces
// along it: one 'strand' stretched the whole way is a plank with two leaves
function lianaRun(a,b,r,col,leafy){BIO.beam('rod',a,b,r,r*.85,col);
 if(!leafy)return;const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),n=Math.max(1,Math.round(L/rr(6,9)));
 const q=qUp([-dx,-dy,-dz]).multiply(qEuler(0,rr(0,TAU),0)),seg=L/n;
 for(let i=0;i<n;i++){if(rng()<.3)continue;const t=i/n;BIO.put('strand',[a[0]+dx*t+rr(-.2,.2),a[1]+dy*t,a[2]+dz*t+rr(-.2,.2)],q,[rr(.5,1.1),seg*1.05,seg*.15],leafCol(PAL.vine,1.45,.06));}}

// ---------------------------------------------------------------- the pass
HYPERJUNGLE.buildFloor=function(R,q){
 reseed(600001);q=q==null?1:q;R=R||3000;means();
 const st={ferns:0,shrubs:0,aroids:0,palms:0,subtrees:0,boulders:0,fungi:0,logs:0,lianas:0,moss:0,brackets:0,tufts:0,treeferns:0,screwpines:0,gingers:0,epiphytes:0,
  tris:{ferns:0,shrubs:0,aroids:0,palms:0,subtrees:0,boulders:0,fungi:0,logs:0,logDress:0,lianas:0,moss:0,brackets:0,tufts:0,far:0,treeferns:0,screwpines:0,gingers:0,epiphytes:0}};
 const cur=()=>{const t=BIO.stats[BIO.cur||'biome'];return t?t.tris:0;};
 const charge=(k,fn)=>{const t0=cur();fn();st.tris[k]+=cur()-t0;};
 const TREES=HYPERJUNGLE.TREES||[],SAPS=HYPERJUNGLE.SAPLINGS||[],heroes=TREES.filter(T=>T.hero);
 const lodR=Math.min(1800,R*.6),nearR=650;
 for(const k in HASH)delete HASH[k];LOGS.length=0;
 // ---- keep-clear discs: hero boles on their real footprint, impostor boles, sapling stems ----
 const PROF=new Map();
 heroes.forEach(T=>{const p=boleProfile(T);PROF.set(T,p);hadd({x:T.x,z:T.z,r:p.ground+1.5,T:T});});
 TREES.forEach(T=>{if(!T.hero)hadd({x:T.x,z:T.z,r:trunkR(T,T.y0+3)*1.25+2});});
 SAPS.forEach(S=>hadd({x:S.x,z:S.z,r:S.H*(S.sp===3?.085:.032)+.9}));
 const nearHero=(x,z)=>{let m=1e9;for(const T of heroes){const d=Math.hypot(x-T.x,z-T.z)-PROF.get(T).ground;if(d<m)m=d;}return m;};

 // ---- 1. fallen hypertrees: ~1 per 250 m cell inside the hero disc, lying between the boles ----
 BIO.grid(250,60,lodR-40,(x,z,d)=>.9*q,(x,y,z,d)=>{
  for(let tr=0;tr<6;tr++){const h=rr(0,TAU),L=rr(60,160),r0=rr(1.6,3);
   const o={hx:Math.cos(h),hz:Math.sin(h),L:L,r0:r0,r1:r0*rr(.42,.58),bow:rr(-3,3)};o.bx=x-o.hx*L/2;o.bz=z-o.hz*L/2;
   let ok=true;
   for(let s=-r0*2;s<=L+4&&ok;s+=6){const t=clamp(s/L,0,1),off=o.bow*Math.sin(Math.PI*t),sx=o.bx+o.hx*s-o.hz*off,sz=o.bz+o.hz*s+o.hx*off,r=mix(r0,o.r1,t);
    if(BIO.mask(sx,sz)<=0||!BIO.clearOf(sx,sz,r+4)||blockedAt(sx,sz,r+6)||logNear(sx,sz,r+14))ok=false;}
   if(!ok)continue;
   let G;charge('logs',()=>{G=buildLog(o,st,q);});charge('logDress',()=>dressLog(G,st,q));return;}},{patch:0,pad:8});

 // ---- 2. the understorey: three rings of jittered grid ----
 // type mix (Girder's): sub-canopy tree 7 %, palm 7 %, fern ~30 %, shrub 16 %, aroid 16 %,
 // ground tuft 10 %, fungi 5.5 %, boulders 4 %, the rest shrubs
 function plant(x,y,z,d,lv){
  if(!okGround(x,z,1.2))return;
  const t=rng(),patch=fbm(x*.006-11,z*.006+5,31,2);
  if(t<.05){if(lv>=1&&nearHero(x,z)>12&&okGround(x,z,4)){charge('subtrees',()=>subTree(x,y,z,lv));st.subtrees++;}else{charge('shrubs',()=>shrub(x,y,z,lv,false));st.shrubs++;}}
  else if(t<.12){if(lv===2||rng()<.5){charge('palms',()=>palm(x,y,z,lv));st.palms++;}else{charge('ferns',()=>fern(x,y,z,lv));st.ferns++;}}
  else if(t<.155){if(okGround(x,z,3)){charge('treeferns',()=>treeFern(x,y,z,lv));st.treeferns++;}else{charge('ferns',()=>fern(x,y,z,lv));st.ferns++;}}
  else if(t<.18){if(dampK(x,z)>.45&&okGround(x,z,3)){charge('screwpines',()=>screwpine(x,y,z,lv));st.screwpines++;}else{charge('gingers',()=>ginger(x,y,z,lv));st.gingers++;}}
  else if(t<.215+.06*(openK(x,z)-.6)){charge('gingers',()=>ginger(x,y,z,lv));st.gingers++;}
  else if(t<.44+.1*(patch-.5)){charge('ferns',()=>fern(x,y,z,lv));st.ferns++;}
  else if(t<.60){const big=rng()<.2;charge('shrubs',()=>shrub(x,y,z,lv,big));st.shrubs++;}
  else if(t<.76){charge('aroids',()=>aroid(x,y,z,lv));st.aroids++;}
  else if(t<.86){charge('tufts',()=>{tuft(x,y,z,rr(2.2,4.2));if(lv===2&&rng()<.25)blooms(x,y+.5,z,1.5,ri(2,4));});st.tufts++;}
  else if(t<.915){if(dampK(x,z)>.5)charge('fungi',()=>fungi(x,y,z,lv,st));else{charge('tufts',()=>tuft(x,y,z,rr(2,3.5)));st.tufts++;}}
  else if(t<.945){charge('boulders',()=>boulder(x,y,z,lv,st));}
  else{charge('shrubs',()=>shrub(x,y,z,lv,false));st.shrubs++;}}
 // near: full detail; mid: fewer parts; both patchy, thinner (never bare) in the openings
 BIO.grid(7.4,0,nearR,(x,z,d)=>.92*openK(x,z)*q,(x,y,z,d)=>plant(x,y,z,d,2),{patch:.9,patchScale:.016,pad:1.5});
 BIO.grid(15,nearR,lodR,(x,z,d)=>mix(.6,.3,smooth(nearR,lodR,d))*openK(x,z)*q,(x,y,z,d)=>plant(x,y,z,d,1),{patch:.9,patchScale:.016,pad:1.5});
 // ground cover between the plants: squashed cards and moss in the damp, cheap, so the litter is never a lawn
 const cover=(x,y,z,s)=>{if(!okGround(x,z,.5))return;
  if(dampK(x,z)>.52&&rng()<.3){charge('moss',()=>groundMoss(x,y,z,rr(1.2,2.8)));st.moss++;}
  else{charge('tufts',()=>tuft(x,y,z,s));st.tufts++;}};
 BIO.grid(5.5,0,nearR,(x,z,d)=>.5*openK(x,z)*q,(x,y,z,d)=>cover(x,y,z,rr(1.8,3.6)),{patch:.95,patchScale:.02,pad:.5});
 BIO.grid(13,nearR,lodR,(x,z,d)=>.42*openK(x,z)*q,(x,y,z,d)=>cover(x,y,z,rr(2.2,4)),{patch:.95,patchScale:.02,pad:.5});
 // far ring: the cheap mix out to R -- big squashed cards, small ferns, card shrubs -- at a coarser cell
 BIO.grid(24,lodR,R,(x,z,d)=>mix(.7,.4,smooth(lodR,R,d))*(.55+.45*openK(x,z))*q,(x,y,z,d)=>{
  if(blockedAt(x,z,1))return;const t=rng();
  charge('far',()=>{if(t<.18){fern(x,y,z,0);st.ferns++;}else if(t<.82){tuft(x,y,z,rr(4,8));st.tufts++;}else{shrub(x,y,z,0,false);st.shrubs++;}});},{patch:.9,patchScale:.016,pad:1});

 // ---- 3. on the hero boles: bracket fungi, moss skirts and beards low down, lianas from 30-80 m up ----
 heroes.forEach((T,ti)=>{const prof=PROF.get(T),d0=BIO.lodD(T.x,T.z),lk=clamp(BIO.lod(T.x,T.z),.4,1);
  const gy0=Y(T.x,T.z);
  const nb=Math.round((d0<700?ri(10,16):ri(5,8))*q*lk);
  charge('brackets',()=>{for(let i=0;i<nb;i++){const a=rr(0,TAU),y=gy0+rr(1.5,20),Rs=prof.at(a,y-T.y0),r=rr(1.4,4.2),hc=fungusCol();
   BIO.put('fungus',[T.x+Math.cos(a)*(Rs-.15*r),y,T.z+Math.sin(a)*(Rs-.15*r)],qEuler(0,rr(0,TAU),0),[r,r*rr(.2,.36),r],hc);st.brackets++;
   if(rng()<.5){const a2=a+rr(.04,.09),y2=y+r*rr(.5,.9),R2=prof.at(a2,y2-T.y0),r2=r*rr(.5,.8);
    BIO.put('fungus',[T.x+Math.cos(a2)*(R2-.15*r2),y2,T.z+Math.sin(a2)*(R2-.15*r2)],qEuler(0,rr(0,TAU),0),[r2,r2*.3,r2],shade(hc,rr(-.1,.1)));st.brackets++;}}});
  charge('moss',()=>{
   // moss beards hanging off the bark, and moss skirts plastered on it near the ground
   const nm=Math.round(ri(10,16)*q*lk);
   for(let i=0;i<nm;i++){const a3=rr(0,TAU),y3=gy0+rr(4,26),h=rr(5,14),Rs=Math.max(prof.at(a3,y3-T.y0),prof.at(a3,y3-h-T.y0))+.3;
    BIO.put('ribbon',[T.x+Math.cos(a3)*Rs,y3,T.z+Math.sin(a3)*Rs],qFacing([Math.cos(a3),0,Math.sin(a3)]),[rr(4,10),h,2],leafCol(PAL.moss,1.5));st.moss++;}
   const ns=Math.round(ri(10,16)*q*lk);
   for(let i=0;i<ns;i++){const a4=rr(0,TAU),y4=gy0+rr(.5,12),Rs=prof.at(a4,y4-T.y0)+.12,r4=rr(1.5,3.5);
    BIO.put('mossmat',[T.x+Math.cos(a4)*Rs,y4,T.z+Math.sin(a4)*Rs],qUp([Math.cos(a4),rr(-.1,.25),Math.sin(a4)]),r4,leafCol(PAL.moss,.95));st.moss++;}
   // a few ferns and aroids rooted on the buttress tops
   const nf=Math.round(ri(2,5)*q*lk);
   for(let i=0;i<nf;i++){const a5=rr(0,TAU),y5=gy0+rr(1,7),Rs=prof.at(a5,y5-T.y0)-.4;
    frondCrown(T.x+Math.cos(a5)*Rs,y5,T.z+Math.sin(a5)*Rs,rr(1.4,2.6),5,.15,.5,leafCol(PAL.fern,1.7));st.ferns++;}});
  // epiphyte gardens: bromeliads up the bole flanks (8-60 m) and along the bough perches
  if(d0<1500)charge('epiphytes',()=>{const near=d0<800,nb=Math.round(ri(3,7)*q*lk);
   for(let i=0;i<nb;i++){const a=rr(0,TAU),yy=rr(8,60),Rs=(yy<33?prof.at(a,yy):trunkR(T,T.y0+yy))+.1,nx=Math.cos(a),nz=Math.sin(a);
    bromeliad(T.x+nx*Rs,T.y0+yy,T.z+nz*Rs,[nx*.75,.62,nz*.75],rr(1,2.2));st.epiphytes++;}
   (T.perch||[]).forEach(P=>{if(P.r<1.3||rng()>(near?.55:.3)*q)return;garden(P,near,st);});});
  const nl=Math.round(ri(3,6)*q*lk),leafy=d0<900;
  charge('lianas',()=>{for(let i=0;i<nl;i++){const a=rr(0,TAU),yT=T.y0+rr(30,80),Rt=trunkR(T,yT)+.4;
   const top=[T.x+Math.cos(a)*Rt,yT,T.z+Math.sin(a)*Rt],a2=a+rr(-.3,.3),gd=prof.ground+rr(3,14);
   const gx=T.x+Math.cos(a2)*gd,gz=T.z+Math.sin(a2)*gd;if(BIO.mask(gx,gz)<=0||!BIO.clearOf(gx,gz,1))continue;
   const gy=Y(gx,gz),len=yT-gy;if(len<12)continue;
   const yM=mix(yT,gy,rr(.55,.75)),midR=prof.at(a2,yM-T.y0)+rr(.8,3),mid=[T.x+Math.cos(a2)*midR,yM,T.z+Math.sin(a2)*midR];
   const r=rr(.1,.22),hc=rodCol();
   lianaRun([top[0],top[1]+.5,top[2]],mid,r,hc,leafy&&rng()<.5);lianaRun(mid,[gx,gy-.3,gz],r*.9,hc,leafy);
   if(rng()<.6){const L3=rr(10,30),xo=top[0]+rr(-.8,.8),zo=top[2]+rr(-.8,.8);   // a free-hanging aerial root beside it
    BIO.put('strand',[xo,top[1],zo],qUp([rr(-.15,.15),1,rr(-.15,.15)]).multiply(qEuler(0,rr(0,TAU),0)),[rr(.6,1.2),L3,L3*.1],leafCol(PAL.vine,1.4,.06));}
   card(gx,gy+1,gz,rr(2,3.2),2.2,leafCol(SHRUB,1.45),.3);st.lianas++;}});});

 const tt=st.tris;let total=0;for(const k in tt)total+=tt[k];tt.total=total;
 return{under:{ferns:st.ferns,shrubs:st.shrubs,aroids:st.aroids,palms:st.palms,subtrees:st.subtrees,boulders:st.boulders,fungi:st.fungi,logs:st.logs,
  lianas:st.lianas,moss:st.moss,brackets:st.brackets,tufts:st.tufts,treeferns:st.treeferns,screwpines:st.screwpines,gingers:st.gingers,epiphytes:st.epiphytes},tris:tt};};
})();
