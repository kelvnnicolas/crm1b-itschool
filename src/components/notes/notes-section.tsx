"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, MoreVertical, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface NotesSectionProps {
  entityType: "contact" | "lead";
  entityId: string;
  initialNotes: {
    id: string;
    content: string;
    created_at: string;
    author: { full_name: string | null } | null;
  }[];
}

export function NotesSection({ entityType, entityId, initialNotes }: NotesSectionProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("entity_type", entityType);
    formData.set("entity_id", entityId);

    setIsSubmitting(true);
    setError(null);

    const response = await fetch("/api/notes", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
    }
  };

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setIsSubmitting(true);
    setError(null);

    const response = await fetch(`/api/notes/${id}`, {
      method: "PATCH",
      body: formData,
    });

    const result = await response.json();
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setEditingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta nota?")) return;

    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (result.error) {
      alert(result.error);
    } else {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Notas ({notes.length})</h3>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Cancelar" : "Adicionar Nota"}
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="space-y-3 mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="content">Nota</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Digite sua nota..."
                required
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {notes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma nota cadastrada
            </p>
          ) : (
            notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                editingId={editingId}
                editContent={editContent}
                setEditingId={setEditingId}
                setEditContent={setEditContent}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NoteCard({
  note,
  editingId,
  editContent,
  setEditingId,
  setEditContent,
  onUpdate,
  onDelete,
}: {
  note: {
    id: string;
    content: string;
    created_at: string;
    author: { full_name: string | null } | null;
  };
  editingId: string | null;
  editContent: string;
  setEditingId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  onUpdate: (id: string, e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const isEditing = editingId === note.id;

  if (isEditing) {
    return (
      <form onSubmit={(e) => onUpdate(note.id, e)} className="space-y-3 p-4 border rounded-lg bg-background">
        <Textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={3}
          className="min-h-[80px]"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(null)}>
            Cancelar
          </Button>
          <Button type="submit" size="sm">
            Salvar
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="whitespace-pre-wrap">{note.content}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {note.author?.full_name || "Usuário desconhecido"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditContent(note.content);
                setEditingId(note.id);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(note.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}