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
        ALLOWED_ORIGINS: 'http://localhost:3001,https://theprofitplatform.com.au',
        SERP_API_KEY: '6da08486e3daea8a615380933814ba9485da9e71713985b14460fc6256eecc71'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true
    },
    {
      name: 'cloudflare-tunnel',
      script: 'cloudflared',
      args: 'tunnel --url http://localhost:4321',
      cwd: '/mnt/c/Users/abhis/projects/atpp/tpp/backend',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      error_file: './logs/tunnel-error.log',
      out_file: './logs/tunnel-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
