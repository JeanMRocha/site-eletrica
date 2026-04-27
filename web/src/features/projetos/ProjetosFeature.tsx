import { useProjetos } from './useProjetos';
import { ProjectList } from './components/ProjectList';
import { ProjectManager } from './components/ProjectManager';
import { SkeletonRow } from '../shared/Skeleton';
import './projetos.css';

/**
 * ProjetosFeature - Entry point for project management.
 * Refactored using Professional Refactoring skill:
 * - Module Decomposition: Moved sub-components to /components
 * - Responsibility Segregation: Main component only handles routing/top-level state.
 */
export function ProjetosFeature() {
  const {
    mode,
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
    handleTabChange,
  } = useProjetos();

  if (loading) return <LoadingView />;

  if (mode === 'list') {
    return (
      <ProjectList 
        projects={visibleProjects} 
        navigate={navigate} 
        search={search} 
        setSearch={setSearch} 
        isSearchVisible={isSearchVisible}
        setIsSearchVisible={setIsSearchVisible}
      />
    );
  }

  return (
    <ProjectManager
      mode={mode}
      project={project}
      form={form}
      setForm={setForm}
      clients={clients}
      envForm={envForm}
      setEnvForm={setEnvForm}
      onAddEnv={handleAddEnvironment}
      onDelete={handleDelete}
      onSubmit={handleFormSubmit}
      saving={saving}
      step={step}
      setStep={handleTabChange}
      navigate={navigate}
    />
  );
}

function LoadingView() {
  return (
    <section className="projects-page page-transition">
      <article className="panel projects-panel glass-panel">
        <div className="panel-head">
           <SkeletonRow count={1} />
        </div>
        <SkeletonRow count={5} />
      </article>
    </section>
  );
}
