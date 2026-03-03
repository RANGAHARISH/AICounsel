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
    highRiskIssues: any[];
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
                    <div className="mx-auto max-w-lg rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
                        <h1 className="font-serif text-2xl font-semibold text-stone-900">
                            ComplianceMasterGPT Setup
                        </h1>
                        <p className="mt-2 text-sm text-stone-600">
                            Provide your business details for a jurisdiction-specific compliance roadmap.
                        </p>

                        <form onSubmit={handleSetup} className="mt-6 flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Business Name</label>
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
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Entity Type</label>
                                    <select
                                        value={entityType}
                                        onChange={(e) => setEntityType(e.target.value)}
                                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                    >
                                        <option value="LLC">LLC</option>
                                        <option value="C-Corp">C-Corporation</option>
                                        <option value="S-Corp">S-Corporation</option>
                                        <option value="Pvt Ltd">Pvt Ltd</option>
                                        <option value="Sole Proprietor">Sole Proprietorship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Country</label>
                                    <select
                                        value={country}
                                        onChange={(e) => setCountry(e.target.value)}
                                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                    >
                                        <option value="US">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="IN">India</option>
                                        <option value="CA">Canada</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">State/Province</label>
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
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Registration Date</label>
                                    <input
                                        type="date"
                                        value={registrationDate}
                                        onChange={(e) => setRegistrationDate(e.target.value)}
                                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Industry</label>
                                    <input
                                        type="text"
                                        value={industry}
                                        onChange={(e) => setIndustry(e.target.value)}
                                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                        placeholder="e.g. Tech, Retail, Healthcare"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">Employees</label>
                                    <input
                                        type="number"
                                        value={employeesCount}
                                        onChange={(e) => setEmployeesCount(parseInt(e.target.value) || 0)}
                                        className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500"
                                    />
                                </div>
                                <div className="flex flex-col gap-2 pt-2">
                                    <label className="flex items-center gap-2 text-sm text-stone-700">
                                        <input type="checkbox" checked={hasContractors} onChange={(e) => setHasContractors(e.target.checked)} />
                                        Uses Contractors
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-stone-700">
                                        <input type="checkbox" checked={collectsPersonalData} onChange={(e) => setCollectsPersonalData(e.target.checked)} />
                                        Collects Personal Data
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-stone-700">
                                        <input type="checkbox" checked={hasPhysicalPremises} onChange={(e) => setHasPhysicalPremises(e.target.checked)} />
                                        Has Physical Premises
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="mt-4 w-full rounded-lg bg-stone-900 px-4 py-3 font-medium text-white transition hover:bg-stone-800 disabled:opacity-50 shadow-lg"
                            >
                                {saving ? "Building Engine..." : "Generate Compliance Roadmap"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="font-serif text-3xl font-semibold text-stone-900">
                                    {business.name}
                                </h1>
                                <p className="mt-2 text-stone-600 flex items-center gap-2">
                                    <span className="rounded bg-stone-100 px-1.5 py-0.5 text-xs font-medium uppercase text-stone-500">{business.entity_type}</span>
                                    <span>{business.state}, {business.country}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setBusiness(null)}
                                    className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
                                >
                                    Edit Profile
                                </button>
                                <button
                                    className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-stone-800"
                                >
                                    Export PDF
                                </button>
                            </div>
                        </div>

                        {/* Health Score Summary */}
                        {summary && (
                            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="col-span-2 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-serif text-xl font-semibold text-stone-900">Executive Summary</h2>
                                        <div className={`flex flex-col items-center rounded-xl px-4 py-3 ${summary.score > 80 ? "bg-emerald-50 text-emerald-700" : summary.score > 50 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                                            }`}>
                                            <span className="text-3xl font-bold">{summary.score}</span>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Health Score</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-stone-700 leading-relaxed italic border-l-4 border-stone-200 pl-4">
                                        "{summary.executiveSummary}"
                                    </p>

                                    {summary.highRiskIssues.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">High Risk Issues</h3>
                                            <div className="mt-2 space-y-2">
                                                {summary.highRiskIssues.map((issue, idx) => (
                                                    <div key={idx} className="flex flex-col rounded-lg bg-red-50 px-4 py-3">
                                                        <span className="text-sm font-bold text-red-900">{issue.title}</span>
                                                        <span className="text-xs text-red-700">{issue.reason}</span>
                                                        {issue.penalty && <span className="mt-1 text-[10px] font-medium text-red-500 uppercase">Penalty: {issue.penalty}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Smart Recommendations</h3>
                                    <ul className="mt-4 space-y-3">
                                        {summary.recommendations.map((rec, idx) => (
                                            <li key={idx} className="flex gap-2 text-sm text-stone-700">
                                                <span className="text-stone-400">•</span>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="mt-12">
                            <h2 className="font-serif text-2xl font-semibold text-stone-900">Required Filings & tasks</h2>
                            <div className="mt-6 space-y-6">
                                {deadlines.length === 0 ? (
                                    <div className="rounded-xl border border-stone-200 bg-white p-12 text-center text-stone-500">
                                        Generating your jurisdiction-specific tasks...
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
                                                className={`group relative flex flex-col rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${isFiled ? "border-emerald-100 opacity-80" : isOverdue ? "border-red-200" : isHigh ? "border-stone-900" : "border-stone-200"
                                                    }`}
                                            >
                                                {isHigh && !isFiled && (
                                                    <div className="absolute -top-3 left-6 rounded-full bg-stone-900 px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                                                        Priority: Critical
                                                    </div>
                                                )}

                                                <div className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3">
                                                                <h3 className="font-serif text-lg font-semibold text-stone-900">
                                                                    {d.title}
                                                                </h3>
                                                                {isFiled ? (
                                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                                                                        Completed
                                                                    </span>
                                                                ) : isOverdue ? (
                                                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 animate-pulse">
                                                                        Past Due
                                                                    </span>
                                                                ) : (
                                                                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
                                                                        Pending
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-2 text-sm text-stone-600 max-w-2xl">{d.description}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Due Date</div>
                                                            <div className={`text-sm font-semibold ${isOverdue ? "text-red-600" : "text-stone-900"}`}>
                                                                {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {!isFiled && (
                                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-stone-100 pt-6">
                                                            <div>
                                                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Step-by-Step Filing Guide</h4>
                                                                <div className="mt-2 flex flex-col gap-2">
                                                                    <div className="flex items-center gap-2 text-xs text-stone-700">
                                                                        <span className="font-semibold">Where to file:</span>
                                                                        {d.filing_url ? (
                                                                            <a href={d.filing_url} target="_blank" rel="noreferrer" className="text-stone-900 underline hover:text-stone-600">
                                                                                Official Portal →
                                                                            </a>
                                                                        ) : (
                                                                            <span>Varies by local office</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-start gap-2 text-xs text-stone-700">
                                                                        <span className="font-semibold shrink-0">Required Docs:</span>
                                                                        <span>{d.required_documents?.join(", ") || "Business identity documents, Financial summaries"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Estimated Costs & Time</h4>
                                                                <div className="mt-2 flex flex-col gap-2 text-xs text-stone-700">
                                                                    <div><span className="font-semibold">Filing Fee:</span> {d.filing_fee || "Varies"}</div>
                                                                    <div><span className="font-semibold">Processing Time:</span> {d.estimated_processing_time || "Varies"}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50/50 px-6 py-4">
                                                    <span className="text-[10px] text-stone-400">
                                                        {d.penalty_description ? `Warning: ${d.penalty_description}` : "Ensure accurate reporting to avoid penalties."}
                                                    </span>
                                                    <button
                                                        onClick={() => toggleStatus(d.id, d.status)}
                                                        className={`rounded-lg px-6 py-1.5 text-xs font-bold transition shadow-sm ${isFiled
                                                            ? "bg-white text-stone-500 border border-stone-200 hover:bg-stone-50"
                                                            : "bg-stone-900 text-white hover:bg-stone-800"
                                                            }`}
                                                    >
                                                        {isFiled ? "Reopen Task" : "Mark as Filed"}
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
