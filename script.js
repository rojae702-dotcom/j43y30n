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
  const navLinks = document.querySelectorAll('.nav-link[href^="#"], .home-cta[href^="#"]');
  const navMenuLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const dotButtons = document.querySelectorAll('.dot-nav .dot');

  if (!main || sections.length === 0) return;

  let currentIndex = 0;
  let isAutoScrolling = false;
  let wheelTimer = null;

  function getSectionOffset(section) {
    // main 내부에서의 섹션 시작 위치
    return section.offsetTop - main.offsetTop;
  }

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

    // 스크롤 애니메이션이 끝났다고 가정하는 타이밍
    setTimeout(() => {
      isAutoScrolling = false;
    }, 600);
  }

  function setActiveIndex(index) {
    if (index < 0 || index >= sections.length) return;
    currentIndex = index;

    const activeId = "#" + sections[index].id;

    // 상단 메뉴 active
    navMenuLinks.forEach(link => {
      if (link.getAttribute("href") === activeId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // 도트 active
    dotButtons.forEach(dot => {
      if (dot.dataset.target === activeId) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }

  function getClosestSectionIndex(scrollTop) {
    // 뷰포트 중앙 기준으로 가장 가까운 섹션 찾기
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

  function handleAnchorClick(targetId) {
    const targetSection = document.querySelector(targetId);
    if (!targetSection) return;

    const index = sections.findIndex(sec => "#" + sec.id === targetId);
    if (index === -1) return;

    scrollToSectionIndex(index);
  }

  // 네비/홈 CTA 클릭 → 섹션으로 부드럽게 이동
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      if (!targetId.startsWith("#")) return; // 외부 링크는 무시

      e.preventDefault();
      handleAnchorClick(targetId);
    });
  });

  // 도트 클릭 → 섹션 이동
  dotButtons.forEach(dot => {
    dot.addEventListener("click", () => {
      const targetId = dot.dataset.target;
      if (!targetId) return;
      handleAnchorClick(targetId);
    });
  });

  // 휠/트랙패드 → 섹션 단위 이동 (반응형 높이에서도 index 기준)
  main.addEventListener("wheel", (e) => {
    if (isAutoScrolling) return;

    clearTimeout(wheelTimer);
    const direction = e.deltaY > 0 ? 1 : -1;

    wheelTimer = setTimeout(() => {
      let targetIndex = currentIndex + direction;
      if (targetIndex < 0) targetIndex = 0;
      if (targetIndex >= sections.length) targetIndex = sections.length - 1;
      if (targetIndex === currentIndex) return;

      scrollToSectionIndex(targetIndex);
    }, 120); // 사용자가 휠을 멈춘 느낌일 때만 동작
  });

  // 일반 스크롤(끌어내리기 등)에도 active 동기화
  main.addEventListener("scroll", () => {
    if (isAutoScrolling) return;
    const scrollTop = main.scrollTop;
    const idx = getClosestSectionIndex(scrollTop);
    setActiveIndex(idx);
  });

  // 창 크기 변경 시에도 현재 뷰포트 위치 기준으로 가장 가까운 섹션 재계산
  window.addEventListener("resize", () => {
    const scrollTop = main.scrollTop;
    const idx = getClosestSectionIndex(scrollTop);
    setActiveIndex(idx);
    // 필요하면 아래처럼 리얼라인도 가능 (지금은 움직임이 튀지 않게 주석)
    // scrollToSectionIndex(idx);
  });

  // 초기 상태
  setActiveIndex(0);
});
