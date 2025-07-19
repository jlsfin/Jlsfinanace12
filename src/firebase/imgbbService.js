const IMGBB_API_KEY = '34c1e5a3dffd63df41407628f3131afd';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export const imgbbService = {
  async uploadImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('key', IMGBB_API_KEY);

      const response = await fetch(IMGBB_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Image upload failed');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Error uploading image to ImgBB:', error);
      throw error;
    }
  },
};

