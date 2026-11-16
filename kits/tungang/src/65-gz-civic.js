// prefix: gz
// ================================================================= THE GLAZIERS' SET: THE LOJ'S CIVIC ROOMS (PLAN.md 1.4, 3.4)
//   gz-tea-hall        the loj's meeting hall (the loj hall: the one room over 8 m): the benches down the west wall, the low count
//                      lamps behind them and the ruled count wall opposite (the show of hands read by its shadows), the steward's
//                      carved seat on its dais, the timetable of the train that never comes (gilt), the banner, carpets, bolsters
//                      and celadon round the brass tea urn, the guest benches for monks and the factors' clerks; three tiers of
//                      front, the guest gallery in the second
//   gz-register-room   the Register of the Veins: every adit and vein numbered like a station on the Line, on enamel plaques in
//                      the Order's blue; the claim book on its lectern; the Sultan's Fifth counted in cut stones; the seal
//   gz-monks-house     the herbalist-monks' house in the hold: the reading room, the pigment mill grinding opal spoil to the
//                      manuscripts' white and blue, a cell, the Order's blue on the bands
//   gz-wheel-walk      the click wheels in a rock-cut niche row along the ledge to the loj hall, under a carved eave
/* the brass tea urn (glazier_common_tea_urn): on its stand, the tea hall's centre */
function gzUrn(x,z,C){const bc=gzCol('brassC',C);W(x,0,z,0,()=>{for(let k=0;k<3;k++){const a=k*TAU/3;beam('brass',[Math.cos(a)*.22,0,Math.sin(a)*.22],[Math.cos(a)*.12,.4,Math.sin(a)*.12],.025,bc);}
 lathe('brass',0,0,[[.05,.4],[.2,.45],[.25,.6],[.24,.8],[.15,.92],[.12,1],[.16,1.04],[.06,1.12],[.02,1.18]],12,bc);beam('brass',[.24,.55,0],[.36,.5,0],.02,bc);
 if(!C.aband)ellip('glow',0,.42,0,.08,.03,.08,hc(0xff7a2a),0,6);});if(!C.aband)gzLight('wax',x,.45,z,C,{halo:false});}
/* a plaque of the Register (glazier_court_register_plaque): enamel in the Order's blue, a gilt edge, its number in white */
function gzPlaque(num,x,y,z,ry,C,o){o=o||{};const w=(o.w==null?.3:o.w),h=(o.h==null?.4:o.h);W(x,y,z,(ry==null?0:ry),()=>{box('enamel',0,0,0,w,h,.025,gzCol('orderBlue',C));
 if(!C.aband||o.keepGilt)for(const s of [-1,1]){box('gilt',0,s>0?h-.012:0,.006,w+.02,.014,.03,P('gilt'));box('gilt',s*(w/2),0,.006,.014,h,.03,P('gilt'));}
 const t=String(num);fgText(t,0,h*.35,.016,0,Math.min(h*.36,w*1.2/(t.length*.8+.2)),P('white'));});fgNote('plaques');}
defBuilding({key:'gz-tea-hall',name:'The tea hall (the loj\'s meeting hall)',seed:9411,cut:true,w:16.6,d:21,h:13,front:{x:0,z:4},budget:42000,
 tags:{culture:'glazier',types:['civic'],wealth:'middle',style:'carved',role:'civic',job:'trading'},note:TG.gz.BOX['gz-tea-hall'].what,
 build(o){const C=gzCx(o),k='gz-tea-hall',PL=TG.gz.plan(k,o),Hl=PL.hall,O=[3.95,2.6,1.3],W0=[16,13,9.6],H0=[4.4,3.4,3];
  /* the front: a tall first tier with the great door (five lobes, gilt) and four windows; the guest gallery's tier (its stair up
     from the first tier's east end, through a well in its roof); the bell loggia's tier under the gilt finial */
  gzTier({y:0,h:H0[0],w:W0[0],out:O[0],floor:true,rich:true,well:{x0:5.6,x1:7.3,z0:.4,z1:3.3},ops:[{t:'door',x:0,w:2,top:2.9,lobes:5,lamp:'green',name:'the hall\'s great door'},
   {t:'win',x:-5.6,w:.8,sill:1.2,top:2.9,lobes:5},{t:'win',x:-3.2,w:.8,sill:1.2,top:2.9,lobes:5},{t:'win',x:3.2,w:.8,sill:1.2,top:2.9,lobes:5},{t:'win',x:5.6,w:.8,sill:1.2,top:2.9,lobes:5}]},C);
  gzTier({y:H0[0],h:H0[1],w:W0[1],out:O[1],rich:true,ops:[-4.8,-2.4,0,2.4,4.8].map(x=>({t:'win',x,w:.75,sill:.6,top:2.1,lobes:5,lattice:Math.abs(x)<1}))},C);
  gzTier({y:H0[0]+H0[1],h:H0[2],w:W0[2],out:O[2],rich:true,ops:[-2.6,0,2.6].map(x=>({t:'win',x,w:.9,sill:.5,top:2,lobes:3}))},C);
  const yTop=H0[0]+H0[1]+H0[2];gzWheel8(0,H0[0]+.62,gzFaceZ(O[0],H0[0],0,.07)+.16,.5,C);
  W(0,yTop+.68,O[2]*.4,0,()=>{const gc=C.aband?gzCol('brassC',C):P('gilt');lathe('gilt',0,0,[[.3,0],[.36,.25],[.22,.6],[.1,.9],[.04,1.1]],10,gc);});
  svStair(6.45,2.6,0,H0[0],PI,{style:'ladder',mk:'carved',col:gzCol('timber',C),w:.7});
  /* the guest gallery (tier two's built room): low benches along its face, cushions, a lantern; the bell in the top loggia */
  W(0,H0[0],0,0,()=>{for(const x of [-3.6,0,3.6])box('wash',x,0,.45,2.6,.42,.5,gzCol('washOld',C));gzBolster(-3.6,.95,2.2,0,C,'teal');gzBolster(3.6,.95,2.2,0,C,'rose');gzLantern(0,1.9,1.2,C,{hang:.6});});
  W(0,H0[0]+H0[1],0,0,()=>{beam('carved',[-.9,2.4,.6],[.9,2.4,.6],.06,gzCol('timber',C));if(!C.aband)lathe('brass',0,.6,[[.02,1.9],[.18,2],[.26,2.2],[.24,2.36],[.04,2.4]],12,gzCol('brassC',C));});
  gzRooms(PL,C);
  /* the hall: the steward's seat on the dais at the back, the timetable (gilt-framed) and the banner either side of it */
  const zb=Hl.z-Hl.d/2,zf=Hl.z+Hl.d/2,xw=Hl.x-Hl.w/2,xe=Hl.x+Hl.w/2;
  box('wash',Hl.x,0,zb+1,4.4,.3,1.7,gzCol('wash',C));gzSeat(Hl.x,zb+.75,0,C);gzCarpet(Hl.x,zb+2.4,3.2,1.4,C,{col:'carpetR'});
  gzFurn('tungang_common_timetable',Hl.x+3.2,null,zb+.2,0,{v:0},C);if(!C.aband)for(const s of [-1,1])box('gilt',Hl.x+3.2+s*1.0,.05,zb+.12,.06,1.9,.06,P('gilt'));
  gzFurn('tungang_court_banner',Hl.x-3.2,null,zb+.25,0,{v:0},C);fgNote('timetable');
  /* the west benches, in two rows facing east; behind them the low row of count lamps; the ruled count wall on the east wall */
  const bd=fgDim('tungang_court_meeting_bench'),bl=Math.max(1.2,bd.w+.2),nB=Math.max(2,Math.floor((Hl.d-3.6)/bl));
  for(let i=0;i<nB;i++){const z=zb+2.4+(i+.5)*bl;gzFurn('tungang_court_meeting_bench',xw+1.35,null,z,PI/2,{v:i&1},C);gzFurn('tungang_court_meeting_bench',xw+2.6,null,z,PI/2,{v:(i+1)&1},C);fgNote('benches',2);}
  box('hewn',xw+.35,0,(zb+zf)/2,.4,.35,Hl.d-1.6,gzCol('rock',C));
  for(let i=0;i<8;i++){const z=zb+1.4+i*(Hl.d-2.8)/7;ellip(C.aband?'glass':'glow',xw+.35,.42,z,.05,.07,.05,C.aband?hc(0x2a2624):hc(0xffd9a0),0,6);if(i%2===0)gzLight('wax',xw+.35,.45,z,C,{halo:i%4===0});fgNote('countLamps');}
  W(xe-.06,0,(zb+zf)/2,-PI/2,()=>{const L=Hl.d-2.4,lc=gzCol('wash',C),ink=gzCol(C.aband?'washOld':'indigo',C);box('wash',0,.3,0,L,2.7,.04,lc);
   for(let j=0;j<=10;j++)box('plain',0,.35+j*.26,.025,L-.1,.012,.006,ink);for(let i=0;i<=12;i++)box('plain',-L/2+.05+i*(L-.1)/12,.35,.025,.012,2.6,.006,ink);});fgSet('countWall',1);
  /* the tea: the brass urn at the centre on a carpet, tea boards and bolsters round it; the guest benches for the monks and the
     factors' clerks by the door, on the east side, a carpet before them */
  gzCarpet(Hl.x+.8,Hl.z,4,3.2,C,{col:'carpetB',border:'carpetR'});gzUrn(Hl.x+.8,Hl.z,C);gzTeaBoard(Hl.x-.8,Hl.z+1.1,0,C,{bowls:6});gzTeaBoard(Hl.x+2.6,Hl.z-1,PI/2,C,{bowls:4});
  gzBolster(Hl.x+.8,Hl.z-1.85,3.4,0,C,'saffron');gzBolster(Hl.x+.8,Hl.z+1.85,3.4,PI,C,'teal');
  for(const z of [zf-1.4,zf-3])box('wash',xe-1.2,0,z,1.6,.42,.55,gzCol('washOld',C));gzBolster(xe-1.4,zf-2.2,2.6,-PI/2,C,'rose');gzFurn('xanadu_common_meditation_cushion',xe-2.4,null,zf-2.2,0,{v:0},C);
  /* the click wheel inside the door; lanterns hung from the vault, moonglass and pierced brass in turn */
  gzClick(Hl.x+1.8,0,zf-.7,.24,.65,C,{chips:10});
  [[-3,-2.5],[3,-2.5],[-3,2.5],[3,2.5]].forEach(([dx,dz],i)=>{if(i%2)gzBrass(Hl.x+dx,2.9,Hl.z+dz,C,{hang:Hl.h+.6-2.9});else gzLantern(Hl.x+dx,2.9,Hl.z+dz,C,{hang:Hl.h+.6-2.9});});
  gzFurn('xanadu_common_prayer_wheels',xw+1.6,null,zf-.7,0,{v:0},C);
  if(C.worn)fgRubble(-3,O[0]+.3,6,{gl:()=>0,worn:true,v:C.v});}});
TG.gz.PLANS['gz-tea-hall']=function(o){const hall=gzRoom('hall',0,-6.6,12,10.4,0,{finish:'polished',use:'hall',h:4.2,ceil:'vault',rise:1.4,doors:[{side:'s',at:0,w:2}]});
 return {voids:[gzPass('door',0,-1.5,.4,2,0,{h:2.8}),hall],hall};};
/* ---------------------------------------------------------------- the Register of the Veins */
TG.gz.PLANS['gz-register-room']=function(o){const k='gz-register-room',v=o.v,rd=4.6+.6*gzU(k,v,1),R=gzRoom('register',0,-(1+rd/2),6.4,rd,0,{finish:'polished',use:'register',h:2.6,rise:.55,doors:[{side:'s',at:0,w:1},{side:'n',at:1.6,w:.9}]});
 const S=gzRoom('fifth',1.6,R.z-rd/2-1-1.1,2.6,2.2,0,{finish:'hewn',use:'strongroom',h:2.2,rise:.3,doors:[{side:'s',at:0,w:.9}]});
 return {voids:[gzPass('door',0,-1.1,.4,1,0),R,gzPass('to-fifth',1.6,R.z-rd/2+.05,S.z+S.d/2-.05,.9,0),S],R,S,n:24+Math.floor(gzU(k,v,2)*24)};};
defBuilding({key:'gz-register-room',name:'The Register of the Veins',seed:9412,cut:true,w:9.4,d:11.6,h:5.4,front:{x:0,z:1.8},budget:16000,
 tags:{culture:'glazier',types:['civic'],wealth:'middle',style:'carved',role:'civic',job:'scribing'},note:TG.gz.BOX['gz-register-room'].what,
 build(o){const C=gzCx(o),k='gz-register-room',PL=TG.gz.plan(k,o),R=PL.R,S=PL.S;
  gzTier({y:0,h:3.6,w:8.4,out:1.75,floor:true,rich:true,ops:[{t:'door',x:0,w:1,top:2.05,curtain:'orderBlue',lamp:'amber'},{t:'win',x:-2.9,w:.55,sill:1.1,top:2.1},{t:'win',x:2.9,w:.55,sill:1.1,top:2.1}]},C);
  /* the Register's great plaque on the front, by the door: the hold's own number */
  gzPlaque(1+C.v,-1.45,1.1,gzFaceZ(1.75,1.5,0,.07)+.02,0,C,{w:.62,h:.86,keepGilt:true});
  gzRooms(PL,C);
  /* the walls of plaques: each adit and vein numbered like a station on the Line, in rows on the back and side walls */
  const n=PL.n,zb=R.z-R.d/2,xw=R.x-R.w/2,xe=R.x+R.w/2;let num=1;
  for(let row=0;row<3&&num<=n;row++)for(let i=0;i<11&&num<=n;i++){const x=-2.75+i*.5;if(Math.abs(x-1.6)<.55)continue;gzPlaque(num++,x,.95+row*.5,zb+.03,0,C);}
  for(const [xs,xw0] of [[-1,xw],[1,xe]])for(let row=0;row<3&&num<=n;row++)for(let i=0;i<6&&num<=n;i++)gzPlaque(num++,xw0-xs*.03,.95+row*.5,R.z-1.5+i*.5,-xs*PI/2,C);
  fgSet('register',n);
  /* the claim book on its lectern, the counting table with the trays of cut stones and the balance, the seal on its cushion */
  gzFurn('tungang_court_book_lectern',R.x-1.6,null,R.z-.6,0,{v:0},C);gzCarpet(R.x+.4,R.z+.5,3,1.8,C,{col:'carpetB'});
  W(R.x+.4,0,R.z+.5,0,()=>{const tc=gzCol('timber',C);box('carved',0,.33,0,1.6,.06,.7,tc);for(const sx of [-1,1])for(const sz of [-1,1])box('carved',sx*.72,0,sz*.28,.07,.33,.07,tc);
   if(!C.aband){const oc=SVPAL.opal;for(let t=0;t<3;t++){const tx=-.5+t*.5;box('carved',tx,.39,-.1,.36,.03,.26,tc);for(let q=0;q<7;q++)ellip('potch',tx+((q*37)%7-3)*.035,.43,-.1+((q*53)%5-2)*.035,.022,.016,.018,hc(oc[(q+t)%oc.length]),q,6);}
    /* the balance */beam('brass',[.55,.39,.15],[.55,.75,.15],.012,gzCol('brassC',C));beam('brass',[.38,.75,.15],[.72,.75,.15],.01,gzCol('brassC',C));for(const s of [-1,1])cyl('brass',.55+s*.17,.6,.15,.07,.015,gzCol('brassC',C),8);
    /* the seal */box('silk',-.6,.39,.2,.22,.06,.22,gzCol('carpetR',C));cyl('gilt',-.6,.45,.2,.04,.1,P('gilt'),8);}
   gzBolster(0,-.55,1.6,0,C,'saffron');});
  gzLantern(R.x+.4,1.9,R.z+.5,C,{hang:R.h+.4-1.9});gzBrass(R.x-1.6,1.9,R.z+.9,C,{hang:R.h+.4-1.9});
  /* the Fifth's strongroom: an iron door, the strongboxes, the chests of cut stones */
  svLeaf(S.x,0,R.z-R.d/2-.45,0,.85,1.85,{mk:'iron',col:0x8a8680,t:.06,locked:C.st==='kept',name:'the Fifth\'s strongroom door'});
  gzFurn('xanadu_court_strongbox',S.x-.6,null,S.z-.4,0,{v:0},C);gzFurn('xanadu_court_strongbox',S.x+.6,null,S.z-.4,0,{v:1},C);gzFurn('generic_chest',S.x,null,S.z+.5,PI,{v:0},C);
  gzLight('amber',S.x,1.8,S.z-S.d/2+.1,C);if(C.worn)fgRubble(1.5,1.9,3,{gl:()=>0,worn:true,v:C.v});}});
/* ---------------------------------------------------------------- the herbalist-monks' house */
TG.gz.PLANS['gz-monks-house']=function(o){const k='gz-monks-house',v=o.v,f=gzU(k,v,1)<.5?-1:1,Rr=gzRoom('reading',-1.2*f,-3.2,5,4.2,0,{finish:'plaster',use:'reading',dado:'orderBlue',doors:[{side:'s',at:0,w:1},{side:f>0?'e':'w',at:0,w:.8},{side:'n',at:0,w:.8}]});
 const M=gzRoom('mill',3.4*f,-3.2,2.6,3.4,0,{finish:'hewn',use:'mill',doors:[{side:f>0?'w':'e',at:0,w:.8}]});
 const Cl=gzRoom('cell',-1.2*f,-7.7,2.8,2.4,0,{finish:'plaster',use:'cell',dado:'orderBlue',h:2.2,rise:.3,doors:[{side:'s',at:0,w:.8}]});
 return {voids:[gzPass('door',-1.2*f,-1.15,.4,1,0),Rr,gzPass('r-m',-3.2,-1.2*f+f*2.45,3.4*f-f*1.25,.8,0,{ax:'x'}),M,gzPass('r-c',-1.2*f,-5.25,-6.45,.8,0),Cl],f,Rr,M,Cl};};
defBuilding({key:'gz-monks-house',name:'The herbalist-monks\' house',seed:9413,cut:true,w:10.4,d:13.4,h:6.4,front:{x:0,z:3},budget:16000,
 tags:{culture:'glazier',types:['religious'],wealth:'middle',style:'carved',role:'religious',job:'healing'},note:TG.gz.BOX['gz-monks-house'].what,
 build(o){const C=gzCx(o),k='gz-monks-house',PL=TG.gz.plan(k,o),f=PL.f,Rr=PL.Rr,M=PL.M,Cl=PL.Cl,blue={cols:['orderBlue','wash','saffron']};
  const T1=gzTier({y:0,h:3.3,w:9.6,out:2.5,floor:true,band:false,ops:[{t:'door',x:Rr.x,w:1,top:2,curtain:'orderBlue',lamp:'red'},{t:'win',x:Rr.x+f*2,w:.55,sill:1.1,top:2},{t:'win',x:-f*3.6,w:.55,sill:1.1,top:2}]},C);
  gzBand(-4.65,4.65,3.3-.62,gzFaceZ(2.5,2.88,0,.07)+.02,.38,C,blue);
  gzTier({y:3.3,h:2.6,w:6,out:1.2,band:false,ops:[{t:'win',x:-1.4,w:.5,sill:.8,top:1.7},{t:'win',x:1.4,w:.5,sill:.8,top:1.7}]},C);
  gzBand(-2.85,2.85,3.3+2.6-.62,gzFaceZ(1.2,3.3+2.18,3.3,.07)+.02,.38,C,blue);
  gzRooms(PL,C);
  /* the reading room: low desks with the manuscripts, the scroll rack, cushions; the shrine niche with its butter lamps */
  for(const dz of [-.7,.6])W(Rr.x+f*.3,0,Rr.z+dz,0,()=>{const tc=gzCol('timber',C);box('carved',0,.3,0,1.4,.05,.45,tc);for(const s of [-1,1])box('carved',s*.62,0,0,.06,.3,.4,tc);
   if(!C.aband){box('wash',-.25,.35,0,.36,.02,.26,gzCol('wash',C));for(const [px,pc] of [[.2,'orderBlue'],[.36,'potch']])cyl('celadon',px,.35,.05,.04,.05,gzCol(pc,C),8);}});
  gzFurn('xanadu_common_meditation_cushion',Rr.x+f*.3,null,Rr.z-.15,0,{v:0},C);gzFurn('xanadu_common_meditation_cushion',Rr.x+f*.3,null,Rr.z+1.15,0,{v:1},C);
  gzFurn('xanadu_common_scroll_rack',Rr.x-f*(Rr.w/2-.45),null,Rr.z,f>0?PI/2:-PI/2,{v:0},C);gzFurn('generic_writing_supplies',Rr.x+f*1.6,null,Rr.z-1.6,0,{v:0},C);
  gzFurn('xanadu_common_butter_lamp_rack',Rr.x,null,Rr.z-Rr.d/2+.35,0,{v:0},C);gzLight('wax',Rr.x,1,Rr.z-Rr.d/2+.4,C);gzLantern(Rr.x,1.8,Rr.z+.3,C,{hang:.9});
  /* the pigment mill: an edge-runner (a stone wheel on a sweep arm round a basin) grinding the opal spoil; bowls of pigment */
  W(M.x,0,M.z+.2,0,()=>{const rc=gzCol('rock',C);cyl('hewn',0,0,0,.95,.42,rc,16);cyl('potch',0,.42,0,.8,.02,P('potch'),14);beam('carved',[0,.4,0],[0,1.3,0],.07,gzCol('timber',C));
   const a=C.v*.7;W(0,.72,0,a,()=>{beam('carved',[0,0,0],[1.5,.05,0],.05,gzCol('timber',C));WX(.5,0,0,0,0,PI/2,()=>cyl('hewn',0,-.12,0,.3,.24,rc,14));});
   if(!C.aband)for(let i=0;i<3;i++)lathe('celadon',-.6+i*.6,1.05,[[0,0],[.1,.01],[.13,.06],[.13,.09]],8,gzCol(['orderBlue','wash','opal'][i],C));});
  box('hewn',M.x,0,M.z-M.d/2+.25,M.w-.4,1,.3,gzCol('rock',C));gzFurn('generic_herb_bundles',M.x-.6,null,M.z+1.2,0,{v:0},C);gzLight('wax',M.x,1.6,M.z-M.d/2+.3,C);
  /* the cell: a carved bed shelf, a cushion */
  gzBedShelf(Cl.x,Cl.z-Cl.d/2+.5,1.9,.85,0,C);gzFurn('xanadu_common_meditation_cushion',Cl.x,null,Cl.z+.5,0,{v:0},C);
  /* outside: a click wheel by the door; benches on the terrace */
  gzClick(Rr.x+f*1,0,2.9,.2,.55,C,{chips:6});box('wash',0,3.3,.45,3.4,.4,.45,gzCol('washOld',C));}});
/* ---------------------------------------------------------------- the wheel walk */
TG.gz.PLANS['gz-wheel-walk']=function(o){const k='gz-wheel-walk',v=o.v,n=8+Math.floor(gzU(k,v,1)*5);
 return {voids:[gzRoom('niche',0,-.3,10.6,1.4,0,{finish:'plaster',use:'niche',h:2.5,ceil:'flat',rise:0,noFloor:true})],n};};
defBuilding({key:'gz-wheel-walk',name:'The wheel walk (click wheels along the ledge)',seed:9414,cut:true,w:12.4,d:4.2,h:4.2,front:{x:0,z:3},budget:16000,
 tags:{culture:'glazier',types:['religious','infrastructure'],style:'carved',role:'shrine',job:'worship'},note:TG.gz.BOX['gz-wheel-walk'].what,
 build(o){const C=gzCx(o),k='gz-wheel-walk',PL=TG.gz.plan(k,o),n=PL.n,L=11.6,wc=gzCol('wash',C),tc=gzCol('timber',C);
  /* the ledge: flags from the face to its edge, a low whitewashed parapet on the edge with its gaps; the plinth in the niche */
  box('wash',0,-.3,1.1,L+.6,.35,3.6,gzCol('washOld',C));box('wash',0,0,-.45,10.4,.3,.9,wc);
  for(const s of [-1,1])box('wash',s*(L/2-1.5),0,2.75,L/2-1.6,.8,.3,wc);for(const s of [-1,1])box('wash',s*(L/2+.12),0,1.1,.3,.8,3.6,wc);
  /* the eave: carved timber posts and a beam along the niche's mouth, a short roof, the alecap fascia and a cholet band */
  for(let i=0;i<=4;i++){const x=-5.2+i*2.6;beam('carved',[x,.3,.55],[x,2.55,.55],.08,tc);}
  box('carved',0,2.55,.55,10.8,.18,.22,tc);box('wash',0,2.73,.2,11.2,.14,1.3,wc);box('paint',0,2.87,.78,11.2,.32,.12,gzCol('alecap',C));gzBand(-5.4,5.4,2.25,.2,.28,C);
  /* the click wheels on their axles, the eight-spoked wheel at each end, moonglass lanterns hung from the eave */
  for(let i=0;i<n;i++){const x=-4.7+i*9.4/(n-1);gzClick(x,.3,-.4,.22,.62,C,{col:['rose','teal','saffron','carpetR'][i%4],chips:8});}fgSet('wheels',n);
  for(const s of [-1,1]){gzWheel8(s*5.55,1.6,.04,.32,C);gzLantern(s*3.9,1.85,.7,C,{hang:.5});}
  if(C.worn)fgRubble(2,2,3,{gl:()=>0,worn:true,v:C.v});}});
