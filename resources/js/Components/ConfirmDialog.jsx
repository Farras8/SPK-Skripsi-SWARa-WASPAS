import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';

export default function ConfirmDialog({
    show = false,
    title = 'Konfirmasi',
    message = 'Apakah Anda yakin?',
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batal',
    variant = 'danger',
    icon = null,
    onConfirm,
    onCancel,
}) {
    const variantStyles = {
        danger: {
            icon: icon ?? '🗑️',
            iconBg: 'bg-red-100',
            confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
            headerAccent: 'border-red-500',
        },
        warning: {
            icon: icon ?? '⚠️',
            iconBg: 'bg-amber-100',
            confirmBtn: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
            headerAccent: 'border-amber-500',
        },
        info: {
            icon: icon ?? 'ℹ️',
            iconBg: 'bg-blue-100',
            confirmBtn: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
            headerAccent: 'border-primary-500',
        },
    };

    const style = variantStyles[variant] ?? variantStyles.danger;

    return (
        <Transition show={show} leave="duration-200">
            <Dialog
                as="div"
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                onClose={onCancel}
            >
                <TransitionChild
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-navy-900/50 backdrop-blur-sm" />
                </TransitionChild>

                <TransitionChild
                    enter="ease-out duration-250"
                    enterFrom="opacity-0 scale-95 translate-y-2"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-95 translate-y-2"
                >
                    <DialogPanel className={`relative w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl border-t-4 ${style.headerAccent}`}>
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-start gap-4">
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${style.iconBg}`}>
                                    {style.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-navy-900">
                                        {title}
                                    </h3>
                                    <p className="mt-1 text-sm text-navy-600 leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-6 py-3">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 shadow-sm transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-1 active:scale-95"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-95 ${style.confirmBtn}`}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
