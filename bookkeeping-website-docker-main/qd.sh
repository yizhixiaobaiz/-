#!/bin/bash
set -e

# 自动适配 Windows/Linux
if [[ "$(uname -s)" == MINGW* || "$(uname -s)" == MSYS* ]]; then
  SUBJ="//CN=localhost"
else
  SUBJ="/CN=localhost"
fi

echo "=========================================="
echo "      生成 Nginx 证书"
echo "=========================================="
mkdir -p ./ssl
rm -rf ./ssl/*

# 生成 server.crt + server.key（与 nginx.conf 配置匹配）
openssl req -x509 -newkey rsa:2048 \
  -keyout ./ssl/server.key \
  -out ./ssl/server.crt \
  -days 3650 \
  -nodes \
  -subj "${SUBJ}"

echo -e "\n=========================================="
echo "          放行端口 80 443 3000"
echo "=========================================="
if command -v firewall-cmd &>/dev/null; then
  firewall-cmd --permanent --add-port=80/tcp >/dev/null 2>&1
  firewall-cmd --permanent --add-port=443/tcp >/dev/null 2>&1
  firewall-cmd --permanent --add-port=3000/tcp >/dev/null 2>&1
  firewall-cmd --reload >/dev/null 2>&1
fi

if command -v ufw &>/dev/null; then
  ufw allow 80/tcp >/dev/null 2>&1
  ufw allow 443/tcp >/dev/null 2>&1
  ufw allow 3000/tcp >/dev/null 2>&1
fi

echo -e "\n=========================================="
echo "           停止旧容器并重新启动"
echo "=========================================="
docker compose -p expense-tracker down
docker compose -p expense-tracker up -d --build

echo -e "\n=========================================="
echo "               运行成功！"
echo "=========================================="
echo "访问地址："
echo "  - HTTP:  http://localhost"
echo "  - HTTPS: https://localhost (浏览器可能显示安全警告，点击继续访问)"
echo "  - API:   http://localhost:3000/api"
echo ""
docker ps --filter "name=expense-tracker"