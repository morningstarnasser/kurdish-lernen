"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { WORDS, CATEGORIES } from "@/lib/words";
import type { Word } from "@/lib/words";

type Tab = "words" | "users" | "stats";

interface UserData {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface WordForm {
  de: string;
  ku: string;
  c: string;
  n: string;
}

const emptyForm: WordForm = { de: "", ku: "", c: "greetings", n: "" };

const categoryKeys = Object.keys(CATEGORIES).filter((k) => k !== "all");

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<WordForm>(emptyForm);
  const [words, setWords] = useState<Word[]>([...WORDS]);

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

  // Filtered words
  const filteredWords = useMemo(() => {
    let result = words;
    if (filterCategory !== "all") {
      result = result.filter((w) => w.c === filterCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (w) =>
          w.de.toLowerCase().includes(q) ||
          w.ku.toLowerCase().includes(q) ||
          (w.n && w.n.toLowerCase().includes(q))
      );
    }
    return result;
  }, [words, filterCategory, search]);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const w of words) {
      stats[w.c] = (stats[w.c] || 0) + 1;
    }
    return stats;
  }, [words]);

  // Handlers
  const openAddModal = useCallback(() => {
    setForm(emptyForm);
    setEditingIndex(null);
    setShowModal(true);
  }, []);

  const openEditModal = useCallback(
    (index: number) => {
      const w = words[index];
      setForm({ de: w.de, ku: w.ku, c: w.c, n: w.n || "" });
      setEditingIndex(index);
      setShowModal(true);
    },
    [words]
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditingIndex(null);
    setForm(emptyForm);
  }, []);

  const handleSave = useCallback(() => {
    if (!form.de.trim() || !form.ku.trim()) return;

    const newWord: Word = {
      de: form.de.trim(),
      ku: form.ku.trim(),
      c: form.c,
      ...(form.n.trim() ? { n: form.n.trim() } : {}),
    };

    if (editingIndex !== null) {
      setWords((prev) => {
        const updated = [...prev];
        updated[editingIndex] = newWord;
        return updated;
      });
    } else {
      setWords((prev) => [...prev, newWord]);
    }
    closeModal();
  }, [form, editingIndex, closeModal]);

  const handleDelete = useCallback((index: number) => {
    setWords((prev) => prev.filter((_, i) => i !== index));
  }, []);

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
                  {categoryKeys.map((key) => (
                    <option key={key} value={key} className="bg-[#0a0f1a]">
                      {CATEGORIES[key].icon} {CATEGORIES[key].label}
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
                  <> in <span className="text-white font-medium">{CATEGORIES[filterCategory]?.label}</span></>
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
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">#</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Deutsch</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kurdisch</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Kategorie</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Notiz</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredWords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                        Keine Worter gefunden.
                      </td>
                    </tr>
                  ) : (
                    filteredWords.map((word, idx) => {
                      const globalIndex = words.indexOf(word);
                      const cat = CATEGORIES[word.c];
                      return (
                        <tr
                          key={`${word.de}-${word.ku}-${idx}`}
                          className="bg-transparent even:bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-150"
                        >
                          <td className="px-4 py-3 text-gray-600 font-mono text-xs">{globalIndex + 1}</td>
                          <td className="px-4 py-3 text-white font-medium">{word.de}</td>
                          <td className="px-4 py-3 text-[#58CC02] font-medium">{word.ku}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/[0.06] rounded-full text-xs text-gray-300">
                              <span>{cat?.icon}</span>
                              <span>{cat?.label}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs italic max-w-[200px] truncate">
                            {word.n || "\u2014"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(globalIndex)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-[#1CB0F6] hover:bg-[#1CB0F6]/10 transition-all duration-150"
                                title="Bearbeiten"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(globalIndex)}
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
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Benutzerverwaltung</h2>
            <p className="text-gray-500 text-center max-w-md">
              Benutzerverwaltung kommt bald. Hier wirst du Benutzer verwalten, Rollen zuweisen und Aktivitaten einsehen konnen.
            </p>
            <div className="mt-6 px-4 py-2 bg-[#58CC02]/10 border border-[#58CC02]/20 rounded-full">
              <span className="text-sm text-[#58CC02] font-medium">In Entwicklung</span>
            </div>
          </div>
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
                    <p className="text-2xl font-extrabold text-white">{words.length}</p>
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
                    <p className="text-2xl font-extrabold text-white">{categoryKeys.length}</p>
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
                {categoryKeys.map((key) => {
                  const cat = CATEGORIES[key];
                  const count = categoryStats[key] || 0;
                  const percentage = words.length > 0 ? Math.round((count / words.length) * 100) : 0;
                  return (
                    <div
                      key={key}
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
                {editingIndex !== null ? "Wort bearbeiten" : "Neues Wort hinzufugen"}
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
                  {categoryKeys.map((key) => (
                    <option key={key} value={key} className="bg-[#111827]">
                      {CATEGORIES[key].icon} {CATEGORIES[key].label}
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
                disabled={!form.de.trim() || !form.ku.trim()}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#58CC02] hover:bg-[#4CAF00] rounded-xl shadow-lg shadow-[#58CC02]/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#58CC02]"
              >
                {editingIndex !== null ? "Speichern" : "Hinzufugen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
