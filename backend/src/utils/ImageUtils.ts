interface BufferData {
  type: 'Buffer';
  data: number[];
}

type BinaryData = Buffer | BufferData;

export function bufferToBase64(binaryData: BinaryData, mimeType: string = "image/jpeg"): string {

  if (!binaryData) return '';

  let buffer: Buffer;

  if (binaryData instanceof Buffer) {
    buffer = binaryData;
  } else if ('data' in binaryData && Array.isArray(binaryData.data)) {
    if (binaryData.data.length === 0) return '';
    buffer = Buffer.from(binaryData.data);
  } else {
    return '';
  }

  if (buffer.length === 0) return '';

  const base64String = buffer.toString('base64');

  return `data:${mimeType};base64,${base64String}`;
}