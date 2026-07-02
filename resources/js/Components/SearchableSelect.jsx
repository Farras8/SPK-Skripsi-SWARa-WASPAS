import { useState, useRef, useEffect } from 'react';

export default function SearchableSelect({
    options = [],
    value = '',
    onChange,
    placeholder = 'Pilih opsi...',
    className = '',
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);

    const selectedOption = options.find((opt) => String(opt.value) === String(value));

    useEffect(() => {
        if (selectedOption) {
            setSearch(selectedOption.label);
        } else {
            setSearch('');
        }
    }, [value, selectedOption]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
                setSearch(selectedOption ? selectedOption.label : '');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [selectedOption]);

    const filteredOptions = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (option) => {
        onChange(option.value);
        setSearch(option.label);
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <input
                type="text"
                value={search}
                placeholder={placeholder}
                disabled={disabled}
                onFocus={() => setIsOpen(true)}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setIsOpen(true);
                }}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
            
            {value && !disabled && (
                <button
                    type="button"
                    onClick={() => {
                        onChange('');
                        setSearch('');
                        setIsOpen(false);
                    }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                    ✕
                </button>
            )}

            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && !disabled && (
                <ul className="absolute left-0 z-50 mt-1 max-h-60 min-w-full md:min-w-[500px] lg:min-w-[600px] overflow-auto rounded-md bg-white py-1.5 text-sm shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-100">
                    {filteredOptions.length === 0 ? (
                        <li className="select-none py-2 px-3 text-gray-500 italic">
                            Tidak ditemukan hasil
                        </li>
                    ) : (
                        filteredOptions.map((opt) => (
                            <li
                                key={opt.value}
                                onClick={() => handleSelect(opt)}
                                className={`cursor-pointer select-none py-2.5 px-3.5 hover:bg-primary-50 hover:text-primary-900 border-b border-gray-50 last:border-b-0 ${
                                    String(opt.value) === String(value)
                                        ? 'bg-primary-50 text-primary-700 font-semibold'
                                        : 'text-gray-700'
                                }`}
                            >
                                {opt.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
}
