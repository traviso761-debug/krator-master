// prefix: yt
// ================================================================= THE FOREST-STEPPE SET (PLAN.md section 6, Y6)
// Below the pycrete line, in Leng's forest-steppe (+2 C a year, larch on the shaded slopes and feather grass on the sunny ones:
// biomes/nwouterwall/PLAN.md), the Khaayken keep the Sakha's ways, as yt_balagan does (53-yt-balagan.js):
//   yt_urasa    the summer house: a tall cone of birch-bark panels sewn in bands over a ring of larch poles, the poles' tops
//               crossing out of the smoke hole; an open hearth; robes and the tea board round it. Unheated (summer: the hearth
//               cooks), its smoke hole the crown vent
//   yt_khoton   the byre beside the house: battered larch walls daubed with earth under a low sod roof, the stalls inside; the
//               hay stacked on a pole outside, the corral fence of split larch, the dung heap (the next winter's fuel and daub)
// On the sheet they stand in a row dressed with the nwouterwall kit's own flora, read in place (93b-bio-45-yt-flora.js).
const YT_URASA={R:3.0*YT_S,H:6.6,top:.38,poles:18,door:{hw:.5*YT_S,hv:.55,ys:1.35}};
function ytUrasaProf(R,H,top,dr){return [[R,0],[R*.86,H*.18],[R*.62,H*.42],[R*.36,H*.68],[top,H*.86]];}
defBuilding({key:'yt_urasa',name:'Summer house (the urasa)',seed:9951,w:2*YT_URASA.R+3,d:2*YT_URASA.R+3,h:YT_URASA.H+1.2,cut:true,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'common',role:'dwelling'},
 note:'the summer house of the forest-steppe: a cone of birch bark sewn in bands over larch poles, an open hearth under the smoke hole; robes and the tea board round it',
 build(o){const U=YT_URASA,R=U.R,H=U.H,prof=ytUrasaProf(R,H,U.top),dr={arch:U.door,grow:-.02};
  CURREC.season='summer';CURREC.layers=[{k:'larch',m:.02,note:'birch bark in sewn panels over the poles'}];CURREC.frost={ok:true,none:true};
  CURREC.heat={stove:{kind:'open hearth',note:'cooking; the house is a summer one'},lamps:0,fuel:['larch'],crownVent:+(U.top*2).toFixed(2),inlet:'the door',heated:false};
  /* the bark, outside and in; the bands where the panels' rows overlap, each with a ring of the Ob ornament */
  ytShell('birch',prof,P('birch'),{doors:[dr],seg:40});ytShell('birch',prof.map(([r,y])=>[r-.04,y]),P('birch'),{doors:[dr],seg:40,inward:true});
  for(const f of [.22,.44,.64]){const y=H*f,r=ytCatLerp(prof,y);if(y>U.door.ys+U.door.hv+.1)ytSweep('ob',[[r+.02,y-.12],[r*.985+.02,y+.12]],0,TAU,36,P('ice'),false,0);}
  /* the poles: from the ground round the foot to past the smoke hole, crossing */
  for(let i=0;i<U.poles;i++){const a=i/U.poles*TAU+.09,b=a+PI*.92;if(Math.abs(Math.atan2(Math.sin(a-PI/2),Math.cos(a-PI/2)))<.3)continue;   /* clear of the door */
   const p0=[Math.cos(a)*(R-.12),0,Math.sin(a)*(R-.12)],k=(H+.9)/(H*.86),p1=[Math.cos(b)*U.top*.5*k,H+.9,Math.sin(b)*U.top*.5*k];pole('larch',p0,p1,.055,P('larchOld'));}
  /* the door's larch frame and its felt curtain rolled up over it */
  const zf=R-.05;for(const s of [-1,1])pole('larch',[s*(U.door.hw+.05),0,zf+.02],[s*(U.door.hw+.05)*.9,U.door.ys+U.door.hv,zf-.25],.06,P('larch'));
  cyl('felt',0,U.door.ys+U.door.hv-.02,zf-.08,.09,U.door.hw*2.2,P('felt'),10);
  /* the floor: a bed of larch twigs and grass on the earth; the hearth's stone ring and its fire */
  cyl('earth',0,-.02,0,R-.1,.04,P('earth'),32);ytWalkDisc(0,0,R-.15,.02);
  for(let i=0;i<10;i++){const a=i/10*TAU;sph('slab',Math.cos(a)*.55,.06,Math.sin(a)*.55,.13,P('slab'),.7,8);}
  box('glow',0,.05,0,.5,.06,.4,P('ember'));haloAt(0,.4,0,0xff8a30,true);smokeAt(0,H+.6,0,{r:.25,kind:'chimney'});
  /* the household's things round the hearth: the robes against the back, the tea board, a chest, the pot by the fire */
  FURNISH('khaayken_poor_robes',0,.02,-R+1.35,0);FURNISH('khaayken_poor_robes',-R+1.45,.02,-.4,PI/2);
  FURNISH('khaayken_common_tea_board',1.0,.02,-.7,-.5);FURNISH('khaayken_common_chest',R-1.15,.02,-.9,-PI/2);FURNISH('khaayken_common_pot',.9,.02,.55,-PI/2);
  FURNISH('generic_floor_basket',-1.3,.02,1.3,.5);
  ytWalkTarget('room',0,.02,1.4);ytWalkTarget('outside',0,0,R+1.2);door(0,0,R,0,U.door.hw*2);}});
/* a profile's radius at height y (linear between its points) */
function ytCatLerp(prof,y){for(let j=1;j<prof.length;j++){const a=prof[j-1],b=prof[j];if(y>=a[1]&&y<=b[1]){const f=(y-a[1])/(b[1]-a[1]||1);return a[0]+(b[0]-a[0])*f;}}return prof[prof.length-1][0];}
/* the byre */
const YT_KHOTON=(()=>{const S=YT_S;return {S,hx:3.6*S,hz:2.4*S,bat:.45,H:1.95*S,wt:.3,door:{w:1.3*S,h:1.7*S}};})();
defBuilding({key:'yt_khoton',name:'Byre (the khoton), its hay and its corral',seed:9953,w:2*YT_KHOTON.hx+12,d:2*YT_KHOTON.hz+9,h:YT_KHOTON.H*1.6+1,cut:true,budget:70000,
 tags:{types:['farm'],wealth:'middle',style:'common',role:'byre',job:'herding'},
 note:'the forest-steppe byre: battered larch walls daubed with earth under a low sod roof, stalls inside; the hay stacked on its pole, a corral fence of split larch, the dung heap',
 build(o){const B=YT_KHOTON,hx=B.hx,hz=B.hz,tx=hx-B.bat,tz=hz-B.bat,H=B.H,wt=B.wt,season=YT_SEASONS[(o.v|0)%3];
  CURREC.season=season;CURREC.layers=[{k:'larch',m:.2},{k:'earth',m:.3}];CURREC.frost={ok:true,none:true};
  CURREC.heat={stove:null,lamps:0,heated:false,crownVent:.25,inlet:'the door',note:'the beasts\' own warmth'};
  const bx=-3.2;W(bx,0,0,0,()=>{
   const dg={u0:.5-B.door.w/2/(2*hx),u1:.5+B.door.w/2/(2*hx),v0:B.door.h/H};
   const sides=[[[-hx,0,-hz],[hx,0,-hz],[-tx,H,-tz],[tx,H,-tz],[0,0,1],null],[[hx,0,hz],[-hx,0,hz],[tx,H,tz],[-tx,H,tz],[0,0,-1],'s'],
    [[hx,0,-hz],[hx,0,hz],[tx,H,-tz],[tx,H,tz],[-1,0,0],null],[[-hx,0,hz],[-hx,0,-hz],[-tx,H,tz],[-tx,H,-tz],[1,0,0],null]];
   for(const [a,b,c,d,n,dd] of sides){const g=dd?{u0:1-dg.u1,u1:1-dg.u0,v0:dg.v0}:null,off=[-n[0]*wt,0,-n[2]*wt],sh=q=>q.map((v,i)=>v+off[i]);
    ytQuad('larch',a,b,c,d,P('larch'),n,g);ytQuad('earth',sh(a),sh(b),sh(c),sh(d),P('earth'),[-n[0],.3,-n[2]],g);ytQuad('larch',c,d,sh(c),sh(d),P('larch'),[0,1,0]);}
   for(const s of [-1,1])box('larch',s*(B.door.w/2+.06),0,hz-.1+wt/2,.12,B.door.h,wt+.25,P('larch'));WKOFF=1;box('larch',0,B.door.h-.05,hz-.1+wt/2,B.door.w+.3,.18,wt+.3,P('larch'));WKOFF=0;   /* the lintel: overhead, not a floor over the threshold (it hid the ground the walker steps out on) */
   /* the roof: larch poles, sod over them, low-pitched */
   const rx=tx+wt,rz=tz+wt,rh=.5,rl=Math.max(.3,rx-rz);
   ytQuad('larch',[-tx,H,-tz],[tx,H,-tz],[-tx,H,tz],[tx,H,tz],P('larch'),[0,-1,0]);
   ytQuad('turf',[-rx,H,rz],[rx,H,rz],[-rl,H+rh,0],[rl,H+rh,0],P('turf'),[0,1,1]);ytQuad('turf',[rx,H,-rz],[-rx,H,-rz],[rl,H+rh,0],[-rl,H+rh,0],P('turf'),[0,1,-1]);
   poly('turf',[[rx,H,rz],[rx,H,-rz],[rl,H+rh,0]],P('turf'));poly('turf',[[-rx,H,-rz],[-rx,H,rz],[-rl,H+rh,0]],P('turf'));
   /* inside: the earth floor bedded with straw, the stalls along the back wall, the manger */
   box('earth',0,-.04,0,2*hx-.1,.06,2*hz-.1,P('earth'));box('hay',0,.02,-hz+1.3,2*hx-.6,.04,1.6,P('hay'));
   for(let i=0;i<=4;i++){const x=-hx+.6+i*(2*hx-1.2)/4;box('larch',x,0,-hz+1.2,.08,1.05,1.6,P('larchOld'));}
   WKOFF=1;box('larch',0,.55,-.35,2*hx-1.2,.08,.08,P('larchOld'));WKOFF=0;   /* the stalls' rail: a beast's bar, not a wall to a walker */box('larch',0,.5,-hz+.35,2*hx-1.2,.35,.4,P('larch'));box('hay',0,.85,-hz+.35,2*hx-1.3,.12,.34,P('hay'));
   wkPad(0,0,2*hx-.4,2*hz-.4,0);
   const dW=B.door.w/2;ytWalkBlock(-hx-wt,hx+wt,-hz-wt,-hz,0,H);ytWalkBlock(-hx-wt,-hx,-hz,hz+wt,0,H);ytWalkBlock(hx,hx+wt,-hz,hz+wt,0,H);
   ytWalkBlock(-hx-wt,-dW,hz,hz+wt,0,H);ytWalkBlock(dW,hx+wt,hz,hz+wt,0,H);
   ytWalkTarget('stalls',0,0,.9);ytWalkTarget('outside',0,0,hz+wt+1.2);
   door(0,0,hz+wt-.1,0,B.door.w);svLeaf(0,0,hz+wt-.06,0,B.door.w*.96,B.door.h-.03,{mk:'larch',col:P('larch'),t:.06,style:'plank',name:'byre door'});
   FURNISH('generic_barrel',hx-.6,0,hz-.7,0);FURNISH('generic_fuel',-hx+.7,0,hz-.7,0);FURNISH('generic_sack',hx-.6,0,.4,0);FURNISH('generic_dairy',-hx+.7,0,.3,PI/2);});
  /* the hay stack on its pole (the stog), the corral of split larch, the dung heap by the door */
  const sx=hx+bx+3.6,sz=-1.8;pole('larch',[sx,0,sz],[sx,4.0,sz],.06,P('larchOld'));
  W(sx,0,sz,0,()=>ytShell('hay',[[1.5,0],[1.65,.9],[1.45,1.9],[.9,2.9],[.25,3.5],[.05,3.62]],P('hay'),{seg:24}));
  ytFence([[hx+bx+1.4,hz+.6],[hx+bx+6.2,hz+.6],[hx+bx+6.2,-hz-1.2],[hx+bx+1.4,-hz-1.2]],1.4);
  W(bx-hx-1.4,0,hz-.4,0,()=>ellip('earth',0,0,0,1.0,.5,.8,jc(0x5a4632,.05)));}});
