import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email debe ser un email válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password debe tener mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password debe contener mayúscula, minúscula y número',
  })
  password: string;

  @IsString({ message: 'Nombre debe ser un texto' })
  @MinLength(2, { message: 'Nombre debe tener mínimo 2 caracteres' })
  firstName: string;

  @IsString({ message: 'Apellido debe ser un texto' })
  @MinLength(2, { message: 'Apellido debe tener mínimo 2 caracteres' })
  lastName: string;

  // Si querés que sea obligatorio, dejalo así (sin IsOptional)
  // Si querés que sea opcional al principio, agregá @IsOptional()
  @IsString({ message: 'Teléfono debe ser un texto' })
  @MinLength(6, { message: 'Teléfono muy corto' })
  phone: string;
}
