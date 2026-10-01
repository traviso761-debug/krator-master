// ================================================================= SKYSCRAPER F — "the Trays" (stacked concrete trays, glass between)
// gy/noPlinth let this tower be stood somewhere other than the ground -- the
// Screamers' chief took the ruin of one and had it lashed to the promenade.
// kput adds all three components of KOFF and bodyGroup routes the instanced
// pieces through useGroupXF, so lifting both KOFF and the group is consistent.
function buildSkyF(scene,gx,gz,d,gy,noPlinth,hcut){reseed(9150+d);gy=gy||0;KOFF=[gx,gy,gz];const G=new THREE.Group();G.position.set(gx,gy,gz);scene.add(G);const dd=d>0?1:0;
 const H=290,Y0=10,TS=12;REGISTER({name:'Skyscraper F — the Trays ('+(d===2?'toppled':STATE(d))+')',x:0,y:gy,z:0,r:120,h:H+20});
 if(!noPlinth)skyPlinth(G,dd,105);
 const RT=y=>28*(1-.2*clamp(y/H,0,1))+6*Math.sin(Math.PI*clamp(y/H,0,1));
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*(hcut||.8):null);const L=(cut!=null?cut:H)-y0;
  mesh(lathe({rFn:()=>11,H:L,nu:32,nv:4,hole:holeFn(dx*.6,67,null,2)}),CONC(dx),P);if(dx>0)mesh(lathe({rFn:()=>9.5,H:L,nu:16,nv:1}),MAT.guts,P);
  const trays=[],darks=[];   // one mesh for the whole stack, not three per tray
  let k0=Math.round(y0/TS);for(let y=0;y+2<L;y+=TS){const k=k0+((y/TS)|0);const yy=y+y0;const R=RT(yy);const ang=k*.14;const fallen=dx>0&&(k%7===3);
   const trayR=th=>R*(1+.22*Math.cos(3*(th-ang)));
   if(!fallen){
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11,trayR(th),v);return[r*Math.cos(th),y+TS-2.6,r*Math.sin(th)];},96,4,{uS:16,vS:2,hole:holeFn(dx*.7,68+k,null,2)}));
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th);return[r*Math.cos(th),y+TS-2.6+v*2.6,r*Math.sin(th)];},96,1,{uS:16}));
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11,trayR(th),v);return[r*Math.cos(th),y+TS,r*Math.sin(th)];},96,2,{}));
    if(dx===0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th)*.82;return[r*Math.cos(th),y+.2+v*(TS-2.9),r*Math.sin(th)];},96,1,{}),MAT.glass,P);
    else darks.push(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th)*.72;return[r*Math.cos(th),y+.2+v*(TS-2.9),r*Math.sin(th)];},64,1,{hole:(u,v)=>fbm(u*6,k,69,2)<.3}));
    for(let j=0;j<18;j++){const th=j/18*TAU;const r=trayR(th)*.82;kput(dx>0?'mullR':'mullW',[r*Math.cos(th),y+TS/2-1.3,r*Math.sin(th)],qEuler(0,-th,0),[.8,TS-2.9,.8],null);}
    stripRing(0,y+TS-3.3,0,R*.7,dx,20);}
   else{const fm=mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11,trayR(th),v);return[r*Math.cos(th),0,r*Math.sin(th)];},64,3,{uS:16,vS:2,hole:holeFn(1,68+k,null,1.5)}),MAT.concreteR,P,6,y+TS-6,4);fm.rotation.set(.35,0,.25);}}
  meshMerged(trays,CONC(dx),P);meshMerged(darks,MAT.dark,P);
  if(cut==null){mesh(lathe({rFn:y=>13*Math.sqrt(clamp(1-Math.pow(y/10,2),0,1)),H:10,nu:32,nv:6}),CONC(dx),P,0,L,0);kput(dx>0?'ringR':'ringW',[0,L+3,0],qEuler(Math.PI/2,0,0),[15,15,4],null);if(dx===0)kput('finial',[0,L+13,0],null,[3,5,3],null);}};
 bodyGroup(G,Y0,d,dd,build,Y0+TS*5,RT(Y0+60));
 if(!noPlinth)figures(-100,130,6,6);
 KOFF=[0,0,0];return G;}

