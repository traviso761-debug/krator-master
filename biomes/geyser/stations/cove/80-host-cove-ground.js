// ================================================================= HOST — the cove's ground paint (station 7; 84 reads STATION_GROUND.paint and .layers)
// After the kit's paint (84: the thermal record, the meadow, the litter), per vertex:
//   THE BEACH by height at the water, not by the shore line (the crescent's horns stand out past the bay's north arc, which 84's shoreZ reads): black
//   sand and the sea's floor under the water, none on the horns
//   THE ROCK where the ground is steep, coloured by its bed (KSTRATA, 45: STRATA, the carbonate shelf's cream bioclastic and oolite, the marl, the visors
//   and the terra rossa partings; under the sea the tibasalt sill); within the dike's rib its own tibasalt column (black flows, rubble, the orange and
//   black bead horizons), and the limestone either side of the fault trace bleached and veined with ochre (the fluids' alteration)
// The layers are the showcase's ten (KGROUND, in the same order) with the rock's tint carrying the vertex colour, so the beds' colours show through the
// library's rock: without it a layer's tint is its own and the paint's colour drowns under it.
(function(){const SG=STATION_GROUND,_sc=new THREE.Color(),BLEACH=new THREE.Color(0xece6d6),OCHRE=new THREE.Color(0xc89640),SULPH=new THREE.Color(0xd6c23a),_o={};
 SG.paint=(x,z,y,g,c,GA,slope)=>{const q=dikeAt(x,z),on=q.t>-.02&&q.t<1.02,dk=on?smooth(DIKE.w*1.1,DIKE.w*.45,q.d):0;
  const fl=Math.max(basinK(x,z),stairK(x,z)),n=fbm(x*.02,z*.02,4701,2)-.5,n2=fbm(x*.004,z*.004,4702,2);
  const sand=y<-.4?1:smooth(2.4,.6,y)*(1-smooth(.25,.6,g.sinter))*(1-smooth(.5,.75,slope))*(1-dk);
  const rock=Math.max(smooth(.55,.8,slope)*(1-sand),dk*.95);
  const meadow=smooth(.3,.6,fl)*(1-g.sinter)*(1-g.acid)*(1-g.dead)*(1-g.terr)*(1-sand)*(1-dk);
  c.copy(PAINT.LITTER).lerp(PAINT.LITTER2,clamp(.5+n*1.6,0,1));
  if(meadow>0)c.lerp(PAINT.MEADOW,meadow*(.7+.3*n2));
  if(rock>0&&STRATA){const S=(dk>.3?DIKE_ROCK:STRATA).at(x,y,z,_o);_sc.setRGB(S.colour[0],S.colour[1],S.colour[2]);
   if(dk<=.3&&on){const fb=smooth(40,7,q.d)*(1-dk),v=fbm(x*.35+y*.8,z*.35-y*.3,8831,2);_sc.lerp(BLEACH,fb*.55);if(v>.6)_sc.lerp(OCHRE,clamp((v-.6)*4,0,1)*fb*.8);}
   c.lerp(_sc,rock*.92);}
  if(sand>0)c.lerp(y<-.5?PAINT.SEABED:PAINT.SAND,sand);
  if(g.dead>0)c.lerp(PAINT.DEAD,g.dead*.6);
  if(g.acid>0){_sc.copy(PAINT.CLAY).lerp(PAINT.OCHRE,smooth(-.1,.25,n+(n2-.5)*.6));c.lerp(_sc,g.acid*.9);}
  /* native sulphur crusting the dike's crest where its fumaroles breathe */
  if(dk>0&&g.vent>.05)c.lerp(SULPH,dk*smooth(.05,.4,g.vent)*.7);
  GA.r=c.r;GA.g=c.g;GA.b=c.b;GA.rock=rock;GA.sinter=g.sinter*(1-sand)*(1-dk);GA.sand=sand;GA.grass=meadow*(1-rock);};
 SG.layers=[['litter','0.65'],['grass','grass*0.9','mix(vec3(1.0),base*3.0,0.3)'],['moss','grass*smoothstep(0.03,0.09,heat)*(1.0-smoothstep(0.2,0.32,heat))*0.8'],
  ['rock','rock','mix(vec3(1.0),base*2.6,0.85)','the beds (KSTRATA)'],['sand','sand','mix(vec3(1.0),base*4.0,0.25)'],['sinter','dead*0.7','vec3(0.78,0.76,0.72)','dead sinter'],
  ['sinter','sin_','mix(vec3(0.74,0.72,0.68),vec3(1.0,0.98,0.94),_sk)'],['tufa','terr','vec3(1.04,1.02,0.98)'],['clay','acid*0.9','mix(vec3(1.0),base*1.4,0.6)'],['mud','mud*0.95']];})();
