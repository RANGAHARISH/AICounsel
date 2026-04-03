"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Business = {
    id: string;
    name: string;
    entity_type: string;
    country: string;
    state: string;
    industry: string;
    employees_count: number;
    has_contractors: boolean;
    collects_personal_data: boolean;
    has_physical_premises: boolean;
    registration_date: string;
};

type Deadline = {
    id: string;
    title: string;
    description: string;
    due_date: string;
    status: string;
    category: string;
    priority_level: string;
    filing_url: string;
    required_documents: string[];
    estimated_processing_time: string;
    filing_fee: string;
    penalty_description: string;
};

type Summary = {
    score: number;
    executiveSummary: string;
    highRiskIssues: { title: string; severity: string; reason: string; penalty?: string }[];
    recommendations: string[];
};

export default function CompliancePage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [business, setBusiness] = useState<Business | null>(null);
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [entityType, setEntityType] = useState("LLC");
    const [country, setCountry] = useState("US");
    const [stateName, setStateName] = useState("CA");
    const [industry, setIndustry] = useState("");
    const [employeesCount, setEmployeesCount] = useState(0);
    const [hasContractors, setHasContractors] = useState(false);
    const [collectsPersonalData, setCollectsPersonalData] = useState(false);
    const [hasPhysicalPremises, setHasPhysicalPremises] = useState(false);
    const [registrationDate, setRegistrationDate] = useState("");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const res = await fetch("/api/compliance/business");
                const data = await res.json();
                if (data.business) {
                    setBusiness(data.business);
                    const b = data.business;
                    setName(b.name);
                    setEntityType(b.entity_type);
                    setCountry(b.country);
                    setStateName(b.state);
                    setIndustry(b.industry || "");
                    setEmployeesCount(b.employees_count);
                    setHasContractors(b.has_contractors);
                    setCollectsPersonalData(b.collects_personal_data);
                    setHasPhysicalPremises(b.has_physical_premises);
                    setRegistrationDate(b.registration_date ? b.registration_date.split('T')[0] : "");

                    await Promise.all([
                        fetchDeadlines(data.business.id),
                        fetchSummary()
                    ]);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        if (!isPending && !session?.user) {
            router.replace("/login");
            return;
        }

        if (session?.user) {
            fetchData();
        }
    }, [session, isPending, router]);

    async function fetchSummary() {
        try {
            const res = await fetch("/api/compliance/summary");
            const data = await res.json();
            setSummary(data);
        } catch (e) {
            console.error(e);
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
                body: JSON.stringify({
                    name,
                    entity_type: entityType,
                    state: stateName,
                    industry,
                    country,
                    employees_count: employeesCount,
                    has_contractors: hasContractors,
                    collects_personal_data: collectsPersonalData,
                    has_physical_premises: hasPhysicalPremises,
                    registration_date: registrationDate || null
                }),
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
                await Promise.all([
                    fetchDeadlines(data.business.id),
                    fetchSummary()
                ]);
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
            await fetchSummary();
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
            <header className="border-b border-charcoal/5 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/" className="font-anton text-2xl uppercase tracking-tighter text-charcoal flex items-baseline">
                        AICOUNSEL<span className="text-golden">.</span>
                    </Link>
                    <nav className="flex items-center gap-8">
                        <Link
                            href="/analyze"
                            className="font-satoshi text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-colors"
                        >
                            Analysis
                        </Link>
                        <div className="font-satoshi text-xs font-black uppercase tracking-widest text-charcoal border-b-2 border-charcoal pb-1">
                            Compliance
                        </div>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-6 py-16">
                {!business ? (
                    <div className="mx-auto max-w-lg rounded-3xl border-2 border-charcoal/5 bg-white p-8 shadow-xl">
                        <div className="mb-8">
                            <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/40 mb-2 block">Configuration Protocol</span>
                            <h1 className="font-anton text-4xl uppercase text-charcoal leading-none">Setup Profile</h1>
                            <p className="mt-2 text-sm text-charcoal/60 font-satoshi">
                                Initialize your jurisdiction-specific compliance roadmap.
                            </p>
                        </div>

                        <form onSubmit={handleSetup} className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-2">Business Designation</label>
                                    <input
                                        required
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all"
                                        placeholder="Acme Corp"
                                    />
                                </div>
                                <div className="relative group/select">
                                    <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-2">Entity Type</label>
                                    <select
                                        value={entityType}
                                        onChange={(e) => setEntityType(e.target.value)}
                                        className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="LLC">LLC</option>
                                        <option value="C-Corp">C-Corporation</option>
                                        <option value="S-Corp">S-Corporation</option>
                                        <option value="Pvt Ltd">Pvt Ltd</option>
                                        <option value="Sole Proprietor">Sole Proprietorship</option>
                                    </select>
                                    <div className="absolute right-4 bottom-3.5 pointer-events-none text-charcoal/30 group-hover/select:text-charcoal transition-colors">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>
                                <div className="relative group/select">
                                    <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-2">Jurisdiction</label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="US">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="IN">India</option>
                                        <option value="CA">Canada</option>
                                    </select>
                                    <div className="absolute right-4 bottom-3.5 pointer-events-none text-charcoal/30 group-hover/select:text-charcoal transition-colors">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-2">State/Province</label>
                                    <input
                                        required
                                        type="text"
                                        value={stateName}
                                        onChange={(e) => setStateName(e.target.value)}
                                        className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all"
                                        placeholder="e.g. CA, DE, NY"
                                    />
                                </div>
                                <div>
                                    <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-2">Reg. Date</label>
                                    <input
                                        type="date"
                                        value={registrationDate}
                                        onChange={(e) => setRegistrationDate(e.target.value)}
                                        className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-2">Industry Sector</label>
                                    <input
                                        type="text"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all"
                                        placeholder="e.g. Tech, Retail, Healthcare"
                                    />
                                </div>
                                <div>
                                    <label className="block font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/40 mb-2">Capacity</label>
                                    <input
                                        type="number"
                                        value={employeesCount}
                                        onChange={(e) => setEmployeesCount(parseInt(e.target.value) || 0)}
                                        className="w-full bg-charcoal/5 rounded-xl border-none px-4 py-3 font-satoshi text-sm focus:ring-2 focus:ring-golden outline-none transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <label className="flex items-center gap-2 font-satoshi text-[10px] font-black uppercase tracking-widest text-charcoal/60 cursor-pointer">
                                        <input type="checkbox" checked={hasContractors} onChange={(e) => setHasContractors(e.target.checked)} className="accent-golden" />
                                        Contractors
                                    </label>
                                    <label className="flex items-center gap-2 font-satoshi text-[10px] font-black uppercase tracking-widest text-charcoal/60 cursor-pointer">
                                        <input type="checkbox" checked={collectsPersonalData} onChange={(e) => setCollectsPersonalData(e.target.checked)} className="accent-golden" />
                                        Personal Data
                                    </label>
                                    <label className="flex items-center gap-2 font-satoshi text-[10px] font-black uppercase tracking-widest text-charcoal/60 cursor-pointer">
                                        <input type="checkbox" checked={hasPhysicalPremises} onChange={(e) => setHasPhysicalPremises(e.target.checked)} className="accent-golden" />
                                        Premises
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-golden text-charcoal font-anton text-2xl px-10 py-5 rounded-2xl hover:scale-[1.02] hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 shadow-xl"
                            >
                                {saving ? "INITIALIZING…" : "GENERATE ROADMAP"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-12">
                            <div>
                                <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/40 mb-2 block">Enterprise Profile</span>
                                <h1 className="font-anton text-5xl md:text-6xl uppercase text-charcoal leading-none">
                                    {business.name}
                                </h1>
                                <p className="mt-4 font-satoshi text-charcoal/60 flex items-center gap-3">
                                    <span className="bg-charcoal text-golden px-2 py-0.5 text-[10px] font-black uppercase tracking-widest">{business.entity_type}</span>
                                    <span className="uppercase tracking-widest text-xs font-bold">{business.state}, {business.country}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setBusiness(null)}
                                    className="font-satoshi text-[10px] font-black uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-all border-b border-charcoal/10"
                                >
                                    Modify Profile
                                </button>
                                <button
                                    className="bg-charcoal text-white px-6 py-3 rounded-full font-satoshi text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all"
                                >
                                    Export Intelligence
                                </button>
                            </div>
                        </div>

                        {/* Health Score Summary */}
                        {summary && (
                            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="col-span-2 rounded-3xl border-2 border-charcoal/5 bg-white p-10 shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-charcoal"></div>
                                    <div className="flex items-start justify-between mb-8">
                                        <div>
                                            <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.4em] text-charcoal/40 mb-2 block">Executive Directives</span>
                                            <h2 className="font-anton text-3xl uppercase text-charcoal">Operational Health</h2>
                                        </div>
                                        <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-3xl rotate-3 shadow-2xl ${summary.score > 80 ? "bg-emerald-500 text-white" : summary.score > 50 ? "bg-golden text-charcoal" : "bg-red-500 text-white"
                                            }`}>
                                            <span className="font-anton text-4xl leading-none">{summary.score}</span>
                                            <span className="font-satoshi text-[8px] font-black uppercase tracking-tighter">SCORE</span>
                                        </div>
                                    </div>

                                    <p className="font-satoshi text-xl text-charcoal/80 leading-relaxed italic border-l-4 border-golden pl-8 py-2 mb-8">
                                        &quot;{summary.executiveSummary}&quot;
                                    </p>

                                    {summary.highRiskIssues.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-anton text-sm uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                                                Critical Risk Vectors
                                                <span className="flex-1 h-[1px] bg-red-100"></span>
                                            </h3>
                                            <div className="grid gap-3">
                                                {summary.highRiskIssues.map((issue, idx) => (
                                                    <div key={idx} className="flex flex-col rounded-2xl bg-red-50 border border-red-100 p-6 group hover:bg-white hover:shadow-lg transition-all">
                                                        <span className="font-anton text-lg text-red-900 uppercase">{issue.title}</span>
                                                        <span className="font-satoshi text-sm text-red-700/80 leading-relaxed mt-1">{issue.reason}</span>
                                                        {issue.penalty && <span className="mt-4 font-satoshi text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-100/50 px-2 py-1 self-start rounded">Penalty: {issue.penalty}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-3xl bg-charcoal p-10 text-white shadow-2xl flex flex-col justify-between group">
                                    <div>
                                        <h3 className="font-anton text-sm uppercase tracking-widest text-golden mb-8">Recommendations</h3>
                                        <ul className="space-y-6">
                                            {summary.recommendations.map((rec, idx) => (
                                                <li key={idx} className="flex gap-4 text-sm font-satoshi leading-relaxed group-hover:text-sage transition-colors">
                                                    <span className="text-golden shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-golden shadow-[0_0_10px_rgba(255,225,124,0.5)]"></span>
                                                    {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-8 pt-8 border-t border-white/10 opacity-40">
                                        <span className="font-satoshi text-[8px] font-black uppercase tracking-[0.4em]">AI DRIVEN PROTOCOL v4.2</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-20">
                            <h2 className="font-anton text-4xl uppercase text-charcoal mb-8 flex items-center gap-4">
                                Regulatory <span className="text-golden">Roadmap</span>
                                <span className="flex-1 h-[2px] bg-charcoal/5"></span>
                            </h2>
                            <div className="mt-10 space-y-8">
                                {deadlines.length === 0 ? (
                                    <div className="rounded-3xl border-2 border-dashed border-charcoal/10 bg-charcoal/[0.02] p-20 text-center">
                                        <p className="font-anton text-charcoal/20 uppercase text-3xl">Initializing Benchmarks...</p>
                                    </div>
                                ) : (
                                    deadlines.map((d) => {
                                        const isFiled = d.status === "filed";
                                        const dateObj = new Date(d.due_date);
                                        const isOverdue = !isFiled && dateObj < new Date();
                                        const isHigh = d.priority_level === "High";

                                        return (
                                            <div
                                                key={d.id}
                                                className={`group relative flex flex-col rounded-3xl border-2 bg-white shadow-xl transition-all hover:translate-y-[-4px] ${isFiled ? "border-emerald-100 opacity-60 grayscale" : isOverdue ? "border-red-200" : isHigh ? "border-charcoal shadow-2xl" : "border-charcoal/5"
                                                    }`}
                                            >
                                                {isHigh && !isFiled && (
                                                    <div className="absolute -top-4 left-10 rounded-full bg-red-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg animate-pulse">
                                                        CRITICAL BENCHMARK
                                                    </div>
                                                )}

                                                <div className="p-8">
                                                    <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8 border-b border-charcoal/5 pb-8">
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                                                <h3 className="font-anton text-2xl uppercase text-charcoal">
                                                                    {d.title}
                                                                </h3>
                                                                {isFiled ? (
                                                                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                                                                        VERIFIED
                                                                    </span>
                                                                ) : isOverdue ? (
                                                                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md animate-bounce">
                                                                        OVERDUE
                                                                    </span>
                                                                ) : (
                                                                    <span className="bg-charcoal text-golden px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">
                                                                        PENDING
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="font-satoshi text-charcoal/60 leading-relaxed max-w-2xl">{d.description}</p>
                                                        </div>
                                                        <div className="text-left md:text-right shrink-0">
                                                            <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/30 mb-1 block">Due Date</span>
                                                            <div className={`font-anton text-2xl uppercase ${isOverdue ? "text-red-600" : "text-charcoal"}`}>
                                                                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!isFiled && (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                            <div>
                                                                <h4 className="font-anton text-[10px] uppercase tracking-widest text-charcoal/40 mb-4">Filing Logistics</h4>
                                                                <div className="space-y-4">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-satoshi text-[8px] font-extrabold uppercase text-charcoal/30">Official Portal</span>
                                                                        {d.filing_url ? (
                                                                            <a href={d.filing_url} target="_blank" rel="noreferrer" className="font-anton text-xs uppercase text-charcoal hover:text-golden transition-colors border-b border-charcoal/10 self-start">
                                                                                ACCESS LINK →
                                                                            </a>
                                                                        ) : (
                                                                            <span className="font-satoshi text-xs font-bold text-charcoal/70">LOCAL OFFICE FILING REQUIRED</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-satoshi text-[8px] font-extrabold uppercase text-charcoal/30">Required Artifacts</span>
                                                                        <span className="font-satoshi text-xs font-bold text-charcoal/70 leading-relaxed uppercase tracking-tighter">{d.required_documents?.join(", ") || "ENTITY IDENTITY, FINANCIAL REPORTS"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-anton text-[10px] uppercase tracking-widest text-charcoal/40 mb-4">Risk Matrix</h4>
                                                                <div className="space-y-4">
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-satoshi text-[8px] font-extrabold uppercase text-charcoal/30">Filing Fee</span>
                                                                        <span className="font-anton text-xs uppercase text-charcoal">{d.filing_fee || "CALCULATING..."}</span>
                                                                    </div>
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className="font-satoshi text-[8px] font-extrabold uppercase text-charcoal/30">Processing Latency</span>
                                                                        <span className="font-anton text-xs uppercase text-charcoal">{d.estimated_processing_time || "VARIABLE"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between border-t border-charcoal/5 bg-charcoal/[0.02] px-8 py-5 rounded-b-3xl">
                                                    <span className="font-satoshi text-[8px] font-black uppercase tracking-[0.2em] text-charcoal/30 max-w-[50%]">
                                                        {d.penalty_description ? `WARNING: ${d.penalty_description}` : "MAINTAIN PROTOCOL TO AVOID LIQUIDATED DAMAGES."}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleStatus(d.id, d.status)}
                                                        className={`px-8 py-3 rounded-xl font-anton text-xs uppercase tracking-widest transition-all shadow-md group-hover:scale-105 ${isFiled
                                                            ? "bg-white text-charcoal/40 border border-charcoal/10"
                                                            : "bg-charcoal text-white hover:bg-golden hover:text-charcoal"
                                                            }`}
                                                    >
                                                        {isFiled ? "REOPEN PROTOCOL" : "VERIFY FILING"}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

