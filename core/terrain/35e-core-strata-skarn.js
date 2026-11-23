// ================================================================= CORE — strata: skarn lenses and the rock glaze  [G data]
// Two asks of the planned biomes, on KSTRATA (35-core-strata.js) and KSTRATA.vary (35c), changing nothing in either:
//  - SKARN (biomes/neouterwall/PLAN.md sections 2 and 8, the Glass-Skarn Bastion): irregular, lensing bands of green epidote,
//    red-brown garnet, black magnetite and white marble where Korona's heat met the wall's carbonate; not flat beds. The
//    plan asked whether KSTRATA.vary is enough: IT IS. The recipes are added through KSTRATA.add (35's own table, as
//    39c-core-karst.js adds `karst`); the lenses are formations of zero varied thickness except under `pts` bumps, their
//    contacts roughened by `noise`, so each pod pinches out at its rim and swells and necks inside it. No new rock model.
//  - THE ROCK GLAZE (biomes/opalvalley/PLAN.md section 2: the opaline silica glaze on the cliffs that shifts copper-rose to
//    teal as the sun moves; the NE outer wall's pseudotachylite fault mirrors and the magnetite's sheen): where a stack
//    glazes (data) and the colour of a thin film by view angle and thickness (a JS twin and the same GLSL text).
// Plain maths of (x, y, z): no THREE, no DOM, no Math.random, no sin, cos or exp (the film's cosine is a polynomial,
// ksCos2pi, 1.6e-4 off cos), the noise from the stack's own table. node core/terrain/test-strata-skarn.js.
//
//   recipes  'skarn' (the mixed column as flat beds: marble, garnet, epidote, pyroxene, magnetite, calc-silicate; no kind
//            on itself), and the lens and host columns 'skarn-marble', 'skarn-garnet', 'skarn-epidote', 'skarn-magnetite'
//   const V = KSTRATA.skarn({seed, base, top, front, lenses, scale, th, amp, reach, side, kinds, ...create's options})
//     a KSTRATA.vary stack (read it as any: V.at, V.surface, V.contact, V.thickness, V.export; KSTRATA.varyBake for the GPU)
//     front    the intrusion contact, as a map trace: {a:[x,z], b:[x,z]} (a line) or {pts:[[x,z], ...]} (a polyline)
//     side     the carbonate side, where the lenses grow: 1 (default) the side KSTRATA's faults call left of a->b, -1 the other
//     base, top  the skarn's stratigraphic range, filled by the host marble (0, 300); `below` and `above` (optional) are
//              create's formations under and over it (the last of `below` ends at base; give each of `above` a top);
//              every other option (dip, warp, fold, faults, range...) goes to KSTRATA.create
//     lenses   how many lens horizons (6), or a list [{kind:'garnet'|'epidote'|'magnetite', y, th, r, pods:[[x,z],..]}]
//     scale    a pod's size, m (120): its radius r is scale x .6..1.2; th the lens's full thickness (scale x .15), amp the
//              pinch-and-swell (th x .35), reach how far from the front the lenses lie (scale x 2.5)
//     kinds    the share of each lens kind ({garnet:.45, epidote:.35, magnetite:.2}). ZONING: garnet and magnetite lie
//              within .35 reach of the front (proximal), epidote .35 .. .75 (distal), marble beyond
//     V.skarn  {front, side, lenses:[{formation, kind, recipe, y0, y1, th, r, amp, pods}]}: plain data (the magnetite pods
//              are the iron ore bodies a resources pass can register)
//   const G = KSTRATA.glaze({kinds, formations, faults, mirror, thick:[t0,t1] nm, ior, sub, strength, cover, wl, wlT, ch, chT})
//     plain data: which rock glazes (kinds: names, 'recipe.kind' names or '*'; formations: indices), on what share of it
//     (cover 0..1, in patches wl m across), how strongly; a fault's bared face within `faults` m glazes by `mirror` (the
//     pseudotachylite mirrors); the film is thick nm (varying over wlT m), of index ior over a substrate of index sub
//   KSTRATA.glazeAt(S, G, x, y, z, out)  {k 0..1, thick nm, rock, mirror, kind} on a stack (or a varied one)
//   KSTRATA.glazeColour(cosT, thick, ior, sub)   the film's interference tint [r,g,b], linear 0..1: the reflectance of a
//     film over a substrate (Airy, the two Fresnel amplitudes at normal incidence, the phase 2 n d cos(theta_t) / lambda at
//     640, 540 and 460 nm), its fringe swing stretched to 0..1 a channel. cosT the cosine between the normal and the eye
//     (or the half vector, for a sheen that moves with the sun). With the defaults (350 nm, 1.45 over 1.6) it is teal
//     facing the eye and copper-rose at grazing angles, through blue and violet between
//   KSTRATA.glazeGLSL()   GLSL text: float ksCos2pi(float t); vec3 ksGlazeColour(float cosT, float thick, float ior, float sub)
//
// ADOPTING THE GLAZE on a page: per vertex of the cliff mesh, glazeAt into an attribute (k, thick); in the rock's
// onBeforeCompile add glazeGLSL() to the fragment pars and, after the strata colour, c = mix(c, c * (0.35 + 1.3 *
// ksGlazeColour(dot(N, V), thick, ior, sub)), k) (or add it to the specular for a sheen), with the material's roughness
// lowered where k is high (the wet look). BIO.iridBarkMat (core/biome/30-core-foliage.js), the rift's IRIDBARK and
// xanadu's PAL.psyPair were checked first: they are two-colour mixes by a fresnel term (and the strata shader's opal
// band a cosine palette), not a film, so they cannot give the copper-rose -> violet -> teal sequence by thickness; this is
// the rock version, and a bark could take ksGlazeColour too. Godot (owed): ks_glaze_colour in a gdshaderinc, the same
// arithmetic; glazeAt is plain data a GDScript twin reads from the stack's export.
(function(root){
  'use strict';
  var KS=root.KSTRATA,R=root.KRAND;
  if(!KS||!KS.create||!KS.add)throw new Error('core/terrain 35e-core-strata-skarn.js: load 35-core-strata.js first (KSTRATA)');
  if(KS.skarn)return;
  function clamp(v,a,b){return v<a?a:v>b?b:v;}
  function sstep(a,b,x){var t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);}

  // ---- the recipes. Colours sRGB hex; th m; hard 0..1. Grossular-andradite garnet red-brown, epidote pistachio, diopside-
  // hedenbergite pyroxene bottle green, magnetite black, the marble white to grey, the calc-silicate partings pale green-grey
  var C={marble:[0xe8e4dc,0xdcd8cf,0xf0ece4,0xcfcac0],garnet:[0x8a4a32,0x7a3e2a,0x9a5638,0x6e3624],epidote:[0x7a8a3a,0x6b7d34,0x8a9a48,0x5e6e2e],
    pyroxene:[0x3e5038,0x34452f,0x485a3e],magnetite:[0x1e1e22,0x26262b,0x18181c],calcsil:[0xb8bfa8,0xa9b39a,0xc2c8b2],hornfels:[0x4a4448,0x55505a,0x433e45]};
  function K(p,th,c,hard,between){var o={p:p,th:th,col:C[c],hard:hard,xbed:0,varnish:0,jit:.06};if(between)o.between=true;return o;}
  var RECS=[
    {name:'skarn',main:'marble',noRepeat:true,kinds:{marble:K(.34,[2,12],'marble',.6),garnet:K(.22,[.5,6],'garnet',.85),epidote:K(.2,[.4,5],'epidote',.75),
      pyroxene:K(.08,[.3,3],'pyroxene',.8),magnetite:K(.08,[.3,4],'magnetite',.9),calcsil:K(.08,[.2,1.5],'calcsil',.7,true)},fx:{}},
    {name:'skarn-marble',main:'marble',kinds:{marble:K(.8,[3,15],'marble',.6),calcsil:K(.14,[.2,1],'calcsil',.7,true),hornfels:K(.06,[.3,1.5],'hornfels',.9,true)},fx:{}},
    {name:'skarn-garnet',main:'garnet',kinds:{garnet:K(.75,[.8,5],'garnet',.85),epidote:K(.15,[.2,1.2],'epidote',.75,true),magnetite:K(.1,[.1,.6],'magnetite',.9,true)},fx:{}},
    {name:'skarn-epidote',main:'epidote',kinds:{epidote:K(.65,[.6,4],'epidote',.75),pyroxene:K(.2,[.3,2],'pyroxene',.8),garnet:K(.15,[.2,1.2],'garnet',.85,true)},fx:{}},
    {name:'skarn-magnetite',main:'magnetite',kinds:{magnetite:K(.8,[1,6],'magnetite',.9),garnet:K(.2,[.2,1],'garnet',.85,true)},fx:{}}];
  RECS.forEach(function(r){if(!KS.RECIPES[r.name])KS.add(r);});

  // ---- the front: a line or a polyline; a point along it by u (0..1 of its length) and the carbonate side's unit normal
  function segs(front){var P=front&&front.pts?front.pts:front&&front.a&&front.b?[front.a,front.b]:null;
    if(!P||P.length<2)throw new Error('KSTRATA.skarn: front needs {a, b} or {pts} (two points or more)');
    var out=[],tot=0;for(var i=0;i+1<P.length;i++){var dx=P[i+1][0]-P[i][0],dz=P[i+1][1]-P[i][1],L=Math.sqrt(dx*dx+dz*dz);if(L>0){out.push({a:P[i],dx:dx,dz:dz,L:L,s:tot});tot+=L;}}
    if(!(tot>0))throw new Error('KSTRATA.skarn: the front has no length');return {list:out,len:tot};}
  function along(F,u,side){var d=u*F.len,s=F.list[F.list.length-1];for(var i=0;i<F.list.length;i++)if(d<=F.list[i].s+F.list[i].L){s=F.list[i];break;}
    var t=clamp((d-s.s)/s.L,0,1);return {x:s.a[0]+s.dx*t,z:s.a[1]+s.dz*t,nx:side*s.dz/s.L,nz:-side*s.dx/s.L};}

  function skarn(o){o=o||{};if(!KS.vary)throw new Error('KSTRATA.skarn: load 35c-core-strata-vary.js first (KSTRATA.vary)');
    if(!R||!R.hash)throw new Error('KSTRATA.skarn: core/rand (KRAND) is needed');
    var seed=o.seed==null?4711:o.seed>>>0,base=o.base==null?0:o.base,top=o.top==null?300:o.top;
    if(!(top>base))throw new Error('KSTRATA.skarn: top must be over base');
    var side=o.side==null?1:(o.side<0?-1:1),F=segs(o.front),scale=o.scale==null?120:o.scale,TH=o.th==null?scale*.15:o.th,
      AMP=o.amp==null?TH*.35:o.amp,reach=o.reach==null?scale*2.5:o.reach,shares=o.kinds||{garnet:.45,epidote:.35,magnetite:.2};
    if(!(scale>0)||!(TH>0)||!(AMP>=0)||!(reach>0))throw new Error('KSTRATA.skarn: scale, th and reach over 0, amp 0 or more');
    var L=[],i,j;
    if(Array.isArray(o.lenses))L=o.lenses.map(function(l,k){if(!l||l.y==null||!l.pods||!l.pods.length)throw new Error('KSTRATA.skarn: lens '+k+' needs y and pods');
      return {kind:l.kind||'garnet',y:l.y,th:l.th==null?TH:l.th,r:l.r==null?scale:l.r,amp:l.amp==null?AMP:l.amp,pods:l.pods.map(function(p){return [p[0],p[1]];})};});
    else{var n=o.lenses==null?6:o.lenses,ks=Object.keys(shares),tot=0;ks.forEach(function(k){tot+=shares[k];});
      if(!(n>=0)||Math.floor(n)!==n)throw new Error('KSTRATA.skarn: lenses is a count or a list');
      if(n>0&&!(tot>0))throw new Error('KSTRATA.skarn: kinds needs a share over 0');
      for(i=0;i<n;i++){var h=function(s){return R.unit(R.hash(seed,i,s,0x5CA2));},a=h(1)*tot,kind=ks[ks.length-1];
        for(j=0;j<ks.length;j++){if(a<shares[ks[j]]){kind=ks[j];break;}a-=shares[ks[j]];}
        var pr=kind==='epidote'?[.35,.75]:[0,.35],np=1+Math.floor(h(2)*3),pods=[];
        for(j=0;j<np;j++){var g=function(s){return R.unit(R.hash(seed,i,j,s,0x90D5));},P=along(F,g(1),side),d=reach*(pr[0]+(pr[1]-pr[0])*g(2));
          pods.push([P.x+P.nx*d,P.z+P.nz*d]);}
        L.push({kind:kind,y:base+(i+.5)*(top-base)/n,th:TH,r:scale*(.6+.6*h(3)),amp:AMP,pods:pods});}}
    L.sort(function(p,q){return p.y-q.y;});
    var fsl=(o.below||[]).slice(),C2=[],lens=[],prev=base,ext0=0;
    L.forEach(function(l,k){var y0=l.y-l.th/2,y1=l.y+l.th/2,ext=Math.max(l.amp,2*l.amp-l.th/2);
      if(['garnet','epidote','magnetite'].indexOf(l.kind)<0)throw new Error('KSTRATA.skarn: lens kind '+l.kind+' (garnet, epidote or magnetite)');
      /* a lens's contacts stay within ext of its flat ones: lenses must not reach each other, nor out of base..top */
      if(y0-ext<prev+ext0-1e-9||y1+ext>top+1e-9)throw new Error('KSTRATA.skarn: lens '+k+' at '+l.y+' reaches '+ext.toFixed(1)+' m past its flat thickness into its neighbour or out of base..top (fewer lenses, or a smaller th or amp)');
      if(y0-prev>1e-9)fsl.push({recipe:'skarn-marble',base:prev,top:y0});
      var at=fsl.length,e=l.th/2+l.amp,cb={d:e,pts:l.pods.map(function(p){return [p[0],p[1],-e];}),r:l.r},ct={d:-e,pts:l.pods.map(function(p){return [p[0],p[1],e];}),r:l.r};
      /* off the pods the base rises and the top falls by th/2 + amp, so the noise never opens a sliver there; the pods' bumps
         take it back at their centres; the noise (two channels, so base and top move apart) pinches and swells the pod */
      if(l.amp>0){cb.noise={amp:l.amp,wl:l.r*.7,ch:2};ct.noise={amp:l.amp,wl:l.r*.7,ch:3};}
      fsl.push({recipe:'skarn-'+l.kind,base:y0,top:y1});C2.push({at:at,by:cb},{at:at+1,by:ct});
      lens.push({formation:at,kind:l.kind,recipe:'skarn-'+l.kind,y0:y0,y1:y1,th:l.th,r:l.r,amp:l.amp,pods:l.pods});
      prev=y1;ext0=ext;});
    if(top-prev>1e-9)fsl.push({recipe:'skarn-marble',base:prev,top:top});
    (o.above||[]).forEach(function(f){fsl.push(f);});
    var opt={};for(var k in o)if(['front','side','lenses','scale','th','amp','reach','kinds','below','above','base','top'].indexOf(k)<0)opt[k]=o[k];
    opt.seed=seed;opt.formations=fsl;
    var S=KS.create(opt),V=KS.vary(S,{contacts:C2});
    V.skarn={front:JSON.parse(JSON.stringify(o.front)),side:side,lenses:lens};
    return V;}

  // ---- the glaze: where it lies (data) and its colour (a film)
  function glaze(o){o=o||{};var t=o.thick||[300,420];
    if(!(t[1]>=t[0])||!(t[0]>0))throw new Error('KSTRATA.glaze: thick [t0, t1] nm, 0 < t0 <= t1');
    var G={format:'krator-strata-glaze',version:1,kinds:o.kinds==null?'*':o.kinds,formations:o.formations==null?null:o.formations.slice(),
      faults:o.faults==null?0:o.faults,mirror:o.mirror==null?1:o.mirror,thick:[t[0],t[1]],ior:o.ior==null?1.45:o.ior,sub:o.sub==null?1.6:o.sub,
      strength:o.strength==null?.6:o.strength,cover:o.cover==null?.6:o.cover,wl:o.wl==null?40:o.wl,wlT:o.wlT==null?9:o.wlT,ch:o.ch==null?2:o.ch,chT:o.chT==null?3:o.chT};
    if(G.kinds!=='*'&&!Array.isArray(G.kinds))throw new Error('KSTRATA.glaze: kinds is a list or \'*\'');
    if(!(G.ior>1)||!(G.sub>0)||!(G.wl>0)||!(G.wlT>0)||!(G.faults>=0))throw new Error('KSTRATA.glaze: ior over 1, sub, wl and wlT over 0, faults 0 or more');
    return G;}
  function glazeAt(S,G,x,y,z,out){out=out||{};var a=S.at(x,y,z),T=S.table,kr=0,km=0;
    var hit=(G.kinds==='*'||G.kinds.indexOf(a.kind)>=0||G.kinds.indexOf(a.recipe+'.'+a.kind)>=0)&&(!G.formations||G.formations.indexOf(a.formation)>=0);
    if(hit&&G.strength>0){var n=.5*(KS.noise(T,G.ch,(x+.6*z)/G.wl,y/G.wl)+KS.noise(T,G.ch,(z-.6*x)/G.wl+31.7,y/G.wl+11.3));
      kr=G.strength*sstep(.9-G.cover,1.1-G.cover,n);}
    if(G.faults>0&&G.mirror>0){var Fs=(S.stack||S).faults||[];
      for(var i=0;i<Fs.length;i++){var F=Fs[i],ax=F.a[0],az=F.a[1],dx=F.b[0]-ax,dz=F.b[1]-az,L=Math.sqrt(dx*dx+dz*dz);if(!(L>0))continue;
        var s=Math.abs(dz*(x-ax)-dx*(z-az))/L,m=1;
        if(F.taper){var t=((x-ax)*dx+(z-az)*dz)/(L*L);m=clamp(1+Math.min(t,1-t)*L/F.taper,0,1);}
        if(s<G.faults){var v=G.mirror*(1-s/G.faults)*m;if(v>km)km=v;}}}
    out.rock=kr;out.mirror=km;out.k=clamp(kr>km?kr:km,0,1);out.kind=a.kind;
    out.thick=G.thick[0]+(G.thick[1]-G.thick[0])*KS.noise(T,G.chT,(x+.6*z)/G.wlT+5.3,y/G.wlT);
    return out;}
  // cos(2 pi t) without Math.cos: folded to a quarter turn, the sine's series to the seventh power (1.6e-4 at worst)
  function cos2pi(t){var r=t-Math.floor(t),x=r<.5?r:1-r,z=6.283185307*(x-.25),z2=z*z;return -z*(1-z2/6*(1-z2/20*(1-z2/42)));}
  function filmR(c,r1,r2){return (r1*r1+r2*r2+2*r1*r2*c)/(1+r1*r1*r2*r2+2*r1*r2*c);}
  function glazeColour(cosT,thick,ior,sub){ior=ior==null?1.45:ior;sub=sub==null?1.6:sub;
    var c=Math.min(Math.abs(cosT),1),r1=(1-ior)/(1+ior),r2=(ior-sub)/(ior+sub),ct=Math.sqrt(Math.max(0,1-(1-c*c)/(ior*ior))),
      a=filmR(-1,r1,r2),b=filmR(1,r1,r2),o=2*ior*thick*ct;
    if(Math.abs(b-a)<1e-9)return [.5,.5,.5];
    return [(filmR(cos2pi(o/640),r1,r2)-a)/(b-a),(filmR(cos2pi(o/540),r1,r2)-a)/(b-a),(filmR(cos2pi(o/460),r1,r2)-a)/(b-a)];}
  var GLSL=['float ksCos2pi(float t){float r=t-floor(t),x=r<0.5?r:1.0-r,z=6.283185307*(x-0.25),z2=z*z;return -z*(1.0-z2/6.0*(1.0-z2/20.0*(1.0-z2/42.0)));}',
    'float ksFilmR(float c,float r1,float r2){return (r1*r1+r2*r2+2.0*r1*r2*c)/(1.0+r1*r1*r2*r2+2.0*r1*r2*c);}',
    'vec3 ksGlazeColour(float cosT,float thick,float ior,float sub){float c=min(abs(cosT),1.0),r1=(1.0-ior)/(1.0+ior),r2=(ior-sub)/(ior+sub),',
    ' ct=sqrt(max(0.0,1.0-(1.0-c*c)/(ior*ior))),a=ksFilmR(-1.0,r1,r2),b=ksFilmR(1.0,r1,r2),o=2.0*ior*thick*ct;',
    ' if(abs(b-a)<1e-9)return vec3(0.5);',
    ' return vec3((ksFilmR(ksCos2pi(o/640.0),r1,r2)-a)/(b-a),(ksFilmR(ksCos2pi(o/540.0),r1,r2)-a)/(b-a),(ksFilmR(ksCos2pi(o/460.0),r1,r2)-a)/(b-a));}'].join('\n');

  KS.skarn=skarn;KS.glaze=glaze;KS.glazeAt=glazeAt;KS.glazeColour=glazeColour;KS.glazeGLSL=function(){return GLSL;};KS.cos2pi=cos2pi;
})(typeof window!=='undefined'?window:globalThis);
