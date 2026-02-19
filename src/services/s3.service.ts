import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    const {
      AWS_REGION,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      S3_BUCKET_NAME,
    } = process.env;

    if (
      !AWS_REGION ||
      !AWS_ACCESS_KEY_ID ||
      !AWS_SECRET_ACCESS_KEY ||
      !S3_BUCKET_NAME
    ) {
      throw new Error('Missing required AWS environment variables');
    }

    this.s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    this.bucketName = S3_BUCKET_NAME;
  }

  async uploadFile(file: Express.Multer.File, userId: number): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `cv/${userId}-cv-${Date.now()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      Metadata: {
        userId: userId.toString(),
        originalName: file.originalname,
      },
    });

    await this.s3Client.send(command);

    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  }
}
