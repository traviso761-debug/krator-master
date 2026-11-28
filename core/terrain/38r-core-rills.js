// ================================================================= CORE — rills (KRELIEF.rills: the runnels a badland flank is scored with)
// [G data] Plain functions, no THREE and no DOM. Opt-in: a page lists this file (ebadlands' build.py, CORE_TERRAIN).
// Why (the owner, 2026-11-03, on ebadlands' banded flanks: "looks painted on"): a soft bedded flank (mudstone, shale, bentonite) is
// never a smooth band up close. Rain cuts it into parallel runnels down the fall line, a metre or two apart, between sharp ribs, and
// larger gullies every few metres gather them; each bed's colour then dips into the gullies in a V and rides up the ribs (the rule of
// V's), so the stripes read as cut rock, not paint. KSTRATA's ledges give the beds' hardness; these give the flank its grain.
// How: for each octave, the jittered points of a lattice (KRAND, by cell) each carry a ridge-and-gully wave across the fall line
// (along the contour), measured from the point itself so the waves agree locally; the points' waves are blended by a polynomial
// falloff (after the gully noise of Fewes, "Terrain erosion noise", shadertoy 2023, and Clay John's eroded terrain noise, MIT). The
// wave is u^2 in |2s-1| (s the phase): sharp crests, rounded gully floors. Gullies cut down; ribs stay at the surface (dh <= 0).
//
//   const R = KRELIEF.rills({seed, spacing (1.8 m), depth (.35 m), octaves (2), lac (2.6: spacing x each octave), gain (1.7: depth x
//                            each octave), slope [.3, .75] (|grad h| where rills start and are full)})
//   R.at(x, z, gx, gz)   dh in metres (<= 0) at (x, z) on ground whose height gradient is (gx, gz): 0 on the flat
//   R.wave(x, z, dx, dz, spacing, seed)   one octave's blended wave in [0, 1] along the contour direction (dx, dz) (the tests read it)
//   R.max                the deepest cut (the depths summed)
(function(root){
  var KR=root.KRELIEF||(root.KRELIEF={});
  function need(){var K=root.KRAND;if(!K)throw new Error('core/terrain 38r: KRELIEF.rills needs core/rand (08-core-rand.js, KRAND)');return K;}
  function sstep(a,b,x){var t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);}
  function rills(o){o=o||{};var K=need(),seed=(o.seed==null?7307:o.seed)>>>0,sp=o.spacing==null?1.8:o.spacing,dep=o.depth==null?.35:o.depth,
      oct=o.octaves==null?2:o.octaves,lac=o.lac==null?2.6:o.lac,gain=o.gain==null?1.7:o.gain,sl=o.slope||[.3,.75],seeds=[],sps=[],deps=[],mx=0;
    for(var q=0;q<oct;q++){seeds.push(K.hash(seed,q,0,0x5211));sps.push(sp*Math.pow(lac,q));deps.push(dep*Math.pow(gain,q));mx+=deps[q];}
    /* one octave: (dx, dz) the contour direction, unit; the wave's phase runs across it, so ridges and gullies run down the fall line */
    function wave(x,z,dx,dz,s,sd){var px=x/s,pz=z/s,ix=Math.floor(px),iz=Math.floor(pz),acc=0,wt=0;
      for(var j=-1;j<=2;j++)for(var i=-1;i<=2;i++){var h=K.hash(sd,ix+i,iz+j,0x5212),cx=ix+i+.15+.7*K.unit(h),cz=iz+j+.15+.7*K.unit(K.hash(h,1,0,0x5213)),
          ux=px-cx,uz=pz-cz,d2=ux*ux+uz*uz,w=1-d2/1.69;if(w<=0)continue;w*=w;
          var m=ux*dx+uz*dz+K.unit(K.hash(h,2,0,0x5214)),f=m-Math.floor(m),u=Math.abs(2*f-1);acc+=w*u*u;wt+=w;}
      return wt>0?acc/wt:.5;}
    function at(x,z,gx,gz){var g=Math.sqrt(gx*gx+gz*gz),k=sstep(sl[0],sl[1],g);if(k<=0)return 0;var dx=-gz/g,dz=gx/g,dh=0;
      for(var q=0;q<oct;q++)dh-=deps[q]*(1-wave(x,z,dx,dz,sps[q],seeds[q]));return dh*k;}
    return {at:at,wave:wave,max:mx,seeds:seeds,spacings:sps,depths:deps};}
  KR.rills=rills;
})(typeof globalThis!=='undefined'?globalThis:this);
