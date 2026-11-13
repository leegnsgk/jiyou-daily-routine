// village.js - Three.js 완전 입체 3D 먼작귀 마을 (클레이 & 로우폴리 3D 모델)

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { store, SHOP_CATALOG } from './data.js';
import { sound } from './sound.js';

export class VillageScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.gridSize = 10; // 10x10 바둑판 타일
    this.tileSize = 2.2; // 타일 한 변 크기
    this.groundTiles = []; // 바닥 타일 메시들
    this.placedObjects = new Map(); // instanceId -> { group, data, itemDef, originY, jumpAnim }
    this.hoverTile = null;

    this.selectedItemToPlace = null;
    this.activeObject = null;
    this.dragState = null;
    this.dragMoved = false;

    this.textureCache = new Map();
    this.clock = new THREE.Clock();
    this.particles = null;

    this.init();
  }

  init() {
    // 1. Scene 생성
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xe8f3e2);
    this.scene.fog = new THREE.Fog(0xe8f3e2, 34, 78);

    // 2. Camera 설정
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 20, 24);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer 설정 (부드러운 그림자 포함)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2.15;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 45;

    // 5. 조명 설정
    const ambientLight = new THREE.HemisphereLight(0xfff8ed, 0x78934d, 1.15);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    sunLight.position.set(16, 26, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    const d = 16;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    this.scene.add(sunLight);

    // 6. 3D 타일 바닥 생성
    this.createCheckerboardGround();

    // 7. 호버 인디케이터
    this.createHoverIndicator();

    // 8. 살랑살랑 벚꽃잎 & 반짝이 파티클
    this.createAmbientParticles();
    this.createSkyDecor();

    // 9. 마을 오브젝트 로드
    this.refreshVillageObjects();

    // 10. 이벤트 등록
    this.setupEvents();

    // 11. 애니메이션 루프
    this.animate();
  }

  // 3D 체커보드 잔디 타일 바닥
  createCheckerboardGround() {
    const half = (this.gridSize * this.tileSize) / 2;
    const tileGeo = new THREE.BoxGeometry(this.tileSize, 0.35, this.tileSize);

    const matLightGrass = new THREE.MeshLambertMaterial({ color: 0xa3e635 }); // 산뜻한 연두
    const matDeepGrass = new THREE.MeshLambertMaterial({ color: 0x84cc16 }); // 싱그러운 풀색

    const grassMat = new THREE.MeshStandardMaterial({ color: 0xc9e8c7, roughness: 1, flatShading: true });
    for (let x = 0; x < this.gridSize; x++) {
      for (let z = 0; z < this.gridSize; z++) {
        const tileMesh = new THREE.Mesh(tileGeo, grassMat);
        const posX = (x + 0.5) * this.tileSize - half;
        const posZ = (z + 0.5) * this.tileSize - half;

        tileMesh.position.set(posX, -0.175, posZ);
        tileMesh.receiveShadow = true;
        tileMesh.userData = { gridX: x, gridZ: z, isGroundTile: true };

        this.scene.add(tileMesh);
        this.groundTiles.push(tileMesh);
      }
    }

    // 도톰한 쿠키색 흙 베이스
    const island = new THREE.Mesh(new THREE.CylinderGeometry(16.6, 9.8, 3.2, 8), new THREE.MeshStandardMaterial({ color: 0x795a40, roughness: 1, flatShading: true }));
    island.position.y = -1.95;
    island.rotation.y = Math.PI / 8;
    island.receiveShadow = true;
    island.castShadow = true;
    this.scene.add(island);
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(10.1, 9.2, 0.72, 8), new THREE.MeshStandardMaterial({ color: 0xb99a67, roughness: 1, flatShading: true }));
    lower.position.y = -3.75;
    lower.rotation.y = Math.PI / 8;
    lower.castShadow = true;
    this.scene.add(lower);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(16.62, 16.2, 0.18, 8), new THREE.MeshStandardMaterial({ color: 0xb8d9ad, roughness: 1, flatShading: true }));
    rim.position.y = -0.39;
    rim.rotation.y = Math.PI / 8;
    rim.receiveShadow = true;
    this.scene.add(rim);
  }

  createSkyDecor() {
    this.skyClouds = [];
    const cloudMat = new THREE.MeshStandardMaterial({ color: 0xfffdf7, roughness: 0.92, flatShading: true });
    const layouts = [[-16, 11, -15, 1.6, 0.18], [15, 14, -10, 1.05, -0.13], [18, 8, 13, 0.82, 0.11], [-19, 15, 10, 0.72, -0.09]];
    layouts.forEach(([x, y, z, size, drift]) => {
      const cloud = new THREE.Group();
      [[0, 0, 0, 0.72], [0.72, 0.08, 0.02, 0.58], [-0.68, 0.05, 0.04, 0.54], [0.12, 0.22, -0.12, 0.62]].forEach(([cx, cy, cz, radius]) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 10), cloudMat);
        puff.position.set(cx, cy, cz);
        puff.scale.set(1.25, 0.78, 0.9);
        puff.castShadow = true;
        cloud.add(puff);
      });
      cloud.position.set(x, y, z);
      cloud.scale.setScalar(size);
      cloud.userData = { drift, startX: x, baseY: y, phase: Math.random() * Math.PI * 2 };
      this.scene.add(cloud);
      this.skyClouds.push(cloud);
    });
    const sun = new THREE.Mesh(new THREE.CircleGeometry(3.2, 48), new THREE.MeshBasicMaterial({ color: 0xf2eccc, transparent: true, opacity: 0.72, depthWrite: false }));
    sun.position.set(-20, 18, -24);
    this.scene.add(sun);
  }

  createHoverIndicator() {
    const geo = new THREE.BoxGeometry(this.tileSize * 0.96, 0.42, this.tileSize * 0.96);
    const mat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.65 });
    this.hoverIndicator = new THREE.Mesh(geo, mat);
    this.hoverIndicator.visible = false;
    this.scene.add(this.hoverIndicator);
  }

  createAmbientParticles() {
    const count = 100;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 35;
      positions[i * 3 + 1] = Math.random() * 22;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 35;
      speeds[i] = 0.5 + Math.random() * 0.8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(16, 16, 12, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.PointsMaterial({
      size: 0.45,
      map: tex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });

    this.particles = new THREE.Points(geo, mat);
    this.particles.userData = { speeds };
    this.scene.add(this.particles);
  }

  // ========================================================
  // 🎨 입체 3D 모델 절차적 생성기 (클레이/로우폴리 스타일)
  // ========================================================

  // 1. 🍄 딸기 버섯집 3D 모델
  create3DHouse() {
    const group = new THREE.Group();

    // 둥근 크림색 원통 집 벽체
    const wallGeo = new THREE.BoxGeometry(1.85, 1.15, 1.55);
    const wallMat = new THREE.MeshLambertMaterial({ color: 0xfffbeb });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.y = 0.58;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    // 딸기 버섯 돔 지붕
    const roofGeo = new THREE.ConeGeometry(1.45, 1.15, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0xf43f5e }); // 선명한 딸기 레드
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 1.65;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    group.add(roof);

    // 지붕 위 흰색 딸기 도트 무늬들
    const dotGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const dotMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const dotCoords = [
      [0.6, 1.45, 0.4], [-0.6, 1.45, 0.4], [0.1, 1.55, 0.7],
      [-0.4, 1.6, -0.5], [0.5, 1.55, -0.5], [0, 1.85, 0]
    ];
    dotCoords.forEach(([x, y, z]) => {
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(x, y, z);
      group.add(dot);
    });

    // 굴뚝
    const chimGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 8);
    const chimMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
    const chim = new THREE.Mesh(chimGeo, chimMat);
    chim.position.set(-0.45, 1.75, -0.3);
    chim.castShadow = true;
    group.add(chim);

    // 갈색 나무 문
    const doorGeo = new THREE.BoxGeometry(0.38, 0.55, 0.1);
    const doorMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, 0.3, 0.82);
    group.add(door);

    // 노란 창문
    const winGeo = new THREE.BoxGeometry(0.42, 0.34, 0.08);
    const winMat = new THREE.MeshStandardMaterial({ color: 0xb9dfd9, roughness: 0.55, flatShading: true });
    [-0.52, 0.52].forEach(x => {
      const win = new THREE.Mesh(winGeo, winMat);
      win.position.set(x, 0.68, 0.8);
      group.add(win);
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.34, 0.09), new THREE.MeshLambertMaterial({ color: 0xfffbeb }));
      crossbar.position.set(x, 0.68, 0.85);
      group.add(crossbar);
    });

    return group;
  }

  // 2. 🌸 무지개 입체 꽃밭 3D 모델
  create3DFlowers() {
    const group = new THREE.Group();

    // 작은 흙 동산 받침대
    const baseGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.12, 16);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.06;
    base.receiveShadow = true;
    group.add(base);

    // 꽃 색상 목록
    const flowerColors = [0xf43f5e, 0xfacc15, 0x38bdf8, 0xc084fc];
    const flowerCoords = [
      [0, 0, 0.45, flowerColors[0]],
      [-0.45, 0, -0.2, flowerColors[1]],
      [0.45, 0, -0.2, flowerColors[2]],
      [0, 0, -0.45, flowerColors[3]]
    ];

    flowerCoords.forEach(([fx, , fz, col]) => {
      const flowerGroup = new THREE.Group();

      // 꽃 줄기
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6);
      const stemMat = new THREE.MeshLambertMaterial({ color: 0x22c55e });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.22;
      stem.castShadow = true;
      flowerGroup.add(stem);

      // 초록 잎사귀
      const leafGeo = new THREE.ConeGeometry(0.08, 0.2, 5);
      const leaf = new THREE.Mesh(leafGeo, stemMat);
      leaf.rotation.z = 0.6;
      leaf.position.set(0.08, 0.18, 0);
      flowerGroup.add(leaf);

      // 입체 꽃잎 5개 링
      const petalGeo = new THREE.SphereGeometry(0.09, 8, 8);
      const petalMat = new THREE.MeshLambertMaterial({ color: col });
      for (let p = 0; p < 5; p++) {
        const ang = (p / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(Math.cos(ang) * 0.12, 0.45, Math.sin(ang) * 0.12);
        petal.scale.set(1, 0.5, 1);
        petal.castShadow = true;
        flowerGroup.add(petal);
      }

      // 가운데 노란 꽃술
      const centerGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const centerMat = new THREE.MeshLambertMaterial({ color: 0xfef08a });
      const center = new THREE.Mesh(centerGeo, centerMat);
      center.position.set(0, 0.46, 0);
      flowerGroup.add(center);

      flowerGroup.position.set(fx, 0, fz);
      group.add(flowerGroup);
    });

    return group;
  }

  // 3. 🍮 거대 푸딩 산 3D 모델
  create3DPudding() {
    const group = new THREE.Group();

    // 달콤한 노란 푸딩 바디 (원뿔대)
    const bodyGeo = new THREE.CylinderGeometry(0.65, 1.05, 1.05, 18);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xfde047 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.525;
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // 달콤한 진한 캐러멜 시럽 꼭대기
    const syrupGeo = new THREE.CylinderGeometry(0.68, 0.74, 0.22, 18);
    const syrupMat = new THREE.MeshLambertMaterial({ color: 0x78350f });
    const syrup = new THREE.Mesh(syrupGeo, syrupMat);
    syrup.position.y = 1.02;
    syrup.castShadow = true;
    group.add(syrup);

    // 시럽 흘러내림 방울들
    const dropGeo = new THREE.SphereGeometry(0.12, 8, 8);
    [[0.65, 0.85, 0], [-0.55, 0.8, 0.3], [0.2, 0.75, -0.6]].forEach(([dx, dy, dz]) => {
      const drop = new THREE.Mesh(dropGeo, syrupMat);
      drop.position.set(dx, dy, dz);
      group.add(drop);
    });

    // 빨간 체리
    const cherryGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const cherryMat = new THREE.MeshLambertMaterial({ color: 0xe11d48 });
    const cherry = new THREE.Mesh(cherryGeo, cherryMat);
    cherry.position.set(0, 1.25, 0);
    cherry.castShadow = true;
    group.add(cherry);

    // 체리 줄기
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 4);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x15803d });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.rotation.z = -0.4;
    stem.position.set(0.06, 1.42, 0);
    group.add(stem);

    return group;
  }

  // 4. 🍭 방울방울 캔디나무 3D 모델
  create3DTree() {
    const group = new THREE.Group();

    // 둥근 통나무 줄기
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.3, 10);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x92400e });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.65;
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    group.add(trunk);

    // 퐁퐁 솟아난 구름모양 캐노피 (구체 4개 결합)
    const leafMat = new THREE.MeshLambertMaterial({ color: 0x4ade80 });
    const leaf1 = new THREE.Mesh(new THREE.SphereGeometry(0.65, 12, 12), leafMat);
    leaf1.position.set(0, 1.5, 0);
    leaf1.castShadow = true;
    group.add(leaf1);

    const leaf2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), leafMat);
    leaf2.position.set(-0.35, 1.35, 0.2);
    leaf2.castShadow = true;
    group.add(leaf2);

    const leaf3 = new THREE.Mesh(new THREE.SphereGeometry(0.48, 10, 10), leafMat);
    leaf3.position.set(0.35, 1.4, -0.15);
    leaf3.castShadow = true;
    group.add(leaf3);

    // 알록달록 사탕 열매들
    const berryColors = [0xf43f5e, 0xfacc15, 0xec4899, 0x38bdf8];
    const berryCoords = [
      [-0.45, 1.5, 0.4, berryColors[0]],
      [0.4, 1.6, 0.35, berryColors[1]],
      [0, 1.85, 0.25, berryColors[2]],
      [0.2, 1.35, -0.5, berryColors[3]]
    ];
    berryCoords.forEach(([bx, by, bz, col]) => {
      const berry = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 8, 8),
        new THREE.MeshLambertMaterial({ color: col })
      );
      berry.position.set(bx, by, bz);
      berry.castShadow = true;
      group.add(berry);
    });

    return group;
  }

  // 5. ⭐ 별빛 가로등 3D 모델
  create3DLamp() {
    const group = new THREE.Group();

    // 베이스 받침
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 0.1, 10),
      new THREE.MeshLambertMaterial({ color: 0x475569 })
    );
    base.position.y = 0.05;
    group.add(base);

    // 가로등 기둥
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 1.7, 8),
      new THREE.MeshLambertMaterial({ color: 0x64748b })
    );
    pole.position.y = 0.9;
    pole.castShadow = true;
    group.add(pole);

    // 램프 헤드 갓
    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(0.35, 0.2, 8),
      new THREE.MeshLambertMaterial({ color: 0x334155 })
    );
    cap.position.y = 1.85;
    group.add(cap);

    // 빛나는 노란 전구
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    bulb.position.y = 1.68;
    group.add(bulb);

    // 꼭대기 별 장식
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.16, 0),
      new THREE.MeshLambertMaterial({ color: 0xfacc15 })
    );
    star.position.y = 2.05;
    group.add(star);

    // 따스한 포인트 조명 추가
    const lampLight = new THREE.PointLight(0xfef08a, 1.2, 5);
    lampLight.position.set(0, 1.7, 0);
    group.add(lampLight);

    return group;
  }

  // 6. 🪵 통나무 울타리 3D 모델
  create3DFence() {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: 0xa16207 });

    // 수직 말뚝 3개
    [-0.5, 0, 0.5].forEach(fx => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.1, 0.85, 6),
        woodMat
      );
      post.position.set(fx, 0.425, 0);
      post.castShadow = true;
      group.add(post);

      // 말뚝 윗부분 뾰족하게
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.15, 6),
        woodMat
      );
      tip.position.set(fx, 0.9, 0);
      group.add(tip);
    });

    // 수평 가로대 2개
    [0.3, 0.6].forEach(fy => {
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.3, 6),
        woodMat
      );
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, fy, 0);
      rail.castShadow = true;
      group.add(rail);
    });

    return group;
  }

  // 7. 🐾 캐릭터 입체 피규어 (파스텔 클레이 원형 베이스 + 입체 피규어 스탠드)
  create3DCharacter(itemDef) {
    const group = new THREE.Group();

    // 1) 귀여운 파스텔톤 클레이 피규어 받침대
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.18, 24);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0xfbcfe8 }); // 딸기우유 핑크 베이스
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.09;
    base.receiveShadow = true;
    base.castShadow = true;
    group.add(base);

    // 받침대 둘레 링
    const ringGeo = new THREE.TorusGeometry(0.85, 0.04, 8, 24);
    const ringMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.18;
    group.add(ring);

    // 2) 캐릭터 스프라이트 본체
    let tex;
    if (this.textureCache.has(itemDef.sprite)) {
      tex = this.textureCache.get(itemDef.sprite);
    } else {
      tex = new THREE.TextureLoader().load(itemDef.sprite);
      this.textureCache.set(itemDef.sprite, tex);
    }

    const spriteMat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    const w = itemDef.w * 1.45;
    const h = itemDef.h * 1.45;
    sprite.scale.set(w, h, 1);
    sprite.position.y = h / 2 + 0.18; // 받침대 바로 위에 딛고 서 있음
    group.add(sprite);

    // 3) 살짝 뒤편 그림자 판
    const shadowGeo = new THREE.CircleGeometry(0.5, 16);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.19;
    group.add(shadow);

    return group;
  }

  // ========================================================
  // 🌟 마을 전체 3D 오브젝트 렌더링
  // ========================================================
  refreshVillageObjects() {
    // 기존 3D 오브젝트 모두 제거
    this.placedObjects.forEach(({ group }) => {
      this.scene.remove(group);
    });
    this.placedObjects.clear();

    const half = (this.gridSize * this.tileSize) / 2;

    store.state.village.forEach(v => {
      const itemDef = SHOP_CATALOG.find(i => i.id === v.itemId);
      if (!itemDef) return;

      let modelGroup;

      // 카테고리/ID별 3D 절차적 지오메트리 분기
      switch (v.itemId) {
        case 'deco_house':
          modelGroup = this.create3DHouse();
          break;
        case 'deco_flowers':
          modelGroup = this.create3DFlowers();
          break;
        case 'deco_pudding':
          modelGroup = this.create3DPudding();
          break;
        case 'deco_tree':
          modelGroup = this.create3DTree();
          break;
        case 'deco_lamp':
          modelGroup = this.create3DLamp();
          break;
        case 'deco_fence':
          modelGroup = this.create3DFence();
          break;
        default:
          // 캐릭터들 (치이카와, 하치와레, 우사기, 모몽가, 쿠리만쥬, 시사, 랏코)
          modelGroup = this.create3DCharacter(itemDef);
          break;
      }

      const posX = (v.x + 0.5) * this.tileSize - half;
      const posZ = (v.z + 0.5) * this.tileSize - half;
      modelGroup.position.set(posX, 0, posZ);

      // 메타데이터 보관
      modelGroup.userData = {
        instanceId: v.instanceId,
        itemId: v.itemId,
        gridX: v.x,
        gridZ: v.z,
        itemDef
      };

      // 자식 메시들에도 부모 instanceId 연결 (Raycast 클릭 감지용)
      modelGroup.traverse(child => {
        if (child.isMesh || child.isSprite) {
          child.userData = modelGroup.userData;
        }
      });

      this.scene.add(modelGroup);

      this.placedObjects.set(v.instanceId, {
        group: modelGroup,
        data: v,
        itemDef,
        originY: 0,
        bounceOffset: Math.random() * Math.PI * 2,
        jumpAnim: 0
      });
    });
  }

  // 특정 3D 오브젝트 클릭 시 뿅! 점프 & 말풍선 연출
  triggerObjectJump(instanceId) {
    const entry = this.placedObjects.get(instanceId);
    if (!entry) return;

    entry.jumpAnim = 1.0;
    sound.playBounce();

    this.showSpeechBubble(entry);
  }

  showSpeechBubble(entry) {
    const bubble = document.getElementById('villageSpeechBubble');
    if (!bubble) return;

    const quote = entry.itemDef.quote || '안녕!';
    bubble.textContent = `${entry.itemDef.name}: "${quote}"`;
    bubble.style.display = 'block';

    const tempV = new THREE.Vector3();
    entry.group.getWorldPosition(tempV);
    tempV.y += (entry.itemDef.h || 1.5) * 1.35;

    tempV.project(this.camera);

    const x = (tempV.x * 0.5 + 0.5) * this.container.clientWidth;
    const y = (-tempV.y * 0.5 + 0.5) * this.container.clientHeight;

    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    clearTimeout(this.bubbleTimer);
    this.bubbleTimer = setTimeout(() => {
      bubble.style.display = 'none';
    }, 2800);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onResize());

    const dom = this.renderer.domElement;
    dom.style.touchAction = 'none';
    dom.addEventListener('pointermove', (e) => this.onPointerMove(e));
    dom.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    dom.addEventListener('pointerup', (e) => this.onPointerUp(e));
    dom.addEventListener('pointercancel', (e) => this.onPointerUp(e));
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  getPointerCoord(e) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    return { x, y };
  }

  onPointerMove(e) {
    const { x, y } = this.getPointerCoord(e);
    this.mouse.set(x, y);

    if (this.dragState && this.dragState.pointerId === e.pointerId) {
      if (Math.hypot(e.clientX - this.dragState.startX, e.clientY - this.dragState.startY) > 5) this.dragMoved = true;
      if (this.dragMoved) this.updateDragTarget();
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.groundTiles);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      this.hoverTile = hit.userData;
      this.hoverIndicator.position.copy(hit.position);
      this.hoverIndicator.position.y += 0.05;
      this.hoverIndicator.visible = true;
    } else {
      this.hoverTile = null;
      this.hoverIndicator.visible = false;
    }
  }

  onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const { x, y } = this.getPointerCoord(e);
    this.mouse.set(x, y);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. 배치된 3D 오브젝트 클릭 검사
    const allObjectChildren = [];
    this.placedObjects.forEach(entry => {
      entry.group.traverse(child => {
        if (child.isMesh || child.isSprite) {
          allObjectChildren.push(child);
        }
      });
    });

    const objectHits = this.raycaster.intersectObjects(allObjectChildren);

    if (objectHits.length > 0) {
      const hitObj = objectHits[0].object;
      const { instanceId } = hitObj.userData;
      if (instanceId) {
        const entry = this.placedObjects.get(instanceId);
        this.dragState = {
          pointerId: e.pointerId, instanceId, userData: hitObj.userData,
          startX: e.clientX, startY: e.clientY, startGridX: entry.data.x, startGridZ: entry.data.z
        };
        this.dragMoved = false;
        this.controls.enabled = false;
        this.renderer.domElement.setPointerCapture(e.pointerId);
        e.preventDefault();
        return;
      }
    }

    // 2. 바닥 타일 클릭 검사 (배치 모드 시)
    const groundHits = this.raycaster.intersectObjects(this.groundTiles);
    if (groundHits.length > 0) {
      const hitTile = groundHits[0].object;
      const { gridX, gridZ } = hitTile.userData;

      if (this.selectedItemToPlace) {
        const res = store.placeItemOnTile(this.selectedItemToPlace, gridX, gridZ);
        if (res.success) {
          sound.playPop();
          this.refreshVillageObjects();
          if (window.onItemPlacedSuccess) {
            window.onItemPlacedSuccess(this.selectedItemToPlace);
          }
        } else {
          alert(res.message);
        }
      }
    }
  }

  updateDragTarget() {
    if (!this.dragState) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObjects(this.groundTiles);
    if (!hits.length) { this.hoverIndicator.visible = false; return; }
    const tile = hits[0].object;
    this.dragState.target = tile.userData;
    this.hoverIndicator.position.copy(tile.position);
    this.hoverIndicator.position.y += 0.05;
    this.hoverIndicator.material.color.set(0xf9a8d4);
    this.hoverIndicator.visible = true;
    const entry = this.placedObjects.get(this.dragState.instanceId);
    if (entry) {
      const half = (this.gridSize * this.tileSize) / 2;
      entry.group.position.x = (tile.userData.gridX + 0.5) * this.tileSize - half;
      entry.group.position.z = (tile.userData.gridZ + 0.5) * this.tileSize - half;
    }
  }

  onPointerUp(e) {
    if (!this.dragState || this.dragState.pointerId !== e.pointerId) return;
    const drag = this.dragState;
    const entry = this.placedObjects.get(drag.instanceId);
    const target = drag.target;
    const occupied = target && store.state.village.some(v => v.instanceId !== drag.instanceId && v.x === target.gridX && v.z === target.gridZ);
    if (entry && this.dragMoved && target && !occupied) {
      entry.data.x = target.gridX;
      entry.data.z = target.gridZ;
      entry.group.userData.gridX = target.gridX;
      entry.group.userData.gridZ = target.gridZ;
      store.saveState();
      sound.playPop();
    } else if (entry) {
      const half = (this.gridSize * this.tileSize) / 2;
      entry.group.position.x = (drag.startGridX + 0.5) * this.tileSize - half;
      entry.group.position.z = (drag.startGridZ + 0.5) * this.tileSize - half;
      if (!this.dragMoved) {
        this.triggerObjectJump(drag.instanceId);
        if (window.onVillageObjectClicked) window.onVillageObjectClicked(drag.userData);
      } else if (occupied) sound.playBounce();
    }
    this.dragState = null;
    this.dragMoved = false;
    this.controls.enabled = true;
    this.hoverIndicator.material.color.set(0xfef08a);
    this.hoverIndicator.visible = false;
  }

  setPlacementItem(itemId) {
    this.selectedItemToPlace = itemId;
    const banner = document.getElementById('placementModeBanner');
    if (banner) {
      if (itemId) {
        const item = SHOP_CATALOG.find(i => i.id === itemId);
        banner.textContent = `📍 [${item ? item.name : ''}] 놓을 바닥 타일을 클릭해주세요! (취소: ESC)`;
        banner.style.display = 'block';
      } else {
        banner.style.display = 'none';
      }
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    this.controls.update();

    // 3D 오브젝트 부드러운 호흡 & 바운스 애니메이션
    this.placedObjects.forEach((entry) => {
      const { group, originY, bounceOffset } = entry;
      let curY = originY + Math.sin(time * 2.5 + bounceOffset) * 0.05;

      if (entry.jumpAnim > 0) {
        const jumpH = Math.sin((1 - entry.jumpAnim) * Math.PI) * 1.4;
        curY += jumpH;
        entry.jumpAnim -= delta * 2.5;
        if (entry.jumpAnim < 0) entry.jumpAnim = 0;
      }

      group.position.y = curY;
      group.rotation.y = Math.sin(time * 0.75 + bounceOffset) * 0.035;
    });

    this.skyClouds?.forEach(cloud => {
      const { drift, startX, phase } = cloud.userData;
      cloud.position.x = startX + Math.sin(time * Math.abs(drift) + phase) * 2.1;
      cloud.position.y = cloud.userData.baseY + Math.sin(time * 0.45 + phase) * 0.12;
    });

    // 벚꽃 파티클 낙하
    if (this.particles) {
      const pos = this.particles.geometry.attributes.position.array;
      const speeds = this.particles.userData.speeds;
      const count = speeds.length;

      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] -= speeds[i] * delta * 2;
        pos[i * 3] += Math.sin(time + i) * 0.02;

        if (pos[i * 3 + 1] < 0) {
          pos[i * 3 + 1] = 22;
          pos[i * 3] = (Math.random() - 0.5) * 35;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 35;
        }
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
