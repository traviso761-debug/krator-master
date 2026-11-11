// prefix: fg
// ================================================================= THE STORES (PLAN.md section 3.3.1: fg-store, fg-smokehouse, fg-barn, fg-eggstore)
// The village's general store (the trade goods bought with eggs or ice), the smokehouse (fowl and fish over a peat smudge
// under a louvred ridge), the barn (hay and peat, the herd's winter feed, a threshing floor between two doors) and the egg
// and honey store (a cool corbelled round store, half sunk: egg racks in ash, honey crocks, herbs hung).
const FG_STORE_FAMS={
 'fg-store':[{id:'gable',wf:[.8,1],df:[.8,1],hf:[.82,1],pitch:[38,48],stony:1.3},{id:'black',plan:'round',roof:'black',th:1,ov:0,wf:[.85,1],df:[.88,1],hf:[.75,.86],pitch:[30,36],low:2.2,wins:0},
  {id:'container',wf:[.8,1],df:[.65,.72],hf:[.8,.95],add:['container'],low:1.4},{id:'lean',roof:'halfhip',wf:[.65,.7],df:[.8,1],hf:[.8,.95],add:['lean']}],
 'fg-smokehouse':[{id:'gable',wf:[.8,1],df:[.8,1],hf:[.82,1],pitch:[40,50],wins:0,stony:1.2},{id:'hip',roof:'hip',wf:[.8,1],df:[.85,1],hf:[.78,.92],pitch:[34,42],wins:0,low:2},
  {id:'beehive',wf:[.65,.7],df:[.75,.9],hf:[.8,.95],add:['beehive'],wins:0,stony:2}],
 'fg-barn':[{id:'gable',wf:[.8,1],df:[.8,1],hf:[.85,1],pitch:[40,48],wins:0,stony:1.3},{id:'halfhip',roof:'halfhip',wf:[.82,1],df:[.85,1],hf:[.8,.95],pitch:[34,44],wins:0,low:1.6},
  {id:'bow',plan:'bow',roof:'bow',wf:[.85,1],df:[.88,1],hf:[.82,1],pitch:[36,44],wins:0},{id:'croft',wf:[.68,.72],df:[.82,1],hf:[.82,1],add:['outshot'],wins:0,low:1.3}]};
defBuilding({key:'fg-store',name:'The store',seed:9121,cut:true,w:8,d:6,h:4.5,budget:34000,
 tags:{types:['shop'],wealth:'middle',style:'drystone',role:'general',job:'trading'},
 note:'the general store: shelves, sacks, the trade goods (grain, cloth, metal bought with eggs or ice). Families: gabled, a blackhouse, a store with a buried container behind it, a half-hipped store with a plate lean-to',
 build(o){const C=fgCx(o);fgHouse(TG.fg.BOX['fg-store'],C,FG_STORE_FAMS['fg-store'],S=>{const wc=fgCol('wood',C),sc=fgCol('stoneD',C),x0=S.x0+.1,x1=S.x1-.1;
  /* shelves of plank on stone brackets along the back wall, the goods on them */
  for(const y of [.7,1.35,2])if(y<S.wh-.4){box('wood',(x0+x1)/2,y,S.z0+.25,x1-x0,.05,.48,wc);for(let x=x0+.3;x<x1;x+=1.6)box('stoneD',x,y-.25,S.z0+.15,.18,.25,.3,sc);
   for(let x=x0+.4,k=0;x<x1-.3;x+=.75,k++){const q=Math.floor(fgU(C,500+k+y*10)*4);if(q===0)box('hide',x,y+.05,S.z0+.25,.45,.32,.36,P('hide'));else if(q===1)cyl('scrap',x,y+.05,S.z0+.25,.14,.3,fgCol('scrap',C),7);else if(q===2)box('rust',x,y+.05,S.z0+.28,.5,.08,.2,fgCol('rust',C));}}
  /* the counter of plate on stone by the door, sacks and barrels on the floor */
  const cx=S.doors[0][0]>0?S.doors[0][0]-1.6:S.doors[0][0]+1.6;box('stone',cx,0,Math.min(.6,S.z1-.6),1.8,.95,.6,sc);box('plate',cx,.95,Math.min(.6,S.z1-.6),2,.05,.75,fgCol('plate',C));
  fgFurn('generic_sack',S.x1-.45,null,S.z1-.5,.3);fgFurn('generic_barrel',S.x0+.5,null,S.z1-.6,0);fgFurn('generic_crate',S.x0+.55,null,S.z0+1.3,0);fgFurn('generic_strongbox',cx,1,Math.min(.6,S.z1-.6),0);
  fgDoorSign(S,C,{text:'TRADE',ch:.15});});}});
/* the louvre over a smokehouse's ridge: scrap slats on a raised frame, the smoke out through them */
function fgLouvre(S,len,top,C){const y=S.Y(0,0),pc=fgCol('pole',C),sc=fgCol('scrap',C);for(const x of [-len/2,len/2])for(const s of [-1,1])pole('pole',[x,y-.2,s*.4],[x,top-.05,s*.4],.04,pc,4);
 for(let k=0;k<3;k++)for(const s of [-1,1])box('scrap',0,y+k*.13,s*.43,len,.03,.2,sc,0,s*.6);fgSlab('turf',[-len/2-.1,top-.06,.5],[len/2+.1,top-.06,.5],[-len/2-.1,top-.06,-.5],.1,fgCol('turf',C));smokeAt(0,top+.2,0,{r:.3});}
defBuilding({key:'fg-smokehouse',name:'The smokehouse',seed:9122,cut:true,w:6,d:5,h:4.5,budget:30000,
 tags:{types:['industry'],style:'drystone',role:'food',job:'butchery'},
 note:'a louvred turf ridge, racks of fowl and fish, a peat smudge. Families: gabled, hipped, a smokehouse with a beehive cell',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-smokehouse'];fgHouse(B,C,FG_STORE_FAMS['fg-smokehouse'],S=>{const pc=fgCol('pole',C);
  fgLouvre(S,Math.min(S.w*.5,2.4),Math.min(B.h+.3,S.Y(0,0)+.45),C);
  /* the racks: poles across the room at three heights, fowl and fish hung from them; the smudge of peat */
  for(const y of [1.5,2.05,2.6]){if(y>S.wh+.4)continue;for(const z of [S.z0+.5,(S.z0+S.z1)/2,S.z1-.6]){pole('pole',[S.x0,y,z],[S.x1,y,z],.035,pc,4);
   for(let x=S.x0+.3,k=0;x<S.x1-.2;x+=.42,k++){if(fgU(C,700+k+y*7)<.5)ellip('hide',x,y-.35,z,.035,.2,.08,hc(0x8a7c5e),0,5);else ellip('hide',x,y-.32,z,.09,.18,.08,hc(0x5a4632),0,5);}}}
  box('stoneD',0,0,0,1.1,.12,1.1,fgCol('stoneD',C));if(!C.worn){for(let k=0;k<3;k++)ellip('glow',(k-1)*.25,.12,(k%2)*.2-.1,.12,.04,.1,hc(0xd04a18),0,5);smokeAt(0,.5,0,{r:.4});haloAt(0,.3,0,0xff6a20,true);}
  fgFurn('fellgang_poor_meat_rack',S.x1-.6,null,S.z1-.4,-PI/2);},{doorW:.9,doorH:1.75,noHood:true});}});
defBuilding({key:'fg-barn',name:'The barn',seed:9123,cut:true,w:12,d:7,h:5.5,budget:40000,
 tags:{types:['farm'],style:'drystone',role:'warehouse',job:'farming'},
 note:'hay and peat, the herd\'s winter feed, a threshing floor between its two doors. Families: gabled, half-hipped, bow-sided, a barn with an outshot',
 build(o){const C=fgCx(o);fgHouse(TG.fg.BOX['fg-barn'],C,FG_STORE_FAMS['fg-barn'],S=>{const dx=S.doors[0][0];
  box('stoneD',dx,.04,(S.z0+S.z1)/2,3,.04,S.z1-S.z0,fgCol('stoneD',C));
  /* the hay in one bay, the peat in the other, the loft beams, a flail and rakes */
  const hx=dx>0?S.x0+1.4:S.x1-1.4,px=dx>0?S.x1-.4:S.x0+.4,ps=dx>0?-1:1,hcol=P('straw');
  for(let k=0;k<3;k++)box('straw',hx,0,S.z0+.9+k*1.5,2.4,Math.min(2.1,S.wh)-k*.3,1.4,hcol,(fgU(C,800+k)-.5)*.1);
  for(let i=0;i<3;i++)for(let j=0;j<Math.floor((S.z1-S.z0-.6)/.5);j++)box('stoneD',px+ps*i*.45,0,S.z0+.4+j*.5,.4,(4-i)*.27,.42,P('peat'));
  const pc=fgCol('pole',C);for(const x of [S.x0*.45,S.x1*.45])pole('pole',[x,S.wh-.2,S.z0],[x,S.wh-.2,S.z1],.1,pc,6);
  fgFurn('job_bales',hx,null,S.z1-.7,0);fgFurn('job_sheaf_rack',dx,null,S.z0+.45,0);
  fgDoorSign(S,C,{kind:'rust',ink:'white'});},
  {doorW:2.4,doorH:2.4,backDoor:true,doors:(S0)=>[[(fgU(C,26)-.5)*Math.max(0,S0.w-6),2.3,Math.min(2.4,S0.wh-.2)]]});}});
/* the egg store: round and half sunk, its floor .8 m under the door's sill, so it keeps cold; the turf banked against the
   low wall; the dome corbelled in stone and capped with turf */
defBuilding({key:'fg-eggstore',name:'The egg and honey store',seed:9124,cut:true,w:6,d:6,h:4.5,budget:70000,
 tags:{types:['farm'],style:'drystone',role:'works',job:'warehousing'},
 note:'a cool corbelled store, half sunk: egg racks in ash, honey crocks, the herb bundles hung',
 build(o){const C=fgCx(o),fr=fgLerp([.72,1],fgU(C,21)),r=3*fr,t=.75,sunk=.8,wh=1.5*fgLerp([.85,1.1],fgU(C,22)),Ht=4.5*Math.max(.78,fgLerp([.78,1],fgU(C,23))),g=.2/fr,col=fgCol('stone',C),a0=PI/2+g,a1=PI/2-g+TAU;fgSet('fill',+fr.toFixed(2));
  cyl('stone',0,Math.min(C.lo,-sunk-.4),0,r+.02,.06-Math.min(C.lo,-sunk-.4),col,20);
  /* the sunk floor inside: a stone pan .8 m down, steps down from the door */
  cyl('stoneD',0,-sunk,0,r-t,.04,fgCol('stoneD',C),18);
  sector('stone',0,0,r-t,r,a0,a1,-sunk,wh,col);sector('stone',0,0,r-t,r,PI/2-g-.02,PI/2+g+.02,1.15,wh,col,3);box('stoneD',0,.95,r-t/2,1.3,.22,t+.04,fgCol('stoneD',C));
  for(let k=0;k<3;k++)box('stoneD',0,-sunk+k*.27,r-t-.3-k*.28,.9,.27,.3,fgCol('stoneD',C));
  /* the turf banked against the wall (a skirt), the corbels, the turf cap */
  lathe('turf',0,0,[[r+.02,0],[r-.05,.9],[r-.35,wh+.05]],18,fgCol('turf',C),{a0:a0,a1:a1});
  const nc=6,cs=(Ht-.8-wh)/nc;for(let k=0;k<nc;k++){const y0=wh+k*cs,ro=(r-.05)*(1-Math.pow((k+1)/nc,1.5)*.8),ri=Math.max(.2,ro-.7);sector('stone',0,0,ri,ro,0,TAU,y0,y0+cs+.01,col,16);}
  lathe('turf',0,0,[[r*.62,wh+(Ht-wh)*.3],[r*.42,wh+(Ht-wh)*.63],[r*.2,wh+(Ht-wh)*.87],[0,Ht]],14,fgTurfCol(C,fgTurfLook(C)));
  fgDoor(0,r-t/2,.85,1.55,C,{th:t,name:'the egg store door'});
  /* the racks: plank shelves round the back wall, eggs bedded in ash in rows; honey crocks below; herbs hung from the corbels */
  const ri=r-t-.05,wc=fgCol('wood',C);let eggs=0;
  for(const y of [-sunk+.55,-sunk+1.05,-sunk+1.55]){for(let k=0;k<7;k++){const a=PI*1.15+k*.26,x=Math.cos(a)*(ri-.25),z=Math.sin(a)*(ri-.25),ry=Math.atan2(-x,-z);
   W(x,y,z,ry,()=>{box('wood',0,0,0,.6,.04,.42,wc);box('stoneD',0,.04,0,.56,.04,.38,hc(0x9a948a));for(let i=0;i<3;i++)for(let j=0;j<2;j++){ellip('plain',-.18+i*.18,.1,-.08+j*.16,.04,.055,.04,P('white'),0,6);eggs++;}});}}
  fgNote('eggs',eggs);
  for(let k=0;k<5;k++){const a=PI*.3-k*.28,x=Math.cos(a)*(ri-.3),z=Math.sin(a)*(ri-.3);fgFurn(k%2?'generic_crock':'generic_storage_jar',x,-sunk+.04,z,0,{v:k%2});}
  for(let k=0;k<6;k++){const a=k*TAU/6+.3,x=Math.cos(a)*1.1,z=Math.sin(a)*1.1;cord('cord',[[x,wh+.6,z],[x,wh+.15,z]],.008,P('rope'));ellip('straw',x,wh,z,.08,.2,.08,hc(0x6a7a3a),0,6);}
  if(C.worn)fgRubble(-1,r-.12,3,C);}});
