// capitalize the first letter
// Simple method to Convert a String to Slug (hỗ trợ đầy đủ tiếng Việt có dấu và đ/Đ)
export const slugify = (val) => {
  if (!val) return ''
  return String(val)
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

// hàm giữ chỗ 1 card trong column
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true,
    // cover: null,
    memberIds: [],
    comments: [],
    attachments: []
  }
}

// Kỹ thuật dùng css pointer-event để chặn user spam click tại bất kỳ chỗ nào có hành động click gọi api
// Sử dụng bộ đếm pendingRequestsCount để xử lý race condition khi có nhiều request API chạy đồng thời
let pendingRequestsCount = 0

export const interceptorLoadingElements = (calling) => {
  if (calling) {
    pendingRequestsCount++
  } else {
    pendingRequestsCount = Math.max(0, pendingRequestsCount - 1)
  }

  const shouldBlock = pendingRequestsCount > 0
  const elements = document.querySelectorAll('.interceptor-loading')
  for (let i = 0; i < elements.length; i++) {
    elements[i].style.opacity = shouldBlock ? '0.5' : 'initial'
    elements[i].style.pointerEvents = shouldBlock ? 'none' : 'initial'
  }
}
