// ================================================================= HOST — the plume (every station: PLAN.md section 1, "The plume"; core amendment 3)
// The five vents breathe one plume to the south-east (135 deg): ATMOS.ashPlume (core/atmos fx, read in place from its branch: build.py) on the model's
// vents (vents.json: each summit, its column 2.5 km over its crater, Mons and the Copper-Fissure Vent strongest), so the page's ash fall, the ground's
// ash, the far sprites over a vent in reach and the hazards read one plume:
//   THE ASH FALL   P.deposit on the ground (aAshfall, 84: the paint greyed where the ash lies; ?ashfall=0 none) and as the flora's field (FIELD.ashfall)
//   THE SPRITES    a vent within 14 km (Mons' own crater) draws its column and its drift as KFAR's sprites (P.sources): the farther vents are 89's sky
//   THE HAZARD     'ash' (P.provide: mg/m3 where the plume is) and the rain's pH under it (KHAZ.provide 'ph': the plume's sulphate)
const PLUME=(function(){if(!ATMOS.ashPlume||!MODEL.vents.length)return null;
 const RATE={'Firebliss Mons':1,'Copper-Fissure Vent':.9,'Mount Pyre':.7,'Cinder-Crown':.6,'Brimstone Spire':.7};
 const P=ATMOS.ashPlume({vents:MODEL.vents.map((v,i)=>({id:'vent:'+i,x:v.at[0],z:v.at[1],y:dv(v.floor,dv(v.peak,5500)-500),top:2500,rate:dv(RATE[v.name],.6)})),
  azimuth:135*Math.PI/180,speed:10,spread:.09,reach:60000,settle:1,lean:.4,ground:(x,z)=>land0(x,z),world:4501});
 const out={P,sprites:null};
 // the ground's ash fall (the paint) and the flora's
 if(GQ.get('ashfall')!=='0')GROUND_MESHES.forEach(m=>{const a=m.geometry.attributes.aAshfall,p=m.geometry.attributes.position;for(let i=0;i<p.count;i++)a.setX(i,clamp(P.deposit(p.getX(i),p.getZ(i))*1.4,0,1)*(1-FC.at(FC.a.snow,p.getX(i),p.getZ(i))*.5));a.needsUpdate=true;});
 FIELD.ashfall=(x,z)=>P.deposit(x,z);
 // the sprites of a vent in reach (the camera's far plane is 16 km)
 if(typeof KFAR!=='undefined'&&KFAR.sprites&&KFAR.spriteMesh){const src=P.sources({count:14,n:8,alpha:.5,upTo:.25}).filter(s=>Math.hypot(s.x,s.z)<13000);
  if(src.length){try{const S=KFAR.sprites({world:4502,sources:src,range:[0,15500],kind:'steam'}),m=KFAR.spriteMesh(S,{k:{value:1},name:'plume',label:'The plume (ash and steam drifting south-east)',color:[.78,.76,.74]});
   m.userData.inspectLabel='The plume (ash and steam drifting south-east from the vents)';scene.add(m);out.sprites={count:S.count,mesh:m};}catch(e){reportErr('plume sprites: '+e.stack);}}}
 if(typeof KHAZ!=='undefined'){try{P.provide(KHAZ,{mg:120,weather:()=>1});KHAZ.provide('ph',(x,y,z,t)=>5.6-2.4*P.under(x,z));}catch(e){reportErr('plume hazard: '+e.stack);}}
 return out;})();
window._plume=PLUME?{sprites:PLUME.sprites?PLUME.sprites.count:0,here:+PLUME.P.under(0,0).toFixed(3),deposit:+PLUME.P.deposit(0,0).toFixed(3)}:null;
