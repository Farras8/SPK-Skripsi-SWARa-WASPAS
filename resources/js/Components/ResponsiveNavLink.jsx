import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-primary-400 bg-navy-600 text-white focus:border-primary-300 focus:bg-navy-500'
                    : 'border-transparent text-blue-100 hover:border-primary-500 hover:bg-navy-600 hover:text-white focus:border-primary-500 focus:bg-navy-600 focus:text-white'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
