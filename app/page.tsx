import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="flex flex-col bg-background text-on-surface">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 h-20 bg-[#0B0F14]/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex flex-col items-start">
          <span className="text-2xl font-bold tracking-tighter text-primary font-headline">MARKETA AI</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium font-body">Intelligence Interface</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Platform</a>
          <a href="#" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Solutions</a>
          <a href="#" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Resources</a>
          <a href="#" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-8 min-h-screen flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none opacity-50 transition-opacity duration-1000"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/10 blur-[100px] rounded-full pointer-events-none opacity-30"></div>

        <section className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low ghost-border text-[11px] font-bold text-indigo-300 uppercase tracking-widest mb-4">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Intelligence Alpha 2.0 is Here
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight font-headline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent pb-4">
            The Ethereal <br /> Command for AI
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-body leading-relaxed">
            Move beyond templates. Marketa AI is a high-fidelity environment designed for AI-native workflows, 
            fluid intelligence, and premium performance.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
            <Link href="/dashboard">
              <Button size="lg" className="h-[64px] px-10">Start Your Campaign</Button>
            </Link>
            <Button variant="secondary" size="lg" className="h-[64px] px-10 flex items-center gap-3">
              <span className="material-symbols-outlined text-lg">play_circle</span>
              Watch Interface Demo
            </Button>
          </div>
        </section>

        {/* Floating dashboard preview (Glassmorphic) */}
        <section className="relative z-10 mt-20 w-full max-w-6xl mx-auto aspect-video rounded-[3rem] bg-surface-container-high/40 glass-panel ghost-border p-4 shadow-2xl shadow-black/40 group hover:scale-[1.01] transition-transform duration-700">
           <div className="w-full h-full rounded-[2.5rem] bg-surface-container-lowest overflow-hidden flex flex-col">
              {/* Header inside preview */}
              <div className="h-12 border-b border-white/5 flex items-center px-6 gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-error/20 border border-error/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/30"></div>
                </div>
                <div className="flex-1"></div>
                <div className="h-4 w-32 bg-surface-container rounded-full ghost-border"></div>
                <div className="h-6 w-6 rounded-full bg-primary/20 border border-primary/30"></div>
              </div>
              {/* Content body inside preview */}
              <div className="flex-1 flex p-6 gap-8 text-left">
                {/* Left side nav inside preview */}
                <div className="w-1/4 flex flex-col gap-3">
                  <div className="h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"></div>
                  <div className="h-8 bg-white/5 rounded-lg"></div>
                  <div className="h-8 bg-white/5 rounded-lg"></div>
                  <div className="h-8 bg-white/5 rounded-lg"></div>
                </div>
                {/* Main content grid inside preview */}
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div className="col-span-2 h-40 bg-gradient-to-br from-surface-container-low to-indigo-900/10 rounded-2xl ghost-border p-6 flex flex-col justify-end">
                    <div className="h-4 w-24 bg-indigo-400/20 rounded-full mb-2"></div>
                    <div className="h-8 w-48 bg-on-surface/10 rounded-full"></div>
                  </div>
                  <div className="h-40 bg-surface-container rounded-2xl ghost-border"></div>
                  <div className="h-40 bg-surface-container rounded-2xl ghost-border"></div>
                </div>
              </div>
           </div>
        </section>
      </main>

      {/* Features Grid */}
      <section className="py-24 px-8 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div className="bg-surface-container-low p-8 rounded-[2rem] ghost-border flex flex-col items-start gap-6 hover:bg-surface-container transition-colors duration-500 group">
          <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5 group-hover:bg-primary group-hover:text-on-primary transition-all duration-500">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </div>
          <h3 className="text-2xl font-bold font-headline">Synthetic Content</h3>
          <p className="text-slate-400 font-body leading-relaxed">
            Generate high-fidelity marketing assets in seconds. Our AI-native engine understands brand voice with cinematic precision.
          </p>
        </div>

        <div className="bg-surface-container-low p-8 rounded-[2rem] ghost-border flex flex-col items-start gap-6 hover:bg-surface-container transition-colors duration-500 group">
          <div className="w-14 h-14 bg-secondary/10 border border-secondary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/5 group-hover:bg-secondary group-hover:text-on-secondary transition-all duration-500">
            <span className="material-symbols-outlined text-3xl">insights</span>
          </div>
          <h3 className="text-2xl font-bold font-headline">Editorial Asymmetry</h3>
          <p className="text-slate-400 font-body leading-relaxed">
            Real-time tracking of intelligence flows. We curate data to show only what matters, signaling sophisticated insights.
          </p>
        </div>

        <div className="bg-surface-container-low p-8 rounded-[2rem] ghost-border flex flex-col items-start gap-6 hover:bg-surface-container transition-colors duration-500 group">
          <div className="w-14 h-14 bg-tertiary/10 border border-tertiary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-tertiary/5 group-hover:bg-tertiary group-hover:text-on-tertiary transition-all duration-500">
            <span className="material-symbols-outlined text-3xl">fluid</span>
          </div>
          <h3 className="text-2xl font-bold font-headline">Fluid Intelligence</h3>
          <p className="text-slate-400 font-body leading-relaxed">
            AI-optimized funnels that learn with every interaction. Budget allocation that moves at the speed of thought.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5 bg-[#0B0F14]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 opacity-60">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold tracking-tighter font-headline text-on-surface">MARKETA AI</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Crafted with Synthetic Intelligence</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Security</a>
          </div>
          <p className="text-xs text-slate-500">© 2024 Marketa AI. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
