# biomes/swouterwall — Known Issues

- [x] `MAT_GROUND` sampler count kept strictly `< 13` (`11` samplers: `TEX_GROUND` + `5` `KSTRATA` `'megabreccia'` + `3` `KGROUND` layers + `2` `KHORIZON.shade`); `ATMOS.snowOnScene` adds `0` texture samplers.
- [x] `KSHADOW` is strictly OFF at default page load (`renderer.shadowMap.enabled === false`), attachable via `?shadow=1` or the `Sun shadows` UI button.
- [x] `WATER.audit` and `water-mouths` report `0` findings across all 4 stations (`boreallakes` stepped paternoster lakes + riffle, `morainetarn` glacial-flour tarn + cascade, `trigemini` open lead + `WATER.ice` shore shelves, `breathvale` frozen rime seep).
- [x] All `BIO.kin` trees (`nwouterwall.furlarch`, `nwouterwall.pinemat`, `nwouterwall.woolwillow`) and native woody flora (`paternoster_spruce`, `moraine_birch`) hang foliage directly on `BIO.flareJoin` wood stems (`0` `leaf-stems` faults).

## Future Open-World Integration Notes

- Settlement reserves (`site:veil-portage-landing`, `site:fellgang-moraine-camp`, `site:dalab-trigemini-waypost`, `site:breathvale-courier-refuge`) remain empty of `class: 'building'` structures until the open-world Dalab/Copper-Glacier road and Fellgang pastoral camp passes wire `kits/tents` and Dalab wayhouses onto them.
