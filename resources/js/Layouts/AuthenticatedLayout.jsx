import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const SidebarLink = ({ href, active, icon, children }) => (
    <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
            active
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-blue-100 hover:bg-navy-700 hover:text-white'
        }`}
    >
        {icon && <span className="text-lg">{icon}</span>}
        <span>{children}</span>
    </Link>
);

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const roleLabel = user.role === 'super_admin' ? 'Super Admin' : 'Admin';

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-gradient-to-b from-navy-800 to-navy-900 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                <div className="flex h-full flex-col">
                    <div className="flex h-16 items-center justify-between border-b border-navy-700 px-6">
                        <h1 className="text-xl font-bold text-white">SPK System</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-white lg:hidden hover:text-primary-400"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
                        <SidebarLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            icon="📊"
                        >
                            Dashboard
                        </SidebarLink>

                        <SidebarLink
                            href={route('suppliers.index')}
                            active={route().current('suppliers.*')}
                            icon="🏢"
                        >
                            Data Supplier
                        </SidebarLink>

                        <SidebarLink
                            href={route('products.index')}
                            active={route().current('products.*')}
                            icon="📦"
                        >
                            Data Produk
                        </SidebarLink>

                        <SidebarLink
                            href={route('criteria.index')}
                            active={route().current('criteria.*')}
                            icon="⚖️"
                        >
                            Pembobotan Kriteria
                        </SidebarLink>

                        <SidebarLink
                            href={route('recommendations.index')}
                            active={route().current('recommendations.*')}
                            icon="🎯"
                        >
                            Rekomendasi Order
                        </SidebarLink>

                        <SidebarLink
                            href={route('purchase-orders.index')}
                            active={route().current('purchase-orders.*')}
                            icon="🛒"
                        >
                            Pembelian
                        </SidebarLink>

                        <SidebarLink
                            href={route('sales.index')}
                            active={route().current('sales.*')}
                            icon="💰"
                        >
                            Penjualan
                        </SidebarLink>

                        <SidebarLink
                            href={route('customers.index')}
                            active={route().current('customers.*') || route().current('hutangs.*')}
                            icon="👥"
                        >
                            Kasbon
                        </SidebarLink>

                        <SidebarLink
                            href={route('stoks.index')}
                            active={route().current('stoks.*')}
                            icon="📋"
                        >
                            Stok
                        </SidebarLink>

                        <SidebarLink
                            href={route('laporan.index')}
                            active={route().current('laporan.*')}
                            icon="📊"
                        >
                            Laporan
                        </SidebarLink>

                        {user.role === 'super_admin' && (
                            <SidebarLink
                                href={route('users.index')}
                                active={route().current('users.*')}
                                icon="👤"
                            >
                                Manajemen User
                            </SidebarLink>
                        )}
                    </nav>
                    <div className="border-t border-navy-700 p-4">
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-navy-700">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white font-semibold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate text-sm font-medium text-white">{user.name}</p>
                                        <p className="truncate text-xs text-blue-200">{user.email}</p>
                                    </div>
                                    <svg className="h-4 w-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 11-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content direction="up">
                                <div className="px-4 py-2 border-b border-gray-200">
                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                        user.role === 'super_admin'
                                            ? 'bg-primary-100 text-primary-800'
                                            : 'bg-navy-100 text-navy-800'
                                    }`}>
                                        {roleLabel}
                                    </span>
                                </div>
                                {user.role !== 'admin' && (
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profile
                                    </Dropdown.Link>
                                )}
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </aside>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex min-h-16 flex-col justify-center border-b border-gray-200 bg-white px-4 py-3 sm:px-6 shadow-sm lg:h-16 lg:py-0">
                    <div className="flex items-center justify-between w-full lg:gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="text-navy-700 lg:hidden hover:text-primary-600 shrink-0"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {header && (
                            <div className="flex-1 mx-4 min-w-0">
                                {header}
                            </div>
                        )}
                        <div className="lg:hidden shrink-0">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-navy-700 hover:bg-gray-100">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </Dropdown.Trigger>
                                <Dropdown.Content align="right">
                                    <div className="px-4 py-2 border-b border-gray-200">
                                        <p className="text-sm font-medium text-navy-700">{user.name}</p>
                                        <p className="text-xs text-navy-500">{user.email}</p>
                                        <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            user.role === 'super_admin'
                                                ? 'bg-primary-100 text-primary-800'
                                                : 'bg-navy-100 text-navy-800'
                                        }`}>
                                            {roleLabel}
                                        </span>
                                    </div>
                                    {user.role !== 'admin' && (
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                    )}
                                    <Dropdown.Link href={route('logout')} method="post" as="button">
                                        Log Out
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
