// ================================================================= HOST — the site: the shoulder's slumps (station 4)
// The Gate Shoulder's own site functions (the cauldrons' are src/44s): the same interface the frame reads (siteBuild, sitePoint, siteRelief,
// siteApron, stairAt, SITE_RECS, SITE_SPRINGS, SITE_STAIR, DIKES, TALUS, SITE_DIKE_MID), on its own landforms:
//   the SLUMPS     KRELIEF.slump (core/terrain 38c), one record a crown line, composed on the model in order
//   the MIRRORS    a slump's head scarp (part 'head') steeper than ~30 degrees: the bared fault surface, its pseudotachylite polished
//   the PINNACLES  KSTACKS spires (37) on the blocks' broken fronts (part 'front'), found on a grid, KRAND-hashed by cell
//   the TALUS      KRELIEF.talus (38) against the pinnacles' feet
let SITE_RECS=null,SITE_SPRINGS=[],SITE_STAIR=null,DIKES=[],TALUS=null,PINNACLES=[],SITE_MOUTHS=[];
function siteSwell(x,z){return 5*(KRAND.fbm(x*.0009+1.7,z*.0009-4.1,0,3,6402)-.5)*2+1.2*(KRAND.fbm(x*.009+4.4,z*.009-.6,0,2,6403)-.5)*2;}
function siteBuild(ground){const g0=(x,z)=>ground(x,z)+siteSwell(x,z);
 const S=SITE.slumps.map(Q=>KRELIEF.slump({pts:Q.pts,side:Q.side,n:Q.n,bw:Q.bw,h:Q.h,tilt:Q.tilt,ponds:false,seed:Q.seed}));
 SITE_RECS={slumps:S};
 const gAt=(x,z)=>{let g=g0(x,z),part=null;for(const R of S){const a=KRELIEF.at(R,x,z,g);if(a)part=a.part;g=KRELIEF.shape(R,x,z,g);}return {g,part};};
 // the pinnacles: a 40 m grid over the box, each cell's candidate hashed from (world, cell); kept on a block's front, never on the
 // head scarp, at least 45 m apart
 const T=SITE.pinnacles,N=Math.round(SITE.R*1.1/40);PINNACLES=[];
 for(let j=-N;j<=N&&PINNACLES.length<T.n;j++)for(let i=-N;i<=N&&PINNACLES.length<T.n;i++){const s=KRAND.stream(KRAND.hash(T.seed,i+512,j+512));
  if(s.next()>.35)continue;const x=i*40+s.range(-15,15),z=j*40+s.range(-15,15),q=gAt(x,z);if(q.part!=='front')continue;
  if(PINNACLES.some(B=>Math.hypot(B.x-x,B.z-z)<45))continue;
  let lo=q.g;for(let k=0;k<12;k++){const a=k/12*TAU;lo=Math.min(lo,gAt(x+Math.cos(a)*6,z+Math.sin(a)*6).g);}
  const H=s.range(T.H[0],T.H[1]),r=s.range(T.r[0],T.r[1]);
  const B=KSTACKS.make({id:'pinnacle'+PINNACLES.length,kind:'spire',x,z,y0:lo-1,seed:KRAND.hash(T.seed,i,j,7),H,r,e:s.range(1,1.6),ry:s.range(0,TAU),taper:s.range(.35,.55),lean:s.range(0,.06)});
  B.key='landform.pinnacle';B.col=[0x6a6058,0x4a4440];B.name='A landslip pinnacle (the slumped block\'s broken front, '+H.toFixed(0)+' m)';PINNACLES.push(B);}
 DIKES=PINNACLES.slice();
 TALUS=DIKES.length?KRELIEF.talus({bodies:DIKES,h:3,reach:10,seed:SITE.seed+7}):null;
 SITE_RECS.pinnacles=DIKES.map(B=>({id:B.id,x:B.x,z:B.z,y0:B.y0,top:B.top}));
 return SITE_RECS;}
// a point on a slump's crown at u (0..1 along it), just below the head scarp (the views)
function SITE_HEAD_AT(R,u){const P=R.pts,S=R.S,s=u*R.L;let i=0;while(i<P.length-2&&S[i+1]<s)i++;const a=P[i],b=P[i+1],k=(s-S[i])/(S[i+1]-S[i]),dx=b[0]-a[0],dz=b[1]-a[1],n=Math.hypot(dx,dz);
 const nx=-dz/n*R.side,nz=dx/n*R.side;return [a[0]+dx*k+nx*(R.face+40),a[1]+dz*k+nz*(R.face+40)];}
function SITE_DIKE_MID(){return [0,0];}
function siteApron(){return 0;}
function stairAt(){return null;}
// ---------------------------------------------------------------- one record a point (memo of the last): the height and each record's part
const _sp={x:NaN,z:NaN,P:null};
function sitePoint(x,z){if(x===_sp.x&&z===_sp.z)return _sp.P;const m=tarnBed(MODEL(x,z));let y=m+siteSwell(x,z),part='model',k=-1;
 for(const R of SITE_RECS.slumps){const a=KRELIEF.at(R,x,z,y);if(a){part=a.part;k=a.k;}y=KRELIEF.shape(R,x,z,y);}
 const tal=TALUS?TALUS(x,z):0;if(tal>.05){y+=tal;if(tal>1.5)part='talus';}
 let dk=null;const f=DIKES.length?KSTACKS.foot(DIKES,x,z):null;if(f&&f.d<.5){dk=f.S;part='dike';}
 const P={m,d:0,y,rel:y-m,part,block:k,tread:null,dike:dk?dk.id:null,dikeD:f?f.d:1e9,talus:tal};
 _sp.x=x;_sp.z=z;_sp.P=P;return P;}
function siteRelief(x,z){return sitePoint(x,z).rel;}
