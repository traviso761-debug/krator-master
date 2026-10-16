# core/tags in GDScript: the uid and the instance id, the twin of 50-core-tags.js (README.md, "The uid").
# The records themselves cross as data (the krator-tags export); Godot only has to reproduce the uid, so that a save
# naming a thing by its uid finds it again in a re-exported world. golden.json holds vectors written by test-tags.js.
#
#   KTags.uid("building", "iziz_gate", [212.0, 41.5, -96.0])  -> "7bd10f69"
#   KTags.instance_id("flora_00012", 37)                        -> "flora_00012#37"
extends RefCounted

const KRand := preload("../rand/krand.gd")


# FNV-1a over the string's UTF-16 code units (characters in the Basic Multilingual Plane), as u32 bits
static func str32(s: String) -> int:
	var h := 0x811C9DC5
	for i in s.length():
		h = KRand.imul(h ^ s.unicode_at(i), 0x01000193)
	return h


# KRAND.hash(0, str32(class), str32(key), floor(x*10+0.5), floor(y*10+0.5), floor(z*10+0.5)), 8 hex digits
static func uid(cls: String, key, at: Array) -> String:
	var k: String = "" if key == null else str(key)
	var u := KRand.hash_ints(0, [str32(cls), str32(k), float(at[0]) * 10.0 + 0.5, float(at[1]) * 10.0 + 0.5, float(at[2]) * 10.0 + 0.5])
	return "%08x" % u


static func instance_id(id: String, i: int) -> String:
	return id + "#" + str(i)
