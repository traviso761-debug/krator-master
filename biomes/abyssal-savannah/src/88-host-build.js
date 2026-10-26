// ================================================================= HOST — build
// The order a world follows: its ground first, then the kits (the abyssal savannah, which reads the eastern abyss in place for
// the jungle at the foot), then one bake. The kopjes' hills and the rim's lip line are the host's ground, handed to the kit.
window._biome=null;
(function(){
 const t0=performance.now();
 try{buildGround();}catch(e){reportErr('ground: '+e.stack);}
 try{buildFar();}catch(e){reportErr('far country: '+e.stack);}
 // the caprock's lip: the profile's lip (RIM.lip in the warped coordinate) at every 9 m down the map, on the ground
 const lip=[];for(let z=-TERR.Z+20;z<=TERR.Z-20;z+=9){const x=RIM.lip-warpZ(z);lip.push([x,z]);}
 const rim={lip,c:[RIM.lip-warpZ(0),0],r:TERR.Z,y0:terrainH(RIM.face[0]-warpZ(0),0)-5,h:300};
 try{window._biome=ABSAV.build({box:[-TERR.X,-TERR.Z,TERR.X,TERR.Z],quality:1,kopjes:KOPJES,rim});}catch(e){reportErr('biome: '+e.stack);}
 const b=BIO.bake();
 window._instances=b.inst;window._bakeCalls=b.calls;window._buildMs=Math.round(performance.now()-t0);
 REGISTER({name:'The rim slope (the abyssal savannah, station 1)',x:CENTER[0],z:CENTER[1],r:TERR.X,h:700});
 GULLY.forEach(G=>{const x=-600;REGISTER({name:G.name,kind:'feature',x,z:G.zc(x),y:terrainH(x,G.zc(x))-30,r:G.W*1.6,h:60});});
})();
