import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID, NgZone, Renderer2 } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Declara la variable 'Tone' para que TypeScript no se queje, ya que se cargará dinámicamente.
declare const Tone: any;

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './not-found-page.component.html'
})
export class NotFoundPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('glitchTitle') glitchTitle!: ElementRef<HTMLElement>;

  private ctx!: CanvasRenderingContext2D | null;
  private particles: Particle[] = [];
  private mouse = { x: null as number | null, y: null as number | null, radius: 150 };
  private animationFrameId: number | null = null;
  private synth?: any; // Cambiado a 'any' para Tone
  private canPlaySound = true;
  private scriptElement?: HTMLScriptElement;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadScript().then(() => {
          setTimeout(() => {
            this.zone.runOutsideAngular(() => {
              this.initializeAudio();
              this.initializeCanvas();
              this.initializeEventListeners();
            });
          }, 0);
      });
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      window.removeEventListener('resize', this.resizeCanvas);
      document.body.removeEventListener('mousemove', this.handleMouseMove);
      window.removeEventListener('mouseout', this.handleMouseOut);

      if (typeof Tone !== 'undefined' && Tone.context.state !== 'closed') {
        Tone.context.dispose();
      }

      // Eliminar el script al destruir el componente
      if (this.scriptElement) {
        this.renderer.removeChild(document.body, this.scriptElement);
      }
    }
  }

  // ✅ NUEVO MÉTODO: Carga el script de Tone.js dinámicamente
  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.scriptElement = this.renderer.createElement('script');
      if (this.scriptElement) {
        this.scriptElement.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js';
        this.scriptElement.onload = () => resolve();
        this.scriptElement.onerror = () => reject();
        this.renderer.appendChild(document.body, this.scriptElement);
      } else {
        reject();
      }
    });
  }

  private initializeAudio(): void {
    if (typeof Tone === 'undefined') return;
    const noise = new Tone.Noise("pink").start();
    const filter = new Tone.AutoFilter({
        frequency: "8m",
        baseFrequency: 200,
        octaves: 2
    }).toDestination();
    noise.connect(filter);
    noise.volume.value = -40;

    this.synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.1 }
    }).toDestination();
    this.synth.volume.value = -12;
  }

  playSound = () => {
    if (!this.canPlaySound || !this.synth) return;
    if (typeof Tone === 'undefined') return;
    Tone.start().then(() => {
        this.synth?.triggerAttackRelease("C5", "32n");
    });
    this.canPlaySound = false;
    setTimeout(() => { this.canPlaySound = true; }, 50);
  }

  private initializeCanvas(): void {
    const canvas = this.particleCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');
    this.resizeCanvas();
    this.initParticles();
    this.animateParticles();
  }

  private initializeEventListeners(): void {
    window.addEventListener('resize', this.resizeCanvas);
    document.body.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseout', this.handleMouseOut);
  }

  private resizeCanvas = () => {
    if (!this.ctx) return;
    const canvas = this.particleCanvas.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.initParticles();
  }

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.glitchTitle) return;
    this.mouse.x = event.x;
    this.mouse.y = event.y;

    const { clientX, clientY } = event;
    const { offsetWidth, offsetHeight } = document.body;
    const xPercent = (clientX / offsetWidth) - 0.5;
    const yPercent = (clientY / offsetHeight) - 0.5;
    const titleEl = this.glitchTitle.nativeElement;

    titleEl.style.transform = `translate(${xPercent * -10}px, ${yPercent * -10}px)`;
    const randomClip = () => `inset(${Math.random()*100}% ${Math.random()*100}% ${Math.random()*100}% ${Math.random()*100}%)`;
    titleEl.style.setProperty('--clip-path', randomClip());
    if (Math.random() > 0.95) {
        titleEl.style.setProperty('--clip-path', `inset(${Math.random()*100}% 0 ${Math.random()*100}% 0)`);
    }
  }

  private handleMouseOut = () => {
    this.mouse.x = null;
    this.mouse.y = null;
  }

  private initParticles(): void {
    if (!this.ctx) return;
    this.particles = [];
    const canvas = this.particleCanvas.nativeElement;
    let numberOfParticles = (canvas.height * canvas.width) / 9000;
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 1.5) + 0.5;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        this.particles.push(new Particle(x, y, size, this.ctx, this.mouse));
    }
  }

  private animateParticles = () => {
    if (!this.ctx) return;
    this.animationFrameId = requestAnimationFrame(this.animateParticles);
    this.ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
    }
  }
}

class Particle {
  constructor(
    public x: number,
    public y: number,
    public size: number,
    private ctx: CanvasRenderingContext2D,
    private mouse: { x: number | null, y: number | null, radius: number }
  ) {
    this.baseX = this.x;
    this.baseY = this.y;
    this.density = (Math.random() * 30) + 1;
  }
  baseX: number;
  baseY: number;
  density: number;

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    this.ctx.fillStyle = 'rgba(0, 169, 255, 0.5)';
    this.ctx.fill();
  }

  update() {
    if (this.mouse.x !== null && this.mouse.y !== null) {
      let dx = this.mouse.x - this.x;
      let dy = this.mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < this.mouse.radius) {
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = this.mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;
        this.x -= directionX;
        this.y -= directionY;
      } else {
        this.returnToBase();
      }
    } else {
      this.returnToBase();
    }
    this.draw();
  }

  private returnToBase() {
    if (this.x !== this.baseX) {
        let dx = this.x - this.baseX;
        this.x -= dx / 10;
    }
    if (this.y !== this.baseY) {
        let dy = this.y - this.baseY;
        this.y -= dy / 10;
    }
  }
}
