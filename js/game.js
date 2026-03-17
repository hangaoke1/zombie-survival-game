// ==================== 武器类 ====================
class Weapon {
    constructor(name, type, damage, fireRate, range, ammo, color) {
        this.name = name;
        this.type = type;
        this.damage = damage;
        this.fireRate = fireRate;
        this.range = range;
        this.ammo = ammo;
        this.color = color;
        this.isAutomatic = ['smg', 'machinegun'].includes(type);
    }
}

// ==================== 玩家类 ====================
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 200;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.angle = 0;
        
        this.weapons = [
            new Weapon('手枪', 'pistol', 25, 0.4, 400, Infinity, '#ffff00'),
            new Weapon('冲锋枪', 'smg', 15, 0.1, 350, Infinity, '#ffff00'),
            new Weapon('步枪', 'rifle', 60, 0.8, 600, Infinity, '#ffff00'),
            new Weapon('机枪', 'machinegun', 20, 0.05, 350, Infinity, '#ffff00'),
            new Weapon('炸弹', 'bomb', 200, 1.5, 200, Infinity, '#ff6600'),
            new Weapon('裂变炸弹', 'nuke', 500, 3.0, 300, Infinity, '#ff0000'),
            new Weapon('燃烧弹', 'fire', 10, 2.0, 180, Infinity, '#ff3300')
        ];
        this.currentWeaponIndex = 0;
        this.currentWeapon = this.weapons[0];
        this.lastShotTime = 0;
        this.buildCooldown = 0;
    }
    
    update(deltaTime, keys, mouse, canvas) {
        let dx = 0, dy = 0;
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;
        
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
        }
        
        this.x += dx * this.speed * deltaTime;
        this.y += dy * this.speed * deltaTime;
        
        this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
        
        this.angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
        
        if (this.buildCooldown > 0) this.buildCooldown -= deltaTime;
        if (mouse.down && this.currentWeapon.isAutomatic) this.shoot();
    }
    
    switchWeapon(index) {
        if (index >= 0 && index < this.weapons.length) {
            this.currentWeaponIndex = index;
            this.currentWeapon = this.weapons[index];
        }
    }
    
    shoot() {
        const now = Date.now() / 1000;
        if (now - this.lastShotTime < this.currentWeapon.fireRate) return;
        this.lastShotTime = now;
        
        const game = window.game;
        const type = this.currentWeapon.type;
        
        if (['pistol', 'smg', 'rifle', 'machinegun'].includes(type)) {
            game.projectiles.push(new Projectile(this.x, this.y, this.angle, this.currentWeapon));
        } else {
            const angle = Math.atan2(game.mouse.y - this.y, game.mouse.x - this.x);
            game.projectiles.push(new ThrowingProjectile(this.x, this.y, angle, this.currentWeapon));
        }
    }
    
    build(type) {
        if (this.buildCooldown > 0) return;
        const game = window.game;
        const placeDist = 60;
        const placeX = this.x + Math.cos(this.angle) * placeDist;
        const placeY = this.y + Math.sin(this.angle) * placeDist;
        
        if (this.canBuildAt(placeX, placeY, game)) {
            if (type === 'wall') game.buildings.push(new Wall(placeX, placeY));
            else if (type === 'barrel') game.buildings.push(new Barrel(placeX, placeY));
            this.buildCooldown = 0.5;
        }
    }
    
    canBuildAt(x, y, game) {
        const coreDist = Math.sqrt((x - game.core.x) ** 2 + (y - game.core.y) ** 2);
        if (coreDist < game.core.radius + 40) return false;
        
        const playerDist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        if (playerDist < this.radius + 40) return false;
        
        for (const b of game.buildings) {
            const dist = Math.sqrt((x - b.x) ** 2 + (y - b.y) ** 2);
            if (dist < b.radius + 30) return false;
        }
        return true;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        window.game.triggerDamageEffect();
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#2E7D32';
        ctx.beginPath();
        ctx.moveTo(this.radius + 5, 0);
        ctx.lineTo(this.radius - 5, -8);
        ctx.lineTo(this.radius - 5, 8);
        ctx.fill();
        
        ctx.fillStyle = '#666';
        ctx.fillRect(5, -3, 20, 6);
        
        ctx.restore();
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('玩家', this.x, this.y - this.radius - 10);
    }
}

// ==================== 核心类 ====================
class Core {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 30;
        this.maxHealth = 500;
        this.health = this.maxHealth;
        this.pulsePhase = 0;
    }
    
    update(deltaTime) {
        this.pulsePhase += deltaTime * 2;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        window.game.createParticles(this.x, this.y, '#3366ff', 3);
    }
    
    render(ctx) {
        ctx.save();
        const pulse = 1 + Math.sin(this.pulsePhase) * 0.1;
        
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 2 * pulse);
        grad.addColorStop(0, 'rgba(51, 102, 255, 0.8)');
        grad.addColorStop(0.5, 'rgba(51, 102, 255, 0.3)');
        grad.addColorStop(1, 'rgba(51, 102, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#3366ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#6699ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('核心', this.x, this.y);
        
        ctx.restore();
    }
}

// ==================== 丧尸类 ====================
class Zombie {
    constructor(x, y, type = 'normal') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isDead = false;
        
        const types = {
            normal: { hp: 50, speed: 60, dmg: 10, r: 12, color: '#8B4513', score: 10 },
            fast: { hp: 30, speed: 120, dmg: 8, r: 10, color: '#FF6347', score: 15 },
            tank: { hp: 150, speed: 30, dmg: 25, r: 18, color: '#2F4F4F', score: 30 },
            exploder: { hp: 40, speed: 80, dmg: 50, r: 14, color: '#FF1493', score: 25 }
        };
        
        const t = types[type];
        this.maxHealth = t.hp;
        this.health = t.hp;
        this.speed = t.speed;
        this.damage = t.dmg;
        this.radius = t.r;
        this.color = t.color;
        this.score = t.score;
        this.attackCooldown = 0;
    }
    
    update(deltaTime, player, core, buildings) {
        if (this.isDead) return;
        
        let target = null;
        let minDist = Infinity;
        
        const coreDist = Math.sqrt((this.x - core.x) ** 2 + (this.y - core.y) ** 2);
        if (coreDist < minDist) {
            minDist = coreDist;
            target = core;
        }
        
        const playerDist = Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y) ** 2);
        if (playerDist < minDist && playerDist < 250) {
            minDist = playerDist;
            target = player;
        }
        
        let nearestBuilding = null;
        let nearestBuildingDist = Infinity;
        
        for (const b of buildings) {
            if (b.isDead) continue;
            const dist = Math.sqrt((this.x - b.x) ** 2 + (this.y - b.y) ** 2);
            if (dist < nearestBuildingDist) {
                nearestBuildingDist = dist;
                nearestBuilding = b;
            }
        }
        
        if (nearestBuilding && nearestBuildingDist < minDist && nearestBuildingDist < 100) {
            target = nearestBuilding;
            minDist = nearestBuildingDist;
        }
        
        if (target && minDist > target.radius + this.radius - 5) {
            let dx = target.x - this.x;
            let dy = target.y - this.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                dx /= dist;
                dy /= dist;
            }
            
            for (const b of buildings) {
                if (b.isDead || b === target) continue;
                const bdx = b.x - this.x;
                const bdy = b.y - this.y;
                const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
                if (bdist < 50 && bdist > 0) {
                    const push = 1 - (bdist / 50);
                    dx -= (bdx / bdist) * push * 0.5;
                    dy -= (bdy / bdist) * push * 0.5;
                }
            }
            
            const newDist = Math.sqrt(dx * dx + dy * dy);
            if (newDist > 0) {
                dx /= newDist;
                dy /= newDist;
            }
            
            this.x += dx * this.speed * deltaTime;
            this.y += dy * this.speed * deltaTime;
        }
        
        if (target && minDist <= target.radius + this.radius + 5) {
            if (this.attackCooldown <= 0) {
                target.takeDamage(this.damage);
                this.attackCooldown = 1.0;
            }
        }
        
        if (this.attackCooldown > 0) this.attackCooldown -= deltaTime;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0 && !this.isDead) this.die();
    }
    
    die() {
        this.isDead = true;
        window.game.score += this.score;
        if (this.type === 'exploder') {
            window.game.createExplosion(this.x, this.y, 100, 100);
        }
        window.game.createParticles(this.x, this.y, this.color, 8);
    }
    
    render(ctx) {
        if (this.isDead) return;
        ctx.save();
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(this.x - 4, this.y - 3, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 4, this.y - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        const hpPct = this.health / this.maxHealth;
        const barW = 24, barH = 4;
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barW/2, this.y - this.radius - 10, barW, barH);
        ctx.fillStyle = hpPct > 0.5 ? '#0f0' : hpPct > 0.25 ? '#ff0' : '#f00';
        ctx.fillRect(this.x - barW/2, this.y - this.radius - 10, barW * hpPct, barH);
        
        if (this.type !== 'normal') {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Microsoft YaHei';
            ctx.textAlign = 'center';
            const labels = { fast: '快', tank: '坦', exploder: '爆' };
            ctx.fillText(labels[this.type], this.x, this.y + this.radius + 15);
        }
        
        ctx.restore();
    }
}

// ==================== 投射物类 ====================
class Projectile {
    constructor(x, y, angle, weapon) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.weapon = weapon;
        this.damage = weapon.damage;
        this.speed = 600;
        this.radius = 3;
        this.range = weapon.range;
        this.traveled = 0;
        this.isDead = false;
        this.penetration = weapon.type === 'rifle' ? 3 : 1;
        this.hitCount = 0;
    }
    
    update(deltaTime) {
        const dx = Math.cos(this.angle) * this.speed * deltaTime;
        const dy = Math.sin(this.angle) * this.speed * deltaTime;
        this.x += dx;
        this.y += dy;
        this.traveled += Math.sqrt(dx * dx + dy * dy);
        
        if (this.traveled >= this.range) this.isDead = true;
        
        const game = window.game;
        if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
            this.isDead = true;
        }
    }
    
    hit(target) {
        this.hitCount++;
        if (this.hitCount >= this.penetration) this.isDead = true;
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.weapon.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = this.weapon.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle) * 15, this.y - Math.sin(this.angle) * 15);
        ctx.stroke();
        ctx.restore();
    }
}

class ThrowingProjectile {
    constructor(x, y, angle, weapon) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.weapon = weapon;
        this.damage = weapon.damage;
        this.speed = 300;
        this.radius = 8;
        this.range = weapon.range;
        this.isDead = false;
        this.traveled = 0;
    }
    
    update(deltaTime) {
        const dx = Math.cos(this.angle) * this.speed * deltaTime;
        const dy = Math.sin(this.angle) * this.speed * deltaTime;
        this.x += dx;
        this.y += dy;
        this.traveled += Math.sqrt(dx * dx + dy * dy);
        
        if (this.traveled >= this.range) this.explode();
        
        const game = window.game;
        if (this.x < 0 || this.x > game.canvas.width || this.y < 0 || this.y > game.canvas.height) {
            this.explode();
        }
    }
    
    explode() {
        this.isDead = true;
        const game = window.game;
        switch (this.weapon.type) {
            case 'bomb':
                game.createExplosion(this.x, this.y, 100, this.damage);
                break;
            case 'nuke':
                game.createExplosion(this.x, this.y, 200, this.damage);
                break;
            case 'fire':
                game.buildings.push(new FireArea(this.x, this.y));
                break;
        }
    }
    
    hit() {
        this.explode();
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.weapon.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
    }
}

// ==================== 粒子类 ====================
class Particle {
    constructor(x, y, color, size = 1) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = (Math.random() * 3 + 2) * size;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 100 + 50;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1.0;
        this.decay = Math.random() * 2 + 1;
        this.isDead = false;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= this.decay * deltaTime;
        if (this.life <= 0) this.isDead = true;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ==================== 建筑类 ====================
class Wall {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.maxHealth = 200;
        this.health = this.maxHealth;
        this.isDead = false;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            window.game.createParticles(this.x, this.y, '#8B4513', 10);
        }
    }
    
    update(deltaTime) {}
    
    render(ctx) {
        ctx.save();
        const hpPct = this.health / this.maxHealth;
        
        if (hpPct > 0.6) ctx.fillStyle = '#8B4513';
        else if (hpPct > 0.3) ctx.fillStyle = '#A0522D';
        else ctx.fillStyle = '#CD853F';
        
        ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 1;
        for (let i = -this.radius + 8; i < this.radius; i += 10) {
            ctx.beginPath();
            ctx.moveTo(this.x + i, this.y - this.radius);
            ctx.lineTo(this.x + i, this.y + this.radius);
            ctx.stroke();
        }
        
        if (hpPct < 1) {
            const barW = 30, barH = 4;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - barW/2, this.y - this.radius - 8, barW, barH);
            ctx.fillStyle = hpPct > 0.5 ? '#0f0' : hpPct > 0.25 ? '#ff0' : '#f00';
            ctx.fillRect(this.x - barW/2, this.y - this.radius - 8, barW * hpPct, barH);
        }
        
        ctx.restore();
    }
}

class Barrel {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.maxHealth = 50;
        this.health = this.maxHealth;
        this.isDead = false;
    }
    
    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0 && !this.isDead) this.explode();
    }
    
    explode() {
        this.isDead = true;
        window.game.createExplosion(this.x, this.y, 80, 150);
    }
    
    update(deltaTime) {}
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#B22222';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💥', this.x, this.y);
        
        const hpPct = this.health / this.maxHealth;
        if (hpPct < 1) {
            const barW = 24, barH = 3;
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - barW/2, this.y - this.radius - 6, barW, barH);
            ctx.fillStyle = hpPct > 0.5 ? '#0f0' : '#f00';
            ctx.fillRect(this.x - barW/2, this.y - this.radius - 6, barW * hpPct, barH);
        }
        
        ctx.restore();
    }
}

class FireArea {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 60;
        this.duration = 5;
        this.elapsed = 0;
        this.isDead = false;
        this.damage = 10;
        this.lastDamageTime = 0;
    }
    
    update(deltaTime) {
        this.elapsed += deltaTime;
        if (this.elapsed >= this.duration) {
            this.isDead = true;
            return;
        }
        
        this.lastDamageTime += deltaTime;
        if (this.lastDamageTime >= 0.5) {
            this.lastDamageTime = 0;
            const game = window.game;
            game.zombies.forEach(z => {
                if (z.isDead) return;
                const dx = z.x - this.x;
                const dy = z.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.radius) z.takeDamage(this.damage / 2);
            });
            
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = Math.random() * this.radius;
                game.particles.push(new Particle(
                    this.x + Math.cos(angle) * dist,
                    this.y + Math.sin(angle) * dist,
                    '#ff6600', 1.5
                ));
            }
        }
    }
    
    render(ctx) {
        ctx.save();
        const alpha = 1 - (this.elapsed / this.duration);
        ctx.globalAlpha = alpha * 0.6;
        
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        grad.addColorStop(0, 'rgba(255, 100, 0, 0.8)');
        grad.addColorStop(0.5, 'rgba(255, 50, 0, 0.5)');
        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ==================== 游戏主类 ====================
class ZombieSurvivalGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.gameState = 'start';
        this.level = 1;
        this.score = 0;
        
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false };
        
        this.player = null;
        this.core = null;
        this.zombies = [];
        this.projectiles = [];
        this.buildings = [];
        this.particles = [];
        this.maxParticles = 200;
        
        window.game = this;
        
        this.setupInputListeners();
        this.setupUI();
        
        this.lastTime = 0;
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupInputListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.handleKeyPress(e.key);
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', () => {
            this.mouse.down = true;
            if (this.gameState === 'playing') {
                this.player?.shoot();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });
    }
    
    handleKeyPress(key) {
        if (key >= '1' && key <= '7') {
            const weaponIndex = parseInt(key) - 1;
            this.player?.switchWeapon(weaponIndex);
        }
        if (key.toLowerCase() === 'q') this.player?.build('wall');
        if (key.toLowerCase() === 'e') this.player?.build('barrel');
    }
    
    setupUI() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        
        document.querySelectorAll('.weapon-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => this.player?.switchWeapon(index));
        });
        
        document.querySelectorAll('.build-slot').forEach(slot => {
            slot.addEventListener('click', () => this.player?.build(slot.dataset.tool));
        });
    }
    
    startGame() {
        this.level = 1;
        this.score = 0;
        this.initLevel();
        this.gameState = 'playing';
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('victory-screen').classList.add('hidden');
    }
    
    nextLevel() {
        this.level++;
        this.initLevel();
        this.gameState = 'playing';
        document.getElementById('victory-screen').classList.add('hidden');
    }
    
    initLevel() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height / 2 + 100);
        this.core = new Core(this.canvas.width / 2, this.canvas.height / 2);
        this.zombies = [];
        this.projectiles = [];
        this.buildings = [];
        this.particles = [];
        this.spawnZombies();
        this.updateUI();
    }
    
    spawnZombies() {
        const baseCount = 5;
        const levelMultiplier = Math.min(this.level * 2, 20);
        const zombieCount = baseCount + levelMultiplier;
        
        for (let i = 0; i < zombieCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const minDist = 250;
            const maxDist = 400 + this.level * 20;
            const distance = minDist + Math.random() * (maxDist - minDist);
            
            const x = Math.max(50, Math.min(this.canvas.width - 50, 
                this.core.x + Math.cos(angle) * distance));
            const y = Math.max(50, Math.min(this.canvas.height - 50, 
                this.core.y + Math.sin(angle) * distance));
            
            this.zombies.push(new Zombie(x, y, this.selectZombieType()));
        }
    }
    
    selectZombieType() {
        const rand = Math.random();
        if (this.level === 1) return 'normal';
        if (this.level <= 3) return rand < 0.7 ? 'normal' : 'fast';
        if (this.level <= 5) {
            if (rand < 0.5) return 'normal';
            if (rand < 0.8) return 'fast';
            return 'tank';
        }
        if (rand < 0.3) return 'normal';
        if (rand < 0.5) return 'fast';
        if (rand < 0.7) return 'tank';
        return 'exploder';
    }
    
    gameLoop(currentTime) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        if (this.gameState === 'playing') {
            this.update(deltaTime);
        }
        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }
    
    update(deltaTime) {
        this.player?.update(deltaTime, this.keys, this.mouse, this.canvas);
        this.core?.update(deltaTime);
        
        this.zombies.forEach(z => z.update(deltaTime, this.player, this.core, this.buildings));
        
        this.projectiles = this.projectiles.filter(p => {
            p.update(deltaTime);
            return !p.isDead;
        });
        
        this.buildings = this.buildings.filter(b => {
            b.update(deltaTime);
            return !b.isDead;
        });
        
        this.particles = this.particles.filter(p => {
            p.update(deltaTime);
            return !p.isDead;
        });
        
        this.checkCollisions();
        this.checkGameState();
        this.updateUI();
    }
    
    checkCollisions() {
        // 投射物与丧尸
        this.projectiles.forEach(p => {
            if (p.isDead) return;
            this.zombies.forEach(z => {
                if (z.isDead) return;
                const dx = p.x - z.x;
                const dy = p.y - z.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < z.radius + p.radius) {
                    z.takeDamage(p.damage);
                    p.hit(z);
                    this.createParticles(z.x, z.y, '#ff0000', 5);
                }
            });
            
            // 投射物与建筑
            this.buildings.forEach(b => {
                if (b.isDead || b instanceof FireArea) return;
                const dx = p.x - b.x;
                const dy = p.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < b.radius + p.radius) {
                    b.takeDamage(p.damage);
                    p.hit();
                }
            });
        });
        
        // 丧尸与玩家
        this.zombies.forEach(z => {
            if (z.isDead) return;
            
            const dx = this.player.x - z.x;
            const dy = this.player.y - z.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.player.radius + z.radius) {
                this.player.takeDamage(z.damage * 0.1);
                const pushX = dx / dist;
                const pushY = dy / dist;
                z.x -= pushX * 2;
                z.y -= pushY * 2;
            }
            
            // 丧尸与核心
            const cdx = this.core.x - z.x;
            const cdy = this.core.y - z.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
            if (cdist < this.core.radius + z.radius) {
                this.core.takeDamage(z.damage * 0.1);
            }
            
            // 丧尸与建筑
            this.buildings.forEach(b => {
                if (b.isDead || b instanceof FireArea) return;
                const bdx = b.x - z.x;
                const bdy = b.y - z.y;
                const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
                if (bdist < b.radius + z.radius) {
                    b.takeDamage(z.damage * 0.1);
                    const pushX = bdx / bdist;
                    const pushY = bdy / bdist;
                    z.x -= pushX * 2;
                    z.y -= pushY * 2;
                }
            });
        });
    }
    
    checkGameState() {
        if (this.player?.health <= 0) {
            this.gameOver('你已被丧尸消灭！');
            return;
        }
        if (this.core?.health <= 0) {
            this.gameOver('核心已被摧毁！');
            return;
        }
        
        const aliveZombies = this.zombies.filter(z => !z.isDead).length;
        if (aliveZombies === 0 && this.zombies.length > 0) {
            this.victory();
        }
    }
    
    gameOver(reason) {
        this.gameState = 'gameover';
        document.getElementById('game-over-reason').textContent = reason;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    victory() {
        this.gameState = 'victory';
        document.getElementById('victory-screen').classList.remove('hidden');
    }
    
    createParticles(x, y, color, count) {
        if (this.particles.length >= this.maxParticles) return;
        const actualCount = Math.min(count, this.maxParticles - this.particles.length);
        for (let i = 0; i < actualCount; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    createExplosion(x, y, radius, damage) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, '#ff6600', 2));
        }
        
        this.zombies.forEach(z => {
            if (z.isDead) return;
            const dx = z.x - x;
            const dy = z.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius) {
                z.takeDamage(damage * (1 - dist / radius));
            }
        });
        
        this.buildings.forEach(b => {
            if (b.isDead || b instanceof FireArea) return;
            const dx = b.x - x;
            const dy = b.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < radius) {
                b.takeDamage(damage * (1 - dist / radius));
            }
        });
    }
    
    triggerDamageEffect() {
        this.canvas.style.boxShadow = 'inset 0 0 50px rgba(255, 0, 0, 0.5)';
        setTimeout(() => {
            this.canvas.style.boxShadow = 'none';
        }, 200);
    }
    
    updateUI() {
        if (!this.player || !this.core) return;
        
        const hpPct = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('health-fill').style.width = hpPct + '%';
        document.getElementById('health-text').textContent = 
            `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
        
        const corePct = (this.core.health / this.core.maxHealth) * 100;
        document.getElementById('core-health-fill').style.width = corePct + '%';
        document.getElementById('core-health-text').textContent = 
            `核心: ${Math.ceil(this.core.health)}/${this.core.maxHealth}`;
        
        document.getElementById('current-weapon').textContent = this.player.currentWeapon.name;
        
        document.querySelectorAll('.weapon-slot').forEach((slot, index) => {
            slot.classList.toggle('active', index === this.player.currentWeaponIndex);
        });
        
        document.getElementById('level-num').textContent = this.level;
        document.getElementById('score').textContent = this.score;
        
        const aliveZombies = this.zombies.filter(z => !z.isDead).length;
        document.getElementById('zombie-num').textContent = aliveZombies;
    }
    
    render() {
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        
        this.core?.render(this.ctx);
        this.buildings.forEach(b => b.render(this.ctx));
        this.zombies.forEach(z => z.render(this.ctx));
        this.player?.render(this.ctx);
        this.projectiles.forEach(p => p.render(this.ctx));
        this.particles.forEach(p => p.render(this.ctx));
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#3d3d3d';
        this.ctx.lineWidth = 1;
        const gridSize = 50;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
}

// 启动游戏
window.onload = () => {
    new ZombieSurvivalGame();
};
