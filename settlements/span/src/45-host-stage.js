// ================================================================= HOST — stage: the renderer, the lights, the stand-in ground
// The page's frame is the layout's: world x = u (downstream), world z = v (the right bank, +z), y = y (the rim at 0).
// SPAN_FRAME is what SPAN.toWorld takes; the station's page will hand its own (the canyon turned onto Pan Riba's course).
//
// THE GROUND is a stand-in: SPAN.groundAt (31-span-rules.js), the layout's own section (the benches, the bay, the slot, the
// head, the lake's bed, the cuts), meshed on a grid whose rows fall on the walls' break lines so the benches stand sheer.
// It is replaced by the swhighlands station's carve (core/terrain: KRELIEF.rille and pit, KSTRATA pillar, KCARVE) when that
// lands (PLAN.md section 5); nothing else on the page reads it but through SPAN.groundAt.
const SPAN_FRAME={x:0,z:0,ang:0,y0:0};
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;document.body.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0xb9c4c4,.00012);
const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.5,40000);
const hemi=new THREE.HemisphereLight(0xd6e2e4,0x5a4a3c,.62);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,1.3);sun.position.set(-3000,4200,-1800);scene.add(sun);
const fill=new THREE.DirectionalLight(0xbfd2ff,.25);fill.position.set(2000,1500,2600);scene.add(fill);
// the kit's night switch (kits/ancients 92-camera.js); its salvage fires read it each frame. No night state here yet.
let NIGHT=false;

// THE ROCK (SP5): core/terrain KSTRATA's 'pillar' recipe (red and white sandstones in turn, thin soft partings), laid level,
// for every rock face the page draws (the pillars, 8at-host-place.js, and the stand-in ground's walls), its grain the
// library's (materials.json: cross-bedded sandstone on the faces, cracked slickrock on the tops) mapped triplanar in world
// metres. SPAN_ROCK.mat(ground): the pillars' material (the strata's colour times the vertex colour, their occlusion), or the
// ground's (its steep faces take the strata over its vertex colours; the flats keep theirs). The pack is read at the first
// compile: its fragment (88x) loads after this one
const SPAN_ROCK=(function(){const L=SPAN_LAYOUT,fl=L.rim?Math.min(...L.rim.map(r=>r.floor),...L.pillars.map(q=>q.foot)):-260;
 const ST=KSTRATA.shade({recipe:'pillar',seed:2820,range:[fl-40,80],dip:[1,0,0],warp:[2,.6]},{THREE});
 const GREY=new THREE.DataTexture(new Uint8Array([120,120,120,255]),1,1);GREY.needsUpdate=true;
 const lib=n=>{const E=(typeof KMAT!=='undefined'&&KMAT.mode==='lib')?KMAT.packed('span',n):null;return E?{t:KMAT.textures(E,{aniso:8}).map,s:1/(E.scale||[8,8])[0]}:{t:GREY,s:.1};};
 const GRAIN=['{vec3 nn=normalize(vSWN),n=abs(nn);float sx=n.x/(n.x+n.z+1e-4);',
  ' vec3 tw=texture2D(uPW,vSWP.zy*uPWs).rgb*sx+texture2D(uPW,vSWP.xy*uPWs).rgb*(1.0-sx),tt=texture2D(uPT,vSWP.xz*uPTs).rgb;',
  ' float up=smoothstep(.55,.85,nn.y),l=dot(mix(tw,tt,up),vec3(.333)),g=clamp(pow(l/.47,1.4),.3,1.8);',
  ' float st=dot(texture2D(uPW,vec2((vSWP.x+vSWP.z)*.05,vSWP.y*.0035)).rgb,vec3(.333));',
  ' vec3 rock=mix(strataColor(vSWP,vSWN),vec3(.46,.16,.08),.4)*mix(vec3(1.0),vec3(.92,.84,.76),up)*g*mix(clamp(.55+.9*st,.6,1.15),1.0,up);'];
 /* the beds' colours drawn halfway to the column's warm red (the reference pillars are one rock, softly banded); varnish
    streaks down the faces (the wall map sampled long and thin); the tops a little dusted */
 function mat(ground){const m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:true});
  m.onBeforeCompile=sh=>{ST.inject(sh);const W=lib('pillarWall'),T=lib('pillarTop');
   Object.assign(sh.uniforms,{uPW:{value:W.t},uPWs:{value:W.s},uPT:{value:T.t},uPTs:{value:T.s}});
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D uPW,uPT;uniform float uPWs,uPTs;');
   sh.fragmentShader=ground
    ?sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+GRAIN.join('\n')+'\n diffuseColor.rgb=mix(diffuseColor.rgb,rock,1.0-smoothstep(.6,.85,nn.y));}')
    :sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+GRAIN.join('\n')+'\n diffuseColor.rgb*=rock;}');};
  m.customProgramCacheKey=()=>ground?'span-rock-ground':'span-rock';return m;}
 return {ST,mat};})();

const SPAN_GROUND=(function(){const L=SPAN_LAYOUT;
 // a patch of the ground: columns on a regular grid, but in each row the two nearest station 4's rim (its site record's line,
 // SPAN.rimAt) are moved to either side of it, so the cliff stands sheer wherever the line runs; rows on a regular grid plus
 // `rows` (the main patch's: a pair either side of every wall line, so a bench's face is sheer, not a 8 m ramp)
 function patch(U0,U1,V0,V1,DU,DV,rows){const us=[];for(let u=U0;u<=U1;u+=DU)us.push(u);
  const vs=new Set(rows||[]);for(let v=V0;v<=V1;v+=DV)vs.add(v);
  const V=[...vs].filter(v=>v>=V0&&v<=V1).sort((a,b)=>a-b),nu=us.length,nv=V.length,P=new Float32Array(nu*nv*3);
  for(let j=0;j<nv;j++){const v=V[j],row=us.slice();
   if(L.rim){const uR=SPAN.rimAt(L,v).u;for(let i=1;i<nu-2;i++)if(row[i]<=uR&&uR<row[i+1]){row[i]=uR-.02;row[i+1]=uR+.02;break;}}
   for(let i=0;i<nu;i++){const u=row[i],w=SPAN.toWorld(SPAN_FRAME,u,v,SPAN.groundAt(L,u,v)),k=(j*nu+i)*3;P[k]=w[0];P[k+1]=w[1];P[k+2]=w[2];}}
  const I=[];for(let j=0;j<nv-1;j++)for(let i=0;i<nu-1;i++){const a=j*nu+i,b=a+1,c=a+nu,d=c+1;I.push(a,c,b,b,c,d);}
  return {P,I,n:nu*nv};}
 const rows=[];Object.keys(L.half).forEach(k=>{const h=L.half[k];[h,-h].forEach(b=>{rows.push(b-.02,b+.02);});});
 L.cuts.forEach(c=>{[c.box[2],c.box[3]].forEach(b=>{rows.push(b-.02,b+.02);});});
 // the canyon (as before) and, along the rim to the watch pillar and past it, a second patch on the same rules
 const A=patch(-2700,1800,-850,850,6,8,rows),Bp=patch(900,1800,-2400,-850,6,8,null),NV=A.n+Bp.n,P=new Float32Array(NV*3),C=new Float32Array(NV*3);
 P.set(A.P,0);P.set(Bp.P,A.n*3);const I=A.I.concat(Bp.I.map(i=>i+A.n));
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();
 // the colours: the tableland's turf, the pillar sandstone's red and bleached beds on the faces (a bed every ~14 m,
 // wandering by KRAND's noise), moss on the benches, sand and scrub on the floors, the lake's mud
 const N=g.attributes.normal;
 for(let k=0;k<NV;k++){const x=P[k*3],y=P[k*3+1],z=P[k*3+2],ny=N.getY(k),n=KRAND.fbm(x/60,y/40,z/60,3,2820),
  lake=SPAN.inPoly(L.lake.pts,x,z)&&y<L.lake.level+.5;let r,gg,b;
  if(lake){r=.33;gg=.30;b=.25;}
  else if(ny>.82){if(y>-1){r=.40+.08*n;gg=.47+.06*n;b=.27;}else if(y>-140){r=.36+.06*n;gg=.42+.05*n;b=.28;}else{r=.55+.06*n;gg=.47+.05*n;b=.36;}}
  else{const bed=Math.floor((y+n*9)/14)&1;r=bed?.86:.64;gg=bed?.80:.31;b=bed?.72:.25;const s=.88+.18*n;r*=s;gg*=s;b*=s;}
  C[k*3]=Math.pow(r,2.2);C[k*3+1]=Math.pow(gg,2.2);C[k*3+2]=Math.pow(b,2.2);}   /* the colours above are sRGB; vertex colours are linear */
 g.setAttribute('color',new THREE.BufferAttribute(C,3));
 const m=new THREE.Mesh(g,SPAN_ROCK.mat(true));m.userData.probeSkip=true;m.userData.ground=true;scene.add(m);
 return m;})();
