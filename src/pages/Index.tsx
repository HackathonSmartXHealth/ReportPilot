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
  findings: string;
  complications?: string;
  duration: string;
  anesthesia: string;
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
      surgeon: "Dr. Smith",
      findings: "Normal gastric mucosa, no significant pathology detected",
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
      surgeon: "Dr. Johnson",
      findings: "Small polyp in descending colon, biopsied for analysis",
      complications: "None",
      duration: "35 minutes",
      anesthesia: "General Anesthesia",
  images: [WL3, WL4, WL55, WL56, WL57, WL58, WL59, WL65, WL66, WL67, WL68, WL69]
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
              <h1 className="text-2xl font-bold text-foreground">EndoDoc</h1>
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
