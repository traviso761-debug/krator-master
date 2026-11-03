// ================================================================= CORE — glacier: a valley glacier on a heightfield world
// [G data] Plain maths of (x, z): no THREE, no DOM, no Math.random. The placement draws are core/rand's (KRAND.hash per
// kind and index, never a running stream), so a Godot port places the same seracs; the shape uses Math.exp and Math.pow,
// as the Throne's glacier did, so a port's ice is the same to a hair, not to the bit. Needs KRAND (core/rand/08-core-rand.js)
// loaded first. Opt-in: a build lists it by name. Lifted 2026-11-03 from the Throne's glacier station
// (biomes/throne/stations/glacier: its 45, 47 and 86), which takes it and draws what it drew; its drawing half is
// core/terrain/host/44h-core-glacier-draw.js ([web]). Written for Copper Glacier (biomes/copperglacier) and any cold biome.
//
// A glacier lies along an axis: u up the ice (toward its head), p across it. The host gives the shape as functions of u;
// the module gives back the ice, the trough it cut, its moraines and the proglacial lake's basin, each as a function the
// host's own ground adds or subtracts, and the things on and round the ice as records.
//
//   const G = KGLACIER.create({up, centre, W, T, snout, edge, trough, lateral, terminal, lake, seed})
//     up        [ux, uz], a unit vector up the glacier; across is [uz, -ux]; u = x*ux + z*uz (the world's origin)
//     centre    u => p, the centre line's offset across          W  u => the ice's half-width (m)
//     T         u => the ice's thickness down the middle (m); 0 past the snout is the host's (a cliff: T falls to 0 there)
//     snout     the snout's u (no ice below snout - 2)           edge  the cross-section's exponent (.62: a rounded tongue)
//     trough    {D: u => depth (m), side: [.85, 1.55] (of W, where the cut eases out), fade: [520, 60] (m above the
//               terminal moraine's back where it starts)}: the U the ice has cut
//     lateral   {h: u => crest height (m), off: 38 (m outside the ice's edge), w: 26 (m), end: [u1, u0] (the crest fades out
//               up the ice between them), start: [-10, 40] (m from the terminal arc)}
//     terminal  {back: 440 (m below the snout), bend: 80 (m: its middle farthest down), breach: 70 (m across, where the river
//               leaves), h: 20 (m), w: 42 (m), fade: [1.5, 2.0] (of the snout's W), gap: .92, gapW: 24 (m)}
//     lake      {in: [15, 70] (m above the terminal arc), out: [260, 60] (m above the snout), side: [.8, 1.2] (of W)}, or null:
//               no lake (a snout that ends on its outwash)
//   G.uOf(x,z) G.pOf(x,z) G.at(u,p)->[x,z]   the frame
//   G.iceAt(x,z)           the ice's thickness (m) over the bed
//   G.trough(u,a)          metres the ice has cut (a = p - centre(u))   G.moraine(u,p,a)  metres of moraine
//   G.termU(p)             the terminal moraine's crest line            G.lakeK(u,p,a)    0..1 in the lake's basin
//   G.lakeAt(x,z)          the same by (x, z)                           G.TERM            {p0, W0, u0, bend, breach, h}
//   G.bed(x,z,h)           h less the trough, plus the moraines, less 9 m of lake basin: the Throne's order, for a host
//                          that wants all three (the Throne writes them out in its own bedH)
//   G.records()            the glacier and everything placed on it as records {class:'feature', kind, id, x, z, ...}
//
// Placement (KRAND, per kind and index; each returns records and keeps them for G.records()):
//   G.seracs({u:[u0,u1], du:14, across:.84, step:.045, skip:.35, s:[4,11], minIce:8, max})     the icefall's blocks
//   G.bergs({level, n:16, u:[snout-160, snout-10], s:[2,7], ok:(x,z)=>bool})                     calved into the lake
//   G.crevasses({u:[u0,u1], du:22, across:.8, len:[18,60], w:[1.2,3.5], skip:.3})                 split across the ice
//   G.caves(list, {floor:(x,z)=>h})   ice caves from specs {x, z, R, H, face, mouth, name}; each a record with its floor
//   KGLACIER.version
(function(root){
  'use strict';
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;
  const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};   // core/biome's smooth, so a host's numbers stay its own
  const pick=(o,k,d)=>o&&o[k]!=null?o[k]:d;
  const SALT={serac:101,berg:102,crevasse:103,cave:104};
  function create(o){
    if(!o||!o.up||!o.centre||!o.W||!o.T)throw new Error('KGLACIER.create: up, centre, W and T are required');
    const ux=o.up[0],uz=o.up[1],px=uz,pz=-ux,seed=o.seed==null?1:o.seed>>>0;
    const uOf=(x,z)=>x*ux+z*uz,pOf=(x,z)=>x*px+z*pz,at=(u,p)=>[ux*u+px*p,uz*u+pz*p];
    const pg=o.centre,W=o.W,T=o.T,SNOUT=o.snout==null?0:o.snout,EDGE=o.edge==null?.62:o.edge;
    const tr=o.trough||null,la=o.lateral||null,te=o.terminal||null,lk=o.lake===undefined?{}:o.lake;
    const TERM=(function(){const p0=pg(SNOUT),W0=W(SNOUT);return{p0,W0,u0:SNOUT-pick(te,'back',440),bend:pick(te,'bend',80),breach:p0+pick(te,'breach',70),h:te?pick(te,'h',20):0};})();
    const termU=p=>TERM.u0+TERM.bend*Math.pow((p-TERM.p0)/TERM.W0,2);
    function iceAt(x,z){const u=uOf(x,z);if(u<SNOUT-2)return 0;const a=pOf(x,z)-pg(u),w=W(u),t=1-Math.pow(a/w,2);return t<=0?0:T(u)*Math.pow(t,EDGE);}
    const TS=pick(tr,'side',[.85,1.55]),TF=pick(tr,'fade',[520,60]);
    function trough(u,a){if(!tr)return 0;const w=W(u);return tr.D(u)*(1-smooth(w*TS[0],w*TS[1],Math.abs(a)))*smooth(TERM.u0-TF[0],TERM.u0-TF[1],u);}
    const LO=pick(la,'off',38),LW=pick(la,'w',26),LE=pick(la,'end',[1e9,1e9]),LS=pick(la,'start',[-10,40]);
    const TW=pick(te,'w',42),TFd=pick(te,'fade',[1.5,2.0]),TG=pick(te,'gap',.92),TGW=pick(te,'gapW',24);
    function moraine(u,p,a){const w=W(u),aa=Math.abs(a),tu=termU(p);
      const lat=la?la.h(u)*Math.exp(-Math.pow((aa-w-LO)/LW,2))*smooth(LE[0],LE[1],u)*smooth(tu+LS[0],tu+LS[1],u):0;
      const term=te?TERM.h*Math.exp(-Math.pow((u-tu)/TW,2))*(1-smooth(TERM.W0*TFd[0],TERM.W0*TFd[1],Math.abs(p-TERM.p0)))*(1-TG*Math.exp(-Math.pow((p-TERM.breach)/TGW,2))):0;
      return Math.max(lat,term);}
    const KI=pick(lk,'in',[15,70]),KO=pick(lk,'out',[260,60]),KS=pick(lk,'side',[.8,1.2]);
    const lakeK=(u,p,a)=>lk?smooth(termU(p)+KI[0],termU(p)+KI[1],u)*smooth(SNOUT+KO[0],SNOUT+KO[1],u)*(1-smooth(W(u)*KS[0],W(u)*KS[1],Math.abs(a))):0;
    const lakeAt=(x,z)=>{const u=uOf(x,z),p=pOf(x,z);return lakeK(u,p,p-pg(u));};
    function bed(x,z,h){const u=uOf(x,z),p=pOf(x,z),a=p-pg(u);return h-trough(u,a)+moraine(u,p,a)-9*lakeK(u,p,a);}
    const placed={serac:[],berg:[],crevasse:[],cave:[]};
    const U=(kind,i,k)=>KRAND.unit(KRAND.hash(seed,SALT[kind],i,k));
    const R=(kind,i,k,a,b)=>a+(b-a)*U(kind,i,k);
    // the icefall's seracs: rows up the ice every du, cells across every step (of W), a cell skipped by chance; each block
    // jittered in its cell, sized smaller toward the margins, kept where the ice is at least minIce thick
    function seracs(s){s=s||{};const u0=s.u[0],u1=s.u[1],du=pick(s,'du',14),ac=pick(s,'across',.84),st=pick(s,'step',.045),sk=pick(s,'skip',.35),S=pick(s,'s',[4,11]),mi=pick(s,'minIce',8),max=pick(s,'max',1e9),out=[];
      for(let r=0;u0+r*du<u1&&out.length<max;r++)for(let c=0;-ac+c*st<ac&&out.length<max;c++){const i=r*4096+c;if(U('serac',i,0)<sk)continue;
        const u=u0+r*du+R('serac',i,1,-.4,.4)*du,aw=-ac+(c+R('serac',i,2,.1,.9))*st,xz=at(u,pg(u)+aw*W(u));if(iceAt(xz[0],xz[1])<mi)continue;
        const sz=R('serac',i,3,S[0],S[1])*(1-.4*Math.abs(aw));
        out.push({class:'feature',kind:'serac',id:'serac-'+i,x:xz[0],z:xz[1],s:sz,h:sz*R('serac',i,4,.8,1.8),d:sz*R('serac',i,5,.5,.9),yaw:R('serac',i,6,-.35,.35),tilt:[R('serac',i,7,-.12,.12),R('serac',i,8,-.45,.15)]});}
      placed.serac.push(...out);return out;}
    // icebergs calved from the snout, floating near it where ok(x,z) says the lake is deep enough
    function bergs(s){s=s||{};const n=pick(s,'n',16),uu=pick(s,'u',[SNOUT-160,SNOUT-10]),S=pick(s,'s',[2,7]),ok=s.ok||(()=>true),out=[];
      for(let i=0;i<n*25&&out.length<n;i++){const u=R('berg',i,0,uu[0],uu[1]),p=TERM.p0+R('berg',i,1,-.8,.8)*TERM.W0,xz=at(u,p);if(lakeAt(xz[0],xz[1])<.6||!ok(xz[0],xz[1]))continue;
        const sz=R('berg',i,2,S[0],S[1]);out.push({class:'feature',kind:'berg',id:'berg-'+i,x:xz[0],z:xz[1],y:s.level,s:sz,h:sz*R('berg',i,3,.5,.9),d:sz*R('berg',i,4,.6,1),yaw:R('berg',i,5,0,6.2831853),tilt:[R('berg',i,6,-.3,.3),R('berg',i,7,-.3,.3)]});}
      placed.berg.push(...out);return out;}
    // crevasses: slots across the ice (transverse, where it stretches over a steepening), a row every du, staggered
    function crevasses(s){s=s||{};const u0=s.u[0],u1=s.u[1],du=pick(s,'du',22),ac=pick(s,'across',.8),L=pick(s,'len',[18,60]),Wd=pick(s,'w',[1.2,3.5]),sk=pick(s,'skip',.3),out=[];
      for(let r=0;u0+r*du<u1;r++){let aw=-ac+R('crevasse',r*256,0,0,.2);for(let c=0;aw<ac;c++){const i=r*256+c+1,len=R('crevasse',i,1,L[0],L[1]),wa=len/(2*W(u0+r*du));
        if(U('crevasse',i,2)>=sk){const u=u0+r*du+R('crevasse',i,3,-.3,.3)*du,mid=aw+wa,xz=at(u,pg(u)+mid*W(u));if(iceAt(xz[0],xz[1])>6)out.push({class:'feature',kind:'crevasse',id:'crevasse-'+i,x:xz[0],z:xz[1],len,w:R('crevasse',i,4,Wd[0],Wd[1]),u,a:mid,yaw:R('crevasse',i,5,-.12,.12)});}
        aw+=2*wa+R('crevasse',i,6,.02,.08);}}
      placed.crevasse.push(...out);return out;}
    // ice caves from the host's specs: each its floor (the ground's height at its middle) and a record
    function caves(list,s){const fl=s&&s.floor;const out=list.map((C,k)=>Object.assign({class:'feature',kind:'icecave',id:C.id||('icecave-'+k),mouth:.36,face:0},C,{floor:C.floor!=null?C.floor:fl?fl(C.x,C.z):0}));placed.cave.push(...out);return out;}
    function records(){const r=[{class:'feature',kind:'glacier',id:'glacier',up:[ux,uz],snout:SNOUT,term:Object.assign({},TERM)}];
      for(const k of ['serac','berg','crevasse','cave'])r.push(...placed[k]);return r;}
    return{uOf,pOf,at,iceAt,trough,moraine,termU,lakeK,lakeAt,bed,TERM,SNOUT,centre:pg,W,T,seracs,bergs,crevasses,caves,records,placed};}
  root.KGLACIER={create,smooth,version:1};
})(typeof window!=='undefined'?window:globalThis);
