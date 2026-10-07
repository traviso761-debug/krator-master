// prefix: dhb
// ================================================================= DHELV: THE BIOME HOST (P5b). Two kits, read in place (build.py wraps each in a
// closure so its helper globals stay its own), as the Throne's kipuka station reads them: the THRONE kit's pioneers on the young
// lava (the flows round the kipuka and over the city, the old cone's top, the great ruffs on the kipuka's rim), then its big
// trees become obstacles, then the HYPERJUNGLE kit's old growth on the kipuka itself; one bake. Bound here, before the kits
// load (they read BIO.host.THREE then); the scene arrives with the page (BIO.setScene in 90) and the build runs with the world.
// Where the hyperjungle may root (DHB.mask): the kipuka's floor, less the outpost's clearing inside its palisade, the stream's
// banks, the pasture, and the foot of the old cone's cliff (no tree on a cliff). The Throne (DHB.throneMask): the ground's
// whole sheet less the cliff's foot and lip, the clearing, the stream, the pasture, the light well and the wells. Every
// building on the surface is an obstacle (none in a building).
const DHB={obstacles:[],buildings:[],seed:41,G:{x0:-2960,z0:-560,x1:860,z1:960,cs:8},THC:[-1050,200],THR:2050};
DHB.dk=(x,z)=>{const K=DH.KIPUKA;return Math.hypot(x-K.c[0],(z-K.c[1])*1.3)/K.r;};
DHB.isCone=(x,z)=>x>DH.cliffX(z)-4&&DH.groundY(x,z)>DH.surfaceY(x,z)+.5;
/* the outpost's clearing (inside its palisade, and the straight runs to the cliff), the stream's banks, the pasture */
DHB.off=function(x,z){const P=DH.PAL;if(Math.hypot(x-P.c[0],z-P.c[1])<P.r+10||(x>P.c[0]&&x<DH.CONE.cliffX+2&&Math.abs(z)<P.r+10))return true;
 for(let i=1;i<DH.STREAM.length;i++){const a=DH.STREAM[i-1],b=DH.STREAM[i],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2));
  if(Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z)<6)return true;}
 const Q=DH.PASTURE;let inside=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){if(((Q[i][1]>z)!==(Q[j][1]>z))&&(x<(Q[j][0]-Q[i][0])*(z-Q[i][1])/(Q[j][1]-Q[i][1])+Q[i][0]))inside=!inside;}
 return inside;};
DHB.mask=function(x,z){const dk=DHB.dk(x,z);if(dk>.97)return 0;
 if(x>DH.CONE.cliffX-8)return 0;   /* the cliff's foot and the cliff itself */
 if(DHB.off(x,z))return 0;
 return Math.min(1,(.97-dk)/.06);};
DHB.throneMask=function(x,z){const G=DHB.G;if(x<G.x0+10||x>G.x1-10||z<G.z0+10||z>G.z1-10)return 0;
 if(Math.abs(x-DH.cliffX(z))<8)return 0;   /* the cliff's foot and its lip */
 if(DHB.off(x,z))return 0;
 const H=DH.HALL;if(Math.hypot(x-H.c[0],z-H.c[1])<H.throat.r0+8)return 0;
 for(const P of DH.PITS)if(Math.hypot(x-P.c[0],z-P.c[1])<P.r+6)return 0;
 /* no tree on a scarp (the kipuka's rim, the cone's flanks): over 1 m, where the 8 m field shows any slope */
 if(dhbFields().at('slope',x,z)>.3){const g=DH.groundY;if(Math.max(Math.abs(g(x+1,z)-g(x-1,z)),Math.abs(g(x,z+1)-g(x,z-1)))/2>.5)return 0;}
 return 1;};
DHB.MASK=DHB.mask;
/* the ages (THRONE.ageAt: years since lava last covered the ground): the kipuka 2,600; the old cone 8,000; the flow over the
   city sixty years (the owner: "a bare flow", the wells hidden in plain sight: the pioneers' stage), with older lobes (380:
   woodland) and fresh tongues (8: bare black rock) where a noise says */
DHB.age0=function(x,z){if(DHB.dk(x,z)<1)return 2600;if(DHB.isCone(x,z))return 8000;const n=BIO.fn.fbm(x*.0011+3.1,z*.0011-1.7,4180,3);return n>.6?380:n<.33?8:60;};
/* the fields the Throne reads (BIOME-API.md), as its kipuka station makes them: humid 1 (the wet side); slope; rock (bare
   young lava and steep ground); owned the kipuka; kedge its rim just inside; knear the young lava just outside; skylight the
   ground round a well's pit */
DHB.FN=['humid','wet','slope','rock','owned','kedge','knear','skylight','age'];
function dhbFieldsAt(x,z,slope){const K=DH.KIPUKA,dk=DHB.dk(x,z),cone=DHB.isCone(x,z),old=dk<1||cone,age=DHB.age0(x,z);
 let sky=0;for(const P of DH.PITS)sky=Math.max(sky,smooth(P.r*1.7,P.r*1.05,Math.hypot(x-P.c[0],z-P.c[1])));
 const bare=old?0:smooth(60,8,age),walls=smooth(.62,.92,slope);
 return {humid:1,wet:.85,slope,rock:clamp(Math.max(bare,walls*.9),0,1),owned:dk<1?smooth(1,.92,dk):0,kedge:dk<1?smooth(60,20,(1-dk)*K.r):0,
  knear:old?0:smooth(140,30,(dk-1)*K.r),skylight:sky,age};}
function dhbFields(){if(DHB.F)return DHB.F;const G=DHB.G,cs=G.cs,nx=Math.round((G.x1-G.x0)/cs)+1,nz=Math.round((G.z1-G.z0)/cs)+1,A={},h=new Float32Array(nx*nz);
 DHB.FN.forEach(n=>A[n]=new Float32Array(nx*nz));
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)h[j*nx+i]=DH.groundY(G.x0+i*cs,G.z0+j*cs);
 for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const k=j*nx+i,hx=h[j*nx+Math.min(nx-1,i+1)]-h[j*nx+Math.max(0,i-1)],hz=h[Math.min(nz-1,j+1)*nx+i]-h[Math.max(0,j-1)*nx+i];
  const F=dhbFieldsAt(G.x0+i*cs,G.z0+j*cs,clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1));DHB.FN.forEach(n=>A[n][k]=F[n]);}
 const uv=(x,z)=>[clamp((x-G.x0)/cs,0,nx-1.001),clamp((z-G.z0)/cs,0,nz-1.001)];
 DHB.F={nx,nz,A,
  at(n,x,z){const [u,v]=uv(x,z),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*nx+i,a=A[n];return a[k]*(1-fu)*(1-fv)+a[k+1]*fu*(1-fv)+a[k+nx]*(1-fu)*fv+a[k+nx+1]*fu*fv;},
  near(n,x,z){const [u,v]=uv(x,z);return A[n][Math.round(v)*nx+Math.round(u)];}};
 return DHB.F;}
const DHB_FIELDS={};DHB.FN.forEach(n=>{if(n!=='age')DHB_FIELDS[n]=(x,z)=>dhbFields().at(n,x,z);});
/* the Throne's flow history, bound (its own model, 46, is not run: the layout's ground is Dhelv's) */
function dhbFlows(){const F=dhbFields(),ID={60:0,8:1,380:2};
 return {flows:[{key:'city',name:'The flow over the city (sixty years)',age:60},{key:'fresh',name:'A fresh tongue (eight years)',age:8},{key:'older',name:'An older lobe (380 years)',age:380}],
  ageAt:(x,z)=>F.near('age',x,z),idAt:(x,z)=>{const a=F.near('age',x,z);return a in ID?ID[a]:-1;},thickAt:()=>0,
  shares(){const s={fresh:0,young:0,mature:0,old:0},A=F.A.age;let n=0;for(let k=0;k<A.length;k+=3){const g=THRONE.stages(A[k]);for(const q in s)s[q]+=g[q];n++;}for(const q in s)s[q]/=n;return s;}};}
/* every building on the surface: an obstacle (the outpost's, and any of the city's that stands on the ground) */
for(const s of DH.SITES){const F=DH.FOOT[s.key];if(!F)continue;if(s.district!=='outpost'&&s.y<DH.groundY(s.x,s.z)-3)continue;const o={x:s.x,z:s.z,r:Math.hypot(F[0],F[1])/2+2,y0:s.y-2,y1:s.y+40};DHB.obstacles.push(o);DHB.buildings.push(o);}
/* the LOD spine: the kipuka, the light well, the wells, the flow between */
DHB.SPINE=[DH.KIPUKA.c.slice(),DH.HALL.c.slice(),...DH.PITS.map(P=>P.c.slice()),[-1800,0],[-1000,100]];
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>DH.groundY(x,z),mask:(x,z)=>DHB.MASK(x,z),obstacles:DHB.obstacles,seed:DHB.seed,
 origin:DHB.SPINE,center:DH.KIPUKA.c.slice(),fields:DHB_FIELDS,err:m=>console.warn('biome: '+m),lod:{hero:280,mid:760,far:2400,floor:[250,620]}});
/* the kits planted with the world (90's buildWorld, after the buildings), baked once into the scene. ?noforest leaves both out,
   ?nothrone the Throne's; ?q= scales the hyperjungle's counts, ?tq= the Throne's */
function dhbForest(){if(typeof HYPERJUNGLE==='undefined'||new URLSearchParams(location.search).has('noforest'))return null;
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1.8,tq=Q.has('tq')?+Q.get('tq'):.7,t0=performance.now();BIO.setScene(scene);   /* 1.8: a few giants round the clearing (the kit's 165 m spacing) and a dense understory */
 let th=null;
 if(typeof THRONE!=='undefined'&&!Q.has('nothrone')){THRONE.FLOWS=dhbFlows();const keep=BIO.host.center;BIO.host.center=DHB.THC;DHB.MASK=DHB.throneMask;
  try{th=THRONE.build({R:DHB.THR,quality:tq});}catch(e){reportErr('throne: '+(e.stack||e));}finally{BIO.host.center=keep;DHB.MASK=DHB.mask;}
  /* the Throne's big trees keep the hyperjungle's trunks off them (its kipuka station's rule) */
  THRONE.TREES.forEach(T=>{const k=THRONE.SPECIES[T.sp].key;if(k==='greatruff'||k==='siphon'||k==='frilltree')DHB.obstacles.push({x:T.x,z:T.z,r:k==='greatruff'?T.crownR*.5+T.rb:k==='frilltree'?T.rb*2.5:T.rb*3,y0:T.y0-5,y1:T.y0+T.H});});}
 const t1=performance.now();
 try{DHB.out=HYPERJUNGLE.build({R:470,quality:q,heroR:265,fauna:false});}catch(e){reportErr('hyperjungle: '+(e.stack||e));return null;}
 const b=BIO.bake();DHB.out.instances=b.inst;DHB.out.calls=b.calls;DHB.out.ms=Math.round(performance.now()-t0);DHB.out.throneMs=Math.round(t1-t0);
 DHB.out.throne=th?{trees:THRONE.TREES.length,shares:THRONE.FLOWS.shares()}:null;return DHB.out;}
/* every tree's foot: where its kit's mask lets it root, not on the cliff or a slope, not in a building */
function dhbTreesOk(trees,mask){mask=mask||DHB.mask;const bad=[];for(const T of trees){const m=mask(T.x,T.z),g=DH.groundY,sl=Math.max(Math.abs(g(T.x+1,T.z)-g(T.x-1,T.z)),Math.abs(g(T.x,T.z+1)-g(T.x,T.z-1)))/2;
  const ob=DHB.buildings.find(o=>Math.hypot(T.x-o.x,T.z-o.z)<o.r);if(m<=0||sl>.6||ob)bad.push(T.x.toFixed(0)+','+T.z.toFixed(0)+(m<=0?' (off its ground)':sl>.6?' (on a slope)':' (in a building)'));}
 return bad;}
