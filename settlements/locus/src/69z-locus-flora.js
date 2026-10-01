/* ============================== 19Z. LOCUS — planting the biome ==============================
   The order a world follows (BIOME-API.md): its own structures first, then the biome, then one bake.
   The biome's sun follows the world's day (SKY_STATE.keyDir), and every biome mesh is given the
   project's inspector classification and tags (flora · climate · aridity · abyssal · riparian). */
reseed(699001);
var LOCUS_BIOME = null;
(function(){
  if(SHEET) return;
  var t0=performance.now();
  /* TOWN TREES: the shorter jungle and marsh species of the biome, planted by the host on street verges, round the
     squares and in the yards (the biome's own passes are masked out of the town). Species by index in
     EASTABYSS.SPECIES: 4 salt cycad, 7 stilt-wood, 8 fan palmetto, 9 shelf umbrella-tree, 10 jade shrub,
     12 Calamophyton palm, 13 Sanfordacaulis. Heights capped so none overtops the houses much. */
  (function(){ reseed(699101);
    var MIX=[[8,0.24,11,4.5],[4,0.18,8,4],[9,0.16,12,6],[12,0.14,9,4],[13,0.10,12,4],[10,0.12,4,2.5],[7,0.06,11,5]], sites=[];
    function pickSp(){ var r=rnd(), a=0; for(var i=0;i<MIX.length;i++){ a+=MIX[i][1]; if(r<=a) return MIX[i]; } return MIX[0]; }
    function roomy(x,z,r){ if(LOCUS_FP.at(x,z)) return false; for(var k=0;k<8;k++){ var a=k/8*TAU; if(LOCUS_FP.at(x+Math.cos(a)*r, z+Math.sin(a)*r)) return false; } return true; }
    function okGround(x,z){ var m=maskAt(x,z); if(m===1||m===2||m===4||m===6||m===7) return false; var h=terrainH(x,z); return h > 0.8 && lakeDist(x,z) > 20 && riverDist(x,z) > 6 && canalDist(x,z) > CANAL_W[2]+1; }
    function near(x,z,d){ for(var i=0;i<sites.length;i++){ if(Math.hypot(sites[i].x-x, sites[i].z-z) < d) return true; } return false; }
    function tryAt(x,z, prob){ if(rnd() > prob) return; var M=pickSp(); if(!okGround(x,z) || !roomy(x,z,Math.min(M[3],4))) return; if(near(x,z, M[3]*1.6)) return;
      sites.push({ x:x, z:z, sp:M[0], H:M[2], crownR:M[3] }); }
    /* 1. street verges: just outside the kept-clear strip of every town street */
    ST.edges.forEach(function(e){ if(e.cls==='track'||e.cls==='highway') return; var A=ST.nodes[e.a], B=ST.nodes[e.b]; if(Math.hypot(A.x,A.z) > 470) return;
      var L=Math.hypot(B.x-A.x,B.z-A.z)||1, nx=-(B.z-A.z)/L, nz=(B.x-A.x)/L, off=e.w/2+3.4, prob = (e.cls==='boulevard'||e.cls==='ring') ? 0.55 : 0.3;
      for(var t=6; t<L-4; t+=16){ var x=mix(A.x,B.x,t/L), z=mix(A.z,B.z,t/L); [-1,1].forEach(function(s){ tryAt(x+nx*off*s+rr(-1,1), z+nz*off*s+rr(-1,1), prob); }); } });
    /* 2. the park (thicker) and round the market square */
    for(var i=0;i<140;i++){ var a=rnd()*TAU, r=PARK.r*Math.sqrt(rnd())*0.95; tryAt(PARK.x+Math.cos(a)*r, PARK.z+Math.sin(a)*r, 0.9); }
    for(var j=0;j<40;j++){ var a2=rnd()*TAU, r2=MARKET.r+rr(4,12); tryAt(MARKET.x+Math.cos(a2)*r2, MARKET.z+Math.sin(a2)*r2, 0.6); }
    /* 3. yards and gaps between the houses */
    for(var x=-470; x<=470; x+=10) for(var z=-470; z<=470; z+=10){ if(Math.hypot(x,z) > 470) continue; tryAt(x+rr(-4,4), z+rr(-4,4), 0.10); }
    EASTABYSS.SITES = sites;
  })();
  try{ LOCUS_BIOME = EASTABYSS.build({ R:2750, quality: FAST ? 0.42 : 0.66 }); }catch(e){ ERR('biome build: '+(e&&e.stack||e)); }
  var b=null; try{ b=BIO.bake(); }catch(e){ ERR('biome bake: '+(e&&e.stack||e)); }
  /* tags: species by name, and the biome-wide set for the floor items */
  var TAGBY = {};
  (EASTABYSS.SPECIES||[]).forEach(function(S){ var t=S.tags||{}; TAGBY[S.name]=(t.climate||'hypertropic')+' · '+(t.aridity||'humid')+' · '+(t.abyssal===false?'non-abyssal':'abyssal')+' · riparian: '+(t.riparian||'both'); });
  (BIO.baked||[]).forEach(function(m){ var lab=m.userData.inspectLabel||'Plant', tg=null;
    for(var k in TAGBY){ if(lab.indexOf(k)>=0 || lab.toLowerCase().indexOf(k.toLowerCase().split(' ')[0])>=0){ tg=TAGBY[k]; break; } }
    m.userData.inspectLabel = lab + ' — flora (eastern-abyss biome kit) · ' + (tg || 'hypertropic · humid · abyssal · riparian: both');
    m.userData.noPickShadow = true; });
  window._biome = { build:LOCUS_BIOME, bake:b, ms:Math.round(performance.now()-t0), totals:BIO.totals ? BIO.totals() : null };
  TICKS.push(function(){ if(BIO.SUN && BIO.SUN.value && typeof SKY_STATE!=='undefined') BIO.SUN.value.copy(SKY_STATE.keyDir).normalize(); });
})();
