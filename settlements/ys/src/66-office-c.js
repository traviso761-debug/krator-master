// ================================================================= OFFICE C — "the Comb" (concrete brise-soleil bar)
const OC_YS_ZC=18;   /* YS: the bar's middle, (cx, OC_YS_ZC) in officeC's frame: the host's axis when the Comb stands alone (buildAltOfficeC) */
function officeC(G,d){const cx=330;REGISTER({name:'Office C — the Comb ('+STATE(d)+')',x:cx,z:0,r:50,h:24});
 const R=60,a0=-.7,a1=.7,NS=4,SH=4.4;
 /* YS: a host: the way-in pods' holes through the brick back wall and the end walls. A way (YS_CUT.ways, 64-hyk-accrete.js)
    is a bearing u about the host's axis (cx, OC_YS_ZC here), its pod's half-height hh = .88 R and half-width uw = .9 R turns
    at rs, the face's radius on that bearing: so the pod stands at rs = hh * .9 / (.88 TAU uw) along it, and the hole is a
    disc of .9 R about that point, the pod's height about the way's y, on whichever wall the ray leaves the bar through */
 const ysA=(typeof YS_CUT!=='undefined'&&YS_CUT)||null,ysQ=[];
 if(ysA&&ysA.ways)for(const w of ysA.ways){const th=w.u*TAU,Rp=w.hh/.88,rs=Rp*.9/(TAU*w.uw);ysQ.push({x:rs*Math.cos(th),z:rs*Math.sin(th),hw:Rp*.9,y:w.y,hh:w.hh});}
 const ysHole=ysQ.length?(px,pz,yy)=>ysQ.some(q=>Math.hypot(px-q.x,pz-q.z)<q.hw&&Math.abs(yy-q.y)<q.hh):null;   /* (px, pz) from the host's axis */
 const cDeck=[],cBrick=[],cDark=[];   // the brise-soleil bar in three meshes, not thirteen
 for(let f=0;f<=NS;f++){const y=f*SH;cDeck.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=lerp(R-14,R+1,v);return[cx+Math.sin(a)*r,y+.3,Math.cos(a)*r-R*.6];},60,2,{hole:d>0?(u,v)=>fbm(u*10,f,1500+f,2)<.15:null}));}
 for(let k=0;k<=30;k++){const a=lerp(a0,a1,k/30);const x=cx+Math.sin(a)*(R+1.5),z=Math.cos(a)*(R+1.5)-R*.6;if(d>0&&rng()<.15)continue;kput(BOXC(d),[x,NS*SH/2,z],qEuler(0,a,0),[1.2,NS*SH+1,3.6],null);}
 for(let k=0;k<6;k++){const a=lerp(a0,a1,(k+.5)/6);kput(BOXC(d),[cx+Math.sin(a)*(R-12),NS*SH/2,Math.cos(a)*(R-12)-R*.6],null,[1.4,NS*SH,1.4],null);}
 for(let f=0;f<NS;f++){const y=f*SH;if(d===0)mesh(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-1.2;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},60,1,{}),MAT.glass,G);
  else cDark.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-3;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},40,1,{hole:(u,v)=>fbm(u*8,f,1510,2)<.35}));
  cBrick.push(gridSurface((u,v)=>{const a=lerp(a0,a1,u);const r=R-13;return[cx+Math.sin(a)*r,y+.6+v*(SH-.9),Math.cos(a)*r-R*.6];},ysHole?120:40,ysHole?6:1,{uS:20,hole:ysHole?(u,v)=>{const a=lerp(a0,a1,u);return ysHole(Math.sin(a)*(R-13),Math.cos(a)*(R-13)-R*.6-OC_YS_ZC,y+.6+v*(SH-.9));}:null}));   /* YS: holed for the ways in */
  for(let k=0;k<8;k++){const a=lerp(a0,a1,(k+.5)/8);const lit=d>0?rng()<.15:true;kput('strip',[cx+Math.sin(a)*(R-7),y+SH-.6,Math.cos(a)*(R-7)-R*.6],qEuler(0,a,0),[8,1,1],lit?CYAN:DEAD);}}
 // end walls: the bar was open along both end elevations, showing four floor
 // slabs in section from the side.
 for(let s=0;s<2;s++){const a=lerp(a0,a1,s);
  cDeck.push(gridSurface((u,v)=>{const r=lerp(R-14,R+1,u);return[cx+Math.sin(a)*r,v*NS*SH+.3,Math.cos(a)*r-R*.6];},8,18,{uS:6,vS:8,hole:(d>0||ysHole)?(u,v)=>(d>0&&fbm(u*4+s*3,v*5,1520+s,2)<.25)||(ysHole?ysHole(Math.sin(a)*lerp(R-14,R+1,u),Math.cos(a)*lerp(R-14,R+1,u)-R*.6-OC_YS_ZC,v*NS*SH+.3):false):null}));}   /* YS: the end walls holed for the ways in */
 meshMerged(cDeck,CONC(d),G);meshMerged(cBrick,MAT.brick,G);meshMerged(cDark,MAT.dark,G);
 // roof pergola
 for(let k=0;k<12;k++){const a=lerp(a0,a1,(k+.5)/12);if(d>0&&rng()<.3)continue;beam(BOXC(d),[cx+Math.sin(a)*(R-14),NS*SH+.5,Math.cos(a)*(R-14)-R*.6],[cx+Math.sin(a)*(R+2),NS*SH+3.5,Math.cos(a)*(R+2)-R*.6],1,1.2);}
 kput('archOpen',[cx,3.8,R*.4-1],qFacing([0,0,1]),[.6,.6,1],null);
 if(d>0){mossOnRing(cx,NS*SH+.5,-R*.6,R*.7,20,2);vinesOnRing(cx,NS*SH,-R*.6,R-2,16,12);rubbleRing(cx,.3,-R*.6+R*.9,5,30,30,2);}}
/* YS: the Comb as a free-standing builder (the kit draws it inside buildOffices at (330, 0)): its middle (cx, OC_YS_ZC) stands
   on (gx, gz), the host's axis, so a land block takes it alone. Seeds 9460..9464 */
function buildAltOfficeC(scene,gx,gz,d){reseed(9460+d);const G=new THREE.Group();G.position.set(gx-330,0,gz-OC_YS_ZC);scene.add(G);
 /* YS: in a host (KXF set: the host group's transform) the instanced fins go through the nested transform, so the sub-group's
    offset turns with the host; KOFF added after the rotation left them 60 m off the bar (Travis: "dissected") */
 const CX=KXF;if(CX){G.updateMatrix();KXF={m:CX.m.clone().multiply(G.matrix),q:CX.q.clone().multiply(G.quaternion)};KOFF=[0,0,0];}else KOFF=[gx-330,0,gz-OC_YS_ZC];
 officeC(G,d);civFlatten(G);KOFF=[0,0,0];KXF=CX;return G;}


