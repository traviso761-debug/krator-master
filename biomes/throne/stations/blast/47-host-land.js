// ================================================================= HOST — the land, the fields, the binding (the blast zone)
// The flank, the scar and the pumice plain, the blast's fields the kit reads (cached), BIO.init.
const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:16,baseH:(x,z)=>BLAST.base,flows:[],old:THRONE.OLD});
const ageLabel=a=>a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the scar's horseshoe: a bowl open down the axis, its walls 80-160 m; the pumice plain: the flows' fill, near level, in a lobe down the axis
function scarAt(x,z){const dx=x-BLAST.x,dz=z-BLAST.z,d=Math.hypot(dx,dz),c=d>1?(dx*AX[0]+dz*AX[1])/d:1,open=smooth(.2,.75,c);
 const bowl=smooth(BLAST.r*1.05,BLAST.r*.55,d)*(1-open*.85),rim=Math.exp(-Math.pow((d-BLAST.r*1.08)/(BLAST.r*.16),2))*(1-open);return{bowl,rim,open};}
function plainAt(x,z){const dx=x-BLAST.x,dz=z-BLAST.z,along=dx*AX[0]+dz*AX[1],across=Math.abs(dx*AX[1]-dz*AX[0]);
 return smooth(150,BLAST.r*.6,along)*smooth(1900,1400,along)*smooth(BLAST.r*1.5+.25*along,BLAST.r*.9+.15*along,across);}
function terrainH0(x,z){const u=uOf(x,z),S=scarAt(x,z),pl=plainAt(x,z);
 let h=BLAST.base+BLAST.slope*u+30*(fbm(x*.0011,z*.0011,1311,3)-.5)+6*(fbm(x*.008,z*.008,1312,2)-.5);
 h+=-150*S.bowl+70*S.rim;   /* the horseshoe: the dome's place, hollowed; its walls standing */
 const fill=BLAST.base+BLAST.slope*uOf(BLAST.x,BLAST.z)-150+(uOf(x,z)-uOf(BLAST.x,BLAST.z))*.025;   /* the plain's own gentle fall */
 h=mix(h,Math.min(h,fill)+1.5*(fbm(x*.02,z*.02,1313,2)-.5),pl*.85);
 return h;}
function waterH(x,z){return -1e9;}   // no standing water: the streams were buried (the owner's plan has none yet)

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The caldera's names, so its ground (84) reads them: floor (the pumice plain), wall (the blasted ash), rim (the scar's walls); the station's
// own: blast (BLAST.at), direct, removal, blowdown, seared (the zones), live. The kit's: cbelt (the living forest: its conifers and gill-
// corals), deathzone and barren (no trees where the blast stripped them; the cold pass plants only lichen), tundra (the pioneers on the ash)
function fieldsAt(x,z,h,slope){const B=BLAST.at(x,z),S=scarAt(x,z),pl=plainAt(x,z),steep=smooth(.45,.8,slope);
 const direct=smooth(.68,.82,B),removal=smooth(.48,.6,B)*(1-direct),blowdown=smooth(.26,.36,B)*(1-smooth(.48,.6,B)),seared=smooth(.12,.2,B)*(1-smooth(.26,.36,B)),live=1-smooth(.1,.18,B);
 const rock=clamp(Math.max(steep,S.rim*.8,S.bowl*.6),0,1);
 return{wet:.25,flow:0,upland:.6,canyon:0,rim:S.rim,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:.3,geo:0,barren:1-live,humid:0,plume:0,
  vent:0,acid:0,cinder:0,skylight:0,ash:1-live,owned:1,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path:0,
  wall:(1-live)*(1-pl),floor:pl,lake:0,pen:0,warm:0,deathzone:smooth(.3,.6,1-live),cbelt:live*(1-steep*.6),tundra:(1-live)*(.25+.35*(1-rock))*(1-pl*.5),snow:0,out:1,
  blast:B,direct,removal,blowdown,seared,live};}
const FNAMES=['blast','direct','removal','blowdown','seared','live','wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','wall','floor','lake','pen','warm','deathzone','cbelt','tundra','snow','out'];
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
// nothing roots in the scar's bowl's steep walls beyond the kit's own lichen: the mask is open, the passes read the fields
let MASK=(x,z)=>1;
// the LOD spine: the cameras' places (the blowdown, the scar, the seared edge, the living forest)
const BD=(function(){let b={x:0,z:0,v:-1};for(let z=-1800;z<=1800;z+=60)for(let x=-1800;x<=1800;x+=60){const v=FIELD.blowdown(x,z)-Math.hypot(x,z)*.0002;if(v>b.v)b={x,z,v};}return b;})();
const SPINE=[[BD.x,BD.z],[BLAST.x,BLAST.z-700],[-1700,-1400],[1600,-1500],[0,-200]];BIO.init({tags:'throne-blast',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:53,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:700,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
// the living forest only where the field says it stands: the kit's passes ask the host (55, THRONE.veto) after a tree's draws
THRONE.veto=T=>FIELD.live(T.x,T.z)<.5;
