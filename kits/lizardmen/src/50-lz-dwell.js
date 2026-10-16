// prefix: ld
// ================================================================= THE DWELLINGS: one per caste group (DESIGN.md section 4)
// The Tenders' cell-warren (earth cells in a whorl, horn-buttressed: the owner's clay-house reference), the Makers' quarters
// (the spiked carapace huts of the owner's sketches), the Drovers' long house (an exoskeletal rib house of eleven bays under
// hide), the warriors' lodge (the tusk vault, for castes 4 and 6 with a door each) and the Interpreters' house (a twisted
// stone tower with spiral-eye oculi). Doors are caste-sized triangles (lzDoor); every def declares its caste.
// Frame: origin on the ground at the plot centre, +z the front.
/* a cell of the warren: an earth dome drawn pointed (a lathe), r at the foot, buttressed by o.n horns leaning onto it */
function ldCell(x,z,r,o){o=o||{};const h=r*1.35,n=o.n||5,col=o.col||P('earth');
 W(x,0,z,o.ry||0,()=>{lzDome(0,0,[[r,0],[r*1.03,h*.28],[r*.92,h*.58],[r*.6,h*.86],[r*.18,h*1.12],[r*.03,h*1.32],[0,h*1.34]],{mk:'earth',col,seg:14,door:o.door});
  for(let i=0;i<n;i++){const a=i*TAU/n+(o.a0||0),bx=Math.cos(a)*r*1.05,bz=Math.sin(a)*r*1.05;if(o.door&&Math.abs(((a-PI/2)%TAU+TAU)%TAU)<.5)continue;lzHorn(bx,0,bz,Math.atan2(-bx,-bz),r*1.6,r*.24,{curl:.5,lean:-.25,mk:'horn',nt:8,ns:6});}
  if(o.door){const dh=o.door,dw=dh*.62;lzPortal(0,0,r*1.02,0,dh,{mk:'lacq'});lzThreshold(0,r+.1,0,dw);}});}
defBuilding({key:'lz-warren',name:"Tenders' cell-warren",seed:7001,caste:1,cut:true,w:17,d:15,h:7.6,budget:90000,
 tags:{types:['dwelling-multi'],wealth:'middle',role:'dwelling'},
 note:'the Tenders (caste 1, 1.22 m): seven earth cells in a whorl, each 1.25 x the last and turned 105 degrees from it, buttressed by horns leaning onto the domes; a 1.4 m slit door a human must stoop through; the largest cell opens',
 build(o){const rs=[.9,1.1,1.4,1.75,2.2,2.75,3.4];let px=0,pz=0;const cells=[];
  for(let i=0;i<rs.length;i++){const a=i*1.83+.6;if(i){px+=Math.cos(a)*(rs[i-1]+rs[i])*.9;pz+=Math.sin(a)*(rs[i-1]+rs[i])*.9;}cells.push([px,pz,rs[i]]);}
  /* centre the whorl on the plot, the big cell to the front */
  const cx=cells.reduce((s,c)=>s+c[0],0)/cells.length,cz=cells.reduce((s,c)=>s+c[1],0)/cells.length;
  const big=cells[cells.length-1];const shz=-(big[1]-cz)+2.2;
  lzCutFloor(0);
  for(let i=0;i<cells.length;i++){const c=cells[i],x=c[0]-cx,z=c[1]-cz+shz;const last=i===cells.length-1;
   if(last){ldCell(x,z,c[2],{n:7,a0:.3,door:lzDoorH(1)});box('earthR',x,0,z,c[2]*1.3,.06,c[2]*1.3,P('earthP'));
    lzFurnRoom(c[2]*1.1,c[2]*1.1,.06,'common',{x,z,beds:3,ceil:c[2]*1.1,extra:[['lizardmen_common_desk',x>0?-1:1,.5,PI/2],['lizardmen_common_board',0,-c[2]*.6+.3,0]]});}
   else lzNoCut(()=>ldCell(x,z,c[2],{n:i%2?5:7,a0:i*.7}));
   /* the cells join: a low earth saddle between each and the next */
   if(i){const p=cells[i-1];const mx=(p[0]+c[0])/2-cx,mz=(p[1]+c[1])/2-cz+shz;lzNoCut(()=>ellip('earth',mx,0,mz,Math.min(p[2],c[2])*.9,Math.min(p[2],c[2])*.5,Math.min(p[2],c[2])*.9,P('earth'),0,10));}}
  /* the Tenders' slit vents: a row of small triangles high on the big cell */
  lzDust(0,shz+big[2]+1.2,2.2);}});
/* ---------------------------------------------------------------- the Makers' quarters: the spiked carapace hut */
defBuilding({key:'lz-makers',name:"Makers' quarters",seed:7002,caste:2,cut:true,w:11,d:9,h:6.4,budget:70000,
 tags:{types:['dwelling-multi'],wealth:'middle',role:'dwelling'},
 note:"the Makers (caste 2, 1.53 m): a low wide hut of woven cane under a hide carapace whose seven bone ribs cross at the ridge and run on past it as spikes (the owner's sketches); the door a 1.76 m triangle; lacquer leiwen on the front",
 build(o){const L=8.2,Wd=5.6,wh=1.5,rh=4.4;lzCutFloor(0);
  box('earthR',0,0,0,L+1,.12,Wd+1,P('earthP'));
  lzBatterRoom(L,Wd,.12,wh,'cane',P('cane'),{lean:{front:.06,back:-.08,left:.12,right:-.04},front:[lzDoor(2,L/2+.9),lzVent(2,1.2,1.0)],back:[lzVent(2,2,1),lzVent(2,L-2,1)]});
  lzRibRoof(L,Wd,wh-.05,rh+.9,7,{mk:'hide',col:P('hide'),over:.6,ribR:.15,past:.5,bend:1.0,ext:.5,endMk:'mat',leanEnds:{left:.12,right:-.04},y0:.12});
  W(-L/2*.3,.14,Wd/2-.03*wh+.05,0,()=>lzLeiwen(2.2,1.1,{cell:.36,mk:'lacqR',back:'lacq'}));
  lzThreshold(L/2*.22,Wd/2+.15,0,1.1);
  lzFurnRoom(L-.6,Wd-.6,.12,'common',{beds:2,ceil:rh*.6,extra:[['lizardmen_common_workbench',-L/2+1.2,.9,PI/2],['generic_trade_lathe',L/2-1.4,.6,-PI/2]]});}});
/* ---------------------------------------------------------------- the Drovers' long house: the exoskeletal rib house */
defBuilding({key:'lz-longhouse',name:"Drovers' long house",seed:7003,caste:3,cut:true,w:20,d:10,h:8.2,budget:90000,
 tags:{types:['dwelling-multi'],wealth:'middle',role:'dwelling'},
 note:'the Drovers (caste 3, 1.92 m): eleven bays of lashed hexapod ribs over a long hide roof, walls of reed bundle leaning in on the front and out at the back, two crossed tusks at each gable; the door a 2.2 m triangle on the long side',
 build(o){const L=16.5,Wd=6.4,wh=2.0,rh=6.3;lzCutFloor(0);
  box('earthR',0,0,0,L+1.2,.14,Wd+1.2,P('earthP'));
  lzBatterRoom(L,Wd,.14,wh,'reed',P('reed'),{lean:{front:.1,back:-.07,left:-.04,right:.09},front:[lzDoor(3,L/2),lzVent(3,2.5,1.3),lzVent(3,L-2.5,1.3)],back:[lzVent(3,L*.3,1.3),lzVent(3,L*.7,1.3)]});
  lzRibRoof(L,Wd,wh+.05,rh+1,11,{mk:'hide',col:P('hideD'),over:.7,ribR:.13,past:.22,bend:.95,ext:.6,endMk:'reed',endCol:P('reedD'),leanEnds:{left:-.04,right:.09},y0:.14});
  for(const s of [-1,1])for(const k of [-1,1])lzHorn(s*(L/2+.5),rh+.6,k*.25,k>0?0:PI,2.6,.14,{curl:.7,lean:.3,mk:'ivory'});
  /* the Drovers' goad rack and yokes outside */
  lzNoCut(()=>{W(-L/2-1.6,0,Wd/2-1,0,()=>{for(const x of [-.5,.5])cyl('wood',x,0,0,.06,1.9,P('reedD'),6);beam('wood',[-.6,1.8,0],[.6,1.8,0],.05,P('reedD'));for(let i=0;i<5;i++)beam('cane',[-.5+i*.25,1.75,0],[-.5+i*.25+rr(-.1,.1),.1,.3],.03,P('cane'));});});
  lzThreshold(0,Wd/2+.15,0,1.4);
  lzFurnRoom(L-.8,Wd-.6,.14,'common',{beds:3,ceil:rh*.65,extra:[['generic_trade_hayrack',-L/2+1.5,1.2,PI/2],['generic_trade_trough',L/2-1.4,1.2,-PI/2],['generic_basket',2,2,0]]});}});
/* ---------------------------------------------------------------- the warriors' lodge: the tusk vault, two doors */
defBuilding({key:'lz-lodge',name:"Warriors' lodge",seed:7004,caste:4,cut:true,w:14,d:20,h:11,budget:110000,
 tags:{types:['dwelling-multi','military'],wealth:'middle',role:'dwelling'},
 note:'the Line warriors and the Bulwarks (castes 4 and 6) together: seven pairs of great tusks curl up from the ground and cross over the ridge with a hide skin hung between; the front gable of polygonal basalt carries two doors, a 2.8 m and a 4.4 m triangle, and three spiral eyes',
 build(o){const L=15,Wd=9.5,h=8.6;lzCutFloor(0);
  /* the vault runs along local x; the frame is turned so the +x gable is the front */
  W(0,0,0,-PI/2,()=>{box('stoneP',0,0,0,L+1.4,.2,Wd+1.4,P('basaltD'));
   lzTuskVault(L,Wd,h,7,{r:.36,mk:'ivory',skinMk:'hide',skinCol:P('hide'),eaveY:1.3,y0:.2,doors:[{z:2.6,c:4},{z:-2.2,c:6}],eyes:[[.3,h*.6],[3.9,h*.3],[-3.6,h*.33]]});
   lzFurnRoom(Wd-1,L-1.2,.2,'common',{beds:3,ceil:h*.6,extra:[['generic_trade_armour_stand',-1,-L/2+1.2,0],['generic_trade_armour_stand',1.2,-L/2+1.2,0],['generic_trade_weapon_rack',-3.6,0,PI/2],['lizardmen_training_training_dummy',3.2,5.2,0]]});});}});
/* ---------------------------------------------------------------- the Interpreters' house: the twisted tower */
defBuilding({key:'lz-tower',name:"Interpreters' house",seed:7005,caste:5,cut:true,w:11,d:11,h:21,budget:100000,
 tags:{types:['dwelling-single','civic'],wealth:'rich',role:'dwelling'},
 note:'the Interpreters (caste 5, 3.03 m): a stone tower of nine courses, each turned four degrees past the one below, spiral-eye oculi in verdigris bronze climbing it, a crown of seven horns; a 3.5 m door with nested frames into a hall six metres high under the solid courses, where the seers keep little',
 build(o){const h=18,n=9,w0=7.4,w1=4.6,ch=h/n,hollow=3;lzCutFloor(0);
  box('stoneP',0,0,0,10,.25,10,P('basaltD'));
  const dh=lzDoorH(5),dw=dh*.62;
  /* the lower courses are hollow shells (the hall); the upper ones solid */
  for(let i=0;i<hollow;i++){const t=i/(n-1),w=lerp(w0,w1,t),ry=i*.07;W(0,.25+i*ch,0,ry,()=>lzBatterRoom(w,w,0,ch+.02,'cyclo',P('basalt'),{lean:{front:.02,back:-.02,left:.03,right:-.01},front:i===0?[{s:w/2,w:dw,h:dh,door:true}]:[]}));}
  const ceilY=.25+hollow*ch,cw=lerp(w0,w1,(hollow-1)/(n-1))-.2;box('cyclo',0,ceilY-.3,0,cw,.3,cw,P('basaltD'),(hollow-1)*.07);
  lzTwist(0,0,h,n,w0,w1,.07,{mk:'cyclo',col:P('basalt'),start:hollow,each:(i,y,w,ry)=>{if(i===3||i===5||i===7){const k=i===5?-1:1;W(0,y+ch*.5,0,ry,()=>lzEye(k*w*.5+.03*k,0,0,k*PI/2,w*.18,{mk:'bronze'}));}
   if(i===1)W(0,y+.3,0,ry,()=>{W(0,0,w/2+.01,0,()=>lzLeiwen(w*.8,ch*.6,{cell:.4,mk:'bronze',back:false}));});}});
  for(let i=0;i<7;i++){const a=i*TAU/7;lzHorn(Math.cos(a)*w1*.42,h+.25,Math.sin(a)*w1*.42,Math.atan2(Math.cos(a),Math.sin(a)),2.8,.15,{curl:.5,lean:.35,mk:'ivory'});}
  lzNoCut(()=>lzPortal(0,.25,w0/2+.04,0,dh,{mk:'bronze',eye:true}));lzThreshold(0,w0/2+.3,0,dw);
  /* the seers keep little: one great basking dais, the desk, a scroll, the guardian, a lamp, a carpet */
  FURNISH('lizardmen_court_bed',-1.6,.25,-1.8,0);FURNISH('lizardmen_court_desk',1.9,.25,-1.6,-PI/2);FURNISH('lizardmen_court_scroll',-2.6,.25,.6,PI/2);
  FURNISH('lizardmen_court_statue',2.4,.25,1.6,-PI/2);FURNISH('lizardmen_court_candelabra',-.9,.25,2.2,0);FURNISH('lizardmen_court_carpet',.3,.25,.2,0);FURNISH_HANG('lizardmen_court_hanging',0,ceilY-.35,0,0);}});
