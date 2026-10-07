// prefix: ds
// ================================================================= SMALL TENTS: five for a herder's or a rider's household
// Each is a def (36-def.js): the cover from the tent kit (40-tk-tentkit.js, 40d-dk-desert.js), the inside from the catalog's
// Eastern Nomad pieces (41-tk-dress.js). Tags: culture nomad, types dwelling-single, wealth middle (the hide wedge poor).
// The peaked khaima and the hide wedge came from the Scyvoi kit (2026-10-07), re-skinned: brown hair cloth with white bands.
defBuilding({key:'tent-bayt-small',name:'Small goat-hair tent',seed:4201,cut:true,w:8.2,d:9.4,h:2.7,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'beit-shaar'},
 note:"a black goat-hair tent (bayt sha'ar) on two centre poles, a sadu valance, the qata closing off the household; the coffee hearth by the open front",
 build(o){const w=5.6,d=3.8;const H=dkBayt({w,d,rows:[{z:-.15,n:2,h:2.2}],frontH:1.75,backH:.95,stripes:[2],qata:1.3,qataD:.85});
  tkFloor('patSadu',null,0,w-.3,d-.3);
  tkMajlis(-2.6,-1.45,1.1,-1.45,undefined,0);FURNISH('nomad_arm_cushion',-2.5,0,-.2,PI/2);
  tkCoffee(-.6,.9,PI);FURNISH('nomad_tray_table',-1.7,0,.3,0);FURNISH('nomad_tea_set',-1.7,svfH('nomad_tray_table',0,.45),.3,0);
  FURNISH_HANG('nomad_hanging_lantern',-.8,H(-.8,-.15)-.05,-.15,0);
  // behind the qata: the household
  FURNISH('nomad_bedding_stack',2.2,0,-1.5,0);FURNISH('nomad_water_jars',2.4,0,.2,-PI/2);FURNISH('nomad_saddle_bags',1.8,0,1.0,PI);
  FURNISH('nomad_camel_saddle_seat',-1.4,0,3.0,PI,{setting:'outdoor'});FURNISH('nomad_butter_churn',2.6,0,2.9,-.4,{setting:'outdoor'});}});

defBuilding({key:'tent-khaima-small',name:'Peaked khaima',seed:4204,cut:true,w:7.6,d:8.2,h:3.7,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'khaima'},
 note:'a brown khaima on one tall pole (from the Scyvoi kit): the hair cloth banded in white triangles, the front raised on two poles, a muted kilim within',
 build(o){const H=dkSquare({w:4.4,d:4.4,eaveH:.75,peaks:[[0,-.1,3.3]],open:{x0:-1.05,x1:1.05,h:1.85},lining:'patLining',floor:'rug',floorCol:P('rust'),motif:'tri'});
  FURNISH('nomad_kilim',0,.03,-.1,0,{v:1});
  tkMajlis(-1.2,-1.75,1.2,-1.75,undefined,0);
  for(const s of [-1,1])FURNISH('nomad_floor_cushion',s*1.65,0,.2,s<0?PI/2:-PI/2,{v:s>0?1:0});
  tkTea(0,.55,PI);
  FURNISH('nomad_floor_lantern',-.65,0,-1.2,0);FURNISH('nomad_studded_chest',1.5,0,-1.1,-PI/2);
  FURNISH_HANG('nomad_hanging_lantern',.0,H(0,.6)-.1,.6,0);}});

/* the hunter's wedge: a ridge of hide panels, a porch on two poles, ibex horns over the door (the sign: horns) */
function dsWedgeH(x,z){const d2=1.4,ridge=2.2,eave=.35;return eave+(ridge-eave)*(1-Math.abs(z)/d2);}
defBuilding({key:'tent-hide-wedge',name:'Hide wedge tent',seed:4205,cut:true,w:6.4,d:6.2,h:2.7,budget:50000,
 tags:{types:['dwelling-single'],wealth:'poor',style:'wedge'},
 note:"a hunter's ridge tent of laced hides (from the Scyvoi kit): a white-stitched seam pattern, a porch awning, ibex horns over the door, gear to hand",
 build(o){const L=4.2,d2=1.4,sc=new THREE.Color();const hc1=P('hide'),seam=(u,v)=>{const s=Math.floor(u*L/1.05),f=(u*L/1.05)%1,k=f<.05?.62:1-.12*(s%2)+.08*h3(s,Math.floor(v*4),3);return sc.setRGB(k,k,k);};
  psurf('hide',(u,v)=>{const x=-L/2+u*L,z=-d2-.1+v*(2*d2+.2);return [x,dsWedgeH(x,z),z];},12,8,hc1,{colf:seam});
  for(const s of [-1,1])poly('hide',[[s*L/2,0,-d2-.1],[s*L/2,0,d2+.1],[s*L/2,dsWedgeH(0,0),0]],hc1,true);
  // the white stitched band along each roof slope (the contrasting pattern), a row of small triangles
  for(const s of [-1,1])W(0,0,0,0,()=>{const zA=s*(d2*.55),pts=[];for(let i=0;i<=10;i++){const x=-L/2+i*L/10;pts.push([x,dsWedgeH(x,zA)+.03,zA]);}cord('plain',pts,.03,P('trimW'));
   for(let i=0;i<10;i++){const x=-L/2+(i+.5)*L/10,z0=s*d2*.45,z1=s*d2*.65;poly('plain',[[x-.12,dsWedgeH(x,z1)+.03,z1],[x+.12,dsWedgeH(x,z1)+.03,z1],[x,dsWedgeH(x,z0)+.03,z0]],P('trimW'),true);}});
  pole('wood',[-L/2-.05,0,0],[-L/2-.05,2.3,0],.05,P('woodD'),6);pole('wood',[L/2+.05,0,0],[L/2+.05,2.3,0],.05,P('woodD'),6);
  beam('wood',[-L/2-.2,2.24,0],[L/2+.2,2.24,0],.07,P('woodD'),true,6);
  psurf('hide',(u,v)=>{const x=-1.2+u*2.4;return [x,1.3+(1-v)*.15,d2+.1+v*1.25];},4,2,P('hide'));
  for(const x of [-1.2,1.2]){pole('wood',[x,0,d2+1.35],[x,1.32,d2+1.35],.04,P('woodD'),6);tkGuy([x,1.3,d2+1.35],x*1.4,d2+2.4);}
  for(const x of [-1.9,-.6,.6,1.9]){tkGuy([x,.36,-d2-.12],x,-d2-1.1);}
  // ibex horns over the door: two long ridged scimitars curving back
  for(const s of [-1,1]){const pts=[];for(let i=0;i<=10;i++){const t=i/10;pts.push([s*(.08+t*.22),1.95+Math.sin(t*PI*.7)*.55,d2+.14-t*t*.35]);}cord('bone',pts,.035*(1.1),0x8a7a62);
   for(let i=1;i<9;i+=2){const q=pts[i];ring('bone',q[0],q[1],q[2],.045,.008,0x6e604c,0,PI/2,0,8);}}
  ellip('bone',0,1.9,d2+.14,.1,.12,.08,0xd8ccb0,0,8);
  tkFloor('rug',P('feltB'),0,L-.2,2*d2-.2);
  FURNISH('nomad_majlis_mattress',0,0,-.75,0,{v:1});FURNISH('nomad_floor_cushion',-1.4,0,.3,PI/2);
  FURNISH('nomad_studded_chest',1.5,0,-.6,-PI/2);
  FURNISH('nomad_spear_rack',-2.6,0,1.8,PI/2,{setting:'outdoor'});
  FURNISH('nomad_camel_saddle_rack',2.55,0,1.9,-PI/2,{setting:'outdoor'});
  FURNISH('nomad_water_skins',1.6,0,2.35,0,{setting:'outdoor'});
  door(0,0,d2+.1,0,.9);}});

defBuilding({key:'tent-square-small',name:'Small white tent',seed:4206,cut:true,w:7.4,d:7.4,h:4.4,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'caidal'},
 note:'a small square caidal tent of white canvas, its bands of small arches in dark brown, a horned finial; a muted Moroccan lining inside',
 build(o){const H=dkCaidal({s:4.4,wallH:1.9,peakH:3.5,motif:'arch',doorW:1.4,floor:'rug',floorCol:P('rust')});
  FURNISH('nomad_kilim',0,.03,0,0,{v:2});
  tkMajlis(-1.2,-1.85,1.2,-1.85,undefined,0);
  for(const s of [-1,1])FURNISH('nomad_floor_cushion',s*1.75,0,-.2,s<0?PI/2:-PI/2,{v:s>0?0:1});
  FURNISH('nomad_low_table',0,0,.2,0);FURNISH('nomad_tea_set',0,svfH('nomad_low_table',0,.36),.2,0);
  FURNISH('nomad_pouf',.9,0,1.2,0);FURNISH('nomad_floor_lantern',-1.6,0,1.4,0);
  FURNISH_HANG('nomad_hanging_lantern',0,H(0,0)-.25,0,0);FURNISH('nomad_incense_burner',1.6,0,-1.3,0);}});

defBuilding({key:'tent-tuareg',name:'Leather tent',seed:4207,cut:true,w:8.6,d:7.4,h:2.4,budget:60000,
 tags:{types:['dwelling-single'],wealth:'middle',style:'ehan'},
 note:'a low leather tent (ehan): ochre goatskins sewn edge to edge over carved arches, woven mat walls with dark leather bands, open to the front',
 build(o){const H=dkTuareg({w:5.4,d:4.2,h:2.0,eave:1.2,col:P('ochre')});
  FURNISH('nomad_kilim',0,.03,-.2,0,{v:0});
  tkMajlis(-1.6,-1.7,1.6,-1.7,undefined,0);
  FURNISH('nomad_bedding_stack',-2.3,0,-.6,PI/2);FURNISH('nomad_saddle_bags',2.3,0,-.4,-PI/2);
  tkTea(.4,.5,PI);FURNISH('nomad_oil_lamp',-1.2,0,.5,0);
  FURNISH('nomad_ground_loom',-.4,0,3.4,0,{setting:'outdoor'});FURNISH('nomad_water_skins',2.6,0,2.8,0,{setting:'outdoor'});}});
