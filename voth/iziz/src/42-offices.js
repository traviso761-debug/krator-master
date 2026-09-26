// ================================================================= OFFICES (two variants)
function buildOffices(scene,gx,gz,d){reseed(d>0?9501:9500);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 // A — flared ring (Tange mushroom)
 {REGISTER({name:'Office A — flared ring ('+STATE(d)+')',x:0,z:0,r:55,h:42});const stem=y=>y<12?11+.04*Math.pow(12-y,2):(y<21?11+32*Math.pow((y-12)/9,1.6):43);
  mesh(lathe({rFn:stem,H:32,nu:72,nv:32,hole:holeFn(d*.7,201,null,1.4)}),skin,G);
  if(d>0)mesh(lathe({rFn:y=>stem(y)*.92,H:32,nu:32,nv:6}),MAT.dark,G);
  for(let k=0;k<32;k++){const th=k/32*TAU;if(d>0&&rng()<.35)continue;beam(d>0?'strutR':'strutW',[Math.cos(th)*20,20,Math.sin(th)*20],[Math.cos(th)*45,40,Math.sin(th)*45],2.6,2);
   for(let r=0;r<2;r++){const rr0=43.7;const t2=th+.1;kput(d>0?'winSmD':'winSmI',[Math.cos(t2)*rr0,25+r*5,Math.sin(t2)*rr0],qFacing([Math.cos(t2),0,Math.sin(t2)]),[5.5,2,1],null);}}
  kput('slab',[0,38.5,0],null,[44,1.2,44],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));stripRing(0,30,0,41,d,48);stripRing(0,35,0,41,d,48);
  for(let k=0;k<20;k++){const th=k/20*TAU;if(d>0&&rng()<.2)continue;kput(d>0?'colR':'colW',[Math.cos(th)*36,0,Math.sin(th)*36],null,[1.4,19,1.4],null);}
  mesh(lathe({rFn:()=>52,H:1.2,nu:64,nv:1}),skin,G);kput('slab',[0,1.2,0],null,[52,.4,52],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
  kput('archOpen',[11.5,4.8,0],qFacing([1,0,0]),[.6,.6,1],null);
  if(d>0){mossOnRing(0,1.6,0,48,50,2);vinesOnRing(0,38,0,44,30,18);rubbleRing(0,1.2,0,14,50,30,2);}}
 // B — lobed tower (Marina / Hilliard scallops)
 {const bx=190;REGISTER({name:'Office B — lobed tower ('+STATE(d)+')',x:bx,z:0,r:20,h:60});const B=new THREE.Group();B.position.set(bx,0,0);G.add(B);const R=13,H=52,cut=d>0?H*.72:null;
  const lobe=th=>R*(1+.32*(.5+.5*Math.cos(8*th)));
  mesh(lathe({rFn:()=>6,H:12,nu:24,nv:2}),skin,B);for(let k=0;k<16;k++){const th=k/16*TAU;if(d>0&&(k===4||k===11))continue;kput(d>0?'colR':'colW',[bx+Math.cos(th)*13.5,0,Math.sin(th)*13.5],null,[1.3,12,1.3],null);}
  const hole=holeFn(d,210,cut,1.8);
  mesh(lathe({rFn:()=>R,H:H-12,cut:cut?cut-12:null,jag:cut?3:0,flutes:8,amp:.32,sharp:1,nu:96,nv:40,hole,seed:210}),skin,B,0,12,0);
  if(d>0){mesh(lathe({rFn:()=>R*.88,H:H-12,cut:cut-12,jag:3,nu:32,nv:6,seed:210}),MAT.guts,B,0,12,0);floorSlabs(bx,12,0,()=>R*.95,4,(cut||H)-12,4,d,cut?cut-12:null);}
  const bBands=[];   // ten storeys of lobed banding in one mesh
  for(let s=0;s<Math.floor(((cut||H)-12)/4);s++){const y=12+s*4;
   const bh=d>0?(u,v)=>fbm(u*10+s,2,211+s,2)<.24*d:null;
   bBands.push(lathe({rFn:()=>R*1.09,H:1,flutes:8,amp:.34,sharp:1,nu:96,nv:1,hole:bh}).translate(0,y+3,0));
   bBands.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(lobe(th)*.97,lobe(th)*1.09,v);return[r*Math.cos(th),y+3.9,r*Math.sin(th)];},96,2,{hole:bh}));
   for(let k=0;k<8;k++)for(let j=-1;j<=1;j+=2){const th=k/8*TAU+j*.16;const u=((th%TAU)+TAU)%TAU/TAU;if(hole&&hole(u,y-12))continue;const r=lobe(th)+.1;
    kput(d>0?'winSmD':'winSmI',[bx+r*Math.cos(th),y+1.9,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[1.9,1.5,1],null);}
   if(s%3===0)stripRing(bx,y+2.5,0,R*.85,d,24);}
  meshMerged(bBands,skin,B);
  if(!cut){kput('slab',[bx,H+.2,0],null,[R*1.1,.6,R*1.1],new THREE.Color(0xd8d4cc));mesh(lathe({rFn:y=>7*Math.sqrt(clamp(1-Math.pow(y/6,2),0,1)),H:6,nu:24,nv:6}),skin,B,0,H+.5,0);}
  else{rubbleRing(bx,0,0,15,40,60,2.5);mossOnRing(bx,cut,0,R,10,1.5);}
  if(d>0){vinesOnRing(bx,12,0,R*1.05,20,10);scatterMoss(bx,0,0,15,45,40,2);}}
 officeC(G,d);figures(60,50,5,5);figures(190,22,3,3);KOFF=[0,0,0];return G;}

