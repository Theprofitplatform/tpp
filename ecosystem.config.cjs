module.exports = {
  apps: [
    {
      name: 'tpp-backend',
      script: './backend/server.js',
      cwd: '/mnt/c/Users/abhis/projects/atpp/tpp',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 4321,
        SMTP_HOST: 'smtp.gmail.com',
        SMTP_PORT: 587,
        SMTP_USER: 'abhishekmaharjan3737@gmail.com',
        SMTP_PASS: 'ylbsatvowjqmyyjl',
        SMTP_FROM: 'noreply@theprofitplatform.com.au',
        CONTACT_EMAIL: 'avi@theprofitplatform.com.au',
        ALLOWED_ORIGINS: 'http://localhost:3001,https://theprofitplatform.com.au'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    }
  ]
};
