// ================================================================= HOST — build
// The order a world follows: its own structures first (they fill OBSTACLES), then the kit, then one bake.
window._biome=null;
(function(){
 const t0=performance.now();
 // ?q=0.5 builds at a lower quality; ?nobake=1 measures the build without drawing it (for budgeting)
 const Q=new URLSearchParams(location.search),q=Q.has('q')?+Q.get('q'):1;
 // one mirror-handed coilbark where a camera finds it: the nearest to the deepest cloud forest on the spine
 {let bx=0,bz=-1200,bs=-1e9;for(let z=-2400;z<=0;z+=40)for(let x=-2400;x<=2400;x+=40){if(BIO.mask(x,z)<=0)continue;const s=SHIGH.zones(x,z).forest-BIO.lodD(x,z)/400;if(s>bs){bs=s;bx=x;bz=z;}}
  SHIGH.mirrorAt.push({key:'coilbark',x:bx,z:bz});}
 try{window._biome=SHIGH.build({R:TERR.R-150,quality:q});}catch(e){reportErr('biome: '+e.stack);}
 if(Q.has('nobake')){window._stats=JSON.parse(JSON.stringify(BIO.stats));window._instances=0;window._bakeCalls=0;return;}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The southern highlands (ideal type)',x:0,z:0,y:CLOUD_Y-80,r:TERR.R,h:700});
})();
