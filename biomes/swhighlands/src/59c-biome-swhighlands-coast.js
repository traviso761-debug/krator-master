// ================================================================= SW HIGHLANDS — the fan coast's flora (station 5): species, builders, pass, sheet
// The dry east scarp and its fan deltas into the Ring Sea (PLAN.md section 7, station 5; the rain shadow, ~400 mm). STAR-FRUIT CAUDEX
// (refs/06: a squat swollen stem, broad leaves, spiky star fruit) on the ledges; CORAL MELONS (refs/20 A: red coral arms carrying
// green melons on twisting green trunks). The floor: ARROWHEADS (refs/20 C: aloe-like spears, orange flower skirts), FRILL TUBES
// (refs/03: green tube succulents with pink frills), TRUMPET SLUGS (refs/03: an orange trumpet-mouthed plant) and FLAME PODS (refs/19).
// Not yet (PLAN.md section 3): the ember manzanita, read in place from biomes/swlowlands when the station's page carries its fragments.
// The host's fields (station 5's stage owes them): scarp (the dry scarp and its ledges), fan (a fan delta's gravel), wadi (a wadi's
// floor), shore, slope. KRAND by cell.
(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const T3=BIO.host.THREE,SP=SWHI.SPECIES,KEY=SWHI.KEY,PICK=SWHI.PICK,FL=SWHI.FL,QE=FL.QE,curve=FL.curve,reg=FL.reg,B=SWHI.BUILD;
const {lin3,VA,VG,armInto,blobInto,leafInto,lerpC}=SWHI.GB;
const Y=(x,z)=>BIO.terrainH(x,z);
const tag=(o,h)=>Object.assign({},SWHI.TAGS,o,{harvest:Object.assign({wood:'none',edible:[],medicinal:false,notes:''},h||{})});
const PAL=Object.assign(SWHI.PAL,{caudex:[0xb8c088,0xaab47a,0xc4c894],melonTrunk:[0x4a8a3a,0x3e7e34,0x58944a],melonArm:[0xd8401a,0xe0501e,0xc83a16]});
const addSp=o=>{o.station='coast';SP.push(o);KEY[o.key]=SP.length-1;return o;};
const DRY={climate:'temperate',aridity:'semiarid',riparian:'no'};
addSp({key:'starcaudex',name:'Star-fruit caudex',habit:'caudex',H:[1.4,3.4],rb:[.25,.5],crownR:[.9,1.8],tags:tag(DRY,{edible:['star fruit (peeled)'],notes:'a squat swollen water-storing stem on the scarp\'s ledges'})});
addSp({key:'coralmelon',name:'Coral melon',habit:'melon',H:[1.6,3.2],rb:[.14,.26],crownR:[1,1.8],tags:tag(DRY,{edible:['melons'],notes:'red coral arms carrying green melons'})});
SWHI.PLANTS.push(
 {label:'Star fruit',name:'Star fruit (the star-fruit caudex)',tags:SP[KEY.starcaudex].tags},
 {label:'Caudex leaves',name:'Caudex leaves (the star-fruit caudex)',tags:SP[KEY.starcaudex].tags},
 {label:'Melons',name:'Melons (the coral melon)',tags:SP[KEY.coralmelon].tags},
 {label:'Arrowheads',name:'Arrowheads',tags:tag(DRY,{notes:'aloe-like spears, yellow-green, with orange flower skirts'})},
 {label:'Frill tubes',name:'Frill tubes',tags:tag(DRY,{notes:'green tube succulents with pink frills'})},
 {label:'Trumpet slug',name:'Trumpet slug',tags:tag(DRY,{notes:'an orange trumpet-mouthed plant on a green rosette'})},
 {label:'Flame pods',name:'Flame pods',tags:tag(DRY,{notes:'orange flame-shaped pods'})});
const M=SWHI.MAT,BK=SWHI.BKMAT,TINT=[0xffffff,0xf4f4f0,0xf8f4ec];
BK.swcaudex=BIO.barkMat(SWHI.TX.flesh);BK.swmelon=BIO.barkMat(SWHI.TX.flesh);
BIO.bucket('swcaudex',BK.swcaudex,{label:'Star-fruit caudex (its stem)',uvScale:[1,1]});
BIO.bucket('swmelon',BK.swmelon,{label:'Coral melon (trunks and arms)',uvScale:[1,1]});
// ---------------------------------------------------------------- geometries
function latheInto(A,base,bend,H,rf,col,seg,rings){for(let i=0;i<rings;i++){const t0=i/rings,t1=(i+1)/rings;
  const ring=t=>{const c=[base[0]+bend[0]*t*t*H,base[1]+t*H,base[2]+bend[1]*t*t*H],r=rf(t);return a=>({p:[c[0]+Math.cos(a)*r,c[1],c[2]+Math.sin(a)*r],n:[Math.cos(a),.2,Math.sin(a)],c:col(a,t)});};
  const R0=ring(t0),R1=ring(t1);for(let s=0;s<seg;s++){const a0=s/seg*TAU,a1=(s+1)/seg*TAU,q=[R0(a0),R0(a1),R1(a1),R1(a0)];
   [0,2,1,0,3,2].forEach(k=>{const Q=q[k];A.pos.push(Q.p[0],Q.p[1],Q.p[2]);A.nor.push(Q.n[0],Q.n[1],Q.n[2]);A.uv.push((s+(k===1||k===2?1:0))/seg,k>1?t1:t0);A.col.push(Q.c[0],Q.c[1],Q.c[2]);});}}}
// a star fruit: a green bumpy ball and eight long pale spines (radius 1 with its spines)
function starGeo(){const A=VA(),Gr=lin3(0x6a8a3a),Sp=lin3(0xd8d890);blobInto(A,[0,0,0],.45,1,1,.12,161,y=>lerpC(lin3(0x4a6a2a),Gr,y));
 for(let k=0;k<8;k++){const a=k/8*TAU,e=(k%2?.5:-.3),d=[Math.cos(a)*Math.cos(e),Math.sin(e),Math.sin(a)*Math.cos(e)];armInto(A,[d[0]*.4,d[1]*.4,d[2]*.4],[d[0],d[1],d[2]],.05,.004,4,Sp);}return VG(A);}
// the caudex's leaf: a broad grey-green blade, one per card (1 long)
function caudLeafGeo(){const A=VA();leafInto(A,0,1,.22,.25,lin3(0x5a7050),lin3(0x8a9a78));return VG(A);}
// a melon: a ribbed green ball, a pale crown (radius 1)
function melonGeo(){const A=VA();latheInto(A,[0,-1,0],[0,0],2,t=>Math.sin(Math.PI*Math.max(.03,Math.min(.97,t))),(a,t)=>Math.abs(Math.cos(a*5))>.92?lin3(0x4a7a2a):lerpC(lin3(0x8ac040),lin3(0xa8d060),t),12,8);
 armInto(A,[0,.95,0],[0,1.15,0],.12,.06,5,lin3(0xe0c860));return VG(A);}
// a rosette of brown dry leaves, flat (radius 1): the coral melon's foot
function rosetteGeo(){const A=VA();for(let k=0;k<9;k++)leafInto(A,k/9*TAU,1,.22,.18,lin3(0x6a3a20),lin3(0xc07a3a));return VG(A);}
// arrowheads: a rosette of spiny aloe leaves over pale bulbs, tall stalks each with a yellow-green spear and an orange skirt (1.4 tall)
function arrowGeo(){const A=VA(),Lg=lin3(0x6a9a4a),Lp=lin3(0xa8b070),Gs=lin3(0x7a9a4a),Yl=lin3(0xe8c030),Or=lin3(0xe8782a);
 for(let k=0;k<6;k++)blobInto(A,[Math.cos(k)*.12,.04,Math.sin(k)*.12],.07,1.2,0,.1,162,()=>lin3(0xd8c8a0));
 for(let k=0;k<10;k++)leafInto(A,k/10*TAU,.35,.05,.25,Lg,Lp);
 for(let k=0;k<6;k++){const a=k/6*TAU+.3,r=.18+.1*(k%2),h=.9+.4*((k*7)%5)/4,b=[Math.cos(a)*.05,.1,Math.sin(a)*.05],t=[Math.cos(a)*r,h,Math.sin(a)*r];
  armInto(A,b,t,.012,.01,3,Gs);latheInto(A,t,[0,0],.32,u=>.045*Math.sin(Math.PI*Math.min(1,.15+u*.9)),(an,u)=>lerpC(Gs,Yl,u),6,4);
  for(let f=0;f<6;f++){const c=f/6*TAU;armInto(A,[t[0],t[1]+.02,t[2]],[t[0]+Math.cos(c)*.07,t[1]-.08,t[2]+Math.sin(c)*.07],.012,.004,3,Or);}}
 return VG(A);}
// frill tubes: three green tubes, widening a little to a pink frilled rim, pink spiky leaves at the foot (1 tall)
function frillGeo(){const A=VA(),Gn=lin3(0x8aa83a),Yg=lin3(0xc8c860),Pk=lin3(0xe07890);
 for(let k=0;k<7;k++)leafInto(A,k/7*TAU,.28,.06,.06,lin3(0xc06070),Pk);
 [[0,0,1],[.14,.05,.75],[-.12,.08,.6],[.05,-.14,.4]].forEach((f,k)=>{latheInto(A,[f[0],0,f[1]],[f[0]*.4,f[1]*.4],f[2],t=>.08+.03*t,(a,t)=>lerpC(Gn,Yg,t),8,5);
  for(let s=0;s<9;s++){const a=s/9*TAU,p=[f[0]+f[0]*.4+Math.cos(a)*.11,f[2],f[1]+f[1]*.4+Math.sin(a)*.11];armInto(A,p,[p[0]+Math.cos(a)*.08,p[1]+.06,p[2]+Math.sin(a)*.08],.022,.004,3,Pk);}});
 return VG(A);}
// a trumpet slug: an orange column flaring into a mouth, red antennae, on a green rosette (1 tall)
function slugGeo(){const A=VA(),Or=lin3(0xe8902a),Og=lin3(0x8a7a2a),Rd=lin3(0xc8401a);for(let k=0;k<6;k++)leafInto(A,k/6*TAU+.2,.42,.07,.05,lin3(0x2a6a3a),lin3(0x4a9a4a));
 latheInto(A,[0,0,0],[.05,.02],.85,t=>.07+.03*t+.12*Math.pow(Math.max(0,t-.75)/.25,2),(a,t)=>t>.96?lin3(0x6a2a10):lerpC(Og,Or,t),9,8);
 for(let k=0;k<4;k++){const a=k/4*TAU+.6,p=[.04+Math.cos(a)*.18,.85,.02+Math.sin(a)*.18];armInto(A,p,[p[0]+Math.cos(a)*.18,p[1]+.18,p[2]+Math.sin(a)*.18],.012,.005,3,Rd);}return VG(A);}
// flame pods: three orange pods, each a tall flame curving to a point (1 tall)
function flameGeo(){const A=VA(),Or=lin3(0xe8902a),Yl=lin3(0xf0d080);[[0,0,1],[.12,.04,.7],[-.1,.07,.55]].forEach(f=>latheInto(A,[f[0],0,f[1]],[f[0]*1.5+.05,f[1]*1.5],f[2],t=>.11*Math.sin(Math.PI*Math.min(1,.1+t*.95))*(1-.4*t),(a,t)=>lerpC(Or,Yl,t),8,7));
 for(let k=0;k<5;k++)leafInto(A,k/5*TAU,.2,.05,.03,lin3(0x3a5a2a),lin3(0x5a7a3a));return VG(A);}
const G=SWHI.GEO;
Object.assign(G,{starfruit:starGeo(),caudleaf:caudLeafGeo(),melon:melonGeo(),rosette:rosetteGeo(),arrowheads:arrowGeo(),frill:frillGeo(),tslug:slugGeo(),flame:flameGeo()});
BIO.def('starfruit',G.starfruit,M.rimBody,{label:'Star fruit'});
BIO.def('caudleaf',G.caudleaf,M.rimBody,{label:'Caudex leaves'});
BIO.def('melon',G.melon,M.rimBody,{label:'Melons'});
BIO.def('rosette',G.rosette,M.rimBody,{label:'Coral melon'});
BIO.def('arrowheads',G.arrowheads,M.rimBody,{label:'Arrowheads'});
BIO.def('frill',G.frill,M.rimBody,{label:'Frill tubes'});
BIO.def('tslug',G.tslug,M.rimBody,{label:'Trumpet slug'});
BIO.def('flame',G.flame,M.rimBody,{label:'Flame pods'});
// ---------------------------------------------------------------- the builders
// THE STAR-FRUIT CAUDEX: a swollen wrinkled stem, short limbs at its head with broad leaves, star fruit among them
B.caudex=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,P=[],n=full?8:4,th=T.H*.7;
 for(let i=0;i<=n;i++){const t=i/n;P.push({x:T.x,y:T.y0-.2+th*t,z:T.z,r:T.rb*(.7+.6*Math.sin(Math.PI*Math.min(1,.1+t*.7))*(1-.45*t))});}
 st.trunk+=BIO.tube('swcaudex',P,PICK(PAL.caudex,s.next()),{seg:full?10:6,rfn:(q,a)=>1+.06*Math.sin(a*7+q*1.7)});
 const top=P[n],nl=full?s.int(4,6):3;for(let k=0;k<nl;k++){const a=k/nl*TAU+s.range(-.3,.3),L=T.crownR*s.range(.4,.7),e=[top.x+Math.cos(a)*L,top.y+T.H*s.range(.12,.28),top.z+Math.sin(a)*L];
  st.limb+=BIO.tube('swcaudex',curve([top.x,top.y,top.z],[(top.x+e[0])/2,e[1],(top.z+e[2])/2],e,2,top.r*.4,T.rb*.12),PICK(PAL.caudex,s.next()),{seg:5});
  for(let j=0;j<(full?3:2);j++){const b=a+s.range(-1,1),l=T.crownR*s.range(.5,.8);BIO.put('caudleaf',e,QE(0,-b,s.range(-.2,.1)),[l,l,l],PICK(TINT,s.next()),{label:'Caudex leaves'});}
  if(s.next()<.8){const f=T.crownR*s.range(.16,.24);BIO.put('starfruit',[e[0],e[1]-f*.6,e[2]],QE(s.range(0,1),s.range(0,TAU),0),f,PICK(TINT,s.next()),{label:'Star fruit'});st.caps++;}}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.crownR*.7,h:T.H});};
// THE CORAL MELON: a rosette of dry leaves, two to four green trunks twisting up, red coral arms forking from their heads, melons among them
B.melon=function(T,st,lv,s){const S=SP[T.sp],full=lv===2;BIO.put('rosette',[T.x,T.y0+.15,T.z],QE(0,s.range(0,TAU),0),[T.crownR*.7,T.crownR*.5,T.crownR*.7],PICK(TINT,s.next()),{label:'Coral melon'});
 const nt=full?s.int(2,4):2;for(let k=0;k<nt;k++){const a=k/nt*TAU+s.range(-.3,.3),o=T.rb*1.2,b=[T.x+Math.cos(a)*o,T.y0,T.z+Math.sin(a)*o],h=T.H*s.range(.5,.65),t=[b[0]+Math.cos(a)*T.crownR*.25,T.y0+h,b[2]+Math.sin(a)*T.crownR*.25];
  st.trunk+=BIO.tube('swmelon',curve(b,[b[0]-Math.cos(a)*o,T.y0+h*.5,b[2]-Math.sin(a)*o],t,full?5:3,T.rb*1.3,T.rb*.7),PICK(PAL.melonTrunk,s.next()),{seg:full?7:5});
  const na=full?s.int(4,6):3;for(let j=0;j<na;j++){const c=s.range(0,TAU),L=T.crownR*s.range(.35,.6),e=[t[0]+Math.cos(c)*L,t[1]+T.H*s.range(.15,.35),t[2]+Math.sin(c)*L];
   st.limb+=BIO.tube('swmelon',curve(t,[(t[0]+e[0])/2,e[1]-.1,(t[2]+e[2])/2],e,2,T.rb*.4,T.rb*.15),PICK(PAL.melonArm,s.next()),{seg:4});
   if(full)for(let m=0;m<2;m++){const d=c+(m?.6:-.6),f=[e[0]+Math.cos(d)*L*.35,e[1]+L*.3,e[2]+Math.sin(d)*L*.35];st.limb+=BIO.tube('swmelon',curve(e,[(e[0]+f[0])/2,f[1]-.05,(e[2]+f[2])/2],f,2,T.rb*.15,.012),PICK(PAL.melonArm,s.next()),{seg:3});}}
  const nm=full?s.int(1,3):1;for(let j=0;j<nm;j++){const c=s.range(0,TAU),r=T.crownR*s.range(.15,.24),p=[t[0]+Math.cos(c)*r*1.4,t[1]+r*s.range(.4,1.4),t[2]+Math.sin(c)*r*1.4];BIO.put('melon',p,QE(0,s.range(0,TAU),0),r,PICK(TINT,s.next()),{label:'Melons'});st.caps++;}}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.crownR*.7,h:T.H});};
// ---------------------------------------------------------------- the floor's puts
const one=(item,label,lo,hi,tilt)=>(x,y,z,s)=>{const h=s.range(lo,hi);BIO.put(item,[x,y-.04,z],QE(s.range(-tilt,tilt),s.range(0,TAU),s.range(-tilt,tilt)),[h,h*s.range(.85,1.15),h],PICK(TINT,s.next()),{label});return 1;};
const clump=(item,label,lo,hi,n0,n1,R)=>(x,y,z,s)=>{const n=s.int(n0,n1);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(0,R),h=s.range(lo,hi),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d;
 BIO.put(item,[px,Y(px,pz)-.04,pz],QE(s.range(-.08,.08),s.range(0,TAU),s.range(-.08,.08)),[h,h,h],PICK(TINT,s.next()),{label});}return n;};
const FLOOR=SWHI.FLOOR_COAST={arrow:one('arrowheads','Arrowheads',.7,1.3,.06),frill:clump('frill','Frill tubes',.5,1.1,1,3,1),slug:one('tslug','Trumpet slug',.6,1.2,.1),flame:clump('flame','Flame pods',.4,.9,1,4,.9)};
// ---------------------------------------------------------------- the pass (station 5)
SWHI.coastZones=function(x,z){const f=n=>BIO.field(n,x,z),scarp=f('scarp'),fan=f('fan'),wadi=f('wadi'),shore=f('shore'),slope=f('slope'),open=smooth(1.15,.7,slope);
 return{scarp,fan,wadi,shore,open,caudex:scarp*open*(.4+.6*smooth(.3,.8,slope)),melon:(fan*.6+wadi*.5)*open*(1-shore),arrow:(scarp*.5+fan*.5)*open*(1-shore),frill:(fan*.4+wadi*.6)*open,slug:(wadi*.5+scarp*.2)*open,flame:(scarp*.35+fan*.3)*open*(1-shore)};};
SWHI.buildCoast=function(box,q){q=q==null?1:q;const st={trunk:0,limb:0,caps:0,heroes:0,light:0,far:0},TREES=SWHI.TREES;TREES.length=0;const HOLD=KSPACE.create({cell:8}),k=Math.sqrt(1/q);
 const clearOf=(x,z,r)=>!HOLD.some(x,z,r,o=>Math.hypot(o.x-x,o.z-z)<o.r+r),hold=(x,z,r)=>HOLD.insert({x,z,r},x,z,r);
 SWHI.cells(9*k,1001,box,(x,z)=>SWHI.coastZones(x,z).caudex*.5,(x,y,z,sd)=>{if(!clearOf(x,z,1.2))return false;const T=FL.mk(x,y,z,KEY.starcaudex,sd,FL.lvOf);TREES.push(T);hold(x,z,T.crownR*.6);return true;});
 SWHI.cells(10*k,1002,box,(x,z)=>SWHI.coastZones(x,z).melon*.45,(x,y,z,sd)=>{if(!clearOf(x,z,1.5))return false;const T=FL.mk(x,y,z,KEY.coralmelon,sd,FL.lvOf);TREES.push(T);hold(x,z,T.crownR*.6);return true;});
 FL.draw(TREES,st,'coast','impCoast');
 const pass=(item,cell,salt,R,accept)=>{BIO.range=R;BIO.minRange=0;SWHI.cells(cell*k,salt,box,(x,z)=>BIO.lodD(x,z)<R?accept(SWHI.coastZones(x,z)):0,(x,y,z,sd)=>{if(!clearOf(x,z,.4))return false;st[item]=(st[item]||0)+FLOOR[item](x,y,z,KRAND.stream(sd));return true;});};
 const L=SWHI.LOD.floor;pass('arrow',5,1003,L,Z=>Z.arrow*.35);pass('frill',5,1004,L,Z=>Z.frill*.3);pass('slug',7,1005,L,Z=>Z.slug*.3);pass('flame',6,1006,L,Z=>Z.flame*.3);
 BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,light:st.light,bySpecies:['starcaudex','coralmelon'].map(k2=>k2+':'+TREES.filter(T=>T.sp===KEY[k2]).length).join(' '),floor:{arrow:st.arrow||0,frill:st.frill||0,slug:st.slug||0,flame:st.flame||0}};};
// ---------------------------------------------------------------- the preview sheet
SWHI.SHEETS.coast=(x0,z0,a)=>FL.lay(x0,z0,a,{gap:6,bedGap:8,salt:5,
 trees:[['starcaudex',1],['starcaudex',2],['starcaudex',3],['coralmelon',1],['coralmelon',2],['coralmelon',3]],
 beds:[['arrowheads',FLOOR.arrow,6,3],['frill tubes',FLOOR.frill,6,3],['trumpet slugs',FLOOR.slug,6,3],['flame pods',FLOOR.flame,6,3]]});
})();
