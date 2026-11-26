// ================================================================= HOST — the final rebuild's air (BACKPORT.md section 1; nwlowlands' and oidong's lines)
// Every station (pair 10, 2026-11-04). R8: the flora in core/atmos's wind and its gust fronts; R7: the leaf and blade cut-outs by
// alpha-to-coverage on the MSAA canvas. HEIGHT FOG (R1; ?hfog=0 the plain fog): the air's fog at the ground under the eye, thinning
// above it; at dawn a sea mist pools on a coast station's water (below 8 m). THE FOG BELT (BACKPORT.md's row for Farside: the cloud
// station; ?belt=0): the onshore north-wester lifted up Yith's ridge condenses as a broken belt over it, thick on the windward (west)
// face, thinner in the lee (STAGE.belt). THE RAIN OCCLUSION MAP (R10): no rain, wet ground or rings under the crowns.
// Not taken: the seasons (H7): the coast is Af/Cfa, ever-wet and never cold below the heights (PLAN.md section 1); the native forest's
// seasons are its own look flag (NWLOW_LOOK), off for a reader.
{const AQ=new URLSearchParams(location.search),AON=k=>AQ.get(k)!=='0';window._air={hfog:false,belt:false,raincover:false};
 try{if(BIO.bindAtmosWind)BIO.bindAtmosWind();if(BIO.setA2C)BIO.setA2C(renderer);}catch(e){reportErr('air (wind, a2c): '+e.stack);}
 if(AON('hfog')&&ATMOS.heightFog){try{ATMOS.heightFog(Object.assign({falloff:1/700,sun:.35,sky:.35},SEA?{mist:{density:.0012,y:8,depth:14,noise:.7}}:{}));window._air.hfog=true;
   if(STAGE.belt&&AON('belt')&&ATMOS.fogBelt){window._belt=ATMOS.fogBelt(Object.assign({extent:[-SR*1.1,-SR*1.1,SR*1.1,SR*1.1],res:128,steps:8},STAGE.belt));window._air.belt=true;}
   ATMOS.heightFogScene(scene);}catch(e){reportErr('height fog: '+e.stack);}}
 if(ATMOS.rainCover){try{window._air.raincover=!!ATMOS.rainCover({renderer});}catch(e){reportErr('rain cover: '+e.stack);}}}
