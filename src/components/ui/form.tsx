"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FormFieldContextValue {
  name: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

export interface FormFieldProps {
  name: string;
  children: (props: { name: string }) => React.ReactNode;
}

const FormField = ({ name, children }: FormFieldProps) => (
  <FormFieldContext.Provider value={{ name }}>
    {children({ name })}
  </FormFieldContext.Provider>
);

export type FormItemProps = React.HTMLAttributes<HTMLDivElement>;

const FormItem = React.forwardRef<HTMLDivElement, FormItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
);
FormItem.displayName = "FormItem";

export type FormLabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
      {...props}
    />
  )
);
FormLabel.displayName = "FormLabel";

export type FormControlProps = React.HTMLAttributes<HTMLDivElement>;

const FormControl = React.forwardRef<HTMLDivElement, FormControlProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
);
FormControl.displayName = "FormControl";

export type FormDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

const FormDescription = React.forwardRef<HTMLParagraphElement, FormDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
);
FormDescription.displayName = "FormDescription";

export type FormMessageProps = React.HTMLAttributes<HTMLParagraphElement>;

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  )
);
FormMessage.displayName = "FormMessage";

export {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};