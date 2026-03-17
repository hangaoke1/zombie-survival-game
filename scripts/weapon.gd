extends Resource

class_name Weapon

@export var name: String
@export var type: String
@export var damage: int
@export var fire_rate: float
@export var range: float
@export var ammo: int
@export var color: Color
@export var penetration: int
@export var is_automatic: bool

func _init(p_name: String = "", p_type: String = "", p_damage: int = 0, 
		p_fire_rate: float = 0.0, p_range: float = 0.0, p_ammo: int = 0,
		p_color: Color = Color.WHITE, p_penetration: int = 1):
	name = p_name
	type = p_type
	damage = p_damage
	fire_rate = p_fire_rate
	range = p_range
	ammo = p_ammo
	color = p_color
	penetration = p_penetration
	is_automatic = type in ["smg", "machinegun"]
