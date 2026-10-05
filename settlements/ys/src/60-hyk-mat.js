// ================================================================= HYKKOUSOI — palette, textures, materials, kit items
// The grown city's surfaces. Every texture is painted NEAR-GREY so the colour comes from the vertex colour (merged
// shells) or the instance colour (lips, lenses, drips): one shell map serves chalk-white, cream and coral alike.
// Two material sets: `MAT.hk*` with vertexColors for the merged buckets (61-hyk-shell.js), `MAT.hk*I` without for
// the instanced kit items (a geometry with no colour attribute and vertexColors:true renders black in r128).
// Colour rule (DESIGN §4): white, cream and ivory shell in the sun; sea-teal in glass and the nacre's shadow; coral
// pink and sea-green at rich; grey barnacle at poor; weed-green and crust-black at the waterline on everything.
const HPAL={
 shell:[0xf3ece0,0xeee5d6,0xf7f1e6,0xe6dccb,0xf0e8da],          // calcareous white / cream
 shellWarm:[0xe9d9c2,0xe2cfb3,0xf0e2cc,0xdcc9ad],               // sun-warmed, older shell
 coral:[0xe8a08c,0xdd8f7c,0xf0b5a2,0xcf7a6a,0xf2c0b0],          // coral pink (rich accents)
 teal:[0x3e9c96,0x2f8a86,0x57b2ab,0x7fcfc6],                    // sea teal (glass, pools, the nacre's shadow)
 seaGreen:[0x6aa892,0x4f8f7a,0x86bfa8],                         // sea-green accents (rich)
 barnacle:[0xcdc8bd,0xc0bbb0,0xd6d1c6,0xb3aea3,0xc8c3b8],       // grey-white (poor)
 bone:[0xf1e9d8,0xe9e0cc,0xf6efe2,0xe4dac6],                    // ivory ribs and bridges
 weed:[0x3c5a3a,0x2f4a30,0x4a6a42,0x35553a],
 crust:[0x2a2622,0x332e28,0x1f1c19,0x3a342c],
 nacre:[0xf4f0ea,0xeae8ee,0xf0eef4,0xf6f2ec],                   // pale: the hook adds the play of colour
 floor:[0xd9cfbc,0xcfc4b0,0xe0d6c4],
 lens:[0x9fe0d8,0x8fd0cc,0xb0e8e0],
 lampWarm:0xffd9a0,lampCool:0x8ff0e0,
};
const hC=(hex,k)=>vC(hex,k);                                     // sRGB hex -> linear Color (69b's vC)
const hPick=a=>a[(rng()*a.length)|0];
// ---------------------------------------------------------------- textures (256 px = 4 m)
TEX.hkShell=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // calcareous shell: fine growth lines, a stronger ring now and then, mottle
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=202+(fbm(x/44,y/7,2.2,3)-.5)*20+(fbm(x/15,y/15,5.1,2)-.5)*14;
  const ring=(y+Math.floor(fbm(x/60,0,3.3,2)*6))%41;if(ring<2)v-=16;else if(ring<3)v-=6;   // a growth ring every 0.64 m, slightly wandering
  if(y%9===0)v-=4;                                                                          // the fine lines between
  if(fbm(x/6,y/6,9.2,2)>.74)v-=9;                                                           // pitting
  d[i]=v;d[i+1]=v*.985;d[i+2]=v*.955;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.hkBarn=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // barnacle: plates of uneven width, growth lines across them, pits
 const edges=[];let xx=0;while(xx<w){edges.push(xx);xx+=9+Math.floor(h3(xx*.37,1.1,4.4)*14);}edges.push(w);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;let k=0;while(edges[k+1]<=x)k++;const fx=x-edges[k],pw=edges[k+1]-edges[k];
  let v=198+(h3(k*1.7,0,2.1)-.5)*22+(fbm(x/24,y/9,4.4,3)-.5)*22;
  const e=Math.min(fx,pw-1-fx);if(e<1)v-=30;else if(e<2)v-=10;else v+=6*Math.sin(fx/pw*Math.PI);   // a soft rounded plate with a dark seam
  const gl=(y+Math.floor(h3(k*2.3,0,1.3)*20))%23;if(gl<1)v-=12;                               // growth lines across each plate, offset per plate
  if(fbm(x/5,y/5,7.7,2)>.72)v-=22;                                                            // pits
  d[i]=v;d[i+1]=v*.985;d[i+2]=v*.96;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.hkBone=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // ivory: longitudinal grain, faint pores
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=214+(fbm(x/5,y/48,3.3,3)-.5)*16+(fbm(x/20,y/20,6.1,2)-.5)*8;if(fbm(x/3,y/3,8.5,1)>.78)v-=10;
  d[i]=v;d[i+1]=v*.985;d[i+2]=v*.95;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.hkMosaic=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // fish-scale tiles, 0.4 m, staggered rows
 const S=26;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  const row=Math.floor(y/(S*.5)),off=(row%2)*S/2;const cx=Math.floor((x+off)/S)*S+S/2-off,cy=row*S*.5;
  const dx=x-cx,dy=y-cy;const r=Math.hypot(dx,dy);
  let v=192+(h3(Math.floor((x+off)/S)*1.3,row*2.1,3.3)-.5)*30;
  if(r>S*.5-1.5)v-=56;else if(dy<-S*.3)v+=12;                                                 // the dark edge of each scale, a light top
  d[i]=v;d[i+1]=v*.98;d[i+2]=v*.96;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.hkCrust=canvasTex(256,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // the tideline: black crust, barnacle specks, salt streaks
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=96+(fbm(x/14,y/14,3.1,3)-.5)*40;const b=fbm(x/4,y/4,8.8,2);if(b>.73)v+=70*(b-.73)*4;
  if(fbm(x/2,y/40,5.5,2)>.68)v+=14;
  d[i]=v;d[i+1]=v*.98;d[i+2]=v*.95;d[i+3]=255;}
 g.putImageData(id,0,0);});
TEX.hkWeed=canvasTex(128,256,(g,w,h)=>{const id=g.createImageData(w,h),d=id.data;   // hanging weed: streaks down, ragged
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;
  let v=120+(fbm(x/3,y/40,4.2,2)-.5)*70+(fbm(x/10,y/10,6.6,2)-.5)*20;
  d[i]=v*.85;d[i+1]=v;d[i+2]=v*.8;d[i+3]=255;}
 g.putImageData(id,0,0);});
// ---------------------------------------------------------------- materials
// `hkMatPair(key,map,opt)`: MAT[key] for the merged buckets (vertexColors) and MAT[key+'I'] for instanced items.
function hkMatPair(key,map,opt){opt=opt||{};const base={map,roughness:opt.rough!=null?opt.rough:.7,metalness:opt.metal||0};
 if(opt.side)base.side=opt.side;
 MAT[key]=new THREE.MeshStandardMaterial(Object.assign({vertexColors:true},base));
 MAT[key+'I']=new THREE.MeshStandardMaterial(Object.assign({},base));}
hkMatPair('hkShell',TEX.hkShell,{rough:.62});
hkMatPair('hkBarn',TEX.hkBarn,{rough:.88});
hkMatPair('hkBone',TEX.hkBone,{rough:.48,metal:.02});
hkMatPair('hkMosaic',TEX.hkMosaic,{rough:.32,metal:.06});
hkMatPair('hkCrust',TEX.hkCrust,{rough:.96});
hkMatPair('hkWeed',TEX.hkWeed,{rough:.85,side:THREE.DoubleSide});
hkMatPair('hkFloor',TEX.hkShell,{rough:.74});
hkMatPair('hkIn',TEX.hkShell,{rough:.7});                        // interior skins (built facing inward)
hkMatPair('hkNacre',TEX.hkShell,{rough:.22,metal:.18});
hkMatPair('hkVerd',TEX.hkShell,{rough:.5,metal:.3});             // verdigris bronze (the Citadel's spires and dome): the library's metal.bronze.verdigris, else shell tinted sea green
// THE NACRE HOOK: mother-of-pearl is a view-dependent play of colour. At grazing angles the diffuse colour is
// mixed toward a cosine rainbow keyed on the view angle and the surface height, so a dome crown or a door
// surround shifts from pink to green to blue as the camera moves. The constants live in the source text and
// the cache key names it, so r128 never shares this program with the plain shell (the Jimjam lesson). It is
// inserted after the normal exists and before the lighting reads diffuseColor.
function hkNacreHook(sh){if(typeof portUWsh==='function')portUWsh(sh);
 sh.fragmentShader=sh.fragmentShader.replace('#include <normal_fragment_maps>',['#include <normal_fragment_maps>',
  '{ vec3 _nv=normalize(vViewPosition); float _f=1.0-clamp(abs(dot(normalize(normal),_nv)),0.0,1.0);',
  '  float _t=_f*1.6+0.11*sin(vViewPosition.y*0.9)+0.07*cos(vViewPosition.x*1.3);',
  '  vec3 _ir=0.5+0.5*cos(6.28318*(vec3(0.0,0.33,0.67)+_t));',
  '  diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*(0.74+0.40*_ir),0.10+0.46*_f); }'].join('\n'));}
MAT.hkNacre.onBeforeCompile=hkNacreHook;MAT.hkNacre.customProgramCacheKey=()=>'hkNacre';
MAT.hkNacreI.onBeforeCompile=hkNacreHook;MAT.hkNacreI.customProgramCacheKey=()=>'hkNacreI';
MAT.hkGlow=new THREE.MeshBasicMaterial({color:0xffe6c0});                                     // pearl lamps: unlit, tinted per instance
MAT.hkGlowCool=new THREE.MeshBasicMaterial({color:0x9ff4e4});
MAT.hkLens=new THREE.MeshStandardMaterial({color:0x9fe0d8,transparent:true,opacity:.6,roughness:.08,metalness:.1,depthWrite:false});
MAT.hkFoam=new THREE.MeshBasicMaterial({color:0xf4f8f6,transparent:true,opacity:.55,depthWrite:false,fog:true});
// ---------------------------------------------------------------- kit items (instanced; colour per instance)
kdef('hkLip',new THREE.TorusGeometry(1,.13,8,28),MAT.hkShellI);          // the lip of an opening: radius 1, scaled; +z is its axis
kdef('hkLipN',new THREE.TorusGeometry(1,.13,8,28),MAT.hkNacreI);         // the same in nacre (rich, civic)
kdef('hkReveal',new THREE.CylinderGeometry(1,1,1,20,1,true),MAT.dark);  // open tube: the dark reveal through a shell
kdef('hkDisc',new THREE.CircleGeometry(1,20),MAT.dark);                  // dark disc: a window's interior shadow
kdef('hkLens',new THREE.SphereGeometry(1,10,8),MAT.hkLens);              // glass lenses set in domes
kdef('hkPearl',new THREE.SphereGeometry(1,10,8),MAT.hkGlow);             // a glow-pearl (warm)
kdef('hkPearlC',new THREE.SphereGeometry(1,10,8),MAT.hkGlowCool);        // a bioluminescent jar (cool)
kdef('hkDrip',new THREE.ConeGeometry(1,1,7),MAT.hkShellI);               // a drip hanging under a grown-on pod (point down after a flip)
kdef('hkBall',new THREE.SphereGeometry(1,12,10),MAT.hkShellI);           // nodules, barnacle specks, sconces
kdef('hkBarnB',new THREE.SphereGeometry(1,8,6),MAT.hkBarnI);             // barnacle specks (grey)
kdef('hkTread',new THREE.BoxGeometry(1,1,1),MAT.hkBoneI);                // stair treads, sills, thresholds
kdef('hkPost',new THREE.CylinderGeometry(1,1,1,8),MAT.hkBoneI);          // stalks, rails, posts (base at the centre: y-centred)
kdef('hkWeedCard',new THREE.PlaneGeometry(1,1),MAT.hkWeedI);             // a hanging weed ribbon (top edge at the anchor after a shift)
hykFurnKitDefs();                                                        // the furniture frame's primitives (35-furn-frame.js), now that the materials exist
