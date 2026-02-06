from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re
import sys

# ────────────────────────────────────────────────
# CONFIG
# ────────────────────────────────────────────────
MODEL_NAME = "google/flan-t5-small"  # Improved instruction-following model (~77M params)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

# Type-specific task prompts (tuned for flan-t5)
TYPE_PROMPTS = {
    "referral_note": (
        "referral note analysis: extract patient demographics, referring facility, "
        "reason for referral, provisional diagnosis, investigations done, treatment given, "
        "urgency level, recommendations for receiving hospital: "
    ),
    "discharge_summary": (
        "discharge summary extraction: include admission reason and date, hospital course, "
        "final diagnosis, key investigations, treatment and procedures, discharge medications, "
        "condition at discharge, follow-up plan: "
    ),
    "lab_report": (
        "lab results summary: group by panel (e.g. FBC, U&E, LFT), list test, result, unit, "
        "reference range if available, flag abnormal values (H/L), add brief clinical interpretation: "
    ),
    "clinical_progress_note": (
        "clinical progress or outpatient note summary in SOAP format: "
        "Subjective (history/complaints), Objective (vitals/exam), Assessment (diagnosis/impression), "
        "Plan (management/next steps): "
    ),
    "post_operative_note": (
        "post-operative or operation note extraction: pre-op diagnosis, procedure performed, "
        "intra-op findings, complications if any, post-op instructions, anesthesia details: "
    ),
    "unknown": "summarize key medical facts, patient info, findings, plan and recommendations: "
}

# Improved keyword-based type detector
def detect_document_type(text: str) -> str:
    text_lower = text.lower()
    
    # Referral
    if any(kw in text_lower for kw in ["referral", "referred to", "from facility", "reason for referral", "urgency", "moh 100", "referred by", "to higher level"]):
        return "referral_note"
    
    # Discharge
    if any(kw in text_lower for kw in ["discharge", "discharged on", "admission date", "hospital stay", "discharge plan", "discharge home", "discharge medications"]):
        return "discharge_summary"
    
    # Lab
    if any(kw in text_lower for kw in ["hb", "wbc", "platelets", "creatinine", "reference range", "lab", "result", "µmol", "g/dl", "hba1c", "ldl", "troponin"]):
        return "lab_report"
    
    # Post-op / surgical
    if any(kw in text_lower for kw in ["procedure", "operation", "post-op", "intra-operative", "anaesthesia", "surgery", "total knee", "replacement", "laparotomy", "findings", "complications"]):
        return "post_operative_note"
    
    # Clinical / progress / triage / OPD
    if any(kw in text_lower for kw in ["chief complaint", "triage", "arrival time", "assessment", "urgent", "plan", "soap", "progress note", "bp", "pulse", "temp", "hr", "spo2", "npo", "iv fluids"]):
        return "clinical_progress_note"
    
    return "unknown"

def generate_structured_summary(raw_text: str, max_length: int = 280, min_length: int = 60) -> str:
    doc_type = detect_document_type(raw_text)
    prompt_prefix = TYPE_PROMPTS.get(doc_type, TYPE_PROMPTS["unknown"])

    input_text = prompt_prefix + raw_text.strip()
    
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        truncation=True,
        max_length=512
    )

    summary_ids = model.generate(
        **inputs,
        max_length=max_length,
        min_length=min_length,
        length_penalty=1.3,
        num_beams=5,
        early_stopping=True,
        no_repeat_ngram_size=3,
        do_sample=False
    )

    decoded = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    # Very light post-processing: clean whitespace, split into lines if possible
    cleaned = re.sub(r'\s+', ' ', decoded).strip()
    # Try to split into sentences/sections roughly
    sentences = [s.strip() for s in re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?)\s', cleaned) if s.strip()]

    # Build output
    output = f"**Detected Document Type:** {doc_type.replace('_', ' ').title()}\n\n"
    if sentences:
        output += "\n".join(f"- {s}" for s in sentences[:8])  # limit to avoid too long
    else:
        output += cleaned

    # Quality feedback
    if len(cleaned.split()) < 50:
        output += "\n\n**AI Note:** Summary is short — input may be incomplete, truncated, or the model needs more context."

    return output

def main():
    print("=== UzimaCare Medical Document Analyzer (Phase 1 – Fixed) ===")
    print("Paste patient notes / report below (multi-line OK). End with empty line or Ctrl+D.")
    print("Type 'exit' or Ctrl+C to quit.\n")

    while True:
        try:
            print(">>> ", end="", flush=True)
            lines = []
            while True:
                line = sys.stdin.readline().rstrip('\n')
                if not line and lines:  # empty line after content → process
                    break
                lines.append(line)
            
            text = "\n".join(lines).strip()
            if not text:
                continue
            if text.lower() in ['exit', 'quit']:
                print("Exiting...")
                break

            print("\nProcessing...\n")
            result = generate_structured_summary(text)
            print(result)
            print("\n" + "-"*70 + "\n")

        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {e}\nPlease try again.\n")

if __name__ == "__main__":
    main()