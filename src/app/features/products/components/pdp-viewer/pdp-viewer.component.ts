// src/app/features/products/components/pdp-viewer/pdp-viewer.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

@Component({
  selector: 'app-pdp-viewer',
  standalone: true,
  templateUrl: './pdp-viewer.component.html',
})
export class PdpViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef;
  @Input() modelColor = '#222222'; // Color por defecto

  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private animationFrameId: number | null = null;

  ngAfterViewInit(): void {
    this.initScene();
    this.startRenderingLoop();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.renderer.dispose();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();

    // --- Cámara ---
    this.camera = new THREE.PerspectiveCamera(75, this.getAspectRatio(), 0.1, 1000);
    this.camera.position.z = 5;

    // --- Renderer ---
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true, // Fondo transparente
      antialias: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvasRef.nativeElement.clientWidth, this.canvasRef.nativeElement.clientHeight);

    // --- Luces ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    this.scene.add(directionalLight);

    // --- Modelo del Proyector ---
    this.createProjectorModel();

    // --- Controles ---
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 2.0;
  }

  private createProjectorModel(): void {
    const projectorGroup = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: this.modelColor, roughness: 0.5 });
    const lensMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb, roughness: 0.1, metalness: 0.5 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 2), bodyMaterial);
    projectorGroup.add(body);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32), lensMaterial);
    lens.rotation.z = Math.PI / 2;
    lens.position.x = 1.75;
    projectorGroup.add(lens);

    this.scene.add(projectorGroup);
  }

  private startRenderingLoop(): void {
    const render = () => {
      this.animationFrameId = requestAnimationFrame(render);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    render();
  }

  private getAspectRatio(): number {
    return this.canvasRef.nativeElement.clientWidth / this.canvasRef.nativeElement.clientHeight;
  }
}
