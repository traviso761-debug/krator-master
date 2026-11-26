// ================================================================= HYPERJUNGLE — the lands' builders: the savage land (PLAN-LANDS.md section 2; J2, 2026-11-08)
// The savage hyperjungle's eight new species as builders, data and kit items. Nothing here runs at load but records and functions:
// no item is defined, no random number drawn, until a page asks (HYPERJUNGLE.LANDS.savage.def()), so station 1 and every world that
// reads this kit in place draw exactly what they drew. A station's host places them (stations/savage/87-host-station.js); another kit
// takes one by key (BIO.kitBuilder('hyperjungle', key): HYPERJUNGLE.builders). The geometry helpers are 54's (HYPERJUNGLE.LANDS.G).
//   cathedralfig  a strangler fig's hollow lattice of roots, 250-350 m, round the rotted-out host (BIO.tree, BIO.clumpOn)
//   combtree      the tualang: a cousin of the kit's ghostwood (BIO.kin), an emergent to 480 m, narrow crowned, giant-bee combs
//                 hung under its limbs
//   armourpalm    an understorey palm 20-40 m, its trunk ringed with black spines; oily fruit
//   elephantear   giant taro: leaves 6-12 m on stalks taller than a rider; browsed and broken along the trails
//   bailawn       the bai sedge: a grazed-down lawn of short tufts (the bais' ground is the host's)
//   skypitcher    an epiphytic pitcher 1-3 m in the boughs (core/biome 37 KTRAPS: a pitfall; harmless to people)
//   carrionarum   a corpse flower 6-10 m, a maroon spathe round a pale spire; a pitfall that holds a dog-sized animal a night
//   snareliana    a young liana's sticky creeping leaves on the floor (KTRAPS flypaper); grown, an ordinary canopy liana
// Every geometry is a unit one (origin at the foot or the hanging point, +y up, a linear vertex colour that is a shade), every
// placement a KRAND hash of the caller's cell: a builder draws a record, the host decides where.
// Textures: the cathedral fig's roots take materials.json `figbark` (bark.strangler) and the combs `comb` (organic.pod.honeycomb) when
// the pack carries them; the rest is vertex colour, stand-ins until their sets come (KNOWN_ISSUES.md, PROMPTS-NEEDED.md section 37).
(function(){
const TH=()=>BIO.host.THREE,U=KRAND.unit,HS=KRAND.hash;
const G=HYPERJUNGLE.LANDS.G,lin=G.lin,mixC=G.mixC,sc3=G.sc3;
const inKit=f=>function(){const p=BIO.kit('hyperjungle');try{return f.apply(this,arguments);}finally{BIO.kit(p);}};
const HV=HYPERJUNGLE.HV,TG=(o)=>Object.assign({},HYPERJUNGLE.TAGS,{land:'savage'},o);
const TRAP=G.TRAP;
// ---------------------------------------------------------------- the records (core/tags reads them by key: HYPERJUNGLE.byKey)
const L=HYPERJUNGLE.LANDS.savage={land:'savage',
 SPECIES:[
 {key:'cathedralfig',name:'Cathedral fig',H:[250,350],kind:'tree',tags:TG({harvest:HV('none (the lattice is a roost and a ladder)',['figs (the canopy\'s food)'],false,'A strangler that outlived its host: the host rotted out of a hollow tube of roots you can climb inside. The spider riders string silk through it.'),earth:'Ficus (stranglers)'})},
 {key:'combtree',name:'Comb tree',H:[400,490],kind:'tree',tags:TG({harvest:HV('timber (pale, rarely felled)',['giant-bee honey','wax'],true,'The giant bees hang combs 3-6 m long under its limbs: a flyer\'s job, and a dangerous one. The wax seals and lights.'),earth:'Koompassia excelsa (tualang)'})},
 {key:'armourpalm',name:'Armour palm',H:[20,40],kind:'tree',tags:TG({harvest:HV('none',['palm heart (a vegetable)','oily fruit'],false,'Black spines 30 cm long ring the trunk and keep the browsers off; trampled stands mark where the herds have been.'),earth:'Bactris, Aiphanes (spiny palms)'})},
 {key:'elephantear',name:'Elephant ear',H:[4,7],kind:'plant',tags:TG({harvest:HV('none',['taro corm (a staple; mildly toxic until cooked)'],true,'Leaves 6-12 m on stalks taller than a rider; the broken, browsed clumps line the beasts\' trails.'),earth:'Alocasia, Colocasia (giant taro)'})},
 {key:'bailawn',name:'Bai sedge',H:[.2,.6],kind:'plant',tags:TG({harvest:HV('none',[],false,'A lawn the herds keep grazed down: it grows only where they graze. Where the Riders\' ranches began.'),earth:'the grazing lawns of the Congo\'s bais'})},
 {key:'skypitcher',name:'Sky pitcher',H:[1,3],kind:'plant',tags:TG({harvest:HV('none',[],false,'An epiphytic pitcher in the boughs\' gardens: it catches the canopy darts and feeds on the droppings at the Nightwing roosts. The Nightwing tribe keeps them near the roosts. Not dangerous to people.'),earth:'Nepenthes rajah, N. lowii',
   trap:TRAP({kind:'pitfall',mouth:.35,preyMax:'small',lure:'nectar',danger:0})})},
 {key:'carrionarum',name:'Carrion arum',H:[6,10],kind:'plant',tags:TG({harvest:HV('none',['the corm (famine food)'],false,'A corpse flower that stinks of rot and flowers at dusk; its chamber traps an animal the size of a dog for a night. The one thing in the savage jungle that can kill a child.'),earth:'Amorphophallus titanum; the trap flowers of Arum',
   trap:TRAP({kind:'pitfall',mouth:1.2,preyMax:'medium',lure:'scent',danger:.35,cycle:{wait:43200,digest:43200}})})},
 {key:'snareliana',name:'Snare liana',H:[.3,1.2],kind:'plant',tags:TG({harvest:HV('rope fibre (the grown vine)',[],false,'While young it creeps over the floor with sticky glandular leaves and catches insects; grown, an ordinary canopy liana.'),earth:'Triphyophyllum peltatum',
   trap:TRAP({kind:'flypaper',mouth:.08,preyMax:'insect',lure:'dew',danger:0})})}]};
L.byKey={};L.SPECIES.forEach(S=>{L.byKey[S.key]=S;HYPERJUNGLE.byKey[S.key]=S;});
// the share of all three traps among the plants a page places is checked by the host (well under 1%)
L.TRAPS=['skypitcher','carrionarum','snareliana'];
// ---------------------------------------------------------------- the items (defined once, on the first def())
L.def=inKit(function(){if(L._def)return L._def;const D=L._def={};const M=HYPERJUNGLE.MAT;
 // THE CATHEDRAL FIG's roots: a bark bucket of their own (the library's strangler bark, or the ironbark's map as a stand-in, tinted grey)
 const FB=G.lib('figbark');D.figTex=!!FB;
 BIO.bucket('figbark',BIO.barkMat(FB?FB.map:(M.bark[0].map||HYPERJUNGLE.BARKTEX[0])),{label:'Cathedral fig roots',uvScale:FB?FB.scale:[10,14]});
 BIO.bucket('figsilk',BIO.barkMat(null),{label:'Spider-rider silk (in the cathedral figs)'});
 BIO.def('figclump',BIO.geo.clump(),M.leaf[4],{attrs:['aN'],label:'Cathedral fig foliage',kind:'cathedralfig'});
 BIO.def('figs',BIO.geo.pod(),M.pod,{label:'Cathedral figs',kind:'cathedralfig',onLeaf:true});
 // THE COMBS: a hanging wild comb, a long lobed tongue 1 high (y 0 at the limb, down to -1), honey-gold under a dark cap
 const CB=G.lib('comb');
 BIO.def('beecomb',G.geo(a=>{const gold=lin(0xc8902c),dark=lin(0x6a4418),pale=lin(0xe0b860);
   G.rev(a,[[.02,0],[.16,-.04],[.24,-.18],[.25,-.42],[.21,-.66],[.13,-.88],[.03,-1]],10,(i,s)=>i<2?dark:mixC(gold,pale,.3+.3*Math.sin(s*1.7+i)),{r:(i,an)=>1+.18*Math.sin(an*3+i*.7)});}),
  CB?BIO.solidMat(CB.map):G.vmat('beecomb',{swayA:.02,swayW:'(-position.y)'}),{label:'Giant-bee combs (under the comb trees\' limbs)',kind:'combtree'});
 // THE ARMOUR PALM: a trunk 1 high and 1 across with fourteen rings of twelve black spines (horizontal: the instance's y scale is
 // the palm's height, so a spine stays level), and a cluster of oily fruit
 BIO.def('armourtrunk',G.geo(a=>{const bk=lin(0x4a4034),ring=lin(0x5a5040),sp=lin(0x0c0a08),seg=9;
   G.rev(a,[[.5,0],[.46,.25],[.43,.6],[.4,1]],seg,(i,s)=>i%2?ring:bk);
   for(let r=0;r<14;r++){const y=.04+r/14*.92;for(let k=0;k<12;k++){const an=(k+(r%2)*.5)/12*TAU,c=Math.cos(an),s=Math.sin(an),r0=.44,L1=1.25,t=.03;
     const p0=a.v([c*r0-s*t,y,s*r0+c*t],sp),p1=a.v([c*r0+s*t,y,s*r0-c*t],sp),p2=a.v([c*L1,y-.004,s*L1],sp),p3=a.v([c*r0,y+.012,s*r0],sp),p4=a.v([c*r0,y-.012,s*r0],sp);
     a.f(p0,p2,p1);a.f(p3,p2,p4);}}}),G.smat(),{label:'Armour palm trunks (black-spined)',kind:'armourpalm'});
 BIO.def('palmfruit',BIO.geo.pod(),M.pod,{label:'Armour palm fruit',kind:'armourpalm',onLeaf:true});
 // THE ELEPHANT EAR's leaf: a stalk from the corm up 0.55 and out, a heart-shaped blade 1 long beyond it drooping at the tip, two
 // basal lobes back past the stalk; veins lighter. Vertex colour: the library's card.heartleaf is a whole leaf to try at the GPU pass
 BIO.def('taroleaf',G.geo(a=>{const st=lin(0x5a7a34),g0=lin(0x2e5a24),g1=lin(0x467a30),vein=lin(0x8aa860);
   for(let i=0;i<5;i++){const t=i/4,t1=(i+1)/4;const p=t=>[.12*t*t,.55*Math.sin(t*1.45),0];const A=p(t),B=p(t1),w=.018*(1-.4*t);
    const q0=a.v([A[0],A[1],-w],st),q1=a.v([A[0],A[1],w],st),q2=a.v([B[0],B[1],-w],st),q3=a.v([B[0],B[1],w],st),q4=a.v([A[0]-w,A[1],0],st),q5=a.v([B[0]-w,B[1],0],st);a.f(q0,q2,q3);a.f(q0,q3,q1);a.f(q4,q5,q2);a.f(q4,q2,q0);}
   const ox=.12,oy=.55*Math.sin(1.45),n=10,m=4,rows=[];
   for(let i=0;i<=n;i++){const t=i/n,x=-.18+1.18*t,w=.42*Math.sin(Math.PI*Math.min(1,(t+.08)/1.02))*(t<.16?(.75+1.6*t):1),row=[];
    for(let j=-m;j<=m;j++){const s=j/m,cup=.06*s*s,dr=-.32*t*t;row.push(a.v([ox+x,oy+dr+cup-(t<.16?.05*(1-t/.16):0),s*w],Math.abs(s)<.12||(i%3===0&&Math.abs(s)<.7)?vein:mixC(g0,g1,.5+.5*s),[t,.5+.5*s]));}rows.push(row);}
   for(let i=0;i<n;i++)for(let j=0;j<2*m;j++){const A=rows[i][j],B=rows[i][j+1],C2=rows[i+1][j],E=rows[i+1][j+1];a.f(A,C2,E);a.f(A,E,B);}}),
  G.vmat('taroleaf',{swayW:'(position.x)',swayA:.035,backlit:HYPERJUNGLE.LOOKS.backlit}),
  {label:'Elephant ear (giant taro)',kind:'elephantear'});
 // THE BAI SEDGE: three crossed cards (v 0 at the ground), painted short sedge and grass blades rooted at the canvas's top row
 const sedgeTex=BIO.alphaTex(128,(g,S)=>{for(let k=0;k<46;k++){const x0=S*(.08+.84*((k*.6180339)%1)),h=S*(.45+.5*((k*.4142)%1)),lean=S*.18*(((k*.7321)%1)-.5);
   g.strokeStyle=['#5a7a34','#6a8a3c','#4a6a2c','#7a9a48','#8a8a48'][k%5];g.lineWidth=2+(k%3);g.beginPath();g.moveTo(x0,0);g.quadraticCurveTo(x0+lean*.4,h*.5,x0+lean,h);g.stroke();}},[80,104,52]);   /* a DataTexture: row 0 (the canvas's top) is v 0, the root */
 BIO.def('baisedge',(function(){const T=TH(),pos=[],nor=[],uv=[];for(let k=0;k<3;k++){const an=k/3*Math.PI,c=Math.cos(an)*.5,s=Math.sin(an)*.5;
   const A=[-c,0,-s],B=[c,0,s],C2=[c,1,s],D2=[-c,1,-s];[[A,0,0],[B,1,0],[C2,1,1],[A,0,0],[C2,1,1],[D2,0,1]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);nor.push(0,1,0);uv.push(q[1],q[2]);});}
   const g=BIO.geo._make(pos,nor,uv);return g;})(),BIO.leafMat(sedgeTex,'baisedge',{swayW:'(position.y)',swayA:.08,alphaTest:.4,ground:HYPERJUNGLE.LOOKS.ground}),{label:'Bai sedge (the grazed lawn)',kind:'bailawn'});
 // THE SKY PITCHER: hung from its tendril at the origin (y 0) down to a pitcher whose mouth is at -0.35 and its foot at -1; the
 // peristome ridged wine and green, the body mottled wine over moss green, a lid over the mouth
 D.trapPitch=L.byKey.skypitcher.tags.trap;
 BIO.def('skypitcher',G.geo(a=>{const wine=lin(0x5a1426),moss=lin(0x5a7a2a),rim=lin(0x2a0810),lidc=lin(0x6a3a24);
   for(let i=0;i<6;i++){const t=i/5,t1=(i+1)/5;if(i===5)break;const P=t=>[.18*Math.sin(t*3),-.35*t,.06*Math.cos(t*2)],A=P(t),B=P(t1),w=.012;
    const q0=a.v([A[0]-w,A[1],A[2]],moss),q1=a.v([A[0]+w,A[1],A[2]],moss),q2=a.v([B[0]-w,B[1],B[2]],moss),q3=a.v([B[0]+w,B[1],B[2]],moss);a.f(q0,q2,q3);a.f(q0,q3,q1);}
   G.rev(a,[[.02,-1],[.2,-.95],[.29,-.8],[.27,-.62],[.19,-.47],[.22,-.39],[.25,-.36],[.2,-.34]],12,(i,s)=>i>=5?(s%2?rim:wine):mixC(wine,moss,(i<2?.6:.15)+.25*((s*7+i*3)%4)/3),{x:.05});
   const lid=[];for(let s=0;s<=8;s++){const an=s/8*TAU;lid.push(a.v([.05+Math.cos(an)*.2,-.18+Math.sin(an)*.04,.04+Math.sin(an)*.17],lidc));}
   const c0=a.v([.05,-.17,.06],lidc);for(let s=0;s<8;s++)a.f(c0,lid[s],lid[s+1]);}),G.vmat('skypitcher',{swayW:'(-position.y)',swayA:.25}),{label:'Sky pitchers (epiphytic, in the boughs)',kind:'skypitcher'});
 // THE CARRION ARUM: a spathe of 300 degrees round a pale spadix, frilled at its rim, maroon within and pale green-maroon without;
 // the spadix a cream spire to the top (1)
 BIO.def('carrionarum',G.geo(a=>{const mar=lin(0x4a0c18),mar2=lin(0x6a1424),out=lin(0x5a6a3a),cream=lin(0xe8dcb0),tuber=lin(0x5a4a30);
   G.rev(a,[[.16,0],[.14,.04]],10,()=>tuber);
   const n=7,seg=16,arc=TAU*.84,rows=[];for(let i=0;i<=n;i++){const t=i/n,y=.03+.42*t,r=.1+.32*Math.sin(Math.PI*.55*t)+.05*t,row=[];
    for(let s=0;s<=seg;s++){const an=.35+s/seg*arc,fr=t>.75?1+.12*Math.sin(an*9)*((t-.75)/.25):1;row.push(a.v([Math.cos(an)*r*fr,y+(t>.75?.03*Math.sin(an*9):0),Math.sin(an)*r*fr],t<.2?out:mixC(mar,mar2,.5+.5*Math.sin(s*1.3)),[s/seg,t]));}rows.push(row);}
   for(let i=0;i<n;i++)for(let s=0;s<seg;s++){const A=rows[i][s],B=rows[i][s+1],C2=rows[i+1][s],E=rows[i+1][s+1];a.f(A,C2,E);a.f(A,E,B);}
   G.rev(a,[[.08,.04],[.1,.2],[.085,.5],[.05,.8],[.004,1]],8,(i)=>sc3(cream,.85+.1*i/4));}),G.vmat('carrionarum',{swayA:.012}),{label:'Carrion arum (a corpse flower; a pitfall)',kind:'carrionarum'});
 // THE SNARE LIANA, young: a rosette of eleven long sticky leaves flat on the floor (radius 1), each tip red with glands
 BIO.def('snareleaf',G.geo(a=>{const g0=lin(0x5a7a2a),g1=lin(0x6a8a34),gl=lin(0xb02a1a);
   for(let k=0;k<11;k++){const an=k/11*TAU+.3*Math.sin(k*2.1),c=Math.cos(an),s=Math.sin(an),rows=[];
    for(let i=0;i<=5;i++){const t=i/5,r=.08+.92*t,w=.035+.02*Math.sin(Math.PI*t),y=.02+.05*Math.sin(Math.PI*t)+(t>.8?.06*(t-.8)/.2:0),col=t>.6?mixC(g1,gl,(t-.6)/.4):g0;
     rows.push([a.v([c*r-s*w,y,s*r+c*w],col),a.v([c*r+s*w,y,s*r-c*w],col)]);}
    for(let i=0;i<5;i++){a.f(rows[i][0],rows[i+1][0],rows[i+1][1]);a.f(rows[i][0],rows[i+1][1],rows[i][1]);}}}),G.vmat('snareleaf',{swayA:.01,ground:HYPERJUNGLE.LOOKS.ground}),
  {label:'Snare liana (young: sticky creeping leaves)',kind:'snareliana'});
 return D;});
// ---------------------------------------------------------------- the trees
// make(key, x, y, z, seed): a record; grow(T, lv): its geometry (lv 2 near, 1 mid, 0 far). Every number from KRAND.hash(T.seed, ...)
const uOf=(T,k,s)=>U(HS(T.seed,k,0,(s==null?0x5a1:s)));
// THE CATHEDRAL FIG. n root strands spiral up a tube flared at the foot (the old host's buttress line) and narrowing to the crown;
// every ~16 m a strand fuses to its neighbour (anastomoses, diagonals), so the tube is a lattice you can climb inside; at the top the
// strands open into a crown of limbs (BIO.clumpOn: every card on its limb). Silk hung across the hollow inside. The host's rotted
// heart leaves a dark hollow under the lattice (no geometry: open)
L.cathedralfig={make(x,y,z,seed){const T={key:'cathedralfig',x,z,y0:y-1,seed:seed>>>0};T.H=250+100*uOf(T,1);T.R0=20+8*uOf(T,2);T.crownR=T.H*.24;T.rb=T.R0;return T;},
 grow:inKit(function(T,lv){L.def();const n=lv>=2?18:lv===1?12:8,H=T.H,R0=T.R0,col=lin(0x9a948a),st={tris:0,cards:0};
  const rAt=u=>R0*(1.55-.55*smooth(0,.12,u))*(1-.42*smooth(.1,.92,u)),tw=.9+.6*uOf(T,3),dy=lv>=2?11:lv===1?18:30;
  const ny=Math.ceil(H*.93/dy),pts=[];
  for(let k=0;k<n;k++){const a0=k/n*TAU+.2*(uOf(T,10+k)-.5),P=[];
   for(let i=0;i<=ny;i++){const u=i/ny*.93,y=T.y0+H*u,a=a0+tw*u*TAU*.5+.12*Math.sin(u*9+k),r=rAt(u)*(1+.06*Math.sin(u*13+k*2.3));
    P.push({x:T.x+Math.cos(a)*r,y,z:T.z+Math.sin(a)*r,r:(1.7-.9*u)*(.8+.4*uOf(T,40+k))*(i===0?1.6:1)});}pts.push(P);}
  BIO.tree(T.x,T.z,()=>{
   pts.forEach(P=>{st.tris+=BIO.tube('figbark',P,col,{seg:lv>=2?7:5});});
   if(lv>=1){for(let k=0;k<n;k++){const A=pts[k],B=pts[(k+1)%n];for(let i=1;i<ny-1;i+=lv>=2?2:3){const j=Math.min(ny-1,i+1),a=A[i],b=B[j],m={x:(a.x+b.x)/2*1.02-T.x*.02,y:(a.y+b.y)/2,z:(a.z+b.z)/2*1.02-T.z*.02};
     st.tris+=BIO.tube('figbark',[{x:a.x,y:a.y,z:a.z,r:a.r*.55},{x:m.x,y:m.y,z:m.z,r:a.r*.42},{x:b.x,y:b.y,z:b.z,r:b.r*.55}],col,{seg:5});}}}
   });
  // the crown (its own scope, so only its limbs carry clumps): each strand's top runs out into a limb, forked once
  const top=T.y0+H*.93;
  const crown=BIO.tree(T.x,T.z,()=>{
   pts.forEach((P,k)=>{const e=P[P.length-1],a=Math.atan2(e.z-T.z,e.x-T.x),L1=T.crownR*(.6+.4*uOf(T,70+k)),el=.25+.35*uOf(T,90+k);
    const m={x:e.x+Math.cos(a)*L1*.5,y:top+L1*el*.5,z:e.z+Math.sin(a)*L1*.5},t1={x:e.x+Math.cos(a+.3)*L1,y:top+L1*el*.75,z:e.z+Math.sin(a+.3)*L1},t2={x:e.x+Math.cos(a-.35)*L1*.85,y:top+L1*el*.9,z:e.z+Math.sin(a-.35)*L1*.85};
    st.tris+=BIO.tube('figbark',[{x:e.x,y:e.y,z:e.z,r:e.r},{x:m.x,y:m.y,z:m.z,r:e.r*.6},{x:t1.x,y:t1.y,z:t1.z,r:.35}],col,{seg:5});
    if(lv>=1)st.tris+=BIO.tube('figbark',[{x:m.x,y:m.y,z:m.z,r:e.r*.45},{x:t2.x,y:t2.y,z:t2.z,r:.3}],col,{seg:4});});
   });
  // the silk the spider riders string across the hollow, low in the tube
  {if(lv>=2){const silk=lin(0xe8e4dc);for(let k=0;k<7;k++){const i=2+Math.floor(uOf(T,120+k)*(ny*.5)),a=pts[k*2%n][i],b=pts[(k*2+n/2)%n][Math.min(ny-1,i+1)];
     const own=BIO.owner;BIO.owner=[T.x,T.z];BIO.tube('figsilk',[{x:a.x,y:a.y,z:a.z,r:.06},{x:(a.x+b.x)/2,y:(a.y+b.y)/2-6,z:(a.z+b.z)/2,r:.05},{x:b.x,y:b.y,z:b.z,r:.06}],silk,{seg:3});BIO.owner=own;}}}
  if(BIO.clumpOn){const leaf=[0x1f4a26,0x2a5a2e,0x23502a],own=BIO.owner;BIO.owner=[T.x,T.z];
   try{BIO.clumpOn('figclump',crown,{per:lv>=2?9:lv===1?5:3,size:[14,22],flat:.6,t0:.35,t1:1,rMax:.6,seed:T.seed,salt:0x5f1,col:(r,i)=>leaf[i%3]});
    if(lv>=1)BIO.clumpOn('figs',crown,{per:lv>=2?6:3,size:[1.4,2.2],flat:1,t0:.4,t1:.95,rMax:.6,seed:T.seed,salt:0x5f2,col:(r,i)=>[0x8a3a5a,0xa04a40,0x7a2a48][i%3]});}
   finally{BIO.owner=own;}}
  T.top=T.y0+H*.93+T.crownR*.6;return st;})};
// THE COMB TREE: the ghostwood's builder (BIO.kin: its own record while it grows), a smooth pale-pink emergent, crown narrowed, H 400-490
// (it keeps its own size under the old-growth habit: noHabit), no racemes; then combs hung under its highest limbs (the logged spans
// within 50 degrees of level, over 55% of its height, thick enough to hold one)
L.combKin=null;
L.comb=inKit(function(){if(L.combKin)return L.combKin;const G0=HYPERJUNGLE.byKey.ghostwood;if(!BIO.kin||!G0)return null;
 L.combKin=BIO.kin('hyperjungle.ghostwood',{key:'combtree',name:'Comb tree',scale:{H:1.95,rb:1.08,crownR:.58},
  habit:{noHabit:true,hang:null,crown0:.7,hab:Object.assign({},G0.hab,{secStart:.62,secLen:[.26,.4],secUp:.35,topN:[3,4],topLen:[.18,.3],topEl:[.5,.9],clumps:1.4,fillN:1})},
  colour:{bark:[0xd8c4bc,0xcdb8ae,0xe2d0c6],leaf:[0x2e5a2a,0x356632,0x284e26,0x3c6a34]},
  tags:Object.assign({},L.byKey.combtree.tags)});return L.combKin;});
L.combtree={make(x,y,z,seed){const K=L.comb();if(!K)return null;reseed(seed>>>0);const T=K.make(x,y,z);T.key='combtree';T.seed2=seed>>>0;return T;},
 grow:inKit(function(T,lv){const K=L.comb();L.def();if(!K)return null;let st=null;
  const segs=BIO.tree(T.x,T.z,()=>{st=K.grow(T,lv);},{});
  let combs=0;T.segN=segs.length;if(lv>=1){const y1=T.y0+T.H*.55;
   segs.forEach((s,i)=>{const dx=s.b[0]-s.a[0],dy=s.b[1]-s.a[1],dz=s.b[2]-s.a[2],l=Math.hypot(dx,dy,dz);if(l<4||s.a[1]<y1||s.r1<.45||Math.abs(dy)/l>.75)return;
    const h=HS(T.seed2,i,0,0x5c0);if(U(h)>(lv>=2?.5:.25))return;const t=.3+.5*U(HS(h,1)),L2=3+3*U(HS(h,2)),w=L2*.9;
    BIO.put('beecomb',[s.a[0]+dx*t,s.a[1]+dy*t-(s.r0+s.r1)*.45,s.a[2]+dz*t],qEuler(0,U(HS(h,3))*TAU,0),[w,L2,w*.7],0xffffff);combs++;});}
  T.combs=combs;return st;})};
// THE ARMOUR PALM: its spined trunk (one instance), a crown of the kit's fronds, the fruit under it
L.armourpalm={make(x,y,z,seed){const T={key:'armourpalm',x,z,y0:y-.2,seed:seed>>>0};T.H=20+20*uOf(T,1);T.r=.32+.16*uOf(T,2);return T;},
 grow:inKit(function(T,lv){L.def();const lean=[.06*(uOf(T,3)-.5),1,.06*(uOf(T,4)-.5)],top=[T.x+lean[0]*T.H,T.y0+T.H,T.z+lean[2]*T.H];
  BIO.put('armourtrunk',[T.x,T.y0,T.z],qUp(lean),[T.r,T.H,T.r],0xffffff);
  const n=lv>=2?14:lv===1?9:6,Lf=7+3*uOf(T,5),a0=uOf(T,6)*TAU;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+.25*(uOf(T,20+k)-.5),pitch=-.1-.6*uOf(T,40+k);
   BIO.put('frond',top,qEuler(.15*(uOf(T,60+k)-.5),-a,pitch),[Lf,Lf*(.85+.2*uOf(T,80+k)),Lf*(1.1+.3*uOf(T,100+k))],[0x2f5a2c,0x3c6a30,0x486f34][k%3]);}
  if(lv>=1)for(let k=0;k<4;k++){const a=a0+k*1.7;BIO.put('palmfruit',[top[0]+Math.cos(a)*.7,top[1]-1.2,top[2]+Math.sin(a)*.7],null,1.4,[0xc8502a,0xb83a22,0xd8682a][k%3]);}
  return{tris:BIO.defs.armourtrunk.tris+n*BIO.defs.frond.tris};})};
// THE ELEPHANT EAR: a clump of 5-12 leaves round one corm, each on its own bearing; `broken` (along a trail): half of them snapped and
// laid low, browner
L.elephantear={make(x,y,z,seed,broken){const T={key:'elephantear',x,z,y0:y,seed:seed>>>0,broken:!!broken};T.L=6+6*uOf(T,1);T.n=5+Math.floor(8*uOf(T,2));return T;},
 grow:inKit(function(T,lv){L.def();const n=lv>=2?T.n:Math.max(3,Math.ceil(T.n/2)),a0=uOf(T,3)*TAU;
  for(let k=0;k<n;k++){const a=a0+k/n*TAU+.4*(uOf(T,10+k)-.5),s=T.L*(.7+.3*uOf(T,30+k)),bk=T.broken&&uOf(T,50+k)<.55;
   BIO.put('taroleaf',[T.x,T.y0,T.z],qEuler(bk?-.9-.5*uOf(T,70+k):.1*(uOf(T,70+k)-.5),-a,bk?.5:-.05*uOf(T,90+k)),[s,s*(bk?.5:.9+.2*uOf(T,110+k)),s],
    bk?[0x8a8a48,0x9a8a4a,0x7a6a3a][k%3]:[0xffffff,0xe8f0d8,0xd8e8c8][k%3]);}
  return{leaves:n};})};
// THE CARRION ARUM and THE SNARE LIANA, one instance each; THE SKY PITCHER at a bough perch (P: {x, y, z, r})
L.carrionarum={make(x,y,z,seed){const T={key:'carrionarum',x,z,y0:y-.1,seed:seed>>>0};T.H=6+4*uOf(T,1);return T;},
 grow:inKit(function(T){L.def();BIO.put('carrionarum',[T.x,T.y0,T.z],qEuler(0,uOf(T,2)*TAU,0),[T.H*.95,T.H,T.H*.95],0xffffff);return{};})};
L.snareliana={make(x,y,z,seed){const T={key:'snareliana',x,z,y0:y,seed:seed>>>0};T.R=.8+1.6*uOf(T,1);return T;},
 grow:inKit(function(T){L.def();BIO.put('snareleaf',[T.x,T.y0,T.z],qEuler(0,uOf(T,2)*TAU,0),[T.R,T.R*.8,T.R],0xffffff);return{};})};
L.skypitcher={make(x,y,z,seed){const T={key:'skypitcher',x,z,y0:y,seed:seed>>>0};T.H=1+2*uOf(T,1);return T;},
 grow:inKit(function(T){L.def();BIO.put('skypitcher',[T.x,T.y0,T.z],qEuler(0,uOf(T,2)*TAU,0),T.H,0xffffff);return{};})};
L.bailawn={make(x,y,z,seed){const T={key:'bailawn',x,z,y0:y,seed:seed>>>0};T.H=.25+.35*uOf(T,1);return T;},
 grow:inKit(function(T){L.def();BIO.put('baisedge',[T.x,T.y0,T.z],qEuler(0,uOf(T,2)*TAU,0),[T.H*1.6,T.H,T.H*1.6],[0x8aa860,0x9ab868,0x7a9a50,0xa8b070][Math.floor(uOf(T,3)*4)]);return{};})};
// every one by key, for BIO.kitBuilder('hyperjungle', key) (a cousin's or a neighbour's read)
L.SPECIES.forEach(S=>{const B=L[S.key];if(B&&B.make&&B.grow)HYPERJUNGLE.builders[S.key]={species:S,make:B.make,grow:B.grow};});
})();
