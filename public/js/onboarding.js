// ==========================================================================
// LOW COFFE - ONBOARDING WALKTHROUGH CONTROLLER (SCREENS 1, 2, 3)
// ==========================================================================

let currentOnboardStep = 1;
const totalOnboardSteps = 3;

function updateOnboardView() {
  const slides = document.querySelectorAll('.onboard-slide');
  slides.forEach(slide => {
    const step = parseInt(slide.getAttribute('data-step'), 10);
    if (step === currentOnboardStep) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  const prevBtn = document.getElementById('onboardPrevBtn');
  if (prevBtn) {
    if (currentOnboardStep === 1) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }
  }
}

function onboardNext() {
  if (currentOnboardStep < totalOnboardSteps) {
    currentOnboardStep++;
    updateOnboardView();
  } else {
    navigateTo('/login');
  }
}

function onboardPrev() {
  if (currentOnboardStep > 1) {
    currentOnboardStep--;
    updateOnboardView();
  }
}

function resetOnboarding() {
  currentOnboardStep = 1;
  updateOnboardView();
}
