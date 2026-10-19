// prefix: ls
// ================================================================= SPECIALISTS AND STORES: the seer's hall, the medicine hut, the warehouse
// The seer's hall holds the carved model of the village, seer's hall included (the village inside itself); the medicine hut
// is a small carapace hut hung with herbs; the warehouse keeps the plunder from the Vale unused, sorted by an order only the
// Lizardmen understand. Frame: origin on the ground at the plot centre, +z the front.
/* the model of the village on its table: a squared spiral of tiny buildings winding in to a tiny nest hall, a tiny seer's
   hall among them (with its own tinier table) */
function lsModel(x,y,z,s){W(x,y,z,0,()=>{box('lacq',0,0,0,2.6*s,.08*s,2.6*s,P('lacq'));
 let px=-1.0*s,pz=1.0*s,dir=0,len=2.0*s;const g=.3*s;let k=0;
 for(let n=0;n<9&&len>g;n++){const dx=[1,0,-1,0][dir],dz=[0,-1,0,1][dir],steps=Math.max(1,Math.floor(len/(.28*s)));
  for(let i=0;i<steps;i++){const t=(i+.5)/steps,bx=px+dx*len*t,bz=pz+dz*len*t;k++;const bs=.1*s+.02*s*(k%3);
   if(k%7===3)lathe('ivory',bx,bz,[[bs,0],[bs*.6,bs*1.2],[0,bs*1.6]],6,P('bone'),{});
   else if(k%5===1){box('ivory',bx,.08*s,bz,bs*1.2,bs*.9,bs*1.6,P('bone'),dir*PI/2);for(const q of [-1,1])lzHorn(bx+q*bs*.5,.08*s+bs*.9,bz,q>0?PI/2:-PI/2,bs*1.2,bs*.12,{curl:.5,mk:'ivory',nt:5,ns:4});}
   else box('ivory',bx,.08*s,bz,bs,bs*1.3,bs,P('bone'),n*.12);}
  px+=dx*len;pz+=dz*len;dir=(dir+1)%4;if(n%2)len-=g;}
 /* the nest hall at the centre: a whorl; the seer's hall: the slightly bigger block with the eye, holding a tinier table */
 lathe('ivory',0,0,[[.22*s,.08*s],[.2*s,.2*s],[.08*s,.3*s],[0,.34*s]],10,P('bone'),{});
 box('ivory',-.55*s,.08*s,.45*s,.26*s,.3*s,.26*s,P('bone'));lzEye(-.55*s,.3*s,.59*s,0,.05*s,{mk:'bronze'});
 if(s>.5)lsModel(-.55*s,.38*s,.45*s,s*.08);});}
defBuilding({key:'lz-seer',name:"Seer's hall",seed:7301,caste:5,cut:true,w:15,d:13,h:10.5,budget:100000,
 tags:{types:['civic','religious'],wealth:'rich',role:'hall'},
 note:'the Interpreters\' hall: battered polished basalt under a bone rib roof, seven spiral eyes on the front with lit pupils; inside, the carved model of the village (seer\'s hall included, with its own model) on a lacquer table, the seers\' divans round it',
 build(o){const L=11,Wd=8.5,wh=3.6,rh=4.8;lzCutFloor(0);box('stoneP',0,0,0,L+1.4,.22,Wd+1.4,P('basaltD'));
  const dh=lzDoorH(5),dw=dh*.62;
  lzBatterRoom(L,Wd,.22,wh,'stoneP',P('basalt'),{lean:{front:.12,back:-.04,left:.06,right:-.07},front:[{s:L/2,w:dw,h:dh,door:true}],back:[lzVent(5,L*.5,wh*.6)]});
  lzNoCut(()=>{lzPortal(0,.22,Wd/2-.12*wh*0+.06,0,dh,{mk:'bronze'});
   for(let i=0;i<7;i++){const t=(i+.5)/7,ex=-L/2+L*t,ey=.22+wh*.78-.3*Math.abs(t-.5)*2;if(Math.abs(ex)<dw*.75)continue;lzEye(ex,ey,Wd/2-.12*(ey-.22)+.03,0,.34,{mk:'bronze',glow:true});}});
  lzThreshold(0,Wd/2+.2,0,dw);
  lzRibRoof(L,Wd,wh+.25,wh+rh,7,{mk:'hide',col:P('hideD'),over:.7,ribR:.16,past:.3,bend:.95,ext:.6,endMk:'lacq',endCol:P('lacq'),leanEnds:{left:.06,right:-.07},y0:.22});
  lsModel(0,.22+.9,-.4,1.3);box('lacq',0,.22,-.4,2.2,.9,2.2,P('lacq'));W(0,.22,.74,0,()=>lzLeiwen(2.0,.8,{cell:.26,mk:'bronze',back:false,t:.03,proud:.02}));
  lzFurnRoom(L-1,Wd-1,.22,'court',{beds:0,noHearth:true,ceil:wh+rh*.5,extra:[['lizardmen_court_divan',-3.6,-.4,PI/2],['lizardmen_court_divan',3.6,-.4,-PI/2],['lizardmen_court_divan',0,-3.2,0],['lizardmen_court_scroll',4.4,-3.2,-PI/2],['lizardmen_court_candelabra',-2.2,2.4,0],['lizardmen_court_candelabra',2.2,2.4,0]]});}});
/* ---------------------------------------------------------------- the medicine hut */
defBuilding({key:'lz-medicine',name:'Medicine hut',seed:7302,caste:1,cut:true,w:9,d:8,h:6,budget:60000,
 tags:{types:['civic'],wealth:'middle',role:'hall'},
 note:'a small carapace hut of cane under hide and five bone ribs, hung with herb bundles and spore gourds; the Tenders\' slit door; a basking slab for the sick',
 build(o){const L=5.6,Wd=4.4,wh=1.4,rh=3.2;lzCutFloor(0);box('earthR',0,0,0,L+1,.12,Wd+1,P('earthP'));
  lzBatterRoom(L,Wd,.12,wh,'cane',P('cane'),{lean:{front:.05,back:-.09,left:.12,right:-.03},front:[lzDoor(1,L/2-.6),lzVent(1,L-1,.9)],back:[lzVent(1,L/2,.9)]});
  lzRibRoof(L,Wd,wh-.05,wh+rh,5,{mk:'hide',col:P('hideP'),over:.6,ribR:.12,past:.45,bend:1,ext:.4,endMk:'mat',leanEnds:{left:.12,right:-.03},y0:.12});
  lzNoCut(()=>{for(let i=0;i<6;i++){const x=-L/2+.6+i*.85;beam('rope',[x,wh+.9,Wd/2+.45],[x,wh+.3,Wd/2+.5],.012,P('reedD'),true,4);ellip('plain',x,wh+.1,Wd/2+.5,.09,.22,.09,P(i%2?'moss':'spore'),0,6);}});
  lzThreshold(-.6,Wd/2+.15,0,.9);
  lzFurnRoom(L-.5,Wd-.5,.12,'common',{beds:1,ceil:rh*.7,extra:[['generic_medicine',1.4,-1.2,0],['generic_herb_bundles',.4,-1.4,0],['lizardmen_common_bowl',1.6,.4,0],['generic_storage_jar',-1.8,1.2,0]]});}});
/* ---------------------------------------------------------------- the warehouse: the plunder kept and unused */
defBuilding({key:'lz-warehouse',name:'Warehouse',seed:7303,caste:'all',cut:true,w:17,d:13,h:8.6,budget:100000,
 tags:{types:['industry','infrastructure'],wealth:'middle',role:'store'},
 note:'the plunder from the Vale, kept but unused (steel blades they cannot make or mend, tools, valuables), sorted along a squared spiral on the floor by an order only they understand; brick on a basalt plinth, reed ribs, a nested portal',
 build(o){const L=12.5,Wd=8.5,wh=3,rh=3.8;lzCutFloor(0);box('stoneP',0,0,0,L+1.4,.3,Wd+1.4,P('basaltD'));
  const dh=lzDoorH(6),dw=dh*.62;
  lzBatterRoom(L,Wd,.3,wh,'brick',P('brick'),{lean:{front:.05,back:-.08,left:.1,right:-.02},front:[{s:L/2,w:dw,h:dh,door:true},lzVent(4,1.4,wh*.6),lzVent(4,L-1.4,wh*.6)],back:[lzVent(4,L*.3,wh*.6),lzVent(4,L*.7,wh*.6)]});
  lzNoCut(()=>lzPortal(0,.3,Wd/2+.06,0,dh,{mk:'lacq'}));lzThreshold(0,Wd/2+.2,0,dw);
  lzRibRoof(L,Wd,wh+.3,wh+rh,9,{mk:'thatch',col:P('reed'),over:.7,ribR:.14,past:.22,bend:.95,ext:.6,endMk:'reed',endCol:P('reedD'),leanEnds:{left:.1,right:-.02},y0:.3});
  /* the spiral of goods */
  const keys=['generic_crate','generic_chest','generic_strongbox','generic_barrel','generic_crate','generic_sack','generic_canister_set','generic_bottle_crate','generic_keg','generic_pantry_boxes','generic_chest'];
  let px=-4.6,pz=2.6,dir=0,len=9;let k=0;
  for(let n=0;n<7&&len>1;n++){const dx=[1,0,-1,0][dir],dz=[0,-1,0,1][dir],steps=Math.max(1,Math.floor(len/1.5));
   for(let i=0;i<steps;i++){const t=(i+.5)/steps;FURNISH(keys[k%keys.length],px+dx*len*t,.3,pz+dz*len*t,dir*PI/2+(k%3?.0:.4));k++;}px+=dx*len;pz+=dz*len;dir=(dir+1)%4;if(n%2)len-=2.2;else len-=1.4;}
  FURNISH('generic_trade_weapon_rack',-5.6,.3,-3.4,PI/2);FURNISH('lizardmen_common_board',5.6,.3,-3.4,-PI/2);FURNISH_HANG('lizardmen_common_hanging',0,wh+2,0,0);}});
