// 연도 자동 표시
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main");
  const sections = Array.from(document.querySelectorAll("main > section"));
  const navLinks = document.querySelectorAll(
    '.nav-link[href^="#"], .home-cta[href^="#"]'
  );
  const navMenuLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const dotButtons = document.querySelectorAll(".dot-nav .dot");

  if (!main || sections.length === 0) return;

  let currentIndex = 0;
  let isAutoScrolling = false;

  // main 안에서 섹션의 Y 위치 계산
  function getSectionOffset(section) {
    return section.offsetTop - main.offsetTop;
  }

  // 해당 인덱스 섹션으로 부드럽게 스크롤
  function scrollToSectionIndex(index) {
    if (index < 0 || index >= sections.length) return;
    const targetSection = sections[index];
    const offsetTop = getSectionOffset(targetSection);

    isAutoScrolling = true;

    main.scrollTo({
      top: offsetTop,
      behavior: "smooth",
    });

    setActiveIndex(index);

    // 스크롤 애니메이션 동안 추가 입력 막기
    setTimeout(() => {
      isAutoScrolling = false;
    }, 600);
  }

  // 상단 메뉴 / 도트 active 상태 갱신
  function setActiveIndex(index) {
    if (index < 0 || index >= sections.length) return;
    currentIndex = index;

    const activeId = "#" + sections[index].id;

    // 상단 메뉴
    navMenuLinks.forEach((link) => {
      if (link.getAttribute("href") === activeId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // 도트
    dotButtons.forEach((dot) => {
      if (dot.dataset.target === activeId) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  // 현재 스크롤 위치 기준 가장 가까운 섹션 인덱스
  function getClosestSectionIndex(scrollTop) {
    const center = scrollTop + main.clientHeight / 2;
    let closestIndex = 0;
    let minDiff = Infinity;

    sections.forEach((sec, i) => {
      const pos = getSectionOffset(sec);
      const diff = Math.abs(pos - center);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    return closestIndex;
  }

  // 앵커 클릭 처리 (메뉴/버튼/도트 공용)
  function handleAnchorClick(targetId) {
    const targetSection = document.querySelector(targetId);
    if (!targetSection) return;

    const index = sections.findIndex((sec) => "#" + sec.id === targetId);
    if (index === -1) return;

    scrollToSectionIndex(index);
  }

  // 네비/홈 CTA 클릭 → 해당 섹션으로 부드럽게 이동
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      if (!targetId.startsWith("#")) return; // 외부 링크는 무시

      e.preventDefault();
      handleAnchorClick(targetId);
    });
  });

  // 도트 클릭 → 해당 섹션 이동
  dotButtons.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetId = dot.dataset.target;
      if (!targetId) return;
      handleAnchorClick(targetId);
    });
  });

  // 🔥 핵심: 휠 한 번 = 한 섹션 이동
  main.addEventListener("wheel", (e) => {
    // 이미 자동 스크롤 중이면 추가 입력 무시 → 여러 칸 튀는 것 방지
    if (isAutoScrolling) return;

    const direction = e.deltaY > 0 ? 1 : -1; // 아래로(+1), 위로(-1)

    let targetIndex = currentIndex + direction;
    if (targetIndex < 0) targetIndex = 0;
    if (targetIndex >= sections.length) targetIndex = sections.length - 1;
    if (targetIndex === currentIndex) return;

    scrollToSectionIndex(targetIndex);
  });

  // 사용자가 스크롤바를 드래그했을 때도 active 동기화
  main.addEventListener("scroll", () => {
    if (isAutoScrolling) return;
    const scrollTop = main.scrollTop;
    const idx = getClosestSectionIndex(scrollTop);
    setActiveIndex(idx);
  });

  // 창 크기 변경 시에도 다시 계산
  window.addEventListener("resize", () => {
    const scrollTop = main.scrollTop;
    const idx = getClosestSectionIndex(scrollTop);
    setActiveIndex(idx);
  });

  // 초기 상태
  setActiveIndex(0);
});
