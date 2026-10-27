// ================================================================= SW HIGHLANDS — the rain wall's flora (station 2): species, builders, pass, sheet
// The rain wall and the landslide lake (PLAN.md section 7, station 2; ~2-2.9 km, in cloud). STILT POD TREES (refs/02) straddle the
// fresh scar on stilt roots, a honeycombed spore pod in a cup and a collar of tentacles; SHELF CORAL (refs/07) stacks orange brackets
// on rock-eating roots over the dam's fresh boulders; WEEPING WISPS (refs/08, top left) hang long violet strands from knobbed limbs,
// blue-berry bracts and drop-fruit on their boles (refs/19); a FISHING BRIDGE (refs/13) arches over the outlet seep from two banks,
// its sticky vines hanging into the water. The floor: GLOW TUBES (refs/19, lit orange at the tips, the forest's night lights),
// BEARDED TRIPLETS (refs/20 B) and moss.
// The host's fields (station 2's stage owes them): rain (the rain wall's forest), scar (the landslide's fresh ground), boulder (by a
// fresh boulder), wet, slope; opt.bridges [[x, z, x2, z2], ...] (the host's stream crossings: each a fishing bridge). KRAND by cell.
(function(){const {TAU,clamp,lerp,mix,smooth}=BIO.fn;
const T3=BIO.host.THREE,SP=SWHI.SPECIES,KEY=SWHI.KEY,PICK=SWHI.PICK,FL=SWHI.FL,QE=FL.QE,curve=FL.curve,reg=FL.reg,B=SWHI.BUILD;
const {lin3,VA,VG,armInto,blobInto,leafInto,lerpC}=SWHI.GB;
const Y=(x,z)=>BIO.terrainH(x,z);
const tag=(o,h)=>Object.assign({},SWHI.TAGS,o,{harvest:Object.assign({wood:'none',edible:[],medicinal:false,notes:''},h||{})});
const PAL=Object.assign(SWHI.PAL,{
 stilt:[0x5a7074,0x506468,0x647a7c],stiltTent:[0x5aa08a,0x4e9480,0x68ac94],sepal:[0x6a7276,0x5e666a],
 shelfTrunk:[0xe8c8b0,0xdcb89e,0xf0d4bc],shelf:[0xe8682a,0xf07a34,0xdc5a22,0xf48a40],
 wispBark:[0x4a4250,0x423a48,0x544a5a],wisp:[0x9a7ab8,0x8a6aaa,0xa88ac4],
 fishBark:[0x3a2622,0x44302a,0x30201c],fishCrown:[0xd03048,0xe04058,0xc02840]});
const addSp=o=>{o.station='rainwall';SP.push(o);KEY[o.key]=SP.length-1;return o;};
addSp({key:'stiltpod',name:'Stilt pod tree',habit:'stilt',H:[9,20],rb:[.28,.5],crownR:[3,5],
 tags:tag({riparian:'no'},{notes:'the landslide scars\' pioneer: stilt roots straddling moving debris, a honeycombed green spore pod in a collar of tentacles'})});
addSp({key:'shelfcoral',name:'Shelf coral',habit:'shelf',H:[5,15],rb:[.5,1],crownR:[3,6],
 tags:tag({riparian:'both'},{notes:'stacked orange brackets on rock-eating roots: first onto new rock'})});
addSp({key:'weepingwisp',name:'Weeping wisp',habit:'wisp',H:[11,20],rb:[.9,1.5],crownR:[5,8],
 tags:tag({climate:'cool',aridity:'humid'},{wood:'timber',notes:'long violet strands from the limbs, their nodes faintly lit in the cloud at night'})});
addSp({key:'fishingbridge',name:'Fishing bridge',habit:'fishbridge',H:[3,5],rb:[.5,.8],crownR:[3.2,4.4],
 tags:tag({riparian:'yes'},{notes:'a meat-eating tree rooted on both banks; its arch over the water hung with sticky vines that catch fish (a set piece)'})});
SWHI.PLANTS.push(
 {label:'Glow tubes',name:'Glow tubes',tags:tag({aridity:'humid'},{notes:'grey tubes lit orange at the tips: the rain wall\'s night lights'})},
 {label:'Bearded triplets',name:'Bearded triplets',tags:tag({aridity:'humid'},{notes:'broad teal-violet bracts with yellow crowns and long trailing whiskers'})},
 {label:'Blue-berry bract',name:'Blue-berry bract (an epiphyte)',tags:tag({aridity:'humid'},{edible:['blue berries'],notes:'on every bole in the rain wall'})},
 {label:'Drop-fruit',name:'Drop-fruit (an epiphyte)',tags:tag({aridity:'humid'},{notes:'a green-fruited epiphyte dripping yellow drops'})},
 {label:'Wisp strands',name:'Wisp strands (the weeping wisp)',tags:SP[KEY.weepingwisp].tags},
 {label:'Spore pod',name:'Spore pod (the stilt pod tree)',tags:SP[KEY.stiltpod].tags},
 {label:'Coral shelves',name:'Coral shelves (the shelf coral)',tags:SP[KEY.shelfcoral].tags},
 {label:'Fishing vines',name:'Fishing vines (the fishing bridge)',tags:SP[KEY.fishingbridge].tags});

// ---------------------------------------------------------------- materials and buckets
const TX=SWHI.TX,M=SWHI.MAT;
TX.strands=BIO.alphaTex(128,(g,S)=>{for(let i=0;i<24;i++){const x=S*(.08+.84*KRAND.h3(i,1,0,131)),l=S*(.45+.55*KRAND.h3(i,2,0,131)),w=(KRAND.h3(i,3,0,131)-.5)*14;g.strokeStyle=BIO.tex.grey(150+KRAND.h3(i,4,0,131)*90);g.lineWidth=1.4;
 g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+w,l*.5,x+w*.4,l);g.stroke();for(let k=1;k<4;k++){g.fillStyle=BIO.tex.grey(240);g.beginPath();g.arc(x+w*.4*k/4,l*k/4,1.6,0,TAU);g.fill();}}},[150,120,180]);
M.wisp=BIO.leafMat(TX.strands,'sw-wisp',{swayW:'(-position.y)',swayA:.12,axis:1,alphaTest:.35,backlit:.3});
M.glow=BIO.barkMat(null);M.glow.emissive=new T3.Color(0xff7a20);M.glow.emissiveIntensity=1;   /* the glow tubes' tips: lit by day too, faintly */
const BK=SWHI.BKMAT;BK.swstilt=BIO.barkMat(TX.flesh);BK.swshelf=BIO.barkMat(TX.flesh);BK.swwisp=BIO.barkMat(TX.cord);BK.swfish=BIO.barkMat(TX.cord);
BIO.bucket('swstilt',BK.swstilt,{label:'Stilt pod tree (stilts, trunk, collar)',uvScale:[1,1.5]});
BIO.bucket('swshelf',BK.swshelf,{label:'Shelf coral (its trunk)',uvScale:[1.5,2]});
BIO.bucket('swwisp',BK.swwisp,{label:'Weeping wisp (trunk and limbs)',uvScale:[1.5,2]});
BIO.bucket('swfish',BK.swfish,{label:'Fishing bridge (roots, arch, vines)',uvScale:[1,1.5]});

// ---------------------------------------------------------------- geometries
// the spore pod: an egg of hexagonal cells, each a pit (radius 1, 1.35 tall)
function podGeo(){const g=new T3.IcosahedronGeometry(1,2),P=g.attributes.position,A=VA(),C0=lin3(0x5ab8a0),C1=lin3(0x1e4a40);
 for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),a=Math.atan2(z,x),row=Math.floor((y+1)*4.5),pit=smooth(.5,.9,Math.abs(Math.cos(a*6+row*.52))*Math.abs(Math.cos((y+1)*4.5*Math.PI))),k=1-.07*pit;
  A.pos.push(x*k,y*1.35*k,z*k);A.nor.push(x,y/1.35,z);A.uv.push(.5+a/TAU,(y+1)/2);const c=lerpC(C0,C1,pit);A.col.push(c[0],c[1],c[2]);}
 g.dispose();return VG(A);}
// glow tubes: a clump of grey tubes, banded blue under their tips; the tips themselves a separate item (lit)
const GT=[];for(let k=0;k<6;k++){const a=k/6*TAU+KRAND.unit(KRAND.hash(132,k))*.6,d=k?.08+.1*KRAND.unit(KRAND.hash(132,k,1)):0;GT.push([Math.cos(a)*d,Math.sin(a)*d,.35+.45*KRAND.unit(KRAND.hash(132,k,2)),.045+.02*KRAND.unit(KRAND.hash(132,k,3))]);}
function glowTubesGeo(){const A=VA(),Gc=lin3(0x9a9aa2),Bc=lin3(0x5a7ad0);GT.forEach(t=>{armInto(A,[t[0],-.05,t[1]],[t[0]*1.7,t[2]*.93,t[1]*1.7],t[3],t[3]*.95,6,Gc);armInto(A,[t[0]*1.7,t[2]*.93,t[1]*1.7],[t[0]*1.8,t[2],t[1]*1.8],t[3]*.95,t[3]*1.05,6,Bc);});return VG(A);}
function glowTipsGeo(){const A=VA(),Oc=lin3(0xffa040);GT.forEach(t=>blobInto(A,[t[0]*1.8,t[2]+t[3]*.35,t[1]*1.8],t[3]*1.3,.8,0,.1,133,()=>Oc));return VG(A);}
// bearded triplets: three stalks, each under a broad drooping bract (teal to violet), a yellow crown on it, whiskers trailing to the ground (1 tall)
function tripletsGeo(){const A=VA(),Ct=lin3(0x30c8aa),Cv=lin3(0x5a40a0),Cs=lin3(0x3a5a3a),Cy=lin3(0xe8d070),Cw=lin3(0x30c0a0);
 for(let k=0;k<3;k++){const a=k/3*TAU+.5,ca=Math.cos(a),sa=Math.sin(a),hy=.6+.2*k/2,h=[ca*.22,hy,sa*.22];armInto(A,[0,0,0],h,.035,.025,5,Cs);
  const R=.42,n=4,m=5,V=[];for(let i=0;i<=n;i++){const row=[];for(let j=0;j<=m;j++){const r=R*i/n,b=a+(j/m-.5)*1.6;row.push([h[0]+Math.cos(b)*r,hy+.06-r*r*1.1,h[2]+Math.sin(b)*r]);}V.push(row);}
  for(let i=0;i<n;i++)for(let j=0;j<m;j++){const q=[V[i][j],V[i+1][j],V[i+1][j+1],V[i][j+1]],c=[lerpC(Cv,Ct,i/n),lerpC(Cv,Ct,(i+1)/n),lerpC(Cv,Ct,(i+1)/n),lerpC(Cv,Ct,i/n)];
   [0,2,1,0,3,2].forEach(t=>{A.pos.push(q[t][0],q[t][1],q[t][2]);A.nor.push(0,1,0);A.uv.push(t===1||t===2?1:0,t>1?1:0);A.col.push(c[t][0],c[t][1],c[t][2]);});}
  for(let c=0;c<4;c++){const b=a+(c-1.5)*.35;armInto(A,[h[0]+Math.cos(b)*.03,hy+.06,h[2]+Math.sin(b)*.03],[h[0]+Math.cos(b)*.05,hy+.2,h[2]+Math.sin(b)*.05],.028,.003,4,Cy);}
  for(let w=0;w<5;w++){const b=a+(w/4-.5)*1.4,e=V[n][Math.round(w/4*m)],f=[e[0]+Math.cos(b)*.05,.02,e[2]+Math.sin(b)*.05];armInto(A,[e[0]*.7+h[0]*.3,e[1]+.02,e[2]*.7+h[2]*.3],f,.008,.005,3,Cw);}}
 return VG(A);}
// a blue-berry bract, hanging (its foot at 0, it hangs down): pink-green leaves round a bunch of blue berries (1 long)
function bractGeo(){const A=VA(),L0=lin3(0x7a9a5a),L1=lin3(0xd88aa0),Bb=lin3(0x2a8ad8);
 for(let k=0;k<7;k++){const a=k/7*TAU;const B0=A.pos.length;leafInto(A,a,.35,.08,-.5,L0,L1);}
 for(let k=0;k<7;k++){const a=k/7*TAU+.4,r=.09+.05*(k%2);blobInto(A,[Math.cos(a)*r,-.2-.12*(k%3),Math.sin(a)*r],.075,1.15,0,.05,134,()=>Bb);}
 armInto(A,[0,.05,0],[0,-.55,0],.02,.01,3,L0);return VG(A);}
// drop-fruit: a cluster of green fruit, yellow drops on threads under it (its foot at 0, it hangs)
function dropGeo(){const A=VA(),Gf=lin3(0x5aa04a),Yd=lin3(0xf0d040),Th=lin3(0x6a7a4a);
 for(let k=0;k<6;k++){const a=k/6*TAU,r=k?.1:0;blobInto(A,[Math.cos(a)*r,-.06,Math.sin(a)*r],.07,1,0,.08,135,()=>Gf);}
 for(let k=0;k<5;k++){const a=k/5*TAU+.3,p=[Math.cos(a)*.12,-.08,Math.sin(a)*.12],l=.25+.2*(k%3)/2;armInto(A,p,[p[0],p[1]-l,p[2]],.004,.004,3,Th);blobInto(A,[p[0],p[1]-l-.02,p[2]],.025,1.3,0,0,136,()=>Yd);}
 return VG(A);}
// the fishing bridge's crown: long red straps, up and out (1 tall)
function redCrownGeo(){const A=VA(),R0=lin3(0x6a1a24),R1=lin3(0xe85068);for(let k=0;k<16;k++){const a=k/16*TAU+KRAND.unit(KRAND.hash(137,k))*.3;leafInto(A,a,.55+.3*KRAND.unit(KRAND.hash(137,k,1)),.05,.7+.4*KRAND.unit(KRAND.hash(137,k,2)),R0,R1);}return VG(A);}
const G=SWHI.GEO;
Object.assign(G,{spod:podGeo(),glowtubes:glowTubesGeo(),glowtips:glowTipsGeo(),triplets:tripletsGeo(),bract:bractGeo(),dropfruit:dropGeo(),redcrown:redCrownGeo(),
 sepal:BIO.fung.cap({form:'funnel',h:.55,seg:9,rings:2,wav:6,wavA:.22,under:'none',seed:138}),
 shelfb:BIO.fung.bracket({arc:Math.PI*1.15,seg:9,thick:.22,droop:.08,wav:6,wavA:.1,lump:.04,seed:139}),
 strands:BIO.fung.fringe({n:2,r:.05,w:1})});
BIO.def('spod',G.spod,M.rimBody,{label:'Spore pod'});
BIO.def('sepal',G.sepal,M.coneCap,{label:'Spore pod'});
BIO.def('shelfb',G.shelfb,M.coneCap,{label:'Coral shelves'});
BIO.def('wispstr',G.strands,M.wisp,{label:'Wisp strands'});
BIO.def('glowtubes',G.glowtubes,M.rimBody,{label:'Glow tubes'});
BIO.def('glowtips',G.glowtips,M.glow,{label:'Glow tubes'});
BIO.def('triplets',G.triplets,M.rimBody,{label:'Bearded triplets'});
BIO.def('bract',G.bract,M.rimBody,{label:'Blue-berry bract'});
BIO.def('dropfruit',G.dropfruit,M.rimBody,{label:'Drop-fruit'});
BIO.def('redcrown',G.redcrown,M.rimBody,{label:'Fishing bridge'});

// ---------------------------------------------------------------- the builders
const pt=(P,t)=>{const f=t*(P.length-1),i=Math.min(P.length-2,Math.floor(f)),u=f-i,a=P[i],b=P[i+1];return{x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u),z:lerp(a.z,b.z,u),r:lerp(a.r,b.r,u)};};
const TINT=[0xffffff,0xf4f4f0,0xf0f4ff];
// THE STILT POD TREE: stilt roots arching out and down from a hip a third of the way up, a slim trunk, a collar of tentacles, the pod in its cup
B.stilt=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,hip=[T.x,T.y0+T.H*.36,T.z],top=[T.x+s.range(-.4,.4),T.y0+T.H*.8,T.z+s.range(-.4,.4)];
 const ns=full?s.int(8,11):5;for(let k=0;k<ns;k++){const a=k/ns*TAU+s.range(-.25,.25),R=T.H*s.range(.2,.32),c=Math.cos(a),sn=Math.sin(a),o=s.range(-.3,.3);
  const e=[T.x+c*R,Y(T.x+c*R,T.z+sn*R)-.3,T.z+sn*R],m=[T.x+c*R*.4+o,hip[1]-T.H*.02,T.z+sn*R*.4-o];
  st.trunk+=BIO.tube('swstilt',curve([hip[0]+c*T.rb*.5,hip[1],hip[2]+sn*T.rb*.5],m,e,full?6:3,T.rb*.6,T.rb*.25),PICK(PAL.stilt,s.next()),{seg:full?6:4});}
 st.trunk+=BIO.tube('swstilt',curve(hip,[(hip[0]+top[0])/2+s.range(-.6,.6),(hip[1]+top[1])/2,(hip[2]+top[2])/2+s.range(-.6,.6)],top,full?6:3,T.rb*1.1,T.rb*.75),PICK(PAL.stilt,s.next()),{seg:full?8:5});
 const nt=full?s.int(10,14):6,cc=PICK(PAL.stiltTent,s.next());
 for(let k=0;k<nt;k++){const a=k/nt*TAU+s.range(-.2,.2),L=T.crownR*s.range(.7,1.1),c=Math.cos(a),sn=Math.sin(a);
  st.limb+=BIO.tube('swstilt',curve([top[0]+c*T.rb,top[1],top[2]+sn*T.rb],[top[0]+c*L*.6,top[1]+L*.12,top[2]+sn*L*.6],[top[0]+c*L,top[1]-L*.5,top[2]+sn*L],full?5:3,T.rb*.35,.03),cc,{seg:full?5:3});}
 const cr=T.crownR*.42;BIO.put('sepal',[top[0],top[1]+.1,top[2]],QE(0,s.range(0,TAU),0),[cr,cr*1.2,cr],PICK(PAL.sepal,s.next()),{label:'Spore pod'});
 const pr=T.crownR*.36;BIO.put('spod',[top[0],top[1]+pr*1.25,top[2]],QE(s.range(-.1,.1),s.range(0,TAU),s.range(-.1,.1)),[pr,pr,pr],PICK(TINT,s.next()),{label:'Spore pod'});
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.H*.3,h:T.H+pr*2.5});};
// THE SHELF CORAL: a pile of fresh stones, a twisting pale trunk with two limbs, orange brackets stacked up it and wide on top
B.shelf=function(T,st,lv,s){const S=SP[T.sp],full=lv===2;
 const ns=full?s.int(4,7):3;for(let k=0;k<ns;k++){const a=k/ns*TAU+s.range(-.4,.4),d=T.rb*s.range(.6,1.6),w=T.rb*s.range(.6,1.2),x=T.x+Math.cos(a)*d,z=T.z+Math.sin(a)*d;
  BIO.put('stone',[x,Y(x,z)+w*.15,z],QE(s.range(-.3,.3),s.range(0,TAU),s.range(-.3,.3)),[w,w*.8,w],PICK(PAL.stone,s.next()),{label:'Fresh stones (the shelf coral\'s)'});}
 const P=[],tw=s.range(0,TAU),n=full?8:4;for(let i=0;i<=n;i++){const t=i/n,a=tw+t*2.4;P.push({x:T.x+Math.cos(a)*T.rb*.7*Math.sin(t*Math.PI),y:T.y0-.3+T.H*t,z:T.z+Math.sin(a)*T.rb*.7*Math.sin(t*Math.PI),r:T.rb*(1.25-.85*t)});}
 st.trunk+=BIO.tube('swshelf',P,PICK(PAL.shelfTrunk,s.next()),{seg:full?9:6});
 const tips=[P[P.length-1]];for(let k=0;k<2;k++){const p=pt(P,.45+.2*k),a=s.range(0,TAU),L=T.crownR*s.range(.5,.8),e={x:p.x+Math.cos(a)*L,y:p.y+L*.5,z:p.z+Math.sin(a)*L,r:p.r*.3};
  st.limb+=BIO.tube('swshelf',curve([p.x,p.y,p.z],[(p.x+e.x)/2,p.y+L*.4,(p.z+e.z)/2],[e.x,e.y,e.z],full?4:2,p.r*.6,e.r),PICK(PAL.shelfTrunk,s.next()),{seg:full?6:4});tips.push(e);}
 const put=(p,a,sz)=>{BIO.put('shelfb',[p.x+Math.cos(a)*p.r*.8,p.y,p.z+Math.sin(a)*p.r*.8],QE(0,Math.atan2(Math.cos(a),Math.sin(a)),0),[sz,sz*.9,sz],PICK(PAL.shelf,s.next()),{label:'Coral shelves'});st.caps++;};
 const nb=full?s.int(12,18):7;for(let k=0;k<nb;k++){const t=s.range(.12,.95),p=pt(P,t);put(p,s.range(0,TAU),T.crownR*(.22+.45*t)*s.range(.7,1.1));}
 tips.forEach(p=>{for(let k=0;k<3;k++)put(p,k/3*TAU+s.range(-.3,.3),T.crownR*s.range(.45,.7));});
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.crownR*.8,h:T.H});};
// THE WEEPING WISP: a stout flared trunk, knobbed limbs out and up, violet strands hanging from them, epiphytes on the bole
B.wisp=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,th=T.H*.55,P=[];
 for(let i=0;i<=(full?7:3);i++){const t=i/(full?7:3);P.push({x:T.x,y:T.y0-.4+th*t,z:T.z,r:T.rb*(.6+.8*Math.pow(1-t,3)+.1*(1-t))});}
 st.trunk+=BIO.tube('swwisp',P,PICK(PAL.wispBark,s.next()),{seg:full?10:6});
 const nl=full?s.int(5,7):4,cs=PICK(PAL.wisp,s.next()),ends=[];
 for(let k=0;k<nl;k++){const a=k/nl*TAU+s.range(-.3,.3),p=pt(P,s.range(.75,1)),L=T.crownR*s.range(.6,1),e=[T.x+Math.cos(a)*L,T.y0+T.H*s.range(.72,.95),T.z+Math.sin(a)*L];
  const Lp=curve([p.x,p.y,p.z],[(p.x+e[0])/2,e[1]+.5,(p.z+e[2])/2],e,full?4:2,p.r*.45,T.rb*.14);st.limb+=BIO.tube('swwisp',Lp,PICK(PAL.wispBark,s.next()),{seg:full?6:4});ends.push(Lp);
  if(full){const q=pt(Lp,.55),b=a+s.range(-.9,.9),f=[q.x+Math.cos(b)*L*.4,q.y+L*.25,q.z+Math.sin(b)*L*.4],Ls=curve([q.x,q.y,q.z],[(q.x+f[0])/2,f[1],(q.z+f[2])/2],f,3,q.r*.6,T.rb*.08);
   st.limb+=BIO.tube('swwisp',Ls,PICK(PAL.wispBark,s.next()),{seg:4});ends.push(Ls);}}
 ends.forEach(Lp=>{[.6,1].forEach(t=>{const p=pt(Lp,t),w=s.range(.35,.6),L=s.range(2.2,Math.max(3,T.H*.38));BIO.put('wispstr',[p.x,p.y,p.z],QE(0,s.range(0,TAU),0),[w,L,w],cs,{label:'Wisp strands'});st.strands++;});});
 if(full){const nb=s.int(3,5);for(let k=0;k<nb;k++){const a=s.range(0,TAU),p=pt(P,s.range(.25,.6)),h=s.range(.5,.9);
   BIO.put('bract',[p.x+Math.cos(a)*p.r*.95,p.y,p.z+Math.sin(a)*p.r*.95],QE(0,s.range(0,TAU),0),[h,h,h],PICK(TINT,s.next()),{label:'Blue-berry bract'});st.epi++;}
  ends.slice(0,2).forEach(Lp=>{const p=pt(Lp,.5);BIO.put('dropfruit',[p.x,p.y-p.r,p.z],QE(0,s.range(0,TAU),0),1.2,PICK(TINT,s.next()),{label:'Drop-fruit'});st.epi++;});}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:T.x,z:T.z,y:T.y0,r:T.rb*1.6+.6,h:T.H});};
// THE FISHING BRIDGE: a root mass and a red crown on each bank (T and T.x2, T.z2), an arch of braided cords between, sticky vines into the water
B.fishbridge=function(T,st,lv,s){const S=SP[T.sp],full=lv===2,x2=T.x2==null?T.x+12:T.x2,z2=T.z2==null?T.z:T.z2,y2=Y(x2,z2)-.2,col=()=>PICK(PAL.fishBark,s.next());
 const base=(x,y,z)=>{const kn=[x,y+1.2,z],nr=full?8:4;for(let k=0;k<nr;k++){const a=k/nr*TAU+s.range(-.3,.3),R=s.range(2,3.2),e=[x+Math.cos(a)*R,Y(x+Math.cos(a)*R,z+Math.sin(a)*R)-.25,z+Math.sin(a)*R];
   st.trunk+=BIO.tube('swfish',curve(kn,[x+Math.cos(a)*R*.5,y+1.1,z+Math.sin(a)*R*.5],e,full?4:2,T.rb*.5,T.rb*.15),col(),{seg:full?5:4});}
  const top=[x,y+T.H,z];st.trunk+=BIO.tube('swfish',curve(kn,[x,y+T.H*.6,z],top,full?3:2,T.rb,T.rb*.7),col(),{seg:full?7:5});
  BIO.put('redcrown',top,QE(0,s.range(0,TAU),0),[T.crownR,T.crownR*1.1,T.crownR],PICK(TINT,s.next()),{label:'Fishing bridge'});st.caps++;return top;};
 const A=base(T.x,T.y0,T.z),Bt=base(x2,y2,z2),span=Math.hypot(x2-T.x,z2-T.z),ux=(x2-T.x)/span,uz=(z2-T.z)/span,a0=[A[0],A[1]-T.H*.45,A[2]],b0=[Bt[0],Bt[1]-T.H*.45,Bt[2]];
 const mid=t=>[lerp(a0[0],b0[0],t),lerp(a0[1],b0[1],t)+Math.sin(t*Math.PI)*(span*.12+1.2),lerp(a0[2],b0[2],t)];
 const nc=full?6:3;for(let k=0;k<nc;k++){const P=[],n=full?14:6;for(let i=0;i<=n;i++){const t=i/n,m=mid(t),ang=k/nc*TAU+t*Math.PI*2,r=.35*Math.sin(t*Math.PI)+.15;
   P.push({x:m[0]-uz*Math.cos(ang)*r,y:m[1]+Math.sin(ang)*r,z:m[2]+ux*Math.cos(ang)*r,r:T.rb*.32});}
  st.limb+=BIO.tube('swfish',P,col(),{seg:full?5:4});}
 const nv=full?s.int(7,10):4;for(let k=0;k<nv;k++){const t=s.range(.18,.82),m=mid(t),o=s.range(-.4,.4),gx=m[0]-uz*o,gz=m[2]+ux*o,wl=BIO.host.waterH?BIO.host.waterH(gx,gz):null,gy=(wl!=null&&isFinite(wl)&&wl>Y(gx,gz)?wl-.4:Y(gx,gz)-.3);   /* into the water where there is some */
  const P=[];for(let i=0;i<=5;i++){const u=i/5;P.push({x:lerp(m[0],gx,u)+Math.sin(u*3+k)*.15,y:lerp(m[1],gy,u),z:lerp(m[2],gz,u),r:lerp(.06,.025,u)});}
  st.limb+=BIO.tube('swfish',P,col(),{seg:3});
  if(full&&k%2===0){const p=pt(P,.55);BIO.put('redcrown',[p.x,p.y,p.z],QE(Math.PI,s.range(0,TAU),0),[.5,.6,.5],PICK(TINT,s.next()),{label:'Fishing vines'});}}
 if(full)reg({name:S.name,key:'flora.'+S.key,kind:'tree',x:(T.x+x2)/2,z:(T.z+z2)/2,y:Math.min(T.y0,y2),r:span/2+3,h:T.H+span*.12+2});};

// ---------------------------------------------------------------- the floor's puts
const FLOOR={
 glow:(x,y,z,s)=>{const n=s.int(1,3);for(let j=0;j<n;j++){const a=s.range(0,TAU),d=s.range(0,1.2),h=s.range(.5,1.2),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,py=Y(px,pz)-.03,q=QE(s.range(-.1,.1),s.range(0,TAU),s.range(-.1,.1));
  BIO.put('glowtubes',[px,py,pz],q,[h,h,h],PICK(TINT,s.next()),{label:'Glow tubes'});BIO.put('glowtips',[px,py,pz],q,[h,h,h],0xffffff,{label:'Glow tubes'});}return n;},
 triplets:(x,y,z,s)=>{const h=s.range(.8,1.5);BIO.put('triplets',[x,y-.03,z],QE(0,s.range(0,TAU),0),[h,h*s.range(.85,1.15),h],PICK(TINT,s.next()),{label:'Bearded triplets'});return 1;},
 moss:(x,y,z,s)=>{const w=s.range(.6,1.3);BIO.put('moss',[x,y-.04,z],QE(0,s.range(0,TAU),0),[w,w*.4,w],PICK(PAL.moss,s.next()),{label:'Native moss'});return 1;}};

// ---------------------------------------------------------------- the pass (station 2)
SWHI.rainZones=function(x,z){const f=n=>BIO.field(n,x,z),rain=f('rain'),scar=f('scar'),boulder=f('boulder'),wet=f('wet'),open=smooth(1.05,.6,f('slope'));
 return{rain,scar,boulder,wet,open,wisp:rain*(1-scar)*open,stilt:scar*open,shelf:(boulder*.8+scar*.15)*open,glow:rain*(1-scar)*open,triplets:rain*(1-scar)*open*(.4+.6*wet),moss:(rain*.8+wet*.4)*open};};
const newSt=()=>({trunk:0,limb:0,caps:0,strands:0,epi:0,heroes:0,light:0,far:0,glow:0,triplets:0,moss:0});
SWHI.buildRainwall=function(box,q,bridges){q=q==null?1:q;const st=newSt(),TREES=SWHI.TREES;TREES.length=0;const HOLD=KSPACE.create({cell:12}),k=Math.sqrt(1/q);
 const clearOf=(x,z,r)=>!HOLD.some(x,z,r,o=>Math.hypot(o.x-x,o.z-z)<o.r+r),hold=(x,z,r)=>HOLD.insert({x,z,r},x,z,r);
 (bridges||[]).forEach((b,i)=>{const T=FL.mk(b[0],Y(b[0],b[1]),b[1],KEY.fishingbridge,KRAND.hash(BIO.host.seed>>>0,i,0xF15),FL.lvOf,2);T.x2=b[2];T.z2=b[3];TREES.push(T);hold((b[0]+b[2])/2,(b[1]+b[3])/2,Math.hypot(b[2]-b[0],b[3]-b[1])/2+3);});
 SWHI.cells(14*k,801,box,(x,z)=>SWHI.rainZones(x,z).shelf*.6,(x,y,z,sd)=>{if(!clearOf(x,z,3))return false;const T=FL.mk(x,y,z,KEY.shelfcoral,sd,FL.lvOf);TREES.push(T);hold(x,z,T.crownR*.7);return true;});
 SWHI.cells(18*k,802,box,(x,z)=>SWHI.rainZones(x,z).stilt*.55,(x,y,z,sd)=>{if(!clearOf(x,z,3))return false;const T=FL.mk(x,y,z,KEY.stiltpod,sd,FL.lvOf);TREES.push(T);hold(x,z,T.H*.22);return true;});
 SWHI.cells(19*k,803,box,(x,z)=>SWHI.rainZones(x,z).wisp*.8,(x,y,z,sd)=>{if(!clearOf(x,z,3))return false;const T=FL.mk(x,y,z,KEY.weepingwisp,sd,FL.lvOf);TREES.push(T);hold(x,z,T.crownR*.6);return true;});
 FL.draw(TREES,st,'rainwall','impRainwall',sp=>sp===KEY.fishingbridge?TREES.find(T=>T.sp===sp):null);
 const pass=(item,cell,salt,R,accept)=>{BIO.range=R;BIO.minRange=0;SWHI.cells(cell*k,salt,box,(x,z)=>BIO.lodD(x,z)<R?accept(SWHI.rainZones(x,z)):0,(x,y,z,sd)=>{if(!clearOf(x,z,.4))return false;st[item]+=FLOOR[item](x,y,z,KRAND.stream(sd));return true;});};
 const L=SWHI.LOD.floor;pass('glow',7,804,L,Z=>Z.glow*.35);pass('triplets',6,805,L,Z=>Z.triplets*.3);pass('moss',3.4,806,L,Z=>Z.moss*.7);
 BIO.range=null;BIO.minRange=0;
 return{trees:TREES.length,heroes:st.heroes,light:st.light,bySpecies:['stiltpod','shelfcoral','weepingwisp','fishingbridge'].map(k2=>k2+':'+TREES.filter(T=>T.sp===KEY[k2]).length).join(' '),
  floor:{glow:st.glow,triplets:st.triplets,moss:st.moss},strands:st.strands,epiphytes:st.epi,tris:{trunk:st.trunk,limbs:st.limb,far:st.far}};};

// ---------------------------------------------------------------- the preview sheet
SWHI.SHEETS.rainwall=(x0,z0,a)=>FL.lay(x0,z0,a,{gap:16,bedGap:11,salt:2,
 trees:[['stiltpod',1],['stiltpod',2],['stiltpod',3],['shelfcoral',2],['shelfcoral',3],['weepingwisp',2],['weepingwisp',3],
  ['fishingbridge',2,(T,P,u)=>{const p=P(u,16);return{x2:p[0],z2:p[1]};}]],
 beds:[['glow tubes',FLOOR.glow,8,3.5],['bearded triplets',FLOOR.triplets,7,4],['moss',FLOOR.moss,20,4.5]]});
})();
