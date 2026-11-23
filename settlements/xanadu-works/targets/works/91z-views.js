// TARGET: works — camera presets [camX,camY,camZ, targetX,targetY,targetZ] (no apostrophe or colon in a name:
// tools/check_views.py), and the sheet's budget (every type in the class 'city', as Kirstabal's and Phēr's)
const xwSite=id=>{const c=XW_PLAN&&XW_PLAN.camps.find(q=>q.id===id);return c&&c.site?c.site:{x:0,z:0};};
const xwOf=(camp,key)=>XW_PLACE.find(p=>p.camp===camp&&p.key===key);
const VIEWS=(function(){const V={};
 V['Overview']=[0,1500,2300,0,0,-100];
 V['Kold-Lod from above']=[-900,900,1300,-900,0,0];
 {const s=xwSite('kold-lod.adit');V['The adit camp']=[s.x+260,120,s.z+260,s.x,4,s.z];}
 {const s=xwSite('kold-lod.mill');V['The mill camp']=[s.x+260,120,s.z-260,s.x,4,s.z];}
 {const p=xwOf('kold-lod.mill','xa_stamp_mill');if(p)V['A stamp mill']=[p.x+Math.sin(p.ry)*34+12,10,p.z+Math.cos(p.ry)*34+12,p.x,4,p.z];}
 {const p=xwOf('kold-lod.adit','xa_mine_head');if(p)V['A mine head on the lode']=[p.x+Math.sin(p.ry)*30,8,p.z+Math.cos(p.ry)*30,p.x,4,p.z];}
 {const s=xwSite('opal.diggings');V['The diggings']=[s.x-260,120,s.z+260,s.x,4,s.z];}
 {const p=xwOf('opal.diggings','xa_sorting_shed');if(p)V['A sorting shed']=[p.x+Math.sin(p.ry)*26,6,p.z+Math.cos(p.ry)*26,p.x,2,p.z];}
 {const p=XW_PLACE.find(q=>q.kit==='glazier');if(p)V['The Glaziers houses']=[p.x+Math.sin(p.ry)*28,6,p.z+Math.cos(p.ry)*28,p.x,4,p.z];}
 {const s=xwSite('opal.landing');V['The factors landing']=[s.x+220,60,s.z+560,s.x,2,s.z+200];}
 V['From the lake']=[900,14,1400,900,6,700];
 return V;})();
BUDGET.showcase={tris:30000000,calls:3000};BUDGET.cls.city=30000000;for(const k in TSTAT.by)BUDGET.type[k.split('/')[0]]='city';
