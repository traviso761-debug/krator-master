// prefix: lo
// ================================================================= MONUMENTS: stelae, obelisks, the stone circle, the ley line shrine, the bells
// Stelae come in mirrored pairs (the Coil forward and back); some are turned to face the ground or wrapped in matting (texts
// whose meaning changed retroactively); the obelisks twist; the stone circle is a phyllotaxis spiral (a stone every 137.5
// degrees); the ley line shrine is the one straight thing in the town, aimed at the reliquary; the bell rack has no clappers.
// Frame: origin on the ground at the plot centre, +z the front.
defBuilding({key:'lz-stela-pair',name:'Stela pair',seed:7501,caste:'all',cut:false,w:7,d:7,h:5.6,budget:40000,
 tags:{types:['religious'],wealth:'middle',role:'monument'},
 note:'two basalt stelae, a mirrored pair: the glyph spiral winds one way on the first and the other on its twin, bronze strokes on both faces, a spiral eye above each',
 build(o){lzDust(0,0,3);lzStela(-1.5,0,0,4.6,1.1,{pair:3,eye:true});door(0,0,1.4,0,2);}});
defBuilding({key:'lz-stela-turned',name:'Turned and wrapped stelae',seed:7502,caste:'all',cut:false,w:9,d:9,h:4.6,budget:40000,
 tags:{types:['religious'],wealth:'middle',role:'monument'},
 note:'texts the high castes refuse to read: one stela laid face down on two stones, one bound in reed matting, a third turned to face a plain basalt wall',
 build(o){lzDust(0,0,4);lzStela(-2.6,0,.3,4.2,1.1,{turned:true});lzStela(.4,.2,-.2,3.9,1.0,{wrapped:true});
  lzStela(2.9,-.3,PI,3.6,.9,{});box('cyclo',2.9,0,-1.5,2.2,2.6,.5,P('basalt'));door(0,0,1.9,0,2);}});
defBuilding({key:'lz-obelisk',name:'Twisted obelisk',seed:7503,caste:'all',cut:false,w:4,d:4,h:11,budget:30000,
 tags:{types:['religious'],wealth:'rich',role:'monument'},
 note:'thirteen courses of basalt, each turned a few degrees past the one below, tapering to a four-sided point; a leiwen band on the third course, a spiral eye near the top',
 build(o){lzDust(0,0,2.2);box('stoneP',0,0,0,2.6,.3,2.6,P('basaltD'));
  lzTwist(0,0,8.8,13,1.7,.6,.055,{mk:'cyclo',col:P('basalt'),each:(i,y,w,ry)=>{if(i===2)W(0,y+.1,0,ry,()=>{for(const q of [0,PI/2,PI,-PI/2])W(0,0,0,q,()=>W(0,0,w/2+.01,0,()=>lzLeiwen(w*.9,.5,{cell:.22,mk:'bronze',back:false,t:.02,proud:.02})));});
   if(i===10)W(0,y+.3,0,ry,()=>lzEye(0,0,w/2+.02,0,w*.3,{mk:'bronze'}));}});
  W(0,8.8,0,12*.055,()=>cone('stoneP',0,0,0,.45,1.9,P('basaltD'),4));door(0,0,1.6,0,1.5);}});
defBuilding({key:'lz-circle',name:'Stone circle',seed:7504,caste:'all',cut:false,w:22,d:22,h:4,budget:70000,
 tags:{types:['religious'],wealth:'middle',role:'monument'},
 note:'a ring from the ground, not from above: twenty-one standing stones on a phyllotaxis spiral (a stone every 137.5 degrees, r = c sqrt(n)), rising outward, each with a whorl cut on its face; a flat altar stone at the centre',
 build(o){lzDust(0,0,10.5);for(let i=1;i<=21;i++){const a=i*2.39996,r=1.4+1.9*Math.sqrt(i),h=1.3+i*.1;lzMenhir(Math.cos(a)*r,Math.sin(a)*r,h,.55+i*.02,{ry:-a+PI/2,eye:i%3===0});}
  box('stoneP',0,0,0,1.8,.4,1.2,P('basaltD'),.4);door(0,0,10.6,0,2);}});
defBuilding({key:'lz-ley',name:'Ley line shrine',seed:7505,caste:'all',cut:false,w:6,d:22,h:4.2,budget:40000,
 tags:{types:['religious'],wealth:'rich',role:'shrine'},
 note:'the one straight thing in the town: a basalt causeway with a bronze rod sunk along its spine, seven bronze posts, aimed north at the reliquary and ending in a great spiral eye on a bone frame',
 build(o){box('stoneP',0,0,0,2.4,.3,21,P('basaltD'));box('bronzeC',0,.3,0,.08,.05,20.6,P('bronze'));
  for(let i=0;i<7;i++){const z=9-i*3;cyl('bronzeC',0,.3,z,.08,1.3+i*.08,P('bronze'),7);sph('bronzeC',0,1.6+i*.08,z,.1,P('bronze'),1,7);}
  for(const s of [-1,1])lzHorn(s*1.1,.3,-10.2,s>0?-PI/2:PI/2,3.6,.12,{curl:.45,lean:.1,mk:'bones'});
  lzEye(0,2.8,-10.2,PI,.75,{mk:'bronze'});beam('bones',[-1.1,.3,-10.2],[1.1,.3,-10.2],.08,P('boneO'),true,6);
  door(0,0,10.6,0,2);}});
defBuilding({key:'lz-bells',name:'Bell rack',seed:7506,caste:'all',cut:false,w:8,d:4,h:4.6,budget:30000,
 tags:{types:['religious','civic'],wealth:'rich',role:'monument'},
 note:'a rack of seven bronze bells after the bianzhong on a lashed bone frame, leiwen on every bell, and no clappers: silence made visible',
 build(o){box('stoneP',0,0,0,7,.25,2.2,P('basaltD'));lzBellRack(0,0,0,6,3.4,7);door(0,0,1.6,0,2);}});
