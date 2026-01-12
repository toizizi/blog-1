const huoBu = document.getElementById('huo-bu');
const ctx = huoBu.getContext('2d');

let width, height;
let stars = [];
let dusts = [];
let constellations = [];
let meteors = [];
let time = 0;

const config = {
    starCount: 60,
    starMaxSize: 3,
    dustCount: 80,
    starSpeed: 0.1,
    dustSpeed: 0.1,
    planetRadius: 1.0,
    planetGlow: 2.0,
    twinkleSpeedBase: 0.008,
    meteorChance: 0.003,
    meteorSpeedBase: 4
};

function resize() {
    width = huoBu.width = window.innerWidth;
    height = huoBu.height = window.innerHeight;
    initConstellations();
}

class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * config.starMaxSize;
        this.opacity = 0;
        this.fadeIn = true;
        this.maxOpacity = 0.3 + Math.random() * 0.5;
        this.fadeSpeed = 0.005 + Math.random() * 0.01;
        this.twinkleSpeed = config.twinkleSpeedBase + Math.random() * 0.005;
        this.twinkleOffset = Math.random() * Math.PI * 2;
        this.vx = (Math.random() - 0.5) * config.starSpeed;
        this.vy = (Math.random() - 0.5) * config.starSpeed;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        if (this.fadeIn) {
            this.opacity += this.fadeSpeed;
            if (this.opacity >= this.maxOpacity) this.fadeIn = false;
        } else {
            this.opacity -= this.fadeSpeed;
            if (this.opacity <= 0) {
                this.fadeIn = true;
                this.x = Math.random() * width;
                this.y = Math.random() * height;
            }
        }
    }
    draw() {
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * this.twinkleSpeed + this.twinkleOffset));
        ctx.beginPath();
        const spikes = 4;
        const outerRadius = this.size;
        const innerRadius = this.size * 0.4;
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = this.x + radius * Math.cos(angle);
            const y = this.y + radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * twinkle})`;
        ctx.fill();
    }
}

class Dust {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = 0.5 + Math.random() * 1;
        this.opacity = 0.1 + Math.random() * 0.3;
        this.vx = (Math.random() - 0.5) * config.dustSpeed;
        this.vy = (Math.random() - 0.5) * config.dustSpeed;
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
    }
}

class Meteor {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height * 0.5;
        this.length = 100 + Math.random() * 80;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
        this.speed = config.meteorSpeedBase + Math.random() * 3;
        this.opacity = 0;
        this.fadeIn = true;
        this.life = 0;
        this.maxLife = 200 + Math.random() * 50;
    }
    update() {
        this.life++;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        const fadeInDuration = 40;
        const fadeOutDuration = 60;
        if (this.life < fadeInDuration) {
            this.opacity = this.life / fadeInDuration;
        } else if (this.life > this.maxLife - fadeOutDuration) {
            this.opacity = 1 - (this.life - (this.maxLife - fadeOutDuration)) / fadeOutDuration;
        }
        if (this.x > width + this.length || this.y > height + this.length || this.life > this.maxLife || this.opacity <= 0) {
            return false;
        }
        return true;
    }
    draw() {
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;
        const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity * 0.8})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class AriesConstellation {
    constructor(offsetX, offsetY, scale) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.scale = scale;
        this.initShape();
    }
    initShape() {
        const shape = [
            { x: -30, y: 40 },
            { x: 10, y: 20 },
            { x: 0, y: -20 },
            { x: 50, y: -30 },
            { x: 80, y: 10 }
        ];
        const lines = [
            [0, 1], [1, 2], [2, 3], [3, 4], [1, 3]
        ];
        this.planets = shape.map(p => ({
            x: this.offsetX + p.x * this.scale,
            y: this.offsetY + p.y * this.scale,
            radius: config.planetRadius,
            glowOffset: Math.random() * Math.PI * 2
        }));
        this.connections = lines;
    }
    draw() {
        ctx.strokeStyle = 'rgba(220, 220, 220, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        this.connections.forEach(pair => {
            const p1 = this.planets[pair[0]];
            const p2 = this.planets[pair[1]];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        });
        ctx.stroke();
        this.planets.forEach(p => {
            const glow = config.planetGlow + 0.5 * Math.sin(time * 0.03 + p.glowOffset);
            const grad = ctx.createRadialGradient(p.x, p.y, p.radius, p.x, p.y, p.radius + glow);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius + glow, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

function init() {
    resize();
    initConstellations();
    for (let i = 0; i < config.starCount; i++) {
        stars.push(new Star());
    }
    for (let i = 0; i < config.dustCount; i++) {
        dusts.push(new Dust());
    }

    setTimeout(() => {
        document.body.classList.add('jia-zai-wan-cheng');
    }, 100);
}

function initConstellations() {
    constellations = [];
    constellations.push(new AriesConstellation(
        width * 0.75,
        height * 0.25,
        Math.min(width, height) / 1000 * 2.5
    ));
    constellations.push(new AriesConstellation(
        width * 0.25,
        height * 0.75,
        Math.min(width, height) / 1000 * 2.5
    ));
}

function animate() {
    ctx.clearRect(0, 0, width, height);
    time++;
    dusts.forEach(dust => {
        dust.update();
        dust.draw();
    });
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    constellations.forEach(constellation => {
        constellation.draw();
    });
    if (Math.random() < config.meteorChance) {
        meteors.push(new Meteor());
    }
    meteors = meteors.filter(meteor => {
        const alive = meteor.update();
        if (alive) {
            meteor.draw();
        }
        return alive;
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    resize();
    initConstellations();
});

const fanHuiAnNiu = document.getElementById('fan-hui-an-niu');
fanHuiAnNiu.addEventListener('click', function (e) {
    e.preventDefault();
    const targetUrl = this.getAttribute('href');
    document.body.classList.add('tui-chu-dong-hua');
    setTimeout(() => {
        window.location.href = targetUrl;
    }, 1000);
});

init();
animate();