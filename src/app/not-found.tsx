import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold mb-2">404 — Página não encontrada</h2>
      <p className="text-zinc-400 mb-6">A página que você procura não existe.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all"
      >
        Voltar ao Inicio
      </Link>
    </main>
  );
}
