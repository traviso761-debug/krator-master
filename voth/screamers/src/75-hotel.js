// ================================================================= HOTEL — "the Terraces"
function buildHotel(scene,gx,gz,d){reseed(9250+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Hotel — the Terraces ('+STATE(d)+')',x:0,z:0,r:110,h:80});
 const NS=14,SH=4.2,R=90,a0=-.9,a1=.9;const depth=f=>34-f*1.9;   // crescent, each storey shallower (terraces step back uphill)
 const hConc=[],hBrick=[],hDark=[];   // one mesh per material for the whole crescent
 for(let f=0;f<=NS;f++){const y=f*SH;const D=depth(Math.min(f,NS-1));const gone=d>0&&f>=NS-2&&rng()<.6;if(gone)continue;
  hConc.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-D,R+1.5,v);return[Math.sin(a)*r,y,Math.cos(a)*r-R*.7];},80,3,{hole:d>0?(u,v)=>fbm(u*12,f,2000+f,2)<.14:null}));
  if(f<NS){const Dn=depth(f);const rf=R-.8;
   if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*rf,y+.5+v*(SH-.9),Math.cos(a)*rf-R*.7];},80,1,{}),MAT.glass,G);
   else hDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);return[Math.sin(a)*(rf-.5),y+.5+v*(SH-.9),Math.cos(a)*(rf-.5)-R*.7];},60,1,{hole:(u,v)=>fbm(u*9,f,2010,2)<.35}));
   hBrick.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-Dn+1;return[Math.sin(a)*r,y+.5+v*(SH-.9),Math.cos(a)*r-R*.7];},60,1,{uS:20}));
   hDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-Dn,R-1,v);return[Math.sin(a)*r,y+.4,Math.cos(a)*r-R*.7];},40,1,{}));
   for(let k=0;k<=24;k++){const a=lerp(a0,a1,k/24);kput(d>0?'mullR':'mullW',[Math.sin(a)*rf,y+SH/2,Math.cos(a)*rf-R*.7],qEuler(0,a,0),[.5,SH-.8,.5],null);
    if(k<24){const lit=d>0?rng()<.12:rng()<.7;kput('strip',[Math.sin(a+.035)*(rf-1.5),y+SH-.6,Math.cos(a+.035)*(rf-1.5)-R*.7],qEuler(0,a+.035,0),[4,1,1],lit?WARM:DEAD);}}
   // balcony parapet with planters; the terrace behind (roof of the storey below is the terrace of this one)
   for(let k=0;k<24;k++){const a=lerp(a0,a1,(k+.5)/24);kput(BOXC(d),[Math.sin(a)*(R+1),y+.9,Math.cos(a)*(R+1)-R*.7],qEuler(0,a,0),[6.4,1,.4],null);
    if(d>0||rng()<.4)kput('hedge',[Math.sin(a)*(R+.4),y+1.3,Math.cos(a)*(R+.4)-R*.7],qEuler(0,a,0),[5.5,.7,.9],new THREE.Color().setHSL(rr(.25,.33),.45,d>0?.16:.28));}
   if(f>0&&f%2===0){for(let k=0;k<6;k++){const a=lerp(a0,a1,(k+.5)/6);const r=R-Dn-4;kput('hedge',[Math.sin(a)*r,y+.9,Math.cos(a)*r-R*.7],qEuler(0,a,0),[10,1,2],new THREE.Color().setHSL(.3,.4,d>0?.15:.26));}}}}
 meshMerged(hConc,CONC(d),G);meshMerged(hBrick,MAT.brick,G);meshMerged(hDark,MAT.dark,G);
 if(d>0){mossOnSurface(hConc,0,0,0,170,2.2);vinesFromLedge(hConc,0,0,0,70,18);stainsFromLedge(hConc,0,0,0,52,12);}
 // core + lift towers at the horns, sky-lobby lens on top
 for(const s of [-1,1]){const a=s*(a1+.05);mesh(lathe({rFn:y=>7*Math.sqrt(1+.8*Math.pow((y-NS*SH/2)/(NS*SH/2),2)),H:NS*SH+6,nu:24,nv:10,hole:holeFn(d*.5,2020+s,null,2.5)}),CONC(d),G,Math.sin(a)*(R-14),0,Math.cos(a)*(R-14)-R*.7);}
 if(d===0){mesh(lathe({rFn:y=>22*Math.pow(clamp(1-Math.pow(y/10,2),0,1),.5)+.01,H:10,nu:48,nv:8}),MAT.glass,G,0,NS*SH,R*.3-R*.7+10);}
 else mesh(lathe({rFn:y=>21*Math.pow(clamp(1-Math.pow(y/10,2),0,1),.5)+.01,H:10,nu:48,nv:8,hole:(u,y)=>fbm(u*4,y*.3,2030,2)<.5}),MAT.dark,G,0,NS*SH,R*.3-R*.7+10);
 // porte-cochère + pool deck at the foot
 kput(SLABC(d),[0,.3,0],null,[130,.6,130],null);kput('archOpen',[0,4,R-R*.7+2],qFacing([0,0,1]),[1,.9,2],null);
 kput(BOXC(d),[0,7.5,R-R*.7+18],null,[40,.8,24],null);for(let k=0;k<4;k++){const a=k/4*TAU;beam(BOXC(d),[Math.cos(a)*14,0,R-R*.7+18+Math.sin(a)*8],[Math.cos(a)*6,7,R-R*.7+18+Math.sin(a)*4],1.2,1.2);}
 kput('boxD',[-50,.4,-30],null,[30,.4,18],null);if(d===0)kput('pane',[-50,.5,-30],qEuler(Math.PI/2,0,0),[28,16,1],null);
 if(d>0){scatterMoss(0,.6,0,20,120,80,2.4);rubbleRing(0,.6,R*.3-R*.7,10,70,40,2.5);trees(0,0,110,160,12);}
 figures(0,60,6,12);KOFF=[0,0,0];return G;}

