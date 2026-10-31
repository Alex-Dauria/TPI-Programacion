import { useState } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, SortingState } from '@tanstack/react-table'

import { Paginacion } from './Paginacion'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  /** true: paginación y búsqueda del lado del cliente (el panel pide limit=100). */
  paginacionCliente?: boolean
  tamanoPagina?: number
}

/** Tabla del panel de administración construida con TanStack Table. */
export function DataTable<T>({ data, columns, paginacionCliente = true, tamanoPagina = 10 }: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginacionCliente ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    initialState: { pagination: { pageIndex: 0, pageSize: tamanoPagina } },
  })

  const filas = table.getRowModel().rows

  return (
    <div className="space-y-3">
      {paginacionCliente && (
        <input
          type="search"
          value={globalFilter}
          onChange={(evento) => {
            setGlobalFilter(evento.target.value)
            table.setPageIndex(0)
          }}
          placeholder="Buscar en la tabla…"
          aria-label="Buscar en la tabla"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm sm:max-w-xs"
        />
      )}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            {table.getHeaderGroups().map((grupo) => (
              <tr key={grupo.id}>
                {grupo.headers.map((header) => {
                  const orden = header.column.getIsSorted()
                  return (
                    <th key={header.id} className="px-4 py-3 font-semibold">
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-slate-900"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span aria-hidden="true">{orden === 'asc' ? '▲' : orden === 'desc' ? '▼' : '↕'}</span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  No hay registros para mostrar.
                </td>
              </tr>
            ) : (
              filas.map((fila) => (
                <tr key={fila.id} className="border-t border-slate-100 hover:bg-slate-50">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {paginacionCliente && (
        <Paginacion
          pagina={table.getState().pagination.pageIndex}
          totalPaginas={table.getPageCount()}
          onCambiar={(pagina) => table.setPageIndex(pagina)}
        />
      )}
    </div>
  )
}
