# 반짝 루틴섬

HTML, CSS, JavaScript, Three.js로 만든 주간 루틴 게임입니다. 별도 빌드 과정 없이 정적 서버에서 실행할 수 있습니다.

## 실행

프로젝트 폴더에서 다음 명령을 실행한 뒤 브라우저에서 `http://localhost:8000`을 여세요.

```powershell
python -m http.server 8000
```

Three.js 모듈과 웹폰트는 CDN에서 불러오므로 실행 중 인터넷 연결이 필요합니다. 루틴 체크 상태는 브라우저의 `localStorage`에 날짜별로 저장됩니다.
