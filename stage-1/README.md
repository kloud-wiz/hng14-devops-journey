# HNG14 Stage 1: Personal API

A lightweight Node.js/Express API developed for the HNG14 DevOps Track. This project demonstrates backend service deployment, process persistence using `systemd`, secure exposure via an Nginx reverse proxy with SSL, and optimized HTTP response handling.
---

## **Project Overview**
This API serves basic status and developer information. The primary focus of this stage is the DevOps lifecycle: provisioning a cloud server, securing it, and ensuring high availability via a reverse proxy and process manager.

### **Technical Specifications**
* **Language:** Node.js (Express framework)
* **Cloud Provider:** Oracle Cloud (Always Free Tier)
* **Region:** UK South (London)
* **Instance:** VM.Standard.E2.1.Micro (Ubuntu 22.04 LTS)
* **Web Server:** Nginx (Reverse Proxy)
* **SSL/TLS:** Let's Encrypt (Certbot)
* **Process Management:** `systemd` (for persistence and auto-restarts)
* **Security:** UFW (Uncomplicated Firewall) and Oracle VCN Security Lists

---

## **API Endpoints**

All endpoints return `Content-Type: application/json` and an HTTP `200 OK` status. Cache-control headers are implemented to prevent `304 Not Modified` responses, ensuring consistent evaluation.

| Endpoint | Method | Expected Response | Description |
| :--- | :--- | :--- | :--- |
| `/` | GET | `{"message": "API is running"}` | Root status check |
| `/health` | GET | `{"message": "healthy"}` | Standard health monitoring |
| `/me` | GET | `{"name": "...", "email": "...", "github": "..."}` | Developer profile details |

---

## **Infrastructure & Deployment**

### **1. Reverse Proxy & SSL**
Nginx is configured as a reverse proxy to handle incoming HTTPS traffic on port 443 and forward it to the internal Node.js service running on port 3000. 
* **SSL:** Secured using Certbot with automated redirects from HTTP (80) to HTTPS (443).
* **Optimization:** Disabled ETags and implemented strict `Cache-Control` headers in Express to ensure every request returns a fresh `200 OK`.

### **2. Persistence with systemd**
The application is managed by a `systemd` service (`kloudwiz-api.service`). This ensures:
* The API starts automatically on system boot.
* The process restarts automatically within 10 seconds if it crashes.

### **3. Security**
* **Firewall (UFW):** Only ports `22` (SSH), `80` (HTTP), and `443` (HTTPS) are allowed. Public access to port `3000` is explicitly denied.
* **Oracle VCN:** Ingress rules are narrowed to allow only necessary web traffic.

---

## **Local Development**

### **Prerequisites**
* Node.js (v16 or higher)
* npm (node package manager)

### **Setup Instructions**
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/kloud-wiz/hng14-devops-journey.git](https://github.com/kloud-wiz/hng14-devops-journey.git)
    cd hng14-devops-journey/stage-1/kloudwiz-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    node index.js
    ```
    The API will be available locally at `http://localhost:3000`.

---

## **Infrastructure & Deployment**

---

## **Live Deployment URL**
[https://kloudwiz.xyz](https://kloudwiz.xyz)
