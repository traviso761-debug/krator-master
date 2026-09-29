// ================================================================= factory: great silo replaces the ring block
function factorySilo(G,d,skin){const ax=110,az=-60;REGISTER({name:'Factory — great silo',x:ax,z:az,r:45,h:150});
 const stem=y=>y<12?8+.03*Math.pow(12-y,2):(y<20?8+27*Math.pow((y-12)/8,1.6):35);
 mesh(lathe({rFn:stem,H:30,nu:64,nv:30,hole:holeFn(d*.6,80,null,1.5)}),skin,G,ax,6,az);if(d>0)mesh(lathe({rFn:y=>stem(y)*.92,H:30,nu:32,nv:6}),MAT.dark,G,ax,6,az);
 for(let k=0;k<28;k++){const th=k/28*TAU;if(d>0&&rng()<.4)continue;beam(d>0?'strutR':'strutW',[ax+Math.cos(th)*17,20,az+Math.sin(th)*17],[ax+Math.cos(th)*37,38,az+Math.sin(th)*37],2.2,1.8);
  const r=35.6;kput(d>0?'winSmD':'winSmI',[ax+Math.cos(th+.11)*r,31,az+Math.sin(th+.11)*r],qFacing([Math.cos(th+.11),0,Math.sin(th+.11)]),[5,1.6,1],null);}
 kput('slab',[ax,36.4,az],null,[36,1,36],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));stripRing(ax,33,az,33,d,40);
 for(let k=0;k<16;k++){const th=k/16*TAU;if(d>0&&(k===3||k===9))continue;kput(d>0?'colR':'colW',[ax+Math.cos(th)*30,6,az+Math.sin(th)*30],null,[1.2,14,1.2],null);}
 // the silo proper: 8-lobed drum rising 110 m from the ring, domed cap, service ring
 const SH=110,cut=d>0?SH*.7:null;const sr=y=>26*(1-.12*y/SH);
 mesh(lathe({rFn:sr,H:SH,cut,jag:cut?5:0,flutes:8,amp:.22,sharp:1.2,nu:96,nv:50,hole:holeFn(d,85,cut,1.4),seed:85}),skin,G,ax,37,az);
 if(d>0)mesh(lathe({rFn:y=>sr(y)*.88,H:SH,cut,jag:5,nu:32,nv:8,seed:85}),MAT.guts,G,ax,37,az);
 for(let yy=12;yy<(cut||SH)-8;yy+=22)kput(d>0?'ringR':'ringW',[ax,37+yy,az],qEuler(Math.PI/2,0,0),[sr(yy)*1.05,sr(yy)*1.05,4],null);
 if(!cut){mesh(lathe({rFn:y=>sr(SH)*Math.sqrt(clamp(1-Math.pow(y/14,2),0,1)),H:14,nu:48,nv:8}),skin,G,ax,37+SH-.5,az);stripRing(ax,37+SH-3,az,sr(SH)*.95,d,32);}
 else rubbleRing(ax,6,az,38,70,60,3);
 for(let k=0;k<3;k++){const th=k/3*TAU+.5;kput(d>0?'pipeR':'pipe',[ax+Math.cos(th)*24,37,az+Math.sin(th)*24],null,[1.1,(cut||SH)*.9,1.1],null);}
 kput(d>0?'pipeR':'pipe',[ax-30,26,az+20],qEuler(0,.6,Math.PI/2),[1.6,60,1.6],null);}

