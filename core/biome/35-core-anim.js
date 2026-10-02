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
//   billboard     the item is a camera-facing card (motes)
//   flap          vertices beyond |z| > root hinge up and down (wings)
//   legs          vertices below y < legTop swing fore and aft, diagonal pairs
// Also charged to BIO.cur, baked with everything else.
BIO.animHook=function(o){o=o||{};
 const mode=o.mode||'orbit',flap=o.flap||null,legs=o.legs||null;
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
  '}'].join('\n');
 return function(sh){
  sh.uniforms.uWindT=BIO.WIND.t;
  sh.vertexShader=sh.vertexShader
   .replace('#include <common>','#include <common>\nuniform float uWindT;\nattribute vec4 aP0;\nattribute vec4 aP1;\n'+state)
   .replace('#include <begin_vertex>',[
    'vec3 transformed = vec3( position );',
    flap?[' { float _w = max(0.0, abs(position.z) - '+(flap.root==null?.12:flap.root).toFixed(3)+');',
          '   float _f = sin(uWindT*'+(flap.rate||6).toFixed(2)+' + aP1.y*7.0'+(mode==='walk'?' + aP1.x':'')+');',
          '   transformed.y += _w * _f * '+(flap.amp||.35).toFixed(3)+';',
          '   transformed.z -= sign(position.z) * _w * (1.0 - cos(_f*'+(flap.amp||.35).toFixed(3)+')) * 0.5; }'].join('\n'):'',
    legs?[' { float _lt = '+(legs.top||.5).toFixed(3)+';',
          '   if(position.y < _lt){ float _k = (_lt - position.y)/_lt;',
          '     float _ph = aP1.x + (position.x > 0.0 ? 0.0 : 3.14159) + (position.z > 0.0 ? 0.0 : 3.14159);',
          '     transformed.x += _k * sin(_ph) * '+(legs.amp||.18).toFixed(3)+';',
          '     transformed.y += _k * max(0.0, cos(_ph)) * '+((legs.amp||.18)*.35).toFixed(3)+'; }',
          '   else transformed.y += 0.02*sin(aP1.x*2.0); }'].join('\n'):''].join('\n'))
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
// additive). key must be unique per hook configuration.
BIO.animMat=function(key,o){const T=BIO.host.THREE;o=o||{};let m;
 if(o.basic)m=new T.MeshBasicMaterial({color:0xffffff,map:o.tex||null,vertexColors:!!o.vertexColors,transparent:!!o.additive,blending:o.additive?T.AdditiveBlending:T.NormalBlending,depthWrite:!o.additive,side:T.DoubleSide,fog:true});
 else m=new T.MeshLambertMaterial({color:0xffffff,map:o.tex||null,alphaTest:o.alphaTest||0,side:T.DoubleSide,vertexColors:!!o.vertexColors});
 m.onBeforeCompile=BIO.animHook(o);const ck='bioanim|'+BIO.kitKey(key);m.customProgramCacheKey=function(){return ck;};m.userData.bio={kind:'anim',key:BIO.kitKey(key),opts:o};
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
