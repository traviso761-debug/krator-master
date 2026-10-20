// TARGET: ixtest — every building that got an interior on 2026-10-19, in rows, each labelled by its key and state (89y). The
// interiors are on (as in the city), the skyscrapers' and Ancient buildings' rooms furnished near the camera (95i, IXTEST).
const TITLE='Iziz Interiors Test';
VERN.interiors=typeof KratorInteriors!=='undefined'&&!/[?&]interiors=0\b/.test(location.search);
var IZS_HOLLOW={temple:VERN.interiors,arena:VERN.interiors,guilds:VERN.interiors,sky:VERN.interiors,apts:VERN.interiors,houses:VERN.interiors,fuel:VERN.interiors,trans:VERN.interiors,alt:VERN.interiors,hotel:VERN.interiors,cultural:VERN.interiors};
window.IXTEST=true;
const GROUND_C=560;
const ROWZ=[0,190,360,470,580,720,860,1000,1110,1270,1430];
const ROWNAMES=['Vernacular civic, embassy, chapterhouse','Ancient guilds, temple, arena','Skyscrapers — repaired','Skyscrapers — ruined','Skyscrapers — toppled',
 'Apartments, houses, kiosk — repaired','Apartments, houses, kiosk — ruined','Transplants — reclaimed','Transplants — ruined',
 'Roster of 2026-10-19 — repaired','Roster of 2026-10-19 — ruined'];
const SITES=[];
// lay a row out along x, each site `w` metres wide, centred on x = 0
const rowOut=(ri,items)=>{const total=items.reduce((a,it)=>a+it.w,0);let x=-total/2;for(const it of items){SITES.push(Object.assign({x:x+it.w/2-(it.shift||0),z:ROWZ[ri],ry:0},it.site));if(it.also)SITES.push(Object.assign({x:x+it.w/2,z:ROWZ[ri],ry:0},it.also));x+=it.w;}};
rowOut(0,['vern_school','vern_hospital','vern_barracks','vern_alchemist','vern_farmers_guild','vern_beast_hunters_guild','vern_forgemasters_hall','vern_generator','port_voth_embassy','port_order_chapterhouse']
 .map(k=>({w:VERN.defs[k].w+12,site:{key:k,o:{v:0}}})));
rowOut(1,[{w:100,site:{key:'anc_salvagers_guild',o:{v:0,scale:.5}},also:{key:'anc_salvagers_ix',o:{y:0}}},
 {w:90,site:{key:'anc_mercenary_guild',o:{v:0,scale:.45}},also:{key:'anc_mercenary_ix',o:{y:0}}},
 {w:90,site:{key:'ixt_temple',o:{}},also:{key:'iziz_temple_ix',o:{y:0}}},
 {w:100,site:{key:'ixt_arena',o:{}},also:{key:'iziz_arena_ix',o:{y:0}}}]);
// the owner's exiles (2026-10-19): sky C stays only toppled; Apartments A and the kit houses D-F leave the sheet
[3,1,2].forEach((d,i)=>rowOut(2+i,['skyA','skyB','skyC','skyD','skyE','skyF'].filter(k=>k!=='skyC'||d===2).map(k=>({w:k==='skyC'?90:k==='skyA'?80:70,site:{key:'ixt_'+k+'_d'+d,o:{scale:.3}}}))));
const IXT_S={aptsA:.385,aptsC:.39,honey:.6,houseD:.7,houseE:.54,houseF:.7,fuel:.3};
[3,1].forEach((d,i)=>rowOut(5+i,['aptsC','honey','fuel'].map(k=>({w:k==='honey'?110:k==='aptsC'?80:70,shift:(IXT_CENTRE[k]||0)*IXT_S[k],site:{key:'ixt_'+k+'_d'+d,o:{scale:IXT_S[k]}}}))));
// the owner's roster (2026-10-19): the alternates, the flatiron, the hotel, the cultural centre (compact) and Apartments C2, at the scales
// the city's lots give them
const IXT_S2={wave:.75,bridge:.8,fins:.83,adlab:.9,flat:.25,hotel:.47,cultural:.25,aptsC2:.45},IXT_W2={wave:45,bridge:45,fins:120,adlab:75,flat:45,hotel:95,cultural:85,aptsC2:65};
[3,1].forEach((d,i)=>rowOut(9+i,Object.keys(IXT_S2).map(k=>({w:IXT_W2[k],site:{key:'ixt_'+k+'_d'+d,o:{scale:IXT_S2[k]}}}))));
['ancrehab','ancruin'].forEach((m,i)=>rowOut(7+i,['setback','setback2','pent','hept','wedge','barrel','midrise'].map(k=>({w:k==='setback'?50:40,site:{key:'ixt_t_'+k+'_'+m,o:{}}}))));
