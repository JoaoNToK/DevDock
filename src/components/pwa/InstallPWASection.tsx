'use client';

import React from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, CheckCircle2, Smartphone, Monitor, Info } from 'lucide-react';

export const InstallPWASection: React.FC = () => {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();

  return (
    <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 backdrop-blur-xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Instalar o Aplicativo DevDock</h3>
          <p className="text-xs text-zinc-400">Acesse diretamente da área de trabalho ou tela de início</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-indigo-400" />
            <span>Desktop: Windows, Mac, Linux</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Celular: Android &amp; iOS</span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Instale o DevDock para abrir em uma janela independente sem barras do navegador, com carregamento ultrarrápido e suporte completo offline.
        </p>

        {isInstalled ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>O aplicativo DevDock já está instalado neste dispositivo!</span>
          </div>
        ) : canInstall ? (
          <button
            onClick={promptInstall}
            className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Instalar aplicativo agora</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-zinc-300">
              <Info className="w-4 h-4 text-indigo-400" />
              <span>Instalação Manual do Navegador</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              No **Chrome/Edge/Brave**: clique no ícone de instalação <Download className="w-3 h-3 inline text-zinc-300" /> na barra de endereços.
              <br />
              No **iOS (Safari)**: toque no botão **Compartilhar** e selecione **Adicionar à Tela de Início**.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
