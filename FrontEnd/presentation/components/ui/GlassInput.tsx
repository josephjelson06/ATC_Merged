
import React from 'react';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Use mono font — useful for GSTIN, PAN, serial numbers */
  mono?: boolean;
}

const GlassInput: React.FC<GlassInputProps> = ({
  label,
  error,
  mono = false,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500 dark:text-gray-400"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-4 py-3 rounded-xl outline-none transition-all duration-200 text-sm font-medium border
          bg-gray-50 dark:bg-black/20
          border-gray-200 dark:border-white/10
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:border-accent/50 focus:ring-4 focus:ring-accent/10
          disabled:opacity-50 disabled:cursor-not-allowed
          ${mono ? 'font-mono uppercase' : ''}
          ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest">
          {error}
        </p>
      )}
    </div>
  );
};

export default React.memo(GlassInput);
