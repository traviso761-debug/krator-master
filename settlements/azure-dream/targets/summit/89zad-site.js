// ================================================================= GRĒṬ-ĀIL — the summit's site: the High Kora and its places
// settlements/azure-dream/PLAN.md section 4e. The page's origin is the crest of the isle's dome (AD_SITE, 89z-rows.js), +308 m
// over the lake; x east, z south, y 0 the lake's level (-520 m), as on the isle's page. At 1:1 the dome is broad and nearly flat
// here: the ground 260 m out lies within 8 m of the crest all round. The ground, the pads and the placement are
// src/89zaa-ad-ground.js's.
//   the summit     the Summit Chorten (qb_chorten, the large) on the crest, the isle's one gilt crown seen from every shore;
//                  the great wheel's house (qb_great_wheel) north of it across a paved court; the Station Watch
//                  (qb_ad_station_watch, 89qc) west, its signal lamp answered by the relay lamp on the shoulder above the monastery
//                  (AD_SIGNAL, 89zaa: the dome hides the monastery itself); the pilgrims' shelter
//                  (qb_hostel) east, for the Station's festival
//   the High Kora  a ring 260 m out (1.6 km round), sixteen wheel houses (qb_wheel_house) on its inner side, each open onto it;
//                  the Dream Road meets it between two of them, its chorten (the eighth) beside the meeting
//   the Dream Road from the monastery's back gate (the isle page's u 484 on its axis, 9 km down the isle) to the summit's court
// Nothing here draws. [G data]: no THREE, no DOM.
reseed(34151);
// the Dream Road's line: toward the monastery's back gate (scale-model px 846.075, 1508.493 less the isle page's u 484)
const AD_ROAD=(function(){const gx=adWx(846.075)-AD.WX,gz=adWz(1508.493-484/2000)-AD.WZ,L=Math.hypot(gx,gz),dx=gx/L,dz=gz/L,B=AD.BOX;
 const end=Math.min((B[2]-20)/Math.abs(dx),(B[3]-20)/Math.abs(dz));return{dx,dz,L,end,ang:Math.atan2(dx,dz),at:s=>[dx*s,dz*s]};})();
// ---------------------------------------------------------------- the summit
adAt('qb_chorten',0,0,0,{v:2},'sacred','summit-chorten',true);
adAt('qb_great_wheel',0,-64,0,{v:0},'sacred','great-wheel',true);
adAt('qb_ad_station_watch',-84,6,0,{},'sacred','station-watch',true);
adAt('qb_hostel',84,-34,-Math.PI/2,{v:1},'pilgrims','pilgrims-shelter',true);
// ---------------------------------------------------------------- the High Kora: sixteen wheel houses 250 m out, the road between two
const AD_KORA={R:260,houses:[]};
for(let k=0;k<16;k++){const t=AD_ROAD.ang+Math.PI/16+k*Math.PI/8,x=250*Math.sin(t),z=250*Math.cos(t);
 AD_KORA.houses.push(adAt('qb_wheel_house',x,z,t,{v:k%3},'kora','wheel-house:'+k,true));}
// the road's chorten where it meets the kora, on its east side
{const p=AD_ROAD.at(AD_KORA.R+22);adAt('qb_chorten',p[0]+AD_ROAD.dz*10,p[1]-AD_ROAD.dx*10,AD_ROAD.ang,{v:1},'way','road-chorten',true);}
// ---------------------------------------------------------------- the ways and the paved court (90ad paints them; the flora keeps off)
const AD_WAYS=[['way',5,[AD_ROAD.at(16),AD_ROAD.at(AD_ROAD.end)]]];
{const P=[];for(let i=0;i<=64;i++){const t=i/64*2*Math.PI;P.push([AD_KORA.R*Math.sin(t),AD_KORA.R*Math.cos(t)]);}AD_WAYS.push(['kora',4,P]);}
const AD_PAVED=[[[-30,-48],[30,26]]];
window._adSite={pads:AD_PADS.length,places:AD_PLACE.length,kora:{r:AD_KORA.R,houses:AD_KORA.houses.length},
 road:{toGate:+AD_ROAD.L.toFixed(0),dir:[+AD_ROAD.dx.toFixed(3),+AD_ROAD.dz.toFixed(3)]},crest:+terrainH(0,0).toFixed(1)};
