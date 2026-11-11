// ================================================================= HOST — STATION 3, THE DEEP: its land
// Scale model 5.1 px 1692,895 (pinned by the code to -1,180 m; PLAN.md section 7): XW (abyssal desert), tm 38 degC (46/31), 78 mm, 1.85 atm. The
// floor as drawn is flat: the page's 9 cells lie within 50 m of each other, -1,180 at the site, rising to -1,135 2 km east toward the east ramp;
// the lowest ground on the model, -1,187 m, is 12 km west-south-west. The walls stand 60-120 km off on both hands, 1-7 degrees up (the far
// field, 83). On the model's floor the station sets:
//   THE SALT HOLLOWS   shallow closed pans 1-4 m deep, 80-400 m across, their floors a salt crust broken into polygons (the trough has no
//                      outlet: what little water reaches the floor leaves its salt); KRAND-placed by cell, never by draw order
//   THE PAVEMENT       the dark komatiite gravel packed on the old flats between them (KRELIEF.pavement), obsidian gravel in patches
//   THE OUTCROPS       low knobs of the floor's own dark rock (KSTACKS domes and tors, 3-12 m)
// The dangers (88): the heat (ambient: 50-53 degC in the warm month's afternoon), the CO2 that pools in the deepest hollows (gas records), the dust.
const STATION=(function(){
 const W=94301,u=(i,k)=>KRAND.unit(KRAND.hash(W,i,k,0x51));
 /* the hollows: 9 candidates on a jittered 3 x 3 lattice over the page, each its own size, depth and strike (none on the outcrops) */
 const HOL=[];for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const k=(j+1)*3+(i+1);if(u(k,9)<.18)continue;
  HOL.push({x:i*1700+(u(k,1)-.5)*900,z:j*1700+(u(k,2)-.5)*900,a:80+320*u(k,3)*u(k,3),e:1+1.2*u(k,4),ry:u(k,5)*Math.PI,d:1+3*u(k,6),i:k});}
 HOL.sort((A,B)=>B.d*B.a-A.d*A.a);
 const holD=(x,z,H)=>{const c=Math.cos(H.ry),s=Math.sin(H.ry),dx=x-H.x,dz=z-H.z,lx=dx*c+dz*s,lz=(-dx*s+dz*c)*H.e,a=Math.atan2(lz,lx);
  return Math.hypot(lx,lz)*(1+.12*Math.sin(3*a+H.i)+.06*Math.sin(5*a+2*H.i))/H.a;};
 const base=(x,z)=>MODEL.h(x,z)+.6*(KRAND.fbm(x*.004,.5,z*.004,3,W)-.5);
 function hol(x,z){let cut=0,salt=0;for(const H of HOL){const d=holD(x,z,H);if(d>1.4)continue;cut=Math.max(cut,H.d*smooth(1.25,.55,d));salt=Math.max(salt,smooth(1.05,.7,d));}return{cut,salt};}
 const ground=(x,z)=>base(x,z)-hol(x,z).cut;
 const PAVE=KRELIEF.pavement({h:ground,slope:[.03,.12],patch:.35,seed:94302});
 const L=chasmLand({R:2600,ground,
  rockAt:(x,z,h,sl)=>smooth(.5,.85,sl),strataK:(x,z,h,sl)=>smooth(.35,.7,sl),
  talus:(x,z)=>{if(!ROCKS.length)return 0;const f=KSTACKS.foot(ROCKS,x,z);return f?smooth(14,2,f.d):0;},
  salt:(x,z)=>hol(x,z).salt,polyg:(x,z)=>smooth(.4,.8,hol(x,z).salt),
  pave:(x,z)=>PAVE(x,z)*(1-hol(x,z).salt),
  strata:GCH_STRATA({}),
  spine:[[0,0],[HOL[0].x,HOL[0].z],[HOL[1].x,HOL[1].z],[900,-600],[-900,700],[1500,900],[-1600,-1200]]});
 Object.assign(L,{HOL,hol,base});return L;})();
var ROCKS=[];
{const W=94311,u=(i,k)=>KRAND.unit(KRAND.hash(W,i,k,0x52));
 for(let i=0;i<9;i++){const x=(u(i,1)-.5)*4600,z=(u(i,2)-.5)*4600;if(STATION.hol(x,z).salt>.05||Math.hypot(x,z)<120)continue;
  const y0=Math.min(...[[0,0],[12,0],[-12,0],[0,12],[0,-12]].map(o=>STATION.terrainH(x+o[0],z+o[1])))-1.5;
  ROCKS.push(KSTACKS.make({id:'deep-knob-'+i,kind:u(i,3)<.5?'dome':'tor',x,z,y0,seed:W+i,H:4+9*u(i,4),r:6+10*u(i,5),e:1+.6*u(i,6),ry:u(i,7)*6.28}));}}
STATION.ROCK.push(...ROCKS);
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=null,FALLS=[],SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}
const LAND={name:'The Deep (greatchasm station 3)',title:'Krator biome — the Great Chasm: the Deep',build_id:'greatchasm-deep',
 hint:'Station 3 of the Great Chasm: the Deep, the chasm\'s floor at -1,180 m (scale model 5.1 px 1692,895; 1.85 atm, XW, 38 degC mean, 46 in the warm month): dark pavement, salt hollows, shimmer and dust, the walls a skyline 60-120 km off on both hands',
 region:{name:'The Deep (station 3)',x:0,z:0,r:TERR.R},sky:{px:SITE.sky[0],py:SITE.sky[1]},atm:atmAt(SITE.h),cloud:.05,
 fog:{falloff:1/700,sun:.4,sky:.35},climate:{cold:false,dry:true},wet:false,groundN:520,
 groundLayers:['black','obsidian','salt','pave'],
 plants:['salt','stones'],
 modelTol:12,
 farLabel:'The Great Chasm round the Deep: the east and west walls 60-120 km off (the scale model 5.1)',
 /* the eastern abyss's jade shrub, read in place (station.json): the abyssal desert's one shrub (PLAN.md section 4: the Bowl's floor and the eastern
    abyss's XW set), on the hollows' rims only, where the rare runoff gathers before it salts */
 kin:[{ref:'eastabyss.jade',key:'jade',name:'Jade shrub (the eastern abyss\'s, read in place)',cell:50,minR:4,accept:Z=>smooth(.05,.25,Z.salt)*smooth(.75,.45,Z.salt)*.6}],
 hazards:()=>STATION.HOL.slice(0,3).map((H,i)=>({name:'CO2 pooled in a still hollow ('+['the deepest','the second','the third'][i]+')',kind:'gas',x:H.x,z:H.z,r:H.a*.8,h:2.5,
   y:terrainH(H.x,H.z)-.5,danger:.5+.1*(2-i),tell:{sign:'dead birds and insects on the crust; no wind in the hollow'}}))
  .concat(ROCKS.map(B=>({name:'A knob\'s face (a fall)',kind:'fall',x:B.x,z:B.z,r:B.R,h:B.top-B.y0+2,danger:.3,tell:{sign:'the knob\'s sheer side'}}))),
 hazardMin:3,
 views:H=>{const {look}=H,S=STATION,H0=S.HOL[0],H1=S.HOL[1],B=ROCKS[0]||{x:800,z:800,R:10};
  return{
  'The furnace floor':look(-300,250,1.7,1800,-900,40),
  'A salt hollow':look(H0.x+H0.a*1.3,H0.z+H0.a*.4,2.2,H0.x,H0.z,0),
  'The crust\'s polygons':look(H1.x+H1.a*.5,H1.z,1.6,H1.x-H1.a*.2,H1.z+H1.a*.2,0),
  'The east wall from the floor':look(-1500,0,2,40000,0,6000),
  'The west wall from the floor':look(1500,300,2,-40000,0,4000),
  'A knob of the floor\'s rock':look(B.x+B.R*3,B.z+B.R*1.5,2,B.x,B.z,4),
  'Down the trench (north)':look(0,1800,8,0,-60000,1500),
  'From above the Deep':look(-2400,2400,500,0,0,0)};}};
