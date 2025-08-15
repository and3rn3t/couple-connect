#!/usr/bin/env node

/**
 * GitHub Performance Dashboard Integration
 * Creates comprehensive performance feedback for GitHub ecosystem
 */

import { Octokit } from '@octokit/rest';
import GitHubActionsAnnotator from './github-actions-annotator.js';
import GitHubDeploymentManager from './github-deployment-manager.js';
import WorkflowPerformanceMonitor from './workflow-performance.js';

class GitHubPerformanceDashboard {
  constructor() {
    this.annotator = new GitHubActionsAnnotator();
    this.deploymentManager = new GitHubDeploymentManager();
    this.performanceMonitor = new WorkflowPerformanceMonitor();

    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
  }

  async createComprehensiveFeedback(performanceData) {
    const feedback = {
      checkRun: null,
      commitStatus: null,
      prComment: null,
      deployment: null,
      summary: null,
    };

    try {
      // 1. Create detailed check run with annotations
      console.log('📊 Creating performance check run...');
      feedback.checkRun = await this.annotator.createPerformanceCheckRun(
        performanceData,
        this.getCheckConclusion(performanceData)
      );

      // 2. Update commit status with performance score
      console.log('🎯 Updating commit status...');
      await this.annotator.createCommitStatus(performanceData);
      feedback.commitStatus = 'created';

      // 3. Add PR comment if this is a pull request
      if (process.env.GITHUB_EVENT_NAME === 'pull_request') {
        const prNumber = JSON.parse(process.env.GITHUB_EVENT_PATH || '{}').number;
        if (prNumber) {
          console.log('💬 Adding PR comment...');
          await this.annotator.createPRComment(performanceData, prNumber);
          feedback.prComment = 'created';
        }
      }

      // 4. Update deployment status if this is a deployment
      if (
        process.env.GITHUB_EVENT_NAME === 'push' &&
        process.env.GITHUB_REF === 'refs/heads/main'
      ) {
        console.log('🚀 Updating deployment status...');
        const deployment = await this.deploymentManager.createDeploymentWithTiming(
          'production',
          Date.now() - performanceData.totalTime * 1000,
          {
            performanceScore: this.calculatePerformanceScore(performanceData),
            optimizationGrade: this.getOptimizationGrade(performanceData),
          }
        );
        feedback.deployment = deployment;
      }

      // 5. Generate comprehensive GitHub Step Summary
      console.log('📝 Generating step summary...');
      feedback.summary = await this.generateEnhancedStepSummary(performanceData, feedback);

      return feedback;
    } catch (error) {
      console.error('Error creating comprehensive feedback:', error);
      throw error;
    }
  }

  async generateEnhancedStepSummary(performanceData, feedback) {
    const score = this.calculatePerformanceScore(performanceData);
    const grade = this.getOptimizationGrade(performanceData);
    const trends = await this.getPerformanceTrends(performanceData);

    const summary = `## 🚀 Advanced Performance Dashboard

### 📊 Performance Metrics
| Metric | Value | Target | Score |
|--------|-------|--------|-------|
| **Total Pipeline** | ${Math.round(performanceData.totalTime)}s | <600s | ${performanceData.totalTime < 600 ? '🟢' : performanceData.totalTime < 900 ? '🟡' : '🔴'} |
| **Setup Phase** | ${Math.round(performanceData.setupTime)}s | <90s | ${performanceData.setupTime < 90 ? '🟢' : performanceData.setupTime < 120 ? '🟡' : '🔴'} |
| **Test Phase** | ${Math.round(performanceData.testTime)}s | <300s | ${performanceData.testTime < 300 ? '🟢' : performanceData.testTime < 450 ? '🟡' : '🔴'} |
| **Build Phase** | ${Math.round(performanceData.buildTime)}s | <180s | ${performanceData.buildTime < 180 ? '🟢' : performanceData.buildTime < 270 ? '🟡' : '🔴'} |

### 🎯 Performance Score: ${score}/100 (${grade})

### 📈 Performance Trends
${trends.map((trend) => `- ${trend}`).join('\n')}

### 🔄 GitHub Integration Status
| Feature | Status | Impact |
|---------|--------|--------|
| **Check Run** | ${feedback.checkRun ? '✅ Created' : '❌ Failed'} | Detailed performance analysis in PR |
| **Commit Status** | ${feedback.commitStatus ? '✅ Updated' : '❌ Failed'} | Performance badge on commit |
| **PR Comment** | ${feedback.prComment ? '✅ Added' : 'ℹ️ N/A'} | Performance insights for reviewers |
| **Deployment** | ${feedback.deployment ? '✅ Enhanced' : 'ℹ️ N/A'} | Performance data in environment |

### 💡 Smart Recommendations
${this.generateSmartRecommendations(performanceData)
  .map((rec) => `- ${rec}`)
  .join('\n')}

### 📱 Dashboard Links
- [📊 Detailed Check Run](${feedback.checkRun?.html_url || '#'})
- [🎯 Commit Status](https://github.com/${process.env.GITHUB_REPOSITORY}/commit/${process.env.GITHUB_SHA})
- [🚀 Deployment Status](${feedback.deployment?.statuses_url || '#'})
- [📈 Performance History](https://github.com/${process.env.GITHUB_REPOSITORY}/actions)

### 🔮 Performance Insights
- **Optimization Opportunities**: ${this.countOptimizationOpportunities(performanceData)}
- **Efficiency Rating**: ${this.getEfficiencyRating(performanceData)}
- **Time Savings**: ${this.calculateTimeSavings(performanceData)}
- **Performance Stability**: ${this.assessPerformanceStability(trends)}

---
<sub>🤖 Generated by Advanced GitHub Performance Dashboard • [View Run](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID})</sub>`;

    // Write to GitHub Step Summary
    if (process.env.GITHUB_STEP_SUMMARY) {
      const fs = await import('fs');
      fs.writeFileSync(process.env.GITHUB_STEP_SUMMARY, summary, { flag: 'a' });
    }

    return summary;
  }

  getCheckConclusion(performanceData) {
    if (performanceData.totalTime > 900) return 'failure'; // >15 min
    if (performanceData.totalTime > 600) return 'neutral'; // >10 min
    if (performanceData.totalTime > 300) return 'success'; // >5 min
    return 'success'; // <=5 min
  }

  calculatePerformanceScore(performanceData) {
    let score = 100;

    // Total time impact (40% of score)
    if (performanceData.totalTime > 900) score -= 40;
    else if (performanceData.totalTime > 600) score -= 25;
    else if (performanceData.totalTime > 300) score -= 10;

    // Individual phase impacts
    if (performanceData.setupTime > 120) score -= 15;
    else if (performanceData.setupTime > 90) score -= 8;

    if (performanceData.testTime > 450) score -= 20;
    else if (performanceData.testTime > 300) score -= 10;

    if (performanceData.buildTime > 270) score -= 15;
    else if (performanceData.buildTime > 180) score -= 8;

    return Math.max(0, Math.min(100, score));
  }

  getOptimizationGrade(performanceData) {
    const score = this.calculatePerformanceScore(performanceData);

    if (score >= 95) return '🏆 Exceptional';
    if (score >= 85) return '🥇 Excellent';
    if (score >= 75) return '🥈 Very Good';
    if (score >= 65) return '🥉 Good';
    if (score >= 50) return '⚠️ Fair';
    return '❌ Poor';
  }

  async getPerformanceTrends(performanceData) {
    // Simplified trend analysis - in production, this would analyze historical data
    const trends = [];

    const baselineTotal = 480; // 8 minutes baseline
    const improvement = (
      ((baselineTotal - performanceData.totalTime) / baselineTotal) *
      100
    ).toFixed(1);

    if (improvement > 0) {
      trends.push(`🚀 ${improvement}% faster than baseline (${baselineTotal}s)`);
    } else {
      trends.push(`📉 ${Math.abs(improvement)}% slower than baseline (${baselineTotal}s)`);
    }

    trends.push(
      `📊 Performance tracking active across ${this.performanceMonitor.data.runs.length} runs`
    );
    trends.push(`🎯 Current optimization level: ${this.getOptimizationGrade(performanceData)}`);

    return trends;
  }

  generateSmartRecommendations(performanceData) {
    const recommendations = [];

    if (performanceData.totalTime > 600) {
      recommendations.push('🔄 Consider breaking pipeline into smaller parallel jobs');
    }

    if (performanceData.setupTime > 90) {
      recommendations.push('⚡ Optimize dependency caching and installation strategy');
    }

    if (performanceData.testTime > 300) {
      recommendations.push('🧪 Implement smart test selection and parallel execution');
    }

    if (performanceData.buildTime > 180) {
      recommendations.push('🏗️ Enable incremental builds and artifact caching');
    }

    // Advanced recommendations based on ratios
    const totalTime = performanceData.totalTime;
    if (performanceData.setupTime / totalTime > 0.25) {
      recommendations.push('📦 Setup takes >25% of total time - focus on dependency optimization');
    }

    if (performanceData.testTime / totalTime > 0.5) {
      recommendations.push(
        '⚡ Tests dominate pipeline time - consider test optimization strategies'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        '✅ Performance is well-optimized! Consider fine-tuning for marginal gains'
      );
    }

    return recommendations;
  }

  countOptimizationOpportunities(performanceData) {
    let count = 0;

    if (performanceData.totalTime > 600) count++;
    if (performanceData.setupTime > 90) count++;
    if (performanceData.testTime > 300) count++;
    if (performanceData.buildTime > 180) count++;

    return count === 0 ? 'None identified' : `${count} opportunities`;
  }

  getEfficiencyRating(performanceData) {
    const score = this.calculatePerformanceScore(performanceData);

    if (score >= 90) return 'Highly Efficient';
    if (score >= 75) return 'Efficient';
    if (score >= 60) return 'Moderately Efficient';
    return 'Needs Optimization';
  }

  calculateTimeSavings(performanceData) {
    const baseline = 900; // 15 minutes original
    const current = performanceData.totalTime;
    const savings = baseline - current;

    if (savings > 0) {
      return `${Math.round(savings / 60)}m ${savings % 60}s saved per run`;
    } else {
      return 'No savings detected';
    }
  }

  assessPerformanceStability(trends) {
    // Simplified stability assessment
    if (trends.some((t) => t.includes('faster'))) {
      return 'Improving';
    } else if (trends.some((t) => t.includes('slower'))) {
      return 'Degrading';
    }
    return 'Stable';
  }
}

// CLI interface
const dashboard = new GitHubPerformanceDashboard();

const command = process.argv[2];
const dataFile = process.argv[3];

switch (command) {
  case 'create-feedback':
    if (dataFile) {
      const fs = await import('fs');
      const performanceData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      dashboard.createComprehensiveFeedback(performanceData);
    } else {
      console.error('Usage: node github-performance-dashboard.js create-feedback <data-file>');
    }
    break;

  default:
    console.log('Usage: node github-performance-dashboard.js [create-feedback] <data-file>');
}

export default GitHubPerformanceDashboard;
