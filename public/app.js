// ฟังก์ชันสร้างหัวใจลอยพื้นหลัง
function createFloatingHearts() {
  const container = document.getElementById('floatingHeartsContainer');
  if (!container) return;
  const emojis = ['💖', '💗', '✨', '🌸', '🎁', '💕'];
  
  setInterval(() => {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    heart.style.fontSize = (Math.random() * 15 + 20) + 'px';
    container.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 7000);
  }, 450);
}

// ตรวจสอบ URL: ถ้ามี /letter/slug ให้แสดงหน้าแฟน (Recipient View) เท่านั้น!
async function checkRecipientMode() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);
  
  if (match) {
    const slug = match[1];
    // ซ่อนหน้าตัวสร้าง (Editor) และ พรีวิว
    document.getElementById('editorPanel').style.display = 'none';
    document.getElementById('previewPanel').style.display = 'none';
    
    // แสดงหน้ารับจดหมายของแฟน
    const recipientView = document.getElementById('recipientView');
    recipientView.style.display = 'flex';
    
    try {
      const res = await fetch(`/api/letters/${slug}`);
      if (res.ok) {
        const data = await res.json();
        document.getElementById('recipientGreeting').textContent = data.greeting;
        document.getElementById('recipientMessage').textContent = data.message;
        document.getElementById('recipientSignature').textContent = data.signature;
        document.body.className = `theme-${data.theme || 'pink'}`;

        if (data.photo) {
          document.getElementById('recipientPhotoSlot').innerHTML = `<img src="${data.photo}" style="max-width:100%; border-radius:12px; margin-top:10px;" />`;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}

// ปุ่มเปิดซองจดหมายหน้ารับ
document.getElementById('recipientOpenBtn')?.addEventListener('click', function() {
  const envelope = document.getElementById('recipientEnvelope');
  if (envelope) envelope.classList.add('open');
  this.style.display = 'none';
});

// เริ่มทำงานเมื่อโหลดหน้า
document.addEventListener('DOMContentLoaded', () => {
  createFloatingHearts();
  checkRecipientMode();
});