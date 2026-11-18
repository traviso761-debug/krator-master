// ================================================================= SHUMARI MATERIALS: pierced jali & bronze tracery alpha, glossy crimson lacquer, cast bronze
for(const k of ['tracery','jali']){
 const m=MAT[k];
 if(m&&m.map){m.alphaTest=.48;m.side=THREE.DoubleSide;m.needsUpdate=true;}
 else if(m){m.side=THREE.DoubleSide;m.needsUpdate=true;}
}
if(MAT.frieze){MAT.frieze.roughness=.78;}
if(MAT.domeCarved){MAT.domeCarved.roughness=.82;}
if(MAT.lacquer){MAT.lacquer.roughness=.34;MAT.lacquer.metalness=.08;}
if(MAT.basalt){MAT.basalt.roughness=.68;MAT.basalt.metalness=.05;}
if(MAT.travertine){MAT.travertine.roughness=.76;}
if(MAT.ironstone){MAT.ironstone.roughness=.74;}
if(MAT.bronzeCast){MAT.bronzeCast.roughness=.42;MAT.bronzeCast.metalness=.68;}
if(MAT.bronze){MAT.bronze.roughness=.36;MAT.bronze.metalness=.74;}
if(MAT.gold){MAT.gold.roughness=.26;MAT.gold.metalness=.84;}
if(MAT.iron){MAT.iron.roughness=.52;MAT.iron.metalness=.55;}
