import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Procedure } from "@/pages/Index";

interface ProcedureFormProps {
  onSubmit: (procedure: Omit<Procedure, "id">) => void;
  onCancel: () => void;
}

export const ProcedureForm = ({ onSubmit, onCancel }: ProcedureFormProps) => {
  const [formData, setFormData] = useState({
    patientName: "",
    patientId: "",
    date: new Date().toISOString().split("T")[0],
    procedureType: "",
    surgeon: "",
    findings: "",
    complications: "",
    duration: "",
    anesthesia: ""
  });
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === files.length) {
            setImages([...images, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, images });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientName">Patient Name</Label>
          <Input
            id="patientName"
            required
            value={formData.patientName}
            onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            placeholder="Enter patient name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientId">Patient ID</Label>
          <Input
            id="patientId"
            required
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            placeholder="P-2024-XXX"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Procedure Date</Label>
          <Input
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="procedureType">Procedure Type</Label>
          <Select
            value={formData.procedureType}
            onValueChange={(value) => setFormData({ ...formData, procedureType: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select procedure type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Diagnostic Gastroscopy">Diagnostic Gastroscopy</SelectItem>
              <SelectItem value="Colonoscopy">Colonoscopy</SelectItem>
              <SelectItem value="ERCP">ERCP</SelectItem>
              <SelectItem value="Bronchoscopy">Bronchoscopy</SelectItem>
              <SelectItem value="Laparoscopy">Laparoscopy</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="surgeon">Surgeon</Label>
          <Input
            id="surgeon"
            required
            value={formData.surgeon}
            onChange={(e) => setFormData({ ...formData, surgeon: e.target.value })}
            placeholder="Dr. Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            required
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="e.g., 25 minutes"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="anesthesia">Anesthesia Type</Label>
          <Select
            value={formData.anesthesia}
            onValueChange={(value) => setFormData({ ...formData, anesthesia: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select anesthesia type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Local Anesthesia">Local Anesthesia</SelectItem>
              <SelectItem value="Conscious Sedation">Conscious Sedation</SelectItem>
              <SelectItem value="General Anesthesia">General Anesthesia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="findings">Findings</Label>
        <Textarea
          id="findings"
          required
          value={formData.findings}
          onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
          placeholder="Describe the findings during the procedure..."
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="complications">Complications (Optional)</Label>
        <Textarea
          id="complications"
          value={formData.complications}
          onChange={(e) => setFormData({ ...formData, complications: e.target.value })}
          placeholder="Note any complications or adverse events..."
          className="min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="images">Procedure Images (Optional)</Label>
        <Input
          id="images"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="cursor-pointer"
        />
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {images.map((img, idx) => (
              <img key={idx} src={img} alt={`Procedure ${idx + 1}`} className="w-20 h-20 object-cover rounded border" />
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Procedure
        </Button>
      </div>
    </form>
  );
};
