export async function bufferToBase64(bufferData: number[] | null | undefined) {

  console.log("LENGTH:", bufferData?.length);
  console.log("FIRST 10:", bufferData?.slice(0, 10));
  console.log("TYPE:", typeof bufferData);

  console.log("Buffer data received for conversion:", bufferData);
  if (!bufferData) return null;

  const bytes = new Uint8Array(bufferData);

  const blob = new Blob([bytes], { type: "image/jpeg" });

  return await blobToBase64(blob);
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
