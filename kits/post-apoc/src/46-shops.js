// prefix: sh
// ---------------------------------------------------------------- shops: food, armour, weapons, tinker, general store (46 shops, seeds 4600-4699)
// Every shop = one reclaimed core with an OPEN service front (counter + goods that read from 30 m), a SIGN board on posts, an AWNING socket per
// service opening, a banner pole, a roof flag and a wall emblem. Goods are drawn in 'plain' paint so they keep their colour.
const shWood=0x5c4630;
function shPost(x,z,h,r){beam('wood',[x,0,z],[x,h,z],r||.1,jc(shWood,.06),true,6);}
// the two posts a sign board stands on: base y0, top y1, board centre x, posts just behind the board at zb
function shSignPosts(x,zb,y0,y1,w){for(const sx of [-1,1]){beam('wood',[x+sx*(w/2-.3),y0,zb],[x+sx*(w/2-.3),y1,zb],.1,jc(shWood,.06),true,6);}
 beam('wood',[x-w/2+.2,y1-.05,zb+.02],[x+w/2-.2,y1-.05,zb+.02],.09,jc(shWood,.06));}
// SHOP FURNITURE: catalog pieces placed through FURNISH (91f-furnish.js), or nothing where the interior set plans the room (the shop
// boxes: kits/interiors/sets/post-apoc.js furnishes them with ?interiors=1). The *Skip functions draw the random numbers the old
// drawing drew (a goods rail, a shelf, a heap of produce, a counter), so the structure drawn after them keeps its stream.
function shHangSkip(n,kind){let c=2;for(let k=0;k<n;k++)c+=4+(kind==='fish'?8:kind==='tools'?(k%3===2?4:2):3);rngSkip(c);}
function shGoodsSkip(w,d){rngSkip(Math.round(w*d*10)*7);}
function shShelfSkip(w,levels){rngSkip(levels*(2+Math.round(w/.22)*7)+4);}
function shCounterSkip(){rngSkip(4);PAINT();}
// a crate of produce (the catalog's: mixed fruit, or greens), its produce on top, not buried in it as the kit drew it
function shCrateProduce(x,y,z,s,ry,cols){rngSkip(5);shGoodsSkip(s*.85,s*.85);return FURNISH('pa_produce_crate',x,y,z,ry||0,{v:cols&&cols[0]===0x5a9a3a?1:0});}
// a mannequin post wearing scrap armour (the catalog's: crested, or with a belt of plates)
function shMannequin(x,z,y0,o){o=o||{};rngSkip(35-(o.cap?1:0)+(o.kind===1?6:0)+(o.crest?3:0));return FURNISH('pa_armour_mannequin',x,y0,z,0,{v:o.kind===1?1:0});}
function shBanner(x,z,h){beam('wood',[x,0,z],[x,h+.05,z],.08,jc(shWood,.06),true,6);sock('banner',x,h,z+.05,0,{w:.8,h:2.0});}
// ---------------------------------------------------------------- 4610 food shop
defBuilding({key:'shop-food',name:'Food shop',seed:4610,tags:{type:['market/shop'],size:'small',core:'shipping container',materials:['container','plank','sheet metal','brick']},w:15,d:8,h:6,build:shFood});
function shFood(o){
 const cx=-1,cz=-2.6,fz=cz+CT.W/2,L=CT.L20;const col=[0xc99a2e,0x3b7f8e,0x7a9a3c][(o.v|0)%3];
 W(cx,0,cz,0,()=>container({len:L,open:'front',col:col}));
 // inside: drying rail with fish and smoked meat, back shelves, a barrel of pickles
  // the box is a shop room the interior set plans: its rails, shelves, barrels and counter are the interiors'
 shHangSkip(9,'fish');shHangSkip(5,'meat');shShelfSkip(4.6,3);rngSkip(18);
 // counter with produce, scales, a stack of loaves, a tray of eggs
  shCounterSkip();entry(cx-1.0,0,fz+.2,4.6,2.4);/* front door: the service counter across the open container front */shGoodsSkip(1.2,.55);shGoodsSkip(1.0,.55);rngSkip(8+4);
 // sacks of grain and crates of produce out front, barrels, a fish box
 sacks(cx-3.9,0,fz+.6,5,.2);sacks(cx-3.7,.02,fz+1.2,3,-.2);
 shCrateProduce(cx+2.0,0,fz+.7,.7,.2);shCrateProduce(cx+2.0,.7,fz+.7,.6,.4,[0x5a9a3a,0x7ab04a]);shCrateProduce(cx+2.9,0,fz+.5,.65,0,[0xe07a2a,0xd8a02a]);
 shCrateProduce(cx-1.0,0,fz+1.5,.6,.3,[0xc23a2a,0xe07a2a]);
 barrel(cx+3.4,0,fz+1.1,0x2f62b8);barrel(cx+3.9,0,fz+.6,0x8a3a2c);
 // grill and oven: a brick body with a coal bed and a stovepipe, a chopping block
 const ox=cx+6.0,oz=-1.9;rngSkip(22);FURNISH('pa_brick_grill',ox,0,oz,0,{v:0,ax:-.3875});   // the catalog's grill oven (its flue and chopping block included)
 rngSkip(5);smokeAt(ox+.55,4.36,oz-.35,{r:.216,kind:'stove'});for(let k=0;k<3;k++)sph('plain',ox+.55+k*.05,4.4+k*.5,oz-.35,.2+k*.1,jc(0xd8d8d0,.03),.7);
 rngSkip(2);
 // side lean-to stall (left): a patchwork back wall, a table of produce and dried goods, its own awning
 const sx=-6.6;patchWall(sx,0,-3.55,3.9,2.7,0);for(const q of [-1,1])shPost(sx+q*1.85,-1.0,2.2);
 rngSkip(4);shGoodsSkip(1.2,.8);shGoodsSkip(1.0,.8);rngSkip(27);FURNISH('pa_market_table',sx,0,-1.0,0);   // the stall's table of produce and dried goods
 shHangSkip(7,'bottles');FURNISH('pa_goods_rail',sx,1.05,-3.35,0,{v:2});
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
  // the box is a shop room the interior set plans: its helmet board, plate racks and vice bench are the interiors'
 rngSkip(88+72+16);
 // display counter and front rack, grindstone, plate stack, tyre stock
 shCounterSkip();entry(cx+3.1,0,fz+.2,5.4,2.4);rngSkip(16);
 for(let k=0;k<3;k++)shMannequin(cx-4.4+k*2.0,fz+.95,0,{kind:k===1?1:0,crest:k!==1,helm:pick([0x9a9a92,0xb87a4a]),cape:[0xc23a2a,0x2a8a86,0xd8a02a][k],band:[0xd8a02a,0xc23a2a,0x2a8a86][k]});
 // forge lean-to at the right end: sheet wind wall, a brick hearth with hood, anvil, bellows, quench barrel
 const fx=cx+L/2+2.2,fzc=-3.0;sheetWall(fx,0,fzc-.1,3.6,2.9,0,{col:0x8a8478});for(const q of [-1,1])shPost(fx+q*1.75,fzc+2.1,2.4);
  // the open-air forge under the lean-to: the catalog's brick forge, rail anvil, bellows and quench drum
 rngSkip(14);FURNISH('pa_forge',fx,0,fzc+.7,0,{v:1,az:.095});
 rngSkip(6);FURNISH('pa_anvil',fx-1.9,0,fzc+1.6,0,{v:1,ax:.085});
 rngSkip(4);FURNISH('pa_bellows',fx+1.9,0,fzc+.5,-PI/2);
 rngSkip(4);FURNISH('pa_quench',fx+1.1,0,fzc+1.7,0,{v:1});
 // yard: grindstone, tyre stock, plate stack
  rngSkip(6);FURNISH('scrap_trade_grindstone',cx+4.9,0,fz+1.3,0);
 tireStack(cx+5.7,fz+1.0,4);tireStack(cx+5.7,fz+1.7,3);
 rngSkip(15);FURNISH('pa_scrap_bin',cx-6.7,0,fz+.7,0,{v:0});   // the plate stack: a bin of sorted sheet
 // SOCKETS
 sock('sign',cx-1.2,3.3,fz-.1,0,{w:3.4,h:1.15,trade:'ARMOR'});shSignPosts(cx-1.2,fz-.38,CT.H-.02,3.9,3.4);
 sock('awning',cx-2.4,2.72,fz,0,{w:5.6,d:1.7,drop:.6,h:2.12});
 sock('awning',fx,2.98,fzc-.06,0,{w:3.6,d:2.4,drop:.5,h:2.48});
 shBanner(cx-L/2-.7,fz+.5,4.8);
 sock('flag',cx+2.5,CT.H+1.6,cz+.4,0,{w:1.0,h:.6});sock('emblem',cx-L/2-.03,2.3,cz,-PI/2,{w:.9,h:.9});sock('paint',cx+L/2+.03,1.4,cz,PI/2,{w:1.6,h:1.1});}
// ---------------------------------------------------------------- 4630 weapon shop
defBuilding({key:'shop-weapon',name:'Weapon shop',seed:4630,tags:{type:['market/shop'],size:'small',core:'school bus',materials:['bus body','sheet metal','plank','bars']},w:14,d:9,h:6.8,build:shWeapon});
function shWeapon(o){
 const cx=-.6,cz=-2.9,fz=cz+1.2,L=10.6;
 W(cx,0,cz,0,()=>bus({len:L,col:[0x6a9a4a,0xc0502e,0x5a8a9a][(o.v|0)%3]}));
 // armouring: welded plates over the side windows, bars over the counter window, spikes along the roof edge
 for(const k of [0,1,2,4,5])box('sheet',cx-4.3+k*1.05+.4+.4,1.4,fz+.03,.9,.8,.04,jc(pick([0x8a8478,0x6a4a3a,0x7a7a70]),.06));
 const wx=cx-.25;for(let k=0;k<11;k++)box('iron',wx-1.0+k*.2,.95,fz+.08,.035,1.25,.035,jc(0x2a2826,.03));box('iron',wx,1.3,fz+.08,2.2,.05,.05,jc(0x2a2826,.03));
 rngSkip(16);FURNISH('pa_shop_counter',wx,0,fz+.42,0,{v:2});   // the counter at the barred window, standing clear of the bus flank
 for(let k=0;k<9;k++)cone('iron',cx-4.4+k*1.05,2.3,fz-.02,.06,.22,jc(0x6a6a66,.05),5);
 // guard post on the bus roof at the rear: platform, four posts, sheet roof, sandbag parapet, ladder
 const gx=cx-3.5,gz=cz;box('plank',gx,2.36,gz,2.4,.1,2.2,jc(0x6a5238,.06));for(const a of [-1,1])for(const b of [-1,1])beam('wood',[gx+a*1.05,2.4,gz+b*.95],[gx+a*1.05,4.6,gz+b*.95],.09,jc(shWood,.06),true,6);
 roofP('corr',gx-1.4,gx+1.4,gz+1.3,4.4,gz-1.3,4.9,.07,P('rust'));sacks(gx-.4,2.46,gz+1.0,6,0);box('plank',gx,2.46,gz-1.0,2.2,.5,.1,jc(0x7a6448,.07));
 ladder(gx-1.2,0,gz+1.25,2.4,0);
 // fence wall across the front with a gate gap; racks of spears, blades and pipe clubs on the outside
 const fzn=2.7;fenceRun(-6.6,fzn,wx-1.8,fzn,1.3,{type:'sheet'});fenceRun(wx+1.8,fzn,6.6,fzn,1.3,{type:'sheet'});entry(wx,0,fzn,3.4,2.0);/* front door: the gate gap */
 for(let k=0;k<20;k++){const x=-6.5+k*.68;if(x>wx-2&&x<wx+2)continue;cone('iron',x,1.3,fzn,.06,.28,jc(0x8a8a86,.05),5);}
  // the weapon racks against the outside of the fence: the catalog's spear rack, blades and pipe clubs, hung blades
 rngSkip(4+35);FURNISH('pa_weapon_rack',-5.24,0,fzn+.6,0,{v:0});
 rngSkip(36+20);FURNISH('pa_weapon_rack',-3.1,0,fzn+.62,0,{v:1});
 rngSkip(4+2+28);FURNISH('pa_weapon_rack',4.8,0,fzn+.55,0,{v:2});
 // archery target: a straw disc on an A-frame, arrows stuck in it; hay bales; crates of arrows and a barrel of spears
 const tx=5.4,tz=.3;rngSkip(28);FURNISH('pa_archery_target',tx,0,tz,0);
 rngSkip(6);FURNISH('pa_hay_bales',tx-.7,0,tz+2.2,0);
 for(let k=0;k<2;k++)crate(4.7+k*.7,0,fzn-.7,.7,rr(-.2,.2));rngSkip(8+24);FURNISH('pa_spear_drum',6.3,0,fzn-.8,0);
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
  // the box is a shop room the interior set plans: its shelves, hung tools and wire, radios and counter are the interiors'
 shShelfSkip(5.6,3);shHangSkip(6,'tools');shHangSkip(5,'wire');rngSkip(12);
 // front: a long counter of junk, a hanging bike wheel and tyres on the end wall, the cart
 shCounterSkip();entry(cx,0,fz+.2,5.6,2.4);rngSkip(9*7);
 tire(cx+L/2+.15,.78,cz-.6,.5,.09,undefined,0,0,PI/2);tire(cx+L/2+.15,.68,cz+.62,.4,.09,undefined,0,0,PI/2);
 // radio mast on the roof with a dish and cable: lattice legs, cross rungs, a dish, a whip antenna
 const mx=cx-1.6,mz=cz;for(const [a,b] of [[-.3,-.3],[.3,-.3],[.3,.3],[-.3,.3]])beam('iron',[mx+a,CT.H,mz+b],[mx+a*.35,CT.H+6.2,mz+b*.35],.05,jc(0x6a5a4c,.05),true,5);
 for(let k=0;k<7;k++){const y=CT.H+.4+k*.85,s=.3*(1-(k*.85+.4)/6.6);beam('iron',[mx-s,y,mz-s],[mx+s,y,mz+s],.03,jc(0x6a5a4c,.05),true,4);beam('iron',[mx+s,y,mz-s],[mx-s,y,mz+s],.03,jc(0x6a5a4c,.05),true,4);}
 antenna(mx,CT.H+6.2,mz,2.2);
 pushM(TF(mx+.5,CT.H+4.6,mz+.35,.5,-1.0,0));cyl('iron',0,0,0,.9,.14,jc(0xc8ccd0,.05),16,.3);cyl('iron',0,.02,0,.07,.5,jc(0x4a4038,.05),6);popM();
 for(let k=0;k<3;k++)beam('plain',[mx+.3,CT.H+3.2,mz+.3],[cx+2.9,CT.H,cz+.5],.02,jc(0x1a1816,.03),true,3);
 // second stall on the left with a workbench and vice, patchwork back wall, hanging bits
 const sx=-5.4;patchWall(sx,0,-3.55,3.4,2.7,0);for(const q of [-1,1])shPost(sx+q*1.65,-1.1,2.2);
 rngSkip(52);FURNISH('pa_vice_bench',sx,0,-1.6,0,{v:1});   // the stall's workbench with its vice
 shHangSkip(6,'caps');FURNISH('pa_goods_rail',sx,1.0,-3.35,0,{v:1});
 // yard: a two-wheel cart with a load, tyre pile, junk heaps, barrels of scrap, a lamp
 const kx=6.1,kz=-.6;rngSkip(57);FURNISH('pa_hand_cart',kx,0,kz,0,{v:0,ax:.585});   // the tinker's cart and its load
 tireStack(cx+4.1,fz+1.2,5);tireStack(cx+4.1,fz+1.9,3);junkPile(-6.6,-.5,1.6,12);junkPile(-3.4,1.4,1.2,9);junkPile(6.4,2.6,1.3,8);
 barrel(cx-3.6,0,fz+.6);barrel(cx-4.0,0,fz+1.0);lamp(cx+2.2,0,fz+2.0,3.0);
 // SOCKETS
 sock('sign',cx+.4,3.3,fz-.1,0,{w:3.4,h:1.15,trade:'TINKER'});shSignPosts(cx+.4,fz-.38,CT.H-.02,3.9,3.4);
 sock('awning',cx,2.72,fz,0,{w:5.8,d:1.7,drop:.6,h:2.12});sock('awning',sx,2.72,-3.5,0,{w:3.4,d:2.4,drop:.5,h:2.22});
 shBanner(cx+3.7,fz+2.5,4.5);
 sock('flag',cx+2.4,CT.H+1.6,cz-.4,0,{w:1.0,h:.6});sock('emblem',cx+L/2+.05,1.95,cz,PI/2,{w:.8,h:.8});sock('paint',cx-L/2-.03,1.6,cz,-PI/2,{w:1.4,h:1.0});}
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
 shHangSkip(12,'pots');for(const x of [-1.75,1.75])FURNISH('pa_goods_rail',x,.75,fz+3.25,0,{v:2});   // pots on the porch beambeam('plain',[-1.2,2.3,fz+3.25],[3.0,2.3,fz+3.25],.01,jc(0x6a5a44,.05));
 bottleString([px0+.3,2.25,fz+3.2],[px1-.3,2.25,fz+3.2],8);
 for(let k=0;k<3;k++){barrel(2.6+k*.02,.3,fz+2.4+k*.55,pick([0x8a3a2c,0x2f62b8,0x4d6f3c]));}sacks(-3.0,.3,fz+2.5,6,.1);shCrateProduce(2.9,.3,fz+.7,.6,.2);
 rngSkip(4);FURNISH('pa_porch_bench',.4,.3,fz+.6,0,{az:.065});
 for(let k=0;k<3;k++)barrel(-6.4+k*.5,0,fz+.5+k*.15,undefined);sacks(-6.0,0,fz+2.0,5,.3);crate(-4.6,0,fz+1.6,.8,.2);crate(-4.6,.8,fz+1.6,.6,.5);
 // hitching post at the right: two posts, a rail, rings
 rngSkip(10);FURNISH('pa_hitching_post',6.0,0,fz+2.2,0);
 tireStack(6.3,fz+.9,3);lamp(-7.0,0,fz+1.0,3.2);
 // SOCKETS
 sock('sign',0,4.05,fz-.1,0,{w:5.4,h:1.5,trade:'GENERAL'});shSignPosts(0,fz-.5,3.0,4.85,5.4);
 sock('awning',-4.9,2.1,fz,0,{w:2.4,d:1.2,drop:.4,h:1.7});sock('awning',4.9,2.1,fz,0,{w:2.4,d:1.2,drop:.4,h:1.7});
 shBanner(6.9,fz+.9,4.6);sock('flag',-5.4,3.05+1.6,cz,0,{w:1.0,h:.6});
 sock('emblem',-L-.03,2.25,cz,-PI/2,{w:.9,h:.9});sock('paint',L+.03,1.5,cz,PI/2,{w:1.6,h:1.1});}
