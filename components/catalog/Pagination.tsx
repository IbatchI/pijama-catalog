"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex items-center justify-center gap-4"
      aria-label="Paginación del catálogo"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        aria-label="Página anterior"
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft data-icon="inline-start" />
        Anterior
      </Button>
      <span className="text-sm text-muted-foreground" aria-live="polite">
        Página <strong className="text-foreground">{currentPage}</strong> de{" "}
        {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        aria-label="Página siguiente"
        onClick={() => onPageChange(currentPage + 1)}
      >
        Siguiente
        <ChevronRight data-icon="inline-end" />
      </Button>
    </nav>
  );
}
