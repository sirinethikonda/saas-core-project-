import React, { forwardRef } from 'react';

export const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`
            w-full bg-white border border-gray-200 rounded-xl 
            ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5
            text-sm text-gray-900 placeholder:text-gray-400
            focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none
            transition-all duration-200
            ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}
            ${className}
          `}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1.5 ml-1 text-xs text-red-500 font-medium animate-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
