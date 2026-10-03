/* ==== "On objects" mode: each set on a fitting object, UVs in world metres ==== */
// UVs are in metres (divided by the tile scale through texture.repeat), so a set shows at its real size on any object.
// Pattern sheets are fitted instead: one whole sheet per object face (uv 0..1), at the sheet's aspect.
function worldUV(geo, fit) {
    const p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    for (let i = 0; i < p.count; i++) {
        const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
        let u, v;
        if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); }
        else if (ax >= az) { u = p.getZ(i); v = p.getY(i); }
        else { u = p.getX(i); v = p.getY(i); }
        if (fit) { u = (u - bb.min.x) / (bb.max.x - bb.min.x); v = (v - bb.min.y) / (bb.max.y - bb.min.y); }
        uv.setXY(i, u, v);
    }
    uv.needsUpdate = true; return geo;
}
function cylUV(geo, r) {
    const p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, Math.atan2(p.getX(i), p.getZ(i)) * r, p.getY(i));
    uv.needsUpdate = true; return geo;
}
function bx(w, h, d, x, y, z, fit) { const g = new THREE.BoxGeometry(w, h, d); g.translate(x, y, z); return worldUV(g, fit); }
const darkMat = new THREE.MeshStandardMaterial({color: 0x15120f, roughness: 1});
const woodMat = new THREE.MeshStandardMaterial({color: 0x5a4632, roughness: .85});
const stoneMat = new THREE.MeshStandardMaterial({color: 0x8c877d, roughness: .95});

function noise3(x, y, z) { return Math.sin(x * 3.1 + y * 1.7) * Math.cos(z * 2.9 - x * 1.3) * .5 + Math.sin(y * 4.3 + z * 2.2) * .3; }

const OBJ = {
    wall(p) {   // a face-on wall section with a plinth and a coping, so the surface fills the view
        const m = p.lit, g = new THREE.Group();
        g.add(new THREE.Mesh(bx(1.9, 1.9, .3, 0, 1.15, 0), m));
        g.add(new THREE.Mesh(bx(2.05, .2, .42, 0, .1, 0), stoneMat));
        g.add(new THREE.Mesh(bx(2.05, .1, .42, 0, 2.15, 0), stoneMat));
        return g;
    },
    sheet(p) {   // sheet metal: a flat plate in a frame, tilted back a touch so it catches the environment
        const m = p.lit, g = new THREE.Group();
        g.add(new THREE.Mesh(bx(1.9, 1.9, .05, 0, 0, 0), m));
        [[0, .98, 2.04, .1], [0, -.98, 2.04, .1]].forEach(a => g.add(new THREE.Mesh(bx(a[2], a[3], .1, a[0], a[1], 0), woodMat)));
        [-.98, .98].forEach(x => g.add(new THREE.Mesh(bx(.1, 2.06, .1, x, 0, 0), woodMat)));
        g.rotation.x = -.1; const o = new THREE.Group(); g.position.y = 1.1; o.add(g); return o;
    },
    door(p) {   // planked door in a timber frame on a dark wall
        const m = p.lit, g = new THREE.Group();
        g.add(new THREE.Mesh(bx(1.9, 2.2, .1, 0, 1.1, -.1), darkMat));
        g.add(new THREE.Mesh(bx(1.3, 2.0, .1, 0, 1.0, 0), m));
        [-.75, .75].forEach(x => g.add(new THREE.Mesh(bx(.2, 2.2, .2, x, 1.1, 0), m)));
        g.add(new THREE.Mesh(bx(1.7, .2, .2, 0, 2.1, 0), m));
        return g;
    },
    roof(p) {   // a roof slope turned to face the viewer, tilted back
        const m = p.lit, g = new THREE.Group();
        const geo = new THREE.BoxGeometry(2, 2, .08); geo.rotateX(-.5); geo.translate(0, 1.05, -.25); geo.computeVertexNormals();
        g.add(new THREE.Mesh(worldUV(geo), m));
        g.add(new THREE.Mesh(bx(2.1, .1, .14, 0, .06, .5), woodMat));
        return g;
    },
    dome(p) {   // a drum with a dome: metal and roofing read on curvature
        const m = p.lit, g = new THREE.Group(), pts = [];
        for (let i = 0; i <= 14; i++) { const t = i / 14 * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(t) * .92, .5 + Math.sin(t) * .92)); }
        const dome = new THREE.LatheGeometry(pts, 40), drum = new THREE.CylinderGeometry(.92, .92, .5, 40, 1, true); drum.translate(0, .25, 0);
        g.add(new THREE.Mesh(cylUV(dome, .92), m)); g.add(new THREE.Mesh(cylUV(drum, .92), m));
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(.97, .97, .08, 40), stoneMat));
        const fin = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 8), m); fin.position.y = 1.47; g.add(fin);
        g.position.y = .04; return g;
    },
    banner(p) {   // cloth hung from a pole and cross-arm, with a gentle wave
        const m = p.lit, g = new THREE.Group(), fit = p.s.pattern, W = 1.15, H = fit ? W / p.aspect : 1.7;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 2.4, 10), woodMat); pole.position.set(-.7, 1.2, 0); g.add(pole);
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.5, 8), woodMat); arm.rotation.z = Math.PI / 2; arm.position.set(0, 2.35, 0); g.add(arm);
        const geo = new THREE.PlaneGeometry(W, H, 24, 24);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 5 + .6) * .045 * (1 - (pos.getY(i) / H + .5) * .3));
        geo.translate(0, 2.3 - H / 2 - .02, 0); geo.computeVertexNormals();
        const uv = geo.attributes.uv; for (let i = 0; i < pos.count; i++) fit ? uv.setXY(i, uv.getX(i), uv.getY(i)) : uv.setXY(i, pos.getX(i), pos.getY(i));
        const cloth = new THREE.Mesh(geo, p.lit); cloth.material = p.lit; p.cloth = cloth; g.add(cloth);
        g.position.x = .15; p.sided = true; return g;
    },
    barrel(p) {   // fibre and organic: a bulged barrel
        const pts = [], m = p.lit, g = new THREE.Group();
        for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(.55 + Math.sin(t * Math.PI) * .22, t * 1.5)); }
        g.add(new THREE.Mesh(cylUV(new THREE.LatheGeometry(pts, 36), .7), m));
        const lid = new THREE.Mesh(new THREE.CircleGeometry(.56, 36), m); lid.rotation.x = -Math.PI / 2; lid.position.y = 1.5; g.add(lid);
        g.position.y = .2; return g;
    },
    mound(p) {   // ground: a low rolling patch on a slab
        const m = p.lit, g = new THREE.Group(), geo = new THREE.PlaneGeometry(2, 2, 32, 32); geo.rotateX(-Math.PI / 2);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i), e = Math.max(0, 1 - Math.max(Math.abs(x), Math.abs(z))); pos.setY(i, (Math.exp(-(x * x + z * z) * 1.4) * .5 + .04 * Math.sin(x * 6) * Math.sin(z * 5)) * Math.min(1, e * 6)); }
        geo.computeVertexNormals();
        const uv = geo.attributes.uv; for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i), pos.getZ(i));
        g.add(new THREE.Mesh(geo, m)); g.add(new THREE.Mesh(bx(2, .3, 2, 0, -.15, 0), stoneMat));
        g.position.y = .15; return g;
    },
    log(p) {   // bark: a trunk with a pale cut end
        const m = p.lit, g = new THREE.Group();
        g.add(new THREE.Mesh(cylUV(new THREE.CylinderGeometry(.42, .5, 2.1, 36, 6, true), .46), m));
        const top = new THREE.Mesh(new THREE.CircleGeometry(.42, 36), new THREE.MeshStandardMaterial({color: 0xb89a6a, roughness: .9})); top.rotation.x = -Math.PI / 2; top.position.y = 1.05; g.add(top);
        g.position.y = 1.1; return g;
    },
    rock(p) {   // a boulder, world-UV mapped
        const geo = new THREE.IcosahedronGeometry(.95, 4), pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), k = 1 + noise3(x, y, z) * .22; pos.setXYZ(i, x * k * 1.05, y * k * .85, z * k); }
        geo.computeVertexNormals(); geo.translate(0, .8, 0);
        const g = new THREE.Group(); g.add(new THREE.Mesh(worldUV(geo), p.lit)); return g;
    },
    slab(p) {   // a pattern panel standing on a plinth, at the sheet's aspect
        const g = new THREE.Group(), w = 1.9, h = Math.min(2.1, w / p.aspect), m = p.lit;
        g.add(new THREE.Mesh(bx(w, h, .18, 0, .2 + h / 2, 0, true), m));
        g.add(new THREE.Mesh(bx(w + .2, .2, .35, 0, .1, 0), stoneMat));
        return g;
    }
};
function pickObject(s) {
    const id = s.id.toLowerCase();
    if (s.row === 'Pattern sheets') return s.family === 'cloth' ? 'banner' : 'slab';
    if (s.row === 'Cloth & canvas') return 'banner';
    if (s.row === 'Roof') return 'roof';
    if (s.row === 'Metal') return 'sheet';
    if (s.row === 'Wood') return 'door';
    if (s.row === 'Fibre & organic') return 'barrel';
    if (s.row === 'Ground' || /cobble|pavement|leaves|moss/.test(id)) return 'mound';
    if (s.row === 'Bark & leaf') return 'log';
    if (/^rock_|sandstone_cracks|boulder/.test(id)) return 'rock';
    return 'wall';
}
panels.forEach(p => {
    p.aspect = Math.max(.5, Math.min(3, p.s.scale[0] / p.s.scale[1]));
    p.objKind = pickObject(p.s);
    p.objMain = OBJ[p.objKind](p);
    p.objAlt = (p.s.row === 'Metal' || p.s.row === 'Roof') ? OBJ.dome(p) : null;
    // a pivot at the object's middle so dragging turns it in place; rotation y/x are kept per panel
    p.obj = new THREE.Group();
    p.obj.position.set(p.px, p.py - PANEL / 2 + .05 + 1.1, .05);
    [p.objMain, p.objAlt].forEach(o => { if (o) { o.position.y -= 1.1; p.obj.add(o); } });
    p.obj.traverse(o => { if (o.isMesh && o.material === p.lit) o.userData.uses = true; });
    p.obj.visible = false; scene.add(p.obj);
    p.cap.firstChild.title = p.objKind;
    if (p.sided) p.lit.side = THREE.DoubleSide;
});
function objRepeat(p) {
    const s = p.s;
    return s.pattern ? [1, 1] : [1 / (s.scale[0] * view.scaleMul), 1 / (s.scale[1] * view.scaleMul)];
}
