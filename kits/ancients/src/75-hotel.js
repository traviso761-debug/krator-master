// ================================================================= HOTEL — "the Terraces"
function buildHotel(scene,gx,gz,d){reseed(9250+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Hotel — the Terraces ('+STATE(d)+')',x:0,z:0,r:110,h:80});
 const NS=14,SH=4.2,R=90,a0=-.9,a1=.9;const depth=f=>34-f*1.9;   // crescent, each storey shallower (terraces step back uphill)
 // WHAT WAS OVERHANGING WHAT — three separate radii that were never derived
 // from each other, on a plan where each storey steps back 1.9 m:
 //   * the back wall of storey f stood at R-depth(f)+1 and the terrace slab
 //     over it started at R-depth(f+1) = R-depth(f)+1.9, so every wall head
 //     finished 0.9 m short of the slab it was meant to carry — a continuous
 //     open slot, 165 m of arc, on all thirteen upper storeys;
 //   * the 1 m of slab inboard of each wall was therefore a lip cantilevered
 //     over that slot, resting on nothing;
 //   * and the six garden planters on every even terrace sat at
 //     R-depth(f)-4, FOUR METRES inboard of the inner edge of the very slab
 //     they stand on: 36 ten-metre hedges hanging in the open court, the
 //     highest of them fifty metres up with nothing at all beneath them.
 // Now the three are one chain: a wall stands on its own slab, the slab above
 // laps 1.2 m over it (a real eaves instead of a gap), the planters sit on the
 // 3.1 m of terrace that leaves, and a parapet closes its inner edge.
 const wallR=f=>R-depth(Math.min(f,NS-1));       // back wall of storey f
 const deckR=f=>f>0?wallR(f-1)-1.2:wallR(0)-2;   // inner edge of the slab over it
 // And in the ruin, a storey never survives its own support: `gone` was rolled
 // per level, so level 14 could stand with level 13 gone under it.
 let cutTop=NS+1;
 if(d>0)for(let f=NS-2;f<=NS;f++){if(rng()<.6&&f<cutTop)cutTop=f;}
 const hConc=[],hBrick=[],hDark=[];   // one mesh per material for the whole crescent
 for(let f=0;f<=NS;f++){const y=f*SH;if(f>=cutTop)continue;
  hConc.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(deckR(f),R+1.5,v);return[Math.sin(a)*r,y,Math.cos(a)*r-R*.7];},80,3,{hole:d>0?(u,v)=>fbm(u*12,f,2000+f,2)<.14:null}));
  if(f<NS){const WR=wallR(f);const rf=R-.8;
   if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*rf,y+.5+v*(SH-.9),Math.cos(a)*rf-R*.7];},80,1,{}),MAT.glass,G);
   else hDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*(rf-.5),y+.5+v*(SH-.9),Math.cos(a)*(rf-.5)-R*.7];},60,1,{hole:(u,v)=>fbm(u*9,f,2010,2)<.35}));
   // full storey height, so the wall meets the slab under it and the slab over
   // it instead of floating half a metre clear of both
   hBrick.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*WR,y+.2+v*SH,Math.cos(a)*WR-R*.7];},60,1,{uS:20}));
   hDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(WR,R-1,v);return[Math.sin(a)*r,y+.4,Math.cos(a)*r-R*.7];},40,1,{}));
   for(let k=0;k<=24;k++){const a=lerp(a0,a1,k/24);kput(d>0?'mullR':'mullW',[Math.sin(a)*rf,y+SH/2,Math.cos(a)*rf-R*.7],qEuler(0,a,0),[.5,SH-.8,.5],null);
    if(k<24){const lit=d>0?rng()<.12:rng()<.7;kput('strip',[Math.sin(a+.035)*(rf-1.5),y+SH-.6,Math.cos(a+.035)*(rf-1.5)-R*.7],qEuler(0,a+.035,0),[4,1,1],lit?WARM:DEAD);}}
   // balcony parapet with planters; the terrace behind (roof of the storey below is the terrace of this one)
   for(let k=0;k<24;k++){const a=lerp(a0,a1,(k+.5)/24);kput(BOXC(d),[Math.sin(a)*(R+1),y+.9,Math.cos(a)*(R+1)-R*.7],qEuler(0,a,0),[6.4,1,.4],null);
    if(d>0||rng()<.4)kput('hedge',[Math.sin(a)*(R+.4),y+1.3,Math.cos(a)*(R+.4)-R*.7],qEuler(0,a,0),[5.5,.7,.9],new THREE.Color().setHSL(rr(.25,.33),.45,d>0?.16:.28));}
   // The court elevation was thirteen storeys of blank brick — the convex face
   // has a full curtain wall and the concave one had not one opening.
   for(let k=0;k<24;k++){const a=lerp(a0,a1,(k+.5)/24);
    kput(d>0?'winSmD':'winSmI',[Math.sin(a)*(WR-.35),y+2.1,Math.cos(a)*(WR-.35)-R*.7],qFacing([-Math.sin(a),0,-Math.cos(a)]),[1.5,1.5,1],null);}
   // terrace: a parapet on the inner edge of the slab, planters standing on it
   if(f>0){const pr=deckR(f)+.35,pl=pr*(a1-a0)/24*.94;
    for(let k=0;k<24;k++){const a=lerp(a0,a1,(k+.5)/24);
     kput(BOXC(d),[Math.sin(a)*pr,y+.6,Math.cos(a)*pr-R*.7],qEuler(0,a,0),[pl,1.2,.4],null);}
    if(f%2===0)for(let k=0;k<6;k++){const a=lerp(a0,a1,(k+.5)/6);const r=WR-1.5;
     kput('hedge',[Math.sin(a)*r,y+.9,Math.cos(a)*r-R*.7],qEuler(0,a,0),[10,1,1.6],new THREE.Color().setHSL(.3,.4,d>0?.15:.26));}}}}
 meshMerged(hConc,CONC(d),G);meshMerged(hBrick,MAT.brick,G);meshMerged(hDark,MAT.dark,G);
 // (0,-R*.7) is the crescent's centre of curvature, not the builder's origin —
 // without it the ledge sampler ranks the two HORNS as the outermost points
 // and hangs every vine and every water stain off the ends of the building.
 if(d>0){mossOnSurface(hConc,0,0,0,170,2.2);vinesFromLedge(hConc,0,0,0,70,18,0,-R*.7);stainsFromLedge(hConc,0,0,0,52,12,0,-R*.7);}
 // core + lift towers at the horns, sky-lobby lens on top
 for(const s of [-1,1]){const a=s*(a1+.05);mesh(lathe({rFn:y=>7*Math.sqrt(1+.8*Math.pow((y-NS*SH/2)/(NS*SH/2),2)),H:NS*SH+6,nu:24,nv:10,hole:holeFn(d*.5,2020+s,null,2.5)}),CONC(d),G,Math.sin(a)*(R-14),0,Math.cos(a)*(R-14)-R*.7);}
 // THE SKY-LOBBY LENS ALSO FLOATED, and by far the worse of the two. It was
 // placed at local z = R*.3-R*.7+10 = -26 — twenty metres clear of the inner
 // edge of the top slab and 59 m in the air over the pool deck, a 44 m glass
 // dome standing on nothing. It reads as sound from the south only because the
 // building happens to be directly behind it from there, which is where both
 // of this type's camera presets were. It now sits ON the roof, on the mid-
 // radius of the highest surviving slab, on a drum, and sized to fit it.
 const rTop=Math.min(NS,cutTop-1),roofY=rTop*SH,lensZ=(deckR(rTop)+R+1.5)/2-R*.7,lensW=7;
 kput(SLABC(d),[0,roofY+.7,lensZ],null,[lensW+1.4,1.4,lensW+1.4],null);
 if(d===0){mesh(lathe({rFn:y=>lensW*Math.pow(clamp(1-Math.pow(y/7.5,2),0,1),.5)+.01,H:7.5,nu:48,nv:8}),MAT.glass,G,0,roofY+1.4,lensZ);}
 else mesh(lathe({rFn:y=>(lensW-.4)*Math.pow(clamp(1-Math.pow(y/7.5,2),0,1),.5)+.01,H:7.5,nu:48,nv:8,hole:(u,y)=>fbm(u*4,y*.3,2030,2)<.5}),MAT.dark,G,0,roofY+1.4,lensZ);
 // porte-cochère + pool deck at the foot
 kput(SLABC(d),[0,.3,0],null,[130,.6,130],null);kput('archOpen',[0,4,R-R*.7+2],qFacing([0,0,1]),[1,.9,2],null);
 kput(BOXC(d),[0,7.5,R-R*.7+18],null,[40,.8,24],null);for(let k=0;k<4;k++){const a=k/4*TAU;beam(BOXC(d),[Math.cos(a)*14,0,R-R*.7+18+Math.sin(a)*8],[Math.cos(a)*6,7,R-R*.7+18+Math.sin(a)*4],1.2,1.2);}
 kput('boxD',[-50,.4,-30],null,[30,.4,18],null);if(d===0)kput('pane',[-50,.5,-30],qEuler(Math.PI/2,0,0),[28,16,1],null);
 if(d>0){scatterMoss(0,.6,0,20,120,80,2.4);rubbleRing(0,.6,R*.3-R*.7,10,70,40,2.5);trees(0,0,110,160,12);}
 figures(0,60,6,12);KOFF=[0,0,0];return G;}

