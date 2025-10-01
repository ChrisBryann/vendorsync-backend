import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

class BoundingBox {
  @IsNumber()
  x1: number;
  @IsNumber()
  y1: number;
  @IsNumber()
  x2: number;
  @IsNumber()
  y2: number;
}
export class UploadOcrResponseDto {
  @IsString()
  text: string;

  @IsNumber()
  confidence: number;

  @ValidateNested()
  @Type(() => BoundingBox)
  bbox: BoundingBox;
}
