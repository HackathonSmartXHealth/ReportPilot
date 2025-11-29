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
  const [referringPhysician, setReferringPhysician] = useState("");

  // other fields
  const [indications, setIndications] = useState("");
  const [medications, setMedications] = useState("");
  const [complications, setComplications] = useState("");
  const [extentOfExam, setExtentOfExam] = useState("");

  const [description, setDescription] = useState("");
  const [findings, setFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [imageNotes, setImageNotes] = useState<string[]>([]);

  const [images, setImages] = useState<Array<{ src: string; caption?: string }>>(
    []
  );

  useEffect(() => {
    if (procedure) {
      setPatientName(procedure.patientName || "");
      setPatientId(procedure.patientId || "");
      if (procedure.date) setProcedureDateTime(new Date(procedure.date).toLocaleString());
  setPhysician(procedure.surgeon || "");
  setReferringPhysician((procedure as any).referringPhysician || procedure.referringPhysician || "");
  setExamType(procedure.procedureType || "");
  setExtentOfExam((procedure as any).extent || (procedure as any).extentOfExam || procedure.extentOfExam || "Cecum");
  setFindings(procedure.findings || "");
  setComplications(procedure.complications || "");
  // map additional textual fields from Procedure
  setDescription((procedure as any).description || procedure.description || "");
  setDiagnosis((procedure as any).diagnosis || procedure.diagnosis || "");
  setRecommendations((procedure as any).recommendations || procedure.recommendations || "");
  setMedications((procedure as any).medications || procedure.medications || "");
  setIndications((procedure as any).indication || procedure.indication || "");
  setAge((procedure as any).age || procedure.age || "");
  setGender((procedure as any).sex || procedure.sex || "");
      // If the navigation provided selectedImages, use those; otherwise try persisted selection in localStorage,
      // otherwise fallback to procedure.images. Use the persisted QC selection as-is (no extra image).
      const state = (location as any).state as any;
      const selectedImages = state?.selectedImages as string[] | undefined;

      if (selectedImages && selectedImages.length) {
        setImages(selectedImages.map((src) => ({ src })) as any);
        return;
      }

      // fallback: try reading persisted selections from localStorage (saved by ProceduresList)
      try {
        const storageKey = `selectedImages_${procedure.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          if (Array.isArray(parsed) && parsed.length) {
            setImages(parsed.map((src) => ({ src })) as any);
            return;
          }
        }
      } catch (err) {
        // ignore parse errors and fall back to procedure.images
      }

      if (procedure.images && procedure.images.length) {
        setImages(procedure.images.map((src) => ({ src })) as any);
      }
    }
  }, [procedure]);

  // initialize per-image notes array whenever images change (keep existing notes where possible)
  useEffect(() => {
    const count = 6;
    setImageNotes((prev) => {
      const next = Array.from({ length: count }).map((_, i) => (prev && prev[i]) ? prev[i] : '');
      return next;
    });
  }, [images]);

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
        <div style={{ textAlign: "left", marginBottom: 8 }}>
          <img src="/report_header.png" alt="report header" style={{ width: "100%", maxWidth: 760 }} />
        </div>

        <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, margin: "12px 0" }}>Colonoscopy Procedure Report</h2>

        <div style={styles.detailTable}>
          <div style={styles.tableLeft}>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>ID number:</strong></div><div style={styles.tableValue}>{patientId || ""}</div></div>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>Patient Name:</strong></div><div style={styles.tableValue}>{patientName || ""}</div></div>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>Record Number:</strong></div><div style={styles.tableValue}>{patientId || ""}</div></div>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>Date of Birth:</strong></div><div style={styles.tableValue}>{dob || ""}</div></div>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>Sex:</strong></div><div style={styles.tableValue}>{gender || ""}</div></div>
          </div>
          <div style={styles.tableRight}>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>Date/Time:</strong></div><div style={styles.tableValue}>{procedureDateTime || ""}</div></div>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>Patient Type:</strong></div><div style={styles.tableValue}>Outpatient</div></div>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>Physician:</strong></div><div style={styles.tableValue}>{physician || ""}</div></div>
            <div style={styles.tableRow}><div style={styles.tableLabel}><strong>Referring Physician:</strong></div><div style={styles.tableValue}>{referringPhysician || ""}</div></div>
          </div>
        </div>

        <h3 style={styles.sectionHeader}>A. Procedure Information</h3>
        <div style={{ marginBottom: 8 }}><strong>Procedure Performed:</strong> {examType || "Colonoscopy"}</div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 700 }}>Indication for Examination:</div>
          <div style={{ marginBottom: 6 }}>{indications || ""}</div>
          <div style={{ fontWeight: 700 }}>Medications:</div>
          <textarea style={styles.textareaSmall} value={medications} onChange={(e) => setMedications(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700 }}>Extent of Exam:</div>
          <input style={{ ...styles.input, marginTop: 6 }} value={extentOfExam} onChange={(e) => setExtentOfExam(e.target.value)} />
        </div>

        <h3 style={styles.sectionHeader}>Description of Procedure</h3>
        <textarea style={styles.textareaXL} value={description} onChange={(e) => setDescription(e.target.value)} />

        <h3 style={styles.sectionHeader}>Findings</h3>
        <textarea style={styles.textareaXL} value={findings} onChange={(e) => setFindings(e.target.value)} />

        <div style={{ marginTop: 12 }}>
          {/* colon image above the image grid */}
          <div style={{ marginBottom: 8 }}>
            <img src="/colon.png" alt="colon" style={{ width: 120 }} />
          </div>

          {/* 3x2 grid where each slot shows an image and its own note underneath */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, slot) => {
              const img = images && images[slot];
              const isPlaceholder = !img;
              return (
                <div key={slot} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ width: '100%', overflow: 'hidden', borderRadius: 6, border: isPlaceholder ? '1px dashed #e5e7eb' : '1px solid #e5e7eb', position: 'relative', height: 120, background: '#fff' }}>
                    {/* numbered badge top-left */}
                    <div style={{ position: 'absolute', top: 6, left: 6, zIndex: 10, background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', padding: '2px 6px', borderRadius: 6, fontSize: 12, fontWeight: 700, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>{slot + 1}</div>
                    {img ? (
                      <img src={img.src} alt={`img-${slot}`} style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', display: 'block', background: '#fff' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>no image</div>
                    )}
                  </div>

                  <textarea
                    value={imageNotes[slot] || ''}
                    onChange={(e) => setImageNotes((prev) => {
                      const copy = [...(prev || [])];
                      while (copy.length < 6) copy.push('');
                      copy[slot] = e.target.value;
                      return copy;
                    })}
                    style={{ width: '100%', minHeight: 64, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', resize: 'vertical', fontSize: 13 }}
                    placeholder={`Notes for image ${slot + 1}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <h3 style={styles.sectionHeader}>Diagnosis</h3>
        <textarea style={styles.textareaXL} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />

        <h3 style={styles.sectionHeader}>Recommendations</h3>
        <textarea style={styles.textareaXL} value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />

        <h3 style={styles.sectionHeader}>Complications</h3>
        <textarea style={styles.textareaLarge} value={complications} onChange={(e) => setComplications(e.target.value)} />

        <h3 style={{ ...styles.sectionHeader, marginTop: 18 }}>Limitations</h3>
        <div>No limitations</div>

        <h3 style={{ ...styles.sectionHeader, marginTop: 18 }}>ICD-10 coding</h3>
        <div style={{ fontSize: 13 }}>1-650.1 Diagnostische Endoskopie des unteren Verdauungstraktes. Total, bis Zäkum</div>

        <h3 style={{ ...styles.sectionHeader, marginTop: 18 }}>Quality of Care Indicators</h3>
        <div style={{ fontSize: 13, marginBottom: 6 }}>
          <div><strong>Polyp Details:</strong></div>
          <div>* Polyp(s) Detected: Yes</div>
          <div>* Polypectomy Performed: Yes</div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ borderTop: '1px solid #ddd', marginTop: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'flex-end' }}>
            <div style={{ width: '48%', textAlign: 'left' }}>
              <div style={{ height: 48 }} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>Signature</div>
              <div style={{ fontSize: 12, color: '#555' }}>{physician || ''}</div>
            </div>
            <div style={{ width: '48%', textAlign: 'right' }}>
              <div style={{ height: 48 }} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>Date</div>
              <div style={{ fontSize: 12, color: '#555' }}>{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <footer style={{ marginTop: 24, fontSize: 12, color: "#666" }}>
          <div>Report generated by ReportPilot Medical Documentation System</div>
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
  logoImage: {
    width: 140,
    height: 60,
    objectFit: "contain",
  },
  sectionRow: {
    display: "flex",
    gap: 20,
  },
  infoColumn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    alignItems: "start",
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 4,
  },
  readonly: {
    fontSize: 14,
    color: "#111",
    padding: "4px 0",
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
    width: "100%",
  },
  textareaLarge: {
    minHeight: 80,
    padding: "8px 10px",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: 13,
    resize: "vertical",
    width: "100%",
  },
  textareaSmall: {
    minHeight: 48,
    padding: "6px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: 13,
    resize: "vertical",
    width: "100%",
  },
  textareaXL: {
    minHeight: 160,
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: 4,
    fontSize: 14,
    resize: "vertical",
    width: "100%",
  },
  detailTable: {
    display: "flex",
    gap: 20,
    marginBottom: 12,
  },
  tableLeft: {
    flex: 1,
  },
  tableRight: {
    flex: 1,
  },
  tableRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "2px 0",
  },
  tableLabel: {
    color: "#111827",
    fontWeight: 700,
  },
  tableValue: {
    color: "#111",
    textAlign: "right",
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
    width: "100%",
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
