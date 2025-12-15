import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ChevronRight } from "lucide-react";
interface Address {
  id: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

const LOCAL_KEY = "addresses";

const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<Address>({
    id: "",
    label: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        setAddresses(JSON.parse(raw));
      } catch (e) {
        setAddresses([]);
      }
    }
  }, []);

  const persist = (items: Address[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    setAddresses(items);
  };

  const startAdd = () => {
    setEditing(null);
    setForm({
      id: Date.now().toString(),
      label: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    });
  };

  const startEdit = (a: Address) => {
    setEditing(a);
    setForm(a);
  };

  const handleDelete = (id: string) => {
    const filtered = addresses.filter((a) => a.id !== id);
    persist(filtered);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      let updated: Address[] = [];
      if (editing) {
        updated = addresses.map((a) => (a.id === form.id ? form : a));
      } else {
        updated = [...addresses, form];
      }
      persist(updated);
      setEditing(null);
      setForm({
        id: "",
        label: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
      });
    } finally {
      setSaving(false);
    }
  };
  const saveToProfile = async (address: Address) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(
        "https://backend.flauntbynishi.com/api/customer/profile",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save to profile");
      alert("Address saved to your profile (main address)");
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : String(err);
      alert(text || "Failed to save address");
    }
  };
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleBackToCheckout = () => navigate("/checkout");

  const resetForm = () =>
    setForm({
      id: "",
      label: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    });

  const handleFormCancel = () => {
    setEditing(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex-column  items-center justify-between mb-6 ">
          {isMobile && (
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full border border-tertiary bg-background"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          )}
          <span className="text-5xl sm:text-6xl md:text-4xl lg:text-5xl font-semibold">
            My Addresses
          </span>
          <div className="space-x-2 mt-5">
            <button
              onClick={startAdd}
              className="px-4 py-2 bg-tertiary text-white rounded"
            >
              Add New
            </button>
            <button
              onClick={handleBackToCheckout}
              className="px-4 py-2 border border-tertiary rounded-lg"
            >
              Back to Checkout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            {addresses.length === 0 && (
              <div className="p-6 bg-beige rounded-xl shadow-lg">
                No addresses yet. Click Add New to create one.
              </div>
            )}
            {addresses.map((addr) => (
              <div key={addr.id} className="p-4 bg-beige rounded shadow mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {addr.label ||
                        `${addr.firstName || ""} ${addr.lastName || ""}`}
                    </div>
                    <div className="text-sm text-gray-600">{addr.street}</div>
                    <div className="text-sm text-gray-600">
                      {addr.city}, {addr.state} {addr.zipCode}
                    </div>
                    <div className="text-sm text-gray-600">{addr.country}</div>
                    <div className="text-sm text-gray-600">{addr.phone}</div>
                  </div>
                  <div className="space-y-2 text-right">
                    <button
                      onClick={() => startEdit(addr)}
                      className="text-sm px-3 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="text-sm px-3 py-1 border rounded"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => saveToProfile(addr)}
                      className="text-sm px-3 py-1 bg-tertiary text-white rounded"
                    >
                      Save to Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-beige p-6 rounded-xl shadow-lg">
              <span className="font-semibold mb-3 text-5xl sm:text-xl md:text-lg lg:text-4xl block">
                {editing ? "Edit Address" : "Add Address"}
              </span>
              <div className="space-y-2">
                <input
                  className="w-full p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                  placeholder="Label (Home, Office)"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm({ ...form, firstName: e.target.value })
                    }
                  />
                  <input
                    className="p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm({ ...form, lastName: e.target.value })
                    }
                  />
                </div>
                <input
                  className="w-full p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  className="w-full p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  className="w-full p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                  placeholder="Street"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-2">
                  <input
                    className="p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                    placeholder="City"
                    value={form.city}
                    type="text"
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(
                        /[^A-Za-z\s'\-]/g,
                        ""
                      );
                      setForm({ ...form, city: cleaned });
                    }}
                  />
                  <input
                    className="p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(
                        /[^A-Za-z\s'\-]/g,
                        ""
                      );
                      setForm({ ...form, state: cleaned });
                    }}
                  />
                  <input
                    className="p-2 federo-numeric bg-background border border-tertiary rounded-lg placeholder-tertiary"
                    placeholder="ZIP code"
                    value={form.zipCode}
                    maxLength={6}
                    onChange={(e) =>
                      setForm({ ...form, zipCode: e.target.value })
                    }
                  />
                </div>
                <input
                  className="w-full p-2 bg-background border border-tertiary rounded-lg placeholder-tertiary"
                  placeholder="Country"
                  value={form.country}
                  onChange={(e) =>
                    setForm({ ...form, country: e.target.value })
                  }
                />
                <div className="flex items-center justify-end space-x-2 mt-3">
                  <button
                    onClick={handleFormCancel}
                    className="px-4 py-2 border border-tertiary rounded-lg "
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-tertiary text-white rounded"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressesPage;
