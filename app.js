// E20 Fuel Simulator JavaScript

// Emissions data based on ethanol percentage
const emissionsData = {
  0: { co2: 100, co: 100, hc: 100, pm: 100 },
  5: { co2: 95, co: 85, hc: 90, pm: 95 },
  10: { co2: 90, co: 70, hc: 80, pm: 90 },
  15: { co2: 85, co: 60, hc: 75, pm: 85 },
  20: { co2: 70, co: 50, hc: 67, pm: 80 }
};

// Application state
let currentEthanol = 0;
let smokeParticles = [];
let animationFrame;

// DOM elements
const ethanolSlider = document.getElementById('ethanol-slider');
const sliderFill = document.getElementById('slider-fill');
const ethanolValue = document.getElementById('ethanol-value');
const ethanolPercentage = document.querySelector('.ethanol-percentage');
const engineGlow = document.getElementById('engine-glow');
const smokeContainer = document.getElementById('smoke-container');
const bgParticles = document.getElementById('bg-particles');

// Emission elements
const co2Value = document.getElementById('co2-value');
const coValue = document.getElementById('co-value');
const hcValue = document.getElementById('hc-value');
const pmValue = document.getElementById('pm-value');
const co2Bar = document.getElementById('co2-bar');
const coBar = document.getElementById('co-bar');
const hcBar = document.getElementById('hc-bar');
const pmBar = document.getElementById('pm-bar');
const co2Reduction = document.getElementById('co2-reduction');
const coReduction = document.getElementById('co-reduction');
const hcReduction = document.getElementById('hc-reduction');
const pmReduction = document.getElementById('pm-reduction');

// Tab elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeSlider();
  initializeTabs();
  initializeBackgroundParticles();
  startSmokeAnimation();
  updateEmissions(0);
});

// Slider functionality
function initializeSlider() {
  ethanolSlider.addEventListener('input', function(e) {
    const value = parseInt(e.target.value);
    updateEthanolPercentage(value);
    updateEmissions(value);
    updateEngineEfficiency(value);
  });

  // Initialize slider appearance
  updateSliderFill(0);
}

function updateEthanolPercentage(percentage) {
  currentEthanol = percentage;
  
  // Update display
  ethanolValue.textContent = `E${percentage}`;
  ethanolPercentage.textContent = `${percentage}% Ethanol`;
  
  // Update slider fill
  updateSliderFill(percentage);
}

function updateSliderFill(percentage) {
  const fillPercentage = (percentage / 20) * 100;
  sliderFill.style.width = `${fillPercentage}%`;
}

// Emissions updating
function updateEmissions(ethanolPercentage) {
  // Get the closest data point or interpolate
  const emissionValues = getEmissionValues(ethanolPercentage);
  
  // Update CO2
  updateEmissionCard('co2', emissionValues.co2);
  
  // Update CO
  updateEmissionCard('co', emissionValues.co);
  
  // Update HC
  updateEmissionCard('hc', emissionValues.hc);
  
  // Update PM
  updateEmissionCard('pm', emissionValues.pm);
}

function getEmissionValues(percentage) {
  // If exact match exists, return it
  if (emissionsData[percentage]) {
    return emissionsData[percentage];
  }
  
  // Find the two closest data points for interpolation
  const keys = Object.keys(emissionsData).map(Number).sort((a, b) => a - b);
  let lower = 0;
  let upper = 20;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (percentage >= keys[i] && percentage <= keys[i + 1]) {
      lower = keys[i];
      upper = keys[i + 1];
      break;
    }
  }
  
  // Linear interpolation
  const ratio = (percentage - lower) / (upper - lower);
  const lowerData = emissionsData[lower];
  const upperData = emissionsData[upper];
  
  return {
    co2: Math.round(lowerData.co2 + (upperData.co2 - lowerData.co2) * ratio),
    co: Math.round(lowerData.co + (upperData.co - lowerData.co) * ratio),
    hc: Math.round(lowerData.hc + (upperData.hc - lowerData.hc) * ratio),
    pm: Math.round(lowerData.pm + (upperData.pm - lowerData.pm) * ratio)
  };
}

function updateEmissionCard(type, value) {
  const valueElement = document.getElementById(`${type}-value`);
  const barElement = document.getElementById(`${type}-bar`);
  const reductionElement = document.getElementById(`${type}-reduction`);
  
  // Update value
  valueElement.textContent = `${value}%`;
  
  // Update bar width
  barElement.style.width = `${value}%`;
  
  // Update reduction percentage
  const reduction = 100 - value;
  reductionElement.textContent = reduction > 0 ? `-${reduction}% vs Pure Petrol` : '-0% vs Pure Petrol';
  
  // Update color classes
  valueElement.className = 'emission-value';
  if (value <= 70) {
    valueElement.classList.add('low');
  } else if (value <= 85) {
    valueElement.classList.add('medium');
  } else {
    valueElement.classList.add('high');
  }
}

// Engine efficiency effects
function updateEngineEfficiency(ethanolPercentage) {
  engineGlow.className = 'engine-glow';
  
  if (ethanolPercentage >= 15) {
    engineGlow.classList.add('high-efficiency');
  } else if (ethanolPercentage >= 10) {
    engineGlow.classList.add('medium-efficiency');
  }
}

// Smoke animation system
function startSmokeAnimation() {
  createSmokeParticle();
  animationFrame = requestAnimationFrame(animateSmokeParticles);
}

function createSmokeParticle() {
  // Adjust particle creation rate based on ethanol percentage
  const baseRate = 200; // milliseconds
  const ethanolFactor = (20 - currentEthanol) / 20; // More ethanol = less smoke
  const adjustedRate = baseRate * (0.3 + ethanolFactor * 0.7);
  
  // Create particles from exhaust pipes
  const exhaustPositions = [
    { x: 320, y: 127 }, // Upper exhaust
    { x: 320, y: 152 }  // Lower exhaust
  ];
  
  exhaustPositions.forEach(pos => {
    if (Math.random() < 0.7) { // Random chance for variety
      const particle = createSmokeParticleElement(pos.x, pos.y);
      smokeContainer.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3000);
    }
  });
  
  // Schedule next particle creation
  setTimeout(createSmokeParticle, adjustedRate);
}

function createSmokeParticleElement(startX, startY) {
  const particle = document.createElement('div');
  particle.className = 'smoke-particle';
  
  // Random size based on ethanol percentage
  const ethanolFactor = (20 - currentEthanol) / 20;
  const size = (5 + Math.random() * 10) * (0.3 + ethanolFactor * 0.7);
  
  // Random horizontal drift
  const driftX = (Math.random() - 0.5) * 40;
  
  particle.style.left = startX + 'px';
  particle.style.top = startY + 'px';
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  particle.style.setProperty('--drift-x', driftX + 'px');
  
  // Adjust opacity based on ethanol (cleaner fuel = less visible smoke)
  const opacity = 0.3 + (ethanolFactor * 0.5);
  particle.style.opacity = opacity;
  
  return particle;
}

function animateSmokeParticles() {
  // Continue animation loop
  animationFrame = requestAnimationFrame(animateSmokeParticles);
}

// Tab functionality
function initializeTabs() {
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetTab = this.dataset.tab;
      switchTab(targetTab);
    });
  });
}

function switchTab(targetTab) {
  // Remove active class from all tabs and contents
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabContents.forEach(content => content.classList.remove('active'));
  
  // Add active class to clicked tab and corresponding content
  document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');
  document.getElementById(`${targetTab}-tab`).classList.add('active');
}

// Background particles
function initializeBackgroundParticles() {
  createBackgroundParticle();
}

function createBackgroundParticle() {
  const particle = document.createElement('div');
  particle.className = 'bg-particle';
  
  // Random size and position
  const size = Math.random() * 4 + 2;
  const startX = Math.random() * window.innerWidth;
  const driftX = (Math.random() - 0.5) * 100;
  
  particle.style.left = startX + 'px';
  particle.style.width = size + 'px';
  particle.style.height = size + 'px';
  particle.style.setProperty('--float-x', driftX + 'px');
  
  bgParticles.appendChild(particle);
  
  // Remove particle after animation
  setTimeout(() => {
    if (particle.parentNode) {
      particle.parentNode.removeChild(particle);
    }
  }, 20000);
  
  // Create next particle
  setTimeout(createBackgroundParticle, Math.random() * 3000 + 1000);
}

// Utility functions
function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Engine sound simulation (visual feedback)
function simulateEngineSound(ethanolPercentage) {
  const engine = document.querySelector('.engine-svg');
  
  // Adjust vibration intensity based on efficiency
  const efficiency = ethanolPercentage / 20;
  const vibrationIntensity = 1 - (efficiency * 0.3); // More efficient = less vibration
  
  engine.style.animationDuration = `${0.1 / vibrationIntensity}s`;
}

// Performance optimization: throttle emissions updates
let emissionsUpdateTimeout;
function throttledEmissionsUpdate(ethanolPercentage) {
  clearTimeout(emissionsUpdateTimeout);
  emissionsUpdateTimeout = setTimeout(() => {
    updateEmissions(ethanolPercentage);
  }, 50);
}

// Keyboard accessibility
document.addEventListener('keydown', function(e) {
  if (e.target === ethanolSlider) {
    // Allow fine-tuned control with arrow keys
    let newValue = parseInt(ethanolSlider.value);
    
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      newValue = Math.max(0, newValue - 1);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      newValue = Math.min(20, newValue + 1);
    }
    
    if (newValue !== parseInt(ethanolSlider.value)) {
      ethanolSlider.value = newValue;
      updateEthanolPercentage(newValue);
      updateEmissions(newValue);
      updateEngineEfficiency(newValue);
    }
  }
});

// Touch device optimization
let touchStartX = 0;
let touchStartValue = 0;

ethanolSlider.addEventListener('touchstart', function(e) {
  touchStartX = e.touches[0].clientX;
  touchStartValue = parseInt(this.value);
});

ethanolSlider.addEventListener('touchmove', function(e) {
  e.preventDefault(); // Prevent scrolling
  
  const touchCurrentX = e.touches[0].clientX;
  const deltaX = touchCurrentX - touchStartX;
  const sensitivity = 5; // Adjust for touch sensitivity
  const deltaValue = Math.round(deltaX / sensitivity);
  
  const newValue = Math.max(0, Math.min(20, touchStartValue + deltaValue));
  
  if (newValue !== parseInt(this.value)) {
    this.value = newValue;
    updateEthanolPercentage(newValue);
    throttledEmissionsUpdate(newValue);
    updateEngineEfficiency(newValue);
  }
});

// Window resize handler
window.addEventListener('resize', function() {
  // Adjust particle system for new window size
  const particles = document.querySelectorAll('.bg-particle');
  particles.forEach(particle => {
    if (parseFloat(particle.style.left) > window.innerWidth) {
      particle.style.left = Math.random() * window.innerWidth + 'px';
    }
  });
});

// Cleanup function
window.addEventListener('beforeunload', function() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  clearTimeout(emissionsUpdateTimeout);
});

// Enhanced interaction feedback
ethanolSlider.addEventListener('mousedown', function() {
  this.classList.add('dragging');
});

document.addEventListener('mouseup', function() {
  ethanolSlider.classList.remove('dragging');
});

// Add visual feedback for hover states
document.querySelectorAll('.info-card, .emission-card, .stat-item').forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.transform = 'translateY(-2px) scale(1.02)';
  });
  
  card.addEventListener('mouseleave', function() {
    this.style.transform = 'translateY(0) scale(1)';
  });
});

// Educational tooltips (simple implementation)
const tooltips = {
  'co2': 'Carbon Dioxide - Main greenhouse gas from fuel combustion',
  'co': 'Carbon Monoxide - Toxic gas reduced significantly with ethanol',
  'hc': 'Hydrocarbons - Unburned fuel components that cause smog',
  'pm': 'Particulate Matter - Fine particles harmful to respiratory health'
};

Object.keys(tooltips).forEach(key => {
  const element = document.getElementById(`${key}-value`);
  if (element) {
    element.title = tooltips[key];
  }
});

// Initialize application
console.log('E20 Fuel Simulator initialized successfully!');