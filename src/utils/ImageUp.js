import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, getSecret } from 'astro:env/server';

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: getSecret('CLOUDINARY_API_SECRET'),
})

export class imgUp {
    /** 
     * @param {File} file
      */
    static isImage(file) {
        return file.type.startsWith('image/')
    }

    /** 
     * @param {File} file
     * @param {string} url
     * @return {string}
      */
    static async update(url, file) {
        if (!this.isImage(file)) return null

        const buffer = await file.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const imgType = file.type.split('/')[1]

        const resp = await cloudinary.uploader.upload(`data:image/${imgType};base64,${base64Image}`, {
            folder: url, /// TOdo: Fix this
        })

        return resp.secure_url
    }
}