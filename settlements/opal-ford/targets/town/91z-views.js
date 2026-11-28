// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the town's budgets. View names: no apostrophe,
// no colon (tools/check_views.py)
const ofEye=(x,z,tx,tz,dy)=>[x,ofH(x,z)+1.7+(dy||0),z,tx,ofH(tx,tz)+4,tz];
const VIEWS=(function(){const V={},c0=ofRiverX(0),T=OF.TOWN,F=OF.REACH.fall,PR=OF.PRECINCT;
 V['Overview']=[1500,ofH(1500,-950)+240,-950,420,10,160];
 V['The ford']=[c0+30,ofW(-150)+9,-150,c0-10,0,60];
 const h=OF_PLACE.find(p=>p.key==='xa_caravanserai');if(h)V['The han and the square']=[h.x-110,h.o.y+40,h.z-90,h.x+10,h.o.y+4,h.z+120];
 V['The high street']=ofEye(T.high-3,-380,T.high,120,0);
 V['From the south-west bank']=ofEye(-170,-160,500,40,4);
 V['The paddies on the flats']=[200,ofH(200,-900)+30,-1000,140,2,-300];
 V['The terraces behind the town']=[1700,ofH(1700,-700)+90,-800,1300,ofH(1300,0),0];
 {const cf=ofRiverX(F.z),x=cf+ofHW(F.z)+90,z=F.z-260;V['The fall and the precinct ground']=[x,ofH(x,z)+22,z,cf,ofW(F.z)-8,F.z];}
 {const Hh=OF.HOUSE,m=OF_PLACE.find(p=>p.key==='qb_monastery');
  if(m)V['The Iridescent house']=[m.x+150,m.o.y+70,m.z-170,m.x-60,m.o.y,m.z+40];
  /* inside the hall (the kit block's hall centred at its local z -8.3, its floor 1.8 m up, its storeys 5 and 4 m): from its door
     toward the shrine at its back (the river side); and the Gallery of the Bow at the top, toward its moonglass wall */
  if(m){const c=Math.cos(m.ry),s=Math.sin(m.ry),at=(lx,lz)=>[m.x+lx*c+lz*s,m.z-lx*s+lz*c],a=at(0,-2.2),b=at(0,-15.5),g=at(0,-4);
   V['Inside the Hall of the Bow']=[a[0],m.o.y+3.6,a[1],b[0],m.o.y+3,b[1]];V['In the Gallery of the Bow']=[g[0],m.o.y+12.6,g[1],b[0],m.o.y+12,b[1]];}
  const x=Hh.x0-120,z=Hh.z0+120;V['The Bow Terrace and the cells']=[x+250,ofH(x+250,z-60)+30,z-60,x,ofH(x,z),z+60];}
 V['Up the river from the bridge']=[c0,ofW(OF_SPAN_Z)+7,OF_SPAN_Z,c0,ofW(2400),2400];
 return V;})();
// the town as one budget (as Phēr's): every type in the class 'city'
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
