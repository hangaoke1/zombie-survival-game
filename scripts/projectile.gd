extends Area2D

class_name Projectile

var weapon: Weapon
var speed: float = 600.0
var traveled_distance: float = 0.0
var penetration_count: int = 0

@onready var sprite: Sprite2D = $Sprite2D

func _ready():
	body_entered.connect(_on_body_entered)
	if weapon:
		penetration_count = weapon.penetration
		if sprite:
			sprite.modulate = weapon.color

func _physics_process(delta):
	var direction = Vector2.RIGHT.rotated(rotation)
	var movement = direction * speed * delta
	position += movement
	traveled_distance += movement.length()
	
	if weapon and traveled_distance >= weapon.range:
		queue_free()

func _on_body_entered(body: Node2D):
	if body.is_in_group("zombies") and body.has_method("take_damage"):
		body.take_damage(weapon.damage if weapon else 25)
		penetration_count -= 1
		
		# Spawn hit effect
		spawn_hit_effect()
		
		if penetration_count <= 0:
			queue_free()
	elif body.is_in_group("buildings") and body.has_method("take_damage"):
		body.take_damage(weapon.damage if weapon else 25)
		queue_free()

func spawn_hit_effect():
	var effect = ColorRect.new()
	effect.color = Color.YELLOW
	effect.size = Vector2(6, 6)
	effect.global_position = global_position
	get_tree().current_scene.add_child(effect)
	
	var tween = create_tween()
	tween.tween_property(effect, "scale", Vector2.ZERO, 0.2)
	tween.parallel().tween_property(effect, "modulate:a", 0, 0.2)
	tween.tween_callback(effect.queue_free)
