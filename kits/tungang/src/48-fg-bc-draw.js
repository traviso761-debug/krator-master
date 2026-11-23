// prefix: fg
// ================================================================= BARRICADE: drawing what is its own (PLAN.md 1.3.2)
// The rooms, faces, terraces, ladders, kivas and furniture are Wildcat's drawing (46-fg-wc-draw.js: fgWcBuild); this adds
// Barricade's dress through fgWcBuild's `extra` hook: the stacked wrecks of the barricade, the gate's portcullis and leaves
// and the tallies painted in its tunnel, the culvert's grates, the crow's nests, the pickets' banners. Def fg-bc-greathouse.
/* a wreck of the Ancients: a car's or van's body on its belly, its wheels gone to rusted hubs, its windows plated over; a
   carriage of the Line is longer and square. In the frame of the record (x, y, z, ry: its length along local z) */
function fgBcWreck(w,C){const L=w.len,car=w.kind!=='carriage',van=w.kind==='van',pc=fgCol('carpaint',C).clone().lerp(hc(0x6a5a4a),.35),rc=fgCol('rust',C);
 W(w.x,w.y,w.z,w.ry,()=>{const bw=car?1.7:2.3,bh=car?(van?1.25:.85):1.6;
  box('paint',0,.12,0,bw,bh,L,pc,0,0,(w.tier?.05:0));
  if(car&&!van){box('paint',0,.12+bh,-.15*L,bw*.86,.62,L*.48,pc);box('rust',0,.2+bh,-.15*L,bw*.88,.42,L*.46*.98,rc);}
  if(!car)for(let k=0;k<4;k++)box('rust',bw/2+.005,.5,-L/2+L*(k+.5)/4,.02,.6,L/5,rc);
  for(const sx of [-1,1])for(const sz of [-1,1])cyl('iron',sx*(bw/2-.05),.02,sz*L*.32,.28,.14,fgWcPal('iron'),10);
  box('rust',0,.12,L/2-.02,bw*.9,bh*.6,.06,rc);for(let k=0;k<3;k++)box('rust',(k-1)*bw*.3,.12+bh*fgWcU({world:w.paint},k,0,131),0,.4,.25,L*.6,rc,0,0,.3);});}
/* the gate: the portcullis of rail drawn up into the tunnel's mouth, two leaves of plate stood open against its walls, the
   tallies of the crossings painted down both walls inside; a culvert's grates of rail at both its mouths */
function fgBcGate(g,C){const w=g.x1-g.x0,cx=(g.x0+g.x1)/2,ic=fgWcPal('iron');
 if(g.kind==='gate'){W(cx,0,g.z1,0,()=>{const up=1.6;for(let i=0;i<=8;i++){const x=-w/2+.3+i*(w-.6)/8;box('iron',x,up,.1,.1,g.h-up+.3,.1,ic);if(i<8)cone('iron',x+.05,up-.3,.1,.06,.3,ic,5);}
   for(const y of [up+.4,up+1.4,g.h-.25])box('iron',0,y,.1,w-.4,.1,.12,ic);
   for(const s of [-1,1])box('plate',s*(w/2-.25),.02,-1.6,.12,g.h-.4,2.4,fgCol('plate',C));
   fgWcSkull(0,g.h+.05,.25,0,1.3,C);});
  /* the tallies down the tunnel's walls: a stroke for each crossing, gated in fives */
  const col=hc(0xe8e2d4);for(const s of [-1,1])W(s>0?g.x1:g.x0,0,(g.z0+g.z1)/2,s>0?-PI/2:PI/2,()=>{for(let r=0;r<5;r++)for(let i=0;i<34;i++){const x=-(g.z1-g.z0)/2+.6+i*.5,y=.7+r*.32;
   if(i%5===4)box('plain',x-.9,y+.11,.012,1.1,.035,.01,col,0,0,.25);else box('plain',x,y,.012,.04,.24,.01,col);}});}
 else for(const z of [g.z0,g.z1])W(cx,-1.2,z,0,()=>{for(let i=0;i<=12;i++)box('iron',-w/2+.25+i*(w-.5)/12,0,0,.09,g.h+1.2,.09,ic);for(const y of [.6,g.h+.6])box('iron',0,y,0,w,.09,.12,ic);});}
/* a crow's nest: a plate platform on four fir poles over the bastion's roof, its rail, the horn to blow */
function fgBcLookout(q,C){const pc=fgCol('pole',C);W(q.x,q.y,q.z,0,()=>{for(const sx of [-1,1])for(const sz of [-1,1])pole('pole',[sx*.9,0,sz*.9],[sx*.8,3.2,sz*.8],.1,pc,6);
 box('plate',0,3.2,0,2.4,.08,2.4,fgCol('plate',C));for(const s of [-1,1]){box('rust',s*1.15,3.28,0,.06,.9,2.3,fgCol('rust',C));box('rust',0,3.28,s*1.15,2.3,.9,.06,fgCol('rust',C));}
 beam('horn',[.6,4.0,.6],[1.2,4.3,1.1],.09,fgWcPal('horn'),true,6,.03);});}
/* a picket's banner: a red hide on a fir pole over the parapet */
function fgBcPicket(q,C){W(q.x,q.y,q.z,q.ry,()=>{pole('pole',[0,0,0],[0,3.1,0],.06,fgCol('pole',C),5);withCloth(clothFlag(1.1,.12),()=>box('hide',.56,1.9,.02,1.1,1.1,.02,fgWcPal('red')));});}
function fgBcDraw(P,D,C,S){S.wrecks=0;S.gates=0;S.lookouts=0;S.pickets=0;
 for(const w of (D.wrecks||[])){if(C.worn&&w.tier)continue;fgBcWreck(w,C);S.wrecks++;}
 for(const g of (D.gates||[])){fgBcGate(g,C);S.gates++;}
 for(const q of (D.lookouts||[])){fgBcLookout(q,C);S.lookouts++;}
 for(const q of (D.pickets||[])){if(!C.worn)fgBcPicket(q,C);S.pickets++;}}
const FG_BC_GB=fgWcBox(fgBcPlan(),1.2,2.6,6.2);
defBuilding({key:'fg-bc-greathouse',name:'Barricade: the wall across the pass',seed:9207,w:FG_BC_GB.w,d:FG_BC_GB.d,h:FG_BC_GB.h,budget:600000,
 tags:{types:['dwelling-multi','military'],wealth:'middle',style:'salvage',role:'dwelling'},
 note:'the second great house (core/pueblo, the bar): a wall of rooms four rows deep across the Weyt Warra\'s gorge, terraced down to a long plaza open toward Firebliss, its outer face sheer and barricaded with stacked wrecks; bastions at the gorge\'s walls, a gate tunnel for the trail and a culvert for the river under its rooms; the count room in the plaza; the picket line made stone',
 build(o){const C=fgCx(o),P=o.plan||fgBcPlan();fgWcBuild(P,C,Object.assign({},o,{dress:o.dress||fgBcDress(P),extra:fgBcDraw}));}});
