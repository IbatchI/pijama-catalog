"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import type { Product } from "@/types";

interface ImagePreviewDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export function ImagePreviewDialog({
  product,
  open,
  onClose,
}: ImagePreviewDialogProps) {
  const isOpen = open && product !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
      {product ? (
        <DialogContent
          showCloseButton={false}
          overlayClassName="bg-foreground/80 supports-backdrop-filter:backdrop-blur-sm"
          className="top-0 left-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 items-center justify-center rounded-none bg-transparent p-4 ring-0 sm:max-w-none"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">
            Foto ampliada de {product.name}
          </DialogTitle>
          <DialogClose
            render={
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4"
                aria-label="Cerrar vista ampliada"
              />
            }
          >
            <XIcon />
          </DialogClose>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imagePath}
            alt={product.name}
            className="max-h-[90svh] max-w-[90vw] object-contain"
          />
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
