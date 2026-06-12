// Supabase capa cada select en 1000 filas: para tablas que pueden
// superarlas (players: 1243, match_events a mitad de torneo) hay que
// paginar con .range(). El factory debe incluir un .order() total
// (con desempate por id) para que las páginas sean estables.
interface PageResult<T> {
  data: T[] | null
  error: { message: string } | null
}

const PAGE_SIZE = 1000

export async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<PageResult<T>>
): Promise<T[]> {
  const all: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await page(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    all.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) break
  }
  return all
}
