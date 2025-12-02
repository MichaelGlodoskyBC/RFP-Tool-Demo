# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies
Open your terminal in this folder and run:
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Open in Browser
The app will automatically open at `http://localhost:3000`

---

## What You'll See

### Main Dashboard
- **4 Metric Cards**: Active RFPs, Cycle Time, Win Rate, Total Value
- **RFP Cards**: Click any card to view its lanes
- **Tabs**: Switch between Inbox, In Progress, Submitted, Awarded
- **Search**: Filter RFPs by shipper name or ID

### Lane Editor (Click any RFP)
- **Quick Stats**: Valid, Warnings, Errors, Margins, Distance, Volume
- **Lane Table**: Sortable columns, select multiple lanes
- **Bulk Actions**: Apply scenarios, adjust fuel, tag lanes
- **Cost Stack**: Click "Cost Stack" and select a lane to see detailed breakdown
- **Submit**: Export or submit the RFP

---

## Making Changes

### Edit Components
All components are in `src/components/`:
- `Header.jsx` - Top navigation
- `Dashboard.jsx` - Metric cards
- `RFPList.jsx` - Tabs and search
- `RFPCard.jsx` - Individual RFP cards
- `LaneEditor.jsx` - Lane editing screen
- `LaneTable.jsx` - Data table
- `CostStackPanel.jsx` - Cost breakdown

### Edit Data
- `src/data/demoData.js` - Modify RFPs, lanes, scenarios

### Edit Styles
- `src/index.css` - Global styles and animations
- `tailwind.config.js` - Tailwind customization

---

## Tips for Cursor

### Use AI to:
1. **Add new features**: "Add a filter dropdown for equipment type"
2. **Modify styling**: "Make the cards larger with more spacing"
3. **Change data**: "Add more lane fields like delivery windows"
4. **Fix bugs**: "The sort isn't working correctly on the margin column"

### Useful Commands:
- `Cmd/Ctrl + K` - Open Cursor AI chat
- `Cmd/Ctrl + L` - Quick AI edit
- `Cmd/Ctrl + P` - Quick file open

---

## Common Tasks

### Add a New Metric Card
Edit `src/components/Dashboard.jsx` and add a new `<MetricCard />` component.

### Change Colors
Edit `tailwind.config.js` to add custom colors, or modify `src/index.css` for gradients.

### Add New RFP Data
Edit `src/data/demoData.js` and add objects to the `demoRFPs` array.

### Modify Lane Calculations
Edit `src/components/CostStackPanel.jsx` to change cost calculations.

---

## Troubleshooting

### Port Already in Use
If port 3000 is taken, Vite will suggest another port automatically.

### Module Not Found
Run `npm install` again to ensure all dependencies are installed.

### Styles Not Updating
Restart the dev server: `Ctrl+C` then `npm run dev`

---

## Next Steps

1. **Customize the data** to match your real RFPs
2. **Add API integration** to fetch real data
3. **Implement authentication** for multi-user access
4. **Add more features** from the requirements document
5. **Deploy** to production when ready

Happy coding! 🚀
