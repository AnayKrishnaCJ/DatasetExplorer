import { useState, useEffect } from 'react';
import { Plus, Upload, Search, Database, Layers, Sparkles, RefreshCw } from 'lucide-react';
import api from './api';
import type { Dataset, DatasetStatus, DatasetStats } from './types';
import StatsDashboard from './components/StatsDashboard';
import DatasetCard from './components/DatasetCard';
import DatasetModal from './components/DatasetModal';
import CSVUploadModal from './components/CSVUploadModal';

function App() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [stats, setStats] = useState<DatasetStats>({
    total: 0,
    tabular: 0,
    image: 0,
    text: 0,
    audio: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);

  // Fetch datasets and stats
  const fetchData = async (searchVal?: string) => {
    try {
      setLoading(true);
      const [datasetsData, statsData] = await Promise.all([
        api.getDatasets(searchVal),
        api.getStats(),
      ]);
      setDatasets(datasetsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Run initial fetch and search filtering
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData(searchQuery);
    }, 300); // 300ms debounce to prevent flooding the server on typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle manual creation or updating
  const handleSubmitDataset = async (formData: any) => {
    if (editingDataset) {
      // Update Mode
      await api.updateDataset(editingDataset.id, formData);
    } else {
      // Create Mode
      await api.createDataset(formData);
    }
    fetchData(searchQuery);
  };

  // Handle status update directly from cards
  const handleStatusChange = async (id: number, newStatus: DatasetStatus) => {
    const targetDataset = datasets.find((d) => d.id === id);
    if (!targetDataset) return;

    try {
      // Prepare payload (excluding id and name per schemas)
      const updateData = {
        description: targetDataset.description,
        type: targetDataset.type,
        rows: targetDataset.rows,
        features: targetDataset.features,
        status: newStatus,
      };
      
      await api.updateDataset(id, updateData);
      
      // Fast optimistic update in UI before refetching stats
      setDatasets(prev => 
        prev.map(d => d.id === id ? { ...d, status: newStatus } : d)
      );
      
      // Update statistics
      const newStats = await api.getStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to update dataset status:', error);
    }
  };

  // Handle deletion
  const handleDeleteDataset = async (id: number) => {
    const confirmed = window.confirm('Are you sure you want to remove this dataset from the database?');
    if (!confirmed) return;

    try {
      await api.deleteDataset(id);
      fetchData(searchQuery);
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  };

  // Handle CSV file upload processing
  const handleCSVUpload = async (file: File, description?: string) => {
    await api.uploadCSV(file, description);
    fetchData(searchQuery);
  };

  const openEditModal = (dataset: Dataset) => {
    setEditingDataset(dataset);
    setIsFormOpen(true);
  };

  const openCreateModal = () => {
    setEditingDataset(null);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen relative bg-slate-950 pb-16">
      {/* Decorative Gradient Background Blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      {/* Main Content Wrapper */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-10 pb-6 border-b border-slate-900 mb-8 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
              <Database className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                  Dataset Explorer
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full uppercase">
                  <Sparkles className="w-2.5 h-2.5" /> v1.0
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Centralized dashboard for tracking machine learning dataset assets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(searchQuery)}
              className="p-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold border border-slate-850 shadow-md transition-all duration-200"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              Upload CSV
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:scale-[1.02] transition-all duration-200"
            >
              <Plus className="w-4.5 h-4.5" />
              Add Dataset
            </button>
          </div>
        </header>

        {/* Aggregate Stats Dashboard */}
        <StatsDashboard stats={stats} />

        {/* Search and Filters Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900/40 p-4 border border-white/5 rounded-2xl backdrop-blur-md">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search datasets by name or keyword..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-slate-500" />
            Showing {datasets.length} of {stats.total} total datasets
          </div>
        </div>

        {/* Datasets Content Grid */}
        {loading ? (
          /* Card Loading Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel p-6 h-[300px] border-white/5 bg-slate-900/20 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                  <div className="h-6 bg-slate-800 rounded-lg w-1/2"></div>
                  <div className="h-6 bg-slate-800 rounded-lg w-1/5"></div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-slate-800 rounded-lg w-full"></div>
                  <div className="h-4 bg-slate-800 rounded-lg w-5/6"></div>
                </div>
                <div className="h-12 bg-slate-800 rounded-xl mb-6"></div>
                <div className="flex justify-between items-center border-t border-slate-800/80 pt-4">
                  <div className="h-8 bg-slate-800 rounded-lg w-1/3"></div>
                  <div className="h-8 bg-slate-850 rounded-lg w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : datasets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                onEdit={openEditModal}
                onDelete={handleDeleteDataset}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="glass-panel border-white/5 bg-slate-900/30 py-16 px-6 text-center max-w-xl mx-auto mt-10">
            <Database className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white tracking-tight">No datasets found</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              {searchQuery 
                ? `No datasets match the search keyword "${searchQuery}". Try modifying your filter.`
                : "Your workspace database is currently empty. Get started by uploading a CSV or manually registering a dataset."}
            </p>
            {!searchQuery && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold border border-slate-750"
                >
                  Upload CSV file
                </button>
                <button
                  onClick={openCreateModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold"
                >
                  Create manual entry
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dataset Creation / Edit Modal */}
      <DatasetModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitDataset}
        dataset={editingDataset}
      />

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleCSVUpload}
      />
    </div>
  );
}

export default App;
