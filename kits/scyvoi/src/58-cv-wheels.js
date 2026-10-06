// prefix: cv
// ================================================================= CHARIOTS AND CARTS (class prop): wheels for a people who move with the fires
// The war chariot is light: two spoked wheels, a hide-and-wicker car with a felt-faced front, a pole to a yoke for a pair
// of salamanders. The supply cart is a high two-wheeler under an arched felt hood. The ger cart carries a whole felt
// tent on a flatbed behind two draught salamanders (as the steppe peoples moved their gers). Teams are nested placements
// of the salamander defs (56-sa-beasts.js), so each beast keeps its own record and life data.
/* a spoked wheel standing in the y-z plane (axle along x) at (x, r, z) */
function cvWheel(x,z,r,spokes,col,o){o=o||{};const y=r,c=col||P('woodD');
 ring('wood',x,y,z,r-.05,.05,c,0,0,PI/2,Math.max(16,Math.round(r*30)));ring('iron',x,y,z,r,.025,0x2e2a26,0,0,PI/2,Math.max(16,Math.round(r*30)));
 beam('wood',[x-.12,y,z],[x+.12,y,z],.12,c,true,10);
 for(let i=0;i<spokes;i++){const a=i/spokes*TAU;beam('wood',[x,y,z],[x,y+Math.cos(a)*(r-.06),z+Math.sin(a)*(r-.06)],.03,c,true,5);}
 if(o.felt)cyl('patFelt',x-.13,y,z,.16,.01,null,10);}
/* the chariot's car, wheels and pole, in the current frame: the axle at z = 0, the pole running forward to poleZ */
function cvChariot(poleZ,yokeW){const ay=.78;
 for(const s of [-1,1])cvWheel(s*.88,0,ay,10,P('woodD'));beam('wood',[-.95,ay,0],[.95,ay,0],.06,P('woodD'),true,8);
 box('wood',0,ay+.05,-.1,1.35,.08,1.05,P('wood'));
 // the car: a hide-covered wicker frame, its front a curved felt shield, a brass-capped rail
 psurf('patFelt',(u,v)=>{const a=(u-.5)*2.2;return [Math.sin(a)*.68,ay+.13+v*.85,.42+Math.cos(a)*.2-.2];},10,3,null);
 for(const s of [-1,1])psurf('hide',(u,v)=>[s*.68,ay+.13+v*.75,.25-u*.82],3,2,P('hide'));
 cord('wood',Array.from({length:11},(_,i)=>{const a=(i/10-.5)*2.2;return [Math.sin(a)*.69,ay+1.0,.42+Math.cos(a)*.2-.2];}),.035,P('woodD'));
 for(const s of [-1,1]){beam('wood',[s*.69,ay+.95,.2],[s*.69,ay+.95,-.58],.035,P('woodD'),true,6);sph('brass',s*.69,ay+1.0,-.6,.05,0xc8963a);}
 // the quiver and the javelins at the side
 W(.74,ay+.25,-.2,0,()=>{cyl('hide',0,0,0,.09,.62,0x6a3a20,8);for(let i=0;i<4;i++)beam('wood',[(i-1.5)*.03,.5,0],[(i-1.5)*.05,1.25,.05],.012,P('wood'),true,4);});
 // the pole, rising gently to the yoke
 beam('wood',[0,ay+.02,.5],[0,1.05,poleZ],.07,P('woodD'),true,8);
 if(yokeW){beam('wood',[-yokeW,1.12,poleZ-.05],[yokeW,1.12,poleZ-.05],.07,P('woodD'),true,8);for(const s of [-1,1]){ring('brass',s*yokeW*.55,1.2,poleZ-.05,.09,.02,0xc8963a,0,PI/2,0,10);}}}
defBuilding({key:'chariot',name:'War chariot',seed:5801,cls:'prop',kind:'chariot',w:2.2,d:4.0,h:1.9,budget:30000,front:{x:0,z:2,yaw:0},
 tags:{role:'war chariot'},note:'a light two-wheeled war chariot, its pole resting on a stand',
 build(o){W(0,0,-1.2,0,()=>cvChariot(2.9,0));beam('wood',[-.3,0,1.7],[0,1.05,1.7],.04,P('woodD'),true,5);beam('wood',[.3,0,1.7],[0,1.05,1.7],.04,P('woodD'),true,5);}});
defBuilding({key:'chariot-team',name:'Chariot and pair',seed:5802,cls:'prop',kind:'chariot',w:4.8,d:9.2,h:3.8,budget:120000,front:{x:0,z:4.6,yaw:0},
 tags:{role:'war chariot'},note:'the war chariot yoked to a pair of salamanders',
 build(o){W(0,0,-3.2,0,()=>cvChariot(5.2,1.25));
  for(const s of [-1,1])place('salamander-riding',s*1.22,1.55,0,{v:s>0?1:0,tack:'none',activity:'WAIT',band:'the chief\'s chariot pair'});
  for(const s of [-1,1])for(const t of [-1,1]){const x=s*1.22+t*.4;sagRope('hide',[x,1.05,2.7],[s*.15,1.0,-2.6],.15,.02,0x3a2010,6);}}});
defBuilding({key:'cart-supply',name:'Supply cart',seed:5803,cls:'prop',kind:'cart',w:3.0,d:6.4,h:3.2,budget:40000,front:{x:0,z:3.2,yaw:0},
 tags:{role:'supply'},note:'a high two-wheeled cart under an arched felt hood, bales at the tail, shafts for one beast',
 build(o){const by=1.15;for(const s of [-1,1])cvWheel(s*1.2,-.4,1.05,12,P('woodD'));beam('wood',[-1.3,1.05,-.4],[1.3,1.05,-.4],.08,P('woodD'),true,8);
  box('wood',0,by,-.4,2.1,.12,3.0,P('wood'));for(const s of [-1,1])box('wood',s*1.02,by+.12,-.4,.08,.42,3.0,P('woodD'));box('wood',0,by+.12,1.08,2.1,.42,.08,P('woodD'));
  // the hood: felt over hoops
  psurf('felt',(u,v)=>{const a=(u-.5)*PI;return [Math.sin(a)*1.08,by+.5+Math.cos(a)*1.0,-1.6+v*2.5];},10,5,P('feltW'));
  for(let i=0;i<4;i++){const z=-1.55+i*.8;cord('wood',Array.from({length:9},(_,k)=>{const a=(k/8-.5)*PI;return [Math.sin(a)*1.1,by+.5+Math.cos(a)*1.02,z];}),.03,P('woodD'));}
  psurf('patFelt',(u,v)=>{const a=(u-.5)*PI;return [Math.sin(a)*1.1,by+.5+Math.cos(a)*1.03,-.15+v*.6];},10,1,null);   // an appliqué band round the hood
  for(const s of [-1,1])beam('wood',[s*.55,by,1.0],[s*.42,.95,3.1],.06,P('woodD'),true,6);
  beam('wood',[0,0,2.9],[0,.95,3.0],.05,P('woodD'),true,5);
  FURNISH('scyvoi_supply_bales',0,by+.12,-1.4,0,{setting:'outdoor'});}});
defBuilding({key:'cart-ger',name:'Ger cart',seed:5804,cls:'prop',kind:'cart',w:6.2,d:13.2,h:5.0,budget:160000,front:{x:0,z:6.4,yaw:0},
 tags:{role:'moving camp'},note:'a felt ger carried whole on a four-wheeled bed behind two draught salamanders',
 build(o){const zc=-3.6,by=1.25;
  for(const [x,z] of [[-2.2,zc-1.45],[2.2,zc-1.45],[-2.2,zc+1.45],[2.2,zc+1.45]])cvWheel(x,z,.9,12,P('woodD'));
  for(const z of [zc-1.45,zc+1.45])beam('wood',[-2.35,.9,z],[2.35,.9,z],.09,P('woodD'),true,8);
  box('wood',0,by-.25,zc,4.2,.25,4.6,P('woodD'));for(let i=0;i<9;i++)box('wood',-2.0+i*.5,by,zc,.46,.05,4.6,P('wood'));
  W(0,by+.05,zc,0,()=>tkYurt({r:2.0,wallH:1.3,crownH:2.55,crownR:.38,doorW:.8,doorH:1.15,felt:P('feltW'),band:'patFelt',bandH:.35}));
  // the pole and the double yoke; two draught salamanders in their collars
  beam('wood',[0,.95,zc+2.3],[0,1.15,5.3],.09,P('woodD'),true,8);beam('wood',[-1.8,1.4,4.9],[1.8,1.4,4.9],.08,P('woodD'),true,8);
  for(const s of [-1,1])place('salamander-draught',s*1.55,3.2,0,{v:s>0?0:1,activity:'WORK',band:'the camp train'});
  for(const s of [-1,1])for(const t of [-1,1]){const x=s*1.55+t*.62;sagRope('iron',[x,1.05,1.85],[t*.9+s*.6,1.0,zc+2.3],.12,.018,0x3a3632,6);}}});
