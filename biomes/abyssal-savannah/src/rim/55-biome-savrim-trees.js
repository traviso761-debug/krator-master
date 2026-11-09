// ================================================================= SAVANNARIM — trees (builders; no placement)
// make(key, x, y, z, seed) and grow(T, lv) per species, every number from KRAND.hash(T.seed, k, salt) (never a draw), as the
// hyperjungle's lands (its 54: HYPERJUNGLE.LANDS.G, read in place on every savannarim page, gives the shared tree and the unit
// geometry helpers). SAVRIM.builders[key] = {species, make, grow}: BIO.kitBuilder('savannarim', key) for a neighbour (Godstep's redlands
// station reads the rust miombo, PLAN-LANDS.md section 5.2, J6).
//   thorn     the umbrella thorn on the hyperjungle's shared tree (54: G.tree), a flat crown of leaflet clumps on its boughs
//   borassus  the fan palm: a trunk swollen halfway up in the bucket 'palmtrunk', a crown of 18-26 stiff fans (the kit's own frond
//             item) on long petioles, the dead fans hanging brown under it, fruit clusters
SAVRIM.builders=SAVRIM.builders||{};
(function(){
const U=KRAND.unit,HS=KRAND.hash,uOf=(T,k,s)=>U(HS(T.seed>>>0,k,0,s==null?0x5a3:s));
const inKit=f=>function(){const p=BIO.kit('savannarim');try{return f.apply(this,arguments);}finally{BIO.kit(p);}};
SAVRIM.uOf=uOf;SAVRIM.inKit=inKit;
SAVRIM.borassus={make(x,y,z,seed){const S=SAVRIM.byKey.borassus,T={key:'borassus',x,z,y0:y-.4,seed:seed>>>0};T.H=S.H[0]+(S.H[1]-S.H[0])*uOf(T,1);T.rb=S.rb[0]+(S.rb[1]-S.rb[0])*uOf(T,2);T.crownR=8;return T;},
 grow:inKit(function(T,lv){lv=lv==null?2:lv;const H=T.H,rb=T.rb,lean=[.05*(uOf(T,3)-.5),.05*(uOf(T,4)-.5)],nb=lv>=2?10:5,ax=t=>[T.x+lean[0]*H*t*t,T.y0+H*t,T.z+lean[1]*H*t*t];
  const col=[0x8a8070,0x7a7062,0x968a78][T.seed%3],P=[];
  for(let i=0;i<=nb;i++){const t=i/nb,a=ax(t);P.push({x:a[0],y:a[1],z:a[2],r:rb*(1+.35*Math.exp(-Math.pow((t-.55)/.13,2))+.4*Math.pow(Math.max(0,1-t/.06),2))*(1-.25*t)});}
  const segs=BIO.tree(T.x,T.z,()=>{BIO.tube('palmtrunk',P,col,{seg:lv>=2?9:6});
   /* the crown's boss: a short knob of old petiole bases the fans spring from */
   const top=ax(1),k=ax(.97);BIO.tube('palmtrunk',[{x:k[0],y:k[1],z:k[2],r:rb*.85},{x:top[0],y:top[1]+1.2,z:top[2],r:rb*1.05},{x:top[0],y:top[1]+2.2,z:top[2],r:rb*.4}],0x6a5a44,{seg:lv>=2?8:5});},{});
  const top=ax(1),n=lv>=2?18+Math.floor(8*uOf(T,5)):lv===1?12:8,a0=uOf(T,6)*TAU,L=5.5+2*uOf(T,7);
  const own=BIO.owner;BIO.owner=[T.x,T.z];
  try{for(let k=0;k<n;k++){const a=a0+k*2.39996,el=.15+1.1*uOf(T,20+k),pitch=-(Math.PI/2-el)*.9;
    BIO.put('borassusfan',[top[0],top[1]+1.6,top[2]],qEuler(.12*(uOf(T,40+k)-.5),-a,pitch),[L,L*(.9+.2*uOf(T,60+k)),L*(1.05+.3*uOf(T,80+k))],[0x4a6a34,0x557a3a,0x3e5e2c,0x6a8040][k%4]);}
   if(lv>=1){const nd=3+Math.floor(4*uOf(T,8));for(let k=0;k<nd;k++){const a=a0+k*1.9+.4;BIO.put('borassusfan',[top[0],top[1]+.6,top[2]],qEuler(0,-a,-1.25-.25*uOf(T,100+k)),[L*.85,L*.8,L*.9],[0x8a7448,0x7a6440,0x9a8250][k%3]);}
    const nf=lv>=2?5:2;for(let k=0;k<nf;k++){const a=a0+k*1.3;BIO.put('borassusfruit',[top[0]+Math.cos(a)*rb*1.1,top[1]-.4,top[2]+Math.sin(a)*rb*1.1],null,1.6,[0xc8782a,0xb8682a,0xd8882e][k%3]);}}}
  finally{BIO.owner=own;}
  T.top=top[1]+L*.8;return{segs};})};
// the umbrella thorn: a short crooked trunk, boughs rising then flattening into one wide flat crown (the hyperjungle's shared tree, 54)
SAVRIM.thorn={make(x,y,z,seed){const S=SAVRIM.byKey.thorn,T={key:'thorn',x,z,y0:y-.2,seed:seed>>>0};T.H=S.H[0]+(S.H[1]-S.H[0])*uOf(T,1);T.rb=S.rb[0]+(S.rb[1]-S.rb[0])*uOf(T,2);T.crownR=T.H*(.55+.2*uOf(T,3));return T;},
 grow:inKit(function(T,lv){T.lv=lv==null?2:lv;const G=HYPERJUNGLE.LANDS.G;return G.tree(T,{fam:'thornbark',col0:0x4e4034,bole:.4,from:.3,limbs:5,el:[.45,.8],len:[.75,1],droop:.18,forks:2,flare:.15,lean:[.06*(uOf(T,4)-.5),.06*(uOf(T,5)-.5)],
  item:'thornleaf',per:5,size:[3.5,5.5],flat:.25,col:(r,i)=>[0x5a6a30,0x6a7a38,0x4e5e2a][i%3]});})};
SAVRIM.SPECIES.forEach(S=>{const B=SAVRIM[S.key];if(B&&B.make&&B.grow)SAVRIM.builders[S.key]={species:S,make:B.make,grow:B.grow};});
})();
