// node core/biome/test-joint.js: BIO.flareJoin (31j-core-joint.js), each property and a negative
const fs=require('fs'),path=require('path'),vm=require('vm');
const ctx={BIO:{},Math,Object};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(__dirname,'31j-core-joint.js'),'utf8'),ctx);
const B=ctx.BIO;let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL '+m);}else console.log('ok   '+m);};
const pts=[{x:0,y:5,z:0,r:.1},{x:1,y:5.5,z:0,r:.08},{x:2,y:6,z:0,r:.06},{x:3,y:6.3,z:0,r:.04}];
const j=B.flareJoin(pts,{parentR:.4});
ok(j[0].r>pts[0].r*1.5&&j[0].r<=.4*.9+1e-9,'the root flares, capped by the parent ('+j[0].r.toFixed(3)+')');
ok(j[0].x<0&&Math.abs(j[0].x+.4*.7*(1/Math.hypot(1,.5)))<1e-9,'the root is sunk back into the parent along the limb');
ok(j[1].x===0&&j[1].y===5,'the junction point stays where the kit grew it');
const last=j[j.length-1];ok(last.x===3&&last.r===.04,'the limb beyond the collar is the kit\'s own');
ok(j.every((p,i)=>i===0||p.r<=j[i-1].r+1e-12),'the radius never grows along the limb');
ok(JSON.stringify(pts[0])==='{"x":0,"y":5,"z":0,"r":0.1}','the input is not changed');
ok(B.flareJoin([pts[0]],{parentR:.4}).length===1,'a single point comes back as it was');
// negative: a parent thinner than the limb cannot hold a flare: the root keeps the limb's own radius
const t=B.flareJoin(pts,{parentR:.05});ok(t[0].r===.1,'negative: a parent thinner than the limb gets no flare');
process.exit(fail?1:0);
