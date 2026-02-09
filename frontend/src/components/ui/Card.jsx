export const Card = ({ children, className = '', hover = false, ...props }) => {
    return (
        <div
            className={`
        bg-white rounded-[24px] border border-gray-100 shadow-soft p-6
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : ''}
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
};
