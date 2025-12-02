# RFP Command - Freight Pricing Engine

A comprehensive RFP/RFQ management and pricing tool for freight/logistics companies.

## Features

### Core Capabilities
- **Fast RFP Intake**: Auto-detect, fingerprint templates, extract metadata, smart triage scoring
- **Lane-Level QA**: Excel-like grid with bulk editing, scenario management, validation
- **Cost Analysis**: Detailed cost stack with linehaul, fuel, deadhead, accessories, margin
- **Data Enrichment**: Benchmarking, historical data, distance calculation
- **Analytics Dashboard**: Cycle time, win rate, completion tracking
- **Professional UI**: Dark theme with glassmorphism, smooth animations

### Key Workflows
1. **Inbox Management** - View and triage incoming RFPs
2. **Lane Editing** - Granular pricing control per lane
3. **Bulk Operations** - Apply scenarios, adjust fuel, tag lanes
4. **Cost Breakdown** - Detailed analysis with benchmarking
5. **Submission** - Export and submit with validation

## Project Structure

```
RFP Tool Demo/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # Top navigation bar
│   │   ├── Dashboard.jsx           # Metrics dashboard
│   │   ├── RFPList.jsx             # RFP inbox/list view
│   │   ├── RFPCard.jsx             # Individual RFP card
│   │   ├── LaneEditor.jsx          # Lane editing interface
│   │   ├── LaneTable.jsx           # Lane data table
│   │   └── CostStackPanel.jsx      # Cost breakdown panel
│   ├── data/
│   │   └── demoData.js             # Demo RFP and lane data
│   ├── App.jsx                     # Main application component
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
└── postcss.config.js               # PostCSS config
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## Usage

### Development
The app will run at `http://localhost:3000` with hot module reloading enabled.

### Editing Components
All React components are in `src/components/`. Each component is self-contained and can be edited independently:

- **Header.jsx** - Modify the top bar, logo, user menu
- **Dashboard.jsx** - Change metrics and KPIs
- **RFPList.jsx** - Adjust tabs, search, filters
- **RFPCard.jsx** - Customize RFP card layout
- **LaneEditor.jsx** - Modify lane editing interface
- **LaneTable.jsx** - Change table columns, sorting
- **CostStackPanel.jsx** - Adjust cost calculations

### Customizing Data
Edit `src/data/demoData.js` to:
- Add/remove demo RFPs
- Change lane generation logic
- Modify scenario configurations
- Update pricing calculations

### Styling
- Global styles: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Component-specific styles: Inline with Tailwind classes

## Technology Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Custom Fonts** - Outfit (sans) + JetBrains Mono (monospace)

## Design System

### Colors
- Background: Slate 950 → Indigo 950 gradient
- Primary: Indigo 600
- Secondary: Purple 600
- Success: Emerald 400
- Warning: Amber 400
- Error: Red 400

### Components
- Glass cards with backdrop blur
- Neon borders and glows
- Smooth animations and transitions
- Responsive grid layouts

## Keyboard Shortcuts

- **Search**: Click search input or start typing
- **Select All**: Click "Select All" button
- **Clear Selection**: Press X button when items selected

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Proprietary - Internal Use Only
