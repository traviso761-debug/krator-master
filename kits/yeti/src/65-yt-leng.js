// prefix: yt
// ================================================================= LENG'S OCCUPATION (PLAN.md section 6, Y6)
// Leng is an Ancient arcology the Khaayken hold (LORE.md 6.19; biomes/nwouterwall/PLAN.md: the forest-steppe, +2 C a year).
// They do not rebuild the ruin: they live in it as they live on the open ground, in domes and covered ways, set inside its
// halls, which keep off the wind and the drift, as Talia and Pylon set their buildings round theirs. The ruin's floor is the
// Ancients' slab: nothing is dug, so the cold trap is built up instead of down (a porch whose door sill stands above the room's
// deck), and the floor is a larch deck on sleepers over the cold slab. The pieces:
//   yt_leng_bay_house  a pycrete dome house standing on the slab in a bay of a hall: the larch deck, the platform, the lining,
//                      a built-up porch with its door; the household's goods and a trophy or two (the loot rule)
//   yt_leng_plug       a breach in an Ancient wall plugged with pycrete blocks: a door in it (core/door), an ice lens over it,
//                      the toll taken there (YT_TRADES: customs); drawn with the stubs of the wall it closes
//   yt_leng_hall       the test piece: a bay of an Ancient hall (a stand-in drawn here, cast stone, its roof half fallen; Leng's
//                      own page reads the Ancients kit for the real one) with two bay houses against its back wall, a covered
//                      way along its floor between their porches and the plug in its broken front wall
/* the Ancients' cast stone (the stand-in): pale, even, a little warm */
const YT_ANC=[0xb6b2aa,0xaeaaa2,0xbcb8b0];
const ytAnc=()=>jc(YT_ANC[0],.03);
const YT_SLAB_T=.15;   /* the ruin's floor slab over the ground */
/* the bay house's measures: the catenary on the slab (not sunk: the dome is taller to keep the headroom over the deck) */
const YT_BAY=(()=>{const S=YT_S,Rr=2.3*S,gap=.18,Ri=Rr+gap+.03,t=.45,Ro=Ri+t,Ho=3.9,Hi=Ho-t*.9,Hl=Hi-.2,yDeck=YT_SLAB_T+.3,
 hw=.62,hv=.7,ys=1.5,pz=Ro+1.5,cz=-.6;
 return {S,Rr,gap,Ri,t,Ro,Ho,Hi,Hl,yDeck,yFl:yDeck,yPlat:yDeck+.75*S,zPlat:.2,hw,hv,ys,pz,cz,rVent:.12*S,stone:false,
  w:2*(Ro+1),d:2*Ro+1.5+2,h:Ho+1.5};})();
defBuilding({key:'yt_leng_bay_house',name:'Bay house (a dome in an Ancient bay)',seed:9901,w:YT_BAY.w,d:YT_BAY.d,h:YT_BAY.h,cut:true,budget:80000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common',role:'dwelling'},
 note:'a pycrete dome on the ruin\'s slab: a larch deck over the cold floor, the platform, the hide lining; the cold trap built up as a porch whose sill stands over the deck',
 build(o){const D=YT_BAY,season='winter';CURREC.season=season;
  CURREC.layers=ytLayers('pycrete',season,{t:D.t,gap:D.gap});CURREC.frost=ytFrost(CURREC.layers);
  CURREC.heat={stove:null,lamps:1,fuel:'fat',crownVent:+(D.rVent*2).toFixed(2),inlet:'the porch, under its sill',heated:true,floor:{sunk:0,onSlab:'a larch deck on sleepers'}};
  if(!o.inHall)box('slab',0,0,D.cz+.9,D.w-.4,YT_SLAB_T,D.d-.4,ytAnc());   /* on the sheet alone: a piece of the ruin's floor under it */
  W(0,0,D.cz,0,()=>{const dr=[{arch:{hw:D.hw+.32,hv:D.hv+.32,ys:D.ys},grow:-.03}];
   ytDome('course',D.Ro,D.Ho,P('ice'),{doors:dr,rTop:D.rVent+.02,spiral:.5,seg:44});
   ytDome('pycrete',D.Ri,D.Hi,P('ice'),{doors:dr,rTop:D.rVent+.02,inward:true,seg:44});
   ytDome('hideCap',D.Rr,D.Hl,P('ice'),{doors:dr,rTop:D.rVent+.01,inward:true,seg:44});
   ytCrownVent(D.rVent,D.Hl-.02,D.Ho+.05);
   /* the deck: larch boards on sleepers over the slab, the room's floor */
   cyl('larch',0,YT_SLAB_T,0,D.Rr+.02,D.yDeck-YT_SLAB_T,P('larch'),32);ytWalkDisc(0,0,D.Rr-.05,D.yDeck);
   ytWalkRing(0,0,D.Rr,D.Ro,D.yDeck,D.yDeck+2.4,[{ga:PI/2,w:2*(D.hw+.3)}]);
   ytWalkTarget('room',0,D.yDeck,1.2);
   /* the platform: slab blocks under robes, two steps up, the lamp at its edge */
   prism('slab',ytSegment(D.Rr-.02,D.zPlat,24),D.yDeck,D.yPlat,P('slab'));prism('muskox',ytSegment(D.Rr-.25,D.zPlat-.12,24),D.yPlat,D.yPlat+.07,P('ice'));
   W(-.6,D.yPlat+.07,-1.1,.4,()=>box('caribou',0,0,0,1.5*D.S,.05,1.1*D.S,P('ice')));
   wkPad(0,(D.zPlat-D.Rr)/2+.1,D.Rr*1.5,D.Rr+D.zPlat-.2,D.yPlat+.07);
   {const rs=(D.yPlat+.07-D.yDeck)/3;WKOFF=1;box('slab',0,D.yDeck,D.zPlat+.22,1.0,2*rs,.44,P('slab'));box('slab',0,D.yDeck,D.zPlat+.66,1.0,rs,.44,P('slab'));WKOFF=0;
    wkPad(0,D.zPlat+.22,1.0,.44,D.yDeck+2*rs);wkPad(0,D.zPlat+.66,1.0,.44,D.yDeck+rs);}
   ytWalkTarget('platform',0,D.yPlat+.07,(D.zPlat-D.Rr)/2);
   ytLamp(.75,D.yPlat+.07,D.zPlat-.3,0);
   /* the porch: the cold trap built up, its walls of pycrete block, its vault, a sill step over the deck, the door at its mouth */
   const z0=D.Ri-.1,z1=D.pz,hwo=D.hw+.3;box('flag',0,YT_SLAB_T,(z0+z1)/2,D.hw*2,.12,z1-z0,P('flag'));
   for(const s of [-1,1])box('pycrete',s*(D.hw+.15),YT_SLAB_T,(z0+z1)/2,.3,D.ys-YT_SLAB_T,z1-z0,P('ice'));
   ytVault('pycrete',D.hw,D.hv,D.ys,z0,z1,P('ice'),{inward:true});ytVault('course',hwo,D.hv+.3,D.ys,z0+.2,z1,P('ice'));
   ytArchFace('pycrete',D.hw,D.hv,.3,D.ys,z1,1,P('ice'));
   box('slab',0,YT_SLAB_T,z1-.25,D.hw*2,.42,.3,P('slab'));wkPad(0,(z0+z1)/2-.2,D.hw*2,z1-z0-.4,YT_SLAB_T+.12);   /* the sill: the room's warm air stays behind it */
   ytWalkTarget('porch',0,YT_SLAB_T+.12,z1+.6);
   door(0,YT_SLAB_T,z1+.02,0,D.hw*2);svLeaf(0,YT_SLAB_T,z1+.06,0,D.hw*1.6,D.ys+D.hv*.5-YT_SLAB_T,{mk:'larch',col:P('larch'),t:.06,style:'plank',name:'porch door'});
   /* the household (45-yt-inside.js): its goods by its tier, and the loot rule */
   ytGoods(D,{});});}});
/* a breach in an Ancient wall plugged with pycrete: w wide in a wall h tall and t thick, a door in the plug */
const YT_PLUG={w:6.4,h:6.0,t:.8,stub:3.2};
function ytLengPlug(o){const B=YT_PLUG,hw=B.w/2,dw=1.25,dh=2.2;
 /* the wall's stubs either side, their broken edges stepped */
 for(const s of [-1,1]){box('slab',s*(hw+B.stub/2),0,0,B.stub,B.h,B.t,ytAnc());
  for(let i=0;i<4;i++)box('slab',s*(hw-.12+i*.04),B.h*.25*i,0,.28,B.h*.25-.05*i,B.t-.05,ytAnc());}
 /* the plug: courses of pycrete block laid to the breach, thicker than the wall; the door's frame of larch and its lintel */
 const ct=B.t+.3,rows=Math.round((B.h-.6)/.42);
 for(let r=0;r<rows;r++){const y=r*.42,off=(r%2)*.35;for(let x=-hw+off;x<hw-.05;x+=.7){const x0=x,x1=Math.min(hw,x+.7);
   if(y<dh+.15&&x1>-dw/2-.15&&x0<dw/2+.15)continue;   /* the doorway */
   if(y>3.4&&y<4.3&&x1>-.55&&x0<.55)continue;          /* the ice lens over it */
   box('pycrete',(x0+x1)/2,y,0,x1-x0-.02,.4,ct,P('ice'));}}
 for(const s of [-1,1])box('larch',s*(dw/2+.08),0,0,.16,dh,ct+.04,P('larch'));box('larch',0,dh,0,dw+.5,.25,ct+.04,P('larch'));
 for(let x=-hw;x<hw;x+=.7)box('pycrete',x+.35,dh+.25,0,.68,.4,ct,P('ice'));
 box('ice',0,3.45,0,1.0,.8,.12,P('ice'));
 door(0,0,ct/2+.02,0,dw);svLeaf(0,0,ct/2-.06,0,dw*.96,dh-.03,{mk:'larch',col:P('larch'),t:.08,style:'plank',name:'plug door'});
 return {dw,ct};}
defBuilding({key:'yt_leng_plug',name:'Plugged breach (pycrete wall in an Ancient gap)',seed:9903,w:YT_PLUG.w+2*YT_PLUG.stub+1,d:4,h:YT_PLUG.h+.5,budget:40000,
 tags:{types:['military'],wealth:'middle',style:'state',role:'gate',job:'customs'},
 note:'the breach closed with courses of pycrete block, thicker than the wall; a larch-framed door in it (core/door) where the toll is taken, an ice lens over it',
 build(o){CURREC.season='winter';CURREC.layers=[{k:'pycrete',m:YT_PLUG.t+.3}];CURREC.frost={ok:true,unheated:true};CURREC.heat={stove:null,heated:false,crownVent:0};
  const P0=ytLengPlug(o);ytWalkTarget('outside',0,0,2.2);ytWalkTarget('inside',0,0,-2.2);}});
/* the covered way along a hall's floor: block walls, a pycrete vault, from (ax, az) to (bx, bz) at the slab's top */
function ytLengWay(ax,az,bx,bz){const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),hw=.55*YT_S,hv=.6,ys=1.3;
 W(ax,YT_SLAB_T,az,Math.atan2(dx,dz),()=>{for(const s of [-1,1])box('pycrete',s*(hw+.15),0,L/2,.3,ys,L,P('ice'));
  ytVault('pycrete',hw,hv,ys,0,L,P('ice'),{inward:true});ytVault('course',hw+.3,hv+.3,ys,0,L,P('ice'));
  ytArchFace('pycrete',hw,hv,.3,ys,0,-1,P('ice'));ytArchFace('pycrete',hw,hv,.3,ys,L,1,P('ice'));});}
/* the hall: L long (x) and Wd deep (z) inside, its walls t thick and H tall, piers along them, the back half roofed */
const YT_HALL={L:30,Wd:16,t:.9,H:9,pier:5};
defBuilding({key:'yt_leng_hall',name:'Leng: the occupation of an Ancient hall',seed:9905,cls:'feature',kind:'sample',w:YT_HALL.L+4,d:YT_HALL.Wd+6,h:YT_HALL.H+.5,cut:true,budget:400000,
 front:{x:0,z:YT_HALL.Wd/2+YT_HALL.t+1.5,yaw:0},   /* the plug's door in the front wall is the way in */
 tags:{types:['civic'],wealth:'middle',style:'state',role:'occupation'},
 note:'a stand-in bay of Leng\'s Ancient halls (cast stone, the roof fallen over its front half): two dome houses against the back wall, a covered way between their porches and the plugged breach in the front wall',
 build(o){const H=YT_HALL,hx=H.L/2,hz=H.Wd/2,t=H.t;CURREC.season='winter';CURREC.layers=[{k:'stone',m:t}];CURREC.frost={ok:true,none:true};CURREC.heat={stove:null,heated:false,crownVent:0};
  /* the floor slab and the walls; the front wall's breach is the plug's (its stubs are drawn with it) */
  box('slab',0,0,0,H.L+2*t,YT_SLAB_T,H.Wd+2*t,ytAnc());
  box('slab',0,0,-hz-t/2,H.L+2*t,H.H,t,ytAnc());for(const s of [-1,1])box('slab',s*(hx+t/2),0,0,t,H.H,H.Wd,ytAnc());
  const gw=YT_PLUG.w+2*YT_PLUG.stub,side=(H.L+2*t-gw)/2;for(const s of [-1,1])box('slab',s*(gw/2+side/2),0,hz+t/2,side,H.H*.8,t,ytAnc());
  /* the piers and the beams; the roof slab over the back half, its broken edge, the fallen slabs on the floor */
  for(let x=-hx+H.pier/2;x<hx;x+=H.pier){for(const z of [-hz+.4,hz-.4])box('slab',x,YT_SLAB_T,z,.9,H.H-YT_SLAB_T,.8,ytAnc());box('slab',x,H.H-.9,0,.7,.9,H.Wd,ytAnc());}
  box('slab',0,H.H,-hz/2-.5,H.L+2*t,.45,hz+1,ytAnc());
  for(const [x,z,ry,w] of [[-9,3.4,.4,3.2],[10.5,4.2,-.6,2.6],[2.6,5.6,1.1,2.0]]){box('slab',x,YT_SLAB_T,z,w,.4,w*.55,ytAnc(),ry,0,.12);box('slab',x+.6,YT_SLAB_T,z-.4,.8,.5,.7,ytAnc(),ry*2);}
  ytWalkTarget('hall',0,YT_SLAB_T,hz-2.6);
  /* the occupation: two bay houses under the roofed back half, facing each other across the floor, the covered way between their
     porches in two runs whose open ends meet the hall (where the plug's door brings you in) */
  const zH=-2,xH=9;for(const s of [-1,1])place('yt_leng_bay_house',s*xH,zH,s*PI/2,{y:0,v:0,inHall:true});
  const xm=xH-YT_BAY.pz-.02;ytLengWay(-xm,zH,-1.1,zH);ytLengWay(xm,zH,1.1,zH);
  place('yt_leng_plug',0,hz+t/2,0,{y:0,v:0});
  /* the snow that blows in at the breach and lies under the fallen roof */
  for(const [x,z,r] of [[-3.5,hz-1.5,2.2],[4.5,hz-2.0,1.8],[-11,hz-3,2.0]])W(x,0,z,0,()=>ytShell('snow',[[r,YT_SLAB_T],[r*.6,YT_SLAB_T+.25],[.2,YT_SLAB_T+.32]],P('snow'),{seg:20}));
  CURREC.occupation={houses:2,ways:1,plugs:1};}});
