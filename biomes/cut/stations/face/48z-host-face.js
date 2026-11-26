// ================================================================= HOST — the cut face's own surface (station 3)
// [draw] The face is not ground like the rest: it is the sphere's clean section through the Wall's beds, never weathered, so it
// takes a polished standard material (a satin roughness: the sun's glint spreads, as off sawn stone, without blowing out) over the ground mesh's cells where STAGE.faceK is
// strong, mapped so the beds run LEVEL across it (u along the lip, v by height: rock.cut.polished, 7 m a tile, from the library),
// tinted a little by height. Without the pack it is the ground's own colour, polished. The lichen discs lie on it (57).
// THE ROCK IN SECTION (the final rebuild, pair 10, 2026-11-04; kits/resources/ROCK-PROPOSAL.md, "Where the biomes must change" 1): the geology bake
// (kits/resources/data/geology.json, 5.1) puts this lip in the `impact` province (impactite 255 at px 427,302; granite begins ~6 km inside), so what the
// sphere sawed through here is the crater wall's MEGABRECCIA, not level beds: KSTRATA's `megabreccia` recipe (swhighlands' `crest`, nhighlands' crags)
// at the face's scale, unweathered (no wash, no dust: nothing has had time to weather it), every block sawn flat and polished like a breccia slab;
// the library's rock.megabreccia.polished (delivered 2026-11-10; rock.megabreccia, the weathered face, before it) is the slab's grain. ?strata=0: the level beds of the first build (rock.cut.polished) (a look decision for the owner: KNOWN_ISSUES.md)
const FACE_BRECCIA=(function(){if(new URLSearchParams(location.search).get('strata')==='0'||typeof KSTRATA==='undefined'||!BIO.strata)return null;
 try{const R0=KSTRATA.recipe('megabreccia');if(R0&&!KSTRATA.RECIPES['cut-face-breccia'])KSTRATA.add(Object.assign({},R0,{name:'cut-face-breccia',fx:Object.assign({},R0.fx,{wash:false}),
   blocks:Object.assign({},R0.blocks,{size:22,nest:{kind:'fine',size:2.6}})}));
  return BIO.strata({recipe:KSTRATA.RECIPES['cut-face-breccia']?'cut-face-breccia':'megabreccia',seed:CUT.SEED+48,range:[-600,1400],dip:[.6,.8,.004],warp:[5,1.5],wash:false,regolith:0,res:.25,private:true});}
 catch(e){reportErr('face strata: '+e.stack);return null;}})();
const FACE_MESH=(function(){const g=GROUND.mesh.geometry,p=g.attributes.position,ix=g.index.array,pos=[],uv=[],col=[];
 const L=(typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed)?KMAT.packed('cut','ground.face'):null,T=1/12;   /* 12 m a tile: the beds read as bands metres thick */
 for(let t=0;t<ix.length;t+=3){const a=ix[t],b=ix[t+1],c=ix[t+2],cx=(p.getX(a)+p.getX(b)+p.getX(c))/3,cz=(p.getZ(a)+p.getZ(b)+p.getZ(c))/3;
  if(STAGE.faceK(cx,cz)<.45)continue;
  for(const v of [a,b,c]){const x=p.getX(v),y=p.getY(v)+.06,z=p.getZ(v);pos.push(x,y,z);uv.push(z*T,y*T);const k=.92+.08*Math.sin(y*.013);col.push(k,k*.985,k*.97);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.computeVertexNormals();
 /* with the megabreccia on, the grain is the library's rock.megabreccia.polished (ground.breccia), 3 m a tile, normalised to its mean; else rock.cut.polished's beds */
 const LB=FACE_BRECCIA&&typeof KMAT!=='undefined'&&KMAT.mode==='lib'&&KMAT.packed?KMAT.packed('cut','ground.breccia'):null;
 const map=LB?KMAT.textures(LB,{aniso:8}).map:L?KMAT.textures(L,{aniso:8}).map:null;if(map){map.wrapS=map.wrapT=THREE.RepeatWrapping;if(LB)map.repeat.set(3,3);}
 const mat=new THREE.MeshStandardMaterial({color:0xb4aca2,map,vertexColors:true,roughness:.52,metalness:0,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 const S=FACE_BRECCIA;
 /* the block's colour from KSTRATA; the grain set's texel about its own mean (its last mip), so the slab keeps a fine grain inside each block.
    The grain is read through the core hex-cell dither (BIO.DITHER, kdither: each cell turns and shifts the tile, at its scale and a third of it),
    so the 3 m tile does not repeat in rows across the face from afar (the owner, 2026-11-10); a breccia has no up, so the full turn */
 const DITH=!!(map&&typeof BIO!=='undefined'&&BIO.DITHER);
 if(S){mat.onBeforeCompile=sh=>{S.inject(sh);if(DITH)sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+BIO.DITHER)
   .replace('#include <map_fragment>','vec4 texelColor=mapTexelToLinear(kdither(map,vUv));diffuseColor*=texelColor;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <color_fragment>',['#include <color_fragment>',
   map?'{vec3 kb=strataColor(vSWP,vSWN);vec3 mm=mapTexelToLinear(texture2D(map,vUv,16.0)).rgb;float gr=clamp(dot(texelColor.rgb,vec3(0.333))/max(dot(mm,vec3(0.333)),0.02),0.6,1.4);diffuseColor.rgb=kb*gr*vColor;}'
    :'{diffuseColor.rgb=strataColor(vSWP,vSWN)*vColor;}'].join('\n'));};mat.customProgramCacheKey=()=>'cut-face-breccia|'+!!map+'|'+DITH;mat.color.set(0xffffff);}
 const m=new THREE.Mesh(geo,mat);m.userData.host=true;m.userData.rock=true;
 m.userData.inspectLabel=S?'The cut face (the sphere\'s section through the crater wall\'s megabreccia, polished)':'The cut face (the sphere\'s section through the Wall\'s beds, polished)';scene.add(m);
 return{mesh:m,mat,tris:pos.length/9,strata:S?'cut-face-breccia':null};})();
