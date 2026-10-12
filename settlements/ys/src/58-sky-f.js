// ================================================================= SKYSCRAPER F — "the Trays" (stacked concrete trays, glass between)
// NON-GROUND PLACEMENT. gy lifts the whole tower, noPlinth drops the ground
// plinth and apron, and hcut (decay 1) cuts the body at that fraction of H
// instead of 0.8. kput adds all three components of KOFF and bodyGroup already
// routes the instanced pieces through useGroupXF, so lifting both KOFF and the
// group moves merged meshes and instances together. See buildPerch for a
// worked example -- a tower standing on a podium 90 m up. An explicit hcut
// also holds at level 3: the Perch's rehabilitated half-height ruin used to
// stand back up to its full 290 m (level 3 is "the ruin, reoccupied").
// `slim` is a PLAN SCALE, default 1 — the whole footprint shrinks while H stays
// 290, so the same tower can be a slender one. The footprint here was always
// dominated by the PODIUM, not the building: skyPlinth was r=105 where the
// tower and its trays only reach ~38, which is why the registered volume was
// r=120. The podium is now 48 and the registered volume 56 (see below), so
// `slim` and the plinth pass are now doing the same job from both ends.
// At slim=0.45 the trays reach ~19 and a roof can carry three of these in the
// space one used to need. Every existing caller passes nothing and is unchanged.
function buildSkyF(scene,gx,gz,d,gy,noPlinth,hcut,slim){reseed(9150+d);gy=gy||0;
 const PS=slim||1;KOFF=[gx,gy,gz];const G=new THREE.Group();G.position.set(gx,gy,gz);scene.add(G);const dd=d>0?1:0;
 const H=290,Y0=10,TS=12;
 /* YS: a host (64-hyk-accrete YS_CUT): the cut comes in as y1 through bodyGroup (52-sky-abc ysCutY, builder y), every tray
    stands, the core runs down to the ground in place of the restand plinth the city never draws, no figures */
 const ysOn=(typeof YS_CUT!=='undefined'&&YS_CUT)?true:false;
 REGISTER({name:'Skyscraper F — the Trays ('+(d===2?'toppled':STATE(d))+')',x:0,y:gy,z:0,r:(noPlinth?46:50)*PS,h:H+20});
 // PLINTH. The note above was written when 105 was still the radius; it is now
 // 48. The widest tray is RT(y)*1.22 = 38.4 at PS=1, so 48 puts skyPlinth's
 // column ring at 44.6 just outboard of it, and the registered radius below
 // stops being three times the building. Everything in skyPlinth derives from
 // this one number, so the columns, the cornice ring, the apron and the moss,
 // rubble and tree rings all move with it.
 // RESTAND (A-H): 44*PS, ring at 40.9. The trays are cantilevered off the
 // core and the lowest one (19 m up, above the cornice ring at 17.3) reaches
 // only 34.8; the 38.4 tray is mid-height, where overhanging the podium edge
 // is what a cantilevered tray does.
 const PR=44*PS;
 if(!noPlinth)skyPlinth(G,dd,PR);
 const RT=y=>(28*(1-.2*clamp(y/H,0,1))+6*Math.sin(Math.PI*clamp(y/H,0,1)))*PS;
 const build=(P,dx,y0,y1,upper)=>{const cut=(dx>0&&!upper&&y1!=null)?y1:(dx>0&&(d===1||(d===3&&hcut))?H*(hcut||.8):null);const L=(cut!=null?cut:H)-y0;
  const ysh=(typeof ysWallHole==='function')?ysWallHole(null,y0):null;   /* YS: a way-in pod's hole through the glass band's lining (u = th/TAU, the lathe's bearing) */
  if(ysOn&&YS_CUT.noPlinth&&y0>0)mesh(lathe({rFn:()=>11*PS,H:y0,nu:32,nv:1}),CONC(dx),P,0,-y0,0);   /* YS: the core down to the ground (the city draws no plinth) */
  mesh(lathe({rFn:()=>11*PS,H:L,nu:32,nv:4,hole:holeFn(dx*.6,67,null,2)}),CONC(dx),P);if(dx>0)mesh(lathe({rFn:()=>9.5*PS,H:L,nu:16,nv:1}),MAT.guts,P);
  const trays=[],darks=[];   // one mesh for the whole stack, not three per tray
  let k0=Math.round(y0/TS);for(let y=0;y+2<L;y+=TS){const k=k0+((y/TS)|0);const yy=y+y0;const R=RT(yy);const ang=k*.14;const fallen=dx>0&&(k%7===3)&&!ysOn;   /* YS: every tray standing (a pod's floor is a tray) */
   const trayR=th=>R*(1+.22*Math.cos(3*(th-ang)));
   if(!fallen){
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11*PS,trayR(th),v);return[r*Math.cos(th),y+TS-2.6,r*Math.sin(th)];},96,4,{uS:16,vS:2,hole:holeFn(dx*.7,68+k,null,2)}));
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th);return[r*Math.cos(th),y+TS-2.6+v*2.6,r*Math.sin(th)];},96,1,{uS:16}));
    trays.push(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11*PS,trayR(th),v);return[r*Math.cos(th),y+TS,r*Math.sin(th)];},96,2,{}));
    if(dx===0)mesh(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th)*.82;return[r*Math.cos(th),y+.2+v*(TS-2.9),r*Math.sin(th)];},96,1,{}),MAT.glass,P);
    else darks.push(gridSurface((u,v)=>{const th=u*TAU;const r=trayR(th)*.72;return[r*Math.cos(th),y+.2+v*(TS-2.9),r*Math.sin(th)];},ysh?96:64,1,{hole:(u,v)=>fbm(u*6,k,69,2)<.3||(ysh&&ysh(u,y+.2+v*(TS-2.9)))}));   /* YS: the way-in holes */
    for(let j=0;j<18;j++){const th=j/18*TAU;if(ysh&&ysh(j/18,y+2.5))continue;   /* YS: no mullion across a way in */const r=trayR(th)*.82;kput(dx>0?'mullR':'mullW',[r*Math.cos(th),y+TS/2-1.3,r*Math.sin(th)],qEuler(0,-th,0),[.8*PS,TS-2.9,.8*PS],null);}
    stripRing(0,y+TS-3.3,0,R*.7,dx,20);}
   else{const fm=mesh(gridSurface((u,v)=>{const th=u*TAU;const r=lerp(11*PS,trayR(th),v);return[r*Math.cos(th),0,r*Math.sin(th)];},64,3,{uS:16,vS:2,hole:holeFn(1,68+k,null,1.5)}),MAT.concreteR,P,6,y+TS-6,4);fm.rotation.set(.35,0,.25);}}
  meshMerged(trays,CONC(dx),P);meshMerged(darks,MAT.dark,P);
  if(ysOn&&cut!=null&&dx>0){/* YS: a stump's torn top (Travis, Oct 5 2026: a Trays stump cut at a tray read as a whole tower). The core
    and the next band's lining stand 2-12 m over the last tray, torn ragged, a few mullions with them, and a wedge of the next
    tray hangs on where the core stands tallest. Hash noise only (fbm, lathe's jag), so the builder's stream is unchanged. */
   const k=k0+Math.round(L/TS),R=RT(y0+L),ang=k*.14,trayR=th=>R*(1+.22*Math.cos(3*(th-ang))),sd=k+3;
   for(const [r,M] of [[11*PS,CONC(dx)],[9.5*PS,MAT.guts]])mesh(lathe({rFn:()=>r,H:12,cut:7,jag:5,seed:sd,nu:32,nv:4}),M,P,0,L,0);
   const lh=u=>1.2+6*fbm(u*5,k,73,2);
   mesh(gridSurface((u,v)=>{const th=u*TAU,r=trayR(th)*.72;return [r*Math.cos(th),L+.2+v*lh(u),r*Math.sin(th)];},64,2,{hole:(u,v)=>fbm(u*9,k,74,2)<.45}),MAT.dark,P);
   for(let j=0;j<18;j++){const th=j/18*TAU,h=8*fbm(j*.9,k,75,2)-2;if(h<1.2)continue;const r=trayR(th)*.82;kput('mullR',[r*Math.cos(th),L+h/2,r*Math.sin(th)],qEuler(0,-th,0),[.8*PS,h,.8*PS],null);}
   let ub=0,hb=-1;for(let i=0;i<32;i++){const h=fbm(i/32*7+sd,2.3,sd*.7,3);if(h>hb){hb=h;ub=i/32;}}const tc=ub*TAU,yT=L+Math.min(TS-1.2,7+5*(hb*2-1)-.2);   /* the wedge: where the core stub is tallest, its top on the stub's torn edge (sagged) */
   const ro=(u)=>{const th=tc+(u*2-1)*.65,t=u*2-1;return 11*PS+(trayR(th)-11*PS)*(.3+.55*fbm(th*3,k,76,2))*(1-t*t*.85);};
   const wpt=(u,r,y)=>{const th=tc+(u*2-1)*.65;return [r*Math.cos(th),y,r*Math.sin(th)];};
   mesh(gridSurface((u,v)=>wpt(u,lerp(10.6*PS,ro(u),v),yT),16,3,{}),CONC(dx),P);
   mesh(gridSurface((u,v)=>wpt(u,lerp(10.6*PS,ro(u),v),yT-2.2),16,3,{}),CONC(dx),P);
   mesh(gridSurface((u,v)=>wpt(u,ro(u),yT-2.2+v*2.2),16,1,{}),CONC(dx),P);}
  if(cut==null){mesh(lathe({rFn:y=>13*PS*Math.sqrt(clamp(1-Math.pow(y/10,2),0,1)),H:10,nu:32,nv:6}),CONC(dx),P,0,L,0);kput(dx>0?'ringR':'ringW',[0,L+3,0],qEuler(Math.PI/2,0,0),[15*PS,15*PS,4*PS],null);if(dx===0)kput('finial',[0,L+13,0],null,[3*PS,5,3*PS],null);}};
 bodyGroup(G,Y0,d,dd,build,Y0+TS*5,RT(Y0+60));
 if(!noPlinth&&!(ysOn&&YS_CUT.noPlinth))figures(-PR,PR*1.28,6,6);   /* YS: no figures round a plinth that is not drawn */
 KOFF=[0,0,0];return G;}

