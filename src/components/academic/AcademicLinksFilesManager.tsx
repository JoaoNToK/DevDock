'use client';

import React, { useState } from 'react';
import { AcademicLink, AcademicAttachmentFile } from '@/types/academic';
import { Link2, FileText, Plus, Trash2, ExternalLink, Paperclip } from 'lucide-react';

interface AcademicLinksFilesManagerProps {
  subjectId?: string;
  assignmentId?: string;
  links: AcademicLink[];
  files: AcademicAttachmentFile[];
  onAddLink: (link: Omit<AcademicLink, 'id' | 'createdAt'>) => void;
  onDeleteLink: (id: string) => void;
  onAddFile: (file: Omit<AcademicAttachmentFile, 'id' | 'uploadedAt'>) => void;
  onDeleteFile: (id: string) => void;
}

export const AcademicLinksFilesManager: React.FC<AcademicLinksFilesManagerProps> = ({
  subjectId,
  assignmentId,
  links,
  files,
  onAddLink,
  onDeleteLink,
  onAddFile,
  onDeleteFile,
}) => {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');

  const filteredLinks = links.filter((l) => {
    if (assignmentId) return l.assignmentId === assignmentId;
    if (subjectId) return l.subjectId === subjectId;
    return true;
  });

  const filteredFiles = files.filter((f) => {
    if (assignmentId) return f.assignmentId === assignmentId;
    if (subjectId) return f.subjectId === subjectId;
    return true;
  });

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle.trim() || !linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    onAddLink({
      subjectId,
      assignmentId,
      title: linkTitle.trim(),
      url: formattedUrl,
      description: linkDesc.trim() || undefined,
    });

    setLinkTitle('');
    setLinkUrl('');
    setLinkDesc('');
    setIsAddingLink(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onAddFile({
          subjectId,
          assignmentId,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl,
        });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-secondary-theme uppercase flex items-center gap-1.5">
          <Paperclip className="w-3.5 h-3.5" />
          <span>Referências, Links &amp; Arquivos ({filteredLinks.length + filteredFiles.length})</span>
        </h4>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingLink(!isAddingLink)}
            className="py-1 px-2.5 rounded-xl theme-card-elevated border text-xs font-bold text-primary-theme flex items-center gap-1 hover:bg-zinc-800 transition-all"
          >
            <Plus className="w-3 h-3" />
            <span>Link</span>
          </button>

          <label className="py-1 px-2.5 rounded-xl theme-card-elevated border text-xs font-bold text-primary-theme flex items-center gap-1 hover:bg-zinc-800 transition-all cursor-pointer">
            <Plus className="w-3 h-3" />
            <span>Arquivo</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.docx,.pptx,.xlsx,.txt,.png,.jpg,.jpeg"
            />
          </label>
        </div>
      </div>

      {/* Inline Link Form */}
      {isAddingLink && (
        <form onSubmit={handleSaveLink} className="p-3 rounded-2xl theme-surface border space-y-2.5">
          <input
            type="text"
            required
            placeholder="Título (ex: Material Drive, Repositório GitHub)"
            value={linkTitle}
            onChange={(e) => setLinkTitle(e.target.value)}
            className="w-full py-1.5 px-3 rounded-xl theme-surface border text-xs text-primary-theme focus:outline-none"
          />
          <input
            type="url"
            required
            placeholder="URL (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full py-1.5 px-3 rounded-xl theme-surface border text-xs text-primary-theme focus:outline-none"
          />
          <input
            type="text"
            placeholder="Descrição curta (opcional)"
            value={linkDesc}
            onChange={(e) => setLinkDesc(e.target.value)}
            className="w-full py-1.5 px-3 rounded-xl theme-surface border text-xs text-primary-theme focus:outline-none"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingLink(false)}
              className="py-1 px-3 rounded-xl text-xs font-bold text-secondary-theme"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-1 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
            >
              Salvar Link
            </button>
          </div>
        </form>
      )}

      {/* Links & Files List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredLinks.map((link) => (
          <div
            key={link.id}
            className="p-3 rounded-2xl theme-surface border flex items-start justify-between gap-2 group hover:border-zinc-700 transition-all"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <Link2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-primary-theme hover:text-indigo-400 truncate flex items-center gap-1"
                >
                  <span className="truncate">{link.title}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
                {link.description && (
                  <p className="text-[11px] text-secondary-theme truncate">{link.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDeleteLink(link.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-secondary-theme hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {filteredFiles.map((file) => (
          <div
            key={file.id}
            className="p-3 rounded-2xl theme-surface border flex items-start justify-between gap-2 group hover:border-zinc-700 transition-all"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                {file.dataUrl ? (
                  <a
                    href={file.dataUrl}
                    download={file.name}
                    className="text-xs font-bold text-primary-theme hover:text-cyan-400 truncate block"
                  >
                    {file.name}
                  </a>
                ) : (
                  <span className="text-xs font-bold text-primary-theme truncate block">
                    {file.name}
                  </span>
                )}
                <span className="text-[10px] text-secondary-theme font-mono">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            <button
              onClick={() => onDeleteFile(file.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-secondary-theme hover:text-red-400 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {filteredLinks.length === 0 && filteredFiles.length === 0 && !isAddingLink && (
          <p className="text-xs text-secondary-theme col-span-2 py-2 text-center italic">
            Nenhum link ou arquivo anexado.
          </p>
        )}
      </div>
    </div>
  );
};
