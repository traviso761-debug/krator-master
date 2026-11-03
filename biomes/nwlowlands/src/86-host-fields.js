// ================================================================= HOST - the water's records, its fields, and what reads them
// Before the build, because the flora and the ground take the water's own numbers (the rebuild's checklist; core/biome README "The environmental fields"; core/water ext/60):
//   the SURFACES   the lake and the river's records (moved from 89w, which draws them); the page's one open surface at y=0 (89w's notes)
//   WATER.fields   the shore distance, depth and running-water distance of the water the eye sees, at 8 m over the map
//   BIO.env        the contract's table on them: FIELD.wet's water share and the flora's shore band read `shore` (wetShare, FIELD.shoreM), not height or seaIn
//   GLW            the ground's layer weights, each by a named mask, written onto the ground meshes' attributes
//   the MARL       KSTRATA's beds on the gorge's walls, the record's hardness feeding the ledge plants (88's gorge pass)
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const WATER_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],WATER_CELL=8,WATER_NX=Math.ceil((WATER_BOX[2]-WATER_BOX[0])/WATER_CELL);
// the ground at the bed's cell centres, once: the shore grid and the masks read this array (bakeBed and shoreGrid sample at those centres)
const WATER_G=new Float32Array(WATER_NX*WATER_NX);
for(let j=0;j<WATER_NX;j++)for(let i=0;i<WATER_NX;i++)WATER_G[j*WATER_NX+i]=terrainH(WATER_BOX[0]+(i+.5)*WATER_CELL,WATER_BOX[1]+(j+.5)*WATER_CELL);
const waterBed=(x,z)=>WATER_G[Math.min(WATER_NX-1,Math.max(0,Math.floor((z-WATER_BOX[1])/WATER_CELL)))*WATER_NX+Math.min(WATER_NX-1,Math.max(0,Math.floor((x-WATER_BOX[0])/WATER_CELL)))];
// ONE open surface (2026-10-21; it was a sea with a shore grid plus a second masked, bed-less tea-dark surface at the same level): the shore grid is flooded from the middle of the
// water AND from every inland hollow (a predicate seed: inland of the shore, where the bayou, its oxbows and the river's lowland reach lie), so the surface stops where the water does;
// the bayou's, the delta's and the river's tea-dark colour is a tint field over it (alpha 1 inland, fading 120 m out over the delta's plume instead of the old hard step at the mask edge).
// surf is off: the bed is the true bed (no 1.4 m clamp) and a lap of white on the bayou's shallows is wrong; the sea's beach loses its lap line with it.
const INLAND_COL=lin(BAYOU_COL.clone().lerp(RIVER_COL,.5).multiplyScalar(.8)),INLAND_HEX=((Math.round(INLAND_COL.r*255)<<16)|(Math.round(INLAND_COL.g*255)<<8)|Math.round(INLAND_COL.b*255));
const ss01=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const SEA_SEED=xzOf(-2600,0);
const WATER_TINT={box:WATER_BOX,cell:2*WATER_CELL,at:(x,z)=>{const si=seaIn(x,z);if(si>=0)return{c:INLAND_HEX,a:1};if(si<=-120)return null;
 const a=ss01(-120,-30,si)*(1-ss01(15,60,riverD(x,z)));return a>.004?{c:INLAND_HEX,a}:null;}};
const SEA_WATER=WATER.open({name:'The lake',level:0,swell:[[.06,45,300,0,.04],[.035,18,260,1.3,.03]],field:.12,bounds:WATER_BOX,
 bed:waterBed,bedBox:WATER_BOX,bedCell:WATER_CELL,shore:{seeds:(x,z)=>seaIn(x,z)>=0||Math.hypot(x-SEA_SEED[0],z-SEA_SEED[1])<40},tint:WATER_TINT});

// the gorge's reach, its own ribbon (89w): the points of RIVER's line inside gorgeK
const GORGE_FLOW=(function(){if(!GORGE.on)return null;const P=RIVER_PTS.filter(p=>gorgeK(sOf(p[0],p[1]))>.3);if(P.length<4)return null;
 return WATER.flow({name:'The marl gorge',pts:P.map(p=>[p[0],p[1],p[2]+.05]),width:P.map(p=>1.5*riverW(p[0],p[1])),speed:1.8});})();
const WATER_F=WATER.fields({box:WATER_BOX,cell:8,ground:terrainH,surfaces:[SEA_WATER,RIVER]}),WF=WATER.fieldFns(WATER_F);
// the water's share of the wetness, by the real edge: full at the edge, gone 60 m in (the rule for wet ground, the audit's `wet`); a seep or a rain stays the kit's old terms
const wetShare=(x,z)=>{const d=WF.shore(x,z);return d<=0?1:smooth(60,6,d);};
const ENV=BIO.env({ground:terrainH,water:WF,wet:wetShare,bands:{upland:[10,250],wet:60}});
{const kitWet=FIELD.wet;FIELD.wet=(x,z)=>Math.max(kitWet(x,z),.97*wetShare(x,z));FIELD.shoreM=(x,z)=>WF.shore(x,z);}
// nothing rooted in the water the eye sees (the lake's and the channels' floor plants ask past the mask, as before), by the same edge
{const m0=BIO.host.mask;BIO.host.mask=(x,z)=>Math.min(m0(x,z),smooth(-.2,1.2,WF.shore(x,z)));}
// the burn mosaic (core/biome 38, KFIRE; station 2 only): the dry flats' grass burns every few years, the gallery and the monsoon forest do not
const FIRE=MG&&typeof KFIRE!=='undefined'&&NWQ_ON('fire')?(function(){const P=KFIRE.patch(523);return KFIRE.history({R:TERR.R,cell:20,seed:520105,wind:[.8,.5],old:7,height:(x,z)=>terrainH(x,z),
 burn:(x,z)=>FIELD.dry(x,z)*smooth(.5,4,WF.shore(x,z))*smooth(.8,.5,MG.amK(x,z))*smooth(.1,.3,MG.savK(x,z))*P(x,z),fires:[{ago:.03,x:300,z:-1100,frac:.05,veer:.2},{ago:1.3,x:-200,z:1300,frac:.08,veer:.25},{ago:2.8,x:1400,z:300,frac:.08,veer:.3}]});})():null;
const burnAge=(x,z)=>FIRE?FIRE.ageAt(x,z):60;
// the ground's masks, each named (PLAN.md): rain, the tropic zone off the swamp; lawn, the open subtropical tract; dry, the hills' bare soil by a patch noise and slope; sand, a beach by the lake's shore;
// marl, the gorge's cut walls; mud, the wet band at the water's real edge and the swamp; bars, the inside of the river's bends within its reach, off the steep
function GLW(x,z){const tr=FC.at(FC.a.tr,x,z),dry=FC.at(FC.a.dry,x,z),sk=FC.at(FC.a.sk,x,z),si=FC.at(FC.a.si,x,z),d=WF.shore(x,z),fd=WF.flow(x,z),sl=ENV.slope(x,z);
 const beach=smooth(150,40,si)*(1-sk)*smooth(.45,.15,sl),mud=Math.max(smooth(24,2,d)*(1-beach*.8),sk*.55),s=sOf(x,z),bend=RIVER_T(s+40)+RIVER_T(s-40)-2*RIVER_T(s),curve=Math.abs(bend),inside=(tOf(x,z)-RIVER_T(s))*bend>0?1:0;
 const bars=inside*smooth(.8,3.5,curve)*smooth(riverW(x,z)*2.2+14,riverW(x,z)*.8,fd)*(1-smooth(.3,.8,sl));
 const open=(1-tr)*(1-dry)*(1-sk)*(1-beach);
 const marl=smooth(1.5,6,gorgeCut(x,z))*smooth(.3,.7,sl),keep=(1-mud)*(1-marl);
 if(MG){const b=smooth(3,.3,burnAge(x,z));return[tr*(1-sk)*keep,open*keep,dry*.5*keep*(1-b),beach*(1-bars),mud,bars,b*(1-mud)];}
 return[tr*(1-sk)*keep,open*smooth(0,.4,FC.at(FC.a.wet,x,z)+.15)*keep,dry*smooth(.2,.5,fbm(x*.0023,z*.0023,341,2)+sl*.5)*keep,beach*(1-bars)*(1-marl),mud*(1-marl),bars*(1-marl),marl];}
GROUND_MESHES.forEach(m=>{const g=m.geometry,p=g.attributes.position,A=g.attributes.aGL,B=g.attributes.aGL2;for(let i=0;i<p.count;i++){const w=GLW(p.getX(i),p.getZ(i));A.setXYZW(i,w[0],w[1],w[2],w[3]);B.setXYZ(i,w[4],w[5],w[6]);}A.needsUpdate=B.needsUpdate=true;});
