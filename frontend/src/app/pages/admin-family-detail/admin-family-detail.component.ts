import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface FamilyRecord {
  _id: string;
  name: string;
  slug: string;
  privacy: string;
}

interface PersonRecord {
  _id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  gender: string;
  isLiving: boolean;
}

interface RelationshipRecord {
  _id: string;
  type: string;
  fromPersonId: string;
  toPersonId: string;
}

@Component({
  selector: 'app-admin-family-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="container">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Family management</p>
            <h1>{{ family?.name || 'Family' }}</h1>
          </div>
          <a class="button secondary" routerLink="/admin/families">Back</a>
        </div>

        <div *ngIf="loading" class="card section">Loading family details...</div>
        <div *ngIf="error" class="card section error">{{ error }}</div>

        <div *ngIf="family" class="grid grid-2">
          <div class="card section">
            <h2>Add family member</h2>
            <form [formGroup]="memberForm" (ngSubmit)="submitMember()">
              <div class="form-row">
                <label for="firstName">First name</label>
                <input id="firstName" formControlName="firstName" />
              </div>
              <div class="form-row">
                <label for="lastName">Last name</label>
                <input id="lastName" formControlName="lastName" />
              </div>
              <div class="form-row">
                <label for="gender">Gender</label>
                <select id="gender" formControlName="gender">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
              <button class="button primary" type="submit" [disabled]="memberForm.invalid || savingMember">
                {{ savingMember ? 'Saving...' : 'Add person' }}
              </button>
            </form>
          </div>

          <div class="card section">
            <h2>Create relationship</h2>
            <form [formGroup]="relationshipForm" (ngSubmit)="submitRelationship()">
              <div class="form-row">
                <label for="fromPersonId">From</label>
                <select id="fromPersonId" formControlName="fromPersonId">
                  <option value="">Select person</option>
                  <option *ngFor="let person of people" [value]="person._id">{{ person.displayName || person.firstName + ' ' + person.lastName }}</option>
                </select>
              </div>
              <div class="form-row">
                <label for="toPersonId">To</label>
                <select id="toPersonId" formControlName="toPersonId">
                  <option value="">Select person</option>
                  <option *ngFor="let person of people" [value]="person._id">{{ person.displayName || person.firstName + ' ' + person.lastName }}</option>
                </select>
              </div>
              <div class="form-row">
                <label for="type">Type</label>
                <select id="type" formControlName="type">
                  <option value="PARENT_CHILD">Parent → Child</option>
                  <option value="SPOUSE">Spouse</option>
                </select>
              </div>
              <button class="button primary" type="submit" [disabled]="relationshipForm.invalid || savingRelationship">
                {{ savingRelationship ? 'Saving...' : 'Create relationship' }}
              </button>
            </form>
            <div *ngIf="relationshipMessage" class="success">{{ relationshipMessage }}</div>
          </div>
        </div>

        <div *ngIf="family" class="grid grid-2" style="margin-top: 1.5rem;">
          <div class="card section">
            <h2>Members</h2>
            <ul class="list" *ngIf="people.length; else noPeople">
              <li *ngFor="let person of people">
                <strong>{{ person.displayName || person.firstName + ' ' + person.lastName }}</strong>
                <small>{{ person.gender }} • {{ person.isLiving ? 'Living' : 'Deceased' }}</small>
              </li>
            </ul>
            <ng-template #noPeople>
              <p>No family members added yet.</p>
            </ng-template>
          </div>

          <div class="card section">
            <h2>Relationships</h2>
            <ul class="list" *ngIf="relationships.length; else noRelationships">
              <li *ngFor="let item of relationships">
                <strong>{{ item.type }}</strong>
                <small>{{ item.fromPersonId }} → {{ item.toPersonId }}</small>
              </li>
            </ul>
            <ng-template #noRelationships>
              <p>No relationships recorded.</p>
            </ng-template>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    '.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }',
    '.eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: #5b5b57; font-size: 0.7rem; margin-bottom: 0.5rem; }',
    '.section { padding: 1.2rem; }',
    '.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.8rem; }',
    '.list li { border-bottom: 1px solid #efebe5; padding-bottom: 0.55rem; }',
    '.list small { display: block; color: #5b5b57; margin-top: 0.2rem; }',
    '.error { color: #a64343; }',
    '.success { color: #335339; margin-top: 1rem; }'
  ],
})
export class AdminFamilyDetailComponent implements OnInit {
  family: FamilyRecord | null = null;
  people: PersonRecord[] = [];
  relationships: RelationshipRecord[] = [];
  loading = true;
  error = '';
  savingMember = false;
  savingRelationship = false;
  relationshipMessage = '';

  memberForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: [''],
    gender: ['UNKNOWN' as 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN', Validators.required],
  });

  relationshipForm = this.fb.nonNullable.group({
    fromPersonId: ['', Validators.required],
    toPersonId: ['', Validators.required],
    type: ['PARENT_CHILD' as 'PARENT_CHILD' | 'SPOUSE', Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAuthenticated()) return;

    const familyId = this.route.snapshot.paramMap.get('id');
    if (!familyId) {
      this.error = 'Family not found.';
      this.loading = false;
      return;
    }

    this.loadFamily(familyId);
  }

  submitMember(): void {
    if (!this.family || this.memberForm.invalid) return;
    this.savingMember = true;
    this.api.post<{ success: boolean; data: PersonRecord }>(`/admin/families/${this.family._id}/members`, this.memberForm.getRawValue()).subscribe({
      next: () => {
        this.memberForm.reset({ firstName: '', lastName: '', gender: 'UNKNOWN' });
        this.savingMember = false;
        this.loadFamily(this.family!._id);
      },
      error: () => {
        this.error = 'Unable to add this person.';
        this.savingMember = false;
      },
    });
  }

  submitRelationship(): void {
    if (!this.family || this.relationshipForm.invalid) return;
    this.savingRelationship = true;
    this.relationshipMessage = '';

    const payload = {
      ...this.relationshipForm.getRawValue(),
      familyTreeId: this.family._id,
    };

    this.api.post<{ success: boolean; data: RelationshipRecord }>('/admin/relationships', payload).subscribe({
      next: () => {
        this.relationshipMessage = 'Relationship created.';
        this.relationshipForm.reset({ fromPersonId: '', toPersonId: '', type: 'PARENT_CHILD' });
        this.savingRelationship = false;
        this.loadFamily(this.family!._id);
      },
      error: (error) => {
        const message = error?.error?.error?.message ?? 'Unable to create relationship.';
        this.error = message;
        this.savingRelationship = false;
      },
    });
  }

  private loadFamily(familyId: string): void {
    this.api.get<{ success: boolean; data: FamilyRecord }>(`/admin/families/${familyId}`).subscribe({
      next: (response) => {
        this.family = response.data ?? null;
        return this.loadDetails(familyId);
      },
      error: () => {
        this.error = 'Unable to load this family.';
        this.loading = false;
      },
    });
  }

  private loadDetails(familyId: string): void {
    this.api.get<{ success: boolean; data: PersonRecord[] }>(`/admin/families/${familyId}/members`).subscribe({
      next: (response) => {
        this.people = response.data ?? [];
        this.api.get<{ success: boolean; data: RelationshipRecord[] }>(`/admin/families/${familyId}/relationships`).subscribe({
          next: (relationshipResponse) => {
            this.relationships = relationshipResponse.data ?? [];
            this.loading = false;
          },
          error: () => {
            this.error = 'Unable to load family relationships.';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.error = 'Unable to load family members.';
        this.loading = false;
      },
    });
  }
}
