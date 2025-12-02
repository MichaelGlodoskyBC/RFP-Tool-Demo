# Component Architecture Map

## Application Flow

```
App.jsx (Root)
├── Header.jsx (Always visible)
└── Conditional Rendering:
    ├── Dashboard.jsx + RFPList.jsx (Default view)
    │   └── RFPCard.jsx (Repeated for each RFP)
    └── LaneEditor.jsx (When RFP selected)
        ├── LaneTable.jsx (Main lane grid)
        └── CostStackPanel.jsx (Optional side panel)
```

## Component Details

### App.jsx
**Purpose**: Main application container and state management
**State**:
- `activeTab` - Current tab (inbox/active/submitted/awarded)
- `selectedRFP` - Currently selected RFP for editing
- `searchQuery` - Search filter text
- `filterStatus` - Status filter

**Functions**:
- `filteredRFPs` - Filters RFPs based on search and status

---

### Header.jsx
**Purpose**: Top navigation bar
**Features**:
- Logo and app title
- Notification bell (3 notifications)
- Settings button
- User profile card

**Customization Points**:
- Change logo/branding
- Add real notification system
- Implement settings menu
- Connect to user authentication

---

### Dashboard.jsx
**Purpose**: High-level metrics display
**Components**:
- 4× MetricCard components

**Metrics**:
1. Active RFPs (12)
2. Avg Cycle Time (4.2 hrs)
3. Win Rate (68%)
4. Total Value ($24.8M)

**Customization Points**:
- Add more metrics
- Connect to real analytics
- Add date range filters
- Make values clickable for drill-down

---

### RFPList.jsx
**Purpose**: RFP inbox and list management
**Features**:
- Tab navigation (4 tabs)
- Search input
- Filter button
- "Add RFP" button
- Grid of RFP cards

**Props**:
- `rfps` - Array of RFP objects
- `activeTab` - Current active tab
- `setActiveTab` - Tab change handler
- `searchQuery` - Search text
- `setSearchQuery` - Search change handler
- `onSelectRFP` - RFP selection handler

**Customization Points**:
- Add more tabs
- Implement advanced filters
- Add sorting options
- Add bulk actions for RFPs

---

### RFPCard.jsx
**Purpose**: Individual RFP display card
**Features**:
- Shipper name and RFP ID
- Status badge
- Template and mode info
- Lane count and triage score
- Completeness progress bar
- Due date countdown
- NDA indicator

**Props**:
- `rfp` - RFP object
- `onClick` - Click handler
- `style` - Animation delay style

**Data Structure**:
```javascript
{
  id: 'RFP-2024-001',
  shipper: 'USPS Northeast',
  dueDate: '2024-12-15T17:00:00',
  mode: 'FTL',
  status: 'In Progress',
  laneCount: 247,
  completeness: 78,
  triageScore: 8.5,
  template: 'USPS Standard',
  hasNDA: true,
  lanes: [...],
  metadata: {...}
}
```

**Customization Points**:
- Add more RFP fields
- Change card layout
- Add quick actions
- Implement drag-and-drop

---

### LaneEditor.jsx
**Purpose**: Lane-by-lane editing interface
**State**:
- `filterText` - Lane filter
- `sortField` - Current sort column
- `sortDirection` - asc/desc
- `selectedLanes` - Set of selected lane IDs
- `selectedLane` - Currently viewed lane
- `showCostPanel` - Cost panel visibility
- `showBulkActions` - Bulk actions visibility

**Features**:
- Back button to RFP list
- Export and Submit buttons
- 6 stat cards (Valid, Warnings, Errors, etc.)
- Search/filter input
- Bulk action buttons
- Select all/clear selection
- Cost stack toggle
- Bulk actions panel

**Customization Points**:
- Add more statistics
- Implement actual export logic
- Add submission validation
- Add approval workflows

---

### LaneTable.jsx
**Purpose**: Data table for lanes
**Features**:
- Checkbox selection
- Sortable columns
- 10 columns of data
- Status indicators
- Edit button per row
- Pagination (shows 50 at a time)

**Props**:
- `lanes` - Array of lane objects
- `selectedLanes` - Set of selected IDs
- `onToggleSelection` - Selection handler
- `onSelectAll` - Select all handler
- `onClearSelection` - Clear selection handler
- `onSelectLane` - Lane click handler
- `sortField` - Current sort field
- `sortDirection` - Sort direction
- `onSort` - Sort handler

**Lane Data Structure**:
```javascript
{
  id: 'LANE-0001',
  origin: 'Chicago, IL',
  destination: 'Miami, FL',
  equipment: 'Dry Van',
  distance: 487,
  volume: 24,
  baseRate: '2.15',
  fuelSurcharge: '0.35',
  accessorials: '127.50',
  deadhead: 45,
  margin: '12.3',
  scenario: 'Base',
  status: 'Valid',
  warnings: [],
  benchmark: '2.20',
  historicalRate: '2.18'
}
```

**Customization Points**:
- Add/remove columns
- Implement inline editing
- Add column reordering
- Add export selected lanes
- Increase pagination limit

---

### CostStackPanel.jsx
**Purpose**: Detailed cost breakdown
**Features**:
- Lane identification
- 4 cost line items
- Subtotal calculation
- Margin calculation
- Final price
- Market benchmark comparison
- Warning display
- Save/Reset buttons

**Calculations**:
- Linehaul = baseRate × distance
- Fuel = fuelSurcharge × distance
- Accessorials = fixed value
- Deadhead = deadhead miles × $1.50
- Subtotal = sum of above
- Margin = subtotal × (margin% / 100)
- Final = subtotal + margin

**Props**:
- `lane` - Lane object
- `onClose` - Close handler

**Customization Points**:
- Add more cost components
- Change calculation formulas
- Add what-if scenarios
- Implement save to database
- Add cost history

---

## Data Flow

### RFP Selection Flow:
1. User clicks RFPCard in RFPList
2. `onSelectRFP(rfp)` called in App
3. `setSelectedRFP(rfp)` updates state
4. App conditionally renders LaneEditor
5. LaneEditor receives rfp with all lanes

### Lane Selection Flow:
1. User clicks checkbox in LaneTable
2. `onToggleSelection(laneId)` called
3. LaneEditor updates `selectedLanes` Set
4. LaneTable re-renders with new selection
5. Bulk actions become available

### Cost Panel Flow:
1. User clicks "Cost Stack" button
2. `setShowCostPanel(true)` in LaneEditor
3. User clicks a lane row
4. `onSelectLane(lane)` called
5. `setSelectedLane(lane)` updates state
6. CostStackPanel renders with lane data

---

## State Management

### Global State (App.jsx)
- Navigation state (tabs, views)
- Search and filters
- Selected RFP

### Local State (LaneEditor.jsx)
- Lane selection
- Sort settings
- Panel visibility
- Bulk action state

### Component State
- Form inputs
- UI toggles
- Hover states

---

## Styling Architecture

### Tailwind Utilities
- Layout: `flex`, `grid`, `container`
- Spacing: `p-*`, `m-*`, `gap-*`
- Colors: `bg-*`, `text-*`, `border-*`
- Effects: `hover:*`, `transition-*`

### Custom Classes (index.css)
- `glass-card` - Glassmorphism effect
- `glass-card-hover` - Hover animations
- `animate-slide-up` - Entrance animation
- `animate-fade-in` - Fade in animation
- `metric-card` - Card with top border pulse
- `mono` - Monospace font

### Color Palette
- Indigo: Primary actions, highlights
- Purple: Secondary, gradients
- Emerald: Success, valid states
- Amber: Warnings, attention
- Red: Errors, urgent
- Slate: UI elements, text

---

## Adding New Features

### Add a New Component:
1. Create file in `src/components/`
2. Import React and any icons
3. Define component function
4. Export default
5. Import in parent component

### Add New State:
1. Use `useState` hook
2. Pass as props to children
3. Update via setter functions
4. Re-render happens automatically

### Add New Data Field:
1. Update `demoData.js`
2. Add to component display
3. Update TypeScript types (if using TS)
4. Test thoroughly

### Add New Route:
1. Install `react-router-dom`
2. Wrap App in `BrowserRouter`
3. Define `Route` components
4. Add navigation links
