// ================================================================= HYPERJUNGLE — the lands' builders: the north, Screamer wood (PLAN-LANDS.md section 3; J3, 2026-11-08)
// Hyperjungle N's jungle: a forest that looks and sounds like people. Every unsettling thing is a real plant habit used in a
// frightening way: it SCREAMS (the howl bamboo, its culms bored through and blown by the dusk wind), it WATCHES (the watchers' eye
// scars), it REACHES (the hand-flowers), it WEARS SKULLS (the skull-pods), it is DYING (the bone giants hung with widow's hair as the
// north dries out), and it is QUIET (few birds; the station's fauna is thin). As 56: builders, data and kit items only, nothing at
// load but records and functions (station 1 and the in-place readers unchanged); a station's host places them
// (stations/north/87-host-station.js); biomes/savannarim reads the bone giant and the bloodwood in place (HYPERJUNGLE.builders).
//   howlbamboo   a cousin of the Cut's hyperbamboo on core/biome's bamboo parts (33b, H5: BIO.bamboo): culms 50-70 m, internodes of
//                uneven length (outside the Cut's warp: jit), the old culms bored through in rows (holeSet) with pale stains, sheaths
//                at the foot; groves of 50-300 culms; gregarious flowering (flowering(): a cohort green, flowering, dead, regrowing)
//   bonegiant    a state: the kit's hypertrees killed standing, white and barkless, the crown a few broken limbs, 150-300 m
//   watcher      60-90 m, pale bark covered in dark almond-shaped branch scars (eyes), thickest at a person's head height
//   handflower   30-50 m, red flowers opening as five-clawed hands held palm up, under felted leaves
//   bloodwood    30-45 m, its bark streaked dark red where the sap ran (savannarim reads it in place for the savannah's edge)
//   skullpod     a 2-4 m shrub whose dry seed pods are fist-sized skulls
//   widowhair    grey hanging curtains 10-40 m long on the bone giants and dead limbs
//   ghostpipe    waxy white stems 1-2 m, bent over at the head, in clumps on the darkest floor (under the bamboo)
//   devilsfingers red fungal fingers 1-2 m curling back out of a pale egg (BIO.fung's parts)
// Textures: stand-ins until the library sets come (KNOWN_ISSUES.md, PROMPTS-NEEDED.md section 37): the watcher's and the bloodwood's bark
// are canvases painted here (bark.watcher, bark.bloodwood owed), the bone giants wear materials.json `bonewood` (wood.silver), the
// howl bamboo `howlculm` (bark.bamboo.jade; bark.bamboo.bored owed) and `howlleaf` (card.bamboo.giant; card.bamboo.leaf owed).
(function(){
const G=HYPERJUNGLE.LANDS.G,lin=G.lin,mixC=G.mixC,sc3=G.sc3,U=KRAND.unit,HS=KRAND.hash,TH=()=>BIO.host.THREE;
const inKit=f=>function(){const p=BIO.kit('hyperjungle');try{return f.apply(this,arguments);}finally{BIO.kit(p);}};
const HV=HYPERJUNGLE.HV,TG=(o)=>Object.assign({},HYPERJUNGLE.TAGS,{land:'north',aridity:'subhumid'},o);
const uOf=(T,k,s)=>U(HS(T.seed>>>0,k,0,(s==null?0x571:s)));
const L=HYPERJUNGLE.LANDS.north={land:'north',
 SPECIES:[
 {key:'howlbamboo',name:'Howl bamboo',H:[50,70],kind:'bamboo',tags:TG({kin:'cut.hyperbamboo',harvest:HV('culms (the Hexahedron\'s ladders and lashings)',['shoots'],false,'The dusk wind blows through the borer holes and the groves howl. The holed culms are prized as horns.'),earth:'Dendrocalamus giganteus; the singing bamboo'})},
 {key:'bonegiant',name:'Bone giant',H:[150,300],kind:'state',tags:TG({state:'dead standing',harvest:HV('timber (for whoever can fell it)',[],false,'The kit\'s hypertrees killed standing as the north dries: white, barkless, a few limbs left, hung with grey hair.'),earth:'the dead standing kauri and redwood snags of a drying forest'})},
 {key:'watcher',name:'Watcher',H:[60,90],kind:'tree',tags:TG({harvest:HV('soft white timber',[],false,'Dark almond-shaped branch scars, eyes, thickest at a person\'s head height. The Screamers carve the eyes into masks.'),earth:'Populus tremuloides (aspen)'})},
 {key:'handflower',name:'Hand-flower tree',H:[30,50],kind:'tree',tags:TG({harvest:HV('none',[],false,'Red flowers open as five-clawed hands held palm up under felted leaves. The Screamers call the hands the elders (proposed).'),earth:'Chiranthodendron pentadactylon (devil\'s hand tree)'})},
 {key:'bloodwood',name:'Bloodwood',H:[30,45],kind:'tree',tags:TG({harvest:HV('timber',[],true,'Bleeds thick red sap wherever it is cut or browsed: red dye and body paint, the Screamers\' painted dots.'),dye:'red',earth:'Pterocarpus angolensis (kiaat)'})},
 {key:'skullpod',name:'Skull-pod',H:[2,4],kind:'plant',tags:TG({harvest:HV('none',[],false,'Its dry seed pods are fist-sized skulls that rattle in the wind; the Screamers string them on skull poles.'),earth:'Antirrhinum (snapdragon seed pods)'})},
 {key:'widowhair',name:'Widow\'s hair',H:[10,40],kind:'plant',tags:TG({harvest:HV('stuffing; fuel (tinder)',[],false,'Grey hanging curtains on the bone giants and the dead limbs.'),earth:'Tillandsia usneoides; old man\'s beard'})},
 {key:'ghostpipe',name:'Ghost pipe',H:[1,2],kind:'plant',tags:TG({harvest:HV('none',[],true,'Waxy white, no chlorophyll; it turns black when touched. A sedative (proposed medicine).'),earth:'Monotropa uniflora'})},
 {key:'devilsfingers',name:'Devil\'s fingers',H:[1,2],kind:'fungus',tags:TG({harvest:HV('none',[],false,'Red fingers that hatch out of a pale egg and curl back; they stink.'),earth:'Clathrus archeri (octopus stinkhorn)'})}]};
L.byKey={};L.SPECIES.forEach(S=>{L.byKey[S.key]=S;HYPERJUNGLE.byKey[S.key]=S;});
// the howl bamboo's culm variants: the grove's three internode counts by two seeds, plain and holed (the old culms), with their mid and
// far tiers (BIO.bamboo.tiers); names 'howl'+n+(holed?'h':'')+v and 'howlm'/'howlf'+n
L.CULM_N=[28,24,20];L.VAR=2;
L.def=inKit(function(){if(L._def)return L._def;const D=L._def={};const M=HYPERJUNGLE.MAT,T3=TH();
 // THE HOWL BAMBOO (BIO.bamboo, H5): culms on the library's jade culm detail (a stand-in for bark.bamboo.bored), vertex shade x the colour
 const CL=G.lib('howlculm'),LF=G.lib('howlleaf',true);D.tex={culm:!!CL,leaf:!!LF};
 const culmMat=new T3.MeshLambertMaterial({color:0xffffff,map:CL?CL.map:null,vertexColors:true,side:T3.DoubleSide});
 if(BIO.bamboo){const B=BIO.bamboo;
  L.CULM_N.forEach(n=>{for(let v=0;v<L.VAR;v++){const o={n,seg:9,jit:.28,grade:.25,seed:0x4b00+n*7+v,sheaths:2};
    BIO.def('howl'+n+'_'+v,B.culm(o),culmMat,{label:'Howl bamboo culms',kind:'howlbamboo'});
    BIO.def('howl'+n+'h'+v,B.culm(Object.assign({},o,{holes:B.holeSet({n,rows:3,from:5,to:n-4,every:2,seed:0x4b80+n*7+v,miss:.2,r:[.2,.32]})})),culmMat,{label:'Howl bamboo culms, bored through (they howl)',kind:'howlbamboo'});}
   const t=B.tiers({n,seg:9,jit:.28,grade:.25,seed:0x4b00+n*7});BIO.def('howlm'+n,t.mid,culmMat,{label:'Howl bamboo culms',kind:'howlbamboo'});BIO.def('howlf'+n,t.far,culmMat,{label:'Howl bamboo culms',kind:'howlbamboo'});});
  /* the leaf sprays: the library's giant bamboo sheet (3 x 3, a cell a card), else a painted stand-in sheet of lanceolate leaves */
  const sheet=LF?LF.map:BIO.alphaTex(256,(g,S)=>{for(let c=0;c<9;c++){const cx=(c%3+.5)*S/3,cy=Math.floor(c/3)*S/3;g.strokeStyle='#4a5a2a';g.lineWidth=1.5;g.beginPath();g.moveTo(cx,cy+2);g.lineTo(cx+4,cy+S/3*.9);g.stroke();
    for(let k=0;k<9;k++){const y=cy+6+k*S/3*.09,side=k%2?1:-1,L2=S/3*(.32+.1*((k*.618)%1));g.fillStyle=['#5a7a34','#4a6a2c','#6a8a3c'][k%3];g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+side*L2*.5,y+L2*.25,cx+side*L2,y+L2*.55);g.quadraticCurveTo(cx+side*L2*.45,y+L2*.4,cx,y);g.fill();}}},[70,96,44]);
  const leafMat=BIO.leafMat(sheet,'howlleaf',{aN:false,swayW:'(-position.y)',swayA:.1,axis:1,alphaTest:.38});
  [0,4,8].forEach((c,i)=>BIO.def('howlleaf'+i,B.spray({cell:c}),leafMat,{label:'Howl bamboo leaf sprays',kind:'howlbamboo'}));
  BIO.def('howlshoot',B.shoot({}),culmMat,{label:'Howl bamboo shoots',kind:'howlbamboo'});}
 // THE BONE GIANTS' wood (the library's silvered wood, or the ghostwood's pale bark map) and widow's hair (a strand card painted here)
 const BW=G.lib('bonewood');D.bone=!!BW;
 BIO.bucket('bonewood',BIO.barkMat(BW?BW.map:(M.bark[1].map||HYPERJUNGLE.BARKTEX[1])),{label:'Bone giants (dead standing hypertrees)',uvScale:BW?BW.scale:[12,12]});
 const hair=BIO.alphaTex(128,(g,S)=>{for(let k=0;k<70;k++){const x0=S*((k*.6180339)%1),len=S*(.45+.55*((k*.414)%1)),sw=S*.06*(((k*.7321)%1)-.5);
   g.strokeStyle=['#8a8a80','#9a9a90','#7a7a72','#a8a8a0'][k%4];g.lineWidth=1+(k%2);g.beginPath();g.moveTo(x0,0);g.bezierCurveTo(x0+sw,len*.3,x0-sw,len*.6,x0+sw*.5,len);g.stroke();}},[130,130,122]);
 BIO.def('widowhair',BIO.geo.ribbon(4,.35,.08),BIO.leafMat(hair,'widowhair',{swayW:'(-position.y)',swayA:.07,axis:1,alphaTest:.35}),{label:'Widow\'s hair (grey hanging curtains)',kind:'widowhair'});
 // THE WATCHER: a pale bark painted with dark almond eyes, thickest low (the canvas's bottom rows: v runs up the bole), aspen leaves
 const eyes=G.barkCanvas('watcher',256,512,(g,W,H,u)=>{g.fillStyle='#d8d6cc';g.fillRect(0,0,W,H);
   for(let k=0;k<900;k++){g.fillStyle=k%2?'rgba(170,168,156,.35)':'rgba(236,234,226,.4)';g.fillRect(u(k)*W,u(k+999)*H,2+u(k+1999)*8,1+u(k+2999)*2);}
   for(let k=0;k<64;k++){const y=H*(1-Math.pow(u(k+5000),1.6)),x=u(k+6000)*W,w=10+18*u(k+7000),h=w*(.38+.12*u(k+8000));
    for(const dx of [0,-W,W]){g.fillStyle='#16130f';g.beginPath();g.ellipse(x+dx,y,w,h,0,0,TAU);g.fill();g.fillStyle='#3a342c';g.beginPath();g.ellipse(x+dx,y,w*.55,h*.5,0,0,TAU);g.fill();
     g.strokeStyle='rgba(90,84,72,.6)';g.lineWidth=2;g.beginPath();g.ellipse(x+dx,y,w*1.25,h*1.5,0,0,TAU);g.stroke();}}});
 BIO.bucket('watcherbark',BIO.barkMat(eyes),{label:'Watcher bark (eye scars)',uvScale:[3.2,6.4]});
 BIO.def('watcherclump',BIO.geo.clump(),M.leaf[1],{attrs:['aN'],label:'Watcher foliage',kind:'watcher'});
 // THE HAND-FLOWER TREE: felted grey-green crowns, and the flower: five red claws from a cup, curled up (a hand held palm up)
 BIO.def('handclump',BIO.geo.clump(),M.leaf[0],{attrs:['aN'],label:'Hand-flower tree foliage (felted)',kind:'handflower'});
 BIO.def('handflower',G.geo(a=>{const red=lin(0xb01a14),dark=lin(0x5a0a0a),cup=lin(0x6a5a3a);G.rev(a,[[.02,0],[.16,.12],[.2,.2]],8,()=>cup);
   for(let f=0;f<5;f++){const az=f/5*TAU,c=Math.cos(az),s=Math.sin(az),rows=[];for(let i=0;i<=5;i++){const t=i/5,r=.18+.62*Math.sin(t*1.25),y=.2+.6*t-.32*t*t*t,w=.06*(1-.7*t);
     rows.push([a.v([c*r-s*w,y,s*r+c*w],t>.8?dark:red),a.v([c*r+s*w,y,s*r-c*w],t>.8?dark:red)]);}
    for(let i=0;i<5;i++){a.f(rows[i][0],rows[i+1][0],rows[i+1][1]);a.f(rows[i][0],rows[i+1][1],rows[i][1]);}}}),G.vmat('handflower',{swayW:'(position.y)',swayA:.04}),{label:'Hand-flowers (five red claws, palm up)',kind:'handflower',onLeaf:true});
 // THE BLOODWOOD: dark bark with blood-red runs from every wound (a canvas until bark.bloodwood comes), a flat savannah-edge crown
 const blood=G.barkCanvas('bloodwood',256,512,(g,W,H,u)=>{g.fillStyle='#3a2e26';g.fillRect(0,0,W,H);
   for(let k=0;k<1400;k++){g.fillStyle=k%3?'rgba(26,20,16,.45)':'rgba(90,74,60,.35)';g.fillRect(u(k)*W,u(k+1400)*H,1+u(k+2800)*3,4+u(k+4200)*20);}
   for(let k=0;k<26;k++){const x=u(k+6000)*W,y=u(k+6100)*H,len=40+160*u(k+6200);for(const dx of [0,-W,W]){g.fillStyle='rgba(120,10,12,.9)';g.beginPath();g.ellipse(x+dx,y,5+5*u(k+6300),4,0,0,TAU);g.fill();
     g.strokeStyle='rgba(110,8,10,.85)';g.lineWidth=2+3*u(k+6400);g.beginPath();g.moveTo(x+dx,y);g.bezierCurveTo(x+dx+4,y+len*.3,x+dx-4,y+len*.7,x+dx+2,y+len);g.stroke();}}});
 BIO.bucket('bloodbark',BIO.barkMat(blood),{label:'Bloodwood bark (sap runs)',uvScale:[3,6]});
 BIO.def('bloodclump',BIO.geo.clump(),M.leaf[4],{attrs:['aN'],label:'Bloodwood foliage',kind:'bloodwood'});
 // THE SKULL-POD: a fist-sized dry pod with two dark sockets, a nose slit and a jaw line (radius .5, origin at its stalk on top)
 BIO.def('skullpods',G.geo(a=>{const bone=lin(0xd8ccae),dk=lin(0x1a140e),pr=[];for(let i=0;i<=6;i++){const t=i/6,y=-t;pr.push([.5*Math.sin(Math.PI*Math.min(1,t*1.05+.02))*(t>.7?.8:1),y]);}
   G.rev(a,pr,10,(i,s)=>{const face=s>=1&&s<=3;return face&&(i===2||i===3)&&s!==2?dk:face&&i===4&&s===2?dk:face&&i===5?sc3(bone,.6):bone;});}),G.vmat('skullpods',{swayW:'(-position.y)',swayA:.3}),
  {label:'Skull-pods (dry seed pods like small skulls)',kind:'skullpod',onLeaf:true});
 // THE GHOST PIPE: a waxy white stem bowed over (BIO.fung.stalk) and its nodding head (BIO.fung.pod, hung)
 if(BIO.fung){BIO.def('ghoststem',BIO.fung.stalk({r0:.07,r1:.05,bend:.32,seg:6,rings:5}),G.smat(),{label:'Ghost pipe (waxy white, no green)',kind:'ghostpipe'});
  BIO.def('ghosthead',BIO.fung.pod({tip:.4,h:1.4,seg:8,rings:5,hang:true}),G.vmat('ghosthead',{swayW:'(-position.y)',swayA:.05}),{label:'Ghost pipe heads',kind:'ghostpipe',onLeaf:true});
  // DEVIL'S FINGERS: a pale egg and red fingers curling back out of it
  BIO.def('devilegg',BIO.fung.bladder({swell:.8,neck:.5,h:1,pleats:0,seg:10,rings:5}),G.smat(),{label:'Devil\'s fingers (the egg)',kind:'devilsfingers'});
  BIO.def('devilfinger',BIO.fung.stalk({r0:.1,r1:.03,bend:.75,ribs:5,ribA:.2,seg:6,rings:6}),G.vmat('devilfinger',{swayA:.01}),{label:'Devil\'s fingers (red, curling back)',kind:'devilsfingers'});}
 return D;});
// ---------------------------------------------------------------- the howl bamboo: one grove (BIO.bamboo.grove), its culms, sprays and shoots
// o: {seed, at [x,y,z], ground, clear, weight, r, year (the flowering's), lv (2 near, 1 mid, 0 far), near (the tiers' ranges: BIO.bamboo.LOD)}
// -> {culms, holed, sprays, shoots, state}. Old culms holed by share .7 (they howl), the rest plain; nodes unaligned (outside the warp)
L.grove=inKit(function(o){L.def();const B=BIO.bamboo;if(!B)return null;
 const g=B.grove({seed:o.seed>>>0,at:o.at,ground:o.ground,clear:o.clear,weight:o.weight,rr:o.rr||[24,46],Lr:[2.2,2.9],dia:[.45,.7],old:.35,holed:.7,
  tiers:[[.55,28],[.25,24],[0,20]],align:false,variants:L.VAR,lean:.045,cohort:(o.cohort==null?0:o.cohort),flowerSeed:0x4b,cycle:48,shoot:.5});
 const fl=B.flowering(g.flower,(o.year==null?0:o.year)),out={culms:0,holed:0,sprays:0,shoots:0,state:fl.state,grove:g};
 const dead=fl.dead>0,col=c=>dead?[0xc8b890,0xb8a880,0xd0c098][c.v%3]:[0x8a9a5a,0x7a8a4a,0x9aa868,0x6a7a40][(c.i+c.v)%4];
 const hs=fl.height,lv=o.lv==null?2:o.lv;if(hs<.05)return out;
 g.culms.forEach(c=>{if(hs<1){c.s=[c.s[0],c.s[1]*hs,c.s[2]];}
  const nm=lv>=2?'howl'+c.n+(c.holed?'h':'_')+c.v:lv===1?'howlm'+c.n:'howlf'+c.n;
  BIO.bamboo.put(nm,[c],col(c));out.culms++;if(c.holed)out.holed++;
  if(fl.leaf>.05&&lv>=1){const S=B.sprays({culm:c,from:.5,size:[3,4.2],lod:[[lv>=2?1:2,lv>=2?1:1.3,0,1e9]]});
   S.forEach(r=>{r.s=[r.s[0]*fl.leaf,r.s[1]*fl.leaf,r.s[2]*fl.leaf];if(hs<1)r.p=[r.p[0],c.y+(r.p[1]-c.y)*hs,r.p[2]];});out.sprays+=B.put(r=>'howlleaf'+r.v,S,dead?0xb8a070:[0x9ab060,0x8aa050,0xaab868][c.v%3]);}});
 if(lv>=2&&!dead)out.shoots=B.put('howlshoot',g.shoots,0x8a7a4a);
 return out;});
// ---------------------------------------------------------------- the bone giant: a hypertree killed standing
// make(x, y, z, seed, sp): sp the kit species it was (its form: the baobab short and fat, the mahogany tallest); grow(T, lv): a white
// bole flared into its old buttresses, the crown reduced to 2-6 broken limbs, snags, and widow's hair hung from the limbs
L.bonegiant={make(x,y,z,seed,sp){const T={key:'bonegiant',x,z,y0:y-1,seed:seed>>>0,sp:sp==null?Math.floor(U(HS(seed>>>0,1,0,0x571))*6):sp};
  const S=HYPERJUNGLE.SPECIES[T.sp];T.H=Math.min(300,Math.max(150,(S.H[0]+(S.H[1]-S.H[0])*uOf(T,2))*(.85+.15*uOf(T,3))));T.rb=(S.rb[0]+(S.rb[1]-S.rb[0])*uOf(T,4))*.6;T.crownR=T.H*.18;return T;},
 grow:inKit(function(T,lv){L.def();lv=lv==null?2:lv;const col=lin([0xe8e4d8,0xddd8ca,0xf0ece0][T.seed%3]),H=T.H,rb=T.rb;let tris=0;
  const lean=[.03*(uOf(T,5)-.5),.03*(uOf(T,6)-.5)],ax=t=>[T.x+lean[0]*H*t*t,T.y0+H*t,T.z+lean[1]*H*t*t],nb=lv>=2?12:lv===1?7:4,top=.88+.1*uOf(T,7);
  const segs=BIO.tree(T.x,T.z,()=>{const P=[];for(let i=0;i<=nb;i++){const t=i/nb*top,a=ax(t);P.push({x:a[0],y:a[1],z:a[2],r:Math.max(.6,rb*(1-.8*t)*(1+1.2*Math.pow(Math.max(0,1-t/.05),2)))});}
   tris+=BIO.tube('bonewood',P,col,{seg:lv>=2?10:6,rfn:(q,ang)=>q<2?1+.35*Math.max(0,Math.cos(ang*5+T.seed)):1});
   const nL=lv>=2?2+Math.floor(uOf(T,8)*5):lv===1?3:2;
   for(let k=0;k<nL;k++){const t0=.62+.3*uOf(T,20+k),a0=ax(t0),az=uOf(T,30+k)*TAU,el=.1+.7*uOf(T,40+k),Lb=T.crownR*(.35+.65*uOf(T,50+k)),r0=Math.max(.5,rb*(1-.8*t0)*.6);
    const e=[a0[0]+Math.cos(az)*Math.cos(el)*Lb,a0[1]+Math.sin(el)*Lb,a0[2]+Math.sin(az)*Math.cos(el)*Lb],m=[(a0[0]+e[0])/2,(a0[1]+e[1])/2+Lb*.05,(a0[2]+e[2])/2];
    tris+=BIO.tube('bonewood',[{x:a0[0],y:a0[1],z:a0[2],r:r0},{x:m[0],y:m[1],z:m[2],r:r0*.75},{x:e[0],y:e[1],z:e[2],r:r0*.55}],col,{seg:lv>=2?6:4,cap:true});}},{});
  // widow's hair from the limbs' undersides and the bole's top, 10-40 m long
  let hair=0;if(lv>=1){const own=BIO.owner;BIO.owner=[T.x,T.z];try{segs.forEach((s,i)=>{if(s.a[1]<T.y0+H*.5)return;const n=lv>=2?3:1;
    for(let k=0;k<n;k++){const h=HS(T.seed,i,k,0x57b);if(U(h)>.75)continue;const t=.2+.75*U(HS(h,1)),p=[s.a[0]+(s.b[0]-s.a[0])*t,s.a[1]+(s.b[1]-s.a[1])*t-s.r0*.7,s.a[2]+(s.b[2]-s.a[2])*t],len=10+30*U(HS(h,2));
     BIO.put('widowhair',p,qEuler(0,U(HS(h,3))*TAU,0),[3+3*U(HS(h,4)),len,1],[0x9a9a90,0x8a8a82,0xaaa8a0][k%3]);hair++;}});}finally{BIO.owner=own;}}
  T.top=T.y0+H*top;return{tris,hair,segs};})};
// ---------------------------------------------------------------- the north's broadleaves on the shared tree (54: G.tree)
const broad=(key,o)=>({make(x,y,z,seed){const T={key,x,z,y0:y-.4,seed:seed>>>0};T.H=o.H[0]+(o.H[1]-o.H[0])*uOf(T,1);T.rb=T.H*o.rbk*(.85+.3*uOf(T,2));T.crownR=T.H*o.crk*(.8+.4*uOf(T,3));return T;},
 grow:inKit(function(T,lv){L.def();T.lv=lv==null?2:lv;return G.tree(T,Object.assign({lean:[.04*(uOf(T,4)-.5),.04*(uOf(T,5)-.5)]},o.tree(T)));})});
// the watcher: a straight pale pole, a narrow aspen crown of short ascending limbs from halfway up
L.watcher=broad('watcher',{H:[60,90],rbk:.012,crk:.17,tree:T=>({fam:'watcherbark',col0:0xffffff,bole:.86,from:.5,limbs:9,el:[.7,1.05],len:[.55,1],forks:2,flare:.25,
 item:'watcherclump',per:3,size:[5,8],flat:.8,col:(r,i)=>[0x8ab040,0x9ac050,0x7aa038][i%3]})});
// the hand-flower tree: a short bole under a broad dome, felted grey-green, the hands at the twig ends
L.handflower=broad('handflower',{H:[30,50],rbk:.02,crk:.32,tree:T=>({fam:'limb'+0,col0:0x6a5a4a,bole:.45,from:.32,limbs:7,el:[.25,.7],len:[.7,1],droop:.08,forks:2,flare:.4,
 item:'handclump',per:4,size:[5,8],flat:.65,col:(r,i)=>[0x6a7a5a,0x5a6a4a,0x7a8a6a][i%3],flowers:{item:'handflower',per:3,size:[.5,.8],col:(r,i)=>[0xffffff,0xf0d8d0][i%2]}})});
// the bloodwood: a crooked bole, a flat spreading savannah-edge crown
L.bloodwood=broad('bloodwood',{H:[30,45],rbk:.022,crk:.42,tree:T=>({fam:'bloodbark',col0:0xffffff,bole:.5,from:.38,limbs:6,el:[.15,.45],len:[.75,1],droop:.05,forks:2,flare:.3,
 item:'bloodclump',per:4,size:[6,9],flat:.45,col:(r,i)=>[0x3a6a2a,0x4a7a30,0x2e5a24][i%3]})});
// ---------------------------------------------------------------- the floor's four: one instance set each
L.skullpod={make(x,y,z,seed){const T={key:'skullpod',x,z,y0:y,seed:seed>>>0};T.H=2+2*uOf(T,1);return T;},
 grow:inKit(function(T,lv){L.def();const n=lv>=2?5:3,R=T.H*.42;let pods=0;
  for(let k=0;k<n;k++){const a=k/n*TAU+uOf(T,10+k),d=R*.35*uOf(T,20+k),s=R*(.55+.4*uOf(T,30+k)),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d,y=T.y0+T.H*(.35+.4*uOf(T,40+k));
   BIO.put('lobe',[x,y-s*.4,z],qEuler(0,uOf(T,50+k)*TAU,0),[s,s*.8,s],[0x5a5a3a,0x6a6440,0x4a4a32][k%3]);
   if(lv>=1)for(let j=0;j<(lv>=2?7:3);j++){const pa=uOf(T,100+k*9+j)*TAU,pe=.2+1.1*uOf(T,200+k*9+j);
    BIO.put('skullpods',[x+Math.cos(pa)*Math.cos(pe)*s*1.02,y-s*.4+Math.sin(pe)*s*.8+.06,z+Math.sin(pa)*Math.cos(pe)*s*1.02],qEuler(0,pa,0),.12,[0xffffff,0xe8dcc8][j%2]);pods++;}}
  return{pods};})};
L.ghostpipe={make(x,y,z,seed){const T={key:'ghostpipe',x,z,y0:y,seed:seed>>>0};T.n=4+Math.floor(9*uOf(T,1));return T;},
 grow:inKit(function(T){L.def();if(!BIO.defs.ghoststem)return{};for(let k=0;k<T.n;k++){const a=uOf(T,10+k)*TAU,d=.6*uOf(T,20+k),h=1+uOf(T,30+k),yaw=uOf(T,40+k)*TAU;
   const x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;BIO.put('ghoststem',[x,T.y0-.05,z],qEuler(0,yaw,0),[h,h,h],0xf0ece4);
   BIO.put('ghosthead',[x+Math.cos(-yaw)*.32*h,T.y0+h*.96,z+Math.sin(-yaw)*.32*h],qEuler(0,yaw,0),h*.09,0xf4f0e8);}return{};})};
L.devilsfingers={make(x,y,z,seed){const T={key:'devilsfingers',x,z,y0:y,seed:seed>>>0};T.H=1+uOf(T,1);return T;},
 grow:inKit(function(T){L.def();if(!BIO.defs.devilegg)return{};const e=T.H*.22;BIO.put('devilegg',[T.x,T.y0-e*.3,T.z],null,[e,e,e],0xe0d8c8);
  const n=4+Math.floor(3*uOf(T,2));for(let k=0;k<n;k++){const a=k/n*TAU+.3*uOf(T,10+k);BIO.put('devilfinger',[T.x,T.y0+e*.4,T.z],qEuler(0,-a,-.3-.5*uOf(T,20+k)),[T.H,T.H,T.H],[0xc8281e,0xb02018,0xd83a26][k%3]);}return{};})};
L.widowhair={make(x,y,z,seed){return{key:'widowhair',x,z,y0:y,seed:seed>>>0,H:10+30*U(HS(seed>>>0,1))};},
 grow:inKit(function(T){L.def();BIO.put('widowhair',[T.x,T.y0,T.z],qEuler(0,uOf(T,2)*TAU,0),[4,T.H,1],0x9a9a90);return{};})};
L.howlbamboo={make(x,y,z,seed){return{key:'howlbamboo',x,z,y0:y,seed:seed>>>0};},grow:inKit(function(T,lv){return L.grove({seed:T.seed,at:[T.x,T.y0,T.z],ground:BIO.terrainH,lv});})};
L.SPECIES.forEach(S=>{const B=L[S.key];if(B&&B.make&&B.grow)HYPERJUNGLE.builders[S.key]={species:S,make:B.make,grow:B.grow};});
})();
