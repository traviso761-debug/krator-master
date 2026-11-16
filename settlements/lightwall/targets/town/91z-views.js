// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the town's budget
const lwEye=(x,z,tx,tz,dy)=>[x,terrainH(x,z)+1.7+lwD(dy,0),z,tx,terrainH(tx,tz)+4,tz];
const VIEWS=(function(){const V={};const Wz=LW.WALL,Y=LW.Y0;
 V['Overview']=[520,420,LW.SHORE+620,0,60,-120];
 V['From the lake']=[60,LW.LAKE+4,LW.SHORE+360,0,Y+10,Wz];
 V['The Stair Foot']=lwEye(10,LW_PLAZA.z1+30,0,Wz+4,0);
 V['The wall at dusk']=[-140,Y+26,Wz+120,0,Y+18,Wz];
 V['The tea hall and the Register']=[6,Y+LW.BAND_H+8,Wz-LW.BAND_SET+24,4,Y+LW.BAND_H+5,Wz-LW.BAND_SET];
 V['A ledge of the wall']=[-120,Y+2*LW.BAND_H+1.7,Wz-2*LW.BAND_SET+3,-200,Y+2*LW.BAND_H+3,Wz-2*LW.BAND_SET+1];
 V['The bazaar avenue']=lwEye(-4,300,0,LW_PLAZA.z1,0);
 V['The quays']=[140,LW.LAKE+8,LW.SHORE+60,0,LW.LAKE+2,LW.SHORE+20];
 V['A terrace street']=lwEye(-120,LW_ROWS[2]+3,-300,LW_ROWS[2]+3,0);
 V['The caravanserai']=lwEye(-860,360,-940,330,2);
 V['The Iridescent Order on its spur']=lwEye(842,100,930,150,6);
 V['The carved quarter (cut-away)']=[0,Y+70,Wz+60,0,Y+12,Wz-12];
 V['Podiums and steps on the slope']=lwEye(-1,-98,-1,-200,0);
 V['The gardens of the bench']=[-160,70,-20,-120,10,-110];
 /* inside a Glazier hearth room: the carved household front on the second band nearest the main stair, from its doorway */
 const hf=LW_CARVED.filter(s=>s.key==='gz-front'&&s.band===1).sort((a,b)=>Math.abs(a.x)-Math.abs(b.x))[0];
 if(hf){const H=TG.gz.plan('gz-front',{v:hf.v}).H;V['Inside a Glazier hearth room']=[hf.x+H.x,hf.y+1.5,hf.z-1.2,hf.x+H.x,hf.y+1.1,hf.z+H.z-H.d/2];}
 return V;})();
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
