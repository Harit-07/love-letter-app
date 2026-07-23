const form = document.getElementById('letterForm');
const greetingInput = document.getElementById('greetingInput');
const messageInput = document.getElementById('messageInput');
const signatureInput = document.getElementById('signatureInput');
const previewGreeting = document.getElementById('previewGreeting');
const previewMessage = document.getElementById('previewMessage');
const previewSignature = document.getElementById('previewSignature');
const themePicker = document.getElementById('themePicker');
const stickerPicker = document.getElementById('stickerPicker');
const stickerLayer = document.getElementById('stickerLayer');
const photoInput = document.getElementById('photoInput');
const photoPreview = document.getElementById('photoPreview');
const photoSlot = document.getElementById('photoSlot');
const previewButton = document.getElementById('previewButton');
const saveButton = document.getElementById('saveButton');
const copyLinkButton = document.getElementById('copyLinkButton');
const downloadButton = document.getElementById('downloadButton');
const envelopeCard = document.getElementById('envelopeCard');
const openButton = document.getElementById('openButton');
const previewPanel = document.getElementById('previewPanel');
const statusBox = document.getElementById('statusBox');
const recipientView = document.getElementById('recipientView');
const recipientGreeting = document.getElementById('recipientGreeting');
const recipientMessage = document.getElementById('recipientMessage');
const recipientSignature = document.getElementById('recipientSignature');
const recipientStickerLayer = document.getElementById('recipientStickerLayer');
const recipientPhotoSlot = document.getElementById('recipientPhotoSlot');
const recipientClose = document.getElementById('recipientClose');
const recipientActionBtn = document.getElementById('recipientActionBtn');

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
  greetingInput.value = state.greeting;
  messageInput.value = state.message;
  signatureInput.value = state.signature;
  document.querySelectorAll('.theme-chip').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.theme === state.theme);
  });
  renderPreview();
}

function updateStateFromForm() {
  state.greeting = greetingInput.value.trim() || 'Hey cutie~';
  state.message = messageInput.value.trim() || 'You make every ordinary moment feel soft, bright, and full of love.';
  state.signature = signatureInput.value.trim() || 'With all my love';
  renderPreview();
}

function renderPreview() {
  previewGreeting.textContent = state.greeting;
  previewMessage.textContent = state.message;
  previewSignature.textContent = state.signature;
  recipientGreeting.textContent = state.greeting;
  recipientMessage.textContent = state.message;
  recipientSignature.textContent = state.signature;
  applyTheme(state.theme);

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

  if (state.photoDataUrl) {
    photoPreview.innerHTML = `<img src="${state.photoDataUrl}" alt="Your chosen memory" />`;
    photoSlot.innerHTML = `<img src="${state.photoDataUrl}" alt="Your chosen memory" />`;
    recipientPhotoSlot.innerHTML = `<img src="${state.photoDataUrl}" alt="Your chosen memory" />`;
  } else {
    photoPreview.innerHTML = '';
    photoSlot.innerHTML = '';
    recipientPhotoSlot.innerHTML = '';
  }
}

function bindDrag(element, index) {
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;

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
    if (!dragging) return;
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

  element.addEventListener('pointerup', () => {
    dragging = false;
  });

  element.addEventListener('pointercancel', () => {
    dragging = false;
  });
}

function addSticker(emoji) {
  state.stickers.push({ emoji, x: 75, y: 16 });
  renderPreview();
}

function openEnvelope() {
  envelopeCard.classList.add('open');
  openButton.textContent = 'Lovely!';
}

function closeEnvelope() {
  envelopeCard.classList.remove('open');
  openButton.textContent = 'Tap to open';
}

function encodeState() {
  return btoa(encodeURIComponent(JSON.stringify(state)));
}

function decodeState(encoded) {
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(encoded)));
    Object.assign(state, parsed);
    return true;
  } catch (error) {
    return false;
  }
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
  renderRecipientView();
  setTimeout(openEnvelope, 250);
  statusBox.textContent = 'Letter saved! Share this link with your favorite person.';
  copyLinkButton.textContent = 'Copy Link';
  return data;
}

async function loadLetter(slug) {
  const response = await fetch(`/api/letters/${slug}`);
  if (!response.ok) {
    throw new Error('Letter not found');
  }
  const data = await response.json();
  Object.assign(state, data);
  syncForm();
  renderRecipientView();
  previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(openEnvelope, 350);
  statusBox.textContent = 'This letter is ready to open.';
}

function renderRecipientView() {
  recipientView.hidden = true;
  const appShell = document.getElementById('appShell');
  appShell.classList.add('recipient-mode');
  document.getElementById('editorPanel').style.display = 'none';
  document.getElementById('previewPanel').style.display = 'flex';
  document.getElementById('previewPanel').classList.add('recipient-mode-panel');
}

function renderEditorView() {
  recipientView.hidden = true;
  const appShell = document.getElementById('appShell');
  appShell.classList.remove('recipient-mode');
  document.getElementById('editorPanel').style.display = 'block';
  document.getElementById('previewPanel').style.display = 'flex';
  document.getElementById('previewPanel').classList.remove('recipient-mode-panel');
}

function loadFromUrl() {
  const path = window.location.pathname;
  const match = path.match(/\/letter\/(.+)$/);
  if (!match) {
    renderEditorView();
    return false;
  }
  const slug = match[1];
  renderRecipientView();
  loadLetter(slug).catch(() => {
    statusBox.textContent = 'This letter could not be loaded.';
  });
  return true;
}

function buildSvgMarkup() {
  const safeGreeting = escapeXml(state.greeting);
  const safeMessage = escapeXml(state.message.replace(/\n/g, ' '));
  const safeSignature = escapeXml(state.signature);
  const stickerMarkup = state.stickers.map((sticker) => {
    return `<text x="${sticker.x}%" y="${sticker.y}%" font-size="38" text-anchor="middle">${escapeXml(sticker.emoji)}</text>`;
  }).join('');
  const photoMarkup = state.photoDataUrl
    ? `<image x="70%" y="62%" width="160" height="200" href="${state.photoDataUrl}" />`
    : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1600" viewBox="0 0 1080 1600">
      <rect width="1080" height="1600" fill="#fff8f3" />
      <rect x="90" y="90" width="900" height="1420" rx="40" fill="#fffdf9" stroke="#f2dfe8" stroke-width="6" />
      <text x="540" y="240" text-anchor="middle" font-family="Segoe Print, Comic Sans MS, cursive" font-size="52" fill="#6d4c5f">${safeGreeting}</text>
      <text x="540" y="360" text-anchor="middle" font-family="Segoe Print, Comic Sans MS, cursive" font-size="34" fill="#6d4c5f">${safeMessage}</text>
      <text x="540" y="1340" text-anchor="middle" font-family="Segoe Print, Comic Sans MS, cursive" font-size="42" fill="#6d4c5f">${safeSignature}</text>
      ${stickerMarkup}
      ${photoMarkup}
    </svg>`;
}

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function downloadSvg() {
  const svgMarkup = buildSvgMarkup();
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'love-letter.svg';
  link.click();
  URL.revokeObjectURL(url);
}

// Event wiring
form.addEventListener('input', updateStateFromForm);
form.addEventListener('change', updateStateFromForm);

previewButton.addEventListener('click', () => {
  updateStateFromForm();
  previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(openEnvelope, 250);
});

saveButton.addEventListener('click', async () => {
  saveButton.textContent = 'Saving...';
  try {
    await saveLetter();
  } catch (error) {
    statusBox.textContent = error.message;
  } finally {
    saveButton.textContent = 'Create Letter';
  }
});

copyLinkButton.addEventListener('click', async () => {
  if (!state.slug) {
    statusBox.textContent = 'Create the letter first to get a link.';
    return;
  }
  const link = buildShareUrl(state.slug);
  await navigator.clipboard.writeText(link).catch(() => {});
  copyLinkButton.textContent = 'Copied!';
  statusBox.textContent = 'Link copied.';
  setTimeout(() => {
    copyLinkButton.textContent = 'Copy Link';
  }, 1800);
});

downloadButton.addEventListener('click', () => {
  updateStateFromForm();
  downloadSvg();
});

openButton.addEventListener('click', () => {
  if (envelopeCard.classList.contains('open')) {
    closeEnvelope();
  } else {
    openEnvelope();
  }
});
recipientClose.addEventListener('click', () => {
  window.location.href = '/';
});
themePicker.addEventListener('click', (event) => {
  const button = event.target.closest('.theme-chip');
  if (!button) return;
  state.theme = button.dataset.theme;
  syncForm();
});

stickerPicker.addEventListener('click', (event) => {
  const button = event.target.closest('.sticker-chip');
  if (!button) return;
  addSticker(button.dataset.sticker);
});

photoInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.photoDataUrl = reader.result;
    renderPreview();
  };
  reader.readAsDataURL(file);
});

syncForm();
loadFromUrl();
