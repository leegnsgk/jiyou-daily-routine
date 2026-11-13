// data.js - 데이터 스토리지 및 기본 스케줄 관리

export const DEFAULT_SCHEDULE = {
  "Monday": [
    { "text": "원리샘1일차", "id": "default-1-1", "done": false, "sortOrder": 1 },
    { "text": "플라토1장", "id": "default-1-2", "done": false, "sortOrder": 2 },
    { "text": "브릭스유닛1", "id": "default-1-3", "done": false, "sortOrder": 3 },
    { "text": "화상영어6시", "id": "default-1-4", "done": false, "sortOrder": 4 },
    { "text": "뿌독1단원", "id": "default-1-5", "done": false, "sortOrder": 5 },
    { "text": "피아노연습", "id": "default-1-6", "done": false, "sortOrder": 6 }
  ],
  "Tuesday": [
    { "text": "원리샘1일차", "id": "default-2-1", "done": false, "sortOrder": 1 },
    { "text": "디딤돌1장", "id": "default-2-2", "done": false, "sortOrder": 2 },
    { "text": "기적의영문장1스텝", "id": "default-2-3", "done": false, "sortOrder": 3 },
    { "text": "화상영어6시", "id": "default-2-4", "done": false, "sortOrder": 4 },
    { "text": "문해력어휘1단원", "id": "default-2-5", "done": false, "sortOrder": 5 },
    { "text": "피아노연습", "id": "default-2-6", "done": false, "sortOrder": 6 }
  ],
  "Wednesday": [
    { "text": "리틀팍스30분", "id": "default-3-1", "done": false, "sortOrder": 1 },
    { "text": "피아노연습", "id": "default-3-2", "done": false, "sortOrder": 2 }
  ],
  "Thursday": [
    { "text": "원리샘1일차", "id": "default-4-1", "done": false, "sortOrder": 1 },
    { "text": "플라토1장", "id": "default-4-2", "done": false, "sortOrder": 2 },
    { "text": "브릭스유닛1", "id": "default-4-3", "done": false, "sortOrder": 3 },
    { "text": "화상영어6시", "id": "default-4-4", "done": false, "sortOrder": 4 },
    { "text": "문해력한문장1장", "id": "default-4-5", "done": false, "sortOrder": 5 },
    { "text": "피아노연습", "id": "default-4-6", "done": false, "sortOrder": 6 }
  ],
  "Friday": [
    { "text": "원리샘1일차", "id": "default-5-1", "done": false, "sortOrder": 1 },
    { "text": "디딤돌1장", "id": "default-5-2", "done": false, "sortOrder": 2 },
    { "text": "기적의영문장1스텝", "id": "default-5-3", "done": false, "sortOrder": 3 },
    { "text": "리틀팍스30분", "id": "default-5-4", "done": false, "sortOrder": 4 },
    { "text": "뿌독1단원", "id": "default-5-5", "done": false, "sortOrder": 5 },
    { "text": "피아노연습", "id": "default-5-6", "done": false, "sortOrder": 6 }
  ],
  "Saturday": [
    { "text": "원리샘1일차", "id": "default-6-1", "done": false, "sortOrder": 1 },
    { "text": "플라토1장", "id": "default-6-2", "done": false, "sortOrder": 2 },
    { "text": "브릭스유닛1", "id": "default-6-3", "done": false, "sortOrder": 3 },
    { "text": "리틀팍스30분", "id": "default-6-4", "done": false, "sortOrder": 4 },
    { "text": "문해력어휘1단원", "id": "default-6-5", "done": false, "sortOrder": 5 },
    { "text": "피아노연습", "id": "default-6-6", "done": false, "sortOrder": 6 }
  ],
  "Sunday": [
    { "text": "원리샘1일차", "id": "default-7-1", "done": false, "sortOrder": 1 },
    { "text": "리틀팍스30분", "id": "default-7-2", "done": false, "sortOrder": 2 },
    { "text": "문해력한문장1장", "id": "default-7-3", "done": false, "sortOrder": 3 }
  ]
};

// 상점에서 구매 가능한 아이템 도감
export const SHOP_CATALOG = [
  // 먼작귀 캐릭터들
  { id: 'char_chiikawa', name: '용감한 치이카와', category: 'character', price: 60, sprite: './assets/sprites/chiikawa.png', quote: '와아... 힘낼게!', w: 1.2, h: 1.4 },
  { id: 'char_hachiware', name: '다정한 하치와레', category: 'character', price: 60, sprite: './assets/sprites/hachiware.png', quote: '어떻게든 될 거야!', w: 1.2, h: 1.4 },
  { id: 'char_usagi', name: '신나는 우사기', category: 'character', price: 60, sprite: './assets/sprites/usagi.png', quote: '우라라라- 얏하!', w: 1.2, h: 1.5 },
  { id: 'char_momonga', name: '귀염둥이 모몽가', category: 'character', price: 80, sprite: './assets/sprites/momonga.png', quote: '나를 잔뜩 귀여워해라!', w: 1.3, h: 1.4 },
  { id: 'char_kurimanju', name: '든든한 쿠리만쥬', category: 'character', price: 80, sprite: './assets/sprites/kurimanju.png', quote: '하-아! 시원하다~', w: 1.2, h: 1.4 },
  { id: 'char_shisa', name: '성실한 시사', category: 'character', price: 80, sprite: './assets/sprites/shisa.png', quote: '오늘도 파이팅!', w: 1.2, h: 1.4 },
  { id: 'char_rakko', name: '멋진 랏코 대장', category: 'character', price: 100, sprite: './assets/sprites/rakko.png', quote: '자신감을 가져라.', w: 1.3, h: 1.5 },

  // 마을 장식 & 건물 (캔버스 절차적 스프라이트 생성 지원)
  { id: 'deco_house', name: '딸기 버섯집', category: 'building', price: 120, sprite: 'generated_house', quote: '먼작귀 친구들이 사는 아늑한 집', w: 1.8, h: 1.8 },
  { id: 'deco_pudding', name: '거대 푸딩 산', category: 'deco', price: 90, sprite: 'generated_pudding', quote: '달콤하고 폭신폭신한 캐러멜 푸딩!', w: 1.5, h: 1.4 },
  { id: 'deco_tree', name: '방울방울 캔디나무', category: 'nature', price: 40, sprite: 'generated_tree', quote: '달콤한 열매가 맺힌 나무', w: 1.3, h: 1.8 },
  { id: 'deco_flowers', name: '무지개 꽃밭', category: 'nature', price: 30, sprite: 'generated_flowers', quote: '알록달록 예쁜 꽃들이 피었어요', w: 1.2, h: 1.0 },
  { id: 'deco_lamp', name: '별빛 가로등', category: 'deco', price: 50, sprite: 'generated_lamp', quote: '밤이 되면 반짝이는 귀여운 조명', w: 1.0, h: 1.6 },
  { id: 'deco_fence', name: '통나무 울타리', category: 'deco', price: 20, sprite: 'generated_fence', quote: '마을을 둘러싸는 예쁜 펜스', w: 1.2, h: 0.8 }
];

const STORAGE_KEY = 'CHIIKAWA_ROUTINE_STATE_V1';

export class DataStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const todayStr = this.getTodayDateString();

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // 날짜가 바뀌었으면 체크 상태 초기화
        if (parsed.lastActiveDate !== todayStr) {
          parsed.lastActiveDate = todayStr;
          parsed.rouletteSpunToday = false;
          // 모든 루틴의 오늘 done 상태 초기화
          if (parsed.schedule) {
            Object.keys(parsed.schedule).forEach(day => {
              parsed.schedule[day].forEach(item => { item.done = false; });
            });
          }
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved state, reset to default', e);
      }
    }

    // 초기 상태 생성
    const initialState = {
      points: 100, // 시작 응원 보너스 포인트!
      lastActiveDate: todayStr,
      rouletteSpunToday: false,
      schedule: JSON.parse(JSON.stringify(DEFAULT_SCHEDULE)),
      inventory: [
        { itemId: 'char_chiikawa', count: 1 },
        { itemId: 'deco_house', count: 1 },
        { itemId: 'deco_flowers', count: 2 }
      ],
      // 기본 마을에 치이카와와 집이 미리 배치되어 있음
      village: [
        { instanceId: 'init-1', itemId: 'deco_house', x: 0, z: 0 },
        { instanceId: 'init-2', itemId: 'char_chiikawa', x: 0, z: 1 },
        { instanceId: 'init-3', itemId: 'deco_flowers', x: 1, z: 1 }
      ]
    };
    this.saveState(initialState);
    return initialState;
  }

  saveState(state = this.state) {
    this.state = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }

  getTodayDayName() {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // 오늘 요일 루틴 목록
  getTodayRoutines() {
    const day = this.getTodayDayName();
    return this.state.schedule[day] || [];
  }

  // 루틴 체크/토글
  toggleRoutine(id) {
    const day = this.getTodayDayName();
    const list = this.state.schedule[day];
    if (!list) return { routine: null, pointsEarned: 0, allCleared: false };

    const target = list.find(r => r.id === id);
    if (!target) return { routine: null, pointsEarned: 0, allCleared: false };

    target.done = !target.done;
    let pointsEarned = 0;

    if (target.done) {
      pointsEarned = 10;
      this.state.points += pointsEarned;
    } else {
      // 체크 해제 시 포인트 차감 (최소 0)
      this.state.points = Math.max(0, this.state.points - 10);
    }

    const allCleared = list.length > 0 && list.every(r => r.done);
    this.saveState();
    return { routine: target, pointsEarned, allCleared };
  }

  // 모든 오늘 루틴 완료 여부 확인
  isTodayAllCleared() {
    const list = this.getTodayRoutines();
    return list.length > 0 && list.every(r => r.done);
  }

  // 포인트 추가
  addPoints(amount) {
    this.state.points += amount;
    this.saveState();
    return this.state.points;
  }

  // 아이템 구매
  buyItem(itemId) {
    const item = SHOP_CATALOG.find(i => i.id === itemId);
    if (!item) return { success: false, message: '존재하지 않는 아이템입니다.' };
    if (this.state.points < item.price) {
      return { success: false, message: `포인트가 부족해요! (${item.price}P 필요)` };
    }

    this.state.points -= item.price;
    const inv = this.state.inventory.find(i => i.itemId === itemId);
    if (inv) {
      inv.count++;
    } else {
      this.state.inventory.push({ itemId, count: 1 });
    }

    this.saveState();
    return { success: true, item, remainingPoints: this.state.points };
  }

  // 마을 타일에 아이템 배치
  placeItemOnTile(itemId, x, z) {
    // 이미 해당 좌표에 아이템이 있는지 확인
    const existing = this.state.village.find(v => v.x === x && v.z === z);
    if (existing) {
      return { success: false, message: '이미 다른 물건이 놓여 있어요!' };
    }

    const inv = this.state.inventory.find(i => i.itemId === itemId && i.count > 0);
    if (!inv) {
      return { success: false, message: '보관함에 해당 아이템이 없어요!' };
    }

    inv.count--;
    const instanceId = 'tile_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    this.state.village.push({ instanceId, itemId, x, z });
    this.saveState();
    return { success: true, instanceId };
  }

  // 마을 타일에서 아이템 회수
  removeItemFromTile(instanceId) {
    const idx = this.state.village.findIndex(v => v.instanceId === instanceId);
    if (idx === -1) return { success: false };

    const removed = this.state.village.splice(idx, 1)[0];
    const inv = this.state.inventory.find(i => i.itemId === removed.itemId);
    if (inv) {
      inv.count++;
    } else {
      this.state.inventory.push({ itemId: removed.itemId, count: 1 });
    }

    this.saveState();
    return { success: true, removed };
  }

  // 루틴 항목 추가/수정/삭제 (CRUD)
  addRoutine(day, text) {
    if (!this.state.schedule[day]) this.state.schedule[day] = [];
    const list = this.state.schedule[day];
    const newRoutine = {
      id: 'custom-' + Date.now(),
      text,
      done: false,
      sortOrder: list.length + 1
    };
    list.push(newRoutine);
    this.saveState();
    return newRoutine;
  }

  editRoutine(day, id, newText) {
    const list = this.state.schedule[day] || [];
    const target = list.find(r => r.id === id);
    if (target) {
      target.text = newText;
      this.saveState();
      return true;
    }
    return false;
  }

  deleteRoutine(day, id) {
    const list = this.state.schedule[day] || [];
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list.splice(idx, 1);
      // 순서 재정렬
      list.forEach((r, i) => { r.sortOrder = i + 1; });
      this.saveState();
      return true;
    }
    return false;
  }

  // 기본 스케줄로 복원
  resetToDefaultSchedule() {
    this.state.schedule = JSON.parse(JSON.stringify(DEFAULT_SCHEDULE));
    this.saveState();
  }

  // JSON 백업 다운로드
  exportBackupJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `지유의_먼작귀루틴_백업_${this.getTodayDateString()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  // JSON 백업 복원
  importBackupJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.schedule || typeof parsed.points !== 'number') {
        throw new Error('올바른 백업 파일 형식이 아닙니다.');
      }
      this.state = parsed;
      this.saveState();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export const store = new DataStore();

