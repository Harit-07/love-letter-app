// ดึง Element ปลอดภัยด้วยฟังก์ชันช่วย
const getEl = (id) => document.getElementById(id);

const form = getEl('letterForm');
const greetingInput = getEl('greetingInput');
const messageInput = getEl('messageInput');
const signatureInput = getEl('signatureInput');
const previewGreeting = getEl('previewGreeting');
const previewMessage = getEl('previewMessage');
const previewSignature = getEl('previewSignature');
const themePicker = getEl('themePicker');
const stickerPicker = getEl('stickerPicker');
const stickerLayer = getEl('stickerLayer');
const photoInput = getEl('photoInput');
const photoPreview = getEl('photoPreview');
const photoSlot = getEl('photoSlot');
const previewButton = getEl('previewButton');
const saveButton = getEl('saveButton');
const copyLinkButton = getEl('copyLinkButton');
const downloadButton = getEl('downloadButton');
const envelopeCard = getEl('envelopeCard');
const openButton = getEl('openButton');
const previewPanel = getEl('previewPanel');
const statusBox = getEl('statusBox');
const recipientView = getEl('recipientView');
const recipientGreeting = getEl('recipientGreeting');
const recipientMessage = getEl('recipientMessage');
const recipientSignature = getEl('recipientSignature');
const recipientStickerLayer = getEl('recipientStickerLayer');
const recipientPhotoSlot = getEl('recipientPhotoSlot');
const recipientClose = getEl('recipientClose');
const recipientActionBtn = getEl('recipientActionBtn');

const state = {
  greeting: 'Hey cutie~',
  message: 'You make every ordinary moment feel soft, bright, and full of love. I’m so lucky to have you in my life, and I hope this little note brings a smile to your face today.',
  signature: 'With all my love',
  theme: 'pink',
  stickers: [],
  photoDataUrl: '',
  slug: ''
};

function applyTheme(theme) {
  document.body.classList.remove('theme-pink', 'theme-lavender', 'theme-mint', 'theme-peach');
  document.body.classList.add(`theme-${theme}`);
}

function syncForm() {
  if (greetingInput) greetingInput.value = state.greeting;
  if (messageInput) messageInput.value = state.message;
  if (signatureInput) signatureInput.value = state.signature;
  document.querySelectorAll('.theme-chip').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === state.theme);
  });
  renderPreview();
}

function updateStateFromForm() {
  if (greetingInput) state.greeting = greetingInput.value.trim() || 'Hey cutie~';
  if (messageInput) state.message = messageInput.value.trim() || 'You make every ordinary moment feel soft, bright, and full of love.';
  if (signatureInput) state.signature = signatureInput.value.trim() || 'With all my love';
  renderPreview();
}

function renderPreview() {
  if (previewGreeting) previewGreeting.textContent = state.greeting;
  if (previewMessage) previewMessage.textContent = state.message;
  if (previewSignature) previewSignature.textContent = state.signature;
  if (recipientGreeting) recipientGreeting.textContent = state.greeting;
  if (recipientMessage) recipientMessage.textContent = state.message;
  if (recipientSignature) recipientSignature.textContent = state.signature;
  applyTheme(state.theme);

  if (stickerLayer) {
    stickerLayer.innerHTML = '';
    state.stickers.forEach((sticker, index) => {
      const element = document.createElement('div');
      element.className = 'sticker';
      element.dataset.index = index;
      element.style.left = `${sticker.x}%`;
      element.style.top = `${sticker.y}%`;
      element.textContent = sticker.emoji;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove';
      removeBtn.textContent = '×';
      removeBtn.type = 'button';
      removeBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        state.stickers.splice(index, 1);
        renderPreview();
      });

      element.appendChild(removeBtn);
      bindDrag(element, index);
      stickerLayer.appendChild(element);
    });
  }

  const photoHtml = state.photoDataUrl ? `<img src="${state.photoDataUrl}" alt="Memory" />` : '';
  if (photoPreview) photoPreview.innerHTML = photoHtml;
  if (photoSlot) photoSlot.innerHTML = photoHtml;
  if (recipientPhotoSlot) recipientPhotoSlot.innerHTML = photoHtml;
}

function bindDrag(element, index) {
  let dragging = false;
  let startX = 0, startY = 0, originX = 0, originY = 0;

  element.addEventListener('pointerdown', (event) => {
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    const rect = element.getBoundingClientRect();
    originX = rect.left;
    originY = rect.top;
    element.setPointerCapture(event.pointerId);
  });

  element.addEventListener('pointermove', (event) => {
    if (!dragging || !stickerLayer) return;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const parentRect = stickerLayer.getBoundingClientRect();
    const nextX = ((originX + deltaX - parentRect.left) / parentRect.width) * 100;
    const nextY = ((originY + deltaY - parentRect.top) / parentRect.height) * 100;
    const clampedX = Math.max(2, Math.min(92, nextX));
    const clampedY = Math.max(2, Math.min(92, nextY));
    state.stickers[index].x = clampedX;
    state.stickers[index].y = clampedY;
    element.style.left = `${clampedX}%`;
    element.style.top = `${clampedY}%`;
  });

  const stopDrag = () => { dragging = false; };
  element.addEventListener('pointerup', stopDrag);
  element.addEventListener('pointercancel', stopDrag);
}

function addSticker(emoji) {
  state.stickers.push({ emoji, x: 75, y: 16 });
  renderPreview();
}

function openEnvelope() {
  if (envelopeCard) envelopeCard.classList.add('open');
  if (openButton) openButton.textContent = 'Lovely!';
}

function closeEnvelope() {
  if (envelopeCard) envelopeCard.classList.remove('open');
  if (openButton) openButton.textContent = 'Tap to open';
}

function buildShareUrl(slug) {
  return `${window.location.origin}/letter/${slug}`;
}

async function saveLetter() {
  updateStateFromForm();
  const payload = {
    greeting: state.greeting,
    message: state.message,
    signature: state.signature,
    theme: state.theme,
    stickers: state.stickers,
    photo: state.photoDataUrl
  };

  const response = await fetch('/api/letters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Unable to save letter');
  }

  state.slug = data.slug;
  window.history.replaceState({}, '', `/letter/${data.slug}`);
  if (statusBox) statusBox.textContent = 'Letter saved! Share this link with your favorite person.';
  if (copyLinkButton) copyLinkButton.textContent = 'Copy Link';
  setTimeout(openEnvelope, 250);
  return data;
}

async function loadLetter(slug) {
  const response = await fetch(`/api/letters/${slug}`);
  if (!response.ok) throw new Error('Letter not found');
  const data = await response.json();
  Object.assign(state, data);
  syncForm();
  if (previewPanel) previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(openEnvelope, 350);
  if (statusBox) statusBox.textContent = 'This letter is ready to open.';
}

function loadFromUrl() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);
  if (!match) return false;
  loadLetter(match[1]).catch(() => {
    if (statusBox) statusBox.textContent = 'This letter could not be loaded.';
  });
  return true;
}

// Attach Event Listeners อย่างปลอดภัย
if (form) {
  form.addEventListener('input', updateStateFromForm);
  form.addEventListener('change', updateStateFromForm);
}

if (previewButton) {
  previewButton.addEventListener('click', () => {
    updateStateFromForm();
    if (previewPanel) previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(openEnvelope, 250);
  });
}

if (saveButton) {
  saveButton.addEventListener('click', async () => {
    saveButton.textContent = 'Saving...';
    try {
      await saveLetter();
    } catch (error) {
      if (statusBox) statusBox.textContent = error.message;
    } finally {
      saveButton.textContent = 'Create Letter';
    }
  });
}

if (copyLinkButton) {
  copyLinkButton.addEventListener('click', async () => {
    if (!state.slug) {
      if (statusBox) statusBox.textContent = 'Create the letter first to get a link.';
      return;
    }
    const link = buildShareUrl(state.slug);
    await navigator.clipboard.writeText(link).catch(() => {});
    copyLinkButton.textContent = 'Copied!';
    if (statusBox) statusBox.textContent = 'Link copied.';
    setTimeout(() => {
      copyLinkButton.textContent = 'Copy Link';
    }, 1800);
  });
}

if (openButton) {
  openButton.addEventListener('click', () => {
    if (envelopeCard && envelopeCard.classList.contains('open')) {
      closeEnvelope();
    } else {
      openEnvelope();
    }
  });
}

if (themePicker) {
  themePicker.addEventListener('click', (event) => {
    const button = event.target.closest('.theme-chip');
    if (!button) return;
    state.theme = button.dataset.theme;
    syncForm();
  });
}

if (stickerPicker) {
  stickerPicker.addEventListener('click', (event) => {
    const button = event.target.closest('.sticker-chip');
    if (!button) return;
    addSticker(button.dataset.sticker);
  });
}

if (photoInput) {
  photoInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width, height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        state.photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        renderPreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

if (recipientClose) {
  recipientClose.addEventListener('click', () => {
    window.location.href = '/';
  });
}

// เริ่มต้นทำงาน
document.addEventListener('DOMContentLoaded', () => {
  syncForm();
  loadFromUrl();
});