import { EstadoError } from '../../../shared/components/EstadoError'
import { Skeleton } from '../../../shared/components/Skeleton'
import { formatPrecio } from '../../../shared/utils/formato'
import { ResumenCard } from '../components/ResumenCard'
import { useResumenPedidos } from '../hooks/usePedidos'

export default function AdminResumenPage() {
  const resumen = useResumenPedidos()

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Resumen del negocio</h1>
      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError error={resumen.error} onReintentar={() => void resumen.refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pendientes" valor={resumen.data.pendientes} icono="⏳" color="bg-amber-100" />
          <ResumenCard titulo="En preparación" valor={resumen.data.en_preparacion} icono="👨‍🍳" color="bg-blue-100" />
          <ResumenCard titulo="Entregados" valor={resumen.data.entregados} icono="✅" color="bg-green-100" />
          <ResumenCard titulo="Cancelados" valor={resumen.data.cancelados} icono="❌" color="bg-red-100" />
          <ResumenCard titulo="Pedidos de hoy" valor={resumen.data.pedidos_hoy} icono="📅" color="bg-violet-100" />
          <ResumenCard
            titulo="Ingresos (entregados)"
            valor={formatPrecio(resumen.data.ingresos_entregados)}
            icono="💰"
            color="bg-emerald-100"
          />
        </div>
      )}
    </section>
  )
}
