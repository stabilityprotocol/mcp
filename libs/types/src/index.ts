import { ZodRawShape, ZodObject, z } from 'zod';

export type ReturnTypeText = {
  /**
   * @example
   * content: [{ type: 'text', text: 'Hello world' }]
   */
  content: Array<{
    type: 'text';
    text: string;
  }>;
};

export type ReturnTypeImage = {
  /**
   * @example
   * content: [{ type: 'image', url: 'https://example.com/image.png', alt: 'An example image' }]
   * content: [{ type: 'image', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...', alt: 'A base64 image' }]
   */
  content: Array<{
    type: 'image';
    /**
     * URL or base64 encoded image
     */
    url: string;
    alt?: string;
  }>;
};

export type ReturnTypeVideo = {
  /**
   * @example
   * content: [{ type: 'video', url: 'https://example.com/video.mp4', alt: 'An example video' }]
   */
  content: Array<{
    type: 'video';
    url: string;
    alt?: string;
  }>;
};

export type ReturnTypeStructuredContent = {
  structuredContent: object | object[];
} & ReturnTypeText; // Need to add this for retro-compatibility

export type IMCPTool<
  T extends ZodObject<ZodRawShape> | undefined,
  ReturnType extends
    | ReturnTypeStructuredContent
    | ReturnTypeText
    | ReturnTypeImage
    | ReturnTypeVideo,
> = {
  name: string;
  description: string;
  inputSchema: T | undefined;
  handler: (
    args: T extends ZodObject<ZodRawShape> ? z.infer<T> : undefined
  ) => Promise<ReturnType>;
  outputSchema?: ZodObject<ZodRawShape>;
};
