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

## Oracle Cloud Network Configuration

Oracle Cloud has its own network-level firewall (Security Lists) that sits outside the instance. Even with UFW configured correctly inside the VM, traffic on ports 80 and 443 will be blocked unless ingress rules are explicitly added at the VCN level.

### 1. Assign a Reserved Public IP

By default, Oracle may not assign a public IP during instance creation. A reserved public IP ensures the address never changes even if the instance is stopped or recreated.

**Steps:**
1. Go to **Compute → Instances → your instance**
2. Scroll to **Attached VNICs** and click the primary VNIC
3. Click **IPv4 Addresses**
4. Click the three-dot menu next to the private IP → **Edit**
5. Under **Public IP**, select **Reserved public IP**
6. Give it a name (e.g. `hng-public-ip`) and click **Save**

### 2. Open Ports 80 and 443 in the Security List

**Steps:**
1. Go to **Networking → Virtual Cloud Networks → your VCN**
2. Click **Security Lists** → default security list
3. Click **Add Ingress Rules** and add the following two rules:

**HTTP — Port 80:**

| Field | Value |
|---|---|
| Source CIDR | `0.0.0.0/0` |
| IP Protocol | TCP |
| Destination Port Range | `80` |

**HTTPS — Port 443:**

| Field | Value |
|---|---|
| Source CIDR | `0.0.0.0/0` |
| IP Protocol | TCP |
| Destination Port Range | `443` |

> **Note:** Port 22 (SSH) is open by default in Oracle's Security List. The two ICMP rules present by default are unrelated to port-based access and can be left as is.

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

Enable the site, test the config, and reload Nginx:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/kloudwiz.xyz /etc/nginx/sites-enabled/

# Remove the default site
sudo rm /etc/nginx/sites-enabled/default

# Test config for syntax errors
sudo nginx -t

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

### 4. SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d kloudwiz.xyz -d www.kloudwiz.xyz
```

Certbot automatically modifies the Nginx config to add the SSL server block and configure the 301 HTTP → HTTPS redirect. It also sets up a systemd timer for auto-renewal every 90 days.

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