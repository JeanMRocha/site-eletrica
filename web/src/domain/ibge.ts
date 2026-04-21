export type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

export type IbgeCity = {
  id: number;
  nome: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`IBGE request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function listIbgeStates() {
  const states = await fetchJson<IbgeState[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
  return states;
}

export async function listIbgeCities(state: string) {
  const uf = state.trim();
  if (!uf) {
    return [];
  }

  const cities = await fetchJson<IbgeCity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios`);
  return cities;
}
