"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { CATEGORIES } from "@/lib/words";

type Tab = "words" | "categories" | "users" | "stats";

interface CategoryEntry {
  id: string;
  label: string;
  label_ku: string;
  icon: string;
}

interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface DBWord {
  id: number;
  de: string;
  ku: string;
  category: string;
  note: string | null;
  is_phrase: number;
}

interface WordForm {
  de: string;
  ku: string;
  c: string;
  n: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

const emptyForm: WordForm = { de: "", ku: "", c: "greetings", n: "" };

const WORDS_PER_PAGE = 50;

export default function AdminPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("words");

  // Words tab state
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingWord, setEditingWord] = useState<DBWord | null>(null);
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [words, setWords] = useState<DBWord[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Categories tab state
  const [categories, setCategories] = useState<CategoryEntry[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryEntry | null>(null);
  const [catForm, setCatForm] = useState({ id: "", label: "", label_ku: "", icon: "" });
  const [catSaving, setCatSaving] = useState(false);
  const [showNewCatModal, setShowNewCatModal] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ id: "", label: "", label_ku: "", icon: "" });
  const [newCatSaving, setNewCatSaving] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

  // Users tab state
  const [users, setUsers] = useState<{id: number; email: string; name: string; role: string; xp: number; streak: number; quizzes_played: number; created_at: string}[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<{id: number; email: string; name: string; role: string} | null>(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [userSaving, setUserSaving] = useState(false);
  const SUPER_ADMIN_EMAIL = "ali.nasser@bluewin.ch";
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.user && data.user.role === "admin") {
          setUser(data.user);
          setIsAdmin(true);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Load words from API (cache-bust to always get fresh data in admin)
  const fetchWords = useCallback(async () => {
    setWordsLoading(true);
    try {
      const res = await fetch(`/api/words?t=${Date.now()}`);
      if (!res.ok) throw new Error("Fehler beim Laden");
      const data = await res.json();
      setWords(data.words ?? []);
    } catch {
      showToast("Worter konnten nicht geladen werden.", "error");
    } finally {
      setWordsLoading(false);
    }
  }, [showToast]);

  // Load categories from API
  const fetchCategories = useCallback(async () => {
    setCatLoading(true);
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`);
      if (!res.ok) throw new Error("Fehler beim Laden");
      const data = await res.json();
      const cats = data.categories as Record<string, { label: string; label_ku: string; icon: string }>;
      setCategories(
        Object.entries(cats)
          .filter(([key]) => key !== "all")
          .map(([id, val]) => ({ id, label: val.label, label_ku: val.label_ku || "", icon: val.icon }))
      );
    } catch {
      // Fallback to static categories
      setCategories(
        Object.entries(CATEGORIES)
          .filter(([key]) => key !== "all")
          .map(([id, val]) => ({ id, label: val.label, label_ku: val.label_ku || "", icon: val.icon }))
      );
    } finally {
      setCatLoading(false);
    }
  }, []);

  const handleCatSave = useCallback(async () => {
    if (!editingCat || !catForm.label.trim() || !catForm.icon.trim()) return;
    setCatSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCat.id,
          label: catForm.label.trim(),
          label_ku: catForm.label_ku.trim(),
          icon: catForm.icon.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler beim Speichern");
      }
      const data = await res.json();
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCat.id ? { id: c.id, label: data.category.label, label_ku: data.category.label_ku || "", icon: data.category.icon } : c))
      );
      setEditingCat(null);
      showToast("Kategorie aktualisiert.", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler beim Speichern.";
      showToast(msg, "error");
    } finally {
      setCatSaving(false);
    }
  }, [editingCat, catForm, showToast]);

  // Create new category
  const handleNewCatSave = useCallback(async () => {
    if (!newCatForm.id.trim() || !newCatForm.label.trim() || !newCatForm.icon.trim()) return;
    setNewCatSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newCatForm.id.trim().toLowerCase(),
          label: newCatForm.label.trim(),
          label_ku: newCatForm.label_ku.trim(),
          icon: newCatForm.icon.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler beim Erstellen");
      }
      const data = await res.json();
      setCategories((prev) => [...prev, { id: data.category.id, label: data.category.label, label_ku: data.category.label_ku || "", icon: data.category.icon }]);
      setShowNewCatModal(false);
      setNewCatForm({ id: "", label: "", label_ku: "", icon: "" });
      showToast("Kategorie erstellt.", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler beim Erstellen.";
      showToast(msg, "error");
    } finally {
      setNewCatSaving(false);
    }
  }, [newCatForm, showToast]);

  // Delete category
  const handleDeleteCat = useCallback(async (catId: string) => {
    if (!confirm("Kategorie wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) return;
    setDeletingCatId(catId);
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: catId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler beim Löschen");
      }
      setCategories((prev) => prev.filter((c) => c.id !== catId));
      showToast("Kategorie gelöscht.", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler beim Löschen.";
      showToast(msg, "error");
    } finally {
      setDeletingCatId(null);
    }
  }, [showToast]);

  // Load users (super admin only)
  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) return;
    setUsersLoading(true);
    try {
      const res = await fetch(`/api/users?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users ?? []);
      }
    } catch {
      // Permission denied or error
    } finally {
      setUsersLoading(false);
    }
  }, [isSuperAdmin]);

  const handleToggleRole = useCallback(async (userId: number, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    setUpdatingUserId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler");
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      showToast(`Rolle zu ${newRole === "admin" ? "Admin" : "Benutzer"} geändert.`, "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      showToast(msg, "error");
    } finally {
      setUpdatingUserId(null);
    }
  }, [showToast]);

  const handleDeleteUser = useCallback(async (userId: number, userName: string) => {
    if (!confirm(`Benutzer "${userName}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) return;
    setDeletingUserId(userId);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Fehler");
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast("Benutzer gelöscht.", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Fehler";
      showToast(msg, "error");
    } finally {
      setDeletingUserId(null);
    }
  }, [showToast]);

  const openAddUserModal = useCallback(() => {
    setUserForm({ name: "", email: "", password: "", role: "user" });
    setEditingUser(null);
    setShowUserModal(true);
  }, []);

  const openEditUserModal = useCallback((u: {id: number; email: string; name: string; role: string}) => {
    setUserForm({ name: u.name, email: u.email, password: "", role: u.role });
    setEditingUser(u);
    setShowUserModal(true);
  }, []);

  const closeUserModal = useCallback(() => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ name: "", email: "", password: "", role: "user" });
  }, []);

  const handleUserSave = useCallback(async () => {
    if (!userForm.name.trim() || !userForm.email.trim()) return;
    if (!editingUser && !userForm.password.trim()) return; // Password required for new users

    setUserSaving(true);
    try {
      if (editingUser) {
        // Update existing user
        const body: Record<string, string | number> = { userId: editingUser.id };
        if (userForm.name !== editingUser.name) body.name = userForm.name.trim();
        if (userForm.email !== editingUser.email) body.email = userForm.email.trim();
        if (userForm.role !== editingUser.role) body.role = userForm.role;
        if (userForm.password.trim()) body.password = userForm.password;

        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Fehler beim Speichern");
        }
        const data = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...data.user } : u)));
        showToast("Benutzer aktualisiert.", "success");
      } else {
        // Create new user
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: userForm.name.trim(),
            email: userForm.email.trim(),
            password: userForm.password,
            role: userForm.role,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Fehler beim Erstellen");
        }
        const data = await res.json();
        setUsers((prev) => [data.user, ...prev]);
        showToast("Benutzer erstellt.", "success");
      }
      closeUserModal();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ein Fehler ist aufgetreten.";
      showToast(msg, "error");
    } finally {
      setUserSaving(false);
    }
  }, [userForm, editingUser, closeUserModal, showToast]);

  useEffect(() => {
    if (isAdmin) {
      fetchWords();
      fetchCategories();
      fetchUsers();
    }
  }, [isAdmin, fetchWords, fetchCategories, fetchUsers]);

  // Filtered words
  const filteredWords = useMemo(() => {
    let result = words;
    if (filterCategory !== "all") {
      result = result.filter((w) => w.category === filterCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.de.toLowerCase().includes(q) ||
          w.ku.toLowerCase().includes(q) ||
          (w.note && w.note.toLowerCase().includes(q))
      );
    }
    return result;
  }, [words, filterCategory, search]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredWords.length / WORDS_PER_PAGE));

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterCategory]);

  const paginatedWords = useMemo(() => {
    const start = (currentPage - 1) * WORDS_PER_PAGE;
    return filteredWords.slice(start, start + WORDS_PER_PAGE);
  }, [filteredWords, currentPage]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const w of words) {
      stats[w.category] = (stats[w.category] || 0) + 1;
    }
    return stats;
  }, [words]);

  // Handlers
  const openAddModal = useCallback(() => {
    setForm(emptyForm);
    setEditingWord(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((word: DBWord) => {
    setForm({ de: word.de, ku: word.ku, c: word.category, n: word.note || "" });
    setEditingWord(word);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingWord(null);
    setForm(emptyForm);
  }, []);

  const handleSave = useCallback(async () => {
    if (!form.de.trim() || !form.ku.trim()) return;
    setSaving(true);

    try {
      if (editingWord) {
        // PUT - update existing word
        const res = await fetch("/api/words", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingWord.id,
            de: form.de.trim(),
            ku: form.ku.trim(),
            category: form.c,
            note: form.n.trim() || null,
            is_phrase: editingWord.is_phrase,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Fehler beim Speichern");
        }
        const data = await res.json();
        setWords((prev) =>
          prev.map((w) => (w.id === editingWord.id ? data.word : w))
        );
        showToast("Wort erfolgreich aktualisiert.", "success");
      } else {
        // POST - create new word
        const res = await fetch("/api/words", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            de: form.de.trim(),
            ku: form.ku.trim(),
            category: form.c,
            note: form.n.trim() || null,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Fehler beim Hinzufugen");
        }
        const data = await res.json();
        setWords((prev) => [...prev, data.word]);
        showToast("Wort erfolgreich hinzugefugt.", "success");
      }
      closeModal();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Ein Fehler ist aufgetreten.";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  }, [form, editingWord, closeModal, showToast]);

  const handleDelete = useCallback(
    async (word: DBWord) => {
      if (!confirm(`"${word.de}" wirklich loschen?`)) return;

      try {
        const res = await fetch("/api/words", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: word.id }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Fehler beim Loschen");
        }
        setWords((prev) => prev.filter((w) => w.id !== word.id));
        showToast("Wort erfolgreich geloscht.", "success");
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Fehler beim Loschen.";
        showToast(msg, "error");
      }
    },
    [showToast]
  );

  const handleFormChange = useCallback(
    (field: keyof WordForm, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Tabs config
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "words",
      label: "Worter",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "categories",
      label: "Kategorien",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      id: "users",
      label: "Benutzer",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      id: "stats",
      label: "Statistiken",
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Lade Admin-Bereich...</p>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center px-4">
        <div className="bg-white/[0.03] border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v.01M12 9v3m0 8a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Kein Zugriff</h1>
          <p className="text-gray-400 mb-6">
            Du hast keine Berechtigung, auf den Admin-Bereich zuzugreifen. Bitte melde dich mit einem Admin-Konto an.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all duration-200 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Zuruck zum Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border backdrop-blur-md animate-[slideIn_0.3s_ease-out] ${
              toast.type === "success"
                ? "bg-[#58CC02]/15 border-[#58CC02]/30 text-[#58CC02]"
                : "bg-red-500/15 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "success" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {toast.message}
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f1b3d] via-[#132b4f] to-[#0d3b2e]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-5 left-10 w-48 h-48 bg-[#58CC02]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-5 right-10 w-64 h-64 bg-[#1CB0F6]/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 bg-[#58CC02]/15 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#58CC02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Admin-Bereich
                </h1>
              </div>
              <p className="text-gray-400 text-sm ml-[52px]">
                Willkommen, <span className="text-[#58CC02] font-semibold">{user?.name || user?.email}</span>
              </p>
            </div>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-30 bg-[#0a0f1a]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-[#58CC02] text-[#58CC02]"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:border-white/10"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* WORDS TAB */}
        {activeTab === "words" && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Wort suchen..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20 appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-[#0a0f1a]">Alle Kategorien</option>
                  {categories.filter(c => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#0a0f1a]">
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#58CC02] hover:bg-[#4CAF00] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#58CC02]/20 hover:shadow-[#58CC02]/30 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Neues Wort
              </button>
            </div>

            {/* Word Count */}
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                <span className="text-[#58CC02] font-bold">{filteredWords.length}</span>{" "}
                {filteredWords.length === 1 ? "Wort" : "Worter"}
                {filterCategory !== "all" && (
                  <> in <span className="text-white font-medium">{categories.find(c => c.id === filterCategory)?.label || filterCategory}</span></>
                )}
                {filteredWords.length > WORDS_PER_PAGE && (
                  <span className="text-gray-600">
                    {" "}&middot; Seite {currentPage} von {totalPages}
                  </span>
                )}
              </p>
              {(search || filterCategory !== "all") && (
                <button
                  onClick={() => { setSearch(""); setFilterCategory("all"); }}
                  className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
                >
                  Filter zurucksetzen
                </button>
              )}
            </div>

            {/* Words Table */}
            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.04]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Deutsch</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kurdisch</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kategorie</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Notiz</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {wordsLoading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
                          <p className="text-gray-500 text-sm">Worter werden geladen...</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedWords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        Keine Worter gefunden.
                      </td>
                    </tr>
                  ) : (
                    paginatedWords.map((word, idx) => {
                      const cat = CATEGORIES[word.category];
                      const displayIndex = (currentPage - 1) * WORDS_PER_PAGE + idx + 1;
                      return (
                        <tr
                          key={word.id}
                          className="bg-transparent even:bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-150"
                        >
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{displayIndex}</td>
                          <td className="px-4 py-3 text-white font-medium">{word.de}</td>
                          <td className="px-4 py-3 text-[#58CC02] font-medium">{word.ku}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/[0.06] rounded-full text-xs text-gray-300">
                              <span>{cat?.icon}</span>
                              <span>{cat?.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs italic max-w-[200px] truncate">
                            {word.note || "\u2014"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(word)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[#1CB0F6] hover:bg-[#1CB0F6]/10 transition-all duration-150"
                                title="Bearbeiten"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(word)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
                                title="Loschen"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-gray-600">
                  Zeige {(currentPage - 1) * WORDS_PER_PAGE + 1}&ndash;{Math.min(currentPage * WORDS_PER_PAGE, filteredWords.length)} von {filteredWords.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Zuruck
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        if (totalPages <= 7) return true;
                        if (page === 1 || page === totalPages) return true;
                        if (Math.abs(page - currentPage) <= 1) return true;
                        return false;
                      })
                      .reduce<(number | string)[]>((acc, page, i, arr) => {
                        if (i > 0 && typeof arr[i - 1] === "number" && (page as number) - (arr[i - 1] as number) > 1) {
                          acc.push("...");
                        }
                        acc.push(page);
                        return acc;
                      }, [])
                      .map((item, i) =>
                        typeof item === "string" ? (
                          <span key={`ellipsis-${i}`} className="px-1.5 text-gray-600 text-xs">...</span>
                        ) : (
                          <button
                            key={item}
                            onClick={() => setCurrentPage(item)}
                            className={`w-8 h-8 text-xs font-medium rounded-lg transition-all duration-200 ${
                              currentPage === item
                                ? "bg-[#58CC02] text-white shadow-lg shadow-[#58CC02]/20"
                                : "text-gray-400 bg-white/5 border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            {item}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Weiter
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Kategorien verwalten</h2>
                <p className="text-sm text-gray-500 mt-1">Klicke auf eine Kategorie, um Label oder Icon zu ändern.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{categories.length} Kategorien</span>
                <button
                  onClick={() => setShowNewCatModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#58CC02] hover:bg-[#4CAF00] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#58CC02]/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Neue Kategorie
                </button>
              </div>
            </div>

            {catLoading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <div className="w-8 h-8 border-2 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Kategorien werden geladen...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all duration-200"
                  >
                    {editingCat?.id === cat.id ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={catForm.icon}
                            onChange={(e) => setCatForm((prev) => ({ ...prev, icon: e.target.value }))}
                            className="w-16 px-2 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center text-lg outline-none focus:border-[#58CC02]"
                            placeholder="Icon"
                          />
                          <input
                            type="text"
                            value={catForm.label}
                            onChange={(e) => setCatForm((prev) => ({ ...prev, label: e.target.value }))}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-[#58CC02]"
                            placeholder="Deutsch"
                          />
                        </div>
                        <input
                          type="text"
                          value={catForm.label_ku}
                          onChange={(e) => setCatForm((prev) => ({ ...prev, label_ku: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[#58CC02] text-sm outline-none focus:border-[#58CC02]"
                          placeholder="Kurdisch (z.B. Silav)"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCatSave}
                            disabled={catSaving || !catForm.label.trim() || !catForm.icon.trim()}
                            className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#58CC02] hover:bg-[#4CAF00] rounded-lg transition-all disabled:opacity-40 flex items-center justify-center gap-1"
                          >
                            {catSaving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Speichern
                          </button>
                          {/* Delete button for custom categories (not in CATEGORIES) */}
                          {!CATEGORIES[cat.id] && (
                            <button
                              onClick={() => handleDeleteCat(cat.id)}
                              disabled={deletingCatId === cat.id}
                              className="p-1.5 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
                              title="Kategorie löschen"
                            >
                              {deletingCatId === cat.id ? (
                                <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setEditingCat(null)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                          >
                            Abbrechen
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-600">ID: {cat.id}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCat(cat);
                          setCatForm({ id: cat.id, label: cat.label, label_ku: cat.label_ku, icon: cat.icon });
                        }}
                        className="w-full text-left group cursor-pointer bg-transparent border-none p-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{cat.icon}</span>
                            <div>
                              <p className="text-sm font-semibold text-white group-hover:text-[#58CC02] transition-colors">{cat.label}</p>
                              {cat.label_ku && (
                                <p className="text-xs text-[#58CC02]/70">{cat.label_ku}</p>
                              )}
                              <p className="text-[10px] text-gray-600">{cat.id}</p>
                            </div>
                          </div>
                          <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          isSuperAdmin ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">Benutzerverwaltung</h2>
                  <p className="text-sm text-gray-500 mt-1">Benutzer verwalten, Rollen zuweisen und Konten löschen.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{users.length} Benutzer</span>
                  <button
                    onClick={openAddUserModal}
                    className="flex items-center gap-2 px-4 py-2 bg-[#58CC02] hover:bg-[#4CAF00] text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-[#58CC02]/20"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Neuer Benutzer
                  </button>
                </div>
              </div>

              {usersLoading ? (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="w-8 h-8 border-2 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm">Benutzer werden geladen...</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.04]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Benutzer</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rolle</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">XP</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Streak</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Quizze</th>
                        <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {users.map((u) => {
                        const isSelf = u.email === user?.email;
                        const isSuper = u.email === SUPER_ADMIN_EMAIL;
                        return (
                          <tr key={u.id} className="bg-transparent even:bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-white font-medium">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                u.role === "admin"
                                  ? "bg-[#58CC02]/15 text-[#58CC02] border border-[#58CC02]/30"
                                  : "bg-white/5 text-gray-400 border border-white/10"
                              }`}>
                                {u.role === "admin" ? "👑 Admin" : "👤 Benutzer"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[#58CC02] font-bold">{u.xp}</td>
                            <td className="px-4 py-3 text-orange-400 font-bold">🔥 {u.streak}</td>
                            <td className="px-4 py-3 text-gray-400">{u.quizzes_played}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                {!isSuper && (
                                  <>
                                    <button
                                      onClick={() => openEditUserModal(u)}
                                      className="p-1.5 rounded-lg text-gray-500 hover:text-[#1CB0F6] hover:bg-[#1CB0F6]/10 transition-all"
                                      title="Bearbeiten"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleToggleRole(u.id, u.role)}
                                      disabled={updatingUserId === u.id}
                                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                        u.role === "admin"
                                          ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                                          : "bg-[#58CC02]/10 text-[#58CC02] hover:bg-[#58CC02]/20"
                                      } disabled:opacity-50`}
                                      title={u.role === "admin" ? "Zum Benutzer machen" : "Zum Admin machen"}
                                    >
                                      {updatingUserId === u.id ? "..." : u.role === "admin" ? "→ User" : "→ Admin"}
                                    </button>
                                    {!isSelf && (
                                      <button
                                        onClick={() => handleDeleteUser(u.id, u.name)}
                                        disabled={deletingUserId === u.id}
                                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all disabled:opacity-50"
                                        title="Löschen"
                                      >
                                        {deletingUserId === u.id ? (
                                          <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                        ) : (
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        )}
                                      </button>
                                    )}
                                  </>
                                )}
                                {isSuper && (
                                  <span className="text-xs text-gray-600 italic">Super-Admin</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Benutzerverwaltung</h2>
              <p className="text-gray-500 text-center max-w-md">
                Benutzerverwaltung kommt bald. Hier wirst du Benutzer verwalten, Rollen zuweisen und Aktivitäten einsehen können.
              </p>
              <div className="mt-6 px-4 py-2 bg-[#58CC02]/10 border border-[#58CC02]/20 rounded-full">
                <span className="text-sm text-[#58CC02] font-medium">In Entwicklung</span>
              </div>
            </div>
          )
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#58CC02]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#58CC02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Gesamt Worter</p>
                    <p className="text-2xl font-extrabold text-white">
                      {wordsLoading ? (
                        <span className="inline-block w-12 h-7 bg-white/5 rounded animate-pulse" />
                      ) : (
                        words.length.toLocaleString("de-DE")
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#1CB0F6]/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1CB0F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Kategorien</p>
                    <p className="text-2xl font-extrabold text-white">{categories.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Benutzer</p>
                    <p className="text-2xl font-extrabold text-white">&mdash;</p>
                    <p className="text-xs text-gray-600">Daten folgen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Worter pro Kategorie</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.filter((c) => c.id !== "all").map((cat) => {
                  const count = categoryStats[cat.id] || 0;
                  const percentage = words.length > 0 ? Math.round((count / words.length) * 100) : 0;
                  return (
                    <div
                      key={cat.id}
                      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-sm font-semibold text-white">{cat.label}</span>
                        </div>
                        <span className="text-sm font-bold text-[#58CC02]">{count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#58CC02] to-[#58CC02]/60 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5">{percentage}% aller Worter</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal */}
          <div className="relative bg-[#111827] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-bold text-white">
                {editingWord !== null ? "Wort bearbeiten" : "Neues Wort hinzufugen"}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {/* Deutsch */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Deutsch
                </label>
                <input
                  type="text"
                  value={form.de}
                  onChange={(e) => handleFormChange("de", e.target.value)}
                  placeholder="z.B. Hallo"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>

              {/* Kurdisch */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Kurdisch
                </label>
                <input
                  type="text"
                  value={form.ku}
                  onChange={(e) => handleFormChange("ku", e.target.value)}
                  placeholder="z.B. Silav"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Kategorie
                </label>
                <select
                  value={form.c}
                  onChange={(e) => handleFormChange("c", e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20 appearance-none cursor-pointer"
                >
                  {categories.filter((c) => c.id !== "all").map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-[#111827]">
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Notiz <span className="text-gray-600 normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.n}
                  onChange={(e) => handleFormChange("n", e.target.value)}
                  placeholder="z.B. formell"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={!form.de.trim() || !form.ku.trim() || saving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#58CC02] hover:bg-[#4CAF00] rounded-xl shadow-lg shadow-[#58CC02]/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#58CC02] flex items-center gap-2"
              >
                {saving && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {editingWord !== null ? "Speichern" : "Hinzufugen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Add/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeUserModal}
          />

          {/* Modal */}
          <div className="relative bg-[#111827] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-bold text-white">
                {editingUser ? "Benutzer bearbeiten" : "Neuen Benutzer erstellen"}
              </h3>
              <button
                onClick={closeUserModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Max Mustermann"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="max@beispiel.de"
                  disabled={editingUser?.email === SUPER_ADMIN_EMAIL}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Passwort {editingUser && <span className="text-gray-600 normal-case">(leer lassen, um es nicht zu ändern)</span>}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder={editingUser ? "••••••••" : "Mindestens 6 Zeichen"}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Rolle
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setUserForm((prev) => ({ ...prev, role: "user" }))}
                    disabled={editingUser?.email === SUPER_ADMIN_EMAIL}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      userForm.role === "user"
                        ? "bg-white/10 border-white/20 text-white"
                        : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    👤 Benutzer
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserForm((prev) => ({ ...prev, role: "admin" }))}
                    disabled={editingUser?.email === SUPER_ADMIN_EMAIL}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      userForm.role === "admin"
                        ? "bg-[#58CC02]/15 border-[#58CC02]/30 text-[#58CC02]"
                        : "bg-white/5 border-white/10 text-gray-500 hover:text-gray-300"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    👑 Admin
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
              <button
                onClick={closeUserModal}
                className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUserSave}
                disabled={!userForm.name.trim() || !userForm.email.trim() || (!editingUser && !userForm.password.trim()) || userSaving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#58CC02] hover:bg-[#4CAF00] rounded-xl shadow-lg shadow-[#58CC02]/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#58CC02] flex items-center gap-2"
              >
                {userSaving && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {editingUser ? "Speichern" : "Erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showNewCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNewCatModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-[#111827] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h3 className="text-lg font-bold text-white">
                Neue Kategorie erstellen
              </h3>
              <button
                onClick={() => setShowNewCatModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              {/* ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  ID <span className="text-gray-600 normal-case">(Kleinbuchstaben, keine Leerzeichen)</span>
                </label>
                <input
                  type="text"
                  value={newCatForm.id}
                  onChange={(e) => setNewCatForm((prev) => ({ ...prev, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") }))}
                  placeholder="z.B. hobbies"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Icon <span className="text-gray-600 normal-case">(Emoji)</span>
                </label>
                <input
                  type="text"
                  value={newCatForm.icon}
                  onChange={(e) => setNewCatForm((prev) => ({ ...prev, icon: e.target.value }))}
                  placeholder="z.B. 🎨"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-lg outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>

              {/* Label (German) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Name (Deutsch)
                </label>
                <input
                  type="text"
                  value={newCatForm.label}
                  onChange={(e) => setNewCatForm((prev) => ({ ...prev, label: e.target.value }))}
                  placeholder="z.B. Hobbies"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>

              {/* Label Kurdish */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Name (Kurdisch) <span className="text-gray-600 normal-case">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newCatForm.label_ku}
                  onChange={(e) => setNewCatForm((prev) => ({ ...prev, label_ku: e.target.value }))}
                  placeholder="z.B. Hobî"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#58CC02] placeholder-gray-600 text-sm outline-none transition-all duration-200 focus:border-[#58CC02] focus:ring-2 focus:ring-[#58CC02]/20"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
              <button
                onClick={() => {
                  setShowNewCatModal(false);
                  setNewCatForm({ id: "", label: "", label_ku: "", icon: "" });
                }}
                className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Abbrechen
              </button>
              <button
                onClick={handleNewCatSave}
                disabled={!newCatForm.id.trim() || !newCatForm.label.trim() || !newCatForm.icon.trim() || newCatSaving}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#58CC02] hover:bg-[#4CAF00] rounded-xl shadow-lg shadow-[#58CC02]/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#58CC02] flex items-center gap-2"
              >
                {newCatSaving && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                Kategorie erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
