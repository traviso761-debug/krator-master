// Separate Jimjam outdoor and household furniture. Every entry has its own
// inspector class and remains independently placeable through JJFURN.place().
const jjFurnMat={
 water:new THREE.MeshStandardMaterial({color:0x378d94,metalness:.16,roughness:.24}),
 glow:new THREE.MeshStandardMaterial({color:0xffb45a,emissive:0xff641c,emissiveIntensity:1.8,roughness:.32}),
 bronze:new THREE.MeshStandardMaterial({color:0xb77b2d,metalness:.58,roughness:.38})
};
for(const jjK in jjFurnMat)jjFurnMat[jjK].color.convertSRGBToLinear(); // sRGB palette -> linear (see 60-jj-mat.js)
const JJFURN={defs:{},order:[],
 def(jjD){jjD.cls='furniture';jjD.tags=Object.assign({culture:'jimjam',type:jjD.assetType||jjD.key.replace('jj_furn_',''),wealth:'civic',lit:false,setting:'outdoor'},jjD.tags||{});this.defs[jjD.key]=jjD;this.order.push(jjD.key);return jjD;},
 place(jjScene,jjKey,jjX,jjZ,jjRy,jjOptions){return jjPlaceAccessory(jjScene,this,'furniture',jjKey,jjX,jjZ,jjRy,jjOptions);}
};
function jjFurnGlow(jjX,jjY,jjZ,jjScale){jjPut('jj_furn_glow',JJGEO.sphere,jjFurnMat.glow,jjX,jjY,jjZ,jjScale,jjScale,jjScale);}
function jjFurnPoint(G,x,y,z,power,range,on){if(!on)return;const light=new THREE.PointLight(0xff9a42,power,range,2);light.position.set(x,y,z);G.add(light);}
function jjFurnBuildBench(){jjBox(-.72,.3,0,.28,.6,.62,'brickDeep');jjBox(.72,.3,0,.28,.6,.62,'brickDeep');jjBox(0,.68,0,1.9,.2,.72,'terracotta');jjBox(0,1.18,-.25,1.9,.16,.2,'brickDeep');jjBox(0,.98,-.31,.15,.62,.18,'brickDeep');}
function jjFurnBuildFountain(){jjCylinder(0,.2,0,1.75,.4,'marble',undefined,32);jjCylinder(0,.43,0,1.48,.08,'cream',undefined,32);jjPut('jj_furn_water',JJGEO.cyl32,jjFurnMat.water,0,.48,0,1.34,.06,1.34);jjCylinder(0,.78,0,.28,.66,'brickYellow',undefined,32);jjCylinder(0,1.18,0,.82,.22,'marble',undefined,32);jjCylinder(0,1.31,0,.64,.08,'cream',undefined,32);jjCylinder(0,1.55,0,.12,.42,'gold',undefined,16);jjFurnGlow(0,1.83,0,.13);}
function jjFurnBuildStatue(){jjCylinder(0,.23,0,.86,.46,'brickDeep',undefined,8);jjBox(0,.53,0,1.25,.16,1.25,'marble');jjCylinder(0,1.38,0,.32,1.55,'gold',undefined,8);jjBeam([-.18,1.8,0],[-.72,1.4,.04],.12,'brickYellow');jjBeam([.18,1.8,0],[.72,1.4,.04],.12,'brickYellow');jjPut('jj_furn_statue_head',JJGEO.sphere,jjFurnMat.bronze,0,2.35,0,.38,.42,.38);jjCylinder(0,2.87,0,.1,.55,'gold',undefined,8);}
function jjFurnBuildBrazier(G,o){jjCylinder(0,.18,0,.48,.36,'brickDeep',undefined,8);jjCylinder(0,.88,0,.16,1.12,'gold',undefined,12);jjCylinder(0,1.58,0,.58,.28,'brickYellow',undefined,12);jjCylinder(0,1.78,0,.42,.18,'gold',undefined,12);if(o&&o.lit!==false){jjFurnGlow(0,2.13,0,.27);jjFurnPoint(G,0,2.1,0,1.15,7,true);}}
function jjFurnBuildOilLamp(G,o){jjCylinder(0,.18,0,.32,.36,'brickDeep',undefined,12);jjCylinder(0,1.45,0,.11,2.55,'gold',undefined,12);jjCylinder(0,2.77,0,.25,.26,'brickYellow',undefined,12);jjCylinder(0,3.07,0,.42,.34,'marble',undefined,16);jjPut('jj_furn_lamp_glass',JJGEO.sphere,jjFurnMat.glow,0,3.1,0,.23,.25,.23);jjCylinder(0,3.31,0,.34,.11,'gold',undefined,16);if(o&&o.lit!==false)jjFurnPoint(G,0,3.1,0,.85,6,true);}
function jjFurnBuildBannerPole(){jjCylinder(0,2.7,0,.12,5.4,'brickDeep',undefined,12);jjCylinder(0,5.45,0,.22,.22,'gold',undefined,12);jjBeam([0,5.05,0],[1.6,5.05,0],.055,'gold');}
function jjFurnBuildPlanter(){jjBox(0,.28,0,1.8,.56,1.15,'terracotta');jjBox(0,.58,0,1.52,.12,.91,'brickDeep');jjBox(0,.67,0,1.34,.08,.72,'ochre');}
function jjFurnBuildPool(){jjBox(0,.18,0,4.6,.36,3.4,'brickDeep');jjBox(0,.39,0,4.82,.18,3.62,'marble');jjPut('jj_furn_pool_water',JJGEO.box,jjFurnMat.water,0,.38,0,4.26,.1,3.06);jjBox(0,.51,0,4.44,.12,3.24,'cream');}
function jjFurnBuildMarketStall(){jjBox(0,.7,0,4.2,.28,1.75,'brickDeep');jjBox(0,.88,0,4.35,.12,1.9,'marble');for(const x of[-1.85,1.85])for(const z of[-.72,.72])jjCylinder(x,2.05,z,.08,2.25,'gold',undefined,8);jjBox(0,2.24,-.72,4.25,.18,.16,'brickYellow');jjBox(0,2.24,.72,4.25,.18,.16,'brickYellow');jjBox(0,1.22,0,2.2,.12,.74,'terracotta');}
JJFURN.def({key:'jj_furn_bench',name:'Jimjam carved bench',w:2.3,d:.9,h:1.3,r:1.4,build:jjFurnBuildBench,tags:{type:'bench',setting:'outdoor'}});
JJFURN.def({key:'jj_furn_fountain',name:'Jimjam court fountain',w:3.8,d:3.8,h:2.1,r:2.1,build:jjFurnBuildFountain,tags:{type:'fountain',setting:'outdoor'}});
JJFURN.def({key:'jj_furn_statue',name:'Jimjam sun guardian statue',w:1.8,d:1.8,h:3.3,r:1.4,build:jjFurnBuildStatue,tags:{type:'statue',setting:'outdoor'}});
JJFURN.def({key:'jj_furn_brazier',name:'Jimjam oil brazier',w:1.2,d:1.2,h:2.5,r:.9,build:jjFurnBuildBrazier,tags:{type:'brazier',setting:'outdoor'}});
JJFURN.def({key:'jj_furn_oil_lamp',name:'Jimjam oil lamp',w:.8,d:.8,h:3.5,r:.8,build:jjFurnBuildOilLamp,tags:{type:'lamp',setting:'both'}});
JJFURN.def({key:'jj_furn_banner_pole',name:'Jimjam banner pole',w:2,d:1,h:5.7,r:1.5,build:jjFurnBuildBannerPole,tags:{type:'banner pole',setting:'outdoor'}});
JJFURN.def({key:'jj_furn_planter',name:'Jimjam marble planter',w:2,d:1.4,h:.8,r:1.3,build:jjFurnBuildPlanter,tags:{type:'planter',setting:'outdoor'}});
JJFURN.def({key:'jj_furn_pool',name:'Jimjam reflecting pool',w:5,d:3.8,h:.7,r:3,build:jjFurnBuildPool,tags:{type:'pool',setting:'outdoor'}});
JJFURN.def({key:'jj_furn_market_stall',name:'Jimjam market stall frame',w:4.5,d:2.2,h:2.4,r:2.7,build:jjFurnBuildMarketStall,tags:{type:'market stall',setting:'outdoor'}});
