// ================================================================= THE ANCIENT'S VALLEY — the data side: the model's ground, the fields, the city's plan
// [G data] Plain data and pure functions on core/rand (KRAND): no THREE, no DOM, so Godot takes the same records (tests/test-av.js).
// PLAN.md: the valley is a density field read off the scale model (section 3, option B: the city on the floor and the shelf, the farmland
// on the terraces, the forest from 600 m), with its scars (section 4) and its feral forest (section 5). A station's record (region/site.py:
// AV_REGION) gives the model's heights round its pixel, the lake's level and the cities and basins by NUMBER (the code never says a name).
//   AV.model(G)                   -> {at(x,z): the model's height (m, absolute) by bicubic on its 2 km cells; water(x,z): a water cell's
//                                     level or null; cell(x,z): the nearest cell's indices}
//   AV.band(hAbs)                 -> 'floor' | 'shelf' | 'terraces' | 'forest'   (PLAN.md section 3's bands: under 100, 300, 600 m)
//   AV.fields(o)                  -> {zone, density, park, scar, feral, taint}: the valley's fields at (x, z) in page metres
//   AV.plan(o)                    -> {towers:[{id,key,family,state,x,z,y,yaw,i,j,kind}], pitch, theta}: the towers as records on the ground
//   AV.viaduct(pts, o)            -> {piers:[{x,z,y0,y1}], decks:[{x,z,y,yaw,len}]}: a transit line's piers and deck along a polyline
//   AV.RUIN_CUTS                  the ruin states' cumulative shares (PLAN-ANOMALIES.md 13: 10-15% stand to full height)
//   AV.ENGINES                    the Ancient Engines (kits/ancients 8ah/8ai: cyclopean machines the size of a town) a station may stand, by key:
//                                 the kit's builder, the footprint's radius and height (its registered volumes), for the stage's pads and records
var AV={};
AV.ENGINES={harrow:{fn:'buildHarrow',name:'The Harrow',r:175,h:210},strider:{fn:'buildStrider',name:'The Strider',r:175,h:220},breech:{fn:'buildBreech',name:'The Breech',r:200,h:200},
 gyre:{fn:'buildGyre',name:'The Gyre',r:235,h:460},press:{fn:'buildPress',name:'The Press',r:300,h:600},sleeper:{fn:'buildSleeper',name:'The Sleeper',r:160,h:260},
 carapace:{fn:'buildCarapace',name:'The Carapace',r:215,h:130},retorts:{fn:'buildRetorts',name:'The Retorts',r:200,h:270},needle:{fn:'buildNeedle',name:'The Needle',r:240,h:300},ram:{fn:'buildRam',name:'The Ram',r:320,h:110}};
AV.RUINS=['intact','gutted','crown','broken','stump','skeleton','fallen'];
/* the owner, 2026-11-04, twice: the first cut looked far too intact, the second still too whole ("really fuck it up"). Intact 4%, gutted 8%,
   crown 10%, broken 22%, stump 22%, skeleton 14%, fallen 20%: four in five towers cut */
AV.RUIN_CUTS=[.04,.12,.22,.44,.66,.80,1.01];
/* the third time (2026-11-08, "further still"): intact 2%, gutted 5%, crown 8%, broken 22%, stump 25%, skeleton 16%, fallen 22% */
AV.RUIN_CUTS=[.02,.07,.15,.37,.62,.78,1.01];
/* a broken tower leans (the owner's third pass): a tilt in degrees by hash, 0 for what stands whole or lies fallen */
AV.lean=function(seed,i,j,state){if(state==='intact'||state==='fallen'||state==='gutted')return 0;var u=KRAND.unit(KRAND.hash(seed,i+4000,j+4000,8));return (state==='skeleton'?2:state==='stump'?3:5)*u;};
/* THE CRATERS (the war damage on the ground): n strikes on the page by hash, each a bowl with a raised rim and a scar of melt glass (a scar record
   for AV.fields: nothing grows there, the density is 0). o: {R, n, seed, ok(x,z) (true where a strike may land), rMin, rMax}
   AV.craters(o) -> [{x, z, r, depth, rim}];  AV.craterH(list, x, z) -> the height change (m): the bowl below, the rim above */
AV.craters=function(o){var out=[],n=o.n==null?10:o.n,seed=o.seed|0,R=o.R,tries=0;
 while(out.length<n&&tries<n*40){var i=tries++;var x=(KRAND.unit(KRAND.hash(seed,i,1))*2-1)*R,z=(KRAND.unit(KRAND.hash(seed,i,2))*2-1)*R;if(Math.hypot(x,z)>R)continue;
  var r=(o.rMin==null?35:o.rMin)+KRAND.unit(KRAND.hash(seed,i,3))*((o.rMax==null?110:o.rMax)-(o.rMin==null?35:o.rMin));if(o.ok&&!o.ok(x,z,r))continue;
  var clash=false;for(var k=0;k<out.length;k++)if(Math.hypot(out[k].x-x,out[k].z-z)<out[k].r+r+60){clash=true;break;}if(clash)continue;
  out.push({x:x,z:z,r:r,depth:r*.16+2,rim:r*.05+.6});}return out;};
/* the scorch: the ground blackened round the craters (to 2.4 r) and in burn patches of its own; 0..1 */
AV.scorch=function(list,x,z,seed){var s=0;for(var i=0;i<list.length;i++){var c=list[i],u=Math.hypot(x-c.x,z-c.z)/c.r;if(u<2.6){var k=AV.smooth(2.6,1.0,u);if(k>s)s=k;}}
 var n=KRAND.fbm(x*.0033+1.7,z*.0033-6.2,0,3,(seed|0)+29);return AV.clamp(Math.max(s,AV.smooth(.6,.72,n)*.85),0,1);};
/* the debris: slabs and blocks thrown from the craters onto the ground round them, and lying in the streets; records {x,z,yaw,tilt,sx,sy,sz}.
   o: {craters, R, n (the street debris), seed, ok(x,z)} */
AV.debris=function(o){var out=[],seed=o.seed|0,C=o.craters||[];
 for(var k=0;k<C.length;k++){var c=C[k],m=10+Math.floor(KRAND.unit(KRAND.hash(seed,k,1))*14);for(var i=0;i<m;i++){var a=KRAND.unit(KRAND.hash(seed,k,i*3+2))*Math.PI*2,d=c.r*(1.05+KRAND.unit(KRAND.hash(seed,k,i*3+3))*1.4),x=c.x+Math.cos(a)*d,z=c.z+Math.sin(a)*d;
   if(o.ok&&!o.ok(x,z))continue;var s=1+KRAND.unit(KRAND.hash(seed,k,i*3+4))*2.2;out.push({x:x,z:z,yaw:a+KRAND.unit(KRAND.hash(seed,k,i+70))*2,tilt:(KRAND.unit(KRAND.hash(seed,k,i+90))-.5)*1.1,sx:2.5*s,sy:.6*s,sz:4*s,kind:'ejecta'});}}
 var n=o.n==null?300:o.n;for(var j=0;j<n*3&&out.length<n+C.length*24;j++){var x2=(KRAND.unit(KRAND.hash(seed,j,5))*2-1)*o.R,z2=(KRAND.unit(KRAND.hash(seed,j,6))*2-1)*o.R;if(Math.hypot(x2,z2)>o.R)continue;if(o.ok&&!o.ok(x2,z2))continue;
  var s2=.8+KRAND.unit(KRAND.hash(seed,j,7))*2.6;out.push({x:x2,z:z2,yaw:KRAND.unit(KRAND.hash(seed,j,8))*Math.PI*2,tilt:(KRAND.unit(KRAND.hash(seed,j,9))-.5)*.8,sx:3*s2,sy:.5*s2,sz:5*s2,kind:'slab'});}
 return out;};
AV.craterH=function(list,x,z){var h=0;for(var i=0;i<list.length;i++){var c=list[i],d=Math.hypot(x-c.x,z-c.z);if(d>c.r*1.6)continue;var u=d/c.r;
  if(u<1){var b=1-u*u;h-=c.depth*b*b;}h+=c.rim*AV.smooth(.6,1,u)*AV.smooth(1.6,1.1,u);}return h;};
AV.BANDS=[['floor',100],['shelf',300],['terraces',600],['forest',Infinity]];
AV.band=function(h){for(var i=0;i<AV.BANDS.length;i++)if(h<AV.BANDS[i][1])return AV.BANDS[i][0];return 'forest';};
AV.smooth=function(a,b,x){var t=(x-a)/(b-a);t=t<0?0:t>1?1:t;return t*t*(3-2*t);};
AV.clamp=function(x,a,b){return x<a?a:x>b?b:x;};
// the model's ground round the station: bicubic (Catmull-Rom) over the record's 2 km cells, absolute metres; its water cells
AV.model=function(G){var H=G.h,nx=G.nx,nz=G.nz;
 var at=function(i,j){return H[j<0?0:j>=nz?nz-1:j][i<0?0:i>=nx?nx-1:i];};
 var cr=function(p0,p1,p2,p3,t){return p1+.5*t*(p2-p0+t*(2*p0-5*p1+4*p2-p3+t*(3*(p1-p2)+p3-p0)));};
 var W={};G.water.forEach(function(w){W[w[0]+','+w[1]]=w[2];});
 return{at:function(x,z){var u=(x-G.x0)/G.dx,v=(z-G.z0)/G.dz,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,r=[];
   for(var k=-1;k<=2;k++)r.push(cr(at(i-1,j+k),at(i,j+k),at(i+1,j+k),at(i+2,j+k),fu));return cr(r[0],r[1],r[2],r[3],fv);},
  cell:function(x,z){return[Math.round((x-G.x0)/G.dx),Math.round((z-G.z0)/G.dz)];},
  water:function(x,z){var c=this.cell(x,z),w=W[c[0]+','+c[1]];return w==null?null:w;},
  W:W};};
// the fields. o: {ground(x,z): page y, base (the model's height at y 0), lakeY, cities:[{x,z,n}], basins:[{x,z,r,n}], scars:[{x,z,rx,rz,yaw}], seed, R (the page's radius: the wild field's median is taken over it)}
//   zone(x,z)    the band by the model's height ('floor' the core, 'shelf' the residential rings, 'terraces' parks and farmland, 'forest')
//   density(x,z) 0..1 how built: the core 1 within 12 km of a city, the shelf .75, the terraces .2, the forest 0; nothing under the lake
//   park(x,z)    0..1 the ruined parks and gardens: patches of the shelf and the terraces (core/rand's noise)
//   scar(x,z)    0..1 dead ground: the scars' ellipses, and the basins' floors and rims (glass to 1.5 r)
//   feral(x,z)   0..1 the depth of the old planting: deepest in the parks and on the terraces, nothing on a scar
//   wild(x,z)    0..1 the overgrown half of the land (2 km lobes by core/rand's noise; nothing on a scar); foul(x,z) = 1 - wild on dry land
//   taint(x,z)   0..1 the leak of what the weapons did: a slow field, plus the scars and the basins' rims
AV.fields=function(o){var S=AV.smooth,seed=o.seed|0,scars=o.scars||[],basins=o.basins||[],cities=o.cities||[];
 var hAbs=function(x,z){return o.ground(x,z)+o.base;};
 var nearCity=function(x,z){var d=1e9;for(var i=0;i<cities.length;i++){var e=Math.hypot(x-cities[i].x,z-cities[i].z);if(e<d)d=e;}return d;};
 var scar=function(x,z){var s=0;for(var i=0;i<scars.length;i++){var e=scars[i],c=Math.cos(e.yaw||0),sn=Math.sin(e.yaw||0),dx=x-e.x,dz=z-e.z,u=(dx*c+dz*sn)/e.rx,v=(-dx*sn+dz*c)/e.rz,r=Math.hypot(u,v);
   var k=S(1.15,.75,r)*(e.k==null?1:e.k);if(k>s)s=k;}
  for(var b=0;b<basins.length;b++){var B=basins[b],rb=Math.hypot(x-B.x,z-B.z)/B.r;var kb=rb<1?1:S(1.5,1.05,rb);if(kb>s)s=kb;}return s;};
 var park=function(x,z){var zn=AV.band(hAbs(x,z));if(zn==='floor'||zn==='forest')return 0;var n=KRAND.fbm(x*.0011+2.3,z*.0011-7.1,0,3,seed+11);return S(.56,.66,n)*(zn==='terraces'?1:.85);};
 var density=function(x,z){if(o.ground(x,z)<o.lakeY+1)return 0;var zn=AV.band(hAbs(x,z)),d=nearCity(x,z),k=S(24000,10000,d);
  var base=zn==='floor'?1:zn==='shelf'?.75:zn==='terraces'?.2:0;return base*(.55+.45*k)*(1-park(x,z))*(1-scar(x,z));};
 // the wild (the owner, 2026-11-08: the land half scarred and polluted, half overgrown and gone feral): a slow field in 2 km lobes, about half
 // the dry land over a half, nothing on a scar; foul is the other half (the pollution: bare, oily ground, a sick scrub, the taint's colours)
 // the split is by the noise's MEDIAN over the page's dry land (a 48 x 48 sample at the fields' making), so every seed and every page gets its half:
 // at 1.4 km lobes a page is only a few lobes wide, and a fixed threshold gave one seed 18% wild and another 52%
 var wn=function(x,z){return KRAND.fbm(x*.0007+3.7,z*.0007-1.9,0,3,seed+23);},wildMid=(function(){var R=o.R==null?3000:o.R,v=[];for(var i=0;i<48;i++)for(var j=0;j<48;j++){var x=(i/47*2-1)*R,z=(j/47*2-1)*R;if(x*x+z*z>R*R||o.ground(x,z)<o.lakeY+.5)continue;v.push(wn(x,z));}
  if(!v.length)return .5;v.sort(function(a,b){return a-b;});return v[v.length>>1];})();
 var wild=function(x,z){if(o.ground(x,z)<o.lakeY+.5)return 0;return S(wildMid-.09,wildMid+.09,wn(x,z))*(1-scar(x,z));};
 var foul=function(x,z){if(o.ground(x,z)<o.lakeY+.5)return 0;return AV.clamp(1-wild(x,z),0,1);};
 var feral=function(x,z){if(o.ground(x,z)<o.lakeY+.5)return 0;var zn=AV.band(hAbs(x,z)),n=KRAND.fbm(x*.0021-1.1,z*.0021+4.7,0,3,seed+17),w=wild(x,z);
  var base=zn==='floor'?.35:zn==='shelf'?.55:zn==='terraces'?.8:.45;return AV.clamp((base+.5*(n-.5)+.45*park(x,z))*(1-scar(x,z))*(.3+.7*w)+.25*w,0,1);};
 var taint=function(x,z){var n=KRAND.fbm(x*.0007+9.2,z*.0007-3.3,0,4,seed+23),t=.15+.6*S(.35,.75,n);
  for(var b=0;b<basins.length;b++){var B=basins[b],rb=Math.hypot(x-B.x,z-B.z)/B.r;t+=.6*S(2.2,1.2,rb);}return AV.clamp(t+.5*scar(x,z),0,1);};
 return{zone:function(x,z){return AV.band(hAbs(x,z));},density:density,park:park,scar:scar,feral:feral,taint:taint,wild:wild,foul:foul,hAbs:hAbs};};
// the city's plan: the towers as records on a lattice turned by theta, a tower where the density says so, its family by the zone, its state by
// the ruin shares, its yaw by hash; none under the lake, on a scar or in a park. o: {R, pitch, theta, seed, ground(x,z), lakeY, F (AV.fields),
// coreKeys:[family...], shelfKeys:[...], near:{x,z,r,keys:[...]} (the designs that stand only as heroes: round the eye's start), skip(x,z)}
AV.plan=function(o){var P=[],pitch=o.pitch==null?150:o.pitch,th=o.theta==null?0:o.theta,c=Math.cos(th),s=Math.sin(th),R=o.R,seed=o.seed|0,F=o.F,NB=Math.ceil(R/pitch)+1;
 var u=function(i,j,salt){return KRAND.unit(KRAND.hash(seed,i+4000,j+4000,salt));};
 for(var i=-NB;i<=NB;i++)for(var j=-NB;j<=NB;j++){var lx=i*pitch,lz=j*pitch,x=lx*c-lz*s,z=lx*s+lz*c;if(Math.hypot(x,z)>R)continue;
  var y=o.ground(x,z);if(y<o.lakeY+1.5)continue;if(o.skip&&o.skip(x,z))continue;
  var d=F.density(x,z);if(d<=0||u(i,j,1)>d)continue;var zn=F.zone(x,z),kind=zn==='floor'?'core':zn==='shelf'?'residential':'farm';
  var fam,near=o.near&&Math.hypot(x-o.near.x,z-o.near.z)<o.near.r;
  if(near&&o.near.keys.length&&u(i,j,2)<.5)fam=o.near.keys[Math.floor(u(i,j,3)*o.near.keys.length)];
  else{var keys=kind==='core'?o.coreKeys:o.shelfKeys;fam=keys[Math.floor(u(i,j,3)*keys.length)];}
  var g=u(i,j,4),si=0;while(si<AV.RUIN_CUTS.length-1&&g>=AV.RUIN_CUTS[si])si++;var st=AV.RUINS[si];
  if(o.hero&&o.hero.indexOf(fam)>=0&&(st==='skeleton'||st==='fallen'))st='broken';   /* a family named in o.hero keeps a shape its ruin pass draws */
  var q=Math.floor(u(i,j,5)*4),yaw=th+(fam==='ledger'?(u(i,j,6)<.5?Math.PI/2:0):q*Math.PI/2);
  P.push({id:'av.t.'+i+'.'+j,key:fam+'.'+st,family:fam,state:st,x:x,z:z,y:y,yaw:yaw,i:i,j:j,kind:kind,lean:AV.lean(seed,i,j,st),leanDir:u(i,j,7)*Math.PI*2});}
 return{towers:P,pitch:pitch,theta:th};};
// a transit line: piers every o.step along the polyline pts [[x,z],...] from the ground (o.ground, page y) up to the deck, whose height is
// o.deckY(x,z,s) (s: the distance along the line); decks between piers. Pure records; 70-av-city.js draws them
AV.viaduct=function(pts,o){var step=o.step==null?36:o.step,piers=[],decks=[],s=0;
 for(var k=0;k+1<pts.length;k++){var a=pts[k],b=pts[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/step)),yaw=Math.atan2(b[1]-a[1],b[0]-a[0]);
  for(var q=0;q<n;q++){var t0=q/n,t1=(q+1)/n,x0=a[0]+(b[0]-a[0])*t0,z0=a[1]+(b[1]-a[1])*t0,x1=a[0]+(b[0]-a[0])*t1,z1=a[1]+(b[1]-a[1])*t1,ya=o.deckY(x0,z0,s+L*t0),yb=o.deckY(x1,z1,s+L*t1);
   piers.push({x:x0,z:z0,y0:o.ground(x0,z0)-2,y1:ya});decks.push({x:(x0+x1)/2,z:(z0+z1)/2,y:(ya+yb)/2,yaw:yaw,len:L/n,pitch:Math.atan2(yb-ya,L/n)});}
  s+=L;}
 var e=pts[pts.length-1];piers.push({x:e[0],z:e[1],y0:o.ground(e[0],e[1])-2,y1:o.deckY(e[0],e[1],s)});return{piers:piers,decks:decks,length:s};};
