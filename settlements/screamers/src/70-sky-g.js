// ================================================================= SKYSCRAPER G — "the Ward" (SUNY: concrete block stack + dark glass drum)
function buildSkyG(scene,gx,gz,d){reseed(9160+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const H=210,Y0=6;REGISTER({name:'Skyscraper G — the Ward ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:150,h:H+30});
 skyPlinth(G,dd,130);
 // podium: long low concrete bar with a glass ribbon
 kput(BOXC(dd),[0,10,90],null,[240,10,30],null);kput(BOXC(dd),[0,17,90],null,[242,1.2,32],null);if(dd===0)kput('pane',[0,13,105.2],null,[236,4,1],null);else kput('boxD',[0,13,104],null,[236,4,1],null);
 for(let k=-8;k<=8;k++)kput(BOXC(dd),[k*14,13,105.4],null,[.8,5,.8],null);
 // the drum tower (dark glass, a few lit cells)
 const R=26;const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.85:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx*.8,77+(upper?1:0),cut!=null?L:null,1.3);
  const drum=lathe({rFn:()=>R,H:L,nu:64,nv:Math.round(L/4),hole:hole,seed:77});mesh(drum,dx>0?MAT.guts:MAT.darkGlass,P);
  if(dx>0){for(let y=4;y<L-2;y+=4)kput('slab',[0,y,0],null,[R*.95,.4,R*.95],new THREE.Color(0x2a2c30));mesh(lathe({rFn:()=>R*.6,H:L,nu:24,nv:2}),MAT.guts,P);}
  for(let y=6;y<L-4;y+=8)for(let k=0;k<18;k++){const th=(k+.5)/18*TAU;if(hole&&hole(th/TAU,y))continue;if(rng()<.55)continue;const lit=dx>0?rng()<.04:true;kput('cell',[R*1.01*Math.cos(th),y,R*1.01*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[3,2.2,.5],lit?WARM.clone().multiplyScalar(rr(.4,.9)):DEAD);}
  for(let y=0;y<L;y+=4)kput(dx>0?'ringR':'ringW',[0,y,0],qEuler(Math.PI/2,0,0),[R+.2,R+.2,1.5],null);
  if(cut==null){mesh(lathe({rFn:()=>R+1.5,H:8,nu:64,nv:1}),CONC(dx),P,0,L,0);kput(SLABC(dx),[0,L+8,0],null,[R+1.6,.8,R+1.6],null);kput(BOXC(dx),[0,L+11,0],null,[10,6,10],null);}};
 const CX=-70;const D=new THREE.Group();D.position.set(CX,Y0,0);G.add(D);useGroupXF(D);if(d<2)build(D,dd,Y0,null,false);else build(D,1,Y0,Y0+60,false);endGroupXF();
 // The drum falls WEST, away from its own block stack. Toppling it east dropped
 // 200 m of tower straight through the stack it is meant to stand beside.
 if(d===2)toppledUpper(G,CX,0,Y0+60,R,(U)=>build(U,1,Y0+60,null,true),d,-1);
 // block stack: 2×2 concrete blocks in two tiers on stilts, porthole strips, service cores between
 const BX=70,BW=42,BH=34,gap=10;const tiers=[[26,0],[26+BH+gap,1]];
 // Which blocks have come down. One gone out of eight read as barely touched;
 // the stack now loses most of its top tier, and a lower corner as well once
 // the tower itself has fallen. A lower block never goes without the one above
 // it, so nothing is left hanging in the air.
 const fallen=(tier,sx,sz)=>dd>0&&(tier===1?(sx>0||sz<0):(d===2&&sx>0&&sz<0));
 for(let k=0;k<8;k++){const x=BX+(k%4-1.5)*30,z=(k<4?-1:1)*30;kput(BOXC(dd),[x,Y0+13,z],null,[3.2,26,3.2],null);}
 tiers.forEach(t=>{const y=Y0+t[0];for(const sx of [-1,1])for(const sz of [-1,1]){const cx=BX+sx*(BW/2+gap/2),cz=sz*(BW/2+gap/2);const gone=fallen(t[1],sx,sz);
  if(gone){rubbleRing(cx+30,Y0,cz+20,5,40,50,3);continue;}
  const q=null;mesh(gridSurface((u,v)=>{const th=u*TAU;const r=BW/2*se(th,5)*(1+.03*Math.sin(v*Math.PI));return[cx+r*Math.cos(th),y+v*BH,cz+r*Math.sin(th)];},64,8,{uS:12,vS:6,hole:holeFn(dd*.7,78,null,2)}),CONC(dd),G);
  kput(SLABC(dd),[cx,y+BH,cz],null,[BW/2*1.05,1,BW/2*1.05],null);kput('boxD',[cx,y+BH/2,cz],null,[BW-3,BH-2,BW-3],null);
  // porthole columns on the outer faces
  for(const f of [[sx,0],[0,sz]]){for(let r=0;r<6;r++)for(let c=-1;c<=1;c+=2){const px=cx+f[0]*(BW/2+.3)+(f[1]?c*7:0),pz=cz+f[1]*(BW/2+.3)+(f[0]?c*7:0);
   kput(dd>0?'ovalD':'ovalI',[px,y+5+r*5,pz],qFacing([f[0],0,f[1]]),[1.4,1.4,1],null);}}
  if(dd>0)mossOnRing(cx,y+BH+.5,cz,BW*.4,8,1.6);}
  // glass core between the four blocks
  if(dd===0)kput('pane',[BX,y+BH/2,0],null,[gap-1,BH,1],null);kput('boxD',[BX,y+BH/2,0],null,[gap-2,BH,gap-2],null);
  // bridges to the drum
  for(const bz of [-8,8]){const y1=y+BH*.55;if(dd>0&&t[1]===1&&bz===8)continue;
   if(d===2&&y1>Y0+60)continue;                     // the drum is cut at Y0+60; do not bridge to thin air
   kput(BOXC(dd),[(CX+R+BX-BW-gap/2)/2,y1-1.5,bz],null,[BX-BW-gap/2-CX-R,1,6],null);
   if(dd===0)kput('pane',[(CX+R+BX-BW-gap/2)/2,y1+1.5,bz+3],null,[BX-BW-gap/2-CX-R,4,1],null);else kput('boxD',[(CX+R+BX-BW-gap/2)/2,y1+1.5,bz],null,[BX-BW-gap/2-CX-R-2,3,4],null);
   for(let x=CX+R+4;x<BX-BW-gap/2;x+=5)kput(dd>0?'mullR':'mullW',[x,y1+1.5,bz+3.2],null,[.4,4,.4],null);}});
 kput('archOpen',[CX+R-1,Y0+5,0],qFacing([1,0,0]),[.7,.7,1],null);
 if(dd>0){vinesOnRing(CX,Y0+40,0,R,20,20);}
 figures(-100,140,6,6);KOFF=[0,0,0];return G;}

