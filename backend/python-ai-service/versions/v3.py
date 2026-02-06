from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import re
import sys

# ────────────────────────────────────────────────
# CONFIG
# ────────────────────────────────────────────────
MODEL_NAME = "t5-small"  # ← Later: consider "google/flan-t5-base" or clinical variants

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)

# Type-specific task prompts (these condition the model strongly)
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
        "clinical progress / outpatient note summary in SOAP format: "
        "Subjective (history/complaints), Objective (vitals/exam), Assessment (diagnosis/impression), "
        "Plan (management/next steps): "
    ),
    "post_operative_note": (
        "post-operative / operation note extraction: pre-op diagnosis, procedure performed, "
        "intra-op findings, complications if any, post-op instructions, anesthesia details: "
    ),
    "unknown": "summarize key medical facts, patient info, findings, plan and recommendations: "
}

# Keyword-based type detector (expand as needed)
def detect_document_type(text: str) -> str:
    text_lower = text.lower()
    if any(word in text_lower for word in ["referral", "referred to", "from facility", "reason for referral", "urgency", "moh 100"]):
        return "referral_note"
    if any(word in text_lower for word in ["discharge", "discharged on", "admission date", "hospital stay", "discharge plan"]):
        return "discharge_summary"
    if any(word in text_lower for word in ["hb", "wbc", "platelets", "creatinine", "reference range", "lab", "result", "µmol", "g/dl"]):
        return "lab_report"
    if any(word in text_lower for word in ["procedure", "operation", "post-op", "intra-operative", "anaesthesia", "surgery"]):
        return "post_operative_note"
    if any(word in text_lower for word in ["bp", "pulse", "temp", "plan", "assessment", "soap", "progress note"]):
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

    # Post-process: try to make sections bold, clean up
    formatted = re.sub(r'([A-Za-z ]+?)(?::|\.| - )', r'**\1:**', decoded)
    formatted = formatted.replace(' . ', '. ').strip()

    # Add header + feedback
    output = f"**Detected Document Type:** {doc_type.replace('_', ' ').title()}\n\n"
    output += formatted

    # Simple quality feedback
    if len(formatted.split()) < 45 or "..." in formatted or len(formatted) < 120:
        output += "\n\n**AI Note:** Output is short/incomplete — input text may be truncated, missing sections, or too brief. Consider providing more complete notes."

    return output

def main():
    print("=== UzimaCare Medical Document Analyzer (Phase 1) ===")
    print("Paste patient notes / report below. Type 'exit' or Ctrl+C to quit.\n")

    while True:
        try:
            print(">>> ", end="", flush=True)
            lines = []
            while True:
                line = sys.stdin.readline().rstrip('\n')
                if not line:  # empty line → process
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
            print("\n" + "-"*60 + "\n")

        except KeyboardInterrupt:
            print("\nExiting...")
            break
        except Exception as e:
            print(f"Error: {e}\nPlease try again.\n")

if __name__ == "__main__":
    main()