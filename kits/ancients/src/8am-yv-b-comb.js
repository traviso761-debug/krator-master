// ================================================================= YUNI VARIANTS (2 of 5): the short honeycomb block
// Yuni's stubby sibling of Apartments B: the same Beksinski hexagonal cell
// lattice, wrapped round a squircle plan 58 x 48 and only five storeys, with a
// real roof. A 5 m sandwich of two perforated skins holds the flats; the core
// is closed under a cambered lid. Metres.
// Upgrades over Yuni's (where every cell, strip and dot was forced dead):
// intact, the lattice is glazed and the flats behind it are furnished and lit
// (domRoom per bay, warm cells); ruined, the glass is gone but for teeth of it
// in the cells (civShardAt), and the south-east corner has lost its top two
// storeys, the floors standing in section over a talus; repaired is the ruin
// re-roofed by repairPass. One draw call per material (civFlatten).
function buildYvCombShort(scene,gx,gz,d){reseed(9965+d);KOFF=[gx,0,gz];const G=new THREE.Group();G.position.set(gx,0,gz);scene.add(G);
 REGISTER({name:'Apartments — honeycomb block, short ('+STATE(d)+')',x:0,z:0,r:34,h:22});
 const skin=SHELL(d),RX=29,RZ=24,H=17.5,NF=5,Y0=2.6,FS=(H-Y0)/NF;   // FS: one storey of flats
 const rad=th=>se(th,4.5);                                  // squircle: flat-ish long faces, rounded corners
 const pt=(th,r)=>[Math.cos(th)*RX*rad(th)*r,0,Math.sin(th)*RZ*rad(th)*r];
 const nrm=th=>{const a=pt(th-.002,1),b=pt(th+.002,1),tx=b[0]-a[0],tz=b[2]-a[2],l=Math.hypot(tx,tz)||1;return[tz/l,0,-tx/l];};
 const NU=42,NV=9;                                          // hex columns round the plan, rows up the skin
 const hex=(u,v)=>{const cx=u*NU,cy=v*NV;const rowOff=(Math.floor(cy)%2)*.5;const fx=((cx+rowOff)%1)-.5,fy=(cy%1)-.5;
  return Math.abs(fx)<.33&&Math.abs(fy)<.35&&Math.abs(fx)+Math.abs(fy)*1.15<.54;};
 // THE BITE (ruin): the corner nearest the row camera has lost its top two
 // storeys. bite(th) is the surviving height at bearing th.
 const TB=.62,bite=th=>{const t=clamp(1-civDA(th,TB)/.5,0,1);return t>0?H-(2*FS+1.2)*Math.min(1,t*2.2)-1.6*(fbm(th*9,1.3,9966,2)-.5)*Math.min(1,t*3):H;};
 const bit=(th,y)=>d>0&&y>bite(th);
 const dh=holeFn(d*.8,4500,null,1.4);
 const shellAt=r=>gridSurface((u,v)=>{const th=u*TAU,p=pt(th,r);return[p[0],Y0+v*(H-Y0),p[2]];},200,56,
   {uS:26,vS:9,hole:(u,v)=>hex(u,v)||bit(u*TAU,Y0+v*(H-Y0))||(dh?dh(u*3,v*H):false)});
 const parts=[shellAt(1),shellAt(.80)];                     // outer and inner skin
 parts.push(gridSurface((u,v)=>{const th=u*TAU,a=pt(th,.80),b=pt(th,1);return[lerp(a[0],b[0],v),H,lerp(a[2],b[2],v)];},110,3,{uS:20,vS:2,hole:(u,v)=>bit(u*TAU,H-.1)}));   // roof ring
 for(let f=1;f<NF;f++){const y=Y0+f*FS;   // cell floors between the skins
  parts.push(gridSurface((u,v)=>{const th=u*TAU,a=pt(th,.80),b=pt(th,1);return[lerp(a[0],b[0],v),y,lerp(a[2],b[2],v)];},80,2,
   {hole:d>0?(u,v)=>fbm(u*10,f,4510+f,2)<.2||bit(u*TAU,y+1.2):null}));}
 parts.push(gridSurface((u,v)=>{const th=u*TAU,p=pt(th,.80);return[p[0],H+v*1.5,p[2]];},110,2,{uS:20,vS:1,hole:(u,v)=>bit(u*TAU,H-.1)}));      // parapet
 meshMerged(parts,skin,G);
 mesh(gridSurface((u,v)=>{const th=u*TAU,p=pt(th,.78);return[p[0],Y0+v*(H-Y0),p[2]];},60,6,{hole:(u,v)=>bit(u*TAU,Y0+v*(H-Y0))}),MAT.dark,G);   // dark core wall
 // the roof proper: a cambered lid over the core (the bite takes its rim)
 mesh(gridSurface((u,v)=>{const th=u*TAU,p=pt(th,.80*v);return[p[0],H+1.1*(1-v*v),p[2]];},90,6,{uS:14,vS:6,hole:d>0?(u,v)=>v>.55&&civDA(u*TAU,TB)<.32*(v-.4)/.6+.05:null}),skin,G);
 if(d===0)mesh(gridSurface((u,v)=>{const th=u*TAU,p=pt(th,.985);return[p[0],Y0+.2+v*(H-Y0-.4),p[2]];},100,1,{}),MAT.glass,G);   // the glazing behind the lattice
 // the open ground storey: columns all round, court slab, the first floor slab
 for(let k=0;k<30;k++){const th=(k+.5)/30*TAU,p=pt(th,.92);if(d>0&&rng()<.18)continue;
  kput(d>0?'colR':'colW',[p[0],0,p[2]],null,[1.5,2.7,1.5],null);}
 kput(SLABC(d),[0,1.4,0],null,[RX*.84,.5,RZ*.84],null);
 kput(SLABC(d),[0,2.75,0],null,[RX*1.06,.55,RZ*1.06],null);
 // cells behind the lattice: lit when whole, a few still lit in the ruin (Yuni forced them all dead)
 for(let f=0;f<NF;f++)for(let k=0;k<22;k++){if(rng()>.5)continue;const th=(k+.5)/22*TAU,p=pt(th,.88),y=Y0+(f+.5)*FS;
  if(bit(th,y))continue;const lit=d>0?h3(k,f,9967)<.08:h3(k,f,9967)<.7;
  kput('cell',[p[0],y,p[2]],qFacing(nrm(th)),[1.9,1.5,1],lit?WARM.clone().multiplyScalar(.5+.5*h3(f,k,9968)):DEAD);}
 for(let k=0;k<14;k++){const th=(k+.5)/14*TAU,p=pt(th,1.0);                                    // roof-edge finials
  if(d>0&&rng()<.4)continue;if(bit(th,H))continue;kput(PLATE(d),[p[0]*.99,H+1.9,p[2]*.99],qEuler(0,-th,0),[1.4,1.1,1.4],null);}
 if(d>0){mossOnRing(0,H+1.3,0,RX*.9,26,1.3);vinesOnRing(0,H,0,RX*.95,14,10);rubbleRing(0,0,0,RX+2,RX+16,40,1.5);scatterMoss(0,0,0,RX,RX+20,40,1.2);}
 // --- everything below draws no rng(): hash-placed, so nothing above moves
 // interiors: a room per bay per storey between the skins, lit ceiling strip, cabinet, panel
 for(let f=0;f<NF;f++)for(let k=0;k<36;k++){const th=(k+.5)/36*TAU,y=Y0+.2+f*FS;
  if(bit(th,y+2)||h3(k,f,9969)>.55)continue;const p=pt(th,.975),n=nrm(th);
  domRoom([p[0],y,p[2]],n,(1-.80)*Math.min(RX,RZ)*rad(th)*.85,FS-.4,d,9969+f);}
 // glass teeth left in the ruined lattice: one cell in four or so, by hash
 if(d>0)for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){const cy=j+.5,rowOff=(j%2)*.5,u=((i+.5-rowOff)/NU+1)%1,v=cy/NV;
  const th=u*TAU,y=Y0+v*(H-Y0),hh=h3(i,j,9970);if(hh>.25||bit(th,y+1))continue;if(dh&&dh(u*3,v*H))continue;
  const p=pt(th,1),n=nrm(th);civShardAt([p[0],y,p[2]],qFacing(n),TAU*RX/NU*.6,(H-Y0)/NV*.62,.06,hh*4);}
 if(d>0){// the fallen storeys: a talus banked against the bitten corner, slabs of the roof ring among it
  adRubbleArc(0,0,TB-.55,TB+.55,th=>Math.hypot(pt(th,1)[0],pt(th,1)[2]),12,90,2.4);
  for(let k=0;k<6;k++){const hh=h3(k,1,9971),th=TB+(hh-.5)*.7,p=pt(th,1.12+hh*.25);
   kput('boxCR',[p[0],.7+hh*1.2,p[2]],qEuler((hh-.5)*.9,hh*4,(h3(k,2,9971)-.5)*.9),[5+hh*3,.5,3+hh*2],null);}}
 figures(0,0,4,RX+8);civFlatten(G);KOFF=[0,0,0];return G;}
