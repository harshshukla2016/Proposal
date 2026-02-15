<div align="center">

# 💫 Galactic Memory Odyssey

### *An Immersive 3D Interactive Proposal Experience*

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.158.0-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)


*A stunning 3D world where memories come alive in a cyberpunk-inspired Neo-Love City*

[✨ Live Demo](https://proposal-harshshukla2016s-projects.vercel.app) • [📖 Documentation](#features) • [🚀 Quick Start](#quick-start)

</div>

---

## 🌟 What is Galactic Memory Odyssey?

**Galactic Memory Odyssey** is a breathtaking 3D interactive web experience that transforms the traditional proposal into an unforgettable journey through a virtual city of memories. Built with cutting-edge web technologies, it creates an immersive world where users can explore, collect memories, and experience a personalized proposal in a stunning cyberpunk environment.

### 🎯 The Experience

Navigate through **Neo-Love City**, a beautifully rendered 3D metropolis filled with:
- 🏙️ **Interactive Memory Crystals** scattered throughout the city
- 🏰 **The Love Palace** - A grand castle at the heart of the city
- 🎮 **Full Desktop & Mobile Support** with intuitive controls
- 🎨 **Stunning Visual Effects** including bloom, vignette, and dynamic lighting
- 🎵 **Multimedia Integration** with music and video support
- 🗺️ **Real-time Minimap** for easy navigation

---

## ✨ Features

### 🎮 **Immersive 3D World**
- **Photorealistic Graphics**: Built with Three.js and React Three Fiber
- **Dynamic City**: Procedurally generated buildings, roads, and landmarks
- **Atmospheric Effects**: Sky, fog, mountains, rivers, and grass fields
- **Post-Processing**: Bloom and vignette effects for cinematic quality

### 💎 **Memory Collection System**
- **Interactive Crystals**: Collect memory crystals scattered across the city
- **AI-Generated Narratives**: Powered by Google's Gemini AI
- **Photo Memories**: Upload and view cherished photos in 3D frames
- **Progress Tracking**: Real-time collection status with Supabase

### 🏰 **The Love Palace**
- **Grand Interior**: Explore a beautifully designed castle interior
- **Proposal Scene**: Cinematic heart-burst animation and video playback
- **Music Integration**: Background music with YouTube support
- **Mobile Optimized**: Touch controls for palace exploration

### 📱 **Cross-Platform Controls**

#### Desktop:
- **W/A/S/D** - Move around the city
- **Mouse** - Look around (click to lock pointer)
- **E** - Interact with memory crystals
- **ESC** - Exit pointer lock

#### Mobile:
- **Virtual Joystick** - Bottom-left corner for movement
- **Touch & Drag** - Right side of screen to look around
- **Tap** - Interact with objects
- **Responsive UI** - Optimized minimap and controls

### 🗺️ **Advanced Navigation**
- **GTA-Style Minimap**: Real-time position tracking
- **Landmark Indicators**: Shops, palace, and memory locations
- **Responsive Design**: Smaller map on mobile (140px vs 220px)
- **Fixed Positioning**: Always visible in top-right corner

### 🎨 **Visual Polish**
- **Glassmorphism UI**: Modern, translucent interface elements
- **Smooth Animations**: GSAP-powered transitions
- **Dynamic Lighting**: Directional and ambient lighting
- **Particle Effects**: Sparkles and heart-burst animations

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harshshukla2016/Proposal.git
   cd galactic-memory-odyssey
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Configure Supabase** (Optional - for memory persistence)
   
   Update `constants.ts` with your Supabase credentials:
   ```typescript
   export const SUPABASE_URL = 'your_supabase_url';
   export const SUPABASE_ANON_KEY = 'your_supabase_anon_key';
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000` (or the port shown in terminal)

### Building for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

### Core Technologies
- **React 18.2.0** - UI framework
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool and dev server
- **Three.js 0.158.0** - 3D graphics engine

### 3D & Graphics
- **@react-three/fiber 8.15.0** - React renderer for Three.js
- **@react-three/drei 9.88.0** - Useful helpers for R3F
- **@react-three/postprocessing 2.15.1** - Post-processing effects
- **GSAP 3.12.5** - Animation library

### Backend & AI
- **@supabase/supabase-js 2.39.8** - Database and authentication
- **@google/genai 1.39.0** - Google Gemini AI integration

### State Management
- **Zustand 4.4.7** - Lightweight state management
- **React Router DOM 6.22.3** - Client-side routing

---

## 📁 Project Structure

```
galactic-memory-odyssey/
├── components/          # Reusable UI components
│   ├── LoadingScreen.tsx
│   ├── MobileJoystick.tsx
│   ├── MemoryUpload.tsx
│   └── ProposalUI.tsx
├── scenes/             # 3D scenes and environments
│   ├── LoveCityScene.tsx    # Main city scene
│   ├── CastleInterior.tsx   # Palace interior
│   ├── CityAssets.tsx       # City buildings & objects
│   ├── MemoryFrame.tsx      # 3D photo frames
│   └── MemoryCrystal.tsx    # Collectible crystals
├── hooks/              # Custom React hooks
│   └── useStore.ts     # Zustand store
├── services/           # API and external services
│   ├── apiService.ts   # Supabase integration
│   └── geminiService.ts # AI narrative generation
├── types/              # TypeScript type definitions
│   └── index.ts
├── constants.ts        # App configuration
└── App.tsx            # Root component
```

---

## 🎮 How to Use

### For Developers

1. **Customize the Proposal**
   - Edit `constants.ts` to change default proposal text
   - Modify `CastleInterior.tsx` for custom palace experience
   - Update memory crystal positions in `LoveCityScene.tsx`

2. **Add Custom Memories**
   - Use the `MemoryUpload` component to add photos
   - Memories are stored in Supabase
   - AI generates unique narratives for each memory

3. **Styling & Theming**
   - All UI uses inline styles for easy customization
   - Modify color schemes in component files
   - Adjust lighting in scene files for different moods

### For Users

1. **Explore the City**
   - Walk around using WASD (desktop) or joystick (mobile)
   - Look for glowing memory crystals
   - Check the minimap for navigation

2. **Collect Memories**
   - Approach memory crystals
   - Press E (desktop) or tap (mobile) to interact
   - View photos and read AI-generated stories

3. **Enter the Palace**
   - Navigate to the center of the city
   - Enter the Love Palace for the proposal
   - Experience the cinematic heart animation

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push to main

### Other Platforms

The app can be deployed to any static hosting service:
- **Netlify**: Drag & drop the `dist` folder
- **GitHub Pages**: Use `gh-pages` package
- **AWS S3**: Upload build files to S3 bucket

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI narratives | Yes |
| `SUPABASE_URL` | Supabase project URL | Optional |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |

### Supabase Setup

If using Supabase for memory persistence, run this SQL in your Supabase dashboard:

```sql
-- Create memories table
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT,
  caption TEXT,
  position_x FLOAT,
  position_y FLOAT,
  position_z FLOAT,
  collected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create proposal_data table
CREATE TABLE proposal_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_name TEXT,
  proposal_text TEXT,
  music_url TEXT,
  music_start_time INTEGER DEFAULT 0,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎨 Customization Guide

### Changing Colors

Edit the color scheme in `LoveCityScene.tsx`:
```typescript
// Sky color
<color attach="background" args={['#87CEEB']} />

// UI accent colors
className="text-pink-300" // Change to your preferred color
```

### Adding New Landmarks

In `CityAssets.tsx`, add to the `generateCityLayout` function:
```typescript
items.push({
  type: 'landmark',
  position: [x, 0, z],
  name: 'Your Landmark',
  color: '#yourcolor'
});
```

### Modifying Controls

Adjust sensitivity in `LoveCityScene.tsx`:
```typescript
const sensitivity = 0.005; // Lower = slower camera
const speed = 10 * delta;  // Higher = faster movement
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Black screen on load
- **Solution**: Check console for errors, ensure all dependencies are installed

**Issue**: Textures not loading
- **Solution**: Verify image URLs are accessible, check CORS settings

**Issue**: Joystick not appearing on mobile
- **Solution**: Clear browser cache, ensure mobile detection is working

**Issue**: Supabase connection errors
- **Solution**: Verify credentials in `constants.ts`, check Supabase dashboard

### Performance Optimization

- Reduce `MAP_SIZE` in minimap for better mobile performance
- Lower `fov` in Camera settings for less rendering
- Disable post-processing effects on low-end devices

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 🙏 Acknowledgments

- **Three.js** - Amazing 3D graphics library
- **React Three Fiber** - Seamless React integration
- **Google Gemini** - AI-powered narratives
- **Supabase** - Backend infrastructure
- **Vercel** - Hosting and deployment

---

<div align="center">

### Made with 💖 by Harsh Shukla

*Transforming proposals into unforgettable 3D experiences*

[⬆ Back to Top](#-galactic-memory-odyssey)

</div>
