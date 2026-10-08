// prefix: dhb
// ================================================================= DHELV: THE BIOME HOST (P5b). Two kits, read in place (build.py wraps each in a
// closure so its helper globals stay its own), as the Throne's kipuka station reads them: the THRONE kit's pioneers on the young
// lava (the plain round the plateau, the apron's edge), then its big trees become obstacles, then the HYPERJUNGLE kit's old
// growth on the plateau's top (the kipuka: old ground the flows went round); one bake. Bound here, before the kits load (they
// read BIO.host.THREE then); the scene arrives with the page (BIO.setScene in 90) and the build runs with the world.
// Where the hyperjungle may root (DHB.mask): the plateau's top, 10 m back from its edge (no tree on the wall or its lip), off the
// light well's throat and the wells' pits. The Throne (DHB.throneMask): the plain and the apron, off the wall's foot, the
// outpost's clearing, the stream, the pasture, and any scarp. Every building on the surface is an obstacle (none in a building).
const DHB={obstacles:[],buildings:[],seed:41,G:{x0:-1150,z0:-800,x1:1700,z1:1100,cs:8},THC:[275,150],THR:1500,HJC:[0,100],HJR:720};
DHB.dk=(x,z)=>{const K=DH.APRON;return Math.hypot(x-K.c[0],(z-K.c[1])*1.3)/K.r;};
/* the outpost's clearing (inside its palisade, and the straight runs to the west face), the stream's banks, the pasture */
DHB.off=function(x,z){const P=DH.PAL;if(Math.hypot(x-P.c[0],z-P.c[1])<P.r+10||(x>P.c[0]&&x<DH.PLAT.cliffX+2&&Math.abs(z)<P.r+10))return true;
 for(let i=1;i<DH.STREAM.length;i++){const a=DH.STREAM[i-1],b=DH.STREAM[i],dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2));
  if(Math.hypot(a[0]+dx*t-x,a[1]+dz*t-z)<6)return true;}
 const Q=DH.PASTURE;let inside=false;for(let i=0,j=Q.length-1;i<Q.length;j=i++){if(((Q[i][1]>z)!==(Q[j][1]>z))&&(x<(Q[j][0]-Q[i][0])*(z-Q[i][1])/(Q[j][1]-Q[i][1])+Q[i][0]))inside=!inside;}
 return inside;};
/* the openings on the plateau's top: the light well's throat and the three wells (a tree here would hang over a city) */
DHB.overOpening=(x,z,pad)=>{const H=DH.HALL;if(Math.hypot(x-H.c[0],z-H.c[1])<H.throat.r1+pad)return true;return DH.PITS.some(P=>Math.hypot(x-P.c[0],z-P.c[1])<P.r+pad);};
DHB.mask=function(x,z){const d=DH.plateauD(x,z);if(d<10||DH.ridgeD(x,z)>-6)return 0;   /* 10 m back from the edge: the caprock and the wall's lip stay bare; and off the foot of the ridge's back wall */
 if(DHB.overOpening(x,z,8))return 0;
 return Math.min(1,(d-10)/12);};
DHB.throneMask=function(x,z){const G=DHB.G;if(x<G.x0+10||x>G.x1-10||z<G.z0+10||z>G.z1-10)return 0;
 if(DH.plateauD(x,z)>-9)return 0;   /* the shelf and its wall's foot (the wall stands 4 m out from the outline) */
 const r=DH.ridgeD(x,z);if(r>-9&&r<10)return 0;   /* the ridge's walls, their foot and their lip (its crest is old ground: the kit's old woods) */
 if(DHB.off(x,z))return 0;
 /* no tree on a scarp: over 1 m, where the 8 m field shows any slope */
 if(dhbFields().at('slope',x,z)>.3){const g=DH.groundY;if(Math.max(Math.abs(g(x+1,z)-g(x-1,z)),Math.abs(g(x,z+1)-g(x,z-1)))/2>.5)return 0;}
 return 1;};
DHB.MASK=DHB.mask;
/* the ages (THRONE.ageAt: years since lava last covered the ground): the plateau 2,600 (the kipuka); the apron 400 (older soil
   at the wall's foot: woodland); the plain sixty years (young lava, the pioneers' stage), with older lobes (380) and fresh
   tongues (8: bare black rock) where a noise says */
DHB.age0=function(x,z){if(typeof THRONE!=='undefined'&&THRONE.FLOWS)return THRONE.ageAt(x,z);   /* the flow model's (48) */
 if(DH.plateauD(x,z)>0)return 2600;if(DHB.dk(x,z)<1)return 400;const n=BIO.fn.fbm(x*.0011+3.1,z*.0011-1.7,4180,3);return n>.6?380:n<.33?8:60;};
/* the fields the Throne reads (BIOME-API.md), as its kipuka station makes them: humid 1 (the wet side); slope; rock (bare young
   lava and steep ground); owned the plateau; kedge its rim just inside; knear the plain just outside its wall */
DHB.FN=['humid','wet','slope','rock','owned','kedge','knear','age'];
function dhbFieldsAt(x,z,slope){const d=DH.plateauD(x,z),old=d>0,age=DHB.age0(x,z);
 const bare=old?0:smooth(60,8,age),walls=smooth(.62,.92,slope);
 return {humid:1,wet:.85,slope,rock:clamp(Math.max(bare,walls*.9),0,1),owned:smooth(-2,6,d),kedge:old?smooth(60,15,d):0,knear:old?0:smooth(140,20,-d),age};}
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
function dhbFlows(){const F=dhbFields(),ID={60:0,8:1,380:2,400:3};
 return {flows:[{key:'plain',name:'The flow round the plateau (sixty years)',age:60},{key:'fresh',name:'A fresh tongue (eight years)',age:8},{key:'older',name:'An older lobe (380 years)',age:380},{key:'apron',name:'The apron at the west face (400 years)',age:400}],
  ageAt:(x,z)=>F.near('age',x,z),idAt:(x,z)=>{const a=F.near('age',x,z);return a in ID?ID[a]:-1;},thickAt:()=>0,
  shares(){const s={fresh:0,young:0,mature:0,old:0},A=F.A.age;let n=0;for(let k=0;k<A.length;k+=3){const g=THRONE.stages(A[k]);for(const q in s)s[q]+=g[q];n++;}for(const q in s)s[q]/=n;return s;}};}
/* every building on the surface: an obstacle (the outpost's, and any of the city's that stands on the ground) */
for(const s of DH.SITES){const F=DH.FOOT[s.key];if(!F)continue;if(s.district!=='outpost'&&s.y<DH.groundY(s.x,s.z)-3)continue;const o={x:s.x,z:s.z,r:Math.hypot(F[0],F[1])/2+2,y0:s.y-2,y1:s.y+40};DHB.obstacles.push(o);DHB.buildings.push(o);}
/* the LOD spine: the apron, the light well, the wells, the plateau's west half */
DHB.SPINE=[DH.APRON.c.slice(),DH.HALL.c.slice(),...DH.PITS.map(P=>P.c.slice()),[-450,0],[-300,250]];
BIO.init({THREE:THREE,scene:null,terrainH:(x,z)=>DH.groundY(x,z),mask:(x,z)=>DHB.MASK(x,z),obstacles:DHB.obstacles,seed:DHB.seed,
 origin:DHB.SPINE,center:DHB.HJC.slice(),fields:DHB_FIELDS,err:m=>console.warn('biome: '+m),lod:{hero:280,mid:760,far:2400,floor:[250,620]}});
/* the kits planted with the world (90's buildWorld, after the buildings), baked once into the scene. ?noforest leaves both out,
   ?nothrone the Throne's; ?q= scales the hyperjungle's counts, ?tq= the Throne's. The hyperjungle grows no unique hero here
   (the owner: standardized trees, the load lighter): its saplings round the city's core, its far forest beyond, its floor */
function dhbForest(){if(typeof HYPERJUNGLE==='undefined'||new URLSearchParams(location.search).has('noforest'))return null;
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1,tq=Q.has('tq')?+Q.get('tq'):.7,t0=performance.now();BIO.setScene(scene);
 let th=null;
 if(typeof THRONE!=='undefined'&&!Q.has('nothrone')){const keep=BIO.host.center;BIO.host.center=DHB.THC;DHB.MASK=DHB.throneMask;
  if(!THRONE.FLOWS)THRONE.FLOWS=dhbFlows();   /* (48 lays the flows; without it, the noise's ages) */
  try{th=THRONE.build({R:DHB.THR,quality:tq});}catch(e){reportErr('throne: '+(e.stack||e));}finally{BIO.host.center=keep;DHB.MASK=DHB.mask;}
  /* the Throne's big trees keep the hyperjungle's trunks off them (its kipuka station's rule) */
  THRONE.TREES.forEach(T=>{const k=THRONE.SPECIES[T.sp].key;if(k==='greatruff'||k==='siphon'||k==='frilltree')DHB.obstacles.push({x:T.x,z:T.z,r:k==='greatruff'?T.crownR*.5+T.rb:k==='frilltree'?T.rb*2.5:T.rb*3,y0:T.y0-5,y1:T.y0+T.H});});}
 const t1=performance.now();
 /* the shelf's trees: three standardized giants and three saplings, grown once and drawn as instances (49); then the kit's floor */
 try{BIO.cur='jungle/trees';DHB.out={grove:dhgGrove()};BIO.cur='jungle/floor';Object.assign(DHB.out,HYPERJUNGLE.buildFloor(DHB.HJR,q));BIO.cur=null;}
 catch(e){BIO.cur=null;reportErr('hyperjungle: '+(e.stack||e));return null;}
 const b=BIO.bake();DHB.out.instances=b.inst;DHB.out.calls=b.calls;/* the underground's plants, baked apart (drawn as the underground is: 90's dhSplitBiome): the wells' floors (89), the tunnels' fungi (88) */
 DHB.out.wells=dhKnollFlora(tq);DHB.out.fungi=dhFungi(tq);{const n0=BIO.baked.length,u=BIO.bake();for(let i=n0;i<BIO.baked.length;i++)BIO.baked[i].userData.under=true;DHB.out.under={calls:u.calls,instances:u.inst};}DHB.out.ms=Math.round(performance.now()-t0);DHB.out.throneMs=Math.round(t1-t0);
 DHB.out.throne=th?{trees:THRONE.TREES.length,shares:THRONE.FLOWS.shares()}:null;return DHB.out;}
/* every tree's foot: where its kit's mask lets it root, not on the wall or a slope, not in a building */
function dhbTreesOk(trees,mask){mask=mask||DHB.mask;const bad=[];for(const T of trees){const m=mask(T.x,T.z),g=DH.groundY,sl=Math.max(Math.abs(g(T.x+1,T.z)-g(T.x-1,T.z)),Math.abs(g(T.x,T.z+1)-g(T.x,T.z-1)))/2;
  const gy=g(T.x,T.z),ob=DHB.buildings.find(o=>Math.hypot(T.x-o.x,T.z-o.z)<o.r&&gy>o.y0-5&&gy<o.y1);   /* (a building at its own level: the shelf's top stands over the outpost's carved rooms) */if(m<=0||sl>.6||ob)bad.push(T.x.toFixed(0)+','+T.z.toFixed(0)+(m<=0?' (off its ground)':sl>.6?' (on a slope)':' (in a building)'));}
 return bad;}
