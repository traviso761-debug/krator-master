# The Viridian estate: the site survey (2026-11-16)

The survey behind `PLAN.md` section 1. It reads the scale model as it stands after the lake re-run, commit 5f659c054 on
`claude/gemini-trade-reconcile`. That re-run moved only Erehwon's lake, and the scarp here is 80 km from it. The script is
`survey_site.py` in this folder. It reads the model's data maps, and the decodings come from
`tools/scale-model/model/INDEX.md`:

- `h.png`: height = (R*256+G)/65535*29600-2600; B>127 is water;
- `p.png`: rain = byte/255*4000 mm;
- `tm`, `tc`, `tl`, `tw` and `th`: the mean, the coldest month, the coldest night, the warmest month and the hottest afternoon, each in C + 90;
- `c.png`: an index into `climate.json`.

A cell is 2 km. Slope is the central difference over two cells (4 km). Aspect is the bearing the slope faces.

## The cell: px 962,1562 (`T.viridian`)

| | |
|---|---|
| Height | **813 m** |
| Slope, aspect | **16 %** (the tune's note says 20 %; 19 % is the cell to its north), facing **274°** (west) |
| Rain | **2,322 mm** a year |
| Temperature | mean **18 °C**; coldest month **11 °C**; coldest night **+4 °C** (frost-free); warmest month 25 °C; hottest afternoon 33 °C |
| Climate | **Cfb** (oceanic), no dry season |
| Wind | from the north-west (the model's westerlies, `climate.json` assumptions), onto a west face: the cloud banks on the scarp |
| Biome | `xanadu` (the region `openworld/xanadu-oidong-highrift`, biome id 5, every cell 959-965 x 1559-1565) |
| Air | 1.44 atm (the region's `pressure`: 1.6 atm at datum, scale 8 km): "dense" on the crops kit's axis; `CROPS.BIOMES.xanadu` says standard with a `?`. For the herbs the two agree at the house (section 2) |

## The neighbourhood (7 x 7 cells, 14 x 14 km; x across, y down; north is up)

Height in m / slope / rain in mm / mean, coldest month, coldest night in °C / class. A cell that stops after the rain
gives only those three; the class is Cfb unless shown. `survey_site.py <dir> site` prints every value:

| y \ x | 959 | 960 | 961 | **962** | 963 | 964 | 965 |
|---|---|---|---|---|---|---|---|
| 1560 | 171/5/2007/21,14,7 Cfa | 304/8/2164 | 475/15/2023/20,12,5 | 907/22/2117/18,10,3 | 1310/23/2164/15,7,0 | 1782/26/**2964**/12,3,-4 | 2283/26/2588/9,0,-7 Dfb |
| 1561 | 180/5/1803 | 301/7/1992 | 453/13/2352/20,13,6 | 828/19/2054/18,11,4 | **1206/20/2823/16,7,0** | 1595/22/2854/12,5,-3 | 2039/23/2447 |
| **1562** | 263/7/1584 | 369/8/1819 | 501/12/2196/20,13,7 | **813/16/2322/18,11,4** | **1142/17/2384/15,8,0** | 1471/18/2415/13,6,-2 | 1861/19/2211/11,3,-5 |
| 1563 | 409/8/1333 | 509/9/1584 | 631/11/1850/19,12,6 | 872/13/1913/17,10,3 | 1137/14/1960/15,7,-1 | 1446/17/1992 | 1809/16/1913 |
| 1564 | 571/8/1145 | 652/8/1349 | 751/8/1521/18,11,6 | 923/9/1552/17,9,2 | 1100/17/1600/15,8,-1 | 1415/19/1631 | 1745/14/1584 |
| 1565 | **702/5/1066/18,11,8** | 759/5/1176 | 829/2/1286 | 759/10/1333 | 652/21/1380 | 1057/30/1364 | 1625/20/1286 |

What it shows:
- **The scarp's foot.** Row 1562 climbs from the valley floor (185 m at x 956) through the house (813 m) to the scarp's top (2,523 m at x 968),
  1,700 m in 12 km. The house is on the apron, where the slope is 12-20 % before the face steepens.
- **The mist belt is a strip**, 4-6 km wide along the scarp's foot (x 961-965, y 1559-1562), with 2,000-2,960 mm of rain.
  Rain falls off fast to the south-west, into a rain shadow: 1,066 mm at 959,1565, 6 km off.
- **The frost line runs at about 1,100-1,200 m.** The coldest night is 0 °C at 963 (1,142-1,206 m), -2 to -4 °C above 1,400 m, and
  +3 to +4 °C at the house.
- **No water on the model within 16 km.** The nearest river cells are two dry wadis, *Sanõ Ḍrāi* (24 km, at 950,1564, its bed 741 m)
  and *Wĩḍ Ḍrāi* (30 km). With 2,300-2,900 mm falling on the scarp's face, springs and streams below the model's grid are sound
  geology. The estate's water is a **spring line at the foot of the face** (proposed, `PLAN.md` question 3).

## Is it the best tea ground nearby?

`survey_site.py <dir> scan 50` ranks every dry cell within 50 px (a 200 km square, 9,313 cells) for mist tea. The rough score
weighs rain, a mild mean, a frost-free coldest night, a workable slope (8-45 %), 700-2,000 m of height and a C climate.

- **The fifteen best cells are all on this one strip of the scarp's foot.**
- **The site ranks 3rd of 9,313.**
- The two above it are its own upper slope, 2 km east: **963,1561** (1,206 m, 2,824 mm, 16 °C, coldest night 0 °C) and **963,1562**
  (1,142 m, 2,384 mm). They are wetter and cooler, which is the classic high-grown tea, but they sit on the frost line.
- The fourth and fifth (963,1560 and 962,1560) are the same slope 4 km north.

So 962,1562 is the right pin. It is the highest frost-free cell in the wettest strip. The better cells are the same estate's
upper ground, where `PLAN.md` puts the High Garden. Moving the house up to 963,1561 would trade frost-free cloisters for 500 mm
more rain. That is question 1, and the recommendation is to keep the pin.

## The road down to Qiblai

Qiblai (922,1595) lies at **-1,860 m** in the basin (Af, mean 34 °C, 1,631 mm). The straight line from the house:

| px | Height | Rain | |
|---|---|---|---|
| 962,1562 | 813 | 2,322 | the house |
| 959,1565 | 702 | 1,067 | the dry spur (the rain shadow) |
| 953,1570 | 393 | 1,004 | |
| 948,1573 | 34 | 941 | the valley below the scarp |
| 942,1578 | -303 | 769 | |
| 940,1580 → 936,1584 | -605 → -2,025 | 737-784 | **the basin's wall: 1,400 m down in about 11 km** |
| 922,1595 | -1,860 | 1,631 | Qiblai |

The road falls **2,670 m**, most of it on the basin's wall in its last 25 km. That is 104 km in a straight line. The tune
counts the road as 1.3 times that, so 5-6 days at 25 km a day. Loaded uphill it is slower (`PLAN.md` section 8).
