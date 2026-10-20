// prefix: et
// ================================================================= THE COURT OVER WATER (PLAN.md section 4): the Heirs'
// pavilion and the covered gallery that chains the pavilions across water and ruin (the owner's arch-20, arch-26, arch-33).
// Bronze tracery over alabaster, dark stone podiums, metal fish-scale roofs in the metals of rank; courts kept almost
// empty (a thousand Heirs: scale from emptiness).

/* the outline of a regular octagon of circumradius R, corners from ET_OCT0 (flat faces toward the axes), increasing angle */
function etOct(R){const p=[];for(let i=0;i<8;i++){const a=ET_OCT0+i*TAU/8;p.push([R*Math.cos(a),R*Math.sin(a)]);}return p;}
const ET_ROOF_TAKES=[{mk:'gilt'},{mk:'scale',col:'bronze'},{mk:'scale',col:'gunmetal'}];

/* the Heir's pavilion: an octagon of bronze piers on a dark stone podium in a square pool, every face but the door's a
   panel of alabaster behind a bronze tracery grid over an onyx dado; a fish-scale ogee roof under a gold finial. The roof's
   metal is the variant (v: 0 gilt, 1 bronze, 2 gunmetal); a causeway and steps to the front */
defBuilding({key:'et_heir_pavilion',name:"Heir's pavilion",seed:7301,cut:true,w:15.4,d:16.6,h:16.2,budget:120000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'court'},
 note:'an octagon of bronze tracery over alabaster on a stone podium in a pool, an onyx dado, a fish-scale ogee roof (gilt, bronze or gunmetal by variant) under a gold finial',
 build(o){const S=15,R=3.6,Y=1.26,HP=4.2,sd=P('stoneD'),wc=new THREE.Color(ET_WATER),wh=new THREE.Color(1,1,1),ap=R*Math.cos(PI/8),fw=2*R*Math.sin(PI/8);
  const T=ET_ROOF_TAKES[(o.v|0)%3];
  // the pool, its kerb, the podium and the causeway
  box('stone',0,0,0,S-.8,.03,S-.8,new THREE.Color(sd).multiplyScalar(.6));box('water',0,.03,0,S-.8,.4,S-.8,wc);
  for(const [x,z,w,d] of [[0,S/2-.2,S,.4],[0,-S/2+.2,S,.4],[S/2-.2,0,.4,S-.8],[-S/2+.2,0,.4,S-.8]])box('stone',x,0,z,w,.55,d,sd);
  prism('stone',etOct(5.2),0,Y-.06,sd);prism('paving',etOct(5.0),Y-.03,Y+.03,P('paving'));
  box('stone',0,0,6.05,2.6,Y,2.6,sd);for(let k=0;k<3;k++)box('stone',0,0,7.55+k*.3,2.6,Y-.3-k*.3,.3,sd);
  // the piers at the corners; the faces between them
  for(const q of etOct(R))box('bronze',q[0],Y,q[1],.3,HP,.3,P('bronze'));
  for(let i=0;i<8;i++){const ph=i*TAU/8;pushM(TF(ap*Math.cos(ph),0,ap*Math.sin(ph),PI/2-ph));
   if(i===2){door(0,Y,0,0,1.6);for(const s of [-1,1])box('bronze',s*1.02,Y,.3,.06,3.0,.62,P('bronze'));   /* the door: its leaves folded back */
    etTracery(0,Y+3.0,0,fw-.34,HP-3.0,{head:'flat',mw:.46,th:.4});box('alabaster',0,Y+3.0,-.02,fw-.34,HP-3.0,.04,wh);}
   else{box('onyx',0,Y,0,fw-.34,.7,.12,wh);box('alabaster',0,Y+.7,0,fw-.34,HP-.7,.05,wh);
    for(const s of [1,-1]){pushM(TF(0,0,0,s>0?0:PI));etTracery(0,Y+.7,.05,fw-.34,HP-.7,{head:'pointed',mw:.42,th:.5});popM();}}
   popM();}
  prism('stone',etOct(R+.3),Y+HP,Y+HP+.28,sd);
  etOgee(R+.75,Y+HP+.28,4.8,{mk:T.mk,col:T.col?P(T.col):wh});
  FURNISH('eternian_court_alabaster_lamp',-1.9,Y,-1.7,0);FURNISH('eternian_court_alabaster_lamp',1.9,Y,-1.7,0);
  FURNISH('eternian_court_gallery_bench',0,Y,-2.85,0);FURNISH('eternian_court_visor_case',ap-.26,Y,0,-PI/2);
  FURNISH('eternian_court_ancestor_niche',-ap+.28,Y,0,PI/2);}});

/* the Heirs' gallery: a covered walk of four bays on stone piers over water, bronze tracery open to the air on the front,
   a solid wall of pale brick behind with a niche and a head in it every bay, in the metals of rank; a gunmetal fish-scale
   roof. A segment: its ends open, to chain pavilion to pavilion across water and ruin */
defBuilding({key:'et_heir_gallery',name:"Heirs' gallery",seed:7302,w:16.4,d:7.4,h:8,budget:100000,front:{x:0,z:3.7,yaw:0},
 tags:{types:['infrastructure'],wealth:'rich',style:'court'},
 note:'four bays on stone piers over water: open bronze tracery in front, a brick wall behind with a head in a niche every bay, a gunmetal fish-scale roof; a segment that chains pavilions',
 build(o){const L=16,Y=1.4,H=4.2,sd=P('stoneD'),br=P('brick'),brD=new THREE.Color(P('brick')).multiplyScalar(.86);
  box('stone',0,0,0,L,.03,7,new THREE.Color(sd).multiplyScalar(.6));box('water',0,.03,0,L,.4,7,new THREE.Color(ET_WATER));
  for(let i=0;i<5;i++)box('stone',-L/2+i*4,0,0,.9,Y-.4,4.4,sd);
  box('stone',0,Y-.4,0,L,.4,4.4,sd);box('paving',0,Y-.02,0,L,.05,4.0,P('paving'));
  // the wall behind, a niche and a head every bay
  box('brick',0,Y,-2.0,L,H,.4,br);
  ['gold','silver','bronze','gunmetal'].forEach((m,i)=>{const x=-6+i*4;
   box('stone',x,Y+.9,-1.79,1.3,2.3,.04,new THREE.Color(sd).multiplyScalar(.55));etStepHead(x,Y+3.2,-1.78,1.3,{mk:'brick',col:brD});
   box('stone',x,Y,-1.5,.8,.9,.6,sd);etHead(x,Y+.9,-1.5,.8,{metal:m});});
  // the front: brick piers, a dado, open bronze tracery
  for(let i=0;i<5;i++)box('brick',-L/2+i*4,Y,1.95,.5,H,.5,brD);
  for(let i=0;i<4;i++){const x=-6+i*4;box('brick',x,Y,1.95,3.5,.6,.3,br);etTracery(x,Y+.6,1.95,3.3,H-.7,{head:'pointed',mw:.42,th:.55});}
  box('stone',0,Y+H,0,L+.2,.25,4.8,sd);
  etGable(L,4.4,Y+H+.25,1.8,{mk:'scale',col:P('gunmetal'),ov:.5,gov:0,gables:false});
  FURNISH('eternian_court_gallery_bench',-4,Y,-1.55,0);FURNISH('eternian_court_gallery_bench',4,Y,-1.55,0);
  FURNISH('eternian_court_alabaster_lamp',0,Y,-1.5,0);FURNISH('eternian_court_alabaster_lamp',-7.4,Y,-1.5,0);FURNISH('eternian_court_alabaster_lamp',7.4,Y,-1.5,0);}});
