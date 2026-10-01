// Presets: the overview, then per type a day hero of each decay, a night shot
// of the reclaimed one (its fires only show at night) and close shots at eye
// level, intact and reclaimed. ALT_FRAME per type: [hero target height, camera
// distance, close-up [dx,y,dz,tx,ty,tz] relative to the site].
const ALT_FRAME={altBole:[170,760,[70,4,150,0,40,0]],altStack:[180,700,[40,3,110,0,40,0]],altHotel:[100,520,[30,3,110,0,25,0]],
 altFlat:[70,420,[110,3,40,40,20,0]],altPerch:[90,700,[-20,4,140,0,60,0]],altCult:[40,520,[20,3,135,0,25,0]]};
const VIEWS=(function(){const V={};
 const zs=Object.values(ROWS).map(R=>R.z),z0=Math.min(...zs),z1=Math.max(...zs);
 V['The rows']=[1900,1500,(z0+z1)/2+300,300,60,(z0+z1)/2];
 for(const k in ROWS){const R=ROWS[k],F=ALT_FRAME[k],n=ALT_NAME[k].replace(/ \(.*/,''),ty=F[0],D=F[1],c=F[2];
  const hero=(x,ni)=>[x-D*.35,ty*.9+D*.12,R.z+D,x,ty,R.z].concat(ni?[1]:[]);
  V[n]=hero(-R.s);
  V[n+' ruined']=hero(R.s);
  V[n+' reclaimed']=hero(R.t);
  V[n+' rehabilitated']=hero(0);
  V[n+' by night']=hero(R.t,1);
  V[n+' close']=[-R.s+c[0],c[1],R.z+c[2],-R.s+c[3],c[4],R.z+c[5]];
  V[n+' reclaimed close']=[R.t+c[0],c[1],R.z+c[2],R.t+c[3],c[4],R.z+c[5]];}
 return V;})();
