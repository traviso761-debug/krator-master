// ================================================================= HOST — the vault's views and checks (station 9)
function STATION_VIEWS(VIEWS){const G=(x,z)=>terrainH(x,z),add=(k,v,mode)=>{if(v)VIEWS[k]={v,mode:mode||'day'};},F=VAULT.floor;
 // the arrival: the shield over the vault, nothing of it showing but the tube's faint swell running north
 add('The shield over the vault',[-260,G(-260,700)+30,700,tubeX(-900),G(tubeX(-900),-900),-900]);
 // inside: down the walk-way between the columns; up into the crown; the conduit's mouth
 add('The Ilmenite Pillar Vault',[0,F+1.7,120,0,F+12,-80]);
 add('The columns',[14,F+1.7,20,8,F+24,-6]);
 add('Up to the crown',[2,F+1.7,-10,0,VAULT.crown,-40]);
 {const s=150,p=[TB.conduit[0]*s,TB.conduit[1]*s];add('The cross-conduit toward Godstep',[TB.conduit[0]*40,F+3,TB.conduit[1]*40,p[0],F+10-.06*s+6,p[1]]);}
 add('The North Shield tube',[0,F+11.7,-160,TB.dir[0]*450,F+10+.05*450+8,TB.dir[1]*450]);
 add('Overview',[-3600,G(-3600,3600)+1500,3600,0,TB.y0-200,0]);
 add('Night on the shield',[-200,G(-200,300)+20,300,0,G(0,-1500),-1500],'night');}
const TCHK={
 // the vault: sealed (rock over its crown all the way to the sky, the record's 58 m less a little), its floor a void over rock
 vault(C){const roof=C.ceilingAt?C.ceilingAt(0,0,VAULT.floor+2):null,open=C.sdf(0,VAULT.floor+20,0),rock=C.sdf(0,VAULT.floor-2,0),sky=C.sdf(0,TB.y0+20,0);
  const thick=terrainH(0,0)-VAULT.crown;return{ok:open>0&&rock<0&&thick>40&&C.sdf(0,VAULT.crown+6,0)<0,detail:'the void '+open.toFixed(1)+' m clear 20 m up, the floor '+rock.toFixed(1)+' (rock under it), '+thick.toFixed(0)+' m of rock over the crown; sealed: '+(C.sdf(0,VAULT.crown+6,0)<0)};},
 // the columns stand on the vault's floor (rock under each foot, the void over it) and inside the vault
 cols(P,C){let bad=0;P.forEach(p=>{if(!(C.sdf(p[0],p[1]-.8,p[2])<0&&C.sdf(p[0],p[1]+1,p[2])>0))bad++;});return{ok:P.length>200&&bad<=P.length*.02,detail:P.length+' columns, '+bad+' not on the floor'};},
 // the conduit leaves toward Godstep (north-east, falling) and joins the vault (a void all along the line from inside the vault out)
 conduit(C){let gap=0;for(let s=0;s<=600;s+=10){const x=TB.conduit[0]*s,z=TB.conduit[1]*s,y=VAULT.floor+10-.06*Math.max(0,s)+4;if(C.sdf(x,y,z)<=0)gap++;}
  const b=Math.atan2(TB.conduit[0],-TB.conduit[1])*180/Math.PI;return{ok:gap===0&&b>30&&b<70,detail:'bearing '+b.toFixed(0)+' deg (Godstep\'s pit: ~52), '+gap+' of 61 points along it in rock'};}};
function STATION_CHECKS(){const R=[],add=(n,r)=>R.push(Object.assign({name:n},r)),C=TUBE_DRAW.C;if(!C){add('the vault built',{ok:false,detail:'no cavern'});return R;}
 add('the vault: a void under 40 m+ of rock, sealed',TCHK.vault(C));
 add('the ilmenite columns stand on the vault\'s floor',TCHK.cols(TUBE_DRAW.cols.map(p=>[p.x,p.y+.3,p.z,p.r]),C));
 add('the cross-conduit leaves toward Godstep, open',TCHK.conduit(C));
 return R;}
function STATION_NEGATIVES(){const R=[],add=(n,r)=>R.push({name:n,failed:!r.ok,detail:r.detail}),C=TUBE_DRAW.C;if(!C)return R;
 add('the vault filled in',TCHK.vault({sdf:()=>-1,ceilingAt:null}));
 add('the columns lifted 5 m',TCHK.cols(TUBE_DRAW.cols.map(p=>[p.x,p.y+5.3,p.z,p.r]),C));
 add('a conduit cut off by rock',TCHK.conduit({sdf:(x,y,z)=>Math.hypot(x,z)>300?-1:1}));
 return R;}
