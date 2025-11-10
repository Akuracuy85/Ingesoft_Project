#!/bin/bash
# =====================================
# SETUP NGINX + HTTPS (LETS ENCRYPT)
# =====================================

DOMAIN="uniteapps.com"
APP_PORT=3000
EMAIL="cherediar123@correo.com"

echo "================================"
echo "Configurando Nginx como reverse proxy para $DOMAIN..."
echo "================================"

NGINX_CONF="/etc/nginx/sites-available/$DOMAIN.conf"

sudo tee $NGINX_CONF > /dev/null <<EOF
# =====================================
# NGINX REVERSE PROXY + HTTPS
# =====================================

# Redirección de HTTP a HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

# Bloque HTTPS
server {
    listen 443 ssl;
    server_name $DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Proxy para tu frontend (S3)
    location / {
        proxy_pass http://uniteapps.com.s3-website-us-east-1.amazonaws.com;
        proxy_set_header Host \$host;
    }

    # Proxy para tu backend (API)
    location /api/ {
        proxy_pass http://localhost:$APP_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

sudo ln -sf $NGINX_CONF /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "================================"
echo "¿Deseas generar o renovar el certificado SSL con Let's Encrypt?"
echo "(y/n): "
read -r SSL_CHOICE

if [[ "$SSL_CHOICE" == "y" || "$SSL_CHOICE" == "Y" ]]; then
  echo "Generando certificado HTTPS con Certbot..."
  sudo certbot certonly --nginx -d $DOMAIN || {
    echo "⚠️ Certbot falló, revisa /var/log/letsencrypt/letsencrypt.log"
  }
else
  echo "Saltando configuración de SSL..."
fi

echo "================================"
echo "Setup completo para $DOMAIN"
echo "Puedes probar ahora en:"
echo "https://$DOMAIN/api/sas"
echo "================================"
