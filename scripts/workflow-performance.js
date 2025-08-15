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

    // Generate GitHub Step Summary if in CI environment
    if (process.env.GITHUB_STEP_SUMMARY) {
      this.generateGitHubSummary(latest, averages);
    }
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

  generateGitHubSummary(latest, averages) {
    const summaryContent = `
## 📊 Workflow Performance Summary

### 🚀 Latest Run Metrics
| Metric | Time | Status |
|--------|------|--------|
| Total Time | ${this.formatTime(latest.totalTime)} | ${latest.totalTime < 300 ? '✅ Excellent' : latest.totalTime < 600 ? '⚠️ Good' : '❌ Needs Optimization'} |
| Setup Time | ${this.formatTime(latest.setupTime)} | ${latest.setupTime < 60 ? '✅ Fast' : latest.setupTime < 120 ? '⚠️ Moderate' : '❌ Slow'} |
| Test Time | ${this.formatTime(latest.testTime)} | ${latest.testTime < 180 ? '✅ Fast' : latest.testTime < 300 ? '⚠️ Moderate' : '❌ Slow'} |
| Build Time | ${this.formatTime(latest.buildTime)} | ${latest.buildTime < 120 ? '✅ Fast' : latest.buildTime < 240 ? '⚠️ Moderate' : '❌ Slow'} |

### 📈 Performance Trends (Last 10 runs)
| Metric | Average | Trend |
|--------|---------|-------|
| Total Time | ${this.formatTime(averages.totalTime)} | ${this.data.trends.totalTime ? (this.data.trends.totalTime.direction === 'improved' ? '📈 Improving' : '📉 Degrading') : '➡️ Stable'} |
| Setup Time | ${this.formatTime(averages.setupTime)} | ➡️ Stable |
| Test Time | ${this.formatTime(averages.testTime)} | ➡️ Stable |
| Build Time | ${this.formatTime(averages.buildTime)} | ➡️ Stable |

### 💡 Performance Insights
${this.generateInsights(latest, averages)}

### 🎯 Optimization Score
**${this.calculateOptimizationScore(latest)}/100** - ${this.getOptimizationGrade(latest)}
`;

    // Write to GitHub Step Summary
    try {
      writeFileSync(process.env.GITHUB_STEP_SUMMARY, summaryContent, { flag: 'a' });
      console.log('📝 GitHub Step Summary updated with performance data');
    } catch (error) {
      console.log('Failed to write GitHub Step Summary:', error.message);
    }
  }

  generateInsights(latest, averages) {
    const insights = [];

    if (latest.totalTime < averages.totalTime * 0.9) {
      insights.push('🚀 This run was significantly faster than average!');
    } else if (latest.totalTime > averages.totalTime * 1.1) {
      insights.push('⚠️ This run was slower than average - check for issues');
    }

    if (latest.setupTime > 90) {
      insights.push('⚡ Setup optimization opportunity: Consider better dependency caching');
    }

    if (latest.testTime > 300) {
      insights.push('🧪 Test optimization opportunity: Consider parallel execution');
    }

    if (latest.buildTime > 180) {
      insights.push('🏗️ Build optimization opportunity: Consider incremental builds');
    }

    if (insights.length === 0) {
      insights.push('✅ All metrics look good! Performance is within optimal ranges.');
    }

    return insights.map((insight) => `- ${insight}`).join('\n');
  }

  calculateOptimizationScore(run) {
    let score = 100;

    // Deduct points for performance issues
    if (run.totalTime > 600) score -= 30;
    else if (run.totalTime > 300) score -= 15;

    if (run.setupTime > 90) score -= 20;
    else if (run.setupTime > 60) score -= 10;

    if (run.testTime > 300) score -= 20;
    else if (run.testTime > 180) score -= 10;

    if (run.buildTime > 180) score -= 20;
    else if (run.buildTime > 120) score -= 10;

    return Math.max(0, score);
  }

  getOptimizationGrade(run) {
    const score = this.calculateOptimizationScore(run);

    if (score >= 90) return '🏆 Excellent';
    if (score >= 80) return '🥈 Very Good';
    if (score >= 70) return '🥉 Good';
    if (score >= 60) return '⚠️ Fair';
    return '❌ Needs Improvement';
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
