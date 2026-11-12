// Presets for Strongbow today, from the layout (sbLayout(), settlements/strongbow) and what the builder left in SB_SITE[1].
BUDGET.type.strongbow='mega';
const SBT=(function(){const L=sbLayout(),P={};for(const p of L.parts)P[p.id]=p;const c=p=>{const s=P[p].shape;return s[0]==='box'?[(s[1]+s[2])/2,P[p].y,(s[3]+s[4])/2]:[s[1],P[p].y,s[2]];};
 return{L,P,c,W:L.ways.filter(w=>w.elevator),wx:L.wallX};})();
const SBV=(cam,tgt)=>cam.concat(tgt);
const VIEWS={
 'Strongbow today':              SBV([-560,600,1650],[0,500,0]),
 // the elevator: the wall lifts up the face west of the bay, from T3 to the Nock's west wing and on to the lip
 'The elevator':                 SBV([SBT.wx-330,520,520],[SBT.wx,560,0]),
 // the lifts up the Spine: L1 in the core, L2 outside it, the bridge from T3 to the first wall lift
 'The lifts up the Spine':       (function(){const t=SBT.c('sb.T2');return SBV([t[0]-260,t[1]+40,t[2]+300],[t[0]-20,t[1]+20,t[2]]);})(),
 // the bazaar in the lobby: the stalls round the core, the scrap glass on its south side
 'The bazaar':                   (function(){const a=SBT.L.lobby.at;return SBV([a[0]+50,14,a[2]+12],[a[0]-40,10,a[2]-14]);})(),
 // the plaza: the girder gate, the shrine, the Cistern Pavilion, the serai beyond
 'The plaza':                    (function(){const p=SBT.c('sb.plaza');return SBV([p[0]+40,30,p[2]+190],[p[0]-40,8,p[2]-20]);})(),
 // the serai on the terminus hall's platforms, the crushed west half beyond
 'The serai':                    (function(){const p=SBT.c('sb.hall.serai');return SBV([p[0]+120,60,p[2]+200],[p[0]-60,6,p[2]]);})(),
 // the outcasts' rope ways down the face to the scree, their fires in the drums
 'The rope ways':                (function(){const p=SBT.c('sb.sp.3.1');return SBV([p[0]-420,200,p[2]+380],[p[0]-120,140,p[2]]);})(),
 // the Nock: the Order's balloon on the pad, its shed and signal mast, the transfer landing walled off
 'The balloon field':            (function(){const p=SBT.c('sb.nock.pad');return SBV([p[0]-180,p[1]+80,p[2]+180],[p[0]-40,p[1]+18,p[2]-20]);})(),
 // the top: the Sultanate's post where W5 lands, the caravan yard, the Order's gatehouse on the rim gallery
 'The post at the lip':          (function(){const p=SBT.c('sb.lip.post');return SBV([p[0]-230,p[1]+70,p[2]+150],[p[0]-30,p[1]+4,p[2]-70]);})(),
};
VIEWS['Strongbow today at night']=SBV([-560,600,1650],[0,500,0]).concat([1]);
