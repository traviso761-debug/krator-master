// Deliberately simple, replaceable Jimjam flora. No biome was supplied, so
// these tagged silhouettes are placeholders rather than a finished plant kit.
const jjFloraMats={
 trunk:new THREE.MeshStandardMaterial({color:0x70503a,roughness:.92}),
 leaf:new THREE.MeshStandardMaterial({color:0x66834e,roughness:.86})
};
for(const jjK in jjFloraMats)jjFloraMats[jjK].color.convertSRGBToLinear(); // sRGB palette -> linear (see 60-jj-mat.js)
const jjFloraGeo={cone:new THREE.ConeGeometry(1,1,10,1),crown:new THREE.SphereGeometry(1,12,8)};
const JJFLORA={defs:{},order:[],
 def(jjD){jjD.cls='flora';jjD.tags=Object.assign({culture:'jimjam',type:jjD.assetType||jjD.key.replace('jj_flora_',''),wealth:'civic',lit:false,setting:'outdoor',biome:'placeholder',harvestable:false,edible:false},jjD.tags||{});this.defs[jjD.key]=jjD;this.order.push(jjD.key);return jjD;},
 place(jjScene,jjKey,jjX,jjZ,jjRy,jjOptions){return jjPlaceAccessory(jjScene,this,'flora',jjKey,jjX,jjZ,jjRy,jjOptions);}
};
function jjFloraBuildCypress(){jjPut('jj_flora_cypress_cone',jjFloraGeo.cone,jjFloraMats.leaf,0,2.9,0,1.25,5.8,1.25);}
function jjFloraBuildPalm(){jjPut('jj_flora_palm_trunk',JJGEO.cyl,jjFloraMats.trunk,0,2.7,0,.24,5.4,.24);jjPut('jj_flora_palm_leaf_ball',jjFloraGeo.crown,jjFloraMats.leaf,0,5.75,0,1.8,.9,1.8);}
JJFLORA.def({key:'jj_flora_cypress',name:'Jimjam placeholder cypress',w:2.5,d:2.5,h:5.8,r:1.7,build:jjFloraBuildCypress,tags:{type:'cypress',biome:'placeholder',harvestable:false,edible:false,setting:'outdoor'}});
JJFLORA.def({key:'jj_flora_palm',name:'Jimjam placeholder palm',w:3.6,d:3.6,h:6.7,r:2.2,build:jjFloraBuildPalm,tags:{type:'palm',biome:'placeholder',harvestable:false,edible:false,setting:'outdoor'}});