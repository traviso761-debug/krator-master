// ================================================================= CORE — the breath's turn: a yaw on its own scalar (BIO.animHook, breath.turn)  [G shader]
// The Hearths' section 14 item 3 (2026-11-03): the Stills' sails stand across the sea wind and edge-on to the sun, and turn with it
// through the day, while the same sails fold shut on a geyser's warning: two scalars on one item. 35-core-anim.js's breath has one
// (fold, bulge or stream). This file adds a yaw about the item's own y axis through its origin (the stalk), on a second key, with
// the normals turned too (fold's stay put). Opt-in: load it after 35-core-anim.js; a material that asks for no turn gets the
// hook's text unchanged, character for character (test-breath-turn.js holds it).
//   o.breath.turn {key ('breath'), amp (radians at a full state: 2 pi), share (false: aP0.w scales it, as the breath's own amp)}
//                 the yaw is uTurn x amp (x aP0.w when share) + aP1.y, aP1.y the item's own heading in radians (0 when unset)
//   o.breath.shape 'turn'  the yaw IS the breath: breath.key and breath.amp drive it, and nothing else moves (no breath.turn then)
// One tick: BIO.breathState(turn.key).value = yaw / amp (the Stills: the sun's bearing across the wind, from ATMOS.windAt and
// the sky). Godot: a second global shader parameter per key and the same rotation of VERTEX.xz and NORMAL.xz.
(function(){
 'use strict';
 if(typeof BIO==='undefined'||!BIO.animHook)throw new Error('core/biome 35b-core-anim-turn.js: load 35-core-anim.js first (BIO.animHook)');
 if(BIO.animHook._turn)return;
 const hook0=BIO.animHook,bf=v=>(+v).toFixed(4);
 const need=(s,m,w)=>{if(s.indexOf(m)<0)throw new Error('BIO.animHook: breath.turn needs '+w+' in the vertex shader');};
 BIO.animHook=function(o){o=o||{};const br=(o.mode||'orbit')==='breath'?(o.breath||null):null;
  if(!br||(br.shape!=='turn'&&br.turn==null))return hook0(o);
  if(br.shape==='turn'&&br.turn!=null)throw new Error('BIO.animHook: breath.shape turn is driven by breath.key and breath.amp: give no breath.turn');
  const T=br.shape==='turn'?{key:br.key,amp:br.amp}:br.turn;
  if(typeof T!=='object')throw new Error('BIO.animHook: breath.turn is {key, amp, share}');
  const amp=T.amp==null?2*Math.PI:+T.amp;if(!isFinite(amp))throw new Error('BIO.animHook: breath.turn amp must be a finite number');
  const b2=Object.assign({},br);delete b2.turn;if(br.shape==='turn'){b2.shape='bulge';b2.amp=0;}
  const f=hook0(Object.assign({},o,{breath:b2})),A='(uTurn*'+bf(amp)+(T.share?'*aP0.w':'')+'+aP1.y)';
  const rot=v=>' { float _ta='+A+', _tc=cos(_ta), _tn=sin(_ta); '+v+'.xz = vec2(_tc*'+v+'.x+_tn*'+v+'.z, -_tn*'+v+'.x+_tc*'+v+'.z); }';
  const h=function(sh){f(sh);sh.uniforms.uTurn=BIO.breathState(T.key);const v=sh.vertexShader;
   need(v,'uniform float uBreath;','the breath hook');need(v,'mat3 _M; vec3 _P; _anim(_M,_P);','the breath hook');need(v,'#include <beginnormal_vertex>','beginnormal');
   sh.vertexShader=v.replace('uniform float uBreath;','uniform float uBreath;\nuniform float uTurn;')
    .replace('mat3 _M; vec3 _P; _anim(_M,_P);',rot('transformed')+'\nmat3 _M; vec3 _P; _anim(_M,_P);')
    .replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\n'+rot('objectNormal'));};
  return h;};
 BIO.animHook._turn=true;
})();
