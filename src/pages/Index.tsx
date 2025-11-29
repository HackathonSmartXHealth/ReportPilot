import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Calendar, Activity } from "lucide-react";
import { ProcedureForm } from "@/components/ProcedureForm";
import { ProceduresList } from "@/components/ProceduresList";
import { StatsCard } from "@/components/StatsCard";
import WL from "@/assets/WL.png";
import WL2 from "@/assets/WL2.png";
import WL3 from "@/assets/WL3.png";
import WL4 from "@/assets/WL4.png";
import IMG1 from "@/assets/IMG1.jpg";
import IMG2 from "@/assets/IMG2.jpg";
import IMG3 from "@/assets/IMG3.jpg";
import imageNotes2 from "@/assets/image_notes_2.json";
import WL50 from "@/assets/WL_50.png";
import WL51 from "@/assets/WL_51.png";
import WL52 from "@/assets/WL_52.png";
import WL53 from "@/assets/WL_53.png";
import WL54 from "@/assets/WL_54.png";
import WL55 from "@/assets/WL_55.png";
import WL56 from "@/assets/WL_56.png";
import WL57 from "@/assets/WL_57.png";
import WL58 from "@/assets/WL_58.png";
import WL59 from "@/assets/WL_59.png";
import WL60 from "@/assets/WL_60.png";
import WL61 from "@/assets/WL_61.png";
import WL62 from "@/assets/WL_62.png";
import WL63 from "@/assets/WL_63.png";
import WL64 from "@/assets/WL_64.png";
import WL65 from "@/assets/WL_65.png";
import WL66 from "@/assets/WL_66.png";
import WL67 from "@/assets/WL_67.png";
import WL68 from "@/assets/WL_68.png";
import WL69 from "@/assets/WL_69.png";

export interface Procedure {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  procedureType: string;
  surgeon: string;
  age?: string;
  sex?: string;
  referringPhysician?: string;
  medications?: string;
  indication?: string;
  extentOfExam?: string;
  diagnosis?: string;
  recommendations?: string;
  description?: string;
  findings: string;
  complications?: string;
  duration: string;
  anesthesia: string;
  imageNotes?: Record<string, string>;
  images?: string[];
}

const Index = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [procedures, setProcedures] = useState<Procedure[]>([
    {
      id: "1",
      patientName: "John Doe",
      patientId: "P-2024-001",
      date: "2024-01-15",
      procedureType: "Diagnostic Gastroscopy",
      surgeon: "Dr. Holota",
      referringPhysician: "Dr. Kalantari",
      age: "58",
      sex: "Male",
      medications: "5 mg Midazolam",
      indication: "Dyspepsia",
      extentOfExam: "Esophagus, Stomach, Duodenum",
      findings: "Normal gastric mucosa, no significant pathology detected",
  diagnosis: "Non-ulcer dyspepsia / normal endoscopic exam",
  complications: "None",
  recommendations: "No acute intervention required. Recommend lifestyle modification (dietary changes, avoid NSAIDs), trial of proton-pump inhibitor if symptoms persist, and H. pylori testing if clinically indicated.",
  duration: "25 minutes",
  anesthesia: "Conscious Sedation",
      images: [WL, WL2, WL50, WL51, WL52, WL53, WL54, WL60, WL61, WL62, WL63, WL64]
    },
    {
      id: "2",
      patientName: "Jane Smith",
      patientId: "P-2024-002",
      date: "2024-01-16",
      procedureType: "Colonoscopy",
      surgeon: "Dr. Holota",
      referringPhysician: "Dr. Kalantari",
      age: "46",
      sex: "Female",
      medications: "12.5 mg Midazolam; 400 mg Propofol",
      indication: "Abdominal pain, melena, constipation",
      extentOfExam: "Rectum, Colon (sigmoid, descending, transverse, ascendens), terminal Ileum",
  description: "Colonoscopy performed after informed consent. The colonoscope was advanced to the cecum with visualization of the terminal ileum. Bowel preparation was adequate. During withdrawal, careful inspection of the sigmoid colon demonstrated a flat lesion which was resected endoscopically. Attention was then turned to the terminal ileum where a diverticular outpouching with adherent blood clot was identified, suspicious for Meckel diverticulum. Hemostasis was achieved with targeted irrigation and placement of a hemostatic clip over the bleeding point.",
  findings: "A flat polyp identified in the sigmoid colon (~1 x 1 cm) at approximately 30 cm aborally. A diverticulum is identified in the terminal ileum approximately 10 cm from the ileocecal valve with signs of local bleeding; appearance is suggestive of a Meckel diverticulum.",
  diagnosis: "Meckel diverticulum; flat sigmoid polyp (resected)",
  complications: "Peri-procedural bleeding controlled endoscopically",
  duration: "30 minutes",
  anesthesia: "Conscious Sedation",
  recommendations: "Polyp retrieved and sent for histologic analysis. Recommend surgical consultation regarding Meckel diverticulum given ongoing bleeding risk; consider cross-sectional imaging (CT enterography) if bleeding recurs. Initiate iron supplementation and outpatient follow-up in 2 weeks.",
  images: [IMG1, IMG2, IMG3, WL3, WL4, WL55, WL56, WL57, WL58, WL59, WL65, WL66, WL67, WL68, WL69]
  ,
  imageNotes: imageNotes2
    }
  ]);

  const handleAddProcedure = (procedure: Omit<Procedure, "id">) => {
    const newProcedure = {
      ...procedure,
      id: Date.now().toString()
    };
    setProcedures([newProcedure, ...procedures]);
    setShowForm(false);
  };

  const handleDeleteProcedure = (id: string) => {
    setProcedures(procedures.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ReportPilot</h1>
              <p className="text-sm text-muted-foreground">Endoscopic Surgery Documentation</p>
            </div>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Procedure
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Document New Procedure</CardTitle>
              <CardDescription>Enter the details of the endoscopic procedure</CardDescription>
            </CardHeader>
            <CardContent>
              <ProcedureForm 
                onSubmit={handleAddProcedure}
                onCancel={() => setShowForm(false)}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatsCard
                title="Total Procedures"
                value={procedures.length.toString()}
                icon={FileText}
                trend="+12% from last month"
              />
              <StatsCard
                title="This Month"
                value="24"
                icon={Calendar}
                trend="+8% from last month"
              />
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Procedures</CardTitle>
                <CardDescription>View and manage documented procedures</CardDescription>
              </CardHeader>
              <CardContent>
                <ProceduresList 
                  procedures={procedures}
                  onDelete={handleDeleteProcedure}
                  onCreateReport={(procedure, selectedImages) => navigate(`/report/${procedure.id}`, { state: { procedure, selectedImages } })}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
