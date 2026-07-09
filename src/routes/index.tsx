import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "motion/react";
import { MapPin, ArrowRight, Check, X, Loader2, Upload, AlertCircle, Lock } from "lucide-react";
import confetti from "canvas-confetti";
import paiLogo from "@/assets/pai-convention.png";
import dotLogo from "@/assets/logo2026.png";
import dotLogoPng from "@/assets/dotlogo.png";
import summitLogo from "@/assets/summit-logo.png";
import unionLogo from "@/assets/Union.png";
// Import the Supabase client you created
import { supabase } from "@/lib/supabaseClient";
import LiquidBackground from "@/components/LiquidBackground";

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

// Toggle to close applications and show the notice card by default
const APPLICATIONS_CLOSED = true;

function Index() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", handle: "", niche: NICHES[0] });
  const [loaderComplete, setLoaderComplete] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistHandle, setWaitlistHandle] = useState("");
  const [waitlistNiche, setWaitlistNiche] = useState("");
  const [waitlistPhotoFile, setWaitlistPhotoFile] = useState<File | null>(null);
  const [waitlistPhotoPreview, setWaitlistPhotoPreview] = useState<string | null>(null);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);


  // Set client flag on mount to defeat server minification errors safely
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  function handleWaitlistPhotoSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be smaller than 5MB.");
      return;
    }
    setWaitlistPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setWaitlistPhotoPreview(reader.result as string);
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

  async function submitWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!waitlistName.trim() || !waitlistEmail.trim() || !waitlistHandle.trim() || !waitlistNiche) return;

    setWaitlistLoading(true);
    try {
      const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes("placeholder.supabase.co");

      if (isPlaceholder) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Demo Mode: Simulated successful waitlist registration submit:", {
          full_name: waitlistName.trim(),
          email: waitlistEmail.trim(),
          social_handle: waitlistHandle.trim(),
          niche: waitlistNiche,
          photo_name: waitlistPhotoFile ? waitlistPhotoFile.name : null
        });
        setWaitlistSubmitted(true);
        fireConfetti();
        return;
      }

      let photoUrl = "";
      if (waitlistPhotoFile) {
        const fileExt = waitlistPhotoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload photo to Supabase Storage in 'registrations' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("registrations")
          .upload(filePath, waitlistPhotoFile, {
            cacheControl: "3600",
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("registrations")
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      // First, try to insert into waitlist table
      let inserted = false;
      try {
        const { data, error } = await supabase
          .from("waitlist")
          .insert([
            {
              full_name: waitlistName.trim(),
              email: waitlistEmail.trim(),
              social_handle: waitlistHandle.trim(),
              niche: waitlistNiche,
              photo_url: photoUrl || null,
            }
          ]);
        if (!error) {
          inserted = true;
        }
      } catch (err) {
        console.warn("Could not insert to waitlist table, trying registrations table:", err);
      }

      if (!inserted) {
        // Fallback to registrations table
        const { data, error } = await supabase
          .from("registrations")
          .insert([
            {
              full_name: waitlistName.trim(),
              email: waitlistEmail.trim(),
              social_handle: waitlistHandle.trim(),
              niche: waitlistNiche,
              photo_url: photoUrl || null,
            }
          ]);

        if (error) throw error;
      }

      setWaitlistSubmitted(true);
      fireConfetti();
    } catch (error: any) {
      console.error("Error submitting waitlist registration:", error.message);
      alert(`Oops! Something went wrong: ${error.message || "Please try again."}`);
    } finally {
      setWaitlistLoading(false);
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
            {APPLICATIONS_CLOSED ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                className="relative bg-white border border-black/[0.04] rounded-3xl p-10 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.015)] transition-shadow duration-500 w-full text-center flex flex-col items-center justify-center"
              >
                {/* Refined Premium Status Icon */}
                <div className="relative flex items-center justify-center w-14 h-14 mb-6">
                  {/* Pulsing Outer Glow Ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 1],
                      opacity: [0.15, 0.35, 0.15],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full border border-[#7C3AED]/35 bg-[#7C3AED]/3"
                  />
                  {/* Inner Circle and Lock Icon */}
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border border-black/[0.06] bg-white text-[#7C3AED] shadow-sm">
                    <Lock className="w-4 h-4 stroke-[1.25]" />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.25em] uppercase text-[#7C3AED] mb-4">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED]/40 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#7C3AED]"></span>
                  </span>
                  Applications Closed
                </div>

                {/* Heading */}
                <h3 className="font-display text-4xl sm:text-[2.5rem] font-normal leading-[1.1] tracking-tight text-foreground mb-4">
                  Creator Applications Closed
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-[14px] leading-relaxed text-muted-foreground/95 max-w-sm px-2 mb-6">
                  Thank you for the overwhelming response to Pai Creator Summit 2026.
                  <br /><br />
                  Creator applications are now officially closed. If you believe your profile would be a valuable addition to the summit, you may submit your details below for consideration. Our team will carefully review every request, and if an opportunity becomes available, we will contact you via email.
                </p>

                {/* Waitlist Form */}
                {!waitlistSubmitted ? (
                  <form onSubmit={submitWaitlist} className="w-full max-w-sm mt-4 mb-6 space-y-4 text-left">
                    <Field label="Full Name">
                      <input
                        required
                        disabled={waitlistLoading}
                        value={waitlistName}
                        onChange={(e) => setWaitlistName(e.target.value)}
                        className="input disabled:opacity-50"
                        placeholder="Enter your full name"
                      />
                    </Field>
                    <Field label="Email Address">
                      <input
                        type="email"
                        required
                        disabled={waitlistLoading}
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="input disabled:opacity-50"
                        placeholder="name@example.com"
                      />
                    </Field>
                    <Field label="Instagram / YouTube Profile">
                      <input
                        required
                        disabled={waitlistLoading}
                        value={waitlistHandle}
                        onChange={(e) => setWaitlistHandle(e.target.value)}
                        className="input disabled:opacity-50"
                        placeholder="https://instagram.com/yourusername"
                      />
                    </Field>
                    <Field label="Primary Content Category">
                      <select
                        required
                        disabled={waitlistLoading}
                        value={waitlistNiche}
                        onChange={(e) => setWaitlistNiche(e.target.value)}
                        className="input appearance-none cursor-pointer disabled:opacity-50 text-foreground"
                      >
                        <option value="" disabled className="text-muted-foreground">Select your primary content category</option>
                        {NICHES.map((n) => <option key={n} value={n} className="bg-card text-foreground">{n}</option>)}
                      </select>
                    </Field>
                    <Field label="Creator Photo">
                      <div
                        className={`relative flex flex-col items-center justify-center border border-dashed rounded-xl p-6 transition-all cursor-pointer ${waitlistPhotoPreview
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
                          if (waitlistLoading) return;
                          const files = e.dataTransfer.files;
                          if (files && files[0]) {
                            handleWaitlistPhotoSelect(files[0]);
                          }
                        }}
                        onClick={() => {
                          if (!waitlistLoading && !waitlistPhotoPreview) {
                            document.getElementById("waitlist-photo-upload-input")?.click();
                          }
                        }}
                      >
                        <input
                          id="waitlist-photo-upload-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={waitlistLoading}
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              handleWaitlistPhotoSelect(files[0]);
                            }
                          }}
                        />

                        {waitlistPhotoPreview ? (
                          <div className="flex items-center gap-4 w-full">
                            <div className="relative h-16 w-16 rounded-full overflow-hidden border border-border bg-muted shrink-0">
                              <img
                                src={waitlistPhotoPreview}
                                alt="Preview"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {waitlistPhotoFile?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(waitlistPhotoFile?.size ? waitlistPhotoFile.size / (1024 * 1024) : 0).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={waitlistLoading}
                              onClick={(e) => {
                                e.stopPropagation();
                                setWaitlistPhotoFile(null);
                                setWaitlistPhotoPreview(null);
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
                              Upload a recent profile photo
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              PNG, JPG, or WEBP • Maximum 5 MB
                            </p>
                          </div>
                        )}
                      </div>
                    </Field>

                    <motion.button
                      type="submit"
                      disabled={waitlistLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:text-indigo-300 disabled:bg-foreground/60 mt-2"
                    >
                      <div className="relative z-10 flex items-center gap-2">
                        {waitlistLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Requesting Consideration...
                          </>
                        ) : (
                          <>
                            Request Consideration
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </div>
                    </motion.button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full max-w-sm py-4 px-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center mb-6 text-xs text-purple-700 font-medium"
                  >
                    ✨ Your request has been submitted for consideration. Our team will review your profile shortly.
                  </motion.div>
                )}

                {/* Queries Call-to-action */}
                <div className="w-full flex flex-col items-center border-t border-black/[0.04] pt-6 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/75 mb-1">
                    Have Questions?
                  </span>
                  <p className="text-[11px] text-muted-foreground/80 mb-3 max-w-xs text-center px-4 leading-normal">
                    Need assistance regarding your request? Contact our team on WhatsApp.
                  </p>
                  <motion.a
                    href="https://wa.me/919187127114?text=Hi,%20I'm%20interested%20in%20joining%20the%20Creator%20Summit%202026."
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-black/[0.08] hover:border-black/20 bg-white hover:bg-black/[0.01] px-5 py-3 text-xs font-semibold text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 w-full max-w-[240px]"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#25D366] fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.37 5.016L2 22l5.13-1.346a9.93 9.93 0 004.881 1.343h.005c5.505 0 9.99-4.478 9.99-9.985C22.007 6.476 17.519 2 12.012 2zm0 18.29h-.003a8.25 8.25 0 01-4.215-1.161l-.302-.18-3.13.82.836-3.048-.198-.314a8.27 8.27 0 01-1.267-4.42c.002-4.547 3.702-8.241 8.253-8.241 4.544 0 8.243 3.693 8.245 8.242-.002 4.549-3.7 8.243-8.253 8.243zm4.52-6.162c-.247-.124-1.464-.722-1.692-.805-.227-.083-.393-.124-.559.124-.166.248-.64.805-.785.969-.145.165-.29.185-.538.062a7.65 7.65 0 01-1.996-1.23 8.41 8.41 0 01-1.38-1.716c-.246-.414-.026-.638.18-.843.187-.184.413-.476.62-.714.062-.072.124-.145.18-.217.186-.31.093-.58-.047-.858-.14-.278-.559-1.343-.765-1.838-.2-.486-.4-.423-.559-.431l-.476-.008c-.165 0-.434.062-.661.31-.228.248-.868.847-.868 2.066 0 1.22.888 2.397 1.012 2.562.124.165 1.748 2.67 4.235 3.74.59.255 1.053.408 1.411.521.593.188 1.133.162 1.559.098.475-.072 1.464-.599 1.67-.178.208.423.208.785.104.91-.104.124-.559.722-.806.846z" />
                    </svg>
                    Reach out on WhatsApp
                  </motion.a>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-6 border-t border-black/[0.04] w-full flex items-center justify-center gap-3 text-[9px] font-bold tracking-[0.3em] text-muted-foreground/60 uppercase">
                  <span>Connect</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Collaborate</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Grow</span>
                </div>
              </motion.div>
            ) : !submitted ? (
              <div className="relative glass rounded-3xl p-7 sm:p-8">
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
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                className="relative bg-white border border-black/[0.04] rounded-3xl p-10 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02),0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-[0_30px_70px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.015)] transition-shadow duration-500 w-full text-center flex flex-col items-center justify-center"
              >
                {/* Refined Premium Status Icon */}
                <div className="relative flex items-center justify-center w-14 h-14 mb-6">
                  {/* Pulsing Outer Glow Ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.25, 1],
                      opacity: [0.15, 0.35, 0.15],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full border border-[#7C3AED]/35 bg-[#7C3AED]/3"
                  />
                  {/* Inner Circle and Lock Icon */}
                  <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border border-black/[0.06] bg-white text-[#7C3AED] shadow-sm">
                    <Lock className="w-4 h-4 stroke-[1.25]" />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[0.25em] uppercase text-[#7C3AED] mb-4">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7C3AED]/40 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#7C3AED]"></span>
                  </span>
                  Status Update
                </div>

                {/* Heading */}
                <h3 className="font-display text-4xl sm:text-[2.5rem] font-normal leading-[1.1] tracking-tight text-foreground mb-4">
                  Applications Closed
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-[14px] leading-relaxed text-muted-foreground/95 max-w-sm px-2 mb-6">
                  Thank you for the overwhelming response. Creator applications are currently closed while our team reviews all submissions. Selected applicants will receive further communication shortly.
                </p>

                {/* Footer */}
                <div className="mt-4 pt-6 border-t border-black/[0.04] w-full flex items-center justify-center gap-3 text-[9px] font-bold tracking-[0.3em] text-muted-foreground/60 uppercase">
                  <span>Connect</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Collaborate</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Grow</span>
                </div>
              </motion.div>
            )}
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

