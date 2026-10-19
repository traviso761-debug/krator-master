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
   for(const s of[-1,1]){B('palAncB',U-.4,s*(GW/2-2.65),y,1.1,5.1,GH-.2,vC(0xe8e6e0));for(let k=0;k<5;k++)B('vClothB',U-.95,s*(GW/2-.9),y+1+k*2,.06,1.2,1,vC(k%2?0x1c1a18:0xe07a2a));
    B('palAncB',U+1.8,s*(GW/2+1.4),y,2.2,1.6,GH+3.4,vC(0xf0f0ec));B('palGlowB',U+2.95,s*(GW/2+1.4),y+1,.06,.12,GH+1,CYAN);
    const lp=FR.P(U+8,s*(P.cutHalf-1.6));vnLampPost(lp[0],0,lp[1],7);}
   REG.push({name:'The Mech Gate (blast doors)',x:FR.P(U,0)[0],y:0,z:FR.P(U,0)[1],r:12,h:hh,cls:'building',key:'iziz_palace_mech_gate',tags:{culture:'ancients',type:['military'],wealth:'civic',lit:true,role:'mech gate'}});}
  /* ---------------------------------------------------------------- the precinct as the city builds it */
  TSTAT.cur='trans_palace/0';
  const mark={};for(const k in KIT.items)mark[k]=KIT.items[k].length;
  TRANS.place(scene,'palace','orig',P.cx-20*gx,P.cz-20*gz,Math.atan2(gx,gz),1,SEED_CITY_PAL,{role:'palace',wealth:'civic'},top);
  // the builder's three belvederes (solid boxes with windows and no use; the east one stood on the flank stair and in the
  // Domus's face): out, by position; the terrace pavilions take their places (78q PREC: the Orangery, the Summer
  // Triclinium, moved to the front of the base tier's roof, the Belvedere of the Stars)
  {const boxes=[[16,-38,14],[16,38,14],[16,-4,50]];let n=0;
   for(const name in KIT.items){const it=KIT.items[name],m0=mark[name]||0;
    KIT.items[name]=it.filter((o,i)=>{if(i<m0)return true;const w=FR.UV(o.p[0],o.p[2]),y=o.p[1]-top;
     if(!boxes.some(b=>Math.abs(w[0]-b[0])<4.7&&Math.abs(w[1]-b[1])<5.4&&y>b[2]-.2&&y<b[2]+15))return true;
     if(name==='boxW'&&Array.isArray(o.s)&&Math.abs(o.s[0]-3.2)<.01&&Math.abs(o.s[1]-1.75)<.01)return true;   // the flank stair's steps stay
     n++;return false;});}
   IZPAL_SITE.belvedereParts=n;}
  REG.push({name:'Palace — grand entrance',x:P.cx+25*gx,y:top,z:P.cz+25*gz,r:13,h:17,cls:'building',key:'iziz_palace_entrance',tags:{culture:'iziz-old',type:['civic'],wealth:'civic',lit:true,role:'palace entrance',place:'outdoor'}});
  TSTAT.cur='iziz_curtain/0';izCurtainWall(scene,t=>84,P.cx,P.cz,72,14,[g],9,null);
  TSTAT.cur='iziz_statue/0';izStatue(P.cx+46*gx,P.cz+46*gz,14,2,g+Math.PI,top-.3);
  // the triumphal plaza (I0 #2): marble paving from the gate to the steps, the axis in a darker band; lamp columns and
  // banner poles in pairs (#44), the axis lit
  TSTAT.cur='pal_plaza/0';
  B('palFloorM',-58,0,-.04,44,60,.1,vC(0xe8dcc4));B('palFloorM',-58,0,-.04,44,8,.13,vC(0xc89a62));B('palFloorM',-84,0,-.04,12,12,.115,vC(0xc89a62));
  for(const u of[-74,-66,-50,-42])for(const s of[-1,1]){const p=FR.P(u,s*27);vnLampPost(p[0],top,p[1],6.5);}
  for(const u of[-78,-70,-62,-54,-46,-38])for(const s of[-1,1]){const p=FR.P(u,s*30.5);vnBannerPole(p[0],top,p[1],FR.ry+(s<0?Math.PI:0),11,vC(u%16?0xe07a2a:0xc9442a));}
  for(const u of[-79,-71,-63,-55,-47,-39])for(const s of[-1,1]){const p=FR.P(u,s*5.5);vnLampPost(p[0],top,p[1],4.2);}
  /* ---------------------------------------------------------------- the blueprint laid and drawn */
  TSTAT.cur='pal_interior/0';
  const L=IZPAL.layout();IZPAL_SITE.L=L;IZPAL_SITE.FR=FR;
  IZPAL_SITE.stats=IZPALDRAW.draw(L,FR,{mark});
  /* ---------------------------------------------------------------- the roof gardens */
  // Raised beds on the three terraces (marble kerbs 0.6 high round a bed of earth), clear of the builder's hedges, lamps,
  // pavilions and flank stairs, of the pavilions here and of every edge by 3 m at least, so no crown hangs out over the
  // drop; 95p plants them with the empire's exotic flora (palms, heliconias, tree ferns, dragon trees, oleanders, agaves,
  // succulents: the catalog's plants). Each bed: its rect in the frame, the roof's height, its planting.
  TSTAT.cur='pal_gardens/0';
  IZPAL_SITE.gardens=[
   // the base tier's roof (h 14): the west strip, the east strip, the front strip either side of the axis, the rear strip
   {u0:-13,u1:-3,v0:-41,v1:-35,y:14,plant:'palms'},{u0:-1,u1:9,v0:-41,v1:-35,y:14,plant:'flowers'},
   {u0:21,u1:25.5,v0:-41.5,v1:-34.5,y:14,plant:'succulents'},
   {u0:-2,u1:9,v0:39.5,v1:42.5,y:14,plant:'flowers'},{u0:21,u1:44,v0:39.5,v1:42.5,y:14,plant:'flowers'},
   {u0:-15,u1:-8,v0:-26,v1:-13,y:14,plant:'palms'},{u0:-15,u1:-8,v0:11,v1:24,y:14,plant:'ferns'},
   {u0:54,u1:57.5,v0:-26,v1:-6,y:14,plant:'succulents'},{u0:54,u1:57.5,v0:4,v1:28,y:14,plant:'ferns'},
   // the second tier's roof (h 28): the west strip beside the flank and the rear mass, the narrow east strip
   {u0:10,u1:20,v0:-25,v1:-17.5,y:28,plant:'palms'},{u0:23,u1:33,v0:-25,v1:-17.5,y:28,plant:'ferns'},{u0:36,u1:47,v0:-25,v1:-17.5,y:28,plant:'palms'},
   {u0:10,u1:47,v0:31.8,v1:33.6,y:28,plant:'flowers'},
   // the tops (h 50): the rear mass beside the tower, the east flank, the west flank's narrow top
   {u0:25,u1:33,v0:-11,v1:3,y:50,plant:'palms'},{u0:41.5,u1:45.5,v0:8,v1:26,y:50,plant:'succulents'},{u0:10.5,u1:19,v0:11.5,v1:27.5,y:50,plant:'ferns'},
   {u0:10.5,u1:20,v0:-14,v1:-11.2,y:50,plant:'flowers'},
   // the Orangery's beds, down its two long sides (its door at one end, its fountain at the other: 95p)
   {u0:13.4,u1:17.4,v0:-41.65,v1:-40.25,y:14.15,plant:'ferns',name:'Orangery bed'},{u0:13.4,u1:17.4,v0:-35.75,v1:-34.35,y:14.15,plant:'flowers',name:'Orangery bed'}];
  IZPAL_SITE.gardens.forEach((g,i)=>{g.id='garden'+i;const du=g.u1-g.u0,dv=g.v1-g.v0,cu=(g.u0+g.u1)/2,cv=(g.v0+g.v1)/2,k=.25;
   B('palMarbleB',g.u0+k/2,cv,g.y,k,dv,.6,vC(0xf2ece2));B('palMarbleB',g.u1-k/2,cv,g.y,k,dv,.6,vC(0xf2ece2));
   B('palMarbleB',cu,g.v0+k/2,g.y,du-2*k,k,.6,vC(0xf2ece2));B('palMarbleB',cu,g.v1-k/2,g.y,du-2*k,k,.6,vC(0xf2ece2));
   B('palGoldB',cu,g.v0+k/2,g.y+.6,du,k+.04,.04,null);B('palGoldB',cu,g.v1-k/2,g.y+.6,du,k+.04,.04,null);
   B('izBoxS',cu,cv,g.y,du-2*k,dv-2*k,.5,vC(0x5a3e28));g.top=g.y+.5;
   REG.push({name:g.name||'Roof garden',x:FR.P(cu,cv)[0],y:top+g.y,z:FR.P(cu,cv)[1],r:Math.hypot(du,dv)/2,h:6,cls:'farm',key:'iziz_palace_'+g.id,
    tags:{culture:'iziz-old',type:['park'],wealth:'civic',role:'roof garden',place:'outdoor'}});});
  /* ---------------------------------------------------------------- the precinct buildings' outsides */
  // Each by its look: the two great houses orange ashlar with cream bands, deco fins and a stepped attic under a verdigris
  // pyramid; the services one storey under a verdigris hip; the barracks the city's block (white panel bands, a roof upstand,
  // cyan light strips); the terrace pavilions the palace's sandstone under a pyramid with a banner. The outer wall fills
  // the PWALL between the rect and the rooms' envelope (the liners' skins stand inside it), on a plinth ring under it; an
  // outer door is an opening through it with a stepped sill, a canopy, or a covered way to the palace's side door.
  TSTAT.cur='pal_precinct/0';
  const LOOK={
   ministry:{wall:'izBoxW',wc:vC(0xe2a068),band:'izBoxCap',bc:vC(0xf0d8b0),cap:'izBoxCap',cc:vC(0xe6c08a),fins:true,crown:'attic'},
   service:{wall:'izBoxW',wc:vC(0xe2a068),band:'izBoxCap',bc:vC(0xf0d8b0),cap:'izBoxCap',cc:vC(0xe6c08a),crown:'hip'},
   barracks:{wall:'izBoxS',wc:null,band:'izBoxW',bc:null,cap:'izBoxCap',cc:null,crown:'flat'},
   pavilion:{wall:'boxW',wc:tC(0xd4a05a),band:'boxW',bc:tC(0xe6bd7e),cap:'boxW',cc:tC(0xe6bd7e),crown:'pyr',tall:true}};
  const PW=IZPAL.PWALL;
  L.buildings.forEach(Bd=>{if(!Bd.rect)return;const q=Bd.rect,K=LOOK[Bd.look]||LOOK.ministry,n=Bd.storeys.length,sh=Bd.storeys[0].h,y0=Bd.y0||0,H=n*sh,
    cu=(q.u0+q.u1)/2,cv=(q.v0+q.v1)/2,du=q.u1-q.u0,dv=q.v1-q.v0,yb=y0-.75;
   const doors=[];Bd.storeys[0].outer.forEach(w=>w.doors.forEach(d=>doors.push({dir:w.dir,line:w.line,t0:d.t0,t1:d.t1,h:d.h,link:d.link})));
   // the plinth ring: from 0.6 outside the rect to the wall's middle (the floor's cells reach under the wall), its top at the floor
   for(const[a0,a1,b0,b1]of[[q.u0-.6,q.u0+.3,q.v0-.6,q.v1+.6],[q.u1-.3,q.u1+.6,q.v0-.6,q.v1+.6],[q.u0+.3,q.u1-.3,q.v0-.6,q.v0+.3],[q.u0+.3,q.u1-.3,q.v1-.3,q.v1+.6]])
    B('izBoxCap',(a0+a1)/2,(b0+b1)/2,yb,a1-a0,b1-b0,y0-yb,vC(0xe6c08a));
   // a side: line (the rect's edge), the stretch t0..t1 the wall runs (the 'v' sides between the 'u' sides' ends), out
   const side=(dir,line,t0,t1,out,f0,f1)=>{const env=line-out*PW,gs=doors.filter(d=>d.dir===dir&&Math.abs(d.line-env)<.01).sort((a,b)=>a.t0-b.t0);
    const Wl=(m,len,y,h,item,c,off,th)=>{if(dir==='u')B(item,line+off,m,y,th,len,h,c);else B(item,m,line+off,y,len,th,h,c);};
    let a=t0;const segs=[];
    gs.forEach(d=>{segs.push([a,d.t0]);const L2=d.t1-d.t0,m=(d.t0+d.t1)/2;
     Wl(m,L2,y0+d.h,H-d.h,K.wall,K.wc,-out*PW/2,PW);                                         // the wall over the opening
     Wl(m,L2+1.6,yb,y0-.07-yb,'izBoxS',vC(0xe6c08a),out*1.1,2.2);                              // the step, under the floor's level
     if(d.link){// a covered way to the palace's side door: a slab on gilt-edged beams, 2.9 m out
      Wl(m,L2+2.4,y0+d.h+.35,.35,'izBoxCap',vC(0xe6c08a),out*1.45,2.9);for(const sd of[-1,1])Wl(m+sd*(L2/2+1.1),.2,y0+d.h+.2,.2,'palGoldB',null,out*1.45,2.9);}
     else Wl(m,L2+2.4,y0+d.h+.5,.35,K.cap,K.cc,out*1.4,2.6);                                   // a canopy
     a=d.t1;});segs.push([a,t1]);
    for(const[s0,s1]of segs)if(s1-s0>.05)Wl((s0+s1)/2,s1-s0,y0,H,K.wall,K.wc,-out*PW/2,PW);
    // a band at each floor line (the top one under the roof's cap), fins, lit windows on every storey but by a door
    for(let k=1;k<=n;k++)Wl((f0+f1)/2,f1-f0+.5,y0+k*sh-(k===n?.42:.35),.35,K.band,k===n?K.cc:K.bc,out*.08,.25);
    const nw=Math.max(1,Math.floor((t1-t0)/(K.tall?2.6:4.4)));
    for(let k=0;k<n;k++)for(let i=0;i<nw;i++){const tt=t0+(t1-t0)*(i+.5)/nw;if(k===0&&gs.some(d=>tt>d.t0-1.6&&tt<d.t1+1.6))continue;
     const wh=K.tall?sh-3:Math.min(2.4,sh-1.9),yy=y0+k*sh+(K.tall?1.2:1.3);
     Wl(tt,1.8,yy,wh+.3,'vDarkB',null,out*.02,.3);Wl(tt,1.4,yy+.15,wh,'vWinLit',null,out*.1,.2);
     Wl(tt,1.4,yy+.15,wh,'palPaneB',null,-out*(PW+.2),.04);Wl(tt,1.7,yy+.02,.1,'palMarbleB',vC(0xf2ece2),-out*(PW+.25),.18);
     if(K.fins&&i<nw-1)Wl(t0+(t1-t0)*(i+1)/nw,.5,y0+.4,H-1.2,'finW',null,out*.12,.3);}};
   side('u',q.u0,q.v0,q.v1,-1,q.v0,q.v1);side('u',q.u1,q.v0,q.v1,1,q.v0,q.v1);
   side('v',q.v0,q.u0+PW,q.u1-PW,-1,q.u0,q.u1);side('v',q.v1,q.u0+PW,q.u1-PW,1,q.u0,q.u1);
   // the roof: a slab, then the crown
   B(K.cap,cu,cv,y0+H,du+.6,dv+.6,.5,K.cc);const p=FR.P(cu,cv);
   if(K.crown==='attic'&&n>1){B('izBoxW',cu,cv,y0+H+.5,du-3,dv-3,2.2,K.wc);B('izBoxCap',cu,cv,y0+H+2.7,du-2.4,dv-2.4,.4,K.cc);B('izBoxW',cu,cv,y0+H+3.1,du-7,dv-7,1.6,K.wc);
    kput('vPyrCu',[p[0],top+y0+H+4.7,p[1]],Q,[dv-6,Math.min(du,dv)*.45,du-6],vC(0x5a9a88));
    for(const a of[-1,1])for(const b of[-1,1]){const c=FR.P(cu+a*(du/2-.6),cv+b*(dv/2-.6));vnBannerPole(c[0],top+y0+H+.5,c[1],FR.ry,6,vC(Bd.id==='praetorium'?0xc9442a:0x2f8f8a));}}
   else if(K.crown==='hip')kput('vHipCu',[p[0],top+y0+H+.52,p[1]],Q,[dv+1.4,3.4,du+1.4],vC(0x5a9a88));
   else if(K.crown==='flat'){B('izBoxS',cu,cv,y0+H+.5,du-2,dv-2,.9,null);
    for(const s2 of[-1,1]){const c=FR.P(cu,cv+s2*(dv/2+.32));kput('strip',[c[0],top+y0+H+.25,c[1]],Q,[1,.5,du-4],CYAN);}}
   else if(K.crown==='pyr'){B('boxW',cu,cv,y0+H+.5,du-.2,dv-.2,.4,tC(0xd4a05a,.9));kput('frusPyr',[p[0],top+y0+H+.9,p[1]],Q,[dv-.4,5,du-.4],tC(0xe6bd7e));
    const c=FR.P(cu+du/2-.8,cv+dv/2-.8);vnBannerPole(c[0],top+y0+H+.9,c[1],FR.ry,5,vC(Bd.id==='orangery'?0x2f8f8a:0xe07a2a));}
   REG.push({name:Bd.name,x:p[0],y:top+y0,z:p[1],r:Math.hypot(du,dv)/2,h:H+6,cls:'building',key:'iziz_palace_'+Bd.id,
    tags:{culture:'iziz-old',type:Bd.look==='barracks'?['military']:['civic'],wealth:'civic',lit:true,role:Bd.name}});});
  IZPAL_SITE.ms=Math.round(performance.now()-t0);TSTAT.cur=null;}});
const SEED_CITY_PAL=4211;
