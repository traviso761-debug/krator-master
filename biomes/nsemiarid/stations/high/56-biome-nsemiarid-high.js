// ================================================================= N SEMIARID — station 2, the high country: its trees, its zones and its floor
// [G data] The kit's registry is open (50 to 70). PLAN-STATIONS.md station 2 ("Kin, not copies"): nhighlands' station 2 trees grow here as KIN
// (BIO.kin: cousins grown by nhighlands' own builders, smaller, as this side is drier: ~410 mm against nhighlands' ~500-800), and the eastern
// badlands' Great Basin trees (juniper, pinyon, aspen, Gambel oak, bristlecone) are read in place, as the kit's plan (PLAN.md section 7, "highland
// spurs") reads its neighbours. The kit's own flora keeps the bench (BSk), the walking steppe's highest form: the kit's zones are muted elsewhere.
// The station's fields (its stage, 45b): north (aspect), draw, chap, bsk, snow, talus, dome, meadow, burn.
(function(){const {TAU,clamp,lerp,mix,smooth,rng,rr,ri,pick}=BIO.fn;
const HIGH=NSEMIARID.HIGH={};
const fld=n=>(x,z)=>BIO.field(n,x,z),F={};['north','draw','chap','bsk','snow','talus','dome','meadow','burn','rock','wet'].forEach(n=>F[n]=fld(n));
// ---------------------------------------------------------------- the trees: kin and read in place
// KIN (nhighlands' station 2: its PLAN-STATIONS.md, "whichever station is built first sets the trees"): scale multiplies the size ranges
const kin=(src,d)=>{const K=BIO.kin(src,d);if(!K)BIO.err('nsemiarid high: no kin '+src+' (nhighlands on the page?)');return K;};
const KT=(koppen,ar)=>({koppen,aridity:ar||'semiarid'});
HIGH.KIN={
 drypine:kin('nhighlands.copperpine',{key:'drypine',name:'Dry copper pine',scale:{H:.66,rb:.72,crownR:.78},tags:KT(['Dsb','Csb','Dfb'])}),
 dryfir:kin('nhighlands.whitefir',{key:'dryfir',name:'Dry white fir',scale:{H:.7,rb:.75,crownR:.82},tags:KT(['Dsb','Dfb'],'subhumid')}),
 drawgiant:kin('nhighlands.embergiant',{key:'drawgiant',name:'Draw ember giant',scale:{H:.52,rb:.58,crownR:.66},tags:KT(['Dfb','Dsb'],'subhumid')}),
 scruboak:kin('nhighlands.blackoak',{key:'scruboak',name:'Scrub black oak',scale:{H:.42,rb:.5,crownR:.5},tags:KT(['Csb','Dsb'])}),
 // the old burns' snags: nhighlands' burn snag (it names no Koppen class of its own), shorter
 snag:kin('nhighlands.burnsnag',{key:'snag',name:'Burn snag',scale:{H:.7,rb:.8,crownR:.8},tags:KT(['Dsb','Csb'])})};
// READ IN PLACE (their own species and builders: BIO.kitBuilder)
const inPlace=(kit,key)=>{const B=BIO.kitBuilder(kit,key);if(!B)BIO.err('nsemiarid high: no builder '+kit+'.'+key);return B;};
HIGH.PLACE={juniper:inPlace('ebadlands','juniper'),pinyon:inPlace('ebadlands','pinyon'),aspen:inPlace('ebadlands','aspen'),
 gambel:inPlace('ebadlands','oak'),bristlecone:inPlace('ebadlands','bristlecone')};
// every species this station grows (its checks: tagged, placed, by aspect and by band), the kin's record or the source's
HIGH.SPECIES=Object.keys(HIGH.KIN).map(k=>HIGH.KIN[k]&&Object.assign({kin:true},HIGH.KIN[k].record,{key:k}))
 .concat(Object.keys(HIGH.PLACE).map(k=>HIGH.PLACE[k]&&Object.assign({kin:false,kit:HIGH.PLACE[k].kit},HIGH.PLACE[k].species,{key:k}))).filter(Boolean);
// THE PASSES (data; 87k-host-kin.js runs them): key, lattice cell (m), salt, acceptance from the fields at (x, z), the least clear radius, options.
// The park is open: one big tree to every ~50 m on the shaded faces, fewer on the sunny ones, where the junipers and pinyons stand instead
const sh=(x,z)=>Math.max(0,-F.north(x,z)),sun=(x,z)=>Math.max(0,F.north(x,z));
const live=(x,z)=>(1-smooth(.5,.8,F.rock(x,z)))*(1-smooth(.3,.6,F.snow(x,z)))*(1-F.bsk(x,z))*(1-smooth(.3,.6,F.meadow(x,z)));
const park=(x,z)=>live(x,z)*(1-F.chap(x,z)*.8)*(1-F.draw(x,z)*.5)*(1-smooth(.3,.6,F.talus(x,z)));
HIGH.PASSES=[
 // the red giants first: a few to the wettest draws (the Dfb fringe), as their kin's groves on nhighlands' side, smaller
 {key:'drawgiant',cell:150,salt:0x8a01,accept:(x,z)=>F.draw(x,z)*smooth(.34,.44,F.wet(x,z))*.6*live(x,z),r:8},
 // the draws: fir and aspen groves (aspen in clonal patches: a stand field)
 {key:'dryfir',cell:40,salt:0x8a02,accept:(x,z)=>(F.draw(x,z)*.42+sh(x,z)*.2*park(x,z))*live(x,z),r:3},
 {key:'aspen',cell:19,salt:0x8a03,accept:(x,z)=>F.draw(x,z)*.45*smooth(.52,.68,BIO.fn.fbm(x*.004+3,z*.004-9,8811,2))*live(x,z),r:1.4},
 // the park: dry copper pines in clumps on the shaded faces, sparse on the sunny ones
 {key:'drypine',cell:44,salt:0x8a04,accept:(x,z)=>(.1+.32*sh(x,z)+.06*smooth(.45,.65,BIO.fn.fbm(x*.003-5,z*.003+2,8812,2)))*park(x,z)*(1-F.burn(x,z)*.75),r:4},
 // juniper and pinyon on the sunny faces and the bench's edge: the drier side's most (the plan: "more juniper")
 {key:'juniper',cell:38,salt:0x8a05,accept:(x,z)=>(.05+.3*sun(x,z))*park(x,z)+.14*smooth(.15,.5,F.bsk(x,z))*smooth(.9,.6,F.bsk(x,z))+.08*F.chap(x,z)*live(x,z),r:2},
 {key:'pinyon',cell:36,salt:0x8a06,accept:(x,z)=>(.06+.2*sun(x,z))*park(x,z)*smooth(3750,3550,BIO.terrainH(x,z)),r:2},
 // the oak scrub (Csb) below the park: the black oak's scrub kin and Gambel oak in thickets
 {key:'scruboak',cell:26,salt:0x8a07,accept:(x,z)=>F.chap(x,z)*.42*live(x,z),r:2},
 {key:'gambel',cell:19,salt:0x8a08,accept:(x,z)=>F.chap(x,z)*.36*live(x,z)*smooth(.4,.6,BIO.fn.fbm(x*.006,z*.006,8813,2)),r:1.2},
 // the bristlecones: the domes' tops and the highest ground, few and old
 {key:'bristlecone',cell:46,salt:0x8a09,accept:(x,z)=>(smooth(.4,.8,F.dome(x,z))*smooth(.6,.85,1-F.rock(x,z)*.6)*.35+smooth(3820,3930,BIO.terrainH(x,z))*.18)*(1-smooth(.3,.6,F.snow(x,z))),r:2.5,onRock:true},
 // the old burns: snags standing in the grass
 {key:'snag',cell:30,salt:0x8a0a,accept:(x,z)=>F.burn(x,z)*.4*live(x,z),r:1.5}];
// ---------------------------------------------------------------- the kit's zones: the bench only
// The kit's zones read rain alone, so at ~410 mm they would draw its hot steppe over the whole flank; here they keep the bench (BSk) and its edge,
// where the kit's walking steppe (its dew gardens, drill grass, frills and trumpets) is the steppe's highest form
NSEMIARID.ZONE_HOOK=(Z,x,z)=>{const b=smooth(.35,.75,F.bsk(x,z));Z.steppe*=b;Z.desert*=b*.5;Z.med=0;Z.forest=0;Z.tugai=0;Z.rip=0;Z.pan=0;};
// the kit's own trees on the bench: a few frills and trumpets, the giant dandelions and foxtails (keys, so the indices are the kit's own)
const SPI=k=>NSEMIARID.SPECIES.findIndex(S=>S.key===k);
NSEMIARID.PASSES=[
 {sp:SPI('frill'),cell:90,accept:(Z)=>Z.steppe*.22,opt:{pad:4,patch:.5,patchScale:.006}},
 {sp:SPI('trumpet'),cell:40,accept:(Z,x,z)=>Z.steppe*.1*(NSEMIARID.standOf(x,z,2,71)===0?1:.2),opt:{pad:2,patch:.7,patchScale:.008}},
 {sp:SPI('foxtail'),cell:26,accept:(Z)=>Z.steppe*.08,opt:{pad:.8,patch:.85,patchScale:.016,lodK:.5,small:true}},
 {sp:SPI('dandelion'),cell:24,accept:(Z)=>Z.steppe*.12,opt:{pad:.8,patch:.8,patchScale:.016,lodK:.5,small:true}}].filter(P=>P.sp>=0);
HIGH.KIT_SPECIES=['frill','trumpet','foxtail','dandelion'];
// ---------------------------------------------------------------- the floor (the kit's floor pass calls this first; false: the kit's own planters)
const PAL=NSEMIARID.PAL;   /* NSEMIARID.small (the floor's helpers) is the kit's 60, after this: read when the floor runs */
const FIREWEED=[0xb04a8a,0xc0569a,0xa04080],MELT=[0xf0d040,0xe8e0f0,0x8a9ae0],MEAD=[0xf0c030,0xe8e0f0,0x9a6ac8,0xe8302a];
NSEMIARID.STATION_PLANT=function(x,y,z,Z,lv,st){const bk=F.bsk(x,z);if(bk>.6)return false;   /* the bench: the kit's walking steppe */
 const S=NSEMIARID.small,H=st.high||(st.high={bunch:0,sage:0,scrub:0,meadow:0,melt:0,scree:0,slab:0,burn:0,draw:0});
 const sn=F.snow(x,z),dm=F.dome(x,z),ta=F.talus(x,z),me=F.meadow(x,z),dr=F.draw(x,z),ch=F.chap(x,z),bu=F.burn(x,z),no=F.north(x,z),rk=F.rock(x,z),t=rng();
 if(sn>.4)return true;   /* the snowbed and its wet edge: nothing grows on it (a clump's spread from .5 reached .65: four plants on the snow) */
 if(dm>.5||rk>.7){if(t<.22){S.stone(x,y,z,lv,PAL.rockTan,st,.8);H.slab++;}else if(t<.28){S.wormwood(x,y,z,lv,.45);st.shrubs++;}return true;}   /* the slabs */
 if(ta>.45){if(t<.5){S.stone(x,y,z,lv,PAL.rockTan,st,1.3);H.scree++;}else if(t<.58)S.boulder(x,y,z,lv,PAL.rockTan,st);else if(t<.72){S.stipa(x,y,z,lv);st.tufts++;}return true;}   /* the talus */
 if(sn>.12){if(t<.4){S.grass(x,y,z,lv,1);st.tufts++;}else if(t<.6)S.sedge(x,y,z,lv);else if(t<.88){S.tulips(x,y,z,lv);st.flowers++;}H.melt++;return true;}   /* the melt below a snowbed: tulips */
 if(me>.4){if(t<.45){S.grass(x,y,z,lv,1.2);st.tufts++;}else if(t<.65)S.sedge(x,y,z,lv);else if(t<.88){S.blooms(x,y+.2,z,rr(.6,1.4),lv===2?ri(4,9):2,MEAD);st.flowers++;}else{S.tulips(x,y,z,lv);st.flowers++;}H.meadow++;return true;}
 if(dr>.45){if(t<.4){S.grass(x,y,z,lv,1.1);st.tufts++;}else if(t<.55){S.blooms(x,y+.2,z,rr(.6,1.2),lv===2?ri(3,7):2,MELT);st.flowers++;}else if(t<.65)S.sedge(x,y,z,lv);else if(t<.72)S.stone(x,y,z,lv,PAL.rockTan,st,.7);H.draw++;return true;}
 if(bu>.4){if(t<.45){S.stipa(x,y,z,lv);st.tufts++;}else if(t<.75){S.blooms(x,y+.3,z,rr(.6,1.4),lv===2?ri(4,9):2,FIREWEED,[.14,.22]);st.flowers++;}else if(t<.82)S.stone(x,y,z,lv,PAL.rockTan,st,.7);H.burn++;return true;}   /* fireweed in an old burn */
 if(ch>.4){if(t<.28){S.buckthorn(x,y,z,lv,st);H.scrub++;}else if(t<.48){S.wormwood(x,y,z,lv,1);st.shrubs++;H.sage++;}else if(t<.75){S.stipa(x,y,z,lv);st.tufts++;}else if(t<.85){S.grass(x,y,z,lv,.8);st.tufts++;}else S.stone(x,y,z,lv,PAL.rockTan,st);return true;}   /* the oak scrub's chaparral */
 /* the park: bunchgrass and sagebrush (the kit's wormwood, an Artemisia) over the duff; more sage on the sunny faces, a few tulips */
 const sg=.24+.18*Math.max(0,no);
 if(t<.42){S.stipa(x,y,z,lv);st.tufts++;H.bunch++;}else if(t<.42+sg){S.wormwood(x,y,z,lv,1.1);st.shrubs++;H.sage++;}else if(t<.8){S.grass(x,y,z,lv,.8);st.tufts++;}
 else if(t<.83){S.tulips(x,y,z,lv);st.flowers++;}else if(t<.92)S.stone(x,y,z,lv,PAL.rockTan,st);
 return true;};
})();
