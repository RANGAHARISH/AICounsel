import Link from "next/link";

export const metadata = {
  title: "AICounsel is for Sale | AI Legal-Tech Platform",
  description:
    "AICounsel is an AI legal-tech software project available for acquisition. Contact rajuanna112233@gmail.com for details.",
};

const capabilities = [
  {
    number: "01",
    title: "Document analysis",
    description:
      "An AI-assisted workflow for reviewing uploaded legal documents and presenting key findings.",
  },
  {
    number: "02",
    title: "Compliance workspace",
    description:
      "Business compliance views with summaries and deadline tracking built into the application.",
  },
  {
    number: "03",
    title: "User accounts",
    description:
      "Authentication and account flows are part of the existing Next.js application.",
  },
];

const mailto =
  "mailto:rajuanna112233@gmail.com?subject=AICounsel%20acquisition%20inquiry";

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f5ef] text-charcoal">
      <header className="border-b-2 border-charcoal bg-[#f7f5ef]">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="font-anton text-2xl uppercase tracking-tight sm:text-3xl">
            AICOUNSEL<span className="text-[#d4ad32]">.</span>
          </Link>
          <a
            href={mailto}
            className="border-2 border-charcoal bg-[#ffe17c] px-4 py-2 text-center font-satoshi text-xs font-black uppercase tracking-wider shadow-[3px_3px_0_0_#171e19] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none sm:px-6 sm:text-sm"
          >
            Contact about the sale
          </a>
        </div>
      </header>

      <section className="relative border-b-2 border-charcoal bg-[linear-gradient(135deg,#fbfaf6_0%,#f4efdd_100%)] px-5 py-14 sm:px-8 sm:py-20 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 border-2 border-charcoal bg-[#ffe17c] px-3 py-2 shadow-[3px_3px_0_0_#171e19]">
              <span className="h-2 w-2 bg-charcoal" />
              <span className="font-satoshi text-[10px] font-black uppercase tracking-[0.2em] sm:text-xs">
                Software acquisition opportunity
              </span>
            </div>

            <h1 className="max-w-3xl font-anton text-[clamp(3.25rem,9vw,6.75rem)] leading-[0.92] tracking-tight uppercase">
              A legal AI product.
              <span className="mt-2 block text-charcoal/35">Ready for its next owner.</span>
            </h1>

            <p className="mt-7 max-w-2xl font-satoshi text-base leading-7 text-charcoal/70 sm:text-lg sm:leading-8">
              AICounsel is an AI-assisted legal-tech application with document analysis,
              compliance workflows, and user accounts. The software project is available for
              acquisition and further development.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={mailto}
                className="inline-flex min-h-14 items-center justify-center border-2 border-charcoal bg-charcoal px-7 py-3 text-center font-satoshi text-sm font-black uppercase tracking-[0.12em] text-[#ffe17c] shadow-[5px_5px_0_0_#d4ad32] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              >
                Email the owner
                <span aria-hidden="true" className="ml-3 text-lg">↗</span>
              </a>
              <span className="break-all font-satoshi text-sm font-bold text-charcoal/60">
                rajuanna112233@gmail.com
              </span>
            </div>

            <p className="mt-5 max-w-xl font-satoshi text-xs leading-5 text-charcoal/50">
              Ask for the code, current features, and proposed sale scope. Terms and any transfer
              of intellectual property will be agreed in writing.
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl">
            <div className="border-2 border-charcoal bg-white shadow-[8px_8px_0_0_#171e19] sm:shadow-[12px_12px_0_0_#171e19]">
              <div className="flex items-center justify-between border-b-2 border-charcoal bg-[#dce5df] px-4 py-3 sm:px-5">
                <div className="flex items-center gap-2" aria-hidden="true">
                  <span className="h-3 w-3 border border-charcoal bg-[#ff8b75]" />
                  <span className="h-3 w-3 border border-charcoal bg-[#ffe17c]" />
                  <span className="h-3 w-3 border border-charcoal bg-[#8dc9a5]" />
                </div>
                <span className="font-satoshi text-[9px] font-black uppercase tracking-[0.16em] sm:text-[10px]">
                  AICounsel · product snapshot
                </span>
              </div>

              <div className="p-5 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-satoshi text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/45">
                      Document review
                    </p>
                    <h2 className="mt-2 font-anton text-2xl uppercase sm:text-3xl">
                      Know what to look for.
                    </h2>
                  </div>
                  <span className="border-2 border-charcoal bg-[#ffe17c] px-2.5 py-1 font-satoshi text-[9px] font-black uppercase tracking-widest">
                    AI-assisted
                  </span>
                </div>

                <div className="mt-7 border-2 border-charcoal/15 bg-[#faf9f5] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3 border-b border-charcoal/10 pb-3">
                    <span className="truncate font-satoshi text-xs font-bold sm:text-sm">
                      Commercial lease.pdf
                    </span>
                    <span className="shrink-0 font-satoshi text-[9px] font-black uppercase tracking-wider text-charcoal/45">
                      Example view
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-2 w-full bg-charcoal/10" />
                    <div className="h-2 w-11/12 bg-charcoal/10" />
                    <div className="h-2 w-4/5 bg-charcoal/10" />
                    <div className="my-5 border-l-4 border-[#d4ad32] bg-[#ffe17c]/35 px-3 py-3">
                      <p className="font-satoshi text-[9px] font-black uppercase tracking-widest text-charcoal/50">
                        Review point
                      </p>
                      <p className="mt-1 font-satoshi text-xs leading-5 text-charcoal/75">
                        Surface important clauses and summarize them in clearer language.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="border-2 border-charcoal p-3">
                    <p className="font-satoshi text-[9px] font-black uppercase tracking-widest text-charcoal/45">
                      Application
                    </p>
                    <p className="mt-1 font-anton text-base uppercase sm:text-lg">Next.js</p>
                  </div>
                  <div className="border-2 border-charcoal p-3">
                    <p className="font-satoshi text-[9px] font-black uppercase tracking-widest text-charcoal/45">
                      Product area
                    </p>
                    <p className="mt-1 font-anton text-base uppercase sm:text-lg">Legal tech</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-5 text-center font-satoshi text-[10px] font-bold uppercase tracking-widest text-charcoal/40">
              Illustrative product preview · inquire for a walkthrough
            </p>
          </div>
        </div>
      </section>

      <section id="overview" className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 max-w-2xl">
            <p className="font-satoshi text-[10px] font-black uppercase tracking-[0.24em] text-charcoal/45">
              Inside the product
            </p>
            <h2 className="mt-3 font-anton text-4xl uppercase leading-none sm:text-5xl">
              Built for legal workflows.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {capabilities.map((item) => (
              <article key={item.number} className="border-2 border-charcoal bg-white p-5 sm:p-7">
                <span className="font-anton text-3xl text-[#c5a136]">{item.number}</span>
                <h3 className="mt-7 font-anton text-2xl uppercase">{item.title}</h3>
                <p className="mt-3 font-satoshi text-sm leading-6 text-charcoal/65">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y-2 border-charcoal bg-[#171e19] px-5 py-14 text-white sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="font-satoshi text-[10px] font-black uppercase tracking-[0.24em] text-[#ffe17c]/70">
              Acquisition details
            </p>
            <h2 className="mt-3 font-anton text-4xl uppercase leading-none sm:text-5xl">
              Start a conversation.
            </h2>
          </div>
          <div>
            <p className="max-w-3xl font-satoshi text-sm leading-7 text-white/70 sm:text-base">
              Contact the owner to discuss the existing codebase, a product walkthrough, and what
              may be included in a potential sale. No customer, revenue, domain, or third-party
              service credentials are represented as included; the exact scope and any IP transfer
              must be agreed in writing.
            </p>
            <a
              href={mailto}
              className="mt-7 inline-flex max-w-full items-center gap-3 border-2 border-[#ffe17c] px-4 py-3 font-satoshi text-sm font-black text-[#ffe17c] transition hover:bg-[#ffe17c] hover:text-charcoal sm:px-5"
            >
              <span className="break-all">rajuanna112233@gmail.com</span>
              <span aria-hidden="true" className="shrink-0 text-lg">↗</span>
            </a>
            <p className="mt-4 font-satoshi text-[11px] leading-5 text-white/40">
              AICounsel is software, not a law firm or a substitute for advice from a qualified
              lawyer.
            </p>
          </div>
        </div>
      </section>

      <footer className="px-5 py-7 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 font-satoshi text-xs text-charcoal/50 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-anton text-lg uppercase text-charcoal">
            AICOUNSEL<span className="text-[#c5a136]">.</span>
          </span>
          <span>Software acquisition inquiries</span>
          <a href={mailto} className="font-bold text-charcoal underline underline-offset-4">
            Contact the owner
          </a>
        </div>
      </footer>
    </main>
  );
}
