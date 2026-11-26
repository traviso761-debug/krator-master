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
 carapace:{fn:'buildCarapace',name:'The Carapace',r:215,h:130},retorts:{fn:'buildRetorts',name:'The Retorts',r:200,h:270},needle:{fn:'buildNeedle',name:'The Needle',r:240,h:300},ram:{fn:'buildRam',name:'The Ram',r:320,h:110},
 /* the industrial set (the owner, 2026-11-10; kits/ancients targets/engines/8aj-engines3.js, read by the station that places one: the Yards) */
 coil:{fn:'buildCoil',name:'The Coil',r:155,h:320},procession:{fn:'buildProcession',name:'The Procession',r:400,h:270},mortar:{fn:'buildMortar',name:'The Mortar',r:230,h:260},
 vigil:{fn:'buildVigil',name:'The Vigil',r:135,h:260},receiver:{fn:'buildReceiver',name:'The Receiver',r:430,h:270},loom:{fn:'buildLoom',name:'The Loom',r:245,h:250},
 iris:{fn:'buildIris',name:'The Iris',r:115,h:360},hive:{fn:'buildHive',name:'The Hive',r:175,h:300},star:{fn:'buildStar',name:'The Star',r:175,h:270},abacus:{fn:'buildAbacus',name:'The Abacus',r:420,h:230}};
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
/* the items that can reach a cell (2026-11-10: the page's build spent most of its time in these fields, every sample scanning every crater and scar:
   53 s in craterH and 37 s in scar of a 560 s software-GL profile). A grid of `cell` metres lists, in the list's own order, the items whose reach
   (rad(item)) overlaps each cell; a field reads only its cell's items and gives the same numbers, bit for bit (the skipped items add nothing).
   AV.bucket(list, rad, cell) -> (x, z) => [indices] (an empty array outside every reach); cached on the list for its reach function */
AV.bucket=function(list,rad,cell){cell=cell||128;var G={},none=[];for(var i=0;i<list.length;i++){var r=rad(list[i]),it=list[i];
  for(var gx=Math.floor((it.x-r)/cell);gx<=Math.floor((it.x+r)/cell);gx++)for(var gz=Math.floor((it.z-r)/cell);gz<=Math.floor((it.z+r)/cell);gz++){var k=gx+','+gz;(G[k]||(G[k]=[])).push(i);}}
 return function(x,z){return G[Math.floor(x/cell)+','+Math.floor(z/cell)]||none;};};
/* where a subway's sinkholes, voids and stair pits can reach (kits/ancient-transit KTRANSIT.sinkholeH: the least of their drops, 0 beyond them all): a
   page calls the kit's function only where this says one reaches, the same numbers for the 27 s the scan cost (the 2026-11-10 profile).
   AV.sinkGate(SW) -> (x, z) => true where some drop may reach */
AV.sinkGate=function(SW){var L=[];(SW.sinkholes||[]).forEach(function(k){L.push({x:k.x,z:k.z,r:k.r});});
 (SW.voids||[]).forEach(function(V){L.push({x:V.x,z:V.z,r:Math.hypot(V.w/2,V.len/2)+V.ramp*1.5+1});});
 (SW.pits||[]).forEach(function(p){L.push({x:p.x,z:p.z,r:Math.hypot(p.w/2,p.run+.6)+1});});
 var B=AV.bucket(L,function(e){return e.r;},128);return function(x,z){var I=B(x,z);for(var q=0;q<I.length;q++){var e=L[I[q]];if(Math.hypot(x-e.x,z-e.z)<e.r)return true;}return false;};};
/* THE GROUND'S LATTICE (the owner, 2026-11-10: "is there any way to get these load times down even further"; the profile: the kits' placement scans
   asked the page's ground and fields millions of times, each a walk down the model's bicubic, two noises, the pads, the craters and the roads' grades).
   fn sampled once at the nodes of a `cell`-metre lattice over [-half, half] squared, filled a tile of tile x tile cells at a time where first asked, and
   read bilinearly between them. Each cell is also sampled at its centre: where the centre is off the bilinear guess by more than `tol` metres (a pit's
   rim, a kerb, a crater's lip inside the cell) the cell is "sharp" and its reads go to fn itself, so the lattice is within tol of fn wherever its
   features are wider than a cell, and exact where they are not. A node's value is fn's at that node, so the reads are the same in any order of asking.
   Outside the square: fn. AV.lattice(fn, {cell, half, tile, tol}) -> {h(x, z), stats: {tiles, sharp, cells}} */
AV.lattice=function(fn,o){var c=o.cell,hf=o.half,T=o.tile==null?8:o.tile,tol=o.tol==null?.12:o.tol,n=Math.ceil(2*hf/c),nt=Math.ceil(n/T),W=T+1,tiles=new Array(nt*nt),st={tiles:0,sharp:0,cells:0};
 function tile(k,ti,tj){var A=new Float32Array(W*W),S=new Uint8Array(T*T),x0=-hf+ti*T*c,z0=-hf+tj*T*c,i,j;
  for(j=0;j<W;j++)for(i=0;i<W;i++)A[j*W+i]=fn(x0+i*c,z0+j*c);
  for(j=0;j<T;j++)for(i=0;i<T;i++){var p=j*W+i,g=(A[p]+A[p+1]+A[p+W]+A[p+W+1])/4;if(Math.abs(fn(x0+(i+.5)*c,z0+(j+.5)*c)-g)>tol){S[j*T+i]=1;st.sharp++;}}
  st.tiles++;st.cells+=T*T;return tiles[k]={A:A,S:S};}
 return{h:function(x,z){var u=(x+hf)/c,v=(z+hf)/c;if(!(u>=0&&v>=0&&u<n&&v<n))return fn(x,z);
   var i=Math.floor(u),j=Math.floor(v),ti=(i/T)|0,tj=(j/T)|0,k=tj*nt+ti,L=tiles[k]||tile(k,ti,tj),li=i-ti*T,lj=j-tj*T;if(L.S[lj*T+li])return fn(x,z);
   var A=L.A,p=lj*W+li,a=A[p],b=A[p+1],d=A[p+W],e=A[p+W+1],fu=u-i,fv=v-j;return a+(b-a)*fu+(d-a)*fv+(a-b-d+e)*fu*fv;},stats:st};};
AV.craterH=function(list,x,z){var h=0,B=list._avB||(list._avB=AV.bucket(list,function(c){return c.r*1.6;},128)),I=B(x,z);for(var q=0;q<I.length;q++){var c=list[I[q]],d=Math.hypot(x-c.x,z-c.z);if(d>c.r*1.6)continue;var u=d/c.r;
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
 /* the four rows' values held in locals, not pushed to an array (the same sums in the same order: the same heights, bit for bit) */
 return{at:function(x,z){var u=(x-G.x0)/G.dx,v=(z-G.z0)/G.dz,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
   return cr(cr(at(i-1,j-1),at(i,j-1),at(i+1,j-1),at(i+2,j-1),fu),cr(at(i-1,j),at(i,j),at(i+1,j),at(i+2,j),fu),cr(at(i-1,j+1),at(i,j+1),at(i+1,j+1),at(i+2,j+1),fu),cr(at(i-1,j+2),at(i,j+2),at(i+1,j+2),at(i+2,j+2),fu),fv);},
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
 var scarB=AV.bucket(scars,function(e){return 1.15*Math.max(e.rx,e.rz);},128);
 var scar=function(x,z){var s=0,I=scarB(x,z);for(var q=0;q<I.length;q++){var e=scars[I[q]],c=Math.cos(e.yaw||0),sn=Math.sin(e.yaw||0),dx=x-e.x,dz=z-e.z,u=(dx*c+dz*sn)/e.rx,v=(-dx*sn+dz*c)/e.rz,r=Math.hypot(u,v);
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
  /* the lake-front (the owner, 2026-11-09: "the height of the average building rises as we approach the lake"): o.lakeK(x, z) 1 at the shore, 0 inland;
     over .5 a pick turns to o.tall with a chance rising to .7 at the shore, under .4 to o.short with a chance rising to .4 inland; the near keys stand */
  if(!near&&o.lakeK&&(o.tall||o.short)){var lk=o.lakeK(x,z),r8=u(i,j,8);if(o.tall&&o.tall.length&&lk>.5&&r8<(lk-.5)*1.4)fam=o.tall[Math.floor(u(i,j,9)*o.tall.length)];
   else if(o.short&&o.short.length&&lk<.4&&r8<(.4-lk))fam=o.short[Math.floor(u(i,j,9)*o.short.length)];}
  var g=u(i,j,4),si=0;while(si<AV.RUIN_CUTS.length-1&&g>=AV.RUIN_CUTS[si])si++;var st=AV.RUINS[si];
  if(o.hero&&o.hero.indexOf(fam)>=0&&(st==='skeleton'||st==='fallen'))st='broken';   /* a family named in o.hero keeps a shape its ruin pass draws */
  var q=Math.floor(u(i,j,5)*4),yaw=th+(fam==='ledger'?(u(i,j,6)<.5?Math.PI/2:0):q*Math.PI/2);
  P.push({id:'av.t.'+i+'.'+j,key:fam+'.'+st,family:fam,state:st,x:x,z:z,y:y,yaw:yaw,i:i,j:j,kind:kind,lean:AV.lean(seed,i,j,st),leanDir:u(i,j,7)*Math.PI*2});}
 var dropped=o.kerb?AV.kerbPlace(P,o,u,pitch,c,s):0;
 return{towers:P,pitch:pitch,theta:th,kerbDropped:dropped};};
/* THE KERB LINES (the owner, 2026-11-09: "place the towers along the transit kit's kerb lines instead of the bare grid lines"). The streets run on
   the lattice's half lines ((k + 1/2) pitch; every third, k % 3 == 1, an avenue), so a tower on its node stood alone in the middle of its 165 m
   cell, 50 m of plinth from any street. Here each tower slides in its cell until its plinth stops o.kerb.gap metres behind the pavement of one
   street (an avenue three times as often as a road), and one time in o.kerb.corner (.35) of a second street across it too (a corner lot); its
   ground is read again where it lands. A street exists inside o.kerb.R (the network's disc) and its lines inside o.kerb.lineMax. A tower whose
   landing o.skip refuses, or that would stand in the lake, tries the street alone, then stays on its node. o.kerb: {road, avenue (the half width of
   the roadway plus its pavement), gap, corner, R, lineMax, extent(family) -> [rx, rz] (the plinth's half extents in the tower's frame)}. Each
   tower keeps T.kerb = {axis, side, corner} or null */
AV.kerbPlace=function(P,o,u,p,c,s){var K=o.kerb,gap=K.gap==null?3:K.gap,cp=K.corner==null?.35:K.corner,Rs=K.R==null?1e9:K.R,lm=K.lineMax==null?1e9:K.lineMax;
 var isAv=function(k){return((k%3)+3)%3===1;},toXZ=function(a,b){return[a*c-b*s,a*s+b*c];};
 P.forEach(function(T){var e=K.extent?K.extent(T.family):null;if(!e)return;var ang=T.yaw-Math.atan2(s,c),ca=Math.abs(Math.cos(ang)),sa=Math.abs(Math.sin(ang)),ex=[ca*e[0]+sa*e[1],sa*e[0]+ca*e[1]],node=[T.i*p,T.j*p];
  /* the four streets round the cell: axis a, side sg; its half line index, whether it is an avenue, and the slide toward it */
  var sides=[];for(var a=0;a<2;a++)for(var sg=-1;sg<=1;sg+=2){var idx=a===0?T.i:T.j,k=sg>0?idx:idx-1,v=(k+.5)*p;if(Math.abs(v)>lm)continue;var av=isAv(k),hw=av?K.avenue:K.road,sh=sg*(.5*p-hw-gap-ex[a]);if(sh*sg<=0)continue;sides.push({a:a,sg:sg,av:av,sh:sh});}
  /* the slide on an axis the tower does not slide along (defined before its first use: a tower with no street on any side reaches it first) */
  var fit=function(a){var idx=a===0?T.i:T.j,room=function(k){return Math.abs((k+.5)*p)>lm?.5*p:.5*p-(isAv(k)?K.avenue:K.road);},lo=-room(idx-1)+ex[a],hi=room(idx)-ex[a];return lo<=hi?Math.min(hi,Math.max(lo,0)):(lo+hi)/2;};
  if(!sides.length){var l0=[node[0]+fit(0),node[1]+fit(1)],w0=toXZ(l0[0],l0[1]);if((l0[0]!==node[0]||l0[1]!==node[1])&&Math.hypot(w0[0],w0[1])<=Rs&&o.ground(w0[0],w0[1])>=o.lakeY+1.5&&!(o.skip&&o.skip(w0[0],w0[1]))){T.x=w0[0];T.z=w0[1];T.y=o.ground(w0[0],w0[1]);}T.kerb=null;return;}
  var pick=function(L,r){var W=0;L.forEach(function(q){W+=q.av?3:1;});var t=r*W;for(var n=0;n<L.length;n++){t-=L[n].av?3:1;if(t<0)return L[n];}return L[L.length-1];};
  var A=pick(sides,u(T.i,T.j,11)),cross=sides.filter(function(q){return q.a!==A.a;}),B=cross.length&&u(T.i,T.j,12)<cp?pick(cross,u(T.i,T.j,13)):null;
  /* an axis the tower does not slide along keeps its plinth between that axis's two kerbs: a plinth wider than the node's room toward an avenue
     (the Pods, 120 m) moves off it toward the road across, and one wider than the whole cell sits in the middle of it */
  var land=function(B){var l=[node[0],node[1]];l[A.a]+=A.sh;if(B)l[B.a]+=B.sh;else l[1-A.a]+=fit(1-A.a);var w=toXZ(l[0],l[1]);if(Math.hypot(w[0],w[1])>Rs)return null;var y=o.ground(w[0],w[1]);if(y<o.lakeY+1.5)return null;if(o.skip&&o.skip(w[0],w[1]))return null;return{x:w[0],z:w[1],y:y};};
  var L=land(B),corner=!!B;if(!L&&B){L=land(null);corner=false;}if(!L){var l1=[node[0]+fit(0),node[1]+fit(1)],w1=toXZ(l1[0],l1[1]);if(Math.hypot(w1[0],w1[1])<=Rs&&o.ground(w1[0],w1[1])>=o.lakeY+1.5&&!(o.skip&&o.skip(w1[0],w1[1]))){T.x=w1[0];T.z=w1[1];T.y=o.ground(w1[0],w1[1]);}T.kerb=null;return;}
  T.x=L.x;T.z=L.z;T.y=L.y;T.kerb={axis:A.a,side:A.sg,avenue:A.av,corner:corner};});
 /* a tower whose plinth still reaches into a roadway or a pavement after every try (each slide refused by the plan, a plinth wider than its cell)
    is not built: a building does not stand in the street. Returns how many went */
 var n0=P.length,keep=P.filter(function(T){var e=K.extent?K.extent(T.family):null;if(!e)return true;if(Math.hypot(T.x,T.z)>Rs)return true;var ang=T.yaw-Math.atan2(s,c),ca=Math.abs(Math.cos(ang)),sa=Math.abs(Math.sin(ang)),ex=[ca*e[0]+sa*e[1],sa*e[0]+ca*e[1]],l=[T.x*c+T.z*s,-T.x*s+T.z*c];
  for(var a=0;a<2;a++){var k=Math.round(l[a]/p-.5);if(Math.abs((k+.5)*p)>lm)continue;if(Math.abs(l[a]-(k+.5)*p)-ex[a]-(isAv(k)?K.avenue:K.road)<-.5)return false;}return true;});
 P.length=0;keep.forEach(function(T){P.push(T);});return n0-P.length;};
// a transit line: piers every o.step along the polyline pts [[x,z],...] from the ground (o.ground, page y) up to the deck, whose height is
// o.deckY(x,z,s) (s: the distance along the line); decks between piers. Pure records; 70-av-city.js draws them
AV.viaduct=function(pts,o){var step=o.step==null?36:o.step,piers=[],decks=[],s=0;
 for(var k=0;k+1<pts.length;k++){var a=pts[k],b=pts[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/step)),yaw=Math.atan2(b[1]-a[1],b[0]-a[0]);
  for(var q=0;q<n;q++){var t0=q/n,t1=(q+1)/n,x0=a[0]+(b[0]-a[0])*t0,z0=a[1]+(b[1]-a[1])*t0,x1=a[0]+(b[0]-a[0])*t1,z1=a[1]+(b[1]-a[1])*t1,ya=o.deckY(x0,z0,s+L*t0),yb=o.deckY(x1,z1,s+L*t1);
   piers.push({x:x0,z:z0,y0:o.ground(x0,z0)-2,y1:ya});decks.push({x:(x0+x1)/2,z:(z0+z1)/2,y:(ya+yb)/2,yaw:yaw,len:L/n,pitch:Math.atan2(yb-ya,L/n)});}
  s+=L;}
 var e=pts[pts.length-1];piers.push({x:e[0],z:e[1],y0:o.ground(e[0],e[1])-2,y1:o.deckY(e[0],e[1],s)});return{piers:piers,decks:decks,length:s};};
