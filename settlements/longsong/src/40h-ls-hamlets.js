// ================================================================= LONGSONG — the valley's lay villages (the plan as data)
// [G data] core/hamlet (KHAMLET.village, 2026-10-20): the Oidong Valley's lay people round the monastery, in three villages
// outside the wall: two farming villages beside the east and the west fields, and a herders' village at the head of the
// yak pastures. Their culture is core/hamlet's `xanadu` row (core/hamlet/20-hamlet-cultures.js): the Xanadu building
// kit's houses, temple, guild hall, bazaar row, teahouse, granary, farmsteads and windmill (settlements/xanadu); the
// pens, the corral and the dairy are the row's pending boxes until the kit has them. LS.HAMLETS.make(groundH, waterH,
// dims) lays them out (a pure function of the plan, the ground and the kit's boxes: the page hands it terrainH, waterH
// and the kit's dims (85h: XAK, settlements/xanadu/kit_bundle.py); a node test or Godot hands its own).
(function(){const P=LS,F=P.FARMS,ROW=KHAMLET.CULTURES.xanadu;
 // ---------------------------------------------------------------- the three villages
 const fld=id=>F.GROUPS.find(f=>f.id===id),mid=f=>({x:(f.x0+f.x1)/2,z:(f.z0+f.z1)/2});
 const SPECS=[
  {id:'longsong-east',name:'Shar, the east village (the east fields\' farmers)',focus:'farming',site:{x:760,z:60},link:{x:230,z:-120},res:mid(fld('fields-east')),pop:220},
  {id:'longsong-west',name:'Nub, the west village (the west fields\' farmers)',focus:'farming',site:{x:-880,z:60},link:{x:-230,z:-120},res:mid(fld('fields-west')),pop:220},
  {id:'longsong-herders',name:'Dzo-ling, the herders\' village (the yak pastures)',focus:'ranch',site:{x:480,z:650},link:{x:230,z:260},res:{x:F.HERDS[2].x,z:F.HERDS[2].z},pop:160}];
 // where a village may build: dry, gentle (the row's slope), outside the wall and the kora, off every field, terrace and
 // grove (the pastures are the herders' own), inside the page's ground
 const SKIP=F.GROUPS.filter(f=>f.kind!=='pasture'&&!f.inside),K=P.KORA;
 function okFor(groundH,waterH,others){return (x,z)=>{if(Math.hypot(x,z)>1600||P.inGrounds(x,z,30))return false;
  const ex=(x-K.cx)/(K.a+18),ez=(z-K.cz)/(K.b+18);if(ex*ex+ez*ez<1)return false;
  for(const f of SKIP)if(x>f.x0-10&&x<f.x1+10&&z>f.z0-10&&z<f.z1+10)return false;
  for(const o of others)if(o.records.some(r=>Math.abs(r.x-x)<r.w/2+14&&Math.abs(r.z-z)<r.d/2+14))return false;
  const y=groundH(x,z);if(y-waterH(x,z)<.8)return false;
  const s=Math.max(Math.abs(groundH(x+3,z)-groundH(x-3,z)),Math.abs(groundH(x,z+3)-groundH(x,z-3)))/6;return s<=ROW.slopeMax;};}
 // LS.HAMLETS.make(groundH, waterH, dims) -> [{spec, v: KHAMLET.village's result}], in the order of SPECS (each village
 // sees the ones before it, so none builds on another); dims(key) -> {w, d, h} the kit's box, null for one it lacks (the
 // row's pending boxes answer those)
 function make(groundH,waterH,dims){const out=[];
  for(const S of SPECS){const v=KHAMLET.village({id:S.id,world:7419,culture:'xanadu',focus:S.focus,site:S.site,link:S.link,
    resource:{x:S.res.x,z:S.res.z},popMax:S.pop,dims,ground:{ok:okFor(groundH,waterH,out.map(o=>o.v).filter(v=>!v.error))},siteReach:260});
   out.push({spec:S,v});}
  return out;}
 P.HAMLETS={SPECS,make};})();
