// ================================================================= EXAMPLE — the embodiment: draws SIM, decides nothing
// The frame loop steps the clock with the real seconds; SIM.step() runs once per world minute that passed, and every
// actor is drawn at SIM.pose(actor, t), a pure function of motion time. A filled dot is out in the open, a ring is
// indoors (hidden); riders are diamonds. Space holds or runs time, [ and ] halve and double its speed.
// ?hold starts held, ?hour=8 at 8:00, ?seed=2 another decision stream, ?test leaves time to _example.run (check.py).
const CV=document.getElementById('cv'),G2=CV.getContext('2d'),HUD=document.getElementById('hud');
const ROLE_COL={farmer:'#8fc46a',artisan:'#e0a24a',trader:'#5fb3e6',child:'#e57ab0',rider:'#ff6b4a'};
let LAST=SIM.minute();
function advance(){while(LAST<SIM.minute()){LAST++;SIM.step();}}   // once per world minute, never twice
function frame(){const W=CV.clientWidth,H=CV.clientHeight,d=window.devicePixelRatio||1;
 if(CV.width!==Math.round(W*d)||CV.height!==Math.round(H*d)){CV.width=Math.round(W*d);CV.height=Math.round(H*d);}
 const s=Math.min(W/300,(H-150)/190),ox=W/2-80*s,oz=(H+90)/2-60*s,X=x=>ox+x*s,Z=z=>oz+z*s;
 G2.setTransform(d,0,0,d,0,0);G2.fillStyle='#14161a';G2.fillRect(0,0,W,H);
 G2.strokeStyle='#2c3138';G2.lineWidth=Math.max(2,s*3);G2.lineCap='round';
 for(const e of EDGES){const A=NODES.find(n=>n.id===e.a),B=NODES.find(n=>n.id===e.b);G2.beginPath();G2.moveTo(X(A.x),Z(A.z));G2.lineTo(X(B.x),Z(B.z));G2.stroke();}
 G2.font='11px ui-monospace,Consolas,monospace';G2.textAlign='center';
 for(const P of SIM.all('place')){const r=Math.max(5,(P.r||4)*s);G2.strokeStyle='#4a525c';G2.lineWidth=1;G2.strokeRect(X(P.x)-r,Z(P.z)-r,2*r,2*r);
  G2.fillStyle='#7c8490';G2.fillText(P.id.replace('_',' '),X(P.x),Z(P.z)-r-4);}
 for(const Pt of SIM.all('port')){G2.fillStyle='#7c8490';G2.fillText(Pt.id+' road',X(Pt.x),Z(Pt.z)+16);}
 const t=SIM.time();
 for(const a of SIM.all('actor')){if(!a.present)continue;const p=SIM.pose(a,t),c=ROLE_COL[a.role]||'#d8dce2',x=X(p.x),z=Z(p.z);
  G2.fillStyle=c;G2.strokeStyle=c;G2.lineWidth=1.5;G2.beginPath();
  if(a.role==='rider'){G2.moveTo(x,z-5);G2.lineTo(x+5,z);G2.lineTo(x,z+5);G2.lineTo(x-5,z);G2.closePath();G2.fill();}
  else{G2.arc(x,z,4,0,Math.PI*2);p.hidden?G2.stroke():G2.fill();}}
 const c=SIM.census(t),hm=Math.floor(CLOCK.hour)+':'+String(Math.floor(CLOCK.hour%1*60)).padStart(2,'0');
 const ev=SIM.LOG.filter(e=>e.kind==='event'||e.kind==='arrived'||e.kind==='left').slice(-3).map(e=>'  '+e.kind+' '+(e.group||'')+' '+(e.place||e.port||e.to||''));
 HUD.textContent='SIM example: 20 townsfolk on core/simulation alone.   day '+CLOCK.day+'  '+hm+'  '+(CLOCK.running?'running x'+CLOCK.scale:'held')+'   (space: run/hold, [ ]: speed)\n'+
  Object.keys(c.byActivity).sort().map(k=>k+' '+c.byActivity[k]).join('  ')+'   moving '+c.moving+', indoors '+c.hidden+', groups '+c.groups+'\n'+
  'farmer green, artisan amber, trader blue, child pink, rider (diamond) red\n'+ev.join('\n');}
let PREV=performance.now();
function loop(now){if(!Q.has('test'))CLOCK.step((now-PREV)/1000);PREV=now;   // ?test: only _example.run moves time
 advance();frame();requestAnimationFrame(loop);}
addEventListener('keydown',e=>{if(e.key===' '){CLOCK.run();e.preventDefault();}if(e.key==='[')CLOCK.scale/=2;if(e.key===']')CLOCK.scale*=2;});
requestAnimationFrame(loop);
