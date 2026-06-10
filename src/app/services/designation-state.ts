import { Injectable, signal, computed } from '@angular/core';

export interface DesignationRecord {
  designationId: number;
  departmentId: number;
  designationName: string;
}

const STORAGE_KEY = 'designations';

const SEED: DesignationRecord[] = [
  { designationId: 1, departmentId: 2, designationName: 'Senior Software Engineer' },
  { designationId: 2, departmentId: 1, designationName: 'HR Specialist' },
  { designationId: 3, departmentId: 4, designationName: 'Operations Coordinator' },
];

function loadFromStorage(): DesignationRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  // First time — persist and return seed data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
  return SEED;
}

/** Shared singleton that holds the designation list so Dashboard and Designation page stay in sync. */
@Injectable({ providedIn: 'root' })
export class DesignationStateService {

  private readonly _designations = signal<DesignationRecord[]>(loadFromStorage());

  /** Read-only view of the list. */
  readonly designations = this._designations.asReadonly();

  /** Reactive total count. */
  readonly count = computed(() => this._designations().length);

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._designations()));
  }

  /** Replace the entire list (e.g. after API load). */
  set(list: DesignationRecord[]) {
    this._designations.set(list);
    this.save();
  }

  add(item: DesignationRecord) {
    const nextId = this._designations().reduce((max, d) => Math.max(max, d.designationId), 0) + 1;
    this._designations.update(items => [...items, { ...item, designationId: nextId }]);
    this.save();
  }

  update(updated: DesignationRecord) {
    this._designations.update(items =>
      items.map(d => d.designationId === updated.designationId ? updated : d)
    );
    this.save();
  }

  delete(designationId: number) {
    this._designations.update(items => items.filter(d => d.designationId !== designationId));
    this.save();
  }
}
