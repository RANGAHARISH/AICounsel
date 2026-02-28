"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Business = {
    id: string;
    name: string;
    entity_type: string;
    state: string;
    industry: string;
};

type Deadline = {
    id: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    category: string;
};

export default function CompliancePage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [business, setBusiness] = useState<Business | null>(null);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [entityType, setEntityType] = useState("LLC");
    const [stateName, setStateName] = useState("CA");
    const [industry, setIndustry] = useState("");

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.replace("/login");
            return;
        }

        if (session?.user) {
            fetchData();
        }
    }, [session, isPending, router]);

    async function fetchData() {
        setLoading(true);
        try {
            const res = await fetch("/api/compliance/business");
            const data = await res.json();
            if (data.business) {
                setBusiness(data.business);
                await fetchDeadlines(data.business.id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    async function fetchDeadlines(businessId: string) {
        try {
            const res = await fetch(`/api/compliance/deadlines?businessId=${businessId}`);
            const data = await res.json();
            if (data.deadlines) {
                setDeadlines(data.deadlines);
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function handleSetup(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/compliance/business", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, entity_type: entityType, state: stateName, industry }),
            });
            const data = await res.json();
            if (data.business) {
                setBusiness(data.business);
                // Auto-generate deadlines
                await fetch("/api/compliance/deadlines", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ businessId: data.business.id }),
                });
                await fetchDeadlines(data.business.id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(deadlineId: string, currentStatus: string) {
        const newStatus = currentStatus === "pending" ? "filed" : "pending";
        try {
            await fetch("/api/compliance/deadlines", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deadlineId, status: newStatus }),
            });
            setDeadlines((prev) =>
                prev.map((d) => (d.id === deadlineId ? { ...d, status: newStatus } : d))
            );
        } catch (e) {
            console.error(e);
        }
    }

    if (isPending || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
                <p className="text-stone-500">Loading compliance data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="font-serif text-xl font-semibold text-stone-900">
                        AICounsel
                    </Link>
                    <nav className="flex items-center gap-4">
                        <Link
                            href="/analyze"
                            className="text-sm font-medium text-stone-600 transition hover:text-stone-900"
                        >
                            Document Analysis
                        </Link>
                        <div className="text-sm font-medium text-stone-900 border-b-2 border-stone-900">
                            Compliance
                        </div>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-12">
                {!business ? (
                    <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
                        <h1 className="font-serif text-2xl font-semibold text-stone-900">
                            Set up your Business Profile
                        </h1>
                        <p className="mt-2 text-sm text-stone-600">
                            We need a few details to build your customized compliance calendar.
                        </p>

                        <form onSubmit={handleSetup} className="mt-6 flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Business Name</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                    placeholder="Acme Corp"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">Entity Type</label>
                                <select
                                    value={entityType}
                                    onChange={(e) => setEntityType(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                >
                                    <option value="LLC">LLC</option>
                                    <option value="C-Corp">C-Corporation</option>
                                    <option value="S-Corp">S-Corporation</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Sole Proprietor">Sole Proprietorship</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">State of Registration</label>
                                <input
                                    required
                                    type="text"
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                    placeholder="e.g. CA, DE, NY"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700">Industry (Optional)</label>
                                <input
                                    type="text"
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                    placeholder="e.g. Tech, Retail"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-4 w-full rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
                            >
                                {saving ? "Setting up..." : "Generate Compliance Calendar"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="font-serif text-3xl font-semibold text-stone-900">
                                    {business.name} Compliance
                                </h1>
                                <p className="mt-2 text-stone-600">
                                    {business.state} {business.entity_type} • Keep track of your filing deadlines.
                                </p>
                            </div>
                            <button
                                onClick={() => alert("Scaffolding: This would trigger the SMS/Email reminder settings modal.")}
                                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
                            >
                                Manage Reminders
                            </button>
                        </div>

                        <div className="mt-8 space-y-4">
                            {deadlines.length === 0 ? (
                                <div className="rounded-xl border border-stone-200 bg-white p-6 text-center text-stone-500">
                                    No deadlines perfectly matching.
                                </div>
                            ) : (
                                deadlines.map((d) => {
                                    const isFiled = d.status === "filed";
                                    const dateObj = new Date(d.due_date);
                                    const isOverdue = !isFiled && dateObj < new Date();

                                    return (
                                        <div
                                            key={d.id}
                                            className={`flex items-start justify-between rounded-xl border p-5 transition ${isFiled
                                                    ? "border-emerald-200 bg-emerald-50/50"
                                                    : isOverdue
                                                        ? "border-red-200 bg-red-50"
                                                        : "border-amber-200 bg-amber-50/30"
                                                }`}
                                        >
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-serif text-lg font-semibold text-stone-900">
                                                        {d.title}
                                                    </h3>
                                                    {isFiled ? (
                                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                                            Filed
                                                        </span>
                                                    ) : isOverdue ? (
                                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                                                            Overdue
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                                            Upcoming
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-stone-700">{d.description}</p>
                                                <p className="mt-3 text-xs font-medium text-stone-500">
                                                    Due Date: <span className="text-stone-900">{dateObj.toLocaleDateString()}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => toggleStatus(d.id, d.status)}
                                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${isFiled
                                                        ? "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50"
                                                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                                                    }`}
                                            >
                                                {isFiled ? "Mark Pending" : "Mark Filed"}
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
