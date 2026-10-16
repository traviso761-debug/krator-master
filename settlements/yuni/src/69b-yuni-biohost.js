/* ============================== 18c. YUNI — the biome host binding ==============================
   Yuni's wild land is planted by the EASTERN BADLANDS BIOME KIT (biomes/ebadlands, read in place by build.py as
   69a* core and 69c* kit). Its BIOME-API.md puts "the valley of Yuni" in the region's milder, wetter south, and the
   owner's note for Yuni: a valley, so it tends to the kit's ZION side, the green canyon floor (vale, rip) under
   pine on the walls, not the hot waste or the steppe. This fragment is the host side of BIOME-API.md and the only
   place the kit learns anything about Yuni:
     fields     cold   low on the valley floor (.24: warm enough for the broadleaf vale, not the hot waste) and rising
                       with height up the Outer Wall Mountains (pine, then boreal on the crests)
                wet    a Cfa valley (.5, with a slow patchwork so drier benches read as pinyon-juniper), higher by the
                       river and the canal, drier with height
                flow   the river's banks and the canal's; rock and slope from the ground (the steep walls, the butte's
                       talus); canyon, rim, dune, salt, geo and barren are 0 (there are no carved channels or vents here)
     water      the river's and the canal's own surfaces (waterH), so the floor's reeds stand in their shallows
     mask       0 on every street (with its verge), every building footprint, the planted trees (TREE_SITES: the
                avenues, the parks, the olive groves), the canal corridor, the basin and the butte; thin in the
                districts' yards and on the farm belt; 0 inside the wall
   Fields are cached on a grid (as the kit's own stage does); the mask is a 2.5 m raster. No rnd() is drawn.     */
var YUNI_BIO = null;
(function(){
  var EXT = 4000;
  /* ---- the mask raster: streets, footprints and planted trees over the whole valley ---- */
  var M = { cell:2.5, ext:EXT }; M.n = Math.ceil(M.ext*2/M.cell); M.a = new Uint8Array(SHEET ? 1 : M.n*M.n);
  function mIdx(x,z){ var i=Math.floor((x+M.ext)/M.cell), j=Math.floor((z+M.ext)/M.cell); return (i<0||j<0||i>=M.n||j>=M.n) ? -1 : j*M.n+i; }
  function disc(x,z,r){ for(var ox=-r; ox<=r; ox+=M.cell*0.5) for(var oz=-r; oz<=r; oz+=M.cell*0.5){ if(ox*ox+oz*oz > r*r) continue; var k=mIdx(x+ox,z+oz); if(k>=0) M.a[k]=1; } }
  function band(ax,az,bx,bz,hw){ var L=Math.hypot(bx-ax,bz-az), n=Math.max(1,Math.ceil(L/1.2)); for(var s=0;s<=n;s++){ var t=s/n; disc(mix(ax,bx,t), mix(az,bz,t), hw); } }
  if(!SHEET){
    ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b]; band(A.x,A.z,B.x,B.z, e.w/2+2.5); });
    HIGHWAYS.forEach(function(h){ for(var i=0;i+1<h.pts.length;i++) band(h.pts[i][0],h.pts[i][1],h.pts[i+1][0],h.pts[i+1][1], (ST_CLASS[h.cls]?ST_CLASS[h.cls].w:12)/2+2.5); });
    FIX.buildings.forEach(function(b){ var pad=1.5, c=Math.cos(-b.yaw), s=Math.sin(-b.yaw), R=Math.hypot(b.w,b.d)/2+pad;
      for(var x=b.x-R; x<=b.x+R; x+=M.cell*0.5) for(var z=b.z-R; z<=b.z+R; z+=M.cell*0.5){
        var dx=x-b.x, dz=z-b.z, lx=dx*c+dz*s, lz=-dx*s+dz*c;
        if(Math.abs(lx) <= b.w/2+pad && Math.abs(lz) <= b.d/2+pad){ var k=mIdx(x,z); if(k>=0) M.a[k]=1; } } });
    TREE_SITES.forEach(function(t){ disc(t[0], t[1], (t[2]||2)+1.5); });
  }
  function inBasin(x,z){ var q=loc(0,0, x-BASIN.x, z-BASIN.z, -BASIN.ry); return Math.abs(q[0]) < BASIN.w/2+12 && Math.abs(q[1]) < BASIN.d/2+12; }
  function yuniBioMask(x,z){
    var k=mIdx(x,z); if(k<0) return 1; if(M.a[k]) return 0;
    var r=Math.hypot(x,z); if(r < RW+14) return 0;                                   /* the walled city is Yuni's own */
    if(canalDist(x,z) < CANAL_W[3]) return 0; if(inBasin(x,z)) return 0;             /* the towpath pass's corridor */
    if(inButte(x,z,terrainH(x,z)+2,8)) return 0;
    if(r < districtEdgeR(clockOf(x,z))+12) return 0.12;                              /* the districts' yards and gaps */
    if(inFarmBelt(x,z)) return 0.12;                                                  /* hedgerows between the fields */
    return 1;
  }
  function yuniWaterH(x,z){
    var rv=polyNear(x,z,RIVER,RIVER_CUM); if(rv.d < riverHalfAt(rv.t)) return riverLevel(rv.t);
    if(nearCanalBox(x,z)){ var cv=polyNear(x,z,CANAL,CANAL_CUM); if(cv.d < CANAL_HALF) return canalLevel(cv.t); }
    if(inBasin(x,z) && Math.abs(loc(0,0,x-BASIN.x,z-BASIN.z,-BASIN.ry)[0]) < BASIN.w/2) return canalLevel(CANAL_LEN);
    return -1e9;
  }
  /* ---- the climate fields, cached on a grid (bilinear between its nodes) ---- */
  var NAMES = ['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren'];
  var FC = { N: SHEET ? 2 : 340, S: EXT*2 }; FC.cs = FC.S/(FC.N-1); FC.a = {};
  NAMES.forEach(function(n){ FC.a[n] = new Float32Array(FC.N*FC.N); });
  if(!SHEET){
    var N=FC.N, H=new Float32Array(N*N), i, j;
    for(j=0;j<N;j++) for(i=0;i<N;i++) H[j*N+i] = terrainH(i*FC.cs-EXT, j*FC.cs-EXT);
    for(j=0;j<N;j++) for(i=0;i<N;i++){
      var x=i*FC.cs-EXT, z=j*FC.cs-EXT, k=j*N+i, h=H[k];
      var hx=H[j*N+Math.min(N-1,i+1)]-H[j*N+Math.max(0,i-1)], hz=H[Math.min(N-1,j+1)*N+i]-H[Math.max(0,j-1)*N+i];
      var slope=clamp(Math.hypot(hx,hz)/(2*FC.cs)*1.6, 0, 1);
      var dR=riverDist(x,z), dC=canalDist(x,z)-CANAL_HALF, bd=Math.hypot(x-BUTTE.x, z-BUTTE.z);
      var patch=fbm(x*0.0016+41, z*0.0016-17);
      FC.a.slope[k]=slope;
      FC.a.cold[k]=clamp(0.24 + (h-GROUND0)/1500 + 0.05*(patch-0.5), 0, 1);
      FC.a.wet[k]=clamp(0.5 + 0.34*(patch-0.5) + 0.36*smooth(170,10,dR) + 0.24*smooth(60,6,dC)
                        - 0.12*smooth(0.3,0.7,slope) - 0.14*smooth(500,1300,h), 0, 1);
      FC.a.flow[k]=Math.max(smooth(90,4,dR), 0.7*smooth(20,3,dC));   /* a gallery forest the length of the river */
      FC.a.rock[k]=clamp(Math.max(smooth(0.42,0.78,slope)*0.95, 0.55*smooth(BUTTE.rFoot+70, BUTTE.rFoot+5, bd)), 0, 1);
      FC.a.upland[k]=clamp((h-60)/900, 0, 1);
    }
  }
  function at(arr,x,z){ var u=clamp((x+EXT)/FC.cs,0,FC.N-1.001), v=clamp((z+EXT)/FC.cs,0,FC.N-1.001), i=Math.floor(u), j=Math.floor(v), fu=u-i, fv=v-j, k=j*FC.N+i;
    return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+FC.N]*(1-fu)*fv+arr[k+FC.N+1]*fu*fv; }
  var FIELDS = {}; NAMES.forEach(function(n){ FIELDS[n] = function(x,z){ return at(FC.a[n], x, z); }; });
  /* ---- the LOD spine: where the views look (full detail there; the kit thins and simplifies with distance). A
          spine across the whole valley built every tree as a hero: 12 M triangles. These points are the town's
          edge on each side, the butte, the north approach, the weir and the valley mouth. ---- */
  var spine=[[0,0],[BUTTE.x,BUTTE.z+40],[-160,-1000],[CANAL_WEIR.x,CANAL_WEIR.z],[-1500,-1300],[BASIN.x,BASIN.z],[-700,300],[700,-300]];
  BIO.init({ THREE:THREE, scene:scene, terrainH:terrainH, waterH:yuniWaterH, mask:yuniBioMask, obstacles:[],
    ticks:function(fn){ TICKS.push(function(dt){ fn(dt); }); }, seed:29, origin:spine, center:[0,0],
    fields:FIELDS, lod:{ hero:260, mid:800, far:3200, floor:[260,600] },
    clock:function(){ return YCLOCK.t; }, err:function(m){ ERR('biome: '+m); } });
  /* the kit's keep-clear test also consults the raster round a trunk, not only at its centre */
  (function(){ var base=BIO.clearOf; BIO.clearOf=function(x,z,pad){ if(!base(x,z,pad)) return false; if(SHEET || !pad || pad < 1.5) return true;
    var r=pad*0.8; for(var k=0;k<8;k++){ var a2=k/8*TAU, kk=mIdx(x+Math.cos(a2)*r, z+Math.sin(a2)*r); if(kk>=0 && M.a[kk]) return false; } return true; }; })();
  YUNI_BIO = { mask:yuniBioMask, waterH:yuniWaterH, fields:FIELDS, raster:M, spine:spine };
})();
