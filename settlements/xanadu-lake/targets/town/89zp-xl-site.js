// ================================================================= THE LAKE TOWNS — the ground in closed form (settlements/xanadu-lake/PLAN.md section 3)
// [G data] No drawing. Every lake town's ground from its spec (89zl XL.SPECS[key].layout) and its fit to the region
// (89zm XL.FIT[key], tools/fit_lake_town.py), as Phēr's 89zp-ph-site.js draws Phēr's:
//
// THE FRAME. Page metres from the landing (where the region's land crosses the lake's level on the town's bearing): x along
// the shore, z toward the lake, y over the lake's level (the world's height is y + XL.FIT[key].level, about -520 m). The
// world is the page turned by the bearing: world = the pin + Ry(rot)(page - centre), `centre` the page point on the pin.
//
// THE GROUND (xlH). d = xlShoreZ(key, x) - z, the distance inland of the waterline:
//   - the profile across the shore, prof(d): the fit's knots (the region's median over the town's width), the beach and
//     the bed falling lakeward, the slope and the wall rising inland;
//   - the terrace benches: each a band of the contour [d0, d1] cut and filled level at the profile's height at its middle,
//     its ends eased over 30 m, its risers over 18 m (the verify: level within 0.5 m);
//   - the stream (xlStream): a ravine down the slope to the shore, deepening inland, ending at its head (its `to`);
//   - outside the town's core (|x| < core.x, -core.lake < d < core.d) the region's rest (the fit's res, every 50 m) fades in
//     over core.fade m, so at the footprint's edge and the band the page's ground is the world's.
//   xlH(key, x, z)        the ground's height over the level
//   xlShoreZ(key, x)      z of the page's waterline at x (the fit's smoothed shore)
//   xlStream(key)         the stream: {x, drift, to, pts: [[x, z], ...] mouth first, every 20 m}, or null (layout.stream null:
//                         a town with no stream); xlStreamX(key, z) its x at z (NaN with none)
//   xlWorldFrame(key)     {rot, centre, y0} (core/world/bake_towns.py samples xlH through it); xlToWorld(key, x, z)
//   xlGeo(key)            the derived geometry: the benches with their levels and x extents, the stream, the core
const xlSm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
// a piecewise-linear lookup on sorted knots, held at the ends
function xlLerpK(K,V,v){if(v<=K[0])return V[0];const n=K.length-1;if(v>=K[n])return V[n];let i=1;while(K[i]<v)i++;const t=(v-K[i-1])/(K[i]-K[i-1]);return V[i-1]+(V[i]-V[i-1])*t;}
function xlFit(key){const F=XL.FIT&&XL.FIT[key];if(!F)throw new Error('xanadu-lake: no fit for '+key+' (python3 tools/fit_lake_town.py '+key+')');return F;}
// the profile across the shore: the fit's knots (beyond the last, the last knot's grade carries on)
function xlProf(F,d){const K=F.prof.d,V=F.prof.y,n=K.length-1;
 if(d>K[n])return V[n]+(V[n]-V[n-1])/(K[n]-K[n-1])*(d-K[n]);if(d<K[0])return V[0]+(V[1]-V[0])/(K[1]-K[0])*(d-K[0]);return xlLerpK(K,V,d);}
// the region's rest at (x, d): bilinear on the fit's grid (tenths of a metre), held at its edges
function xlRes(F,x,d){const R=F.res,u=Math.min(R.nx-1.0001,Math.max(0,(x-R.x0)/R.step)),v=Math.min(R.nd-1.0001,Math.max(0,(d-R.d0)/R.step)),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,g=(a,b)=>R.v[b*R.nx+a]*.1;
 return (g(i,j)*(1-fu)+g(i+1,j)*fu)*(1-fv)+(g(i,j+1)*(1-fu)+g(i+1,j+1)*fu)*fv;}
// z of the waterline at x (the fit's smoothed shore every 50 m)
function xlShoreZ(key,x){const S=xlFit(key).shore,u=Math.min(S.z.length-1.0001,Math.max(0,(x-S.x0)/S.step)),i=Math.floor(u),t=u-i;return S.z[i]+(S.z[i+1]-S.z[i])*t;}
// the stream's x at inland distance d (its line drifts with the slope); at page z, solved from the shore there
const xlStreamXd=(G,d)=>G.stream?G.stream.x+G.stream.drift*Math.max(0,d):NaN;
function xlStreamX(key,z){const G=xlGeo(key);if(!G.stream)return NaN;let x=G.stream.x;for(let k=0;k<4;k++)x=xlStreamXd(G,xlShoreZ(key,x)-z);return x;}
// the stream's head (page z): its line's last point
function xlStreamTo(key){const G=xlGeo(key);if(!G.stream)return NaN;return xlShoreZ(key,xlStreamXd(G,G.stream.to))-G.stream.to;}
function xlStream(key){const G=xlGeo(key),pts=[];if(!G.stream)return null;for(let d=0;d<=G.stream.to+.1;d+=20){const x=xlStreamXd(G,d);pts.push([x,xlShoreZ(key,x)-d]);}
 return{x:G.stream.x,drift:G.stream.drift,to:G.stream.to,pts};}
// the derived geometry (cached a town): the benches' levels and x extents (kept 60 m clear of the stream), the core
const XL_GEO={};
function xlGeo(key){if(XL_GEO[key])return XL_GEO[key];const S=XL.SPECS[key],F=xlFit(key),L=S.layout,st=L.stream;
 const G={key,S,F,L,stream:st?{x:st.x,drift:st.drift,to:st.to}:null,core:L.core,benches:[]};
 L.benches.forEach(([d0,d1],i)=>{const x1=st?Math.min(L.benchHalf,st.x+st.drift*d0-60):L.benchHalf,x0=-L.benchHalf;
  G.benches.push({i,d0,d1,x0,x1,y:+xlProf(F,(d0+d1)/2).toFixed(2)});});
 return XL_GEO[key]=G;}
// the ground
function xlH(key,x,z){const G=xlGeo(key),F=G.F,C=G.core,d=xlShoreZ(key,x)-z;let y=xlProf(F,d);
 for(const B of G.benches){const w=xlSm(B.x0-30,B.x0,x)*xlSm(B.x1+30,B.x1,x)*xlSm(B.d0-18,B.d0,d)*xlSm(B.d1+18,B.d1,d);if(w>0)y+=(B.y-y)*w;}
 // the stream's ravine: 1.6 m at the shore, ~5 m on the slope, easing out to its head
 if(G.stream){const dx=x-xlStreamXd(G,d),s=G.stream,deep=(1.6+3.6*xlSm(0,260,d))*xlSm(s.to,s.to-160,d),wd=7+9*xlSm(0,300,d);
  if(deep>0&&Math.abs(dx)<wd*3)y-=deep*Math.exp(-(dx*dx)/(wd*wd))*xlSm(-12,25,d);}
 // outside the core the region's rest fades in
 const f=Math.max(xlSm(C.x,C.x+C.fade,Math.abs(x)),xlSm(C.d,C.d+C.fade,d),xlSm(-C.lake,-C.lake-C.fade,d));
 if(f>0)y+=f*xlRes(F,x,d);
 return y;}
// THE WORLD'S FRAME (core/world/bake_towns.py samples xlH through it): world = the pin + Ry(rot)(page - centre), y0 the level
function xlWorldFrame(key){const F=xlFit(key);return{rot:F.rot,centre:F.centre.slice(),y0:F.level};}
// page metres to the world's: metres from the pin (x east, z south) and the world's height
function xlToWorld(key,x,z){const F=xlWorldFrame(key),dx=x-F.centre[0],dz=z-F.centre[1],c=Math.cos(F.rot),s=Math.sin(F.rot);return[dx*c+dz*s,-dx*s+dz*c,xlH(key,x,z)+F.y0];}
