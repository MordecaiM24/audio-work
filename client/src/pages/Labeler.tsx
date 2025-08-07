import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchDiarization, saveDiarization } from "../api";
import type { DiarizationSegment } from "../types";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Labeler() {
  const { collectionName, videoTitle } = useParams<{
    collectionName: string;
    videoTitle: string;
  }>();
  const [segments, setSegments] = useState<DiarizationSegment[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!collectionName || !videoTitle) return;
      try {
        const data = await fetchDiarization(collectionName, videoTitle);
        setSegments(data.segments);
        const map: Record<string, string> = {};
        data.segments.forEach((s) => {
          map[s.speaker] = s.label || s.speaker;
        });
        setLabels(map);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load diarization"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [collectionName, videoTitle]);

  const handleLabelChange = (speaker: string, value: string) => {
    setLabels((prev) => ({ ...prev, [speaker]: value }));
    setSegments((prev) =>
      prev.map((s) =>
        s.speaker === speaker ? { ...s, label: value } : s
      )
    );
  };

  const handleSave = async () => {
    if (!collectionName || !videoTitle) return;
    try {
      setSaving(true);
      await saveDiarization(collectionName, videoTitle, { segments });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }
  if (error) {
    return <div className="p-8 text-destructive">{error}</div>;
  }

  const speakers = Object.keys(labels);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">{videoTitle}</h1>
      <div className="space-y-2">
        {speakers.map((sp) => (
          <div key={sp} className="flex items-center gap-2">
            <span className="w-24 text-sm">{sp}</span>
            <Input
              value={labels[sp]}
              onChange={(e) => handleLabelChange(sp, e.target.value)}
            />
          </div>
        ))}
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
      <table className="w-full text-sm border mt-4">
        <thead>
          <tr className="bg-muted">
            <th className="p-2 text-left">Start</th>
            <th className="p-2 text-left">End</th>
            <th className="p-2 text-left">Speaker</th>
            <th className="p-2 text-left">Label</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2">{seg.start.toFixed(2)}</td>
              <td className="p-2">{seg.end.toFixed(2)}</td>
              <td className="p-2">{seg.speaker}</td>
              <td className="p-2">{seg.label || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
