/**
 * Client-side image compression and resizing utility.
 * Keeps payloads lightweight (< 150KB per image) to prevent Vercel 413 Payload Too Large errors.
 */
export function compressImage(
    source: File | string,
    maxDimension: number = 1200,
    quality: number = 0.82
): Promise<string> {
    return new Promise((resolve) => {
        const processImg = (dataUrl: string) => {
            if (!dataUrl || !dataUrl.startsWith("data:image")) {
                resolve(dataUrl);
                return;
            }

            const img = new window.Image();
            img.onload = () => {
                let { width, height } = img;

                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = Math.round((height * maxDimension) / width);
                        width = maxDimension;
                    } else {
                        width = Math.round((width * maxDimension) / height);
                        height = maxDimension;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(dataUrl);
                    return;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", quality));
            };
            img.onerror = () => resolve(dataUrl);
            img.src = dataUrl;
        };

        if (typeof source === "string") {
            processImg(source);
        } else {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    processImg(reader.result as string);
                } else {
                    resolve("");
                }
            };
            reader.onerror = () => resolve("");
            reader.readAsDataURL(source);
        }
    });
}
