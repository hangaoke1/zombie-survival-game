# 丧尸求生 - Godot 版本

使用 Godot 4.x 引擎重构的丧尸求生游戏。

## 项目结构

```
zombie-godot-project/
├── project.godot          # 项目配置文件
├── scripts/               # GDScript 脚本
│   ├── player.gd         # 玩家控制
│   ├── zombie.gd         # 丧尸 AI
│   ├── weapon.gd         # 武器系统
│   ├── projectile.gd     # 子弹/投掷物
│   ├── core.gd           # 核心建筑
│   ├── wall.gd           # 隔离墙
│   ├── barrel.gd         # 油桶
│   └── game_manager.gd   # 游戏管理器
├── scenes/               # 场景文件
│   ├── main.tscn         # 主场景
│   ├── player.tscn       # 玩家场景
│   ├── zombie.tscn       # 丧尸场景
│   ├── core.tscn         # 核心场景
│   ├── projectile.tscn   # 子弹场景
│   ├── wall.tscn         # 墙场景
│   └── barrel.tscn       # 油桶场景
└── assets/               # 资源文件夹
    ├── sprites/          # 精灵图
    ├── sounds/           # 音效
    └── music/            # 音乐
```

## 操作说明

- **WASD / 方向键** - 移动
- **鼠标** - 瞄准
- **鼠标左键** - 射击
- **数字键 1-7** - 切换武器
- **Q** - 放置隔离墙
- **E** - 放置油桶

## 武器列表

1. **手枪** - 平衡型武器
2. **冲锋枪** - 高射速
3. **步枪** - 高伤害，可穿透
4. **机枪** - 超高射速
5. **炸弹** - 范围爆炸
6. **裂变炸弹** - 大范围高伤害
7. **燃烧弹** - 持续伤害区域

## 如何运行

1. 下载并安装 [Godot 4.x](https://godotengine.org/)
2. 打开 Godot 项目导入器
3. 选择 `zombie-godot-project` 文件夹
4. 点击运行按钮或按 F5

## 已生成的像素素材

项目已包含一套基础像素素材，位于 `assets/sprites/`：

### 角色 (characters/)
- `player.png` - 绿色士兵风格玩家角色
- `zombie_normal.png` - 棕色普通丧尸
- `zombie_fast.png` - 橙红色快速丧尸
- `zombie_tank.png` - 深灰色坦克丧尸（更大）
- `zombie_exploder.png` - 粉红色爆炸丧尸

### 环境 (environment/)
- `core.png` - 蓝色能量核心（带发光效果）
- `wall.png` - 木质隔离墙
- `barrel.png` - 红色爆炸油桶

### 特效 (effects/)
- `bullet.png` - 黄色子弹
- `explosion.png` - 爆炸效果
- `fire.png` - 火焰效果

### 武器 (weapons/)
- `pistol.png` - 手枪图标
- `smg.png` - 冲锋枪图标
- `rifle.png` - 步枪图标
- `machinegun.png` - 机枪图标

### UI (ui/)
- `health_bar_frame.png` - 血条边框
- `heart.png` - 心形图标

### 重新生成素材
```bash
cd zombie-godot-project
python3 generate_sprites.py
```

## 更多免费素材资源

### 像素风角色/敌人
- **Kenney.nl** - https://kenney.nl/assets
- **OpenGameArt** - https://opengameart.org
- **itch.io** - https://itch.io/game-assets/free

### 音效和音乐
- **freesound.org** - https://freesound.org
- **FreePD** - https://freepd.com

## 下一步优化建议

1. **添加音效** - 射击、爆炸、丧尸音效
2. **添加背景音乐** - 紧张氛围音乐
3. **粒子效果** - 更好的爆炸和击中效果
4. **动画** - 角色行走、攻击动画
5. **更多关卡** - 不同的地图布局
6. **升级系统** - 武器升级、技能树
7. **更多丧尸类型** - 添加新的敌人类型

## 与原版的改进

| 特性 | 原版 (Canvas) | Godot 版本 |
|------|--------------|-----------|
| 物理引擎 | 手动计算 | ✅ Godot 内置物理 |
| 碰撞检测 | 简单距离检测 | ✅ 精确的碰撞形状 |
| 美术风格 | 纯色几何图形 | ✅ 像素风精灵图 |
| 性能 | 一般 | ✅ 优化更好 |
| 扩展性 | 较难 | ✅ 组件化架构 |
| 导出平台 | Web only | ✅ Web/PC/移动/主机 |
