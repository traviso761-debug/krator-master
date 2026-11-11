// ================================================================= HOST - the water's fields and what reads them (replaces the kit's 86-host-fields.js; before the build)
// The kit's page's order (the rebuild's checklist; core/biome README "The environmental fields"; core/water ext/60): the flora and the ground take the
// water's own numbers. Here the only water is the rain pond (45-host-stage.js POND_W, a core/water still):
//   WATER.fields   the shore distance and depth of the pond at 8 m over the map
//   BIO.env        the contract's table on them: FIELD.wet's water share and the kit's shore band read `shore` (wetShare, FIELD.shoreM)
//   GLW            the ground's layer weights, each by a named mask, written onto the ground mesh's attributes
const lin=c=>new THREE.Color(c).convertSRGBToLinear();
const WATER_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
const WATER_F=WATER.fields({box:WATER_BOX,cell:8,ground:terrainH,surfaces:[POND_W]}),WF=WATER.fieldFns(WATER_F);
// the water's share of the wetness, by the real edge: full at the edge, gone 40 m in
const wetShare=(x,z)=>{const d=WF.shore(x,z);return d<=0?1:smooth(40,4,d);};
const ENV=BIO.env({ground:terrainH,water:WF,wet:wetShare,rock:(x,z)=>FIELD.rock(x,z),bands:{upland:[640,1020],wet:40}});
{const kitWet=FIELD.wet;FIELD.wet=(x,z)=>Math.max(kitWet(x,z),.97*wetShare(x,z));FIELD.shoreM=(x,z)=>WF.shore(x,z);}
// nothing rooted in the water the eye sees, by the same edge
{const m0=BIO.host.mask;BIO.host.mask=(x,z)=>Math.min(m0(x,z),smooth(-.2,1.2,WF.shore(x,z)));}
// THE GROUND'S MASKS, each named (PLAN.md section 7, "the NW lowlands half"):
//   litter (the kit's rain floor)  the young forest's floor: the silt under the line, by the stand's cover (the silt, less the bare patches)
//   lawn                           the hills' open glades where it is wetter (the draws)
//   red soil (groundDry)           the hills' bare soil by a patch noise and the summer drought, and the wrack line's rotted drift
//   bare silt (groundSand)         the silt where the stand opens and on a cut bank (the rhythmites), the strandlines' benches
//   mud                            within 18 m of the pond's real edge
//   gravel (groundGravel)          the strait's bars
//   basalt (this overlay's set)    the strait's scoured rock and every face steeper than ~35 degrees
function GLW(x,z){const F=k=>FC.at(FC.a[k],x,z),silt=F('silt'),sc=F('scour'),bar=F('bar'),sl=F('slope'),wet=F('wet'),d=WF.shore(x,z);
 const mud=smooth(18,1,d),rockK=Math.max(smooth(.05,.5,sc)*(1-smooth(.1,.45,bar)),smooth(.5,.8,sl)*.8)*(1-mud),gravel=smooth(.05,.45,bar)*(1-mud)*(1-rockK);
 const open=smooth(.05,.35,KRAND.fbm(x*.006,.5,z*.006,2,1821)-.4),cut=smooth(.18,.42,sl),bare=clamp(Math.max(open*.7,cut,F('strand')*.3),0,1);
 const keep=(1-mud)*(1-gravel)*(1-rockK),bed=smooth(.04,.3,silt);
 const litter=bed*(1-bare*.8)*keep,silty=bed*bare*keep;
 const hills=(1-bed)*keep,red=hills*smooth(.2,.5,KRAND.fbm(x*.0023,.5,z*.0023,2,1822)+sl*.5)*smooth(.3,.6,F('dry'))+F('shore')*.6*keep,lawn=hills*smooth(.4,.6,wet);
 return[litter,lawn,clamp(red,0,1),silty,mud,gravel,rockK];}
GROUND_MESHES.forEach(m=>{const g=m.geometry,p=g.attributes.position,A=g.attributes.aGL,B=g.attributes.aGL2;for(let i=0;i<p.count;i++){const w=GLW(p.getX(i),p.getZ(i));A.setXYZW(i,w[0],w[1],w[2],w[3]);B.setXYZ(i,w[4],w[5],w[6]);}A.needsUpdate=B.needsUpdate=true;});
