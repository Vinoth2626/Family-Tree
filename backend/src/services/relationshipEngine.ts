import type { IRelationship } from '../models/Relationship';
import type { IPerson } from '../models/Person';

interface PersonGraph {
  parents: Set<string>;
  children: Set<string>;
  spouses: Set<string>;
}

export function buildPersonGraph(people: IPerson[], relationships: IRelationship[]): Map<string, PersonGraph> {
  const graph = new Map<string, PersonGraph>();

  for (const person of people) {
    graph.set(String(person._id), { parents: new Set(), children: new Set(), spouses: new Set() });
  }

  for (const relationship of relationships) {
    const from = String(relationship.fromPersonId);
    const to = String(relationship.toPersonId);

    if (!graph.has(from) || !graph.has(to)) continue;

    if (relationship.type === 'PARENT_CHILD') {
      graph.get(from)?.children.add(to);
      graph.get(to)?.parents.add(from);
    }

    if (relationship.type === 'SPOUSE') {
      graph.get(from)?.spouses.add(to);
      graph.get(to)?.spouses.add(from);
    }
  }

  return graph;
}

export function calculateRelationship(a: IPerson, b: IPerson, relationships: IRelationship[]): string {
  const graph = buildPersonGraph([a, b], relationships);
  const aId = String(a._id);
  const bId = String(b._id);

  if (aId === bId) return 'self';

  const aParents = graph.get(aId)?.parents ?? new Set();
  const bParents = graph.get(bId)?.parents ?? new Set();
  const aChildren = graph.get(aId)?.children ?? new Set();
  const bChildren = graph.get(bId)?.children ?? new Set();
  const aSpouses = graph.get(aId)?.spouses ?? new Set();

  if (aSpouses.has(bId)) return 'spouse';
  if (aParents.has(bId)) return 'child';
  if (aChildren.has(bId)) return 'parent';

  if (Array.from(aParents).some((parentId) => bParents.has(parentId))) return 'sibling';

  if (Array.from(aParents).some((parentId) => {
    const parentGraph = graph.get(parentId);
    return parentGraph ? Array.from(parentGraph.parents).some((grandparentId) => grandparentId === bId) : false;
  })) return 'grandparent';

  if (Array.from(aChildren).some((childId) => {
    const childGraph = graph.get(childId);
    return childGraph ? Array.from(childGraph.children).some((grandchildId) => grandchildId === bId) : false;
  })) return 'grandchild';

  if (Array.from(aParents).some((parentId) => {
    const parentGraph = graph.get(parentId);
    return parentGraph ? Array.from(parentGraph.children).some((siblingId) => siblingId === bId) : false;
  })) return 'sibling';

  if (Array.from(aParents).some((parentId) => {
    const parentGraph = graph.get(parentId);
    return parentGraph ? Array.from(parentGraph.parents).some((grandparentId) => {
      const grandparentGraph = graph.get(grandparentId);
      return grandparentGraph ? Array.from(grandparentGraph.children).some((uncleId) => uncleId === bId) : false;
    }) : false;
  })) return 'aunt_or_uncle';

  if (Array.from(aChildren).some((childId) => {
    const childGraph = graph.get(childId);
    return childGraph ? Array.from(childGraph.parents).some((parentId) => parentId === bId) : false;
  })) return 'parent';

  if (Array.from(aParents).some((parentId) => Array.from(graph.get(parentId)?.children ?? []).includes(bId))) return 'sibling';
  if (Array.from(bParents).some((parentId) => Array.from(graph.get(parentId)?.children ?? []).includes(aId))) return 'sibling';
  if (Array.from(aChildren).some((childId) => Array.from(graph.get(childId)?.children ?? []).includes(bId))) return 'grandparent';
  if (Array.from(bChildren).some((childId) => Array.from(graph.get(childId)?.children ?? []).includes(aId))) return 'grandchild';

  return 'relative';
}
