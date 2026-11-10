// ================================================================= XANADU — the Pleasure Dome's interior, drawn [G builder]
// 78c's plan (XPDOME, xdomePlan) drawn with 78b's pattern helpers, in the def's local frame: every wall as two skins (each
// side in its own room's pattern, the outside in the kit's whitewash under a gold frieze), cut where the plan has a door,
// an archway or a window, with the arch and its alternating voussoirs over each; the floors and ceilings; then the pieces
// the plan only names: the Hall of Feasts (arcades on four faces in two tiers, the clerestory, the drum, the gored dome),
// the checkered orders of the north door, the spiral stair in its rotunda, the gallery stairs, the sweeping stair under
// its skylight, the baths under their pierced domes, the courts. Every floor, stair and wall goes into core/walk (KWALK),
// every door leaf into core/door (KDOOR, through IZDOOR.leaf: unlocked), every pane is KGLASS.
//   xdomeBuild(o,cols)    called by buildXaPleasureDome (78-xa-palace.js); window._xaDome = what it drew
//   XA_CUT                the cutaway's units (core/host 99-host-cutaway): one per placement, its two storeys and the dome
const XA_CUT=[];
function xdomeBuild(o,cols){xpBalance(XPAT.balance.citadel);const D=XPDOME,P=xdomePlan(),T=D.T,Y0=D.Y0,Y1=D.Y1,Y2=D.Y2,V=xV(o),C=VERN.cur;
 const gold=xpGold(),lacq=xC(0x17171b),wash=cols.wash,ST={walls:0,ops:0,doors:0,panes:0,floors:0,blocks:0,strips:0};
 const WK=(typeof KWALK!=='undefined'&&typeof IZDOOR!=='undefined'&&C&&(C.o.scale==null||C.o.scale===1))?KWALK:null;
 const W3=(x,y,z)=>{const v=IZDOOR._w(x,y,z);return[v[0],v[2],v[1]];};
 const wFloor=(q,y,name)=>{if(!WK)return;WK.poly({pts:[[q[0],q[2]],[q[1],q[2]],[q[1],q[3]],[q[0],q[3]]].map(p=>W3(p[0],y,p[1])),name:'Pleasure Dome: '+name,tag:'interior:xa-dome'});ST.floors++;};
 const wStrip=(a,b,w,name)=>{if(!WK)return;WK.strip({a:W3(a[0],a[2],a[1]),b:W3(b[0],b[2],b[1]),w,name:'Pleasure Dome: '+name,tag:'interior:xa-dome-stair'});ST.strips++;};
 const wBlock=(x0,x1,z0,z1,y0,y1)=>{if(!WK||y1-y0<.05||x1-x0<.01||z1-z0<.01)return;const a=IZDOOR._w(x0,y0,z0),b=IZDOOR._w(x1,y1,z1);
  WK.block([Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[2],b[2]),Math.min(a[1],b[1]),Math.max(a[1],b[1])],'interior:xa-dome');ST.blocks++;};
 const glass=(x,y,z,w,h,d)=>{vB('vWinClear',x,y,z,w,h,d,0);ST.panes++;};
 // ---------------------------------------------------------------- a skin: one face of a wall along a line, cut by its openings
 // L {axis,c,a,b}; off: the skin's middle off the line; th its thickness; ops [{s,w,y0,ys,type,arch}]
 function skin(L,off,th,pat,yb,yt,ops,ext){if(yt-yb<.05)return;const X=L.axis==='x',ry=X?Math.PI/2:0,e=ext==null?0:ext;
  const box=(s0,s1,y0,y1)=>{if(s1-s0<.01||y1-y0<.01)return;const m=(s0+s1)/2,l=s1-s0;if(X)xpBox(pat,L.c+off,y0,m,th,y1-y0,l);else xpBox(pat,m,y0,L.c+off,l,y1-y0,th);};
  const G=[];for(const q of ops){const tp=q.type==='void'?yt:q.ys+xpArchRise(q.arch)*q.w;if(q.y0>=yt-.2||tp<=yb+.05)continue;const g=G.find(g=>Math.abs(g.s-q.s)<.02);if(g)g.ops.push(q);else G.push({s:q.s,w:q.w,ops:[q]});}
  G.sort((p,q)=>p.s-q.s);let cur=L.a-e;
  for(const g of G){box(cur,g.s-g.w/2,yb,yt);cur=g.s+g.w/2;g.ops.sort((p,q)=>p.y0-q.y0);let yy=yb;
   for(let i=0;i<g.ops.length;i++){const q=g.ops[i],lim=i+1<g.ops.length?Math.min(yt,g.ops[i+1].y0):yt;if(q.type==='void'){yy=yt;break;}
    box(g.s-g.w/2,g.s+g.w/2,yy,Math.max(yy,q.y0));const px=X?L.c+off:g.s,pz=X?g.s:L.c+off;
    if(q.ys<lim-.05){xpSpandrel(pat,px,q.ys,pz,ry,q.w,q.arch,th,lim);
     if(pat!=='wash'&&!(q.auto&&(pat==='op'||pat==='bandFine')))xpVoussoirs(px,q.ys,pz,ry,q.w,q.arch,th+.05,{vd:q.w>2.2?.4:.28,len:q.w>2.2?.48:.34});}   // (the small rooms' own windows go without: the budget)
    yy=lim;}
   box(g.s-g.w/2,g.s+g.w/2,yy,yt);}
  box(cur,L.b+e,yb,yt);ST.walls++;}
 // ---------------------------------------------------------------- the walls from the plan
 const patOf=R=>XPAT.room[R.kind].wall,topOf=xdomeTop;
 for(const S of P.segs){const X=S.axis==='x',lv=S.lv,yb=lv?Y1:Y0,mid=(S.a+S.b)/2;let outerTop=null;
  for(const sd of[-1,1]){const R=sd<0?S.A:S.B,Ro=sd<0?S.B:S.A,off=sd*T/4;
   if(Ro&&Ro.mezz&&(!R||R.void))continue;   // a floor inside a double room: the wall below is already full height
   if(!R){const In=Ro.void?Ro.below:Ro,tp=(Ro.open||(Ro.void&&Ro.below.open))?Y1:topOf(In)+.5;if(Ro.void&&!Ro.below.open)continue;
    skin(S,off,T/2,'wash',lv?Y1:0,tp,S.ops,T/2);outerTop=tp;continue;}
   if(R.void&&!R.below.open)continue;if(R.mezz)continue;
   if(R.open||R.void){if(!Ro){skin(S,off,T/2,'band',yb,Y1,S.ops);continue;}const tp=topOf(Ro.void?Ro.below:Ro)+.5;skin(S,off,T/2,'band',yb,tp,S.ops);outerTop=tp;continue;}
   skin(S,off,T/2,patOf(R),yb,topOf(R),S.ops);}
  // the parapet and the gold frieze where a wall's head stands clear
  if(outerTop!=null){const In=S.A&&!S.A.void&&!S.A.open?S.A:S.B,up=In&&lv===0&&!In.double?(X?P.at(1,S.c+(In===S.A?-.3:.3),mid):P.at(1,mid,S.c+(In===S.A?-.3:.3))):null;
   if(!up){const l=S.b-S.a+T;if(X)vB('xWashB',S.c,outerTop,mid,T,.7,l,0,wash);else vB('xWashB',mid,outerTop,S.c,l,.7,T,0,wash);
    if(X)vB('xGoldB',S.c,outerTop-.45,mid,T+.06,.3,l+.06,0,gold);else vB('xGoldB',mid,outerTop-.45,S.c,l+.06,.3,T+.06,0,gold);}}
  // the openings' own pieces (the level that owns them), and the wall's blocks in core/walk
  let cur=S.a;const tpS=Math.max(S.A&&!S.A.void?topOf(S.A):0,S.B&&!S.B.void?topOf(S.B):0,lv?Y2:Y1),G=[];
  for(const q of S.ops){const g=G.find(g=>Math.abs(g.s-q.s)<.02);if(g)g.ops.push(q);else G.push({s:q.s,w:q.w,ops:[q]});}
  const blk=(s0,s1,y0,y1)=>{if(X)wBlock(S.c-T/2,S.c+T/2,s0,s1,y0,y1);else wBlock(s0,s1,S.c-T/2,S.c+T/2,y0,y1);};
  for(const g of G){blk(cur,g.s-g.w/2,yb,tpS);cur=g.s+g.w/2;let yy=yb;g.ops.sort((p,q)=>p.y0-q.y0);
   for(const q of g.ops){if(q.type==='void'){yy=tpS;break;}blk(g.s-g.w/2,g.s+g.w/2,yy,q.y0);if(q.type==='window')blk(g.s-g.w/2,g.s+g.w/2,q.y0,q.ys);yy=q.ys;
    if(!q.own)continue;ST.ops++;const px=X?S.c:g.s,pz=X?g.s:S.c,ry=X?Math.PI/2:0,rise=xpArchRise(q.arch)*q.w,cw=q.arch==='horseshoe'?q.w*.82:q.w-.06;
    if(q.type==='window'&&!q.open){if(X)glass(px,q.y0,pz,.05,q.ys+rise-q.y0,q.w);else glass(px,q.y0,pz,q.w,q.ys+rise-q.y0,.05);
     xpStone('B',px,q.y0,pz,.07,q.ys+rise-q.y0-.03,.07,0);   // a black glazing bar (ref 10)
     if(X)vB('xGoldB',px,q.ys-.03,pz,.09,.06,q.w,0,gold);else vB('xGoldB',px,q.ys-.03,pz,q.w,.06,.09,0,gold);}
    if(q.type==='door'){IZDOOR.leaf(px,q.y0,pz,ry,cw,q.ys-q.y0,.08,lacq,{locked:false,pair:q.pair||cw>1.9});ST.doors++;
     if(X)glass(px,q.ys,pz,.05,rise,q.w);else glass(px,q.ys,pz,q.w,rise,.05);
     if(X)vB('xGoldB',px,q.ys-.02,pz,.12,.07,q.w,0,gold);else vB('xGoldB',px,q.ys-.02,pz,q.w,.07,.12,0,gold);}}
   blk(g.s-g.w/2,g.s+g.w/2,yy,tpS);}
  blk(cur,S.b,yb,tpS);}
 // ---------------------------------------------------------------- floors, ceilings, roofs
 for(const R of P.rooms){if(R.void)continue;const pt=XPAT.room[R.kind],tp=topOf(R);
  vnReg('Pleasure Dome — '+R.name,(R.rects[0][0]+R.rects[0][1])/2,(R.rects[0][2]+R.rects[0][3])/2,Math.hypot(R.rects[0][1]-R.rects[0][0],R.rects[0][3]-R.rects[0][2])/2,R.lv?Y2:Y1);
  for(const q of R.rects){const cx=(q[0]+q[1])/2,cz=(q[2]+q[3])/2,w=q[1]-q[0],d=q[3]-q[2];
   if(R.lv===0)xpBox(pt.floor,cx,0,cz,w,Y0,d);else xpBox(pt.floor,cx,Y1-D.SLAB,cz,w,D.SLAB,d);
   if(!R.walk)wFloor(q,R.lv?Y1:Y0,R.name);
   if(R.open||R.ceil===false)continue;
   if(R.lv===1||R.double){xpBox(pt.ceil||'band',cx,tp,cz,w,.25,d);vB('xWashB',cx,tp+.25,cz,w,.25,d,0,wash);}
   else if(!P.at(1,cx,cz))vB('xWashB',cx,tp,cz,w,D.SLAB,d,0,wash);}
  if(R.walk)for(const q of R.walk)wFloor(q,Y0,R.name);}
 xdomeHall(o,cols,{glass,wFloor,wStrip,wBlock});
 xdomeStairs(o,cols,{glass,wFloor,wStrip,wBlock});
 xdomeRooms(o,cols,{glass,wFloor,wStrip,wBlock});
 // the garden between the wings is ground a walker crosses (the gate to the hall's door, the wings' garden doors)
 wFloor([-20,20,0,D.GD/2],0,'Chahar Bagh');wFloor([-D.GW/2,D.GW/2,50,D.GD/2],0,'Chahar Bagh');
 if(C){const w=IZDOOR._w(0,0,0);XA_CUT.push({id:'xa-dome.'+XA_CUT.length,name:'Pleasure Dome',x:w[0],z:w[2],ry:C.ry==null?0:C.ry,w:D.GW,d:D.GD,key:'xa_pleasure_dome',tag:'interior:xa-dome',gate:IZDOOR._w(0,0,D.GD/2-4),
  levels:[{y:w[1]+Y0,h:Y1-Y0,name:'ground: the harem palace (E3)'},{y:w[1]+Y1,h:Y2-Y1,name:'upper: the galleries and the favourites (E4)'},{y:w[1]+D.HALL.top,h:8,name:'the clerestory and the drum'}]});}
 ST.rooms=P.rooms.filter(r=>!r.void).length;ST.segs=P.segs.length;ST.unplaced=(D.unplaced||[]).length;ST.lib=XP_T.bound||null;ST.walk=!!WK;window._xaDome=ST;
 window._hollowDoors=(window._hollowDoors|0)+ST.doors;xpBalance(null);}   // the unlocked leaves of a hollow def, declared (the kit sheet's doors check counts them: kits/iziz-vernacular/sheet_verify.py)
// the reachability audit (core/walk's KWALK.reach): from inside the garden gate, over the Dome's own floors and stairs, with
// the doors open (their blocks off): {floors, reached, unreached: [names]}. xdomeReach(i) audits the i-th placement
function xdomeReach(i){const U=XA_CUT[i==null?0:i];if(!U||typeof KWALK==='undefined')return null;
 for(const d of KDOOR.list)if(!d.locked&&d.key===U.key)KDOOR.open(d.id,{by:'audit'});for(let k=0;k<40;k++)KDOOR.step(.25);
 const m=(U.r!=null?U.r:Math.max(U.w,U.d)/2)+4,R=KWALK.reach([[U.gate[0],U.gate[1],U.gate[2]]],{box:[U.x-m,U.x+m,U.z-m,U.z+m],cell:.4});
 const mine=f=>String(f.tag||'').indexOf(U.tag)===0,un=R.unreached.filter(mine),re=R.reached.filter(mine);
 return{floors:un.length+re.length,reached:re.length,unreached:un.map(f=>f.name+' @'+(f.y!=null?f.y:f.a?f.a[2]:f.pts[0][2]).toFixed(1)),nodes:R.nodes,capped:!!R.capped};}
// ---------------------------------------------------------------- the Hall of Feasts
function xdomeHall(o,cols,K){const D=XPDOME,H=D.HALL,Y0=D.Y0,Y1=D.Y1,T=D.T,V=xV(o),gold=xpGold(),cx=H.c[0],cz=H.c[1],hf=H.half,bay=2*hf/H.bays,pw=H.pier,sp=bay-pw;
 const ys0=Y0+4.7,ys1=Y1+4.0,yc=14.5,top=H.top,CL=H.clere,tile=xC(XPAL.turquoise);
 // the floor of rings under the dome, the Sultan's dais at its heart
 xpRings(cx,Y0,cz,hf-.9,24,.012);
 // the arcades: striped piers on the square's four faces, horseshoe arches below, round above, the voussoirs alternating
 const faces=[[0,1,cz+hf,0],[0,1,cz-hf,0],[1,0,cx-hf,Math.PI/2],[1,0,cx+hf,Math.PI/2]];   // [x runs?, ., the line, ry]
 const done={};
 for(const F of faces){const X=F[3]!==0;
  for(let i=0;i<=H.bays;i++){const t=-hf+i*bay,px=X?F[2]:cx+t,pz=X?cz+t:F[2],k=px.toFixed(1)+','+pz.toFixed(1);if(done[k])continue;done[k]=1;
   xpBox('band',px,Y0,pz,pw,yc-Y0,pw);for(const y of[ys0,ys1])vB('xGoldB',px,y-.14,pz,pw+.16,.14,pw+.16,0,gold);K.wBlock(px-pw/2,px+pw/2,pz-pw/2,pz+pw/2,Y0,yc);}
  for(let i=0;i<H.bays;i++){const t=-hf+(i+.5)*bay,px=X?F[2]:cx+t,pz=X?cz+t:F[2];
   xpSpandrel('band',px,ys0,pz,F[3],sp,'horseshoe',pw,Y1);xpVoussoirs(px,ys0,pz,F[3],sp,'horseshoe',pw+.06,{vd:.5,len:.46});
   xpSpandrel('band',px,ys1,pz,F[3],sp,'round',pw,yc);xpVoussoirs(px,ys1,pz,F[3],sp,'round',pw+.06,{vd:.46,len:.46});
   // the gallery's balustrade between the upper piers (the north face looks down its own bay: none)
   if(F[2]!==cz-hf||X){const a=X?[F[2],cz+t-sp/2]:[cx+t-sp/2,F[2]],b=X?[F[2],cz+t+sp/2]:[cx+t+sp/2,F[2]];xpBalustrade(a,b,Y1,Y1,{pitch:.4});
    if(X)K.wBlock(F[2]-.1,F[2]+.1,a[1],b[1],Y1,Y1+1);else K.wBlock(a[0],b[0],F[2]-.1,F[2]+.1,Y1,Y1+1);}}}
 // the clerestory: the square carried up on the arcades, chevrons inside, whitewash and windows over the aisle roofs
 const win=[];for(let i=0;i<H.bays;i++)win.push({s:-hf+(i+.5)*bay,w:2.4,y0:18,ys:20.4,type:'window',arch:'round'});
 const sk=(L,off,th,pat,yb,yt,ops)=>{const X=L.axis==='x',ry=X?Math.PI/2:0;let cur=L.a;
  const box=(s0,s1,y0,y1)=>{if(s1-s0<.01||y1-y0<.01)return;const m=(s0+s1)/2;if(X)xpBox(pat,L.c+off,y0,m,th,y1-y0,s1-s0);else xpBox(pat,m,y0,L.c+off,s1-s0,y1-y0,th);};
  for(const q of ops){box(cur,q.s-q.w/2,yb,yt);cur=q.s+q.w/2;box(q.s-q.w/2,q.s+q.w/2,yb,q.y0);const px=X?L.c+off:q.s,pz=X?q.s:L.c+off;
   xpSpandrel(pat,px,q.ys,pz,ry,q.w,q.arch,th,yt);if(pat!=='wash')xpVoussoirs(px,q.ys,pz,ry,q.w,q.arch,th+.05,{vd:.36,len:.4});}
  box(cur,L.b,yb,yt);};
 for(const F of faces){const X=F[3]!==0,sg=(F[2]>(X?cx:cz))?1:-1,L={axis:X?'x':'z',c:F[2],a:(X?cz:cx)-hf-.5,b:(X?cz:cx)+hf+.5};
  const ops=win.map(q=>Object.assign({},q,{s:(X?cz:cx)+q.s}));
  sk(L,-sg*.25,.5,'chevron',yc,CL,ops);sk(L,sg*.25,.5,'band',yc,top,[]);sk(L,sg*.25,.5,'wash',top,CL,ops);
  for(const q of ops){if(X)K.glass(F[2],q.y0,q.s,.05,q.ys+q.w/2-q.y0,q.w);else K.glass(q.s,q.y0,F[2],q.w,q.ys+q.w/2-q.y0,.05);}
  if(X)vB('xGoldB',F[2]+sg*.52,CL-.75,cz,.06,.6,2*hf+1.1,0,gold);else vB('xGoldB',cx,CL-.75,F[2]+sg*.52,2*hf+1.1,.6,.06,0,gold);
  if(X)vB('xGoldB',F[2]-sg*.52,yc-.02,cz,.05,.16,2*hf,0,gold);else vB('xGoldB',cx,yc-.02,F[2]-sg*.52,2*hf,.16,.05,0,gold);}
 // the aisles' and the north bay's ceilings, their roofs; the attic that carries the hall's walls clear of the wings' roofs
 for(const q of[[-20,-14,-40,0],[14,20,-40,0],[-14,14,-6,0],[-14,14,-40,-34]]){const x=(q[0]+q[1])/2,z=(q[2]+q[3])/2,w=q[1]-q[0],d=q[3]-q[2];xpBox('chevron',x,top,z,w,.25,d);vB('xWashB',x,top+.25,z,w,.25,d,0,cols.wash);}
 for(const s of[-1,1]){vB('xWashB',cx+s*20.15,D.Y2+.5,cz,.34,top+1.2-D.Y2-.5,40.6,0,cols.wash);vB('xWashB',cx,D.Y2+.5,cz+s*20.15,40.6,top+1.2-D.Y2-.5,.34,0,cols.wash);
  vB('xGoldB',cx+s*20.34,top+.3,cz,.05,.35,40.9,0,gold);vB('xGoldB',cx,top+.3,cz+s*20.34,40.9,.35,.05,0,gold);}
 // the square to the round: the slab under the drum; the drum in banded piers and windows, mosaic outside; the gored dome
 xpSqHole('chevron',cx,CL-.5,cz,2*hf,.5,2*hf);xpSqHole('wash',cx,CL,cz,2*hf+1.2,.3,2*hf+1.2);
 const N=24,rd=H.r+.1,pwid=TAU*rd/N+.06;
 for(let k=0;k<N;k++){const a=k/N*TAU,sx=Math.sin(a),sz=Math.cos(a),x=cx+sx*rd,z=cz+sz*rd,xo=cx+sx*(rd+.42),zo=cz+sz*(rd+.42);
  if(k%2){vB('xp_band',x,CL,z,pwid,1.0,.5,a);vB('xp_band',x,CL+3.3,z,pwid,H.drum-3.3,.5,a);vB('xMosAB',xo,CL,zo,pwid+.1,1.0,.34,a);vB('xMosAB',xo,CL+3.3,zo,pwid+.1,H.drum-3.3,.34,a);
   vB('vWinClear',cx+sx*(rd+.1),CL+1,cz+sz*(rd+.1),pwid,2.3,.05,a);}
  else{vB('xp_band',x,CL,z,pwid,H.drum,.5,a);vB('xMosAB',xo,CL,zo,pwid+.1,H.drum,.34,a);}
  vB('xGoldB',cx+sx*(rd-.28),CL+H.drum-.2,cz+sz*(rd-.28),pwid,.2,.06,a,gold);vB('xGoldB',cx+sx*(rd+.62),CL+H.drum-.3,cz+sz*(rd+.62),pwid+.2,.3,.08,a,gold);}
 xpGoreDome(cx,CL+H.drum,cz,H.r-.1,{});
 {const bk=XPAT.dome==='B'&&V===0;xpShellDome(cx,CL+H.drum,cz,H.r+1,bk?1.02:1.25,bk?'B':['T','G','M'][V],V===0?tile:null,3.2);}
 for(const sx of[-1,1])for(const sz of[-1,1]){const tx=cx+sx*(hf+1.6),tz=cz+sz*(hf+1.6),th=V===1?11:8;vPst('xColS',tx,top+.5,tz,1.3,th,cols.stone);kput('xDrumW',[tx,top+.5+th,tz],null,[1.55,1.4,1.55],cols.wash);
  kput('xBulbT',[tx,top+1.9+th,tz],null,[1.8,2.2,1.8],V===1?gold:(XPAT.dome==='B'&&V===0?xC(0x17171b):tile));vBall('xGold',tx,top+4.2+th,tz,.2,gold);}
 // against it, few objects: the white marble table before the checkered door, trees in black planters, crystal
 xpTable(cx,Y0,-36.4,3.4,1.3,.95);
 for(const s of[-1,1]){xpOrb(s*3.6,0,1.6,.5,1.25);xpOrb(s*6.2,0,1.6,.38,.95);}   // black spheres on white pedestals by the garden door (ref 08)
 for(const sx of[-1,1])for(const sz of[-1,1]){xpPlanter(cx+sx*10.6,Y0,cz+sz*10.6,1.1,.8,4.4);xpChandelier(cx+sx*6.5,CL-.5,cz+sz*6.5,1.5,7.5);K.wBlock(cx+sx*10.6-1.1,cx+sx*10.6+1.1,cz+sz*10.6-1.1,cz+sz*10.6+1.1,Y0,Y0+2);}
 for(const s of[-1,1]){xpRunner(s*17,Y1+.02,-20,2.4,38,0);xpChandelier(s*17,top,-20,.9,3.2);}
 xpRunner(0,Y1+.02,-3,2.4,26,Math.PI/2);xpRunner(0,Y0+.02,-3,3,5.6,0);
 // the checkered orders of the north door (ref 01): eight rings stepping in and back, then the checkered barrel to the door
 const PT=D.PORTAL;xpSpandrel('band',0,Y0+PT.spring,-40,0,PT.span+2*PT.step,'round',T,top);
 const inner=xpOrders(0,Y0,-40+T/2,0,PT.span,PT.spring,PT.n,PT.step,PT.odep),z1=-40+T/2-PT.n*PT.odep;
 xpTunnel(0,Y0,z1,0,inner,PT.spring,z1+57-T/2,.56);
 xpRunner(0,Y0+.02,-48.3,2.6,16.6,0);vB('xWashB',0,D.Y2,-48.5,14,.5,17,0,cols.wash);
 vnReg('Pleasure Dome — the checkered door',0,-46,8,Y0+2);}
// ---------------------------------------------------------------- the stairs
function xdomeStairs(o,cols,K){const D=XPDOME,Y0=D.Y0,Y1=D.Y1,Y2=D.Y2,gold=xpGold(),rise=Y1-Y0;
 // the grand spiral stair (ref 05): black treads round a striped rotunda, white balusters, a gold rail, the vault in gores
 {const R=D.ROT,cx=R.c[0],cz=R.c[1],n=48,da=(R.a1-R.a0)/n,rm=(R.r0+R.r1)/2,NP=16,rw=R.r-.16,pw=TAU*rw/NP+.05;
  for(let k=0;k<NP;k++){const th=k/NP*TAU,x=cx+Math.cos(th)*rw,z=cz+Math.sin(th)*rw,ry=Math.atan2(Math.cos(th),Math.sin(th));
   if(k===4||k===12){xpSpandrel('band',x,Y0+3.2,z,ry,pw,'round',.3,Y2);xpVoussoirs(x,Y0+3.2,z,ry,pw,'round',.36,{vd:.3,len:.36});}
   else if(k===0){vB('xp_band',x,Y0,z,pw,Y1-Y0,.3,ry);xpSpandrel('band',x,Y1+3,z,ry,pw,'round',.3,Y2);xpVoussoirs(x,Y1+3,z,ry,pw,'round',.36,{vd:.3,len:.36});}
   else if(k===8){vB('xp_band',x,Y0,z,pw,1.2,.3,ry);xpSpandrel('band',x,Y0+9.5,z,ry,pw,'round',.3,Y2);xpVoussoirs(x,Y0+9.5,z,ry,pw,'round',.36,{vd:.3,len:.36});}
   else vB('xp_band',x,Y0,z,pw,Y2-Y0,.3,ry);}
  for(let i=0;i<n;i++){const th=R.a0+da*(i+.5),y=Y0+rise*(i+1)/n;vB('xp_solid',cx+Math.cos(th)*rm,y-.42,cz+Math.sin(th)*rm,R.r1-R.r0,.42,da*R.r1+.04,-th,xpInk('B'));
   vB('xGoldB',cx+Math.cos(th)*rm,y-.02,cz+Math.sin(th)*rm,R.r1-R.r0,.025,.05,-th,gold);}
  const NS=16;for(let k=0;k<NS;k++){const t0=k/NS,t1=(k+1)/NS,a=R.a0+(R.a1-R.a0)*t0,b=R.a0+(R.a1-R.a0)*t1;
   xpBalustrade([cx+Math.cos(a)*R.r0,cz+Math.sin(a)*R.r0],[cx+Math.cos(b)*R.r0,cz+Math.sin(b)*R.r0],Y0+rise*t0,Y0+rise*t1,{pitch:.4});
   K.wStrip([cx+Math.cos(a)*rm,cz+Math.sin(a)*rm,Y0+rise*t0],[cx+Math.cos(b)*rm,cz+Math.sin(b)*rm,Y0+rise*t1],R.r1-R.r0-.2,'the spiral stair');}
  xpStone('B',cx+5.35,Y1-.42,cz+.75,3.7,.42,1.9,0);K.wFloor([cx+3.5,cx+7.2,cz-.2,cz+1.7],Y1,'the spiral stair: head');
  xpBalustrade([cx+3.5,cz+1.7],[cx+6.6,cz+1.7],Y1,Y1,{pitch:.4});
  xpRings(cx,Y0,cz,3.2,8,.01);
  xpSqHole('chevron',cx,Y2,cz,14,.25,14);xpSqHole('wash',cx,Y2+.25,cz,14,.25,14);xpGoreDome(cx,Y2+.2,cz,R.r-.1,{hk:.82});
  xpShellDome(cx,Y2+.5,cz,R.r+.4,.95,XPAT.dome==='B'&&!xV(o)?'B':['T','G','M'][xV(o)],null,1.6);
  xpChandelier(cx,Y2+4.6,cz,1.5,8.5);vnReg('Pleasure Dome — the spiral stair',cx,cz,7,Y0+3);}
 // the gallery stairs: four flights round a striped pier, a landing at each corner
 for(const S of[{q:[-20,-14,-46,-40],sx:1},{q:[14,20,-46,-40],sx:-1}]){const q=S.q,lw=1.5,cx=(q[0]+q[1])/2,cz=(q[2]+q[3])/2,h=2.25;
  // corners from the door's (south, the hall's side), away from the hall and round
  const xa=S.sx>0?q[1]-lw/2:q[0]+lw/2,xb=S.sx>0?q[0]+lw/2:q[1]-lw/2,zs=q[3]-lw/2,zn=q[2]+lw/2,CN=[[xa,zs],[xa,zn],[xb,zn],[xb,zs],[xa,zs]];
  xpBox('band',cx,Y0,cz,6-2*lw-.1,Y2-Y0,6-2*lw-.1);K.wBlock(cx-1.45,cx+1.45,cz-1.45,cz+1.45,Y0,Y2);
  for(let f=0;f<4;f++){const a=CN[f],b=CN[f+1],ya=Y0+rise*f/4,yb=Y0+rise*(f+1)/4,dx=Math.sign(b[0]-a[0]),dz=Math.sign(b[1]-a[1]),run=6-2*lw,n=12;
   for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+dx*(lw/2+run*t),z=a[1]+dz*(lw/2+run*t),y=ya+(yb-ya)*(i+1)/(n+1);xpStone('B',x,y-.34,z,dx?run/n+.02:lw,.34,dz?run/n+.02:lw,0);}
   xpStone('B',b[0],yb-.3,b[1],lw,.3,lw,0);K.wFloor([b[0]-lw/2,b[0]+lw/2,b[1]-lw/2,b[1]+lw/2],yb,'gallery stair: landing');
   K.wStrip([a[0]+dx*lw/2,a[1]+dz*lw/2,ya],[b[0]-dx*lw/2,b[1]-dz*lw/2,yb],lw-.1,'gallery stair');}}
 // the sweeping stair (ref 04): one flight of black treads between white balustrades, under a skylight, trees in black planters
 {const x0=30,x1=45,zc=9,w=3.4,n=48,tr=(x1-x0)/n;
  for(let i=0;i<n;i++){const y=Y0+rise*(i+1)/n;xpStone('B',x0+tr*(i+.5),y-.5,zc,tr+.02,.5,w,0);vB('xGoldB',x0+tr*(i+.5)-tr/2+.03,y-.02,zc,.04,.025,w,0,gold);}
  for(const s of[-1,1]){xpBalustrade([x0,zc+s*(w/2-.1)],[x1,zc+s*(w/2-.1)],Y0,Y1,{pitch:.42});K.wBlock(x0,x1,zc+s*w/2-.1,zc+s*w/2+.1,Y0,Y1+1);}
  xpBalustrade([45,3.4],[45,zc-w/2],Y1,Y1,{pitch:.42});xpBalustrade([45,zc+w/2],[45,14.6],Y1,Y1,{pitch:.42});K.wBlock(44.9,45.1,3.3,zc-w/2,Y1,Y1+1);K.wBlock(44.9,45.1,zc+w/2,14.7,Y1,Y1+1);
  K.wStrip([x0,zc,Y0],[x1,zc,Y1],w-.3,'the sweeping stair');
  // the ceiling round the skylight, the glass in a gold frame
  for(const q of[[20,27,3,15],[43,50,3,15],[27,43,3,6],[27,43,12,15]]){const x=(q[0]+q[1])/2,z=(q[2]+q[3])/2;xpBox('chevron',x,Y2,z,q[1]-q[0],.25,q[3]-q[2]);vB('xWashB',x,Y2+.25,z,q[1]-q[0],.25,q[3]-q[2],0,cols.wash);}
  K.glass(35,Y2+.2,9,16,.06,6);for(let k=0;k<=8;k++)vB('xGoldB',27+k*2,Y2+.16,9,.08,.12,6,0,gold);for(const z of[6,9,12])vB('xGoldB',35,Y2+.16,z,16,.12,.08,0,gold);
  for(const p of[[23.5,5.2],[23.5,12.8],[28,12.9],[34,12.9],[40,12.9],[34,5.1],[40,5.1]]){xpPlanter(p[0],Y0,p[1],.85,.75,3.4);K.wBlock(p[0]-.85,p[0]+.85,p[1]-.85,p[1]+.85,Y0,Y0+2);}
  for(const s of[-1,1])for(const x of[28.6,33.6,38.6,43.6]){xpBlackCol(x,Y0,9+s*2.4,.3,Y2-Y0);K.wBlock(x-.35,x+.35,9+s*2.4-.35,9+s*2.4+.35,Y0,Y2);}   // black columns under gold capitals down the flight (ref 12)
  xpRings(25,Y0,9,2.3,6,.008);xpChandelier(24.5,Y2,9,1.2,4.5);vnReg('Pleasure Dome — the sweeping stair',37,9,9,Y0+2);}}
// ---------------------------------------------------------------- the baths, the courts, the passages
function xdomeRooms(o,cols,K){const D=XPDOME,Y0=D.Y0,Y1=D.Y1,Y2=D.Y2,gold=xpGold(),water=xC(XPAL.water);
 // the great pool under three pierced domes, banded columns at its corners
 xpStone('B',35,Y0,40,18,.4,10.6,0);vB('xWaterB',35,Y0+.34,40,17,.1,9.6,0,water);K.wBlock(26,44,34.7,45.3,Y0,Y0+.6);
 for(const x of[26.4,43.6])for(const z of[33.4,46.6]){xpCol('band',x,Y0,z,.5,Y2-Y0);kput('xDiscG',[x,Y0+5.2,z],null,[.62,.14,.62],gold);K.wBlock(x-.5,x+.5,z-.5,z+.5,Y0,Y2);}
 for(const z of[32.5,47.5]){xpBox('band',35,Y2,z,30,.25,5);vB('xWashB',35,Y2+.25,z,30,.25,5,0,cols.wash);}
 for(const x of[25,35,45]){xpSqHole('band',x,Y2,40,10,.25,10);xpSqHole('wash',x,Y2+.25,40,10,.25,10);xpGoreDome(x,Y2+.2,40,4.85,{hk:.78,ribs:false});
  xpShellDome(x,Y2+.5,40,5.2,.9,XPAT.dome==='B'&&!xV(o)?'B':'W',cols.wash,0);for(let k=0;k<5;k++){const a=k/5*TAU;vBall('xGold',x+Math.sin(a)*2.2,Y2+.5+4.2,40+Math.cos(a)*2.2,.2,gold);}}
 for(const z of[31,49])for(const x of[24,46]){kput('xpOct_solid',[x,Y0,z],null,[.7,.9,.7],xpInk('W'));kput('xDiscWater',[x,Y0+.88,z],null,[.5,.05,.5],water);}
 // the warm and hot rooms: the heated marble platform, basins on the walls
 kput('xpOct_solid',[35,Y0,22.5],null,[3.2,.5,3.2],xpInk('W'));kput('xpOct_solid',[35,Y0+.5,22.5],null,[2.6,.06,2.6],xpInk('B'));K.wBlock(32,38,19.5,25.5,Y0,Y0+.6);
 for(const x of[24,29,41,46]){kput('xpOct_solid',[x,Y0,29],null,[.55,.85,.55],xpInk('W'));kput('xDiscWater',[x,Y0+.83,29],null,[.4,.05,.4],water);}
 // the Valide's court: a fountain, orange trees in black planters; the eunuchs' court
 xnFountain(-38,Y0,-14,2.4,xC(XPAT.stone.white));K.wBlock(-40.4,-35.6,-16.4,-11.6,Y0,Y0+1.5);
 for(const p of[[-44,-22],[-32,-22],[-44,-6],[-32,-6]]){xpPlanter(p[0],Y0,p[1],.9,.8,3.4);K.wBlock(p[0]-.9,p[0]+.9,p[1]-.9,p[1]+.9,Y0,Y0+2);}
 xnFountain(30,Y0,-39,1.8,xC(XPAT.stone.white));K.wBlock(28.2,31.8,-40.8,-37.2,Y0,Y0+1.5);
 for(const p of[[23,-50],[37,-28]]){xpPlanter(p[0],Y0,p[1],.8,.75,3.2);K.wBlock(p[0]-.8,p[0]+.8,p[1]-.8,p[1]+.8,Y0,Y0+2);}
 // a little crystal in the private rooms
 for(const p of[[-35,-40],[-35.5,9],[35,-17.5],[35,-3.5],[-24,-14]])xpChandelier(p[0],Y1-D.SLAB,p[1],.8,2.2);
 for(const p of[[-35,-40],[-28,9],[-35,41],[35,-17.5],[35,-3.5],[35,22.5],[-24,-14]])xpChandelier(p[0],Y2,p[1],.8,2.0);}
// ---------------------------------------------------------------- the Pleasure Dome of the Bay (xa_pleasure_dome_bay, 87c)
// The round pavilion on Erewhon's island, hollow: the drum a rotunda of banded panels (WHITE over black: XPAT.balance.bay),
// eleven arched windows and the door to the dock, a floor of rings round a pool, eight black columns under gold capitals, and
// the dome in gores of turquoise tile and of glass by turns (white inside, a black gore in four), so the room stands under
// its own skylight. P: {y0 the floor, DR the drum's radius, DH its height, R the colonnade's, turq, wash, gold}
function xbayBuild(o,P){xpBalance(XPAT.balance.bay);const y0=P.y0,DR=P.DR,DH=P.DH,gold=xpGold(),C=VERN.cur,lacq=xC(0x17171b),ST={doors:0,panes:0,floors:0,blocks:0};
 const WK=(typeof KWALK!=='undefined'&&typeof IZDOOR!=='undefined'&&C&&(C.o.scale==null||C.o.scale===1))?KWALK:null,TAG='interior:xa-bay';
 const W3=(x,y,z)=>{const v=IZDOOR._w(x,y,z);return[v[0],v[2],v[1]];};
 const ring=(r,y,name,n)=>{if(!WK)return;const pts=[];for(let k=0;k<n;k++){const a=k/n*TAU;pts.push(W3(Math.cos(a)*r,y,Math.sin(a)*r));}WK.poly({pts,name:'Pleasure Dome of the Bay: '+name,tag:TAG});ST.floors++;};
 const blk=(x,z,h,y,hh)=>{if(!WK)return;const a=IZDOOR._w(x-h,y,z-h),b=IZDOOR._w(x+h,y+hh,z+h);WK.block([Math.min(a[0],b[0]),Math.max(a[0],b[0]),Math.min(a[2],b[2]),Math.max(a[2],b[2]),Math.min(a[1],b[1]),Math.max(a[1],b[1])],TAG);ST.blocks++;};
 // the drum: 24 panels, a window in every other one, the door on the dock's side
 const N=24,rw=DR-.25,pw=TAU*rw/N+.06,ro=DR+.08,po=TAU*ro/N+.06;
 for(let k=0;k<N;k++){const th=k/N*TAU,cx=Math.cos(th),cz=Math.sin(th),x=cx*rw,z=cz*rw,xo=cx*ro,zo=cz*ro,ry=Math.atan2(cx,cz);
  if(k===6){xpSpandrel('band',x,y0+4.2,z,ry,pw,'round',.4,y0+DH);xpSpandrel('wash',xo,y0+4.2,zo,ry,po,'round',.3,y0+DH);xpVoussoirs(x,y0+4.2,z,ry,pw,'round',.46,{vd:.36,len:.4});
   IZDOOR.leaf(0,y0,DR-.1,0,pw*.82,4.2,.08,lacq,{locked:false,pair:true});ST.doors++;vB('vWinClear',0,y0+4.2,DR-.1,pw*.9,pw/2,.05,0);vB('xGoldB',0,y0+4.16,DR-.1,pw,.08,.14,0,gold);continue;}
  if(k%2){xpBox('band',x,y0,z,pw,1.2,.4,ry);vB('xWashB',xo,y0,zo,po,1.2,.3,ry,P.wash);xpSpandrel('band',x,y0+4.6,z,ry,pw,'round',.4,y0+DH);xpSpandrel('wash',xo,y0+4.6,zo,ry,po,'round',.3,y0+DH);
   xpVoussoirs(x,y0+4.6,z,ry,pw,'round',.46,{vd:.34,len:.4});vB('vWinClear',cx*(DR-.1),y0+1.2,cz*(DR-.1),pw*.94,3.4+pw/2,.05,ry);ST.panes++;
   vB('xp_solid',cx*(DR-.1),y0+1.2,cz*(DR-.1),.07,3.4+pw/2-.05,.07,ry,xpInk('B'));vB('xGoldB',cx*(DR-.1),y0+4.56,cz*(DR-.1),pw*.94,.06,.1,ry,gold);}
  else{xpBox('band',x,y0,z,pw,DH,.4,ry);vB('xWashB',xo,y0,zo,po,DH,.3,ry,P.wash);}
  vB('xGoldB',cx*(rw-.24),y0+DH-.22,cz*(rw-.24),pw,.22,.06,ry,gold);
  vB('xBandB',cx*(ro+.2),y0+DH-.9,cz*(ro+.2),po+.1,.7,.12,ry,P.band);vB('vStone',cx*(ro+.15),y0+DH-.2,cz*(ro+.15),po+.2,.4,.9,ry,P.stone);   // the twig band and the cornice, outside
  blk(cx*DR,cz*DR,k===6?0:pw*.36,y0,DH);}
 // the floor of rings, the pool at its heart, the runner from the door; black columns under gold capitals; trees in white planters
 xpRings(0,y0,0,DR-.5,14,.008);ring(DR-.5,y0,'the rotunda',20);
 kput('xpDisc',[0,y0+.2,0],null,[4.4,.5,4.4],xpInk('W'));kput('xDiscWater',[0,y0+.46,0],null,[3.9,.06,3.9],xC(XPAL.water));blk(0,0,3.6,y0,.9);
 xpRunner(0,y0+.03,(DR+4.4)/2-.3,2.4,DR-5.4,0);
 for(let k=0;k<8;k++){const a=(k+.5)/8*TAU,x=Math.cos(a)*8.4,z=Math.sin(a)*8.4;xpBlackCol(x,y0,z,.32,DH+.4);blk(x,z,.36,y0,DH);}
 for(let k=0;k<4;k++){const a=k/4*TAU+Math.PI/4,x=Math.cos(a)*11,z=Math.sin(a)*11;xpPlanter(x,y0,z,.8,.75,3.2,'W');blk(x,z,.8,y0,2);}
 for(const s of[-1,1])xpOrb(s*3.2,y0,DR+1.5,.45,1.1);
 // the dome: turquoise tile and glass by turns, the tile gores white inside (a black one in four), gold ribs, a gilt finial
 {const yd=y0+DH+.4,r=DR-.6;for(let k=0;k<XP_NGORE;k++){const q=qEuler(0,k/XP_NGORE*TAU,0);
   if(k%2){kput('xpGoreGlass',[0,yd,0],q,[r,r,r]);continue;}
   kput('xpGoreT',[0,yd,0],q,[r,r,r],P.turq);kput('xpGore',[0,yd,0],q,[r-.25,r-.25,r-.25],xpInk(k%8===0?'B':'W'));kput('xpRibO',[0,yd,0],q,[r,r,r],gold);kput('xpRib',[0,yd,0],q,[r-.25,r-.25,r-.25],gold);}
  kput('xpGlassDisc',[0,yd+r*.99,0],null,[r*.14,.04,r*.14]);vPst('xColG',0,yd+r-.1,0,.06,1.6,xC(XPAL.gold[0]));vBall('xGold',0,yd+r+1.3,0,.7,xC(XPAL.gold[0]));kput('xConeG',[0,yd+r+1.4,0],null,[.08,1.3,.08],xC(XPAL.gold[0]));}
 // core/walk: the platform and its flight; the cutaway's unit and the views' points (world), kept on it
 ring(P.R+1,y0-.1,'the platform',20);
 if(WK){WK.strip({a:W3(0,0,P.R+8.2),b:W3(0,y0-.1,P.R-.6),w:7,name:'Pleasure Dome of the Bay: the flight',tag:TAG});
  WK.strip({a:W3(0,y0-.1,DR+1.2),b:W3(0,y0,DR-.8),w:pw*.8,name:'Pleasure Dome of the Bay: the threshold',tag:TAG});}
 if(C){const w=IZDOOR._w(0,0,0),V6=(a,b)=>IZDOOR._w(a[0],a[1],a[2]).concat(IZDOOR._w(b[0],b[1],b[2]));
  XA_CUT.push({id:'xa-bay.'+XA_CUT.length,name:'Pleasure Dome of the Bay',x:w[0],z:w[2],r:P.R+9,key:'xa_pleasure_dome_bay',tag:TAG,gate:IZDOOR._w(0,y0-.1,DR+4),
   levels:[{y:w[1]+y0,h:DH,name:'the rotunda'},{y:w[1]+y0+DH,h:DR,name:'the dome'}],
   views:{'the rotunda':V6([0,y0+1.8,DR-2.6],[0,y0+6.5,-8]),'under the dome':V6([2.5,y0+1.7,7],[0,y0+DH+9,-1]),'from the dock':V6([0,y0+3,P.R+16],[0,y0+9,0])}});}
 vnReg('Pleasure Dome of the Bay — the rotunda',0,0,DR,DH+DR);
 window._xaBay=ST;window._hollowDoors=(window._hollowDoors|0)+ST.doors;xpBalance(null);}
