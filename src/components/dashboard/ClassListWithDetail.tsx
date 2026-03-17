"use client";

import { useState } from "react";
import type { Class } from "@/types/database";
import { ClassCard } from "@/components/dashboard/ClassCard";
import { ClassDetailModal } from "@/components/dashboard/ClassDetailModal";

type ClassListWithDetailProps = {
  classes: Class[];
};

export function ClassListWithDetail({ classes }: ClassListWithDetailProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => (
          <ClassCard
            key={c.id}
            classItem={c}
            onClick={() => setSelectedClassId(c.id)}
          />
        ))}
      </div>
      {selectedClassId != null && (
        <ClassDetailModal
          classId={selectedClassId}
          classes={classes}
          onClose={() => setSelectedClassId(null)}
        />
      )}
    </>
  );
}
