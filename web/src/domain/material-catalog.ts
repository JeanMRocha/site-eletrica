export type MaterialCategory =
  | 'cabos'
  | 'disjuntores'
  | 'dr'
  | 'dps'
  | 'tomadas'
  | 'interruptores'
  | 'luminarias'
  | 'eletrodutos'
  | 'caixas'
  | 'quadros'
  | 'acessorios';

export type MaterialItem = {
  id: string;
  category: MaterialCategory;
  name: string;
  unit: string;
  price: number;
};

export const materialCatalog: MaterialItem[] = [
  { id: 'cab-2-5', category: 'cabos', name: 'Cabo 2,5 mm²', unit: 'm', price: 3.2 },
  { id: 'cab-4', category: 'cabos', name: 'Cabo 4 mm²', unit: 'm', price: 4.8 },
  { id: 'dis-20', category: 'disjuntores', name: 'Disjuntor 20A', unit: 'un', price: 28 },
  { id: 'dr-40', category: 'dr', name: 'DR 40A', unit: 'un', price: 128 },
  { id: 'dps-275', category: 'dps', name: 'DPS classe II', unit: 'un', price: 98 },
  { id: 'tug-10', category: 'tomadas', name: 'Tomada 10A', unit: 'un', price: 14 },
  { id: 'int-simples', category: 'interruptores', name: 'Interruptor simples', unit: 'un', price: 12 },
  { id: 'lum-led', category: 'luminarias', name: 'Luminária LED', unit: 'un', price: 39 },
  { id: 'elet-20', category: 'eletrodutos', name: 'Eletroduto 20 mm', unit: 'm', price: 2.6 },
  { id: 'cx-4x2', category: 'caixas', name: 'Caixa 4x2', unit: 'un', price: 5.4 },
  { id: 'quadro-12', category: 'quadros', name: 'Quadro 12 módulos', unit: 'un', price: 138 },
  { id: 'acc-clip', category: 'acessorios', name: 'Clip de fixação', unit: 'un', price: 1.8 },
];
