# Xanadu's works: Kōlḍ-Lōḍ and Opal Valley Mines on a sheet

Step W3 of `settlements/xanadu/WORKS-PLAN.md` (BUILD-PLAN.md step A7). The Sultanate's two mines laid as work camps on a flat
sheet, because their province regions (Gōlḍ-Mārch, Ōpal-Bhālī) wait for the vertical stack (the owner, 2026-11-22); W4 puts
them on their ground. A target on Xanadu's page (`settlements/xanadu/build.py --kit`), as Kirstabal's town is.

| Camp | Tune record | People | Focus (core/hamlet's Xanadu row) | Its works |
|---|---|---|---|---|
| Kōlḍ-Lōḍ, the adit camp | `smgxtultfq`, part 0 | 500 | `mine` | adits (stand-ins: the kit has no adit), mine heads, workshops (the tally house), smithies |
| Kōlḍ-Lōḍ, the mill camp | `smgxtultfq`, part 1 | 450 | `mill` | stamp mills (`xa_stamp_mill`, new), corrals (the ore train), smithies, workshops, placer sluices on the tailings, the Golden Tears' watch post |
| Opal Valley Mines, the diggings | `sjuarjbku0`, part 0 | 500 | `diggings` | mine heads (the opal variant), adits, sorting sheds (`xa_sorting_shed`, new), workshops; a fifth of the houses the Glaziers' (`gz-front`, `gz-cell`) |
| Opal Valley Mines, the factor's landing | `sjuarjbku0`, part 1 | 350 | `landing` | warehouses, the watch house, workshops (the assay room), boat sheds; the quay, the cargo barge and a launch |

The records are `XAN_TUNE`'s (`core/region/data/xan-tune.js`, read in place: `gen/69w-works-core.js` seals it with core/space,
core/city's strategies and core/hamlet at every build). Each camp is `KHAMLET.village` on `KHAMLET.xanaduRow({camp: true,
mineHead: true, shrine: true})` with core/hamlet/camp's census (`spec.camp`, `spec.share`: the record's people dealt over its two
camps by the largest remainder). Tailings, spoil and potch heaps are core/terrain's `KRUBBLE`.

```
python3 build.py                                   # dist/xanadu-works.html (through tools/build.py)
KRATOR_GL=gpu python3 verify.py dist/xanadu-works.html --assert --views "Overview,The adit camp,The mill camp,A stamp mill,The diggings,The Glaziers houses,The factors landing"
```

verify.py adds to Xanadu's checks: `works-laid`, `census` (950 and 850 against the tune), `works-present`, `footprints`.
