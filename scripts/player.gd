extends CharacterBody2D

class_name Player

@export var speed: float = 200.0
@export var max_health: int = 100

var health: int
var current_weapon_index: int = 0
var weapons: Array[Weapon] = []
var last_shot_time: float = 0.0
var build_cooldown: float = 0.0

@onready var sprite: Sprite2D = $Sprite2D
@onready var gun_pivot: Node2D = $GunPivot
@onready var muzzle: Marker2D = $GunPivot/Muzzle
@onready var health_bar: ProgressBar = $HealthBar

signal health_changed(new_health: int, max_health: int)
signal weapon_changed(weapon: Weapon, index: int)
signal player_died

func _ready():
	health = max_health
	setup_weapons()
	update_health_display()
	emit_signal("weapon_changed", weapons[current_weapon_index], current_weapon_index)

func setup_weapons():
	weapons.append(Weapon.new("手枪", "pistol", 25, 0.4, 400, -1, Color.YELLOW))
	weapons.append(Weapon.new("冲锋枪", "smg", 15, 0.1, 350, -1, Color.YELLOW))
	weapons.append(Weapon.new("步枪", "rifle", 60, 0.8, 600, -1, Color.YELLOW, 3))
	weapons.append(Weapon.new("机枪", "machinegun", 20, 0.05, 350, -1, Color.YELLOW))
	weapons.append(Weapon.new("炸弹", "bomb", 200, 1.5, 200, -1, Color.ORANGE))
	weapons.append(Weapon.new("裂变炸弹", "nuke", 500, 3.0, 300, -1, Color.RED))
	weapons.append(Weapon.new("燃烧弹", "fire", 10, 2.0, 180, -1, Color("#ff3300")))

func _physics_process(delta):
	# Movement
	var input_dir = Vector2.ZERO
	input_dir.x = Input.get_axis("move_left", "move_right")
	input_dir.y = Input.get_axis("move_up", "move_down")
	
	if input_dir.length() > 0:
		input_dir = input_dir.normalized()
	
	velocity = input_dir * speed
	move_and_slide()
	
	# Aim at mouse
	var mouse_pos = get_global_mouse_position()
	gun_pivot.look_at(mouse_pos)
	
	# Handle shooting
	if Input.is_action_pressed("shoot"):
		try_shoot()
	
	# Handle weapon switching
	handle_weapon_input()
	
	# Handle building
	handle_building(delta)
	
	# Update cooldowns
	if build_cooldown > 0:
		build_cooldown -= delta

func handle_weapon_input():
	if Input.is_action_just_pressed("weapon_1"):
		switch_weapon(0)
	elif Input.is_action_just_pressed("weapon_2"):
		switch_weapon(1)
	elif Input.is_action_just_pressed("weapon_3"):
		switch_weapon(2)
	elif Input.is_action_just_pressed("weapon_4"):
		switch_weapon(3)
	elif Input.is_action_just_pressed("weapon_5"):
		switch_weapon(4)
	elif Input.is_action_just_pressed("weapon_6"):
		switch_weapon(5)
	elif Input.is_action_just_pressed("weapon_7"):
		switch_weapon(6)

func switch_weapon(index: int):
	if index >= 0 and index < weapons.size():
		current_weapon_index = index
		emit_signal("weapon_changed", weapons[current_weapon_index], current_weapon_index)

func try_shoot():
	var weapon = weapons[current_weapon_index]
	var now = Time.get_time_dict_from_system()["second"]
	
	# Simple time check (in real game use Time.get_ticks_msec())
	if weapon.fire_rate > 0:
		# For automatic weapons, check if we should fire
		pass
	
	shoot()

func shoot():
	var weapon = weapons[current_weapon_index]
	var projectile_scene = preload("res://scenes/projectile.tscn")
	var projectile = projectile_scene.instantiate()
	
	projectile.global_position = muzzle.global_position
	projectile.rotation = gun_pivot.rotation
	projectile.weapon = weapon
	
	get_tree().current_scene.add_child(projectile)
	
	# Recoil effect
	gun_pivot.position.x = -5
	tween_recoil()

func tween_recoil():
	var tween = create_tween()
	tween.tween_property(gun_pivot, "position:x", 0, 0.1)

func handle_building(delta):
	if Input.is_action_just_pressed("build_wall") and build_cooldown <= 0:
		build_structure("wall")
	elif Input.is_action_just_pressed("build_barrel") and build_cooldown <= 0:
		build_structure("barrel")

func build_structure(type: String):
	var place_distance = 60.0
	var place_pos = global_position + Vector2.RIGHT.rotated(gun_pivot.rotation) * place_distance
	
	# Check if can build
	if can_build_at(place_pos):
		var structure_scene
		if type == "wall":
			structure_scene = preload("res://scenes/wall.tscn")
		else:
			structure_scene = preload("res://scenes/barrel.tscn")
		
		var structure = structure_scene.instantiate()
		structure.global_position = place_pos
		get_tree().current_scene.add_child(structure)
		build_cooldown = 0.5

func can_build_at(pos: Vector2) -> bool:
	# Check distance from core
	var core = get_tree().get_first_node_in_group("core")
	if core and pos.distance_to(core.global_position) < 70:
		return false
	
	# Check distance from self
	if pos.distance_to(global_position) < 40:
		return false
	
	# Check for existing buildings
	var space_state = get_world_2d().direct_space_state
	var query = PhysicsShapeQueryParameters2D.new()
	var circle = CircleShape2D.new()
	circle.radius = 30
	query.shape = circle
	query.transform = Transform2D(0, pos)
	query.collision_mask = 1 << 2  # Buildings layer
	
	var result = space_state.intersect_shape(query)
	return result.size() == 0

func take_damage(damage: int):
	health -= damage
	health = max(0, health)
	update_health_display()
	emit_signal("health_changed", health, max_health)
	
	# Damage flash effect
	sprite.modulate = Color.RED
	var tween = create_tween()
	tween.tween_property(sprite, "modulate", Color.WHITE, 0.2)
	
	if health <= 0:
		die()

func update_health_display():
	health_bar.value = health
	health_bar.max_value = max_health

func die():
	emit_signal("player_died")
	queue_free()

func heal(amount: int):
	health = min(max_health, health + amount)
	update_health_display()
	emit_signal("health_changed", health, max_health)
