"""
generate_dataset.py - FULLY FIXED VERSION

Generates ~98 synthetic medical notes for LoRA fine-tuning.
All content is fictional / synthetic.
No KeyError - all placeholders are safe.
"""

import json
import random
from pathlib import Path

OUTPUT_FILE = Path("data/train.jsonl")
EXAMPLES_PER_CATEGORY = 7  # Change to 10 for ~140 examples if you want more

# Random data pools
NAMES = [
    "John Kamau", "Mary Wambui", "David Omondi", "Sarah Akinyi", "Joseph Mutai",
    "Esther Nduta", "Aisha Mohamed", "Peter Kipchoge", "Grace Muthoni", "Samuel Kiptoo",
    "Mercy Chebet", "Fatuma Ali", "Beatrice Akinyi", "Naomi Jepchirchir", "Michael Otieno"
]
GENDERS = ["Male", "Female"]
AGES_ADULT = list(range(18, 85))
AGES_CHILD = list(range(1, 18))
BPS = ["120/80", "140/90", "160/100", "110/70", "170/105", "118/76", "148/92", "112/68"]
HBS = [f"{round(random.uniform(7.0, 14.5), 1)} g/dL" for _ in range(20)]
COMPLAINTS = [
    "chest pain", "headache", "fever", "diarrhoea", "joint pain", "low mood",
    "backache", "shortness of breath", "abdominal pain", "fatigue", "cough"
]
PLANS = [
    "review in 2 weeks", "urgent referral", "start antibiotics", "increase dose",
    "lifestyle advice", "repeat labs in 1 week", "continue current medication",
    "refer to specialist", "admit for observation"
]
FACILITIES = ["Kisii Level 5", "Kapsowar Sub-County", "Eldoret Level 4", "Litein Hospital", "Tenwek Hospital"]
DXS = [
    "pneumonia", "hypertensive urgency", "acute appendicitis", "depression",
    "COPD exacerbation", "diabetes mellitus", "malaria", "UTI", "anaemia"
]

# Templates – ONLY use placeholders that are always passed
CATEGORY_TEMPLATES = [
    {"category": "clinical_progress_note", "input_template": "Patient Name: {name} Age: {age} Gender: {gender} Chief Complaint: {complaint}. Vitals: BP {bp}. Assessment: {dx}. Plan: {plan}."},
    {"category": "discharge_summary", "input_template": "Patient Name: {name} Age: {age} Admission: 10/03/2025 Discharge: 17/03/2025 Diagnosis: {dx}. Course: Treated with antibiotics and supportive care. D/C meds: Amoxicillin, Paracetamol. Plan: {plan}."},
    {"category": "referral_note", "input_template": "Referred from {facility}. Patient: {name} Age: {age}. Reason: {complaint}. Provisional Dx: {dx}. Urgency: urgent."},
    {"category": "antenatal_visit", "input_template": "Patient: {name} Age: {age} G3P2 at 28 weeks. Complaints: {complaint}. BP {bp}. Hb {hb}. Plan: iron supplements, next visit 4 weeks."},
    {"category": "post_operative_note", "input_template": "Patient: {name} Age: {age} Procedure: Emergency Caesarean Section. Post-op: stable, BP {bp}. Plan: antibiotics 24 hrs, discharge day 3."},
    {"category": "laboratory_report", "input_template": "Patient: {name} Age: {age} Labs: Hb {hb} (low), Creatinine 210 µmol/L (high). Notes: known CKD. Plan: nephrology review."},
    {"category": "imaging_report", "input_template": "Patient: {name} Age: {age} Chest X-ray: right lower lobe consolidation. Impression: pneumonia."},
    {"category": "pathology_report", "input_template": "Patient: {name} Age: {age} Biopsy: breast lump. Diagnosis: breast cancer."},
    {"category": "medication_list", "input_template": "Patient: {name} Age: {age} Current meds: Metformin 1g bd, Amlodipine 10mg od. Adherence: fair."},
    {"category": "treatment_plan", "input_template": "Patient: {name} Age: {age} Plan: {plan}. Follow-up: 4 weeks. Monitoring: home BP."},
    {"category": "mental_health_note", "input_template": "Patient: {name} Age: {age} Diagnosis: depression. Notes: low mood ongoing. MSE: mood low. Plan: increase fluoxetine."},
    {"category": "maternal_child_health_note", "input_template": "Patient: {name} Age: {age} G2P1 at 32 weeks. Complaints: backache. BP {bp}. Plan: iron, next ANC 4 weeks."},
    {"category": "emergency_triage_note", "input_template": "Triage: {name} Age: {age} Complaint: {complaint}. Vitals: BP {bp}. Plan: IV fluids, urgent scan."},
    {"category": "clinical_handover_note", "input_template": "Handover: {name} Age: {age} Active: fever. Pending: blood culture. Tasks: repeat vitals."},
]

def generate_example(template):
    """Generate one example safely"""
    name = random.choice(NAMES)
    age = random.choice(AGES_ADULT) if "child" not in template["category"] else random.choice(AGES_CHILD)
    gender = "Male" if name in ["John Kamau", "Peter Kipchoge", "David Omondi", "Joseph Mutai", "Samuel Kiptoo"] else "Female"
    complaint = random.choice(COMPLAINTS)
    bp = random.choice(BPS)
    hb = random.choice(HBS)
    plan = random.choice(PLANS)
    facility = random.choice(FACILITIES)
    dx = random.choice(DXS)

    # Only pass keys that exist in the template string
    format_kwargs = {
        "name": name,
        "age": age,
        "gender": gender,
        "complaint": complaint,
        "bp": bp,
        "hb": hb,
        "plan": plan,
        "facility": facility,
        "dx": dx
    }

    input_text = template["input_template"].format(**format_kwargs)

    # Basic JSON output (expand as needed)
    output_dict = {
        "patient": {"name": name, "age": age, "gender": gender},
        "document_type": template["category"]
    }
    if "complaint" in template["input_template"]:
        output_dict["chief_complaint"] = complaint
    if "bp" in template["input_template"]:
        output_dict["vitals"] = {"bp": bp}
    if "plan" in template["input_template"]:
        output_dict["plan"] = [plan]

    return {
        "input": input_text.strip(),
        "output": json.dumps(output_dict, ensure_ascii=False)
    }

def main():
    all_examples = []
    for template in CATEGORY_TEMPLATES:
        category = template["category"]
        print(f"Generating {EXAMPLES_PER_CATEGORY} examples for: {category}")
        for _ in range(EXAMPLES_PER_CATEGORY):
            ex = generate_example(template)
            all_examples.append(ex)

    random.shuffle(all_examples)

    with OUTPUT_FILE.open("w", encoding="utf-8") as f:
        for ex in all_examples:
            f.write(json.dumps(ex, ensure_ascii=False) + "\n")

    print(f"\nDataset created successfully!")
    print(f"Total examples: {len(all_examples)}")
    print(f"Saved to: {OUTPUT_FILE.absolute()}")
    print("Upload train.jsonl to Colab and continue LoRA training.")

if __name__ == "__main__":
    main()