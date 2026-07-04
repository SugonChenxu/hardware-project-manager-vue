/**
 * 文件上传 API（Mock 版）
 * 个人使用可先跳过，后期接入本地文件存储或 Supabase Storage
 */

export const uploadFile = async (file, onProgress) => {
  // Mock 上传，返回本地对象 URL
  const localUrl = URL.createObjectURL(file)
  return Promise.resolve({
    data: {
      success: true,
      fileId: 'file_' + Date.now(),
      fileName: file.name,
      fileUrl: localUrl,
      fileSize: file.size
    }
  })
}

export const deleteFile = async (fileId) => {
  return Promise.resolve({ data: { success: true } })
}

export const getFileList = async (params) => {
  return Promise.resolve({ data: [] })
}
