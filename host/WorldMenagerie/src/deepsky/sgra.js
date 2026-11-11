// ---------- Sagittarius A*, the black hole at the middle of the Milky Way ----------
// The same traced black hole as M87* (blackhole.js), four million suns instead of six and a half billion, with a dim
// disk and no jet (Sgr A* eats very little), and round it, at their true distances in its own radii, the S-stars:
// stars on Kepler orbits that the Keck and the VLT have followed since the 1990s, and how its mass was weighed (the
// 2020 Nobel Prize). Their orbits are the published fits, rounded (K.stars: a in arcseconds, e, i, node and
// periapsis argument in degrees, periapsis year, period in years; an arcsecond is K.auPerArcsec AU at 27,000 light
// years). The clock runs K.yearsPerSec years a second from K.year; the button makes it faster.
// Their positions: the orbit's plane turned by its node, inclination and periapsis argument, the sky's plane laid
// on the world's x-z plane, so the view from above (+y) is the view from the Earth.
import {blackHole} from './blackhole.js';
export function sgrA(api,kit,K){
  const {THREE,camera,animHooks}=api;
  const bh=blackHole(api,kit,Object.assign({name:'Sagittarius A*',label:'Sgr A*'},K));
  const S=bh.S,group=bh.group;
  const AU=K.auPerArcsec||8277,RS_AU=K.rsAU||0.0849,toW=as=>as*AU/RS_AU*S;
  const STARS=K.stars||[];
  const d2r=Math.PI/180;
  const orbits=STARS.map(([name,a,e,i,O,w,tP,P,col])=>{
    i*=d2r;O*=d2r;w*=d2r;const A=toW(a);
    // the turn from the orbit's own plane (periapsis along +x) onto the sky, then the sky onto the world
    const at=nu=>{const r=A*(1-e*e)/(1+e*Math.cos(nu)),u=w+nu;
      const x=r*(Math.cos(O)*Math.cos(u)-Math.sin(O)*Math.sin(u)*Math.cos(i)),y=r*(Math.sin(O)*Math.cos(u)+Math.cos(O)*Math.sin(u)*Math.cos(i)),z=r*Math.sin(u)*Math.sin(i);
      return new THREE.Vector3(x,z,y);};
    const pts=[];for(let k=0;k<=360;k++){const E=k/360*Math.PI*2,nu=2*Math.atan2(Math.sqrt(1+e)*Math.sin(E/2),Math.sqrt(1-e)*Math.cos(E/2));pts.push(at(nu));}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:col||'#8fb0ff',transparent:true,opacity:0.45,depthWrite:false}));
    line.userData.noWire=true;group.add(line);
    const star=kit.glow(col||'#cfe0ff',1,1);star.material.sizeAttenuation=false;star.scale.setScalar(name==='S2'?0.035:0.025);group.add(star);
    const lab=kit.label(name);group.add(lab);
    // something to click
    const hit=new THREE.Mesh(new THREE.SphereGeometry(A*0.04,8,6),new THREE.MeshBasicMaterial({visible:false}));hit.userData.info={name:'The star '+name,info:(K.starInfo&&K.starInfo[name])||''};group.add(hit);
    return {name,a,e,P,tP,at,star,lab,hit,line};});
  // from far out the black hole itself is far too small to see: a mark where it is
  const mark=kit.glow(0xffb070,1,0.9);mark.material.sizeAttenuation=false;mark.scale.setScalar(0.02);group.add(mark);
  const markLab=kit.label('Sgr A*: 4.3 million suns');group.add(markLab);
  let on=false,year=K.year||2000,rate=K.yearsPerSec||0.5,last=null;
  const RATES=[0.5,2,8];
  const solve=(M,e)=>{let E=M;for(let k=0;k<12;k++)E-=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));return E;};
  animHooks.push(now=>{if(!on)return;const dt=last==null?0:Math.min(0.1,(now-last)/1000);last=now;year+=dt*rate;
    for(const o of orbits){const M=2*Math.PI*(((year-o.tP)/o.P)%1),E=solve(M,o.e),nu=2*Math.atan2(Math.sqrt(1+o.e)*Math.sin(E/2),Math.sqrt(1-o.e)*Math.cos(E/2));
      const p=o.at(nu);o.star.position.copy(p);o.lab.position.copy(p);o.hit.position.copy(p);
      // close in, an orbit thousands of times wider than the view is only lines across it: they show from further out
      const hide=bh.isEHT()||camera.position.length()<S*1500;o.star.visible=o.lab.visible=o.line.visible=!hide;}
    mark.visible=markLab.visible=camera.position.length()>=S*1500;});
  const buttons=Object.assign({},bh.buttons,{'Sgr A*: years faster':()=>{rate=RATES[(RATES.indexOf(rate)+1)%RATES.length];}});
  return {group,ownSky:true,get view(){return bh.view;},buttons,
    get pick(){return [...bh.pick,...orbits.map(o=>o.hit)];},
    active(v){on=v;last=null;bh.active(v);},
    hud:now=>bh.hud(now)+' · the year '+year.toFixed(1)+' ('+rate+' years a second)',
    rows:()=>[...bh.rows(),...orbits.map(o=>({x:o.a,z:o.e,w:o.P,dpt:Math.round(o.tP*100)}))]};
}
