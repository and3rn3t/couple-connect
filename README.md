# 💕 Couple Connect

A modern relationship management application built with React, TypeScript, and Vite, designed to help couples strengthen their connection through gamified interactions and meaningful activities.

## 🚀 Features

- **Gamified Relationship Building**: Turn relationship activities into fun, engaging challenges
- **Partner Profiles**: Personalized experiences for each partner
- **Daily Challenges**: Keep the spark alive with daily relationship activities
- **Progress Tracking**: Visualize your relationship growth over time
- **Reward System**: Celebrate milestones and achievements together
- **Action Dashboard**: Quick access to relationship-building activities

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Git

## 🏗️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/and3rn3t/couple-connect.git
cd couple-connect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.development
# Edit .env.development with your configuration
```

### 4. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🚀 Deployment

### Cloudflare Pages (Recommended)

This project is configured for seamless deployment on Cloudflare Pages:

1. **Connect your repository** to Cloudflare Pages
2. **Set build configuration**:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node.js version: `20`

3. **Configure environment variables** in Cloudflare Pages dashboard:
   - `VITE_APP_NAME`: Couple Connect
   - `VITE_ENVIRONMENT`: production
   - `VITE_API_URL`: Your production API URL

4. **Deploy**: Push to main branch for automatic deployment

### Manual Deployment

```bash
npm run build
# Upload the dist/ folder to your hosting provider
```

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript type checking
npm run clean        # Clean build artifacts
```

## 🏗️ Project Structure

```
couple-connect/
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── ActionDashboard.tsx
│   │   ├── GamificationCenter.tsx
│   │   └── ...
│   ├── data/               # Static data and configurations
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── styles/             # Global styles
│   └── main.tsx            # Application entry point
├── .github/                # GitHub Actions workflows
├── public/                 # Static assets
└── dist/                   # Production build (generated)
```

## 🔐 Environment Variables

Create environment files based on `.env.example`:

- `.env.development` - Development environment
- `.env.production` - Production environment

### Required Variables

- `VITE_APP_NAME`: Application name
- `VITE_API_URL`: Backend API URL
- `VITE_ENVIRONMENT`: Environment (development/production)

### Optional Variables

- `VITE_ENABLE_DEBUG`: Enable debug mode
- `VITE_ENABLE_ANALYTICS`: Enable analytics
- `VITE_SENTRY_DSN`: Sentry error tracking
- `VITE_GOOGLE_ANALYTICS_ID`: Google Analytics

## 🔄 CI/CD Pipeline

The project includes comprehensive CI/CD with GitHub Actions:

- **Linting & Type Checking**: Automated code quality checks
- **Testing**: Automated test execution
- **Building**: Production build generation
- **Preview Deployments**: Automatic preview deployments for PRs
- **Production Deployments**: Automatic production deployment on main branch
- **Security Audits**: Weekly security scans
- **Dependency Updates**: Automated dependency updates with Dependabot

## 🛡️ Security

- Environment variables are properly configured
- Security headers are set in Cloudflare Pages
- Regular dependency audits via GitHub Actions
- Automated security scanning

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `npm run lint && npm run type-check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you need help with deployment or have questions:

1. Check the [Issues](https://github.com/and3rn3t/couple-connect/issues) page
2. Create a new issue with detailed information
3. Review the deployment logs in GitHub Actions

## 🌟 Acknowledgments

- Built with [GitHub Spark](https://github.com/github/spark) template
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Deployed on [Cloudflare Pages](https://pages.cloudflare.com/)
