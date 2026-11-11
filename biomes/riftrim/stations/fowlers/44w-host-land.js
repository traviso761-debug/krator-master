// ================================================================= HOST — STATION 8, THE FOWLERS (a Fellgang village under the N rim's wall; PLAN.md section 6, "Two more Fellgang villages",
// chosen by the owner 2026-11-11: "that sounds good for both")
// Scale model 5.1: the village on the north shore of the N rim's 1,887 m lake, px 571,1397 (world 1142,2794 km): a shore bench at ~2,350 m, Csa, ~820 mm,
// mean +11 degC (warmest month 22, coldest 0, nights to -8); the lake 624 km², 853 m deep; the ground rising from the shore to 5,627 m within 16 km north,
// a south-facing wall of 3.7 km; the east rising to 4.8 km. `rift rim N` and `Fellgangs`. The page compresses it into 6 km:
//   south      THE LAKE at 1,887 m, deep and blue under the wall, running on past the map (LAND.farWater)
//   centre     THE SHORE BENCH at ~1,960-2,020 m (the model's 2 km pixel reads 2,350 over the bench and the wall's foot), the village on it (core/hamlet: KHAMLET.village on the Fellgang row, 84f), its lanes down to a landing
//   north      THE WALL: from the bench's back the ground climbs 1.5 km in under a kilometre (a face of rift fill, the KSTRATA `rift` beds), then on in
//              ledged steps to ~4.9 km at the page's edge and 5.6 km past it; the families' ropes and ladders up the lower face, the nest ledges on it
//   east       a spur rising toward the 4.8 km heights, the glass forest (frost frills, bell firs) on its gentler ledges
const STATION=(function(){const R=3000,LAKE=1887;
 const shoreZ=x=>560+70*Math.sin(x*.0013+.4)+30*Math.sin(x*.0041);   /* the lake's north shore (z); the lake lies south of it */
 const FOOT=-260;                                                       /* the wall's foot (z) behind the bench */
 const footZ=x=>FOOT+60*Math.sin(x*.0021+1.3)+25*Math.sin(x*.007);
 const ledge=(h,z)=>{const b=170,q=h/b,f=q-Math.floor(q);return b*(Math.floor(q)+smooth(.0,.75,f))-h;};   /* the face's strata as ledges: a flat a few tens of m wide every ~170 m of height */
 function ground(x,z){const sz=shoreZ(x),fz=footZ(x);
  let h;
  if(z>sz){const dIn=z-sz;h=LAKE-Math.min(60,3+dIn*.09)-(fbm(x*.004,z*.004,8301,2)-.5)*6;}   /* the lake bed (drawn to a page's depth: PLAN.md "The lakes on 5.1") */
  else{const d=sz-z;h=LAKE+5+75*smooth(0,240,d)+55*smooth(240,Math.max(300,sz-fz),d)+10*(fbm(x*.008,z*.008,8302,2)-.5);   /* the shore rising 75 m to the bench, the bench nearly flat to the wall's foot */
   if(z<fz){const d=fz-z,wall=1550*smooth(0,900,d)+1200*smooth(700,2700,d)*smooth(0,1,d/2700);let w=wall+90*(fbm(x*.0025,z*.0025,8303,3)-.5)*smooth(0,300,d);
    w+=ledge(w,z)*smooth(0,200,d)*.85;h+=w;}}
  if(z<=sz)h=mix(LAKE-1.5,h,smooth(0,40,sz-z));
  h+=Math.max(0,x-1300)*.32*smooth(1300,2900,x)*smooth(sz+200,sz-400,z);   /* the eastern spur */
  return h;}
 const VIL={x:-150,z:120};   /* the village point on the bench (hamlet's siteFor finds dry flat ground near it) */
 const L=rimLand({R,ground,
  lakes:[{name:'The lake under the wall',kind:'deep',level:LAKE,poly:[[-3600,3600],[-3600,600]].concat(Array.from({length:44},(_,k)=>{const x=-3500+k*163;return[x,shoreZ(x)-40];}),[[3600,600],[3600,3600]]),
   inside:(x,z)=>z>shoreZ(x)-40,area:624}],   /* the drawn outline's own line (the poly is the shore less 40 m): waterH and the drawn water agree */
  river:null,falls:[],
  tm:(x,z,h)=>11-6.5*(h-2000)/1000,   /* the model's +11 degC on the bench */
  wet:(x,z,h)=>.5+.1*fbm(x*.0016,z*.0016,8304,2),
  fog:(x,z,h)=>.18*smooth(3600,4300,h),
  rockAt:(x,z,h,sl)=>Math.max(smooth(.55,.85,sl),smooth(4300,4700,h)*.6),
  strataK:(x,z,h,sl)=>smooth(.5,.8,sl),
  snowAt:(x,z,h,sl)=>smooth(4350,4650,h)*smooth(.7,.35,sl),
  strata:BIO.strata({recipe:'rift',seed:8305,range:[1500,5200],res:.5,private:true}),
  spine:[[VIL.x,VIL.z],[VIL.x,-300],[VIL.x-300,-450],[VIL.x+400,-500],[VIL.x,500],[-1500,200],[1200,100],[2200,-700],[VIL.x,-1200],[0,1800],[-2400,-1200]]});
 Object.assign(L,{shoreZ,footZ,LAKE,VIL});return L;})();
const TERR=STATION.TERR,LAKES=STATION.LAKES,RIVER_SPEC=STATION.RIVER_SPEC,FALLS=STATION.FALLS,SPINE=STATION.SPINE,STRATA=STATION.STRATA,ROCK=STATION.ROCK;
function terrainH(x,z){return STATION.terrainH(x,z);}
function waterH(x,z){return STATION.waterH(x,z);}
function fieldsAt(x,z,h,slope){return STATION.fieldsAt(x,z,h,slope);}

const LAND={name:'The Fowlers (riftrim station 8)',title:'Krator biome — the rift rim: the Fowlers under the wall',
 hint:'Station 8 of the rift rim: a Fellgang village of fowlers on the N rim, on a bench over the 1,887 m lake at the foot of a 3.7 km wall (scale model 5.1 px 571,1397; Csa, +11 degC). Its families climb the wall on ropes and ladders kept for generations, for the eggs of the cliff-nesting flyers, wall honey and herbs; each family\'s rope is its stretch of the face and its vote. Opens in the morning (#hour=12 for midday)',
 region:{name:'The Fowlers (station 8)',x:0,z:0,r:TERR.R},rim:'n',wind:[-.6,-.8],arcade:false,fruitMin:0,hour:9.3,   /* the morning (on this day the giant hides the sun until ~8.5) */
 species:['frostfrill','bellfir'],exportBox:[STATION.VIL.x+350,STATION.VIL.z+300,STATION.VIL.x+650,STATION.VIL.z+600],   /* the bench beside the village and the lake's edge below it (the flora keeps off the village itself) */
 exportProfile:['registry','items','materials','textures','terrain','stage','atmos','water'],   /* the village on its bench and the lake's edge; no bucket here (the ice station's reason) */
 sky:{px:299,py:1067},atm:.8,cloud:.25,dust:false,   /* the sky's frame: the old canvas (5.1 px less 272,330); 0.8 atm at 2 km */
 fog:{falloff:1/1400,sun:.35,sky:.3},climate:{cold:true,dry:false},wet:false,snowLine:[4300,4700],snowBase:0,groundN:600,
 groundLayers:['needles','tundra','lenswort','lichen','clad'],
 lakeLook:{deep:[0x184a66,0x0e2c40],shallow:0x2e7a86},
 farWater:{level:STATION.LAKE-1,colour:[26,70,98]},   /* the lake past the map: flat at its level (83) */
 far:(x,z,S0)=>{const g=terrainH(clamp(x,-S0,S0),clamp(z,-S0,S0)),dn=Math.max(0,-S0-z),de=Math.max(0,x-S0),ds=Math.max(0,z-S0),dw=Math.max(0,-S0-x);
  if(ds>0||(z>STATION.shoreZ(clamp(x,-S0,S0))&&dn<1))return STATION.LAKE-1;   /* the lake runs south and along the shore past the map */
  return g+dn*.45*smooth(0,9000,dn)+de*.3*smooth(0,6000,de)+dw*.05+200*(fbm(x*.0008,z*.0008,8306,3)-.5)*smooth(0,1500,Math.max(Math.abs(x),Math.abs(z))-S0);},
 farBands:[1950,2600,3300,4100,4500],farLabel:'The N rim\'s wall and the lake under it, past the map',
 views:H=>{const {P,look,atTree,nearTree,gh}=H,S=STATION,V=S.VIL,F=window._fowl||{};
  const vx=F.site?F.site.x:V.x,vz=F.site?F.site.z:V.z,rp=(F.ropes&&F.ropes[0])||{x:vx,z:S.footZ(vx)};
  return{
  'The Fowlers under the wall':()=>[vx+60,gh(vx+60,vz+240,6),vz+240,vx,gh(vx,vz-700,500),vz-700],
  'The village on its bench':()=>[vx+220,gh(vx+220,vz+180,70),vz+180,vx,gh(vx,vz,0),vz],
  'A family\'s rope up the face':()=>{const r=(window._fowl&&window._fowl.ropes&&window._fowl.ropes[2])||rp;return[r.x+14,gh(r.x+14,r.z+30,2),r.z+30,r.x,gh(r.x,r.z,60),r.z-40];},
  'A nest ledge':()=>{const n=(window._fowl&&window._fowl.nests&&window._fowl.nests[0])||{x:vx,z:S.footZ(vx)-200};return[n.x+18,gh(n.x,n.z,6),n.z+24,n.x,gh(n.x,n.z,.5),n.z];},
  'The wall from the lake':[vx-400,S.LAKE+40,1900,vx,S.LAKE+1700,-1600],
  'Down the lake from the face':()=>[vx-200,gh(vx-200,S.footZ(vx-200)-700,4),S.footZ(vx-200)-700,vx+300,S.LAKE,2400],
  'The glass forest on the spur':atTree(nearTree('frostfrill',P.montane[0],P.montane[1],10),24,2.4,3),
  'From afar':look(2600,2800,500,0,-900,600)};},
 probes:{bed(){return[STATION.VIL.x,STATION.LAKE-6,900];},ice:null}};
