// ================================================================= LINE — the one record: the Rift line as KTRANSIT.line, and each station's window of it  [G data]
// biomes/line/PLAN.md section 4. One record for the whole line (kits/ancient-transit/src/43c-tr-line.js, the `line` kind): the bore from the
// north portal (s 0) to the south portal (s 304000) and the run on at grade toward Ledge (to s 346000), straight along z with x across (the
// pages' frame: a station's z is s - SITE.s0), its forms, its tracks' states by chainage, the splays where the tracks part round an island
// platform or into twin bores, the crossovers, the stations, the doors. Every station page takes its window (KTRANSIT.lineWindow) and reads its
// tracks' runs, their offsets and its crossovers from it, so the seven pages are windows of the same line and Godot reads the same record.
// The pages still draw their window flat (the invert at y 0): the record's heights (the bore's -0.04 % grade) are not drawn.
//   RIFT.line                  the record (LN)
//   RIFT.window(S0, WIN)       -> {W (the lineWindow), local (it again in the page's frame, flat: what the page draws), cond (by track: [{s0, s1, state, depth?}] in chainage, as the pages keep it),
//                                  trackX(id, z) (the page's z), crossovers ([{id, a, b, z0, z1, state}] in the page's z), gaps, segments}
const RIFT=(function(){const T=KTRANSIT,SEC=LK.SEC,nom={};SEC.tracks.forEach(t=>nom[t.id]=t.x);
 const sm=LK.sm;
 /* THE SPLAYS: a zone from s0 to s1 shifts each track by d, ramped over `ramp` m at each end (smoothstep; 0: a step) */
 const SPLAYS=[
  {why:'the Twenny junction: the tracks part round the island platform (station 3)',s0:217920,s1:218380,ramp:80,d:{t1:2.9,t2:2.9,t3:-2.9,t4:-2.9}},
  {why:'the fault: the junction hall into the twin bores (station 6), rejoining by km 46.9',s0:44170,s1:46880,ramp:80,d:{t1:5,t2:5,t3:-5,t4:-5}},
  {why:'the fault: the slump\'s offset of the east bore',s0:44620,s1:46800,ramp:0,d:{t1:3,t2:3}}];
 const share=(Z,s)=>{if(!(s>=Z.s0)||s>=Z.s1)return 0;if(!(Z.ramp>0))return 1;return s<Z.s0+Z.ramp?sm((s-Z.s0)/Z.ramp):s>Z.s1-Z.ramp?sm((Z.s1-s)/Z.ramp):1;};
 const offAt=(id,s)=>{let x=nom[id];for(const Z of SPLAYS)if(Z.d[id])x+=Z.d[id]*share(Z,s);return x;};
 /* THE TRACKS' STATES by chainage (the line's default kept): each station's own, painted in order */
 const all=['t1','t2','t3','t4'],east=['t1','t2'];
 const cond=[
  {s0:55061.2,s1:202938.8,track:'*',state:'built',why:'the hot section, behind its doors: the Ancients\' finish (station 4)'},
  {s0:44260,s1:44605,track:east,state:'worn',why:'the east bore past the junction (station 6)'},{s0:44605,s1:44635,track:east,state:'cut',why:'the slump fault'},
  {s0:44635,s1:44700,track:east,state:'worn'},{s0:44700,s1:44800,track:east,state:'flooded',depth:.9,why:'the low point'},{s0:44800,s1:46880,track:east,state:'worn'},
  {s0:208695,s1:208725,track:'t1',state:'blocked',why:'the Fixers\' work train at the vein (station 1)'},
  {s0:236170,s1:236712,track:'*',state:'cut',why:'G2: the gallery fallen into the hypogene chamber (station 2)'},
  {s0:303762,s1:303838,track:'*',state:'worn',why:'the fallen stretch under the sky (station 7)'}];
 const line=T.line({id:'rift',pts:[[0,3614,0],[0,3501,304000],[0,3400,346000]],section:T.LINE_SEC,tracks:SEC.tracks.map(t=>({id:t.id,off:t.x})),offAt:(id,s)=>offAt(id,s),
  state:'kept',cond,nicheStep:50,nicheSide:1,furniture:false,
  forms:[{s0:0,s1:44150,kind:'gallery'},{s0:44150,s1:44260,kind:'junction'},{s0:44260,s1:46880,kind:'twin'},{s0:46880,s1:217920,kind:'gallery'},{s0:217920,s1:218380,kind:'junction'},
   {s0:218380,s1:270000,kind:'gallery'},{s0:270000,s1:304062,kind:'shallow'},{s0:304062,s1:346000,kind:'open'}],
  crossovers:[{s:44100,a:'t1',b:'t2',len:80,state:'kept'},{s:44200,a:'t2',b:'t3',len:80,state:'kept'},{s:208360,a:'t2',b:'t3',len:120,state:'kept'},{s:235880,a:'t1',b:'t2',len:120,state:'kept'}],
  stations:[{num:3,s:218150,len:460,kind:'station',state:'kept',name:'the Twenny junction'},{num:2,s:235880,len:300,kind:'gap',state:'kept',name:'the gap station (the long run\'s last platform)'}],
  doors:[{s:54800,kind:'hot',state:'shut'},{s:55060,kind:'hot',state:'shut'}],
  shafts:[{s:218240,side:-1,off:-22,r:3.5,kind:'air',state:'open',road:{id:'dalab-ledge',d:34000,reach:false},hidden:true}],
  branches:[{s:218111,side:1,to:'Loj Twenny',w:8}]});
 const snap=v=>Math.round(v*1e6)/1e6;
 function windowOf(S0,WIN){const a=S0+WIN.z0,b=S0+WIN.z1,W=T.lineWindow(line,a,b),cond={};
  W.tracks.forEach(t=>cond[t.id]=W.cond[t.id].map(r=>Object.assign({s0:snap(r.s0+a),s1:snap(r.s1+a),state:r.state},r.state==='flooded'?{depth:r.depth}:{})));
  /* the window again in the page's own frame (straight along z from WIN.z0, the invert flat at y 0): what the pages draw through KTRANSIT.draw.line */
  const local=T.line({id:W.id,seed:W.seed,base:W.base,pts:[[0,0,WIN.z0],[0,0,WIN.z1]],section:W.sec,tracks:W.tracks.map(t=>({id:t.id,off:t.off})),offAt:(tid,s)=>W.offAt(tid,s),state:'kept',
   cond:[].concat(...W.tracks.map(t=>W.cond[t.id].map(r=>({s0:r.s0,s1:r.s1,track:t.id,state:r.state,depth:r.depth})))),forms:W.forms.map(F=>({s0:F.s0,s1:F.s1,kind:F.kind})),
   sectionStates:W.sections.reduce((m,x)=>{m[x.id]=x.state;return m;},{}),crossovers:W.crossovers.map(X=>({id:X.id,s:X.s,a:X.a,b:X.b,len:X.len,dir:X.dir,state:X.state})),nicheStep:0,furniture:false});
  return {W,local,cond,trackX:(id,z)=>z==null?nom[id]:W.offAt(id,z-WIN.z0),   /* a track named without a z: its nominal offset (a straight window's) */
  
   crossovers:W.crossovers.map(X=>({id:'line.xo.'+Math.round(X.s0+a),a:X.a,b:X.b,z0:snap(X.s0+a-S0),z1:snap(X.s1+a-S0),state:X.state})),
   gaps:W.gaps.map(g=>({id:g.id,s0:snap(g.s0+a),s1:snap(g.s1+a),kind:g.kind})),segments:W.segments.map(g=>({id:g.id,s0:snap(g.s0+a),s1:snap(g.s1+a)}))};}
 return {line,window:windowOf,SPLAYS,offAt};
})();
