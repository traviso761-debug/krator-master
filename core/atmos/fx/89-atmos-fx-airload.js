// ================================================================= ATMOS — fx: the air's load (dust, ash, caustic alkali) and what it lets one see
// [G data] + [web] (the owner, 2026-10-26, through core/hazard: "provide KHAZ's dust, ash, alkali and visibility fields from
// its dust weather, the Throne's ash and the Catch's black storms"). What the weather puts in the air, in mg/m3, at any
// point and time, for core/hazard's ambient bridge (KHAZ.provide), and the page's fog driven by the same numbers, so a
// 57 m sight in KHAZ.sight is a 57 m wall on screen:
//   DUST     clean air (PRESETS.airload.clean), plus the wind's own dust off bare ground (the dust module's lift, 0..1, from
//            the wind there and the page's dust mask: the sprites the page draws), dust mg/m3 at full lift, thinning above the
//            ground over dustH metres; plus a STORM (the Catch's karaburan, a black storm: S.storm 0..1, the page sets when),
//            storm mg/m3 at full, carried from upwind: over its own bare ground or what lies `fetch` metres up the wind,
//            stormFloor of it over anything else, thinning over stormH metres up (a wall a few hundred metres to a km high)
//   ASH      the weather's ash (W.ash: ashfall .35, the ash storm 1) x ash mg/m3, x o.ashAt(x, z) (under the plume: the Throne),
//            thinning over ashH metres up
//   ALKALI   the share of the dust that is caustic salt: o.alkali(x, z) where it lifts (the dry soda lake beds high, sand low);
//            the storm's share is the share where it was lifted (upwind), the local dust's where it lifts, weighted by load
//   SIGHT    Chepil and Woodruff (1957), core/hazard's VOCAB.dustSight: V km = (c / C)^(1/p), C = dust + ash. The page's fog
//            becomes the density whose fog at V metres leaves the contrast threshold (2%: Koschmieder), when that is thicker
//            than the page's own, tinted toward the dust's (or the ash's) colour by the share it adds
//   VISIBILITY  (a KHAZ field, only what the fog itself allows): the page's fog (its density, the height fog's falloff and
//            mist) and the fog belt at the point, as a range
//   ATMOS.airAt(S, x, y, z, lift)    {dust, ash, alkali} (pure: S is the record, lift the dust module's 0..1 at the point)
//   ATMOS.dustSightM(C, S)           metres one sees through C mg/m3 (pure; S {c, p}: KHAZ's VOCAB.dustSight when present)
//   ATMOS.sightFog(V, shape)         the FogExp2 (shape 'exp2') or exponential ('exp') density whose fog at V m leaves 2%
//   ATMOS.airLoad(o) -> S            the host: o {dust, storm (mg/m3 at full), alkali (x, z) -> 0..1, ashAt (x, z) -> 0..1,
//                                    ash (mg/m3 at W.ash 1), mask (x, z) -> 0..1 (default the page's dust mask), fetch,
//                                    fog (default true: drive scene.fog), visibility (default true), fields (default true),
//                                    colour, ashColour}. S.storm (0..1, eased to S.stormTo: the page or its UI sets it),
//                                    S.at(x, y, z, t) -> {dust, ash, alkali, sight}, S.eye (the same at the camera)
// After ATMOS.weather (the ash) and ATMOS.dust (the local dust; without it only the storm and the ash load the air).
// Without ATMOS.airLoad the fog and every field are what they were. Godot: GODOT.md, "The air's load".
(function(){const A=ATMOS;
 A.PRESETS.airload={clean:.05,dust:30,dustH:30,storm:1500,stormH:800,stormFloor:.35,ash:120,ashH:1500,fetch:2000,
  colour:[.62,.55,.45],ashColour:[.38,.36,.35],contrast:.02,sight:{c:56,p:1.25}};
 const P0=()=>A.PRESETS.airload;
 A.dustSightM=(C,S)=>{S=S||(typeof KTAGS!=='undefined'&&KTAGS.VOCAB&&KTAGS.VOCAB.dustSight)||P0().sight;return C>0?1000*Math.pow(S.c/C,1/S.p):Infinity;};
 A.sightFog=(V,shape)=>{const k=-Math.log(P0().contrast);return V<Infinity&&V>0?(shape==='exp'?k/V:Math.sqrt(k)/V):0;};
 // the record: what airAt reads (plain numbers and functions of (x, z))
 A.airAt=(S,x,y,z,lift)=>{const g=S.ground(x,z),h=y==null?0:Math.max(0,y-g),m=S.mask(x,z),w=S.wind,ux=x-w[0]*S.fetch,uz=z-w[1]*S.fetch;
  const local=S.dust*(lift||0)*Math.exp(-h/S.dustH),storm=S.stormMg*S.storm*(S.stormFloor+(1-S.stormFloor)*Math.max(m,S.mask(ux,uz)))*Math.exp(-h/S.stormH);
  const sl=S.alkali?S.alkali(x,z):0,su=S.alkali?S.alkali(ux,uz):0,ld=local+storm;
  return{dust:S.clean+ld,ash:S.ashMg*S.ash*(S.ashAt?S.ashAt(x,z):1)*Math.exp(-h/S.ashH),alkali:ld>0?(local*sl+storm*su)/ld:sl};};
 A.airLoad=function(o){o=o||{};const T=A.T,h=A.h||{},cam=h.camera,P=P0(),D=A.PRESETS.dust;
  const S=A.air={clean:P.clean,dust:o.dust==null?P.dust:o.dust,dustH:P.dustH,stormMg:o.storm==null?P.storm:o.storm,stormH:P.stormH,stormFloor:P.stormFloor,
   ashMg:o.ash==null?P.ash:o.ash,ashH:P.ashH,fetch:o.fetch==null?P.fetch:o.fetch,alkali:o.alkali||null,ashAt:o.ashAt||null,mask:o.mask||A.dustMask||(()=>1),
   ground:(x,z)=>A.ground(x,z),wind:[1,0],storm:0,stormTo:o.stormTo==null?0:o.stormTo,ash:0,colour:o.colour||P.colour,ashColour:o.ashColour||P.ashColour,shape:o.shape||(A.fog&&A.fog.shape==='exp'?'exp':'exp2')};
  // the local dust's lift at (x, z) at time t: the dust module's own law (3d-dust's dustLift and its shader), when it is on the page
  const liftAt=(t,x,z)=>{if(!D||!A.dustOn)return 0;const w=A.windAt(t==null?(A.clock?A.clock.t:0):t,x,z),s=Math.hypot(w[0],w[1]),q=Math.min(1,Math.max(0,(s-D.lift[0])/(D.lift[1]-D.lift[0])));
   return Math.pow(q*q*(3-2*q),.6)*S.mask(x,z);};
  S.at=(x,y,z,t)=>{const a=A.airAt(S,x,y,z,liftAt(t,x,z));a.sight=A.dustSightM(a.dust+a.ash);return a;};
  // the fog: thicker of the page's own and the sight's, tinted by the share the load adds. Idempotent (a sky that rewrites the
  // fog each frame and this hook may both apply it in one frame): what it wrote last is never taken for the page's base
  const lastC=new T.Color(-1,-1,-1),baseC=new T.Color(),dc=new T.Color(),ac=new T.Color();let lastD=null,lastF=null;S.base=null;
  const mine=f=>lastD!=null&&f.density===lastD&&f.color.equals(lastC);
  const applyFog=fog=>{if(!fog||o.fog===false||!S.eye)return;const V=S.eye.sight;
   if(fog.density!=null){if(!mine(fog)){S.base=fog.density;baseC.copy(fog.color);}   /* the page (or the sky) wrote it: a new base */
    const d=A.sightFog(V,S.shape);fog.color.copy(baseC);
    if(d>S.base){const k=1-S.base/d,ak=S.eye.ash/Math.max(1e-6,S.eye.dust+S.eye.ash);dc.setRGB(S.colour[0],S.colour[1],S.colour[2]).convertSRGBToLinear();
     ac.setRGB(S.ashColour[0],S.ashColour[1],S.ashColour[2]).convertSRGBToLinear();dc.lerp(ac,ak);fog.density=d;fog.color.lerp(dc,k);}else fog.density=S.base;
    lastD=fog.density;lastC.copy(fog.color);}
   else if(fog.far!=null){if(!(lastF!=null&&fog.far===lastF)){S.baseFar=fog.far;S.baseNear=fog.near;}fog.far=Math.min(S.baseFar,V);fog.near=Math.min(S.baseNear,fog.far*.1);lastF=fog.far;}};
  S.applyFog=applyFog;
  // undone at the start of each frame, before the weather binding reads the fog (it too takes a value it did not write for
  // the page's base): each sees only its own writes, and neither stacks on the other
  A.hooks.unshift(()=>{const f=h.scene&&h.scene.fog;if(!f)return;if(f.density!=null){if(mine(f)){f.density=S.base;f.color.copy(baseC);lastD=null;}}
   else if(f.far!=null&&lastF!=null&&f.far===lastF){f.far=S.baseFar;f.near=S.baseNear;lastF=null;}});
  const prev=A.wxFog;A.wxFog=fog=>{if(prev)prev(fog);applyFog(fog);};   /* the sky calls it after it writes the hour's fog */
  S.step=(t,hr,dt)=>{const W=A.W||{},w=A.U.wind.value,l=Math.hypot(w.x,w.y)||1;S.wind[0]=w.x/l;S.wind[1]=w.y/l;
   S.storm+=(S.stormTo-S.storm)*Math.min(1,(dt||0)*.15);S.ash=W.ash||0;
   S.eye=cam?S.at(cam.position.x,cam.position.y,cam.position.z,t):S.at(0,null,0,t);applyFog(h.scene&&h.scene.fog);};
  S.step(A.clock?A.clock.t:0,12,0);A.hook(S.step);
  // the fields (core/hazard's ambient bridge, when the page has it)
  const vis=(x,y,z)=>{const f=h.scene&&h.scene.fog,F=A.fog;if(!f)return Infinity;
   const rho=S.base==null?(f.density||0):S.base,k=-Math.log(P.contrast);let beta=f.density!=null?(S.shape==='exp'?rho:rho*Math.sqrt(k)):(f.far?k/f.far:0);
   if(F&&F.ref!=null&&F.falloff&&y!=null&&y>F.ref)beta*=Math.exp(-F.falloff*(y-F.ref));
   if(F&&F.mistD>0&&A.U.fogMist){const lv=A.U.fogMist.value.y,b=A.U.fogMist.value.z;beta+=F.mistD*(y==null||y<lv?1:Math.exp(-b*(y-lv)));}
   if(F&&F.belt&&y!=null)beta+=A.fogBeltAt(Object.assign({},F.belt,{density:F.belt.live}),x,y,z);
   return beta>0?k/beta:Infinity;};
  S.provided=[];if(o.fields!==false){const reg=(n,fn)=>{if(A.khaz(n,fn))S.provided.push(n);};
   reg('dust',(x,y,z,t)=>S.at(x,y,z,t).dust);if(A.W&&A.W.MODES&&A.W.MODES.indexOf('ash')>=0||o.ashAt)reg('ash',(x,y,z,t)=>S.at(x,y,z,t).ash);
   if(S.alkali)reg('alkali',(x,y,z,t)=>S.at(x,y,z,t).alkali);if(o.visibility!==false)reg('visibility',(x,y,z)=>vis(x,y,z));}
  S.visibility=vis;
  const rec={clean:S.clean,dust:S.dust,dustH:S.dustH,storm:S.stormMg,stormH:S.stormH,stormFloor:S.stormFloor,fetch:S.fetch,ash:S.ashMg,ashH:S.ashH,
   alkali:S.alkali?'field':null,ashAt:S.ashAt?'field':null,lift:D?D.lift:null,sight:P.sight,contrast:P.contrast,shape:S.shape,fields:S.provided,
   note:'dust = clean + dust x lift(wind, mask) e^(-h/dustH) + storm x S.storm x (floor + (1-floor) max(mask here, mask fetch m upwind)) e^(-h/stormH); ash = ash x W.ash x ashAt e^(-h/ashH); alkali = load-weighted share where each was lifted; sight = 1000 (c/(dust+ash))^(1/p) m; fog density = sqrt(-ln contrast)/sight (exp2) when thicker (fx/89-atmos-fx-airload.js)'};
  const wr=A.fx.find(r=>r.type==='weather');if(wr)wr.air=rec;A.rec('airload',rec);
  return S;};
})();
