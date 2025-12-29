import React, { useState } from 'react';

interface CustomRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CustomRequestModal: React.FC<CustomRequestModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '', // We ask for this so it's in the body, even if mailto uses their client
        bookTitle: '',
        details: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const subject = encodeURIComponent(`Custom Cover Request: ${formData.bookTitle}`);
        const body = encodeURIComponent(`
Name: ${formData.name}
Contact Email: ${formData.email}
Book Title: ${formData.bookTitle}

--- Design Request ---
${formData.details}

----------------------
Sent via CoverQuest Custom Request Form
    `);

        window.open(`mailto:apunj001@gmail.com?subject=${subject}&body=${body}`, '_blank');
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 md:p-8 relative animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-6">
                    <span className="text-4xl mb-3 block">✨</span>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Custom Design</h2>
                    <p className="text-sm text-gray-600">
                        Need a high-quality, professional cover? Submit your request directly to our design team.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                            placeholder="J.K. Rowling"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                            placeholder="author@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Book Title</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                            placeholder="The Great Adventure"
                            value={formData.bookTitle}
                            onChange={(e) => setFormData({ ...formData, bookTitle: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Design Details</label>
                        <textarea
                            required
                            rows={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Describe your vision, genre, mood, and any specific elements you want..."
                            value={formData.details}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Submit Request via Email
                    </button>
                </form>
            </div>
        </div>
    );
};
