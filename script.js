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

  // 현재 섹션 인덱스 상태
  let currentIndex = 0;
  let isAutoScrolling = false;
  let wheelTimer = null;

  function getSectionOffset(section) {
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

    // 스크롤 애니메이션 끝났다고 가정
    setTimeout(() => {
      isAutoScrolling = false;
    }, 600);
  }

  function setActiveIndex(index) {
    currentIndex = index;

    const activeId = "#" + sections[index].id;

    // nav 메뉴 active
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
    let closestIndex = 0;
    let minDiff = Infinity;

    sections.forEach((sec, i) => {
      const pos = getSectionOffset(sec);
      const diff = Math.abs(pos - scrollTop);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    });

    return closestIndex;
  }

  // 네비/버튼 클릭 → 부드러운 섹션 이동
  function handleAnchorClick(targetId) {
    const targetSection = document.querySelector(targetId);
    if (!targetSection) return;

    const index = sections.findIndex(sec => "#" + sec.id === targetId);
    if (index === -1) return;

    scrollToSectionIndex(index);
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const isInternal = targetId.startsWith("#");
      if (!isInternal) return;

      e.preventDefault();
      handleAnchorClick(targetId);
    });
  });

  dotButtons.forEach(dot => {
    dot.addEventListener("click", () => {
      const targetId = dot.dataset.target;
      if (!targetId) return;
      handleAnchorClick(targetId);
    });
  });

  // 휠/트랙패드 → 섹션 단위 부드러운 이동
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
    }, 120); // 사용자가 휠을 멈춘 후 살짝 기다렸다가 이동
  });

  // 일반 스크롤(드래그 등)에도 active 동기화
  main.addEventListener("scroll", () => {
    if (isAutoScrolling) return;
    const scrollTop = main.scrollTop;
    const idx = getClosestSectionIndex(scrollTop + 1);
    setActiveIndex(idx);
  });

  // 초기 active 설정
  setActiveIndex(0);
});
