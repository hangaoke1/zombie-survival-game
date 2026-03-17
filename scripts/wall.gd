extends StaticBody2D

class_name Wall

@export var max_health: int = 200
var health: int
var is_dead: bool = false

@onready var sprite: Sprite2D = $Sprite2D
@onready var health_bar: ProgressBar = $HealthBar

func _ready():
	health = max_health
	update_health_display()
	add_to_group("buildings")

func take_damage(damage: int):
	health -= damage
	health = max(0, health)
	update_health_display()
	update_appearance()
	
	if health <= 0 and not is_dead:
		destroy()

func update_health_display():
	if health_bar:
		health_bar.value = health
		health_bar.max_value = max_health
		health_bar.visible = health < max_health

func update_appearance():
	if sprite:
		var health_percent = float(health) / max_health
		if health_percent > 0.6:
			sprite.modulate = Color("#8B4513")  # Brown
		elif health_percent > 0.3:
			sprite.modulate = Color("#A0522D")  # Sienna
		else:
			sprite.modulate = Color("#CD853F")  # Peru

func destroy():
	is_dead = true
	
	# Spawn debris particles
	for i in range(10):
		var particle = ColorRect.new()
		particle.color = Color("#8B4513")
		particle.size = Vector2(5, 5)
		particle.global_position = global_position + Vector2(randf() - 0.5, randf() - 0.5) * 30
		get_tree().current_scene.add_child(particle)
		
		var angle = randf() * TAU
		var target_pos = particle.global_position + Vector2(cos(angle), sin(angle)) * 40
		
		var tween = create_tween()
		tween.tween_property(particle, "global_position", target_pos, 0.5)
		tween.parallel().tween_property(particle, "modulate:a", 0, 0.5)
		tween.tween_callback(particle.queue_free)
	
	queue_free()
