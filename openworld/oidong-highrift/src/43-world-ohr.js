// ================================================================= THE OIDONG VALLEY AND THE HIGH RIFT — the fields the kits read
// [G data] The fields this region's kits read that the world does not make (as openworld/xanadu-oidong-highrift's 43 adds them):
//   flat   the Oidong kit's pale flats (biomes/oidong/src/55: its `flats` zone and the cloud pines, peyote and stone-blooms
//          on it). Set gently on dry low-slope valley fans so standing stones and cloud pines appear without displacing woods.
//   hrheat, hracid, hrgrass   the High Rift kit's ground temperature (degC), acid ground (0..1) and tussock share: 0 on
//          the world's ground (the kit grows only on the floor's patches), set by its floor profiles (49-world-highrift.js)
// Also adapts open-world moisture (`wet`), valley-relative `upland`, and cataract/gorge `mist` where the Oidong kit grows
// (both the enclosed snowmelt-fed Oidong Valley floor and Strongbow's humid Xanadu canyon floor below the terminal cliff),
// while keeping cold alpine passes and the High Rift (> 3,300 m) treeless.
(function(){'use strict';
const EXTRA={flat:0,hrheat:0,hracid:0,hrgrass:0};
for(const k in EXTRA)if(WORLD.FIELDS.indexOf(k)<0)WORLD.FIELDS.push(k);
const cl=(v,a,b)=>v<a?a:v>b?b:v,sm=(a,b,x)=>{const t=cl((x-a)/(b-a),0,1);return t*t*(3-2*t);};
let KO=null;
const kw=WORLD.kitW;
function xanaduCanyonW(x,z){
 if(x<-626000||x>-606000||z<-128000||z>-20000)return 0;
 let s=0;const offs=[[-900,-900],[900,-900],[-900,900],[900,900]];
 for(let i=0;i<4;i++){const b=WORLD.biomeAt(x+offs[i][0],z+offs[i][1]);if(b&&String(b.name).toLowerCase()==='xanadu')s+=.25;}
 return s*sm(-626000,-619000,x);}
WORLD.kitW=function(k,x,z){
 if(KO===null&&typeof WORLD_KITS!=='undefined')KO=WORLD_KITS.findIndex(q=>q.name==='oidong');
 let w=kw.call(WORLD,k,x,z);
 if(k===KO){
  const xw=xanaduCanyonW(x,z);if(xw>w)w=xw;
  if(w>0){const hb=WORLD.Hbare?WORLD.Hbare(x,z):WORLD.H(x,z),tp=WORLD.temp?WORLD.temp(x,z):8;
   w*=sm(3420,3120,hb)*sm(-1.5,3.0,tp);}}
 return w;};
function adaptOidong(x,z,A){
 for(const k in EXTRA)if(A[k]==null)A[k]=EXTRA[k];
 if(KO===null&&typeof WORLD_KITS!=='undefined')KO=WORLD_KITS.findIndex(q=>q.name==='oidong');
 if(KO==null||KO<0)return A;
 const ow=WORLD.kitW(KO,x,z);if(!(ow>.01))return A;
 const h=A.h,sl=A.slope,rn=A.rain==null?600:A.rain;
 const rip=Math.max(A.flow==null?0:A.flow,(A.canyon==null?0:A.canyon)*.85,A.water>-1e8?sm(55,0,h-A.water):0);
 const vf=(1-sm(.32,.72,sl))*sm(3250,2450,h);
 const wVal=cl(.50+.28*sm(220,900,rn)+.24*rip+.12*vf,0,1);
 A.wet=A.wet+(Math.max(A.wet,wVal)-A.wet)*ow;
 const upBand=h<1350?sm(320,1220,h):sm(2350,3220,h);
 const uVal=cl(.66*upBand+.34*sm(.18,.58,sl),0,1);
 A.upland=A.upland+(uVal-A.upland)*ow;
 const dCat=Math.hypot(x+610160,z+71668),dSb=Math.hypot(x+610400,z+76000);
 const mVal=Math.max(1-sm(350,2600,dCat),(1-sm(400,2000,dSb))*sm(650,250,h),(A.canyon==null?0:A.canyon)*.55*sm(650,1200,rn));
 A.mist=Math.max(A.mist==null?0:A.mist,mVal*ow);
 A.flat=Math.max(A.flat==null?0:A.flat,ow*(1-sm(.07,.20,sl))*sm(520,250,rn)*(1-rip)*.52);
 return A;}
const ff=WORLD.fieldsFrom;
WORLD.fieldsFrom=function(x,z,h,tanS,P,out){return adaptOidong(x,z,ff.call(WORLD,x,z,h,tanS,P,out));};
const at=WORLD.atShared;
WORLD.atShared=function(x,z){return adaptOidong(x,z,at.call(WORLD,x,z));};   /* WORLD.at copies it (core/world 41) */
WORLD.OHR_FIELDS=Object.keys(EXTRA);})();
// The High Rift's ground (as openworld/xanadu-oidong-highrift's 43 greens the Xanadu overlay), plus lush moss-vale tinting
// where the Oidong Valley & Strongbow canyon floor carry woodland moisture.
(function(){'use strict';
let KX=null,KO=null;
const lin=h=>{const f=c=>c<.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);return[f((h>>16&255)/255),f((h>>8&255)/255),f((h&255)/255)];};
const DRY=lin(0xa89a6a),MEAD=lin(0x8a8a62),LUSH=lin(0x667a5a),ALP=lin(0x8c8a7c),REF=lin(0xa85a42);
const VALE_MEAD=lin(0x6f8d4e),VALE_MOSS=lin(0x4b6b35);
const REFS=REF[0]+REF[1]+REF[2],sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const mix=(o,c,t)=>{o[0]+=(c[0]-o[0])*t;o[1]+=(c[1]-o[1])*t;o[2]+=(c[2]-o[2])*t;},T=[0,0,0];
const g=WORLD.ground;
WORLD.ground=function(x,z,S,out){g.call(WORLD,x,z,S,out);
 if(KX===null)KX=WORLD_KITS.findIndex(k=>k.name==='highrift');
 if(KO===null)KO=WORLD_KITS.findIndex(k=>k.name==='oidong');
 const rd=S.road==null?0:S.road,snow=S.temp<2?sm(2,-6,S.temp)*sm(.75,.45,S.slope):0;
 if(KO>=0){const ow=WORLD.kitW(KO,x,z);
  if(ow>0){const ok=ow*(1-S.rock*.85)*(1-rd)*(1-S.salt)*(1-snow)*sm(.42,.75,S.wet)*.52;
   if(ok>0){T[0]=VALE_MEAD[0];T[1]=VALE_MEAD[1];T[2]=VALE_MEAD[2];mix(T,VALE_MOSS,sm(.62,.86,S.wet));
    out[0]+=(T[0]-out[0])*ok;out[1]+=(T[1]-out[1])*ok;out[2]+=(T[2]-out[2])*ok;}}}
 if(KX<0)return out;const xw=WORLD.kitW(KX,x,z);if(!(xw>0))return out;
 const k=xw*(1-S.rock*.85)*(1-S.flow*.45)*(1-rd)*(1-S.salt)*(1-snow)*.88;if(!(k>0))return out;
 const moist=sm(.1,.48,S.wet);
 T[0]=DRY[0];T[1]=DRY[1];T[2]=DRY[2];mix(T,MEAD,moist);mix(T,LUSH,sm(.6,1,moist)*.7);mix(T,ALP,sm(9,0,S.temp)*.6);
 const f=Math.min(1.3,Math.max(.7,(out[0]+out[1]+out[2])/REFS));
 out[0]+=(T[0]*f-out[0])*k;out[1]+=(T[1]*f-out[1])*k;out[2]+=(T[2]*f-out[2])*k;
 return out;};})();
