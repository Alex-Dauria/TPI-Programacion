import { Link, NavLink, useNavigate } from 'react-router-dom'

import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const LINK = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${isActive ? 'bg-green-100 text-green-800' : 'text-slate-600 hover:bg-slate-100'}`

const LINKS_ADMIN = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidadEnCarrito = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0))
  const navigate = useNavigate()

  const cerrarSesion = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <Link to="/" className="mr-4 text-xl font-bold">
          🍔 <span className="text-green-700">Food</span> <span className="text-orange-500">Store</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={LINK}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={LINK}>
            Carrito{cantidadEnCarrito > 0 && ` (${cantidadEnCarrito})`}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={LINK}>
              Mis pedidos
            </NavLink>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {usuario ? (
            <>
              <span className="text-sm text-slate-600">
                {usuario.full_name}{' '}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold uppercase text-slate-500">
                  {usuario.role}
                </span>
              </span>
              <Button variante="secondary" chico onClick={() => void cerrarSesion()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={LINK}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={LINK}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </div>

      {usuario?.role === 'admin' && (
        <div className="border-t border-slate-100 bg-slate-50">
          <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2" aria-label="Panel de administración">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Panel admin</span>
            {LINKS_ADMIN.map((link) => (
              <NavLink key={link.to} to={link.to} className={LINK}>
                {link.texto}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
