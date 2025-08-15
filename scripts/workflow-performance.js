#!/usr/bin/env node

/**
 * GitHub Actions Workflow Performance Monitor
 * Tracks and analyzes workflow execution times
 */

import { writeFileSync, existsSync, readFileSync } from 'fs';

class WorkflowPerformanceMonitor {
  constructor() {
    this.performanceFile = '.workflow-performance.json';
    this.data = this.loadPerformanceData();
  }

  loadPerformanceData() {
    if (existsSync(this.performanceFile)) {
      try {
        return JSON.parse(readFileSync(this.performanceFile, 'utf8'));
      } catch (error) {
        console.log('Failed to load performance data, starting fresh');
      }
    }
    return {
      runs: [],
      averages: {},
      trends: {},
    };
  }

  recordRun(runData) {
    const run = {
      timestamp: new Date().toISOString(),
      runId: process.env.GITHUB_RUN_ID,
      commit: process.env.GITHUB_SHA?.slice(0, 7),
      branch: process.env.GITHUB_REF_NAME,
      trigger: process.env.GITHUB_EVENT_NAME,
      ...runData,
    };

    this.data.runs.push(run);

    // Keep only last 50 runs
    if (this.data.runs.length > 50) {
      this.data.runs = this.data.runs.slice(-50);
    }

    this.calculateAverages();
    this.savePerformanceData();
  }

  calculateAverages() {
    const recent = this.data.runs.slice(-10); // Last 10 runs

    this.data.averages = {
      totalTime: this.average(recent.map((r) => r.totalTime).filter(Boolean)),
      setupTime: this.average(recent.map((r) => r.setupTime).filter(Boolean)),
      testTime: this.average(recent.map((r) => r.testTime).filter(Boolean)),
      buildTime: this.average(recent.map((r) => r.buildTime).filter(Boolean)),
    };

    // Calculate trends (improvement/degradation)
    const older = this.data.runs.slice(-20, -10);
    if (older.length > 0 && recent.length > 0) {
      const olderAvg = this.average(older.map((r) => r.totalTime).filter(Boolean));
      const recentAvg = this.data.averages.totalTime;

      this.data.trends.totalTime = {
        change: (((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1),
        direction: recentAvg < olderAvg ? 'improved' : 'slower',
      };
    }
  }

  average(numbers) {
    return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
  }

  savePerformanceData() {
    writeFileSync(this.performanceFile, JSON.stringify(this.data, null, 2));
  }

  generateReport() {
    console.log('\n🚀 Workflow Performance Report\n');

    if (this.data.runs.length === 0) {
      console.log('No performance data available yet.');
      return;
    }

    const latest = this.data.runs[this.data.runs.length - 1];
    const averages = this.data.averages;

    console.log('📊 Latest Run Performance:');
    console.log(`├─ Total Time: ${this.formatTime(latest.totalTime)}`);
    console.log(`├─ Setup Time: ${this.formatTime(latest.setupTime)}`);
    console.log(`├─ Test Time: ${this.formatTime(latest.testTime)}`);
    console.log(`└─ Build Time: ${this.formatTime(latest.buildTime)}\n`);

    console.log('📈 Average Performance (Last 10 runs):');
    console.log(`├─ Total Time: ${this.formatTime(averages.totalTime)}`);
    console.log(`├─ Setup Time: ${this.formatTime(averages.setupTime)}`);
    console.log(`├─ Test Time: ${this.formatTime(averages.testTime)}`);
    console.log(`└─ Build Time: ${this.formatTime(averages.buildTime)}\n`);

    if (this.data.trends.totalTime) {
      const trend = this.data.trends.totalTime;
      const emoji = trend.direction === 'improved' ? '📈' : '📉';
      console.log(`${emoji} Performance Trend: ${trend.change}% ${trend.direction}\n`);
    }

    this.generateOptimizationTips();
  }

  generateOptimizationTips() {
    const averages = this.data.averages;

    console.log('💡 Optimization Tips:');

    if (averages.setupTime > 60) {
      console.log('├─ ⚡ Setup taking >1min - consider better dependency caching');
    }

    if (averages.testTime > 180) {
      console.log('├─ 🧪 Tests taking >3min - consider parallel execution or test selection');
    }

    if (averages.buildTime > 120) {
      console.log('├─ 🏗️ Build taking >2min - consider incremental builds or better caching');
    }

    if (averages.totalTime > 600) {
      console.log('├─ 🚨 Total time >10min - workflow needs optimization');
    } else if (averages.totalTime < 300) {
      console.log('├─ ✅ Great performance! Total time <5min');
    }

    console.log('└─ 📚 See workflow optimization docs for more tips\n');
  }

  formatTime(seconds) {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }

  startTiming(stage) {
    this[`${stage}StartTime`] = Date.now();
  }

  endTiming(stage) {
    const startTime = this[`${stage}StartTime`];
    if (startTime) {
      return (Date.now() - startTime) / 1000; // Convert to seconds
    }
    return null;
  }
}

// CLI interface
const monitor = new WorkflowPerformanceMonitor();

const command = process.argv[2];
const stage = process.argv[3];

switch (command) {
  case 'start':
    monitor.startTiming(stage);
    console.log(`⏱️ Started timing: ${stage}`);
    break;

  case 'end':
    const duration = monitor.endTiming(stage);
    if (duration) {
      console.log(`⏱️ Completed ${stage}: ${monitor.formatTime(duration)}`);

      // Record the run data (simplified for this example)
      if (stage === 'total') {
        monitor.recordRun({
          totalTime: duration,
          setupTime: monitor.endTiming('setup') || 0,
          testTime: monitor.endTiming('test') || 0,
          buildTime: monitor.endTiming('build') || 0,
        });
      }
    }
    break;

  case 'report':
    monitor.generateReport();
    break;

  default:
    console.log('Usage: node workflow-performance.js [start|end|report] [stage]');
    console.log('Stages: setup, test, build, total');
}

export default WorkflowPerformanceMonitor;
