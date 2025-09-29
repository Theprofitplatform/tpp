module.exports = {
  apps: [
    {
      name: 'tpp-astro',
      script: './dist/server/entry.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      // Restart policy
      watch: false,
      ignore_watch: ['node_modules', 'dist'],
      restart_delay: 5000,
      max_memory_restart: '1G',

      // Error handling
      min_uptime: '10s',
      max_restarts: 10,

      // Logging
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Advanced PM2 features
      kill_timeout: 5000,
      listen_timeout: 8000,

      // Health checks
      health_check_url: 'http://localhost:3001/',
      health_check_grace_period: 3000,

      // Auto restart if memory usage exceeds limit
      autorestart: true,

      // Environment variables for VPS deployment
      env_vars: {
        // Add any required environment variables here
        ASTRO_TELEMETRY_DISABLED: 1
      }
    }
  ],

  // Deployment configuration for VPS
  deploy: {
    production: {
      user: 'avi',
      host: '31.97.222.218',
      ref: 'origin/main',
      repo: 'git@github.com:Theprofitplatform/tpp.git',
      path: '/home/avi/projects/tpp-astro',
      'pre-deploy': 'git pull origin main',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': 'mkdir -p /home/avi/projects/tpp-astro/logs'
    }
  }
};