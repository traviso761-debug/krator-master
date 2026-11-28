// ================================================================= MATERIAL REFINEMENTS: library maps on engine fallback keys & PBR sheen
// Runs right after core/engine/27-mat.js (which overwrote MAT.plain, MAT.brass, MAT.bone and MAT.flag with untextured materials).
// Re-applying svLibMat guarantees 100% of opaque/lit surfaces carry decoded library textures, and sets PBR sheen on white paktong,
// verdigris nickel-ash, serpentinite, brucite-travertine, tarred mangrove, catechu stain, oiled sharkskin, and nacreous shell chimes.
svLibMat('plain',{rough:.84});
svLibMat('brass',{rough:.34,metal:.78});
svLibMat('bone',{rough:.56});
svLibMat('flag',{rough:.76});
if(MAT.paktong){MAT.paktong.roughness=.22;MAT.paktong.metalness=.86;}
if(MAT.verdigris){MAT.verdigris.roughness=.38;MAT.verdigris.metalness=.42;}
if(MAT.bronze){MAT.bronze.roughness=.34;MAT.bronze.metalness=.78;}
if(MAT.iron){MAT.iron.roughness=.46;MAT.iron.metalness=.58;}
if(MAT.serpentinite)MAT.serpentinite.roughness=.44;
if(MAT.brucite)MAT.brucite.roughness=.48;
if(MAT.limewash)MAT.limewash.roughness=.78;
if(MAT.tarmangrove)MAT.tarmangrove.roughness=.42;
if(MAT.catechutrim)MAT.catechutrim.roughness=.38;
if(MAT.bitumen)MAT.bitumen.roughness=.24;
if(MAT.shellchime)MAT.shellchime.roughness=.26;
for(const skMk of ['sharkhide','rayhide','catechu','byssus','kelp','netting','shellchime','flag']){
 if(MAT[skMk]){
  MAT[skMk].side=THREE.DoubleSide;
  if(skMk==='sharkhide'||skMk==='rayhide')MAT[skMk].roughness=.44;
  else if(skMk==='byssus')MAT[skMk].roughness=.36;
 }
}
svAnimHooks();
