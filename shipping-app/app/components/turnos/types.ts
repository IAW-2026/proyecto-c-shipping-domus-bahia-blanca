export type PropiedadMultimediaTurno = {
  id: string
  url: string
  alt?: string | null
  order?: number | null
}

export type PropiedadTurno = {
  id: string
  nombrePropiedad: string | null
  descripcion: string | null
  direccion: string | null
  barrio: string | null
  ciudad: string | null
  provincia: string | null
  pais: string | null
  codigoPostal: string | null
  latitud: number | null
  longitud: number | null
  precio: string | number | null
  expensas: string | number | null
  moneda: string
  ambientes: number | null
  dormitorios: number | null
  banios: number | null
  metrosTotales: number | null
  metrosCubiertos: number | null
  antiguedad: string | null
  condicion: string | null
  vendedorId: string
  nombreInmobiliaria: string | null
  multimedia: PropiedadMultimediaTurno[]
}

export type CompradorTurno = {
  id: string
  nombre: string
  email: string
}
