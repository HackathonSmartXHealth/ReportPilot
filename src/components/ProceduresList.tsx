import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Trash2, Calendar, User, Clock, FileText, FileDown, ChevronRight } from "lucide-react";
import { Procedure } from "@/pages/Index";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProceduresListProps {
  procedures: Procedure[];
  onDelete: (id: string) => void;
  onCreateReport: (procedure: Procedure) => void;
}

export const ProceduresList = ({ procedures, onDelete, onCreateReport }: ProceduresListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProcedures = procedures.filter(
    (proc) =>
      proc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proc.procedureType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by patient name, ID, or procedure type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredProcedures.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No procedures found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProcedures.map((procedure) => (
            <Card key={procedure.id} className="p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {procedure.patientName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{procedure.patientId}</p>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 border-primary/20">
                      {procedure.procedureType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(procedure.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{procedure.surgeon}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{procedure.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Findings:</p>
                      <p className="text-sm text-muted-foreground">{procedure.findings}</p>
                    </div>
                    {procedure.complications && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-1">Complications:</p>
                        <p className="text-sm text-destructive">{procedure.complications}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Anesthesia: {procedure.anesthesia}</span>
                    </div>
                  </div>

                  {procedure.images && procedure.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-foreground mb-2">Procedure Images:</p>
                      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                        <div className="flex w-max space-x-4 p-4">
                          {procedure.images.map((img, idx) => (
                            <div key={idx} className="relative shrink-0">
                              <img 
                                src={img} 
                                alt={`Procedure ${idx + 1}`} 
                                className="h-24 w-32 object-cover rounded border border-border"
                              />
                            </div>
                          ))}
                          {procedure.images.length > 4 && (
                            <div className="flex items-center justify-center h-24 w-20 shrink-0 text-muted-foreground">
                              <ChevronRight className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <ScrollBar orientation="horizontal" />
                      </ScrollArea>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onCreateReport(procedure)}
                    className="gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Create Report
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Procedure</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this procedure record? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(procedure.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
