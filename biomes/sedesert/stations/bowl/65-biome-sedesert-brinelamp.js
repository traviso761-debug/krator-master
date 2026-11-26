// ================================================================= EASTERN DESERT, THE BOWL — the brine lamp, one builder for two kits
// Krator's own halophyte: a succulent whose salt glands crust its leaves in crystal, so a stand glitters at low sun; the medicine.
// The Bowl and the Catch each drew it with a builder of their own (EXCHANGES.md, catch and sedesert: "one builder, read by the
// other"); this is the one (the final rebuild, 2026-10-27). It needs only the kit's 50 and 60 (SEDESERT.TEX, G, small.tuft), which
// the Catch already reads in place, and the 'bowl' pack's `brinelamp` slot (card.brinelamp; the kit's aloe map without it), so a
// page lists this file and that pack and calls SEDESERT.BRINELAMP.put(x, y, z, lv, st) where a stand goes. Moved here out of
// 66-biome-sedesert-halo.js unchanged: the same material, item, tag and draws.
(function(){const {TAU,rr,ri}=BIO.fn;
const T3=BIO.host.THREE,G=SEDESERT.G,TX=SEDESERT.TEX,{tuft}=SEDESERT.small;
const M=BIO.leafMat(TX.aloe,'bowl-brinelamp',{swayW:'(position.y)',swayA:.01,alphaTest:.4});
const LIB=BIO.libSwap('bowl',{brinelamp:M});
// the crystals catch the low sun: a little emissive lift on its card so a stand glitters at dusk
M.emissive=new T3.Color(0x221e18);
BIO.def('brinelamp',G.tuft(),M,{label:'Brine lamp'});
const PLANT={name:'Brine lamp',tags:{climate:'tropic',aridity:'arid',abyssal:true,riparian:'no',salt:true,
 harvest:{wood:'none',edible:[],medicinal:true,notes:'The crystal-crusted leaf, steeped, is a salt-and-bitters remedy for heat sickness. A stand glitters at low sun.',fruit:null}},items:['brinelamp']};
const tuftAt=(x,y,z,h,w)=>{if(BIO.mask(x,z)<=0)return;tuft('brinelamp',x,BIO.terrainH(x,z),z,h,w,0xffffff);};
// a stand: two to five rosettes at a hero's distance, two mid-range, one far (larger, so the far floor keeps its glitter)
function put(x,y,z,lv,st){const n=lv===2?ri(2,5):lv===1?2:1;
 for(let i=0;i<n;i++){const a=rr(0,TAU),d=i?rr(.6,2.2):0,h=rr(.45,.9)*(lv===0?1.4:1);tuftAt(x+Math.cos(a)*d,y,z+Math.sin(a)*d,h*1.15,h);}if(st)st.brinelamps=(st.brinelamps||0)+1;}
/* the plant's record (its tags, for the inspector and biomes/FRUIT.md): a page files it in SEDESERT.PLANTS where it wants it (the Bowl's 66, in its
   old place, so the kit's PLANTS keep their order) */
SEDESERT.BRINELAMP={item:'brinelamp',material:M,lib:LIB,put,plant:PLANT};
})();
