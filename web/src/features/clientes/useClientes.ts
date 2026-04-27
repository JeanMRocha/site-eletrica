import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { IbgeCity, IbgeState } from '../../types';
import type { Project, ProjectDetail, ProjectInput } from '../../domain/projects';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../../domain/projects';
import { listIbgeCities, listIbgeStates, fetchAddressByCep } from '../../domain/geo';
import { useAsync } from '../../hooks/useAsync';
import { eventBus, notify } from '../../lib/events';

export type ClienteStep = 'dados' | 'contato' | 'endereco';
export type ClienteMode = 'list' | 'detail' | 'create' | 'edit';

export type ClienteDraft = ProjectInput;

const emptyDraft: ClienteDraft = {
  name: '',
  city: '',
  state: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  street: '',
  number: '',
  district: '',
  zip: '',
  complement: '',
};

export function useClientes() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Async States
  const listAsync = useAsync<Project[]>();
  const detailAsync = useAsync<ProjectDetail>();
  const geoAsync = useAsync<IbgeCity[]>();
  const savingAsync = useAsync<any>();
  const statesAsync = useAsync<IbgeState[]>();

  const [search, setSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [draft, setDraft] = useState<ClienteDraft>(emptyDraft);
  const [activeStep, setActiveStep] = useState<ClienteStep>('dados');
  const [isDirty, setIsDirty] = useState(false);

  const clientId = params.id ?? '';
  const mode = resolveMode(clientId, location.pathname);

  // Load initial data (Projects and States)
  useEffect(() => {
    void listAsync.execute(listProjects());
    void statesAsync.execute(listIbgeStates());
  }, [listAsync.execute, statesAsync.execute]);

  // Load detail when ID changes
  useEffect(() => {
    let cancelled = false;
    async function loadDetail() {
      if (!clientId || mode === 'list' || mode === 'create') {
        detailAsync.setData(null);
        return;
      }
      try {
        const nextDetail = await detailAsync.execute(getProject(clientId));
        if (!cancelled && nextDetail) {
          setDraft({
            name: nextDetail.study.name,
            city: nextDetail.study.city,
            state: nextDetail.study.state,
            zip: nextDetail.study.zip || '',
            contact_name: nextDetail.study.contact_name || '',
            contact_email: nextDetail.study.contact_email || '',
            contact_phone: nextDetail.study.contact_phone || '',
            street: nextDetail.study.street || '',
            number: nextDetail.study.number || '',
            district: nextDetail.study.district || '',
            complement: nextDetail.study.complement || '',
          });
        }
      } catch (err) {
        // useAsync already handles error state
      }
    }
    void loadDetail();
    return () => { cancelled = true; };
  }, [clientId, mode, detailAsync.execute]);

  // Load cities when state changes
  useEffect(() => {
    if (!draft.state) { geoAsync.setData([]); return; }
    void geoAsync.execute(listIbgeCities(draft.state));
  }, [draft.state, geoAsync.execute]);

  // CEP Lookup
  useEffect(() => {
    let cancelled = false;
    const cep = draft.zip?.replace(/\D/g, '') || '';
    async function lookupCep() {
      if (cep.length !== 8) return;
      try {
        const address = await fetchAddressByCep(cep);
        if (cancelled || !address) return;
        setDraft((current) => ({
          ...current,
          state: address.uf,
          city: address.localidade,
          street: address.logradouro,
          district: address.bairro,
          complement: address.complemento,
        }));
      } catch (err) {
        console.error('Erro ao buscar CEP:', err);
      }
    }
    const timer = setTimeout(lookupCep, 500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [draft.zip]);

  // Auto-Save Logic
  useEffect(() => {
    if (!isDirty || (mode !== 'create' && mode !== 'edit')) return;
    
    const autoSave = async () => {
      // Validate basic requirements before silent save
      if (!draft.name || draft.name.length < 3) return;
      
      try {
        const payload: ProjectInput = {
          ...draft,
          name: draft.name.trim(),
          city: draft.city.trim(),
          state: draft.state.trim().toUpperCase(),
        };

        if (mode === 'edit' && clientId) {
          const next = await updateProject(clientId, payload);
          listAsync.setData((current) => (current ? current.map((p) => (p.id === next.id ? next : p)) : [next]));
          setIsDirty(false);
          console.log('Auto-save successful');
        }
      } catch (err) {
        console.warn('Auto-save deferred:', err);
      }
    };

    const timer = setTimeout(autoSave, 1500);
    return () => clearTimeout(timer);
  }, [draft, isDirty, mode, clientId]);

  // Handle dirty state and navigation protection
  useEffect(() => {
    if (mode === 'create') {
      setDraft(emptyDraft);
      detailAsync.setData(null);
      setActiveStep('dados');
      setIsDirty(false);
    }
  }, [mode]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && (mode === 'create' || mode === 'edit')) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, mode]);

  const visibleProjects = useMemo(() => {
    const query = normalize(search);
    const projects = listAsync.data || [];
    return projects.filter((project) => {
      if (!query) return true;
      return [project.name, project.city, project.state, project.location]
        .filter(Boolean)
        .some((value) => normalize(String(value)).includes(query));
    });
  }, [listAsync.data, search]);

  function handleDraftChange(updater: (current: ClienteDraft) => ClienteDraft) {
    setDraft(updater);
    setIsDirty(true);
  }

  async function handleSubmit(e?: any) {
    if (e?.preventDefault) e.preventDefault();
    const cepDigits = draft.zip?.replace(/\D/g, '') || '';
    if (cepDigits && cepDigits.length !== 8) {
      notify({
        type: 'warning',
        title: 'CEP Inválido',
        message: 'O CEP deve conter exatamente 8 números.',
      });
      return;
    }

    try {
      const payload: ProjectInput = {
        ...draft,
        name: draft.name.trim(),
        city: draft.city.trim(),
        state: draft.state.trim().toUpperCase(),
      };
      
      let next: Project;
      if (mode === 'edit' && clientId) {
        next = await savingAsync.execute(updateProject(clientId, payload));
        listAsync.setData((current) => (current ? current.map((p) => (p.id === next.id ? next : p)) : [next]));
        const nextDetail = await detailAsync.execute(getProject(clientId));
        detailAsync.setData(nextDetail);
        notify({ type: 'success', title: 'Sucesso', message: 'Dados do cliente atualizados.' });
      } else {
        next = await savingAsync.execute(createProject(payload));
        listAsync.setData((current) => [next, ...(current || [])]);
        notify({ type: 'success', title: 'Sucesso', message: 'Cliente cadastrado com sucesso.' });
      }

      setIsDirty(false);
      window.dispatchEvent(new Event('electrica:clients-changed'));
      eventBus.emit('clients:changed');
      navigate(`/clientes/${next.id}`);
    } catch (err) {
      notify({
        type: 'error',
        title: 'Erro ao salvar',
        message: err instanceof Error ? err.message : 'Falha na comunicação com o servidor.',
      });
    }
  }

  async function handleDelete() {
    if (!clientId) return;
    try {
      await savingAsync.execute(deleteProject(clientId));
      listAsync.setData((current) => (current ? current.filter((p) => p.id !== clientId) : []));
      detailAsync.setData(null);
      window.dispatchEvent(new Event('electrica:clients-changed'));
      eventBus.emit('clients:changed');
      notify({ type: 'success', title: 'Removido', message: 'Cliente excluído permanentemente.' });
      navigate('/clientes');
    } catch (err) {
      notify({
        type: 'error',
        title: 'Erro ao excluir',
        message: 'Não foi possível remover o cliente selecionado.',
      });
    }
  }

  return {
    projects: listAsync.data || [],
    visibleProjects,
    detail: detailAsync.data,
    loading: listAsync.loading || detailAsync.loading,
    saving: savingAsync.loading,
    search,
    setSearch,
    isSearchVisible,
    setIsSearchVisible,
    draft,
    activeStep,
    setActiveStep,
    states: statesAsync.data || [],
    cities: geoAsync.data || [],
    loadingGeo: geoAsync.loading || statesAsync.loading,
    geoError: geoAsync.error || '',
    mode,
    clientId,
    isDirty,
    handleDraftChange,
    handleSubmit,
    handleDelete,
    navigate,
  };
}

function resolveMode(clientId: string, pathname: string): ClienteMode {
  if (pathname.endsWith('/novo')) return 'create';
  if (pathname.endsWith('/editar')) return 'edit';
  if (clientId) return 'detail';
  return 'list';
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
