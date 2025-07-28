import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, signal, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-gallery.component.html',
})
export class ProductGalleryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') private canvasRef?: ElementRef<HTMLCanvasElement>;

  // Señal para controlar la vista activa (2D o 3D)
  activeView = signal<'2d' | '3d'>('2d');

  // Propiedades de Three.js
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngAfterViewInit(): void {
    // Solo inicializamos Three.js en el navegador
    if (isPlatformBrowser(this.platformId)) {
      if (this.activeView() === '3d') {
        this.initThree();
      }
    }
  }

  ngOnDestroy(): void {
    // Limpiamos la animación al destruir el componente
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Cambia la vista entre 2D y 3D.
   * @param view La vista a la que se quiere cambiar.
   */
  setView(view: '2d' | '3d'): void {
    this.activeView.set(view);
    if (isPlatformBrowser(this.platformId)) {
      if (view === '3d') {
        // Retrasamos la inicialización para asegurar que el canvas sea visible
        setTimeout(() => this.initThree(), 0);
      } else {
        this.stopAnimation();
      }
    }
  }

  private initThree(): void {
    if (!this.canvasRef || !this.canvasRef.nativeElement) return;
    if (this.renderer) return; // Ya inicializado

    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement as HTMLElement;

    // --- Escena y Cámara ---
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // --- Renderer ---
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.resizeCanvas();

    // --- Luces ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);

    // --- Controles ---
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 2.0;

    // --- Modelo 3D (Placeholder) ---
    const projectorGroup = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
    const lensMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.1, metalness: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 2), bodyMaterial);
    projectorGroup.add(body);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32), lensMaterial);
    lens.rotation.z = Math.PI / 2;
    lens.position.x = 1.75;
    projectorGroup.add(lens);
    this.scene.add(projectorGroup);

    // --- Iniciar Animación ---
    this.startAnimation();
    window.addEventListener('resize', this.onWindowResize);
  }

  private startAnimation = (): void => {
    if (this.activeView() !== '3d') return;
    this.animationFrameId = requestAnimationFrame(this.startAnimation);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  private stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    // Liberar recursos de WebGL si es posible
    if (this.renderer) {
        this.renderer.dispose();
        // Forzamos la eliminación del contexto
        const gl = this.renderer.domElement.getContext('webgl');
        gl?.getExtension('WEBGL_lose_context')?.loseContext();
        this.renderer = null!;
    }
  }

  private onWindowResize = (): void => {
    this.resizeCanvas();
  }

  private resizeCanvas(): void {
    if (!this.camera || !this.renderer) return;
    const container = this.renderer.domElement.parentElement as HTMLElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
