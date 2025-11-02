# RAG Chatbot - Screenshots Guide

This document describes the key screens and features of the application.

## Main Interface

### Home Page
![Home Page](screenshots/home.png)

The home page features:
- Clean, modern design with gradient background
- Three-tab navigation: Chat, Upload, Stats
- Responsive layout that works on all devices

## Chat Interface

### Empty State
![Chat Empty](screenshots/chat-empty.png)

When no messages exist:
- Welcome message displayed
- Helpful prompt to upload documents
- Clean, uncluttered interface

### Active Conversation
![Chat Active](screenshots/chat-active.png)

During conversation:
- User messages on the right (blue)
- Assistant messages on the left (gray)
- Avatar icons for each message type
- Timestamp for each message
- "View X sources" link for assistant responses

### Message with Sources
![Message with Sources](screenshots/message-sources.png)

Features:
- Markdown formatting for assistant responses
- Clickable link to view sources
- Real-time typing indicator while processing

## Sources Panel

### Sources Display
![Sources Panel](screenshots/sources-panel.png)

The sources panel shows:
- Source document name
- Page number (for PDFs)
- Relevance score (percentage)
- Text excerpt from the source
- Clean card-based layout

### Source Details
![Source Card](screenshots/source-card.png)

Each source card includes:
- Document icon
- Metadata (file name, page)
- Star rating for relevance
- Highlighted text excerpt
- Hover effects for interactivity

## Upload Interface

### Upload Area
![Upload Interface](screenshots/upload-interface.png)

Features:
- Drag-and-drop zone
- File type restrictions (PDF, TXT)
- Clear instructions
- Visual feedback on hover

### File Selected
![File Selected](screenshots/file-selected.png)

After selecting a file:
- File preview with name and size
- Remove option
- Upload button becomes active
- File type icon

### Upload Success
![Upload Success](screenshots/upload-success.png)

Success state shows:
- Green success message
- Number of chunks indexed
- Clear visual confirmation
- Instructions for next steps

### Upload Error
![Upload Error](screenshots/upload-error.png)

Error state displays:
- Red error message
- Specific error details
- Retry options
- User-friendly error text

## Statistics Dashboard

### Stats Overview
![Stats Dashboard](screenshots/stats-dashboard.png)

The dashboard displays:
- Total documents count
- Collection name
- Embedding model information
- Gradient cards for visual appeal

### Collection Info
![Collection Info](screenshots/collection-info.png)

Detailed information:
- Document count in large, bold text
- Collection metadata
- Model configuration
- Color-coded cards

### Actions Panel
![Actions Panel](screenshots/actions-panel.png)

Administrative actions:
- Clear all documents button
- Confirmation dialog
- Warning messages
- Refresh statistics button

## Responsive Design

### Mobile View - Chat
![Mobile Chat](screenshots/mobile-chat.png)

Mobile optimizations:
- Single column layout
- Full-width messages
- Touch-friendly buttons
- Hamburger menu for tabs

### Mobile View - Upload
![Mobile Upload](screenshots/mobile-upload.png)

Mobile upload:
- Simplified interface
- Large touch targets
- Optimized file picker
- Mobile-friendly feedback

### Tablet View
![Tablet View](screenshots/tablet-view.png)

Tablet layout:
- Adaptive grid
- Sidebar collapse
- Optimized spacing
- Touch and mouse support

## Loading States

### Processing Query
![Loading Query](screenshots/loading-query.png)

Loading indicators:
- Spinning loader icon
- "Thinking..." text
- Disabled input field
- Visual feedback

### Uploading Document
![Loading Upload](screenshots/loading-upload.png)

Upload progress:
- Progress indicator
- "Uploading..." text
- Disabled UI elements
- Cancel option (future)

## Error States

### Backend Connection Error
![Connection Error](screenshots/connection-error.png)

When backend is offline:
- Clear error message
- Troubleshooting hints
- Retry button
- Support information

### Invalid Document Type
![Invalid File](screenshots/invalid-file.png)

File validation:
- Red error highlight
- Specific error message
- Supported formats list
- Clear call to action

## Interactive Elements

### Hover States
![Hover Effects](screenshots/hover-effects.png)

Interactive feedback:
- Button hover effects
- Card elevation on hover
- Color transitions
- Cursor changes

### Focus States
![Focus States](screenshots/focus-states.png)

Accessibility features:
- Clear focus rings
- Keyboard navigation
- Tab order optimization
- ARIA labels

## Theme and Colors

### Color Palette
![Color Palette](screenshots/color-palette.png)

Primary colors:
- Primary Blue: #0ea5e9
- Success Green: #10b981
- Error Red: #ef4444
- Gray Scale: #1f2937 to #f9fafb

### Typography
![Typography](screenshots/typography.png)

Font system:
- Inter font family
- Clear hierarchy
- Readable sizes
- Proper spacing

## Animations

### Fade-In Animation
Messages and components fade in smoothly when appearing

### Spin Animation
Loading indicators spin continuously during processing

### Transition Effects
All interactive elements have smooth color and transform transitions

---

## How to Capture Screenshots

If you want to update these screenshots:

1. Start the application
2. Navigate to each section
3. Use browser DevTools device toolbar for responsive views
4. Capture at 1920x1080 for desktop
5. Save as PNG in `screenshots/` directory
6. Use descriptive filenames

## Design Guidelines

When making changes, maintain:
- Consistent spacing (4px grid)
- Rounded corners (8px standard)
- Shadow elevation (3 levels)
- Color contrast (WCAG AA minimum)
- Responsive breakpoints (640px, 768px, 1024px)

---

Note: Screenshots are not included in this repository but can be generated by running the application and capturing screens as described above.
