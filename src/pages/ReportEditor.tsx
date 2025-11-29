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

  // refs to the per-image note textareas so we can auto-resize them when content changes
  const noteRefs = useRef<Array<HTMLTextAreaElement | null>>([]);

  const handleNoteChange = (slot: number, e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setImageNotes((prev) => {
      const copy = [...(prev || [])];
      while (copy.length < 6) copy.push('');
      copy[slot] = value;
      return copy;
    });
    // adjust height for this textarea immediately
    try {
      const ta = e.target as HTMLTextAreaElement;
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    } catch (err) {}
  };

  // ensure textareas resize appropriately when notes or images change (e.g., after TTS/AI fill)
  useEffect(() => {
    for (let i = 0; i < 6; i++) {
      const ta = noteRefs.current[i];
      if (!ta) continue;
      try {
        ta.style.height = 'auto';
        ta.style.height = ta.scrollHeight + 'px';
      } catch (err) {}
    }
  }, [imageNotes, images]);

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
      // If the navigation provided selectedImages, use those. If not, try reading a persisted
      // selection from localStorage (saved by ProceduresList). We only load from storage when
      // there is a non-empty persisted selection to avoid auto-filling when no selection exists.
      const state = (location as any).state as any;
      const selectedImages = state?.selectedImages as string[] | undefined;
      if (selectedImages && Array.isArray(selectedImages) && selectedImages.length > 0) {
        setImages(selectedImages.map((src) => ({ src })) as any);
        return;
      }

      // fallback: try reading persisted selections from localStorage (saved by ProceduresList)
      try {
        const storageKey = `selectedImages_${procedure.id}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as string[];
          // only accept a persisted selection if it's a non-empty array and its entries are
          // actual images for this procedure (defensive check)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.every((p) => (procedure.images || []).includes(p));
            if (valid) {
              setImages(parsed.map((src) => ({ src })) as any);
              return;
            }
          }
        }
      } catch (err) {
        // ignore parse errors
      }

      // otherwise leave images empty (no images selected)
      setImages([]);
    }
  }, [procedure]);

  // initialize per-image notes array whenever images change (keep existing notes where possible)
  // Prefer notes attached to the procedure (loaded from JSON at insertion time) when available.
  useEffect(() => {
    // initialize notes to empty strings for selected images; do NOT prefill from JSON here.
    const count = 6;
    setImageNotes(() => {
      const next = Array.from({ length: count }).map((_, i) => {
        // if an image is present for this slot, leave its note blank; otherwise blank too
        return '';
      });
      return next;
    });
  }, [images]);

  // Helper: generate a short 1-3 word label for an image (heuristic)
  const generateShortLabel = (src?: string, idx?: number) => {
    if (!src) return '';
    const s = src.toString().toLowerCase();
    if (s.includes('polyp') || s.includes('polypect')) return 'Polyp';
    if (s.includes('divert') || s.includes('meckel')) return 'Diverticulum';
    if (s.includes('bleed') || s.includes('blood')) return 'Bleeding';
    if (s.includes('clip')) return 'Clip';
    if (s.includes('nbi')) return 'NBI view';
    if (s.includes('wl') || s.includes('white')) return 'White-light view';
    if (s.includes('img')) return 'Overview';
    const fallbacks = ['Mucosa', 'Lesion', 'Instrument', 'Polyp'];
    return fallbacks[((idx || 1) - 1) % fallbacks.length];
  };

  // Helper: generate a fitting descriptive sentence for an image
  const generateFittingDescription = (src?: string, idx?: number, label?: string) => {
    const short = label || generateShortLabel(src, idx);
    if (!short) return '';
    const base = short.toLowerCase();
    return `${short}. Representative endoscopic image showing ${base}.`;
  };

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
          {/* colon image and action buttons above the image grid */}
          <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <img src="/colon.png" alt="colon" style={{ width: 120 }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  // TTS-like auto-fill: prefer descriptions from the procedure's imageNotes map (if present).
                  // imageNotes in the procedure is a mapping of filename (or key) -> description.
                  setImageNotes((prev) => {
                    const next = Array.from({ length: 6 }).map((_, i) => (prev && prev[i]) ? prev[i] : '');
                    for (let i = 0; i < 6; i++) {
                      const img = images && images[i];
                      if (!img) continue; // only fill descriptions for actual images

                      // attempt to look up a description from procedure.imageNotes (mapping)
                      let found = '';
                      try {
                        const map = (procedure as any)?.imageNotes as Record<string, string> | undefined;
                        if (map) {
                          const src = img.src || '';
                          const parts = src.split('/');
                          const basename = parts.pop() || src;
                          const nameNoExt = basename.split('.')?.[0] || basename;
                          // try multiple key formats (exact basename, lowercase, without extension)
                          const tries = [basename, basename.toLowerCase(), nameNoExt, nameNoExt.toLowerCase()];
                          for (const k of tries) {
                            if (map[k]) {
                              found = map[k];
                              break;
                            }
                          }
                          // final attempt: any key that is contained in the src string
                          if (!found) {
                            for (const key of Object.keys(map)) {
                              if (!key) continue;
                              if (src.toLowerCase().includes(key.toLowerCase())) {
                                found = map[key];
                                break;
                              }
                            }
                          }
                        }
                      } catch (e) {
                        // ignore
                      }

                      if (found) {
                        next[i] = found;
                        continue;
                      }

                      // fallback to heuristic generation
                      const label = generateShortLabel(img?.src, i + 1);
                      next[i] = generateFittingDescription(img?.src, i + 1, label);
                    }
                    return next;
                  });
                }}
                title="Auto-generate descriptions"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 16px', minWidth: 140, justifyContent: 'center', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}
              >
                <img src="/tts.png" alt="tts" style={{ width: 20, height: 20 }} />
              </button>

              <button
                onClick={() => {
                  // AI image annotator: prepend a short 1-3 word classification to each selected image note
                  setImageNotes((prev) => {
                    const next = Array.from({ length: 6 }).map((_, i) => (prev && prev[i]) ? prev[i] : '');
                    for (let i = 0; i < 6; i++) {
                      const img = images && images[i];
                      if (!img) continue; // only annotate actual images
                      const label = generateShortLabel(img?.src, i + 1);
                      if (!label) continue;
                      const existing = next[i] || '';
                      // avoid duplicate prepends
                      if (existing.toLowerCase().startsWith(label.toLowerCase())) continue;
                      next[i] = `${label}${existing ? ': ' + existing : ''}`;
                    }
                    return next;
                  });
                }}
                title="AI image annotator"
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f3f4f6', cursor: 'pointer', fontSize: 13 }}
              >
                AI image annotator
              </button>
            </div>
          </div>

          {/* 3x2 grid where each rendered slot shows an image and its own note underneath.
              We only render slots that have either an image or a non-empty note. */}
          {(() => {
            const slots = Array.from({ length: 6 }).map((_, i) => i);
            const visible = slots.filter((slot) => {
              const img = images && images[slot];
              const note = (imageNotes && imageNotes[slot]) || '';
              return !!img || (note && note.trim().length > 0);
            });

            if (visible.length === 0) {
              return <div style={{ color: '#6b7280' }}>No images or notes to display.</div>;
            }

            const cols = Math.min(3, visible.length) || 1;
            return (
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
                {visible.map((slot) => {
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
                        ref={(el) => (noteRefs.current[slot] = el)}
                        value={imageNotes[slot] || ''}
                        onChange={(e) => handleNoteChange(slot, e)}
                        onInput={(e) => {
                          const ta = e.currentTarget as HTMLTextAreaElement;
                          ta.style.height = 'auto';
                          ta.style.height = ta.scrollHeight + 'px';
                        }}
                        style={{ width: '100%', minHeight: 40, padding: 8, borderRadius: 6, border: '1px solid #e5e7eb', resize: 'none', overflow: 'hidden', fontSize: 13 }}
                        placeholder={`Notes for image ${slot + 1}`}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
