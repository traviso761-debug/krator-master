// ================================================================= HOST — the land, the fields, the binding (the lee's penitentes)
// The flank's benches (treads of snow, rock steps), the fields the kit reads (cached), BIO.init.
const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:16,baseH:(x,z)=>FLANK.top,flows:[],old:THRONE.OLD});
const ageLabel=a=>a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the flank in benches: each tread near level (a slight fall east), each front a rock step (B.riser), the steps' rock ribbed; gentle swells along
function terrainH0(x,z){const B=benchAt(x,z),s=(benchU(x,z)+TERR.R*1.2)/FLANK.tread,stair=(B.i+smooth(.74,.98,B.f))*FLANK.step,lean=(s-B.i)*FLANK.step*.12;
 return FLANK.top-FLANK.slope*TERR.R*1.2*1.02+stair+lean+18*(fbm(x*.0012,z*.0012,1402,3)-.5)+B.riser*14*(ridged(x*.01,z*.05,1403)-.5)+2.5*(fbm(x*.02,z*.02,1404,2)-.5);}
function waterH(x,z){return -1e9;}   // no water: the snow is solid, the melt sublimates

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The caldera's names, so its ground (84) reads them: rim (here the benches' rock steps), wall, floor, lake 0; pen (the penitentes'
// snow on the treads), snow (EF, giving out toward the snowline at the map's east), tundra (lichen and cushions on the bare ground below it),
// warm 0 (no vents). cbelt 0: the kit's cold pass draws its lichen only
function fieldsAt(x,z,h,slope){const B=benchAt(x,z),n=fbm(x*.004,z*.004,1405,2),steep=smooth(.45,.8,slope);
 const snow=clamp(smooth(FLANK.snowline-80,FLANK.snowline+180,h)*(.95-.6*steep-.35*B.riser)+.1*(n-.5),0,1);
 const pen=snow*(1-B.riser)*(1-smooth(.16,.3,slope))*smooth(.38,.55,n+.15*(fbm(x*.02,z*.02,1406,2)-.5))*smooth(FLANK.snowline+60,FLANK.snowline+260,h);
 const rock=clamp(Math.max(steep,B.riser*.9),0,1);
 return{wet:.05,flow:0,upland:1,canyon:0,rim:B.riser,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:1,geo:0,barren:Math.max(pen,rock*.6),humid:0,plume:0,
  vent:0,acid:0,cinder:0,skylight:0,ash:0,owned:1,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path:0,
  wall:0,floor:0,lake:0,pen,warm:0,deathzone:1,cbelt:0,tundra:(1-snow)*clamp(.35+.5*(1-rock),0,1)*.6+rock*(1-snow)*.3,snow,out:1};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','wall','floor','lake','pen','warm','deathzone','cbelt','tundra','snow','out'];
const FC=(function(){const N=600,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));_mark('fields');

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// nothing roots on a tread's penitentes (the snow) beyond the kit's own lichen: the mask is open, the passes read the fields
let MASK=(x,z)=>1;
// the LOD spine: across the map along three benches, and the penitentes' best patch
// the LOD spine: the cameras' places only (the penitentes are drawn round it: across the whole map they were 27M triangles)
const SPINE=[[1700,300],[-1200,-200],[1500,-900],[400,-600]];
{let b={x:0,z:0,v:0};for(let z=-1600;z<=1600;z+=40)for(let x=-1600;x<=1200;x+=40){const v=FIELD.pen(x,z)-Math.hypot(x+300,z)*.0002;if(v>b.v)b={x,z,v};}Object.assign(PEN,b);}
SPINE.push([PEN.x,PEN.z]);BIO.init({tags:'throne-penitentes',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:54,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:700,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
