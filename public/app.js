// ระบบเปิด-ปิดจดหมายทั้งในฝั่ง Preview และ Recipient View
function setupEnvelopeToggle() {
  const previewContainer = document.getElementById('previewContainer');
  const cover = document.getElementById('coverEnvelope');
  const letterBoard = document.getElementById('letterBoard');
  const mainCard = document.querySelector('.main-card');

  // 1. คลิกที่ปกจดหมายเพื่อ "เปิด"
  if (cover && previewContainer) {
    cover.addEventListener('click', (e) => {
      e.stopPropagation();
      previewContainer.classList.add('open');
      previewContainer.classList.remove('closed');
    });
  }

  // 2. คลิกที่กระดานเพื่อ "ปิด" จดหมาย
  if (letterBoard && previewContainer) {
    letterBoard.addEventListener('click', (e) => {
      // ตรวจสอบว่าไม่ได้คลิกที่ตัวควบคุมสติ๊กเกอร์/รูปภาพ
      if (!e.target.closest('.interactive-item') && !e.target.closest('.main-card')) {
        previewContainer.classList.remove('open');
        previewContainer.classList.add('closed');
      }
    });
  }

  // ป้องกันการคลิกที่การ์ดข้อความหลักแล้วจดหมายปิด
  if (mainCard) {
    mainCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }
}