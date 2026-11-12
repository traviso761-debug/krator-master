// ================================================================= HOST — the heat (core/terrain 47, KTHERM; PLAN.md sections 3 and 9)
// The solfatara's vent and its mud pots as KTHERM point vents over the soil (the site's mean), baked once on an 8 m lattice over the ground's square:
// the one temperature field the ground's sulphur (84), the steam fans and the plants' ARCH.lifeAt (60) and the hazards read, so they cannot disagree.
// The springs are warm (the type II water ~33-45 degC at the boil), not hot: a small vent each so the steam fans can find them.
const VENTS=(function(){const S=SITE,V=[];if(S.solfatara){V.push({x:S.solfatara.x,z:S.solfatara.z,T:S.solfatara.T,reach:S.solfatara.reach,decay:2.2});
 S.solfatara.pots.forEach(p=>V.push({x:p[0],z:p[1],T:92,reach:p[2]*5,decay:2}));}(S.springs||[]).forEach(sp=>V.push({x:sp.x,z:sp.z,T:44,reach:sp.r*3,decay:2.4}));return V;})();
const THERM=KTHERM.create({soil:SITE.soil,vents:VENTS.map((v,i)=>({id:SKEY+'-vent'+i,kind:'point',x:v.x,z:v.z,T:v.T,reach:v.reach,decay:v.decay})),
 detail:{amp:1.2,scale:.02,seed:7300},world:'arch-'+SKEY});
const THERM_BOX=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1],THERM_F=THERM.bake({box:THERM_BOX,cell:8});
HEAT_AT=(x,z)=>KTHERM.fieldAt(THERM_F,x,z);
// THE HAZARDS as records (core/hazard: KHAZ reads the tags): the solfatara's hot ground and its gas, the alkaline pools, the acid stream
if(SITE.solfatara){const S=SITE,V=S.solfatara;
 REGISTER({name:'The solfatara (acid ground, mud pots at 90+ degC, H2S in still air)',x:V.x,z:V.z,y:terrainH(V.x,V.z)-6,r:V.reach*.6,h:30,
  tags:{hazard:{kind:'heat',danger:.6,falloff:'linear',shape:{type:'cyl',r:V.reach*.3,h:6},radiant:{reach:10,dose:.4}}}});
 V.pots.forEach((p,i)=>REGISTER({name:'A mud pot (boiling acid mud, pH ~2) and its steaming ring',x:p[0],z:p[1],y:terrainH(p[0],p[1])-3,r:p[2]+16,h:8,tags:{hazard:{kind:'heat',danger:.9,shape:{type:'cyl',r:p[2],h:3}}}}));
}
(SITE.springs||[]).forEach(sp=>REGISTER({name:'A type II spring (pH ~11.5, hydrogen: an alkali burn on long contact)',x:sp.x,z:sp.z,y:terrainH(sp.x,sp.z)-3,r:sp.r+2,h:6,tags:{hazard:{kind:'acid',danger:.35}}}));
if(SITE.shear){const q=L.SH,m=[(q.A[0]+q.B[0])/2,(q.A[1]+q.B[1])/2];REGISTER({name:'A chrysotile shear zone (asbestos: its dust in the dry season, when disturbed)',x:m[0],z:m[1],y:terrainH(m[0],m[1])-30,r:q.L/2,h:80,
 tags:{hazard:{kind:'poison',danger:.3}}});}
