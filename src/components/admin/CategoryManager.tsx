"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  deleteCategoryAction,
  reorderCategoriesAction,
  saveCategoryAction,
} from "@/app/admin/(dashboard)/categories/actions";
import type { AdminCategoryOption } from "@/lib/supabase/admin-queries";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type FormValues = { name: string; slug: string; imageUrl: string; isActive: boolean };
const EMPTY_FORM: FormValues = { name: "", slug: "", imageUrl: "", isActive: true };

export function CategoryManager({ categories }: { categories: AdminCategoryOption[] }) {
  const router = useRouter();
  const [items, setItems] = useState(categories);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<FormValues>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  function startEdit(category: AdminCategoryOption) {
    setShowAddForm(false);
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl ?? "",
      isActive: category.isActive,
    });
    setError(null);
  }

  function startAdd() {
    setEditingId(null);
    setShowAddForm(true);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function cancelForm() {
    setEditingId(null);
    setShowAddForm(false);
    setError(null);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    if (editingId) formData.append("categoryId", editingId);
    formData.append("name", form.name);
    formData.append("slug", form.slug);
    formData.append("image_url", form.imageUrl);
    if (form.isActive) formData.append("is_active", "on");

    startTransition(async () => {
      const result = await saveCategoryAction(formData);
      if (result?.error) {
        setError(result.error);
        return;
      }
      cancelForm();
      router.refresh();
    });
  }

  function handleDelete(category: AdminCategoryOption) {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);
      if (result?.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    const reordered = [...items];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    setItems(reordered);
    setDragIndex(null);
    setReordering(true);
    setError(null);

    startTransition(async () => {
      const result = await reorderCategoriesAction(reordered.map((c) => c.id));
      setReordering(false);
      if (result?.error) {
        setError(result.error);
        setItems(categories); // revert to last known-good order from the server
      } else {
        router.refresh();
      }
    });
  }

  const inputClass =
    "w-full rounded-md border border-ink/15 px-3 py-1.5 font-sans text-sm text-ink focus:outline-none focus:ring-1 focus:ring-gold";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-sans text-xs text-ink-soft">
          {reordering ? "Saving new order..." : "Drag rows to reorder — the storefront nav updates instantly."}
        </p>
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-1 rounded-full bg-gold-dark px-4 py-2 font-sans text-sm font-medium text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add Category
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-3 font-sans text-sm text-red-600">
          {error}
        </p>
      )}

      {showAddForm && (
        <CategoryFormRow
          form={form}
          setForm={setForm}
          isEditing={false}
          onSubmit={handleSave}
          onCancel={cancelForm}
          isPending={isPending}
          inputClass={inputClass}
          submitLabel="Add"
        />
      )}

      <ul className="divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
        {items.map((category, index) =>
          editingId === category.id ? (
            <li key={category.id} className="p-4">
              <CategoryFormRow
                form={form}
                setForm={setForm}
                isEditing
                onSubmit={handleSave}
                onCancel={cancelForm}
                isPending={isPending}
                inputClass={inputClass}
                submitLabel="Save"
              />
            </li>
          ) : (
            <li
              key={category.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`flex items-center gap-3 px-4 py-3 ${dragIndex === index ? "opacity-40" : ""}`}
            >
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-soft" aria-hidden="true" />
              <span className="flex-1 font-sans text-sm text-ink">
                {category.name}
                {!category.isActive && (
                  <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink-soft">Hidden</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => startEdit(category)}
                aria-label={`Edit ${category.name}`}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5 hover:text-gold"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category)}
                aria-label={`Delete ${category.name}`}
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function CategoryFormRow({
  form,
  setForm,
  isEditing,
  onSubmit,
  onCancel,
  isPending,
  inputClass,
  submitLabel,
}: {
  form: FormValues;
  setForm: (form: FormValues) => void;
  isEditing: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isPending: boolean;
  inputClass: string;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} noValidate className="mb-4 grid gap-3 rounded-lg border border-ink/10 bg-white p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => {
            const name = e.target.value;
            // Slug is never shown in the UI — auto-derived from the name
            // on create, and left untouched on edit so existing category
            // URLs don't silently change when an admin just tweaks the name.
            setForm({ ...form, name, slug: isEditing ? form.slug : slugify(name) });
          }}
          className={inputClass}
        />
      </div>
      <div className="sm:col-span-2">
        <label className="mb-1 block font-sans text-xs uppercase tracking-wide text-ink-soft">
          Image URL (optional)
        </label>
        <input
          type="text"
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="flex items-center justify-between sm:col-span-2">
        <label className="flex items-center gap-2 font-sans text-sm text-ink">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-ink/30"
          />
          Visible on storefront
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-ink-soft hover:bg-ink/5"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-gold-dark px-4 py-1.5 font-sans text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Saving..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
