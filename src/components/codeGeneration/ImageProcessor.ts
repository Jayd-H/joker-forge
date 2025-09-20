import JSZip from "jszip";
import {
  JokerData,
  BoosterData,
  EnhancementData,
  ConsumableData,
  SealData,
} from "../data/BalatroUtils";

export const processImages = async (
  items: (
    | JokerData
    | ConsumableData
    | BoosterData
    | EnhancementData
    | SealData
  )[],
  scale: number = 1
): Promise<{
  atlasDataUrl: string;
  soulPositions: Record<number, { x: number; y: number }>;
}> => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    ctx.imageSmoothingEnabled = false;

    const itemsPerRow = 10;

    const totalPositions = items.reduce((total, item) => {
      return (
        total +
        ("overlayImagePreview" in item && item.overlayImagePreview ? 2 : 1)
      );
    }, 0);

    const rows = Math.ceil(totalPositions / itemsPerRow);

    canvas.width = itemsPerRow * 71 * scale;
    canvas.height = rows * 95 * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const soulPositions: Record<number, { x: number; y: number }> = {};
    let currentPosition = 0;

    const imagePromises = items.map((item, index) => {
      const promises: Promise<void>[] = [];

      promises.push(
        new Promise<void>((resolve) => {
          const imageSrc =
            item.imagePreview ||
            "/images/placeholderjokers/placeholder-joker-1.png";
          const img = new Image();
          img.onload = () => {
            const col = currentPosition % itemsPerRow;
            const row = Math.floor(currentPosition / itemsPerRow);
            const x = col * 71 * scale;
            const y = row * 95 * scale;

            ctx.drawImage(
              img,
              0,
              0,
              img.width,
              img.height,
              x,
              y,
              71 * scale,
              95 * scale
            );

            currentPosition++;
            resolve();
          };

          img.onerror = () => {
            if (
              imageSrc !== "/images/placeholderjokers/placeholder-joker-1.png"
            ) {
              img.src = "/images/placeholderjokers/placeholder-joker-1.png";
            } else {
              currentPosition++;
              resolve();
            }
          };

          img.src = imageSrc;
        })
      );

      if ("overlayImagePreview" in item && item.overlayImagePreview) {
        promises.push(
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const col = currentPosition % itemsPerRow;
              const row = Math.floor(currentPosition / itemsPerRow);
              const x = col * 71 * scale;
              const y = row * 95 * scale;

              soulPositions[index] = { x: col, y: row };

              ctx.drawImage(
                img,
                0,
                0,
                img.width,
                img.height,
                x,
                y,
                71 * scale,
                95 * scale
              );

              currentPosition++;
              resolve();
            };

            img.onerror = () => {
              currentPosition++;
              resolve();
            };

            img.src =
              ("overlayImagePreview" in item
                ? item.overlayImagePreview
                : null) || "/images/placeholderjokers/placeholder-joker-1.png";
          })
        );
      }

      return Promise.all(promises);
    });

    await Promise.all(imagePromises);

    return {
      atlasDataUrl: canvas.toDataURL("image/png"),
      soulPositions,
    };
  } catch (error) {
    console.error("Error processing images:", error);
    throw error;
  }
};

// THIS FUNCTION IS FUCKING STUPID AND SHOULD NOT EXIST BUT IT DOES BECUASE BROWSER SUPPORT IS FUCKING STUPID
export const processModIcon = async (
  iconDataUrl: string,
  scale: number = 1
): Promise<string> => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    canvas.width = 34 * scale;
    canvas.height = 34 * scale;

    canvas.style.imageRendering = "pixelated";
    canvas.style.imageRendering = "-moz-crisp-edges";
    canvas.style.imageRendering = "crisp-edges";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (scale === 1) {
          // No scaling needed, direct draw
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, 34, 34);
        } else {
          // Create a temporary 1x canvas first
          const tempCanvas = document.createElement("canvas");
          const tempCtx = tempCanvas.getContext("2d");

          if (!tempCtx) {
            reject(new Error("Failed to get temp canvas context"));
            return;
          }

          tempCanvas.width = 34;
          tempCanvas.height = 34;
          tempCtx.imageSmoothingEnabled = false;

          // Draw to 1x first
          tempCtx.drawImage(img, 0, 0, 34, 34);

          // Now scale up using putImageData for pixel-perfect scaling
          const imageData = tempCtx.getImageData(0, 0, 34, 34);
          const scaledImageData = ctx.createImageData(34 * scale, 34 * scale);

          for (let y = 0; y < 34; y++) {
            for (let x = 0; x < 34; x++) {
              const sourceIndex = (y * 34 + x) * 4;
              const r = imageData.data[sourceIndex];
              const g = imageData.data[sourceIndex + 1];
              const b = imageData.data[sourceIndex + 2];
              const a = imageData.data[sourceIndex + 3];

              // Scale this pixel up
              for (let sy = 0; sy < scale; sy++) {
                for (let sx = 0; sx < scale; sx++) {
                  const targetIndex =
                    ((y * scale + sy) * (34 * scale) + (x * scale + sx)) * 4;
                  scaledImageData.data[targetIndex] = r;
                  scaledImageData.data[targetIndex + 1] = g;
                  scaledImageData.data[targetIndex + 2] = b;
                  scaledImageData.data[targetIndex + 3] = a;
                }
              }
            }
          }

          ctx.putImageData(scaledImageData, 0, 0);
        }

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => reject(new Error("Failed to load mod icon"));
      img.src = iconDataUrl;
    });
  } catch (error) {
    console.error("Error processing mod icon:", error);
    throw error;
  }
};

export const dataURLToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
};

export const addAtlasToZip = async (
  zip: JSZip,
  jokers: JokerData[],
  consumables: ConsumableData[],
  boosters: BoosterData[] = [],
  enhancements: EnhancementData[] = [],
  seals: SealData[] = [],
  modIconData?: string
): Promise<Record<string, Record<number, { x: number; y: number }>>> => {
  try {
    const assetsFolder = zip.folder("assets");
    const assets1xFolder = assetsFolder!.folder("1x");
    const assets2xFolder = assetsFolder!.folder("2x");

    const soulPositions: Record<
      string,
      Record<number, { x: number; y: number }>
    > = {};

    if (modIconData) {
      const modIcon1xResult = await processModIcon(modIconData, 1);
      const modIcon1xBlob = dataURLToBlob(modIcon1xResult);
      assets1xFolder!.file("ModIcon.png", modIcon1xBlob);

      const modIcon2xResult = await processModIcon(modIconData, 2);
      const modIcon2xBlob = dataURLToBlob(modIcon2xResult);
      assets2xFolder!.file("ModIcon.png", modIcon2xBlob);
    }

    if (jokers.length > 0) {
      const jokerAtlas1xResult = await processImages(jokers, 1);
      const jokerAtlas1xBlob = dataURLToBlob(jokerAtlas1xResult.atlasDataUrl);
      assets1xFolder!.file("CustomJokers.png", jokerAtlas1xBlob);

      const jokerAtlas2xResult = await processImages(jokers, 2);
      const jokerAtlas2xBlob = dataURLToBlob(jokerAtlas2xResult.atlasDataUrl);
      assets2xFolder!.file("CustomJokers.png", jokerAtlas2xBlob);

      soulPositions["jokers"] = jokerAtlas1xResult.soulPositions;
    }

    if (consumables.length > 0) {
      const consumableAtlas1xResult = await processImages(consumables, 1);
      const consumableAtlas1xBlob = dataURLToBlob(
        consumableAtlas1xResult.atlasDataUrl
      );
      assets1xFolder!.file("CustomConsumables.png", consumableAtlas1xBlob);

      const consumableAtlas2xResult = await processImages(consumables, 2);
      const consumableAtlas2xBlob = dataURLToBlob(
        consumableAtlas2xResult.atlasDataUrl
      );
      assets2xFolder!.file("CustomConsumables.png", consumableAtlas2xBlob);

      soulPositions["consumables"] = consumableAtlas1xResult.soulPositions;
    }

    if (boosters.length > 0) {
      const boosterAtlas1xResult = await processImages(boosters, 1);
      const boosterAtlas1xBlob = dataURLToBlob(
        boosterAtlas1xResult.atlasDataUrl
      );
      assets1xFolder!.file("CustomBoosters.png", boosterAtlas1xBlob);

      const boosterAtlas2xResult = await processImages(boosters, 2);
      const boosterAtlas2xBlob = dataURLToBlob(
        boosterAtlas2xResult.atlasDataUrl
      );
      assets2xFolder!.file("CustomBoosters.png", boosterAtlas2xBlob);

      soulPositions["boosters"] = boosterAtlas1xResult.soulPositions;
    }

    if (enhancements.length > 0) {
      const enhancementAtlas1xResult = await processImages(enhancements, 1);
      const enhancementAtlas1xBlob = dataURLToBlob(
        enhancementAtlas1xResult.atlasDataUrl
      );
      assets1xFolder!.file("CustomEnhancements.png", enhancementAtlas1xBlob);

      const enhancementAtlas2xResult = await processImages(enhancements, 2);
      const enhancementAtlas2xBlob = dataURLToBlob(
        enhancementAtlas2xResult.atlasDataUrl
      );
      assets2xFolder!.file("CustomEnhancements.png", enhancementAtlas2xBlob);

      soulPositions["enhancements"] = enhancementAtlas1xResult.soulPositions;
    }

    if (seals.length > 0) {
      const sealAtlas1xResult = await processImages(seals, 1);
      const sealAtlas1xBlob = dataURLToBlob(sealAtlas1xResult.atlasDataUrl);
      assets1xFolder!.file("CustomSeals.png", sealAtlas1xBlob);

      const sealAtlas2xResult = await processImages(seals, 2);
      const sealAtlas2xBlob = dataURLToBlob(sealAtlas2xResult.atlasDataUrl);
      assets2xFolder!.file("CustomSeals.png", sealAtlas2xBlob);

      soulPositions["seals"] = sealAtlas1xResult.soulPositions;
    }

    return soulPositions;
  } catch (error) {
    console.error("Error adding atlas to zip:", error);
    throw error;
  }
};
