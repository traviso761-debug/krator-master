// ================================================================= RING SEA ISLES — the crop trees' builders
// The owner's tree crops that no kit drew (2026-10-15): the mango, coffee and clove (B[7..9]; 55 holds B[0..6] and the
// helpers it shares through RINGISLES._h). Each is planted by the gardens (62: crop-mango, crop-coffee, crop-clove).
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
const SP=RINGISLES.SPECIES,PAL=RINGISLES.PAL,C=RINGISLES.C,B=RINGISLES._B,GOLD=2.399963;
const {treeGrow,dirOf,tip,along,clumpAt,limb,leafCol,fruitH,regTree}=RINGISLES._h;
// 7 the MANGO: a short stout trunk forking low into a dense round dome of dark glossy leaves, the young flush red-brown;
// the fruit hanging on long stalks under the crown
B[7]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(S.leaf[T.seed%3]);
 const tr=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),rr(1.4,1.55)),H*.3,T.rb,T.rb*.75,lv===2?4:2,0,.05);limb('bark4',S,4,tr,lv,st,lv===2?7:4);
 const tips=[];for(let k=0,n=lv===2?ri(4,6):3;k<n;k++){const a=k*GOLD+rr(-.2,.2),P=treeGrow(tip(tr),dirOf(a,rr(.6,1.0)),R*rr(.7,.95),T.rb*.6,.05,lv===2?4:2,-.03,.1);limb('bark4',S,4,P,lv,st,4);tips.push(tip(P),along(P,.55));}
 const cy=T.y0+H*.62;
 for(let k=0,n=lv===2?ri(30,42):12;k<n;k++){const a=rr(0,TAU),u=rng(),x=T.x+Math.cos(a)*R*Math.sqrt(u)*.85,z=T.z+Math.sin(a)*R*Math.sqrt(u)*.85,y=cy+(H-cy+T.y0)*(1-u)*rr(.4,1)-R*.15*u;
  const flush=rng()<.08;clumpAt('glossy',x,y,z,R*rr(.42,.55)*(lv===2?1:1.5),.75,flush?C(S.leaf[3]):hc,T.x,cy,T.z,R,H*.35);st.clumps++;}
 if(lv===2)for(let k=0,n=ri(5,12);k<n;k++){const a=rr(0,TAU),d=R*rr(.5,.85),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=cy-R*rr(.1,.35),s=rr(.07,.09);
  BIO.put('fruit',[x,y,z],qEuler(rr(-.3,.3),rr(0,TAU),0),[s,s*1.4,s*.9],C(pick(PAL.mangoFruit)));st.fruit++;}
 regTree(T,S,R+.6,H+.6);};
// 8 COFFEE: a shrub of slender upright stems with long horizontal side shoots in tiers, glossy paired leaves along them,
// red and green cherries crowded at the leaf joints
B[8]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(pick(S.leaf));let top=T.y0;
 for(let s=0,n=lv===2?ri(2,4):2;s<n;s++){const P=treeGrow({x:T.x+rr(-.12,.12),y:T.y0-.1,z:T.z+rr(-.12,.12)},dirOf(rr(0,TAU),rr(1.38,1.52)),H*rr(.8,1),T.rb,T.rb*.4,3,0,.04);limb('bark4',S,4,P,lv,st,3);top=Math.max(top,tip(P).y);
  for(let t=0,m=lv===2?5:3;t<m;t++){const q=along(P,.25+.7*t/m),a=t*GOLD+s,L=R*(1-t/m*.55);
   for(let k=0;k<(lv===2?2:1);k++){const x=q.x+Math.cos(a+k*Math.PI)*L*.55,z=q.z+Math.sin(a+k*Math.PI)*L*.55;clumpAt('glossy',x,q.y,z,L*rr(.6,.8),.45,hc,T.x,T.y0+H*.5,T.z,R,H*.5);st.clumps++;
    if(lv===2&&rng()<.6)for(let c=0;c<ri(3,7);c++){const s2=rr(.012,.018);BIO.put('fruit',[q.x+Math.cos(a+k*Math.PI)*L*rr(.15,.4),q.y-.05,q.z+Math.sin(a+k*Math.PI)*L*rr(.15,.4)],null,s2,C(pick(PAL.coffeeCherry)));st.fruit++;}}}}
 regTree(T,S,R+.3,top-T.y0+.5);};
// 9 the CLOVE: a narrow conical evergreen, a straight grey trunk branching upward from low down, glossy leaves dense to
// the ground in an upright cone, red-tinged flush; clusters of pink buds at the shoot tips
B[9]=function(T,st,lv){const S=SP[T.sp],H=T.H,R=T.crownR,hc=C(S.leaf[T.seed%2]);
 const tr=treeGrow({x:T.x,y:T.y0-.3,z:T.z},dirOf(rr(0,TAU),rr(1.47,1.57)),H*.9,T.rb,T.rb*.25,lv===2?5:3,0,.03);limb('bark4',S,4,tr,lv,st,lv===2?6:4);
 for(let k=0,n=lv===2?ri(26,36):10;k<n;k++){const u=rr(.12,1),a=k*GOLD,r=R*(1-u)*rr(.6,1),p=along(tr,u),x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;
  clumpAt('glossy',x,p.y+rr(-.2,.4),z,R*rr(.45,.6)*(1-u*.4)*(lv===2?1:1.4),.8,rng()<.07?C(S.leaf[2]):hc,T.x,T.y0+H*.5,T.z,R,H*.5);st.clumps++;
  if(lv===2&&rng()<.35){const s=rr(.05,.08);BIO.put('fruit',[x,p.y+R*.25*(1-u)+.15,z],null,[s,s*.6,s],C(pick(PAL.cloveBud)));st.fruit++;}}
 regTree(T,S,R+.4,H+.6);};
})();
