// TARGET: set — camera presets. [cx,cy,cz,tx,ty,tz] and an optional SEVENTH element: the hour of day (see 94-dalab-light.js)
const RV=(ri,dist,h,ty,hour)=>{const v=[0,h,ROWZ[ri]+dist,0,ty,ROWZ[ri]];if(hour!=null)v.push(hour);return v;};
const SITEV=(key,dist,h,ty,dx,hour)=>{const S=SITES.find(s=>s.key===key);const v=[S.x+(dx||0),h,S.z+dist,S.x,ty,S.z];if(hour!=null)v.push(hour);return v;};
const EYE=(key,dist,dx,hour)=>{const S=SITES.find(s=>s.key===key);const v=[S.x+(dx||0),1.7,S.z+dist,S.x,3,S.z];if(hour!=null)v.push(hour);return v;};
const VIEWS={
 'Opening':[-110,44,170,-4,8,60],
 'Overview':[-900,420,ROWZ[6]+60,0,10,ROWZ[6]],
 'Peasant huts':RV(0,40,20,3),'Earth hut — eye level':EYE('dalab_hut_a',14,5),'Scrap hut — eye level':EYE('dalab_hut_b',14,-5),'Post house — eye level':EYE('dalab_hut_c',16,5),
 'Compound, granaries, shrine':RV(1,46,24,4),'Compound — inside':EYE('dalab_compound',5.5,-1.5),'Granaries — eye level':EYE('dalab_granaries',14,4),
 'Noble houses':RV(2,70,36,6),'Stone hall — eye level':EYE('dalab_noble_a',26,7),'Great roundhouse — eye level':EYE('dalab_noble_b',30,-8),'Manor — gate':EYE('dalab_noble_c',24,3),
 'Tavern and market':RV(3,60,30,5),'Tavern — eye level':EYE('dalab_tavern',22,6),'Market — inside':EYE('dalab_market_small',4,2),
 'Warehouse, smithy, workshop':RV(4,52,26,5),'Smithy — eye level':EYE('dalab_smithy',16,6),
 'Large market':RV(5,80,44,6),'Large market — inside':EYE('dalab_market_large',8,3),
 'Barracks, priest house, temple':RV(6,66,34,6),'Barracks — gate':EYE('dalab_barracks',26,3),'Temple — eye level':EYE('dalab_temple',26,7),
 'Embassies':RV(7,74,38,8),'Izizian embassy — gate':EYE('dalab_embassy_iziz',24,4),'Vothic embassy — gate':EYE('dalab_embassy_voth',24,4),"Historians' embassy — gate":EYE('dalab_embassy_hist',24,4),
 'Halls of Reformation':RV(8,110,60,10),'Halls — gate':EYE('dalab_halls',46,4),'Halls — court':EYE('dalab_halls',16,-10),
 'Ceremonial mound':RV(9,120,60,12),'Mound — foot of the stair':EYE('dalab_mound',44,4),'Mound — top':[-14,13+1.7,ROWZ[9]+18,0,13+4,ROWZ[9]-4],
 "High Priest's mound":RV(10,200,100,18),'High mound — entrance':EYE('dalab_high_mound',82,5),'High mound — top':[-20,20+1.7,ROWZ[10]+22,0,20+5,ROWZ[10]-6],
 'Night — noble houses':RV(2,70,36,6,21.5),'Night — temple (eye level)':EYE('dalab_temple',26,7,22),'Night — Halls of Reformation':RV(8,110,60,10,22.5),'Night — peasant huts':EYE('dalab_hut_a',14,5,21),'Dusk — mound':RV(9,120,60,12,18.4),
};
