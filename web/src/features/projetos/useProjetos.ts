import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Project as Client } from '../../domain/projects';
import { listProjects as listClients } from '../../domain/projects';
import {
  projectsRepo,
  type ResidentialProject,
  type ResidentialProjectInput,
  type ResidentialProjectEnvironmentInput,
} from '../../domain/residential-projects';
import { fetchAddressByCep } from '../../lib/geo';
import { notify } from '../../lib/events';

type Mode = 'list' | 'create' | 'detail' | 'edit' | 'designer';
export type ProjectStep = 1 | 2 | 3;

const defaultForm: ResidentialProjectInput = {
  clientId: '',
  clientName: '',
  name: '',
  voltage: '127/220V',
  houseType: 'padrao',
  source: ['rede'],
  zipCode: '',
  street: '',
  number: '',
  district: '',
  city: '',
  state: '',
  complement: '',
};

export function useProjetos() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const [step, setStep] = useState<ProjectStep>(1);
  const [projects, setProjects] = useState<ResidentialProject[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [project, setProject] = useState<ResidentialProject | null>(null);
  const [form, setForm] = useState<ResidentialProjectInput>(defaultForm);
  const [envForm, setEnvForm] = useState<ResidentialProjectEnvironmentInput>({ name: '', areaM2: 0, usage: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const mode = resolveMode(location.pathname);
  const projectId = params.id ?? '';

  const refreshList = async () => {
    const list = await projectsRepo.list();
    setProjects(list);
  };

  // Load Initial Data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [nextProjects, nextClients] = await Promise.all([
          projectsRepo.list(), 
          listClients()
        ]);
        setProjects(nextProjects);
        setClients(nextClients);
      } catch (err) {
        notify({ type: 'error', title: 'Erro de Carga', message: 'Falha ao sincronizar projetos e clientes.' });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location.pathname]);

  // Sync Form with Project
  useEffect(() => {
    async function sync() {
      if (projectId && (mode === 'detail' || mode === 'edit' || mode === 'designer')) {
        const next = await projectsRepo.get(projectId);
        setProject(next);
        if (next) {
          setForm({
            clientId: next.clientId,
            clientName: next.clientName,
            name: next.name,
            voltage: next.voltage,
            houseType: next.houseType,
            source: next.source,
            zipCode: next.zipCode || '',
            street: next.street || '',
            number: next.number || '',
            district: next.district || '',
            city: next.city || '',
            state: next.state || '',
            complement: next.complement || '',
          });
        }
        
        // Tab routing logic
        // Tab routing logic: Ensure detail mode doesn't squat on Step 3
        if (mode === 'designer') {
           setStep(3);
        } else if (mode === 'detail') {
           if (step === 3) setStep(1); // Default to Identification if in detail mode
        }
      } else if (mode === 'create') {
        setForm(defaultForm);
        setProject(null);
        setStep(1);
      }
    }
    sync();
  }, [mode, projectId]);

  // CEP Auto-fill
  useEffect(() => {
    const cleanCep = form.zipCode?.replace(/\D/g, '') || '';
    if (cleanCep.length === 8) {
      const loadCep = async () => {
        const data = await fetchAddressByCep(cleanCep);
        if (data) {
          setForm(prev => ({
            ...prev,
            street: data.logradouro,
            district: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
          notify({ type: 'success', title: 'Endereço Localizado', message: `${data.logradouro}, ${data.localidade} - ${data.uf}` });
        }
      };
      loadCep();
    }
  }, [form.zipCode]);

  const visibleProjects = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return projects;
    return projects.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.clientName.toLowerCase().includes(query) ||
      (p.address?.toLowerCase().includes(query)) ||
      (p.city?.toLowerCase().includes(query)) ||
      (p.zipCode?.toLowerCase().includes(query))
    );
  }, [projects, search]);

  const selectedClientName = useMemo(() => 
    clients.find((c) => c.id === form.clientId)?.name ?? form.clientName, 
    [clients, form.clientId, form.clientName]
  );

  const handleFormSubmit = async (e?: FormEvent, silent: boolean = false) => {
    if (e) e.preventDefault();
    if (saving) return; // Prevent multiple concurrent saves and notification spam
    setSaving(true);
    try {
      const payload = { ...form, clientName: selectedClientName };
      if (projectId && (mode === 'edit' || mode === 'designer')) {
        await projectsRepo.update(projectId, payload);
        if (!silent) {
          notify({ type: 'success', title: 'Projeto Atualizado', message: 'As alterações foram salvas.' });
        }
        // Stay in the same mode/step after saving
        if (mode === 'edit') {
           navigate(`/projetos/${projectId}/editar`);
        } else if (mode === 'designer') {
           navigate(`/projetos/${projectId}/projetador`);
        } else {
           navigate(`/projetos/${projectId}`);
        }
      } else {
        const created = await projectsRepo.create(payload);
        if (!silent) {
          notify({ type: 'success', title: 'Projeto Criado', message: 'Novo projeto residencial registrado.' });
        }
        navigate(`/projetos/${created.id}/projetador`); // Go straight to designer on create
      }
      await refreshList();
    } catch (err) {
      if (!silent) {
        notify({ type: 'error', title: 'Erro ao Salvar', message: 'Verifique os dados e tente novamente.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      await projectsRepo.delete(projectId);
      notify({ type: 'warning', title: 'Projeto Excluído', message: 'O registro foi removido do sistema.' });
      navigate('/projetos');
    } catch (err) {
      notify({ type: 'error', title: 'Erro ao Excluir', message: 'Não foi possível remover o projeto.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEnvironment = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!projectId || !envForm.name.trim()) return;
    try {
      const next = await projectsRepo.addEnvironment(projectId, {
        ...envForm,
        areaM2: Number(envForm.areaM2) || 0,
        usage: envForm.usage || '',
      });
      setProject(next);
      await refreshList();
      setEnvForm({ name: '', areaM2: 0, usage: '' });
      notify({ type: 'info', title: 'Ambiente Adicionado', message: `${envForm.name} incluído no projeto.` });
    } catch (err) {
      notify({ type: 'error', title: 'Erro no Ambiente', message: 'Falha ao registrar novo cômodo.' });
    }
  };

  const handleTabChange = async (nextStep: ProjectStep) => {
    // Auto-save current form state SILENTLY
    if (projectId && (mode === 'edit' || mode === 'designer')) {
       await handleFormSubmit(undefined, true);
    }

    if (!projectId) {
      setStep(nextStep);
      return;
    }

    if (nextStep === 3) {
      navigate(`/projetos/${projectId}/projetador`);
    } else if (nextStep === 1 || nextStep === 2) {
      navigate(`/projetos/${projectId}/editar`);
      setStep(nextStep);
    } else {
       setStep(nextStep);
    }
  };

  return {
    mode,
    projects,
    visibleProjects,
    clients,
    project,
    form,
    setForm,
    envForm,
    setEnvForm,
    loading,
    saving,
    search,
    setSearch,
    isSearchVisible,
    setIsSearchVisible,
    handleFormSubmit,
    handleDelete,
    handleAddEnvironment,
    navigate,
    step,
    setStep,
    handleTabChange,
  };
}

function resolveMode(pathname: string): Mode {
  if (pathname.endsWith('/projetador')) return 'designer';
  if (pathname.endsWith('/novo')) return 'create';
  if (/\/projetos\/[^/]+\/editar$/.test(pathname)) return 'edit';
  if (/\/projetos\/[^/]+$/.test(pathname)) return 'detail';
  return 'list';
}
