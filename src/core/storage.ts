// Wrapper fino sobre localStorage com try/catch em tudo (algumas plataformas
// negam ou estouram quota). Falha silenciosa em escrita — o editor continua
// funcionando, só não persiste.

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sem espaço (provável imagem grande em base64) — drop silencioso
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
