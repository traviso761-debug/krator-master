// ================================================================= BIOME CORE — the hex-cell ground dither (X4)
// DITHERED SAMPLING, lifted from Korona (biomes/korona/src/47-host-land.js, the owner's 2026-10-19 rulings) and Farside (its
// copy, 2026-10-26): one copy for every ground. A map is read through a HEX-CELL BOMB: the plane is cut into triangles ~2
// tiles across, each corner turns and shifts the tile by its own hash, and a point blends the three corners' reads
// (weights cubed, so most of a cell is one read: no ghosting), so no two cells show the tile the same way up and no repeat
// can line up. That is done at the map's scale and again at a third of it, the two mixed by a value noise, with a coarse
// mottle (kmacro, 48 m and 140 m) for the ground's own light and dark. kditherW keeps a wall's beds level (the shift, a
// few degrees of turn). GLSL ES 1.0 (three r128); the hash is Hoskins' fract hash, not a sine.
//   BIO.DITHER     the GLSL text: put it after <common> in a ground's fragment shader, then read a map with
//                  kdither(map, uv), kditherW(map, uv) (level beds), kdither2(map, uv, turn 0..1), times kmacro(world xz)
//   BIO.ditherCell(x, y, cell) -> {v:[[i,j] x3], w:[3]}: the JS twin of kbomb's cell and weights (a port checks its
//                  own against it; the Godot ground.gdshader writes the same functions, GODOT-PLAN.md section 6)
// It is the text both biomes carried, character for character (core/biome/test-foliage.js holds its SHA-1). The core
// ground shader (R4, core/terrain) is to take it over; until then a ground lists this file and reads BIO.DITHER.
(function(){
BIO.DITHER=[
 'vec2 kh2(vec2 p){vec3 q=fract(vec3(p.xyx)*vec3(0.1031,0.1030,0.0973));q+=dot(q,q.yzx+33.33);return fract((q.xx+q.yz)*q.zy);}',
 'float kvn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(kh2(i).x,kh2(i+vec2(1.0,0.0)).x,f.x),mix(kh2(i+vec2(0.0,1.0)).x,kh2(i+vec2(1.0,1.0)).x,f.x),f.y);}',
 'float kfbm(vec2 p){return 0.6*kvn(p)+0.3*kvn(p*2.3+7.1)+0.1*kvn(p*5.1+3.7);}',
 'vec4 ksamp(sampler2D m,vec2 p,vec2 v,float sd,float rot){vec2 h=kh2(v*0.37+sd);float a=(h.x-0.5)*6.2831853*rot,ca=cos(a),sa=sin(a);return texture2D(m,vec2(ca*p.x-sa*p.y,sa*p.x+ca*p.y)+h*13.0);}',
 'vec4 kbomb(sampler2D m,vec2 p,float cell,float sd,float rot){vec2 st=p/cell;vec2 sk=vec2(st.x-st.y*0.57735027,st.y*1.1547005);vec2 b=floor(sk),f=fract(sk);vec2 v1,v2,v3;vec3 w;',
 ' if(f.x+f.y<1.0){v1=b;v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(1.0-f.x-f.y,f.x,f.y);}else{v1=b+vec2(1.0,1.0);v2=b+vec2(1.0,0.0);v3=b+vec2(0.0,1.0);w=vec3(f.x+f.y-1.0,1.0-f.y,1.0-f.x);}',
 ' w=w*w*w;w/=(w.x+w.y+w.z);return ksamp(m,p,v1,sd,rot)*w.x+ksamp(m,p,v2,sd,rot)*w.y+ksamp(m,p,v3,sd,rot)*w.z;}',
 'vec4 kdither2(sampler2D m,vec2 p,float rot){vec4 a=kbomb(m,p,1.9,0.0,rot);vec4 b=kbomb(m,p*0.33+vec2(2.3,5.1),1.4,7.0,rot);float n=kfbm(p*0.055+vec2(1.7,9.2));return mix(a,b,0.2+0.6*smoothstep(0.3,0.7,n));}',
 'vec4 kdither(sampler2D m,vec2 p){return kdither2(m,p,1.0);}',
 'vec4 kditherW(sampler2D m,vec2 p){return kdither2(m,p,0.08);}',
 'vec3 kmacro(vec2 p){float mv=kfbm(p*0.021+vec2(4.2,1.3)),mh=kfbm(p*0.0072+vec2(9.1,3.3));return (0.76+0.48*mv)*mix(vec3(0.93,0.9,0.86),vec3(1.05,1.04,0.97),mh);}',
 ''].join('\n');
// the cell a point falls in and its three corners' weights, as kbomb computes them
BIO.ditherCell=function(x,y,cell){const sx=x/cell,sy=y/cell,kx=sx-sy*0.57735027,ky=sy*1.1547005,bx=Math.floor(kx),by=Math.floor(ky),fx=kx-bx,fy=ky-by;
 let v,w;if(fx+fy<1){v=[[bx,by],[bx+1,by],[bx,by+1]];w=[1-fx-fy,fx,fy];}else{v=[[bx+1,by+1],[bx+1,by],[bx,by+1]];w=[fx+fy-1,1-fy,1-fx];}
 w=w.map(a=>a*a*a);const s=w[0]+w[1]+w[2];return{v,w:w.map(a=>a/s)};};
})();
