Perfect 👍 — here’s the clean, complete summary of all commands for Option A: start fresh.
This will completely reset your VM (delete the broken one and create a new, clean Debian 12 machine).

🧹 Step 1 – Delete the broken VM and old disks
gcloud config set project pv-management-app

# Stop and delete the old instance (boot + data disks)
gcloud compute instances delete app-vm \
  --zone=europe-west1-b --quiet

# Delete the extra database disk if it still exists
gcloud compute disks delete db-disk \
  --zone=europe-west1-b --quiet

⚙️ Step 2 – Create a brand-new VM
gcloud compute instances create app-vm \
  --zone=europe-west1-b \
  --machine-type=e2-micro \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=30GB \
  --tags=http-server,https-server

🪣 Step 3 – Create and attach a new persistent disk
# create a 30 GB balanced disk for DB data
gcloud compute disks create db-disk \
  --size=30GB \
  --zone=europe-west1-b \
  --type=pd-balanced

# attach it to the VM
gcloud compute instances attach-disk app-vm \
  --disk=db-disk \
  --zone=europe-west1-b

🌐 Step 4 – (If needed) Open HTTP / HTTPS firewall ports
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 --direction=INGRESS --network=default --quiet || true

gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 --direction=INGRESS --network=default --quiet || true

🔐 Step 5 – SSH into the new VM
gcloud compute ssh app-vm --zone=europe-west1-b

🐳 Step 6 – Install Docker + Compose
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker


Verify:

docker version
docker compose version

📦 Step 7 – Deploy your app
cd ~
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git app
cd app
docker compose up -d


Then visit:
👉 http://<EXTERNAL_IP>

(Find the IP with gcloud compute instances describe app-vm --zone=europe-west1-b --format='get(networkInterfaces[0].accessConfigs[0].natIP)')


Note: Fix the disk not found on boot vm problem:

The robust fix (going forward)

Use the disk’s UUID and tell the OS “don’t fail the boot if it’s missing.”

Get the UUID:

sudo blkid /dev/sdb
# example output: UUID="abcd-1234-ef56..." TYPE="ext4"


Put this in /etc/fstab:

UUID=abcd-1234-ef56...  /mnt/db  ext4  defaults,nofail,x-systemd.device-timeout=10s  0  2


UUID=... → stable identifier (won’t change if it shows up as sdc next time).

nofail → boot continues even if the disk isn’t present.

x-systemd.device-timeout=10s → don’t hang for minutes waiting.