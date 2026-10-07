// ================================================================= HOST — the land, the fields, the binding (the caldera rim)
// The rim (its crest ragged, its peaks), the plateau falling gently away behind it, the wall terraced down to the floor, the
// floor's cones, the lake's pit. The fields the kit reads (cached), BIO.init.
const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:16,baseH:(x,z)=>CAL.rim,flows:[],old:THRONE.OLD});
const ageLabel=a=>a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('stage');
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
function coneAt(x,z){let h=0,k=0;for(const C of CONES){const d=Math.hypot(x-C.x,z-C.z)/C.r;if(d>1.4)continue;h=Math.max(h,C.h*Math.pow(smooth(1,.4,d),.9)-C.h*.5*smooth(.42,.15,d));k=Math.max(k,smooth(1.2,.85,d));}return{h,k};}
// the wall's profile from the crest (t 0) to its foot (t 1): terraced by its old collapses
const wallP=t=>clamp(t+.085*Math.sin(t*TAU*2.5),0,1);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){const r=calR(x,z),a=calA(x,z),cr=crestR(a),pk=peakH(a),n=fbm(x*.002,z*.002,113,3)-.5;let h;
 if(r>=cr){const e=r-cr;h=CAL.rim+pk*Math.exp(-Math.pow(e/150,2))+30*ridged(x*.008,z*.008,114)*Math.exp(-Math.pow(e/260,2))-e*.07+22*n+5*(fbm(x*.02,z*.02,115,2)-.5);}
 else{const t=clamp((cr-r)/(cr-CAL.foot),0,1),p=Math.pow(wallP(t),.85);
  h=mix(CAL.rim+pk,CAL.floor,p)+(1-p)*p*60*(ridged(a*9,r*.02,116)-.5)+3*(fbm(x*.03,z*.03,117,2)-.5);
  if(r<CAL.foot+20){h+=coneAt(x,z).h+5*(fbm(x*.01,z*.01,118,2)-.5)*smooth(CAL.foot,CAL.foot-200,r);}}
 // the lake's pit: steep walls down to the lava, a spatter lip round it
 const dl=LAKE.de(x,z);if(dl<LAKE.r*1.35){h+=3.5*Math.exp(-Math.pow((dl-LAKE.r*1.12)/(LAKE.r*.06),2));h=mix(h,LAKE.level-5,smooth(LAKE.r*1.07,LAKE.r*.99,dl));}
 return h;}
function waterH(x,z){return -1e9;}   // no water up here: the lake is lava (86 draws it); the snow is solid

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md), the station's own: rim (the crest and its peaks), wall, floor, lake, pen (the
// penitentes' snowfield), warm (by the fumaroles: the warm living spots), and the kit's cold ones: tundra (lichen on the
// rim's rocks), warm, snow; cbelt 0 (no woods: the kit's cold pass runs, only its lichen and its warm ground). owned 1: the
// kit's open stages stand down
function warmAt(x,z){let w=0;for(const F of FUMS)w=Math.max(w,F.s*Math.exp(-Math.pow(Math.hypot(x-F.x,z-F.z)/(F.rim?28:36),2)));return clamp(w,0,1);}
function fieldsAt(x,z,h,slope){const r=calR(x,z),a=calA(x,z),cr=crestR(a),out=smooth(cr-10,cr+30,r),warm=warmAt(x,z);
 const dl=LAKE.de(x,z),lake=smooth(LAKE.r*1.02,LAKE.r*.97,dl),floor=smooth(CAL.foot+60,CAL.foot-40,r),wall=(1-out)*(1-floor);
 const rim=Math.exp(-Math.pow((r-cr)/120,2)),steep=smooth(.55,.85,slope),n=fbm(x*.004,z*.004,119,2);
 // the snow: deep on the plateau, thinner on the crest's rock, little down the hot wall, none on the floor
 const snow=clamp(out*(.9-.55*steep-.3*rim*smooth(.4,.7,n))+wall*.35*smooth(cr-CAL.foot,0,cr-r)*(1-steep*.7),0,1)*(1-warm*.9);
 const pen=out*smooth(cr+170,cr+420,r)*(1-smooth(.18,.32,slope))*smooth(.42,.6,n+.15*(fbm(x*.02,z*.02,120,2)-.5));
 const rock=clamp(Math.max(steep,rim*.6,wall*.8,floor*.5),0,1);
 return{wet:.1,flow:0,upland:1,canyon:0,rim:rim,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:1,geo:warm,barren:Math.max(lake,floor*.9,wall*.7,pen),humid:0,plume:0,
  vent:0,acid:0,cinder:0,skylight:0,ash:0,owned:1,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path:0,
  wall,floor,lake,pen,warm,deathzone:1,cbelt:0,tundra:out*rock*(1-snow)*.35,snow,out};}
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
// nothing roots in the lake, on the floor's hot lava, or on a tower's foot
let MASK=(x,z)=>{if(calR(x,z)<CAL.foot+30)return 0;return 1;};
// the LOD spine: along the crest, the lake, the plateau behind
const SPINE=[];for(let a=Math.PI-1.1;a<=Math.PI+1.1;a+=.22){const r=crestR(a);SPINE.push([CAL.x+Math.cos(a)*r,CAL.z+Math.sin(a)*r]);}
// the penitentes' best patch (the cameras' and the detail's): the highest 'pen' on the plateau, well inside the map, toward the rim
const PEN=(function(){let b={x:-1300,z:0,v:0};for(let z=-2000;z<=2000;z+=40)for(let x=-2300;x<=200;x+=40){if(Math.hypot(x,z)>1700)continue;const v=FIELD.pen(x,z)-Math.hypot(x+900,z)*.0002;if(v>b.v)b={x,z,v};}return b;})();
SPINE.push([LAKE.x,LAKE.z],[-900,-200],[-1500,600],[-1300,-900],[PEN.x,PEN.z]);
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:50,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:700,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
