// Image upload utility using ImgBB (free open-source image hosting)
const IMGBB_API_KEY = '34c1e5a3dffd63df41407628f3131afd'; // User-provided API key

export const uploadImageToImgBB = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    
    if (data.success) {
      return {
        url: data.data.url,
        displayUrl: data.data.display_url,
        deleteUrl: data.data.delete_url,
        size: data.data.size,
        filename: data.data.title
      };
    } else {
      throw new Error('Image upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Alternative fallback using a simple base64 data URL (for demo purposes)
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Validate image file
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Please upload a valid image file (JPEG, PNG, or GIF)');
  }

  if (file.size > maxSize) {
    throw new Error('Image size should be less than 5MB');
  }

  return true;
};

// Upload image with fallback options
export const uploadImage = async (imageFile) => {
  try {
    // Validate the image first
    validateImageFile(imageFile);

    // Try ImgBB first
    try {
      return await uploadImageToImgBB(imageFile);
    } catch (imgbbError) {
      console.warn('ImgBB upload failed, using base64 fallback:', imgbbError);
      
      // Fallback to base64 data URL
      const base64Url = await convertToBase64(imageFile);
      return {
        url: base64Url,
        displayUrl: base64Url,
        size: imageFile.size,
        filename: imageFile.name,
        isBase64: true
      };
    }
  } catch (error) {
    console.error('Image upload error:', error);
    throw error;
  }
};

