// ================================================================= HOST — the site (station 2: the taiga and the alases)
// PLAN.md section 7, station 2: ~5.2 km, open fur larch on permafrost, a chain of alases with their lakes and cottongrass, a pingo,
// caribou moss under the trees. The site chosen from the model in N0 (2026-10-26, the owner's leave): px 218,190 on 4.22, 5,068 m,
// 0.85 atm, Dsc, a mean of -1 °C and 188 mm, on flat ground 52 km north of Leng: the Yakutian larch's kind of country, where the
// frozen ground holds the melt the larch lives on. The model's -1 °C is a whole degree; the plan's taiga band is on permafrost (a
// mean at or below -2 °C over 123,000 km² above about 5 km), so the station takes a degree off (SITE.warm) and stands on it.
//
// THE LANDFORMS (core/terrain KFROST): five alases, thaw hollows sunk 5-14 m into the plain, three with lakes shrunk into their
// floors and meadow rings round them, two dry (a meadow, one with a PINGO: a pingo grows in a drained alas as its talik freezes);
// ICE-WEDGE POLYGONS over the flats between them. No stream: the alases are closed hollows on the interfluve.
const SITE={
 name:'taiga',title:'The taiga and alases',R:2000,seed:4721,warm:-1,
 alases:[{x:-420,z:-180,r:430,depth:11,lake:.62},{x:520,z:-520,r:300,depth:8,lake:.5},{x:350,z:420,r:360,depth:12,lake:0},
  {x:-760,z:640,r:240,depth:7,lake:.45},{x:1150,z:120,r:200,depth:6,lake:0}],
 pingo:{x:360,z:440,r:95,h:38},
 gifts:[],landforms:['alas','pingo'],aspectCheck:false,larch:.24,
 snow:{autumn:[60,420],winter:[-2000,-1900],spring:[-2000,-1900],summer:[1400,2200]},
 spine:[[0,0],[-420,-180],[360,440],[520,-520]],
 eye:30,
 views:V=>({
  'An alas and its lake':V([-420+520,-180+120,6],[-420,-180,-10]),
  'The pingo in a drained alas':V([360+260,440-150,5],[360,440,14]),
  'Open larch on the permafrost':V([-60,260,2.2],[120,140,6]),
  'Caribou moss under the larch':V([700,820,1.4],[760,760,0]),
  'Ice-wedge polygons':V([-1100,-500,9],[-1050,-460,0]),
  'The alas chain from above':V([0,-1700,380],[0,100,0])})
};
const SITE_STREAM=null;
// THE RELIEF (metres over the model): the plain's long low swells and a little roughness; the alases are KFROST's
function siteRelief(x,z){const a=KRAND.fbm(x*.0008+2.2,z*.0008-4.4,0,3,4722),b=KRAND.fbm(x*.004+1.7,z*.004+3.1,0,2,4723);
 return 14*(a-.5)*2+3*(b-.5)*2;}
SITE.frost=c=>({
 alases:SITE.alases.map((a,i)=>Object.assign({id:'alas'+(i+1)},a)),
 pingos:[Object.assign({id:'pingo1'},SITE.pingo)],
 polygons:{cell:16,trough:.4,rim:.09,width:.17,where:(x,z)=>{const G=c.grade(x,z);return smooth(.06,.02,G.g)*smooth(-1.4,-2.4,c.meanAt(x,z));}},
 aufeis:[],rockGlaciers:[]});
