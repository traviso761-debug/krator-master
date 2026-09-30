// ================================================================= IZIZ TRANSPLANT — the Iziz building families (claude/iziz-transplant.html, r5) ported to this repo
// Per family two vocabularies: the ORIGINAL Iziz massing (izBlock etc.) and the Ancients TRANSPLANT (drums, vaults,
// petal crowns), and for each a post-build `wreck()` pass that makes the destroyed or the rehabilitated state.
// Names are prefixed t*/T* where the showcase's would collide with the vendored kit. The pair functions themselves
// are the showcase's, unchanged, so the buildings are the ones Travis approved.
//
// Placement contract (used by the city): TRANS.place(scene, kind, mode, x, z, ry, scale, seed, extraTags, y) — mode is
// 'orig' | 'ruin' | 'rehab' (Iziz original: intact / destroyed / rehabilitated) or 'anc' | 'ancruin' | 'ancrehab'
// (Ancients transplant). Pueblo is defined but EXCLUDED from placement (Travis). Palace is 'orig' only, temple and
// arena 'anc' only, one of each, placed by the city target. TRANS.bake() merges the one-off meshes per material.
// The ANCIENT halves, wreck() and the ac* primitives now live in the Ancients kit (kits/ancients/src/77z-iziz-style.js,
// vendored here as src/77z-iziz-style.js): this file keeps the Iziz ORIGINAL halves and merges the two into TBY.
const TTIMBER=0x5e3f28,TTIMBER2=0x74513a,TTRIM=0x6e5428;
kdef('frus93',vnWedgeGeo(.93,.93),MAT.white);kdef('frus90',vnWedgeGeo(.9,.9),MAT.white);kdef('frus88',vnWedgeGeo(.88,.88),MAT.white);kdef('frus85',vnWedgeGeo(.85,.85),MAT.white);kdef('frus60',vnWedgeGeo(.6,.6),MAT.white);kdef('frusT',vnWedgeGeo(.42,.42),MAT.white);kdef('frusWd',vnWedgeGeo(.55,.1),MAT.white);kdef('frusPyr',vnWedgeGeo(.05,.05),MAT.white);kdef('frus82',vnWedgeGeo(.82,.82),MAT.white);
kdef('pent',new THREE.CylinderGeometry(.88,1,1,5).rotateY(Math.PI/5).translate(0,.5,0),MAT.white);kdef('hept',new THREE.CylinderGeometry(.8,1,1,7).translate(0,.5,0),MAT.white);
kdef('dome',new THREE.SphereGeometry(1,16,10,0,TAU,0,Math.PI/2),MAT.white);kdef('gable',vnWedgeGeo(1,.04),MAT.white);
kdef('lampI',new THREE.BoxGeometry(1,1,1),MAT.dot);
// --- Iziz primitives (originals) ------------------------------------------------------------------
function izBlock(x,y,z,w,h,d,ry,cc,o){o=o||{};const q=qEuler(0,ry,0);const col=tC(cc);kput('boxW',[x,y+h/2,z],q,[w,h,d],col);
 if(!o.plain){kput('boxW',[x,y+h-.4,z],q,[w+.6,.5,d+.6],tC(cc,1.12));kput('boxW',[x,y+h-1.2,z],q,[w+.3,.3,d+.3],tC(cc,.8));
  const n=Math.max(1,Math.round(w/2.2));for(let i=0;i<n;i++){const lx=((i+.5)/n-.5)*w*.8;for(const s of [-1,1]){const p=loc2(x,z,lx,s*(d/2+.05),ry);kput('finW',[p[0],y+h*.55,p[1]],q,[.7,h*.7,.3],null);}}}
 if(!o.noDoor){const p=loc2(x,z,0,d/2+.2,ry);kput('boxD',[p[0],y+1.5,p[1]],q,[1.6,3,.5],null);kput('boxW',[p[0],y+3.2,p[1]],q,[2.6,.35,.9],tC(0x8a6a3a));}
 if(o.roof){kput('boxW',[x+rr(-w*.2,w*.2),y+h+.6,z+rr(-d*.2,d*.2)],q,[1.2,1.2,1.2],tC(0x8a6a3a));}}
function izLamp(x,y,z){kput('lampI',[x,y+.5,z],null,[1.2,.7,1.2],WARM);}
// ---- the Iziz original halves: fn(P, x, z) builds one instance at x,z (palace and pueblo are original only)
const IZ_ORIG={};function izOrig(key,name,size,tall,fn){IZ_ORIG[key]={key,name,size,tall,fn};}
izOrig('box','Box house',24,false,(P,x,z)=>{const cc=TPAL[0];{izBlock(x,0,z,6,8,6,0,cc,{roof:true});izLamp(x+2,8,z+1);}});
izOrig('tier','Tiered house',24,false,(P,x,z)=>{const cc=TPAL[1];{izBlock(x,0,z,6.5,5,6.5,0,cc,{});izBlock(x,5,z,4.2,3.6,4.2,0,cc,{noDoor:true});}});
izOrig('domed','Domed house',24,false,(P,x,z)=>{const cc=TPAL[2];{izBlock(x,0,z,6,5.6,6,0,cc,{});kput('dome',[x,5.6,z],null,[3,3.6,3],tC(cc));}});
izOrig('barrel','Barrel house',26,false,(P,x,z)=>{const cc=TPAL[3];{kput('boxW',[x,1.4,z],null,[7,2.8,9.6],tC(cc));kput('dome',[x,2.8,z],null,[3.6,3.2,4.8],tC(cc));kput('boxD',[x,1.4,z+4.9],null,[1.6,2.6,.4],null);}});
izOrig('tent','Tent house',26,false,(P,x,z)=>{const cc=TPAL[4];{kput('frusPyr',[x,0,z],null,[9.6,5.6,9.6],tC(cc));kput('boxD',[x,1.3,z+4.6],null,[1.6,2.6,.4],null);}});
izOrig('pyr','Pyramid house',26,false,(P,x,z)=>{const cc=TPAL[5];{kput('frusPyr',[x,0,z],null,[7.5,8,7.5],tC(cc));kput('boxW',[x,7.2,z],null,[7.2,.8,7.2],tC(cc,1.1));kput('boxD',[x,1.4,z+3.6],null,[1.6,2.8,.4],null);}});
izOrig('setback','Setback tower',40,true,(P,x,z)=>{const cc=TPAL[6];const w=7,h=40;{izBlock(x,0,z,w*.95,h,w*.95,0,cc,{});izBlock(x,h,z,w*.6,h*.28,w*.6,0,cc,{noDoor:true});izBlock(x,h*1.28,z,w*.32,h*.16,w*.32,0,cc,{noDoor:true,plain:true});kput('boxW',[x,h*1.44+4,z],null,[.5,8,.5],tC(0x8a6a3a));izLamp(x,h*1.44+8,z);}});
izOrig('setback2','Setback tower (stepped)',40,true,(P,x,z)=>{const cc=TPAL[6];const w=7,h=40;{izBlock(x,0,z,w*.95,h,w*.95,0,cc,{});izBlock(x,h,z,w*.6,h*.28,w*.6,0,cc,{noDoor:true});izBlock(x,h*1.28,z,w*.32,h*.16,w*.32,0,cc,{noDoor:true,plain:true});kput('boxW',[x,h*1.44+4,z],null,[.5,8,.5],tC(0x8a6a3a));izLamp(x,h*1.44+8,z);}});
izOrig('tyrell','Tyrell block',40,true,(P,x,z)=>{const cc=TPAL_BRUT[0];const bw=13,h=30;{kput('frusT',[x,0,z],null,[bw,h,bw],tC(cc));for(let k=1;k<=3;k++){const f=k/4,s=1-(1-.42)*f;kput('boxW',[x,h*f,z],null,[bw*s+.6,.7,bw*s+.6],tC(TTRIM));}izLamp(x,h+.2,z);kput('boxD',[x,1.7,z+bw/2-.3],null,[2.2,3.4,.5],null);}});
izOrig('wedge','Wedge block',34,true,(P,x,z)=>{const cc=TPAL_BRUT[2];const w=10,d=14,h=22;{kput('frusWd',[x,0,z],null,[w,h,d],tC(cc));kput('boxD',[x,1.5,z+d/2-.3],null,[1.8,3,.5],null);}});
izOrig('pent','Pentagon block',30,true,(P,x,z)=>{const cc=TPAL_BRUT[1];const w=10,h=20;{kput('pent',[x,0,z],null,[w*1.3,h,w*1.3],tC(cc));kput('boxW',[x,h-.8,z],null,[w*1.3*.86+.6,.9,w*1.3*.86+.6],tC(TTRIM));kput('boxD',[x,1.5,z+w*.62],null,[1.8,3,.5],null);return;}
 mesh(lathe({rFn:yy=>w/2*(1-.12*yy/h),H:h,flutes:5,amp:.32,sharp:1,nu:60,nv:12}),tsand(cc,'c'),P,x,0,z);
 for(let s=0;s<5;s++){const y=s*4;mesh(lathe({rFn:()=>w/2*(1-.12*(y+3.4)/h)*1.08,H:.6,flutes:5,amp:.34,sharp:1,nu:60,nv:1}),tsand(cc,'c'),P,x,y+3.4,z);
  for(let k=0;k<5;k++){const th=k/5*TAU+.2;const r=w/2*(1-.12*(y+2)/h)*1.32+.1;kput('winSmI',[x+r*Math.cos(th),y+1.9,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.4,1.3,1],null);}}
 kput('slab',[x,h,z],null,[w*.5,.5,w*.5],tC(cc,1.1));acPetalCrown(P,x,h,z,w*.42,3.5,cc,5);kput('archOpen',[x,1.6,z+w/2*1.3-.3],qFacing([0,0,1]),[.3,.36,1],null);});
izOrig('hept','Heptagon block',30,true,(P,x,z)=>{const cc=TPAL_BRUT[3];const w=10,h=18;{kput('hept',[x,0,z],null,[w*1.3,h,w*1.3],tC(cc));kput('boxW',[x,h-.8,z],null,[w*1.3*.8+.6,.9,w*1.3*.8+.6],tC(TTRIM));kput('boxD',[x,1.5,z+w*.62],null,[1.8,3,.5],null);return;}
 mesh(lathe({rFn:yy=>w/2*(1-.2*yy/h),H:h,flutes:7,amp:.3,sharp:1,nu:70,nv:12}),tsand(cc,'c'),P,x,0,z);
 for(let yy=3;yy<h-2;yy+=4)for(let k=0;k<7;k++){const th=k/7*TAU;const r=w/2*(1-.2*yy/h)*1.3+.1;kput('ovalI',[x+r*Math.cos(th),yy,z+r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.7,.9,.8],null);}
 for(let yy=6;yy<h-2;yy+=6)kput('ringW',[x,yy,z],qEuler(Math.PI/2,0,0),[w/2*(1-.2*yy/h)*1.32,w/2*(1-.2*yy/h)*1.32,2],tC(cc,.85));
 mesh(lathe({rFn:yy=>w/2*.8*Math.sqrt(clamp(1-Math.pow(yy/2.5,2),0,1)),H:2.5,nu:28,nv:5}),tsand(cc,'c'),P,x,h-.2,z);kput('archOpen',[x,1.6,z+w/2*1.3-.3],qFacing([0,0,1]),[.3,.36,1],null);});
izOrig('hall','Deco long hall',36,false,(P,x,z)=>{const cc=TPAL[7];const L=18,Wd=11,h=10;{izBlock(x,0,z,L,h,Wd,0,cc,{noDoor:true});kput('gable',[x,h,z],null,[L+1.2,h*.55,Wd+1.2],tC(TTIMBER2));kput('boxW',[x,h+h*.55,z],null,[L+1.4,.4,.5],tC(TTIMBER));
  for(const s of [-1,1]){kput('boxW',[x+s*L*.5,h+h*.55+1,z],null,[.5,2.2,.5],tC(TTIMBER));}kput('boxD',[x,1.5,z+Wd/2+.3],null,[2.2,3,.5],null);kput('boxW',[x,3.6,z+Wd/2+1.5],null,[8,.4,3],tC(TTIMBER2));for(let k=-1;k<=1;k+=2)kput('boxW',[x+k*3.5,1.6,z+Wd/2+2.8],null,[.4,3.2,.4],tC(TTIMBER));
  kput('dot',[x+L*.3,h*.6,z+Wd/2+.3],null,[3,.8,.3],new THREE.Color(0x3ee0ff));}});
izOrig('stave','Stave hall with tower',40,false,(P,x,z)=>{const cc=TPAL[8];const L=15,Wd=15,h=12;{izBlock(x,0,z,L,h,Wd,0,cc,{noDoor:true});kput('gable',[x,h,z],null,[L+1,h*.55,Wd+1],tC(TTIMBER2));kput('gable',[x,h+h*.72,z],qEuler(0,Math.PI/2,0),[L*.62,h*.55,Wd*.75],tC(TTIMBER2));
  izBlock(x,h,z,Wd*.36,h*1.2,Wd*.36,0,cc,{noDoor:true,plain:true});kput('gable',[x,h*2.2,z],null,[Wd*.46,h*.55,Wd*.46],tC(TTIMBER));kput('boxW',[x,h*2.75+1.5,z],null,[.4,3,.4],tC(TTIMBER));izLamp(x,h*2.75+3,z);kput('boxD',[x,1.5,z+Wd/2+.3],null,[2.2,3,.5],null);}});
izOrig('compound','Walled compound',30,false,(P,x,z)=>{const ac=0xc98f5c,cc=TPAL[9];const W2=7.5,D2=7.5,h=6;{[[0,-D2,W2*2,1],[-W2,0,1,D2*2],[W2,0,1,D2*2],[-W2*.55,D2,W2*.9,1],[W2*.55,D2,W2*.9,1]].forEach(wl=>kput('boxW',[x+wl[0],1.1,z+wl[1]],null,[wl[2],2.2,wl[3]],tC(ac)));
  kput('frusPyr',[x,0,z],qEuler(0,.15,0),[W2*1.1*1.6,h*.7,D2*1.1*1.6],tC(cc));kput('boxW',[x-W2*.55,h*.3,z-D2*.5],null,[3,h*.6,3],tC(ac));kput('dome',[x-W2*.55,h*.6,z-D2*.5],null,[1.5,1.5,1.5],tC(ac));kput('boxD',[x,1.3,z+D2*.55],null,[1.6,2.6,.4],null);}});
izOrig('midrise','Midrise',30,true,(P,x,z)=>{const cc=TPAL[3];const w=7,h=22;{izBlock(x,0,z,w*1.15,h*.55,w*1.15,0,cc,{});izBlock(x,h*.55,z,w*.85,h*.3,w*.85,0,cc,{noDoor:true});izBlock(x,h*.85,z,w*.5,h*.15,w*.5,0,cc,{noDoor:true,plain:true,roof:true});}});
izOrig('stall','Market stall',14,false,(P,x,z)=>{{[[-2.4,-1.7],[2.4,-1.7],[-2.4,1.7],[2.4,1.7]].forEach(p=>kput('boxW',[x+p[0],1.4,z+p[1]],null,[.25,2.8,.25],tC(TTIMBER)));kput('frusPyr',[x,2.8,z],null,[5.6,1.2,4.2],tC(0xe07a2a));kput('boxW',[x,.5,z+1.2],null,[4.4,1,1],tC(TTIMBER2));}});
izOrig('fountain','Fountain',18,false,(P,x,z)=>{{kput('slab',[x,.3,z],null,[5,.6,5],tC(TPAL[7]));kput('slab',[x,1.4,z],null,[1.6,1.6,1.6],tC(TPAL[7],.9));kput('slab',[x,2.6,z],null,[2.8,.4,2.8],tC(TPAL[7]));kput('slab',[x,3.6,z],null,[.8,1.6,.8],tC(TPAL[7],.9));kput('slab',[x,4.6,z],null,[1.6,.3,1.6],tC(TPAL[7]));izLamp(x,4.8,z);}});
izOrig('palace','Palace fortress',150,true,(P,x,z)=>{const sm=0xd4a05a,sl=0xe6bd7e;
 // RECESSED windows (Travis): a dark reveal set into the face, a warm pane at its back (the citadel is lit), and a proud
 // sandstone surround — two jambs, a lintel with a deco drip band, a sill — so each opening reads as cut into the mass
 const izOne=(px,py,pz,nx,nz,ww,wh)=>{const q=qEuler(0,Math.atan2(nx,nz),0),tx=nz,tz=-nx;
  kput('boxD',[px,py,pz],q,[ww,wh,1.0],null);kput('dot',[px-nx*.35,py,pz-nz*.35],q,[ww/1.5,wh/.8,.3],WARM.clone().multiplyScalar(.75));
  for(const sd of[-1,1])kput('boxW',[px+tx*sd*(ww/2+.3)+nx*.35,py,pz+tz*sd*(ww/2+.3)+nz*.35],q,[.6,wh+.4,.7],tC(sl));
  kput('boxW',[px+nx*.4,py+wh/2+.35,pz+nz*.4],q,[ww+1.4,.7,.8],tC(sl));kput('boxW',[px+nx*.55,py+wh/2+.85,pz+nz*.55],q,[ww+.6,.25,.5],tC(sm,.9));
  kput('boxW',[px+nx*.45,py-wh/2-.25,pz+nz*.45],q,[ww+1.0,.5,.9],tC(sl));};
 const izWin=(cx,cz,w,d,taper,h,y0,rowY,n,ww,wh,skip)=>{const f=(rowY-y0)/h,hw=w/2*(1-(1-taper)*f),hd=d/2*(1-(1-taper)*f);for(let i=0;i<n;i++){const u=((i+.5)/n-.5)*1.7;
   if(!(skip&&skip(cx+u*hw)))izOne(x+cx+u*hw,rowY,z+cz+hd,0,1,ww,wh);izOne(x+cx+u*hw,rowY,z+cz-hd,0,-1,ww,wh);izOne(x+cx+hw,rowY,z+cz+u*hd,1,0,ww,wh);izOne(x+cx-hw,rowY,z+cz+u*hd,-1,0,ww,wh);}};
 // tiers 1-2 solid; tier 3 is built in parts round the HALL (the old hangar, hollow now): rear mass, two flanks, a lintel
 kput('frus93',[x,0,z],null,[96,14,84],tC(sm));kput('frus90',[x+4,14,z-4],null,[68,14,58],tC(sm));
 kput('frus88',[x+8,28,z-15],null,[46,22,26],tC(sm));kput('frus88',[x-12.5,28,z+5],null,[5,22,14],tC(sm));kput('frus88',[x+19.5,28,z+5],null,[23,22,14],tC(sm));kput('frus88',[x-1,39,z+5],null,[18,11,14],tC(sm));
 kput('frus85',[x+16,50,z-10],null,[20,30,20],tC(sm));kput('frus85',[x+16,80,z-10],null,[14,11,14],tC(sl));kput('frus60',[x+16,91,z-10],null,[8,7,8],tC(sm));kput('frusPyr',[x+16,98,z-10],null,[5,6,5],tC(sl));
 kput('boxW',[x,12.6+.75,z],null,[91,1.5,80],tC(sl));kput('boxW',[x+4,26.6+.75,z-4],null,[63,1.5,54],tC(sl));kput('boxW',[x+8,48.6+.75,z-8],null,[42,1.5,37],tC(sl));kput('boxW',[x+16,78.8+.7,z-10],null,[18.5,1.4,18.5],tC(sl));
 izWin(0,0,96,84,.93,14,0,7,9,3,4);izWin(4,-4,68,58,.9,14,14,20,6,3,4);izWin(8,-8,46,40,.88,22,28,34,6,2.2,4,xx=>xx>-11&&xx<9);izWin(8,-8,46,40,.88,22,28,43,6,2.2,3,xx=>xx>-11&&xx<9);for(let i=0;i<3;i++)izWin(16,-10,20,20,.85,30,50,56+i*8,2,3,3);
 // THE HALL (Travis): the hangar converted for entertaining Izani and foreign nobles — 18 x 14 m, 11 m high, open to the
 // terrace: a lit floor, two rows of pale columns, a coffered ceiling of warm lamps, a great doorway into the palace at the back
 {const hy=28.1,hx=x-1,hz=z+5;kput('slab',[hx,hy-.05,hz],null,[9.6,.3,9.6],tC(0xe6d6b0));                      // the floor medallion
  for(const sx of[-6.5,6.5])for(const zz of[-3.2,1.2,5.6])kput('colW',[hx+sx,hy,hz+zz],null,[.9,10.9,.9],tC(sl));
  for(let i=-1;i<=1;i++)for(let j=0;j<3;j++)kput('dot',[hx+i*5,hy+10.6,hz-4.5+j*4.5],qEuler(Math.PI/2,0,0),[1.6,1.6,1],WARM);   // ceiling lamps
  kput('boxD',[hx,hy,z-1.9],null,[7,8,.6],null);kput('boxW',[hx,hy+8,z-1.9],null,[8.4,.9,1.2],tC(sl));for(const sx of[-4.6,4.6])kput('boxW',[hx+sx,hy,z-1.9],null,[1.2,8.6,1.2],tC(sl));   // the great door to the palace
  for(const sx of[-4.6,4.6])kput('dot',[hx+sx,hy+6.5,z-1.4],null,[1,1.4,.5],WARM);
  for(const sx of[-8.3,8.3])for(const zz of[1,7])kput('dot',[hx+sx,hy+5,hz+zz],null,[.5,1.2,1],WARM);              // wall sconces
  kput('boxW',[hx,39.2,z+12.3],null,[19.6,1.2,1.6],tC(sl));for(const sx of[-9.6,9.6])kput('boxW',[hx+sx,hy-.1,z+12.3],null,[1.4,11.4,1.4],tC(sl));   // the hall's frame: lintel and jambs, kept inside the tier's corners
  for(let i=-4;i<=4;i++)kput('dot',[hx+i*2.1,hy-.05,z+13.1],null,[1.2,.25,.5],WARM);                                  // the lit threshold
  // the GREAT AWNING: orange cloth from the lintel out over the terrace on two stone poles, tie rods back to the wall
  kput('vClothB',[hx,50.1-Math.tan(.36)*5.2,z+17.6],qEuler(.36,0,0),[25,.16,11.2],vC(0xe07a2a));
  for(const sx of[-11.5,11.5]){kput('vPostS',[hx+sx,28.1,z+21.4],null,[.55,18.4,.55],tC(sl));kput('vBall',[hx+sx,46.7,z+21.4],null,[.5,.5,.5],vC(0x8a6a2a));beam('vIron',[hx+sx,46.4,z+21.2],[hx+sx*.8,50.4,z+12.4],.06,.06,vC(0x2e2a26));}
  for(let i=0;i<6;i++)kput('vCloth',[hx-10.4+i*4.16,45.6,z+22.9],qEuler(0,0,0),[3.6,1.4,1],vC(i%2?0xd8893c:0xc9442a));}   // the valance
 // THE GARDEN TERRACE on the second tier's roof, either side of the hall's approach: balustrade, planters and hedges,
 // benches, lamp posts, two stairs down to the first tier's roof garden
 {const ty=28.1,front=z+22.4;kput('boxW',[x+4,ty+1.1,front],null,[63,.35,.6],tC(sl));for(let i=0;i<=14;i++)kput('boxW',[x+4-31.5+i*4.5,ty,front],null,[.5,1.1,.5],tC(sl));
  for(const sx of[-27,-19,-11,12,20,28]){vnPlanter(x+sx,ty,z+18,5.2,1.8,0,vC(0x8a6a46));kput('hedge',[x+sx,ty+.6,z+14.6],null,[5.2,1.2,1.2],vC(0x3f6a34));}
  for(const sx of[-23,-15,16,24])kput('vWood',[x+sx,ty+.25,z+16.3],null,[2.4,.5,.6],vC(0x6a4a30));
  for(const sx of[-29,-13,11,27])vnLampPost(x+sx,ty,z+20.6,3.4);
  for(const s of[-1,1]){for(let k=0;k<8;k++)kput('boxW',[x+4+s*33.5,14+k*1.75,z+8-k*1.05],null,[3.2,1.75,1.1],tC(sl));}   // stairs down the flanks
  kput('slab',[x-1,ty-.05,z+16],null,[3.2,.25,3.2],tC(0xe6d6b0));}
 // roof-garden on the first tier's roof: hedges along the parapet, lamp posts; crenellated parapets on both lower tiers
 {const ty=14.1;for(let i=0;i<10;i++){const sx=-40+i*8.9;if(Math.abs(sx-4)<12)continue;kput('hedge',[x+sx,ty+.6,z+36],null,[4.6,1.2,1.4],vC(0x3f6a34));}
  for(const sx of[-40,-24,32,44])vnLampPost(x+sx,ty,z+38.6,3.2);
  for(let i=0;i<22;i++)kput('boxW',[x-44+i*4.2,ty+1.1,z+39.4],null,[1.6,1.0,1.0],tC(sl));for(let i=0;i<15;i++)kput('boxW',[x+4-30+i*4.3,28.1+1.1,z-4-26.4],null,[1.6,1.0,1.0],tC(sl));}
 // banner poles and lamp columns along the front of the base tier
 for(let i=0;i<7;i++){const sx=-42+i*14;vnBannerPole(x+sx,0,z+44.5,0,9,vC(i%2?0xe07a2a:0xc9442a));}
 for(const sx of[-36,-12,12,36])vnLampPost(x+sx,0,z+46,4.2);
 // pyramidal roofs and pavilions on the terrace tops, the beacon (from the Iziz Ancients Mix palace)
 // the terrace pavilions (Travis: develop the bare pyramids and cubes): each PYRAMID becomes an open pavilion — a paved
 // floor, four columns, an architrave, the pyramid roof lifted onto it with a lantern — and each CUBE a belvedere — a
 // windowed room with a cornice, a pyramid cap and a banner. The two that sat inside the hall's masses are gone.
 const izPav=(px,py,pz)=>{kput('slab',[x+px,py+.15,z+pz],null,[6.2,.3,6.2],tC(0xe6d6b0));for(const a of[-1,1])for(const b of[-1,1])kput('colW',[x+px+a*4,py+.3,z+pz+b*4],null,[.55,5.4,.55],tC(sl));
  for(const a of[-1,1]){kput('boxW',[x+px,py+6,z+pz+a*4],null,[9.4,.9,.9],tC(sl));kput('boxW',[x+px+a*4,py+6,z+pz],null,[.9,.9,9.4],tC(sl));}
  kput('frusPyr',[x+px,py+6.45,z+pz],null,[10,6.5,10],tC(sl));kput('boxW',[x+px,py+6.4,z+pz],null,[10.4,.3,10.4],tC(sm,.9));kput('lampI',[x+px,py+4.6,z+pz],null,[.6,.8,.6],WARM);
  for(const a of[-1,1])vnPlanter(x+px+a*5.8,py,z+pz+5.6,2.2,.8,0,vC(0x8a6a46));kput('vWood',[x+px,py+.55,z+pz],null,[2.6,.5,.7],vC(0x6a4a30));};
 const izBelv=(px,py,pz,i)=>{kput('boxW',[x+px,py+4,z+pz],null,[9,8,7.4],tC(sm));kput('boxW',[x+px,py+.4,z+pz],null,[9.8,.8,8.2],tC(sl));
  for(const a of[-1,1]){for(const k of[-2.6,0,2.6])izOne(x+px+k,py+4.6,z+pz+a*3.72,0,a,1.3,2.6);izOne(x+px+a*4.52,py+4.6,z+pz,a,0,1.3,2.6);}
  kput('boxW',[x+px,py+8.2,z+pz],null,[10.2,.6,8.6],tC(sl));kput('boxW',[x+px,py+8.7,z+pz],null,[9.4,.4,7.8],tC(sm,.9));kput('frusPyr',[x+px,py+8.9,z+pz],null,[8.6,5,7],tC(sl));
  vnBannerPole(x+px+4.2,py+8.9,z+pz+3.4,0,5,vC(i%2?0xe07a2a:0xc9442a));};
 [[-36,14,-30],[36,14,-32],[-38,14,-12],[-6,50,-20]].forEach(p=>izPav(p[0],p[1],p[2]));
 [[-38,14,4],[38,14,4],[-4,50,4]].forEach((p,i)=>izBelv(p[0],p[1],p[2],i));
 kput('lampI',[x+16,105,z-10],null,[1.4,2,1.4],WARM);});
izOrig('pueblo','Pueblo (adobe stack)',26,false,(P,x,z)=>{const ac=0xd6a06a;const w=6,d=6,h1=6,h2=4.5;kput('boxW',[x,h1/2,z],null,[w*1.9,h1,d*1.9],tC(ac));kput('boxW',[x,h1-.3,z],null,[w*1.9+.3,.6,d*1.9+.3],tC(ac,1.1));
 kput('boxW',[x-w*.3,h1+h2/2,z-d*.35],null,[w*1.2,h2,d*1.1],tC(ac));kput('boxD',[x+w*.2,1.2,z+d*.95+.1],null,[1.5,2.4,.4],null);});
// ---- the pairs, merged in the original order: fn(P, x, z, orig) runs the original or the Ancient half
const TPAIRS=[];const TBY={};
for(const key of ['box','tier','domed','barrel','tent','pyr','setback','setback2','tyrell','wedge','pent','hept','hall','stave','compound','midrise','stall','fountain','temple','palace','arena','pueblo']){const O=IZ_ORIG[key],A=IZS_BY[key],p=O||A;
 const e={key,name:p.name,size:p.size,tall:p.tall,fn:(P,x,z,orig)=>O&&(orig||!A)?O.fn(P,x,z):A.fn(P,x,z)};TPAIRS.push(e);TBY[key]=e;}
const TRANS_EXCLUDE={pueblo:1};
// footprint half-extents of each kind at scale 1 (from the Mix's REFHALF), used by the city to fit lots
const TREFHALF={box:[3.4,3.4],tier:[3.6,3.6],domed:[3.4,3.4],barrel:[3.6,4.8],tent:[4.8,4.6],pyr:[3.75,3.75],setback:[7,7],setback2:[3.7,3.7],tyrell:[7,7],wedge:[5,7],pent:[6.6,6.6],hept:[6.6,6.6],hall:[9,7.5],stave:[7.5,7.5],compound:[10.2,10.2],midrise:[5.5,5.5],stall:[3,2.4],fountain:[5.4,5.4],temple:[42,52],palace:[52,46],arena:[56,48]};
const TKINDS={dwelling:['box','tier','domed','barrel','tent','pyr'],tall:['setback','setback2','tyrell','wedge','pent','hept','midrise'],hall:['hall','stave','compound']};
// ---- placement -----------------------------------------------------------------------------------------------------
MAT.tGlassO=new THREE.MeshStandardMaterial({color:0x2a4a66,metalness:.55,roughness:.18,emissive:0x0a1a2a,emissiveIntensity:.5,side:DS});
const TRANS={groups:[],root:null,
 place(scene,kind,mode,x,z,ry,scale,seed,extraTags,y){y=y||0;const p=TBY[kind];if(!p||TRANS_EXCLUDE[kind]){reportErr('TRANS.place: '+kind+' not placeable');return null;}
  if(!TRANS.root){TRANS.root=new THREE.Group();scene.add(TRANS.root);}
  if(kind==='pent'||kind==='hept'){mode=mode==='orig'?'anc':mode==='ruin'?'ancruin':mode==='rehab'?'ancrehab':mode;}   // Travis: only the transplant versions of these two
  const orig=mode==='orig'||mode==='ruin'||mode==='rehab';const wmode=mode==='ruin'||mode==='ancruin'?'ruin':(mode==='rehab'||mode==='ancrehab')?'rehab':null;
  scale=scale||1;ry=ry||0;reseed(seed);const ranges={};for(const n in KIT.items)ranges[n]=KIT.items[n].length;
  const P=new THREE.Group();P.position.set(x,y,z);P.rotation.y=ry;P.scale.setScalar(scale);scene.add(P);P.updateMatrixWorld(true);
  KOFF=[0,0,0];useGroupXF(P);if(scale!==1)KXF.s=scale;
  try{p.fn(P,0,0,orig);}catch(e){reportErr('transplant '+kind+' '+e.stack);}
  endGroupXF();
  if(wmode){try{wreck(P,TRANS.root,ranges,wmode,x,z,seed+1);}catch(e){reportErr('wreck '+kind+' '+e.stack);}}
  P.traverse(m=>{if(m.isMesh&&m.material===MAT.glass)m.material=MAT.tGlassO;});
  TRANS.groups.push(P);
  const isDw=TKINDS.dwelling.includes(kind),isTall=TKINDS.tall.includes(kind);
  const type=kind==='temple'?['religious','civic']:kind==='palace'?['civic','military']:kind==='arena'?['civic']:kind==='hall'?['tavern/inn']:kind==='stall'?['market/shop']:kind==='fountain'?['civic']:isTall?['multi-family dwelling']:kind==='compound'?['single-family dwelling']:kind==='stave'?['civic']:['single-family dwelling'];
  const state=wmode==='ruin'?'destroyed':wmode==='rehab'?'rehabilitated':'intact';
  REG.push({name:p.name+(orig?' — Iziz original':' — Ancients transplant')+(wmode?' — '+state:''),x,y,z,r:p.size*.45*scale,h:p.size*1.2*scale,cls:'building',key:'trans_'+kind,
   tags:Object.assign({culture:orig?'iziz-old':'ancients-transplant',type,wealth:isTall?'middle':'middle',state,lit:wmode!=='ruin'},extraTags||{})});
  return P;},
 // merge every one-off mesh in the placed groups by material into one draw call each (the Mix's ANC.bake)
 bake(scene){const groups=TRANS.groups.slice();if(TRANS.root)groups.push(TRANS.root);const byMat=new Map();const list=[];
  for(const G of groups){G.updateMatrixWorld(true);G.traverse(o=>{if(o.isMesh&&!o.isInstancedMesh)list.push(o);});}
  for(const m of list){const k=m.material.uuid;if(!byMat.has(k))byMat.set(k,{mat:m.material,geos:[]});const geo=(m.geometry.index?m.geometry.toNonIndexed():m.geometry).clone();geo.applyMatrix4(m.matrixWorld);if(!geo.attributes.normal)geo.computeVertexNormals();else geo.computeVertexNormals();if(!geo.attributes.uv)geo.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));byMat.get(k).geos.push(geo);m.parent.remove(m);}
  const out=new THREE.Group();scene.add(out);let calls=0;
  for(const e of byMat.values()){let nv=0;for(const g of e.geos)nv+=g.attributes.position.count;const P=new Float32Array(nv*3),N=new Float32Array(nv*3),U=new Float32Array(nv*2);let o=0;
   for(const g of e.geos){P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);U.set(g.attributes.uv.array,o*2);o+=g.attributes.position.count;}
   const G=new THREE.BufferGeometry();G.setAttribute('position',new THREE.BufferAttribute(P,3));G.setAttribute('normal',new THREE.BufferAttribute(N,3));G.setAttribute('uv',new THREE.BufferAttribute(U,2));
   const mm=new THREE.Mesh(G,e.mat);mm.frustumCulled=false;out.add(mm);calls++;}
  window._transMerged=calls;return out;},
 kinds:Object.keys(TBY).filter(k=>!TRANS_EXCLUDE[k]),TKINDS,TREFHALF,by:TBY};
