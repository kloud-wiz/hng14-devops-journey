# Stage 0 — Linux Server Setup & Nginx Configuration

A production-hardened Linux server provisioned on Oracle Cloud, serving a static webpage and a JSON API endpoint over HTTPS, secured with Let's Encrypt SSL and protected by UFW firewall rules.

**Live URL:** https://kloudwiz.xyz

---

## Architecture

![Architecture Diagram](../assets/images/stage-0-architecture.png)

> _Diagram coming soon — will illustrate the request flow from client → DNS → UFW → Nginx → static HTML / JSON response, with SSL termination layer._

---

## What Was Built

| Endpoint | Method | Response |
|---|---|---|
| `https://kloudwiz.xyz/` | GET | Static HTML page with HNG username |
| `https://kloudwiz.xyz/api` | GET | JSON response with track and username |
| `http://kloudwiz.xyz/*` | ANY | 301 redirect to HTTPS |

### API Response
```json
{
  "message": "HNGI14 Stage 0",
  "track": "DevOps",
  "username": "kloudwiz"
}
```

---

## Infrastructure

| Component | Detail |
|---|---|
| Cloud Provider | Oracle Cloud (Always Free Tier) |
| Region | UK South (London) |
| Instance | VM.Standard.E2.1.Micro |
| OS | Ubuntu 22.04 LTS |
| IP | Reserved public IP (132.145.11.52) |
| Domain | kloudwiz.xyz (Namecheap) |
| Web Server | Nginx 1.18.0 |
| SSL | Let's Encrypt via Certbot |
| Firewall | UFW |

---

## Implementation

### 1. Server Hardening

Created a non-root sudo user `hngdevops` and locked down SSH access:

```bash
# Create user and add to sudo group
sudo adduser hngdevops
sudo usermod -aG sudo hngdevops

# Configure passwordless sudo for sshd and ufw only
sudo visudo -f /etc/sudoers.d/hngdevops
# hngdevops ALL=(root) NOPASSWD:/usr/sbin/sshd,/usr/sbin/ufw

# Copy SSH public key to hngdevops
sudo mkdir -p /home/hngdevops/.ssh
sudo cp /home/ubuntu/.ssh/authorized_keys /home/hngdevops/.ssh/authorized_keys
sudo chown -R hngdevops:hngdevops /home/hngdevops/.ssh
sudo chmod 700 /home/hngdevops/.ssh
sudo chmod 600 /home/hngdevops/.ssh/authorized_keys
```

SSH hardening in `/etc/ssh/sshd_config`:
```
PermitRootLogin no
PasswordAuthentication no
```

### 2. Firewall Configuration

UFW configured to allow only required ports:

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Nginx Configuration

`/etc/nginx/sites-available/kloudwiz.xyz`:

```nginx
server {
    listen 80;
    server_name kloudwiz.xyz www.kloudwiz.xyz;

    location / {
        root /var/www/html;
        index index.html;
    }

    location /api {
        add_header Content-Type application/json;
        return 200 '{"message": "HNGI14 Stage 0", "track": "DevOps", "username": "kloudwiz"}';
    }
}
```

### 4. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d kloudwiz.xyz -d www.kloudwiz.xyz
```

Certbot automatically configured the 301 HTTP → HTTPS redirect and set up auto-renewal.

---

## Verification

```bash
# Test HTTPS endpoints
curl https://kloudwiz.xyz
curl https://kloudwiz.xyz/api

# Verify 301 redirect
curl -I http://kloudwiz.xyz

# Confirm UFW status
sudo ufw status

# Confirm passwordless sudo for hngdevops
sudo su - hngdevops
sudo /usr/sbin/sshd -T | head -5
sudo /usr/sbin/ufw status
```

---

## Security Checklist

- [x] Non-root user `hngdevops` with limited passwordless sudo
- [x] Root SSH login disabled
- [x] Password-based SSH authentication disabled
- [x] Key-based SSH only
- [x] UFW active — ports 22, 80, 443 only
- [x] Valid Let's Encrypt SSL certificate
- [x] HTTP to HTTPS 301 redirect

---

## Author

**kloudwiz** — Cloud & DevOps Engineer  
GitHub: [github.com/kloud-wiz](https://github.com/kloud-wiz) | Blog: [kloudwiz.hashnode.dev](https://kloudwiz.hashnode.dev)