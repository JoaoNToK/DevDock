'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { joinProjectByInviteCodeAction } from '@/app/actions/projectMemberActions';
import { Key, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

function JoinProjectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get('code') || '';

  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const res = await joinProjectByInviteCodeAction({ code });
    if (res.success && res.projectId) {
      setSuccessMsg(`Você entrou no projeto "${res.projectName || 'DevDock'}" com sucesso! Redirecting...`);
      setTimeout(() => {
        router.push(`/projetos/${res.projectId}`);
      }, 1500);
    } else {
      setErrorMsg(res.error || 'Código de convite inválido.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
    }
  }, [initialCode]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md theme-surface border rounded-3xl p-8 space-y-6 shadow-xl text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
          <Key className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-primary-theme">Ingressar em um Projeto</h2>
          <p className="text-xs text-secondary-theme mt-1">
            Digite o código de convite fornecido pelo proprietário do projeto
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Ex: DEV89X"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full py-3 px-4 rounded-2xl theme-surface border text-center font-mono text-lg tracking-widest text-primary-theme uppercase focus:outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className="w-full btn-primary py-3 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Entrar no Projeto</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function JoinProjectPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="p-8 text-center text-xs text-secondary-theme">Carregando...</div>}>
        <JoinProjectContent />
      </Suspense>
    </MainLayout>
  );
}
