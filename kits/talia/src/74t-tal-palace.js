// ================================================================= 74t. TALIA: the governor's palace (PLAN.md section 5)
// The Izani governor's palace, massed on the owner's govpalace picture and laid out on its blueprint (kits/talia/palace:
// BLUEPRINT.md, floors/*.png; the programme is settlements/iziz/VASSAL-KITS.md section 3), built in Talia's style: a
// white marble terrace on a moulded base, the imperial front stair with lions on its newels, the hall block's two
// storeys of white arcades (Corinthian columns below, a slimmer Ionic arcade behind a balustrade above), a flat roof
// behind a balustrade; the great drum of lit arched windows between pilasters under an orange-tiled ribbed dome with
// gilt ribs, a white lantern with an orange cupola and a gilt finial; seven chhatri pavilions (arcaded drums on 8 to 12
// columns under melon domes, the two rear residence pavilions jali-screened above); the straight outside stair on the
// chancery flank landing under a small pediment; the walled forecourt with its gate. Civic: lit and gilt.
//
// The blueprint's frame (as Pylon's palace, kits/pylon/src/74p-pyl-palace.js): u along the axis from the forecourt gate
// (u = -36) to the rear wall (u = 38), v across, v > 0 on the left walking in. The building's local frame: +z is the
// front (the gate), so x = -v and z = 1 - u. Every position below is written in (u, v) and passed through TPP.
// Heights: the terrace 1.2 m, the ground storey 5.5 m (to 6.7), the upper 4.5 m (to 11.2); the drum to about 17, the
// dome to 24, the lantern to 27. The guard's barracks stand outside the grounds (the owner's fork): not in this def.
// Interiors (2026-11-09): the hall block is a hollow body; its rooms are the interior set's explicit rooms on the blueprint
// (kits/interiors/sets/talia.js), and talpInterior draws the item's plan inside it; the pavilions are hollow drums with their
// rooms (talpPavilion with o.P). Without the item the palace is the solid exterior. Seeds 9691-9699.
const TPP=(u,v)=>[-v,1-u];
// ---------------------------------------------------------------- THE LION AND THE PAVILIONS
// a couchant lion on a newel, facing out along ry: a marble body, haunch, mane and head (refs talia (2): the stair's lions)
function talpLion(x,y,z,ry,s,c){const b=loc(x,z,0,-.12*s,ry),m=loc(x,z,0,.3*s,ry),h=loc(x,z,0,.46*s,ry),p=loc(x,z,0,.52*s,ry);
 vB('taMarble',b[0],y,b[1],.42*s,.36*s,.95*s,ry,c);kput('taBallM',[b[0],y+.34*s,b[1]],null,[.24*s,.2*s,.3*s],c);
 kput('taBallM',[m[0],y+.52*s,m[1]],null,[.28*s,.3*s,.24*s],c);kput('taBallM',[h[0],y+.62*s,h[1]],null,[.17*s,.18*s,.17*s],c);
 vB('taMarble',p[0],y,p[1],.36*s,.12*s,.3*s,ry,c);}
// a chhatri pavilion of radius R at blueprint (u, v): a round core with arched windows, a ring of n columns round it on
// each storey with a solid entablature ring and an orange band, a chhajja eave, a neck and a melon dome with gilt ribs.
// o = {n: columns (10), storeys (2), lit: true, jali: the upper storey screened (the residence), dome: 'tile' | 'cu',
// order: the lower order ('corinthian'), lantern: a small lantern on the dome (else a gilt finial), orb: the shrine's
// gilt orb on the finial, P: the interior plan's pavilion (kits/interiors/sets/talia.js) when the palace has its rooms,
// box: the hall block's box}. With P the core is a ring wall (talpRing) on each storey that has a room, open at its windows
// and at the arch P.arch names as its terrace door (its leaves on core/door), the chhajja a disc less the block's corner
// (talpDisc: the storey's ceiling and the next one's floor); a column or a window inside the block is left out (the block's
// wall is the drum's there; the sheets drew the pavilions as squares). Returns the dome's top y
function talpPavilion(u,v,R,o,C){const [x,z]=TPP(u,v),T=1.2,SH=[5.5,4.5],ns=(o.storeys==null?2:o.storeys),n=(o.n==null?10:o.n),rc=R-1.25,rcol=R-.4;
 const P=o.P||null,box=P?o.box:null,inB=(px,pz)=>!!box&&talpIn(box,px,pz),t=P?P.t:.35;
 const Htop=T+SH.slice(0,ns).reduce((a,b)=>a+b,0);if(!P)vPst('taDrum',x,T,z,rc,Htop-T,C.wh);
 let y=T;for(let s=0;s<ns;s++){const h=SH[s],ch=h-.8,cr=s?Math.max(.17,R*.032):Math.max(.2,R*.042),room=P&&P.st[s],gaps=[];
  for(let k=0;k<n;k++){const a=k/n*TAU,px=x+Math.sin(a)*rcol,pz=z+Math.cos(a)*rcol;if(!inB(px,pz))tanColumn(px,y,pz,ch,cr,s?'ionic':(o.order||'corinthian'),C.mb,C.gi);}
  const ww=Math.min(1.5,TAU*rc/n*.5);
  for(let k=0;k<n;k++){const a=(k+.5)/n*TAU,px=x+Math.sin(a)*rc,pz=z+Math.cos(a)*rc;if(inB(px,pz))continue;
   const door=room&&P.arch.some(A=>A[0]===s&&A[1]===k);
   if(door){const dh=Math.min(ch-.5,3.2);gaps.push({a,w:ww,y0:0,y1:dh});tanArch(px,y,pz,a,ww,dh,{fill:'D',door:true,gate:true,band:C.or,bw:.12,out:.05});}
   else{if(room)gaps.push({a,w:ww,y0:.4,y1:.4+ch-.9-ww/2});
    tanArch(px,y+.4,pz,a,ww,ch-.9,{fill:o.lit===false?'D':(s?'L':'G'),band:C.or,bw:.12,out:.05,kind:s?'cusp':'round',lobes:3,card:!room});}
   if(s&&o.jali){const L=2*rcol*Math.sin(Math.PI/n)-cr*2.6,q=rcol*Math.cos(Math.PI/n);if(!inB(x+Math.sin(a)*q,z+Math.cos(a)*q))tanJali(x+Math.sin(a)*q,y+.2,z+Math.cos(a)*q,a,L,ch-.5,C.wh,null,true);}}
  if(room)talpRing(x,z,rc-t/2,t,y,h,gaps,'vPlaster',C.wh,box);else if(P)vPst('taDrum',x,y,z,rc,h,C.wh);
  if(P){talpDisc(x,z,R,y+ch,.8,'vPlaster',C.wh,box,P.st[s+1]?{name:P.id+' upper floor',r:rc}:null);talpRing(x,z,R-.05,.16,y+ch+.3,.2,[],'vPlaster',C.or,box);}
  else{vPst('taDrum',x,y+ch,z,R,.8,C.wh);vPst('taDrum',x,y+ch+.3,z,R+.03,.2,C.or);}
  y+=h;}
 vPst('taDrumM',x,Htop,z,R+.55,.14,C.mb);vPst('taDrum',x,Htop+.14,z,R*.62,.7,C.wh);
 const dc=o.dome==='cu'?null:C.tile;
 const top=tanDome(x,Htop+.84,z,R*.66,{kind:'melon',item:o.dome==='cu'?'taDomeCu':'taDome',c:dc,h:R*.72,ribs:12,ribItem:'taRibGi',ribC:C.gi,finial:o.lantern?null:C.gi,fr:Math.max(.12,R*.03)});
 if(o.lantern)return tanLantern(x,top-.08,z,Math.max(.45,R*.13),Math.max(.9,R*.2),C.wh,C.or,C.gi);
 if(o.orb)kput('taGiltBall',[x,top+Math.max(.12,R*.03)*4.2+.5,z],null,[.42,.42,.42],C.gi);
 return top;}

// ---------------------------------------------------------------- THE ROOMS (the interior set's plan: kits/interiors/sets/talia.js)
// The palace's rooms are the interior set's explicit rooms, the blueprint's cells (sheets G and U); the item's `plan` (cells, edges,
// doors through the block's faces, the pavilions) is what this draws, so the walls stand where the rooms end. Only with an interior
// (VERN.interiors and the set's item: the kit sheet; ?interiors=0 and a world without the set draw the solid palace as before).
// the block's box in the building's frame [x0, x1, z0, z1], and a point strictly inside it
function talpBox(PL){return[-PL.BLK[3],-PL.BLK[2],1-PL.BLK[1],1-PL.BLK[0]];}
function talpIn(B,x,z){return x>B[0]+.05&&x<B[1]-.05&&z>B[2]+.05&&z<B[3]-.05;}
// a walk floor (core/walk, under window.TALIA_WALK) over a rectangle of the building's frame at height y
function talpWalk(x0,x1,z0,z1,y,name){if(!tanWalkOn()||!VERN.cur)return;const K=VERN.cur,sc=K.o.scale==null?1:K.o.scale,a=loc(K.x,K.z,x0*sc,z0*sc,K.ry),b=loc(K.x,K.z,x1*sc,z1*sc,K.ry);
 KWALK.floor({rect:[Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[1],b[1])],y:(K.o.y||0)+y*sc,name:K.D.key+' '+name,tag:'floor'});}
// a ring wall round (cx, cz): mid radius rm, t thick, from y up h, open at gaps [{a: yaw, w, y0, y1: the opening's foot and head
// above y}] (a sill and a head piece drawn across each); a piece whose middle stands inside box (the block) is left out
function talpRing(cx,cz,rm,t,y,h,gaps,item,c,box){const G=gaps.map(g=>({a0:g.a-(g.w/2+.04)/rm,a1:g.a+(g.w/2+.04)/rm,g})).sort((p,q)=>p.a0-q.a0);
 const put=(a,L,y0,hh)=>{const px=cx+Math.sin(a)*rm,pz=cz+Math.cos(a)*rm;if(L<.02||hh<.02||(box&&talpIn(box,px,pz)))return;vB(item,px,y0,pz,L,hh,t,a,c);};
 const arc=(a0,a1)=>{const k=Math.max(1,Math.ceil((a1-a0)*rm/1.0)),s=(a1-a0)/k;for(let i=0;i<k;i++)put(a0+(i+.5)*s,2*rm*Math.sin(s/2)+.05,y,h);};
 if(!G.length){arc(0,TAU);return;}
 for(let i=0;i<G.length;i++){const g=G[i],e=i+1<G.length?G[i+1].a0:G[0].a0+TAU;if(e>g.a1)arc(g.a1,e);
  const L=2*rm*Math.sin((g.a1-g.a0)/2);put(g.g.a,L,y,g.g.y0);put(g.g.a,L,y+g.g.y1,h-g.g.y1);}}
// a disc of radius r round (cx, cz), h thick from y, as strips half a metre deep, less the block's box: a pavilion's floor and
// ceiling where the block's corner stands in its drum; walk: {name, r}: the strips' tops within radius r (inside the ring wall,
// not the eave) are walk floors under that name
function talpDisc(cx,cz,r,y,h,item,c,box,walk){const zs=[];for(let q=cz-r;q<cz+r-.05;q+=.5)zs.push(q);zs.push(cz+r);
 if(box)for(const zb of[box[2],box[3]])if(zb>cz-r&&zb<cz+r)zs.push(zb);zs.sort((p,q)=>p-q);
 for(let i=0;i+1<zs.length;i++){const za=zs[i],zb=zs[i+1],dz=Math.max(Math.abs(za-cz),Math.abs(zb-cz));if(zb-za<.02||dz>=r)continue;
  const s=Math.sqrt(r*r-dz*dz),zm=(za+zb)/2;let segs=[[cx-s,cx+s]];
  if(box&&zm>box[2]&&zm<box[3])segs=[[cx-s,Math.min(cx+s,box[0])],[Math.max(cx-s,box[1]),cx+s]];
  for(const [x0,x1] of segs)if(x1-x0>.02){vB(item,(x0+x1)/2,y,zm,x1-x0,h,zb-za,0,c);
   if(walk&&dz<walk.r){const w=Math.sqrt(walk.r*walk.r-dz*dz),a=Math.max(x0,cx-w),b=Math.min(x1,cx+w);if(b-a>.05)talpWalk(a,b,za,zb,y+h,walk.name);}}}}
// a door in a partition: the opening's frame in marble (gilt round the state doors, 1.4 m and wider), the leaves on core/door
// (69e5's IZDOOR.leaf: a pair over 1.4 m, operable: the rooms are on both sides; plain leaves, as the budget allows)
function talpDoor(x,y,z,ry,w,dh,C){const st=w>=1.4,fc=st?C.gi:C.mb;
 IZDOOR.leaf(x,y,z,ry,w-.03,dh-.04,.07,C.wal,{pair:w>1.4});   /* the plain leaf: the sheet's triangle budget */
 for(const s of[-1,1]){const p=loc(x,z,s*(w/2+.07),0,ry);vB('taMarble',p[0],y,p[1],.14,dh+.12,.26,ry,fc);}
 vB('taMarble',x,y+dh,z,w+.28,.14,.26,ry,fc);}
// the partitions, rails and glazed walls between the cells, the upper floor, the two stairs, the doors through the block's faces,
// the dais and the hall's ceiling; the walk floors of the upper storey
function talpInterior(PL,C){const {wh,mb,or,gi}=C,P=TPP,LV=PL.LV,PT=PL.PT,box=talpBox(PL);
 const DH=(lv,w)=>lv?(w>=1.4?3.0:2.4):(w>=1.4?3.4:2.6);
 for(const E of PL.edges){if(E.kind==='open')continue;
  const L=LV[E.lv],y=L.y,h=E.lv?L.h+.03:L.h,alongX=E.axis==='u',ry=alongX?0:Math.PI/2;
  // the run in the building's frame: x (or z) from a to b, its fixed coordinate f; trimmed off the block's faces
  const ends=alongX?[-E.s1,-E.s0]:[1-E.s1,1-E.s0],f=alongX?1-E.c:-E.c,lim=alongX?[box[0],box[1]]:[box[2],box[3]];
  const a=Math.max(ends[0],lim[0]+PL.T-.02),b=Math.min(ends[1],lim[1]-PL.T+.02);if(b-a<.05)continue;
  const at=s=>alongX?[s,f]:[f,s],seg=(s0,s1,y0,hh,item,c)=>{if(s1-s0<.02||hh<.02)return;const m=at((s0+s1)/2);vB(item||'vPlaster',m[0],y0,m[1],s1-s0,hh,PT,ry,c||wh);};
  // a rail: the balustrade over the vestibule's gallery (the hall seen from its door), a marble parapet with an orange band elsewhere
  if(E.kind==='rail'){const m=at((a+b)/2);if(E.a==='galV'||E.b==='galV')tanBalustrade(m[0],y,m[1],ry,b-a,mb,1.0,{ball:gi,gilt:gi});
   else{vB('taMarble',m[0],y,m[1],b-a,1.0,.2,ry,mb);vB('vPlaster',m[0],y+.78,m[1],b-a+.02,.12,.22,ry,or);vB('taMarble',m[0],y+1.0,m[1],b-a+.04,.08,.3,ry,mb);}continue;}
  if(E.kind==='glaze'){const gw=Math.min(b-a-1.2,3.2),m=(a+b)/2,s0=m-gw/2,s1=m+gw/2,sill=1.0,head=E.lv?3.4:4.0;
   seg(a,s0,y,h);seg(s1,b,y,h);seg(s0,s1,y,sill);seg(s0,s1,y+head,h-head);
   const q=at(m);vB('taWinB',q[0],y+sill,q[1],gw,head-sill,.03,ry,null);for(const k of[-1,0,1]){const r=at(m+k*gw/3);vB('vPlaster',r[0],y+sill,r[1],.06,head-sill,.08,ry,wh);}
   continue;}
  // a wall: its doors cut (the openings' positions along it from the plan's u or v), each door's leaves and frame
  const D=E.doors.map(d=>({s:alongX?-d.s:1-d.s,w:d.w})).sort((p,q)=>p.s-q.s);let s=a;
  for(const d of D){const s0=d.s-d.w/2,s1=d.s+d.w/2,dh=DH(E.lv,d.w);seg(s,s0,y,h);seg(s0,s1,y+dh,h-dh);const m=at(d.s);talpDoor(m[0],y,m[1],ry,d.w,dh,C);s=s1;}
  seg(s,b,y,h);}
 // the upper floor: a marble slab under every upper room (the wells, the light courts and the stairwells open), and its walk floor
 // over the cell to the partitions' middles (and to the block's faces, where a door goes on into a pavilion)
 for(const K of PL.cells){if(K[1]!==1||!K[7])continue;const x0=-K[5],x1=-K[4],z0=1-K[3],z1=1-K[2];
  const X0=Math.max(x0,box[0]+PL.T-.02),X1=Math.min(x1,box[1]-PL.T+.02),Z0=Math.max(z0,box[2]+PL.T-.02),Z1=Math.min(z1,box[3]-PL.T+.02);
  vB('taMarble',(X0+X1)/2,LV[1].y-.25,(Z0+Z1)/2,X1-X0,.25,Z1-Z0,0,mb);talpWalk(x0,x1,z0,z1,LV[1].y,'upper floor '+K[0]);}
 // the two stairs (the plan's cells pstG and serv hold them; pstV and bstV are their wells above): orange treads on a marble
 // stringer, a hand rail; vnStairs registers each as a walk strip
 const y0=LV[0].y,rise=LV[1].y-y0,N=17,run=N*.32,tilt=Math.atan2(rise,run);
 {const x=6.85,zc=-19.73;vnStairs(x,y0,zc,Math.PI,1.3,rise,N,'taMarble',or);
  vBq('taMarble',x-.6,y0+rise/2-.2,zc,.14,.34,Math.hypot(run,rise)+.2,qEuler(-tilt,0,0),mb);vBq('taGilt',x-.6,y0+rise/2+.75,zc,.06,.06,Math.hypot(run,rise),qEuler(-tilt,0,0),gi);}
 {const xc=14.73,z=-16.7;vnStairs(xc,y0,z,Math.PI/2,1.1,rise,N,'taMarble',or);
  vBq('taMarble',xc,y0+rise/2-.2,z-.5,Math.hypot(run,rise)+.2,.34,.14,qEuler(0,0,-tilt),mb);vBq('vIron',xc,y0+rise/2+.75,z-.5,Math.hypot(run,rise),.05,.05,qEuler(0,0,-tilt),null);}
 // the doors through the block's faces (the hollow body's wall is cut, the leaves operable) that the builder has not drawn already
 for(const D of PL.ext){if(D[6])continue;const [x,z]=P(D[3],D[4]),lv=D[0],ry=Math.abs(D[3]-PL.BLK[0])<1e-6?0:Math.abs(D[3]-PL.BLK[1])<1e-6?Math.PI:D[4]<0?Math.PI/2:-Math.PI/2;
  tanArch(x,LV[lv].y,z,ry,D[5],lv?3.0:3.2,{fill:'D',door:true,band:or,bw:.12,out:.05});}
 // the audience hall: the dais on the axis, a ring-and-meander floor, an orange coffered ceiling with a gilt rosette over the well
 {const [x,z]=P(14.35,0);vB('taMarble',x,y0,z,6,.45,1.5,0,mb);vB('taGilt',x,y0+.4,z+.76,6.04,.05,.06,0,gi);}   /* the cabinet's door behind it */
 {const [x,z]=P(10,0);tanMosaicRing(x,y0+.01,z,3.2,or,wh);const yc=LV[1].y+LV[1].h-.32;
  vB('vPlaster',x,yc,z,10.8,.08,13.8,0,or);for(const k of[-1,1]){vB('vPlaster',x+k*2.7,yc-.12,z,.24,.12,13.8,0,wh);vB('vPlaster',x,yc-.12,z+k*3.45,10.8,.12,.24,0,wh);}
  kput('taDiscGi',[x,yc-.02,z],qEuler(Math.PI/2,0,0),[1.1,1.1,.06],gi);}}

// ---------------------------------------------------------------- THE PALACE
function buildTalGovernorPalace(G,o){reseed(9691+(o.v|0));const T=1.2,G1=5.5,U1=4.5,R1=T+G1,R2=R1+U1;
 const C={wh:TA_WH(),mb:vC(vPick(TAPAL.marble)),or:TA_OR(),gi:vC(vPick(TAPAL.gilt)),tile:vC(vPick(TAPAL.tile)),st:TA_ST(),wal:TA_WAL()};
 // the rooms (P6, 2026-11-09): with an interior the item's plan (kits/interiors/sets/talia.js) is drawn inside, the pavilions hollow
 const IXI=VERN.cur&&VERN.cur.hollow?VERN.cur.ixItem:null,PL=IXI&&IXI.plan?IXI.plan:null,BOX=PL?talpBox(PL):null,pv=id=>PL?PL.pav.find(q=>q.id===id):null;
 const {wh,mb,or,gi,st,wal}=C,P=TPP,blk=(item,u0,u1,v0,v1,y,h,c)=>{const [x,z]=P((u0+u1)/2,(v0+v1)/2);vB(item,x,y,z,Math.abs(v1-v0),h,Math.abs(u1-u0),0,c);};
 // the four domains (VASSAL-KITS.md 3.2): ceremony, government, the city's door, the residence; and the forecourt
 const at=(u,v)=>P(u,v);
 vnReg('Governor\'s palace — the audience hall (ceremony)',...at(10,0),17,R2+2,{style:'classical',type:['civic'],role:'governor',domain:'ceremony'});
 vnReg('Governor\'s palace — the great dome and the signal lantern',...at(10,0),7.5,28,{style:'byzantine',domain:'ceremony'});
 vnReg('Governor\'s palace — the Chancery and Customs of the East Road (government)',...at(-8,-18),6.5,R2+6,{style:'indic',type:['civic'],domain:'government'});
 vnReg('Governor\'s palace — the Hall of the Talei Council (the city\'s door)',...at(-8,18),6.5,R2+6,{style:'indic',type:['civic'],domain:'city'});
 vnReg('Governor\'s palace — the residence',...at(26,12),9,R2+5,{style:'indic',domain:'residence'});
 vnReg('Governor\'s palace — forecourt',...at(-24,0),14,3,{type:['civic'],domain:'ceremony'});
 // ---- the grounds: white walls with a marble coping and an orange band, the gate's piers under chhatris, the cart gate
 const wall=(u0,u1,v0,v1)=>{blk('vPlaster',u0,u1,v0,v1,0,3.2,wh);blk('vPlaster',u0-.02,u1+.02,v0,v1,2.5,.22,or);
  const lu=Math.abs(u1-u0)>1,eu=lu?.1:.25,ev=lu?.25:.1;blk('taMarble',Math.min(u0,u1)-eu,Math.max(u0,u1)+eu,Math.min(v0,v1)-ev,Math.max(v0,v1)+ev,3.2,.22,mb);};
 for(const s of[-1,1]){wall(-36.4,-35.6,s*5.6,s*30);wall(-36,38,s*29.6,s*30.4);
  const [gx,gz]=P(-36,s*5.5);vB('taMarble',gx,0,gz,1.9,.4,1.9,0,st);vB('vPlaster',gx,.4,gz,1.6,4.6,1.6,0,wh);vB('vPlaster',gx,3.9,gz,1.66,.24,1.66,0,or);
  vB('taMarble',gx,5,gz,1.9,.24,1.9,0,mb);tanKiosk(gx,5.24,gz,.62,1.5,4,wh,{domeC:C.tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.08});
  tanArch(gx,1.2,gz+.8,0,.7,2,{fill:'W',fc:wh,band:or,bw:.08});
  const b=P(-33.5,s*8);vnBannerPole(b[0],0,b[1],0,7,or);}
 wall(37.6,38.4,-30,-20.5);wall(37.6,38.4,-13.5,30);
 for(const s of[-1,1]){const [cx,cz]=P(38,s<0?-20.5:-13.5);vB('vPlaster',cx,0,cz,1.3,3.8,1.3,0,wh);vB('taMarble',cx,3.8,cz,1.5,.2,1.5,0,mb);}
 // the forecourt: the axial walk in stone with a meander border and two mosaic medallions, lamps either side
 blk('vStone',-35.6,-12,-4,4,0,.06,st);{const [x,z]=P(-23.8,0);tanMeander(x,.06,z,8,23.6,0,or);}
 for(const u of[-28,-19]){const [x,z]=P(u,0);tanMosaicRing(x,.06,z,2.2,or,wh);}
 for(const s of[-1,1])for(const u of[-30,-22]){const l=P(u,s*5.2);vnLampPost(l[0],0,l[1],3.6);}
 // ---- the terrace: marble on a moulded base (a stone plinth, the orange band, a white cornice), its front recessed
 // between the large pavilions; the imperial stair with an orange runner and lions on the newels
 const ter=(u0,u1,v0,v1)=>{blk('taMarble',u0,u1,v0,v1,0,T,mb);blk('taMarble',u0-.15,u1+.15,v0-.15*Math.sign(v1-v0||1),v1+.15*Math.sign(v1-v0||1),0,.32,st);
  blk('vPlaster',u0-.02,u1+.02,v0,v1,T-.5,.16,or);blk('taMarble',u0-.12,u1+.12,v0-.12*Math.sign(v1-v0||1),v1+.12*Math.sign(v1-v0||1),T-.04,.12,wh);};
 ter(-8.5,34.6,-25.6,25.6);for(const s of[-1,1])ter(-14.3,-8.5,s*11.7,s*25.6);
 {const [x,z]=P(-8.5,0),w=6.4,reach=tanImperialStair(x,0,z,0,w,T,mb,or,{gilt:gi});
  for(const s of[-1,1]){const p=loc(x,z,s*(w/2+1.1),reach-.4,0);vB('taMarble',p[0],0,p[1],.8,.6,1.3,0,mb);talpLion(p[0],.6,p[1],0,1.1,mb);}}
 // ---- the hall block: two storeys behind the front loggia, a flat roof behind a balustrade (front) and a coped parapet
 vnBody('vPlaster',0,T,-9,36,G1+U1,28,0,wh,PL?{t:.4,floor:'taMarble',floorC:mb}:{t:.4});tanDoor(0,T,5,0,2.4,4.2,'taMarble',mb,wal,false);{const [x,z]=P(10,0);tanString(x,T+G1-.1,z,36,28,0,wh,.12,.2);}
 // the front loggia: a screen at u -8.9 across v -11.7..11.7, Corinthian columns on an arcade of six below with an
 // entablature and a gilt frieze; a balustraded gallery and a slimmer Ionic arcade of ten (lit) above
 blk('vPlaster',-8.9,-8.3,-11.7,11.7,T,G1+U1,wh);blk('vPlaster',-8.3,-4,-11.7,11.7,R1-.3,.3,mb);
 {const [x,z]=P(-8.9,0);
  tanArcade(x,T,z,0,6,2.85,G1-1.1,.9,{fill:'D',band:or,bw:.16,col:'corinthian',cc:mb,capC:gi,colOut:.42});
  vB('taMarble',x,T+G1-1.1,z+.3,23.6,.36,.7,0,mb);vB('vPlaster',x,T+G1-.74,z+.32,23.6,.3,.66,0,gi);vB('taMarble',x,T+G1-.44,z+.3,23.9,.24,.8,0,wh);
  tanBalustrade(x,R1,z+.5,0,23.4,mb,1.0,{ball:gi,gilt:gi});
  tanArcade(x,R1+.1,z,0,10,1.79,U1-1.0,.5,{fill:'L',band:or,bw:.12,col:'ionic',cc:mb,capC:gi,colOut:.25});
  for(const s of[-1,1]){vnLamp(x+s*2.1,4.2,z+.5,0);}}
 // the side faces between the pavilions: arched windows on two storeys between pilasters; the rear face the same
 for(const s of[-1,1]){const [x,z]=P(11,s*18),ry=-s*Math.PI/2;
  // with the rooms the rear range's partition meets each face where its last window was (k 4 on the right, 0 on the left), and
  // the shrine's door takes the left face's middle window
  tanArcade(x,T+.6,z,ry,5,1.9,G1-1.8,1.1,{fill:'G',band:or,bw:.14,sill:wh,skip:PL?(s<0?[4]:[0,2]):null});tanArcade(x,R1+.5,z,ry,5,1.6,U1-1.5,1.4,{fill:'L',band:or,bw:.12,kind:'cusp',lobes:3,skip:PL?(s<0?[4]:[0]):null});
  for(let k=0;k<6;k++){const p=loc(x,z,-7.5+k*3,0,ry);tanPilaster(p[0],T,p[1],ry,.5,G1+U1-.1,wh,gi);}}
 {const [x,z]=P(24,0);tanArcade(x,T+.6,z,Math.PI,7,1.9,G1-1.8,1.2,{fill:'G',band:or,bw:.14,sill:wh,skip:PL?[0]:null});   /* k 0: the servery's door to the kitchen */tanArcade(x,R1+.5,z,Math.PI,7,1.6,U1-1.5,1.5,{fill:'L',band:or,bw:.12,kind:'cusp',lobes:3});}
 // the roof: the entablature with an orange frieze over the block and the loggia; the balustrade on the front, a
 // coped parapet on the sides and the back
 let yR;{const [x,z]=P(10,0);yR=tanEntablature(x,R2,z,36,28,0,wh,or,{dentils:false});}
 {const [x,z]=P(-6.45,0);tanEntablature(x,R2,z,23.4,4.9,0,wh,or,{dentils:false});tanBalustrade(x,yR,P(-8.9,0)[1]+.1,0,23.4,mb,.95,{ball:gi,gilt:gi});
  for(const s of[-1,1])tanBalustrade(-s*11.6,yR,z,s*Math.PI/2,4.9,mb,.95,{});}
 {const [x,z]=P(10,0);tanParapetWall(x,yR,z,36,28,0,wh,.8,mb);}
 // ---- the great dome: a square base, the tall drum of lit arched windows between pilasters, the orange-tiled dome
 // between sixteen gilt ribs, the white lantern (the signal room) with an orange cupola and a gilt finial
 {const [x,z]=P(10,0);vB('vPlaster',x,yR,z,16.4,1.1,16.4,0,wh);vB('vPlaster',x,yR+1.1,z,16.8,.22,16.8,0,or);
  for(const sx of[-1,1])for(const sz of[-1,1])tanKiosk(x+sx*7.6,yR+1.32,z+sz*7.6,.55,1.4,4,wh,{domeC:C.tile,ribC:gi,ribItem:'taRibGi',finial:gi,fr:.07});
  tanDrumDome(x,yR+1.32,z,7,{drumH:4.4,n:16,kind:'hemi',domeC:C.tile,ribs:16,gilt:gi,fill:'L',band:or,round:true,pil:true,pilC:wh,lanternC:or,drumC:wh});}
 // the light courts either side of the drum: dark wells through the roof behind a coped parapet
 for(const s of[-1,1]){const [x,z]=P(5.5,s*11.5);vnPlate(x,yR-.4,z,4.6,.42,4.6,0);for(const k of[-1,0,1]){vB('vIron',x+k*1.5,yR+.02,z,.08,.06,4.6,0,null);vB('vIron',x,yR+.02,z+k*1.5,4.6,.06,.08,0,null);}tanParapetWall(x,yR,z,5,5,0,wh,.6,mb);}
 // ---- the seven pavilions (blueprint: the council and the chancery the large front corners, the dining hall and the
 // family garden room the medium rear corners, the guard and the shrine on the flanks, the round kitchen behind)
 for(const s of[-1,1]){talpPavilion(-8,s*18,6.3,{n:12,lantern:true,P:pv(s<0?'pavCh':'pavCo'),box:BOX},C);talpPavilion(24,s*18,5,{n:10,jali:true,dome:s>0?'cu':'tile',P:pv(s<0?'pavDi':'pavFa'),box:BOX},C);}
 talpPavilion(8,-22,3.6,{n:8,order:'doric',dome:'tile',P:pv('pavGu'),box:BOX},C);
 talpPavilion(8,22,3.6,{n:8,storeys:1,dome:'cu',orb:true,P:pv('pavSh'),box:BOX},C);
 // the round kitchen: a plain drum with small windows under a white dome and its vent lantern (service: no gilt)
 // with the rooms: a ring wall open at its windows and at its door to the terrace (k 0, facing the servery), a ceiling under the dome
 {const [x,z]=P(31,-6),K=pv('kitch');let yt;
  if(!K)yt=tanDrum(x,T,z,3.6,5.5,8,wh,{fill:'D',round:true,ww:.8,wh:1.6});
  else{const gaps=[];for(let k=0;k<8;k++){const a=k*TAU/8,px=x+Math.sin(a)*3.6,pz=z+Math.cos(a)*3.6;
    if(k===0){gaps.push({a,w:.9,y0:0,y1:2.5});tanArch(px,T,pz,a,.9,2.5,{fill:'D',door:true,gate:true,band:wh,bw:.1,out:.04});}
    else{gaps.push({a,w:.8,y0:1.95,y1:3.55-.4});tanArch(px,T+1.95,pz,a,.8,1.6,{fill:'G',bw:.1,out:.04,card:false});}}
   talpRing(x,z,3.6-K.t/2,K.t,T,5.5,gaps,'vPlaster',wh,null);talpDisc(x,z,3.6-K.t/2,T+5.3,.2,'vPlaster',wh,null,null);
   kput('taRing',[x,T+5.5,z],null,[3.66,3.66,1.2],wh);yt=T+5.5;}
  kput('taDomeP',[x,yt,z],null,[3.66,2.4,3.66],wh);tanLantern(x,yt+2.3,z,.6,1.0,wh,wh,null);}
 if(PL)talpInterior(PL,C);
 // ---- the outside stair on the chancery flank: a straight marble flight on a solid stringer with sloping rails,
 // a landing on a pier at the gallery, the gallery door under a small pediment
 {const zc=P(1.35,0)[1],xt=19.5,N=22,run=N*.32,xc=xt+run/2,ang=Math.atan2(R1,run);
  vnStairs(xc,0,zc,Math.PI/2,2.4,R1,N,'taMarble',mb);
  for(let k=0;k<N;k++){const xx=xt+run-(k+.5)*run/N;vB('taMarble',xx,0,zc,run/N+.02,R1*k/N+.02,2.4,0,mb);}
  for(const s of[-1,1])vBq('taMarble',xc,R1/2+.5,zc+s*1.32,Math.hypot(run,R1)+.3,.95,.22,vQ(0,0,-ang),wh);
  vB('taMarble',xt-.75,0,zc,1.5,R1,2.6,0,mb);vB('vPlaster',xt-.75,R1-.3,zc,1.66,.18,2.76,0,or);
  tanBalustrade(xt-.75,R1,zc+1.25,0,1.5,mb,.95,{ball:gi,gilt:gi});tanBalustrade(xt-.75,R1,zc-1.25,Math.PI,1.5,mb,.95,{ball:gi,gilt:gi});
  tanArch(18,R1,zc,Math.PI/2,1.6,3,{fill:'D',band:gi,gilt:true,bw:.14});tanPediment(18,R1+3.3,zc,Math.PI/2,2.8,.9,wh,.12,.5,or,gi);}
 // ---- the service court and the garden behind the residence
 for(let k=0;k<3;k++){const [x,z]=P(33+k*1.4,-24);vnCrate(x,0,z,.8,.2,vC(vPick(VPAL.woodMid)));}
 {const [x,z]=P(34,-17);vnBarrel(x,0,z,.35,.9,null);}
 {const [x,z]=P(33.5,15);vB('vStone',x,0,z,3,.06,14,0,st);tanMosaicRing(x,.06,z,1.6,or,wh);
  for(const s of[-1,1]){const [px,pz]=P(33.5+s*3.2,6);vnPlanter(px,0,pz,1.2,3.2,0,mb);const [qx,qz]=P(33.5+s*3.2,24);vnPlanter(qx,0,qz,1.2,3.2,0,mb);}
  for(const dv of[-4,4]){const [tx,tz]=P(33.5,15+dv);tanPot(tx,.06,tz,.5,null);}}
 /* the civic dress (the owner, 2026-10-19) */
 for(const s of[-1,1]){tanMosaicPanel(s*4.2,T+.8,5,0,1.8,3.4,gi);tanMosaicPanel(s*8.6,T+.8,5,0,1.8,3.4,gi);
  for(const dx of[2.6,7.8])tanBanner(s*dx,R1+.9,P(-8.9,0)[1]+.55,0,1.0,3.4,or,gi);
  for(const dx of[5.6,11])tanStatue(s*dx,yR+.95,P(-8.9,0)[1]+.1,0,1.0,mb);}
 tanCartouche(0,T+5.0,5,0,.8,wh,gi);}

VERN.def({key:'tal_governor_palace',name:'Governor\'s palace',family:'civic',
 tags:Object.assign({},TA_TAG('classical','civic',['civic'],true),{role:'governor'}),w:62,d:76,h:30,build:buildTalGovernorPalace});
