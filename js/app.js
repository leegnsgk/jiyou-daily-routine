// app.js - 메인 앱 진입점 및 탭 전환, 전체 모듈 조율

import { store } from './data.js';
import { VillageScene } from './village.js';
import { RoutineManager } from './routine.js';
import { ShopManager } from './shop.js';
import { RouletteGame } from './roulette.js';
import { sound } from './sound.js';

class AppController {
  constructor() {
    this.villageScene = null;
    this.routineManager = null;
    this.shopManager = null;
    this.rouletteGame = null;
    this.activeTab = 'routine';
  }

  init() {
    // 1. 헤더 포인트 갱신 등록
    window.updateHeaderPoints = () => this.updateHeaderPoints();
    this.updateHeaderPoints();

    // 2. 모듈 인스턴스 생성
    this.villageScene = new VillageScene('villageCanvasContainer');
    window.villageScene = this.villageScene;

    this.routineManager = new RoutineManager();
    this.shopManager = new ShopManager(this.villageScene);
    this.rouletteGame = new RouletteGame();

    // 3. 탭 버튼 이벤트 등록
    this.setupTabs();

    // 4. 최초 브라우저 사용자 상호작용 시 AudioContext 활성화
    const unlockAudio = () => {
      sound.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    console.log('🌸 지유의 먼작귀 루틴 모험 웹앱 시작 완료!');
  }

  updateHeaderPoints() {
    const el = document.getElementById('headerUserPoints');
    if (el) {
      el.textContent = `${store.state.points} P`;
    }
  }

  setupTabs() {
    const tabBtns = document.querySelectorAll('.nav-tab-btn');
    const tabViews = document.querySelectorAll('.tab-view');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        if (this.activeTab === targetTab) return;

        sound.playPop();

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabViews.forEach(v => {
          if (v.id === `tabView_${targetTab}`) {
            v.classList.add('active');
          } else {
            v.classList.remove('active');
          }
        });

        this.activeTab = targetTab;

        // 탭 전환 시 특화 액션
        if (targetTab === 'village') {
          setTimeout(() => {
            this.villageScene.onResize();
          }, 50);
        } else if (targetTab === 'roulette') {
          this.rouletteGame.checkEligibility();
        } else if (targetTab === 'routine') {
          this.routineManager.renderTodayRoutines();
        }
      });
    });

    // 올클리어 배너에서 [룰렛 돌리러 가기] 버튼 클릭 시
    const goRouletteBtn = document.getElementById('goRouletteTabBtn');
    if (goRouletteBtn) {
      goRouletteBtn.addEventListener('click', () => {
        const rTabBtn = document.querySelector('.nav-tab-btn[data-tab="roulette"]');
        if (rTabBtn) rTabBtn.click();
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});

