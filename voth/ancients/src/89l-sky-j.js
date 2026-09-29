// ================================================================= SKYSCRAPER J — "the Whorl"
// A tower of stacked, undulating floor plates, each plate's outline turned a
// little from the one below so the stack reads as a slow spiral; ten swept
// ribs wrapping diagonally round the outside, binding the plates, pinched
// together and pulled apart in turn so the lattice between them opens into
// staggered oval voids; a broad five-storey base block with long balconies,
// over whose roof the ribs flare out like a trunk and on which they root —
// every other rib sweeping on over the edge and down to the plaza as a
// buttress root. The top plates flare into a cap and the ribs close over it
// into a sharp open-ribbed spire with a needle. Warm pale laminated stone.
//
// Heights: base roof 32, first tower plate 38.2, 64 plates at 4.6 m to the
// roof plate at 328, spire ribs meet at 424, needle to 436.
//
// Decay: 0 intact; 1 ruined — ribs snapped, splayed and gone, plates missing
// so the sky shows through the lattice, glazing mostly gone to a dark core,
// the spire broken off and its needle lying on the plaza; 2 toppled — the
// tower breaks at 150 m and the upper body lies on the plain, its spire
// snapped off beyond it; 3 rehabilitated — the level-1 fabric at HOLES=.55,
// standing whole (repairPass dresses it).
//
// Everything is a handful of merged meshes per group (stone, glazing, core),
// so the whole tower is ~12 draw calls; repeats (columns, figures, moss,
// rubble, trees) go through the kit.

// LAMINATED STONE. Grain runs along texture x, which is the sweep direction on
// both the ribs (u along the rib) and the plates (u round the edge), so the
// strata follow the form the way they do in the reference's timber model.
function sjStoneTex(dec){return canvasTex(512,512,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const wy=y+5*Math.sin(x/53+y/131)+2.5*Math.sin(x/19+1.3);
  const lam=Math.floor(wy/8),fl=wy-lam*8;
  let v=(h3(lam*1.7,.3,3.3)-.5)*9+(fbm(x/110,y/34,2.4,3)-.5)*22+(fbm(x/3.2,y/3.2,6.6,1)-.5)*7;
  if(fl<1)v-=7;
  const jx=x%256;if(jx<2||jx>253)v-=14;                       // a joint every 4 m along the sweep
  let r,gg,b;
  if(!dec){r=234+v;gg=219+v*.96;b=193+v*.9;}
  else{const wt=fbm(x/60,y/60,4.4,3),li=fbm(x/28,y/28,8.8,3),ch=fbm(x/9,y/9,1.9,2);
   r=124+v*1.2-(wt-.5)*110;gg=113+v*1.1-(wt-.5)*100;b=96+v-(wt-.5)*84;
   const st=fbm(x/240,y/9,3.7,2);r-=(st-.5)*40;gg-=(st-.5)*38;b-=(st-.5)*34;     // weathering streaked along the grain
   if(li>.62){const k=clamp((li-.62)*5,0,.55);r=lerp(r,92,k);gg=lerp(gg,106,k);b=lerp(b,70,k);}   // lichen
   if(ch<.27){r*=.72;gg*=.7;b*=.68;}}                         // spalled pockets
  D[i]=r;D[i+1]=gg;D[i+2]=b;D[i+3]=255;}
 g.putImageData(id,0,0);});}
// WINDOW WALL. One tile is 8 bays x 4 storeys (canvas 512 x 384: 64 px bays,
// 96 px storeys). Canvas top is the top storey (flipY), and inside each storey
// block the bottom rows are the slab edge, so v = (y - first plate)/(4 x 4.6)
// puts every slab band behind a plate. ~1/3 of the panes are lit rooms: warm
// by day through blue glass, and the emissive map is the same cells at night.
function sjWinTex(dec,emis){return canvasTex(512,384,(g,w,h)=>{const id=g.createImageData(w,h),D=id.data;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const sj=Math.floor(y/96),fy=y%96,ci=Math.floor(x/64),fx=x%64,lot=h3(ci*3.7+.4,sj*5.3+.9,9.1),lit=lot<.34;
  const band=fy>84||fy<6,mull=fx<3||fx>61||(fx>30&&fx<33),tran=fy>=60&&fy<63,t=fy/96;
  let r,gg,b;
  if(emis){if(!band&&!mull&&!tran&&lit){const k=(.5+.5*lot/.34)*(fy>66?.55:1);r=255*k;gg=178*k;b=104*k;}else r=gg=b=0;}
  else if(!dec){
   if(band){r=150;gg=141;b=126;}
   else if(mull||tran){r=214;gg=202;b=180;}
   else if(lit){const k=.8+.2*lot/.34;r=(fy>66?150:228)*k;gg=(fy>66?104:170)*k;b=(fy>66?70:112)*k;}
   else{const q=h3(ci*1.3,sj*2.1,4.4)*14;r=78-30*t+q;gg=110-30*t+q;b=140-24*t+q;}}
  else{const keep=h3(ci*2.9,sj*1.7,7.3),sh=fbm(x/6,y/6,2.2,2);
   if(band){r=76;gg=70;b=62;if(sh<.4){r*=.7;gg*=.7;b*=.7;}}
   else if(mull&&keep>.35){r=64;gg=58;b=52;}
   else if(keep>.8&&sh>.45){r=58+30*t;gg=68+30*t;b=76+26*t;}     // a pane still in
   else{r=16+8*(1-t);gg=15+7*(1-t);b=13+6*(1-t);}}                  // gone: the dark room
  D[i]=r;D[i+1]=gg;D[i+2]=b;D[i+3]=255;}
 g.putImageData(id,0,0);});}
TEX.sjStone=sjStoneTex(0);TEX.sjStoneR=sjStoneTex(1);
TEX.sjWin=sjWinTex(0,0);TEX.sjWinR=sjWinTex(1,0);TEX.sjWinE=sjWinTex(0,1);
MAT.sjStone=new THREE.MeshStandardMaterial({map:TEX.sjStone,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:.62,metalness:.06,side:DS});
MAT.sjStoneR=new THREE.MeshStandardMaterial({map:TEX.sjStoneR,roughnessMap:TEX.concreteRM,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.sjWin=new THREE.MeshStandardMaterial({map:TEX.sjWin,emissive:0xffffff,emissiveMap:TEX.sjWinE,emissiveIntensity:.75,color:0xffffff,roughness:.28,metalness:.25,side:DS});
MAT.sjWinR=new THREE.MeshStandardMaterial({map:TEX.sjWinR,color:0xffffff,roughness:1,metalness:0,side:DS});
MAT.sjPave=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0xd6c2a2,roughness:1,metalness:0,side:DS});
// the service core a ruin shows once its glazing is gone: dark board-formed concrete
MAT.sjCore=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x3c3733,roughness:1,metalness:0,side:DS});
// the warm line under each terrace lip: stone by day, lit at night (NIGHT is
// read at render time, so nothing is rebuilt when the view flips)
MAT.sjGlow=new THREE.MeshStandardMaterial({color:0xe9d8b8,emissive:0xff9440,emissiveIntensity:0,roughness:.8,metalness:0,side:DS});
MAT.sjPaveR=new THREE.MeshStandardMaterial({map:TEX.concrete,roughnessMap:TEX.concreteRM,color:0x8c7c66,roughness:1,metalness:0,side:DS});

// gridSurface with a UV function, which is also handed the point it maps
function sjGrid(fn,nu,nv,uvf,hole){const pos=[],uv=[],idx=[],cols=nu+1;
 for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const u=i/nu,v=j/nv,p=fn(u,v),t=uvf(u,v,p);pos.push(p[0],p[1],p[2]);uv.push(t[0],t[1]);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){if(hole&&hole((i+.5)/nu,(j+.5)/nv))continue;const a=j*cols+i,b=a+1,c=a+cols,e=c+1;idx.push(a,c,b,b,c,e);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();return g;}
// A swept rib: a rounded-rectangle section (half-depth H along `ref`, half-
// width W across it) carried along a point list, with optional end caps on
// their own vertices so the rim does not smooth-shade into the cap.
function sjSweep(pts,W,H,ref,cap0,cap1){const seg=10,n=pts.length,pos=[],uv=[],idx=[],cs=[],C=seg+1;
 for(let j=0;j<=seg;j++){const a=j/seg*TAU,c=Math.cos(a),s=Math.sin(a);cs.push([Math.sign(c)*Math.pow(Math.abs(c),.7),Math.sign(s)*Math.pow(Math.abs(s),.7)]);}
 const T=new THREE.Vector3(),N=new THREE.Vector3(),B=new THREE.Vector3(),R=new THREE.Vector3();let L=0;
 for(let i=0;i<n;i++){const p=pts[i],a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];T.set(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize();
  if(i)L+=Math.hypot(p[0]-pts[i-1][0],p[1]-pts[i-1][1],p[2]-pts[i-1][2]);
  const r=ref?ref(p,i):[p[0],0,p[2]];R.set(r[0],r[1],r[2]);N.copy(R).addScaledVector(T,-R.dot(T));if(N.lengthSq()<1e-8)N.set(1,0,0);N.normalize();B.crossVectors(T,N);
  for(let j=0;j<=seg;j++){const c=cs[j],h=H[i]*c[0],w=W[i]*c[1];pos.push(p[0]+N.x*h+B.x*w,p[1]+N.y*h+B.y*w,p[2]+N.z*h+B.z*w);uv.push(L/8,j/seg*1.5);}}
 for(let i=0;i<n-1;i++)for(let j=0;j<seg;j++){const a=i*C+j,b=a+1,c=a+C,e=c+1;idx.push(a,c,b,b,c,e);}
 const cap=(i,fl)=>{const o=pos.length/3,p=pts[i];pos.push(p[0],p[1],p[2]);uv.push(0,0);
  for(let j=0;j<=seg;j++){const k=(i*C+j)*3;pos.push(pos[k],pos[k+1],pos[k+2]);uv.push(cs[j][0]*.3,cs[j][1]*.3);}
  for(let j=0;j<seg;j++)fl?idx.push(o,o+1+j,o+2+j):idx.push(o,o+2+j,o+1+j);};
 if(cap0&&n>1)cap(0,0);if(cap1&&n>1)cap(n-1,1);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(idx);g.computeVertexNormals();return g;}
// A floor plate: a closed radial profile [f, off, dy] swept round the plan —
// r = ri + (re - ri) f + off — from the inner edge across the top, over the
// upturned lip and nose, and back along the soffit.
const SJ_PT=[[0,0,0],[1,-2.4,0],[1,-1.1,.3],[1,-.5,1.1],[1,.05,1.05],[1,.4,.25],[1,.15,-.9],[1,-1.1,-1.4],[1,-4.2,-1.05],[0,0,-1.05]];
const SJ_PM=[[0,0,0],[1,-1.3,0],[1,-.35,.55],[1,.2,.05],[1,-.15,-.6],[1,-2.2,-.6],[0,0,-.6]];
// `wv(th)` optionally lifts the outer edge (the f=1 points) so it rolls.
function sjPlate(y,reF,riF,prof,nu,hole,wv){const nv=prof.length-1;
 return sjGrid((u,v)=>{const th=u*TAU,p=prof[Math.round(v*nv)],re=reF(th),ri=riF(th),r=ri+(re-ri)*p[0]+p[1];return[r*Math.cos(th),y+p[2]+(wv?wv(th)*p[0]:0),r*Math.sin(th)];},
  nu,nv,(u,v,p)=>[u*Math.max(4,Math.round(TAU*reF(0)/10)),(Math.hypot(p[0],p[2])+p[1]-y)/8],hole);}
// What the presets need: filled per decay by the builder.
const SJ_SITE={};
function sjGlowOn(m){if(m)m.onBeforeRender=()=>{MAT.sjGlow.emissiveIntensity=NIGHT?.6:0;};}

function buildSkyJ(scene,gx,gz,d){reseed(9770+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const HO=dd*HOLES;                                  // 1 ruined/toppled, .55 rehabilitated
 const YB=32,BS=6.4,HS=4.6,YS0=YB+6.2,NP=64,YTOP=YS0+(NP-1)*HS,YSP=424,NR=8,YF=112,CUT=150,RP=122;
 const STONE=dd?MAT.sjStoneR:MAT.sjStone,WINM=dd?MAT.sjWinR:MAT.sjWin;
 REGISTER({name:'Skyscraper J — the Whorl ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:RP,h:(d===2?CUT+30:YSP+14)});
 REGISTER({name:'the Whorl — base block',x:0,z:0,r:98,h:YB+2});
 // ENVELOPE. Et is the mean plate radius: a trunk flare off the base roof, a
 // slight belly, a waist, and a cap flaring just under the roof plate.
 const Et=y=>{const t=clamp((y-YS0)/(YTOP-YS0),0,1);return 38+5*Math.sin(Math.PI*Math.pow(t,.8))-9*t*t+9*Math.exp(-Math.max(0,y-YB)/22)+6*Math.exp(-Math.pow((t-.985)/.07,2));};
 const phi=y=>(y-YS0)/HS*.1, psi=y=>1.3-(y-YS0)/HS*.045;          // plate twist: one turn up the tower
 const Rs=y=>{const u=clamp((y-YTOP)/(YSP-YTOP),0,1);return Et(YTOP)*(1+.16*Math.sin(Math.PI*Math.min(1,u*2.2)))*Math.pow(1-u,1.25)+.6*u;};
 const Rb=th=>74*(1+.13*Math.cos(2*th)+.05*Math.cos(3*th+1));
 const bal=(th,s)=>Math.max(.8,3.4+2.4*Math.sin(2*th+s*1.3)+1.2*Math.sin(5*th-s*.8));
 // RIBS. Ten, one turn up the body; each wobbles against its neighbours in
 // antiphase, so adjacent ribs kiss and part and the lattice opens into
 // staggered ovals. Even ribs are roots: over the roof edge to the plaza.
 const KT=TAU*1.0/(YTOP-YS0),AW=Math.PI/NR*.92;
 // The wobble's vertical period was 58 m, so each oval void was ~29 m tall on
 // a 300 m body and the lattice read as a dense helix. At 92 m the ovals are
 // ~46 m tall, about as tall as the body is wide: big, legible voids.
 const ribTh=(i,y)=>{const a=TAU*(y-YS0)/92+Math.PI*i+.5*Math.sin(y/41+i*1.7);const A=AW*(y<YB?.35:y<YF?lerp(.35,1,(y-YB)/(YF-YB)):1);
  return{th:TAU*i/NR+KT*(y-YS0)+A*Math.sin(a),nd:Math.pow(Math.sin(a),2)};};
 const RL=[];for(let i=0;i<NR;i++){const th=ribTh(i,YB).th;RL.push(i%2===0?Rb(th)+bal(th,5)+2.2:Rb(th)-9);}
 const ribR=(i,y)=>{if(y>=YTOP)return Rs(y);const rt=Et(y);if(y>=YF)return rt;
  if(y>=YB){const s=(YF-y)/(YF-YB);return rt+(RL[i]-Et(YB))*s*s;}
  const q=(YB-y)/YB;return RL[i]+30*q-8*q*q;};
 const ribSc=y=>y<YF?1+.7*Math.pow((YF-Math.max(y,0))/YF,1.5):y>YTOP?Math.max(.3,Math.pow(1-(y-YTOP)/(YSP-YTOP),.7)):1;
 const ribW=(nd,sc)=>(3.0+2.6*nd)*sc;
 const ribPt=(i,y)=>{const t=ribTh(i,y),r=ribR(i,y);return[r*Math.cos(t.th),y,r*Math.sin(t.th)];};
 // one rib piece between heights a and b, optionally carried through a matrix
 const ribGeo=(i,a,b,oy,M,c0,c1)=>{if(b-a<1)return null;const n=Math.max(2,Math.ceil((b-a)/(a>YTOP?1.6:2.4)));const P=[],W=[],H=[],v=new THREE.Vector3();
  for(let k=0;k<=n;k++){const y=a+(b-a)*k/n,p=ribPt(i,y),t=ribTh(i,y),sc=ribSc(y);v.set(p[0],p[1],p[2]);if(M)v.applyMatrix4(M);
   P.push([v.x,v.y+oy,v.z]);W.push(ribW(t.nd,sc));H.push((1.5+.45*t.nd)*sc);}
  return sjSweep(P,W,H,null,c0,c1);};
 // THE RUIN PLAN, per rib (level 1 only): kept pieces [a,b,splay], and what fell.
 const PLAN=[],FELL=[];
 for(let i=0;i<NR;i++){const y0=i%2===0?-1.5:YB+.4;
  if(d!==1){PLAN.push([[y0,YSP,0]]);continue;}
  let top=YTOP+rr(-30,48);const pcs=[];let a=y0;
  if(i%2===0&&rng()<.4){const g=rr(10,22);pcs.push([a,rr(2,5),0]);FELL.push([i,g]);a=g;}       // root foot sheared off
  if(rng()<.45){const g=rr(YB+60,YTOP-90),L=rr(18,40);pcs.push([a,g,0]);FELL.push([i,L]);a=g+L;}   // a length knocked out
  const r3=rng();
  if(r3<.6){const yb=rr(Math.max(a+12,120),285);if(yb<top){pcs.push([a,yb,0]);                   // snapped:
   if(r3<.33){const L=rr(34,70);pcs.push([yb,yb+L,rr(.4,.8)]);FELL.push([i,top-yb-L]);}        //  splayed out, the rest gone
   else FELL.push([i,top-yb]);                                                                    //  or all gone above
   a=top+1;}}
  if(a<top){if(rng()<.35&&top-a>30){const yb=top-rr(16,30);pcs.push([a,yb,0]);pcs.push([yb,top+14,rr(.2,.45)]);}else pcs.push([a,top,0]);}
  PLAN.push(pcs);}
 // ------------------------------------------------------------- the body
 // part: 'all' standing, 'lower' the stump below the break, 'upper' the body
 // above it (ends under the spire, which breaks off on its own). Geometry is
 // made at absolute heights and dropped by ya, so P's origin is height ya.
 const gone=k=>{if(!dd||k<0||k>=NP)return false;const y=YS0+k*HS,t=(y-YS0)/(YTOP-YS0);
  return h3(k*2.3,1.7,9.9)<HO*(.16+.5*Math.pow(t,1.2)+(d===1&&y>YTOP-40?.4:0));};
 const rowY=j=>j<=0?YB:YS0+(j-1)*HS;                // glazing row j sits on plate j-1 (row 0 on the base roof)
 // THE FALLEN BODY'S PLATES CRUSH. They used to come down whole, so the body
 // lay on the plain as a cage of perfect vertical discs. Every plate vertex
 // that would stand below the ground once the body is laid down is pushed
 // back onto it and splayed sideways: each plate lands on a flattened,
 // spread foot, and the body sits down into its own wreckage. Set for the
 // toppled upper body only (it needs that body's lay-down, below).
 let CRUSH=null;
 const body=(P,dx,ya,yb,part)=>{const oy=-ya,stone=[],win=[],dark=[],plates=[],glow=[];
  const E0=Et;
  // PLATES
  for(let k=0;k<NP;k++){const y=YS0+k*HS,t=(y-YS0)/(YTOP-YS0),jag=(h3(k*1.9,3.1,5.7)-.5)*14;
   if(part==='lower'&&y>yb+jag)continue;if(part==='upper'&&y<=ya+jag)continue;
   if(gone(k))continue;
   const E=E0(y),ph=phi(y),ps=psi(y),roof=k===NP-1,ter=roof||k%3===0;
   const rb=ter?th=>E*(1+.2*Math.cos(2*(th-ph))+.08*Math.cos(3*(th-ps))+.03*Math.cos(5*th+k)):th=>E*(.94+.13*Math.cos(2*(th-ph-.35))+.05*Math.cos(3*(th-ps)));
   // THE PLATES REACH FOR THE RIBS. Where a plate's lobe falls short of a
   // rib it swells out to meet it, so every rib is carried by every plate it
   // crosses instead of floating clear of the trough.
   const RB=[];for(let i=0;i<NR;i++){const q=ribTh(i,y),rr0=ribR(i,y),gap=rr0-.4-rb(q.th);if(gap>0&&gap<.34*E)RB.push([q.th,gap*clamp((.34*E-gap)/(.12*E),0,1),ribW(q.nd,1)*1.5/rr0]);}
   const re=th=>{let r=rb(th);for(const b of RB){let a=Math.abs(th-b[0])%TAU;if(a>Math.PI)a=TAU-a;r+=b[1]*Math.exp(-Math.pow(a/b[2],2));}return r;};
   // and the edge rolls up and down with the lobes, so the plates read as
   // undulating bands rather than as a stack of discs
   const wv=ter?th=>.95*Math.sin(2*(th-ph)+1.1)+.4*Math.sin(3*(th-ps)):th=>.55*Math.sin(2*(th-ph)+.4);
   const ri=roof?(()=>0):dx>0?(th=>E*.22):(th=>Math.min(E*.6,re(th)-6));
   const hole=dx>0?(u,v)=>fbm(u*9+k*1.37,k*.61,71,2)<(.24+.28*t)*HO||(v>.3&&fbm(u*23+k,k*.3,72,2)<.38*HO)||(part==='upper'&&fbm(u*3.2+k*.9,k*.37,75,2)<.56):null;   // the fallen body: whole sectors broken off each plate
   const g=sjPlate(y+oy,re,ri,ter?SJ_PT:SJ_PM,ter?120:104,hole,wv);if(part==='upper'&&CRUSH)CRUSH(g);stone.push(g);plates.push(g);
   if(ter&&!dx)glow.push(sjGrid((u,v)=>{const th=u*TAU,r=re(th)-1.25-v*.9;return[r*Math.cos(th),y+oy-1.37+wv(th),r*Math.sin(th)];},120,1,(u,v)=>[u,v]));}
  // GLAZING between the plates, and in a ruin the dark core behind it
  // One row per storey, so a row can die with its floors: glazing only
  // survives where a plate above or below it still stands to hold it.
  let j0=0,j1=NP;
  if(part==='lower'){while(j1>1&&rowY(j1-1)>yb-2)j1--;}else if(part==='upper'){while(j0<NP&&rowY(j0)<ya-2)j0++;}
  const g0=rowY(j0),g1=rowY(j1);
  if(j1>j0){const nv=j1-j0,yv=v=>rowY(j0+Math.round(v*nv));
   win.push(sjGrid((u,v)=>{const th=u*TAU,y=yv(v),r=E0(y)*.66*(1+.05*Math.cos(2*(th-phi(y))));return[r*Math.cos(th),y+oy,r*Math.sin(th)];},96,nv,
    (u,v,p)=>[u*7,(p[1]-oy-YS0)/(4*HS)],dx>0?(u,v)=>{const j=j0+Math.floor(v*nv),y=rowY(j);const lost=gone(j-1)+gone(j);return lost===2||fbm(u*9+.3,y*.05,13,3)<(.5+.2*lost)*HO;}:null));
   if(dx>0)dark.push(sjGrid((u,v)=>{const th=u*TAU,y=g0+v*(g1-g0),r=E0(y)*.22;return[r*Math.cos(th),y+oy,r*Math.sin(th)];},24,Math.max(1,Math.round((g1-g0)/20)),(u,v)=>[u*3,v*(g1-g0)/8]));}
  // RIBS
  const spire=[];
  for(let i=0;i<NR;i++){const jr=(h3(i*4.1,2.2,6.6)-.5)*18;
   for(const pc of PLAN[i]){let a=pc[0],b=pc[1];
    if(part==='lower')b=Math.min(b,yb+jr);else if(part==='upper'){a=Math.max(a,ya+jr);b=Math.min(b,YTOP+7);}
    if(b<=a)continue;
    let M=null;if(pc[2]){const p=ribPt(i,a),th=ribTh(i,a).th;
     M=new THREE.Matrix4().makeTranslation(p[0],p[1],p[2]).multiply(new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(-Math.sin(th),0,Math.cos(th)),-pc[2])).multiply(new THREE.Matrix4().makeTranslation(-p[0],-p[1],-p[2]));}
    // above the roof plate a rib belongs to the spire's mesh (split with no
    // cap at the join, so the tube stays continuous)
    if(part==='all'&&a<YTOP&&b>YTOP+1){const g1=ribGeo(i,a,YTOP,oy,M,a>0,false),g2=ribGeo(i,YTOP,b,oy,M,false,b<YSP-1);if(g1)stone.push(g1);if(g2)spire.push(g2);}
    else{const g=ribGeo(i,a,b,oy,M,a>0,b<YSP-1);if(g)(part==='all'&&a>=YTOP?spire:stone).push(g);}}}
  // THE SPIRE: hoops tying the ribs, a glazed lantern, the needle. Its own
  // mesh, so its bounding box (and the inspector's probe) sits in the spire.
  if(part==='all'){
   // (a ruin keeps none of this: its roof plate, which carried the lantern, is gone)
   if(d!==1)[13,29,47].forEach((h,q)=>{const y=YTOP+h;
    spire.push(sjPlate(y+oy,th=>Rs(y)*1.04,th=>Rs(y)*1.04-2.8,SJ_PM,64,null));});
   const l1=YTOP+22,lr=y=>Rs(y)*.55;
   if(d!==1)win.push(sjGrid((u,v)=>{const th=u*TAU,y=YTOP-1+v*(l1-YTOP+1);return[lr(y)*Math.cos(th),y+oy,lr(y)*Math.sin(th)];},48,5,(u,v)=>[u*4,(YTOP-1+v*(l1-YTOP+1)-YS0)/(4*HS)],
    dx>0?(u,v)=>fbm(u*7,v*2,74,2)<.5*HO:null));
   if(d!==1)spire.push(sjPlate(l1+oy,th=>lr(l1)+.8,()=>0,SJ_PM,48,null));
   if(d!==1)spire.push(sjGrid((u,v)=>{const th=u*TAU,y=YSP-44+v*56,r=lerp(2.4,.1,Math.pow(v,.8));return[r*Math.cos(th),y+oy,r*Math.sin(th)];},12,10,(u,v)=>[u*2,v*7]));}
  meshMerged(stone,dx>0?MAT.sjStoneR:MAT.sjStone,P);meshMerged(spire,dx>0?MAT.sjStoneR:MAT.sjStone,P);meshMerged(win,dx>0?MAT.sjWinR:MAT.sjWin,P);meshMerged(dark,MAT.sjCore,P);sjGlowOn(meshMerged(glow,MAT.sjGlow,P));
  if(dx>0){mossOnSurface(plates,0,0,0,part==='all'?320:160,2.2);vinesFromLedge(plates,0,0,0,part==='all'?160:80,16);}
  return plates;};
 // ------------------------------------------------------------- the base block
 const bStone=[],bWin=[],bDark=[],slabs=[],bGlow=[];
 for(let s=1;s<=5;s++){const g=sjPlate(s*BS,th=>Rb(th)+bal(th,s),th=>s===5?0:Rb(th)-16,SJ_PT,144,dd?(u,v)=>fbm(u*11+s*2.1,s*.7,31,2)<.24*HO||(v>.3&&fbm(u*29+s,s,32,2)<.34*HO):null);bStone.push(g);slabs.push(g);
  if(!dd)bGlow.push(sjGrid((u,v)=>{const th=u*TAU,r=Rb(th)+bal(th,s)-1.25-v*.9;return[r*Math.cos(th),s*BS-1.37,r*Math.sin(th)];},144,1,(u,v)=>[u,v]));}
 const bh=dd?(u,v)=>fbm(u*14,v*3,41,3)<.56*HO:null;
 bWin.push(sjGrid((u,v)=>{const th=u*TAU,r=Rb(th)-1.2;return[r*Math.cos(th),BS+v*(YB-BS),r*Math.sin(th)];},144,4,(u,v)=>[u*18,v],bh));
 bWin.push(sjGrid((u,v)=>{const th=u*TAU,r=Rb(th)-9;return[r*Math.cos(th),.3+v*(BS-.3),r*Math.sin(th)];},144,1,(u,v)=>[u*17,v*.25],bh));
 if(dd)bDark.push(sjGrid((u,v)=>{const th=u*TAU,r=Rb(th)*.5;return[r*Math.cos(th),v*YB,r*Math.sin(th)];},48,2,(u,v)=>[u*12,v*4]));
 // the plaza and its skirt
 const pave=[sjGrid((u,v)=>{const th=u*TAU,r=v*RP;return[r*Math.cos(th),.3,r*Math.sin(th)];},96,3,(u,v)=>[u*48,v*RP/8]),
             sjGrid((u,v)=>{const th=u*TAU;return[RP*Math.cos(th),.3*(1-v),RP*Math.sin(th)];},96,1,(u,v)=>[u*48,v*.1])];
 // ground-floor loggia columns
 for(let k=0;k<72;k++){const th=(k+.5)/72*TAU,r=Rb(th)-3;if(dd&&rng()<.22*HO)continue;
  kput(dd?'postR':'postW',[r*Math.cos(th),BS/2,r*Math.sin(th)],null,[.75,BS-.6,.75],dd?null:new THREE.Color(0xf1e2c6));}
 // ------------------------------------------------------------- stand or fall
 const P=new THREE.Group();G.add(P);useGroupXF(P);
 const standPlates=body(P,dd,0,d===2?CUT:YSP+12,d===2?'lower':'all');endGroupXF();
 const site={x:gx,z:gz,YB,YTOP,YSP,RP,CUT};
 if(d===2){
  const ang=rr(-.3,.3),r0=Et(CUT)*1.18,r1=Et(YTOP)*1.12,L=YTOP+8-CUT,tau=Math.atan((r0-r1)/L),D0=Et(CUT)*1.3+8;
  // each plate is also knocked off true by up to ~12 degrees, so the body is a
  // jumble of tilted, broken plates and not a row of parallel discs
  CRUSH=g=>{const P=g.attributes.position,st=Math.sin(tau),ct=Math.cos(tau),y0=P.getY(0),ta=(h3(y0*.13,1.1,78.1)-.5)*.42,tb=(h3(y0*.17,2.3,78.2)-.5)*.42;
   for(let i=0;i<P.count;i++){P.setY(i,P.getY(i)+P.getX(i)*ta*.5+P.getZ(i)*tb);}
   for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),xg=((r0-1.2)-y*st)/ct-.25;
    if(x>xg){const e=x-xg,n=h3(i*.37,y*.21,77.7);P.setXYZ(i,xg-n*.9,y+(n-.5)*e*.35,z+Math.sign(z||1)*e*(.35+.4*n));}}
   g.computeVertexNormals();};
  const U=new THREE.Group();U.position.set(Math.cos(ang)*D0,r0-1.2,Math.sin(ang)*D0);U.rotation.set(0,-ang,-(Math.PI/2+tau));G.add(U);
  useGroupXF(U);body(U,1,CUT,YTOP+8,'upper');endGroupXF();
  // the spire, snapped off at the cap and thrown on past the body
  const S=new THREE.Group(),sp=[];
  for(let i=0;i<NR;i++){const top=YSP-rr(0,50)*(i%3===0?1:0);const g=ribGeo(i,YTOP+rr(2,9),top,-YTOP,null,true,top<YSP-1);if(g)sp.push(g);}
  sp.push(sjPlate(13,th=>Rs(YTOP+13)*1.04,th=>Rs(YTOP+13)*1.04-2.8,SJ_PM,64,(u,v)=>fbm(u*6,1,73,2)<.4));
  meshMerged(sp,MAT.sjStoneR,S);
  const Ld=D0+L*Math.cos(tau)+rr(60,80),a2=ang+(rng()<.5?-1:1)*rr(.2,.3);
  // yaw * lay-down * roll about its own axis, so the roll cannot tip it off the ground plane
  S.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(_UP,-a2+rr(-.3,.3)).multiply(qAxis(0,0,1,-Math.PI/2+.12)).multiply(qAxis(0,1,0,rr(0,TAU))));
  S.position.set(Math.cos(a2)*Ld,0,Math.sin(a2)*Ld);G.add(S);dropFragment(S,0,2.5);
  // rubble where it hit, along its length and round the stump
  for(let k=0;k<=4;k++){const s=D0+L*k/4;rubbleRing(Math.cos(ang)*s,0,Math.sin(ang)*s,r0*.7,r0*1.5,40,3.5);}
  rubbleRing(Math.cos(a2)*Ld,0,Math.sin(a2)*Ld,8,40,40,2.5);
  const mid=D0+L/2;REGISTER({name:'the Whorl — fallen upper body',x:Math.cos(ang)*mid,z:Math.sin(ang)*mid,r:L/2+12,h:r0*2+8});
  site.fall={ang,D0,L,r0,Ld,a2};}
 else REGISTER({name:'the Whorl — open-ribbed spire'+(d===1?' (broken)':''),x:0,z:0,y:YTOP,r:Et(YTOP)*1.2,h:d===1?60:YSP+12-YTOP});
 // ------------------------------------------------------------- fallen ribs (level 1)
 if(d===1){
  for(const f of FELL){const i=f[0],Lr=clamp(f[1]*.6,12,70),a=ribTh(i,YB).th+rr(-.4,.4),r=rr(RP*.8,RP*1.35),dir=a+Math.PI/2+rr(-.8,.8);
   const P0=[],W=[],H=[];const n=Math.ceil(Lr/2.4),bend=rr(-.12,.12)*Lr;
   for(let k=0;k<=n;k++){const t=k/n,s=(t-.5)*Lr;P0.push([r*Math.cos(a)+Math.cos(dir)*s-Math.sin(dir)*Math.sin(Math.PI*t)*bend,1.1,r*Math.sin(a)+Math.sin(dir)*s+Math.cos(dir)*Math.sin(Math.PI*t)*bend]);W.push(2.6+.8*Math.sin(Math.PI*t));H.push(1.4);}
   bStone.push(sjSweep(P0,W,H,()=>[0,1,0],true,true));rubbleRing(r*Math.cos(a),0,r*Math.sin(a),2,Lr*.6,14,2.4);}
  // the needle, down on the plaza
  const na=rr(0,TAU),nr=RP*.95,P1=[],W1=[],H1=[];for(let k=0;k<=10;k++){const t=k/10;P1.push([nr*Math.cos(na)+Math.cos(na+1.3)*t*44,1.2,nr*Math.sin(na)+Math.sin(na+1.3)*t*44]);const w=lerp(2.2,.3,t);W1.push(w);H1.push(w);}
  bStone.push(sjSweep(P1,W1,H1,()=>[0,1,0],true,true));}
 meshMerged(bStone,STONE,G);meshMerged(bWin,WINM,G);meshMerged(bDark,MAT.sjCore,G);sjGlowOn(meshMerged(bGlow,MAT.sjGlow,G));meshMerged(pave,dd?MAT.sjPaveR:MAT.sjPave,G);
 apron(G,0,0,RP,RP+20,dd,.3);
 // ------------------------------------------------------------- life and decay
 if(!dd){
  // the roof garden between the trunk and the roof edge, and people up there
  for(let k=0;k<26;k++){const th=rng()*TAU,r=rr(Et(YB)+8,Rb(th)-6);VEG.tree(r*Math.cos(th),YB,r*Math.sin(th),k%3,rr(5,9));}
  for(let k=0;k<40;k++){const th=rng()*TAU,r=rr(Et(YB)+4,Rb(th)-3),c=new THREE.Color().setHSL(rr(0,.1),rr(.2,.5),rr(.25,.5));
   kput('figB',[r*Math.cos(th),YB,r*Math.sin(th)],qEuler(0,rng()*TAU,0),1,c);kput('figH',[r*Math.cos(th),YB,r*Math.sin(th)],null,1,new THREE.Color(0xc9a17e));}
  figures(0,RP-18,10,14);figures(-RP+20,0,8,12);figures(RP-18,10,8,12);figures(0,-RP+18,6,10);
  trees(0,0,RP+6,RP+22,18);}
 else{
  mossOnSurface(slabs,0,0,0,180,2.6);vinesFromLedge(slabs,0,0,0,90,12);
  scatterMoss(0,0,0,Rb(0)*.6,RP+40,220,3.2);rubbleRing(0,0,0,86,RP+10,d===2?220:170,3.8);trees(0,0,RP-10,RP+24,26);}
 SJ_SITE[d]=site;
 KOFF=[0,0,0];return G;}
