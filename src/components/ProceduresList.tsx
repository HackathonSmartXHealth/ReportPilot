import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, Trash2, Calendar, User, Clock, FileText, ChevronRight } from "lucide-react";
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
  const [qcMap, setQcMap] = useState<Record<string, Array<'good' | 'warn' | 'bad'>>>({});
  const [showAllMap, setShowAllMap] = useState<Record<string, boolean>>({});

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
            <Card 
              key={procedure.id} 
              className="p-4 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 relative group"
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest('button')) {
                  onCreateReport(procedure);
                }
              }}
            >
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
                      {/* make the images area responsive and horizontally scrollable to avoid page overflow */}
                      <div className="w-full overflow-x-auto">
                      {/* header with title and QC controls */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-foreground">Procedure Images:</p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={(e) => { e.stopPropagation();
                              const imgs = procedure.images || [];
                              const statuses: Array<'good'|'warn'|'bad'> = imgs.map(() => {
                                const r = Math.random();
                                if (r < 0.5) return 'good';
                                if (r < 0.8) return 'warn';
                                return 'bad';
                              });
                              setQcMap((s) => ({ ...s, [procedure.id]: statuses }));
                            }} onMouseDown={(e)=>e.stopPropagation()}>
                            Quality control
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowAllMap((s) => ({ ...s, [procedure.id]: !s[procedure.id] })); }}>
                            {showAllMap[procedure.id] ? 'Collapse' : 'Show all'}
                          </Button>
                        </div>
                      </div>

                      {/* If collapsed show horizontal scroll (max per row view), if expanded show grid with up to 7 cols */}
                      {showAllMap[procedure.id] ? (
                        /* expanded: render as horizontal grid (columns) that scrolls horizontally */
                        <div className="inline-grid" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(140px, 140px)', gap: 12 }}>
                          {procedure.images.map((img, idx) => {
                            const status = qcMap[procedure.id]?.[idx];
                            const hasQc = (qcMap[procedure.id] || []).length > 0;
                            const color = status === 'good' ? '#16a34a' : status === 'warn' ? '#f59e0b' : status === 'bad' ? '#dc2626' : 'var(--border)';
                            const borderWidth = hasQc && status ? 4 : status ? 2 : 1;
                            return (
                              <div key={idx} className="" style={{ textAlign: 'center' }}>
                                <img src={img} alt={`Procedure ${idx + 1}`} style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 6, border: `${borderWidth}px solid ${color}` }} />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                          <div className="flex w-max space-x-4 p-4" style={{ maxWidth: '100%', boxSizing: 'border-box' }}>
                            {procedure.images.map((img, idx) => {
                              const status = qcMap[procedure.id]?.[idx];
                              const hasQc = (qcMap[procedure.id] || []).length > 0;
                              const color = status === 'good' ? '#16a34a' : status === 'warn' ? '#f59e0b' : status === 'bad' ? '#dc2626' : 'var(--border)';
                              const borderWidth = hasQc && status ? 4 : status ? 2 : 1;
                              return (
                                <div key={idx} className="relative shrink-0">
                                  <img 
                                    src={img} 
                                    alt={`Procedure ${idx + 1}`} 
                                    className="object-cover rounded"
                                    style={{ height: 110, width: 140, border: `${borderWidth}px solid ${color}` }}
                                  />
                                </div>
                              );
                            })}
                            {procedure.images.length > 7 && (
                              <div className="flex items-center justify-center h-24 w-20 shrink-0 text-muted-foreground">
                                <ChevronRight className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation();
                      // toggle QC: run random QC for this procedure
                      const imgs = procedure.images || [];
                      const statuses: Array<'good'|'warn'|'bad'> = imgs.map(() => {
                        const r = Math.random();
                        if (r < 0.5) return 'good';
                        if (r < 0.8) return 'warn';
                        return 'bad';
                      });
                      setQcMap((s) => ({ ...s, [procedure.id]: statuses }));
                    }} className="mr-2" onMouseDown={(e)=>e.stopPropagation()}>
                    Quality control
                  </Button>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowAllMap((s) => ({ ...s, [procedure.id]: !s[procedure.id] })); }} className="mr-2">
                    {showAllMap[procedure.id] ? 'Collapse' : 'Show all'}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
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
