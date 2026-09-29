// ================================================================= VELADIGA (after Soleri, 1965)
// Soleri's other dam arcology, and formally the opposite of Theodiga. Theodiga
// is a straight wall with a cruciform of fins stuck on its face. Veladiga is an
// ARC in plan, and its whole downstream elevation is a row of colossal
// shield-shaped bays — arched over the top, sides sloping in to a flat sill —
// each a recessed cliff packed with dwellings, divided by splayed faceted
// piers. Height 250 m, population 15 000, per the sheet.
//
// The bay shape is defined ONCE and used three ways: it punches the face, its
// complement punches the recessed panel 46 m behind, and walking its outline
// sweeps the reveal between the two. That is what makes the bays read as deep
// pockets rather than shapes painted on a wall, and the arch soffit falls out
// of it for free.
function buildVeladiga(scene,gx,gz,d){reseed(9380+d);KOFF=[gx,0,gz];
 const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 const dd=d>0?1:0,skin=SHELL(dd);
 // A DAM HAS TO REACH THE ROCK. At RA=760/A=1.0 the abutments stopped 130-220 m
 // short of the canyon walls and the reservoir would simply have flowed round
 // the ends. Half-span is now 841 against an inner rock face at 759-841, so the
 // arc dies into the cliff at both ends.
 const H=250,RA=1000,A=1.0,NB=12,HALF=RA*Math.sin(A);
 REGISTER({name:'Veladiga — dam arcology ('+(d===2?'breached':STATE(d))+')',x:0,z:230,r:1000,h:H+110});
 const th_=y=>34+120*(1-y/H);
 const fp=(t,y,back)=>{const a=lerp(-A,A,t),s=Math.sin(a),c=Math.cos(a),o=th_(y)-(back||0);
  return[RA*s-s*o,y,RA*(1-c)+c*o];};
 const nd=t=>{const a=lerp(-A,A,t);return[-Math.sin(a),0,Math.cos(a)];};
 // ---- the shield-shaped bay ----------------------------------------------
 const SW=.84,SB=.50,Y0=70,Ys=155,Y1=226;
 const shTop=s=>Ys+(Y1-Ys)*Math.sqrt(clamp(1-Math.pow(s/SW,2),0,1));
 const shBot=s=>{const as=Math.abs(s);return as<=SB?Y0:Y0+(as-SB)/(SW-SB)*(Ys-Y0);};
 const inBay=(s,y)=>Math.abs(s)<SW&&y>shBot(s)&&y<shTop(s);
 const bayS=t=>{const i=Math.floor(clamp(t,0,.9999)*NB);return 2*(t*NB-i)-1;};
 const outl=p=>{
  if(p<.50){const s=lerp(-SW,SW,p/.50);return[s,shTop(s)];}
  if(p<.62){const q=(p-.50)/.12;return[lerp(SW,SB,q),lerp(Ys,Y0,q)];}
  if(p<.88){const q=(p-.62)/.26;return[lerp(SB,-SB,q),Y0];}
  const q=(p-.88)/.12;return[lerp(-SB,-SW,q),lerp(Y0,Ys,q)];};
 // the bay's opening half-width at a given height — the piers are its complement
 const sOpen=y=>{if(y<=Y0||y>=Y1)return 0;
  if(y<=Ys)return SB+(y-Y0)/(Ys-Y0)*(SW-SB);
  return SW*Math.sqrt(clamp(1-Math.pow((y-Ys)/(Y1-Ys),2),0,1));};
 // ---- THE BREACH ----------------------------------------------------------
 // A hole in a full dam does not stay a hole. The head behind it is 200 m of
 // water, and the jet erodes upward and outward until the notch is open to the
 // crest — dam failures unzip to the top, widening as they go, and scour the
 // foundation out beneath. So this is a ragged notch, WIDER AT THE TOP, severing
 // the crest completely and cutting down almost to the riverbed.
 const BT=.355,BW=.052,BFLOOR=12;
 const blast=d===2?(t,y)=>{const rag=.34*fbm(t*22+y*.004,y*.045,9381,3)-.17;
  const w=BW*(.40+1.35*clamp(y/H,0,1))*(1+rag*1.5);
  return Math.abs(t-BT)<w&&y>BFLOOR+rag*46;}:()=>false;
 const bx0=fp(BT,60,0)[0],bz0=fp(BT,60,0)[2];        // where the water came out
 // the washout: everything downstream of the notch is gouged into a channel
 const scour=(x,z)=>{if(d!==2)return 0;
  const w=150+Math.max(0,z-bz0)*.42;
  return-30*Math.exp(-Math.pow((x-bx0)/w,2))*clamp((z-bz0+60)/220,0,1);};
 const REC=46,FACE=[],PANEL=[],REV=[],PIER=[],DK=[];
 // ---- face, recessed panels, reveals --------------------------------------
 FACE.push(gridSurface((u,v)=>fp(u,v*H,0),NB*18,76,{uS:64,vS:16,
  hole:(u,v)=>{const y=v*H;return inBay(bayS(u),y)||blast(u,y);}}));
 FACE.push(gridSurface((u,v)=>{const a=lerp(-A,A,u),s=Math.sin(a),c=Math.cos(a);
  return[RA*s,v*H,RA*(1-c)];},NB*7,28,{uS:64,vS:16,hole:(u,v)=>blast(u,v*H)}));
 PANEL.push(gridSurface((u,v)=>fp(u,v*H,REC),NB*13,60,{uS:44,vS:12,
  hole:(u,v)=>{const y=v*H;return !inBay(bayS(u),y)||blast(u,y);}}));
 for(let i=0;i<NB;i++)REV.push(gridSurface((p,w)=>{const o=outl(p);
  return fp((i+(o[0]+1)/2)/NB,o[1],w*REC);},112,3,{uS:24,vS:2,
  hole:d===2?(p,w)=>{const o=outl(p);return blast((i+(o[0]+1)/2)/NB,o[1]);}:null}));
 // ---- the dwelling mosaic -------------------------------------------------
 for(let i=0;i<NB;i++)for(let cy=Y0+7;cy<Y1-5;cy+=6)for(let cs=-SW+.05;cs<SW;cs+=.07){
  if(!inBay(cs,cy))continue;
  const t=(i+(cs+1)/2)/NB;if(blast(t,cy))continue;
  if(rng()<.12)continue;
  const p=fp(t,cy,REC-2.2);
  const lit=d===2?rng()<.03:rng()<.62;
  kput('cell',p,qFacing(nd(t)),[7,4.4,1],lit?(rng()<.55?WARM:CYAN).clone().multiplyScalar(rr(.4,.95)):(dd?DEAD:new THREE.Color(0x18293a)));}
 // ---- PIERS: swept faceted buttresses, not stacked boxes -------------------
 // Their width is the complement of the bay opening, so they pinch to a waist
 // where the arches spring and flare above and below — which is what makes two
 // neighbouring piers read as the X-shaped masonry of the sheet.
 const pierHW=y=>Math.max(.11,1-sOpen(y));
 const pierPR=y=>20+50*clamp(1-Math.abs(y-Ys)/158,0,1);
 const sec=(u,hw,pr)=>{const P=[[-hw,0],[-hw*.55,pr],[0,pr*1.2],[hw*.55,pr],[hw,0]];
  const q=clamp(u,0,1)*4,i0=Math.min(3,Math.floor(q)),f=q-i0;
  return[lerp(P[i0][0],P[i0+1][0],f),lerp(P[i0][1],P[i0+1][1],f)];};
 for(let i=0;i<=NB;i++){const ti=i/NB;
  PIER.push(gridSurface((u,v)=>{const y=v*H,c=sec(u,pierHW(y),pierPR(y));
   return fp(ti+c[0]/(2*NB),y,-c[1]);},26,62,{uS:12,vS:16,
   hole:d===2?(u,v)=>blast(ti,v*H):null}));}
 // ---- base: battered plinth, storage and automated industry ---------------
 FACE.push(gridSurface((u,v)=>fp(u,v*Y0,-22*(1-v)),NB*9,12,{uS:64,vS:6,
  hole:(u,v)=>blast(u,v*Y0)}));
 for(let i=0;i<NB*2;i++){const t=(i+.5)/(NB*2);if(blast(t,30))continue;
  const p=fp(t,26,-30),n=nd(t);
  kput(BOXC(dd),[p[0],26,p[2]],qFacing(n),[44,46,44],null);
  kput('boxD',[p[0],26,p[2]],qFacing(n),[42,44,42],null);
  const q=fp(t,8,-52),a=lerp(-A,A,t);
  for(let j=0;j<3;j++)kput('archOpen',[q[0]+(j-1)*13*Math.cos(a),8,q[2]+(j-1)*13*Math.sin(a)],qFacing(n),[1.2,1.05,1.7],null);}
 // ---- CREST ---------------------------------------------------------------
 // Everything up here used to hang in mid air: the highway band sat 16 m above
 // a crest deck only 34 m wide, and the promenade blocks stood 34 m BEYOND the
 // downstream face with nothing under them. The deck is now a real cantilever
 // out to 96 m, on corbels, and every block stands on it.
 FACE.push(gridSurface((u,v)=>fp(u,H,lerp(th_(H),-62,v)),NB*9,7,{uS:64,vS:7,
  hole:(u,v)=>blast(u,H)}));
 FACE.push(gridSurface((u,v)=>fp(u,H-lerp(0,9,v),-62),NB*9,2,{uS:64,vS:2,
  hole:(u,v)=>blast(u,H)}));                                    // the deck's edge beam
 for(let i=0;i<NB*4;i++){const t=(i+.5)/(NB*4);if(blast(t,H))continue;
  beam(BOXC(dd),fp(t,H-46,0),fp(t,H-6,-56),5,9);}               // corbels under the overhang
 for(let i=0;i<NB*3;i++){const t=(i+.5)/(NB*3);if(blast(t,H))continue;
  const n=nd(t),p=fp(t,H,-30);
  kput(BOXC(dd),[p[0],H+9,p[2]],qFacing(n),[24,18,26],null);
  if(i%3===0){const q=fp(t,H,-4);kput(BOXC(dd),[q[0],H+14,q[2]],qFacing(n),[28,28,30],null);
   kput(d>0?'ringR':'ringW',[q[0],H+29,q[2]],qEuler(Math.PI/2,0,0),[16,16,3],null);}
  const lit=d===2?rng()<.08:true;
  kput('strip',[p[0],H+19,p[2]],qFacing(n),[17,1,1],lit?CYAN:DEAD);}
 // the undulating highway band, sitting ON the deck
 FACE.push(gridSurface((u,v)=>{const p=fp(u,H,lerp(-30,-58,v));
  return[p[0],H+3+7*Math.sin(u*NB*Math.PI*2)+2*fbm(u*9,1.2,9382,2),p[2]];},NB*9,3,{uS:64,vS:3,
  hole:(u,v)=>blast(u,H)}));
 // ---- two circular pads on stalks, out over the water ---------------------
 for(const sg of [-1,1]){const t=.5+sg*.27,n=nd(t),bp=fp(t,H,0);
  const px=bp[0]-n[0]*250,pz=bp[2]-n[2]*250;
  kput(d>0?'colR':'colW',[px,0,pz],null,[10,H+30,10],null);
  mesh(lathe({rFn:y=>70*(1-.1*y/12),H:12,nu:9,nv:3,hole:holeFn(dd*.6,9383+sg,null,2)}),skin,G,px,H+24,pz);
  kput(SLABC(dd),[px,H+37,pz],null,[72,2.5,72],null);
  kput(dd>0?'ringR':'ringW',[px,H+50,pz],qEuler(Math.PI/2,0,0),[64,64,4],null);
  for(let k=0;k<9;k++){const a=k/9*TAU;
   kput(dd>0?'strutR':'strutW',[px+Math.cos(a)*61,H+44,pz+Math.sin(a)*61],qEuler(0,-a,0),[5,16,5],null);}
  if(sg>0)for(let k=0;k<5;k++){const a=k/5*TAU;
   beam(dd>0?'strutR':'strutW',[px+Math.cos(a)*32,H+39,pz+Math.sin(a)*32],[px,H+76,pz],4,4);}
  else mesh(lathe({rFn:y=>36*Math.sqrt(clamp(1-Math.pow(y/28,2),0,1)),H:28,nu:24,nv:8}),d===0?MAT.glass:MAT.dark,G,px,H+38,pz);
  for(let k=0;k<8;k++){const q=k/7,cx=lerp(bp[0],px,q),cz=lerp(bp[2],pz,q);
   kput(BOXC(dd),[cx,H+18,cz],qFacing(n),[15,3,36],null);
   if(k%2===0)kput(dd>0?'colR':'colW',[cx,0,cz],null,[5,H+17,5],null);}}   // the causeway now has piers
 // ---- reservoir, canyon, and the park -------------------------------------
 const WL=d===2?BFLOOR+16:H-24;
 mesh(gridSurface((u,v)=>{const a=lerp(-A,A,u),s=Math.sin(a),c=Math.cos(a);
  const w=clamp(RA*s*(1+v*.36),-820,820);
  return[w,WL,RA*(1-c)-v*820];},40,16,{}),MAT.water,G);
 for(const sg of [-1,1]){const CX=sg*1100;
  mesh(gridSurface((u,v)=>{const z=-980+u*2500,y=v*(H+170);
   const gully=32*Math.pow(Math.abs(fbm(u*17,v*3,9386+sg,3)-.5)*2,1.7);
   const strata=12*Math.sin(v*30+fbm(u*4,0,9387,2)*7);
   return[CX-sg*(330-40*fbm(u*12,v*7,9388+sg,4)-gully-strata),y,z];},96,36,{uS:44,vS:16}),MAT.rock,G);
  mesh(gridSurface((u,v)=>{const z=-980+u*2500;return[CX+(v-.5)*660,H+170+28*fbm(u*8,v*8,9389+sg,2),z];},50,10,{uS:44,vS:22}),MAT.rock,G);}
 // the park: terraced down from the dam toe, with the outfall channel running
 // through it — and, when breached, gouged out by the washout
 // The park. Two things had to be got right here. The terraces and the outfall
 // channel are driven off ONE parameterisation, because when they had separate
 // v-ranges their steps fell out of phase and the water sat proud of the grass
 // it was supposed to be running through. And the whole surface stays above
 // y=0: the world ground plane sits at y=-0.05, so anything that dips below it
 // is simply occluded, which was the bare orange showing through the lawn.
 const pV=z=>clamp((z-150)/1340,0,1);
 const pTerr=z=>-Math.floor(pV(z)*7)*1.4;
 const pCh=z=>7-4*pV(z);
 const pY=(x,z)=>Math.max(.8,12+pTerr(z)-pCh(z)*Math.exp(-Math.pow((x-bx0*.35)/115,2))
   +3*fbm(x*.004+3,z*.004,9385,3)+scour(x,z));
 mesh(gridSurface((u,v)=>{const x=(u-.5)*2160,z=150+v*1340;return[x,pY(x,z),z];},54,42,{uS:32,vS:24}),
  d===2?MAT.mud:MAT.lawn,G);
 if(d!==2)mesh(gridSurface((u,v)=>{const x=(u-.5)*126+bx0*.35,z=170+v*1300;
  return[x,12+pTerr(z)-pCh(z)*.42,z];},10,34,{}),MAT.water,G);
 // ---- breach aftermath ----------------------------------------------------
 if(d===2){
  // The living-terrace floor plates, in section at the tear. These used to be
  // drawn as full-width shelves spanning the breach, which is the one thing
  // they would NOT do: a plate whose lateral span has been blown away is a
  // cantilever with nothing holding its free end. So each level keeps only a
  // stub off each edge of the tear, and the stub droops as it projects.
  const bhw=y=>BW*(.40+1.35*clamp(y/H,0,1));   // tear half-width in t at height y
  const ARC=RA*2*A;                            // metres per unit of t
  for(let y=Y0;y<Y1;y+=11){const hw=bhw(y);
   for(let si=0;si<2;si++){const sg=si?1:-1;
    // How far the stub survives, in METRES. Picking this as a fraction of the
    // tear width was the mistake: the tear is ~153 m half-width at the crest,
    // so a plausible-looking 0.5 fraction cantilevered the top plates 80 m into
    // the void and they read as black feathers. A few metres to ~16 is the
    // range a blown slab actually holds; under 2.5 the level went clean.
    const proj=17*fbm(y*.052,sg*3.1,9387,3)+5*rng()-3.4;
    if(proj<2.5)continue;
    const st=proj/(hw*ARC),span=.18+st,sag=proj*.42*(.5+rng());
    FACE.push(gridSurface((u,v)=>{
     const f=u*span,t=BT+sg*hw*(1.18-f);
     const g=clamp((f-.18)/Math.max(st,1e-3),0,1);  // 0 at the wall, 1 at the free end
     // droop, plus a slow warp across the depth so the slab is not a flat card
     const dy=-g*g*sag+.3*proj*g*Math.sin(v*2.3+y*.07)*fbm(u*4,v*4+y*.03,9388,2);
     return fp(t,y+dy,REC*(.15+v*1.75));},10,5,{
     // the free tip is broken, not sawn: rag it away with increasing bias
     hole:(u,v)=>{const g=clamp((u*span-.18)/Math.max(st,1e-3),0,1);
      return fbm(u*6+y*.02,v*5,9389,3)<.14+.44*g*g;}}));}}
  // plates that came down whole, lying in the scour fan
  for(let k=0;k<9;k++){const sp=Math.pow(rng(),.7);
   kput(BOXC(1),[bx0+rr(-200,200)*(.5+sp),rr(2,9),bz0+110+sp*560],
    qEuler(rr(-.5,.5),rng()*3,rr(-.5,.5)),[rr(20,46),rr(1.4,3),rr(16,40)],null);}
  rubbleRing(bx0,0,bz0+150,40,420,240,6);
  for(let k=0;k<44;k++){const sp=Math.pow(rng(),.6);            // blocks carried downstream
   kput(BOXC(1),[bx0+rr(-260,260)*(.4+sp),rr(1,11),bz0+80+sp*820],qEuler(rng()*3,rng()*3,rng()*3),
    [rr(16,50),rr(11,30),rr(16,46)],null);}
  scatterMoss(bx0,0,bz0+240,0,520,180,3.4);
  trees(0,900,220,820,30);
  mossOnSurface(FACE,0,0,0,180,3);vinesFromLedge(FACE,0,0,0,80,30);stainsFromLedge(FACE,0,0,0,110,30);}
 else{for(let i=0;i<NB;i++){const t=(i+.5)/NB,p=fp(t,Y0-4,REC*.4);
   kput('strip',[p[0],p[1],p[2]],qFacing(nd(t)),[42,1,1],CYAN);}
  trees(0,980,240,800,26);}
 meshMerged(FACE,CONC(dd),G);meshMerged(PANEL,skin,G);
 meshMerged(REV,CONC(dd),G);meshMerged(PIER,CONC(dd),G);meshMerged(DK,MAT.guts,G);
 figures(0,760,12,150);figures(0,520,8,100);
 KOFF=[0,0,0];return G;}
