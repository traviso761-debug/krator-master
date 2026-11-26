// ================================================================= BIOME CORE — animation
// Things that MOVE, at no per-frame cost: an instanced item whose material
// carries a motion hook. Each instance is put at its path's CENTRE (so the
// probe and the inspector see it there) with two extra vec4 attributes,
//   aP0 = [cx, cy, cz, radius]    aP1 = [speed, phase, vertical amplitude, eccentricity]
// and the vertex shader moves and turns it along the path from the shared
// wind clock (BIO.WIND.t). The body is modelled with +x forward, +y up.
//   mode 'orbit'  a level ellipse round the centre (soaring flocks), banked
//   mode 'flit'   a lissajous wander inside a box (darting under the canopy,
//                 butterflies, motes), heading and pitch from the velocity
//   mode 'walk'   no path (the host or a tick moves the matrix); aP1.x is the
//                 gait phase, advanced by whoever moves it, aP1.y the flap phase
//   mode 'breath' no path: the item stands, and a part of it moves on ONE scalar, the kit's breath state (below)
//   billboard     the item is a camera-facing card (motes)
//   flap          vertices beyond |z| > root hinge up and down (wings); rate 0 is a still wing
//                 (each number defaults only when left out: `x == null`, 2026-10-26)
//   legs          vertices below y < legTop swing fore and aft, diagonal pairs
// Also charged to BIO.cur, baked with everything else.
// THE BREATH (2026-11-02; the Gills, the Cliff Lungs and the Hearths, each PLAN.md section 14). One uniform, no per-frame work on
// the items: BIO.breathState(key) is a {value} shared by every material of that key, and the kit sets .value (0..1) once a frame from
// its own clock (GILLS.breath(t) off ATMOS.libration). o.breath {key ('breath'), shape, amp (1 m, or radians for 'fold'), top, albedo,
// rough, band}; per instance aP0 = [vx, vy, vz, the item's share of amp] and aP1 = [lag 0..1 (the item starts when the state passes
// it, and still reaches 1 with it), unused x3]. Each of top, albedo, rough and band is off unless given.
//   shape 'bulge'   out along the vertex normal: a pad swelling, a sphincter narrowing (amp < 0)
//         'stream'  along the item's own vector aP0.xyz: a fringe streaming, a bead's roll
//         'fold'    a turn of amp radians about the local z axis through the origin: a fan folding on its hinge (normals stay put)
//   top     the displacement grows from 0 at y = 0 to all of it at y = top (a fringe's root stays)
//   albedo  a number: the colour multiplied by it at a full breath (the spindle's silver)
//   rough   added to the roughness at a full breath; needs BIO.animMat's o.pbr (Lambert has no roughness: the hook throws)
//   band    [y0, y1] holds albedo and rough to that height window, in the item's own y (the Lungs' sheen band)
BIO.breathState=function(key){const T=BIO._breath||(BIO._breath={}),k=key==null?'breath':key;return T[k]||(T[k]={value:0});};
BIO.animHook=function(o){o=o||{};
 const mode=o.mode||'orbit',flap=o.flap||null,legs=o.legs||null,br=mode==='breath'?(o.breath||{}):null;
 const bf=v=>(+v).toFixed(3),brTint=br&&(br.albedo!=null||br.rough!=null);
 if(br&&br.shape&&br.shape!=='bulge'&&br.shape!=='stream'&&br.shape!=='fold')throw new Error('BIO.animHook: breath.shape must be bulge, stream or fold');
 const brA=br?bf(br.amp==null?1:br.amp):'',brW=br?(br.top==null?'1.0':'clamp(position.y/'+bf(br.top)+',0.0,1.0)'):'';
 const brHead=br?['uniform float uBreath;','float _br(){return clamp((uBreath-aP1.x)/max(1.0-aP1.x,0.001),0.0,1.0);}'].concat(brTint?['varying float vBrK;']:[]).join('\n'):'';
 const brMove=br?[' { float _s = _br()*aP0.w*'+brW+';',
   br.shape==='stream'?'   transformed += aP0.xyz*_s*'+brA+';'
   :br.shape==='fold'?'   float _c = cos(_s*'+brA+'), _n = sin(_s*'+brA+'); transformed.xy = vec2(_c*transformed.x-_n*transformed.y, _n*transformed.x+_c*transformed.y);'
   :'   transformed += normal*_s*'+brA+';',' }'].concat(brTint?[' vBrK = _br()'+(br.band?'*smoothstep('+bf(br.band[0])+','+bf(br.band[0]+.15*(br.band[1]-br.band[0]))+',position.y)*(1.0-smoothstep('+bf(br.band[1]-.15*(br.band[1]-br.band[0]))+','+bf(br.band[1])+',position.y))':'')+';']:[]).join('\n'):'';
 const state=[
  'mat3 _hdg(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s, 0.,1.,0., -s,0.,c);}',
  'mat3 _rz(float a){float c=cos(a),s=sin(a);return mat3(c,s,0., -s,c,0., 0.,0.,1.);}',
  'mat3 _rx(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0., 0.,c,s, 0.,-s,c);}',
  'void _anim(out mat3 M, out vec3 P){',
  mode==='orbit'?[
   ' float th = aP1.y + aP1.x * uWindT;',
   ' float e = max(aP1.w, 0.15);',
   ' P = vec3(cos(th)*aP0.w, aP1.z*(0.6*sin(th*2.3+aP1.y)+0.4*sin(th*0.7+2.0*aP1.y)), sin(th)*aP0.w*e);',
   ' vec2 d = normalize(vec2(-sin(th), cos(th)*e));',
   ' float yaw = atan(d.y, d.x);',
   ' float bank = -0.42*sign(aP1.x)*(0.7+0.3*sin(th*3.1+aP1.y));',
   ' float pit = 0.25*aP1.z*(1.38*cos(th*2.3+aP1.y))/max(1.0,aP0.w)*4.0;',
   ' M = _hdg(yaw) * _rz(clamp(pit,-0.3,0.3)) * _rx(bank);'].join('\n')
  :mode==='flit'?[
   ' float t = aP1.y + aP1.x * uWindT;',
   ' float e = max(aP1.w, 0.15);',
   ' P = vec3(sin(t)*aP0.w, aP1.z*sin(t*1.7+1.0), cos(t*0.83+0.5)*aP0.w*e);',
   ' vec3 v = vec3(cos(t)*aP0.w, aP1.z*1.7*cos(t*1.7+1.0), -0.83*sin(t*0.83+0.5)*aP0.w*e);',
   ' float yaw = atan(v.z, v.x);',
   ' float pit = atan(v.y, max(0.001,length(v.xz)))*0.6;',
   ' M = _hdg(yaw) * _rz(clamp(pit,-0.6,0.6));'].join('\n')
  :' P = vec3(0.0); M = mat3(1.0);',
  '}'].join('\n')+(br?'\n'+brHead:'');
 return function(sh){
  sh.uniforms.uWindT=BIO.WIND.t;
  if(br)sh.uniforms.uBreath=BIO.breathState(br.key);
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;\nattribute vec4 aP0;\nattribute vec4 aP1;\n'+state)
   .replace('#include <begin_vertex>',[
    'vec3 transformed = vec3( position );',
    flap?[' { float _w = max(0.0, abs(position.z) - '+(flap.root==null?.12:flap.root).toFixed(3)+');',
          '   float _f = sin(uWindT*'+(flap.rate==null?6:flap.rate).toFixed(2)+' + aP1.y*7.0'+(mode==='walk'?' + aP1.x':'')+');',
          '   transformed.y += _w * _f * '+(flap.amp==null?.35:flap.amp).toFixed(3)+';',
          '   transformed.z -= sign(position.z) * _w * (1.0 - cos(_f*'+(flap.amp==null?.35:flap.amp).toFixed(3)+')) * 0.5; }'].join('\n'):'',
    legs?[' { float _lt = '+(legs.top==null?.5:legs.top).toFixed(3)+';',
          '   if(position.y < _lt){ float _k = (_lt - position.y)/_lt;',
          '     float _ph = aP1.x + (position.x > 0.0 ? 0.0 : 3.14159) + (position.z > 0.0 ? 0.0 : 3.14159);',
          '     transformed.x += _k * sin(_ph) * '+(legs.amp==null?.18:legs.amp).toFixed(3)+';',
          '     transformed.y += _k * max(0.0, cos(_ph)) * '+((legs.amp==null?.18:legs.amp)*.35).toFixed(3)+'; }',
          '   else transformed.y += 0.02*sin(aP1.x*2.0); }'].join('\n'):''].join('\n')+(br?'\n'+brMove:''))
   .replace('#include <project_vertex>',[
    'mat3 _M; vec3 _P; _anim(_M,_P);',
    'vec4 mvPosition = vec4( transformed, 1.0 );',
    '#ifdef USE_INSTANCING',
    '  vec3 _c = instanceMatrix[3].xyz;',
    '  vec3 _lp = (instanceMatrix * mvPosition).xyz - _c;',
    o.billboard?'  mvPosition = modelViewMatrix * vec4(_c + _P, 1.0); mvPosition.xyz += vec3(_lp.x, _lp.y, 0.0);'
               :'  mvPosition = modelViewMatrix * vec4(_c + _P + _M * _lp, 1.0);',
    '#else',
    '  mvPosition = modelViewMatrix * mvPosition;',
    '#endif',
    'gl_Position = projectionMatrix * mvPosition;'].join('\n'));
  if(brTint){const need=c=>{if(sh.fragmentShader.indexOf(c)<0)throw new Error('BIO.animHook: breath.rough needs a Standard material (BIO.animMat o.pbr)');};if(br.rough!=null)need('#include <roughnessmap_fragment>');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vBrK;');
   if(br.albedo!=null)sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb *= mix(1.0,'+bf(br.albedo)+',vBrK);');
   if(br.rough!=null)sh.fragmentShader=sh.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor = clamp(roughnessFactor+'+bf(br.rough)+'*vBrK,0.04,1.0);');}
  if(!o.billboard)sh.vertexShader=sh.vertexShader.replace('#include <defaultnormal_vertex>',[
    'vec3 transformedNormal = objectNormal;',
    '#ifdef USE_INSTANCING',
    '  { mat3 _nm = mat3( instanceMatrix ); mat3 _M2; vec3 _P2; _anim(_M2,_P2);',
    '    transformedNormal /= vec3( dot( _nm[ 0 ], _nm[ 0 ] ), dot( _nm[ 1 ], _nm[ 1 ] ), dot( _nm[ 2 ], _nm[ 2 ] ) );',
    '    transformedNormal = _M2 * (_nm * transformedNormal); }',
    '#endif',
    'transformedNormal = normalMatrix * transformedNormal;',
    '#ifdef FLIP_SIDED',
    '  transformedNormal = - transformedNormal;',
    '#endif'].join('\n'));
  // wings and hides are lit from both sides like leaves: no black underside
  sh.fragmentShader=sh.fragmentShader
   .replace('reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;','reflectedLight.indirectDiffuse += 0.72*vIndirectFront + 0.28*vIndirectBack;')
   .replace('reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;','reflectedLight.directDiffuse = vLightFront + 0.35*vLightBack;');
 };};
// an ANIMATED material: Lambert (lit bodies, wings) or Basic (glowing motes,
// additive), or Standard with o.pbr {roughness (.8), metalness (0)} (a breath's rough term).
// key must be unique per hook configuration.
BIO.animMat=function(key,o){const T=BIO.host.THREE;o=o||{};let m;
 if(o.basic)m=new T.MeshBasicMaterial({color:0xffffff,map:o.tex||null,vertexColors:!!o.vertexColors,transparent:!!o.additive,blending:o.additive?T.AdditiveBlending:T.NormalBlending,depthWrite:!o.additive,side:T.DoubleSide,fog:true});
 else if(o.pbr)m=new T.MeshStandardMaterial({color:0xffffff,map:o.tex||null,alphaTest:o.alphaTest||0,side:T.DoubleSide,vertexColors:!!o.vertexColors,roughness:o.pbr.roughness==null?.8:o.pbr.roughness,metalness:o.pbr.metalness==null?0:o.pbr.metalness});
 else m=new T.MeshLambertMaterial({color:0xffffff,map:o.tex||null,alphaTest:o.alphaTest||0,side:T.DoubleSide,vertexColors:!!o.vertexColors});
 m.onBeforeCompile=BIO.animHook(o);const ck='bioanim|'+BIO.kitKey(key);m.customProgramCacheKey=function(){return ck;};m.userData.bio={kind:'anim',key:BIO.kitKey(key),opts:o};
 BIO._tickWind();return m;};
// a PHASE-DRIVEN body (the 'anim-phase' kind; swbay's and nwbay's animMat, one copy since 2026-10-25): vertex-coloured
// Lambert whose vertex shader moves the body by a per-instance phase (attribute aPh, which the kit sets) on the biome's
// clock (BIO.WIND.t). mode 'bird': the wings (|x| past 0.12) beat and the body bobs; 'swim': a bob and a body wave along
// z; 'grazer': the legs (y below 0.5) swing in diagonal pairs and the body nods.
BIO.phaseAnimMat=function(mode){const T=BIO.host.THREE,m=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
 m.onBeforeCompile=sh=>{sh.uniforms.uT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;\nattribute float aPh;')
   .replace('#include <begin_vertex>','#include <begin_vertex>\n'+(mode==='bird'?
    ['{float w=abs(position.x)-0.12; if(w>0.0){float fl=sin(uT*aPh+aPh*7.0)*0.75; transformed.y+=w*sin(fl)*0.9; transformed.x=sign(position.x)*(0.12+w*cos(fl));}',
     ' transformed.y+=0.03*sin(uT*aPh*0.5+aPh);}'].join('\n'):
    mode==='swim'?['{float bob=sin(uT*aPh+aPh*5.0); transformed.y+=bob*0.16-0.06; transformed.y+=position.z*sin(uT*aPh*0.9+aPh)*0.12;}'].join('\n'):
    ['{if(position.y<0.5){float side=sign(position.x)*sign(position.z); float sw=sin(uT*aPh+aPh*3.0+(side>0.0?0.0:3.14159))*0.55;',
     ' transformed.z+=(0.5-position.y)*sw;} transformed.y+=0.02*sin(uT*aPh*2.0+aPh);}'].join('\n')));};
 const ck='biofauna|'+BIO.kitKey(mode);m.customProgramCacheKey=function(){return ck;};
 m.userData.bio={kind:'anim-phase',key:BIO.kitKey(mode),opts:{mode,attribute:'aPh'}};   // as data (42-core-export): a wing-beat, bob or leg-swing driven by a per-instance phase
 BIO._tickWind();return m;};
// assemble a body from parts [[geometry, colour hex], ...] into one
// vertex-coloured, non-indexed geometry (colours sRGB in, linear out)
BIO.geo.assemble=function(parts){const T=BIO.host.THREE,pos=[],nor=[],col=[],uv=[],c=new T.Color();
 parts.forEach(p=>{const g=(p[0].index?p[0].toNonIndexed():p[0]),a=g.attributes.position.array,b=g.attributes.normal.array,u=g.attributes.uv?g.attributes.uv.array:null;
  c.set(p[1]==null?0xffffff:p[1]).convertSRGBToLinear();const shade=p[2]||null;
  for(let i=0;i<a.length;i+=3){pos.push(a[i],a[i+1],a[i+2]);nor.push(b[i],b[i+1],b[i+2]);const k=shade?shade(a[i],a[i+1],a[i+2]):1;col.push(c.r*k,c.g*k,c.b*k);}
  for(let i=0;i<a.length/3;i++)uv.push(u?u[i*2]:0,u?u[i*2+1]:0);});
 return BIO.geo._make(pos,nor,uv,col);};
// a flat WING: a quad from the body root out to the tip, in the xz plane,
// side = +1 / -1; points [root fore x, root aft x, tip x, span, tip chord]
BIO.geo.wing=function(side,rf,ra,tx,span,tc,dihedral){const T=BIO.host.THREE,pos=[],nor=[],uv=[];const d=dihedral||0;
 const P=[[rf,0,0.02*side],[ra,0,0.02*side],[tx-tc*.5,d,span*side],[tx+tc*.5,d,span*side]],U=[[0,0],[0,1],[1,1],[1,0]];
 const tri=(i,j,k)=>{[i,j,k].forEach(q=>{pos.push(P[q][0],P[q][1],P[q][2]);nor.push(0,1,0);uv.push(U[q][0],U[q][1]);});};
 if(side>0){tri(0,3,2);tri(0,2,1);}else{tri(0,2,3);tri(0,1,2);}
 return BIO.geo._make(pos,nor,uv);};
