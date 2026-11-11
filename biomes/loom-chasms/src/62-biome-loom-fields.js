// ================================================================= THE LOOM-CHASMS — the Cradle's fields: a crop drawn on its card
// PLAN.md section 4, the Cradle: "the Yuni fields on the terraces, chosen with CROPS.forBiome / CROPS.at". The crop is kits/crops' record (read in
// place: its warmth, air and aridity bands, its bucket, its library card); the host picks one per field (CROPS.pick, seeded by the field's id) and
// places the clumps; this kit draws a clump on the crop's card. A record: {x, z, crop (a CROPS record), seed, k (0..1: the clump's size in its range)}.
// The cards this kit can draw (materials.json): the grain head (pale, tinted by the crop's colour: emmer, frost oat), the bean, the flax, the
// saffron, the woad. A crop whose card is not one of them is not drawn here (the host picks among those that are).
(function(){const {TAU,clamp,mix,reseed,rng,rr,ri,qEuler}=BIO.fn;const T3=BIO.host.THREE,{bright,vary}=BIO.col;
LOOM.CROP_ITEM={'card.crop.grainhead':'cropGrain','card.crop.bean':'cropBean','card.crop.flax':'cropFlax','card.crop.saffron':'cropSaffron','card.crop.woad':'cropWoad'};
/* a clump's height (m) and its tint by bucket: the grains gold, the rest their card's own colour */
const H={grain:[.7,1.2],pulse:[.9,1.6],spinning:[.6,1],spice:[.2,.35],dye:[.6,1.1]},TINT={grain:[0xd8c080,0xccb070,0xe0c890]};
const M=LOOM.MAT,TX=LOOM.TEX,G=LOOM.G;
const lf=(key,o)=>BIO.leafMat(TX.hang,key,o);
M.cropGrain=lf('cropGrain',{swayW:'(position.y)',swayA:.14});M.cropBean=lf('cropBean',{swayW:'(position.y)',swayA:.08});M.cropFlax=lf('cropFlax',{swayW:'(position.y)',swayA:.12});
M.cropSaffron=lf('cropSaffron',{swayW:'(position.y)',swayA:.04});M.cropWoad=lf('cropWoad',{swayW:'(position.y)',swayA:.06});
BIO.libSwap('loom-chasms',{cropGrain:M.cropGrain,cropBean:M.cropBean,cropFlax:M.cropFlax,cropSaffron:M.cropSaffron,cropWoad:M.cropWoad});
/* a TUFT: three crossed upright quads on y=0..1 (the Great Chasm kit's) */
const tuft=(function(){const pos=[],uv=[],nor=[];for(let k=0;k<3;k++){const a=k/3*Math.PI+.2,ca=Math.cos(a),sa=Math.sin(a);const P=[[-.5,0],[.5,0],[.5,1],[-.5,1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,1-q[1]]);
 [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}return BIO.geo._make(pos,nor,uv);})();
const LAB={cropGrain:'A grain crop (the Yuni fields)',cropBean:'Helix beans (the Yuni fields)',cropFlax:'Flax (the Yuni fields)',cropSaffron:'Saffron (the Yuni fields)',cropWoad:'Woad (the Yuni fields)'};
for(const k in LAB)BIO.def(k,tuft,M[k],{label:LAB[k]});
LOOM.PLANTS.yunicrops={name:'The Yuni fields (kits/crops)',items:Object.keys(LAB),tags:{climate:'temperate',aridity:'semiarid',abyssal:false,riparian:'both',koppen:['Cwb','BSk','Dsb'],
 harvest:{wood:'none',edible:['grain','beans','saffron'],medicinal:false,fruit:null,note:'The crops are kits/crops\' records (CROPS.at on the Cradle\'s bands), one per field.'}}};
LOOM.drawCrop=function(rec){const it=LOOM.CROP_ITEM[rec.crop.card];if(!it)return 0;reseed(rec.seed>>>0);const b=rec.crop.bucket,hr=H[b]||[.5,1],h=mix(hr[0],hr[1],rec.k==null?rng():rec.k);
 const col=TINT[b]?bright(vary(TINT[b][ri(0,TINT[b].length-1)],.02,.05,.05),1):0xffffff,y=BIO.terrainH(rec.x,rec.z)-.04;
 BIO.put(it,[rec.x,y,rec.z],qEuler(rr(-.04,.04),rr(0,TAU),rr(-.04,.04)),[h*rr(.7,1),h,h*rr(.7,1)],col);return 1;};
})();
