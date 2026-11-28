# `biomes/matronscoast` — `BIOME-API.md`

Exports `window.MATRON` (`BIO.kit('matronscoast')`), `window.SNAIL_PHYS`, `window.SNAIL_SITES`, `window.SNAIL_CROPS` (`CROPS.BIOMES.matronscoast`), and `window.SNAIL_FAUNA`.

## Kit Contract

- `MATRON.ID`: `'matronscoast'` (`rmwvqchv37nh0`, Yonni-Zāg endonym `'Kande-Sakhil'`, sailors' name `'Snail Coast'`)
- `MATRON.SPECIES`: 10 native snail-coevolved species (`nacretree`, `radulathorn`, `conchorchid`, `bitterfern`, `scrapelichen`, `slimecup`, `shellreed`, `velvetkelp_stub`, `cloudpodocarp`, `murexwort`), each carrying `HV(wood, edible, medicinal, notes, fruit)` harvest tags; exports `MATRON.make` and `MATRON.grow` for `BIO.kin`
- `BIO.kin` read in place: `biomes/shroudhills` (`shroud_kohekohe`, `shroud_amber_kauri`, `shroud_sister_cups` — strictly excluding `shroud_drum_gall` & Shroud-Ants on mucus-glazed lowland trunks) and `biomes/farside` (`stormwrack`, `wineweed`, `spraycoral`)
- `MATRON.build(opt)` / `MATRON.placeAll(opt)` / `MATRON.canopyH(x, z)`: deterministic cell-seeded placement on `KRAND.cell` + `36-core-walker.js` animated gliding giant molluscs
- `SNAIL_PHYS` (`[G data]`): `pressureAtElev`, `pulmonateCeilingAt`, `chiralityOf` (`98%` dextral / `2%` sacred *Lone-Born* sinistral *Queen-Shells*), `browseLineAt` (`2.20 m` radula browse-skirt), `mucusHighwayAt`, `coquinaMiddenAt`, `kelpFrontBalanceAt`, `antExclusionAt`, `hazardSpec`
- `SNAIL_FAUNA` (`[G data]`): 7 mollusc & predator records (`matron_towersnail`, `skerry_megachiton`, `velvet_keelslug`, `harpoon_conesnail`, `lantern_treesnail`, `shagshell_snail`, `anvil_stork`) with `stateAt(key, hour24)`
