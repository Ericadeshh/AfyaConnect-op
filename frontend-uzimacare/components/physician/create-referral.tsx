"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "../../lib/db";

interface CreateReferralProps {
  physician: any;
  token: string;
  onBack: () => void;
}

export default function CreateReferralPage({
  physician,
  token,
  onBack,
}: CreateReferralProps) {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    medicalHistory: "",
    labResults: "",
    diagnosis: [] as string[],
    referringHospital: physician.hospital,
    receivingFacility: "",
    priority: "Routine" as "Routine" | "Urgent" | "Emergency",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importFileName, setImportFileName] = useState<string | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const text = await file.text();

    try {
      let parsed = "";
      if (ext === "json") {
        const j = JSON.parse(text);
        if (typeof j === "string") parsed = j;
        else if (j && typeof j.medicalHistory === "string") parsed = j.medicalHistory;
        else parsed = JSON.stringify(j, null, 2);
      } else if (ext === "csv") {
        // crude csv: take first non-header row, first column
        const rows = text.split(/\r?\n/).filter(Boolean);
        if (rows.length > 0) {
          const cols = rows[0].split(",");
          parsed = cols[0] || rows[0];
        } else parsed = text;
      } else {
        // txt, md or other text formats
        parsed = text;
      }

      setFormData((prev) => ({ ...prev, medicalHistory: parsed }));
    } catch (err) {
      alert("Failed to import file: " + String(err));
    }
  };

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const mockHospitals = [
    "Machakos Referral Hospital",
    "Kenyatta National Hospital (KNH)",
    "Mbagathi Hospital",
    "Memorial Hospital Armed Forces",
    "Mombasa County Hospital",
    "Kisumu District Hospital",
    "Nakuru Teaching Hospital",
  ];

  const diseases = [
    "malignant hypertension",
    "diabetic retinopathy",
    "diabetic nephropathy",
    "twin pregnancy",
    "gestational hypertension",
    "heart failure",
    "pulmonary hypertension",
    "syncope of unknown reason",
    "stroke",
    "parkinsons",
    "cerebral palsy",
    "peripheral neuropathy",
    "myasthenia gravis",
    // additional conditions requested
    "epilepsy",
    "multiple sclerosis",
    "poorly controlled diabetes",
    "pediatric diabetes",
    "goitre",
    "hyperthyroidism",
    "hypothyroidism",
    "cushings syndrome",
    "other endocrinology condition",
    "other neurologic condition",
    "fractures",
    "chronic obstructive pulmonary disease",
    "drug resistant tuberculosis (TB)",
    "severe asthma",
    "malignancy (cancer)",
    "possible liver cirrhosis",
    "gastroesophageal reflux disease",
    "peptic ulcer disease",
    "possible gastric cancer",
    "human immunodeficiency virus (AIDS)(HIV)",
    "chronic diarrhoea",
    "upper gastrointestinal bleeding (UGIB)",
    "lower gastrointestinal disease (LGIB)",
    "chronic kidney disease (dialysis)",
    "acute kidney failure",
    "Gum scrubbing",
    "nephrotic syndrome",
    "neurofibromatosis",
    "rheumatoid arthritis",
    "systemic lupus erythematosus",
    "gout refractory",
    "unexplained anemia",
    "leukemia",
    "lymphoma",
    "unexplained thrombophilia",
    "unexplained neutropenia",
    "multiple myeloma",
    "psychiatric illness",
    "major depressive disorder",
    "bipolar disorder",
    "substance use disorder",
    "endometriosis",
    "infertility",
    "erectile deficiency",
    "possible prostate cancer",
    "urinary incontinence",
    "chronic urinary retention",
    "kidney stones",
    "pyelonephritis",
    "severe dermatology condition",
    "chronic skin ulcers",
    "chronic pain",
    "chronic back pain",
    "chronic abdominal pain",
    "fibroids",
    // newly requested conditions
    "meningitis",
    "hydrocephalus",
    "head trauma",
    "unexplained bone pain",
    "encephalitis",
    "measles",
    "scarlet fever",
    "pemphigus",
    "complicated malaria",
    "chronic cough",
    "chronic conjunctivitis",
    "keratoconjunctivitis",
    "hepatitis",
  ];

  const [searchTerm, setSearchTerm] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDiagnosis = (d: string) => {
    const dU = d.toUpperCase();
    const cur = Array.isArray(formData.diagnosis) ? [...formData.diagnosis] : [];
    if (cur.includes(dU)) {
      setFormData((prev) => ({
        ...prev,
        diagnosis: Array.isArray(prev.diagnosis) ? prev.diagnosis.filter((x) => x !== dU) : [],
      }));
      return;
    }
    if (cur.length >= 2) {
      alert("You can select up to 2 conditions");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      diagnosis: Array.isArray(prev.diagnosis) ? [...prev.diagnosis, dU] : [dU],
    }));
    // clear typed letters and hide the dropdown after a selection
    setSearchTerm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Basic validation for required fields when submitting via JS
    const selectedReasons = (formData as any).diagnosis;
    const hasReason = Array.isArray(selectedReasons)
      ? selectedReasons.length > 0
      : !!selectedReasons;
    if (!formData.patientName || !(formData as any).labResults || !hasReason) {
      setLoading(false);
      alert("Please fill required fields: Patient name, Lab results, and Reason for Referral.");
      return;
    }

    try {
      // Helper: generate 6-char alphanumeric token
      const generateToken = (length = 6) => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let out = "";
        for (let i = 0; i < length; i++) {
          out += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return out;
      };

      // Reuse token if there's already a pending referral for the same patientId
      let token: string | undefined;
      const patientId = formData.patientId?.trim();
      if (patientId) {
        const existing = Array.from(db.referrals.values()).find((r: any) =>
          r.patientId && r.patientId === patientId &&
          (r.status === "pending-admin" || r.status === "Pending Admin Approval"),
        );
        if (existing) {
          token = existing.referralToken || existing.token || undefined;
          if (!token) {
            token = generateToken();
            existing.referralToken = token;
            db.referrals.set(existing.id, existing);
          }
        }
      }

      // Create referral
      const referralId = `ref-${Date.now()}`;
      const referral = {
        id: referralId,
        physicianId: physician.id,
        patientName: formData.patientName,
        patientId: formData.patientId || undefined,
        medicalHistory: formData.medicalHistory,
        labResults: formData.labResults,
        diagnosis: Array.isArray(formData.diagnosis)
          ? (formData.diagnosis as string[]).join("; ")
          : formData.diagnosis,
        referringHospital: formData.referringHospital,
        receivingFacility: formData.receivingFacility,
        priority: formData.priority,
        status: "pending-admin" as const,
        referralToken: token || generateToken(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.referrals.set(referralId, referral);
      // Notify other parts of the app (admin view) that a new referral was created
      try {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("referral:created", { detail: referral }),
          );
        }
      } catch (e) {
        // ignore
      }
      setSuccess(true);

      setTimeout(() => {
        setFormData({
            patientName: "",
            patientId: "",
            medicalHistory: "",
            labResults: "",
            diagnosis: [],
            referringHospital: physician.hospital,
            receivingFacility: "",
            priority: "Routine",
          });
        setSuccess(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Create Patient Referral
          </h1>
          <Button onClick={onBack} variant="outline">
            Back to Dashboard
          </Button>
        </div>

        <Card className="p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">
                Patient Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleChange}
                    required
                    placeholder="Enter patient full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Patient ID/MRN
                  </label>
                  <input
                    type="text"
                    name="patientId"
                    value={formData.patientId}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">
                Medical Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Patient Medical History *
                </label>
                <div className="flex gap-2 items-start">
                  <textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    required
                    placeholder="Include current symptoms, patient condition, and relevant medical history"
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="flex flex-col gap-2 ml-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt,.md,.json,.csv"
                      className="hidden"
                      onChange={handleFileImport}
                    />
                    <button
                      type="button"
                      onClick={handleImportClick}
                      className="px-3 py-2 bg-surface border border-border rounded text-sm text-text-primary hover:bg-background"
                    >
                      Import
                    </button>
                    {importFileName && (
                      <div className="text-xs text-text-secondary max-w-xs">
                        {importFileName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Lab Results *
                  </label>
                  <textarea
                    name="labResults"
                    value={(formData as any).labResults}
                    onChange={handleChange}
                    required
                    placeholder="Enter lab/test results (e.g., X-ray, sputum)"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Reason for Referral *
                  </label>
                  <div className="w-full">
                    <div className="border border-gray-200 rounded bg-white">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="type the condition"
                        className="w-full px-3 py-2 text-sm focus:outline-none"
                        disabled={Array.isArray(formData.diagnosis) && formData.diagnosis.length >= 2}
                      />
                      {searchTerm.trim().length > 0 && (
                        <div className="max-h-40 overflow-y-auto">
                          <ul className="divide-y">
                            {diseases
                              .filter((d) =>
                                d.toLowerCase().includes(searchTerm.toLowerCase()),
                              )
                              .map((d) => (
                                <li
                                  key={d}
                                  onClick={() => toggleDiagnosis(d)}
                                  className={`p-2 cursor-pointer text-sm ${
                                    Array.isArray((formData as any).diagnosis) &&
                                    (formData as any).diagnosis.includes(d.toUpperCase())
                                      ? "bg-blue-50 font-semibold"
                                      : "hover:bg-gray-50"
                                  }`}
                                >
                                  {d.toUpperCase()}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <input
                      type="hidden"
                      name="diagnosis"
                      value={Array.isArray((formData as any).diagnosis) ? (formData as any).diagnosis.join('; ') : (formData as any).diagnosis}
                    />
                    <div className="mt-2">
                      {Array.isArray((formData as any).diagnosis) && (formData as any).diagnosis.length > 0 ? (
                        <div className="flex gap-2 flex-wrap">
                          {(formData as any).diagnosis.map((d: string) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => toggleDiagnosis(d)}
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-sm text-primary border"
                            >
                              <span>{d}</span>
                              <span className="text-xs text-gray-500">✕</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-text-secondary">Selected: None</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">
                Referral Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Referring Hospital *
                  </label>
                  <input
                    type="text"
                    name="referringHospital"
                    value={formData.referringHospital}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Receiving Facility *
                  </label>
                  <select
                    name="receivingFacility"
                    value={formData.receivingFacility}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select receiving facility</option>
                    {mockHospitals.map((hospital) => (
                      <option key={hospital} value={hospital}>
                        {hospital}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Referral Priority *
                </label>
                <div className="flex gap-4">
                  {["Routine", "Urgent", "Emergency"].map((p) => (
                    <label key={p} className="flex items-center">
                      <input
                        type="radio"
                        name="priority"
                        value={p}
                        checked={formData.priority === p}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                Referral created successfully! Awaiting administration approval.
              </div>
            )}

            <div className="flex gap-4 justify-end pt-4">
              <Button onClick={onBack} variant="outline">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Referral"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
