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
      {
        name: "description",
        content:
          "An invitation-only gathering of India's leading content creators at Pai Convention Hall, Belagavi.",
      },
      { property: "og:title", content: "Creator Summit 2026 — You're Invited" },
      {
        property: "og:description",
        content:
          "Connect • Collaborate • Grow. Hosted by Dot Entertainments at Pai Convention Hall.",
      },
    ],
  }),
  component: Index,
});

const NICHES = [
  "Video",
  "Tech",
  "Fashion / Lifestyle",
  "Photography",
  "Business / Founders",
  "Other",
];

function DotLogo({ className = "h-14 w-14" }: { className?: string }) {
  return (
    <div className="flex items-center justify-center">
      <img src={dotLogo} alt="Dot Entertainments" className={`object-contain ${className}`} />
    </div>
  );
}

function FadeIn({
  children,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
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
    colors: ["#8A2BE2", "#4B0082", "#9370DB", "#4169E1", "#00BFFF", "#6A0DAD", "#FFD700"],
  });

  // Creator Emoji explosion
  setTimeout(() => {
    (confetti as any)({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.55 },
      flat: true,
      scalar: 2.2,
      shapes: ["emoji"],
      shapeOptions: {
        emoji: {
          value: ["🎥", "📸", "🌟", "👑", "🎉", "✨", "🎬", "💡", "🚀", "🎨"],
        },
      },
    });
  }, 150);

  // Left cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.85 },
      colors: ["#8A2BE2", "#4B0082", "#9370DB", "#4169E1", "#00BFFF"],
    });
  }, 300);

  // Right cannon
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.85 },
      colors: ["#8A2BE2", "#4B0082", "#9370DB", "#4169E1", "#00BFFF"],
    });
  }, 500);

  // Gentle snow confetti for secondary effect
  setTimeout(() => {
    confetti({
      particleCount: 40,
      decay: 0.91,
      scalar: 0.8,
      origin: { y: 0.35 },
      colors: ["#8A2BE2", "#9370DB", "#FFD700"],
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

  const [verifyName, setVerifyName] = useState("");
  const [photoSubmitFile, setPhotoSubmitFile] = useState<File | null>(null);
  const [photoSubmitPreview, setPhotoSubmitPreview] = useState<string | null>(null);
  const [submittingPhoto, setSubmittingPhoto] = useState(false);
  const [photoSubmitSuccess, setPhotoSubmitSuccess] = useState(false);

  // Set client flag on mount to defeat server minification errors safely
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Listen for loader completion event
  useEffect(() => {
    const handleLoaderComplete = () => {
      setLoaderComplete(true);
    };

    window.addEventListener("loader-complete", handleLoaderComplete);
    return () => window.removeEventListener("loader-complete", handleLoaderComplete);
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

  function handlePhotoSubmitSelect(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo must be smaller than 5MB.");
      return;
    }
    setPhotoSubmitFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoSubmitPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleVerifyAndSubmitPhoto(e: React.FormEvent) {
    e.preventDefault();
    if (!verifyName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!photoSubmitFile) {
      alert("Please select a photo to upload.");
      return;
    }

    setSubmittingPhoto(true);
    try {
      const isPlaceholder =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder.supabase.co");

      let foundCreator = null;

      if (!isPlaceholder) {
        // Query registrations table to check if a creator with this name exists
        const { data, error } = await supabase
          .from("registrations")
          .select("id, full_name")
          .ilike("full_name", verifyName.trim());

        if (error) throw error;

        if (!data || data.length === 0) {
          alert(
            `We couldn't find a registration for "${verifyName}". Please verify your name or contact support.`,
          );
          setSubmittingPhoto(false);
          return;
        }

        foundCreator = data[0];
      } else {
        // Mock check for demo mode
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (verifyName.toLowerCase() === "notfound") {
          alert(
            `We couldn't find a registration for "${verifyName}". Please verify your name or contact support.`,
          );
          setSubmittingPhoto(false);
          return;
        }
        foundCreator = { id: "mock-id", full_name: verifyName };
      }

      // Upload the photo
      let photoUrl = "";
      if (!isPlaceholder) {
        const fileExt = photoSubmitFile.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload photo to Supabase Storage in 'registrations' bucket
        const { error: uploadError } = await supabase.storage
          .from("registrations")
          .upload(filePath, photoSubmitFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("registrations").getPublicUrl(filePath);

        photoUrl = publicUrl;

        // Update the registration record with the photo_url
        const { error: updateError } = await supabase
          .from("registrations")
          .update({ photo_url: photoUrl })
          .eq("id", foundCreator.id);

        if (updateError) throw updateError;
      } else {
        // Mock successful upload and update
        await new Promise((resolve) => setTimeout(resolve, 1000));
        photoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";
      }

      setPhotoSubmitSuccess(true);
      fireConfetti();
    } catch (error: any) {
      console.error("Error submitting photo:", error);
      alert(`Oops! Something went wrong: ${error.message || "Please try again."}`);
    } finally {
      setSubmittingPhoto(false);
    }
  }

  // Modified to handle async backend insert
  async function submitRegistration(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.handle.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const isPlaceholder =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder.supabase.co");

      if (isPlaceholder) {
        // Simulated network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log("Demo Mode: Simulated successful registration submit:", {
          full_name: form.name.trim(),
          email: email.trim(),
          social_handle: form.handle.trim(),
          niche: form.niche,
          photo_name: photoFile ? photoFile.name : null,
        });
        setSubmitted(true);
        return;
      }

      let photoUrl = "";
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload photo to Supabase Storage in 'registrations' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("registrations")
          .upload(filePath, photoFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get the public URL for the uploaded photo
        const {
          data: { publicUrl },
        } = supabase.storage.from("registrations").getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const { data, error } = await supabase.from("registrations").insert([
        {
          full_name: form.name.trim(),
          email: email.trim(),
          social_handle: form.handle.trim(),
          niche: form.niche,
          photo_url: photoUrl || null,
        },
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
    if (!waitlistName.trim() || !waitlistHandle.trim()) return;
    if (!waitlistPhotoFile) {
      alert("Please upload your photo first.");
      return;
    }

    setWaitlistLoading(true);
    try {
      const isPlaceholder =
        !import.meta.env.VITE_SUPABASE_URL ||
        import.meta.env.VITE_SUPABASE_URL.includes("placeholder.supabase.co");

      let photoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500";

      if (!isPlaceholder && waitlistPhotoFile) {
        const fileExt = waitlistPhotoFile.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload photo to Supabase Storage in 'registrations' bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("registrations")
          .upload(filePath, waitlistPhotoFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("registrations").getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      // Sync to Supabase synchronously
      if (!isPlaceholder) {
        const { error } = await supabase.from("registrations").insert([
          {
            full_name: waitlistName.trim(),
            email: "",
            social_handle: waitlistHandle.trim(),
            niche: "Other",
            photo_url: photoUrl,
          },
        ]);
        if (error) throw error;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setWaitlistSubmitted(true);
      fireConfetti();
    } catch (error: any) {
      console.error("Error submitting waitlist registration:", error);
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
              style={{ filter: "brightness(0)" }}
            />
          </div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.03] px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-1 w-1 rounded-full bg-accent" />
            Creator Summit · 2026
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h1 className="font-display text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] tracking-tight text-balance">
            You're{" "}
            <em className="italic text-transparent bg-clip-text bg-gradient-to-br from-[oklch(0.2_0.05_285)] via-[oklch(0.55_0.22_285)] to-[oklch(0.7_0.18_285)]">
              Invited.
            </em>
          </h1>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p className="mt-7 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Connect with leading creators and visionary founders, discover new opportunities, and
            build relationships that drive innovation.
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
                {/* Photo Upload / Verification Section */}
                <div className="w-full mb-8 pb-8 border-b border-black/[0.04] text-left">
                  <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80 mb-3 text-center">
                    Submit Creator Photo
                  </h4>
                  {photoSubmitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-3 px-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center text-xs text-emerald-700 font-medium"
                    >
                      ✨ Photo submitted successfully! Your registration record has been updated.
                    </motion.div>
                  ) : (
                    <form onSubmit={handleVerifyAndSubmitPhoto} className="space-y-4">
                      <Field label="Your Full Name">
                        <input
                          required
                          disabled={submittingPhoto}
                          value={verifyName}
                          onChange={(e) => setVerifyName(e.target.value)}
                          className="input"
                          placeholder="Enter your registered full name"
                        />
                      </Field>

                      <div className="block">
                        <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/75">
                          Upload Photo
                        </span>
                        <div
                          className={`relative flex flex-col items-center justify-center border border-dashed rounded-xl p-5 transition-all cursor-pointer ${
                            photoSubmitPreview
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
                            if (submittingPhoto) return;
                            const files = e.dataTransfer.files;
                            if (files && files[0]) {
                              handlePhotoSubmitSelect(files[0]);
                            }
                          }}
                          onClick={() => {
                            if (!submittingPhoto && !photoSubmitPreview) {
                              document.getElementById("photo-submit-upload-input")?.click();
                            }
                          }}
                        >
                          <input
                            id="photo-submit-upload-input"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={submittingPhoto}
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files[0]) {
                                handlePhotoSubmitSelect(files[0]);
                              }
                            }}
                          />

                          {photoSubmitPreview ? (
                            <div className="flex items-center gap-3 w-full">
                              <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border bg-muted shrink-0">
                                <img
                                  src={photoSubmitPreview}
                                  alt="Preview"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">
                                  {photoSubmitFile?.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {(photoSubmitFile?.size
                                    ? photoSubmitFile.size / (1024 * 1024)
                                    : 0
                                  ).toFixed(2)}{" "}
                                  MB
                                </p>
                              </div>
                              <button
                                type="button"
                                disabled={submittingPhoto}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPhotoSubmitFile(null);
                                  setPhotoSubmitPreview(null);
                                }}
                                className="p-1.5 rounded-lg bg-foreground/[0.03] hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-1 w-full">
                              <Upload className="h-4 w-4 text-muted-foreground mx-auto mb-2" />
                              <p className="text-[11px] font-medium text-foreground">
                                Upload profile photo
                              </p>
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                PNG, JPG or WEBP • Max 5MB
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={submittingPhoto}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-primary-foreground transition-colors hover:text-indigo-300 disabled:bg-foreground/60"
                      >
                        {submittingPhoto ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Verifying & Submitting...
                          </>
                        ) : (
                          <>
                            Verify & Submit Photo
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </div>

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
                  Thank you for the overwhelming response. Applications are now closed. If you'd
                  still like to be considered, request consideration via WhatsApp.
                </p>

                {/* CTA WhatsApp Button */}
                <motion.a
                  href="https://wa.me/919187127114?text=Hi,%20I'm%20interested%20in%20joining%20the%20Creator%20Summit%202026."
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:text-indigo-300 w-full max-w-sm mt-4 mb-6"
                >
                  <div className="relative z-10 flex items-center gap-2">
                    Request Consideration
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </motion.a>

                {/* Footer */}
                <div className="mt-4 pt-6 border-t border-black/[0.04] w-full flex items-center justify-center gap-3 text-[9px] font-bold tracking-[0.3em] text-muted-foreground/60 uppercase">
                  <span>Connect</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Collaborate</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>Grow</span>
                </div>
              </motion.div>
            ) : (
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
                  Thank you for the overwhelming response. Creator applications are currently
                  closed. Click below to request consideration via WhatsApp.
                </p>

                {/* CTA WhatsApp Button */}
                <motion.a
                  href="https://wa.me/919187127114?text=Hi,%20I'm%20interested%20in%20joining%20the%20Creator%20Summit%202026."
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:text-indigo-300 w-full max-w-sm mt-4 mb-6"
                >
                  <div className="relative z-10 flex items-center gap-2">
                    Request Consideration
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </motion.a>

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
          <div className="mb-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            — The Venue
          </div>
          <h2 className="font-display text-5xl leading-[1] tracking-tight sm:text-7xl">
            A setting befitting
            <br />
            the gathering.
          </h2>
        </FadeIn>
        <div className="mt-16 grid gap-10 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <FadeIn delay={0.1}>
            <div className="text-right md:pr-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Presented by
              </div>
              <div className="mt-3 flex items-center justify-end">
                <span className="mr-3 text-[13px] font-medium tracking-[0.2em] uppercase">
                  Pai Convention Hall & Catering
                </span>
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white p-1 shadow-sm border border-border">
                  <img
                    src={paiLogo}
                    alt="Pai Convention Hall & Catering"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Pai Convention Hall,
                <br />
                Belagavi, Karnataka.
              </p>
            </div>
          </FadeIn>

          <div className="hidden h-24 w-px bg-gradient-to-b from-transparent via-border to-transparent md:block" />
          <div className="block h-px w-full bg-gradient-to-r from-transparent via-border to-transparent md:hidden" />

          <FadeIn delay={0.2}>
            <div className="md:pl-2">
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                Co-organized by
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-white p-1 shadow-sm border border-border">
                  <img
                    src={dotLogoPng}
                    alt="Dot Entertainments"
                    className="h-full w-full object-contain"
                  />
                </div>
                <span className="text-[13px] font-medium tracking-[0.2em] uppercase">
                  Dot Entertainments
                </span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                Curating premium experiences
                <br />
                for India's creator economy.
              </p>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-24 mb-3 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            — Location
          </div>
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
            <h2 className="font-serif text-[clamp(2rem,10vw,5rem)] leading-tight tracking-tight font-bold text-foreground whitespace-nowrap"></h2>
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
            Developed by{" "}
            <a
              href="https://dotlab.framer.website/"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              dotlab.in
            </a>
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
      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/75">
        {label}
      </span>
      {children}
    </label>
  );
}
