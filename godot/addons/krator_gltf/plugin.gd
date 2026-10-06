@tool
extends EditorPlugin

var ext: GLTFDocumentExtension


func _enter_tree() -> void:
	ext = load("res://krator/gltf_instancing.gd").new()
	GLTFDocument.register_gltf_document_extension(ext)


func _exit_tree() -> void:
	GLTFDocument.unregister_gltf_document_extension(ext)
