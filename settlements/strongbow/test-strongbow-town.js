// node settlements/strongbow/test-strongbow-town.js — Strongbow today's layout (src/30-sb-layout.js) against its rules
// (src/31-sb-rules.js): every rule on the layout, and on a copy broken in that one way (each must fail), and AREAS.md current.
const fs=require('fs'),path=require('path');
const M=require('./layout_dump.js'),LAY=M.L,RULES=M.SB;
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const res=RULES.checks(LAY);for(const c of res)ok(c.pass,c.name+(c.pass?'':' :: '+c.detail));
const clone=()=>JSON.parse(JSON.stringify(LAY)),part=(L,id)=>L.parts.find(p=>p.id===id),way=(L,id)=>L.ways.find(w=>w.id===id);
const fail=(name,f)=>{const L=clone();f(L);const c=RULES.checks(L).find(q=>q.name===name);ok(c&&!c.pass,'negative: '+name);};
const N=res.map(c=>c.name);
fail(N[0],L=>{L.parts[3].id=L.parts[2].id;});
fail(N[1],L=>{part(L,'sb.T2').state='ruined';});
fail(N[2],L=>{L.ways[0].b='sb.nowhere';});
fail(N[3],L=>{const s=part(L,'sb.plaza.shrine');s.shape=['circ',0,0,12];});
fail(N[4],L=>{const g=part(L,'sb.foot.e.guild'),st=part(L,'sb.foot.e.stores');g.shape=st.shape.slice();});
fail(N[5],L=>{const t=part(L,'sb.T4');t.by='xanadu';t.state='reclaimed';});
fail(N[6],L=>{way(L,'way.sb.foot.back.store~sb.foot.back.homes').open=false;});
fail(N[7],L=>{way(L,'W3').open=false;});
fail(N[8],L=>{way(L,'wall.nock').open=true;});
fail(N[9],L=>{way(L,'way.sb.T3~sb.sp.3.1').open=true;});
fail(N[10],L=>{L.ways.push({id:'x.cut',kind:'stair',a:'sb.sp.2.0',b:'sb.sp.1.0',open:true,by:'outcasts'});});
fail(N[11],L=>{way(L,'W1').y1+=50;});
fail(N[12],L=>{const w=way(L,'W4');w.frame=[L.stays.find(s=>s.id.indexOf('anc.w.0')>0).b[0],w.frame[1]];});
fail(N[13],L=>{part(L,'sb.sp.6.0').people+=100;});
fail(N[14],L=>{part(L,'sb.sp.4.0').people=10;part(L,'sb.sp.6.0').people-=10;});
// AREAS.md is written by strongbow_blueprint.py from SB.area: its total row must match the layout
const A=RULES.area(LAY),md=fs.existsSync(path.join(__dirname,'AREAS.md'))?fs.readFileSync(path.join(__dirname,'AREAS.md'),'utf8'):'';
const m=md.match(/\| \*\*Total\*\* \|[^\n]*?\*\*([\d,]+)\*\* m2[^\n]*?\*\*([\d,]+)\*\* \|/);
ok(m&&+m[1].replace(/,/g,'')===Math.round(A.floor)&&+m[2].replace(/,/g,'')===A.people,'AREAS.md is current ('+Math.round(A.floor).toLocaleString('en-US')+' m2, '+A.people+' people; rerun strongbow_blueprint.py)');
console.log(fails?fails+' FAILED':'all passed');process.exitCode=fails?1:0;
