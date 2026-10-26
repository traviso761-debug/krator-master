// ================================================================= EASTERN DESERT, THE BOWL — the dense-air habit and the tree passes
// PLAN-BOWL.md section 4. The Bowl's floor stands under 1.83 atm, as the hyperjungle's: the kit's species grow there in their
// DENSE-AIR FORMS (a habit variant, tags.abyssal true): the dragon tree squatter, its umbrella wider and flatter; the bottle
// tree swollen to baobab size; the desert rose's caudex a boulder; the giant candelabra and the cardon shorter and
// thicker-armed; the quiver tree and the boojum rarer (they want the slopes). The habit is DATA: a scale on each species'
// height, bole and crown, applied by the pass's size hook to the record the kit's own builder draws (55). The wadi palm and
// the mesquite line the delta's channels.
// The passes replace the kit's SEDESERT.PASSES on this page: the same shape (species, cell, acceptance, options), their
// acceptance read from the Bowl's fields (45: lake, flat, delta, halo, reg, yard, salt) in place of the kit's zones.
(function(){const {smooth,rr}=BIO.fn;
const F=(n,x,z)=>BIO.field(n,x,z);
// the dense-air habit: multipliers on H, rb (the bole) and crownR, per species key
SEDESERT.ABYSSAL={
 dragon:{H:.62,rb:1.35,crownR:1.55},
 bottle:{H:1.3,rb:2.5,crownR:1.4},
 rose:{H:1.15,rb:2.2,crownR:1.25},
 candelabra:{H:.66,rb:1.5,crownR:1.12},
 cardon:{H:.68,rb:1.45,crownR:1.12},
 quiver:{H:.8,rb:1.35,crownR:1.2},
 boojum:{H:.72,rb:1.35,crownR:1},
 mesquite:{H:.9,rb:1.15,crownR:1.3},
 palm:{H:.85,rb:1.2,crownR:1.15}};
SEDESERT.SPECIES.forEach(S=>{if(SEDESERT.ABYSSAL[S.key])S.tags=Object.assign({},S.tags,{abyssal:true,habit:'dense-air form (the Bowl, 1.83 atm)'});});
const sp=k=>SEDESERT.SPECIES.indexOf(SEDESERT.byKey[k]);
// the size hook: the habit's multipliers on the record the pass drew (its draws are made first, so the stream is the kit's)
const dense=(T)=>{const A=SEDESERT.ABYSSAL[SEDESERT.SPECIES[T.sp].key];if(!A)return;T.H*=A.H;T.rb*=A.rb;T.crownR*=A.crownR;};
// the land the kit's succulents take: the reg and the kaluts' feet, not the salt, the water or the dunes' slip faces
const dry=(x,z)=>F('reg',x,z)*(1-F('salt',x,z))*(1-F('lake',x,z))*(1-F('dune',x,z)*.7);
SEDESERT.PASSES=[
 // the wadi palms on the delta's levees, where the water is (the host's water window)
 {sp:sp('palm'),cell:30,accept:(Z,x,z)=>F('delta',x,z)*smooth(.55,.9,F('wet',x,z))*.5*(1-F('lake',x,z)),opt:{pad:2.5,patch:.5,patchScale:.008,water:true,size:dense}},
 // the mesquites: tall along the channels, shrubs out at the halo's edge
 {sp:sp('mesquite'),cell:30,accept:(Z,x,z)=>F('delta',x,z)*.42+F('halo',x,z)*.05*(1-F('salt',x,z)),opt:{pad:2.5,patch:.5,patchScale:.012,
  size:(T,Z)=>{const S=SEDESERT.SPECIES[T.sp],k=smooth(.2,.8,F('delta',T.x,T.z));T.H=(S.H[0]*.7+(S.H[1]-S.H[0]*.7)*k)*rr(.85,1.1);T.crownR=(S.crownR[0]*.6+(S.crownR[1]-S.crownR[0]*.6)*k)*rr(.85,1.1);T.rb=S.rb[0]+(S.rb[1]-S.rb[0])*k;dense(T);}}},
 // the dragon trees: squat umbrellas scattered on the reg and the kaluts' feet
 {sp:sp('dragon'),cell:90,accept:(Z,x,z)=>dry(x,z)*.12+F('yard',x,z)*(1-F('rock',x,z))*.06,opt:{pad:6,patch:.5,patchScale:.006,size:dense}},
 // the bottle trees swollen to baobabs, alone on the reg
 {sp:sp('bottle'),cell:110,accept:(Z,x,z)=>dry(x,z)*.1,opt:{pad:8,patch:.4,size:dense}},
 // the big succulents, short and thick-armed, in thin stands across the reg
 {sp:sp('candelabra'),cell:110,accept:(Z,x,z)=>(SEDESERT.standOf(x,z)===0?.12:.02)*dry(x,z),opt:{pad:8,patch:.5,patchScale:.006,size:dense}},
 {sp:sp('cardon'),cell:100,accept:(Z,x,z)=>(SEDESERT.standOf(x,z)===1?.12:.02)*dry(x,z),opt:{pad:7,patch:.5,patchScale:.006,size:dense}},
 // the quiver trees and the boojums, rare (they want the slopes the floor has none of)
 {sp:sp('quiver'),cell:150,accept:(Z,x,z)=>dry(x,z)*.03+F('yard',x,z)*.03,opt:{pad:3,patch:.4,size:dense}},
 {sp:sp('boojum'),cell:160,accept:(Z,x,z)=>dry(x,z)*.025,opt:{pad:3,patch:.4,size:dense}},
 // the desert roses at the kaluts' feet and on the reg's stones, their caudices boulders
 {sp:sp('rose'),cell:50,accept:(Z,x,z)=>F('yard',x,z)*.18+dry(x,z)*.05,opt:{pad:2,lodK:.5,patch:.4,small:true,size:dense}},
];
})();
