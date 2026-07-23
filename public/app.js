photoInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // สร้าง Canvas เพื่อย่อขนาดภาพ
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

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

      // แปลงเป็น JPEG ที่คุณภาพ 0.7 (ไฟล์จะเหลือแค่ไม่กี่ KB)
      state.photoDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      renderPreview();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
});