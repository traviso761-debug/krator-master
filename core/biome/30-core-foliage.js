// ================================================================= BIOME CORE — foliage
// What makes a card read as leaves. Ported from Girder's 60-trees.js and the
// Hexahedron's 71b-flora.js, with the three lessons those cost:
//   - LAMBERT, never Standard: a Standard card keeps a 4% specular at any
//     roughness and goes white at grazing angles, i.e. from under the canopy.
//   - two-sided light MIX, not a flip: a leaf seen from below is a lit,
//     translucent leaf, not the ground-hemisphere shadow a flipped normal gives.
//   - low-alpha texels carry the species' MID colour, or mipmapping bleeds a
//     black fringe round every leaf at distance; and alpha is boosted with
//     distance, or the far canopy thins to lace.
(function(){const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,h3,vnoise,fbm,qEuler,qFacing,qUp}=BIO.fn;
// THE WIND: one clock and, if the host has one, one wind (biomes/WORLD.md, 'The air'). With no host
// clock the core keeps its own (seconds since load, from the host's ticks); with BIO.init({clock}) it
// reads the world's (core/atmos: ATMOS.clock.t), so a paused or pinned clock stills the leaves too.
// Without one, on a page whose frame loop is core/host's, it takes that loop's motion time (KHOST.host.clock.t, the t
// the kits' ticks are called with; ?t= pins it), so the foliage and every kit's tick read one clock; the export pins it (BIO._pinT) to bake the fauna's motion.
// With BIO.init({wind}) -> [x,z] (1 = the calm breeze) the sway grows with the wind's strength and
// the foliage leans downwind, pulsing; with none, on=0 and the sway is exactly what it always was.
BIO.WIND={t:{value:0},v:{value:null},on:{value:0}};
BIO.SUN={value:null};                 // set by BIO.setSun([x,y,z]); defaults at first use
BIO.setSun=function(v){const T=BIO.host.THREE;if(!BIO.SUN.value)BIO.SUN.value=new T.Vector3();BIO.SUN.value.set(v[0],v[1],v[2]).normalize();};
BIO._windTicked=false;
BIO._tickWind=function(){if(BIO._windTicked)return;BIO._windTicked=true;const W=BIO.WIND;
 if(!W.v.value)W.v.value=new BIO.host.THREE.Vector2(0,0);
 BIO.host.ticks(dt=>{const h=BIO.host;const K=typeof KHOST!=='undefined'&&KHOST&&KHOST.host&&KHOST.host.clock?KHOST.host.clock:null;
  W.t.value=BIO._pinT!=null?BIO._pinT:h.clock?h.clock():K?K.t:W.t.value+dt;
  if(h.wind){const w=h.wind();W.v.value.set(w[0],w[1]);W.on.value=1;}
  if(BIO.GUST)BIO.GUST.t.value=BIO._pinT!=null?BIO._pinT:typeof ATMOS!=='undefined'&&ATMOS.clock?ATMOS.clock.t:W.t.value;});};
// ONE WIND FIELD (R8; biomes/DETAIL-RESEARCH.md item 7, WEATHER-RESEARCH.md item 5). BIO.bindAtmosWind(o) after ATMOS.init:
// the foliage then reads core/atmos's wind and its TRAVELLING GUSTS (atmGust, the GLSL ATMOS.GLSL_WIND writes from its
// presets, so the leaves, the smoke, the rain and the cloth ride one field): each instance's sway and lean scale by
// 1 + gustAmp*gain*atmGust(t, its root's world xz, the wind), so a gust front visibly rolls downwind across a meadow
// and a crown; the base wind (ATMOS.U.wind, the weather's scale in it) over its calm length is the host's wind unless
// the host bound one (BIO.init({wind})). It reads atmos's uniforms (U.wind, U.gustAmp) and clock, never edits them.
// o.gain (1) scales the gusts. Call it before the first frame (the shaders take the gust code when they compile).
// Unbound (the default) nothing changes. Returns false without core/atmos. Godot: leaf.gdshader reads the same
// global uniforms (atm_wind, atm_gust_amp, atm_time) and the same atmGust (core/atmos GODOT.md).
BIO.GUST=null;
BIO.bindAtmosWind=function(o){o=o||{};
 if(typeof ATMOS==='undefined'||!ATMOS||!ATMOS.U||!ATMOS.GLSL_WIND||!ATMOS.PRESETS){if(BIO.err)BIO.err('BIO.bindAtmosWind: core/atmos is not initialised (ATMOS.init first)');return false;}
 const PW=ATMOS.PRESETS.wind,calm=Math.hypot(PW.base[0],PW.base[1])||1;
 BIO.GUST={glsl:ATMOS.GLSL_WIND,t:{value:ATMOS.clock?ATMOS.clock.t:0},w:ATMOS.U.wind,amp:ATMOS.U.gustAmp,k:{value:o.gain==null?1:+o.gain}};
 if(BIO.host&&!BIO.host.wind)BIO.host.wind=()=>{const w=ATMOS.U.wind.value;return[w.x/calm,w.y/calm];};
 if(BIO.host)BIO._tickWind();return true;};
// THE SPIN (B9; nsemiarid's helicopter trumpets): a leafMat with o.spin turns its vertices about the instance's own origin,
// round its own up axis, by BIO.SPIN.value radians (the host integrates the wind into it) at a speed and phase per
// instance (x0.8..1.2). o.spin may be a uniform {value} of the host's own instead of true.
BIO.SPIN={value:0};
// THE SEASON (H7; biomes/hyperjungle/PLAN-LANDS.md section 11): BIO.SEASON.value, 0..1, how far into the dry season the page
// stands (core/clock's KCLOCK.season(...).dry). BIO.setSeason(x) takes a number or a season record ({dry}); BIO.bindSeason(clock,
// o) sets it every frame from a KCLOCK clock (default KHOST.host.clock), o being KCLOCK.season's options ({latitude, lagD,
// sharp, wetIn}); it returns false without core/clock or a clock. Only a leafMat with o.season reads it (below); at 0 it draws
// exactly what it would without. Godot: the same uniform as a global (leaf.gdshader takes it when the kits adopt it).
BIO.SEASON={value:0};
BIO.setSeason=function(s){const d=s!=null&&typeof s==='object'?s.dry:s;BIO.SEASON.value=Math.min(1,Math.max(0,+d||0));return BIO.SEASON.value;};
BIO.bindSeason=function(clock,o){const K=typeof KHOST!=='undefined'&&KHOST&&KHOST.host?KHOST.host.clock:null,C=clock||K;
 if(typeof KCLOCK==='undefined'||!KCLOCK||!KCLOCK.season||!C){if(BIO.err)BIO.err('BIO.bindSeason: needs core/clock and a clock');return false;}
 const f=()=>BIO.setSeason(KCLOCK.season(C.day,C.hour,o));f();if(BIO.host)BIO.host.ticks(f);return true;};
// the per-material options (o.season): drop 0..1 (the share of cards gone at the height of the dry; 0 none), colour (hex: what
// the instance and vertex colours give way to as it dries; null none), k 0..1 (how far they go at full dry; 1), stagger 0..1
// (how far each instance's dryness is spread about the page's, by its hash, so a stand turns patchily; .5)
BIO._seasonOpt=function(s){s=s===true?{}:s;return{drop:s.drop==null?0:+s.drop,colour:s.colour==null?null:s.colour,k:s.k==null?1:+s.k,stagger:s.stagger==null?.5:+s.stagger};};
// a per-instance hash in GLSL (Dave Hoskins' hash13, no sine: the same on every GPU)
BIO.GLSL_SEASON_HASH='float bioSnHash(vec3 p){vec3 q=fract(p*0.1031);q+=dot(q,q.zyx+31.32);return fract((q.x+q.y)*q.z);}';
// ALPHA-TO-COVERAGE (R7; DETAIL-RESEARCH item 4): BIO.setA2C(renderer) after the kits are built (their libSwap sets the
// alpha tests) and before the first frame. With MSAA on a WebGL2 context, every textured leafMat with an alpha test draws
// its cut-out edge by coverage (the alpha sharpened to a pixel's width about the old cut-off, a 0.02 test kept for the
// empty texels): soft, unaliased leaf edges, no shimmering fringe. Without MSAA it does nothing and the alpha test
// stays (the fallback). BIO.setA2C(renderer,false) turns it back off. Godot: alpha_antialiasing_mode (alpha-to-coverage).
// B4 (GRAPHICS-TERRAIN-PROPOSAL 12d, 2026-11-23): on by default. A page that never calls it gets it at BIO.bake, on the renderer
// BIO.init was handed (h.renderer) or the page's global `renderer`; BIO.A2C_AUTO false, or any call of its own (on or off), wins.
BIO.A2C=false;BIO._leafMats=[];BIO.A2C_AUTO=true;BIO._a2cAsked=false;
BIO._a2cAuto=function(){if(!BIO.A2C_AUTO||BIO._a2cAsked)return false;let r=BIO.host&&BIO.host.renderer||null;
 if(!r)try{r=typeof renderer!=='undefined'&&renderer&&renderer.getContext?renderer:null;}catch(e){r=null;}   /* a `renderer` declared later in the page: not yet */
 if(!r)return false;BIO.setA2C(r);return true;};
BIO.setA2C=function(renderer,on){let ok=false;BIO._a2cAsked=true;
 try{const gl=renderer&&renderer.getContext&&renderer.getContext();if(gl&&renderer.capabilities&&renderer.capabilities.isWebGL2)ok=gl.getParameter(gl.SAMPLES)>1;}catch(e){ok=false;}
 BIO.A2C=on===false?false:ok;BIO._leafMats.forEach(BIO._a2cApply);return BIO.A2C;};
BIO._a2cApply=function(m){const U=m.userData;if(U.a2c0==null)U.a2c0=m.alphaTest||0;
 const on=!!(BIO.A2C&&m.map&&U.a2c0>0);if(on===!!m.alphaToCoverage)return;
 m.alphaToCoverage=on;U.a2cCut=on?U.a2c0:null;m.alphaTest=on?.02:U.a2c0;m.needsUpdate=true;};
// FLOOR COVER TAKES THE GROUND'S COLOUR (R5; DETAIL-RESEARCH item 2). BIO.setGround(tex, box) gives the page's ground
// colour: a texture over the world box [x0,z0,x1,z1] (the u axis x0..x1, v z0..z1: pass [x0,z1,x1,z0] for a ground
// painted with v flipped), sRGB unless {linear:true}. BIO.groundTex(fn, box, N) bakes a function (x,z) -> colour (hex,
// Color or sRGB [r,g,b]) into a small one (N x N, 128). A leafMat with o.ground ({k, gain, tip, fade}) then takes that colour
// at each instance's root and shades from it (k .85 of it at the root) to the species' own colour at the tip (tip: a GLSL
// 0..1 expression, default position.y; gain x the paint, 1, to match the ground's own tint and light), and past
// fade:[d0,d1] (metres from the camera, the floor band's end) it turns wholly to the ground's colour, shrinks to 40% and
// dissolves, so the band ends without an edge. One texture read per vertex, no draws. Godot: the same sampler in leaf.gdshader.
BIO.GROUND={tex:{value:null},box:{value:null}};
BIO.setGround=function(tex,box,o){o=o||{};const T=BIO.host.THREE;
 if(!tex||!tex.isTexture||!box||box.length!==4||!(box[2]!==box[0]&&box[3]!==box[1])){if(BIO.err)BIO.err('BIO.setGround: a texture and a box [x0,z0,x1,z1] of some size');return false;}
 BIO.GROUND.tex.value=tex;BIO.GROUND.box.value=new T.Vector4(box[0],box[1],box[2],box[3]);BIO.GROUND.linear=!!o.linear;return true;};
BIO.groundTex=function(fn,box,N){N=N==null?128:N;const T=BIO.host.THREE,d=new Uint8Array(N*N*4),c=new T.Color();
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const v=fn(box[0]+(i+.5)/N*(box[2]-box[0]),box[1]+(j+.5)/N*(box[3]-box[1])),o=(j*N+i)*4;
  if(Array.isArray(v))c.setRGB(v[0],v[1],v[2]);else if(v&&v.isColor)c.copy(v);else c.set(v==null?0x808080:v);
  d[o]=Math.round(clamp(c.r,0,1)*255);d[o+1]=Math.round(clamp(c.g,0,1)*255);d[o+2]=Math.round(clamp(c.b,0,1)*255);d[o+3]=255;}
 const t=new T.DataTexture(d,N,N,T.RGBAFormat);t.magFilter=t.minFilter=T.LinearFilter;t.wrapS=t.wrapT=T.ClampToEdgeWrapping;t.needsUpdate=true;return t;};
// THE CROSS-FADE HOOK (for the kit workstream's dithered LOD cross-fade). BIO.FADE, null by default, may be set BEFORE the
// kits build to {uniforms:{}, vertexPars, vertex, fragmentPars, fragment} (GLSL strings) or to a function(sh, kind): it is
// put into every leaf, bark ('bark', 'gloss', 'irid'), far, hang and solid material this file makes: the pars after
// <common>, the vertex code before <fog_vertex> (mvPosition, transformed and the instance matrix are in scope), the
// fragment code after <clipping_planes_fragment> (the top of main(): a dither discard goes here). Null: no shader changes.
if(BIO.FADE===undefined)BIO.FADE=null;
BIO._fx=function(){return (BIO.GUST?'|gust':'')+(BIO.FADE?'|fade':'');};   /* what the page-wide switches add to a program key */
BIO._fadeInject=function(sh,kind){const F=BIO.FADE;if(!F)return;if(typeof F==='function'){F(sh,kind);return;}
 if(F.uniforms)Object.assign(sh.uniforms,F.uniforms);
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+(F.vertexPars||'')).replace('#include <fog_vertex>',(F.vertex||'')+'\n#include <fog_vertex>');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+(F.fragmentPars||'')).replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\n'+(F.fragment||''));};

// ---------------------------------------------------------------- alpha textures
// draw(g,S) paints GREYSCALE leaves on a transparent canvas; the material's
// per-instance colour tints them. fillRGB fills the transparent texels.
BIO.alphaTex=function(S,draw,fillRGB){const T=BIO.host.THREE;
 /* willReadFrequently: a canvas read back whole is kept in CPU memory, so getImageData copies instead of stalling on the GPU for every card (the
    valley's 2026-11-10 profile: 52 cards, about 1 s each; the owner, "the station pages really seem to take forever to load") */
 const c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d',{willReadFrequently:true});g.clearRect(0,0,S,S);draw(g,S);
 const d=g.getImageData(0,0,S,S).data,out=new Uint8Array(S*S*4);
 for(let o=0;o<out.length;o+=4){const a=d[o+3];
  if(a<48){out[o]=fillRGB[0];out[o+1]=fillRGB[1];out[o+2]=fillRGB[2];}else{out[o]=d[o];out[o+1]=d[o+1];out[o+2]=d[o+2];}
  out[o+3]=a;}
 const t=new T.DataTexture(out,S,S,T.RGBAFormat);
 t.encoding=T.sRGBEncoding;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;
 t.anisotropy=4;t.needsUpdate=true;t.wrapS=t.wrapT=T.RepeatWrapping;return t;};
// a COLOUR canvas texture (bark, ground), repeat-wrapped
BIO.canvasTex=function(w,h,fn,rep){const T=BIO.host.THREE;const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;t.encoding=T.sRGBEncoding;if(rep)t.repeat.set(rep,rep);return t;};
// drawing helpers for leaf textures
BIO.tex={
 grey(l){l=clamp(Math.round(l),0,255);return'rgb('+l+','+l+','+l+')';},
 leaf(g,x,y,len,wid,ang,lum,rib){g.save();g.translate(x,y);g.rotate(ang);
  g.fillStyle=BIO.tex.grey(lum);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.45,wid,len,0);g.quadraticCurveTo(len*.45,-wid,0,0);g.fill();
  if(rib){g.strokeStyle=BIO.tex.grey(lum*.72);g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(len*.92,0);g.stroke();}
  g.restore();},
 cl:[],
 clusters(S,n,k){BIO.tex.cl=[];for(let i=0;i<n;i++){const a=i/n*TAU+rr(-.3,.3),r=S*.5*k*(i%3===0?rr(0,.35):rr(.55,1));BIO.tex.cl.push([S/2+Math.cos(a)*r,S/2+Math.sin(a)*r]);}},
 clPt(S,sd,lim){const c=pick(BIO.tex.cl),a=rr(0,TAU),r=sd*S*Math.sqrt(-2*Math.log(1-rng()*.98))*.6;
  let x=c[0]+Math.cos(a)*r,y=c[1]+Math.sin(a)*r;const d=Math.hypot(x-S/2,y-S/2),m=S*.5*lim;if(d>m){x=S/2+(x-S/2)*m/d;y=S/2+(y-S/2)*m/d;}
  return[x,y,Math.atan2(y-c[1],x-c[0])];},
 discPt(S,k){const a=rr(0,TAU),r=S*.5*k*Math.sqrt(rng());return[S/2+Math.cos(a)*r,S/2+Math.sin(a)*r,a];}
};

// ---------------------------------------------------------------- card geometries
BIO.geo={};
// leaf clump: a tripod of three tilted unit quads
// o.stem (31b-core-leafset.js): a SPRAY held by its stem instead: the cards fan out from the origin along +y, the stem
// point of the texture at the origin, so BIO.leafOn can hang it from a twig. No option: the tripod, as always.
BIO.geo.clump=function(o){if(o&&o.stem&&BIO.geo.spray)return BIO.geo.spray(o);const T=BIO.host.THREE,pos=[],uv=[],nor=[];
 for(let k=0;k<3;k++){const az=k/3*TAU+.3,tilt=.92,ca=Math.cos(az),sa=Math.sin(az);
  const n=[Math.sin(tilt)*ca,Math.cos(tilt),Math.sin(tilt)*sa],u=[-sa,0,ca],v=[-Math.cos(tilt)*ca,Math.sin(tilt),-Math.cos(tilt)*sa];
  const c=[n[0]*.10,n[1]*.10-.04,n[2]*.10];
  const P=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].map(q=>[c[0]+u[0]*q[0]+v[0]*q[1],c[1]+u[1]*q[0]+v[1]*q[1],c[2]+u[2]*q[0]+v[2]*q[1],q[0]+.5,q[1]+.5]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(n[0],n[1],n[2]);});}
 const g=BIO.geo._make(pos,nor,uv);g.userData.card={base:'top',kind:'clump'};return g;};   /* v 0 at each quad's low edge (a slot's stems replace the tripod: 20-core-kit.js): a library plant with a base is turned upright (20-core-kit.js, BIO.def) */
// BIO.geo.stemClump(stems, {rise, len}) -> geometry: a crown's three sprigs held by their stems at the origin (20-core-kit.js,
// "A CROWN'S SPRIGS HELD BY THEIR STEMS"): each card runs out and up from the origin along its sprig's stem-tip axis, cut to
// the sprig's oriented box clipped to its cell
function clipRect(P,c){const edges=[[0,c[0],1],[0,c[2],-1],[1,c[1],1],[1,c[3],-1]];
 for(const [ax,v,sg] of edges){const out=[];for(let i=0;i<P.length;i++){const A=P[i],B=P[(i+1)%P.length],ia=(A[ax]-v)*sg>=0,ib=(B[ax]-v)*sg>=0;
   if(ia)out.push(A);if(ia!==ib){const t=(v-A[ax])/(B[ax]-A[ax]);out.push([A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t]);}}P=out;if(!P.length)break;}
 return P;}
BIO.geo.stemClump=function(S,o){o=o||{};const pos=[],uv=[],nor=[],e=o.rise==null?.65:+o.rise,ce=Math.cos(e),se=Math.sin(e),LEN=o.len==null?.85:+o.len;
 for(let k=0;k<3;k++){const P=S[k%S.length],az=k/3*Math.PI*2+.3,ca=Math.cos(az),sa=Math.sin(az),d=[ce*ca,se,ce*sa],t=[-sa,0,ca],n=[-ca*se,ce,-sa*se];
  const s=P.stem,ax=[P.tip[0]-s[0],P.tip[1]-s[1]],L=Math.hypot(ax[0],ax[1])||1,e1=[ax[0]/L,ax[1]/L],e2=[-e1[1],e1[0]],w=P.w||[-L*.3,L*.3],
  bk=-(P.back||0),box=[[bk,w[0]],[L,w[0]],[L,w[1]],[bk,w[1]]].map(q=>[s[0]+e1[0]*q[0]+e2[0]*q[1],s[1]+e1[1]*q[0]+e2[1]*q[1]]),poly=clipRect(box,P.cell||[0,0,1,1]),kk=LEN/(L-bk);
  const loc=poly.map(p=>{const dx=p[0]-s[0],dy=p[1]-s[1];return[(dx*e2[0]+dy*e2[1])*kk,(dx*e1[0]+dy*e1[1])*kk];});
  for(let i=1;i+1<poly.length;i++)[0,i,i+1].forEach(j=>{const x=loc[j][0],y=loc[j][1];
   pos.push(t[0]*x+d[0]*y,t[1]*x+d[1]*y,t[2]*x+d[2]*y);uv.push(poly[j][0],poly[j][1]);nor.push(n[0],n[1],n[2]);});}
 return BIO.geo._make(pos,nor,uv);};
BIO.geo._make=function(pos,nor,uv,col){const T=BIO.host.THREE,g=new T.BufferGeometry();
 g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
 if(col)g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g;};
// BIO.geo.cells(geo, o) -> geo: a card SHEET (n x n plants, o.n 3) drawn a plant a quad. Each quad of a card geometry (its
// triangles in pairs, as clump, spray and leafCard write them) takes its own cell of the sheet in its uv, o.pick[q % length]
// (cells counted from the sheet's top left, row by row; default 0, 4, 8: the diagonal), inset by o.inset (.01) of the sheet,
// and shrinks by o.scale (.6) about its own centre (o.about 'quad', the tripod clumps) or the origin ('origin': cards held by
// their stem). The material keeps the whole sheet (no texture cell): the owner, 2026-10-26, saw crown cards drawing all nine
// sprigs of a sheet as a grid; one cell a card made each sprig three times too large, three cells at .6 keeps the card's cover.
// The uv is the unflipped library convention (v down the sheet, as BIO.libSwap's cells); o.flipY for a CanvasTexture.
// o.rects (2026-10-27, opt-in): the cells as boxes of the sheet, [[u0, v0, u1, v1], ...] in the same convention (v down), for a
// sheet whose plants are not on an even grid (the Rift's croton: three leaves 3 across at uneven widths); o.pick then indexes
// the boxes (default each in turn). With rects, o.aspect (default true) narrows or widens each quad across its own u to its box's
// width over height, so a tall leaf is not stretched square. Without rects, everything is as before.
BIO.geo.cells=function(geo,o){o=o||{};const R=o.rects||null,n=o.n==null?3:o.n,pick=o.pick||(R?R.map((r,i)=>i):[0,Math.floor(n*n/2),n*n-1]),sc=o.scale==null?.6:o.scale,ins=o.inset==null?.01:o.inset,
 g=geo.index?geo.toNonIndexed():geo,P=g.attributes.position.array,U=g.attributes.uv.array,nq=Math.floor(P.length/18),asp=R&&o.aspect!==false;
 for(let q=0;q<nq;q++){const c=pick[q%pick.length],cx=c%n,cy=Math.floor(c/n),o0=q*18;let mx=0,my=0,mz=0;
  const r=R?R[c]:null,x0=r?r[0]:cx/n,y0=r?r[1]:cy/n,cw=r?r[2]-r[0]:1/n,ch=r?r[3]-r[1]:1/n,iu=r?ins*cw*n:ins,iv=r?ins*ch*n:ins;
  if(o.about!=='origin'){for(let v=0;v<6;v++){mx+=P[o0+v*3];my+=P[o0+v*3+1];mz+=P[o0+v*3+2];}mx/=6;my/=6;mz/=6;}
  /* the quad's own u axis (position per unit u), from two of its corners on one v: to set its width to the box's aspect */
  let eu=null;if(asp){for(let a=0;a<6&&!eu;a++)for(let b=0;b<6;b++){const du=U[q*12+b*2]-U[q*12+a*2];if(Math.abs(U[q*12+b*2+1]-U[q*12+a*2+1])<1e-9&&Math.abs(du)>1e-6){
   eu=[(P[o0+b*3]-P[o0+a*3])/du,(P[o0+b*3+1]-P[o0+a*3+1])/du,(P[o0+b*3+2]-P[o0+a*3+2])/du];break;}}}
  const ka=asp&&eu?cw/ch-1:0;
  for(let v=0;v<6;v++){const i=o0+v*3,j=q*12+v*2,u=U[j];
   if(ka){const t=(u-.5)*ka;P[i]+=eu[0]*t;P[i+1]+=eu[1]*t;P[i+2]+=eu[2]*t;}
   P[i]=mx+(P[i]-mx)*sc;P[i+1]=my+(P[i+1]-my)*sc;P[i+2]=mz+(P[i+2]-mz)*sc;
   const w=o.flipY?1-U[j+1]:U[j+1],a=x0+iu+u*(cw-2*iu),b=y0+iv+w*(ch-2*iv);U[j]=a;U[j+1]=o.flipY?1-b:b;}}
 g.attributes.position.needsUpdate=true;g.attributes.uv.needsUpdate=true;
 g.userData.card=g.userData.card&&g.userData.card.kind==='clump'?{kind:'clump'}:null;g.userData.cells=true;return g;};   /* its uv are cells of a sheet now: never turned (a clump's slot may still hold its sprigs by their stems) */
// hanging raceme / strand: two crossed quads, local y 0 (hung) .. -1
BIO.geo.hang=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2+.4),sa=Math.sin(k*Math.PI/2+.4);
  const P=[[-.5,0],[.5,0],[.5,-1],[-.5,-1]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,-q[1]]);
  [0,2,1,0,3,2].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 const g=BIO.geo._make(pos,nor,uv);g.userData.card={base:'top'};return g;};
// a hanging RIBBON: origin at the top, running down to y=-1 in nseg tapering
// quads, drifting in z so a curtain of them is not a plank; texture repeats
// once per segment so a long one reads as a chain of leaves (a library plant with a base spans it once: userData.card.once)
BIO.geo.ribbon=function(nseg,taper,drift){const pos=[],uv=[],nor=[],once=[];nseg=nseg||4;taper=taper==null?.55:taper;drift=drift==null?.18:drift;
 const P=[];for(let i=0;i<=nseg;i++){const t=i/nseg,w=.5*lerp(1,taper,t),z=Math.sin(t*3.1)*drift;P.push([-w,-t,z],[w,-t,z]);}
 for(let i=0;i<nseg;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
  [[a,0,0],[c,0,1],[b,1,0],[b,1,0],[c,0,1],[d,1,1]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,0,1);once.push(q[1],(i+q[2])/nseg);});}
 const g=BIO.geo._make(pos,nor,uv);g.userData.card={base:'top',once:new Float32Array(once)};return g;};
// an arching FROND: pinned at the origin, arching along +x to x=1 and down; u across, the texture once a segment down v (a
// library plant with a base spans the whole frond once from its stem at v 0: userData.card)
BIO.geo.frond=function(nseg){const pos=[],uv=[],nor=[],once=[];nseg=nseg||3;
 const P=[];for(let i=0;i<=nseg;i++){const t=i/nseg,w=.16*Math.sin(t*Math.PI)*.9+.02,y=.32*Math.sin(t*2.2)-.22*t*t;P.push([t,y,-w],[t,y,w]);}
 for(let i=0;i<nseg;i++){const a=P[2*i],b=P[2*i+1],c=P[2*i+2],d=P[2*i+3];
  [[a,0,0],[b,1,0],[c,0,1],[b,1,0],[d,1,1],[c,0,1]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,1,0);once.push(q[1],(i+q[2])/nseg);});}
 const g=BIO.geo._make(pos,nor,uv);g.userData.card={base:'top',once:new Float32Array(once)};return g;};
// a MOSS MAT: a fan of quads in the xz plane, front face UP (winding matters:
// the Hexahedron lost 18k of these to a reversed fan). Flip pi about x for a soffit.
BIO.geo.mat=function(){const pos=[],uv=[],nor=[];const N=7;
 for(let s=0;s<N;s++){const a0=s/N*TAU,a1=(s+1)/N*TAU,r0=rr(.7,1),r1=rr(.7,1);
  const A=[0,0,0],B=[Math.cos(a0)*r0,rr(0,.08),Math.sin(a0)*r0],C=[Math.cos(a1)*r1,rr(0,.08),Math.sin(a1)*r1];
  [[A,.5,.5],[C,.5+C[0]*.5,.5+C[2]*.5],[B,.5+B[0]*.5,.5+B[2]*.5]].forEach(q=>{pos.push(q[0][0],q[0][1],q[0][2]);uv.push(q[1],q[2]);nor.push(0,1,0);});}
 return BIO.geo._make(pos,nor,uv);};
// a BUSH LOBE: a squat 6-sided dome, origin at the ground
BIO.geo.lobe=function(){const T=BIO.host.THREE;const g=new T.SphereGeometry(1,7,4,0,TAU,0,Math.PI*.55);g.scale(1,.8,1);return g;};
// a BLOOM: a diamond of two quads, origin at the centre
BIO.geo.bloom=function(){const pos=[],uv=[],nor=[];
 for(let k=0;k<2;k++){const ca=Math.cos(k*Math.PI/2),sa=Math.sin(k*Math.PI/2);
  const P=[[-.5,0],[0,.5],[.5,0],[0,-.5]].map(q=>[ca*q[0],q[1],sa*q[0],q[0]+.5,q[1]+.5]);
  [0,1,2,0,2,3].forEach(i=>{pos.push(P[i][0],P[i][1],P[i][2]);uv.push(P[i][3],P[i][4]);nor.push(-sa,0,ca);});}
 return BIO.geo._make(pos,nor,uv);};
// a POD on its stalk: local y 0 (hung) .. -1, vertex-coloured (stalk dark, pod white)
BIO.geo.pod=function(){const T=BIO.host.THREE;
 const parts=[[new T.CylinderGeometry(.012,.012,.5,3,1,true).translate(0,-.25,0),.16],[new T.SphereGeometry(.15,6,4).scale(1,1.75,1).translate(0,-.735,0),1]];
 const pos=[],nor=[],col=[],uv=[];
 parts.forEach(p=>{const g=p[0].toNonIndexed(),a=g.attributes.position.array,b=g.attributes.normal.array,u=g.attributes.uv.array;
  for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(b[i],b[i+1],b[i+2]);
   const sh=p[1]===1?(.78+.22*Math.sin(Math.atan2(a[i+2],a[i])*5))*lerp(.72,1,clamp((a[i+1]+1)/.5,0,1)):p[1];col.push(sh,sh,sh);}
  for(let j=0;j<u.length;j++)uv.push(u[j]);});
 return BIO.geo._make(pos,nor,uv,col);};
// a unit cylinder along y, centred (for BIO.beam)
BIO.geo.rod=function(n){const T=BIO.host.THREE;return new T.CylinderGeometry(.5,.5,1,n||7);};
// a tapering trunk from y=0 up to y=1
BIO.geo.trunk=function(n){const T=BIO.host.THREE;return new T.CylinderGeometry(.16,.4,1,n||8).translate(0,.5,0);};

// ---------------------------------------------------------------- the foliage hook
// o: { aN:bool, irid:bool, swayW:'glsl expr', swayA:0.2, axis:0|1, dist:bool }
//   swayW  weight of the displacement per vertex: '1.0' for a clump, '(-position.y)'
//          for something hung from y=0, '(position.x)' for a frond pinned at x=0
//   axis   which instanceMatrix column sets the amplitude (1 for a long thin hang)
// The page-wide switches (BIO.bindAtmosWind, BIO.setA2C, BIO.FADE) and the options below (spin, ground, backlit) add
// shader text only when on: with none of them the shaders are, character for character, the ones this hook always wrote.
//   spin    true or a uniform {value}: turn about the instance origin (BIO.SPIN, above)
//   ground  {k, gain, tip, fade}: the floor cover's root takes the ground's colour (BIO.setGround, above)
//   backlit 0..1, a leaf's thinness: the sun seen through it brightens it (DETAIL-RESEARCH item 6; nearer than ~450 m)
//   season  true or {drop, colour, k, stagger}: the dry season (BIO.SEASON, above) thins the cards, an instance at a time by
//           its hash and then stippled away, and turns the instance colour toward the dry colour (a grass's straw)
BIO.foliageHook=function(o){o=o||{};
 return function(sh){const mat=this&&this.isMaterial?this:null;
  const gs=BIO.GUST,sp=o.spin?(o.spin.value!==undefined?o.spin:BIO.SPIN):null,gt=o.ground?(o.ground===true?{}:o.ground):null,bl=o.backlit==null?0:+o.backlit;
  const sn=o.season?BIO._seasonOpt(o.season):null;
  const a2c=!!(mat&&mat.alphaToCoverage&&mat.userData.a2cCut!=null);
  sh.uniforms.uWindT=BIO.WIND.t;sh.uniforms.uWindV=BIO.WIND.v;sh.uniforms.uWindOn=BIO.WIND.on;
  if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);
  sh.uniforms.uSunDir=BIO.SUN;
  if(sp)sh.uniforms.uSpin=sp;
  if(gs){sh.uniforms.uGustT=gs.t;sh.uniforms.uAtmW=gs.w;sh.uniforms.uGustAmp=gs.amp;sh.uniforms.uGustK=gs.k;}
  if(gt){const T=BIO.host.THREE,f=gt.fade||[0,0];sh.uniforms.uGTex=BIO.GROUND.tex;sh.uniforms.uGBox=BIO.GROUND.box.value?BIO.GROUND.box:{value:new T.Vector4(0,0,1,1)};
   const on=!!BIO.GROUND.tex.value;   /* no ground bound (a page reading the kit in place): no tint and no fade, the card as it was */
   sh.uniforms.uGK={value:new T.Vector4(on?(gt.k==null?.85:+gt.k):0,gt.gain==null?1:+gt.gain,on?+f[0]:0,on?+f[1]:0)};}
  if(bl)sh.uniforms.uBacklit={value:bl};
  sh.uniforms.uSwayA={value:+(o.swayA==null?.06:+o.swayA).toFixed(3)};   /* B3: a uniform, at the literal's old rounding (the same pixels) */
  if(a2c)sh.uniforms.uA2Cut={value:mat.userData.a2cCut};
  const gin=['vec3 _gm = transformed;','#ifdef USE_INSTANCING','  _gm = instanceMatrix[3].xyz;','#endif','vec3 _gi = (modelMatrix * vec4(_gm, 1.0)).xyz;'];   /* an instance's root in the world (a merged bucket's: the vertex) */
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;\nuniform vec2 uWindV;\nuniform float uWindOn;\nuniform float uSwayA;\nvarying vec3 vFlWP;\nvarying float vFlD;\n'+
    (bl?'varying vec3 vFlBN;\n':'')+(o.aN?'attribute vec3 aN;\nvarying vec3 vFlN;\n':'')+(o.irid?'attribute vec3 aC2;\nvarying vec3 vFlC2;\n':'')+
    (sp?'uniform float uSpin;\n':'')+(gs?'uniform float uGustT;\nuniform vec2 uAtmW;\nuniform float uGustAmp;\nuniform float uGustK;\n'+gs.glsl+'\n':'')+
    (gt?'uniform sampler2D uGTex;\nuniform vec4 uGBox;\nuniform vec4 uGK;\nvarying vec4 vFlGT;\nvarying float vFlGF;\n':''))
   .replace('#include <project_vertex>',[
    'vec4 mvPosition = vec4( transformed, 1.0 );',
    'float _sc = 1.0; float _ph = 0.0;',
    '#ifdef USE_INSTANCING',
    '  mvPosition = instanceMatrix * mvPosition;',
    '  _ph = dot(instanceMatrix[3].xyz, vec3(0.131,0.073,0.117));',
    '  _sc = length(instanceMatrix['+(o.axis||0)+'].xyz);',
    '#endif'].concat(gs||gt?gin:[],gt?[
    // the ground's colour at the root; past the band's end all ground, shrunk toward the root, dissolving
    '{ vec3 _gc = texture2D(uGTex, (_gi.xz - uGBox.xy) / (uGBox.zw - uGBox.xy)).rgb;'+(BIO.GROUND.linear?'':' _gc = pow(_gc, vec3(2.2));'),
    /* the eye from the view matrix (2026-10-27, found on the hyperjungle's savanna station): r128 uploads cameraPosition only to Phong,
       Toon, Standard, shader and env-mapped materials, so on these Lambert cards it read (0,0,0) and every ground-tinted card more
       than the fade's end from the world's origin dissolved into the ground, wherever the camera stood (as the LOD fade did, 20) */
    '  vec3 _geye = -vec3(dot(viewMatrix[0].xyz, viewMatrix[3].xyz), dot(viewMatrix[1].xyz, viewMatrix[3].xyz), dot(viewMatrix[2].xyz, viewMatrix[3].xyz));',
    '  float _gf = uGK.w > uGK.z ? smoothstep(uGK.z, uGK.w, distance(_gi, _geye)) : 0.0;',
    '  mvPosition.xyz = _gm + (mvPosition.xyz - _gm) * (1.0 - 0.6*_gf);',
    '  vFlGT = vec4(_gc * uGK.y, max(uGK.x * (1.0 - clamp('+(gt.tip||'position.y')+', 0.0, 1.0)), _gf)); vFlGF = _gf; }']:[],[
    'float _wg = '+(o.swayW||'1.0')+';',
    // the world's wind (uWindOn=1): the sway scales with its strength and the foliage leans downwind,
    // pulsing per instance; with no wind bound both terms are exactly x1 and +0
    'float _wk = mix(1.0, max(0.3, length(uWindV)), uWindOn);',
    'vec3 _lean = uWindOn * vec3(uWindV.x, 0.0, uWindV.y) * (0.9 + 0.6*sin(uWindT*0.45+_ph*2.1));'],gs?[
    // core/atmos's travelling gust at the root: the sway and the lean swell and ebb as the front passes (it replaces the pulse)
    '{ float _gk = 1.0 + uGustAmp * uGustK * atmGust(uGustT, _gi.xz, uAtmW); _wk *= _gk; _lean = uWindOn * vec3(uWindV.x, 0.0, uWindV.y) * _gk; }']:[],[
    'mvPosition.xyz += _wg * _sc * (vec3(',
    '   sin(uWindT*0.9+_ph) + 0.45*sin(uWindT*2.3+_ph*1.7+position.x*5.0),',
    '   0.40*sin(uWindT*1.6+_ph*0.6+position.z*5.0),',
    '   cos(uWindT*0.7+_ph*1.3) + 0.45*sin(uWindT*2.9+_ph+position.y*5.0) ) * _wk + _lean) * uSwayA;',
    'vFlWP = (modelMatrix * mvPosition).xyz;',
    /* B1: the leaf's normal in the world for the back-light's gate (vFlBN): the clump's own (aN), else the card's lighting normal */
    o.aN?'vFlN = aN;':'',(o.irid?'vFlC2 = aC2;':'')+(bl?(o.aN?'vFlBN = aN;':'vFlBN = inverseTransformDirection(transformedNormal, viewMatrix);'):''),
    'mvPosition = modelViewMatrix * mvPosition;',
    'vFlD = -mvPosition.z;',
    'gl_Position = projectionMatrix * mvPosition;']).join('\n'));
  // the lighting normal: the clump's own (aN, world space, so it shades as a
  // lit mass), or the card normal bent toward world-up for anything without one
  if(o.aN)sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','vec3 transformedNormal = normalize(normalMatrix * aN);');
  else sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>','#include <defaultnormal_vertex>\n'+
   '{vec3 _up=normalize(normalMatrix*vec3(0.0,1.0,0.0)); transformedNormal=normalize(mix(normalize(transformedNormal),_up,0.45));}');
  sh.fragmentShader=sh.fragmentShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;\nuniform vec3 uSunDir;\nvarying vec3 vFlWP;\nvarying float vFlD;\n'+
    (o.aN?'varying vec3 vFlN;\n':'')+(o.irid?'varying vec3 vFlC2;\n':''))
   .replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.a *= 1.0 + clamp(vFlD/650.0, 0.0, 1.1);')
   .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;','reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
   .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;','reflectedLight.directDiffuse = vLightFront + 0.30*vLightBack;');
  // IRIDESCENCE (prism gum): green facing the sun, the second colour away from
  // it and at grazing view angles, shimmering slowly in the wind
  if(o.irid)sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',[
   '#include <color_fragment>',
   '{ vec3 _V = normalize((-(viewMatrix[3].xyz*mat3(viewMatrix))) - vFlWP); vec3 _N = normalize('+(o.aN?'vFlN':'vec3(0.0,1.0,0.0)')+');',
   '  float _fr = 1.0 - abs(dot(_N,_V));',
   '  float _sf = dot(_N, uSunDir)*0.5 + 0.5;',
   '  float _sh = 0.16*sin(uWindT*0.8 + dot(vFlWP, vec3(0.045,0.083,0.037))) + 0.08*sin(uWindT*1.9 + dot(vFlWP, vec3(-0.21,0.13,0.17)));',
   '  float _k = smoothstep(0.22, 0.78, _sf*1.15 - _fr*0.80 + 0.30 + _sh);',
   '  diffuseColor.rgb *= mix(vFlC2, vColor, _k) / max(vColor, vec3(0.004)); }'].join('\n'));
  // THE SPIN: about the instance's own origin and up axis, before its matrix (normals turned with it)
  if(sp)sh.vertexShader=sh.vertexShader
   .replace('#include <beginnormal_vertex>',['#include <beginnormal_vertex>','float _spA = 0.0;','#ifdef USE_INSTANCING','  _spA = dot(instanceMatrix[3].xyz, vec3(0.173,0.091,0.137));','#endif',
    'float _spT = uSpin*(0.8+0.4*fract(_spA*3.7)) + _spA*6.2831; float _spc = cos(_spT), _sps = sin(_spT);',
    'objectNormal.xz = vec2(objectNormal.x*_spc - objectNormal.z*_sps, objectNormal.x*_sps + objectNormal.z*_spc);'].join('\n'))
   .replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.xz = vec2(transformed.x*_spc - transformed.z*_sps, transformed.x*_sps + transformed.z*_spc);');
  if(gt||bl||a2c)sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+
   (gt?'varying vec4 vFlGT;\nvarying float vFlGF;\n':'')+(bl?'uniform float uBacklit;\nvarying vec3 vFlBN;\n':'')+(a2c?'uniform float uA2Cut;\n':''));
  // THE GROUND AT THE ROOT: the species' tint gives way to the ground's colour toward the root and past the band
  if(gt)sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>','#ifdef USE_COLOR',
   ' diffuseColor.rgb *= mix(vec3(1.0), vFlGT.rgb / max(vColor, vec3(0.004)), vFlGT.a);','#else',' diffuseColor.rgb *= mix(vec3(1.0), vFlGT.rgb, vFlGT.a);','#endif',
   ' diffuseColor.a *= 1.0 - vFlGF;'].join('\n'));
  // THE SEASON: the instance's hash (its root; a merged bucket's, its 3 m cell) staggers its dryness about the page's. The
  // colour gives way to the dry colour (vColor replaced, or a multiplier without colours); the cards go when the page's dry
  // passes the hash (instance by instance, the lowest first), stippled in 12 cm cells of the unswayed card so they thin, not
  // pop. After the ground tint and before the alpha test; at BIO.SEASON 0 both terms are exactly x1 and keep
  if(sn){const T=BIO.host.THREE,c=sn.colour!=null?new T.Color(sn.colour).convertSRGBToLinear():null;
   sh.uniforms.uSeasonDry=BIO.SEASON;sh.uniforms.uSnK={value:new T.Vector4(sn.drop,c?sn.k:0,sn.stagger,0)};if(c)sh.uniforms.uSnC={value:new T.Vector3(c.r,c.g,c.b)};
   const dec='uniform float uSeasonDry;\nuniform vec4 uSnK;\nvarying vec3 vSnP;\nvarying float vSnH;\n'+BIO.GLSL_SEASON_HASH+'\n';
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\n'+dec)
    .replace('vFlWP = (modelMatrix * mvPosition).xyz;',['vFlWP = (modelMatrix * mvPosition).xyz;','vSnP = position;','#ifdef USE_INSTANCING','  vSnH = bioSnHash(instanceMatrix[3].xyz);','#else','  vSnH = -1.0;','#endif'].join('\n'));
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+dec+(c?'uniform vec3 uSnC;\n':''))
    .replace('#include <alphamap_fragment>',['{ float _snH = vSnH < 0.0 ? bioSnHash(floor(vSnP / 3.0)) : vSnH;'].concat(c?[
     '  float _snD = clamp(uSeasonDry * (1.0 + uSnK.z * (2.0*_snH - 1.0)), 0.0, 1.0) * uSnK.y;','  vec3 _snC = uSnC * (0.88 + 0.24*_snH);','#ifdef USE_COLOR',
     '  diffuseColor.rgb *= mix(vec3(1.0), _snC / max(vColor, vec3(0.004)), _snD);','#else','  diffuseColor.rgb *= mix(vec3(1.0), _snC, _snD);','#endif']:[],sn.drop>0?[
     '  float _snF = clamp((uSeasonDry * uSnK.x * 1.15 - _snH) / 0.15, 0.0, 1.0);',
     '  if (_snF > 0.0 && bioSnHash(floor(vSnP * 8.0) + _snH * 17.0) < _snF) discard;']:[],['}','#include <alphamap_fragment>']).join('\n'));}
  // ALPHA-TO-COVERAGE: the alpha sharpened to one pixel's width about the old cut-off (the coverage mask does the rest)
  if(a2c)sh.fragmentShader=sh.fragmentShader.replace('#include <alphatest_fragment>',
   'diffuseColor.a = clamp((diffuseColor.a - uA2Cut) / max(fwidth(diffuseColor.a), 0.0001) + 0.5, 0.0, 1.0);\n#include <alphatest_fragment>');
  // THE BACK-LIGHT: the sun behind a leaf, seen through it (thin leaves glow), fading out by ~450 m. B1 (GRAPHICS-TERRAIN-PROPOSAL
  // 12d, 2026-11-23): gated by the leaf's normal, so only a leaf whose face toward the eye is turned from the sun glows (a card
  // edge-on to it, the rim, a little); a face that sees the sun is lit from the front and does not. The normal: the clump's own
  // (aN), else the card's, turned to the face drawn. Godot: the same gate on BACKLIGHT (foliage.gdshader, fol_back_gate)
  if(bl)sh.fragmentShader=sh.fragmentShader.replace('#include <envmap_fragment>',['#ifdef DOUBLE_SIDED',
   '{ vec3 _bV = normalize(vFlWP - (-(viewMatrix[3].xyz*mat3(viewMatrix)))); float _bk = pow(max(dot(_bV, uSunDir), 0.0), 6.0) * (1.0 - smoothstep(150.0, 450.0, vFlD));',
   '  vec3 _bN = normalize(vFlBN);'+(o.aN?'':' if (!gl_FrontFacing) _bN = -_bN;')+' float _bd = dot(_bN, uSunDir);',
   '  _bk *= clamp(-_bd * 0.65 + 0.35 * (1.0 - abs(_bd)), 0.0, 1.0);',
   '  outgoingLight += uBacklit * _bk * diffuseColor.rgb * (vLightFront + vLightBack); }','#endif','#include <envmap_fragment>'].join('\n'));
  BIO._fadeInject(sh,'leaf');
 };};
// THE PROGRAM KEY (B3 = TODO T31, GRAPHICS-TERRAIN-PROPOSAL 12d, 2026-11-23). three r128 shares a program between materials whose
// keys match and builds it from the first one's hook, so a key must name everything that changes the shader's text. It named the
// kit and the material (one program each: 50-90 on a biome page); the numbers that differed are now uniforms (uSwayA, uIridA/B),
// so the key names only what changes the text: the hook's switches (BIO._leafKey) and the page's (BIO._fx), and materials alike
// share one program (3-6 a page). The same pixels: a uniform holds the literal's value. A page that WRAPS a hooked material's
// onBeforeCompile (RIFT.iridOnlyN) changes its text without changing its key, so the hook is held behind an accessor: once
// anything else is assigned, that material keys as it did (`old`: its kit and name). KHOOK's layers sit over the accessor (its
// page slot) and add their own keys. BIO._hookKey(m, hook, key(t), old(t)) -> m; t is the material compiled (a clone handed this
// key: by its own hook).
BIO._hookKey=function(m,hook,key,old){let cur=hook,wrapped=false;
 const d=Object.getOwnPropertyDescriptor(m,'onBeforeCompile');
 if(d&&(d.get||d.set)){m.onBeforeCompile=hook;m.customProgramCacheKey=function(){return old(this&&this.isMaterial?this:m);};return m;}   /* a material already under KHOOK (hangMat's): as before */
 Object.defineProperty(m,'onBeforeCompile',{configurable:true,enumerable:true,get:function(){return cur;},set:function(v){if(v!==hook)wrapped=true;cur=v;}});
 m.customProgramCacheKey=function(){const t=this&&this.isMaterial?this:m;return (t===m?!wrapped:t.onBeforeCompile===hook)?key(t):old(t);};
 return m;};
BIO._leafKey=function(o,t){const gt=o.ground?(o.ground===true?{}:o.ground):null,sn=o.season?BIO._seasonOpt(o.season):null,bl=o.backlit==null?0:+o.backlit;
 return 'biofol'+(o.aN?'|aN':'')+(o.irid?'|irid':'')+(o.axis?'|ax'+o.axis:'')+'|w'+(o.swayW||'1.0')+(o.spin?'|spin':'')+
  (gt?'|gt'+(gt.tip||'')+(BIO.GROUND.linear?'|lin':''):'')+(bl?'|bl':'')+(sn?'|sn'+(sn.drop>0?'d':'')+(sn.colour!=null?'c':''):'')+
  (t.alphaToCoverage&&t.userData.a2cCut!=null?'|a2c':'')+BIO._fx();};
// a foliage MATERIAL: Lambert, alpha-tested, double-sided, hooked. Materials whose hooks write the same text share one program
// (the key above); a page that wraps the hook keys its material apart, as every material was before.
BIO.leafMat=function(tex,key,o){const T=BIO.host.THREE;o=o||{};
 const m=new T.MeshLambertMaterial({color:0xffffff,map:tex||null,alphaTest:o.alphaTest==null?.42:o.alphaTest,side:T.DoubleSide,vertexColors:!!o.vertexColors});
 const ck='biofol|'+BIO.kitKey(key);BIO._hookKey(m,BIO.foliageHook(o),t=>BIO._leafKey(o,t),t=>ck+BIO._fx()+(t.alphaToCoverage?'|a2c':''));
 m.userData.bio={kind:'leaf',key:BIO.kitKey(key),opts:o};   // what it is, as data (42-core-export)
 BIO._leafMats.push(m);if(BIO.A2C)BIO._a2cApply(m);
 BIO._tickWind();return m;};
// a BARK / WOOD material for merged buckets: Lambert, vertex-coloured, textured
BIO.barkMat=function(tex,col){const T=BIO.host.THREE,m=new T.MeshLambertMaterial({color:col==null?0xffffff:col,map:tex||null,vertexColors:true,side:T.DoubleSide});m.userData.bio={kind:'bark'};
 if(BIO.FADE){m.onBeforeCompile=sh=>BIO._fadeInject(sh,'bark');m.customProgramCacheKey=()=>'biobark'+BIO._fx();}   /* the cross-fade hook only: no hook otherwise */
 return m;};
// an IRIDESCENT BARK (the 'irid' kind): a bark whose colour shifts with the view angle and, slowly, with the wind:
// colA facing the eye, colB at grazing angles (default green to coppery red, the east abyss's sky scale-tree). The
// tints are baked into the shader text, so the program cache key carries the kit and the key (BIO.kitKey): each kit's
// materials keep their own tints whatever else the page loads. One definition for every kit (it was written in five:
// eastabyss, rift, nhighlands, shighlands, xanadu; the last one loaded won). Godot: bark.gdshader mode 1. B3 (2026-11-23): the
// tints are uniforms (uIridA, uIridB, at the literals' old rounding), so every irid bark shares one program (BIO._hookKey).
BIO.iridBarkMat=function(tex,key,colA,colB){const m=BIO.barkMat(tex),T=BIO.host.THREE;
 const A=colA==null?[0.78,1.18,0.92]:colA,B=colB==null?[1.45,0.82,0.74]:colB,v3=c=>new T.Vector3(+(+c[0]).toFixed(3),+(+c[1]).toFixed(3),+(+c[2]).toFixed(3));
 const hook=sh=>{sh.uniforms.uWindT=BIO.WIND.t;sh.uniforms.uIridA={value:v3(A)};sh.uniforms.uIridB={value:v3(B)};
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvIWP=(modelMatrix*vec4(transformed,1.0)).xyz;vIWN=normalize(mat3(modelMatrix)*objectNormal);');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;uniform vec3 uIridA,uIridB;varying vec3 vIWP;varying vec3 vIWN;')
   .replace('#include <color_fragment>','#include <color_fragment>\n{vec3 V=normalize((-(viewMatrix[3].xyz*mat3(viewMatrix)))-vIWP);vec3 N=normalize(vIWN);float fr=1.0-abs(dot(N,V));'+
    'float sh=0.5+0.5*sin(dot(vIWP,vec3(0.21,0.37,0.29))+uWindT*0.35);float k=smoothstep(0.12,0.82,fr*0.85+sh*0.3);'+
    'diffuseColor.rgb*=mix(uIridA,uIridB,k);}');BIO._fadeInject(sh,'irid');};
 m.userData.bio={kind:'irid',key:BIO.kitKey(key||'x'),opts:{a:A,b:B}};   // what it is, as data (42-core-export: a Godot shader of this kind)
 const ck='bioiridbark|'+BIO.kitKey(key||'x');BIO._hookKey(m,hook,()=>'bioiridbark'+BIO._fx(),()=>ck+BIO._fx());BIO._tickWind();return m;};
// a TWO-TONE GLOSS BARK (the 'gloss' kind; nwlowlands' and swlowlands' barkMat2, one copy since 2026-10-25): the map's red
// channel the bark's light (divided by its mean, tex.biomeMean), its green a mask blending the vertex colour toward o.alt
// (lenticels, peeling strips, a second bark), and a sun highlight of o.gloss on the unmasked part. o: {alt, gain (.52),
// gloss (0)}. m.barkLook is what a far impostor's trunk carries (swlowlands 55, buildFar). Godot: bark.gdshader mode 2.
// o.c2 (B3, per-species two-tone bark): the second colour is the bucket's per-vertex aC2 where a builder wrote one (a
// species' own underbark) and o.alt where it wrote none (aC2 0,0,0). It needs buckets that carry aC2 (BIO.C2_BUCKETS, set
// by core/biome 20-core-kit when its bucket store and bake write it); without them o.c2 is ignored and nothing changes.
BIO.glossBarkMat=function(tex,key,o){o=o||{};const T=BIO.host.THREE;
 const m=new T.MeshLambertMaterial({color:0xffffff,map:tex,vertexColors:true,side:T.DoubleSide});
 const alt=new T.Color(o.alt==null?0x808080:o.alt).convertSRGBToLinear(),gain=o.gain==null?.52:o.gain,c2=!!(o.c2&&BIO.C2_BUCKETS);
 const hook=sh=>{
  sh.uniforms.uAlt={value:alt};sh.uniforms.uMean={value:tex.biomeMean||.55};sh.uniforms.uGain={value:gain};sh.uniforms.uGloss={value:o.gloss||0};
  if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);sh.uniforms.uSunDir=BIO.SUN;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vBWP;varying vec3 vBWN;'+(c2?'attribute vec3 aC2;varying vec3 vBC2;':''))
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvBWP=(modelMatrix*vec4(transformed,1.0)).xyz;vBWN=normalize(mat3(modelMatrix)*objectNormal);'+(c2?'vBC2=aC2;':''));
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uAlt,uSunDir;uniform float uMean,uGain,uGloss;varying vec3 vBWP;varying vec3 vBWN;'+(c2?'varying vec3 vBC2;':''))
   .replace('#include <map_fragment>','vec4 _bt=texture2D(map,vUv);float _bl=_bt.r/uMean;float _bm=_bt.g;')
   .replace('#include <color_fragment>',c2?'vec3 _ba=dot(vBC2,vec3(1.0))>0.00001?vBC2:uAlt;diffuseColor.rgb*=mix(vColor,_ba,_bm)*_bl*uGain;':'diffuseColor.rgb*=mix(vColor,uAlt,_bm)*_bl*uGain;')
   .replace('#include <envmap_fragment>','{vec3 _V=normalize((-(viewMatrix[3].xyz*mat3(viewMatrix)))-vBWP);vec3 _N=normalize(vBWN);if(dot(_N,_V)<0.0)_N=-_N;vec3 _H=normalize(uSunDir+_V);'+
    'float _sp=pow(max(dot(_N,_H),0.0),26.0)*step(0.0,dot(_N,uSunDir));outgoingLight+=uGloss*_sp*vec3(1.0,0.93,0.8)*(1.0-_bm*0.8)*_bl;}\n#include <envmap_fragment>');BIO._fadeInject(sh,'gloss');};
 m.userData.bio={kind:'gloss',key:BIO.kitKey(key),opts:Object.assign({alt:[alt.r,alt.g,alt.b],mean:tex.biomeMean||.55,gain,gloss:o.gloss||0},c2?{c2:'aC2'}:{})};   // as data (42-core-export)
 const ck='biogloss|'+BIO.kitKey(key)+(c2?'|c2':'');BIO._hookKey(m,hook,()=>'biogloss'+(c2?'|c2':'')+BIO._fx(),()=>ck+BIO._fx());   /* B3: its numbers were uniforms already */
 m.barkLook={alt,gloss:o.gloss||0,mask:tex.maskMean||0};return m;};
// the FAR IMPOSTORS' material (the 'far' kind; rift's and swlowlands' farMat, one copy since 2026-10-25): vertex-coloured
// Lambert, with the trunks' look carried in the impostor's uv. o.rule:
//   'irid'  (rift): u a second colour (8 bits a channel on sqrt(linear) packed into one float, decoded per vertex), v 0
//           none, 1 the leaves' rule (the second colour away from the sun and at grazing angles), 2 the iridescent
//           bark's (the second colour at grazing angles), with a slow shimmer at the impostors' scale;
//   'gloss' (swlowlands): u the trunk's gloss (the bucket's, less the matte share of its mask; 0 on the blobs), the
//           gloss bark's sun highlight, so a glossy trunk shines the same either side of the switch.
BIO.farMat=function(o){o=o||{};const irid=o.rule==='irid',m=BIO.barkMat(null);
 const hook=irid?sh=>{sh.uniforms.uWindT=BIO.WIND.t;if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);sh.uniforms.uSunDir=BIO.SUN;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFP;varying vec3 vFN;varying vec3 vFC2;varying float vFM;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvFP=(modelMatrix*vec4(transformed,1.0)).xyz;vFN=normalize(mat3(modelMatrix)*objectNormal);vFM=uv.y;'+
    '{float p=uv.x;float r=floor(p*(1.0/65536.0));p-=r*65536.0;float g=floor(p*(1.0/256.0));float b=p-g*256.0;vFC2=vec3(r,g,b)*(1.0/255.0);vFC2*=vFC2;}');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float uWindT;uniform vec3 uSunDir;varying vec3 vFP;varying vec3 vFN;varying vec3 vFC2;varying float vFM;')
   .replace('#include <color_fragment>','#include <color_fragment>\nif(vFM>0.5){vec3 V=normalize((-(viewMatrix[3].xyz*mat3(viewMatrix)))-vFP);vec3 N=normalize(vFN);float fr=1.0-abs(dot(N,V));'+
    'float sh=0.12*sin(uWindT*0.5+dot(vFP,vec3(0.011,0.017,0.013)));float k;'+
    'if(vFM<1.5){float sf=dot(N,uSunDir)*0.5+0.5;k=1.0-smoothstep(0.22,0.78,sf*1.15-fr*0.80+0.30+sh);}'+
    'else k=smoothstep(0.12,0.82,fr*0.85+0.15+sh);'+
    'diffuseColor.rgb=mix(diffuseColor.rgb,vFC2,k);}');BIO._fadeInject(sh,'far');}
 :sh=>{if(!BIO.SUN.value)BIO.setSun([.45,.72,-.52]);sh.uniforms.uSunDir=BIO.SUN;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vFWP;varying vec3 vFWN;varying float vFGl;')
   .replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvFWP=(modelMatrix*vec4(transformed,1.0)).xyz;vFWN=normalize(mat3(modelMatrix)*objectNormal);vFGl=uv.x;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uSunDir;varying vec3 vFWP;varying vec3 vFWN;varying float vFGl;')
   .replace('#include <envmap_fragment>','if(vFGl>0.0){vec3 _V=normalize((-(viewMatrix[3].xyz*mat3(viewMatrix)))-vFWP);vec3 _N=normalize(vFWN);if(dot(_N,_V)<0.0)_N=-_N;vec3 _H=normalize(uSunDir+_V);'+
    'outgoingLight+=vFGl*pow(max(dot(_N,_H),0.0),26.0)*step(0.0,dot(_N,uSunDir))*vec3(1.0,0.93,0.8);}\n#include <envmap_fragment>');BIO._fadeInject(sh,'far');};
 const ck='biofar|'+(irid?'irid|':'gloss|')+BIO.kitKey('far');BIO._hookKey(m,hook,()=>'biofar|'+(irid?'irid':'gloss')+BIO._fx(),()=>ck+BIO._fx());   /* B3: no numbers in its text */
 m.userData.bio={kind:'far',key:BIO.kitKey('far'),opts:irid?{pack:'c2-rule',uv:'u: the second colour, 8 bits a channel on sqrt(linear); v: 0 none, 1 the leaf rule, 2 the irid bark rule'}
  :{pack:'gloss',uv:'u: the trunk gloss (0 on the blobs)'}};   // as data (42-core-export)
 if(irid)BIO._tickWind();return m;};
// a HANGING SWAY (the 'hang' kind; nhighlands' bulbs and pods, one copy since 2026-10-25) on an instanced material m: each
// instance swings on its thread, the offset growing with o.swayW (a GLSL expression, default the depth below the
// attachment, -position.y) times o.swayA (.05), its phase from where the instance stands. o.night (the emissive
// intensity by day and by night) is carried as data for a host that lights them. Returns m.
BIO.hangMat=function(m,key,o){o=o||{};const A=o.swayA==null?.05:+o.swayA,W=o.swayW||'(-position.y)',Ag=+A.toFixed(4);   /* B3: uHangA, at the old literal's rounding */
 const hook=sh=>{sh.uniforms.uWindT=BIO.WIND.t;sh.uniforms.uHangA={value:Ag};sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWindT;uniform float uHangA;')
  .replace('#include <begin_vertex>','#include <begin_vertex>\n#ifdef USE_INSTANCING\n{float ph=dot(instanceMatrix[3].xyz,vec3(.13,.07,.11));transformed.x+='+W+'*uHangA*sin(uWindT*1.1+ph);transformed.z+='+W+'*uHangA*cos(uWindT*.8+ph*1.3);}\n#endif');BIO._fadeInject(sh,'hang');};
 const ck='biohang|'+BIO.kitKey(key)+'|'+W+'|'+A;BIO._hookKey(m,hook,()=>'biohang|'+W+BIO._fx(),()=>ck+BIO._fx());
 m.userData.bio={kind:'hang',key:BIO.kitKey(key),opts:Object.assign({swayA:A,swayW:W},o.night?{night:o.night}:{})};BIO._tickWind();return m;};
// a plain material for instanced solids (rods, lobes, boulders)
BIO.solidMat=function(tex,col){const T=BIO.host.THREE,m=new T.MeshLambertMaterial({color:col==null?0xffffff:col,map:tex||null,side:T.DoubleSide});
 if(BIO.FADE){m.onBeforeCompile=sh=>BIO._fadeInject(sh,'solid');m.customProgramCacheKey=()=>'biosolid'+BIO._fx();}   /* the cross-fade hook only */
 return m;};

// ---------------------------------------------------------------- colour (sedesert-1)
// The sRGB-aware colour maths every biome ends up needing (the abyss kit's
// lesson): a designer's hex renders about twice as bright under the
// sun+hemisphere rig, and a tinted near-grey texture needs its mean divided out.
BIO.col=(function(){const T=()=>BIO.host.THREE,C=h=>new (T().Color)(h);let WHITE=null,DARK=null;
 // toward white (f>0) or toward a warm black (f<0)
 function shade(hex,f){const c=hex.isColor?hex.clone():C(hex);if(!WHITE){WHITE=C(0xffffff);DARK=C(0x120f0a);}if(f>=0)c.lerp(WHITE,f);else c.lerp(DARK,-f);return c;}
 // multiply in linear light, back to sRGB
 function bright(col,k){const c=col.isColor?col.clone():C(col);c.convertSRGBToLinear();c.r=Math.min(1,c.r*k);c.g=Math.min(1,c.g*k);c.b=Math.min(1,c.b*k);return c.convertLinearToSRGB();}
 const _hsl={h:0,s:0,l:0};
 // jitter hue / saturation / lightness by +-dh, +-ds, +-dl (three rng draws)
 function vary(hex,dh,ds,dl){const c=hex.isColor?hex.clone():C(hex);c.getHSL(_hsl);c.setHSL(((_hsl.h+rr(-dh,dh))%1+1)%1,clamp(_hsl.s+rr(-ds,ds),0,1),clamp(_hsl.l+rr(-dl,dl),.03,.97));return c;}
 // the linear mean of a canvas texture (sampled)
 function texMean(tex){const im=tex&&tex.image;if(!im||!im.getContext)return[.25,.25,.25];
  const d=im.getContext('2d').getImageData(0,0,im.width,im.height).data;let r=0,g=0,b=0,n=0;
  for(let i=0;i<d.length;i+=4*13){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
  const c=C(0).setRGB(r/n/255,g/n/255,b/n/255).convertSRGBToLinear();return[c.r,c.g,c.b];}
 // the sRGB tint that renders `hex` on a texture of linear mean m
 function tint(hex,m,k){const c=hex.isColor?hex.clone():C(hex);c.convertSRGBToLinear();k=k==null?1:k;
  c.setRGB(Math.min(1,c.r*k/Math.max(.02,m[0])),Math.min(1,c.g*k/Math.max(.02,m[1])),Math.min(1,c.b*k/Math.max(.02,m[2])));return c.convertLinearToSRGB();}
 return{shade,bright,vary,texMean,tint};})();

// ---------------------------------------------------------------- THE SWARD (B6)
// THE SWARD (B6, 2026-11-23; the owner on B1-B5's shots: "We should at least be implementing more realistic grass like oidong's
// new grass"). The web port of vertical-stack's Godot sward (godot/krator/world_grass.gd KratorWorldGrass, shaders/grass_sward
// .gdshader; STAGE-3-4-REPORT.md 2.3): a camera-centred instanced sward of curved 3D blade clumps on the ground as drawn.
//   near   0-34 m, a 0.44 m jittered grid, 12-blade clumps of three segments (5 triangles a blade)
//   mid    31-84 m, a 1.18 m grid, 6-blade clumps of two segments (3 triangles a blade)
//   plume  0-46 m, a 2.4 m grid, flowering stalks: a blade and a seed head of eight spikelets (geometry: no texture)
// WHERE: where the page already grows grass. Its grass items (leaf cards named or labelled grass, sedge, reed, tussock, turf,
// sward, meadow, fescue or themeda: BIO.SWARD_RE; BIO.def opt.sward true or false decides for an item) are counted into a
// 4 m grid at BIO.bake, and the sward's density is that grid's (bilinear, 1 - e^-1.5n). A page with no grass (a desert, the
// ice) grows none: that is the opt-out, and BIO.sward(false) or BIO.SWARD_AUTO = false the explicit one. A host with its own
// rule hands density(x, z) -> 0..1 in (core/world/86-world-floor.js does: its kits' floor weight). Then, per cell, the masks
// placement uses: BIO.mask (the host's water and footprints), BIO.cliffW (the cliff gate), BIO.clearOf (obstacles), under the
// local water (BIO.waterH) none, o.skip(x, z) (roads, towns), and a 12.5 m clumping patch.
// HOW: every cell is seeded from KRAND.hash(seed, ix, iz, salt) (never from a draw count); the cells are made in tiles (8 m
// near, 16 m mid and plume) cached as they are first seen, a few milliseconds' worth a frame, so moving costs only the new edge.
// Each instance sits on BIO.drawnH (the drawn ground when registered: KDRAWN; else terrainH) 2 cm deep, tilted half way to the
// ground's normal. The blades' tips take the page's grass colour (its grass items' instance colours times their card's mean,
// BIO.SWARD.palette), their roots the ground's (BIO.GROUND's texture in the vertex shader, as a ground-tinted card does), and
// sway in the page's wind (BIO.WIND). Rings fade in and out in the shader, so nothing pops. Off when the camera is 88 m over
// the ground or 2.2 m under it. Lambert, double-sided, receives shadows, casts none; userData.probeSkip (the probe and the
// audits leave it out). BUDGET: BIO.SWARD.maxTris (750 000) split 70/24/6 near/mid/plume, the nearest tiles kept first.
// BIO.sward(o) -> BIO.SWARD | false   o: {camera, ground(x,z), density(x,z), skip(x,z), tip [r,g,b] linear, seed [r,g,b],
//   root [r,g,b], maxTris, seed}; BIO.swardStats() -> {near, mid, plume, tris, tiles, ms}. Started at bake by itself (BIO._swardAuto)
//   on a page with grass and a camera (BIO.init's h.camera, else the page's global `camera`).
// Godot: KratorWorldGrass is the same sward on the stream (vertical-stack); this is its twin for the pages.
const SW={on:false,asked:false,o:{},grid:new Map(),gridN:0,defs:new Map(),palette:null,camera:null,meshes:[],layers:null,
 cache:new Map(),at:null,dirty:false,hidden:false,stats:{near:0,mid:0,plume:0,tris:0,tiles:0,ms:0},maxTris:750000};
BIO.SWARD=SW;BIO.SWARD_AUTO=true;BIO.SWARD_CELL=4;
BIO.SWARD_RE=/grass|sedge|reed|tussock|turf|sward|meadow|fescue|themeda/i;
BIO.SWARD_LAYERS=[
 {name:'near',r0:0,r1:34,step:.44,salt:7103,sc:1,blades:12,seg:3,h:.46,w:.035,spread:.24,tile:8,fade:[26,36],share:.70},
 {name:'mid',r0:31,r1:84,step:1.18,salt:7309,sc:1.15,blades:6,seg:2,h:.54,w:.052,spread:.34,tile:16,fade:[60,84],share:.24},
 {name:'plume',r0:1.5,r1:46,step:2.4,salt:7517,sc:1,plume:true,h:.72,w:.62,tile:16,fade:[34,46],share:.06}];
const _swK=(a,b)=>(a+1048576)*2097152+(b+1048576);
// an item is grass: its def says so (opt.sward), else a leaf card whose name or label reads as grass
BIO.swardGrass=function(name,def){if(!def)return false;if(def.sward!=null)return !!def.sward;
 const u=def.mat&&def.mat.userData,k=u&&u.bio&&u.bio.kind;return k==='leaf'&&(BIO.SWARD_RE.test(name)||BIO.SWARD_RE.test(def.label||''));};
// the grid: grass instances counted into BIO.SWARD_CELL cells, at each bake (20-core-kit.js calls it before it copies the stores)
BIO._swardBake=function(R){let n=0;for(const name of R.order){const def=R.defs[name],it=R.items[name];if(!it||!it.count||!BIO.swardGrass(name,def))continue;
  const C=BIO.SWARD_CELL,IM=it.m.a,IC=it.c.a;let s=SW.defs.get(def);if(!s){s={def,r:0,g:0,b:0,n:0};SW.defs.set(def,s);}
  for(let i=0;i<it.count;i++){const k=_swK(Math.floor(IM[i*16+12]/C),Math.floor(IM[i*16+14]/C));SW.grid.set(k,(SW.grid.get(k)||0)+1);
   s.r+=IC[i*3];s.g+=IC[i*3+1];s.b+=IC[i*3+2];s.n++;n++;}}
 if(n){SW.gridN+=n;SW.palette=null;SW.cache.clear();SW.dirty=true;}return n;};
BIO.swardDensity=function(x,z){if(SW.o.density)return SW.o.density(x,z);if(!SW.gridN)return 0;const C=BIO.SWARD_CELL,u=x/C-.5,v=z/C-.5,i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;
 const g=(a,b)=>SW.grid.get(_swK(a,b))||0,c=g(i,j)*(1-fu)*(1-fv)+g(i+1,j)*fu*(1-fv)+g(i,j+1)*(1-fu)*fv+g(i+1,j+1)*fu*fv;return 1-Math.exp(-1.5*c);};
// a texture's mean colour, linear, from its data (a DataTexture's, or the ImageData BIO.libSwap's fringe fill left): null while unknown
function _swTexMean(t){if(!t)return [1,1,1];if(t._swMean)return t._swMean;const im=t.image,d=im&&im.data;if(!d||!im.width)return null;let r=0,g=0,b=0,n=0;
 const st=Math.max(1,Math.floor(d.length/4/20000));for(let i=0;i<d.length;i+=4*st)if(d[i+3]>=48){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}
 if(!n)return null;const L=v=>Math.pow(v/n/255,2.2);return (t._swMean=[L(r),L(g),L(b)]);}
// the page's grass colour: each grass item's mean instance colour times its card's mean and its material's colour, weighted
// by its instances (with no instances, every grass def on the page once); null until a card's image is in
BIO.swardPalette=function(){if(SW.o.tip)return SW.o.tip;if(SW.palette)return SW.palette;let r=0,g=0,b=0,w=0,miss=false;
 const one=(def,ir,ig,ib,n)=>{const m=def.mat,tm=_swTexMean(m&&m.map);if(!tm){miss=true;return;}const c=m&&m.color?m.color:{r:1,g:1,b:1};
  r+=ir*tm[0]*c.r*n;g+=ig*tm[1]*c.g*n;b+=ib*tm[2]*c.b*n;w+=n;};
 if(SW.defs.size)for(const s of SW.defs.values())one(s.def,s.r/s.n,s.g/s.n,s.b/s.n,s.n);
 else for(const kn in BIO.kits){const R=BIO.kits[kn];for(const name of R.order)if(BIO.swardGrass(name,R.defs[name]))one(R.defs[name],1,1,1,1);}
 if(!w)return miss?null:[.19,.34,.085];const p=[r/w,g/w,b/w];if(!miss)SW.palette=p;return p;};
// THE GEOMETRY: a clump of n blades, each a ribbon of `seg` segments arching out (Godot's _build_clump_mesh, one segment more
// near); uv.y 0 at the root, 1 at the tip. The plume: a stalk blade and eight spikelets round its top third (uv.x 2: the seed)
BIO.swardClump=function(n,seg,H,W,R){const T=BIO.host.THREE,P=[],N=[],UV=[],I=[];
 for(let b=0;b<n;b++){const a=(b+.37*((b*5)%7))/n*TAU,ca=Math.cos(a),sa=Math.sin(a),sx=-sa,sz=ca;
  const r0=R*(.25+.75*((b*.618034)%1)),h=H*(.74+.52*((b*.381966+.21)%1)),arch=h*(.26+.24*((b*.754877)%1)),hw0=W*(.85+.30*(b&1));
  const v0=P.length/3,pt=t=>{const e=Math.pow(t,1.6);return [ca*(r0+arch*e),-.025+h*t,sa*(r0+arch*e)];};
  for(let s=0;s<seg;s++){const t=s/seg,p=pt(t),q=pt(t+.02),hw=hw0*(1-.42*t);let tx=q[0]-p[0],ty=q[1]-p[1],tz=q[2]-p[2];
   let nx=-sz*ty,ny=sz*tx-sx*tz,nz=sx*ty;const nl=Math.hypot(nx,ny,nz)||1;nx/=nl;ny/=nl;nz/=nl;if(ny<0){nx=-nx;ny=-ny;nz=-nz;}
   P.push(p[0]-sx*hw,p[1],p[2]-sz*hw,p[0]+sx*hw,p[1],p[2]+sz*hw);N.push(nx-sx*.2,ny,nz-sz*.2,nx+sx*.2,ny,nz+sz*.2);UV.push(0,t,1,t);}
  const tp=pt(1);P.push(tp[0],tp[1],tp[2]);N.push(0,1,0);UV.push(.5,1);
  for(let s=0;s<seg-1;s++){const k=v0+s*2;I.push(k,k+1,k+2,k+1,k+3,k+2);}const k=v0+(seg-1)*2;I.push(k,k+1,k+2);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(UV,2));g.setIndex(I);g.userData.tris=I.length/3;return g;};
BIO.swardPlume=function(H,W){const T=BIO.host.THREE,P=[],N=[],UV=[],I=[],hw=.012;
 P.push(-hw,-.03,0,hw,-.03,0,0,H,0);N.push(0,.3,1,0,.3,1,0,1,0);UV.push(0,0,1,0,.5,1);I.push(0,1,2);
 for(let k=0;k<8;k++){const a=k*2.39996,t=.62+.36*(k/7),y=H*t,l=W*.22*(1.1-t*.6),ox=Math.cos(a),oz=Math.sin(a),v=P.length/3;
  P.push(0,y-.02,0,ox*l*.25-oz*.012,y+l*.9,oz*l*.25+ox*.012,ox*l*.25+oz*.012,y+l*.9,oz*l*.25-ox*.012);N.push(ox,.5,oz,ox,.5,oz,ox,.5,oz);UV.push(2,t,2,t,2,t);I.push(v,v+1,v+2);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('normal',new T.Float32BufferAttribute(N,3));
 g.setAttribute('uv',new T.Float32BufferAttribute(UV,2));g.setIndex(I);g.userData.tris=I.length/3;return g;};
// a value-noise patch on KRAND (Godot's _gpatch: smooth between cell hashes, no sine)
function _swPatch(seed,x,z,cell,salt){const gx=x/cell,gz=z/cell,ix=Math.floor(gx),iz=Math.floor(gz);let fx=gx-ix,fz=gz-iz;fx=fx*fx*(3-2*fx);fz=fz*fz*(3-2*fz);
 const U=(a,b)=>KRAND.unit(KRAND.hash(seed,a,b,salt));return lerp(lerp(U(ix,iz),U(ix+1,iz),fx),lerp(U(ix,iz+1),U(ix+1,iz+1),fx),fz);}
// ONE TILE of a layer: plain records, the same whatever came before it ({n, m: matrices (16 a row), a: aSw (4 a row)})
BIO.swardTile=function(L,tx,tz){const S=L.step,seed=(SW.o.seed!=null?SW.o.seed:BIO.host.seed)|0,i0=Math.ceil(tx*L.tile/S),i1=Math.ceil((tx+1)*L.tile/S),j0=Math.ceil(tz*L.tile/S),j1=Math.ceil((tz+1)*L.tile/S);
 const M=[],A=[],H=KRAND.hash,U=KRAND.unit,gnd=SW.o.ground||((x,z)=>BIO.drawnH(x,z)),skip=SW.o.skip;
 for(let iz=j0;iz<j1;iz++)for(let ix=i0;ix<i1;ix++){const h=H(seed,ix,iz,L.salt),x=(ix+.12+.76*U(h))*S,z=(iz+.12+.76*U(H(seed,ix,iz,L.salt+11)))*S;
  let d=BIO.swardDensity(x,z);if(!(d>.01))continue;const pa=_swPatch(seed,x,z,12.5,L.salt+17);
  d*=L.plume?.42*smooth(.32,.78,pa):.72+.28*pa;if(U(H(seed,ix,iz,L.salt+23))>d)continue;
  if(skip&&skip(x,z))continue;if(BIO.mask(x,z)<=U(H(seed,ix,iz,L.salt+29)))continue;
  if(BIO.cliffW&&BIO.cliffW(x,z)<=U(H(seed,ix,iz,L.salt+31)))continue;if(BIO.clearOf&&!BIO.clearOf(x,z,.3))continue;
  const y=gnd(x,z);if(!isFinite(y)||BIO.waterH(x,z)>y+.05)continue;   /* 5 cm of standing water: under it (a shore at the sea's level is dry) */
  let nx=gnd(x-.5,z)-gnd(x+.5,z),nz=gnd(x,z-.5)-gnd(x,z+.5),ny=1;const nl=Math.hypot(nx,ny,nz);nx/=nl;ny/=nl;nz/=nl;
  let ux=nx*.48,uy=.52+ny*.48,uz=nz*.48;const ul=Math.hypot(ux,uy,uz);ux/=ul;uy/=ul;uz/=ul;
  const yaw=U(H(seed,ix,iz,L.salt+37))*TAU,fx=Math.sin(yaw),fz=Math.cos(yaw);
  let rx=uy*fz,ry=uz*fx-ux*fz,rz=-uy*fx;const rl=Math.hypot(rx,ry,rz)||1;rx/=rl;ry/=rl;rz/=rl;
  const bx=ry*uz-rz*uy,by=rz*ux-rx*uz,bz=rx*uy-ry*ux,sc=(.74+.58*U(H(seed,ix,iz,L.salt+43)))*L.sc*(.65+.45*pa);
  M.push(rx*sc,ry*sc,rz*sc,0,ux*sc,uy*sc,uz*sc,0,bx*sc,by*sc,bz*sc,0,x,y-.02,z,1);
  A.push(U(H(seed,ix,iz,L.salt+59)),U(H(seed,ix,iz,L.salt+61)),d,0);}
 return {n:A.length/4,m:new Float32Array(M),a:new Float32Array(A),x:(tx+.5)*L.tile,z:(tz+.5)*L.tile};};
// THE MATERIAL: Lambert, double-sided, hooked (one program a page: the key names only whether the ground's texture is bound)
function _swMat(){const T=BIO.host.THREE,m=new T.MeshLambertMaterial({color:0xffffff,side:T.DoubleSide});
 const U={uSwR:{value:new T.Vector4(0,26,36,0)},uSwTipA:{value:new T.Vector3(.17,.32,.08)},uSwTipB:{value:new T.Vector3(.24,.38,.10)},uSwRoot:{value:new T.Vector3(.09,.12,.05)},uSwSeed:{value:new T.Vector3(.62,.52,.26)}};
 m.userData.swU=U;m.userData.bio={kind:'sward'};
 const gtOn=()=>!!(BIO.GROUND&&BIO.GROUND.tex.value);
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);sh.uniforms.uWindT=BIO.WIND.t;sh.uniforms.uWindV=BIO.WIND.v;sh.uniforms.uWindOn=BIO.WIND.on;const gt=gtOn();
  if(gt){sh.uniforms.uGTex=BIO.GROUND.tex;sh.uniforms.uGBox=BIO.GROUND.box;sh.uniforms.uGPow={value:BIO.GROUND.linear?1:2.2};}
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uWindT;\nuniform vec2 uWindV;\nuniform float uWindOn;\nuniform vec4 uSwR;\n'+
    'uniform vec3 uSwTipA;\nuniform vec3 uSwTipB;\nuniform vec3 uSwRoot;\nuniform vec3 uSwSeed;\nattribute vec4 aSw;\nvarying vec3 vSwC;\n'+(gt?'uniform sampler2D uGTex;\nuniform vec4 uGBox;\nuniform float uGPow;\n':''))
   .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nobjectNormal = normalize(mix(vec3(0.0, 1.0, 0.0), objectNormal, 0.24 + 0.52 * clamp(uv.y, 0.0, 1.0)));')
   .replace('#include <project_vertex>',['vec3 _sw0 = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;',
    'vec3 _swE = -(viewMatrix[3].xyz * mat3(viewMatrix)); float _swD = distance(_sw0, _swE);',
    'float _swK = (uSwR.x > 0.0 ? smoothstep(uSwR.x - 1.5, uSwR.x + 1.5, _swD) : 1.0) * (1.0 - smoothstep(uSwR.y, uSwR.z, _swD));',
    'float _swH = clamp(uv.y, 0.0, 1.0);',
    'vec4 mvPosition = modelMatrix * instanceMatrix * vec4(transformed * _swK, 1.0);',
    'vec2 _swW = length(uWindV) > 0.001 ? normalize(uWindV) : vec2(0.85, 0.35);',
    'float _swP = dot(_sw0.xz, _swW) * 0.14 - uWindT * 2.15 + aSw.x * 6.2831853;',
    'float _swG = 0.55 + 0.45 * sin(dot(_sw0.xz, _swW) * 0.035 - uWindT * 0.85);',
    'float _swB = _swH * _swH * (sin(_swP) * 0.13 + 0.05 * sin(_swP * 2.3 + aSw.y * 5.0)) * (0.65 + 0.7 * _swG) * mix(1.0, max(0.3, length(uWindV)), uWindOn) * _swK;',
    'mvPosition.xz += _swW * _swB; mvPosition.y -= abs(_swB) * 0.22 * _swH;',
    gt?'vec3 _swR = pow(texture2D(uGTex, (_sw0.xz - uGBox.xy) / (uGBox.zw - uGBox.xy)).rgb, vec3(uGPow));':'vec3 _swR = uSwRoot;',   /* uGPow 2.2: sRGB to linear; 1: a linear ground */
    'vec3 _swT = mix(uSwTipA, uSwTipB, aSw.y); if (uv.x > 1.5) _swT = uSwSeed * (0.85 + 0.3 * aSw.y);',
    'vSwC = mix(mix(_swR, _swT, 0.58) * 0.52, mix(_swT * 1.32, _swR * 1.18, 0.38), smoothstep(0.04, 0.88, _swH));',
    'mvPosition = viewMatrix * mvPosition;','gl_Position = projectionMatrix * mvPosition;'].join('\n'));
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vSwC;')
   .replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb *= vSwC;')
   .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;','reflectedLight.indirectDiffuse += 0.8*vIndirectFront + 0.2*vIndirectBack;')
   .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;','reflectedLight.directDiffuse = vLightFront + 0.35*vLightBack;');};
 m.customProgramCacheKey=()=>'biosward'+(gtOn()?'|gt':'');return m;}
// the camera the sward follows: o.camera, BIO.init's h.camera, else the page's global `camera`
function _swCam(){if(SW.o.camera)return SW.o.camera;if(BIO.host&&BIO.host.camera)return BIO.host.camera;try{return typeof camera!=='undefined'&&camera&&camera.isCamera?camera:null;}catch(e){return null;}}
BIO.sward=function(o){if(o===false){SW.asked=true;BIO._swardStop();return false;}o=o||{};SW.asked=true;
 if(typeof KRAND==='undefined'||!BIO.host||!BIO.host.scene){BIO.err('BIO.sward: needs core/rand (KRAND) and a scene');return false;}
 if(SW.on)BIO._swardStop();SW.o=o;SW.on=true;SW.cache.clear();SW.at=null;SW.palette=null;if(o.maxTris!=null)SW.maxTris=+o.maxTris;
 const T=BIO.host.THREE;BIO._tickWind();SW.layers=BIO.SWARD_LAYERS.map(L0=>{const L=Object.assign({},L0),g=L.plume?BIO.swardPlume(L.h,L.w):BIO.swardClump(L.blades,L.seg,L.h,L.w,L.spread);
  L.tris=g.userData.tris;L.cap=Math.max(16,Math.floor(SW.maxTris*L.share/L.tris));const m=_swMat(),U=m.userData.swU;U.uSwR.value.set(L.r0,L.fade[0],L.fade[1],0);
  const im=new T.InstancedMesh(g,m,L.cap);im.count=0;im.frustumCulled=false;im.castShadow=false;im.receiveShadow=true;im.name='sward:'+L.name;
  im.userData.probeSkip=true;im.userData.sward=L.name;im.userData.inspectLabel='grass sward ('+L.name+')';
  if(im.instanceMatrix.setUsage)im.instanceMatrix.setUsage(T.DynamicDrawUsage);const aS=new T.InstancedBufferAttribute(new Float32Array(L.cap*4),4);
  if(aS.setUsage)aS.setUsage(T.DynamicDrawUsage);g.setAttribute('aSw',aS);L.mesh=im;L.mat=m;BIO.host.scene.add(im);SW.meshes.push(im);return L;});
 SW.layers[0].mesh.onBeforeRender=function(r,s,cam){if(cam===_swCam())BIO._swardUpdate(cam,4);};
 return SW;};
BIO._swardStop=function(){for(const m of SW.meshes){if(m.parent)m.parent.remove(m);m.geometry.dispose();m.material.dispose();}SW.meshes=[];SW.layers=null;SW.on=false;};
// started by BIO.bake on a page that grows grass, unless it asked (BIO.sward(...) or false) or turned it off
BIO._swardAuto=function(){if(!BIO.SWARD_AUTO||SW.asked||SW.on||!SW.gridN)return false;const c=_swCam();if(!c)return false;return !!BIO.sward({camera:c});};
// THE UPDATE: the tiles each ring needs round the camera, nearest first; the missing ones made within `ms` milliseconds (Infinity:
// all), the layer's buffer refilled when its tile set or a tile changed, up to its cap
BIO._swardUpdate=function(cam,ms){if(!SW.on||!SW.layers)return SW.stats;const t0=Date.now(),P=cam.position,gnd=SW.o.ground||((x,z)=>BIO.drawnH(x,z)),gy=gnd(P.x,P.z);
 const hide=isFinite(gy)&&(P.y-gy>88||P.y-gy<-2.2);
 if(hide){if(!SW.hidden){for(const L of SW.layers)L.mesh.count=0;SW.hidden=true;SW.at=null;}return SW.stats;}
 const moved=!SW.at||Math.hypot(P.x-SW.at[0],P.z-SW.at[1])>2;if(!moved&&!SW.dirty)return SW.stats;
 const pal=BIO.swardPalette();if(pal)for(const L of SW.layers){const U=L.mat.userData.swU;U.uSwTipA.value.set(pal[0]*.9,pal[1]*.9,pal[2]*.9);
  U.uSwTipB.value.set(Math.min(1,pal[0]*1.12),Math.min(1,pal[1]*1.06),pal[2]*.8);U.uSwRoot.value.set(pal[0]*.45,pal[1]*.42,pal[2]*.35);
  if(SW.o.root)U.uSwRoot.value.set(SW.o.root[0],SW.o.root[1],SW.o.root[2]);if(SW.o.seed3)U.uSwSeed.value.set(SW.o.seed3[0],SW.o.seed3[1],SW.o.seed3[2]);}
 let pending=false,tris=0,tiles=0;SW.hidden=false;
 for(const L of SW.layers){const TL=L.tile,t0x=Math.floor((P.x-L.r1)/TL),t1x=Math.floor((P.x+L.r1)/TL),t0z=Math.floor((P.z-L.r1)/TL),t1z=Math.floor((P.z+L.r1)/TL),need=[];
  for(let tz=t0z;tz<=t1z;tz++)for(let tx=t0x;tx<=t1x;tx++){const x0=tx*TL,z0=tz*TL,dx=Math.max(x0-P.x,0,P.x-x0-TL),dz=Math.max(z0-P.z,0,P.z-z0-TL);
   const dn=Math.hypot(dx,dz),df=Math.hypot(Math.max(Math.abs(P.x-x0),Math.abs(P.x-x0-TL)),Math.max(Math.abs(P.z-z0),Math.abs(P.z-z0-TL)));
   if(dn<=L.r1&&df>=L.r0-2)need.push({tx,tz,d:dn});}
  need.sort((a,b)=>a.d-b.d);let n=0;const IM=L.mesh.instanceMatrix.array,AS=L.mesh.geometry.attributes.aSw.array;
  for(const t of need){const key=L.name+'|'+t.tx+'|'+t.tz;let c=SW.cache.get(key);
   if(!c){if(Date.now()-t0>ms){pending=true;continue;}c=BIO.swardTile(L,t.tx,t.tz);SW.cache.set(key,c);}
   c.used=SW.frame||0;const k=Math.min(c.n,L.cap-n);if(k<=0)break;IM.set(c.m.subarray(0,k*16),n*16);AS.set(c.a.subarray(0,k*4),n*4);n+=k;tiles++;}
  L.mesh.count=n;L.mesh.instanceMatrix.needsUpdate=true;L.mesh.geometry.attributes.aSw.needsUpdate=true;SW.stats[L.name]=n;tris+=n*L.tris;}
 SW.frame=(SW.frame||0)+1;if(SW.cache.size>6000){for(const [k,c] of SW.cache)if((c.used||0)<SW.frame-1)SW.cache.delete(k);}
 SW.at=pending?null:[P.x,P.z];SW.dirty=pending;SW.stats.tris=tris;SW.stats.tiles=tiles;SW.stats.ms=Date.now()-t0;return SW.stats;};
BIO.swardStats=function(){return Object.assign({on:SW.on,grass:SW.gridN},SW.stats);};

})();
