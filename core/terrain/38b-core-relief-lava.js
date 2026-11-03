// ================================================================= CORE — relief: inflated flows and a tube's fallen roof (KRELIEF.tumuli, KRELIEF.tubeRille)  [G data]
// Godstep's "Owed in core" 2 and 3 (biomes/godstep/PLAN.md, 2026-11-03), the Throne's tube station and a Rift tube the same:
//   tumuli   the ponded flows' TUMULI and PRESSURE RIDGES: lobes that swelled under their crust, split along the crest by an
//            axial crack, placed along a KLAVA bake's lobes (KLAVA does not inflate; the plains are not built without them)
//   tubeRille  a RILLE OVER A TUBE: keyed to a KRELIEF.tube record, the trench cut where the roof fell (a U section, talus at the
//            wall's foot, an overhang share recorded for core/terrain's carve), and skylights where the roof still stands but thin
// Two new landform kinds on KRELIEF's composition: once this file is loaded, KRELIEF.shape, at, apply and kinds take them, and
// every other kind answers exactly as before. Opt-in; needs core/rand and 38-core-relief.js. No THREE, no DOM; test-relief-lava.js.
// Every draw is KRAND.hash(world, cell i, cell j, salt): a tile made alone gets the records a whole field gets there.
//
//   KRELIEF.tumuli({field: {x0, z0, cell, nx, nz, dh} (KLAVA.bake's result), world, cell (40 m), p (.45), minDh (2 m), flat (.06: the
//            dh slope under which a lobe is ponded), size ([8, 30] m), height ([1, 5] m, times dh / 8 up to 1), ridge (true: pressure
//            ridges at the ponded lobes' margins), crack (true)})
//     -> [{kind:'tumulus', form:'tumulus'|'ridge', id, x, z, L, W, H, ry, crack:{w, d}|null, seed}]
//   KRELIEF.tumulus(rec) checks one hand-placed: {x, z, L, W, H, ry, form, crack}
//   KRELIEF.tubeRille(T, {ground, id, thin (T.roof / 2: a roof thinner than this has fallen), spans ([[s0, s1] m along the tube]),
//            widen (1.3: the trench's half-width over the tube's r), talus (.3: its height over the trench's depth), overhang (.25),
//            skylight ({every: 60, p: .5, under: 2 x thin}: where the roof stands but thinner than `under`, a skylight), seed})
//     -> {kind:'tuberille', id, tube: T, w, spans:[{s0, s1}], skylights:[{x, z, s, r}], openings:[KCAVERN.opening args (the
//         skylights; the fallen spans need none: the ground itself is cut to the floor)], walls:[{side: -1|1, s0, s1, depth,
//         overhang}] (for 36-core-carve), reach}
//   parts (KRELIEF.at): tumulus 'crest' | 'crack' | 'flank'; tuberille 'floor' | 'talus' | 'wall' | 'skylight'
(function(root){
  'use strict';
  var R=root.KRELIEF;
  if(!R||!R.shape||!R.tube)throw new Error('core/terrain 38b-core-relief-lava.js: load 38-core-relief.js first (KRELIEF)');
  if(R._lava)return;
  function KR(){var K=root.KRAND;if(!K)throw new Error('KRELIEF lava forms: load core/rand/08-core-rand.js first');return K;}
  function d(v,x){return v==null?x:v;}
  function sm(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  function fin(v,w){if(typeof v!=='number'||!isFinite(v))throw new Error('KRELIEF: '+w+' must be a finite number');return v;}
  function pair(a,w){if(!Array.isArray(a)||a.length!==2||!(a[0]<=a[1]))throw new Error('KRELIEF: '+w+' is [lo, hi]');return a;}

  // ---------------------------------------------------------------- tumuli and pressure ridges
  function dhAt(F,x,z){var u=(x-F.x0)/F.cell,v=(z-F.z0)/F.cell;if(u<0||v<0||u>F.nx-1||v>F.nz-1)return 0;
    var i=Math.min(F.nx-2,Math.floor(u)),j=Math.min(F.nz-2,Math.floor(v)),fu=u-i,fv=v-j,k=j*F.nx+i;
    return (F.dh[k]*(1-fu)+F.dh[k+1]*fu)*(1-fv)+(F.dh[k+F.nx]*(1-fu)+F.dh[k+F.nx+1]*fu)*fv;}
  function tumulus(o){var q={kind:'tumulus',form:o.form==null?'tumulus':o.form,id:String(d(o.id,'tumulus')),x:fin(o.x,'x'),z:fin(o.z,'z'),L:fin(o.L,'L'),W:fin(o.W,'W'),H:fin(o.H,'H'),ry:fin(d(o.ry,0),'ry'),
      crack:o.crack===false||o.crack==null?null:{w:fin(d(o.crack.w,o.W*.08),'crack w'),d:fin(d(o.crack.d,o.H*.5),'crack d')},seed:d(o.seed,0)};
    if(q.form!=='tumulus'&&q.form!=='ridge')throw new Error('KRELIEF.tumulus: form is tumulus or ridge');
    if(!(q.L>0&&q.W>0&&q.H>0&&q.W<=q.L))throw new Error('KRELIEF.tumulus: L >= W > 0 and H > 0');return q;}
  function tumuli(o){o=o||{};var K=KR(),F=o.field;if(!F||!F.dh||!(F.nx>=2)||!(F.nz>=2)||!(F.cell>0))throw new Error('KRELIEF.tumuli: field is a KLAVA bake {x0, z0, cell, nx, nz, dh}');
    var cs=d(o.cell,40),W=d(o.world,0)>>>0,p=d(o.p,.45),mn=d(o.minDh,2),flat=d(o.flat,.06),sz=pair(o.size||[8,30],'size'),hg=pair(o.height||[1,5],'height'),out=[];
    if(!(cs>0))throw new Error('KRELIEF.tumuli: cell must be above 0');
    var x0=F.x0,z0=F.z0,x1=F.x0+(F.nx-1)*F.cell,z1=F.z0+(F.nz-1)*F.cell;
    for(var j=Math.floor(z0/cs);j<=Math.floor(z1/cs);j++)for(var i=Math.floor(x0/cs);i<=Math.floor(x1/cs);i++){
      var u=function(s){return K.unit(K.hash(W,i,j,0x7700+s));};if(u(0)>=p)continue;
      var x=(i+.1+.8*u(1))*cs,z=(j+.1+.8*u(2))*cs;if(x<x0||x>x1||z<z0||z>z1)continue;
      var h=dhAt(F,x,z),e=F.cell,gx=(dhAt(F,x+e,z)-dhAt(F,x-e,z))/(2*e),gz=(dhAt(F,x,z+e)-dhAt(F,x,z-e))/(2*e),gr=Math.hypot(gx,gz),rec=null;
      if(h>=mn&&gr<flat){var L=sz[0]+(sz[1]-sz[0])*u(3),Wd=L*(.35+.25*u(4)),H=(hg[0]+(hg[1]-hg[0])*u(5))*Math.min(1,h/8);
        rec={form:'tumulus',x:x,z:z,L:L,W:Wd,H:H,ry:u(6)*Math.PI};}
      else if(o.ridge!==false&&h>=mn*.3&&gr>=flat){var L2=(sz[0]+(sz[1]-sz[0])*u(3))*2,W2=Math.max(2,L2*.1),H2=(hg[0]+(hg[1]-hg[0])*u(5))*.6;
        rec={form:'ridge',x:x,z:z,L:L2,W:Math.min(W2,L2),H:H2,ry:Math.atan2(gz,gx)+Math.PI/2};}
      if(!rec)continue;rec.id='tumulus:'+i+','+j;rec.seed=K.hash(W,i,j,0x77);rec.crack=o.crack===false?false:{w:rec.W*(.05+.06*u(7)),d:rec.H*(.4+.4*u(8))};
      out.push(tumulus(rec));}
    return out;}
  function local(T,x,z){var c=Math.cos(T.ry),s=Math.sin(T.ry),dx=x-T.x,dz=z-T.z;return [dx*c+dz*s,-dx*s+dz*c];}
  function tumH(T,x,z,g){var q=local(T,x,z),a=q[0]/(T.L/2),b=q[1]/(T.W/2),r2=a*a+b*b;if(r2>=1)return g;
    var y=g+T.H*Math.pow(1-r2,T.form==='ridge'?1:.6);
    if(T.crack){var cw=T.crack.w*(1-.4*Math.abs(a));if(Math.abs(q[1])<cw&&r2<.85)y-=T.crack.d*(1-Math.abs(q[1])/cw)*sm(.85,.5,r2);}
    return y;}
  function tumAt(T,x,z){var q=local(T,x,z),a=q[0]/(T.L/2),b=q[1]/(T.W/2),r2=a*a+b*b;if(r2>=1)return null;
    if(T.crack&&Math.abs(q[1])<T.crack.w*(1-.4*Math.abs(a))&&r2<.85)return {part:'crack'};return {part:r2<.3?'crest':'flank'};}

  // ---------------------------------------------------------------- the rille over a tube
  /* the tube's centreline as segments with arc length and floor y, bucketed for the nearest point */
  function line(T){if(T._ln)return T._ln;var P=T.pts,S=[0],segs=[],bb=[1e30,1e30,-1e30,-1e30];
    for(var i=0;i<P.length-1;i++){var a=P[i],b=P[i+1],L=Math.hypot(b.x-a.x,b.z-a.z);S.push(S[i]+L);segs.push({a:a,b:b,L:L,s:S[i]});}
    P.forEach(function(p){bb[0]=Math.min(bb[0],p.x);bb[1]=Math.min(bb[1],p.z);bb[2]=Math.max(bb[2],p.x);bb[3]=Math.max(bb[3],p.z);});
    var ln={segs:segs,len:S[S.length-1],bb:bb};Object.defineProperty(T,'_ln',{value:ln,enumerable:false});return ln;}
  function near(T,x,z){var ln=line(T),best=null;
    for(var k=0;k<ln.segs.length;k++){var g=ln.segs[k];if(!(g.L>0))continue;var tx=(g.b.x-g.a.x)/g.L,tz=(g.b.z-g.a.z)/g.L,px=x-g.a.x,pz=z-g.a.z,u=Math.max(0,Math.min(g.L,px*tx+pz*tz)),qx=px-tx*u,qz=pz-tz*u,dd=Math.hypot(qx,qz);
      if(!best||dd<best.d)best={d:dd,s:g.s+u,q:px*-tz+pz*tx,y:g.a.y+(g.b.y-g.a.y)*u/g.L,x:g.a.x+tx*u,z:g.a.z+tz*u};}
    return best;}
  function tubeRille(T,o){o=o||{};var K=KR();if(!T||T.kind!=='tube')throw new Error('KRELIEF.tubeRille: a KRELIEF.tube record');if(typeof o.ground!=='function')throw new Error('KRELIEF.tubeRille: ground(x,z)');
    var ln=line(T),hgt=T.passage.h,thin=fin(d(o.thin,T.roof/2),'thin'),wid=fin(d(o.widen,1.3),'widen'),w=T.r*wid,step=Math.max(.5,T.r/2),seed=d(o.seed,T.seed)>>>0,spans=[],cur=null;
    if(!(wid>=1))throw new Error('KRELIEF.tubeRille: widen is 1 or more (the trench is the tube, or wider)');
    var given=(o.spans||[]).map(function(p){return pair(p,'a span');});
    function inGiven(s){for(var i=0;i<given.length;i++)if(s>=given[i][0]&&s<=given[i][1])return true;return false;}
    function at(s){var acc=null;for(var k=0;k<ln.segs.length;k++){var g=ln.segs[k];if(s<=g.s+g.L||k===ln.segs.length-1){var u=g.L>0?Math.max(0,Math.min(1,(s-g.s)/g.L)):0;acc={x:g.a.x+(g.b.x-g.a.x)*u,z:g.a.z+(g.b.z-g.a.z)*u,y:g.a.y+(g.b.y-g.a.y)*u};break;}}return acc;}
    for(var s=0;s<=ln.len+1e-9;s+=step){var p=at(Math.min(s,ln.len)),roof=o.ground(p.x,p.z)-(p.y+hgt),fell=roof<thin||inGiven(s);
      if(fell){if(!cur)cur={s0:s,s1:s};else cur.s1=s;}else if(cur){spans.push(cur);cur=null;}}
    if(cur)spans.push(cur);
    /* a span given by hand is exact: merged with the sampled ones, overlaps joined */
    given.forEach(function(p){spans.push({s0:Math.max(0,p[0]),s1:Math.min(ln.len,p[1])});});spans.sort(function(a,b){return a.s0-b.s0;});
    spans=spans.reduce(function(acc,S){var L=acc[acc.length-1];if(L&&S.s0<=L.s1+step)L.s1=Math.max(L.s1,S.s1);else acc.push({s0:S.s0,s1:S.s1});return acc;},[]);
    var SK=o.skylight===false?null:(o.skylight||{}),sky=[],op=[];
    if(SK){var ev=d(SK.every,60),pp=d(SK.p,.5),under=d(SK.under,2*thin);
      for(var k=0;k*ev<ln.len;k++){var u0=K.unit(K.hash(seed,k,0x5c1));if(u0>=pp)continue;var sa=(k+.2+.6*K.unit(K.hash(seed,k,0x5c2)))*ev;if(sa>=ln.len)continue;
        var q=at(sa),rf=o.ground(q.x,q.z)-(q.y+hgt);if(rf<thin||rf>=under||spans.some(function(S){return sa>=S.s0-w&&sa<=S.s1+w;}))continue;
        var r=T.r*(.3+.25*K.unit(K.hash(seed,k,0x5c3)));sky.push({x:q.x,z:q.z,s:sa,r:r});op.push({id:d(o.id,'tuberille')+':sky'+k,c:[q.x,q.z],r:r,kind:'well'});}}
    var tl=fin(d(o.talus,.3),'talus'),ov=fin(d(o.overhang,.25),'overhang'),walls=[];
    spans.forEach(function(S){var dep=0;for(var s2=S.s0;s2<=S.s1;s2+=step){var q2=at(s2);dep=Math.max(dep,o.ground(q2.x,q2.z)-q2.y);}
      [-1,1].forEach(function(side){walls.push({side:side,s0:S.s0,s1:S.s1,depth:dep,overhang:ov});});});
    return {kind:'tuberille',id:String(d(o.id,'tuberille')),tube:T,w:w,talus:tl,overhang:ov,thin:thin,spans:spans,skylights:sky,openings:op,walls:walls,reach:w+2+T.r};}
  function spanOf(Rr,s){for(var i=0;i<Rr.spans.length;i++){var S=Rr.spans[i];if(s>=S.s0-Rr.tube.r&&s<=S.s1+Rr.tube.r)return S;}return null;}
  function rilH(Rr,x,z,g){var b=line(Rr.tube).bb,rc=Rr.reach;if(x<b[0]-rc||x>b[2]+rc||z<b[1]-rc||z>b[3]+rc)return g;var p=near(Rr.tube,x,z);if(!p||p.d>Rr.reach)return g;var y=g;
    var S=spanOf(Rr,p.s);
    if(S){var aq=Math.abs(p.q),w=Rr.w,reach=w*.45,dep=g-p.y,end=Math.min(sm(S.s0-Rr.tube.r,S.s0,p.s),sm(S.s1+Rr.tube.r,S.s1,p.s)),
        tal=aq>w-reach?Rr.talus*Math.max(0,dep)*sm(w-reach,w,aq):0,floor=p.y+tal,wall=sm(w,w+1,aq);
      y=Math.min(g,floor+(g-floor)*Math.max(wall,1-end));}
    for(var k=0;k<Rr.skylights.length;k++){var q=Rr.skylights[k],dd=Math.hypot(x-q.x,z-q.z);if(dd<q.r*1.6)y-=.3*(1-dd/(q.r*1.6));}
    return y;}
  function rilAt(Rr,x,z){var p=near(Rr.tube,x,z);if(!p||p.d>Rr.reach)return null;
    for(var k=0;k<Rr.skylights.length;k++){var q=Rr.skylights[k];if(Math.hypot(x-q.x,z-q.z)<q.r)return {part:'skylight'};}
    var S=spanOf(Rr,p.s);if(!S)return null;var aq=Math.abs(p.q),w=Rr.w;if(aq>w+1)return null;return {part:aq>w?'wall':aq>w*.55?'talus':'floor'};}

  // ---- the composition: the two kinds beside KRELIEF's own; every other record goes to the old functions untouched
  var EXT={tumulus:[tumH,tumAt],tuberille:[rilH,rilAt]},shape0=R.shape,at0=R.at,kinds0=R.kinds;
  R.shape=function(Rr,x,z,g){var e=Rr&&EXT[Rr.kind];return e?e[0](Rr,x,z,g):shape0(Rr,x,z,g);};
  R.at=function(Rr,x,z,g){var e=Rr&&EXT[Rr.kind];return e?e[1](Rr,x,z,g):at0(Rr,x,z,g);};
  R.apply=function(ground,recs){return function(x,z){var g=ground(x,z);for(var i=0;i<recs.length;i++)g=R.shape(recs[i],x,z,g);return g;};};
  R.kinds=function(){return kinds0().concat(Object.keys(EXT));};
  R.tumuli=tumuli;R.tumulus=tumulus;R.tubeRille=tubeRille;R._lava=true;
})(typeof window!=='undefined'?window:globalThis);
