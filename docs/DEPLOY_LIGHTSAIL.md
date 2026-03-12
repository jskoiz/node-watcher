# BRDG Lightsail deployment

This stack deploys the backend API to a single Ubuntu Lightsail instance with:

- NestJS API in Docker
- Postgres in Docker
- Cloudflare Tunnel for public HTTPS

Recommended production API host:

- `api.brdg.social`

## Server bootstrap

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git
sudo usermod -aG docker ubuntu
```

## App deploy

```bash
git clone <repo> /opt/brdg
cd /opt/brdg/deploy/api
cp .env.example .env
docker compose up -d --build
```

If you want the current demo seed data, run it once manually after the stack is healthy:

```bash
cd /opt/brdg/backend
docker exec -it brdg-api npm run db:seed
```

## Verify

```bash
curl -I https://api.brdg.social
curl https://api.brdg.social
```
