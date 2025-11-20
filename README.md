# Personal Portfolio - Zhou Rui

A modern, interactive portfolio website showcasing academic research, battery engineering expertise, and iOS development projects.

🌐 **Live Site**: [https://me.1sec.plus](https://me.1sec.plus)

## 🎯 Features

### Three Distinct Views

1. **🔬 Academic Mode**
   - Research publications with interactive cards
   - Patent applications
   - Conference presentations
   - Downloadable Academic CV

2. **🔋 Engineer Mode**
   - Interactive 3D battery visualization with scroll-driven animations
   - Multi-scale battery exploration (Atom → Particle → Cell → Optimization)
   - Research areas: cathode materials, solid-state electrolytes, anode materials
   - Modeling expertise: DFT, MD, DEM, parameter identification, ML
   - Downloadable industry resume

3. **👨‍💻 Developer Mode**
   - iOS development projects (Swift/SwiftUI)
   - App showcases with screenshots
   - GitHub links and project descriptions

### Technical Highlights

- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Safari-Optimized**: Smooth animations across all browsers
- **Scroll-Driven Animations**: 3D battery components respond to scroll position
- **Modern UI**: Built with React 19, Tailwind CSS 4, and Lucide icons
- **Fast Loading**: Vite-powered build system
- **Automatic Deployment**: GitHub Actions CI/CD pipeline

## 🛠️ Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.2
- **Styling**: Tailwind CSS 4.1.17
- **Icons**: Lucide React 0.554.0
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 🚀 Quick Start

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/zrzrv5/aboutme.git
cd aboutme

# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📂 Project Structure

```
aboutme/
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Navigation tabs
│   │   ├── Footer.jsx           # Social links
│   │   ├── AcademicView.jsx     # Research & publications
│   │   ├── BatteryExplorer.jsx  # Interactive 3D battery visualization
│   │   └── DeveloperView.jsx    # iOS projects showcase
│   ├── App.jsx                  # Main app component
│   ├── index.css                # Global styles
│   └── main.jsx                 # Entry point
├── public/
│   ├── ZHOU_Rui_CV_2025.pdf    # Academic CV
│   ├── ZHOU_Rui_Resume_2025.pdf # Industry resume
│   ├── publications.json        # Publication data
│   └── images/                  # Project images
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions deployment
└── vite.config.js               # Vite configuration
```

## 🎨 Key Components

### BatteryExplorer (Engineer Mode)
- **Lines**: 780+
- **Features**: Scroll-driven 3D animations, conditional rendering for performance, Safari-optimized transforms
- **Scales**: Atomic (Å) → Particle (µm) → Cell → Optimization
- **Technologies**: React hooks, requestAnimationFrame, CSS 3D transforms

### AcademicView
- Interactive publication cards with expandable details
- Patent showcase
- Dynamic content loading

### DeveloperView
- Project galleries with responsive layouts
- External links to GitHub and live demos
- Mobile-optimized card designs

## 🌍 Deployment

The site automatically deploys to GitHub Pages when pushing to the `main` or `v2` branch.

### Manual Deployment

```bash
npm run deploy
```

This builds the project and pushes to the `gh-pages` branch.

### GitHub Actions Workflow

The `.github/workflows/deploy.yml` workflow:
1. Triggers on push to `main` or `v2`
2. Installs Node.js 20
3. Installs dependencies with `npm ci`
4. Builds the project with `npm run build`
5. Deploys `dist/` folder to GitHub Pages

## 📝 Content Management

### Adding Publications

Edit `public/publications.json`:

```json
{
  "title": "Your Paper Title",
  "authors": ["Author 1", "Author 2"],
  "journal": "Journal Name",
  "year": 2025,
  "link": "https://doi.org/...",
  "image": "/images/publications/your_image.png",
  "description": "Paper description"
}
```

### Updating CV/Resume

Replace files in `public/`:
- `ZHOU_Rui_CV_2025.pdf`
- `ZHOU_Rui_Resume_2025.pdf`

## 🐛 Known Issues & Solutions

### Safari Performance
- ✅ **Fixed**: Removed CSS transitions from scroll-driven transforms
- ✅ **Fixed**: Conditional rendering for atom/particle views
- ✅ **Fixed**: Added `willChange` hints for compositor optimization

### Text Alignment
- ✅ **Fixed**: Adjusted letter-spacing from `tracking-tighter/widest` to `tracking-tight/wide`
- ✅ **Fixed**: Added explicit `textAlign: 'center'` for cross-browser consistency

### Mobile Floating Tab
- ✅ **Fixed**: Responsive width constraints with `max-width: min(520px, calc(100vw - 32px))`

## 📄 License

This project is personal portfolio code. Feel free to use it as inspiration for your own portfolio.

## 👤 Author

**Zhou Rui**

- LinkedIn: [https://www.linkedin.com/in/zrzrv5](https://www.linkedin.com/in/zrzrv5)
- GitHub: [https://github.com/zrzrv5](https://github.com/zrzrv5)
- Email: [Your email if you want to include it]

---

**Status**: ✅ Production Ready | Last Updated: November 2024
