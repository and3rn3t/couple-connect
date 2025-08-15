#!/usr/bin/env node

/**
 * GitHub Actions Performance Annotator
 * Creates rich annotations, check runs, and commit status with timing data
 */

import { Octokit } from '@octokit/rest';

class GitHubActionsAnnotator {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    this.owner = process.env.GITHUB_REPOSITORY_OWNER;
    this.repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
    this.sha = process.env.GITHUB_SHA;
    this.runId = process.env.GITHUB_RUN_ID;
  }

  async createPerformanceCheckRun(performanceData, conclusion = 'success') {
    const summary = this.generatePerformanceSummary(performanceData);
    const title = this.generateCheckTitle(performanceData);

    try {
      const checkRun = await this.octokit.checks.create({
        owner: this.owner,
        repo: this.repo,
        name: '📊 Performance Analysis',
        head_sha: this.sha,
        status: 'completed',
        conclusion: conclusion,
        output: {
          title: title,
          summary: summary,
          annotations: this.generatePerformanceAnnotations(performanceData),
        },
      });

      console.log(`✅ Created performance check run: ${checkRun.data.html_url}`);
      return checkRun.data;
    } catch (error) {
      console.error(`Failed to create check run: ${error.message}`);
      throw error;
    }
  }

  generateCheckTitle(data) {
    const totalTime = Math.round(data.totalTime || 0);
    const grade = this.getPerformanceGrade(data);

    return `${grade} - Total time: ${totalTime}s`;
  }

  generatePerformanceSummary(data) {
    const optimizationScore = this.calculateOptimizationScore(data);
    const recommendations = this.generateRecommendations(data);

    return `## 🚀 Workflow Performance Report

### 📊 Timing Breakdown
- **Total Time**: ${Math.round(data.totalTime || 0)}s
- **Setup Time**: ${Math.round(data.setupTime || 0)}s
- **Test Time**: ${Math.round(data.testTime || 0)}s
- **Build Time**: ${Math.round(data.buildTime || 0)}s

### 🎯 Performance Score: ${optimizationScore}/100

### 💡 Optimization Recommendations
${recommendations.length > 0 ? recommendations.map((r) => `- ${r}`).join('\n') : '✅ All metrics are within optimal ranges!'}

### 📈 Benchmarks
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Total Pipeline | < 10min | ${Math.round(data.totalTime || 0)}s | ${data.totalTime < 600 ? '✅' : '❌'} |
| Setup Phase | < 90s | ${Math.round(data.setupTime || 0)}s | ${data.setupTime < 90 ? '✅' : '❌'} |
| Test Phase | < 5min | ${Math.round(data.testTime || 0)}s | ${data.testTime < 300 ? '✅' : '❌'} |
| Build Phase | < 3min | ${Math.round(data.buildTime || 0)}s | ${data.buildTime < 180 ? '✅' : '❌'} |

---
*Performance data collected from GitHub Actions run ${this.runId}*`;
  }

  generatePerformanceAnnotations(data) {
    const annotations = [];

    // Create annotations for performance issues
    if (data.totalTime > 600) {
      annotations.push({
        path: '.github/workflows/ci-cd.yml',
        start_line: 1,
        end_line: 1,
        annotation_level: 'warning',
        title: 'Slow Pipeline Performance',
        message: `Total pipeline time (${Math.round(data.totalTime)}s) exceeds 10-minute target. Consider optimization strategies.`,
      });
    }

    if (data.setupTime > 90) {
      annotations.push({
        path: '.github/workflows/ci-cd.yml',
        start_line: 50,
        end_line: 60,
        annotation_level: 'notice',
        title: 'Setup Optimization Opportunity',
        message: `Setup time (${Math.round(data.setupTime)}s) could be improved with better dependency caching.`,
      });
    }

    if (data.testTime > 300) {
      annotations.push({
        path: '.github/workflows/ci-cd.yml',
        start_line: 200,
        end_line: 250,
        annotation_level: 'notice',
        title: 'Test Performance Opportunity',
        message: `Test execution (${Math.round(data.testTime)}s) could benefit from parallel execution strategies.`,
      });
    }

    if (data.buildTime > 180) {
      annotations.push({
        path: '.github/workflows/ci-cd.yml',
        start_line: 300,
        end_line: 350,
        annotation_level: 'notice',
        title: 'Build Optimization Opportunity',
        message: `Build time (${Math.round(data.buildTime)}s) could be improved with incremental builds or better caching.`,
      });
    }

    return annotations;
  }

  async createCommitStatus(performanceData) {
    const state = this.getCommitStatusState(performanceData);
    const description = this.getCommitStatusDescription(performanceData);

    try {
      await this.octokit.repos.createCommitStatus({
        owner: this.owner,
        repo: this.repo,
        sha: this.sha,
        state: state,
        target_url: `https://github.com/${this.owner}/${this.repo}/actions/runs/${this.runId}`,
        description: description,
        context: 'performance/timing',
      });

      console.log(`📊 Created commit status: ${state} - ${description}`);
    } catch (error) {
      console.error(`Failed to create commit status: ${error.message}`);
      throw error;
    }
  }

  getCommitStatusState(data) {
    if (data.totalTime > 900) return 'failure'; // > 15 minutes
    if (data.totalTime > 600) return 'error'; // > 10 minutes
    if (data.totalTime > 300) return 'pending'; // > 5 minutes
    return 'success'; // <= 5 minutes
  }

  getCommitStatusDescription(data) {
    const totalTime = Math.round(data.totalTime || 0);
    const score = this.calculateOptimizationScore(data);

    return `Pipeline: ${totalTime}s (Score: ${score}/100)`;
  }

  calculateOptimizationScore(data) {
    let score = 100;

    if (data.totalTime > 600) score -= 30;
    else if (data.totalTime > 300) score -= 15;

    if (data.setupTime > 90) score -= 20;
    else if (data.setupTime > 60) score -= 10;

    if (data.testTime > 300) score -= 20;
    else if (data.testTime > 180) score -= 10;

    if (data.buildTime > 180) score -= 20;
    else if (data.buildTime > 120) score -= 10;

    return Math.max(0, score);
  }

  getPerformanceGrade(data) {
    const score = this.calculateOptimizationScore(data);

    if (score >= 90) return '🏆 Excellent';
    if (score >= 80) return '🥈 Very Good';
    if (score >= 70) return '🥉 Good';
    if (score >= 60) return '⚠️ Fair';
    return '❌ Poor';
  }

  generateRecommendations(data) {
    const recommendations = [];

    if (data.totalTime > 600) {
      recommendations.push('Consider breaking down the pipeline into smaller, parallel jobs');
    }

    if (data.setupTime > 90) {
      recommendations.push('Optimize dependency installation with better caching strategies');
    }

    if (data.testTime > 300) {
      recommendations.push('Implement test parallelization or smart test selection');
    }

    if (data.buildTime > 180) {
      recommendations.push('Use incremental builds and build artifact caching');
    }

    return recommendations;
  }

  async createPRComment(performanceData, prNumber) {
    const comment = this.generatePRComment(performanceData);

    try {
      await this.octokit.issues.createComment({
        owner: this.owner,
        repo: this.repo,
        issue_number: prNumber,
        body: comment,
      });

      console.log(`💬 Created PR comment with performance data`);
    } catch (error) {
      console.error(`Failed to create PR comment: ${error.message}`);
      throw error;
    }
  }

  generatePRComment(data) {
    const score = this.calculateOptimizationScore(data);
    const grade = this.getPerformanceGrade(data);

    return `## 📊 Performance Analysis Report

🎯 **Performance Score**: ${score}/100 (${grade})

### ⚡ Workflow Timing
| Phase | Duration | Target | Status |
|-------|----------|--------|--------|
| Total | ${Math.round(data.totalTime)}s | <600s | ${data.totalTime < 600 ? '✅' : '❌'} |
| Setup | ${Math.round(data.setupTime)}s | <90s | ${data.setupTime < 90 ? '✅' : '❌'} |
| Tests | ${Math.round(data.testTime)}s | <300s | ${data.testTime < 300 ? '✅' : '❌'} |
| Build | ${Math.round(data.buildTime)}s | <180s | ${data.buildTime < 180 ? '✅' : '❌'} |

${
  this.generateRecommendations(data).length > 0
    ? `### 💡 Optimization Opportunities\n${this.generateRecommendations(data)
        .map((r) => `- ${r}`)
        .join('\n')}`
    : '### ✅ Performance Excellent\nAll timing metrics are within target ranges!'
}

---
<sub>🤖 Automated performance analysis • [View detailed logs](https://github.com/${this.owner}/${this.repo}/actions/runs/${this.runId})</sub>`;
  }
}

export default GitHubActionsAnnotator;
