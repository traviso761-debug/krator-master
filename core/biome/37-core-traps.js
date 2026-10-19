// ================================================================= CORE — traps (the carnivorous plants' rules)  [G data]
// A carnivorous plant is FLORA that carries a trap record (biomes/necanyons/PLAN.md section 4): it is drawn and placed by
// its biome kit like any plant, registered in core/tags as class 'flora' with `tags.trap`, and these few pure functions say
// what a trap is doing at a time and what it can catch. The same functions run in a page, in node and (ported) in Godot;
// the shader that moves a trap on the page uses KTRAPS.GLSL, the same arithmetic. Korona's man-eaters are the same records
// with danger above 0 and the kinds 'snare' and 'grab'.
//
// No THREE, no DOM. A trap's place in its cycle is a hash of its id (core/rand), never a random draw.
//
//   a trap record (tags.trap): {kind, mouth (m: the opening), preyMax ('insect'|'small'|'medium'|'large'|'person'),
//        cycle:{wait (s, open and waiting), shut (s, the closing), digest (s), reopen (s)}, lure ('nectar'|'scent'|
//        'glow'|'uv'|'dew'|null), danger (0: harmless to a person .. 1: kills), moves (from the kind)}
//   KTRAPS.KINDS        {kind: {moves, what}}          KTRAPS.SIZES  ['insect','small','medium','large','person']
//   KTRAPS.make(o)      a checked record with the kind's defaults (throws on an unknown kind or prey class)
//   KTRAPS.sizeOf(prey) a prey's class: from a fauna entry ({size:{length}, data:{mass}}), {mass} (kg), or a class name
//   KTRAPS.state(trap, t, id, speed)   {state:'open'|'shutting'|'shut'|'opening', k (0 open .. 1 shut)} at world time t (s);
//                       speed (1) compresses the slow phases (wait, digest, reopen) for a page, never the shutting
//   KTRAPS.catches(trap, prey)   {caught, harm (0..1), pinch (a snap trap a hand fits in shuts on it, and lets go)}
//   KTRAPS.phase(id)    the trap's offset into its cycle, [0,1), from KRAND.hash of its id
//   KTRAPS.GLSL         float ktrapK(float t, vec4 cyc, float phase): k as KTRAPS.state computes it (cyc the four phases,
//                       the slow three already divided by the speed)
(function(root){
  'use strict';
  var KR=root.KRAND;
  if(!KR) throw new Error('37-core-traps: load core/rand/08-core-rand.js first');
  var KINDS={
    pitfall:{moves:false,what:'a pitcher: prey slips on the rim into the fluid'},
    tank:{moves:false,what:'a tube of leaves holding water: prey drowns'},
    flypaper:{moves:true,what:'sticky glands: the leaf curls over what it holds, slowly'},
    snap:{moves:true,what:'two lobes that shut when the trigger hairs are touched twice'},
    suction:{moves:true,what:'bladders under water that suck in what brushes their hairs'},
    snare:{moves:true,what:'(Korona) a noose of leaves or tendrils'},
    grab:{moves:true,what:'(Korona) a limb that reaches and holds'}};
  var SIZES=['insect','small','medium','large','person'];
  var DEF={pitfall:{wait:0,shut:0,digest:0,reopen:0},tank:{wait:0,shut:0,digest:0,reopen:0},
    flypaper:{wait:3600,shut:900,digest:172800,reopen:3600},snap:{wait:1209600,shut:.3,digest:604800,reopen:43200},
    suction:{wait:600,shut:.002,digest:3600,reopen:1800},snare:{wait:3600,shut:1,digest:259200,reopen:7200},grab:{wait:600,shut:1.5,digest:86400,reopen:600}};
  function make(o){if(!o||!KINDS[o.kind])throw new Error('KTRAPS.make: unknown kind '+(o&&o.kind));
    var pm=o.preyMax==null?'insect':o.preyMax;if(SIZES.indexOf(pm)<0)throw new Error('KTRAPS.make: unknown prey class '+pm);
    var d=DEF[o.kind],c=o.cycle||{},cyc={};['wait','shut','digest','reopen'].forEach(function(k){cyc[k]=c[k]==null?d[k]:c[k];});
    return {kind:o.kind,mouth:o.mouth==null?.05:o.mouth,preyMax:pm,cycle:cyc,lure:o.lure==null?null:o.lure,
      danger:o.danger==null?0:o.danger,moves:KINDS[o.kind].moves};}
  // a fauna entry (kits/fauna: size.length m, data.mass kg), {mass}, {length}, or a class name
  function sizeOf(p){if(typeof p==='string'){if(SIZES.indexOf(p)<0)throw new Error('KTRAPS.sizeOf: unknown class '+p);return p;}
    var m=p&&(p.mass!=null?p.mass:p.data&&p.data.mass),L=p&&(p.length!=null?p.length:p.size&&p.size.length);
    if(m==null&&L==null)throw new Error('KTRAPS.sizeOf: a prey needs a mass or a length');
    if(m==null)m=L<.08?.01:L<.3?.3:L<1?5:50;
    return m<=.05?'insect':m<=.6?'small':m<=8?'medium':'large';}
  function phase(id){return KR.hash(0x7A9,String(id).length,KR.child(5,String(id)))/4294967296;}
  // the cycle: open and waiting, shutting, shut (digesting), opening; the slow phases divided by speed
  function state(tr,t,id,speed){if(!tr.moves)return {state:'open',k:0};speed=speed==null?1:speed;var c=tr.cycle;
    var w=c.wait/speed,s=c.shut,d=c.digest/speed,r=c.reopen/speed,L=w+s+d+r;if(!(L>0))return {state:'open',k:0};
    var u=t+phase(id)*L;u-=Math.floor(u/L)*L;
    if(u<w)return {state:'open',k:0};u-=w;
    if(u<s)return {state:'shutting',k:u/s};u-=s;
    if(u<d)return {state:'shut',k:1};u-=d;
    return {state:'opening',k:1-u/r};}
  function catches(tr,prey){var c=sizeOf(prey),rk=SIZES.indexOf(c),mx=SIZES.indexOf(tr.preyMax);
    var person=c==='person',pinch=person&&tr.kind==='snap'&&tr.mouth>=.2;
    if(person)return {caught:tr.danger>0&&mx>=rk,harm:tr.danger,pinch:pinch};
    return {caught:rk<=mx,harm:0,pinch:false};}
  // the same arithmetic as state(): cyc = (wait, shut, digest, reopen) already divided by the page's speed (not shut)
  var GLSL='float ktrapK(float t,vec4 cyc,float phase){float L=cyc.x+cyc.y+cyc.z+cyc.w;if(L<=0.0)return 0.0;'+
    'float u=mod(t+phase*L,L);if(u<cyc.x)return 0.0;u-=cyc.x;if(u<cyc.y)return u/cyc.y;u-=cyc.y;if(u<cyc.z)return 1.0;u-=cyc.z;return 1.0-u/cyc.w;}';
  root.KTRAPS={KINDS:KINDS,SIZES:SIZES,make:make,sizeOf:sizeOf,state:state,catches:catches,phase:phase,GLSL:GLSL};
  if(root.BIO)root.BIO.traps=root.KTRAPS;
})(typeof globalThis!=='undefined'?globalThis:this);
