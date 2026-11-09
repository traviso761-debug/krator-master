// ================================================================= HOST — the cloud forest (station 2, the high isle; before the build, 88)
// The plan's "cloud forest on the top few hundred metres": where the crest stands in the trade wind's cloud (the stage's cloudAt: above ~600 m and wet;
// the fog belt itself is 89zz's, STATION.belt). The kit has no cloud-forest tree of its own, so the high isle borrows the Throne's ELFIN TREE (the Throne's
// cloud forest station: gnarled, dwarfed, moss-hung, 3-9 m), read in place like the kit's other borrowed trees (RINGISLES.borrowGrow, the Throne's
// make/grow), on a pass of its own that runs first in the belt; the lowland canopy (lehua, the palms, breadfruit) thins as the cloud thickens, and the
// tree ferns (the Throne's, already borrowed) thicken. The kit's own files do not change: this is the host adding a borrowed species and a pass.
FIELD.cloud=(x,z)=>cloudAt(x,z,terrainH(x,z));
(function(){if(!RINGISLES.kitOf({kit:'throne'})||RINGISLES.borrowOf.elfin)return;
 const Bo={key:'elfin',kit:'throne',src:'elfin',scale:1,koppen:['Af','Am'],zone:'forest'};Bo.i=RINGISLES.BORROW.length;RINGISLES.BORROW.push(Bo);RINGISLES.borrowOf.elfin=Bo;
 const CL=(x,z)=>FIELD.cloud(x,z);
 RINGISLES.PASSES.forEach(P=>{if(['lehua','palmfrill','archpalm','breadfruit','junglepalm','screwpine'].indexOf(P.key)<0)return;const a=P.accept;P.accept=(Z,x,z)=>a(Z,x,z)*(1-.8*CL(x,z));});
 RINGISLES.PASSES.forEach(P=>{if(P.key!=='treefern')return;const a=P.accept;P.accept=(Z,x,z)=>a(Z,x,z)*(1+1.5*CL(x,z));});
 RINGISLES.PASSES.unshift({key:'elfin',cell:9,accept:(Z,x,z)=>.62*CL(x,z),opt:{pad:1.8,patch:.4,patchScale:.012}});})();
