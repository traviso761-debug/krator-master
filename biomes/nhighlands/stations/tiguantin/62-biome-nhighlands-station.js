// ================================================================= NORTHERN HIGHLANDS — station 6, the Tiguantin cloud-terraces: its passes and its floor
// [G data] Replaces station 2's file of the same name (this station's base). The cloud forest of the Lesser Throne's mist belt from the kit's own
// species: shadow hemlock and silver fir veiled in beard lichen on the sheet's top (the cloud-veil conifers), spire spruce at its windward edge, moss
// maple and shag maple under them, fog laurel and gnarled oak on the spur's megabreccia and the gully's lip, a few veil banyans; the gully's floor alder
// and willow; the terraces' treads grown over with fern, moss and rowan. The Throne's elfin trees, tree ferns and veil trees are read in place
// (87-host-station-kin.js). Nothing stands on the skylight's lip and the monks' winch camp (`keep`), the gully's cliffs or the terraces' walls.
// Fields from the SITE (44z): `terrace`, `cliff`, `sheet`, `spur`, `keep`, `spring`.
(function(){
const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick,qEuler}=BIO.fn;
const fld=n=>(x,z)=>BIO.field(n,x,z),TER=fld('terrace'),CLF=fld('cliff'),SHT=fld('sheet'),SPR=fld('spur'),KEEP=fld('keep'),WET=fld('spring');
const MOSS=[0x4e7a28,0x5a8a2e,0x426a22,0x6a9432],GRN=[0x5a8a34,0x6a9a3a,0x4e7a2e];
// ---------------------------------------------------------------- the forest
NHL.STATION_PASSES=function(P){const {pass,o,BIG,SMALL}=P,ok=(x,z)=>(1-smooth(.15,.45,KEEP(x,z)))*(1-smooth(.2,.5,CLF(x,z)));
 // the cloud-veil conifers on the sheet's top and the spur's shoulders
 pass('shadowhemlock',40,(Z,x,z)=>(.38*SHT(x,z)+.18*SPR(x,z)+.08)*ok(x,z)*(1-TER(x,z)),o(BIG,{pad:2.5,patch:.35,mod:(T)=>{T.H=Math.min(T.H,38);}}));
 pass('silverfir',50,(Z,x,z)=>(.24*SHT(x,z)+.05)*ok(x,z)*(1-TER(x,z)),o(BIG,{pad:3,patch:.4,mod:(T)=>{T.H=Math.min(T.H,42);}}));
 pass('spirespruce',38,(Z,x,z)=>.16*SHT(x,z)*smooth(.38,.44,Z.cold)*ok(x,z),o(BIG,{pad:1.8,patch:.4}));
 // the broadleaves under them: moss maple, shag maple in its moss sleeves, a few veil banyans
 pass('mossmaple',56,(Z,x,z)=>(.24*SHT(x,z)+.12*(1-SHT(x,z))*(1-TER(x,z)))*ok(x,z),o(BIG,{pad:3.5,own:3,patch:.35,mod:(T)=>{T.H=Math.min(T.H,26);}}));
 pass('shagmaple',64,(Z,x,z)=>.2*SHT(x,z)*ok(x,z),o(BIG,{pad:4,own:4,patch:.4}));
 pass('banyan',300,(Z,x,z)=>.35*SHT(x,z)*ok(x,z)*(1-SPR(x,z)),o(BIG,{hero:420,mid:820,pad:14,own:16,patch:0}));
 // the spur's megabreccia and the gully's lip: gnarled oak and fog laurel, low and wind-bent
 pass('gnarloak',26,(Z,x,z)=>(.5*SPR(x,z)+.12*SHT(x,z)*smooth(.6,.2,SHT(x,z)))*ok(x,z),o(BIG,{pad:2.5,own:2,patch:.25}));
 pass('foglaurel',26,(Z,x,z)=>(.32*SPR(x,z)+.12*SHT(x,z)+.15*TER(x,z))*ok(x,z),o(SMALL,{pad:2,patch:.4}));
 // the terraces' treads: rowan and fog laurel only, sparse (the walls stay readable)
 pass('rowan',30,(Z,x,z)=>.14*TER(x,z)*ok(x,z),o(SMALL,{pad:3,patch:.5}));
 // the gully's floor: alder and willow on the stream's banks
 pass('greyalder',22,(Z,x,z)=>Z.rip*.55*(1-TER(x,z)*.7)*ok(x,z),o(BIG,{pad:2.5,patch:.35,mod:(T)=>{T.H=Math.min(T.H,16);}}));
 pass('brookwillow',16,(Z,x,z)=>Z.rip*.45*ok(x,z),o(SMALL,{pad:1.6,patch:.4}));};
NHL.STATION_LOGS=(x,z)=>.5*(1-smooth(.15,.45,KEEP(x,z)))*(1-TER(x,z))*(1-smooth(.2,.5,CLF(x,z)));
// ---------------------------------------------------------------- the floor
// cloud-forest floor: moss carpets and cushions, sword and lady ferns, sorrel, mushrooms; the terraces' treads mossed and ferned, wettest at the springs
// along the contact; the spur bare megabreccia under lichen, heath and moss; the camp's ground trodden bare (nothing)
NHL.STATION_PLANT=function(x,y,z,Z,lv,st,F){const t=rng(),te=TER(x,z),cf=CLF(x,z),sp=SPR(x,z),kp=KEEP(x,z),wt=WET(x,z);st.tig=st.tig||{moss:0,fern:0,spring:0};const S=st.tig;
 if(kp>.35||cf>.5)return true;
 if(lv===0){if(t<.4)F.mossMat(x,y,z,rr(1.2,2.4),MOSS);else if(t<.6)F.grass(x,y,z,0,GRN,.9);return true;}
 if(wt>.4){   // the contact springs: wet moss, lady ferns, sorrel
  if(t<.35){F.mossMat(x,y,z,rr(.6,1.4),MOSS);S.spring++;}else if(t<.7){F.ladyFern(x,y,z,lv);st.ferns++;S.fern++;}else if(t<.85){F.sorrel(x,y,z,lv);st.sorrel++;}return true;}
 if(te>.4){   // a tread: moss, ferns, grass between the stones, a fallen stone here and there
  if(t<.3){F.mossMat(x,y,z,rr(.5,1.3),MOSS);S.moss++;}else if(t<.52){F.swordFern(x,y,z,lv);st.ferns++;S.fern++;}else if(t<.66){F.ladyFern(x,y,z,lv);st.ferns++;S.fern++;}
  else if(t<.8)F.grass(x,y,z,lv,GRN,1);else if(t<.86){F.sorrel(x,y,z,lv);st.sorrel++;}return true;}
 if(sp>.4){   // the spur: lichen, heath and moss cushions on the breccia
  if(t<.3){F.lichen(x,y,z,lv);st.lichen++;}else if(t<.5){F.heath(x,y,z,lv);st.heath++;}else if(t<.72)F.mossCushion(x,y,z,rr(.3,.8),MOSS);else if(t<.8)F.boulder(x,y,z,lv,st,rng()<.5,.12);return true;}
 // the cloud forest's floor
 if(t<.28){F.mossMat(x,y,z,rr(.6,1.6),MOSS);S.moss++;}else if(t<.48){F.swordFern(x,y,z,lv);st.ferns++;S.fern++;}else if(t<.6){F.ladyFern(x,y,z,lv);st.ferns++;S.fern++;}
 else if(t<.68){F.sorrel(x,y,z,lv);st.sorrel++;}else if(t<.73){F.mushrooms(x,y,z,lv,ri(2,6),.8,[0xd8a040,0xe8dcc8,0x8a4a2a]);st.mush++;}else if(t<.8)F.mossCushion(x,y,z,rr(.3,.7),MOSS);else if(t<.86&&Z.rip>.3)F.plantBank(x,y,z,Z,lv,st);
 return true;};
})();
