// TARGET: hosts — five Ancient types drawn from the start as HOSTS for the Hykkousoi of Ys (src/8ap-host-*):
// Skyscraper L the Facet, Skyscraper M the Bastion, and three mid-rise: the Arcades, the Capsule Stalks and the
// Bell Hall. One row per type along +z, in the kit's decay layout: intact x=-s, rehabilitated x=0, ruined x=+s,
// and for the two towers toppled x=t and the Project (decay 4) x=j.
// Behind each type a second row shows it AS YS HOSTS IT: ruined (x=+s) cut at a storey from its spec's `cuts`,
// reclaimed (x=0) cut at a `land` storey, each with a shrunk podium and one way-in hole cut through its skin and
// lining, through the same hooks Ys defines (mocked below exactly as settlements/ys/src/52-sky-abc.js has them).
const TITLE='Ancient hosts — five types for the Hykkousoi';
const GROUND_C=1000;
const DECAYS=[0,1,3];
// ---- the Ys hooks, as Ys defines them (the kit's own builders never call these; the 8ap-host builders do)
let YS_CUT=null;
function ysPodiumR(R){return (typeof YS_CUT!=='undefined'&&YS_CUT&&YS_CUT.podium!=null)?Math.min(R,YS_CUT.podium):R;}
function ysWallHole(hole,y0){const W=(typeof YS_CUT!=='undefined'&&YS_CUT&&YS_CUT.ways)?YS_CUT.ways:null;if(!W||!W.length)return hole;
 return (u,y)=>{if(hole&&hole(u,y))return true;const ya=y+y0;for(const w of W){let du=Math.abs(u-w.u);if(du>.5)du=1-du;if(du<w.uw&&Math.abs(ya-w.y)<w.hh)return true;}return false;};}
function ysCutY(d){return ((d===1||d===3)&&typeof YS_CUT!=='undefined'&&YS_CUT&&YS_CUT.cutY!=null)?YS_CUT.cutY:null;}
// A builder run the way ysPlaceHost runs it: the cut snapped to a storey (T.Y0 + n*pitch, the middle of the
// class's range), the podium shrunk, and one way in {a, the plate about half way up the stump, R} turned into the
// YS_CUT.ways entry exactly as 64-hyk-accrete.js turns it. The way's plate and bearing are written to HOSTS_WAY
// so the views can look at the hole.
const HOSTS_WAY={};
function hostsAsHost(key,TF,fn,o){return (scene,gx,gz,d)=>{const T=TF(),r=T.cuts[d===3?'land':o.cls];
 const cutY=T.Y0+Math.round(((r[0]+r[1])/2-T.Y0)/T.floors.pitch)*T.floors.pitch;
 let n=0;while(T.plate(n+1)<cutY-2*o.R-3)n++;const k=Math.max(T.k0||0,Math.round(n*.5)),y=T.plate(k),a=o.a,R=o.R,rs=T.rAt(y,a);
 YS_CUT={cutY,podium:o.podium,ways:[{u:((a/TAU)%1+1)%1,y:y+R*.447,uw:R*.9/(TAU*rs),hh:R*.88}]};
 HOSTS_WAY[key+'/'+d]={x:gx+rs*Math.cos(a),y:y+R*.45,z:gz+rs*Math.sin(a),a,cutY};
 try{return fn(scene,gx,gz,d);}finally{YS_CUT=null;}};}
// key, label, spec (a getter: this file loads before src/8ap-*, whose consts are not yet defined), builder, z, s, toppled x, project x, the host row's cut class, the way's bearing and radius, podium
const HOSTS_T=[
 ['skyL','Skyscraper L — the Facet',()=>HOSTSPEC_FACET,typeof buildHostFacet!=='undefined'?buildHostFacet:null,0,170,560,-400,'mid',Math.PI/2+.3,5,26],
 ['skyM','Skyscraper M — the Bastion',()=>HOSTSPEC_BASTION,typeof buildHostBastion!=='undefined'?buildHostBastion:null,700,190,600,-440,'mid',Math.PI/2+.47,5,40],
 ['midArcades','The Arcades',()=>HOSTSPEC_ARCADES,typeof buildHostArcades!=='undefined'?buildHostArcades:null,1400,120,0,0,'mid',-Math.PI/2,4,30],
 ['midStalks','The Capsule Stalks',()=>HOSTSPEC_STALKS,typeof buildHostStalks!=='undefined'?buildHostStalks:null,1750,120,0,0,'mid',Math.PI/2+.5,3.5,30],
 ['midBell','The Bell Hall',()=>HOSTSPEC_BELLHALL,typeof buildHostBellHall!=='undefined'?buildHostBellHall:null,2100,120,0,0,'mid',Math.PI*1.05,4,30]];
const ROWS={},EXTRA_BUILDERS={},HOSTS_NAME={},HOSTS_ROW={};
for(const [k,nm,T,fn,z,s,t,j,cls,a,R,pod] of HOSTS_T){if(!fn||!T)continue;const tall=!!t;
 ROWS[k]={z,s,r:s*.8,ds:tall?[0,1,2,3,4]:[0,1,3]};if(tall){ROWS[k].t=t;ROWS[k].j=j;}EXTRA_BUILDERS[k]=fn;HOSTS_NAME[k]=nm;
 const kh=k+'Host';ROWS[kh]={z:z+(tall?320:170),s,r:s*.6,ds:[1,3]};EXTRA_BUILDERS[kh]=hostsAsHost(kh,T,fn,{cls,a,R,podium:pod});HOSTS_ROW[k]=kh;}
const RUINS=Object.values(ROWS).flatMap(R=>[[R.s,R.z,R.r],[0,R.z,R.r*.7]].concat(R.t?[[R.t+150,R.z,R.r*1.6]]:[]));
