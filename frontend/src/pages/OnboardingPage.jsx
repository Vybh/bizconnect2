import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboard } from "../lib/api.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { INDUSTRIES, LANGUAGES } from "../constants/index.js";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(1, "Required"),
  industry: z.string().min(1, "Required"),
  location: z.string().optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  pricing: z.coerce.number().min(0).optional(),
  nativeLanguage: z.string().min(1, "Required"),
  learningLanguage: z.string().optional(),
});

export default function OnboardingPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [profilePic, setProfilePic] = useState("");

  const { mutate, isPending } = useMutation({
    mutationFn: onboard,
    onSuccess: (res) => {
      queryClient.setQueryData(["authUser"], res.data.user);
      toast.success("Profile saved!");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to save profile");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setProfilePic(url);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = (data) => mutate({ ...data, ...(profilePic && { profilePic }) });

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>Complete Your Profile</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.875rem" }}>
          Help others find and connect with you.
        </p>

        <form className="onboarding-form" onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <img
              src={profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=preview`}
              alt="Preview"
              className="avatar avatar-lg"
            />
            <label className="btn btn-secondary btn-sm" style={{ cursor: "pointer" }}>
              <Upload size={14} />
              {uploading ? "Uploading…" : "Upload Photo"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
            </label>
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" {...register("fullName")} />
              {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Industry *</label>
              <select className="form-input" {...register("industry")}>
                <option value="">Select…</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
              {errors.industry && <span className="form-error">{errors.industry.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" placeholder="City, Country" {...register("location")} />
            </div>

            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input className="form-input" type="number" min="0" {...register("experienceYears")} />
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Rate (USD)</label>
              <input className="form-input" type="number" min="0" {...register("pricing")} />
            </div>

            <div className="form-group">
              <label className="form-label">Native Language *</label>
              <select className="form-input" {...register("nativeLanguage")}>
                <option value="">Select…</option>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
              {errors.nativeLanguage && <span className="form-error">{errors.nativeLanguage.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Learning Language</label>
              <select className="form-input" {...register("learningLanguage")}>
                <option value="">None</option>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Description</label>
            <textarea
              className="form-input"
              rows={4}
              placeholder="Tell others about your expertise…"
              {...register("description")}
              style={{ resize: "vertical" }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isPending || uploading}>
            {isPending ? "Saving…" : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
