extends StaticBody2D

class_name Barrel

@export var max_health: int = 50
@export var explosion_radius: float = 80.0
@export var explosion_damage: int = 150

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
	
	if health <= 0 and not is_dead:
		explode()

func update_health_display():
	if health_bar:
		health_bar.value = health
		health_bar.max_value = max_health
		health_bar.visible = health < max_health

func explode():
	is_dead = true
	
	# Damage nearby entities
	var zombies = get_tree().get_nodes_in_group("zombies")
	for zombie in zombies:
		if not zombie.is_dead:
			var dist = global_position.distance_to(zombie.global_position)
			if dist < explosion_radius:
				var damage_factor = 1.0 - (dist / explosion_radius)
				zombie.take_damage(int(explosion_damage * damage_factor))
	
	var buildings = get_tree().get_nodes_in_group("buildings")
	for building in buildings:
		if building != self and not building.is_dead:
			var dist = global_position.distance_to(building.global_position)
			if dist < explosion_radius:
				var damage_factor = 1.0 - (dist / explosion_radius)
				building.take_damage(int(explosion_damage * damage_factor))
	
	# Spawn explosion effect
	spawn_explosion_effect()
	queue_free()

func spawn_explosion_effect():
	# Create expanding circle
	var explosion = ColorRect.new()
	explosion.color = Color("#FF6600")
	explosion.size = Vector2(10, 10)
	explosion.global_position = global_position - Vector2(5, 5)
	explosion.pivot_offset = Vector2(5, 5)
	get_tree().current_scene.add_child(explosion)
	
	var tween = create_tween()
	tween.tween_property(explosion, "size", Vector2(explosion_radius * 2, explosion_radius * 2), 0.3)
	tween.parallel().tween_property(explosion, "global_position", global_position - Vector2(explosion_radius, explosion_radius), 0.3)
	tween.parallel().tween_property(explosion, "modulate:a", 0, 0.3)
	tween.tween_callback(explosion.queue_free)
	
	# Spawn particles
	for i in range(20):
		var particle = ColorRect.new()
		particle.color = Color.ORANGE_RED
		particle.size = Vector2(5, 5)
		particle.global_position = global_position
		get_tree().current_scene.add_child(particle)
		
		var angle = randf() * TAU
		var dist = randf() * explosion_radius
		var target_pos = global_position + Vector2(cos(angle), sin(angle)) * dist
		
		var particle_tween = create_tween()
		particle_tween.tween_property(particle, "global_position", target_pos, 0.5)
		particle_tween.parallel().tween_property(particle, "modulate:a", 0, 0.5)
		particle_tween.tween_callback(particle.queue_free)
