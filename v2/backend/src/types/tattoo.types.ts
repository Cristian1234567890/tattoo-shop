export interface TatuadorData {
  email?: string;
  nombre?: string;
  apellido?: string;
  edad?: string | number;
  work_type?: string;
  telefono?: string;
  provincia?: string;
  ciudad?: string;
  direccion?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  link?: string;
  profile?: string;
  [key: string]: any;
}

export interface TatuadorRecord {
  id: string;
  data: TatuadorData;
  created_at?: string;
  updated_at?: string;
}
