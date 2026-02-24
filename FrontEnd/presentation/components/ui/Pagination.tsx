
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (num: number) => void;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}) => {
  const startIdx = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  const pageSizeOptions = [5, 10, 20, 50];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 whitespace-nowrap">
          Showing <span className="text-gray-900 dark:text-white px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">{startIdx}-{endIdx}</span> of <span className="text-gray-900 dark:text-white px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5">{totalItems}</span> records
        </p>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Per Page:</span>
          <div className="relative group">
            <select 
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="appearance-none bg-black/5 dark:bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-1.5 text-[10px] font-bold uppercase dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer transition-all"
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt} className="bg-gray-900 text-white">{opt}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-white/5 shadow-sm backdrop-blur-sm">
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-xl text-gray-500 hover:text-accent-strong disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>
          
          <div className="flex items-center gap-1">
            {/* Simple range of pages */}
            {Array.from({ length: totalPages }).map((_, i) => {
              // Only show pages near current for better UI on large sets
              const pageNum = i + 1;
              if (totalPages > 7) {
                if (pageNum !== 1 && pageNum !== totalPages && (pageNum < currentPage - 1 || pageNum > currentPage + 1)) {
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) return <span key={pageNum} className="px-1 text-gray-500">...</span>;
                  return null;
                }
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-9 h-9 rounded-xl text-[10px] font-black transition-all ${
                    currentPage === pageNum 
                      ? 'bg-white dark:bg-white/10 text-accent-strong shadow-md scale-105' 
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl text-gray-500 hover:text-accent-strong disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(Pagination);
