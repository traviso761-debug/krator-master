// ================================================================= SKYSCRAPER I — "the Braid"
// A faceted stone shaft 446 m tall, rising to a slanted knife tip, with TWO
// inhabited stair-streets wound round it in opposite directions. Each strand is
// a hollow masonry band (three storeys of rooms under a stepped street, a
// parapet each side where it stands free) that climbs about two and a half
// turns. Where the two strands meet — five times on the way up — one passes
// OVER the other: it swings out from the shaft and crosses in front, then comes
// back in and hugs the shaft again, so the pair reads as a braid, and every
// crossing leaves sky between the strand and the shaft. In the upper third the
// strands stop turning, straighten into vertical blade-fins standing clear of
// the shaft on tie-beams, and close in on it at the tip. A cluster of stepped,
// slope-topped masses round the foot, a three-tier podium with a stair north
// and south, lit doorways, and a ring of broken outlying monoliths. At night a
// beam stands up from the tip.
//
// Pale ashlar with warm ochre where the sun is; deep slot windows (one in four
// lit) on every inhabited face. Ruined: the tip snapped at ~336 m, strand B
// broken through and a 55 m section of it lying on the plain in two pieces,
// strand A broken below a hinge and HANGING from it, the fabric eaten, windows
// dead, moss and rubble. Toppled: the body from 150 m up lies on the plain with
// its braids. Rehabilitated: the scene loop's HOLES and repairPass do it.
//
// All geometry is built in ABSOLUTE heights and shifted by the body group's y0
// in the accumulators, so the same functions build the standing tower, the
// stump, the toppled upper body, the hanging piece and the fallen pieces.

// ---------------------------------------------------------------- the skins
// One generator, two walls, a 16 m tile at 512 px (32 px a metre):
//   kind 0  ASHLAR: 2 m courses of 4 m blocks in running bond, a heavier panel
//           line every fourth course. Podium, tops, decks, treads, kit blocks.
//   kind 1  THE INHABITED WALL: 4 m storeys by 4 m bays in 1 m ashlar; most
//           bays a deep slot window 0.8 x 2.8 m, some doubled, some blank.
function siSkin(kind,dec,emis){const S=emis?256:512;
 return canvasTex(S,S,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data,pm=16/w;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,xm=(x+.5)*pm,ym=(h-y-.5)*pm;
   let win=false,lit=0,edge=0,sill=false;
   if(kind===1){const bi=Math.floor(xm/4),fi=Math.floor(ym/4),bx=xm-bi*4,by=ym-fi*4;
    const c=h3(bi*2.31,fi*5.17,95.3),c2=h3(bi*1.37,fi*2.93,96.1);
    const inY=by>.55&&by<3.35;
    if(c<.3){win=inY&&bx>1.6&&bx<2.4;edge=bx-1.6;sill=by>.35&&by<=.55&&bx>1.45&&bx<2.55;}
    else if(c>.84){const px=Math.min(Math.abs(bx-.45),Math.abs(bx-3.55)),py=Math.min(Math.abs(by-.45),Math.abs(by-3.55));
     edge=-2;win=false;sill=false;if((px<.07&&by>.45&&by<3.55)||(py<.07&&bx>.45&&bx<3.55))edge=-3;}
    else if(c<.4){const l=bx<2;win=inY&&(l?(bx>1.0&&bx<1.45):(bx>2.55&&bx<3.0));edge=l?bx-1.0:bx-2.55;
     sill=by>.35&&by<=.55&&((bx>.9&&bx<1.55)||(bx>2.45&&bx<3.1));}
    if(win&&!dec)lit=c2<.36?.5+c2*1.4:0;
    if(win&&by>3.1)edge=-1;}                                                  // the head of the slot, in shade
   if(emis){D[i]=255*lit;D[i+1]=178*lit;D[i+2]=100*lit;D[i+3]=255;continue;}
   let r,gg,b;
   if(win){
    if(lit>0){r=168;gg=122;b=74;}
    else if(dec){const k=30+h3(x,y,99.1)*10;r=k;gg=k;b=k-1;}
    else{r=34;gg=33;b=38;}
    if(edge>=0&&edge<.12){r=r*.4+60;gg=gg*.4+56;b=b*.4+50;}                   // the lit reveal
    if(edge<0){r*=.55;gg*=.55;b*=.55;}
   }else{
    const CH=kind===1?1:2,BL=kind===1?2:4;
    const ci=Math.floor(ym/CH),fy=ym-ci*CH,off=(ci%2)*BL/2,bxm=((xm+off)%BL+BL)%BL,bi=Math.floor((xm+off)/BL);
    const tone=h3(bi*1.71,ci*3.13,92.3);
    let v=198+(tone-.5)*18+(fbm(xm/1.3,ym/1.3,93.1,2)-.5)*24+(h3(x,y,94.7)-.5)*9;
    const jx=Math.min(bxm,BL-bxm),jy=Math.min(fy,CH-fy);
    if(jx<.05||jy<.05)v-=54;else if(jx<.1||jy<.1)v-=13;else if(fy>CH-.16)v+=7;
    if(kind===0&&ci%4===0&&fy<.14)v-=34;                                     // panel line
    if(sill)v+=16;
    if(edge===-3)v-=48;                                                      // a panel line
    r=v*1.03;gg=v*.965;b=v*.86;}
   if(dec){r*=.76;gg*=.755;b*=.72;
    const m=clamp((fbm(xm/2.2,ym/2.2,97.3,2)-.62)*2.4,0,1)*.6;r=lerp(r,56,m);gg=lerp(gg,70,m);b=lerp(b,42,m);  // lichen
    if(fbm(xm*1.3,ym/5,98.9,2)>.6){r*=.7;gg*=.7;b*=.7;}}                      // runs
   D[i]=clamp(r,0,255);D[i+1]=clamp(gg,0,255);D[i+2]=clamp(b,0,255);D[i+3]=255;}
  g.putImageData(id,0,0);});}
TEX.siAsh=siSkin(0,0,0);TEX.siAshR=siSkin(0,1,0);
TEX.siWal=siSkin(1,0,0);TEX.siWalR=siSkin(1,1,0);TEX.siWalE=siSkin(1,0,1);
const siStd=o=>new THREE.MeshStandardMaterial(Object.assign({roughness:.88,metalness:0,side:DS},o));
MAT.siWall =siStd({map:TEX.siWal,emissive:0xffffff,emissiveMap:TEX.siWalE,emissiveIntensity:1.1});
MAT.siWallR=siStd({map:TEX.siWalR});
MAT.siAsh  =siStd({map:TEX.siAsh});
MAT.siAshR =siStd({map:TEX.siAshR});
MAT.siDeck =siStd({map:TEX.siAsh,color:0xd6ccb8});
MAT.siDeckR=siStd({map:TEX.siAshR,color:0xb4ac9c});
// SHADE IS PAINTED: nothing here casts a shadow, so the underside of a strand
// seen from the street below would come back sunlit on a pale material.
MAT.siShade =siStd({map:TEX.siAsh,color:0x6c7080});
MAT.siShadeR=siStd({map:TEX.siAshR,color:0x505257});
MAT.siSect =siStd({map:TEX.siAshR,color:0x4a423a});
MAT.siVoid =siStd({color:0x0c0b0a,roughness:1});
MAT.siGlow =new THREE.MeshBasicMaterial({color:0xffc27a});
MAT.siBeamM=new THREE.MeshBasicMaterial({color:0x5fc8ff,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false,side:DS,fog:false});
kdef('siBox',new THREE.BoxGeometry(1,1,1),siStd({map:TEX.siAsh}));
kdef('siBoxR',new THREE.BoxGeometry(1,1,1),siStd({map:TEX.siAshR}));
kdef('siDim',new THREE.BoxGeometry(1,1,1),MAT.siVoid);
kdef('siLit',new THREE.BoxGeometry(1,1,1),MAT.siGlow);
// the beam from the tip is night-only: setNight() shows what FIREKIT names
kdef('siBeam',new THREE.CylinderGeometry(1,1,1,24,1,true),MAT.siBeamM);FIREKIT.push('siBeam');

// ---------------------------------------------------------------- the form
// Presets are DERIVED from this: targets/skyi/91z-views.js runs after 90-scene.js.
const SI_SITE={};
const SI_Y0=12,SI_YS=64,SI_YE=404,SI_H=446,SI_A0=100*Math.PI/180,SI_CUT=150,SI_SNAP=336;
// the shaft: seven tapering stages with a setback at each knot, then the tip
const SI_K=[12,62,118,176,236,296,352,398];
// plan: a square with its corners chamfered — four broad faces, four narrow
const SI_CA=[31,59,121,149,211,239,301,329].map(a=>a*Math.PI/180);
const siSm=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
function siSeg(y){let i=0;while(i<7&&y>=SI_K[i+1])i++;return i;}
function siRseg(i,y){if(i>=7)return 7*(1-.03*7)*clamp((SI_H-y)/(SI_H-SI_K[7]),0,1);
 const t=clamp((y-SI_Y0)/(SI_K[7]-SI_Y0),0,1);return(6.5+16*Math.pow(1-t,1.1))*(1-.03*i);}
function siCR(y){return siRseg(siSeg(y),y);}
// facet k runs from corner k to corner k+1; its outward normal is at its middle
function siFacet(th){th=((th-SI_CA[0])%TAU+TAU)%TAU+SI_CA[0];let k=0;while(k<7&&th>=SI_CA[k+1])k++;
 const a0=SI_CA[k],a1=k<7?SI_CA[k+1]:SI_CA[0]+TAU;return{k:k,half:(a1-a0)/2,mid:a0+(a1-a0)/2,th:th};}
// radius of the shaft's polygon (circumradius r) along direction th
function siPolyR(r,th){const f=siFacet(th);return r*Math.cos(f.half)/Math.cos(f.th-f.mid);}
// a strand: street width W and band depth T (a knife edge at its very end)
const siW=t=>lerp(22,8,Math.pow(t,1.1));
const siT=t=>lerp(26,9,Math.pow(t,.8))*(1-.85*siSm(.955,1,t));
// THE TWIST. Integrated so the street keeps a ~42 degree stair pitch at its own
// radius (om*r = 1.1) through the lower half, then straightens to vertical:
// the top of each strand is a blade-fin. The strands spring from the stepped
// masses at the foot, SI_YS up.
const SI_N=1000;
const SI_TH=(function(){const a=new Float32Array(SI_N+1);let acc=0;
 for(let i=0;i<SI_N;i++){const t=(i+.5)/SI_N,y=SI_YS+(SI_YE-SI_YS)*t,rm=siCR(y)*.93+siW(t)/2;
  acc+=1.1/rm*(1-siSm(.45,.97,t))*(SI_YE-SI_YS)/SI_N;a[i+1]=acc;}return a;})();
function siTh(y){const f=clamp((y-SI_YS)/(SI_YE-SI_YS),0,1)*SI_N,i=Math.min(SI_N-1,Math.floor(f));return lerp(SI_TH[i],SI_TH[i+1],f-i);}
function siOm(y){const f=clamp((y-SI_YS)/(SI_YE-SI_YS),0,1)*SI_N,i=Math.min(SI_N-1,Math.floor(f));return(SI_TH[i+1]-SI_TH[i])*SI_N/(SI_YE-SI_YS);}
function siThInv(T){let lo=SI_YS,hi=SI_YE;for(let k=0;k<40;k++){const m=(lo+hi)/2;if(siTh(m)<T)lo=m;else hi=m;}return(lo+hi)/2;}
// Strand s (0 = A, turning +theta; 1 = B, turning -theta) at street height y.
// THE BRAID: the two bands cross wherever their angles meet. Near a crossing
// (inside the angular separation at which the 12 m bands would overlap in
// height) the strand that is OVER swings out by a street width and passes in
// front; the one that is under keeps hugging the shaft. Over and under
// alternate crossing by crossing. In the upper third both stand clear anyway.
function siStr(s,y){const t=clamp((y-SI_YS)/(SI_YE-SI_YS),0,1),Th=siTh(y),sg=s?-1:1;
 const th=SI_A0+(s?Math.PI:0)+sg*Th;
 const D=2*Th-Math.PI;
 let ph=((D%TAU)+TAU)%TAU;ph=Math.min(ph,TAU-ph);
 const W=siW(t),T=siT(t),om=siOm(y);
 const need=2*om*(T+2.5);
 const over=Math.cos(D/2)*(s?-1:1)>0;
 const push=(over&&need>1e-3)?(W+2.5)*(1-siSm(need*.8,need*1.25,ph)):0;
 const gapU=11*siSm(.6,.76,t)*(1-siSm(.88,1,t));
 const gap=Math.max(push,gapU);
 const cr=siPolyR(siCR(y),th);
 const ri=cr+gap-1.5*(1-Math.min(1,gap/2));
 return{th:th,ri:ri,ro:ri+W,T:T,W:W,t:t,gap:gap,om:om,sg:sg,cr:cr,a:om*(ri+W/2)};}
// the underside of the band at street height y: at the springing it reaches
// down to the podium, a curved buttress wall, and lifts clear over 40 m of rise
const siSpr=y=>1-siSm(SI_YS,SI_YS+40,y);
// the outer envelope of the whole body at height y (the toppled body rests on it)
function siEnv(y){let m=siCR(y);if(y<=SI_YE)for(const s of [0,1])m=Math.max(m,siStr(s,y).ro+.8);return m;}

// ---------------------------------------------------------------- geometry accumulators
// Flat-shaded quads with world-scaled UVs (metres/16), pushed through a matrix
// (the body group's y0, a hinge, or a fallen piece's own centre), then one mesh
// per material per part.
function siAcc(M){return{P:[],N:[],U:[],I:[],M:M||new THREE.Matrix4()};}
const _siN=new THREE.Vector3(),_siE1=new THREE.Vector3(),_siE2=new THREE.Vector3(),_siQ=[0,1,2,3].map(()=>new THREE.Vector3());
function siQuad(A,a,b,c,d,ua,ub,uc,ud){const p=_siQ;
 p[0].set(a[0],a[1],a[2]);p[1].set(b[0],b[1],b[2]);p[2].set(c[0],c[1],c[2]);p[3].set(d[0],d[1],d[2]);
 for(let k=0;k<4;k++){p[k].applyMatrix4(A.M);if(!isFinite(p[k].x+p[k].y+p[k].z))return;}
 _siE1.subVectors(p[2],p[0]);_siE2.subVectors(p[3],p[1]);_siN.crossVectors(_siE1,_siE2);const L=_siN.length();if(!(L>1e-9))return;_siN.multiplyScalar(1/L);
 const o=A.P.length/3;for(let k=0;k<4;k++){A.P.push(p[k].x,p[k].y,p[k].z);A.N.push(_siN.x,_siN.y,_siN.z);}
 A.U.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1],ud[0],ud[1]);A.I.push(o,o+1,o+2,o,o+2,o+3);}
function siTri(A,a,b,c,ua,ub,uc){siQuad(A,a,b,c,c,ua,ub,uc,uc);}
function siFlush(A,mat,parent){if(!A.I.length)return null;const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(A.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(A.N,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(A.U,2));g.setIndex(A.I);return mesh(g,mat,parent);}
// a part's accumulators, one per material
function siSet(M){return{wall:siAcc(M),ash:siAcc(M),deck:siAcc(M),shade:siAcc(M),void:siAcc(M),sect:siAcc(M)};}
function siFlushSet(S,dx,parent){siFlush(S.wall,dx?MAT.siWallR:MAT.siWall,parent);siFlush(S.ash,dx?MAT.siAshR:MAT.siAsh,parent);
 siFlush(S.deck,dx?MAT.siDeckR:MAT.siDeck,parent);siFlush(S.shade,dx?MAT.siShadeR:MAT.siShade,parent);
 siFlush(S.void,MAT.siVoid,parent);siFlush(S.sect,MAT.siSect,parent);}
// drop a fallen piece so its LOWEST VERTEX sits `bury` under the plain.
// dropFragment measures the rotated bounding box, which for a 50 m piece
// rolled 60 degrees is 15 m loose, and left the piece hanging in the air.
function siDrop(Gp,bury){Gp.updateMatrix();const v=new THREE.Vector3();let lo=1e9,x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;
 for(const m of Gp.children){const P=m.geometry&&m.geometry.attributes.position;if(!P)continue;
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(Gp.matrix);lo=Math.min(lo,v.y);x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);z0=Math.min(z0,v.z);z1=Math.max(z1,v.z);}}
 if(!isFinite(lo))return;Gp.position.x+=Gp.position.x-(x0+x1)/2;Gp.position.z+=Gp.position.z-(z0+z1)/2;Gp.position.y-=lo+bury;}
const siP=(r,th,y)=>[r*Math.cos(th),y,r*Math.sin(th)];
// a block: four plan corners [x,z], a foot height and four top heights; the
// sides take the inhabited wall, the (possibly sloping) top the ashlar
function siBlk(Aw,At,c,yb,yt){let u=0;
 for(let k=0;k<4;k++){const a=c[k],b=c[(k+1)%4],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
  siQuad(Aw,[a[0],yb,a[1]],[b[0],yb,b[1]],[b[0],yt[(k+1)%4],b[1]],[a[0],yt[k],a[1]],[u/16,yb/16],[(u+L)/16,yb/16],[(u+L)/16,yt[(k+1)%4]/16],[u/16,yt[k]/16]);u+=L;}
 siQuad(At,[c[0][0],yt[0],c[0][1]],[c[1][0],yt[1],c[1][1]],[c[2][0],yt[2],c[2][1]],[c[3][0],yt[3],c[3][1]],
  [c[0][0]/16,c[0][1]/16],[c[1][0]/16,c[1][1]/16],[c[2][0]/16,c[2][1]/16],[c[3][0]/16,c[3][1]/16]);}
// a door: a dark reveal and, where the building is alive, the lit leaf in it
function siDoor(C,x,y,z,nrm,w,h,lit){const q=qFacing([nrm[0],0,nrm[2]]);
 C.kp('siDim',[x,y+h/2,z],q,[w+1,h+.8,1.6],null);
 if(lit)C.kp('siLit',[x+nrm[0]*.82,y+h/2-.2,z+nrm[2]*.82],q,[w,h,.12],null);}

// ---------------------------------------------------------------- the shaft
// C: {S (accumulators), dx, y0, kit, kp(), hole, jseed}. Builds the shaft from
// yLo to yHi; jLo/jHi make that end a jagged break with a dark section below it.
function siCore(C,yLo,yHi,jLo,jHi){const S=C.S,dx=C.dx;
 const jag=k=>(h3((k%8)*3.71,1.37,C.jseed)-.5)*14;
 const ring=(i,y,k)=>{const r=siRseg(i,y),a=SI_CA[k%8];return[r*Math.cos(a),y,r*Math.sin(a)];};
 const i0=siSeg(yLo),i1=siSeg(Math.min(yHi,SI_H-.01));
 for(let i=i0;i<=i1;i++){const sLo=Math.max(i<7?SI_K[i]:SI_K[7],yLo),sHi=Math.min(i<7?SI_K[i+1]:SI_H,yHi);if(sHi-sLo<.5)continue;
  const apex=i===7&&sHi>=SI_H-.01;
  if(apex){// THE TIP: a slanted knife, the apex set off the axis
   const ax=2.2,az=-1.4;
   for(let k=0;k<8;k++){const a=ring(7,sLo,k),b=ring(7,sLo,k+1),f=(k*5.3);
    siTri(S.wall,a,b,[ax,SI_H,az],[f/16,sLo/16],[(f+6)/16,sLo/16],[(f+3)/16,SI_H/16]);}
   if(C.kit&&dx===0){C.kp('siLit',[ax,SI_H-1,az],null,[1.4,3,1.4],null);
    C.kp('siBeam',[ax,SI_H+450,az],null,[3.2,900,3.2],null);C.kp('siBeam',[ax,SI_H+450,az],null,[1.2,900,1.2],null);}
   continue;}
  const nr=Math.max(1,Math.ceil((sHi-sLo)/8));
  for(let j=0;j<nr;j++){const ya=sLo+(sHi-sLo)*j/nr,yb=sLo+(sHi-sLo)*(j+1)/nr;
   for(let k=0;k<8;k++){
    const yak=(j===0&&jLo&&sLo===yLo)?ya+jag(k):ya,yak1=(j===0&&jLo&&sLo===yLo)?ya+jag(k+1):ya;
    const ybk=(j===nr-1&&jHi&&sHi===yHi)?yb+jag(k):yb,ybk1=(j===nr-1&&jHi&&sHi===yHi)?yb+jag(k+1):yb;
    if(C.hole&&C.hole(k/8+.06,(ya+yb)/2)&&(ya-yLo)>6)continue;
    const half=((k<7?SI_CA[k+1]:SI_CA[0]+TAU)-SI_CA[k])/2,off=k*5.3;
    const wa=siRseg(i,ya)*Math.sin(half),wb=siRseg(i,yb)*Math.sin(half);
    siQuad(S.wall,ring(i,yak,k),ring(i,yak1,k+1),ring(i,ybk1,k+1),ring(i,ybk,k),
     [(off-wa)/16,yak/16],[(off+wa)/16,yak1/16],[(off+wb)/16,ybk1/16],[(off-wb)/16,ybk/16]);}}
  // the setback ledge at the foot of this stage
  if(i>0&&i<=7&&SI_K[i]>yLo+.5&&SI_K[i]<yHi-.5){const y=SI_K[i];
   for(let k=0;k<8;k++){const a0=SI_CA[k],a1=SI_CA[(k+1)%8],r0=siRseg(i-1,y),r1=siRseg(i,y);
    siQuad(S.deck,[r0*Math.cos(a0),y,r0*Math.sin(a0)],[r0*Math.cos(a1),y,r0*Math.sin(a1)],[r1*Math.cos(a1),y,r1*Math.sin(a1)],[r1*Math.cos(a0),y,r1*Math.sin(a0)],
     [r0*Math.cos(a0)/16,r0*Math.sin(a0)/16],[r0*Math.cos(a1)/16,r0*Math.sin(a1)/16],[r1*Math.cos(a1)/16,r1*Math.sin(a1)/16],[r1*Math.cos(a0)/16,r1*Math.sin(a0)/16]);}
   if(C.kit)for(let k=0;k<8;k++){const a1=k<7?SI_CA[k+1]:SI_CA[0]+TAU,a=(SI_CA[k]+a1)/2,hf=(a1-SI_CA[k])/2,R=siRseg(i-1,y),r=R*Math.cos(hf);
    C.kp(dx?'siBoxR':'siBox',[r*Math.cos(a),y+.6,r*Math.sin(a)],qFacing([Math.cos(a),0,Math.sin(a)]),[2*R*Math.sin(hf)*.92,1.2,1.4],null);}}
  // pilaster ribs, two on each broad face, stage by stage
  if(C.kit&&i<7){const ra=sLo,rb=(jHi&&sHi===yHi)?sHi-9:sHi;
   if(rb-ra>6)for(const k of [1,3,5,7])for(const f of [.3,.7]){
    const a0=SI_CA[k],a1=k<7?SI_CA[k+1]:SI_CA[0]+TAU,mid=(a0+a1)/2,n=[Math.cos(mid),0,Math.sin(mid)];
    const pt=y=>{const r=siRseg(i,y);return[lerp(r*Math.cos(a0),r*Math.cos(a1),f)+n[0]*.55,y-C.y0,lerp(r*Math.sin(a0),r*Math.sin(a1),f)+n[2]*.55];};
    beam(dx?'siBoxR':'siBox',pt(ra),pt(rb),1.6,1.1,null);}}}
 // a ruin's hollow: a dark lining inside the eaten skin, and its floors
 if(C.hole){for(let i=i0;i<=Math.min(i1,6);i++){const sLo=Math.max(SI_K[i],yLo),sHi=Math.min(SI_K[i+1],yHi);if(sHi-sLo<.5)continue;
   for(let k=0;k<8;k++){const a0=SI_CA[k],a1=SI_CA[(k+1)%8],ra=siRseg(i,sLo)*.86,rb=siRseg(i,sHi)*.86;
    siQuad(S.void,[ra*Math.cos(a0),sLo,ra*Math.sin(a0)],[ra*Math.cos(a1),sLo,ra*Math.sin(a1)],[rb*Math.cos(a1),sHi,rb*Math.sin(a1)],[rb*Math.cos(a0),sHi,rb*Math.sin(a0)],[0,0],[1,0],[1,1],[0,1]);}}
  if(C.kit)for(let y=yLo+6;y<yHi-8;y+=8){const r=siCR(y);if(r<3)break;
   C.kp('slab',[0,y,0],null,[r*.84,.55,r*.84],new THREE.Color(0x5a534b));C.kp('slab',[0,y-1.2,0],null,[r*.8,.6,r*.8],new THREE.Color(0x191b1f));}}
 // the broken section: a dark floor just inside the jagged edge
 const cap=(y)=>{const r=siCR(y);for(let k=0;k<8;k++){const a0=SI_CA[k],a1=SI_CA[(k+1)%8];
  siTri(S.sect,[0,y,0],[r*Math.cos(a0),y,r*Math.sin(a0)],[r*Math.cos(a1),y,r*Math.sin(a1)],[0,0],[1,0],[0,1]);}};
 if(jHi)cap(yHi-7);if(jLo)cap(yLo+7);}

// ---------------------------------------------------------------- a strand
// Builds strand s between street heights yA and yB. o.capA/o.capB: 'sect' for a
// broken end, 'wall' for a built one. C.kit false for pieces that are moved as
// meshes (the hanging and fallen sections), which carry no instanced detail.
function siStrand(C,s,yA,yB,o){o=o||{};const S=C.S,dx=C.dx,H=.34;
 if(yB-yA<1)return;
 // the band's section at street height y: corners top-inner, top-outer,
 // bottom-outer, bottom-inner. The band's depth is measured square to its own
 // path, so where the strand stands vertical it is still a solid fin.
 const sec=(y)=>{const Q=siStr(s,y),L=Math.sqrt(1+Q.a*Q.a),q=Q.T/L,dyb=Q.T*Q.a/L;
  const st=Q.a>.78&&Q.t<.9;const ht=st?H:0;
  const pho=1.3*siSm(.3,.7,Q.a),phi=pho*clamp((Q.gap-.5)/1.5,0,1);
  const yb=Math.max(lerp(y-dyb,SI_Y0-.5,siSpr(y)),SI_Y0-.5);
  return{Q:Q,y:y,yt:y+ht,yb:yb,pho:pho,phi:phi,st:st,q:q,
   thbo:Q.th+Q.sg*q/Q.ro,thbi:Q.th+Q.sg*q/Math.max(Q.ri,1)};};
 // samples about 2.4 m apart along the outer edge
 const Y=[yA];for(let y=yA;y<yB;){const Q=siStr(s,y);y+=Math.max(.35,2.4/Math.sqrt(1+Math.pow(Q.om*Q.ro,2)));Y.push(Math.min(y,yB));if(y>=yB)break;}
 const X=Y.map(sec);let arc=0,lastRib=0,lastBay=0,lastDoor=0,lastTie=0,lastFig=0,lastMoss=0,lastVine=0;
 const NR=3;
 for(let j=0;j+1<X.length;j++){const a=X[j],b=X[j+1],A=a.Q,B=b.Q;
  const da=Math.hypot(B.ro*Math.cos(B.th)-A.ro*Math.cos(A.th),B.ro*Math.sin(B.th)-A.ro*Math.sin(A.th));const u0=arc,u1=arc+da;arc=u1;
  // outer wall, in three rows so a ruin can lose it a cell at a time
  for(let r=0;r<NR;r++){const f0=r/NR,f1=(r+1)/NR;
   const ya0=lerp(a.yb,a.yt+a.pho,f0),ya1=lerp(a.yb,a.yt+a.pho,f1),yb0=lerp(b.yb,b.yt+b.pho,f0),yb1=lerp(b.yb,b.yt+b.pho,f1);
   const ta0=lerp(a.thbo,A.th,f0),ta1=lerp(a.thbo,A.th,f1),tb0=lerp(b.thbo,B.th,f0),tb1=lerp(b.thbo,B.th,f1);
   if(C.hole&&r<NR-1&&C.hole(((u0/260)%1+1)%1,(ya0+yb1)/2)){
    const rd=A.ro-1.4,re=B.ro-1.4;
    siQuad(S.void,siP(rd,ta0,ya0),siP(re,tb0,yb0),siP(re,tb1,yb1),siP(rd,ta1,ya1),[0,0],[1,0],[1,1],[0,1]);continue;}
   const ua0=u0+a.q*(1-f0),ua1=u0+a.q*(1-f1),ub0=u1+b.q*(1-f0),ub1=u1+b.q*(1-f1);
   siQuad(S.wall,siP(A.ro,ta0,ya0),siP(B.ro,tb0,yb0),siP(B.ro,tb1,yb1),siP(A.ro,ta1,ya1),[ua0/16,ya0/16],[ub0/16,yb0/16],[ub1/16,yb1/16],[ua1/16,ya1/16]);}
  // inner wall (buried in the shaft where the strand hugs it)
  siQuad(S.wall,siP(A.ri,a.thbi,a.yb),siP(B.ri,b.thbi,b.yb),siP(B.ri,B.th,b.yt+b.phi),siP(A.ri,A.th,a.yt+a.phi),
   [(u0+a.q)/16,a.yb/16],[(u1+b.q)/16,b.yb/16],[u1/16,(b.yt+b.phi)/16],[u0/16,(a.yt+a.phi)/16]);
  // soffit
  siQuad(S.shade,siP(A.ri,a.thbi,a.yb),siP(A.ro,a.thbo,a.yb),siP(B.ro,b.thbo,b.yb),siP(B.ri,b.thbi,b.yb),[0,u0/16],[A.W/16,u0/16],[B.W/16,u1/16],[0,u1/16]);
  // the street where it is too steep for stairs: a plain sloped top
  if(!a.st||!b.st)siQuad(S.deck,siP(A.ri,A.th,a.yt),siP(A.ro,A.th,a.yt),siP(B.ro,B.th,b.yt),siP(B.ri,B.th,b.yt),[0,u0/16],[A.W/16,u0/16],[B.W/16,u1/16],[0,u1/16]);
  // parapets: outer always on a street, inner where the strand stands free
  if(a.pho>.05||b.pho>.05){const ra=A.ro-.6,rb=B.ro-.6;
   siQuad(S.wall,siP(ra,A.th,a.y-.2),siP(rb,B.th,b.y-.2),siP(rb,B.th,b.yt+b.pho),siP(ra,A.th,a.yt+a.pho),[u0/16,a.y/16],[u1/16,b.y/16],[u1/16,(b.yt+b.pho)/16],[u0/16,(a.yt+a.pho)/16]);
   siQuad(S.deck,siP(ra,A.th,a.yt+a.pho),siP(A.ro,A.th,a.yt+a.pho),siP(B.ro,B.th,b.yt+b.pho),siP(rb,B.th,b.yt+b.pho),[0,u0/16],[.04,u0/16],[.04,u1/16],[0,u1/16]);}
  if(a.phi>.05||b.phi>.05){const ra=A.ri+.6,rb=B.ri+.6;
   siQuad(S.wall,siP(ra,A.th,a.y-.2),siP(rb,B.th,b.y-.2),siP(rb,B.th,b.yt+b.phi),siP(ra,A.th,a.yt+a.phi),[u0/16,a.y/16],[u1/16,b.y/16],[u1/16,(b.yt+b.phi)/16],[u0/16,(a.yt+a.phi)/16]);
   siQuad(S.deck,siP(A.ri,A.th,a.yt+a.phi),siP(ra,A.th,a.yt+a.phi),siP(rb,B.th,b.yt+b.phi),siP(B.ri,B.th,b.yt+b.phi),[0,u0/16],[.04,u0/16],[.04,u1/16],[0,u1/16]);}
  if(!C.kit)continue;
  // ---- instanced detail along the strand
  const nrm=[Math.cos(A.th),0,Math.sin(A.th)],qn=qFacing(nrm),bx=dx?'siBoxR':'siBox',hw=a.yt-a.yb;
  if(arc-lastRib>11&&A.a>.6&&hw>5){lastRib=arc;const r=A.ro+.35;
   C.kp(bx,[r*nrm[0],(a.yb+a.yt)/2,r*nrm[2]],qn,[1.3,hw*.78,.8],null);}
  if(arc-lastBay>(C.bayN||27)&&A.a>.6&&hw>12){lastBay=arc;C.bayN=rr(18,34);const bw=rr(7,12),bh=Math.min(hw*.7,rr(8,15)),bd=rr(2.6,4.6),r=A.ro+bd/2-.2,yc=a.yb+rr(1.5,hw-bh-1.5)+bh/2;
   C.kp(bx,[r*nrm[0],yc,r*nrm[2]],qn,[bw,bh,bd],null);
   for(const f of (bw>9?[-.22,.22]:[0]))C.kp(dx?'siDim':'siLit',[(r+bd/2+.03)*nrm[0]-nrm[2]*f*bw,yc+.2,(r+bd/2+.03)*nrm[2]+nrm[0]*f*bw],qn,[.8,bh*.5,.1],null);}
  if(A.gap<.5&&a.st&&arc-lastDoor>37){lastDoor=arc;const f=siFacet(A.th),n2=[Math.cos(f.mid),0,Math.sin(f.mid)];
   siDoor(C,A.cr*nrm[0],a.yt,A.cr*nrm[2],n2,3,5,dx===0);}
  if(A.gap>4&&arc-lastTie>17){lastTie=arc;const y=a.y-A.T*.55;
   beam(bx,[(A.ri+.3)*nrm[0],y-C.y0,(A.ri+.3)*nrm[2]],[(A.cr-.8)*nrm[0],y-C.y0,(A.cr-.8)*nrm[2]],3.6,3,null);}
  if(C.figs&&a.st&&arc-lastFig>9){lastFig=arc;if(rng()<.35){const r=rr(Math.max(A.ri,A.cr)+1.2,A.ro-1.2),yy=a.yt;
   const c=new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5));
   C.kp('figB',[r*nrm[0],yy,r*nrm[2]],qEuler(0,rng()*TAU,0),1,c);C.kp('figH',[r*nrm[0],yy,r*nrm[2]],null,1,new THREE.Color(0xc9a17e));}}
  if(dx&&arc-lastMoss>6){lastMoss=arc;if(rng()<.55){const r=rr(Math.max(A.ri,A.cr)+.8,A.ro-.8),sz=rr(.6,1.8);
   C.kp('moss',[r*nrm[0],a.yt+.1,r*nrm[2]],qEuler(0,rng()*TAU,0),[sz*1.3,sz*.4,sz*1.3],new THREE.Color().setHSL(rr(.2,.3),rr(.3,.5),rr(.05,.12)));}}
  if(dx&&arc-lastVine>14&&a.yb>SI_Y0+8){lastVine=arc;if(rng()<.45){const r=A.ro-.4;
   C.kp('vine',[r*Math.cos(a.thbo),a.yb,r*Math.sin(a.thbo)],null,[rr(.8,1.6),rr(4,Math.min(16,a.yb-SI_Y0-2)),rr(.8,1.6)],null);}}}
 // ---- the stairs: 0.34 m risers, one tread per riser, wall to parapet
 if(o.stairs!==false)for(let y=yA;y+H<=yB;y+=H){const A=siStr(s,y);if(!(A.a>.78&&A.t<.9))continue;const B=siStr(s,y+H);
  if(C.hole&&C.hole(((y*.011)%1+1)%1*.5+.25,y)){continue;}
  const yt=y+H,ri=A.ri,ro=A.ro-.3;
  siQuad(S.deck,siP(ri,A.th,yt),siP(ro,A.th,yt),siP(ro,B.th,yt),siP(ri,B.th,yt),
   [ri*Math.cos(A.th)/8,ri*Math.sin(A.th)/8],[ro*Math.cos(A.th)/8,ro*Math.sin(A.th)/8],[ro*Math.cos(B.th)/8,ro*Math.sin(B.th)/8],[ri*Math.cos(B.th)/8,ri*Math.sin(B.th)/8]);
  siQuad(S.ash,siP(B.ri,B.th,yt),siP(B.ro-.3,B.th,yt),siP(B.ro-.3,B.th,yt+H),siP(B.ri,B.th,yt+H),[0,yt/16],[B.W/16,yt/16],[B.W/16,(yt+H)/16],[0,(yt+H)/16]);}
 // ---- the two ends
 const end=(x,acc)=>{const Q=x.Q;siQuad(acc,siP(Q.ri,Q.th,x.yt+x.phi),siP(Q.ro,Q.th,x.yt+x.pho),siP(Q.ro,x.thbo,x.yb),siP(Q.ri,x.thbi,x.yb),[0,0],[Q.W/16,0],[Q.W/16,Q.T/16],[0,Q.T/16]);};
 end(X[0],o.capA==='sect'?S.sect:S.wall);end(X[X.length-1],o.capB==='sect'?S.sect:S.wall);
 if(C.kit&&(o.capA==='sect'||o.capB==='sect'))for(const x of [o.capA==='sect'?X[0]:null,o.capB==='sect'?X[X.length-1]:null]){if(!x)continue;
  for(let k=0;k<5;k++){const r=rr(x.Q.ri,x.Q.ro),th=x.Q.th;C.kp('rubble',[r*Math.cos(th),x.yt+rr(0,1),r*Math.sin(th)],qEuler(rng()*3,rng()*3,rng()*3),[rr(.8,2),rr(.6,1.4),rr(.8,2)],new THREE.Color().setHSL(.08,.15,rr(.3,.45)));}}
 return X;}

// ---------------------------------------------------------------- the builder
function buildSkyI(scene,gx,gz,d){reseed(9760+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const PR=88;                                        // podium radius (lowest tier)
 REGISTER({name:'Skyscraper I — the Braid ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:PR+4,h:SI_H+12});
 const site=SI_SITE[d]={x:gx,z:gz,d:d,PR:PR,Y0:SI_Y0,H:SI_H,YE:SI_YE,CUT:SI_CUT,SNAP:SI_SNAP,A0:SI_A0};
 // ================= the podium, the foot and the plain (never toppled)
 const CG={S:siSet(),dx:dd,y0:0,kit:true,kp:(n,p,q,s,c)=>kput(n,p,q,s,c)};
 const oct=(r,k)=>{const a=(k+.5)*TAU/8;return[r*Math.cos(a),r*Math.sin(a)];};
 const TR=[PR,PR-6,PR-12];
 for(let j=0;j<3;j++){const y0=4*j,y1=4*j+4,R=TR[j];let u=0;
  for(let k=0;k<8;k++){const a=oct(R,k),b=oct(R,k+1),L=Math.hypot(b[0]-a[0],b[1]-a[1]);
   siQuad(CG.S.ash,[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],y1,b[1]],[a[0],y1,a[1]],[u/16,y0/16],[(u+L)/16,y0/16],[(u+L)/16,y1/16],[u/16,y1/16]);u+=L;
   const Rn=j<2?TR[j+1]:0,c=oct(Rn,k+1),e=oct(Rn,k);
   if(j<2)siQuad(CG.S.deck,[a[0],y1,a[1]],[b[0],y1,b[1]],[c[0],y1,c[1]],[e[0],y1,e[1]],[a[0]/16,a[1]/16],[b[0]/16,b[1]/16],[c[0]/16,c[1]/16],[e[0]/16,e[1]/16]);
   else siTri(CG.S.deck,[a[0],y1,a[1]],[b[0],y1,b[1]],[0,y1,0],[a[0]/16,a[1]/16],[b[0]/16,b[1]/16],[0,0]);}}
 apron(G,0,0,PR,PR+36,dd,1.6);
 // the two grand stairs, south and north, each onto a landing block
 const bxG=dd?'siBoxR':'siBox';
 for(const sa of [Math.PI/2,-Math.PI/2]){const n=[Math.cos(sa),0,Math.sin(sa)],qn=qFacing(n);
  for(let k=0;k<30;k++){const r=PR+(29-k)*.7+.35,h=(k+1)*.4;kput(bxG,[r*n[0],h/2,r*n[2]],qn,[28,h,.7],null);}
  kput(bxG,[(PR-6)*n[0],6,(PR-6)*n[2]],qn,[28,12,12],null);
  for(const sd of [-1,1]){const t=[-n[2],0,n[0]],o=15*sd;
   beam(bxG,[(PR+21.5)*n[0]+t[0]*o,.4,(PR+21.5)*n[2]+t[2]*o],[PR*n[0]+t[0]*o,13.4,PR*n[2]+t[2]*o],1.6,2.4,null);}
  if(!dd)for(let k=0;k<16;k++){const r=rr(44,PR-14),t=rr(-14,14),x=r*n[0]-n[2]*t,z=r*n[2]+n[0]*t,c=new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5));
   kput('figB',[x,SI_Y0,z],qEuler(0,rng()*TAU,0),1,c);kput('figH',[x,SI_Y0,z],null,1,new THREE.Color(0xc9a17e));}}
 // THE FOOT: stepped, slope-topped masses round the shaft, each kept under the
 // strands where they first pass over it, each with a lit door at its face
 const firstPass=(s,al)=>{const T=s?((SI_A0+Math.PI-al)%TAU+TAU)%TAU:((al-SI_A0)%TAU+TAU)%TAU;return siThInv(T);};
 const blocks=[];
 const bandBot=y=>{const t=clamp((y-SI_YS)/(SI_YE-SI_YS),0,1);return lerp(y-siT(t)-2.5,SI_Y0,siSpr(y));};
 for(let i=0;i<11;i++){const al=i*TAU/11+.2+rr(-.1,.1),er=[Math.cos(al),Math.sin(al)],et=[-Math.sin(al),Math.cos(al)];
  const rin=siPolyR(siCR(SI_Y0),al)-3,dep=rr(26,40),w=rr(17,28);
  let cap=1e9;for(const s of [0,1])for(const da of [-1,-.5,0,.5,1]){const a2=al+da*(w/2)/(rin+dep/2),y=firstPass(s,a2);cap=Math.min(cap,bandBot(y)-2);}
  let hIn=Math.min(cap-SI_Y0,rr(55,100));if(dd)hIn*=rr(.75,1);if(hIn<7)continue;
  const hOut=hIn*rr(.35,.6);
  const P=(r,t)=>[r*er[0]+t*et[0],r*er[1]+t*et[1]];
  siBlk(CG.S.wall,CG.S.deck,[P(rin,-w/2),P(rin,w/2),P(rin+dep,w/2),P(rin+dep,-w/2)],SI_Y0-.5,[SI_Y0+hIn,SI_Y0+hIn,SI_Y0+hOut,SI_Y0+hOut]);
  // a set-back tier on its inner half, where the strands leave room
  const hx=Math.min(cap-SI_Y0-hIn,rr(10,22));
  if(hx>5){const w3=w*rr(.55,.75),d3=dep*rr(.3,.45),yb3=SI_Y0+hIn-1;
   siBlk(CG.S.wall,CG.S.deck,[P(rin,-w3/2),P(rin,w3/2),P(rin+d3,w3/2),P(rin+d3,-w3/2)],yb3-(hIn-hOut)*d3/dep,[yb3+hx,yb3+hx,yb3+hx*.55,yb3+hx*.55]);}
  // the stepped mass in front of it, and the door in that
  const d2=rr(6,10),w2=w*rr(.5,.7),h2=Math.max(6,hOut*rr(.4,.7)),rf=rin+dep+d2;
  siBlk(CG.S.wall,CG.S.deck,[P(rin+dep-1,-w2/2),P(rin+dep-1,w2/2),P(rf,w2/2),P(rf,-w2/2)],SI_Y0-.5,[SI_Y0+h2,SI_Y0+h2,SI_Y0+h2,SI_Y0+h2]);
  const dp=P(rf+.2,0);siDoor(CG,dp[0],SI_Y0,dp[1],[er[0],0,er[1]],3.6,Math.min(7,h2-1.5),dd===0);
  blocks.push({al:al,rin:rin,dep:dep,w:w,hIn:hIn});}
 site.blocks=blocks;
 // THE OUTLYING MONOLITHS: broken stubs round the podium
 const MA=[20,52,138,164,198,232,326,352];
 for(let i=0;i<MA.length;i++){if(rng()<.15)continue;const al=MA[i]*Math.PI/180+rr(-.08,.08),r=rr(104,136),er=[Math.cos(al),Math.sin(al)],et=[-Math.sin(al),Math.cos(al)];
  const w=rr(7,12),dp=rr(4,6.5),h=rr(14,40)*(dd?rr(.5,.9):1),P=(a,b)=>[(r+a)*er[0]+b*et[0],(r+a)*er[1]+b*et[1]];
  const top=[h,h*rr(.55,.9),h*rr(.75,1),h];if(rng()<.5)top.reverse();
  siBlk(CG.S.wall,CG.S.deck,[P(-dp/2,-w/2),P(-dp/2,w/2),P(dp/2,w/2),P(dp/2,-w/2)],-1,top);
  kput(dd?'siBoxR':'siBox',[r*er[0],.3,r*er[1]],qFacing([er[0],0,er[1]]),[w+2.4,1.6,dp+2.4],null);
  if(i===1||i===5){const dq=P(-dp/2-.2,0);siDoor(CG,dq[0],0,dq[1],[-er[0],0,-er[1]],2.4,4.5,dd===0);}
  REGISTER({name:'Skyscraper I — an outlying monolith',x:r*er[0],z:r*er[1],r:Math.max(w,dp)/2+2,h:h+2});}
 siFlushSet(CG.S,dd,G);
 // ================= the body
 const HOLE=dd?holeFn(dd*.75,9761,d===1?SI_SNAP:(d===2?SI_CUT:null),1.1):null,HOLEU=dd?holeFn(dd*.75,9765,null,1.1):null;
 const build=(P,dx,y0,y1,upper)=>{
  const C={S:siSet(new THREE.Matrix4().makeTranslation(0,-y0,0)),dx:dx,y0:y0,kit:true,figs:d===0,hole:dx?(upper?HOLEU:HOLE):null,jseed:9762,
   kp:(n,p,q,s,c)=>kput(n,[p[0],p[1]-y0,p[2]],q,s,c)};
  const yLo=upper?y0:SI_Y0,cut=y1!=null?y1:(d===1&&!upper?SI_SNAP:null),yHi=cut!=null?cut:SI_H;
  siCore(C,yLo,yHi,!!upper,cut!=null);
  // STEPPED MASSES on the shaft between the strands: rooms that project from
  // it wherever no strand passes, each with a lit slot, some with a set-back
  // block on top — the blocky vocabulary of the foot carried up the shaft
  {const TM=siTh(SI_YE),bx=dx?'siBoxR':'siBox';
   const passes=(s,al)=>{const out=[],sg=s?-1:1;for(let T0=(((al-SI_A0-(s?Math.PI:0))*sg)%TAU+TAU)%TAU;T0<=TM;T0+=TAU)out.push(siThInv(T0));return out;};
   for(let i=0;i<46;i++){const y=rr(SI_YS+10,352),al=rng()*TAU,h=rr(9,20),w=rr(7,14),dp=rr(3,6);
    if(y<yLo+8||y>yHi-14)continue;
    let ok=true;for(const s of [0,1])for(const yp of passes(s,al)){const T=siT(clamp((yp-SI_YS)/(SI_YE-SI_YS),0,1));if(yp-T-5<y+h/2&&yp+5>y-h/2)ok=false;}
    if(!ok)continue;
    const f=siFacet(al),n=[Math.cos(f.mid),0,Math.sin(f.mid)],r=siPolyR(siCR(y),al)+dp/2-.4,q=qFacing(n),c=Math.cos(al),sn=Math.sin(al);
    C.kp(bx,[r*c,y,r*sn],q,[w,h,dp],null);
    if(h>13)C.kp(bx,[(r+dp*.25)*c,y+h/2+2.5,(r+dp*.25)*sn],q,[w*.6,5,dp*.5],null);
    C.kp(dx?'siDim':'siLit',[(r+dp/2+.03)*c,y-h*.1,(r+dp/2+.03)*sn],q,[.8,h*.45,.1],null);}}
  const jagS=s=>(h3(s*5.3,2.9,C.jseed)-.5)*12;
  for(const s of [0,1]){
   const lo=upper?y0+jagS(s):SI_Y0,hi=cut!=null?Math.min(SI_YE,cut+jagS(s)):SI_YE;
   const capA=upper?'sect':'wall',capB=cut!=null&&hi<SI_YE?'sect':'wall';
   if(d===1&&!upper&&site.brk){const K=site.brk[s];
    // the ruin: strand A broken below its hinge, hanging; B broken through,
    // its middle on the plain
    siStrand(C,s,lo,K.y0,{capA:capA,capB:'sect'});
    if(K.hang){const HC={S:siSet(new THREE.Matrix4().makeTranslation(0,-y0,0).multiply(K.M)),dx:dx,y0:y0,kit:false,hole:null,jseed:9763,kp:()=>{}};
     siStrand(HC,s,K.y0+.8,K.y1,{capA:'sect',capB:'wall',stairs:true});siFlushSet(HC.S,dx,P);
     siStrand(C,s,K.y1,hi,{capA:'wall',capB:capB});}
    else siStrand(C,s,K.y1,hi,{capA:'sect',capB:capB});}
   else siStrand(C,s,lo,hi,{capA:capA,capB:capB});}
  siFlushSet(C.S,dx,P);};
 // ---- the ruin's breaks, placed so the damage faces the sun and the camera:
 // B broken where it runs south-east, A hanging where it runs south-west
 if(d===1){const near=(s,ya,yb,want)=>{let best=ya,bd=9;for(let y=ya;y<yb;y+=1){const th=siStr(s,y).th;let e=Math.abs(((th-want)%TAU+TAU+Math.PI)%TAU-Math.PI);if(e<bd){bd=e;best=y;}}return best;};
  const yB0=near(1,140,215,70*Math.PI/180),yA0=near(0,215,285,118*Math.PI/180);
  const QA=siStr(0,yA0+48),hp=siP((QA.ri+QA.ro)/2,QA.th,yA0+48);
  const rad=new THREE.Vector3(Math.cos(QA.th),0,Math.sin(QA.th)),tan=new THREE.Vector3(-Math.sin(QA.th),0,Math.cos(QA.th));
  const R=new THREE.Matrix4().makeRotationAxis(tan,.42).multiply(new THREE.Matrix4().makeRotationAxis(rad,-.55));
  const M=new THREE.Matrix4().makeTranslation(hp[0],hp[1],hp[2]).multiply(R).multiply(new THREE.Matrix4().makeTranslation(-hp[0],-hp[1],-hp[2]));
  site.brk=[{y0:yA0,y1:yA0+48,hang:true,M:M},{y0:yB0,y1:yB0+56,hang:false}];
  site.hinge=hp;site.hangLo=new THREE.Vector3().fromArray(siP(siStr(0,yA0).ro,siStr(0,yA0).th,yA0)).applyMatrix4(M).toArray();}
 const BP=new THREE.Group();BP.position.set(0,SI_Y0,0);G.add(BP);useGroupXF(BP);
 if(d!==2)build(BP,dd,SI_Y0,null,false);else build(BP,1,SI_Y0,SI_CUT,false);
 endGroupXF();
 // ---- the toppled upper body: laid on its braids, resting on the envelope
 if(d===2){const L=SI_H-SI_CUT,R0=siEnv(SI_CUT+2);let eps=-1;
  for(let y=SI_CUT+L*.3;y<=SI_H;y+=4)eps=Math.max(eps,Math.atan((siEnv(Math.min(y,SI_H-1))-R0)/(y-SI_CUT)));
  const ang=rr(-.22,.12),al=-Math.PI/2+eps,d0=PR+6;
  const U=new THREE.Group();U.rotation.set(0,-ang,al);U.position.set(Math.cos(ang)*d0,R0*Math.cos(eps)-1.5,Math.sin(ang)*d0);G.add(U);
  useGroupXF(U);build(U,1,SI_CUT,null,true);endGroupXF();
  const tipL=L*Math.cos(eps),bx0=Math.cos(ang)*d0,bz0=Math.sin(ang)*d0,dxv=Math.cos(ang),dzv=Math.sin(ang);
  rubbleRing(bx0,0,bz0,R0*.4,R0*1.6,150,3.8);
  for(let i=0;i<60;i++){const f=rng(),x=bx0+dxv*tipL*f+rr(-1,1)*R0*1.3,z=bz0+dzv*tipL*f+rr(-1,1)*R0*1.3;
   kput('rubble',[x,rr(.3,1.2),z],qEuler(rng()*3,rng()*3,rng()*3),[rr(1,3.5),rr(.6,1.6),rr(1,3.5)],new THREE.Color().setHSL(.08,.15,rr(.3,.5)));}
  REGISTER({name:'Skyscraper I — the Braid, its fallen upper body',x:bx0+dxv*tipL/2,z:bz0+dzv*tipL/2,r:tipL/2+R0,h:R0*2+6});
  site.topple={base:[bx0,bz0],tip:[bx0+dxv*tipL,bz0+dzv*tipL],R0:R0,ang:ang};}
 // ---- the ruin: strand B's missing middle lies on the plain in two pieces
 if(d===1){const K=site.brk[1],falls=[],thF=siStr(1,(K.y0+K.y1)/2).th;
  for(let p=0;p<2;p++){const ya=lerp(K.y0,K.y1,p/2)+1,yb=lerp(K.y0,K.y1,(p+1)/2)-1,Qm=siStr(1,(ya+yb)/2);
   const c=siP((Qm.ri+Qm.ro)/2,Qm.th,(ya+yb)/2-Qm.T/2);
   const FC={S:siSet(new THREE.Matrix4().makeTranslation(-c[0],-c[1],-c[2])),dx:1,y0:0,kit:false,hole:null,jseed:9764,kp:()=>{}};
   siStrand(FC,1,ya,yb,{capA:'sect',capB:'sect'});
   const Gp=new THREE.Group();G.add(Gp);siFlushSet(FC.S,1,Gp);
   const th=thF+(p?.28:-.12)+rr(-.05,.05),r=p?rr(150,160):rr(116,124);
   Gp.position.set(r*Math.cos(th),0,r*Math.sin(th));Gp.rotation.set(rr(-.2,.2)+(p?.5:-.3),rr(0,TAU),rr(.9,1.2)*(p?1:-1));
   siDrop(Gp,2.5);
   rubbleRing(Gp.position.x,0,Gp.position.z,6,34,70,3);
   REGISTER({name:'Skyscraper I — a fallen section of strand B',x:Gp.position.x,z:Gp.position.z,r:36,h:40});
   falls.push([Gp.position.x,Gp.position.z]);}
  site.falls=falls;
  // the snapped tip and the lost crown on the podium and the plain
  rubbleRing(0,SI_Y0,0,40,PR-8,160,4);
  for(let i=0;i<14;i++){const a=rng()*TAU,r=rr(60,130);
   kput('siBoxR',[r*Math.cos(a),rr(1,2.5),r*Math.sin(a)],qEuler(rr(-.4,.4),rng()*TAU,rr(-.4,.4)),[rr(4,9),rr(2.5,5),rr(4,12)],null);}}
 if(dd){scatterMoss(0,0,0,PR+2,PR+110,200,3.5);rubbleRing(0,0,0,PR+2,PR+60,110,3);trees(0,0,PR+50,PR+150,26);
  mossOnRing(0,SI_Y0,0,PR-16,110,3);vinesOnRing(0,SI_Y0-.2,0,PR-12.3,36,10);}
 // ---- what the presets are derived from
 const QS=siStr(0,SI_YS+44),QS2=siStr(0,SI_YS+80);
 site.street={eye:siP(Math.max(QS.ri,QS.cr)+4,QS.th,SI_YS+44+.34+1.7),look:siP((QS2.ri+QS2.ro)/2,QS2.th,SI_YS+80)};
 const yX=siThInv(Math.PI/2),QX=siStr(0,yX);site.cross={y:yX,th:QX.th,r:QX.ro};
 KOFF=[0,0,0];return G;}
