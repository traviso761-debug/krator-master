// ================================================================= OPEN WORLD — micro-relief: the land a DEM shows (PLAN-MICRO.md)
// [G data] Plain functions: no THREE, no DOM, no Math.random, no library maths (sqrt only). The open world's land below
// ~1 km: the hills a 30 m elevation model shows everywhere (local relief of tens of metres over a few hundred) and their
// drainage texture (hollows, spurs, valleys within valleys, each finer one branching off the flanks of the one above, flat
// floors, sharp spurs). The World Menagerie's terrain builds read real DEMs for this (core/world/PLAN-MICRO.md M0: their
// 180-540 m relief is 20-46 m, their detail runs downslope, cos^2 .17-.46); here it is made pointwise, world-absolute
// (two regions over one place agree), from the land style:
//   WMICRO.init({ox, oz, seed})
//   WMICRO.hills(x, z, S, rel, minWave)   the hills' rise (m, never negative: hills on a floor that drains) over the land's large form: gradient noise
//                                  (KRAND.gfbm: no lattice lines) of S.hill metres, its wavelength 1.6 and 0.8 km (smooth: everything finer is the gullies'), the amount
//                                  wandering over 9 km (some country rolls more, some less) and with the model's relief
//   WMICRO.erode(h, x, z, gx, gz, S, rel, minWave, G)  the drainage: WRELIEF.erode's filter (which it replaces in a micro
//                                  region) in six octaves, 800 m to 25 m, from the slope (gx, gz) of the land's large form
//                                  (the model, its hills and these hills), each octave following the slope the coarser left,
//                                  so the finest branch off the coarsest; floors flattened (profile 2g - g^2, a rounded
//                                  trough, not a cusp); faded where no kernel point reaches (no circular seams). G (if
//                                  given) gets the slope it leaves, for the grain, and (G[2], if three long) the crease: -1 a spur's crest
//                                  to +1 a gully's floor, the octaves' stripes weighted 0.8^octave (the ground's colour shades by it).
//                                  fine (0..1, default 1) scales the octaves of 200 m and under: 41 fades them in a small stream's corridor
//                                  (its course runs smooth; the bake reads the beds with them off), so the bed never sits in a fine
//                                  gully's trench under the next bump (pinnacle's water stood 3.35 m under its ground)
//   WMICRO.grain(x, z, sl, S, minWave)  the ground's grain under 13 m, by the slope sl (m/m): smooth on the flats (it stood as
//                                  sandpaper everywhere), rough on the steep, and stretched down the slope
var WMICRO=(function(){'use strict';
const M={version:1};
let OX=0,OZ=0,SEED=0x4D4943;
M.init=function(o){o=o||{};OX=o.ox||0;OZ=o.oz||0;SEED=(o.seed==null?0x4D4943:o.seed)>>>0;return M;};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const smooth=(a,b,v)=>{let t=(v-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
// ---------------------------------------------------------------- the hills
// the amount: S.hill (m) x a wander over 9 km (.55 .. 1.55) x the model's relief (.7 on a plain, full in broken country)
const HW=1600,HK=2.6;   /* HK: gfbm's highs reach ~.4 over the knee, so S.hill reads about as a hill's rise over the floor */
M.amount=function(x,z,S,rel){const hl=S.hill==null?0:S.hill;if(!(hl>.01))return 0;const ax=x+OX,az=z+OZ;
 const v=.55+1.0*smooth(-.45,.55,KRAND.gfbm(ax/9000,az/9000,2,SEED^0x4157));return hl*v*(.7+.3*smooth(60,900,rel));};
// The hills stand on a floor that drains: the noise's lows are cut off (a smooth knee at its 58th percentile), so the land
// never goes under its large form, and the floor (over half the ground, and connected) carries the model's own drainage
// between them. Hills that dip as far as they rise closed a basin wherever their own slope beat the region's: the streams'
// trace found 1452 tarns in pinnacle where it had found 15 (a DEM's hill country has its valleys joined; noise has not)
const T0=.15,KN=.06;
const knee=y=>y>=KN?y:y<=-KN?0:(y+KN)*(y+KN)/(4*KN);   /* max(0, y), its corner rounded over +-KN (C1) */
M.hills=function(x,z,S,rel,minWave){if(minWave!=null&&minWave>=HW*.6)return 0;const A=M.amount(x,z,S,rel);if(!(A>.01))return 0;
 const ax=x+OX,az=z+OZ,o=minWave!=null&&minWave>=HW*.3?1:2;   /* two octaves (1.6 km, 790 m): smooth forms; all the finer relief is the gullies', which run downhill */
 return A*HK*knee(KRAND.gfbm(ax/HW,az/HW,o,SEED^0x4849)-T0);};
// ---------------------------------------------------------------- the fine gullies (the erosion filter continued)
const OCT=[800,400,200,100,50,25],GAIN=.8,DEPTH=.55,SLCAP=.6,DETAIL=1.5,YMEAN=-.3,FINE=200;
M.erode=function(h,x,z,gx,gz,S,rel,minWave,G,fine){fine=fine==null?1:fine;
 const g=S.gully==null?.6:S.gully;if(!(g>.01)){if(G){G[0]=gx;G[1]=gz;if(G.length>2)G[2]=0;}return h;}
 /* the depth goes with the INPUT slope (the large form's), as WRELIEF.erode's does: scaled by the running slope, each octave
    steepened the next until the finest stood at 65 degrees */
 const sl0=Math.min(SLCAP,Math.sqrt(gx*gx+gz*gz)),dep=Math.min(.75,DEPTH*g)*sl0*(1+clamp(rel/2000,0,.5)),ax=x+OX,az=z+OZ;let Gx=gx,Gz=gz,out=h,cr=0,cw=0,tgt=0,mask=1;
 for(let o=0;o<OCT.length;o++){const lam=OCT[o];if(minWave!=null&&minWave>=lam*.5)break;
  const sl=Math.sqrt(Gx*Gx+Gz*Gz),fade=smooth(.0005,.012,sl);if(fade<=0)break;
  const nx=-Gz/sl,nz=Gx/sl,ci=Math.floor(ax/lam),cj=Math.floor(az/lam);let vx=0,vy=0,W=0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const i=ci+di,j=cj+dj,hh=KRAND.hash(SEED^0x4D45,o,i,j);
   const px=(i+KRAND.unit(hh))*lam,pz=(j+KRAND.unit(KRAND.mix32(hh^0x9E3779B9)))*lam;
   const dx=(ax-px)/lam,dz=(az-pz)/lam,d2=dx*dx+dz*dz;if(d2>=1)continue;
   const w=(1-d2)*(1-d2),s=((ax-px)*nx+(az-pz)*nz)/lam;vx+=w*WRELIEF.cos2pi(s);vy+=w*WRELIEF.sin2pi(s);W+=w;}
  if(!(W>0))continue;
  const m=Math.sqrt(vx*vx+vy*vy)+.15*W,t=vx/m,sn=vy/m,gul=(1-t)*.5,cov=smooth(.05,.6,W);
  /* the stripe's height y: +1 a spur's crest, -1 a gully's floor (the rounded trough 2g - g^2: flat at the floor). RUNEVISION'S
     STACKED MASK (PLAN-MICRO.md M2b): where the coarser octaves leave a crest or a floor (their stripes level), this octave's
     gullies fade, not to nothing but to the coarser octaves' own faded height (the target): the crests stay crisp, the floors
     clean, and the fine gullies keep to the flanks. mk: the mask x the fade on the flat x the kernel's coverage */
  const fo=lam<=FINE?fine:1,a0=dep*lam*Math.pow(GAIN,o),y=1-2*(2*gul-gul*gul),mk=mask*fade*cov*fo,yf=tgt+(y-tgt)*mk;
  out+=a0*.5*(mk*(y-YMEAN)+fade*cov*fo*(1-mask)*tgt);   /* the gully where the mask is open (less YMEAN, the stripe's mean: the land neither rises
    nor sinks), the target where the coarser octaves mask it, and nothing where this octave is not (no kernel point, the flat): weighed
    by (1 - mk) instead, a coverage hole dropped the target's height at once, a 2.9 m step */
  const wo=Math.pow(GAIN,o);cr+=wo*mk*(2*gul-1);cw+=wo;   /* the crease: +1 a gully's floor, -1 a spur's crest (runevision's ridge map) */
  const k=-a0*mk*(1-gul)*clamp(3*sn,-1,1)*6.283185307179586/lam;Gx+=k*nx;Gz+=k*nz;
  tgt=yf;const mu=(1-Math.pow(1-mask,DETAIL))*smooth(0,.7,Math.abs(sn));mask+=(mu-mask)*cov;}   /* the next octave's target and mask: level stripes
    (|sin| ~ 0: a crest, a floor) mask it; eased in by the kernel's coverage (where no point reaches, the octave is skipped: unblended, the mask jumped there) */   /* d/ds of 2g - g^2 is (2 - 2g) dg/ds; the sine near its sign (runevision's
    "straight gullies": the next octave branches off cleanly instead of curling round the stripe's crest), clamped not signed: a sign turns
    the next octave's stripes at once where the sine crosses 0, a 5 m step */
 if(G){G[0]=Gx;G[1]=Gz;if(G.length>2)G[2]=cw>0?cr/cw:0;}
 return out;};
// ---------------------------------------------------------------- the grain
// under 13 m: ~.07 m rms on the flat to ~.4 m on a 50 % slope; stretched down the slope (a rill runs downhill). The stretch is
// four FIXED orientations (0, 45, 90, 135 degrees, each 3 : 1) blended by how well each lies along the slope: turning the
// coordinates themselves by the slope's direction moved a world-absolute pattern (x ~ 1e6 m) by metres for a hair's turn,
// a 1.6 m step between samples 1 mm apart (a stop planned on gentle ground read 43 % at its check, 2026-11-17)
const GD=[[1,0],[.70703125,.70703125],[0,1],[-.70703125,.70703125]];
function gr1(u,v,sd){return .8*KRAND.gnoise(u/9,v/9,sd)+.25*KRAND.gnoise(u/2.7+31,v/2.7,sd^1);}
M.grain=function(x,z,sl,gx,gz,S,minWave){if(minWave!=null&&minWave>=13)return 0;const ax=x+OX,az=z+OZ,sd=(SEED^0x4752)>>>0;
 const amp=(.3+2.6*Math.min(sl,.6))*(S.rough==null?1:S.rough),an=smooth(.02,.15,sl);
 let n=an<1?gr1(ax,az,sd):0;
 if(an>0){const ux=gx/sl,uz=gz/sl;let s=0,w2=0,ws=0;
  for(let k=0;k<4;k++){const c=GD[k][0]*ux+GD[k][1]*uz,w=c*c*c*c;if(w<1e-6)continue;   /* cos^4 of the angle to the slope, either way along it */
   const a=(ax*GD[k][0]+az*GD[k][1])/3,b=-ax*GD[k][1]+az*GD[k][0];s+=w*gr1(a,b,(sd+k+1)>>>0);ws+=w;w2+=w*w;}
  const na=s/Math.sqrt(w2);n=n*(1-an)+na*an;}   /* /sqrt(sum w^2): a blend of unrelated noises keeps its spread */
 return amp*n;};
return M;})();
if(typeof module!=='undefined')module.exports=WMICRO;
