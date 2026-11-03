// ================================================================= CORE — lamina: a column laid one couplet a day (KSTRATA.lamina)  [G data]
// The Gills' section 14 item 3 (2026-11-03): a breath pipe lays one couplet a day, 0.2-0.4 mm, a thicker pale band once a year
// in the wet season, and authored marker bands (the Godthrone's glass, the thin years). A pipe 90 m tall holds some 300,000
// couplets: past KSTRATA's bed limit and far under its .25 m bake, so the lamina is a column of its own, beside the stack, not
// a recipe in KSTRATA.RECIPES. Its years are records (one a year, KRAND by year); its days are arithmetic inside a year.
// The column is read FROM THE LIP DOWN (a pipe grows up, so its age is read from the top): depth 0 is the lip's last couplet.
// No THREE, no DOM: plain maths, node-tested (test-lamina.js). Every draw is KRAND.hash(seed, year, salt): never Math.random.
// Needs core/rand and 35-core-strata.js (KSTRATA) loaded first. Lengths in metres, colours sRGB 0..1 (hex in the options).
//
//   const L=KSTRATA.lamina({seed, H, rate, yearD, wet, jitter, half, country | colours, markers, died})
//     H        the column: the lip's height over the foot when it laid its last couplet (a broken pipe keeps its whole H)
//     rate     a dry day's couplet (m: .0003)          yearD   days a year (KCLOCK.YEAR.yearD when loaded, else 365)
//     wet      {at (day of the year it starts, 200), days (40), k (2.2: its couplets that much thicker)}: the annual band; false none
//     jitter   (.15) a year's thickness up or down by KRAND of (seed, year)       half  (.5) the share of a couplet that is its `a` lamina
//     country  'red' (the Godthrone: rust-red and black, a paler rust band) | 'white' (the twins: bone and grey-green, a chalk band),
//              or colours {a, b, wet}
//     markers  [{name, kind, age (years before the lip) | depth (m from the lip: the year whose band holds it), years (1), k (1: its
//              years' couplets that much thicker; the thin years .35), th (m: a layer of its own at its first year's base; a glass
//              band .004), colour, tint (.6: how far a k marker's years go toward its colour)}]. kind 'glass' or 'thin' fills
//              the rest from KSTRATA.LAMINA.marks; a marker may not start past the foot (it throws)
//     died     days since the lip's last couplet (0: the pipe is alive)
//   L.at(depth) -> null off the column, else {depth, h (over the foot), year (years before the lip), yearDay, day (of the pipe:
//              0 its first couplet), daysAgo (from today: died included), phase (0..1 in the couplet), half ('a'|'b'), wet,
//              layer ('couplet'|'marker'), marker (name|null), thick (that couplet's m, or the marker layer's), colour [r,g,b]}
//   L.atPipe(B, x, y, z) the same at a point of a KSTACKS chimney record B (a fallen one along its axis): "day 412,117 of this pipe"
//   L.depthOf(day) the depth of the top of the pipe's day `day` (null off the column);  L.days the pipe's couplets; L.years
//   L.bands({from, to}) -> [{d0, d1, kind: 'wet'|'marker'|'run', name, year}] the visible bands between two depths, by depth
//   L.bake({res (.01 m)}) -> {format:'krator-lamina-bake', W (256), rows, res, H, rate, half, data (Uint8Array W x rows x 4)}:
//              texel k is depth [k res, (k+1) res) on rows of W, rgb the mean colour (sRGB), a the local couplet's thickness
//              over 4 rate in 255ths. A shader (host/35b-core-lamina-shade.js) samples it and draws the couplets from a
//   L.shade(depth, px, bake) the shader's arithmetic in JS (px: metres a pixel spans): its colour, for a probe and Godot
//   L.export() -> {format:'krator-lamina', version:1, ...the options}: JSON;  KSTRATA.laminaLoad(json) -> L, the same column
//   KSTRATA.LAMINA {countries, marks}: the presets
// Godot: no twin yet. The export is the record; a port runs the same year walk (KRAND.hash is portable bit for bit).
(function(root){
  'use strict';
  var KS=root.KSTRATA;
  if(!KS)throw new Error('core/terrain 35b-core-lamina.js: load 35-core-strata.js first (KSTRATA)');
  function KR(){var K=root.KRAND;if(!K)throw new Error('KSTRATA.lamina: load core/rand/08-core-rand.js first');return K;}
  function d(v,x){return v==null?x:v;}
  function num(v,w){if(typeof v!=='number'||!isFinite(v))throw new Error('KSTRATA.lamina: '+w+' must be a finite number');return v;}
  function rgb(h){if(Array.isArray(h))return h.slice(0,3);var n=typeof h==='number'?h:parseInt(String(h).replace('#',''),16);
    if(!isFinite(n))throw new Error('KSTRATA.lamina: a colour is #rrggbb, a number or [r,g,b]');return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];}
  function mix(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
  function ss(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  var LAMINA={
    countries:{red:{a:'#6b2a16',b:'#1d1411',wet:'#b0623c'},white:{a:'#ece5d3',b:'#a3a88e',wet:'#fbf8ef'}},
    marks:{glass:{th:.004,colour:'#d9771f',years:1,k:1},thin:{k:.35,colour:'#2b2621',years:40,tint:.6}}};
  var MAXY=200000,SALT=0x1a7;

  function lamina(o){o=o||{};var K=KR();
    var seed=d(o.seed,0)>>>0,H=num(o.H,'H'),rate=num(d(o.rate,.0003),'rate');
    if(!(H>0))throw new Error('KSTRATA.lamina: H must be above 0');if(!(rate>0))throw new Error('KSTRATA.lamina: rate must be above 0');
    var YD=root.KCLOCK&&root.KCLOCK.YEAR?root.KCLOCK.YEAR.yearD:365,yearD=Math.round(num(d(o.yearD,YD),'yearD'));if(!(yearD>=2))throw new Error('KSTRATA.lamina: yearD must be 2 or more');
    var W=o.wet===false?null:(o.wet||{}),wa=W?Math.round(num(d(W.at,200),'wet at')):0,wd=W?Math.round(num(d(W.days,40),'wet days')):0,wk=W?num(d(W.k,2.2),'wet k'):1;
    if(W&&(wa<0||wd<1||wa+wd>yearD))throw new Error('KSTRATA.lamina: the wet season must lie inside the year (at >= 0, days >= 1, at + days <= yearD)');
    if(!(wk>0))throw new Error('KSTRATA.lamina: wet k must be above 0');
    var jit=num(d(o.jitter,.15),'jitter'),half=num(d(o.half,.5),'half'),died=num(d(o.died,0),'died');
    if(jit<0||jit>=1)throw new Error('KSTRATA.lamina: jitter is 0..1 (not 1)');if(!(half>0&&half<1))throw new Error('KSTRATA.lamina: half is between 0 and 1');
    var C=o.colours||LAMINA.countries[d(o.country,'red')];if(!C)throw new Error('KSTRATA.lamina: country is '+Object.keys(LAMINA.countries).join(' or ')+', or give colours');
    var cA=rgb(C.a),cB=rgb(C.b),cW=rgb(d(C.wet,C.a));
    var M=(o.markers||[]).map(function(m,i){var P=m.kind!=null?LAMINA.marks[m.kind]:{};if(!P)throw new Error('KSTRATA.lamina: no marker kind '+m.kind);
      var q={name:String(d(m.name,m.kind==null?'marker'+i:m.kind)),kind:d(m.kind,null),age:m.age==null?null:Math.round(num(m.age,'marker age')),depth:m.depth==null?null:num(m.depth,'marker depth'),
        years:Math.max(1,Math.round(num(d(m.years,d(P.years,1)),'marker years'))),k:num(d(m.k,d(P.k,1)),'marker k'),th:num(d(m.th,d(P.th,0)),'marker th'),
        colour:rgb(d(m.colour,d(P.colour,'#808080'))),tint:num(d(m.tint,d(P.tint,.6)),'marker tint'),start:null};
      if((q.age==null)===(q.depth==null))throw new Error('KSTRATA.lamina: a marker has age or depth (one of them)');
      if(!(q.k>0)||q.th<0)throw new Error('KSTRATA.lamina: a marker\'s k must be above 0 and its th 0 or more');
      if(q.age!=null){if(q.age<0)throw new Error('KSTRATA.lamina: a marker\'s age is 0 or more');q.start=q.age;}
      return q;});
    var dayN=(yearD-wd)+wd*wk,D=[],T=[],TH=[],KK=[],MK=[],MY=[],y=0,top=0;
    /* the walk, from the lip down: year i's band is [D[i], D[i] + T[i]) of depth; its marker layer at its base, its days above */
    while(top<H){if(y>=MAXY)throw new Error('KSTRATA.lamina: over '+MAXY+' years (H too tall for its rate)');
      var u=K.unit(K.hash(seed,y,SALT)),base=rate*dayN*(1+jit*(2*u-1)),kk=1,th=0,mk=-1,my=-1;
      for(var j=0;j<M.length;j++){var m=M[j];if(m.start==null&&m.depth<=top+base)m.start=y;
        if(m.start!=null&&y>=m.start&&y<m.start+m.years){kk*=m.k;if(m.k!==1)my=j;if(y===m.start+m.years-1&&m.th>0){th+=m.th;mk=j;}}}
      D.push(top);T.push(base*kk+th);TH.push(th);KK.push(kk);MK.push(mk);MY.push(my);top+=base*kk+th;y++;}
    var N=y;M.forEach(function(m){if(m.start==null||m.start>=N)throw new Error('KSTRATA.lamina: marker '+m.name+' starts past the foot ('+N+' years)');});
    /* a year's days, laid bottom up: dry until wet.at, the wet season, dry again; s from the band's base, past its marker layer */
    function rOf(i){return (T[i]-TH[i])/dayN;}
    function dayIn(i,s){var r=rOf(i),c1=wa*r,c2=c1+wd*r*wk,dd,ph,t;
      if(s<c1){t=r;dd=Math.floor(s/r);ph=s/r-dd;}else if(s<c2){t=r*wk;var q=(s-c1)/t;dd=wa+Math.floor(q);ph=q-Math.floor(q);}else{t=r;var q2=(s-c2)/r;dd=wa+wd+Math.floor(q2);ph=q2-Math.floor(q2);}
      if(dd>yearD-1){dd=yearD-1;ph=1-1e-9;}return {d:dd,ph:ph,t:t,wet:W?(dd>=wa&&dd<wa+wd):false};}
    function topOfDay(i,dd){var r=rOf(i),s=TH[i];if(dd<wa)return s+(dd+1)*r;if(dd<wa+wd)return s+wa*r+(dd-wa+1)*r*wk;return s+wa*r+wd*r*wk+(dd-wa-wd+1)*r;}
    var cut=D[N-1]+T[N-1]-H,f0=cut<=TH[N-1]?0:dayIn(N-1,cut-TH[N-1]).d,footDays=yearD-f0,days=(N-1)*yearD+footDays;
    function find(depth){var lo=0,hi=N-1;while(lo<hi){var mid=(lo+hi+1)>>1;if(D[mid]<=depth)lo=mid;else hi=mid-1;}return lo;}
    function at(depth,out){if(typeof depth!=='number'||!(depth>=0)||depth>H)return null;out=out||{};
      var i=find(depth),s=D[i]+T[i]-depth;out.depth=depth;out.h=H-depth;out.year=i;out.marker=null;
      if(s<TH[i]){var mm=M[MK[i]];out.layer='marker';out.marker=mm.name;out.yearDay=0;out.phase=s/TH[i];out.half='a';out.wet=false;out.thick=TH[i];out.colour=mm.colour.slice();
        out.daysAgo=died+i*yearD+yearD;out.day=days-(i*yearD+yearD);return out;}
      var q=dayIn(i,s-TH[i]);out.layer='couplet';out.yearDay=q.d;out.phase=q.ph;out.half=q.ph<half?'a':'b';out.wet=q.wet;out.thick=q.t;
      var c=out.half==='a'?(q.wet?cW:cA):cB;if(MY[i]>=0){var mz=M[MY[i]];out.marker=mz.name;c=mix(c,mz.colour,mz.tint);}out.colour=c.slice();
      var ago=i*yearD+(yearD-1-q.d);out.daysAgo=died+ago;out.day=days-1-ago;return out;}
    function depthOf(day){if(typeof day!=='number'||day<0||day>=days)return null;var ago=days-1-Math.floor(day),i=Math.floor(ago/yearD),dd=yearD-1-(ago-i*yearD);
      if(i>=N||(i===N-1&&dd<f0))return null;return Math.max(0,D[i]+T[i]-topOfDay(i,dd));}
    function atPipe(B,x,y,z){if(!B||B.kind!=='chimney')throw new Error('KSTRATA.lamina atPipe: a KSTACKS chimney record');var h;
      if(B.fall){var G=B.fall;h=(x-G.ax)*G.dx+(y-G.ay)*G.dy+(z-G.az)*G.dz;}else h=y-B.y0;return at(H-h);}
    function bands(q){q=q||{};var a=d(q.from,0),b=d(q.to,H),out=[],run=null,i0=find(Math.max(0,a)),i1=find(Math.min(H,b));
      function clip(d0,d1,o){d0=Math.max(d0,a);d1=Math.min(d1,b,H);if(d1>d0){o.d0=d0;o.d1=d1;out.push(o);}}
      for(var i=i0;i<=i1;i++){var bot=D[i]+T[i];
        if(W)clip(bot-topOfDay(i,wa+wd-1),bot-(wa>0?topOfDay(i,wa-1):TH[i]),{kind:'wet',name:null,year:i});
        if(TH[i]>0)clip(bot-TH[i],bot,{kind:'marker',name:M[MK[i]].name,year:i});
        if(MY[i]>=0){if(run&&run.m===MY[i]&&run.y1===i-1){run.d1=bot;run.y1=i;}else{if(run)clip(run.d0,run.d1,{kind:'run',name:M[run.m].name,year:run.y0});run={m:MY[i],d0:D[i],d1:bot,y0:i,y1:i};}}}
      if(run)clip(run.d0,run.d1,{kind:'run',name:M[run.m].name,year:run.y0});
      return out.sort(function(p,r){return p.d0-r.d0||(p.kind<r.kind?-1:1);});}
    function bake(q){q=q||{};var res=num(d(q.res,.01),'bake res');if(!(res>0))throw new Error('KSTRATA.lamina bake: res must be above 0');
      var Wd=256,n=Math.ceil(H/res),rows=Math.max(1,Math.ceil(n/Wd)),data=new Uint8Array(Wd*rows*4),s={},sub=4;
      for(var k=0;k<n;k++){var r=0,g=0,bb=0,tk=0,m=0;
        for(var j=0;j<sub;j++){var p=at(Math.min(H,(k+(j+.5)/sub)*res),s);if(!p)continue;r+=p.colour[0];g+=p.colour[1];bb+=p.colour[2];if(j===sub>>1)tk=p.layer==='marker'?0:p.thick;m++;}
        if(!m)continue;var o4=k*4;data[o4]=Math.round(r/m*255);data[o4+1]=Math.round(g/m*255);data[o4+2]=Math.round(bb/m*255);data[o4+3]=Math.max(0,Math.min(255,Math.round(tk/(rate*4)*255)));}
      return {format:'krator-lamina-bake',W:Wd,rows:rows,res:res,H:H,rate:rate,half:half,data:data};}
    function shade(depth,px,B){if(!B||B.format!=='krator-lamina-bake')throw new Error('KSTRATA.lamina shade: a bake');
      var k=Math.max(0,Math.min(B.W*B.rows-1,Math.floor(depth/B.res)))*4,c=[B.data[k]/255,B.data[k+1]/255,B.data[k+2]/255],t=B.data[k+3]/255*B.rate*4;
      if(!(t>0))return c;var f=depth/t-Math.floor(depth/t),cn=.35*(1-ss(.35,1,px/t)),sg=f<B.half?1:-1;
      return [Math.min(1,c[0]*(1+cn*sg)),Math.min(1,c[1]*(1+cn*sg)),Math.min(1,c[2]*(1+cn*sg))];}
    var opts={seed:seed,H:H,rate:rate,yearD:yearD,wet:W?{at:wa,days:wd,k:wk}:false,jitter:jit,half:half,colours:o.colours||null,country:o.colours?null:d(o.country,'red'),
      markers:(o.markers||[]).map(function(m){var c={};for(var k in m)c[k]=Array.isArray(m[k])?m[k].slice():m[k];return c;}),died:died};
    return {H:H,rate:rate,yearD:yearD,years:N,days:days,firstDay:f0,at:at,atPipe:atPipe,depthOf:depthOf,bands:bands,bake:bake,shade:shade,
      export:function(){return JSON.parse(JSON.stringify({format:'krator-lamina',version:1,opts:opts}));}};}
  function laminaLoad(J){if(!J||J.format!=='krator-lamina')throw new Error('KSTRATA.laminaLoad: not a krator-lamina record');
    if(J.version!==1)throw new Error('KSTRATA.laminaLoad: version '+J.version+' (1 is read)');var o=J.opts,c={};for(var k in o)if(o[k]!=null)c[k]=o[k];return lamina(c);}
  KS.lamina=lamina;KS.laminaLoad=laminaLoad;KS.LAMINA=LAMINA;
})(typeof window!=='undefined'?window:globalThis);
