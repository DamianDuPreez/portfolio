import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutMe from './components/AboutMe';
import ProjectGallery from './components/ProjectGallery';
import ContactForm from './components/ContactForm';

function AppContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans selection:bg-brand-500/30 transition-all duration-[1500ms] ease-in-out">
      <Navbar />
      
      <main>
        <HeroSection />
        <AboutMe />
        <ProjectGallery />
        <ContactForm />
      </main>

      <footer className="py-8 bg-slate-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 transition-all duration-[1500ms] ease-in-out">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <p>&copy; {new Date().getFullYear()} Portfolio. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
