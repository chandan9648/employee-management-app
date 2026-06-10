import { Injectable, signal, computed } from '@angular/core';

export interface DesignationRecord {
  designationId: number;
  departmentId: number;
  designationName: string;
}

/** Shared singleton that holds the designation list so Dashboard and Designation page stay in sync. */
@Injectable({ providedIn: 'root' })
export class DesignationStateService {

  private readonly _designations = signal<DesignationRecord[]>([
    { designationId: 1, departmentId: 2, designationName: 'Senior Software Engineer' },
    { designationId: 2, departmentId: 1, designationName: 'HR Specialist' },
    { designationId: 3, departmentId: 4, designationName: 'Operations Coordinator' },
  ]);

  /** Read-only view of the list. */
  readonly designations = this._designations.asReadonly();

  /** Reactive total count. */
  readonly count = computed(() => this._designations().length);

  /** Replace the entire list (e.g. after API load). */
  set(list: DesignationRecord[]) {
    this._designations.set(list);
  }

  add(item: DesignationRecord) {
    const nextId = this._designations().reduce((max, d) => Math.max(max, d.designationId), 0) + 1;
    this._designations.update(items => [...items, { ...item, designationId: nextId }]);
  }

  update(updated: DesignationRecord) {
    this._designations.update(items =>
      items.map(d => d.designationId === updated.designationId ? updated : d)
    );
  }

  delete(designationId: number) {
    this._designations.update(items => items.filter(d => d.designationId !== designationId));
  }
}
