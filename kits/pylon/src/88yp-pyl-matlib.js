// ================================================================= 88yp. PYLON: the material library on Pylon's own materials
// kits/pylon/materials.json names a library set per Pylon MAT key; tools/textures/pack.py packs them into kits/pylon/tex/
// and settlements/iziz/build.py --kit inlines them as KMAT.pack('pylon') (69dz-kit-matlib-pack.js). This binds them in
// place, after Iziz's own bind (88y), so one tile of each world-UV map becomes one tile of its set. ?mat=proc binds
// nothing. The Vernacular's and the Ancients' materials Pylon draws in are bound by Iziz's pack.
const PYL_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('pylon',MAT,{alias:{pyGrilleD:'pyGrille'}}):{};
