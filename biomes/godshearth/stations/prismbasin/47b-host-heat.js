// ================================================================= HOST — Godshearth's heat between the vents (core/terrain 47, KTHERM; PLAN.md sections 2, 4)
// The floor's soil at the station's mean (+7 degC, the owner's climate) and one VENT LINE across it, 500 m inland of the geyser field: a crack in the
// caldera's floor over the sill (the draft's "shallow lateral sill of the Godthrone plume"), its fumaroles at 92 degC, the ground's heat falling to the soil's
// within 100 m. Baked once on a 4 m lattice over the line's box; the ground's paint (44s), the hearth grove (87), the hazards and the steam all read the
// one bake, so they cannot disagree. The geyser field's own heat is the geyser kit's (GEYSER.at): its springs' and geysers' ramps, not KTHERM's.
// The vents are the model's records (scale model 5.1 edit 2, tools/scale-model/edit_512.py: GH_MODEL, 44r): the shore vent line (T 92 degC, reach 100 m:
// 170 m drew ~4,500 hearth trees, 9.4 M triangles) and the lake's shore vents in its bed 400 m out (80 degC, 250 m), which warm the water (89w).
const GH_SOIL=STATION_SITE.amb;
const GH_VENTS=[{id:'godshearth-line',kind:'line',pts:GH_VLINE,T:GH_LINE_V.T,reach:GH_LINE_V.reach,decay:2.4,name:'The vent line (a crack in the caldera floor; fumaroles at '+GH_LINE_V.T+' degC)'},
 {id:'godshearth-lake-shore',kind:'point',x:GH_SHORE_V.x,z:GH_SHORE_V.z,T:GH_SHORE_V.T,reach:GH_SHORE_V.reach,decay:2.6,name:'The hot lake\'s shore vents (in its bed, '+GH_SHORE_V.T+' degC)'}];
const THERM=KTHERM.create({soil:GH_SOIL,vents:GH_VENTS,detail:{amp:1.5,scale:.02,seed:8121},world:'godshearth-prismbasin'});
const THERM_BOX=(function(){const P=GH_VLINE.concat([[GH_SHORE_V.x,GH_SHORE_V.z]]),xs=P.map(p=>p[0]),zs=P.map(p=>p[1]),m=Math.max(200,GH_SHORE_V.reach+20);return[Math.min(...xs)-m,Math.min(...zs)-m,Math.max(...xs)+m,Math.max(...zs)+m];})();
const THERM_F=THERM.bake({box:THERM_BOX,cell:4});
const GH_HEAT=(x,z)=>x>THERM_BOX[0]&&x<THERM_BOX[2]&&z>THERM_BOX[1]&&z<THERM_BOX[3]?KTHERM.fieldAt(THERM_F,x,z):GH_SOIL;
// the fumaroles along the line (steam at 89x, heat hazards here): one every 90 m or so, each nudged off the line by its own hash
const GH_FUM=(function(){const out=[];let k=0;for(let i=0;i<GH_VLINE.length-1;i++){const a=GH_VLINE[i],b=GH_VLINE[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(L/90));
 for(let j=0;j<n;j++,k++){const t=(j+.5)/n,u=KRAND.unit(KRAND.hash(8122,k,1))-.5,nx=-(b[1]-a[1])/L,nz=(b[0]-a[0])/L;out.push({x:a[0]+(b[0]-a[0])*t+nx*u*14,z:a[1]+(b[1]-a[1])*t+nz*u*14});}}return out;})();
GH_FUM.forEach((f,i)=>REGISTER({name:'A fumarole on the vent line (92 degC; the ground over 25 degC is the hearth trees\')',x:f.x,z:f.z,y:landH(f.x,f.z)-2,r:9,h:6,
 tags:{hazard:{kind:'heat',danger:.55,falloff:'linear',shape:{type:'cyl',r:7,h:4},radiant:{reach:4}}}}));
