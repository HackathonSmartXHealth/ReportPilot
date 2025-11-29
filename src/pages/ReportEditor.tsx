import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Procedure } from "./Index";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// A clean, printable A4-like surgical report editor page
export default function ReportEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const procedure = location.state?.procedure as Procedure | undefined;

  return (
    <div className="min-h-screen bg-muted/10 py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Report Editor</h1>
          </div>
        </div>

        <Card className="p-6">
          <SurgicalReportPage procedure={procedure} />
        </Card>
      </div>
    </div>
  );
}

function SurgicalReportPage({ procedure }: { procedure?: Procedure | undefined }) {
  const reportRef = useRef<HTMLDivElement | null>(null);

  // Patient / procedure fields
  const [patientName, setPatientName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [patientId, setPatientId] = useState("");
  const [procedureDateTime, setProcedureDateTime] = useState("");

  // physician & exam
  const [physician, setPhysician] = useState("");
  const [examType, setExamType] = useState("");

  // other fields
  const [indications, setIndications] = useState("");
  const [medications, setMedications] = useState("");
  const [complications, setComplications] = useState("");

  const [description, setDescription] = useState("");
  const [findings, setFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [recommendations, setRecommendations] = useState("");

  const [images, setImages] = useState<Array<{ src: string; caption?: string }>>(
    []
  );

  useEffect(() => {
    if (procedure) {
      setPatientName(procedure.patientName || "");
      setPatientId(procedure.patientId || "");
      if (procedure.date) setProcedureDateTime(new Date(procedure.date).toLocaleString());
      setPhysician(procedure.surgeon || "");
      setExamType(procedure.procedureType || "");
      setFindings(procedure.findings || "");
      setComplications(procedure.complications || "");
      if (procedure.images && procedure.images.length) {
        setImages(procedure.images.map((src) => ({ src })) as any);
      }
    }
  }, [procedure]);

  const handleDownload = async () => {
    const el = reportRef.current;
    if (!el) return;
    (document.activeElement as HTMLElement)?.blur?.();
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${patientId || "surgical"}_report.pdf`);
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <button onClick={handleDownload} style={styles.downloadButton}>
          Download as PDF
        </button>
      </div>

      <div ref={reportRef} style={styles.page}>
        <div style={styles.headerRow}>
          <div style={styles.logoPlaceholder}>LOGO</div>
          <div style={{ flex: 1 }} />
        </div>

        <section style={styles.sectionRow}>
          <div style={styles.twoColumn}>
            <label style={styles.label}>Patient Name</label>
            <input style={styles.input} value={patientName} onChange={(e) => setPatientName(e.target.value)} />

            <label style={styles.label}>Date of Birth</label>
            <input style={styles.input} value={dob} onChange={(e) => setDob(e.target.value)} />

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Gender</label>
                <input style={styles.input} value={gender} onChange={(e) => setGender(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Age</label>
                <input style={styles.input} value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
            </div>

            <label style={styles.label}>Patient ID</label>
            <input style={styles.input} value={patientId} onChange={(e) => setPatientId(e.target.value)} />

            <label style={styles.label}>Date / Time of Procedure</label>
            <input style={styles.input} value={procedureDateTime} onChange={(e) => setProcedureDateTime(e.target.value)} />
          </div>

          <div style={styles.twoColumn}>
            <label style={styles.label}>Physician</label>
            <input style={styles.input} value={physician} onChange={(e) => setPhysician(e.target.value)} />

            <label style={styles.label}>Exam / Procedure Type</label>
            <input style={styles.input} value={examType} onChange={(e) => setExamType(e.target.value)} />

            <label style={styles.label}>Indications</label>
            <textarea style={styles.textareaLarge} value={indications} onChange={(e) => setIndications(e.target.value)} />

            <label style={styles.label}>Medications</label>
            <textarea style={styles.textareaLarge} value={medications} onChange={(e) => setMedications(e.target.value)} />

            <label style={styles.label}>Complications</label>
            <textarea style={styles.textareaLarge} value={complications} onChange={(e) => setComplications(e.target.value)} />
          </div>
        </section>

        <section style={{ ...styles.sectionRow, marginTop: 18 }}>
          <div style={{ flex: 1 }}>
            <h3 style={styles.sectionHeader}>Procedure Description</h3>
            <textarea style={styles.textareaXL} value={description} onChange={(e) => setDescription(e.target.value)} />

            <div style={styles.subtabs}>
              <div style={styles.subtab}>
                <h4 style={styles.subtabHeader}>Findings</h4>
                <textarea style={styles.textarea} value={findings} onChange={(e) => setFindings(e.target.value)} />
              </div>

              <div style={styles.subtab}>
                <h4 style={styles.subtabHeader}>Diagnosis</h4>
                <textarea style={styles.textarea} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              </div>

              <div style={styles.subtab}>
                <h4 style={styles.subtabHeader}>Recommendations</h4>
                <textarea style={styles.textarea} value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {images && images.length > 0 && (
          <section style={{ marginTop: 18 }}>
            <h3 style={styles.sectionHeader}>Procedure Images</h3>
            <div style={styles.imagesGrid}>
              {images.map((img, i) => (
                <figure key={i} style={styles.figure}>
                  <img src={img.src} alt={`procedure-${i}`} style={styles.image} />
                  <figcaption style={styles.caption}>{img.caption || ""}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        <footer style={{ marginTop: 24, fontSize: 12, color: "#666" }}>
          <div>Report generated by EndoDoc Medical Documentation System</div>
        </footer>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  downloadButton: {
    padding: "8px 12px",
    background: "#0b74de",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  page: {
    width: 794, // A4 width at ~96dpi
    minHeight: 1123, // A4 height at ~96dpi
    margin: "0 auto",
    background: "white",
    padding: 28,
    boxSizing: "border-box",
    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
    color: "#111",
    fontFamily: "Georgia, 'Times New Roman', serif",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: 10,
  },
  logoPlaceholder: {
    width: 120,
    height: 60,
    background: "#f3f4f6",
    border: "1px dashed #d1d5db",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    color: "#9ca3af",
  },
  sectionRow: {
    display: "flex",
    gap: 20,
  },
  twoColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
    marginTop: 6,
  },
  input: {
    padding: "8px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: 14,
  },
  textareaLarge: {
    minHeight: 80,
    padding: "8px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: 13,
    resize: "vertical",
  },
  textareaXL: {
    minHeight: 160,
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: 14,
    resize: "vertical",
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 8,
  },
  subtabs: {
    display: "flex",
    gap: 12,
    marginTop: 12,
  },
  subtab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  subtabHeader: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 6,
  },
  textarea: {
    minHeight: 80,
    padding: "8px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: 13,
    resize: "vertical",
  },
  imagesGrid: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 8,
  },
  figure: {
    width: 180,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  image: {
    width: "100%",
    height: 120,
    objectFit: "cover",
    borderRadius: 4,
    border: "1px solid #e5e7eb",
  },
  caption: {
    fontSize: 12,
    color: "#374151",
  },
};
