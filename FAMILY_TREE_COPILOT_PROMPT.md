# FAMILY TREE — COMPLETE DEVELOPMENT SPECIFICATION

## MASTER PROMPT FOR GITHUB COPILOT AGENT

---

# 1. ROLE

You are acting as a **senior full-stack architect, software engineer, database designer, UI/UX engineer, security engineer, and QA engineer**.

Your responsibility is to build a complete production-ready **Family Tree / Genealogy Management Platform**.

Do not create a generic CRUD application.

The application must be designed specifically for:

- Family genealogy
- Multiple independent family trees
- Interactive family-tree visualization
- Family member management
- Parent/child relationships
- Spouse/marriage relationships
- Multiple marriages
- Family branches
- Generations
- Search
- Advanced filtering
- Relationship discovery
- Family timeline
- Privacy
- Public read-only exploration
- Single administrator management

The final application must be functional, connected to MongoDB, tested, responsive, and documented.

---

# 2. CORE PRODUCT IDEA

The system has one administrator.

The administrator creates and manages multiple independent families.

Visitors can explore public families in read-only mode.

Conceptually:

```text
                         ADMIN
                           |
                    Admin Dashboard
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
      Smith Family    Kumar Family     Johnson Family
          |                |                |
          v                v                v
      Family Tree      Family Tree      Family Tree
          |                |                |
          +----------------+----------------+
                           |
                        VISITORS
                      READ ONLY
```

The administrator controls all genealogy information.

Visitors cannot modify genealogy information.

---

# 3. TECHNOLOGY STACK

## Frontend

Use:

- Angular
- TypeScript
- Angular Standalone Components
- Angular Router
- Reactive Forms
- HttpClient
- RxJS
- SCSS
- Responsive design
- Accessibility best practices

Use modern Angular architecture rather than legacy NgModule-heavy architecture.

## Backend

Use:

- Node.js
- Express
- TypeScript
- REST API

## Database

Use:

- MongoDB
- Mongoose

## Authentication

Use secure administrator authentication.

Recommended:

- Argon2 or bcrypt password hashing
- Secure HTTP-only cookies/session or secure token mechanism
- Authentication middleware
- Login rate limiting
- Secure environment configuration
- No plain-text passwords

---

# 4. PROJECT STRUCTURE

Create:

```text
family-tree/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── auth/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   └── services/
│   │   │   │
│   │   │   ├── shared/
│   │   │   │   ├── components/
│   │   │   │   ├── models/
│   │   │   │   ├── pipes/
│   │   │   │   └── directives/
│   │   │   │
│   │   │   ├── features/
│   │   │   │   ├── public/
│   │   │   │   ├── admin/
│   │   │   │   ├── families/
│   │   │   │   ├── persons/
│   │   │   │   ├── tree/
│   │   │   │   ├── relationships/
│   │   │   │   ├── search/
│   │   │   │   └── timeline/
│   │   │   │
│   │   │   └── layout/
│   │   │
│   │   └── environments/
│   │
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── auth/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── types/
│   │   ├── seeds/
│   │   └── app.ts
│   │
│   └── ...
│
├── docs/
│
├── .gitignore
├── README.md
└── FAMILY_TREE_COPILOT_PROMPT.md
```

Keep frontend and backend clearly separated.

---

# 5. USER ACCESS MODEL

There are effectively two access levels.

## ADMIN

The administrator has complete control.

Admin can:

- Login
- Logout
- Create families
- Edit families
- Delete families
- View all families
- Create people
- Edit people
- Delete people
- Add parents
- Add children
- Add spouses
- Remove relationships
- Add marriages
- End marriages
- Add life events
- Upload photos
- Delete photos
- Change root person
- Configure privacy
- Configure public visibility
- Search people
- Filter people
- View statistics
- Review duplicate warnings
- Import/export if implemented
- View audit information

## VISITOR

Visitors are read-only.

Visitors can:

- View public families
- Search families
- Open a family
- View the interactive family tree
- Zoom
- Pan
- Expand branches
- Collapse branches
- Search family members
- Filter family members
- Open person profiles
- View relationships
- Find relationships between two people
- View family timeline
- Navigate generations
- View public photos

Visitors cannot:

- Create families
- Edit families
- Create people
- Edit people
- Delete people
- Create relationships
- Delete relationships
- Upload photos
- Change privacy
- Change family settings

---

# 6. DO NOT CREATE MULTI-ROLE COMPLEXITY

Do not create:

- Super Admin
- Moderator
- Editor
- Contributor
- Family Member

The first version intentionally uses:

```text
ADMIN
    |
    +-- Full access

VISITOR
    |
    +-- Read-only access
```

Design the architecture so more roles can be added later if necessary, but do not implement unnecessary complexity now.

---

# 7. ADMIN AUTHENTICATION

Create:

```text
/admin/login
```

After login:

```text
/admin/dashboard
```

There is no public registration.

Visitors cannot register.

Visitors do not need accounts to browse public families.

Admin credentials must never be hard-coded.

Use environment variables for authentication secrets.

Provide a secure initial-admin setup/seed mechanism.

---

# 8. BACKEND AUTHORIZATION

Authorization must be enforced on the backend.

Do not rely on:

- Angular guards alone
- Hidden buttons
- UI restrictions
- Client-side role values

Every modifying endpoint must verify administrator authentication.

Example:

```text
POST   /api/admin/families
PUT    /api/admin/families/:id
DELETE /api/admin/families/:id

POST   /api/admin/families/:id/members
PUT    /api/admin/members/:id
DELETE /api/admin/members/:id

POST   /api/admin/relationships
PUT    /api/admin/relationships/:id
DELETE /api/admin/relationships/:id
```

Unauthenticated requests must be rejected.

---

# 9. FAMILY TREE MODEL

The main domain object is:

```text
FamilyTree
```

Suggested fields:

```text
_id
name
slug
description
coverPhoto
rootPersonId
privacy
visibilitySettings
createdAt
updatedAt
```

Example families:

```text
Smith Family
Johnson Family
Kumar Family
Williams Family
Anderson Family
```

Each family is independent.

---

# 10. FAMILY ISOLATION

This is a critical business rule.

Every Person belongs to exactly one FamilyTree.

Every Relationship belongs to exactly one FamilyTree.

Every LifeEvent belongs to the appropriate Person/FamilyTree.

Every Photo belongs to the appropriate FamilyTree/Person/Event.

Do not accidentally mix family data.

Example:

```text
Smith Family
├── John Smith
├── Mary Smith
└── David Smith

Johnson Family
├── Robert Johnson
├── Sarah Johnson
└── Michael Johnson
```

John Smith must never appear in the Johnson Family tree.

Cross-family relationships should be prohibited in version 1.

---

# 11. FAMILY SLUG

Every family must have a unique slug.

Example:

```text
Smith Family
    ↓
smith-family
```

Public URL:

```text
/family/smith-family
```

Do not use the family name as the database primary key.

Use:

```text
_id = immutable identifier
slug = human-readable URL identifier
```

If the family name changes, avoid unnecessarily breaking existing URLs.

---

# 12. FAMILY PRIVACY

Each family should support:

```text
PUBLIC
PRIVATE
```

Public:

- Visible to visitors
- Searchable
- Accessible through public URL

Private:

- Not exposed through public family APIs
- Accessible only to admin

Design the data model so future sharing permissions can be added later.

---

# 13. PERSON MODEL

Create a comprehensive Person model.

Suggested fields:

```text
_id
familyTreeId

firstName
middleName
lastName
preferredName
displayName

gender

profilePhoto

dateOfBirth
dateOfDeath
isLiving

birthPlace
deathPlace
currentLocation

occupation
education

biography
notes

visibilitySettings

createdAt
updatedAt
```

Support incomplete data.

Examples:

- Unknown birth date
- Approximate birth year
- Unknown parent
- Unknown death date
- Unknown birthplace

Do not require information the admin does not know.

---

# 14. PERSON DISPLAY

The UI should intelligently display names.

Examples:

```text
John Smith
John A. Smith
John Smith Jr.
John "Johnny" Smith
```

Do not force every person to have a middle name.

Avoid displaying:

```text
undefined
null
N/A
```

when optional data is missing.

---

# 15. RELATIONSHIP MODEL

Use a dedicated Relationship model.

Do not store the entire family graph directly inside every Person document.

Support:

```text
PARENT_CHILD
SPOUSE
```

Additional metadata can represent:

```text
Marriage
Divorce
Separation
Widowed
Adoption
```

Design the model to be extensible.

---

# 16. PARENT / CHILD RELATIONSHIPS

Support:

```text
Father → Son
Father → Daughter
Mother → Son
Mother → Daughter
```

A person can have:

- Multiple children
- Multiple parents where appropriate
- Unknown parent
- Adoptive relationship if implemented

Do not assume a simple nuclear family structure.

---

# 17. MULTIPLE SPOUSES

A person may have multiple spouses.

Example:

```text
John ── Mary
  |
  +── David
  +── Sarah

John ── Lisa
  |
  +── Michael
```

Children must be associated with the appropriate parent relationship context.

Do not assume all children belong to one spouse.

---

# 18. RELATIONSHIP VALIDATION

The backend must prevent:

```text
Person → parent → same Person

Person → spouse → same Person

John → parent → David
David → parent → John
```

Also prevent:

- Circular ancestry
- Duplicate relationships
- Invalid person IDs
- Invalid family IDs
- Cross-family relationships
- Impossible marriage dates
- Marriage before birth
- Death before birth

Backend validation is authoritative.

---

# 19. AUTOMATIC RELATIONSHIP CALCULATION

Implement a reusable relationship calculation service.

Given Person A and Person B, calculate:

- Father
- Mother
- Son
- Daughter
- Brother
- Sister
- Grandfather
- Grandmother
- Grandson
- Granddaughter
- Uncle
- Aunt
- Nephew
- Niece
- Cousin
- Spouse
- Parent
- Child

Do not hard-code these results in UI.

Calculate from graph relationships.

---

# 20. FIND RELATIONSHIP FEATURE

Create:

```text
Find Relationship
```

Example:

```text
Person A:
John Smith

Person B:
Emma Smith

[ Find Relationship ]
```

Result:

```text
Emma is John's granddaughter.

John Smith
     |
     ↓
David Smith
     |
     ↓
Emma Smith
```

Also show the relationship path visually when practical.

This is an important feature.

---

# 21. FAMILY TREE VISUALIZATION

The family tree is the primary visual feature.

Do not create a static image.

Use a suitable Angular-compatible graph/tree visualization solution.

The tree must be generated dynamically from API data.

Person nodes should contain:

```text
Profile Photo
Name
Birth/Death years
```

Example:

```text
┌───────────────────────┐
│       [ PHOTO ]       │
│                       │
│      John Smith       │
│      1945 - 2020      │
└───────────────────────┘
```

---

# 22. TREE VISUAL FEATURES

Support:

- Zoom in
- Zoom out
- Pan
- Fit to screen
- Center tree
- Reset
- Expand branch
- Collapse branch
- Expand ancestors
- Expand descendants
- Focus selected person
- Highlight selected person
- Navigate to spouse
- Navigate to parent
- Navigate to child
- Navigate to sibling

---

# 23. TREE DISPLAY MODES

Provide:

```text
[ Ancestors ]
[ Descendants ]
[ Both ]
```

Allow generation depth:

```text
1
2
3
4
5
All
```

Example:

```text
Grandparents
     ↓
Parents
     ↓
Root Person
     ↓
Children
     ↓
Grandchildren
```

---

# 24. TREE NODE INTERACTION

Clicking a person should:

1. Select the person.
2. Highlight the person.
3. Open person details.
4. Allow navigation to relatives.
5. Preserve tree position where possible.

For admin:

```text
Edit Person
Add Parent
Add Child
Add Spouse
Add Event
Delete
```

For visitor:

```text
View Profile
View Parents
View Spouse
View Children
Find Relationship
```

Visitors must not see editing actions.

---

# 25. LARGE TREE PERFORMANCE

The tree must be designed for:

```text
10 people
100 people
500 people
1,000+ people
```

Do not render thousands of unnecessary nodes at once.

Use appropriate:

- Lazy expansion
- Generation limits
- Graph traversal optimization
- Angular performance practices
- OnPush where appropriate
- Efficient change detection
- Caching where useful

The UI must remain responsive.

---

# 26. PERSON PROFILE

Create a beautiful person profile.

Sections:

```text
Basic Information
Life Events
Parents
Spouses
Children
Siblings
Biography
Photos
```

Example:

```text
John Smith

Born:
12 March 1945

Died:
20 June 2020

Birthplace:
Chennai, India

Occupation:
Engineer

Parents:
Robert Smith
Mary Smith

Spouse:
Jane Smith

Children:
David Smith
Emma Smith
```

Every related person should be clickable.

---

# 27. FAMILY MEMBER LIST

Provide a list/table alternative to the graphical tree.

Example:

```text
Family Members

Search...

Filters...

John Smith
1945 - 2020

Jane Smith
1948 -

David Smith
1992 -
```

Support:

- Search
- Filter
- Sort
- Pagination

This is essential for large families.

---

# 28. ADVANCED SEARCH

Search within a family by:

- First name
- Middle name
- Last name
- Preferred name
- Full name
- Birth year
- Birth place
- Death year
- Occupation

Support:

- Case-insensitive search
- Partial matching
- Debounced search

Example:

Search:

```text
smith jo
```

Results:

```text
John Smith
Joseph Smith
Johnny Smith
```

---

# 29. SEARCH EXPERIENCE

Search should provide:

- Loading state
- Debouncing
- Minimum search length
- Clear button
- Empty state
- Highlighted matching text where appropriate

Clicking a result should:

1. Open the family tree.
2. Focus the person.
3. Center the person.
4. Highlight the person.
5. Open their profile.

---

# 30. ADVANCED FILTERS

Support:

```text
Gender
Living / Deceased
Birth year range
Death year range
Birth location
Occupation
Generation
Has photo
Has biography
Has spouse
Has children
```

Example:

```text
Filters

Gender:
All / Male / Female / Other / Unknown

Life Status:
All / Living / Deceased

Birth Year:
From [1900]
To   [2020]

Generation:
All

Has Photo:
All / Yes / No

Has Spouse:
All / Yes / No

Has Children:
All / Yes / No

[Apply]
[Clear]
```

Filters should work against real backend data for large families.

---

# 31. SORTING

Allow sorting by:

- Name
- Birth date
- Death date
- Recently added
- Recently updated

Use server-side sorting for large datasets.

---

# 32. FAMILY BRANCH VIEW

Allow visitors/admin to focus on a particular branch.

Example:

```text
John Smith Branch

John Smith
|
+-- David Smith
|   |
|   +-- Emma
|   +-- Noah
|
+-- Sarah Smith
    |
    +-- Olivia
```

Branch mode should reduce visual complexity for large families.

---

# 33. FAMILY TIMELINE

Create a chronological family timeline.

Example:

```text
1945
Birth — John Smith

1968
Marriage — John Smith + Jane Smith

1970
Birth — David Smith

1992
Marriage — David Smith + Emma

1995
Birth — Michael Smith
```

Support event types:

- Birth
- Marriage
- Divorce
- Death
- Adoption
- Custom event

Timeline filters:

```text
All
Births
Marriages
Deaths
Other
```

Clicking an event should navigate to the relevant person.

---

# 34. FAMILY STATISTICS

Calculate:

- Total members
- Living members
- Deceased members
- Male members
- Female members
- Number of generations
- Number of marriages
- Number of branches
- Oldest known member
- Youngest member

Public statistics must respect privacy.

---

# 35. ADMIN DASHBOARD

Create a clean admin dashboard.

Show:

```text
Total Families
Total Members
Total Relationships
Public Families
Private Families
```

Recent activity:

```text
Family created
Person added
Person updated
Relationship added
Relationship removed
```

Avoid turning the dashboard into an unnecessary analytics-heavy system.

---

# 36. FAMILY ADMIN PAGE

When admin opens a family:

```text
Smith Family

[Tree]
[Members]
[Relationships]
[Timeline]
[Photos]
[Settings]
```

Each section should be functional.

---

# 37. CREATE FAMILY UX

Form:

```text
Family Name
Description
Cover Photo
Privacy
```

After creating the family:

- Navigate to family dashboard.
- Provide clear empty state.
- Offer:

```text
Add First Person
```

---

# 38. EMPTY FAMILY EXPERIENCE

If a family has no people:

```text
Your family tree is empty.

Start by adding the first family member.

[Add First Person]
```

After adding the first person:

```text
Set as Root Person
```

Make onboarding intuitive.

---

# 39. ROOT PERSON

Every family should have a root person for visualization.

Admin can:

- Set root person
- Change root person

Changing the root should not modify actual relationships.

It only changes the starting point of the visualization.

---

# 40. DUPLICATE PERSON DETECTION

When admin creates a person, detect possible duplicates.

Example:

Existing:

```text
John Smith
1945
Chennai
```

New:

```text
John Smith
1945
Chennai
```

Show:

```text
Possible duplicate found.

[Review Existing]
[Create Anyway]
```

Do not automatically merge people.

---

# 41. DELETE SAFETY

Before deleting a person:

```text
Delete John Smith?

This person has:

2 parent relationships
1 spouse relationship
3 child relationships
5 life events

Deleting this person may affect the family tree.

[Cancel]
[Delete]
```

Prefer soft-delete where practical.

---

# 42. AUDIT LOG

Because one administrator controls everything, maintain a lightweight audit trail.

Record:

```text
Family created
Family updated
Family deleted
Person created
Person updated
Person deleted
Relationship created
Relationship deleted
```

Example:

```text
2026-10-08 10:20
Admin
Updated John Smith
```

Do not expose internal audit logs publicly.

---

# 43. PRIVACY CONTROLS

Each family has privacy settings.

Each person can have visibility settings.

Possible settings:

```text
Show name
Show photo
Show birth year
Show exact birth date
Show death year
Show biography
Show occupation
```

Do NOT expose contact information publicly by default.

For living people, use privacy-friendly defaults.

---

# 44. PUBLIC FAMILY DIRECTORY

Create:

```text
/families
```

Display public families:

```text
Family Trees

Search families...

Smith Family
124 members
6 generations

[Explore]

Johnson Family
87 members
5 generations

[Explore]
```

Private families must not appear.

---

# 45. PUBLIC FAMILY PAGE

Example:

```text
/family/smith-family
```

Display:

- Family cover
- Family name
- Description
- Member count
- Generation count
- Tree
- Search
- Timeline
- About

---

# 46. PUBLIC PERSON URL

Support:

```text
/family/smith-family/person/:personId
```

Opening the URL should:

1. Load the family.
2. Verify it is public.
3. Load the person.
4. Open the tree.
5. Center on the person.
6. Highlight the person.
7. Open profile details.

---

# 47. URL SHARING

Allow users to copy/share public family URLs.

Do not require login.

Use stable IDs/slugs.

Do not use array indexes as identifiers.

---

# 48. BROWSER NAVIGATION

Support natural:

- Back
- Forward
- Refresh

Preserve useful state where practical:

- Selected person
- Search
- Filters
- Generation depth
- Tree mode

---

# 49. MOBILE EXPERIENCE

The application must be genuinely responsive.

Do not simply shrink desktop UI.

On mobile:

- Tree supports touch navigation
- Zoom/pan controls are accessible
- Person details open as a drawer/page
- Search is easy to access
- Filters open in a drawer
- Buttons are touch-friendly
- No page-level horizontal overflow

---

# 50. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard navigation
- Focus indicators
- Accessible buttons
- ARIA labels where necessary
- Screen-reader-friendly person details
- Adequate color contrast
- Do not rely solely on color

Tree nodes should have accessible labels.

---

# 51. LOADING STATES

Every asynchronous operation needs a loading state.

Examples:

```text
Loading family tree...
Loading family members...
Searching...
Saving person...
Deleting relationship...
```

Do not leave blank screens while waiting for APIs.

---

# 52. EMPTY STATES

Examples:

```text
No families found.

No family members found.

No relationships found.

No timeline events found.

No search results found.
```

Each empty state should explain what the user can do next when appropriate.

---

# 53. ERROR STATES

Use friendly errors.

Example:

```text
We couldn't load this family tree.

[Try Again]
```

Do not expose internal stack traces.

Backend errors should use consistent API response formats.

---

# 54. API DESIGN

Public APIs:

```text
GET /api/families
GET /api/families/:slug
GET /api/families/:slug/tree
GET /api/families/:slug/members
GET /api/families/:slug/members/:personId
GET /api/families/:slug/search
GET /api/families/:slug/timeline
GET /api/families/:slug/statistics
```

Admin APIs:

```text
POST   /api/admin/families
PUT    /api/admin/families/:id
DELETE /api/admin/families/:id

POST   /api/admin/families/:id/members
PUT    /api/admin/members/:id
DELETE /api/admin/members/:id

POST   /api/admin/relationships
PUT    /api/admin/relationships/:id
DELETE /api/admin/relationships/:id

POST   /api/admin/events
PUT    /api/admin/events/:id
DELETE /api/admin/events/:id

POST   /api/admin/photos
DELETE /api/admin/photos/:id
```

Improve this API structure if a better REST design is appropriate.

---

# 55. API VALIDATION

Validate:

- Request body
- IDs
- Family ownership
- Dates
- Relationship rules
- Required fields
- Query parameters
- Pagination
- Sorting
- Filters

Never trust client input.

---

# 56. API PAGINATION

For large lists use:

```text
?page=1
&limit=25
```

Cap maximum limit.

Do not allow clients to request unlimited records.

---

# 57. API SEARCH

Search endpoints must support:

- Search term
- Filters
- Sorting
- Pagination

Example concept:

```text
GET /api/families/:slug/search?q=john&gender=male&page=1&limit=25
```

Validate and sanitize all query parameters.

---

# 58. DATABASE INDEXING

Create indexes appropriate for:

```text
FamilyTree.slug
Person.familyTreeId
Person.firstName
Person.lastName
Person.dateOfBirth
Person.dateOfDeath
Relationship.familyTreeId
Relationship.fromPersonId
Relationship.toPersonId
```

Consider compound indexes based on actual query patterns.

Do not create unnecessary indexes blindly.

---

# 59. FAMILY DATA INTEGRITY

When deleting/modifying relationships:

- Do not leave orphaned records.
- Maintain consistency.
- Clean up dependent data safely.
- Use MongoDB transactions where appropriate.

Do not allow partial destructive operations.

---

# 60. PHOTO ARCHITECTURE

Create an abstraction for image storage.

Future providers may include:

```text
Local
AWS S3
Cloudinary
Other object storage
```

Do not tightly couple the Person model to one storage provider.

Support:

- Profile photo
- Family cover
- Event photos

For version 1, a simple implementation is acceptable but architecture must allow future replacement.

---

# 61. IMPORT / EXPORT FUTURE SUPPORT

Do not necessarily implement GEDCOM in version 1.

But design models and services so future functionality can support:

```text
Import GEDCOM
Export GEDCOM
Family backup
Family restore
```

Do not create a data model that makes genealogy interchange impossible.

---

# 62. PERFORMANCE

The application should remain usable for:

```text
10 people
100 people
500 people
1,000+ people
```

Use:

- Pagination
- Lazy loading
- Debounced search
- Efficient database queries
- Efficient graph traversal
- Angular performance optimization
- Caching where useful
- Avoid unnecessary full-page reloads

When admin edits a person, update the relevant UI rather than unnecessarily reloading everything.

---

# 63. SECURITY

Implement:

- Password hashing
- Authentication
- Authorization
- Secure cookies/tokens
- Rate limiting
- CORS configuration
- Input validation
- Security headers
- No secrets in Git
- No secrets in Angular source
- Environment variables
- Consistent error handling
- Protection against unauthorized family access

Do not expose MongoDB credentials.

---

# 64. ENVIRONMENT VARIABLES

Backend should use something similar to:

```env
NODE_ENV=development
PORT=3000

MONGODB_URI=<YOUR_MONGODB_CONNECTION_STRING>

JWT_SECRET=<YOUR_SECRET>
```

If using secure sessions instead of JWT, use the appropriate session secret.

Create:

```text
.env.example
```

Never commit:

```text
.env
```

Add `.env` to `.gitignore`.

---

# 65. FRONTEND CONFIGURATION

Do not hard-code production API URLs throughout Angular components.

Use environment/configuration mechanisms.

Example concept:

```text
API_BASE_URL
```

Keep API configuration centralized.

---

# 66. ERROR HANDLING

Backend:

- Centralized error middleware
- Consistent error response
- Validation errors
- Authentication errors
- Authorization errors
- Not found errors
- Database errors

Frontend:

- Global HTTP error handling where appropriate
- User-friendly notifications
- Retry capability
- Loading states
- Empty states

---

# 67. TESTING

Create tests for critical functionality.

At minimum:

### Authentication

- Login success
- Login failure
- Protected endpoint rejection

### Families

- Create family
- Update family
- Delete family
- Public/private behavior

### People

- Create
- Update
- Delete
- Family isolation

### Relationships

- Parent-child
- Spouse
- Multiple spouses
- Duplicate prevention
- Circular relationship prevention
- Cross-family prevention

### Relationship engine

Test:

- Parent
- Child
- Sibling
- Grandparent
- Grandchild
- Uncle/aunt
- Cousin

### Search

- Name search
- Partial search
- Filters
- Pagination

### Privacy

Ensure private information is not returned publicly.

---

# 68. SAMPLE SEED DATA

Create realistic development seed data.

Use at least 4 generations.

Include:

- Grandparents
- Parents
- Children
- Grandchildren
- Siblings
- Multiple marriages
- Half-siblings
- Cousins
- Living people
- Deceased people
- Life events

Example:

```text
Robert Smith + Mary Smith
           |
      +----+----+
      |         |
    John      Sarah
      |
   Jane
      |
  +---+---+
  |       |
David    Emma
```

Add enough records to test:

- Search
- Filtering
- Tree navigation
- Branch views
- Relationship calculation
- Timeline
- Statistics

---

# 69. ADMIN ROUTES

Create:

```text
/admin/login

/admin/dashboard

/admin/families

/admin/families/create

/admin/families/:familyId

/admin/families/:familyId/tree

/admin/families/:familyId/members

/admin/families/:familyId/relationships

/admin/families/:familyId/timeline

/admin/families/:familyId/settings
```

Protect all admin routes.

---

# 70. PUBLIC ROUTES

Create:

```text
/

/families

/family/:slug

/family/:slug/tree

/family/:slug/person/:personId

/family/:slug/search

/family/:slug/timeline
```

These are read-only.

---

# 71. ADMIN DASHBOARD UX

Keep the admin dashboard clean.

Possible layout:

```text
------------------------------------------------
Family Tree Admin
------------------------------------------------

Families       Members       Relationships
   5             348              421

------------------------------------------------

Your Families

Smith Family
124 members
6 generations

[Open]

Johnson Family
87 members
5 generations

[Open]

[+ Create Family]
------------------------------------------------
```

Do not create excessive charts simply for decoration.

---

# 72. VISITOR UX

The public interface should prioritize exploration.

Suggested navigation:

```text
Family Trees
Search
Timeline
About
```

Inside a family:

```text
Family Name

[Tree]
[Members]
[Search]
[Timeline]
```

The family tree should remain the main experience.

---

# 73. VISUAL DESIGN

The product should communicate:

- Family
- Heritage
- History
- Trust
- Warmth
- Simplicity

Avoid making it look like:

- Banking software
- Generic enterprise admin software
- Developer tooling

Use:

- Clean typography
- Comfortable spacing
- Calm colors
- Clear hierarchy
- Elegant relationship lines
- Professional person cards
- Responsive layouts

Do not put every element inside a card.

Use cards only when they improve grouping or usability.

---

# 74. ADMIN TREE MODE

Admin can edit directly from the tree.

Example:

```text
Select John Smith

┌──────────────────────────────┐
│ John Smith                   │
│ 1945 - 2020                  │
│                              │
│ [Edit Person]                │
│ [Add Parent]                 │
│ [Add Child]                  │
│ [Add Spouse]                 │
│ [Add Event]                  │
│ [Delete]                     │
└──────────────────────────────┘
```

After saving:

- Update tree
- Keep current zoom/pan where possible
- Keep selected person
- Show success notification
- Do not unnecessarily reload the entire page

---

# 75. VISITOR TREE MODE

Visitors should see:

```text
John Smith
1945 - 2020

Parents
Spouse
Children
Siblings

[View Profile]
[Find Relationship]
```

No edit controls.

---

# 76. FIND RELATIONSHIP UX

Create a simple workflow:

```text
Find Relationship

Person A
[ Search person... ]

Person B
[ Search person... ]

[Find Relationship]
```

Result:

```text
Relationship Found

Emma Smith is the granddaughter of John Smith.

John Smith
      ↓
David Smith
      ↓
Emma Smith
```

Highlight the path in the tree.

---

# 77. SEARCH UX PRINCIPLE

The user should always be able to answer:

"Where is this person in the tree?"

Therefore:

Search
   ↓
Result
   ↓
Focus person
   ↓
Center tree
   ↓
Highlight person
   ↓
Explore relatives

This should be a core navigation pattern.

---

# 78. FILTER UX PRINCIPLE

Filters should be:

- Easy to open
- Easy to clear
- Clearly show active filters
- Persist while navigating where practical
- Mobile friendly

Example:

```text
Filters (3)

[Living]
[Born after 1980]
[Has children]

[Clear all]
```

---

# 79. FAMILY BRANCH UX

When the tree is large, provide:

```text
Focus Branch
```

Selecting a person can show:

```text
This person's branch
```

with configurable depth.

This prevents a 500-person tree from becoming visually overwhelming.

---

# 80. GENERATION NAVIGATION

Provide generation indicators.

Example:

```text
Generation -2
Great-grandparents

Generation -1
Grandparents

Generation 0
Root Person

Generation +1
Children

Generation +2
Grandchildren
```

Use simple terminology in the user interface where possible.

---

# 81. ACCESSIBLE TREE ALTERNATIVE

Because graphical trees can be difficult for some users, provide a structured alternative.

Example:

```text
John Smith

Parents:
- Robert Smith
- Mary Smith

Spouse:
- Jane Smith

Children:
- David Smith
- Emma Smith
```

The application must not depend exclusively on visual graph interaction.

---

# 82. NO HARDCODED MOCK DATA

Sample data is allowed only for seed/development purposes.

The final application must obtain family data from MongoDB through the backend API.

Do not leave fake arrays such as:

```typescript
const familyMembers = [...]
```

as the actual application data source.

---

# 83. NO FAKE API

Do not use fake HTTP services as the final implementation.

Angular must communicate with the real Express backend.

Express must communicate with MongoDB.

Flow:

```text
Angular
   ↓
HTTP API
   ↓
Express
   ↓
Service
   ↓
Mongoose
   ↓
MongoDB
```

---

# 84. NO HARDCODED CREDENTIALS

Never put:

- MongoDB password
- Admin password
- JWT secret
- Session secret
- API secret

inside source code.

Never commit `.env`.

Create `.env.example`.

---

# 85. API RESPONSE DESIGN

Use consistent API responses.

Example success:

```json
{
  "success": true,
  "data": {}
}
```

Example error:

```json
{
  "success": false,
  "error": {
    "code": "PERSON_NOT_FOUND",
    "message": "Person not found"
  }
}
```

Use appropriate HTTP status codes.

---

# 86. LOGGING

Implement structured server logging.

Log:

- Requests
- Errors
- Important admin operations

Do not log:

- Passwords
- Secrets
- Sensitive tokens

---

# 87. HEALTH CHECK

Create:

```text
GET /api/health
```

Return useful service status.

Example:

```json
{
  "success": true,
  "status": "ok"
}
```

Optionally include database connectivity status without exposing sensitive details.

---

# 88. FRONTEND ERROR HANDLING

When the backend is unavailable:

```text
Unable to connect to the family tree service.

[Retry]
```

Do not show a blank screen.

---

# 89. FAMILY NOT FOUND

If a public URL is invalid:

```text
Family not found.

The family may have been removed or the link may be incorrect.

[Back to Families]
```

---

# 90. PERSON NOT FOUND

If a person URL is invalid:

```text
Person not found.

[Back to Family Tree]
```

---

# 91. PRIVATE FAMILY ACCESS

If a visitor attempts:

```text
/family/private-family
```

show:

```text
This family tree is private.
```

Do not leak:

- Member count
- Person names
- Relationship data
- Photos
- Timeline information

---

# 92. FAMILY DELETION

Deleting a family is destructive.

Require explicit confirmation.

Example:

```text
Delete Smith Family?

This will remove:

124 people
187 relationships
65 life events
42 photos

This action cannot be easily undone.

[Cancel]
[Delete Family]
```

Prefer soft-delete or backup strategy where practical.

---

# 93. FAMILY BACKUP DESIGN

Design the architecture so the administrator can eventually:

```text
Export Family
Backup Family
Restore Family
```

Full implementation can be future work.

---

# 94. FUTURE ROADMAP

Design for future features without implementing unnecessary complexity now.

Potential future:

- GEDCOM import/export
- Multiple administrators
- Family invitations
- Private sharing links
- Family member accounts
- Comments
- Memories
- Photo albums
- Documents
- Advanced genealogy events
- DNA information
- Notifications
- Family stories
- Historical maps
- AI-assisted genealogy tools

Do not implement these unless required for version 1.

---

# 95. DEVELOPMENT PHASES

Build in this order.

## PHASE 1 — FOUNDATION

- Inspect workspace
- Create project
- Configure Angular
- Configure Express
- Configure TypeScript
- Configure MongoDB
- Environment configuration
- Basic architecture
- Health endpoint

## PHASE 2 — AUTHENTICATION

- Admin model
- Password hashing
- Login
- Logout
- Authentication middleware
- Angular auth service
- Admin guard

## PHASE 3 — FAMILY MANAGEMENT

- FamilyTree model
- Create family
- Edit family
- Delete family
- Public/private
- Family slug
- Admin family dashboard

## PHASE 4 — PEOPLE

- Person model
- Create
- Edit
- Delete
- Person profile
- Member list
- Search

## PHASE 5 — RELATIONSHIPS

- Relationship model
- Parent-child
- Spouse
- Multiple spouses
- Validation
- Circular relationship prevention

## PHASE 6 — RELATIONSHIP ENGINE

- Relationship calculation
- Find relationship
- Relationship path

## PHASE 7 — TREE VISUALIZATION

- Dynamic tree
- Person nodes
- Relationship edges
- Zoom
- Pan
- Focus
- Generations
- Ancestors
- Descendants
- Branch view

## PHASE 8 — PUBLIC EXPERIENCE

- Public family directory
- Public family page
- Read-only tree
- Public person profile
- Privacy filtering

## PHASE 9 — ADVANCED SEARCH

- Search
- Filters
- Sorting
- Pagination
- Debouncing

## PHASE 10 — TIMELINE

- LifeEvent model
- Timeline
- Filters
- Person navigation

## PHASE 11 — PHOTOS

- Photo model
- Profile photos
- Family cover
- Storage abstraction

## PHASE 12 — QUALITY

- Validation
- Error handling
- Loading states
- Empty states
- Accessibility
- Responsive design

## PHASE 13 — TESTING

- Unit tests
- API tests
- Relationship tests
- Auth tests
- Privacy tests
- Family isolation tests

## PHASE 14 — FINAL REVIEW

- Build frontend
- Build backend
- Run tests
- Fix errors
- Verify API integration
- Verify MongoDB
- Verify routes
- Verify security
- Update README

---

# 96. IMPORTANT COPILOT BEHAVIOR

Before writing code:

1. Inspect the workspace.
2. Determine whether it is empty or existing.
3. Preserve useful existing code.
4. Review this entire specification.
5. Create an implementation plan.
6. Identify dependencies.
7. Implement incrementally.

Do not immediately generate hundreds of files without understanding the workspace.

---

# 97. COPILOT MUST CREATE REAL CODE

Do not provide only:

- Pseudo-code
- Architecture diagrams
- TODO comments
- Mock screens
- Fake services
- Placeholder APIs

Create the actual application.

---

# 98. COPILOT MUST VERIFY CODE

After implementation:

Run appropriate:

```text
npm install
npm run build
npm test
```

or the equivalent scripts.

Verify:

- TypeScript compilation
- Angular compilation
- Backend compilation
- API routes
- MongoDB connection
- Imports
- Dependencies
- Environment configuration

Fix errors instead of merely reporting them.

---

# 99. KEEP FRONTEND AND BACKEND SYNCHRONIZED

If backend API changes:

Update frontend services/models.

If frontend expects a different response:

Update backend or frontend consistently.

Do not leave mismatched contracts.

---

# 100. DO NOT OVERENGINEER

Use clean architecture, but avoid unnecessary complexity.

Prefer:

```text
Simple
Clear
Maintainable
Testable
Extensible
```

over:

```text
Over-engineered
Over-abstracted
Difficult to understand
```

---

# 101. FINAL DEFINITION OF DONE

The application is considered complete only when:

- Angular frontend builds successfully.
- Express backend builds successfully.
- MongoDB connection works.
- Admin can log in.
- Admin can log out.
- Admin can create multiple families.
- Admin can edit families.
- Admin can delete families safely.
- Admin can create people.
- Admin can edit people.
- Admin can delete people safely.
- Admin can create parent-child relationships.
- Admin can create spouse relationships.
- Multiple spouses are supported.
- Circular relationships are prevented.
- Cross-family relationships are prevented.
- Relationship calculation works.
- Interactive tree works.
- Tree zoom works.
- Tree pan works.
- Tree focus works.
- Ancestor view works.
- Descendant view works.
- Generation limits work.
- Branch view works.
- Public family directory works.
- Public/private families work.
- Visitors are read-only.
- Backend authorization works.
- Person profiles work.
- Search works.
- Advanced filters work.
- Sorting works.
- Pagination works.
- Find Relationship works.
- Timeline works.
- Privacy controls work.
- Family isolation works.
- Loading states exist.
- Empty states exist.
- Error states exist.
- Mobile layout works.
- Accessibility basics are implemented.
- Critical tests pass.
- `.env` is ignored.
- No credentials are committed.
- README is complete.
- Seed data works.
- API health endpoint works.

---

# 102. FINAL RESPONSE FROM COPILOT

When the implementation is complete, provide a concise final report containing:

## Files Created/Changed

List important files.

## Architecture

Explain:

```text
Angular
   ↓
Express REST API
   ↓
Services
   ↓
Mongoose
   ↓
MongoDB
```

## Database Models

List:

- User
- FamilyTree
- Person
- Relationship
- LifeEvent
- Photo

## API Endpoints

Summarize public and admin APIs.

## Features Implemented

Summarize all completed features.

## Security

Explain:

- Authentication
- Authorization
- Password hashing
- Privacy
- Family isolation

## Testing

Report:

- Build result
- Test result
- Critical genealogy tests

## How To Run

Provide exact commands.

## Environment Variables

List required variables without exposing actual secrets.

## Assumptions

List decisions made where requirements were ambiguous.

## Known Limitations

Be honest about anything not implemented.

## Future Improvements

List sensible next steps.

---

# 103. FINAL INSTRUCTION

Do not stop after creating the basic project.

Build the actual Family Tree application.

The most important features are:

1. Single administrator.
2. Multiple independent families.
3. Real MongoDB-backed genealogy data.
4. Correct parent/child/spouse relationships.
5. Interactive family tree.
6. Search and advanced filtering.
7. Find Relationship.
8. Public read-only family exploration.
9. Privacy.
10. Excellent user experience.
11. Strong data integrity.
12. Secure backend authorization.

The application should feel like a polished genealogy product.

Start by inspecting the existing workspace.

Then implement PHASE 1.

Continue phase by phase, keeping the project buildable and runnable at every stage.

Do not declare completion until the Definition of Done has been verified.