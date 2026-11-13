// routine.js - 루틴 체크리스트 및 루틴 관리(CRUD) 모달 구현

import { store } from './data.js';
import { sound } from './sound.js';

export class RoutineManager {
  constructor() {
    this.listContainer = document.getElementById('routineCardsContainer');
    this.progressFill = document.getElementById('routineProgressFill');
    this.progressText = document.getElementById('routineProgressText');
    this.todayTitle = document.getElementById('todayTitle');
    this.allClearBanner = document.getElementById('allClearBanner');

    // 모달 관련 요소
    this.modal = document.getElementById('routineManageModal');
    this.currentManageDay = 'Monday';

    this.init();
  }

  init() {
    this.renderTodayRoutines();
    this.setupModalEvents();
  }

  renderTodayRoutines() {
    const day = store.getTodayDayName();
    const routines = store.getTodayRoutines();

    const dayKoreanMap = {
      'Monday': '월요일', 'Tuesday': '화요일', 'Wednesday': '수요일',
      'Thursday': '목요일', 'Friday': '금요일', 'Saturday': '토요일', 'Sunday': '일요일'
    };
    if (this.todayTitle) {
      this.todayTitle.textContent = `🌸 ${dayKoreanMap[day]}의 루틴 모험`;
    }

    if (!this.listContainer) return;
    this.listContainer.innerHTML = '';

    if (routines.length === 0) {
      this.listContainer.innerHTML = `<div class="empty-routine-msg">오늘 등록된 루틴이 없어요! [⚙️ 루틴 관리]에서 추가해보세요.</div>`;
      this.updateProgress(0, 0);
      return;
    }

    let completedCount = 0;

    routines.forEach((r, idx) => {
      if (r.done) completedCount++;

      const card = document.createElement('div');
      card.className = `routine-card ${r.done ? 'completed' : ''}`;
      card.innerHTML = `
        <div class="routine-check-box ${r.done ? 'checked' : ''}">
          ${r.done ? '✓' : ''}
        </div>
        <div class="routine-info">
          <span class="routine-number">#${idx + 1}</span>
          <span class="routine-text">${r.text}</span>
        </div>
        <div class="routine-badge ${r.done ? 'done-badge' : ''}">
          ${r.done ? '완료! 🌟' : '+10 P'}
        </div>
      `;

      card.addEventListener('click', (e) => {
        this.onRoutineClicked(r.id, card, e);
      });

      this.listContainer.appendChild(card);
    });

    this.updateProgress(completedCount, routines.length);
  }

  onRoutineClicked(id, cardElement, event) {
    const res = store.toggleRoutine(id);
    if (!res.routine) return;

    if (res.routine.done) {
      sound.playCoin();
      this.showCoinFloatingText(event.clientX, event.clientY);
    } else {
      sound.playPop();
    }

    // 헤더 포인트 UI 갱신
    if (window.updateHeaderPoints) {
      window.updateHeaderPoints();
    }

    // 화면 다시 렌더링
    this.renderTodayRoutines();

    // 올클리어 여부 체크
    if (res.allCleared) {
      sound.playFanfare();
      this.showAllClearCelebration();
    }
  }

  showCoinFloatingText(x, y) {
    const floater = document.createElement('div');
    floater.className = 'floating-coin-text';
    floater.textContent = '+10 🪙';
    floater.style.left = `${x || window.innerWidth / 2}px`;
    floater.style.top = `${y || window.innerHeight / 2}px`;
    document.body.appendChild(floater);

    setTimeout(() => {
      floater.remove();
    }, 1200);
  }

  updateProgress(done, total) {
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    if (this.progressFill) {
      this.progressFill.style.width = `${percent}%`;
    }
    if (this.progressText) {
      this.progressText.textContent = `${done} / ${total} 완료 (${percent}%)`;
    }

    const isAllDone = total > 0 && done === total;
    const rouletteNavBtn = document.getElementById('rouletteTabNavBtn');
    const rouletteBadge = document.getElementById('rouletteReadyBadge');

    if (this.allClearBanner) {
      if (isAllDone) {
        this.allClearBanner.style.display = 'flex';
      } else {
        this.allClearBanner.style.display = 'none';
      }
    }

    // 룰렛 탭 버튼 반짝이 & 뱃지 갱신
    if (rouletteNavBtn && rouletteBadge) {
      if (isAllDone && !store.state.rouletteSpunToday) {
        rouletteNavBtn.classList.add('roulette-ready-glow');
        rouletteBadge.style.display = 'inline-block';
      } else {
        rouletteNavBtn.classList.remove('roulette-ready-glow');
        rouletteBadge.style.display = 'none';
      }
    }
  }

  showAllClearCelebration() {
    // 팡파레 & 꽃가루 폭죽 효과
    const confettiCount = 50;
    for (let i = 0; i < confettiCount; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.backgroundColor = ['#ff6b8b', '#ffd166', '#06d6a0', '#118ab2', '#ff9f1c', '#a855f7'][Math.floor(Math.random() * 6)];
      piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      piece.style.animationDelay = `${Math.random() * 0.5}s`;
      document.body.appendChild(piece);

      setTimeout(() => piece.remove(), 4000);
    }
  }

  // 루틴 관리 모달 세팅
  setupModalEvents() {
    const openBtn = document.getElementById('openRoutineManageBtn');
    const closeBtn = document.getElementById('closeRoutineManageBtn');
    const dayTabs = document.querySelectorAll('.modal-day-tab');
    const addBtn = document.getElementById('addRoutineBtn');
    const addInput = document.getElementById('newRoutineInput');
    const resetBtn = document.getElementById('resetRoutinesBtn');
    const exportBtn = document.getElementById('exportBackupBtn');
    const importInput = document.getElementById('importBackupInput');

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        this.currentManageDay = store.getTodayDayName();
        this.openModal();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    dayTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        dayTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentManageDay = tab.dataset.day;
        this.renderModalRoutineList();
      });
    });

    if (addBtn && addInput) {
      addBtn.addEventListener('click', () => {
        const text = addInput.value.trim();
        if (!text) return;
        store.addRoutine(this.currentManageDay, text);
        addInput.value = '';
        this.renderModalRoutineList();
        this.renderTodayRoutines();
      });
      addInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addBtn.click();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('모든 요일의 루틴을 처음 기본 스케줄로 복원하시겠습니까?')) {
          store.resetToDefaultSchedule();
          this.renderModalRoutineList();
          this.renderTodayRoutines();
          alert('기본 스케줄로 복원되었습니다! 🌸');
        }
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        store.exportBackupJSON();
      });
    }

    if (importInput) {
      importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = store.importBackupJSON(event.target.result);
          if (res.success) {
            alert('성공적으로 백업 데이터를 불러왔습니다! 🎉');
            this.renderModalRoutineList();
            this.renderTodayRoutines();
            if (window.updateHeaderPoints) window.updateHeaderPoints();
            if (window.villageScene) window.villageScene.refreshVillageObjects();
          } else {
            alert('불러오기 실패: ' + res.error);
          }
        };
        reader.readAsText(file);
      });
    }
  }

  openModal() {
    if (!this.modal) return;
    this.modal.style.display = 'flex';

    // 활성 탭 맞추기
    document.querySelectorAll('.modal-day-tab').forEach(t => {
      if (t.dataset.day === this.currentManageDay) t.classList.add('active');
      else t.classList.remove('active');
    });

    this.renderModalRoutineList();
  }

  closeModal() {
    if (!this.modal) return;
    this.modal.style.display = 'none';
  }

  renderModalRoutineList() {
    const container = document.getElementById('modalRoutineItemList');
    if (!container) return;
    container.innerHTML = '';

    const list = store.state.schedule[this.currentManageDay] || [];

    if (list.length === 0) {
      container.innerHTML = '<div class="empty-modal-msg">이 요일에는 등록된 루틴이 없습니다. 아래에서 추가해보세요!</div>';
      return;
    }

    list.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'modal-routine-row';
      row.innerHTML = `
        <span class="row-order">#${idx + 1}</span>
        <input type="text" class="row-input" value="${item.text}">
        <div class="row-actions">
          <button class="save-row-btn" title="수정 저장">💾</button>
          <button class="del-row-btn" title="삭제">🗑️</button>
        </div>
      `;

      const input = row.querySelector('.row-input');
      const saveBtn = row.querySelector('.save-row-btn');
      const delBtn = row.querySelector('.del-row-btn');

      saveBtn.addEventListener('click', () => {
        const newText = input.value.trim();
        if (!newText) return;
        store.editRoutine(this.currentManageDay, item.id, newText);
        sound.playPop();
        this.renderTodayRoutines();
        alert('수정되었습니다!');
      });

      delBtn.addEventListener('click', () => {
        if (confirm(`'${item.text}' 항목을 삭제할까요?`)) {
          store.deleteRoutine(this.currentManageDay, item.id);
          sound.playPop();
          this.renderModalRoutineList();
          this.renderTodayRoutines();
        }
      });

      container.appendChild(row);
    });
  }
}

