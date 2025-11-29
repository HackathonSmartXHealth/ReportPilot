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
  // second optional param is the list of image srcs selected to include in the report
  onCreateReport: (procedure: Procedure, selectedImages?: string[]) => void;
}

export const ProceduresList = ({ procedures, onDelete, onCreateReport }: ProceduresListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [qcMap, setQcMap] = useState<Record<string, Array<'good' | 'warn' | 'bad'>>>({});
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean[]>>({});

  // initialize selectedMap from localStorage so selections persist when navigating back
  // This runs once on component mount.
  useState(() => {
    try {
      const map: Record<string, boolean[]> = {};
      procedures.forEach((proc) => {
        const key = `selectedImages_${proc.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const arr = JSON.parse(stored) as string[];
            if (Array.isArray(arr)) {
              // convert to boolean flags corresponding to proc.images
              const flags = (proc.images || []).map((img) => arr.includes(img));
              map[proc.id] = flags;
            }
          } catch {}
        }
      });
      if (Object.keys(map).length) setSelectedMap((s) => ({ ...s, ...map }));
    } catch (err) {
      // ignore
    }
    return null;
  });

  // Persist the selected image srcs for a procedure to localStorage only.
  // We intentionally DO NOT trigger a download here. To write into the repository's
  // asset folder you'll need to run a local Node script (scripts/saveSelectionToAssets.js)
  // which can copy a local selection file into src/assets.
  const saveSelectedToStorage = (procedureId: string, selectedFlags: boolean[], images: string[]) => {
    try {
      const selectedSrcs = images.filter((_, i) => selectedFlags[i]);
      localStorage.setItem(`selectedImages_${procedureId}`, JSON.stringify(selectedSrcs));
    } catch (err) {
      console.warn('Could not save selected images to storage', err);
    }
  };

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
                  // compute selected images for this procedure (default: include all)
                  const selectedFlags = selectedMap[procedure.id] || procedure.images?.map(() => true) || [];
                  const selectedImages = (procedure.images || []).filter((src, i) => selectedFlags[i]);
                  onCreateReport(procedure, selectedImages);
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
                      </div>

                      {/* Always show expanded responsive grid by default */}
                      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                        {procedure.images.map((img, idx) => {
                          const status = qcMap[procedure.id]?.[idx];
                          const hasQc = (qcMap[procedure.id] || []).length > 0;
                          const color = status === 'good' ? '#16a34a' : status === 'warn' ? '#f59e0b' : status === 'bad' ? '#dc2626' : 'var(--border)';
                          const borderWidth = hasQc && status ? 4 : status ? 2 : 1;
                          // selection state: default true (included) unless QC ran, then default to status==='good'
                          const selectedList = selectedMap[procedure.id];
                          const selectedDefault = hasQc ? (status === 'good') : true;
                          const selected = selectedList ? !!selectedList[idx] : selectedDefault;
                          const dimmed = !selected;

                          const toggleSelect = (e: any) => {
                            e.stopPropagation();
                            setSelectedMap((s) => {
                              const cur = s[procedure.id] ? [...s[procedure.id]] : procedure.images.map(() => true);
                              cur[idx] = !cur[idx];
                              // persist updated selection immediately
                              try {
                                saveSelectedToStorage(procedure.id, cur, procedure.images || []);
                              } catch {}
                              return { ...s, [procedure.id]: cur };
                            });
                          };

                          return (
                            <div key={idx} className="flex flex-col items-center" style={{ textAlign: 'center' }}>
                              <div
                                onClick={toggleSelect}
                                role="button"
                                aria-pressed={selected}
                                title={selected ? 'Included in report - click to exclude' : 'Excluded from report - click to include'}
                                style={{
                                  border: `${borderWidth}px solid ${color}`,
                                  borderRadius: 8,
                                  overflow: 'hidden',
                                  width: '100%'
                                }}
                              >
                                <img
                                  src={img}
                                  alt={`Procedure ${idx + 1}`}
                                  style={{
                                    display: 'block',
                                    width: '100%',
                                    height: 110,
                                    objectFit: 'cover',
                                    filter: dimmed ? 'grayscale(100%) brightness(0.6)' : undefined,
                                    opacity: dimmed ? 0.6 : 1,
                                    cursor: 'pointer'
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 mr-2" onClick={(e) => { e.stopPropagation();
                      // Deterministic QC: pick exactly 5 images (or fewer if not available) to mark as 'good'.
                      // The selection is deterministic per procedure.id using a simple hash so the same images
                      // are chosen each time QC runs for the same procedure.
                      const imgs = procedure.images || [];
                      const n = imgs.length;
                      const want = Math.min(5, n);

                      // simple hash from procedure.id -> number
                      let hash = 0;
                      for (let i = 0; i < (procedure.id || '').length; i++) {
                        hash = (hash * 31 + (procedure.id || '').charCodeAt(i)) >>> 0;
                      }

                      const selectedIndices = new Set<number>();
                      let k = 0;
                      // step uses a small prime to distribute picks
                      const step = 7;
                      while (selectedIndices.size < want && n > 0 && k < n * 2) {
                        const idx = (hash + k * step) % n;
                        selectedIndices.add(idx);
                        k++;
                      }

                      const statuses: Array<'good'|'warn'|'bad'> = imgs.map((_, i) => (selectedIndices.has(i) ? 'good' : 'warn'));
                      setQcMap((s) => ({ ...s, [procedure.id]: statuses }));
                      // initialize selection: include only 'good' images by default after QC
                      const selected = statuses.map((st) => st === 'good');
                      setSelectedMap((s) => ({ ...s, [procedure.id]: selected }));
                      // persist to localStorage (no download)
                      try {
                        saveSelectedToStorage(procedure.id, selected, procedure.images || []);
                      } catch {}
                    }} onMouseDown={(e)=>e.stopPropagation()}>
                    Quality control
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
