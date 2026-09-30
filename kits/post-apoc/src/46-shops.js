// prefix: sh
// ---------------------------------------------------------------- shops: food, armour, weapons, tinker, general store (46 shops, seeds 4600-4699)
// Every shop = one reclaimed core with an OPEN service front (counter + goods that read from 30 m), a SIGN board on posts, an AWNING socket per
// service opening, a banner pole, a roof flag and a wall emblem. Goods are drawn in 'plain' paint so they keep their colour.
const shWood=0x5c4630;
function shPost(x,z,h,r){beam('wood',[x,0,z],[x,h,z],r||.1,jc(shWood,.06),true,6);}
// the two posts a sign board stands on: base y0, top y1, board centre x, posts just behind the board at zb
function shSignPosts(x,zb,y0,y1,w){for(const sx of [-1,1]){beam('wood',[x+sx*(w/2-.3),y0,zb],[x+sx*(w/2-.3),y1,zb],.1,jc(shWood,.06),true,6);}
 beam('wood',[x-w/2+.2,y1-.05,zb+.02],[x+w/2-.2,y1-.05,zb+.02],.09,jc(shWood,.06));}
// a hanging rail with goods: kind fish|meat|tools|wire|caps|pots|bottles
function shHang(x0,x1,y,z,n,kind){beam('iron',[x0,y,z],[x1,y,z],.05,jc(0x4a4038,.05),true,6);
 for(let k=0;k<n;k++){const x=x0+(x1-x0)*(k+.5)/n+rr(-.05,.05);const len=rr(.12,.32);const yy=y-len;beam('plain',[x,y,z],[x,yy,z],.012,jc(0x6a5a44,.05),true,3);
  if(kind==='fish'){const c=pick([0xc8ccc8,0xb8bcb4,0xd8b98a]);box('plain',x-.05,yy-.8,z-.09,.1,.8,.18,jc(c,.05),0,0,rr(-.08,.08));box('plain',x-.1,yy-.92,z-.02,.2,.14,.04,jc(0xc9843a,.06));box('plain',x-.055,yy-.3,z-.1,.11,.06,.2,jc(0xc23a2a,.05));}
  else if(kind==='meat'){sph('plain',x,yy-.3,z,.17,jc(pick([0x8a2f24,0x9a3a2c,0x6a2a20]),.06),1.9);}
  else if(kind==='tools'){const t=k%3;if(t===0)box('iron',x-.02,yy-.45,z,.045,.45,.03,jc(0x8a8a86,.06));else if(t===1)cylH('iron',x,yy-.25,z,.22,.03,jc(0x9a9a92,.06),'z',12);else{box('wood',x-.02,yy-.5,z,.05,.5,.05,jc(0x6a4a30,.06));box('iron',x-.1,yy-.62,z,.2,.13,.06,jc(0x6a6a66,.06));}}
  else if(kind==='wire'){tire(x,yy-.22,z,.24,.05,jc(pick([0xb86a3a,0xc98a3a,0x3a5a8a]),.06),0,PI/2,0);}
  else if(kind==='caps'){cylH('iron',x,yy-.2,z,.2,.05,jc(pick([0xc8ccd0,0xa8acb0,0xb87a4a]),.06),'z',12);}
  else if(kind==='pots'){cyl('iron',x,yy-.3,z,.14,.28,jc(pick([0x8a8a86,0xb8683a,0x4a6a8a]),.08),8,.18);}
  else if(kind==='bottles'){const c=pick([0x3f9a52,0xc98a2a,0x2f62b8,0xd5ecea]);cyl('glass',x,yy-.3,z,.05,.26,jc(c,.05),6);}}}
// produce heap: little spheres of fruit/veg on a tray at (x,y,z) w x d
function shGoods(x,y,z,w,d,cols){const n=Math.round(w*d*10);for(let k=0;k<n;k++){const px=x+rr(-w/2+.08,w/2-.08),pz=z+rr(-d/2+.08,d/2-.08);const h=(1-Math.abs(px-x)/(w/2))*.08;sph('plain',px,y+.1+h+rr(0,.04),pz,rr(.09,.14),jc(pick(cols||[0xc23a2a,0xd8a02a,0x5a9a3a,0xe07a2a,0x8a3a5a]),.08));}}
function shCrateProduce(x,y,z,s,ry,cols){crate(x,y,z,s,ry);const h=s*.46;shGoods(x,y+h,z,s*.85,s*.85,cols);}
// mannequin post wearing scrap armour: tyre-tread torso, hubcap shoulders, can helmet
function shMannequin(x,z,y0,o){o=o||{};const c=o.cap||pick([0xc8ccd0,0xb87a4a,0xa8acb0,0xc9a03a]);
 box('plank',x,y0,z,.6,.12,.6,jc(0x6a5238,.06));beam('wood',[x,y0+.12,z],[x,y0+1.05,z],.09,jc(shWood,.06),true,6);
 for(let k=0;k<4;k++)tire(x,y0+1.0+k*.16,z,.33-Math.abs(k-1.5)*.02,.1,jc(k===1?(o.band||0xc23a2a):0x3a3634,.05),rng()*TAU);
 beam('wood',[x,y0+1.55,z],[x,y0+1.9,z],.09,jc(shWood,.06),true,6);
 for(const sx of [-1,1]){cylH('iron',x+sx*.42,y0+1.5,z,.25,.07,jc(c,.06),'x',12);box('rubber',x+sx*.46,y0+.8,z,.09,.7,.09,jc(0x2a2624,.05),0,0,-sx*.1);}
 cylH('iron',x,y0+1.3,z+.3,.26,.06,jc(c,.06),'z',14);box('cloth',x-.3,y0+.7,z-.24,.6,1.0,.03,jc(o.cape||0xc23a2a,.06));
 if(o.kind===1){for(let k=0;k<3;k++)cylH('iron',x,y0+.86+k*.02,z+.2,.32-k*.02,.03,jc(0x8a8a86,.06),'z',10);}     // a belt of plates
 sph('iron',x,y0+1.98,z,.19,jc(o.helm||0x9a9a92,.05),1.05);box('iron',x-.12,y0+1.9,z+.16,.24,.04,.03,jc(0x1a1816,.03));
 if(o.crest)box('plain',x-.04,y0+2.12,z-.14,.08,.26,.3,jc(pick([0xc23a2a,0xd8a02a,0x2a8a86]),.06));}
// a small counter: width w along x from x0, front at z (front face), depth d, height h
function shCounter(x,z,w,d,h,col){box('plank',x,0,z,w,h-.06,d,jc(col||0x7a5a3c,.06));box('plank',x,h-.06,z,w+.12,.07,d+.12,jc(0x9a7a52,.06));
 box('corr',x,.05,z+d/2+.01,w-.1,h-.2,.03,PAINT());}
function shShelf(x,y,z,w,levels,gap,cols){for(let l=0;l<levels;l++){const yy=y+l*gap;box('plank',x,yy,z,w,.05,.36,jc(0x6a5238,.06));
  const n=Math.round(w/.22);for(let k=0;k<n;k++){const bw=rr(.1,.2),bh=rr(.12,gap*.7);box('plain',x-w/2+(k+.5)*w/n,yy+.05,z+rr(-.04,.04),bw,bh,rr(.14,.24),jc(pick(cols||[0xc23a2a,0x2f62b8,0xd8a02a,0x5a9a3a,0xb8b0a0,0x8a5a3a]),.08));}}
 for(const sx of [-1,1])box('plank',x+sx*(w/2),y,z,.05,levels*gap,.36,jc(0x5c4630,.06));}
function shBanner(x,z,h){beam('wood',[x,0,z],[x,h+.05,z],.08,jc(shWood,.06),true,6);sock('banner',x,h,z+.05,0,{w:.8,h:2.0});}
// ---------------------------------------------------------------- 4610 food shop
defBuilding({key:'shop-food',name:'Food shop',seed:4610,tags:{type:['market/shop'],size:'small',core:'shipping container',materials:['container','plank','sheet metal','brick']},w:15,d:8,h:6,build:shFood});
function shFood(o){
 const cx=-1,cz=-2.6,fz=cz+CT.W/2,L=CT.L20;const col=[0xc99a2e,0x3b7f8e,0x7a9a3c][(o.v|0)%3];
 W(cx,0,cz,0,()=>container({len:L,open:'front',col:col}));
 // inside: drying rail with fish and smoked meat, back shelves, a barrel of pickles
 shHang(cx-2.7,cx+.2,2.2,cz-.2,9,'fish');shHang(cx+.4,cx+2.7,2.2,cz-.2,5,'meat');
 shShelf(cx-.4,.55,cz-.95,4.6,3,.55);for(let k=0;k<2;k++)barrel(cx+2.4,.1,cz+.3+k*.6);
 // counter with produce, scales, a stack of loaves, a tray of eggs
 shCounter(cx-1.0,fz-.15,4.6,.7,1.05);shGoods(cx-2.2,1.05,fz-.15,1.2,.55);shGoods(cx-.6,1.05,fz-.15,1.0,.55,[0xd8a02a,0xe0b060,0xc88a3a]);
 for(let k=0;k<4;k++)sph('plain',cx+.7+k*.18,1.17,fz-.15,.13,jc(0xc8843a,.06),.7);
 box('iron',cx+1.35,1.11,fz-.1,.3,.05,.3,jc(0x8a8a86,.06));cyl('iron',cx+1.35,1.16,fz-.1,.03,.3,jc(0x6a6a66,.06),6);
 // sacks of grain and crates of produce out front, barrels, a fish box
 sacks(cx-3.9,0,fz+.6,5,.2);sacks(cx-3.7,.02,fz+1.2,3,-.2);
 shCrateProduce(cx+2.0,0,fz+.7,.7,.2);shCrateProduce(cx+2.0,.7,fz+.7,.6,.4,[0x5a9a3a,0x7ab04a]);shCrateProduce(cx+2.9,0,fz+.5,.65,0,[0xe07a2a,0xd8a02a]);
 shCrateProduce(cx-1.0,0,fz+1.5,.6,.3,[0xc23a2a,0xe07a2a]);
 barrel(cx+3.4,0,fz+1.1,0x2f62b8);barrel(cx+3.9,0,fz+.6,0x8a3a2c);
 // grill and oven: a brick body with a coal bed and a stovepipe, a chopping block
 const ox=cx+6.0,oz=-1.9;box('earth',ox,0,oz,1.5,1.0,1.1,jc(0x8a4a3a,.06));box('iron',ox,1.0,oz,1.6,.06,1.2,jc(0x3a3430,.05));
 box('glow',ox-.3,1.06,oz+.02,.7,.04,.7,jc(0xff8a3a,.08));for(let k=0;k<6;k++)box('iron',ox-.6+k*.24,1.12,oz,.03,.03,.9,jc(0x2a2826,.03));
 box('glow',ox+.1,.25,oz+.56,.6,.4,.03,jc(0xff9a3a,.06));box('iron',ox,.6,oz+.55,.9,.05,.03,jc(0x1a1816,.04));
 stovepipe(ox+.55,1.06,oz-.35,3.0);for(let k=0;k<3;k++)sph('plain',ox+.55+k*.05,4.4+k*.5,oz-.35,.2+k*.1,jc(0xd8d8d0,.03),.7);
 box('wood',ox+1.35,0,oz+.4,.45,.5,.45,jc(0x8a6a44,.07));
 // side lean-to stall (left): a patchwork back wall, a table of produce and dried goods, its own awning
 const sx=-6.6;patchWall(sx,0,-3.55,3.9,2.7,0);for(const q of [-1,1])shPost(sx+q*1.85,-1.0,2.2);
 box('plank',sx,0,-1.0,3.5,.9,.9,jc(0x8a6a44,.07));box('plank',sx,.9,-1.0,3.7,.06,1.0,jc(0xa08258,.06));
 shGoods(sx-1.0,.96,-1.0,1.2,.8);shGoods(sx+.3,.96,-1.0,1.0,.8,[0x5a9a3a,0x7ab04a,0xe07a2a]);for(let k=0;k<3;k++)barrel(sx+1.2+k*.02,.96,-1.0+(k-1)*.28,undefined,{open:true});
 shHang(sx-1.6,sx+1.6,2.35,-3.35,7,'bottles');
 // SOCKETS
 sock('sign',cx,3.3,fz-.1,0,{w:3.6,h:1.15,trade:'FOOD'});shSignPosts(cx,fz-.38,CT.H-.02,3.9,3.6);
 sock('awning',cx,2.72,fz,0,{w:5.6,d:1.7,drop:.6,h:2.12});
 sock('awning',sx,2.72,-3.5,0,{w:3.9,d:2.4,drop:.5,h:2.22});
 shBanner(cx+3.35,fz+1.7,4.6);
 sock('flag',cx-2.8,CT.H+1.6,cz+.6,0,{w:1.0,h:.6});sock('emblem',cx+L/2+.03,2.3,cz,PI/2,{w:.9,h:.9});
 sock('paint',cx+L/2+.03,1.5,cz+.2,PI/2,{w:1.4,h:1.0});}
// ---------------------------------------------------------------- 4620 armour shop
defBuilding({key:'shop-armor',name:'Armour shop',seed:4620,tags:{type:['market/shop'],size:'small',core:'shipping container',materials:['container','tyres','hubcaps','brick','sheet metal']},w:16,d:8,h:6.2,build:shArmor});
function shArmor(o){
 const cx=-1.4,cz=-3.3,fz=cz+CT.W/2,L=CT.L40;
 W(cx,0,cz,0,()=>container({len:L,open:'front',col:[0x7a3a2c,0x3b6f7e,0x4d6f3c][(o.v|0)%3]}));
 // inside: pegboard of helmets (cans, pots, bowls), plate racks, workbench with vice
 box('plank',cx+2.4,.9,cz-1.1,5.4,1.5,.05,jc(0x6a5238,.06));
 for(let r=0;r<2;r++)for(let k=0;k<7;k++){const x=cx+.2+k*.72;beam('wood',[x,1.15+r*.7,cz-1.07],[x,1.15+r*.7,cz-.86],.03,jc(0x2a2624,.05),true,4);
  sph('iron',x,1.27+r*.7,cz-.9,.15,jc(pick([0x9a9a92,0xb87a4a,0xc8ccd0,0x7a8a8a,0x8a4a3a]),.07),.95);if(k%2===0)box('plain',x-.03,1.32+r*.7,cz-.9,.06,.12,.2,jc(0xc23a2a,.06));}
 for(let k=0;k<3;k++){const x=cx-4.9+k*1.05;box('wood',x-.45,0,cz-.95,.06,1.7,.06,jc(shWood,.06));box('wood',x+.45,0,cz-.95,.06,1.7,.06,jc(shWood,.06));
  for(let q=0;q<5;q++)box(pick(['sheet','corr']),x-.36,.3+q*.28,cz-.95,.72,.22,.03,jc(pick([0x8a8a86,0xa8a49a,0x7a4a3a,0x3b6f7e]),.07),0,-.1);}
 box('plank',cx-1.6,0,cz-.8,2.4,.95,.6,jc(0x7a5a3c,.06));box('iron',cx-1.6,.95,cz-.8,2.5,.07,.7,jc(0x4a4038,.05));
 box('iron',cx-2.4,1.02,cz-.7,.22,.3,.16,jc(0x3a3430,.05));box('iron',cx-2.4,1.3,cz-.7,.1,.06,.1,jc(0x8a8a86,.05));
 for(let k=0;k<4;k++)box('iron',cx-1.6+k*.2,1.02,cz-.7,.12,.06,.5,jc(0x8a8a86,.06),.3*k);
 // display counter and front rack, grindstone, plate stack, tyre stock
 shCounter(cx+3.1,fz-.1,5.4,.6,1.0);for(let k=0;k<4;k++)box('sheet',cx+1.3+k*.9,1.0,fz-.1,.7,.04,.4,jc(pick([0x8a8a86,0xa8a49a,0x7a4a3a]),.06),0,0,rr(-.1,.1));
 for(let k=0;k<3;k++)shMannequin(cx-4.4+k*2.0,fz+.95,0,{kind:k===1?1:0,crest:k!==1,helm:pick([0x9a9a92,0xb87a4a]),cape:[0xc23a2a,0x2a8a86,0xd8a02a][k],band:[0xd8a02a,0xc23a2a,0x2a8a86][k]});
 // forge lean-to at the right end: sheet wind wall, a brick hearth with hood, anvil, bellows, quench barrel
 const fx=cx+L/2+2.2,fzc=-3.0;sheetWall(fx,0,fzc-.1,3.6,2.9,0,{col:0x8a8478});for(const q of [-1,1])shPost(fx+q*1.75,fzc+2.1,2.4);
 box('earth',fx,0,fzc+.7,1.7,.95,1.1,jc(0x8a4a3a,.06));box('iron',fx,.95,fzc+.7,1.8,.07,1.2,jc(0x3a3430,.05));box('glow',fx,.98,fzc+.75,.9,.06,.6,jc(0xff8a3a,.08));
 cone('glow',fx,1.0,fzc+.75,.3,.6,jc(0xffb050,.06),7);
 cone('iron',fx,1.55,fzc+.7,1.05,1.0,jc(0x4a4038,.05),8);pipe('iron',[[fx,2.5,fzc+.7],[fx,2.9,fzc-.3],[fx,3.6,fzc-.3],[fx,5.9,fzc-.3]],.15,jc(0x4a4038,.05));
 cyl('iron',fx,5.9,fzc-.3,.24,.06,jc(0x3a3430,.05),8);
 cyl('wood',fx-1.9,0,fzc+1.6,.25,.5,jc(0x6a4a30,.07),8);box('iron',fx-1.9,.5,fzc+1.6,.5,.12,.22,jc(0x3a3632,.05));cone('iron',fx-2.25,.62,fzc+1.6,.07,.24,jc(0x3a3632,.05),6);
 box('wood',fx+1.4,.3,fzc+.5,.55,.5,.7,jc(0x6a4a30,.07));cone('iron',fx+1.0,.75,fzc+.5,.2,.35,jc(0x4a4038,.05),6);
 cyl('sheet',fx+1.1,0,fzc+1.7,.32,.75,jc(0x3a5a8a,.06),10,.32,true);cyl('plain',fx+1.1,.7,fzc+1.7,.28,.02,jc(0x1a3a4a,.03),10);
 // yard: grindstone, tyre stock, plate stack
 for(const q of [-1,1])box('wood',cx+q*.5-4.5+9.4,0,fz+1.3,.08,.8,.08,jc(shWood,.06));
 cyl('conc',cx+4.9,.5,fz+1.3,.32,.08,jc(0x9a9488,.05),14);
 tireStack(cx+5.7,fz+1.0,4);tireStack(cx+5.7,fz+1.7,3);
 for(let k=0;k<5;k++)box('sheet',cx-6.7,k*.07,fz+.7,.9,.06,.7,jc(pick([0x8a8a86,0x7a4a3a]),.06),.1*k);
 // SOCKETS
 sock('sign',cx-1.2,3.3,fz-.1,0,{w:3.4,h:1.15,trade:'ARMOR'});shSignPosts(cx-1.2,fz-.38,CT.H-.02,3.9,3.4);
 sock('awning',cx-2.4,2.72,fz,0,{w:5.6,d:1.7,drop:.6,h:2.12});
 sock('awning',fx,2.98,fzc-.06,0,{w:3.6,d:2.4,drop:.5,h:2.48});
 shBanner(cx-L/2-.7,fz+.5,4.8);
 sock('flag',cx+2.5,CT.H+1.6,cz+.4,0,{w:1.0,h:.6});sock('emblem',cx-L/2-.03,2.3,cz,-PI/2,{w:.9,h:.9});sock('paint',cx+L/2+.03,1.4,cz,PI/2,{w:1.6,h:1.1});}
// ---------------------------------------------------------------- 4630 weapon shop
defBuilding({key:'shop-weapon',name:'Weapon shop',seed:4630,tags:{type:['market/shop'],size:'small',core:'school bus',materials:['bus body','sheet metal','plank','bars']},w:14,d:9,h:6.8,build:shWeapon});
function shSpear(x,z,h,ry,lean){const tx=Math.sin(ry)*lean,tz=Math.cos(ry)*lean;beam('wood',[x,0,z],[x+tx,h,z+tz],.045,jc(0x6a4a30,.06),true,5);
 cone('iron',x+tx,h,z+tz,.05,.3,jc(0xb8b8b0,.05),5);}
function shWeapon(o){
 const cx=-.6,cz=-2.9,fz=cz+1.2,L=10.6;
 W(cx,0,cz,0,()=>bus({len:L,col:[0x6a9a4a,0xc0502e,0x5a8a9a][(o.v|0)%3]}));
 // armouring: welded plates over the side windows, bars over the counter window, spikes along the roof edge
 for(const k of [0,1,2,4,5])box('sheet',cx-4.3+k*1.05+.4+.4,1.4,fz+.03,.9,.8,.04,jc(pick([0x8a8478,0x6a4a3a,0x7a7a70]),.06));
 const wx=cx-.25;for(let k=0;k<11;k++)box('iron',wx-1.0+k*.2,.95,fz+.08,.035,1.25,.035,jc(0x2a2826,.03));box('iron',wx,1.3,fz+.08,2.2,.05,.05,jc(0x2a2826,.03));
 box('plank',wx,1.0,fz+.1,2.4,.07,.65,jc(0x9a7a52,.06));box('plank',wx,.15,fz+.1,2.3,.85,.6,jc(0x6a5238,.06));
 for(let k=0;k<4;k++)box('iron',wx-.9+k*.6,1.07,fz+.5,.06,.16,.06,jc(0xa8a8a0,.05),0,0,rr(-.5,.5));           // blades on the counter
 for(let k=0;k<9;k++)cone('iron',cx-4.4+k*1.05,2.3,fz-.02,.06,.22,jc(0x6a6a66,.05),5);
 // guard post on the bus roof at the rear: platform, four posts, sheet roof, sandbag parapet, ladder
 const gx=cx-3.5,gz=cz;box('plank',gx,2.36,gz,2.4,.1,2.2,jc(0x6a5238,.06));for(const a of [-1,1])for(const b of [-1,1])beam('wood',[gx+a*1.05,2.4,gz+b*.95],[gx+a*1.05,4.6,gz+b*.95],.09,jc(shWood,.06),true,6);
 roofP('corr',gx-1.4,gx+1.4,gz+1.3,4.4,gz-1.3,4.9,.07,P('rust'));sacks(gx-.4,2.46,gz+1.0,6,0);box('plank',gx,2.46,gz-1.0,2.2,.5,.1,jc(0x7a6448,.07));
 ladder(gx-1.2,0,gz+1.25,2.4,0);
 // fence wall across the front with a gate gap; racks of spears, blades and pipe clubs on the outside
 const fzn=2.7;fenceRun(-6.6,fzn,wx-1.8,fzn,1.3,{type:'sheet'});fenceRun(wx+1.8,fzn,6.6,fzn,1.3,{type:'sheet'});
 for(let k=0;k<20;k++){const x=-6.5+k*.68;if(x>wx-2&&x<wx+2)continue;cone('iron',x,1.3,fzn,.06,.28,jc(0x8a8a86,.05),5);}
 for(const q of [-5.2,-3.7]){box('wood',q+.7,.9,fzn+.55,1.4,.06,.08,jc(shWood,.06));}
 for(let k=0;k<7;k++)shSpear(-5.9+k*.22,fzn+.5,rr(2.1,2.5),.0,.05);
 for(let k=0;k<6;k++){const x=-4.3+k*.24;box('iron',x,.55,fzn+.55,.09,1.1,.025,jc(pick([0xb8b8b0,0x9a9a92]),.05),0,0,rr(-.06,.06));box('wood',x,.4,fzn+.55,.05,.18,.05,jc(0x4a3220,.06));}
 for(let k=0;k<5;k++){const x=-2.7+k*.3;beam('iron',[x,0,fzn+.5],[x+.1,1.45,fzn+.55],.07,jc(0x5a5a56,.05),true,6);sph('iron',x+.1,1.5,fzn+.55,.1,jc(0x4a4a46,.05));}
 for(const q of [3.6,6.0]){beam('wood',[q,0,fzn+.55],[q,1.5,fzn+.55],.08,jc(shWood,.06),true,6);}box('wood',4.8,1.3,fzn+.55,2.5,.06,.06,jc(shWood,.06));
 for(let k=0;k<7;k++){const x=3.85+k*.3;beam('wood',[x,1.28,fzn+.55],[x+.02,.7,fzn+.55],.03,jc(0x4a3220,.05),true,4);box('iron',x-.02,.15,fzn+.55,.04,.55,.02,jc(0x9a9a92,.05));}
 // archery target: a straw disc on an A-frame, arrows stuck in it; hay bales; crates of arrows and a barrel of spears
 const tx=5.4,tz=.3;for(const q of [-1,1])beam('wood',[tx+q*.7,0,tz-.6],[tx+q*.15,1.6,tz-.2],.07,jc(shWood,.06),true,5);
 cylH('plain',tx,1.55,tz-.02,.85,.12,jc(0xc8a860,.05),'z',16);box('wood',tx-.06,1.0,tz-.16,.12,1.2,.05,jc(shWood,.06));[[.7,0xd8d0c0],[.5,0x2a5a8a],[.32,0xc23a2a],[.14,0xe0b830]].forEach(([r,c],i)=>cylH('plain',tx,1.55,tz+.08+i*.012,r,.03,jc(c,.03),'z',16));
 for(let k=0;k<4;k++){const a=k*1.5+.4,r=rr(.1,.5);beam('wood',[tx+Math.cos(a)*r,1.55+Math.sin(a)*r,tz+.5],[tx+Math.cos(a)*r,1.55+Math.sin(a)*r,tz+.12],.02,jc(0xd0c0a0,.05),true,4);}
 for(let k=0;k<3;k++)box('plain',tx-1.4+k*.7,0,tz+2.2,.6,.36,.36,jc(0xb89a4a,.06));
 for(let k=0;k<2;k++)crate(4.7+k*.7,0,fzn-.7,.7,rr(-.2,.2));barrel(6.3,0,fzn-.8,0x5a5a56);for(let k=0;k<4;k++)shSpear(6.3+rr(-.1,.1),fzn-.8,rr(1.5,1.9),k*1.5,.18);
 shBanner(6.8,fzn+1.0,4.4);
 // SOCKETS
 sock('sign',cx+.8,3.55,cz+.75,0,{w:3.4,h:1.15,trade:'WEAPONS'});shSignPosts(cx+.8,cz+.55,2.4,4.15,3.4);
 sock('awning',wx,2.32,fz+.02,0,{w:2.7,d:1.45,drop:.45,h:1.87});
 sock('flag',gx,4.9+1.6,gz,0,{w:1.0,h:.6});sock('emblem',cx-4.6-.03,2.0,cz,-PI/2,{w:.9,h:.9});sock('paint',cx+2.7,1.9,fz+.03,0,{w:1.6,h:.8});}
// ---------------------------------------------------------------- 4640 tinker's shop
defBuilding({key:'shop-tinker',name:"Tinker's shop",seed:4640,tags:{type:['market/shop'],size:'small',core:'shipping container',materials:['container','salvage','tyres','wire']},w:16,d:8,h:11,build:shTinker});
function shTinker(o){
 const cx=.9,cz=-3.0,fz=cz+CT.W/2,L=CT.L20;
 W(cx,0,cz,0,()=>container({len:L,open:'front',col:[0x3b7f8e,0xb8502e,0x7a9a3c][(o.v|0)%3]}));
 // inside: shelves crammed with bits, hanging tools, coils of wire, radios
 shShelf(cx,.5,cz-.95,5.6,3,.55,[0x8a5a3a,0x3b7f8e,0xc9a03a,0x6a6a66,0xc23a2a,0x2a2826]);
 shHang(cx-2.7,cx-.1,2.15,cz+.1,6,'tools');shHang(cx+.2,cx+2.7,2.15,cz+.1,5,'wire');
 for(let k=0;k<3;k++){box('iron',cx+1.6+k*.5,1.62,cz-.85,.4,.3,.3,jc(0x3a3430,.05));cylH('iron',cx+1.6+k*.5,1.85,cz-.7,.05,.12,jc(0xb0b0a8,.05),'x',6);}
 // front: a long counter of junk, a hanging bike wheel and tyres on the end wall, the cart
 shCounter(cx,fz-.1,5.6,.6,.95,0x5a5a56);for(let k=0;k<9;k++){const px=cx-2.4+k*.6;box('plain',px,.95,fz-.1,rr(.14,.3),rr(.12,.34),rr(.14,.3),jc(pick([0xb8683a,0x2f62b8,0xc9a03a,0x6a6a66,0xc23a2a]),.08),rng()*TAU);}
 tire(cx+L/2+.15,1.5,cz+.1,.5,.09,undefined,0,0,PI/2);tire(cx+L/2+.15,.6,cz-.5,.4,.09,undefined,0,0,PI/2);
 // radio mast on the roof with a dish and cable: lattice legs, cross rungs, a dish, a whip antenna
 const mx=cx-1.6,mz=cz;for(const [a,b] of [[-.3,-.3],[.3,-.3],[.3,.3],[-.3,.3]])beam('iron',[mx+a,CT.H,mz+b],[mx+a*.35,CT.H+6.2,mz+b*.35],.05,jc(0x6a5a4c,.05),true,5);
 for(let k=0;k<7;k++){const y=CT.H+.4+k*.85,s=.3*(1-(k*.85+.4)/6.6);beam('iron',[mx-s,y,mz-s],[mx+s,y,mz+s],.03,jc(0x6a5a4c,.05),true,4);beam('iron',[mx+s,y,mz-s],[mx-s,y,mz+s],.03,jc(0x6a5a4c,.05),true,4);}
 antenna(mx,CT.H+6.2,mz,2.2);
 pushM(TF(mx+.5,CT.H+4.6,mz+.35,.5,-1.0,0));cyl('iron',0,0,0,.9,.14,jc(0xc8ccd0,.05),16,.3);cyl('iron',0,.02,0,.07,.5,jc(0x4a4038,.05),6);popM();
 for(let k=0;k<3;k++)beam('plain',[mx+.3,CT.H+3.2,mz+.3],[cx+2.9,CT.H,cz+.5],.02,jc(0x1a1816,.03),true,3);
 // second stall on the left with a workbench and vice, patchwork back wall, hanging bits
 const sx=-5.4;patchWall(sx,0,-3.55,3.4,2.7,0);for(const q of [-1,1])shPost(sx+q*1.65,-1.1,2.2);
 box('plank',sx,0,-1.6,3.0,.95,.9,jc(0x6a5238,.06));box('plank',sx,.95,-1.6,3.2,.06,1.0,jc(0x8a7048,.06));
 box('iron',sx+.9,1.01,-1.35,.22,.24,.18,jc(0x3a3430,.05));box('iron',sx+.9,1.24,-1.35,.3,.05,.14,jc(0x8a8a86,.05));cyl('iron',sx+.9,1.0,-1.1,.02,.3,jc(0x8a8a86,.05),5);
 for(let k=0;k<6;k++)box('plain',sx-1.2+k*.3,1.01,-1.7,rr(.12,.24),rr(.1,.2),rr(.12,.2),jc(pick([0x8a8a86,0xb8683a,0xc9a03a]),.08),rng()*TAU);
 shHang(sx-1.5,sx+1.5,2.3,-3.35,6,'caps');
 // yard: a two-wheel cart with a load, tyre pile, junk heaps, barrels of scrap, a lamp
 const kx=6.1,kz=-.6;box('plank',kx,.6,kz,1.8,.14,1.1,jc(0x7a5a3c,.06));for(const q of [-1,1]){tire(kx+.1,.5,kz+q*.65,.5,.09,undefined,0,0,PI/2);box('plank',kx-.9+.02,.7,kz+q*.5,.06,.4,.06,jc(shWood,.06));}
 beam('wood',[kx-.9,.7,kz-.4],[kx-2.0,.4,kz-.4],.07,jc(shWood,.06),true,5);beam('wood',[kx-.9,.7,kz+.4],[kx-2.0,.4,kz+.4],.07,jc(shWood,.06),true,5);box('wood',kx-2.0,0,kz,.1,.4,.9,jc(shWood,.06));
 for(let k=0;k<5;k++)box('plain',kx-.5+rr(-.5,.5),.74+(k%2)*.3,kz+rr(-.3,.3),rr(.3,.6),rr(.25,.45),rr(.3,.5),jc(pick([0x8a3a2c,0x2f62b8,0x6a6a66,0xc9a03a]),.08),rng()*TAU);
 tireStack(cx+4.1,fz+1.2,5);tireStack(cx+4.1,fz+1.9,3);junkPile(-6.6,-.5,1.6,12);junkPile(-3.4,1.4,1.2,9);junkPile(6.4,2.6,1.3,8);
 barrel(cx-3.6,0,fz+.6);barrel(cx-4.0,0,fz+1.0);lamp(cx+2.2,0,fz+2.0,3.0);
 // SOCKETS
 sock('sign',cx+.4,3.3,fz-.1,0,{w:3.4,h:1.15,trade:'TINKER'});shSignPosts(cx+.4,fz-.38,CT.H-.02,3.9,3.4);
 sock('awning',cx,2.72,fz,0,{w:5.8,d:1.7,drop:.6,h:2.12});sock('awning',sx,2.72,-3.5,0,{w:3.4,d:2.4,drop:.5,h:2.22});
 shBanner(cx+3.7,fz+2.5,4.5);
 sock('flag',cx+2.4,CT.H+1.6,cz-.4,0,{w:1.0,h:.6});sock('emblem',cx+L/2+.03,2.25,cz,PI/2,{w:.9,h:.9});sock('paint',cx-L/2-.03,1.6,cz,-PI/2,{w:1.4,h:1.0});}
// ---------------------------------------------------------------- 4650 general store
defBuilding({key:'shop-general',name:'General store',seed:4650,tags:{type:['market/shop'],size:'medium',core:'shipping container',materials:['containers','corrugated sheet','plank']},w:15,d:8,h:5.2,build:shGeneral});
function shGeneral(o){
 const cz=-3.2,fz=cz+CT.W/2,L=CT.L20;const cA=[0x3b7f8e,0xc9852a,0x8a3a2c][(o.v|0)%3],cB=[0xc99a2e,0x4d6f3c,0x3b7f8e][(o.v|0)%3];
 W(-L/2,0,cz,0,()=>container({len:L,col:cA,doorEnd:false}));W(L/2,0,cz,0,()=>container({len:L,col:cB,doorEnd:false}));
 // roof of mixed sheet lapped over both boxes, a lean-to porch roof over the centre, deck and posts
 roofP('corr',-6.5,0,cz+1.5,2.72,cz-1.5,3.05,.07,P('rust'));roofP('corr',0,6.5,cz+1.5,2.72,cz-1.5,3.05,.07,P('galv'));box('iron',0,2.65,cz+1.5,13,.08,.1,jc(0x5a4a3c,.05));
 const px0=-3.6,px1=3.6;deck((px0+px1)/2,.3,fz+1.5,px1-px0,3.0,{posts:false,rail:['l','r']});for(let k=0;k<6;k++)box('conc',px0+.3+k*1.36,0,fz+2.9,.5,.3,.5,jc(0x8a8478,.06));
 roofP('corr',px0,px1,fz+3.3,2.35,fz-.05,2.72,.06,P('paint'));beam('wood',[px0,2.35,fz+3.3],[px1,2.35,fz+3.3],.12,jc(shWood,.06));
 for(const x of [px0,-1.2,1.2,px1])beam('wood',[x,.3,fz+3.25],[x,2.4,fz+3.25],.12,jc(shWood,.06),true,6);
 stairs(-1.6,0,fz+4.4,-1.6,.3,fz+3.4,1.4,{rail:false});
 // doors and windows: a door, a big display window and a service hatch under the porch, windows on the wings
 door(-.9,.3,fz,1.1,2.0,{step:false});win(1.6,1.0,fz,2.2,1.0,{lit:o.v===1});box('plank',1.6,.3,fz+.3,2.5,.08,.5,jc(0x8a6a44,.06));
 win(-4.9,1.0,fz,1.7,.9,{shutters:true});win(4.9,1.0,fz,1.7,.9,{bars:true});
 // goods: hanging on the porch beam, barrels, sacks, a bench, crates, a hitching post
 shHang(px0+.2,px1-.2,2.3,fz+3.25,12,'pots');beam('plain',[-1.2,2.3,fz+3.25],[3.0,2.3,fz+3.25],.01,jc(0x6a5a44,.05));
 bottleString([px0+.3,2.25,fz+3.2],[px1-.3,2.25,fz+3.2],8);
 for(let k=0;k<3;k++){barrel(2.6+k*.02,.3,fz+2.4+k*.55,pick([0x8a3a2c,0x2f62b8,0x4d6f3c]));}sacks(-3.0,.3,fz+2.5,6,.1);shCrateProduce(2.9,.3,fz+.7,.6,.2);
 box('plank',.4,.3,fz+.6,1.6,.5,.4,jc(0x8a6a44,.07));box('plank',.4,.8,fz+.4,1.6,.5,.06,jc(0x8a6a44,.07),0,-.2);
 for(let k=0;k<3;k++)barrel(-6.4+k*.5,0,fz+.5+k*.15,undefined);sacks(-6.0,0,fz+2.0,5,.3);crate(-4.6,0,fz+1.6,.8,.2);crate(-4.6,.8,fz+1.6,.6,.5);
 // hitching post at the right: two posts, a rail, rings
 for(const q of [5.0,7.0])beam('wood',[q,0,fz+2.2],[q,1.3,fz+2.2],.12,jc(shWood,.06),true,6);beam('wood',[5.0,1.15,fz+2.2],[7.0,1.15,fz+2.2],.09,jc(shWood,.06),true,6);
 for(const q of [5.4,6.6])tire(q,.95,fz+2.2,.1,.02,jc(0x8a8a86,.05),0,PI/2,0);
 tireStack(6.3,fz+.9,3);lamp(-7.0,0,fz+1.0,3.2);
 // SOCKETS
 sock('sign',0,4.05,fz-.1,0,{w:5.4,h:1.5,trade:'GENERAL'});shSignPosts(0,fz-.5,3.0,4.85,5.4);
 sock('awning',-4.9,2.1,fz,0,{w:2.4,d:1.2,drop:.4,h:1.7});sock('awning',4.9,2.1,fz,0,{w:2.4,d:1.2,drop:.4,h:1.7});
 shBanner(6.9,fz+.9,4.6);sock('flag',-5.4,3.05+1.6,cz,0,{w:1.0,h:.6});
 sock('emblem',-L-.03,2.25,cz,-PI/2,{w:.9,h:.9});sock('paint',L+.03,1.5,cz,PI/2,{w:1.6,h:1.1});}
