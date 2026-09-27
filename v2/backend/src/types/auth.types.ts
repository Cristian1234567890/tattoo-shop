export interface SignInDTO {
  email?: string;
  password?: string;
}

export interface SignUpDTO {
  email?: string;
  password?: string;
  nombre?: string;
  apellido?: string;
  edad?: string | number;
  tipo?: 'Cliente' | 'Tatuador' | string;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
}

export interface Verify2FADTO {
  factorId?: string;
  code?: string;
}

export interface UpdateUserDTO {
  email?: string;
  nombre?: string;
  apellido?: string;
  edad?: string | number;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
  work_type?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link?: string;
  profile?: string;
  [key: string]: any;
}

export interface UpdateUserImgDTO {
  imageData?: string;
}
