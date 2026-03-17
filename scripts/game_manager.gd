extends Node2D

class_name GameManager

@export var level: int = 1
@export var score: int = 0

var zombie_scene = preload("res://scenes/zombie.tscn")
var zombies_remaining: int = 0

@onready var player: Player = $Player
@onready var core: Core = $Core
@onready var spawn_timer: Timer = $SpawnTimer
@onready var ui: Control = $UI

func _ready():
	start_level()
	
	# Connect signals
	if player:
		player.health_changed.connect(_on_player_health_changed)
		player.player_died.connect(_on_player_died)
		player.weapon_changed.connect(_on_weapon_changed)
	
	if core:
		core.health_changed.connect(_on_core_health_changed)
		core.core_destroyed.connect(_on_core_destroyed)

func start_level():
	spawn_zombies()
	update_ui()

func spawn_zombies():
	var base_count = 5
	var level_multiplier = min(level * 2, 20)
	var zombie_count = base_count + level_multiplier
	zombies_remaining = zombie_count
	
	for i in range(zombie_count):
		spawn_single_zombie()

func spawn_single_zombie():
	if not core:
		return
	
	var angle = randf() * TAU
	var min_dist = 250.0
	var max_dist = 400.0 + level * 20.0
	var distance = min_dist + randf() * (max_dist - min_dist)
	
	var spawn_pos = core.global_position + Vector2(cos(angle), sin(angle)) * distance
	
	# Clamp to screen bounds
	var viewport_size = get_viewport_rect().size
	spawn_pos.x = clamp(spawn_pos.x, 50, viewport_size.x - 50)
	spawn_pos.y = clamp(spawn_pos.y, 50, viewport_size.y - 50)
	
	var zombie = zombie_scene.instantiate()
	zombie.global_position = spawn_pos
	zombie.zombie_type = select_zombie_type()
	zombie.zombie_died.connect(_on_zombie_died)
	add_child(zombie)
	zombie.add_to_group("zombies")

func select_zombie_type() -> Zombie.ZombieType:
	var rand = randf()
	
	if level == 1:
		return Zombie.ZombieType.NORMAL
	elif level <= 3:
		return Zombie.ZombieType.NORMAL if rand < 0.7 else Zombie.ZombieType.FAST
	elif level <= 5:
		if rand < 0.5:
			return Zombie.ZombieType.NORMAL
		elif rand < 0.8:
			return Zombie.ZombieType.FAST
		else:
			return Zombie.ZombieType.TANK
	else:
		if rand < 0.3:
			return Zombie.ZombieType.NORMAL
		elif rand < 0.5:
			return Zombie.ZombieType.FAST
		elif rand < 0.7:
			return Zombie.ZombieType.TANK
		else:
			return Zombie.ZombieType.EXPLODER

func _on_zombie_died(position: Vector2, zombie_score: int):
	score += zombie_score
	zombies_remaining -= 1
	update_ui()
	
	if zombies_remaining <= 0:
		level_complete()

func level_complete():
	# Show victory screen
	var victory_screen = $UI/VictoryScreen
	if victory_screen:
		victory_screen.show()
		get_tree().paused = true

func _on_player_health_changed(new_health: int, max_health: int):
	update_ui()

func _on_player_died():
	game_over("你已被丧尸消灭！")

func _on_core_health_changed(new_health: int, max_health: int):
	update_ui()

func _on_core_destroyed():
	game_over("核心已被摧毁！")

func _on_weapon_changed(weapon: Weapon, index: int):
	update_ui()

func game_over(reason: String):
	get_tree().paused = true
	var game_over_screen = $UI/GameOverScreen
	if game_over_screen:
		game_over_screen.show()
		game_over_screen.get_node("ReasonLabel").text = reason

func update_ui():
	# Update UI elements
	if ui:
		var health_label = ui.get_node_or_null("HUD/HealthLabel")
		if health_label and player:
			health_label.text = "生命: %d/%d" % [player.health, player.max_health]
		
		var core_label = ui.get_node_or_null("HUD/CoreLabel")
		if core_label and core:
			core_label.text = "核心: %d/%d" % [core.health, core.max_health]
		
		var score_label = ui.get_node_or_null("HUD/ScoreLabel")
		if score_label:
			score_label.text = "分数: %d" % score
		
		var level_label = ui.get_node_or_null("HUD/LevelLabel")
		if level_label:
			level_label.text = "关卡: %d" % level
		
		var zombie_label = ui.get_node_or_null("HUD/ZombieLabel")
		if zombie_label:
			zombie_label.text = "剩余丧尸: %d" % zombies_remaining

func _on_restart_button_pressed():
	get_tree().paused = false
	get_tree().reload_current_scene()

func _on_next_level_button_pressed():
	get_tree().paused = false
	level += 1
	get_tree().reload_current_scene()
