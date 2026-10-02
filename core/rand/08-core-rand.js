// ================================================================= CORE — rand: one generator, one hash, one noise
// GODOT-PLAN.md Phase 2, item 1. Every number here is reproducible bit for bit in GDScript (krand.gd beside this
// file) because nothing in it calls Math.sin, Math.pow or any other library function whose last bits differ by
// engine: the stream and the hash are 32-bit integer arithmetic, and the noise is +, -, *, / and floor on doubles,
// in a fixed order. golden.json holds the vectors both engines are tested against (test-rand.js, test_rand.py).
//
//   KRAND.stream(seed)             a mulberry32 stream: the SAME numbers as the rng()/reseed() every Krator lineage
//                                  already uses (kits/ancients 10-core.js, core/biome 10-core-head.js), so a build
//                                  that moves its draws onto a stream moves no rubble
//     s.next()  [0,1)   s.u32()  integer   s.range(a,b)   s.int(a,b) inclusive   s.pick(arr)   s.chance(p)
//     s.state() / s.setState(u32)          for saving and resuming a stream
//   KRAND.hash(seed, a, b, c...)   u32 from a seed and any number of int32 values (floats are floored first)
//   KRAND.unit(u32)                [0,1)
//   KRAND.h3(x,y,z, seed)          [0,1) at an integer lattice point: the portable replacement for the lineages'
//                                  sin-based h3 (which a GDScript port cannot reproduce). Floats are floored.
//   KRAND.vnoise(x,y,z, seed)      value noise in [0,1]: the lineages' vnoise (smoothstep trilinear) on h3 above
//   KRAND.fbm(x,y,z, octaves, seed)  the lineages' fbm (octaves default 3, frequency x2.03, amplitude 1/f)
//   KRAND.cell(seed, ix, iz)       a seed for one placement cell, so a tile built alone draws what it draws in a
//                                  full build (biomes/WORLD.md: placement seeded by cell)
//   KRAND.child(seed, name)        a seed for a named sub-stream ('trees', 'rubble'...), no collisions to manage
//
// Ranges: lattice coordinates and hash inputs are int32 (|x| < 2^31). Seeds are taken as u32 (seed>>>0).
// The noise of a NEW seed is not the old sin-based noise: moving a build's terrain or textures onto it moves them
// (GODOT-PLAN.md section 7, "Moving rubble": one build at a time, with a screenshot set).
(function(root){
  'use strict';
  var imul=Math.imul;
  // murmur3's 32-bit finalizer: full avalanche
  function mix32(h){h^=h>>>16;h=imul(h,0x85ebca6b);h^=h>>>13;h=imul(h,0xc2b2ae35);h^=h>>>16;return h>>>0;}
  function step(h,v){h=imul(h^(v|0),0x9E3779B1);return (h<<13|h>>>19);}
  function hash(seed){var h=(seed>>>0)^0x2545F491,n=arguments.length-1;
    for(var i=1;i<=n;i++)h=step(h,Math.floor(arguments[i]));
    return mix32(h^n);}
  function hash3(seed,a,b,c){return mix32(step(step(step((seed>>>0)^0x2545F491,a),b),c)^3);}  // hash(seed,a,b,c), unrolled
  var INV=1/4294967296;
  function unit(u){return (u>>>0)*INV;}
  function h3(x,y,z,seed){return hash3(seed||0,Math.floor(x),Math.floor(y),Math.floor(z))*INV;}
  function vnoise(x,y,z,seed){seed=seed||0;
    var xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
    var u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),w=zf*zf*(3-2*zf);
    var a0=hash3(seed,xi,yi,zi)*INV,a1=hash3(seed,xi+1,yi,zi)*INV,b0=hash3(seed,xi,yi+1,zi)*INV,b1=hash3(seed,xi+1,yi+1,zi)*INV,
        c0=hash3(seed,xi,yi,zi+1)*INV,c1=hash3(seed,xi+1,yi,zi+1)*INV,d0=hash3(seed,xi,yi+1,zi+1)*INV,d1=hash3(seed,xi+1,yi+1,zi+1)*INV;
    var a=a0+(a1-a0)*u,b=b0+(b1-b0)*u,c=c0+(c1-c0)*u,d=d0+(d1-d0)*u;
    var e=a+(b-a)*v,f=c+(d-c)*v;return e+(f-e)*w;}
  function fbm(x,y,z,o,seed){o=o||3;var a=0,f=1,s=0;for(var i=0;i<o;i++){a+=vnoise(x*f,y*f,z*f,seed)/f;s+=1/f;f*=2.03;}return a/s;}
  function cell(seed,ix,iz){return hash3(seed,ix,iz,0x51ED);}
  function child(seed,name){var h=0x811C9DC5;name=String(name);   // FNV-1a over UTF-16 code units, then mixed with the seed
    for(var i=0;i<name.length;i++)h=imul(h^name.charCodeAt(i),0x01000193);
    return hash(seed,h|0);}
  function stream(seed){
    var s=seed>>>0;
    function u32(){s|=0;s=s+0x6D2B79F5|0;var t=imul(s^s>>>15,1|s);t=t+imul(t^t>>>7,61|t)^t;return (t^t>>>14)>>>0;}
    function next(){return u32()*INV;}
    return {next:next,u32:u32,
      range:function(a,b){return a+(b-a)*next();},
      int:function(a,b){return a+Math.floor(next()*(b-a+1));},
      pick:function(arr){return arr[Math.floor(next()*arr.length)%arr.length];},
      chance:function(p){return next()<p;},
      state:function(){return s>>>0;},setState:function(v){s=v>>>0;}};
  }
  root.KRAND={version:1,stream:stream,hash:hash,unit:unit,h3:h3,vnoise:vnoise,fbm:fbm,cell:cell,child:child,mix32:mix32};
})(typeof window!=='undefined'?window:globalThis);
