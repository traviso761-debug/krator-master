// The horizon, as on the Sanctum's page (8aq3-sanctum-draw.js): the bodies want cameras 1-2 km off, the kit's 12 km far
// plane cut the ground short of the horizon, and the sky shader is black below it (pow of a negative). This file loads
// after 90-scene.js, so the camera and the sky exist.
if(typeof camera!=='undefined'&&camera.far<30000){camera.far=30000;camera.updateProjectionMatrix();}
if(typeof sky!=='undefined')sky.renderOrder=-1;
if(typeof skyMat!=='undefined'&&skyMat.fragmentShader.indexOf('pow(h,.55)')>=0){
 skyMat.fragmentShader=skyMat.fragmentShader.replace('pow(h,.55)','pow(max(h,0.),.55)');skyMat.needsUpdate=true;}
// Presets: the two kept bodies, by day and by night (the cyan strips and the lit alabaster are the night's). The sites
// come from the builders' AI_SITE (Arcoindian) and Plymouth's own frame, as on their own targets.
const KPL={x:-980,z:0};
const KAI=Object.assign({x:-1650,z:-3400,PCX:-130,PCZ:-270,PY:332},AI_SITE[0]||{});
const KV=(S,c,t,n)=>[S.x+c[0],c[1],S.z+c[2],S.x+t[0],t[1],S.z+t[2]].concat(n?[1]:[]);
const VIEWS={
 'Plymouth, kept':              KV(KPL,[620,260,820],[0,120,0]),
 'Plymouth, kept, at night':    KV(KPL,[620,260,820],[0,120,0],1),
 'Plymouth, the street':        KV(KPL,[120,49,4],[-200,60,0]),
 'Arcoindian, kept':            KV(KAI,[430,326,600],[KAI.PCX-40,292,-210]),
 'Arcoindian, kept, at night':  KV(KAI,[430,326,600],[KAI.PCX-40,292,-210],1),
 'Arcoindian, the plinth':      KV(KAI,[KAI.PCX+250,404,KAI.PCZ+330],[KAI.PCX-20,388,KAI.PCZ-10]),
 'Both, from the south':        [-1200,800,2600,-1300,150,-1700],
};
