// prefix: dhf
// ================================================================= DHELV: THE YOUNG LAVA, LAID AS IT RAN (the owner: "think about how the lava would actually
// travel"). [G data] The Throne kit's own flow model (biomes/throne/src/46-biome-throne-flows.js, THRONE.flowHistory) over the
// layout's land (41: the flank rising east, the old spur's ridge and shelf): flows leave vents up the flank, oldest first, each
// running down the fall line of the ground as it then stood (the land and the flows already on it), widening into lobes and
// laying a sheet a few metres thick with steep fronts. The spur stands 40 to 83 m over the troughs, so they part at the ridge,
// bank against the shelf's walls and spread across the plain below its tip. After this DH.groundY is the land plus the lava
// laid (and the young flows' rough skin, as the kipuka station draws it); the shelf, the ridge and the apron (the lee under the
// tip, which no flow reached) keep their own ground. THRONE.ageAt answers the model's ages (the spur 2,600 years, the apron 400).
const DHF={R:1800,cell:8,
 /* the vents, along the flank above the drawn ground: north of the ridge, and south of it (z grows south) */
 VENTS:[
  {key:'n700',name:'An old flow north of the ridge (seven centuries)',x:1720,z:-900,age:700,len:3700,w:[300,520],th:[7,10],veer:.05,wander:.45,seed:9304},
  {key:'s300',name:'A flow south of the ridge (three centuries)',x:1720,z:1000,age:300,len:3700,w:[280,500],th:[6,9],veer:-.05,wander:.45,seed:9307},
  {key:'n140',name:'A flow of 140 years down the north trough',x:1720,z:-650,age:140,len:3700,w:[260,480],th:[6,9],veer:.08,wander:.4,seed:9303},
  {key:'s60',name:'A flow of sixty years down the south trough',x:1720,z:700,age:60,len:3700,w:[240,440],th:[5,8],veer:-.08,wander:.45,seed:9306},
  {key:'n35',name:'A flow of 35 years along the north wall',x:1720,z:-380,age:35,len:3600,w:[220,420],th:[5,8],veer:.1,wander:.4,seed:9302},
  {key:'s12',name:'A flow of twelve years along the south wall',x:1720,z:420,age:12,len:3600,w:[180,340],th:[5,8],veer:-.1,wander:.4,seed:9305},
  {key:'n3',name:'The new flow (three years) beside the ridge',x:1720,z:-120,age:3,len:3600,w:[120,260],th:[6,9],veer:-.05,wander:.35,seed:9301}],
 FL:null,ms:0};
(function(){if(typeof THRONE==='undefined'||!THRONE.flowHistory)return;const t0=Date.now(),land=DH.groundY,fn=BIO.fn,sm=fn.smooth;
 const FL=THRONE.flowHistory({R:DHF.R,cell:DHF.cell,baseH:land,flows:DHF.VENTS,old:2600});DHF.FL=FL;
 const spur=(x,z)=>DH.plateauD(x,z)>-1.5||DH.ridgeD(x,z)>-1.5,apronK=(x,z)=>{const A=DH.APRON;return Math.hypot(x-A.c[0],(z-A.c[1])*1.3)/A.r;};
 const ridged=(x,z,s)=>1-Math.abs(fn.fbm(x,z,s,3)*2-1);
 DH.groundY=function(x,z){const b=land(x,z);if(spur(x,z))return b;const lee=sm(1,1.12,apronK(x,z)),th=FL.thickAt(x,z)*lee;if(th<=0)return b;
  /* the lava's skin: aa rubble and pressure ridges, sharper the younger (the wet weathers it fast) */
  const fl=sm(.4,2.2,th),a=FL.ageAt(x,z),k=fl*(1-.75*sm(150,1500,a));return b+th+k*(1.5*ridged(x*.045,z*.045,4711)+.6*(fn.fbm(x*.17,z*.17,4712,2)-.5)-.6);};
 DH.surfaceY=DH.groundY;
 THRONE.ageAt=(x,z)=>spur(x,z)?2600:apronK(x,z)<1?400:FL.ageAt(x,z);
 DHF.ms=Date.now()-t0;})();
