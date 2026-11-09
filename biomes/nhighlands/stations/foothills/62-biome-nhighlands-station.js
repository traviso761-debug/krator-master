// ================================================================= NORTHERN HIGHLANDS — station 3, the Mediterranean foothills: its passes and its floor
// [G data] Replaces station 2's file of the same name (this station's base). The kit's own trees here are few (the creek's alder and willow, the black oak
// and a few copper pines on the upper slopes, station 2's): the oaks, the sycamore and the chaparral's manzanita and madrone are swlowlands', read in place
// (station.json "kin"; grown by 87-host-station-kin.js, STATION_GROW). The floor: golden annual grass, chaparral shrubs and heath on the sunny slopes,
// green grass and bracken along the creek. Fields from the SITE (44z): `chaparral`, `savanna`, `shade`, `grove`.
(function(){
const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick,qEuler}=BIO.fn,T3=BIO.host.THREE,C=h=>new T3.Color(h);
const fld=n=>(x,z)=>BIO.field(n,x,z),CHAP=fld('chaparral'),SAV=fld('savanna'),SHADE=fld('shade');
const col=(set,k)=>{const c=C(pick(set));c.offsetHSL((rng()-.5)*.02,(rng()-.5)*.06,(rng()-.5)*.05);return c.multiplyScalar(k==null?1:k);};
const GOLD=[0xc8ac5e,0xd4b868,0xb89c52,0xdcc070],GREEN=[0x6a8a3a,0x7a9a40,0x5e7e34],CHAPC=[0x4e5a34,0x5a6438,0x46522e];
NHL.STATION_PASSES=function(P){const {pass,o,BIG,SMALL}=P;
 pass('greyalder',24,(Z)=>Z.rip*.55,o(BIG,{pad:2.5,patch:.35}));
 pass('brookwillow',16,(Z)=>Z.rip*.45,o(SMALL,{pad:1.6,patch:.4}));
 pass('blackoak',60,(Z,x,z)=>SHADE(x,z)*.35*(1-CHAP(x,z)),o(BIG,{pad:4,own:3,patch:.4}));
 pass('copperpine',120,(Z,x,z)=>smooth(480,560,Z.y==null?BIO.terrainH(x,z):Z.y)*.15*(1-CHAP(x,z)),o(BIG,{pad:6,own:5,patch:.3}));};
NHL.STATION_LOGS=(x,z)=>.15+.85*Math.max(BIO.field('shade',x,z),BIO.field('grove',x,z));   /* the fallen oaks lie in the woods, a few on the grass */
NHL.STATION_PLANT=function(x,y,z,Z,lv,st,F){const t=rng(),ch=CHAP(x,z),sv=SAV(x,z);st.foot=st.foot||{grass:0,chap:0};const S=st.foot;
 if(lv===0){if(ch>.4){if(t<.5){F.shrub(x,y,z,0);S.chap++;}}else if(t<.55){F.grass(x,y,z,0,GOLD,1.2);S.grass++;}return true;}
 if(Z.rip>.4){if(t<.4)F.grass(x,y,z,lv,GREEN,1.2);else if(t<.6){F.bracken(x,y,z,lv);st.bracken++;}else if(t<.72){F.ladyFern(x,y,z,lv);st.ferns++;}else F.plantBank(x,y,z,Z,lv,st);return true;}
 if(ch>.45){   // chaparral: a dense low scrub, the shrub cards dark and leathery, heath between
  if(t<.55){F.shrub(x,y,z,lv,CHAPC);S.chap++;if(lv===2&&rng()<.5)F.shrub(x+rr(-1.2,1.2),y,z+rr(-1.2,1.2),lv,CHAPC);}else if(t<.8){F.heath(x,y,z,lv);st.heath++;}else F.grass(x,y,z,lv,GOLD,.9);return true;}
 // the golden grass: dense annual grass, a few wildflowers early in the year (bluebells' card), a shrub now and then
 if(t<.78){F.grass(x,y,z,lv,GOLD,sv>.4?1.25:1.1);S.grass++;}else if(t<.84)F.bluebells(x,y,z,lv,lv===2?ri(3,8):2);else if(t<.9){F.shrub(x,y,z,lv,CHAPC);S.chap++;}else if(t<.94)F.boulder(x,y,z,lv,st,false,.1);
 return true;};
})();
