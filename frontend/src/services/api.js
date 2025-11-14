const API_BASE_URL = 'http://localhost:5000';

export const uploadMediaFiles = async (files, onProgress) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch(`${API_BASE_URL}/upload/media`, {
    method: 'POST',
    body: formData,
    // Track upload progress if needed
  });
  
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};

export const uploadJSONFiles = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch(`${API_BASE_URL}/upload/json`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
};

export const getUploadedFiles = async () => {
  const response = await fetch(`${API_BASE_URL}/files`);
  return response.json();
};

export const getAnalytics = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics`);
  return response.json();
};

export const getUploadHistory = async () => {
  const response = await fetch(`${API_BASE_URL}/logs`);
  return response.json();
};
