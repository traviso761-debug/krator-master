/* ============================== 19H. LOCUS — the biome host binding ==============================
   Locus is planted by the EASTERN-ABYSS BIOME KIT, ported unchanged (69a* core, 69c* biome: copies of
   voth/biomes/eastabyss/src 10..70). This fragment is the host side of BIOME-API.md, and the only
   place the biome learns anything about Locus:
     terrainH   the world's own field; water is wherever it is < 0 (the world's water plane is y 0)
     fields     wet / salt / upland / flow from 10-core.js (LOCUS_FIELDS) — the biome zones itself:
                the hill reads as JUNGLE, the delta and the plain as MARSH, the lake rim as SHORE
     mask       0 on streets, sites, fields, water and every building footprint (a 2 m raster of the
                placed boxes, dilated a metre and a half); thin (gardens) inside the town
     origin     an LOD spine along the town, the river, the delta and the north road
   EASTABYSS_LAKE is the lake's colour: change the hue here and the water, the crust, the red reed
   stands, the lily pads and the complementary blooms all follow (0 red · .33 green · .66 blue).   */
var EASTABYSS_LAKE = { hue: 0.0 };
var LOCUS_FP = null;                 /* the footprint raster: 2 m cells over the detailed box */
(function(){
  var FP = { cell:2, ext:CITY_EXT };
  FP.n = Math.ceil(FP.ext*2/FP.cell); FP.a = new Uint8Array(SHEET ? 1 : FP.n*FP.n);
  FP.at = function(x,z){ var i=Math.floor((x+FP.ext)/FP.cell), j=Math.floor((z+FP.ext)/FP.cell); if(i<0||j<0||i>=FP.n||j>=FP.n) return 0; return FP.a[j*FP.n+i]; };
  if(!SHEET){
    PLACED.forEach(function(b){ if(b.w==null) return; var pad=b.key==='plant'?0.4:1.5, R=Math.hypot(b.w,b.d)/2+pad, c=Math.cos(-b.ry), s=Math.sin(-b.ry);
      for(var x=b.x-R; x<=b.x+R; x+=FP.cell*0.5) for(var z=b.z-R; z<=b.z+R; z+=FP.cell*0.5){
        var dx=x-b.x, dz=z-b.z, lx=dx*c+dz*s, lz=-dx*s+dz*c;   /* loc(0,0,dx,dz,-ry) */
        if(Math.abs(lx) <= b.w/2+pad && Math.abs(lz) <= b.d/2+pad){ var i=Math.floor((x+FP.ext)/FP.cell), j=Math.floor((z+FP.ext)/FP.cell); if(i>=0&&j>=0&&i<FP.n&&j<FP.n) FP.a[j*FP.n+i]=1; } } });
    /* roads outside the painted box, and every road inside it, kept clear a few metres each side */
    ST.edges.forEach(function(e){ var A=ST.nodes[e.a], B=ST.nodes[e.b], L=e.len, n=Math.max(1,Math.ceil(L/1.2)), hw=e.w/2+2.5;
      for(var k=0;k<=n;k++){ var t=k/n, x=mix(A.x,B.x,t), z=mix(A.z,B.z,t); for(var ox=-hw; ox<=hw; ox+=1) for(var oz=-hw; oz<=hw; oz+=1){ if(ox*ox+oz*oz > hw*hw) continue; var i=Math.floor((x+ox+FP.ext)/FP.cell), j=Math.floor((z+oz+FP.ext)/FP.cell); if(i>=0&&j>=0&&i<FP.n&&j<FP.n) FP.a[j*FP.n+i]=1; } } });
  }
  LOCUS_FP = FP;
})();
function locusBioMask(x,z){
  var h=terrainH(x,z); if(h < 0.12) return 0;
  if(Math.abs(x) < CITY_EXT && Math.abs(z) < CITY_EXT){
    if(LOCUS_FP.at(x,z)) return 0;
    var m=maskAt(x,z); if(m===3) return 0.45; if(m) return 0;
  } else { var k=rgIdx(x,z); if(k>=0 && RG.ROAD[k]) return 0; }
  if(Math.hypot(x,z) < 480 && h > CITY_EDGE_H) return 0.16;                 /* gardens and yards between the houses */
  return 1;
}
BIO.init({ THREE:THREE, scene:scene, terrainH:terrainH, mask:locusBioMask, obstacles:[],
  ticks:function(fn){ TICKS.push(function(dt){ fn(dt); }); }, seed:17,
  origin:[[0,0],[-420,640],[-900,720],[300,660],[900,560],[1500,700],[-640,-700],[-640,-1500],[700,700],[1300,1100],[-150,-350]].concat(PUMPJACKS.map(function(P){ return [P.x,P.z]; })), center:[0,0],
  fields:LOCUS_FIELDS, err:function(m){ ERR('biome: '+m); } });
/* the biome's keep-clear test also consults the footprint raster round a trunk, not only at its centre */
(function(){ var base=BIO.clearOf; BIO.clearOf=function(x,z,pad){ if(!base(x,z,pad)) return false; if(SHEET || !pad || pad < 1.5) return true;
  var r=pad*0.8; for(var k=0;k<8;k++){ var a=k/8*TAU; if(LOCUS_FP.at(x+Math.cos(a)*r, z+Math.sin(a)*r)) return false; } return true; }; })();
