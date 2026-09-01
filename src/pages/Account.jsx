// pages/Account.jsx — the signed-in account hub. Every area of the account is a
// section the shopper opens in place rather than a page they navigate away to,
// so the whole account reads as one sheet.
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { IoChevronDown } from "react-icons/io5";
import { FiChevronDown, FiEdit2, FiX } from "react-icons/fi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import PrimaryLayout from "../layout/PrimaryLayout";
import api from "../lib/axios";
import useUserStore from "../stores/auth-store";
import { formatDate, formatMoney, formatStatus } from "../utils/orders";

const SUPPORT_EMAIL = "thenonamestudios@gmail.com";
const SUPPORT_PHONE = "+2347033256031";

const fetchOrders = async () => {
  const { data } = await api.get("/v1/orders");
  if (!data.status) throw new Error(data.message || "Failed to fetch orders");
  return data.data || [];
};

const fetchAddresses = async () => {
  const { data } = await api.get("/v1/me/addresses");
  return data?.data || [];
};

const Empty = ({ children }) => (
  <p className="text-[12.5px] text-[#8C8C86] leading-relaxed">{children}</p>
);

const PanelSpinner = () => (
  <div className="flex justify-center py-2">
    <div className="w-6 h-6 border-2 border-[#EBE9E4] border-t-[#1C1C1A] rounded-full animate-spin" />
  </div>
);

// ── Panels ────────────────────────────────────────────────────────────────────

const OrderHistory = () => {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <PanelSpinner />;
  if (error) return <Empty>We couldn&apos;t load your orders just now.</Empty>;
  if (!orders?.length)
    return <Empty>When you make your first purchase, it will appear here.</Empty>;

  return (
    <div className="divide-y divide-[#F0EFEA]">
      {orders.slice(0, 4).map((order) => {
        const snap = order.totals_snapshot_json || {};
        return (
          <div key={order.id} className="flex justify-between gap-4 py-3">
            <div>
              <span className="block font-mono text-[12.5px] text-[#1C1C1A]">
                {order.id.slice(-8).toUpperCase()}
              </span>
              <span className="block text-[11.5px] text-[#8C8C86] mt-0.5">
                {formatDate(order.created_at)} · {formatStatus(order.status)}
              </span>
            </div>
            <span className="text-[12.5px] text-[#1C1C1A] whitespace-nowrap">
              {formatMoney(snap.grand_total_cents, snap.currency || order.currency)}
            </span>
          </div>
        );
      })}

      <Link
        to="/orders"
        className="block pt-3 text-[11.5px] uppercase tracking-[0.12em] text-[#1C1C1A] underline underline-offset-4"
      >
        View all orders
      </Link>
    </div>
  );
};

const formatBirthday = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
};

const ProfileField = ({ label, value }) => (
  <div>
    <span className="block text-[14px] uppercase tracking-[0.12em] text-[#1C1C1A]">
      {label}
    </span>
    <span className="block text-[14px] text-[#6B6B64] mt-1.5 break-words">
      {value || "—"}
    </span>
  </div>
);

// The profile endpoint mirrors the address book's /v1/me namespace.
const ProfileEditModal = ({ user, onClose }) => {
  const { setUser } = useUserStore();
  const [form, setForm] = useState({
    title: user?.title || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    date_of_birth: (user?.date_of_birth || "").slice(0, 10),
  });

  const setField = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const save = useMutation({
    mutationFn: async () => (await api.patch("/v1/me", form)).data,
    onSuccess: (data) => {
      setUser({ ...user, ...form, ...(data?.data || {}) });
      onClose();
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message ||
          "We couldn't save your details. Please try again.",
      ),
  });

  const field = (name, label, extra = {}) => (
    <div>
      <label htmlFor={name} className="block text-[12px] uppercase tracking-[0.12em] text-[#6B6B64] mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={form[name]}
        onChange={setField}
        className="w-full border border-[#E5E2DC] px-4 py-3 text-[14px] outline-none focus:border-[#1C1C1A] transition-colors"
        {...extra}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center font-now">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[14px] uppercase tracking-[0.14em] text-[#1C1C1A]">
            Profile information
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#8C8C86] hover:text-[#1C1C1A] transition-colors">
            <FiX size={22} />
          </button>
        </div>

        <div className="space-y-4">
          {field("title", "Title", { placeholder: "Mr." })}
          {field("first_name", "First name")}
          {field("last_name", "Last name")}
          {field("phone", "Telephone number", { type: "tel" })}
          {field("date_of_birth", "Date of birth", { type: "date" })}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="flex-1 border border-[#1C1C1A] py-3.5 text-[12px] uppercase tracking-[0.14em] text-[#1C1C1A] hover:bg-[#F7F5F2] transition-colors disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#1C1C1A] py-3.5 text-[12px] uppercase tracking-[0.14em] text-white hover:bg-[#333330] transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ProfileInformation = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="relative pt-4">
      <button
        onClick={() => setIsEditing(true)}
        aria-label="Edit profile information"
        className="absolute right-0 top-2 h-11 w-11 rounded-full bg-[#F2F0EC] hover:bg-[#E9E6E1] transition-colors flex items-center justify-center text-[#4A4A45]"
      >
        <FiEdit2 size={18} />
      </button>

      <div className="space-y-6 pr-14">
        <ProfileField
          label="Name"
          value={[user?.title, user?.first_name, user?.last_name]
            .filter(Boolean)
            .join(" ")}
        />
        <ProfileField label="E-mail" value={user?.email} />
        <ProfileField label="Telephone number" value={user?.phone} />
        <ProfileField
          label="Date of birth"
          value={formatBirthday(user?.date_of_birth)}
        />
        <ProfileField label="Password" value="*********" />
      </div>

      {isEditing && (
        <ProfileEditModal user={user} onClose={() => setIsEditing(false)} />
      )}
    </div>
  );
};

// The book only stores one "default" flag; until the API splits shipping from
// billing, a default address stands for both.
const isDefaultFor = (address, kind) =>
  address[`is_default_${kind}`] ?? address.is_default ?? false;

const formatAddressLine = (address) =>
  [
    address.line1,
    [address.city, address.state, address.zip, address.country]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");

const DefaultMarker = ({ filled, children }) => (
  <span className="flex items-center gap-3 text-[14px] text-[#1C1C1A]">
    <span
      className={`h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] flex items-center justify-center ${
        filled ? "border-[#1C1C1A]" : "border-[#C7C4BD]"
      }`}
    >
      {filled && <span className="h-[6px] w-[6px] rounded-full bg-[#1C1C1A]" />}
    </span>
    {children}
  </span>
);

const EMPTY_ADDRESS = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  phone: "",
};

const AddressFormModal = ({ address, isFirst, onClose }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(
    address
      ? {
          firstName: address.first_name || "",
          lastName: address.last_name || "",
          address: address.line1 || "",
          city: address.city || "",
          state: address.state || "",
          zipCode: address.zip || "",
          phone: address.phone || "",
        }
      : EMPTY_ADDRESS,
  );

  const { data: statesData } = useQuery({
    queryKey: ["shippingStates"],
    queryFn: async () => (await api.get("/v1/shipping/states")).data,
  });
  const shippingStates = statesData?.data || [];

  const setField = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const isComplete =
    form.firstName && form.lastName && form.address && form.city && form.state && form.phone;

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        first_name: form.firstName,
        last_name: form.lastName,
        line1: form.address,
        city: form.city,
        state: form.state,
        zip: form.zipCode,
        phone: form.phone,
      };
      return address
        ? api.patch(`/v1/me/addresses/${address.id}`, payload)
        : api.post("/v1/me/addresses", { ...payload, is_default: isFirst });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me", "addresses"] });
      onClose();
    },
    onError: (error) =>
      toast.error(
        error?.response?.data?.message ||
          "We couldn't save that address. Please try again.",
      ),
  });

  const field = (name, label, extra = {}) => (
    <div>
      <label htmlFor={name} className="block text-[12px] uppercase tracking-[0.12em] text-[#6B6B64] mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        value={form[name]}
        onChange={setField}
        className="w-full border border-[#E5E2DC] px-4 py-3 text-[14px] outline-none focus:border-[#1C1C1A] transition-colors"
        {...extra}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center font-now">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[14px] uppercase tracking-[0.14em] text-[#1C1C1A]">
            {address ? "Edit address" : "Add an address"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[#8C8C86] hover:text-[#1C1C1A] transition-colors">
            <FiX size={22} />
          </button>
        </div>

        <div className="space-y-4">
          {field("firstName", "First name *")}
          {field("lastName", "Last name *")}
          {field("address", "Address *", { placeholder: "Street address" })}
          {field("city", "City *")}

          <div>
            <label htmlFor="state" className="block text-[12px] uppercase tracking-[0.12em] text-[#6B6B64] mb-2">
              State *
            </label>
            <div className="relative">
              <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8C86] pointer-events-none" />
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={setField}
                className="w-full border border-[#E5E2DC] px-4 py-3 text-[14px] outline-none appearance-none focus:border-[#1C1C1A] transition-colors"
              >
                <option value="">Select State</option>
                {shippingStates.map((state) => (
                  <option key={state.id} value={state.state}>
                    {state.state}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {field("zipCode", "ZIP code")}
          {field("phone", "Mobile number *", { type: "tel", placeholder: "Mobile number" })}
        </div>

        <div className="flex gap-4 mt-8">
          <button
            type="button"
            onClick={() => (isComplete ? save.mutate() : toast.error("Please fill in all required fields"))}
            disabled={save.isPending}
            className="flex-1 border border-[#1C1C1A] py-3.5 text-[12px] uppercase tracking-[0.14em] text-[#1C1C1A] hover:bg-[#F7F5F2] transition-colors disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#1C1C1A] py-3.5 text-[12px] uppercase tracking-[0.14em] text-white hover:bg-[#333330] transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const AddressBook = () => {
  const [editing, setEditing] = useState(null); // an address, or "new"

  const { data: addresses, isLoading, error } = useQuery({
    queryKey: ["me", "addresses"],
    queryFn: fetchAddresses,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <PanelSpinner />;
  if (error) return <Empty>We couldn&apos;t load your addresses just now.</Empty>;

  return (
    <div className="pt-4">
      <div className="space-y-4">
        {addresses?.length ? (
          addresses.map((address) => (
            <div key={address.id} className="border border-[#E5E2DC] px-6 py-7">
              <p className="text-[14px] text-[#1C1C1A] leading-[1.9]">
                {[address.title, address.first_name, address.last_name]
                  .filter(Boolean)
                  .join(" ")}
                <br />
                {formatAddressLine(address)}
                {address.phone && (
                  <>
                    <br />
                    {address.phone}
                  </>
                )}
              </p>

              <div className="mt-5 space-y-3">
                <DefaultMarker filled={isDefaultFor(address, "shipping")}>
                  Default shipping address
                </DefaultMarker>
                <DefaultMarker filled={isDefaultFor(address, "billing")}>
                  Default billing address
                </DefaultMarker>
              </div>

              <button
                onClick={() => setEditing(address)}
                className="mt-5 text-[13px] text-[#1C1C1A] underline underline-offset-4"
              >
                Edit
              </button>
            </div>
          ))
        ) : (
          <Empty>No saved addresses yet. Add one and it will be kept here.</Empty>
        )}
      </div>

      <button
        onClick={() => setEditing("new")}
        className="w-full mt-6 border border-[#1C1C1A] py-4 text-[13px] uppercase tracking-[0.12em] text-[#1C1C1A] hover:bg-[#F7F5F2] transition-colors"
      >
        Add an address
      </button>

      {editing && (
        <AddressFormModal
          address={editing === "new" ? null : editing}
          isFirst={!addresses?.length}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────

const Account = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearUserData } = useUserStore();
  const [openSection, setOpenSection] = useState(null);

  const handleSignOut = () => {
    clearUserData();
    delete api.defaults.headers.common["Authorization"];
    navigate("/");
  };

  const sections = [
    { id: "order-history", label: "Order History", panel: <OrderHistory /> },
    {
      id: "profile-information",
      label: "Profile Information",
      panel: <ProfileInformation user={user} />,
    },
    { id: "address-book", label: "Address Book", panel: <AddressBook /> },
    {
      id: "certificate",
      label: "Certificate",
      panel: (
        <Empty>
          Certificates of authenticity appear here once a piece has shipped.
        </Empty>
      ),
    },
    {
      id: "wishlist",
      label: "Wishlist",
      panel: (
        <Empty>
          Nothing saved yet. Pieces you keep for later will be listed here.
        </Empty>
      ),
    },
  ];

  if (!isAuthenticated) {
    return (
      <PrimaryLayout>
        <div className="min-h-screen pt-[7rem] px-5 bg-[#F7F5F2] font-now">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-[25.6px] uppercase tracking-[0.02em] text-[#1C1C1A]">
              My Account
            </h1>
            <p className="text-[12.5px] text-[#8C8C86] mt-3">
              Sign in to see your orders, addresses and saved pieces.
            </p>
            <Link
              to="/signin"
              className="inline-block mt-6 px-8 py-3 bg-[#1C1C1A] text-white text-[10.5px] uppercase tracking-[0.15em]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </PrimaryLayout>
    );
  }

  return (
    <PrimaryLayout>
      <div className="min-h-screen pt-[6.5rem] pb-12 bg-[#F7F5F2] font-now">
        <div className="max-w-2xl mx-auto px-5">
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-[25.6px] uppercase tracking-[0.02em] text-[#1C1C1A] leading-none">
              My Account
            </h1>
            <button
              onClick={handleSignOut}
              className="text-[12.9px] uppercase tracking-[0.06em] text-[#1C1C1A] underline underline-offset-[6px] hover:text-[#6B6B64] transition-colors"
            >
              Sign-out
            </button>
          </div>

          <div className="mt-7 space-y-2.5">
            {sections.map((section) => {
              const isOpen = openSection === section.id;

              return (
                <div key={section.id} className="bg-white">
                  <button
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 px-5 py-6 text-left"
                  >
                    <span className="text-[14px] uppercase tracking-[0.14em] text-[#1C1C1A]">
                      {section.label}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-[#1C1C1A] shrink-0"
                    >
                      <IoChevronDown size={20} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 pt-1 border-t border-[#F0EFEA]">
                          {section.panel}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-10 pt-8 border-t border-[#E5E2DC]">
            <h2 className="text-[13.8px] uppercase tracking-[0.16em] text-[#1C1C1A] font-medium">
              Customer Service
            </h2>
            <p className="text-[12.2px] text-[#4A4A45] mt-3">
              Monday to Saturday 10am - 9pm WAT :
            </p>
            <a
              href={`tel:${SUPPORT_PHONE}`}
              className="block text-[12.2px] text-[#1C1C1A] mt-2"
            >
              +234 703 325 6031
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-block text-[9.9px] text-[#1C1C1A] underline underline-offset-4 mt-5"
            >
              Email us
            </a>
          </div>
        </div>
      </div>
    </PrimaryLayout>
  );
};

export default Account;
