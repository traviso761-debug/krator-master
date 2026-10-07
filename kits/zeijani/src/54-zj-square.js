// prefix: zq
// ================================================================= THE SQUARE (the owner's review, 2026-10-07): the park under the light well, the row
// house, the market hall, the public fountain. Built to fill Dhelv's square: homes in streets round it, green under the well.
// The row house's rooms are a planned body (its interiors item); the others are open (drawn, no interior).

/* a tree that grows in the well's light: a leaning trunk, a few limbs, clumps of leaves (felt, tinted greens); s scales it */
function zqTree(x,z,s,seed){const wd=P('woodD');let q=seed*9301+49297;const R=()=>{q=(q*16807)%2147483647;return q/2147483647;};
 const lean=(R()-.5)*.5,h=(3.6+R()*1.6)*s,tx=x+Math.sin(lean)*.6*s,tz=z+Math.cos(lean)*.3*s;
 beam('log',[x,0,z],[tx,h*.7,tz],.22*s,wd,true,8);
 for(let i=0;i<4;i++){const a=i*TAU/4+R(),L=(1.2+R())*s,ex=tx+Math.cos(a)*L,ez=tz+Math.sin(a)*L,ey=h*(.75+R()*.25);beam('log',[tx,h*.65,tz],[ex,ey,ez],.09*s,wd,true,6);
  ellip('felt',ex,ey+.35*s,ez,(1.3+R()*.5)*s,(.85+R()*.3)*s,(1.3+R()*.5)*s,P(R()<.5?'leaf':'leafD'),R()*TAU,12);}
 ellip('felt',tx,h+.5*s,tz,1.7*s,1.1*s,1.7*s,P('leaf'),0,14);}
/* a giant alecap (the cultivated purple cap, grown huge in the shade): a stem, a domed cap, paler gills */
function zqCap(x,z,h,r){cyl('hide',x,0,z,r*.16,h,P('lilac'),10);ellip('felt',x,h,z,r,r*.42,r,P('alecap'),0,18);cyl('felt',x,h-.1,z,r*.9,.06,P('lilac'),18);}
/* a shrub: three overlapping clumps */
function zqShrub(x,z,s,col){for(let i=0;i<3;i++){const a=i*2.1;ellip('felt',x+Math.cos(a)*.45*s,.45*s,z+Math.sin(a)*.45*s,.7*s,.55*s,.7*s,P(col||'leafD'),a,10);}}

/* the park under the light well: a round lawn in a kerb, four paths along the square's lanes and a ring path, a pool in the
   middle under the well with a fountain, beds of flowers and crops, trees round the ring, giant alecaps in the shade at the
   rim, shrubs, benches facing the pool */
defBuilding({key:'zj_park',name:'The park under the light well',seed:5401,cls:'feature',tags:{types:['civic'],wealth:'rich',style:'constructed',rock:'tuff'},w:34,d:34,h:8,front:{x:0,z:17},
 note:'a round garden under the light well: a lawn, paths along the lanes, a pool and fountain in the daylight, trees, shrubs, flower beds, giant alecaps at the shaded rim, benches',
 build(o){const R=16.5,c=P('white'),pv=P('tuffDark');
  cyl('earth',0,0,0,R,.12,P('grass'),48);lathe('tuffPol',0,0,[[R,0],[R+.35,0],[R+.35,.3],[R,.3]],48,c);
  /* the paths: four along the lanes (each 3.6 m), a ring at 10 m */
  for(const ry of [0,PI/2])box('paving',0,.12,0,3.6,.03,2*R,pv,ry);lathe('paving',0,0,[[9,.13],[11,.13]],48,pv);
  /* the pool and fountain */
  cyl('tuffPol',0,0,0,4.6,.55,c,32);cyl('water',0,.5,0,4.3,.02,P('water'),32);zfColumn('tuffPol',0,.5,0,.3,1.6,c);cyl('tuffPol',0,2.1,0,1.0,.18,c,16);
  for(let i=0;i<6;i++){const a=i*TAU/6;box('water',Math.cos(a)*.95,.55,Math.sin(a)*.95,.08,1.55,.08,P('water'));}
  /* beds, trees, caps, shrubs in the four quarters (none on a path) */
  let n=0;for(const qx of [-1,1])for(const qz of [-1,1]){
   for(const [r,a] of [[6.3,.78],[13.6,.5],[13.6,1.07]]){const x=qx*Math.cos(a)*r,z=qz*Math.sin(a)*r;zqTree(x,z,1,++n);}
   for(const [r,a] of [[15.3,.25],[15.3,1.32]]){const x=qx*Math.cos(a)*r,z=qz*Math.sin(a)*r;zqCap(x,z,3.4+((n++)%3)*.6,1.6);}
   for(const [r,a] of [[11.9,.78],[7.8,.35],[7.8,1.22]]){zqShrub(qx*Math.cos(a)*r,qz*Math.sin(a)*r,1,(n++)%2?'leafD':'leaf');}
   /* a bed of flowers and a bed of crops between the ring and the pool */
   const bx=qx*4.9,bz=qz*4.9;box('tuffPol',bx,.12,bz,2.6,.25,2.6,c);box('earth',bx,.12,bz,2.3,.27,2.3,P('felt'));
   for(let i=0;i<9;i++)zfCard(i%2?'cardCrop':'cardYam',bx+((i%3)-1)*.7,.39,bz+(Math.floor(i/3)-1)*.7,.45,.4,i*.7,WHITE);
   FURNISH('zeijani_stone_bench',qx*6.6,.12,qz*2.6,qx>0?-PI/2:PI/2,{setting:'outdoor'});}
  /* the lawn's grass: cards over the quarters, off the paths */
  for(let i=0;i<220;i++){const a=i*2.399,r=4.9+((i*.618)%1)*11,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<2.2||Math.abs(z)<2.2||Math.abs(Math.hypot(x,z)-10)<1.2)continue;zfCard('cardCrop',x,.12,z,.35,.3,a,P('grass'));}
  door(0,0,R,0,3.6);}});

/* the row house: a narrow house of three storeys in a street of them (the interiors planner's: living room and kitchen at the
   door, bedrooms above, a store under the roof), plastered and painted, a stepped doorway, a band at each floor, a roof terrace
   behind a parapet with a small awning. v picks the paint */
defBuilding({key:'zj_rowhouse',name:'Row house',seed:5402,cut:true,tags:{types:['dwelling-single'],wealth:'middle',style:'constructed',rock:'tuff'},w:8,d:10,h:11,
 build(o){const paint=['plaster','ochre','tuffRose','plaster'][o.v|0]||'plaster',col=P(paint),wt=P('white'),top=zvShell('zj_rowhouse',7,9,{wall:'plaster',col,y0:.3});
  for(const y of [3.3,6.2]){box('tuffPol',0,y,4.52,7.1,.18,.12,wt);box('tuffPol',0,y,-4.52,7.1,.18,.12,wt);}
  zvDoorway(0,.3,4.5,1.0,{n:2});sock('awning',0,top+1.9,1.5,0,{w:3.4,d:1.6,drop:.3,h:1.9});
  FURNISH('zeijani_olla',2.6,0,5.0,0,{v:1,setting:'outdoor'});}});

/* the market hall: a long roof on two rows of columns over the stalls (open on all sides), a raised floor, a frieze under the
   eaves, the stalls' counters and goods under it */
defBuilding({key:'zj_market_hall',name:'Market hall',seed:5403,tags:{types:['market'],wealth:'middle',style:'constructed',rock:'tuff'},w:26,d:11,h:7,
 build(o){const c=P('tuff'),wt=P('white');box('ashlar',0,0,0,25,.35,10,P('tuffDark'));box('paving',0,.35,0,24.4,.02,9.4,P('tuffDark'));
  for(const z of [-4.2,4.2])for(let i=0;i<9;i++)zfColumn('tuffPol',-12+i*3,.35,z,.24,4.2,wt);
  box('tuffPol',0,4.55,0,25.2,.5,10,wt);zfBand('patFriezeB',0,4.6,5.03,24.6,.4,0,wt);zfBand('patFriezeB',0,4.6,-5.03,24.6,.4,PI,wt);
  plane4('plank',[-12.8,5.05,0],[12.8,5.05,0],[-12.8,6.4,0],.12,P('wood'));
  plane4('thatch',[-12.9,6.5,0],[12.9,6.5,0],[-12.9,4.95,5.4],.16,P('thatch'));plane4('thatch',[12.9,6.5,0],[-12.9,6.5,0],[12.9,4.95,-5.4],.16,P('thatch'));
  for(let i=0;i<6;i++){const x=-10+i*4;box('plank',x,.35,1.3,3.0,.9,.8,P('wood'));FURNISH(['zeijani_pot_stack','zeijani_alecap_basket','zeijani_trade_display','zeijani_rope_coils','zeijani_jar_cradle','zeijani_glow_basin'][i],x,.35,-1.2,0,{setting:'outdoor'});}
  door(0,.35,5,0,3.0);}});

/* the public fountain: a round basin on two steps, a column with a bowl, the water falling from it, jars at its rim */
defBuilding({key:'zj_fountain',name:'Public fountain',seed:5404,cls:'infrastructure',tags:{types:['infrastructure'],wealth:'middle',style:'constructed',rock:'tuff'},w:6,d:6,h:4,front:{x:0,z:3},
 build(o){const c=P('white');cyl('ashlar',0,0,0,2.9,.2,P('tuffDark'),28);cyl('tuffPol',0,.2,0,2.5,.6,c,28);cyl('water',0,.75,0,2.25,.02,P('water'),28);
  zfColumn('tuffPol',0,.8,0,.22,2.0,c);cyl('tuffPol',0,2.8,0,.8,.18,c,16);cyl('water',0,2.97,0,.65,.02,P('water'),16);
  for(let i=0;i<8;i++){const a=i*TAU/8;box('water',Math.cos(a)*.78,.78,Math.sin(a)*.78,.06,2.2,.06,P('water'));}
  FURNISH('zeijani_olla',2.0,0,1.9,0,{setting:'outdoor'});FURNISH('zeijani_olla',-2.1,0,1.7,0,{v:1,setting:'outdoor'});}});
