/**
 * Device & Hardware Capability Profiler (Trình thẩm định và phân loại thiết bị phần cứng)
 * Tự động phân tích CPU, RAM, GPU, Màn hình, Pin và Tốc độ mạng để tối ưu hiệu năng toàn diện.
 */

class DeviceProfiler {
  constructor() {
    this.info = this.detectHardware();
    this.tier = this.calculatePerformanceTier(this.info);
    this.applyOptimizations();
    this.saveDeviceTelemetry();
  }

  detectHardware() {
    const nav = navigator;
    const screen = window.screen;

    // 1. CPU Cores & RAM
    const cpuCores = nav.hardwareConcurrency || 4;
    const memoryGB = nav.deviceMemory || (cpuCores >= 8 ? 8 : 4);

    // 2. GPU Detection via WebGL
    let gpuVendor = 'Unknown';
    let gpuRenderer = 'Standard GPU';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown';
          gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Standard GPU';
        }
      }
    } catch (e) {
      console.warn('WebGL detection error:', e);
    }

    // 3. Screen & Display
    const dpr = window.devicePixelRatio || 1;
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const isTouch = 'ontouchstart' in window || nav.maxTouchPoints > 0;

    // 4. OS & Browser
    const ua = nav.userAgent;
    let os = 'Unknown OS';
    if (/Windows NT/i.test(ua)) os = 'Windows';
    else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/Linux/i.test(ua)) os = 'Linux';

    let browser = 'Browser';
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';

    // 5. Network info
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    const networkType = conn ? (conn.effectiveType || conn.type || 'wifi/4g') : 'wifi/4g';

    return {
      os,
      browser,
      cpuCores,
      memoryGB,
      gpuVendor,
      gpuRenderer,
      dpr,
      screenWidth,
      screenHeight,
      isTouch,
      networkType,
      userAgent: ua
    };
  }

  calculatePerformanceTier(info) {
    let score = 0;

    // CPU Score
    if (info.cpuCores >= 8) score += 35;
    else if (info.cpuCores >= 4) score += 20;
    else score += 10;

    // RAM Score
    if (info.memoryGB >= 8) score += 30;
    else if (info.memoryGB >= 4) score += 20;
    else score += 10;

    // GPU Score
    const gpuLower = (info.gpuRenderer + ' ' + info.gpuVendor).toLowerCase();
    const isHighEndGpu = /rtx|gtx|radeon|apple m|m1|m2|m3|adreno 7|adreno 66|mali-g7|snapdragon 8/i.test(gpuLower);
    const isIntegrated = /intel hd|intel uhd|basic render|llvmpipe|swiftshader/i.test(gpuLower);

    if (isHighEndGpu) score += 35;
    else if (!isIntegrated) score += 25;
    else score += 10;

    // Determine Tier
    let tier = 'tier-3'; // Default high
    let tierName = 'Cao Cấp (High Performance)';

    if (score < 40 || info.cpuCores <= 2 || info.memoryGB <= 2) {
      tier = 'tier-1';
      tierName = 'Tiết Kiệm (Eco / Low-End)';
    } else if (score < 70) {
      tier = 'tier-2';
      tierName = 'Tiêu Chuẩn (Balanced / Mid-Range)';
    } else {
      tier = 'tier-3';
      tierName = 'Cao Cấp (Ultra High-End)';
    }

    return {
      id: tier,
      name: tierName,
      score: score
    };
  }

  applyOptimizations() {
    const html = document.documentElement;
    html.classList.add(`perf-${this.tier.id}`);

    // If Tier 1 or Tier 2, automatically disable unnecessary full-screen canvas loops or set low particle count
    if (this.tier.id === 'tier-1') {
      html.classList.add('low-gpu-mode');
      if (localStorage.getItem('particles_enabled') === null) {
        localStorage.setItem('particles_enabled', 'false');
      }
    }

    console.log(`[DeviceProfiler] 🚀 Detected Device: ${this.info.os} (${this.info.cpuCores} Cores, ${this.info.memoryGB}GB RAM) | GPU: ${this.info.gpuRenderer} | Tier: ${this.tier.name}`);
  }

  saveDeviceTelemetry() {
    try {
      const telemetry = {
        ...this.info,
        tier: this.tier,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem('client_device_profile', JSON.stringify(telemetry));
    } catch (e) {}
  }
}

// Global initialization
if (typeof window !== 'undefined') {
  window.deviceProfiler = new DeviceProfiler();
  window.getDeviceInfo = () => window.deviceProfiler ? window.deviceProfiler.info : null;
  window.getDeviceTier = () => window.deviceProfiler ? window.deviceProfiler.tier : null;
}

export default DeviceProfiler;
