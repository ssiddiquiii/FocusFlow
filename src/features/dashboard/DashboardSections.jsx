import React from 'react';
import { Loader2 } from 'lucide-react';
import Dialog from '../../components/ui/Dialog';

export function DeleteCourseDialog({ course, isDeleting, onCancel, onConfirm }) {
  return (
    <Dialog 
      isOpen={Boolean(course)} 
      onClose={onCancel} 
      titleId="delete-course-title" 
      closeOnBackdrop={!isDeleting} 
      closeOnEscape={!isDeleting} 
      className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl sm:p-6"
    >
      <h2 id="delete-course-title" className="text-lg font-bold text-foreground">Delete this local course?</h2>
      <p className="mt-3 break-words text-sm text-muted-foreground leading-relaxed">
        Deleting <strong className="text-foreground">{course?.title}</strong> permanently removes its local course, lessons, video progress, timestamped notes, and course-linked practice history from this device.
      </p>
      <p className="mt-2 text-xs text-muted-foreground/75 leading-relaxed">This does not affect the original YouTube playlist. The action cannot be undone.</p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={isDeleting} 
          className="min-h-11 rounded-xl border border-border bg-muted/40 hover:bg-muted px-4 text-sm font-semibold text-foreground transition cursor-pointer"
        >
          Keep Course
        </button>
        <button 
          type="button" 
          onClick={onConfirm} 
          disabled={isDeleting} 
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-destructive hover:bg-destructive/90 px-4 text-sm font-semibold text-destructive-foreground transition cursor-pointer disabled:opacity-60"
        >
          {isDeleting && <Loader2 size={16} className="animate-spin" />}
          {isDeleting ? 'Deleting...' : 'Delete Local Course'}
        </button>
      </div>
    </Dialog>
  );
}
