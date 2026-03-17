#!/usr/bin/env python3
"""
像素素材生成器 - 为 Godot 丧尸游戏生成基础像素素材
"""

from PIL import Image, ImageDraw
import os

def create_directory_structure():
    """创建素材目录结构"""
    dirs = [
        "characters",
        "weapons", 
        "effects",
        "ui",
        "environment"
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def create_pixel_image(size, pixels, palette):
    """从像素数据创建图像
    pixels: 2D array of color indices
    palette: dict of index -> color
    """
    img = Image.new('RGBA', (len(pixels[0]), len(pixels)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    for y, row in enumerate(pixels):
        for x, color_idx in enumerate(row):
            if color_idx in palette:
                draw.point((x, y), fill=palette[color_idx])
    
    # Scale up for pixel art look
    scaled = img.resize((size[0], size[1]), Image.NEAREST)
    return scaled

def generate_player():
    """生成玩家角色 - 绿色士兵风格"""
    # 16x16 pixel art
    pixels = [
        [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,1,1,2,2,2,2,1,1,0,0,0,0,0],
        [0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0],
        [0,0,1,2,2,3,3,2,2,3,3,2,1,0,0,0],
        [0,1,1,2,2,3,3,2,2,3,3,2,1,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,4,4,2,2,2,2,4,4,2,1,0,0],
        [0,1,2,2,4,4,2,2,2,2,4,4,2,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,2,5,5,2,2,2,2,1,0,0],
        [0,1,1,2,2,2,5,5,5,5,2,2,2,1,1,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
        [0,0,0,1,1,6,6,6,6,6,6,1,1,0,0,0],
        [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
        [0,0,0,1,6,6,0,0,0,0,6,6,1,0,0,0],
    ]
    
    palette = {
        0: (0, 0, 0, 0),      # Transparent
        1: (34, 85, 51, 255), # Dark green (outline)
        2: (76, 175, 80, 255),# Green (main)
        3: (255, 255, 255, 255),# White (eyes)
        4: (255, 193, 7, 255),# Yellow (details)
        5: (139, 69, 19, 255),# Brown (belt)
        6: (63, 81, 181, 255),# Blue (pants)
    }
    
    img = create_pixel_image((64, 64), pixels, palette)
    img.save("characters/player.png")
    print("✓ Generated: characters/player.png")

def generate_zombie_normal():
    """生成普通丧尸 - 棕色"""
    pixels = [
        [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,1,1,2,2,2,2,1,1,0,0,0,0,0],
        [0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0],
        [0,0,1,2,2,3,3,2,2,3,3,2,1,0,0,0],
        [0,1,1,2,2,3,3,2,2,3,3,2,1,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,4,4,2,2,2,2,4,4,2,1,0,0],
        [0,1,2,2,4,4,2,2,2,2,4,4,2,1,0,0],
        [0,1,2,2,2,2,2,5,5,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,5,5,5,5,2,2,2,1,0,0],
        [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
        [0,0,0,1,1,6,6,6,6,6,6,1,1,0,0,0],
        [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
        [0,0,0,1,6,6,0,0,0,0,6,6,1,0,0,0],
    ]
    
    palette = {
        0: (0, 0, 0, 0),
        1: (60, 40, 20, 255),    # Dark brown
        2: (139, 69, 19, 255),   # Brown
        3: (255, 0, 0, 255),     # Red eyes
        4: (100, 50, 25, 255),   # Darker brown
        5: (80, 40, 20, 255),    # Very dark brown
        6: (60, 50, 40, 255),    # Ragged pants
    }
    
    img = create_pixel_image((64, 64), pixels, palette)
    img.save("characters/zombie_normal.png")
    print("✓ Generated: characters/zombie_normal.png")

def generate_zombie_fast():
    """生成快速丧尸 - 橙红色"""
    pixels = [
        [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,1,1,2,2,2,2,1,1,0,0,0,0,0],
        [0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0],
        [0,0,1,2,2,3,3,2,2,3,3,2,1,0,0,0],
        [0,1,1,2,2,3,3,2,2,3,3,2,1,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,4,4,2,2,2,2,4,4,2,1,0,0],
        [0,1,2,2,4,4,2,2,2,2,4,4,2,1,0,0],
        [0,1,2,2,2,2,2,5,5,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,5,5,5,5,2,2,2,1,0,0],
        [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
        [0,0,0,1,1,6,6,6,6,6,6,1,1,0,0,0],
        [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
        [0,0,0,1,6,6,0,0,0,0,6,6,1,0,0,0],
    ]
    
    palette = {
        0: (0, 0, 0, 0),
        1: (150, 50, 30, 255),
        2: (255, 99, 71, 255),   # Tomato red
        3: (255, 255, 0, 255),   # Yellow eyes
        4: (200, 70, 50, 255),
        5: (180, 60, 40, 255),
        6: (100, 40, 30, 255),
    }
    
    img = create_pixel_image((64, 64), pixels, palette)
    img.save("characters/zombie_fast.png")
    print("✓ Generated: characters/zombie_fast.png")

def generate_zombie_tank():
    """生成坦克丧尸 - 深灰色，更大"""
    pixels = [
        [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
        [0,0,0,1,1,1,2,2,2,2,1,1,1,0,0,0],
        [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
        [0,1,1,2,2,3,3,2,2,3,3,2,2,1,1,0],
        [0,1,2,2,2,3,3,2,2,3,3,2,2,2,1,0],
        [1,1,2,2,4,4,2,2,2,2,4,4,2,2,1,1],
        [1,2,2,2,4,4,2,2,2,2,4,4,2,2,2,1],
        [1,2,2,2,2,2,2,5,5,2,2,2,2,2,2,1],
        [1,2,2,2,2,2,5,5,5,5,2,2,2,2,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
        [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
        [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
        [0,0,0,1,1,6,6,6,6,6,6,1,1,0,0,0],
        [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
        [0,0,0,1,6,6,0,0,0,0,6,6,1,0,0,0],
    ]
    
    palette = {
        0: (0, 0, 0, 0),
        1: (30, 40, 40, 255),
        2: (47, 79, 79, 255),    # Dark slate gray
        3: (255, 50, 50, 255),   # Red eyes
        4: (60, 80, 80, 255),
        5: (40, 60, 60, 255),
        6: (35, 45, 45, 255),
    }
    
    img = create_pixel_image((80, 80), pixels, palette)  # Bigger
    img.save("characters/zombie_tank.png")
    print("✓ Generated: characters/zombie_tank.png")

def generate_zombie_exploder():
    """生成爆炸丧尸 - 粉红色"""
    pixels = [
        [0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0],
        [0,0,0,1,1,2,2,2,2,1,1,0,0,0,0,0],
        [0,0,1,1,2,2,2,2,2,2,1,1,0,0,0,0],
        [0,0,1,2,2,3,3,2,2,3,3,2,1,0,0,0],
        [0,1,1,2,2,3,3,2,2,3,3,2,1,1,0,0],
        [0,1,2,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,1,2,2,4,4,2,2,2,2,4,4,2,1,0,0],
        [0,1,2,2,4,4,2,2,2,2,4,4,2,1,0,0],
        [0,1,2,2,2,2,2,5,5,2,2,2,2,1,0,0],
        [0,1,2,2,2,2,5,5,5,5,2,2,2,1,0,0],
        [0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
        [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
        [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
        [0,0,0,1,1,6,6,6,6,6,6,1,1,0,0,0],
        [0,0,0,1,6,6,6,6,6,6,6,6,1,0,0,0],
        [0,0,0,1,6,6,0,0,0,0,6,6,1,0,0,0],
    ]
    
    palette = {
        0: (0, 0, 0, 0),
        1: (150, 30, 80, 255),
        2: (255, 20, 147, 255),  # Deep pink
        3: (255, 255, 0, 255),   # Yellow eyes
        4: (200, 40, 120, 255),
        5: (255, 100, 50, 255),  # Orange warning
        6: (120, 30, 70, 255),
    }
    
    img = create_pixel_image((64, 64), pixels, palette)
    img.save("characters/zombie_exploder.png")
    print("✓ Generated: characters/zombie_exploder.png")

def generate_core():
    """生成核心建筑 - 蓝色能量核心"""
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Outer glow
    for r in range(35, 15, -2):
        alpha = int(50 * (35 - r) / 20)
        color = (51, 102, 255, alpha)
        draw.ellipse([center-r, center-r, center+r, center+r], fill=color)
    
    # Main core
    draw.ellipse([center-20, center-20, center+20, center+20], fill=(51, 102, 255, 255))
    draw.ellipse([center-12, center-12, center+12, center+12], fill=(102, 153, 255, 255))
    draw.ellipse([center-6, center-6, center+6, center+6], fill=(200, 220, 255, 255))
    
    img.save("environment/core.png")
    print("✓ Generated: environment/core.png")

def generate_wall():
    """生成隔离墙 - 木质"""
    size = 40
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Wood color
    wood_dark = (101, 67, 33, 255)
    wood_light = (139, 90, 43, 255)
    wood_highlight = (160, 120, 60, 255)
    
    # Main block
    draw.rectangle([2, 2, size-2, size-2], fill=wood_light, outline=wood_dark, width=2)
    
    # Wood grain lines
    for i in range(6, size-4, 8):
        draw.line([(i, 4), (i, size-4)], fill=wood_dark, width=1)
    
    # Nails/corners
    draw.rectangle([4, 4, 8, 8], fill=wood_dark)
    draw.rectangle([size-8, 4, size-4, 8], fill=wood_dark)
    draw.rectangle([4, size-8, 8, size-4], fill=wood_dark)
    draw.rectangle([size-8, size-8, size-4, size-4], fill=wood_dark)
    
    img.save("environment/wall.png")
    print("✓ Generated: environment/wall.png")

def generate_barrel():
    """生成油桶 - 红色爆炸桶"""
    size = 32
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    radius = 14
    
    # Main barrel
    draw.ellipse([center-radius, center-radius, center+radius, center+radius], 
                 fill=(220, 20, 60, 255), outline=(150, 10, 40, 255), width=2)
    
    # Inner detail
    draw.ellipse([center-8, center-8, center+8, center+8], 
                 fill=(180, 15, 50, 255))
    
    # Explosion symbol
    draw.polygon([
        (center, center-6),
        (center+4, center+2),
        (center-2, center+2),
        (center+2, center+6),
        (center-4, center+2),
        (center+2, center+2)
    ], fill=(255, 200, 0, 255))
    
    img.save("environment/barrel.png")
    print("✓ Generated: environment/barrel.png")

def generate_bullet():
    """生成子弹"""
    size = 8
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Yellow bullet
    draw.ellipse([1, 1, size-1, size-1], fill=(255, 255, 0, 255), 
                 outline=(200, 200, 0, 255), width=1)
    
    img.save("effects/bullet.png")
    print("✓ Generated: effects/bullet.png")

def generate_explosion():
    """生成爆炸效果"""
    size = 64
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Explosion rings
    colors = [
        (255, 255, 200, 200),  # White-yellow center
        (255, 200, 50, 180),   # Yellow
        (255, 100, 0, 150),    # Orange
        (200, 50, 0, 100),     # Red-orange
        (100, 30, 0, 50),      # Dark red
    ]
    
    radii = [10, 18, 26, 34, 42]
    
    for color, r in zip(colors, radii):
        draw.ellipse([center-r, center-r, center+r, center+r], fill=color)
    
    img.save("effects/explosion.png")
    print("✓ Generated: effects/explosion.png")

def generate_fire():
    """生成火焰效果"""
    size = 48
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Fire gradient
    colors = [
        (255, 255, 100, 220),  # Yellow center
        (255, 150, 0, 180),    # Orange
        (255, 80, 0, 120),     # Red-orange
        (150, 40, 0, 60),      # Dark red
    ]
    
    radii = [8, 16, 24, 32]
    
    for color, r in zip(colors, radii):
        draw.ellipse([center-r, center-r, center+r, center+r], fill=color)
    
    img.save("effects/fire.png")
    print("✓ Generated: effects/fire.png")

def generate_weapon_icons():
    """生成武器图标"""
    weapons = [
        ("pistol", [(0,0,0,0), (80,80,80,255), (150,150,150,255), (200,200,200,255)]),
        ("smg", [(0,0,0,0), (80,80,80,255), (150,150,150,255), (200,200,200,255)]),
        ("rifle", [(0,0,0,0), (80,80,80,255), (150,150,150,255), (200,200,200,255)]),
        ("machinegun", [(0,0,0,0), (80,80,80,255), (150,150,150,255), (200,200,200,255)]),
    ]
    
    # Simple gun shapes
    gun_shapes = {
        "pistol": [
            [0,0,0,0,0,0,1,1,1,0,0,0],
            [0,0,0,0,0,1,2,2,2,1,0,0],
            [0,0,0,0,1,2,2,2,2,2,1,0],
            [0,0,0,1,2,2,2,2,2,2,2,1],
            [0,0,1,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,1,0],
            [0,1,2,2,2,3,3,2,2,1,0,0],
            [0,1,2,2,2,3,3,2,1,0,0,0],
            [0,0,1,2,2,2,2,1,0,0,0,0],
            [0,0,0,1,1,1,1,0,0,0,0,0],
        ],
        "smg": [
            [0,0,0,0,0,0,1,1,1,1,0,0,0,0],
            [0,0,0,0,0,1,2,2,2,2,1,0,0,0],
            [0,0,0,0,1,2,2,2,2,2,2,1,0,0],
            [0,0,0,1,2,2,2,2,2,2,2,2,1,0],
            [0,0,1,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,1,0],
            [0,1,2,2,2,3,3,2,2,2,2,1,0,0],
            [0,0,1,2,2,3,3,2,2,2,1,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,0,0,0,0],
        ],
    }
    
    for name in ["pistol", "smg", "rifle", "machinegun"]:
        shape = gun_shapes.get(name, gun_shapes["pistol"])
        palette = {
            0: (0, 0, 0, 0),
            1: (60, 60, 60, 255),
            2: (120, 120, 120, 255),
            3: (80, 80, 80, 255),
        }
        
        img = create_pixel_image((48, 40), shape, palette)
        img.save(f"weapons/{name}.png")
        print(f"✓ Generated: weapons/{name}.png")

def generate_ui_elements():
    """生成UI元素"""
    # Health bar frame
    size = (200, 24)
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Border
    draw.rectangle([0, 0, size[0]-1, size[1]-1], outline=(255, 255, 255, 255), width=2)
    img.save("ui/health_bar_frame.png")
    print("✓ Generated: ui/health_bar_frame.png")
    
    # Heart icon
    size = 16
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Simple heart shape
    heart_pixels = [
        [0,1,1,0,0,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,1,1,1,1,1,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ]
    
    for y, row in enumerate(heart_pixels):
        for x, pixel in enumerate(row):
            if pixel == 1:
                draw.point((x, y), fill=(255, 0, 0, 255))
    
    img = img.resize((32, 32), Image.NEAREST)
    img.save("ui/heart.png")
    print("✓ Generated: ui/heart.png")

def main():
    """主函数 - 生成所有素材"""
    print("🎨 像素素材生成器")
    print("=" * 40)
    
    # Change to sprites directory
    os.chdir('/home/appops/.openclaw/workspace/zombie-godot-project/assets/sprites')
    
    create_directory_structure()
    
    print("\n📦 生成角色素材...")
    generate_player()
    generate_zombie_normal()
    generate_zombie_fast()
    generate_zombie_tank()
    generate_zombie_exploder()
    
    print("\n🏗️  生成环境素材...")
    generate_core()
    generate_wall()
    generate_barrel()
    
    print("\n💥 生成特效素材...")
    generate_bullet()
    generate_explosion()
    generate_fire()
    
    print("\n🔫 生成武器素材...")
    generate_weapon_icons()
    
    print("\n🖼️  生成UI素材...")
    generate_ui_elements()
    
    print("\n" + "=" * 40)
    print("✅ 所有素材生成完成！")
    print(f"📁 输出目录: {os.getcwd()}")
    
    # List generated files
    print("\n📋 生成的文件列表:")
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.png'):
                filepath = os.path.join(root, file)
                size = os.path.getsize(filepath)
                print(f"  {filepath} ({size} bytes)")

if __name__ == "__main__":
    main()
