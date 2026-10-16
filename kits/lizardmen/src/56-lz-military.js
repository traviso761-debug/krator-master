// prefix: lm
// ================================================================= MILITARY: the barracks, the mustering ground, the lookout
// Armour stands in six sizes (an empty suit per caste), racks of dagger-axes (ge), ji and spears, headdress stands; a
// mustering ground whose ranks are stone posts on a squared-spiral grid, with NO signal equipment (no banners, drums, horns,
// gongs or fires: silence made visible); a lookout on seven tall bone legs (the owner's stilt-tower reference).
// Frame: origin on the ground at the plot centre, +z the front.
/* an empty suit of lamellar armour on a stand, h the caste's height: a lacquered breast of bone lamellae, the helm a horned skull */
function lmArmour(x,z,ry,h){W(x,0,z,ry,()=>{cyl('wood',0,0,0,.06*h/2,h*.62,P('reedD'),6);box('wood',0,0,0,h*.3,.08,h*.2,P('reedD'));
 const bw=h*.26,bh=h*.3,by=h*.45;for(let r=0;r<5;r++){const yy=by+r*bh/5;for(let i=0;i<5;i++){const xx=-bw/2+(i+.5)*bw/5;box('lacq',xx,yy,h*.08,bw/5-.01,bh/5+.015,.025,P(r%2?'lacq':'oxblood'));box('lacq',xx,yy,-h*.08,bw/5-.01,bh/5+.015,.025,P(r%2?'lacq':'oxblood'));}}
 for(const s of [-1,1])box('lacq',s*(bw/2+.01),by+bh*.5,0,.03,bh*.5,h*.16,P('lacq'));
 sph('skull',0,by+bh+h*.1,0,h*.075,P('bone'),1.1,10);for(const s of [-1,1])lzHorn(s*h*.05,by+bh+h*.15,0,s>0?PI/2:-PI/2,h*.2,h*.014,{curl:.6,mk:'horn',nt:6,ns:5});
 lzEye(0,by+bh*.55,h*.1,0,h*.035,{mk:'bronze'});});}
/* a rack of bronze dagger-axes and ji: a bone frame with the shafts leaning in it */
function lmRack(x,z,ry,n){W(x,0,z,ry,()=>{for(const s of [-1,1])beam('bones',[s*1.1,0,0],[s*1.1,1.6,0],.07,P('boneO'),true,6);beam('bones',[-1.2,1.5,0],[1.2,1.5,0],.06,P('boneO'),true,6);
 for(let i=0;i<n;i++){const xx=-1+i*2/(n-1),L=2.4+.3*(i%3);beam('wood',[xx,0,.25],[xx+.05,L,-.05],.025,P('reedD'),true,5);
  if(i%2)box('bronzeC',xx+.06,L-.3,-.02,.26,.07,.02,P('bronze'),0,0,-.25);else{box('bronzeC',xx+.05,L-.02,-.05,.03,.3,.02,P('bronze'));box('bronzeC',xx+.12,L-.28,-.05,.2,.06,.02,P('bronze'));}}});}
defBuilding({key:'lz-barracks',name:'Barracks',seed:7401,caste:'all',cut:true,w:21,d:14,h:10,budget:130000,
 tags:{types:['military','dwelling-multi'],wealth:'middle',role:'barracks'},
 note:'a long battered hall of polygonal basalt under hide and eleven bone ribs: armour stands in six sizes along the wall (an empty suit per caste, a 1.25 step down), racks of bronze ge, ji and spears, basking slabs; nested portals',
 build(o){const L=16,Wd=9,wh=3.2,rh=5;lzCutFloor(0);box('stoneP',0,0,0,L+1.4,.2,Wd+1.4,P('basaltD'));
  const dh=lzDoorH(6),dw=dh*.62;
  lzBatterRoom(L,Wd,.2,wh,'cyclo',P('basalt'),{lean:{front:.09,back:-.05,left:.04,right:-.08},front:[{s:L/2,w:dw,h:dh,door:true},lzVent(4,2,wh*.6),lzVent(4,L-2,wh*.6)],back:[lzVent(4,L*.25,wh*.6),lzVent(4,L*.5,wh*.6),lzVent(4,L*.75,wh*.6)]});
  lzNoCut(()=>{lzPortal(0,.2,Wd/2+.06,0,dh,{mk:'bronze'});for(const s of [-1,1])lzEye(s*5.2,.2+wh*.7,Wd/2-.09*wh*.7+.04,0,.36,{mk:'bronze'});});lzThreshold(0,Wd/2+.2,0,dw);
  lzRibRoof(L,Wd,wh+.25,wh+rh,11,{mk:'hide',col:P('hideD'),over:.7,ribR:.16,past:.22,bend:.95,ext:.6,endMk:'reed',endCol:P('reedD'),leanEnds:{left:.04,right:-.08},y0:.2});
  /* the six suits, the biggest nearest the door */
  for(let c=6;c>=1;c--)lmArmour(-L/2+1.2+(6-c)*2.3,-Wd/2+1.1,0,LZ_CASTE[c].h);
  lmRack(5.6,-Wd/2+1.2,0,9);lmRack(-L/2+1.2,1.4,PI/2,7);
  lzFurnRoom(L-1.2,Wd-1,.2,'common',{beds:0,noHearth:false,ceil:wh+rh*.5,extra:[['lizardmen_common_rack',L/2-.9,1.4,-PI/2],['lizardmen_common_rack',L/2-.9,-1.2,-PI/2],['generic_trade_bunk',-5.6,3.2,PI],['generic_trade_bunk',5.4,3.2,PI],['generic_trade_locker',-3.2,3.3,PI]]});}});
/* ---------------------------------------------------------------- the mustering ground */
defBuilding({key:'lz-muster',name:'Mustering ground',seed:7402,caste:'all',cut:false,w:24,d:38,h:9.8,budget:170000,
 tags:{types:['military','civic'],wealth:'middle',role:'ground'},
 note:'a square of packed earth whose ranks are marked by basalt posts on a squared-spiral grid winding in to one tall post with a spiral eye; behind it the camp, a hide tent and a pole-and-shield tent (57-lc-camp.js); no banners, drums, horns, gongs or fires anywhere',
 build(o){box('earthR',0,0,-2,23,.1,34,P('earthP'));
  /* the camp at the back of the ground: two of the tents, pitched a little askew */
  place('lc-hide',-6,-13,.15,{y:0});place('lc-shield',5.5,-12.5,-.2,{y:0});
  W(0,0,4,0,()=>{let px=-10,pz=10,dir=0,len=20;let k=0;
  for(let n=0;n<11&&len>1.2;n++){const dx=[1,0,-1,0][dir],dz=[0,-1,0,1][dir],steps=Math.max(1,Math.floor(len/2.2));
   for(let i=0;i<steps;i++){const t=(i+.5)/steps,x=px+dx*len*t,z=pz+dz*len*t;k++;box('basalt',x,.1,z,.28,.8+.02*(k%5),.28,P(k%4?'basalt':'basaltD'),n*.2);}
   px+=dx*len;pz+=dz*len;dir=(dir+1)%4;if(n%2)len-=2.6;else len-=2.2;}
  lzTwist(0,0,3.0,5,.6,.3,.1,{mk:'basalt'});lzEye(0,3.3,0,0,.3,{mk:'bronze'});});
  door(0,0,15.5,0,3);}});
/* ---------------------------------------------------------------- the lookout: a hut on seven tall bone legs */
defBuilding({key:'lz-lookout',name:'Lookout',seed:7403,caste:4,cut:true,w:9,d:9,h:16,budget:70000,
 tags:{types:['military'],wealth:'middle',role:'watch'},
 note:'a watch hut of cane under hide on seven tall hexapod leg-bones leaning in to a collar 11 m up (the owner\'s stilt-tower reference), a bone ladder, a horned crest; the warriors\' 2.8 m door at the top',
 build(o){const H=11,n=7,r0=3.6,r1=1.3;lzCutFloor(H);
  lzNoCut(()=>{for(let i=0;i<n;i++){const a=i*TAU/n+.2;beam('bones',[Math.cos(a)*r0,0,Math.sin(a)*r0],[Math.cos(a)*r1,H+.2,Math.sin(a)*r1],.16,P('boneO'),true,8);sph('stoneP',Math.cos(a)*r0,.1,Math.sin(a)*r0,.3,P('basaltD'),.5,8);
    if(i%2)beam('bones',[Math.cos(a)*(r0*.6+r1*.4),H*.4,Math.sin(a)*(r0*.6+r1*.4)],[Math.cos(a+TAU/n)*(r0*.6+r1*.4),H*.4,Math.sin(a+TAU/n)*(r0*.6+r1*.4)],.08,P('boneO'),true,6);}
   ring('bones',0,H+.1,0,r1*1.05,.12,P('boneO'),0,0,0,14);
   /* the ladder: two bones and bone rungs, up the front */
   W(0,0,r0*.55,0,()=>{for(const s of [-1,1])beam('bones',[s*.3,0,2.2],[s*.3,H+.3,0],.06,P('boneO'),true,6);for(let i=1;i<26;i++){const t=i/26;beam('bones',[-.3,t*(H+.3),2.2*(1-t)],[.3,t*(H+.3),2.2*(1-t)],.03,P('boneO'),true,5);}});});
  box('cane',0,H+.2,0,3.6,.14,3.6,P('cane'));
  const dh=lzDoorH(4),dw=dh*.62;
  lzBatterRoom(3.2,3.2,H+.34,1.9,'cane',P('cane'),{lean:{front:.05,back:-.06,left:.08,right:-.04},front:[{s:1.6,w:Math.min(dw,1.5),h:Math.min(dh,2.1),door:true}],left:[lzVent(4,1.6,.9)],right:[lzVent(4,1.6,.9)],back:[lzVent(4,1.6,.9)]});
  lzRibRoof(3.2,3.2,H+2.2,H+4.6,5,{mk:'hide',col:P('hide'),over:.5,ribR:.1,past:.5,bend:1,ext:.3,endMk:'mat',leanEnds:{left:.08,right:-.04},y0:H+.34});
  FURNISH('lizardmen_common_stool',-.6,H+.34,-.2,0);FURNISH('lizardmen_common_rack',.9,H+.34,-.9,0);FURNISH('generic_water',-.9,H+.34,.8,0);FURNISH('lizardmen_common_rug',0,H+.34,.1,0);}});
