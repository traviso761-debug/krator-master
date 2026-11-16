// ================================================================= GRĒṬ-ĀIL — the probe's additions, every page's
// _api.setHour (the clock, for a night shot) and _api.lamps (the krator-lamps export of AD_LAMPS, in a box if given). [web].
reseed(34157);
if(window._api)window._api.setHour=h=>{AD_SKY.hour=h;};
const AD_LAMPKIND={azure:['#4a7ae8',7,true],gold:['#ffc870',6,false],oil:['#ffc890',18,false],pane:['#3a6ad8',14,true],signal:['#6a9af8',30,true],censer:['#ff9a50',4,false],keeper:['#ffd8a0',6,false],station:['#dfe8ff',16,true],bulb:['#ffd090',6,false]};
if(window._api)window._api.lamps=b=>({format:'krator-lamps',version:1,convention:'metres, +Y up; at is the lamp; color sRGB; size the halo\'s world diameter',
 lamps:AD_LAMPS.filter(l=>!b||(l[0]>=b[0]&&l[0]<=b[2]&&l[2]>=b[1]&&l[2]<=b[3])).map(l=>{const K=AD_LAMPKIND[l[3]]||AD_LAMPKIND.oil;
  return{at:[+l[0].toFixed(3),+l[1].toFixed(3),+l[2].toFixed(3)],amp:1,radius:K[1],cool:K[2],color:K[0],size:.5,hours:l[3]==='gold'?[0,24]:[17.2,30.8],kind:l[3]};})});
