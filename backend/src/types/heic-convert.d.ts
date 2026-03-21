declare module 'heic-convert' {
  type HeicConvertOptions = {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  };

  export default function heicConvert(
    options: HeicConvertOptions,
  ): Promise<Buffer>;
}
