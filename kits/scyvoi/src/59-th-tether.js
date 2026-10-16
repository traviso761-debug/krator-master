// prefix: th
// ================================================================= TETHERING: the carved tying post, the carved tying boulder, a picket line
// The post and the boulder are catalog furniture (outdoor; kits/catalog krator-master-furniture-scyvoi.js), shown here as
// one-piece defs of class 'furniture' (36-def.js: the piece registers itself through core/furnish). The picket line is a
// feature: two posts, a rope between them, three saddled salamanders tied along it, a trough.
defBuilding({key:'tether-post',name:'Tying post',seed:5901,cls:'furniture',w:1.0,d:1.0,h:2.4,budget:12000,front:{x:0,z:.5,yaw:0},
 tags:{setting:'outdoor'},note:'a carved timber hitching post with iron rings and a salamander-head finial',
 build(o){FURNISH('scyvoi_tying_post',0,0,0,0,{setting:'outdoor'});}});
defBuilding({key:'tether-boulder',name:'Carved tying boulder',seed:5902,cls:'furniture',w:1.8,d:1.6,h:1.3,budget:12000,front:{x:0,z:.8,yaw:0},
 tags:{setting:'outdoor'},note:'a boulder carved with spirals and set with an iron tethering ring',
 build(o){FURNISH('scyvoi_tying_boulder',0,0,0,0,{setting:'outdoor'});}});
defBuilding({key:'tether-line',name:'Picket line',seed:5903,cls:'feature',kind:'picket line',w:11,d:7,h:2.6,budget:140000,front:{x:0,z:3.5,yaw:0},
 tags:{role:'tethering'},note:'a picket line between two carved posts: three salamanders tied, a trough',
 build(o){const L=8.6;for(const s of [-1,1])FURNISH('scyvoi_tying_post',s*L/2,0,-2.2,0,{setting:'outdoor'});
  sagRope('rope',[-L/2,1.55,-2.2],[L/2,1.55,-2.2],.25,.022,0xa88a5a,12);
  for(let i=0;i<3;i++){const x=-2.9+i*2.9;place('salamander-riding',x,.2,PI+(i-1)*.12,{v:i%2,activity:'WAIT',band:'a war band'});
   sagRope('hide',[x+(i-1)*.1,1.55-.25*Math.sin(PI*(x+L/2)/L)*.98,-2.2],[x,1.0,-1.8],.15,.012,0x3a2010,4);}
  FURNISH('scyvoi_trade_trough',0,0,2.6,0,{setting:'outdoor'});}});
