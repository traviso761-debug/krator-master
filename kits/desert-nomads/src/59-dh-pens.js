// prefix: dh
// ================================================================= TETHERING AND PENS: camel lines, folds for the herds
// The hobble post and the kneeling stone are catalog furniture (nomad_hobble_post, nomad_tying_stone), shown as one-piece
// defs of class 'furniture'. The camel line is a feature: a rope between two posts, three camels on it, a trough. The pens:
// in the desert a zariba (a ring of cut thorn brush, the herders' fence) for the goats and the cattle and a dry-stone fold
// for the sheep; in the eastern abyss a fence of bundled reeds for the emus. Each pens its herd (nested placements of the
// herd defs in 56-sa-beasts.js, each with its own life record).
defBuilding({key:'tether-hobble',name:'Hobble post',seed:5901,cls:'furniture',w:1.0,d:1.0,h:2.0,budget:12000,front:{x:0,z:.5,yaw:0},
 tags:{setting:'outdoor'},note:'a camel tethering post with rope hobbles',build(o){FURNISH('nomad_hobble_post',0,0,0,0,{setting:'outdoor'});}});
defBuilding({key:'tether-stone',name:'Kneeling stone',seed:5902,cls:'furniture',w:1.4,d:1.4,h:.8,budget:12000,front:{x:0,z:.7,yaw:0},
 tags:{setting:'outdoor'},note:'a low stone with an iron ring where the camels kneel to be loaded',build(o){FURNISH('nomad_tying_stone',0,0,0,0,{setting:'outdoor'});}});
defBuilding({key:'tether-line',name:'Camel line',seed:5903,cls:'feature',kind:'camel line',w:12,d:7,h:2.9,budget:160000,front:{x:0,z:3.5,yaw:0},
 tags:{role:'tethering'},note:'a picket line between two hobble posts: three camels tied, a trough',
 build(o){const L=9;for(const s of [-1,1])FURNISH('nomad_hobble_post',s*L/2,0,-2.4,0,{setting:'outdoor'});
  sagRope('rope',[-L/2,1.4,-2.4],[L/2,1.4,-2.4],.25,.022,0xa88a5a,12);
  ['camel-riding','camel-pack','camel-riding'].forEach((k,i)=>{const x=-3+i*3;place(k,x,.2,PI+(i-1)*.1,{v:i,activity:'WAIT'});
   sagRope('rope',[x,1.3,-2.4],[x,1.9,-1.3],.2,.012,0xa88a5a,4);});
  FURNISH('nomad_trade_trough',0,0,2.8,0,{setting:'outdoor'});}});
/* the zariba: a ring of cut thorn brush, a gap at +z closed by a dragged bush. r the radius, n bushes */
function dhZariba(r,n){const gate=.42;for(let i=0;i<n;i++){const a=i/n*TAU;if(tkNearDoor(a,gate*.5))continue;const x=Math.cos(a)*r,z=Math.sin(a)*r;
  const s=rr(.85,1.15);ellip('wood',x,.42*s,z,.55*s,.45*s,.6*s,P('thorn'),a,7);
  for(let k=0;k<7;k++){const b=rng()*TAU,e=rr(.2,1.1);const tip=[x+Math.cos(b)*.8*s,.15+e*.75*s,z+Math.sin(b)*.8*s];beam('wood',[x,.4*s,z],tip,.02,P('thorn'),false,4);}}
 W(r*Math.cos(TK_DOOR+.35),0,r*Math.sin(TK_DOOR+.35),.6,()=>{ellip('wood',0,.35,0,.7,.38,.45,P('thorn'),0,7);});}
/* the dry-stone fold: a ring wall of rough stones, a gap at +z */
function dhStoneRing(r,h){const n=Math.round(TAU*r/.45);for(let j=0;j<Math.round(h/.3);j++)for(let i=0;i<n;i++){const a=(i+(j%2)*.5)/n*TAU;if(tkNearDoor(a,.32))continue;
  ellip('stone',Math.cos(a)*r,.16+j*.29,Math.sin(a)*r,rr(.22,.3),rr(.15,.19),rr(.2,.27),P('stone'),a+rr(-.3,.3),7);}}
/* the reed fence: bundled reed panels between posts, a gap at +z */
function dhReedFence(r){const n=16;for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU,am=(a0+a1)/2;if(tkNearDoor(am,.3))continue;
  const p0=[Math.cos(a0)*r,Math.sin(a0)*r],p1=[Math.cos(a1)*r,Math.sin(a1)*r];pole('wood',[p0[0],0,p0[1]],[p0[0],1.4,p0[1]],.04,P('woodD'),6);
  const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]);W((p0[0]+p1[0])/2,0,(p0[1]+p1[1])/2,Math.atan2(p1[0]-p0[0],p1[1]-p0[1])-PI/2,()=>{
   for(let k=0;k<Math.round(L/.09);k++){const x=-L/2+(k+.5)*L/Math.round(L/.09);beam('plain',[x,0,0],[x+rr(-.02,.02),rr(1.15,1.35),rr(-.02,.02)],.025,P('palm'),false,4);}
   for(const y of [.35,.95])beam('rope',[-L/2,y,.04],[L/2,y,.04],.018,0xa88a5a,true,5);});}}
function dhPen(key,name,seed,herd,o){return defBuilding({key,name,seed,cls:'feature',kind:o.kind,w:o.r*2+2.4,d:o.r*2+2.4,h:o.h||1.6,budget:o.budget||200000,front:{x:0,z:o.r,yaw:0},
 tags:{role:'herding'},note:o.note,
 build(p){o.fence(o.r);if(o.trough!==false)FURNISH('nomad_trade_trough',-o.r*.35,0,-o.r*.6,.4,{setting:'outdoor'});
  const n=o.n;for(let i=0;i<n;i++){const a=i*2.39996,rad=o.r*.62*Math.sqrt((i+.5)/n);place(herd,Math.cos(a)*rad,Math.sin(a)*rad,rng()*TAU,{v:o.vars[i%o.vars.length],seed:i,mode:i%3===2?'idle':'graze'});}}});}
dhPen('goat-zariba','Goat zariba',5906,'goat',{r:4.4,n:9,vars:[0,1,1,3,2,1],kind:'goat fold',fence:r=>dhZariba(r,16),note:'the flock penned for the night in a ring of cut thorn brush, a bush dragged across the gap'});
dhPen('sheep-fold','Sheep fold',5907,'sheep',{r:4.6,n:9,vars:[0,0,1,2],kind:'sheep fold',fence:r=>dhStoneRing(r,1.0),note:'a dry-stone fold for the sheep at a well'});
dhPen('cattle-zariba','Cattle zariba',5908,'cattle',{r:7,n:5,vars:[1,0,2],kind:'cattle fold',budget:240000,fence:r=>dhZariba(r,24),note:'the cattle penned in a great thorn zariba'});
dhPen('emu-pen','Emu pen',5909,'emu',{r:4,n:7,vars:[0,0,1],kind:'emu pen',h:1.9,fence:r=>dhReedFence(r),note:'the abyssal nomads\' emus behind a fence of bundled reeds, a trough'});
