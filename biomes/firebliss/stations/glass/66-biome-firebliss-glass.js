// ================================================================= FIREBLISS — the dome's pieces (STATION 8, South Glass: PLAN.md section 11.2)
// FIREBLISS.station(site, {clear, q}): what the dome and its knappers leave, called by the host's build (89z) after the camp is pitched. Every record is
// registered (core/tags) before it is drawn; every piece is seeded from KRAND.hash of (world, index, salt), never from how many draws came before it.
//   THE SPINES     obsidian spines and blocks along the crest and over the top's outer band (the carapace broken as it spread), a record a 200 m stretch
//   THE APRON      the autobreccia's blocks on the talus: black glass and pale perlite, larger toward the foot
//   THE FLOORS     the knapping floors round the camp (core/camp's pitch, 65: FIREBLISS.CAMP): fans of flakes and blades from a sitting stone, spent
//                  cores, a hammerstone; two aurochs-horn cairns at the bench's ends (the Kimr's)
//   THE QUARRY     at the apron's foot nearest the camp: blocks pried out of the talus, a spread of debitage, the cores' first shaping
//   THE WAY UP     cairns every ~90 m up the slumped lobe's ramp to the crest, a horn cairn on the lip
// The dome's shape is the host's (GLASS, 44y: plain maths, read here as data). [G data] for the placement; the drawing is BIO.put.
(function(){const {TAU,clamp,smooth,reseed,rng,rr,ri,pick,qEuler,qUp}=BIO.fn;
const PAL=FIREBLISS.PAL,C=FIREBLISS.C,vary=FIREBLISS.vary;
const Y=(x,z)=>BIO.terrainH(x,z),IN=(x,z,m)=>Math.abs(x)<2600-m&&Math.abs(z)<2600-m;
const PERLITE=[0xaeb3b8,0xbcc1c6,0x9ea3a8],GLASSC=[0x15161a,0x1d1f26,0x111216],MAHOG=[0x3a1e16,0x2e1712];
const reg=o=>BIO.register(Object.assign({kind:'rock'},o));
// a horn cairn: stones stacked, an aurochs' horns on top (the Kimr's mark of their ground)
function hornCairn(x,z,salt){reseed(KRAND.hash(8240,salt,0,1));let y=Y(x,z);
 for(let k=0,n=ri(4,6);k<n;k++){const s=(1-k/(n+1))*rr(.4,.6);BIO.put('cairnstone',[x+rr(-.06,.06),y+s*.3,z+rr(-.06,.06)],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[s,s*.8,s],vary(C(pick(PAL.stone)),.01,.03,.05));y+=s*.55;}
 const r0=rr(0,TAU);for(const e of[-1,1])BIO.put('horn',[x+e*.07,y+.05,z],qEuler(0,r0+(e<0?Math.PI:0),0),[.95,.95,.95],vary(C(pick(PAL.horn)),.01,.03,.04));}
// a knapping floor: a fan of flakes and blades in front of a sitting stone, toward `way` (radians), spent cores, a hammerstone
function knapFloor(x,z,way,salt,st){reseed(KRAND.hash(8230,salt,0,2));const y0=Y(x,z);
 BIO.put('cache',[x-Math.cos(way)*1.2,y0+.15,z-Math.sin(way)*1.2],qEuler(rr(-.1,.1),rr(0,TAU),rr(-.1,.1)),[.55,.45,.55],vary(C(pick(PAL.stone)),.01,.03,.05));   /* the sitting stone */
 const n=ri(140,220);for(let k=0;k<n;k++){const a=way+rr(-1.1,1.1),d=Math.pow(rng(),.7)*rr(2.5,5),px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,s=rr(.03,.11),blade=rng()<.2;
  if(BIO.waterH(px,pz)>Y(px,pz)-.2)continue;BIO.put('obsidian',[px,Y(px,pz)+.01,pz],qEuler(rr(-.15,.15),rr(0,TAU),rr(-.15,.15)),[s*(blade?2.4:1.3),s*.12,s*(blade?.5:1)],vary(C(pick(rng()<.15?MAHOG:GLASSC)),.01,.04,.04));st.debitage++;}
 for(let k=0,m=ri(3,6);k<m;k++){const a=way+rr(-.8,.8),d=rr(.4,2.2),s=rr(.1,.24);BIO.put('obsidian',[x+Math.cos(a)*d,y0+s*.3,z+Math.sin(a)*d],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[s,s*.8,s*1.1],vary(C(pick(GLASSC)),.01,.03,.05));st.cores++;}
 BIO.put('cairnstone',[x+Math.cos(way+1.5)*.8,y0+.08,z+Math.sin(way+1.5)*.8],qEuler(rr(-.3,.3),rr(0,TAU),rr(-.3,.3)),[.2,.17,.2],vary(C(0x5a5650),.01,.03,.05));st.hammers++;}
FIREBLISS.station=function(site,o){if(!site.glass||typeof GLASS==='undefined')return null;o=o||{};const q=o.q==null?1:o.q;BIO.cur='firebliss/station';
 const st={spines:0,blocks:0,apron:0,debitage:0,cores:0,hammers:0,horncairns:0,floors:0,quarry:0,waycairns:0,clear:[]},G=GLASS,sm=G.sm;
 const camp=FIREBLISS.CAMP,campAt=camp?[camp.hearth.x,camp.hearth.z,camp.R]:[site.camp.x,site.camp.z,20];
 const nearCamp=(x,z,m)=>Math.hypot(x-campAt[0],z-campAt[1])<campAt[2]+m;
 // ---- the spines along the crest: stretches of 200 m, each registered, then its spines every ~22 m (bearings 96-156 cover the page's crest)
 const b0=96,b1=156,step=22/G.RC*180/Math.PI,segN=Math.round(200/22);
 for(let i=0,seg=-1,rec=null;;i++){const b=b0+i*step;if(b>b1)break;const c=G.crest(b,0);if(!IN(c.x,c.z,30))continue;
  const sh=G.shape(c.x,c.z);if(sh.slump>.4)continue;
  const sg=Math.floor(i/segN);if(sg!==seg){seg=sg;const m=G.crest(b+step*segN/2,40);reg({name:'South Glass\'s crest (obsidian spines on the lip)',x:m.x,z:m.z,y:G.TOP-60,r:125,h:110});}
  const h=KRAND.hash(8201,i,0,1);reseed(h);if(rng()>.62*q)continue;
  const inset=rr(1,26),p=G.crest(b,inset),y=Y(p.x,p.z),s=rr(1.4,4.2)*(rng()<.12?2:1),out=G.angOf(b);
  BIO.put('obsidian',[p.x,y-.3*s,p.z],qEuler(Math.sin(out)*rr(.1,.45),rr(0,TAU),-Math.cos(out)*rr(.1,.45)),[s*rr(.45,.8),s*rr(1.3,2.6),s*rr(.45,.8)],vary(C(pick(rng()<.1?MAHOG:GLASSC)),.01,.04,.05));st.spines++;}
 // ---- blocks over the top's outer band (the carapace broken by the ridges): a 26 m lattice, each cell its own hash; d from -420 to -30 m
 {const cs=26,N=Math.ceil(2600/cs);for(let j=-N;j<N;j++)for(let i=-N;i<N;i++){const h=KRAND.hash(8202,i,j,2),u=k=>KRAND.unit(KRAND.hash(h,k,0,2));
   const x=(i+u(1))*cs,z=(j+u(2))*cs;if(!IN(x,z,20)||u(3)>.42*q)continue;const s0=G.shape(x,z);if(s0.d<-420||s0.d>-30||s0.slump>.4)continue;
   reseed(h);const s=rr(.6,2.6);
   BIO.put('obsidian',[x,Y(x,z)+s*.1,z],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[s*rr(.8,1.4),s*rr(.5,.9),s*rr(.8,1.4)],vary(C(pick(GLASSC)),.01,.04,.05));st.blocks++;}}
 // ---- the apron's blocks: glass and perlite on the talus, larger toward the foot (a 14 m lattice); none in a crack's groove
 {const cs=14,N=Math.ceil(2600/cs);for(let j=-N;j<N;j++)for(let i=-N;i<N;i++){const h=KRAND.hash(8203,i,j,3),u=k=>KRAND.unit(KRAND.hash(h,k,0,3));
   const x=(i+u(1))*cs,z=(j+u(2))*cs;if(!IN(x,z,10))continue;const s0=G.shape(x,z);if(s0.d<s0.wc+8)continue;const rs=G.raise(x,z,s0);if(rs<1.5)continue;
   const down=smooth(120,4,rs);if(u(3)>(.35+.35*down)*q)continue;if(BIO.field('therm',x,z)>.2||BIO.waterH(x,z)>Y(x,z)-.3)continue;reseed(h);
   const per=rng()<.35,s=rr(.4,1.6)*(1+1.6*down*rng());
   BIO.put(per?'pumice':'obsidian',[x,Y(x,z)+s*.12,z],qEuler(rr(-.5,.5),rr(0,TAU),rr(-.5,.5)),[s*rr(.8,1.4),s*rr(.55,.9),s*rr(.8,1.4)],vary(C(pick(per?PERLITE:GLASSC)),.01,.04,.05));st.apron++;}}
 // ---- the knapping floors round the camp: five, on the bench outside the camp's ring, each facing the camp's hearth
 for(let k=0;k<5;k++){const h=KRAND.hash(8231,k,0,4);const a=k/5*TAU+.6+(KRAND.unit(h)-.5)*.5,d=campAt[2]+9+KRAND.unit(KRAND.hash(h,1,0,4))*6;
  const x=campAt[0]+Math.cos(a)*d,z=campAt[1]+Math.sin(a)*d;if(BIO.mask(x,z)<=0||BIO.field('slope',x,z)>.35)continue;
  reg({name:'A knapping floor (obsidian flakes and blades, spent cores: the Kimr\'s)',kind:'site',x,z,y:Y(x,z)-.4,r:6,h:1.6,tags:{culture:'kimr'}});
  knapFloor(x,z,a+Math.PI,k,st);st.floors++;st.clear.push({x,z,r:6});}
 // ---- two horn cairns at the bench's ends
 for(const e of[-1,1]){const B=G.BENCH,x=B.x+B.u[0]*B.a*.85*e,z=B.z+B.u[1]*B.a*.85*e;if(BIO.mask(x,z)<=0||nearCamp(x,z,4))continue;
  reg({name:'A Kimr aurochs-horn cairn (the bench is theirs while they knap)',kind:'mark',x,z,y:Y(x,z)-.3,r:1.2,h:3.4,tags:{culture:'kimr'}});hornCairn(x,z,e+2);st.horncairns++;st.clear.push({x,z,r:2});}
 // ---- the quarry at the apron's foot below the camp (bearing 126): blocks pried out, debitage, two shaping floors
 {const f=G.foot(126),a=G.angOf(126),x0=f.x-Math.cos(a)*14,z0=f.z-Math.sin(a)*14;
  if(IN(x0,z0,40)){reg({name:'The obsidian quarry (blocks pried from the talus; the cores shaped here)',kind:'site',x:x0,z:z0,y:Y(x0,z0)-2,r:26,h:9,tags:{culture:'kimr'}});
   for(let k=0;k<9;k++){reseed(KRAND.hash(8250,k,0,5));const t=rr(-1,1),x=x0-Math.sin(a)*t*18+Math.cos(a)*rr(-6,8),z=z0+Math.cos(a)*t*18+Math.sin(a)*rr(-6,8),s=rr(1.4,3.4);
    BIO.put('obsidian',[x,Y(x,z)+s*.15,z],qEuler(rr(-.4,.4),rr(0,TAU),rr(-.4,.4)),[s*rr(.9,1.3),s*rr(.6,.9),s*rr(.9,1.3)],vary(C(pick(rng()<.25?MAHOG:GLASSC)),.01,.04,.05));st.quarry++;}
   for(let k=0;k<2;k++){const x=x0+Math.cos(a)*(16+k*7)-Math.sin(a)*(k?8:-6),z=z0+Math.sin(a)*(16+k*7)+Math.cos(a)*(k?8:-6);if(BIO.mask(x,z)<=0)continue;knapFloor(x,z,a+Math.PI,10+k,st);}
   st.clear.push({x:x0,z:z0,r:26});}}
 // ---- the way up: cairns every ~90 m up the slumped lobe's ramp, a horn cairn on the lip
 {const f=G.foot(G.SLUMP),c=G.crest(G.SLUMP,6),L=f.r-c.r,a=G.angOf(G.SLUMP);
  for(let s=40;s<L-20;s+=90){const r=f.r-s,x=G.C[0]+Math.cos(a)*r+Math.sin(a)*8,z=G.C[1]+Math.sin(a)*r-Math.cos(a)*8;if(!IN(x,z,10))continue;
   reg({name:'The knappers\' way up the slumped lobe: a cairn',kind:'mark',x,z,y:Y(x,z)-.3,r:1.2,h:2.4,tags:{culture:'kimr'}});reseed(KRAND.hash(8260,s,0,6));let y=Y(x,z);
   for(let k=0,n=ri(3,5);k<n;k++){const sz=(1-k/(n+1))*rr(.35,.5);BIO.put('cairnstone',[x+rr(-.05,.05),y+sz*.3,z+rr(-.05,.05)],qEuler(rr(-.2,.2),rr(0,TAU),rr(-.2,.2)),[sz,sz*.8,sz],vary(C(pick(PAL.stone)),.01,.03,.05));y+=sz*.55;}
   st.waycairns++;}
  if(IN(c.x,c.z,10)){reg({name:'A Kimr aurochs-horn cairn on the Glass\'s lip (the way up)',kind:'mark',x:c.x,z:c.z,y:Y(c.x,c.z)-.3,r:1.2,h:3.4,tags:{culture:'kimr'}});hornCairn(c.x,c.z,9);st.horncairns++;}}
 BIO.cur=null;return st;};
})();
