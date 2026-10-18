// ================================================================= 88yt. TALIA: the material library on Talia's own materials
// kits/talia/materials.json names a library set per Talia MAT key; tools/textures/pack.py packs them into kits/talia/tex/
// and settlements/iziz/build.py --kit inlines them as KMAT.pack('talia') (69dz-kit-matlib-pack.js). This binds them in
// place, after Iziz's own bind (88y). taMarble and taTile tile by their world UVs; taGilt has none, so one tile of the
// gold is a metre. ?mat=proc binds nothing. The Vernacular's materials Talia draws in are bound by Iziz's pack.
const TAL_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('talia',MAT,{tile:{taGilt:1}}):{};
