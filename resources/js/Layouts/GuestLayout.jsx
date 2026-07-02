import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 shadow-2xl rounded-3xl border border-gray-100 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary-50 opacity-50 blur-2xl"></div>
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-navy-50 opacity-50 blur-2xl"></div>

                <div className="relative text-center">
                    <Link href="/">
                        <h2 className="text-3xl font-extrabold tracking-tight text-navy-900">
                            Login <span className="text-primary-600">Page</span>
                        </h2>
                    </Link>
                    <p className="mt-2 text-sm text-gray-500">
                        Sign in to access your account
                    </p>
                </div>

                <div className="relative mt-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
