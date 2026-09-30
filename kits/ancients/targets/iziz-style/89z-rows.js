// TARGET: iziz-style — the ANCIENT IZIZ STYLE (src/77z-iziz-style.js), everything it holds, row by row:
//  * the 20 families (the Ancient halves of the Iziz building families, and the Ancient-only temple and arena),
//    each intact (x=-s), destroyed (x=+s) and rehabilitated (x=0), the last two made by wreck();
//  * the twelve single types Iziz cuts out of the kit's multi-building builders (kitSection): apartments A-C,
//    offices A-C, houses A-F, each intact, ruined and repaired;
//  * Skyscrapers A-F trimmed off their podiums onto a small square plinth (measureKit + trimPlinths), each intact,
//    ruined and repaired; Skyscraper D's ruined and repaired skins in rusted steel (izsRustSkin), and the repaired
//    Skyscraper C carrying the tripod market (tripodMarket, dressed here with the style's own stalls).
// Families stand at the scales the Iziz city places them (houses and towers 2.6, halls 2.2, temple .72, arena .82).
const TITLE='Ancient Iziz Style';
const DECAYS=[0,1,3];
const IZS_SCALE=k=>k==='temple'?.72:k==='arena'?.82:(['hall','stave','compound','stall','fountain'].indexOf(k)>=0?2.2:2.6);
const IZS_SECTIONS=[['aptsA','Apartments A — terrace stack',buildApartments,-60,60],['honey','Apartments B — honeycomb wall',buildApartments,75,235],
 ['aptsC','Apartments C — column cluster',buildApartments,265,420],['officeA','Office A — flared ring',buildOffices,-70,110],
 ['officeB','Office B — lobed tower',buildOffices,140,245],['officeC','Office C — the Comb',buildOffices,262,420],
 ['houseA','House A',buildHouses,-35,35],['houseB','House B',buildHouses,35,105],['houseC','House C',buildHouses,105,175],
 ['houseD','House D',buildHouses2,-30,30],['houseE','House E',buildHouses2,30,95],['houseF','House F',buildHouses2,95,170]];
const IZS_TOWERS=[['skyA','Skyscraper A',buildSkyA],['skyB','Skyscraper B',buildSkyB],['skyC','Skyscraper C — the tripod market',buildSkyC,.06],
 ['skyD','Skyscraper D — rusted skin',buildSkyD],['skyE','Skyscraper E',buildSkyE],['skyF','Skyscraper F',buildSkyF]];

// the style's tripod market: its own mast, ball and rope items, and its own Ancient-style stall under each awning
const IZS_AWN=[];
const IZS_KIT_TRIPOD={awnings:IZS_AWN,post:'tpole',ball:'tbulb',rope:'tpole',col:izsC,culture:'ancients-reclaimed',
 stall:(c,Gs)=>{try{IZS_BY.stall.fn(Gs,0,0);}catch(e){reportErr('tripod stall '+e.stack);}}};
function izsShowAwnings(scene){for(const w of IZS_AWN.splice(0)){const m=MAT.tarp.clone();if(MAT.tarp.onBeforeCompile)m.onBeforeCompile=MAT.tarp.onBeforeCompile;
 m.color=izsC(w.c);const me=new THREE.Mesh(w.g,m);me.frustumCulled=false;scene.add(me);}}
// a small stepped plinth, one per trimmed tower (Iziz lays its own, in its own stone, at the plot)
function izsShowPlinth(o){const w=o.hx*2+1.5,d=o.hz*2+1.5;
 kput('boxC',[o.x,.5,o.z],null,[w,1.0,d],izsC(0xb8b0a4));kput('boxC',[o.x,1.25,o.z],null,[w-3,.5,d-3],izsC(0xc4bcb0));
 kput('boxC',[o.x,1.48,o.z],null,[w-3.4,.14,d-3.4],izsC(0xd8d0c4));
 for(const s of[-1,1])kput('boxC',[o.x,.25,o.z+s*(d/2+.9)],null,[w*.5,.5,1.8],izsC(0xb0a89c));}

function izsShowFamily(key,i){return (scene,gx,gz,d)=>{const seed=7700+i*8+d;
 izsPlace(scene,key,d===0?'intact':d===1?'ruin':'rehab',gx,gz,0,IZS_SCALE(key),seed,0);return null;};}
function izsShowSection(fn,x0,x1){const c=(x0+x1)/2;return (scene,gx,gz,d)=>{
 const G=new THREE.Group();G.position.set(gx-c,0,gz);scene.add(G);G.updateMatrix();const r0=REG.length;
 KOFF=[0,0,0];useGroupXF(G);try{const H=kitSection(fn,x0,x1)(G,0,0,d);if(d===3&&H)repairPass(H,3);}finally{endGroupXF();KOFF=[0,0,0];}
 for(let i=r0;i<REG.length;i++){REG[i].x+=gx-c;REG[i].z+=gz;}
 return null;};}
// coreFrac: the Tripod's legs are part of its core, not podium to trim (as in the Iziz city)
function izsShowTower(key,name,fn,coreFrac){const cat={fn,name,kind:'sky',coreFrac};return (scene,gx,gz,d)=>{
 const M=measureKit(cat),y0=1.55-M.baseY,ox=gx-M.cx,oz=gz-M.cz;
 const G=new THREE.Group();G.position.set(ox,y0,oz);scene.add(G);G.updateMatrix();const snap=kitSnapshot(),r0=REG.length;
 KOFF=[0,0,0];useGroupXF(G);try{const H=fn(G,0,0,d);if(d===3&&H)repairPass(H,3);}finally{endGroupXF();KOFF=[0,0,0];}
 const o={x:gx,z:gz,hx:M.hx+8,hz:M.hz+8,ry:0};
 trimPlinths(G,snap,o,y0,1,M.th,null,y0+M.baseY+.25);
 if(key==='skyD'&&d>0)izsRustSkin(G);
 izsShowPlinth(o);
 for(let i=r0;i<REG.length;i++){REG[i].x+=ox;REG[i].z+=oz;REG[i].y=(REG[i].y||0)+y0;}
 if(key==='skyC'&&d===3){tripodMarket(G,o,0,1,0,ox,oz,y0,IZS_KIT_TRIPOD);izsShowAwnings(scene);}
 return null;};}

// the rows: z runs south, one row per piece, spaced by its footprint
const ROWS={},EXTRA_BUILDERS={},IZS_ROWNAME={};
{let z=0;
 IZS_FAMILIES.forEach((p,i)=>{const R=p.size*IZS_SCALE(p.key)*.5;const k='izs_'+p.key;
  ROWS[k]={z:z+R,s:Math.max(70,R*2.7),r:R*1.3};EXTRA_BUILDERS[k]=izsShowFamily(p.key,i);IZS_ROWNAME[k]=p.name;z+=R*2+70;});
 z+=200;
 for(const[k0,name,fn,x0,x1]of IZS_SECTIONS){const R=Math.max(40,(x1-x0)*.55);const k='izsec_'+k0;
  ROWS[k]={z:z+R,s:Math.max(160,R*2.6),r:R};EXTRA_BUILDERS[k]=izsShowSection(fn,x0,x1);IZS_ROWNAME[k]=name;z+=R*2+90;}
 z+=300;
 for(const[k0,name,fn,cf]of IZS_TOWERS){const k='izpod_'+k0;
  ROWS[k]={z:z+140,s:320,r:150};EXTRA_BUILDERS[k]=izsShowTower(k0,name,fn,cf);IZS_ROWNAME[k]=name+' on a small plinth';z+=560;}}
const GROUND_C=Math.max(...Object.values(ROWS).map(r=>r.z))/2;
const RUINS=Object.values(ROWS).flatMap(r=>[[r.s,r.z,r.r],[0,r.z,r.r*.8]]);
