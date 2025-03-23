/**
 * @param {v2} cloudinary - Cloudinary object
 * @param {string} public_Key - Cloudinary public key
 * @param {string} secret - Cloudinary secret
 * @param {string} folder - Cloudinary folder
 * @returns {object} - Cloudinary secret signal
 */
export default function getServerSecretSignal(cloudinary, public_Key, secret, folder) {
    const timestamp = Math.round(Date.now() / 1000);

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            folder: folder,
        }
        , secret
    )

    return {
        timestamp: timestamp,
        signature: signature,
        api_key: public_Key,
        cloud_name: cloudinary.config().cloud_name,
    }
}
