// ================================================================= HOST — station 2's own passes (the high benches)
// Before the build (88): the benches stand into cooler, wetter air (Cfa), so the FLAMETIP SCRUB FOREST closes up on them (twice station
// 1's density, less patchy), and the ember plums thin out to the drier tops; the canyons' fan palms along the deeper stream. Only the
// passes' acceptance changes (55: NECANYONS.PASSES, data); placement stays by cell, so nothing else moves
(function(){const P=NECANYONS.PASSES,fbm=BIO.fn.fbm,smooth=BIO.fn.smooth,by=sp=>P.find(p=>p.sp===sp);
 const ft=by(2);if(ft){const a=ft.accept;ft.accept=(x,z,Z)=>Z.zone==='bench'?Math.min(1,a(x,z,Z)*1.6+(1-Z.pan)*smooth(-7,-12,Z.d)*.18*smooth(.3,.6,fbm(x*.003-1,z*.003+2,93,2))):a(x,z,Z);}
 const pl=by(3);if(pl){const a=pl.accept;pl.accept=(x,z,Z)=>a(x,z,Z)*(Z.zone==='bench'?.6:1.2);}
 const fp=by(0);if(fp){const a=fp.accept;fp.accept=(x,z,Z)=>Math.min(1,a(x,z,Z)*1.3);}})();
