// ================================================================= OFFICE C — "the Comb" (concrete brise-soleil bar)
function officeC(G,d){const cx=330;REGISTER({name:'Office C — the Comb ('+STATE(d)+')',x:cx,z:0,r:50,h:24});
 const R=60,a0=-.7,a1=.7,NS=4,SH=4.4;
 const cDeck=[],cBrick=[],cDark=[];   // the brise-soleil bar in three meshes, not thirteen
 for(let f=0;f<=NS;f++){const y=f*SH;cDeck.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-14,R+1,v);return[cx+Math.sin(a)*r,y+.3,Math.cos(a)*r-R*.6];},60,2,{hole:d>0?(u,v)=>fbm(u*10,f,1500+f,2)<.15:null}));}
 for(let k=0;k<=30;k++){const a=lerp(a0,a1,k/30);const x=cx+Math.sin(a)*(R+1.5),z=Math.cos(a)*(R+1.5)-R*.6;if(d>0&&rng()<.15)continue;kput(BOXC(d),[x,NS*SH/2,z],qEuler(0,a,0),[1.2,NS*SH+1,3.6],null);}
 for(let k=0;k<6;k++){const a=lerp(a0,a1,(k+.5)/6);kput(BOXC(d),[cx+Math.sin(a)*(R-12),NS*SH/2,Math.cos(a)*(R-12)-R*.6],null,[1.4,NS*SH,1.4],null);}
 for(let f=0;f<NS;f++){const y=f*SH;if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-1.2;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},60,1,{}),MAT.glass,G);
  else cDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-3;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},40,1,{hole:(u,v)=>fbm(u*8,f,1510,2)<.35}));
  cBrick.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-13;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},40,1,{uS:20}));
  for(let k=0;k<8;k++){const a=lerp(a0,a1,(k+.5)/8);const lit=d>0?rng()<.15:true;kput('strip',[cx+Math.sin(a)*(R-7),y+SH-.6,Math.cos(a)*(R-7)-R*.6],qEuler(0,a,0),[8,1,1],lit?CYAN:DEAD);}}
 // end walls: the bar was open along both end elevations, showing four floor
 // slabs in section from the side.
 for(let s=0;s<2;s++){const a=lerp(a0,a1,s);
  cDeck.push(gridSurface((u,v)=>{const r=lerp(R-14,R+1,u);return[cx+Math.sin(a)*r,v*NS*SH+.3,Math.cos(a)*r-R*.6];},8,18,{uS:6,vS:8,hole:d>0?(u,v)=>fbm(u*4+s*3,v*5,1520+s,2)<.25:null}));}
 meshMerged(cDeck,CONC(d),G);meshMerged(cBrick,MAT.brick,G);meshMerged(cDark,MAT.dark,G);
 // roof pergola
 for(let k=0;k<12;k++){const a=lerp(a0,a1,(k+.5)/12);if(d>0&&rng()<.3)continue;beam(BOXC(d),[cx+Math.sin(a)*(R-14),NS*SH+.5,Math.cos(a)*(R-14)-R*.6],[cx+Math.sin(a)*(R+2),NS*SH+3.5,Math.cos(a)*(R+2)-R*.6],1,1.2);}
 kput('archOpen',[cx,3.8,R*.4-1],qFacing([0,0,1]),[.6,.6,1],null);
 if(d>0){mossOnRing(cx,NS*SH+.5,-R*.6,R*.7,20,2);vinesOnRing(cx,NS*SH,-R*.6,R-2,16,12);rubbleRing(cx,.3,-R*.6+R*.9,5,30,30,2);}}


