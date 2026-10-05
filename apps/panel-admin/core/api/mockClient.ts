/**
 * Reemplazo del `createServerApiClient()` de admin-panel-v2.
 *
 * En el panel real cada repositorio hace:
 *
 *   const client = await createServerApiClient();
 *   const res = await client.get<ProjectListResponseDto>('/admin/projects');
 *   return ProjectMapper.fromListResponseDto(res.data);
 *
 * Acá no hay back: el repositorio le pasa los datos mockeados a `mockResponse`,
 * que simula la latencia de red. Cuando haya API, se cambia SOLO el cuerpo del
 * repositorio; páginas y componentes no se enteran.
 */
const MOCK_LATENCY_MS = 150;

export async function mockResponse<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  // structuredClone: que nadie mute el mock compartido por accidente.
  return structuredClone(data);
}
