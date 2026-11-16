// TARGET: isle — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the page's budgets
const adEye=(x,z,tx,tz,dy)=>[x,terrainH(x,z)+1.7+(dy==null?0:dy),z,tx,terrainH(tx,tz)+4,tz];
const VIEWS=(function(){
 const V={},HP=AD_PLACE.find(p=>p.id==='hall-of-dreaming'),A=AD_HALL,hy=HP.o.y,hl=(u,v)=>loc(HP.x,HP.z,u,v,HP.ry);
 const M=AD_PLACE.find(p=>p.id==='mole'),B=AD_PLACE.find(p=>p.id==='boathouse'),T=AD_TERR;
 V['Overview']=[-380,230,560,0,70,-260];
 V['From the barge']=[M.x+7,2.6,M.z+40,0,T.monastery.y,-252];   /* from the water off the mole's head, up the axis */
 V['The wharf']=[B.x-70,24,B.z+90,B.x-40,2,B.z-30];
 V['The Stair of Lowered Eyes']=[72,AD_STAIR.yFoot+34,-(AD_STAIR.footU-24),0,AD_STAIR.yFoot+20,-(AD_STAIR.footU+24)];   /* from over the lower ward, south-east: the zigzag up the scarp's face */
 V['The Blue Gate and the court']=adEye(10,-180,0,-252,0);
 V['The Lotus Garden to the Hall']=[-30,T.hall.y+16,-296,0,T.hall.y+6,-416];   /* from over the Lotus Garden, above the Hall terrace's 20 m face */
 {const f=hl(0,A.HZ+12),t=hl(0,0);V['The Hall of Dreaming']=[f[0]+18,hy+9,f[1]+8,t[0],hy+6,t[1]];}
 /* inside: from the Foot Gallery down the Keepers' Walk to the shrine; from the women's side's first bay; the Damsel's shrine */
 {const e=hl(0,A.HZ-A.T-3.2),t=hl(0,-A.HZ+2);V['Inside the Hall - down the Keepers Walk']=[e[0],hy+A.P+5.6,e[1],t[0],hy+A.P+2.2,t[1]];}
 {const e=hl(13.5,21),t=hl(-4,-6);V['Inside the Hall - the womens side']=[e[0],hy+A.P+2.4,e[1],t[0],hy+A.P+.6,t[1]];}
 {const e=hl(0,-19),t=hl(0,-A.HZ+1);V['Inside the Hall - the Damsels shrine']=[e[0],hy+A.P+1.7,e[1],t[0],hy+A.P+2.2,t[1]];}
 const F=AD_PLACE.find(p=>p.id==='fishermonks');V['The fishermonks house']=[F.x-40,F.o.y+30,F.z+70,F.x,F.o.y+4,F.z];
 V['The precinct from above']=[160,T.hall.y+190,-140,0,T.monastery.y,-350];
 /* Erehwon at scale-model px 841,1517: 20 km south-south-west, across the water */
 V['Toward Erehwon']=[0,T.hall.y+16,-500,adWx(841)-AD.WX,0,adWz(1517)-AD.WZ];
 return V;})();
BUDGET.showcase={tris:16000000,calls:2400};BUDGET.cls.city=16000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
if(window._api)window._api.setHour=h=>{AD_SKY.hour=h;};   /* the clock, for a night shot */
if(window._api)window._api.lamps=b=>({format:'krator-lamps',version:1,convention:'metres, +Y up; at is the lamp; color sRGB; size the halo\'s world diameter',
 lamps:AD_LAMPS.filter(l=>!b||(l[0]>=b[0]&&l[0]<=b[2]&&l[2]>=b[1]&&l[2]<=b[3])).map(l=>({at:[+l[0].toFixed(3),+l[1].toFixed(3),+l[2].toFixed(3)],amp:1,
  radius:{azure:7,gold:6,oil:18,pane:14}[l[3]]||12,cool:l[3]==='azure'||l[3]==='pane',color:{azure:'#4a7ae8',gold:'#ffc870',oil:'#ffc890',pane:'#3a6ad8'}[l[3]]||'#ffc890',size:.5,hours:l[3]==='gold'?[0,24]:[17.2,30.8],kind:l[3]}))});
