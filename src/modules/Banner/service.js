const { default: mongoose } = require("mongoose");
const Banner = require("./model");
const cloudinary = require("cloudinary").v2;
const createBannerService = async (newImages, deletedImageIds) => {
    try {
      const uploadedImages = [];
      
      // Upload new images to Cloudinary and save URLs to the database
      if (newImages && newImages.length > 0) {
        for (const image of newImages) {
          const result = await cloudinary.uploader.upload(image.path, {
            folder: 'banner_images',
          });
          uploadedImages.push(result.secure_url);
        }
      }
  
      // Save new image URLs to the banner collection
      if (uploadedImages.length > 0) {
        for (const image of uploadedImages) {
          await Banner.create({ image });
        }
      }
  
      // Ensure deletedImageIds is an array and delete the specified images
      if (deletedImageIds && deletedImageIds.length > 0) {
        const objectIdArray = JSON.parse(deletedImageIds).map(id => new mongoose.Types.ObjectId(id));
        await Banner.deleteMany({ _id: { $in: objectIdArray } });
      }
  
      // Fetch updated banner images
      const updatedBannerImages = await Banner.find();
      return updatedBannerImages;
    } catch (err) {
      console.error('Error in createBannerService:', err);
      throw new Error('Internal server error');
    }
  };
  
module.exports = {
  createBannerService,
};
