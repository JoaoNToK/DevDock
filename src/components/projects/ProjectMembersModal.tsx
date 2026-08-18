'use client';

import React, { useState, useEffect } from 'react';
import { ProjectRole, ProjectMember } from '@/types/projects';
import {
  getProjectMembersAction,
  inviteProjectMemberAction,
  generateProjectInviteCodeAction,
  updateProjectMemberRoleAction,
  removeProjectMemberAction,
} from '@/app/actions/projectMemberActions';
import { X, Users, UserPlus, Copy, Check, Shield, Trash2, Key, Loader2 } from 'lucide-react';

interface ProjectMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  currentUserRole?: ProjectRole;
}

export const ProjectMembersModal: React.FC<ProjectMembersModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  currentUserRole = 'owner',
}) => {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectRole>('editor');
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchMembers = React.useCallback(async () => {
    setIsLoading(true);
    const res = await getProjectMembersAction(projectId);
    if (res.success && res.members) {
      setMembers(res.members);
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, projectId, fetchMembers]);

  if (!isOpen) return null;

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const res = await inviteProjectMemberAction({ projectId, email, role });
    if (res.success) {
      setSuccessMsg(`Convite enviado com sucesso para ${email}!`);
      setEmail('');
      fetchMembers();
    } else {
      setErrorMsg(res.error || 'Erro ao convidar membro.');
    }
    setIsLoading(false);
  };

  const handleGenerateCode = async () => {
    setErrorMsg(null);
    const res = await generateProjectInviteCodeAction({ projectId, role: 'editor' });
    if (res.success && res.code) {
      setInviteCode(res.code);
    } else {
      setErrorMsg(res.error || 'Erro ao gerar código de convite.');
    }
  };

  const handleCopyInviteLink = () => {
    if (!inviteCode) return;
    const url = `${window.location.origin}/projetos/join?code=${inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRoleChange = async (targetUserId: string, newRole: ProjectRole) => {
    const res = await updateProjectMemberRoleAction({ projectId, targetUserId, newRole });
    if (res.success) {
      fetchMembers();
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    const res = await removeProjectMemberAction({ projectId, targetUserId });
    if (res.success) {
      fetchMembers();
    }
  };

  const isOwner = currentUserRole === 'owner';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg theme-surface border rounded-3xl p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-tertiary-theme hover:text-primary-theme hover:bg-zinc-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-primary-theme">Colaboradores &amp; Permissões RBAC</h3>
            <p className="text-xs text-secondary-theme truncate">Projeto: {projectName}</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            ✅ {successMsg}
          </div>
        )}

        {/* Invite by Email */}
        {isOwner && (
          <form onSubmit={handleInviteUser} className="space-y-3">
            <label className="text-xs font-bold text-secondary-theme flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Convidar por E-mail</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 py-2 px-3.5 rounded-xl theme-surface border text-xs text-primary-theme focus:outline-none"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as ProjectRole)}
                className="py-2 px-3 rounded-xl theme-surface border text-xs text-primary-theme"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Visualizador</option>
              </select>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Convidar'}
              </button>
            </div>
          </form>
        )}

        {/* Invite Code Generator */}
        <div className="pt-2 border-t border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-secondary-theme flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Código de Convite Rápido</span>
            </span>
            <button
              onClick={handleGenerateCode}
              className="text-xs text-indigo-400 hover:underline font-bold"
            >
              Gerar Novo Código
            </button>
          </div>

          {inviteCode && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl theme-card-elevated border">
              <span className="font-mono text-sm font-bold text-amber-400 tracking-wider flex-1">
                {inviteCode}
              </span>
              <button
                onClick={handleCopyInviteLink}
                className="py-1 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Member List */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <h4 className="text-xs font-bold text-secondary-theme">Membros do Projeto ({members.length})</h4>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 rounded-2xl theme-surface border hover:border-zinc-700 transition-all text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {m.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-primary-theme truncate max-w-[160px]">{m.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isOwner && m.role !== 'owner' ? (
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.userId, e.target.value as ProjectRole)}
                      className="py-1 px-2 rounded-lg theme-surface border text-[11px] font-bold text-indigo-400"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Visualizador</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase ${
                        m.role === 'owner'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : m.role === 'editor'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {m.role === 'owner' ? 'Dono' : m.role === 'editor' ? 'Editor' : 'Visualizador'}
                    </span>
                  )}

                  {isOwner && m.role !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(m.userId)}
                      className="p-1 text-tertiary-theme hover:text-red-400 transition-colors"
                      title="Remover Membro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
