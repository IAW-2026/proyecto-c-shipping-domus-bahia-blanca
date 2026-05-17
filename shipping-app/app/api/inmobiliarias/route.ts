import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getInmobiliarias } from '@/lib/agente/inmobiliarias'

//Utilizo una api interna con el fin de que sea mas seguro ya que manejo API_KEYS foraneas
//y no quiero que el front se comunique con el otro servidor.
export async function GET() {
  //Protejo para que solo usuario autenticados puedan hacer el get,
  //Igualmente no es una seguridad muy grande ya que este get se encarga de mostrar por pantalla 
  //a los usuario autenticados las inmobiliarias a la hora de llenar el segundo formulario.
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    )
  }
  try {
    const inmobiliarias = await getInmobiliarias()

    return NextResponse.json(inmobiliarias)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to fetch inmobiliarias' },
      { status: 500 }
    )
  }
}
