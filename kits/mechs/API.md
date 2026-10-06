# kits/mechs: API

One global, `KratorMechs`, from the bundle (`mech_bundle.bundle()`, or `dist/krator-mechs.js`). It needs only a
global `THREE` (r128). Nothing else leaks (verify.py `bundle-alone` checks it in a blank page).

## The frame

Origin at the footprint centre on the ground. **+z is forward**, y up, x across: +x is the pilot's left (as
`kits/motor-vehicles`). A host that moves a mech along heading `ry` sets `group.rotation.y = ry` and moves it by
`(sin ry, 0, cos ry) * metres`.

## Calls

```js
KratorMechs.list()            // -> [{ key, name, culture, role, origin, lore, tags, variants, variantNames, w, d, h, data }]
KratorMechs.dataOf(key, v)    // data (with speed, gait, attack { kind, dur })
KratorMechs.build(key, { variant, seed, linear }) -> THREE.Group, posed standing
KratorMechs.update(group, dt, { ground(x, z) -> y })   // advance and pose; returns this step's events
KratorMechs.setState(group, 'idle' | 'walk')
KratorMechs.attack(group)     // starts the attack clip (stops walking for its length, then resumes); returns its length in s
KratorMechs.state(group)      // { mode, attacking, attackT, phase, walkW, stepping, reach }
KratorMechs.speed(group)      // m/s: move the group at this while walking and the planted feet do not slide
KratorMechs.feet(group)       // [{ name, planted, pos }] footprints, world
KratorMechs.point(group, name)// a named point (muzzle, blade tip) in world, [x, y, z]
KratorMechs.reset(group)      // standing, feet re-planted where the group now is
KratorMechs.lights(group, on) // eye slits, lamps (the glow material)
KratorMechs.projectile(kind)  // a THREE.Group to fly: 'bolt' (1.5 m), 'harpoon' (2.6 m, barbed), 'rivet' (glowing slug); +z forward
KratorMechs.clip(key, v)      // a variant's attack clip (variantAttack[v] or the entry's attack)
KratorMechs.audit(key, { variant, seed, tol, pen })   // z-fighting at rest: [{ bone, a, b, n, meshes, at }]
KratorMechs.useTextures({ plate, livery, metal, bronze, cloth, hair: { src, scale, mean, bump, chip }, banner: { src, cell }, sunbanner: { src, size } })
KratorMechs.has, .get(key) (the entry), .cultures(), .palette(culture), .setDetail(k), .dispose(group)
KratorMechs.CLASSES, .TYPES, .DRIVES, .PILOTS, .WEAPONS, .BUCKETS   // the tag vocabularies
```

Call `update` every frame, after moving the group. The first update after `build` plants the feet wherever the
group then stands, and so does any jump further than the mech could walk in one frame (a host placing or teleporting
it), so a host can build at the origin and move it into place. Events:

```js
{ type: 'step',   key, leg, pos, mass }              // a foot planted (dust, a thud, a footprint)
{ type: 'fire',   key, kind, pos, dir, speed }       // loose a projectile: KratorMechs.projectile(kind) from pos along dir
{ type: 'impact', key, pos, r }                      // a blow lands: dust, damage within r metres
{ type: 'call',   key, pos, dir }                    // a signal (the Supply Castra's horn): a sound for the host
```

## The group

| Child | What |
|---|---|
| the root bone `body` (and its tree) | every bone of the rig, by name (`group.userData.bones`) |
| `mesh:plate` `mesh:livery` `mesh:metal` `mesh:bronze` `mesh:cloth` `mesh:hair` `mesh:glass` `mesh:glow` | SkinnedMeshes on one Skeleton; vertex colours (linear); shared materials except glow. Painted plate in a saturated colour goes to livery |
| `banner:<bone>` | a cloth mesh per banner, hung on its bone, its vertices fluttered on the CPU |

`group.userData`: `{ key, name, culture, role, origin, tags, kind: 'mech', variant, variantName, seed, w, d, h, tris,
bones: [names], legs: [{ name, L1, L2, knee, splay, ankleH, rest }], points: { name: { bone, p } }, data, lightsOn }`.

Bone names a host can rely on: `body` (the pelvis or hull), `torso` and `head` where there is one, `arm_l_sh/_el/_wr`
and `arm_r_*` on the arms, `leg_<n>_yaw/_hip/_knee/_ankle` per leg (`leg_l`, `leg_r`; `leg_fl`, `leg_fr`, `leg_rl`,
`leg_rr`), `<bone>_pilotHead` for each pilot.

## The entry

```js
MECH({
  key, name, culture, role, origin, lore,
  tags: { class: 'mech', type: [...], drive, crew, pilot, weapon: [...], setting, guild },
  variants, variantNames, w, d, h,
  variantData: [{ ... }],             per variant, merged over data
  variantAttack: [null, { ... }],     per variant, in place of attack (null keeps it)
  data: { height, mass, crew, pilot, reach, weapon, ... },
  gait: { period, duty, stride, lift, bob, sway, roll, twist, lean, offsets: [per leg], arms: { bone: [rx, ry, rz] } },
  idle: { breathe, scan, look },
  attack: { kind, dur, keys: [[t, { b: { bone: [rx, ry, rz] }, s: { bone: [x, y, z] }, sc: { bone: k } }, ease], ...],
            events: [{ t, type, kind, at: 'point', dir: [x, y, z], speed, r }] },
  anim: { idle(P, t, w, st), walk(P, ph, w, st) },     // optional code on top of the data layers
  build(F, R)
})
```

Keys are offsets from the rest pose (`b` Euler YXZ radians, `s` metres in the parent's frame, `sc` a scale; a bone
missing from a key is at rest). Eases: `s` smooth, `l` linear, `i` in (a blow), `o` out, `b` overshoot. Speed is
`stride / (duty * period)`.
