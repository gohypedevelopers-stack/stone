import { useState, useEffect } from "react";
import { X, Plus, MapPin, Check, Trash2, Home, Briefcase } from "lucide-react";

export default function AddressModal({ isOpen, onClose }) {
    const [addresses, setAddresses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        name: "",
        street: "",
        city: "",
        zip: "",
        phone: "",
        type: "Home" // Home or Work
    });

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem("saved_addresses");
            if (saved) {
                setAddresses(JSON.parse(saved));
            } else {
                // Default mock address if none exist
                const initial = [
                    {
                        id: Date.now(),
                        name: "Default User",
                        street: "123 Skincare Lane",
                        city: "Beauty City",
                        zip: "10001",
                        phone: "9876543210",
                        type: "Home",
                        isDefault: true
                    }
                ];
                setAddresses(initial);
                localStorage.setItem("saved_addresses", JSON.stringify(initial));
            }
        } catch (e) {
            console.error("Failed to load addresses", e);
        }
    }, []);

    // Save to localStorage whenever addresses change
    useEffect(() => {
        localStorage.setItem("saved_addresses", JSON.stringify(addresses));
    }, [addresses]);

    if (!isOpen) return null;

    const handleAddAddress = (e) => {
        e.preventDefault();
        const address = {
            id: Date.now(),
            ...newAddress,
            isDefault: addresses.length === 0 // Make default if it's the first one
        };
        setAddresses((prev) => [...prev, address]);
        setNewAddress({ name: "", street: "", city: "", zip: "", phone: "", type: "Home" });
        setShowForm(false);
    };

    const setDefault = (id) => {
        setAddresses((prev) =>
            prev.map((addr) => ({
                ...addr,
                isDefault: addr.id === id
            }))
        );
    };

    const deleteAddress = (id) => {
        setAddresses((prev) => {
            const filtered = prev.filter(a => a.id !== id);
            // If we deleted the default, make the first remaining one default
            if (prev.find(a => a.id === id)?.isDefault && filtered.length > 0) {
                filtered[0].isDefault = true;
            }
            return filtered;
        });
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                    <h2 className="text-lg font-[900] text-stone-900 flex items-center gap-2">
                        <MapPin size={20} className="text-pink-500" />
                        Saved Addresses
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-900 hover:border-stone-400 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-stone-200">

                    {showForm ? (
                        <form onSubmit={handleAddAddress} className="flex flex-col gap-4 animate-fade-in">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-[800] text-stone-900">New Address details</h3>
                                <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold text-stone-400 hover:text-stone-600">Cancel</button>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <input
                                    required
                                    placeholder="Full Name"
                                    value={newAddress.name}
                                    onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                                    className="w-full bg-stone-50 border-none rounded-[16px] px-4 py-3 text-sm font-semibold placeholder:text-stone-400 focus:ring-2 focus:ring-pink-100 transition-all"
                                />
                                <input
                                    required
                                    placeholder="Street Address"
                                    value={newAddress.street}
                                    onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                                    className="w-full bg-stone-50 border-none rounded-[16px] px-4 py-3 text-sm font-semibold placeholder:text-stone-400 focus:ring-2 focus:ring-pink-100 transition-all"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        required
                                        placeholder="City"
                                        value={newAddress.city}
                                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="w-full bg-stone-50 border-none rounded-[16px] px-4 py-3 text-sm font-semibold placeholder:text-stone-400 focus:ring-2 focus:ring-pink-100 transition-all"
                                    />
                                    <input
                                        required
                                        placeholder="ZIP Code"
                                        value={newAddress.zip}
                                        onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })}
                                        className="w-full bg-stone-50 border-none rounded-[16px] px-4 py-3 text-sm font-semibold placeholder:text-stone-400 focus:ring-2 focus:ring-pink-100 transition-all"
                                    />
                                </div>
                                <input
                                    required
                                    type="tel"
                                    placeholder="Phone Number"
                                    value={newAddress.phone}
                                    onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    className="w-full bg-stone-50 border-none rounded-[16px] px-4 py-3 text-sm font-semibold placeholder:text-stone-400 focus:ring-2 focus:ring-pink-100 transition-all"
                                />

                                <div className="flex gap-2 mt-1">
                                    {['Home', 'Work'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNewAddress({ ...newAddress, type })}
                                            className={`flex-1 py-2 rounded-[12px] text-xs font-[800] border transition-all flex items-center justify-center gap-2 ${newAddress.type === type
                                                    ? 'bg-stone-900 text-white border-stone-900'
                                                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                                                }`}
                                        >
                                            {type === 'Home' ? <Home size={14} /> : <Briefcase size={14} />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="mt-4 w-full py-3.5 bg-pink-500 text-white rounded-[16px] font-[800] text-sm hover:bg-pink-600 transition-all shadow-lg shadow-pink-200/50">
                                Save Address
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {addresses.map(addr => (
                                <div
                                    key={addr.id}
                                    onClick={() => setDefault(addr.id)}
                                    className={`relative p-4 rounded-[20px] border-2 transition-all cursor-pointer group ${addr.isDefault
                                            ? 'border-pink-500 bg-pink-50/10 shadow-sm'
                                            : 'border-transparent bg-stone-50 hover:bg-white hover:shadow-md hover:border-stone-100'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] uppercase font-[900] tracking-wider px-2 py-1 rounded-md ${addr.type === 'Home' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                                                }`}>
                                                {addr.type}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="text-[10px] font-[800] text-pink-600 flex items-center gap-1">
                                                    <Check size={12} /> Default
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteAddress(addr.id); }}
                                            className="text-stone-300 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <h4 className="font-[800] text-stone-900 text-sm mt-2">{addr.name}</h4>
                                    <p className="text-xs text-stone-500 font-medium leading-relaxed mt-1">
                                        {addr.street}, {addr.city} - {addr.zip}
                                    </p>
                                    <p className="text-xs text-stone-500 font-medium mt-1">
                                        Phone: {addr.phone}
                                    </p>
                                </div>
                            ))}

                            {addresses.length === 0 && (
                                <div className="text-center py-8 text-stone-400">
                                    <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-semibold">No saved addresses</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!showForm && (
                    <div className="p-4 border-t border-stone-100 bg-white">
                        <button
                            onClick={() => setShowForm(true)}
                            className="w-full py-3.5 bg-stone-900 text-white rounded-[18px] font-[800] text-sm hover:bg-stone-800 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Plus size={18} /> Add New Address
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
