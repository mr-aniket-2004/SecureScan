import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class PDFReportGenerator:
    """Generates professional PDF security audit reports for scan jobs."""

    def __init__(self, output_dir: str = "reports"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_report(self, job_data: dict, findings: list) -> str:
        pdf_filename = f"scan_report_{job_data['id']}.pdf"
        file_path = os.path.join(self.output_dir, pdf_filename)

        doc = SimpleDocTemplate(
            file_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom Paragraph Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=colors.HexColor("#1E293B"),
            spaceAfter=10
        )
        
        subtitle_style = ParagraphStyle(
            'DocSubTitle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=15
        )

        section_heading = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor("#0F172A"),
            spaceBefore=15,
            spaceAfter=10
        )

        elements = []

        # Document Header
        elements.append(Paragraph("Security & Health Audit Report", title_style))
        elements.append(Paragraph(f"Repository: <b>{job_data['repo_url']}</b>", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=15))

        # Summary Metrics Table
        summary_data = [
            [Paragraph("<b>Job ID</b>"), Paragraph(str(job_data['id']))],
            [Paragraph("<b>Status</b>"), Paragraph(str(job_data['status']))],
            [Paragraph("<b>Security Score</b>"), Paragraph(f"<b>{job_data['security_score']}</b>")],
            [Paragraph("<b>Exposed Secrets</b>"), Paragraph(str(job_data['secrets_found']))],
            [Paragraph("<b>Vulnerabilities</b>"), Paragraph(str(job_data['vulnerabilities_found']))],
        ]

        summary_table = Table(summary_data, colWidths=[150, 380])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor("#334155")),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(Paragraph("Executive Summary", section_heading))
        elements.append(summary_table)
        elements.append(Spacer(1, 15))

        # Detailed Findings Table
        elements.append(Paragraph("Detailed Findings", section_heading))

        if not findings:
            elements.append(Paragraph("No security threats or vulnerable dependencies detected.", styles['Normal']))
        else:
            findings_data = [["Severity", "Type", "File Path", "Line"]]
            for item in findings:
                findings_data.append([
                    Paragraph(f"<b>{item.severity}</b>"),
                    Paragraph(item.issue_type),
                    Paragraph(item.file_path),
                    Paragraph(str(item.line_number))
                ])

            findings_table = Table(findings_data, colWidths=[80, 200, 200, 50])
            findings_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#CBD5E1")),
                ('PADDING', (0, 0), (-1, -1), 6),
            ]))
            elements.append(findings_table)

        doc.build(elements)
        return file_path