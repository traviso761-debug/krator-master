// prefix: gz
// ================================================================= THE GLAZIERS' SET: THE TIERED FRONT, THE DRAWN PIECES, AND THE HOMES (PLAN.md 3.4, poor to rich)
// A household's front is TIERS on the scarp: each tier a battered whitewashed wall standing out from the rock face (the tier's
// out), its side walls back to the face, a flat roof that is the terrace of the tier above, the parapet's band in alecap purple
// (the Tibetan pembe, in their own dye), a cholet band under it. Behind each tier the household's rooms are carved into the rock
// (the void plan); a doorway through the face joins the built front room to them. Every home's lamp is red (the code: a home).
//   gzTier(T, C)          one tier: T {y, h, w, out, beta, th, ops:[{t:'door'|'win', x, w, top, sill, lattice, lobes, curtain}],
//                         rich, floor (draw the built room's floor: tier 0), band, well {x0, x1, z0, z1} (a stairwell left in its roof)}
//   gzTeaBoard / gzCarpet / gzBolster / gzBedShelf / gzMaskRack / gzSeat   the Glaziers' own pieces, drawn (the catalog culture
//                         file is owed: KNOWN_ISSUES.md): the low tea board with celadon, a Xanadui carpet, bolsters, a carved bed
//                         shelf, the wax-cloth mask rack with the potch knives, the steward's carved seat with its opal boss
//   gz-cell, gz-front, gz-house   the homes, poor to rich
function gzTier(T,C){const y=(T.y==null?0:T.y),h=T.h,w=T.w,out=T.out,beta=T.beta==null?.07:T.beta,th=T.th==null?.5:T.th,hw=w/2,wc=gzCol('wash',C),ztop=gzFaceZ(out,y+h,y,beta);
 const ops=(T.ops||[]).map(o=>({x:o.x,w:o.w,y0:o.t==='door'?y:y+o.sill,y1:y+o.top}));
 gzWall(-hw,hw,y,y+h,out,th,beta,ops,'wash',wc);
 /* the side walls back to the rock face, a little into it */
 for(const s of [-1,1])box('wash',s*(hw-th/2),y,(ztop-th-.3)/2,th,h,ztop-th+.3,wc);
 /* the roof: the terrace above, whitewashed on its edge; the parapet band of alecap purple round the front and the sides */
 const rz=ztop+.08;
 if(T.well){const q=T.well,Z0=-.3,Z1=rz,X0=-hw-.02,X1=hw+.02,slab=(x0,x1,z0,z1)=>{if(x1-x0>.02&&z1-z0>.02)box('wash',(x0+x1)/2,y+h-.05,(z0+z1)/2,x1-x0,.24,z1-z0,wc);};
  slab(X0,X1,Z0,q.z0);slab(X0,X1,q.z1,Z1);slab(X0,q.x0,q.z0,q.z1);slab(q.x1,X1,q.z0,q.z1);}
 else box('wash',0,y+h-.05,(rz-.3)/2,w+.04,.24,rz+.3,wc);
 if(T.parapet!==false){const pc=gzCol('alecap',C),ph=T.parapetH==null?.5:T.parapetH;box('paint',0,y+h+.18,rz-.16,w+.06,ph,.34,pc);for(const s of [-1,1])box('paint',s*(hw-.15),y+h+.18,(rz-.3)/2,.32,ph,rz-.3,pc);
  /* the parapet's white coping */
  box('wash',0,y+h+.18+ph,rz-.16,w+.1,.06,.4,wc);}
 if(T.band!==false)gzBand(-hw+.15,hw-.15,y+h-.62,gzFaceZ(out,y+h-.42,y,beta)+.02,.38,C,{gilt:!!T.rich});
 if(T.floor)box('wash',0,y,(out-.1)/2,w-2*th+.02,.05,out-.1,gzCol('washOld',C));
 for(const o of T.ops||[]){if(o.t==='door')gzDoor(o.x,o.top,o.w,out,th,y,beta,C,{lobes:o.lobes,gilt:T.rich,curtain:o.curtain,lamp:o.lamp,lampSide:o.lampSide,name:o.name});
  else gzWin(o.x,y+o.sill,y+o.top,o.w,out,th,y,beta,C,{lattice:o.lattice,lobes:o.lobes,frame:o.frame});}
 return {ztop,rz,hw,y1:y+h};}
/* ---------------------------------------------------------------- the drawn pieces */
/* the low tea board (glazier_common_tea_board): 1.2 x .6 x .35, carved timber, celadon bowls and a pot on it */
function gzTeaBoard(x,z,ry,C,o){o=o||{};if(!gzKeep(C,Math.round(x*19+z*23),.5))return;const tc=gzCol('timber',C),cc=gzCol('celadon',C),L=(o.L==null?1.2:o.L),D=(o.D==null?.6:o.D);
 W(x,0,z,(ry==null?0:ry),()=>{box('carved',0,.27,0,L,.06,D,tc);for(const sx of [-1,1])for(const sz of [-1,1])box('carved',sx*(L/2-.08),.05,sz*(D/2-.08),.08,.22,.08,tc);
  if(C.aband)return;lathe('celadon',0,0,[[0,.33],[.07,.34],[.09,.38],[.07,.45],[.03,.48],[.035,.5]],10,cc);
  const n=o.bowls==null?4:o.bowls;for(let k=0;k<n;k++){const a=k*TAU/n;lathe('celadon',Math.cos(a)*.3*L/1.2,Math.sin(a)*.18,[[0,.33],[.035,.335],[.05,.37],[.052,.385]],8,cc);}});}
/* a Xanadui carpet on the floor (glazier_common_carpet): its field, a border, a medallion */
function gzCarpet(x,z,w,d,C,o){o=o||{};if(C.aband&&!gzKeep(C,Math.round(x*7+z*29),.3))return;const fc=gzCol(o.col||'carpetR',C),bc=gzCol(o.border||'indigo',C);
 W(x,.05,z,(o.ry==null?0:o.ry),()=>{box('carpet',0,0,0,w,.02,d,fc);for(const s of [-1,1]){box('plain',0,.02,s*(d/2-.09),w-.04,.004,.12,bc);box('plain',s*(w/2-.09),.02,0,.12,.004,d-.04,bc);}
  quad('plain',0,.025,0,Math.min(w,d)*.32,Math.min(w,d)*.32,gzCol('saffron',C),0,-PI/2,PI/4);});}
/* a bolster (a round cushion) along the wall: length L at (x, z), yaw ry */
function gzBolster(x,z,L,ry,C,col){if(!gzKeep(C,Math.round(x*41+z*3),.4))return;W(x,.05,z,(ry==null?0:ry),()=>{WX(0,.14,0,0,0,PI/2,()=>cyl('silk',0,-L/2,0,.13,L,gzCol(col||'saffron',C),10));box('silk',0,0,.25,L,.1,.5,gzCol(col||'saffron',C).clone().multiplyScalar(.85));});}
/* a carved bed shelf against a wall: a plinth of hewn rock .45 high, a felt and a quilt on it (x, z its centre, w along the wall) */
function gzBedShelf(x,z,w,d,ry,C){W(x,0,z,(ry==null?0:ry),()=>{box('hewn',0,0,0,w,.45,d,gzCol('rock',C));if(C.aband)return;box('silk',0,.45,0,w-.1,.08,d-.08,gzCol('indigo',C));box('silk',-w/2+.35,.53,0,.5,.1,d-.2,gzCol('wash',C));});}
/* the mask rack (glazier_common_mask_rack): a carved board of pegs, wax-cloth dust masks, the lamps, the potch knives */
function gzMaskRack(x,z,ry,C){if(!gzKeep(C,Math.round(x*37+z*11),.35))return;const tc=gzCol('timber',C);W(x,0,z,(ry==null?0:ry),()=>{box('carved',0,.5,0,1.2,1.2,.05,tc);
 for(let k=0;k<4;k++){const px=-.45+k*.3;beam('carved',[px,1.45,0],[px,1.45,.12],.015,tc);if(!C.aband)box('silk',px,1.18,.08,.18,.22,.04,gzCol('potch',C),0,.1);}
 for(let k=0;k<3;k++){const px=-.3+k*.3;box('iron',px,.75,.04,.025,.22,.01,P('iron'));box('carved',px,.67,.04,.04,.09,.03,tc);}});}
/* the steward's seat (glazier_court_steward_seat): a carved stone seat, whitewashed and gilt, an opal boss on its back */
function gzSeat(x,z,ry,C){W(x,0,z,(ry==null?0:ry),()=>{const wc=gzCol('wash',C),gc=C.aband?gzCol('brassC',C):P('gilt');box('wash',0,0,0,1,.45,.8,wc);box('wash',0,.45,-.32,1,1.15,.16,wc);
 for(const s of [-1,1])box('wash',s*.44,.45,0,.12,.3,.7,wc);box('gilt',0,1.6,-.32,1.04,.05,.2,gc);for(const s of [-1,1])box('gilt',s*.5,.45,-.32,.03,1.15,.18,gc);
 if(!C.aband)ellip('potch',0,1.2,-.22,.1,.13,.05,hc(0xd8c8e8),0,10);if(!C.aband)box('silk',0,.45,.02,.9,.08,.7,gzCol('carpetR',C));});}
/* ---------------------------------------------------------------- THE HOMES */
/* gz-cell: one tier and a door; one carved room (hewn, or plastered by seed) and a store niche to one side */
TG.gz.PLANS['gz-cell']=function(o){const k='gz-cell',v=o.v,u=gzU(k,v,1),rw=3.2+.7*u,rd=3.1+.5*gzU(k,v,2),side=gzU(k,v,3)<.5?-1:1,dx=(gzU(k,v,4)-.5)*.8;
 const fin=gzU(k,v,5)<.45?'plaster':'hewn',rz=-(1+rd/2),nx=side*(rw/2+.85+.6),nz=rz-rd/2+.75;
 const R=gzRoom('room',0,rz,rw,rd,0,{finish:fin,use:'hearth',doors:[{side:'s',at:dx,w:.95},{side:side<0?'w':'e',at:nz-rz,w:.8}]});
 const S=gzRoom('store',nx,nz,1.2,1.3,0,{finish:'hewn',use:'store',h:2,rise:.3,doors:[{side:side<0?'e':'w',at:0,w:.8}]});
 return {voids:[gzPass('door',dx,-1.1,.4,.95,0),R,gzPass('to-store',nz,side*rw/2-side*.05,side*(rw/2+.9),.8,0,{ax:'x'}),S],dx,side,room:R,store:S,fw:4.2+.8*gzU(k,v,6)};};
defBuilding({key:'gz-cell',name:'A Glazier cell (one tier and a door)',seed:9401,cut:true,w:8.4,d:7,h:4.4,front:{x:0,z:1.3},budget:6500,
 tags:{culture:'glazier',types:['dwelling-single'],wealth:'poor',style:'carved',role:'home'},note:TG.gz.BOX['gz-cell'].what,
 build(o){const C=gzCx(o),PL=TG.gz.plan('gz-cell',o),R=PL.room,win=gzU('gz-cell',C.v,7)<.7,fw=PL.fw;
  gzTier({y:0,h:3.3,w:fw,out:1.25,th:.42,floor:true,ops:[{t:'door',x:PL.dx,w:.95,top:1.95,curtain:gzU('gz-cell',C.v,8)<.5?'indigo':null,lamp:'red',lampSide:PL.dx>0?-1:1}].concat(win?[{t:'win',x:PL.dx>0?-fw/2+.85:fw/2-.85,w:.45,sill:1.1,top:1.75}]:[])},C);
  gzRooms(PL,C);
  /* inside: the bed shelf on the back wall, the tea board, the wax lamp's niche, the mask rack by the door */
  gzBedShelf(R.x,R.z-R.d/2+.5,Math.min(2,R.w-.6),.9,0,C);gzTeaBoard(R.x+.3,R.z+.4,0,C,{bowls:2,L:.9,D:.5});
  gzMaskRack(R.x-PL.side*(R.w/2-.08),R.z+.6,PL.side>0?PI/2:-PI/2,C);gzLight('wax',R.x+PL.side*(R.w/2-.2),1.4,R.z-.4,C);
  gzFurn('generic_storage_jar',PL.store.x,null,PL.store.z-.25,0,{v:0},C);gzFurn('generic_sack',PL.store.x,null,PL.store.z+.3,0,{v:C.v&1},C);
  /* outside: a moonglass lantern by the door; the worn state's rubble */
  gzLantern(PL.dx+(PL.dx>0?.75:-.75),1.4,1.5,C);if(C.worn)fgRubble(0,1.5,3,{gl:()=>0,worn:true,v:C.v});}});
/* gz-front: two tiers; the hearth room, the sleeping room and the store behind tier one; a steep stair up to the upper room behind
   tier two, which opens on the terrace */
TG.gz.PLANS['gz-front']=function(o){const k='gz-front',v=o.v,flip=gzU(k,v,1)<.5?-1:1,hw=4.6,Hd=3.6+.5*gzU(k,v,2),Hz=-(1+Hd/2),Hx=-1.4*flip,Hw=4.2,Sx=3*flip,Sw=2.6,Sd=3;
 const H=gzRoom('hearth',Hx,Hz,Hw,Hd,0,{finish:'plaster',use:'hearth',doors:[{side:'s',at:0,w:1.2},{side:flip>0?'e':'w',at:0,w:.8},{side:'n',at:0,w:.8}]});
 const S=gzRoom('sleep',Sx,Hz,Sw,Sd,0,{finish:'plaster',use:'sleep',doors:[{side:flip>0?'w':'e',at:0,w:.8}]});
 const T=gzRoom('store',Hx,Hz-Hd/2-1-.9,2.4,1.8,0,{finish:'hewn',use:'store',h:2.1,rise:.3,doors:[{side:'s',at:0,w:.8}]});
 const stx=Hx-flip*(Hw/2-.55),U=gzRoom('upper',Hx+flip*.2,Hz,Hw+.4,Hd,3.4,{finish:'plaster',use:'sleep',doors:[{side:'s',at:-flip*.2,w:1}]});
 return {voids:[gzPass('door',Hx,-1.1,.4,1.2,0),H,gzPass('h-s',Hz,Hx+flip*Hw/2-flip*.05,Sx-flip*Sw/2+flip*.05,.8,0,{ax:'x'}),S,gzPass('h-t',Hx,Hz-Hd/2+.05,T.z+T.d/2-.05,.8,0),T,
  gzStairV('stair',[stx,0,-1.45],[stx,3.4,Hz-Hd/2+.6],.85),U,gzPass('up-door',Hx,-1.1,.4,1,3.4)],flip,H,S,T,U,stx,hw};};
defBuilding({key:'gz-front',name:'A Glazier household\'s front (two tiers)',seed:9402,cut:true,w:9.6,d:12,h:8,front:{x:0,z:2.6},budget:14000,
 tags:{culture:'glazier',types:['dwelling-single'],wealth:'middle',style:'carved',role:'home'},note:TG.gz.BOX['gz-front'].what,
 build(o){const C=gzCx(o),k='gz-front',PL=TG.gz.plan(k,o),f=PL.flip,H=PL.H,S=PL.S,U=PL.U,w1=8.8+.6*gzU(k,C.v,3),w2=6.6+.8*gzU(k,C.v,4),dx=(gzU(k,C.v,5)-.5)*1.6;
  /* tier one: the door (offset by seed), a window each side; tier two: three windows and the door out on the terrace */
  gzTier({y:0,h:3.4,w:w1,out:2.55,floor:true,ops:[{t:'door',x:dx,w:1,top:2,lamp:'red'},{t:'win',x:-w1/2+1.3,w:.6,sill:1.05,top:2.05},{t:'win',x:w1/2-1.3,w:.6,sill:1.05,top:2.05}]},C);
  const ux=PL.U.x,T2=gzTier({y:3.4,h:3.4,w:w2,out:1.3,ops:[{t:'door',x:ux-f*.2,w:.9,top:1.95,curtain:'teal'},{t:'win',x:-w2/2+.9,w:.55,sill:1,top:2},{t:'win',x:w2/2-.9,w:.55,sill:1,top:2}]},C);
  /* the built front room of tier one: a bench along the face and the household's moonglass lanterns; the terrace's cushions */
  box('wash',0,0,.5,w1-1.4,.42,.45,gzCol('washOld',C));gzLantern(dx+.9,1.5,2.9,C);gzLantern(-w1/2+1.3,2.2,1.7,C,{hang:.4});
  gzRooms(PL,C);
  /* the steep stair up (timber), its well in the vault */
  svStair(PL.stx,-1.45,0,3.4,PI,{mk:'carved',col:gzCol('timber',C),w:.8,riser:.25,going:.19,rail:f>0?'left':'right'});
  /* the hearth room: a drum stove under a smoke hood, the tea board on its carpet, bolsters; the sleeping room's box beds */
  gzFurn('tungang_poor_drum_stove',H.x-f*(H.w/2-.6)+f*1.6,null,H.z-H.d/2+.55,0,{v:0},C);gzCarpet(H.x+f*.6,H.z+.3,2.2,1.6,C);gzTeaBoard(H.x+f*.6,H.z+.3,0,C);
  gzBolster(H.x+f*.6,H.z-.6,1.6,0,C,'saffron');gzMaskRack(H.x+f*(H.w/2-.1),H.z+H.d/2-.9,-f*PI/2,C);gzLight('wax',H.x,2.1,H.z-H.d/2+.15,C);
  gzFurn('tungang_common_box_bed',S.x,null,S.z-S.d/2+.55,0,{v:C.v&1},C);gzFurn('generic_chest',S.x+.6,null,S.z+.8,PI,{v:0},C);
  gzFurn('generic_sack',PL.T.x-.5,null,PL.T.z,0,{v:0},C);gzFurn('generic_storage_jar',PL.T.x+.5,null,PL.T.z,0,{v:1},C);
  /* the upper room: beds on carved shelves, a carpet, a lantern; the terrace before it */
  W(0,3.4,0,0,()=>{gzBedShelf(U.x,U.z-U.d/2+.5,2.2,.9,0,C);gzCarpet(U.x,U.z+.4,2,1.4,C,{col:'carpetB',border:'carpetR'});gzBolster(-w1/2+1.4,1.9,1.2,0,C,'teal');gzBolster(w1/2-1.4,1.9,1.2,0,C,'rose');});
  gzLantern(ux+f*1.2,3.4+1.8,1.45,C,{hang:.3});
  if(C.worn)fgRubble(dx*.5,2.8,4,{gl:()=>0,worn:true,v:C.v});}});
/* gz-house: three or four tiers; the reception room (polished, carpets, tea) with the kitchen and the store beside it; the family
   rooms over it; the shrine room at the third level with its click wheel and opal boss; on four tiers a top room under the gilt
   finial. A lattice bay (the Xanadui jharokha) on tier two, gilt on the arches and bands, the eight-spoked wheel over the door */
TG.gz.PLANS['gz-house']=function(o){const k='gz-house',v=o.v,n=gzU(k,v,1)<.5?3:4,V=[];
 const R=gzRoom('reception',0,-3.6,6.4,5,0,{finish:'polished',use:'reception',h:2.8,rise:.6,doors:[{side:'s',at:0,w:1.6},{side:'w',at:0,w:.9},{side:'e',at:0,w:.9}]});
 const K=gzRoom('kitchen',-5.4,-3.6,2.8,3.2,0,{finish:'hewn',use:'kitchen',doors:[{side:'e',at:0,w:.9}]}),St=gzRoom('store',5.4,-3.6,2.8,3.2,0,{finish:'hewn',use:'store',doors:[{side:'w',at:0,w:.9}]});
 V.push(gzPass('door',0,-1.15,.4,1.6,0),R,gzPass('r-k',-3.6,-3.25,-4.05,.9,0,{ax:'x'}),K,gzPass('r-s',-3.6,3.25,4.05,.9,0,{ax:'x'}),St);
 const F1=gzRoom('family-w',-2.6,-3.1,4.2,4,3.4,{finish:'plaster',use:'sleep',doors:[{side:'s',at:0,w:1}]}),F2=gzRoom('family-e',2.6,-3.1,4.2,4,3.4,{finish:'plaster',use:'sleep',doors:[{side:'s',at:0,w:1}]});
 V.push(gzStairV('stair-1',[2.5,0,-1.55],[2.5,3.4,-4.4],.9),F1,F2,gzPass('f1-door',-2.6,-1.15,.4,1,3.4),gzPass('f2-door',2.6,-1.15,.4,1,3.4));
 const Sh=gzRoom('shrine',-1.5,-3.1,5,4,6.8,{finish:'polished',use:'shrine',h:2.5,ceil:'dome',rise:.6,doors:[{side:'s',at:1.5,w:1}]});
 V.push(gzStairV('stair-2',[-3.2,3.4,-1.55],[-3.2,6.8,-4.4],.9),Sh,gzPass('sh-door',0,-1.15,.4,1,6.8));
 let Tp=null;if(n===4){Tp=gzRoom('top',.6,-2.8,3.6,3.2,10.2,{finish:'plaster',use:'sleep',doors:[{side:'s',at:-.6,w:.9}]});V.push(gzStairV('stair-3',[.6,6.8,-1.55],[.6,10.2,-4.2],.85),Tp,gzPass('top-door',0,-1.15,.4,.9,10.2));}
 return {voids:V,n,R,K,St,F1,F2,Sh,Tp};};
defBuilding({key:'gz-house',name:'A rich Glazier house (three or four tiers)',seed:9403,cut:true,w:14.6,d:16.6,h:15.6,front:{x:0,z:3.4},budget:30000,
 tags:{culture:'glazier',types:['dwelling-single'],wealth:'rich',style:'carved',role:'home'},note:TG.gz.BOX['gz-house'].what,
 build(o){const C=gzCx(o),k='gz-house',PL=TG.gz.plan(k,o),n=PL.n,W0=[14,12,10,7.2],OUT=[3.35,2.4,1.45,.7],rich=true;let top=null;
  for(let t=0;t<n;t++){const y=t*3.4,w=W0[t],out=OUT[t],ops=[];
   if(t===0){ops.push({t:'door',x:0,w:1.5,top:2.15,lobes:5,lamp:'red'});for(const x of [-4.8,-2.6,2.6,4.8])ops.push({t:'win',x,w:.7,sill:1,top:2.1,lobes:5});}
   else if(t===1){ops.push({t:'door',x:-2.6,w:.9,top:1.95,curtain:'rose'},{t:'door',x:2.6,w:.9,top:1.95,curtain:'teal'});for(const x of [-4.6,4.6])ops.push({t:'win',x,w:.6,sill:1,top:2,lobes:5});}
   else if(t===2){ops.push({t:'door',x:0,w:.95,top:1.95,curtain:'saffron'});for(const x of [-3.4,-1.8,1.8,3.4])ops.push({t:'win',x,w:.55,sill:1,top:2,lobes:5,lattice:true});}
   else{ops.push({t:'door',x:0,w:.85,top:1.9,curtain:'rose'});for(const x of [-2.3,2.3])ops.push({t:'win',x,w:.5,sill:1,top:1.95,lattice:true});}
   top=gzTier({y,h:3.4,w,out,rich,floor:t===0,ops},C);}
  /* the eight-spoked wheel on tier one's parapet over the door; the gilt finial (a ganjira-like spire) on the roof */
  gzWheel8(0,3.4+.62,gzFaceZ(OUT[0],3.4,0,.07)+.16,.38,C);
  const ry=n*3.4,fz=OUT[n-1]*.4;W(0,ry+.68,fz,0,()=>{const gc=C.aband?gzCol('brassC',C):P('gilt');cyl('gilt',0,0,0,.28,.25,gc,10);lathe('gilt',0,0,[[.24,.25],[.3,.45],[.18,.75],[.08,1.05],[.03,1.25]],10,gc);});
  /* the lattice bay on tier two, centred: a projecting box of carved timber, lattice panes on three sides, a small gilt canopy */
  if(!C.aband||gzU(k,C.v,9)<.5)W(0,3.4+.9,OUT[1]+.35,0,()=>{const tc=gzCol('timber',C);box('carved',0,-.15,0,1.9,.15,.8,tc);box('carved',0,1.6,0,2.1,.12,.95,tc);
   for(const [x,z,w,ry2] of [[0,.38,1.8,0],[-.92,0,.7,PI/2],[.92,0,.7,PI/2]]){W(x,0,z,ry2,()=>{for(let i=0;i<=8;i++)box('carved',-w/2+w*i/8,0,0,.025,1.6,.03,tc);for(let j=1;j<10;j++)box('carved',0,j*.16,0,w,.02,.03,tc);if(!C.aband)box('potch',0,.05,-.03,w-.04,1.5,.01,P('potch'));});}
   cone('gilt',0,1.72,0,.3,.35,C.aband?gzCol('brassC',C):P('gilt'),8);});
  gzRooms(PL,C);
  const R=PL.R,K=PL.K,St=PL.St,F1=PL.F1,F2=PL.F2,Sh=PL.Sh;
  svStair(2.5,-1.55,0,3.4,PI,{mk:'carved',col:gzCol('timber',C),w:.85,riser:.25,going:.19,rail:'left'});
  W(0,3.4,0,0,()=>svStair(-3.2,-1.55,0,3.4,PI,{mk:'carved',col:gzCol('timber',C),w:.85,riser:.25,going:.19,rail:'right'}));
  if(PL.Tp)W(0,6.8,0,0,()=>svStair(.6,-1.55,0,3.4,PI,{mk:'carved',col:gzCol('timber',C),w:.8,riser:.25,going:.19,rail:'left'}));
  /* the reception room: two carpets, the bolsters round them, the tea board and its celadon, the tea copper, lanterns hung */
  /* (the stair up takes the room's east side, x 2.05 to 2.95) */
  gzCarpet(R.x-1.6,R.z+.2,2.6,3.4,C);gzCarpet(R.x+.7,R.z+.2,2,3.2,C,{col:'carpetB',border:'carpetR'});gzTeaBoard(R.x-.4,R.z+.2,0,C);
  gzBolster(R.x-.6,R.z-R.d/2+.35,3.6,0,C,'saffron');gzBolster(R.x-R.w/2+.35,R.z+.2,2.6,PI/2,C,'rose');
  gzFurn('xanadu_common_tea_copper',R.x-R.w/2+.6,null,R.z-R.d/2+.6,0,{v:0},C);gzBrass(R.x-1.6,1.9,R.z,C,{hang:2.75});gzLantern(R.x+1.6,1.9,R.z,C,{hang:.6});
  gzFurn('tungang_poor_drum_stove',K.x,null,K.z-K.d/2+.55,0,{v:0},C);gzFurn('generic_tea_set',K.x+.8,null,K.z+.6,0,{v:0},C);gzFurn('generic_storage_jar',K.x-.8,null,K.z+.6,0,{v:2},C);
  gzFurn('xanadu_court_strongbox',St.x,null,St.z-St.d/2+.5,0,{v:0},C);gzFurn('generic_sack',St.x-.7,null,St.z+.5,0,{v:1},C);gzFurn('generic_chest',St.x+.7,null,St.z+.5,PI,{v:0},C);
  /* the family rooms: each a box bed against the wall away from its stair, a carpet toward the front, a lantern */
  W(0,3.4,0,0,()=>{for(const F of [F1,F2]){const s=F===F1?1:-1;if(gzKeep(C,60+s,.5))fgFurnSide('tungang_common_box_bed',s,F.x+s*F.w/2,F.z-.7,{v:0},.05);
   gzCarpet(F.x+s*.3,F.z+1.1,1.6,1.2,C,{col:F===F1?'carpetB':'carpetR'});gzLantern(F.x+s*.4,1.7,F.z+.9,C);}});
  /* the shrine room: the household's click wheel, the opal boss on its altar shelf, butter lamps, a carpet */
  W(0,6.8,0,0,()=>{gzClick(Sh.x,0,Sh.z,.32,.85,C,{col:'carpetR',chips:12});box('wash',Sh.x,0,Sh.z-Sh.d/2+.35,2.4,.85,.5,gzCol('wash',C));
   if(!C.aband)ellip('potch',Sh.x,1.02,Sh.z-Sh.d/2+.35,.16,.16,.1,hc(0xd8c8e8),0,12);box('gilt',Sh.x,.85,Sh.z-Sh.d/2+.35,2.44,.04,.54,C.aband?gzCol('brassC',C):P('gilt'));
   gzFurn('xanadu_common_butter_lamp_rack',Sh.x+1.6,null,Sh.z-Sh.d/2+.4,0,{v:0},C);gzCarpet(Sh.x,Sh.z+.9,2.4,1.2,C,{col:'carpetB'});gzLight('wax',Sh.x-1.2,1.1,Sh.z-Sh.d/2+.4,C);
   if(PL.Tp){const T=PL.Tp;W(0,3.4,0,0,()=>{gzBedShelf(T.x,T.z-T.d/2+.5,2,.9,0,C);gzLantern(T.x+1,1.6,T.z+.4,C);});}});
  /* outside: the click wheel and lanterns by the door */
  gzClick(1.6,0,OUT[0]+.55,.22,.6,C,{chips:8});gzLantern(-1.3,1.6,OUT[0]+.35,C,{hang:.3});gzLantern(1.3,1.6,OUT[0]+.35,C,{hang:.3});
  if(C.worn)fgRubble(0,OUT[0]+.4,6,{gl:()=>0,worn:true,v:C.v});}});
