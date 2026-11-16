// ================================================================= NORTHERN HIGHLANDS — station 4, the alpine: its passes and its floor
// [G data] Replaces station 2's file of the same name (this station's base). The tree line: whitebark pines (the kit's, new for this station) on the sunny
// slopes, foxtail pines (the old ones) on the stony knolls and ridges, larch and frost fir in the sheltered hollows below the line, the kit's krummholz
// (wind spruce) above it; then nothing. The floor: fell-field (lichen, heath, cushion plants, the alpine grass), talus boulders under the steps, little in the
// snowbeds. Fields from the SITE (44z): `talus`, `snowbed`, `fell`; the kit's own `alpine` zone from `cold`.
(function(){
const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick,qEuler}=BIO.fn,T3=BIO.host.THREE,C=h=>new T3.Color(h);
const fld=n=>(x,z)=>BIO.field(n,x,z),TAL=fld('talus'),SNOW=fld('snowbed'),FELL=fld('fell');
const ALP=[0x7a8458,0x8a9460,0x6e7a50],CUSH=[0x6a7a3a,0x7a8040,0x8a7a4a];
NHL.STATION_PASSES=function(P){const {pass,o,BIG,SMALL}=P,ok=(x,z)=>(1-smooth(.3,.6,TAL(x,z)))*(1-smooth(.2,.5,SNOW(x,z)));
 // the tree line: the band where cold is .8-.9; the sunny (north-facing) side holds the trees higher
 pass('whitebark',30,(Z,x,z)=>smooth(.92,.84,Z.cold)*(.35+.3*smooth(0,.6,BIO.field('north',x,z)))*ok(x,z),o(SMALL,{far:true,pad:2,own:2,patch:.45}));
 pass('foxtail',44,(Z,x,z)=>smooth(.94,.86,Z.cold)*smooth(.15,.45,Z.rock)*.4*ok(x,z),o(SMALL,{far:true,pad:2.5,own:2,patch:.35,mod:(T)=>{T.lean=rr(0,TAU);}}));
 pass('larch',40,(Z,x,z)=>smooth(.87,.81,Z.cold)*.3*ok(x,z),o(BIG,{pad:2.5,patch:.55,mod:(T)=>{T.H=Math.min(T.H,18);}}));
 pass('frostfir',36,(Z,x,z)=>smooth(.87,.8,Z.cold)*.3*ok(x,z),o(BIG,{pad:1.8,patch:.45,mod:(T)=>{T.H=Math.min(T.H,16);}}));
 pass('windspruce',18,(Z,x,z)=>smooth(.86,.9,Z.cold)*smooth(.97,.93,Z.cold)*.6*ok(x,z),o(SMALL,{pad:1.2,patch:.4,mod:(T,Z)=>{T.H=Math.min(T.H,lerp(5,2.6,smooth(.9,.96,Z.cold)));}}));   /* krummholz: lower the colder (above the line, under 3 m) */
 pass('brookwillow',22,(Z)=>Z.rip*.3*smooth(.95,.88,Z.cold),o(SMALL,{pad:1.4,patch:.4,mod:(T)=>{T.H*=.45;T.crownR*=.6;}}));};
NHL.STATION_LOGS=(x,z)=>.2*smooth(.92,.84,BIO.field('cold',x,z));   /* a few below the tree line only */
NHL.STATION_PLANT=function(x,y,z,Z,lv,st,F){const t=rng(),tl=TAL(x,z),sb=SNOW(x,z),fe=FELL(x,z);st.alp=st.alp||{talus:0,fell:0};const S=st.alp;
 if(lv===0){if(tl>.4){if(t<.5){F.boulder(x,y,z,0,st,rng()<.4,.1);S.talus++;}}else if(t<.35){F.grass(x,y,z,0,ALP,.8);}return true;}
 if(tl>.4){   // talus: blocks of the wall's rock, lichen on them, little else
  if(t<.55){F.boulder(x,y,z,lv,st,rng()<.5,.12);S.talus++;}else if(t<.7){F.lichen(x,y,z,lv);st.lichen++;}return true;}
 if(sb>.4){if(t<.25)F.grass(x,y,z,lv,[0x6a8a4a,0x7a9a50],.6);else if(t<.32)F.mossMat(x,y,z,rr(.4,1));return true;}   // a snowbed's late, short green
 if(fe>.4||Z.alpine>.6){   // fell-field: lichen, heath, cushion plants, a little grass among stones
  if(t<.25){F.lichen(x,y,z,lv);st.lichen++;}else if(t<.45){F.heath(x,y,z,lv);st.heath++;}else if(t<.6){F.mossCushion(x,y,z,rr(.25,.6),CUSH);S.fell++;}
  else if(t<.78)F.grass(x,y,z,lv,ALP,.7);else if(t<.88)F.boulder(x,y,z,lv,st,false,.1);return true;}
 F.plantAlpine(x,y,z,Z,lv,st);if(rng()<.2)F.plantBoreal(x,y,z,Z,lv,st);return true;};
})();
