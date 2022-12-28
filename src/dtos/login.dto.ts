import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ type: String })
  public readonly username: string;
  @ApiProperty({ type: String })
  public readonly password: string;
}
