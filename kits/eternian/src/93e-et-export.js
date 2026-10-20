// ================================================================= THE KIT'S PART OF A KRATOR-WORLD (core/export, P7)
// The sheet exports through core/export (`python3 tools/harness.py export kits/eternian/dist/eternian.html --out
// godot/data/world-eternian --box ...`): core/tags gives the registry, the KMAT adapter the materials, and this the
// ground as sampled terrain (the isle demo's route on the same engine: core/export/README.md, "Profiles"). A page built
// without core/export queues its part; the harness injects the exporter and drains the queue.
(function(R){const a=['terrain',ctx=>EXPORT.terrain(ctx.box||[-50,-50,50,50],{h:(x,z)=>terrainH(x,z),step:4}),{by:'eternian'}];
 if(typeof EXPORT!=='undefined'&&EXPORT&&EXPORT.register)EXPORT.register.apply(null,a);else (R.EXPORT_QUEUE=R.EXPORT_QUEUE||[]).push(a);})(window);
