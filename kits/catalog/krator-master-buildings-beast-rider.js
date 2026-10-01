/* ======================================================================
   Beast-Rider (Mav's Refuge + Girder) BUILDING catalog
   Prefix: br_bldg_   |   culture: 'beast-rider'
   Requires krator-asset-engine.js (ASSET, F.*, shade, TAU) loaded first.
   13 keys / ~30 build "looks" across variants.

   House style for this culture: wet-canopy timber. Generous thatch eaves
   (roofs overhang the wall line by ~1-1.5 m), lashed joints shown as rope
   collars, shutters and woven blinds on EVERY elevation, drying racks,
   water butts and hanging gourds so each entry reads in the round.

   Furniture (2026-10): everything a builder puts in or around its building
   that is not structure (walls, floors, roofs, ladders up a shell, porches,
   rails, built benches and altars, shutters, banners) is a catalog piece
   placed with F.furn(key, lx, ly, lz, lry, { v }) (krator-furniture-core.js):
   built into the building's group and recorded on userData.furniture. Loose
   furniture inside a room kits/interiors/sets/beast-rider.js plans is not
   drawn: the interiors furnish it. A planned room's fixtures, and the
   furniture outside or in the open structures the set skips, are F.furn.
   F.rnd() calls stand where removed drawing code drew random numbers, so the
   structure's random stream (colours, jitter) is unchanged.
   ====================================================================== */

/* ================= Mav's Refuge ================= */

ASSET({
  key: 'br_bldg_deck_lot', name: 'Platform building (deck lot)', culture: 'beast-rider',
  family: 'housing', types: ['dwelling-single'], districts: ['mavs-refuge'], wealth: [0, 1],
  w: 17, d: 13, h: 9.5, variants: 5,
  build: function (F) {
    const w = 14, d = 10, hw = 7, hd = 5, wallT = 0.22;
    const postColor = 0x5e4630, rope = 0x9a8a62;
    const wallTones = [0xb89a6c, 0xa88a5e, 0xc4a878];
    let wallC;
    if (F.variant === 1) wallC = shade(F.pick(wallTones), 0.16);
    else if (F.variant === 2) wallC = F.pick([0x6e5238, 0x5e4630]);
    else if (F.variant === 3) wallC = 0x453a2a;
    else if (F.variant === 4) wallC = shade(0xc4a878, 0.28);
    else wallC = F.pick(wallTones);

    const deckY = 0.22;
    const wallH = 4.3;
    const doorW = 1.7, doorH = 2.5;
    const roofW = 16.6, roofD = 12.6;
    const openC = 0x241d15, shutC = shade(wallC, -0.26);

    const lash = (x, y, z, r) => F.cyl(x, y, z, r + 0.055, 0.14, 0, rope, 'cloth');
    /* hip roof + eave fascia + hip rafters + a thatch course line, so the
       slope is not one blank plane and the overhang past the walls reads */
    const ring = (y, rw, rd, t, c) => {
      F.beam(-rw / 2, y, -rd / 2, rw / 2, y, -rd / 2, t, t, c, 'wood');
      F.beam(-rw / 2, y, rd / 2, rw / 2, y, rd / 2, t, t, c, 'wood');
      F.beam(-rw / 2, y, -rd / 2, -rw / 2, y, rd / 2, t, t, c, 'wood');
      F.beam(rw / 2, y, -rd / 2, rw / 2, y, rd / 2, t, t, c, 'wood');
    };
    const hipRoof = (y, rw, rd, rh, c, light) => {
      F.pyrRoof(0, y, 0, rw, rh, rd, 0, c, 'thatch');
      ring(y, rw, rd, 0.2, shade(c, -0.2));
      if (light !== false) {
        for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
          F.rod(s[0] * rw / 2, y + 0.05, s[1] * rd / 2, 0, y + rh, 0, 0.07, shade(c, -0.3), 'wood');
        }
        const f = 1 - 0.42;
        ring(y + rh * 0.42, rw * f + 0.16, rd * f + 0.16, 0.13, shade(c, -0.26));
      }
    };

    /* deck platform the lot sits on, with its board edges showing all round */
    F.box(0, 0, 0, w + 1.4, deckY, d + 1.4, 0, 0x8a7550, 'wood');
    for (const s of [-1, 1]) {
      F.beam(-(hw + 0.7), 0.12, s * (hd + 0.62), hw + 0.7, 0.12, s * (hd + 0.62), 0.2, 0.2, shade(0x8a7550, -0.2), 'wood');
      F.beam(s * (hw + 0.62), 0.12, -(hd + 0.7), s * (hw + 0.62), 0.12, hd + 0.7, 0.2, 0.2, shade(0x8a7550, -0.2), 'wood');
    }

    // corner posts + rope lashings at the head
    const corners = [[-hw + 0.2, -hd + 0.2], [hw - 0.2, -hd + 0.2], [-hw + 0.2, hd - 0.2], [hw - 0.2, hd - 0.2]];
    for (const c of corners) {
      F.cyl(c[0], deckY, c[1], 0.16, wallH + (F.variant === 1 ? 0.15 : 0), 0, postColor, 'wood');
      lash(c[0], deckY + wallH - 0.5, c[1], 0.16);
    }

    // side walls (full depth), back wall solid, front wall split for the door
    F.box(-hw + wallT / 2, deckY, 0, wallT, wallH, d, 0, wallC, 'wood');
    F.box(hw - wallT / 2, deckY, 0, wallT, wallH, d, 0, wallC, 'wood');
    F.box(0, deckY, -hd + wallT / 2, w, wallH, wallT, 0, wallC, 'wood');
    const segW = (w - doorW) / 2;
    F.box(-doorW / 2 - segW / 2, deckY, hd - wallT / 2, segW, wallH, wallT, 0, wallC, 'wood');
    F.box(doorW / 2 + segW / 2, deckY, hd - wallT / 2, segW, wallH, wallT, 0, wallC, 'wood');
    F.box(0, deckY + doorH, hd - wallT / 2, doorW + 0.3, wallH - doorH, wallT, 0, shade(wallC, -0.2), 'wood');
    F.box(0, deckY, hd - wallT / 2 - 0.03, doorW * 0.88, doorH, 0.07, 0, 0x40331f, 'wood');
    F.box(-doorW * 0.3, deckY + 1.1, hd - wallT / 2 - 0.1, 0.12, 0.12, 0.1, 0, 0x2a2620, 'metal');

    /* openings and shutters on all four elevations, so it reads in the round */
    F.box(-hw - 0.03, deckY + 1.7, -1.8, 0.1, 1.2, 1.15, 0, openC, 'wood');
    F.box(-hw - 0.16, deckY + 1.6, -0.85, 0.08, 1.4, 0.62, -0.35, shutC, 'wood');
    F.box(hw + 0.03, deckY + 1.7, 1.3, 0.1, 1.2, 1.15, 0, openC, 'wood');
    F.box(hw + 0.15, deckY + 1.6, 2.25, 0.08, 1.4, 0.62, 0.35, shutC, 'wood');
    if (F.chance(0.65)) {
      F.box(hw + 0.03, deckY + 1.7, -2.1, 0.1, 1.0, 0.95, 0, openC, 'wood');
      F.box(hw + 0.09, deckY + 1.62, -2.1, 0.07, 1.15, 0.95, 0, shade(shutC, 0.08), 'cloth');
    }
    for (const bx of [-3.2, 3.2]) {
      F.box(bx, deckY + 1.75, -hd - 0.03, 1.15, 1.15, 0.1, 0, openC, 'wood');
      F.box(bx + (bx < 0 ? -0.9 : 0.9), deckY + 1.62, -hd - 0.17, 0.62, 1.35, 0.08, bx < 0 ? 0.3 : -0.3, shutC, 'wood');
    }

    // windows / panel insets (variant flavour, kept)
    if (F.variant === 4) {
      const web = 0xe8ecec;
      F.box(-hw - 0.05, deckY + 1.1, -1.6, 0.08, 2.3, 1.5, 0, web, 'cloth');
      F.box(hw + 0.05, deckY + 1.1, 1.4, 0.08, 2.3, 1.5, 0, web, 'cloth');
      F.box(-hw - 0.05, deckY + 1.1, 1.4, 0.08, 1.6, 1.1, 0, shade(web, -0.05), 'cloth');
    }

    /* service clutter, as catalog furniture (F.furn): the water butt off the back-left corner (on the
       ground: the deck ends at -hd - 0.7), the drying rack against the right flank, a gourd under the
       front eave either side of the door, the wall ladder up the back-left corner */
    F.furn('br_h_water_butt', -hw + 0.9, 0, -hd - 1.05, 0, { v: 0 });
    F.furn('br_drying_rack', hw + 0.36, deckY, -hd + 0.5, -Math.PI / 2);
    for (let i = 0; i < 2; i++) F.furn('br_h_hanging_gourds', -3.4 + i * 5.1, deckY + wallH - 1.02, hd + 0.35, 0, { v: 0 });
    F.furn('br_h_wall_ladder', -hw - 0.45, deckY, -hd + 1.25, -Math.PI / 2, { v: 0 });
    for (let i = 0; i < 6; i++) F.rnd();   /* the rack's cloths and the gourds drew 6: keep the structure's stream */

    const wallTop = deckY + wallH;
    if (F.variant === 1) {
      // fancy: gilt/red eave trim + covered porch + two-tier joglo roof
      const gilt = 0xb08432, red = 0x8a2f2a;
      F.box(0, wallTop - 0.1, 0, w + 0.25, 0.14, d + 0.25, 0, gilt, 'wood');
      F.box(0, deckY + doorH + 0.05, hd - wallT / 2 - 0.02, doorW + 0.5, 0.14, 0.1, 0, red, 'wood');
      F.cyl(-1.0, deckY, hd + 0.85, 0.1, 2.6, 0, postColor, 'wood');
      F.cyl(1.0, deckY, hd + 0.85, 0.1, 2.6, 0, postColor, 'wood');
      lash(-1.0, deckY + 2.2, hd + 0.85, 0.1);
      lash(1.0, deckY + 2.2, hd + 0.85, 0.1);
      F.pyrRoof(0, deckY + 2.6, hd + 0.85, 3.2, 1.1, 2.0, 0, shade(0x6a5a44, 0.05), 'thatch');
      hipRoof(wallTop, roofW, roofD, 1.9, 0x6a5a44);
      hipRoof(wallTop + 1.75, roofW * 0.58, roofD * 0.58, 2.4, shade(0x6a5a44, -0.07), false);
      F.box(0, wallTop + 4.05, 0, 0.5, 0.16, 2.4, 0, gilt, 'wood');
      F.cone(0, wallTop + 4.2, 0, 0.2, 0.55, 0, gilt, 'metal');
    } else if (F.variant === 2) {
      // tavern/inn: jettied balcony rail, hanging sign, chimney
      F.box(0, deckY + 2.9, hd + 0.15, w - 1.0, 0.14, 0.55, 0, shade(wallC, -0.05), 'wood');
      for (let i = 0; i < 5; i++) {
        const rx = -hw + 1.2 + i * (w - 2.4) / 4;
        F.cyl(rx, deckY + 2.9, hd + 0.4, 0.035, 0.55, 0, postColor, 'wood');
      }
      F.rod(-hw + 1.2, deckY + 3.45, hd + 0.4, hw - 1.2, deckY + 3.45, hd + 0.4, 0.02, postColor, 'wood');
      F.rod(-hw + 1.0, deckY + 2.9, hd + 0.4, -hw + 1.6, deckY + 1.6, hd - 0.1, 0.05, postColor, 'wood');
      F.rod(hw - 1.0, deckY + 2.9, hd + 0.4, hw - 1.6, deckY + 1.6, hd - 0.1, 0.05, postColor, 'wood');
      F.rod(1.3, wallTop + 0.1, hd - wallT / 2, 1.9, wallTop - 0.5, hd + 0.5, 0.03, 0x2a2620, 'wood');
      F.box(1.9, wallTop - 0.9, hd + 0.5, 0.5, 0.35, 0.04, 0, 0x8a2f2a, 'wood');
      const chimX = hw - 1.0;
      for (let i = 0; i < 6; i++) F.box(chimX, deckY + i * 0.9, -hd + 0.5, 0.55, 0.85, 0.55, F.rr(-0.05, 0.05), shade(0x8a857a, F.rr(-0.05, 0.05)), 'stone');
      F.box(chimX, deckY + 5.4, -hd + 0.5, 0.7, 0.2, 0.7, 0, 0x6a655a, 'stone');
      hipRoof(wallTop, roofW, roofD, 4.3, shade(0x6a5a44, -0.08));
    } else if (F.variant === 3) {
      // military: plain, two-tier stave roof with clerestory drum
      hipRoof(wallTop, roofW, roofD, 2.2, 0x3a2f22);
      F.cyl(0, wallTop + 2.2, 0, 2.9, 0.95, 0, 0x2a2016, 'wood');
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * TAU;
        F.box(Math.cos(a) * 2.92, wallTop + 2.45, Math.sin(a) * 2.92, 0.12, 0.5, 0.5, -a, 0xffb066, 'glow');
      }
      hipRoof(wallTop + 3.15, roofW * 0.6, roofD * 0.6, 2.0, 0x2f2418, false);
      F.box(0, wallTop + 5.05, 0, 0.36, 0.14, 1.8, 0, 0x2a2016, 'wood');
    } else {
      // home + silkhouse: single steep hip roof with a ridge pole and finials
      const rc = F.variant === 4 ? shade(0x6a5a44, 0.08) : 0x6a5a44;
      hipRoof(wallTop, roofW, roofD, 4.3, rc);
      F.box(0, wallTop + 4.15, 0, 0.34, 0.16, 2.6, 0, shade(rc, -0.3), 'wood');
      F.cone(0, wallTop + 4.28, 0, 0.22, 0.5, 0, shade(rc, -0.35), 'wood');
      const f2 = 1 - 0.72;
      ring(wallTop + 4.3 * 0.72, roofW * f2 + 0.14, roofD * f2 + 0.14, 0.12, shade(rc, -0.28));
    }
  }
});

ASSET({
  key: 'br_bldg_nature_shrine', name: 'Nature shrine (open pavilion)', culture: 'beast-rider',
  family: 'religious', types: ['religious'], districts: ['mavs-refuge'], wealth: [0, 1],
  w: 10, d: 10, h: 9.9, variants: 1,
  build: function (F) {
    const timber = 0x5e4630, red = 0x8a2f2a, rope = 0x9a8a62;
    const postH = 3.0, ringR = 4.0, n = 9;
    F.box(0, 0, 0, 9.2, 0.3, 9.2, 0, 0x8a7550, 'wood');
    F.box(0, 0.3, 0, 8.4, 0.16, 8.4, 0, shade(0x8a7550, 0.08), 'wood');
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU;
      const px = Math.cos(a) * ringR, pz = Math.sin(a) * ringR;
      F.cyl(px, 0.3, pz, 0.14, postH, 0, i % 2 === 0 ? timber : red, 'wood');
      F.cyl(px, 0.3 + postH - 0.35, pz, 0.19, 0.13, 0, rope, 'cloth');
      // low rail between neighbouring posts, skipped at the entry
      if (i < n - 1) {
        const b = (i + 1) / n * TAU;
        F.rod(px, 1.25, pz, Math.cos(b) * ringR, 1.25, Math.sin(b) * ringR, 0.045, shade(timber, 0.08), 'wood');
      }
    }
    /* centre offering (the planned shrine room's fixture, so the building places it): a carved stump
       altar or a young sapling in a pot. The offering bowls round the deck were loose furniture in
       the planned room: the interiors furnish it (kits/interiors/sets/beast-rider.js) */
    if (F.chance(0.5)) F.furn('br_shrine_altar', 0, 0.46, 0, 0, { v: 0 });
    else F.furn('br_h_shrine_sapling', 0, 0.46, 0, 0, { v: 0 });
    // hanging lanterns from the lowest eave, outside the post ring (the cord meets the eave)
    for (let i = 0; i < 3; i++) {
      const a = i / 3 * TAU + 0.3;
      F.furn('br_h_hanging_lantern', Math.cos(a) * 4.2, 0.3 + postH - 0.95, Math.sin(a) * 4.2, F.rr(0, 1) - 0.3, { v: 0 });
    }
    let y = 0.3 + postH;
    const t1 = 0x8a7a52, t2 = shade(t1, -0.08), t3 = shade(t1, -0.15);
    const tier = (yy, size, hh, c) => {
      F.pyrRoof(0, yy, 0, size, hh, size, 0, c, 'thatch');
      const h2 = size / 2;
      F.beam(-h2, yy, -h2, h2, yy, -h2, 0.17, 0.17, shade(c, -0.22), 'wood');
      F.beam(-h2, yy, h2, h2, yy, h2, 0.17, 0.17, shade(c, -0.22), 'wood');
      F.beam(-h2, yy, -h2, -h2, yy, h2, 0.17, 0.17, shade(c, -0.22), 'wood');
      F.beam(h2, yy, -h2, h2, yy, h2, 0.17, 0.17, shade(c, -0.22), 'wood');
    };
    tier(y, 9.8, 1.7, t1); y += 1.7;
    F.cyl(0, y, 0, 0.75, 0.35, 0, shade(t1, -0.2), 'wood'); y += 0.35;
    tier(y, 6.4, 1.4, t2); y += 1.4;
    F.cyl(0, y, 0, 0.55, 0.3, 0, shade(t2, -0.2), 'wood'); y += 0.3;
    F.pyrRoof(0, y, 0, 3.8, 1.2, 3.8, 0, t3, 'thatch'); y += 1.2;
    F.cyl(0, y, 0, 0.26, 0.5, 0, shade(t3, -0.2), 'wood'); y += 0.5;
    F.cone(0, y, 0, 0.3, 0.75, 0, shade(t3, 0.1), 'wood');
    F.ball(0, y + 0.9, 0, 0.2, 0xb08432, 'metal');
  }
});

ASSET({
  key: 'br_bldg_council_chamber', name: 'Council Chamber', culture: 'beast-rider',
  family: 'civic', types: ['civic'], districts: ['mavs-refuge'], wealth: [0, 1],
  w: 31, d: 31, h: 30, variants: 1,
  build: function (F) {
    const wallC = 0xb89a6c, red = 0x7a2028, gilt = 0xb08432, timber = 0x5e4630, rope = 0x9a8a62;
    const R = 12.2, wallH = 9.5, wallThick = 0.55, nSeg = 16;
    const arcLen = 2 * Math.PI * R / nSeg, segW = arcLen * 0.94;
    F.cyl(0, 0, 0, R + 0.35, 0.4, 0, red, 'wood');
    F.cyl(0, wallH - 0.4, 0, R + 0.35, 0.4, 0, red, 'wood');
    for (let i = 0; i < nSeg; i++) {
      const theta = i / nSeg * TAU;
      const cx = Math.cos(theta) * R, cz = Math.sin(theta) * R;
      const ry = -theta - Math.PI / 2;
      if (i % 4 === 0) {
        // doorway: small gabled porch hood + red portal trim
        F.pyrRoof(Math.cos(theta) * (R + 0.9), wallH - 1.0, Math.sin(theta) * (R + 0.9), 3.2, 1.6, 2.4, ry, shade(0x6a5a44, 0.06), 'thatch');
        F.box(cx, 0, cz, segW * 0.9, 3.4, 0.16, ry, red, 'wood');
        F.box(cx, 3.4, cz, segW * 0.9, 0.3, 0.3, ry, gilt, 'wood');
      } else {
        F.box(cx, 0, cz, segW, wallH, wallThick, ry, wallC, 'wood');
        if (i % 2 === 1) F.box(cx, 5.2, cz, segW * 0.55, 1.5, 0.2, ry, shade(wallC, -0.32), 'wood');
      }
    }
    // colonnades, each post collared with rope at the head
    const outerN = 18, outerR = 14.0, innerN = 11, innerR = 8.0, postH = wallH;
    for (let i = 0; i < outerN; i++) {
      const a = i / outerN * TAU;
      const x = Math.cos(a) * outerR, z = Math.sin(a) * outerR;
      F.cyl(x, 0, z, 0.18, postH, 0, i % 2 === 0 ? red : timber, 'wood');
      F.cyl(x, postH, z, 0.24, 0.14, 0, gilt, 'wood');
      F.cyl(x, postH - 0.8, z, 0.23, 0.13, 0, rope, 'cloth');
      // brace from post head back to the wall head
      const b = (i % 3 === 0);
      if (b) F.rod(x, postH - 0.2, z, Math.cos(a) * (R + 0.2), wallH - 1.4, Math.sin(a) * (R + 0.2), 0.08, timber, 'wood');
    }
    for (let i = 0; i < innerN; i++) {
      const a = i / innerN * TAU + 0.15;
      const x = Math.cos(a) * innerR, z = Math.sin(a) * innerR;
      F.cyl(x, 0, z, 0.16, postH, 0, i % 2 === 0 ? timber : red, 'wood');
      F.cyl(x, postH, z, 0.2, 0.12, 0, gilt, 'wood');
    }
    /* telescoping roof — the bottom tier now reaches well past the outer
       colonnade, as a wet-forest veranda roof must */
    let y = wallH;
    F.pyrRoof(0, y, 0, 30.6, 6.4, 30.6, 0, 0x6a5a44, 'thatch');
    for (const s of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      F.beam(s[0] * 15.3 - (s[1] ? 15.3 : 0), y, s[1] * 15.3 - (s[0] ? 15.3 : 0),
        s[0] * 15.3 + (s[1] ? 15.3 : 0), y, s[1] * 15.3 + (s[0] ? 15.3 : 0), 0.3, 0.3, shade(0x6a5a44, -0.25), 'wood');
    }
    for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) F.rod(s[0] * 15.3, y + 0.1, s[1] * 15.3, 0, y + 6.4, 0, 0.11, shade(0x6a5a44, -0.3), 'wood');
    y += 6.4;
    // clerestory drum between the tiers, tall enough to read as a lantern storey
    F.cyl(0, y, 0, 6.8, 1.8, 0, 0x5a4a38, 'wood');
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU + 0.2;
      F.box(Math.cos(a) * 6.82, y + 0.4, Math.sin(a) * 6.82, 0.14, 1.0, 1.6, -a, 0xffb066, 'glow');
    }
    y += 1.8;
    F.pyrRoof(0, y, 0, 17.5, 5.0, 17.5, 0, 0x5a4a38, 'thatch'); y += 5.0;
    F.cyl(0, y, 0, 3.6, 0.9, 0, 0x6a5a44, 'wood'); y += 0.9;
    F.pyrRoof(0, y, 0, 9.0, 4.0, 9.0, 0, 0x6a5a44, 'thatch');
    const finBaseY = y, finR = 4.6;
    y += 4.0;
    F.cyl(0, y, 0, 1.6, 1.4, 0, wallC, 'wood'); y += 1.4;
    F.cone(0, y, 0, 0.9, 2.0, 0, gilt, 'metal');
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      F.cone(Math.cos(a) * finR, finBaseY, Math.sin(a) * finR, 0.22, 0.9, 0, 0x6a5a44, 'thatch');
    }
  }
});

ASSET({
  key: 'br_bldg_rain_canopy', name: 'Rain canopy (market/plaza roof)', culture: 'beast-rider',
  family: 'civic', types: ['market', 'infrastructure'], districts: ['mavs-refuge'], wealth: [0, 1],
  w: 70, d: 70, h: 14, variants: 1,
  build: function (F) {
    const timber = 0x6a5c48, rope = 0x9a8a62;
    const tones = [0xb09a5a, 0x9a8a52];
    const rings = [
      { rIn: 8, rOut: 17, y: 13, n: 18 },
      { rIn: 17, rOut: 26, y: 11.5, n: 20 },
      { rIn: 26, rOut: 34.5, y: 10, n: 22 }
    ];
    for (const ring of rings) {
      const rMid = (ring.rIn + ring.rOut) / 2;
      const panelLen = (ring.rOut - ring.rIn) * 1.08;
      const panelW = 2 * Math.PI * rMid / ring.n * 0.86;
      for (let i = 0; i < ring.n; i++) {
        const theta = i / ring.n * TAU;
        const cx = Math.cos(theta) * rMid, cz = Math.sin(theta) * rMid;
        const ry = -theta;
        F.box(cx, ring.y, cz, panelLen, 0.28, panelW, ry, F.pick(tones), 'thatch');
      }
    }
    // perimeter support posts, lashed and knee-braced
    const postN = 8, postR = 32;
    for (let i = 0; i < postN; i++) {
      const a = i / postN * TAU;
      const px = Math.cos(a) * postR, pz = Math.sin(a) * postR;
      F.cyl(px, 0, pz, 0.28, 10, 0, timber, 'wood');
      F.cyl(px, 9.0, pz, 0.34, 0.18, 0, rope, 'cloth');
      F.rod(px, 8.2, pz, px * 0.86, 9.9, pz * 0.86, 0.1, timber, 'wood');
      F.rod(px, 8.2, pz, px * 1.08, 9.9, pz * 1.08, 0.1, timber, 'wood');
    }
    // radial support beams from inner ring down to rim
    const beamN = 8;
    for (let i = 0; i < beamN; i++) {
      const a = i / beamN * TAU;
      F.beam(Math.cos(a) * 8, 13.4, Math.sin(a) * 8, Math.cos(a) * 34, 9.6, Math.sin(a) * 34, 0.3, 0.3, timber, 'wood');
    }
    // great lanterns hung from the radial beams (the cord top stays at 9.8)
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU + 0.4;
      F.furn('br_h_hanging_lantern', Math.cos(a) * 26, 9.8 - 2.3, Math.sin(a) * 26, F.rr(0, TAU) - 0.4, { v: 2 });
    }
  }
});

ASSET({
  key: 'br_bldg_roost_gallery', name: 'Open roost/hangar gallery', culture: 'beast-rider',
  family: 'industrial', types: ['industry', 'infrastructure'], districts: ['mavs-refuge'], wealth: [0, 1],
  w: 26, d: 18, h: 11, variants: 1,
  build: function (F) {
    const timber = 0x6a5c48, rope = 0x9a8a62;
    const hw = 10, hd = 7, postH = 8.0;
    const roofW = 23.0, roofD = 17.6, roofH = 2.4;
    const nPost = 5;
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < nPost; i++) {
        const x = -hw + 1.0 + i * (2 * hw - 2.0) / (nPost - 1);
        F.cyl(x, 0, side * hd, 0.16, postH, 0, timber, 'wood');
        F.cyl(x, postH - 0.7, side * hd, 0.21, 0.15, 0, rope, 'cloth');
        // knee brace up to the eave beam
        if (i % 2 === 0) F.rod(x, postH - 1.6, side * hd, x + 1.3, postH - 0.1, side * hd, 0.07, timber, 'wood');
      }
      F.beam(-hw + 1.0, postH, side * hd, hw - 1.0, postH, side * hd, 0.24, 0.24, timber, 'wood');
    }
    F.beam(-hw, postH, -hd + 1.0, -hw, postH, hd - 1.0, 0.22, 0.22, timber, 'wood');
    F.beam(hw, postH, -hd + 1.0, hw, postH, hd - 1.0, 0.22, 0.22, timber, 'wood');
    // open joist frame on top
    for (let i = 0; i < 4; i++) {
      const x = -hw + 3.0 + i * (2 * hw - 6.0) / 3;
      F.beam(x, postH + 0.15, -hd, x, postH + 0.15, hd, 0.14, 0.18, timber, 'wood');
    }
    /* deep thatch hangar roof — 1.8 m of eave past the post line all round */
    F.pyrRoof(0, postH + 0.3, 0, roofW, roofH, roofD, 0, 0x7a6a4e, 'thatch');
    const ey = postH + 0.3, ec = shade(0x7a6a4e, -0.24);
    F.beam(-roofW / 2, ey, -roofD / 2, roofW / 2, ey, -roofD / 2, 0.26, 0.26, ec, 'wood');
    F.beam(-roofW / 2, ey, roofD / 2, roofW / 2, ey, roofD / 2, 0.26, 0.26, ec, 'wood');
    F.beam(-roofW / 2, ey, -roofD / 2, -roofW / 2, ey, roofD / 2, 0.26, 0.26, ec, 'wood');
    F.beam(roofW / 2, ey, -roofD / 2, roofW / 2, ey, roofD / 2, 0.26, 0.26, ec, 'wood');
    for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) F.rod(s[0] * roofW / 2, ey + 0.1, s[1] * roofD / 2, 0, ey + roofH, 0, 0.1, ec, 'wood');
    // thatch course lines so the big slope is not one blank plane
    for (const k of [0.3, 0.58]) {
      const f = 1 - k, cw = roofW * f / 2 + 0.1, cd = roofD * f / 2 + 0.1, cy = ey + roofH * k;
      F.beam(-cw, cy, -cd, cw, cy, -cd, 0.15, 0.15, ec, 'wood');
      F.beam(-cw, cy, cd, cw, cy, cd, 0.15, 0.15, ec, 'wood');
      F.beam(-cw, cy, -cd, -cw, cy, cd, 0.15, 0.15, ec, 'wood');
      F.beam(cw, cy, -cd, cw, cy, cd, 0.15, 0.15, ec, 'wood');
    }
    F.box(0, ey + roofH - 0.1, 0, 0.4, 0.2, 3.2, 0, ec, 'wood');
    F.cone(0, ey + roofH + 0.05, 0, 0.26, 0.65, 0, shade(0x7a6a4e, -0.3), 'wood');

    // half-furled cloth curtain panels between posts
    const awnings = [0xc9a24a, 0x9a8a52, 0xb08a5a];
    const curtainX = [-6.5, -2.5, 1.5, 5.5, 8.5];
    for (let i = 0; i < curtainX.length; i++) {
      const drop = F.rr(2.2, 5.5);
      F.box(curtainX[i], postH - drop, hd - 0.05, 1.4, drop, 0.06, F.rr(-0.05, 0.05), F.pick(awnings), 'cloth');
    }
    // woven mat blinds on the back elevation too
    for (const bx of [-7.5, -1.0, 6.0]) {
      const drop = F.rr(2.6, 5.0);
      F.box(bx, postH - drop, -hd + 0.05, 2.0, drop, 0.06, 0, shade(F.pick(awnings), -0.12), 'cloth');
    }

    // projecting perch-log beams with lashings and a perch rail
    F.beam(-hw - 0.3, 3.2, -hd + 1.5, -hw - 3.2, 3.4, -hd + 1.5, 0.24, 0.24, timber, 'wood');
    F.beam(hw + 0.3, 4.0, hd - 2.0, hw + 3.0, 4.1, hd - 2.0, 0.22, 0.22, timber, 'wood');
    F.rod(-hw - 0.4, 3.35, -hd + 1.5, -hw - 0.4, 4.9, -hd + 1.5, 0.06, timber, 'wood');
    F.rod(hw + 0.4, 4.15, hd - 2.0, hw + 0.4, 5.6, hd - 2.0, 0.06, timber, 'wood');
    F.cyl(-hw - 1.8, 3.28, -hd + 1.5, 0.3, 0.13, 0, rope, 'cloth');
    F.cyl(hw + 1.6, 4.05, hd - 2.0, 0.28, 0.13, 0, rope, 'cloth');
    // main perch rails slung under the joists, scored with claw wear
    for (const pz of [-3.2, 3.2]) {
      F.rod(-hw + 1.2, 6.5, pz, hw - 1.2, 6.5, pz, 0.24, shade(timber, -0.12), 'wood');
      for (let i = 0; i < 4; i++) {
        F.box(-6.5 + i * 4.2, 6.62, pz, 0.7, 0.06, 0.34, F.rr(-0.1, 0.1), shade(timber, -0.32), 'wood');
      }
    }
    /* the planned stable room's fixtures (kits/interiors/sets/beast-rider.js), placed by the building as
       catalog furniture: the ladder up to the perch level, the thatch nest bundles in two corners, the
       water butt. The hanging feed baskets were loose furniture in that room: the interiors furnish it */
    F.furn('br_h_wall_ladder', -1.55, 0, hd - 0.7, 0, { v: 1 });
    F.furn('br_h_nest', hw - 1.6, 0, -hd + 1.6, 0, { v: 0 });
    F.furn('br_h_nest', -hw + 1.8, 0, hd - 1.8, 0.5, { v: 0 });
    F.furn('br_h_water_butt', hw - 3.6, 0, -hd + 1.2, 0, { v: 0 });
  }
});

ASSET({
  key: 'br_bldg_gateway_tree_facade', name: 'Gateway-tree carved facade', culture: 'beast-rider',
  family: 'defensive', types: ['infrastructure', 'civic'], districts: ['mavs-refuge', 'gate-tree'], wealth: [0, 1],
  w: 13.8, d: 13.9, h: 12, variants: 4,
  build: function (F) {
    const barkC = F.pick([0x8c6a48, 0x7c5c3e]);
    const rope = 0x9a8a62;
    const trunkR = 6.0, trunkZ = -0.5;
    /* radius of the trunk at height y, and the flat-face inradius at that height */
    const rAt = (y) => trunkR - y / 12 * 0.9;
    F.frustum(0, 0, trunkZ, trunkR, 5.1, 12, 0, barkC, 'bark', 11);
    // root buttresses flaring clear of the trunk all round the base
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU + 0.25;
      F.frustum(Math.cos(a) * 5.3, 0, trunkZ + Math.sin(a) * 5.3, 1.6, 0.4, F.rr(2.4, 3.6), a, shade(barkC, -0.09), 'bark', 6);
    }
    // carved/painted bands around the whole trunk
    const bandC = [shade(barkC, 0.2), 0x8a2f2a, shade(barkC, -0.18)];
    for (let i = 0; i < 3; i++) {
      const by = 4.2 + i * 2.5;
      const br = rAt(by) + 0.12;
      F.frustum(0, by, trunkZ, br, br - 0.05, 0.55, 0, bandC[i], 'bark', 11);
    }

    /* the carved portal: a buttress mass standing clearly PROUD of the trunk,
       so the door and its collar read from outside instead of being buried
       inside the trunk solid (they were, before). */
    const portalFace = 6.0, doorZ = portalFace - 0.3;
    F.box(0, 0, (4.1 + portalFace) / 2, 3.9, 4.5, portalFace - 4.1, 0, shade(barkC, 0.06), 'bark');
    const collar = shade(barkC, 0.16);
    F.box(0, 3.55, portalFace - 0.02, 3.3, 0.3, 0.34, 0, collar, 'bark');
    F.box(-1.45, 0, portalFace - 0.02, 0.4, 3.7, 0.34, 0, collar, 'bark');
    F.box(1.45, 0, portalFace - 0.02, 0.4, 3.7, 0.34, 0, collar, 'bark');
    F.box(0, 0, portalFace - 0.02, 3.3, 0.22, 0.34, 0, collar, 'bark');
    F.box(0, 0.22, portalFace - 0.5, 2.5, 3.3, 0.36, 0, 0x201a14, 'bark');
    // carved brow above the portal
    F.box(0, 4.0, portalFace - 0.25, 4.3, 0.34, 0.5, 0, shade(barkC, -0.12), 'bark');
    F.cone(0, 4.34, portalFace - 0.25, 0.5, 0.8, 0, shade(barkC, 0.22), 'bark');

    // climbing pegs up the left flank + a rope loop
    for (let i = 0; i < 5; i++) {
      const py = 1.2 + i * 1.7;
      const pr = rAt(py);
      F.rod(-pr * 0.95, py, trunkZ + 0.2, -pr - 0.7, py + 0.12, trunkZ + 0.2, 0.09, shade(barkC, -0.22), 'bark');
    }
    F.rod(-rAt(9.6) + 0.4, 9.6, trunkZ + 0.2, -rAt(1.4) - 0.45, 1.4, trunkZ + 0.2, 0.035, rope, 'cloth');
    // branch stubs at the crown, on every side
    for (let i = 0; i < 4; i++) {
      const a = i / 4 * TAU + 0.5, br = rAt(11.3) + 1.25;
      const bx = Math.cos(a) * br, bz = trunkZ + Math.sin(a) * br;
      F.rod(bx * 0.35, 9.2, (bz - trunkZ) * 0.35 + trunkZ, bx, 11.3, bz, 0.34, shade(barkC, -0.1), 'bark');
      /* a lantern hung from the stub's end (its cord meets the stub at 11.1) */
      if (i % 2 === 0) F.furn('br_h_hanging_lantern', bx, 11.1 - 0.95, bz, F.rr(0, 1) - 0.3, { v: 0 });
    }
    // carved totem faces on the flanks
    for (const s of [-1, 1]) {
      const fy = 5.6, fz = -1.6;
      const fx = Math.sqrt(Math.max(rAt(fy) * 0.96, 0.1) * Math.max(rAt(fy) * 0.96, 0.1) - fz * fz);
      F.box(s * (fx + 0.1), fy, trunkZ + fz, 0.5, 1.5, 1.2, 0, shade(barkC, 0.24), 'bark');
      F.box(s * (fx + 0.3), fy + 1.0, trunkZ + fz, 0.3, 0.22, 1.35, 0, 0x2a2016, 'bark');
      F.box(s * (fx + 0.3), fy + 0.35, trunkZ + fz, 0.3, 0.18, 0.85, 0, 0x2a2016, 'bark');
    }
    // moss on the shaded back
    F.blob(-1.6, 2.2, trunkZ - 5.5, 1.1, 1.7, 0, 0x4a6a3a, 'leafy');
    F.blob(1.9, 6.4, trunkZ - 4.9, 0.85, 1.1, 0, 0x55703f, 'leafy');

    if (F.variant === 0) {
      // storehouse: double-leaf plank door, hoist beam, hanging crate, hood roof
      const timber = 0x40331f;
      F.box(-0.62, 0.22, doorZ, 1.15, 3.2, 0.16, 0, timber, 'wood');
      F.box(0.62, 0.22, doorZ, 1.15, 3.2, 0.16, 0, shade(timber, 0.04), 'wood');
      F.box(0, 1.7, doorZ + 0.1, 2.4, 0.14, 0.05, 0, 0x2a2620, 'metal');
      F.beam(0, 4.6, portalFace - 0.8, 0, 4.6, portalFace + 0.75, 0.2, 0.2, 0x5e4630, 'wood');
      F.rod(0, 4.6, portalFace + 0.7, 0, 1.8, portalFace + 0.7, 0.025, rope, 'cloth');
      F.box(0, 1.25, portalFace + 0.7, 0.55, 0.5, 0.55, 0.15, 0x7a6a4e, 'wood');
      F.pyrRoof(0, 4.75, portalFace - 0.75, 4.6, 1.2, 2.8, 0, shade(barkC, -0.12), 'thatch');
      F.furn('br_h_crate_stack', 1.5, 0, portalFace + 0.2, 0.3, { v: 1 });   /* on the ground, before the portal */
    } else if (F.variant === 1) {
      // vault: iron-banded door, lock disc, warning totems
      const dark = 0x4a4038;
      F.box(0, 0.22, doorZ, 2.3, 3.1, 0.18, 0, 0x2a2620, 'wood');
      for (let i = 0; i < 3; i++) F.box(0, 0.8 + i * 0.95, doorZ + 0.1, 2.3, 0.18, 0.05, 0, dark, 'metal');
      F.cyl(0.62, 1.7, doorZ + 0.12, 0.14, 0.08, Math.PI / 2, 0x2a2620, 'metal');
      F.box(0, 3.95, portalFace + 0.05, 1.5, 0.22, 0.28, 0, dark, 'metal');
      /* warning totems (skull poles) flanking the door, just clear of the root buttresses */
      for (const s of [-1, 1]) F.furn('br_court_statue', s * 2.6, 0, portalFace + 0.3, 0);
    } else if (F.variant === 2) {
      // shrine: open unleafed arch, glowing interior, flanking window insets
      F.box(0, 0.22, doorZ - 0.15, 2.0, 3.2, 0.3, 0, 0x1a1712, 'bark');
      F.box(0, 1.0, portalFace - 1.1, 1.2, 1.8, 0.3, 0, 0xffb066, 'glow');
      F.box(-1.95, 1.6, portalFace - 0.05, 0.55, 0.75, 0.16, 0, shade(barkC, 0.2), 'bark');
      F.box(1.95, 1.6, portalFace - 0.05, 0.55, 0.75, 0.16, 0, shade(barkC, 0.2), 'bark');
      for (const s of [-1, 1]) {
        F.rod(s * 2.3, 4.2, portalFace - 0.1, s * 2.3, 1.6, portalFace - 0.1, 0.03, rope, 'cloth');
        F.box(s * 2.3, 1.0, portalFace - 0.1, 0.36, 0.6, 0.06, 0, F.pick([0xc9442a, 0xd8a23a]), 'cloth');
      }
      F.furn('br_h_offering_stone', 0, 0, portalFace + 0.35, 0);   /* the offering stump before the arch, on the ground */
    } else {
      // dorm: plank door, row of shuttered windows, washing line
      F.box(0, 0.22, doorZ, 1.6, 2.95, 0.16, 0, 0x6a5238, 'wood');
      const winC = shade(barkC, 0.22);
      for (let i = 0; i < 4; i++) {
        const wx = -2.7 + i * 1.8;
        if (Math.abs(wx) < 1.5) continue;
        F.box(wx, 2.3, portalFace - 1.1, 0.5, 0.5, 0.2, 0, 0x201a14, 'bark');
        F.box(wx + (wx < 0 ? -0.42 : 0.42), 2.24, portalFace - 1.05, 0.38, 0.62, 0.07, wx < 0 ? 0.35 : -0.35, winC, 'wood');
      }
      F.rod(-2.9, 3.4, portalFace - 0.6, 2.9, 3.2, portalFace - 0.6, 0.025, rope, 'cloth');
      for (let i = 0; i < 3; i++) {
        F.box(-1.8 + i * 1.8, 2.6, portalFace - 0.6, 0.6, 0.65, 0.05, F.rr(-0.08, 0.08), F.pick([0xc9442a, 0x2f8f8a, 0xd8d0b8]), 'cloth');
      }
    }
  }
});

ASSET({
  key: 'br_bldg_room_front', name: 'Lower-level room front', culture: 'beast-rider',
  family: 'trade', types: ['shop', 'dwelling-single'], districts: ['mavs-refuge'], wealth: [0, 1],
  w: 12.5, d: 4.6, h: 5.3, variants: 4,
  variantDims: [
    { w: 12.5, d: 4.3, h: 5 },
    { w: 12.5, d: 3.9, h: 5 },
    { w: 12.5, d: 4.6, h: 5 },
    { w: 12.5, d: 4.3, h: 5.3 }
  ],
  build: function (F) {
    F.shift(0, -[0.38, 0.30, 0.52, 0.36][F.variant % 4]); /* centre the footprint on the origin (verify.py declared-size) */
    /* A room cut into the deck level below a platform: real shell — floor,
       ceiling, back and side walls — with the shopfront on the +z face. */
    const hw = 6, hd = 1.5, wallT = 0.2;
    const timber = 0x5e4630, rope = 0x9a8a62;
    const floorT = 0.16, ceilY = 4.4, ceilT = 0.34;
    const innerC = 0x5c4d39, floorC = 0x8a7550;
    const frontZ = hd - wallT / 2;

    // shell
    F.box(0, 0, 0, 12, floorT, 3, 0, floorC, 'wood');
    F.box(0, ceilY, 0, 12, ceilT, 3, 0, shade(floorC, -0.22), 'wood');
    F.box(0, floorT, -hd + wallT / 2, 12, ceilY - floorT, wallT, 0, innerC, 'wood');
    F.box(-hw + wallT / 2, floorT, 0, wallT, ceilY - floorT, 3, 0, shade(innerC, 0.06), 'wood');
    F.box(hw - wallT / 2, floorT, 0, wallT, ceilY - floorT, 3, 0, shade(innerC, 0.06), 'wood');
    // exposed ceiling joists spanning front-to-back
    for (let i = 0; i < 5; i++) {
      const jx = -4.6 + i * 2.3;
      F.beam(jx, ceilY - 0.14, -hd + 0.12, jx, ceilY - 0.14, hd - 0.12, 0.2, 0.2, timber, 'wood');
    }
    /* the back-wall shelf and its stock, the two crates and the wall lamp were loose furniture in the
       planned room: the interiors furnish it (kits/interiors/sets/beast-rider.js) */
    for (let i = 0; i < 12; i++) F.rnd();   /* the stock drew 12: keep the front's stream */
    // rear door to the deeper level
    F.box(2.2, floorT, -hd + wallT - 0.02, 1.1, 2.4, 0.09, 0, 0x3a2f22, 'wood');
    // corner corbels carrying the ceiling over the shopfront
    for (const s of [-1, 1]) {
      F.rod(s * (hw - 0.3), ceilY - 0.05, frontZ, s * (hw - 0.3), ceilY - 1.1, frontZ - 1.0, 0.11, timber, 'wood');
    }
    /* exterior stud frame on the back and ends — the blank faces of a room cut
       into a deck are its carpentry, not a flat slab */
    for (let i = 0; i < 6; i++) {
      F.cyl(-5.0 + i * 2.0, 0, -hd - 0.11, 0.13, ceilY, 0, timber, 'wood');
    }
    F.beam(-5.6, 1.9, -hd - 0.14, 5.6, 1.9, -hd - 0.14, 0.18, 0.18, shade(timber, 0.08), 'wood');
    F.rod(-5.0, 0.2, -hd - 0.18, -3.0, ceilY - 0.2, -hd - 0.18, 0.09, timber, 'wood');
    F.rod(5.0, 0.2, -hd - 0.18, 3.0, ceilY - 0.2, -hd - 0.18, 0.09, timber, 'wood');
    for (const s of [-1, 1]) {
      F.cyl(s * (hw + 0.1), 0, -0.9, 0.13, ceilY, 0, timber, 'wood');
      F.cyl(s * (hw + 0.1), 0, 0.9, 0.13, ceilY, 0, timber, 'wood');
      F.rod(s * (hw + 0.14), 0.3, -0.9, s * (hw + 0.14), ceilY - 0.3, 0.9, 0.08, timber, 'wood');
    }

    if (F.variant === 0) {
      // dwelling front: plank door, shutters, lamp bracket
      const wallC = F.pick([0xb89a6c, 0xa88a5e, 0xc4a878]);
      const doorW = 1.4;
      const segW = (12 - doorW) / 2;
      F.box(-doorW / 2 - segW / 2, floorT, frontZ, segW, 4.24, wallT, 0, wallC, 'wood');
      F.box(doorW / 2 + segW / 2, floorT, frontZ, segW, 4.24, wallT, 0, wallC, 'wood');
      F.box(0, 2.46, frontZ, doorW + 0.2, 1.94, wallT, 0, shade(wallC, -0.15), 'wood');
      // doorway stands open onto the room behind
      F.box(0, floorT, frontZ - 0.02, doorW, 2.3, 0.1, 0, 0x120e0a, 'wood');
      F.box(doorW * 0.62, floorT, frontZ + 0.55, 0.1, 2.3, doorW * 0.9, 0.5, 0x40331f, 'wood');
      F.box(0, 2.4, frontZ + 0.1, doorW + 0.5, 0.18, 0.28, 0, timber, 'wood');
      const winC = shade(wallC, -0.2);
      for (const wx of [-4.3, 4.3]) {
        F.box(wx, 1.6, frontZ + 0.06, 1.25, 1.35, 0.26, 0, 0x241d15, 'wood');
        F.box(wx - 0.92, 1.55, frontZ + 0.2, 0.65, 1.45, 0.08, 0.3, winC, 'wood');
        F.box(wx + 0.92, 1.55, frontZ + 0.2, 0.65, 1.45, 0.08, -0.3, winC, 'wood');
      }
      /* the lamp bracket on the front face, a water butt on the ground before it (the floor ends at hd) */
      F.furn('br_h_lamp_bracket', -1.4, 0, hd + 0.38, 0, { v: 0 });
      F.furn('br_h_water_butt', 5.2, 0, frontZ + 0.55, 0, { v: 0 });
    } else if (F.variant === 1) {
      // workshop front: wide double doors, hoist beam, crates on the sill
      const tarC = 0x6e5238;
      F.box(-1.8, floorT, frontZ, 6.4, 4.24, wallT, 0, tarC, 'wood');
      F.box(3.6, floorT, frontZ, 4.8, 4.24, wallT, 0, tarC, 'wood');
      F.box(-1.7, floorT, frontZ - 0.02, 3.0, 3.4, 0.1, 0, 0x120e0a, 'wood');
      F.box(-0.1, floorT, frontZ + 0.12, 3.0, 3.4, 0.13, 0, shade(0x40331f, 0.04), 'wood');
      // the left leaf stands swung back almost flat against the front
      F.box(-3.2 + 1.5 * Math.sin(1.35), floorT, frontZ + 1.5 * Math.cos(1.35), 0.13, 3.4, 3.0, 1.35, 0x40331f, 'wood');
      F.box(-0.9, 3.6, frontZ, 3.4, 0.8, wallT, 0, shade(tarC, -0.15), 'wood');
      F.beam(-0.9, 3.95, frontZ + 0.55, -0.9, 3.95, frontZ - 1.2, 0.18, 0.18, timber, 'wood');
      F.rod(-0.9, 3.95, frontZ + 0.5, -0.9, 2.6, frontZ + 0.5, 0.025, rope, 'cloth');
      F.box(-0.9, 2.1, frontZ + 0.5, 0.5, 0.5, 0.5, 0.2, 0x7a6a4e, 'wood');
      F.furn('br_h_crate_stack', -3.6, 0, frontZ + 0.55, 0, { v: 1 });   /* crates on the ground before the doors */
      F.furn('br_h_crate_stack', -2.5, 0, frontZ + 0.55, 0, { v: 1 });
      F.box(4.2, 1.7, frontZ + 0.06, 1.4, 1.3, 0.26, 0, 0x241d15, 'wood');
      F.box(4.2, 1.64, frontZ + 0.22, 1.5, 1.42, 0.07, 0, shade(tarC, 0.12), 'cloth');
      F.furn('br_h_water_butt', 5.4, 0, frontZ + 0.5, 0, { v: 0 });
    } else if (F.variant === 2) {
      // market stall front: open counter, awning, goods
      const counterC = 0x7a6a4e, postC = 0x5e4630;
      F.box(0, floorT, frontZ, 12, 1.4, wallT, 0, shade(counterC, -0.08), 'stone');
      F.box(0, 1.56, frontZ + 0.06, 12.2, 0.14, 0.42, 0, counterC, 'wood');
      F.cyl(-5.6, floorT, frontZ, 0.16, 4.24, 0, postC, 'wood');
      F.cyl(5.6, floorT, frontZ, 0.16, 4.24, 0, postC, 'wood');
      F.cyl(0, floorT, frontZ, 0.14, 4.24, 0, postC, 'wood');
      F.cyl(-5.6, 3.5, frontZ, 0.21, 0.14, 0, rope, 'cloth');
      F.cyl(5.6, 3.5, frontZ, 0.21, 0.14, 0, rope, 'cloth');
      F.box(0, 4.42, frontZ + 0.45, 12.3, 0.14, 1.2, 0.06, F.pick([0xc9442a, 0x2f8f8a, 0xd8a23a]), 'cloth');
      /* goods on the counter top (1.7) and gourds hung from the awning (its underside at 4.42) */
      for (let i = 0; i < 5; i++) {
        F.rnd();
        F.furn('br_h_stall_goods', -4.6 + i * 2.3, 1.7, frontZ + 0.06, F.rr(-0.2, 0.2), { v: i % 2 ? 2 : 1 });
        F.rnd();
      }
      for (let i = 0; i < 3; i++) F.furn('br_h_hanging_gourds', -3.5 + i * 3.5, 4.42 - 1.02, frontZ + 0.9, 0, { v: 0 });
    } else {
      // silk/web room: dark boarded front, webbed panels, hooded vent
      const darkC = 0x5e4630, web = 0xe8ecec;
      F.box(0, floorT, frontZ, 12, 4.24, wallT, 0, darkC, 'wood');
      for (let i = 0; i < 4; i++) {
        F.box(F.rr(-4.2, 4.2), F.rr(1.2, 3.2), frontZ + 0.1, F.rr(2.2, 3.4), F.rr(1.4, 2.2), 0.04, F.rr(-0.15, 0.15), F.pick([web, 0xd8dede]), 'cloth');
      }
      F.box(0, floorT, frontZ - 0.02, 1.5, 2.6, 0.1, 0, 0x120e0a, 'wood');
      F.box(-1.15, floorT, frontZ + 0.5, 0.1, 2.6, 1.3, 0.5, 0x2a2016, 'wood');
      F.box(0, 2.76, frontZ + 0.1, 1.9, 0.2, 0.3, 0, shade(darkC, -0.2), 'wood');
      for (const wx of [-4.4, 4.4]) {
        F.box(wx, 1.9, frontZ + 0.06, 1.1, 1.1, 0.26, 0, 0x201a14, 'wood');
        F.box(wx, 1.9, frontZ + 0.19, 1.15, 1.15, 0.04, 0, web, 'cloth');
      }
      F.cone(0, 3.6, frontZ - 0.25, 0.6, 1.1, 0, 0x1a1712, 'bark');
      F.rod(-5.4, 3.6, frontZ + 0.05, 5.4, 3.6, frontZ + 0.05, 0.028, rope, 'cloth');
      F.furn('br_h_water_butt', 5.2, 0, frontZ + 0.55, 0, { v: 0 });
    }
  }
});

/* ================= Girder ================= */

ASSET({
  key: 'br_bldg_girder_tower', name: "Girder tower shell (open cross-section)", culture: 'beast-rider',
  family: 'defensive', types: ['infrastructure', 'dwelling-multi'], districts: ['girder'], wealth: [0, 1],
  w: 26, d: 26, h: 55, variants: 1,
  build: function (F) {
    const rust = [0x7a3b22, 0x8a4526, 0x6a311e];
    const concrete = [0x8a857a, 0x7c786e];
    const hw = 9.5;
    const colPos = [[-hw, -hw], [hw, -hw], [-hw, hw], [hw, hw]];
    const colH = [55, 52, 54, 50.5];
    for (let i = 0; i < 4; i++) {
      F.rod(colPos[i][0], 0, colPos[i][1], colPos[i][0], colH[i], colPos[i][1], 0.55, F.pick(rust), 'rust');
      if (colH[i] < 55) {
        F.rod(colPos[i][0], colH[i], colPos[i][1], colPos[i][0] + F.rr(-1, 1), colH[i] - F.rr(1.5, 3), colPos[i][1] + F.rr(-1, 1), 0.06, 0x6a311e, 'rust');
      }
    }
    // stepped plinth (deliberately wider than the frame — the declared box covers it)
    F.box(0, 0, 0, 26, 1.0, 26, 0, F.pick(concrete), 'concrete');
    F.box(0, 1.0, 0, 23.5, 0.7, 23.5, 0, shade(F.pick(concrete), 0.04), 'concrete');
    // floor plates, each an L-shape with one corner deliberately missing
    const S = hw * 2 - 0.4, s = S / 2, zLo = -s, zHi = s, xLo = -s, xHi = s;
    function ruinedFloor(y) {
      const signX = F.chance(0.5) ? 1 : -1, signZ = F.chance(0.5) ? 1 : -1;
      const notchW = F.rr(6, 9.5), notchD = F.rr(6, 9.5);
      const w1 = S - notchW;
      const cx1 = signX === 1 ? xLo + w1 / 2 : xHi - w1 / 2;
      F.box(cx1, y, 0, w1, 0.5, S, 0, F.pick(concrete), 'concrete');
      const d2 = S - notchD;
      const cx2 = signX === 1 ? xHi - notchW / 2 : xLo + notchW / 2;
      const cz2 = signZ === 1 ? zLo + d2 / 2 : zHi - d2 / 2;
      F.box(cx2, y, cz2, notchW, 0.5, d2, 0, F.pick(concrete), 'concrete');
    }
    const floors = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
    for (let i = 0; i < floors.length; i++) {
      const y = floors[i];
      ruinedFloor(y);
      // spandrel beams on 2 sides just below the plate
      F.beam(-hw, y - 0.5, -hw, hw, y - 0.5, -hw, 0.35, 0.5, F.pick(rust), 'rust');
      F.beam(hw, y - 0.5, -hw, hw, y - 0.5, hw, 0.35, 0.5, F.pick(rust), 'rust');
      // X-brace every 3rd floor on the south face
      if (i % 3 === 2) {
        const yLow = floors[i - 1] || 0;
        F.beam(-hw, yLow, -hw, hw, y, -hw, 0.22, 0.22, F.pick(rust), 'rust');
        F.beam(hw, yLow, -hw, -hw, y, -hw, 0.22, 0.22, F.pick(rust), 'rust');
      }
    }
    // beast-rider occupation: lashed timber ladders and rope runs up the shell
    for (let i = 0; i < 4; i++) {
      const y0 = 1.7 + i * 10, y1 = y0 + 10;
      F.rod(-hw + 1.1, y0, hw - 0.2, -hw + 1.1, y1, hw - 0.2, 0.12, 0x5e4630, 'wood');
      F.rod(-hw + 2.0, y0, hw - 0.2, -hw + 2.0, y1, hw - 0.2, 0.12, 0x5e4630, 'wood');
      F.rod(hw - 0.4, y0 + 3, hw - 0.4, -hw + 0.4, y0 + 6.5, hw - 0.4, 0.05, 0x9a8a62, 'cloth');
    }
  }
});

ASSET({
  key: 'br_bldg_girder_roost_deck', name: 'Girder roost deck (atop a tower)', culture: 'beast-rider',
  family: 'industrial', types: ['infrastructure', 'industry'], districts: ['girder'], wealth: [0, 1],
  w: 30, d: 30, h: 9, variants: 1,
  build: function (F) {
    const timber = 0x6a5c48, deckC = 0x7a6a52, rope = 0x9a8a62;
    const So = 12.5, Si = 8.5, frameW = So - Si;
    F.box(0, 0, -(Si + frameW / 2), So * 2, 0.35, frameW, 0, deckC, 'wood');
    F.box(0, 0, Si + frameW / 2, So * 2, 0.35, frameW, 0, deckC, 'wood');
    F.box(-(Si + frameW / 2), 0, 0, frameW, 0.35, Si * 2 + frameW * 2, 0, deckC, 'wood');
    F.box(Si + frameW / 2, 0, 0, frameW, 0.35, Si * 2 + frameW * 2, 0, deckC, 'wood');

    function edgePt(t) {
      const seg = Math.floor(t * 4), f = t * 4 - seg;
      if (seg === 0) return [-So + 2 * So * f, -So, 0, -1];
      if (seg === 1) return [So, -So + 2 * So * f, 1, 0];
      if (seg === 2) return [So - 2 * So * f, So, 0, 1];
      return [-So, So - 2 * So * f, -1, 0];
    }
    const nStall = 8;
    for (let i = 0; i < nStall; i++) {
      const [x, z, nx, nz] = edgePt((i + 0.5) / nStall);
      const tx = -nz, tz = nx;
      const bx = x - nx * 0.4, bz = z - nz * 0.4;
      const fx = x + nx * 1.4, fz = z + nz * 1.4;
      F.cyl(bx - tx * 0.85, 0.35, bz - tz * 0.85, 0.11, 2.3, 0, timber, 'wood');
      F.cyl(bx + tx * 0.85, 0.35, bz + tz * 0.85, 0.11, 2.3, 0, timber, 'wood');
      F.cyl(fx - tx * 0.85, 0.35, fz - tz * 0.85, 0.11, 1.7, 0, timber, 'wood');
      F.cyl(fx + tx * 0.85, 0.35, fz + tz * 0.85, 0.11, 1.7, 0, timber, 'wood');
      F.box(x + tx * 0.95, 0.35, z + tz * 0.95, 0.09, 1.4, 1.9, Math.atan2(tx, tz), shade(timber, -0.1), 'wood');
      F.beam(bx, 2.65, bz, fx, 2.05, fz, 1.7, 0.12, shade(0x8a7a52, -0.1), 'thatch');
      // cantilevered launch perch, claw-worn
      F.beam(fx, 1.35, fz, fx + nx * 1.3, 1.25, fz + nz * 1.3, 0.16, 0.16, timber, 'wood');
      /* fodder at the back of every other stall, along its back (1 draw kept for the stream) */
      if (i % 2 === 0) { F.rnd(); F.furn('br_h_hay_bales', bx, 0.35, bz, Math.atan2(-tz, tx), { v: 0 }); }
    }

    /* upper structure: mooring masts, stay lines, a windbreak and perch frames —
       the deck declared 9 m and only built 3, so the roost proper was missing */
    const mastPos = [[-11.2, -11.2], [11.2, -11.2], [-11.2, 11.2], [11.2, 11.2]];
    for (const p of mastPos) {
      F.cyl(p[0], 0.35, p[1], 0.22, 8.05, 0, timber, 'wood');
      F.cyl(p[0], 3.2, p[1], 0.28, 0.18, 0, rope, 'cloth');
      F.cyl(p[0], 6.4, p[1], 0.28, 0.18, 0, rope, 'cloth');
      F.ball(p[0], 8.62, p[1], 0.3, shade(timber, -0.18), 'wood');
      // stay down to the deck
      F.rod(p[0], 8.1, p[1], p[0] * 0.48, 0.5, p[1] * 0.48, 0.05, rope, 'cloth');
    }
    // mooring lines round the mast heads
    for (let i = 0; i < 4; i++) {
      const a = mastPos[[0, 1, 3, 2][i]], b = mastPos[[1, 3, 2, 0][i]];
      F.rod(a[0], 7.9, a[1], b[0], 7.9, b[1], 0.05, rope, 'cloth');
    }
    // pennants on two masts
    for (const p of [mastPos[0], mastPos[3]]) {
      F.box(p[0] + 0.5, 6.9, p[1], 1.0, 0.7, 0.05, 0, F.pick([0xc9442a, 0x2f8f8a, 0xd8a23a]), 'cloth');
    }
    // windbreak screen on the weather side
    for (let i = 0; i < 4; i++) {
      const wx = -9.0 + i * 6.0;
      F.cyl(wx, 0.35, -11.4, 0.14, 3.0, 0, timber, 'wood');
      if (i < 3) F.box(wx + 3.0, 0.5, -11.4, 5.6, 2.6, 0.12, 0, F.pick([0x9a8a52, 0xb0894a]), 'cloth');
    }
    F.beam(-9.0, 3.35, -11.4, 9.0, 3.35, -11.4, 0.18, 0.18, timber, 'wood');
    // perch A-frames straddling the inner void
    for (let i = 0; i < 3; i++) {
      const px = -7.0 + i * 7.0;
      F.rod(px, 0.35, -9.6, px, 4.3, 0, 0.13, timber, 'wood');
      F.rod(px, 0.35, 9.6, px, 4.3, 0, 0.13, timber, 'wood');
      F.cyl(px, 4.1, 0, 0.2, 0.16, 0, rope, 'cloth');
    }
    F.rod(-7.0, 4.25, 0, 7.0, 4.25, 0, 0.2, shade(timber, -0.12), 'wood');
    // rail round the inner void
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * TAU;
      const rx = Math.cos(a) * 8.2, rz = Math.sin(a) * 8.2;
      F.cyl(rx, 0.35, rz, 0.09, 1.1, 0, timber, 'wood');
    }
    for (const s of [-1, 1]) {
      F.rod(-8.2, 1.4, s * 8.2, 8.2, 1.4, s * 8.2, 0.05, rope, 'cloth');
      F.rod(s * 8.2, 1.4, -8.2, s * 8.2, 1.4, 8.2, 0.05, rope, 'cloth');
    }
    // keeper's shelter in one corner
    F.box(9.2, 0.35, 9.2, 4.2, 2.2, 4.2, 0, 0x8a7550, 'wood');
    F.box(9.2, 0.35, 11.25, 1.2, 1.9, 0.1, 0, 0x40331f, 'wood');
    F.pyrRoof(9.2, 2.55, 9.2, 5.4, 1.3, 5.4, 0, 0x6a5a44, 'thatch');
    F.cyl(9.2, 3.85, 9.2, 0.18, 0.4, 0, 0x3a2f22, 'wood');
    // water butt + feed barrel
    F.furn('br_h_water_butt', -8.95, 0.35, 10.05, 0, { v: 1 });
  }
});

ASSET({
  key: 'br_bldg_girder_dwelling', name: 'Girder dwelling (tower-slot shell)', culture: 'beast-rider',
  family: 'housing', types: ['dwelling-multi'], districts: ['girder'], wealth: [0, 1],
  w: 11, d: 11.6, h: 6.4, variants: 5,
  variantDims: [
    { w: 10.7, d: 11.4, h: 4.7 },
    { w: 10.7, d: 10.9, h: 4.7 },
    { w: 11, d: 11.6, h: 4.4 },
    { w: 10.6, d: 10.6, h: 5.6 },
    { w: 9.8, d: 9.8, h: 6.4 }
  ],
  build: function (F) {
    const W = 9, D = 9, hw = 4.5, hd = 4.5, wallT = 0.18;
    const timber = 0x5e4630, rope = 0x9a8a62;
    const wallC = 0x9a8358;
    const backH = 3.6, frontH = 3.0;
    const openC = 0x241d15, shutC = shade(wallC, -0.28);
    const lash = (x, y, z, r) => F.cyl(x, y, z, r + 0.05, 0.13, 0, rope, 'cloth');

    if (F.variant === 2) {
      // workshop: open front, half-height counter, awning, tool wall
      F.box(-hw + wallT / 2, 0, 0, wallT, backH, D, 0, wallC, 'wood');
      F.box(hw - wallT / 2, 0, 0, wallT, backH, D, 0, wallC, 'wood');
      F.box(0, 0, -hd + wallT / 2, W, backH, wallT, 0, wallC, 'wood');
      F.box(0, 0, hd - 1.3, W - 1.0, backH * 0.5, 0.34, 0, shade(wallC, -0.1), 'wood');
      F.box(0, backH * 0.5, hd - 1.3, W - 0.6, 0.12, 0.5, 0, timber, 'wood');
      F.cyl(-hw + 0.5, 0, hd - 0.2, 0.15, backH, 0, timber, 'wood');
      F.cyl(hw - 0.5, 0, hd - 0.2, 0.15, backH, 0, timber, 'wood');
      lash(-hw + 0.5, backH - 0.5, hd - 0.2, 0.15);
      lash(hw - 0.5, backH - 0.5, hd - 0.2, 0.15);
      // rafters with exposed tails + thatch in three overlapping courses
      for (let i = 0; i < 5; i++) {
        const rx = -4.6 + i * 2.3;
        F.beam(rx, backH + 0.28, -hd - 0.95, rx, frontH + 0.28, hd + 0.95, 0.16, 0.16, timber, 'wood');
      }
      const wy0 = backH + 0.45, wy1 = frontH + 0.45, wzA = -hd - 0.7, wzB = hd + 0.7;
      for (let i = 0; i < 3; i++) {
        const t0 = i / 3, t1 = (i + 1) / 3 + (i < 2 ? 0.06 : 0);
        const za = wzB + (wzA - wzB) * t0, zb = wzB + (wzA - wzB) * t1;
        const ya = wy1 + (wy0 - wy1) * t0 + i * 0.07, yb = wy1 + (wy0 - wy1) * t1 + i * 0.07;
        F.beam(0, ya, za, 0, yb, zb, 10.0, 0.18, shade(0x6a5a44, i === 1 ? -0.05 : 0), 'thatch');
      }
      F.beam(-5.0, wy0 + 0.26, wzA + 0.05, 5.0, wy0 + 0.26, wzA + 0.05, 0.2, 0.2, shade(0x6a5a44, -0.25), 'wood');
      // awning over the counter
      F.beam(0, backH + 0.1, hd - 0.3, 0, frontH - 0.5, hd + 1.7, W - 0.4, 0.14, F.pick([0xc9442a, 0x2f8f8a]), 'cloth');
      F.rod(-4.0, frontH - 0.45, hd + 1.65, -4.0, 0, hd + 1.65, 0.05, timber, 'wood');
      F.rod(4.0, frontH - 0.45, hd + 1.65, 4.0, 0, hd + 1.65, 0.05, timber, 'wood');
      /* the tool rack on the back wall was loose furniture in the planned workshop: the interiors furnish
         it (kits/interiors/sets/beast-rider.js). The forge stack outside is built masonry */
      for (let i = 0; i < 5; i++) F.rnd();   /* the tools drew 5: keep the stack's stream */
      for (let i = 0; i < 4; i++) F.box(hw + 0.22, i * 0.8, -hd + 1.2, 0.5, 0.76, 0.6, F.rr(-0.04, 0.04), shade(0x8a857a, F.rr(-0.06, 0.06)), 'stone');
      // side openings and shutters
      F.box(-hw - 0.03, 1.6, -1.2, 0.1, 1.1, 1.1, 0, openC, 'wood');
      F.box(-hw - 0.16, 1.5, -0.3, 0.07, 1.3, 0.6, -0.3, shutC, 'wood');
      F.box(0, 1.7, -hd - 0.03, 1.2, 1.0, 0.1, 0, openC, 'wood');
      // stock outside
      F.furn('br_h_crate_stack', -hw - 0.6, 0, hd - 1.0, 0.2, { v: 1 });
      F.furn('br_h_water_butt', hw + 0.5, 0, hd - 0.6, 0, { v: 0 });
    } else if (F.variant === 3) {
      // common: open pavilion, carved corner posts, cloth awning roof
      F.box(0, 0, 0, 8.6, 0.22, 8.6, 0, 0x8a7550, 'wood');
      const cposts = [[-hw + 0.3, -hd + 0.3], [hw - 0.3, -hd + 0.3], [-hw + 0.3, hd - 0.3], [hw - 0.3, hd - 0.3]];
      for (const c of cposts) {
        F.cyl(c[0], 0.22, c[1], 0.2, backH, 0, 0x8a2f2a, 'wood');
        F.cyl(c[0], 0.22 + backH * 0.4, c[1], 0.24, 0.1, 0, 0xb08432, 'wood');
        F.cyl(c[0], 0.22 + backH, c[1], 0.22, 0.1, 0, 0xb08432, 'wood');
        lash(c[0], 0.22 + backH - 0.6, c[1], 0.2);
      }
      // low rails and a bench round three sides
      for (const s of [[-1, 0], [1, 0], [0, -1]]) {
        const ax = s[0] ? s[0] * (hw - 0.3) : -(hw - 0.3), az = s[1] ? s[1] * (hd - 0.3) : -(hd - 0.3);
        const bx = s[0] ? s[0] * (hw - 0.3) : (hw - 0.3), bz = s[1] ? s[1] * (hd - 0.3) : (hd - 0.3);
        F.rod(ax, 1.05, az, bx, 1.05, bz, 0.06, shade(timber, 0.1), 'wood');
        F.box((ax + bx) / 2, 0.22, (az + bz) / 2, s[1] ? 8.0 : 0.5, 0.45, s[1] ? 0.5 : 8.0, 0, 0x8a7550, 'wood');
      }
      F.pyrRoof(0, 0.22 + backH, 0, 10.4, 1.7, 10.4, 0, 0xc9a24a, 'cloth');
      for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
        F.rod(s[0] * 5.2, 0.22 + backH + 0.05, s[1] * 5.2, 0, 0.22 + backH + 1.7, 0, 0.08, shade(0xc9a24a, -0.3), 'wood');
      }
      F.beam(-5.2, 0.22 + backH, -5.2, 5.2, 0.22 + backH, -5.2, 0.18, 0.18, shade(0xc9a24a, -0.3), 'wood');
      F.beam(-5.2, 0.22 + backH, 5.2, 5.2, 0.22 + backH, 5.2, 0.18, 0.18, shade(0xc9a24a, -0.3), 'wood');
      // hanging lanterns at the eave corners (outside the planned room)
      for (const s of [[-1, -1], [1, 1]]) F.furn('br_h_hanging_lantern', s[0] * 4.4, 0.22 + backH - 0.95, s[1] * 4.4, 0.1, { v: 0 });
      /* the low table at the centre: the planned room's fixture, so the building places it */
      F.furn('br_common_low_table', 0, 0.22, 0, 0);
    } else if (F.variant === 4) {
      // shrine: tajug on a plinth, red/gilt posts, glow windows, two-tier roof
      F.box(0, 0, 0, 8.1, 0.4, 8.1, 0, 0x9a9484, 'stone');
      F.box(0, 0.4, 0, 7.2, 0.18, 7.2, 0, shade(0x9a9484, 0.06), 'stone');
      const cposts = [[-hw + 0.6, -hd + 0.6], [hw - 0.6, -hd + 0.6], [-hw + 0.6, hd - 0.6], [hw - 0.6, hd - 0.6]];
      for (const c of cposts) {
        F.cyl(c[0], 0.58, c[1], 0.2, 2.75, 0, 0x8a2f2a, 'wood');
        F.box(c[0], 3.33, c[1], 0.32, 0.16, 0.32, 0, 0xb08432, 'wood');
        lash(c[0], 2.6, c[1], 0.2);
      }
      // low screen walls on the back and sides so it reads from behind
      F.box(0, 0.58, -hd + 0.6, 7.2, 1.5, 0.16, 0, shade(0x9a8358, -0.1), 'wood');
      F.box(-hw + 0.6, 0.58, 0, 0.16, 1.5, 7.2, 0, shade(0x9a8358, -0.1), 'wood');
      F.box(hw - 0.6, 0.58, 0, 0.16, 1.5, 7.2, 0, shade(0x9a8358, -0.1), 'wood');
      F.box(-1.2, 1.4, hd - 0.62, 0.5, 0.6, 0.12, 0, 0xffb066, 'glow');
      F.box(1.2, 1.4, hd - 0.62, 0.5, 0.6, 0.12, 0, 0xffb066, 'glow');
      /* the built altar (the planned room's fixture) and the offerings on it, as catalog furniture:
         two brass votive bowls and a wooden bowl between them */
      F.box(0, 0.58, -hd + 1.3, 2.2, 0.9, 0.8, 0, 0x7a6a4e, 'wood');
      for (const x of [-0.6, 0.6]) F.furn('br_h_offering_bowl', x, 1.48, -hd + 1.3, 0, { v: 1 });
      F.furn('br_h_offering_bowl', 0, 1.48, -hd + 1.3, 0, { v: 0 });
      // banners on the front posts
      for (const s of [-1, 1]) {
        F.box(s * (hw - 0.6), 1.9, hd - 0.42, 0.06, 1.3, 0.5, 0, F.pick([0xc9442a, 0xd8a23a]), 'cloth');
      }
      F.pyrRoof(0, 3.49, 0, 9.6, 1.4, 9.6, 0, 0x6a5a44, 'thatch');
      for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) F.rod(s[0] * 4.8, 3.54, s[1] * 4.8, 0, 4.89, 0, 0.07, shade(0x6a5a44, -0.3), 'wood');
      F.beam(-4.8, 3.49, -4.8, 4.8, 3.49, -4.8, 0.17, 0.17, shade(0x6a5a44, -0.25), 'wood');
      F.beam(-4.8, 3.49, 4.8, 4.8, 3.49, 4.8, 0.17, 0.17, shade(0x6a5a44, -0.25), 'wood');
      F.pyrRoof(0, 4.75, 0, 5.0, 1.2, 5.0, 0, shade(0x6a5a44, -0.06), 'thatch');
      F.cyl(0, 5.95, 0, 0.16, 0.25, 0, 0x3a2f22, 'wood');
      F.cone(0, 6.05, 0, 0.18, 0.35, 0, 0xb08432, 'metal');
    } else {
      // home / store: 4-wall box with a proper rafter roof and eaves all round
      F.box(0, 0, 0, W + 0.5, 0.18, D + 0.5, 0, 0x8a7550, 'wood');
      const cpost = [[-hw + 0.25, -hd + 0.25], [hw - 0.25, -hd + 0.25], [-hw + 0.25, hd - 0.25], [hw - 0.25, hd - 0.25]];
      for (const c of cpost) {
        F.cyl(c[0], 0.18, c[1], 0.15, backH - 0.2, 0, timber, 'wood');
        lash(c[0], 0.18 + backH - 0.9, c[1], 0.15);
      }
      F.box(-hw + wallT / 2, 0.18, 0, wallT, backH, D, 0, wallC, 'wood');
      F.box(hw - wallT / 2, 0.18, 0, wallT, backH, D, 0, wallC, 'wood');
      F.box(0, 0.18, -hd + wallT / 2, W, backH, wallT, 0, wallC, 'wood');
      const doorW = F.variant === 1 ? 2.0 : 1.4;
      const segW = (W - doorW) / 2;
      F.box(-doorW / 2 - segW / 2, 0.18, hd - wallT / 2, segW, frontH, wallT, 0, wallC, 'wood');
      F.box(doorW / 2 + segW / 2, 0.18, hd - wallT / 2, segW, frontH, wallT, 0, wallC, 'wood');
      F.box(0, 0.18 + frontH - 0.6, hd - wallT / 2, doorW + 0.2, 0.6, wallT, 0, shade(wallC, -0.15), 'wood');
      F.box(0, 0.18, hd - wallT / 2 - 0.02, doorW * 0.88, frontH - 0.6, 0.06, 0, 0x40331f, 'wood');
      // openings + shutters on the two flanks and the back
      F.box(-hw - 0.03, 1.55, -1.1, 0.1, 1.1, 1.15, 0, openC, 'wood');
      F.box(-hw - 0.16, 1.45, -0.2, 0.07, 1.3, 0.62, -0.32, shutC, 'wood');
      F.box(hw + 0.03, 1.55, 1.1, 0.1, 1.1, 1.15, 0, openC, 'wood');
      F.box(hw + 0.15, 1.45, 2.0, 0.07, 1.3, 0.62, 0.32, shutC, 'wood');
      F.box(-1.6, 1.7, -hd - 0.03, 1.1, 1.0, 0.1, 0, openC, 'wood');
      F.box(-1.6, 1.62, -hd - 0.16, 1.2, 1.16, 0.07, 0, shade(shutC, 0.1), 'cloth');
      if (F.variant === 1) {
        F.box(-1.6, 1.9, hd - wallT / 2, 0.5, 0.5, 0.1, 0, shade(wallC, -0.28), 'wood');
        F.box(1.6, 1.9, hd - wallT / 2, 0.5, 0.5, 0.1, 0, shade(wallC, -0.28), 'wood');
        F.rod(0, 0.18 + frontH + 0.1, hd - 0.3, 0, 0.18 + frontH - 0.5, hd + 0.7, 0.025, timber, 'wood');
        F.box(0, 0.18 + frontH - 0.7, hd + 0.7, 0.7, 0.4, 0.05, 0, 0x7a6a4e, 'wood');
        F.furn('br_h_crate_stack', -3.0, 0, hd + 0.55, 0.18, { v: 1 });   /* on the ground: the slab ends at hd + 0.25 */
      } else {
        F.box(-1.4, 1.5, hd - wallT / 2, 0.6, 0.6, 0.1, 0, shade(wallC, -0.28), 'wood');
        // veranda bench and rail
        F.box(0, 0.18, hd + 0.75, W * 0.7, 0.12, 1.5, 0, shade(wallC, 0.04), 'wood');
        F.rod(-W * 0.32, 0.3, hd + 1.45, -W * 0.32, 1.15, hd + 1.45, 0.05, timber, 'wood');
        F.rod(W * 0.32, 0.3, hd + 1.45, W * 0.32, 1.15, hd + 1.45, 0.05, timber, 'wood');
        F.rod(-W * 0.32, 1.1, hd + 1.45, W * 0.32, 1.1, hd + 1.45, 0.035, timber, 'wood');
      }
      /* rafters with exposed tails, then the thatch in three overlapping
         courses so the pitch is not one blank plane */
      for (let i = 0; i < 5; i++) {
        const rx = -4.6 + i * 2.3;
        F.beam(rx, 0.18 + backH + 0.3, -hd - 1.0, rx, 0.18 + frontH + 0.3, hd + 1.0, 0.16, 0.16, timber, 'wood');
      }
      const ry0 = 0.18 + backH + 0.48, ry1 = 0.18 + frontH + 0.48, zA = -hd - 0.72, zB = hd + 0.72;
      for (let i = 0; i < 3; i++) {
        const t0 = i / 3, t1 = (i + 1) / 3 + (i < 2 ? 0.06 : 0);
        const za = zB + (zA - zB) * t0, zb = zB + (zA - zB) * t1;
        const ya = ry1 + (ry0 - ry1) * t0 + i * 0.07, yb = ry1 + (ry0 - ry1) * t1 + i * 0.07;
        F.beam(0, ya, za, 0, yb, zb, 10.0, 0.2, shade(0x6a5a44, i === 1 ? -0.05 : 0), 'thatch');
      }
      F.beam(-5.0, ry0 + 0.24, zA + 0.05, 5.0, ry0 + 0.24, zA + 0.05, 0.22, 0.22, shade(0x6a5a44, -0.25), 'wood');
      F.beam(-5.0, ry1 + 0.1, zB - 0.05, 5.0, ry1 + 0.1, zB - 0.05, 0.22, 0.22, shade(0x6a5a44, -0.25), 'wood');
      // weight stones along the ridge
      for (let i = 0; i < 3; i++) F.box(-2.6 + i * 2.6, ry0 + 0.3, -hd + 0.3, 0.45, 0.3, 0.45, F.rr(0, 1), 0x8a857a, 'stone');
      // service clutter: a water butt by the back-left corner, a drying rack along the right flank
      F.furn('br_h_water_butt', -hw - 0.55, 0, -hd + 1.1, 0, { v: 0 });
      F.furn('br_drying_rack', hw + 0.7, 0, 0, -Math.PI / 2);
    }
  }
});

ASSET({
  key: 'br_bldg_girder_assembly_hall', name: 'Girder Assembly Hall', culture: 'beast-rider',
  family: 'civic', types: ['civic'], districts: ['girder'], wealth: [0, 1],
  w: 30, d: 30, h: 26, variants: 1,
  build: function (F) {
    const wallC = 0xb89a6c, red = 0x7a2028, gilt = 0xb08432, timber = 0x5e4630, rope = 0x9a8a62;
    const stone = 0x9a9484;
    F.cyl(0, 0, 0, 15, 0.6, 0, stone, 'stone');
    F.cyl(0, 0.6, 0, 13.5, 0.5, 0, shade(stone, 0.05), 'stone');
    const R = 13.0, wallH = 8.0, wallThick = 0.5, nSeg = 12;
    const arcLen = 2 * Math.PI * R / nSeg, segW = arcLen * 0.92;
    F.cyl(1.1, 0, 0, R + 0.3, 0.35, 0, red, 'wood');
    F.cyl(1.1, wallH - 0.35, 0, R + 0.3, 0.35, 0, red, 'wood');
    for (let i = 0; i < nSeg; i++) {
      const theta = i / nSeg * TAU;
      const cx = Math.cos(theta) * R, cz = Math.sin(theta) * R;
      const ry = -theta - Math.PI / 2;
      if (i % 3 === 0) {
        F.box(cx, 1.1, cz, segW * 0.85, 3.2, 0.14, ry, red, 'wood');
        F.box(cx, 4.3, cz, segW * 0.85, 0.28, 0.3, ry, gilt, 'wood');
      } else {
        F.box(cx, 1.1, cz, segW, wallH, wallThick, ry, wallC, 'wood');
        F.box(cx, 5.0, cz, segW * 0.5, 1.4, 0.2, ry, shade(wallC, -0.32), 'wood');
      }
    }
    const colN = 18, colR = 14.5;
    for (let i = 0; i < colN; i++) {
      const a = i / colN * TAU;
      const x = Math.cos(a) * colR, z = Math.sin(a) * colR;
      F.cyl(x, 1.1, z, 0.17, wallH, 0, i % 2 === 0 ? red : timber, 'wood');
      F.cyl(x, 1.1 + wallH, z, 0.22, 0.12, 0, gilt, 'wood');
      if (i % 3 === 0) F.cyl(x, 1.1 + wallH - 0.8, z, 0.22, 0.13, 0, rope, 'cloth');
    }
    let y = 1.1 + wallH;
    /* bottom tier now clears the colonnade by ~1 m, as a wet-forest roof must */
    F.pyrRoof(0, y, 0, 30.0, 5.6, 30.0, 0, 0x6a5a44, 'thatch');
    F.beam(-15, y, -15, 15, y, -15, 0.3, 0.3, shade(0x6a5a44, -0.25), 'wood');
    F.beam(-15, y, 15, 15, y, 15, 0.3, 0.3, shade(0x6a5a44, -0.25), 'wood');
    F.beam(-15, y, -15, -15, y, 15, 0.3, 0.3, shade(0x6a5a44, -0.25), 'wood');
    F.beam(15, y, -15, 15, y, 15, 0.3, 0.3, shade(0x6a5a44, -0.25), 'wood');
    for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) F.rod(s[0] * 15, y + 0.1, s[1] * 15, 0, y + 5.6, 0, 0.11, shade(0x6a5a44, -0.3), 'wood');
    y += 5.6;
    F.cyl(0, y, 0, 5.9, 1.6, 0, 0x5a4a38, 'wood');
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * TAU + 0.3;
      F.box(Math.cos(a) * 5.92, y + 0.35, Math.sin(a) * 5.92, 0.14, 0.9, 1.5, -a, 0xffb066, 'glow');
    }
    y += 1.6;
    F.pyrRoof(0, y, 0, 15.5, 4.3, 15.5, 0, 0x5a4a38, 'thatch'); y += 4.3;
    F.cyl(0, y, 0, 3.0, 0.8, 0, 0x6a5a44, 'wood'); y += 0.8;
    F.pyrRoof(0, y, 0, 7.5, 3.4, 7.5, 0, 0x6a5a44, 'thatch'); y += 3.4;
    F.cone(0, y, 0, 0.5, 1.4, 0, gilt, 'metal');
    F.rod(-0.7, y + 0.7, 0, 0.7, y + 0.7, 0, 0.03, gilt, 'metal');
    F.rod(0, y + 0.7, -0.7, 0, y + 0.7, 0.7, 0.03, gilt, 'metal');
  }
});

ASSET({
  key: 'br_bldg_girder_house', name: 'Girder ground house', culture: 'beast-rider',
  family: 'housing', types: ['dwelling-single'], districts: ['girder'], wealth: [0, 1],
  w: 15.5, d: 13, h: 8, variants: 3,
  variantDims: [
    { w: 14, d: 12, h: 8 },
    { w: 14, d: 12, h: 8 },
    { w: 15.5, d: 13, h: 8 }
  ],
  build: function (F) {
    const rope = 0x9a8a62, timber = 0x5e4630;
    if (F.variant === 0) {
      // roundhut: woven wall, two-tier thatch cone roof, satellite mini huts
      const wovenC = 0xa88a5e;
      const hut = (cx, cz, s) => {
        F.cyl(cx, 0, cz, 3.6 * s, 2.8 * s, 0, wovenC, 'wood');
        for (let i = 0; i < 3; i++) F.cyl(cx, (0.55 + i * 0.85) * s, cz, 3.66 * s, 0.13 * s, 0, shade(wovenC, -0.22), 'wood');
        F.cone(cx, 2.8 * s, cz, 4.2 * s, 2.4 * s, 0, 0x6a5a44, 'thatch');
        F.cyl(cx, 5.2 * s, cz, 0.5 * s, 0.4 * s, 0, 0x3a2f22, 'wood');
        F.cone(cx, 5.6 * s, cz, 3.4 * s, 1.9 * s, 0, shade(0x6a5a44, -0.06), 'thatch');
        F.cone(cx, 7.5 * s, cz, 0.24 * s, 0.5 * s, 0, 0x3a2f22, 'wood');
      };
      hut(0, 0, 1.0);
      hut(-5.0, 3.6, 0.55);
      hut(4.6, -4.0, 0.48);
      // main doorway with a lintel and jambs
      F.box(0, 0, 3.5, 1.5, 2.2, 0.3, 0, 0x241d15, 'wood');
      F.box(0, 2.2, 3.55, 2.1, 0.26, 0.4, 0, timber, 'wood');
      F.cyl(-0.95, 0, 3.55, 0.14, 2.35, 0, timber, 'wood');
      F.cyl(0.95, 0, 3.55, 0.14, 2.35, 0, timber, 'wood');
      // a second low opening on the far side so it reads from behind
      F.box(-2.2, 0, -2.9, 1.0, 1.5, 0.3, -0.9, 0x241d15, 'wood');
      /* the yard, as catalog furniture: a drying frame between (5.4, 2.6) and (3.2, 4.6), a water butt
         behind, three gourds hung under the eave (the cone's underside at r 3.9 is ~2.97 up) */
      F.furn('br_h_cloth_line', 4.3, 0, 3.6, Math.atan2(2.0, 2.2), { v: 0 });
      F.furn('br_h_water_butt', -3.4, 0, -4.4, 0, { v: 0 });
      for (let i = 0; i < 3; i++) {
        const a = 2.2 + i * 0.5;
        F.furn('br_h_hanging_gourds', Math.cos(a) * 3.9, 2.97 - 1.02, Math.sin(a) * 3.9, 0, { v: 0 });
      }
    } else if (F.variant === 1) {
      // joglo: stone plinth, open pendopo, carved posts, two-tier roof
      const stone = 0x9a9484;
      F.box(0, 0, 0, 12.5, 0.5, 10.5, 0, stone, 'stone');
      F.box(0, 0.5, 0, 11.4, 0.16, 9.6, 0, shade(stone, 0.08), 'stone');
      const posts = [[-4.5, -3.6], [4.5, -3.6], [-4.5, 3.6], [4.5, 3.6], [0, -3.6], [0, 3.6]];
      for (const p of posts) {
        F.cyl(p[0], 0.66, p[1], 0.22, 3.24, 0, 0x8a2f2a, 'wood');
        F.box(p[0], 3.9, p[1], 0.34, 0.16, 0.34, 0, 0xb08432, 'wood');
        F.cyl(p[0], 3.2, p[1], 0.27, 0.14, 0, rope, 'cloth');
      }
      // screen walls on two sides, a rail on the others
      F.box(0, 0.66, -3.6, 9.4, 2.1, 0.18, 0, shade(0xa88a5e, -0.06), 'wood');
      F.box(-4.5, 0.66, 0, 0.18, 2.1, 7.4, 0, shade(0xa88a5e, -0.06), 'wood');
      F.box(-4.5 + 0.12, 1.3, -1.4, 0.1, 0.9, 1.0, 0, 0x241d15, 'wood');
      F.rod(4.5, 1.0, -3.6, 4.5, 1.0, 3.6, 0.06, timber, 'wood');
      F.rod(-4.5, 1.0, 3.6, 4.5, 1.0, 3.6, 0.06, timber, 'wood');
      F.box(0, 0.66, 2.6, 6.0, 0.4, 1.6, 0, 0x8a7550, 'wood');
      F.pyrRoof(0, 3.9, 0, 13.8, 1.7, 11.8, 0, 0x6a5a44, 'thatch');
      F.beam(-6.9, 3.9, -5.9, 6.9, 3.9, -5.9, 0.2, 0.2, shade(0x6a5a44, -0.25), 'wood');
      F.beam(-6.9, 3.9, 5.9, 6.9, 3.9, 5.9, 0.2, 0.2, shade(0x6a5a44, -0.25), 'wood');
      F.beam(-6.9, 3.9, -5.9, -6.9, 3.9, 5.9, 0.2, 0.2, shade(0x6a5a44, -0.25), 'wood');
      F.beam(6.9, 3.9, -5.9, 6.9, 3.9, 5.9, 0.2, 0.2, shade(0x6a5a44, -0.25), 'wood');
      F.pyrRoof(0, 5.5, 0, 6.8, 1.9, 5.8, 0, shade(0x6a5a44, -0.06), 'thatch');
      F.box(0, 7.35, 0, 5.4, 0.16, 0.16, 0, 0xb08432, 'metal');
      F.cone(0, 7.35, 0, 0.14, 0.55, 0, 0xb08432, 'metal');
      // lanterns hung from the eave, outside the pendopo
      for (const s of [-1, 1]) F.furn('br_h_hanging_lantern', s * 5.6, 3.9 - 0.95, 4.4, 0, { v: 0 });
    } else {
      // longhouse: tarred wall hall on stone plinth, exposed beams, deep eaves
      const stone = 0x9a9484, tarC = 0x6e5238;
      F.box(0, 0, 0, 13.5, 0.4, 11, 0, stone, 'stone');
      F.box(0, 0.4, 0, 13, 3.4, 10.5, 0, tarC, 'wood');
      for (let i = 0; i < 5; i++) {
        const bz = -4.6 + i * 2.3;
        F.beam(-6.3, 1.5, bz, 6.3, 1.5, bz, 0.5, 0.24, shade(timber, F.rr(-0.06, 0.06)), 'wood');
      }
      // door + shuttered openings on every elevation
      F.box(0, 0.4, 5.3, 1.6, 2.5, 0.16, 0, 0x40331f, 'wood');
      F.box(0, 2.9, 5.35, 2.2, 0.26, 0.4, 0, timber, 'wood');
      for (const wx of [-4.0, 4.0]) {
        F.box(wx, 1.9, 5.3, 1.1, 1.0, 0.12, 0, 0x241d15, 'wood');
        F.box(wx + (wx < 0 ? -0.85 : 0.85), 1.82, 5.42, 0.6, 1.16, 0.08, wx < 0 ? 0.3 : -0.3, shade(tarC, 0.16), 'wood');
      }
      for (const wz of [-2.6, 2.6]) {
        F.box(-6.55, 1.9, wz, 0.12, 1.0, 1.1, 0, 0x241d15, 'wood');
        F.box(6.55, 1.9, wz, 0.12, 1.0, 1.1, 0, 0x241d15, 'wood');
        F.box(-6.68, 1.82, wz, 0.08, 1.16, 1.2, 0, shade(tarC, 0.16), 'cloth');
        F.box(6.68, 1.82, wz, 0.08, 1.16, 1.2, 0, shade(tarC, 0.16), 'cloth');
      }
      F.box(-3.0, 1.9, -5.3, 1.1, 1.0, 0.12, 0, 0x241d15, 'wood');
      F.box(3.0, 0.4, -5.3, 1.2, 2.2, 0.14, 0, 0x40331f, 'wood');
      F.pyrRoof(0, 3.8, 0, 15.4, 3.6, 12.8, 0, shade(tarC, -0.1), 'thatch');
      F.beam(-7.7, 3.8, -6.4, 7.7, 3.8, -6.4, 0.24, 0.24, shade(tarC, -0.3), 'wood');
      F.beam(-7.7, 3.8, 6.4, 7.7, 3.8, 6.4, 0.24, 0.24, shade(tarC, -0.3), 'wood');
      F.beam(-7.7, 3.8, -6.4, -7.7, 3.8, 6.4, 0.24, 0.24, shade(tarC, -0.3), 'wood');
      F.beam(7.7, 3.8, -6.4, 7.7, 3.8, 6.4, 0.24, 0.24, shade(tarC, -0.3), 'wood');
      for (const s of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) F.rod(s[0] * 7.7, 3.85, s[1] * 6.4, 0, 7.4, 0, 0.1, shade(tarC, -0.35), 'wood');
      F.box(0, 7.2, 0, 0.36, 0.18, 3.0, 0, 0x3a2f22, 'wood');
      const gables = [[0, -5.9], [0, 5.9]];
      for (const g of gables) {
        F.rod(g[0] - 0.5, 6.7, g[1], g[0] + 0.5, 7.4, g[1], 0.05, 0x3a2f22, 'wood');
        F.rod(g[0] + 0.5, 6.7, g[1], g[0] - 0.5, 7.4, g[1], 0.05, 0x3a2f22, 'wood');
      }
      F.furn('br_h_water_butt', -6.0, 0, 6.0, 0, { v: 0 });
      F.furn('br_h_crate_stack', 5.6, 0, 5.9, 0.2, { v: 1 });
    }
  }
});

ASSET({
  key: 'br_bldg_girder_palisade', name: 'Girder palisade + watch tower', culture: 'beast-rider',
  family: 'defensive', types: ['infrastructure'], districts: ['girder'], wealth: [0, 1],
  w: 16, d: 4.5, h: 12, variants: 1,
  build: function (F) {
    F.shift(0, 0.40); /* centre the footprint on the origin (verify.py declared-size) */
    const timber = 0x5e4630, rope = 0x9a8a62;
    const nStake = 16;
    for (let i = 0; i < nStake; i++) {
      const x = -7.4 + i * (14.8 / (nStake - 1));
      const stH = F.rr(2.6, 3.3);
      F.cyl(x, 0, 0, 0.13, stH, 0, shade(timber, F.rr(-0.05, 0.05)), 'wood');
      if (i % 2 === 0) F.cone(x, stH, 0, 0.15, 0.45, 0, shade(timber, -0.08), 'wood');
    }
    // outer leaning stakes / cheval
    for (let i = 0; i < 3; i++) {
      const sx = -5.0 + i * 5.0;
      F.rod(sx, 0.12, 0.75, sx + 0.4, 1.9, -0.05, 0.12, shade(timber, -0.06), 'wood');
    }
    F.box(0, 1.8, 0.2, 14.6, 0.3, 0.35, 0, shade(timber, -0.1), 'wood');
    F.rod(-7.3, 2.6, 0.25, 7.3, 2.6, 0.25, 0.03, timber, 'wood');
    F.rod(-7.3, 2.0, 0.25, 7.3, 2.0, 0.25, 0.025, timber, 'wood');
    // rope lashings where the rails cross the stakes
    for (let i = 0; i < 4; i++) {
      F.cyl(-6.0 + i * 4.0, 1.72, 0.12, 0.2, 0.5, 0, rope, 'cloth');
    }
    // hides and a painted shield hung on the outer face
    for (let i = 0; i < 3; i++) F.furn('br_h_hung_hide', -4.6 + i * 4.6, 0, 0.37, F.rr(-0.1, 0.1), { v: 1 });

    /* firing step behind the wall — the declared 4 m depth was never built */
    F.box(-1.0, 1.55, -1.15, 12.0, 0.22, 1.5, 0, 0x8a7550, 'wood');
    for (let i = 0; i < 4; i++) {
      const px = -6.2 + i * 3.6;
      F.cyl(px, 0, -1.75, 0.13, 1.55, 0, timber, 'wood');
      F.rod(px, 1.5, -1.8, px, 0.09, -2.5, 0.08, timber, 'wood');
    }
    F.rod(-6.6, 2.35, -1.85, 4.6, 2.35, -1.85, 0.035, rope, 'cloth');
    for (let i = 0; i < 4; i++) F.cyl(-6.2 + i * 3.6, 1.77, -1.85, 0.075, 0.62, 0, timber, 'wood');
    // ladder up to the step
    F.furn('br_h_wall_ladder', -6.5, 0, -0.95, 0, { v: 2 });
    // watch tower at one end
    const twX = 6.0, half = 0.9, towerH = 9.0;
    const twPosts = [[twX - half, -half], [twX + half, -half], [twX - half, half], [twX + half, half]];
    for (const p of twPosts) {
      F.cyl(p[0], 0, p[1], 0.15, towerH, 0, timber, 'wood');
      F.cyl(p[0], 4.2, p[1], 0.2, 0.14, 0, rope, 'cloth');
    }
    // cross-bracing so the tower reads from the sides
    for (const s of [-1, 1]) {
      F.rod(twX + s * half, 1.2, -half, twX + s * half, 4.6, half, 0.05, timber, 'wood');
      F.rod(twX - half, 4.8, s * half, twX + half, 7.6, s * half, 0.05, timber, 'wood');
    }
    F.box(twX, 4.4, 0, 2.1, 0.2, 2.1, 0, shade(timber, 0.05), 'wood');
    F.box(twX, towerH - 0.4, 0, 2.2, 0.25, 2.2, 0, shade(timber, 0.05), 'wood');
    const railY = towerH + 0.4;
    F.rod(twX - half, railY, -half, twX + half, railY, -half, 0.03, timber, 'wood');
    F.rod(twX - half, railY, half, twX + half, railY, half, 0.03, timber, 'wood');
    F.rod(twX - half, railY, -half, twX - half, railY, half, 0.03, timber, 'wood');
    F.rod(twX + half, railY, -half, twX + half, railY, half, 0.03, timber, 'wood');
    for (const p of twPosts) F.box(p[0], towerH - 0.15, p[1], 0.36, 0.6, 0.36, 0, shade(timber, -0.18), 'wood');
    // signal horn and a brazier on the platform
    F.cone(twX - 0.5, railY + 0.2, 0.4, 0.22, 0.9, 1.2, 0x3a2f22, 'wood');
    F.furn('br_h_signal_brazier', twX + 0.5, towerH - 0.15, -0.4, 0, { v: 1 });
    F.pyrRoof(twX, towerH + 0.9, 0, 3.4, 1.7, 3.4, 0, 0x6a5a44, 'thatch');
    F.beam(twX - 1.7, towerH + 0.9, -1.7, twX + 1.7, towerH + 0.9, -1.7, 0.16, 0.16, shade(0x6a5a44, -0.25), 'wood');
    F.beam(twX - 1.7, towerH + 0.9, 1.7, twX + 1.7, towerH + 0.9, 1.7, 0.16, 0.16, shade(0x6a5a44, -0.25), 'wood');
    F.cone(twX, towerH + 2.55, 0, 0.18, 0.4, 0, 0x3a2f22, 'wood');
  }
});
