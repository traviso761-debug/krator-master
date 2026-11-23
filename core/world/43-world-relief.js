// ================================================================= OPEN WORLD — relief: the land below the model's 2 km
// [G data] Plain maths of (x, z): no THREE, no DOM, no Math.random, no Math.sin, cos or exp (only + - * / floor sqrt); the
// draws from core/rand (KRAND), so a Godot port gives the same land. core/world/PLAN-RELIEF.md is the plan; this is its P1:
//   S2 benches  terraces only where a caprock lies, on beds that dip and warp, of irregular thickness, only the hard ones
//               standing out as benches: WRELIEF.bench. It replaces 41's terraces on the absolute height (h / step), which
//               ringed every hill like a contour map
//   S3 erosion  (P2) gullies and spurs down every slope, branching: WRELIEF.erode, in place of 41's ridged-noise gullies
//   S4 peaks    (P5) sharper crests and summits on the high ground: WRELIEF.peaks (a ridged multifractal where the land stands
//               over its neighbourhood)
// (S1, a land style and palette for every overlay, is 41's BIOME_GROUND: claude/world-biome-styles, for every region.)
// A region opts in (openworld/SITES.json "relief": 1; region.json `relief`); 41 calls WRELIEF only then, so a region
// without it keeps its land exactly.
//
//   WRELIEF.init({ox, oz, seed})   the region's frame (metres of its origin from the model's: noise and dips are read at the
//                                  world-absolute point, so two cuts of one place agree) and the world's seed
//   WRELIEF.bench(h, x, z, S, rel, minWave)  the ground h with its caprock benches; S the style blend (terr, step), rel the
//                                  model's local relief (m). Returns h unchanged where no caprock lies
//   WRELIEF.caprock(x, z, S, rel)  0..1: how much caprock lies here (the bench's weight)
var WRELIEF=(function(){'use strict';
const R={version:1};
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const smooth=(a,b,x)=>{let t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};

// ---------------------------------------------------------------- the frame and the noise
let OX=0,OZ=0,SEED=0x52454C,V2=false;
R.init=function(o){o=o||{};OX=o.ox||0;OZ=o.oz||0;SEED=(o.seed==null?0x52454C:o.seed)>>>0;R.version=o.version===2?2:1;V2=R.version===2;return R;};
const vn=(x,z,s)=>KRAND.vnoise(x,z,.5,s);
function fbm(x,z,o,s){let a=0,f=1,w=0,t=1;for(let i=0;i<o;i++){a+=vn(x*f,z*f,s+i)*t;w+=t;t*=.5;f*=2.03;}return a/w;}

// ---------------------------------------------------------------- S2: caprock benches
// Where a caprock lies: the style's terrace share (S.terr), where the relief allows mesas (41's band: 40 m to 4.2 km over a
// cell's neighbourhood), and in patches (formations a few tens of km across: about a third of the ground)
R.caprock=function(x,z,S,rel){if(!(S.terr>.01))return 0;
 const band=smooth(40,250,rel)*smooth(4200,1800,rel);if(band<=0)return 0;
 return S.terr*band*smooth(.53,.6,fbm((x+OX)/16000,(z+OZ)/16000,3,SEED^0x4341));};   /* the fbm's 65th to 85th percentile */
// The beds: stratigraphic height hs = h + a structure surface + a warp, so a bed's outcrop crosses the contours instead of
// tracing them. The structure is smooth noise ~400 m in amplitude over ~30 km: dips of 0.5..2 %, as real caprock dips, that turn with it (never a
// plane times the absolute coordinates, whose turning would crowd the beds). A bed's base sits at step*(k + jitter(k)): irregular thicknesses, no rhythm.
// A hard bed (about 4 in 10, KRAND by its index) is a bench: flat tread, then a riser in its top fifth. A soft one is left
// as the slope it was. hs moves by the tread's offset, so the ground is continuous at every bed's edge.
const HARD=.4,RISER=.2,JIT=.35;
function bedBase(k,s){return k+JIT*(KRAND.unit(KRAND.hash(s,k|0,0x42))-.5);}
R.bench=function(h,x,z,S,rel,minWave){
 if(minWave!=null&&minWave>=600)return h;
 const cw=R.caprock(x,z,S,rel);if(cw<.01)return h;
 const ax=x+OX,az=z+OZ;
 const step=S.step*(.75+.5*vn(ax/9000,az/9000,SEED^0x5354));
 /* the structure: a smooth surface ~400 m in amplitude over ~30 km (dips of 0.5-2 %), plus a warp of half a bed over ~6 km */
 const hs=h+400*(fbm(ax/30000,az/30000,2,SEED^0x4458)-.5)+(fbm(ax/6000,az/6000,2,SEED^0x5741)-.5)*.6*step;
 const t=hs/step,s=SEED^0x4245;let k=Math.floor(t);
 if(t<bedBase(k,s))k--;else if(t>=bedBase(k+1,s))k++;
 const b0=bedBase(k,s),b1=bedBase(k+1,s);
 if(!(KRAND.unit(KRAND.hash(s,k|0,0x48))<HARD))return h;
 const f=(t-b0)/(b1-b0),g=f<1-RISER?0:smooth(1-RISER,1,f),off=(b0+g*(b1-b0)-t)*step;
 return h+cw*off;};

// ---------------------------------------------------------------- S3: the erosion filter (P2)
// Gullies and spurs down every slope, after Rune Skovbo Johansen's erosion filter (2026; Clay John's eroded noise before it):
// in each octave, stripes run along the slope (their phase is the distance ACROSS it), each cell of the octave's lattice
// pivoting its stripes on its own point (KRAND), the 3x3 cells round a point blended as phasors weighted (1 - d^2)^2 over
// a cell's radius, so no lattice shows and the stripes stay unit-height. A stripe's trough is the gully: the profile is
// ((1 - t)/2)^2, narrow floors between broad spurs, its mean (.35 over the blended stripes) taken off so the land neither rises nor sinks. Each octave
// follows the slope the octaves before it left (its stripes' own gradient, analytic), so the finer gullies run down the
// flanks of the coarser spurs: they branch. Flat ground has no slope to follow, and the filter fades out under 2-12 %.
// cos and sin of the phase are polynomials (cos2pi, sin2pi below, error ~4e-6), not Math.cos: a port gives the same bits.
//   WRELIEF.erode(h, x, z, gx, gz, S, rel, minWave)  the ground h with its gullies; (gx, gz) the slope of the land's large
//                                  form there (m/m: the model and its hills), S the style blend (gully: its strength), rel the
//                                  model's local relief (m: broken land cuts a little deeper). Each octave's depth is DEPTH x
//                                  the slope x its wavelength. A far chunk skips the octaves its minWave cannot show
const OCT=[[900,1],[420,1],[200,1]];   /* wavelength (m), and a share of the depth (the depth already goes with the wavelength) */
const DEPTH=.18;
function cosPiW(w){const v=w*w;   /* cos(pi w) for w in [-1, 1], Taylor to w^14 */
 return 1-v*(4.934802200544679-v*(4.058712126416768-v*(1.335262768854589-v*(.2353306303588932-v*(.02580689139001406-v*(.0019295743094039-v*.0001046381049248))))));}
function cos2pi(u){const x=u-Math.floor(u)-.5;return -cosPiW(2*x);}
const sin2pi=u=>cos2pi(u-.25);
R.cos2pi=cos2pi;R.sin2pi=sin2pi;
R.erode=function(h,x,z,gx,gz,S,rel,minWave,G){   /* G: if given, the slope the octaves leave, [gx, gz] (43m-world-micro.js goes on from it) */
 if(G){G[0]=gx;G[1]=gz;}
 const g=S.gully==null?.6:S.gully;if(!(g>.01))return h;
 /* a gully's depth goes with the slope it drains and its spacing: DEPTH x the large form's slope x the wavelength (a 15 %
    slope cuts ~24 m gullies 900 m apart at full strength), the relief adding a little where the land is broken */
 const sl0=Math.min(.6,Math.sqrt(gx*gx+gz*gz)),dep=g*DEPTH*sl0*(1+clamp(rel/2000,0,.5));
 const ax=x+OX,az=z+OZ;let Gx=gx,Gz=gz,out=h;
 for(let o=0;o<OCT.length;o++){const lam=OCT[o][0];if(minWave!=null&&minWave>=lam*.5)break;
  const sl=Math.sqrt(Gx*Gx+Gz*Gz),fade=smooth(.02,.1,sl);if(fade<=0)break;
  const nx=-Gz/sl,nz=Gx/sl;   /* the unit vector across the slope */
  const ci=Math.floor(ax/lam),cj=Math.floor(az/lam);let vx=0,vy=0,W=0;
  for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const i=ci+di,j=cj+dj,hh=KRAND.hash(SEED^0x4552,o,i,j);
   const px=(i+KRAND.unit(hh))*lam,pz=(j+KRAND.unit(KRAND.mix32(hh^0x9E3779B9)))*lam;
   const dx=(ax-px)/lam,dz=(az-pz)/lam,d2=dx*dx+dz*dz;if(d2>=1)continue;
   const w=(1-d2)*(1-d2),s=((ax-px)*nx+(az-pz)*nz)/lam;vx+=w*cos2pi(s);vy+=w*sin2pi(s);W+=w;}
  if(!(W>0))continue;
  const m=Math.sqrt(vx*vx+vy*vy)+.15*W,t=vx/m,sn=vy/m;   /* + .15 W: where the phasors cancel, the stripes fade, never flip */
  const gul=(1-t)*.5,a=dep*lam*OCT[o][1]*fade;
  out-=a*(gul*gul-.35);   /* .35: the profile's mean over the blended stripes (measured; .375 for pure ones) */
  const k=-a*gul*sn*6.283185307179586/lam;Gx+=k*nx;Gz+=k*nz;}   /* this octave's own slope, for the next to follow */
 if(G){G[0]=Gx;G[1]=Gz;}
 return out;};
// ---------------------------------------------------------------- S4: peaks (P5) and steep-wall crags (v2)
// v1: value-noise ridged multifractal in four octaves (1.3 km to 162 m), mean PMEAN subtracted.
// v2 (alpine=2): Pythagorean-rotated gradient-noise arête multifractal in five octaves (1120 m to 70 m, band-limited at
// max(64 m, minWave)) with a C1 non-negative knee (no oval collar moat around PEAK edges), plus WRELIEF.crags along steep
// rocky flanks (strike-parallel rock buttresses and concave couloir chutes, smoothly damped above 54 degrees so 2.5D
// heightfields never sawtooth on vertical cliffs).
const POCT=[1300,650,325,162],PMEAN=.56,POCT2=[1120,560,280,140,70];
function rotG(x,z,lam,s,turns){let rx=x,rz=z;for(let k=0;k<turns;k++){const nx=.8*rx-.6*rz,nz=.6*rx+.8*rz;rx=nx;rz=nz;}return KRAND.gnoise(rx/lam,rz/lam,s>>>0);}
function kneePos(y,kn){return y>=kn?y:y<=-kn?0:(y+kn)*(y+kn)/(4*kn);}
R.peaks=function(h,x,z,S,rel,pk,minWave){const w=(S.peak==null?0:S.peak)*pk;if(!(w>.01))return h;
 const amp=w*clamp(rel*.18,0,300);if(amp<1)return h;
 if(V2){
  const mw=Math.max(64,minWave==null?0:minWave),X=x+OX,Z=z+OZ;
  const wx=KRAND.gfbm(X/2400,Z/2400,2,(SEED^0x5061)>>>0)*480,wz=KRAND.gfbm(X/2400+19.3,Z/2400-7.1,2,(SEED^0x5062)>>>0)*480;
  let sum=0,norm=0,wt=1,a=1;
  for(let o=0;o<POCT2.length;o++){norm+=a;if(POCT2[o]<mw){a*=.55;continue;}
   const gn=rotG(X+wx,Z+wz,POCT2[o],(SEED^(0x5100+o))>>>0,o+1),rd=1-Math.sqrt(gn*gn+.012)*1.95,r=rd>0?rd:0;
   const r2=r*r;sum+=r2*wt*a;wt=clamp(r2*1.9,.22,1);a*=.55;}
  return h+amp*2.4*kneePos(sum/norm-.18,.04);}
 const X=x+OX,Z=z+OZ,wx=(fbm(X/2600,Z/2600,2,SEED^0x5045)-.5)*700,wz=(fbm(X/2600+19.3,Z/2600-7.1,2,SEED^0x5046)-.5)*700;
 let sum=0,norm=0,wt=1,a=1;
 for(let o=0;o<POCT.length;o++){norm+=a;if(POCT[o]<(minWave==null?0:minWave)){a*=.5;continue;}
  const n=vn((X+wx)/POCT[o],(Z+wz)/POCT[o],SEED^(0x5050+o));let r=1-Math.abs(2*n-1);r*=r;r*=wt;sum+=r*a;wt=clamp(r*2,0,1);a*=.5;}
 return h+amp*2*(sum/norm-PMEAN);};

R.crags=function(h,x,z,gx,gz,S,rel,minWave){
 if(!V2)return h;
 const mw=minWave==null?0:minWave;if(mw>=180)return h;
 const rk=Math.max(S.rock==null?0:S.rock,(S.peak==null?0:S.peak)*.85);if(!(rk>.22))return h;
 const sl=Math.sqrt(gx*gx+gz*gz),fade=smooth(.38,1.05,sl);if(fade<=0)return h;
 const ex=sl>1.35?(sl-1.35)/1.1:0,sheer=1/(1+ex*ex),amp=rk*clamp(rel/1800,.25,1.15)*fade*sheer;
 if(amp<.005)return h;
 const ax=x+OX,az=z+OZ,nx=-gz/sl,nz=gx/sl,st=ax*nx+az*nz,dp=(ax*gx+az*gz)/sl;
 const wx=KRAND.gnoise(ax/1400,az/1400,(SEED^0x5211)>>>0)*220,wz=KRAND.gnoise(ax/1400+17.3,az/1400-9.1,(SEED^0x5212)>>>0)*220;
 const g1=KRAND.gnoise((st+wx*.45)/150,dp/380,(SEED^0x5221)>>>0),r1=Math.max(0,1-Math.sqrt(g1*g1+.015)*1.9);
 let d=(r1*r1-.22)*48;
 if(mw<76){const g2=KRAND.gnoise((st-wz*.45)/76,dp/210,(SEED^0x5222)>>>0),r2=Math.max(0,1-Math.sqrt(g2*g2+.02)*1.95);d+=(r2*r2-.22)*20;}
 const gc=KRAND.gnoise((st+wx*.3)/115+9.4,dp/460,(SEED^0x5223)>>>0),rc=Math.max(0,1-Math.sqrt(gc*gc+.01)*2.4);
 d-=rc*rc*34;
 return h+amp*d;};

return R;})();
if(typeof module!=='undefined')module.exports=WRELIEF;
