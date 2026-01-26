import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @MaxLength(255)
  filename!: string;

  @IsString()
  @MaxLength(120)
  mimeType!: string;

  @IsInt()
  @Min(1)
  size!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
