export const metadata = {
  title: "AICounsel Website for Sale",
  description: "The AICounsel website is for sale. Contact rajuanna112233@gmail.com.",
};

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-5 py-12 text-charcoal">
      <section className="w-full max-w-xl border-2 border-charcoal bg-white p-7 shadow-[8px_8px_0_0_#171e19] sm:p-12">
        <p className="font-satoshi text-xs font-black uppercase tracking-[0.22em] text-charcoal/50">
          AICounsel
        </p>
        <h1 className="mt-5 font-anton text-5xl uppercase leading-[0.95] sm:text-7xl">
          Website for sale
        </h1>
        <p className="mt-5 max-w-md font-satoshi text-base leading-7 text-charcoal/70 sm:text-lg">
          Interested in buying the AICounsel website? Contact me for details.
        </p>
        <a
          href="https://mail.google.com/mail/?view=cm&fs=1&to=rajuanna112233%40gmail.com&su=AICounsel%20website%20for%20sale"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex min-h-12 max-w-full items-center border-2 border-charcoal bg-[#ffe17c] px-5 py-3 font-satoshi text-sm font-black transition hover:bg-charcoal hover:text-[#ffe17c]"
        >
          <span className="break-all">rajuanna112233@gmail.com</span>
        </a>
      </section>
    </main>
  );
}
