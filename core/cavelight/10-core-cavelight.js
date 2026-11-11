// ================================================================= CORE — the light underground (KCAVELIGHT)  [G data]
// One way to light a page below the ground (core/cavelight/README.md), lifted from Dhelv's cave light (settlements/dhelv/src/
// 94-dhelv-light.js), the building-kit engine's night pool (core/engine/91n-night.js) and the Hearths' cave stations. This is
// the data side: the lamps as records, the openings, flicker, the nearest-N choice, the under test, the clamped exposure ramp
// and the openings' daylight as numbers, a lamp line by chainage, the export. No THREE, no DOM; the host fragment
// (90-core-cavelight-host.js) poses three.js lights from it, Godot its own (README, "Godot"). Needs core/rand (KRAND) at first use.
// Axes: y up, metres, x east, z south. Colours sRGB hex.
//
//   KCAVELIGHT.KINDS               {name: {colour, range, intensity, flicker, hood?, role}}: the Tungang lamp code, wax, lanterns, glow
//                                  fungus and glow-cap, the Ancients' strips, work lights. KCAVELIGHT.kind(name, row) adds one
//   KCAVELIGHT.make(r)             a checked, filled light record {id, x, y, z, kind, colour, range, intensity, flicker, owner, on, seed,
//                                  hood, to} (throws on an unknown kind, no id, a bad number, a strip with no `to`)
//   KCAVELIGHT.add(r), addAll(rs), remove(id), clear(), all(), get(id)      the page's store (an id twice throws)
//   KCAVELIGHT.opening(o), openings()   an opening record {id, kind well|portal|cutting, c [x, z], r, top, floor, dir [x, z], ramp, open}
//   KCAVELIGHT.flicker(rec, t)     the intensity factor now: 1 +- flicker, on two sines whose phase is the record's own hash
//   KCAVELIGHT.dist2(rec, x, y, z) squared distance to the light (a strip: to its segment)
//   KCAVELIGHT.near(x, y, z, n, list)   the n lit records nearest (on !== false), nearest first, ties by id
//   KCAVELIGHT.line(o)             lamps along a polyline by chainage: {id, world, pts [[x, y, z]...], every 50, start, kind, side, up,
//                                  fail (0..1, each lamp's own KRAND.hash(world, line, n)), owner, from (chainage of pts[0])} -> records
//   KCAVELIGHT.under(o)            {y, ground, inVoid, margin 2} -> true below the ground by margin, or in a void
//   KCAVELIGHT.nearestOpening(x, y, z, list)   {o, d} (d: a portal's along its dir from the mouth, else from the opening's foot)
//   KCAVELIGHT.exposure(o)         the clamped ramp {d, ramp, open, day, under, surface, cave, max, floor, night, sunIn} -> {exposure, ambient, sky, sun, s}
//   KCAVELIGHT.exposureAt(x, y, z, o, list)   the same from every opening (the one leaving the eye least dark-adapted wins), + {opening, d}
//   KCAVELIGHT.daylight(O, sun, day)   the light down an opening now, as numbers (Dhelv's): {on, beam, spot, sky, bounce, shaft}
//   KCAVELIGHT.export(o)           {format 'krator-cavelight', version 1, convention, kinds, lights, openings, pool, exposure}
(function(root){
  'use strict';
  function d(v,x){return v==null?x:v;}
  function fin(v,w){if(typeof v!=='number'||!isFinite(v))throw new Error('KCAVELIGHT: '+w+' must be a finite number');return v;}
  function KR(){var k=root.KRAND;if(!k)throw new Error('KCAVELIGHT: load core/rand/08-core-rand.js first');return k;}
  function ss(a,b,x){var t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
  var HEX=/^#[0-9a-fA-F]{6}$/;

  /* the kinds. The Tungang lamp code (kits/tungang/PLAN.md 1.2, proposed; the owner's question 6): the coloured lamps mark the
     ways and doors and are weak and short; rooms take the warm-white key (wax, lanterns): Dhelv's lesson, coloured light as the
     main light turns every surface to mud. Intensity is three.js PointLight's (decay 1.6) and Godot's light_energy */
  var KINDS={
    'lamp-red':  {colour:'#ff4a2a',range:4, intensity:.35,flicker:.02, role:'a home: hung at its door, not in it'},
    'lamp-green':{colour:'#48e078',range:6, intensity:.45,flicker:.015,role:'the Line: walkway posts every 50 m of a kept track, platforms, the way'},
    'lamp-amber':{colour:'#ffb438',range:8, intensity:.7, flicker:.03, role:'work: sheds, the cooling plant, the dark beds'},
    'lamp-white':{colour:'#f2f4ff',range:16,intensity:1.8,flicker:.005,role:'the surface, the Gaffers, danger: stop',hood:{dir:[0,-1,0],angle:.7}},
    'glowcap':   {colour:'#4ad8c0',range:4, intensity:.3, flicker:0,   role:'blue-green glow-cap: the common light of passages and the poor'},
    'fungus':    {colour:'#6fe0c0',range:6, intensity:.4, flicker:0,   role:'glow fungus at the foot of a tunnel wall (Dhelv\'s accent)'},
    'wax':       {colour:'#ffd8a6',range:11,intensity:1.4,flicker:.07, role:'hearth wax: the rooms\' warm-white key'},
    'lantern':   {colour:'#ffa860',range:9, intensity:1.3,flicker:.1,  role:'an oil lamp, a brazier, a hearth: the engine\'s halos'},
    'strip':     {colour:'#3ef0ff',range:7, intensity:.9, flicker:.004,role:'the Ancients\' still-lit strips (the hot section only): a segment'},
    'work':      {colour:'#fff4e0',range:18,intensity:2.2,flicker:0,   role:'a floodlight on a work face, a train\'s headlamp at rest'}};
  function copy(o){if(o==null||typeof o!=='object')return o;if(Array.isArray(o))return o.map(copy);var c={};for(var k in o)c[k]=copy(o[k]);return c;}
  function kind(name,row){if(typeof name!=='string'||!name)throw new Error('KCAVELIGHT.kind: a name');checkRow(row,'kind '+name);KINDS[name]=copy(row);return KINDS[name];}
  function checkRow(r,w){if(!r||!HEX.test(r.colour))throw new Error('KCAVELIGHT: '+w+': colour is #rrggbb');
    if(!(fin(r.range,w+' range')>0))throw new Error('KCAVELIGHT: '+w+': range must be above 0');
    if(fin(r.intensity,w+' intensity')<0)throw new Error('KCAVELIGHT: '+w+': intensity is 0 or more');
    var f=fin(d(r.flicker,0),w+' flicker');if(f<0||f>1)throw new Error('KCAVELIGHT: '+w+': flicker is 0..1');}

  function make(r){if(!r||typeof r!=='object')throw new Error('KCAVELIGHT.make: a light is an object');
    if(r.id==null||r.id==='')throw new Error('KCAVELIGHT.make: an id');var K=KINDS[r.kind];if(!K)throw new Error('KCAVELIGHT.make: unknown kind '+r.kind);
    var o={id:String(r.id),x:fin(r.x,'x'),y:fin(r.y,'y'),z:fin(r.z,'z'),kind:r.kind,colour:d(r.colour,K.colour),range:d(r.range,K.range),intensity:d(r.intensity,K.intensity),
      flicker:d(r.flicker,d(K.flicker,0)),owner:d(r.owner,null),on:r.on!==false,seed:String(d(r.seed,r.id))};
    checkRow(o,o.id);
    var hd=r.hood===undefined?K.hood:r.hood;
    if(hd!=null){if(!(Array.isArray(hd.dir)&&hd.dir.length===3))throw new Error('KCAVELIGHT.make: '+o.id+': hood.dir is [x, y, z]');
      var L=Math.hypot(hd.dir[0],hd.dir[1],hd.dir[2]);if(!(L>0))throw new Error('KCAVELIGHT.make: '+o.id+': hood.dir is not zero');
      var a=fin(d(hd.angle,.7),'hood angle');if(!(a>0&&a<Math.PI/2))throw new Error('KCAVELIGHT.make: '+o.id+': hood.angle is 0..pi/2');
      o.hood={dir:[hd.dir[0]/L,hd.dir[1]/L,hd.dir[2]/L],angle:a};}
    if(o.kind==='strip'||r.to!=null){if(!(Array.isArray(r.to)&&r.to.length===3&&r.to.every(isFinite)))throw new Error('KCAVELIGHT.make: '+o.id+': a strip needs to [x, y, z]');o.to=r.to.slice();}
    return o;}

  /* ---- the page's store */
  var STORE=[],BY={},OPEN=[],OBY={};
  function add(r){var o=make(r);if(BY[o.id])throw new Error('KCAVELIGHT.add: id '+o.id+' twice');STORE.push(o);BY[o.id]=o;return o;}
  function addAll(rs){return rs.map(add);}
  function remove(id){var o=BY[id];if(!o)return false;delete BY[id];STORE.splice(STORE.indexOf(o),1);return true;}
  function clear(){STORE.length=0;BY={};OPEN.length=0;OBY={};}
  function all(){return STORE;}
  function get(id){return BY[id]||null;}
  var OKINDS=['well','portal','cutting'];
  function opening(o){if(!o||o.id==null)throw new Error('KCAVELIGHT.opening: an id');if(OKINDS.indexOf(o.kind)<0)throw new Error('KCAVELIGHT.opening: kind is well, portal or cutting');
    if(OBY[o.id])throw new Error('KCAVELIGHT.opening: id '+o.id+' twice');
    if(!(Array.isArray(o.c)&&o.c.length===2))throw new Error('KCAVELIGHT.opening: c is [x, z]');
    var r={id:String(o.id),kind:o.kind,c:[fin(o.c[0],'c'),fin(o.c[1],'c')],r:fin(o.r,'r'),top:fin(o.top,'top'),floor:fin(o.floor,'floor'),ramp:fin(d(o.ramp,o.kind==='portal'?300:120),'ramp')};
    if(!(r.r>0)||!(r.ramp>0))throw new Error('KCAVELIGHT.opening: r and ramp must be above 0');if(r.top<r.floor)throw new Error('KCAVELIGHT.opening: top is over floor');
    /* open: how much of the sky it lets in at its foot (0..1): a portal or a cutting all of it, a well by its width (a 24 m well
       whole, a 3.5 m shaft about a tenth) */
    r.open=fin(d(o.open,o.kind==='well'?Math.min(1,Math.pow(r.r/12,2)):1),'open');if(r.open<0||r.open>1)throw new Error('KCAVELIGHT.opening: open is 0..1');
    if(o.kind==='portal'){if(!(Array.isArray(o.dir)&&o.dir.length===2))throw new Error('KCAVELIGHT.opening: a portal needs dir [x, z] (into the tunnel)');
      var L=Math.hypot(o.dir[0],o.dir[1]);if(!(L>0))throw new Error('KCAVELIGHT.opening: dir is not zero');r.dir=[o.dir[0]/L,o.dir[1]/L];}
    OPEN.push(r);OBY[r.id]=r;return r;}
  function openings(){return OPEN;}

  /* ---- flicker: two sines (Dhelv's rates: 11 and 23 rad/s), the phase the record's own hash; 1 at flicker 0 */
  function flicker(rec,t){if(!rec.flicker)return 1;var K=KR(),h=K.hash(K.child(0x464c4b,rec.seed||rec.id),1),p=K.unit(h)*6.2832,q=K.unit(K.hash(h,2))*6.2832;
    return 1+rec.flicker*(.67*Math.sin(t*11+p)+.33*Math.sin(t*23+q));}

  /* ---- the nearest: squared distance to the light (a strip: to its segment) */
  function dist2(r,x,y,z){if(!r.to){var a=r.x-x,b=r.y-y,c=r.z-z;return a*a+b*b+c*c;}
    var ux=r.to[0]-r.x,uy=r.to[1]-r.y,uz=r.to[2]-r.z,L2=ux*ux+uy*uy+uz*uz,t=L2>0?Math.max(0,Math.min(1,((x-r.x)*ux+(y-r.y)*uy+(z-r.z)*uz)/L2)):0;
    var px=r.x+ux*t-x,py=r.y+uy*t-y,pz=r.z+uz*t-z;return px*px+py*py+pz*pz;}
  /* a partial selection (n is small, the list may be thousands): O(N n) */
  function near(x,y,z,n,list){list=list||STORE;var best=[];
    for(var i=0;i<list.length;i++){var r=list[i];if(r.on===false)continue;var q=dist2(r,x,y,z);
      if(best.length===n&&(q>best[n-1][0]||(q===best[n-1][0]&&r.id>best[n-1][1].id)))continue;
      var j=best.length;if(j<n)best.push(null);else j=n-1;
      while(j>0&&(best[j-1][0]>q||(best[j-1][0]===q&&best[j-1][1].id>r.id))){best[j]=best[j-1];j--;}best[j]=[q,r];}
    return best.map(function(e){return e[1];});}

  /* ---- a lamp line: lamps every `every` m along a polyline by chainage, so a window cut from the same line (its pts a part of
     the whole, `from` the chainage of its first point) gets the same lamps; dead ones by each lamp's own hash */
  function line(o){if(!o||o.id==null)throw new Error('KCAVELIGHT.line: an id');var P=o.pts;if(!(Array.isArray(P)&&P.length>=2))throw new Error('KCAVELIGHT.line: pts, two or more');
    var every=fin(d(o.every,50),'every'),start=fin(d(o.start,every/2),'start'),side=fin(d(o.side,0),'side'),up=fin(d(o.up,0),'up'),fail=fin(d(o.fail,0),'fail'),from=fin(d(o.from,0),'from');
    if(!(every>0))throw new Error('KCAVELIGHT.line: every must be above 0');if(fail<0||fail>1)throw new Error('KCAVELIGHT.line: fail is 0..1');
    if(!KINDS[o.kind])throw new Error('KCAVELIGHT.line: unknown kind '+o.kind);
    var K=KR(),sd=K.child(fin(d(o.world,0),'world')>>>0,'cavelight.line.'+o.id),out=[],cum=from;
    for(var i=0;i<P.length-1;i++){var a=P[i],b=P[i+1],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz),Lh=Math.hypot(dx,dz);if(!(L>0)){continue;}
      /* the lamps whose chainage falls in [cum, cum + L): n from the line's own start, never from how many came before */
      var n0=Math.ceil((cum-start)/every-1e-9);if(n0<0)n0=0;
      for(var n=n0;;n++){var s=start+n*every;if(s>=cum+L-1e-9)break;var t=(s-cum)/L,rx=Lh>0?-dz/Lh:0,rz=Lh>0?dx/Lh:0;
        /* `side` is to the right of the way, facing along it (y up, x east, z south: facing east, the right hand is south, +z) */
        var x=a[0]+dx*t+rx*side,z=a[2]+dz*t+rz*side,y=a[1]+dy*t+up;
        var dead=fail>0&&K.unit(K.hash(sd,n,0x4641))<fail;
        var r={id:o.id+'.'+n,kind:o.kind,x:x,y:y,z:z,owner:d(o.owner,null),on:!dead};
        if(o.colour)r.colour=o.colour;if(o.range!=null)r.range=o.range;if(o.intensity!=null)r.intensity=o.intensity;if(o.hood!==undefined)r.hood=o.hood;
        var m=make(r);m.chain=s;out.push(m);}
      cum+=L;}
    return out;}

  /* ---- under: the camera below the ground (by margin) or inside a cavern void */
  function under(o){var y=fin(o.y,'y'),g=o.ground==null?Infinity:o.ground;if(o.inVoid)return true;return y<g-d(o.margin,2);}

  /* ---- the openings: how far the eye is from daylight. A portal's d is the depth along its dir past the mouth (negative
     outside); a well's or a cutting's the distance from its foot (the floor under its centre) less its radius */
  function nearestOpening(x,y,z,list){list=list||OPEN;var best=null,bd=Infinity;
    for(var i=0;i<list.length;i++){var O=list[i],q;
      if(O.kind==='portal'){var ax=x-O.c[0],az=z-O.c[1],al=ax*O.dir[0]+az*O.dir[1],ac=Math.abs(-ax*O.dir[1]+az*O.dir[0]);q=Math.max(0,al)+Math.max(0,ac-O.r);}
      else q=Math.max(0,Math.hypot(x-O.c[0],y-O.floor,z-O.c[1])-O.r);
      if(q<bd){bd=q;best=O;}}
    return {o:best,d:bd};}
  /* ---- exposure: daylight to the dark, clamped. At an opening the surface's exposure and its sky; at `ramp` and beyond the
     cave's (never past max), the ambient at its floor (nothing pure black), no sky in the reflections and no sun */
  function exposure(o){o=o||{};var surface=d(o.surface,1),night=d(o.night,1.35),cave=d(o.cave,1.55),max=d(o.max,1.8),floor=d(o.floor,.14),ramp=d(o.ramp,300),day=Math.max(0,Math.min(1,d(o.day,1)));
    var open=Math.max(0,Math.min(1,d(o.open,1))),sunIn=d(o.sunIn,Math.min(15,ramp*.05));
    if(!(ramp>0))throw new Error('KCAVELIGHT.exposure: ramp must be above 0');if(floor<0)throw new Error('KCAVELIGHT.exposure: floor is 0 or more');
    var top=surface+(night-surface)*(1-day);
    if(!o.under)return {exposure:top,ambient:1,sky:1,sun:1,s:0};
    /* s: how far into the dark the eye has adapted (0 at the mouth, 1 at `ramp`); an opening that lets in little sky (a narrow
       shaft: open .1) leaves the eye nearly dark-adapted at its foot */
    var D=o.d==null?Infinity:Math.max(0,o.d),s0=D===Infinity?1:ss(0,ramp,D),s=1-open*(1-s0),c=Math.min(max,cave),e=Math.min(max,top+(c-top)*s);
    /* the ambient: the sky's light at the mouth falling to the floor over the first 70% of the ramp, no faster than the eye adapts (a tunnel a few widths in
       is lit by the sky no more); the sky's reflections gone by a third of the ramp; the sun (no shadow stops it on a page
       without them) out within sunIn m: past the mouth it comes in only as the openings' own spots */
    var s2=D===Infinity?1:ss(0,ramp*.7,D),amb=floor+(1-floor)*day*open*(1-s2),sky=day*open*(1-ss(0,.33,s0)),sun=D===Infinity?0:day*open*(1-ss(0,Math.max(.01,sunIn),D));
    return {exposure:e,ambient:amb,sky:sky,sun:sun,s:s};}

  /* ---- the exposure at a point from every opening: the one that leaves the eye least dark-adapted wins (a wide portal 50 m
     off beats a narrow shaft 5 m off). o: exposure's fields but d, ramp and open (each opening's own; o.ramp overrides) */
  function opDist(O,x,y,z){if(O.kind==='portal'){var ax=x-O.c[0],az=z-O.c[1],al=ax*O.dir[0]+az*O.dir[1],ac=Math.abs(-ax*O.dir[1]+az*O.dir[0]);return Math.max(0,al)+Math.max(0,ac-O.r);}
    return Math.max(0,Math.hypot(x-O.c[0],y-O.floor,z-O.c[1])-O.r);}
  function exposureAt(x,y,z,o,list){list=list||OPEN;o=o||{};var best=null;
    function with_(O){var q={};for(var k in o)q[k]=o[k];if(O){q.d=opDist(O,x,y,z);if(o.ramp==null)q.ramp=O.ramp;q.open=O.open==null?1:O.open;}else q.d=Infinity;
      var E=exposure(q);E.opening=O?O.id:null;E.d=q.d;return E;}
    if(!list.length)return with_(null);
    for(var i=0;i<list.length;i++){var E=with_(list[i]);if(!best||E.s<best.s||(E.s===best.s&&E.ambient>best.ambient))best=E;}
    return best;}
  /* ---- the daylight down an opening (Dhelv's numbers): the sun's spot through it onto the floor, the sky's own spot straight
     down, a warm bounce where it lands, and the shaft of lit air from the top to the floor. sun: unit vector toward the sun */
  function daylight(O,sun,day){day=Math.max(0,Math.min(1,d(day,1)));var L=sun,ly=Math.max(.15,L[1]),out={on:day>0};if(!out.on)return out;
    var deep=(O.top-O.floor)/ly,fx=O.c[0]-L[0]*deep,fz=O.c[1]-L[2]*deep,D=160;
    if(O.kind==='portal'){/* a mouth: no shaft of air (that is a well's). The sun reaches in along the floor only as far as the
       mouth's height lets it (a low sun behind the portal, a few widths; a high one, a few metres), and the sky comes in as a
       broad soft light from outside the mouth aimed down the tunnel, fading over `r` x 4 m */
      var into=Math.max(0,-(L[0]*O.dir[0]+L[2]*O.dir[1])),reach=Math.min(O.r*8,(O.top-O.floor)/ly*into),h=(O.top-O.floor)*.6;
      var bx=O.c[0]+O.dir[0]*reach,bz=O.c[1]+O.dir[1]*reach;
      out.beam={from:[O.c[0],O.top,O.c[1]],to:[bx,O.floor,bz],len:reach};
      out.spot=into>.05&&reach>1?{pos:[bx+L[0]*D,O.floor+L[1]*D,bz+L[2]*D],target:[bx,O.floor,bz],angle:Math.atan(O.r*1.05/D),intensity:2.24*day*Math.min(1,into*3),
        shadowNear:Math.max(1,D-25),shadowFar:D+reach+40}:null;
      out.sky={pos:[O.c[0]+O.dir[0]*.5,O.floor+h,O.c[1]+O.dir[1]*.5],target:[O.c[0]+O.dir[0]*O.r*4,O.floor,O.c[1]+O.dir[1]*O.r*4],angle:.9,intensity:.6*day,distance:O.r*6};
      out.bounce={pos:[O.c[0]+O.dir[0]*O.r*.6,O.floor+2,O.c[1]+O.dir[1]*O.r*.6],distance:O.r*3,intensity:.4*day};
      out.shaft=null;return out;}
    var len=Math.hypot(O.c[0]-fx,O.top-O.floor,O.c[1]-fz);
    out.beam={from:[O.c[0],O.top,O.c[1]],to:[fx,O.floor,fz],len:len};
    out.spot={pos:[O.c[0]+L[0]*D,O.top+L[1]*D,O.c[1]+L[2]*D],target:[fx,O.floor,fz],angle:Math.atan(O.r*1.05/D),intensity:2.24*day,shadowNear:Math.max(1,D-25),shadowFar:D+deep+40};
    out.sky={pos:[O.c[0],O.top+150,O.c[1]],target:[O.c[0],O.floor,O.c[1]],angle:Math.atan(O.r*1.15/150),intensity:1.5*day};
    out.bounce={pos:[(fx+O.c[0])/2,O.floor+4,(fz+O.c[1])/2],distance:O.r*7,intensity:1.4*day};
    out.shaft={mid:[(O.c[0]+fx)/2,(O.top+O.floor)/2,(O.c[1]+fz)/2],len:len,r:O.r*.92,dir:[L[0],L[1],L[2]],opacity:.11*day};
    return out;}

  /* ---- the export: the contract for Godot (README, "Godot") */
  function r3(v){return typeof v==='number'?Math.round(v*1000)/1000:Array.isArray(v)?v.map(r3):v&&typeof v==='object'?Object.keys(v).reduce(function(a,k){a[k]=r3(v[k]);return a;},{}):v;}
  function exp(o){o=o||{};var inBox=o.inBox;
    var L=STORE.filter(function(r){return !inBox||inBox(r.x,r.z);}).map(function(r){var c={id:r.id,kind:r.kind,at:[r.x,r.y,r.z],colour:r.colour,range:r.range,intensity:r.intensity,flicker:r.flicker,owner:r.owner,on:r.on};
      if(r.hood)c.hood=copy(r.hood);if(r.to)c.to=r.to.slice();return c;});
    return r3({format:'krator-cavelight',version:1,
      convention:{units:'metres',up:'+y',x:'east',z:'south',colour:'sRGB hex',intensity:'three.js PointLight intensity, decay 1.6 (Godot light_energy, omni_attenuation 1.6)',
        flicker:'1 + f (.67 sin(11 t + p) + .33 sin(23 t + q)), p and q from KRAND.hash(KRAND.child(0x464c4b, seed), 1) and its hash by 2',
        godot:'one OmniLight3D per lit record (omni_range = range, distance_fade 40 + 20 m); a hood a SpotLight3D; a strip an emissive mesh and an OmniLight3D every range m'},
      kinds:KINDS,lights:L,openings:OPEN.filter(function(O){return !inBox||inBox(O.c[0],O.c[1]);}),pool:{n:d(o.pool,14),decay:1.6},
      exposure:{surface:1,night:1.35,cave:1.55,max:1.8,floor:.14,ramp:300}});}

  root.KCAVELIGHT={KINDS:KINDS,kind:kind,make:make,add:add,addAll:addAll,remove:remove,clear:clear,all:all,get:get,opening:opening,openings:openings,
    flicker:flicker,dist2:dist2,near:near,line:line,under:under,nearestOpening:nearestOpening,exposure:exposure,exposureAt:exposureAt,daylight:daylight,export:exp};
})(typeof window!=='undefined'?window:globalThis);
