import * as React from "react";

import { Button, type ButtonProps } from "~/components/ui/button";
import { cn } from "~/lib/utils";

/**
 * Estilo único de botón para toda la app: fondo gris y texto blanco, igual que
 * el botón de la landing page. Centraliza el look para mantener consistencia.
 */
const APP_BUTTON_CLASS =
  "border border-elevated bg-control text-white transition-colors hover:bg-elevated";

export type AppButtonProps = Omit<ButtonProps, "variant">;

/**
 * Botón estándar de la aplicación. Usa este componente en lugar de `Button`
 * directamente para que todos los botones compartan el mismo aspecto.
 */
export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} className={cn(APP_BUTTON_CLASS, className)} {...props} />
  ),
);
AppButton.displayName = "AppButton";
