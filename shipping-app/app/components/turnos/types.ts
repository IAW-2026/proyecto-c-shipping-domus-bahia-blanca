export type PropiedadTurno = {
  id: string
  nombrePropiedad: string | null
  direccion: string | null
  latitud: number | null
  longitud: number | null
  vendedorId: string
  nombreInmobiliaria: string | null
  imageUrl: string | null
  imageAlt: string | null
}

export type CompradorTurno = {
  id: string
  nombre: string
  email: string
}
