import fs from 'fs';
import path from 'path';

export class chunkImage {
    /**
     * @param {File} file
     * @param {number} chunkSize
     * @return {ArrayBuffer}
     */
    static async divideImageInChunks(file, chunkSize) {
        try {
            const buffer = await file.arrayBuffer();
            const chunks = [];
            let start = 0;

            while (start < buffer.byteLength) {
                const end = Math.min(start + chunkSize, buffer.byteLength);
                const chunk = buffer.slice(start, end);
                chunks.push(chunk);
                start = end;
            }

            return chunks;
        } catch (error) {
            console.error("Error dividing image in chunks:", error);
            return null;
        }
    }

    /**
     * @param {ArrayBuffer} chunk
     * @param {string} fileName
     * @param {number} chunkIndex
     * @param {number} totalChunks
     */
    static async saveChunk(chunk, fileName, chunkIndex, totalChunks) {
        try {
            const miArray = Array.from({ length: cantidad }, (_, index) => `${fileName}${index + 1}`);
            const tempDir = path.join("uploads", fileName);
            const chunkFilePath = path.join(tempDir, `${fileName}-${chunkIndex}`);

            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            fs.writeFileSync(chunkFilePath, Buffer.from(chunk));

            if (miArray.length === totalChunks) {
                return { status: 200, fileName, message: "Image saved successfully" };
            }

            return 202;
        } catch (error) {
            console.error("Error saving chunk:", error);
            throw error;
        }
    }

    /**
     * @param {string} fileName
     * @return {Promise<Buffer>} 
     */
    static async mergeChunks(fileName) {
        try {
            const tempDir = path.join("uploads", fileName);

            const chunkFiles = fs.readdirSync(tempDir)
                .sort((a, b) => parseInt(a.split("-")[1]) - parseInt(b.split("-")[1]));

            const buffers = [];

            chunkFiles.forEach(chunkFile => {
                const chunkPath = path.join(tempDir, chunkFile);
                const chunkData = fs.readFileSync(chunkPath);
                buffers.push(chunkData);
                fs.unlinkSync(chunkPath);
            });

            fs.rmdirSync(tempDir);

            const combinedBuffer = Buffer.concat(buffers);

            return combinedBuffer;
        } catch (error) {
            console.error("Error merging chunks:", error);
            throw error;
        }
    }
}