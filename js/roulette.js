// roulette.js - 행운의 룰렛 회전 애니메이션 및 당첨 보상 로직

import { store } from './data.js';
import { sound } from './sound.js';

export class RouletteGame {
  constructor() {
    this.canvas = document.getElementById('rouletteCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.spinBtn = document.getElementById('spinRouletteBtn');
    this.rouletteStatusMsg = document.getElementById('rouletteStatusMsg');
    this.resultModal = document.getElementById('rouletteResultModal');

    // 룰렛 보상 섹터 목록
    this.sectors = [
      { text: '+30 P', type: 'points', value: 30, color: '#ffadad' },
      { text: '+50 P', type: 'points', value: 50, color: '#ffd6a5' },
      { text: '+70 P', type: 'points', value: 70, color: '#fdffb6' },
      { text: '🌟 200 P', type: 'points', value: 200, color: '#caffbf' },
      { text: '+30 P', type: 'points', value: 30, color: '#9bf6ff' },
      { text: '+100 P', type: 'points', value: 100, color: '#a0c4ff' },
      { text: '+50 P', type: 'points', value: 50, color: '#bdb2ff' },
      { text: '👑 황금보너스', type: 'points', value: 150, color: '#ffc6ff' }
    ];

    this.currentRotation = 0; // 라디안
    this.isSpinning = false;

    this.init();
  }

  init() {
    if (!this.canvas || !this.ctx) return;
    this.drawWheel();
    this.checkEligibility();

    if (this.spinBtn) {
      this.spinBtn.addEventListener('click', () => this.spin());
    }

    const closeResultBtn = document.getElementById('closeRouletteResultBtn');
    if (closeResultBtn) {
      closeResultBtn.addEventListener('click', () => {
        if (this.resultModal) this.resultModal.style.display = 'none';
      });
    }
  }

  checkEligibility() {
    const isCleared = store.isTodayAllCleared();
    const alreadySpun = store.state.rouletteSpunToday;

    if (!isCleared) {
      if (this.spinBtn) {
        this.spinBtn.disabled = true;
        this.spinBtn.classList.add('disabled');
      }
      if (this.rouletteStatusMsg) {
        this.rouletteStatusMsg.innerHTML = '🔒 오늘의 모든 루틴을 100% 완료하면 룰렛이 열려요!';
      }
    } else if (alreadySpun) {
      if (this.spinBtn) {
        this.spinBtn.disabled = true;
        this.spinBtn.classList.add('disabled');
      }
      if (this.rouletteStatusMsg) {
        this.rouletteStatusMsg.innerHTML = '✅ 오늘 룰렛을 이미 돌렸어요! 내일 또 만나요 🌸';
      }
    } else {
      if (this.spinBtn) {
        this.spinBtn.disabled = false;
        this.spinBtn.classList.remove('disabled');
      }
      if (this.rouletteStatusMsg) {
        this.rouletteStatusMsg.innerHTML = '✨ 축하해요! 오늘의 보너스 룰렛을 돌려보세요! ✨';
      }
    }
  }

  drawWheel() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = cx - 12;

    ctx.clearRect(0, 0, width, height);

    const numSectors = this.sectors.length;
    const arc = (Math.PI * 2) / numSectors;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.currentRotation);

    // 섹터 그리기
    for (let i = 0; i < numSectors; i++) {
      const angle = i * arc;
      ctx.beginPath();
      ctx.fillStyle = this.sectors[i].color;
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, angle, angle + arc);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // 텍스트 그리기
      ctx.save();
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#444444';
      ctx.font = 'bold 18px "Apple SD Gothic Neo", sans-serif';
      ctx.shadowColor = 'rgba(255,255,255,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(this.sectors[i].text, radius - 24, 6);
      ctx.restore();
    }

    // 중앙 원 데코
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ff9aa2';
    ctx.stroke();

    ctx.fillStyle = '#ff758c';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', 0, 0);

    ctx.restore();
  }

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.spinBtn.disabled = true;

    // 회전 계산 (최소 5바퀴 + 랜덤 각도)
    const extraRounds = 6 + Math.floor(Math.random() * 4);
    const randomAngle = Math.random() * Math.PI * 2;
    const targetRotation = this.currentRotation + extraRounds * Math.PI * 2 + randomAngle;

    const duration = 4500; // 4.5초
    const startTime = performance.now();
    const startRotation = this.currentRotation;

    let lastTickAngle = startRotation;

    const animateSpin = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutCubic 완화 곡선
      const ease = 1 - Math.pow(1 - progress, 3);
      this.currentRotation = startRotation + (targetRotation - startRotation) * ease;

      // 틱 효과음
      if (Math.abs(this.currentRotation - lastTickAngle) > (Math.PI * 2 / this.sectors.length)) {
        sound.playTick();
        lastTickAngle = this.currentRotation;
      }

      this.drawWheel();

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        this.isSpinning = false;
        this.onSpinComplete();
      }
    };

    requestAnimationFrame(animateSpin);
  }

  onSpinComplete() {
    // 화살표는 상단(12시 방향, 즉 -PI/2)을 가리킴
    const arc = (Math.PI * 2) / this.sectors.length;
    // 화살표 기준 정규화
    let normalized = ( (Math.PI * 1.5) - (this.currentRotation % (Math.PI * 2)) ) % (Math.PI * 2);
    if (normalized < 0) normalized += Math.PI * 2;

    const winningIndex = Math.floor(normalized / arc) % this.sectors.length;
    const reward = this.sectors[winningIndex];

    // 포인트 지급
    store.addPoints(reward.value);
    store.state.rouletteSpunToday = true;
    store.saveState();

    if (window.updateHeaderPoints) window.updateHeaderPoints();

    sound.playFanfare();
    this.showResultModal(reward);
    this.checkEligibility();
  }

  showResultModal(reward) {
    if (!this.resultModal) return;
    const msg = document.getElementById('rouletteResultMsg');
    if (msg) {
      msg.innerHTML = `🎉 축하합니다! <br><strong>[ ${reward.text} ]</strong> 당첨!<br>포인트가 <strong>+${reward.value}P</strong> 적립되었습니다.`;
    }
    this.resultModal.style.display = 'flex';
  }
}

