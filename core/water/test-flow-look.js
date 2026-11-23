// node core/water/test-flow-look.js — two things that drew a flow's water in blocks (2026-11-16). (1) The slope its ribbon shades by: W.flow's slopeV, the fall over
// PRESETS.flow.slopeWin m (24) round each point. A line sampled every 8 m off a rough bed (the small streams, core/world 83s)
// had each point's slope to the next one jump in and out of the rapids band, and the shader's thresholds, read per vertex,
// drew the foam in hard-edged bands and triangles row by row. (2) The breakup noise the foam is cut from: value noise flattens along its lattice lines,
// so the foam's threshold on it cut straight edges along the cells (squares, Ls, diamonds); drawFlow's wtrBreak (twin WATER.breakNoise) is gradient
// noise in two octaves, the second turned. Each check has a negative.
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..','..');
global.window=global;
eval(['core/atmos/89-atmos-0-core.js','core/atmos/89-atmos-0p-presets.js','core/atmos/89-atmos-a-waves.js','core/water/20-core-water.js','core/water/22-core-water-flow.js']
 .map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';global.WATER=WATER;');
const W=WATER;
let bad=0;const ok=(name,pass,neg)=>{const r=!!pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const RP=W.PRESETS.flow.rapids,band=s=>s>RP[0];
// a 3 % stream, a point every 8 m, each point 0.35 m up or down (the bed's fine noise under it)
const bumpy=[];for(let i=0;i<=60;i++)bumpy.push([i*8,0,100-.03*i*8+(i%2?.35:-.35)]);
const F=W.flow({name:'bumpy',pts:bumpy,width:4}),F0=W.flow({name:'bumpy raw',pts:bumpy,width:4,slopeWin:0});
const flips=(P,k)=>{let n=0;for(let i=1;i<P.length-1;i++)if(band(P[i][k])!==band(P[i-1][k]))n++;return n;};
const inner=P=>P.slice(2,-2);
const spread=(P,k)=>{const v=inner(P).map(p=>p[k]);return Math.max(...v)-Math.min(...v);};
ok('a bumpy 3 % line: the shading slope stays near 3 % (spread '+spread(F.pts,'slopeV').toFixed(3)+'), where each point\'s own slope swings '+spread(F.pts,'slope').toFixed(3),
 spread(F.pts,'slopeV')<.012&&inner(F.pts).every(p=>Math.abs(p.slopeV-.03)<.008),false);
ok('the rapids band\'s edge is crossed '+flips(inner(F.pts),'slopeV')+' times down the line (its ends aside) by the shading slope, '+flips(inner(F0.pts),'slopeV')+' with the window off (slopeWin 0)',
 flips(inner(F.pts),'slopeV')===0,flips(inner(F0.pts),'slopeV')<20);
ok('the window off reproduces the point\'s own slope',F0.pts.every(p=>p.slopeV===p.slope),false);
// the ribbon carries it
const R=W.ribbon(F,{step:8,across:4,margin:1}),Rs=R.slope.slice(5*5,-5*5);
ok('the ribbon\'s slope attribute is the windowed one (spread '+(Math.max(...Rs)-Math.min(...Rs)).toFixed(3)+')',Math.max(...Rs)-Math.min(...Rs)<.012,false);
// a real fall still reads as one: a 20 m drop over 8 m keeps its point slope (fallsOf) and a steep shading slope there
const fall=[];for(let i=0;i<=30;i++)fall.push([i*8,0,100-.02*i*8-(i>15?20:0)]);
const Ff=W.flow({name:'fall',pts:fall,width:6});
ok('a 20 m fall: fallsOf still finds it ('+W.fallsOf(Ff,{steep:.35,minDrop:15}).length+') and the shading slope there is steep ('+Ff.pts[15].slopeV.toFixed(2)+')',
 W.fallsOf(Ff,{steep:.35,minDrop:15}).length===1&&Ff.pts[15].slopeV>RP[1],false);
// the breakup: thresholded as the foam is, the share of the edge running within 6 degrees of the lattice's axes (no preferred direction: 4 x 12 / 360,
// 13 %); the old value noise (WATER.noiseP, no repeat) is the negative
function axial(F,T){const N=400,st=.06;let e=0,ax=0;const G=[];for(let j=0;j<N;j++){const r=[];for(let i=0;i<N;i++)r.push(F(i*st+.37,j*st+.71));G.push(r);}
 for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++){const m=G[j][i]>T;if(m===(G[j][i+1]>T)&&m===(G[j+1][i]>T))continue;e++;
  const gx=G[j][i+1]-G[j][i-1],gy=G[j+1][i]-G[j-1][i],a=Math.abs(Math.atan2(gy,gx)*180/Math.PI)%90;if(a<6||a>84)ax++;}return ax/e;}
const vn=(x,y)=>W.noiseP(x,y,1e6),Bk=axial(W.breakNoise,.62),Vk=axial(vn,.62);
ok('the foam edges: '+(Bk*100).toFixed(1)+' % along the lattice axes with the breakup noise, '+(Vk*100).toFixed(1)+' % with the old value noise',Bk<.16,Vk<.2);
{let lo=9,hi=-9,s=0;for(let i=0;i<20000;i++){const v=W.breakNoise(i*.731,i*.377+.2);lo=Math.min(lo,v);hi=Math.max(hi,v);s+=v;}
 ok('the breakup lies in 0..1 about 0.5 ('+lo.toFixed(2)+' to '+hi.toFixed(2)+', mean '+(s/20000).toFixed(3)+')',lo>=0&&hi<=1&&Math.abs(s/20000-.5)<.02,false);}
console.log(bad?bad+' FAILED':'all passed');
process.exit(bad?1:0);
