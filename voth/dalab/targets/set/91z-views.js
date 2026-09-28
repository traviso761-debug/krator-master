// TARGET: set — camera presets. [cx,cy,cz,tx,ty,tz] and an optional SEVENTH element: the hour of day (see 94-dalab-light.js)
const RV=(ri,dist,h,ty,hour)=>{const v=[0,h,ROWZ[ri]+dist,0,ty,ROWZ[ri]];if(hour!=null)v.push(hour);return v;};
const SITEV=(key,dist,h,ty,dx,hour)=>{const S=SITES.find(s=>s.key===key);const v=[S.x+(dx||0),h,S.z+dist,S.x,ty,S.z];if(hour!=null)v.push(hour);return v;};
const EYE=(key,dist,dx,hour)=>{const S=SITES.find(s=>s.key===key);const v=[S.x+(dx||0),1.7,S.z+dist,S.x,3,S.z];if(hour!=null)v.push(hour);return v;};
const VIEWS={
 'Opening':[-110,44,170,-4,8,60],
 'Overview':[-1100,520,ROWZ[8]+60,0,10,ROWZ[8]],
 'Peasant huts':RV(0,40,20,3),'Earth hut — eye level':EYE('dalab_hut_a',14,5),'Scrap hut — eye level':EYE('dalab_hut_b',14,-5),'Post house — eye level':EYE('dalab_hut_c',16,5),
 'Compound, granaries, shrine':RV(1,46,24,4),'Compound — inside':EYE('dalab_compound',5.5,-1.5),'Granaries — eye level':EYE('dalab_granaries',14,4),
 'Noble houses':RV(2,70,36,6),'Stone hall — eye level':EYE('dalab_noble_a',26,7),'Great roundhouse — eye level':EYE('dalab_noble_b',30,-8),'Manor — gate':EYE('dalab_noble_c',24,3),
 'Tavern, market, shops':RV(3,64,32,5),'Tavern — eye level':EYE('dalab_tavern',22,6),'Market — inside':EYE('dalab_market_small',4,2),'Shop row — eye level':EYE('dalab_shops',16,4),
 'Warehouse, smithy, workshop':RV(4,52,26,5),'Smithy — eye level':EYE('dalab_smithy',16,6),
 'Potter, weaver, dyer, windmill':RV(5,60,30,5),'Potter — eye level':EYE('dalab_potter',14,5),'Weaver — eye level':EYE('dalab_weaver',18,4),'Dyer — eye level':EYE('dalab_dyer',14,4),'Windmill — eye level':EYE('dalab_windmill',22,8),
 'Large market':RV(6,80,44,6),'Large market — inside':EYE('dalab_market_large',8,3),
 'Barracks, priest house, temple, healers':RV(7,80,40,6),'Barracks — gate':EYE('dalab_barracks',26,3),'Temple — eye level':EYE('dalab_temple',26,7),"Healers' hall — eye level":EYE('dalab_healers',24,6),
 'Embassies':RV(8,74,38,8),'Izizian embassy — gate':EYE('dalab_embassy_iziz',24,4),'Vothic embassy — gate':EYE('dalab_embassy_voth',24,4),"Historians' embassy — gate":EYE('dalab_embassy_hist',24,4),
 "Priests' compound":RV(9,70,40,6),"Priests' compound — gate":EYE('dalab_priest_compound',30,3),"Priests' compound — court":EYE('dalab_priest_compound',-4,8),
 'Halls of Reformation':RV(10,190,110,12),'Halls — gate':EYE('dalab_halls',80,4),'Halls — court':EYE('dalab_halls',30,-12),'Halls — cells':EYE('dalab_halls',-10,-36),
 'Ceremonial mound':RV(11,120,60,12),'Mound — foot of the stair':EYE('dalab_mound',44,4),'Mound — on the stair':[6,7.5,ROWZ[11]+27,0,14,ROWZ[11]],'Mound — top':[-14,13+1.7,ROWZ[11]+18,0,13+4,ROWZ[11]-4],
 'Palace mound':RV(12,150,70,14),'Palace mound — gate':EYE('dalab_palace_mound',56,6),'Palace mound — terraces':[22,12,ROWZ[12]+62,0,14,ROWZ[12]+10],'Palace mound — top':[-9,17+1.7,ROWZ[12]+13,0,17+5,ROWZ[12]-7],'Palace mound — gardens':[SITES.find(s=>s.key==='dalab_palace_mound').x+52,9,ROWZ[12]+18,SITES.find(s=>s.key==='dalab_palace_mound').x+20,11,ROWZ[12]-4],
 "High Priest's mound":RV(13,200,100,18),'High mound — entrance':EYE('dalab_high_mound',82,5),'High mound — top':[-20,20+1.7,ROWZ[13]+22,0,20+5,ROWZ[13]-6],
 'Night — noble houses':RV(2,70,36,6,21.5),'Night — temple (eye level)':EYE('dalab_temple',26,7,22),'Night — Halls of Reformation':RV(10,190,110,12,22.5),'Night — palace mound':RV(12,150,70,14,22),'Night — peasant huts':EYE('dalab_hut_a',14,5,21),'Dusk — mound':RV(11,120,60,12,18.4),
};
