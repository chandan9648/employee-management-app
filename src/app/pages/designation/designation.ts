import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { DesignationStateService, DesignationRecord } from '../../services/designation-state';

interface DepartmentOption {
  departmentId: number;
  departmentName: string;
}

@Component({
  selector: 'app-designation',
  imports: [ReactiveFormsModule],
  templateUrl: './designation.html',
  styleUrl: './designation.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Designation {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly state = inject(DesignationStateService);

  readonly departmentOptions: DepartmentOption[] = [
    { departmentId: 1, departmentName: 'Human Resources' },
    { departmentId: 2, departmentName: 'Engineering' },
    { departmentId: 3, departmentName: 'Finance' },
    { departmentId: 4, departmentName: 'Operations' },
    { departmentId: 5, departmentName: 'Sales' },
  ];

  // Use shared state so the Dashboard KPI reflects changes immediately
  readonly designations = this.state.designations;

  readonly editingId = signal<number | null>(null);
  readonly feedback = signal('Use the form to create and organize designations by department.');

  readonly designationCount = this.state.count;
  readonly departmentCoverage = computed(() => new Set(this.designations().map(item => item.departmentId)).size);
  readonly isEditing = computed(() => this.editingId() !== null);

  readonly designationForm = this.fb.group({
    designationId: 0,
    departmentId: [1, [Validators.required, Validators.min(1)]],
    designationName: ['', [Validators.required, Validators.maxLength(50)]],
  });

  saveDesignation() {
    if (this.designationForm.invalid) {
      this.designationForm.markAllAsTouched();
      this.feedback.set('Please complete the required fields before saving.');
      return;
    }

    const rawValue = this.designationForm.getRawValue();
    const currentId = this.editingId();

    if (currentId !== null) {
      this.state.update({
        designationId: currentId,
        departmentId: rawValue.departmentId,
        designationName: rawValue.designationName.trim(),
      });
      this.feedback.set('Designation updated successfully.');
      this.resetForm();
      return;
    }

    this.state.add({
      designationId: 0, // will be assigned by the service
      departmentId: rawValue.departmentId,
      designationName: rawValue.designationName.trim(),
    });

    this.feedback.set('Designation saved successfully.');
    this.resetForm();
  }

  editDesignation(item: DesignationRecord) {
    this.editingId.set(item.designationId);
    this.designationForm.setValue({
      designationId: item.designationId,
      departmentId: item.departmentId,
      designationName: item.designationName,
    });
    this.feedback.set(`Editing ${item.designationName}.`);
  }

  deleteDesignation(item: DesignationRecord) {
    const shouldDelete = confirm(`Delete designation "${item.designationName}"?`);
    if (!shouldDelete) return;

    this.state.delete(item.designationId);

    if (this.editingId() === item.designationId) {
      this.resetForm();
    }

    this.feedback.set('Designation deleted successfully.');
  }

  resetForm() {
    this.editingId.set(null);
    this.designationForm.reset({
      designationId: 0,
      departmentId: 1,
      designationName: '',
    });
    this.designationForm.markAsPristine();
    this.designationForm.markAsUntouched();
  }

  departmentLabel(departmentId: number) {
    return this.departmentOptions.find(d => d.departmentId === departmentId)?.departmentName ?? `Department ${departmentId}`;
  }

  trackByDesignationId(_: number, item: DesignationRecord) {
    return item.designationId;
  }
}
