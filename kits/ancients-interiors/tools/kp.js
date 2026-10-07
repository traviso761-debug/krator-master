/* node harness: a type's plan at decays 0, 1, 3 (no catalog). argv: type */
const fs=require('fs'),path=require('path'),K=path.join(__dirname,'..','src')+'/';
const files=fs.readdirSync(K).filter(f=>/^\d/.test(f)&&f.endsWith('.js')&&f<'50').sort();
eval(files.map(f=>fs.readFileSync(K+f,'utf8')).join('\n')+';global.AI=KratorAncientsInteriors;');
for(const d of [0,1,3]){const P=AI.kitPlan(process.argv[2]||'police',d,{place:'7'});
 for(const B of P.buildings)for(const st of B.storeys){const rs=st.rooms.filter(r=>r.poly),k={};rs.forEach(r=>k[r.kind]=(k[r.kind]||0)+1);
  const area=rs.filter(r=>r.kind!=='corridor').map(r=>AI.polyArea(r.poly));
  console.log(P.state,B.id,st.id,'y',st.y,'h',st.h,'rooms',rs.length,JSON.stringify(k),'area',area.length?Math.min(...area).toFixed(1)+'-'+Math.max(...area).toFixed(1):'-','walls',st.walls.length,'broken',st.walls.filter(w=>w.broken).length,'open',rs.filter(r=>r.open).length,
   'audit',AI.storeyAudit(st,B.inside?(x,z)=>B.inside(x,z,st.y):null).join('; ').slice(0,300)||'ok');}}
