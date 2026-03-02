import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, X } from 'lucide-react';

interface RenameMediaModalProps {
    isOpen: boolean;
    initialName: string;
    isSubmitting: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
}

export function RenameMediaModal({
    isOpen,
    initialName,
    isSubmitting,
    onClose,
    onSubmit,
}: RenameMediaModalProps) {
    const [name, setName] = useState(initialName);

    useEffect(() => {
        if (isOpen) setName(initialName);
    }, [isOpen, initialName]);

    const isUnchanged = useMemo(() => name.trim() === initialName.trim(), [name, initialName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isUnchanged || isSubmitting) return;
        await onSubmit(name.trim());
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                    <h3 className="text-lg font-semibold text-gray-900">Rename media</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-60"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                    <div>
                        <label htmlFor="rename-media-input" className="mb-1 block text-sm font-medium text-gray-700">
                            New file name
                        </label>
                        <input
                            id="rename-media-input"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--md-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--md-primary)] disabled:bg-gray-100"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim() || isUnchanged}
                            className="inline-flex items-center gap-2 rounded-lg bg-[var(--md-primary)] px-4 py-2 text-sm text-white hover:bg-[var(--md-primary-hover)] disabled:opacity-60"
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

