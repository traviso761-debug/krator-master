// ================================================================= 78s. THE PALACE CITADEL ON ITS HILL (the palace page's one site)
// [web] The whole precinct as one VERN def ('pal_citadel', placed at the page's origin by 89z-rows.js), built before kbake:
//  - the hill: the mesa's paved top (left open under the palace block, whose floors stand there) and its escarpment in the
//    city's strata (MAT.izEsc: 88y binds it to cityStrata), the Mech Gate's cutting in the rear face, the gate's facade with
//    its blast doors standing open, and the ramp road out;
//  - the precinct as the city builds it (90a): the palace (78-transplant.js 'palace', at the hill's centre less 20 m toward
//    the gate), the Ancient curtain wall (r 84) and its gate, the two Praetorian barracks, the orb-bearer; the triumphal
//    plaza's paving, lamp columns and banner poles (BLUEPRINT.md I0: #2, #3, #44);
//  - the blueprint laid (78q) and drawn (78r), the palace's frustums swapped for shells with doorways;
//  - the precinct buildings' outsides: the Praetorium and the Hall of Embassies (orange ashlar on a plinth, cream bands at
//    each floor, deco fins, lit windows, a stepped attic under a verdigris pyramid, standards at the corners) and the three
//    services (one storey under a verdigris hip roof); a door portal with a canopy where the layout put an outer door.
// IZPAL_SITE keeps the layout and the frame for the furnishing (95p-palace-furnish.js).
MAT.izEsc=new THREE.MeshStandardMaterial({map:TEX.concrete,color:0x9a8670,roughness:.97,metalness:0,side:THREE.DoubleSide});   // bound by 88y (cityStrata)
const IZPAL_SITE={L:null,FR:null,stats:null,ms:0};
VERN.def({key:'pal_citadel',name:'The Palace Citadel of Iziz',w:280,d:280,h:140,tags:{culture:'iziz-old',type:['civic','military'],wealth:'civic',lit:true,role:'palace citadel'},
 build:function buildPalCitadel(G,o){reseed(7951);const t0=performance.now();
  const P=PALGEO,top=P.top,g=Math.atan2(P.gz,P.gx),gx=P.gx,gz=P.gz,FR=IZPAL.frame(P),Q=qEuler(0,FR.ry,0);
  const B=(item,u,v,y,su,sv,sy,c)=>{const p=FR.P(u,v);kput(item,[p[0],top+y+sy/2,p[1]],Q,[sv,sy,su],c||null);};
  /* ---------------------------------------------------------------- the hill */
  TSTAT.cur='pal_hill/0';
  {// the top: 2 m cells inside the crags' edge, none under the palace block (its own floors) or in the shafts
   const pos=[],uv=[],idx=[],S=2,R=P.r0+4;let n=0;const base=FR.Y(0);
   for(let x=-R;x<R;x+=S)for(let z=-R;z<R;z+=S){const cs=[[x,z],[x+S,z],[x+S,z+S],[x,z+S]];
    if(cs.some(c=>terrainH(c[0],c[1])<top-.01))continue;const uvc=FR.UV(x+S/2,z+S/2);if(uvc[0]>-22.5&&uvc[0]<62.5&&uvc[1]>-48.5&&uvc[1]<48.5)continue;
    cs.forEach(c=>{pos.push(c[0],base,c[1]);uv.push(c[0]/7.8,c[1]/7.8);});idx.push(n,n+2,n+1,n,n+3,n+2);n+=4;}
   const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();
   const m=new THREE.Mesh(geo,MAT.paving);m.name='palace hill top';m.userData.isGround=true;scene.add(m);
   // the escarpment, from the crags' edge to the foot, with the cutting left out
   const nu=Math.round(TAU*(P.r0+16)/2),nv=20,w=P.r1-P.r0+3;
   const esc=gridSurface((a,t)=>{const th=a*TAU,e=palGeoEdge(th),r=e-1+t*w,bump=Math.sin(Math.PI*t),n2=fbm(th*9,t*3,7.3,3),cr=fbm(th*33,t*8,5.1,2);
     const R2=r+((n2-.5)*5+(cr-.5)*2.4)*bump;return[P.cx+R2*Math.cos(th),Math.max(0,terrainH(P.cx+r*Math.cos(th),P.cz+r*Math.sin(th))+.3*bump+(cr-.5)*1.4*bump),P.cz+R2*Math.sin(th)];},
    nu,nv,{uS:TAU*(P.r0+16)/6.3,vS:w/6.3,hole:(a,t)=>{const th=a*TAU,r=palGeoEdge(th)-1+t*w,x=P.cx+r*Math.cos(th),z=P.cz+r*Math.sin(th),c=FR.UV(x,z);return c[0]>P.cutU-2&&Math.abs(c[1])<P.cutHalf+1.5;}});
   const em=new THREE.Mesh(esc,MAT.izEsc);em.name='palace hill escarpment';scene.add(em);
   // the cutting's two rock walls, stepped down the slope; its floor is the city's level (the page's ground)
   for(let u=P.cutU-2;u<P.r1+4;u+=2){const hh=Math.max(0,palGeoH(...FR.P(u,P.cutHalf+3)));if(hh<.2)continue;
    for(const s of[-1,1]){const p=FR.P(u+1,s*(P.cutHalf+1.4));kput('izRockB',[p[0],hh/2-.2,p[1]],Q,[2.8,hh+.4,2.2],vC(0xa08870));}}
   // the ramp road out of the cutting, onto the plain
   {const p=FR.P(P.cutU+22,0);kput('boxC',[p[0],.04,p[1]],Q,[2*P.cutHalf-1,.12,44],IZ_CONC_TINT);}}
  /* ---------------------------------------------------------------- the Mech Gate's facade (u = cutU, the rear face) */
  {const U=P.cutU,hh=palGeoH(...FR.P(U+.5,0))+2,y=-top,GW=18,GH=11.4;   // y: the city's level, from the mesa top
   const pc=(P.cutHalf+.6+GW/2)/2,pw=P.cutHalf+.6-GW/2;B('boxC',U+.8,-pc,y,1.6,pw,hh+2,IZ_CONC_TINT);B('boxC',U+.8,pc,y,1.6,pw,hh+2,IZ_CONC_TINT);
   B('boxC',U+.8,0,y+GH,1.6,2*P.cutHalf+1,hh-GH+2,IZ_CONC_TINT);
   B('palAncB',U+2,0,y+GH,1.2,GW+4,1.6,vC(0xf0f0ec));for(let k=0;k<3;k++)B('palGlowB',U+2.65,0,y+GH+.35+k*.45,.05,GW+3,.08,CYAN);
   // the blast doors: two leaves rolled half back into the walls, orange and black chevrons at their meeting edges
   for(const s of[-1,1]){B('palAncB',U-.4,s*(GW/2-2.6),y,1.1,5.2,GH-.2,vC(0xe8e6e0));for(let k=0;k<5;k++)B('vClothB',U-.95,s*(GW/2-.9),y+1+k*2,.06,1.2,1,vC(k%2?0x1c1a18:0xe07a2a));
    B('palAncB',U+1.8,s*(GW/2+1.4),y,2.2,1.6,GH+3.4,vC(0xf0f0ec));B('palGlowB',U+2.95,s*(GW/2+1.4),y+1,.06,.12,GH+1,CYAN);
    const lp=FR.P(U+8,s*(P.cutHalf-1.6));vnLampPost(lp[0],0,lp[1],7);}
   REG.push({name:'The Mech Gate (blast doors)',x:FR.P(U,0)[0],y:0,z:FR.P(U,0)[1],r:12,h:hh,cls:'building',key:'iziz_palace_mech_gate',tags:{culture:'ancients',type:['military'],wealth:'civic',lit:true,role:'mech gate'}});}
  /* ---------------------------------------------------------------- the precinct as the city builds it */
  TSTAT.cur='trans_palace/0';
  const mark={};for(const k in KIT.items)mark[k]=KIT.items[k].length;
  TRANS.place(scene,'palace','orig',P.cx-20*gx,P.cz-20*gz,Math.atan2(gx,gz),1,SEED_CITY_PAL,{role:'palace',wealth:'civic'},top);
  REG.push({name:'Palace — grand entrance',x:P.cx+25*gx,y:top,z:P.cz+25*gz,r:13,h:17,cls:'building',key:'iziz_palace_entrance',tags:{culture:'iziz-old',type:['civic'],wealth:'civic',lit:true,role:'palace entrance',place:'outdoor'}});
  TSTAT.cur='iziz_curtain/0';izCurtainWall(scene,t=>84,P.cx,P.cz,72,14,[g],9,null);
  TSTAT.cur='iziz_barracks/0';for(const[k,a]of[[1,g+1.32],[2,g-1.32]])izBarracks(P.cx+64*Math.cos(a),P.cz+64*Math.sin(a),a,k);
  TSTAT.cur='iziz_statue/0';izStatue(P.cx+46*gx,P.cz+46*gz,14,2,g+Math.PI,top-.3);
  // the triumphal plaza (I0 #2): marble paving from the gate to the steps, the axis in a darker band; lamp columns and
  // banner poles in pairs (#44), the axis lit
  TSTAT.cur='pal_plaza/0';
  B('palFloorM',-58,0,.0,44,60,.06,vC(0xe8dcc4));B('palFloorM',-58,0,.02,44,8,.06,vC(0xc89a62));B('palFloorM',-84,0,.0,12,12,.06,vC(0xc89a62));
  for(const u of[-74,-66,-50,-42])for(const s of[-1,1]){const p=FR.P(u,s*27);vnLampPost(p[0],top,p[1],6.5);}
  for(const u of[-78,-70,-62,-54,-46,-38])for(const s of[-1,1]){const p=FR.P(u,s*30.5);vnBannerPole(p[0],top,p[1],FR.ry+(s<0?Math.PI:0),11,vC(u%16?0xe07a2a:0xc9442a));}
  for(const u of[-79,-71,-63,-55,-47,-39])for(const s of[-1,1]){const p=FR.P(u,s*5.5);vnLampPost(p[0],top,p[1],4.2);}
  /* ---------------------------------------------------------------- the blueprint laid and drawn */
  TSTAT.cur='pal_interior/0';
  const L=IZPAL.layout();IZPAL_SITE.L=L;IZPAL_SITE.FR=FR;
  IZPAL_SITE.stats=IZPALDRAW.draw(L,FR,{mark});
  /* ---------------------------------------------------------------- the precinct buildings' outsides */
  TSTAT.cur='pal_precinct/0';
  const orange=vC(0xe2a068),cream=vC(0xf0d8b0),cap=vC(0xe6c08a);
  L.buildings.forEach(Bd=>{if(!Bd.rect)return;const q=Bd.rect,n=Bd.storeys.length,sh=Bd.storeys[0].h,H=n*sh,cu=(q.u0+q.u1)/2,cv=(q.v0+q.v1)/2,du=q.u1-q.u0,dv=q.v1-q.v0,t=.45;
   // the outer doors on the ground storey (gaps in the wall, and their portals)
   const doors=[];Bd.storeys[0].outer.forEach(w=>w.doors.forEach(d=>doors.push({dir:w.dir,line:w.line,t0:d.t0,t1:d.t1,h:d.h})));
   B('izBoxS',cu,cv,-.6,du+1.2,dv+1.2,.6,cap);   // the plinth
   const side=(dir,line,t0,t1,out)=>{const gs=doors.filter(d=>d.dir===dir&&Math.abs(d.line-line)<1).sort((a,b)=>a.t0-b.t0);let a=t0;const segs=[];
    gs.forEach(d=>{segs.push([a,d.t0]);const L2=d.t1-d.t0,m=(d.t0+d.t1)/2;
     // the lintel over the door, a canopy and its posts, steps
     if(dir==='u'){B('izBoxW',line+out*t/2,m,d.h,t,L2,H-d.h,orange);B('izBoxCap',line+out*1.4,m,d.h+.5,2.6,L2+2.4,.35,cap);B('izBoxS',line+out*1.2,m,-.6,2.2,L2+1.6,.6,cap);}
     else{B('izBoxW',m,line+out*t/2,d.h,L2,t,H-d.h,orange);B('izBoxCap',m,line+out*1.4,d.h+.5,L2+2.4,2.6,.35,cap);B('izBoxS',m,line+out*1.2,-.6,L2+1.6,2.2,.6,cap);}
     a=d.t1;});segs.push([a,t1]);
    for(const[s0,s1]of segs){if(s1-s0<.05)continue;const m=(s0+s1)/2,L2=s1-s0;if(dir==='u')B('izBoxW',line+out*t/2,m,0,t,L2,H,orange);else B('izBoxW',m,line+out*t/2,0,L2,t,H,orange);}
    // a cream band at each floor line and the cornice; deco fins and lit windows on every storey but where a door is
    for(let k=1;k<=n;k++){const yy=k*sh-.35;if(dir==='u')B('izBoxCap',line+out*(t+.08),(t0+t1)/2,yy,.25,t1-t0+.5,.35,k===n?cap:cream);else B('izBoxCap',(t0+t1)/2,line+out*(t+.08),yy,t1-t0+.5,.25,.35,k===n?cap:cream);}
    const nw=Math.max(1,Math.floor((t1-t0)/4.4));
    for(let k=0;k<n;k++)for(let i=0;i<nw;i++){const tt=t0+(t1-t0)*(i+.5)/nw;if(k===0&&doors.some(d=>d.dir===dir&&Math.abs(d.line-line)<1&&tt>d.t0-1.6&&tt<d.t1+1.6))continue;
     const yy=k*sh+1.3,wh=Math.min(2.4,sh-1.9);
     if(dir==='u'){B('vDarkB',line+out*(t+.02),tt,yy,.3,1.8,wh+.3);B('vWinLit',line+out*(t+.1),tt,yy+.15,.2,1.4,wh);B('palPaneB',line-out*.26,tt,yy+.15,.04,1.4,wh);B('palMarbleB',line-out*.3,tt,yy+.02,.18,1.7,.1,vC(0xf2ece2));
      if(i<nw-1)B('finW',line+out*(t+.12),t0+(t1-t0)*(i+1)/nw,.4,.3,.5,H-1.2);}
     else{B('vDarkB',tt,line+out*(t+.02),yy,1.8,.3,wh+.3);B('vWinLit',tt,line+out*(t+.1),yy+.15,1.4,.2,wh);B('palPaneB',tt,line-out*.26,yy+.15,1.4,.04,wh);B('palMarbleB',tt,line-out*.3,yy+.02,1.7,.18,.1,vC(0xf2ece2));
      if(i<nw-1)B('finW',t0+(t1-t0)*(i+1)/nw,line+out*(t+.12),.4,.5,.3,H-1.2);}}};
   side('u',q.u0,q.v0,q.v1,-1);side('u',q.u1,q.v0,q.v1,1);side('v',q.v0,q.u0,q.u1,-1);side('v',q.v1,q.u0,q.u1,1);
   // the roof: a slab, a parapet, and the crown (a stepped attic and a verdigris pyramid on the two great houses; a hip on the services)
   B('izBoxCap',cu,cv,H,du+.6,dv+.6,.5,cap);
   if(n>1){B('izBoxW',cu,cv,H+.5,du-3,dv-3,2.2,orange);B('izBoxCap',cu,cv,H+2.7,du-2.4,dv-2.4,.4,cap);B('izBoxW',cu,cv,H+3.1,du-7,dv-7,1.6,orange);
    const p=FR.P(cu,cv);kput('vPyrCu',[p[0],top+H+4.7,p[1]],Q,[dv-6,Math.min(du,dv)*.45,du-6],vC(0x5a9a88));
    for(const a of[-1,1])for(const b of[-1,1]){const c=FR.P(cu+a*(du/2-.6),cv+b*(dv/2-.6));vnBannerPole(c[0],top+H+.5,c[1],FR.ry,6,vC(Bd.id==='praetorium'?0xc9442a:0x2f8f8a));}}
   else{const p=FR.P(cu,cv);kput('vHipCu',[p[0],top+H+.5,p[1]],Q,[dv+1.4,3.4,du+1.4],vC(0x5a9a88));}
   const c=FR.P(cu,cv);REG.push({name:Bd.name,x:c[0],y:top,z:c[1],r:Math.hypot(du,dv)/2,h:H+6,cls:'building',key:'iziz_palace_'+Bd.id,tags:{culture:'iziz-old',type:['civic'],wealth:'civic',lit:true,role:Bd.name}});});
  IZPAL_SITE.ms=Math.round(performance.now()-t0);TSTAT.cur=null;}});
const SEED_CITY_PAL=4211;
