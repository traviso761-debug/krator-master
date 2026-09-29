// ================================================================= SKYSCRAPER D — "the Monolith" (bare concrete, Torre Velasca head)
function buildSkyD(scene,gx,gz,d){reseed(9130+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);const dd=d>0?1:0;
 const H=340,Y0=14;REGISTER({name:'Skyscraper D — the Monolith ('+(d===2?'toppled':STATE(d))+')',x:0,z:0,r:120,h:H+20});
 skyPlinth(G,dd,110);
 const rFn=y=>{const t=clamp(y/H,0,1);return 30*(1-.12*t)+(t>.84?9*Math.pow((t-.84)/.16,.7):0);};
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&d===1?H*.76:null);const L=(cut!=null?cut:H)-y0;const hole=holeFn(dx,47+(upper?1:0),cut!=null?L:null,1.2);
  const skin=gridSurface((u,v)=>{const th=u*TAU,y=v*L;const fy=((y+y0)%12)/12;const rec=fy>.62&&fy<.92?.94:1;const r=rFn(y+y0)*se(th,3.2)*rec;return[r*Math.cos(th),y,r*Math.sin(th)];},96,Math.round(L/2),{uS:16,vS:L/8,hole:hole?(u,v)=>hole(u,v*L):null});
  mesh(skin,CONC(dx),P);
  if(dx>0){mesh(lathe({rFn:y=>rFn(y+y0)*.86,H:H-y0,cut:cut!=null?L:null,jag:6,nu:32,nv:8,seed:47}),MAT.guts,P);for(let y=6;y<L-2;y+=6)kput('slab',[0,y,0],null,[rFn(y+y0)*.9,.5,rFn(y+y0)*.9],new THREE.Color(0x2a2c30));}
  const dRib=[];   // the ruined ribbons merge; the intact ones are glass, which does not
  for(let y=12-((y0)%12);y<L-4;y+=12){const yy=y+y0;const r0=rFn(yy)*.95; // glass ribbon in each recess
   if(dx===0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=r0*se(th,3.2);return[r*Math.cos(th),y+7.4+v*3.6,r*Math.sin(th)];},96,1,{}),MAT.glass,P);
   else dRib.push(gridSurface((u,v)=>{const th=u*TAU;const r=r0*se(th,3.2)*.98;return[r*Math.cos(th),y+7.4+v*3.6,r*Math.sin(th)];},96,1,{hole:(u,v)=>hole&&hole(u,y)}));
   if(((yy/12)|0)%3===0)stripRing(0,y+9,0,r0*.9,dx,28);}
  meshMerged(dRib,MAT.dark,P);
  // lift-core spine on +x, Velasca props under the head
  kput(BOXC(dx),[rFn(y0+L*.5)*.9+2.5,L/2,0],null,[5,L,9],null);
  if(cut==null){const yh=H*.84-y0;for(let k=0;k<16;k++){const th=(k+.5)/16*TAU;const r1=rFn(H*.8)*se(th,3.2),r2=rFn(H*.9)*se(th,3.2)*1.02;
    beam(dx>0?'strutR':'strutW',[Math.cos(th)*r1*.98,yh-14,Math.sin(th)*r1*.98],[Math.cos(th)*r2,yh+8,Math.sin(th)*r2],2.4,2);}
   mesh(gridSurface((u,v)=>{const th=u*TAU;const r=(rFn(H)+1.2)*se(th,3.2)*(1-v*.02);return[r*Math.cos(th),L+v*4,r*Math.sin(th)];},96,1,{uS:16}),CONC(dx),P);
   kput(BOXC(dx),[0,L+2,0],null,[rFn(H)*1.9,.8,rFn(H)*1.9],null);
   for(let k=0;k<6;k++){const a=k/6*TAU;kput(BOXC(dx),[Math.cos(a)*14,L+7,Math.sin(a)*14],qEuler(0,-a,0),[3,10,8],null);}
   if(dx===0)mesh(lathe({rFn:y=>9*Math.sqrt(clamp(1-Math.pow(y/8,2),0,1)),H:8,nu:24,nv:6}),MAT.glass,P,0,L+4,0);}};
 bodyGroup(G,Y0,d,dd,build,Y0+60,rFn(Y0+60));
 if(dd>0)vinesOnRing(0,Y0+12,0,rFn(Y0)*1.0,30,20);
 figures(-100,130,6,6);KOFF=[0,0,0];return G;}

