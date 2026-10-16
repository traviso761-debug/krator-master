// prefix: fl
// ================================================================= FLORA: the farms' crops and the village trees (PLACEHOLDERS)
// The README's rule: plants are never part of a building. The Islanders' gardens and groves are separate defs of class
// `flora`, tagged by biome and harvest, placed by the farms, the squares and the courts. No Ring Sea islands biome kit
// exists yet, so these are placeholders in simple geometry until one does (KNOWN_ISSUES.md): a biome kit replaces them by
// key. Biome tags: wet tropic, coastal and riparian, not abyssal.
const FL_BIOME='ringsea-isles: wet, tropic, coastal, riparian, non-abyssal';
function flDef(key,name,seed,o,build){return defBuilding({key,name,seed,cls:'flora',kind:o.kind||key,w:o.w,d:o.d,h:o.h,budget:o.budget||20000,front:{x:0,z:o.d/2,yaw:0},
 tags:{biome:FL_BIOME,setting:'outdoor',harvest:o.harvest,role:'placeholder'},note:o.note+' (a placeholder until a Ring Sea islands biome kit exists)',build});}
/* a leaf: a curved blade from the base along a direction, len long, wid wide, drooping */
function flLeaf(mk,base,yaw,pitch,len,wid,col,droop){psurf(mk,(u,v)=>{const t=v,x=(u-.5)*wid*Math.sin(PI*Math.min(1,t*1.15)),along=t*len,up=Math.sin(pitch)*along-droop*t*t*len;
 const c=Math.cos(pitch)*along;return [base[0]+Math.sin(yaw)*c+Math.cos(yaw)*x,base[1]+up,base[2]+Math.cos(yaw)*c-Math.sin(yaw)*x];},2,6,col);}
flDef('fl-coconut','Coconut palm',5701,{w:7,d:7,h:13,harvest:{edible:true,part:'nuts, sap, fibre, fronds',season:'all year'},note:'a coconut palm: a leaning ringed trunk, a crown of fronds, nuts'},
 o=>{const h=rr(10,12.5),lean=rr(.6,1.6),a=rng()*TAU;const c=t=>[Math.cos(a)*lean*t*t,t*h,Math.sin(a)*lean*t*t];
  tube('wood',c,t=>{const r=.22-.08*t;return [r,r];},10,7,P('woodL'),{caps:true});const top=c(1);
  for(let i=0;i<13;i++)flLeaf('flag',top,i/13*TAU+rr(-.2,.2),rr(.1,.6),rr(3.2,4.2),.9,P('leaf'),.55);
  for(let i=0;i<5;i++)sph('plain',top[0]+rr(-.35,.35),top[1]-.35,top[2]+rr(-.35,.35),.16,0x6a5a2a,1,6);});
flDef('fl-banana','Banana',5702,{w:4.2,d:4.2,h:5,harvest:{edible:true,part:'fruit, leaves',season:'all year'},note:'a banana clump: three stems, paddle leaves, a hanging bunch'},
 o=>{for(let k=0;k<3;k++){const x=rr(-.5,.5),z=rr(-.5,.5),h=rr(2.6,3.6);cyl('plain',x,0,z,.13,h,P('leaf'),8,.09);
  for(let i=0;i<6;i++)flLeaf('flag',[x,h,z],i/6*TAU+k,rr(.3,.9),rr(1.6,2.2),.7,P('leaf'),.6);if(k===0){sph('plain',x+.2,h-.6,z,.25,0x8a9a2a,1.5,8);}}});
flDef('fl-taro','Taro patch',5703,{w:4.4,d:3.4,h:1.4,harvest:{edible:true,part:'corms, leaves',season:'all year'},note:'a bed of taro in wet soil: heart-shaped leaves on long stalks'},
 o=>{box('earth',0,0,0,4,.12,3,0x5a4630);for(let i=0;i<22;i++){const x=rr(-1.8,1.8),z=rr(-1.3,1.3),h=rr(.7,1.1);pole('plain',[x,.1,z],[x,h,z],.02,P('leaf'),4);
  WX(x,h,z,rng()*TAU,-.6,0,()=>psurf('flag',(u,v)=>{const a=(u-.5)*2,r=.42*Math.sin(PI*v)*(1-.2*v);return [a*r,0,v*.5-.15];},3,3,P('leaf')));}});
flDef('fl-breadfruit','Breadfruit tree',5704,{w:9,d:9,h:11,harvest:{edible:true,part:'fruit',season:'wet season'},note:'a breadfruit: a stout trunk, a broad dome of lobed leaves, green fruit'},
 o=>{cyl('wood',0,0,0,.35,4,P('wood'),9,.25);for(let i=0;i<6;i++){const a=i/6*TAU;beam('wood',[0,3.6,0],[Math.cos(a)*2.4,6,Math.sin(a)*2.4],.16,P('wood'),true,6);}
  for(let i=0;i<9;i++){const a=rng()*TAU,r=rr(0,2.8);ellip('plain',Math.cos(a)*r,rr(6.4,8.8),Math.sin(a)*r,rr(1.5,2.3),rr(1.2,1.7),rr(1.5,2.3),P('leaf'),0,9);}
  for(let i=0;i<6;i++){const a=rng()*TAU;sph('plain',Math.cos(a)*2.8,6.2,Math.sin(a)*2.8,.18,0x8aa040,1,6);}});
flDef('fl-paddy','Rice paddy',5705,{kind:'paddy',w:10.4,d:8.4,h:.9,budget:40000,harvest:{edible:true,part:'grain',season:'twice a year'},note:'a flooded rice paddy behind low bunds, rows of young rice'},
 o=>{for(const [x,z,w,d] of [[0,4,10.4,.4],[0,-4,10.4,.4],[5,0,.4,8.4],[-5,0,.4,8.4]])box('earth',x,0,z,w,.3,d,P('earth'));
  box('water',0,.05,0,9.6,.14,7.6,0x3a6a64);for(let i=-4;i<=4;i++)for(let j=-3;j<=3;j++)cone('plain',i*1.05+rr(-.1,.1),.18,j*1.05,.12,rr(.45,.7),P('leaf'),4);});
