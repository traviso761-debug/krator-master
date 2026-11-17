// ================================================================= HOST — the wall's beds: STATION 8, South Glass (PLAN.md section 11.2)
// KSTRATA's obsidian-pancake recipe (core/terrain/35-core-strata.js: 2-6 m ledges of flow-banded black and mahogany obsidian, grey rhyodacite, pale
// perlite crumble, frothy pumice partings, a rare fumarolic seam) painted on the dome's wall by its shader (core/terrain/host/35-core-strata-shade.js,
// the core path: the bed the GPU draws is the bed S.at reports). One stack for the station from the moat to the top, the beds near level as the dome's
// flow banding is under its carapace, folded gently along the wall (the ramp structures of a spreading dome). On the ground's material as a KHOOK layer
// after KGROUND's (84): the wall's colour (the rock layer, vRock) moved by each bed's colour over the recipe's mean; the glass sheen as low roughness on
// the obsidian beds and the carapace (vIce carries the glass here: 44z). ?strata=0 the wall without its beds.
const GLASS_STRATA=(function(){if(GQ.get('strata')==='0'||typeof KSTRATA==='undefined'||!BIO.strata||typeof KHOOK==='undefined')return null;
 const S=BIO.strata({recipe:'obsidian-pancake',seed:8301,range:[4000,5200],dip:[.574,-.819,.004],warp:[4,1.3],
  fold:{dir:[.574,-.819],wl:300,amp:12,phase:.2,sharp:.25,at:[0,0]},res:.25,private:true});
 /* the recipe's mean colour by share (linear), so a bed moves the layer's own grain toward its colour and the wall keeps the library's texture */
 const R=KSTRATA.recipe('obsidian-pancake'),lin=v=>Math.pow(v/255,2.2);let w=0,m=[0,0,0];
 for(const k in R.kinds){const K=R.kinds[k],c=K.col[0],p=K.p||0;m[0]+=p*lin(c>>16&255);m[1]+=p*lin(c>>8&255);m[2]+=p*lin(c&255);w+=p;}
 const MEAN='vec3('+m.map(v=>(v/w).toFixed(4)).join(',')+')';
 KHOOK.add(MAT_GROUND,'firebliss-glass-strata',(sh)=>{S.inject(sh);
  KHOOK.f(sh,'vWet);}','vWet);}\nfloat fbGlassy=0.0;{vec3 sc=strataColor(vSWP,vSWN);float ws=clamp(vRock*1.15,0.0,1.0)*(1.0-vSnow*0.6);'+
   'diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*clamp(sc/'+MEAN+',vec3(0.3),vec3(2.4)),ws*0.85);'+
   'fbGlassy=max(vIce*(1.0-vSnow),ws*(1.0-smoothstep(0.02,0.08,dot(sc,vec3(0.3333)))));}','firebliss-glass-strata');
  if(sh.fragmentShader.indexOf('#include <roughnessmap_fragment>')>=0)
   KHOOK.f(sh,'#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,0.2,fbGlassy*0.85);','firebliss-glass-strata');},
  {order:5,key:'firebliss-glass-strata'});
 return{S,mean:MEAN};})();
