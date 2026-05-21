// Router minimalista hash-based. Duas rotas:
//   #/                       → galeria
//   #/editor/:layoutId       → editor daquele layout

export type Route =
  | { name: "gallery" }
  | { name: "editor"; layoutId: string }
  | { name: "not-found"; path: string }

type Listener = (route: Route) => void

export function parseHash(hash: string): Route {
  const trimmed = hash.replace(/^#/, "").replace(/^\//, "")
  if (trimmed === "" || trimmed === "gallery") return { name: "gallery" }
  const editorMatch = trimmed.match(/^editor\/(.+)$/)
  if (editorMatch) return { name: "editor", layoutId: editorMatch[1] }
  return { name: "not-found", path: trimmed }
}

export class Router {
  private listeners: Listener[] = []
  private current: Route = parseHash(location.hash)

  constructor() {
    window.addEventListener("hashchange", () => {
      this.current = parseHash(location.hash)
      for (const fn of this.listeners) fn(this.current)
    })
  }

  get(): Route {
    return this.current
  }

  go(route: Route): void {
    if (route.name === "gallery") location.hash = "/"
    else if (route.name === "editor") location.hash = `/editor/${route.layoutId}`
  }

  subscribe(fn: Listener): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn)
    }
  }
}

export const router = new Router()
