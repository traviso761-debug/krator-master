// prefix: al
// ================================================================= LARGE TENTS: five for the herding families
// Tags: culture ashnomad, types dwelling-multi, wealth middle (the chieftain's and the assembly are in 46).
/* the frame of a straight wall from a=[x,z] to b=[x,z], its outer face toward +z: fn(L) draws with x along the wall */
function alWall(a,b,fn,out){const L=Math.hypot(b[0]-a[0],b[1]-a[1]),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;let ry=Math.atan2(b[0]-a[0],b[1]-a[1])-PI/2;
 if(Math.sin(ry)*mx+Math.cos(ry)*mz<0)ry+=PI;W(mx+Math.sin(ry)*(out||0),0,mz+Math.cos(ry)*(out||0),ry,()=>fn(L));}
defBuilding({key:'tent-spire-great',name:'Great spire tent',seed:4401,cut:true,w:13.4,d:13.4,h:11.4,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'spire'},
 note:'a great black spire tent on a mast and a ring of six poles: frets, birds and beetles round the wall, sawtooth and step bands climbing the roof',
 build(o){const R=5,rY=akConcave({R,wallH:2.0,peakH:10.2,k:2.4,doorW:1.6,floor:'patKilim',teeth:60,bands:[[.0,.08,'saw'],[.3,.36,'step'],[.6,.64,'line'],[.82,.86,'saw']]});
  for(let i=0;i<6;i++){const p=tkAt(2.6,(i+.5)/6*TAU);pole('wood',[p[0],0,p[1]],[p[0],rY(2.6)-.1,p[1]],.07,P('woodD'),7);}
  FURNISH('ashnomad_fire_pit',0,0,.6,0);smokeAt(0,10,.6,{r:.3,kind:'flue'});
  tkHonour(R,{hangY:.9});
  tkRingSeats(R-.55,['ashnomad_sleeping_mat'],{step:2.4,gap:1.0,skip:a=>tkNearDoor(a+PI,.7)});
  for(const s of [-1,1])tkTea(s*2.0,1.8,tkFace(s*2.0,1.8));
  for(const s of [-1,1]){const p=tkAt(R-.6,TK_DOOR+s*.8);FURNISH('ashnomad_chitin_chest',p[0],0,p[1],tkFace(p[0],p[1]),{v:1});}
  {const p=tkAt(R-.7,TK_DOOR+2.4);FURNISH('ashnomad_ground_loom',p[0],0,p[1],tkFace(p[0],p[1]));}
  for(const a of [TK_DOOR+PI+.9,TK_DOOR+PI-.9]){const p=tkAt(3.0,a);FURNISH_HANG('ashnomad_hanging_banner',p[0],rY(3.0)-.08,p[1],tkFace(p[0],p[1]),{v:a>TK_DOOR+PI?1:0});}
  for(const s of [-1,1])FURNISH_HANG('ashnomad_hanging_lantern',s*2.6,rY(2.6)-2.4,-.6,0);
  tkScreens(0,R+1.2,0,1.2);}});

defBuilding({key:'tent-star',name:'Star tent',seed:4402,cut:true,w:15,d:15,h:9.4,budget:140000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'star'},
 note:'a six-lobed star tent: a central spire and six petal gables round it, each on its own mast, a yellow and red arch over every gable; a family hall',
 build(o){const rY=akChief({R:5.2,wallH:1.9,cR:2.4,drumH:3.6,peakH:8.4,lobeR:1.6,lobeH:5.2,lobeD:4.6,lobes:6,doorW:1.8});
  FURNISH('ashnomad_rug',0,.03,0,0);FURNISH('ashnomad_brazier',0,0,.4,0);
  tkRingSeats(4.6,['ashnomad_floor_cushion','ashnomad_bolster','ashnomad_floor_cushion'],{step:1.2,gap:.85});
  for(const [x,z] of [[-2,-1.6],[2,-1.6]]){FURNISH('ashnomad_carapace_table',x,0,z,0);FURNISH('ashnomad_brew_set',x,svfH('ashnomad_carapace_table',0,.4),z,0);}
  for(const s of [-1,1]){const p=tkAt(4.2,TK_DOOR+PI+s*1.1);FURNISH('ashnomad_bedding_stack',p[0],0,p[1],tkFace(p[0],p[1]));}
  FURNISH('ashnomad_chitin_chest',0,0,-4.3,0);FURNISH('ashnomad_grub_jars',3.2,0,1.6,-PI/2);FURNISH('ashnomad_egg_basket',-3.2,0,1.6,PI/2);
  FURNISH_HANG('ashnomad_hanging_lantern',0,6.4,0,0);for(const s of [-1,1])FURNISH_HANG('ashnomad_hanging_lantern',s*1.8,3.2,1.2,0);}});

defBuilding({key:'tent-twin-peak',name:'Twin-peaked tent',seed:4403,cut:true,w:16,d:11.5,h:6.2,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'peaked'},
 note:'a long black tent on two masts, its peaks drawn high: a fret band round the walls, the raised front edged in red, spires on both masts',
 build(o){const w=12,d=7;const H=tkPeaked({w,d,eaveH:1.1,peaks:[[-3,-.2,5.4],[3,-.2,5.4]],cover:'ashCloth',col:P('ash'),seam:.6,wallKey:'ashCloth',wallCol:P('ashG'),open:{x0:-2.4,x1:2.4,h:2.6},lining:'patEmber',floor:'rug',floorCol:P('redD')});
  const w2=w/2,d2=d/2;for(const [a,b] of [[[-w2,-d2],[w2,-d2]],[[w2,-d2],[w2,d2]],[[-w2,d2],[-w2,-d2]]])alWall(a,b,L=>akBand(L,.5,.5,{z:.14}));
  for(const x of [-3,3])W(x,0,-.2,0,()=>akSpire(5.45,1.2));
  {const pts=[];for(let i=0;i<=20;i++){const x=-2.6+i*.26;pts.push([x,H(x,d2)+.02,d2+.02]);}cord('plain',pts,.06,akC(AK_P));}
  for(const x of [-3,3])FURNISH('ashnomad_rug',x,.03,.3,0,{v:x>0?1:2});
  tkRowSeats(-5.4,-3.05,5.4,-3.05,['ashnomad_sleeping_mat'],2.2,undefined,0);
  for(const x of [-5.4,5.4])FURNISH('ashnomad_bedding_stack',x,0,0,x<0?PI/2:-PI/2);
  for(const x of [-3,3]){FURNISH('ashnomad_brazier',x,0,1.5,0);FURNISH_HANG('ashnomad_hanging_lantern',x+.9,H(x+.9,-.2)-.6,-.2,0);}
  tkTea(0,-.4,PI);FURNISH_HANG('ashnomad_hanging_banner',0,Math.min(3.1,H(0,-1.8)-.06),-1.8,0);
  for(const x of [-1.6,1.6])FURNISH('ashnomad_chitin_chest',x,0,-2.6,0,{v:x>0?1:0});
  tkScreens(0,d2+1.4,0,1.6);}});

defBuilding({key:'tent-long-black',name:'Long black tent',seed:4404,cut:true,w:16.4,d:14,h:5.4,budget:120000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'beit-shaar'},
 note:'a long black hair tent on three rows of poles, its front valance cut in red teeth edged in yellow, banners hung from the front poles; ash screens inside the open front',
 build(o){const w=12,d=6;const H=tkBlack({w,d,rows:[{z:-1.6,n:3,h:2.5},{z:.1,n:3,h:3.0},{z:1.7,n:3,h:2.6}],frontH:2.2,backH:1.05,stripes:[3],frontPoles:6});
  // the toothed valance: red teeth edged in yellow along the raised front
  for(let i=0;i<24;i++){const x0=-w/2+i*w/24,x1=x0+w/24,xm=(x0+x1)/2,y=H(xm,d/2);poly('flag',[[x0,y,d/2+.03],[x1,y,d/2+.03],[xm,y-.38,d/2+.03]],P('blue'),true);
   cord('plain',[[x0,y-.01,d/2+.04],[xm,y-.38,d/2+.04],[x1,y-.01,d/2+.04]],.015,akC(AK_Y));}
  for(const x of [-w/2+.3,w/2-.3])akBanner(x,d/2+.4,4.6,{len:2.2});
  tkFloor('patEmber',null,0,w-.3,d-.3);
  tkRowSeats(-5.5,-2.5,1.6,-2.5,['ashnomad_floor_cushion','ashnomad_bolster'],1.1,undefined,0);
  FURNISH('ashnomad_rug',-2,.03,-.4,0);tkTea(-2.5,0,PI);FURNISH('ashnomad_fire_pit',-1.0,0,.9,0);smokeAt(-1,.6,.9,{r:.25});
  FURNISH('ashnomad_ash_screen',2.2,0,0,PI/2);FURNISH('ashnomad_ash_screen',2.2,0,-1.9,PI/2,{v:1});
  FURNISH('ashnomad_bedding_stack',4.8,0,-2.4,0);FURNISH('ashnomad_chitin_chest',3.3,0,-2.5,0);FURNISH('ashnomad_ground_loom',3.6,0,.8,PI/2);
  FURNISH('ashnomad_grub_jars',5.2,0,1.6,-PI/2);FURNISH('ashnomad_water_gourds',4.3,0,2.3,PI);
  FURNISH_HANG('ashnomad_hanging_lantern',-2,H(-2,.1)-.05,.1,0);FURNISH_HANG('ashnomad_hanging_lantern',3.4,H(3.4,-1.6)-.05,-1.6,0);
  FURNISH('ashnomad_smoke_rack',-3.4,0,5.4,0,{setting:'outdoor'});FURNISH('ashnomad_fire_pit',1.5,0,5.6,0,{setting:'outdoor'});smokeAt(1.5,.6,5.6,{r:.3});}});

defBuilding({key:'tent-great-dome',name:'Great hide dome',seed:4405,cut:true,w:12,d:12,h:5.4,budget:100000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'dome'},
 note:'a great Ashlander dome of grey and black hides on bent ribs, smoke-black at the crown; a family of several generations round one fire',
 build(o){const r=5;akDome({r,h:4.8,doorW:1.3,col:P('hide')});
  for(let i=0;i<4;i++){const p=tkAt(2.2,(i+.5)/4*TAU);pole('wood',[p[0],0,p[1]],[p[0],4.2,p[1]],.07,P('woodD'),7);}
  FURNISH('ashnomad_fire_pit',0,0,0,0);smokeAt(0,4.8,0,{r:.35});FURNISH('ashnomad_rug',0,.03,1.6,0,{v:2});
  tkRingSeats(r-.6,['ashnomad_sleeping_mat'],{step:2.3,gap:1.0});
  tkHonour(r);for(const s of [-1,1])tkTea(s*1.9,1.9,tkFace(s*1.9,1.9));
  FURNISH('ashnomad_egg_basket',2.6,0,-2.6,tkFace(2.6,-2.6));FURNISH('ashnomad_grub_jars',-2.6,0,-2.6,tkFace(-2.6,-2.6));
  FURNISH_HANG('ashnomad_herb_bundles',-1.4,3.8,.8,0);FURNISH_HANG('ashnomad_hanging_lantern',1.4,3.6,-.6,0);
  tkScreens(0,r+1.0,0,1.1);}});
