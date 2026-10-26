// ================================================================= EASTERN DESERT, MANTIS'S POCKET — the tree passes
// The pocket's passes (they replace the Bowl's, 56), over the forest's species (57) and the kit's. Apart from 57 so another
// station can take the species without the passes (the steppe, station 3).
(function(){const {smooth}=BIO.fn;const F=(n,x,z)=>BIO.field(n,x,z);const SP=SEDESERT.SPECIES,sp=k=>SP.indexOf(SEDESERT.byKey[k]);
// ---------------------------------------------------------------- the pocket's passes (they replace the Bowl's, 56)
// a dense-air habit as on the delta (SEDESERT.ABYSSAL); the forest's own species grow at their own size (the monsoon's)
const dense=(T)=>{const A=SEDESERT.ABYSSAL[SP[T.sp].key];if(!A)return;T.H*=A.H;T.rb*=A.rb;T.crownR*=A.crownR;};
const fo=(x,z)=>F('forest',x,z),lu=(x,z)=>F('lush',x,z),pk=(x,z)=>F('pocket',x,z),dl=(x,z)=>F('delta',x,z),sp_=(x,z)=>F('spring',x,z);
const dryReg=(x,z)=>F('reg',x,z)*(1-F('salt',x,z))*(1-F('lake',x,z));
SEDESERT.PASSES=[
 // the forest's giants first: the figs along the streams and round the springs
 {sp:sp('figv'),cell:70,accept:(Z,x,z)=>fo(x,z)*(.24+.3*Math.max(sp_(x,z),dl(x,z))),opt:{pad:12,patch:.3,patchScale:.004}},
 // the dragon's blood trees in close groves on the forest's drier side and the savanna's edge
 {sp:sp('dragon'),cell:26,accept:(Z,x,z)=>smooth(.55,.85,pk(x,z))*(fo(x,z)*.14+lu(x,z)*.1)*smooth(.45,.65,BIO.fn.fbm(x*.004+3,z*.004,5701,2)),opt:{pad:4,patch:.6,patchScale:.008,size:dense}},
 {sp:sp('sterc'),cell:40,accept:(Z,x,z)=>fo(x,z)*.22+lu(x,z)*.03,opt:{pad:4,patch:.5}},
 {sp:sp('incense'),cell:40,accept:(Z,x,z)=>fo(x,z)*.14+lu(x,z)*.035+F('halo',x,z)*.04,opt:{pad:3,patch:.55,patchScale:.01}},
 {sp:sp('pom'),cell:30,accept:(Z,x,z)=>fo(x,z)*.14+lu(x,z)*.03*sp_(x,z),opt:{pad:2.5,patch:.5,small:true}},
 {sp:sp('cucumber'),cell:45,accept:(Z,x,z)=>lu(x,z)*.07*(1-sp_(x,z))+F('halo',x,z)*.05,opt:{pad:3,patch:.45,small:true}},
 // the wadi palms by the water and through the savanna; the mesquite in the savanna
 {sp:sp('palm'),cell:30,accept:(Z,x,z)=>(dl(x,z)*.45+sp_(x,z)*.3+lu(x,z)*.025)*(1-F('lake',x,z)),opt:{pad:2.5,patch:.5,water:false,size:dense}},
 {sp:sp('mesquite'),cell:42,accept:(Z,x,z)=>lu(x,z)*.07+F('halo',x,z)*.05,opt:{pad:2.5,patch:.5,size:dense}},
 // the kit's succulents where the pocket thins into the desert, and its bottle trees in the savanna
 {sp:sp('bottle'),cell:90,accept:(Z,x,z)=>lu(x,z)*.07+dryReg(x,z)*.05,opt:{pad:6,patch:.4,size:dense}},
 {sp:sp('candelabra'),cell:110,accept:(Z,x,z)=>dryReg(x,z)*.1+F('halo',x,z)*.04,opt:{pad:8,patch:.5,size:dense}},
 {sp:sp('rose'),cell:60,accept:(Z,x,z)=>dryReg(x,z)*.06+lu(x,z)*.01,opt:{pad:2,lodK:.5,patch:.4,small:true,size:dense}},
];
})();
