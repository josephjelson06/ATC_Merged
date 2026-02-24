import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Search, 
  Settings2, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';

export interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface ReportDataViewProps {
  title: string;
  data: any[];
  columns: Column[];
  onBack: () => void;
  isLoading?: boolean;
}

const ReportDataView: React.FC<ReportDataViewProps> = ({ 
  title, 
  data, 
  columns, 
  onBack,
  isLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filter Data
  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter(row => 
      Object.values(row).some(val => 
        String(val).toLowerCase().includes(lowerTerm)
      )
    );
  }, [data, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const start = startIndex;
    const end = Math.min(startIndex + rowsPerPage, filteredData.length);
    
    if (e.target.checked) {
      const newSelection = new Set(selectedRows);
      for (let i = start; i < end; i++) {
        newSelection.add(i);
      }
      setSelectedRows(newSelection);
    } else {
      const newSelection = new Set(selectedRows);
      for (let i = start; i < end; i++) {
        newSelection.delete(i);
      }
      setSelectedRows(newSelection);
    }
  };

  const handleSelectRow = (globalIndex: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(globalIndex)) {
      newSelected.delete(globalIndex);
    } else {
      newSelected.add(globalIndex);
    }
    setSelectedRows(newSelected);
  };

  const exportData = (format: 'PDF' | 'Excel') => {
    alert(`Exporting ${selectedRows.size > 0 ? selectedRows.size : 'all filtered'} rows as ${format}`);
  };

  const isAllCurrentPageSelected = currentData.length > 0 && currentData.every((_, idx) => selectedRows.has(startIndex + idx));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
            <button 
                onClick={onBack}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors group mb-2"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to Reports
            </button>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                {title}
            </h2>
        </div>
        
        <div className="flex items-center gap-3">
             <Button 
                variant="secondary" 
                size="sm"
                icon={<FileText size={16} />}
                onClick={() => exportData('PDF')}
             >
                Export PDF
             </Button>
             <Button 
                variant="secondary" 
                size="sm"
                icon={<FileSpreadsheet size={16} />}
                onClick={() => exportData('Excel')}
             >
                Export Excel
             </Button>
        </div>
      </div>

      {/* Controls & Table Card */}
      <GlassCard className="overflow-hidden border border-white/10 shadow-xl">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-white/5 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-96">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search records..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/5 dark:bg-black/20 border border-white/10 outline-none text-sm font-medium text-gray-900 dark:text-gray-200 focus:border-accent/40 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* View Options */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rows:</span>
                    <select 
                        className="bg-transparent border border-white/10 rounded-lg text-xs font-bold px-2 py-1 outline-none dark:text-gray-300"
                        value={rowsPerPage}
                        onChange={(e) => {
                            setRowsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-xs font-bold text-gray-500 uppercase tracking-wider">
                    <Settings2 size={14} />
                    Columns
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-black/5 dark:bg-white/[0.02] border-b border-white/5">
                        <th className="p-4 w-12 text-center">
                            <input 
                                type="checkbox" 
                                className="rounded border-gray-300 text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                                onChange={handleSelectAll}
                                checked={isAllCurrentPageSelected}
                            />
                        </th>
                        <th className="p-4 w-16 text-xs font-black uppercase tracking-widest text-gray-400">#</th>
                        {columns.map(col => (
                            <th key={col.key} className="p-4 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {isLoading ? (
                         <tr>
                            <td colSpan={columns.length + 2} className="p-12 text-center">
                                <div className="inline-block w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin mb-4" />
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading Data...</p>
                            </td>
                         </tr>
                    ) : filteredData.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 2} className="p-12 text-center">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No matching records found</p>
                            </td>
                        </tr>
                    ) : (
                        currentData.map((row, idx) => {
                            const globalIndex = startIndex + idx;
                            const isSelected = selectedRows.has(globalIndex);
                            return (
                                <tr 
                                    key={globalIndex} 
                                    className={`
                                        group transition-colors 
                                        ${isSelected ? 'bg-accent/5' : 'hover:bg-white/[0.02]'}
                                    `}
                                >
                                    <td className="p-4 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-accent focus:ring-accent w-4 h-4 cursor-pointer"
                                            checked={isSelected}
                                            onChange={() => handleSelectRow(globalIndex)}
                                        />
                                    </td>
                                    <td className="p-4 text-xs font-mono font-medium text-gray-500">{globalIndex + 1}</td>
                                    {columns.map(col => (
                                        <td key={col.key} className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                            {col.render ? col.render(row) : (row[col.key] || '-')}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-white/5 bg-white/5 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {selectedRows.size} of {filteredData.length} row(s) selected
            </p>
            
            <div className="flex items-center gap-2">
                <button 
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft size={16} className="text-gray-500 dark:text-gray-300" />
                </button>
                <div className="px-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Page {currentPage} of {totalPages || 1}
                    </span>
                </div>
                <button 
                    className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                >
                    <ChevronRight size={16} className="text-gray-500 dark:text-gray-300" />
                </button>
            </div>
        </div>

      </GlassCard>
    </div>
  );
};

export default ReportDataView;
