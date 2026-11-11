// prefix: fg
// ================================================================= THE STORES (PLAN.md section 3.3.1: fg-store, fg-smokehouse, fg-barn, fg-eggstore)
// The village's general store (the trade goods bought with eggs or ice), the smokehouse (fowl and fish over a peat smudge
// under a louvred ridge), the barn (hay and peat, the herd's winter feed, a threshing floor between two doors) and the egg
// and honey store (a cool corbelled round store, half sunk: egg racks in ash, honey crocks, herbs hung).
defBuilding({key:'fg-store',name:'The store',seed:9121,cut:true,w:8,d:6,h:4.5,budget:70000,
 tags:{types:['shop'],wealth:'middle',style:'drystone',role:'general',job:'trading'},
 note:'the general store: shelves, sacks, the trade goods (grain, cloth, metal bought with eggs or ice)',
 build(o){const C=fgCx(o),S=fgShell(TG.fg.BOX['fg-store'],C,{doors:[[-1.6,1.1,1.85]]});const wc=fgCol('wood',C),sc=fgCol('stoneD',C);
  /* shelves of plank on stone brackets along the back and right walls, goods on them */
  for(const y of [.7,1.35,2])for(const [x0,x1] of [[S.x0+.1,S.x1-.1]]){box('wood',(x0+x1)/2,y,S.z0+.25,x1-x0,.05,.48,wc);for(let x=x0+.3;x<x1;x+=1.6)box('stoneD',x,y-.25,S.z0+.15,.18,.25,.3,sc);}
  for(let x=S.x0+.5;x<S.x1-.3;x+=.7){for(const y of [.75,1.4,2.05]){const k=Math.floor(rng()*4);
   if(k===0)box('hide',x,y,S.z0+.25,.45,.32,.36,P('hide'));else if(k===1)cyl('scrap',x,y,S.z0+.25,.14,.3,fgCol('scrap',C),8);else if(k===2)box('rust',x,y,S.z0+.28,.5,.08,.2,fgCol('rust',C));else ellip('hide',x,y+.12,S.z0+.25,.2,.12,.18,P('fur'),0,6);}}
  /* the counter of plate on stone by the door, the scales' post, sacks and barrels on the floor */
  box('stone',1,0,.6,2.6,.95,.6,sc);box('plate',1,.95,.6,2.8,.05,.75,fgCol('plate',C));pole('pole',[2.1,1,.6],[2.1,1.7,.6],.03,fgCol('pole',C),5);
  fgFurn('generic_sack',S.x1-.45,null,.4,.3);fgFurn('generic_sack',S.x1-.5,null,1.1,-.2,{v:1});fgFurn('generic_barrel',S.x0+.5,null,1.3,0);fgFurn('generic_crate',S.x0+.55,null,.4,0);
  fgFurn('fellgang_poor_tallow_lamp',1.9,1,.6,0);fgFurn('generic_strongbox',.2,1,.6,0);
  fgSign('TRADE',1.2,2,S.hd+.02,0,C,{ch:.16});fgHood(0,S.rid,S.rid+.4,C);}});
defBuilding({key:'fg-smokehouse',name:'The smokehouse',seed:9122,cut:true,w:6,d:5,h:4.5,budget:60000,
 tags:{types:['industry'],style:'drystone',role:'food',job:'butchery'},
 note:'a louvred turf ridge, racks of fowl and fish, a peat smudge',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-smokehouse'],hw=B.w/2,hd=B.d/2,th=.6,wh=B.h*.5,rid=B.h-.75;
  fgPlinth(-hw,hw,-hd,hd,C);fgWalls(hw,hd,th,wh,C,[[-.45,.45,1.75]]);
  /* the roof stops short of the ridge: a louvre of scrap slats on a raised ridge lets the smoke out */
  fgRoof(hw,hd,wh,rid,C,{});const pc=fgCol('pole',C);for(const s of [-1,1])for(const x of [-hw+.5,0,hw-.5])pole('pole',[x,rid,s*.45],[x,B.h-.12,s*.45],.05,pc,5);
  for(let k=0;k<4;k++)for(const s of [-1,1])box('scrap',0,rid+.12+k*.15,s*.48,B.w-.4,.04,.22,fgCol('scrap',C),0,s*.6);
  fgSlab('turf',[-hw-.15,B.h-.18,.55],[hw+.15,B.h-.18,.55],[-hw-.15,B.h-.18,-.55],.12,fgCol('turf',C));
  fgDoor(0,hd-th/2,.9,1.75,C,{rust:true});
  /* the racks: poles across the room at three heights, fowl and fish hung from them */
  const x0=-hw+th,x1=hw-th,z0=-hd+th,z1=hd-th;for(const y of [1.5,2.05,2.6]){for(const z of [z0+.5,0,z1-.6]){pole('pole',[x0,y,z],[x1,y,z],.035,pc,5);
   for(let x=x0+.3;x<x1-.2;x+=.38){const fish=rng()<.5;cord('cord',[[x,y,z],[x,y-.15,z]],.008,P('rope'));
    if(fish)ellip('hide',x,y-.4,z,.035,.22,.08,hc(0x8a7c5e),0,6);else ellip('hide',x,y-.36,z,.1,.2,.09,hc(0x5a4632),0,6);}}}
  /* the smudge: peat smouldering in a stone pit */
  box('stoneD',0,0,0,1.1,.12,1.1,fgCol('stoneD',C));if(!C.worn){for(let k=0;k<3;k++)ellip('glow',rr(-.2,.2),.12,rr(-.2,.2),.12,.04,.1,hc(0xd04a18),0,6);smokeAt(0,.5,0,{r:.4});smokeAt(0,B.h,0,{r:.3});haloAt(0,.3,0,0xff6a20,true);}
  fgFurn('fellgang_poor_meat_rack',x1-.6,null,z1-.4,-PI/2);fgFurn('generic_fuel',x0+.45,null,z1-.4,0);}});
defBuilding({key:'fg-barn',name:'The barn',seed:9123,cut:true,w:12,d:7,h:5.5,budget:90000,
 tags:{types:['farm'],style:'drystone',role:'warehouse',job:'farming'},
 note:'hay and peat, the herd\'s winter feed, a threshing floor between its two doors',
 build(o){const C=fgCx(o),B=TG.fg.BOX['fg-barn'],S=fgShell(B,C,{doors:[[0,2.4,2.4]]});
  /* the back door opposite (the threshing draught), the floor of flags between them */
  box('wood',0,.06,S.z0-S.th/2,1.2,1.9,.12,fgCol('wood',C));box('stoneD',0,.04,(S.z0+S.z1)/2,3,.04,S.z1-S.z0,fgCol('stoneD',C));
  /* the hay (left bay) and the peat (right bay), stacked to the eaves */
  const hc0=P('straw');for(let k=0;k<3;k++)box('straw',S.x0+1.4,0,S.z0+.9+k*1.6,2.6,2.2-k*.3,1.5,hc0,rr(-.05,.05));ellip('straw',S.x0+1.5,1.9,S.z0+2,1.2,.6,1.6,hc0,0,8);
  for(let i=0;i<4;i++)for(let j=0;j<5;j++)for(let k=0;k<4-Math.floor(i/2);k++)box('stoneD',S.x1-.4-i*.45,k*.28,S.z0+.4+j*.5,.4,.26,.42,P('peat'),rr(-.1,.1));
  /* the loft beams, a flail and rakes on pegs, a sledge for the peat */
  const pc=fgCol('pole',C);for(const x of [-2.2,2.2])pole('pole',[x,S.wh-.2,S.z0],[x,S.wh-.2,S.z1],.1,pc,7);
  for(const x of [-1.2,1.2])pole('pole',[x,.4,S.z0+.15],[x+.2,2.2,S.z0+.15],.025,pc,5);
  fgFurn('job_bales',S.x0+1.2,null,S.z1-.7,0);fgFurn('job_sheaf_rack',1.9,null,S.z0+.45,0);fgFurn('generic_basket',-1.8,null,S.z1-.4,0);
  fgSign(fgSlogan(),3.3,1.9,S.hd+.02,0,C,{ch:.14,kind:'rust',ink:'white'});
  fgPatch(-3.2,1.6,S.hd+.01,1.2,1,0,C,'tin');}});
/* the egg store: round and half sunk, its floor .8 m under the door's sill, so it keeps cold; the turf banked against the
   low wall; the dome corbelled in stone and capped with turf */
defBuilding({key:'fg-eggstore',name:'The egg and honey store',seed:9124,cut:true,w:6,d:6,h:4.5,budget:70000,
 tags:{types:['farm'],style:'drystone',role:'works',job:'warehousing'},
 note:'a cool corbelled store, half sunk: egg racks in ash, honey crocks, the herb bundles hung',
 build(o){const C=fgCx(o),r=3,t=.75,sunk=.8,wh=1.5,g=.2,col=fgCol('stone',C),a0=PI/2+g,a1=PI/2-g+TAU;
  cyl('stone',0,Math.min(C.lo,-sunk-.4),0,r+.02,.06-Math.min(C.lo,-sunk-.4),col,20);
  /* the sunk floor inside: a stone pan .8 m down, steps down from the door */
  cyl('stoneD',0,-sunk,0,r-t,.04,fgCol('stoneD',C),18);
  sector('stone',0,0,r-t,r,a0,a1,-sunk,wh,col);sector('stone',0,0,r-t,r,PI/2-g-.02,PI/2+g+.02,1.15,wh,col,3);box('stoneD',0,.95,r-t/2,1.3,.22,t+.04,fgCol('stoneD',C));
  for(let k=0;k<3;k++)box('stoneD',0,-sunk+k*.27,r-t-.3-k*.28,.9,.27,.3,fgCol('stoneD',C));
  /* the turf banked against the wall (a skirt), the corbels, the turf cap */
  lathe('turf',0,0,[[r+.02,0],[r-.05,.9],[r-.35,wh+.05]],18,fgCol('turf',C),{a0:a0,a1:a1});
  const nc=6;for(let k=0;k<nc;k++){const y0=wh+k*.38,ro=(r-.05)*(1-Math.pow((k+1)/nc,1.5)*.8),ri=Math.max(.2,ro-.7);sector('stone',0,0,ri,ro,0,TAU,y0,y0+.39,col,22);}
  lathe('turf',0,0,[[r*.62,wh+.9],[r*.42,wh+1.9],[r*.2,wh+2.6],[0,4.5]],16,fgCol('turf',C));
  fgDoor(0,r-t/2,.85,1.55,C,{th:t,name:'the egg store door'});
  /* the racks: plank shelves round the back wall, eggs bedded in ash in rows; honey crocks below; herbs hung from the corbels */
  const ri=r-t-.05,wc=fgCol('wood',C);let eggs=0;
  for(const y of [-sunk+.55,-sunk+1.05,-sunk+1.55]){for(let k=0;k<7;k++){const a=PI*1.15+k*.26,x=Math.cos(a)*(ri-.25),z=Math.sin(a)*(ri-.25),ry=Math.atan2(-x,-z);
   W(x,y,z,ry,()=>{box('wood',0,0,0,.6,.04,.42,wc);box('stoneD',0,.04,0,.56,.04,.38,hc(0x9a948a));for(let i=0;i<3;i++)for(let j=0;j<2;j++){ellip('plain',-.18+i*.18,.1,-.08+j*.16,.04,.055,.04,P('white'),0,6);eggs++;}});}}
  fgNote('eggs',eggs);
  for(let k=0;k<5;k++){const a=PI*.3-k*.28,x=Math.cos(a)*(ri-.3),z=Math.sin(a)*(ri-.3);fgFurn(k%2?'generic_crock':'generic_storage_jar',x,-sunk+.04,z,0,{v:k%2});}
  for(let k=0;k<6;k++){const a=k*TAU/6+.3,x=Math.cos(a)*1.1,z=Math.sin(a)*1.1;cord('cord',[[x,wh+.6,z],[x,wh+.15,z]],.008,P('rope'));ellip('straw',x,wh,z,.08,.2,.08,hc(0x6a7a3a),0,6);}
  if(C.worn)fgRubble(-1,r-.12,3,C);}});
