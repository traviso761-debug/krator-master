# Dalab — generator API (the contract)

Dalab is built on the Krator Ancients kit's fragment contract, through the Iziz
Vernacular helpers: `src/` fragments are concatenated by `build.py` in filename
order into one `<script>`, so **every top-level name is a global shared by every
fragment**. `build.py` fails the build on a duplicate or over-generic top-level
name, on a `build*()` that does not open with `reseed(N)`, and on a generative
fragment with no reseed. Units are metres, `x` east, `z` south, `y` up; a person
is 1.75 m, a Giant 3.8 m. Ground is `terrainH(x,z)` (flat `0` in the showcase).

## Loop

```
python build.py                                   # src/ + targets/set -> dist/dalab-set.html
python jscheck.py .syntax-set.js                  # parse check (headless Chromium)
python verify.py dist/dalab-set.html --assert --views "Opening,Noble houses" --out shots
python verify.py dist/dalab-set.html --eval "()=>window._api.tagAudit()"
```

`verify.py` is the Ancients harness unchanged. **Look at the shots**, at eye
level and at night — that is where proportion, placement and lighting errors
live, and no invariant sees them.

## Vendored fragments

From `../ancients/src` (byte-identical): `10-core 12-stats 20-textures
22-materials 30-kit 32-surfaces 34-kitdefs 36-decor 38-helpers2 50-registry
54-mat-concrete 68-mat-v5 69-mat-salvage` — the PRNG, noise, the instancing kit
(`kdef kput kbake KIT.meshes`), surfaces (`lathe mesh`), the Ancients materials
and salvage maps, the firelight kit (`fireWin ember emberB firePit`).

From `../iziz/src` (byte-identical): `69b-vern-mat 69c-vern-helpers` (the
Vernacular kit items `v*`, helpers `vn*`, `VERN`, `vWorldUV`, `vC`, `loc`, `vQ`,
`vLit`), `81-sky` (KratorSky), `90-scene 91-probe 92-camera 93-labels 99-tail
00-head` (the showcase scene, probe, inspector / polygon / walk, labels). Do not
edit them here — fix upstream and re-vendor; `python build.py --vendor-check`.

Note: Iziz's own copies of the Ancients core are older than upstream; Dalab
vendors upstream (it needs `KIT.meshes` for the night flip). The Vernacular
helpers run unchanged on it.

## The Dalab set

### Registry

```js
dDef({key, name, family, tags:{type:[...], wealth, lit, ...}, w, d, h, build})   // VERN.def + culture:'dalab'
VERN.place(scene, key, x, z, ry, o)   // -> THREE.Group; o = {v, lit, scale, y}
vnReg(name, lx, lz, r, h, extraTags)  // inspector volume, LOCAL frame
```

`build(G,o)` is a **named** `function buildDalab*(G,o){reseed(N+(o.v|0)); …}`.
Local frame: origin at the plot centre on the ground, **+z is the front**.
Seed blocks: dwellings 8100–8399, trade 8400–8499, civic 8500–8599, sacred
8600–8699. Take the next free `xx1` and leave room for variants.

### Kit items — `69d-dalab-mat.js` (prefix `d`)

Boxes: `dEarth dEarthBat(batter) dRelief dReliefBat dMuralB dTurf dTile dMosaic
dGilt dGlow(night pane) dGlowDay(day glass)`. Drums (base y=0): `dEarthDrum
dEarthDrumB(batter) dReliefDrum dStoneDrum dStoneDrumB dWoodDrum dStaveDrum
dTurfDrum dPanelDrum dRustDrum`. Domes: `dEarthDome dStoneDome dTurfDome
dGiltDome dPanelDome dRustDome`. Cones (base y=0): `dConeSh dConeT dConeTile
dConeCu dConeScrap dTurfCone`. Wedges: `dStonePyr dGableTile dHipTile dPyrTile`.
Planes: `dMural` (one whole tile, plain UV) `dBanner` `dGodHalo`. Balls:
`dGiltBall dGodBall(night) dGlassBall(day)`. `dGodStrip`, `dRing`, `dRopeRing`.

Palette `DPAL` (`earth earthDark stone stoneWarm wood woodGrey thatch shingle
red turq gold cream skin robe priest turf god laterite vothStone`), `dPick(arr)`,
`dCol(arr,k)` = `vC(dPick(arr),k)`. `DNIGHT_ITEMS` / `DDAY_ITEMS` are what the
hour toggles.

### Building blocks — `69e-dalab-helpers.js` (prefix `dn`, local frame, y = base)

```
dnOnRing(x,z,r,ry) -> [x',z']        point on a drum at bearing ry (ry = outward, same ry serves vnDoor/vnWin)
dnDrum(item,x,y,z,r,h,c)
dnRoundHouse(x,y,z,r,h,o) -> top y    o: wall wallC roof('thatch'|'shingle'|'scrap'|'tile') rise roofC door(ry) doorW doorH frame
                                      win[ry..] winKind band('mural'|'paint'|'relief') hearth lit wood leafC foot finial
dnMound(x,z,r,rt,h,ry,o)              turfed lathe + front stair + steles + apron; o.terrace={r,h}; returns {top, prof(rho)}
dnRingBank(x,z,r,h,w,gapRy,gapW,o)    ring earthwork with one gap; o.palisade
dnPlatform(x,y,z,w,d,h,ry,c)          battered rammed-earth platform
dnEarthWall(x,y,z,w,d,ry,h,gate,o)    compound wall with corner drums, gate pylons; o.relief o.mural o.stoneGate o.t o.c
dnRingWall(x,y,z,r,h,gapRy,gapW,item,c,t)
dnReliefBand(x,y,z,ry,w,h,c)  dnMuralBand(x,y,z,ry,w,h)  dnMuralRing(x,y,z,r,h)  dnCornice(x,y,z,w,d,ry,c,steps) -> top y
dnGate(x,y,z,ry,w,h,c)  dnStele(x,y,z,ry,h,c)  dnAltar(x,y,z,ry,c)  dnBanner(x,y,z,ry,w,h,c)  dnBannerPole(x,y,z,ry,h,c)
dnGodWin(x,y,z,ry,w,h,frameItem,c)  dnGodLamp(x,y,z,ry)  dnGodPost(x,y,z,h)  dnGodStrip(x,y,z,ry,L)     -- only under vLit()
dnHearth(x,y,z,ry,w,h)  dnFirePit(x,y,z,s)                                                            -- fire: anywhere
dnFolk(x,z,n,spread,y)  dnPriest(x,y,z,ry)  dnGiant(x,y,z,ry,arms,o)   o: spear shield s skin
dnStall(x,z,ry,o)  dnGranary(x,y,z,r,h,o)  dnJar  dnWoodpile
dnTemple(x,y,z,ry,s,o) -> {top,plat}   (73)  the priests' temple at scale s;  dnPriestHouse(x,y,z,ry,r)
```

The Vernacular helpers (`vnDoor vnWin vnFrame vnGableRoof vnHipRoof
vnThatchCone vnStairs vnVeranda vnPalisade vnPaving vnPlanter vnBarrel …`) are
all available and used throughout; see `../iziz/API.md`.

### Adding a building

1. New `function buildDalabX(G,o){reseed(8xx1+(o.v|0)); vnReg(...); …}` in the
   right fragment.
2. `dDef({...})` at the foot of the fragment with honest `w,d,h` (the showcase
   spaces sites by `w`).
3. Add the key to a row in `targets/set/89z-rows.js` and a view or two in
   `91z-views.js` (an eye-level one, and a night one if it is lit).
4. `python build.py && python verify.py … --assert` — then read the shots.

## The lighting package — `94-dalab-light.js`

* `DSKY={hour,day,dens}`; `KratorSky` replaces the showcase's static sky;
  `dalabSkyTick()` runs in `FRAME_HOOKS` and sets sun / fill / hemisphere / fog /
  exposure from `KratorSky.lighting()`.
* `dalabNight(on)` flips `KIT.meshes[n].visible` for `DNIGHT_ITEMS` and
  `DDAY_ITEMS`; it fires when `dayF < .45`.
* `setView(cx,cy,cz,tx,ty,tz,hour)`: a seventh preset element sets the hour, so
  the select, the hidden buttons `verify.py` clicks and `--all-views` all reach
  the night shots. `N` toggles night by hand. Hour slider in the UI.
* `window._api.setHour(h)`, `window._api.night()`.

A world that places this kit calls nothing new: place the defs, keep
`94-dalab-light.js` (or the city's own sky tick calling `dalabNight`).

## Probe — `window._api`

`totals`, `typeStats()`, `regOccupancy()`, `nanSweep()`, `tagAudit()`, `defs()`,
`setView`, `views()`, `setHour`, `night`. Budgets: showcase 3 M scene
triangles / 400 draw calls; per type 250 k.
