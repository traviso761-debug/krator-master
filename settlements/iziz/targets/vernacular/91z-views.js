const RV=(ri,dist,h,ty)=>[0,h,ROWZ[ri]+dist,0,ty,ROWZ[ri]];
const SITEV=(key,dist,h,ty,dx)=>{const S=SITES.find(s=>s.key===key);return[S.x+(dx||0),h,S.z+dist,S.x,ty,S.z];};
const EYE=(key,dist,dx)=>{const S=SITES.find(s=>s.key===key);return[S.x+(dx||0),1.7,S.z+dist,S.x,3,S.z];};
const VIEWS={
 'Opening':[-95,38,150,-6,8,48],
 'Overview':[-620,330,ROWZ[7]+40,0,10,ROWZ[7]],
 'Poor dwellings':RV(0,44,22,3),'Poor — eye level':EYE('vern_house_poor_a',16,6),
 'Middle dwellings':RV(1,52,26,4),'Middle — eye level':EYE('vern_house_mid_a',18,5),
 'Rich dwellings':RV(2,70,34,5),'Manor — eye level':EYE('vern_house_rich_a',26,8),'Domed house — eye level':EYE('vern_house_rich_b',26,-6),
 'Shops and tavern':RV(3,52,26,4),'Shops — eye level':EYE('vern_shops',16,4),'Tavern — eye level':EYE('vern_tavern',22,6),
 'Workshops and smithy':RV(4,50,26,4),'Smithy — eye level':EYE('vern_smithy',18,6),
 'Market and warehouse':RV(5,60,32,5),'Market — inside':EYE('vern_market',6,3),
 'Silos, tank, generator':RV(6,56,30,5),'Generator — eye level':EYE('vern_generator',16,6),
 'School and hospital':RV(7,72,38,6),'School — eye level':EYE('vern_school',26,4),
 'Alchemist':RV(8,54,30,6),'Alchemist — court':EYE('vern_alchemist',10,3),
 'Barracks':RV(9,68,40,6),'Barracks — gate':EYE('vern_barracks',30,2),
 'Guilds — farmers, beast hunters':RV(10,62,34,6),"Farmers' Guild — eye level":EYE('vern_farmers_guild',24,4),
 'Caravanserai and Forgemasters':RV(11,70,38,6),'Caravanserai — court':EYE('vern_caravanserai',8,2),"Forgemasters' Hall — eye level":EYE('vern_forgemasters_hall',28,6),
 'Voth Embassy and Order Chapterhouse':RV(12,72,40,8),'Embassy — eye level':EYE('port_voth_embassy',26,5),'Chapterhouse — eye level':EYE('port_order_chapterhouse',26,-5),
 "Salvagers' Guild (Ancient laboratory)":RV(13,90,50,20),"Salvagers' — yard":EYE('anc_salvagers_guild',42,6),
 'Mercenary Guild (Ancient police station)':RV(14,90,50,12),'Mercenary — gate':EYE('anc_mercenary_guild',50,3),
 'Frontier — palace, guard tower, watch, toll':RV(15,96,46,8),"Governor's Palace — eye level":EYE('vern_governor_palace',34,4),'Guard tower — eye level':EYE('vern_guard_tower',24,5),
 'Watch and toll — eye level':(()=>{const S=SITES.find(s=>s.key==='vern_toll_house');return[S.x+15,1.7,S.z+9,S.x-8,3,S.z];})(),
 'Frontier — palisade, gate, mustering ground':RV(16,74,36,4),'Palisade gate — eye level':EYE('vern_palisade_gate',18,2),
 'Frontier — rest stops':RV(17,36,14,4),'Rest stop (rock) — eye level':EYE('vern_rest_stop',13,2),
 'Rest stop (cliff) — from the drop':[20,6,ROWZ[17]+18,14,4,ROWZ[17]],
};
