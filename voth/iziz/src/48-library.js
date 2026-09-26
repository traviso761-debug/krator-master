// ================================================================= LIBRARY — "the Crown"
function buildLibrary(scene,gx,gz,d){reseed(d>0?9801:9800);KOFF=[gx,0,gz];REGISTER({name:'Library — the Crown ('+STATE(d)+')',x:0,z:0,r:60,h:65});REGISTER({name:'Library — reading hall',x:74,z:0,r:22,h:16});const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const skin=SHELL(d);
 mesh(lathe({rFn:()=>42,H:2,nu:80,nv:1}),skin,G);kput('slab',[0,2,0],null,[42,.5,42],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));
 const pts=[[34,0],[27,12],[19,25],[15.5,34],[17.5,42],[23,50],[27,54]];
 kdef('ribLib'+(d>0?'R':'W'),ribCurveGeo(pts,1.5),d>0?MAT.rust:MAT.white);
 const NR=16;for(let k=0;k<NR;k++){const th=k/NR*TAU;const fallen=d>0&&(k===2||k===3||k===9||k===13);
  if(!fallen)kput('ribLib'+(d>0?'R':'W'),[0,2,0],qEuler(0,-th,0),1,null);
  else{kput('ribLib'+(d>0?'R':'W'),[Math.cos(th)*60,1.4,Math.sin(th)*60],qEuler(Math.PI/2,0,-th),[.9,.9,.9],null);rubbleRing(Math.cos(th)*45,2,Math.sin(th)*45,3,16,30,1.8);}}
 const rib=y=>{for(let i=1;i<pts.length;i++)if(y<=pts[i][1]){const t=(y-pts[i-1][1])/(pts[i][1]-pts[i-1][1]);return lerp(pts[i-1][0],pts[i][0],t);}return pts[pts.length-1][0];};
 if(d===0)mesh(lathe({rFn:y=>rib(y)-1.6,H:44,nu:64,nv:30}),MAT.glass,G,0,2,0);
 else mesh(lathe({rFn:y=>rib(y)-1.8,H:44,nu:48,nv:20,hole:(u,y)=>fbm(u*4,y*.06,500,2)<.55}),MAT.dark,G,0,2,0);
 kput(d>0?'ringR':'ringW',[0,36,0],qEuler(Math.PI/2,0,0),[16,16,10],null);
 kput('slab',[0,2.3,0],null,[30,.6,30],new THREE.Color(0x2a2c30));stripRing(0,6,0,28,d,40);stripRing(0,20,0,18,d,32);
 if(d===0)kput('finial',[0,60,0],null,[3,6,3],null);
 // reading-hall wing: low six-lobed block with arched windows, joined by a covered walk
 const wx=74;mesh(lathe({rFn:()=>15,H:9,flutes:6,amp:.35,sharp:1,nu:72,nv:6,hole:holeFn(d,510,null,2)}),skin,G,wx,0,0);
 if(d>0)mesh(lathe({rFn:()=>13,H:9,nu:24,nv:1}),MAT.dark,G,wx,0,0);
 kput('slab',[wx,9.2,0],null,[15.5,.5,15.5],new THREE.Color(d>0?0x5a4a40:0xd8d4cc));mesh(lathe({rFn:y=>16*Math.sqrt(clamp(1-Math.pow(y/5,2),0,1)),H:5,flutes:6,amp:.3,sharp:1,nu:72,nv:6,hole:holeFn(d*.8,511,null,2)}),skin,G,wx,9.4,0);
 for(let k=0;k<12;k++){const th=(k+.5)/12*TAU;const r=15*(1+.35*(.5+.5*Math.cos(6*th)))+.1;kput(d>0?'winBigD':'winBigI',[wx+r*Math.cos(th),4.5,r*Math.sin(th)],qFacing([Math.cos(th),0,Math.sin(th)]),[.8,.9,1],null);}
 for(let x=44;x<58;x+=6)for(let s=-1;s<=1;s+=2)kput(d>0?'colR':'colW',[x,2,s*4],null,[.7,5,.7],null);
 mesh(gridSurface((u,v)=>[42+u*18,7.2+.4*Math.sin(u*9),(v-.5)*10],16,4,{hole:d>0?(u,v)=>fbm(u*5,v*2,520,2)<.35:null}),skin,G);
 kput('archOpen',[34.5,4,0],qFacing([1,0,0]),[.5,.5,1],null);
 if(d>0){mossOnRing(0,2.4,0,36,40,2);scatterMoss(0,0,0,44,110,90,2);trees(0,0,60,120,12);vinesOnRing(0,36,0,16,12,20);}
 figures(0,60,6,8);KOFF=[0,0,0];return G;}

