// ================================================================= HOST — the land with the thermal ground, the water, the fields, the binding (every station)
// THE THERMAL GROUND is the geyser kit's (biomes/geyser, read in place: BIOME-API.md): the station's layout (SITE.thermal) is handed its ground (landH,
// before the relief), its sink (the tarn, the river), the plume's wind and its sinter steps' mask, and GEYSER.lay records it. The land is landH plus the
// kit's relief (the shields, the cones' mounds, the springs' bowls, the steps); the springs brim at their rims on exactly that land.
// THE HEAT between the vents is core/terrain's KTHERM (47-core-therm.js): every spring, geyser, fumarole and acid field a vent record, the station's soil
// its mean temperature; the ground, the snow's bare patches, the hazards and the flora all read the one field.
const WIND=[.7071,.7071];   /* the plume's way (PLAN.md section 1: south-east, 135 deg) and the steam's lean */
const THERMAL=SITE.thermal?(function(){const T=Object.assign({},SITE.thermal);T.ground=landH;T.wind=WIND;
 T.sink=(x,z)=>landH(x,z)<LEVEL+.35||(RIVER&&RBK.at(x,z).d<2);
 /* the sinter steps: a capsule from the spring down to the water, over the ground between the water's edge and 9 m above it */
 if(T.terraces&&T.terraces.length&&SITE.steps){const St=SITE.steps,a=St.a,b=St.b,dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),w=St.w;
  const capD=(x,z)=>{const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(L*L),0,1);return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);};
  T.terraces=T.terraces.map(t=>Object.assign({},t,{across:[-dz/L,dx/L],seaB:LEVEL+.6,minL:LEVEL+.9,outfalls:0,
   mask:(x,z)=>{const h=landH(x,z);return smooth(w,w*.7,capD(x,z))*smooth(LEVEL+.2,LEVEL+.8,h)*smooth(LEVEL+9,LEVEL+6,h);},
   box:[Math.min(a[0],b[0])-w,Math.min(a[1],b[1])-w,Math.max(a[0],b[0])+w,Math.max(a[1],b[1])+w]}));}
 else T.terraces=[];
 return T;})():null;
const LAYOUT=THERMAL?GEYSER.lay(THERMAL):null;
// the thermal ground's box (every record and its reach), so terrainH asks the kit only near it
const TBOX=LAYOUT?(function(){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;const add=(x,z,r)=>{x0=Math.min(x0,x-r);z0=Math.min(z0,z-r);x1=Math.max(x1,x+r);z1=Math.max(z1,z+r);};
 LAYOUT.geysers.forEach(g=>add(g.x,g.z,g.mound.r*1.5+g.sprayR));LAYOUT.springs.forEach(s=>add(s.x,s.z,s.r+s.apron*2+(s.shield?s.r*1.6:0)));
 LAYOUT.flats.forEach(f=>add(f.x,f.z,Math.max(f.rx,f.rz)*1.3));LAYOUT.dead.forEach(d=>add(d.x,d.z,d.r*1.3));LAYOUT.acid.forEach(a=>add(a.x,a.z,a.r*1.4));
 LAYOUT.fumaroles.forEach(f=>add(f.x,f.z,9));LAYOUT.terraces.forEach(t=>{add(t.box[0],t.box[1],10);add(t.box[2],t.box[3],10);});
 LAYOUT.runoff.forEach(c=>c.P.forEach(p=>add(p[0],p[1],14)));return[x0,z0,x1,z1];})():null;
const nearT=(x,z)=>TBOX!==null&&x>TBOX[0]&&x<TBOX[2]&&z>TBOX[1]&&z<TBOX[3];
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const b=landH(x,z),h=nearT(x,z)?b+GEYSER.relief(x,z,b):b;_tm.x=x;_tm.z=z;_tm.h=h;return h;}
// THE WATER: the tarn (inside the model's basin, and not down a river's cut: a gorge whose bed is under the tarn's level is the river's, past the
// river's first 80 m), the river, the kit's springs, pots and steps' pools
const inRiverCut=(x,z)=>{if(!RIVER)return false;const r=RBK.at(x,z);return r.s>80&&r.d<(RIVER.gorge?RIVER.gorge.reach:60);};
const inBasin=(x,z)=>!!SITE.tarn&&MODEL.h(x,z)<LEVEL+30&&!inRiverCut(x,z);
function waterH(x,z){let w=-1e9;
 if(SITE.tarn&&inBasin(x,z)&&terrainH(x,z)<LEVEL+.05)w=LEVEL;
 if(RIVER){const r=RBK.at(x,z);if(r.d<0&&(r.y>w||r.s>80))w=r.y;}
 if(nearT(x,z)){const t=GEYSER.waterAt(x,z,landH(x,z));if(t>w)w=t;}
 return w;}
// THE HEAT (KTHERM): the soil the station's mean, every vent of the layout a point record
const SOIL=MODEL.clim.tm==null?10:MODEL.clim.tm;
const THERM=(function(){const V=[];if(LAYOUT){
  LAYOUT.springs.forEach(s=>V.push({id:'spring:'+s.key,kind:'point',x:s.x,z:s.z,T:s.Tc,reach:s.r*2.2+s.apron,decay:2.5}));
  LAYOUT.geysers.forEach(g=>V.push({id:'geyser:'+g.key,kind:'point',x:g.x,z:g.z,T:94,reach:g.mound.r*1.6,decay:2.5}));
  LAYOUT.acid.forEach(a=>V.push({id:'acid:'+a.key,kind:'point',x:a.x,z:a.z,T:82,reach:a.r*1.5,decay:1.8}));
  LAYOUT.fumaroles.forEach((f,i)=>V.push({id:'fumarole:'+i,kind:'point',x:f.x,z:f.z,T:92,reach:10+14*f.s,decay:3}));}
 (SITE.vents||[]).forEach((v,i)=>V.push(Object.assign({id:'vent:'+i,kind:'point'},v)));   /* a station's own (Mons' crater: warm ground under the ice) */
 return KTHERM.create({soil:SOIL,vents:V,detail:{amp:1.2,scale:.02,seed:4471},world:4470});})();
const THERM_F=THERM.bake({box:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],cell:8});
const heatAt=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's (biomes/WORLD.md) and the kit's own. What Copper Glacier's passes read (read in place: ice, moraine, snow, copper, flat, cave, shore, wet,
// rock, slope, cold) and what this kit's do: floor (the warm valley floor: 1 under the meadow's top), meadow, grove (the lee band the pines take),
// ash (the ash slopes above the floor), therm (the ground's heat over the soil: 0 at the soil, 1 at 60 degC over it), tarn (the open water), hollow.
const FL=SITE.floor||[0,0];
function fieldsAt(x,z,h,slope){const w=waterH(x,z),under=w>-1e8&&h<w+.15?1:0,r=RIVER?RBK.at(x,z):{d:1e9};
 const T=heatAt(x,z),therm=clamp((T-SOIL)/60,0,1),n=fbm(x*.004,z*.004,95,2),n2=fbm(x*.02,z*.02,96,2),n3=fbm(x*.0015,z*.0015,97,2);
 const steep=smooth(.55,.85,slope),rel=SITE.tarn?h-LEVEL:0;
 const floor=SITE.tarn?smooth(FL[1]+40,FL[1]-40,rel):0;
 const meadow=SITE.tarn?smooth(FL[0]+30,FL[0]-30,rel)*(1-under):0;
 const grove=SITE.tarn?smooth(FL[0]-50,FL[0]+10,rel)*smooth(FL[1]+30,FL[1]-30,rel)*smooth(.4,.58,n3+.25*n):0;
 const ice=SITE.iceAt?SITE.iceAt(x,z,h,T):0;
 const sl=SITE.snowLine,snowH=smooth(sl[0],sl[1],h);
 const snow=clamp(Math.max(ice*.8,snowH*(.9-.55*steep)+.25*(n-.5))*(1-under)*smooth(SOIL+14,SOIL+4,T),0,1);   /* none on warm ground (the vents' bare patches) */
 const rock=clamp(Math.max(steep,(1-floor)*smooth(.42,.62,slope)*.9),0,1);
 const ash=(1-floor)*(1-under)*(1-ice)*(1-steep*.6);
 const moraine=clamp((1-floor)*smooth(.22,.45,slope)*(1-steep)*.8+(SITE.moraine?SITE.moraine(x,z,h):0),0,1);
 const flat=(1-rock)*(1-under)*(1-floor)*smooth(.25,.06,slope)*smooth(2900,3100,h)*(1-ice);
 const shore=Math.max(smooth(30,2,r.d),w>-1e8&&!under?smooth(1.5,0,h-w):0);
 const cold=SITE.coldAt?SITE.coldAt(x,z,h,T):clamp((rel-FL[1])/900,0,1)*(1-therm);
 const wet=clamp(.3+.5*shore+.35*floor*(n2-.2)+.2*therm-.3*rock-.2*steep+.12*(MODEL.clim.rain>1100?1:0),0,1);
 const hollow=HOLLOWS.length?smooth(.2,1.2,hollowAt(x,z)):0;
 return{wet,flow:smooth(40,-1,r.d),upland:clamp(rel/600,0,1),canyon:RIVER&&RIVER.gorge?smooth(RIVER.gorge.reach,0,r.d):0,rim:0,rock,dune:0,oasis:floor,slope,abyss:0,salt:0,cold,geo:therm,
  barren:Math.max(under,ice),fog:0,mist:0,ice,debris:0,moraine,snow,algae:0,copper:0,flat,cave:0,tarn:under,shore,floor,meadow,grove,ash,therm,hollow};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','fog','mist','ice','debris','moraine','snow','algae','copper','flat','cave','tarn','shore','floor','meadow','grove','ash','therm','hollow'];
const FC=(function(){const N=400,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));
if(LAYOUT)Object.assign(FIELD,GEYSER.fields);   /* the geyser kit's: heat, sinter, film, acid, dead, spray, terr */
FIELD.therm=(x,z)=>clamp((heatAt(x,z)-SOIL)/60,0,1);   /* the heat on KTHERM's own 8 m bake, not the 14 m field grid: a boiling funnel is smaller than a grid cell */

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
// the LOD spine: a lattice over the page and the places every view looks at (the thermal ground, the camp, the hollows, the river)
const SPINE=[];for(let z=-2000;z<=2000;z+=1000)for(let x=-2000;x<=2000;x+=1000)SPINE.push([x,z]);
if(LAYOUT){LAYOUT.springs.forEach(s=>SPINE.push([s.x,s.z]));LAYOUT.geysers.forEach(g=>SPINE.push([g.x,g.z]));LAYOUT.acid.forEach(a=>SPINE.push([a.x,a.z]));
 /* a 220 m lattice over the thermal ground and a ring round it: the geyser kit's trees there grow at its hero tier (its mid tier draws crown clumps
    without limb rods, which the core attach audit counts as floating) */
 for(let z=TBOX[1]-300;z<=TBOX[3]+300;z+=220)for(let x=TBOX[0]-300;x<=TBOX[2]+300;x+=220)SPINE.push([x,z]);}
if(SITE.camp)SPINE.push([SITE.camp.x,SITE.camp.z]);HOLLOWS.forEach(H=>SPINE.push([H.x,H.z]));if(RIVER)for(let i=0;i<RIVER.pts.length;i+=30)SPINE.push([RIVER.pts[i][0],RIVER.pts[i][1]]);
// the mask: nothing roots in the water (the shore's grid, 89z, once it is made) or the river's ribbon; a pass may narrow it (MASK, 89z)
function rootMask(x,z){if(RIVER&&RBK.at(x,z).d<2.8)return 0;
 if(window._waterShore){const s=window._waterShore(x,z);if(s===s&&s<1.2)return 0;}
 const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:(d-.15)/.55;}return 1;}
let MASK=rootMask;
BIO.init({tags:'firebliss',THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:29,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:230,mid:600,far:2400,floor:[180,440]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
