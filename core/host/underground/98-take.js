// ================================================================= UNDERGROUND TEST — the take: every underground piece handed to core/host
// The follow camera (V) on the cavern's own distance field and the crates as boxes (the ropes are thin: left out); the deck cut (X, ]
// [) with caps, the decks above hidden and the ones below darkened; the soft band (U); the section (C) and the slab (Shift+C); the
// map's deck band and the line map (L). The ground is far below everything: the walker stands on the KWALK floors the cavern wrote.
const UG_SOLID=KHOST.solidFrom({cavern:UGC,walk:KWALK});
const UG_VIEWS={
 'The gallery':[-46,2.4,3,-20,1.6,-1],
 'The hold, cut (deck 2)':[-62,26,52,-8,4,8],
 'The hall':[80,4,6,100,3,-2],
 'The sets':[-6,10.7,19,12,10,25],
 'The narrow way':[17,10.6,22.5,40,10.4,22.5],
 'The shaft foot':[22,1.7,-4,25,8,-9]};
const H=KHOST.take({build:'underground',title:'Underground camera test',
 hint:'core/host underground pieces: V follow (wheel: the arm) · X deck cut, ] [ deck · U band cut · C section, Shift+C slab · M map · L line map · F walk',
 scene,camera,renderer,ground:()=>-50,clear:.3,minR:.5,maxR:400,
 walk:KWALK,walker:{step:.6,r:.3,h:1.7},eye:1.7,
 views:UG_VIEWS,start:'The gallery',
 solid:UG_SOLID,follow:{dist:4},
 cutaway:{units:[{id:'hold',name:'The hold',x:-7,z:5,w:160,d:50,levels:UG.DECKS.map(d=>({y:d.y,h:4.5,name:d.name}))}],cutAt:2.3,
  caps:{color:'#3a2f28'},decks:{fog:{opacity:.55}},band:{above:2.2,soft:1},section:{slab:6}},
 minimap:{frame:[-80,130,-60,60],size:260,relief:false,title:'The hold',decks:{bands:UG.DECKS},
  schematic:Object.assign({onPick:n=>{const p={west:[-60,0,0],mid:[0,0,0],hall:[96,0,0],foot:[25,0,-7],head:[25,60,-9],loj:[-10,4.5,11],sets:[2,9,22],end:[50,9,25]}[n.id];if(p){KHOST.cam.ctl.target.set(p[0],p[1]+1.5,p[2]);KHOST.cam.ctl.radius=18;}}},UG.LINE)},
 stats:()=>{const F=KHOST.follow,S=F&&F.S;return 'rock '+UG_DRAW.tris+' tris in '+UG_DRAW.meshes+' meshes'+(F&&F.on?'\nfollow: arm '+S.L.toFixed(2)+' of '+S.want.toFixed(1)+' m, '+S.mode+', ceiling '+S.hc.toFixed(1)+' m, clear '+F.clearance().toFixed(2)+' m':'');},
 api:{ug:{UGC,UG,solid:UG_SOLID}}});
