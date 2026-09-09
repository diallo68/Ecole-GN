'use client';

import { useRef, useState } from 'react';
import { Paperclip, Loader2, X, FileCheck2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadApi } from '@/lib/api';

export default function FileUploadField({ value, onChange, accept, label = 'Ajouter un fichier' }: {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = async (file: File) => {
    setUploading(true);
    setFileName(file.name);
    try {
      const { url } = await uploadApi.file(file);
      onChange(url);
      toast.success('Fichier envoyé !');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur d'envoi");
      setFileName('');
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    const displayName = fileName || value.split('/').pop() || 'Fichier';
    return (
      <div className="flex items-center gap-2 border border-ink/15 rounded-lg px-3 py-2 text-sm bg-white">
        <FileCheck2 size={15} className="text-brand shrink-0" />
        <a href={value} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-brand hover:underline">{displayName}</a>
        <button type="button" onClick={() => { onChange(''); setFileName(''); }} className="text-ink-muted hover:text-flag shrink-0">
          <X size={15} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-ink/20 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:border-brand hover:text-brand transition-colors disabled:opacity-60">
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
        {uploading ? `Envoi de ${fileName}...` : label}
      </button>
    </div>
  );
}
