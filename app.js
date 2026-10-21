const CYBORG_MOODS = {
    cyberpunk: {
        name: 'CYBERPUNK',
        leftNeon: '#00f3ff',
        rightNeon: '#ff007f',
        leftGlow: 'rgba(0, 243, 255, 0.35)',
        rightGlow: 'rgba(255, 0, 127, 0.35)',
        bgColors: ['#030308', '#0b0726', '#18022e', '#030d22'],
        metalDark: '#0a0f1d',
        metalLight: '#1e293b',
        visorBg: 'rgba(4, 10, 24, 0.92)',
        eyeScale: 1.0,
        eyeShape: 'ellipse',
        particleSpeed: 1.0
    },
    zen: {
        name: 'MODO ZEN',
        leftNeon: '#818cf8',
        rightNeon: '#c084fc',
        leftGlow: 'rgba(129, 140, 248, 0.35)',
        rightGlow: 'rgba(192, 132, 252, 0.35)',
        bgColors: ['#02040a', '#0a0d24', '#130a2a', '#040314'],
        metalDark: '#0b0f1a',
        metalLight: '#1e2038',
        visorBg: 'rgba(6, 8, 22, 0.92)',
        eyeScale: 0.6,
        eyeShape: 'calm',
        particleSpeed: 0.4
    },
    surprised: {
        name: 'SORPRENDIDO',
        leftNeon: '#f59e0b',
        rightNeon: '#fb923c',
        leftGlow: 'rgba(245, 158, 11, 0.35)',
        rightGlow: 'rgba(251, 146, 60, 0.35)',
        bgColors: ['#080502', '#261403', '#280c02', '#0c0502'],
        metalDark: '#1a1108',
        metalLight: '#302114',
        visorBg: 'rgba(22, 12, 4, 0.92)',
        eyeScale: 1.4,
        eyeShape: 'circle',
        particleSpeed: 1.6
    },
    berserk: {
        name: 'FURIA BERSERK',
        leftNeon: '#ef4444',
        rightNeon: '#f43f5e',
        leftGlow: 'rgba(239, 68, 68, 0.45)',
        rightGlow: 'rgba(244, 63, 94, 0.45)',
        bgColors: ['#080102', '#2b0307', '#2b0202', '#140103'],
        metalDark: '#1a0608',
        metalLight: '#331014',
        visorBg: 'rgba(22, 2, 5, 0.94)',
        eyeScale: 1.2,
        eyeShape: 'sharp',
        particleSpeed: 2.2
    }
};

class GradientBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.angle = 0;
        this.gridOffset = 0;
    }

    draw(mood) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.angle += 0.005;

        const x1 = width / 2 + Math.cos(this.angle) * width * 0.5;
        const y1 = height / 2 + Math.sin(this.angle) * height * 0.5;
        const x2 = width / 2 - Math.cos(this.angle) * width * 0.5;
        const y2 = height / 2 - Math.sin(this.angle) * height * 0.5;

        const bgGrad = ctx.createLinearGradient(x1, y1, x2, y2);
        bgGrad.addColorStop(0, mood.bgColors[0]);
        bgGrad.addColorStop(0.35, mood.bgColors[1]);
        bgGrad.addColorStop(0.7, mood.bgColors[2]);
        bgGrad.addColorStop(1, mood.bgColors[3]);

        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        const leftRadial = ctx.createRadialGradient(width * 0.2, height * 0.3, 20, width * 0.2, height * 0.3, width * 0.6);
        leftRadial.addColorStop(0, mood.leftGlow);
        leftRadial.addColorStop(1, 'transparent');
        ctx.fillStyle = leftRadial;
        ctx.fillRect(0, 0, width, height);

        const rightRadial = ctx.createRadialGradient(width * 0.8, height * 0.4, 20, width * 0.8, height * 0.4, width * 0.6);
        rightRadial.addColorStop(0, mood.rightGlow);
        rightRadial.addColorStop(1, 'transparent');
        ctx.fillStyle = rightRadial;
        ctx.fillRect(0, 0, width, height);

        this.drawGrid(mood);
    }

    drawGrid(mood) {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const horizon = height * 0.78;

        ctx.save();
        ctx.strokeStyle = mood.leftNeon;
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 1;

        this.gridOffset = (this.gridOffset + 0.6 * mood.particleSpeed) % 30;
        for (let y = horizon; y < height; y += (y - horizon) * 0.18 + 3) {
            const drawY = y + (this.gridOffset * (y - horizon) / height);
            if (drawY < height) {
                ctx.beginPath();
                ctx.moveTo(0, drawY);
                ctx.lineTo(width, drawY);
                ctx.stroke();
            }
        }

        const centerX = width / 2;
        const lines = 22;
        for (let i = -lines; i <= lines; i++) {
            const x = centerX + i * (width / lines) * 1.5;
            ctx.beginPath();
            ctx.moveTo(centerX, horizon);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        ctx.restore();
    }
}

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.shockwaves = [];
        this.maxParticles = 70;

        this.initAmbientParticles();
    }

    initAmbientParticles() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle(x, y, isBurst = false) {
        return {
            x: x !== undefined ? x : Math.random() * this.canvas.width,
            y: y !== undefined ? y : Math.random() * this.canvas.height,
            vx: isBurst ? (Math.random() - 0.5) * 6 : (Math.random() - 0.5) * 0.8,
            vy: isBurst ? (Math.random() - 0.5) * 6 : -(Math.random() * 1.2 + 0.3),
            radius: isBurst ? Math.random() * 3.5 + 1.5 : Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.8 + 0.2,
            decay: isBurst ? Math.random() * 0.02 + 0.015 : 0,
            colorSide: Math.random() > 0.5 ? 'left' : 'right'
        };
    }

    addBurst(x, y, count = 25) {
        for (let i = 0; i < count; i++) {
            this.particles.push(this.createParticle(x, y, true));
        }
    }

    addShockwave(x, y) {
        this.shockwaves.push({
            x: x,
            y: y,
            radius: 5,
            maxRadius: Math.max(this.canvas.width, this.canvas.height) * 0.35,
            alpha: 1.0,
            speed: 12
        });
    }

    update(mood) {
        const spd = mood ? mood.particleSpeed : 1.0;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * spd;
            p.y += p.vy * spd;

            if (p.decay > 0) {
                p.alpha -= p.decay;
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
            } else {
                if (p.y < 0 || p.x < 0 || p.x > this.canvas.width) {
                    p.y = this.canvas.height;
                    p.x = Math.random() * this.canvas.width;
                }
            }
        }

        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            const sw = this.shockwaves[i];
            sw.radius += sw.speed;
            sw.alpha = 1.0 - (sw.radius / sw.maxRadius);

            if (sw.radius >= sw.maxRadius || sw.alpha <= 0) {
                this.shockwaves.splice(i, 1);
            }
        }
    }

    draw(mood) {
        const ctx = this.ctx;

        ctx.save();
        this.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            const color = p.colorSide === 'left' ? mood.leftNeon : mood.rightNeon;
            ctx.fillStyle = color;
            ctx.globalAlpha = p.alpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fill();
        });
        ctx.restore();

        ctx.save();
        this.shockwaves.forEach(sw => {
            ctx.beginPath();
            ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
            ctx.strokeStyle = mood.leftNeon;
            ctx.lineWidth = 4;
            ctx.globalAlpha = sw.alpha;
            ctx.shadowBlur = 20;
            ctx.shadowColor = mood.rightNeon;
            ctx.stroke();
        });
        ctx.restore();
    }
}

class CyborgAvatar {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.x = canvas.width / 2;
        this.y = canvas.height / 2 + 30;

        this.mouseTarget = { x: canvas.width / 2, y: canvas.height / 2 };
        this.lookAt = { x: 0, y: 0 };
        this.springVel = { x: 0, y: 0 };
        this.tiltOffset = { x: 0, y: 0 };

        this.time = 0;
        this.blinkTimer = 0;
        this.blink = 0;
        this.speechFrequency = 0;
    }

    updateMouse(mx, my) {
        const normX = (mx - this.x) / (this.canvas.width * 0.5);
        const normY = (my - this.y) / (this.canvas.height * 0.5);

        this.mouseTarget.x = Math.max(-1, Math.min(1, normX));
        this.mouseTarget.y = Math.max(-1, Math.min(1, normY));
    }

    update(isSpeaking) {
        this.time += 0.04;

        this.lookAt.x += (this.mouseTarget.x - this.lookAt.x) * 0.08;
        this.lookAt.y += (this.mouseTarget.y - this.lookAt.y) * 0.08;

        const forceX = (this.mouseTarget.x - this.tiltOffset.x) * 0.15;
        const forceY = (this.mouseTarget.y - this.tiltOffset.y) * 0.15;
        
        this.springVel.x = (this.springVel.x + forceX) * 0.78;
        this.springVel.y = (this.springVel.y + forceY) * 0.78;
        
        this.tiltOffset.x += this.springVel.x;
        this.tiltOffset.y += this.springVel.y;

        this.blinkTimer++;
        if (this.blinkTimer > 180) {
            this.blink = Math.sin((this.blinkTimer - 180) * 0.35);
            if (this.blinkTimer > 198) {
                this.blinkTimer = 0;
                this.blink = 0;
            }
        }

        if (isSpeaking) {
            this.speechFrequency = Math.sin(this.time * 16) * 0.5 + 0.5;
        } else {
            this.speechFrequency = 0;
        }
    }

    draw(mood) {
        const ctx = this.ctx;
        
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2 + 35;

        const floatY = Math.sin(this.time * 1.8) * 8;
        const headX = this.x + this.tiltOffset.x * 32;
        const headY = this.y + floatY + this.tiltOffset.y * 18;

        ctx.save();

        this.drawTorso(ctx, this.x, this.y + floatY, mood);

        ctx.fillStyle = mood.metalDark;
        ctx.strokeStyle = mood.leftNeon;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(headX - 28, headY + 80, 56, 38, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = mood.metalDark;
        ctx.strokeStyle = mood.leftNeon;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX - 90, headY - 10);
        ctx.lineTo(headX - 120, headY - 48);
        ctx.lineTo(headX - 90, headY + 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = mood.rightNeon;
        ctx.beginPath();
        ctx.moveTo(headX + 90, headY - 10);
        ctx.lineTo(headX + 120, headY - 48);
        ctx.lineTo(headX + 90, headY + 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.save();
        ctx.fillStyle = mood.metalLight;
        ctx.strokeStyle = mood.metalDark;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.roundRect(headX - 90, headY - 95, 180, 175, [42, 42, 28, 28]);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = mood.leftNeon;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 12;
        ctx.shadowColor = mood.leftNeon;
        ctx.beginPath();
        ctx.arc(headX - 65, headY - 20, 58, Math.PI * 0.75, Math.PI * 1.25);
        ctx.stroke();

        ctx.strokeStyle = mood.rightNeon;
        ctx.shadowColor = mood.rightNeon;
        ctx.beginPath();
        ctx.arc(headX + 65, headY - 20, 58, Math.PI * 1.75, Math.PI * 0.25);
        ctx.stroke();
        ctx.restore();

        const visorX = headX - 76 + this.lookAt.x * 10;
        const visorY = headY - 72 + this.lookAt.y * 7;

        ctx.save();
        ctx.fillStyle = mood.visorBg;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(visorX, visorY, 152, 90, 20);
        ctx.fill();
        ctx.stroke();

        const visorGrad = ctx.createLinearGradient(visorX, visorY, visorX + 152, visorY + 90);
        visorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        visorGrad.addColorStop(0.3, 'transparent');
        visorGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        ctx.fillStyle = visorGrad;
        ctx.fill();
        ctx.restore();

        this.drawEyes(ctx, visorX + 76, visorY + 42, mood);
        this.drawMouth(ctx, headX, headY + 48, mood);

        ctx.restore();
    }

    drawTorso(ctx, x, y, mood) {
        ctx.save();
        ctx.fillStyle = mood.metalDark;
        ctx.strokeStyle = mood.metalLight;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x - 108, y + 110, 216, 115, [28, 28, 10, 10]);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = mood.leftNeon;
        ctx.shadowBlur = 10;
        ctx.shadowColor = mood.leftNeon;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x - 102, y + 125);
        ctx.lineTo(x - 65, y + 125);
        ctx.stroke();

        ctx.strokeStyle = mood.rightNeon;
        ctx.shadowColor = mood.rightNeon;
        ctx.beginPath();
        ctx.moveTo(x + 102, y + 125);
        ctx.lineTo(x + 65, y + 125);
        ctx.stroke();

        const coreRadius = 24;
        const pulseScale = 1 + (this.speechFrequency * 0.3) + Math.sin(this.time * 3) * 0.06;

        ctx.translate(x, y + 158);
        ctx.scale(pulseScale, pulseScale);

        ctx.beginPath();
        ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = mood.metalLight;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, coreRadius * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = mood.leftNeon;
        ctx.shadowBlur = 22;
        ctx.shadowColor = mood.leftNeon;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, coreRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = mood.rightNeon;
        ctx.fill();

        ctx.restore();
    }

    drawEyes(ctx, centerX, centerY, mood) {
        ctx.save();

        const eyeSpacing = 30;
        const eyeXLeft = centerX - eyeSpacing + this.lookAt.x * 5;
        const eyeXRight = centerX + eyeSpacing + this.lookAt.x * 5;
        const eyeY = centerY + this.lookAt.y * 4;

        const baseScale = mood.eyeScale || 1.0;
        const eyeHeight = Math.max(2, 16 * baseScale * (1 - this.blink));
        const eyeWidth = 14 * baseScale;

        ctx.shadowBlur = 15;

        if (mood.eyeShape === 'circle') {
            ctx.fillStyle = mood.leftNeon;
            ctx.shadowColor = mood.leftNeon;
            ctx.beginPath();
            ctx.arc(eyeXLeft, eyeY, eyeWidth, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = mood.rightNeon;
            ctx.shadowColor = mood.rightNeon;
            ctx.beginPath();
            ctx.arc(eyeXRight, eyeY, eyeWidth, 0, Math.PI * 2);
            ctx.fill();
        } else if (mood.eyeShape === 'sharp') {
            ctx.fillStyle = mood.leftNeon;
            ctx.shadowColor = mood.leftNeon;
            ctx.beginPath();
            ctx.moveTo(eyeXLeft - 15, eyeY - 8);
            ctx.lineTo(eyeXLeft + 15, eyeY + 4);
            ctx.lineTo(eyeXLeft - 15, eyeY + 10);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = mood.rightNeon;
            ctx.shadowColor = mood.rightNeon;
            ctx.beginPath();
            ctx.moveTo(eyeXRight + 15, eyeY - 8);
            ctx.lineTo(eyeXRight - 15, eyeY + 4);
            ctx.lineTo(eyeXRight + 15, eyeY + 10);
            ctx.closePath();
            ctx.fill();
        } else if (mood.eyeShape === 'calm') {
            ctx.strokeStyle = mood.leftNeon;
            ctx.shadowColor = mood.leftNeon;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(eyeXLeft, eyeY, 12, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();

            ctx.strokeStyle = mood.rightNeon;
            ctx.shadowColor = mood.rightNeon;
            ctx.beginPath();
            ctx.arc(eyeXRight, eyeY, 12, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
        } else {
            ctx.fillStyle = mood.leftNeon;
            ctx.shadowColor = mood.leftNeon;
            ctx.beginPath();
            ctx.ellipse(eyeXLeft, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = mood.rightNeon;
            ctx.shadowColor = mood.rightNeon;
            ctx.beginPath();
            ctx.ellipse(eyeXRight, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        if (mood.eyeShape !== 'calm') {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eyeXLeft + this.lookAt.x * 3, eyeY + this.lookAt.y * 2, 3.5, 0, Math.PI * 2);
            ctx.arc(eyeXRight + this.lookAt.x * 3, eyeY + this.lookAt.y * 2, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawMouth(ctx, x, y, mood) {
        ctx.save();

        const bars = 9;
        const barWidth = 4.5;
        const gap = 3.5;
        const totalWidth = (bars * barWidth) + ((bars - 1) * gap);
        const startX = x - totalWidth / 2;

        ctx.shadowBlur = 8;

        for (let i = 0; i < bars; i++) {
            const isEven = i % 2 === 0;
            const color = isEven ? mood.leftNeon : mood.rightNeon;
            ctx.fillStyle = color;
            ctx.shadowColor = color;

            let h = 4;
            if (this.speechFrequency > 0) {
                h = Math.sin(this.time * 20 + i * 1.5) * 14 * this.speechFrequency + 7;
            }

            const bx = startX + i * (barWidth + gap);
            ctx.beginPath();
            ctx.roundRect(bx, y - h / 2, barWidth, h, 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

class SpeechController {
    constructor(onStatusUpdate) {
        this.synth = window.speechSynthesis;
        this.onStatusUpdate = onStatusUpdate;
        this.isSpeaking = false;
        this.voices = [];

        this.initVoices();
    }

    initVoices() {
        const load = () => {
            this.voices = this.synth.getVoices().filter(v => v.lang.includes('es'));
        };
        load();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = load;
        }
    }

    speak(text, pitch = 0.9, rate = 1.0) {
        if (this.synth.speaking) this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        if (this.voices.length > 0) {
            utterance.voice = this.voices[0];
        }

        utterance.pitch = pitch;
        utterance.rate = rate;

        utterance.onstart = () => {
            this.isSpeaking = true;
            if (this.onStatusUpdate) this.onStatusUpdate(true, text);
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            if (this.onStatusUpdate) this.onStatusUpdate(false, 'Sistemas en espera. Selecciona un comando o estado de ánimo.');
        };

        this.synth.speak(utterance);
    }
}

class Application {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.mood = CYBORG_MOODS.cyberpunk;

        this.background = new GradientBackground(this.canvas);
        this.particles = new ParticleSystem(this.canvas);
        this.avatar = new CyborgAvatar(this.canvas);
        this.speech = new SpeechController((isSpeaking, text) => {
            this.updateSubtitleHUD(isSpeaking, text);
        });

        this.lastFpsUpdate = performance.now();
        this.frameCount = 0;
        this.fps = 60;

        this.initEvents();
        this.resize();
        this.loop();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initEvents() {
        window.addEventListener('resize', () => this.resize());

        const handleMove = (x, y) => {
            this.avatar.updateMouse(x, y);
            this.particles.addBurst(x, y, 1);
        };

        window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
        });

        window.addEventListener('click', (e) => {
            if (e.target.closest('.pointer-events-auto')) return;

            this.particles.addShockwave(e.clientX, e.clientY);
            this.particles.addBurst(e.clientX, e.clientY, 25);
            this.speakPreset('clic');
        });

        document.getElementById('custom-text-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.speakCustomText();
        });
    }

    setMood(key) {
        if (CYBORG_MOODS[key]) {
            this.mood = CYBORG_MOODS[key];
            document.getElementById('hud-mood').innerText = this.mood.name;
        }
    }

    speakPreset(key) {
        const pitch = parseFloat(document.getElementById('slider-pitch').value);
        const rate = parseFloat(document.getElementById('slider-rate').value);

        const frases = {
            saludo: "¡Saludos, humano! Sistema Cyber-Core optimizado y listo.",
            estado: "Diagnóstico de red neón completado. Núcleo cuántico funcionando al cien por ciento.",
            chiste: "¿Por qué los robots no se estresan? Porque tienen todo bajo control de versiones.",
            mision: "Mi objetivo es ofrecerte una experiencia visual e interactiva de nivel profesional.",
            clic: "Onda de choque de energía registrada en las coordenadas."
        };

        if (frases[key]) {
            this.speech.speak(frases[key], pitch, rate);
        }
    }

    speakCustomText() {
        const input = document.getElementById('custom-text-input');
        if (input.value.trim() !== "") {
            const pitch = parseFloat(document.getElementById('slider-pitch').value);
            const rate = parseFloat(document.getElementById('slider-rate').value);
            this.speech.speak(input.value, pitch, rate);
            input.value = "";
        }
    }

    updateSubtitleHUD(isSpeaking, text) {
        const html = `<i class="fa-solid fa-terminal text-fuchsia-400 mr-1.5"></i>${text}`;
        document.getElementById('speech-subtitles').innerHTML = html;
        document.getElementById('speech-subtitles-mobile').innerHTML = html;
    }

    calculateFPS(now) {
        this.frameCount++;
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            document.getElementById('hud-fps').innerText = `${this.fps} FPS`;
        }
    }

    loop(now = performance.now()) {
        this.calculateFPS(now);

        this.background.draw(this.mood);

        this.particles.update(this.mood);
        this.particles.draw(this.mood);

        this.avatar.update(this.speech.isSpeaking);
        this.avatar.draw(this.mood);

        requestAnimationFrame((timestamp) => this.loop(timestamp));
    }
}

let app;
window.onload = () => {
    app = new Application();
};