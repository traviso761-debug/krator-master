// ================================================================= HOST — station 4, the salt floor: its build, its views and checks (PLAN-STATIONS.md)
// STATION.build (45) calls SALT.build from src/88-host-build.js in place of the kit's build alone. Two kits share the floor, each under its own
// placement mask (BIO.init's mask, MASK in 45):
//   THE SALT STEPPE (XS): this kit, off the XV islands and off the pans and their salt fringe (crMask); the kiln's scrub on crusted red ground.
//   THE ABYSSAL SAVANNAH (XV): biomes/abyssal-savannah read in place (station.json), on the islands and on the pans' rims (abMask). Its zones read
//     the host's fields; on this flat floor its upland bands would leave nothing but the pan, so its parkland band is opened to the whole floor
//     (ABSAV.setZoneBands: the mask confines it to the islands) and its pan zone takes the salt fringe (its saltbush and blue pan-grass). Its
//     burn mosaic is this page's (ABSAV.burn reads the kit's fire history, KFIRE's model in 52), so one fire map runs over both kits.
//   ?absav=0 leaves the abyssal savannah out (the steppe then stops at the islands' edge).
// Owed (PLAN-STATIONS.md, KNOWN_ISSUES.md): the Steampits' geyser field next door (the geyser kit's run-off and sinter apron reaching in), the
// cinder pine on basalt kopjes (nwbay's, EXCHANGES.md), the kiln's scrub "at its largest in the dense air" (the kit's sizes are station 1's).
const SALT=(function(){const Q=new URLSearchParams(location.search),E={};
 const isl=(x,z)=>smooth(.35,.6,FIELD.island(x,z)),salt=(x,z)=>FIELD.salt(x,z);
 const crMask=(x,z)=>(1-isl(x,z))*(1-smooth(.12,.3,salt(x,z)));
 const abMask=(x,z)=>{const s=salt(x,z);return Math.max(isl(x,z)*(1-smooth(.12,.3,s)),smooth(.12,.3,s)*smooth(.85,.6,s));};
 E.crMask=crMask;E.abMask=abMask;
 E.build=function(q){let out;
  try{MASK=crMask;out=CRATERDRY.build({R:TERR.R-150,quality:q});}finally{MASK=()=>1;}
  (CRATERDRY.TREES||[]).forEach(T=>OBSTACLES.push({x:T.x,z:T.z,r:T.crownR*.6+1,y0:T.y0-3,y1:T.y0+T.H}));
  if(Q.get('absav')!=='0'&&typeof ABSAV!=='undefined'){const R=TERR.R-150;
   ABSAV.setZoneBands({parkland:{up0:[-1,-.5],up1:[2,1.5]}});
   ABSAV.burn=(x,z)=>Math.min(12,FIRE.ageAt(x,z));   /* one fire map for both kits: this page's history */
   try{MASK=abMask;BIO.cur='absav';out.absav=ABSAV.build({box:[-R,-R,R,R],quality:q});}catch(e){reportErr('abyssal savannah: '+e.stack);}finally{MASK=()=>1;BIO.cur=null;}
   out.absavTrees=(ABSAV.TREES||[]).length;}
  return out;};
 // the views: a pan's crust, a brine pool, the savannah on an island, the floor from above
 E.views=function(h){const V={},P=PANS[0],B=BRINES[1];
  V['A salt pan']=[P.x+Math.cos(P.t)*P.a*1.25,P.level+3.2,P.z+Math.sin(P.t)*P.a*1.25,P.x,P.level,P.z];
  V['The red brine']=[B.x+B.a*2.4,B.level+5,B.z+B.b*1.6,B.x,B.level,B.z];
  const T=(ABSAV.TREES||[]).filter(T=>T.lv>0).sort((a,b)=>Math.hypot(a.x,a.z)-Math.hypot(b.x,b.z))[0];
  if(T)V['The abyssal savannah on an island']=h.atTree(T,T.crownR*3,1.1,2.4,.5);
  V['The salt floor from above']=h.look(2400,2200,600,-200,-300,0);
  const K0=KOP[0];V['The Steampits kopje']=h.look(K0.x+K0.r*2.4,K0.z+K0.r*1.4,8,K0.x,K0.z,K0.h*.5);return V;};
 // the station's checks, each with its broken input (99's negatives): the two kits keep to their own ground, nothing grows on a pan's crust
 const CH={
  split(pts){let cr=0,ab=0,crOn=0,abOn=0;for(const p of pts){const isAb=p[4]==='abyssal-savannah';
   if(isAb){ab++;if(abMask(p[0],p[2])<=0)abOn++;}else{cr++;if(crMask(p[0],p[2])<=0)crOn++;}}
   return{ok:ab>=200&&cr>=200&&crOn<=cr*.01&&abOn<=ab*.01,detail:'the steppe kit '+cr+' instances ('+crOn+' off its ground), the abyssal savannah '+ab+' ('+abOn+' off its ground)'};},
  crust(pts){const bad=pts.filter(p=>PANS.some(P=>panD(P,p[0],p[2])<.9));
   return{ok:!bad.length,detail:bad.length?bad.length+' instances on a pan\'s crust (first '+bad[0][3]+')':'nothing rooted on the '+PANS.length+' pans\' crust'};}};
 // every instance with its kit (the registry its mesh was made in): [x, y, z, name, kit]
 const pts=()=>{const o=[],m=new THREE.Matrix4(),p=new THREE.Vector3(),qq=new THREE.Quaternion(),sc=new THREE.Vector3();
  scene.traverse(M=>{if(!M.isInstancedMesh||!M.userData.biome)return;const kit=M.userData.kit||(M.userData.bio&&M.userData.bio.kit)||'';
   for(let i=0;i<M.count;i+=7){M.getMatrixAt(i,m);m.decompose(p,qq,sc);o.push([p.x,p.y,p.z,M.name,kit]);}});return o;};
 E.checks=(add)=>{const P=pts();add('the steppe and the abyssal savannah each on its own ground',CH.split(P));add('nothing rooted on a salt pan\'s crust',CH.crust(P));};
 E.negatives=(add)=>{add('no abyssal savannah',CH.split(pts().filter(p=>p[4]!=='abyssal-savannah')));
  add('a plant on a pan',CH.crust([[PANS[0].x,PANS[0].level,PANS[0].z,'test']]));};
 return E;})();
