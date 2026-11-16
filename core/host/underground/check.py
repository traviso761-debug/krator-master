#!/usr/bin/env python3
"""Checks of the underground test page (build.py first): every opt-in underground piece of core/host, each with a negative, read
from the page through the shared harness (its universal asserts too). KRATOR_GL=gpu for the real GPU (the gpu-renderer line).

    python3 check.py [--out DIR]     # 'all passed', exit 1 on a failure; shots to DIR (default: the scratch folder shots/)

The follow camera (91b): the camera never in the rock along a walk of the gallery, the hall and the sets (cam-not-in-rock), where the
arm asked for would be; a rope (thin) never shortens the arm, a crate does; the ceiling lowers the pitch in the sets, not in the
hall; first person in the narrow way. The cut-away (99-host-section): the deck cut hides the deck above, keeps the rest, caps the rock, clips
above the cut and not below; the band follows the eye; the section clips the camera's side only; the slab joins its planes. The map
(97b, 88b): the band is the eye's deck, the line map is exported. The x-ray (KFADE) on the walker; the fade's segment while following.
core/host's walker and pick (90, 93; BUGS-2026-11-15 C5-C8): F stands on the floor under the eye (under a sealed set, and with the
ground made the surface); a 0.9 m step stops at a 0.15 m car wall, by C.move and in the loop held at 2 fps; the double-click pins the
floor under the pointer, not the fallback ground's depth, and a drawn ground keeps the old pin; the inspector skips a hit the deck cut
clips and one under a hidden group. Each against the old behaviour as its negative.
"""
import argparse, asyncio, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
from harness import verify_page   # noqa: E402

PAGE = os.path.join(HERE, 'underground.html')

CHECKS = r"""async()=>{
 const out=[],ok=(name,pass,neg,detail)=>out.push([name,!!pass&&!neg,detail==null?'':String(detail)]);
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const K=KHOST,F=K.follow,C=K.cam,c=C.ctl,S=K.section,sol=window._api.ug.solid;
 const put=async(x,y,z,theta,ms)=>{C.walkAt=[x,z,y];c.target.set(x,y+1.7,z);c.theta=theta;c.phi=Math.PI/2+.15;await wait(ms==null?700:ms);};
 // ---- the follow camera
 F.set(true);await wait(300);
 ok('V: the follow camera is on, walking, the walker drawn',F.on&&c.walk&&F.S.mode!=='fp',!F.on,F.S.mode);
 let worst=1e9,wantIn=0,n=0;
 for(const p of [[-60,0,0,-1.57],[-30,0,0,-1.57],[0,0,0,-1.57],[30,0,1,-1.57],[60,0,0,-1.57],[85,0,0,-1.57],[96,0,-2,-1.2],[104,0,4,-2.2],[-8,4.5,11,0],[0,9,22,3.14],[30,9,22.5,-1.57]]){
  await put(p[0],p[1],p[2],p[3],450);n++;const cl=F.clearance();if(cl<worst)worst=cl;
  const t=c.target,ph=c.phi,sp=Math.sin(ph),d=[sp*Math.sin(c.theta),Math.cos(ph),sp*Math.cos(c.theta)],w=F.S.want;
  if(sol(t.x+d[0]*w,t.y+.15+d[1]*w,t.z+d[2]*w)<F.opts.r)wantIn++;}
 ok('cam-not-in-rock: along '+n+' stops the camera keeps its radius from the rock',worst>=F.opts.r-.06,false,'least clearance '+worst.toFixed(2)+' m');
 ok('cam-not-in-rock (negative): the arm asked for would be in the rock at some stops',wantIn>0,wantIn===0,wantIn+' of '+n);
 await put(30,9,22.5,-1.57,600);
 ok('the narrow way (1.6 m): first person',F.S.mode==='fp',F.S.mode==='boom',F.S.mode+' arm '+F.S.L.toFixed(2));
 await put(96,0,-2,-1.57,500);const L05=F.S.L;await wait(2100);   /* from first person: the dwell, then out at 2.5 m/s */
 ok('the hall: the arm eases out slowly (not at once) after the narrow way',L05<2.2,L05>3.9,'arm after 0.5 s '+L05.toFixed(2));
 ok('the hall: the whole arm, no pitch limit',F.S.mode==='boom'&&F.S.L>3.9&&F.S.elevMax>1.5,false,F.S.L.toFixed(2)+' '+F.S.elevMax.toFixed(2));
 await put(0,9,22,3.14,900);
 ok('the sets (2.6 m): the ceiling lowers the pitch limit',F.S.elevMax<.35,F.S.elevMax>1.5,'elevMax '+F.S.elevMax.toFixed(2)+' ceiling '+F.S.hc.toFixed(2));
 /* a rope between the walker and the camera: the walker 2 m east of the rope at x=64 (z 1.2), looking east (the camera behind, west) */
 await put(66,0,1.2,-1.57,300);F.S.L=4;await wait(900);
 const ropeL=F.S.L,t=c.target,ph=c.phi,sp=Math.sin(ph),dd=[sp*Math.sin(c.theta),Math.cos(ph),sp*Math.cos(c.theta)],pv=[t.x,t.y+.15,t.z];
 const withRope=KHOST.solidFrom({cavern:window._api.ug.UGC,walk:KWALK,thin:['nothing-is-thin']});
 const mThin=KHOST.arm.march(sol,pv,dd,4,F.opts.r),mRope=KHOST.arm.march(withRope,pv,dd,4,F.opts.r);
 ok('a rope (thin) behind the walker never shortens the arm',ropeL>3.9&&mThin>3.9,false,'arm '+ropeL.toFixed(2));
 ok('the rope is on that line: counted as solid it would stop the arm (negative)',mRope<3,mRope>3.9,'march with the rope solid '+mRope.toFixed(2));
 /* the same with the crate at x 40 (z 2.8): solid, it shortens the arm */
 await put(42.2,0,2.8,-1.57,300);F.S.L=4;await wait(900);
 ok('a crate (solid) behind the walker does (negative of the rope)',F.S.L<3,F.S.L>3.9,'arm '+F.S.L.toFixed(2));
 ok('the fade follows the segment while following',KFADE.U.uKFadeOn.value===1,false);
 const fig=K.scene?null:null;let xr=0;window._api&&0;K.host.scene.traverse(q=>{if(q.userData&&q.userData.kxray)xr++;});
 ok('the walker carries its x-ray (a mark and a silhouette per mesh)',xr>=6&&xr%2===0,xr===0,xr+' x-ray meshes');
 F.set(false);
 ok('F off: the fade is off, the walker hidden',KFADE.U.uKFadeOn.value===0&&!F.on,F.on);
 // ---- the deck cut
 C.walk(false,true);K.go('The hold, cut (deck 2)');K.cut.to('hold',1);await wait(500);
 let up=0,down=0,upVis=0;K.host.scene.traverse(q=>{const d=q.userData&&q.userData.deck;if(d==null)return;if(d===2){up++;if(q.visible)upVis++;}else if(q.visible)down++;});
 ok('deck cut at the loj hall: the deck above hidden, the rest shown',up>0&&upVis===0&&down>0,upVis>0,up+' above ('+upVis+' visible), '+down+' at or below');
 ok('the badge says the cut is on, and which deck',/deck 2 of 3/.test(S.badge.textContent)&&S.badge.style.display!=='none',S.badge.style.display==='none',S.badge.textContent);
 ok('above the cut inside the box is clipped',S.clipped(-10,4.5+2.3+1,11),false);
 ok('below the cut is not (negative)',!S.clipped(-10,4.5+1,11),S.clipped(-10,4.5+1,11));
 ok('outside the box is not',!S.clipped(110,9,0),false);
 let capsOn=0;K.host.scene.traverse(q=>{if(q.userData&&q.userData.khost==='cap'&&q.visible)capsOn++;});
 ok('the rock is capped while cut',capsOn>0,false,capsOn+' caps');
 K.cut.off();await wait(200);
 let back=0;K.host.scene.traverse(q=>{if(q.userData&&q.userData.deck===2&&q.visible)back++;});capsOn=0;K.host.scene.traverse(q=>{if(q.userData&&q.userData.khost==='cap'&&q.visible)capsOn++;});
 ok('off: the deck above is back, the caps gone, the badge down',back===up&&capsOn===0&&S.badge.style.display==='none',back!==up);
 // ---- the rock cut (core/terrain/host/39h, lifted from the Zeijani kit)
 K.go('The hold, cut (deck 2)');S.set('rock');await wait(300);const KC=KCAVERN.cut;
 ok('rock cut (H): on, no planes, the badge says so',KC.on&&KC.U.uKCutOn.value===1&&!S.clipped(-10,9,11)&&/ROCK CUT/.test(S.badge.textContent),!KC.on,S.badge.textContent);
 ok('rock cut: the loj hall wall over its floor + 2 opens, under it stays',KC.discards(-10,7,6,4.5)&&!KC.discards(-10,6,6,4.5),KC.discards(-10,6,6,4.5));
 let caps0=0;K.host.scene.traverse(q=>{if(q.userData&&q.userData.khost==='cap'&&q.visible)caps0++;});
 ok('rock cut: no caps (no planes to cap)',caps0===0,false,caps0);
 S.off();ok('rock cut off',!KC.on&&KC.U.uKCutOn.value===0,KC.on);
 // ---- the band
 K.setView(70,30,30,96,1,0);S.set('band');await wait(300);
 const P=S.planes;
 ok('band: the cut 2.2 m + 1 m soft over the eye',Math.abs(P[0].constant-(1+2.2+1))<1e-6&&KFADE.U.uKBand.value.z===1,false,'plane at '+P[0].constant);
 ok('band: the hall\'s roof is clipped, its floor not',S.clipped(96,8,0)&&!S.clipped(96,.5,0),!S.clipped(96,8,0));
 S.off();ok('band off: the dither band off',KFADE.U.uKBand.value.z===0&&!S.mode,false);
 // ---- the section and the slab
 K.setView(-8,6,40,-8,6,10);S.set('section');await wait(300);
 ok('section: the camera\'s side clipped, the far side kept',S.clipped(-8,6,20)&&!S.clipped(-8,6,0),!S.clipped(-8,6,20));
 let inter=null;K.host.scene.traverse(q=>{if(inter===null&&q.material&&q.material.clippingPlanes===P)inter=q.material.clipIntersection;});
 ok('section: the planes intersect',inter===true,false);
 S.set('slab');await wait(300);inter=null;K.host.scene.traverse(q=>{if(inter===null&&q.material&&q.material.clippingPlanes===P)inter=q.material.clipIntersection;});
 ok('slab: 6 m round the target kept, before and behind clipped (union)',inter===false&&!S.clipped(-8,6,10)&&S.clipped(-8,6,16)&&S.clipped(-8,6,4),inter!==false,'union '+(inter===false));
 S.off();
 // ---- the map
 K.go('The sets');await wait(500);const MD=K.minimapDecks,band=MD.band(),ex=K.minimap.export();
 ok('the map\'s band is the eye\'s deck',band[2]==='Sets',band[2]==='Platform',JSON.stringify(band));
 ok('the export carries the line map and the heights',ex.schematic&&ex.schematic.nodes.length===8&&ex.schematic.edges.length===7&&ex.heights.filter(h=>h!=null).length>5,!ex.schematic);
 // ---- core/host's walker and pick underground (90-host-camera.js, 93-host-inspect.js; BUGS-2026-11-15 C5-C8)
 S.off();K.cut.off();C.walk(false,true);K.minimapPanel&&K.minimapPanel.open(false);
 const cam=K.host.camera,cv=K.host.renderer.domElement,mid=()=>{const r=cv.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];};
 const view=a=>{c.walk=false;C.walkAt=null;K.setView(a[0],a[1],a[2],a[3],a[4],a[5]);C.apply();cam.updateMatrixWorld();};
 const SURF=()=>UG.SURF,DEEP=UG.ground;
 /* C5: F from the gallery under the sealed set (x 30-45, its floor 9 m up): the floor under the eye */
 view([37,3,2.5,40,1,-1]);C.walk(true);const f5=c.target.y-c.eye;C.stand();const s5=C.walkAt[2];
 ok('F - from the gallery under a set, the walker stands in the gallery',Math.abs(f5)<.05&&Math.abs(s5)<.05,false,'F at '+f5.toFixed(2)+', stood at '+s5.toFixed(2));
 ok('F (negative) the highest floor at that x, z (the old F) is the floor of the set 9 m up',Math.abs(C.standY(37,2.5)-9)<.05,false,C.standY(37,2.5).toFixed(2));
 /* the cave page's case: the ground is the surface 60 m up (set after the view, which the orbit keeps over the ground) */
 view([37,3,2.5,40,1,-1]);UG.ground=SURF;C.walk(true);const f5s=c.target.y-c.eye;C.stand();const s5s=C.walkAt[2];
 const fb=KWALK.floorBelow(37,2.5,0,.7),old5=fb&&fb[0]>=UG.SURF-.3?fb[0]:UG.SURF;UG.ground=DEEP;
 ok('F with the ground the surface over the cave - stands and stays in the gallery',Math.abs(f5s)<.05&&Math.abs(s5s)<.05,false,'F at '+f5s.toFixed(2)+', stood at '+s5s.toFixed(2));
 ok('F (negative) the old stand lifted the walker to the surface',old5===UG.SURF,false,old5);
 /* C6: a 0.9 m step (2 fps: dt capped at 0.1 s) at the car wall at x -66 (0.15 m), from 0.35 m short of it, west */
 for(const k in C.keys)C.keys[k]=false;c.speed=1;
 const step=sw=>{C.walker.sweep=sw;c.walk=true;C.walkAt=[-65.3,0,0];c.target.set(-65.3,1.7,0);c.theta=Math.PI/2;c.phi=Math.PI/2;
  C.keys.w=true;C.move(.1);C.keys.w=false;C.stand();const x=C.walkAt[0];C.walker.sweep=.3;return x;};
 const x6=step(.3),x6n=step(0);
 ok('swept step - a 0.9 m step stops at the 0.15 m wall',x6>-65.925,false,'walker x '+x6.toFixed(3));
 ok('swept step (negative) unswept, the push settles it past the wall',x6n<-66.075,x6n>-65.925,'walker x '+x6n.toFixed(3));
 /* the same in the real loop at 2 frames a second (each frame held 480 ms), W held */
 let slow=false,frames=0;K.on(function ugSlow(){if(!slow)return;frames++;const t0=performance.now();while(performance.now()-t0<480);},'tick');
 const real=async sw=>{C.walker.sweep=sw;c.walk=true;C.walkAt=[-65.3,0,0];c.target.set(-65.3,1.7,0);c.theta=Math.PI/2;c.phi=Math.PI/2;slow=true;await wait(1100);frames=0;
  dispatchEvent(new KeyboardEvent('keydown',{key:'w'}));await wait(2200);dispatchEvent(new KeyboardEvent('keyup',{key:'w'}));const n=frames;slow=false;await wait(150);
  const x=C.walkAt[0];C.walker.sweep=.3;return [x,n];};
 const r6=await real(.3),r6n=await real(0);
 ok('swept step at 2 fps in the loop - W held, the walker stops at the wall',r6[0]>-65.925&&r6[1]<=8,false,'x '+r6[0].toFixed(3)+' after '+r6[1]+' frames');
 ok('swept step at 2 fps (negative) unswept, it walks through',r6n[0]<-66.075,r6n[0]>-65.925,'x '+r6n[0].toFixed(3)+' after '+r6n[1]+' frames');
 /* C7: the pin. Looking down the gallery at its floor; the ground (-50) is a constant fallback, drawn nowhere */
 view([-20,3.5,2.5,-14,0,-1]);let [mx,my]=mid();const g7=C.groundHit(C.ray(mx,my).ray);C.pin=null;
 cv.dispatchEvent(new MouseEvent('dblclick',{clientX:mx,clientY:my,bubbles:true}));const p7=C.pin;
 ok('pin - the double-click pins the gallery floor under the pointer',p7&&Math.abs(p7[1])<.3&&Math.hypot(p7[0]+14,p7[2]+1)<2,!p7,JSON.stringify(p7));
 ok('pin (negative) the hit of the ground alone is at the fallback depth, far off',g7&&g7.p[1]===-50&&Math.hypot(g7.p[0]+14,g7.p[2]+1)>20,false,g7&&JSON.stringify(g7.p.map(v=>+v.toFixed(1))));
 UG.ground=SURF;const g7s=C.groundHit(C.ray(mx,my).ray),p7s=C.pick(mx,my);UG.ground=DEEP;
 ok('pin with the ground the surface over the cave (the camera under it) the floor',p7s&&Math.abs(p7s[1])<.3,!p7s,JSON.stringify(p7s));
 ok('pin (negative) the ground gives nothing from under it (the old pick - no pin)',g7s===null,false);
 /* a ground that is drawn keeps the old pin (the surface pages' case): a plane drawn at -50 under the gallery */
 const gp=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshBasicMaterial({color:0x223322}));gp.rotation.x=-Math.PI/2;gp.position.y=-50;K.host.scene.add(gp);gp.updateMatrixWorld();
 const p7d=C.pick(mx,my);K.host.scene.remove(gp);gp.geometry.dispose();
 ok('pin - a drawn ground keeps the pin on the ground (every surface page)',p7d&&p7d[1]===-50,false,JSON.stringify(p7d));
 C.pin=null;C.pinDraw();
 /* C8: the inspector. A rope's upper half (no deck: not hidden) at y 4, ahead in the gallery; the deck cut at the platform clips
    everything over 2.3 m in the hold's box. three's raycast hits it still */
 const rv=[54,4,-1.2,58,4,-1.2];view(rv);[mx,my]=mid();K.inspectAt(mx,my);const selOff=K.selected;
 K.cut.to('hold',0);view(rv);await wait(150);
 const raw=C.ray(mx,my).intersectObjects(K.host.scene.children,true).filter(h=>!h.object.userData.khost);
 K.inspectAt(mx,my);const selOn=K.selected;
 /* the ropes on this line stand at x 58, 70 and 82; the hold's box ends at x 73, so the first two are clipped and the third is not */
 const at0=r=>r?r.name+' at x '+r.at[0]:'(nothing)';
 ok('inspector - under the deck cut the clipped ropes (x 58, 70) are passed, the first one outside the box (x 82) picked',
  selOn&&selOn.kind==='rope'&&selOn.at[0]>73,selOn&&selOn.at[0]<73,at0(selOn));
 ok('inspector (negative) the raycast of three hits the rope at x 58 first, clipped; with the cut off that rope is picked',
  raw[0]&&/^rope/.test(raw[0].object.name)&&raw[0].point.y>2.3&&!C.drawn(raw[0])&&selOff&&selOff.kind==='rope'&&selOff.at[0]<60,false,
  (raw[0]?raw[0].object.name+' y '+raw[0].point.y.toFixed(2):'no hit')+'; cut off: '+at0(selOff));
 K.cut.off();
 /* a hidden parent: the props' group hidden, a crate's mesh itself still visible */
 view([36.5,1,2.8,40,.8,2.8]);[mx,my]=mid();K.inspectAt(mx,my);const crOn=K.selected;UG_PROPS.visible=false;K.inspectAt(mx,my);const crOff=K.selected;UG_PROPS.visible=true;
 ok('inspector - a crate under a hidden group is not picked',crOn&&crOn.kind==='crate'&&!(crOff&&crOff.kind==='crate'),!(crOn&&crOn.kind==='crate'),(crOn?crOn.name:'-')+' / hidden: '+(crOff?crOff.name:'(nothing)'));
 ok('every program linked',KHOOK.checkPrograms().length===0,false,JSON.stringify(KHOOK.checkPrograms()).slice(0,200));
 return out;}"""

SHOTS = [('follow-gallery', "async()=>{KHOST.section.off();KHOST.go('The gallery');KHOST.follow.set(true);const C=KHOST.cam;C.walkAt=[-40,0,0];C.ctl.target.set(-40,1.7,0);C.ctl.theta=-1.4;C.ctl.phi=1.7;}"),
         ('follow-hall-pillar', "async()=>{const C=KHOST.cam;C.walkAt=[92,-1,0];C.ctl.target.set(92,1.7,-1);C.ctl.theta=-0.9;C.ctl.phi=1.72;}"),
         ('follow-rope', "async()=>{const C=KHOST.cam;C.walkAt=[66,1.2,0];C.ctl.target.set(66,1.7,1.2);C.ctl.theta=-1.57;C.ctl.phi=1.68;}"),
         ('follow-sets', "async()=>{const C=KHOST.cam;C.walkAt=[0,22,9];C.ctl.target.set(0,10.7,22);C.ctl.theta=3.14;C.ctl.phi=1.7;}"),
         ('deck-cut', "async()=>{KHOST.follow.set(false);KHOST.cam.walk(false,true);KHOST.go('The hold, cut (deck 2)');KHOST.cut.to('hold',1);}"),
         ('rock-cut', "async()=>{KHOST.cut.off();KHOST.setView(-62,30,52,-8,4,8);KHOST.section.set('rock');}"),
         ('band-hall', "async()=>{KHOST.section.off();KHOST.setView(70,30,30,96,1,0);KHOST.section.set('band');}"),
         ('section', "async()=>{KHOST.section.off();KHOST.setView(-30,14,60,-5,4,8);KHOST.section.set('section');}"),
         ('slab', "async()=>{KHOST.section.set('slab');}"),
         ('maps', "async()=>{KHOST.section.off();KHOST.go('The sets');KHOST.minimapPanel.open(true);KHOST.minimapDecks.open(true);}")]


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(HERE, 'shots'))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    async with verify_page(PAGE, here=HERE, size='1280x800') as V:
        pg = V.page
        res = await pg.evaluate(CHECKS)
        bad = 0
        for name, passed, detail in res:
            print(('PASS  ' if passed else 'FAIL  ') + name + (('  [' + detail + ']') if detail else ''))
            if not passed:
                bad += 1
                V.fails.append(name)
        for name, js in SHOTS:
            await pg.evaluate(js)
            await pg.wait_for_timeout(1400)
            await pg.screenshot(path=os.path.join(a.out, name + '.png'))
        print('%d of %d passed' % (len(res) - bad, len(res)))
    return V.exit()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
