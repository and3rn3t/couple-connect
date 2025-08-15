#!/usr/bin/env node

/**
 * GitHub Actions Workflow Monitor
 * Monitors workflow performance and sends alerts for failures
 */

const { Octokit } = require("@octokit/rest");

class WorkflowMonitor {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    this.owner = process.env.GITHUB_REPOSITORY?.split('/')[0] || 'and3rn3t';
    this.repo = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'couple-connect';
  }

  async getRecentWorkflows(limit = 10) {
    try {
      const { data } = await this.octokit.rest.actions.listWorkflowRunsForRepo({
        owner: this.owner,
        repo: this.repo,
        per_page: limit,
      });

      return data.workflow_runs;
    } catch (error) {
      console.error('Error fetching workflows:', error.message);
      return [];
    }
  }

  async analyzeWorkflowPerformance() {
    console.log('🔍 Analyzing workflow performance...\n');
    
    const workflows = await this.getRecentWorkflows(20);
    
    if (workflows.length === 0) {
      console.log('❌ No workflows found');
      return;
    }

    const stats = {
      total: workflows.length,
      success: 0,
      failure: 0,
      cancelled: 0,
      in_progress: 0,
      avgDuration: 0,
      slowestRun: null,
      fastestRun: null,
    };

    let totalDuration = 0;
    let completedRuns = 0;

    workflows.forEach(workflow => {
      switch (workflow.conclusion || workflow.status) {
        case 'success':
          stats.success++;
          break;
        case 'failure':
          stats.failure++;
          break;
        case 'cancelled':
          stats.cancelled++;
          break;
        case 'in_progress':
          stats.in_progress++;
          break;
      }

      if (workflow.conclusion && workflow.created_at && workflow.updated_at) {
        const duration = new Date(workflow.updated_at) - new Date(workflow.created_at);
        totalDuration += duration;
        completedRuns++;

        if (!stats.slowestRun || duration > stats.slowestRun.duration) {
          stats.slowestRun = { ...workflow, duration };
        }

        if (!stats.fastestRun || duration < stats.fastestRun.duration) {
          stats.fastestRun = { ...workflow, duration };
        }
      }
    });

    if (completedRuns > 0) {
      stats.avgDuration = totalDuration / completedRuns;
    }

    this.printStats(stats);
    this.checkHealthScore(stats);
  }

  printStats(stats) {
    console.log('📊 **Workflow Statistics**');
    console.log(`├─ Total Runs: ${stats.total}`);
    console.log(`├─ ✅ Success: ${stats.success} (${Math.round(stats.success/stats.total*100)}%)`);
    console.log(`├─ ❌ Failures: ${stats.failure} (${Math.round(stats.failure/stats.total*100)}%)`);
    console.log(`├─ 🚫 Cancelled: ${stats.cancelled} (${Math.round(stats.cancelled/stats.total*100)}%)`);
    console.log(`└─ ⏳ In Progress: ${stats.in_progress}\n`);

    if (stats.avgDuration > 0) {
      console.log('⏱️ **Performance Metrics**');
      console.log(`├─ Average Duration: ${this.formatDuration(stats.avgDuration)}`);
      
      if (stats.fastestRun) {
        console.log(`├─ Fastest Run: ${this.formatDuration(stats.fastestRun.duration)} (${stats.fastestRun.name})`);
      }
      
      if (stats.slowestRun) {
        console.log(`└─ Slowest Run: ${this.formatDuration(stats.slowestRun.duration)} (${stats.slowestRun.name})`);
      }
      
      console.log('');
    }
  }

  checkHealthScore(stats) {
    const successRate = stats.success / stats.total;
    const avgMinutes = stats.avgDuration / (1000 * 60);

    console.log('🏥 **Workflow Health**');
    
    if (successRate >= 0.9) {
      console.log(`├─ Success Rate: ✅ Excellent (${Math.round(successRate*100)}%)`);
    } else if (successRate >= 0.8) {
      console.log(`├─ Success Rate: ⚠️ Good (${Math.round(successRate*100)}%)`);
    } else {
      console.log(`├─ Success Rate: ❌ Needs Attention (${Math.round(successRate*100)}%)`);
    }

    if (avgMinutes <= 10) {
      console.log(`├─ Performance: ✅ Fast (${Math.round(avgMinutes)}min avg)`);
    } else if (avgMinutes <= 20) {
      console.log(`├─ Performance: ⚠️ Moderate (${Math.round(avgMinutes)}min avg)`);
    } else {
      console.log(`├─ Performance: ❌ Slow (${Math.round(avgMinutes)}min avg)`);
    }

    // Overall health score
    const healthScore = (successRate * 0.7) + ((20 - Math.min(avgMinutes, 20)) / 20 * 0.3);
    
    if (healthScore >= 0.9) {
      console.log(`└─ Overall Health: ✅ Excellent (${Math.round(healthScore*100)}%)`);
    } else if (healthScore >= 0.7) {
      console.log(`└─ Overall Health: ⚠️ Good (${Math.round(healthScore*100)}%)`);
    } else {
      console.log(`└─ Overall Health: ❌ Needs Improvement (${Math.round(healthScore*100)}%)`);
    }

    console.log('');
    this.generateRecommendations(stats, successRate, avgMinutes);
  }

  generateRecommendations(stats, successRate, avgMinutes) {
    console.log('💡 **Recommendations**');
    
    const recommendations = [];

    if (successRate < 0.8) {
      recommendations.push('🔧 Investigate failing workflows and improve error handling');
    }

    if (avgMinutes > 15) {
      recommendations.push('⚡ Consider optimizing slow jobs with better caching or parallelization');
    }

    if (stats.failure > 0) {
      recommendations.push('🔍 Review recent failures and add better retry mechanisms');
    }

    if (stats.cancelled > stats.total * 0.1) {
      recommendations.push('⏹️ High cancellation rate - review concurrency settings');
    }

    if (recommendations.length === 0) {
      console.log('└─ ✅ No issues detected - workflows are performing well!');
    } else {
      recommendations.forEach((rec, index) => {
        const prefix = index === recommendations.length - 1 ? '└─' : '├─';
        console.log(`${prefix} ${rec}`);
      });
    }
  }

  formatDuration(ms) {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}

// Run the monitor
if (require.main === module) {
  const monitor = new WorkflowMonitor();
  monitor.analyzeWorkflowPerformance().catch(console.error);
}

module.exports = WorkflowMonitor;
