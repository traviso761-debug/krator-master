// prefix: dc
// ================================================================= THE SHEIKH'S TENT: the clan's majlis and the sheikh's household
// No round orda and no vardo: the desert sheikh's rank is the LENGTH of his black tent (nine poles across) and the guest
// pavilion pitched beside it. A great goat-hair tent, its long front raised as the majlis where the clan meets, judges and
// takes coffee, the qata closing off the household behind; joined by a hair-cloth awning to a white caidal pavilion where
// guests are fed. Two standards with the brass horns flank the majlis. Inside: the court tier (nomad_court_*), muted:
// a great kilim, divans, the coffee hearth at the heart of the majlis, a grand hookah, lantern clusters.
// Tags: civic and dwelling-single, wealth rich.
const DC={bx:4,bw:18,bd:7.5,cx:-10.2,cs:8};
defBuilding({key:'tent-sheikh',name:"Sheikh's tent",seed:4601,cut:true,w:36,d:22,h:8.6,budget:240000,
 tags:{types:['civic','dwelling-single'],wealth:'rich',style:'beit-shaar'},
 note:"the sheikh's great goat-hair tent, nine poles across, its majlis open to the front; an awning to the white guest pavilion; standards with the brass horns",
 build(o){const bw=DC.bw,bd=DC.bd;
  // the great black tent
  let HB=null;W(DC.bx,0,0,0,()=>{HB=dkBayt({w:bw,d:bd,rows:[{z:-2.2,n:4,h:2.7},{z:0,n:5,h:3.3},{z:2.2,n:4,h:2.9}],frontH:2.5,backH:1.15,stripes:[2,6,10],frontPoles:9,qata:4.6,qataD:.9});
   tkFloor('patKilim',null,0,bw-.4,bd-.4);
   // the majlis (x < 4.6): divans round three sides, the great kilim, the coffee hearth, the grand hookah
   FURNISH('nomad_court_carpet',-2.2,.03,.3,0);FURNISH('nomad_court_carpet',-6.6,.03,.3,0,{v:1});
   tkMajlis(-8.6,-3.25,3.8,-3.25,undefined,0);for(const z of [-1.6,.6,2.6])FURNISH('nomad_court_divan',-8.5,0,z,PI/2);
   FURNISH('nomad_court_throne',-2.2,0,-2.9,0);for(const s of [-1,1])FURNISH('nomad_arm_cushion',-2.2+s*.95,0,-2.85,0);
   tkCoffee(-2.2,1.2,PI);FURNISH('nomad_hookah_grand',-4.6,0,.4,0);FURNISH('nomad_hookah',.6,0,.3,0);
   for(const x of [-6.4,1.8]){FURNISH('nomad_tray_table',x,0,-.6,0);FURNISH('nomad_tea_set',x,svfH('nomad_tray_table',0,.45),-.6,0);}
   FURNISH('nomad_incense_burner',-.6,0,-2.6,0);FURNISH('nomad_spear_rack',-8.2,0,-3.1,0);
   for(const x of [-6,-2.2,1.8])FURNISH_HANG('nomad_lantern_cluster',x,HB(x,0)-.1,0,0);
   // the household behind the qata
   FURNISH('nomad_court_bed',7.4,0,-2.4,0);FURNISH('nomad_studded_chest',5.6,0,-3.1,0,{v:1});FURNISH('nomad_studded_chest',8.4,0,-.4,-PI/2);
   FURNISH('nomad_bedding_stack',5.5,0,-1.2,PI/2);FURNISH('nomad_ground_loom',6.6,0,1.6,0);FURNISH('nomad_water_jars',8.3,0,2.6,-PI/2);
   FURNISH('nomad_mashrabiya_screen',6.0,0,.3,0);FURNISH_HANG('nomad_hanging_lantern',6.8,HB(6.8,0)-.05,0,0);});
  // the awning between the two (hair cloth on four poles)
  tkNoCut(()=>{const x0=DC.cx+DC.cs/2+.1,x1=DC.bx-bw/2-.1;psurf('hair',(u,v)=>{const x=lerp(x0,x1,u),z=-2.4+v*4.8;return [x,2.45-Math.abs(v-.5)*.5+Math.sin(PI*u)*.08,z];},6,4,P('hair'));
   for(const x of [x0+.15,x1-.15])for(const z of [-2.4,2.4])pole('wood',[x,0,z],[x,2.2,z],.06,P('woodD'),7);});
  // the guest pavilion: white caidal, lozenge bands; tray tables and cushions for the guests
  W(DC.cx,0,0,0,()=>{const H=dkCaidal({s:DC.cs,wallH:2.4,peakH:5.7,motif:'lozenge',doorW:2.4,floor:'patKilim'});
   FURNISH('nomad_court_carpet',0,.03,0,0,{v:1});
   for(const [x,z] of [[-1.6,-1.2],[1.6,-1.2],[0,1.4]]){FURNISH('nomad_tray_table',x,0,z,0);FURNISH('nomad_tea_set',x,svfH('nomad_tray_table',0,.45),z,0);
    for(let k=0;k<4;k++){const a=k*TAU/4+.4,px=x+Math.cos(a)*.95,pz=z+Math.sin(a)*.95;FURNISH(k%2?'nomad_pouf':'nomad_floor_cushion',px,0,pz,tkFace(px,pz,x,z),{v:k%3});}}
   tkMajlis(-3.4,-3.55,3.4,-3.55,undefined,0);FURNISH('nomad_date_baskets',3.3,0,1.6,-PI/2);FURNISH('nomad_brazier',-3.2,0,1.8,0);
   FURNISH_HANG('nomad_lantern_cluster',0,H(0,0)-.4,0,0);});
  // the two standards before the majlis: tall poles, the brass horns, long pennants
  tkNoCut(()=>{for(const x of [DC.bx-5.5,DC.bx+1.5]){const z=bd/2+3.2;pole('wood',[x,0,z],[x,7.6,z],.08,P('woodD'),8);W(x,0,z,0,()=>dkFinial(7.7));
   withCloth(clothFlag(2.6,.3),()=>W(x,7.1,z,PI/2,()=>psurf('flag',(u,v)=>[u*2.6,-v*(.55-u*.4),0],8,2,P('rust'))));}});
  FURNISH('nomad_hobble_post',DC.bx+8,0,bd/2+3.6,0,{setting:'outdoor'});FURNISH('nomad_tying_stone',DC.bx+10,0,bd/2+2.4,0,{setting:'outdoor'});
  FURNISH('nomad_coffee_hearth',DC.bx-2,0,bd/2+5.2,0,{setting:'outdoor'});smokeAt(DC.bx-2,.5,bd/2+5.2,{r:.3});}});
