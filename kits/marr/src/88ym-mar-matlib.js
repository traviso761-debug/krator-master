// ================================================================= 88ym. MARR: material library binding on Marr's own materials
// kits/marr/materials.json names library families for Marr's MAT keys (maCantera, maTile, maAzulejo, maZellige, maYeseria);
// tools/textures/pack.py packs them into kits/marr/tex/ and settlements/iziz/build.py --kit inlines them as KMAT.pack('marr')
// (69dz-kit-matlib-pack.js). maDiscZel (fountain disc, K doubled) takes maZellige's family through alias. ?mat=proc binds nothing.
const MAR_MATLIB=(typeof KMAT!=='undefined'&&KMAT.bindMat)?KMAT.bindMat('marr',MAT,{alias:{maZelligeD:'maZellige'}}):{};
