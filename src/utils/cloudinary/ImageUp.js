import { firebase } from '@/firebase/config'
import { actions } from 'astro:actions'

export class imgUp {
    /** 
     * @param {File} file
      */
    static isImage(file) {
        return file.type.startsWith('image/')
    }

    /** 
     * @param {File} file
     * @param {string} folder
     * @return {string}
      */
    static async update(folder, file, idToken) {
        try {
            if (!this.isImage(file)) return null

            const { data: signal, error: ErrorSignal } = await actions.Memory.getServerSecretSignature(
                {
                    type: file.type,
                    folder: folder,
                    idToken: idToken,
                }
            )

            if (ErrorSignal) {
                throw ErrorSignal
            }

            const formData = new FormData()
            formData.append('file', file)
            formData.append('api_key', signal.api_key)
            formData.append('signature', signal.signature)
            formData.append('timestamp', signal.timestamp)
            formData.append('folder', folder)

            const res = await fetch(`https://api.cloudinary.com/v1_1/${signal.cloud_name}/image/upload`, {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()
            return data.secure_url
        } catch (error) {
            console.error('Error al cargar la imagen desde ImageUp: ', error)
            throw error
        }
    }
}