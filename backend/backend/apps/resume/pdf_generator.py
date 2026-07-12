"""Generates a downloadable PDF resume from the assembled preview data (Image 2: Download button)."""
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib import colors


def generate_resume_pdf(data: dict) -> BytesIO:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()

    accent_color = colors.HexColor("#2563EB")  # matches the blue/white/orange palette

    name_style = ParagraphStyle("Name", parent=styles["Title"], fontSize=20, textColor=accent_color)
    title_style = ParagraphStyle("JobTitle", parent=styles["Normal"], fontSize=12, textColor=colors.grey)
    section_style = ParagraphStyle("Section", parent=styles["Heading2"], fontSize=13, textColor=accent_color, spaceBefore=12)
    body_style = styles["Normal"]

    elements = []
    elements.append(Paragraph(data.get("full_name", ""), name_style))
    elements.append(Paragraph(data.get("professional_title", ""), title_style))
    contact_line = " | ".join(filter(None, [
        data.get("email"), data.get("phone"), data.get("location"),
    ]))
    elements.append(Paragraph(contact_line, body_style))
    elements.append(Spacer(1, 8))
    elements.append(HRFlowable(width="100%", color=accent_color))

    if data.get("summary"):
        elements.append(Paragraph("SUMMARY", section_style))
        elements.append(Paragraph(data["summary"], body_style))

    if data.get("education"):
        elements.append(Paragraph("EDUCATION", section_style))
        for edu in data["education"]:
            score_label = f"CGPA: {edu['score']}" if edu.get("score_type") == "cgpa" else f"{edu['score']}%"
            elements.append(Paragraph(
                f"<b>{edu['course']}</b> — {edu['institution']} ({edu['start_year']}–{edu['end_year']}) — {score_label}",
                body_style,
            ))

    if data.get("skills"):
        elements.append(Paragraph("SKILLS", section_style))
        elements.append(Paragraph(", ".join(s["name"] for s in data["skills"]), body_style))

    if data.get("projects"):
        elements.append(Paragraph("PROJECTS", section_style))
        for proj in data["projects"]:
            elements.append(Paragraph(f"<b>{proj['title']}</b>", body_style))
            if proj.get("description"):
                elements.append(Paragraph(proj["description"], body_style))

    if data.get("certifications"):
        elements.append(Paragraph("CERTIFICATIONS", section_style))
        for cert in data["certifications"]:
            elements.append(Paragraph(f"{cert['title']} — {cert['issuer']}", body_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer
