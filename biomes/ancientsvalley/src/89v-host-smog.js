// ================================================================= HOST - the smog (core/atmos height fog) and the colour of the air
// [web] The owner, 2026-11-08: "a frequent atmos effect of dark, unnaturally turbulent, coloured or softly glowing cloudiness and medium-distance
// smog, thick fog and haze; near cities this becomes universal; it should enhance the atmosphere and help sell the LOD". This page is all
// city1, so here it is universal: the sky's clouds low, heavy and fast and the air turbid and dust-coloured (STAGE.clouds, STAGE.airLook, 89s),
// the page's fog thick (STAGE.fogDensity: 2 km half veiled, 4 km gone, the far tiers with it), and on top of that the height fog's two layers:
// THE MIST, the smog itself, pooled on the valley floor and thinning over the shelf (full under lakeY + above, gone `depth` m higher, in
// drifting patches), and THE BAND, a broken layer of dark cloud over the city at the tallest towers' height (their tops go into it).
// THE COLOUR OF THE AIR (the owner, 2026-11-09: "the distant buildings just always look greenish blue and it doesn't look right against a yellow
// sky"; "adjust the shader for distant buildings during storm and fog to make it more similar to cloud color"). The far towers take their colour
// from the fog (the shells' and impostors' own FogExp2), the mist (the height fog) and the hemisphere light. Three things made that blue-green under
// a yellow sky: the weather pulled the fog toward a fixed blue-grey in rain and fog (core/atmos weatherhost, 0x9aa0a6), the mist took 45% of the
// sky's ZENITH blue (`sky:.45` here), and the hemisphere's sky colour is blue by its preset; and the smog's own pull toward a purple-grey ran in
// a tick, before the sky's update in the frame, so the sky overwrote it every frame. Now AV_AIR.view runs in the frame's view phase after the
// sky (99 registers it after skyView): the fog is the sky's own horizon colour (its fog colour, which is what lies behind a far tower), moved
// toward the CLOUDS' colour (the cloud deck's tint, darkened by its darkness) as the cloud cover, the rain and the fog rise, with a fifth of the
// smog's purple-grey; the hemisphere's sky colour leans to the same cloud colour under a storm; the mist takes a small share of the zenith.
(function(){const S=STAGE.smog;if(!S||typeof ATMOS.heightFog!=='function')return;const LY=STAGE.lakeY;
 ATMOS.heightFog({falloff:1/760,sun:.3,sky:.12,
  mist:Object.assign({density:S.mist.density,y:LY+S.mist.above,depth:S.mist.depth,noise:S.mist.noise,day:S.mist.day==null?0:S.mist.day},
   S.mist.field?{field:{at:(x,z)=>STAGE.F.density(x,z),centre:[0,0],radius:7000,res:128},samples:6}:{}),   /* the field: core/atmos 2026-11-09; an older core ignores the keys */
  band:{density:S.band.density,y:[LY+S.band.y[0],LY+S.band.y[1]],cover:S.band.cover,noise:S.band.noise}});
 ATMOS.heightFogScene(scene);
 const smogLin=new THREE.Color().setRGB(S.colour[0],S.colour[1],S.colour[2]),k=S.mix==null?.2:Math.min(.3,S.mix);
 const KC=ATMOS.KC?ATMOS.KC():null,hor=new THREE.Color(),cld=new THREE.Color(),tmp=[0,0,0];
 const lin=(c,out)=>{if(KC){KC.lin([c.r,c.g,c.b],out);return out;}return out.copy(c).convertSRGBToLinear();};
 const view=function(){if(!scene.fog||typeof SKY==='undefined'||!SKY.uniforms)return;const U=SKY.uniforms,W=ATMOS.W||{};
  lin(U.uFogC.value,hor);
  /* the clouds' colour as the sky draws them, in display space first: the deck's tint where the mood tints it, else the horizon's, darkened by the
     deck's darkness; then linear */
  const X=U.uCloudX?U.uCloudX.value:null,tk=X?Math.min(1,X.w):0,dark=X?X.x:0,T=U.uCloudTint?U.uCloudTint.value:null,hd=U.uFogC.value;
  const r=(hd.r+((T?T.r:hd.r)-hd.r)*tk*.7)*(1-.45*dark),g=(hd.g+((T?T.g:hd.g)-hd.g)*tk*.7)*(1-.45*dark),b=(hd.b+((T?T.b:hd.b)-hd.b)*tk*.7)*(1-.45*dark);
  lin({r,g,b},cld);
  const cover=SKY.look&&SKY.look.cover!=null?SKY.look.cover:.5,storm=Math.min(1,Math.max(W.rain||0,(W.fog||0)*.9));
  const toCloud=Math.min(1,.3*cover+.7*storm);
  scene.fog.color.copy(hor).lerp(cld,toCloud).lerp(smogLin,k);
  /* under a storm the sky light is the cloud deck's: the far tiers (shells, impostors) read the hemisphere */
  if(typeof HEMI!=='undefined'&&HEMI&&storm>0)HEMI.color.lerp(cld,.6*storm);};
 window.AV_AIR={view,toCloudAt:()=>null};
 window.AV_SMOG={mist:S.mist,band:S.band,colour:S.colour};})();
