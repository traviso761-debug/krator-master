// ================================================================= EASTERN DESERT, THE STEPPE FRINGE — its flora (PLAN-STEPPE.md section 3)
// THE STEPPE FORMS of the kit's Socotran species (a habit, SEDESERT.STEPPE, applied by each pass's size hook as the Bowl's dense-air
// one): the dragon tree low and many-stemmed (Dracaena ombet of the Horn of Africa: its own builder here), the frankincense
// many-stemmed from the ground (Boswellia sacra of the Dhofar steppe), the desert rose small in the grass, the bottle trees on the
// kopjes, the candelabras and cardons sparse at the desert's edge.
// NEW: the UMBRELLA THORN (Vachellia tortilis: a flat crown on a short forked trunk) and MYRRH (Commiphora: many thin peeling stems,
// small grey-green leaves; the resin a trade good).
// THE RARE THREE (the owner, 2026-10-26), each in a Krator form: OLD TWOLEAF (Welwitschia: two strap leaves that never stop growing,
// torn to ribbons over the centuries, lying round a woody crown), the ROCK FIG (Dorstenia gigas: a swollen grey caudex clinging to
// a granite face, stubby branches, leaf rosettes), PEBBLE PLANTS (living stones: split pebble pairs mottled to match the gravel,
// flowering yellow and white after the rain).
// THE ALIEN THREE (Krator's own): SUN-DIALS (discs on stalks that turn to face the sun through the day and fold at night: driven
// by the sky's sun, BIO.SUN), WHISTLE REEDS (hollow, ringed, glassy silica tubes that pipe in the wind), DRIFT LANTERNS (ribbed
// papery seed-globes; ripe ones break off and roll across the steppe on the wind).
// The trees push onto SEDESERT.SPECIES and draw with the kit's tools (55: SEDESERT.TOOLS); the small plants are kit functions the
// steppe's floor (67) calls; the passes replace the others.
(function(){const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick,qEuler}=BIO.fn;
const T3=BIO.host.THREE,C=SEDESERT.C,{bright,vary,leafCol}=SEDESERT,TL=SEDESERT.TOOLS,TX=SEDESERT.TEX,G=SEDESERT.G;
const F=(n,x,z)=>BIO.field(n,x,z);
const SP=SEDESERT.SPECIES,sp=k=>SP.indexOf(SEDESERT.byKey[k]);
// ---------------------------------------------------------------- the steppe habit
SEDESERT.STEPPE={dragon:{H:.55,rb:.75,crownR:.8},rose:{H:.7,rb:.6,crownR:.8},bottle:{H:.8,rb:.85,crownR:.9},candelabra:{H:.72,rb:.85,crownR:.85},
 cardon:{H:.72,rb:.85,crownR:.85},incense:{H:.75,rb:.7,crownR:1},mesquite:{H:.8,rb:.9,crownR:1.1}};
['dragon','rose','bottle','candelabra','cardon','incense','mesquite'].forEach(k=>{const S=SEDESERT.byKey[k];if(S)S.tags=Object.assign({},S.tags,{abyssal:false,habit:'steppe form (the steppe fringe, ~330 mm)'});});
const steppe=T=>{const A=SEDESERT.STEPPE[SP[T.sp].key];if(!A)return;T.H*=A.H;T.rb*=A.rb;T.crownR*=A.crownR;};
// the steppe's dragon tree: Dracaena ombet, forking low into many stems (it replaces the kit's builder on this page)
TL.B[sp('dragon')]=function(T,st,lv){TL.forkTree(T,st,lv,{fam:'bark0',item:'strap',boleU:.14,el0:.82,spread:.42,rise:.16,curve:.06,wig:.05,tuftK:.34,flat:.62,nC:2,nTop:ri(5,8),fill:.35,flute:.04});};
// the steppe's frankincense: many stems from the ground (Boswellia sacra)
TL.B[sp('incense')]=function(T,st,lv){TL.forkTree(T,st,lv,{fam:'bark2',item:'feather',boleU:.06,el0:.95,spread:.55,rise:.1,curve:.12,wig:.14,tuftK:.38,flat:.72,nC:2,nTop:ri(4,6),lean:.06,flute:.06,bloom:.2,bloomCol:[0xd85a6a,0xe87080]});};
// ---------------------------------------------------------------- the new trees
const HV=(wood,edible,medicinal,notes)=>({wood,edible:edible||[],medicinal:!!medicinal,notes:notes||'',fruit:null});
const tag=(aridity,riparian,hv)=>({climate:'tropic',aridity,abyssal:false,habit:'the steppe fringe',riparian,harvest:hv});
const NEW=[
 {key:'thorn',name:'Umbrella thorn',H:[5,9],rb:[.25,.45],crownR:[4,7],barkK:3,bark:[0x5a4a3c,0x4e4034,0x66564a],leaf:[0x6a7a3a,0x76863e,0x5e6e34],forks:4,forkLen:[.42,.3,.22,.16],
  far:{poleU:.6,blobs:[[.88,1.0,.12,'L0','L2']]},tags:tag('semiarid','both',HV('fuel, posts, fencing (the thorns)',['pods (fodder)'],true,'Vachellia tortilis: the browse of the steppe; the gum a sweet and a glue; the bark a tan.'))},
 {key:'myrrh',name:'Myrrh',H:[2.5,4.5],rb:[.12,.25],crownR:[1.8,3],barkK:2,bark:[0xa8a094,0x9c9488,0xb4ac9e],leaf:[0x7a8a6a,0x86967a,0x6e7e60],forks:4,forkLen:[.38,.3,.24,.2],
  far:{poleU:.4,blobs:[[.75,.85,.25,'L0','L2']]},tags:tag('arid','no',HV('none (thorny)',[],true,'Commiphora: the resin bled from the peeling bark is myrrh, the merchant houses\' second trade; a wound wash and an incense.'))},
];
NEW.forEach(S=>{SP.push(S);SEDESERT.byKey[S.key]=S;});
TL.B[sp('thorn')]=function(T,st,lv){TL.forkTree(T,st,lv,{fam:'bark3',item:'feather',boleU:.34,el0:.68,spread:.78,rise:.0,curve:.02,wig:.06,tuftK:.36,flat:.3,nC:3,nTop:ri(2,3),fill:.9,flute:.03,lean:.05});};
TL.B[sp('myrrh')]=function(T,st,lv){TL.forkTree(T,st,lv,{fam:'bark2',item:'small',boleU:.04,el0:.92,spread:.7,rise:.06,curve:.1,wig:.16,tuftK:.32,flat:.7,nC:1,nTop:ri(5,8),flute:.03});};
// ---------------------------------------------------------------- materials and items of the small plants and the aliens
const MS={
 bunch:BIO.leafMat(TX.grass,'steppe-bunch',{swayW:'(position.y)',swayA:.14,alphaTest:.4}),
 stipa:BIO.leafMat(TX.grass,'steppe-stipa',{swayW:'(position.y)',swayA:.18,alphaTest:.4}),
 vcol:BIO.leafMat(null,'steppe-vcol',{swayW:'0.0',swayA:0,alphaTest:0,vertexColors:true}),
 fairy:BIO.leafMat(BIO.alphaTex(128,(g,S)=>{for(let i=0;i<900;i++){const a=rr(0,TAU),r=S*.5*Math.sqrt(rng());if(r>S*(.42+.06*Math.sin(a*5)))continue;
  g.fillStyle=BIO.tex.grey(lerp(170,235,rng()));g.beginPath();g.arc(S/2+Math.cos(a)*r,S/2+Math.sin(a)*r,rr(2,5),0,TAU);g.fill();}},[200,200,200]),'steppe-fairy',{swayW:'0.0',swayA:0,alphaTest:.35}),
};
MS.fairy.polygonOffset=true;MS.fairy.polygonOffsetFactor=-2;MS.fairy.polygonOffsetUnits=-2;
SEDESERT.STEPPE_LIB=BIO.libSwap('steppe',MS);
// a twoleaf ribbon: a strap 1 long, 1 wide at its root, lying on the ground and curling, torn at the tip; green to brown, vertex-coloured
function ribbonGeo(){const pos=[],nor=[],uv=[],col=[],n=10,c0=new T3.Color(0x6a7650).convertSRGBToLinear(),c1=new T3.Color(0x9a845a).convertSRGBToLinear(),c2=new T3.Color(0x5a4636).convertSRGBToLinear();
 /* low over the gravel, a slight rise off the crown, the tip curling up and over, frayed */
 const P=t=>[t,.06*Math.sin(Math.min(1,t*2.2)*Math.PI)+.05*smooth(.8,1,t),.14*Math.sin(t*4.5)*t],W=t=>.5*(1-.4*t);
 for(let i=0;i<n;i++){const t0=i/n,t1=(i+1)/n,a=P(t0),b=P(t1),w0=W(t0),w1=W(t1),ca=c0.clone().lerp(t0<.7?c1:c2,smooth(.35,1,t0)),cb=c0.clone().lerp(t1<.7?c1:c2,smooth(.35,1,t1));
  const q=[[a[0],a[1],a[2]-w0],[a[0],a[1],a[2]+w0],[b[0],b[1],b[2]+w1],[b[0],b[1],b[2]-w1]];
  [[0,1,2,ca,ca,cb],[0,2,3,ca,cb,cb]].forEach(([i0,i1,i2,k0,k1,k2])=>{[[q[i0],k0],[q[i1],k1],[q[i2],k2]].forEach(([p,k])=>{pos.push(p[0],p[1],p[2]);nor.push(0,1,0);uv.push(0,0);col.push(k.r,k.g,k.b);});});}
 return BIO.geo._make(pos,nor,uv,col);}
// a sun-dial's disc: a shallow dish facing +z (its face), gold rays round a dark eye, the back dull green
function dialGeo(){const pos=[],nor=[],uv=[],col=[],n=16,cE=new T3.Color(0x3a2a1a).convertSRGBToLinear(),cR=new T3.Color(0xe8b830).convertSRGBToLinear(),cO=new T3.Color(0xf0d060).convertSRGBToLinear(),cB=new T3.Color(0x5a6a3a).convertSRGBToLinear();
 const push=(p,nn,c)=>{pos.push(p[0],p[1],p[2]);nor.push(nn[0],nn[1],nn[2]);uv.push(0,0);col.push(c.r,c.g,c.b);};
 for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU,R=1,r=.22,ray=i%2?cR:cO;
  const o0=[Math.cos(a0)*R,Math.sin(a0)*R,-.12],o1=[Math.cos(a1)*R,Math.sin(a1)*R,-.12],i0=[Math.cos(a0)*r,Math.sin(a0)*r,0],i1=[Math.cos(a1)*r,Math.sin(a1)*r,0];
  push([0,0,.04],[0,0,1],cE);push(i0,[0,0,1],cE);push(i1,[0,0,1],cE);
  push(i0,[0,0,1],ray);push(o0,[0,0,1],ray);push(o1,[0,0,1],ray);push(i0,[0,0,1],ray);push(o1,[0,0,1],ray);push(i1,[0,0,1],ray);
  push([0,0,-.2],[0,0,-1],cB);push(o1,[0,0,-1],cB);push(o0,[0,0,-1],cB);}
 return BIO.geo._make(pos,nor,uv,col);}
// a whistle reed: an open, ringed tube (the inside shows), pale glassy blue-white banded darker at its nodes
function reedGeo(){const pos=[],nor=[],uv=[],col=[],seg=7,rows=8,cP=new T3.Color(0xd8e8ec).convertSRGBToLinear(),cN=new T3.Color(0x7aa0b0).convertSRGBToLinear(),cI=new T3.Color(0x3a5a6a).convertSRGBToLinear();
 for(let j=0;j<rows;j++)for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,y0=j/rows,y1=(j+1)/rows,r0=.5*(1-.25*y0),r1=.5*(1-.25*y1),node=k=>Math.abs(k*rows-Math.round(k*rows))<.02;
  const P=(a,y,r)=>[Math.cos(a)*r,y,Math.sin(a)*r],N=a=>[Math.cos(a),0,Math.sin(a)],c=y=>(Math.round(y*rows)%2===0&&y>0)?cN:cP;
  const quad=(flip,cc)=>{const A=[P(a0,y0,r0),N(a0),c(y0)],B=[P(a1,y0,r0),N(a1),c(y0)],Cc=[P(a1,y1,r1),N(a1),c(y1)],D=[P(a0,y1,r1),N(a0),c(y1)];
   const tri=flip?[A,Cc,B,A,D,Cc]:[A,B,Cc,A,Cc,D];tri.forEach(([p,nn,k])=>{pos.push(p[0],p[1],p[2]);nor.push(flip?-nn[0]:nn[0],0,flip?-nn[2]:nn[2]);uv.push(0,0);const kk=cc||k;col.push(kk.r,kk.g,kk.b);});};
  quad(false);quad(true,cI);}
 return BIO.geo._make(pos,nor,uv,col);}
// a drift lantern: a ribbed papery globe (eight ribs, lighter panes between), unit radius
function lanternGeo(){const pos=[],nor=[],uv=[],col=[],m=6,n=5,cP=new T3.Color(0xe8d4b0).convertSRGBToLinear(),cR=new T3.Color(0x9a6a4a).convertSRGBToLinear(),cT=new T3.Color(0xd8a080).convertSRGBToLinear();
 const P=(a,e)=>{const r=Math.sin(e)*(1+.12*Math.cos(a*m)),y=-Math.cos(e);return[Math.cos(a)*r,y,Math.sin(a)*r];};
 for(let i=0;i<m*2;i++)for(let j=0;j<n;j++){const a0=i/(m*2)*TAU,a1=(i+1)/(m*2)*TAU,e0=j/n*Math.PI,e1=(j+1)/n*Math.PI,rib=i%2===0?cR:(j<2||j>n-3?cT:cP);
  const A=P(a0,e0),B=P(a1,e0),Cc=P(a1,e1),D=P(a0,e1);[A,B,Cc,A,Cc,D].forEach(p=>{const l=Math.hypot(p[0],p[1],p[2])||1;pos.push(p[0],p[1],p[2]);nor.push(p[0]/l,p[1]/l,p[2]/l);uv.push(0,0);col.push(rib.r,rib.g,rib.b);});}
 return BIO.geo._make(pos,nor,uv,col);}
BIO.def('bunch',G.tuft(),MS.bunch,{label:'Bunchgrass'});
BIO.def('stipa',G.tuft(),MS.stipa,{label:'Plume grass'});
BIO.def('fairy',BIO.geo.mat(),MS.fairy,{label:'Fairy circle (a bare disc)'});
BIO.def('twoleaf',ribbonGeo(),MS.vcol,{label:'Old twoleaf (its ribbons)'});
BIO.def('whistle',reedGeo(),MS.vcol,{label:'Whistle reed'});
BIO.def('lantern',lanternGeo(),MS.vcol,{label:'Drift lantern'});
const DIAL_GEO=dialGeo(),LANT_GEO=lanternGeo();
Object.assign(SEDESERT.PLANTS,{
 bunch:{name:'Bunchgrass',tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no',harvest:HV('thatch',['seed (ground)'],false,'Aristida and its kin: the steppe\'s grazing in the wet season.')},items:['bunch']},
 stipa:{name:'Plume grass',tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no',harvest:HV('thatch',[],false,'Its plumes silver the steppe after the rains.')},items:['stipa']},
 twoleaf:{name:'Old twoleaf',tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no',harvest:HV('none',[],false,'Welwitschia: two leaves for a thousand years and more; the oldest are landmarks, named and walked to.')},items:['twoleaf']},
 rockfig:{name:'Rock fig',tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no',harvest:HV('none',[],true,'Dorstenia gigas: it clings to bare granite; the sap a salve.')},items:[]},
 pebbles:{name:'Pebble plants',tags:{climate:'tropic',aridity:'arid',abyssal:false,riparian:'no',harvest:HV('none',['water (a famine food)'],false,'Living stones: you see them only when they flower.')},items:[]},
 sundial:{name:'Sun-dial',tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no',harvest:HV('none',['seeds (roasted)'],false,'Krator\'s own: the discs follow the sun all day and fold shut at night; herders tell the hour by them.')},items:['dialdisc']},
 whistle:{name:'Whistle reed',tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'both',harvest:HV('pipes, flutes',[],false,'Krator\'s own: hollow silica tubes; a stand pipes in the evening wind.')},items:['whistle']},
 lantern:{name:'Drift lantern',tags:{climate:'tropic',aridity:'semiarid',abyssal:false,riparian:'no',harvest:HV('tinder (the paper)',[],false,'Krator\'s own: ripe globes break off and roll across the steppe on the wind, sowing as they go.')},items:['lantern','lanternloose']},
});
// ---------------------------------------------------------------- the small plants, as kit functions the floor (67) calls
const tuft=(...a)=>SEDESERT.small.tuft(...a);   /* the floor (60) defines it after this fragment */
SEDESERT.STEPPE_PLANTS={
 bunch(x,y,z,lv,h){const n=lv===2?ri(1,3):1;for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.3,1):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
  tuft('bunch',px,BIO.terrainH(px,pz),pz,h*rr(.8,1.15),h*rr(1,1.4),leafCol([0xb8a464,0xa8985a,0xc4ae6c,0x9a9458,0x8a8a50],1.25,.04));}},
 stipa(x,y,z,lv,h){tuft('stipa',x,y,z,h,h*rr(.9,1.2),leafCol([0xd0c8b0,0xc8bca8,0xdcd4c0],1.2,.03));},
 fairy(x,y,z,r){BIO.put('fairy',[x,y+.03,z],qEuler(0,rr(0,TAU),0),[r*2.1,1,r*2.1],bright(vary(0xc09a74,.02,.06,.05),1));},
 twoleaf(x,y,z,big){const L=big?rr(2.6,4.2):rr(.9,2.2),a0=rr(0,TAU),n=big?ri(9,14):ri(4,7);
  BIO.put('lobe',[x,y-.1,z],qEuler(0,rr(0,TAU),0),[L*.16,L*.07,L*.16],bright(vary(0x5a4434,.02,.06,.05),1));
  for(let s=0;s<2;s++)for(let k=0;k<n;k++){const a=a0+s*Math.PI+(k-(n-1)/2)*rr(.1,.18),l=L*rr(.6,1.1);BIO.put('twoleaf',[x,y+.03+k*.004,z],qEuler(rr(-.04,.04),-a,0),[l,l*.5,L*.3*rr(.5,1)],null);}},
 rockfig(x,y,z,s){const h=s*rr(.9,1.5);BIO.put('lobe',[x,y-.05,z],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[s*.8,h,s*.8],bright(vary(0xb8b0a4,.02,.05,.05),1.05));
  for(let k=0,m=ri(2,4);k<m;k++){const a=rr(0,TAU),e=rr(.6,1.2),L=s*rr(.6,1.1),p0=[x,y+h*.75,z],p1=[x+Math.cos(a)*Math.cos(e)*L,y+h*.75+Math.sin(e)*L,z+Math.sin(a)*Math.cos(e)*L];
   BIO.beam('rod',p0,p1,s*.14,s*.08,bright(vary(0xa8a094,.02,.05,.05),1));BIO.put('small',p1,qEuler(0,rr(0,TAU),0),[s*.7,s*.4,s*.7],leafCol([0x5a7a3a,0x668a40],1.2,.03),{n:[0,1,0]});
   if(rng()<.4)BIO.put('bloom',[p1[0],p1[1]+s*.2,p1[2]],qEuler(-Math.PI/2+rr(-.3,.3),rr(0,TAU),0),s*.25,0xd8a0b0);}},
 pebbles(x,y,z,lv){const n=lv===2?ri(5,16):ri(2,5),cols=[0xb8a088,0xa89078,0xc8b49a,0x9a8a7a,0xb0987e];
  for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.1,.9):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=BIO.terrainH(px,pz),s=rr(.07,.14),c=bright(vary(pick(cols),.02,.08,.08),1),r=rr(0,TAU);
   for(let k=-1;k<=1;k+=2)BIO.put('stone',[px+Math.cos(r)*s*.55*k,py+s*.15,pz+Math.sin(r)*s*.55*k],qEuler(0,r,0),[s*.5,s*.45,s*.85],c);   /* a 20-triangle half */
   if(lv===2&&rng()<.35)BIO.put('bloom',[px,py+s*.55,pz],qEuler(-Math.PI/2,rr(0,TAU),0),s*1.4,rng()<.6?0xf0d040:0xf4f0e0);}},
 whistle(x,y,z,lv){const n=lv===2?ri(10,26):ri(5,9);for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?Math.sqrt(rng())*rr(.6,2.4):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=BIO.terrainH(px,pz),h=rr(1,3.6),r=rr(.06,.13);
  BIO.put('whistle',[px,py-.05,pz],qEuler(rr(-.06,.06),rr(0,TAU),rr(-.06,.06)),[r*2,h,r*2],null);}},
 lantern(x,y,z,lv){const n=lv===2?ri(2,5):1;for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.3,1.2):0,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=BIO.terrainH(px,pz),h=rr(.4,.9),r=rr(.18,.32);
  BIO.beam('rod',[px,py,pz],[px,py+h,pz],.015,.01,0x8a7a5a);BIO.put('lantern',[px,py+h+r*.9,pz],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[r,r*1.08,r],null);}},
};
// ---------------------------------------------------------------- the moving aliens: sun-dials and the loose lanterns
// SEDESERT.steppeMotion(dials, loose, wind): dials [{x,y,z,r,ph}] (each disc on its stalk's top), loose [{x,y,z,r,len,v,ph}] (a lantern rolling down
// the wind along len metres and starting again); drawn as two dynamic meshes, posed on the biome clock (the export bakes them as motion)
SEDESERT.steppeMotion=function(dials,loose,wind){const M4=new T3.Matrix4(),q=new T3.Quaternion(),s=new T3.Vector3(),p=new T3.Vector3(),fwd=new T3.Vector3(0,0,1),dir=new T3.Vector3(),e=new T3.Euler();
 const DM=dials.length?BIO.dynamic('dialdisc',DIAL_GEO,MS.vcol,dials.length,{label:'Sun-dials (each turns to face the sun)'}):null;
 const LM=loose.length?BIO.dynamic('lanternloose',LANT_GEO,MS.vcol,loose.length,{label:'Drift lanterns (loose, rolling on the wind)'}):null;
 let last=-1e9,first=true;const W=wind||[0,1];   /* the host's wind, the way it blows */
 BIO.tick((dt,t)=>{const now=performance.now()/1000;   /* the dials turn on the wall clock, three times a second (a tick may hand no dt) */
  if(DM&&(now-last>.3||first)){last=now;const S=BIO.SUN.value;const up=S?S.y:1,night=smooth(.05,-.08,up);
   dials.forEach((D,i)=>{dir.set(S?S.x:0,S?Math.max(.08,S.y):1,S?S.z:0).normalize();
    /* a little lag and a wobble each, so a drift is not a parade */dir.x+=.12*Math.sin(D.ph);dir.z+=.12*Math.cos(D.ph*1.3);dir.normalize();
    if(night>0)dir.lerp(new T3.Vector3(Math.cos(D.ph),-.6,Math.sin(D.ph)),night).normalize();
    q.setFromUnitVectors(fwd,dir);const k=1-.75*night;s.set(D.r*k,D.r*(.25+.75*(1-night)),D.r);p.set(D.x,D.y,D.z);M4.compose(p,q,s);DM.setMatrixAt(i,M4);});DM.instanceMatrix.needsUpdate=true;}
  if(LM){const tt=t!=null?t:BIO.WIND.t.value;loose.forEach((L,i)=>{const u=(tt*L.v+L.ph)%L.len,f=smooth(0,6,u)*smooth(L.len,L.len-6,u),x=L.x+W[0]*u,z=L.z+W[1]*u,y=BIO.terrainH(x,z)+L.r*(1+.4*Math.abs(Math.sin(u*.9)));
    e.set(u/L.r*W[1],0,-u/L.r*W[0]);q.setFromEuler(e);s.set(L.r*f,L.r*1.08*f,L.r*f);p.set(x,y,z);M4.compose(p,q,s);LM.setMatrixAt(i,M4);});LM.instanceMatrix.needsUpdate=true;}
  first=false;});
 return{dials:DM,loose:LM};};
// ---------------------------------------------------------------- the passes (they replace the others)
const lu=(x,z)=>F('lush',x,z)*(1-F('circles',x,z)*.6),kp=(x,z)=>F('kopje',x,z),wd=(x,z)=>F('wadi',x,z),eg=(x,z)=>F('edge',x,z),pv=(x,z)=>F('pave',x,z);
SEDESERT.PASSES=[
 {sp:sp('thorn'),cell:44,accept:(Z,x,z)=>lu(x,z)*.13+wd(x,z)*.4,opt:{pad:5,patch:.55,patchScale:.004}},
 {sp:sp('dragon'),cell:75,accept:(Z,x,z)=>lu(x,z)*.05*smooth(.45,.65,BIO.fn.fbm(x*.002+3,z*.002,4701,2))+kp(x,z)*.07,opt:{pad:4,patch:.5,size:steppe}},
 {sp:sp('incense'),cell:55,accept:(Z,x,z)=>lu(x,z)*.045+pv(x,z)*.04+kp(x,z)*.05,opt:{pad:3,patch:.5,size:steppe}},
 {sp:sp('myrrh'),cell:34,accept:(Z,x,z)=>lu(x,z)*.07+kp(x,z)*.08+pv(x,z)*.02,opt:{pad:2.5,patch:.5,small:true}},
 {sp:sp('rose'),cell:42,accept:(Z,x,z)=>lu(x,z)*.05+pv(x,z)*.04+kp(x,z)*.06,opt:{pad:2,lodK:.5,patch:.4,small:true,size:steppe}},
 {sp:sp('bottle'),cell:70,accept:(Z,x,z)=>kp(x,z)*.35+lu(x,z)*.006,opt:{pad:6,patch:.4,size:steppe}},
 {sp:sp('candelabra'),cell:100,accept:(Z,x,z)=>eg(x,z)*.18+kp(x,z)*.05,opt:{pad:8,patch:.5,size:steppe}},
 {sp:sp('cardon'),cell:100,accept:(Z,x,z)=>eg(x,z)*.14+pv(x,z)*.02,opt:{pad:7,patch:.5,size:steppe}},
 {sp:sp('mesquite'),cell:40,accept:(Z,x,z)=>wd(x,z)*.3+F('pan',x,z)*.03,opt:{pad:2.5,patch:.5,size:steppe}},
];
})();
