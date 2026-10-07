// ================================================================= HOST — the land (after the lava), the layout, the fields, the binding (the frontier)
// Two old flows (46): a headland where one met the sea in the south, an older sheet in the north. Then the frontier's
// layout as DATA (the road, the natives' trails), the terraces cut into the fields, the sea and the streams, the fields
// the kits read, and BIO.init with a mask the build swaps per kit (88).
const FLOW_SRC=(function(){const S=(key,name,u,p,o)=>{const c=xzOf(u,p);return Object.assign({key,name,x:c[0],z:c[1]},o);};
 return[
  S('headland','The headland flow (it met the sea and stopped as a cliff)',2700,1480,{age:4200,len:5200,w:[380,520],th:[10,14],veer:-.05,wander:.25,seed:9301}),
  S('north','An old flow in the north',2700,-1900,{age:1600,len:3600,w:[300,480],th:[6,9],veer:.1,wander:.35,seed:9302}),
 ];})();
_mark('stage');const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:8,baseH:landH0,flows:FLOW_SRC,old:THRONE.OLD});
const ageLabel=a=>a<1.5?Math.round(a*12)+' months':a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';

_mark('flows');
// ---------------------------------------------------------------- the layout: the road and the trails (data first)
// THE ROAD: the colonists' cart road from the city up the spur between the valleys to the high fields
// THE TRAILS: the natives' foot paths out of the forest, down to the plantations' edges (where the traps are: 86)
// Each a polyline of [x,z]; kind and owner are what the life layer will read (README.md: rules as data)
reseed(4741);
const ROAD={kind:'road',owner:'the colonists (Voth)',width:3.2,pts:(function(){const P=[];for(let u=-1180;u<=380;u+=40){const p=-240+70*Math.sin(u*.004)+25*Math.sin(u*.013);P.push(xzOf(u,p));}return P;})()};
const TRAILS=(function(){const out=[];
 // a trail from the forest high up (u0,p0) down toward a field's top edge or flank, wandering
 const mk=(u0,p0,F,side)=>{const tu=side==='top'?F.u[1]+3:mix(F.u[0],F.u[1],rr(.3,.8)),tp=side==='top'?mix(F.p[0],F.p[1],rr(.25,.75)):(side==='n'?F.p[0]-3:F.p[1]+3);
  const P=[],n=60;let u=u0,p=p0;for(let k=0;k<=n;k++){const t=k/n;const tu2=mix(u0,tu,t),tp2=mix(p0,tp,t),w=40*Math.sin(t*Math.PI)*(fbm(t*4+u0*.01,p0*.01,4742,2)-.5)*2;
   P.push(xzOf(tu2+w*.3,tp2+w));}
  return{kind:'trail',owner:'the natives',width:1.1,end:F.i,pts:P};};
 out.push(mk(2400,-700,FIELDS[5],'top'),mk(2300,-200,FIELDS[2],'top'),mk(2400,900,FIELDS[6],'top'),mk(1900,1500,FIELDS[4],'s'),
  mk(1700,-1600,FIELDS[7],'top'),mk(2000,-1150,FIELDS[0],'n'),mk(1500,1200,FIELDS[3],'s'));
 return out;})();
// rasterised onto a 4 m grid: the distance (m) to the nearest path, and which kind
const PATHGRID=(function(){const cs=4,N=Math.ceil(TERR.R*2.2/cs),x0=-TERR.R*1.1,d=new Float32Array(N*N).fill(99),k=new Uint8Array(N*N);
 const stamp=(P,w,kind)=>{for(let i=1;i<P.length;i++){const a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/2);
  for(let s=0;s<=n;s++){const x=mix(a[0],b[0],s/n),z=mix(a[1],b[1],s/n),r=Math.ceil((w+6)/cs),ci=Math.round((x-x0)/cs),cj=Math.round((z-x0)/cs);
   for(let j=cj-r;j<=cj+r;j++)for(let ii=ci-r;ii<=ci+r;ii++){if(ii<0||j<0||ii>=N||j>=N)continue;const dd=Math.hypot(x0+ii*cs-x,x0+j*cs-z)-w;const q=j*N+ii;if(dd<d[q]){d[q]=dd;k[q]=kind;}}}}};
 stamp(ROAD.pts,ROAD.width,2);TRAILS.forEach(T=>stamp(T.pts,T.width,1));
 const at=(x,z)=>{const i=Math.round((x-x0)/cs),j=Math.round((z-x0)/cs);if(i<0||j<0||i>=N||j>=N)return{d:99,k:0};const q=j*N+i;return{d:d[q],k:k[q]};};
 return{at};})();

// ---------------------------------------------------------------- the land, cut: the terraces, the city's spur
function terraceAt(u,p,h){const f=fieldAt(u,p);if(!(f.v>0)||f.F.kind==='clear')return{h,riser:0};
 // each terrace a level tread and a steep riser: the height quantised, the riser eased over ~3 m
 const q=h/TERRACE,fl=Math.floor(q),fr=q-fl,ht=(fl+smooth(.82,1,fr))*TERRACE;return{h:mix(h,ht,f.v),riser:f.v*smooth(.7,.9,fr)*smooth(1,.92,fr)};}
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// the ground before the terraces are cut (the riser test reads it)
function preH(x,z){let h=landH0(x,z);const th=FLOWS.thickAt(x,z);h+=th;
 const fl=smooth(.4,2.2,th);if(fl>0)h+=fl*.35*(1.5*ridged(x*.045,z*.045,4711)+.6*(fbm(x*.17,z*.17,4712,2)-.5)-.6);
 // the city's spur levelled a little (a settlement build re-grades it)
 const dc=Math.hypot(x-CITY.x,z-CITY.z);if(dc<CITY.r*1.2){const hc=flankH(CITY.u,CITY.p)+1;h=mix(h,Math.max(h-6,Math.min(h+4,hc)),smooth(CITY.r*1.2,CITY.r*.8,dc));}
 return h;}
const riserAt=(x,z)=>terraceAt(uOf(x,z),pOf(x,z),preH(x,z)).riser;
function terrainH0(x,z){const u=uOf(x,z),p=pOf(x,z);let h=terraceAt(u,p,preH(x,z)).h;
 // the road and the trails: a shallow worn bed
 const pg=PATHGRID.at(x,z);if(pg.d<2)h-=(pg.k===2?.35:.15)*smooth(2,-.5,pg.d);
 return h;}
// THE WATER: the sea (wherever the ground is under its level); the valleys' streams on their beds
function streamLevel(u,V){const c=V.p+V.amp*Math.sin(u*V.f+V.ph),q=xzOf(u,c);return terrainH0(q[0],q[1])+.4;}
function waterH(x,z){if(terrainH(x,z)<SEA+.3)return SEA;
 const u=uOf(x,z),p=pOf(x,z);for(const V of VALLEYS){const g=valleyD(u,p,V);if(g.d<6+3*Math.sin(u*.03))return Math.max(SEA,streamLevel(u,V));}return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md), and the frontier's: field (a plantation's ground), clear (a fresh
// clearing), coast (the shore's strip), edge (the forest's margin at a clearing: the natives' poison gardens), owned (the
// forest: the hyperjungle's ground), city, path (the road and the trails: nothing grows on them)
function fieldsAt(x,z,h,slope){const u=uOf(x,z),p=pOf(x,z),va=valleyAt(u,p),fa=fieldAt(u,p),d=u-shoreU(p),pg=PATHGRID.at(x,z);
 const fieldV=fa.F&&fa.F.kind!=='clear'?fa.v:0,clearV=fa.F&&fa.F.kind==='clear'?fa.v:0;
 // the edge: just outside any field or clearing (within ~35 m), not on the shore
 let near=0;for(const F of FIELDS)near=Math.max(near,fieldIn(u,p,F,-35)*(1-fieldIn(u,p,F)));
 const city=smooth(CITY.r*1.1,CITY.r*.9,Math.hypot(x-CITY.x,z-CITY.z)),coast=smooth(200,60,d)*smooth(-3,3,h-SEA),path=smooth(1.5,-.5,pg.d);
 const edge=near*(1-coast)*(1-city);
 const owned=(1-coast)*(1-city)*(1-fieldV)*(1-clearV)*(1-va.bank*.95)*(1-path)*(1-smooth(.15,.5,edge))*smooth(150,260,d);
 const th=FLOWS.thickAt(x,z),rock=clamp(Math.max(smooth(.62,.92,slope)*smooth(.5,2,th),smooth(.7,.95,slope)*.7,riserAt(x,z)*.8),0,1);
 return{wet:clamp(.82+.15*va.bank,0,1),flow:va.bank,upland:0,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:0,geo:0,barren:city,
  humid:1,plume:0,vent:0,acid:0,cinder:0,skylight:0,ash:0,owned,kedge:0,knear:0,field:fieldV,clear:clearV,coast,edge,city,path};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path'];
const FC=(function(){const N=560,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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
// THE MASK: nothing roots in the water, on a path, in the city's footprint, or (for the Throne kit) between a field's rows
// (86 plants those); the hyperjungle only in the forest (owned)
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:(d-.15)/.55;}
 // the paths read from their 4 m raster (the 9 m field cache blurs a 1 m trail away)
 return smooth(-.2,.8,PATHGRID.at(x,z).d)*(1-smooth(.4,.8,FIELD.city(x,z)));};
const forestMask=(x,z)=>smooth(.45,.8,FIELD.owned(x,z))*waterMask(x,z);
let MASK=waterMask;
// the LOD spine: the city, the fields, the road, the trails' ends, the bay
const SPINE=[[CITY.x,CITY.z]];
FIELDS.forEach(F=>SPINE.push([F.x,F.z]));
for(let i=0;i<ROAD.pts.length;i+=8)SPINE.push(ROAD.pts[i]);
TRAILS.forEach(T=>{SPINE.push(T.pts[T.pts.length-1],T.pts[Math.floor(T.pts.length*.75)]);});
{const b=xzOf(BAY.u,BAY.p);SPINE.push(b);}
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:41,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:280,mid:760,far:2400,floor:[250,620]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
