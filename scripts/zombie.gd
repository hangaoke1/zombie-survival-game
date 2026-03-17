extends CharacterBody2D

class_name Zombie

enum ZombieType { NORMAL, FAST, TANK, EXPLODER }

@export var zombie_type: ZombieType = ZombieType.NORMAL

var max_health: int
var health: int
var speed: float
var damage: int
var score_value: int
var is_dead: bool = false
var attack_cooldown: float = 0.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var health_bar: ProgressBar = $HealthBar

const TYPE_STATS = {
	ZombieType.NORMAL: { "hp": 50, "speed": 60, "damage": 10, "score": 10, "color": Color("#8B4513") },
	ZombieType.FAST: { "hp": 30, "speed": 120, "damage": 8, "score": 15, "color": Color("#FF6347") },
	ZombieType.TANK: { "hp": 150, "speed": 30, "damage": 25, "score": 30, "color": Color("#2F4F4F") },
	ZombieType.EXPLODER: { "hp": 40, "speed": 80, "damage": 50, "score": 25, "color": Color("#FF1493") }
}

signal zombie_died(position: Vector2, score: int)

func _ready():
	setup_stats()
	health = max_health
	update_health_display()
	apply_type_appearance()

func setup_stats():
	var stats = TYPE_STATS[zombie_type]
	max_health = stats.hp
	speed = stats.speed
	damage = stats.damage
	score_value = stats.score

func apply_type_appearance():
	var texture_path = "res://assets/sprites/characters/zombie_normal.png"
	
	match zombie_type:
		ZombieType.NORMAL:
			texture_path = "res://assets/sprites/characters/zombie_normal.png"
		ZombieType.FAST:
			texture_path = "res://assets/sprites/characters/zombie_fast.png"
		ZombieType.TANK:
			texture_path = "res://assets/sprites/characters/zombie_tank.png"
		ZombieType.EXPLODER:
			texture_path = "res://assets/sprites/characters/zombie_exploder.png"
	
	if sprite:
		sprite.texture = load(texture_path)

func _physics_process(delta):
	if is_dead:
		return
	
	if attack_cooldown > 0:
		attack_cooldown -= delta
	
	var target = find_target()
	if target:
		move_towards_target(target, delta)
		check_attack(target, delta)

func find_target() -> Node2D:
	var core = get_tree().get_first_node_in_group("core")
	var player = get_tree().get_first_node_in_group("player")
	
	var target = core
	var min_dist = global_position.distance_to(core.global_position) if core else 999999
	
	if player:
		var player_dist = global_position.distance_to(player.global_position)
		if player_dist < min_dist and player_dist < 250:
			target = player
			min_dist = player_dist
	
	# Check for buildings
	var buildings = get_tree().get_nodes_in_group("buildings")
	for building in buildings:
		if building.is_dead:
			continue
		var build_dist = global_position.distance_to(building.global_position)
		if build_dist < min_dist and build_dist < 100:
			target = building
			min_dist = build_dist
	
	return target

func move_towards_target(target: Node2D, delta: float):
	var direction = global_position.direction_to(target.global_position)
	
	# Avoid other zombies (simple separation)
	var separation = Vector2.ZERO
	var zombies = get_tree().get_nodes_in_group("zombies")
	for zombie in zombies:
		if zombie != self and not zombie.is_dead:
			var dist = global_position.distance_to(zombie.global_position)
			if dist < 50 and dist > 0:
				separation -= (zombie.global_position - global_position).normalized() * (1.0 - dist / 50.0)
	
	direction += separation * 0.5
	direction = direction.normalized()
	
	velocity = direction * speed
	move_and_slide()
	
	# Face movement direction
	if velocity.length() > 0:
		rotation = velocity.angle()

func check_attack(target: Node2D, delta: float):
	var dist = global_position.distance_to(target.global_position)
	var target_radius = 15  # Approximate radius
	
	if dist <= target_radius + 15 and attack_cooldown <= 0:
		if target.has_method("take_damage"):
			target.take_damage(damage)
		attack_cooldown = 1.0

func take_damage(damage_amount: int):
	health -= damage_amount
	health = max(0, health)
	update_health_display()
	
	# Flash effect
	if sprite:
		sprite.modulate = Color.WHITE
		var tween = create_tween()
		tween.tween_property(sprite, "modulate", Color(1, 1, 1, 1), 0.1)
	
	if health <= 0 and not is_dead:
		die()

func update_health_display():
	if health_bar:
		health_bar.value = health
		health_bar.max_value = max_health
		health_bar.visible = health < max_health

func die():
	is_dead = true
	emit_signal("zombie_died", global_position, score_value)
	
	if zombie_type == ZombieType.EXPLODER:
		explode()
	
	# Death animation
	var tween = create_tween()
	tween.tween_property(self, "scale", Vector2.ZERO, 0.3)
	tween.tween_callback(queue_free)

func explode():
	var explosion_radius = 100.0
	var explosion_damage = 100
	
	# Damage nearby entities
	var zombies = get_tree().get_nodes_in_group("zombies")
	for zombie in zombies:
		if zombie != self and not zombie.is_dead:
			var dist = global_position.distance_to(zombie.global_position)
			if dist < explosion_radius:
				var damage_factor = 1.0 - (dist / explosion_radius)
				zombie.take_damage(int(explosion_damage * damage_factor))
	
	var buildings = get_tree().get_nodes_in_group("buildings")
	for building in buildings:
		if not building.is_dead:
			var dist = global_position.distance_to(building.global_position)
			if dist < explosion_radius:
				var damage_factor = 1.0 - (dist / explosion_radius)
				building.take_damage(int(explosion_damage * damage_factor))
	
	# Spawn explosion effect
	spawn_explosion_effect()

func spawn_explosion_effect():
	# Create particle explosion
	for i in range(20):
		var particle = ColorRect.new()
		particle.color = Color.ORANGE_RED
		particle.size = Vector2(4, 4)
		particle.global_position = global_position
		get_tree().current_scene.add_child(particle)
		
		var angle = randf() * TAU
		var dist = randf() * 50
		var target_pos = global_position + Vector2(cos(angle), sin(angle)) * dist
		
		var tween = create_tween()
		tween.tween_property(particle, "global_position", target_pos, 0.5)
		tween.parallel().tween_property(particle, "modulate:a", 0, 0.5)
		tween.tween_callback(particle.queue_free)
