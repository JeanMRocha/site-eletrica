import type { IbgeCity, IbgeState, ViaCepResponse } from '../types';

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Location request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

/**
 * Lista estados brasileiros usando a API do IBGE.
 */
export async function listIbgeStates() {
  return fetchJson<IbgeState[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
}

/**
 * Lista municípios de um estado usando a API do IBGE.
 */
export async function listIbgeCities(state: string) {
  const uf = state.trim();
  if (!uf) return [];
  return fetchJson<IbgeCity[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios`);
}

/**
 * Busca dados de endereço por CEP usando a API ViaCEP.
 * Retorna logradouro, bairro, cidade e estado.
 */
export async function fetchAddressByCep(cep: string): Promise<ViaCepResponse | null> {
  const sanitized = cep.replace(/\D/g, '');
  if (sanitized.length !== 8) return null;

  try {
    const data = await fetchJson<ViaCepResponse>(`https://viacep.com.br/ws/${sanitized}/json/`);
    if (data.erro) return null;
    return data;
  } catch (err) {
    console.error('Falha ao buscar CEP:', err);
    return null;
  }
}
