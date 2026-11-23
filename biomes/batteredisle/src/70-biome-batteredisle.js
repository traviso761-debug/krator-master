// ================================================================= BATTERED ISLE — public BIOME-API surface & BIO.kitEnd [G data]
BATTER.build = function(opt){
 opt = opt || {};
 var R = opt.R == null ? 480 : opt.R;
 var q = opt.quality == null ? 1.0 : opt.quality;
 var counts = BATTER.placeAll(Object.assign({}, opt, { R: R, quality: q }));
 return Object.assign({ R: R, quality: q, kin: BATTER.KIN_COUNTS }, counts);
};

BATTER.canopyH = function(x, z){
 var hostInfo = (BIO.host && BIO.host.batteredisle) || {};
 var asl = (hostInfo.elevOffset || 0) + BIO.host.terrainH(x, z);
 var minT = hostInfo.exposedWNW ? 56.0 : 18.0;
 return asl >= minT && asl < 832.0 ? 16.0 : 0.8;
};

BIO.kitEnd(BATTER);
