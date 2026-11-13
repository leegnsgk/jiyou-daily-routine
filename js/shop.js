// shop.js - 포인트 상점, 보관함(인벤토리) 및 마을 오브젝트 배치 관리

import { store, SHOP_CATALOG } from './data.js';
import { sound } from './sound.js';

export class ShopManager {
  constructor(villageScene) {
    this.village = villageScene;
    this.shopModal = document.getElementById('shopModal');
    this.inventoryModal = document.getElementById('inventoryModal');
    this.objectActionModal = document.getElementById('objectActionModal');
    this.currentSelectedObject = null;

    this.init();
  }

  init() {
    this.setupButtons();
    this.setupVillageCallbacks();
  }

  setupButtons() {
    // 상점 열기/닫기
    const openShopBtn = document.getElementById('openShopBtn');
    const closeShopBtn = document.getElementById('closeShopBtn');
    if (openShopBtn) openShopBtn.addEventListener('click', () => this.openShop());
    if (closeShopBtn) closeShopBtn.addEventListener('click', () => this.closeShop());

    // 보관함 열기/닫기
    const openInvBtn = document.getElementById('openInventoryBtn');
    const closeInvBtn = document.getElementById('closeInventoryBtn');
    if (openInvBtn) openInvBtn.addEventListener('click', () => this.openInventory());
    if (closeInvBtn) closeInvBtn.addEventListener('click', () => this.closeInventory());

    // 배치 취소 키 (ESC)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.village.setPlacementItem(null);
      }
    });

    // 오브젝트 조작 모달 (회수 / 닫기)
    const removeObjBtn = document.getElementById('removeObjectBtn');
    const closeObjBtn = document.getElementById('closeObjectActionBtn');

    if (removeObjBtn) {
      removeObjBtn.addEventListener('click', () => {
        if (this.currentSelectedObject) {
          const res = store.removeItemFromTile(this.currentSelectedObject.instanceId);
          if (res.success) {
            sound.playPop();
            this.village.refreshVillageObjects();
            this.closeObjectAction();
            alert('보관함으로 회수되었습니다! 🎒');
          }
        }
      });
    }

    if (closeObjBtn) {
      closeObjBtn.addEventListener('click', () => this.closeObjectAction());
    }
  }

  setupVillageCallbacks() {
    // 3D 씬에서 오브젝트 클릭 시 콜백
    window.onVillageObjectClicked = (objectData) => {
      this.currentSelectedObject = objectData;
      this.openObjectAction(objectData);
    };

    // 아이템 배치 성공 시 콜백
    window.onItemPlacedSuccess = (itemId) => {
      // 계속 연속 배치할 수 있는지 수량 확인
      const inv = store.state.inventory.find(i => i.itemId === itemId);
      if (!inv || inv.count <= 0) {
        this.village.setPlacementItem(null);
      }
      this.renderInventory();
    };
  }

  openShop() {
    if (!this.shopModal) return;
    this.shopModal.style.display = 'flex';
    this.renderShop();
  }

  closeShop() {
    if (!this.shopModal) return;
    this.shopModal.style.display = 'none';
  }

  renderShop() {
    const container = document.getElementById('shopItemList');
    const pointsSpan = document.getElementById('shopCurrentPoints');
    if (pointsSpan) pointsSpan.textContent = `${store.state.points} P`;
    if (!container) return;
    container.innerHTML = '';

    SHOP_CATALOG.forEach(item => {
      const card = document.createElement('div');
      card.className = 'shop-card';

      // 스프라이트 이미지 혹은 프리뷰
      let previewHtml = '';
      if (item.sprite.startsWith('./')) {
        previewHtml = `<img src="${item.sprite}" class="shop-item-img" alt="${item.name}">`;
      } else {
        // 절차적 데코의 경우 아이콘 심볼
        const iconMap = {
          'generated_house': '🍄',
          'generated_pudding': '🍮',
          'generated_tree': '🍭',
          'generated_flowers': '🌸',
          'generated_lamp': '⭐',
          'generated_fence': '🪵'
        };
        previewHtml = `<div class="shop-item-emoji">${iconMap[item.sprite] || '✨'}</div>`;
      }

      const canBuy = store.state.points >= item.price;

      card.innerHTML = `
        <div class="shop-img-box">${previewHtml}</div>
        <div class="shop-info">
          <div class="shop-name">${item.name}</div>
          <div class="shop-desc">${item.quote}</div>
          <div class="shop-price">🪙 ${item.price} P</div>
        </div>
        <button class="shop-buy-btn ${canBuy ? '' : 'disabled'}" ${canBuy ? '' : 'disabled'}>
          ${canBuy ? '구매하기' : '포인트 부족'}
        </button>
      `;

      const buyBtn = card.querySelector('.shop-buy-btn');
      if (canBuy) {
        buyBtn.addEventListener('click', () => {
          const res = store.buyItem(item.id);
          if (res.success) {
            sound.playCoin();
            this.renderShop();
            if (window.updateHeaderPoints) window.updateHeaderPoints();
            alert(`🎉 [${item.name}] 구매 완료! 보관함에 들어갔어요.`);
          }
        });
      }

      container.appendChild(card);
    });
  }

  openInventory() {
    if (!this.inventoryModal) return;
    this.inventoryModal.style.display = 'flex';
    this.renderInventory();
  }

  closeInventory() {
    if (!this.inventoryModal) return;
    this.inventoryModal.style.display = 'none';
  }

  renderInventory() {
    const container = document.getElementById('inventoryItemList');
    if (!container) return;
    container.innerHTML = '';

    const activeItems = store.state.inventory.filter(i => i.count > 0);

    if (activeItems.length === 0) {
      container.innerHTML = '<div class="empty-inv-msg">보관함이 비어있어요. 상점에서 귀여운 아이템을 입양해보세요!</div>';
      return;
    }

    activeItems.forEach(invEntry => {
      const itemDef = SHOP_CATALOG.find(i => i.id === invEntry.itemId);
      if (!itemDef) return;

      const card = document.createElement('div');
      card.className = 'inventory-card';

      let previewHtml = '';
      if (itemDef.sprite.startsWith('./')) {
        previewHtml = `<img src="${itemDef.sprite}" class="inv-item-img" alt="${itemDef.name}">`;
      } else {
        const iconMap = {
          'generated_house': '🍄',
          'generated_pudding': '🍮',
          'generated_tree': '🍭',
          'generated_flowers': '🌸',
          'generated_lamp': '⭐',
          'generated_fence': '🪵'
        };
        previewHtml = `<div class="inv-item-emoji">${iconMap[itemDef.sprite] || '✨'}</div>`;
      }

      card.innerHTML = `
        <div class="inv-img-box">${previewHtml}</div>
        <div class="inv-title">${itemDef.name}</div>
        <div class="inv-count">보유: ${invEntry.count}개</div>
        <button class="inv-place-btn">마을에 놓기 📍</button>
      `;

      card.querySelector('.inv-place-btn').addEventListener('click', () => {
        sound.playPop();
        this.closeInventory();
        // 3D 씬 배치 모드로 진입
        this.village.setPlacementItem(itemDef.id);
      });

      container.appendChild(card);
    });
  }

  openObjectAction(objectData) {
    if (!this.objectActionModal) return;
    const title = document.getElementById('objectActionTitle');
    if (title) title.textContent = `[${objectData.itemDef ? objectData.itemDef.name : '오브젝트'}] 조작`;
    this.objectActionModal.style.display = 'flex';
  }

  closeObjectAction() {
    if (!this.objectActionModal) return;
    this.objectActionModal.style.display = 'none';
    this.currentSelectedObject = null;
  }
}

