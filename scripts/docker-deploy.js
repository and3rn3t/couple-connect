#!/usr/bin/env node

/**
 * Build and deploy to Docker Hub script for Couple Connect (Node.js)
 * Cross-platform Docker deployment script
 */

import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const IMAGE_NAME = 'couple-connect';
const DEFAULT_USERNAME = 'your-username';

class DockerDeployer {
  constructor() {
    this.dockerUsername = process.env.DOCKER_USERNAME || DEFAULT_USERNAME;
    this.version = process.env.VERSION || 'latest';
    this.fullImageName = `${this.dockerUsername}/${IMAGE_NAME}:${this.version}`;

    // Parse command line arguments
    this.parseArgs();
  }

  parseArgs() {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--username' || arg === '-u') {
        this.dockerUsername = args[i + 1];
        i++;
      } else if (arg === '--version' || arg === '-v') {
        this.version = args[i + 1];
        i++;
      } else if (arg === '--help' || arg === '-h') {
        this.showHelp();
        process.exit(0);
      }
    }

    // Update full image name after parsing args
    this.fullImageName = `${this.dockerUsername}/${IMAGE_NAME}:${this.version}`;
  }

  showHelp() {
    console.log(`
🚀 Docker Deploy Script for Couple Connect

Usage: node docker-deploy.js [options]

Options:
  -u, --username    Docker Hub username (env: DOCKER_USERNAME)
  -v, --version     Image version tag (env: VERSION, default: latest)
  -h, --help        Show this help message

Environment Variables:
  DOCKER_USERNAME   Your Docker Hub username
  VERSION          Image version tag

Examples:
  node docker-deploy.js --username myuser --version v1.0.0
  DOCKER_USERNAME=myuser VERSION=v1.0.0 node docker-deploy.js
`);
  }

  async runCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🔧 Running: ${command} ${args.join(' ')}`);

      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        ...options,
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start command: ${error.message}`));
      });
    });
  }

  async checkDockerInstalled() {
    try {
      await this.runCommand('docker', ['--version'], { stdio: 'pipe' });
      return true;
    } catch (error) {
      throw new Error('Docker is not installed or not accessible. Please install Docker first.');
    }
  }

  async validateInputs() {
    if (!this.dockerUsername || this.dockerUsername === DEFAULT_USERNAME) {
      console.error('❌ Error: Docker username is required');
      console.log('Set DOCKER_USERNAME environment variable or use --username flag');
      process.exit(1);
    }

    // Check if Dockerfile exists
    try {
      readFileSync(join(process.cwd(), 'Dockerfile'));
    } catch (error) {
      throw new Error('Dockerfile not found in current directory');
    }
  }

  async buildImage() {
    console.log('📦 Building Docker image...');
    await this.runCommand('docker', ['build', '-t', this.fullImageName, '.']);
  }

  async tagAsLatest() {
    if (this.version !== 'latest') {
      console.log('🏷️  Tagging as latest...');
      const latestTag = `${this.dockerUsername}/${IMAGE_NAME}:latest`;
      await this.runCommand('docker', ['tag', this.fullImageName, latestTag]);
    }
  }

  async pushToRegistry() {
    console.log('⬆️  Pushing to Docker Hub...');

    // Push versioned tag
    await this.runCommand('docker', [
      'push',
      `${this.dockerUsername}/${IMAGE_NAME}:${this.version}`,
    ]);

    // Push latest tag if different from version
    if (this.version !== 'latest') {
      await this.runCommand('docker', ['push', `${this.dockerUsername}/${IMAGE_NAME}:latest`]);
    }
  }

  async deploy() {
    try {
      console.log('🚀 Building and deploying Couple Connect to Docker Hub');
      console.log(`📋 Image: ${this.fullImageName}`);
      console.log(`🏗️  Platform: ${process.platform}`);
      console.log('');

      // Validation
      await this.checkDockerInstalled();
      await this.validateInputs();

      // Build and deploy
      await this.buildImage();
      await this.tagAsLatest();
      await this.pushToRegistry();

      console.log('');
      console.log('✅ Successfully deployed to Docker Hub!');
      console.log(`🎯 Run with: docker run -p 3000:80 ${this.fullImageName}`);
      console.log(`🌐 Registry: https://hub.docker.com/r/${this.dockerUsername}/${IMAGE_NAME}`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Main execution
if (
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))
) {
  const deployer = new DockerDeployer();
  deployer.deploy();
}

export default DockerDeployer;
