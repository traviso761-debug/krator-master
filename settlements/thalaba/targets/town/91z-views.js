// TARGET: town — camera presets [camX,camY,camZ, targetX,targetY,targetZ], and the town's budgets. No apostrophe or colon in a
// view's name (tools/check_views.py, VIEW-NAME)
const tbEye=(x,z,tx,tz,dy,ty)=>[x,terrainH(x,z)+1.7+tbD(dy,0),z,tx,terrainH(tx,tz)+tbD(ty,4),tz];
const VIEWS=(function(){const V={};
 V['Overview']=[620,terrainH(620,820)+520,820,-40,terrainH(-40,-260)+10,-260];
 V['The market square']=tbEye(-48,34,40,-30,0);
 V['Up the Phere road']=tbEye(14,1100,0,0,0);
 V['Up the expedition road']=tbEye(14,-140,90,-1300,0,12);
 V['The spring line']=tbEye(-200,-520,-120,-470,2,-1);
 V['The Siteps from above']=[-500,terrainH(-500,-1900)+260,-1900,-150,terrainH(-150,-4600)+2,-4600];
 const dv=TB_PLACE.find(p=>p.key==='tb_devisers');if(dv)V['The Devisers house']=tbEye(dv.x-18,dv.z+52,dv.x,dv.z,0);
 const r=TB_PLACE.find(p=>p.kind==='house'&&p.cls==='rich');if(r)V['A street of the rich']=tbEye(r.x+Math.sin(r.ry)*10,r.z+Math.cos(r.ry)*10,r.x+Math.cos(r.ry)*40,r.z-Math.sin(r.ry)*40,0);
 const b=tbBlock(5,1);if(b)V['The Dalab mission']=tbEye(b.box[0]-20,(b.box[1]+b.box[3])/2+30,(b.box[0]+b.box[2])/2,(b.box[1]+b.box[3])/2,2);
 // north from the town's back: the riser, the mouth, Gāḍz-Phōl 20 km off under the gorge's walls
 V['Toward the gorge']=[60,terrainH(60,-700)+110,-700,300,2600,-14000];
 return V;})();
// the town as one budget (as Erewhon's 93-er-ui.js and Qiblai's): every type in the class 'city'
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
