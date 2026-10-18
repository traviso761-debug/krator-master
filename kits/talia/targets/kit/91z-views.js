// TARGET: kit — the Talia sheet's preset views: each row from the front and above, each mixed street at eye level, and
// each Talia building at eye level from its front. All found from the sites the rows laid (never from an index).
const TAL_EYE=(S,dist,dx)=>[S.x+(dx||0),1.7,S.z+dist,S.x,3.2,S.z];
const VIEWS={};
{const zs=ROWZ.slice();VIEWS['Opening']=[-40,22,zs[0]+44,0,5,zs[0]];
 VIEWS['Overview']=[-160,110,zs[zs.length-1]+100,0,4,(zs[0]+zs[zs.length-1])/2];
 ROWNAME.forEach((n,i)=>{const row=SITES.filter(s=>s.row===n),half=Math.max(...row.map(s=>Math.abs(s.x)+VERN.defs[s.key].w/2)),tall=Math.max(...row.map(s=>VERN.defs[s.key].h));
  VIEWS[n]=[0,Math.max(26,half*.85,tall*.9),zs[i]+half*.95+16,0,Math.min(tall*.3,12),zs[i]-4];
  if(n.startsWith('Mixed'))VIEWS[n+' — eye level']=[-half*.35,1.7,zs[i]+24,0,4,zs[i]];});
 for(const S of SITES){if(S.row.startsWith('Mixed'))continue;const D=VERN.defs[S.key];
  VIEWS[D.name+' — eye level']=TAL_EYE(S,Math.max(D.w,D.d)*.85+6,D.w*.22);}}
