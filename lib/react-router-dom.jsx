'use client'

import { Children, createContext, useContext, useEffect } from 'react'
import NextLink from 'next/link'
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation'

const ParamsContext = createContext({})

function matchPath(pattern, pathname) {
  if (pattern === '*') return { params: {} }
  if (pattern === pathname) return { params: {} }
  const parts = String(pattern).split('/').filter(Boolean)
  const segs = String(pathname).split('/').filter(Boolean)
  if (parts.length !== segs.length) return null
  const params = {}
  for (let i = 0; i < parts.length; i += 1) {
    if (parts[i].startsWith(':')) params[parts[i].slice(1)] = decodeURIComponent(segs[i])
    else if (parts[i] !== segs[i]) return null
  }
  return { params }
}

export function BrowserRouter({ children }) {
  return children
}

export function Routes({ children }) {
  const pathname = usePathname() || '/'
  const routes = Children.toArray(children)
  let params = {}
  let element = null
  for (const child of routes) {
    const matched = matchPath(child.props.path, pathname)
    if (matched) {
      params = matched.params
      element = child.props.element
      break
    }
  }
  return <ParamsContext.Provider value={params}>{element}</ParamsContext.Provider>
}

export function Route() {
  return null
}

export function Navigate({ to, replace = false }) {
  const router = useRouter()
  useEffect(() => {
    if (replace) router.replace(to)
    else router.push(to)
  }, [to, replace, router])
  return null
}

export function Link({ to, children, className, ...props }) {
  return (
    <NextLink href={to} className={className} {...props}>
      {children}
    </NextLink>
  )
}

export function NavLink({ to, end, className, children, onClick }) {
  const pathname = usePathname() || '/'
  const active = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
  const cls = typeof className === 'function' ? className({ isActive: active }) : className
  const content = typeof children === 'function' ? children({ isActive: active }) : children
  return (
    <NextLink href={to} className={cls} onClick={onClick}>
      {content}
    </NextLink>
  )
}

export function useNavigate() {
  const router = useRouter()
  return (to, opts) => {
    if (typeof to === 'number') {
      router.back()
      return
    }
    if (opts?.replace) router.replace(to)
    else router.push(to)
  }
}

export function useLocation() {
  const pathname = usePathname() || '/'
  return { pathname, search: '', hash: '' }
}

export function useParams() {
  return useContext(ParamsContext)
}

export function useSearchParams() {
  const params = useNextSearchParams()
  return [params]
}
