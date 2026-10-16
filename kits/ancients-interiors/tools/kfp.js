/* node harness: furnish a type's intact plan through AI.furnishPlan (the socket); argv: type [culture] */
global.THREE=require(require('path').join(__dirname,'..','..','catalog','three.min.js'));
global.document={createElement:()=>({getContext:()=>new Proxy({}, {get:()=>()=>({addColorStop(){}})}),width:0,height:0})};
const fs=require('fs'),path=require('path'),K=path.join(__dirname,'..','src')+'/',C=path.join(__dirname,'.cache')+'/';
eval(fs.readFileSync(C+'fb.js','utf8')+';\n'+fs.readFileSync(C+'ib.js','utf8')+';global.KF=KratorFurniture;global.IX=KratorInteriors;');
const files=fs.readdirSync(K).filter(f=>/^\d/.test(f)&&f.endsWith('.js')&&f<'50').sort();
eval(files.map(f=>fs.readFileSync(K+f,'utf8')).join('\n')+';global.AI=KratorAncientsInteriors;');
AI.install(IX);const cat=IX.runtimeAdapter(KF,KF.batch());
const type=process.argv[2]||'police',cul=process.argv[3];
const t0=Date.now(),P=AI.kitPlan(type,0),F=AI.furnishPlan(P,cat,cul?{culture:cul}:{});
const byK={},miss={};let fails=0;
for(const r of F.rooms){byK[r.R.kind]=(byK[r.R.kind]||0)+r.placements.length;((r.plan.report&&r.plan.report.missing)||[]).filter(m=>m.reason).forEach(m=>{const k=r.R.kind+':'+m.need;miss[k]=(miss[k]||0)+1;});}
for(const k in F.rooms.reduce((m,r)=>(m[r.template]=r,m),{})){const r=F.rooms.find(q=>q.template===k);{const a=r.recipe?AI.audit(r.recipe,F.catalog):IX.audit(r.room,r.plan,F.adapter);if(r.recipe)a.fails=a.fails.map(f=>({check:'recipe',msg:f}));if(!a.ok){fails++;if(fails<6)console.log('FAIL',r.R.kind,a.fails.slice(0,3).map(f=>f.check+': '+f.msg).join(' / '));}}}
console.log(type,'rooms',AI.planRooms(P).length,'furnished',F.rooms.length,'templates',F.templates,'pieces',F.pieces,'template audit fails',fails,Date.now()-t0+'ms');
console.log('pieces by kind',JSON.stringify(byK));console.log('missing (room-kind:need x templates)',JSON.stringify(miss));
for(const d of [0,1,3]){const p=AI.kitPlan(type,d);for(const B of p.buildings)for(const st of B.storeys){const a=AI.storeyAudit(st,B.inside?(x,z)=>B.inside(x,z,st.y):null);if(a.length)console.log('STOREY AUDIT',d,st.id,a.slice(0,3).join('; '));}}
