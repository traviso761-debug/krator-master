// TARGET: palace — preset views. The first is the opening shot. A view that opens the cutaway is a function (core/host calls
// it when the view is chosen): it cuts a unit at a storey (95p-palace-furnish.js makes the units) and returns the camera
// over the cut; every other view closes the cut. The hill centre is the origin, the gate at +z, the mesa top y 40; the
// palace block's centre is (0, -20) (the citadel frame's u 20).
const PALV_TOP=40;
const palCut=(unit,storey,cam)=>()=>{if(typeof KHOST!=='undefined'&&KHOST.cut&&KHOST.cut.to){if(unit)KHOST.cut.to(unit,storey);else if(KHOST.cut.on)KHOST.cut.off();}return cam;};
const VIEWS={
 'Opening':palCut(null,0,[-150,120,190,0,58,-20]),
 'Overview':palCut(null,0,[-330,260,330,0,40,-10]),
 'The triumphal plaza':palCut(null,0,[-16,PALV_TOP+6,96,0,PALV_TOP+12,-10]),
 'The grand entrance':palCut(null,0,[-8,PALV_TOP+3.5,40,0,PALV_TOP+6,0]),
 'The Hangar Hall':palCut(null,0,[-3,PALV_TOP+34,30,-1,PALV_TOP+32,-6]),
 'The Mech Gate':palCut(null,0,[22,12,-160,0,8,-112]),
 // inside, at eye level (the citadel frame: x = v, z = -u, the mesa top y 40)
 'Inside: the Aula Regia':palCut(null,0,[-1,PALV_TOP+28+2.4,-25,-1,PALV_TOP+28+3.2,-44]),
 'Inside: the Hangar Hall':palCut(null,0,[-1,PALV_TOP+28+2.2,-9,-1,PALV_TOP+28+3,-22]),
 'Inside: the atrium':palCut(null,0,[-12,PALV_TOP+1.8,7,4,PALV_TOP+3,-5]),
 'Inside: the Domus loggia':palCut(null,0,[-9,PALV_TOP+14+1.8,1.5,8,PALV_TOP+14+2,-6]),
 'Inside: the Audience of Envoys':palCut(null,0,[-60,PALV_TOP+1.7,-14.5,-60,PALV_TOP+2.2,-3]),
 'Inside: the Library of the Palace':palCut(null,0,[-16,PALV_TOP+28/3+1.7,-13,-28,PALV_TOP+28/3+2,-30]),
 'Inside: the Orangery':palCut(null,0,[-38,PALV_TOP+14.15+1.7,-13.3,-38,PALV_TOP+14.15+1.4,-19]),
 'The roof gardens':palCut(null,0,[-82,PALV_TOP+42,36,-24,PALV_TOP+15,-12]),
 'The Praetorium\'s door':palCut(null,0,[46.5,PALV_TOP+2.4,4,49.5,PALV_TOP+2.2,-12]),
 'Cut: ground storey':palCut('palace',0,[58,PALV_TOP+78,58,0,PALV_TOP,-20]),
 'Cut: the Domus':palCut('palace',3,[58,PALV_TOP+86,40,4,PALV_TOP+14,-24]),
 'Cut: the hall level':palCut('palace',6,[50,PALV_TOP+86,10,4,PALV_TOP+28,-30]),
 'Cut: the emperor\'s rooms':palCut('palace',7,[40,PALV_TOP+80,0,4,PALV_TOP+39,-32]),
 'Cut: the tower':palCut('palace',9,[30,PALV_TOP+86,-10,16,PALV_TOP+50,-30]),
 'Cut: the Depot':palCut('mesa',1,[44,38,22,-6,0,-14]),
 'Cut: the Core':palCut('mesa',0,[36,22,-2,4,-12,-26]),
 'Cut: the Praetorium':palCut('praetorium',0,[95,PALV_TOP+40,10,60,PALV_TOP+4,-19]),
 'Cut: the Praetorian Barracks':palCut('barracks1',0,[84,PALV_TOP+34,30,62,PALV_TOP+2,14]),
};
