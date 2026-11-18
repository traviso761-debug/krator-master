// ================================================================= SHUMARI MATERIALS: pierced jali & bronze tracery alpha, glossy crimson lacquer, cast bronze
for(const k of ['tracery','jali']){
 const m=MAT[k];
 if(m&&m.map){m.alphaTest=.48;m.side=THREE.DoubleSide;m.needsUpdate=true;}
 else if(m){m.side=THREE.DoubleSide;m.needsUpdate=true;}
}
if(MAT.frieze){MAT.frieze.roughness=.78;}
if(MAT.frieze_kattu){MAT.frieze_kattu.roughness=.62;MAT.frieze_kattu.metalness=.08;}
if(MAT.domeCarved){MAT.domeCarved.roughness=.82;}
if(MAT.lacquer){MAT.lacquer.roughness=.34;MAT.lacquer.metalness=.08;}
if(MAT.basalt){MAT.basalt.roughness=.68;MAT.basalt.metalness=.05;}
if(MAT.travertine){MAT.travertine.roughness=.76;}
if(MAT.ironstone){MAT.ironstone.roughness=.74;}
if(MAT.bronzeCast){MAT.bronzeCast.roughness=SM_SM6?.38:.42;MAT.bronzeCast.metalness=SM_SM6?.26:.68;}
if(MAT.bronze){MAT.bronze.roughness=SM_SM6?.32:.36;MAT.bronze.metalness=SM_SM6?.28:.74;}
if(MAT.gold){MAT.gold.roughness=SM_SM6?.26:.26;MAT.gold.metalness=SM_SM6?.32:.84;}
if(MAT.tracery){MAT.tracery.roughness=SM_SM6?.36:.45;MAT.tracery.metalness=SM_SM6?.26:.50;}
if(MAT.iron){MAT.iron.roughness=SM_SM6?.48:.52;MAT.iron.metalness=SM_SM6?.30:.55;}

