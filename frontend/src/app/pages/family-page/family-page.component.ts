import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface FamilyResponse {
  family: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    privacy: string;
    rootPersonId?: string;
  };
  members: number;
}

interface PersonRecord {
  _id: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  preferredName?: string;
  gender?: string;
  isLiving?: boolean;
  dateOfBirth?: string;
  dateOfDeath?: string;
  occupation?: string;
  biography?: string;
  birthPlace?: string;
  currentLocation?: string;
}

interface RelationshipRecord {
  _id: string;
  type: string;
  fromPersonId: string;
  toPersonId: string;
}

interface TreeResponse {
  people: PersonRecord[];
  relationships: RelationshipRecord[];
}

interface TimelineRecord {
  _id: string;
  type: string;
  title: string;
  description?: string;
  eventDate?: string;
  personId?: string;
}

interface RelationshipLookupResponse {
  relationship: string;
}

@Component({
  selector: 'app-family-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <section class="page">
      <div class="container">
        <div *ngIf="loading" class="card section">Loading family...</div>
        <div *ngIf="!loading && !family" class="card section error">Family not found.</div>

        <ng-container *ngIf="family">
          <header class="family-header card section">
            <div>
              <p class="eyebrow">{{ family.privacy }} family</p>
              <h1>{{ family.name }}</h1>
              <p>{{ family.description || 'A warm family story spanning generations.' }}</p>
            </div>
            <div class="stat-badges">
              <span>{{ memberCount }} members</span>
              <span>{{ relationships.length }} relationships</span>
            </div>
          </header>

          <nav class="tabs" aria-label="Family navigation">
            <button type="button" [class.active]="activeTab === 'tree'" (click)="activeTab = 'tree'">Tree</button>
            <button type="button" [class.active]="activeTab === 'members'" (click)="activeTab = 'members'">Members</button>
            <button type="button" [class.active]="activeTab === 'search'" (click)="activeTab = 'search'">Find relationship</button>
            <button type="button" [class.active]="activeTab === 'timeline'" (click)="activeTab = 'timeline'">Timeline</button>
          </nav>

          <div *ngIf="activeTab === 'tree'" class="card section tree-panel">
            <div class="toolbar-row">
              <div class="toolbar-group">
                <button type="button" (click)="zoomIn()">Zoom in</button>
                <button type="button" (click)="zoomOut()">Zoom out</button>
                <button type="button" (click)="resetView()">Reset</button>
              </div>
              <div class="toolbar-group">
                <button type="button" (click)="pan('left')">←</button>
                <button type="button" (click)="pan('right')">→</button>
                <button type="button" (click)="pan('up')">↑</button>
                <button type="button" (click)="pan('down')">↓</button>
              </div>
            </div>

            <div class="tree-stage" [style.width.px]="stageWidth" [style.height.px]="stageHeight">
              <svg [attr.viewBox]="'0 0 ' + stageWidth + ' ' + stageHeight" aria-label="Family tree visualization">
                <g [attr.transform]="'translate(' + panX + ' ' + panY + ') scale(' + zoomLevel + ')'">
                  <g *ngFor="let edge of treeEdges">
                    <line [attr.x1]="edge.x1" [attr.y1]="edge.y1" [attr.x2]="edge.x2" [attr.y2]="edge.y2" stroke="#7a9a72" stroke-width="2" />
                  </g>

                  <g *ngFor="let node of treeNodes" (click)="selectedPersonId = node.id" [class.selected]="selectedPersonId === node.id">
                    <rect [attr.x]="node.x" [attr.y]="node.y" width="170" height="78" rx="14" fill="#fff" stroke="#d8d0c5" stroke-width="selectedPersonId === node.id ? 3 : 1.5" />
                    <text [attr.x]="node.x + 12" [attr.y]="node.y + 24" font-size="14" font-weight="700" fill="#1d2a1c">{{ node.label }}</text>
                    <text [attr.x]="node.x + 12" [attr.y]="node.y + 42" font-size="12" fill="#4b5a4f">{{ node.years }}</text>
                    <text [attr.x]="node.x + 12" [attr.y]="node.y + 60" font-size="11" fill="#6a7d69">{{ node.status }}</text>
                  </g>
                </g>
              </svg>
            </div>

            <div *ngIf="selectedPerson" class="person-summary">
              <strong>{{ getDisplayName(selectedPerson) }}</strong>
              <span>{{ selectedPerson.dateOfBirth ? getYear(selectedPerson.dateOfBirth) : 'Birth unknown' }} - {{ selectedPerson.dateOfDeath ? getYear(selectedPerson.dateOfDeath) : selectedPerson.isLiving ? 'Living' : 'Deceased' }}</span>
              <a [routerLink]="['/family', family.slug, 'person', selectedPerson._id]">Open profile</a>
            </div>
          </div>

          <div *ngIf="activeTab === 'members'" class="card section">
            <div class="search-inline">
              <input type="search" [value]="memberSearch" (input)="memberSearch = $any($event.target).value; filterMembers()" placeholder="Search members..." />
            </div>

            <div class="filters-row">
              <select [(ngModel)]="memberGenderFilter" (ngModelChange)="filterMembers()">
                <option value="">All genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
              <select [(ngModel)]="memberStatusFilter" (ngModelChange)="filterMembers()">
                <option value="">All life status</option>
                <option value="living">Living</option>
                <option value="deceased">Deceased</option>
              </select>
              <button type="button" class="clear-filter" (click)="clearMemberFilters()">Clear</button>
            </div>

            <div class="members-grid">
              <article *ngFor="let person of visibleMembers" class="member-card">
                <h3><a [routerLink]="['/family', family.slug, 'person', person._id]">{{ getDisplayName(person) }}</a></h3>
                <p>{{ formatYears(person) }}</p>
                <small>{{ person.occupation || 'Family member' }}</small>
              </article>
            </div>
            <div *ngIf="visibleMembers.length === 0" class="empty-state">No family members match the current search.</div>
          </div>

          <div *ngIf="activeTab === 'search'" class="card section relationship-panel">
            <div class="relationship-form">
              <label>
                Person A
                <select [(ngModel)]="personAId">
                  <option value="">Select a person</option>
                  <option *ngFor="let person of people" [value]="person._id">{{ getDisplayName(person) }}</option>
                </select>
              </label>
              <label>
                Person B
                <select [(ngModel)]="personBId">
                  <option value="">Select a person</option>
                  <option *ngFor="let person of people" [value]="person._id">{{ getDisplayName(person) }}</option>
                </select>
              </label>
              <button type="button" (click)="findRelationship()">Find Relationship</button>
            </div>

            <div *ngIf="relationshipResult" class="relationship-result">
              <h3>Relationship found</h3>
              <p>{{ relationshipResult }}</p>
            </div>
          </div>

          <div *ngIf="activeTab === 'timeline'" class="card section">
            <div class="timeline-list" *ngIf="timelineEvents.length; else noTimeline">
              <div *ngFor="let event of timelineEvents" class="timeline-item">
                <div class="timeline-year">{{ event.eventDate ? getYear(event.eventDate) : 'Date unknown' }}</div>
                <div class="timeline-content">
                  <strong>{{ event.type }}</strong>
                  <p>{{ event.title }}</p>
                  <small *ngIf="event.personId">
                    <a [routerLink]="['/family', family.slug, 'person', event.personId]">View person</a>
                  </small>
                </div>
              </div>
            </div>
            <ng-template #noTimeline>
              <div class="empty-state">No timeline events have been added for this family yet.</div>
            </ng-template>
          </div>
        </ng-container>
      </div>
    </section>
  `,
  styles: [
    `
      .section { padding: 1.2rem; }
      .family-header { margin-bottom: 1rem; }
      .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; color: #5b5b57; font-size: 0.75rem; }
      .stat-badges { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1rem; }
      .stat-badges span { background: #edf3ee; color: #335339; padding: 0.45rem 0.7rem; border-radius: 999px; }
      .tabs { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0; }
      .tabs button, .toolbar-group button, .relationship-form button { background: #f5efe9; border: 1px solid #e2d8cc; border-radius: 999px; padding: 0.6rem 0.9rem; cursor: pointer; }
      .tabs button.active { background: #335339; color: white; }
      .tree-panel { overflow-x: auto; }
      .toolbar-row { display: flex; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.8rem; }
      .toolbar-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
      .tree-stage { min-width: 760px; min-height: 420px; background: linear-gradient(180deg, #f8f4ef, #f2eee7); border-radius: 1rem; border: 1px solid #eaded0; }
      svg { width: 100%; height: 100%; }
      .selected rect { fill: #eef5ea; }
      .person-summary { margin-top: 1rem; display: flex; flex-wrap: wrap; align-items: center; gap: 0.8rem; }
      .members-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1rem; margin-top: 1rem; }
      .member-card { background: #f9f7f2; border: 1px solid #e9dfd0; border-radius: 1rem; padding: 1rem; }
      .search-inline input, .relationship-form select, .filters-row select { width: 100%; padding: 0.7rem 0.8rem; border-radius: 0.75rem; border: 1px solid #d7cdbf; }
      .filters-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin: 1rem 0; }
      .clear-filter { background: #f0ece7; border: 1px solid #d9d1c5; border-radius: 0.75rem; padding: 0.7rem 0.9rem; cursor: pointer; }
      .relationship-form { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); margin-bottom: 1rem; }
      .relationship-result { background: #edf3ee; border-radius: 1rem; padding: 1rem; }
      .timeline-list { display: grid; gap: 1rem; }
      .timeline-item { display: grid; grid-template-columns: 110px 1fr; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid #ede3d7; }
      .timeline-year { font-weight: 700; color: #3d5d3d; }
      .empty-state { color: #5b5b57; }
      .error { color: #a64343; }
    `,
  ],
})
export class FamilyPageComponent implements OnInit {
  family: FamilyResponse['family'] | null = null;
  people: PersonRecord[] = [];
  relationships: RelationshipRecord[] = [];
  timelineEvents: TimelineRecord[] = [];
  memberSearch = '';
  memberGenderFilter = '';
  memberStatusFilter = '';
  visibleMembers: PersonRecord[] = [];
  memberCount = 0;
  loading = true;
  activeTab: 'tree' | 'members' | 'search' | 'timeline' = 'tree';
  selectedPersonId = '';
  personAId = '';
  personBId = '';
  relationshipResult = '';
  treeNodes: Array<{ id: string; label: string; years: string; status: string; x: number; y: number }> = [];
  treeEdges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  stageWidth = 980;
  stageHeight = 500;
  zoomLevel = 1;
  panX = 0;
  panY = 0;

  private readonly personMap = new Map<string, PersonRecord>();

  constructor(private readonly route: ActivatedRoute, private readonly apiService: ApiService) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    const personId = this.route.snapshot.paramMap.get('personId');
    if (!slug) {
      this.loading = false;
      return;
    }

    this.activeTab = personId ? 'tree' : this.activeTab;
    this.selectedPersonId = personId ?? '';

    this.apiService.get<FamilyResponse>(`/families/${slug}`).subscribe({
      next: (response) => {
        this.family = response.family;
        this.memberCount = response.members;
        this.loadTree(slug);
      },
      error: () => {
        this.loading = false;
        this.family = null;
      },
    });
  }

  private loadTree(slug: string): void {
    this.apiService.get<TreeResponse>(`/families/${slug}/tree`).subscribe({
      next: (response) => {
        this.people = response.people ?? [];
        this.relationships = response.relationships ?? [];
        this.personMap.clear();
        this.people.forEach((person) => this.personMap.set(person._id, person));
        this.selectedPersonId = this.selectedPersonId || this.family?.rootPersonId || this.people[0]?._id || '';
        this.buildTreeLayout();
        this.filterMembers();
        this.loadTimeline(slug);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private loadTimeline(slug: string): void {
    this.apiService.get<{ success: boolean; data: TimelineRecord[] }>(`/families/${slug}/timeline`).subscribe({
      next: (response) => {
        this.timelineEvents = response.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.timelineEvents = [];
        this.loading = false;
      },
    });
  }

  filterMembers(): void {
    const query = this.memberSearch.trim().toLowerCase();
    this.visibleMembers = this.people.filter((person) => {
      const haystack = `${this.getDisplayName(person)} ${person.occupation ?? ''} ${person.birthPlace ?? ''}`.toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesGender = !this.memberGenderFilter || person.gender === this.memberGenderFilter;
      const matchesStatus = !this.memberStatusFilter || (this.memberStatusFilter === 'living' ? person.isLiving : !person.isLiving);
      return matchesQuery && matchesGender && matchesStatus;
    });
  }

  clearMemberFilters(): void {
    this.memberSearch = '';
    this.memberGenderFilter = '';
    this.memberStatusFilter = '';
    this.filterMembers();
  }

  findRelationship(): void {
    if (!this.family || !this.personAId || !this.personBId) {
      return;
    }

    const params = new URLSearchParams({ personAId: this.personAId, personBId: this.personBId });
    this.apiService.get<{ success: boolean; data: RelationshipLookupResponse }>(`/families/${this.family.slug}/relationship?${params.toString()}`).subscribe({
      next: (response) => {
        const personA = this.personMap.get(this.personAId);
        const personB = this.personMap.get(this.personBId);
        const aName = personA ? this.getDisplayName(personA) : 'Person A';
        const bName = personB ? this.getDisplayName(personB) : 'Person B';
        this.relationshipResult = this.formatRelationship(response.data.relationship, aName, bName);
      },
      error: () => {
        this.relationshipResult = 'Unable to determine the relationship between the selected people.';
      },
    });
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(2, this.zoomLevel + 0.15);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(0.6, this.zoomLevel - 0.15);
  }

  resetView(): void {
    this.zoomLevel = 1;
    this.panX = 0;
    this.panY = 0;
  }

  pan(direction: 'left' | 'right' | 'up' | 'down'): void {
    const step = 25;
    if (direction === 'left') this.panX -= step;
    if (direction === 'right') this.panX += step;
    if (direction === 'up') this.panY -= step;
    if (direction === 'down') this.panY += step;
  }

  getDisplayName(person: PersonRecord): string {
    return person.displayName || person.preferredName || `${person.firstName} ${person.lastName}`.trim() || 'Unknown person';
  }

  get selectedPerson(): PersonRecord | undefined {
    return this.selectedPersonId ? this.personMap.get(this.selectedPersonId) : undefined;
  }

  private buildTreeLayout(): void {
    const rootId = this.family?.rootPersonId || this.people[0]?._id || this.selectedPersonId || '';
    const generations = new Map<string, number>();
    const queue: Array<{ id: string; generation: number }> = rootId ? [{ id: rootId, generation: 0 }] : [];
    const visited = new Set<string>();

    while (queue.length) {
      const current = queue.shift();
      if (!current || visited.has(current.id)) continue;
      visited.add(current.id);
      generations.set(current.id, current.generation);

      const currentPerson = this.personMap.get(current.id);
      if (!currentPerson) continue;

      const childIds = this.relationships.filter((relationship) => relationship.type === 'PARENT_CHILD' && relationship.fromPersonId === current.id).map((item) => item.toPersonId);
      const spouseIds = this.relationships.filter((relationship) => relationship.type === 'SPOUSE' && (relationship.fromPersonId === current.id || relationship.toPersonId === current.id)).map((item) => item.fromPersonId === current.id ? item.toPersonId : item.fromPersonId);

      [...childIds, ...spouseIds].forEach((id) => {
        if (!visited.has(id)) {
          queue.push({ id, generation: current.generation + 1 });
        }
      });
    }

    const allPeople = [...this.people];
    allPeople.forEach((person) => {
      if (!generations.has(person._id)) {
        generations.set(person._id, 0);
      }
    });

    const grouped = new Map<number, PersonRecord[]>();
    allPeople.forEach((person) => {
      const generation = generations.get(person._id) ?? 0;
      const list = grouped.get(generation) ?? [];
      list.push(person);
      grouped.set(generation, list);
    });

    const nodes: Array<{ id: string; label: string; years: string; status: string; x: number; y: number }> = [];
    const edges: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];

    let column = 0;
    grouped.forEach((peopleAtGeneration) => {
      const yBase = 30 + column * 120;
      peopleAtGeneration.forEach((person, index) => {
        const x = 30 + column * 220;
        const y = 30 + index * 100;
        nodes.push({
          id: person._id,
          label: this.getDisplayName(person).slice(0, 16),
          years: this.formatYears(person),
          status: person.isLiving ? 'Living' : 'Deceased',
          x,
          y: yBase + index * 90,
        });
      });
      column += 1;
    });

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    this.relationships.forEach((relationship) => {
      const source = nodeById.get(relationship.fromPersonId);
      const target = nodeById.get(relationship.toPersonId);
      if (source && target) {
        edges.push({
          x1: source.x + 170,
          y1: source.y + 35,
          x2: target.x,
          y2: target.y + 35,
        });
      }
    });

    this.treeNodes = nodes;
    this.treeEdges = edges;
    this.stageWidth = Math.max(980, (Math.max(0, grouped.size - 1) * 220) + 260);
    this.stageHeight = Math.max(500, Math.max(...nodes.map((node) => node.y + 90), 500));
  }

  formatRelationship(value: string, aName: string, bName: string): string {
    const normalized = value.toLowerCase();
    if (normalized === 'spouse') return `${aName} is ${bName}'s spouse.`;
    if (normalized === 'child') return `${aName} is ${bName}'s child.`;
    if (normalized === 'parent') return `${aName} is ${bName}'s parent.`;
    if (normalized === 'sibling') return `${aName} and ${bName} are siblings.`;
    if (normalized === 'grandparent') return `${aName} is ${bName}'s grandparent.`;
    if (normalized === 'grandchild') return `${aName} is ${bName}'s grandchild.`;
    if (normalized === 'aunt_or_uncle') return `${aName} is ${bName}'s aunt or uncle.`;
    if (normalized === 'self') return `${aName} is the same person as ${bName}.`;
    return `${aName} and ${bName} are related.`;
  }

  getYear(dateString?: string): string {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 'Unknown' : String(date.getFullYear());
  }

  formatYears(person: PersonRecord): string {
    const birth = person.dateOfBirth ? this.getYear(person.dateOfBirth) : 'Unknown';
    const death = person.dateOfDeath ? this.getYear(person.dateOfDeath) : person.isLiving ? 'Living' : 'Unknown';
    return `${birth} - ${death}`;
  }
}
