// ================================================================= AMPHITHEATER — "the Bowl"
function buildAmphitheater(scene,gx,gz,d){reseed(9960+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 REGISTER({name:'Amphitheater — the Bowl ('+STATE(d)+')',x:0,z:0,r:110,h:60});
 // SIGHTLINES. Two separate things decided whether a seat could see the stage.
 //
 // 1. THE SWEEP. The acoustic shell is a half-dome occupying z<0 and opening
 //    toward +z, so a seat looks INTO the shell only while its own z>0 — that
 //    is, while |a| < PI/2. The bowl used to sweep +/-2.2 rad (252 deg), which
 //    left the outer 29% of every row sitting behind the shell looking at its
 //    back. The sweep is now +/-1.5 rad (172 deg), a Roman semicircle: every
 //    seat is in front of the opening.
 //
 // 2. THE RAKE. A constant rise per row does NOT give a constant view. The
 //    clearance C — how far a row's sightline passes above the eye of the row
 //    in front — decays roughly as 1/n. With the old flat 1.5 m rise it was
 //    0.58 m at row 1 and 0.071 m by row 15, well under the ~0.12 m a person
 //    needs to see past the head in front, so the back third of the bowl was
 //    looking at the back of someone's skull. Solving
 //        E(n+1) = (D(n+1)/D(n)) * (E(n) + C)
 //    for a fixed C gives the classic parabolic rake, where the rise grows with
 //    the row. E is eye height above the focus, D is eye distance from it.
 //    Rescaled so the top row still lands at y=24 where the rim wall meets it,
 //    so the bowl keeps its old silhouette and the rim and struts still fit.
 const a0=-1.5,a1=1.5;
 const NR=16,TRD=4.2,R0=24,EYE=1.2,SEATIN=2,FOCR=24,FOCY=2.4,CVAL=.18;
 const rowR=t=>R0+t*TRD;                              // inner radius of row t
 const eyeD=t=>rowR(t)+SEATIN-FOCR;                   // eye distance from the focus
 const TH=[1.5];                                      // tread height, row by row
 for(let t=1;t<NR;t++)TH.push((eyeD(t)/eyeD(t-1))*(TH[t-1]+EYE-FOCY+CVAL)+FOCY-EYE);
 {const k=(24+EYE-FOCY)/(TH[NR-1]+EYE-FOCY);          // scale E, not the height
  for(let t=0;t<NR;t++)TH[t]=(TH[t]+EYE-FOCY)*k+FOCY-EYE;}
 // seating: one mesh for every tread and one for every riser, not two per row
 const treads=[],risers=[];
 for(let t=0;t<NR;t++){const r0=rowR(t),r1=r0+TRD;const yb=t?TH[t-1]:0,yt=TH[t];
  const hole=d>0?(u,v)=>fbm(u*6+t,2,800+t,2)<.16:null;
  treads.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(r0,r1-.3,v);return[Math.sin(a)*r,yt,Math.cos(a)*r];},80,1,{hole}));
  risers.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*r0,yb+v*(yt-yb),Math.cos(a)*r0];},80,1,{hole}));
  if(t%4===3)for(let k=0;k<12;k++){const a=lerp(a0,a1,(k+.5)/12);const lit=d>0?rng()<.12:true;kput('strip',[Math.sin(a)*(r0+2),yt+.1,Math.cos(a)*(r0+2)],qEuler(0,a,0),[2.5,1,1],lit?CYAN:DEAD);}}
 meshMerged(treads,CONC(d),G);meshMerged(risers,MAT.dark,G);
 // aisles: a ramp that follows the rake. The old one was a single straight box
 // laid across the bowl, which only sat on the steps while the rise was constant.
 const rakeY=r=>{const t=clamp((r-R0)/TRD,0,NR-1);const i=Math.min(Math.floor(t),NR-2);return lerp(TH[i],TH[i+1],t-i);};
 const aisles=[];
 for(let k=0;k<5;k++){const a=lerp(a0,a1,k/4);const ca=Math.cos(a),sa=Math.sin(a);
  aisles.push(gridSurface((u,v)=>{const r=lerp(R0,rowR(NR-1)+TRD,u),w=(v-.5)*3;
   return[sa*r+ca*w,rakeY(r)+.15,ca*r-sa*w];},48,1,{uS:20}));}
 meshMerged(aisles,skin,G);
 // outer rim: leaning struts and a flared rim wall (Tange). Strut count follows
 // the sweep, so they stay at the same spacing now the bowl is narrower.
 for(let k=0;k<16;k++){const a=lerp(a0,a1,(k+.5)/16);const fallen=d>0&&(k===3||k===11);const A=[Math.sin(a)*100,0,Math.cos(a)*100],B=[Math.sin(a)*88,27,Math.cos(a)*88];
  if(!fallen)beam(d>0?'strutR':'strutW',A,B,2.6,2.2);else beam('strutR',[A[0],1.5,A[2]],[A[0]*.8,2,A[2]*.8],2.6,2.2);}
 mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(88,92,v);return[Math.sin(a)*r,24+v*6,Math.cos(a)*r];},80,2,{uS:20,hole:holeFn(d*.7,820,null,2)}),CONC(d),G);
 // stage + petal acoustic shell
 kput('slab',[0,1.2,0],null,[24,2.4,24],new THREE.Color(d>0?0x4a4038:0xcfcac2));
 const AR=24;mesh(lathe({rFn:y=>AR*Math.sqrt(clamp(1-Math.pow(y/AR,2),0,1)),H:AR,nu:64,nv:20,hole:(u,y)=>Math.sin(u*TAU)>.02||(d>0&&fbm(u*5,y*.15,830,2)<.28)||[[.62,.5],[.8,.35],[.72,.75]].some(o=>Math.hypot((u-o[0])*4,y/AR-o[1])<.11)}),CONC(d),G,0,2.4,0);
 mesh(lathe({rFn:y=>AR*.94*Math.sqrt(clamp(1-Math.pow(y/AR,2),0,1)),H:AR,nu:32,nv:10,hole:(u,y)=>Math.sin(u*TAU)>.02}),MAT.dark,G,0,2.4,0);
 for(let k=0;k<5;k++){const a=Math.PI+(k-2)*.5;kput(BOXC(d),[Math.cos(a)*AR*.9,2.4+7,Math.sin(a)*AR*.9],qEuler(0,-a,0),[2,14,4],null);}
 kput(BOXC(d),[0,2.4+AR-2,-4],null,[30,1.2,10],null);
 stripRing(0,4,0,14,d,20);
 if(d>0){scatterMoss(0,0,0,30,120,120,2.2);rubbleRing(0,0,-40,5,60,50,2.2);trees(0,0,105,160,10);}
 figures(0,50,10,20);KOFF=[0,0,0];return G;}

