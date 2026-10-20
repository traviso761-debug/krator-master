// ================================================================= LONGSONG — the valley's lay villages (the plan as data)
// [G data] core/hamlet (KHAMLET.village, 2026-10-20): the Oidong Valley's lay people round the monastery, in three villages
// outside the wall: two farming villages beside the east and the west fields, and a herders' village at the head of the
// yak pastures. Their culture is a row of core/hamlet's (`xanadu_vale`: Xanadu's valley folk, Tibetan houses of
// whitewashed stone under flat roofs), kept here until a Xanadu building kit exists to give it keys of its own: every key
// is this page's own house type (its box below; 85h draws it). LS.HAMLETS.make(groundH, waterH) lays them out (a pure
// function of the plan and the ground: the page hands it terrainH and waterH; a node test or Godot hands its own).
(function(){const P=LS,F=P.FARMS;
 // ---------------------------------------------------------------- the culture row (core/hamlet/20-hamlet-cultures.js's shape)
 // the boxes of the page's house types: w (along the front), d, h
 const BOX={
  'xv-shrine':{w:6,d:6,h:7.5,what:'a chorten in its walled yard'},'xv-hall':{w:14,d:10,h:7,what:'the village hall (the headmen\'s council, the tax and the festival)'},
  'xv-trader':{w:9,d:7,h:5.5,what:'the trader\'s house and shop'},'xv-tea':{w:9,d:7,h:5,what:'the tea house and its store'},
  'xv-granary':{w:11,d:7,h:6.5,what:'a granary on its stone footing'},
  'xv-house-poor':{w:7,d:6,h:4.6,what:'a one-room house, its byre under'},'xv-house':{w:9,d:7,h:6.4,what:'a two-storey house round its stair'},
  'xv-house-big':{w:12,d:8,h:6.8,what:'a large family\'s house'},'xv-house-head':{w:14,d:10,h:8,what:'the headman\'s house'},
  'xv-farm':{w:13,d:9,h:5.6,what:'a farmhouse and its threshing floor'},'xv-byre':{w:16,d:8,h:4.2,what:'a yak byre'},
  'xv-pens':{w:14,d:14,h:1.5,what:'a stone pen'},'xv-corral':{w:20,d:20,h:1.4,what:'a corral for the dzo'},'xv-dairy':{w:10,d:7,h:4.6,what:'a dairy (butter, cheese)'}};
 KHAMLET.CULTURES.xanadu_vale={kit:'longsong',household:5.5,workShare:.45,slopeMax:.22,
  religious:'xv-shrine',civic:'xv-hall',general:'xv-trader',food:'xv-tea',warehouse:'xv-granary',
  services:{religious:1,civic:2,general:2,food:3,warehouse:3},
  houses:{poor:[['xv-house-poor',1,3],['xv-house',2,2]],middling:[['xv-house',2,2],['xv-house-big',3,1]],head:[['xv-house-head',1,1]],middlingShare:.4},
  works:{farming:[{key:'xv-farm',jobs:10,share:.85},{key:'xv-granary',jobs:5,share:.15}],
   ranch:[{key:'xv-byre',jobs:6,share:.45},{key:'xv-pens',jobs:3,share:.2},{key:'xv-corral',jobs:4,share:.2},{key:'xv-dairy',jobs:4,share:.15}]},
  focusJobs:{farming:90,ranch:50},reach:{farming:420,ranch:520}};
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
  const s=Math.max(Math.abs(groundH(x+3,z)-groundH(x-3,z)),Math.abs(groundH(x,z+3)-groundH(x,z-3)))/6;return s<=KHAMLET.CULTURES.xanadu_vale.slopeMax;};}
 const dims=k=>{const b=BOX[k];if(!b)throw new Error('LS.HAMLETS: no box for '+k);return {w:b.w,d:b.d,h:b.h};};
 // LS.HAMLETS.make(groundH, waterH) -> [{spec, v: KHAMLET.village's result}], in the order of SPECS (each village sees the
 // ones before it, so none builds on another)
 function make(groundH,waterH){const out=[];
  for(const S of SPECS){const v=KHAMLET.village({id:S.id,world:7419,culture:'xanadu_vale',focus:S.focus,site:S.site,link:S.link,
    resource:{x:S.res.x,z:S.res.z},popMax:S.pop,dims,ground:{ok:okFor(groundH,waterH,out.map(o=>o.v).filter(v=>!v.error))},siteReach:260});
   out.push({spec:S,v});}
  return out;}
 P.HAMLETS={SPECS,BOX,make};})();
