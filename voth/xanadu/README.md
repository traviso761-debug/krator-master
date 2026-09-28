# Xanadu building kit

The architecture of the remote southern Sultanate of Xanadu: a rich valley like Shangri-La, its houses stepping up
the hillsides. The general forms and massing are **Tibetan** — battered whitewashed masses, flat roofs with
parapets, the maroon twig band, black trapezoid windows under corbelled lintels, gilded roof pavilions — with
detailing from **India** (jharokha bay windows on carved brackets, jali screens, chhatri hoods), **Turkey**
(painted ornament, the cumba — an upper storey overhanging the street on raked struts) and **Persia** (pointed
arches and iwans, tile mosaics, bulbous turquoise domes, the baths and the chahar bagh gardens). Gold is on
everything wealthy, religious or civic: the valley's mines pay for it.

Built on the Ancients kit fragment contract and the Iziz Vernacular helpers (vendored through `../highlands`), so
the kit drops into a settlement target the same way the Highlands and Iziz sets do.

```
python build.py                                              # dist/xanadu.html
PW_CHROME=/path/to/chrome python verify.py dist/xanadu.html --assert --views "Overview,Sacred" --out shots
python jscheck.py .syntax-xanadu.js                         # parse check when node is missing
```

* `DESIGN.md` — the brief: the vocabulary, the slope rule, tags, the building list.
* `API.md` — the contract: registry, palette, kit items, helpers, rules for package work.
* `NOTES.md` — round by round. `KNOWN_ISSUES.md` — what is open.
