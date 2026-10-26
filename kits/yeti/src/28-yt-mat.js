// ================================================================= THE KIT'S MATERIALS: what the vendored svLibMat does not know
// 27-mat.js (the Scyvoi engine, vendored) builds every SV_LIB key as one lit standard material. Three want more, set here
// so the engine stays byte for byte the Scyvoi kit's:
//   ice     the lake-ice lenses in the window holes and at a crown: clear, a little glossy, and lit from inside (a faint
//           warm emissive by day; the lamplight through the ice at night comes with the night pass, Y3);
//   gut     the sewn gut panes where pycrete is only seasonal: translucent, seen from both faces;
//   pycrete the fresh shell and its block courses: smoother than the scan reads (the refrozen skin), the summer set rougher.
if(MAT.ice){const m=MAT.ice;m.transparent=true;m.opacity=.82;m.depthWrite=false;m.roughness=.18;m.emissive.setHex(0xffd8a0);m.emissiveIntensity=.08;}
if(MAT.gut){const m=MAT.gut;m.transparent=true;m.opacity=.9;m.side=THREE.DoubleSide;m.emissive.setHex(0xffd8a0);m.emissiveIntensity=.12;}
for(const k of ['pycrete','course'])if(MAT[k]){MAT[k].roughness=.55;}
if(MAT.pycreteOld)MAT.pycreteOld.roughness=1;
