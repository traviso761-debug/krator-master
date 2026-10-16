// prefix: iw
// ================================================================= THE WEST'S DEFENCES: the palisade, its gate, the watch tower, the barracks
// The raiders guard their own villages: a palisade of sharpened logs on an earth bank behind a field of bamboo stakes,
// carved posts and war shields along it; a gatehouse of log towers under one horned roof, a carved red gateway arch before
// it (the Maori waharoa of the owner's motif sheet); a tall trestle watch tower with a horned lookout, a signal fire and a
// slit gong; and the barracks, a Batak men's house of the young raiders with its training yard.
// Frame: origin on the ground at the plot centre, +z the front (outside the wall).
/* a field of sharpened bamboo stakes before a wall, along local x (L long), d deep, leaning out toward +z */
function iwStakes(L,z0,d){for(let x=-L/2+.2;x<L/2;x+=.55)for(let r=0;r<2;r++){const xx=x+r*.27+rr(-.06,.06),z=z0+r*d/2,h=rr(.8,1.25);
 pole('bamboo',[xx,0,z],[xx,h*.92,z+h*.42],.035,P('bamboo'),5);}}
/* a square tower of upright logs from the ground to h, side s */
function iwLogTower(s,h){const r=.16,n=Math.round(s/(r*2.05));for(const [x,z,ry] of [[0,s/2-r,0],[0,-s/2+r,0],[s/2-r,0,PI/2],[-s/2+r,0,PI/2]])W(x,0,z,ry,()=>{
 for(let i=0;i<n;i++)cyl('wood',-s/2+r+i*(s-2*r)/(n-1),0,0,r,h+rr(-.08,.08),P('wood'),7);box('wood',0,h*.3,.2,s,.18,.12,P('woodD'));box('wood',0,h*.75,.2,s,.18,.12,P('woodD'));});}
/* ---------------------------------------------------------------- the palisade */
defBuilding({key:'iw-palisade',name:'Palisade (West)',seed:5401,w:26,d:7.5,h:6.5,budget:120000,front:{x:0,z:3.6,yaw:0},
 tags:{types:['military','infrastructure'],wealth:'middle',style:'west',role:'palisade'},
 note:'a run of the village palisade: sharpened logs on an earth bank, a fighting walk behind on posts, a field of bamboo stakes before it, carved posts rising above the wall and war shields hung along it',
 build(o){box('earth',0,0,-.9,25,.35,3.2,P('earth'));
  W(0,.3,0,0,()=>isPalisadeRun(24,4.0,{walk:2.2}));iwStakes(24,1.2,1.4);
  for(const x of [-8,0,8])isPou(x,0,.38,5.2,.2,{mk:'carvedR',top:'figure',n:3});
  for(const x of [-10.6,-5.4,-2.6,2.6,5.4,10.6])iwShield(x,2.9,.24,0,.95);
  for(const x of [-11.6,11.6]){cyl('carvedR',x,0,.32,.17,4.9,P('carvR'),8);isHorns(x,4.9,.32,0,1.4);}
  W(10.6,0,-1.55,PI,()=>isLadder(0,0,0,2.5,{lean:.9}));}});
/* ---------------------------------------------------------------- the gate */
defBuilding({key:'iw-gate',name:'Palisade gate (West)',seed:5402,cut:true,w:19.5,d:7.5,h:13.5,budget:180000,
 tags:{types:['military','infrastructure'],wealth:'middle',style:'west',role:'gatehouse'},
 note:'the village gate: two towers of upright logs joined by a fighting bridge over the gateway, one long horned roof over all spiked at both ends, a carved red gateway arch before it with a figure on the lintel and the moon, the leaves swung open, the palisade running off both ways',
 build(o){const T=5.2;
  isNoCut(()=>{for(const s of [-1,1]){W(s*3.6,0,0,0,()=>iwLogTower(3.2,T));W(s*7.3,0,0,0,()=>isPalisadeRun(4.0,4.0,{walk:2.2}));}
   /* the leaves, swung open inward */
   for(const s of [-1,1])W(s*1.95,0,0,-s*1.25,()=>{for(let i=0;i<6;i++)box('planks',-s*(.17+i*.32),.05,0,.3,3.6,.12,P('planks'));for(const y of [.6,2.9])box('wood',-s*.98,y,-.1,1.9,.16,.08,P('woodD'));});
   /* the waharoa: two great carved posts, a carved and painted lintel, a figure and the moon on it */
   for(const s of [-1,1])isPou(s*2.25,0,2.05,5.1,.3,{mk:'carvedR',n:4});
   box('carvedR',0,5.0,2.05,5.4,.55,.34,P('carvR'));box('patBand',0,5.08,2.23,5.0,.38,.02,WHITE);isFigure(0,5.55,2.05,0,1.3,{mk:'carvedR'});isMoonDisc(1.55,5.9,2.1,0,.32);
   isLadder(-3.6,-1.62,PI,T,{lean:.95});
   for(const s of [-1,1])isLamp(s*3.9,2.6,2.2,{post:true});door(0,0,1.9,0,3.6);});
  /* the fighting deck: the towers' tops and the bridge, parapets, the posts and the long horned roof */
  isCutFloor(T);
  for(const s of [-1,1])box('planks',s*3.6,T-.12,0,3.5,.12,3.5,P('planks'));box('wood',0,T-.45,0,4.4,.32,3.0,P('woodD'));box('planks',0,T-.12,0,4.2,.12,3.2,P('planks'));
  for(const z of [-1.7,1.7])W(0,0,z,z>0?0:PI,()=>{box('mat',0,T,0,10.4,1.05,.08,P('bamboo'));box('patBand',0,T+.65,.05,10.4,.3,.02,WHITE);});
  for(const s of [-1,1])W(s*5.18,0,0,PI/2,()=>box('mat',0,T,0,3.4,1.05,.08,P('bamboo')));
  for(const x of [-5.1,-2.0,2.0,5.1])for(const z of [-1.6,1.6])cyl('carvedR',x,T,z,.12,1.45,P('carvR'),8);
  const rf=isSaddle({L:11,W:4.0,eaveY:T+1.4,ridgeY:T+4.4,sag:.9,hornRise:2.6,hornOut:1.4,taper:1,over:.7,th:.28,nu:32,mk:'thatch',col:P('thatchW')});
  for(const s of [-1,1])rf.gable(s*5.5,T+1.4,2.0,'patGableW',{});iwSpikes(rf);
  const F=(k,x,z,ry)=>FURNISH(k,x,T,z,ry||0);
  F('generic_trade_weapon_rack',-3.6,-1.2,0);F('generic_trade_weapon_rack',3.6,-1.2,0);F('islander_common_stool',-.7,.2,0);F('islander_common_stool',.8,-.3,1.2);
  F('generic_barrel',4.3,.6,0);F('islander_common_lamp',-4.4,.9,0);}});
/* ---------------------------------------------------------------- the watch tower */
defBuilding({key:'iw-watchtower',name:'Watch tower (West)',seed:5403,cut:true,w:9,d:8.5,h:18.5,budget:120000,
 tags:{types:['military'],wealth:'middle',style:'west',role:'watch tower'},
 note:'the watch tower: four tarred legs braced with crosses rising to a lookout under a gonjong roof, ladders by way of a landing, a signal fire basket on an iron arm, a slit gong under the eave, a flag',
 build(o){const T=10,lg=(t,sx,sz)=>[sx*lerp(2.4,1.5,t),t*T,sz*lerp(2.4,1.5,t)];
  isNoCut(()=>{for(const sx of [-1,1])for(const sz of [-1,1]){sph('stone',sx*2.4,.06,sz*2.4,.36,P('stone'),.42,8);pole('tarred',lg(0,sx,sz),lg(1,sx,sz),.17,P('tarred'),8);}
   const lv=[.06,.34,.67,1];for(const t of lv.slice(1))for(const s of [-1,1]){beam('wood',lg(t,-1,s),lg(t,1,s),.12,P('woodD'));beam('wood',lg(t,s,-1),lg(t,s,1),.12,P('woodD'));}
   for(let i=0;i<3;i++){const a=lv[i],b=lv[i+1];for(const s of [-1,1]){beam('wood',lg(a,-1,s),lg(b,1,s),.08,P('wood'));beam('wood',lg(a,1,s),lg(b,-1,s),.08,P('wood'));
    beam('wood',lg(a,s,-1),lg(b,s,1),.08,P('wood'));beam('wood',lg(a,s,1),lg(b,s,-1),.08,P('wood'));}}
   /* the landing half way and the two ladders */
   box('planks',0,5.0-.1,-1.05,3.6,.1,1.7,P('planks'));door(1.0,0,1.3,0,.8);isLadder(1.0,-.4,0,5.0,{lean:1.15});W(-1.0,5.0,-1.7,0,()=>isLadder(0,0,0,5.0,{lean:1.05}));
   /* the signal fire: an iron basket on an arm from the deck's corner */
   beam('iron',[-1.5,T+.2,1.5],[-2.6,T+.55,2.6],.06,P('iron'));W(-2.7,T+.55,2.7,0,()=>{cone('iron',0,0,0,.35,.01,P('iron'),8);for(let i=0;i<8;i++){const a=i/8*TAU;beam('iron',[0,0,0],[Math.cos(a)*.38,.45,Math.sin(a)*.38],.025,P('iron'));}
    sph('glow',0,.25,0,.26,0xff7a2a,.7,8);});smokeAt(-2.7,T+1.2,2.7,{r:.25});haloAt(-2.7,T+.8,2.7,0xff8a30,true);});
  /* the lookout: the deck with its hatch, mat parapets with a painted band, carved posts, the horned roof, the gong, the flag */
  isCutFloor(T);box('planks',0,T-.12,.65,4.4,.12,3.1,P('planks'));box('planks',-1.85,T-.12,-1.55,.7,.12,1.3,P('planks'));box('planks',.9,T-.12,-1.55,2.6,.12,1.3,P('planks'));
  for(const [x,z,ry,L] of [[0,2.15,0,4.4],[0,-2.15,PI,4.4],[2.15,0,PI/2,4.3],[-2.15,0,-PI/2,4.3]])W(x,0,z,ry,()=>{box('mat',0,T,0,L,1.0,.07,P('bamboo'));box('patBand',0,T+.62,.05,L,.3,.02,WHITE);});
  for(const sx of [-1,1])for(const sz of [-1,1])cyl('carvedR',sx*2.1,T,sz*2.1,.11,2.45,P('carvR'),8);
  const rf=isSaddle({L:3.8,W:3.8,eaveY:T+2.4,ridgeY:T+4.6,sag:.4,hornRise:1.8,hornOut:.9,taper:1,over:.6,th:.2,nu:18,mk:'thatch',col:P('thatchW')});
  for(const s of [-1,1])rf.gable(s*1.9,T+2.4,1.9,'patGableW',{});iwSpikes(rf,.9);
  for(const s of [-1,1])pole('rope',[s*.8,T+2.4,0],[s*.8,T+1.95,0],.015,P('rope'),4);beam('carvedR',[-1.1,T+1.8,0],[1.1,T+1.8,0],.16,P('carvR'),true,8);box('plain',0,T+1.94,0,1.4,.02,.06,P('black'));
  beam('wood',[0,T+.55,2.15],[0,T+.55,3.0],.1,P('woodD'));W(0,T-1.0,2.95,0,()=>isFlag(0,0,6.6,{}));
  const F=(k,x,z,ry)=>FURNISH(k,x,T,z,ry||0);
  F('generic_trade_weapon_rack',1.0,-1.85,0);F('generic_barrel',1.55,1.5,0);F('islander_common_stool',-.9,1.2,0);F('islander_common_chest',-.2,1.75,PI);FURNISH_HANG('islander_common_hanging',0,T+2.3,0,0);}});
/* ---------------------------------------------------------------- the barracks */
defBuilding({key:'iw-barracks',name:'Barracks (West)',seed:5404,cut:true,w:23,d:14,h:12.5,budget:180000,
 tags:{types:['military','dwelling-multi'],wealth:'middle',style:'west',role:'barracks'},
 note:'the barracks, the young raiders\' men\'s house: a long Batak house on heavy piles, its open gables leaning out under buffalo horns, war shields along the front, bunks and weapon racks within; before it the sanded training yard with dummies and an archery butt',
 build(o){const fy=1.6;iwHouse({L:16,D:6.4,floorY:fy,wallH:2.4,pileR:.2,roof:{ridgeH:3.8,sag:1.2,hornRise:2.4,hornOut:1.8,taper:0,over:1,p:3,concave:.45,th:.32},lean:.14,
  band:'patGableW',bandH:.45,wallMk:'planks',wallCol:P('tarred'),front:[{x:-4,w:1.1,h:1.9,door:true},{x:4,w:1.1,h:1.9,door:true},{x:-6.6,w:.7,y:.9,h:.7},{x:0,w:.7,y:.9,h:.7},{x:6.6,w:.7,y:.9,h:.7}],
  back:iwOpen(16,5,false),doorX:-4,stair:'stair',stairW:1.1,finial:'horns',
  extra:()=>{isNoCut(()=>isStair(4,3.22,0,0,fy,1.1));const F=(k,x,z,ry)=>FURNISH(k,x,fy,z,ry||0);
   for(let i=0;i<7;i++)F('generic_trade_bunk',-6.6+i*2.2,-2.05,0);for(const s of [-1,1]){F('generic_trade_weapon_rack',s*1.9,2.85,PI);F('generic_trade_locker',s*7.5,1.2,s<0?PI/2:-PI/2);
    F('islander_common_chest',s*5.6,2.7,PI);FURNISH_HANG('islander_common_hanging',s*3.5,fy+2.4+1.0,.6,0);}
   for(const x of [-5.4,-2.6,2.6,5.4])iwShield(x,fy+1.9,3.32,0,.85);}});
  isNoCut(()=>{box('sand',0,0,7.6,15,.04,4.6,P('sandG'));const S={setting:'outdoor'};
   FURNISH('islander_training_training_dummy',-4.6,0,7.6,PI,S);FURNISH('islander_training_training_dummy',-1.8,0,8.2,PI,S);FURNISH('islander_training_archery_butt',5.4,0,9.0,PI,S);
   FURNISH('generic_trade_weapon_rack',1.8,0,9.4,PI,S);for(const s of [-1,1])isFlag(s*7.6,9.6,6.5,{});});}});
