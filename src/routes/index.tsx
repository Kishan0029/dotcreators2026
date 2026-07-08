import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { MapPin, ArrowRight, Check, X, Loader2, Upload, AlertCircle } from "lucide-react";
import confetti from "canvas-confetti";
import paiLogo from "@/assets/pai-convention.png";
import dotLogo from "@/assets/logo2026.png";
import dotLogoPng from "@/assets/dotlogo.png";
import summitLogo from "@/assets/summit-logo.png";
import unionLogo from "@/assets/Union.png";
// Import the Supabase client you created
import { supabase } from "@/lib/supabaseClient";
import LiquidBackground from "@/components/LiquidBackground";
import frame14 from "@/assets/Frame 14.png";
import frame15 from "@/assets/frame 15.png";
import frame16 from "@/assets/frame 16.png";
import frame17 from "@/assets/Frame 17.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Creator Summit 2026 — You're Invited" },
      { name: "description", content: "An invitation-only gathering of India's leading content creators at Pai Convention Hall, Belagavi." },
      { property: "og:title", content: "Creator Summit 2026 — You're Invited" },
      { property: "og:description", content: "Connect • Collaborate • Grow. Hosted by Dot Entertainments at Pai Convention Hall." },
    ],
  }),
  component: Index,
});

const NICHES = ["Video", "Tech", "Fashion / Lifestyle", "Photography", "Business / Founders", "Other"];

function DotLogo({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <img
        src={dotLogo}
        alt="Dot Entertainments"
        className={`object-contain ${className}`}
      />
    </div>
  );
}

function FadeIn({ children, delay = 0, y = 24 }: { children: React.ReactNode; delay?: number; y?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const fireConfetti = () => {
  // Center burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8A2BE2', '#4B0082', '#9370DB', '#4169E1', '#00BFFF', '#6A0DAD', '#FFD700']
  });

  // Creator Emoji explosion
  setTimeout(() => {
    (confetti as any)({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.55 },
      flat: true,
      scalar: 2.2,
      shapes: ['emoji'],
      shapeOptions: {
        emoji: {
          value: ['🎥', '📸', '🌟', '👑', '🎉', '✨', '🎬', '💡', '🚀', '🎨']
        }
      }
    });
  }, 150);

  // Left cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.85 },
      colors: ['#8A2BE2', '#4B0082', '#9370DB', '#4169E1', '#00BFFF']
    });
  }, 300);

  // Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.85 },
      colors: ['#8A2BE2', '#4B0082', '#9370DB', '#4169E1', '#00BFFF']
    });
  }, 500);

  // Gentle snow confetti for secondary effect
  setTimeout(() => {
    confetti({
      particleCount: 40,
      decay: 0.91,
      scalar: 0.8,
      origin: { y: 0.35 },
      colors: ['#8A2BE2', '#9370DB', '#FFD700']
    });
  }, 750);
};

function Index() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", handle: "", niche: NICHES[0] });
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(14);
  const [currentFrameMobile, setCurrentFrameMobile] = useState(15);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);


  // Set client flag on mount to defeat server minification errors safely
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cycle background images every 3 seconds
  useEffect(() => {
    if (!isClient) return;
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev === 14 ? 17 : 14));
      setCurrentFrameMobile((prev) => (prev === 15 ? 16 : 15));
    }, 3000);
    return () => clearInterval(timer);
  }, [isClient]);

  // Listen for loader completion event
  useEffect(() => {
    const handleLoaderComplete = () => {
      setLoaderComplete(true);
    };

    window.addEventListener('loader-complete', handleLoaderComplete);
    return () => window.removeEventListener('loader-complete', handleLoaderComplete);
  }, []);

  function handlePhotoSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be smaller than 5MB.");
      return;
    }
    setPhotoFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Modified to handle async backend insert
  async function submitRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.handle.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder.supabase.co");

      if (isPlaceholder) {
        // Simulated network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Demo Mode: Simulated successful registration submit:", {
          full_name: form.name.trim(),
          email: email.trim(),
          social_handle: form.handle.trim(),
          niche: form.niche,
          photo_name: photoFile ? photoFile.name : null
        });
        setSubmitted(true);
        return;
      }

      let photoUrl = "";
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload photo to Supabase Storage in 'registrations' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("registrations")
          .upload(filePath, photoFile, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL for the uploaded photo
        const { data: { publicUrl } } = supabase.storage
          .from("registrations")
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from("registrations")
        .insert([
          {
            full_name: form.name.trim(),
            email: email.trim(),
            social_handle: form.handle.trim(),
            niche: form.niche,
            photo_url: photoUrl || null,
          }
        ]);

      if (error) {
        throw error;
      }

      setSubmitted(true);
    } catch (error: any) {
      console.error("Error submitting registration:", error.message);
      alert(`Oops! Something went wrong: ${error.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  }

  // SSR Guard Rule: Render a loading state during Vercel server compile
  if (!isClient) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center bg-background text-foreground overflow-x-hidden">
      <LiquidBackground />

      {/* Background Image (Creators Group) */}
      <div className="absolute inset-x-0 top-0 z-0 w-full h-[120vh] min-h-[750px] sm:min-h-[900px] pointer-events-none overflow-hidden select-none flex justify-center">
        {/* PC View: Frame 14 & 17 Smooth Crossfade */}
        <div className="hidden md:block absolute inset-0 w-full h-full">
          <motion.img
            src={frame14}
            alt=""
            animate={{ opacity: currentFrame === 14 ? 0.85 : 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-top select-none"
          />
          <motion.img
            src={frame17}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: currentFrame === 17 ? 0.85 : 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-top select-none"
          />
        </div>
        {/* Mobile View: Frame 15 & 16 Smooth Crossfade */}
        <div className="block md:hidden absolute inset-0 w-full h-full">
          <motion.img
            src={frame15}
            alt=""
            animate={{ opacity: currentFrameMobile === 15 ? 0.85 : 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-top select-none"
          />
          <motion.img
            src={frame16}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: currentFrameMobile === 16 ? 0.85 : 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-top select-none"
          />
        </div>
        {/* Subtle gradient overlay to fade the image into the page background at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* Ambient aura */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[18%] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_var(--color-aura-1),_transparent_60%)] blur-3xl" />
        <div className="absolute left-[20%] top-[60%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_at_center,_var(--color-aura-2),_transparent_60%)] blur-3xl" />
        <div className="absolute right-[10%] top-[80%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle_at_center,_var(--color-aura-1),_transparent_60%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-[50vh] bg-gradient-to-t from-[#0060FF]/30 to-transparent blur-3xl" />
        <div className="absolute inset-0 grain opacity-[0.4]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full flex items-center justify-between px-6 py-6 sm:px-10 sm:py-8 max-w-[1400px]">
        <DotLogo />
        <div className="flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />
          Belagavi, KA
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center px-6 pt-12 pb-24 text-center sm:pt-20 sm:pb-32">
        <FadeIn delay={0}>
          <div className="mb-6 flex justify-center">
            <img
              src={summitLogo}
              alt="Dot Creator Summit"
              className="h-20 sm:h-28 w-auto object-contain mix-blend-multiply brightness-0"
              style={{ filter: 'brightness(0)' }}
            />
          </div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-accent" />
            Creator Summit · 2026
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h1 className="font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] tracking-tight text-balance">
            You're <em className="italic text-transparent bg-clip-text bg-gradient-to-br from-[oklch(0.2_0.05_285)] via-[oklch(0.55_0.22_285)] to-[oklch(0.7_0.18_285)]">Invited.</em>
          </h1>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Connect with leading creators and visionary founders, discover new opportunities,
            and build relationships that drive innovation.
          </p>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="mt-8 flex items-center gap-4 text-[11px] uppercase tracking-[0.3em] text-muted-foreground/80">
            <span>Connect</span>
            <span className="h-px w-6 bg-border" />
            <span>Collaborate</span>
            <span className="h-px w-6 bg-border" />
            <span>Grow</span>
          </div>
        </FadeIn>

        {/* Floating card */}
        <FadeIn delay={0.35}>
          <div className="relative mt-14 w-full max-w-md mx-auto">
            <div className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,_var(--color-aura-1),_transparent_70%)] blur-2xl" />
            <div className="relative glass rounded-3xl p-7 sm:p-8">
              {!submitted ? (
                <>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                    <span className="block h-1.5 w-1.5 rounded-full bg-accent animate-blink" />
                    Soon · Date to be Announced
                  </div>
                  <h2 className="font-display text-3xl leading-tight sm:text-4xl text-foreground">
                    Register to Join
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Register your interest to secure your creator pass.
                  </p>
                  <form onSubmit={submitRegistration} className="mt-6 space-y-4 text-left">
                    <Field label="Full name">
                      <input
                        required
                        disabled={loading}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input disabled:opacity-50"
                        placeholder="Your name"
                      />
                    </Field>
                    <Field label="Invitation email address">
                      <input
                        type="email"
                        required
                        disabled={loading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input disabled:opacity-50"
                        placeholder="you@example.com"
                      />
                    </Field>
                    <Field label="Instagram / YouTube Link or Handle">
                      <input
                        required
                        disabled={loading}
                        value={form.handle}
                        onChange={(e) => setForm({ ...form, handle: e.target.value })}
                        className="input disabled:opacity-50"
                        placeholder="https://instagram.com/yourhandle"
                      />
                    </Field>
                    <Field label="Primary niche">
                      <select
                        disabled={loading}
                        value={form.niche}
                        onChange={(e) => setForm({ ...form, niche: e.target.value })}
                        className="input appearance-none cursor-pointer disabled:opacity-50"
                      >
                        {NICHES.map((n) => <option key={n} value={n} className="bg-card text-foreground">{n}</option>)}
                      </select>
                    </Field>
                    <Field label="Creator Photo">
                      <div
                        className={`relative flex flex-col items-center justify-center border border-dashed rounded-xl p-6 transition-all cursor-pointer ${photoPreview
                            ? "border-accent/40 bg-white/60 backdrop-blur-[4px]"
                            : "border-border/80 hover:border-accent/60 bg-white/40 hover:bg-white/60 backdrop-blur-[4px]"
                          }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (loading) return;
                          const files = e.dataTransfer.files;
                          if (files && files[0]) {
                            handlePhotoSelect(files[0]);
                          }
                        }}
                        onClick={() => {
                          if (!loading && !photoPreview) {
                            document.getElementById("photo-upload-input")?.click();
                          }
                        }}
                      >
                        <input
                          id="photo-upload-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={loading}
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              handlePhotoSelect(files[0]);
                            }
                          }}
                        />

                        {photoPreview ? (
                          <div className="flex items-center gap-4 w-full">
                            <div className="relative h-16 w-16 rounded-full overflow-hidden border border-border bg-muted shrink-0">
                              <img
                                src={photoPreview}
                                alt="Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {photoFile?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(photoFile?.size ? photoFile.size / (1024 * 1024) : 0).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={loading}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotoFile(null);
                                setPhotoPreview(null);
                              }}
                              className="p-2 rounded-lg bg-foreground/[0.03] hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-2 w-full">
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-foreground/[0.03] text-muted-foreground mb-3">
                              <Upload className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-xs font-medium text-foreground">
                              Click or drag photo here
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              PNG, JPG or WEBP up to 5MB
                            </p>
                          </div>
                        )}
                      </div>
                    </Field>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:text-indigo-300 disabled:bg-foreground/60 mt-2"
                    >
                      <div className="relative z-10 flex items-center gap-2">
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Securing spot...
                          </>
                        ) : (
                          <>
                            Register for Summit
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </form>
                </>
              ) : (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.12,
                        delayChildren: 0.05
                      }
                    }
                  }}
                  className="py-6 text-center flex flex-col items-center justify-center"
                >
                  {/* Glowing Radar Icon */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, scale: 0.8 },
                      visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
                    }}
                    className="relative w-24 h-24 flex items-center justify-center mb-6"
                  >
                    {/* Ring 1 (Pulse) */}
                    <motion.div
                      animate={{
                        scale: [1, 1.4, 1],
                        opacity: [0.4, 0, 0.4],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full border border-purple-500/30"
                    />
                    {/* Ring 2 (Pulse Delay) */}
                    <motion.div
                      animate={{
                        scale: [1, 1.7, 1],
                        opacity: [0.2, 0, 0.2],
                      }}
                      transition={{
                        duration: 3,
                        delay: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 rounded-full border border-indigo-500/20"
                    />
                    {/* Main Circle and Icon */}
                    <div className="relative z-10 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-[#c084fc] to-[#6366f1] shadow-[0_0_35px_rgba(168,85,247,0.45)]">
                      <AlertCircle className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>

                  {/* Pulsing Status Badge */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-500/5 px-3 py-1 text-[9px] font-bold tracking-[0.25em] uppercase text-purple-600 mb-3"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                    Status Update
                  </motion.div>

                  {/* Serif Notice Heading */}
                  <motion.h3
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="font-display text-4xl leading-tight text-foreground font-semibold"
                  >
                    Notice
                  </motion.h3>

                  {/* Description Paragraph */}
                  <motion.p
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-sm px-4"
                  >
                    Sorry, we are not accepting responses right now. If there are any changes, we will reach out to you.
                  </motion.p>

                  {/* Divider and Footer Tagline */}
                  <motion.div
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 0.7 }
                    }}
                    className="mt-8 flex items-center justify-center gap-2.5 text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground/80"
                  >
                    <span>Connect</span>
                    <span className="h-1 w-1 rounded-full bg-[#c084fc]" />
                    <span>Collaborate</span>
                    <span className="h-1 w-1 rounded-full bg-[#c084fc]" />
                    <span>Grow</span>
                  </motion.div>
                </motion.div>
              )}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Horizontal Experience Slider */}




      {/* Venue */}
      <section className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 sm:py-32">
        <FadeIn>
          <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">— The Venue</div>
          <h2 className="font-display text-5xl leading-[1] tracking-tight sm:text-7xl">
            A setting befitting<br />the gathering.
          </h2>
        </FadeIn>
        <div className="mt-16 grid gap-10 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <FadeIn delay={0.1}>
            <div className="text-right md:pr-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Presented by</div>
              <div className="mt-3 flex items-center justify-end">
                <span className="mr-3 text-[13px] font-medium tracking-[0.2em] uppercase">Pai Convention Hall & Catering</span>
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white p-1 shadow-sm border border-border">
                  <img src={paiLogo} alt="Pai Convention Hall & Catering" className="h-full w-full object-contain" />
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Pai Convention Hall,<br />Belagavi, Karnataka.
              </p>
            </div>
          </FadeIn>

          <div className="hidden h-24 w-px bg-gradient-to-b from-transparent via-border to-transparent md:block" />
          <div className="block h-px w-full bg-gradient-to-r from-transparent via-border to-transparent md:hidden" />

          <FadeIn delay={0.2}>
            <div className="md:pl-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Co-organized by</div>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white p-1 shadow-sm border border-border">
                  <img src={dotLogoPng} alt="Dot Entertainments" className="h-full w-full object-contain" />
                </div>
                <span className="text-[13px] font-medium tracking-[0.2em] uppercase">Dot Entertainments</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Curating premium experiences<br />for India's creator economy.
              </p>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-24 mb-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">— Location</div>
          <h4 className="font-display text-[clamp(2.25rem,4.5vw,3.5rem)] leading-tight tracking-tight">
            Got confused about the location?
          </h4>
          <div className="mt-8 rounded-xl overflow-hidden border border-border">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3811.0691469024825!2d74.48878!3d15.820583!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bbf650041397155%3A0x4ef0da497e750a93!2sPai%20Convention%20Hall%20and%20Catering!5e0!3m2!1sen!2sin!4v1687123456789"
              width="100%"
              height="400"
              style={{ border: "none" }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Pai Convention Hall Location"
            />
          </div>
          <div className="mt-6 text-center">
            <h2 className="font-serif text-[clamp(2rem,10vw,5rem)] leading-tight tracking-tight font-bold text-foreground whitespace-nowrap">

            </h2>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            © 2026 Dot Entertainments
          </div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Developed by <a href="https://dotlab.framer.website/" target="_blank" rel="noreferrer" className="underline hover:text-foreground">dotlab.in</a>
          </div>
        </div>
      </footer>

      <style>{`
          .input {
            width: 100%;
            border-radius: 0.75rem;
            border: 1px solid oklch(0.2 0.015 285 / 0.15);
            background: oklch(1 0 0 / 0.75);
            padding: 0.85rem 1rem;
            font-size: 0.875rem;
            color: var(--foreground);
            backdrop-filter: blur(4px);
            transition: all 0.2s;
            box-shadow: inset 0 1px 2px oklch(0 0 0 / 0.03);
          }
          .input::placeholder { color: var(--muted-foreground); opacity: 0.85; }
          .input:hover {
            background: oklch(1 0 0 / 0.85);
            border-color: oklch(0.2 0.015 285 / 0.25);
          }
          .input:focus {
            outline: none;
            border-color: var(--accent);
            background: oklch(1 0 0 / 0.95);
            box-shadow: 0 0 0 3px oklch(0.65 0.22 285 / 0.25), inset 0 1px 2px oklch(0 0 0 / 0.03);
          }
          @keyframes shine {
            0% {
              left: -150%;
            }
            50% {
              left: 150%;
            }
            100% {
              left: 150%;
            }
          }
          .animate-shine {
            position: absolute;
            top: 0;
            width: 150%;
            height: 100%;
            background: linear-gradient(
              to right,
              transparent,
              rgba(255, 255, 255, 0.4) 50%,
              transparent
            );
            transform: skewX(-15deg);
            animation: shine 4.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          }
          @keyframes border-rainbow {
            0% { border-color: rgba(168, 85, 247, 0.35); box-shadow: 0 0 15px rgba(168, 85, 247, 0.2); }
            33% { border-color: rgba(236, 72, 153, 0.35); box-shadow: 0 0 15px rgba(236, 72, 153, 0.2); }
            66% { border-color: rgba(16, 185, 129, 0.35); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }
            100% { border-color: rgba(168, 85, 247, 0.35); box-shadow: 0 0 15px rgba(168, 85, 247, 0.2); }
          }
          .animate-neon-border {
            animation: border-rainbow 8s linear infinite;
          }
        `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/75">{label}</span>
      {children}
    </label>
  );
}

