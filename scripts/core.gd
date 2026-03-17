extends StaticBody2D

class_name Core

@export var max_health: int = 500
var health: int
var is_dead: bool = false

@onready var sprite: Sprite2D = $Sprite2D
@onready var health_bar: ProgressBar = $HealthBar
@onready var pulse_timer: Timer = $PulseTimer

var pulse_phase: float = 0.0

signal core_destroyed
signal health_changed(new_health: int, max_health: int)

func _ready():
	health = max_health
	update_health_display()
	add_to_group("core")

func _process(delta):
	pulse_phase += delta * 2.0
	update_pulse_effect()

func update_pulse_effect():
	if sprite:
		var pulse = 1.0 + sin(pulse_phase) * 0.1
		sprite.scale = Vector2(pulse, pulse)

func take_damage(damage: int):
	health -= damage
	health = max(0, health)
	update_health_display()
	emit_signal("health_changed", health, max_health)
	
	# Damage flash
	if sprite:
		sprite.modulate = Color.RED
		var tween = create_tween()
		tween.tween_property(sprite, "modulate", Color("#3366ff"), 0.2)
	
	# Spawn damage particles
	spawn_damage_particles()
	
	if health <= 0 and not is_dead:
		destroy()

func update_health_display():
	if health_bar:
		health_bar.value = health
		health_bar.max_value = max_health

func spawn_damage_particles():
	for i in range(3):
		var particle = ColorRect.new()
		particle.color = Color("#3366ff")
		particle.size = Vector2(4, 4)
		particle.global_position = global_position + Vector2(randf() - 0.5, randf() - 0.5) * 40
		get_tree().current_scene.add_child(particle)
		
		var angle = randf() * TAU
		var target_pos = particle.global_position + Vector2(cos(angle), sin(angle)) * 30
		
		var tween = create_tween()
		tween.tween_property(particle, "global_position", target_pos, 0.5)
		tween.parallel().tween_property(particle, "modulate:a", 0, 0.5)
		tween.tween_callback(particle.queue_free)

func destroy():
	is_dead = true
	emit_signal("core_destroyed")
	
	# Destruction effect
	for i in range(30):
		var particle = ColorRect.new()
		particle.color = Color("#3366ff")
		particle.size = Vector2(6, 6)
		particle.global_position = global_position
		get_tree().current_scene.add_child(particle)
		
		var angle = randf() * TAU
		var dist = randf() * 100 + 50
		var target_pos = global_position + Vector2(cos(angle), sin(angle)) * dist
		
		var tween = create_tween()
		tween.tween_property(particle, "global_position", target_pos, 1.0)
		tween.parallel().tween_property(particle, "modulate:a", 0, 1.0)
		tween.tween_callback(particle.queue_free)
	
	queue_free()
